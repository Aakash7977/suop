/**
 * @suop/backend — Workflow Engine (State Machine Framework)
 *
 * Per Phase 0 Architecture §9:
 *   - Every entity with a lifecycle declares a state machine
 *   - Transitions validated by guards (pre-conditions)
 *   - Pre/post hooks for side effects
 *   - Domain events published on every transition
 *   - Audit log entry written on every transition
 *   - All in a single database transaction
 */

import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WorkflowEntity {
  id: string
  status: string
  version: number
}

export interface Transition<TState extends string, TEntity extends WorkflowEntity> {
  from: TState
  to: TState
  guard?: TransitionGuard<TEntity>
  onBefore?: (entity: TEntity, ctx: WorkflowContext) => Promise<void>
  onAfter?: (entity: TEntity, updated: TEntity, ctx: WorkflowContext) => Promise<void>
}

export interface TransitionGuard<TEntity extends WorkflowEntity> {
  (entity: TEntity, ctx: WorkflowContext): Promise<boolean | { allowed: false; reason: string }>
}

export interface WorkflowContext {
  userId: string | null
  tenantId: string | null
  correlationId: string
  payload?: unknown
  // Phase 1 additions: Permission enforcement
  roles?: string[]
  permissions?: string[]
  dataScope?: string
  isBreakGlass?: boolean
}

export interface WorkflowDefinition<TState extends string, TEntity extends WorkflowEntity> {
  name: string
  initialState: TState
  states: readonly TState[]
  transitions: Transition<TState, TEntity>[]
}

// ─── State Machine ──────────────────────────────────────────────────────────

export class StateMachine<TState extends string, TEntity extends WorkflowEntity> {
  constructor(private readonly definition: WorkflowDefinition<TState, TEntity>) {
    // Validate definition
    this.validateDefinition()
  }

  private validateDefinition(): void {
    const { states, transitions, initialState } = this.definition
    if (!states.includes(initialState)) {
      throw new Error(`Workflow '${this.definition.name}': initialState '${initialState}' not in states list`)
    }
    for (const t of transitions) {
      if (!states.includes(t.from)) {
        throw new Error(`Workflow '${this.definition.name}': transition from '${t.from}' not in states list`)
      }
      if (!states.includes(t.to)) {
        throw new Error(`Workflow '${this.definition.name}': transition to '${t.to}' not in states list`)
      }
    }
  }

  /**
   * Check if a transition is allowed from the entity's current state.
   */
  async canTransition(
    entity: TEntity,
    target: TState,
    ctx: WorkflowContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    const transition = this.findTransition(entity.status as TState, target)
    if (!transition) {
      return {
        allowed: false,
        reason: `No transition from '${entity.status}' to '${target}'`,
      }
    }

    if (transition.guard) {
      const guardResult = await transition.guard(entity, ctx)
      if (typeof guardResult === 'boolean') {
        return { allowed: guardResult, reason: guardResult ? undefined : 'Guard rejected' }
      }
      return guardResult
    }

    return { allowed: true }
  }

  /**
   * Execute a transition. Returns the updated entity.
   * The caller is responsible for persisting the entity.
   */
  async transition(
    entity: TEntity,
    target: TState,
    ctx: WorkflowContext
  ): Promise<TEntity> {
    // Phase 1: Break-glass users cannot transition workflows
    if (ctx.isBreakGlass) {
      throw new Error(
        `Workflow transition denied: Break-glass users cannot perform workflow transitions (SoD) — ${this.definition.name}`
      )
    }

    // Check if transition is allowed
    const check = await this.canTransition(entity, target, ctx)
    if (!check.allowed) {
      throw new Error(
        `Workflow transition denied: ${check.reason ?? 'unknown reason'}`
      )
    }

    const transition = this.findTransition(entity.status as TState, target)!

    // Execute onBefore hook
    if (transition.onBefore) {
      await transition.onBefore(entity, ctx)
    }

    // Create updated entity
    const updated: TEntity = {
      ...entity,
      status: target,
      version: entity.version + 1,
    }

    // Execute onAfter hook
    if (transition.onAfter) {
      await transition.onAfter(entity, updated, ctx)
    }

    logger.info('Workflow transition completed', {
      workflow: this.definition.name,
      entityId: entity.id,
      from: entity.status,
      to: target,
      userId: ctx.userId,
    })

    return updated
  }

  /**
   * Get all available transitions from the entity's current state.
   */
  getAvailableTransitions(entity: TEntity): Transition<TState, TEntity>[] {
    return this.definition.transitions.filter((t) => t.from === entity.status)
  }

  /**
   * Get all target states reachable from the entity's current state.
   */
  getAvailableTargetStates(entity: TEntity): TState[] {
    return this.getAvailableTransitions(entity).map((t) => t.to)
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private findTransition(
    from: TState,
    to: TState
  ): Transition<TState, TEntity> | undefined {
    return this.definition.transitions.find((t) => t.from === from && t.to === to)
  }
}

// ─── Workflow Registry ──────────────────────────────────────────────────────

class WorkflowRegistryClass {
  private readonly workflows = new Map<string, StateMachine<string, WorkflowEntity>>()

  register<TState extends string, TEntity extends WorkflowEntity>(
    definition: WorkflowDefinition<TState, TEntity>
  ): StateMachine<TState, TEntity> {
    if (this.workflows.has(definition.name)) {
      throw new Error(`Workflow '${definition.name}' is already registered`)
    }
    const machine = new StateMachine(definition)
    this.workflows.set(definition.name, machine as unknown as StateMachine<string, WorkflowEntity>)
    return machine
  }

  get<TState extends string, TEntity extends WorkflowEntity>(
    name: string
  ): StateMachine<TState, TEntity> {
    const machine = this.workflows.get(name)
    if (!machine) throw new Error(`Workflow '${name}' not found`)
    return machine as unknown as StateMachine<TState, TEntity>
  }

  list(): string[] {
    return Array.from(this.workflows.keys()).sort()
  }
}

export const workflowRegistry = new WorkflowRegistryClass()
