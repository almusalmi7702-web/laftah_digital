import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { LOGO_PATH, nav, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ThemeToggle from './ThemeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: nav.home,      to: '/' },
  { label: nav.about,     to: '/about' },
  { label: nav.services,  to: '/services' },
  { label: nav.pricing,   to: '/pricing' },
  { label: nav.portfolio, to: '/portfolio' },
  { label: nav.faqs,      to: '/faqs' },
  { label: nav.freeAudit, to: '/free-audit' },
  { label: nav.contact,   to: '/contact' },
];

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();

  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setAnimating(false);
        document.body.style.overflow = '';
      }, 350);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!animating && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer from right */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-theme-surface shadow-2xl flex flex-col transition-transform duration-350 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-theme-border">
          <ThemeToggle />
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-theme-muted hover:bg-theme-elevated transition-colors"
          >
            <X className="w-5 h-5 text-theme-text" />
          </button>
          <img
            src={LOGO_PATH}
            alt="Laftah Digital"
            style={{ maxWidth: '120px', height: 'auto', width: 'auto' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 text-right ${
                  isActive
                    ? 'bg-theme-primary-soft text-theme-primary'
                    : 'text-theme-text hover:bg-theme-muted hover:text-theme-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        {siteSettings.whatsapp_enabled && (
          <div className="px-4 pb-8 pt-4 border-t border-theme-border">
            <a
              href={getWhatsAppLink(messages.freeAudit)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-l from-teal-500 to-teal-600 text-white px-6 py-3.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              احصل على تحليل مجاني
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileMenu;
