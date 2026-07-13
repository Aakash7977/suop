/**
 * useDropdown — cached lookup for dropdowns (categories, brands, UOMs, etc.)
 * Reused across ALL sections.
 */

'use client'

import { useState, useEffect, useRef } from 'react'

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
