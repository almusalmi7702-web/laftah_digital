import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, MessageCircle } from 'lucide-react';
import { getServiceBySlug } from '../services/dataService';
import { getWhatsAppLink, servicesList as staticServices } from '../data/content';
import type { Service } from '../types/database';

const ServiceDetail = () => {
  const { slug } = useParams();
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

  // Fallback to static service if database doesn't have it
  const staticService = staticServices.find(s => s.title.toLowerCase().includes(slug?.toLowerCase() || ''));

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Use database service or fallback to static
  const displayService = service || (staticService ? {
    id: '',
    title: staticService.title,
    slug: slug || '',
    short_description: staticService.description,
    details: null,
    thumbnail_url: null,
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
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-bold text-navy-800 mb-4">الخدمة غير موجودة</h2>
          <p className="text-gray-500 mb-6">لم نتمكن من العثور على هذه الخدمة.</p>
          <Link to="/services" className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold">
            <ArrowLeft className="w-5 h-5" />
            العودة للخدمات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back */}
        <Link to="/services" className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-8">
          <ArrowLeft className="w-5 h-5" />
          العودة للخدمات
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image */}
          {displayService.thumbnail_url && (
            <div className="aspect-video w-full bg-gray-100">
              <img src={displayService.thumbnail_url} alt={displayService.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-navy-800 mb-4">{displayService.title}</h1>

            {displayService.short_description && (
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{displayService.short_description}</p>
            )}

            {displayService.price && (
              <div className="bg-teal-50 rounded-xl p-4 mb-6 inline-flex items-center gap-2">
                <span className="text-gray-600 text-sm">السعر:</span>
                <span className="text-2xl font-bold text-teal-600">{displayService.price}</span>
              </div>
            )}

            {displayService.details && (
              <div className="prose prose-teal max-w-none text-gray-700 leading-relaxed mb-6">
                {displayService.details.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            )}

            {/* Features */}
            {displayService.features && displayService.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-navy-800 mb-4">المميزات</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {displayService.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                      <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-l from-teal-500 to-teal-600 rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">هل تحتاج هذه الخدمة؟</h3>
              <p className="text-teal-100 mb-4">تواصل معنا للحصول على عرض مخصص</p>
              <a
                href={getWhatsAppLink(`مرحبًا، أريد الاستفسار عن خدمة: ${displayService.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل معنا
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
