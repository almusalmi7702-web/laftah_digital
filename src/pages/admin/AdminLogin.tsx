import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LOGO_PATH } from '../../data/content';
import ThemeToggle from '../../components/ThemeToggle';

const AdminLogin = () => {
  const { signIn, user, isAdmin, loading: authLoading, adminChecked } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Still resolving session/admin: show spinner, not the login form.
  if (authLoading || (user && !adminChecked)) {
    return (
      <div className="min-h-screen bg-theme-page flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-theme-text-secondary text-sm">جاري التحقق من الصلاحية...</p>
        </div>
      </div>
    );
  }

  // Fully verified admin — redirect immediately, no setTimeout.
  if (user && isAdmin && adminChecked) {
    const from =
      (location.state as { from?: { pathname: string } })?.from?.pathname ||
      '/admin';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, onAuthStateChange fires and the redirect above takes over.
  };

  return (
    <div className="min-h-screen bg-theme-page flex items-center justify-center p-4" dir="rtl">
      <div className="absolute top-5 left-5">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full">
        <div className="bg-theme-surface rounded-2xl shadow-theme-elevated border border-theme-border p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4 rounded-2xl bg-theme-muted p-3">
              <img
                src={LOGO_PATH}
                alt="Laftah Digital"
                style={{ maxWidth: '120px', height: 'auto', width: 'auto' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h1 className="text-xl font-bold text-theme-text">لوحة التحكم</h1>
            <p className="text-theme-text-secondary text-sm mt-1">سجل دخول للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-theme-text font-semibold text-sm mb-2 text-right">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-theme-text font-semibold text-sm mb-2 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-theme-danger-soft border border-theme-danger/30 text-theme-danger px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-teal-500 to-teal-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  دخول لوحة التحكم
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-theme-primary text-sm font-medium hover:underline"
            >
              العودة للموقع الرئيسي
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
