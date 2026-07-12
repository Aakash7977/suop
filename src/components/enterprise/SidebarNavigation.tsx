'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Star,
  Clock,
  ChevronDown,
  Search,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { buildGroupedNav } from '@/features/shared/navigation';
import type { NavItem } from '@/features/shared/types';

export interface SidebarNavigationProps {
  /** Active item key. */
  activeKey: string;
  /** Called when a nav item is clicked. */
  onSelect: (key: string) => void;
  /** Favorite item keys (persisted by caller). */
  favorites?: string[];
  /** Recently visited item keys (most-recent-first). */
  recents?: string[];
  /** Toggle favorite for an item. */
  onToggleFavorite?: (key: string) => void;
  /** Collapsed (icon-only) state. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
}

/** Enterprise sidebar with module grouping, favorites & recents. */
export function SidebarNavigation({
  activeKey,
  onSelect,
  favorites = [],
  recents = [],
  onToggleFavorite,
  collapsed = false,
  className,
}: SidebarNavigationProps) {
  const [query, setQuery] = useState('');
  const groups = buildGroupedNav();

  const flatItems = groups.flatMap((g) => g.items);
  const favItems = flatItems.filter((i) => favorites.includes(i.key));
  const recentItems = recents
    .map((k) => flatItems.find((i) => i.key === k))
    .filter(Boolean) as NavItem[];

  const matches = (item: NavItem) =>
    !query || item.label.toLowerCase().includes(query.toLowerCase());

  const renderItem = (item: NavItem) => {
    const Icon = item.icon ?? LayoutDashboard;
    const isActive = item.key === activeKey;
    const isFav = favorites.includes(item.key);
    return (
      <div key={item.key} className="group relative">
        <button
          type="button"
          onClick={() => onSelect(item.key)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
          title={collapsed ? item.label : undefined}
        >
          <Icon className="size-4 shrink-0" />
          {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
          {!collapsed && typeof item.badge === 'number' && item.badge > 0 && (
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px] font-medium',
                isActive ? 'bg-primary-foreground/20' : 'bg-muted',
              )}
            >
              {item.badge}
            </span>
          )}
        </button>
        {onToggleFavorite && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-1 top-1/2 size-6 -translate-y-1/2 opacity-0 group-hover:opacity-100',
              isFav && 'opacity-100 text-amber-500',
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.key);
            }}
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
          >
            <Star className={cn('size-3.5', isFav && 'fill-current')} />
          </Button>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-card',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
    >
      {!collapsed && (
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules…"
              className="h-8 pl-8 pr-7 text-xs"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 size-6 -translate-y-1/2"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      <ScrollArea className="flex-1">
        <nav className="space-y-4 p-2">
          {/* Favorites */}
          {!collapsed && favItems.length > 0 && !query && (
            <SidebarSection icon={Star} label="Favorites">
              {favItems.filter(matches).map(renderItem)}
            </SidebarSection>
          )}
          {/* Recents */}
          {!collapsed && recentItems.length > 0 && !query && (
            <SidebarSection icon={Clock} label="Recent">
              {recentItems.filter(matches).map(renderItem)}
            </SidebarSection>
          )}

          {/* Module groups */}
          {groups.map((group) => {
            const visible = group.items.filter(matches);
            if (!visible.length) return null;
            if (collapsed) {
              return (
                <div key={group.id} className="space-y-1">
                  {visible.map(renderItem)}
                </div>
              );
            }
            return (
              <Collapsible key={group.id} defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                  {group.label}
                  <ChevronDown className="size-3 [[data-state=closed]_&]:rotate-180 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 space-y-0.5">{visible.map(renderItem)}</div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {query && flatItems.filter(matches).length === 0 && (
            <p className="px-2.5 py-4 text-xs text-muted-foreground">No modules match &ldquo;{query}&rdquo;.</p>
          )}
        </nav>
      </ScrollArea>
      {!collapsed && (
        <>
          <Separator />
          <div className="p-3 text-[11px] text-muted-foreground">
            SUOP ERP · v1.0 · &copy; {new Date().getFullYear()} Sudhastar
          </div>
        </>
      )}
    </aside>
  );
}

function SidebarSection({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
