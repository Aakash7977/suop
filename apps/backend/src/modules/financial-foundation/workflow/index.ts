/** Financial Foundation Journal Entry Workflow — 4 states, 5 transitions
 *
 * Note: The comprehensive JournalEntryLifecycle (6 states, 7 transitions)
 * is registered by the general-ledger module. This simpler workflow is
 * kept for backward compatibility with financial-foundation consumers
 * that only need the basic draft→posted→reversed flow.
 */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type FFJEStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED'
interface FFJEEntity extends WorkflowEntity { id: string; status: FFJEStatus; version: number }
const ffJeWorkflow: WorkflowDefinition<FFJEStatus, FFJEEntity> = {
  name: 'FinancialFoundationJournalEntryLifecycle',
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
try { workflowRegistry.register(ffJeWorkflow) } catch {}
export const FF_JE_WORKFLOW_NAME = 'FinancialFoundationJournalEntryLifecycle'
export type { FFJEStatus, FFJEEntity }
