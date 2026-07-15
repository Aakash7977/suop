'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import type { Command } from '@/features/shared/types';

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  className?: string;
}

function matches(cmd: Command, query: string): boolean {
  const q = query.toLowerCase();
  if (!q) return true;
  if (cmd.label.toLowerCase().includes(q)) return true;
  if (cmd.hint?.toLowerCase().includes(q)) return true;
  if (cmd.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
  return false;
}

/** Cmd+K command palette with fuzzy search over a flat command list. */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  className,
}: CommandPaletteProps) {
  // Global hotkey listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const groups = new Map<string, Command[]>();
  for (const cmd of commands) {
    const g = cmd.group ?? 'Commands';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(cmd);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search commands and navigate the platform"
      className={cn('sm:max-w-2xl', className)}
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        {Array.from(groups.entries()).map(([group, items], idx) => (
          <div key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <CommandItem
                    key={cmd.id}
                    value={`${cmd.label} ${cmd.keywords?.join(' ') ?? ''} ${cmd.hint ?? ''}`}
                    onSelect={() => {
                      onOpenChange(false);
                      cmd.action?.();
                    }}
                    className="gap-2"
                  >
                    {Icon && <Icon className="size-4 text-muted-foreground" />}
                    <div className="flex-1 min-w-0">
                      <span>{cmd.label}</span>
                      {cmd.hint && (
                        <span className="block text-xs text-muted-foreground">{cmd.hint}</span>
                      )}
                    </div>
                    {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
