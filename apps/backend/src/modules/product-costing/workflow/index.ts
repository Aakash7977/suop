/** Product Cost Lifecycle Workflow — 5 states, 6 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type ProductCostStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'POSTED' | 'ARCHIVED'
interface ProductCostEntity extends WorkflowEntity { id: string; status: ProductCostStatus; version: number }

const productCostWorkflow: WorkflowDefinition<ProductCostStatus, ProductCostEntity> = {
  name: 'ProductCostLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'CALCULATED', 'APPROVED', 'POSTED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'CALCULATED' },
    { from: 'CALCULATED', to: 'APPROVED' },
    { from: 'CALCULATED', to: 'DRAFT' },
    { from: 'APPROVED', to: 'POSTED' },
    { from: 'POSTED', to: 'ARCHIVED' },
    { from: 'APPROVED', to: 'ARCHIVED' },
  ],
}

try { workflowRegistry.register(productCostWorkflow) } catch {}

export const PRODUCT_COST_WORKFLOW_NAME = 'ProductCostLifecycle'
export type { ProductCostStatus, ProductCostEntity }
