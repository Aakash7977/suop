/**
 * EmptyState — empty state with icon, title, description, and optional action
 * Reused across ALL sections.
 */

'use client'

import { type LucideIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'No records match the current criteria.',
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-40" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs mt-1 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button size="sm" variant="outline" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
