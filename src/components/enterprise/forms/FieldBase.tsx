'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export interface FieldBaseProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  /** Hide the label (still used for a11y). */
  hideLabel?: boolean;
  className?: string;
}

/** Shared wrapper that renders label, description, error, and content slot. */
export function FieldBase({
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  children,
  htmlFor,
}: FieldBaseProps & { children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && !hideLabel && (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}
