import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  PortfolioItem, PortfolioImage, Service, ServiceCategory,
  PricingPlan, Faq, PortfolioInsert, PortfolioUpdate,
  ServiceInsert, ServiceUpdate, PricingInsert, PricingUpdate,
  FaqInsert, FaqUpdate
} from '../types/database';

// ============================================
// PORTFOLIO SERVICES
// ============================================

export const getPortfolioItems = async (): Promise<PortfolioItem[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio items:', error);
    return [];
  }
  return data || [];
};

export const getPortfolioItemBySlug = async (slug: string): Promise<PortfolioItem | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching portfolio item:', error);
    return null;
  }
  return data;
};

export const getPortfolioImages = async (portfolioId: string): Promise<PortfolioImage[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching portfolio images:', error);
    return [];
  }
  return data || [];
};

// Admin portfolio functions
export const getAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createPortfolioItem = async (item: PortfolioInsert): Promise<PortfolioItem> => {
  const { data, error } = await supabase
    .from('portfolio_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePortfolioItem = async (id: string, item: PortfolioUpdate): Promise<PortfolioItem> => {
  const { data, error } = await supabase
    .from('portfolio_items')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePortfolioItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const addPortfolioImage = async (portfolioId: string, imageUrl: string, altText?: string): Promise<PortfolioImage> => {
  const { data, error } = await supabase
    .from('portfolio_images')
    .insert({ portfolio_id: portfolioId, image_url: imageUrl, alt_text: altText })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePortfolioImage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('portfolio_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// SERVICE SERVICES
// ============================================

export const getServices = async (): Promise<Service[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('services')
    .select('*, category:service_categories(*)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  return data || [];
};

export const getServiceBySlug = async (slug: string): Promise<Service | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('services')
    .select('*, category:service_categories(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    return null;
  }
  return data;
};

// Admin service functions
export const getAllServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*, category:service_categories(*)')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createService = async (item: ServiceInsert): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateService = async (id: string, item: ServiceUpdate): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Service Categories
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching service categories:', error);
    return [];
  }
  return data || [];
};

// ============================================
// PRICING SERVICES
// ============================================

export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }
  return data || [];
};

// Admin pricing functions
export const getAllPricingPlans = async (): Promise<PricingPlan[]> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createPricingPlan = async (item: PricingInsert): Promise<PricingPlan> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePricingPlan = async (id: string, item: PricingUpdate): Promise<PricingPlan> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePricingPlan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// FAQ SERVICES
// ============================================

export const getFaqs = async (): Promise<Faq[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
  return data || [];
};

// Admin FAQ functions
export const getAllFaqs = async (): Promise<Faq[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createFaq = async (item: FaqInsert): Promise<Faq> => {
  const { data, error } = await supabase
    .from('faqs')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateFaq = async (id: string, item: FaqUpdate): Promise<Faq> => {
  const { data, error } = await supabase
    .from('faqs')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFaq = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// ADMIN AUTH
// ============================================

export const checkIsAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (error || !data) return false;
  return true;
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
  const [portfolio, services, pricing, faqs] = await Promise.all([
    supabase.from('portfolio_items').select('id', { count: 'exact', head: true }),
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase.from('pricing_plans').select('id', { count: 'exact', head: true }),
    supabase.from('faqs').select('id', { count: 'exact', head: true }),
  ]);

  return {
    portfolioCount: portfolio.count || 0,
    servicesCount: services.count || 0,
    pricingCount: pricing.count || 0,
    faqsCount: faqs.count || 0,
  };
};
