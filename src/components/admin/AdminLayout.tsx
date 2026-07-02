import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Layers, Tag, HelpCircle,
  Settings, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LOGO_PATH } from '../../data/content';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
  { icon: Briefcase, label: 'الأعمال', path: '/admin/portfolio' },
  { icon: Layers, label: 'الخدمات', path: '/admin/services' },
  { icon: Tag, label: 'الباقات', path: '/admin/pricing' },
  { icon: HelpCircle, label: 'الأسئلة الشائعة', path: '/admin/faqs' },
  { icon: Settings, label: 'الإعدادات', path: '/admin/settings' },
];

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed top-0 right-0 z-50 h-full w-64 bg-navy-800 text-white transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <img
              src={LOGO_PATH}
              alt="Laftah Digital"
              style={{ maxWidth: '100px', height: 'auto', width: 'auto' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive(item.path) && (
                    <ChevronLeft className="w-4 h-4 mr-auto" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">مدير</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            تسجيل خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:mr-64 w-full">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6 text-navy-800" />
            </button>

            <img
              src={LOGO_PATH}
              alt="Laftah Digital"
              style={{ maxWidth: '85px', height: 'auto', width: 'auto' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
