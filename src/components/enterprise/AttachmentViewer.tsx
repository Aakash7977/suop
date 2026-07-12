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
import { FileText, Image as ImageIcon, Download, ZoomIn, X } from 'lucide-react';

export interface Attachment {
  id: string;
  name: string;
  /** MIME type or simple category. */
  type?: string;
  size?: string;
  url?: string;
  uploadedAt?: string;
}

export interface AttachmentViewerProps {
  attachments: Attachment[];
  className?: string;
  /** Compact list layout vs. grid. */
  layout?: 'list' | 'grid';
}

function iconFor(type?: string) {
  if (type?.startsWith('image/')) return ImageIcon;
  return FileText;
}

/** File attachment preview list/grid with a lightbox modal. */
export function AttachmentViewer({
  attachments,
  className,
  layout = 'list',
}: AttachmentViewerProps) {
  const [active, setActive] = useState<Attachment | null>(null);
  if (!attachments.length) {
    return (
      <p className={cn('text-sm text-muted-foreground py-4', className)}>No attachments.</p>
    );
  }
  return (
    <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'space-y-1.5', className)}>
      {attachments.map((att) => {
        const Icon = iconFor(att.type);
        return (
          <div
            key={att.id}
            className="group flex items-center gap-2 rounded-md border p-2 hover:bg-accent transition-colors cursor-pointer"
            onClick={() => setActive(att)}
          >
            <div className="rounded bg-muted p-1.5 shrink-0">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{att.name}</p>
              {(att.size || att.uploadedAt) && (
                <p className="text-xs text-muted-foreground">
                  {[att.size, att.uploadedAt].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100"
              aria-label="Preview"
            >
              <ZoomIn className="size-3.5" />
            </Button>
          </div>
        );
      })}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="sr-only">{active?.name}</DialogTitle>
          <DialogDescription className="sr-only">Attachment preview</DialogDescription>
          {active && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="size-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{active.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[active.size, active.uploadedAt].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm">
                    <Download className="size-3.5" /> Download
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => setActive(null)}>
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="flex min-h-64 items-center justify-center rounded-lg border bg-muted/30 p-6">
                {active.type?.startsWith('image/') && active.url ? (
                  <img src={active.url} alt={active.name} className="max-h-80 object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <FileText className="mx-auto size-12 mb-2" />
                    <p className="text-sm">Preview not available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
