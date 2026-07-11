/** CAPA Workflow — 7 states, 10 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type CAPAStatus = 'OPEN' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'EFFECTIVENESS_REVIEW' | 'CLOSED'
interface CAPAEntity extends WorkflowEntity { id: string; status: CAPAStatus; version: number }

const capaWorkflow: WorkflowDefinition<CAPAStatus, CAPAEntity> = {
  name: 'QMSCAPALifecycle',
  initialState: 'OPEN',
  states: ['OPEN', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFICATION_PENDING', 'VERIFIED', 'EFFECTIVENESS_REVIEW', 'CLOSED'] as const,
  transitions: [
    { from: 'OPEN', to: 'IN_PROGRESS' },
    { from: 'IN_PROGRESS', to: 'IMPLEMENTED' },
    { from: 'IMPLEMENTED', to: 'VERIFICATION_PENDING' },
    { from: 'VERIFICATION_PENDING', to: 'VERIFIED' },
    { from: 'VERIFICATION_PENDING', to: 'IN_PROGRESS' }, // verification failed, back to implementation
    { from: 'VERIFIED', to: 'EFFECTIVENESS_REVIEW' },
    { from: 'EFFECTIVENESS_REVIEW', to: 'CLOSED' },
    { from: 'EFFECTIVENESS_REVIEW', to: 'IN_PROGRESS' }, // not effective, reopen
    { from: 'VERIFIED', to: 'CLOSED' }, // skip effectiveness for low-risk CAPAs
    { from: 'OPEN', to: 'CLOSED' }, // direct close for minor issues
  ],
}

try { workflowRegistry.register(capaWorkflow) } catch {}
export const QMS_CAPA_WORKFLOW_NAME = 'QMSCAPALifecycle'
export type { CAPAStatus, CAPAEntity }
