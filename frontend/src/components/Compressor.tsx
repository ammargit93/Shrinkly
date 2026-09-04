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

      {/* Selected / Compress / Loading / Success State */}
      {imageInfo && (
        <div className="space-y-4">
          <ImageInfo info={imageInfo} onClear={reset} />

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
              onReset={reset}
              onEditTarget={() => recompress()}
            />
          )}
        </div>
      )}

      {/* Standalone Error State */}
      {isError && !imageInfo && (
        <div className="space-y-4">
          <ErrorMessage message={error || 'An error occurred'} onRetry={reset} />
          <ImageUploader onFileSelected={selectImage} />
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
        <p className="text-center text-xs text-neutral-450 dark:text-neutral-500">
          Your images aren't uploaded to any remote server. Read our{' '}
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

