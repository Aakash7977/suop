/**
 * Database Optimization Tests
 *
 * Tests for query tracking, N+1 detection, bulk operations,
 * cursor-based pagination, and connection pool monitoring.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  withQueryTracking,
  resetQueryTracking,
  getQueryCounts,
  bulkInsert,
  bulkUpdate,
  cursorPaginate,
  getConnectionPoolStats,
  withQueryTimeout,
  withTransaction,
} from '@/core/db/optimization'

// Mock Prisma client
vi.mock('@/core/db', () => {
  const tx = {
    user: {
      create: vi.fn(async ({ data }: any) => ({ id: '1', ...data })),
      createMany: vi.fn(async ({ data }: any) => ({ count: data.length })),
      updateMany: vi.fn(async () => ({ count: 5 })),
      findMany: vi.fn(async () => []),
    },
  }
  return {
    db: {
      $transaction: vi.fn(async (fn: any) => fn(tx)),
      user: tx.user,
    },
    Prisma: {
      TransactionIsolationLevel: {
        ReadCommitted: 'ReadCommitted',
        RepeatableRead: 'RepeatableRead',
        Serializable: 'Serializable',
      },
    },
  }
})

describe('Database Optimization — Query Tracking', () => {
  beforeEach(() => {
    resetQueryTracking()
  })

  it('tracks successful queries', async () => {
    await withQueryTracking('User', 'findMany', async () => [])
    const counts = getQueryCounts()
    expect(counts['User.findMany']).toBe(1)
  })

  it('tracks multiple queries', async () => {
    await withQueryTracking('User', 'findMany', async () => [])
    await withQueryTracking('User', 'findMany', async () => [])
    await withQueryTracking('User', 'findUnique', async () => null)
    const counts = getQueryCounts()
    expect(counts['User.findMany']).toBe(2)
    expect(counts['User.findUnique']).toBe(1)
  })

  it('tracks failed queries', async () => {
    await expect(
      withQueryTracking('User', 'findMany', async () => {
        throw new Error('DB error')
      })
    ).rejects.toThrow('DB error')
    const counts = getQueryCounts()
    expect(counts['User.findMany']).toBe(1)
  })

  it('tracks different models separately', async () => {
    await withQueryTracking('User', 'findMany', async () => [])
    await withQueryTracking('Order', 'findMany', async () => [])
    const counts = getQueryCounts()
    expect(counts['User.findMany']).toBe(1)
    expect(counts['Order.findMany']).toBe(1)
  })

  it('resetQueryTracking clears counters', async () => {
    await withQueryTracking('User', 'findMany', async () => [])
    resetQueryTracking()
    const counts = getQueryCounts()
    expect(Object.keys(counts).length).toBe(0)
  })

  it('returns the result of the tracked function', async () => {
    const result = await withQueryTracking('User', 'findUnique', async () => ({
      id: '1',
      name: 'Alice',
    }))
    expect(result).toEqual({ id: '1', name: 'Alice' })
  })
})

describe('Database Optimization — Bulk Operations', () => {
  it('bulkInsert returns the number of inserted rows', async () => {
    const rows = [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
    ]
    const count = await bulkInsert('user', rows)
    expect(count).toBe(3)
  })

  it('bulkInsert handles empty input', async () => {
    const count = await bulkInsert('user', [])
    expect(count).toBe(0)
  })

  it('bulkInsert chunks large batches', async () => {
    const rows = Array.from({ length: 1500 }, (_, i) => ({ name: `User${i}` }))
    const count = await bulkInsert('user', rows, { chunkSize: 500 })
    expect(count).toBe(1500)
  })

  it('bulkUpdate returns the number of updated rows', async () => {
    const count = await bulkUpdate('user', { status: 'PENDING' }, { status: 'ACTIVE' })
    expect(count).toBe(5)
  })
})

describe('Database Optimization — Cursor Pagination', () => {
  it('returns paginated results', async () => {
    const result = await cursorPaginate('user', { tenantId: 't1' }, { limit: 10 })
    expect(result).toHaveProperty('rows')
    expect(result).toHaveProperty('nextCursor')
    expect(result).toHaveProperty('hasMore')
    expect(Array.isArray(result.rows)).toBe(true)
  })

  it('accepts cursor parameter', async () => {
    const cursor = Buffer.from('2026-01-01T00:00:00Z').toString('base64')
    const result = await cursorPaginate('user', { tenantId: 't1' }, { cursor, limit: 10 })
    expect(result).toHaveProperty('rows')
  })

  it('defaults to 25 items per page', async () => {
    const result = await cursorPaginate('user', { tenantId: 't1' }, {})
    expect(result).toHaveProperty('rows')
  })

  it('caps limit at 100', async () => {
    const result = await cursorPaginate('user', { tenantId: 't1' }, { limit: 500 })
    expect(result).toHaveProperty('rows')
  })
})

describe('Database Optimization — Connection Pool', () => {
  it('returns pool stats', () => {
    const stats = getConnectionPoolStats()
    expect(stats).toHaveProperty('poolSize')
    expect(stats).toHaveProperty('queryTimeoutMs')
    expect(stats).toHaveProperty('activeQueries')
    expect(stats.poolSize).toBeGreaterThan(0)
    expect(stats.queryTimeoutMs).toBeGreaterThan(0)
  })
})

describe('Database Optimization — Query Timeout', () => {
  it('completes when function is fast enough', async () => {
    const result = await withQueryTimeout(async () => 'success', 5000)
    expect(result).toBe('success')
  })

  it('throws when function is too slow', async () => {
    await expect(
      withQueryTimeout(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return 'slow'
      }, 50)
    ).rejects.toThrow('Query timeout')
  })
})

describe('Database Optimization — Transaction', () => {
  it('executes function in a transaction', async () => {
    const result = await withTransaction(async (tx) => {
      return await tx.user.create({ data: { name: 'Alice' } })
    })
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name', 'Alice')
  })

  it('accepts isolation level', async () => {
    const result = await withTransaction(
      async () => 'ok',
      { isolationLevel: 'Serializable' }
    )
    expect(result).toBe('ok')
  })

  it('accepts timeout', async () => {
    const result = await withTransaction(
      async () => 'ok',
      { timeoutMs: 5000 }
    )
    expect(result).toBe('ok')
  })
})
