/** Production Order Workflow — 12 states, 18 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type POStatus = 'DRAFT' | 'RELEASED' | 'MATERIAL_RESERVED' | 'MATERIAL_ISSUED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FGQC_PENDING' | 'RELEASED_TO_INVENTORY' | 'CLOSED' | 'REJECTED' | 'CANCELLED'
interface POEntity extends WorkflowEntity { id: string; status: POStatus; version: number }

const poWorkflow: WorkflowDefinition<POStatus, POEntity> = {
  name: 'ProductionOrderLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'RELEASED', 'MATERIAL_RESERVED', 'MATERIAL_ISSUED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'FGQC_PENDING', 'RELEASED_TO_INVENTORY', 'CLOSED', 'REJECTED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'RELEASED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'RELEASED', to: 'MATERIAL_RESERVED' },
    { from: 'RELEASED', to: 'CANCELLED' },
    { from: 'MATERIAL_RESERVED', to: 'MATERIAL_ISSUED' },
    { from: 'MATERIAL_RESERVED', to: 'CANCELLED' },
    { from: 'MATERIAL_ISSUED', to: 'IN_PROGRESS' },
    { from: 'MATERIAL_ISSUED', to: 'CANCELLED' },
    { from: 'IN_PROGRESS', to: 'PAUSED' },
    { from: 'IN_PROGRESS', to: 'COMPLETED' },
    { from: 'PAUSED', to: 'IN_PROGRESS' },
    { from: 'PAUSED', to: 'CANCELLED' },
    { from: 'COMPLETED', to: 'FGQC_PENDING' },
    { from: 'FGQC_PENDING', to: 'RELEASED_TO_INVENTORY' },
    { from: 'FGQC_PENDING', to: 'REJECTED' },
    { from: 'RELEASED_TO_INVENTORY', to: 'CLOSED' },
    { from: 'REJECTED', to: 'CLOSED' },
    { from: 'COMPLETED', to: 'CLOSED' },
  ],
}

try { workflowRegistry.register(poWorkflow) } catch {}
export const PRODUCTION_ORDER_WORKFLOW_NAME = 'ProductionOrderLifecycle'
export type { POStatus, POEntity }
