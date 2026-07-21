export interface ImageCompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
  width: number;
  height: number;
}

interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetSizeKB?: number;
  initialQuality?: number;
  minimumQuality?: number;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const decodeImage = async (
  file: File,
): Promise<DecodedImage> => {
  if (
    typeof window !== 'undefined' &&
    'createImageBitmap' in window
  ) {
    try {
      const bitmap = await window.createImageBitmap(file);

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // استخدام الطريقة البديلة أدناه
    }
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  image.decoding = 'async';

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error('image-decode-failed'));

    image.src = objectUrl;
  });

  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
) => {
  const scale = Math.min(
    1,
    maxWidth / originalWidth,
    maxHeight / originalHeight,
  );

  return {
    width: Math.max(
      1,
      Math.round(originalWidth * scale),
    ),
    height: Math.max(
      1,
      Math.round(originalHeight * scale),
    ),
  };
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('image-compression-failed'));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });

const encodeCanvas = async (
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> => {
  const webpBlob = await canvasToBlob(
    canvas,
    'image/webp',
    quality,
  );

  if (webpBlob.type === 'image/webp') {
    return webpBlob;
  }

  return canvasToBlob(
    canvas,
    'image/jpeg',
    quality,
  );
};

const removeFileExtension = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, '');

export const compressImageForUpload = async (
  file: File,
  options: ImageCompressionOptions = {},
): Promise<ImageCompressionResult> => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('unsupported-image-type');
  }

  const {
    maxWidth = 1600,
    maxHeight = 1200,
    targetSizeKB = 400,
    initialQuality = 0.82,
    minimumQuality = 0.58,
  } = options;

  const targetSizeBytes = targetSizeKB * 1024;
  const decodedImage = await decodeImage(file);

  try {
    const initialDimensions = calculateDimensions(
      decodedImage.width,
      decodedImage.height,
      maxWidth,
      maxHeight,
    );

    const dimensionsChanged =
      initialDimensions.width !== decodedImage.width ||
      initialDimensions.height !== decodedImage.height;

    if (
      file.size <= targetSizeBytes &&
      !dimensionsChanged
    ) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        wasCompressed: false,
        width: decodedImage.width,
        height: decodedImage.height,
      };
    }

    let width = initialDimensions.width;
    let height = initialDimensions.height;
    let finalBlob: Blob | null = null;

    /*
     * في كل دورة نقلل الجودة أولًا.
     * إذا بقي الحجم كبيرًا، نقلل الأبعاد قليلًا
     * ونحاول مرة أخرى.
     */
    for (let dimensionAttempt = 0; dimensionAttempt < 6; dimensionAttempt += 1) {
      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d', {
        alpha: true,
      });

      if (!context) {
        throw new Error('canvas-context-failed');
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      context.drawImage(
        decodedImage.source,
        0,
        0,
        width,
        height,
      );

      let quality = initialQuality;

      while (quality >= minimumQuality) {
        finalBlob = await encodeCanvas(
          canvas,
          quality,
        );

        if (finalBlob.size <= targetSizeBytes) {
          break;
        }

        quality -= 0.06;
      }

      if (
        finalBlob &&
        finalBlob.size <= targetSizeBytes
      ) {
        break;
      }

      /*
       * لا نصغر الصورة بلا حدود.
       * 800 بكسل ما زال مناسبًا لمعظم بطاقات الموقع.
       */
      if (width <= 800 && height <= 800) {
        break;
      }

      width = Math.max(
        1,
        Math.round(width * 0.88),
      );

      height = Math.max(
        1,
        Math.round(height * 0.88),
      );
    }

    if (!finalBlob) {
      throw new Error('image-compression-failed');
    }

    const extension =
      finalBlob.type === 'image/webp'
        ? 'webp'
        : 'jpg';

    const compressedFile = new File(
      [finalBlob],
      `${removeFileExtension(file.name)}.${extension}`,
      {
        type: finalBlob.type,
        lastModified: Date.now(),
      },
    );

    /*
     * إذا نتج ملف أكبر من الأصل، نحتفظ بالأصل.
     */
    if (
      compressedFile.size >= file.size &&
      file.size <= targetSizeBytes
    ) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        wasCompressed: false,
        width: decodedImage.width,
        height: decodedImage.height,
      };
    }

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      wasCompressed: true,
      width,
      height,
    };
  } finally {
    decodedImage.cleanup();
  }
};
