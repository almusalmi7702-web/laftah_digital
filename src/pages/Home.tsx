import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageCircle, Check, Eye, Target } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import {
  hero, values, whyUs, servicesList, packages,
  messages,
} from '../data/content';
import { usePublicServices, usePublicPortfolio, usePublicPricing, usePrefetchOnIdle } from '../hooks/usePublicData';
import { useSiteSettings } from '../hooks/useSiteSettings';
import FAQSection from '../components/FAQSection';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ServiceImageSlider from '../components/ServiceImageSlider';
import { CardSkeleton, PricingSkeleton, PortfolioSkeleton } from '../components/Skeleton';
import type { Service, PricingPlan } from '../types/database';

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <section className="pt-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-teal-100/30 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-1/3 w-56 h-56 bg-teal-50/50 rounded-full blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-2 text-right">
            <div className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                {hero.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-theme-text leading-[1.35] mb-8 max-w-2xl">
                نحوّل مشروعك إلى
                <span className="block mt-1 bg-gradient-to-l from-teal-500 to-teal-600 bg-clip-text text-transparent leading-[1.35]">
                  حضور بصري يلفت الانتباه
                </span>
              </h1>
              <p className="text-theme-text-secondary text-base sm:text-lg leading-[1.9] mb-10 max-w-xl">
                {hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold text-base hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  {hero.ctaServices}
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link
                  to="/free-audit"
                  className="inline-flex items-center justify-center gap-2 bg-theme-surface border-2 border-teal-500 text-teal-600 px-8 py-4 rounded-full font-bold text-base hover:bg-theme-primary-soft transition-all duration-300 hover:-translate-y-1"
                >
                  <Eye className="w-5 h-5" />
                  {hero.ctaAudit}
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Area */}
          <div className={`order-1 lg:order-1 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              {/* Main Visual Card */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />

                <div className="relative z-10 text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">تصاميم رقمية جاهزة للاستخدام</h3>
                  <p className="text-teal-100 text-sm leading-relaxed">
                    نصمم لك مواد بصرية احترافية تناسب مشروعك وتظهر هويتك بشكل واضح ومتناسق
                  </p>
                </div>
              </div>

              {/* Identity Card */}
              <div className="absolute -top-8 -right-1 sm:-top-7 sm:-right-4 bg-theme-surface rounded-2xl p-3 sm:p-4 shadow-xl border border-theme-border">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-theme-primary-soft rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-theme-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-theme-text">هوية بصرية متناسقة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Value Strip ───────────────────────────────────────────────────────────────
const ValueStrip = () => {
  const icons = [Sparkles, Target, Eye, MessageCircle];

  return (
    <section className="py-14 bg-gradient-to-l from-teal-500 to-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = icons[i];

            return (
              <div key={i} className="flex items-center justify-center gap-3 text-white">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── Why Us Preview ────────────────────────────────────────────────────────────
const WhyUsPreview = () => {
  const { ref, isInView } = useInView();
  const icons = [Eye, Target, Sparkles];

  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-theme-text mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {whyUs.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {whyUs.cards.map((card, i) => {
            const Icon = icons[i];

            return (
              <div
                key={i}
                className={`group bg-theme-surface rounded-2xl p-8 shadow-theme-card hover:shadow-theme-elevated border border-theme-border hover:border-theme-primary transition-all duration-500 hover:-translate-y-2 text-center ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-theme-text mb-3">{card.title}</h3>
                <p className="text-theme-text-secondary text-sm leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── Services Preview ──────────────────────────────────────────────────────────
const ServicesPreview = () => {
  const { ref, isInView } = useInView();
  const { data: services, isInitialLoading } = usePublicServices();

  const preview = services && services.length > 0 ? services.slice(0, 4) : servicesList.slice(0, 4);
  const useSupabase = !!(services && services.length > 0);

  return (
    <section className="py-20 bg-theme-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-theme-text mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            خدماتنا
          </h2>
        </div>

        {isInitialLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {preview.map((s, i) => (
              <Link
                key={useSupabase ? (s as Service).id : i}
                to={useSupabase ? `/services/${(s as Service).slug}` : '/services'}
                className={`group bg-theme-surface rounded-xl p-6 shadow-theme-card hover:shadow-theme-elevated border border-theme-border hover:border-theme-primary transition-all duration-300 text-center ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
{useSupabase ? (
  <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-theme-muted">
    <ServiceImageSlider
      images={(s as Service).images}
      alt={s.title}
      imageClassName="group-hover:scale-105 transition-transform duration-500"
    />
  </div>
) : (
  <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-theme-muted">
    <ImagePlaceholder variant="full" />
  </div>
)}

                <h3 className="text-sm font-bold text-theme-text mb-2">{s.title}</h3>
                <p className="text-xs text-theme-text-secondary leading-relaxed line-clamp-2">
                  {useSupabase ? ((s as Service).short_description || (s as Service).details || '') : (s as typeof servicesList[0]).description}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            عرض جميع الخدمات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── Portfolio Preview ─────────────────────────────────────────────────────────
const PortfolioPreview = () => {
  const { ref, isInView } = useInView();
  const { data: items, isInitialLoading } = usePublicPortfolio();

  if (!isInitialLoading && items && items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-theme-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-theme-text mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            أعمالنا
          </h2>
        </div>

        {isInitialLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <PortfolioSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {items!.slice(0, 4).map((item, i) => (
                <Link
                  key={item.id}
                  to={`/portfolio/${item.slug}`}
                  className={`group bg-theme-surface rounded-2xl shadow-theme-card border border-theme-border overflow-hidden hover:shadow-theme-elevated transition-all duration-300 hover:-translate-y-1 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className="aspect-video bg-theme-muted overflow-hidden">
                    <ServiceImageSlider
                      images={item.images}
                      alt={item.title}
                      imageClassName="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4 text-right">
                    {item.category && (
                      <span className="inline-block bg-theme-primary-soft text-theme-primary text-xs px-2 py-1 rounded mb-2">
                        {item.category}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-theme-text line-clamp-1">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-theme-primary-soft transition-all duration-300"
              >
                عرض جميع الأعمال
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// ── Packages Preview ──────────────────────────────────────────────────────────
const PackagesPreview = () => {
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const { ref, isInView } = useInView();
  const { data: plans, isInitialLoading } = usePublicPricing();

  const useSupabase = !!(plans && plans.length > 0);
  const preview = useSupabase ? plans!.slice(0, 3) : packages;

  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-theme-text mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            باقاتنا الشهرية
          </h2>
          <p className={`text-theme-text-secondary max-w-xl mx-auto transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            اختر الباقة المناسبة لحضور مشروعك على السوشيال ميديا.
          </p>
        </div>

        {isInitialLoading ? (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {[0, 1, 2].map((i) => (
              <PricingSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {preview.map((pkg, i) => {
              const featured = useSupabase ? (pkg as PricingPlan).is_featured : (pkg as typeof packages[0]).highlighted;
              const name = pkg.name;
              const price = pkg.price;
              const features = pkg.features;
              const description = useSupabase ? (pkg as PricingPlan).description : undefined;
              const message = useSupabase
                ? `مرحبًا، أريد الاشتراك في ${name} من لفتة ديجيتال.`
                : (pkg as typeof packages[0]).message;

              return (
                <div
                  key={useSupabase ? (pkg as PricingPlan).id : i}
                  className={`relative rounded-2xl p-8 transition-all duration-500 ${
                    featured
                      ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-2xl shadow-teal-500/30 scale-105 z-10'
                      : 'bg-theme-surface border border-theme-border hover:border-theme-primary hover:shadow-theme-elevated'
                  } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {!useSupabase && (pkg as typeof packages[0]).badge && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-navy-800 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                      {(pkg as typeof packages[0]).badge}
                    </span>
                  )}

                  <h3 className={`text-xl font-bold mb-2 text-center ${featured ? 'text-white' : 'text-theme-text'}`}>
                    {name}
                  </h3>

<div className="flex items-baseline justify-center gap-1 mb-6">
  <span className={`text-4xl font-black ${featured ? 'text-white' : 'text-theme-primary'}`}>
    {price}
  </span>

  <span className={`text-sm ${featured ? 'text-teal-100' : 'text-theme-text-muted'}`}>
    ر.س
  </span>
</div>

                  <ul className="space-y-3 mb-8">
                    {features.map((f, fi) => (
                      <li key={fi} className={`flex items-center gap-3 text-sm ${featured ? 'text-teal-50' : 'text-theme-text-secondary'}`}>
                        <Check className={`w-4 h-4 flex-shrink-0 ${featured ? 'text-teal-200' : 'text-theme-primary'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {description && (
                    <p className={`text-sm mb-6 text-center ${featured ? 'text-teal-100' : 'text-theme-text-muted'}`}>
                      {description}
                    </p>
                  )}

                  {siteSettings.whatsapp_enabled && (
                    <a
                      href={getWhatsAppLink(message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 ${
                        featured
                          ? 'bg-white text-teal-600 hover:shadow-lg'
                          : 'bg-gradient-to-l from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
                      }`}
                    >
                      أريد {name}
                      <ArrowLeft className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-theme-primary-soft transition-all duration-300"
          >
            تفاصيل الباقات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── Final CTA ─────────────────────────────────────────────────────────────────
const FinalCTA = () => {
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const { ref, isInView } = useInView();

  return (
    <section className="py-20 bg-gradient-to-l from-teal-500 to-teal-600 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10" ref={ref}>
        <h2 className={`text-3xl md:text-4xl font-black text-white mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          جاهز لتطوير حضورك البصري؟
        </h2>
        <p className={`text-teal-100 text-lg mb-10 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          ابدأ بتحليل مجاني، أو اختر الباقة المناسبة وسنساعدك على بناء حضور بصري متناسق وجاهز للنشر.
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link
            to="/free-audit"
            className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold text-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5" />
            احصل على تحليل مجاني
          </Link>

          {siteSettings.whatsapp_enabled && (
            <a
              href={getWhatsAppLink(messages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5" />
              تواصل معنا
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Home = () => {
  usePrefetchOnIdle(['portfolio', 'pricing', 'faqs']);

  return (
    <>
      <Hero />
      <ValueStrip />
      <WhyUsPreview />
      <ServicesPreview />
      <PortfolioPreview />
      <PackagesPreview />
      <FAQSection />
      <FinalCTA />
    </>
  );
};

export default Home;
