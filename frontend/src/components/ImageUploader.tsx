import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Clipboard, Files } from 'lucide-react';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export function ImageUploader({ onFilesSelected, multiple = true }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/') || file.name.match(/\.(jpe?g|png|webp|gif)$/i)
      );
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full rounded-xl border-2 border-dashed text-center transition-all duration-200 group
        ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 scale-[0.998]'
            : 'border-neutral-300 hover:border-emerald-500/70 dark:border-neutral-800 dark:hover:border-emerald-500/50 bg-white dark:bg-neutral-900/90 shadow-sm'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />
      <label
        htmlFor="file-upload"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex flex-col items-center justify-center py-8 px-4 sm:py-12 sm:px-6 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all duration-200">
          <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors" />
        </div>

        <span className="text-base font-semibold text-neutral-850 dark:text-neutral-100">
          <span className="sm:hidden">Tap to upload image(s)</span>
          <span className="hidden sm:inline">Drop images here (single or batch)</span>
        </span>

        <span className="text-xs text-neutral-400 dark:text-neutral-500 my-1.5 flex flex-wrap items-center justify-center gap-1.5 text-center">
          <span className="hidden sm:inline">or click to browse multiple files</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
            <Clipboard className="h-3 w-3" /> Ctrl+V
          </span>
          <span className="sm:hidden text-neutral-500 dark:text-neutral-400">
            Browse files or photo library
          </span>
        </span>

        <div className="pt-3 sm:pt-4 flex flex-wrap items-center justify-center gap-1.5">
          {['JPG', 'PNG', 'WebP', 'GIF'].map((fmt) => (
            <span
              key={fmt}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-350"
            >
              <ImageIcon className="h-3 w-3 opacity-60" />
              {fmt}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30">
            <Files className="h-3 w-3" />
            Up to 10 images (max 20 MB)
          </span>
        </div>
      </label>
    </div>
  );
}

export default ImageUploader;
