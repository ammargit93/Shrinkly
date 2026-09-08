import { compressImageToLimit } from '../utils/imageCompression';
import { createZipBlob, type ZipFileInput } from '../utils/zipBuilder';
import type { CompressionResult } from '../types/compression';

export interface ClientBatchResult {
  zipBlob: Blob;
  downloadUrl: string;
  filename: string;
  originalTotalSize: number;
  compressedSize: number;
  percentageReduction: number;
  fileCount: number;
  targetSizeKb: number | 'auto';
  items: CompressionResult[];
}

export interface BatchProgress {
  currentIndex: number;
  totalFiles: number;
  currentFileName: string;
  stageText: string;
  percent: number;
}

/**
 * Yields control back to the browser's main event loop to ensure
 * the UI, CSS animations, and progress updates stay 100% fluid and responsive.
 */
export function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Compresses an array of images entirely on the client without freezing the UI,
 * and packages them into a valid ZIP archive.
 */
export async function compressBatchClientSide(
  files: File[],
  targetSizeKb: number | 'auto',
  onProgress?: (progress: BatchProgress) => void
): Promise<ClientBatchResult> {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image to compress.');
  }

  if (targetSizeKb !== 'auto' && (isNaN(targetSizeKb) || targetSizeKb <= 0)) {
    throw new Error('Please specify a valid target size greater than 0.');
  }

  const results: CompressionResult[] = [];
  const zipInputs: ZipFileInput[] = [];
  let originalTotalSize = 0;

  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    originalTotalSize += file.size;

    // Report progress before starting each file
    const percent = Math.round((i / total) * 100);
    onProgress?.({
      currentIndex: i + 1,
      totalFiles: total,
      currentFileName: file.name,
      stageText: `Optimizing ${file.name}...`,
      percent,
    });

    // Yield to main thread so UI updates and progress bars render smoothly
    await yieldToMainThread();

    try {
      const itemResult = await compressImageToLimit(file, targetSizeKb, {
        onStageChange: (stage) => {
          onProgress?.({
            currentIndex: i + 1,
            totalFiles: total,
            currentFileName: file.name,
            stageText: `${stage.charAt(0).toUpperCase() + stage.slice(1)} ${file.name}...`,
            percent: Math.round(((i + 0.5) / total) * 100),
          });
        },
      });

      results.push(itemResult);
      zipInputs.push({
        name: itemResult.name,
        data: itemResult.blob,
      });
    } catch (err) {
      console.warn(`Failed to compress ${file.name}:`, err);
      // Fallback to original file in ZIP if specific item compression fails
      results.push({
        originalSize: file.size,
        compressedSize: file.size,
        percentageReduction: 0,
        downloadUrl: URL.createObjectURL(file),
        blob: file,
        name: file.name,
        outputFormat: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
      });
      zipInputs.push({
        name: file.name,
        data: file,
      });
    }

    // Yield again between files to let GC clean up frame/canvas buffers
    await yieldToMainThread();
  }

  // Build ZIP archive
  onProgress?.({
    currentIndex: total,
    totalFiles: total,
    currentFileName: 'Archive',
    stageText: 'Bundling ZIP archive...',
    percent: 98,
  });

  await yieldToMainThread();

  const zipBlob = await createZipBlob(zipInputs);
  const downloadUrl = URL.createObjectURL(zipBlob);
  const compressedSize = zipBlob.size;

  const percentageReduction =
    originalTotalSize > 0
      ? Math.max(0, Math.round(((originalTotalSize - compressedSize) / originalTotalSize) * 100))
      : 0;

  onProgress?.({
    currentIndex: total,
    totalFiles: total,
    currentFileName: 'Complete',
    stageText: 'Done!',
    percent: 100,
  });

  return {
    zipBlob,
    downloadUrl,
    filename: 'compressed_images.zip',
    originalTotalSize,
    compressedSize,
    percentageReduction,
    fileCount: files.length,
    targetSizeKb,
    items: results,
  };
}
