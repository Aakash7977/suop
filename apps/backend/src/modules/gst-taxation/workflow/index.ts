/** Tax Return Workflow — 4 states, 4 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type TRStatus = 'DRAFT' | 'READY_TO_FILE' | 'FILED' | 'AMENDED'
interface TREntity extends WorkflowEntity { id: string; status: TRStatus; version: number }
const trWorkflow: WorkflowDefinition<TRStatus, TREntity> = {
  name: 'TaxReturnLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'READY_TO_FILE', 'FILED', 'AMENDED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'READY_TO_FILE' },
    { from: 'READY_TO_FILE', to: 'FILED' },
    { from: 'FILED', to: 'AMENDED' },
    { from: 'AMENDED', to: 'FILED' },
  ],
}
try { workflowRegistry.register(trWorkflow) } catch {}
export const TR_WORKFLOW_NAME = 'TaxReturnLifecycle'
export type { TRStatus, TREntity }
