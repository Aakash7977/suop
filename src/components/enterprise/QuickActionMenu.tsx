'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

export interface QuickActionMenuProps {
  actions: QuickAction[];
  className?: string;
  /** Position the floating button. */
  align?: 'right' | 'left' | 'center';
  /** Trigger label. */
  triggerLabel?: string;
}

/** Floating quick-action menu (FAB-style) for contextual shortcuts. */
export function QuickActionMenu({
  actions,
  className,
  align = 'right',
  triggerLabel = 'Quick Actions',
}: QuickActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bottom-6 z-40',
        align === 'right' && 'right-6',
        align === 'left' && 'left-6',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        className,
      )}
    >
      <div className="flex flex-col items-end gap-2">
        {open && (
          <div className="flex flex-col items-end gap-1.5 pb-1">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-2"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="rounded-md bg-background px-2 py-1 text-xs font-medium shadow-md border">
                    {action.label}
                  </span>
                  <Button
                    size="icon"
                    className="size-10 rounded-full shadow-lg"
                    onClick={() => {
                      action.onClick();
                      setOpen(false);
                    }}
                    aria-label={action.label}
                  >
                    {Icon && <Icon className="size-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <Button
          size="icon"
          className="size-12 rounded-full shadow-xl"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={triggerLabel}
        >
          <span className={cn('transition-transform', open && 'rotate-45')}>+</span>
        </Button>
      </div>
    </div>
  );
}


