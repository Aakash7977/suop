'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** When true, render a compact inline variant (no large icon). */
  compact?: boolean;
  className?: string;
}

/** Error state with optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this content.',
  onRetry,
  compact,
  className,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm', className)}>
        <AlertTriangle className="size-4 text-destructive shrink-0" />
        <span className="text-destructive flex-1">{title}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 px-6 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="size-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  );
}
