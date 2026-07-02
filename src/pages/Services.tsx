import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram, ShoppingBag, Image, Palette,
  FileText, Presentation, Calendar, ArrowLeft,
} from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { getServices } from '../services/dataService';
import { servicesList, getWhatsAppLink, messages } from '../data/content';
import ImagePlaceholder from '../components/ImagePlaceholder';
import type { Service } from '../types/database';

const staticIcons = [Instagram, ShoppingBag, Image, Palette, FileText, Presentation, Calendar];

const Services = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right" ref={ref}>
          <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            ما نقدمه
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-navy-800 mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            خدماتنا
          </h1>
          <p className={`text-gray-600 text-lg leading-relaxed max-w-2xl transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
            <a
              href={getWhatsAppLink(messages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-3.5 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              تواصل معنا
            </a>
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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const data = await getServices();
        if (mounted) {
          setServices(data);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
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

  const displayServices = services.length > 0 ? services : null;

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="flex items-center justify-center" ref={ref}>
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {displayServices ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayServices.map((s, i) => (
              <Link
                key={s.id}
                to={`/services/${s.slug}`}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-200 text-right transition-all duration-300 overflow-hidden ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {s.thumbnail_url ? (
                    <img
                      src={s.thumbnail_url}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImagePlaceholder variant="icon" />
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-base font-bold text-navy-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {s.short_description || s.details || ''}
                  </p>
                  {s.price && (
                    <p className="text-teal-600 font-bold text-sm mt-3">{s.price}</p>
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
                  className={`group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-100 hover:border-teal-200 text-right transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center mb-4 mr-auto group-hover:bg-teal-100 transition-colors">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-base font-bold text-navy-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
