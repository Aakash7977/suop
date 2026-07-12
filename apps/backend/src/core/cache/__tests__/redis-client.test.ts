/**
 * Redis Client Tests
 *
 * Tests for the in-memory Redis implementation (used in test/dev).
 * Verifies all Redis operations behave correctly for the cache,
 * rate limiter, and session management modules.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { getRedis, closeRedis, isRedisHealthy } from '@/core/cache/redis-client'

describe('Redis Client — Basic Operations', () => {
  let client: Awaited<ReturnType<typeof getRedis>>

  beforeEach(async () => {
    client = await getRedis()
  })

  it('set + get round-trips a value', async () => {
    await client.set('test-key-1', 'value1')
    const result = await client.get('test-key-1')
    expect(result).toBe('value1')
  })

  it('get returns null for missing key', async () => {
    const result = await client.get('nonexistent')
    expect(result).toBeNull()
  })

  it('del removes a key', async () => {
    await client.set('test-key-2', 'value2')
    const deleted = await client.del('test-key-2')
    expect(deleted).toBe(1)
    expect(await client.get('test-key-2')).toBeNull()
  })

  it('del returns 0 for missing key', async () => {
    const deleted = await client.del('never-existed')
    expect(deleted).toBe(0)
  })

  it('exists returns true for existing key', async () => {
    await client.set('test-exists', 'yes')
    expect(await client.exists('test-exists')).toBe(true)
  })

  it('exists returns false for missing key', async () => {
    expect(await client.exists('missing')).toBe(false)
  })
})

describe('Redis Client — TTL', () => {
  let client: Awaited<ReturnType<typeof getRedis>>

  beforeEach(async () => {
    client = await getRedis()
  })

  it('set with TTL expires the key', async () => {
    await client.set('ttl-key', 'value', 1) // 1 second TTL
    expect(await client.get('ttl-key')).toBe('value')
    await new Promise((resolve) => setTimeout(resolve, 1100))
    expect(await client.get('ttl-key')).toBeNull()
  })

  it('set without TTL persists indefinitely', async () => {
    await client.set('no-ttl', 'persists')
    expect(await client.get('no-ttl')).toBe('persists')
  })

  it('expire sets TTL on existing key', async () => {
    await client.set('expire-test', 'value')
    const result = await client.expire('expire-test', 100)
    expect(result).toBe(true)
  })

  it('expire returns false for missing key', async () => {
    const result = await client.expire('missing-key', 100)
    expect(result).toBe(false)
  })
})

describe('Redis Client — Counters', () => {
  let client: Awaited<ReturnType<typeof getRedis>>

  beforeEach(async () => {
    client = await getRedis()
  })

  it('incr starts at 1', async () => {
    const result = await client.incr('counter-1')
    expect(result).toBe(1)
  })

  it('incr increments', async () => {
    await client.incr('counter-2')
    await client.incr('counter-2')
    const result = await client.incr('counter-2')
    expect(result).toBe(3)
  })

  it('incrExpire sets TTL on first increment', async () => {
    const result = await client.incrExpire('counter-3', 100)
    expect(result).toBe(1)
    // Key should exist with TTL
    expect(await client.exists('counter-3')).toBe(true)
  })

  it('incrExpire continues incrementing', async () => {
    await client.incrExpire('counter-4', 100)
    await client.incrExpire('counter-4', 100)
    const result = await client.incrExpire('counter-4', 100)
    expect(result).toBe(3)
  })
})

describe('Redis Client — Hash Operations', () => {
  let client: Awaited<ReturnType<typeof getRedis>>

  beforeEach(async () => {
    client = await getRedis()
  })

  it('hset + hget round-trips a field', async () => {
    await client.hset('hash-1', 'field1', 'value1')
    expect(await client.hget('hash-1', 'field1')).toBe('value1')
  })

  it('hget returns null for missing field', async () => {
    expect(await client.hget('hash-1', 'missing')).toBeNull()
  })

  it('hgetall returns all fields', async () => {
    await client.hset('hash-2', 'a', '1')
    await client.hset('hash-2', 'b', '2')
    await client.hset('hash-2', 'c', '3')
    const result = await client.hgetall('hash-2')
    expect(result).toEqual({ a: '1', b: '2', c: '3' })
  })

  it('hgetall returns empty object for missing hash', async () => {
    const result = await client.hgetall('missing-hash')
    expect(result).toEqual({})
  })

  it('hdel removes a field', async () => {
    await client.hset('hash-3', 'field1', 'value1')
    await client.hset('hash-3', 'field2', 'value2')
    const deleted = await client.hdel('hash-3', 'field1')
    expect(deleted).toBe(1)
    expect(await client.hget('hash-3', 'field1')).toBeNull()
    expect(await client.hget('hash-3', 'field2')).toBe('value2')
  })

  it('hdel returns 0 for missing field', async () => {
    const deleted = await client.hdel('hash-3', 'missing')
    expect(deleted).toBe(0)
  })
})

describe('Redis Client — Distributed Lock', () => {
  let client: Awaited<ReturnType<typeof getRedis>>

  beforeEach(async () => {
    client = await getRedis()
  })

  it('acquireLock returns a token', async () => {
    const token = await client.acquireLock('lock-1', 5000)
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
  })

  it('acquireLock returns null when already held', async () => {
    const token1 = await client.acquireLock('lock-2', 5000)
    expect(token1).toBeTruthy()
    const token2 = await client.acquireLock('lock-2', 5000)
    expect(token2).toBeNull()
  })

  it('releaseLock succeeds with correct token', async () => {
    const token = await client.acquireLock('lock-3', 5000)
    const released = await client.releaseLock('lock-3', token!)
    expect(released).toBe(true)
  })

  it('releaseLock fails with wrong token', async () => {
    await client.acquireLock('lock-4', 5000)
    const released = await client.releaseLock('lock-4', 'wrong-token')
    expect(released).toBe(false)
  })

  it('lock can be re-acquired after release', async () => {
    const token1 = await client.acquireLock('lock-5', 5000)
    await client.releaseLock('lock-5', token1!)
    const token2 = await client.acquireLock('lock-5', 5000)
    expect(token2).toBeTruthy()
    await client.releaseLock('lock-5', token2!)
  })
})

describe('Redis Client — Health Check', () => {
  it('ping returns true', async () => {
    const client = await getRedis()
    expect(await client.ping()).toBe(true)
  })

  it('isRedisHealthy returns true', async () => {
    const healthy = await isRedisHealthy()
    expect(healthy).toBe(true)
  })
})

describe('Redis Client — Connection', () => {
  it('getRedis returns the same singleton', async () => {
    const c1 = await getRedis()
    const c2 = await getRedis()
    expect(c1).toBe(c2)
  })

  it('closeRedis closes the connection', async () => {
    await closeRedis()
    // After close, getRedis should create a new connection
    const client = await getRedis()
    expect(client).toBeTruthy()
  })
})
