'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { BarcodeViewer } from '../BarcodeViewer';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { QrCode } from 'lucide-react';

export interface QrFieldProps
  extends FieldBaseProps,
    Omit<React.ComponentProps<'input'>, 'name'> {
  preview?: boolean;
}

/** Text field that stores a QR payload with an optional live QR preview. */
export function QrField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  preview = true,
  ...inputProps
}: QrFieldProps) {
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
            <QrCode className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
            <div className="pt-1 w-32">
              <BarcodeViewer value={String(field.value)} variant="qr" showValue={false} />
            </div>
          )}
        </FieldBase>
      )}
    />
  );
}
