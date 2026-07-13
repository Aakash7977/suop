/**
 * Section 03 — Master Data Management
 * Identification & Traceability Module — Live API Integration
 *
 * 10 sub-tabs:
 * 1. Overview      — Stats from live barcodes + batches
 * 2. Barcodes      — GET /api/v1/warehouse/barcodes (live) + product barcode lookup
 * 3. QR Codes      — NO backend → EmptyState
 * 4. Batches       — GET /api/v1/inventory/batches (live)
 * 5. Lots          — NO list endpoint → EmptyState
 * 6. Serials       — NO backend → EmptyState
 * 7. GS1           — NO backend → EmptyState
 * 8. Labels        — NO backend → EmptyState
 * 9. Print         — NO backend → EmptyState
 * 10. Traceability — GET /api/v1/inventory/batches (live trace data)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Download, X, Loader2, AlertCircle,
  QrCode, ScanLine, PackageCheck, Boxes, Hash, Printer,
  Barcode, Route, ArrowDownToLine, ArrowUpFromLine,
  GitBranch, ShieldCheck, Sparkles, PlayCircle, Activity,
  RefreshCw, AlertOctagon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { warehouseApi, inventoryApi, productApi } from '../api/clients'

type IDTab = 'overview' | 'barcodes' | 'qrcodes' | 'batches' | 'lots' | 'serials' | 'gs1' | 'labels' | 'print' | 'traceability'

export function IdentificationModule() {
  const [tab, setTab] = useState<IDTab>('overview')
  const tabs: Array<{ key: IDTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
    { key: 'barcodes', label: 'Barcodes', icon: <Barcode className="h-4 w-4" /> },
    { key: 'qrcodes', label: 'QR Codes', icon: <QrCode className="h-4 w-4" /> },
    { key: 'batches', label: 'Batches', icon: <Boxes className="h-4 w-4" /> },
    { key: 'lots', label: 'Lots', icon: <Hash className="h-4 w-4" /> },
    { key: 'serials', label: 'Serials', icon: <PackageCheck className="h-4 w-4" /> },
    { key: 'gs1', label: 'GS1', icon: <GitBranch className="h-4 w-4" /> },
    { key: 'labels', label: 'Labels', icon: <Printer className="h-4 w-4" /> },
    { key: 'print', label: 'Print', icon: <Printer className="h-4 w-4" /> },
    { key: 'traceability', label: 'Traceability', icon: <Route className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-cyan-950 via-blue-900 to-indigo-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ScanLine className="h-7 w-7" /> Identification & Traceability
            </h2>
            <p className="text-cyan-200 text-sm max-w-3xl">
              Universal identification for every product, batch, lot, and serial number.
              Barcode (EAN/UPC/GS1-128), QR Code, Batch/Lot tracking, Serial numbers,
              GS1 identifiers, Label printing, and full forward/backward traceability.
            </p>
          </div>
          <Badge className="bg-cyan-500 text-cyan-950 hover:bg-cyan-500">Sprint 10</Badge>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <IDOverviewTab />}
      {tab === 'barcodes' && <IDBarcodesTab />}
      {tab === 'qrcodes' && <IDQRCodesTab />}
      {tab === 'batches' && <IDBatchesTab />}
      {tab === 'lots' && <IDLotsTab />}
      {tab === 'serials' && <IDSerialsTab />}
      {tab === 'gs1' && <IDGS1Tab />}
      {tab === 'labels' && <IDLabelsTab />}
      {tab === 'print' && <IDPrintTab />}
      {tab === 'traceability' && <IDTraceabilityTab />}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function IDOverviewTab() {
  const [stats, setStats] = useState<Array<{ label: string; value: string; sub: string; icon: React.ReactNode }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [barcodes, batches] = await Promise.all([
          warehouseApi.listBarcodes().catch(() => ({ data: [] })),
          inventoryApi.listBatches({ page: 1 }).catch(() => ({ data: [] })),
        ])
        if (cancelled) return
        setStats([
          { label: 'Barcodes', value: String((barcodes.data || []).length), sub: 'Warehouse barcodes', icon: <Barcode className="h-5 w-5 text-blue-600" /> },
          { label: 'Batches', value: String((batches.data || []).length), sub: 'Inventory batches', icon: <Boxes className="h-5 w-5 text-emerald-600" /> },
          { label: 'QR Codes', value: 'N/A', sub: 'Backend not available', icon: <QrCode className="h-5 w-5 text-purple-600" /> },
          { label: 'Serials', value: 'N/A', sub: 'Backend not available', icon: <PackageCheck className="h-5 w-5 text-amber-600" /> },
          { label: 'GS1 IDs', value: 'N/A', sub: 'Backend not available', icon: <GitBranch className="h-5 w-5 text-pink-600" /> },
          { label: 'Label Templates', value: 'N/A', sub: 'Backend not available', icon: <Printer className="h-5 w-5 text-indigo-600" /> },
          { label: 'Print Jobs', value: 'N/A', sub: 'Backend not available', icon: <Printer className="h-5 w-5 text-cyan-600" /> },
          { label: 'Traceability', value: '✓', sub: 'Via inventory batches', icon: <Route className="h-5 w-5 text-teal-600" /> },
        ])
      } catch {
        if (!cancelled) setStats([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(8)].map((_, i) => <Card key={i} className="p-4"><div className="h-16 bg-muted/50 rounded animate-pulse" /></Card>)
        ) : (
          stats.map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Barcodes Tab — Live API ──────────────────────────────────────────────────

function IDBarcodesTab() {
  const { hasPermission } = useAuthStore()
  const [barcodes, setBarcodes] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [lookupResult, setLookupResult] = useState<Record<string, unknown> | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await warehouseApi.listBarcodes()
      setBarcodes(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load barcodes')
      setBarcodes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = barcodes.filter(b => {
    const code = String(b.barcode || b.barcodeValue || b.barcode_value || '')
    return !search || code.toLowerCase().includes(search.toLowerCase())
  })

  async function handleLookup() {
    if (!search) return
    setLookupLoading(true)
    try {
      const res = await productApi.lookupBarcode(search)
      setLookupResult(res.data as Record<string, unknown>)
      toast({ title: `Found: ${(res.data as { name?: string }).name || 'Product'}` })
    } catch (err: unknown) {
      setLookupResult(null)
      toast({ title: err instanceof Error ? err.message : 'Barcode not found', variant: 'destructive' })
    } finally {
      setLookupLoading(false)
    }
  }

  function handleExport() {
    if (filtered.length === 0) { toast({ title: 'No data to export' }); return }
    const headers = ['Barcode', 'Type', 'Status']
    const rows = filtered.map(b => [String(b.barcode || b.barcodeValue || ''), String(b.barcodeType || b.barcode_type || ''), String(b.status || 'ACTIVE')])
    import('@/lib/csv').then(({ exportToCSV }) => exportToCSV('barcodes', headers, rows))
    toast({ title: `Exported ${filtered.length} barcodes` })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Barcodes</h3>
        <p className="text-xs text-muted-foreground mt-1">{loading ? 'Loading...' : `${filtered.length} barcodes loaded`}</p></div>
        <div className="flex gap-2">
          {hasPermission('catalog:export') && <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export</Button>}
          {hasPermission('product:update') && <Button size="sm" onClick={() => toast({ title: 'Use Product Master to add barcodes — POST /api/v1/catalog/products/:id/barcodes' })}><Plus className="mr-1 h-4 w-4" /> Generate</Button>}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search barcodes or lookup a barcode value..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button size="sm" variant="outline" onClick={handleLookup} disabled={lookupLoading || !search}>{lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}</Button>
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {lookupResult && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm font-medium">Found: {String(lookupResult.name || '—')}</p>
          <p className="text-xs text-muted-foreground">SKU: {String(lookupResult.sku || '—')} · UPI: {String(lookupResult.id || '—').slice(0, 8)}</p>
        </div>
      )}
      {loading ? <LoadingState rows={5} /> : filtered.length === 0 ? (
        <EmptyState icon={Barcode} title="No barcodes found" description="Barcodes are created via the warehouse barcode endpoint or the product barcode endpoint." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Barcode</th><th className="font-medium">Type</th><th className="font-medium">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={i} className="border-b hover:bg-muted/40">
                  <td className="py-2.5 font-mono text-xs">{String(b.barcode || b.barcodeValue || b.barcode_value || '—')}</td>
                  <td><Badge variant="outline" className="text-xs">{String(b.barcodeType || b.barcode_type || '—')}</Badge></td>
                  <td><Badge className={cn('text-xs', b.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-500')}>{String(b.status || 'ACTIVE')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ─── QR Codes Tab — NO BACKEND ────────────────────────────────────────────────

function IDQRCodesTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">QR Codes</h3>
        <p className="text-xs text-muted-foreground mt-1">QR code management requires a dedicated backend endpoint.</p></div>
      </div>
      <EmptyState icon={QrCode} title="Backend endpoint not available" description="The QR codes API does not exist in the backend. QR codes would support 7 purposes: Product, Batch, Warehouse, Location, Asset, Invoice, Order — with scan count tracking and encryption support." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for QR codes exists.</p>
      </div>
    </Card>
  )
}

// ─── Batches Tab — Live API ───────────────────────────────────────────────────

function IDBatchesTab() {
  const [batches, setBatches] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await inventoryApi.listBatches({ page: 1, search })
      setBatches(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load batches')
      setBatches([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function handleExport() {
    if (batches.length === 0) { toast({ title: 'No data to export' }); return }
    const headers = ['Batch Number', 'Product', 'Mfg Date', 'Expiry Date', 'Status']
    const rows = batches.map(b => [String(b.batchNumber || b.batch_number || '—'), String(b.productName || b.product_name || '—'), String(b.manufacturingDate || b.mfg_date || '—'), String(b.expiryDate || b.expiry_date || '—'), String(b.status || '—')])
    import('@/lib/csv').then(({ exportToCSV }) => exportToCSV('batches', headers, rows))
    toast({ title: `Exported ${batches.length} batches` })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Batches</h3>
        <p className="text-xs text-muted-foreground mt-1">{loading ? 'Loading...' : `${batches.length} batches loaded`}</p></div>
        <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export</Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState rows={5} /> : batches.length === 0 ? (
        <EmptyState icon={Boxes} title="No batches found" description="Batches are auto-created when stock is received via inventory stock-in." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Batch Number</th><th className="font-medium">Product</th>
              <th className="font-medium">Mfg Date</th><th className="font-medium">Expiry</th><th className="font-medium">Status</th>
            </tr></thead>
            <tbody>
              {batches.map((b, i) => (
                <tr key={i} className="border-b hover:bg-muted/40">
                  <td className="py-2.5 font-mono text-xs">{String(b.batchNumber || b.batch_number || '—')}</td>
                  <td className="font-medium">{String(b.productName || b.product_name || '—')}</td>
                  <td className="text-xs text-muted-foreground">{String(b.manufacturingDate || b.mfg_date || '—')}</td>
                  <td className="text-xs text-muted-foreground">{String(b.expiryDate || b.expiry_date || '—')}</td>
                  <td><Badge className={cn('text-xs', b.status === 'RELEASED' || b.status === 'ACTIVE' ? 'bg-emerald-600' : b.status === 'EXPIRED' ? 'bg-red-600' : 'bg-amber-500')}>{String(b.status || '—')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ─── Lots Tab — NO LIST ENDPOINT ──────────────────────────────────────────────

function IDLotsTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Lots</h3>
        <p className="text-xs text-muted-foreground mt-1">Lot management requires a dedicated list endpoint.</p></div>
      </div>
      <EmptyState icon={Hash} title="Backend endpoint not available" description="The lots list API does not exist in the backend. Lots are created internally during inventory stock-in (the lotRepository exists with create/findById/findByNumber/list methods), but no REST endpoint exposes lot listing. Lots are visible via inventory detail records." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. The Prisma model <code>Lots</code> exists (schema line 2409) and the repository exists, but no route is mounted for lot CRUD.</p>
      </div>
    </Card>
  )
}

// ─── Serials Tab — NO BACKEND ─────────────────────────────────────────────────

function IDSerialsTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Serial Numbers</h3>
        <p className="text-xs text-muted-foreground mt-1">Serial number tracking requires a dedicated backend endpoint.</p></div>
      </div>
      <EmptyState icon={PackageCheck} title="Backend endpoint not available" description="The serial numbers API does not exist in the backend. Serial tracking would allow individual unit tracking for machines, equipment, and electronics — with warranty start/end, service history, and location tracking." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for serial numbers exists.</p>
      </div>
    </Card>
  )
}

// ─── GS1 Tab — NO BACKEND ─────────────────────────────────────────────────────

function IDGS1Tab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">GS1 Identifiers</h3>
        <p className="text-xs text-muted-foreground mt-1">GS1 identifier management requires a dedicated backend endpoint.</p></div>
      </div>
      <EmptyState icon={GitBranch} title="Backend endpoint not available" description="The GS1 identifiers API does not exist in the backend. GS1 support would include GTIN (Global Trade Item Number), GLN (Global Location Number), SSCC (Serial Shipping Container Code), and GS1-128 barcodes — with company prefix management and check digit validation." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for GS1 identifiers exists.</p>
      </div>
    </Card>
  )
}

// ─── Labels Tab — NO BACKEND ──────────────────────────────────────────────────

function IDLabelsTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Label Templates</h3>
        <p className="text-xs text-muted-foreground mt-1">Label template management requires a dedicated backend endpoint.</p></div>
      </div>
      <EmptyState icon={Printer} title="Backend endpoint not available" description="The label templates API does not exist in the backend. Label templates would support 8 types (Product, Shelf, Pallet, Batch, Location, Shipping, QR, Barcode) across 5 formats (A4, Thermal, Zebra, Brother, PDF) with customizable fields and dimensions." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for label templates exists.</p>
      </div>
    </Card>
  )
}

// ─── Print Tab — NO BACKEND ───────────────────────────────────────────────────

function IDPrintTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Print Jobs</h3>
        <p className="text-xs text-muted-foreground mt-1">Print job management requires a dedicated backend endpoint.</p></div>
      </div>
      <EmptyState icon={Printer} title="Backend endpoint not available" description="The print jobs API does not exist in the backend. Print jobs would support 5 modes (Single, Bulk, Auto, Scheduled, Reprint) across 5 printer types (Thermal, Laser, Inkjet, Bluetooth, Network) with progress tracking and completion timestamps." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for print jobs exists. Note: the warehouse module does have <code>POST /api/v1/warehouse/barcodes/:id/print</code> for individual barcode printing.</p>
      </div>
    </Card>
  )
}

// ─── Traceability Tab — Live API ──────────────────────────────────────────────

function IDTraceabilityTab() {
  const [batchNumber, setBatchNumber] = useState('')
  const [batches, setBatches] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function trace() {
    setLoading(true); setError('')
    try {
      const res = await inventoryApi.listBatches({ page: 1, search: batchNumber })
      setBatches(res.data || [])
      if ((res.data || []).length === 0) {
        toast({ title: 'No batches found matching the search' })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to search batches')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <Route className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Batch Traceability</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Search inventory batches to trace products through the supply chain.
              The inventory ledger (GET /api/v1/inventory/ledger) and transactions (GET /api/v1/inventory/transactions)
              provide full forward/backward traceability from raw material to finished goods.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Label className="text-xs">Batch Number (or partial)</Label>
            <Input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="KK-2607-01 or search term..." className="font-mono text-sm" />
          </div>
          <Button onClick={trace} disabled={loading || !batchNumber} className="mt-6">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</> : <><PlayCircle className="mr-2 h-4 w-4" />Trace</>}
          </Button>
        </div>
      </Card>

      {error && <ErrorState message={error} />}

      {batches.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Trace Results ({batches.length} batches)</h4>
          <div className="space-y-3">
            {batches.map((b, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-mono text-sm font-semibold">{String(b.batchNumber || b.batch_number || '—')}</p>
                    <p className="text-xs text-muted-foreground">{String(b.productName || b.product_name || '—')}</p>
                  </div>
                  <Badge className={cn('text-xs', b.status === 'RELEASED' ? 'bg-emerald-600' : b.status === 'EXPIRED' ? 'bg-red-600' : 'bg-amber-500')}>{String(b.status || '—')}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Mfg Date</p><p className="font-medium">{String(b.manufacturingDate || b.mfg_date || '—')}</p></div>
                  <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium">{String(b.expiryDate || b.expiry_date || '—')}</p></div>
                  <div><p className="text-muted-foreground">Quantity</p><p className="font-medium">{String(b.quantityProduced || b.quantity_produced || b.quantity || '—')}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-md">
            <p className="text-xs text-cyan-800 dark:text-cyan-200">
              For full forward/backward traceability chain, use the Inventory module's ledger and transaction endpoints:
              <code className="block mt-1">GET /api/v1/inventory/ledger?productId=...&warehouseId=...</code>
              <code className="block">GET /api/v1/inventory/transactions?movementType=...</code>
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
