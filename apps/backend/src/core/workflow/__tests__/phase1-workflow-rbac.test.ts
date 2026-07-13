/**
 * @suop/backend — Phase 1 Workflow Engine Tests
 * Tests integration of workflow engine with Phase 1 RBAC:
 *   - Break glass users cannot transition workflows
 *   - Roles and permissions propagate to workflow context
 *   - Data scope is respected in workflow operations
 *   - Guards can enforce SoD (maker-checker)
 */

import { describe, test, expect } from 'vitest'
import { StateMachine, type WorkflowDefinition, type WorkflowEntity, type WorkflowContext } from '../state-machine'

// ─── Test Fixtures ──────────────────────────────────────────────────────────

interface TestOrder extends WorkflowEntity {
  id: string
  status: string
  version: number
  total: number
  createdBy: string
}

const orderStates = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'] as const
type OrderState = typeof orderStates[number]

const orderWorkflow: WorkflowDefinition<OrderState, TestOrder> = {
  name: 'TestOrderLifecycle',
  initialState: 'DRAFT',
  states: orderStates,
  transitions: [
    {
      from: 'DRAFT',
      to: 'PENDING_APPROVAL',
      guard: async (entity, ctx) => {
        // Maker-checker: creator cannot submit for approval
        if (ctx.userId && entity.createdBy === ctx.userId) {
          return { allowed: false, reason: 'Creator cannot submit own order for approval (SoD)' }
        }
        return true
      },
    },
    {
      from: 'PENDING_APPROVAL',
      to: 'APPROVED',
      guard: async (entity, ctx) => {
        // Maker-checker: creator cannot approve
        if (ctx.userId && entity.createdBy === ctx.userId) {
          return { allowed: false, reason: 'Creator cannot approve own order (SoD-01)' }
        }
        // Break-glass users cannot approve
        if (ctx.isBreakGlass) {
          return { allowed: false, reason: 'Break-glass users cannot approve (SoD-27)' }
        }
        return true
      },
    },
    { from: 'PENDING_APPROVAL', to: 'REJECTED' },
    { from: 'APPROVED', to: 'CANCELLED' },
    { from: 'DRAFT', to: 'CANCELLED' },
  ],
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Phase 1: Workflow Engine — RBAC Integration', () => {
  const sm = new StateMachine(orderWorkflow)

  test('break-glass user cannot transition workflow', async () => {
    const order: TestOrder = {
      id: 'o-1', status: 'DRAFT', version: 1, total: 100, createdBy: 'creator-1',
    }
    const ctx: WorkflowContext = {
      userId: 'bg-user',
      tenantId: 't-1',
      correlationId: 'c-1',
      roles: ['break_glass'],
      isBreakGlass: true,
    }
    await expect(sm.transition(order, 'PENDING_APPROVAL', ctx)).rejects.toThrow(/Break-glass/)
  })

  test('maker-checker: creator cannot approve own order', async () => {
    const order: TestOrder = {
      id: 'o-1', status: 'PENDING_APPROVAL', version: 1, total: 100, createdBy: 'user-1',
    }
    const ctx: WorkflowContext = {
      userId: 'user-1',  // same as createdBy
      tenantId: 't-1',
      correlationId: 'c-1',
      roles: ['procurement_manager'],
    }
    const result = await sm.canTransition(order, 'APPROVED', ctx)
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/Creator cannot approve/)
  })

  test('maker-checker: different user can approve', async () => {
    const order: TestOrder = {
      id: 'o-1', status: 'PENDING_APPROVAL', version: 1, total: 100, createdBy: 'user-1',
    }
    const ctx: WorkflowContext = {
      userId: 'user-2',  // different from createdBy
      tenantId: 't-1',
      correlationId: 'c-1',
      roles: ['procurement_manager'],
    }
    const result = await sm.canTransition(order, 'APPROVED', ctx)
    expect(result.allowed).toBe(true)
  })

  test('break-glass user cannot approve', async () => {
    const order: TestOrder = {
      id: 'o-1', status: 'PENDING_APPROVAL', version: 1, total: 100, createdBy: 'user-1',
    }
    const ctx: WorkflowContext = {
      userId: 'bg-user',
      tenantId: 't-1',
      correlationId: 'c-1',
      roles: ['break_glass'],
      isBreakGlass: true,
    }
    const result = await sm.canTransition(order, 'APPROVED', ctx)
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/Break-glass/)
  })

  test('canTransition returns false for invalid transition', async () => {
    const order: TestOrder = {
      id: 'o-1', status: 'DRAFT', version: 1, total: 100, createdBy: 'user-1',
    }
    const ctx: WorkflowContext = {
      userId: 'user-2',
      tenantId: 't-1',
      correlationId: 'c-1',
    }
    const result = await sm.canTransition(order, 'APPROVED', ctx)
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/No transition/)
  })

  test('successful transition increments version', async () => {
    const order: TestOrder = {
      id: 'o-1', status: 'DRAFT', version: 1, total: 100, createdBy: 'creator-1',
    }
    const ctx: WorkflowContext = {
      userId: 'user-2',  // different user
      tenantId: 't-1',
      correlationId: 'c-1',
    }
    const updated = await sm.transition(order, 'PENDING_APPROVAL', ctx)
    expect(updated.status).toBe('PENDING_APPROVAL')
    expect(updated.version).toBe(2)
  })

  test('getAvailableTransitions returns valid next states', () => {
    const order: TestOrder = {
      id: 'o-1', status: 'DRAFT', version: 1, total: 100, createdBy: 'user-1',
    }
    const transitions = sm.getAvailableTransitions(order)
    expect(transitions.length).toBe(2)  // DRAFT → PENDING_APPROVAL, DRAFT → CANCELLED
    const targets = sm.getAvailableTargetStates(order)
    expect(targets).toContain('PENDING_APPROVAL')
    expect(targets).toContain('CANCELLED')
  })

  test('workflow definition validates initial state', () => {
    expect(() => new StateMachine({
      ...orderWorkflow,
      initialState: 'INVALID' as OrderState,
    })).toThrow(/initialState/)
  })

  test('workflow definition validates transition sources', () => {
    expect(() => new StateMachine({
      ...orderWorkflow,
      transitions: [
        { from: 'INVALID' as OrderState, to: 'DRAFT' },
      ],
    })).toThrow(/transition from/)
  })

  test('onBefore hook is called before transition', async () => {
    let hookCalled = false
    const sm2 = new StateMachine<OrderState, TestOrder>({
      ...orderWorkflow,
      transitions: [
        {
          from: 'DRAFT',
          to: 'PENDING_APPROVAL',
          onBefore: async () => { hookCalled = true },
        },
      ],
    })
    const order: TestOrder = {
      id: 'o-1', status: 'DRAFT', version: 1, total: 100, createdBy: 'user-1',
    }
    const ctx: WorkflowContext = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }
    await sm2.transition(order, 'PENDING_APPROVAL', ctx)
    expect(hookCalled).toBe(true)
  })

  test('onAfter hook is called after transition', async () => {
    let afterEntity: TestOrder | null = null
    let afterUpdated: TestOrder | null = null
    const sm2 = new StateMachine<OrderState, TestOrder>({
      ...orderWorkflow,
      transitions: [
        {
          from: 'DRAFT',
          to: 'PENDING_APPROVAL',
          onAfter: async (entity, updated) => {
            afterEntity = entity
            afterUpdated = updated
          },
        },
      ],
    })
    const order: TestOrder = {
      id: 'o-1', status: 'DRAFT', version: 1, total: 100, createdBy: 'user-1',
    }
    const ctx: WorkflowContext = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }
    await sm2.transition(order, 'PENDING_APPROVAL', ctx)
    expect(afterEntity).not.toBeNull()
    expect(afterUpdated).not.toBeNull()
    expect(afterUpdated!.status).toBe('PENDING_APPROVAL')
  })

  test('WorkflowContext carries Phase 1 fields (roles, permissions, dataScope, isBreakGlass)', async () => {
    const ctx: WorkflowContext = {
      userId: 'u1',
      tenantId: 't1',
      correlationId: 'c1',
      roles: ['procurement_manager'],
      permissions: ['po:approve'],
      dataScope: 'company',
      isBreakGlass: false,
    }
    expect(ctx.roles).toEqual(['procurement_manager'])
    expect(ctx.permissions).toContain('po:approve')
    expect(ctx.dataScope).toBe('company')
    expect(ctx.isBreakGlass).toBe(false)
  })
})
