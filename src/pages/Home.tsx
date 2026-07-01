import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageCircle, Check, Eye, Target } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import {
  LOGO_PATH, hero, values, whyUs, servicesList, packages,
  getWhatsAppLink, messages,
} from '../data/content';

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <section className="min-h-screen pt-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-teal-100/30 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-1/3 w-56 h-56 bg-teal-50/50 rounded-full blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-2 text-right">
            <div className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-8">
                <img
                  src={LOGO_PATH}
                  alt="Laftah Digital"
                  style={{ maxWidth: '180px', height: 'auto', width: 'auto' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                {hero.badge}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy-800 leading-[1.4] mb-8">
                نحوّل مشروعك إلى
                <span className="block mt-2 bg-gradient-to-l from-teal-500 to-teal-600 bg-clip-text text-transparent">
                  حضور بصري يلفت الانتباه
                </span>
              </h1>
              <p className="text-gray-600 text-lg leading-[1.9] mb-10 max-w-xl">
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
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-teal-500 text-teal-600 px-8 py-4 rounded-full font-bold text-base hover:bg-teal-50 transition-all duration-300 hover:-translate-y-1"
                >
                  <Eye className="w-5 h-5" />
                  {hero.ctaAudit}
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Area - Clean Value Proposition */}
          <div className={`order-1 lg:order-1 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              {/* Main Visual Card */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-10 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />

                <div className="relative z-10 text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">تصاميم جاهزة للنشر</h3>
                  <p className="text-teal-100 text-sm leading-relaxed">
                    نقدم لك تصاميم سوشيال ميديا احترافية ومتناسقة مع هويتك البصرية
                  </p>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-navy-800">هوية بصرية متناسقة</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-navy-800">تواصل سريع عبر واتساب</span>
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-navy-800 mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {whyUs.title}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {whyUs.cards.map((card, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-200 transition-all duration-500 hover:-translate-y-2 text-center ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-3">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
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
  const preview = servicesList.slice(0, 4);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-navy-800 mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            خدماتنا
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {preview.map((s, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-100 hover:border-teal-200 transition-all duration-300 text-center ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-sm font-bold text-navy-800 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
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

// ── Packages Preview ──────────────────────────────────────────────────────────
const PackagesPreview = () => {
  const { ref, isInView } = useInView();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-navy-800 mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            باقاتنا الشهرية
          </h2>
          <p className={`text-gray-600 max-w-xl mx-auto transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            اختر الباقة المناسبة لحضور مشروعك على السوشيال ميديا.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all duration-500 ${
                pkg.highlighted
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-2xl shadow-teal-500/30 scale-105 z-10'
                  : 'bg-white border border-gray-200 hover:border-teal-200 hover:shadow-xl'
              } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {pkg.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-navy-800 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  {pkg.badge}
                </span>
              )}
              <h3 className={`text-xl font-bold mb-2 text-center ${pkg.highlighted ? 'text-white' : 'text-navy-800'}`}>
                {pkg.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className={`text-sm ${pkg.highlighted ? 'text-teal-100' : 'text-gray-500'}`}>ر.س</span>
                <span className={`text-4xl font-black ${pkg.highlighted ? 'text-white' : 'text-teal-600'}`}>{pkg.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-3 text-sm ${pkg.highlighted ? 'text-teal-50' : 'text-gray-600'}`}>
                    <Check className={`w-4 h-4 flex-shrink-0 ${pkg.highlighted ? 'text-teal-200' : 'text-teal-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={getWhatsAppLink(pkg.message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 ${
                  pkg.highlighted
                    ? 'bg-white text-teal-600 hover:shadow-lg'
                    : 'bg-gradient-to-l from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
                }`}
              >
                أريد {pkg.name}
                <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 border-2 border-teal-500 text-teal-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-teal-50 transition-all duration-300"
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
          <a
            href={getWhatsAppLink(messages.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
          >
            <MessageCircle className="w-5 h-5" />
            تواصل معنا
          </a>
        </div>
      </div>
    </section>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Home = () => (
  <>
    <Hero />
    <ValueStrip />
    <WhyUsPreview />
    <ServicesPreview />
    <PackagesPreview />
    <FinalCTA />
  </>
);

export default Home;
