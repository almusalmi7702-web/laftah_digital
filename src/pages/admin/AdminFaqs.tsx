import { useState, useEffect } from 'react';
import { Plus, Pencil as Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getAllFaqs, deleteFaq, updateFaq, createFaq } from '../../services/dataService';
import { invalidateFaqs } from '../../lib/cacheInvalidation';
import { useToast } from '../../hooks/useToast';
import type { Faq } from '../../types/database';

const AdminFaqs = () => {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', is_published: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast, ToastPortal } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const data = await getAllFaqs();
      setItems(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFaq(deleteId);
      setItems(items.filter(i => i.id !== deleteId));
      invalidateFaqs();
      showToast('success', 'تم الحذف بنجاح');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (item: Faq) => {
    try {
      await updateFaq(item.id, { is_published: !item.is_published });
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i));
      invalidateFaqs();
      showToast('success', item.is_published ? 'تم إخفاء السؤال' : 'تم نشر السؤال');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ');
    }
  };

  const startEdit = (item: Faq) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, is_published: item.is_published, sort_order: item.sort_order });
    setShowForm(true);
    setError('');
  };

  const startNew = () => {
    setEditing(null);
    setForm({ question: '', answer: '', is_published: true, sort_order: 0 });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateFaq(editing.id, form);
        setItems(items.map(i => i.id === editing.id ? { ...i, ...form } : i));
        showToast('success', 'تم التعديل بنجاح');
      } else {
        const newItem = await createFaq(form);
        setItems([...items, newItem]);
        showToast('success', 'تم الحفظ بنجاح');
      }
      invalidateFaqs();
      setShowForm(false);
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء الحفظ');
      showToast('error', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      {ToastPortal}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-theme-text">إدارة الأسئلة الشائعة</h1>
            <p className="text-theme-text-secondary mt-1">إضافة وتعديل وحذف الأسئلة</p>
          </div>
          <button onClick={startNew} className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> إضافة سؤال
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-theme-text mb-4">{editing ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-theme-danger-soft border border-theme-danger/30 text-theme-danger px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">السؤال <span className="text-theme-danger">*</span></label>
                  <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-theme-input text-theme-text placeholder:text-theme-text-muted border border-theme-input-border focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">الجواب <span className="text-theme-danger">*</span></label>
                  <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required rows={4} className="w-full px-4 py-3 rounded-xl bg-theme-input text-theme-text placeholder:text-theme-text-muted border border-theme-input-border focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="faq_published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-5 h-5 rounded border-theme-input-border text-theme-primary focus:ring-theme-primary" />
                  <label htmlFor="faq_published" className="font-semibold text-theme-text">منشور</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-theme-border rounded-lg font-semibold text-theme-text-secondary hover:bg-theme-muted">إلغاء</button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-gradient-to-l from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : 'حفظ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-theme-surface rounded-xl p-12 text-center border border-theme-border">
            <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-theme-text-muted" /></div>
            <h3 className="text-lg font-bold text-theme-text mb-2">لا توجد أسئلة</h3>
            <p className="text-theme-text-secondary mb-6">ابدأ بإضافة أول سؤال</p>
            <button onClick={startNew} className="inline-flex items-center gap-2 bg-theme-primary text-white px-6 py-3 rounded-lg font-semibold"><Plus className="w-5 h-5" /> إضافة سؤال</button>
          </div>
        ) : (
          <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-theme-muted border-b border-theme-border">
                  <tr>
                    <th className="text-right px-6 py-4 font-semibold text-theme-text whitespace-nowrap">السؤال</th>
                    <th className="text-right px-6 py-4 font-semibold text-theme-text whitespace-nowrap">الحالة</th>
                    <th className="text-center px-6 py-4 font-semibold text-theme-text whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-theme-border hover:bg-theme-muted transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <p className="font-bold text-theme-text truncate">{item.question}</p>
                        <p className="text-theme-text-secondary text-sm truncate">{item.answer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.is_published ? 'bg-theme-success-soft text-theme-success' : 'bg-theme-muted text-theme-text-secondary'}`}>
                          {item.is_published ? 'منشور' : 'مخفي'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => togglePublished(item)} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors">
                            {item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          <button onClick={() => startEdit(item)} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                          <button onClick={() => setDeleteId(item.id)} className="p-2 text-theme-text-secondary hover:text-theme-danger hover:bg-theme-danger-soft rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-theme-danger-soft rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-theme-danger" /></div>
              <h3 className="text-lg font-bold text-theme-text mb-2">تأكيد الحذف</h3>
              <p className="text-theme-text-secondary mb-6">هل أنت متأكد من حذف هذا السؤال؟</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-theme-border rounded-lg font-semibold text-theme-text-secondary hover:bg-theme-muted">إلغاء</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-theme-danger text-white rounded-lg font-semibold hover:opacity-90">حذف</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminFaqs;
