/** FGQC Workflow — 6 states, 8 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type FGQCStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'CONDITIONAL_PASS' | 'FAILED' | 'ON_HOLD'
interface FGQCEntity extends WorkflowEntity { id: string; status: FGQCStatus; version: number }

const fgqcWorkflow: WorkflowDefinition<FGQCStatus, FGQCEntity> = {
  name: 'FGQCLifecycle',
  initialState: 'PENDING',
  states: ['PENDING', 'IN_PROGRESS', 'PASSED', 'CONDITIONAL_PASS', 'FAILED', 'ON_HOLD'] as const,
  transitions: [
    { from: 'PENDING', to: 'IN_PROGRESS' },
    { from: 'PENDING', to: 'ON_HOLD' },
    { from: 'IN_PROGRESS', to: 'PASSED' },
    { from: 'IN_PROGRESS', to: 'CONDITIONAL_PASS' },
    { from: 'IN_PROGRESS', to: 'FAILED' },
    { from: 'IN_PROGRESS', to: 'ON_HOLD' },
    { from: 'ON_HOLD', to: 'IN_PROGRESS' },
    { from: 'CONDITIONAL_PASS', to: 'PASSED' },
  ],
}

try { workflowRegistry.register(fgqcWorkflow) } catch {}
export const FGQC_WORKFLOW_NAME = 'FGQCLifecycle'
export type { FGQCStatus, FGQCEntity }
