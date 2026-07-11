/** Recipe Workflow — 4 states, 5 transitions */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type RecipeStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'DEPRECATED'
interface RecipeEntity extends WorkflowEntity { id: string; status: RecipeStatus; version: number }

const recipeWorkflow: WorkflowDefinition<RecipeStatus, RecipeEntity> = {
  name: 'RecipeLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPRECATED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'IN_REVIEW' },
    { from: 'IN_REVIEW', to: 'APPROVED' },
    { from: 'IN_REVIEW', to: 'DRAFT' },
    { from: 'APPROVED', to: 'DEPRECATED' },
    { from: 'DEPRECATED', to: 'APPROVED' },
  ],
}

try { workflowRegistry.register(recipeWorkflow) } catch {}
export const RECIPE_WORKFLOW_NAME = 'RecipeLifecycle'
export type { RecipeStatus, RecipeEntity }
