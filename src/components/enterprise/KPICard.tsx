'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPIDefinition } from '@/features/shared/types';

export interface KPICardProps extends KPIDefinition {
  className?: string;
  onClick?: () => void;
}

/** KPI metric card with trend indicator and optional sparkline. */
export function KPICard({
  label,
  value,
  delta,
  unit,
  icon: Icon,
  trend,
  className,
  onClick,
}: KPICardProps) {
  const hasDelta = typeof delta === 'number';
  const isUp = hasDelta && delta! > 0;
  const isDown = hasDelta && delta! < 0;
  const flat = hasDelta && delta === 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = flat
    ? 'text-muted-foreground'
    : isUp
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <Card
      className={cn(
        'p-5 gap-2',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      {hasDelta && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon className="size-3.5" />
          <span className="tabular-nums">
            {isUp ? '+' : ''}
            {delta}%
          </span>
          <span className="text-muted-foreground font-normal">vs last period</span>
        </div>
      )}
      {trend && trend.length > 1 && (
        <Sparkline data={trend} className={isUp ? 'stroke-emerald-500' : isDown ? 'stroke-rose-500' : 'stroke-muted-foreground'} />
      )}
    </Card>
  );
}

/** Minimal inline SVG sparkline. */
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const step = w / (data.length - 1);
  const points = data
    .map((d, i) => `${i * step},${h - ((d - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('w-full h-6', className)} preserveAspectRatio="none">
      <polyline points={points} fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
