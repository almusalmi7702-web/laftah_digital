import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  MessageCircle,
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { usePublicPricing } from '../hooks/usePublicData';
import { packages, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';

const pricingFaqs = [
  {
    question: 'هل تشمل الباقات كتابة المحتوى؟',
    answer:
      'الباقات تشمل التصميم فقط، ويزوّدنا العميل بالنصوص والصور والمعلومات المطلوبة. ويمكن طلب كتابة أو تجهيز المحتوى بشكل منفصل حسب احتياج المشروع.',
  },
  {
    question: 'هل تشمل الباقات إدارة الحساب والنشر؟',
    answer:
      'لا، الباقات الحالية مخصصة للتصميم وتسليم الملفات جاهزة للنشر، ولا تشمل إدارة الحسابات أو جدولة المنشورات أو الإعلانات الممولة.',
  },
  {
    question: 'هل يمكن تعديل الباقة حسب احتياج المشروع؟',
    answer:
      'نعم، يمكن تجهيز باقة مخصصة بعد معرفة عدد التصاميم ونوعها والمنصات المطلوبة، ثم يتم تحديد السعر والمدة المناسبة.',
  },
  {
    question: 'كم عدد التعديلات المتاحة على التصميم؟',
    answer:
      'يختلف عدد التعديلات حسب الباقة المختارة، ويشمل التعديلات المتفق عليها ضمن نفس فكرة التصميم. أما التغييرات الجذرية أو الطلبات الجديدة فتُحسب بشكل منفصل.',
  },
  {
    question: 'متى يبدأ تنفيذ الباقة وكم تستغرق؟',
    answer:
      'يبدأ التنفيذ بعد استلام جميع المتطلبات والاتفاق على تفاصيل العمل. ويتم تحديد جدول التسليم حسب عدد التصاميم وحجم المشروع.',
  },
  {
    question: 'هل يمكن طلب تصاميم إضافية خارج الباقة؟',
    answer:
      'نعم، يمكن إضافة تصاميم أو مقاسات أو خدمات أخرى إلى الباقة، ويتم تحديد التكلفة الإضافية قبل بدء التنفيذ.',
  },
];

const Pricing = () => {
  const { ref, isInView } = useInView(0.05);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();

  return (
    <div className="pt-20" dir="rtl">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          ref={ref}
        >
          <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            شفافية تامة
          </span>

          <h1
            className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${
              isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            باقاتنا الشهرية
          </h1>

          <p
            className={`text-theme-text-secondary text-lg leading-relaxed transition-all duration-700 delay-100 ${
              isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            اختر الباقة المناسبة لمشروعك. جميع الباقات تشمل تصاميم
            جاهزة للنشر بمقاسات المنصات المختلفة.
          </p>
        </div>
      </section>

      {/* Packages */}
      <PackagesGrid />

      {/* Pricing FAQ */}
      <PricingFAQSection />

      {/* Custom Package */}
      <section className="py-16 bg-theme-muted">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-theme-text mb-4">
            تحتاج باقة مخصصة؟
          </h2>

          <p className="text-theme-text-secondary leading-relaxed mb-8">
            إذا كانت الباقات الحالية لا تناسب احتياجك، تواصل معنا
            وسنجهز لك باقة تتناسب مع مشروعك وعدد التصاميم المطلوبة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>تواصل معنا</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {siteSettings.whatsapp_enabled && (
              <a
                href={getWhatsAppLink(messages.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-theme-surface border-2 border-teal-500 text-teal-600 px-8 py-3.5 rounded-full font-bold hover:bg-theme-primary-soft transition-all duration-300 hover:-translate-y-1"
              >
                <MessageCircle className="w-5 h-5" />
                <span>راسلنا عبر واتساب</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const PackagesGrid = () => {
  const { ref, isInView } = useInView();
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const { data: plans, isInitialLoading } = usePublicPricing();

  const displayPlans = plans && plans.length > 0 ? plans : null;

  if (isInitialLoading) {
    return (
      <section className="py-20 bg-theme-page">
        <div
          className="flex items-center justify-center"
          ref={ref}
        >
          <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-theme-page">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        ref={ref}
      >
        {displayPlans ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
            {displayPlans.map((pkg, i) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-8 text-right transition-all duration-500 ${
                  pkg.is_featured
                    ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-2xl shadow-teal-500/30 md:scale-105 z-10'
                    : 'bg-theme-surface border border-theme-border hover:border-theme-primary hover:shadow-theme-elevated'
                } ${
                  isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <h3
                  className={`text-xl font-bold mb-3 text-right ${
                    pkg.is_featured
                      ? 'text-white'
                      : 'text-theme-text'
                  }`}
                >
                  {pkg.name}
                </h3>

                <div className="flex items-baseline justify-start gap-2 mb-8">
                  <span
                    className={`text-5xl font-black ${
                      pkg.is_featured
                        ? 'text-white'
                        : 'text-theme-primary'
                    }`}
                  >
                    {pkg.price}
                  </span>

                  <span
                    className={`text-sm ${
                      pkg.is_featured
                        ? 'text-teal-100'
                        : 'text-theme-text-muted'
                    }`}
                  >
                    ر.س / شهريًا
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-start gap-3 text-right text-sm ${
                        pkg.is_featured
                          ? 'text-teal-50'
                          : 'text-theme-text-secondary'
                      }`}
                    >
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          pkg.is_featured
                            ? 'text-teal-200'
                            : 'text-theme-primary'
                        }`}
                      />

                      <span className="flex-1 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {pkg.description && (
                  <p
                    className={`text-sm leading-relaxed mb-7 text-right ${
                      pkg.is_featured
                        ? 'text-teal-100'
                        : 'text-theme-text-muted'
                    }`}
                  >
                    {pkg.description}
                  </p>
                )}

                {siteSettings.whatsapp_enabled && (
                  <a
                    href={getWhatsAppLink(
                      `مرحبًا، أريد الاشتراك في ${pkg.name} من لفتة ديجيتال.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 ${
                      pkg.is_featured
                        ? 'bg-white text-teal-600 hover:shadow-lg'
                        : 'bg-gradient-to-l from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
                    }`}
                  >
                    <span>أريد {pkg.name}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 text-right transition-all duration-500 ${
                  pkg.highlighted
                    ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-2xl shadow-teal-500/30 md:scale-105 z-10'
                    : 'bg-theme-surface border border-theme-border hover:border-theme-primary hover:shadow-theme-elevated'
                } ${
                  isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                {pkg.badge && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-navy-800 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                    {pkg.badge}
                  </span>
                )}

                <h3
                  className={`text-xl font-bold mb-3 text-right ${
                    pkg.highlighted
                      ? 'text-white'
                      : 'text-theme-text'
                  }`}
                >
                  {pkg.name}
                </h3>

                <div className="flex items-baseline justify-start gap-2 mb-8">
                  <span
                    className={`text-5xl font-black ${
                      pkg.highlighted
                        ? 'text-white'
                        : 'text-theme-primary'
                    }`}
                  >
                    {pkg.price}
                  </span>

                  <span
                    className={`text-sm ${
                      pkg.highlighted
                        ? 'text-teal-100'
                        : 'text-theme-text-muted'
                    }`}
                  >
                    ر.س / شهريًا
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-start gap-3 text-right text-sm ${
                        pkg.highlighted
                          ? 'text-teal-50'
                          : 'text-theme-text-secondary'
                      }`}
                    >
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          pkg.highlighted
                            ? 'text-teal-200'
                            : 'text-theme-primary'
                        }`}
                      />

                      <span className="flex-1 leading-relaxed">
                        {feature}
                      </span>
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
                    <span>أريد {pkg.name}</span>
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

const PricingFAQSection = () => {
  const { ref, isInView } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-16 bg-theme-muted"
      ref={ref}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2
            className={`text-2xl md:text-3xl font-black text-theme-text mb-3 transition-all duration-700 ${
              isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            أسئلة شائعة عن الباقات
          </h2>

          <p className="text-theme-text-secondary leading-relaxed">
            إجابات مختصرة عن محتوى الباقات وآلية التنفيذ والتعديلات.
          </p>
        </div>

        <div className="space-y-4">
          {pricingFaqs.map((faq, i) => (
            <div
              key={faq.question}
              className={`bg-theme-surface rounded-xl border border-theme-border overflow-hidden transition-all duration-500 hover:border-theme-primary ${
                isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${i * 60}ms`,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
                aria-expanded={openIndex === i}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-right hover:bg-theme-muted transition-colors"
              >
                <span className="flex-1 text-right font-semibold text-theme-text">
                  {faq.question}
                </span>

                <span
                  className={`text-lg flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i
                      ? 'rotate-180 text-theme-primary'
                      : 'text-theme-text-muted'
                  }`}
                >
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5 pt-4 text-right border-t border-theme-border bg-theme-page">
                  <p className="text-theme-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/faqs"
            className="inline-flex items-center justify-center gap-2 border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-theme-primary-soft transition-all duration-300"
          >
            <span>عرض جميع الأسئلة</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
