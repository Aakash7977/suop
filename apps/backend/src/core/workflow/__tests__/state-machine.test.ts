import { describe, it, expect, beforeEach } from 'vitest'
import { StateMachine, workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '../state-machine'

// ─── Test Workflow ──────────────────────────────────────────────────────────

type TestState = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

interface TestEntity extends WorkflowEntity {
  id: string
  status: TestState
  version: number
  title: string
}

const testWorkflow: WorkflowDefinition<TestState, TestEntity> = {
  name: 'TestApproval',
  initialState: 'DRAFT',
  states: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'SUBMITTED', onAfter: async () => {} },
    { from: 'SUBMITTED', to: 'APPROVED', guard: async (e) => e.title.length > 0 },
    { from: 'SUBMITTED', to: 'REJECTED' },
    { from: 'SUBMITTED', to: 'CANCELLED' },
    { from: 'DRAFT', to: 'CANCELLED' },
  ],
}

const ctx = { userId: 'user-1', tenantId: 'tenant-1', correlationId: 'corr-1' }

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('StateMachine', () => {
  let machine: StateMachine<TestState, TestEntity>

  beforeEach(() => {
    machine = new StateMachine(testWorkflow)
  })

  it('validates definition at construction', () => {
    expect(() => new StateMachine({
      ...testWorkflow,
      initialState: 'INVALID' as TestState,
    })).toThrow(/initialState.*not in states/)
  })

  it('detects available transitions from current state', () => {
    const entity: TestEntity = { id: '1', status: 'DRAFT', version: 0, title: 'Test' }
    const targets = machine.getAvailableTargetStates(entity)
    expect(targets).toContain('SUBMITTED')
    expect(targets).toContain('CANCELLED')
    expect(targets).not.toContain('APPROVED')
  })

  it('canTransition returns true for valid transition', async () => {
    const entity: TestEntity = { id: '1', status: 'DRAFT', version: 0, title: 'Test' }
    const check = await machine.canTransition(entity, 'SUBMITTED', ctx)
    expect(check.allowed).toBe(true)
  })

  it('canTransition returns false for invalid transition', async () => {
    const entity: TestEntity = { id: '1', status: 'DRAFT', version: 0, title: 'Test' }
    const check = await machine.canTransition(entity, 'APPROVED', ctx)
    expect(check.allowed).toBe(false)
    expect(check.reason).toContain('No transition')
  })

  it('guard rejects transition when condition not met', async () => {
    const entity: TestEntity = { id: '1', status: 'SUBMITTED', version: 0, title: '' }
    const check = await machine.canTransition(entity, 'APPROVED', ctx)
    expect(check.allowed).toBe(false)
  })

  it('guard allows transition when condition met', async () => {
    const entity: TestEntity = { id: '1', status: 'SUBMITTED', version: 0, title: 'Has Title' }
    const check = await machine.canTransition(entity, 'APPROVED', ctx)
    expect(check.allowed).toBe(true)
  })

  it('transition returns updated entity with new state and incremented version', async () => {
    const entity: TestEntity = { id: '1', status: 'DRAFT', version: 0, title: 'Test' }
    const updated = await machine.transition(entity, 'SUBMITTED', ctx)
    expect(updated.status).toBe('SUBMITTED')
    expect(updated.version).toBe(1)
  })

  it('transition throws for invalid transition', async () => {
    const entity: TestEntity = { id: '1', status: 'DRAFT', version: 0, title: 'Test' }
    await expect(machine.transition(entity, 'APPROVED', ctx)).rejects.toThrow(/transition denied/)
  })
})

describe('WorkflowRegistry', () => {
  it('registers and retrieves a workflow', () => {
    workflowRegistry.register(testWorkflow)
    const retrieved = workflowRegistry.get<TestState, TestEntity>('TestApproval')
    expect(retrieved).toBeDefined()
  })

  it('throws when registering duplicate workflow', () => {
    expect(() => workflowRegistry.register(testWorkflow)).toThrow(/already registered/)
  })

  it('throws when getting unknown workflow', () => {
    expect(() => workflowRegistry.get('UnknownWorkflow')).toThrow(/not found/)
  })

  it('lists registered workflows', () => {
    const list = workflowRegistry.list()
    expect(list).toContain('TestApproval')
  })
})
