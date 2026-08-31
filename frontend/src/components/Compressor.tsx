import { useImageCompression } from '../hooks/useImageCompression';
import type { TargetSizePreset } from '../types/compression';
import { ImageUploader } from './ImageUploader';
import { ImageInfo } from './ImageInfo';
import { TargetSize } from './TargetSize';
import { CompressionState } from './CompressionState';
import { CompressionResult } from './CompressionResult';
import { ErrorMessage } from './ErrorMessage';
import { Link } from './Router';

interface CompressorProps {
  defaultPreset?: TargetSizePreset;
}

export function Compressor({ defaultPreset = 100 }: CompressorProps) {
  const {
    status,
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
    reset,
  } = useImageCompression(defaultPreset);

  const isIdle = status === 'idle';
  const isSelected = status === 'selected';
  const isCompressing = status === 'compressing';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-4">
      {/* Upload State */}
      {isIdle && (
        <ImageUploader onFileSelected={selectImage} />
      )}

      {/* Selected / Compress/ Loading / Success State */}
      {imageInfo && (
        <div className="space-y-4">
          <ImageInfo info={imageInfo} onClear={reset} />

          {isSelected && (
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md p-6 space-y-6">
              <TargetSize
                preset={preset}
                customSize={customSize}
                customUnit={customUnit}
                onPresetChange={setPreset}
                onCustomSizeChange={setCustomSize}
                onCustomUnitChange={setCustomUnit}
              />
              <button
                type="button"
                onClick={compress}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded transition-colors cursor-pointer"
              >
                Compress image
              </button>
            </div>
          )}

          {isCompressing && <CompressionState />}

          {isSuccess && result && (
            <CompressionResult result={result} onReset={reset} />
          )}
        </div>
      )}

      {/* Standalone Error State (when no image details can be shown, e.g. upload failed initial validation) */}
      {isError && !imageInfo && (
        <div className="space-y-4">
          <ErrorMessage message={error || 'An error occurred'} onRetry={reset} />
          <ImageUploader onFileSelected={selectImage} />
        </div>
      )}

      {/* Error state overlay when image info is active (e.g. compression failed) */}
      {isError && imageInfo && (
        <div className="space-y-4">
          <ErrorMessage message={error || 'An error occurred'} onRetry={compress} />
        </div>
      )}

      {/* Subtle privacy disclaimer */}
      {!isCompressing && !isSuccess && (
        <p className="text-center text-xs text-neutral-450 dark:text-neutral-500">
          Your images aren't stored. Read our{' '}
          <Link href="/privacy" className="underline hover:text-neutral-600 dark:hover:text-neutral-400">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
      )}
    </div>
  );
}

export default Compressor;
