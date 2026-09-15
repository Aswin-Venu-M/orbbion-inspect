export const DEFAULT_MAX_IMAGES = 20;
export const DEFAULT_MAX_FILE_SIZE_MB = 10;
export const DEFAULT_MAX_FILE_SIZE_BYTES = DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024;

export interface ImageValidationOptions {
  currentCount?: number;
  maxImages?: number;
  maxSizeBytes?: number;
}

export interface ImageValidationResult {
  validFiles: File[];
  error: string | null;
  errors: string[];
}

/**
 * Validates files for image upload, checking MIME type, file extension,
 * size boundaries, and total image count limits.
 * Accepts either an options object or positional arguments.
 */
export function validateImageFiles(
  files: FileList | File[],
  optionsOrCount: number | ImageValidationOptions = 0,
  maxImagesParam: number = DEFAULT_MAX_IMAGES,
  maxSizeBytesParam: number = DEFAULT_MAX_FILE_SIZE_BYTES
): ImageValidationResult {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) {
    return { validFiles: [], error: null, errors: [] };
  }

  let currentCount = 0;
  let maxImages = maxImagesParam;
  let maxSizeBytes = maxSizeBytesParam;

  if (typeof optionsOrCount === 'number') {
    currentCount = optionsOrCount;
  } else if (optionsOrCount && typeof optionsOrCount === 'object') {
    currentCount = optionsOrCount.currentCount ?? 0;
    maxImages = optionsOrCount.maxImages ?? DEFAULT_MAX_IMAGES;
    maxSizeBytes = optionsOrCount.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  }

  // Boundary check: Total images limit
  if (currentCount + fileArray.length > maxImages) {
    const remainingSlots = Math.max(0, maxImages - currentCount);
    const err = remainingSlots === 0
      ? `Maximum of ${maxImages} images already reached for this item.`
      : `Cannot add ${fileArray.length} images. You can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} (max ${maxImages}).`;
    return {
      validFiles: [],
      error: err,
      errors: [err],
    };
  }

  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of fileArray) {
    // MIME type or extension check
    const isImageMime = file.type.startsWith('image/');
    const hasImageExt = /\.(jpe?g|png|webp|gif|svg|avif|bmp|heic|heif)$/i.test(file.name);

    if (!isImageMime && !hasImageExt) {
      errors.push(`"${file.name}" is not a supported image file.`);
      continue;
    }

    // Size limit check
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      errors.push(`"${file.name}" (${sizeMb}MB) exceeds the maximum limit of ${limitMb}MB.`);
      continue;
    }

    validFiles.push(file);
  }

  const singleError = errors.length > 0 ? errors.join(' ') : null;

  return {
    validFiles,
    error: singleError,
    errors,
  };
}

/**
 * Revokes a blob URL safely without throwing exceptions.
 */
export function revokeBlobUrl(url?: string | null): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
}
