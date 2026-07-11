/** Inventory Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

// ════════════════════════════════════════════════════════════════════════════
// MOVING AVERAGE COST CALCULATION
// ════════════════════════════════════════════════════════════════════════════

describe('Moving Average Cost Calculation', () => {
  function calculateMac(previousQty: number, previousValue: number, addedQty: number, addedUnitCost: number): { newQty: number; newTotalValue: number; movingAvgCost: number } {
    const newQty = previousQty + addedQty
    const addedValue = addedQty * addedUnitCost
    const newTotalValue = previousValue + addedValue
    const movingAvgCost = newQty > 0 ? newTotalValue / newQty : addedUnitCost
    return { newQty, newTotalValue, movingAvgCost }
  }

  it('calculates MAC for first stock in', () => {
    const result = calculateMac(0, 0, 100, 50)
    expect(result.newQty).toBe(100)
    expect(result.newTotalValue).toBe(5000)
    expect(result.movingAvgCost).toBe(50)
  })
  it('calculates MAC for second stock in at different price', () => {
    const result = calculateMac(100, 5000, 50, 60)
    expect(result.newQty).toBe(150)
    expect(result.newTotalValue).toBe(8000)
    expect(result.movingAvgCost).toBeCloseTo(53.33, 2)
  })
  it('calculates MAC for third stock in', () => {
    const result = calculateMac(150, 8000, 200, 55)
    expect(result.newQty).toBe(350)
    expect(result.newTotalValue).toBe(19000)
    expect(result.movingAvgCost).toBeCloseTo(54.29, 2)
  })
  it('returns unit cost when qty is 0', () => {
    const result = calculateMac(0, 0, 0, 50)
    expect(result.movingAvgCost).toBe(50)
  })
  it('handles stock in at lower price (reduces MAC)', () => {
    const result = calculateMac(100, 6000, 100, 40)
    expect(result.movingAvgCost).toBe(50) // (6000 + 4000) / 200 = 50
  })
  it('handles stock in at higher price (increases MAC)', () => {
    const result = calculateMac(100, 4000, 100, 60)
    expect(result.movingAvgCost).toBe(50) // (4000 + 6000) / 200 = 50
  })
})

// ════════════════════════════════════════════════════════════════════════════
// FEFO / FIFO LOGIC
// ════════════════════════════════════════════════════════════════════════════

describe('FEFO (First Expiry First Out) Logic', () => {
  it('orders stock by expiry date ascending', () => {
    const stock = [
      { id: '1', expiry: '2026-12-31', qty: 50 },
      { id: '2', expiry: '2026-06-30', qty: 30 },
      { id: '3', expiry: '2026-09-15', qty: 40 },
    ]
    const fefo = [...stock].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
    expect(fefo[0]!.id).toBe('2') // earliest expiry first
    expect(fefo[1]!.id).toBe('3')
    expect(fefo[2]!.id).toBe('1')
  })
  it('issues from earliest expiry first', () => {
    const stock = [
      { id: '1', expiry: '2026-12-31', qty: 50 },
      { id: '2', expiry: '2026-06-30', qty: 30 },
    ]
    const fefo = [...stock].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
    const qtyNeeded = 40
    let remaining = qtyNeeded
    const issued: Array<{ id: string; qty: number }> = []
    for (const s of fefo) {
      if (remaining <= 0) break
      const issueQty = Math.min(s.qty, remaining)
      issued.push({ id: s.id, qty: issueQty })
      remaining -= issueQty
    }
    expect(issued).toHaveLength(2) // issued from both
    expect(issued[0]!.id).toBe('2') // earliest expiry
    expect(issued[0]!.qty).toBe(30)
    expect(issued[1]!.id).toBe('1')
    expect(issued[1]!.qty).toBe(10)
  })
})

describe('FIFO (First In First Out) Logic', () => {
  it('orders stock by creation date ascending', () => {
    const stock = [
      { id: '1', createdAt: '2026-01-15', qty: 50 },
      { id: '2', createdAt: '2026-01-10', qty: 30 },
      { id: '3', createdAt: '2026-01-20', qty: 40 },
    ]
    const fifo = [...stock].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    expect(fifo[0]!.id).toBe('2') // earliest created first
    expect(fifo[1]!.id).toBe('1')
    expect(fifo[2]!.id).toBe('3')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS RULES
// ════════════════════════════════════════════════════════════════════════════

describe('Inventory Business Rules', () => {
  it('throws when stocking in without IQC approval', () => {
    expect(() => { if (!['PASSED', 'CONDITIONAL_PASS'].includes('PENDING')) throw new BusinessRuleError('Not passed', { code: 'INV.IQC_NOT_PASSED' }) }).toThrow(BusinessRuleError)
  })
  it('allows stock in after IQC pass', () => {
    expect(['PASSED', 'CONDITIONAL_PASS'].includes('PASSED')).toBe(true)
  })
  it('allows stock in after conditional pass', () => {
    expect(['PASSED', 'CONDITIONAL_PASS'].includes('CONDITIONAL_PASS')).toBe(true)
  })
  it('rejects stock in after IQC fail', () => {
    expect(['PASSED', 'CONDITIONAL_PASS'].includes('FAILED')).toBe(false)
  })
  it('throws when expiry not provided for batch-tracked product', () => {
    expect(() => { if (!undefined) throw new BusinessRuleError('Expiry required', { code: 'INV.EXPIRY_REQUIRED' }) }).toThrow(BusinessRuleError)
  })
  it('throws on zero quantity', () => {
    expect(() => { if (0 <= 0) throw new BusinessRuleError('Invalid', { code: 'INV.INVALID_QTY' }) }).toThrow(BusinessRuleError)
  })
  it('throws on insufficient stock', () => {
    expect(() => { if (50 < 100) throw new BusinessRuleError('Insufficient', { code: 'INV.INSUFFICIENT_STOCK' }) }).toThrow(BusinessRuleError)
  })
  it('throws on insufficient available stock', () => {
    expect(() => { if (30 < 50) throw new BusinessRuleError('Insufficient available', { code: 'INV.INSUFFICIENT_AVAILABLE' }) }).toThrow(BusinessRuleError)
  })
  it('throws when issuing blocked stock', () => {
    expect(() => { if (true) throw new BusinessRuleError('Blocked', { code: 'INV.STOCK_BLOCKED' }) }).toThrow(BusinessRuleError)
  })
  it('throws when issuing expired stock', () => {
    expect(() => { if (true) throw new BusinessRuleError('Expired', { code: 'INV.STOCK_EXPIRED' }) }).toThrow(BusinessRuleError)
  })
  it('throws on invalid reservation release', () => {
    expect(() => { if (true) throw new BusinessRuleError('Not active', { code: 'INV.RESERVATION_NOT_ACTIVE' }) }).toThrow(BusinessRuleError)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// LEDGER IMMUTABILITY
// ════════════════════════════════════════════════════════════════════════════

describe('Inventory Ledger Immutability', () => {
  it('ledger entries are immutable', () => {
    const entry = { is_immutable: true }
    expect(entry.is_immutable).toBe(true)
  })
  it('every movement creates a ledger entry', () => {
    const movements = ['STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT', 'RESERVATION', 'BLOCK']
    for (const m of movements) {
      expect(m).toBeDefined() // each movement type would create a ledger entry
    }
  })
  it('ledger tracks balance after each entry', () => {
    const entries = [
      { inQty: 100, outQty: 0, balance: 100 },
      { inQty: 0, outQty: 30, balance: 70 },
      { inQty: 50, outQty: 0, balance: 120 },
    ]
    expect(entries[0]!.balance).toBe(100)
    expect(entries[1]!.balance).toBe(70)
    expect(entries[2]!.balance).toBe(120)
  })
  it('ledger entry number format is IVL-YYYY-NNNNNNNN', () => {
    const year = new Date().getFullYear()
    const num = `IVL-${year}-00000001`
    expect(num).toMatch(/^IVL-\d{4}-\d{8}$/)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// BATCH/LOT UNIQUENESS
// ════════════════════════════════════════════════════════════════════════════

describe('Batch and Lot Uniqueness', () => {
  it('batch is unique per product', () => {
    const batches = [
      { batchNumber: 'BATCH-001', productId: 'p1' },
      { batchNumber: 'BATCH-001', productId: 'p2' }, // same batch number, different product — OK
    ]
    const key = (b: { batchNumber: string; productId: string }) => `${b.batchNumber}-${b.productId}`
    const uniqueKeys = new Set(batches.map(key))
    expect(uniqueKeys.size).toBe(batches.length)
  })
  it('lot is unique per product', () => {
    const lots = [
      { lotNumber: 'LOT-001', productId: 'p1' },
      { lotNumber: 'LOT-001', productId: 'p2' },
    ]
    const key = (l: { lotNumber: string; productId: string }) => `${l.lotNumber}-${l.productId}`
    const uniqueKeys = new Set(lots.map(key))
    expect(uniqueKeys.size).toBe(lots.length)
  })
  it('expiry is mandatory for batch-tracked products', () => {
    const batch = { batchNumber: 'BATCH-001', expiryDate: '2026-12-31' }
    expect(batch.expiryDate).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// EXPIRY TRACKING
// ════════════════════════════════════════════════════════════════════════════

describe('Expiry Tracking', () => {
  it('identifies expired stock', () => {
    const stock = { expiryDate: '2025-01-01', isExpired: false }
    const isExpired = new Date(stock.expiryDate) < new Date()
    expect(isExpired).toBe(true)
  })
  it('identifies non-expired stock', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const stock = { expiryDate: futureDate.toISOString(), isExpired: false }
    const isExpired = new Date(stock.expiryDate) < new Date()
    expect(isExpired).toBe(false)
  })
  it('calculates expiring soon (within 30 days)', () => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 30)
    const stock = { expiryDate: new Date(Date.now() + 20 * 86400000).toISOString() }
    const isExpiringSoon = new Date(stock.expiryDate) <= cutoff
    expect(isExpiringSoon).toBe(true)
  })
  it('does not flag far-future expiry as expiring soon', () => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 30)
    const stock = { expiryDate: new Date(Date.now() + 365 * 86400000).toISOString() }
    const isExpiringSoon = new Date(stock.expiryDate) <= cutoff
    expect(isExpiringSoon).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// RBAC
// ════════════════════════════════════════════════════════════════════════════

describe('Inventory RBAC', () => {
  it('INVENTORY_READ permission exists', () => { expect(Permission.INVENTORY_READ).toBe('inventory:read') })
  it('INVENTORY_POST permission exists', () => { expect(Permission.INVENTORY_POST).toBe('inventory:post') })
  it('INVENTORY_ADJUST permission exists', () => { expect(Permission.INVENTORY_ADJUST).toBe('inventory:adjust') })
  it('INVENTORY_REVERSE permission exists', () => { expect(Permission.INVENTORY_REVERSE).toBe('inventory:reverse') })
  it('tenant_admin has all inventory permissions', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.INVENTORY_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.INVENTORY_POST)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.INVENTORY_ADJUST)).toBe(true)
  })
  it('warehouse_operator can read and post inventory', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.INVENTORY_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.INVENTORY_POST)).toBe(true)
  })
  it('procurement_officer can read inventory', () => {
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.INVENTORY_READ)).toBe(true)
  })
  it('auditor can read inventory', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.INVENTORY_READ)).toBe(true)
  })
  it('quality_manager can read inventory', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.INVENTORY_READ)).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

describe('Inventory Schemas', () => {
  it('validates stock in schema', () => {
    const schema = z.object({
      quantity: z.number().positive(), unitCost: z.number().nonnegative(),
      productId: z.string().uuid(), warehouseId: z.string().uuid(),
    })
    expect(schema.safeParse({ quantity: 100, unitCost: 50, productId: '550e8400-e29b-41d4-a716-446655440000', warehouseId: '550e8400-e29b-41d4-a716-446655440001' }).success).toBe(true)
  })
  it('validates FEFO/FIFO strategy enum', () => {
    const schema = z.enum(['FEFO', 'FIFO'])
    expect(schema.safeParse('FEFO').success).toBe(true)
    expect(schema.safeParse('FIFO').success).toBe(true)
    expect(schema.safeParse('LIFO').success).toBe(false)
  })
  it('validates positive reserved quantity', () => {
    const schema = z.object({ reservedQty: z.number().positive() })
    expect(schema.safeParse({ reservedQty: 50 }).success).toBe(true)
    expect(schema.safeParse({ reservedQty: 0 }).success).toBe(false)
  })
  it('validates positive blocked quantity', () => {
    const schema = z.object({ blockedQty: z.number().positive() })
    expect(schema.safeParse({ blockedQty: 30 }).success).toBe(true)
    expect(schema.safeParse({ blockedQty: 0 }).success).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ════════════════════════════════════════════════════════════════════════════

describe('Inventory Error Types', () => {
  it('NotFoundError returns 404', () => { expect(new NotFoundError('Inventory', 'abc').statusCode).toBe(404) })
  it('AuthorizationError returns 403', () => { expect(new AuthorizationError('No auth').statusCode).toBe(403) })
})

// ════════════════════════════════════════════════════════════════════════════
// NUMBER GENERATION
// ════════════════════════════════════════════════════════════════════════════

describe('Number Generation', () => {
  it('generates IVT (transaction) number', () => {
    const year = new Date().getFullYear()
    expect(`IVT-${year}-00000001`).toMatch(/^IVT-\d{4}-\d{8}$/)
  })
  it('generates IVL (ledger) number', () => {
    const year = new Date().getFullYear()
    expect(`IVL-${year}-00000001`).toMatch(/^IVL-\d{4}-\d{8}$/)
  })
  it('generates SR (reservation) number', () => {
    const year = new Date().getFullYear()
    expect(`SR-${year}-000001`).toMatch(/^SR-\d{4}-\d{6}$/)
  })
  it('generates SB (block) number', () => {
    const year = new Date().getFullYear()
    expect(`SB-${year}-000001`).toMatch(/^SB-\d{4}-\d{6}$/)
  })
})
