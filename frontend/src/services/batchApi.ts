export interface BatchCompressionResult {
  zipBlob: Blob;
  downloadUrl: string;
  filename: string;
  originalTotalSize: number;
  compressedSize: number;
  percentageReduction: number;
  fileCount: number;
  targetSizeKb: number;
}

export const MAX_BATCH_IMAGES = 10;
export const MAX_SINGLE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_TOTAL_BATCH_SIZE = 20 * 1024 * 1024; // 20 MB

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Validates a batch of files before sending to the backend.
 */
export function validateBatchFiles(files: File[]): { valid: boolean; error?: string } {
  if (!files || files.length === 0) {
    return { valid: false, error: 'Please select at least one image.' };
  }

  if (files.length > MAX_BATCH_IMAGES) {
    return {
      valid: false,
      error: `Maximum ${MAX_BATCH_IMAGES} images allowed per batch. You selected ${files.length}.`,
    };
  }

  let totalSize = 0;
  for (const file of files) {
    if (file.size > MAX_SINGLE_FILE_SIZE) {
      return {
        valid: false,
        error: `"${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
      };
    }
    totalSize += file.size;
  }

  if (totalSize >= MAX_TOTAL_BATCH_SIZE) {
    return {
      valid: false,
      error: `Total batch size must be under 20 MB. Current total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Compresses a batch of images on the Go backend server to strictly hit the target size limit per image,
 * and returns the zipped result.
 */
export async function compressBatchOnServer(
  files: File[],
  targetSizeKb: number = 100
): Promise<BatchCompressionResult> {
  const validation = validateBatchFiles(files);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (isNaN(targetSizeKb) || targetSizeKb <= 0) {
    throw new Error('Please specify a valid target file size greater than 0.');
  }

  const formData = new FormData();
  let originalTotalSize = 0;

  for (const file of files) {
    formData.append('file', file);
    originalTotalSize += file.size;
  }

  formData.append('target_size_kb', Math.round(targetSizeKb).toString());

  const response = await fetch(`${API_BASE_URL}/api/batch`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      if (response.statusText) {
        errorMessage = response.statusText;
      }
    }
    throw new Error(errorMessage);
  }

  const zipBlob = await response.blob();
  const downloadUrl = URL.createObjectURL(zipBlob);
  const compressedSize = zipBlob.size;

  const percentageReduction =
    originalTotalSize > 0
      ? Math.max(0, Math.round(((originalTotalSize - compressedSize) / originalTotalSize) * 100))
      : 0;

  return {
    zipBlob,
    downloadUrl,
    filename: 'compressed_images.zip',
    originalTotalSize,
    compressedSize,
    percentageReduction,
    fileCount: files.length,
    targetSizeKb,
  };
}
