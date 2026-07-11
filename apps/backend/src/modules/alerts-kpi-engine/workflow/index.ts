import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED' | 'SUPPRESSED'
interface AlertEntity extends WorkflowEntity { id: string; status: AlertStatus; version: number }
const alertWorkflow: WorkflowDefinition<AlertStatus, AlertEntity> = {
  name: 'AlertLifecycle', initialState: 'ACTIVE',
  states: ['ACTIVE', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED', 'SUPPRESSED'] as const,
  transitions: [
    { from: 'ACTIVE', to: 'ACKNOWLEDGED' }, { from: 'ACTIVE', to: 'ESCALATED' },
    { from: 'ACTIVE', to: 'SUPPRESSED' }, { from: 'ACKNOWLEDGED', to: 'RESOLVED' },
    { from: 'ACKNOWLEDGED', to: 'ESCALATED' }, { from: 'ESCALATED', to: 'ACKNOWLEDGED' },
    { from: 'ESCALATED', to: 'RESOLVED' }, { from: 'SUPPRESSED', to: 'ACTIVE' },
  ],
}
try { workflowRegistry.register(alertWorkflow) } catch {}
export const ALERT_WORKFLOW_NAME = 'AlertLifecycle'
export type { AlertStatus, AlertEntity }
