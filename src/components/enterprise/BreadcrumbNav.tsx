'use client';

import { cn } from '@/lib/utils';
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Breadcrumb } from '@/features/shared/types';

export interface BreadcrumbNavProps {
  items: Breadcrumb[];
  className?: string;
  /** Called with the item's href (if present) on click. */
  onNavigate?: (href: string) => void;
}

/** Breadcrumb navigation built on the shadcn Breadcrumb primitive. */
export function BreadcrumbNav({ items, className, onNavigate }: BreadcrumbNavProps) {
  if (!items.length) return null;
  return (
    <BreadcrumbRoot className={cn(className)}>
      <BreadcrumbList>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const Icon = item.icon;
          return (
            <BreadcrumbItem key={`${item.label}-${idx}`}>
              {isLast || !item.href ? (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  {Icon && <Icon className="size-3.5" />}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="flex items-center gap-1.5 cursor-pointer"
                  onClick={() => item.href && onNavigate?.(item.href)}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {item.label}
                </BreadcrumbLink>
              )}
              {!isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
