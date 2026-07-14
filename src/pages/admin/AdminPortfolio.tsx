import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  getAllPortfolioItems, deletePortfolioItem, updatePortfolioItem
} from '../../services/dataService';
import { useToast } from '../../hooks/useToast';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import type { PortfolioItem } from '../../types/database';

const AdminPortfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast, ToastPortal } = useToast();

  const fetchItems = async () => {
    try {
      const data = await getAllPortfolioItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePortfolioItem(deleteId);
      setItems(items.filter(item => item.id !== deleteId));
      showToast('success', 'تم الحذف بنجاح');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (item: PortfolioItem) => {
    try {
      await updatePortfolioItem(item.id, { is_published: !item.is_published });
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i));
      showToast('success', item.is_published ? 'تم إخفاء العمل' : 'تم نشر العمل');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <>
      {ToastPortal}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-theme-text">إدارة الأعمال</h1>
            <p className="text-theme-text-secondary mt-1">إضافة وتعديل وحذف الأعمال</p>
          </div>
          <Link to="/admin/portfolio/new" className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> إضافة عمل جديد
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-theme-surface rounded-xl p-12 text-center border border-theme-border">
            <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-theme-text-muted" /></div>
            <h3 className="text-lg font-bold text-theme-text mb-2">لا توجد أعمال</h3>
            <p className="text-theme-text-secondary mb-6">ابدأ بإضافة أول عمل لك</p>
            <Link to="/admin/portfolio/new" className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold"><Plus className="w-5 h-5" /> إضافة عمل</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-theme-surface rounded-xl shadow-theme-card border border-theme-border overflow-hidden hover:shadow-theme-elevated transition-all">
                <div className="aspect-video bg-theme-muted relative">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${item.is_published ? 'bg-theme-success-soft text-theme-success' : 'bg-theme-muted text-theme-text-muted'}`}>
                    {item.is_published ? 'منشور' : 'مخفي'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-theme-text mb-1">{item.title}</h3>
                  <p className="text-theme-text-secondary text-sm line-clamp-2">{item.short_description}</p>
                  {item.category && (
                    <span className="inline-block bg-theme-primary-soft text-theme-primary text-xs px-2 py-1 rounded mt-2">{item.category}</span>
                  )}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-theme-border">
                    <button onClick={() => togglePublished(item)} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors" title={item.is_published ? 'إخفاء' : 'نشر'}>
                      {item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <Link to={`/admin/portfolio/${item.id}/edit`} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors" title="تعديل">
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button onClick={() => setDeleteId(item.id)} className="p-2 text-theme-text-secondary hover:text-theme-danger hover:bg-theme-danger-soft rounded-lg transition-colors mr-auto" title="حذف">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-xl p-6 max-w-sm w-full text-center border border-theme-border">
              <div className="w-16 h-16 bg-theme-danger-soft rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-theme-danger" /></div>
              <h3 className="text-lg font-bold text-theme-text mb-2">تأكيد الحذف</h3>
              <p className="text-theme-text-secondary mb-6">هل أنت متأكد من حذف هذا العمل؟</p>
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

export default AdminPortfolio;
