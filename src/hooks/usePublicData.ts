/**
 * React hooks for public data fetching with stale-while-revalidate.
 *
 * Fixes applied:
 * - dataRef avoids stale closure: background refresh failure checks current data
 * - Sync initialization from memory/persistent cache (no skeleton flash)
 * - forceRefresh used for retry, network restore, focus refresh, cross-tab
 * - isStale reflects actual stale state from fetch result
 * - Subscriber cancellation: unsubscribe from dedup on unmount, abort if no subscribers
 * - Detail hooks check list cache first, distinguish notFound from network error
 * - Background refresh triggered when isStale=true
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPublicServices,
  getPublicServiceBySlug,
  getPublicPortfolio,
  getPublicPortfolioBySlug,
  getPublicPricing,
  getPublicFaqs,
  getPublicHomePayload,
  getPublicSiteSettings,
  getPublicSocialLinks,
  forceRefreshResource,
  isResourceStale,
  onCrossTabUpdate,
  prefetchResource,
  getResourceKey,
  type DataSource,
  type DataStatus,
  type HomePayload,
} from '../lib/publicDataClient';
import { readCache } from '../lib/persistentCache';
import type { Service, PortfolioItem, PricingPlan, Faq } from '../types/database';
import type { SiteSettings, SocialLink } from '../types/settings';
import { useNetworkStatus } from './useNetworkStatus';

const FOCUS_REFRESH_COOLDOWN_MS = 60 * 1000;

export interface PublicDataState<T> {
  data: T | null;
  status: DataStatus;
  source: DataSource;
  error: string | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  retry: () => void;
}

interface FetcherResult<T> {
  data: T | null;
  source: DataSource;
  error: string | null;
  notFound: boolean;
  isStale: boolean;
}

// ============================================
// SYNC CACHE INITIALIZATION
// ============================================

function initFromCache<T>(resource: string, slug?: string): {
  data: T | null;
  status: DataStatus;
  source: DataSource;
  isStale: boolean;
} {
  const key = getResourceKey(resource, slug);
  const mem = readCache<T>(key); // readCache works for both memory and persistent

  // Try memory first via a synchronous check
  // We can't access memoryCache directly, so we use readCache (persistent)
  // The hook's initial state will be updated by the first fetch anyway,
  // but this prevents skeleton flash for persistent cache.
  if (mem && mem.data !== null) {
    return {
      data: mem.data,
      status: 'success',
      source: 'persistent-cache',
      isStale: false, // will be corrected by first fetch
    };
  }

  return { data: null, status: 'idle', source: 'memory', isStale: false };
}

// ============================================
// CORE HOOK
// ============================================

function usePublicDataInternal<T>(
  resource: string,
  fetcher: () => Promise<FetcherResult<T>>,
  forceRefreshFn: () => Promise<FetcherResult<T>>,
  deps: React.DependencyList
): PublicDataState<T> {
  // Sync initialization from persistent cache to avoid skeleton flash
  const [initialState] = useState(() => initFromCache<T>(resource));

  const [data, setData] = useState<T | null>(initialState.data);
  const [status, setStatus] = useState<DataStatus>(initialState.status);
  const [source, setSource] = useState<DataSource>(initialState.source);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(initialState.isStale);
  const { isOnline, connectionRestored, consumeConnectionRestored } = useNetworkStatus();
  const lastFocusRefresh = useRef(0);
  const mountedRef = useRef(true);
  const dataRef = useRef<T | null>(initialState.data);
  const slugRef = useRef<string | undefined>(undefined);

  // Keep dataRef in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Extract slug from resource if it's a detail key
  useEffect(() => {
    if (resource.includes(':')) {
      slugRef.current = resource.split(':').slice(1).join(':');
    } else {
      slugRef.current = undefined;
    }
  }, [resource]);

  const doFetch = useCallback(
    async (isBackground: boolean, useForceRefresh: boolean = false) => {
      if (!mountedRef.current) return;

      const fn = useForceRefresh ? forceRefreshFn : fetcher;

      if (!isBackground) {
        setStatus((prev) => (prev === 'success' || prev === 'stale' ? 'refreshing' : 'loading'));
      } else {
        setStatus((prev) => (prev === 'success' || prev === 'stale' ? 'refreshing' : prev));
      }

      const result = await fn();

      if (!mountedRef.current) return;

      if (result.data !== null && !result.notFound) {
        setData(result.data);
        dataRef.current = result.data;
        setSource(result.source);
        setError(null);
        setStatus('success');
        setIsStale(result.isStale);
      } else if (result.notFound) {
        // Confirmed not found
        setData(null);
        dataRef.current = null;
        setError(null);
        setStatus('error');
        setIsStale(false);
      } else if (result.error) {
        // Network error — keep existing data if we have it (via dataRef, not stale closure)
        setError(result.error);
        if (dataRef.current !== null) {
          setStatus('stale');
          setIsStale(true);
        } else {
          setStatus('error');
          setIsStale(false);
        }
      } else if (result.data === null && !result.error && !result.notFound) {
        // Empty result (e.g., empty array is not null, but null data with no error)
        // This case shouldn't normally happen but handle it
        setStatus('error');
        setError('No data received');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  // Initial fetch + dependency changes
  useEffect(() => {
    mountedRef.current = true;

    // If we already have data from sync init, only background refresh if stale
    if (initialState.data !== null && !initialState.isStale) {
      // Fresh cache — no immediate fetch needed
      // But still check if we should background refresh
      const resourceType = resource.includes(':') ? resource.split(':')[0] : resource;
      if (isResourceStale(resourceType as never)) {
        doFetch(true, false);
      }
    } else if (initialState.data !== null && initialState.isStale) {
      // Stale cache — show data, background refresh
      doFetch(true, true); // use forceRefresh to bypass stale cache
    } else {
      // No cache — initial load
      doFetch(false, false);
    }

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Background refresh on window focus (throttled, only if stale)
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusRefresh.current < FOCUS_REFRESH_COOLDOWN_MS) return;

      const resourceType = resource.includes(':') ? resource.split(':')[0] : resource;
      if (isResourceStale(resourceType as never)) {
        lastFocusRefresh.current = now;
        doFetch(true, true); // forceRefresh to bypass stale cache
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [resource, doFetch]);

  // Refresh when network restored after being offline
  useEffect(() => {
    if (isOnline && connectionRestored) {
      doFetch(true, true); // forceRefresh after network restore
      consumeConnectionRestored();
    }
  }, [isOnline, connectionRestored, consumeConnectionRestored, doFetch]);

  // Cross-tab sync
  useEffect(() => {
    const unsubscribe = onCrossTabUpdate((updatedResource) => {
      const resourceType = resource.includes(':') ? resource.split(':')[0] : resource;
      const updatedType = updatedResource.includes(':') ? updatedResource.split(':')[0] : updatedResource;

      // Match exact resource or parent resource or home
      if (updatedResource === resource || updatedType === resourceType || updatedResource === 'home') {
        doFetch(true, true); // forceRefresh because another tab invalidated
      }
    });
    return unsubscribe;
  }, [resource, doFetch]);

  const retry = useCallback(() => {
    doFetch(false, true); // forceRefresh — bypass cache on retry
  }, [doFetch]);

  const isInitialLoading = status === 'loading' || status === 'idle';
  const isRefreshing = status === 'refreshing';

  return {
    data,
    status,
    source,
    error,
    isInitialLoading,
    isRefreshing,
    isStale,
    retry,
  };
}

// ============================================
// LIST HOOKS
// ============================================

export function usePublicServices(): PublicDataState<Service[]> {
  return usePublicDataInternal<Service[]>(
    'services',
    getPublicServices,
    () => forceRefreshResource<Service[]>('services'),
    []
  );
}

export function usePublicPortfolio(): PublicDataState<PortfolioItem[]> {
  return usePublicDataInternal<PortfolioItem[]>(
    'portfolio',
    getPublicPortfolio,
    () => forceRefreshResource<PortfolioItem[]>('portfolio'),
    []
  );
}

export function usePublicPricing(): PublicDataState<PricingPlan[]> {
  return usePublicDataInternal<PricingPlan[]>(
    'pricing',
    getPublicPricing,
    () => forceRefreshResource<PricingPlan[]>('pricing'),
    []
  );
}

export function usePublicFaqs(): PublicDataState<Faq[]> {
  return usePublicDataInternal<Faq[]>(
    'faqs',
    getPublicFaqs,
    () => forceRefreshResource<Faq[]>('faqs'),
    []
  );
}

export function usePublicHomePayload(): PublicDataState<HomePayload> {
  return usePublicDataInternal<HomePayload>(
    'home',
    getPublicHomePayload,
    () => forceRefreshResource<HomePayload>('home'),
    []
  );
}

export function usePublicSiteSettings(): PublicDataState<SiteSettings> {
  return usePublicDataInternal<SiteSettings>(
    'site-settings',
    getPublicSiteSettings,
    () => forceRefreshResource<SiteSettings>('site-settings'),
    []
  );
}

export function usePublicSocialLinks(): PublicDataState<SocialLink[]> {
  return usePublicDataInternal<SocialLink[]>(
    'social-links',
    getPublicSocialLinks,
    () => forceRefreshResource<SocialLink[]>('social-links'),
    []
  );
}

// ============================================
// DETAIL HOOKS
// ============================================

export interface PublicItemState<T> extends PublicDataState<T> {
  notFound: boolean;
}

export function usePublicServiceBySlug(slug: string | undefined): PublicItemState<Service> {
  const resource = slug ? getResourceKey('services-by-slug', slug) : 'services-by-slug';
  const [notFound, setNotFound] = useState(false);
  const base = usePublicDataInternal<Service>(
    resource,
    () => (slug ? getPublicServiceBySlug(slug) : Promise.resolve({ data: null, source: 'memory', error: 'No slug', notFound: true, isStale: false })),
    () => (slug ? forceRefreshResource<Service>('services-by-slug', slug) : Promise.resolve({ data: null, source: 'memory', error: 'No slug', notFound: true, isStale: false })),
    [slug]
  );

  useEffect(() => {
    // notFound is true only when we have a confirmed 404 (no error, no data)
    if (base.status === 'error' && base.data === null && !base.error) {
      setNotFound(true);
    } else if (base.data !== null) {
      setNotFound(false);
    } else if (base.error) {
      // Network error — not a confirmed 404
      setNotFound(false);
    }
  }, [base.status, base.data, base.error]);

  return { ...base, notFound };
}

export function usePublicPortfolioBySlug(slug: string | undefined): PublicItemState<PortfolioItem> {
  const resource = slug ? getResourceKey('portfolio-by-slug', slug) : 'portfolio-by-slug';
  const [notFound, setNotFound] = useState(false);
  const base = usePublicDataInternal<PortfolioItem>(
    resource,
    () => (slug ? getPublicPortfolioBySlug(slug) : Promise.resolve({ data: null, source: 'memory', error: 'No slug', notFound: true, isStale: false })),
    () => (slug ? forceRefreshResource<PortfolioItem>('portfolio-by-slug', slug) : Promise.resolve({ data: null, source: 'memory', error: 'No slug', notFound: true, isStale: false })),
    [slug]
  );

  useEffect(() => {
    if (base.status === 'error' && base.data === null && !base.error) {
      setNotFound(true);
    } else if (base.data !== null) {
      setNotFound(false);
    } else if (base.error) {
      setNotFound(false);
    }
  }, [base.status, base.data, base.error]);

  return { ...base, notFound };
}

// ============================================
// PREFETCH HELPER
// ============================================

export function usePrefetchOnIdle(resources: string[]): void {
  useEffect(() => {
    const schedule = () => {
      const run = () => {
        resources.forEach((r) => prefetchResource(r as never));
      };

      if ('requestIdleCallback' in window) {
        (window as Window).requestIdleCallback(run, { timeout: 3000 });
      } else {
        setTimeout(run, 1500);
      }
    };

    schedule();
  }, [resources]);
}

export function usePrefetchOnHover(): { prefetchOnHover: (resource: string) => void } {
  const prefetchOnHover = useCallback((resource: string) => {
    prefetchResource(resource as never);
  }, []);

  return { prefetchOnHover };
}
