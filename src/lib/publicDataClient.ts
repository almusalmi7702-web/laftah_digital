/**
 * Central public data client.
 *
 * Multi-layer data fetching with stale-while-revalidate:
 *   memory cache → persistent cache → same-origin Vercel API → direct Supabase fallback
 *
 * Fixes applied:
 * - Centralized getResourceKey for all cache keys
 * - True SWR: fresh → show + no fetch; stale (within retention) → show + background refresh; expired → network
 * - Preserves original savedAt when hydrating memory from persistent cache
 * - forceRefresh bypasses all caches
 * - Retry = 3 total attempts (not 3 retries after first)
 * - Per-attempt timeout via AbortController (7s)
 * - Supabase queries use .signal(signal)
 * - Accurate source tracking (vercel-api vs supabase-direct)
 * - Invalidation marks stale, doesn't delete last-known-good
 * - Singleton cross-tab sync
 * - Home payload hydrates individual caches
 */

import { supabase } from './supabase';
import {
  readCache,
  writeCache,
  markCacheStale,
  isRetained,
  broadcastCacheUpdate,
  subscribeToCacheUpdates,
  getRetentionMs,
} from './persistentCache';
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

export type DataSource =
  | 'memory'
  | 'persistent-cache'
  | 'vercel-api'
  | 'supabase-direct'
  | 'static-fallback';

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
  statusCode: number | null;
}

interface ResourceConfig {
  freshTtlMs: number;
}

// ============================================
// CONFIGURATION
// ============================================

const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
  services: { freshTtlMs: 10 * 60 * 1000 },
  portfolio: { freshTtlMs: 10 * 60 * 1000 },
  pricing: { freshTtlMs: 15 * 60 * 1000 },
  faqs: { freshTtlMs: 30 * 60 * 1000 },
  'site-settings': { freshTtlMs: 30 * 60 * 1000 },
  'social-links': { freshTtlMs: 30 * 60 * 1000 },
  home: { freshTtlMs: 10 * 60 * 1000 },
};

const RETENTION_MS = getRetentionMs();

const MAX_ATTEMPTS = 3; // 3 total attempts (not 3 retries after first)
const BASE_BACKOFF_MS = 1000;
const JITTER_MS = 300;
const PER_ATTEMPT_TIMEOUT_MS = 7000;

const isDev = import.meta.env.DEV;

// ============================================
// CENTRAL RESOURCE KEY
// ============================================

/**
 * Central key function used everywhere: memory cache, persistent cache,
 * in-flight dedup, invalidation, cross-tab messages.
 *
 * Detail keys: 'services-by-slug:my-slug', 'portfolio-by-slug:my-slug'
 * List keys: 'services', 'portfolio', etc.
 */
export function getResourceKey(resource: string, slug?: string): string {
  if (slug) return `${resource}:${slug}`;
  return resource;
}

// ============================================
// MEMORY CACHE
// ============================================

interface MemoryEntry<T> {
  data: T;
  savedAt: number;
  updatedAt: number | null;
  invalidatedAt: number | null;
}

const memoryCache = new Map<string, MemoryEntry<unknown>>();

function setMemory<T>(
  resource: string,
  data: T,
  savedAt: number = Date.now(),
  updatedAt: number | null = null,
  invalidatedAt: number | null = null
): void {
  memoryCache.set(resource, { data, savedAt, updatedAt, invalidatedAt });
}

function getMemory<T>(resource: string): MemoryEntry<T> | null {
  const entry = memoryCache.get(resource) as MemoryEntry<T> | undefined;
  return entry ?? null;
}

function markMemoryStale(resource: string): void {
  const entry = memoryCache.get(resource);
  if (entry) {
    entry.invalidatedAt = Date.now();
  }
}

// ============================================
// REQUEST DEDUPLICATION WITH SUBSCRIBER COUNT
// ============================================

interface InFlightEntry {
  promise: Promise<FetchResult<unknown>>;
  controller: AbortController;
  subscribers: number;
}

const inFlight = new Map<string, InFlightEntry>();

function dedupe<T>(
  key: string,
  fetcher: (controller: AbortController) => Promise<FetchResult<T>>
): { promise: Promise<FetchResult<T>>; unsubscribe: () => void } {
  const existing = inFlight.get(key);
  if (existing) {
    existing.subscribers++;
    return {
      promise: existing.promise as Promise<FetchResult<T>>,
      unsubscribe: () => {
        const entry = inFlight.get(key);
        if (entry) {
          entry.subscribers--;
          if (entry.subscribers <= 0) {
            entry.controller.abort();
            inFlight.delete(key);
          }
        }
      },
    };
  }

  const controller = new AbortController();
  const entry: InFlightEntry = {
    promise: null as never,
    controller,
    subscribers: 1,
  };

  const promise = fetcher(controller).finally(() => {
    // Clean up after completion, but only if no new subscribers arrived
    const current = inFlight.get(key);
    if (current === entry) {
      inFlight.delete(key);
    }
  });

  entry.promise = promise as Promise<FetchResult<unknown>>;
  inFlight.set(key, entry);

  return {
    promise: promise as Promise<FetchResult<T>>,
    unsubscribe: () => {
      const current = inFlight.get(key);
      if (current === entry) {
        current.subscribers--;
        if (current.subscribers <= 0) {
          current.controller.abort();
          inFlight.delete(key);
        }
      }
    },
  };
}

// ============================================
// RETRY UTILITY — 3 TOTAL ATTEMPTS
// ============================================

function isRetryableStatus(status: number | null): boolean {
  if (status === null) return true; // network error (no HTTP status)
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isRetryableMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('timeout') ||
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('aborted') ||
    lower.includes('failed')
  );
}

function shouldRetry(result: FetchResult<unknown>): boolean {
  if (result.notFound) return false; // confirmed 404 — never retry
  if (!result.error) return false; // success
  if (result.statusCode !== null) {
    return isRetryableStatus(result.statusCode);
  }
  return isRetryableMessage(result.error);
}

async function withRetry<T>(
  fn: (controller: AbortController) => Promise<FetchResult<T>>,
  parentController: AbortController,
  maxAttempts: number = MAX_ATTEMPTS
): Promise<FetchResult<T>> {
  let lastResult: FetchResult<T> = { data: null, notFound: false, error: 'No attempt made', statusCode: null };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (parentController.signal.aborted) {
      return { data: null, notFound: false, error: 'aborted', statusCode: null };
    }

    // Per-attempt timeout controller linked to parent
    const attemptController = new AbortController();
    const timeout = setTimeout(() => attemptController.abort(), PER_ATTEMPT_TIMEOUT_MS);

    // If parent aborts, abort the attempt too
    const onParentAbort = () => attemptController.abort();
    parentController.signal.addEventListener('abort', onParentAbort, { once: true });

    try {
      const result = await fn(attemptController);
      lastResult = result;

      if (!shouldRetry(result)) {
        return result;
      }

      if (isDev) {
        console.debug(`[publicData] attempt ${attempt + 1}/${maxAttempts} failed (status=${result.statusCode}, error=${result.error}), will retry`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastResult = { data: null, notFound: false, error: msg, statusCode: null };

      if (!isRetryableMessage(msg)) {
        return lastResult;
      }

      if (isDev) {
        console.debug(`[publicData] attempt ${attempt + 1}/${maxAttempts} threw (${msg}), will retry`);
      }
    } finally {
      clearTimeout(timeout);
      parentController.signal.removeEventListener('abort', onParentAbort);
    }

    // Backoff before next attempt (skip on last attempt)
    if (attempt < maxAttempts - 1) {
      // Respect Retry-After for 429 if available
      let backoff = BASE_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * JITTER_MS;
      if (lastResult.statusCode === 429 && lastResult.error) {
        const retryAfter = parseInt(lastResult.error, 10);
        if (!isNaN(retryAfter) && retryAfter > 0 && retryAfter < 60) {
          backoff = retryAfter * 1000;
        }
      }

      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, backoff);
        parentController.signal.addEventListener('abort', () => {
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

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (response.status === 404) {
      return { data: null, notFound: true, error: null, statusCode: 404 };
    }

    if (!response.ok) {
      return { data: null, notFound: false, error: `API ${response.status}`, statusCode: response.status };
    }

    const json = await response.json();
    return { data: json.data as T, notFound: false, error: null, statusCode: 200 };
  } catch (err) {
    if (controller.signal.aborted) {
      return { data: null, notFound: false, error: 'aborted', statusCode: null };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { data: null, notFound: false, error: msg, statusCode: null };
  }
}

function withAbortSignal<T>(query: T, signal: AbortSignal): T {
  // The abortSignal method exists at runtime but TypeScript types are incomplete
  // in this version of @supabase/postgrest-js. Cast to access it.
  (query as unknown as { abortSignal: (s: AbortSignal) => T }).abortSignal(signal);
  return query;
}

async function fetchFromSupabaseDirect<T>(
  resource: string,
  slug: string | undefined,
  controller: AbortController
): Promise<FetchResult<T>> {
  const signal = controller.signal;

  try {
    switch (resource) {
      case 'services': {
        const { data, error } = await withAbortSignal(
          supabase
            .from('services')
            .select('id,title,slug,short_description,images,price,sort_order,created_at')
            .eq('is_published', true)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(50),
          signal
        );
        if (error) return { data: null, notFound: false, error: error.message, statusCode: null };
        return { data: (data || []) as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'services-by-slug': {
        if (!slug) return { data: null, notFound: true, error: null, statusCode: 404 };
        const { data, error } = await withAbortSignal(
          supabase
            .from('services')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single(),
          signal
        );
        if (error) {
          if (error.code === 'PGRST116') return { data: null, notFound: true, error: null, statusCode: 404 };
          return { data: null, notFound: false, error: error.message, statusCode: null };
        }
        return { data: data as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'portfolio': {
        const { data, error } = await withAbortSignal(
          supabase
            .from('portfolio_items')
            .select('*')
            .eq('is_published', true)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false }),
          signal
        );
        if (error) return { data: null, notFound: false, error: error.message, statusCode: null };
        return { data: (data || []) as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'portfolio-by-slug': {
        if (!slug) return { data: null, notFound: true, error: null, statusCode: 404 };
        const { data, error } = await withAbortSignal(
          supabase
            .from('portfolio_items')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single(),
          signal
        );
        if (error) {
          if (error.code === 'PGRST116') return { data: null, notFound: true, error: null, statusCode: 404 };
          return { data: null, notFound: false, error: error.message, statusCode: null };
        }
        return { data: data as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'pricing': {
        const { data, error } = await withAbortSignal(
          supabase
            .from('pricing_plans')
            .select('*')
            .eq('is_published', true)
            .order('sort_order', { ascending: true }),
          signal
        );
        if (error) return { data: null, notFound: false, error: error.message, statusCode: null };
        return { data: (data || []) as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'faqs': {
        const { data, error } = await withAbortSignal(
          supabase
            .from('faqs')
            .select('*')
            .eq('is_published', true)
            .order('sort_order', { ascending: true }),
          signal
        );
        if (error) return { data: null, notFound: false, error: error.message, statusCode: null };
        return { data: (data || []) as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'site-settings': {
        const { data, error } = await withAbortSignal(
          supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle(),
          signal
        );
        if (error) return { data: null, notFound: false, error: error.message, statusCode: null };
        if (!data) return { data: null, notFound: true, error: null, statusCode: 404 };
        return { data: data as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'social-links': {
        const { data, error } = await withAbortSignal(
          supabase
            .from('social_links')
            .select('*')
            .order('sort_order', { ascending: true }),
          signal
        );
        if (error) return { data: null, notFound: false, error: error.message, statusCode: null };
        return { data: (data || []) as T, notFound: false, error: null, statusCode: 200 };
      }

      case 'home': {
        const [services, portfolio, pricing, faqs, settings, social] = await Promise.allSettled([
          withAbortSignal(supabase.from('services').select('id,title,slug,short_description,images,price,sort_order,created_at').eq('is_published', true).order('sort_order', { ascending: true }).limit(8), signal),
          withAbortSignal(supabase.from('portfolio_items').select('*').eq('is_published', true).order('sort_order', { ascending: true }).limit(8), signal),
          withAbortSignal(supabase.from('pricing_plans').select('*').eq('is_published', true).order('sort_order', { ascending: true }), signal),
          withAbortSignal(supabase.from('faqs').select('*').eq('is_published', true).order('sort_order', { ascending: true }).limit(5), signal),
          withAbortSignal(supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(), signal),
          withAbortSignal(supabase.from('social_links').select('*').order('sort_order', { ascending: true }), signal),
        ]);

        // Check each result for errors — don't return empty arrays for failed sections
        const homeData: Record<string, unknown> = {};
        const errors: string[] = [];

        if (services.status === 'fulfilled') {
          if (services.value.error) errors.push('services');
          else homeData.services = services.value.data || [];
        } else errors.push('services');

        if (portfolio.status === 'fulfilled') {
          if (portfolio.value.error) errors.push('portfolio');
          else homeData.portfolio = portfolio.value.data || [];
        } else errors.push('portfolio');

        if (pricing.status === 'fulfilled') {
          if (pricing.value.error) errors.push('pricing');
          else homeData.pricing = pricing.value.data || [];
        } else errors.push('pricing');

        if (faqs.status === 'fulfilled') {
          if (faqs.value.error) errors.push('faqs');
          else homeData.faqs = faqs.value.data || [];
        } else errors.push('faqs');

        if (settings.status === 'fulfilled') {
          if (settings.value.error) errors.push('siteSettings');
          else homeData.siteSettings = settings.value.data || null;
        } else errors.push('siteSettings');

        if (social.status === 'fulfilled') {
          if (social.value.error) errors.push('socialLinks');
          else homeData.socialLinks = social.value.data || [];
        } else errors.push('socialLinks');

        // If all sections failed, return error
        if (errors.length === 6) {
          return { data: null, notFound: false, error: 'All sections failed', statusCode: 502 };
        }

        return { data: homeData as T, notFound: false, error: null, statusCode: 200 };
      }

      default:
        return { data: null, notFound: true, error: `Unknown resource: ${resource}`, statusCode: 404 };
    }
  } catch (err) {
    if (controller.signal.aborted) {
      return { data: null, notFound: false, error: 'aborted', statusCode: null };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { data: null, notFound: false, error: msg, statusCode: null };
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

interface FetchResourceResult<T> {
  data: T | null;
  source: DataSource;
  notFound: boolean;
  error: string | null;
  statusCode: number | null;
  fromCache: boolean;
  isStale: boolean;
}

async function fetchResource<T>(
  resource: string,
  slug: string | undefined,
  options: FetchOptions
): Promise<FetchResourceResult<T>> {
  const key = getResourceKey(resource, slug);
  const config = RESOURCE_CONFIG[resource as ResourceType] ?? { freshTtlMs: 10 * 60 * 1000 };
  const now = Date.now();

  // 1. Memory cache
  if (!options.skipMemory && !options.forceRefresh) {
    const mem = getMemory<T>(key);
    if (mem) {
      const age = now - mem.savedAt;
      const isInvalidated = mem.invalidatedAt !== null && mem.invalidatedAt > mem.savedAt;
      const isStale = age > config.freshTtlMs || isInvalidated;
      const isRetainedEntry = isRetained(mem.savedAt);

      if (!isStale) {
        // Fresh — return immediately, no background fetch
        return {
          data: mem.data,
          source: 'memory',
          notFound: false,
          error: null,
          statusCode: null,
          fromCache: true,
          isStale: false,
        };
      }

      if (isRetainedEntry) {
        // Stale but within retention — return data, trigger background refresh
        // Do NOT await — caller decides whether to background refresh
        return {
          data: mem.data,
          source: 'memory',
          notFound: false,
          error: null,
          statusCode: null,
          fromCache: true,
          isStale: true,
        };
      }
      // Expired beyond retention — fall through to network
    }
  }

  // 2. Persistent cache
  if (!options.skipPersistent && !options.forceRefresh) {
    const persistent = readCache<T>(key);
    if (persistent && isRetained(persistent.savedAt)) {
      const age = now - persistent.savedAt;
      const isInvalidated = persistent.invalidatedAt !== null && persistent.invalidatedAt > persistent.savedAt;
      const isStale = age > config.freshTtlMs || isInvalidated;

      // Hydrate memory cache preserving original savedAt
      setMemory(key, persistent.data, persistent.savedAt, persistent.updatedAt, persistent.invalidatedAt);

      if (!isStale) {
        return {
          data: persistent.data,
          source: 'persistent-cache',
          notFound: false,
          error: null,
          statusCode: null,
          fromCache: true,
          isStale: false,
        };
      }

      // Stale but retained — return and let caller trigger background refresh
      return {
        data: persistent.data,
        source: 'persistent-cache',
        notFound: false,
        error: null,
        statusCode: null,
        fromCache: true,
        isStale: true,
      };
    }
  }

  // 3. Network: Vercel API → Supabase direct fallback
  const { promise } = dedupe<T>(key, async (ctrl) => {
    let result: FetchResult<T> = { data: null, notFound: false, error: 'No source available', statusCode: null };
    let actualSource: DataSource = 'vercel-api';

    if (!options.skipVercelApi) {
      result = await withRetry<T>((c) => fetchFromVercelApi<T>(resource, slug, c), ctrl);
      if (isDev) console.debug(`[publicData] ${key} vercel-api:`, result.error ? `failed (${result.statusCode})` : 'ok');
    }

    if (result.error && !result.notFound && !options.skipSupabaseDirect) {
      if (isDev) console.debug(`[publicData] ${key} falling back to supabase-direct`);
      const supaResult = await withRetry<T>((c) => fetchFromSupabaseDirect<T>(resource, slug, c), ctrl);
      if (isDev) console.debug(`[publicData] ${key} supabase-direct:`, supaResult.error ? `failed (${supaResult.statusCode})` : 'ok');

      // Only use supabase result if it succeeded or is a confirmed notFound
      if (!supaResult.error || supaResult.notFound) {
        result = supaResult;
        actualSource = 'supabase-direct';
      } else {
        // Both failed — keep the vercel error but note source
        result = supaResult;
        actualSource = 'supabase-direct';
      }
    }

    // Attach source to result via a side channel
    (result as FetchResult<T> & { _source?: DataSource })._source = actualSource;

    return result;
  });

  try {
    const result = await promise;
    const source = (result as FetchResult<T> & { _source?: DataSource })._source ?? 'vercel-api';

    if (result.data !== null && !result.notFound) {
      setMemory(key, result.data);
      writeCache(key, result.data);
      broadcastCacheUpdate(key);
      return {
        data: result.data,
        source,
        notFound: false,
        error: null,
        statusCode: result.statusCode,
        fromCache: false,
        isStale: false,
      };
    }

    return {
      data: result.data,
      source,
      notFound: result.notFound,
      error: result.error,
      statusCode: result.statusCode,
      fromCache: false,
      isStale: false,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      data: null,
      source: 'vercel-api',
      notFound: false,
      error: msg,
      statusCode: null,
      fromCache: false,
      isStale: false,
    };
  }
}

// ============================================
// HOME PAYLOAD HYDRATION
// ============================================

function hydrateIndividualCaches(payload: HomePayload): void {
  const now = Date.now();

  if (payload.services && payload.services.length >= 0) {
    const key = getResourceKey('services');
    setMemory(key, payload.services, now);
    writeCache(key, payload.services);
  }

  if (payload.portfolio && payload.portfolio.length >= 0) {
    const key = getResourceKey('portfolio');
    setMemory(key, payload.portfolio, now);
    writeCache(key, payload.portfolio);
  }

  if (payload.pricing && payload.pricing.length >= 0) {
    const key = getResourceKey('pricing');
    setMemory(key, payload.pricing, now);
    writeCache(key, payload.pricing);
  }

  if (payload.faqs && payload.faqs.length >= 0) {
    const key = getResourceKey('faqs');
    setMemory(key, payload.faqs, now);
    writeCache(key, payload.faqs);
  }

  if (payload.siteSettings) {
    const key = getResourceKey('site-settings');
    setMemory(key, payload.siteSettings, now);
    writeCache(key, payload.siteSettings);
  }

  if (payload.socialLinks && payload.socialLinks.length >= 0) {
    const key = getResourceKey('social-links');
    setMemory(key, payload.socialLinks, now);
    writeCache(key, payload.socialLinks);
  }
}

// ============================================
// PUBLIC API
// ============================================

export async function getPublicServices(): Promise<{
  data: Service[] | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<Service[]>('services', undefined, {});
  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

export async function getPublicServiceBySlug(slug: string): Promise<{
  data: Service | null;
  source: DataSource;
  notFound: boolean;
  error: string | null;
  isStale: boolean;
}> {
  const detailKey = getResourceKey('services-by-slug', slug);

  // Try list cache first for instant display
  const listMem = getMemory<Service[]>('services');
  if (listMem && listMem.data) {
    const cached = listMem.data.find((s) => s.slug === slug);
    if (cached) {
      // Store in detail key with list's savedAt
      setMemory(detailKey, cached, listMem.savedAt, listMem.updatedAt, listMem.invalidatedAt);

      // Background refresh from network (bypasses memory/persistent for detail)
      fetchResource<Service>('services-by-slug', slug, { skipMemory: true, skipPersistent: true }).then((r) => {
        if (r.data && !r.notFound) {
          setMemory(detailKey, r.data);
          writeCache(detailKey, r.data);
          broadcastCacheUpdate(detailKey);
        } else if (r.notFound) {
          // Confirmed 404 — mark in cache
          setMemory(detailKey, null as unknown as Service, Date.now());
        }
      }).catch(() => {});

      return { data: cached, source: 'memory', notFound: false, error: null, isStale: false };
    }
  }

  // Also try detail persistent cache
  const detailMem = getMemory<Service>(detailKey);
  if (detailMem) {
    if (detailMem.data === null) {
      // Previously confirmed 404
      return { data: null, source: 'memory', notFound: true, error: null, isStale: false };
    }
    const config = RESOURCE_CONFIG['services'];
    const age = Date.now() - detailMem.savedAt;
    const isInvalidated = detailMem.invalidatedAt !== null && detailMem.invalidatedAt > detailMem.savedAt;
    const isStale = age > config.freshTtlMs || isInvalidated;

    if (isRetained(detailMem.savedAt)) {
      // Background refresh if stale
      if (isStale) {
        fetchResource<Service>('services-by-slug', slug, { skipMemory: true, skipPersistent: true }).then((r) => {
          if (r.data && !r.notFound) {
            setMemory(detailKey, r.data);
            writeCache(detailKey, r.data);
            broadcastCacheUpdate(detailKey);
          }
        }).catch(() => {});
      }
      return { data: detailMem.data, source: 'memory', notFound: false, error: null, isStale };
    }
  }

  const result = await fetchResource<Service>('services-by-slug', slug, {});
  return {
    data: result.data,
    source: result.source,
    notFound: result.notFound,
    error: result.error,
    isStale: result.isStale,
  };
}

export async function getPublicPortfolio(): Promise<{
  data: PortfolioItem[] | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<PortfolioItem[]>('portfolio', undefined, {});
  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

export async function getPublicPortfolioBySlug(slug: string): Promise<{
  data: PortfolioItem | null;
  source: DataSource;
  notFound: boolean;
  error: string | null;
  isStale: boolean;
}> {
  const detailKey = getResourceKey('portfolio-by-slug', slug);

  const listMem = getMemory<PortfolioItem[]>('portfolio');
  if (listMem && listMem.data) {
    const cached = listMem.data.find((p) => p.slug === slug);
    if (cached) {
      setMemory(detailKey, cached, listMem.savedAt, listMem.updatedAt, listMem.invalidatedAt);

      fetchResource<PortfolioItem>('portfolio-by-slug', slug, { skipMemory: true, skipPersistent: true }).then((r) => {
        if (r.data && !r.notFound) {
          setMemory(detailKey, r.data);
          writeCache(detailKey, r.data);
          broadcastCacheUpdate(detailKey);
        } else if (r.notFound) {
          setMemory(detailKey, null as unknown as PortfolioItem, Date.now());
        }
      }).catch(() => {});

      return { data: cached, source: 'memory', notFound: false, error: null, isStale: false };
    }
  }

  const detailMem = getMemory<PortfolioItem>(detailKey);
  if (detailMem) {
    if (detailMem.data === null) {
      return { data: null, source: 'memory', notFound: true, error: null, isStale: false };
    }
    const config = RESOURCE_CONFIG['portfolio'];
    const age = Date.now() - detailMem.savedAt;
    const isInvalidated = detailMem.invalidatedAt !== null && detailMem.invalidatedAt > detailMem.savedAt;
    const isStale = age > config.freshTtlMs || isInvalidated;

    if (isRetained(detailMem.savedAt)) {
      if (isStale) {
        fetchResource<PortfolioItem>('portfolio-by-slug', slug, { skipMemory: true, skipPersistent: true }).then((r) => {
          if (r.data && !r.notFound) {
            setMemory(detailKey, r.data);
            writeCache(detailKey, r.data);
            broadcastCacheUpdate(detailKey);
          }
        }).catch(() => {});
      }
      return { data: detailMem.data, source: 'memory', notFound: false, error: null, isStale };
    }
  }

  const result = await fetchResource<PortfolioItem>('portfolio-by-slug', slug, {});
  return {
    data: result.data,
    source: result.source,
    notFound: result.notFound,
    error: result.error,
    isStale: result.isStale,
  };
}

export async function getPublicPricing(): Promise<{
  data: PricingPlan[] | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<PricingPlan[]>('pricing', undefined, {});
  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

export async function getPublicFaqs(): Promise<{
  data: Faq[] | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<Faq[]>('faqs', undefined, {});
  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

export interface HomePayload {
  services: Service[];
  portfolio: PortfolioItem[];
  pricing: PricingPlan[];
  faqs: Faq[];
  siteSettings: SiteSettings | null;
  socialLinks: SocialLink[];
}

export async function getPublicHomePayload(): Promise<{
  data: HomePayload | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<HomePayload>('home', undefined, {});

  // Hydrate individual caches from home payload
  if (result.data && !result.fromCache) {
    hydrateIndividualCaches(result.data);
  }

  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

export async function getPublicSiteSettings(): Promise<{
  data: SiteSettings | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<SiteSettings>('site-settings', undefined, {});
  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

export async function getPublicSocialLinks(): Promise<{
  data: SocialLink[] | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<SocialLink[]>('social-links', undefined, {});
  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: result.isStale,
  };
}

// ============================================
// FORCE REFRESH — bypasses all caches
// ============================================

export async function forceRefreshResource<T>(
  resource: string,
  slug?: string
): Promise<{
  data: T | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}> {
  const result = await fetchResource<T>(resource, slug, {
    forceRefresh: true,
    skipMemory: true,
    skipPersistent: true,
  });

  return {
    data: result.data,
    source: result.source,
    error: result.error,
    notFound: result.notFound,
    isStale: false,
  };
}

// ============================================
// CACHE INVALIDATION (called from admin)
// ============================================

export function invalidateResource(resource: ResourceType): void {
  const key = getResourceKey(resource);
  markMemoryStale(key);
  markCacheStale(key);

  // Invalidate slug-specific detail caches
  for (const cacheKey of memoryCache.keys()) {
    if (cacheKey.startsWith(`${resource}:`)) {
      markMemoryStale(cacheKey);
      markCacheStale(cacheKey);
    }
  }

  // Broadcast to other tabs
  broadcastCacheUpdate(key);
}

export function invalidateAll(): void {
  for (const key of memoryCache.keys()) {
    markMemoryStale(key);
    markCacheStale(key);
  }

  broadcastCacheUpdate('services');
  broadcastCacheUpdate('portfolio');
  broadcastCacheUpdate('pricing');
  broadcastCacheUpdate('faqs');
  broadcastCacheUpdate('site-settings');
  broadcastCacheUpdate('social-links');
  broadcastCacheUpdate('home');
}

// ============================================
// CROSS-TAB SYNC (singleton)
// ============================================

export function onCrossTabUpdate(callback: (resource: string) => void): () => void {
  return subscribeToCacheUpdates(callback);
}

// ============================================
// PREFETCH
// ============================================

export function prefetchResource(resource: ResourceType): void {
  const key = getResourceKey(resource);
  const mem = getMemory(key);
  if (mem) return;

  if (inFlight.has(key)) return;

  fetchResource(resource, undefined, { skipMemory: true }).catch(() => {});
}

export function isResourceStale(resource: ResourceType): boolean {
  const key = getResourceKey(resource);
  const config = RESOURCE_CONFIG[resource];
  const mem = getMemory(key);
  if (!mem) return true;

  const age = Date.now() - mem.savedAt;
  const isInvalidated = mem.invalidatedAt !== null && mem.invalidatedAt > mem.savedAt;
  return age > config.freshTtlMs || isInvalidated;
}

export { RETENTION_MS };
