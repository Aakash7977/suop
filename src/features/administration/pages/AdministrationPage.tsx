'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { Users, Settings, History, Workflow, Bell, Network } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'identity-rbac', label: 'Identity & RBAC', icon: Users, description: 'Users, roles, permissions & SSO.' },
  { value: 'configuration', label: 'Configuration', icon: Settings, description: 'System, tenant & feature configuration.' },
  { value: 'audit', label: 'Audit Log', icon: History, description: 'Immutable audit trail & exports.' },
  { value: 'workflow', label: 'Workflow Engine', icon: Workflow, description: 'Approval workflows & state machines.' },
  { value: 'notifications', label: 'Notifications', icon: Bell, description: 'Notification templates & delivery.' },
  { value: 'integrations', label: 'Integrations', icon: Network, description: 'API gateway, connectors & webhooks.' },
];

export function AdministrationPage() {
  return (
    <FeaturePage
      module="administration"
      title="Administration"
      description="Identity, RBAC, configuration, audit, workflow & integrations."
      subModules={SUB_MODULES}
    />
  );
}
