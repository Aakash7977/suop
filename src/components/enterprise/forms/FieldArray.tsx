'use client';

import { useFieldArray, useFormContext, type FieldArrayWithId } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FieldArrayProps {
  name: string;
  label?: string;
  description?: string;
  /** Render a single row of the array. Receives the row id and index. */
  renderItem: (item: FieldArrayWithId, index: number) => React.ReactNode;
  /** Label for the add button. */
  addLabel?: string;
  /** Default value pushed when adding a row. */
  defaultValue?: unknown;
  className?: string;
  /** Disable add/remove controls (read-only mode). */
  disabled?: boolean;
}

/** Dynamic repeatable field array bound to react-hook-form useFieldArray. */
export function FieldArray({
  name,
  label,
  description,
  renderItem,
  addLabel = 'Add item',
  defaultValue = {},
  className,
  disabled,
}: FieldArrayProps) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className={cn('space-y-3', className)}>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <p className="text-sm font-medium">{label}</p>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <Separator className="mb-3" />}
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">{renderItem(item, index)}</div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 size-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Remove row"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultValue as Record<string, unknown>)}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
