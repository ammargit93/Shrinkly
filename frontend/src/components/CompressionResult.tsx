import type { CompressionResult as CompressionResultType } from '../types/compression';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CompressionResultProps {
  result: CompressionResultType;
  onReset: () => void;
}

export function CompressionResult({ result, onReset }: CompressionResultProps) {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const isAlreadyWithinLimit = result.percentageReduction === 0;

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md p-6 space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 mb-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{isAlreadyWithinLimit ? 'Already under limit' : 'Hit your limit'}</span>
        </div>
        <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
          {isAlreadyWithinLimit
            ? 'Image is already within your target size'
            : 'Compression complete'}
        </h2>
        <p className="text-xs text-neutral-450 dark:text-neutral-500">
          {isAlreadyWithinLimit
            ? 'Original quality and file size preserved without degradation.'
            : 'Optimized to highest visual quality within your target.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2">
        <div className="text-center">
          <div className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-50">
            {formatBytes(result.originalSize)}
          </div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
            Original
          </div>
        </div>

        <span className="text-neutral-300 dark:text-neutral-700 text-base sm:text-lg">→</span>

        <div className="text-center">
          <div className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-450">
            {formatBytes(result.compressedSize)}
          </div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
            Compressed
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-neutral-200 dark:border-neutral-800" />

        <div className="text-center">
          <div className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100">
            {result.percentageReduction}%
          </div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
            Smaller
          </div>
        </div>

        <div className="hidden sm:block h-8 w-px bg-neutral-200 dark:border-neutral-800" />

        <div className="text-center">
          <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {result.outputFormat}
          </div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
            Format
          </div>
        </div>
      </div>

      {result.width && result.height && (
        <div className="text-center text-xs text-neutral-400 dark:text-neutral-500">
          Resolution: {result.width} × {result.height} px
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <a
          href={result.downloadUrl}
          download={result.name}
          className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded transition-colors"
        >
          <Download className="h-4 w-4" />
          Download {result.outputFormat}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-350 bg-white dark:bg-neutral-900 rounded transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Compress another
        </button>
      </div>
    </div>
  );
}

export default CompressionResult;
