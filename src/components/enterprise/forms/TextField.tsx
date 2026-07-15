'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FieldBase, type FieldBaseProps } from './FieldBase';

export interface TextFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'input'>, 'name'> {}

/** Standard text input bound to react-hook-form. */
export function TextField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  ...inputProps
}: TextFieldProps) {
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
            aria-invalid={!!(error ?? fieldState.error)}
            {...inputProps}
            {...field}
            value={(field.value as string) ?? ''}
          />
        </FieldBase>
      )}
    />
  );
}
