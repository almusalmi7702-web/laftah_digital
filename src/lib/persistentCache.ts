/**
 * Persistent cache layer backed by localStorage.
 * Stores versioned entries with metadata for stale-while-revalidate.
 *
 * invalidatedAt: timestamp set by admin operations to mark an entry as stale
 * without deleting the last-known-good data. The client treats an entry as
 * stale when invalidatedAt > savedAt.
 */

const PREFIX = 'laftah:public:v2';
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days last-known-good retention

export interface CacheEntry<T> {
  version: number;
  data: T;
  savedAt: number;
  updatedAt: number | null;
  invalidatedAt: number | null;
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
      invalidatedAt: parsed.invalidatedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function writeCache<T>(
  resource: string,
  data: T,
  updatedAt: number | null = null
): void {
  if (!isBrowser()) return;

  // Preserve invalidatedAt from existing entry — a fresh write from network
  // clears it because the data is now current.
  const existing = readCache<T>(resource);
  const entry: StoredEntry<T> = {
    version: 2,
    resource,
    data,
    savedAt: Date.now(),
    updatedAt,
    invalidatedAt: null, // fresh network data clears stale marker
  };
  void existing; // explicitly not preserving — new data supersedes stale mark

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

/**
 * Mark a cache entry as stale without deleting the data.
 * Sets invalidatedAt = now so the client knows to background-refresh.
 */
export function markCacheStale(resource: string): void {
  if (!isBrowser()) return;

  const existing = readCache<unknown>(resource);
  if (!existing) return; // nothing to mark

  const entry: StoredEntry<unknown> = {
    version: 2,
    resource,
    data: existing.data,
    savedAt: existing.savedAt,
    updatedAt: existing.updatedAt,
    invalidatedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(buildKey(resource), JSON.stringify(entry));
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

// ============================================
// SINGLETON BROADCAST CHANNEL
// ============================================

let sharedChannel: BroadcastChannel | null = null;
const channelListeners = new Set<(resource: string) => void>();

function getSharedChannel(): BroadcastChannel | null {
  if (!isBrowser()) return null;
  if (sharedChannel) return sharedChannel;

  try {
    sharedChannel = new BroadcastChannel('laftah-cache');
    sharedChannel.onmessage = (event: MessageEvent) => {
      if (event.data?.resource) {
        channelListeners.forEach((cb) => cb(event.data.resource));
      }
    };
  } catch {
    sharedChannel = null;
  }

  return sharedChannel;
}

/**
 * Subscribe to cross-tab cache updates via a single shared BroadcastChannel.
 * Returns an unsubscribe function.
 */
export function subscribeToCacheUpdates(callback: (resource: string) => void): () => void {
  channelListeners.add(callback);
  getSharedChannel();

  // Storage event fallback (fires in other tabs when localStorage changes)
  const storageHandler = (e: StorageEvent) => {
    if (e.key && e.key.startsWith(`${PREFIX}:`)) {
      const resource = e.key.replace(`${PREFIX}:`, '');
      callback(resource);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  return () => {
    channelListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
  };
}

/**
 * Broadcast a cache update to other tabs via the shared channel.
 */
export function broadcastCacheUpdate(resource: string): void {
  if (!isBrowser()) return;

  const channel = getSharedChannel();
  if (channel) {
    try {
      channel.postMessage({ resource, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
  // storage event is triggered automatically by localStorage writes
}

export { PREFIX as CACHE_PREFIX };
