/** Sales Order Workflow — 14 states, 20 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type SOStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RESERVED' | 'WAVE_PLANNED' | 'PICKING' | 'PICKED' | 'PACKING' | 'PACKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'
interface SOEntity extends WorkflowEntity { id: string; status: SOStatus; version: number }

const soWorkflow: WorkflowDefinition<SOStatus, SOEntity> = {
  name: 'SalesOrderLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'RESERVED', 'WAVE_PLANNED', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'PENDING_APPROVAL' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED' },
    { from: 'PENDING_APPROVAL', to: 'DRAFT' },
    { from: 'PENDING_APPROVAL', to: 'CANCELLED' },
    { from: 'APPROVED', to: 'RESERVED' },
    { from: 'APPROVED', to: 'CANCELLED' },
    { from: 'RESERVED', to: 'WAVE_PLANNED' },
    { from: 'WAVE_PLANNED', to: 'PICKING' },
    { from: 'PICKING', to: 'PICKED' },
    { from: 'PICKED', to: 'PACKING' },
    { from: 'PACKING', to: 'PACKED' },
    { from: 'PACKED', to: 'DISPATCHED' },
    { from: 'DISPATCHED', to: 'IN_TRANSIT' },
    { from: 'IN_TRANSIT', to: 'DELIVERED' },
    { from: 'DELIVERED', to: 'COMPLETED' },
    { from: 'RESERVED', to: 'CANCELLED' },
    { from: 'WAVE_PLANNED', to: 'CANCELLED' },
    { from: 'PICKED', to: 'CANCELLED' },
    { from: 'PACKED', to: 'CANCELLED' },
  ],
}

try { workflowRegistry.register(soWorkflow) } catch {}
export const SALES_ORDER_WORKFLOW_NAME = 'SalesOrderLifecycle'
export type { SOStatus, SOEntity }
