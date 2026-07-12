'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, Folder, FolderOpen, File } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: TreeNode[];
  /** Optional badge count. */
  badge?: number;
  /** Whether this node is disabled. */
  disabled?: boolean;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  /** Currently selected node id. */
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  /** Initially expanded node ids. */
  defaultExpanded?: string[];
  className?: string;
}

/** Hierarchical tree navigation with expand/collapse and selection. */
export function TreeView({
  nodes,
  selectedId,
  onSelect,
  defaultExpanded = [],
  className,
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node: TreeNode, depth: number) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const Icon = node.icon ?? (hasChildren ? (isExpanded ? FolderOpen : Folder) : File);
    return (
      <li key={node.id} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
        <div
          className={cn(
            'group flex items-center gap-1 rounded-md py-1 pr-2 text-sm',
            isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
            node.disabled && 'opacity-50 pointer-events-none',
          )}
          style={{ paddingLeft: depth * 12 + 4 }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-5 shrink-0"
              onClick={() => toggle(node.id)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronRight className={cn('size-3.5 transition-transform', isExpanded && 'rotate-90')} />
            </Button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
            onClick={() => !node.disabled && onSelect?.(node)}
          >
            <Icon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{node.label}</span>
            {typeof node.badge === 'number' && node.badge > 0 && (
              <span className="ml-auto rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                {node.badge}
              </span>
            )}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul role="group">{node.children!.map((c) => renderNode(c, depth + 1))}</ul>
        )}
      </li>
    );
  };

  return (
    <ul role="tree" className={cn('text-sm', className)}>
      {nodes.map((n) => renderNode(n, 0))}
    </ul>
  );
}
