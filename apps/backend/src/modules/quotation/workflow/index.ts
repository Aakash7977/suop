/** Quotation Workflow — Lifecycle state machine */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'TECHNICAL_REVIEW' | 'COMMERCIAL_REVIEW' | 'RECOMMENDED' | 'AWARDED' | 'REJECTED' | 'ARCHIVED'
interface QuotationEntity extends WorkflowEntity { id: string; status: QuotationStatus; version: number }

const quotationWorkflow: WorkflowDefinition<QuotationStatus, QuotationEntity> = {
  name: 'QuotationLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'SUBMITTED', 'TECHNICAL_REVIEW', 'COMMERCIAL_REVIEW', 'RECOMMENDED', 'AWARDED', 'REJECTED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'SUBMITTED' },
    { from: 'SUBMITTED', to: 'TECHNICAL_REVIEW' },
    { from: 'TECHNICAL_REVIEW', to: 'COMMERCIAL_REVIEW' },
    { from: 'TECHNICAL_REVIEW', to: 'REJECTED' },
    { from: 'COMMERCIAL_REVIEW', to: 'RECOMMENDED' },
    { from: 'COMMERCIAL_REVIEW', to: 'REJECTED' },
    { from: 'RECOMMENDED', to: 'AWARDED' },
    { from: 'RECOMMENDED', to: 'REJECTED' },
    { from: 'AWARDED', to: 'ARCHIVED' },
    { from: 'REJECTED', to: 'ARCHIVED' },
  ],
}
try { workflowRegistry.register(quotationWorkflow) } catch {}

export const QUOTATION_WORKFLOW_NAME = 'QuotationLifecycle'
