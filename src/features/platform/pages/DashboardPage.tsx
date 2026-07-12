'use client';

import { PageHeader } from '@/components/enterprise/PageHeader';
import { DashboardCard } from '@/components/enterprise/DashboardCard';
import { LoadingState } from '@/components/enterprise/LoadingState';
import { EmptyState } from '@/components/enterprise/EmptyState';
import { ActivityFeed } from '@/components/enterprise/ActivityFeed';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, RefreshCw, Bell, ArrowRight } from 'lucide-react';

export interface DashboardPageProps {
  className?: string;
  /** Called when the user clicks the refresh action on a widget. */
  onRefresh?: () => void;
}

/**
 * Platform dashboard — the landing page shown after login.
 *
 * Deliberately uses skeleton loading & empty states (no mock data) until the
 * real KPI/activity data is wired up from the backend modules.
 */
export function DashboardPage({ className, onRefresh }: DashboardPageProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeader
        title="Operations Dashboard"
        description="Real-time overview of procurement, inventory, manufacturing & finance."
        icon={LayoutDashboard}
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <>
            <ButtonGhost onClick={onRefresh}>
              <RefreshCw className="size-4" /> Refresh
            </ButtonGhost>
            <ButtonGhost onClick={onRefresh}>
              <Bell className="size-4" /> Notifications
            </ButtonGhost>
          </>
        }
      />

      {/* KPI row — skeletons until data is wired */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingState variant="card" rows={4} />
      </div>

      {/* Main widgets */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard
          title="Open Purchase Orders"
          description="Awaiting approval"
          icon={LayoutDashboard}
          className="lg:col-span-2"
          onRefresh={onRefresh}
          footer={
            <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all orders <ArrowRight className="size-3" />
            </button>
          }
        >
          <EmptyState
            title="No open purchase orders"
            description="Newly created purchase orders will appear here once they enter the approval queue."
          />
        </DashboardCard>

        <ActivityFeed
          title="Recent Activity"
          live
          entries={[]}
          empty={
            <EmptyState
              title="No recent activity"
              description="Workflow events from across the platform will stream here in real time."
            />
          }
        />
      </div>

      {/* Secondary widgets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Inventory Health" description="Stock-out & overstock alerts" onRefresh={onRefresh}>
          <LoadingState variant="list" rows={4} />
        </DashboardCard>
        <DashboardCard title="Production Status" description="Active production orders" onRefresh={onRefresh}>
          <LoadingState variant="list" rows={4} />
        </DashboardCard>
      </div>
    </div>
  );
}

/** Tiny local ghost button used in the header actions. */
function ButtonGhost({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}
