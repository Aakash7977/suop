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
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await inventoryApi.listTransactions({ page: 1 })
        if (!cancelled) setTransactions(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load transactions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = transactions.filter((t: any) =>
    !search || String(t.transaction_number || t.number || '').toLowerCase().includes(search.toLowerCase()) ||
    String(t.movement_type || t.type || '').toLowerCase().includes(search.toLowerCase())
  )

  const _transactions = [
    { id: 'it-001', number: 'INV-2026-00142', type: 'GOODS_RECEIPT', date: '2026-07-08', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0142', warehouse: 'Mumbai Plant Warehouse', partner: 'Konkan Cashew Processors', status: 'POSTED', lines: 3, totalQty: 380, totalValue: 114000, createdBy: 'Suresh Patil' },
    { id: 'it-002', number: 'INV-2026-00143', type: 'GOODS_RECEIPT', date: '2026-07-08', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0156', warehouse: 'Mumbai Plant Warehouse', partner: 'Sri Balaji Sugar', status: 'POSTED', lines: 1, totalQty: 500, totalValue: 25000, createdBy: 'Suresh Patil' },
    { id: 'it-003', number: 'INV-2026-00144', type: 'PRODUCTION_RECEIPT', date: '2026-07-01', refType: 'PRODUCTION_ORDER', refNumber: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 1, totalQty: 500, totalValue: 175000, createdBy: 'Anita Desai' },
    { id: 'it-004', number: 'INV-2026-00145', type: 'TRANSFER', date: '2026-07-03', refType: 'TRANSFER_ORDER', refNumber: 'TO-2026-0042', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 1, totalQty: 358, totalValue: 125300, createdBy: 'Anita Desai' },
    { id: 'it-005', number: 'INV-2026-00146', type: 'SALES', date: '2026-07-05', refType: 'INVOICE', refNumber: 'INV-2026-00892', warehouse: 'Mumbai DC', partner: 'Tata Consumer Products', status: 'POSTED', lines: 1, totalQty: 100, totalValue: 54000, createdBy: 'Vikram Iyer' },
    { id: 'it-006', number: 'INV-2026-00147', type: 'SALES', date: '2026-07-06', refType: 'INVOICE', refNumber: 'INV-2026-00915', warehouse: 'Mumbai DC', partner: 'Reliance Retail', status: 'POSTED', lines: 1, totalQty: 48, totalValue: 25920, createdBy: 'Vikram Iyer' },
    { id: 'it-007', number: 'INV-2026-00148', type: 'RESERVATION', date: '2026-07-08', refType: 'SALES_ORDER', refNumber: 'SO-2026-0234', warehouse: 'Mumbai DC', partner: 'Infosys', status: 'POSTED', lines: 1, totalQty: 24, totalValue: 12960, createdBy: 'Vikram Iyer' },
    { id: 'it-008', number: 'INV-2026-00149', type: 'DAMAGE', date: '2026-07-07', refType: 'DAMAGE_REPORT', refNumber: 'DMG-2026-0012', warehouse: 'Mumbai DC', partner: null, status: 'PENDING_APPROVAL', lines: 1, totalQty: 8, totalValue: 4320, createdBy: 'Anita Desai' },
    { id: 'it-009', number: 'INV-2026-00150', type: 'ADJUSTMENT', date: '2026-07-09', refType: 'ADJUSTMENT_REQUEST', refNumber: 'ADJ-2026-0034', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'PENDING_APPROVAL', lines: 2, totalQty: 12, totalValue: 6480, createdBy: 'Suresh Patil' },
    { id: 'it-010', number: 'INV-2026-00151', type: 'OPENING_STOCK', date: '2026-01-01', refType: 'OPENING_STOCK', refNumber: 'OS-2026-001', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 12, totalQty: 2400, totalValue: 840000, createdBy: 'System' },
  ]
  const typeColor: Record<string, string> = {
    GOODS_RECEIPT: 'bg-emerald-100 text-emerald-800', GOODS_ISSUE: 'bg-red-100 text-red-800',
    TRANSFER: 'bg-blue-100 text-blue-800', ADJUSTMENT: 'bg-amber-100 text-amber-800',
    PRODUCTION_RECEIPT: 'bg-emerald-100 text-emerald-800', PRODUCTION_CONSUMPTION: 'bg-orange-100 text-orange-800',
    SALES: 'bg-purple-100 text-purple-800', SALES_RETURN: 'bg-cyan-100 text-cyan-800',
    PURCHASE_RETURN: 'bg-red-100 text-red-800', OPENING_STOCK: 'bg-slate-100 text-slate-800',
    CYCLE_COUNT: 'bg-teal-100 text-teal-800', RESERVATION: 'bg-indigo-100 text-indigo-800',
    ALLOCATION: 'bg-violet-100 text-violet-800', RELEASE: 'bg-pink-100 text-pink-800',
    SCRAP: 'bg-red-200 text-red-900', DAMAGE: 'bg-orange-200 text-orange-900',
    EXPIRY: 'bg-gray-200 text-gray-800', STOCK_TAKE: 'bg-teal-100 text-teal-800',
  }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REVERSED: 'bg-red-600 hover:bg-red-600', CANCELLED: 'bg-gray-600 hover:bg-gray-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Inventory Transactions</h3>
        <p className="text-xs text-muted-foreground mt-1">18 transaction types supported. Every transaction posts to the immutable ledger. Negative stock blocked by default. Reversible (except Opening Stock, Scrap, Expiry).</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Transaction</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Transaction #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Reference</th>
            <th className="font-medium">Warehouse</th><th className="font-medium">Partner</th>
            <th className="font-medium text-right">Qty</th><th className="font-medium text-right">Value</th>
            <th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{t.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[t.type])}>{t.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{t.date}</td>
                <td className="text-xs"><span className="font-mono">{t.refNumber}</span><br /><span className="text-muted-foreground">{t.refType.replace(/_/g, ' ')}</span></td>
                <td className="text-xs">{t.warehouse}</td>
                <td className="text-xs">{t.partner || <span className="text-muted-foreground">—</span>}</td>
                <td className="text-right font-mono">{t.totalQty}</td>
                <td className="text-right font-mono">₹{t.totalValue.toLocaleString('en-IN')}</td>
                <td><Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

  const _balances = [
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', available: 142, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 142, unitCost: 350, totalValue: 49700, expiry: '2026-07-31' },
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', available: 186, reserved: 24, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 210, unitCost: 350, totalValue: 73500, expiry: '2026-07-31' },
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2606-05', available: 0, reserved: 0, allocated: 0, damaged: 0, expired: 56, inTransit: 0, total: 56, unitCost: 345, totalValue: 19320, expiry: '2026-07-25' },
    { product: 'Soan Cake 1kg', warehouse: 'Mumbai Plant Warehouse', batch: 'SC-2606-04', available: 89, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 89, unitCost: 625, totalValue: 55625, expiry: '2026-09-15' },
    { product: 'Mixed Namkeen 200g', warehouse: 'Mumbai Plant Warehouse', batch: 'MN-2607-03', available: 1180, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 1180, unitCost: 53, totalValue: 62540, expiry: '2026-08-22' },
    { product: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', batch: 'GJ-2607-01', available: 412, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 412, unitCost: 304, totalValue: 125248, expiry: '2026-08-05' },
    { product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 35, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 35, unitCost: 850, totalValue: 29750, expiry: null },
    { product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 28, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 28, unitCost: 45, totalValue: 1260, expiry: null },
    { product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 12, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 12, unitCost: 520, totalValue: 6240, expiry: null },
    { product: 'Packaging Boxes', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 2840, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 2840, unitCost: 12, totalValue: 34080, expiry: null },
  ]
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
            {balances.map((b, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{b.product}</td>
                <td className="text-xs">{b.warehouse}</td>
                <td className="font-mono text-xs">{b.batch || <span className="text-muted-foreground">—</span>}</td>
                <td className="text-right font-mono font-semibold text-emerald-600">{b.available}</td>
                <td className="text-right font-mono text-blue-600">{b.reserved}</td>
                <td className="text-right font-mono text-purple-600">{b.allocated}</td>
                <td className="text-right font-mono text-orange-600">{b.damaged}</td>
                <td className="text-right font-mono text-red-600">{b.expired}</td>
                <td className="text-right font-mono font-semibold">{b.total}</td>
                <td className="text-right font-mono">₹{b.totalValue.toLocaleString('en-IN')}</td>
                <td className="text-xs text-muted-foreground">{b.expiry || '—'}</td>
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

  const _entries = [
    { id: 'sl-001', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 200, availDelta: 200, postingDate: '2026-07-08 10:15', isReversal: false },
    { id: 'sl-002', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 150, availDelta: 150, postingDate: '2026-07-08 10:15', isReversal: false },
    { id: 'sl-003', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 30, availDelta: 30, postingDate: '2026-07-08 10:15', isReversal: false },
    { id: 'sl-004', txnNumber: 'INV-2026-00143', txnType: 'GOODS_RECEIPT', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 500, availDelta: 500, postingDate: '2026-07-08 10:20', isReversal: false },
    { id: 'sl-005', txnNumber: 'INV-2026-00144', txnType: 'PRODUCTION_RECEIPT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', qtyDelta: 500, availDelta: 500, postingDate: '2026-07-01 16:00', isReversal: false },
    { id: 'sl-006', txnNumber: 'INV-2026-00145', txnType: 'TRANSFER', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', qtyDelta: -358, availDelta: -358, postingDate: '2026-07-03 10:00', isReversal: false },
    { id: 'sl-007', txnNumber: 'INV-2026-00145', txnType: 'TRANSFER', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: 358, availDelta: 358, postingDate: '2026-07-03 10:00', isReversal: false },
    { id: 'sl-008', txnNumber: 'INV-2026-00146', txnType: 'SALES', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -100, availDelta: -100, postingDate: '2026-07-05 14:00', isReversal: false },
    { id: 'sl-009', txnNumber: 'INV-2026-00147', txnType: 'SALES', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -48, availDelta: -48, postingDate: '2026-07-06 11:30', isReversal: false },
    { id: 'sl-010', txnNumber: 'INV-2026-00148', txnType: 'RESERVATION', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -24, availDelta: -24, postingDate: '2026-07-08 09:00', isReversal: false },
  ]
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
            {entries.map(e => (
              <tr key={e.id} className="border-b hover:bg-muted/40 font-mono text-xs">
                <td className="py-2.5">{e.txnNumber}</td>
                <td><Badge variant="outline" className="text-xs">{e.txnType.replace(/_/g, ' ')}</Badge></td>
                <td className="font-sans font-medium">{e.product}</td>
                <td className="font-sans">{e.warehouse}</td>
                <td>{e.batch || <span className="text-muted-foreground">—</span>}</td>
                <td className={cn('text-right font-bold', e.qtyDelta > 0 ? 'text-emerald-600' : 'text-red-600')}>{e.qtyDelta > 0 ? '+' : ''}{e.qtyDelta}</td>
                <td className={cn('text-right font-bold', e.availDelta > 0 ? 'text-emerald-600' : 'text-red-600')}>{e.availDelta > 0 ? '+' : ''}{e.availDelta}</td>
                <td className="text-muted-foreground">{e.postingDate}</td>
                <td>{e.isReversal ? <Badge variant="destructive" className="text-xs">Yes</Badge> : <span className="text-muted-foreground">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvMovementsTab() {
  const movements = [
    { id: 'sm-001', product: 'Cashew Nuts (Raw)', type: 'IN', qty: 200, from: 'Konkan Cashew Processors', to: 'Mumbai Plant Warehouse', ref: 'PO-2026-0142', partner: 'Konkan Cashew', performedBy: 'Suresh Patil', reason: 'Purchase receipt', date: '2026-07-08 10:15' },
    { id: 'sm-002', product: 'Sugar (Raw)', type: 'IN', qty: 500, from: 'Sri Balaji Sugar', to: 'Mumbai Plant Warehouse', ref: 'PO-2026-0156', partner: 'Sri Balaji Sugar', performedBy: 'Suresh Patil', reason: 'Purchase receipt', date: '2026-07-08 10:20' },
    { id: 'sm-003', product: 'Kaju Katli 500g', type: 'IN', qty: 500, from: 'Production Line 1', to: 'Mumbai Plant Warehouse', ref: 'MO-2026-0089', partner: null, performedBy: 'Anita Desai', reason: 'Production output', date: '2026-07-01 16:00' },
    { id: 'sm-004', product: 'Kaju Katli 500g', type: 'TRANSFER', qty: 358, from: 'Mumbai Plant Warehouse', to: 'Mumbai DC', ref: 'TO-2026-0042', partner: null, performedBy: 'Anita Desai', reason: 'Inter-warehouse transfer', date: '2026-07-03 10:00' },
    { id: 'sm-005', product: 'Kaju Katli 500g', type: 'OUT', qty: 100, from: 'Mumbai DC', to: 'Tata Consumer Products', ref: 'INV-2026-00892', partner: 'Tata Consumer', performedBy: 'Vikram Iyer', reason: 'Sales dispatch', date: '2026-07-05 14:00' },
    { id: 'sm-006', product: 'Kaju Katli 500g', type: 'OUT', qty: 48, from: 'Mumbai DC', to: 'Reliance Retail', ref: 'INV-2026-00915', partner: 'Reliance Retail', performedBy: 'Vikram Iyer', reason: 'Sales dispatch', date: '2026-07-06 11:30' },
    { id: 'sm-007', product: 'Kaju Katli 500g', type: 'RESERVATION', qty: 24, from: 'Mumbai DC', to: 'Mumbai DC (Reserved)', ref: 'SO-2026-0234', partner: 'Infosys', performedBy: 'Vikram Iyer', reason: 'Customer order reservation', date: '2026-07-08 09:00' },
  ]
  const typeColor: Record<string, string> = { IN: 'bg-emerald-100 text-emerald-800', OUT: 'bg-red-100 text-red-800', TRANSFER: 'bg-blue-100 text-blue-800', ADJUSTMENT: 'bg-amber-100 text-amber-800', RESERVATION: 'bg-indigo-100 text-indigo-800', ALLOCATION: 'bg-violet-100 text-violet-800', RELEASE: 'bg-pink-100 text-pink-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Movement History</h3>
        <p className="text-xs text-muted-foreground mt-1">Tracks every movement: who, when, from, to, reason, reference. Supports forward and backward traceability.</p></div>
      </div>
      <div className="space-y-2">
        {movements.map(m => (
          <div key={m.id} className="border rounded-lg p-3 flex items-start gap-3">
            <span className={cn('inline-block px-2 py-1 rounded text-xs font-bold flex-shrink-0', typeColor[m.type])}>{m.type}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-sm">{m.product}</p>
                <Badge variant="outline" className="text-xs font-mono">{m.qty} units</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground">{m.from}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-foreground">{m.to}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ref: <span className="font-mono">{m.ref}</span> · {m.partner && `Partner: ${m.partner} · `}By: {m.performedBy} · {m.date}
              </p>
              <p className="text-xs text-muted-foreground">Reason: {m.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function InvJournalTab() {
  const entries = [
    { id: 'ij-001', entryNumber: 'IJ-2026-00284', txnNumber: 'INV-2026-00142', entryType: 'DEBIT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qty: 200, unitCost: 850, totalValue: 170000, account: 'RAW_MATERIAL', offsetAccount: 'GRNI', ref: 'PO-2026-0142', postingDate: '2026-07-08 10:15' },
    { id: 'ij-002', entryNumber: 'IJ-2026-00285', txnNumber: 'INV-2026-00142', entryType: 'CREDIT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qty: 200, unitCost: 850, totalValue: 170000, account: 'GRNI', offsetAccount: 'RAW_MATERIAL', ref: 'PO-2026-0142', postingDate: '2026-07-08 10:15' },
    { id: 'ij-003', entryNumber: 'IJ-2026-00286', txnNumber: 'INV-2026-00144', entryType: 'DEBIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', qty: 500, unitCost: 350, totalValue: 175000, account: 'FINISHED_GOODS', offsetAccount: 'WIP', ref: 'MO-2026-0089', postingDate: '2026-07-01 16:00' },
    { id: 'ij-004', entryNumber: 'IJ-2026-00287', txnNumber: 'INV-2026-00144', entryType: 'CREDIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', qty: 500, unitCost: 350, totalValue: 175000, account: 'WIP', offsetAccount: 'FINISHED_GOODS', ref: 'MO-2026-0089', postingDate: '2026-07-01 16:00' },
    { id: 'ij-005', entryNumber: 'IJ-2026-00288', txnNumber: 'INV-2026-00146', entryType: 'CREDIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', qty: 100, unitCost: 540, totalValue: 54000, account: 'FINISHED_GOODS', offsetAccount: 'COGS', ref: 'INV-2026-00892', postingDate: '2026-07-05 14:00' },
    { id: 'ij-006', entryNumber: 'IJ-2026-00289', txnNumber: 'INV-2026-00146', entryType: 'DEBIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', qty: 100, unitCost: 540, totalValue: 54000, account: 'COGS', offsetAccount: 'FINISHED_GOODS', ref: 'INV-2026-00892', postingDate: '2026-07-05 14:00' },
  ]
  const typeColor: Record<string, string> = { DEBIT: 'bg-emerald-100 text-emerald-800', CREDIT: 'bg-red-100 text-red-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Layers3 className="h-5 w-5" /> Inventory Journal (Immutable, Double-Entry)</h3>
        <p className="text-xs text-muted-foreground mt-1">Accounting-style immutable journal. Never edited. Never deleted. Only reversal entries. Every transaction creates paired DEBIT/CREDIT entries for inventory valuation.</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Entry #</th><th className="font-medium">Type</th>
            <th className="font-medium">Product</th><th className="font-medium text-right">Qty</th>
            <th className="font-medium text-right">Unit Cost</th><th className="font-medium text-right">Total Value</th>
            <th className="font-medium">Account</th><th className="font-medium">Offset Account</th>
            <th className="font-medium">Reference</th><th className="font-medium">Posted</th>
          </tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b hover:bg-muted/40 font-mono text-xs">
                <td className="py-2.5">{e.entryNumber}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold', typeColor[e.entryType])}>{e.entryType}</span></td>
                <td className="font-sans font-medium">{e.product}</td>
                <td className="text-right">{e.qty}</td>
                <td className="text-right">₹{e.unitCost}</td>
                <td className="text-right font-semibold">₹{e.totalValue.toLocaleString('en-IN')}</td>
                <td><Badge variant="outline" className="text-xs">{e.account}</Badge></td>
                <td><Badge variant="outline" className="text-xs">{e.offsetAccount}</Badge></td>
                <td>{e.ref}</td>
                <td className="text-muted-foreground">{e.postingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvAvailabilityTab() {
  const summary = {
    totalAvailable: 4904,
    totalReserved: 24,
    totalAllocated: 0,
    totalDamaged: 0,
    totalExpired: 56,
    totalInTransit: 0,
    totalUnits: 4984,
    totalValue: 516258,
  }
  const byProduct = [
    { product: 'Kaju Katli 500g', available: 328, reserved: 24, expired: 56, value: 142520 },
    { product: 'Soan Cake 1kg', available: 89, reserved: 0, expired: 0, value: 55625 },
    { product: 'Mixed Namkeen 200g', available: 1180, reserved: 0, expired: 0, value: 62540 },
    { product: 'Gulab Jamun 1kg', available: 412, reserved: 0, expired: 0, value: 125248 },
    { product: 'Cashew Nuts (Raw)', available: 35, reserved: 0, expired: 0, value: 29750 },
    { product: 'Sugar (Raw)', available: 28, reserved: 0, expired: 0, value: 1260 },
    { product: 'Ghee (Raw)', available: 12, reserved: 0, expired: 0, value: 6240 },
    { product: 'Packaging Boxes', available: 2840, reserved: 0, expired: 0, value: 34080 },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Stock Availability Service</h3>
        <p className="text-xs text-muted-foreground mt-1">Shared service that every module calls instead of reading stock directly. Returns available, reserved, allocated, in-transit, and projected quantities.</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <div className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.totalAvailable.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <p className="text-xs text-muted-foreground">Reserved</p>
          <p className="text-2xl font-bold text-blue-600">{summary.totalReserved}</p>
        </div>
        <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
          <p className="text-xs text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpired}</p>
        </div>
        <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold text-amber-600">₹{summary.totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <h4 className="font-semibold text-sm mb-3">Availability by Product</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th>
            <th className="font-medium text-right">Available</th>
            <th className="font-medium text-right">Reserved</th>
            <th className="font-medium text-right">Expired</th>
            <th className="font-medium text-right">Value</th>
          </tr></thead>
          <tbody>
            {byProduct.map(p => (
              <tr key={p.product} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{p.product}</td>
                <td className="text-right font-mono font-semibold text-emerald-600">{p.available}</td>
                <td className="text-right font-mono text-blue-600">{p.reserved}</td>
                <td className="text-right font-mono text-red-600">{p.expired}</td>
                <td className="text-right font-mono">₹{p.value.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Goods Receipt & Putaway Module (Sprint 13) ─────────
type GRNTab = 'overview' | 'grns' | 'putaway' | 'quality' | 'rules'
