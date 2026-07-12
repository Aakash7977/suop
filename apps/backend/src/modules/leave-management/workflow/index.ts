import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'TAKEN'
interface LeaveEntity extends WorkflowEntity { id: string; status: LeaveStatus; version: number }
const leaveWorkflow: WorkflowDefinition<LeaveStatus, LeaveEntity> = {
  name: 'LeaveApplicationLifecycle', initialState: 'PENDING',
  states: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'] as const,
  transitions: [
    { from: 'PENDING', to: 'APPROVED' }, { from: 'PENDING', to: 'REJECTED' },
    { from: 'PENDING', to: 'CANCELLED' }, { from: 'APPROVED', to: 'TAKEN' },
    { from: 'APPROVED', to: 'CANCELLED' }, { from: 'APPROVED', to: 'PENDING' },
    { from: 'REJECTED', to: 'PENDING' },
  ],
}
try { workflowRegistry.register(leaveWorkflow) } catch {}
export const LEAVE_WORKFLOW_NAME = 'LeaveApplicationLifecycle'
export type { LeaveStatus, LeaveEntity }
