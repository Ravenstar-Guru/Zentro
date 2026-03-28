import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1, // Max 1MB
  maxWidthOrHeight: 1024, // Max dimension 1024px
  useWebWorker: true
};

/**
 * Compresses an image file before upload to Firebase Storage
 * Reduces storage costs and improves upload speeds
 */
export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const compressedFile = await imageCompression(file, opts);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
