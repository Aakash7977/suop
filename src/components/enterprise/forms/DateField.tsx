'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateFieldProps extends FieldBaseProps {
  placeholder?: string;
  /** Date format string (date-fns). */
  formatStr?: string;
}

/** Date picker bound to react-hook-form (stores ISO date string). */
export function DateField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  placeholder = 'Pick a date',
  formatStr = 'yyyy-MM-dd',
}: DateFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const date = field.value ? parseISO(String(field.value)) : undefined;
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  variant="outline"
                  className={cn(
                    'w-full justify-start font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                  aria-invalid={!!(error ?? fieldState.error)}
                >
                  <CalendarIcon className="size-4" />
                  {field.value ? format(date!, formatStr) : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => field.onChange(d ? format(d, 'yyyy-MM-dd') : undefined)}
                />
              </PopoverContent>
            </Popover>
          </FieldBase>
        );
      }}
    />
  );
}
