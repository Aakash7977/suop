/** Product Workflow — Lifecycle state machine */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type ProductStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED'
interface ProductEntity extends WorkflowEntity { id: string; status: ProductStatus; version: number }

const productWorkflow: WorkflowDefinition<ProductStatus, ProductEntity> = {
  name: 'ProductLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'DISCONTINUED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'REVIEW' },
    { from: 'REVIEW', to: 'APPROVED' },
    { from: 'REVIEW', to: 'DRAFT' },
    { from: 'APPROVED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'DISCONTINUED' },
    { from: 'DISCONTINUED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
    { from: 'DISCONTINUED', to: 'ARCHIVED' },
  ],
}
try { workflowRegistry.register(productWorkflow) } catch {}

export const PRODUCT_WORKFLOW_NAME = 'ProductLifecycle'
