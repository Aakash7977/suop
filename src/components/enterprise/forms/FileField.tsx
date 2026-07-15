'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { Upload, File as FileIcon, X } from 'lucide-react';

export interface FileFieldProps extends FieldBaseProps {
  /** Accepted MIME types / extensions. */
  accept?: string;
  /** Allow multiple files. */
  multiple?: boolean;
}

/** File upload input bound to react-hook-form (stores File[]). */
export function FileField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  accept,
  multiple,
}: FileFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field, fieldState }) => {
        const files = Array.isArray(field.value) ? (field.value as File[]) : [];
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
            <label
              htmlFor={name}
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed p-4 text-sm text-muted-foreground hover:bg-accent/50"
            >
              <Upload className="size-5" />
              <span>Click to upload{multiple ? ' (multiple)' : ''}</span>
              <Input
                id={name}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  field.onChange(multiple ? list : list[0]);
                }}
              />
            </label>
            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
                  >
                    <FileIcon className="size-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-5"
                      onClick={() => {
                        const next = files.filter((_, idx) => idx !== i);
                        field.onChange(multiple ? next : next[0]);
                      }}
                      aria-label="Remove file"
                    >
                      <X className="size-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </FieldBase>
        );
      }}
    />
  );
}
