/** RMA Workflow — 8 states, 10 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type RMAStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RETURN_RECEIVED' | 'INSPECTION_PENDING' | 'INSPECTED' | 'RESOLVED' | 'CLOSED'
interface RMAEntity extends WorkflowEntity { id: string; status: RMAStatus; version: number }

const rmaWorkflow: WorkflowDefinition<RMAStatus, RMAEntity> = {
  name: 'RMALifecycle',
  initialState: 'REQUESTED',
  states: ['REQUESTED', 'APPROVED', 'REJECTED', 'RETURN_RECEIVED', 'INSPECTION_PENDING', 'INSPECTED', 'RESOLVED', 'CLOSED'] as const,
  transitions: [
    { from: 'REQUESTED', to: 'APPROVED' },
    { from: 'REQUESTED', to: 'REJECTED' },
    { from: 'APPROVED', to: 'RETURN_RECEIVED' },
    { from: 'RETURN_RECEIVED', to: 'INSPECTION_PENDING' },
    { from: 'INSPECTION_PENDING', to: 'INSPECTED' },
    { from: 'INSPECTED', to: 'RESOLVED' },
    { from: 'RESOLVED', to: 'CLOSED' },
    { from: 'REJECTED', to: 'CLOSED' },
    { from: 'INSPECTED', to: 'INSPECTION_PENDING' },
  ],
}

try { workflowRegistry.register(rmaWorkflow) } catch {}
export const RMA_WORKFLOW_NAME = 'RMALifecycle'
export type { RMAStatus, RMAEntity }
