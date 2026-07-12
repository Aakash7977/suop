'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { History, ArrowRight } from 'lucide-react';

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  /** Optional field-level diff. */
  changes?: Array<{
    field: string;
    from?: string;
    to?: string;
  }>;
}

export interface AuditViewerProps {
  entries: AuditEntry[];
  className?: string;
  title?: string;
  maxHeight?: number;
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

/** Audit log viewer with field-level diff display. */
export function AuditViewer({
  entries,
  className,
  title = 'Audit History',
  maxHeight = 400,
}: AuditViewerProps) {
  return (
    <Card className={cn('flex flex-col gap-0 overflow-hidden', className)}>
      <div className="flex items-center gap-2 border-b p-3">
        <History className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{entries.length} events</span>
      </div>
      <ScrollArea style={{ maxHeight }} className="flex-1">
        <div className="divide-y">
          {entries.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No audit history available.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{initials(entry.actor)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{entry.actor}</span>{' '}
                      <span className="text-muted-foreground">{entry.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                  </div>
                </div>
                {entry.changes && entry.changes.length > 0 && (
                  <div className="ml-8 space-y-1">
                    {entry.changes.map((c, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium text-muted-foreground">{c.field}:</span>{' '}
                        <span className="rounded bg-rose-100 px-1 text-rose-700 line-through dark:bg-rose-950/40 dark:text-rose-300">
                          {c.from ?? '—'}
                        </span>{' '}
                        <ArrowRight className="inline size-3 text-muted-foreground" />{' '}
                        <span className="rounded bg-emerald-100 px-1 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {c.to ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
