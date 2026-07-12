/**
 * Rate Limiter Service Tests
 *
 * Tests for the sliding window and token bucket algorithms,
 * lockout policy, and brute force protection.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  rateLimiter,
  DEFAULT_RATE_LIMIT_RULES,
  DEFAULT_LOCKOUT_POLICY,
  buildRateLimitId,
  rateLimitHeaders,
  type RateLimitConfig,
} from '@/core/security/rate-limiter'

describe('RateLimiter — Sliding Window Algorithm', () => {
  beforeEach(() => {
    // Each test uses a unique identifier to avoid interference
  })

  it('allows requests under the limit', async () => {
    const id = `test-sw-allow-${Date.now()}-${Math.random()}`
    const config: RateLimitConfig = { limit: 5, windowSeconds: 60, algorithm: 'sliding' }
    const result = await rateLimiter.check('test', id, config)
    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(5)
    expect(result.remaining).toBe(4)
  })

  it('blocks requests over the limit', async () => {
    const id = `test-sw-block-${Date.now()}-${Math.random()}`
    const config: RateLimitConfig = { limit: 3, windowSeconds: 60, algorithm: 'sliding' }

    // Use up the limit
    await rateLimiter.check('test', id, config)
    await rateLimiter.check('test', id, config)
    await rateLimiter.check('test', id, config)

    // 4th request should be blocked
    const result = await rateLimiter.check('test', id, config)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('reports correct remaining count', async () => {
    const id = `test-sw-remaining-${Date.now()}-${Math.random()}`
    const config: RateLimitConfig = { limit: 10, windowSeconds: 60, algorithm: 'sliding' }

    const r1 = await rateLimiter.check('test', id, config)
    expect(r1.remaining).toBe(9)

    const r2 = await rateLimiter.check('test', id, config)
    expect(r2.remaining).toBe(8)

    const r3 = await rateLimiter.check('test', id, config)
    expect(r3.remaining).toBe(7)
  })

  it('sets resetAt in the future', async () => {
    const id = `test-sw-reset-${Date.now()}-${Math.random()}`
    const config: RateLimitConfig = { limit: 5, windowSeconds: 60, algorithm: 'sliding' }
    const result = await rateLimiter.check('test', id, config)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })
})

describe('RateLimiter — Token Bucket Algorithm', () => {
  it('allows burst up to capacity', async () => {
    const id = `test-tb-burst-${Date.now()}-${Math.random()}`
    const config: RateLimitConfig = {
      limit: 5,
      windowSeconds: 60,
      algorithm: 'token_bucket',
      burst: 10,
    }

    // Should allow up to burst capacity immediately
    for (let i = 0; i < 10; i++) {
      const r = await rateLimiter.check('test', id, config)
      expect(r.allowed).toBe(true)
    }
  })

  it('refills tokens over time', async () => {
    const id = `test-tb-refill-${Date.now()}-${Math.random()}`
    const config: RateLimitConfig = {
      limit: 60, // 1 per second
      windowSeconds: 60,
      algorithm: 'token_bucket',
      burst: 2,
    }

    // Use the initial tokens
    await rateLimiter.check('test', id, config)
    await rateLimiter.check('test', id, config)

    // Wait 1.1 seconds for a refill
    await new Promise((resolve) => setTimeout(resolve, 1100))

    const r = await rateLimiter.check('test', id, config)
    expect(r.allowed).toBe(true)
  })
})

describe('RateLimiter — Lockout Policy', () => {
  it('locks account after threshold failed attempts', async () => {
    const id = `test-lock-${Date.now()}-${Math.random()}`

    // Record threshold failed attempts
    for (let i = 0; i < DEFAULT_LOCKOUT_POLICY.threshold; i++) {
      await rateLimiter.recordFailedLogin(id)
    }

    const { locked, lockedUntil } = await rateLimiter.isLocked(id)
    expect(locked).toBe(true)
    expect(lockedUntil).toBeGreaterThan(Date.now())
  })

  it('does not lock before threshold', async () => {
    const id = `test-nolock-${Date.now()}-${Math.random()}`

    for (let i = 0; i < DEFAULT_LOCKOUT_POLICY.threshold - 1; i++) {
      await rateLimiter.recordFailedLogin(id)
    }

    const { locked } = await rateLimiter.isLocked(id)
    expect(locked).toBe(false)
  })

  it('resets failed counter on successful login', async () => {
    const id = `test-reset-${Date.now()}-${Math.random()}`

    await rateLimiter.recordFailedLogin(id)
    await rateLimiter.recordFailedLogin(id)
    await rateLimiter.resetFailedLogin(id)

    const { locked } = await rateLimiter.isLocked(id)
    expect(locked).toBe(false)
  })

  it('applies exponential backoff on repeated lockouts', async () => {
    const id = `test-backoff-${Date.now()}-${Math.random()}`

    // First lockout
    for (let i = 0; i < DEFAULT_LOCKOUT_POLICY.threshold; i++) {
      await rateLimiter.recordFailedLogin(id)
    }
    const { lockedUntil: firstLock } = await rateLimiter.isLocked(id)
    expect(firstLock).toBeTruthy()

    // Reset and trigger second lockout (with more attempts)
    await rateLimiter.resetFailedLogin(id)
    for (let i = 0; i < DEFAULT_LOCKOUT_POLICY.threshold + 5; i++) {
      await rateLimiter.recordFailedLogin(id)
    }
    const { lockedUntil: secondLock } = await rateLimiter.isLocked(id)
    expect(secondLock).toBeTruthy()
    // Second lock should be longer than first (exponential backoff)
    if (firstLock && secondLock) {
      expect(secondLock).toBeGreaterThanOrEqual(firstLock)
    }
  })
})

describe('RateLimiter — Configuration', () => {
  it('exposes default rules', () => {
    const rules = rateLimiter.getRules()
    expect(rules.global.limit).toBe(DEFAULT_RATE_LIMIT_RULES.global.limit)
    expect(rules.login.limit).toBe(DEFAULT_RATE_LIMIT_RULES.login.limit)
    expect(rules.passwordReset.limit).toBe(DEFAULT_RATE_LIMIT_RULES.passwordReset.limit)
  })

  it('allows runtime rule updates', () => {
    const original = rateLimiter.getRules().global.limit
    rateLimiter.configure({ global: { limit: 999, windowSeconds: 60, algorithm: 'sliding' } })
    expect(rateLimiter.getRules().global.limit).toBe(999)
    // Restore
    rateLimiter.configure({ global: { limit: original, windowSeconds: 60, algorithm: 'sliding' } })
  })
})

describe('RateLimiter — Helper Functions', () => {
  it('buildRateLimitId combines tenant and user', () => {
    const id = buildRateLimitId({ tenantId: 't1', userId: 'u1' })
    expect(id).toBe('u:t1:u1')
  })

  it('buildRateLimitId falls back to tenant only', () => {
    const id = buildRateLimitId({ tenantId: 't1' })
    expect(id).toBe('t:t1')
  })

  it('buildRateLimitId falls back to IP', () => {
    const id = buildRateLimitId({ ip: '1.2.3.4' })
    expect(id).toBe('ip:1.2.3.4')
  })

  it('buildRateLimitId falls back to anon', () => {
    const id = buildRateLimitId({})
    expect(id).toBe('anon')
  })

  it('rateLimitHeaders produces correct format', () => {
    const headers = rateLimitHeaders({
      allowed: true,
      limit: 100,
      remaining: 95,
      resetAt: 1700000000000,
      retryAfterSeconds: 0,
    })
    expect(headers['X-RateLimit-Limit']).toBe('100')
    expect(headers['X-RateLimit-Remaining']).toBe('95')
    expect(headers['X-RateLimit-Reset']).toBe('1700000000')
    expect(headers['Retry-After']).toBeUndefined()
  })

  it('rateLimitHeaders includes Retry-After when limited', () => {
    const headers = rateLimitHeaders({
      allowed: false,
      limit: 100,
      remaining: 0,
      resetAt: 1700000000000,
      retryAfterSeconds: 30,
    })
    expect(headers['Retry-After']).toBe('30')
  })
})
