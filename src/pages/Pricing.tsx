import { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { getPricingPlans, getFaqs } from '../services/dataService';
import { packages, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import type { PricingPlan } from '../types/database';

const Pricing = () => {
  const { ref, isInView } = useInView(0.05);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            شفافية تامة
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            باقاتنا الشهرية
          </h1>
          <p className={`text-theme-text-secondary text-lg leading-relaxed transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            اختر الباقة المناسبة لمشروعك. جميع الباقات تشمل تصاميم جاهزة للنشر بمقاسات المنصات المختلفة.
          </p>
        </div>
      </section>

      {/* Packages */}
      <PackagesGrid />

      {/* FAQ Section */}
      <FAQSection />

      {/* Custom */}
      <section className="py-16 bg-theme-muted">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-theme-text mb-4">تحتاج باقة مخصصة؟</h2>
          <p className="text-theme-text-secondary mb-8">
            إذا كانت باقاتنا لا تناسب احتياجك، تواصل معنا وسنصمم لك باقة تلائم مشروعك.
          </p>
          {siteSettings.whatsapp_enabled && (
            <a
              href={getWhatsAppLink(messages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              تواصل معنا
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

const PackagesGrid = () => {
  const { ref, isInView } = useInView();
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const data = await getPricingPlans();
        if (mounted) {
          setPlans(data);
        }
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, []);

  // Use Supabase plans if available, otherwise fallback to static
  const displayPlans = plans.length > 0 ? plans : null;

  if (loading) {
    return (
      <section className="py-20 bg-theme-page">
        <div className="flex items-center justify-center" ref={ref}>
          <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {displayPlans ? (
          // Supabase pricing plans
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {displayPlans.map((pkg, i) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-8 transition-all duration-500 ${
                  pkg.is_featured
                    ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-2xl shadow-teal-500/30 scale-105 z-10'
                    : 'bg-theme-surface border border-theme-border hover:border-theme-primary hover:shadow-theme-elevated'
                } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <h3 className={`text-xl font-bold mb-2 text-right ${pkg.is_featured ? 'text-white' : 'text-theme-text'}`}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline justify-end gap-1 mb-8">
                  <span className={`text-sm ${pkg.is_featured ? 'text-teal-100' : 'text-theme-text-muted'}`}>ر.س / شهريًا</span>
                  <span className={`text-5xl font-black ${pkg.is_featured ? 'text-white' : 'text-theme-primary'}`}>{pkg.price}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((f, fi) => (
                    <li key={fi} className={`flex items-center gap-3 justify-end text-sm ${pkg.is_featured ? 'text-teal-50' : 'text-theme-text-secondary'}`}>
                      {f}
                      <Check className={`w-5 h-5 flex-shrink-0 ${pkg.is_featured ? 'text-teal-200' : 'text-theme-primary'}`} />
                    </li>
                  ))}
                </ul>
                {pkg.description && (
                  <p className={`text-sm mb-6 text-right ${pkg.is_featured ? 'text-teal-100' : 'text-theme-text-muted'}`}>
                    {pkg.description}
                  </p>
                )}
                {siteSettings.whatsapp_enabled && (
                  <a
                    href={getWhatsAppLink(`مرحبًا، أريد الاشتراك في ${pkg.name} من لفتة ديجيتال.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 ${
                      pkg.is_featured
                        ? 'bg-white text-teal-600 hover:shadow-lg'
                        : 'bg-gradient-to-l from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
                    }`}
                  >
                    أريد {pkg.name}
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Static fallback
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 transition-all duration-500 ${
                  pkg.highlighted
                    ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-2xl shadow-teal-500/30 scale-105 z-10'
                    : 'bg-theme-surface border border-theme-border hover:border-theme-primary hover:shadow-theme-elevated'
                } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {pkg.badge && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-navy-800 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                    {pkg.badge}
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-2 text-right ${pkg.highlighted ? 'text-white' : 'text-theme-text'}`}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline justify-end gap-1 mb-8">
                  <span className={`text-sm ${pkg.highlighted ? 'text-teal-100' : 'text-theme-text-muted'}`}>ر.س / شهريًا</span>
                  <span className={`text-5xl font-black ${pkg.highlighted ? 'text-white' : 'text-theme-primary'}`}>{pkg.price}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((f, fi) => (
                    <li key={fi} className={`flex items-center gap-3 justify-end text-sm ${pkg.highlighted ? 'text-teal-50' : 'text-theme-text-secondary'}`}>
                      {f}
                      <Check className={`w-5 h-5 flex-shrink-0 ${pkg.highlighted ? 'text-teal-200' : 'text-theme-primary'}`} />
                    </li>
                  ))}
                </ul>
                {siteSettings.whatsapp_enabled && (
                  <a
                    href={getWhatsAppLink(pkg.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 ${
                      pkg.highlighted
                        ? 'bg-white text-teal-600 hover:shadow-lg'
                        : 'bg-gradient-to-l from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
                    }`}
                  >
                    أريد {pkg.name}
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isInView } = useInView();

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const data = await getFaqs();
        if (mounted) {
          setFaqs(data);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-16 bg-theme-muted" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl font-black text-theme-text text-center mb-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          أسئلة شائعة
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-right flex items-center justify-between gap-4 hover:bg-theme-muted transition-colors"
              >
                <span className="text-sm text-theme-text-muted">{openIndex === i ? '−' : '+'}</span>
                <span className="font-semibold text-theme-text">{faq.question}</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-right">
                  <p className="text-theme-text-secondary leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
