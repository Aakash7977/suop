'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectFieldProps extends FieldBaseProps {
  options: MultiSelectOption[];
  placeholder?: string;
}

/** Multi-select dropdown storing string[] bound to react-hook-form. */
export function MultiSelectField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  options,
  placeholder = 'Select…',
}: MultiSelectFieldProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field, fieldState }) => {
        const selected = Array.isArray(field.value) ? (field.value as string[]) : [];
        const toggle = (v: string) => {
          if (selected.includes(v)) field.onChange(selected.filter((x) => x !== v));
          else field.onChange([...selected, v]);
        };
        const selectedLabels = options
          .filter((o) => selected.includes(o.value))
          .map((o) => o.label);
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                >
                  <span className={cn('truncate', !selected.length && 'text-muted-foreground')}>
                    {selected.length ? `${selected.length} selected` : placeholder}
                  </span>
                  <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <div className="max-h-60 overflow-auto p-1">
                  {options.map((opt) => {
                    const isSel = selected.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                          isSel && 'bg-accent',
                        )}
                        onClick={() => toggle(opt.value)}
                      >
                        <span className="flex size-4 items-center justify-center rounded-sm border">
                          {isSel && <Check className="size-3" />}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {selectedLabels.map((l) => (
                  <Badge key={l} variant="secondary" className="text-[10px]">
                    {l}
                  </Badge>
                ))}
              </div>
            )}
          </FieldBase>
        );
      }}
    />
  );
}
