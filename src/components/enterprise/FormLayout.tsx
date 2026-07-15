'use client';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  /** Two-column grid by default; set to false for single column. */
  columns?: 1 | 2 | 3;
  fields: React.ReactNode;
}

export interface FormLayoutProps {
  title?: string;
  description?: string;
  sections: FormSection[];
  /** Footer actions (Save / Cancel buttons). */
  footer?: React.ReactNode;
  className?: string;
}

/** Standard form layout with titled sections and a sticky action footer. */
export function FormLayout({
  title,
  description,
  sections,
  footer,
  className,
}: FormLayoutProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {sections.map((section, idx) => (
        <div key={section.id} className="space-y-4">
          {idx > 0 && <Separator />}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-xs text-muted-foreground">{section.description}</p>
            )}
          </div>
          <div
            className={cn(
              'grid gap-4',
              section.columns === 1 && 'grid-cols-1',
              (!section.columns || section.columns === 2) && 'grid-cols-1 sm:grid-cols-2',
              section.columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            )}
          >
            {section.fields}
          </div>
        </div>
      ))}
      {footer && (
        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
          {footer}
        </div>
      )}
    </div>
  );
}
