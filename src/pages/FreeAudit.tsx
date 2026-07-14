import { useState } from 'react';
import { Eye, MessageCircle, Mail } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { freeAudit } from '../data/content';

const FreeAudit = () => {
  const { ref, isInView } = useInView(0.05);
  const { siteSettings, getWhatsAppLink } = useSiteSettings();
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [accountUrl, setAccountUrl] = useState('');

  const buildMessage = () =>
    projectName || accountUrl || projectType
      ? `مرحبًا، أريد الحصول على تحليل مجاني لمشروعي.

اسم المشروع: ${projectName || 'غير محدد'}
نوع المشروع: ${projectType || 'غير محدد'}
رابط الحساب: ${accountUrl || 'غير محدد'}`
      : `مرحبًا، أريد الحصول على تحليل مجاني لمشروعي.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = buildMessage();
    if (siteSettings.whatsapp_enabled) {
      window.open(getWhatsAppLink(message), '_blank');
    } else if (siteSettings.email_enabled) {
      window.location.href = `mailto:${siteSettings.contact_email}?subject=${encodeURIComponent(
        'طلب تحليل مجاني لمشروعي'
      )}&body=${encodeURIComponent(message)}`;
    }
  };

  const channelsDisabled =
    !siteSettings.whatsapp_enabled && !siteSettings.email_enabled;

  const submitLabel = siteSettings.whatsapp_enabled
    ? freeAudit.submitButton
    : siteSettings.email_enabled
    ? 'احصل على التحليل عبر البريد'
    : 'التواصل غير متاح مؤقتًا';

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-bl from-theme-muted via-theme-page to-theme-primary-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
          <span className="inline-block bg-theme-primary-soft text-theme-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            مجاني تمامًا
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-theme-text mb-6 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {freeAudit.title}
          </h1>
          <p className={`text-theme-text-secondary text-lg leading-[1.9] transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {freeAudit.description}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-theme-page">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`bg-theme-surface rounded-3xl shadow-theme-elevated border border-theme-border p-8 md:p-12 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>

            {channelsDisabled ? (
              <div className="text-center py-8">
                <p className="text-theme-text-secondary leading-relaxed">
                  التواصل غير متاح مؤقتًا. يرجى المحاولة لاحقًا.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="projectName" className="block text-theme-text font-semibold text-sm mb-2 text-right">
                    {freeAudit.projectNameLabel}
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder={freeAudit.projectNamePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all duration-300 text-right placeholder:text-theme-text-muted"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-theme-text font-semibold text-sm mb-2 text-right">
                    {freeAudit.projectTypeLabel}
                  </label>
                  <input
                    type="text"
                    id="projectType"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder={freeAudit.projectTypePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all duration-300 text-right placeholder:text-theme-text-muted"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label htmlFor="accountUrl" className="block text-theme-text font-semibold text-sm mb-2 text-right">
                    {freeAudit.accountUrlLabel}
                  </label>
                  <input
                    type="text"
                    id="accountUrl"
                    value={accountUrl}
                    onChange={(e) => setAccountUrl(e.target.value)}
                    placeholder={freeAudit.accountUrlPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all duration-300 text-right placeholder:text-theme-text-muted"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 mt-4"
                >
                  {siteSettings.whatsapp_enabled ? (
                    <MessageCircle className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                  {submitLabel}
                </button>
              </form>
            )}

            {!channelsDisabled && siteSettings.whatsapp_enabled && (
              <p className="text-center text-theme-text-muted text-xs mt-6">
                سيتم التواصل معك مباشرة عبر واتساب على الرقم{' '}
                <span className="text-theme-primary font-semibold" dir="ltr">
                  {siteSettings.whatsapp_display}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreeAudit;
