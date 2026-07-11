/**
 * User Management Workflow — Role Lifecycle
 * DRAFT → ACTIVE → DEPRECATED → ARCHIVED
 */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type RoleStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED'
interface RoleEntity extends WorkflowEntity { id: string; status: RoleStatus; version: number }

const roleWorkflow: WorkflowDefinition<RoleStatus, RoleEntity> = {
  name: 'RoleLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'DEPRECATED' },
    { from: 'DEPRECATED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
    { from: 'DEPRECATED', to: 'ARCHIVED' },
  ],
}
try { workflowRegistry.register(roleWorkflow) } catch {}

export const ROLE_WORKFLOW_NAME = 'RoleLifecycle'
