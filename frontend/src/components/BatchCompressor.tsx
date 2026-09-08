import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { TargetSizePreset } from '../types/compression';
import {
  compressBatchClientSide,
  type ClientBatchResult,
  type BatchProgress,
} from '../services/clientBatchCompression';
import { TargetSize } from './TargetSize';
import { BatchResult } from './BatchResult';

export const MAX_CLIENT_BATCH_IMAGES = 20;

interface BatchCompressorProps {
  initialFiles: File[];
  onReset: () => void;
  defaultPreset?: TargetSizePreset;
}

interface FileWithPreview {
  id: string;
  file: File;
  previewUrl: string;
}

export function BatchCompressor({
  initialFiles,
  onReset,
  defaultPreset = 'auto',
}: BatchCompressorProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [preset, setPreset] = useState<TargetSizePreset>(defaultPreset);
  const [customSize, setCustomSize] = useState<number>(100);
  const [customUnit, setCustomUnit] = useState<'KB' | 'MB'>('KB');
  const [status, setStatus] = useState<'selected' | 'compressing' | 'success' | 'error'>('selected');
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [result, setResult] = useState<ClientBatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize previews and clean up on unmount
  useEffect(() => {
    const list: FileWithPreview[] = initialFiles.map((file, idx) => ({
      id: `${file.name}-${file.size}-${idx}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles(list);

    return () => {
      list.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [initialFiles]);

  const totalBytes = files.reduce((acc, item) => acc + item.file.size, 0);
  const totalMB = totalBytes / (1024 * 1024);

  // Calculate target size in KB or 'auto'
  let targetSizeKb: number | 'auto' = 'auto';
  if (preset === 'custom') {
    targetSizeKb = customUnit === 'MB' ? customSize * 1024 : customSize;
  } else if (preset === 'auto') {
    targetSizeKb = 'auto';
  } else {
    targetSizeKb = preset;
  }

  const formatTargetLabel = () => {
    if (preset === 'auto') {
      return 'Auto (100% Quality)';
    }
    if (preset === 'custom') {
      return `${customSize} ${customUnit}`;
    }
    if (preset === 1000) return '1 MB';
    return `${preset} KB`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFormatLabel = (mimeType: string, filename: string) => {
    if (mimeType.includes('gif') || filename.endsWith('.gif')) return 'GIF';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg') || filename.match(/\.jpe?g$/i)) return 'JPEG';
    if (mimeType.includes('png') || filename.endsWith('.png')) return 'PNG';
    if (mimeType.includes('webp') || filename.endsWith('.webp')) return 'WebP';
    return 'IMAGE';
  };

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((f) => f.id !== id);
      if (updated.length === 0) {
        onReset();
      }
      return updated;
    });
  }, [onReset]);

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files).filter((file) =>
      file.type.startsWith('image/') || file.name.match(/\.(jpe?g|png|webp|gif)$/i)
    );

    if (files.length + newFiles.length > MAX_CLIENT_BATCH_IMAGES) {
      setError(`Maximum ${MAX_CLIENT_BATCH_IMAGES} images allowed in a batch.`);
      return;
    }

    const newWithPreviews: FileWithPreview[] = newFiles.map((file, idx) => ({
      id: `${file.name}-${file.size}-${idx}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newWithPreviews]);
    setError(null);
    e.target.value = '';
  };

  const handleCompress = async () => {
    const rawFiles = files.map((f) => f.file);
    if (rawFiles.length === 0) {
      setError('Please select at least one image.');
      return;
    }

    if (targetSizeKb !== 'auto' && (isNaN(targetSizeKb) || targetSizeKb <= 0)) {
      setError('Please enter a valid target size greater than 0.');
      return;
    }

    setStatus('compressing');
    setError(null);
    setProgress({
      currentIndex: 1,
      totalFiles: rawFiles.length,
      currentFileName: rawFiles[0].name,
      stageText: 'Preparing compression...',
      percent: 0,
    });

    try {
      const res = await compressBatchClientSide(rawFiles, targetSizeKb, (prog) => {
        setProgress(prog);
      });
      setResult(res);
      setStatus('success');
    } catch (err) {
      console.error('Client batch compression failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Batch compression failed.');
    }
  };

  if (status === 'success' && result) {
    return (
      <BatchResult
        result={result}
        onReset={onReset}
        onEditTarget={() => {
          setStatus('selected');
          setResult(null);
        }}
      />
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-xs">
      {/* Header & Limits Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Batch Compression ({files.length} {files.length === 1 ? 'image' : 'images'})
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Fast, private client-side compression. Images are bundled into a ZIP archive without uploading to any server.
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={status === 'compressing'}
            className="text-xs font-medium text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 cursor-pointer disabled:opacity-50"
          >
            Clear All
          </button>
        </div>

        {/* Batch Info Meter */}
        <div className="flex items-center justify-between text-xs bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            Total Selected: <strong className="text-emerald-600 dark:text-emerald-400">{totalMB.toFixed(2)} MB</strong>
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">
            {files.length} of {MAX_CLIENT_BATCH_IMAGES} images max
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Compressing Progress State */}
      {status === 'compressing' && progress && (
        <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>{progress.stageText}</span>
            </div>
            <span>{progress.percent}%</span>
          </div>

          <div className="w-full bg-emerald-200/70 dark:bg-emerald-950 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 dark:bg-emerald-500 h-full transition-all duration-200 ease-out"
              style={{ width: `${Math.max(5, progress.percent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
            <span>File {progress.currentIndex} of {progress.totalFiles}</span>
            <span className="truncate max-w-[200px] sm:max-w-[280px]">{progress.currentFileName}</span>
          </div>
        </div>
      )}

      {/* File Queue List */}
      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
        {files.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/70 hover:bg-neutral-100/80 dark:hover:bg-neutral-800 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 overflow-hidden min-w-0 mr-2">
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 w-5 text-center flex-shrink-0">
                {index + 1}
              </span>
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-11 w-11 sm:h-12 sm:w-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 flex-shrink-0"
              />
              <div className="min-w-0 flex-grow">
                <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {item.file.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {formatBytes(item.file.size)}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                    {getFormatLabel(item.file.type, item.file.name)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveFile(item.id)}
              disabled={status === 'compressing'}
              className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
              title="Remove image from batch"
              aria-label="Remove image"
            >
              <X className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>
          </div>
        ))}

        {/* Add more button */}
        {files.length < MAX_CLIENT_BATCH_IMAGES && (
          <div>
            <input
              ref={addFileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAddMoreFiles}
            />
            <button
              type="button"
              onClick={() => addFileInputRef.current?.click()}
              disabled={status === 'compressing'}
              className="w-full py-2.5 px-3 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add more images ({MAX_CLIENT_BATCH_IMAGES - files.length} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Target Size Selection UX */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <TargetSize
          preset={preset}
          customSize={customSize}
          customUnit={customUnit}
          currentSizeBytes={totalBytes / (files.length || 1)} // Average image size for hints
          onPresetChange={setPreset}
          onCustomSizeChange={setCustomSize}
          onCustomUnitChange={setCustomUnit}
        />
      </div>

      {/* Submit Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCompress}
          disabled={status === 'compressing' || files.length === 0}
          className="w-full py-3.5 px-4 text-base sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          {status === 'compressing' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>
                {preset === 'auto'
                  ? `Compressing ${files.length} images (Auto - 100% Quality)...`
                  : `Compressing ${files.length} images to ≤ ${formatTargetLabel()}...`}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>
                {preset === 'auto'
                  ? `Compress ${files.length} Images (Auto - 100% Quality ZIP)`
                  : `Compress ${files.length} Images under ${formatTargetLabel()} (ZIP)`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BatchCompressor;
