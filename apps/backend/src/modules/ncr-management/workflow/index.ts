/** NCR Workflow (Extended for QMS) — 8 states, 12 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type NCRStatus = 'OPEN' | 'CONTAINED' | 'ROOT_CAUSE_IDENTIFIED' | 'UNDER_INVESTIGATION' | 'CAPA_INITIATED' | 'DISPOSITIONED' | 'RESOLVED' | 'CLOSED'
interface NCREntity extends WorkflowEntity { id: string; status: NCRStatus; version: number }

const ncrWorkflow: WorkflowDefinition<NCRStatus, NCREntity> = {
  name: 'QMSNCRLifecycle',
  initialState: 'OPEN',
  states: ['OPEN', 'CONTAINED', 'ROOT_CAUSE_IDENTIFIED', 'UNDER_INVESTIGATION', 'CAPA_INITIATED', 'DISPOSITIONED', 'RESOLVED', 'CLOSED'] as const,
  transitions: [
    { from: 'OPEN', to: 'CONTAINED' },
    { from: 'OPEN', to: 'UNDER_INVESTIGATION' },
    { from: 'CONTAINED', to: 'ROOT_CAUSE_IDENTIFIED' },
    { from: 'CONTAINED', to: 'UNDER_INVESTIGATION' },
    { from: 'ROOT_CAUSE_IDENTIFIED', to: 'CAPA_INITIATED' },
    { from: 'ROOT_CAUSE_IDENTIFIED', to: 'DISPOSITIONED' },
    { from: 'UNDER_INVESTIGATION', to: 'ROOT_CAUSE_IDENTIFIED' },
    { from: 'UNDER_INVESTIGATION', to: 'CAPA_INITIATED' },
    { from: 'UNDER_INVESTIGATION', to: 'DISPOSITIONED' },
    { from: 'CAPA_INITIATED', to: 'RESOLVED' },
    { from: 'DISPOSITIONED', to: 'RESOLVED' },
    { from: 'RESOLVED', to: 'CLOSED' },
  ],
}

try { workflowRegistry.register(ncrWorkflow) } catch {}
export const QMS_NCR_WORKFLOW_NAME = 'QMSNCRLifecycle'
export type { NCRStatus, NCREntity }
