import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { freeAudit, getWhatsAppLink, WHATSAPP_NUMBER } from '../data/content';

const FreeAudit = () => {
  const { ref, isInView } = useInView(0.05);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [accountUrl, setAccountUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = projectName || accountUrl || projectType
      ? `مرحبًا، أريد الحصول على تحليل مجاني لمشروعي.

اسم المشروع: ${projectName || 'غير محدد'}
نوع المشروع: ${projectType || 'غير محدد'}
رابط الحساب: ${accountUrl || 'غير محدد'}`
      : `مرحبًا، أريد الحصول على تحليل مجاني لمشروعي.`;
    window.open(getWhatsAppLink(message), '_blank');
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            مجاني تمامًا
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-navy-800 mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {freeAudit.title}
          </h1>
          <p className={`text-gray-600 text-lg leading-[1.9] transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {freeAudit.description}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="projectName" className="block text-navy-800 font-semibold text-sm mb-2 text-right">
                  {freeAudit.projectNameLabel}
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={freeAudit.projectNamePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300 text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label htmlFor="projectType" className="block text-navy-800 font-semibold text-sm mb-2 text-right">
                  {freeAudit.projectTypeLabel}
                </label>
                <input
                  type="text"
                  id="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder={freeAudit.projectTypePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300 text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label htmlFor="accountUrl" className="block text-navy-800 font-semibold text-sm mb-2 text-right">
                  {freeAudit.accountUrlLabel}
                </label>
                <input
                  type="text"
                  id="accountUrl"
                  value={accountUrl}
                  onChange={(e) => setAccountUrl(e.target.value)}
                  placeholder={freeAudit.accountUrlPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300 text-right"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 mt-4"
              >
                {freeAudit.submitButton}
              </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-6">
              سيتم التواصل معك مباشرة عبر واتساب على الرقم{' '}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 font-semibold"
                dir="ltr"
              >
                +966 51 190 0937
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreeAudit;
