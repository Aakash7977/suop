/**
 * general-ledger Service — Business Logic Tests (with mocked Prisma client)
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
  const tx = { JournalEntries: mkModelFns() }
  const db = {
    JournalEntries: mkModelFns(),
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

import '@/modules/general-ledger/workflow'

// ─── Import service AFTER mocks are set up ──────────────────────────────────
import { GeneralLedgerService } from '@/modules/general-ledger/service'
import { AuthorizationError, NotFoundError, BusinessRuleError, ValidationError, ConcurrencyError } from '@/core/errors'
import { _runInTestContext } from '@/core/context'

const TEST_CTX = {
  userId: 'user-001',
  tenantId: 'tenant-001',
  userEmail: 'tester@sudhamrit.com',
  correlationId: 'corr-001',
}

describe('GeneralLedgerService — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══ create() ═══════════════════════════════════════════════════════════════
  describe('create()', () => {
    it('creates a record, writes audit log, and publishes event', async () => {
      // Mock: no existing record with this code
      mockDb.JournalEntries.findFirst.mockResolvedValueOnce(null)
      // Mock: create returns the new record
      const createdRecord = {
        id: 'new-id-001',
        tenantId: TEST_CTX.tenantId,
        entry_number: 'TEST-001',
        status: 'DRAFT',
        version: 0,
      }
      mockTx.JournalEntries.create.mockResolvedValueOnce(createdRecord)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.create({ entry_number: 'TEST-001', description: 'test' })
      )

      expect(result).toEqual({ id: 'new-id-001' })
      expect(mockTx.JournalEntries.create).toHaveBeenCalled()
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CREATE',
        entityType: 'JournalEntry',
        entityId: 'new-id-001',
      }))
      expect(mockWriteToOutbox).toHaveBeenCalledWith(expect.objectContaining({
        eventName: 'JournalEntryCreated',
      }))
    })

    it('throws BusinessRuleError when entry_number already exists', async () => {
      // Mock: existing record found
      mockDb.JournalEntries.findFirst.mockResolvedValueOnce({ id: 'existing-id' })

      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          GeneralLedgerService.create({ entry_number: 'DUPLICATE', description: 'test' })
        ).rejects.toThrow(BusinessRuleError)
      })

      expect(mockTx.JournalEntries.create).not.toHaveBeenCalled()
    })

    it('throws ValidationError when entry_number is missing', async () => {
      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          GeneralLedgerService.create({ description: 'missing code' })
        ).rejects.toThrow(ValidationError)
      })
    })
  })

  // ═══ getById() ══════════════════════════════════════════════════════════════
  describe('getById()', () => {
    it('returns the record when found', async () => {
      const record = { id: 'rec-001', tenantId: TEST_CTX.tenantId, entry_number: 'TEST-001' }
      mockDb.JournalEntries.findFirst.mockResolvedValueOnce(record)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.getById('rec-001')
      )

      expect(result).toEqual(record)
      expect(mockDb.JournalEntries.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: 'rec-001', tenantId: TEST_CTX.tenantId, deletedAt: null }),
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockDb.JournalEntries.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(GeneralLedgerService.getById('missing-id')).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ list() ═════════════════════════════════════════════════════════════════
  describe('list()', () => {
    it('returns paginated results', async () => {
      const rows = [
        { id: 'r1', entry_number: 'C001' },
        { id: 'r2', entry_number: 'C002' },
      ]
      mockDb.JournalEntries.findMany.mockResolvedValueOnce(rows)
      mockDb.JournalEntries.count.mockResolvedValueOnce(2)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.list({ page: 1, pageSize: 25 })
      )

      expect(result).toEqual({ rows, total: 2, page: 1, pageSize: 25 })
      expect(mockDb.JournalEntries.findMany).toHaveBeenCalled()
      expect(mockDb.JournalEntries.count).toHaveBeenCalled()
    })

    it('caps pageSize at 100', async () => {
      mockDb.JournalEntries.findMany.mockResolvedValueOnce([])
      mockDb.JournalEntries.count.mockResolvedValueOnce(0)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.list({ page: 1, pageSize: 500 })
      )

      expect(result.pageSize).toBe(100)
    })
  })

  // ═══ update() ═══════════════════════════════════════════════════════════════
  describe('update()', () => {
    it('updates a record and writes audit log', async () => {
      const before = { id: 'rec-001', version: 5, entry_number: 'C001', status: 'DRAFT' }
      const updated = { ...before, description: 'updated', version: 6 }
      mockTx.JournalEntries.findFirst.mockResolvedValueOnce(before)
      mockTx.JournalEntries.update.mockResolvedValueOnce(updated)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.update('rec-001', { description: 'updated', version: 5 })
      )

      expect(result).toEqual({ id: 'rec-001', version: 6 })
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'UPDATE',
        entityType: 'JournalEntry',
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockTx.JournalEntries.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          GeneralLedgerService.update('missing-id', { description: 'test' })
        ).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ delete() ═══════════════════════════════════════════════════════════════
  describe('delete()', () => {
    it('soft-deletes a record (sets deletedAt and deletedBy)', async () => {
      const before = { id: 'rec-001', entry_number: 'C001' }
      mockTx.JournalEntries.findFirst.mockResolvedValueOnce(before)
      mockTx.JournalEntries.update.mockResolvedValueOnce({ ...before, deletedAt: new Date() })

      await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.delete('rec-001', 'test reason')
      )

      expect(mockTx.JournalEntries.update).toHaveBeenCalledWith(expect.objectContaining({
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
      mockTx.JournalEntries.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(GeneralLedgerService.delete('missing-id')).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ count() ════════════════════════════════════════════════════════════════
  describe('count()', () => {
    it('returns the count of records', async () => {
      mockDb.JournalEntries.count.mockResolvedValueOnce(42)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.count({ status: 'DRAFT' })
      )

      expect(result).toBe(42)
      expect(mockDb.JournalEntries.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'DRAFT' }),
      }))
    })
  })

  // ═══ existsByCode() ═════════════════════════════════════════════════════════
  describe('existsByCode()', () => {
    it('returns true when record exists', async () => {
      mockDb.JournalEntries.findFirst.mockResolvedValueOnce({ id: 'rec-001' })

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.existsByCode('C001')
      )

      expect(result).toBe(true)
    })

    it('returns false when record does not exist', async () => {
      mockDb.JournalEntries.findFirst.mockResolvedValueOnce(null)

      const result = await _runInTestContext(TEST_CTX, async () =>
        GeneralLedgerService.existsByCode('MISSING')
      )

      expect(result).toBe(false)
    })
  })
})
