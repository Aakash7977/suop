import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
interface TicketEntity extends WorkflowEntity { id: string; status: TicketStatus; version: number }
const ticketWorkflow: WorkflowDefinition<TicketStatus, TicketEntity> = {
  name: 'TicketLifecycle', initialState: 'OPEN',
  states: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'] as const,
  transitions: [
    { from: 'OPEN', to: 'IN_PROGRESS' }, { from: 'OPEN', to: 'CANCELLED' },
    { from: 'IN_PROGRESS', to: 'WAITING_CUSTOMER' }, { from: 'IN_PROGRESS', to: 'RESOLVED' },
    { from: 'WAITING_CUSTOMER', to: 'IN_PROGRESS' }, { from: 'WAITING_CUSTOMER', to: 'RESOLVED' },
    { from: 'RESOLVED', to: 'CLOSED' }, { from: 'RESOLVED', to: 'IN_PROGRESS' },
    { from: 'IN_PROGRESS', to: 'CANCELLED' },
  ],
}
try { workflowRegistry.register(ticketWorkflow) } catch {}
export const TICKET_WORKFLOW_NAME = 'TicketLifecycle'
export type { TicketStatus, TicketEntity }
