/**
 * CORS Middleware Tests
 *
 * Tests for:
 *   - Same-origin requests (no CORS headers)
 *   - Allowed origin requests (CORS headers set)
 *   - Disallowed origin requests (no CORS headers)
 *   - Preflight (OPTIONS) handling
 *   - Wildcard and regex origin patterns
 *   - Credentials support
 *   - Dynamic configuration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { corsMiddleware, configureCors, getCorsConfig } from '@/middleware/security/cors'

// Configure a strict CORS policy for testing (override test defaults)
const TEST_CONFIG = {
  allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id', 'X-Tenant-Id', 'X-Idempotency-Key', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  allowCredentials: true,
  maxAgeSeconds: 3600,
}

beforeEach(() => {
  configureCors(TEST_CONFIG)
})

describe('CORS — Same-Origin Requests', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', corsMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('does not set CORS headers when Origin is missing', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('sets Vary: Origin even for same-origin', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Vary')).toContain('Origin')
  })
})

describe('CORS — Allowed Origins', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', corsMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('sets ACAO for allowed origin', async () => {
    const res = await buildApp().request('/test', {
      headers: { Origin: 'http://localhost:3000' },
    })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
  })

  it('sets AC-Allow-Methods', async () => {
    const res = await buildApp().request('/test', {
      headers: { Origin: 'http://localhost:3000' },
    })
    const methods = res.headers.get('Access-Control-Allow-Methods')
    expect(methods).toContain('GET')
    expect(methods).toContain('POST')
    expect(methods).toContain('DELETE')
  })

  it('sets AC-Allow-Headers', async () => {
    const res = await buildApp().request('/test', {
      headers: { Origin: 'http://localhost:3000' },
    })
    const headers = res.headers.get('Access-Control-Allow-Headers')
    expect(headers).toContain('Authorization')
    expect(headers).toContain('Content-Type')
  })

  it('sets AC-Allow-Credentials: true', async () => {
    const res = await buildApp().request('/test', {
      headers: { Origin: 'http://localhost:3000' },
    })
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
  })

  it('sets AC-Max-Age', async () => {
    const res = await buildApp().request('/test', {
      headers: { Origin: 'http://localhost:3000' },
    })
    expect(res.headers.get('Access-Control-Max-Age')).toBe('3600')
  })
})

describe('CORS — Preflight (OPTIONS)', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', corsMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('responds 204 to preflight from allowed origin', async () => {
    const res = await buildApp().request('/test', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000' },
    })
    expect(res.status).toBe(204)
  })

  it('responds 403 to preflight from disallowed origin', async () => {
    const res = await buildApp().request('/test', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.com' },
    })
    expect(res.status).toBe(403)
  })
})

describe('CORS — Configuration', () => {
  it('getCorsConfig returns the current config', () => {
    const config = getCorsConfig()
    expect(config).toHaveProperty('allowedOrigins')
    expect(config).toHaveProperty('allowedMethods')
    expect(config).toHaveProperty('allowCredentials')
  })

  it('configureCors updates the config', () => {
    const original = getCorsConfig()
    configureCors({ maxAgeSeconds: 7200 })
    const updated = getCorsConfig()
    expect(updated.maxAgeSeconds).toBe(7200)
    // Restore
    configureCors({ maxAgeSeconds: original.maxAgeSeconds })
  })
})

describe('CORS — Origin Validation Patterns', () => {
  it('supports wildcard patterns', async () => {
    configureCors({
      allowedOrigins: ['https://*.sudhamrit.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['*'],
      exposedHeaders: [],
      allowCredentials: false,
      maxAgeSeconds: 0,
    })

    const app = new Hono()
    app.use('*', corsMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Origin: 'https://app.sudhamrit.com' },
    })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.sudhamrit.com')

    // Restore default config
    configureCors({
      allowedOrigins: ['http://localhost:3000'],
      allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      exposedHeaders: ['X-Request-Id'],
      allowCredentials: true,
      maxAgeSeconds: 3600,
    })
  })
})
