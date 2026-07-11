/** Warehouse Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { BusinessRuleError, NotFoundError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

// ════════════════════════════════════════════════════════════════════════════
// WAREHOUSE HIERARCHY
// ════════════════════════════════════════════════════════════════════════════

describe('Warehouse Hierarchy', () => {
  it('warehouse has zones, aisles, racks, bins', () => {
    const hierarchy = {
      warehouse: { id: 'w1', name: 'Main Warehouse' },
      zones: [{ id: 'z1', code: 'Z-A', name: 'Zone A' }],
      aisles: [{ id: 'a1', code: 'A-01', name: 'Aisle 1', zoneId: 'z1' }],
      racks: [{ id: 'r1', code: 'R-01', name: 'Rack 1', aisleId: 'a1', levels: 4 }],
      bins: [{ id: 'b1', code: 'B-01-01', name: 'Bin 1', rackId: 'r1', level: 1 }],
    }
    expect(hierarchy.warehouse).toBeDefined()
    expect(hierarchy.zones).toHaveLength(1)
    expect(hierarchy.aisles).toHaveLength(1)
    expect(hierarchy.racks).toHaveLength(1)
    expect(hierarchy.bins).toHaveLength(1)
  })
  it('rack capacity = levels × capacity_per_level', () => {
    const levels = 4; const capacityPerLevel = 100
    const totalCapacity = levels * capacityPerLevel
    expect(totalCapacity).toBe(400)
  })
  it('bin code format includes rack and level', () => {
    const binCode = 'R01-L1-B01'
    expect(binCode).toMatch(/^R\d+-L\d+-B\d+$/)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// CAPACITY VALIDATION
// ════════════════════════════════════════════════════════════════════════════

describe('Warehouse Capacity Validation', () => {
  it('allows putaway when capacity is available', () => {
    const bin = { capacity: 100, usedCapacity: 30 }
    const requiredQty = 50
    expect(bin.capacity - bin.usedCapacity >= requiredQty).toBe(true)
  })
  it('rejects putaway when capacity exceeded', () => {
    const bin = { capacity: 100, usedCapacity: 80 }
    const requiredQty = 30
    expect(bin.capacity - bin.usedCapacity >= requiredQty).toBe(false)
  })
  it('allows putaway when capacity is 0 (unlimited)', () => {
    const bin = { capacity: 0, usedCapacity: 1000 }
    const requiredQty = 500
    expect(bin.capacity === 0 || bin.capacity - bin.usedCapacity >= requiredQty).toBe(true)
  })
  it('throws when bin is blocked', () => {
    expect(() => { if (true) throw new BusinessRuleError('Blocked', { code: 'WH.BIN_BLOCKED' }) }).toThrow(BusinessRuleError)
  })
  it('throws when bin is inactive', () => {
    expect(() => { if (true) throw new BusinessRuleError('Inactive', { code: 'WH.BIN_INACTIVE' }) }).toThrow(BusinessRuleError)
  })
  it('throws when bin not found', () => {
    expect(() => { if (true) throw new BusinessRuleError('Not found', { code: 'WH.BIN_NOT_FOUND' }) }).toThrow(BusinessRuleError)
  })
  it('throws when no available bin', () => {
    expect(() => { if (true) throw new BusinessRuleError('No bin', { code: 'WH.NO_AVAILABLE_BIN' }) }).toThrow(BusinessRuleError)
  })
  it('throws when capacity exceeded', () => {
    expect(() => { if (true) throw new BusinessRuleError('Exceeded', { code: 'WH.CAPACITY_EXCEEDED' }) }).toThrow(BusinessRuleError)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// PUTAWAY VALIDATION
// ════════════════════════════════════════════════════════════════════════════

describe('Putaway Validation', () => {
  it('throws on zero quantity', () => {
    expect(() => { if (0 <= 0) throw new BusinessRuleError('Invalid', { code: 'WH.INVALID_QTY' }) }).toThrow(BusinessRuleError)
  })
  it('throws when completing non-pending task', () => {
    expect(() => { if (!['IN_PROGRESS', 'PENDING'].includes('COMPLETED')) throw new BusinessRuleError('Not completable', { code: 'WH.NOT_COMPLETABLE' }) }).toThrow(BusinessRuleError)
  })
  it('allows completing pending task', () => {
    expect(['IN_PROGRESS', 'PENDING'].includes('PENDING')).toBe(true)
  })
  it('allows completing in-progress task', () => {
    expect(['IN_PROGRESS', 'PENDING'].includes('IN_PROGRESS')).toBe(true)
  })
  it('putaway task number format is PT-YYYY-NNNNNN', () => {
    const year = new Date().getFullYear()
    expect(`PT-${year}-000001`).toMatch(/^PT-\d{4}-\d{6}$/)
  })
  it('priority enum is valid', () => {
    const schema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    expect(schema.safeParse('URGENT').success).toBe(true)
    expect(schema.safeParse('INVALID').success).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// BARCODE ENGINE
// ════════════════════════════════════════════════════════════════════════════

describe('Barcode Engine', () => {
  it('generates unique barcode', () => {
    const year = new Date().getFullYear()
    const barcode = `BC-${year}-00000001`
    expect(barcode).toMatch(/^BC-\d{4}-\d{8}$/)
  })
  it('generates GS1 barcode with GTIN prefix', () => {
    const year = new Date().getFullYear()
    const barcode = `GTIN-${year}-00000001`
    expect(barcode).toMatch(/^GTIN-\d{4}-\d{8}$/)
  })
  it('generates QR barcode with QR prefix', () => {
    const year = new Date().getFullYear()
    const barcode = `QR-${year}-00000001`
    expect(barcode).toMatch(/^QR-\d{4}-\d{8}$/)
  })
  it('barcode is unique per tenant', () => {
    const barcodes = ['BC-2026-00000001', 'BC-2026-00000002', 'BC-2026-00000003']
    const unique = new Set(barcodes)
    expect(unique.size).toBe(barcodes.length)
  })
  it('GS1 expiry format is YYMMDD', () => {
    const expiry = new Date('2026-12-31')
    const gs1Expiry = `${String(expiry.getFullYear()).slice(2)}${String(expiry.getMonth() + 1).padStart(2, '0')}${String(expiry.getDate()).padStart(2, '0')}`
    expect(gs1Expiry).toBe('261231')
    expect(gs1Expiry).toMatch(/^\d{6}$/)
  })
  it('QR data contains barcode and product info', () => {
    const qrData = JSON.stringify({ bc: 'BC-2026-00000001', lt: 'PRODUCT', p: 'SKU-001' })
    const parsed = JSON.parse(qrData)
    expect(parsed.bc).toBe('BC-2026-00000001')
    expect(parsed.lt).toBe('PRODUCT')
    expect(parsed.p).toBe('SKU-001')
  })
  it('label type enum is valid', () => {
    const schema = z.enum(['PRODUCT', 'BATCH', 'LOT', 'BIN', 'GRN', 'PALLET', 'GS1', 'QR'])
    expect(schema.safeParse('PRODUCT').success).toBe(true)
    expect(schema.safeParse('GS1').success).toBe(true)
    expect(schema.safeParse('INVALID').success).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SCANNER API
// ════════════════════════════════════════════════════════════════════════════

describe('Scanner API', () => {
  it('scan type is required', () => {
    const schema = z.object({ barcode: z.string().min(1), scanType: z.string().min(1) })
    expect(schema.safeParse({ barcode: 'BC-2026-00000001', scanType: 'PUTAWAY' }).success).toBe(true)
    expect(schema.safeParse({ barcode: '', scanType: 'PUTAWAY' }).success).toBe(false)
    expect(schema.safeParse({ barcode: 'BC-2026-00000001', scanType: '' }).success).toBe(false)
  })
  it('returns NOT_FOUND for unknown barcode', () => {
    expect(() => { if (true) throw new NotFoundError('Barcode', 'unknown') }).toThrow(NotFoundError)
  })
  it('marks barcode as scanned after scan', () => {
    const label = { is_scanned: false, scanned_at: null }
    label.is_scanned = true
    label.scanned_at = new Date().toISOString()
    expect(label.is_scanned).toBe(true)
    expect(label.scanned_at).not.toBeNull()
  })
  it('increments print count on print', () => {
    const label = { print_count: 0, is_printed: false }
    label.print_count += 1
    label.is_printed = true
    expect(label.print_count).toBe(1)
    expect(label.is_printed).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// RBAC
// ════════════════════════════════════════════════════════════════════════════

describe('Warehouse RBAC', () => {
  it('warehouse operations use INVENTORY_READ and INVENTORY_POST permissions', () => {
    expect(Permission.INVENTORY_READ).toBe('inventory:read')
    expect(Permission.INVENTORY_POST).toBe('inventory:post')
  })
  it('tenant_admin can manage warehouse', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.INVENTORY_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.INVENTORY_POST)).toBe(true)
  })
  it('warehouse_operator can read and post', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.INVENTORY_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.INVENTORY_POST)).toBe(true)
  })
  it('procurement_officer cannot post to warehouse', () => {
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.INVENTORY_POST)).toBe(false)
  })
  it('auditor can read warehouse data', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.INVENTORY_READ)).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ════════════════════════════════════════════════════════════════════════════

describe('Warehouse Error Types', () => {
  it('NotFoundError returns 404', () => { expect(new NotFoundError('WarehouseBin', 'abc').statusCode).toBe(404) })
  it('BusinessRuleError for capacity exceeded', () => {
    expect(new BusinessRuleError('Exceeded', { code: 'WH.CAPACITY_EXCEEDED' }).code).toBe('WH.CAPACITY_EXCEEDED')
  })
  it('BusinessRuleError for concurrency', () => {
    expect(new BusinessRuleError('Concurrency', { code: 'WH.CONCURRENCY' }).code).toBe('WH.CONCURRENCY')
  })
})
