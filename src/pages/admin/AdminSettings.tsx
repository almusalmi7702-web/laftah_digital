import { useState, useEffect } from 'react';
import { Save, Loader2, Plus, CreditCard as Edit, Trash2, Eye, EyeOff, X, GripVertical, Facebook, Instagram, Music2, Ghost } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import {
  getSiteSettings,
  updateSiteSettings,
  getAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../services/settingsService';
import type { SocialLink } from '../../types/settings';

const emailIsValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const urlIsValid = (url: string): boolean =>
  /^https?:\/\/.+/i.test(url);

// Central icon/color mapping for known platforms.
const PLATFORM_META: Record<
  string,
  { icon: typeof Facebook; color: string }
> = {
  facebook: { icon: Facebook, color: 'from-blue-500 to-blue-700' },
  instagram: { icon: Instagram, color: 'from-pink-400 to-rose-500' },
  tiktok: { icon: Music2, color: 'from-gray-700 to-gray-900' },
  snapchat: { icon: Ghost, color: 'from-yellow-300 to-yellow-500' },
};

const getPlatformMeta = (platform: string) =>
  PLATFORM_META[platform?.toLowerCase()] ?? {
    icon: Plus,
    color: 'from-teal-400 to-teal-600',
  };

const AdminSettings = () => {
  const { showToast, ToastPortal } = useToast();
  const { refreshSettings } = useSiteSettings();

  // ---- Contact settings ----
  const [contactForm, setContactForm] = useState({
    whatsapp_number: '',
    whatsapp_display: '',
    whatsapp_enabled: true,
    contact_email: '',
    email_enabled: true,
  });
  const [contactLoading, setContactLoading] = useState(true);
  const [contactSaving, setContactSaving] = useState(false);

  // ---- Social links ----
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [linkForm, setLinkForm] = useState({
    platform: '',
    label: '',
    username: '',
    url: '',
    is_active: true,
    sort_order: 0,
  });
  const [linkSaving, setLinkSaving] = useState(false);
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);

  useEffect(() => {
    fetchContact();
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContact = async () => {
    setContactLoading(true);
    try {
      const data = await getSiteSettings();
      if (data) {
        setContactForm({
          whatsapp_number: data.whatsapp_number || '',
          whatsapp_display: data.whatsapp_display || '',
          whatsapp_enabled: data.whatsapp_enabled,
          contact_email: data.contact_email || '',
          email_enabled: data.email_enabled,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('error', 'تعذر جلب الإعدادات. حاول مرة أخرى.');
    } finally {
      setContactLoading(false);
    }
  };

  const fetchLinks = async () => {
    setLinksLoading(true);
    try {
      const data = await getAllSocialLinks();
      setLinks(data);
    } catch (error: unknown) {
      console.error('Error fetching social links:', error);
      const msg = (error as { message?: string })?.message;
      showToast('error', msg || 'تعذر جلب وسائل التواصل.');
    } finally {
      setLinksLoading(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactSaving) return;

    if (contactForm.whatsapp_enabled) {
      const cleaned = contactForm.whatsapp_number.replace(/[^\d]/g, '');
      if (!cleaned) {
        showToast('error', 'رقم واتساب مطلوب عند تفعيل واتساب.');
        return;
      }
      if (!contactForm.whatsapp_display.trim()) {
        showToast('error', 'الرقم الظاهر مطلوب عند تفعيل واتساب.');
        return;
      }
    }
    if (contactForm.email_enabled) {
      if (!contactForm.contact_email.trim()) {
        showToast('error', 'البريد الإلكتروني مطلوب عند تفعيل البريد.');
        return;
      }
      if (!emailIsValid(contactForm.contact_email)) {
        showToast('error', 'البريد الإلكتروني غير صحيح.');
        return;
      }
    }

    setContactSaving(true);
    try {
      await updateSiteSettings({
        whatsapp_number: contactForm.whatsapp_number.replace(/[^\d]/g, ''),
        whatsapp_display: contactForm.whatsapp_display.trim(),
        whatsapp_enabled: contactForm.whatsapp_enabled,
        contact_email: contactForm.contact_email.trim(),
        email_enabled: contactForm.email_enabled,
      });
      showToast('success', 'تم حفظ إعدادات التواصل بنجاح.');
      await refreshSettings();
    } catch (error: unknown) {
      console.error('Save settings error:', error);
      const msg = (error as { message?: string })?.message;
      showToast('error', msg || 'تعذر حفظ الإعدادات. حاول مرة أخرى.');
    } finally {
      setContactSaving(false);
    }
  };

  // ---- Social link form helpers ----
  const startNewLink = () => {
    setEditingLink(null);
    setLinkForm({
      platform: '',
      label: '',
      username: '',
      url: '',
      is_active: true,
      sort_order: links.length + 1,
    });
    setShowLinkForm(true);
  };

  const startEditLink = (link: SocialLink) => {
    setEditingLink(link);
    setLinkForm({
      platform: link.platform,
      label: link.label,
      username: link.username || '',
      url: link.url,
      is_active: link.is_active,
      sort_order: link.sort_order,
    });
    setShowLinkForm(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkSaving) return;

    const platform = linkForm.platform.trim().toLowerCase().replace(/\s+/g, '');
    const label = linkForm.label.trim();
    const url = linkForm.url.trim();
    const sortOrder = Number(linkForm.sort_order);

    if (!platform) {
      showToast('error', 'اسم المنصة مطلوب.');
      return;
    }
    if (!label) {
      showToast('error', 'الاسم الظاهر مطلوب.');
      return;
    }
    if (!url) {
      showToast('error', 'الرابط مطلوب.');
      return;
    }
    if (!urlIsValid(url)) {
      showToast('error', 'الرابط يجب أن يبدأ بـ http:// أو https://');
      return;
    }
    if (Number.isNaN(sortOrder)) {
      showToast('error', 'ترتيب الظهور يجب أن يكون رقمًا صحيحًا.');
      return;
    }

    setLinkSaving(true);
    try {
      const payload = {
        platform,
        label,
        username: linkForm.username.trim() || null,
        url,
        is_active: linkForm.is_active,
        sort_order: sortOrder,
      };
      if (editingLink) {
        await updateSocialLink(editingLink.id, payload);
        showToast('success', 'تم تحديث وسيلة التواصل بنجاح.');
      } else {
        await createSocialLink(payload);
        showToast('success', 'تمت إضافة وسيلة التواصل بنجاح.');
      }
      setShowLinkForm(false);
      await fetchLinks();
      await refreshSettings();
    } catch (error: unknown) {
      console.error('Save link error:', error);
      const msg = (error as { message?: string })?.message;
      showToast('error', msg || 'تعذر تنفيذ العملية. حاول مرة أخرى.');
    } finally {
      setLinkSaving(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deleteLinkId) return;
    try {
      await deleteSocialLink(deleteLinkId);
      setLinks(links.filter((l) => l.id !== deleteLinkId));
      showToast('success', 'تم حذف وسيلة التواصل بنجاح.');
      await refreshSettings();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message;
      showToast('error', msg || 'تعذر تنفيذ العملية. حاول مرة أخرى.');
    } finally {
      setDeleteLinkId(null);
    }
  };

  const toggleLinkActive = async (link: SocialLink) => {
    try {
      await updateSocialLink(link.id, { is_active: !link.is_active });
      setLinks(
        links.map((l) =>
          l.id === link.id ? { ...l, is_active: !l.is_active } : l
        )
      );
      showToast('success', link.is_active ? 'تم إخفاء الوسيلة' : 'تم تفعيل الوسيلة');
      await refreshSettings();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message;
      showToast('error', msg || 'تعذر تنفيذ العملية. حاول مرة أخرى.');
    }
  };

  return (
    <>
      {ToastPortal}
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-theme-text">الإعدادات</h1>
          <p className="text-theme-text-secondary mt-1">إعدادات الموقع ووسائل التواصل</p>
        </div>

        {/* Contact Settings */}
        <section className="bg-theme-surface rounded-xl shadow-theme-card border border-theme-border p-6 mb-8">
          <h2 className="text-lg font-bold text-theme-text mb-6">إعدادات التواصل</h2>

          {contactLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSaveContact} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    رقم واتساب الداخلي <span className="text-theme-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactForm.whatsapp_number}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, whatsapp_number: e.target.value })
                    }
                    placeholder="966511900937"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  />
                  <p className="text-xs text-theme-text-muted mt-1">أرقام فقط، سيتم التنظيف تلقائيًا.</p>
                </div>
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    الرقم الظاهر <span className="text-theme-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactForm.whatsapp_display}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, whatsapp_display: e.target.value })
                    }
                    placeholder="+966 51 190 0937"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    البريد الإلكتروني <span className="text-theme-danger">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactForm.contact_email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, contact_email: e.target.value })
                    }
                    placeholder="info@laftahdigital.com"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  />
                </div>
                <div className="flex flex-col gap-4 justify-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactForm.whatsapp_enabled}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, whatsapp_enabled: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-theme-input-border text-theme-primary focus:ring-theme-primary"
                    />
                    <span className="font-semibold text-theme-text">تفعيل واتساب</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactForm.email_enabled}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email_enabled: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-theme-input-border text-theme-primary focus:ring-theme-primary"
                    />
                    <span className="font-semibold text-theme-text">تفعيل البريد</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={contactSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contactSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      حفظ إعدادات التواصل
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Social Links Management */}
        <section className="bg-theme-surface rounded-xl shadow-theme-card border border-theme-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-theme-text">إدارة وسائل التواصل الاجتماعي</h2>
            <button
              onClick={startNewLink}
              className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> إضافة منصة
            </button>
          </div>

          {linksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-theme-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-theme-text mb-2">لا توجد وسائل تواصل</h3>
              <p className="text-theme-text-secondary mb-6">ابدأ بإضافة أول منصة</p>
              <button
                onClick={startNewLink}
                className="inline-flex items-center gap-2 bg-theme-primary text-white px-6 py-3 rounded-lg font-semibold"
              >
                <Plus className="w-5 h-5" /> إضافة منصة
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link) => {
                const meta = getPlatformMeta(link.platform);
                const Icon = meta.icon;
                return (
                  <div
                    key={link.id}
                    className={`bg-theme-muted rounded-xl border p-5 transition-all ${
                      link.is_active
                        ? 'border-theme-border'
                        : 'border-theme-border opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-theme-text">{link.label}</p>
                          {link.username && (
                            <p className="text-xs text-theme-text-muted" dir="ltr">
                              @{link.username}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-theme-text-muted">
                        <GripVertical className="w-3 h-3" />
                        {link.sort_order}
                      </span>
                    </div>

                    <p className="text-xs text-theme-text-secondary truncate mb-2" dir="ltr">
                      {link.url}
                    </p>

                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-3 ${
                        link.is_active
                          ? 'bg-theme-success-soft text-theme-success'
                          : 'bg-theme-muted text-theme-text-muted border border-theme-border'
                      }`}
                    >
                      {link.is_active ? 'مفعّل' : 'مخفي'}
                    </span>

                    <div className="flex items-center gap-1 pt-3 border-t border-theme-border">
                      <button
                        onClick={() => toggleLinkActive(link)}
                        className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-surface rounded-lg transition-colors"
                        title={link.is_active ? 'إخفاء' : 'تفعيل'}
                      >
                        {link.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => startEditLink(link)}
                        className="p-2 text-theme-text-secondary hover:text-theme-primary hover:bg-theme-surface rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteLinkId(link.id)}
                        className="p-2 text-theme-text-secondary hover:text-theme-danger hover:bg-theme-danger-soft rounded-lg transition-colors mr-auto"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Social link form modal */}
      {showLinkForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-theme-surface rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-theme-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-theme-text">
                {editingLink ? 'تعديل وسيلة التواصل' : 'إضافة وسيلة تواصل جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLink} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    اسم المنصة <span className="text-theme-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={linkForm.platform}
                    onChange={(e) => setLinkForm({ ...linkForm, platform: e.target.value })}
                    placeholder="facebook"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  />
                </div>
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    الاسم الظاهر <span className="text-theme-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={linkForm.label}
                    onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                    placeholder="فيسبوك"
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    value={linkForm.username}
                    onChange={(e) => setLinkForm({ ...linkForm, username: e.target.value })}
                    placeholder="laftahdigital"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                  />
                </div>
                <div>
                  <label className="block text-theme-text font-semibold text-sm mb-2">
                    ترتيب الظهور
                  </label>
                  <input
                    type="number"
                    value={linkForm.sort_order}
                    onChange={(e) =>
                      setLinkForm({ ...linkForm, sort_order: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-text font-semibold text-sm mb-2">
                  الرابط <span className="text-theme-danger">*</span>
                </label>
                <input
                  type="url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="https://www.facebook.com/laftahdigital"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-theme-input-border bg-theme-input text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all placeholder:text-theme-text-muted"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkForm.is_active}
                  onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-theme-input-border text-theme-primary focus:ring-theme-primary"
                />
                <span className="font-semibold text-theme-text">مفعّل</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLinkForm(false)}
                  className="flex-1 px-4 py-2.5 border border-theme-border rounded-lg font-semibold text-theme-text-secondary hover:bg-theme-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={linkSaving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-l from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {linkSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
                    </>
                  ) : (
                    'حفظ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteLinkId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-theme-surface rounded-xl p-6 max-w-sm w-full text-center border border-theme-border">
            <div className="w-16 h-16 bg-theme-danger-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-theme-danger" />
            </div>
            <h3 className="text-lg font-bold text-theme-text mb-2">تأكيد الحذف</h3>
            <p className="text-theme-text-secondary mb-6">هل أنت متأكد من حذف هذه الوسيلة؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteLinkId(null)}
                className="flex-1 px-4 py-2.5 border border-theme-border rounded-lg font-semibold text-theme-text-secondary hover:bg-theme-muted"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteLink}
                className="flex-1 px-4 py-2.5 bg-theme-danger text-white rounded-lg font-semibold hover:opacity-90"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSettings;
