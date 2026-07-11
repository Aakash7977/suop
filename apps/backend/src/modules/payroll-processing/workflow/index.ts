import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'APPROVED' | 'LOCKED' | 'CANCELLED'
interface PayrollEntity extends WorkflowEntity { id: string; status: PayrollStatus; version: number }
const payrollWorkflow: WorkflowDefinition<PayrollStatus, PayrollEntity> = {
  name: 'PayrollRunLifecycle', initialState: 'DRAFT',
  states: ['DRAFT', 'PROCESSED', 'APPROVED', 'LOCKED', 'CANCELLED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'PROCESSED' }, { from: 'DRAFT', to: 'CANCELLED' },
    { from: 'PROCESSED', to: 'APPROVED' }, { from: 'PROCESSED', to: 'DRAFT' },
    { from: 'APPROVED', to: 'LOCKED' }, { from: 'APPROVED', to: 'DRAFT' },
    { from: 'PROCESSED', to: 'CANCELLED' },
  ],
}
try { workflowRegistry.register(payrollWorkflow) } catch {}
export const PAYROLL_WORKFLOW_NAME = 'PayrollRunLifecycle'
export type { PayrollStatus, PayrollEntity }
