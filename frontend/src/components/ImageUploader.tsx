import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
}

export function ImageUploader({ onFileSelected }: ImageUploaderProps) {
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
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
      className={`relative w-full rounded-md border border-dashed text-center transition-all duration-200 
        ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
            : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      <label
        htmlFor="file-upload"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
      >
        <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-600 mb-4" />
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          Drop an image here
        </span>
        <span className="text-xs text-neutral-450 dark:text-neutral-450 my-1.5">or</span>
        <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded transition-colors mb-4">
          Choose image
        </span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          JPG, PNG, WebP · Max 50 MB
        </span>
      </label>
    </div>
  );
}

export default ImageUploader;
