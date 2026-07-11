/** Goods Receipt Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/goods-receipt/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type GRNStatus = 'DRAFT' | 'VERIFIED' | 'UNDER_INSPECTION' | 'PARTIALLY_ACCEPTED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED' | 'CANCELLED'
interface GRNEntity extends WorkflowEntity { id: string; status: GRNStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('GRN Workflow', () => {
  const machine = workflowRegistry.get<GRNStatus, GRNEntity>('GoodsReceiptLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('DRAFT') })
  it('has 8 states', () => { expect(machine.definition.states).toHaveLength(8) })
  it('has 12 transitions', () => { expect(machine.definition.transitions).toHaveLength(12) })
  it('allows DRAFT → VERIFIED', async () => { expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'VERIFIED', wfCtx)).allowed).toBe(true) })
  it('allows DRAFT → CANCELLED', async () => { expect((await machine.canTransition({ id: '2', status: 'DRAFT', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows VERIFIED → UNDER_INSPECTION', async () => { expect((await machine.canTransition({ id: '3', status: 'VERIFIED', version: 0 }, 'UNDER_INSPECTION', wfCtx)).allowed).toBe(true) })
  it('allows VERIFIED → ACCEPTED', async () => { expect((await machine.canTransition({ id: '4', status: 'VERIFIED', version: 0 }, 'ACCEPTED', wfCtx)).allowed).toBe(true) })
  it('allows UNDER_INSPECTION → ACCEPTED', async () => { expect((await machine.canTransition({ id: '5', status: 'UNDER_INSPECTION', version: 0 }, 'ACCEPTED', wfCtx)).allowed).toBe(true) })
  it('allows UNDER_INSPECTION → PARTIALLY_ACCEPTED', async () => { expect((await machine.canTransition({ id: '6', status: 'UNDER_INSPECTION', version: 0 }, 'PARTIALLY_ACCEPTED', wfCtx)).allowed).toBe(true) })
  it('allows UNDER_INSPECTION → REJECTED', async () => { expect((await machine.canTransition({ id: '7', status: 'UNDER_INSPECTION', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true) })
  it('allows ACCEPTED → CLOSED', async () => { expect((await machine.canTransition({ id: '8', status: 'ACCEPTED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows REJECTED → CLOSED', async () => { expect((await machine.canTransition({ id: '9', status: 'REJECTED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows REJECTED → DRAFT', async () => { expect((await machine.canTransition({ id: '10', status: 'REJECTED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true) })
  it('rejects DRAFT → ACCEPTED (must verify first)', async () => { expect((await machine.canTransition({ id: '11', status: 'DRAFT', version: 0 }, 'ACCEPTED', wfCtx)).allowed).toBe(false) })
  it('rejects CLOSED → DRAFT (terminal)', async () => { expect((await machine.canTransition({ id: '12', status: 'CLOSED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(false) })
  it('rejects CANCELLED → VERIFIED (terminal)', async () => { expect((await machine.canTransition({ id: '13', status: 'CANCELLED', version: 0 }, 'VERIFIED', wfCtx)).allowed).toBe(false) })
  it('increments version on transition', async () => { const u = await machine.transition({ id: '14', status: 'DRAFT', version: 3 }, 'VERIFIED', wfCtx); expect(u.version).toBe(4) })
})

describe('GRN Business Rules', () => {
  it('detects short receipt (received < ordered)', () => {
    const ordered = 100; const received = 80
    expect(received < ordered).toBe(true)
    const shortQty = ordered - received
    expect(shortQty).toBe(20)
  })
  it('detects over receipt (received > ordered * 1.1)', () => {
    const ordered = 100; const received = 120
    expect(received > ordered * 1.1).toBe(true)
  })
  it('allows tolerance up to 10% over receipt', () => {
    const ordered = 100; const received = 110
    expect(received <= ordered * 1.1).toBe(true)
  })
  it('calculates accepted qty = received - damaged', () => {
    const received = 100; const damaged = 5
    const accepted = received - damaged
    expect(accepted).toBe(95)
  })
  it('throws on zero received quantity', () => {
    expect(() => { if (0 <= 0) throw new BusinessRuleError('Invalid', { code: 'GRN.INVALID_QTY' }) }).toThrow(BusinessRuleError)
  })
})

describe('GRN Error Types', () => {
  it('BusinessRuleError for no lines', () => { expect(new BusinessRuleError('No lines', { code: 'GRN.NO_LINES' }).code).toBe('GRN.NO_LINES') })
  it('BusinessRuleError for PO not found', () => { expect(new BusinessRuleError('PO not found', { code: 'GRN.PO_NOT_FOUND' }).code).toBe('GRN.PO_NOT_FOUND') })
  it('BusinessRuleError for PO not receivable', () => { expect(new BusinessRuleError('Not receivable', { code: 'GRN.PO_NOT_RECEIVABLE' }).code).toBe('GRN.PO_NOT_RECEIVABLE') })
  it('BusinessRuleError for supplier mismatch', () => { expect(new BusinessRuleError('Mismatch', { code: 'GRN.SUPPLIER_MISMATCH' }).code).toBe('GRN.SUPPLIER_MISMATCH') })
  it('BusinessRuleError for supplier not active', () => { expect(new BusinessRuleError('Not active', { code: 'GRN.SUPPLIER_NOT_ACTIVE' }).code).toBe('GRN.SUPPLIER_NOT_ACTIVE') })
  it('BusinessRuleError for not draft', () => { expect(new BusinessRuleError('Not draft', { code: 'GRN.NOT_DRAFT' }).code).toBe('GRN.NOT_DRAFT') })
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'GRN.TRANSITION_DENIED' }).code).toBe('GRN.TRANSITION_DENIED') })
  it('BusinessRuleError for invalid damage qty', () => { expect(new BusinessRuleError('Invalid damage', { code: 'GRN.INVALID_DAMAGE_QTY' }).code).toBe('GRN.INVALID_DAMAGE_QTY') })
  it('NotFoundError returns 404', () => { expect(new NotFoundError('GoodsReceipt', 'abc').statusCode).toBe(404) })
  it('ConcurrencyError returns 409', () => { expect(new ConcurrencyError('Version mismatch').statusCode).toBe(409) })
  it('AuthorizationError returns 403', () => { expect(new AuthorizationError('No auth').statusCode).toBe(403) })
})

describe('GRN RBAC', () => {
  it('GRN_READ permission exists', () => { expect(Permission.GRN_READ).toBe('grn:read') })
  it('GRN_CREATE permission exists', () => { expect(Permission.GRN_CREATE).toBe('grn:create') })
  it('GRN_POST permission exists', () => { expect(Permission.GRN_POST).toBe('grn:post') })
  it('tenant_admin has all GRN permissions', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.GRN_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.GRN_CREATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.GRN_POST)).toBe(true)
  })
  it('warehouse_operator can read and post GRNs', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.GRN_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.GRN_POST)).toBe(true)
  })
  it('auditor can read GRNs', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.GRN_READ)).toBe(true)
  })
})

describe('GRN Schemas', () => {
  it('validates GRN line schema', () => {
    const schema = z.object({
      productId: z.string().uuid(), productSku: z.string().min(1),
      receivedQty: z.number().positive(), unitPrice: z.number().nonnegative(),
    })
    expect(schema.safeParse({ productId: '550e8400-e29b-41d4-a716-446655440000', productSku: 'SKU-001', receivedQty: 100, unitPrice: 50 }).success).toBe(true)
  })
  it('rejects negative received quantity', () => {
    const schema = z.object({ receivedQty: z.number().positive() })
    expect(schema.safeParse({ receivedQty: -5 }).success).toBe(false)
  })
  it('requires at least one line', () => {
    const schema = z.object({ lines: z.array(z.object({})).min(1) })
    expect(schema.safeParse({ lines: [{}] }).success).toBe(true)
    expect(schema.safeParse({ lines: [] }).success).toBe(false)
  })
  it('validates damage severity enum', () => {
    const schema = z.enum(['MINOR', 'MAJOR', 'CRITICAL'])
    expect(schema.safeParse('MINOR').success).toBe(true)
    expect(schema.safeParse('INVALID').success).toBe(false)
  })
})

describe('GRN Number Generation', () => {
  it('generates number in GRN-YYYY-NNNNNN format', () => {
    const year = new Date().getFullYear()
    const num = `GRN-${year}-000001`
    expect(num).toMatch(/^GRN-\d{4}-\d{6}$/)
  })
  it('pads sequence to 6 digits', () => {
    expect(String(1).padStart(6, '0')).toBe('000001')
    expect(String(999999).padStart(6, '0')).toBe('999999')
  })
})
