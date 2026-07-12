'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Check,
} from 'lucide-react';
import type { Notification } from '@/features/shared/types';

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClear?: () => void;
  className?: string;
}

const TYPE_ICON: Record<NonNullable<Notification['type']>, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const TYPE_COLOR: Record<NonNullable<Notification['type']>, string> = {
  info: 'text-sky-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-rose-500',
};

/** Notification bell dropdown with unread count and tabbed filters. */
export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClear,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && <Badge variant="secondary">{unread} new</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {onMarkAllRead && unread > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onMarkAllRead}>
                <Check className="size-3" /> Mark all read
              </Button>
            )}
          </div>
        </div>
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Unread
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <NotificationList
              items={notifications}
              onMarkRead={onMarkRead}
              onClear={onClear}
            />
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            <NotificationList
              items={notifications.filter((n) => !n.read)}
              onMarkRead={onMarkRead}
              onClear={onClear}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function NotificationList({
  items,
  onMarkRead,
  onClear,
}: {
  items: Notification[];
  onMarkRead?: (id: string) => void;
  onClear?: () => void;
}) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <Bell className="size-8 opacity-40" />
        <p>You&apos;re all caught up!</p>
      </div>
    );
  }
  return (
    <ScrollArea className="h-80">
      <ul className="divide-y">
        {items.map((n) => {
          const Icon = n.type ? TYPE_ICON[n.type] : Info;
          const color = n.type ? TYPE_COLOR[n.type] : 'text-muted-foreground';
          return (
            <li
              key={n.id}
              className={cn(
                'flex gap-3 p-3 hover:bg-accent cursor-pointer',
                !n.read && 'bg-primary/5',
              )}
              onClick={() => onMarkRead?.(n.id)}
            >
              <Icon className={cn('size-4 mt-0.5 shrink-0', color)} />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium leading-tight">{n.title}</p>
                {n.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                )}
                <p className="text-[11px] text-muted-foreground">{n.timestamp}</p>
              </div>
              {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
            </li>
          );
        })}
      </ul>
      {onClear && (
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onClear}>
            Clear all
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}
