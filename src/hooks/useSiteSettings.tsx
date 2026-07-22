import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
} from '../data/content';
import {
  getPublicSiteSettings,
  getPublicSocialLinks,
  forceRefreshResource,
  onCrossTabUpdate,
} from '../lib/publicDataClient';
import type { SiteSettings, SocialLink } from '../types/settings';

// ---- Fallback values (kept in sync with content.ts) ----
const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  whatsapp_number: WHATSAPP_NUMBER,
  whatsapp_display: WHATSAPP_DISPLAY,
  whatsapp_enabled: true,
  contact_email: 'info@laftahdigital.com',
  email_enabled: true,
  updated_at: null,
};

export const cleanWhatsAppNumber = (raw: string): string =>
  (raw || '').replace(/[^\d]/g, '');

interface SiteSettingsContextValue {
  siteSettings: SiteSettings;
  socialLinks: SocialLink[];
  activeSocialLinks: SocialLink[];
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  getWhatsAppLink: (message: string) => string;
  getCleanWhatsAppNumber: () => string;
}

const SiteSettingsContext = createContext<
  SiteSettingsContextValue | undefined
>(undefined);

export const SiteSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const [settingsResult, linksResult] = await Promise.all([
        getPublicSiteSettings(),
        getPublicSocialLinks(),
      ]);

      if (settingsResult.data) {
        setSiteSettings(settingsResult.data);
        setError(null);
      } else if (settingsResult.error) {
        setError(settingsResult.error);
      }

      if (linksResult.data) {
        setSocialLinks(linksResult.data);
      }
    } catch (err) {
      console.error('Site settings fetch failed:', err);
      setError(err instanceof Error ? err.message : 'fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Force refresh — bypasses cache, used after admin invalidation and cross-tab sync
  const forceRefreshSettings = useCallback(async () => {
    try {
      const [settingsResult, linksResult] = await Promise.all([
        forceRefreshResource<SiteSettings>('site-settings'),
        forceRefreshResource<SocialLink[]>('social-links'),
      ]);

      if (settingsResult.data) {
        setSiteSettings(settingsResult.data);
        setError(null);
      }
      if (linksResult.data) {
        setSocialLinks(linksResult.data);
      }
    } catch (err) {
      console.error('Site settings force refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Cross-tab sync: force refresh when another tab updates the cache
  useEffect(() => {
    const unsubscribe = onCrossTabUpdate((resource) => {
      if (resource === 'site-settings' || resource === 'social-links' || resource === 'home') {
        forceRefreshSettings();
      }
    });
    return unsubscribe;
  }, [forceRefreshSettings]);

  const getCleanWhatsAppNumber = useCallback(
    () => cleanWhatsAppNumber(siteSettings.whatsapp_number),
    [siteSettings.whatsapp_number]
  );

  const getWhatsAppLink = useCallback(
    (message: string): string => {
      const num = cleanWhatsAppNumber(siteSettings.whatsapp_number);
      return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    },
    [siteSettings.whatsapp_number]
  );

  const activeSocialLinks = socialLinks.filter((l) => l.is_active);

  const value: SiteSettingsContextValue = {
    siteSettings,
    socialLinks,
    activeSocialLinks,
    loading,
    error,
    refreshSettings,
    getWhatsAppLink,
    getCleanWhatsAppNumber,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return ctx;
};
