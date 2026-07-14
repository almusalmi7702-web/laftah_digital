import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { getPortfolioItems } from '../services/dataService';
import { portfolio as portfolioContent, messages } from '../data/content';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ImagePlaceholder from '../components/ImagePlaceholder';
import { PortfolioSkeleton } from '../components/Skeleton';
import type { PortfolioItem } from '../types/database';

const Portfolio = () => {
  const { ref, isInView } = useInView(0.05);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        setError(null);
        const data = await getPortfolioItems();
        if (mounted) {
          setItems(data);
        }
      } catch (err: any) {
        console.error('Error fetching portfolio:', err);
        if (mounted) {
          setError(err.message || 'حدث خطأ في جلب الأعمال');
          setItems([]);
        }
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

  const hasItems = items.length > 0;

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            أعمالنا
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {portfolioContent.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      {loading ? (
        <section className="py-20 bg-theme-page">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0,1,2,3,4,5].map((i) => <PortfolioSkeleton key={i} />)}
          </div>
        </section>
      ) : error ? (
        <EmptyState error={error} />
      ) : hasItems ? (
        <PortfolioGrid items={items} isInView={isInView} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

interface PortfolioGridProps {
  items: PortfolioItem[];
  isInView: boolean;
}

const PortfolioGrid = ({ items, isInView }: PortfolioGridProps) => {
  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <Link
              key={item.id}
              to={`/portfolio/${item.slug}`}
              className={`group bg-theme-surface rounded-2xl shadow-theme-card border border-theme-border overflow-hidden hover:shadow-theme-elevated transition-all duration-500 hover:-translate-y-2 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-video bg-theme-muted">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              <div className="p-6 text-right">
                {item.category && (
                  <span className="inline-block bg-theme-primary-soft text-theme-primary text-xs px-2 py-1 rounded font-semibold mb-2">
                    {item.category}
                  </span>
                )}
                <h3 className="text-lg font-bold text-theme-text mb-2">{item.title}</h3>
                {item.short_description && (
                  <p className="text-theme-text-secondary text-sm line-clamp-2">{item.short_description}</p>
                )}
                <div className="flex items-center gap-2 text-theme-primary mt-4 font-semibold text-sm group-hover:gap-3 transition-all">
                  عرض التفاصيل
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

interface EmptyStateProps {
  error?: string;
}

const EmptyState = ({ error }: EmptyStateProps) => {
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  return (
    <section className="py-20 bg-theme-page">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-theme-primary-soft to-theme-muted rounded-3xl p-12 border border-theme-border">
          <div className="w-20 h-20 bg-theme-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-theme-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-theme-text mb-4">
            {error ? 'حدث خطأ' : 'نعمل على إضافة أعمالنا'}
          </h3>
          <p className="text-theme-text-secondary leading-relaxed mb-8">
            {error || portfolioContent.emptyState}
          </p>
          {siteSettings.whatsapp_enabled && (
            <a
              href={getWhatsAppLink(messages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
            >
              تواصل معنا الآن
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
