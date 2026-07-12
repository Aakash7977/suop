/** Journal Entry Workflow — 5 states, 7 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type JEStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REVERSED' | 'CANCELLED'

interface JEEntity extends WorkflowEntity {
  id: string
  status: JEStatus
  version: number
}

const jeWorkflow: WorkflowDefinition<JEStatus, JEEntity> = {
  name: 'JournalEntryLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'REVERSED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'PENDING_APPROVAL' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED' },
    { from: 'PENDING_APPROVAL', to: 'DRAFT' },
    { from: 'APPROVED', to: 'POSTED' },
    { from: 'APPROVED', to: 'CANCELLED' },
    { from: 'POSTED', to: 'REVERSED' },
  ],
}

try { workflowRegistry.register(jeWorkflow) } catch {}

export const JE_WORKFLOW_NAME = 'JournalEntryLifecycle'
export type { JEStatus, JEEntity }
