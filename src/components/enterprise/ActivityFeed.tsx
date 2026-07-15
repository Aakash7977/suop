'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Timeline, type TimelineProps } from './Timeline';
import type { TimelineEntry } from '@/features/shared/types';
import { Activity } from 'lucide-react';

export interface ActivityFeedProps {
  entries: TimelineEntry[];
  title?: string;
  /** Show a live "pulse" indicator in the header. */
  live?: boolean;
  /** Max height for the scrollable area. */
  maxHeight?: number;
  className?: string;
  empty?: React.ReactNode;
}

/** Real-time activity feed rendered as a scrolling timeline in a card. */
export function ActivityFeed({
  entries,
  title = 'Activity',
  live = false,
  maxHeight = 320,
  className,
  empty,
}: ActivityFeedProps) {
  return (
    <Card className={cn('flex flex-col gap-0 overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        )}
      </div>
      <ScrollArea style={{ maxHeight }} className="flex-1">
        <div className="p-4">
          <Timeline entries={entries} descending empty={empty} />
        </div>
      </ScrollArea>
    </Card>
  );
}

export type { TimelineProps };
