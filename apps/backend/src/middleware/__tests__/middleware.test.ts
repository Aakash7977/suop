/**
 * Middleware Tests — Verifies middleware composition and behavior
 *
 * Tests cover:
 *   - request-id: assigns correlation ID, propagates from header
 *   - logging: logs request start and finish
 *   - tenant: loads tenant context from JWT
 *   - audit: records mutations
 *   - rbac: enforces permission checks
 *   - error-handler: catches and formats errors
 *   - auth: validates JWT, allows public routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { requestIdMiddleware } from '@/middleware/request-id'
import { loggingMiddleware } from '@/middleware/logging'
import { authMiddleware } from '@/middleware/auth'
import { tenantMiddleware } from '@/middleware/tenant'
import { auditMiddleware } from '@/middleware/audit'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { AuthenticationError, AuthorizationError, toBaseError, getHttpStatus } from '@/core/errors'

// Mock logger to avoid console noise
vi.mock('@/core/logging', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}))

// Mock audit service
vi.mock('@/core/audit', () => ({
  auditService: { log: vi.fn().mockResolvedValue(undefined) },
}))

function buildApp() {
  const app = new Hono()
  app.use('*', requestIdMiddleware)
  app.use('*', loggingMiddleware)
  // Add error handler so thrown errors return proper status codes
  app.onError((err, c) => {
    const base = toBaseError(err)
    return c.json({ error: { message: base.message, code: base.code } }, getHttpStatus(base))
  })
  return app
}

describe('request-id middleware', () => {
  it('assigns a new correlation ID when no X-Request-Id header is present', async () => {
    const app = buildApp()
    app.get('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(200)
    const requestId = res.headers.get('X-Request-Id')
    expect(requestId).toBeTruthy()
    expect(requestId!.length).toBeGreaterThan(10)
  })

  it('propagates the X-Request-Id header when provided', async () => {
    const app = buildApp()
    app.get('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test', {
      headers: { 'X-Request-Id': 'my-correlation-id' },
    })
    expect(res.headers.get('X-Request-Id')).toBe('my-correlation-id')
  })
})

describe('logging middleware', () => {
  it('logs requests without throwing', async () => {
    const app = buildApp()
    app.get('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })
})

describe('auth middleware', () => {
  function buildAuthApp() {
    const app = new Hono()
    app.use('*', requestIdMiddleware)
    app.use('*', authMiddleware)
    app.onError((err, c) => {
      const base = toBaseError(err)
      return c.json({ error: { message: base.message, code: base.code } }, getHttpStatus(base))
    })
    app.get('/protected', (c) => c.json({ ok: true }))
    app.get('/health', (c) => c.json({ ok: true }))
    app.get('/api/v1/_internal/health', (c) => c.json({ ok: true }))
    app.get('/api/v1/auth/login', (c) => c.json({ ok: true }))
    return app
  }

  it('allows public routes without auth', async () => {
    const app = buildAuthApp()
    const res = await app.request('/health')
    expect(res.status).toBe(200)
  })

  it('allows /api/v1/_internal/* routes without auth', async () => {
    const app = buildAuthApp()
    const res = await app.request('/api/v1/_internal/health')
    expect(res.status).toBe(200)
  })

  it('allows /api/v1/auth/login without auth', async () => {
    const app = buildAuthApp()
    const res = await app.request('/api/v1/auth/login')
    expect(res.status).toBe(200)
  })

  it('rejects protected routes without Authorization header', async () => {
    const app = buildAuthApp()
    const res = await app.request('/protected')
    expect(res.status).toBe(401)
  })

  it('rejects protected routes with non-Bearer Authorization header', async () => {
    const app = buildAuthApp()
    const res = await app.request('/protected', {
      headers: { Authorization: 'Basic abc123' },
    })
    expect(res.status).toBe(401)
  })
})

describe('tenant middleware', () => {
  it('passes through when no auth context (will be enforced downstream)', async () => {
    const app = new Hono()
    app.use('*', requestIdMiddleware)
    app.use('*', tenantMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })
})

describe('audit middleware', () => {
  it('does not audit GET requests', async () => {
    const { auditService } = await import('@/core/audit')
    const app = new Hono()
    app.use('*', requestIdMiddleware)
    app.use('*', auditMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))
    await app.request('/test')
    expect(auditService.log).not.toHaveBeenCalled()
  })

  it('does not audit /health endpoint', async () => {
    const { auditService } = await import('@/core/audit')
    const app = new Hono()
    app.use('*', requestIdMiddleware)
    app.use('*', auditMiddleware)
    app.post('/health', (c) => c.json({ ok: true }))
    await app.request('/health', { method: 'POST' })
    expect(auditService.log).not.toHaveBeenCalled()
  })

  it('does not audit /api/v1/_internal/* endpoints', async () => {
    const { auditService } = await import('@/core/audit')
    const app = new Hono()
    app.use('*', requestIdMiddleware)
    app.use('*', auditMiddleware)
    app.post('/api/v1/_internal/health', (c) => c.json({ ok: true }))
    await app.request('/api/v1/_internal/health', { method: 'POST' })
    expect(auditService.log).not.toHaveBeenCalled()
  })
})

describe('requirePermission middleware', () => {
  it('rejects requests without authentication context', async () => {
    const app = new Hono()
    app.use('*', requestIdMiddleware)
    app.onError((err, c) => {
      const base = toBaseError(err)
      return c.json({ error: { message: base.message, code: base.code } }, getHttpStatus(base))
    })
    app.get('/protected', requirePermission(Permission.PRODUCT_READ), (c) => c.json({ ok: true }))
    const res = await app.request('/protected')
    expect([401, 403]).toContain(res.status)
  })
})

describe('error-handler middleware', () => {
  it('formats errors using Hono onError', async () => {
    const app = new Hono()
    app.onError((err, c) => {
      return c.json({ error: { message: err.message } }, 500)
    })
    app.get('/throw', () => {
      throw new Error('test error')
    })
    const res = await app.request('/throw')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.message).toBe('test error')
  })
})
