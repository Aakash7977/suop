/**
 * Section 03 — Master Data Management
 * Shared Utilities
 *
 * Helper functions extracted from page.tsx — preserved exactly so the
 * extracted components render identically to the originals.
 */

// ─── s28BadgeForStatus — extracted verbatim from page.tsx line 11575 ────────
// Used by PlantMasterModule, WarehouseModule, and others.

export function s28BadgeForStatus(status: string): { cls: string; label: string } {
  const map: Record<string, { cls: string; label: string }> = {
    DRAFT: { cls: 'bg-slate-100 text-slate-700', label: 'Draft' },
    RELEASED: { cls: 'bg-blue-100 text-blue-700', label: 'Released' },
    IN_PROGRESS: { cls: 'bg-amber-100 text-amber-700', label: 'In Progress' },
    COMPLETED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
    CANCELLED: { cls: 'bg-rose-100 text-rose-700', label: 'Cancelled' },
    ON_HOLD: { cls: 'bg-orange-100 text-orange-700', label: 'On Hold' },
    OPEN: { cls: 'bg-slate-100 text-slate-700', label: 'Open' },
    ASSIGNED: { cls: 'bg-indigo-100 text-indigo-700', label: 'Assigned' },
    ACCEPTED: { cls: 'bg-blue-100 text-blue-700', label: 'Accepted' },
    PAUSED: { cls: 'bg-orange-100 text-orange-700', label: 'Paused' },
    FAILED: { cls: 'bg-rose-100 text-rose-700', label: 'Failed' },
    ESCALATED: { cls: 'bg-red-100 text-red-700', label: 'Escalated' },
    AVAILABLE: { cls: 'bg-emerald-100 text-emerald-700', label: 'Available' },
    IN_USE: { cls: 'bg-amber-100 text-amber-700', label: 'In Use' },
    CHARGING: { cls: 'bg-blue-100 text-blue-700', label: 'Charging' },
    MAINTENANCE: { cls: 'bg-orange-100 text-orange-700', label: 'Maintenance' },
    OUT_OF_SERVICE: { cls: 'bg-rose-100 text-rose-700', label: 'Out of Service' },
    ACTIVE: { cls: 'bg-emerald-100 text-emerald-700', label: 'Active' },
    INACTIVE: { cls: 'bg-slate-100 text-slate-700', label: 'Inactive' },
    ON_LEAVE: { cls: 'bg-amber-100 text-amber-700', label: 'On Leave' },
    PRESENT: { cls: 'bg-emerald-100 text-emerald-700', label: 'Present' },
    LATE: { cls: 'bg-amber-100 text-amber-700', label: 'Late' },
    ABSENT: { cls: 'bg-rose-100 text-rose-700', label: 'Absent' },
    SCHEDULED: { cls: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
    WARNING: { cls: 'bg-amber-100 text-amber-700', label: 'Warning' },
    MINOR: { cls: 'bg-blue-100 text-blue-700', label: 'Minor' },
    MAJOR: { cls: 'bg-orange-100 text-orange-700', label: 'Major' },
    CRITICAL: { cls: 'bg-rose-100 text-rose-700', label: 'Critical' },
    MEDIUM: { cls: 'bg-amber-100 text-amber-700', label: 'Medium' },
    LOW: { cls: 'bg-slate-100 text-slate-700', label: 'Low' },
    HIGH: { cls: 'bg-orange-100 text-orange-700', label: 'High' },
    INVESTIGATING: { cls: 'bg-blue-100 text-blue-700', label: 'Investigating' },
    RESOLVED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Resolved' },
    ACKNOWLEDGED: { cls: 'bg-indigo-100 text-indigo-700', label: 'Acknowledged' },
    WAIVED: { cls: 'bg-slate-100 text-slate-700', label: 'Waived' },
    CLOSED: { cls: 'bg-slate-100 text-slate-700', label: 'Closed' },
    BUSY: { cls: 'bg-amber-100 text-amber-700', label: 'Busy' },
    BLOCKED: { cls: 'bg-rose-100 text-rose-700', label: 'Blocked' },
    BLACKLISTED: { cls: 'bg-red-200 text-red-900', label: 'Blacklisted' },
    PENDING: { cls: 'bg-amber-100 text-amber-700', label: 'Pending' },
    APPROVED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
    REJECTED: { cls: 'bg-rose-100 text-rose-700', label: 'Rejected' },
    PUBLISHED: { cls: 'bg-emerald-200 text-emerald-800', label: 'Published' },
    ARCHIVED: { cls: 'bg-slate-200 text-slate-700', label: 'Archived' },
    SUSPENDED: { cls: 'bg-orange-100 text-orange-700', label: 'Suspended' },
    CONFIGURED: { cls: 'bg-blue-100 text-blue-700', label: 'Configured' },
    VERIFICATION: { cls: 'bg-amber-100 text-amber-700', label: 'Verification' },
    PROBATION: { cls: 'bg-orange-100 text-orange-700', label: 'Probation' },
    LEAD: { cls: 'bg-blue-100 text-blue-700', label: 'Lead' },
    PROSPECT: { cls: 'bg-cyan-100 text-cyan-700', label: 'Prospect' },
    REVIEW: { cls: 'bg-blue-100 text-blue-700', label: 'Review' },
    DISCONTINUED: { cls: 'bg-amber-100 text-amber-700', label: 'Discontinued' },
    OCCUPIED: { cls: 'bg-amber-100 text-amber-700', label: 'Occupied' },
    RESERVED: { cls: 'bg-indigo-100 text-indigo-700', label: 'Reserved' },
    DISABLED: { cls: 'bg-slate-200 text-slate-700', label: 'Disabled' },
    CLEANING: { cls: 'bg-blue-100 text-blue-700', label: 'Cleaning' },
    QUARANTINED: { cls: 'bg-orange-100 text-orange-700', label: 'Quarantined' },
    CONSUMED: { cls: 'bg-slate-200 text-slate-700', label: 'Consumed' },
    EXPIRED: { cls: 'bg-red-100 text-red-700', label: 'Expired' },
    PRODUCED: { cls: 'bg-blue-100 text-blue-700', label: 'Produced' },
    PLANNED: { cls: 'bg-slate-100 text-slate-700', label: 'Planned' },
    PASSED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Passed' },
    PASSED_WITH_CONDITION: { cls: 'bg-amber-100 text-amber-700', label: 'Passed (Cond.)' },
    REJECT: { cls: 'bg-red-100 text-red-700', label: 'Reject' },
    QUARANTINE: { cls: 'bg-orange-100 text-orange-700', label: 'Quarantine' },
  }
  return map[status] || { cls: 'bg-slate-100 text-slate-700', label: status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) }
}

// ─── Date / Currency formatters ────────────────────────────────────────────

export function formatINR(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

export function formatNumber(value: string | number | null | undefined, locale = 'en-IN'): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat(locale).format(n)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export function relativeTime(value: string | null | undefined): string {
  if (!value) return '—'
  const now = Date.now()
  const then = new Date(value).getTime()
  if (isNaN(then)) return '—'
  const diff = now - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`
  return formatDate(value)
}

// ─── CSV Export Helper ──────────────────────────────────────────────────────

export function exportToCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const csv = [headers, ...rows].map(r =>
    r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Validation helpers ─────────────────────────────────────────────────────

export function validateGSTIN(value: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
}

export function validatePAN(value: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
}

export function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validatePhone(value: string): boolean {
  return /^[+]?[0-9]{10,15}$/.test(value.replace(/[\s-]/g, ''))
}

export function validatePincode(value: string): boolean {
  return /^[0-9]{6}$/.test(value)
}
