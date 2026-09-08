import { useState, useId } from 'react';
import type { ClientBatchResult } from '../services/clientBatchCompression';
import {
  Download,
  RefreshCw,
  CheckCircle2,
  FileArchive,
  Layers,
  ArrowDownRight,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BatchResultProps {
  result: ClientBatchResult;
  onReset: () => void;
  onEditTarget?: () => void;
}

export function BatchResult({ result, onReset, onEditTarget }: BatchResultProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [showItems, setShowItems] = useState(true);
  const resultTitleId = useId();

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const bytesSaved = Math.max(0, result.originalTotalSize - result.compressedSize);

  const handleDownload = () => {
    setDownloaded(true);
  };

  const formatTargetLabel = (kb: number | 'auto') => {
    if (kb === 'auto') {
      return 'Auto (100% Quality)';
    }
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1).replace(/\.0$/, '')} MB`;
    }
    return `${kb} KB`;
  };

  return (
    <div
      aria-labelledby={resultTitleId}
      className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs"
    >
      {/* Status Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 mb-1">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {result.targetSizeKb === 'auto'
              ? 'Batch compressed with 100% quality'
              : `Batch target reached (≤ ${formatTargetLabel(result.targetSizeKb)} per image)`}
          </span>
        </div>
        <h2 id={resultTitleId} className="text-base sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {result.targetSizeKb === 'auto'
            ? `${result.fileCount} images compressed with 100% Quality`
            : `${result.fileCount} images compressed under ${formatTargetLabel(result.targetSizeKb)}`}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-[480px] mx-auto">
          Compressed 100% client-side in your browser (saved {formatBytes(bytesSaved)}).
        </p>
      </div>

      {/* Hero ZIP Card */}
      <div className="relative rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-b from-emerald-50/50 to-emerald-100/20 dark:from-emerald-950/20 dark:to-neutral-950/40 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md">
          <FileArchive className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
          {result.filename}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {result.fileCount} files inside · {formatBytes(result.compressedSize)} total
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">
            Total Original
          </div>
          <div className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {formatBytes(result.originalTotalSize)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
          <div className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">
            ZIP Package
          </div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatBytes(result.compressedSize)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider flex items-center justify-center gap-1">
            <ArrowDownRight className="h-3 w-3 text-emerald-600" /> Reduction
          </div>
          <div className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {result.percentageReduction}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider flex items-center justify-center gap-1">
            <Layers className="h-3 w-3" /> Images
          </div>
          <div className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {result.fileCount}
          </div>
        </div>
      </div>

      {/* Itemized List Accordion */}
      {result.items && result.items.length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <span>View Individual Compressed Files ({result.items.length})</span>
            {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showItems && (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[260px] overflow-y-auto bg-white dark:bg-neutral-900">
              {result.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 text-xs">
                  <div className="min-w-0 flex-grow mr-2">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                      <span className="line-through opacity-70">{formatBytes(item.originalSize)}</span>
                      <span>&rarr;</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatBytes(item.compressedSize)}
                      </span>
                      <span>({item.percentageReduction}% smaller)</span>
                    </div>
                  </div>

                  <a
                    href={item.downloadUrl}
                    download={item.name}
                    className="p-1.5 sm:px-2 sm:py-1 rounded-md bg-neutral-100 hover:bg-emerald-50 dark:bg-neutral-800 dark:hover:bg-emerald-950/40 text-neutral-700 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors flex-shrink-0"
                    title={`Download ${item.name}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-[11px]">Save</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <a
          href={result.downloadUrl}
          download={result.filename}
          onClick={handleDownload}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-xs text-center"
        >
          <Download className="h-4 w-4" />
          <span>{downloaded ? 'Download Again (.zip)' : 'Download All as ZIP (.zip)'}</span>
        </a>

        {onEditTarget && (
          <button
            type="button"
            onClick={onEditTarget}
            className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs sm:text-sm font-medium border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-lg transition-all cursor-pointer"
            title="Change target size and recompress this batch"
          >
            <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
            <span>Resize</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs sm:text-sm font-medium border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 flex-shrink-0" />
          <span>New Batch</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>100% private client-side processing. Images never leave your device.</span>
      </div>
    </div>
  );
}

export default BatchResult;
