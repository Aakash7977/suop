'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';
import type { StatusKind } from '@/features/shared/types';

export interface ApprovalStage {
  id: string;
  name: string;
  role?: string;
  status: Extract<StatusKind, 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW'>;
  comment?: string;
  timestamp?: string;
}

export interface ApprovalTimelineProps {
  stages: ApprovalStage[];
  currentStageId?: string;
  className?: string;
}

const STAGE_ICON: Record<ApprovalStage['status'], React.ComponentType<{ className?: string }>> = {
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  PENDING: Clock,
  IN_REVIEW: MessageSquare,
};

const STAGE_COLOR: Record<ApprovalStage['status'], string> = {
  APPROVED: 'bg-emerald-500 text-white',
  REJECTED: 'bg-rose-500 text-white',
  PENDING: 'bg-muted-foreground/30 text-muted-foreground',
  IN_REVIEW: 'bg-sky-500 text-white',
};

/** Approval workflow timeline showing each approver and their decision. */
export function ApprovalTimeline({ stages, currentStageId, className }: ApprovalTimelineProps) {
  return (
    <ol className={cn('relative space-y-4 pl-6', className)}>
      <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {stages.map((stage) => {
        const Icon = STAGE_ICON[stage.status];
        const isCurrent = stage.id === currentStageId;
        const initials = stage.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <li key={stage.id} className="relative">
            <span
              className={cn(
                'absolute -left-6 top-0.5 flex size-6 items-center justify-center rounded-full ring-4 ring-background',
                STAGE_COLOR[stage.status],
              )}
            >
              <Icon className="size-3" />
            </span>
            <div
              className={cn(
                'rounded-lg border p-3',
                isCurrent && 'border-primary/40 bg-primary/5',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{stage.name}</p>
                    {stage.role && (
                      <p className="text-xs text-muted-foreground truncate">{stage.role}</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={stage.status} showIcon={false} />
              </div>
              {stage.comment && (
                <p className="mt-2 text-sm text-muted-foreground border-l-2 pl-2 italic">
                  &ldquo;{stage.comment}&rdquo;
                </p>
              )}
              {stage.timestamp && (
                <p className="mt-1 text-xs text-muted-foreground">{stage.timestamp}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
