import type { CompressionResult } from '../types/compression';
import { compressImageToLimit } from '../utils/imageCompression';

/**
 * Compresses an image client-side to hit the desired limit with maximum visual quality.
 */
export async function compressClientSide(
  file: File,
  targetSizeKb: number | 'auto'
): Promise<CompressionResult> {
  return compressImageToLimit(file, targetSizeKb);
}
