'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, MoreHorizontal, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DashboardCardProps {
  title: string;
  description?: string;
  /** Optional icon shown in the header. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional badge/count in the header. */
  badge?: React.ReactNode;
  /** Optional actions rendered in the header (left of the menu). */
  actions?: React.ReactNode;
  /** Optional refresh handler — shows a refresh button. */
  onRefresh?: () => void;
  /** Optional expand handler — shows an expand button. */
  onExpand?: () => void;
  /** Footer content (e.g. "View all"). */
  footer?: React.ReactNode;
  /** When true, the body uses no padding (for tables/charts). */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}

/** Configurable dashboard widget card with header, actions & footer. */
export function DashboardCard({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  onRefresh,
  onExpand,
  footer,
  flush,
  className,
  bodyClassName,
  children,
}: DashboardCardProps) {
  return (
    <Card className={cn('flex flex-col gap-0 overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="rounded-md bg-muted p-1.5 text-muted-foreground shrink-0">
              <Icon className="size-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">{title}</h3>
              {badge}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {actions}
          {onRefresh && (
            <Button variant="ghost" size="icon" className="size-7" onClick={onRefresh} aria-label="Refresh">
              <RefreshCw className="size-3.5" />
            </Button>
          )}
          {onExpand && (
            <Button variant="ghost" size="icon" className="size-7" onClick={onExpand} aria-label="Expand">
              <Maximize2 className="size-3.5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" aria-label="More options">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>Configure</DropdownMenuItem>
              <DropdownMenuItem>Hide widget</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className={cn('flex-1 min-h-0', flush ? '' : 'p-4', bodyClassName)}>{children}</div>
      {footer && <div className="border-t p-3 text-center">{footer}</div>}
    </Card>
  );
}
