'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { ImagePlus, X } from 'lucide-react';

export interface ImageFieldProps extends FieldBaseProps {
  accept?: string;
  /** Max preview width in px. */
  previewWidth?: number;
}

/** Image upload field with a thumbnail preview, bound to react-hook-form. */
export function ImageField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  accept = 'image/*',
  previewWidth = 96,
}: ImageFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const file = field.value as File | undefined;
        const url = file ? URL.createObjectURL(file) : undefined;
        return (
          <FieldBase
            label={label}
            required={required}
            error={error ?? fieldState.error?.message}
            description={description}
            hideLabel={hideLabel}
            className={className}
            htmlFor={name}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center overflow-hidden rounded-md border bg-muted"
                style={{ width: previewWidth, height: previewWidth }}
              >
                {url ? (
                  <img src={url} alt="Preview" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={name}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent"
                >
                  <ImagePlus className="size-4" />
                  {file ? 'Change' : 'Upload'}
                </label>
                <input
                  id={name}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
                {file && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive"
                    onClick={() => field.onChange(undefined)}
                  >
                    <X className="size-3" /> Remove
                  </Button>
                )}
              </div>
            </div>
          </FieldBase>
        );
      }}
    />
  );
}
