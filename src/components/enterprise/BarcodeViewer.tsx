'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface BarcodeViewerProps {
  value: string;
  /** Render a QR-style matrix instead of a linear barcode. */
  variant?: 'barcode' | 'qr';
  /** Show the value as text below the graphic. */
  showValue?: boolean;
  /** Pixel height of the barcode. */
  height?: number;
  className?: string;
  /** Optional download button. */
  downloadable?: boolean;
}

/**
 * Pure-SVG barcode / QR viewer.
 *
 * The bars are derived deterministically from a hash of the value so the
 * graphic is stable across renders without requiring an external barcode
 * library. This is suitable for display purposes in the design system.
 */
function hashStr(s: string): number[] {
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
    out.push(h & 0xff);
  }
  // pad to at least 32 bytes for a richer pattern
  while (out.length < 32) out.push((out[out.length - 1] * 7 + 13) & 0xff);
  return out;
}

function LinearBarcode({ value, height }: { value: string; height: number }) {
  const bytes = hashStr(value);
  const bars: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    bars.push((bytes[i] % 4) + 1); // width 1-4
    bars.push(1); // gap
  }
  let x = 0;
  return (
    <svg
      viewBox={`0 0 ${bars.reduce((a, b) => a + b, 0)} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Barcode ${value}`}
    >
      {bars.map((w, i) => {
        const fill = i % 2 === 0 ? '#000' : 'transparent';
        const rect = (
          <rect key={i} x={x} y={0} width={w} height={height} fill={fill} />
        );
        x += w;
        return rect;
      })}
    </svg>
  );
}

function QrMatrix({ value, size = 21 }: { value: string; size: number }) {
  const bytes = hashStr(value);
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    cells.push((bytes[i % bytes.length] ^ (i * 13)) % 2 === 0);
  }
  const finder = (offset: [number, number]) => {
    const [r, c] = offset;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const onBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const inCenter = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (onBorder || inCenter) {
          const row = r + i;
          const col = c + j;
          if (row < size && col < size) cells[row * size + col] = true;
        } else {
          const row = r + i;
          const col = c + j;
          if (row < size && col < size) cells[row * size + col] = false;
        }
      }
    }
  };
  finder([0, 0]);
  finder([0, size - 7]);
  finder([size - 7, 0]);
  const cell = 10;
  return (
    <svg
      viewBox={`0 0 ${size * cell} ${size * cell}`}
      className="w-full"
      style={{ maxWidth: size * cell }}
      role="img"
      aria-label={`QR code ${value}`}
    >
      <rect width={size * cell} height={size * cell} fill="#fff" />
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={(i % size) * cell}
            y={Math.floor(i / size) * cell}
            width={cell}
            height={cell}
            fill="#000"
          />
        ) : null,
      )}
    </svg>
  );
}

/** Barcode / QR code display component (pure SVG, no external deps). */
export function BarcodeViewer({
  value,
  variant = 'barcode',
  showValue = true,
  height = 60,
  className,
  downloadable = false,
}: BarcodeViewerProps) {
  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className="rounded-md border bg-white p-3">
        {variant === 'qr' ? (
          <QrMatrix value={value} size={21} />
        ) : (
          <LinearBarcode value={value} height={height} />
        )}
      </div>
      {showValue && (
        <span className="font-mono text-xs text-muted-foreground tracking-wide">{value}</span>
      )}
      {downloadable && (
        <Button variant="outline" size="sm">
          Download
        </Button>
      )}
    </div>
  );
}
