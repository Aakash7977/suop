/** Purchase Requisition Workflow — Lifecycle state machine */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type PRStatus = 'DRAFT' | 'SUBMITTED' | 'DEPT_REVIEW' | 'BUDGET_APPROVAL' | 'PROC_REVIEW' | 'APPROVED' | 'CONVERTED_TO_RFQ' | 'CLOSED' | 'CANCELLED' | 'REJECTED'
interface PREntity extends WorkflowEntity { id: string; status: PRStatus; version: number }

const prWorkflow: WorkflowDefinition<PRStatus, PREntity> = {
  name: 'PurchaseRequisitionLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'SUBMITTED', 'DEPT_REVIEW', 'BUDGET_APPROVAL', 'PROC_REVIEW', 'APPROVED', 'CONVERTED_TO_RFQ', 'CLOSED', 'CANCELLED', 'REJECTED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'SUBMITTED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'SUBMITTED', to: 'DEPT_REVIEW' },
    { from: 'SUBMITTED', to: 'CANCELLED' },
    { from: 'DEPT_REVIEW', to: 'BUDGET_APPROVAL' },
    { from: 'DEPT_REVIEW', to: 'REJECTED' },
    { from: 'DEPT_REVIEW', to: 'DRAFT' }, // returned for revision
    { from: 'BUDGET_APPROVAL', to: 'PROC_REVIEW' },
    { from: 'BUDGET_APPROVAL', to: 'REJECTED' },
    { from: 'BUDGET_APPROVAL', to: 'DRAFT' },
    { from: 'PROC_REVIEW', to: 'APPROVED' },
    { from: 'PROC_REVIEW', to: 'REJECTED' },
    { from: 'PROC_REVIEW', to: 'DRAFT' },
    { from: 'APPROVED', to: 'CONVERTED_TO_RFQ' },
    { from: 'APPROVED', to: 'CLOSED' }, // direct close (e.g. emergency purchase)
    { from: 'CONVERTED_TO_RFQ', to: 'CLOSED' },
    { from: 'REJECTED', to: 'DRAFT' }, // allow resubmission
  ],
}
try { workflowRegistry.register(prWorkflow) } catch {}

export const PR_WORKFLOW_NAME = 'PurchaseRequisitionLifecycle'
