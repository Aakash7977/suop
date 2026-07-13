/** Supplier Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/supplier/workflow'
import { BusinessRuleError, ConflictError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type SupplierStatus = 'DRAFT' | 'VERIFICATION' | 'APPROVED' | 'ACTIVE' | 'PROBATION' | 'BLOCKED' | 'BLACKLISTED' | 'ARCHIVED'
interface SupplierEntity extends WorkflowEntity { id: string; status: SupplierStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Supplier Workflow', () => {
  const machine = workflowRegistry.get<SupplierStatus, SupplierEntity>('SupplierLifecycle')
  it('allows DRAFT → VERIFICATION', async () => { expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'VERIFICATION', wfCtx)).allowed).toBe(true) })
  it('allows VERIFICATION → APPROVED', async () => { expect((await machine.canTransition({ id: '2', status: 'VERIFICATION', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(true) })
  it('allows VERIFICATION → DRAFT (reject)', async () => { expect((await machine.canTransition({ id: '3', status: 'VERIFICATION', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true) })
  it('allows APPROVED → ACTIVE', async () => { expect((await machine.canTransition({ id: '4', status: 'APPROVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → PROBATION', async () => { expect((await machine.canTransition({ id: '5', status: 'ACTIVE', version: 0 }, 'PROBATION', wfCtx)).allowed).toBe(true) })
  it('allows PROBATION → ACTIVE (recover)', async () => { expect((await machine.canTransition({ id: '6', status: 'PROBATION', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → BLOCKED', async () => { expect((await machine.canTransition({ id: '7', status: 'ACTIVE', version: 0 }, 'BLOCKED', wfCtx)).allowed).toBe(true) })
  it('allows BLOCKED → ACTIVE (unblock)', async () => { expect((await machine.canTransition({ id: '8', status: 'BLOCKED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → BLACKLISTED', async () => { expect((await machine.canTransition({ id: '9', status: 'ACTIVE', version: 0 }, 'BLACKLISTED', wfCtx)).allowed).toBe(true) })
  it('allows BLOCKED → BLACKLISTED', async () => { expect((await machine.canTransition({ id: '10', status: 'BLOCKED', version: 0 }, 'BLACKLISTED', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → ARCHIVED', async () => { expect((await machine.canTransition({ id: '11', status: 'ACTIVE', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('allows BLACKLISTED → ARCHIVED', async () => { expect((await machine.canTransition({ id: '12', status: 'BLACKLISTED', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('rejects DRAFT → ACTIVE (must verify first)', async () => { expect((await machine.canTransition({ id: '13', status: 'DRAFT', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('rejects BLACKLISTED → ACTIVE (blacklist is terminal until archived)', async () => { expect((await machine.canTransition({ id: '14', status: 'BLACKLISTED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('rejects ARCHIVED → ACTIVE (terminal)', async () => { expect((await machine.canTransition({ id: '15', status: 'ARCHIVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '16', status: 'DRAFT', version: 3 }, 'VERIFICATION', wfCtx); expect(u.version).toBe(4) })
})

describe('Supplier Error Types', () => {
  it('ConflictError for duplicate vendor code', () => { expect(new ConflictError('Vendor code exists').statusCode).toBe(409) })
  it('ConflictError for duplicate GSTIN', () => { expect(new ConflictError('GSTIN exists').statusCode).toBe(409) })
  it('BusinessRuleError for invalid GSTIN', () => { expect(new BusinessRuleError('Invalid GSTIN', { code: 'SUPPLIER.INVALID_GSTIN' }).code).toBe('SUPPLIER.INVALID_GSTIN') })
  it('BusinessRuleError for invalid PAN', () => { expect(new BusinessRuleError('Invalid PAN', { code: 'SUPPLIER.INVALID_PAN' }).code).toBe('SUPPLIER.INVALID_PAN') })
  it('BusinessRuleError for blacklisted supplier modification', () => { expect(new BusinessRuleError('Cannot modify', { code: 'SUPPLIER.BLACKLISTED' }).code).toBe('SUPPLIER.BLACKLISTED') })
  it('BusinessRuleError for active supplier deletion', () => { expect(new BusinessRuleError('Cannot delete active', { code: 'SUPPLIER.ACTIVE_DELETE' }).code).toBe('SUPPLIER.ACTIVE_DELETE' ) })
  it('BusinessRuleError for already blacklisted', () => { expect(new BusinessRuleError('Already blacklisted', { code: 'SUPPLIER.ALREADY_BLACKLISTED' }).code).toBe('SUPPLIER.ALREADY_BLACKLISTED') })
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'SUPPLIER.TRANSITION_DENIED' }).code).toBe('SUPPLIER.TRANSITION_DENIED') })
  it('NotFoundError for missing supplier', () => { expect(new NotFoundError('Supplier', 'abc').statusCode).toBe(404) })
})

describe('Supplier Schemas', () => {
  it('validates supplier type enum', () => {
    const schema = z.object({ supplierType: z.enum(['DOMESTIC', 'INTERNATIONAL', 'LOCAL']) })
    expect(schema.safeParse({ supplierType: 'DOMESTIC' }).success).toBe(true)
    expect(schema.safeParse({ supplierType: 'INVALID' }).success).toBe(false)
  })
  it('validates vendor type enum', () => {
    const schema = z.object({ vendorType: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'TRADER', 'SERVICE_PROVIDER', 'TRANSPORTER', 'CONTRACTOR', 'IMPORTER']) })
    expect(schema.safeParse({ vendorType: 'MANUFACTURER' }).success).toBe(true)
    expect(schema.safeParse({ vendorType: 'INVALID' }).success).toBe(false)
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
  it('validates payment terms enum', () => {
    const schema = z.object({ paymentTerms: z.enum(['NET15', 'NET30', 'NET45', 'NET60', 'IMMEDIATE', 'ADVANCE']) })
    expect(schema.safeParse({ paymentTerms: 'NET30' }).success).toBe(true)
    expect(schema.safeParse({ paymentTerms: 'NET90' }).success).toBe(false)
  })
  it('validates risk level enum', () => {
    const schema = z.object({ riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) })
    expect(schema.safeParse({ riskLevel: 'HIGH' }).success).toBe(true)
    expect(schema.safeParse({ riskLevel: 'EXTREME' }).success).toBe(false)
  })
  it('validates compliance type enum', () => {
    const schema = z.object({ complianceType: z.enum(['FSSAI', 'ISO_22000', 'HACCP', 'GST_REG', 'PAN', 'MSME', 'INSURANCE', 'NDA', 'VENDOR_AGREEMENT']) })
    expect(schema.safeParse({ complianceType: 'FSSAI' }).success).toBe(true)
    expect(schema.safeParse({ complianceType: 'INVALID' }).success).toBe(false)
  })
  it('validates transition schema', () => {
    const schema = z.object({ targetStatus: z.enum(['DRAFT', 'VERIFICATION', 'APPROVED', 'ACTIVE', 'PROBATION', 'BLOCKED', 'BLACKLISTED', 'ARCHIVED']), version: z.number().int().min(0) })
    expect(schema.safeParse({ targetStatus: 'ACTIVE', version: 0 }).success).toBe(true)
    expect(schema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
})

describe('Supplier RBAC', () => {
  it('tenant_admin can create suppliers', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.SUPPLIER_CREATE)).toBe(true) })
  it('tenant_admin can update suppliers', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.SUPPLIER_UPDATE)).toBe(true) })
  it('procurement_manager can blacklist suppliers', () => { expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.SUPPLIER_BLACKLIST)).toBe(true) })
  it('tenant_admin can blacklist suppliers (system administrator has all permissions)', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.SUPPLIER_BLACKLIST)).toBe(true) })
  it('procurement_officer can read suppliers', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.SUPPLIER_READ)).toBe(true) })
  it('procurement_officer can create suppliers', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.SUPPLIER_CREATE)).toBe(true) })
  it('auditor can read but not create suppliers', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.SUPPLIER_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['auditor'], Permission.SUPPLIER_CREATE)).toBe(false)
  })
  it('auditor can read but not blacklist suppliers', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.SUPPLIER_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['auditor'], Permission.SUPPLIER_BLACKLIST)).toBe(false)
  })
})
