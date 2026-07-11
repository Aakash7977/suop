/**
 * User Management Module — Unit Tests
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/user-management/workflow'
import {
  BusinessRuleError, NotFoundError, ConflictError, AuthorizationError,
} from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type RoleStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED'
interface RoleEntity extends WorkflowEntity { id: string; status: RoleStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Role Lifecycle Workflow', () => {
  const machine = workflowRegistry.get<RoleStatus, RoleEntity>('RoleLifecycle')

  it('allows DRAFT → ACTIVE', async () => {
    const check = await machine.canTransition({ id: '1', status: 'DRAFT', version: 0 }, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })
  it('allows ACTIVE → DEPRECATED', async () => {
    const check = await machine.canTransition({ id: '2', status: 'ACTIVE', version: 0 }, 'DEPRECATED', wfCtx)
    expect(check.allowed).toBe(true)
  })
  it('allows DEPRECATED → ACTIVE (reactivate)', async () => {
    const check = await machine.canTransition({ id: '3', status: 'DEPRECATED', version: 0 }, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })
  it('allows ACTIVE → ARCHIVED', async () => {
    const check = await machine.canTransition({ id: '4', status: 'ACTIVE', version: 0 }, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(true)
  })
  it('allows DEPRECATED → ARCHIVED', async () => {
    const check = await machine.canTransition({ id: '5', status: 'DEPRECATED', version: 0 }, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(true)
  })
  it('rejects DRAFT → ARCHIVED (must activate first)', async () => {
    const check = await machine.canTransition({ id: '6', status: 'DRAFT', version: 0 }, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(false)
  })
  it('rejects ARCHIVED → ACTIVE (terminal)', async () => {
    const check = await machine.canTransition({ id: '7', status: 'ARCHIVED', version: 0 }, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(false)
  })
  it('increments version', async () => {
    const updated = await machine.transition({ id: '8', status: 'DRAFT', version: 5 }, 'ACTIVE', wfCtx)
    expect(updated.version).toBe(6)
  })
})

describe('User Management Error Types', () => {
  it('BusinessRuleError for system role deletion', () => {
    const error = new BusinessRuleError('Cannot delete system role', { code: 'ROLE.SYSTEM_ROLE' })
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('ROLE.SYSTEM_ROLE')
  })
  it('BusinessRuleError for self-delegation', () => {
    const error = new BusinessRuleError('Cannot delegate to self', { code: 'DELEGATION.SELF_DELEGATION' })
    expect(error.code).toBe('DELEGATION.SELF_DELEGATION')
  })
  it('ConflictError for duplicate role', () => {
    const error = new ConflictError('Role already exists')
    expect(error.statusCode).toBe(409)
  })
  it('NotFoundError for missing role', () => {
    const error = new NotFoundError('Role', 'abc-123')
    expect(error.statusCode).toBe(404)
  })
})

describe('User Management Schemas', () => {
  it('role create schema validates', () => {
    const schema = z.object({
      name: z.string().min(2).max(50),
      displayName: z.string().min(1).max(100),
      category: z.enum(['SYSTEM', 'CUSTOM', 'TEMPLATE']).default('CUSTOM'),
    })
    expect(schema.safeParse({ name: 'custom_role', displayName: 'Custom Role' }).success).toBe(true)
    expect(schema.safeParse({ name: 'a', displayName: 'X' }).success).toBe(false)
  })
  it('assignment schema validates entity types', () => {
    const schema = z.object({
      entityType: z.enum(['COMPANY', 'BUSINESS_UNIT', 'REGION', 'PLANT', 'WAREHOUSE', 'DEPARTMENT', 'COST_CENTER', 'PROJECT', 'TEAM']),
    })
    expect(schema.safeParse({ entityType: 'PLANT' }).success).toBe(true)
    expect(schema.safeParse({ entityType: 'INVALID' }).success).toBe(false)
  })
  it('delegation schema validates dates', () => {
    const schema = z.object({
      effectiveFrom: z.string().datetime(),
      effectiveTo: z.string().datetime(),
    })
    expect(schema.safeParse({ effectiveFrom: '2026-01-01T00:00:00Z', effectiveTo: '2026-12-31T00:00:00Z' }).success).toBe(true)
  })
})

describe('User Management RBAC', () => {
  it('tenant_admin can manage users', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.AUTH_MANAGE_USERS)).toBe(true)
  })
  it('tenant_admin can manage roles', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.AUTH_MANAGE_ROLES)).toBe(true)
  })
  it('warehouse_operator cannot manage users', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.AUTH_MANAGE_USERS)).toBe(false)
  })
  it('quality_manager cannot manage roles', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.AUTH_MANAGE_ROLES)).toBe(false)
  })
  it('auditor cannot manage users or roles', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.AUTH_MANAGE_USERS)).toBe(false)
    expect(PermissionChecker.hasPermission(['auditor'], Permission.AUTH_MANAGE_ROLES)).toBe(false)
  })
})
