import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { getFaqs } from '../services/dataService';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { messages } from '../data/content';
import { FaqSkeleton } from '../components/Skeleton';
import type { Faq } from '../types/database';

const Faqs = () => {
  const { ref, isInView } = useInView(0.05);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const data = await getFaqs();

        if (mounted) {
          setFaqs(data);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          ref={ref}
        >
          <span
            className={`inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 transition-all duration-700 ${
              isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            إجابات واضحة
          </span>

          <h1
            className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${
              isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            الأسئلة الشائعة
          </h1>

          <p
            className={`text-theme-text-secondary text-lg leading-relaxed transition-all duration-700 delay-100 ${
              isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            إليك إجابات لأكثر الأسئلة شيوعًا حول خدماتنا وباقاتنا.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-theme-page">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <FaqSkeleton />
          ) : faqs.length === 0 ? (
            <div className="bg-gradient-to-br from-theme-primary-soft to-theme-muted rounded-3xl p-8 sm:p-12 border border-theme-border text-center">
              <div className="w-20 h-20 bg-theme-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-10 h-10 text-theme-primary" />
              </div>

              <h3 className="text-xl font-bold text-theme-text mb-4">
                لا توجد أسئلة حاليًا
              </h3>

              <p className="text-theme-text-secondary leading-relaxed mb-8">
                لم نتمكن من العثور على أسئلة شائعة منشورة حاليًا.
                تواصل معنا وسنجيب عن استفسارك.
              </p>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
              >
                <Mail className="w-5 h-5" />
                تواصل معنا
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div
                    key={faq.id}
                    className="bg-theme-muted rounded-xl border border-theme-border overflow-hidden transition-all duration-300 hover:border-theme-primary"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex(openIndex === i ? null : i)
                      }
                      aria-expanded={openIndex === i}
                      className="w-full px-6 py-5 text-right flex items-center justify-between gap-4 hover:bg-theme-surface transition-colors"
                    >
                      <span className="flex-1 text-right font-semibold text-theme-text">
                        {faq.question}
                      </span>

                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 text-theme-text-muted transition-transform duration-300 ${
                          openIndex === i
                            ? 'rotate-180 text-theme-primary'
                            : ''
                        }`}
                      />
                    </button>

                    {openIndex === i && (
                      <div className="px-6 pb-5 pt-4 text-right border-t border-theme-border bg-theme-surface">
                        <p className="text-theme-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Card */}
              <div className="mt-14 bg-gradient-to-br from-theme-primary-soft via-theme-surface to-theme-muted rounded-3xl p-8 sm:p-12 border border-theme-border text-center">
                <div className="w-20 h-20 bg-theme-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-2xl font-black text-theme-text mb-4">
                  لم تجد إجابة لسؤالك؟
                </h2>

                <p className="text-theme-text-secondary leading-relaxed max-w-xl mx-auto mb-8">
                  يسعدنا مساعدتك والإجابة عن استفسارك.
                  تواصل معنا وسنرد عليك في أقرب وقت.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Mail className="w-5 h-5" />
                    تواصل معنا
                  </Link>

                  {siteSettings.whatsapp_enabled && (
                    <a
                      href={getWhatsAppLink(messages.general)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-theme-surface border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full font-bold hover:bg-theme-primary-soft transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-5 h-5" />
                      راسلنا عبر واتساب
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Faqs;
