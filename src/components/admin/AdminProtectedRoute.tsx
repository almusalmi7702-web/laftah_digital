import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAdmin, loading, user, adminChecked } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-theme-text-secondary">جاري التحقق من الصلاحية...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin && adminChecked) {
    return (
      <div className="min-h-screen bg-theme-page flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md bg-theme-surface p-8 rounded-2xl shadow-theme-elevated border border-theme-border">
          <div className="w-16 h-16 bg-theme-danger-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-theme-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-theme-text mb-2">وصول مرفوض</h2>
          <p className="text-theme-text-secondary mb-6">ليس لديك صلاحية للوصول إلى لوحة التحكم.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-theme-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-theme-primary-hover transition-colors"
          >
            العودة للموقع
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
