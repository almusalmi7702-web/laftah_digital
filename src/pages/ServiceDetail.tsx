import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, MessageCircle } from 'lucide-react';
import { getServiceBySlug } from '../services/dataService';
import { servicesList as staticServices } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ServiceImageSlider from '../components/ServiceImageSlider';
import type { Service } from '../types/database';

const ServiceDetail = () => {
  const { slug } = useParams();
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      try {
        const data = await getServiceBySlug(slug);
        setService(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const staticService = staticServices.find(s => s.title.toLowerCase().includes(slug?.toLowerCase() || ''));

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-theme-page flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayService = service || (staticService ? {
    id: '',
    title: staticService.title,
    slug: slug || '',
    short_description: staticService.description,
    details: null,
    images: [],
    price: null,
    features: [],
    is_published: true,
    sort_order: 0,
    created_at: '',
    updated_at: '',
    category_id: null,
    category: null,
  } : null);

  if (!displayService) {
    return (
      <div className="pt-20 min-h-screen bg-theme-page flex items-center justify-center">
        <div className="text-center bg-theme-surface rounded-2xl p-12 shadow-theme-card border border-theme-border max-w-md">
          <h2 className="text-xl font-bold text-theme-text mb-4">الخدمة غير موجودة</h2>
          <p className="text-theme-text-secondary mb-6">لم نتمكن من العثور على هذه الخدمة.</p>
          <Link to="/services" className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold">
            <ArrowLeft className="w-5 h-5" />
            العودة للخدمات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-theme-page min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/services" className="inline-flex items-center gap-2 text-theme-text-secondary hover:text-theme-primary mb-8">
          <ArrowLeft className="w-5 h-5" />
          العودة للخدمات
        </Link>

        <div className="bg-theme-surface rounded-2xl shadow-theme-card border border-theme-border overflow-hidden">
<div className="aspect-video w-full bg-theme-muted">
  <ServiceImageSlider
    images={displayService.images}
    alt={displayService.title}
  />
</div>

          <div className="p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-theme-text mb-4">{displayService.title}</h1>

            {displayService.short_description && (
              <p className="text-theme-text-secondary text-lg leading-relaxed mb-6">{displayService.short_description}</p>
            )}

            {displayService.price && (
              <div className="bg-theme-primary-soft rounded-xl p-4 mb-6 inline-flex items-center gap-2">
                <span className="text-theme-text-secondary text-sm">السعر:</span>
                <span className="text-2xl font-bold text-theme-primary">{displayService.price}</span>
              </div>
            )}

            {displayService.details && (
              <div className="prose prose-teal max-w-none text-theme-text leading-relaxed mb-6">
                {displayService.details.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            )}

            {displayService.features && displayService.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-theme-text mb-4">المميزات</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {displayService.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 bg-theme-muted rounded-lg px-4 py-3">
                      <Check className="w-5 h-5 text-theme-primary flex-shrink-0" />
                      <span className="text-theme-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-l from-teal-500 to-teal-600 rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">هل تحتاج هذه الخدمة؟</h3>
              <p className="text-teal-100 mb-4">تواصل معنا للحصول على عرض مخصص</p>
              {siteSettings.whatsapp_enabled && (
                <a
                  href={getWhatsAppLink(`مرحبًا، أريد الاستفسار عن خدمة: ${displayService.title}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل معنا
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
