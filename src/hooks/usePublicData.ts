/**
 * React hooks for public data fetching with stale-while-revalidate.
 *
 * Behavior:
 * - Returns cached data immediately (memory or persistent)
 * - Triggers background refresh if data is stale
 * - Never overwrites last-known-good with null/empty on network failure
 * - Distinguishes "not found" from "network error"
 * - Deduplicates requests across components
 * - Refreshes on window focus and network restore (only if stale)
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
  isResourceStale,
  onCrossTabUpdate,
  prefetchResource,
  type DataSource,
  type DataStatus,
  type HomePayload,
} from '../lib/publicDataClient';
import type { Service, PortfolioItem, PricingPlan, Faq } from '../types/database';
import type { SiteSettings, SocialLink } from '../types/settings';
import { useNetworkStatus } from './useNetworkStatus';

const FOCUS_REFRESH_COOLDOWN_MS = 60 * 1000; // min 1 min between focus refreshes

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

function usePublicDataInternal<T>(
  resource: string,
  fetcher: () => Promise<{ data: T | null; source: DataSource; error: string | null }>,
  deps: React.DependencyList
): PublicDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [source, setSource] = useState<DataSource>('memory');
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const { isOnline, wasOffline } = useNetworkStatus();
  const lastFocusRefresh = useRef(0);
  const mountedRef = useRef(true);

  const doFetch = useCallback(
    async (isBackground: boolean) => {
      if (!mountedRef.current) return;

      if (!isBackground) {
        setStatus((prev) => (prev === 'success' ? 'refreshing' : 'loading'));
      } else {
        setStatus((prev) => (prev === 'success' ? 'refreshing' : prev));
      }

      const result = await fetcher();

      if (!mountedRef.current) return;

      if (result.data !== null) {
        setData(result.data);
        setSource(result.source);
        setError(null);
        setStatus('success');
        setIsStale(false);
      } else if (result.error) {
        // Network error — keep existing data if we have it
        setError(result.error);
        if (data !== null) {
          setStatus('stale');
        } else {
          setStatus('error');
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  // Initial fetch + dependency changes
  useEffect(() => {
    mountedRef.current = true;
    doFetch(false);

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
      if (isResourceStale(resource as never)) {
        lastFocusRefresh.current = now;
        doFetch(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [resource, doFetch]);

  // Refresh when network restored after being offline
  useEffect(() => {
    if (isOnline && wasOffline) {
      doFetch(true);
    }
  }, [isOnline, wasOffline, doFetch]);

  // Cross-tab sync
  useEffect(() => {
    const unsubscribe = onCrossTabUpdate((updatedResource) => {
      if (updatedResource === resource || updatedResource === 'home') {
        doFetch(true);
      }
    });
    return unsubscribe;
  }, [resource, doFetch]);

  const retry = useCallback(() => {
    doFetch(false);
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
  return usePublicDataInternal<Service[]>('services', getPublicServices, []);
}

export function usePublicPortfolio(): PublicDataState<PortfolioItem[]> {
  return usePublicDataInternal<PortfolioItem[]>('portfolio', getPublicPortfolio, []);
}

export function usePublicPricing(): PublicDataState<PricingPlan[]> {
  return usePublicDataInternal<PricingPlan[]>('pricing', getPublicPricing, []);
}

export function usePublicFaqs(): PublicDataState<Faq[]> {
  return usePublicDataInternal<Faq[]>('faqs', getPublicFaqs, []);
}

export function usePublicHomePayload(): PublicDataState<HomePayload> {
  return usePublicDataInternal<HomePayload>('home', getPublicHomePayload, []);
}

export function usePublicSiteSettings(): PublicDataState<SiteSettings> {
  return usePublicDataInternal<SiteSettings>('site-settings', getPublicSiteSettings, []);
}

export function usePublicSocialLinks(): PublicDataState<SocialLink[]> {
  return usePublicDataInternal<SocialLink[]>('social-links', getPublicSocialLinks, []);
}

// ============================================
// DETAIL HOOKS
// ============================================

export interface PublicItemState<T> extends PublicDataState<T> {
  notFound: boolean;
}

export function usePublicServiceBySlug(slug: string | undefined): PublicItemState<Service> {
  const [notFound, setNotFound] = useState(false);
  const base = usePublicDataInternal<Service>(
    `services-by-slug:${slug}`,
    () => (slug ? getPublicServiceBySlug(slug) : Promise.resolve({ data: null, source: 'memory', error: 'No slug' })),
    [slug]
  );

  useEffect(() => {
    if (base.status === 'success' && base.data === null && !base.error) {
      setNotFound(true);
    } else if (base.data !== null) {
      setNotFound(false);
    }
  }, [base.status, base.data, base.error]);

  return { ...base, notFound };
}

export function usePublicPortfolioBySlug(slug: string | undefined): PublicItemState<PortfolioItem> {
  const [notFound, setNotFound] = useState(false);
  const base = usePublicDataInternal<PortfolioItem>(
    `portfolio-by-slug:${slug}`,
    () => (slug ? getPublicPortfolioBySlug(slug) : Promise.resolve({ data: null, source: 'memory', error: 'No slug' })),
    [slug]
  );

  useEffect(() => {
    if (base.status === 'success' && base.data === null && !base.error) {
      setNotFound(true);
    } else if (base.data !== null) {
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
