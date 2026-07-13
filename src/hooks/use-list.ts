/**
 * useList — generic paginated list fetcher
 * Reused across ALL sections.
 * Promoted from src/sections/03-master-data/hooks/use-master-data.ts
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface ListState<T> {
  data: T[]
  loading: boolean
  error: string
  page: number
  pageSize: number
  total: number
  totalPages: number
  refresh: () => void
  setPage: (p: number) => void
  setPageSize: (s: number) => void
}

interface UseListOptions {
  initialPage?: number
  initialPageSize?: number
  enabled?: boolean
}

export function useList<T>(
  fetcher: (params: { page: number; pageSize: number; search?: string }) => Promise<{ data: T[]; meta?: { total: number; page: number; pageSize: number; totalPages?: number } }>,
  options: UseListOptions & { search?: string } = {}
): ListState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(options.enabled !== false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(options.initialPage ?? 1)
  const [pageSize, setPageSize] = useState(options.initialPageSize ?? 25)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const searchRef = useRef(options.search)

  const load = useCallback(async () => {
    if (options.enabled === false) return
    setLoading(true)
    setError('')
    try {
      const result = await fetcherRef.current({ page, pageSize, search: searchRef.current })
      setData(result.data || [])
      if (result.meta) {
        setTotal(result.meta.total ?? 0)
        setTotalPages(result.meta.totalPages ?? Math.ceil((result.meta.total ?? 0) / pageSize))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load data'
      setError(msg)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, options.enabled])

  useEffect(() => {
    searchRef.current = options.search
  }, [options.search])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => { load() }, [load])

  return {
    data, loading, error, page, pageSize, total, totalPages,
    refresh, setPage, setPageSize,
  }
}
