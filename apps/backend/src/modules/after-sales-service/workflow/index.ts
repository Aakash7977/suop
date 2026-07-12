import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type ServiceStatus = 'REGISTERED' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
interface ServiceEntity extends WorkflowEntity { id: string; status: ServiceStatus; version: number }
const serviceWorkflow: WorkflowDefinition<ServiceStatus, ServiceEntity> = {
  name: 'ServiceRequestLifecycle', initialState: 'REGISTERED',
  states: ['REGISTERED', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const,
  transitions: [
    { from: 'REGISTERED', to: 'ASSIGNED' }, { from: 'REGISTERED', to: 'CANCELLED' },
    { from: 'ASSIGNED', to: 'SCHEDULED' }, { from: 'ASSIGNED', to: 'CANCELLED' },
    { from: 'SCHEDULED', to: 'IN_PROGRESS' }, { from: 'SCHEDULED', to: 'CANCELLED' },
    { from: 'IN_PROGRESS', to: 'COMPLETED' }, { from: 'IN_PROGRESS', to: 'CANCELLED' },
  ],
}
try { workflowRegistry.register(serviceWorkflow) } catch {}
export const SERVICE_WORKFLOW_NAME = 'ServiceRequestLifecycle'
export type { ServiceStatus, ServiceEntity }
