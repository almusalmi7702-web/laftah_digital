import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAllServices, deleteService, updateService } from '../../services/dataService';
import { useToast } from '../../hooks/useToast';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import type { Service } from '../../types/database';

const AdminServices = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast, ToastPortal } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const data = await getAllServices();
      setItems(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteService(deleteId);
      setItems(items.filter(item => item.id !== deleteId));
      showToast('success', 'تم الحذف بنجاح');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (item: Service) => {
    try {
      await updateService(item.id, { is_published: !item.is_published });
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i));
      showToast('success', item.is_published ? 'تم إخفاء الخدمة' : 'تم نشر الخدمة');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <>
      {ToastPortal}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-theme-text">إدارة الخدمات</h1>
            <p className="text-theme-text-secondary mt-1">إضافة وتعديل وحذف الخدمات</p>
          </div>
          <Link to="/admin/services/new" className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> إضافة خدمة جديدة
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-theme-surface rounded-xl p-12 text-center border border-theme-border">
            <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-theme-text-muted" /></div>
            <h3 className="text-lg font-bold text-theme-text mb-2">لا توجد خدمات</h3>
            <p className="text-theme-text-secondary mb-6">ابدأ بإضافة أول خدمة</p>
            <Link to="/admin/services/new" className="inline-flex items-center gap-2 bg-theme-primary text-white px-6 py-3 rounded-lg font-semibold"><Plus className="w-5 h-5" /> إضافة خدمة</Link>
          </div>
        ) : (
          /* Mobile: cards, Desktop: table with horizontal scroll fallback */
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-theme-muted border-b border-theme-border">
                    <tr>
                      <th className="text-right px-6 py-4 font-semibold text-theme-text whitespace-nowrap">الخدمة</th>
                      <th className="text-right px-6 py-4 font-semibold text-theme-text whitespace-nowrap">الحالة</th>
                      <th className="text-right px-6 py-4 font-semibold text-theme-text whitespace-nowrap">الترتيب</th>
                      <th className="text-center px-6 py-4 font-semibold text-theme-text whitespace-nowrap">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-theme-border hover:bg-theme-muted transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg overflow-hidden">
                                <ImagePlaceholder />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-theme-text">{item.title}</p>
                              <p className="text-theme-text-secondary text-sm line-clamp-1">{item.short_description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.is_published ? 'bg-theme-success-soft text-theme-success' : 'bg-theme-muted text-theme-text-secondary'}`}>
                            {item.is_published ? 'منشور' : 'مخفي'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-theme-text-secondary">{item.sort_order}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => togglePublished(item)} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors">{item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                            <Link to={`/admin/services/${item.id}/edit`} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors"><Edit className="w-5 h-5" /></Link>
                            <button onClick={() => setDeleteId(item.id)} className="p-2 text-theme-text-secondary hover:text-theme-danger hover:bg-theme-danger-soft rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-theme-surface rounded-xl shadow-sm border border-theme-border p-4">
                  <div className="flex items-start gap-3">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <ImagePlaceholder />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-theme-text">{item.title}</p>
                      <p className="text-theme-text-secondary text-sm line-clamp-1">{item.short_description}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${item.is_published ? 'bg-theme-success-soft text-theme-success' : 'bg-theme-muted text-theme-text-secondary'}`}>
                        {item.is_published ? 'منشور' : 'مخفي'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-theme-border">
                    <button onClick={() => togglePublished(item)} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors">{item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    <Link to={`/admin/services/${item.id}/edit`} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors"><Edit className="w-5 h-5" /></Link>
                    <button onClick={() => setDeleteId(item.id)} className="p-2 text-theme-text-secondary hover:text-theme-danger hover:bg-theme-danger-soft rounded-lg transition-colors mr-auto"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-theme-danger-soft rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-theme-danger" /></div>
              <h3 className="text-lg font-bold text-theme-text mb-2">تأكيد الحذف</h3>
              <p className="text-theme-text-secondary mb-6">هل أنت متأكد من حذف هذه الخدمة؟</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-theme-border rounded-lg font-semibold text-theme-text-secondary hover:bg-theme-muted">إلغاء</button>
                <button onClick={handleDelete} className="flex-1 px-2 py-2.5 bg-theme-danger text-white rounded-lg font-semibold hover:opacity-90">حذف</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminServices;
