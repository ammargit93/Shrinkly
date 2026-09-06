import { useState } from 'react';
import { useImageCompression } from '../hooks/useImageCompression';
import type { TargetSizePreset } from '../types/compression';
import { ImageUploader } from './ImageUploader';
import { ImageInfo } from './ImageInfo';
import { TargetSize } from './TargetSize';
import { CompressionState } from './CompressionState';
import { CompressionResult } from './CompressionResult';
import { ErrorMessage } from './ErrorMessage';
import { BatchCompressor } from './BatchCompressor';
import { Link } from './Router';

interface CompressorProps {
  defaultPreset?: TargetSizePreset;
}

export function Compressor({ defaultPreset = 100 }: CompressorProps) {
  const [batchFiles, setBatchFiles] = useState<File[] | null>(null);

  const {
    status,
    stage,
    imageInfo,
    preset,
    customSize,
    customUnit,
    result,
    error,
    selectImage,
    setPreset,
    setCustomSize,
    setCustomUnit,
    compress,
    recompress,
    reset: resetSingle,
  } = useImageCompression(defaultPreset);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 1) {
      resetSingle();
      setBatchFiles(files);
    } else if (files.length === 1) {
      setBatchFiles(null);
      selectImage(files[0]);
    }
  };

  const handleResetAll = () => {
    setBatchFiles(null);
    resetSingle();
  };

  // If in Batch mode
  if (batchFiles && batchFiles.length > 0) {
    return (
      <div className="w-full max-w-[800px] mx-auto space-y-4">
        <BatchCompressor
          initialFiles={batchFiles}
          onReset={handleResetAll}
          defaultPreset={defaultPreset}
        />
      </div>
    );
  }

  const isIdle = status === 'idle';
  const isSelected = status === 'selected';
  const isCompressing = status === 'compressing';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-4">
      {/* Upload State */}
      {isIdle && <ImageUploader onFilesSelected={handleFilesSelected} />}

      {/* Selected / Compress / Loading / Success State */}
      {imageInfo && (
        <div className="space-y-4">
          <ImageInfo info={imageInfo} onClear={handleResetAll} />

          {isSelected && (
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-xs">
              <TargetSize
                preset={preset}
                customSize={customSize}
                customUnit={customUnit}
                currentSizeBytes={imageInfo.size}
                onPresetChange={setPreset}
                onCustomSizeChange={setCustomSize}
                onCustomUnitChange={setCustomUnit}
              />
              <button
                type="button"
                onClick={compress}
                className="w-full py-3.5 px-4 text-base sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Compress image
              </button>
            </div>
          )}

          {isCompressing && <CompressionState stage={stage} />}

          {isSuccess && result && (
            <CompressionResult
              result={result}
              originalPreviewUrl={imageInfo.previewUrl}
              onReset={handleResetAll}
              onEditTarget={() => recompress()}
            />
          )}
        </div>
      )}

      {/* Standalone Error State */}
      {isError && !imageInfo && (
        <div className="space-y-4">
          <ErrorMessage message={error || 'An error occurred'} onRetry={handleResetAll} />
          <ImageUploader onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {/* Error state overlay when image info is active */}
      {isError && imageInfo && (
        <div className="space-y-4">
          <ErrorMessage message={error || 'An error occurred'} onRetry={compress} />
        </div>
      )}

      {/* Subtle privacy disclaimer */}
      {!isCompressing && !isSuccess && (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          All images are compressed 100% locally in your browser. Your files never leave your device. Read our{' '}
          <Link href="/privacy" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
      )}
    </div>
  );
}

export default Compressor;
