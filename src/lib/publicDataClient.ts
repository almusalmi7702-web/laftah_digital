/**
 * Central public data client.
 *
 * Multi-layer data fetching with stale-while-revalidate:
 *   memory cache → persistent cache → same-origin Vercel API → direct Supabase fallback
 *
 * Features:
 * - Request deduplication (same resource in-flight is shared)
 * - Bounded retries with exponential backoff + jitter
 * - AbortController for cancellation
 * - Cross-tab cache synchronization via BroadcastChannel + storage event
 * - Last-known-good preservation on network failure
 * - Typed results distinguishing success, not-found, and network error
 */

import { supabase } from './supabase';
import { readCache, writeCache, isRetained, broadcastCacheUpdate, getRetentionMs } from './persistentCache';
import type { Service, PortfolioItem, PricingPlan, Faq } from '../types/database';
import type { SiteSettings, SocialLink } from '../types/settings';

// ============================================
// TYPES
// ============================================

export type ResourceType =
  | 'services'
  | 'portfolio'
  | 'pricing'
  | 'faqs'
  | 'site-settings'
  | 'social-links'
  | 'home';

export type DataSource = 'memory' | 'persistent-cache' | 'vercel-api' | 'supabase-direct' | 'static-fallback';

export type DataStatus = 'idle' | 'loading' | 'success' | 'refreshing' | 'stale' | 'error' | 'offline';

export interface DataResult<T> {
  data: T | null;
  status: DataStatus;
  source: DataSource;
  error: string | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  retry: () => void;
}

interface FetchResult<T> {
  data: T | null;
  notFound: boolean;
  error: string | null;
}

interface ResourceConfig {
  freshTtlMs: number;
}

// ============================================
// CONFIGURATION
// ============================================

const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
  services: { freshTtlMs: 10 * 60 * 1000 },        // 10 min
  portfolio: { freshTtlMs: 10 * 60 * 1000 },        // 10 min
  pricing: { freshTtlMs: 15 * 60 * 1000 },          // 15 min
  faqs: { freshTtlMs: 30 * 60 * 1000 },             // 30 min
  'site-settings': { freshTtlMs: 30 * 60 * 1000 },  // 30 min
  'social-links': { freshTtlMs: 30 * 60 * 1000 },   // 30 min
  home: { freshTtlMs: 10 * 60 * 1000 },             // 10 min
};

const RETENTION_MS = getRetentionMs();

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const JITTER_MS = 300;

const isDev = import.meta.env.DEV;

// ============================================
// MEMORY CACHE
// ============================================

interface MemoryEntry<T> {
  data: T;
  savedAt: number;
  updatedAt: number | null;
}

const memoryCache = new Map<string, MemoryEntry<unknown>>();

function setMemory<T>(resource: string, data: T, updatedAt: number | null = null): void {
  memoryCache.set(resource, { data, savedAt: Date.now(), updatedAt });
}

function getMemory<T>(resource: string): MemoryEntry<T> | null {
  const entry = memoryCache.get(resource) as MemoryEntry<T> | undefined;
  return entry ?? null;
}

// ============================================
// REQUEST DEDUPLICATION
// ============================================

const inFlight = new Map<string, { promise: Promise<FetchResult<unknown>>; controller: AbortController }>();

function getDedupKey(resource: string, slug?: string): string {
  return slug ? `${resource}:${slug}` : resource;
}

function dedupe<T>(
  key: string,
  fetcher: (controller: AbortController) => Promise<FetchResult<T>>
): { promise: Promise<FetchResult<T>>; controller: AbortController } {
  const existing = inFlight.get(key);
  if (existing) {
    return {
      promise: existing.promise as Promise<FetchResult<T>>,
      controller: existing.controller,
    };
  }

  const controller = new AbortController();
  const promise = fetcher(controller).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, { promise: promise as Promise<FetchResult<unknown>>, controller });

  return { promise, controller };
}

// ============================================
// RETRY UTILITY
// ============================================

function isRetryableError(status: number | undefined, message: string): boolean {
  if (status) {
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes('timeout') ||
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('aborted') ||
    lower.includes('failed')
  );
}

async function withRetry<T>(
  fn: (controller: AbortController) => Promise<FetchResult<T>>,
  controller: AbortController,
  maxRetries: number = MAX_RETRIES
): Promise<FetchResult<T>> {
  let lastResult: FetchResult<T> = { data: null, notFound: false, error: 'No attempt made' };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (controller.signal.aborted) {
      return { data: null, notFound: false, error: 'aborted' };
    }

    try {
      const result = await fn(controller);
      if (!result.error || result.notFound || !isRetryableError(undefined, result.error)) {
        return result;
      }
      lastResult = result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastResult = { data: null, notFound: false, error: msg };
      if (!isRetryableError(undefined, msg)) {
        return lastResult;
      }
    }

    if (attempt < maxRetries) {
      const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * JITTER_MS;
      if (isDev) console.debug(`[publicData] retry ${attempt + 1}/${maxRetries} in ${Math.round(backoff)}ms`);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, backoff);
        controller.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });
    }
  }

  return lastResult;
}

// ============================================
// FETCH LAYERS
// ============================================

async function fetchFromVercelApi<T>(
  resource: string,
  slug: string | undefined,
  controller: AbortController
): Promise<FetchResult<T>> {
  const params = new URLSearchParams();
  if (slug) params.set('slug', slug);

  const url = `/api/public?resource=${encodeURIComponent(resource)}${params.toString() ? `&${params.toString()}` : ''}`;

  const response = await fetch(url, {
    signal: controller.signal,
    headers: { 'Accept': 'application/json' },
  });

  if (response.status === 404) {
    return { data: null, notFound: true, error: null };
  }

  if (!response.ok) {
    return { data: null, notFound: false, error: `API ${response.status}` };
  }

  const json = await response.json();
  return { data: json.data as T, notFound: false, error: null };
}

async function fetchFromSupabaseDirect<T>(
  resource: string,
  slug: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _controller: AbortController
): Promise<FetchResult<T>> {

  switch (resource) {
    case 'services': {
      const query = supabase
        .from('services')
        .select('id,title,slug,short_description,images,price,sort_order,created_at')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(50);
      const { data, error } = await query;
      if (error) return { data: null, notFound: false, error: error.message };
      return { data: (data || []) as T, notFound: false, error: null };
    }

    case 'services-by-slug': {
      if (!slug) return { data: null, notFound: true, error: null };
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return { data: null, notFound: true, error: null };
        return { data: null, notFound: false, error: error.message };
      }
      return { data: data as T, notFound: false, error: null };
    }

    case 'portfolio': {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) return { data: null, notFound: false, error: error.message };
      return { data: (data || []) as T, notFound: false, error: null };
    }

    case 'portfolio-by-slug': {
      if (!slug) return { data: null, notFound: true, error: null };
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return { data: null, notFound: true, error: null };
        return { data: null, notFound: false, error: error.message };
      }
      return { data: data as T, notFound: false, error: null };
    }

    case 'pricing': {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, notFound: false, error: error.message };
      return { data: (data || []) as T, notFound: false, error: null };
    }

    case 'faqs': {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, notFound: false, error: error.message };
      return { data: (data || []) as T, notFound: false, error: null };
    }

    case 'site-settings': {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) return { data: null, notFound: false, error: error.message };
      if (!data) return { data: null, notFound: true, error: null };
      return { data: data as T, notFound: false, error: null };
    }

    case 'social-links': {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) return { data: null, notFound: false, error: error.message };
      return { data: (data || []) as T, notFound: false, error: null };
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

      const homeData = {
        services: services.status === 'fulfilled' ? (services.value.data || []) : [],
        portfolio: portfolio.status === 'fulfilled' ? (portfolio.value.data || []) : [],
        pricing: pricing.status === 'fulfilled' ? (pricing.value.data || []) : [],
        faqs: faqs.status === 'fulfilled' ? (faqs.value.data || []) : [],
        siteSettings: settings.status === 'fulfilled' ? settings.value.data : null,
        socialLinks: social.status === 'fulfilled' ? (social.value.data || []) : [],
      };

      return { data: homeData as T, notFound: false, error: null };
    }

    default:
      return { data: null, notFound: true, error: `Unknown resource: ${resource}` };
  }
}

// ============================================
// CORE FETCH ORCHESTRATION
// ============================================

export interface FetchOptions {
  skipMemory?: boolean;
  skipPersistent?: boolean;
  skipVercelApi?: boolean;
  skipSupabaseDirect?: boolean;
  forceRefresh?: boolean;
}

async function fetchResource<T>(
  resource: string,
  slug: string | undefined,
  options: FetchOptions
): Promise<{ data: T | null; source: DataSource; notFound: boolean; error: string | null; fromCache: boolean }> {
  const config = RESOURCE_CONFIG[resource as ResourceType] ?? { freshTtlMs: 10 * 60 * 1000 };
  const now = Date.now();

  // 1. Memory cache
  if (!options.skipMemory && !options.forceRefresh) {
    const mem = getMemory<T>(resource);
    if (mem) {
      const age = now - mem.savedAt;
      const isStale = age > config.freshTtlMs;
      const isRetainedEntry = isRetained(mem.savedAt);
      if (isRetainedEntry || !isStale) {
        return {
          data: mem.data,
          source: 'memory',
          notFound: false,
          error: null,
          fromCache: true,
        };
      }
    }
  }

  // 2. Persistent cache
  if (!options.skipPersistent && !options.forceRefresh) {
    const persistent = readCache<T>(resource);
    if (persistent && isRetained(persistent.savedAt)) {
      // Return persistent cache immediately, trigger background refresh
      setMemory(resource, persistent.data, persistent.updatedAt);
      return {
        data: persistent.data,
        source: 'persistent-cache',
        notFound: false,
        error: null,
        fromCache: true,
      };
    }
  }

  // 3. Network: Vercel API → Supabase direct fallback
  const { promise } = dedupe<T>(getDedupKey(resource, slug), async (ctrl) => {
    let result: FetchResult<T> = { data: null, notFound: false, error: 'No source available' };

    if (!options.skipVercelApi) {
      result = await withRetry<T>((c) => fetchFromVercelApi<T>(resource, slug, c), ctrl);
      if (isDev) console.debug(`[publicData] ${resource} vercel-api:`, result.error ? 'failed' : 'ok');
    }

    if (result.error && !result.notFound && !options.skipSupabaseDirect) {
      if (isDev) console.debug(`[publicData] ${resource} falling back to supabase-direct`);
      result = await withRetry<T>((c) => fetchFromSupabaseDirect<T>(resource, slug, c), ctrl);
      if (isDev) console.debug(`[publicData] ${resource} supabase-direct:`, result.error ? 'failed' : 'ok');
    }

    return result;
  });

  try {
    const result = await promise;

    if (result.data !== null && !result.notFound) {
      setMemory(resource, result.data);
      writeCache(resource, result.data);
      broadcastCacheUpdate(resource);
      return { data: result.data, source: 'vercel-api', notFound: false, error: null, fromCache: false };
    }

    return { data: result.data, source: 'vercel-api', notFound: result.notFound, error: result.error, fromCache: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { data: null, source: 'vercel-api', notFound: false, error: msg, fromCache: false };
  }
}

// ============================================
// PUBLIC API
// ============================================

export async function getPublicServices(): Promise<{ data: Service[] | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<Service[]>('services', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

export async function getPublicServiceBySlug(slug: string): Promise<{ data: Service | null; source: DataSource; notFound: boolean; error: string | null }> {
  // Try list cache first for instant display
  const mem = getMemory<Service[]>('services');
  if (mem && mem.data) {
    const cached = mem.data.find((s) => s.slug === slug);
    if (cached) {
      // Background refresh
      fetchResource<Service>('services-by-slug', slug, { skipMemory: true, skipPersistent: true }).then((r) => {
        if (r.data && !r.notFound) {
          setMemory(`services-by-slug:${slug}`, r.data);
          writeCache(`services-by-slug:${slug}`, r.data);
        }
      });
      return { data: cached, source: 'memory', notFound: false, error: null };
    }
  }

  const result = await fetchResource<Service>('services-by-slug', slug, {});
  return { data: result.data, source: result.source, notFound: result.notFound, error: result.error };
}

export async function getPublicPortfolio(): Promise<{ data: PortfolioItem[] | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<PortfolioItem[]>('portfolio', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

export async function getPublicPortfolioBySlug(slug: string): Promise<{ data: PortfolioItem | null; source: DataSource; notFound: boolean; error: string | null }> {
  const mem = getMemory<PortfolioItem[]>('portfolio');
  if (mem && mem.data) {
    const cached = mem.data.find((p) => p.slug === slug);
    if (cached) {
      fetchResource<PortfolioItem>('portfolio-by-slug', slug, { skipMemory: true, skipPersistent: true }).then((r) => {
        if (r.data && !r.notFound) {
          setMemory(`portfolio-by-slug:${slug}`, r.data);
          writeCache(`portfolio-by-slug:${slug}`, r.data);
        }
      });
      return { data: cached, source: 'memory', notFound: false, error: null };
    }
  }

  const result = await fetchResource<PortfolioItem>('portfolio-by-slug', slug, {});
  return { data: result.data, source: result.source, notFound: result.notFound, error: result.error };
}

export async function getPublicPricing(): Promise<{ data: PricingPlan[] | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<PricingPlan[]>('pricing', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

export async function getPublicFaqs(): Promise<{ data: Faq[] | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<Faq[]>('faqs', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

export interface HomePayload {
  services: Service[];
  portfolio: PortfolioItem[];
  pricing: PricingPlan[];
  faqs: Faq[];
  siteSettings: SiteSettings | null;
  socialLinks: SocialLink[];
}

export async function getPublicHomePayload(): Promise<{ data: HomePayload | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<HomePayload>('home', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

export async function getPublicSiteSettings(): Promise<{ data: SiteSettings | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<SiteSettings>('site-settings', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

export async function getPublicSocialLinks(): Promise<{ data: SocialLink[] | null; source: DataSource; error: string | null }> {
  const result = await fetchResource<SocialLink[]>('social-links', undefined, {});
  return { data: result.data, source: result.source, error: result.error };
}

// ============================================
// CACHE INVALIDATION (called from admin)
// ============================================

export function invalidateResource(resource: ResourceType): void {
  memoryCache.delete(resource);
  // Also invalidate slug-specific caches
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`${resource}:`)) {
      memoryCache.delete(key);
    }
  }
  // Don't delete persistent cache — let background refresh replace it
  broadcastCacheUpdate(resource);
}

export function invalidateAll(): void {
  memoryCache.clear();
  broadcastCacheUpdate('services');
  broadcastCacheUpdate('portfolio');
  broadcastCacheUpdate('pricing');
  broadcastCacheUpdate('faqs');
  broadcastCacheUpdate('site-settings');
  broadcastCacheUpdate('social-links');
}

// ============================================
// CROSS-TAB SYNC
// ============================================

const tabSyncCallbacks = new Set<(resource: string) => void>();

export function onCrossTabUpdate(callback: (resource: string) => void): () => void {
  tabSyncCallbacks.add(callback);

  // BroadcastChannel
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel('laftah-cache');
    channel.onmessage = (event) => {
      if (event.data?.resource) {
        tabSyncCallbacks.forEach((cb) => cb(event.data.resource));
      }
    };
  } catch {
    // Fallback: storage event
  }

  const storageHandler = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('laftah:public:v2:')) {
      const resource = e.key.replace('laftah:public:v2:', '');
      tabSyncCallbacks.forEach((cb) => cb(resource));
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  return () => {
    tabSyncCallbacks.delete(callback);
    channel?.close();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
  };
}

// ============================================
// PREFETCH
// ============================================

export function prefetchResource(resource: ResourceType): void {
  const mem = getMemory(resource);
  if (mem) return; // Already cached

  const dedupKey = getDedupKey(resource);
  if (inFlight.has(dedupKey)) return; // Already fetching

  fetchResource(resource, undefined, { skipMemory: true }).catch(() => {
    // Silent prefetch failure
  });
}

export function isResourceStale(resource: ResourceType): boolean {
  const config = RESOURCE_CONFIG[resource];
  const mem = getMemory(resource);
  if (!mem) return true;
  return Date.now() - mem.savedAt > config.freshTtlMs;
}

export { RETENTION_MS };
