import { MessageCircle, Phone, Instagram, Mail, ArrowLeft } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { contact, getWhatsAppLink, messages, WHATSAPP_DISPLAY } from '../data/content';

const Contact = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            نسعد بتواصلك
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-navy-800 mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {contact.title}
          </h1>
          <p className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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

const ContactCards = () => {
  const { ref, isInView } = useInView();

  const cards = [
    {
      icon: <MessageCircle className="w-7 h-7 text-white" />,
      label: 'واتساب',
      value: WHATSAPP_DISPLAY,
      color: 'from-green-400 to-green-500',
      href: getWhatsAppLink(messages.contact),
      external: true,
    },
    {
      icon: <Phone className="w-7 h-7 text-white" />,
      label: 'الهاتف',
      value: WHATSAPP_DISPLAY,
      color: 'from-teal-400 to-teal-600',
      href: `tel:${WHATSAPP_DISPLAY.replace(/\s/g, '')}`,
      external: false,
    },
    {
      icon: <Instagram className="w-7 h-7 text-white" />,
      label: 'إنستقرام',
      value: '@laftahdigital',
      color: 'from-pink-400 to-rose-500',
      href: '#',
      external: true,
    },
    {
      icon: <Mail className="w-7 h-7 text-white" />,
      label: 'البريد الإلكتروني',
      value: 'info@laftah.com',
      color: 'from-navy-600 to-navy-800',
      href: 'mailto:info@laftah.com',
      external: false,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              className={`group flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 hover:-translate-y-1 text-right ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                {c.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">{c.label}</p>
                <p className="text-navy-800 font-bold" dir="ltr">{c.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  const { ref, isInView } = useInView();
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
        <a
          href={getWhatsAppLink(messages.freeAudit)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <MessageCircle className="w-5 h-5" />
          {contact.whatsappCta}
          <ArrowLeft className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export default Contact;
