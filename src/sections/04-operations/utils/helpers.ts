/**
 * Section 04 — Operations & WMS
 * Shared Utilities
 *
 * s28BadgeForStatus is re-exported from @/lib/badges (promoted in Section 03 R2).
 * s28PriorityBadge, S28_WAREHOUSES, S28_ZONES are extracted from page.tsx.
 */

// Re-export from shared lib (70-entry status→badge map)
export { badgeForStatus as s28BadgeForStatus } from '@/lib/badges'

// Priority badge helper (extracted from page.tsx line 11203)
export function s28PriorityBadge(priority: string): string {
  const map: Record<string, string> = {
    EMERGENCY: 'bg-red-200 text-red-900 border-red-400',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    NORMAL: 'bg-blue-100 text-blue-800 border-blue-300',
    LOW: 'bg-slate-100 text-slate-800 border-slate-300',
  }
  return map[priority] || 'bg-slate-100 text-slate-800 border-slate-300'
}

// Shared constants (extracted from page.tsx lines 11154-11155)
export const S28_WAREHOUSES = ['WH-MUM-MAIN', 'WH-DEL-NORTH', 'WH-BLR-CENTRAL', 'WH-HYD-WEST']
export const S28_ZONES = ['A-Receiving', 'B-Bulk', 'C-Picking', 'D-Pack', 'E-Dispatch', 'F-Cold']
