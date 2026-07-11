/** Customer Workflow — Lifecycle state machine */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type CustomerStatus = 'LEAD' | 'PROSPECT' | 'APPROVED' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'ARCHIVED'
interface CustomerEntity extends WorkflowEntity { id: string; status: CustomerStatus; version: number }

const customerWorkflow: WorkflowDefinition<CustomerStatus, CustomerEntity> = {
  name: 'CustomerLifecycle',
  initialState: 'LEAD',
  states: ['LEAD', 'PROSPECT', 'APPROVED', 'ACTIVE', 'BLOCKED', 'INACTIVE', 'ARCHIVED'] as const,
  transitions: [
    { from: 'LEAD', to: 'PROSPECT' },
    { from: 'PROSPECT', to: 'APPROVED' },
    { from: 'PROSPECT', to: 'LEAD' },
    { from: 'APPROVED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'BLOCKED' },
    { from: 'BLOCKED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'INACTIVE' },
    { from: 'BLOCKED', to: 'INACTIVE' },
    { from: 'INACTIVE', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
    { from: 'BLOCKED', to: 'ARCHIVED' },
    { from: 'INACTIVE', to: 'ARCHIVED' },
  ],
}
try { workflowRegistry.register(customerWorkflow) } catch {}

export const CUSTOMER_WORKFLOW_NAME = 'CustomerLifecycle'
