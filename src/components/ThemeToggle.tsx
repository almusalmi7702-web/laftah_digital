import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-theme-muted hover:bg-theme-elevated text-theme-text transition-colors duration-200 flex-shrink-0 ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;
