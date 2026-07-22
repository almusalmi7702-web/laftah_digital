import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, MessageCircle } from 'lucide-react';
import { usePublicPortfolioBySlug } from '../hooks/usePublicData';
import { messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ServiceImageSlider from '../components/ServiceImageSlider';

const PortfolioDetail = () => {
  const { slug } = useParams();
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const { data: item, isInitialLoading, notFound, error, retry } = usePublicPortfolioBySlug(slug);

  if (isInitialLoading) {
    return (
      <div className="pt-20 min-h-screen bg-theme-page flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-20 min-h-screen bg-theme-page flex items-center justify-center">
        <div className="text-center bg-theme-surface rounded-2xl p-12 shadow-theme-card border border-theme-border max-w-md">
          {notFound && !error ? (
            <>
              <h2 className="text-xl font-bold text-theme-text mb-4">العمل غير موجود</h2>
              <p className="text-theme-text-secondary mb-6">لم نتمكن من العثور على هذا العمل.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-theme-text mb-4">تعذر الاتصال</h2>
              <p className="text-theme-text-secondary mb-6">لم نتمكن من جلب البيانات. تحقق من اتصالك وحاول مرة أخرى.</p>
              <button onClick={retry} className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold mb-4">
                إعادة المحاولة
              </button>
            </>
          )}
          <Link to="/portfolio" className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold">
            <ArrowLeft className="w-5 h-5" />
            العودة للأعمال
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-theme-page min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-theme-text-secondary hover:text-theme-primary mb-8">
          <ArrowLeft className="w-5 h-5" />
          العودة للأعمال
        </Link>

        <div className="bg-theme-surface rounded-2xl shadow-theme-card border border-theme-border overflow-hidden">
          <div className="aspect-video w-full bg-theme-muted">
            <ServiceImageSlider
              images={item.images}
              alt={item.title}
            />
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-theme-text mb-2">{item.title}</h1>
                {item.category && (
                  <span className="inline-block bg-theme-primary-soft text-theme-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {item.category}
                  </span>
                )}
              </div>
              {item.external_url && (
                <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-theme-primary hover:text-theme-primary-hover">
                  <ExternalLink className="w-5 h-5" />
                  رابط
                </a>
              )}
            </div>

            {item.project_date && (
              <div className="flex items-center gap-2 text-theme-text-muted text-sm mb-6">
                <Calendar className="w-4 h-4" />
                {new Date(item.project_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
              </div>
            )}

            {item.short_description && (
              <p className="text-theme-text-secondary text-lg leading-relaxed mb-6">{item.short_description}</p>
            )}

            {item.details && (
              <div className="prose prose-teal max-w-none text-theme-text leading-relaxed">
                {item.details.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            )}
          </div>

          <div className="px-8 pb-8">
            <div className="bg-theme-primary-soft rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-theme-text mb-2">هل تريد تصميمًا مشابهًا؟</h3>
              <p className="text-theme-text-secondary mb-4">تواصل معنا لنصمم لك مشروعًا مميزًا</p>
              {siteSettings.whatsapp_enabled && (
                <a
                  href={getWhatsAppLink(messages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
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

export default PortfolioDetail;
