/**
 * System Routes — Health/Ready/Live/Version Endpoint Tests
 *
 * Verifies the RC1 Fix Pack 1 health endpoints:
 *   - GET /health returns 200 with check details
 *   - GET /live returns 200 (always alive)
 *   - GET /ready returns 200 or 503 based on dependency state
 *   - GET /version returns build metadata
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

// Mock the database module BEFORE importing system routes
const { mockDb } = vi.hoisted(() => {
  return {
    mockDb: {
      $queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]),
      backgroundJob: {
        count: vi.fn().mockResolvedValue(0),
      },
    },
  }
})

vi.mock('@/core/db', () => ({
  db: mockDb,
}))

vi.mock('@/core/db/pglite', () => ({
  isDatabaseHealthy: vi.fn().mockResolvedValue(true),
}))
const { mockPgliteHealthy } = vi.hoisted(() => ({
  mockPgliteHealthy: { current: true },
}))
// Re-mock with a function that uses the mutable flag
vi.mock('@/core/db/pglite', () => ({
  isDatabaseHealthy: vi.fn(() => Promise.resolve(mockPgliteHealthy.current)),
}))

// Mock statfs to avoid filesystem dependency in tests
vi.mock('node:fs/promises', () => ({
  statfs: vi.fn().mockResolvedValue({
    bavail: 1000000,
    bsize: 4096,
  }),
}))

import { systemRoutes } from '@/routes/system'

// Helper to invoke a route and return { status, body }
async function callRoute(method: string, path: string) {
  const req = new Request(`http://localhost${path}`, { method })
  const res = await systemRoutes.fetch(req)
  const body = await res.json()
  return { status: res.status, body }
}

describe('System Routes — Health Endpoints', () => {

  describe('GET /_internal/live', () => {
    it('returns 200 with alive status', async () => {
      const { status, body } = await callRoute('GET', '/_internal/live')
      expect(status).toBe(200)
      expect(body.data.status).toBe('alive')
      expect(body.data.uptime).toBeGreaterThan(0)
      expect(body.data.pid).toBe(process.pid)
    })
  })

  describe('GET /_internal/version', () => {
    it('returns build metadata', async () => {
      const { status, body } = await callRoute('GET', '/_internal/version')
      expect(status).toBe(200)
      expect(body.data.name).toBe('suop-backend')
      expect(body.data.version).toBeDefined()
      expect(body.data.runtime).toBeDefined()
      expect(body.data.environment).toBeDefined()
    })
  })

  describe('GET /_internal/health', () => {
    it('returns 200 when all checks pass', async () => {
      const { status, body } = await callRoute('GET', '/_internal/health')
      expect(status).toBe(200)
      expect(body.data.status).toBe('ok')
      expect(body.data.checks).toBeDefined()
      expect(body.data.checks.database).toBeDefined()
      expect(body.data.checks.database.status).toBe('ok')
      expect(body.data.checks.redis).toBeDefined()
      expect(body.data.checks.queue).toBeDefined()
      expect(body.data.checks.disk).toBeDefined()
      expect(body.data.checks.memory).toBeDefined()
    })

    it('includes latency for database check', async () => {
      const { body } = await callRoute('GET', '/_internal/health')
      expect(body.data.checks.database.latencyMs).toBeGreaterThanOrEqual(0)
    })

    it('includes memory metrics', async () => {
      const { body } = await callRoute('GET', '/_internal/health')
      expect(body.data.checks.memory.details.freeMB).toBeGreaterThan(0)
      expect(body.data.checks.memory.details.totalMB).toBeGreaterThan(0)
      expect(body.data.checks.memory.details.processHeapMB).toBeGreaterThan(0)
    })

    it('includes disk metrics', async () => {
      const { body } = await callRoute('GET', '/_internal/health')
      expect(body.data.checks.disk.details.freeGB).toBeGreaterThan(0)
    })

    it('returns 503 when database is down', async () => {
      mockDb.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'))
      mockPgliteHealthy.current = false
      const { status, body } = await callRoute('GET', '/_internal/health')
      expect(status).toBe(503)
      expect(body.data.status).not.toBe('ok')
      mockDb.$queryRaw.mockResolvedValue([{ ok: 1 }]) // reset
      mockPgliteHealthy.current = true
    })
  })

  describe('GET /_internal/ready', () => {
    it('returns 200 when service is ready', async () => {
      const { status, body } = await callRoute('GET', '/_internal/ready')
      expect(status).toBe(200)
      expect(body.data.status).toBe('ready')
    })

    it('returns 503 when database is down', async () => {
      mockDb.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'))
      mockPgliteHealthy.current = false
      const { status, body } = await callRoute('GET', '/_internal/ready')
      expect(status).toBe(503)
      expect(body.data.status).toBe('not_ready')
      mockDb.$queryRaw.mockResolvedValue([{ ok: 1 }]) // reset
      mockPgliteHealthy.current = true
    })

    it('returns 200 with degraded status when queue has stuck jobs', async () => {
      mockDb.backgroundJob.count.mockResolvedValueOnce(5)
      const { status, body } = await callRoute('GET', '/_internal/ready')
      // 'degraded' is still 'ready'
      expect(status).toBe(200)
      expect(body.data.checks.queue.status).toBe('degraded')
    })
  })
})
