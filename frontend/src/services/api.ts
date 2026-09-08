import type { CompressionResult } from '../types/compression';
import { compressImageToLimit } from '../utils/imageCompression';

/**
 * Purely client-side image compression to hit the target file size limit.
 */
export async function compressImage(
  file: File,
  targetSizeKb: number | 'auto'
): Promise<CompressionResult> {
  return compressImageToLimit(file, targetSizeKb);
}
