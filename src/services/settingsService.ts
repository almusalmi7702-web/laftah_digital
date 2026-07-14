import { supabase } from '../lib/supabase';
import type {
  SiteSettings,
  SiteSettingsUpdate,
  SocialLink,
  SocialLinkInsert,
  SocialLinkUpdate,
} from '../types/settings';

const TIMEOUT_MS = 12000;

const extractMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg) return msg;
  }
  if (typeof error === 'string' && error) return error;
  return fallback;
};

async function withTimeout<T>(
  promise: PromiseLike<{ data: T | null; error: unknown }>,
  ms: number = TIMEOUT_MS
): Promise<{ data: T | null; error: unknown }> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى')),
      ms
    )
  );
  try {
    return (await Promise.race([promise, timeout])) as {
      data: T | null;
      error: unknown;
    };
  } catch (error) {
    return { data: null, error };
  }
}

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const { data, error } = await withTimeout<SiteSettings>(
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  );
  if (error) {
    console.error('getSiteSettings error:', error);
    return null;
  }
  return data;
};

export const updateSiteSettings = async (
  update: SiteSettingsUpdate
): Promise<SiteSettings> => {
  const { data, error } = await withTimeout<SiteSettings>(
    supabase
      .from('site_settings')
      .update(update)
      .eq('id', 1)
      .select()
      .maybeSingle()
  );
  if (error) {
    throw new Error(extractMessage(error, 'تعذر حفظ الإعدادات. حاول مرة أخرى.'));
  }
  if (!data) {
    throw new Error('تعذر حفظ الإعدادات. حاول مرة أخرى.');
  }
  return data;
};

export const getAllSocialLinks = async (): Promise<SocialLink[]> => {
  const { data, error } = await withTimeout<SocialLink[]>(
    supabase
      .from('social_links')
      .select('*')
      .order('sort_order', { ascending: true })
  );
  if (error) {
    throw new Error(extractMessage(error, 'تعذر جلب وسائل التواصل.'));
  }
  return data ?? [];
};

export const createSocialLink = async (
  link: SocialLinkInsert
): Promise<SocialLink> => {
  const { data, error } = await withTimeout<SocialLink>(
    supabase.from('social_links').insert(link).select().single()
  );
  if (error) {
    throw new Error(extractMessage(error, 'تعذر إضافة وسيلة التواصل.'));
  }
  if (!data) throw new Error('تعذر إضافة وسيلة التواصل.');
  return data;
};

export const updateSocialLink = async (
  id: string,
  link: SocialLinkUpdate
): Promise<SocialLink> => {
  const { data, error } = await withTimeout<SocialLink>(
    supabase
      .from('social_links')
      .update(link)
      .eq('id', id)
      .select()
      .single()
  );
  if (error) {
    throw new Error(extractMessage(error, 'تعذر تحديث وسيلة التواصل.'));
  }
  if (!data) throw new Error('تعذر تحديث وسيلة التواصل.');
  return data;
};

export const deleteSocialLink = async (id: string): Promise<void> => {
  const { error } = await withTimeout<null>(
    supabase.from('social_links').delete().eq('id', id)
  );
  if (error) {
    throw new Error(extractMessage(error, 'تعذر حذف وسيلة التواصل.'));
  }
};
