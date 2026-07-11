/**
 * API Security — Additional Tests
 *
 * Extended tests for input sanitization edge cases and security guards.
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

describe('Input Sanitization — Edge Cases', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', inputSanitizationMiddleware)
    app.post('/test', async (c) => {
      const body = await c.req.json()
      return c.json({ received: body })
    })
    return app
  }

  it('handles empty object', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const body = await res.json()
    expect(body.received).toEqual({})
  })

  it('handles empty array', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    })
    const body = await res.json()
    expect(body.received).toEqual([])
  })

  it('handles numbers', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 42, price: 19.99 }),
    })
    const body = await res.json()
    expect(body.received.count).toBe(42)
    expect(body.received.price).toBe(19.99)
  })

  it('handles booleans', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true, deleted: false }),
    })
    const body = await res.json()
    expect(body.received.active).toBe(true)
    expect(body.received.deleted).toBe(false)
  })

  it('handles null values', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: null }),
    })
    const body = await res.json()
    expect(body.received.value).toBeNull()
  })

  it('handles deeply nested structures', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep\0value',
              },
            },
          },
        },
      }),
    })
    const body = await res.json()
    expect(body.received.level1.level2.level3.level4.value).toBe('deepvalue')
  })

  it('handles arrays of objects', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          { id: 1, name: 'a\0' },
          { id: 2, name: 'b\0' },
          { id: 3, name: 'c\0' },
        ],
      }),
    })
    const body = await res.json()
    expect(body.received.items[0].name).toBe('a')
    expect(body.received.items[1].name).toBe('b')
    expect(body.received.items[2].name).toBe('c')
  })

  it('normalizes unicode to NFC', async () => {
    // NFC normalization: é (single char) vs e + combining accent
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'café' }),
    })
    const body = await res.json()
    expect(body.received.text).toBe('café')
  })

  it('strips multiple null bytes', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'a\0b\0c\0d' }),
    })
    const body = await res.json()
    expect(body.received.text).toBe('abcd')
  })

  it('preserves spaces and tabs', async () => {
    const res = await buildApp().request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello world\ttabbed' }),
    })
    const body = await res.json()
    expect(body.received.text).toBe('hello world\ttabbed')
  })
})

describe('SQL Injection Guard — Additional Patterns', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', sqlInjectionGuard)
    app.get('/search', (c) => c.json({ ok: true }))
    return app
  }

  it('blocks DELETE FROM pattern', async () => {
    const res = await buildApp().request('/search?q=DELETE+FROM+users')
    expect(res.status).toBe(400)
  })

  it('blocks INSERT INTO pattern', async () => {
    const res = await buildApp().request('/search?q=INSERT+INTO+users')
    expect(res.status).toBe(400)
  })

  it('blocks WAITFOR DELAY pattern', async () => {
    const res = await buildApp().request('/search?q=WAITFOR+DELAY')
    expect(res.status).toBe(400)
  })

  it('blocks sp_executesql pattern', async () => {
    const res = await buildApp().request('/search?q=sp_executesql')
    expect(res.status).toBe(400)
  })

  it('allows safe search terms', async () => {
    const safeTerms = ['widgets', 'product name', 'SKU-123', 'A&B Corp', '50% off']
    for (const term of safeTerms) {
      const res = await buildApp().request(`/search?q=${encodeURIComponent(term)}`)
      expect(res.status).toBe(200)
    }
  })

  it('allows alphanumeric search', async () => {
    const res = await buildApp().request('/search?q=widget123')
    expect(res.status).toBe(200)
  })
})

describe('XSS Guard — Additional Patterns', () => {
  function buildApp() {
    const app = new Hono()
    app.use('*', xssGuard)
    app.get('/search', (c) => c.json({ ok: true }))
    return app
  }

  it('blocks <object> tags', async () => {
    const res = await buildApp().request('/search?q=<object+data=evil>')
    expect(res.status).toBe(400)
  })

  it('blocks <embed> tags', async () => {
    const res = await buildApp().request('/search?q=<embed+src=evil>')
    expect(res.status).toBe(400)
  })

  it('blocks eval() calls', async () => {
    const res = await buildApp().request('/search?q=eval(alert(1))')
    expect(res.status).toBe(400)
  })

  it('blocks Function() calls', async () => {
    const res = await buildApp().request('/search?q=Function(alert(1))')
    expect(res.status).toBe(400)
  })

  it('blocks document.write', async () => {
    const res = await buildApp().request('/search?q=document.write')
    expect(res.status).toBe(400)
  })

  it('blocks window.location', async () => {
    const res = await buildApp().request('/search?q=window.location')
    expect(res.status).toBe(400)
  })

  it('allows safe HTML-like text', async () => {
    const res = await buildApp().request('/search?q=3+>+2+and+1+<+5')
    // Mathematical comparison should be allowed (no XSS pattern)
    expect(res.status).toBe(200)
  })

  it('allows text with "script" word but no tag', async () => {
    const res = await buildApp().request('/search?q=typescript+tutorial')
    expect(res.status).toBe(200)
  })
})

describe('Payload Size Limit — Edge Cases', () => {
  it('allows exactly at the limit', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Length': '1000' },
    })
    expect(res.status).toBe(200)
  })

  it('rejects one byte over the limit', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Length': '1001' },
    })
    expect(res.status).toBe(413)
  })

  it('allows 0-byte body', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Length': '0' },
    })
    expect(res.status).toBe(200)
  })

  it('handles invalid Content-Length', async () => {
    const app = new Hono()
    app.use('*', payloadSizeLimit(1000))
    app.post('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Length': 'invalid' },
    })
    // Should not throw — just pass through
    expect(res.status).toBe(200)
  })
})
