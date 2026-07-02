import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, MessageCircle } from 'lucide-react';
import { getPortfolioItemBySlug, getPortfolioImages } from '../services/dataService';
import { getWhatsAppLink, messages } from '../data/content';
import ImagePlaceholder from '../components/ImagePlaceholder';
import type { PortfolioItem, PortfolioImage } from '../types/database';

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      try {
        const data = await getPortfolioItemBySlug(slug);
        if (data) {
          setItem(data);
          const imgs = await getPortfolioImages(data.id);
          setImages(imgs);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-bold text-navy-800 mb-4">العمل غير موجود</h2>
          <p className="text-gray-500 mb-6">لم نتمكن من العثور على هذا العمل.</p>
          <Link to="/portfolio" className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold">
            <ArrowLeft className="w-5 h-5" />
            العودة للأعمال
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-8">
          <ArrowLeft className="w-5 h-5" />
          العودة للأعمال
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {item.thumbnail_url ? (
            <div className="aspect-video w-full bg-gray-100">
              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video w-full">
              <ImagePlaceholder variant="full" />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">{item.title}</h1>
                {item.category && (
                  <span className="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.category}
                  </span>
                )}
              </div>
              {item.external_url && (
                <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                  <ExternalLink className="w-5 h-5" />
                  رابط
                </a>
              )}
            </div>

            {item.project_date && (
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <Calendar className="w-4 h-4" />
                {new Date(item.project_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
              </div>
            )}

            {item.short_description && (
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{item.short_description}</p>
            )}

            {item.details && (
              <div className="prose prose-teal max-w-none text-gray-700 leading-relaxed">
                {item.details.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-navy-800 mb-4">معرض الصور</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-8 pb-8">
            <div className="bg-teal-50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-navy-800 mb-2">هل تريد تصميمًا مشابهًا؟</h3>
              <p className="text-gray-600 mb-4">تواصل معنا لنصمم لك مشروعًا مميزًا</p>
              <a
                href={getWhatsAppLink(messages.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
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

export default PortfolioDetail;
