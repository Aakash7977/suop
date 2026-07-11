/** Customer Invoice Workflow — 5 states, 6 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type CIStatus = 'DRAFT' | 'POSTED' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED'
interface CIEntity extends WorkflowEntity { id: string; status: CIStatus; version: number }
const ciWorkflow: WorkflowDefinition<CIStatus, CIEntity> = {
  name: 'CustomerInvoiceLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'POSTED', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'POSTED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'POSTED', to: 'PARTIALLY_PAID' },
    { from: 'POSTED', to: 'PAID' },
    { from: 'PARTIALLY_PAID', to: 'PAID' },
    { from: 'POSTED', to: 'CANCELLED' },
  ],
}
try { workflowRegistry.register(ciWorkflow) } catch {}
export const CI_WORKFLOW_NAME = 'CustomerInvoiceLifecycle'
export type { CIStatus, CIEntity }
