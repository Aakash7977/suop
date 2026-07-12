'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Command as CommandPrimitive,
} from 'cmdk';
import { Search, ArrowRight } from 'lucide-react';
import type { Command } from '@/features/shared/types';

export interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Flat list of searchable records. */
  commands: Command[];
  className?: string;
}

/**
 * Global search modal (Shift+Cmd+K or triggered from the header).
 * Surfaces navigation commands & records with fuzzy matching.
 */
export function GlobalSearch({
  open,
  onOpenChange,
  commands,
  className,
}: GlobalSearchProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of commands) {
      const g = c.group ?? 'Results';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    return Array.from(map.entries());
  }, [commands]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('overflow-hidden p-0 sm:max-w-2xl', className)}>
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across all modules and records
        </DialogDescription>
        <CommandPrimitive className="flex h-full w-full flex-col overflow-hidden">
          <div className="flex h-12 items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              placeholder="Search modules, records, actions…"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandPrimitive.List className="max-h-80 overflow-y-auto p-2">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandPrimitive.Empty>
            {grouped.map(([group, items]) => (
              <CommandPrimitive.Group
                key={group}
                heading={group}
                className="text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
              >
                {items.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <CommandPrimitive.Item
                      key={cmd.id}
                      value={`${cmd.label} ${cmd.keywords?.join(' ') ?? ''}`}
                      onSelect={() => {
                        onOpenChange(false);
                        cmd.action?.();
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    >
                      {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{cmd.label}</p>
                        {cmd.hint && (
                          <p className="truncate text-xs text-muted-foreground">{cmd.hint}</p>
                        )}
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 aria-selected:opacity-100" />
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            Press <kbd className="rounded border bg-muted px-1">↵</kbd> to open ·{' '}
            <kbd className="rounded border bg-muted px-1">esc</kbd> to close
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
