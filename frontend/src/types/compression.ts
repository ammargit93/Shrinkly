export interface ImageInfo {
  name: string;
  size: number; // in bytes
  width: number;
  height: number;
  type: string; // e.g., 'image/jpeg', 'image/png', 'image/webp'
  previewUrl: string;
}

export type TargetSizePreset = 20 | 50 | 100 | 200 | 500 | 'custom';

export type CompressionStatus = 'idle' | 'selected' | 'compressing' | 'success' | 'error';

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  percentageReduction: number;
  downloadUrl: string;
  blob: Blob;
  name: string;
}
