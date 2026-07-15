'use client';

import { cn } from '@/lib/utils';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { StatusKind } from '@/features/shared/types';
import {
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Pause,
  Archive,
  Activity,
  Eye,
} from 'lucide-react';

/** Visual configuration for each status kind. */
const STATUS_CONFIG: Record<
  StatusKind,
  { className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: { className: 'bg-muted text-muted-foreground border-border', icon: FileEdit },
  PENDING: { className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900', icon: Clock },
  IN_REVIEW: { className: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900', icon: Eye },
  APPROVED: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900', icon: CheckCircle2 },
  REJECTED: { className: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900', icon: XCircle },
  ACTIVE: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900', icon: Activity },
  COMPLETED: { className: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900', icon: CheckCircle2 },
  CANCELLED: { className: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900', icon: XCircle },
  ON_HOLD: { className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900', icon: Pause },
  ARCHIVED: { className: 'bg-muted text-muted-foreground border-border', icon: Archive },
};

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusKind;
  /** Show the leading icon. Defaults to true. */
  showIcon?: boolean;
  /** Render the raw status text instead of a friendly label. */
  raw?: boolean;
}

const FRIENDLY: Partial<Record<StatusKind, string>> = {
  IN_REVIEW: 'In Review',
  ON_HOLD: 'On Hold',
};

/** Color-coded status badge for ERP documents & workflows. */
export function StatusBadge({
  status,
  showIcon = true,
  raw = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = config.icon;
  const label = raw ? status : FRIENDLY[status] ?? status.replace(/_/g, ' ');
  return (
    <Badge variant="outline" className={cn(config.className, className)} {...props}>
      {showIcon && <Icon className="size-3" />}
      {children ?? label}
    </Badge>
  );
}
