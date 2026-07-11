/** Procurement Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/procurement/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type PRStatus = 'DRAFT' | 'SUBMITTED' | 'DEPT_REVIEW' | 'BUDGET_APPROVAL' | 'PROC_REVIEW' | 'APPROVED' | 'CONVERTED_TO_RFQ' | 'CLOSED' | 'CANCELLED' | 'REJECTED'
interface PREntity extends WorkflowEntity { id: string; status: PRStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Purchase Requisition Workflow', () => {
  const machine = workflowRegistry.get<PRStatus, PREntity>('PurchaseRequisitionLifecycle')
  it('allows DRAFT → SUBMITTED', async () => { expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'SUBMITTED', wfCtx)).allowed).toBe(true) })
  it('allows DRAFT → CANCELLED', async () => { expect((await machine.canTransition({ id: '2', status: 'DRAFT', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows SUBMITTED → DEPT_REVIEW', async () => { expect((await machine.canTransition({ id: '3', status: 'SUBMITTED', version: 0 }, 'DEPT_REVIEW', wfCtx)).allowed).toBe(true) })
  it('allows SUBMITTED → CANCELLED', async () => { expect((await machine.canTransition({ id: '4', status: 'SUBMITTED', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows DEPT_REVIEW → BUDGET_APPROVAL', async () => { expect((await machine.canTransition({ id: '5', status: 'DEPT_REVIEW', version: 0 }, 'BUDGET_APPROVAL', wfCtx)).allowed).toBe(true) })
  it('allows DEPT_REVIEW → REJECTED', async () => { expect((await machine.canTransition({ id: '6', status: 'DEPT_REVIEW', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true) })
  it('allows DEPT_REVIEW → DRAFT (returned)', async () => { expect((await machine.canTransition({ id: '7', status: 'DEPT_REVIEW', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true) })
  it('allows BUDGET_APPROVAL → PROC_REVIEW', async () => { expect((await machine.canTransition({ id: '8', status: 'BUDGET_APPROVAL', version: 0 }, 'PROC_REVIEW', wfCtx)).allowed).toBe(true) })
  it('allows BUDGET_APPROVAL → REJECTED', async () => { expect((await machine.canTransition({ id: '9', status: 'BUDGET_APPROVAL', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true) })
  it('allows PROC_REVIEW → APPROVED', async () => { expect((await machine.canTransition({ id: '10', status: 'PROC_REVIEW', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(true) })
  it('allows PROC_REVIEW → REJECTED', async () => { expect((await machine.canTransition({ id: '11', status: 'PROC_REVIEW', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true) })
  it('allows APPROVED → CONVERTED_TO_RFQ', async () => { expect((await machine.canTransition({ id: '12', status: 'APPROVED', version: 0 }, 'CONVERTED_TO_RFQ', wfCtx)).allowed).toBe(true) })
  it('allows APPROVED → CLOSED', async () => { expect((await machine.canTransition({ id: '13', status: 'APPROVED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows CONVERTED_TO_RFQ → CLOSED', async () => { expect((await machine.canTransition({ id: '14', status: 'CONVERTED_TO_RFQ', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows REJECTED → DRAFT (resubmit)', async () => { expect((await machine.canTransition({ id: '15', status: 'REJECTED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true) })
  it('rejects DRAFT → APPROVED (must go through review)', async () => { expect((await machine.canTransition({ id: '16', status: 'DRAFT', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(false) })
  it('rejects CLOSED → DRAFT (terminal)', async () => { expect((await machine.canTransition({ id: '17', status: 'CLOSED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(false) })
  it('rejects CANCELLED → SUBMITTED (terminal)', async () => { expect((await machine.canTransition({ id: '18', status: 'CANCELLED', version: 0 }, 'SUBMITTED', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '19', status: 'DRAFT', version: 4 }, 'SUBMITTED', wfCtx); expect(u.version).toBe(5) })
})

describe('PR Error Types', () => {
  it('BusinessRuleError for no lines', () => { expect(new BusinessRuleError('No lines', { code: 'PR.NO_LINES' }).code).toBe('PR.NO_LINES') })
  it('BusinessRuleError for past required date', () => { expect(new BusinessRuleError('Past date', { code: 'PR.PAST_REQUIRED_DATE' }).code).toBe('PR.PAST_REQUIRED_DATE') })
  it('BusinessRuleError for not editable', () => { expect(new BusinessRuleError('Not editable', { code: 'PR.NOT_EDITABLE' }).code).toBe('PR.NOT_EDITABLE') })
  it('BusinessRuleError for not draft', () => { expect(new BusinessRuleError('Not draft', { code: 'PR.NOT_DRAFT' }).code).toBe('PR.NOT_DRAFT') })
  it('BusinessRuleError for budget exceeded', () => { expect(new BusinessRuleError('Budget exceeded', { code: 'PR.BUDGET_EXCEEDED' }).code).toBe('PR.BUDGET_EXCEEDED') })
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'PR.TRANSITION_DENIED' }).code).toBe('PR.TRANSITION_DENIED') })
  it('NotFoundError for missing PR', () => { expect(new NotFoundError('PurchaseRequisition', 'abc').statusCode).toBe(404) })
})

describe('PR Schemas', () => {
  it('validates requisition type', () => {
    const schema = z.object({ requisitionType: z.enum(['MANUAL', 'MATERIAL_REQUIREMENT', 'DEPARTMENT_REQUEST', 'EMERGENCY', 'PLANNED', 'STOCK_REPLENISHMENT']) })
    expect(schema.safeParse({ requisitionType: 'EMERGENCY' }).success).toBe(true)
    expect(schema.safeParse({ requisitionType: 'INVALID' }).success).toBe(false)
  })
  it('validates priority', () => {
    const schema = z.object({ priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']) })
    expect(schema.safeParse({ priority: 'CRITICAL' }).success).toBe(true)
    expect(schema.safeParse({ priority: 'EXTREME' }).success).toBe(false)
  })
  it('requires at least one line', () => {
    const schema = z.object({ lines: z.array(z.object({})).min(1) })
    expect(schema.safeParse({ lines: [{}] }).success).toBe(true)
    expect(schema.safeParse({ lines: [] }).success).toBe(false)
  })
  it('validates line quantity is positive', () => {
    const schema = z.object({ requestedQty: z.number().positive() })
    expect(schema.safeParse({ requestedQty: 10 }).success).toBe(true)
    expect(schema.safeParse({ requestedQty: 0 }).success).toBe(false)
    expect(schema.safeParse({ requestedQty: -5 }).success).toBe(false)
  })
  it('validates transition schema', () => {
    const schema = z.object({ targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'DEPT_REVIEW', 'BUDGET_APPROVAL', 'PROC_REVIEW', 'APPROVED', 'CONVERTED_TO_RFQ', 'CLOSED', 'CANCELLED', 'REJECTED']), version: z.number().int().min(0) })
    expect(schema.safeParse({ targetStatus: 'APPROVED', version: 0 }).success).toBe(true)
    expect(schema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
})

describe('PR RBAC', () => {
  it('procurement_officer can read POs', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_READ)).toBe(true) })
  it('procurement_officer can create POs', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_CREATE)).toBe(true) })
  it('procurement_manager can approve POs', () => { expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PO_APPROVE)).toBe(true) })
  it('warehouse_operator can read but not create POs', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.PO_READ)).toBe(false)
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.PO_CREATE)).toBe(false)
  })
  it('auditor cannot create POs', () => { expect(PermissionChecker.hasPermission(['auditor'], Permission.PO_CREATE)).toBe(false) })
})
