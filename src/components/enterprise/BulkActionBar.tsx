'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary';
  /** When true, the action requires confirmation elsewhere. */
  destructive?: boolean;
}

export interface BulkActionBarProps {
  /** Number of selected items. */
  count: number;
  actions: BulkAction[];
  onClear?: () => void;
  className?: string;
}

/** Floating action toolbar that appears when items are selected. */
export function BulkActionBar({
  count,
  actions,
  onClear,
  className,
}: BulkActionBarProps) {
  if (count <= 0) return null;
  return (
    <div
      className={cn(
        'sticky bottom-4 z-30 mx-auto flex w-fit items-center gap-2 rounded-full border bg-background/95 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className,
      )}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="pl-2 pr-1 text-sm font-medium">
        {count} selected
      </span>
      <div className="h-4 w-px bg-border" />
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <Button
            key={i}
            size="sm"
            variant={action.variant ?? (action.destructive ? 'destructive' : 'outline')}
            onClick={action.onClick}
            className="rounded-full"
          >
            {Icon && <Icon className="size-3.5" />}
            {action.label}
          </Button>
        );
      })}
      {onClear && (
        <Button
          size="icon"
          variant="ghost"
          className="size-7 rounded-full"
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
