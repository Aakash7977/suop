/** NCR Workflow — 5 states, 6 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type NCRStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CAPA_INITIATED' | 'RESOLVED' | 'CLOSED'
interface NCREntity extends WorkflowEntity { id: string; status: NCRStatus; version: number }

const ncrWorkflow: WorkflowDefinition<NCRStatus, NCREntity> = {
  name: 'NCRLifecycle',
  initialState: 'OPEN',
  states: ['OPEN', 'UNDER_INVESTIGATION', 'CAPA_INITIATED', 'RESOLVED', 'CLOSED'] as const,
  transitions: [
    { from: 'OPEN', to: 'UNDER_INVESTIGATION' },
    { from: 'UNDER_INVESTIGATION', to: 'CAPA_INITIATED' },
    { from: 'UNDER_INVESTIGATION', to: 'RESOLVED' },
    { from: 'CAPA_INITIATED', to: 'RESOLVED' },
    { from: 'RESOLVED', to: 'CLOSED' },
    { from: 'OPEN', to: 'CLOSED' }, // direct close for minor issues
  ],
}

try { workflowRegistry.register(ncrWorkflow) } catch {}
export const NCR_WORKFLOW_NAME = 'NCRLifecycle'
export type { NCRStatus, NCREntity }
