'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StepIndicator, type Step } from './StepIndicator';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface WizardProps {
  steps: Step[];
  /** Called when the wizard finishes the final step. */
  onComplete?: () => void;
  /** Called on every step change. */
  onStepChange?: (index: number) => void;
  /** Controlled current step. */
  currentStep?: number;
  /** Render the body for a given step index. */
  renderStep: (index: number) => React.ReactNode;
  /** Optional per-step validation — returns false to block Next. */
  canProceed?: (index: number) => boolean;
  /** Labels for the control buttons. */
  labels?: {
    back?: string;
    next?: string;
    finish?: string;
  };
  className?: string;
}

/** Multi-step wizard with step indicator and navigation controls. */
export function Wizard({
  steps,
  onComplete,
  onStepChange,
  currentStep: controlled,
  renderStep,
  canProceed,
  labels,
  className,
}: WizardProps) {
  const [internal, setInternal] = useState(0);
  const current = controlled ?? internal;
  const isLast = current === steps.length - 1;
  const canGoNext = canProceed ? canProceed(current) : true;

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, next));
      if (controlled === undefined) setInternal(clamped);
      onStepChange?.(clamped);
    },
    [controlled, onStepChange, steps.length],
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <StepIndicator steps={steps} current={current} completed={current - 1} />
      <div className="min-h-32 rounded-lg border bg-card p-4">{renderStep(current)}</div>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => go(current - 1)}
          disabled={current === 0}
        >
          <ChevronLeft className="size-4" />
          {labels?.back ?? 'Back'}
        </Button>
        {isLast ? (
          <Button onClick={() => onComplete?.()} disabled={!canGoNext}>
            <Check className="size-4" />
            {labels?.finish ?? 'Finish'}
          </Button>
        ) : (
          <Button onClick={() => go(current + 1)} disabled={!canGoNext}>
            {labels?.next ?? 'Next'}
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
