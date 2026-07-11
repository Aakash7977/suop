/** RFQ Workflow — Lifecycle state machine */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type RfqStatus = 'DRAFT' | 'SUBMITTED' | 'SENT' | 'SUPPLIER_RESPONSE' | 'EVALUATION' | 'AWARDED' | 'CLOSED' | 'CANCELLED'
interface RfqEntity extends WorkflowEntity { id: string; status: RfqStatus; version: number }

const rfqWorkflow: WorkflowDefinition<RfqStatus, RfqEntity> = {
  name: 'RfqLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'SUBMITTED', 'SENT', 'SUPPLIER_RESPONSE', 'EVALUATION', 'AWARDED', 'CLOSED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'SUBMITTED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'SUBMITTED', to: 'SENT' },
    { from: 'SUBMITTED', to: 'CANCELLED' },
    { from: 'SENT', to: 'SUPPLIER_RESPONSE' },
    { from: 'SENT', to: 'CANCELLED' },
    { from: 'SUPPLIER_RESPONSE', to: 'EVALUATION' },
    { from: 'SUPPLIER_RESPONSE', to: 'CANCELLED' },
    { from: 'EVALUATION', to: 'AWARDED' },
    { from: 'EVALUATION', to: 'CANCELLED' },
    { from: 'AWARDED', to: 'CLOSED' },
    { from: 'SENT', to: 'CLOSED' }, // no responses
    { from: 'SUPPLIER_RESPONSE', to: 'CLOSED' },
    { from: 'EVALUATION', to: 'CLOSED' }, // no award
  ],
}
try { workflowRegistry.register(rfqWorkflow) } catch {}

export const RFQ_WORKFLOW_NAME = 'RfqLifecycle'
