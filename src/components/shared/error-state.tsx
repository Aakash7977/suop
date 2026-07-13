/**
 * ErrorState — error banner with retry button
 * Reused across ALL sections.
 */

'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-md p-3 flex items-center gap-2">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button size="sm" variant="ghost" className="ml-auto" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
