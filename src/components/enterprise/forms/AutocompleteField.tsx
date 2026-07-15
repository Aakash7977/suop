'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { cn } from '@/lib/utils';

export interface AutocompleteOption {
  label: string;
  value: string;
}

export interface AutocompleteFieldProps extends FieldBaseProps {
  options: AutocompleteOption[];
  placeholder?: string;
}

/** Text input with a suggestion dropdown bound to react-hook-form. */
export function AutocompleteField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  options,
  placeholder,
}: AutocompleteFieldProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = options.find((o) => o.value === field.value);
        const display = open ? query : selected?.label ?? '';
        const filtered = options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );
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
            <div className="relative">
              <Input
                id={name}
                aria-invalid={!!(error ?? fieldState.error)}
                placeholder={placeholder ?? 'Type to search…'}
                value={display}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  setQuery(selected?.label ?? '');
                  setOpen(true);
                }}
                onBlur={() => {
                  setOpen(false);
                  field.onBlur();
                }}
              />
              {open && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                  {filtered.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        'flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-accent',
                        opt.value === field.value && 'bg-accent',
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        field.onChange(opt.value);
                        setOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FieldBase>
        );
      }}
    />
  );
}
