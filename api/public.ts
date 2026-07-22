/**
 * Same-origin public API for laftahdigital.com.
 *
 * Instead of the browser hitting Supabase directly (which can be slow/blocked
 * for some ISPs), this serverless function fetches public data from Supabase
 * server-side and returns it with CDN-friendly cache headers.
 *
 * Security:
 * - Allowlist of public resources only (no admin tables, no arbitrary queries)
 * - Uses SUPABASE_ANON_KEY only (never service role)
 * - No keys in client code or logs
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface VercelRequest {
  query?: Record<string, string | string[]>;
  method?: string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
  json: (body: unknown) => void;
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

// ============================================
// CONFIG
// ============================================

const CACHE_CONTROL_PUBLIC = 'public, s-maxage=60, stale-while-revalidate=86400';
const CACHE_CONTROL_SHORT = 'public, s-maxage=30, stale-while-revalidate=300';

const ALLOWED_RESOURCES = new Set([
  'services',
  'services-by-slug',
  'portfolio',
  'portfolio-by-slug',
  'pricing',
  'faqs',
  'site-settings',
  'social-links',
  'home',
]);

// ============================================
// SUPABASE CLIENT (server-side, per invocation)
// ============================================

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ============================================
// DATA FETCHERS
// ============================================

async function fetchResource(
  supabase: SupabaseClient,
  resource: string,
  slug?: string
): Promise<{ data: unknown; notFound: boolean; status: number }> {
  switch (resource) {
    case 'services': {
      const { data, error } = await supabase
        .from('services')
        .select('id,title,slug,short_description,images,price,sort_order,created_at')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return { data: null, notFound: false, status: 500 };
      return { data: data || [], notFound: false, status: 200 };
    }

    case 'services-by-slug': {
      if (!slug) return { data: null, notFound: true, status: 404 };
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return { data: null, notFound: true, status: 404 };
        return { data: null, notFound: false, status: 500 };
      }
      return { data, notFound: false, status: 200 };
    }

    case 'portfolio': {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) return { data: null, notFound: false, status: 500 };
      return { data: data || [], notFound: false, status: 200 };
    }

    case 'portfolio-by-slug': {
      if (!slug) return { data: null, notFound: true, status: 404 };
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return { data: null, notFound: true, status: 404 };
        return { data: null, notFound: false, status: 500 };
      }
      return { data, notFound: false, status: 200 };
    }

    case 'pricing': {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, notFound: false, status: 500 };
      return { data: data || [], notFound: false, status: 200 };
    }

    case 'faqs': {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, notFound: false, status: 500 };
      return { data: data || [], notFound: false, status: 200 };
    }

    case 'site-settings': {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) return { data: null, notFound: false, status: 500 };
      if (!data) return { data: null, notFound: true, status: 404 };
      return { data, notFound: false, status: 200 };
    }

    case 'social-links': {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) return { data: null, notFound: false, status: 500 };
      return { data: data || [], notFound: false, status: 200 };
    }

    case 'home': {
      const [services, portfolio, pricing, faqs, settings, social] = await Promise.allSettled([
        supabase.from('services').select('id,title,slug,short_description,images,price,sort_order,created_at').eq('is_published', true).order('sort_order', { ascending: true }).limit(8),
        supabase.from('portfolio_items').select('*').eq('is_published', true).order('sort_order', { ascending: true }).limit(8),
        supabase.from('pricing_plans').select('*').eq('is_published', true).order('sort_order', { ascending: true }),
        supabase.from('faqs').select('*').eq('is_published', true).order('sort_order', { ascending: true }).limit(5),
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('social_links').select('*').order('sort_order', { ascending: true }),
      ]);

      return {
        data: {
          services: services.status === 'fulfilled' ? (services.value.data || []) : [],
          portfolio: portfolio.status === 'fulfilled' ? (portfolio.value.data || []) : [],
          pricing: pricing.status === 'fulfilled' ? (pricing.value.data || []) : [],
          faqs: faqs.status === 'fulfilled' ? (faqs.value.data || []) : [],
          siteSettings: settings.status === 'fulfilled' ? settings.value.data : null,
          socialLinks: social.status === 'fulfilled' ? (social.value.data || []) : [],
        },
        notFound: false,
        status: 200,
      };
    }

    default:
      return { data: null, notFound: true, status: 404 };
  }
}

// ============================================
// HANDLER
// ============================================

const handler: Handler = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405);
    res.json({ error: 'Method not allowed' });
    return;
  }

  const resource = req.query?.resource as string | undefined;
  const slug = req.query?.slug as string | undefined;

  if (!resource || !ALLOWED_RESOURCES.has(resource)) {
    res.status(400);
    res.json({ error: 'Invalid resource' });
    return;
  }

  try {
    const supabase = getSupabase();
    const result = await fetchResource(supabase, resource, slug);

    // Cache headers: short cache for detail pages, longer for lists
    const isDetail = resource.includes('by-slug');
    res.setHeader('Cache-Control', isDetail ? CACHE_CONTROL_SHORT : CACHE_CONTROL_PUBLIC);

    if (result.notFound) {
      res.status(404);
      res.json({ data: null, notFound: true });
      return;
    }

    if (result.status >= 500) {
      res.status(502);
      res.json({ error: 'Upstream error' });
      return;
    }

    res.status(200);
    res.json({ data: result.data });
  } catch (err) {
    // Never log keys or sensitive info
    const msg = err instanceof Error ? err.message : 'Internal error';
    res.status(500);
    res.json({ error: msg.includes('Missing') ? 'Configuration error' : 'Internal error' });
  }
};

export default handler;
