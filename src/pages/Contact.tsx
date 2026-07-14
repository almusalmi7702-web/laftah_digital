import { MessageCircle, Mail, Facebook, Instagram, Music2, Ghost, Plus, ArrowLeft } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { contact, messages } from '../data/content';
import type { SocialLink } from '../types/settings';

const Contact = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            نسعد بتواصلك
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {contact.title}
          </h1>
          <p className={`text-theme-text-secondary text-lg leading-relaxed transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {contact.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <ContactCards />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
};

const PLATFORM_META: Record<
  string,
  { icon: typeof Facebook; color: string; label: string }
> = {
  facebook: { icon: Facebook, color: 'from-blue-500 to-blue-700', label: 'فتح صفحة فيسبوك' },
  instagram: { icon: Instagram, color: 'from-pink-400 to-rose-500', label: 'فتح حساب إنستغرام' },
  tiktok: { icon: Music2, color: 'from-gray-700 to-gray-900', label: 'فتح حساب تيك توك' },
  snapchat: { icon: Ghost, color: 'from-yellow-300 to-yellow-500', label: 'فتح حساب سناب شات' },
};

const getPlatformMeta = (platform: string) =>
  PLATFORM_META[platform?.toLowerCase()] ?? {
    icon: Plus,
    color: 'from-teal-400 to-teal-600',
    label: 'فتح الرابط',
  };

const ContactCards = () => {
  const { ref, isInView } = useInView();
  const { siteSettings, activeSocialLinks, getWhatsAppLink } = useSiteSettings();

  const cards: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    href: string;
    external: boolean;
    ariaLabel: string;
  }> = [];

  if (siteSettings.whatsapp_enabled) {
    cards.push({
      key: 'whatsapp',
      icon: <MessageCircle className="w-7 h-7 text-white" />,
      label: 'واتساب',
      value: siteSettings.whatsapp_display,
      color: 'from-green-400 to-green-500',
      href: getWhatsAppLink(messages.contact),
      external: true,
      ariaLabel: 'فتح واتساب',
    });
  }

  if (siteSettings.email_enabled) {
    cards.push({
      key: 'email',
      icon: <Mail className="w-7 h-7 text-white" />,
      label: 'البريد الإلكتروني',
      value: siteSettings.contact_email,
      color: 'from-navy-600 to-navy-800',
      href: `mailto:${siteSettings.contact_email}`,
      external: false,
      ariaLabel: 'إرسال بريد إلكتروني',
    });
  }

  const renderSocialCard = (link: SocialLink, index: number) => {
    const meta = getPlatformMeta(link.platform);
    const Icon = meta.icon;
    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={meta.label}
        className={`group flex items-center gap-5 p-6 bg-theme-surface rounded-2xl border border-theme-border shadow-theme-card hover:shadow-theme-elevated hover:border-theme-primary transition-all duration-300 hover:-translate-y-1 text-right ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: `${(cards.length + index) * 80}ms` }}
      >
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-xs text-theme-text-muted font-semibold mb-1">{link.label}</p>
          {link.username && (
            <p className="text-theme-text font-bold" dir="ltr">@{link.username}</p>
          )}
        </div>
      </a>
    );
  };

  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((c, i) => (
            <a
              key={c.key}
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              aria-label={c.ariaLabel}
              className={`group flex items-center gap-5 p-6 bg-theme-surface rounded-2xl border border-theme-border shadow-theme-card hover:shadow-theme-elevated hover:border-theme-primary transition-all duration-300 hover:-translate-y-1 text-right ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                {c.icon}
              </div>
              <div>
                <p className="text-xs text-theme-text-muted font-semibold mb-1">{c.label}</p>
                <p className="text-theme-text font-bold" dir="ltr">{c.value}</p>
              </div>
            </a>
          ))}
          {activeSocialLinks.map((link, i) => renderSocialCard(link, i))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  const { ref, isInView } = useInView();
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const showWhatsApp = siteSettings.whatsapp_enabled;
  const showEmail = siteSettings.email_enabled;

  return (
    <section className="py-20 bg-gradient-to-l from-teal-500 to-teal-600 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
      </div>
      <div className="max-w-2xl mx-auto px-4 text-center relative z-10" ref={ref}>
        <h2 className={`text-3xl font-black text-white mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {contact.ctaText}
        </h2>
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {showWhatsApp && (
            <a
              href={getWhatsAppLink(messages.freeAudit)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5" />
              {contact.whatsappCta}
              <ArrowLeft className="w-4 h-4" />
            </a>
          )}
          {showEmail && !showWhatsApp && (
            <a
              href={`mailto:${siteSettings.contact_email}`}
              className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Mail className="w-5 h-5" />
              راسلنا عبر البريد
              <ArrowLeft className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
