/**
 * Helmet Security — Additional Header Tests
 *
 * Extended tests to verify each security header is set correctly.
 */

import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { helmetMiddleware, getSecurityHeaders } from '@/middleware/security/helmet'

describe('Helmet — Individual Headers', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', helmetMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('X-Content-Type-Options is exactly "nosniff"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('X-Frame-Options is exactly "SAMEORIGIN"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
  })

  it('X-DNS-Prefetch-Control is exactly "off"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-DNS-Prefetch-Control')).toBe('off')
  })

  it('Referrer-Policy is "strict-origin-when-cross-origin"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })

  it('X-Permitted-Cross-Domain-Policies is "none"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none')
  })

  it('Cross-Origin-Opener-Policy is "same-origin"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin')
  })

  it('Cross-Origin-Embedder-Policy is "require-corp"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp')
  })

  it('Cross-Origin-Resource-Policy is "same-origin"', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin')
  })
})

describe('Helmet — Permissions-Policy Details', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', helmetMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('disables camera', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('camera=()')
  })

  it('disables microphone', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('microphone=()')
  })

  it('disables geolocation', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('geolocation=()')
  })

  it('disables payment', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('payment=()')
  })

  it('disables USB', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('usb=()')
  })

  it('disables magnetometer', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('magnetometer=()')
  })

  it('disables gyroscope', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('gyroscope=()')
  })

  it('disables accelerometer', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('accelerometer=()')
  })

  it('allows fullscreen for self', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('fullscreen=(self)')
  })

  it('disables document-domain', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Permissions-Policy')).toContain('document-domain=()')
  })
})

describe('Helmet — CSP Directives', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', helmetMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('CSP includes default-src', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("default-src 'self'")
  })

  it('CSP includes script-src', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('script-src')
  })

  it('CSP includes style-src', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('style-src')
  })

  it('CSP includes img-src', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('img-src')
  })

  it('CSP includes object-src none', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("object-src 'none'")
  })

  it('CSP includes base-uri self', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("base-uri 'self'")
  })

  it('CSP includes form-action self', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("form-action 'self'")
  })

  it('CSP includes frame-ancestors self', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("frame-ancestors 'self'")
  })

  it('CSP includes upgrade-insecure-requests', async () => {
    const res = await buildApp().request('/test')
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('upgrade-insecure-requests')
  })
})

describe('Helmet — Cache-Control Directives', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', helmetMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    return app
  }

  it('Cache-Control includes no-store', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cache-Control')).toContain('no-store')
  })

  it('Cache-Control includes no-cache', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cache-Control')).toContain('no-cache')
  })

  it('Cache-Control includes must-revalidate', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cache-Control')).toContain('must-revalidate')
  })

  it('Cache-Control includes private', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Cache-Control')).toContain('private')
  })

  it('Pragma is no-cache', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Pragma')).toBe('no-cache')
  })

  it('Expires is 0', async () => {
    const res = await buildApp().request('/test')
    expect(res.headers.get('Expires')).toBe('0')
  })
})

describe('Helmet — getSecurityHeaders returns all', () => {
  it('contains X-Content-Type-Options', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('X-Content-Type-Options')
  })

  it('contains X-Frame-Options', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('X-Frame-Options')
  })

  it('contains Content-Security-Policy', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Content-Security-Policy')
  })

  it('contains Referrer-Policy', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Referrer-Policy')
  })

  it('contains Permissions-Policy', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Permissions-Policy')
  })

  it('contains Cache-Control', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Cache-Control')
  })

  it('contains Cross-Origin-Opener-Policy', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Cross-Origin-Opener-Policy')
  })

  it('contains Cross-Origin-Embedder-Policy', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Cross-Origin-Embedder-Policy')
  })

  it('contains Cross-Origin-Resource-Policy', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('Cross-Origin-Resource-Policy')
  })

  it('contains X-Permitted-Cross-Domain-Policies', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('X-Permitted-Cross-Domain-Policies')
  })

  it('contains X-DNS-Prefetch-Control', () => {
    const headers = getSecurityHeaders()
    expect(headers).toHaveProperty('X-DNS-Prefetch-Control')
  })
})
