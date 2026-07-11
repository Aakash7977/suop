/** Goods Receipt Workflow — 8 states, 12 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type GRNStatus = 'DRAFT' | 'VERIFIED' | 'UNDER_INSPECTION' | 'PARTIALLY_ACCEPTED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED' | 'CANCELLED'
interface GRNEntity extends WorkflowEntity { id: string; status: GRNStatus; version: number }

const grnWorkflow: WorkflowDefinition<GRNStatus, GRNEntity> = {
  name: 'GoodsReceiptLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'VERIFIED', 'UNDER_INSPECTION', 'PARTIALLY_ACCEPTED', 'ACCEPTED', 'REJECTED', 'CLOSED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'VERIFIED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'VERIFIED', to: 'UNDER_INSPECTION' },
    { from: 'VERIFIED', to: 'ACCEPTED' }, // skip inspection if not required
    { from: 'VERIFIED', to: 'CANCELLED' },
    { from: 'UNDER_INSPECTION', to: 'ACCEPTED' },
    { from: 'UNDER_INSPECTION', to: 'PARTIALLY_ACCEPTED' },
    { from: 'UNDER_INSPECTION', to: 'REJECTED' },
    { from: 'PARTIALLY_ACCEPTED', to: 'CLOSED' },
    { from: 'ACCEPTED', to: 'CLOSED' },
    { from: 'REJECTED', to: 'CLOSED' },
    { from: 'REJECTED', to: 'DRAFT' }, // allow re-inspection
  ],
}

try { workflowRegistry.register(grnWorkflow) } catch {}
export const GRN_WORKFLOW_NAME = 'GoodsReceiptLifecycle'
export type { GRNStatus, GRNEntity }
