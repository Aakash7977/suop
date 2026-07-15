'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { IndianRupee } from 'lucide-react';

export interface CurrencyFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'input'>, 'name' | 'type' | 'onChange' | 'value'> {
  /** ISO currency code shown as a prefix (e.g. INR, USD). */
  currency?: string;
  /** Use a rupee icon instead of the code text (default for INR). */
  icon?: boolean;
}

/** Currency amount input bound to react-hook-form. */
export function CurrencyField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  currency = 'INR',
  icon = true,
  ...inputProps
}: CurrencyFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldBase
          label={label}
          required={required}
          error={error ?? fieldState.error?.message}
          description={description}
          hideLabel={hideLabel}
          className={className}
          htmlFor={name}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon ? <IndianRupee className="size-4" /> : currency}
            </span>
            <Input
              id={name}
              type="number"
              inputMode="decimal"
              className="pl-9"
              aria-invalid={!!(error ?? fieldState.error)}
              {...inputProps}
              value={field.value ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                field.onChange(v === '' ? undefined : Number(v));
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </div>
        </FieldBase>
      )}
    />
  );
}
