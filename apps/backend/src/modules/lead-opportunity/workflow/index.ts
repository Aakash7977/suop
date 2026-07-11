import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST'
interface LeadEntity extends WorkflowEntity { id: string; status: LeadStatus; version: number }
const leadWorkflow: WorkflowDefinition<LeadStatus, LeadEntity> = {
  name: 'LeadLifecycle', initialState: 'NEW',
  states: ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST'] as const,
  transitions: [
    { from: 'NEW', to: 'CONTACTED' }, { from: 'NEW', to: 'UNQUALIFIED' },
    { from: 'CONTACTED', to: 'QUALIFIED' }, { from: 'CONTACTED', to: 'UNQUALIFIED' },
    { from: 'CONTACTED', to: 'LOST' }, { from: 'QUALIFIED', to: 'CONVERTED' },
    { from: 'QUALIFIED', to: 'LOST' }, { from: 'UNQUALIFIED', to: 'NEW' },
  ],
}
try { workflowRegistry.register(leadWorkflow) } catch {}
type OppStatus = 'OPEN' | 'WON' | 'LOST' | 'CLOSED'
interface OppEntity extends WorkflowEntity { id: string; status: OppStatus; version: number }
const oppWorkflow: WorkflowDefinition<OppStatus, OppEntity> = {
  name: 'OpportunityLifecycle', initialState: 'OPEN',
  states: ['OPEN', 'WON', 'LOST', 'CLOSED'] as const,
  transitions: [
    { from: 'OPEN', to: 'WON' }, { from: 'OPEN', to: 'LOST' },
    { from: 'WON', to: 'CLOSED' }, { from: 'LOST', to: 'CLOSED' },
    { from: 'LOST', to: 'OPEN' },
  ],
}
try { workflowRegistry.register(oppWorkflow) } catch {}
export const LEAD_WORKFLOW_NAME = 'LeadLifecycle'
export const OPP_WORKFLOW_NAME = 'OpportunityLifecycle'
export type { LeadStatus, LeadEntity, OppStatus, OppEntity }
