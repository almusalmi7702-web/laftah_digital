import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAllServices, deleteService, updateService } from '../../services/dataService';
import type { Service } from '../../types/database';

const AdminServices = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

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
    } catch (error) {
      console.error('Error deleting:', error);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (item: Service) => {
    try {
      await updateService(item.id, { is_published: !item.is_published });
      setItems(items.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i));
    } catch (error) {
      console.error('Error updating:', error);
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">إدارة الخدمات</h1>
          <p className="text-gray-500 mt-1">إضافة وتعديل وحذف الخدمات</p>
        </div>
        <Link
          to="/admin/services/new"
          className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة خدمة جديدة
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-navy-800 mb-2">لا توجد خدمات</h3>
          <p className="text-gray-500 mb-6">ابدأ بإضافة أول خدمة</p>
          <Link
            to="/admin/services/new"
            className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            إضافة خدمة
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-6 py-4 font-semibold text-navy-800">الخدمة</th>
                <th className="text-right px-6 py-4 font-semibold text-navy-800">الحالة</th>
                <th className="text-right px-6 py-4 font-semibold text-navy-800">الترتيب</th>
                <th className="text-center px-6 py-4 font-semibold text-navy-800">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          بدون
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-navy-800">{item.title}</p>
                        <p className="text-gray-500 text-sm line-clamp-1">{item.short_description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.is_published ? 'منشور' : 'مخفي'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => togglePublished(item)}
                        className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        {item.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <Link
                        to={`/admin/services/${item.id}/edit`}
                        className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذه الخدمة؟</p>
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

export default AdminServices;
