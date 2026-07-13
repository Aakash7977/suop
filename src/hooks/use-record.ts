/**
 * useRecord — single record fetcher
 * Reused across ALL sections.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface RecordState<T> {
  data: T | null
  loading: boolean
  error: string
  refresh: () => void
}

export function useRecord<T>(
  fetcher: () => Promise<{ data: T }>,
  deps: unknown[] = [],
  options: { enabled?: boolean } = {}
): RecordState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.enabled !== false)
  const [error, setError] = useState('')
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async () => {
    if (options.enabled === false) return
    setLoading(true)
    setError('')
    try {
      const result = await fetcherRef.current()
      setData(result.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load record'
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled, ...deps])

  useEffect(() => { load() }, [load])

  const refresh = useCallback(() => { load() }, [load])
  return { data, loading, error, refresh }
}
