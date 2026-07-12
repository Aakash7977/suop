import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type AppraisalStatus = 'DRAFT' | 'SELF_ASSESSMENT' | 'MANAGER_REVIEW' | 'CALIBRATION' | 'FINALIZED' | 'CLOSED'
interface AppraisalEntity extends WorkflowEntity { id: string; status: AppraisalStatus; version: number }
const appraisalWorkflow: WorkflowDefinition<AppraisalStatus, AppraisalEntity> = {
  name: 'AppraisalLifecycle', initialState: 'DRAFT',
  states: ['DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'FINALIZED', 'CLOSED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'SELF_ASSESSMENT' },
    { from: 'SELF_ASSESSMENT', to: 'MANAGER_REVIEW' },
    { from: 'MANAGER_REVIEW', to: 'CALIBRATION' },
    { from: 'MANAGER_REVIEW', to: 'SELF_ASSESSMENT' },
    { from: 'CALIBRATION', to: 'FINALIZED' },
    { from: 'FINALIZED', to: 'CLOSED' },
  ],
}
try { workflowRegistry.register(appraisalWorkflow) } catch {}
export const APPRAISAL_WORKFLOW_NAME = 'AppraisalLifecycle'
export type { AppraisalStatus, AppraisalEntity }
