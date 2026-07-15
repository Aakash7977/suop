'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

export interface EnterpriseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const WIDTH_MAP: Record<NonNullable<EnterpriseDrawerProps['width']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
};

/** Standardized drawer panel built on shadcn Sheet. */
export function EnterpriseDrawer({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  width = 'md',
  footer,
  className,
  children,
}: EnterpriseDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          'flex flex-col gap-0 p-0 w-full',
          side === 'right' || side === 'left' ? WIDTH_MAP[width] : '',
          className,
        )}
      >
        <SheetHeader className="border-b p-4 pr-12">
          <SheetTitle className="text-base">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4">{children}</div>
        </ScrollArea>
        {footer && <SheetFooter className="border-t p-3">{footer}</SheetFooter>}
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 size-7"
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
