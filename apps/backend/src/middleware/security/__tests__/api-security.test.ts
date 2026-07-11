/**
 * API Security Middleware Tests
 *
 * Tests for payload size limits, request timeout, input sanitization,
 * SQL injection guard, and XSS guard.
 */

import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import {
  payloadSizeLimit,
  requestTimeout,
  inputSanitizationMiddleware,
  sqlInjectionGuard,
  xssGuard,
} from '@/middleware/security/api-security'

describe('Payload Size Limit', () => {
  it('allows requests under the limit', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Length': '100' },
    })
    expect(res.status).toBe(200)
  })

  it('rejects requests over the limit with 413', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Length': '2000' },
    })
    expect(res.status).toBe(413)
    const body = await res.json()
    expect(body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('allows requests without Content-Length', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', { method: 'POST' })
    expect(res.status).toBe(200)
  })

  it('uses larger limit for upload paths', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/uploads', (c) => c.json({ ok: true }))
    // 5MB should be allowed for uploads (50MB limit)
    const res = await app.request('/uploads', {
      method: 'POST',
      headers: { 'Content-Length': String(5 * 1024 * 1024) },
    })
    expect(res.status).toBe(200)
  })
})

describe('Request Timeout', () => {
  it('allows fast requests', async () => {
    const app = new Hono()
    app.use('*', requestTimeout(5000))
    app.get('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })

  it('returns 408 on timeout', async () => {
    const app = new Hono()
    app.use('*', requestTimeout(100))
    app.get('/slow', async (c) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return c.json({ ok: true })
    })
    const res = await app.request('/slow')
    expect(res.status).toBe(408)
    const body = await res.json()
    expect(body.error.code).toBe('REQUEST_TIMEOUT')
  })
})

describe('Input Sanitization', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', inputSanitizationMiddleware)
    app.post('/test', async (c) => {
      const body = await c.req.json()
      return c.json({ received: body })
    })
    return app
  }

  it('passes through normal input', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    })
    const body = await res.json()
    expect(body.received.name).toBe('Alice')
    expect(body.received.age).toBe(30)
  })

  it('strips null bytes from strings', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'admin\0root' }),
    })
    const body = await res.json()
    expect(body.received.name).toBe('adminroot')
  })

  it('strips control characters', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello\x01\x02world' }),
    })
    const body = await res.json()
    expect(body.received.text).toBe('helloworld')
  })

  it('preserves tab, newline, carriage return', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'line1\nline2\tcol2' }),
    })
    const body = await res.json()
    expect(body.received.text).toBe('line1\nline2\tcol2')
  })

  it('sanitizes nested objects', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { name: 'bob\0' } }),
    })
    const body = await res.json()
    expect(body.received.user.name).toBe('bob')
  })

  it('sanitizes arrays', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['a\0', 'b\0'] }),
    })
    const body = await res.json()
    expect(body.received.items).toEqual(['a', 'b'])
  })
})

describe('SQL Injection Guard', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', sqlInjectionGuard)
    app.get('/search', (c) => c.json({ ok: true }))
    return app
  }

  it('allows normal search queries', async () => {
    const res = await buildApp().request('/search?q=widgets')
    expect(res.status).toBe(200)
  })

  it('blocks UNION SELECT pattern', async () => {
    const res = await buildApp().request('/search?q=1+UNION+SELECT+password+FROM+users')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('INPUT_VALIDATION_FAILED')
  })

  it('blocks DROP TABLE pattern', async () => {
    const res = await buildApp().request('/search?q=DROP+TABLE+users')
    expect(res.status).toBe(400)
  })

  it('blocks INFORMATION_SCHEMA pattern', async () => {
    const res = await buildApp().request('/search?q=SELECT+*+FROM+INFORMATION_SCHEMA.TABLES')
    expect(res.status).toBe(400)
  })

  it('blocks xp_cmdshell pattern', async () => {
    const res = await buildApp().request('/search?q=xp_cmdshell')
    expect(res.status).toBe(400)
  })
})

describe('XSS Guard', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', xssGuard)
    app.get('/search', (c) => c.json({ ok: true }))
    return app
  }

  it('allows normal search queries', async () => {
    const res = await buildApp().request('/search?q=hello')
    expect(res.status).toBe(200)
  })

  it('blocks <script> tags', async () => {
    const res = await buildApp().request('/search?q=<script>alert(1)</script>')
    expect(res.status).toBe(400)
  })

  it('blocks javascript: URIs', async () => {
    const res = await buildApp().request('/search?q=javascript:alert(1)')
    expect(res.status).toBe(400)
  })

  it('blocks on* event handlers', async () => {
    const res = await buildApp().request('/search?q=onclick=alert(1)')
    expect(res.status).toBe(400)
  })

  it('blocks <iframe> tags', async () => {
    const res = await buildApp().request('/search?q=<iframe+src=evil>')
    expect(res.status).toBe(400)
  })

  it('blocks document.cookie access', async () => {
    const res = await buildApp().request('/search?q=document.cookie')
    expect(res.status).toBe(400)
  })
})
