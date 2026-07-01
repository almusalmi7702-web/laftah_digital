import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { getFaqs } from '../services/dataService';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isInView } = useInView();

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const data = await getFaqs();
        if (mounted) {
          setFaqs(data);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl md:text-3xl font-black text-navy-800 text-center mb-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          أسئلة شائعة
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={faq.id}
              className={`bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-right flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors"
              >
                <span className={`text-lg font-bold transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-teal-600' : 'text-gray-400'}`}>
                  +
                </span>
                <span className="font-semibold text-navy-800">{faq.question}</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-right border-t border-gray-200 pt-4 bg-white">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
