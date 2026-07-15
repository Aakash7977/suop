'use client';

import { useRef, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FieldBase, type FieldBaseProps } from './FieldBase';
import { PenTool, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SignatureFieldProps extends FieldBaseProps {
  /** Canvas height in px. */
  height?: number;
  /** Stroke color. */
  penColor?: string;
}

/** Signature pad (canvas) bound to react-hook-form (stores data URL). */
export function SignatureField({
  name,
  label,
  required,
  error,
  description,
  hideLabel,
  className,
  height = 140,
  penColor = '#111',
}: SignatureFieldProps) {
  const { control } = useFormContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, [penColor]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldBase
          label={label}
          required={required}
          error={error ?? fieldState.error?.message}
          description={description}
          hideLabel={hideLabel}
          className={className}
          htmlFor={name}
        >
          <div className="space-y-2">
            <div
              className={cn(
                'relative overflow-hidden rounded-md border bg-white',
                hasInk ? 'border-primary/40' : 'border-dashed',
              )}
            >
              {!hasInk && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <PenTool className="size-4" /> Sign here
                </span>
              )}
              <canvas
                ref={canvasRef}
                width={400}
                height={height}
                className="block w-full touch-none"
                style={{ height }}
                onPointerDown={(e) => {
                  drawing.current = true;
                  const ctx = canvasRef.current!.getContext('2d')!;
                  const p = pos(e);
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                }}
                onPointerMove={(e) => {
                  if (!drawing.current) return;
                  const ctx = canvasRef.current!.getContext('2d')!;
                  const p = pos(e);
                  ctx.lineTo(p.x, p.y);
                  ctx.stroke();
                  setHasInk(true);
                }}
                onPointerUp={() => {
                  drawing.current = false;
                  if (canvasRef.current) {
                    field.onChange(canvasRef.current.toDataURL('image/png'));
                  }
                }}
                onPointerLeave={() => {
                  drawing.current = false;
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d')!;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }
                  setHasInk(false);
                  field.onChange(undefined);
                }}
              >
                <Trash2 className="size-3" /> Clear
              </Button>
            </div>
          </div>
        </FieldBase>
      )}
    />
  );
}
