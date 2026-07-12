'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FieldBase, type FieldBaseProps } from './FieldBase';

export interface NumberFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'input'>, 'name' | 'type' | 'onChange' | 'value'> {}

/** Numeric input bound to react-hook-form (coerces to number). */
export function NumberField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  ...inputProps
}: NumberFieldProps) {
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
          <Input
            id={name}
            type="number"
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
        </FieldBase>
      )}
    />
  );
}
