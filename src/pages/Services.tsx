import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram, ShoppingBag, Image, Palette,
  FileText, Presentation, Calendar, ArrowLeft,
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { getServices } from '../services/dataService';
import { servicesList, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ServiceImageSlider from '../components/ServiceImageSlider';
import type { Service } from '../types/database';

const staticIcons = [Instagram, ShoppingBag, Image, Palette, FileText, Presentation, Calendar];
const SERVICES_CACHE_KEY = 'laftah_services_cache_v1';

const getCachedServices = (): Service[] => {
  if (typeof window === 'undefined') return [];

  try {
    const cached = sessionStorage.getItem(SERVICES_CACHE_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setCachedServices = (services: Service[]) => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(services));
  } catch {
    // Ignore storage errors
  }
};

const Services = () => {
  const { ref, isInView } = useInView(0.05);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right" ref={ref}>
          <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            ما نقدمه
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            خدماتنا
          </h1>
          <p className={`text-theme-text-secondary text-lg leading-relaxed max-w-2xl transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            نقدم مجموعة متكاملة من خدمات التصميم الرقمي لمساعدة مشروعك على الظهور بصورة احترافية ومتناسقة.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <ServicesList />

      {/* CTA */}
      <section className="py-16 bg-gradient-to-l from-teal-500 to-teal-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-4">هل تحتاج إلى خدمة معينة؟</h2>
          <p className="text-teal-100 mb-8">تواصل معنا وسنساعدك على اختيار ما يناسب مشروعك.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {siteSettings.whatsapp_enabled && (
              <a
                href={getWhatsAppLink(messages.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-3.5 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                تواصل معنا
              </a>
            )}
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all duration-300"
            >
              عرض الباقات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const ServicesList = () => {
  const { ref, isInView } = useInView();
  const [services, setServices] = useState<Service[]>(() => getCachedServices());
  const [loading, setLoading] = useState(() => getCachedServices().length === 0);

  useEffect(() => {
    let mounted = true;

    const fetchServices = async () => {
      try {
        const data = await getServices();

        if (!mounted) return;

        setServices(data);
        setCachedServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      mounted = false;
    };
  }, []);

  const displayServices = services.length > 0 ? services : null;

  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : displayServices ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayServices.map((s, i) => (
              <Link
                key={s.id}
                to={`/services/${s.slug}`}
                className={`group bg-theme-surface rounded-2xl shadow-theme-card hover:shadow-theme-elevated border border-theme-border hover:border-theme-primary text-right transition-all duration-300 overflow-hidden ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
<div className="aspect-video bg-theme-muted overflow-hidden">
  <ServiceImageSlider
    images={s.images}
    alt={s.title}
    imageClassName="group-hover:scale-105 transition-transform duration-500"
  />
</div>

                <div className="p-6">
                  <h3 className="text-base font-bold text-theme-text mb-2">{s.title}</h3>
                  <p className="text-sm text-theme-text-secondary leading-relaxed line-clamp-3">
                    {s.short_description || ''}
                  </p>
                  {s.price && (
                    <p className="text-theme-primary font-bold text-sm mt-3">{s.price}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicesList.map((s, i) => {
              const Icon = staticIcons[i] ?? Palette;
              return (
                <div
                  key={i}
                  className={`group bg-theme-surface rounded-xl p-6 shadow-theme-card hover:shadow-theme-elevated border border-theme-border hover:border-theme-primary text-right transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-theme-primary-soft flex items-center justify-center mb-4 mr-auto group-hover:bg-theme-primary-soft transition-colors">
                    <Icon className="w-6 h-6 text-theme-primary" />
                  </div>
                  <h3 className="text-base font-bold text-theme-text mb-2">{s.title}</h3>
                  <p className="text-sm text-theme-text-secondary leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const ServiceCardSkeleton = () => (
  <div className="bg-theme-surface rounded-2xl border border-theme-border overflow-hidden shadow-theme-card">
    <div className="aspect-video w-full animate-pulse bg-theme-muted" />
    <div className="p-6">
      <div className="h-4 w-3/4 rounded bg-theme-muted animate-pulse mb-3" />
      <div className="h-3 w-full rounded bg-theme-muted animate-pulse mb-2" />
      <div className="h-3 w-2/3 rounded bg-theme-muted animate-pulse" />
    </div>
  </div>
);

export default Services;
