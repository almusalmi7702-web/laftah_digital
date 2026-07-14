import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, EyeOff, Star, CreditCard as Edit } from 'lucide-react';
import { getAllPricingPlans, deletePricingPlan, updatePricingPlan } from '../../services/dataService';
import { useToast } from '../../hooks/useToast';
import type { PricingPlan } from '../../types/database';

const AdminPricing = () => {
  const [items, setItems] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast, ToastPortal } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const data = await getAllPricingPlans();
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
      await deletePricingPlan(deleteId);
      setItems(items.filter(i => i.id !== deleteId));
      showToast('success', 'تم الحذف بنجاح');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (item: PricingPlan) => {
    try {
      await updatePricingPlan(item.id, { is_published: !item.is_published });
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i));
      showToast('success', item.is_published ? 'تم إخفاء الباقة' : 'تم نشر الباقة');
    } catch (error: any) {
      showToast('error', error.message || 'حدث خطأ');
    }
  };

  const toggleFeatured = async (item: PricingPlan) => {
    try {
      await updatePricingPlan(item.id, { is_featured: !item.is_featured });
      setItems(items.map(i => i.id === item.id ? { ...i, is_featured: !i.is_featured } : i));
      showToast('success', item.is_featured ? 'تم إلغاء التمييز' : 'تم تمييز الباقة');
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
            <h1 className="text-2xl font-bold text-theme-text">إدارة الباقات</h1>
            <p className="text-theme-text-secondary mt-1">إضافة وتعديل وحذف باقات الأسعار</p>
          </div>
          <Link
            to="/admin/pricing/new"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> إضافة باقة
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-theme-surface rounded-xl p-12 text-center border border-theme-border">
            <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-theme-text-muted" /></div>
            <h3 className="text-lg font-bold text-theme-text mb-2">لا توجد باقات</h3>
            <p className="text-theme-text-secondary mb-6">ابدأ بإضافة أول باقة</p>
            <Link to="/admin/pricing/new" className="inline-flex items-center gap-2 bg-theme-primary text-white px-6 py-3 rounded-lg font-semibold">
              <Plus className="w-5 h-5" /> إضافة باقة
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className={`bg-theme-surface rounded-xl shadow-sm border ${item.is_featured ? 'border-teal-500' : 'border-theme-border'} p-6 relative`}>
                {item.is_featured && (
                  <span className="absolute -top-3 right-4 bg-theme-primary text-white text-xs px-3 py-1 rounded-full font-semibold">مميز</span>
                )}
                <h3 className="text-lg font-bold text-theme-text mb-2">{item.name}</h3>
                <p className="text-3xl font-bold text-theme-primary mb-4">{item.price} <span className="text-sm text-theme-text-secondary">ر.س</span></p>
                {item.description && (
                  <p className="text-theme-text-secondary text-sm mb-4">{item.description}</p>
                )}
                <ul className="space-y-2 mb-4">
                  {item.features.map((f, i) => (
                    <li key={i} className="text-sm text-theme-text-secondary flex items-center gap-2"><span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />{f}</li>
                  ))}
                </ul>
                <div className={`text-xs font-semibold mb-3 ${item.is_published ? 'text-theme-success' : 'text-theme-text-secondary'}`}>
                  {item.is_published ? 'منشور' : 'مخفي'}
                </div>
                <div className="flex gap-2 pt-3 border-t border-theme-border">
                  <button onClick={() => toggleFeatured(item)} className={`p-2 rounded-lg transition-colors ${item.is_featured ? 'bg-theme-primary-soft text-theme-primary' : 'text-theme-text-muted hover:text-yellow-500 hover:bg-theme-warning-soft'}`}><Star className="w-5 h-5" /></button>
                  <button onClick={() => togglePublished(item)} className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors">{item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  <Link
                    to={`/admin/pricing/${item.id}/edit`}
                    className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-soft rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button onClick={() => setDeleteId(item.id)} className="p-2 text-theme-text-secondary hover:text-theme-danger hover:bg-theme-danger-soft rounded-lg transition-colors mr-auto"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-theme-danger-soft rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-theme-danger" /></div>
              <h3 className="text-lg font-bold text-theme-text mb-2">تأكيد الحذف</h3>
              <p className="text-theme-text-secondary mb-6">هل أنت متأكد من حذف هذه الباقة؟</p>
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

export default AdminPricing;
