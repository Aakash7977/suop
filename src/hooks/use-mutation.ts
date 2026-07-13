/**
 * useMutation — generic mutation hook with toast
 * Reused across ALL sections.
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

export interface MutationState {
  loading: boolean
  error: string
  mutate: (data?: unknown) => Promise<boolean>
}

export function useMutation(
  fn: (data?: unknown) => Promise<unknown>,
  options: { successMsg?: string; errorMsg?: string; onSuccess?: () => void } = {}
): MutationState {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mutate = useCallback(async (data?: unknown): Promise<boolean> => {
    setLoading(true)
    setError('')
    try {
      await fn(data)
      if (options.successMsg) toast({ title: options.successMsg })
      if (options.onSuccess) options.onSuccess()
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (options.errorMsg || 'Operation failed')
      setError(msg)
      toast({ title: msg, variant: 'destructive' })
      return false
    } finally {
      setLoading(false)
    }
  }, [fn, options.successMsg, options.errorMsg, options.onSuccess])

  return { loading, error, mutate }
}
