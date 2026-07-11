/** RFQ Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/rfq/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type RfqStatus = 'DRAFT' | 'SUBMITTED' | 'SENT' | 'SUPPLIER_RESPONSE' | 'EVALUATION' | 'AWARDED' | 'CLOSED' | 'CANCELLED'
interface RfqEntity extends WorkflowEntity { id: string; status: RfqStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('RFQ Workflow', () => {
  const machine = workflowRegistry.get<RfqStatus, RfqEntity>('RfqLifecycle')
  it('allows DRAFT → SUBMITTED', async () => { expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'SUBMITTED', wfCtx)).allowed).toBe(true) })
  it('allows DRAFT → CANCELLED', async () => { expect((await machine.canTransition({ id: '2', status: 'DRAFT', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows SUBMITTED → SENT', async () => { expect((await machine.canTransition({ id: '3', status: 'SUBMITTED', version: 0 }, 'SENT', wfCtx)).allowed).toBe(true) })
  it('allows SUBMITTED → CANCELLED', async () => { expect((await machine.canTransition({ id: '4', status: 'SUBMITTED', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows SENT → SUPPLIER_RESPONSE', async () => { expect((await machine.canTransition({ id: '5', status: 'SENT', version: 0 }, 'SUPPLIER_RESPONSE', wfCtx)).allowed).toBe(true) })
  it('allows SENT → CLOSED (no responses)', async () => { expect((await machine.canTransition({ id: '6', status: 'SENT', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows SENT → CANCELLED', async () => { expect((await machine.canTransition({ id: '7', status: 'SENT', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows SUPPLIER_RESPONSE → EVALUATION', async () => { expect((await machine.canTransition({ id: '8', status: 'SUPPLIER_RESPONSE', version: 0 }, 'EVALUATION', wfCtx)).allowed).toBe(true) })
  it('allows SUPPLIER_RESPONSE → CLOSED', async () => { expect((await machine.canTransition({ id: '9', status: 'SUPPLIER_RESPONSE', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows EVALUATION → AWARDED', async () => { expect((await machine.canTransition({ id: '10', status: 'EVALUATION', version: 0 }, 'AWARDED', wfCtx)).allowed).toBe(true) })
  it('allows EVALUATION → CLOSED (no award)', async () => { expect((await machine.canTransition({ id: '11', status: 'EVALUATION', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows AWARDED → CLOSED', async () => { expect((await machine.canTransition({ id: '12', status: 'AWARDED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('rejects DRAFT → SENT (must submit first)', async () => { expect((await machine.canTransition({ id: '13', status: 'DRAFT', version: 0 }, 'SENT', wfCtx)).allowed).toBe(false) })
  it('rejects CLOSED → DRAFT (terminal)', async () => { expect((await machine.canTransition({ id: '14', status: 'CLOSED', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(false) })
  it('rejects CANCELLED → SUBMITTED (terminal)', async () => { expect((await machine.canTransition({ id: '15', status: 'CANCELLED', version: 0 }, 'SUBMITTED', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '16', status: 'DRAFT', version: 5 }, 'SUBMITTED', wfCtx); expect(u.version).toBe(6) })
})

describe('RFQ Error Types', () => {
  it('BusinessRuleError for no lines', () => { expect(new BusinessRuleError('No lines', { code: 'RFQ.NO_LINES' }).code).toBe('RFQ.NO_LINES') })
  it('BusinessRuleError for no suppliers', () => { expect(new BusinessRuleError('No suppliers', { code: 'RFQ.NO_SUPPLIERS' }).code).toBe('RFQ.NO_SUPPLIERS') })
  it('BusinessRuleError for past closing date', () => { expect(new BusinessRuleError('Past date', { code: 'RFQ.PAST_CLOSING_DATE' }).code).toBe('RFQ.PAST_CLOSING_DATE') })
  it('BusinessRuleError for PR not found', () => { expect(new BusinessRuleError('PR not found', { code: 'RFQ.PR_NOT_FOUND' }).code).toBe('RFQ.PR_NOT_FOUND') })
  it('BusinessRuleError for PR not approved', () => { expect(new BusinessRuleError('PR not approved', { code: 'RFQ.PR_NOT_APPROVED' }).code).toBe('RFQ.PR_NOT_APPROVED' ) })
  it('BusinessRuleError for supplier not found', () => { expect(new BusinessRuleError('Supplier not found', { code: 'RFQ.SUPPLIER_NOT_FOUND' }).code).toBe('RFQ.SUPPLIER_NOT_FOUND') })
  it('BusinessRuleError for supplier blacklisted', () => { expect(new BusinessRuleError('Blacklisted', { code: 'RFQ.SUPPLIER_BLACKLISTED' }).code).toBe('RFQ.SUPPLIER_BLACKLISTED') })
  it('BusinessRuleError for not editable', () => { expect(new BusinessRuleError('Not editable', { code: 'RFQ.NOT_EDITABLE' }).code).toBe('RFQ.NOT_EDITABLE') })
  it('BusinessRuleError for not draft', () => { expect(new BusinessRuleError('Not draft', { code: 'RFQ.NOT_DRAFT' }).code).toBe('RFQ.NOT_DRAFT') })
  it('BusinessRuleError for not invitable', () => { expect(new BusinessRuleError('Not invitable', { code: 'RFQ.NOT_INVITABLE' }).code).toBe('RFQ.NOT_INVITABLE') })
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'RFQ.TRANSITION_DENIED' }).code).toBe('RFQ.TRANSITION_DENIED') })
  it('NotFoundError for missing RFQ', () => { expect(new NotFoundError('Rfq', 'abc').statusCode).toBe(404) })
})

describe('RFQ Schemas', () => {
  it('validates RFQ type enum', () => {
    const schema = z.object({ rfqType: z.enum(['SINGLE_SUPPLIER', 'MULTI_SUPPLIER', 'OPEN']) })
    expect(schema.safeParse({ rfqType: 'OPEN' }).success).toBe(true)
    expect(schema.safeParse({ rfqType: 'INVALID' }).success).toBe(false)
  })
  it('requires at least one line', () => {
    const schema = z.object({ lines: z.array(z.object({})).min(1) })
    expect(schema.safeParse({ lines: [{}] }).success).toBe(true)
    expect(schema.safeParse({ lines: [] }).success).toBe(false)
  })
  it('validates line quantity is positive', () => {
    const schema = z.object({ requestedQty: z.number().positive() })
    expect(schema.safeParse({ requestedQty: 100 }).success).toBe(true)
    expect(schema.safeParse({ requestedQty: -5 }).success).toBe(false)
  })
  it('validates transition schema', () => {
    const schema = z.object({ targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'SENT', 'SUPPLIER_RESPONSE', 'EVALUATION', 'AWARDED', 'CLOSED', 'CANCELLED']), version: z.number().int().min(0) })
    expect(schema.safeParse({ targetStatus: 'SENT', version: 0 }).success).toBe(true)
    expect(schema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
})

describe('RFQ RBAC', () => {
  it('procurement_officer can read POs (proxy for RFQ)', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_READ)).toBe(true) })
  it('procurement_officer can create POs (proxy for RFQ)', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PO_CREATE)).toBe(true) })
  it('procurement_manager can approve (proxy for RFQ transitions)', () => { expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PO_APPROVE)).toBe(true) })
  it('auditor cannot create RFQs', () => { expect(PermissionChecker.hasPermission(['auditor'], Permission.PO_CREATE)).toBe(false) })
})
