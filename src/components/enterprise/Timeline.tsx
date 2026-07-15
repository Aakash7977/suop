'use client';

import { cn } from '@/lib/utils';
import type { TimelineEntry, StatusKind } from '@/features/shared/types';
import { StatusBadge } from './StatusBadge';

export interface TimelineProps {
  entries: TimelineEntry[];
  /** Render entries in reverse order (newest first). */
  descending?: boolean;
  className?: string;
  /** Empty-state node rendered when there are no entries. */
  empty?: React.ReactNode;
}

const STATUS_DOT: Record<StatusKind, string> = {
  DRAFT: 'bg-muted-foreground',
  PENDING: 'bg-amber-500',
  IN_REVIEW: 'bg-sky-500',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
  ACTIVE: 'bg-emerald-500',
  COMPLETED: 'bg-violet-500',
  CANCELLED: 'bg-rose-500',
  ON_HOLD: 'bg-amber-500',
  ARCHIVED: 'bg-muted-foreground',
};

/** Generic activity timeline with a vertical connector line. */
export function Timeline({
  entries,
  descending = false,
  className,
  empty,
}: TimelineProps) {
  const items = descending ? [...entries].reverse() : entries;
  if (!items.length) {
    return <div className={cn('text-sm text-muted-foreground py-6', className)}>{empty ?? 'No activity yet.'}</div>;
  }
  return (
    <ol className={cn('relative space-y-4 pl-6', className)}>
      <div className="absolute left-[10px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {items.map((entry) => {
        const Icon = entry.icon;
        const dotColor = entry.status ? STATUS_DOT[entry.status] : 'bg-primary';
        return (
          <li key={entry.id} className="relative">
            <span
              className={cn(
                'absolute -left-6 top-0.5 flex size-5 items-center justify-center rounded-full ring-4 ring-background',
                dotColor,
              )}
            >
              {Icon && <Icon className="size-3 text-white" />}
            </span>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.status && <StatusBadge status={entry.status} showIcon={false} />}
              </div>
              {entry.description && (
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {entry.actor && <span>{entry.actor}</span>}
                {entry.actor && entry.timestamp && <span>·</span>}
                <span>{entry.timestamp}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
