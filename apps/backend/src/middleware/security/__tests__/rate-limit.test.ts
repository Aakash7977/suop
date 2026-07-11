/**
 * Rate Limit Middleware Tests
 *
 * Tests for the middleware wrappers around the rate limiter service.
 * Verifies middleware behavior: header setting, 429 responses, identifier extraction.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import {
  createRateLimitMiddleware,
  globalRateLimit,
  loginRateLimit,
  heavyRateLimit,
} from '@/middleware/security/rate-limit'
import { rateLimiter } from '@/core/security/rate-limiter'

describe('Rate Limit Middleware — Behavior', () => {
  it('allows requests under the limit', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })

  it('sets X-RateLimit-Limit header', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    const limit = res.headers.get('X-RateLimit-Limit')
    expect(limit).toBeTruthy()
    expect(parseInt(limit!, 10)).toBeGreaterThan(0)
  })

  it('sets X-RateLimit-Remaining header', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    const remaining = res.headers.get('X-RateLimit-Remaining')
    expect(remaining).toBeTruthy()
  })

  it('sets X-RateLimit-Reset header', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    const reset = res.headers.get('X-RateLimit-Reset')
    expect(reset).toBeTruthy()
  })

  it('returns 429 when limit is exceeded', async () => {
    // Use a unique IP to avoid interference
    const testIp = `1.2.3.${Math.floor(Math.random() * 256)}`
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    // Exhaust the limit (5 attempts for login rule)
    let lastRes: Response | null = null
    for (let i = 0; i < 7; i++) {
      lastRes = await app.request('/test', {
        headers: { 'X-Forwarded-For': testIp },
      })
    }
    expect(lastRes!.status).toBe(429)
    const body = await lastRes!.json()
    expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED')
  })

  it('includes Retry-After header on 429', async () => {
    const testIp = `5.6.7.${Math.floor(Math.random() * 256)}`
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    let lastRes: Response | null = null
    for (let i = 0; i < 7; i++) {
      lastRes = await app.request('/test', {
        headers: { 'X-Forwarded-For': testIp },
      })
    }
    expect(lastRes!.headers.get('Retry-After')).toBeTruthy()
  })
})

describe('Rate Limit Middleware — Skip Function', () => {
  it('skips rate limiting when skip returns true', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
      skip: (c) => c.req.path === '/health',
    }))
    app.get('/health', (c) => c.json({ ok: true }))
    app.get('/test', (c) => c.json({ ok: true }))

    // /health should not have rate limit headers
    const healthRes = await app.request('/health')
    expect(healthRes.headers.get('X-RateLimit-Limit')).toBeNull()

    // /test should have rate limit headers
    const testRes = await app.request('/test')
    expect(testRes.headers.get('X-RateLimit-Limit')).toBeTruthy()
  })
})

describe('Rate Limit Middleware — Convenience Presets', () => {
  it('globalRateLimit is a function', () => {
    expect(typeof globalRateLimit).toBe('function')
  })

  it('loginRateLimit is a function', () => {
    expect(typeof loginRateLimit).toBe('function')
  })

  it('heavyRateLimit is a function', () => {
    expect(typeof heavyRateLimit).toBe('function')
  })

  it('globalRateLimit allows first request', async () => {
    const app = new Hono()
    app.use('*', globalRateLimit)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })
})

describe('Rate Limit Middleware — Identifier Extraction', () => {
  it('uses X-Forwarded-For IP', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { 'X-Forwarded-For': '9.9.9.9' },
    })
    expect(res.status).toBe(200)
  })

  it('uses X-Real-IP IP', async () => {
    const app = new Hono()
    app.use('*', createRateLimitMiddleware({
      rule: 'login',
      identifier: 'ip',
    }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { 'X-Real-IP': '8.8.8.8' },
    })
    expect(res.status).toBe(200)
  })
})
