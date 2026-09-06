import type { CompressionResult, CompressionStage } from '../types/compression';
import { compressGifToLimit } from './gifCompression';

export interface CompressionOptions {
  /**
   * Maximum number of binary search iterations.
   * Default: 8
   */
  maxIterations?: number;
  /**
   * Callback fired as compression moves through stages.
   */
  onStageChange?: (stage: CompressionStage) => void;
}

/**
 * Compresses an image entirely client-side strictly preserving the input format:
 * - PNG -> PNG (.png)
 * - JPG / JPEG -> JPG (.jpg)
 * - WebP -> WebP (.webp)
 * - GIF -> GIF (.gif)
 *
 * Guarantees:
 * - Output will NEVER be larger than the original input file.
 * - If image is already <= target size: original is preserved untouched.
 * - Iteratively optimizes quality and dimensions to hit <= targetSizeKb.
 */
export async function compressImageToLimit(
  file: File,
  targetSizeKb: number,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const targetSizeBytes = Math.max(1, targetSizeKb * 1024);
  const targetMime = inferMimeType(file);
  const formatLabel = getFormatLabel(targetMime);

  // If GIF, route to dedicated GIF frame engine
  if (targetMime === 'image/gif') {
    return compressGifToLimit(file, targetSizeKb, options);
  }

  options.onStageChange?.('preparing');

  // 1. If image is already at or below target size, return original unmodified
  if (file.size <= targetSizeBytes) {
    const originalDimensions = await getImageDimensions(file).catch(() => ({
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
      outputFormat: formatLabel,
      width: originalDimensions.width,
      height: originalDimensions.height,
    };
  }

  // 2. Load the source image
  const img = await loadImage(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  if (!origWidth || !origHeight) {
    throw new Error('Unable to read image dimensions.');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: targetMime !== 'image/jpeg' });
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported in this browser.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const maxIterations = options.maxIterations ?? 8;
  const minDimension = 16;

  let bestBlob: Blob | null = null;
  let bestScale = 1.0;
  let smallestBlob: Blob | null = null;
  let smallestScale = 1.0;

  // Helper to record candidate blobs
  const recordCandidate = (blob: Blob | null, scale: number) => {
    if (!blob) return;
    if (!smallestBlob || blob.size < smallestBlob.size) {
      smallestBlob = blob;
      smallestScale = scale;
    }
    if (blob.size <= targetSizeBytes) {
      if (!bestBlob || (blob.size <= targetSizeBytes && scale >= bestScale)) {
        bestBlob = blob;
        bestScale = scale;
      }
    }
  };

  // 3. Strict Same-Format Compression Engine
  if (targetMime === 'image/png') {
    // --- PNG -> PNG (Lossless Canvas Export with Dimension Scale Optimization) ---
    // Test full resolution first
    canvas.width = origWidth;
    canvas.height = origHeight;
    ctx.clearRect(0, 0, origWidth, origHeight);
    ctx.drawImage(img, 0, 0, origWidth, origHeight);

    const fullBlob = await canvasToBlob(canvas, 'image/png');
    recordCandidate(fullBlob, 1.0);

    if (fullBlob && fullBlob.size <= targetSizeBytes) {
      bestBlob = fullBlob;
      bestScale = 1.0;
    } else {
      // Binary search for the maximum scale factor that produces a PNG <= target size
      let lowScale = 0.02;
      let highScale = 0.95;

      for (let i = 0; i < maxIterations; i++) {
        const midScale = Number(((lowScale + highScale) / 2).toFixed(3));
        const w = Math.max(minDimension, Math.round(origWidth * midScale));
        const h = Math.max(minDimension, Math.round(origHeight * midScale));

        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const blob = await canvasToBlob(canvas, 'image/png');
        if (!blob) break;

        recordCandidate(blob, midScale);

        if (blob.size <= targetSizeBytes) {
          bestBlob = blob;
          bestScale = midScale;
          // Try higher resolution
          lowScale = midScale + 0.02;
        } else {
          // Resolution is too large for target size
          highScale = midScale - 0.02;
        }

        if (highScale < lowScale) break;
      }
    }
  } else {
    // --- JPG -> JPG or WebP -> WebP (Lossy Quality + Adaptive Dimension Scaling) ---
    let scale = 1.0;

    while (scale >= 0.04) {
      const currentWidth = Math.max(minDimension, Math.round(origWidth * scale));
      const currentHeight = Math.max(minDimension, Math.round(origHeight * scale));

      canvas.width = currentWidth;
      canvas.height = currentHeight;
      ctx.clearRect(0, 0, currentWidth, currentHeight);

      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, currentWidth, currentHeight);
      }

      ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

      let lowQ = 0.05;
      let highQ = 0.98;
      let scaleBestBlob: Blob | null = null;

      for (let i = 0; i < maxIterations; i++) {
        const midQ = Number(((lowQ + highQ) / 2).toFixed(3));
        const blob = await canvasToBlob(canvas, targetMime, midQ);

        if (!blob) break;
        recordCandidate(blob, scale);

        if (blob.size <= targetSizeBytes) {
          scaleBestBlob = blob;
          lowQ = midQ + 0.02;
        } else {
          highQ = midQ - 0.02;
        }

        if (highQ < lowQ) break;
      }

      if (scaleBestBlob) {
        bestBlob = scaleBestBlob;
        bestScale = scale;
        break; // Found ideal quality that hits target at this resolution
      }

      // If lowest quality at this scale is still too large, calculate scale reduction
      const minQBlob = await canvasToBlob(canvas, targetMime, 0.05);
      recordCandidate(minQBlob, scale);

      if (minQBlob && minQBlob.size > targetSizeBytes) {
        const ratio = targetSizeBytes / minQBlob.size;
        const estimatedReduction = Math.max(0.15, Math.min(0.85, Math.sqrt(ratio) * 0.92));
        scale = Number((scale * estimatedReduction).toFixed(3));
      } else {
        scale = Number((scale * 0.7).toFixed(3));
      }

      if (origWidth * scale < minDimension || origHeight * scale < minDimension) {
        break;
      }
    }
  }

  // Fallback: Pick best valid candidate or smallest candidate created
  let finalBlob: Blob = file;
  let finalScale = 1.0;

  if (bestBlob && bestBlob.size <= file.size) {
    finalBlob = bestBlob;
    finalScale = bestScale;
  } else if (smallestBlob && (smallestBlob as Blob).size < file.size) {
    finalBlob = smallestBlob;
    finalScale = smallestScale;
  } else {
    // If re-encoding was larger than original file, strictly return original file
    finalBlob = file;
    finalScale = 1.0;
  }

  // Safety invariant: Output size must NEVER exceed original file size
  if (finalBlob.size > file.size) {
    finalBlob = file;
    finalScale = 1.0;
  }

  const finalWidth = Math.max(1, Math.round(origWidth * finalScale));
  const finalHeight = Math.max(1, Math.round(origHeight * finalScale));
  const compressedName = getCompressedFileName(file.name, targetMime);

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
    outputFormat: formatLabel,
    width: finalWidth,
    height: finalHeight,
  };
}

/**
 * Loads a File object into an HTMLImageElement asynchronously.
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. File may be corrupted or unsupported.'));
    };

    img.src = url;
  });
}

/**
 * Inspects image dimensions without keeping the image in memory.
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}

/**
 * Converts canvas to a Blob wrapped in a Promise.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Infers the MIME type of the input file from its type or extension.
 */
export function inferMimeType(file: File): string {
  if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
    return 'image/gif';
  }
  if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
    return 'image/png';
  }
  if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}

/**
 * Returns a human-friendly format name (e.g., 'JPEG', 'WebP', 'PNG', 'GIF').
 */
export function getFormatLabel(mimeType: string): string {
  if (mimeType.includes('gif')) return 'GIF';
  if (mimeType.includes('png')) return 'PNG';
  if (mimeType.includes('webp')) return 'WebP';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  return mimeType.split('/')[1]?.toUpperCase() || 'IMAGE';
}

/**
 * Creates a clean output filename strictly matching the original input format.
 */
export function getCompressedFileName(originalName: string, mimeType: string): string {
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;

  let ext = 'jpg';
  if (mimeType.includes('gif')) {
    ext = 'gif';
  } else if (mimeType.includes('png')) {
    ext = 'png';
  } else if (mimeType.includes('webp')) {
    ext = 'webp';
  }

  return `${baseName}-compressed.${ext}`;
}
