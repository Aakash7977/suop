'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Filter, ChevronDown, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: unknown;
}

export interface AdvancedFiltersProps {
  fields: FilterField[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** Default open state. */
  defaultOpen?: boolean;
  className?: string;
}

/** Collapsible filter panel supporting text, select, date, and number fields. */
export function AdvancedFilters({
  fields,
  values,
  onChange,
  defaultOpen = false,
  className,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(defaultOpen);
  const activeCount = fields.filter((f) => {
    const v = values[f.key];
    if (v == null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  const set = (key: string, val: unknown) => onChange({ ...values, [key]: val });
  const reset = () => onChange({});

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('rounded-lg border', className)}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Filter className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <FilterControl
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(v) => set(field.key, v)}
              />
            ))}
          </div>
          {activeCount > 0 && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="size-3.5" /> Clear all
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FilterControl({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: unknown;
  onChange: (v: unknown) => void;
}): ReactNode {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{field.label}</Label>
      {field.type === 'text' && (
        <Input
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="h-8"
        />
      )}
      {field.type === 'number' && (
        <Input
          type="number"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="h-8"
        />
      )}
      {field.type === 'select' && (
        <Select value={(value as string) ?? ''} onValueChange={onChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder={field.placeholder ?? 'Select…'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.type === 'date' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-start font-normal">
              <CalendarIcon className="size-3.5" />
              {value ? format(new Date(value as string), 'PP') : (field.placeholder ?? 'Pick a date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value as string) : undefined}
              onSelect={(d) => onChange(d?.toISOString())}
            />
          </PopoverContent>
        </Popover>
      )}
      {field.type === 'daterange' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-start font-normal">
              <CalendarIcon className="size-3.5" />
              {value ? (value as string) : (field.placeholder ?? 'Select range')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={undefined} onSelect={() => onChange(new Date().toISOString())} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
