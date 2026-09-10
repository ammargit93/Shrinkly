import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ImageInfo,
  TargetSizePreset,
  CompressionResult,
  CompressionStatus,
  CompressionStage,
} from '../types/compression';
import { compressImageToLimit } from '../utils/imageCompression';
import { getGifInfo } from '../utils/gifCompression';
import { logUsageEvent } from '../services/usageLogger';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function useImageCompression(defaultPreset: TargetSizePreset = 'auto') {
  const [status, setStatus] = useState<CompressionStatus>('idle');
  const [stage, setStage] = useState<CompressionStage>('preparing');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [preset, setPreset] = useState<TargetSizePreset>(defaultPreset);
  const [customSize, setCustomSize] = useState<number>(100);
  const [customUnit, setCustomUnit] = useState<'KB' | 'MB'>('KB');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // References to keep track of active blob URLs without causing premature revocation
  const previewUrlRef = useRef<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);

  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const cleanupDownloadUrl = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
  }, []);

  const cleanupAllUrls = useCallback(() => {
    cleanupPreviewUrl();
    cleanupDownloadUrl();
  }, [cleanupPreviewUrl, cleanupDownloadUrl]);

  // Clean up only on component unmount
  useEffect(() => {
    return () => {
      cleanupAllUrls();
    };
  }, [cleanupAllUrls]);


  const selectImage = useCallback(
    async (file: File) => {
      // Revoke previous URLs before starting fresh
      cleanupAllUrls();

      setError(null);
      setResult(null);
      setImageFile(null);
      setImageInfo(null);

      // Validate type
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const isValidType = SUPPORTED_TYPES.includes(file.type) || isGif;

      if (!isValidType) {
        setStatus('error');
        setError("This file type isn't supported. Please use JPG, PNG, WebP, or GIF.");
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setStatus('error');
        setError('The image must be smaller than 50 MB.');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;

      if (isGif) {
        try {
          const gifInfo = await getGifInfo(file);
          setImageFile(file);
          setImageInfo({
            name: file.name,
            size: file.size,
            width: gifInfo.width,
            height: gifInfo.height,
            type: 'image/gif',
            previewUrl,
            frameCount: gifInfo.frameCount,
          });
          setStatus('selected');
        } catch {
          // Fallback to standard Image loader
          const img = new Image();
          img.src = previewUrl;
          img.onload = () => {
            setImageFile(file);
            setImageInfo({
              name: file.name,
              size: file.size,
              width: img.width,
              height: img.height,
              type: 'image/gif',
              previewUrl,
            });
            setStatus('selected');
          };
          img.onerror = () => {
            cleanupPreviewUrl();
            setStatus('error');
            setError('Unable to parse GIF file. Please try another image.');
          };
        }
        return;
      }

      // Standard JPG, PNG, WebP
      const img = new Image();
      img.src = previewUrl;

      img.onload = () => {
        setImageFile(file);
        setImageInfo({
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          type: file.type,
          previewUrl,
        });
        setStatus('selected');
      };

      img.onerror = () => {
        cleanupPreviewUrl();
        setStatus('error');
        setError('Corrupted image. Please try another image.');
      };
    },
    [cleanupAllUrls, cleanupPreviewUrl]
  );

  // Global paste handler when idle
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (status !== 'idle') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            selectImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [status, selectImage]);

  const handleCompress = useCallback(
    async (overridePreset?: TargetSizePreset, overrideCustomSize?: number, overrideUnit?: 'KB' | 'MB') => {
      if (!imageFile) return;

      const activePreset = overridePreset !== undefined ? overridePreset : preset;
      const activeCustomSize = overrideCustomSize !== undefined ? overrideCustomSize : customSize;
      const activeCustomUnit = overrideUnit !== undefined ? overrideUnit : customUnit;

      setStatus('compressing');
      setStage('preparing');
      setError(null);

      // Clean up previous download URL before creating a new one
      cleanupDownloadUrl();

      // Calculate target size in KB or 'auto'
      let targetSizeKb: number | 'auto' = 'auto';
      if (activePreset === 'custom') {
        targetSizeKb = activeCustomUnit === 'MB' ? activeCustomSize * 1024 : activeCustomSize;
        if (isNaN(targetSizeKb) || targetSizeKb <= 0) {
          setStatus('error');
          setError('Invalid target size. Please specify a value greater than 0.');
          return;
        }
      } else if (activePreset === 'auto') {
        targetSizeKb = 'auto';
      } else {
        targetSizeKb = activePreset;
        if (isNaN(targetSizeKb) || targetSizeKb <= 0) {
          setStatus('error');
          setError('Invalid target size. Please specify a value greater than 0.');
          return;
        }
      }

      const startTime = performance.now();

      try {
        const compressionResult = await compressImageToLimit(imageFile, targetSizeKb, {
          onStageChange: setStage,
        });
        const durationMs = Math.round(performance.now() - startTime);

        downloadUrlRef.current = compressionResult.downloadUrl;
        setResult(compressionResult);
        setStatus('success');

        // Record tool usage log
        logUsageEvent('single_compress', {
          format: compressionResult.outputFormat || imageFile.type.split('/')[1] || 'IMAGE',
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          percentageReduction: compressionResult.percentageReduction,
          targetSizeKb,
          durationMs,
        });
      } catch (err) {
        console.error(err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Compression failed. Please try another image.');
      }
    },
    [imageFile, preset, customSize, customUnit, cleanupDownloadUrl]
  );


  const recompress = useCallback(
    (newPreset?: TargetSizePreset) => {
      if (newPreset !== undefined) {
        setPreset(newPreset);
        handleCompress(newPreset);
      } else {
        setStatus('selected');
        setResult(null);
      }
    },
    [handleCompress]
  );

  const reset = useCallback(() => {
    cleanupAllUrls();
    setStatus('idle');
    setImageFile(null);
    setImageInfo(null);
    setResult(null);
    setError(null);
  }, [cleanupAllUrls]);


  return {
    status,
    stage,
    imageFile,
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
    compress: () => handleCompress(),
    recompress,
    reset,
  };
}

export type UseImageCompressionReturn = ReturnType<typeof useImageCompression>;

