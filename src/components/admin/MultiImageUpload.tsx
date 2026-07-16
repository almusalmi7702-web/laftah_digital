import { useRef, useState } from 'react';
import {
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MultiImageUploadProps {
  bucket: 'portfolio' | 'services' | 'uploads';
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxSizeMB?: number;
  maxImages?: number;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const UPLOAD_TIMEOUT_MS = 20000;

const withTimeout = async <T,>(
  promise: PromiseLike<T>,
  ms: number = UPLOAD_TIMEOUT_MS
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('upload-timeout'));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const getExtensionFromFile = (file: File): string => {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';

  return 'jpg';
};

const getFriendlyUploadError = (error: any): string => {
  const message = String(
    error?.message ||
      error?.error_description ||
      error ||
      ''
  ).toLowerCase();

  const statusCode = String(
    error?.statusCode ||
      error?.status ||
      ''
  );

  if (message.includes('upload-timeout')) {
    return 'استغرق رفع الصور وقتًا طويلًا. تحقق من الاتصال وحاول مرة أخرى.';
  }

  if (
    message.includes('bucket not found') ||
    message.includes('bucket') ||
    message.includes('not found')
  ) {
    return 'حاوية الصور غير موجودة في Supabase. تأكد من إنشاء bucket باسم صحيح.';
  }

  if (
    statusCode === '401' ||
    statusCode === '403' ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('permission') ||
    message.includes('policy') ||
    message.includes('row-level security') ||
    message.includes('rls')
  ) {
    return 'لا توجد صلاحية لرفع الصور. تحقق من سياسات Supabase Storage.';
  }

  return 'حدث خطأ أثناء رفع الصور. تحقق من الاتصال أو إعدادات Supabase Storage.';
};

const MultiImageUpload = ({
  bucket,
  value,
  onChange,
  label = 'صور الخدمة',
  maxSizeMB = 5,
  maxImages,
}: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value)
    ? value.filter(Boolean)
    : [];

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    setError('');

    if (
      maxImages &&
      images.length + files.length > maxImages
    ) {
      setError(`الحد الأقصى المسموح هو ${maxImages} صور.`);
      event.target.value = '';
      return;
    }

    const unsupportedFile = files.find(
      (file) => !ACCEPTED_TYPES.includes(file.type)
    );

    if (unsupportedFile) {
      setError('صيغة إحدى الصور غير مدعومة. استخدم JPG أو PNG أو WebP.');
      event.target.value = '';
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const largeFile = files.find(
      (file) => file.size > maxSizeBytes
    );

    if (largeFile) {
      setError(
        `حجم إحدى الصور كبير. الحد الأقصى لكل صورة هو ${maxSizeMB}MB.`
      );
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await withTimeout(
        supabase.auth.getSession(),
        10000
      );

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        setError('يجب تسجيل الدخول قبل رفع الصور.');
        return;
      }

      const uploadedImages = [...images];

      for (const file of files) {
        const extension = getExtensionFromFile(file);
        const dateFolder = new Date()
          .toISOString()
          .slice(0, 10);

        const randomPart =
          typeof crypto !== 'undefined' &&
          'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);

        const filePath =
          `${dateFolder}/${Date.now()}-${randomPart}.${extension}`;

        const { error: uploadError } = await withTimeout(
          supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type,
            })
        );

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error('public-url-not-created');
        }

        uploadedImages.push(publicUrlData.publicUrl);

        // الاحتفاظ بالصور التي نجح رفعها حتى لو تعثر رفع صورة لاحقة
        onChange([...uploadedImages]);
      }
    } catch (uploadError: any) {
      console.error('Multiple images upload error:', uploadError);
      setError(getFriendlyUploadError(uploadError));
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
    setError('');
  };

  const moveImage = (
    index: number,
    direction: -1 | 1
  ) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= images.length
    ) {
      return;
    }

    const nextImages = [...images];

    [nextImages[index], nextImages[targetIndex]] = [
      nextImages[targetIndex],
      nextImages[index],
    ];

    onChange(nextImages);
  };

  return (
    <div>
      <label className="block text-theme-text font-semibold text-sm mb-2">
        {label}
      </label>

      {images.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {images.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              className="relative group rounded-xl overflow-hidden border border-theme-input-border bg-theme-muted"
            >
              <div className="aspect-video w-full">
                <img
                  src={imageUrl}
                  alt={`صورة الخدمة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="absolute top-2 right-2 min-w-7 h-7 px-2 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 left-2 bg-theme-danger text-white p-2 rounded-lg hover:opacity-90 transition-colors shadow-lg"
                title="إزالة الصورة"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {images.length > 1 && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="bg-black/60 text-white p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    title="تقديم الصورة في الترتيب"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="bg-black/60 text-white p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    title="تأخير الصورة في الترتيب"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {index === 0 && (
                <span className="absolute bottom-2 right-2 bg-theme-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                  الصورة الرئيسية
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={
          uploading ||
          Boolean(maxImages && images.length >= maxImages)
        }
        className="w-full aspect-video max-h-52 rounded-xl border-2 border-dashed border-theme-input-border hover:border-theme-primary hover:bg-theme-primary-soft transition-all flex flex-col items-center justify-center gap-2 text-theme-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
            <span className="text-sm font-semibold">
              جاري رفع الصور...
            </span>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-theme-primary-soft flex items-center justify-center">
              <Upload className="w-6 h-6 text-theme-primary" />
            </div>

            <span className="text-sm font-semibold">
              اضغط لإضافة صور
            </span>

            <span className="text-xs text-theme-text-muted">
              يمكنك اختيار صورة واحدة أو عدة صور
            </span>

            <span className="text-xs text-theme-text-muted">
              JPG, PNG, WebP — حتى {maxSizeMB}MB لكل صورة
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-theme-text-muted">
              <ImageIcon className="w-3 h-3" />
              سيتم حفظ الصور في Supabase Storage
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="text-theme-danger text-sm mt-2 leading-relaxed">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MultiImageUpload;
