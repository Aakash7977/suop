'use client';

import { cn } from '@/lib/utils';
import { Check, Clock, X, CircleDot } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { StatusKind } from '@/features/shared/types';

export interface WorkflowStep {
  id: string;
  label: string;
  status: Extract<
    StatusKind,
    'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'ACTIVE' | 'CANCELLED' | 'ON_HOLD'
  >;
  actor?: string;
  timestamp?: string;
  note?: string;
}

export interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  /** Direction of the timeline. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const ICONS: Partial<Record<WorkflowStep['status'], React.ComponentType<{ className?: string }>>> = {
  COMPLETED: Check,
  APPROVED: Check,
  REJECTED: X,
  CANCELLED: X,
  PENDING: Clock,
  ON_HOLD: Clock,
  IN_REVIEW: CircleDot,
  ACTIVE: CircleDot,
};

const WRAP: Partial<Record<WorkflowStep['status'], string>> = {
  COMPLETED: 'bg-emerald-500 text-white',
  APPROVED: 'bg-emerald-500 text-white',
  REJECTED: 'bg-rose-500 text-white',
  CANCELLED: 'bg-rose-500 text-white',
  PENDING: 'bg-amber-500 text-white',
  ON_HOLD: 'bg-amber-500 text-white',
  IN_REVIEW: 'bg-sky-500 text-white',
  ACTIVE: 'bg-primary text-primary-foreground',
};

/** Visual workflow state timeline (e.g. document approval stages). */
export function WorkflowTimeline({
  steps,
  orientation = 'vertical',
  className,
}: WorkflowTimelineProps) {
  const isVertical = orientation === 'vertical';
  return (
    <ol
      className={cn(
        isVertical ? 'flex flex-col gap-0' : 'flex items-start',
        className,
      )}
    >
      {steps.map((step, idx) => {
        const Icon = ICONS[step.status] ?? Clock;
        const wrap = WRAP[step.status] ?? 'bg-muted text-muted-foreground';
        const connectorState =
          step.status === 'COMPLETED' || step.status === 'APPROVED'
            ? 'bg-emerald-500'
            : 'bg-border';
        return (
          <li
            key={step.id}
            className={cn('relative', isVertical ? 'flex gap-3 pb-5 last:pb-0' : 'flex-1 flex flex-col items-center')}
          >
            <div className={cn('flex', isVertical ? 'flex-col items-center' : 'w-full flex-col items-center')}>
              <div className={cn('flex size-8 items-center justify-center rounded-full ring-4 ring-background shrink-0', wrap)}>
                <Icon className="size-4" />
              </div>
              {isVertical && idx < steps.length - 1 && (
                <div className={cn('w-0.5 flex-1 my-1 min-h-6 rounded', connectorState)} />
              )}
              {!isVertical && idx < steps.length - 1 && (
                <div className={cn('h-0.5 w-full my-0 mx-1 rounded', connectorState)} />
              )}
            </div>
            <div className={cn(isVertical ? 'pt-0' : 'pt-2 text-center')}>
              <p className="text-sm font-medium leading-tight">{step.label}</p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <StatusBadge status={step.status} showIcon={false} />
              </div>
              {step.actor && (
                <p className="text-xs text-muted-foreground mt-1">{step.actor}</p>
              )}
              {step.timestamp && (
                <p className="text-xs text-muted-foreground">{step.timestamp}</p>
              )}
              {step.note && (
                <p className="text-xs text-muted-foreground italic mt-0.5">{step.note}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
