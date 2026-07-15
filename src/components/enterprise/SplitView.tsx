'use client';

import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export interface SplitViewProps {
  /** First (master/left) pane content. */
  first: React.ReactNode;
  /** Second (detail/right) pane content. */
  second: React.ReactNode;
  /** Initial size percentage of the first pane (0-100). */
  defaultSize?: number;
  /** Minimum size percentage of the first pane. */
  minSize?: number;
  /** Layout direction. */
  direction?: 'horizontal' | 'vertical';
  className?: string;
  /** Persist the panel sizes (handled by parent via onLayout). */
  onLayout?: (sizes: number[]) => void;
}

/** Resizable split-pane layout built on shadcn Resizable. */
export function SplitView({
  first,
  second,
  defaultSize = 40,
  minSize = 20,
  direction = 'horizontal',
  className,
  onLayout,
}: SplitViewProps) {
  return (
    <ResizablePanelGroup
      direction={direction}
      className={cn('h-full w-full', className)}
      onLayout={onLayout}
    >
      <ResizablePanel defaultSize={defaultSize} minSize={minSize}>
        {first}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={minSize}>
        {second}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
