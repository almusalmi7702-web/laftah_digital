import { Check, ArrowLeft } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { packages, getWhatsAppLink, messages } from '../data/content';

const Pricing = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            شفافية تامة
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-navy-800 mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            باقاتنا الشهرية
          </h1>
          <p className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            اختر الباقة المناسبة لمشروعك. جميع الباقات تشمل تصاميم جاهزة للنشر بمقاسات المنصات المختلفة.
          </p>
        </div>
      </section>

      {/* Packages */}
      <PackagesGrid />

      {/* Custom */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-navy-800 mb-4">تحتاج باقة مخصصة؟</h2>
          <p className="text-gray-600 mb-8">
            إذا كانت باقاتنا لا تناسب احتياجك، تواصل معنا وسنصمم لك باقة تلائم مشروعك.
          </p>
          <a
            href={getWhatsAppLink(messages.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            تواصل معنا
          </a>
        </div>
      </section>
    </div>
  );
};

const PackagesGrid = () => {
  const { ref, isInView } = useInView();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
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
              <h3 className={`text-xl font-bold mb-2 text-right ${pkg.highlighted ? 'text-white' : 'text-navy-800'}`}>
                {pkg.name}
              </h3>
              <div className="flex items-baseline justify-end gap-1 mb-8">
                <span className={`text-sm ${pkg.highlighted ? 'text-teal-100' : 'text-gray-500'}`}>ر.س / شهريًا</span>
                <span className={`text-5xl font-black ${pkg.highlighted ? 'text-white' : 'text-teal-600'}`}>{pkg.price}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {pkg.features.map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-3 justify-end text-sm ${pkg.highlighted ? 'text-teal-50' : 'text-gray-600'}`}>
                    {f}
                    <Check className={`w-5 h-5 flex-shrink-0 ${pkg.highlighted ? 'text-teal-200' : 'text-teal-500'}`} />
                  </li>
                ))}
              </ul>
              <a
                href={getWhatsAppLink(pkg.message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 ${
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
      </div>
    </section>
  );
};

export default Pricing;
