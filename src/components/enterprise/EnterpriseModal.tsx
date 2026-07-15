'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

export interface EnterpriseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
  /** Show the default close button in the top-right. */
  showClose?: boolean;
  /** When true, the body uses a scroll area with a max height. */
  scrollable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const SIZE_MAP: Record<NonNullable<EnterpriseModalProps['size']>, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-[95vw] h-[90vh]',
};

/** Standardized modal dialog built on shadcn Dialog. */
export function EnterpriseModal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  footer,
  showClose = true,
  scrollable = false,
  className,
  children,
}: EnterpriseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SIZE_MAP[size], 'gap-0 p-0', className)}>
        <DialogHeader className="border-b p-4 pr-12">
          <DialogTitle className="text-base">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {scrollable ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="p-4">{children}</div>
          </ScrollArea>
        ) : (
          <div className="p-4">{children}</div>
        )}
        {footer && <DialogFooter className="border-t p-3">{footer}</DialogFooter>}
        {showClose && (
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 size-7"
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}
