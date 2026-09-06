import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Server,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { TargetSizePreset } from '../types/compression';
import {
  compressBatchOnServer,
  MAX_BATCH_IMAGES,
  MAX_TOTAL_BATCH_SIZE,
  MAX_SINGLE_FILE_SIZE,
  validateBatchFiles,
  type BatchCompressionResult,
} from '../services/batchApi';
import { TargetSize } from './TargetSize';
import { BatchResult } from './BatchResult';

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
  defaultPreset = 100,
}: BatchCompressorProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [preset, setPreset] = useState<TargetSizePreset>(defaultPreset);
  const [customSize, setCustomSize] = useState<number>(100);
  const [customUnit, setCustomUnit] = useState<'KB' | 'MB'>('KB');
  const [status, setStatus] = useState<'selected' | 'compressing' | 'success' | 'error'>('selected');
  const [result, setResult] = useState<BatchCompressionResult | null>(null);
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

    // Initial validation check
    const validation = validateBatchFiles(initialFiles);
    if (!validation.valid && validation.error) {
      setError(validation.error);
    }

    return () => {
      list.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [initialFiles]);

  const totalBytes = files.reduce((acc, item) => acc + item.file.size, 0);
  const totalMB = totalBytes / (1024 * 1024);
  const isOverSizeLimit = totalBytes >= MAX_TOTAL_BATCH_SIZE;
  const isOverCountLimit = files.length > MAX_BATCH_IMAGES;

  // Calculate target size in KB
  let targetSizeKb = 100;
  if (preset === 'custom') {
    targetSizeKb = customUnit === 'MB' ? customSize * 1024 : customSize;
  } else {
    targetSizeKb = preset;
  }

  const formatTargetLabel = () => {
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

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((f) => f.id !== id);
      if (updated.length === 0) {
        onReset();
      } else {
        const validation = validateBatchFiles(updated.map((u) => u.file));
        if (validation.valid) {
          setError(null);
        } else {
          setError(validation.error || null);
        }
      }
      return updated;
    });
  }, [onReset]);

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files).filter((file) =>
      file.type.startsWith('image/') || file.name.match(/\.(jpe?g|png|webp|gif)$/i)
    );

    const updatedRaw = [...files.map((f) => f.file), ...newFiles];
    if (updatedRaw.length > MAX_BATCH_IMAGES) {
      setError(`Cannot add more: maximum ${MAX_BATCH_IMAGES} images allowed in total.`);
      return;
    }

    const newWithPreviews: FileWithPreview[] = newFiles.map((file, idx) => ({
      id: `${file.name}-${file.size}-${idx}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    const nextFiles = [...files, ...newWithPreviews];
    setFiles(nextFiles);

    const validation = validateBatchFiles(nextFiles.map((f) => f.file));
    if (!validation.valid) {
      setError(validation.error || null);
    } else {
      setError(null);
    }

    e.target.value = '';
  };

  const handleCompress = async () => {
    const rawFiles = files.map((f) => f.file);
    const validation = validateBatchFiles(rawFiles);
    if (!validation.valid) {
      setError(validation.error || 'Invalid batch selection.');
      return;
    }

    if (isNaN(targetSizeKb) || targetSizeKb <= 0) {
      setError('Please enter a valid target size greater than 0.');
      return;
    }

    setStatus('compressing');
    setError(null);

    try {
      const res = await compressBatchOnServer(rawFiles, targetSizeKb);
      setResult(res);
      setStatus('success');
    } catch (err) {
      console.error('Batch compression failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Batch compression failed on server.');
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
            <h2 className="text-base sm:text-lg font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Batch Compression ({files.length} {files.length === 1 ? 'image' : 'images'})
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Each image will be compressed to fit strictly under your chosen target size.
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

        {/* Size Progress Meter */}
        <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Total Payload: <strong className={isOverSizeLimit ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}>{totalMB.toFixed(2)} MB</strong> / 20 MB max
            </span>
            <span className="text-neutral-400 dark:text-neutral-500">
              {files.length} / {MAX_BATCH_IMAGES} images
            </span>
          </div>

          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverSizeLimit ? 'bg-red-500' : totalMB > 16 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (totalBytes / MAX_TOTAL_BATCH_SIZE) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* File Queue List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {files.map((item, index) => {
          const isFileOversized = item.file.size > MAX_SINGLE_FILE_SIZE;
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all ${
                isFileOversized
                  ? 'border-red-300 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0 mr-2">
                <span className="text-[11px] font-semibold text-neutral-400 w-4 text-center">
                  {index + 1}
                </span>
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-10 w-10 sm:h-11 sm:w-11 object-cover rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-grow">
                  <p className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {formatBytes(item.file.size)}
                    {isFileOversized && (
                      <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                        (Exceeds 10 MB limit)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveFile(item.id)}
                disabled={status === 'compressing'}
                className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {/* Add more button */}
        {files.length < MAX_BATCH_IMAGES && (
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
              Add more images ({MAX_BATCH_IMAGES - files.length} remaining)
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
          disabled={status === 'compressing' || isOverSizeLimit || isOverCountLimit || files.length === 0}
          className="w-full py-3.5 px-4 text-base sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          {status === 'compressing' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Compressing {files.length} images to &le; {formatTargetLabel()}...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Compress {files.length} Images under {formatTargetLabel()} (ZIP)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BatchCompressor;
