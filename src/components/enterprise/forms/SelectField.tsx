'use client';

import { Controller, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldBase, type FieldBaseProps } from './FieldBase';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends FieldBaseProps {
  options: SelectOption[];
  placeholder?: string;
}

/** Select dropdown bound to react-hook-form. */
export function SelectField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  options,
  placeholder,
}: SelectFieldProps) {
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
          <Select
            value={(field.value as string) ?? ''}
            onValueChange={field.onChange}
            disabled={field.disabled}
          >
            <SelectTrigger id={name} aria-invalid={!!(error ?? fieldState.error)}>
              <SelectValue placeholder={placeholder ?? 'Select…'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBase>
      )}
    />
  );
}
