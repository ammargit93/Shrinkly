import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { CompressionResult, CompressionStage } from '../types/compression';

export interface GifCompressionOptions {
  onStageChange?: (stage: CompressionStage) => void;
  maxIterations?: number;
}

interface CompositeFrame {
  canvas: HTMLCanvasElement;
  delay: number;
  hasAlpha: boolean;
}

/**
 * Deconstructs an animated or static GIF into rendered composite frames.
 */
function buildCompositeFrames(
  rawFrames: ParsedFrame[],
  width: number,
  height: number
): CompositeFrame[] {
  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const ctx = compositeCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  const patchCanvas = document.createElement('canvas');
  const patchCtx = patchCanvas.getContext('2d', { willReadFrequently: true });
  if (!patchCtx) throw new Error('Patch Canvas context unavailable.');

  const results: CompositeFrame[] = [];
  let previousImageData: ImageData | null = null;

  for (let i = 0; i < rawFrames.length; i++) {
    const frame = rawFrames[i];
    const dims = frame.dims;

    // Handle disposal from previous frame
    if (i > 0) {
      const prevFrame = rawFrames[i - 1];
      if (prevFrame.disposalType === 2) {
        // Restore to background (clear previous frame rectangle)
        ctx.clearRect(prevFrame.dims.left, prevFrame.dims.top, prevFrame.dims.width, prevFrame.dims.height);
      } else if (prevFrame.disposalType === 3 && previousImageData) {
        // Restore to previous snapshot
        ctx.putImageData(previousImageData, 0, 0);
      }
    }

    // Save state before drawing if current frame requests restore-to-previous
    if (frame.disposalType === 3) {
      previousImageData = ctx.getImageData(0, 0, width, height);
    }

    // Draw current patch
    if (dims.width > 0 && dims.height > 0) {
      patchCanvas.width = dims.width;
      patchCanvas.height = dims.height;
      const patchData = patchCtx.createImageData(dims.width, dims.height);
      patchData.data.set(frame.patch);
      patchCtx.putImageData(patchData, 0, 0);

      ctx.drawImage(patchCanvas, dims.left, dims.top);
    }

    // Capture the composed frame
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = width;
    frameCanvas.height = height;
    const fCtx = frameCanvas.getContext('2d');
    if (fCtx) {
      fCtx.drawImage(compositeCanvas, 0, 0);
    }

    // Detect if alpha channel exists
    const currentPixels = ctx.getImageData(0, 0, width, height).data;
    let hasAlpha = false;
    for (let p = 3; p < currentPixels.length; p += 4) {
      if (currentPixels[p] < 250) {
        hasAlpha = true;
        break;
      }
    }

    // Standardize frame delay (browsers treat <= 10ms as 100ms)
    let delay = frame.delay;
    if (!delay || delay <= 10) {
      delay = 100;
    }

    results.push({
      canvas: frameCanvas,
      delay,
      hasAlpha,
    });
  }

  return results;
}

/**
 * Encodes composite frames into a binary GIF byte array at the given scale and color depth.
 */
function encodeGif(
  frames: CompositeFrame[],
  origWidth: number,
  origHeight: number,
  scale: number,
  maxColors: number,
  frameStep: number = 1
): { bytes: Uint8Array; width: number; height: number } {
  const scaledWidth = Math.max(16, Math.round(origWidth * scale));
  const scaledHeight = Math.max(16, Math.round(origHeight * scale));

  const scaleCanvas = document.createElement('canvas');
  scaleCanvas.width = scaledWidth;
  scaleCanvas.height = scaledHeight;
  const sCtx = scaleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sCtx) throw new Error('Scale Canvas context unavailable.');

  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'high';

  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i += frameStep) {
    const frame = frames[i];
    sCtx.clearRect(0, 0, scaledWidth, scaledHeight);
    sCtx.drawImage(frame.canvas, 0, 0, scaledWidth, scaledHeight);

    const imgData = sCtx.getImageData(0, 0, scaledWidth, scaledHeight);
    const rgba = imgData.data;

    const format = frame.hasAlpha ? 'rgba4444' : 'rgb565';
    const palette = quantize(rgba, maxColors, {
      format,
      oneBitAlpha: frame.hasAlpha,
      clearAlpha: frame.hasAlpha,
    });

    const index = applyPalette(rgba, palette, format);

    let transparentIndex = 0;
    if (frame.hasAlpha) {
      for (let pIdx = 0; pIdx < palette.length; pIdx++) {
        const col = palette[pIdx];
        if (col.length > 3 && col[3] < 128) {
          transparentIndex = pIdx;
          break;
        }
      }
    }

    // Accumulate delay if frames were skipped
    const totalDelay = frame.delay * frameStep;

    gif.writeFrame(index, scaledWidth, scaledHeight, {
      palette,
      delay: totalDelay,
      transparent: frame.hasAlpha,
      transparentIndex: frame.hasAlpha ? transparentIndex : undefined,
      repeat: 0, // loop indefinitely
    });
  }

  gif.finish();
  return {
    bytes: gif.bytes(),
    width: scaledWidth,
    height: scaledHeight,
  };
}

/**
 * Inspects GIF dimensions and frame count.
 */
export async function getGifInfo(
  file: File
): Promise<{ width: number; height: number; frameCount: number }> {
  const buffer = await file.arrayBuffer();
  const parsed = parseGIF(buffer);
  const rawFrames = decompressFrames(parsed, false);

  const width = parsed.lsd.width || (rawFrames[0]?.dims.width ?? 100);
  const height = parsed.lsd.height || (rawFrames[0]?.dims.height ?? 100);

  return {
    width,
    height,
    frameCount: rawFrames.length,
  };
}

/**
 * Compresses an animated or static GIF to a target size limit in KB.
 */
export async function compressGifToLimit(
  file: File,
  targetSizeKb: number | 'auto',
  options: GifCompressionOptions = {}
): Promise<CompressionResult> {
  // --- Auto Mode: Smart GIF compression retaining 100% resolution and 256-color palette ---
  if (targetSizeKb === 'auto') {
    options.onStageChange?.('decoding');
    const buffer = await file.arrayBuffer();
    const parsed = parseGIF(buffer);
    const rawFrames = decompressFrames(parsed, true);

    if (!rawFrames || rawFrames.length === 0) {
      throw new Error('Unable to decode GIF frames. File might be corrupted.');
    }

    const origWidth = parsed.lsd.width || rawFrames[0].dims.width;
    const origHeight = parsed.lsd.height || rawFrames[0].dims.height;

    options.onStageChange?.('quantizing');
    const compositeFrames = buildCompositeFrames(rawFrames, origWidth, origHeight);

    options.onStageChange?.('optimizing');
    // Full resolution (1.0 scale), all frames preserved, full 256 colors
    const encoded = encodeGif(compositeFrames, origWidth, origHeight, 1.0, 256);

    options.onStageChange?.('finalizing');

    const isSmaller = encoded.bytes.length < file.size;
    const finalBlob = isSmaller
      ? new Blob([encoded.bytes as unknown as BlobPart], { type: 'image/gif' })
      : file;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const compressedName = `${baseName}-compressed.gif`;
    const percentageReduction = Math.max(
      0,
      Math.round(((file.size - finalBlob.size) / file.size) * 100)
    );

    return {
      originalSize: file.size,
      compressedSize: finalBlob.size,
      percentageReduction,
      downloadUrl: URL.createObjectURL(finalBlob),
      blob: finalBlob,
      name: compressedName,
      outputFormat: 'GIF',
      width: origWidth,
      height: origHeight,
    };
  }

  const targetSizeBytes = Math.max(1, targetSizeKb * 1024);

  // 1. If already within limit, return original
  if (file.size <= targetSizeBytes) {
    const gifInfo = await getGifInfo(file).catch(() => ({
      width: undefined,
      height: undefined,
    }));

    return {
      originalSize: file.size,
      compressedSize: file.size,
      percentageReduction: 0,
      downloadUrl: URL.createObjectURL(file),
      blob: file,
      name: file.name,
      outputFormat: 'GIF',
      width: gifInfo.width,
      height: gifInfo.height,
    };
  }

  options.onStageChange?.('decoding');
  const buffer = await file.arrayBuffer();
  const parsed = parseGIF(buffer);
  const rawFrames = decompressFrames(parsed, true);

  if (!rawFrames || rawFrames.length === 0) {
    throw new Error('Unable to decode GIF frames. File might be corrupted.');
  }

  const origWidth = parsed.lsd.width || rawFrames[0].dims.width;
  const origHeight = parsed.lsd.height || rawFrames[0].dims.height;

  options.onStageChange?.('quantizing');
  const compositeFrames = buildCompositeFrames(rawFrames, origWidth, origHeight);

  options.onStageChange?.('optimizing');

  let bestBytes: Uint8Array | null = null;
  let bestWidth = origWidth;
  let bestHeight = origHeight;
  let bestScale = 1.0;

  // Quick check at full resolution
  for (const colors of [256, 128, 64]) {
    const encoded = encodeGif(compositeFrames, origWidth, origHeight, 1.0, colors);
    if (encoded.bytes.length <= targetSizeBytes) {
      bestBytes = encoded.bytes;
      bestWidth = encoded.width;
      bestHeight = encoded.height;
      bestScale = 1.0;
      break;
    }
  }

  // Binary search scale if full resolution is too large
  if (!bestBytes) {
    let lowScale = 0.1;
    let highScale = 0.95;
    const maxIter = options.maxIterations ?? 6;

    for (let iter = 0; iter < maxIter; iter++) {
      const midScale = Number(((lowScale + highScale) / 2).toFixed(3));
      const encoded = encodeGif(compositeFrames, origWidth, origHeight, midScale, 128);

      if (encoded.bytes.length <= targetSizeBytes) {
        bestBytes = encoded.bytes;
        bestWidth = encoded.width;
        bestHeight = encoded.height;
        bestScale = midScale;
        // Try higher resolution
        lowScale = midScale + 0.02;
      } else {
        highScale = midScale - 0.02;
      }

      if (highScale < lowScale) break;
    }
  }

  // If still too large (e.g. extremely long GIF targeting 20KB/50KB), sample frames
  if (!bestBytes && compositeFrames.length > 8) {
    const frameSteps = [2, 3];
    for (const step of frameSteps) {
      for (const scale of [0.7, 0.5, 0.35, 0.2]) {
        const encoded = encodeGif(compositeFrames, origWidth, origHeight, scale, 64, step);
        if (encoded.bytes.length <= targetSizeBytes) {
          bestBytes = encoded.bytes;
          bestWidth = encoded.width;
          bestHeight = encoded.height;
          bestScale = scale;
          break;
        }
      }
      if (bestBytes) break;
    }
  }

  // Absolute fallback
  if (!bestBytes) {
    const encoded = encodeGif(compositeFrames, origWidth, origHeight, Math.max(0.15, bestScale), 32);
    bestBytes = encoded.bytes;
    bestWidth = encoded.width;
    bestHeight = encoded.height;
  }

  options.onStageChange?.('finalizing');

  const blob = new Blob([bestBytes as unknown as BlobPart], { type: 'image/gif' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const compressedName = `${baseName}-compressed.gif`;

  const percentageReduction = Math.max(
    0,
    Math.round(((file.size - blob.size) / file.size) * 100)
  );

  return {
    originalSize: file.size,
    compressedSize: blob.size,
    percentageReduction,
    downloadUrl: URL.createObjectURL(blob),
    blob,
    name: compressedName,
    outputFormat: 'GIF',
    width: bestWidth,
    height: bestHeight,
  };
}
