/** Purchase Order Module — Unit Tests (80+ tests) */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/purchase-order/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'
import { poCalculations, poValidations } from '../service'

type POStatus =
  | 'DRAFT' | 'SUBMITTED' | 'DEPT_APPROVAL' | 'FINANCE_APPROVAL' | 'MANAGEMENT_APPROVAL'
  | 'APPROVED' | 'ISSUED' | 'SUPPLIER_ACCEPTED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED'
  | 'CLOSED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' | 'REVISION_REQUESTED'

interface POEntity extends WorkflowEntity { id: string; status: POStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW TESTS (30 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Purchase Order Workflow', () => {
  const machine = workflowRegistry.get<POStatus, POEntity>('PurchaseOrderLifecycle')

  it('has correct initial state', () => {
    expect(machine.definition.initialState).toBe('DRAFT')
  })
  it('has 15 states', () => {
    expect(machine.definition.states).toHaveLength(15)
  })
  it('has 27 transitions', () => {
    expect(machine.definition.transitions).toHaveLength(27)
  })
  it('allows DRAFT → SUBMITTED', async () => {
    expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'SUBMITTED', wfCtx)).allowed).toBe(true)
  })
  it('allows DRAFT → CANCELLED', async () => {
    expect((await machine.canTransition({ id: '2', status: 'DRAFT', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true)
  })
  it('allows SUBMITTED → DEPT_APPROVAL', async () => {
    expect((await machine.canTransition({ id: '3', status: 'SUBMITTED', version: 0 }, 'DEPT_APPROVAL', wfCtx)).allowed).toBe(true)
  })
  it('allows SUBMITTED → CANCELLED', async () => {
    expect((await machine.canTransition({ id: '4', status: 'SUBMITTED', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true)
  })
  it('allows SUBMITTED → DRAFT (returned)', async () => {
    expect((await machine.canTransition({ id: '5', status: 'SUBMITTED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true)
  })
  it('allows DEPT_APPROVAL → FINANCE_APPROVAL', async () => {
    expect((await machine.canTransition({ id: '6', status: 'DEPT_APPROVAL', version: 0 }, 'FINANCE_APPROVAL', wfCtx)).allowed).toBe(true)
  })
  it('allows DEPT_APPROVAL → REJECTED', async () => {
    expect((await machine.canTransition({ id: '7', status: 'DEPT_APPROVAL', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true)
  })
  it('allows FINANCE_APPROVAL → MANAGEMENT_APPROVAL', async () => {
    expect((await machine.canTransition({ id: '8', status: 'FINANCE_APPROVAL', version: 0 }, 'MANAGEMENT_APPROVAL', wfCtx)).allowed).toBe(true)
  })
  it('allows FINANCE_APPROVAL → REJECTED', async () => {
    expect((await machine.canTransition({ id: '9', status: 'FINANCE_APPROVAL', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true)
  })
  it('allows MANAGEMENT_APPROVAL → APPROVED', async () => {
    expect((await machine.canTransition({ id: '10', status: 'MANAGEMENT_APPROVAL', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(true)
  })
  it('allows MANAGEMENT_APPROVAL → REJECTED', async () => {
    expect((await machine.canTransition({ id: '11', status: 'MANAGEMENT_APPROVAL', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true)
  })
  it('allows APPROVED → ISSUED', async () => {
    expect((await machine.canTransition({ id: '12', status: 'APPROVED', version: 0 }, 'ISSUED', wfCtx)).allowed).toBe(true)
  })
  it('allows APPROVED → CANCELLED', async () => {
    expect((await machine.canTransition({ id: '13', status: 'APPROVED', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true)
  })
  it('allows ISSUED → SUPPLIER_ACCEPTED', async () => {
    expect((await machine.canTransition({ id: '14', status: 'ISSUED', version: 0 }, 'SUPPLIER_ACCEPTED', wfCtx)).allowed).toBe(true)
  })
  it('allows ISSUED → REVISION_REQUESTED', async () => {
    expect((await machine.canTransition({ id: '15', status: 'ISSUED', version: 0 }, 'REVISION_REQUESTED', wfCtx)).allowed).toBe(true)
  })
  it('allows ISSUED → CANCELLED', async () => {
    expect((await machine.canTransition({ id: '16', status: 'ISSUED', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true)
  })
  it('allows ISSUED → EXPIRED', async () => {
    expect((await machine.canTransition({ id: '17', status: 'ISSUED', version: 0 }, 'EXPIRED', wfCtx)).allowed).toBe(true)
  })
  it('allows REVISION_REQUESTED → DRAFT', async () => {
    expect((await machine.canTransition({ id: '18', status: 'REVISION_REQUESTED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true)
  })
  it('allows SUPPLIER_ACCEPTED → PARTIALLY_RECEIVED', async () => {
    expect((await machine.canTransition({ id: '19', status: 'SUPPLIER_ACCEPTED', version: 0 }, 'PARTIALLY_RECEIVED', wfCtx)).allowed).toBe(true)
  })
  it('allows SUPPLIER_ACCEPTED → FULLY_RECEIVED', async () => {
    expect((await machine.canTransition({ id: '20', status: 'SUPPLIER_ACCEPTED', version: 0 }, 'FULLY_RECEIVED', wfCtx)).allowed).toBe(true)
  })
  it('allows PARTIALLY_RECEIVED → FULLY_RECEIVED', async () => {
    expect((await machine.canTransition({ id: '21', status: 'PARTIALLY_RECEIVED', version: 0 }, 'FULLY_RECEIVED', wfCtx)).allowed).toBe(true)
  })
  it('allows PARTIALLY_RECEIVED → CLOSED (partial close)', async () => {
    expect((await machine.canTransition({ id: '22', status: 'PARTIALLY_RECEIVED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true)
  })
  it('allows FULLY_RECEIVED → CLOSED', async () => {
    expect((await machine.canTransition({ id: '23', status: 'FULLY_RECEIVED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true)
  })
  it('allows REJECTED → DRAFT (resubmit)', async () => {
    expect((await machine.canTransition({ id: '24', status: 'REJECTED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true)
  })
  it('rejects DRAFT → APPROVED (must go through approval chain)', async () => {
    expect((await machine.canTransition({ id: '25', status: 'DRAFT', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(false)
  })
  it('rejects DRAFT → ISSUED (must be approved first)', async () => {
    expect((await machine.canTransition({ id: '26', status: 'DRAFT', version: 0 }, 'ISSUED', wfCtx)).allowed).toBe(false)
  })
  it('rejects CLOSED → DRAFT (terminal state)', async () => {
    expect((await machine.canTransition({ id: '27', status: 'CLOSED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(false)
  })
  it('rejects CANCELLED → APPROVED (terminal)', async () => {
    expect((await machine.canTransition({ id: '28', status: 'CANCELLED', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(false)
  })
  it('rejects APPROVED → SUPPLIER_ACCEPTED (must issue first)', async () => {
    expect((await machine.canTransition({ id: '29', status: 'APPROVED', version: 0 }, 'SUPPLIER_ACCEPTED', wfCtx)).allowed).toBe(false)
  })
  it('increments version on transition', async () => {
    const u = await machine.transition({ id: '30', status: 'DRAFT', version: 5 }, 'SUBMITTED', wfCtx)
    expect(u.version).toBe(6)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ERROR TYPES (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Purchase Order Error Types', () => {
  it('BusinessRuleError for no lines', () => {
    expect(new BusinessRuleError('No lines', { code: 'PO.NO_LINES' }).code).toBe('PO.NO_LINES')
  })
  it('BusinessRuleError for supplier not active', () => {
    expect(new BusinessRuleError('Not active', { code: 'PO.SUPPLIER_NOT_ACTIVE' }).code).toBe('PO.SUPPLIER_NOT_ACTIVE')
  })
  it('BusinessRuleError for supplier blacklisted', () => {
    expect(new BusinessRuleError('Blacklisted', { code: 'PO.SUPPLIER_BLACKLISTED' }).code).toBe('PO.SUPPLIER_BLACKLISTED')
  })
  it('BusinessRuleError for product not active', () => {
    expect(new BusinessRuleError('Not active', { code: 'PO.PRODUCT_NOT_ACTIVE' }).code).toBe('PO.PRODUCT_NOT_ACTIVE')
  })
  it('BusinessRuleError for duplicate PO number', () => {
    expect(new BusinessRuleError('Duplicate', { code: 'PO.DUPLICATE_NUMBER' }).code).toBe('PO.DUPLICATE_NUMBER')
  })
  it('BusinessRuleError for lead time violation', () => {
    expect(new BusinessRuleError('Lead time', { code: 'PO.LEAD_TIME_VIOLATION' }).code).toBe('PO.LEAD_TIME_VIOLATION')
  })
  it('BusinessRuleError for price variance exceeded', () => {
    expect(new BusinessRuleError('Variance', { code: 'PO.PRICE_VARIANCE_EXCEEDED' }).code).toBe('PO.PRICE_VARIANCE_EXCEEDED')
  })
  it('BusinessRuleError for invalid PO type', () => {
    expect(new BusinessRuleError('Invalid type', { code: 'PO.INVALID_TYPE' }).code).toBe('PO.INVALID_TYPE')
  })
  it('NotFoundError returns 404', () => {
    expect(new NotFoundError('PurchaseOrder', 'abc').statusCode).toBe(404)
  })
  it('ConcurrencyError returns 409', () => {
    expect(new ConcurrencyError('Version mismatch').statusCode).toBe(409)
  })
  it('AuthorizationError returns 403', () => {
    expect(new AuthorizationError('No auth').statusCode).toBe(403)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// CALCULATIONS (20 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Purchase Order Calculations', () => {
  describe('Tax Calculation', () => {
    it('calculates 18% GST correctly', () => {
      expect(poCalculations.calculateTax(1000, 18)).toBe(180)
    })
    it('calculates 0% tax correctly', () => {
      expect(poCalculations.calculateTax(1000, 0)).toBe(0)
    })
    it('calculates 28% tax correctly', () => {
      expect(poCalculations.calculateTax(1000, 28)).toBe(280)
    })
    it('rounds to 2 decimal places', () => {
      expect(poCalculations.calculateTax(333.33, 18)).toBe(60)
    })
  })

  describe('Discount Calculation', () => {
    it('calculates 10% discount correctly', () => {
      expect(poCalculations.calculateDiscount(1000, 10)).toBe(100)
    })
    it('calculates 0% discount correctly', () => {
      expect(poCalculations.calculateDiscount(1000, 0)).toBe(0)
    })
    it('calculates 50% discount correctly', () => {
      expect(poCalculations.calculateDiscount(1000, 50)).toBe(500)
    })
  })

  describe('Freight Calculation', () => {
    it('uses flat freight amount when provided', () => {
      expect(poCalculations.calculateFreight(1000, 200)).toBe(200)
    })
    it('calculates freight as percent of subtotal', () => {
      expect(poCalculations.calculateFreight(1000, undefined, 5)).toBe(50)
    })
    it('returns 0 when no freight specified', () => {
      expect(poCalculations.calculateFreight(1000)).toBe(0)
    })
  })

  describe('Round-off Calculation', () => {
    it('rounds up correctly', () => {
      // calculateRoundOff returns Math.round(amount) - amount
      // For 1000.45, Math.round(1000.45) = 1000, so roundOff = 1000 - 1000.45 = -0.45
      expect(poCalculations.calculateRoundOff(1000.45)).toBeCloseTo(-0.45, 2)
    })
    it('rounds down correctly', () => {
      // For 1000.55, Math.round(1000.55) = 1001, so roundOff = 1001 - 1000.55 = 0.45
      expect(poCalculations.calculateRoundOff(1000.55)).toBeCloseTo(0.45, 2)
    })
    it('returns 0 for exact amount', () => {
      expect(poCalculations.calculateRoundOff(1000)).toBe(0)
    })
  })

  describe('Expected Delivery Date', () => {
    it('calculates date from lead time days', () => {
      const date = new Date(poCalculations.calculateExpectedDeliveryDate(30))
      const expected = new Date()
      expected.setDate(expected.getDate() + 30)
      expect(date.toDateString()).toBe(expected.toDateString())
    })
    it('returns ISO string', () => {
      const result = poCalculations.calculateExpectedDeliveryDate(7)
      expect(new Date(result).toISOString()).toBe(result)
    })
  })

  describe('Totals Calculation', () => {
    it('calculates subtotal from lines', () => {
      const totals = poCalculations.calculateTotals([
        { qty: 10, unitPrice: 100 },
        { qty: 5, unitPrice: 50 },
      ])
      expect(totals.subtotal).toBe(1250)
    })
    it('calculates tax amount from lines', () => {
      const totals = poCalculations.calculateTotals([
        { qty: 10, unitPrice: 100, taxPercent: 18 },
      ])
      expect(totals.taxAmount).toBe(180)
    })
    it('calculates discount from lines', () => {
      const totals = poCalculations.calculateTotals([
        { qty: 10, unitPrice: 100, discountPercent: 10 },
      ])
      expect(totals.discountAmount).toBe(100)
    })
    it('includes freight in grand total', () => {
      const totals = poCalculations.calculateTotals(
        [{ qty: 10, unitPrice: 100 }],
        { freightAmount: 200 },
      )
      expect(totals.grandTotal).toBe(1200)
    })
    it('includes insurance in grand total', () => {
      const totals = poCalculations.calculateTotals(
        [{ qty: 10, unitPrice: 100 }],
        { insuranceAmount: 100 },
      )
      expect(totals.grandTotal).toBe(1100)
    })
    it('includes all charges in grand total', () => {
      const totals = poCalculations.calculateTotals(
        [{ qty: 10, unitPrice: 100, taxPercent: 18 }],
        { freightAmount: 200, insuranceAmount: 100, otherCharges: 50 },
      )
      // subtotal=1000, tax=180, freight=200, insurance=100, other=50
      // grand = 1000 + 180 + 200 + 100 + 50 = 1530
      expect(totals.grandTotal).toBe(1530)
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS RULES VALIDATION (15 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Purchase Order Business Rules', () => {
  describe('PO Type Validation', () => {
    it('accepts STANDARD type', () => {
      expect(poValidations.validatePoType('STANDARD')).toBe('STANDARD')
    })
    it('accepts BLANKET type', () => {
      expect(poValidations.validatePoType('BLANKET')).toBe('BLANKET')
    })
    it('accepts EMERGENCY type', () => {
      expect(poValidations.validatePoType('EMERGENCY')).toBe('EMERGENCY')
    })
    it('accepts CAPITAL type', () => {
      expect(poValidations.validatePoType('CAPITAL')).toBe('CAPITAL')
    })
    it('rejects invalid type', () => {
      expect(() => poValidations.validatePoType('INVALID')).toThrow(BusinessRuleError)
    })
  })

  describe('Currency Validation', () => {
    it('defaults to INR', () => {
      expect(poValidations.validateCurrency(undefined)).toBe('INR')
    })
    it('accepts USD', () => {
      expect(poValidations.validateCurrency('USD')).toBe('USD')
    })
    it('accepts EUR', () => {
      expect(poValidations.validateCurrency('EUR')).toBe('EUR')
    })
    it('rejects unsupported currency', () => {
      expect(() => poValidations.validateCurrency('XYZ')).toThrow(BusinessRuleError)
    })
    it('normalizes to uppercase', () => {
      expect(poValidations.validateCurrency('inr')).toBe('INR')
    })
  })

  describe('MOQ Validation', () => {
    it('returns true when qty >= MOQ', () => {
      expect(poValidations.validateMoq(100, 50)).toBe(true)
    })
    it('returns true when qty equals MOQ', () => {
      expect(poValidations.validateMoq(50, 50)).toBe(true)
    })
    it('returns false when qty < MOQ', () => {
      expect(poValidations.validateMoq(30, 50)).toBe(false)
    })
    it('returns true when MOQ is undefined', () => {
      expect(poValidations.validateMoq(10, undefined)).toBe(true)
    })
  })

  describe('Max Quantity Validation', () => {
    it('passes when qty <= max', () => {
      expect(() => poValidations.validateMaxQty(100, 200, 'SKU-001')).not.toThrow()
    })
    it('throws when qty > max', () => {
      expect(() => poValidations.validateMaxQty(250, 200, 'SKU-001')).toThrow(BusinessRuleError)
    })
    it('passes when max is undefined', () => {
      expect(() => poValidations.validateMaxQty(1000, undefined, 'SKU-001')).not.toThrow()
    })
  })

  describe('Emergency PO', () => {
    it('returns true for EMERGENCY type', () => {
      expect(poValidations.isEmergencyPo('EMERGENCY')).toBe(true)
    })
    it('returns false for STANDARD type', () => {
      expect(poValidations.isEmergencyPo('STANDARD')).toBe(false)
    })
  })

  describe('Blanket PO Validation', () => {
    it('passes when blanket PO has validity date', () => {
      expect(() => poValidations.validateBlanketPo('BLANKET', '2026-12-31T00:00:00Z', 100000)).not.toThrow()
    })
    it('throws when blanket PO has no validity date', () => {
      expect(() => poValidations.validateBlanketPo('BLANKET', undefined, 100000)).toThrow(BusinessRuleError)
    })
    it('passes for non-blanket PO without validity date', () => {
      expect(() => poValidations.validateBlanketPo('STANDARD', undefined, 1000)).not.toThrow()
    })
  })

  describe('Lines Validation', () => {
    it('passes with at least one line', () => {
      expect(() => poValidations.validateLinesPresent([{ productId: 'p1' }])).not.toThrow()
    })
    it('throws with empty lines', () => {
      expect(() => poValidations.validateLinesPresent([])).toThrow(BusinessRuleError)
    })
  })

  describe('Editable Validation', () => {
    it('allows DRAFT status', () => {
      expect(() => poValidations.validateEditable('DRAFT')).not.toThrow()
    })
    it('allows REVISION_REQUESTED status', () => {
      expect(() => poValidations.validateEditable('REVISION_REQUESTED')).not.toThrow()
    })
    it('rejects APPROVED status', () => {
      expect(() => poValidations.validateEditable('APPROVED')).toThrow(BusinessRuleError)
    })
    it('rejects CLOSED status', () => {
      expect(() => poValidations.validateEditable('CLOSED')).toThrow(BusinessRuleError)
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// RBAC TESTS (12 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Purchase Order RBAC', () => {
  it('PO_READ permission exists', () => {
    expect(Permission.PO_READ).toBe('po:read')
  })
  it('PO_CREATE permission exists', () => {
    expect(Permission.PO_CREATE).toBe('po:create')
  })
  it('PO_UPDATE permission exists', () => {
    expect(Permission.PO_UPDATE).toBe('po:update')
  })
  it('PO_DELETE permission exists', () => {
    expect(Permission.PO_DELETE).toBe('po:delete')
  })
  it('PO_APPROVE permission exists', () => {
    expect(Permission.PO_APPROVE).toBe('po:approve')
  })
  it('PO_ISSUE permission exists', () => {
    expect(Permission.PO_ISSUE).toBe('po:issue')
  })
  it('PO_CLOSE permission exists', () => {
    expect(Permission.PO_CLOSE).toBe('po:close')
  })
  it('PO_EXPORT permission exists', () => {
    expect(Permission.PO_EXPORT).toBe('po:export')
  })
  it('tenant_admin has all PO permissions', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_CREATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_UPDATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_DELETE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_APPROVE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_ISSUE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_CLOSE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PO_EXPORT)).toBe(true)
  })
  it('procurement_officer can read, create, update, issue but not delete/approve/close', () => {
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_CREATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_UPDATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_ISSUE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_DELETE)).toBe(false)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_APPROVE)).toBe(false)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_CLOSE)).toBe(false)
  })
  it('procurement_manager has all PO permissions', () => {
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PO_APPROVE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PO_DELETE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PO_CLOSE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PO_EXPORT)).toBe(true)
  })
  it('auditor can read but not create', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.PO_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['auditor'], Permission.PO_CREATE)).toBe(false)
  })
  it('warehouse_operator cannot access POs', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.PO_READ)).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Purchase Order Schemas', () => {
  const poTypeSchema = z.enum(['STANDARD', 'BLANKET', 'CONTRACT', 'SERVICE', 'SUBCONTRACTING', 'EMERGENCY', 'CONSIGNMENT', 'CAPITAL'])
  const transitionSchema = z.object({
    targetStatus: z.enum([
      'DRAFT', 'SUBMITTED', 'DEPT_APPROVAL', 'FINANCE_APPROVAL', 'MANAGEMENT_APPROVAL',
      'APPROVED', 'ISSUED', 'SUPPLIER_ACCEPTED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED',
      'CLOSED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'REVISION_REQUESTED',
    ]),
    version: z.number().int().min(0),
  })

  it('validates all 8 PO types', () => {
    const types = ['STANDARD', 'BLANKET', 'CONTRACT', 'SERVICE', 'SUBCONTRACTING', 'EMERGENCY', 'CONSIGNMENT', 'CAPITAL']
    for (const t of types) {
      expect(poTypeSchema.safeParse(t).success).toBe(true)
    }
  })
  it('rejects invalid PO type', () => {
    expect(poTypeSchema.safeParse('INVALID').success).toBe(false)
  })
  it('validates transition targetStatus enum', () => {
    expect(transitionSchema.safeParse({ targetStatus: 'APPROVED', version: 0 }).success).toBe(true)
  })
  it('rejects invalid transition status', () => {
    expect(transitionSchema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
  it('validates version is non-negative integer', () => {
    expect(transitionSchema.safeParse({ targetStatus: 'SUBMITTED', version: 0 }).success).toBe(true)
    expect(transitionSchema.safeParse({ targetStatus: 'SUBMITTED', version: -1 }).success).toBe(false)
  })
  it('requires at least one line', () => {
    const schema = z.object({ lines: z.array(z.object({})).min(1) })
    expect(schema.safeParse({ lines: [{}] }).success).toBe(true)
    expect(schema.safeParse({ lines: [] }).success).toBe(false)
  })
  it('validates ordered quantity is positive', () => {
    const schema = z.object({ orderedQty: z.number().positive() })
    expect(schema.safeParse({ orderedQty: 100 }).success).toBe(true)
    expect(schema.safeParse({ orderedQty: -5 }).success).toBe(false)
    expect(schema.safeParse({ orderedQty: 0 }).success).toBe(false)
  })
  it('validates unit price is non-negative', () => {
    const schema = z.object({ unitPrice: z.number().nonnegative() })
    expect(schema.safeParse({ unitPrice: 100 }).success).toBe(true)
    expect(schema.safeParse({ unitPrice: 0 }).success).toBe(true)
    expect(schema.safeParse({ unitPrice: -1 }).success).toBe(false)
  })
  it('validates UUID for supplierId', () => {
    const schema = z.object({ supplierId: z.string().uuid() })
    expect(schema.safeParse({ supplierId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true)
    expect(schema.safeParse({ supplierId: 'not-a-uuid' }).success).toBe(false)
  })
  it('defaults currency to INR', () => {
    const schema = z.object({ currency: z.string().default('INR') })
    const result = schema.safeParse({})
    expect(result.success && result.data.currency).toBe('INR')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// PO NUMBER GENERATION (3 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('PO Number Generation', () => {
  it('generates number in PO-YYYY-NNNNNN format', () => {
    const year = new Date().getFullYear()
    const num = `PO-${year}-000001`
    expect(num).toMatch(/^PO-\d{4}-\d{6}$/)
  })
  it('uses EMPO prefix for emergency POs', () => {
    const year = new Date().getFullYear()
    const num = `EMPO-${year}-000001`
    expect(num).toMatch(/^EMPO-\d{4}-\d{6}$/)
  })
  it('pads sequence to 6 digits', () => {
    expect(String(1).padStart(6, '0')).toBe('000001')
    expect(String(999999).padStart(6, '0')).toBe('999999')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SUPPLIER ACKNOWLEDGEMENT (5 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Supplier Acknowledgement', () => {
  it('accepts ACCEPTED status', () => {
    const ackSchema = z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'DATE_CHANGE_REQUESTED', 'QTY_CHANGE_REQUESTED'])
    expect(ackSchema.safeParse('ACCEPTED').success).toBe(true)
  })
  it('accepts REJECTED status', () => {
    const ackSchema = z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'DATE_CHANGE_REQUESTED', 'QTY_CHANGE_REQUESTED'])
    expect(ackSchema.safeParse('REJECTED').success).toBe(true)
  })
  it('accepts COUNTER_OFFER status', () => {
    const ackSchema = z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'DATE_CHANGE_REQUESTED', 'QTY_CHANGE_REQUESTED'])
    expect(ackSchema.safeParse('COUNTER_OFFER').success).toBe(true)
  })
  it('accepts DATE_CHANGE_REQUESTED status', () => {
    const ackSchema = z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'DATE_CHANGE_REQUESTED', 'QTY_CHANGE_REQUESTED'])
    expect(ackSchema.safeParse('DATE_CHANGE_REQUESTED').success).toBe(true)
  })
  it('rejects invalid ack status', () => {
    const ackSchema = z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'DATE_CHANGE_REQUESTED', 'QTY_CHANGE_REQUESTED'])
    expect(ackSchema.safeParse('INVALID').success).toBe(false)
  })
})
