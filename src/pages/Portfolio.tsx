import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { portfolio } from '../data/content';

const Portfolio = () => {
  const { ref, isInView } = useInView(0.05);
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            نماذج أعمالنا
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-navy-800 mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {portfolio.title}
          </h1>
          <p className={`text-gray-500 text-lg transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {portfolio.subtitle}
          </p>
        </div>
      </section>

      {/* Gallery */}
      <GallerySection activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

interface GalleryProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const GallerySection = ({ activeTab, setActiveTab }: GalleryProps) => {
  const { ref, isInView } = useInView();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Tabs */}
        <div className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {portfolio.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.placeholders.map((item, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${item.gradient} p-8 flex flex-col items-center justify-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-white text-center">
                <Palette className="w-12 h-12 mx-auto mb-4 opacity-70" />
                <p className="text-sm font-semibold opacity-90">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className={`text-center mt-12 text-gray-400 text-sm transition-all duration-700 delay-300 ${isInView ? 'opacity-100' : 'opacity-0'}`}>
          سيتم إضافة أعمال حقيقية قريبًا
        </p>
      </div>
    </section>
  );
};

export default Portfolio;
