/**
 * useDebouncedSearch — debounced search input
 * Reused across ALL sections.
 */

'use client'

import { useState, useEffect } from 'react'

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
