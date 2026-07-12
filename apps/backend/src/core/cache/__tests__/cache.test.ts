/**
 * Cache Service Tests
 *
 * Tests for the cache-aside pattern, TTL handling, namespace isolation,
 * and the specialized caches (permission, config, master data, dashboard, analytics).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  cache,
  permissionCache,
  configCache,
  masterDataCache,
  dashboardCache,
  analyticsCache,
} from '@/core/cache'

describe('Cache — Basic Operations', () => {
  beforeEach(() => {
    cache.resetStats()
  })

  it('set + get round-trips a value', async () => {
    await cache.set('key1', { name: 'test', count: 42 })
    const result = await cache.get<{ name: string; count: number }>('key1')
    expect(result).toEqual({ name: 'test', count: 42 })
  })

  it('get returns undefined for missing key', async () => {
    const result = await cache.get('nonexistent-key')
    expect(result).toBeUndefined()
  })

  it('del removes a key', async () => {
    await cache.set('key2', 'value')
    await cache.del('key2')
    const result = await cache.get('key2')
    expect(result).toBeUndefined()
  })

  it('handles string values', async () => {
    await cache.set('str-key', 'hello world')
    const result = await cache.get<string>('str-key')
    expect(result).toBe('hello world')
  })

  it('handles array values', async () => {
    await cache.set('arr-key', [1, 2, 3, 4, 5])
    const result = await cache.get<number[]>('arr-key')
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('handles null values', async () => {
    await cache.set('null-key', null)
    const result = await cache.get<null>('null-key')
    expect(result).toBeNull()
  })

  it('handles nested objects', async () => {
    const nested = { a: { b: { c: { d: 'deep' } } } }
    await cache.set('nested', nested)
    const result = await cache.get<typeof nested>('nested')
    expect(result).toEqual(nested)
  })
})

describe('Cache — Statistics', () => {
  beforeEach(() => {
    cache.resetStats()
  })

  it('tracks hits and misses', async () => {
    await cache.set('hit-key', 'value')
    await cache.get('hit-key') // hit
    await cache.get('miss-key') // miss

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
  })

  it('computes hit ratio', async () => {
    await cache.set('k1', 'v1')
    await cache.get('k1') // hit
    await cache.get('k1') // hit
    await cache.get('missing') // miss

    const stats = cache.getStats()
    expect(stats.hitRatio).toBeCloseTo(2 / 3, 2)
  })

  it('tracks sets and deletes', async () => {
    await cache.set('k', 'v')
    await cache.del('k')
    const stats = cache.getStats()
    expect(stats.sets).toBe(1)
    expect(stats.deletes).toBe(1)
  })

  it('handles zero-division for hit ratio', () => {
    const stats = cache.getStats()
    expect(stats.hitRatio).toBe(0)
  })
})

describe('Cache — getOrSet Pattern', () => {
  beforeEach(() => {
    cache.resetStats()
  })

  it('fetches and caches on miss', async () => {
    let fetchCalled = 0
    const fetcher = async () => {
      fetchCalled++
      return { computed: true }
    }

    const r1 = await cache.getOrSet('gos-1', fetcher)
    const r2 = await cache.getOrSet('gos-1', fetcher)

    expect(r1).toEqual({ computed: true })
    expect(r2).toEqual({ computed: true })
    expect(fetchCalled).toBe(1) // Only called on miss
  })

  it('does not call fetcher on cache hit', async () => {
    await cache.set('gos-2', 'cached')
    let fetchCalled = false
    const fetcher = async () => {
      fetchCalled = true
      return 'fresh'
    }

    const result = await cache.getOrSet('gos-2', fetcher)
    expect(result).toBe('cached')
    expect(fetchCalled).toBe(false)
  })
})

describe('Cache — Namespaces', () => {
  it('same key in different namespaces does not collide', async () => {
    await cache.set('user', 'alice', { namespace: 'tenant:t1' })
    await cache.set('user', 'bob', { namespace: 'tenant:t2' })

    const r1 = await cache.get<string>('user', { namespace: 'tenant:t1' })
    const r2 = await cache.get<string>('user', { namespace: 'tenant:t2' })

    expect(r1).toBe('alice')
    expect(r2).toBe('bob')
  })
})

describe('Permission Cache', () => {
  it('set + get round-trips permissions', async () => {
    await permissionCache.set('u1', 't1', ['product:read', 'product:create'])
    const result = await permissionCache.get('u1', 't1')
    expect(result).toEqual(['product:read', 'product:create'])
  })

  it('invalidate removes the cached permissions', async () => {
    await permissionCache.set('u2', 't1', ['product:read'])
    await permissionCache.invalidate('u2', 't1')
    const result = await permissionCache.get('u2', 't1')
    expect(result).toBeUndefined()
  })

  it('isolates by tenant', async () => {
    await permissionCache.set('u3', 't1', ['a:read'])
    await permissionCache.set('u3', 't2', ['b:read'])
    const r1 = await permissionCache.get('u3', 't1')
    const r2 = await permissionCache.get('u3', 't2')
    expect(r1).toEqual(['a:read'])
    expect(r2).toEqual(['b:read'])
  })
})

describe('Config Cache', () => {
  it('caches configuration values', async () => {
    await configCache.set('feature_flags', 't1', { newUi: true })
    const result = await configCache.get<{ newUi: boolean }>('feature_flags', 't1')
    expect(result).toEqual({ newUi: true })
  })
})

describe('Master Data Cache', () => {
  it('caches by entity type and ID', async () => {
    await masterDataCache.set('Product', 'p1', 't1', { name: 'Widget' })
    const result = await masterDataCache.get<{ name: string }>('Product', 'p1', 't1')
    expect(result).toEqual({ name: 'Widget' })
  })

  it('invalidate removes specific entity', async () => {
    await masterDataCache.set('Product', 'p2', 't1', { name: 'Widget2' })
    await masterDataCache.invalidate('Product', 'p2', 't1')
    const result = await masterDataCache.get('Product', 'p2', 't1')
    expect(result).toBeUndefined()
  })
})

describe('Dashboard Cache', () => {
  it('caches dashboard widget data', async () => {
    await dashboardCache.set('widget-1', 't1', { revenue: 100000 })
    const result = await dashboardCache.get<{ revenue: number }>('widget-1', 't1')
    expect(result).toEqual({ revenue: 100000 })
  })
})

describe('Analytics Cache', () => {
  it('caches analytics query results', async () => {
    await analyticsCache.set('query-hash-1', 't1', { rows: [{ total: 100 }] })
    const result = await analyticsCache.get<{ rows: unknown[] }>('query-hash-1', 't1')
    expect(result).toEqual({ rows: [{ total: 100 }] })
  })
})
