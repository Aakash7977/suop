/**
 * Section 03 — Master Data Management
 * Utilities — re-exports from shared src/lib/ for backward compatibility.
 * 
 * All utilities have been promoted to src/lib/ for reuse across sections.
 * This file remains as a re-export so existing Section 03 imports don't break.
 */

export { formatINR, formatNumber, formatDate, formatDateTime, relativeTime } from '@/lib/format'
export { badgeForStatus as s28BadgeForStatus } from '@/lib/badges'
export { exportToCSV } from '@/lib/csv'
export { validateGSTIN, validatePAN, validateEmail, validatePhone, validatePincode } from '@/lib/validate'
