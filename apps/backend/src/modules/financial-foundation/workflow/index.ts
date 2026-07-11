/** Journal Entry Workflow — 4 states, 5 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type JEStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED'
interface JEEntity extends WorkflowEntity { id: string; status: JEStatus; version: number }
const jeWorkflow: WorkflowDefinition<JEStatus, JEEntity> = {
  name: 'JournalEntryLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'POSTED', 'REVERSED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'POSTED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'POSTED', to: 'REVERSED' },
    { from: 'REVERSED', to: 'CANCELLED' },
    { from: 'POSTED', to: 'CANCELLED' },
  ],
}
try { workflowRegistry.register(jeWorkflow) } catch {}
export const JE_WORKFLOW_NAME = 'JournalEntryLifecycle'
export type { JEStatus, JEEntity }
