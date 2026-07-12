'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FieldBase, type FieldBaseProps } from './FieldBase';

export interface TextareaFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'textarea'>, 'name'> {}

/** Multiline textarea bound to react-hook-form. */
export function TextareaField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  ...textareaProps
}: TextareaFieldProps) {
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
          <Textarea
            id={name}
            aria-invalid={!!(error ?? fieldState.error)}
            {...textareaProps}
            {...field}
            value={(field.value as string) ?? ''}
          />
        </FieldBase>
      )}
    />
  );
}
