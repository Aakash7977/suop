/** Recall Workflow — 7 states, 10 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type RecallStatus = 'INITIATED' | 'APPROVED' | 'IN_PROGRESS' | 'CUSTOMERS_NOTIFIED' | 'RECOVERY_IN_PROGRESS' | 'EFFECTIVENESS_REVIEW' | 'CLOSED'
interface RecallEntity extends WorkflowEntity { id: string; status: RecallStatus; version: number }

const recallWorkflow: WorkflowDefinition<RecallStatus, RecallEntity> = {
  name: 'RecallLifecycle',
  initialState: 'INITIATED',
  states: ['INITIATED', 'APPROVED', 'IN_PROGRESS', 'CUSTOMERS_NOTIFIED', 'RECOVERY_IN_PROGRESS', 'EFFECTIVENESS_REVIEW', 'CLOSED'] as const,
  transitions: [
    { from: 'INITIATED', to: 'APPROVED' },
    { from: 'INITIATED', to: 'CLOSED' }, // cancelled
    { from: 'APPROVED', to: 'IN_PROGRESS' },
    { from: 'APPROVED', to: 'CLOSED' }, // cancelled
    { from: 'IN_PROGRESS', to: 'CUSTOMERS_NOTIFIED' },
    { from: 'CUSTOMERS_NOTIFIED', to: 'RECOVERY_IN_PROGRESS' },
    { from: 'RECOVERY_IN_PROGRESS', to: 'EFFECTIVENESS_REVIEW' },
    { from: 'EFFECTIVENESS_REVIEW', to: 'CLOSED' },
    { from: 'EFFECTIVENESS_REVIEW', to: 'RECOVERY_IN_PROGRESS' }, // not effective, continue
    { from: 'IN_PROGRESS', to: 'EFFECTIVENESS_REVIEW' }, // skip customer notification for internal
  ],
}

try { workflowRegistry.register(recallWorkflow) } catch {}
export const RECALL_WORKFLOW_NAME = 'RecallLifecycle'
export type { RecallStatus, RecallEntity }
