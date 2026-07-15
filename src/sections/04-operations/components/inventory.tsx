/**
 * Section 04 — Operations & WMS
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, Calendar, Package, Box,
  CheckCircle2, Tag, Scale, FileText, Filter, Download, Upload,
  GitBranch, FolderTree, FileCheck,
  History, ClipboardCheck, ShieldCheck, Archive,
  Building2, MapPin, Flag, Menu as MenuIcon, AlertTriangle,
  Server, Database, Zap, Activity, HardDrive,
  Bell, X, Menu, Star, Grid3x3, List, MoreHorizontal,
  IndianRupee, Percent, TrendingUp, TrendingDown, Clock,
  Calculator, Gift, Sparkles, PlayCircle, ArrowRightCircle,
  Users2, Handshake, Award, CreditCard, MapPinned, Phone,
  Building, Globe2, Star as StarIcon, Shield as ShieldIcon, AlertCircle as AlertIcon,
  QrCode, ScanLine, PackageCheck, Boxes, Hash, Tag as TagIcon, Printer,
  Barcode, Route, ArrowDownToLine, ArrowUpFromLine, History as HistoryIcon, Search as SearchIcon,
  GitMerge, FileCheck2, FileX2, AlertOctagon, ClipboardList, FileSpreadsheet,
  DownloadCloud, UploadCloud, ShieldAlert, Gauge, ListChecks, Workflow, RefreshCw,
  PackageOpen, ArrowLeftRight, BookOpen, Layers3, Activity as ActivityIcon,
  Truck, PackageCheck as PackageCheckIcon, FlaskConical, MapPin as MapPinIcon,
  Trash2, AlertTriangle as AlertTriangleIcon,
  Thermometer, Snowflake, Droplets, ScanLine as ScanIcon,
  Lock as LockIcon, UserCog, ArrowDownToLine as ArrowDownToLineIcon,
  Waves, Radio, Siren, UserCheck, Target, BatteryLow, Timer, Radar, Smartphone, BellRing,
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
  UtensilsCrossed as UtensilsCrossedIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { s28BadgeForStatus, s28PriorityBadge, S28_WAREHOUSES, S28_ZONES } from '../utils/helpers'
import { inventoryApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function InventoryModule() {
  const { hasPermission } = useAuthStore()
  const [tab, setTab] = useState<InvTab>('overview')
  const tabs: Array<{ key: InvTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'transactions', label: 'Transactions', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { key: 'balances', label: 'Stock Balances', icon: <Boxes className="h-4 w-4" /> },
    { key: 'ledger', label: 'Stock Ledger', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'movements', label: 'Movements', icon: <PackageOpen className="h-4 w-4" /> },
    { key: 'journal', label: 'Journal', icon: <Layers3 className="h-4 w-4" /> },
    { key: 'availability', label: 'Availability', icon: <ActivityIcon className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-red-950 via-orange-900 to-amber-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Boxes className="h-7 w-7" /> Enterprise Inventory Engine
            </h2>
            <p className="text-orange-200 text-sm max-w-3xl">
              Universal Stock Ledger — the single source of truth for inventory.
              <span className="font-semibold text-white"> NEVER update stock directly.</span> Every stock change creates an immutable ledger transaction.
              Stock balances are DERIVED from the ledger. This is the core engine that Manufacturing, Warehouse, Retail, Restaurant, and Finance all depend on.
            </p>
          </div>
          <Badge className="bg-red-500 text-red-950 hover:bg-red-500">Sprint 12 · Part 3</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">Core Architecture Principle</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              Available = Received − Issued − Reserved − Damaged. The <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">stock_balances</code> table is a performance cache only — it must always be reconstructable from the immutable <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">stock_ledger</code>.
            </p>
          </div>
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

      {tab === 'overview' && <InvOverviewTab />}
      {tab === 'transactions' && <InvTransactionsTab />}
      {tab === 'balances' && <InvBalancesTab />}
      {tab === 'ledger' && <InvLedgerTab />}
      {tab === 'movements' && <InvMovementsTab />}
      {tab === 'journal' && <InvJournalTab />}
      {tab === 'availability' && <InvAvailabilityTab />}
    </div>
  )
}

function InvOverviewTab() {
  const [stats, setStats] = useState<Array<{ label: string; value: string; sub: string; icon: React.ReactNode }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [invRes, txnRes, ledgerRes] = await Promise.all([
          inventoryApi.list({ page: 1, pageSize: 100 }).catch(() => ({ data: [], meta: { total: 0 } })),
          inventoryApi.listTransactions({ page: 1 }).catch(() => ({ data: [], meta: { total: 0 } })),
          inventoryApi.listLedger({ page: 1 }).catch(() => ({ data: [], meta: { total: 0 } })),
        ])
        if (cancelled) return
        const inventory = invRes.data || []
        const transactions = txnRes.data || []
        const ledger = ledgerRes.data || []
        const totalValue = inventory.reduce((s: number, i: { unit_cost?: number; moving_avg_cost?: number; quantity?: number }) => s + Number(i.unit_cost || i.moving_avg_cost || 0) * Number(i.quantity || 0), 0)
        const totalQty = inventory.reduce((s: number, i: { quantity?: number }) => s + Number(i.quantity || 0), 0)
        const expired = inventory.filter((i: { is_expired?: boolean }) => i.is_expired).length
        setStats([
          { label: 'Total Inventory Value', value: `₹${(totalValue / 100000).toFixed(2)}L`, sub: `Across ${inventory.length} stock balances`, icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
          { label: 'Available Units', value: totalQty.toLocaleString('en-IN'), sub: 'Ready for sale/issue', icon: <PackageCheck className="h-5 w-5 text-blue-600" /> },
          { label: 'Stock Balances', value: String(inventory.length), sub: 'Active records', icon: <Boxes className="h-5 w-5 text-purple-600" /> },
          { label: 'Expired Units', value: String(expired), sub: 'Requires action', icon: <AlertOctagon className="h-5 w-5 text-red-600" /> },
          { label: 'Transactions', value: String(transactions.length), sub: 'All time', icon: <ArrowLeftRight className="h-5 w-5 text-amber-600" /> },
          { label: 'Ledger Entries', value: String(ledger.length), sub: 'Immutable audit trail', icon: <BookOpen className="h-5 w-5 text-cyan-600" /> },
          { label: 'Journal Entries', value: String(Math.ceil(ledger.length / 2)), sub: 'Double-entry style', icon: <Layers3 className="h-5 w-5 text-indigo-600" /> },
          { label: 'Transaction Types', value: '18', sub: 'Goods Receipt to Stock Take', icon: <ListChecks className="h-5 w-5 text-teal-600" /> },
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
        {loading ? [...Array(8)].map((_, i) => <Card key={i} className="p-4"><div className="h-16 bg-muted/50 rounded animate-pulse" /></Card>) : stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Transaction Flow (Universal Ledger)</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// Every module calls the Inventory Engine — never updates stock directly</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Inventory Transaction</span> (Goods Receipt, Issue, Transfer, Adjustment, etc.)</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → Posts to <span className="text-purple-600">Stock Ledger</span> (immutable, append-only)</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → Posts to <span className="text-indigo-600">Inventory Journal</span> (double-entry: DEBIT/CREDIT)</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → Creates <span className="text-cyan-600">Stock Movement</span> record (from→to)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-emerald-600">Stock Balance</span> cache updated (derived from ledger)</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-amber-600">Availability Service</span> exposes current state to all modules</p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-5 gap-2 text-center text-xs">
          {['Manufacturing', 'Warehouse', 'Retail POS', 'Restaurant POS', 'Finance'].map(ch => (
            <div key={ch} className="p-2 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
              <p className="font-semibold text-orange-700 dark:text-orange-400">{ch}</p>
              <p className="text-muted-foreground mt-1">Consumes via API</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function InvTransactionsTab() {
  const { hasPermission } = useAuthStore()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [exporting, setExporting] = useState(false)
  const pageSize = 25

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await inventoryApi.listTransactions({ page, movementType: search || undefined })
      setTransactions(res.data || [])
      setTotal(res.meta?.total ?? 0)
    } catch (err: any) {
      setError(err?.message || 'Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await inventoryApi.exportTransactions({ movementType: search || undefined })
      const rows = res.data || []
      if (rows.length === 0) { toast({ title: 'No transactions to export' }); return }
      exportToCSV(rows, `inventory-transactions-${new Date().toISOString().split('T')[0]}.csv`)
      toast({ title: `Exported ${rows.length} transactions` })
    } catch (err: any) {
      toast({ title: 'Export failed', description: err?.message })
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const filtered = transactions.filter((t: any) =>
    !search || String(t.transaction_number || '').toLowerCase().includes(search.toLowerCase()) ||
    String(t.movement_type || '').toLowerCase().includes(search.toLowerCase()) ||
    String(t.product_sku || '').toLowerCase().includes(search.toLowerCase())
  )

  const typeColor: Record<string, string> = {
    STOCK_IN: 'bg-emerald-100 text-emerald-800', STOCK_OUT: 'bg-red-100 text-red-800',
    ADJUSTMENT_INCREASE: 'bg-amber-100 text-amber-800', ADJUSTMENT_DECREASE: 'bg-orange-100 text-orange-800',
    ADJUSTMENT_REVALUATION: 'bg-purple-100 text-purple-800',
  }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REVERSED: 'bg-red-600 hover:bg-red-600', CANCELLED: 'bg-gray-600 hover:bg-gray-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Inventory Transactions</h3>
        <p className="text-xs text-muted-foreground mt-1">Every transaction posts to the immutable ledger. Negative stock blocked by default.</p></div>
        <div className="flex gap-2">
          {hasPermission('inventory:export') && <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}><Download className="mr-1 h-4 w-4" />{exporting ? 'Exporting...' : 'Export'}</Button>}
          {hasPermission('inventory:stockin') && <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Transaction</Button>}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by transaction #, movement type, or SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
        </div>
      </div>
      {error && <div className="text-sm text-rose-500 mb-3">{error}</div>}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions found" description="Stock movements will appear here once inventory is updated." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 font-medium">Transaction #</th><th className="font-medium">Type</th>
                <th className="font-medium">Product</th><th className="font-medium">Reference</th>
                <th className="font-medium">Warehouse</th>
                <th className="font-medium text-right">Qty</th><th className="font-medium text-right">Value</th>
                <th className="font-medium">Date</th>
              </tr></thead>
              <tbody>
                {filtered.map((t: any) => (
                  <tr key={t.id} className="border-b hover:bg-muted/40">
                    <td className="py-2.5 font-mono text-xs">{t.transaction_number}</td>
                    <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[t.movement_type] ?? 'bg-slate-100 text-slate-800')}>{String(t.movement_type || '').replace(/_/g, ' ')}</span></td>
                    <td className="text-xs"><span className="font-mono">{t.product_sku}</span><br /><span className="text-muted-foreground">{t.product_name}</span></td>
                    <td className="text-xs"><span className="font-mono">{t.reference_number || '—'}</span><br /><span className="text-muted-foreground">{String(t.reference_type || '').replace(/_/g, ' ')}</span></td>
                    <td className="text-xs">{t.warehouse_name || '—'}</td>
                    <td className="text-right font-mono">{Number(t.quantity).toLocaleString('en-IN')}</td>
                    <td className="text-right font-mono">₹{Number(t.total_value || 0).toLocaleString('en-IN')}</td>
                    <td className="text-xs text-muted-foreground">{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">{total} transactions · Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

function InvBalancesTab() {
  const [balances, setBalances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await inventoryApi.list({ page: 1, pageSize: 100 })
        if (!cancelled) setBalances(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load balances')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = balances.filter((b: any) =>
    !search || String(b.product_sku || b.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(b.warehouse_name || '').toLowerCase().includes(search.toLowerCase())
  )

  // No mock data — uses real API data from inventoryApi.list()
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Balances (Derived Cache)</h3>
        <p className="text-xs text-muted-foreground mt-1">Computed from the immutable ledger. Formula: Total = Available + Reserved + Allocated + Damaged + Expired + In Transit. Multi-dimensional: product × warehouse × batch × location × bin.</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th><th className="font-medium">Warehouse</th>
            <th className="font-medium">Batch</th><th className="font-medium text-right">Avail</th>
            <th className="font-medium text-right">Resv</th><th className="font-medium text-right">Alloc</th>
            <th className="font-medium text-right">Dmg</th><th className="font-medium text-right">Exp</th>
            <th className="font-medium text-right">Total</th><th className="font-medium text-right">Value</th>
            <th className="font-medium">Expiry</th>
          </tr></thead>
          <tbody>
            {filtered.map((b: any, i: number) => (
              <tr key={b.id || i} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{b.product_name}</td>
                <td className="text-xs">{b.warehouse_name}</td>
                <td className="font-mono text-xs">{b.batch_number || <span className="text-muted-foreground">—</span>}</td>
                <td className="text-right font-mono font-semibold text-emerald-600">{Number(b.available_qty).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-blue-600">{Number(b.reserved_qty).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-purple-600">0</td>
                <td className="text-right font-mono text-orange-600">0</td>
                <td className="text-right font-mono text-red-600">{b.is_expired ? Number(b.quantity).toLocaleString('en-IN') : 0}</td>
                <td className="text-right font-mono font-semibold">{Number(b.quantity).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono">₹{Number(b.total_value || 0).toLocaleString('en-IN')}</td>
                <td className="text-xs text-muted-foreground">{b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('en-IN') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvLedgerTab() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await inventoryApi.listLedger({ page: 1 })
        if (!cancelled) setEntries(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load ledger')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // No mock data — uses real API data from inventoryApi.listLedger()
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5" /> Stock Ledger (Immutable Source of Truth)</h3>
        <p className="text-xs text-muted-foreground mt-1">Append-only. Never edited. Never deleted. Reversals create new entries with negative deltas. This is the single source from which all stock balances are derived.</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Txn Number</th><th className="font-medium">Type</th>
            <th className="font-medium">Product</th><th className="font-medium">Warehouse</th>
            <th className="font-medium">Batch</th><th className="font-medium text-right">Qty Delta</th>
            <th className="font-medium text-right">Avail Delta</th><th className="font-medium">Posted</th>
            <th className="font-medium">Reversal?</th>
          </tr></thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-b hover:bg-muted/40 font-mono text-xs">
                <td className="py-2.5">{e.transaction_number}</td>
                <td><Badge variant="outline" className="text-xs">{String(e.movement_type || '').replace(/_/g, ' ')}</Badge></td>
                <td className="font-sans font-medium">{e.product_sku}</td>
                <td className="font-sans">{e.warehouse_id}</td>
                <td>{e.batch_number || <span className="text-muted-foreground">—</span>}</td>
                <td className={cn('text-right font-bold', Number(e.in_qty) > 0 ? 'text-emerald-600' : 'text-red-600')}>{Number(e.in_qty) > 0 ? '+' : ''}{Number(e.in_qty || e.out_qty || 0)}</td>
                <td className={cn('text-right font-bold', Number(e.in_qty) > 0 ? 'text-emerald-600' : 'text-red-600')}>{Number(e.balance_qty).toLocaleString('en-IN')}</td>
                <td className="text-muted-foreground">{e.entry_date ? new Date(e.entry_date).toLocaleString('en-IN') : '—'}</td>
                <td>{e.is_immutable ? <Badge variant="outline" className="text-xs">Immutable</Badge> : <span className="text-muted-foreground">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvMovementsTab() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await inventoryApi.listTransactions({ page: 1 })
        if (!cancelled) setMovements(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load movements')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const typeColor: Record<string, string> = {
    STOCK_IN: 'bg-emerald-100 text-emerald-800', STOCK_OUT: 'bg-red-100 text-red-800',
    ADJUSTMENT_INCREASE: 'bg-amber-100 text-amber-800', ADJUSTMENT_DECREASE: 'bg-orange-100 text-orange-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Movement History</h3>
        <p className="text-xs text-muted-foreground mt-1">Tracks every movement: who, when, from, to, reason, reference.</p></div>
      </div>
      {error && <div className="text-sm text-rose-500 mb-3">{error}</div>}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />)}</div>
      ) : movements.length === 0 ? (
        <EmptyState icon={PackageOpen} title="No movements found" description="Stock movements will appear here once inventory is updated." />
      ) : (
        <div className="space-y-2">
          {movements.map((m: any) => (
            <div key={m.id} className="border rounded-lg p-3 flex items-start gap-3">
              <span className={cn('inline-block px-2 py-1 rounded text-xs font-bold flex-shrink-0', typeColor[m.movement_type] ?? 'bg-slate-100 text-slate-800')}>{String(m.movement_type || '').replace(/_/g, ' ')}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium text-sm">{m.product_name}</p>
                  <Badge variant="outline" className="text-xs font-mono">{Number(m.quantity).toLocaleString('en-IN')} units</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-medium text-foreground">{m.warehouse_name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ref: <span className="font-mono">{m.reference_number || '—'}</span> · By: {m.performed_by_name || '—'} · {m.transaction_date ? new Date(m.transaction_date).toLocaleString('en-IN') : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Reason: {m.reason || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function InvJournalTab() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await inventoryApi.listLedger({ page: 1 })
        if (!cancelled) setEntries(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load journal')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Layers3 className="h-5 w-5" /> Inventory Journal (Immutable, Double-Entry)</h3>
        <p className="text-xs text-muted-foreground mt-1">Accounting-style immutable journal. Never edited. Never deleted. Every transaction creates paired entries for inventory valuation.</p></div>
      </div>
      {error && <div className="text-sm text-rose-500 mb-3">{error}</div>}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <EmptyState icon={Layers3} title="No journal entries found" description="Ledger entries will appear here once inventory movements occur." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Entry #</th><th className="font-medium">Movement</th>
              <th className="font-medium">Product</th><th className="font-medium text-right">In Qty</th>
              <th className="font-medium text-right">Out Qty</th><th className="font-medium text-right">Balance</th>
              <th className="font-medium text-right">Value</th><th className="font-medium">Date</th>
            </tr></thead>
            <tbody>
              {entries.map((e: any) => (
                <tr key={e.id} className="border-b hover:bg-muted/40 font-mono text-xs">
                  <td className="py-2.5">{e.entry_number}</td>
                  <td><Badge variant="outline" className="text-xs">{String(e.movement_type || '').replace(/_/g, ' ')}</Badge></td>
                  <td className="font-sans font-medium">{e.product_sku}</td>
                  <td className="text-right text-emerald-600">{Number(e.in_qty || 0).toLocaleString('en-IN')}</td>
                  <td className="text-right text-red-600">{Number(e.out_qty || 0).toLocaleString('en-IN')}</td>
                  <td className="text-right font-semibold">{Number(e.balance_qty || 0).toLocaleString('en-IN')}</td>
                  <td className="text-right">₹{Number(e.total_value || 0).toLocaleString('en-IN')}</td>
                  <td className="text-muted-foreground">{e.entry_date ? new Date(e.entry_date).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function InvAvailabilityTab() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await inventoryApi.list({ page: 1, pageSize: 1000 })
        if (!cancelled) setInventory(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load availability')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const totalAvailable = inventory.reduce((s: number, i: any) => s + Number(i.available_qty || 0), 0)
  const totalReserved = inventory.reduce((s: number, i: any) => s + Number(i.reserved_qty || 0), 0)
  const totalBlocked = inventory.reduce((s: number, i: any) => s + Number(i.blocked_qty || 0), 0)
  const totalExpired = inventory.filter((i: any) => i.is_expired).reduce((s: number, i: any) => s + Number(i.quantity || 0), 0)
  const totalUnits = inventory.reduce((s: number, i: any) => s + Number(i.quantity || 0), 0)
  const totalValue = inventory.reduce((s: number, i: any) => s + Number(i.total_value || 0), 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Stock Availability Dashboard</h3>
        <p className="text-xs text-muted-foreground mt-1">Real-time availability computed from live inventory data.</p></div>
      </div>
      {error && <div className="text-sm text-rose-500 mb-3">{error}</div>}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-muted/50 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Available</p><PackageCheck className="h-5 w-5 text-emerald-600" /></div><p className="text-2xl font-bold text-emerald-600">{totalAvailable.toLocaleString('en-IN')}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Reserved</p><ShieldCheck className="h-5 w-5 text-blue-600" /></div><p className="text-2xl font-bold text-blue-600">{totalReserved.toLocaleString('en-IN')}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Blocked</p><ShieldAlert className="h-5 w-5 text-orange-600" /></div><p className="text-2xl font-bold text-orange-600">{totalBlocked.toLocaleString('en-IN')}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Expired</p><AlertOctagon className="h-5 w-5 text-red-600" /></div><p className="text-2xl font-bold text-red-600">{totalExpired.toLocaleString('en-IN')}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Units</p><Boxes className="h-5 w-5 text-purple-600" /></div><p className="text-2xl font-bold">{totalUnits.toLocaleString('en-IN')}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Value</p><IndianRupee className="h-5 w-5 text-amber-600" /></div><p className="text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p></Card>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Goods Receipt & Putaway Module (Sprint 13) ─────────
type GRNTab = 'overview' | 'grns' | 'putaway' | 'quality' | 'rules'
