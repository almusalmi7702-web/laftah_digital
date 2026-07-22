/**
 * Cache invalidation helpers for admin operations.
 * Called after successful create/update/delete to refresh the public cache.
 *
 * invalidateResource now marks cache as stale (invalidatedAt) instead of deleting,
 * preserving last-known-good data while forcing a background refresh.
 */

import { invalidateResource, invalidateAll } from './publicDataClient';
import type { ResourceType } from './publicDataClient';

export function invalidateServices(): void {
  invalidateResource('services');
  invalidateResource('home');
}

export function invalidatePortfolio(): void {
  invalidateResource('portfolio');
  invalidateResource('home');
}

export function invalidatePricing(): void {
  invalidateResource('pricing');
  invalidateResource('home');
}

export function invalidateFaqs(): void {
  invalidateResource('faqs');
  invalidateResource('home');
}

export function invalidateSiteSettings(): void {
  invalidateResource('site-settings');
  invalidateResource('home');
}

export function invalidateSocialLinks(): void {
  invalidateResource('social-links');
  invalidateResource('home');
}

export function invalidatePublicCache(resource?: ResourceType): void {
  if (resource) {
    invalidateResource(resource);
    invalidateResource('home');
  } else {
    invalidateAll();
  }
}
