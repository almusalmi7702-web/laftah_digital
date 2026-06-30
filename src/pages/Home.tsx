import { Link } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, MessageCircle, Check,
  Instagram, ShoppingBag, Palette, Target, Eye,
} from 'lucide-react';
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-teal-100/40 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-50/60 rounded-full blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-2 text-right">
            <div className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-6">
                <img
                  src={LOGO_PATH}
                  alt="Laftah Digital"
                  style={{ maxWidth: '200px', height: 'auto', width: 'auto' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                {hero.badge}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-navy-800 leading-tight mb-6">
                {hero.title.split('يلفت الانتباه')[0]}
                <span className="block bg-gradient-to-l from-teal-500 to-teal-600 bg-clip-text text-transparent">
                  يلفت الانتباه
                </span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl">
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
                <a
                  href={getWhatsAppLink(messages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-teal-500 text-teal-600 px-8 py-4 rounded-full font-bold text-base hover:bg-teal-50 transition-all duration-300 hover:-translate-y-1"
                >
                  <MessageCircle className="w-5 h-5" />
                  {hero.ctaWhatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Visual Mockup */}
          <div className={`order-1 lg:order-1 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl p-6 aspect-square flex items-center justify-center shadow-xl animate-float">
                  <div className="text-white text-center">
                    <Instagram className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-semibold">منشور سوشيال</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-navy-700 to-navy-800 rounded-2xl p-6 aspect-square flex items-center justify-center shadow-xl mt-8">
                  <div className="text-white text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-semibold">عرض منتج</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 aspect-[4/5] flex items-center justify-center shadow-xl border border-white/50">
                  <div className="text-gray-600 text-center">
                    <Palette className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-sm font-semibold">ستوري</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-500/80 to-teal-600/80 rounded-2xl p-6 aspect-[4/5] flex items-center justify-center shadow-xl mt-4">
                  <div className="text-white text-center">
                    <Target className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-sm font-semibold">هوية بصرية</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-teal-200 rounded-full blur-xl opacity-60" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-teal-500" />
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
  const icons = [Sparkles, Target, Palette, MessageCircle];
  return (
    <section className="py-12 bg-gradient-to-l from-teal-500 to-teal-600">
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
        <div className="grid md:grid-cols-3 gap-8">
          {whyUs.cards.map((card, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-200 transition-all duration-500 hover:-translate-y-2 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-3 text-right">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-right">{card.description}</p>
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
              className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-100 hover:border-teal-200 transition-all duration-300 text-right ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4 mr-auto">
                <Sparkles className="w-5 h-5 text-teal-600" />
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
        <div className="grid md:grid-cols-3 gap-8">
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
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-navy-800 px-4 py-1 rounded-full text-sm font-bold">
                  {pkg.badge}
                </span>
              )}
              <h3 className={`text-xl font-bold mb-2 text-right ${pkg.highlighted ? 'text-white' : 'text-navy-800'}`}>
                {pkg.name}
              </h3>
              <div className="flex items-baseline justify-end gap-1 mb-6">
                <span className={`text-sm ${pkg.highlighted ? 'text-teal-100' : 'text-gray-500'}`}>ر.س</span>
                <span className={`text-4xl font-black ${pkg.highlighted ? 'text-white' : 'text-teal-600'}`}>{pkg.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-3 justify-end text-sm ${pkg.highlighted ? 'text-teal-50' : 'text-gray-600'}`}>
                    {f}
                    <Check className={`w-4 h-4 flex-shrink-0 ${pkg.highlighted ? 'text-teal-200' : 'text-teal-500'}`} />
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
          ابدأ بتقييم مجاني، أو اختر الباقة المناسبة وسنساعدك على بناء حضور بصري متناسق وجاهز للنشر.
        </p>
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link
            to="/free-audit"
            className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold text-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5" />
            احصل على تقييم مجاني
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
