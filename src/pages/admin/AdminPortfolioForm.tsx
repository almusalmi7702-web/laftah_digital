import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import {
  getPortfolioItemById, createPortfolioItem, updatePortfolioItem
} from '../../services/dataService';
import { useToast } from '../../hooks/useToast';
import ImageUpload from '../../components/admin/ImageUpload';
import { generateSlug, sanitizeSlug } from '../../utils/slug';
import type { PortfolioInsert } from '../../types/database';

const AdminPortfolioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { showToast, ToastPortal } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    details: '',
    category: '',
    thumbnail_url: '' as string | null,
    external_url: '',
    project_date: '',
    is_published: true,
    sort_order: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    setError('');
    try {
      const item = await getPortfolioItemById(id!);
      if (item) {
        setForm({
          title: item.title || '',
          slug: item.slug || '',
          short_description: item.short_description || '',
          details: item.details || '',
          category: item.category || '',
          thumbnail_url: item.thumbnail_url || null,
          external_url: item.external_url || '',
          project_date: item.project_date || '',
          is_published: item.is_published ?? true,
          sort_order: item.sort_order || 0,
        });
      } else {
        setError('لم يتم العثور على العمل');
      }
    } catch (err: any) {
      console.error('Error fetching:', err);
      setError(err.message || 'خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError('');
    setSaving(true);

    try {
      const slug = generateSlug('work', form.title);
      const userSlug = sanitizeSlug(form.slug);
      const finalSlug = userSlug || slug;

      const data: PortfolioInsert = {
        title: form.title.trim(),
        slug: finalSlug,
        short_description: form.short_description.trim() || null,
        details: form.details.trim() || null,
        category: form.category.trim() || null,
        thumbnail_url: form.thumbnail_url?.trim() || null,
        external_url: form.external_url.trim() || null,
        project_date: form.project_date || null,
        is_published: form.is_published,
        sort_order: form.sort_order,
      };

      if (isEdit && id) {
        await updatePortfolioItem(id, data);
        showToast('success', 'تم التعديل بنجاح');
      } else {
        await createPortfolioItem(data);
        showToast('success', 'تم الحفظ بنجاح');
      }

      navigate('/admin/portfolio', { replace: true });
    } catch (err: any) {
      console.error('Error saving:', err);
      const msg = err.message || '';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('الرابط (slug) مستخدم بالفعل. يرجى استخدام رابط مختلف.');
      } else {
        setError(msg || 'حدث خطأ أثناء الحفظ');
      }
      showToast('error', 'حدث خطأ أثناء الحفظ');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {ToastPortal}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/portfolio" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-800">
              {isEdit ? 'تعديل العمل' : 'إضافة عمل جديد'}
            </h1>
            <p className="text-gray-500 mt-1">أدخل تفاصيل العمل</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-navy-800 font-semibold text-sm mb-2">
                عنوان العمل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-navy-800 font-semibold text-sm mb-2">
                الرابط (slug)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="يتم إنشاؤه تلقائياً"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <ImageUpload
            bucket="portfolio"
            value={form.thumbnail_url}
            onChange={(url) => setForm({ ...form, thumbnail_url: url })}
            label="صورة العمل (موصى به: 1200×675)"
          />

          <div>
            <label className="block text-navy-800 font-semibold text-sm mb-2">وصف مختصر</label>
            <textarea
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-navy-800 font-semibold text-sm mb-2">التفاصيل</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-navy-800 font-semibold text-sm mb-2">التصنيف</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="مثال: منشورات سوشيال ميديا"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-navy-800 font-semibold text-sm mb-2">تاريخ المشروع</label>
              <input
                type="date"
                value={form.project_date}
                onChange={(e) => setForm({ ...form, project_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-navy-800 font-semibold text-sm mb-2">رابط خارجي</label>
            <input
              type="url"
              value={form.external_url}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              dir="ltr"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-navy-800 font-semibold text-sm mb-2">الترتيب</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <label htmlFor="is_published" className="font-semibold text-navy-800">منشور</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link to="/admin/portfolio" className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="px-6 py-3 bg-gradient-to-l from-teal-500 to-teal-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminPortfolioForm;
