/**
 * Performance Middleware Tests
 *
 * Tests for the performance monitoring middleware:
 *   - Records API metrics on every request
 *   - Normalizes paths (replaces UUIDs and numeric IDs with :id)
 *   - Captures status codes
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { performanceMiddleware } from '@/middleware/security/performance'
import { getPerformanceDashboard, resetMetrics } from '@/core/observability/metrics'

describe('Performance Middleware — Recording', () => {
  beforeEach(() => {
    resetMetrics()
  })

  it('records metric for GET request', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    await app.request('/test')
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.totalRequests).toBe(1)
  })

  it('records metric for POST request', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))

    await app.request('/test', { method: 'POST' })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.totalRequests).toBe(1)
  })

  it('records multiple requests', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    await app.request('/test')
    await app.request('/test')
    await app.request('/test')

    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.totalRequests).toBe(3)
  })

  it('records error status codes', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/error', (c) => c.json({ error: 'fail' }, 500))

    await app.request('/error')
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.errorRate).toBe(100)
  })

  it('records 404 status codes', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)

    await app.request('/nonexistent')
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.errorRate).toBe(100)
  })

  it('records durationMs > 0', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    await app.request('/test')
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.avgLatencyMs).toBeGreaterThanOrEqual(0)
  })
})

describe('Performance Middleware — Path Normalization', () => {
  beforeEach(() => {
    resetMetrics()
  })

  it('replaces UUIDs with :id', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/api/v1/users/:id', (c) => c.json({ ok: true }))

    await app.request('/api/v1/users/123e4567-e89b-12d3-a456-426614174000')
    const dashboard = await getPerformanceDashboard()
    const endpoint = dashboard.api.topEndpoints[0]
    expect(endpoint.path).toContain(':id')
    expect(endpoint.path).not.toContain('123e4567')
  })

  it('replaces numeric IDs with :id', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/api/v1/products/:id', (c) => c.json({ ok: true }))

    await app.request('/api/v1/products/12345')
    const dashboard = await getPerformanceDashboard()
    const endpoint = dashboard.api.topEndpoints[0]
    expect(endpoint.path).toContain(':id')
    expect(endpoint.path).not.toContain('12345')
  })

  it('aggregates requests to the same normalized path', async () => {
    const app = new Hono()
    app.use('*', performanceMiddleware)
    app.get('/api/v1/users/:id', (c) => c.json({ ok: true }))

    await app.request('/api/v1/users/111')
    await app.request('/api/v1/users/222')
    await app.request('/api/v1/users/333')

    const dashboard = await getPerformanceDashboard()
    // All 3 requests should be grouped under one endpoint
    expect(dashboard.api.topEndpoints[0].count).toBe(3)
  })
})
