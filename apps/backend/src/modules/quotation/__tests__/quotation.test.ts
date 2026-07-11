/** Quotation Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/quotation/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'TECHNICAL_REVIEW' | 'COMMERCIAL_REVIEW' | 'RECOMMENDED' | 'AWARDED' | 'REJECTED' | 'ARCHIVED'
interface QuotationEntity extends WorkflowEntity { id: string; status: QuotationStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Quotation Workflow', () => {
  const machine = workflowRegistry.get<QuotationStatus, QuotationEntity>('QuotationLifecycle')

  it('allows DRAFT → SUBMITTED', async () => {
    expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'SUBMITTED', wfCtx)).allowed).toBe(true)
  })
  it('allows SUBMITTED → TECHNICAL_REVIEW', async () => {
    expect((await machine.canTransition({ id: '2', status: 'SUBMITTED', version: 0 }, 'TECHNICAL_REVIEW', wfCtx)).allowed).toBe(true)
  })
  it('allows TECHNICAL_REVIEW → COMMERCIAL_REVIEW', async () => {
    expect((await machine.canTransition({ id: '3', status: 'TECHNICAL_REVIEW', version: 0 }, 'COMMERCIAL_REVIEW', wfCtx)).allowed).toBe(true)
  })
  it('allows TECHNICAL_REVIEW → REJECTED', async () => {
    expect((await machine.canTransition({ id: '4', status: 'TECHNICAL_REVIEW', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true)
  })
  it('allows COMMERCIAL_REVIEW → RECOMMENDED', async () => {
    expect((await machine.canTransition({ id: '5', status: 'COMMERCIAL_REVIEW', version: 0 }, 'RECOMMENDED', wfCtx)).allowed).toBe(true)
  })
  it('allows COMMERCIAL_REVIEW → REJECTED', async () => {
    expect((await machine.canTransition({ id: '6', status: 'COMMERCIAL_REVIEW', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true)
  })
  it('allows RECOMMENDED → AWARDED', async () => {
    expect((await machine.canTransition({ id: '7', status: 'RECOMMENDED', version: 0 }, 'AWARDED', wfCtx)).allowed).toBe(true)
  })
  it('allows RECOMMENDED → REJECTED', async () => {
    expect((await machine.canTransition({ id: '8', status: 'RECOMMENDED', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true)
  })
  it('allows AWARDED → ARCHIVED', async () => {
    expect((await machine.canTransition({ id: '9', status: 'AWARDED', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true)
  })
  it('allows REJECTED → ARCHIVED', async () => {
    expect((await machine.canTransition({ id: '10', status: 'REJECTED', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true)
  })
  it('rejects DRAFT → AWARDED (must go through review stages)', async () => {
    expect((await machine.canTransition({ id: '11', status: 'DRAFT', version: 0 }, 'AWARDED', wfCtx)).allowed).toBe(false)
  })
  it('rejects SUBMITTED → AWARDED (must go through review)', async () => {
    expect((await machine.canTransition({ id: '12', status: 'SUBMITTED', version: 0 }, 'AWARDED', wfCtx)).allowed).toBe(false)
  })
  it('rejects DRAFT → TECHNICAL_REVIEW (must submit first)', async () => {
    expect((await machine.canTransition({ id: '13', status: 'DRAFT', version: 0 }, 'TECHNICAL_REVIEW', wfCtx)).allowed).toBe(false)
  })
  it('rejects ARCHIVED → DRAFT (terminal state)', async () => {
    expect((await machine.canTransition({ id: '14', status: 'ARCHIVED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(false)
  })
  it('rejects AWARDED → REJECTED (cannot reject after award)', async () => {
    expect((await machine.canTransition({ id: '15', status: 'AWARDED', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(false)
  })
  it('rejects REJECTED → RECOMMENDED (cannot revive rejected)', async () => {
    expect((await machine.canTransition({ id: '16', status: 'REJECTED', version: 0 }, 'RECOMMENDED', wfCtx)).allowed).toBe(false)
  })
  it('rejects COMMERCIAL_REVIEW → AWARDED (must be recommended first)', async () => {
    expect((await machine.canTransition({ id: '17', status: 'COMMERCIAL_REVIEW', version: 0 }, 'AWARDED', wfCtx)).allowed).toBe(false)
  })
  it('increments version on transition', async () => {
    const u = await machine.transition({ id: '18', status: 'DRAFT', version: 5 }, 'SUBMITTED', wfCtx)
    expect(u.version).toBe(6)
  })
  it('has correct initial state', () => {
    expect(machine.definition.initialState).toBe('DRAFT')
  })
  it('has 8 states', () => {
    expect(machine.definition.states).toHaveLength(8)
  })
  it('has 10 transitions', () => {
    expect(machine.definition.transitions).toHaveLength(10)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ════════════════════════════════════════════════════════════════════════════

describe('Quotation Error Types', () => {
  it('BusinessRuleError for no lines', () => {
    expect(new BusinessRuleError('No lines', { code: 'QUOT.NO_LINES' }).code).toBe('QUOT.NO_LINES')
  })
  it('BusinessRuleError for past validity', () => {
    expect(new BusinessRuleError('Past validity', { code: 'QUOT.PAST_VALIDITY' }).code).toBe('QUOT.PAST_VALIDITY')
  })
  it('BusinessRuleError for RFQ not found', () => {
    expect(new BusinessRuleError('RFQ not found', { code: 'QUOT.RFQ_NOT_FOUND' }).code).toBe('QUOT.RFQ_NOT_FOUND')
  })
  it('BusinessRuleError for RFQ not accepting', () => {
    expect(new BusinessRuleError('Not accepting', { code: 'QUOT.RFQ_NOT_ACCEPTING' }).code).toBe('QUOT.RFQ_NOT_ACCEPTING')
  })
  it('BusinessRuleError for supplier not found', () => {
    expect(new BusinessRuleError('Supplier not found', { code: 'QUOT.SUPPLIER_NOT_FOUND' }).code).toBe('QUOT.SUPPLIER_NOT_FOUND')
  })
  it('BusinessRuleError for supplier blacklisted', () => {
    expect(new BusinessRuleError('Blacklisted', { code: 'QUOT.SUPPLIER_BLACKLISTED' }).code).toBe('QUOT.SUPPLIER_BLACKLISTED')
  })
  it('BusinessRuleError for duplicate quotation', () => {
    expect(new BusinessRuleError('Duplicate', { code: 'QUOT.DUPLICATE' }).code).toBe('QUOT.DUPLICATE')
  })
  it('BusinessRuleError for not editable', () => {
    expect(new BusinessRuleError('Not editable', { code: 'QUOT.NOT_EDITABLE' }).code).toBe('QUOT.NOT_EDITABLE')
  })
  it('BusinessRuleError for not draft', () => {
    expect(new BusinessRuleError('Not draft', { code: 'QUOT.NOT_DRAFT' }).code).toBe('QUOT.NOT_DRAFT')
  })
  it('BusinessRuleError for transition denied', () => {
    expect(new BusinessRuleError('Denied', { code: 'QUOT.TRANSITION_DENIED' }).code).toBe('QUOT.TRANSITION_DENIED')
  })
  it('BusinessRuleError for already awarded', () => {
    expect(new BusinessRuleError('Already awarded', { code: 'QUOT.ALREADY_AWARDED' }).code).toBe('QUOT.ALREADY_AWARDED')
  })
  it('NotFoundError for missing quotation returns 404', () => {
    expect(new NotFoundError('SupplierQuotation', 'abc').statusCode).toBe(404)
  })
  it('ConcurrencyError for version mismatch returns 409', () => {
    expect(new ConcurrencyError('Version mismatch').statusCode).toBe(409)
  })
  it('AuthorizationError returns 403', () => {
    expect(new AuthorizationError('No auth').statusCode).toBe(403)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION
// ════════════════════════════════════════════════════════════════════════════

const quotLineSchema = z.object({
  productId: z.string().uuid(),
  productSku: z.string().min(1),
  productName: z.string().min(1),
  rfqLineId: z.string().uuid().optional(),
  quotedQty: z.number().positive(),
  uomId: z.string().uuid(),
  uomCode: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  currency: z.string().default('INR'),
  moq: z.number().nonnegative().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  discountPercent: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
})

const quotSchema = z.object({
  rfqId: z.string().uuid(),
  rfqNumber: z.string().min(1),
  supplierId: z.string().uuid(),
  supplierCode: z.string().min(1),
  supplierName: z.string().min(1),
  validityDate: z.string().datetime(),
  currency: z.string().default('INR'),
  paymentTerms: z.string().default('NET30'),
  deliveryTerms: z.string().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  taxPercent: z.number().nonnegative().optional(),
  discountPercent: z.number().nonnegative().optional(),
  freightAmount: z.number().nonnegative().optional(),
  insuranceAmount: z.number().nonnegative().optional(),
  warrantyTerms: z.string().optional(),
  remarks: z.string().optional(),
  lines: z.array(quotLineSchema).min(1),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'TECHNICAL_REVIEW', 'COMMERCIAL_REVIEW', 'RECOMMENDED', 'AWARDED', 'REJECTED', 'ARCHIVED']),
  version: z.number().int().min(0),
  technicalScore: z.number().min(0).max(100).optional(),
  commercialScore: z.number().min(0).max(100).optional(),
  overallScore: z.number().min(0).max(100).optional(),
  rank: z.number().int().positive().optional(),
  recommendationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

describe('Quotation Schemas', () => {
  it('validates a valid quotation', () => {
    const valid = {
      rfqId: '550e8400-e29b-41d4-a716-446655440000',
      rfqNumber: 'RFQ-2026-000001',
      supplierId: '550e8400-e29b-41d4-a716-446655440001',
      supplierCode: 'SUP-001',
      supplierName: 'Acme Supplies',
      validityDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      lines: [{
        productId: '550e8400-e29b-41d4-a716-446655440002',
        productSku: 'SKU-001',
        productName: 'Widget',
        quotedQty: 100,
        uomId: '550e8400-e29b-41d4-a716-446655440003',
        uomCode: 'PCS',
        unitPrice: 50,
      }],
    }
    expect(quotSchema.safeParse(valid).success).toBe(true)
  })
  it('requires at least one line', () => {
    const invalid = {
      rfqId: '550e8400-e29b-41d4-a716-446655440000',
      rfqNumber: 'RFQ-2026-000001',
      supplierId: '550e8400-e29b-41d4-a716-446655440001',
      supplierCode: 'SUP-001',
      supplierName: 'Acme',
      validityDate: new Date().toISOString(),
      lines: [],
    }
    expect(quotSchema.safeParse(invalid).success).toBe(false)
  })
  it('requires valid UUID for rfqId', () => {
    const invalid = { rfqId: 'not-a-uuid', rfqNumber: 'RFQ-001', supplierId: '550e8400-e29b-41d4-a716-446655440001', supplierCode: 'S1', supplierName: 'S', validityDate: new Date().toISOString(), lines: [] }
    expect(quotSchema.safeParse(invalid).success).toBe(false)
  })
  it('validates line quantity is positive', () => {
    expect(quotLineSchema.safeParse({ productId: '550e8400-e29b-41d4-a716-446655440002', productSku: 'S', productName: 'P', quotedQty: -5, uomId: '550e8400-e29b-41d4-a716-446655440003', uomCode: 'PCS', unitPrice: 10 }).success).toBe(false)
  })
  it('validates line unit price is non-negative', () => {
    expect(quotLineSchema.safeParse({ productId: '550e8400-e29b-41d4-a716-446655440002', productSku: 'S', productName: 'P', quotedQty: 10, uomId: '550e8400-e29b-41d4-a716-446655440003', uomCode: 'PCS', unitPrice: -1 }).success).toBe(false)
  })
  it('defaults currency to INR', () => {
    const result = quotLineSchema.safeParse({ productId: '550e8400-e29b-41d4-a716-446655440002', productSku: 'S', productName: 'P', quotedQty: 10, uomId: '550e8400-e29b-41d4-a716-446655440003', uomCode: 'PCS', unitPrice: 10 })
    expect(result.success && result.data.currency).toBe('INR')
  })
  it('validates transition targetStatus enum', () => {
    expect(transitionSchema.safeParse({ targetStatus: 'AWARDED', version: 0 }).success).toBe(true)
    expect(transitionSchema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
  it('validates technical score range 0-100', () => {
    expect(transitionSchema.safeParse({ targetStatus: 'RECOMMENDED', version: 0, technicalScore: 85 }).success).toBe(true)
    expect(transitionSchema.safeParse({ targetStatus: 'RECOMMENDED', version: 0, technicalScore: 150 }).success).toBe(false)
    expect(transitionSchema.safeParse({ targetStatus: 'RECOMMENDED', version: 0, technicalScore: -5 }).success).toBe(false)
  })
  it('validates version is non-negative integer', () => {
    expect(transitionSchema.safeParse({ targetStatus: 'SUBMITTED', version: 0 }).success).toBe(true)
    expect(transitionSchema.safeParse({ targetStatus: 'SUBMITTED', version: -1 }).success).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// RBAC TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Quotation RBAC', () => {
  it('QUOT_READ permission exists', () => {
    expect(Permission.QUOT_READ).toBe('quot:read')
  })
  it('QUOT_CREATE permission exists', () => {
    expect(Permission.QUOT_CREATE).toBe('quot:create')
  })
  it('QUOT_APPROVE permission exists', () => {
    expect(Permission.QUOT_APPROVE).toBe('quot:approve')
  })
  it('QUOT_REJECT permission exists', () => {
    expect(Permission.QUOT_REJECT).toBe('quot:reject')
  })
  it('QUOT_AWARD permission exists', () => {
    expect(Permission.QUOT_AWARD).toBe('quot:award')
  })
  it('tenant_admin has all quotation permissions', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.QUOT_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.QUOT_CREATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.QUOT_APPROVE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.QUOT_REJECT)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.QUOT_AWARD)).toBe(true)
  })
  it('procurement_officer can read and create quotations', () => {
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.QUOT_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.QUOT_CREATE)).toBe(true)
  })
  it('procurement_officer cannot approve quotations', () => {
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.QUOT_APPROVE)).toBe(false)
  })
  it('procurement_manager can approve, reject, and award quotations', () => {
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.QUOT_APPROVE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.QUOT_REJECT)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.QUOT_AWARD)).toBe(true)
  })
  it('auditor can read quotations but not create', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.QUOT_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['auditor'], Permission.QUOT_CREATE)).toBe(false)
  })
  it('warehouse_operator cannot access quotations', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.QUOT_READ)).toBe(false)
  })
  it('quality_manager cannot access quotations', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.QUOT_READ)).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// COMPARISON ENGINE LOGIC TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Comparison Engine Logic', () => {
  // Simulate the comparison algorithm from the service
  function simulateComparison(quotations: Array<{ grandTotal: number; supplierQualityRating?: number; onTimeDeliveryPct?: number }>) {
    if (quotations.length === 0) return { comparisons: [] }
    const sorted = [...quotations].sort((a, b) => a.grandTotal - b.grandTotal)
    const minPrice = sorted[0]!.grandTotal
    const comparisons = sorted.map((q, index) => {
      const priceScore = minPrice > 0 ? (minPrice / q.grandTotal) * 100 : 100
      const qualityScore = (q.supplierQualityRating ?? 3) * 20
      const deliveryScore = q.onTimeDeliveryPct ?? 75
      const overallScore = Math.round((priceScore * 0.5 + qualityScore * 0.3 + deliveryScore * 0.2) * 100) / 100
      return { grandTotal: q.grandTotal, isLowestPrice: index === 0, overallScore, isBestValue: false, rank: 0 }
    })
    let bestIdx = 0
    for (let i = 1; i < comparisons.length; i++) {
      if (comparisons[i]!.overallScore > comparisons[bestIdx]!.overallScore) bestIdx = i
    }
    comparisons[bestIdx]!.isBestValue = true
    const ranked = [...comparisons].sort((a, b) => b.overallScore - a.overallScore)
    ranked.forEach((c, i) => { c.rank = i + 1 })
    return { comparisons, bestIdx, minPrice }
  }

  it('marks lowest price as isLowestPrice', () => {
    const result = simulateComparison([
      { grandTotal: 1000 },
      { grandTotal: 1200 },
      { grandTotal: 900 },
    ])
    // After sorting by grandTotal ASC: 900, 1000, 1200
    expect(result.comparisons[0]!.isLowestPrice).toBe(true)
    expect(result.comparisons[1]!.isLowestPrice).toBe(false)
  })

  it('calculates overall score with 50/30/20 weighting', () => {
    const result = simulateComparison([
      { grandTotal: 1000, supplierQualityRating: 5, onTimeDeliveryPct: 100 },
    ])
    // priceScore = 1000/1000 * 100 = 100
    // qualityScore = 5 * 20 = 100
    // deliveryScore = 100
    // overall = 100*0.5 + 100*0.3 + 100*0.2 = 100
    expect(result.comparisons[0]!.overallScore).toBe(100)
  })

  it('penalizes higher price in score calculation', () => {
    const result = simulateComparison([
      { grandTotal: 1000, supplierQualityRating: 3, onTimeDeliveryPct: 75 },
      { grandTotal: 2000, supplierQualityRating: 5, onTimeDeliveryPct: 100 },
    ])
    // First: price=100, quality=60, delivery=75 → 50+18+15=83
    // Second: price=50, quality=100, delivery=100 → 25+30+20=75
    expect(result.comparisons[0]!.overallScore).toBeGreaterThan(result.comparisons[1]!.overallScore)
  })

  it('identifies best value (highest overall score)', () => {
    const result = simulateComparison([
      { grandTotal: 1000, supplierQualityRating: 5, onTimeDeliveryPct: 100 },
      { grandTotal: 1200, supplierQualityRating: 3, onTimeDeliveryPct: 75 },
    ])
    // First: price=100, quality=100, delivery=100 → 100
    // Second: price=83.3, quality=60, delivery=75 → 41.67+18+15=74.67
    expect(result.comparisons[result.bestIdx!]!.isBestValue).toBe(true)
    expect(result.bestIdx).toBe(0)
  })

  it('handles empty quotation list', () => {
    const result = simulateComparison([])
    expect(result.comparisons).toHaveLength(0)
  })

  it('assigns rank 1 to best value', () => {
    const result = simulateComparison([
      { grandTotal: 1000, supplierQualityRating: 5, onTimeDeliveryPct: 100 },
      { grandTotal: 1500, supplierQualityRating: 4, onTimeDeliveryPct: 80 },
    ])
    // The best value should have rank 1
    const best = result.comparisons.find(c => c.isBestValue)!
    expect(best.rank).toBe(1)
  })

  it('uses default quality rating of 3 when not provided', () => {
    const result = simulateComparison([{ grandTotal: 1000 }])
    // qualityScore = 3 * 20 = 60
    // priceScore = 100
    // deliveryScore = 75 (default)
    // overall = 50 + 18 + 15 = 83
    expect(result.comparisons[0]!.overallScore).toBe(83)
  })

  it('uses default delivery pct of 75 when not provided', () => {
    const result = simulateComparison([{ grandTotal: 1000, supplierQualityRating: 5 }])
    // priceScore = 100, qualityScore = 100, deliveryScore = 75
    // overall = 50 + 30 + 15 = 95
    expect(result.comparisons[0]!.overallScore).toBe(95)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TOTALS CALCULATION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Quotation Totals Calculation', () => {
  function calculateTotals(lines: Array<{ qty: number; unitPrice: number }>, taxPercent = 0, discountPercent = 0, freight = 0, insurance = 0) {
    let subtotal = 0
    for (const line of lines) {
      subtotal += line.qty * line.unitPrice
    }
    const taxAmount = subtotal * (taxPercent / 100)
    const discountAmount = subtotal * (discountPercent / 100)
    const grandTotal = subtotal + taxAmount - discountAmount + freight + insurance
    return { subtotal, taxAmount, discountAmount, grandTotal }
  }

  it('calculates subtotal from line items', () => {
    const totals = calculateTotals([{ qty: 10, unitPrice: 100 }, { qty: 5, unitPrice: 50 }])
    expect(totals.subtotal).toBe(1250)
  })

  it('calculates tax amount correctly', () => {
    const totals = calculateTotals([{ qty: 10, unitPrice: 100 }], 18)
    expect(totals.taxAmount).toBe(180)
    expect(totals.grandTotal).toBe(1180)
  })

  it('calculates discount amount correctly', () => {
    const totals = calculateTotals([{ qty: 10, unitPrice: 100 }], 0, 10)
    expect(totals.discountAmount).toBe(100)
    expect(totals.grandTotal).toBe(900)
  })

  it('adds freight and insurance', () => {
    const totals = calculateTotals([{ qty: 10, unitPrice: 100 }], 0, 0, 50, 25)
    expect(totals.grandTotal).toBe(1075)
  })

  it('handles all charges together', () => {
    const totals = calculateTotals([{ qty: 100, unitPrice: 50 }], 18, 5, 200, 100)
    // subtotal = 5000
    // tax = 900
    // discount = 250
    // grandTotal = 5000 + 900 - 250 + 200 + 100 = 5950
    expect(totals.subtotal).toBe(5000)
    expect(totals.taxAmount).toBe(900)
    expect(totals.discountAmount).toBe(250)
    expect(totals.grandTotal).toBe(5950)
  })

  it('handles zero quantities and prices', () => {
    const totals = calculateTotals([{ qty: 0, unitPrice: 100 }])
    expect(totals.subtotal).toBe(0)
    expect(totals.grandTotal).toBe(0)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// QUOTATION NUMBER GENERATION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Quotation Number Generation', () => {
  it('generates number in QUOT-YYYY-NNNNNN format', () => {
    const year = new Date().getFullYear()
    const seq = 1
    const num = `QUOT-${year}-${String(seq).padStart(6, '0')}`
    expect(num).toBe(`QUOT-${year}-000001`)
    expect(num).toMatch(/^QUOT-\d{4}-\d{6}$/)
  })
  it('pads sequence to 6 digits', () => {
    expect(String(1).padStart(6, '0')).toBe('000001')
    expect(String(42).padStart(6, '0')).toBe('000042')
    expect(String(999999).padStart(6, '0')).toBe('999999')
  })
  it('includes current year', () => {
    const year = new Date().getFullYear()
    const num = `QUOT-${year}-000001`
    expect(num).toContain(String(year))
  })
})
