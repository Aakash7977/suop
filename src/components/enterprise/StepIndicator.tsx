'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  /** Index of the current step (0-based). */
  current: number;
  /** Highest completed step index (-1 if none completed). */
  completed?: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (index: number) => void;
  className?: string;
}

/** Visual step progress indicator for multi-step workflows. */
export function StepIndicator({
  steps,
  current,
  completed = -1,
  orientation = 'horizontal',
  onStepClick,
  className,
}: StepIndicatorProps) {
  const isVertical = orientation === 'vertical';
  return (
    <ol
      className={cn(
        isVertical ? 'flex flex-col' : 'flex items-start',
        className,
      )}
    >
      {steps.map((step, idx) => {
        const isDone = idx <= completed || idx < current;
        const isCurrent = idx === current;
        const isUpcoming = idx > current && idx > completed;
        const clickable = !!onStepClick && (isDone || idx <= completed + 1);
        return (
          <li
            key={step.id}
            className={cn(
              'flex',
              isVertical ? 'flex-row gap-3 pb-4 last:pb-0' : 'flex-col items-center flex-1',
            )}
          >
            <div
              className={cn(
                'flex',
                isVertical ? 'flex-col items-center' : 'w-full flex-row items-center',
              )}
            >
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(idx)}
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  isDone && 'border-emerald-500 bg-emerald-500 text-white',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isUpcoming && 'border-muted-foreground/30 bg-background text-muted-foreground',
                  clickable && 'cursor-pointer hover:opacity-80',
                  !clickable && 'cursor-default',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="size-4" /> : idx + 1}
              </button>
              {isVertical && idx < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 my-1 rounded',
                    idx < current ? 'bg-emerald-500' : 'bg-muted-foreground/20',
                  )}
                />
              )}
              {!isVertical && idx < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 rounded',
                    idx < current ? 'bg-emerald-500' : 'bg-muted-foreground/20',
                  )}
                />
              )}
            </div>
            <div className={cn(isVertical ? 'pb-2' : 'pt-2 text-center')}>
              <p
                className={cn(
                  'text-xs font-medium leading-tight',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 max-w-[10rem]">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
