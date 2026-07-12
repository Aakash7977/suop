'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from './EmptyState';
import { PanelRightOpen } from 'lucide-react';

export interface MasterDetailLayoutProps<T> {
  /** Master list items. */
  items: T[];
  /** Render a single master list row. */
  renderRow: (item: T, isActive: boolean) => React.ReactNode;
  /** Key extractor for the list. */
  getKey: (item: T) => string;
  /** Currently active item. */
  activeItem?: T | null;
  /** Render the detail panel for the active item. */
  renderDetail: (item: T) => React.ReactNode;
  /** Called when a master row is clicked. */
  onSelect: (item: T) => void;
  /** Optional header above the master list. */
  masterHeader?: React.ReactNode;
  /** Optional footer of the master list. */
  masterFooter?: React.ReactNode;
  /** Empty state shown in the detail pane when nothing is selected. */
  detailEmpty?: React.ReactNode;
  className?: string;
  /** Master pane width in pixels (default 320). */
  masterWidth?: number;
}

/** Split view with a master list + detail panel. */
export function MasterDetailLayout<T>({
  items,
  renderRow,
  getKey,
  activeItem,
  renderDetail,
  onSelect,
  masterHeader,
  masterFooter,
  detailEmpty,
  className,
  masterWidth = 320,
}: MasterDetailLayoutProps<T>) {
  const activeKey = activeItem ? getKey(activeItem) : undefined;
  return (
    <div className={cn('flex h-full min-h-0 overflow-hidden rounded-lg border', className)}>
      <aside
        className="flex shrink-0 flex-col border-r bg-card"
        style={{ width: masterWidth }}
      >
        {masterHeader && <div className="border-b p-3">{masterHeader}</div>}
        <ScrollArea className="flex-1">
          <ul className="divide-y">
            {items.length === 0 ? (
              <li className="p-3 text-sm text-muted-foreground">No items</li>
            ) : (
              items.map((item) => {
                const key = getKey(item);
                return (
                  <li
                    key={key}
                    onClick={() => onSelect(item)}
                    className={cn(
                      'cursor-pointer',
                      activeKey === key && 'bg-accent',
                    )}
                  >
                    {renderRow(item, activeKey === key)}
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
        {masterFooter && <div className="border-t p-3">{masterFooter}</div>}
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        {activeItem ? (
          <ScrollArea className="flex-1">
            <div className="p-4">{renderDetail(activeItem)}</div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            {detailEmpty ?? (
              <EmptyState
                icon={PanelRightOpen}
                title="Select an item"
                description="Choose an item from the list to view its details."
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
