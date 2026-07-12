'use client';

import { PageHeader } from '@/components/enterprise/PageHeader';
import { EnterpriseTabs, type EnterpriseTabItem } from '@/components/enterprise/EnterpriseTabs';
import { EmptyState } from '@/components/enterprise/EmptyState';
import { Card } from '@/components/ui/card';
import { Construction, ArrowRight } from 'lucide-react';
import type { Breadcrumb, ModuleKey } from '../types';
import { moduleMeta } from '../navigation';

export interface SubModule {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FeaturePageProps {
  module: ModuleKey;
  title?: string;
  description?: string;
  subModules: SubModule[];
  /** Optional actions rendered in the page header. */
  actions?: React.ReactNode;
  /** Optional extra breadcrumb segments inserted before the page. */
  extraCrumbs?: Breadcrumb[];
}

/**
 * Shared page composition for a feature module.
 *
 * Renders a PageHeader (with breadcrumbs rooted at the module), and an
 * EnterpriseTabs layout where each tab is a sub-module placeholder. This is
 * the scaffolding used while the real module content is migrated incrementally
 * from the monolithic page.tsx.
 */
export function FeaturePage({
  module,
  title,
  description,
  subModules,
  actions,
  extraCrumbs = [],
}: FeaturePageProps) {
  const meta = moduleMeta[module];
  const Icon = meta.icon;
  const headerTitle = title ?? meta.label;
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', href: 'dashboard', icon: undefined },
    { label: meta.label },
    ...extraCrumbs,
  ];

  const tabs: EnterpriseTabItem[] = subModules.map((sm) => ({
    value: sm.value,
    label: sm.label,
    icon: sm.icon,
    content: <SubModulePlaceholder title={sm.label} description={sm.description} />,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={headerTitle}
        description={description}
        icon={Icon}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <EnterpriseTabs items={tabs} />
    </div>
  );
}

function SubModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card className="p-0">
      <EmptyState
        icon={Construction}
        title={`${title} — Coming soon`}
        description={
          description ??
          'This sub-module is being migrated from the legacy monolith. The underlying data and workflows are available in the original admin shell.'
        }
        action={{
          label: 'View roadmap',
          onClick: () => undefined,
          icon: ArrowRight,
        }}
      />
    </Card>
  );
}
