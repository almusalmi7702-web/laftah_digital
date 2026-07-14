import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Mail,
  Facebook,
  Instagram,
  Music2,
  Ghost,
  Plus,
} from 'lucide-react';
import { LOGO_PATH, nav, footer, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import type { SocialLink } from '../types/settings';

const PLATFORM_META: Record<
  string,
  { icon: typeof Facebook; label: string }
> = {
  facebook: { icon: Facebook, label: 'فتح صفحة فيسبوك' },
  instagram: { icon: Instagram, label: 'فتح حساب إنستغرام' },
  tiktok: { icon: Music2, label: 'فتح حساب تيك توك' },
  snapchat: { icon: Ghost, label: 'فتح حساب سناب شات' },
};

const getPlatformMeta = (platform: string) =>
  PLATFORM_META[platform?.toLowerCase()] ?? { icon: Plus, label: 'فتح الرابط' };

const Footer = () => {
  const { siteSettings, activeSocialLinks, getWhatsAppLink } = useSiteSettings();

  const quickLinks = [
    { label: nav.home, to: '/' },
    { label: nav.about, to: '/about' },
    { label: nav.services, to: '/services' },
    { label: nav.pricing, to: '/pricing' },
    { label: nav.portfolio, to: '/portfolio' },
    { label: nav.faqs, to: '/faqs' },
  ];

  const renderSocialIcon = (link: SocialLink) => {
    const meta = getPlatformMeta(link.platform);
    const Icon = meta.icon;
    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={meta.label}
        className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors"
      >
        <Icon className="w-4 h-4" />
      </a>
    );
  };

  return (
    <footer className="bg-theme-footer text-white pt-16 pb-8">
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
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md text-sm">
              {footer.description}
            </p>
            <div className="flex gap-3 flex-wrap">
              {siteSettings.whatsapp_enabled && (
                <a
                  href={getWhatsAppLink(messages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="فتح واتساب"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {siteSettings.email_enabled && (
                <a
                  href={`mailto:${siteSettings.contact_email}`}
                  aria-label="إرسال بريد إلكتروني"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {activeSocialLinks.map(renderSocialIcon)}
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
                    className="text-gray-300 hover:text-teal-400 transition-colors text-sm"
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
                  <span className="text-gray-300 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-gray-400 text-sm">{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
