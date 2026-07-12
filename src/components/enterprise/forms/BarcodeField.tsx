'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { BarcodeViewer } from '../BarcodeViewer';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { Barcode } from 'lucide-react';

export interface BarcodeFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'input'>, 'name'> {
  /** Show a live barcode preview below the input. */
  preview?: boolean;
}

/** Text field that stores a barcode value with an optional live preview. */
export function BarcodeField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  preview = true,
  ...inputProps
}: BarcodeFieldProps) {
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
            <Barcode className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={name}
              className="pl-8"
              aria-invalid={!!(error ?? fieldState.error)}
              {...inputProps}
              {...field}
              value={(field.value as string) ?? ''}
            />
          </div>
          {preview && field.value && (
            <div className="pt-1">
              <BarcodeViewer value={String(field.value)} height={40} showValue={false} />
            </div>
          )}
        </FieldBase>
      )}
    />
  );
}
