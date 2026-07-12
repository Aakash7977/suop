/**
 * CSRF Protection Tests
 *
 * Tests for:
 *   - Cookie is set on every response
 *   - Safe methods (GET, HEAD, OPTIONS) skip validation
 *   - Mutating methods without token are rejected
 *   - Mutating methods with mismatched token are rejected
 *   - Mutating methods with matching token are allowed
 *   - JWT Bearer auth is exempt from CSRF
 *   - Health/internal endpoints are exempt
 */

import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { csrfMiddleware, generateCsrfToken } from '@/middleware/security/csrf'

describe('CSRF — Token Generation', () => {
  it('generates a non-empty token', () => {
    const token = generateCsrfToken()
    expect(token).toBeTruthy()
    expect(token.length).toBeGreaterThan(10)
  })

  it('generates unique tokens', () => {
    const t1 = generateCsrfToken()
    const t2 = generateCsrfToken()
    expect(t1).not.toBe(t2)
  })
})

describe('CSRF — Cookie Setting', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', csrfMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    app.post('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('sets _csrf cookie on GET response', async () => {
    const res = await buildApp().request('/test')
    const setCookie = res.headers.get('Set-Cookie')
    expect(setCookie).toContain('_csrf=')
    expect(setCookie).toContain('SameSite=Strict')
  })

  it('includes Path=/', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Set-Cookie')).toContain('Path=/')
  })

  it('includes Max-Age', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Set-Cookie')).toContain('Max-Age=3600')
  })
})

describe('CSRF — Safe Methods', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', csrfMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    app.options('/test', (c) => c.body(null, 204))
    return app
  }

  it('allows GET without CSRF token', async () => {
    const res = await buildApp().request('/test')
    expect(res.status).toBe(200)
  })

  it('allows OPTIONS without CSRF token', async () => {
    const res = await buildApp().request('/test', { method: 'OPTIONS' })
    expect(res.status).toBe(204)
  })
})

describe('CSRF — Mutating Methods', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', csrfMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))
    app.put('/test', (c) => c.json({ ok: true }))
    app.delete('/test', (c) => c.json({ ok: true }))
    app.patch('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('rejects POST without CSRF cookie and header', async () => {
    const res = await buildApp().request('/test', { method: 'POST' })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error.code).toBe('CSRF.TOKEN_MISSING')
  })

  it('rejects POST with cookie but no header', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { Cookie: '_csrf=some-token' },
    })
    expect(res.status).toBe(403)
  })

  it('rejects POST with mismatched token', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: {
        Cookie: '_csrf=cookie-token',
        'X-CSRF-Token': 'different-header-token',
      },
    })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error.code).toBe('CSRF.TOKEN_MISMATCH')
  })

  it('allows POST with matching token', async () => {
    const token = 'matching-token-123'
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: {
        Cookie: `_csrf=${token}`,
        'X-CSRF-Token': token,
      },
    })
    expect(res.status).toBe(200)
  })

  it('rejects PUT without CSRF token', async () => {
    const res = await buildApp().request('/test', { method: 'PUT' })
    expect(res.status).toBe(403)
  })

  it('rejects DELETE without CSRF token', async () => {
    const res = await buildApp().request('/test', { method: 'DELETE' })
    expect(res.status).toBe(403)
  })

  it('rejects PATCH without CSRF token', async () => {
    const res = await buildApp().request('/test', { method: 'PATCH' })
    expect(res.status).toBe(403)
  })
})

describe('CSRF — JWT Bearer Exemption', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', csrfMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('allows POST with Bearer token (no CSRF needed)', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { Authorization: 'Bearer some-jwt-token' },
    })
    expect(res.status).toBe(200)
  })

  it('does NOT allow POST with Basic auth (still needs CSRF)', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { Authorization: 'Basic abc123' },
    })
    expect(res.status).toBe(403)
  })
})

describe('CSRF — Exempt Paths', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', csrfMiddleware)
    app.post('/health', (c) => c.json({ ok: true }))
    app.post('/api/v1/_internal/health', (c) => c.json({ ok: true }))
    return app
  }

  it('exempts /health from CSRF', async () => {
    const res = await buildApp().request('/health', { method: 'POST' })
    expect(res.status).toBe(200)
  })

  it('exempts /api/v1/_internal/* from CSRF', async () => {
    const res = await buildApp().request('/api/v1/_internal/health', { method: 'POST' })
    expect(res.status).toBe(200)
  })
})
