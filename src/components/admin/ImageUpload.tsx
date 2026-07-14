import { useState, useRef } from 'react';
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  bucket: 'portfolio' | 'services' | 'uploads';
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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
  const message = String(error?.message || error?.error_description || error || '').toLowerCase();
  const statusCode = String(error?.statusCode || error?.status || '');

  if (message.includes('upload-timeout')) {
    return 'استغرق رفع الصورة وقتًا طويلًا. تحقق من الاتصال وحاول مرة أخرى.';
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

  if (message.includes('duplicate') || message.includes('already exists')) {
    return 'الصورة موجودة مسبقًا. حاول رفعها مرة أخرى باسم مختلف.';
  }

  return 'حدث خطأ أثناء رفع الصورة. افتح Console لمعرفة الخطأ الحقيقي أو تحقق من إعدادات Supabase Storage.';
};

const ImageUpload = ({
  bucket,
  value,
  onChange,
  label = 'الصورة',
  maxSizeMB = 5,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.');
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`حجم الصورة كبير. الحد الأقصى ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await withTimeout(supabase.auth.getSession(), 10000);

      if (sessionError) {
        console.error('Upload session error:', sessionError);
        setError('حدث خطأ في التحقق من تسجيل الدخول. حاول تسجيل الدخول مرة أخرى.');
        return;
      }

      if (!session) {
        setError('يجب تسجيل الدخول قبل رفع الصور.');
        return;
      }

      const ext = getExtensionFromFile(file);
      const dateFolder = new Date().toISOString().slice(0, 10);
      const randomPart =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      const filePath = `${dateFolder}/${Date.now()}-${randomPart}.${ext}`;

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

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      console.error('Upload error details:', err);
      setError(getFriendlyUploadError(err));
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError('');
  };

  return (
    <div>
      <label className="block text-theme-text font-semibold text-sm mb-2">{label}</label>

      {value ? (
        <div className="relative group">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-theme-input-border bg-theme-muted">
            <img src={value} alt="معاينة" className="w-full h-full object-cover" />
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 left-2 bg-theme-danger text-white p-2 rounded-lg hover:opacity-90 transition-colors shadow-lg md:opacity-0 md:group-hover:opacity-100"
            title="إزالة الصورة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-theme-input-border hover:border-theme-primary hover:bg-theme-primary-soft transition-all flex flex-col items-center justify-center gap-2 text-theme-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
              <span className="text-sm font-semibold">جاري الرفع...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-theme-primary-soft flex items-center justify-center">
                <Upload className="w-6 h-6 text-theme-primary" />
              </div>
              <span className="text-sm font-semibold">اضغط لرفع صورة</span>
              <span className="text-xs text-theme-text-muted">JPG, PNG, WebP — حتى {maxSizeMB}MB</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-theme-text-muted">
                <ImageIcon className="w-3 h-3" />
                سيتم حفظ الصورة في Supabase Storage
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-theme-danger text-sm mt-2 leading-relaxed">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
