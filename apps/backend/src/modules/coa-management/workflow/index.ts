/** COA Workflow — 5 states, 6 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type COAStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SIGNED' | 'SUPERSEDED'
interface COAEntity extends WorkflowEntity { id: string; status: COAStatus; version: number }

const coaWorkflow: WorkflowDefinition<COAStatus, COAEntity> = {
  name: 'COALifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SIGNED', 'SUPERSEDED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'PENDING_APPROVAL' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED' },
    { from: 'PENDING_APPROVAL', to: 'DRAFT' }, // returned for revision
    { from: 'APPROVED', to: 'SIGNED' },
    { from: 'SIGNED', to: 'SUPERSEDED' }, // new version created
    { from: 'APPROVED', to: 'SUPERSEDED' },
  ],
}

try { workflowRegistry.register(coaWorkflow) } catch {}
export const QMS_COA_WORKFLOW_NAME = 'COALifecycle'
export type { COAStatus, COAEntity }
