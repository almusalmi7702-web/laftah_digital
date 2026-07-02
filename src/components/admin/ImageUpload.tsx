import { useState, useRef } from 'react';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  bucket: 'portfolio' | 'services' | 'uploads';
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
      setError('صيغة الصورة غير مدعومة. يُسمح بـ JPG, PNG, WebP فقط.');
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`حجم الصورة كبير جدًا. الحد الأقصى ${maxSizeMB} ميجابايت.`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${bucket}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('حدث خطأ أثناء رفع الصورة. تأكد من تسجيل الدخول وحاول مرة أخرى.');
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
      <label className="block text-navy-800 font-semibold text-sm mb-2">{label}</label>
      {value ? (
        <div className="relative group">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
            <img src={value} alt="معاينة" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
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
          className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              <span className="text-sm font-semibold">جاري الرفع...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                <Upload className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-sm font-semibold">اضغط لرفع صورة</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP — حتى {maxSizeMB}MB</span>
            </>
          )}
        </button>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
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
