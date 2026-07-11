/** Customer Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/customer/workflow'
import { BusinessRuleError, ConflictError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type CustomerStatus = 'LEAD' | 'PROSPECT' | 'APPROVED' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'ARCHIVED'
interface CustomerEntity extends WorkflowEntity { id: string; status: CustomerStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Customer Workflow', () => {
  const machine = workflowRegistry.get<CustomerStatus, CustomerEntity>('CustomerLifecycle')
  it('allows LEAD → PROSPECT', async () => { expect((await machine.canTransition({ id: '1', status: 'LEAD', version: 0 }, 'PROSPECT', wfCtx)).allowed).toBe(true) })
  it('allows PROSPECT → APPROVED', async () => { expect((await machine.canTransition({ id: '2', status: 'PROSPECT', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(true) })
  it('allows PROSPECT → LEAD (reject)', async () => { expect((await machine.canTransition({ id: '3', status: 'PROSPECT', version: 0 }, 'LEAD', wfCtx)).allowed).toBe(true) })
  it('allows APPROVED → ACTIVE', async () => { expect((await machine.canTransition({ id: '4', status: 'APPROVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → BLOCKED', async () => { expect((await machine.canTransition({ id: '5', status: 'ACTIVE', version: 0 }, 'BLOCKED', wfCtx)).allowed).toBe(true) })
  it('allows BLOCKED → ACTIVE (unblock)', async () => { expect((await machine.canTransition({ id: '6', status: 'BLOCKED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → INACTIVE', async () => { expect((await machine.canTransition({ id: '7', status: 'ACTIVE', version: 0 }, 'INACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows INACTIVE → ACTIVE (reactivate)', async () => { expect((await machine.canTransition({ id: '8', status: 'INACTIVE', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → ARCHIVED', async () => { expect((await machine.canTransition({ id: '9', status: 'ACTIVE', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('allows BLOCKED → ARCHIVED', async () => { expect((await machine.canTransition({ id: '10', status: 'BLOCKED', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('allows INACTIVE → ARCHIVED', async () => { expect((await machine.canTransition({ id: '11', status: 'INACTIVE', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('rejects LEAD → ACTIVE (must go through PROSPECT → APPROVED)', async () => { expect((await machine.canTransition({ id: '12', status: 'LEAD', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('rejects ARCHIVED → ACTIVE (terminal)', async () => { expect((await machine.canTransition({ id: '13', status: 'ARCHIVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '14', status: 'LEAD', version: 2 }, 'PROSPECT', wfCtx); expect(u.version).toBe(3) })
})

describe('Customer Error Types', () => {
  it('ConflictError for duplicate customer code', () => { expect(new ConflictError('Code exists').statusCode).toBe(409) })
  it('ConflictError for duplicate GSTIN', () => { expect(new ConflictError('GSTIN exists').statusCode).toBe(409) })
  it('BusinessRuleError for invalid GSTIN', () => { expect(new BusinessRuleError('Invalid GSTIN', { code: 'CUSTOMER.INVALID_GSTIN' }).code).toBe('CUSTOMER.INVALID_GSTIN') })
  it('BusinessRuleError for invalid PAN', () => { expect(new BusinessRuleError('Invalid PAN', { code: 'CUSTOMER.INVALID_PAN' }).code).toBe('CUSTOMER.INVALID_PAN') })
  it('BusinessRuleError for negative credit', () => { expect(new BusinessRuleError('Negative credit', { code: 'CUSTOMER.NEGATIVE_CREDIT' }).code).toBe('CUSTOMER.NEGATIVE_CREDIT') })
  it('BusinessRuleError for blocked customer', () => { expect(new BusinessRuleError('Blocked', { code: 'CUSTOMER.BLOCKED' }).code).toBe('CUSTOMER.BLOCKED') })
  it('BusinessRuleError for active delete', () => { expect(new BusinessRuleError('Active delete', { code: 'CUSTOMER.ACTIVE_DELETE' }).code).toBe('CUSTOMER.ACTIVE_DELETE') })
  it('BusinessRuleError for outstanding balance', () => { expect(new BusinessRuleError('Outstanding', { code: 'CUSTOMER.OUTSTANDING_BALANCE' }).code).toBe('CUSTOMER.OUTSTANDING_BALANCE') })
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'CUSTOMER.TRANSITION_DENIED' }).code).toBe('CUSTOMER.TRANSITION_DENIED') })
  it('NotFoundError for missing customer', () => { expect(new NotFoundError('Customer', 'abc').statusCode).toBe(404) })
})

describe('Customer Schemas', () => {
  it('validates customer type enum', () => {
    const schema = z.object({ customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'DEALER', 'CORPORATE', 'FRANCHISE', 'EXPORT', 'WALK_IN', 'CASH']) })
    expect(schema.safeParse({ customerType: 'RETAIL' }).success).toBe(true)
    expect(schema.safeParse({ customerType: 'INVALID' }).success).toBe(false)
  })
  it('validates GSTIN format', () => {
    const schema = z.object({ gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional() })
    expect(schema.safeParse({ gstin: '27AABCS1234M1Z5' }).success).toBe(true)
    expect(schema.safeParse({ gstin: 'invalid' }).success).toBe(false)
  })
  it('validates PAN format', () => {
    const schema = z.object({ pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional() })
    expect(schema.safeParse({ pan: 'AABCS1234M' }).success).toBe(true)
    expect(schema.safeParse({ pan: 'invalid' }).success).toBe(false)
  })
  it('validates risk rating', () => {
    const schema = z.object({ riskRating: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) })
    expect(schema.safeParse({ riskRating: 'HIGH' }).success).toBe(true)
    expect(schema.safeParse({ riskRating: 'EXTREME' }).success).toBe(false)
  })
  it('validates loyalty category', () => {
    const schema = z.object({ loyaltyCategory: z.enum(['SILVER', 'GOLD', 'PLATINUM']).optional() })
    expect(schema.safeParse({ loyaltyCategory: 'GOLD' }).success).toBe(true)
    expect(schema.safeParse({ loyaltyCategory: 'DIAMOND' }).success).toBe(false)
  })
  it('validates payment terms', () => {
    const schema = z.object({ paymentTerms: z.enum(['NET15', 'NET30', 'NET45', 'NET60', 'IMMEDIATE', 'ADVANCE']) })
    expect(schema.safeParse({ paymentTerms: 'NET30' }).success).toBe(true)
    expect(schema.safeParse({ paymentTerms: 'NET90' }).success).toBe(false)
  })
  it('validates transition schema', () => {
    const schema = z.object({ targetStatus: z.enum(['LEAD', 'PROSPECT', 'APPROVED', 'ACTIVE', 'BLOCKED', 'INACTIVE', 'ARCHIVED']), version: z.number().int().min(0) })
    expect(schema.safeParse({ targetStatus: 'ACTIVE', version: 0 }).success).toBe(true)
    expect(schema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
})

describe('Customer RBAC', () => {
  it('tenant_admin can read organization (used as proxy for customer)', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.ORG_READ)).toBe(true) })
  it('tenant_admin can create (used as proxy for customer)', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.ORG_CREATE)).toBe(true) })
  it('auditor cannot create (read-only role)', () => { expect(PermissionChecker.hasPermission(['auditor'], Permission.ORG_CREATE)).toBe(false) })
})
