import { useState, useCallback, useEffect } from 'react';
import type { ImageInfo, TargetSizePreset, CompressionResult, CompressionStatus } from '../types/compression';
import { compressImageToLimit } from '../utils/imageCompression';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function useImageCompression(defaultPreset: TargetSizePreset = 100) {
  const [status, setStatus] = useState<CompressionStatus>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [preset, setPreset] = useState<TargetSizePreset>(defaultPreset);
  const [customSize, setCustomSize] = useState<number>(100);
  const [customUnit, setCustomUnit] = useState<'KB' | 'MB'>('KB');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to clean up object URLs
  const cleanupUrls = useCallback(() => {
    if (imageInfo?.previewUrl) {
      URL.revokeObjectURL(imageInfo.previewUrl);
    }
    if (result?.downloadUrl) {
      URL.revokeObjectURL(result.downloadUrl);
    }
  }, [imageInfo, result]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  const selectImage = useCallback((file: File) => {
    // Revoke previous URLs before starting fresh
    cleanupUrls();
    
    setError(null);
    setResult(null);
    setImageFile(null);
    setImageInfo(null);

    // Validate type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setStatus('error');
      setError("This file type isn't supported. Please use JPG, PNG, or WebP.");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setStatus('error');
      setError('The image must be smaller than 50 MB.');
      return;
    }

    // Load image resolution
    const previewUrl = URL.createObjectURL(file);
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
      URL.revokeObjectURL(previewUrl);
      setStatus('error');
      setError('Corrupted image. Please try another image.');
    };
  }, [cleanupUrls]);

  const handleCompress = useCallback(async () => {
    if (!imageFile) return;

    setStatus('compressing');
    setError(null);

    // Calculate target size in KB
    let targetSizeKb = 100;
    if (preset === 'custom') {
      targetSizeKb = customUnit === 'MB' ? customSize * 1024 : customSize;
    } else {
      targetSizeKb = preset;
    }

    // Validate target size
    if (isNaN(targetSizeKb) || targetSizeKb <= 0) {
      setStatus('error');
      setError('Invalid target size. Please specify a value greater than 0.');
      return;
    }

    try {
      const compressionResult = await compressImageToLimit(imageFile, targetSizeKb);
      setResult(compressionResult);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Compression failed. Please try another image.');
    }
  }, [imageFile, preset, customSize, customUnit]);

  const reset = useCallback(() => {
    cleanupUrls();
    setStatus('idle');
    setImageFile(null);
    setImageInfo(null);
    setResult(null);
    setError(null);
    // Keep presets default
  }, [cleanupUrls]);

  return {
    status,
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
    compress: handleCompress,
    reset,
  };
}
export type UseImageCompressionReturn = ReturnType<typeof useImageCompression>;
