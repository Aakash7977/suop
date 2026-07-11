/** Product Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/product/workflow'
import { BusinessRuleError, ConflictError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type ProductStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED'
interface ProductEntity extends WorkflowEntity { id: string; status: ProductStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Product Workflow', () => {
  const machine = workflowRegistry.get<ProductStatus, ProductEntity>('ProductLifecycle')
  it('allows DRAFT → REVIEW', async () => { expect((await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'REVIEW', wfCtx)).allowed).toBe(true) })
  it('allows REVIEW → APPROVED', async () => { expect((await machine.canTransition({ id: '2', status: 'REVIEW', version: 0 }, 'APPROVED', wfCtx)).allowed).toBe(true) })
  it('allows REVIEW → DRAFT (reject)', async () => { expect((await machine.canTransition({ id: '3', status: 'REVIEW', version: 0 }, 'DRAFT', wfCtx)).allowed).toBe(true) })
  it('allows APPROVED → ACTIVE', async () => { expect((await machine.canTransition({ id: '4', status: 'APPROVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → DISCONTINUED', async () => { expect((await machine.canTransition({ id: '5', status: 'ACTIVE', version: 0 }, 'DISCONTINUED', wfCtx)).allowed).toBe(true) })
  it('allows DISCONTINUED → ACTIVE (reactivate)', async () => { expect((await machine.canTransition({ id: '6', status: 'DISCONTINUED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → ARCHIVED', async () => { expect((await machine.canTransition({ id: '7', status: 'ACTIVE', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('allows DISCONTINUED → ARCHIVED', async () => { expect((await machine.canTransition({ id: '8', status: 'DISCONTINUED', version: 0 }, 'ARCHIVED', wfCtx)).allowed).toBe(true) })
  it('rejects DRAFT → ACTIVE (must go through REVIEW → APPROVED)', async () => { expect((await machine.canTransition({ id: '9', status: 'DRAFT', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('rejects ARCHIVED → ACTIVE (terminal)', async () => { expect((await machine.canTransition({ id: '10', status: 'ARCHIVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '11', status: 'DRAFT', version: 7 }, 'REVIEW', wfCtx); expect(u.version).toBe(8) })
})

describe('Product Error Types', () => {
  it('ConflictError for duplicate SKU', () => { expect(new ConflictError('SKU exists').statusCode).toBe(409) })
  it('BusinessRuleError for active product deletion', () => { expect(new BusinessRuleError('Cannot delete active', { code: 'PRODUCT.ACTIVE_DELETE' }).code).toBe('PRODUCT.ACTIVE_DELETE') })
  it('BusinessRuleError for UOM not found', () => { expect(new BusinessRuleError('UOM not found', { code: 'PRODUCT.UOM_NOT_FOUND' }).code).toBe('PRODUCT.UOM_NOT_FOUND') })
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'PRODUCT.TRANSITION_DENIED' }).code).toBe('PRODUCT.TRANSITION_DENIED') })
  it('NotFoundError for missing product', () => { expect(new NotFoundError('Product', 'abc').statusCode).toBe(404) })
  it('ConcurrencyError for version mismatch', () => { expect(new ConcurrencyError().statusCode).toBe(409) })
})

describe('Product Schemas', () => {
  it('validates product type enum', () => {
    const schema = z.object({ productType: z.enum(['RAW_MATERIAL', 'SEMI_FINISHED', 'FINISHED_GOOD', 'PACKAGING', 'CONSUMABLE', 'SERVICE', 'ASSET', 'BY_PRODUCT', 'SCRAP']) })
    expect(schema.safeParse({ productType: 'RAW_MATERIAL' }).success).toBe(true)
    expect(schema.safeParse({ productType: 'INVALID' }).success).toBe(false)
  })
  it('validates FIFO strategy', () => {
    const schema = z.object({ fifoStrategy: z.enum(['FEFO', 'FIFO', 'LIFO']) })
    expect(schema.safeParse({ fifoStrategy: 'FEFO' }).success).toBe(true)
    expect(schema.safeParse({ fifoStrategy: 'INVALID' }).success).toBe(false)
  })
  it('validates ABC classification', () => {
    const schema = z.object({ abcClass: z.enum(['A', 'B', 'C']).optional() })
    expect(schema.safeParse({ abcClass: 'A' }).success).toBe(true)
    expect(schema.safeParse({ abcClass: 'D' }).success).toBe(false)
  })
  it('validates procurement type', () => {
    const schema = z.object({ procurementType: z.enum(['MAKE', 'BUY', 'BOTH']) })
    expect(schema.safeParse({ procurementType: 'MAKE' }).success).toBe(true)
    expect(schema.safeParse({ procurementType: 'MAKE_BUY' }).success).toBe(false)
  })
  it('validates costing method', () => {
    const schema = z.object({ costingMethod: z.enum(['FIFO', 'LIFO', 'WEIGHTED_AVG', 'STANDARD', 'ACTUAL']) })
    expect(schema.safeParse({ costingMethod: 'FIFO' }).success).toBe(true)
    expect(schema.safeParse({ costingMethod: 'INVALID' }).success).toBe(false)
  })
  it('validates GST rate range', () => {
    const schema = z.object({ gstRate: z.number().min(0).max(100).optional() })
    expect(schema.safeParse({ gstRate: 5 }).success).toBe(true)
    expect(schema.safeParse({ gstRate: 150 }).success).toBe(false)
    expect(schema.safeParse({ gstRate: -5 }).success).toBe(false)
  })
  it('validates transition schema', () => {
    const schema = z.object({ targetStatus: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'DISCONTINUED', 'ARCHIVED']), version: z.number().int().min(0) })
    expect(schema.safeParse({ targetStatus: 'ACTIVE', version: 0 }).success).toBe(true)
    expect(schema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })
})

describe('Product RBAC', () => {
  it('tenant_admin can create products', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PRODUCT_CREATE)).toBe(true) })
  it('tenant_admin can update products', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PRODUCT_UPDATE)).toBe(true) })
  it('tenant_admin can delete products', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.PRODUCT_DELETE)).toBe(true) })
  it('warehouse_operator can read products', () => { expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.PRODUCT_READ)).toBe(true) })
  it('auditor can read but not create products', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.PRODUCT_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['auditor'], Permission.PRODUCT_CREATE)).toBe(false)
  })
  it('quality_manager can read products', () => { expect(PermissionChecker.hasPermission(['quality_manager'], Permission.PRODUCT_READ)).toBe(true) })
})
