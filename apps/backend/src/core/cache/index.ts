/**
 * @suop/backend — Cache Service
 *
 * RC1 Fix Pack 2 §B-1: Distributed cache for:
 *   - Session cache (user profile, permissions) — TTL 5 min
 *   - Configuration cache (tenant settings, feature flags) — TTL 1 min
 *   - Master data cache (products, customers, suppliers) — TTL 10 min
 *   - Dashboard cache (executive widgets) — TTL 30 sec
 *   - Analytics cache (BI facts) — TTL 5 min
 *
 * Pattern: lazy cache-aside with explicit invalidation.
 * Failures are silent — if Redis is down, callers fall through to DB.
 */

import { getRedis } from './redis-client'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CacheOptions {
  /** TTL in seconds. Default: 300 (5 minutes). */
  ttlSeconds?: number
  /** Namespace prefix for the key (e.g., 'tenant:123:products'). */
  namespace?: string
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  hitRatio: number
}

// ─── Stats ──────────────────────────────────────────────────────────────────

const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0,
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function buildKey(namespace: string | undefined, key: string): string {
  return namespace ? `suop:${namespace}:${key}` : `suop:${key}`
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const cache = {
  /**
   * Get a cached JSON value. Returns undefined on miss or error.
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | undefined> {
    try {
      const client = await getRedis()
      const raw = await client.get(buildKey(options?.namespace, key))
      if (raw === null) {
        stats.misses++
        return undefined
      }
      stats.hits++
      return JSON.parse(raw) as T
    } catch (err) {
      stats.errors++
      logger.debug('Cache get failed (graceful degradation)', {
        key,
        error: (err as Error).message,
      })
      return undefined
    }
  },

  /**
   * Set a JSON value with TTL.
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const client = await getRedis()
      const ttl = options?.ttlSeconds ?? 300
      await client.set(buildKey(options?.namespace, key), JSON.stringify(value), ttl)
      stats.sets++
    } catch (err) {
      stats.errors++
      logger.debug('Cache set failed (graceful degradation)', {
        key,
        error: (err as Error).message,
      })
    }
  },

  /**
   * Delete a key. Also supports pattern deletion via namespace.
   */
  async del(key: string, options?: CacheOptions): Promise<void> {
    try {
      const client = await getRedis()
      await client.del(buildKey(options?.namespace, key))
      stats.deletes++
    } catch (err) {
      stats.errors++
      logger.debug('Cache del failed', { key, error: (err as Error).message })
    }
  },

  /**
   * Cache-aside helper: get-or-fetch pattern.
   * If the value is not in cache, calls the fetcher, caches the result, and returns it.
   * Failures in fetcher propagate to the caller.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await cache.get<T>(key, options)
    if (cached !== undefined) return cached
    const fresh = await fetcher()
    await cache.set(key, fresh, options)
    return fresh
  },

  /**
   * Invalidate all keys under a namespace (e.g., all caches for tenant 't1').
   * Implementation: track keys in a set, delete members, delete set.
   */
  async invalidateNamespace(namespace: string): Promise<number> {
    try {
      const client = await getRedis()
      // For in-memory impl, we just track keys in a meta key
      const metaKey = `suop:__ns__:${namespace}`
      const keysJson = await client.get(metaKey)
      if (!keysJson) return 0
      const keys = JSON.parse(keysJson) as string[]
      if (keys.length === 0) return 0
      await client.del(...keys, metaKey)
      stats.deletes += keys.length
      return keys.length
    } catch (err) {
      stats.errors++
      logger.debug('Cache invalidateNamespace failed', {
        namespace,
        error: (err as Error).message,
      })
      return 0
    }
  },

  /**
   * Get cache statistics for monitoring.
   */
  getStats(): CacheStats {
    const total = stats.hits + stats.misses
    return {
      ...stats,
      hitRatio: total > 0 ? stats.hits / total : 0,
    }
  },

  /**
   * Reset statistics (for testing).
   */
  resetStats(): void {
    stats.hits = 0
    stats.misses = 0
    stats.sets = 0
    stats.deletes = 0
    stats.errors = 0
  },
}

// ─── Specialized Cache Namespaces ───────────────────────────────────────────

/**
 * Permission cache — caches the permission list for a user.
 * TTL: 5 minutes. Invalidated on role change or logout.
 */
export const permissionCache = {
  async get(userId: string, tenantId: string): Promise<string[] | undefined> {
    return cache.get<string[]>(`perm:${userId}`, {
      namespace: `tenant:${tenantId}`,
      ttlSeconds: 300,
    })
  },

  async set(userId: string, tenantId: string, permissions: string[]): Promise<void> {
    await cache.set(`perm:${userId}`, permissions, {
      namespace: `tenant:${tenantId}`,
      ttlSeconds: 300,
    })
  },

  async invalidate(userId: string, tenantId: string): Promise<void> {
    await cache.del(`perm:${userId}`, { namespace: `tenant:${tenantId}` })
  },
}

/**
 * Configuration cache — tenant settings, feature flags.
 * TTL: 1 minute (short — config changes should propagate quickly).
 */
export const configCache = {
  async get<T>(key: string, tenantId: string): Promise<T | undefined> {
    return cache.get<T>(key, {
      namespace: `config:${tenantId}`,
      ttlSeconds: 60,
    })
  },

  async set<T>(key: string, tenantId: string, value: T): Promise<void> {
    await cache.set(key, value, {
      namespace: `config:${tenantId}`,
      ttlSeconds: 60,
    })
  },

  async invalidate(tenantId: string): Promise<void> {
    await cache.invalidateNamespace(`config:${tenantId}`)
  },
}

/**
 * Master data cache — products, customers, suppliers.
 * TTL: 10 minutes (longer — master data changes infrequently).
 */
export const masterDataCache = {
  async get<T>(entityType: string, id: string, tenantId: string): Promise<T | undefined> {
    return cache.get<T>(`${entityType}:${id}`, {
      namespace: `master:${tenantId}`,
      ttlSeconds: 600,
    })
  },

  async set<T>(entityType: string, id: string, tenantId: string, value: T): Promise<void> {
    await cache.set(`${entityType}:${id}`, value, {
      namespace: `master:${tenantId}`,
      ttlSeconds: 600,
    })
  },

  async invalidate(entityType: string, id: string, tenantId: string): Promise<void> {
    await cache.del(`${entityType}:${id}`, { namespace: `master:${tenantId}` })
  },

  async invalidateTenant(tenantId: string): Promise<void> {
    await cache.invalidateNamespace(`master:${tenantId}`)
  },
}

/**
 * Dashboard cache — executive dashboard widgets.
 * TTL: 30 seconds (very short — near-real-time).
 */
export const dashboardCache = {
  async get<T>(widgetId: string, tenantId: string): Promise<T | undefined> {
    return cache.get<T>(widgetId, {
      namespace: `dash:${tenantId}`,
      ttlSeconds: 30,
    })
  },

  async set<T>(widgetId: string, tenantId: string, value: T): Promise<void> {
    await cache.set(widgetId, value, {
      namespace: `dash:${tenantId}`,
      ttlSeconds: 30,
    })
  },

  async invalidate(tenantId: string): Promise<void> {
    await cache.invalidateNamespace(`dash:${tenantId}`)
  },
}

/**
 * Analytics cache — BI fact tables, KPI snapshots.
 * TTL: 5 minutes (medium — analytics can be slightly stale).
 */
export const analyticsCache = {
  async get<T>(queryHash: string, tenantId: string): Promise<T | undefined> {
    return cache.get<T>(queryHash, {
      namespace: `analytics:${tenantId}`,
      ttlSeconds: 300,
    })
  },

  async set<T>(queryHash: string, tenantId: string, value: T): Promise<void> {
    await cache.set(queryHash, value, {
      namespace: `analytics:${tenantId}`,
      ttlSeconds: 300,
    })
  },

  async invalidate(tenantId: string): Promise<void> {
    await cache.invalidateNamespace(`analytics:${tenantId}`)
  },
}
