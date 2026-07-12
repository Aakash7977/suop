import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type EmpStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'RESIGNED' | 'TERMINATED' | 'RETIRED' | 'INACTIVE'
interface EmpEntity extends WorkflowEntity { id: string; status: EmpStatus; version: number }
const empWorkflow: WorkflowDefinition<EmpStatus, EmpEntity> = {
  name: 'EmployeeLifecycle', initialState: 'ACTIVE',
  states: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED', 'INACTIVE'] as const,
  transitions: [
    { from: 'ACTIVE', to: 'ON_LEAVE' }, { from: 'ACTIVE', to: 'SUSPENDED' },
    { from: 'ACTIVE', to: 'RESIGNED' }, { from: 'ACTIVE', to: 'TERMINATED' },
    { from: 'ACTIVE', to: 'RETIRED' }, { from: 'ACTIVE', to: 'INACTIVE' },
    { from: 'ON_LEAVE', to: 'ACTIVE' }, { from: 'SUSPENDED', to: 'ACTIVE' },
    { from: 'SUSPENDED', to: 'TERMINATED' }, { from: 'RESIGNED', to: 'INACTIVE' },
    { from: 'TERMINATED', to: 'INACTIVE' }, { from: 'RETIRED', to: 'INACTIVE' },
  ],
}
try { workflowRegistry.register(empWorkflow) } catch {}
export const EMPLOYEE_WORKFLOW_NAME = 'EmployeeLifecycle'
export type { EmpStatus, EmpEntity }
