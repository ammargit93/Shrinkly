import type { CompressionResult } from '../types/compression';

/**
 * Compresses an image client-side using HTML5 Canvas.
 * Uses a binary search to adjust quality and scale to approximate the target size.
 */
export async function compressClientSide(
  file: File,
  targetSizeKb: number
): Promise<CompressionResult> {
  const targetSizeBytes = targetSizeKb * 1024;
  
  // Load the image
  const img = await loadImage(file);
  
  let scale = 1.0;
  let quality = 0.8;
  let bestBlob: Blob | null = null;
  let bestDiff = Infinity;
  
  // Canvas configuration
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Iterate to find a balance between image dimensions and compression quality
  // to get as close to (but under, if possible) the target file size.
  // We do up to 6 passes to converge quickly.
  for (let pass = 0; pass < 6; pass++) {
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Always export as image/jpeg or image/webp for compression.
    // WebP compression is supported in most modern browsers.
    // If the original type is PNG and it has transparency, we convert it to JPEG (adding a white background).
    const exportType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
    
    // Draw white background if converting PNG to JPEG
    if (exportType === 'image/jpeg' && file.type === 'image/png') {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }

    const blob = await canvasToBlob(canvas, exportType, quality);
    
    if (!blob) continue;

    const sizeDiff = blob.size - targetSizeBytes;
    
    // We want to be close to the target, ideally slightly below.
    // If blob size is very close, we accept it.
    if (Math.abs(sizeDiff) < bestDiff) {
      bestDiff = Math.abs(sizeDiff);
      bestBlob = blob;
    }
    
    if (blob.size > targetSizeBytes) {
      // Too large. Reduce quality, and if quality is already low, reduce resolution scale.
      if (quality > 0.3) {
        quality -= 0.25;
      } else {
        scale *= 0.75;
      }
    } else {
      // Under target. We could stop here or try to increase quality slightly
      // but let's break to be fast, as it's already under the target size.
      break;
    }
  }

  // Fallback to original blob if everything failed
  const finalBlob = bestBlob || file;
  
  return {
    originalSize: file.size,
    compressedSize: finalBlob.size,
    percentageReduction: Math.max(0, Math.round(((file.size - finalBlob.size) / file.size) * 100)),
    downloadUrl: URL.createObjectURL(finalBlob),
    blob: finalBlob,
    name: getCompressedFileName(file.name, file.type)
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Corrupted image or failed to load.'));
    };
    
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
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

function getCompressedFileName(originalName: string, mimeType: string): string {
  const parts = originalName.split('.');
  if (parts.length > 1) {
    parts.pop(); // Remove original extension
  }
  const baseName = parts.join('.');
  
  // Decide extension based on MIME type of compression
  const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
  return `${baseName}-compressed.${extension}`;
}
