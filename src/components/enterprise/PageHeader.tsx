'use client';

import { cn } from '@/lib/utils';
import { BreadcrumbNav } from './BreadcrumbNav';
import type { Breadcrumb } from '@/features/shared/types';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  icon?: React.ComponentType<{ className?: string }>;
  /** Actions rendered on the right (buttons, filters, etc.). */
  actions?: React.ReactNode;
  /** Called when a breadcrumb (with href) is clicked. */
  onBreadcrumbNavigate?: (href: string) => void;
  className?: string;
}

/** Standard page header with icon, title, description, breadcrumbs & actions. */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  icon: Icon,
  actions,
  onBreadcrumbNavigate,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbNav items={breadcrumbs} onNavigate={onBreadcrumbNavigate} />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
              <Icon className="size-5" />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight truncate sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
