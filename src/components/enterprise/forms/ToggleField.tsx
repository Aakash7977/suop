'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToggleFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

/** Toggle switch bound to react-hook-form (boolean). */
export function ToggleField({
  name,
  label,
  required,
  error,
  description,
  className,
  disabled,
}: ToggleFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn('flex flex-col gap-1', className)}>
          <div className="flex items-center justify-between gap-3">
            {label && (
              <div className="space-y-0.5">
                <Label htmlFor={name} className="text-sm font-medium leading-none">
                  {label}
                  {required && <span className="ml-0.5 text-destructive">*</span>}
                </Label>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            <Switch
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled || field.disabled}
            />
          </div>
          {(error ?? fieldState.error?.message) && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3" />
              {error ?? fieldState.error?.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
