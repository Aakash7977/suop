/** GST Configuration Workflow — 5 states, 6 transitions
 * Also registers TaxReturnLifecycle as alias for backward compat.
 */
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type GstConfigStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'AMENDED'
interface GstConfigEntity extends WorkflowEntity { id: string; status: GstConfigStatus; version: number }
const gstConfigWorkflow: WorkflowDefinition<GstConfigStatus, GstConfigEntity> = {
  name: 'GstConfigurationLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'AMENDED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'SUSPENDED' },
    { from: 'SUSPENDED', to: 'ACTIVE' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
    { from: 'SUSPENDED', to: 'ARCHIVED' },
    { from: 'ARCHIVED', to: 'AMENDED' },
  ],
}
try { workflowRegistry.register(gstConfigWorkflow) } catch {}

// Also register TaxReturnLifecycle for backward compat
type TRStatus = 'DRAFT' | 'READY_TO_FILE' | 'FILED' | 'AMENDED'
interface TREntity extends WorkflowEntity { id: string; status: TRStatus; version: number }
const trWorkflow: WorkflowDefinition<TRStatus, TREntity> = {
  name: 'TaxReturnLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'READY_TO_FILE', 'FILED', 'AMENDED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'READY_TO_FILE' },
    { from: 'READY_TO_FILE', to: 'FILED' },
    { from: 'FILED', to: 'AMENDED' },
    { from: 'AMENDED', to: 'FILED' },
  ],
}
try { workflowRegistry.register(trWorkflow) } catch {}

export const GST_CONFIG_WORKFLOW_NAME = 'GstConfigurationLifecycle'
export const TR_WORKFLOW_NAME = 'TaxReturnLifecycle'
export type { GstConfigStatus, GstConfigEntity, TRStatus, TREntity }
