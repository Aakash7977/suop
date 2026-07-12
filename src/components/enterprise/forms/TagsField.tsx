'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { X, Plus } from 'lucide-react';

export interface TagsFieldProps extends FieldBaseProps {
  placeholder?: string;
}

/** Tag/chip input that stores a string[] bound to react-hook-form. */
export function TagsField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  placeholder = 'Add tag and press Enter',
}: TagsFieldProps) {
  const { control } = useFormContext();
  const [draft, setDraft] = useState('');

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field, fieldState }) => {
        const tags = Array.isArray(field.value) ? (field.value as string[]) : [];
        const add = () => {
          const v = draft.trim();
          if (v && !tags.includes(v)) {
            field.onChange([...tags, v]);
          }
          setDraft('');
        };
        const remove = (t: string) => field.onChange(tags.filter((x) => x !== t));
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
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border p-2">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => remove(t)}
                    className="ml-0.5 hover:text-destructive"
                    aria-label={`Remove ${t}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex flex-1 items-center gap-1">
                <Input
                  id={name}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      add();
                    }
                  }}
                  placeholder={tags.length ? '' : placeholder}
                  className="h-7 border-0 p-0 shadow-none focus-visible:ring-0"
                />
                {draft && (
                  <Button type="button" size="icon" variant="ghost" className="size-6" onClick={add}>
                    <Plus className="size-3" />
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
