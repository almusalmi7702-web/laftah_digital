import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
} from '../data/content';
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

const STORAGE_KEY = 'laftah_settings_cache_v1';
const TIMEOUT_MS = 12000;

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

const getCachedSettings = (): SiteSettings | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.whatsapp_number === 'string') {
      return parsed as SiteSettings;
    }
  } catch {
    // ignore
  }
  return null;
};

export const SiteSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(
    () => getCachedSettings() ?? FALLBACK_SETTINGS
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    const configured = isSupabaseConfigured();
    if (!configured) {
      setSiteSettings(FALLBACK_SETTINGS);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const [settingsRes, linksRes] = await Promise.all([
        supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle(),
        supabase
          .from('social_links')
          .select('*')
          .order('sort_order', { ascending: true }),
      ]);

      if (settingsRes.error) {
        console.error('site_settings error:', settingsRes.error);
        setError(settingsRes.error.message);
      } else if (settingsRes.data) {
        const next: SiteSettings = settingsRes.data as SiteSettings;
        setSiteSettings(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        setError(null);
      }

      if (linksRes.error) {
        console.error('social_links error:', linksRes.error);
        setSocialLinks([]);
      } else {
        setSocialLinks((linksRes.data as SocialLink[]) ?? []);
      }
    } catch (err) {
      console.error('Site settings fetch failed:', err);
      setError(err instanceof Error ? err.message : 'fetch failed');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

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
