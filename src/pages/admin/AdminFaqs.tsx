import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAllFaqs, deleteFaq, updateFaq, createFaq } from '../../services/dataService';
import type { Faq } from '../../types/database';

const AdminFaqs = () => {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', is_published: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);

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
    } catch (error) {
      alert('حدث خطأ');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (item: Faq) => {
    try {
      await updateFaq(item.id, { is_published: !item.is_published });
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i));
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (item: Faq) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, is_published: item.is_published, sort_order: item.sort_order });
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setForm({ question: '', answer: '', is_published: true, sort_order: 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateFaq(editing.id, form);
        setItems(items.map(i => i.id === editing.id ? { ...i, ...form } : i));
      } else {
        const newItem = await createFaq(form);
        setItems([...items, newItem]);
      }
      setShowForm(false);
    } catch (error) {
      alert('حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">إدارة الأسئلة الشائعة</h1>
          <p className="text-gray-500 mt-1">إضافة وتعديل وحذف الأسئلة</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> إضافة سؤال
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-navy-800 mb-4">{editing ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-navy-800 font-semibold text-sm mb-2">السؤال <span className="text-red-500">*</span></label>
                <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-navy-800 font-semibold text-sm mb-2">الجواب <span className="text-red-500">*</span></label>
                <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="faq_published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-teal-500" />
                <label htmlFor="faq_published" className="font-semibold text-navy-800">منشور</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">إلغاء</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-gray-400" /></div>
          <h3 className="text-lg font-bold text-navy-800 mb-2">لا توجد أسئلة</h3>
          <p className="text-gray-500 mb-6">ابدأ بإضافة أول سؤال</p>
          <button onClick={startNew} className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold"><Plus className="w-5 h-5" /> إضافة سؤال</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-6 py-4 font-semibold text-navy-800">السؤال</th>
                <th className="text-right px-6 py-4 font-semibold text-navy-800">الحالة</th>
                <th className="text-center px-6 py-4 font-semibold text-navy-800">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="font-bold text-navy-800 truncate">{item.question}</p>
                    <p className="text-gray-500 text-sm truncate">{item.answer}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.is_published ? 'منشور' : 'مخفي'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => togglePublished(item)} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        {item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button onClick={() => startEdit(item)} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-red-600" /></div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا السؤال؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">إلغاء</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFaqs;
