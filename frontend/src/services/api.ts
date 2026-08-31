import type { CompressionResult } from '../types/compression';
import { compressClientSide } from './compression';

/**
 * Compresses an image. If VITE_API_URL is configured, it sends a multipart/form-data POST request
 * to the Go API. Otherwise, it falls back to the high-quality client-side canvas compressor.
 */
export async function compressImage(
  file: File,
  targetSizeKb: number
): Promise<CompressionResult> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Pass target size in bytes as it is standard for backend processing
      formData.append('targetSize', (targetSizeKb * 1024).toString());

      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown server error');
        throw new Error(`Server returned code ${response.status}: ${errorText}`);
      }

      const compressedBlob = await response.blob();
      
      // Determine the compressed file name
      const originalName = file.name;
      const parts = originalName.split('.');
      if (parts.length > 1) {
        parts.pop();
      }
      const baseName = parts.join('.');
      const ext = compressedBlob.type === 'image/webp' ? 'webp' : 'jpg';
      const compressedName = `${baseName}-compressed.${ext}`;

      return {
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        percentageReduction: Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100)),
        downloadUrl: URL.createObjectURL(compressedBlob),
        blob: compressedBlob,
        name: compressedName,
      };
    } catch (error) {
      console.error('Go API compression failed, falling back or throwing error:', error);
      // For resilience and demo purposes, we will fallback to client-side compression but log a warning.
      // Or we can throw the error if the user has explicitly configured VITE_API_URL.
      // Let's throw the error so developers can debug backend connections,
      // but wrap it in a friendly message.
      throw new Error(`Compression failed via API. ${error instanceof Error ? error.message : 'Please check your connection.'}`);
    }
  }

  // Fallback to client-side compression (adds a small simulation delay of 600ms to feel realistic)
  await new Promise((resolve) => setTimeout(resolve, 600));
  return compressClientSide(file, targetSizeKb);
}
