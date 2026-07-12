'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category?: string;
}

export interface SearchPanelProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSearch?: (query: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
  /** Render in a compact (icon-trigger) variant. */
  compact?: boolean;
}

/** Global search input with a dropdown of suggestions. */
export function SearchPanel({
  placeholder = 'Search…',
  suggestions = [],
  onSearch,
  onSelect,
  className,
  compact = false,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = suggestions.filter((s) =>
    query
      ? s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch?.(query);
              setOpen(false);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={placeholder}
          className={cn('pl-8', compact && 'h-8')}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          <ul className="max-h-72 overflow-y-auto p-1">
            {filtered.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      onSelect?.(s);
                      setOpen(false);
                    }}
                  >
                    {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{s.label}</p>
                      {s.description && (
                        <p className="truncate text-xs text-muted-foreground">{s.description}</p>
                      )}
                    </div>
                    {s.category && (
                      <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
                        {s.category}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
