import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageCircle, Check, Eye, Target } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import {
  hero, values, whyUs, servicesList, packages,
  getWhatsAppLink, messages,
} from '../data/content';
import { getServices, getPricingPlans, getPortfolioItems } from '../services/dataService';
import FAQSection from '../components/FAQSection';
import ImagePlaceholder from '../components/ImagePlaceholder';
import { CardSkeleton, PricingSkeleton, PortfolioSkeleton } from '../components/Skeleton';
import type { Service, PricingPlan, PortfolioItem } from '../types/database';

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-2 text-right">
            <div className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                {hero.badge}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy-800 leading-[1.35] mb-8 max-w-2xl">
                نحوّل مشروعك إلى
                <span className="block mt-1 bg-gradient-to-l from-teal-500 to-teal-600 bg-clip-text text-transparent leading-[1.35]">
                  حضور بصري يلفت الانتباه
                </span>
              </h1>

              <p className="text-gray-600 text-base sm:text-lg leading-[1.9] mb-10 max-w-xl">
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
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
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
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-sm font-bold text-navy-800">هوية بصرية متناسقة</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-2 sm:-left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
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
                style={{ transitionDelay: `${i * 80}ms` }}
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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await getServices();
        if (mounted) setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Supabase data first, static fallback
  const preview = services.length > 0 ? services.slice(0, 4) : servicesList.slice(0, 4);
  const useSupabase = services.length > 0;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-black text-navy-800 mb-4 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            خدماتنا
          </h2>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {preview.map((s, i) => (
              <Link
                key={useSupabase ? (s as Service).id : i}
               
