/**
 * Organization Module — Unit Tests
 *
 * Tests for workflow, service business rules, and API contract.
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  workflowRegistry,
  type WorkflowEntity,
} from '@/core/workflow'
import '@/modules/organization/workflow'
import {
  ConflictError, BusinessRuleError, ConcurrencyError,
  NotFoundError, AuthorizationError,
} from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

// ─── Workflow Tests ─────────────────────────────────────────────────────────

type OrgStatus = 'DRAFT' | 'CONFIGURED' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

interface OrgEntity extends WorkflowEntity {
  id: string
  status: OrgStatus
  version: number
}

const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Organization Workflow', () => {
  const machine = workflowRegistry.get<OrgStatus, OrgEntity>('OrganizationLifecycle')

  it('allows DRAFT → CONFIGURED transition', async () => {
    const entity: OrgEntity = { id: 't1', status: 'DRAFT', version: 0 }
    const check = await machine.canTransition(entity, 'CONFIGURED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows CONFIGURED → ACTIVE transition', async () => {
    const entity: OrgEntity = { id: 't2', status: 'CONFIGURED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows ACTIVE → SUSPENDED transition', async () => {
    const entity: OrgEntity = { id: 't3', status: 'ACTIVE', version: 0 }
    const check = await machine.canTransition(entity, 'SUSPENDED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows SUSPENDED → ACTIVE transition (reactivation)', async () => {
    const entity: OrgEntity = { id: 't4', status: 'SUSPENDED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows CONFIGURED → DRAFT transition (revert)', async () => {
    const entity: OrgEntity = { id: 't5', status: 'CONFIGURED', version: 0 }
    const check = await machine.canTransition(entity, 'DRAFT', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows ACTIVE → ARCHIVED transition', async () => {
    const entity: OrgEntity = { id: 't6', status: 'ACTIVE', version: 0 }
    const check = await machine.canTransition(entity, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows SUSPENDED → ARCHIVED transition', async () => {
    const entity: OrgEntity = { id: 't7', status: 'SUSPENDED', version: 0 }
    const check = await machine.canTransition(entity, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('rejects DRAFT → ACTIVE transition (must go through CONFIGURED)', async () => {
    const entity: OrgEntity = { id: 't8', status: 'DRAFT', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(false)
  })

  it('rejects ACTIVE → DRAFT transition', async () => {
    const entity: OrgEntity = { id: 't9', status: 'ACTIVE', version: 0 }
    const check = await machine.canTransition(entity, 'DRAFT', wfCtx)
    expect(check.allowed).toBe(false)
  })

  it('rejects ARCHIVED → ACTIVE transition (archived is terminal)', async () => {
    const entity: OrgEntity = { id: 't10', status: 'ARCHIVED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(false)
  })

  it('increments version on transition', async () => {
    const entity: OrgEntity = { id: 't11', status: 'DRAFT', version: 5 }
    const updated = await machine.transition(entity, 'CONFIGURED', wfCtx)
    expect(updated.status).toBe('CONFIGURED')
    expect(updated.version).toBe(6)
  })

  it('lists available transitions from DRAFT', () => {
    const entity: OrgEntity = { id: 't12', status: 'DRAFT', version: 0 }
    const targets = machine.getAvailableTargetStates(entity)
    expect(targets).toContain('CONFIGURED')
    expect(targets).not.toContain('ACTIVE')
    expect(targets).not.toContain('SUSPENDED')
  })

  it('lists available transitions from ACTIVE', () => {
    const entity: OrgEntity = { id: 't13', status: 'ACTIVE', version: 0 }
    const targets = machine.getAvailableTargetStates(entity)
    expect(targets).toContain('SUSPENDED')
    expect(targets).toContain('ARCHIVED')
    expect(targets).not.toContain('DRAFT')
  })
})

// ─── Error Type Tests ───────────────────────────────────────────────────────

describe('Organization Error Types', () => {
  it('ConflictError has 409 status', () => {
    const error = new ConflictError('Duplicate code')
    expect(error.statusCode).toBe(409)
  })

  it('BusinessRuleError with custom code has 422 status', () => {
    const error = new BusinessRuleError('Has children', { code: 'ORG.HAS_CHILDREN' })
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('ORG.HAS_CHILDREN')
  })

  it('BusinessRuleError for FY dates', () => {
    const error = new BusinessRuleError('Invalid dates', { code: 'ORG.FY_INVALID_DATES' })
    expect(error.code).toBe('ORG.FY_INVALID_DATES')
  })

  it('ConcurrencyError has 409 status', () => {
    const error = new ConcurrencyError()
    expect(error.statusCode).toBe(409)
  })

  it('NotFoundError has 404 status', () => {
    const error = new NotFoundError('Company', 'abc-123')
    expect(error.statusCode).toBe(404)
    expect(error.entityId).toBe('abc-123')
  })

  it('AuthorizationError has 403 status', () => {
    const error = new AuthorizationError('Hard delete requires admin')
    expect(error.statusCode).toBe(403)
  })
})

// ─── Schema Tests ───────────────────────────────────────────────────────────

describe('Organization Zod Schemas', () => {
  it('validates a valid company input', () => {
    const schema = z.object({
      code: z.string().min(1).max(50),
      name: z.string().min(1).max(200),
    })
    expect(schema.safeParse({ code: 'SUDHAMRIT', name: 'Sudhamrit' }).success).toBe(true)
  })

  it('rejects empty company code', () => {
    const schema = z.object({ code: z.string().min(1) })
    expect(schema.safeParse({ code: '' }).success).toBe(false)
  })

  it('validates GSTIN format', () => {
    const schema = z.object({
      gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
    })
    expect(schema.safeParse({ gstin: '27AABCS1234M1Z5' }).success).toBe(true)
    expect(schema.safeParse({ gstin: 'invalid' }).success).toBe(false)
  })

  it('validates transition schema', () => {
    const schema = z.object({
      targetStatus: z.enum(['DRAFT', 'CONFIGURED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']),
      version: z.number().int().min(0),
    })
    expect(schema.safeParse({ targetStatus: 'ACTIVE', version: 0 }).success).toBe(true)
    expect(schema.safeParse({ targetStatus: 'INVALID', version: 0 }).success).toBe(false)
  })

  it('validates plant type enum', () => {
    const schema = z.object({
      plantType: z.enum(['MANUFACTURING', 'DISTRIBUTION', 'WAREHOUSE', 'RETAIL', 'RESTAURANT']),
    })
    expect(schema.safeParse({ plantType: 'MANUFACTURING' }).success).toBe(true)
    expect(schema.safeParse({ plantType: 'INVALID' }).success).toBe(false)
  })

  it('validates financial year dates', () => {
    const schema = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    expect(schema.safeParse({ startDate: '2026-04-01T00:00:00Z', endDate: '2027-03-31T00:00:00Z' }).success).toBe(true)
    expect(schema.safeParse({ startDate: 'not-a-date', endDate: '2027-03-31T00:00:00Z' }).success).toBe(false)
  })
})

// ─── RBAC Tests ─────────────────────────────────────────────────────────────

describe('Organization RBAC', () => {
  it('tenant_admin can create companies', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.ORG_CREATE)).toBe(true)
  })

  it('auditor cannot create companies (read-only role)', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.ORG_CREATE)).toBe(false)
  })

  it('warehouse_operator cannot delete companies', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.ORG_DELETE)).toBe(false)
  })

  it('quality_manager cannot create companies', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.ORG_CREATE)).toBe(false)
  })
})
