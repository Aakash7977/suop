/**
 * Section 03 — Master Data Management
 * Hooks — re-exports from shared src/hooks/ for backward compatibility.
 *
 * All hooks have been promoted to src/hooks/ for reuse across sections.
 * This file remains as a re-export so existing Section 03 imports don't break.
 */

export { useList } from '@/hooks/use-list'
export type { ListState } from '@/hooks/use-list'
export { useRecord } from '@/hooks/use-record'
export type { RecordState } from '@/hooks/use-record'
export { useMutation } from '@/hooks/use-mutation'
export type { MutationState } from '@/hooks/use-mutation'
export { useDebouncedSearch } from '@/hooks/use-debounced-search'
export { useDropdown } from '@/hooks/use-dropdown'
