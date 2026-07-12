'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FieldBase, type FieldBaseProps } from './FieldBase';

export interface DateTimeFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'input'>, 'name' | 'type' | 'onChange' | 'value'> {}

/** Date+time input (native) bound to react-hook-form. */
export function DateTimeField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  ...inputProps
}: DateTimeFieldProps) {
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
            type="datetime-local"
            aria-invalid={!!(error ?? fieldState.error)}
            {...inputProps}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FieldBase>
      )}
    />
  );
}
