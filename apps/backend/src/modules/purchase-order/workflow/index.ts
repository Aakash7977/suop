/** Purchase Order Workflow — Lifecycle state machine
 *
 * 16 states, ~25 transitions
 *
 * Per WORKFLOW_BASELINE.md: state machine only, no direct status updates,
 * all transitions audited.
 */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type POStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DEPT_APPROVAL'
  | 'FINANCE_APPROVAL'
  | 'MANAGEMENT_APPROVAL'
  | 'APPROVED'
  | 'ISSUED'
  | 'SUPPLIER_ACCEPTED'
  | 'PARTIALLY_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REVISION_REQUESTED'

interface POEntity extends WorkflowEntity {
  id: string
  status: POStatus
  version: number
}

const poWorkflow: WorkflowDefinition<POStatus, POEntity> = {
  name: 'PurchaseOrderLifecycle',
  initialState: 'DRAFT',
  states: [
    'DRAFT',
    'SUBMITTED',
    'DEPT_APPROVAL',
    'FINANCE_APPROVAL',
    'MANAGEMENT_APPROVAL',
    'APPROVED',
    'ISSUED',
    'SUPPLIER_ACCEPTED',
    'PARTIALLY_RECEIVED',
    'FULLY_RECEIVED',
    'CLOSED',
    'REJECTED',
    'CANCELLED',
    'EXPIRED',
    'REVISION_REQUESTED',
  ] as const,
  transitions: [
    // Draft → approval chain
    { from: 'DRAFT', to: 'SUBMITTED' },
    { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'SUBMITTED', to: 'DEPT_APPROVAL' },
    { from: 'SUBMITTED', to: 'CANCELLED' },
    { from: 'SUBMITTED', to: 'DRAFT' }, // returned for revision

    // Approval chain
    { from: 'DEPT_APPROVAL', to: 'FINANCE_APPROVAL' },
    { from: 'DEPT_APPROVAL', to: 'REJECTED' },
    { from: 'DEPT_APPROVAL', to: 'DRAFT' }, // returned
    { from: 'FINANCE_APPROVAL', to: 'MANAGEMENT_APPROVAL' },
    { from: 'FINANCE_APPROVAL', to: 'REJECTED' },
    { from: 'FINANCE_APPROVAL', to: 'DRAFT' },
    { from: 'MANAGEMENT_APPROVAL', to: 'APPROVED' },
    { from: 'MANAGEMENT_APPROVAL', to: 'REJECTED' },
    { from: 'MANAGEMENT_APPROVAL', to: 'DRAFT' },

    // Approved → issued → supplier
    { from: 'APPROVED', to: 'ISSUED' },
    { from: 'APPROVED', to: 'CANCELLED' },
    { from: 'ISSUED', to: 'SUPPLIER_ACCEPTED' },
    { from: 'ISSUED', to: 'REVISION_REQUESTED' }, // supplier requests changes
    { from: 'ISSUED', to: 'CANCELLED' },
    { from: 'ISSUED', to: 'EXPIRED' },

    // Revision requested → back to draft
    { from: 'REVISION_REQUESTED', to: 'DRAFT' },

    // Supplier accepted → receipt
    { from: 'SUPPLIER_ACCEPTED', to: 'PARTIALLY_RECEIVED' },
    { from: 'SUPPLIER_ACCEPTED', to: 'FULLY_RECEIVED' },
    { from: 'PARTIALLY_RECEIVED', to: 'FULLY_RECEIVED' },
    { from: 'PARTIALLY_RECEIVED', to: 'CLOSED' }, // partial close
    { from: 'FULLY_RECEIVED', to: 'CLOSED' },

    // Rejected → can resubmit
    { from: 'REJECTED', to: 'DRAFT' },
  ],
}

try {
  workflowRegistry.register(poWorkflow)
} catch {
  // already registered (e.g. in tests with multiple imports)
}

export const PO_WORKFLOW_NAME = 'PurchaseOrderLifecycle'
export type { POStatus, POEntity }
