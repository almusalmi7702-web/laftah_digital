/**
 * Persistent cache layer backed by localStorage.
 * Stores versioned entries with metadata for stale-while-revalidate.
 */

const PREFIX = 'laftah:public:v2';
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days last-known-good retention

export interface CacheEntry<T> {
  version: number;
  data: T;
  savedAt: number;
  updatedAt: number | null;
}

interface StoredEntry<T> extends CacheEntry<T> {
  resource: string;
}

const isBrowser = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

const buildKey = (resource: string): string => `${PREFIX}:${resource}`;

export function readCache<T>(resource: string): CacheEntry<T> | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(buildKey(resource));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredEntry<T>;

    if (!parsed || typeof parsed !== 'object' || parsed.version !== 2) {
      return null;
    }

    if (!('data' in parsed) || typeof parsed.savedAt !== 'number') {
      return null;
    }

    return {
      version: parsed.version,
      data: parsed.data,
      savedAt: parsed.savedAt,
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function writeCache<T>(resource: string, data: T, updatedAt: number | null = null): void {
  if (!isBrowser()) return;

  const entry: StoredEntry<T> = {
    version: 2,
    resource,
    data,
    savedAt: Date.now(),
    updatedAt,
  };

  try {
    window.localStorage.setItem(buildKey(resource), JSON.stringify(entry));
  } catch {
    // localStorage full or blocked — silently ignore, memory cache still works
  }
}

export function removeCache(resource: string): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(buildKey(resource));
  } catch {
    // ignore
  }
}

export function isRetained(savedAt: number): boolean {
  return Date.now() - savedAt < RETENTION_MS;
}

export function getRetentionMs(): number {
  return RETENTION_MS;
}

/**
 * Broadcast a cache update to other tabs.
 */
export function broadcastCacheUpdate(resource: string): void {
  if (!isBrowser()) return;

  try {
    const channel = new BroadcastChannel('laftah-cache');
    channel.postMessage({ resource, timestamp: Date.now() });
    channel.close();
  } catch {
    // BroadcastChannel not supported — storage event fallback handles it
  }
}

export { PREFIX as CACHE_PREFIX };
