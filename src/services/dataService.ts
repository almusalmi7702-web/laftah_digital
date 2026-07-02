import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  PortfolioItem, PortfolioImage, Service, ServiceCategory,
  PricingPlan, Faq, PortfolioInsert, PortfolioUpdate,
  ServiceInsert, ServiceUpdate, PricingInsert, PricingUpdate,
  FaqInsert, FaqUpdate
} from '../types/database';

// ============================================
// TIMEOUT HELPER
// ============================================

const TIMEOUT_MS = 12000;

async function withTimeout<T>(
  promise: PromiseLike<any>,
  ms: number = TIMEOUT_MS
): Promise<{ data: T | null; error: any }> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('انقطع الاتصال - يرجى المحاولة مرة أخرى')), ms)
  );

  try {
    const result = await Promise.race([promise, timeout]);
    return result as { data: T | null; error: any };
  } catch (error) {
    return { data: null, error };
  }
}

// ============================================
// PORTFOLIO SERVICES
// ============================================

export const getPortfolioItems = async (): Promise<PortfolioItem[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await withTimeout<PortfolioItem[]>(
      supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('Error fetching portfolio items:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching portfolio items:', err);
    return [];
  }
};

export const getPortfolioItemBySlug = async (slug: string): Promise<PortfolioItem | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await withTimeout<PortfolioItem>(
      supabase
        .from('portfolio_items')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()
    );

    if (error) {
      console.error('Error fetching portfolio item:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error fetching portfolio item:', err);
    return null;
  }
};

export const getPortfolioItemById = async (id: string): Promise<PortfolioItem | null> => {
  try {
    const { data, error } = await withTimeout<PortfolioItem>(
      supabase
        .from('portfolio_items')
        .select('*')
        .eq('id', id)
        .single()
    );

    if (error) {
      console.error('Error fetching portfolio item by id:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error fetching portfolio item by id:', err);
    return null;
  }
};

export const getPortfolioImages = async (portfolioId: string): Promise<PortfolioImage[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await withTimeout<PortfolioImage[]>(
      supabase
        .from('portfolio_images')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('sort_order', { ascending: true })
    );

    if (error) {
      console.error('Error fetching portfolio images:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching portfolio images:', err);
    return [];
  }
};

// Admin portfolio functions
export const getAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
  try {
    const { data, error } = await withTimeout<PortfolioItem[]>(
      supabase
        .from('portfolio_items')
        .select('*')
        .order('sort_order', { ascending: true })
    );

    if (error) throw new Error(error.message || 'خطأ في جلب البيانات');
    return data || [];
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const createPortfolioItem = async (item: PortfolioInsert): Promise<PortfolioItem> => {
  try {
    const { data, error } = await withTimeout<PortfolioItem>(
      supabase
        .from('portfolio_items')
        .insert(item)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في حفظ العمل');
    if (!data) throw new Error('لم يتم إرجاع بيانات العمل المحفوظ');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const updatePortfolioItem = async (id: string, item: PortfolioUpdate): Promise<PortfolioItem> => {
  try {
    const { data, error } = await withTimeout<PortfolioItem>(
      supabase
        .from('portfolio_items')
        .update(item)
        .eq('id', id)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في تحديث العمل');
    if (!data) throw new Error('لم يتم إيجاد العمل');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const deletePortfolioItem = async (id: string): Promise<void> => {
  try {
    const { error } = await withTimeout<null>(
      supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id)
    );

    if (error) throw new Error(error.message || 'خطأ في حذف العمل');
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const addPortfolioImage = async (portfolioId: string, imageUrl: string, altText?: string): Promise<PortfolioImage> => {
  try {
    const { data, error } = await withTimeout<PortfolioImage>(
      supabase
        .from('portfolio_images')
        .insert({ portfolio_id: portfolioId, image_url: imageUrl, alt_text: altText })
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في إضافة الصورة');
    if (!data) throw new Error('لم يتم إرجاع بيانات الصورة');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const deletePortfolioImage = async (id: string): Promise<void> => {
  try {
    const { error } = await withTimeout<null>(
      supabase
        .from('portfolio_images')
        .delete()
        .eq('id', id)
    );

    if (error) throw new Error(error.message || 'خطأ في حذف الصورة');
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

// ============================================
// SERVICE SERVICES
// ============================================

export const getServices = async (): Promise<Service[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await withTimeout<Service[]>(
      supabase
        .from('services')
        .select('id,title,slug,short_description,thumbnail_url,price,sort_order,created_at')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(50),
      6000
    );

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching services:', err);
    return [];
  }
};

export const getServiceBySlug = async (slug: string): Promise<Service | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await withTimeout<Service>(
      supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()
    );

    if (error) {
      console.error('Error fetching service:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error fetching service:', err);
    return null;
  }
};

// Admin service functions
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await withTimeout<Service[]>(
      supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })
    );

    if (error) throw new Error(error.message || 'خطأ في جلب الخدمات');
    return data || [];
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const createService = async (item: ServiceInsert): Promise<Service> => {
  try {
    const { data, error } = await withTimeout<Service>(
      supabase
        .from('services')
        .insert(item)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في حفظ الخدمة');
    if (!data) throw new Error('لم يتم إرجاع بيانات الخدمة المحفوظة');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const updateService = async (id: string, item: ServiceUpdate): Promise<Service> => {
  try {
    const { data, error } = await withTimeout<Service>(
      supabase
        .from('services')
        .update(item)
        .eq('id', id)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في تحديث الخدمة');
    if (!data) throw new Error('لم يتم إيجاد الخدمة');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    const { error } = await withTimeout<null>(
      supabase
        .from('services')
        .delete()
        .eq('id', id)
    );

    if (error) throw new Error(error.message || 'خطأ في حذف الخدمة');
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

// Service Categories
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const { data, error } = await withTimeout<ServiceCategory[]>(
      supabase
        .from('service_categories')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
    );

    if (error) {
      console.error('Error fetching service categories:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching service categories:', err);
    return [];
  }
};

// ============================================
// PRICING SERVICES
// ============================================

export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await withTimeout<PricingPlan[]>(
      supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
    );

    if (error) {
      console.error('Error fetching pricing plans:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching pricing plans:', err);
    return [];
  }
};

// Admin pricing functions
export const getAllPricingPlans = async (): Promise<PricingPlan[]> => {
  try {
    const { data, error } = await withTimeout<PricingPlan[]>(
      supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true })
    );

    if (error) throw new Error(error.message || 'خطأ في جلب الباقات');
    return data || [];
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const createPricingPlan = async (item: PricingInsert): Promise<PricingPlan> => {
  try {
    const { data, error } = await withTimeout<PricingPlan>(
      supabase
        .from('pricing_plans')
        .insert(item)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في حفظ الباقة');
    if (!data) throw new Error('لم يتم إرجاع بيانات الباقة المحفوظة');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const updatePricingPlan = async (id: string, item: PricingUpdate): Promise<PricingPlan> => {
  try {
    const { data, error } = await withTimeout<PricingPlan>(
      supabase
        .from('pricing_plans')
        .update(item)
        .eq('id', id)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في تحديث الباقة');
    if (!data) throw new Error('لم يتم إيجاد الباقة');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const deletePricingPlan = async (id: string): Promise<void> => {
  try {
    const { error } = await withTimeout<null>(
      supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id)
    );

    if (error) throw new Error(error.message || 'خطأ في حذف الباقة');
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

// ============================================
// FAQ SERVICES
// ============================================

export const getFaqs = async (): Promise<Faq[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await withTimeout<Faq[]>(
      supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
    );

    if (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    return [];
  }
};

// Admin FAQ functions
export const getAllFaqs = async (): Promise<Faq[]> => {
  try {
    const { data, error } = await withTimeout<Faq[]>(
      supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true })
    );

    if (error) throw new Error(error.message || 'خطأ في جلب الأسئلة');
    return data || [];
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const createFaq = async (item: FaqInsert): Promise<Faq> => {
  try {
    const { data, error } = await withTimeout<Faq>(
      supabase
        .from('faqs')
        .insert(item)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في حفظ السؤال');
    if (!data) throw new Error('لم يتم إرجاع بيانات السؤال المحفوظ');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const updateFaq = async (id: string, item: FaqUpdate): Promise<Faq> => {
  try {
    const { data, error } = await withTimeout<Faq>(
      supabase
        .from('faqs')
        .update(item)
        .eq('id', id)
        .select()
        .single()
    );

    if (error) throw new Error(error.message || 'خطأ في تحديث السؤال');
    if (!data) throw new Error('لم يتم إيجاد السؤال');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

export const deleteFaq = async (id: string): Promise<void> => {
  try {
    const { error } = await withTimeout<null>(
      supabase
        .from('faqs')
        .delete()
        .eq('id', id)
    );

    if (error) throw new Error(error.message || 'خطأ في حذف السؤال');
  } catch (err: any) {
    throw new Error(err.message || 'خطأ في الاتصال بقاعدة البيانات');
  }
};

// ============================================
// ADMIN AUTH
// ============================================

export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await withTimeout<{ id: string }>(
      supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single()
    );

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
};

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = async (): Promise<{
  portfolioCount: number;
  servicesCount: number;
  pricingCount: number;
  faqsCount: number;
}> => {
  try {
    const [portfolioRes, servicesRes, pricingRes, faqsRes] = await Promise.all([
      withTimeout<{ id: string }[]>(supabase.from('portfolio_items').select('id')),
      withTimeout<{ id: string }[]>(supabase.from('services').select('id')),
      withTimeout<{ id: string }[]>(supabase.from('pricing_plans').select('id')),
      withTimeout<{ id: string }[]>(supabase.from('faqs').select('id')),
    ]);

    return {
      portfolioCount: portfolioRes.data?.length || 0,
      servicesCount: servicesRes.data?.length || 0,
      pricingCount: pricingRes.data?.length || 0,
      faqsCount: faqsRes.data?.length || 0,
    };
  } catch {
    return {
      portfolioCount: 0,
      servicesCount: 0,
      pricingCount: 0,
      faqsCount: 0,
    };
  }
};
