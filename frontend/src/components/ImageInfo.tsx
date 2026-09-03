import type { ImageInfo as ImageInfoType } from '../types/compression';
import { X, Film } from 'lucide-react';

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
    if (mimeType.includes('gif')) return 'GIF';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('webp')) return 'WebP';
    return mimeType.split('/')[1]?.toUpperCase() || 'IMAGE';
  };

  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs">
      <div className="flex items-center gap-3.5 overflow-hidden">
        <div className="relative flex-shrink-0">
          <img
            src={info.previewUrl}
            alt="Preview"
            className="h-14 w-14 object-cover border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-100 dark:bg-neutral-950"
          />
          {info.frameCount && info.frameCount > 1 && (
            <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-semibold bg-black/75 text-white rounded backdrop-blur-xs">
              <Film className="h-2.5 w-2.5" />
              {info.frameCount}f
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-850 dark:text-neutral-150 truncate">
            {info.name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>{formatBytes(info.size)}</span>
            <span>·</span>
            <span>{info.width} × {info.height} px</span>
            <span>·</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {getFormatLabel(info.type)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onClear}
        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        aria-label="Change image"
        title="Remove and choose another image"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}

export default ImageInfo;

