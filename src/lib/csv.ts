/**
 * Shared CSV export utility — reused across ALL sections.
 * Promoted from src/sections/03-master-data/utils/helpers.ts
 */

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
