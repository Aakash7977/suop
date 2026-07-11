/** Supplier Invoice Workflow — 6 states, 8 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type SIStatus = 'DRAFT' | 'PENDING_MATCH' | 'MATCHED' | 'APPROVED' | 'POSTED' | 'CANCELLED'
interface SIEntity extends WorkflowEntity { id: string; status: SIStatus; version: number }
const siWorkflow: WorkflowDefinition<SIStatus, SIEntity> = {
  name: 'SupplierInvoiceLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'PENDING_MATCH', 'MATCHED', 'APPROVED', 'POSTED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'PENDING_MATCH' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'PENDING_MATCH', to: 'MATCHED' },
    { from: 'PENDING_MATCH', to: 'DRAFT' },
    { from: 'MATCHED', to: 'APPROVED' },
    { from: 'MATCHED', to: 'DRAFT' },
    { from: 'APPROVED', to: 'POSTED' },
    { from: 'APPROVED', to: 'CANCELLED' },
  ],
}
try { workflowRegistry.register(siWorkflow) } catch {}
export const SI_WORKFLOW_NAME = 'SupplierInvoiceLifecycle'
export type { SIStatus, SIEntity }
