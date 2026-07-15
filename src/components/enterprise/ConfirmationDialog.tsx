'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  Skull,
} from 'lucide-react';
import type { RiskLevel } from '@/features/shared/types';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  risk?: RiskLevel;
  /** Optional detail items shown as a bulleted list. */
  details?: string[];
}

const RISK_CONFIG: Record<
  RiskLevel,
  { icon: React.ComponentType<{ className?: string }>; className: string; iconWrap: string; confirm: string }
> = {
  low: {
    icon: Info,
    className: '',
    iconWrap: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    confirm: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
  medium: {
    icon: AlertTriangle,
    className: '',
    iconWrap: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    confirm: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  high: {
    icon: ShieldAlert,
    className: '',
    iconWrap: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    confirm: 'bg-orange-600 text-white hover:bg-orange-700',
  },
  critical: {
    icon: Skull,
    className: '',
    iconWrap: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    confirm: 'bg-destructive text-white hover:bg-destructive/90',
  },
};

/** Confirmation dialog with risk level styling. */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  risk = 'low',
  details,
}: ConfirmationDialogProps) {
  const cfg = RISK_CONFIG[risk];
  const Icon = cfg.icon;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className={cn('rounded-lg p-2 shrink-0', cfg.iconWrap)}>
              <Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription>{description}</AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        {details && details.length > 0 && (
          <ul className="my-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
            {details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className={cn('ml-2', cfg.confirm)} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
