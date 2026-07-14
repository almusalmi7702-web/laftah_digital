import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { LOGO_PATH, nav, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

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

const Navbar = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-theme-surface/95 backdrop-blur-md shadow-sm border-b border-theme-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center">
              <img
                src={LOGO_PATH}
                alt="Laftah Digital"
                style={{ maxWidth: '140px', height: 'auto', width: 'auto' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-7">
              {navItems.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors duration-200 ${
                      isActive ? 'text-theme-primary' : 'text-theme-text hover:text-theme-primary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Desktop CTA + theme toggle */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              {siteSettings.whatsapp_enabled && (
                <a
                  href={getWhatsAppLink(messages.freeAudit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  احصل على تحليل مجاني
                </a>
              )}
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="فتح القائمة"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-theme-muted hover:bg-theme-elevated transition-colors text-theme-text"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Navbar;
