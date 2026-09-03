export interface ImageInfo {
  name: string;
  size: number; // in bytes
  width: number;
  height: number;
  type: string; // e.g., 'image/jpeg', 'image/png', 'image/webp', 'image/gif'
  previewUrl: string;
  frameCount?: number;
}

export type TargetSizePreset = 20 | 50 | 100 | 200 | 500 | 1000 | 'custom';

export type CompressionStatus = 'idle' | 'selected' | 'compressing' | 'success' | 'error';

export type CompressionStage =
  | 'preparing'
  | 'decoding'
  | 'quantizing'
  | 'optimizing'
  | 'finalizing';

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  percentageReduction: number;
  downloadUrl: string;
  blob: Blob;
  name: string;
  outputFormat: string; // e.g., 'JPEG', 'WebP', 'PNG', 'GIF'
  width?: number;
  height?: number;
}

