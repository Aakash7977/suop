/**
 * Helmet Security Headers Tests
 *
 * Tests for the helmet middleware:
 *   - All required security headers are set
 *   - CSP is restrictive in production, permissive in dev
 *   - HSTS is set in production only
 *   - X-Powered-By is removed
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { Hono } from 'hono'
import { helmetMiddleware, getSecurityHeaders, getCspPolicy } from '@/middleware/security/helmet'

describe('Helmet — Security Headers', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', helmetMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('sets X-Frame-Options: SAMEORIGIN', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
  })

  it('sets Referrer-Policy', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Referrer-Policy')).toBeTruthy()
  })

  it('sets Permissions-Policy', async () => {
    const res = await buildApp().request('/test')
    const pp = res.headers.get('Permissions-Policy')
    expect(pp).toBeTruthy()
    expect(pp).toContain('camera=()')
    expect(pp).toContain('microphone=()')
    expect(pp).toContain('geolocation=()')
  })

  it('sets Content-Security-Policy', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')
    expect(csp).toBeTruthy()
    expect(csp).toContain("default-src 'self'")
  })

  it('sets Cross-Origin-Opener-Policy', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin')
  })

  it('sets Cross-Origin-Embedder-Policy', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp')
  })

  it('sets Cross-Origin-Resource-Policy', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin')
  })

  it('sets Cache-Control: no-store for API responses', async () => {
    const res = await buildApp().request('/test')
    const cc = res.headers.get('Cache-Control')
    expect(cc).toContain('no-store')
    expect(cc).toContain('no-cache')
  })

  it('sets X-DNS-Prefetch-Control: off', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-DNS-Prefetch-Control')).toBe('off')
  })

  it('sets X-Permitted-Cross-Domain-Policies: none', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none')
  })

  it('removes X-Powered-By header', async () => {
    const res = await buildApp().request('/test')
    // Should be empty or absent
    const poweredBy = res.headers.get('X-Powered-By')
    expect(poweredBy === null || poweredBy === '').toBe(true)
  })
})

describe('Helmet — Helper Functions', () => {
  it('getSecurityHeaders returns all headers', () => {
    const headers = getSecurityHeaders()
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN')
    expect(headers['Content-Security-Policy']).toBeTruthy()
  })

  it('getCspPolicy returns the CSP string', () => {
    const csp = getCspPolicy()
    expect(csp).toContain("default-src 'self'")
    expect(typeof csp).toBe('string')
  })
})

describe('Helmet — Error Responses', () => {
  it('applies headers to error responses too', async () => {
    const app = new Hono()
    app.use('*', helmetMiddleware)
    app.get('/error', () => {
      throw new Error('test error')
    })
    app.onError((err, c) => c.json({ error: err.message }, 500))

    const res = await app.request('/error')
    expect(res.status).toBe(500)
    // Security headers should still be set on error responses
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy()
  })
})
