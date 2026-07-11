/** Batch Manufacturing Workflow — 7 states, 9 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type BatchStatus = 'IN_PRODUCTION' | 'PRODUCED' | 'FGQC_PENDING' | 'PASSED' | 'CONDITIONAL_PASS' | 'REJECTED' | 'ARCHIVED'
interface BatchEntity extends WorkflowEntity { id: string; status: BatchStatus; version: number }

const batchWorkflow: WorkflowDefinition<BatchStatus, BatchEntity> = {
  name: 'ProductionBatchLifecycle',
  initialState: 'IN_PRODUCTION',
  states: ['IN_PRODUCTION', 'PRODUCED', 'FGQC_PENDING', 'PASSED', 'CONDITIONAL_PASS', 'REJECTED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'IN_PRODUCTION', to: 'PRODUCED' },
    { from: 'PRODUCED', to: 'FGQC_PENDING' },
    { from: 'FGQC_PENDING', to: 'PASSED' },
    { from: 'FGQC_PENDING', to: 'CONDITIONAL_PASS' },
    { from: 'FGQC_PENDING', to: 'REJECTED' },
    { from: 'PASSED', to: 'ARCHIVED' },
    { from: 'CONDITIONAL_PASS', to: 'ARCHIVED' },
    { from: 'REJECTED', to: 'ARCHIVED' },
    { from: 'PRODUCED', to: 'IN_PRODUCTION' }, // allow rework
  ],
}

try { workflowRegistry.register(batchWorkflow) } catch {}
export const BATCH_WORKFLOW_NAME = 'ProductionBatchLifecycle'
export type { BatchStatus, BatchEntity }
