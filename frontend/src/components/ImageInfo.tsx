import type { ImageInfo as ImageInfoType } from '../types/compression';
import { X } from 'lucide-react';

interface ImageInfoProps {
  info: ImageInfoType;
  onClear: () => void;
}

export function ImageInfo({ info, onClear }: ImageInfoProps) {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFormatLabel = (mimeType: string) => {
    if (mimeType === 'image/jpeg') return 'JPEG';
    if (mimeType === 'image/png') return 'PNG';
    if (mimeType === 'image/webp') return 'WebP';
    return mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN';
  };

  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md">
      <div className="flex items-center gap-4 overflow-hidden">
        <img
          src={info.previewUrl}
          alt="Preview"
          className="h-14 w-14 object-cover border border-neutral-200 dark:border-neutral-800 rounded bg-neutral-100 dark:bg-neutral-950 flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {info.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1">
            {formatBytes(info.size)} · {info.width} × {info.height} · {getFormatLabel(info.type)}
          </p>
        </div>
      </div>
      
      <button
        onClick={onClear}
        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-350 transition-colors"
        aria-label="Change image"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}

export default ImageInfo;
