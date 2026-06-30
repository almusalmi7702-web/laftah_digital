import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { LOGO_PATH, nav, getWhatsAppLink, messages } from '../data/content';

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
  { label: nav.freeAudit, to: '/free-audit' },
  { label: nav.contact,   to: '/contact' },
];

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer from right */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-white shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-navy-800" />
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
                `block px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 text-right ${
                  isActive
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-navy-800 hover:bg-gray-50 hover:text-teal-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="px-4 pb-8 pt-4 border-t border-gray-100">
          <a
            href={getWhatsAppLink(messages.freeAudit)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-l from-teal-500 to-teal-600 text-white px-6 py-3.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            احصل على تقييم مجاني
          </a>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
