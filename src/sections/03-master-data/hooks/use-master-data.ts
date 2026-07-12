/**
 * Section 03 — Master Data Management
 * Data Fetching Hooks
 *
 * Provides reusable hooks for paginated list fetching, single-record fetching,
 * mutations (create/update/delete/transition), and dropdown lookups.
 * All hooks handle loading, error, and pagination state uniformly.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { pushToast } from '../api/clients'

// ─── useList: generic paginated list fetcher ────────────────────────────────

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

// ─── useRecord: single record fetcher ───────────────────────────────────────

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

// ─── useMutation: generic mutation hook with toast ──────────────────────────

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
      if (options.successMsg) pushToast('success', options.successMsg)
      if (options.onSuccess) options.onSuccess()
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (options.errorMsg || 'Operation failed')
      setError(msg)
      pushToast('error', msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [fn, options.successMsg, options.errorMsg, options.onSuccess])

  return { loading, error, mutate }
}

// ─── useDebouncedSearch: debounced search input ─────────────────────────────

export function useDebouncedSearch(initialValue = '', delay = 350): {
  search: string
  setSearch: (v: string) => void
  debouncedSearch: string
} {
  const [search, setSearch] = useState(initialValue)
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), delay)
    return () => clearTimeout(t)
  }, [search, delay])

  return { search, setSearch, debouncedSearch }
}

// ─── useDropdown: cached lookup for dropdowns (categories, brands, UOMs, etc.) ─

export function useDropdown<T>(
  fetcher: () => Promise<{ data: T[] }>,
  deps: unknown[] = []
): { items: T[]; loading: boolean } {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const r = await fetcherRef.current()
        if (!cancelled) setItems(r.data || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { items, loading }
}
