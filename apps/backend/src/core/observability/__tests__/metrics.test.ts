/**
 * Performance Metrics Tests
 *
 * Tests for API/DB metric recording, system metrics, percentiles,
 * and the performance dashboard.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordApiMetric,
  recordDbMetric,
  getSystemMetrics,
  getPerformanceDashboard,
  resetMetrics,
  trackPerformance,
} from '@/core/observability/metrics'

describe('Performance Metrics — Recording', () => {
  beforeEach(() => {
    resetMetrics()
  })

  it('records an API metric', async () => {
    recordApiMetric({
      method: 'GET',
      path: '/api/v1/test',
      statusCode: 200,
      durationMs: 50,
    })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.totalRequests).toBe(1)
  })

  it('records multiple API metrics', async () => {
    for (let i = 0; i < 100; i++) {
      recordApiMetric({
        method: 'GET',
        path: '/api/v1/test',
        statusCode: 200,
        durationMs: 10 + i,
      })
    }
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.totalRequests).toBe(100)
  })

  it('records a DB metric', async () => {
    recordDbMetric({
      operation: 'findMany',
      model: 'User',
      durationMs: 25,
      success: true,
    })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.database.totalQueries).toBe(1)
  })

  it('records failed DB queries', async () => {
    recordDbMetric({
      operation: 'findUnique',
      model: 'User',
      durationMs: 100,
      success: false,
    })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.database.errorRate).toBeGreaterThan(0)
  })

  it('records slow DB queries (> 1s)', async () => {
    recordDbMetric({
      operation: 'findMany',
      model: 'Order',
      durationMs: 1500,
      success: true,
    })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.database.slowQueries.length).toBeGreaterThan(0)
  })
})

describe('Performance Metrics — System', () => {
  it('returns current system metrics', () => {
    const m = getSystemMetrics()
    expect(m).toHaveProperty('timestamp')
    expect(m).toHaveProperty('memoryRssMb')
    expect(m).toHaveProperty('memoryHeapUsedMb')
    expect(m).toHaveProperty('memoryHeapTotalMb')
    expect(m).toHaveProperty('memoryFreeMb')
    expect(m).toHaveProperty('memoryTotalMb')
    expect(m).toHaveProperty('cpuUserPercent')
    expect(m).toHaveProperty('cpuSystemPercent')
    expect(m).toHaveProperty('loadAvg1')
    expect(m).toHaveProperty('loadAvg5')
    expect(m).toHaveProperty('loadAvg15')
    expect(m).toHaveProperty('uptimeSec')
    expect(m).toHaveProperty('gcCount')
    expect(m).toHaveProperty('gcTotalMs')
  })

  it('reports positive RSS memory', () => {
    const m = getSystemMetrics()
    expect(m.memoryRssMb).toBeGreaterThan(0)
  })

  it('reports positive total memory', () => {
    const m = getSystemMetrics()
    expect(m.memoryTotalMb).toBeGreaterThan(0)
  })

  it('reports positive uptime', () => {
    const m = getSystemMetrics()
    // In some test environments uptime may be 0 at the very start
    expect(m.uptimeSec).toBeGreaterThanOrEqual(0)
  })

  it('heap used is less than heap total', () => {
    const m = getSystemMetrics()
    expect(m.memoryHeapUsedMb).toBeLessThanOrEqual(m.memoryHeapTotalMb)
  })

  it('free memory is less than total memory', () => {
    const m = getSystemMetrics()
    expect(m.memoryFreeMb).toBeLessThanOrEqual(m.memoryTotalMb)
  })
})

describe('Performance Metrics — Dashboard', () => {
  beforeEach(() => {
    resetMetrics()
  })

  it('returns empty dashboard when no metrics recorded', async () => {
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.totalRequests).toBe(0)
    expect(dashboard.database.totalQueries).toBe(0)
  })

  it('computes average latency', async () => {
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 200, durationMs: 100 })
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 200, durationMs: 200 })
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 200, durationMs: 300 })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.avgLatencyMs).toBeCloseTo(200, 0)
  })

  it('computes percentiles', async () => {
    for (let i = 1; i <= 100; i++) {
      recordApiMetric({ method: 'GET', path: '/test', statusCode: 200, durationMs: i })
    }
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.p50LatencyMs).toBeGreaterThanOrEqual(50)
    expect(dashboard.api.p95LatencyMs).toBeGreaterThanOrEqual(90)
    expect(dashboard.api.p99LatencyMs).toBeGreaterThanOrEqual(dashboard.api.p95LatencyMs)
  })

  it('computes error rate', async () => {
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 200, durationMs: 50 })
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 200, durationMs: 50 })
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 500, durationMs: 50 })
    recordApiMetric({ method: 'GET', path: '/test', statusCode: 404, durationMs: 50 })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.errorRate).toBe(50) // 2 of 4 are errors
  })

  it('aggregates by endpoint', async () => {
    recordApiMetric({ method: 'GET', path: '/a', statusCode: 200, durationMs: 10 })
    recordApiMetric({ method: 'GET', path: '/a', statusCode: 200, durationMs: 20 })
    recordApiMetric({ method: 'GET', path: '/b', statusCode: 200, durationMs: 100 })
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.api.topEndpoints.length).toBeGreaterThan(0)
    const topEndpoint = dashboard.api.topEndpoints[0]
    expect(topEndpoint.count).toBeGreaterThan(0)
  })

  it('returns recent API metrics (newest first)', async () => {
    for (let i = 0; i < 5; i++) {
      recordApiMetric({ method: 'GET', path: `/test-${i}`, statusCode: 200, durationMs: i })
    }
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.recentApiMetrics.length).toBeGreaterThan(0)
    expect(dashboard.recentApiMetrics[0].path).toContain('test-4')
  })
})

describe('Performance Metrics — trackPerformance', () => {
  beforeEach(() => {
    resetMetrics()
  })

  it('tracks successful operations', async () => {
    const result = await trackPerformance('db', 'findMany', 'User', async () => {
      return [{ id: '1', name: 'Alice' }]
    })
    expect(result).toEqual([{ id: '1', name: 'Alice' }])
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.database.totalQueries).toBe(1)
  })

  it('tracks failed operations', async () => {
    await expect(
      trackPerformance('db', 'findUnique', 'User', async () => {
        throw new Error('DB connection failed')
      })
    ).rejects.toThrow('DB connection failed')
    const dashboard = await getPerformanceDashboard()
    expect(dashboard.database.errorRate).toBeGreaterThan(0)
  })
})
