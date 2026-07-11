/**
 * Auth Workflow — User Lifecycle State Machine
 *
 * INVITED → ACTIVATED → ACTIVE → LOCKED → DISABLED → ARCHIVED
 */

import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type UserStatus = 'INVITED' | 'ACTIVATED' | 'ACTIVE' | 'LOCKED' | 'DISABLED' | 'ARCHIVED'

interface UserEntity extends WorkflowEntity {
  id: string
  status: UserStatus
  version: number
}

const userWorkflow: WorkflowDefinition<UserStatus, UserEntity> = {
  name: 'UserLifecycle',
  initialState: 'INVITED',
  states: ['INVITED', 'ACTIVATED', 'ACTIVE', 'LOCKED', 'DISABLED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'INVITED', to: 'ACTIVATED' },
    { from: 'ACTIVATED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'LOCKED' },
    { from: 'LOCKED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'DISABLED' },
    { from: 'LOCKED', to: 'DISABLED' },
    { from: 'DISABLED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
    { from: 'DISABLED', to: 'ARCHIVED' },
    { from: 'LOCKED', to: 'ARCHIVED' },
  ],
}

try { workflowRegistry.register(userWorkflow) } catch { /* already registered */ }

export const USER_WORKFLOW_NAME = 'UserLifecycle'
export type { UserStatus, UserEntity }
