/**
 * Organization Workflow — Lifecycle State Machine
 *
 * Per Phase 0 Architecture §9: every entity with a lifecycle uses the Workflow Engine.
 *
 * Company/BU/Division/Region/Plant/Warehouse lifecycle:
 *   DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED
 *                              ↘ (back to ACTIVE)
 */

import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'

type OrgStatus = 'DRAFT' | 'CONFIGURED' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

interface OrgEntity extends WorkflowEntity {
  id: string
  status: OrgStatus
  version: number
}

const orgWorkflow: WorkflowDefinition<OrgStatus, OrgEntity> = {
  name: 'OrganizationLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'CONFIGURED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'CONFIGURED' },
    { from: 'CONFIGURED', to: 'ACTIVE' },
    { from: 'CONFIGURED', to: 'DRAFT' },
    { from: 'ACTIVE', to: 'SUSPENDED' },
    { from: 'SUSPENDED', to: 'ACTIVE' },
    { from: 'SUSPENDED', to: 'ARCHIVED' },
    { from: 'ACTIVE', to: 'ARCHIVED' },
  ],
}

// Register (idempotent)
try {
  workflowRegistry.register(orgWorkflow)
} catch {
  // Already registered — fine for hot reload
}

export const ORG_WORKFLOW_NAME = 'OrganizationLifecycle'
export type { OrgStatus, OrgEntity }
