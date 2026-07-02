import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, EyeOff, Star, Edit } from 'lucide-react';
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
            <h1 className="text-2xl font-bold text-navy-800">إدارة الباقات</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل وحذف باقات الأسعار</p>
          </div>
          <Link
            to="/admin/pricing/new"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> إضافة باقة
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-gray-400" /></div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">لا توجد باقات</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة أول باقة</p>
            <Link to="/admin/pricing/new" className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold">
              <Plus className="w-5 h-5" /> إضافة باقة
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className={`bg-white rounded-xl shadow-sm border ${item.is_featured ? 'border-teal-500' : 'border-gray-100'} p-6 relative`}>
                {item.is_featured && (
                  <span className="absolute -top-3 right-4 bg-teal-500 text-white text-xs px-3 py-1 rounded-full font-semibold">مميز</span>
                )}
                <h3 className="text-lg font-bold text-navy-800 mb-2">{item.name}</h3>
                <p className="text-3xl font-bold text-teal-600 mb-4">{item.price} <span className="text-sm text-gray-500">ر.س</span></p>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                )}
                <ul className="space-y-2 mb-4">
                  {item.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />{f}</li>
                  ))}
                </ul>
                <div className={`text-xs font-semibold mb-3 ${item.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                  {item.is_published ? 'منشور' : 'مخفي'}
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => toggleFeatured(item)} className={`p-2 rounded-lg transition-colors ${item.is_featured ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}><Star className="w-5 h-5" /></button>
                  <button onClick={() => togglePublished(item)} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">{item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  <Link
                    to={`/admin/pricing/${item.id}/edit`}
                    className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button onClick={() => setDeleteId(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8 text-red-600" /></div>
              <h3 className="text-lg font-bold text-navy-800 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذه الباقة؟</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">إلغاء</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">حذف</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPricing;
