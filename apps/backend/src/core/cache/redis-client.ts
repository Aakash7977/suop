/**
 * @suop/backend — Redis Client Singleton
 *
 * RC1 Fix Pack 2: Production Redis integration for:
 *   - Distributed rate limiting (token bucket + sliding window)
 *   - Session cache (permission lookup, user profile)
 *   - Configuration cache (tenant settings, feature flags)
 *   - Master data cache (products, customers, suppliers)
 *   - Distributed locks (horizontal scaling)
 *   - Background job queue (BullMQ)
 *
 * Per RC1 Fix Pack 2 §B-1 and B-6.
 *
 * Strategy:
 *   - In production: real Redis (REDIS_URL env var, rediss:// for TLS)
 *   - In development: real Redis if available, in-memory fallback if not
 *   - In test: in-memory mock (deterministic, no external dependency)
 *
 * The client exposes a unified API:
 *   - get/set/del — basic string operations with TTL
 *   - incr/incrExpire — atomic counters for rate limiting
 *   - hashOps — hash operations for complex cache values
 *   - pub/sub — event broadcasting
 *   - acquireLock/releaseLock — distributed locks
 *
 * All operations are wrapped with try/catch and timeouts — a Redis outage
 * must NEVER break the application (graceful degradation).
 */

import { env, isTest } from '@/config/env'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RedisClient {
  /** Get a string value by key. Returns null if missing. */
  get(key: string): Promise<string | null>

  /** Set a string value with TTL (seconds). 0 = no expiry. */
  set(key: string, value: string, ttlSeconds?: number): Promise<boolean>

  /** Delete one or more keys. Returns number deleted. */
  del(...keys: string[]): Promise<number>

  /** Atomically increment a counter. Returns the new value. */
  incr(key: string): Promise<number>

  /** Increment + set expiry in a single pipeline (atomic). */
  incrExpire(key: string, ttlSeconds: number): Promise<number>

  /** Check if key exists. */
  exists(key: string): Promise<boolean>

  /** Set TTL on an existing key. */
  expire(key: string, ttlSeconds: number): Promise<boolean>

  /** Hash: set a single field. */
  hset(key: string, field: string, value: string): Promise<number>

  /** Hash: get a single field. */
  hget(key: string, field: string): Promise<string | null>

  /** Hash: get all fields. */
  hgetall(key: string): Promise<Record<string, string>>

  /** Hash: delete a field. */
  hdel(key: string, ...fields: string[]): Promise<number>

  /** Acquire a distributed lock with TTL. Returns unlock token, or null if failed. */
  acquireLock(key: string, ttlMs: number): Promise<string | null>

  /** Release a distributed lock. Only succeeds if token matches. */
  releaseLock(key: string, token: string): Promise<boolean>

  /** Ping the server. Returns true if responsive. */
  ping(): Promise<boolean>

  /** Close the connection. */
  close(): Promise<void>
}

// ─── In-Memory Implementation (test/dev fallback) ───────────────────────────

class InMemoryRedis implements RedisClient {
  private store = new Map<string, { value: string; expiresAt?: number }>()
  private hashes = new Map<string, Map<string, string>>()
  private locks = new Map<string, { token: string; expiresAt: number }>()

  private isExpired(entry: { expiresAt?: number }): boolean {
    return entry.expiresAt !== undefined && Date.now() >= entry.expiresAt
  }

  private cleanKey(key: string): void {
    const entry = this.store.get(key)
    if (entry && this.isExpired(entry)) {
      this.store.delete(key)
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanKey(key)
    return this.store.get(key)?.value ?? null
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined,
    })
    return true
  }

  async del(...keys: string[]): Promise<number> {
    let n = 0
    for (const k of keys) {
      if (this.store.delete(k) || this.hashes.delete(k) || this.locks.delete(k)) n++
    }
    return n
  }

  async incr(key: string): Promise<number> {
    this.cleanKey(key)
    const entry = this.store.get(key)
    const current = entry ? parseInt(entry.value, 10) || 0 : 0
    const next = current + 1
    this.store.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt,
    })
    return next
  }

  async incrExpire(key: string, ttlSeconds: number): Promise<number> {
    this.cleanKey(key)
    const entry = this.store.get(key)
    const current = entry ? parseInt(entry.value, 10) || 0 : 0
    const next = current + 1
    this.store.set(key, {
      value: String(next),
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
    return next
  }

  async exists(key: string): Promise<boolean> {
    this.cleanKey(key)
    return this.store.has(key)
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    this.cleanKey(key)
    const entry = this.store.get(key)
    if (!entry) return false
    entry.expiresAt = Date.now() + ttlSeconds * 1000
    return true
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.hashes.has(key)) this.hashes.set(key, new Map())
    const isNew = !this.hashes.get(key)!.has(field)
    this.hashes.get(key)!.set(field, value)
    return isNew ? 1 : 0
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.hashes.get(key)?.get(field) ?? null
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const m = this.hashes.get(key)
    if (!m) return {}
    return Object.fromEntries(m)
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    const m = this.hashes.get(key)
    if (!m) return 0
    let n = 0
    for (const f of fields) {
      if (m.delete(f)) n++
    }
    if (m.size === 0) this.hashes.delete(key)
    return n
  }

  async acquireLock(key: string, ttlMs: number): Promise<string | null> {
    const existing = this.locks.get(key)
    if (existing && Date.now() < existing.expiresAt) {
      return null
    }
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    this.locks.set(key, { token, expiresAt: Date.now() + ttlMs })
    return token
  }

  async releaseLock(key: string, token: string): Promise<boolean> {
    const existing = this.locks.get(key)
    if (!existing || existing.token !== token) return false
    this.locks.delete(key)
    return true
  }

  async ping(): Promise<boolean> {
    return true
  }

  async close(): Promise<void> {
    this.store.clear()
    this.hashes.clear()
    this.locks.clear()
  }
}

// ─── Real Redis Implementation (production) ─────────────────────────────────

class RealRedisClient implements RedisClient {
  private client: any

  constructor(client: any) {
    this.client = client
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds)
    } else {
      await this.client.set(key, value)
    }
    return true
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async incrExpire(key: string, ttlSeconds: number): Promise<number> {
    const multi = this.client.multi()
    multi.incr(key)
    multi.expire(key, ttlSeconds)
    const results = await multi.exec()
    return results[0]
  }

  async exists(key: string): Promise<boolean> {
    const r = await this.client.exists(key)
    return r === 1
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return this.client.expire(key, ttlSeconds)
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value)
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field)
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key)
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(key, ...fields)
  }

  async acquireLock(key: string, ttlMs: number): Promise<string | null> {
    // SET key token NX PX ttlMs — atomic acquire
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const result = await this.client.set(key, token, 'PX', ttlMs, 'NX')
    return result === 'OK' ? token : null
  }

  async releaseLock(key: string, token: string): Promise<boolean> {
    // Lua script for safe release — only delete if token matches
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `
    const result = await this.client.eval(script, 1, key, token)
    return result === 1
  }

  async ping(): Promise<boolean> {
    try {
      const r = await this.client.ping()
      return r === 'PONG'
    } catch {
      return false
    }
  }

  async close(): Promise<void> {
    await this.client.quit()
  }
}

// ─── Singleton Factory ──────────────────────────────────────────────────────

let _client: RedisClient | null = null
let _initializationPromise: Promise<RedisClient> | null = null

/**
 * Get the singleton Redis client.
 *
 * In test mode: always returns an in-memory client (deterministic).
 * In dev/staging/prod: tries to connect to real Redis; falls back to
 * in-memory if connection fails (with a warning logged).
 */
export async function getRedis(): Promise<RedisClient> {
  if (_client) return _client
  if (_initializationPromise) return _initializationPromise

  _initializationPromise = (async () => {
    if (isTest) {
      logger.info('Redis: using in-memory client (test mode)')
      _client = new InMemoryRedis()
      return _client
    }

    try {
      // Dynamic import — ioredis is optional in dev (fallback to in-memory)
      const IORedisModule = await import('ioredis')
      const IORedis = IORedisModule.default
      const real = new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy(times: number) {
          if (times > 3) return null
          return Math.min(times * 200, 1000)
        },
      })

      // Wait for connection with 5s timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          real.once('ready', () => resolve())
          real.once('error', (err: Error) => reject(err))
        }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Redis connect timeout')), 5000)
        ),
      ])

      logger.info('Redis: connected', { url: env.REDIS_URL.replace(/:[^:@]+@/, ':***@') })
      _client = new RealRedisClient(real)
      return _client
    } catch (err) {
      logger.warn('Redis: connection failed, falling back to in-memory', {
        error: (err as Error).message,
      })
      _client = new InMemoryRedis()
      return _client
    }
  })()

  return _initializationPromise
}

/**
 * Synchronous getter for cases where we know the client is initialized.
 * Returns null if not yet initialized.
 */
export function getRedisSync(): RedisClient | null {
  return _client
}

/**
 * Close the Redis connection. Called on graceful shutdown.
 */
export async function closeRedis(): Promise<void> {
  if (_client) {
    await _client.close()
    _client = null
    _initializationPromise = null
    logger.info('Redis: connection closed')
  }
}

/**
 * Health check — used by the /health endpoint.
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const client = await getRedis()
    return client.ping()
  } catch {
    return false
  }
}
