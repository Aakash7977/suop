/** Supplier Workflow — Lifecycle state machine */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type SupplierStatus = 'DRAFT' | 'VERIFICATION' | 'APPROVED' | 'ACTIVE' | 'PROBATION' | 'BLOCKED' | 'BLACKLISTED' | 'ARCHIVED'
interface SupplierEntity extends WorkflowEntity { id: string; status: SupplierStatus; version: number }

const supplierWorkflow: WorkflowDefinition<SupplierStatus, SupplierEntity> = {
  name: 'SupplierLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'VERIFICATION', 'APPROVED', 'ACTIVE', 'PROBATION', 'BLOCKED', 'BLACKLISTED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'VERIFICATION' },
    { from: 'VERIFICATION', to: 'APPROVED' },
    { from: 'VERIFICATION', to: 'DRAFT' },
    { from: 'APPROVED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'PROBATION' },
    { from: 'PROBATION', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'BLOCKED' },
    { from: 'PROBATION', to: 'BLOCKED' },
    { from: 'BLOCKED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'BLACKLISTED' },
    { from: 'BLOCKED', to: 'BLACKLISTED' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
    { from: 'BLOCKED', to: 'ARCHIVED' },
    { from: 'BLACKLISTED', to: 'ARCHIVED' },
  ],
}
try { workflowRegistry.register(supplierWorkflow) } catch {}

export const SUPPLIER_WORKFLOW_NAME = 'SupplierLifecycle'
