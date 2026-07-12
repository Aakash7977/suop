import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type ComplaintStatus = 'REGISTERED' | 'UNDER_INVESTIGATION' | 'ROOT_CAUSE_IDENTIFIED' | 'RESOLUTION_PENDING' | 'RESOLVED' | 'CLOSED' | 'REJECTED'
interface ComplaintEntity extends WorkflowEntity { id: string; status: ComplaintStatus; version: number }
const complaintWorkflow: WorkflowDefinition<ComplaintStatus, ComplaintEntity> = {
  name: 'ComplaintLifecycle', initialState: 'REGISTERED',
  states: ['REGISTERED', 'UNDER_INVESTIGATION', 'ROOT_CAUSE_IDENTIFIED', 'RESOLUTION_PENDING', 'RESOLVED', 'CLOSED', 'REJECTED'] as const,
  transitions: [
    { from: 'REGISTERED', to: 'UNDER_INVESTIGATION' }, { from: 'REGISTERED', to: 'REJECTED' },
    { from: 'UNDER_INVESTIGATION', to: 'ROOT_CAUSE_IDENTIFIED' }, { from: 'UNDER_INVESTIGATION', to: 'RESOLUTION_PENDING' },
    { from: 'ROOT_CAUSE_IDENTIFIED', to: 'RESOLUTION_PENDING' }, { from: 'RESOLUTION_PENDING', to: 'RESOLVED' },
    { from: 'RESOLVED', to: 'CLOSED' }, { from: 'REJECTED', to: 'CLOSED' },
  ],
}
try { workflowRegistry.register(complaintWorkflow) } catch {}
export const COMPLAINT_WORKFLOW_NAME = 'ComplaintLifecycle'
export type { ComplaintStatus, ComplaintEntity }
