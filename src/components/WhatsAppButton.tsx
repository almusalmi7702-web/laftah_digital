import { useState, useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { messages } from '../data/content';

const WhatsAppButton = () => {
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);

  if (!siteSettings.whatsapp_enabled) return null;

  return (
    <a
      href={getWhatsAppLink(messages.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className={`group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-0 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      {/* Tooltip label */}
      <span className="hidden sm:block bg-theme-surface text-theme-text font-bold text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        تواصل معنا
      </span>
      {/* Button */}
      <span className="relative w-14 h-14 rounded-full flex items-center justify-center whatsapp-btn transition-transform duration-300 group-hover:scale-110">
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 text-white"
          fill="currentColor"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 3.09.878 5.957 2.386 8.396L2.1 27.9l5.504-2.286C9.92 26.974 12.762 28 16 28c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25c-2.91 0-5.6-.864-7.87-2.36l-.56-.37-4.12 1.71 1.71-4.02-.43-.67C3.54 18.98 2.5 15.58 2.5 12c0-6.35 4.65-11.5 13.5-11.5S29 9.65 29 16c0 6.35-4.65 12-13 12zm5.93-8.07c-.37-.37-2.22-1.1-2.59-1.3-.37-.2-.64-.31-.91.3-.27.61-1.04 1.3-1.28 1.57-.24.27-.48.31-.85.11-.37-.2-1.57-.58-2.99-1.85-1.11-1-1.86-2.22-2.08-2.59-.22-.37-.02-.57.16-.76.16-.16.37-.41.55-.62.18-.2.24-.35.37-.58.13-.23.07-.44-.03-.64-.1-.2-.91-2.19-1.24-3-.33-.8-.67-.68-.91-.7-.24-.02-.51-.02-.78-.02s-.71.11-1.09.55c-.37.44-1.43 1.4-1.43 3.42s1.47 3.96 1.67 4.23c.2.27 2.87 4.38 6.96 6.14.97.34 1.73.54 2.32.69.98.25 1.87.21 2.58.13.79-.1 2.22-.91 2.53-1.79.31-.88.31-1.63.22-1.79-.1-.16-.37-.26-.74-.41z"/>
        </svg>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full whatsapp-btn opacity-50 animate-ping" style={{ animationDuration: '2.5s' }} />
      </span>
    </a>
  );
};

export default WhatsAppButton;
