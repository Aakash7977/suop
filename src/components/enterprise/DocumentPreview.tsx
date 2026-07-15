'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
} from 'lucide-react';

export interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional document URL (image or pdf). When omitted, renders children. */
  url?: string;
  /** Document type for iconography. */
  type?: 'pdf' | 'image' | 'spreadsheet' | 'text' | 'unknown';
  children?: React.ReactNode;
  className?: string;
}

/** Document preview modal with zoom/rotate controls. */
export function DocumentPreview({
  open,
  onOpenChange,
  title,
  url,
  type = 'unknown',
  children,
  className,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-4xl p-0 overflow-hidden', className)}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Document preview</DialogDescription>
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setZoom((z) => Math.max(25, z - 25))}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="w-12 text-center text-xs tabular-nums">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setZoom((z) => Math.min(300, z + 25))}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              aria-label="Rotate"
            >
              <RotateCw className="size-4" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button variant="outline" size="sm" className="h-7">
              <Printer className="size-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="h-7">
              <Download className="size-3.5" /> Download
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[70vh] bg-muted/30">
          <div className="flex min-h-full items-center justify-center p-6">
            {url && type === 'image' ? (
              <img
                src={url}
                alt={title}
                style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                className="max-h-[60vh] object-contain transition-transform shadow-lg"
              />
            ) : children ? (
              <div
                style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                className="origin-center"
              >
                {children}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="size-16 opacity-40" />
                <p className="text-sm">No preview available</p>
                <p className="text-xs">Download the file to view its contents.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
