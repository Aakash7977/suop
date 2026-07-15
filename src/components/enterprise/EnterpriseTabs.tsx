'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EnterpriseTabItem {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional count badge shown next to the label. */
  badge?: number;
  /** Disable this tab. */
  disabled?: boolean;
  content: React.ReactNode;
}

export interface EnterpriseTabsProps {
  items: EnterpriseTabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  /** Render tabs as a vertical list on the left. */
  vertical?: boolean;
  className?: string;
  /** Persist the scroll position of each tab's content. */
  scrollable?: boolean;
}

/** Tab navigation with optional count badges and a vertical variant. */
export function EnterpriseTabs({
  items,
  value,
  onValueChange,
  vertical = false,
  className,
  scrollable = false,
}: EnterpriseTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn(vertical ? 'flex flex-row gap-4' : 'flex flex-col gap-3', className)}
    >
      <TabsList className={cn(vertical ? 'flex-col h-auto self-start' : 'w-full')}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn('gap-1.5', vertical && 'w-full justify-start')}
            >
              {Icon && <Icon className="size-3.5" />}
              {item.label}
              {typeof item.badge === 'number' && item.badge > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className="mt-0 flex-1 min-h-0">
          {scrollable ? (
            <ScrollArea className="h-full max-h-[70vh]">
              <div className="pr-2">{item.content}</div>
            </ScrollArea>
          ) : (
            item.content
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
