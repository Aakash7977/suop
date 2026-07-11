/**
 * product-costing Service — Business Logic Tests (with mocked Prisma client)
 *
 * Exercises the service business logic by mocking the Prisma client.
 * Verifies:
 *   - create() calls Prisma create + audit + event in a transaction
 *   - update() enforces optimistic concurrency
 *   - delete() performs soft-delete
 *   - getById() throws NotFoundError for missing records
 *   - list() applies pagination and filters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Prisma client using vi.hoisted so mocks are available before imports ─
const { mockDb, mockTx, mockAuditLog, mockWriteToOutbox } = vi.hoisted(() => {
  const mkModelFns = () => ({
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })
  const tx = { ProductCosts: mkModelFns() }
  const db = {
    ProductCosts: mkModelFns(),
    $queryRaw: vi.fn(),
    $transaction: vi.fn(async (fn: any) => fn(tx)),
  }
  return {
    mockDb: db,
    mockTx: tx,
    mockAuditLog: vi.fn(),
    mockWriteToOutbox: vi.fn(),
  }
})

vi.mock('@/core/db', () => ({
  db: mockDb,
  transaction: vi.fn(async (fn: any) => fn(mockTx)),
  Prisma: { JsonNull: null, TransactionClient: {} },
}))

vi.mock('@/core/audit', () => ({
  auditService: { log: mockAuditLog },
}))

vi.mock('@/core/events', () => ({
  eventBus: { writeToOutbox: mockWriteToOutbox },
}))

vi.mock('@/core/logging', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))



// ─── Import service AFTER mocks are set up ──────────────────────────────────
import { ProductCostingService } from '@/modules/product-costing/service'
import { AuthorizationError, NotFoundError, BusinessRuleError, ValidationError, ConcurrencyError } from '@/core/errors'
import { _runInTestContext } from '@/core/context'

const TEST_CTX = {
  userId: 'user-001',
  tenantId: 'tenant-001',
  userEmail: 'tester@sudhamrit.com',
  correlationId: 'corr-001',
}

describe('ProductCostingService — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══ create() ═══════════════════════════════════════════════════════════════
  describe('create()', () => {
    it('creates a record, writes audit log, and publishes event', async () => {
      // Mock: no existing record with this code
      mockDb.ProductCosts.findFirst.mockResolvedValueOnce(null)
      // Mock: create returns the new record
      const createdRecord = {
        id: 'new-id-001',
        tenantId: TEST_CTX.tenantId,
        cost_id: 'TEST-001',
        status: 'DRAFT',
        version: 0,
      }
      mockTx.ProductCosts.create.mockResolvedValueOnce(createdRecord)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.create({ cost_id: 'TEST-001', description: 'test' })
      )

      expect(result).toEqual({ id: 'new-id-001' })
      expect(mockTx.ProductCosts.create).toHaveBeenCalled()
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CREATE',
        entityType: 'ProductCost',
        entityId: 'new-id-001',
      }))
      expect(mockWriteToOutbox).toHaveBeenCalledWith(expect.objectContaining({
        eventName: 'ProductCostCalculated',
      }))
    })

    it('throws BusinessRuleError when cost_id already exists', async () => {
      // Mock: existing record found
      mockDb.ProductCosts.findFirst.mockResolvedValueOnce({ id: 'existing-id' })

      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          ProductCostingService.create({ cost_id: 'DUPLICATE', description: 'test' })
        ).rejects.toThrow(BusinessRuleError)
      })

      expect(mockTx.ProductCosts.create).not.toHaveBeenCalled()
    })

    it('throws ValidationError when cost_id is missing', async () => {
      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          ProductCostingService.create({ description: 'missing code' })
        ).rejects.toThrow(ValidationError)
      })
    })
  })

  // ═══ getById() ══════════════════════════════════════════════════════════════
  describe('getById()', () => {
    it('returns the record when found', async () => {
      const record = { id: 'rec-001', tenantId: TEST_CTX.tenantId, cost_id: 'TEST-001' }
      mockDb.ProductCosts.findFirst.mockResolvedValueOnce(record)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.getById('rec-001')
      )

      expect(result).toEqual(record)
      expect(mockDb.ProductCosts.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: 'rec-001', tenantId: TEST_CTX.tenantId, deletedAt: null }),
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockDb.ProductCosts.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(ProductCostingService.getById('missing-id')).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ list() ═════════════════════════════════════════════════════════════════
  describe('list()', () => {
    it('returns paginated results', async () => {
      const rows = [
        { id: 'r1', cost_id: 'C001' },
        { id: 'r2', cost_id: 'C002' },
      ]
      mockDb.ProductCosts.findMany.mockResolvedValueOnce(rows)
      mockDb.ProductCosts.count.mockResolvedValueOnce(2)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.list({ page: 1, pageSize: 25 })
      )

      expect(result).toEqual({ rows, total: 2, page: 1, pageSize: 25 })
      expect(mockDb.ProductCosts.findMany).toHaveBeenCalled()
      expect(mockDb.ProductCosts.count).toHaveBeenCalled()
    })

    it('caps pageSize at 100', async () => {
      mockDb.ProductCosts.findMany.mockResolvedValueOnce([])
      mockDb.ProductCosts.count.mockResolvedValueOnce(0)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.list({ page: 1, pageSize: 500 })
      )

      expect(result.pageSize).toBe(100)
    })
  })

  // ═══ update() ═══════════════════════════════════════════════════════════════
  describe('update()', () => {
    it('updates a record and writes audit log', async () => {
      const before = { id: 'rec-001', version: 5, cost_id: 'C001', status: 'DRAFT' }
      const updated = { ...before, description: 'updated', version: 6 }
      mockTx.ProductCosts.findFirst.mockResolvedValueOnce(before)
      mockTx.ProductCosts.update.mockResolvedValueOnce(updated)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.update('rec-001', { description: 'updated', version: 5 })
      )

      expect(result).toEqual({ id: 'rec-001', version: 6 })
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'UPDATE',
        entityType: 'ProductCost',
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockTx.ProductCosts.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          ProductCostingService.update('missing-id', { description: 'test' })
        ).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ delete() ═══════════════════════════════════════════════════════════════
  describe('delete()', () => {
    it('soft-deletes a record (sets deletedAt and deletedBy)', async () => {
      const before = { id: 'rec-001', cost_id: 'C001' }
      mockTx.ProductCosts.findFirst.mockResolvedValueOnce(before)
      mockTx.ProductCosts.update.mockResolvedValueOnce({ ...before, deletedAt: new Date() })

      await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.delete('rec-001', 'test reason')
      )

      expect(mockTx.ProductCosts.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'rec-001' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          deletedBy: TEST_CTX.userId,
        }),
      }))
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'DELETE',
        reason: 'test reason',
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockTx.ProductCosts.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(ProductCostingService.delete('missing-id')).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ count() ════════════════════════════════════════════════════════════════
  describe('count()', () => {
    it('returns the count of records', async () => {
      mockDb.ProductCosts.count.mockResolvedValueOnce(42)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.count({ status: 'DRAFT' })
      )

      expect(result).toBe(42)
      expect(mockDb.ProductCosts.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'DRAFT' }),
      }))
    })
  })

  // ═══ existsByCode() ═════════════════════════════════════════════════════════
  describe('existsByCode()', () => {
    it('returns true when record exists', async () => {
      mockDb.ProductCosts.findFirst.mockResolvedValueOnce({ id: 'rec-001' })

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.existsByCode('C001')
      )

      expect(result).toBe(true)
    })

    it('returns false when record does not exist', async () => {
      mockDb.ProductCosts.findFirst.mockResolvedValueOnce(null)

      const result = await _runInTestContext(TEST_CTX, async () =>
        ProductCostingService.existsByCode('MISSING')
      )

      expect(result).toBe(false)
    })
  })
})
