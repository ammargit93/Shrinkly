import { useState } from 'react';
import type { CompressionResult as CompressionResultType } from '../types/compression';
import { Download, RefreshCw, CheckCircle2, Copy, Check, SlidersHorizontal, Eye } from 'lucide-react';

interface CompressionResultProps {
  result: CompressionResultType;
  originalPreviewUrl?: string;
  onReset: () => void;
  onEditTarget?: () => void;
}

export function CompressionResult({
  result,
  originalPreviewUrl,
  onReset,
  onEditTarget,
}: CompressionResultProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'compressed' | 'original'>('compressed');

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const isAlreadyWithinLimit = result.percentageReduction === 0;
  const bytesSaved = Math.max(0, result.originalSize - result.compressedSize);

  const handleCopy = async () => {
    try {
      // Browsers support copying PNG/JPEG/GIF via ClipboardItem
      let copyBlob = result.blob;
      if (result.blob.type === 'image/webp') {
        // Fallback or attempt direct copy
        copyBlob = result.blob;
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          [copyBlob.type]: copyBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: Copy blob download link
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-6 space-y-6 shadow-xs">
      {/* Status Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-750 dark:bg-emerald-950/40 dark:text-emerald-350 border border-emerald-200/60 dark:border-emerald-800/40 mb-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{isAlreadyWithinLimit ? 'Already under limit' : 'Target reached successfully'}</span>
        </div>
        <h2 className="text-lg font-bold text-neutral-850 dark:text-neutral-100">
          {isAlreadyWithinLimit
            ? 'Image is already within your target size'
            : 'Compression complete'}
        </h2>
        <p className="text-xs text-neutral-450 dark:text-neutral-500">
          {isAlreadyWithinLimit
            ? 'Original quality and file size preserved without degradation.'
            : `Optimized with maximum visual fidelity (saved ${formatBytes(bytesSaved)}).`}
        </p>
      </div>

      {/* Before / After Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Preview
          </span>
          {originalPreviewUrl && (
            <div className="inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('compressed')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'compressed'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Compressed ({formatBytes(result.compressedSize)})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('original')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'original'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Original ({formatBytes(result.originalSize)})
              </button>
            </div>
          )}
        </div>

        <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-950/50 p-4 flex items-center justify-center min-h-[180px] max-h-[320px] overflow-hidden">
          <img
            key={viewMode}
            src={viewMode === 'compressed' ? result.downloadUrl : (originalPreviewUrl || result.downloadUrl)}
            alt={viewMode === 'compressed' ? 'Compressed Preview' : 'Original Preview'}
            className="max-h-[280px] max-w-full object-contain rounded-lg shadow-xs"
          />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[11px] font-medium bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-xs">
            <Eye className="h-3 w-3" />
            {viewMode === 'compressed' ? 'Compressed Output' : 'Original Source'}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Original</div>
          <div className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-150 mt-0.5">
            {formatBytes(result.originalSize)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
          <div className="text-xs text-emerald-600 dark:text-emerald-450 font-medium uppercase tracking-wider">Compressed</div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatBytes(result.compressedSize)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Reduction</div>
          <div className="text-sm sm:text-base font-bold text-neutral-850 dark:text-neutral-100 mt-0.5">
            {result.percentageReduction}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Format</div>
          <div className="text-sm sm:text-base font-bold text-neutral-850 dark:text-neutral-100 mt-0.5">
            {result.outputFormat}
          </div>
        </div>
      </div>

      {result.width && result.height && (
        <div className="text-center text-xs text-neutral-400 dark:text-neutral-500">
          Resolution: {result.width} × {result.height} px
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <a
          href={result.downloadUrl}
          download={result.name}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
        >
          <Download className="h-4 w-4" />
          Download {result.outputFormat}
        </a>

        {typeof navigator !== 'undefined' && navigator.clipboard && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            title="Copy image to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        )}

        {onEditTarget && (
          <button
            type="button"
            onClick={onEditTarget}
            className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            title="Adjust target size and re-compress"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Change size</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          title="Clear and compress another image"
        >
          <RefreshCw className="h-4 w-4" />
          <span>New</span>
        </button>
      </div>
    </div>
  );
}

export default CompressionResult;

