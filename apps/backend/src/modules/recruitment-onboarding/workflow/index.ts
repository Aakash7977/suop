import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type CandidateStatus = 'NEW' | 'SCREENING' | 'INTERVIEWING' | 'SELECTED' | 'OFFERED' | 'JOINED' | 'REJECTED'
interface CandidateEntity extends WorkflowEntity { id: string; status: CandidateStatus; version: number }
const candidateWorkflow: WorkflowDefinition<CandidateStatus, CandidateEntity> = {
  name: 'CandidateLifecycle', initialState: 'NEW',
  states: ['NEW', 'SCREENING', 'INTERVIEWING', 'SELECTED', 'OFFERED', 'JOINED', 'REJECTED'] as const,
  transitions: [
    { from: 'NEW', to: 'SCREENING' }, { from: 'NEW', to: 'REJECTED' },
    { from: 'SCREENING', to: 'INTERVIEWING' }, { from: 'SCREENING', to: 'REJECTED' },
    { from: 'INTERVIEWING', to: 'SELECTED' }, { from: 'INTERVIEWING', to: 'REJECTED' },
    { from: 'SELECTED', to: 'OFFERED' }, { from: 'SELECTED', to: 'REJECTED' },
    { from: 'OFFERED', to: 'JOINED' }, { from: 'OFFERED', to: 'REJECTED' },
  ],
}
try { workflowRegistry.register(candidateWorkflow) } catch {}
export const CANDIDATE_WORKFLOW_NAME = 'CandidateLifecycle'
export type { CandidateStatus, CandidateEntity }
