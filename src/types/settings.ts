export interface SiteSettings {
  id: number;
  whatsapp_number: string;
  whatsapp_display: string;
  whatsapp_enabled: boolean;
  contact_email: string;
  email_enabled: boolean;
  updated_at: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  username: string | null;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SiteSettingsUpdate = Partial<
  Omit<SiteSettings, 'id' | 'updated_at'>
>;

export type SocialLinkInsert = Omit<
  SocialLink,
  'id' | 'created_at' | 'updated_at'
>;

export type SocialLinkUpdate = Partial<SocialLinkInsert>;
