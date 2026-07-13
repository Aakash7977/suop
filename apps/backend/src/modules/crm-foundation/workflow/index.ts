/** CRM Activity Lifecycle Workflow — 5 states, 6 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type CrmActivityStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
interface CrmActivityEntity extends WorkflowEntity { id: string; status: CrmActivityStatus; version: number }

const crmActivityWorkflow: WorkflowDefinition<CrmActivityStatus, CrmActivityEntity> = {
  name: 'CrmActivityLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'IN_PROGRESS' },
    { from: 'IN_PROGRESS', to: 'COMPLETED' },
    { from: 'IN_PROGRESS', to: 'CANCELLED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'COMPLETED', to: 'ARCHIVED' },
    { from: 'CANCELLED', to: 'ARCHIVED' },
  ],
}

try { workflowRegistry.register(crmActivityWorkflow) } catch {}

export const CRM_ACTIVITY_WORKFLOW_NAME = 'CrmActivityLifecycle'
export type { CrmActivityStatus, CrmActivityEntity }
