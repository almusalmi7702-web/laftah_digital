import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';
import { LOGO_PATH, nav, footer, WHATSAPP_DISPLAY } from '../data/content';

const Footer = () => {
  const quickLinks = [
    { label: nav.home,      to: '/' },
    { label: nav.about,     to: '/about' },
    { label: nav.services,  to: '/services' },
    { label: nav.pricing,   to: '/pricing' },
    { label: nav.portfolio, to: '/portfolio' },
  ];

  return (
    <footer className="bg-navy-800 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-5">
              <img
                src={LOGO_PATH}
                alt="Laftah Digital"
                style={{ maxWidth: '120px', height: 'auto', width: 'auto' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md text-sm">
              {footer.description}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${WHATSAPP_DISPLAY.replace(/\s/g, '')}`}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-5 text-white">{footer.quickLinks}</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-5 text-white">{footer.ourServices}</h4>
            <ul className="space-y-3">
              {footer.servicesList.map((s) => (
                <li key={s}>
                  <span className="text-gray-400 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-gray-500 text-sm">{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
