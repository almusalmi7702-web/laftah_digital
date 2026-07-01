export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  details: string | null;
  category: string | null;
  thumbnail_url: string | null;
  project_date: string | null;
  external_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioImage {
  id: string;
  portfolio_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  details: string | null;
  thumbnail_url: string | null;
  price: string | null;
  features: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: ServiceCategory | null;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string | null;
  features: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type PortfolioInsert = Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>;
export type PortfolioUpdate = Partial<PortfolioInsert>;
export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at' | 'category'>;
export type ServiceUpdate = Partial<ServiceInsert>;
export type PricingInsert = Omit<PricingPlan, 'id' | 'created_at' | 'updated_at'>;
export type PricingUpdate = Partial<PricingInsert>;
export type FaqInsert = Omit<Faq, 'id' | 'created_at' | 'updated_at'>;
export type FaqUpdate = Partial<FaqInsert>;
