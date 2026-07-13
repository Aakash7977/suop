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
import { costingApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function CostingModule() {
  const [tab, setTab] = useState<CostingTab>('overview')

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true); setError('')
      try {
        const res = await costingApi.list({ page: 1, search: search || undefined })
        if (!cancelled) setData(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [search])
  const tabs: Array<{ key: CostingTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'layers', label: 'Cost Layers', icon: <Layers className="h-4 w-4" /> },
    { key: 'landed', label: 'Landed Cost', icon: <Truck className="h-4 w-4" /> },
    { key: 'revaluation', label: 'Revaluation', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'gl', label: 'GL Postings', icon: <FileText className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <IndianRupee className="h-7 w-7" /> Costing &amp; Valuation Engine
            </h2>
            <p className="text-emerald-200 text-sm max-w-3xl">
              End-to-end inventory cost layer management with FIFO/Weighted/Moving Average methods,
              landed cost allocation (FREIGHT, INSURANCE, CUSTOM_DUTY), cost revaluation workflow,
              GL integration (DEBIT/CREDIT pairs), and ABC/XYZ classification-based inventory valuation.
            </p>
          </div>
          <Badge className="bg-emerald-500 text-emerald-950 hover:bg-emerald-500">Sprint 20</Badge>
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
      {tab === 'overview' && <CostingOverviewTab />}
      {tab === 'layers' && <CostLayersTab />}
      {tab === 'landed' && <LandedCostTab />}
      {tab === 'revaluation' && <RevaluationTab />}
      {tab === 'gl' && <GLPostingsTab />}
    </div>
  )
}

function CostingOverviewTab() {
  const stats = [
    { label: 'Total Inventory Value', value: '₹16.59L', sub: '8 valuations · 6 ACTIVE', icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
    { label: 'Active Cost Layers', value: '8', sub: '4 ACTIVE · 3 PARTIAL · 1 CONSUMED', icon: <Layers className="h-5 w-5 text-blue-600" /> },
    { label: 'Landed Cost Docs', value: '3', sub: '1 POSTED · 1 ALLOCATED · 1 DRAFT', icon: <Truck className="h-5 w-5 text-cyan-600" /> },
    { label: 'Pending Revaluations', value: '1', sub: 'REV-001 awaiting CFO approval', icon: <TrendingUp className="h-5 w-5 text-amber-600" /> },
    { label: 'GL Postings', value: '6', sub: '3 DEBIT · 3 CREDIT · balanced', icon: <FileText className="h-5 w-5 text-purple-600" /> },
    { label: 'FIFO Layers', value: '6', sub: '₹12.41L value tracked FIFO', icon: <History className="h-5 w-5 text-indigo-600" /> },
    { label: 'Avg Unit Cost', value: '₹528.94', sub: 'Across all 8 valuations', icon: <Calculator className="h-5 w-5 text-rose-600" /> },
    { label: 'Dead Stock Value', value: '₹7,296', sub: '2 SKUs DEAD_STOCK · write-off candidate', icon: <AlertTriangle className="h-5 w-5 text-red-600" /> },
  ]
  const flowSteps = [
    { n: 1, label: 'Receipt → Cost Layer', detail: 'Purchase / Production / Transfer receipt creates an Inventory Cost Layer with unitCost + originalQty + remainingQty', color: 'text-blue-600' },
    { n: 2, label: 'Landed Cost Allocation', detail: 'Add FREIGHT, INSURANCE, CUSTOM_DUTY, TRANSPORT components — allocate via QUANTITY/WEIGHT/VOLUME/VALUE/EQUAL method to receipt lines', color: 'text-cyan-600' },
    { n: 3, label: 'Cost Method Application', detail: 'FIFO (oldest layer consumed first) · Weighted Average (total value / total qty) · Moving Average (recalc on each receipt) · Standard (variance to PV)', color: 'text-emerald-600' },
    { n: 4, label: 'Cost History (Immutable)', detail: 'Every cost change (RECEIPT/ISSUE/ADJUSTMENT/REVALUATION/LANDED_COST/TRANSFER) appends an entry to InventoryCostHistory with previous cost + variance', color: 'text-amber-600' },
    { n: 5, label: 'Revaluation Workflow', detail: 'INCREASE / DECREASE / MARKET_ADJUSTMENT / POLICY_CHANGE / STANDARD_COST_UPDATE — DRAFT → PENDING_APPROVAL → APPROVED → POSTED state machine', color: 'text-orange-600' },
    { n: 6, label: 'GL Posting (Double Entry)', detail: 'Auto-generate DEBIT/CREDIT pair — Inventory Account (RAW_MATERIAL / FINISHED_GOODS / WIP) ↔ Offset Account (COGS / GRNI / WIP / PURCHASE_VARIANCE)', color: 'text-rose-600' },
    { n: 7, label: 'ABC Classification', detail: 'Class A (top 20% items, 80% value) — tight control. Class B (next 30%, 15% value). Class C (bottom 50%, 5% value) — minimal control.', color: 'text-purple-600' },
    { n: 8, label: 'Valuation Snapshot', detail: 'Period-end snapshot — on-hand qty × unit cost = total value; with ABC class, XYZ class, movement category, ageing category for working-capital analysis', color: 'text-indigo-600' },
  ]
  const methodRecommendations = [
    { category: 'Raw Materials', method: 'FIFO', rationale: 'Preserve actual procurement cost per layer — match oldest cost to COGS first. Better for perishables & rising-price markets.', color: 'bg-emerald-100 text-emerald-800' },
    { category: 'Finished Goods', method: 'FIFO', rationale: 'Track batch production cost — older batches exit inventory first (aligns with FEFO for expiry management).', color: 'bg-blue-100 text-blue-800' },
    { category: 'Trading Goods', method: 'Weighted Average', rationale: 'Smoothen price volatility — single average cost across all receipts. Best for commodities with frequent price changes.', color: 'bg-cyan-100 text-cyan-800' },
    { category: 'Machinery & Spares', method: 'Moving Average', rationale: 'Recalculate average on each receipt — keeps inventory value current with latest procurement prices. Best for low-volume high-value items.', color: 'bg-amber-100 text-amber-800' },
  ]
  const abcGrid = [
    { cls: 'A', items: '20% SKUs', value: '80% value', control: 'Tight', color: 'bg-emerald-500 text-white', count: 3 },
    { cls: 'B', items: '30% SKUs', value: '15% value', control: 'Standard', color: 'bg-amber-500 text-white', count: 2 },
    { cls: 'C', items: '50% SKUs', value: '5% value', control: 'Minimal', color: 'bg-slate-500 text-white', count: 3 },
  ]
  const xyzGrid = [
    { cls: 'X', label: 'Stable demand', color: 'bg-emerald-100 text-emerald-800' },
    { cls: 'Y', label: 'Variable demand', color: 'bg-amber-100 text-amber-800' },
    { cls: 'Z', label: 'Irregular demand', color: 'bg-rose-100 text-rose-800' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Calculator className="h-5 w-5" /> Costing Flow — From Receipt to GL Posting</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 6 costing methods: FIFO, WEIGHTED_AVERAGE, MOVING_AVERAGE, STANDARD, ACTUAL, SPECIFIC_IDENTIFICATION</p>
          <p className="text-muted-foreground">// 8 cost components: FREIGHT, INSURANCE, CUSTOM_DUTY, LOADING, UNLOADING, TRANSPORT, HANDLING, BROKERAGE</p>
          <p className="text-muted-foreground">// 5 allocation methods: QUANTITY, WEIGHT, VOLUME, VALUE, EQUAL</p>
          <div className="grid gap-2 mt-3">
            {flowSteps.map(s => (
              <div key={s.n} className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded p-2 border border-slate-200 dark:border-slate-700">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-muted', s.color)}>{s.n}</span>
                <div className="flex-1">
                  <p className={cn('font-semibold', s.color)}>{s.label}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Layers className="h-5 w-5" /> Costing Method Recommendation by Product Type</h3>
          <div className="space-y-2">
            {methodRecommendations.map(m => (
              <div key={m.category} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{m.category}</p>
                  <Badge className={m.color}>{m.method}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{m.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Grid3x3 className="h-5 w-5" /> ABC / XYZ Classification Framework</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">ABC Analysis (Pareto by value)</p>
              <div className="grid grid-cols-3 gap-2">
                {abcGrid.map(a => (
                  <div key={a.cls} className="border rounded-md p-3 text-center">
                    <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold mb-1', a.color)}>{a.cls}</div>
                    <p className="text-[10px] text-muted-foreground">{a.items} · {a.value}</p>
                    <p className="text-xs font-semibold mt-1">{a.count} SKUs</p>
                    <p className="text-[10px] text-muted-foreground">{a.control} control</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">XYZ Analysis (Demand variability)</p>
              <div className="grid grid-cols-3 gap-2">
                {xyzGrid.map(x => (
                  <div key={x.cls} className="border rounded-md p-2 text-center">
                    <Badge className={cn('text-xs', x.color)}>{x.cls}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">{x.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 text-xs">
              <p className="font-semibold mb-1">Combined ABC-XYZ Matrix:</p>
              <p className="text-muted-foreground">AX = high-value stable (auto-reorder) · AZ = high-value irregular (safety stock) · CX = low-value stable (bulk order) · CZ = low-value irregular (write-off candidates)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function CostLayersTab() {
  const layers = [
    { id: 'icl-001', productName: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', method: 'FIFO', layer: 1, receiptType: 'PURCHASE', receipt: 'GRN-2026-00142', receiptDate: '2026-06-20', original: 500, consumed: 0, remaining: 500, unitCost: 850, remainingValue: 425000, landedCost: 901.50, hasLanded: true, status: 'ACTIVE' },
    { id: 'icl-002', productName: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', method: 'FIFO', layer: 2, receiptType: 'PURCHASE', receipt: 'GRN-2026-00098', receiptDate: '2026-05-15', original: 800, consumed: 320, remaining: 480, unitCost: 820, remainingValue: 393600, landedCost: 868.20, hasLanded: true, status: 'PARTIALLY_CONSUMED' },
    { id: 'icl-003', productName: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', method: 'FIFO', layer: 3, receiptType: 'PURCHASE', receipt: 'GRN-2026-00071', receiptDate: '2026-04-22', original: 600, consumed: 600, remaining: 0, unitCost: 780, remainingValue: 0, landedCost: 823.40, hasLanded: true, status: 'FULLY_CONSUMED' },
    { id: 'icl-004', productName: 'Kaju Katli 500g', warehouse: 'Mumbai DC', method: 'FIFO', layer: 4, receiptType: 'PRODUCTION', receipt: 'MO-2026-0089', receiptDate: '2026-07-01', original: 500, consumed: 0, remaining: 500, unitCost: 600, remainingValue: 300000, landedCost: null, hasLanded: false, status: 'ACTIVE' },
    { id: 'icl-005', productName: 'Kaju Katli 500g', warehouse: 'Mumbai DC', method: 'FIFO', layer: 5, receiptType: 'PRODUCTION', receipt: 'MO-2026-0090', receiptDate: '2026-07-05', original: 400, consumed: 20, remaining: 380, unitCost: 580, remainingValue: 220400, landedCost: null, hasLanded: false, status: 'PARTIALLY_CONSUMED' },
    { id: 'icl-006', productName: 'Ghee (Raw Material)', warehouse: 'Mumbai Plant Warehouse', method: 'FIFO', layer: 6, receiptType: 'PURCHASE', receipt: 'GRN-2026-00080', receiptDate: '2026-06-15', original: 100, consumed: 0, remaining: 100, unitCost: 520, remainingValue: 52000, landedCost: 559, hasLanded: true, status: 'ACTIVE' },
    { id: 'icl-007', productName: 'Soan Cake 1kg', warehouse: 'Mumbai DC', method: 'MOVING_AVERAGE', layer: 7, receiptType: 'PRODUCTION', receipt: 'MO-2026-0070', receiptDate: '2026-07-04', original: 150, consumed: 0, remaining: 150, unitCost: 625, remainingValue: 93750, landedCost: null, hasLanded: false, status: 'ACTIVE' },
    { id: 'icl-008', productName: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', method: 'WEIGHTED_AVERAGE', layer: 8, receiptType: 'PRODUCTION', receipt: 'MO-2026-0078', receiptDate: '2026-06-25', original: 200, consumed: 176, remaining: 24, unitCost: 304, remainingValue: 7296, landedCost: 324, hasLanded: true, status: 'PARTIALLY_CONSUMED' },
  ]
  const methodColors: Record<string, string> = {
    FIFO: 'bg-emerald-100 text-emerald-800',
    WEIGHTED_AVERAGE: 'bg-cyan-100 text-cyan-800',
    MOVING_AVERAGE: 'bg-amber-100 text-amber-800',
    STANDARD: 'bg-purple-100 text-purple-800',
    ACTUAL: 'bg-rose-100 text-rose-800',
    SPECIFIC_IDENTIFICATION: 'bg-indigo-100 text-indigo-800',
  }
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-600 text-white',
    PARTIALLY_CONSUMED: 'bg-amber-600 text-white',
    FULLY_CONSUMED: 'bg-slate-500 text-white',
    EXPIRED: 'bg-red-600 text-white',
    CLOSED: 'bg-slate-400 text-white',
  }
  const receiptColors: Record<string, string> = {
    PURCHASE: 'bg-blue-100 text-blue-800',
    PRODUCTION: 'bg-emerald-100 text-emerald-800',
    TRANSFER: 'bg-amber-100 text-amber-800',
    OPENING: 'bg-slate-100 text-slate-800',
    ADJUSTMENT: 'bg-rose-100 text-rose-800',
  }
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2"><Layers className="h-5 w-5" /> Inventory Cost Layers — FIFO Consumption Tracker</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3">Layer</th>
              <th className="py-2 pr-3">Product / Warehouse</th>
              <th className="py-2 pr-3">Method</th>
              <th className="py-2 pr-3">Receipt</th>
              <th className="py-2 pr-3 text-right">Original</th>
              <th className="py-2 pr-3 text-right">Consumed</th>
              <th className="py-2 pr-3 text-right">Remaining</th>
              <th className="py-2 pr-3 text-right">Unit Cost</th>
              <th className="py-2 pr-3 text-right">Remaining Value</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {layers.map(l => (
              <tr key={l.id} className="border-b hover:bg-muted/30">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">#{l.layer}</Badge>
                    {l.hasLanded && <Badge className="bg-purple-100 text-purple-800 text-[10px]" title={`Landed unit cost: ₹${l.landedCost}`}>LC</Badge>}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <p className="font-medium">{l.productName}</p>
                  <p className="text-xs text-muted-foreground">{l.warehouse} · {l.receiptDate}</p>
                </td>
                <td className="py-3 pr-3"><Badge className={methodColors[l.method]}>{l.method.replace(/_/g, ' ')}</Badge></td>
                <td className="py-3 pr-3">
                  <Badge className={receiptColors[l.receiptType]} variant="outline">{l.receiptType}</Badge>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{l.receipt}</p>
                </td>
                <td className="py-3 pr-3 text-right font-mono">{l.original}</td>
                <td className="py-3 pr-3 text-right font-mono text-amber-600">{l.consumed > 0 ? `−${l.consumed}` : '0'}</td>
                <td className={cn('py-3 pr-3 text-right font-mono font-semibold', l.remaining === 0 ? 'text-slate-400' : 'text-emerald-600')}>{l.remaining}</td>
                <td className="py-3 pr-3 text-right font-mono">₹{l.unitCost}</td>
                <td className="py-3 pr-3 text-right font-mono font-semibold">₹{l.remainingValue.toLocaleString('en-IN')}</td>
                <td className="py-3 pr-3"><Badge className={statusColors[l.status]}>{l.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded p-3 border border-emerald-200 dark:border-emerald-800">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">FIFO Principle</p>
          <p className="text-muted-foreground mt-1">Oldest layer (by receipt_date) consumed first during issue. Older unitCost exits inventory first — COGS reflects historical procurement cost.</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded p-3 border border-purple-200 dark:border-purple-800">
          <p className="font-semibold text-purple-700 dark:text-purple-400">Landed Cost Indicator (LC)</p>
          <p className="text-muted-foreground mt-1">Layers marked &quot;LC&quot; have landed cost applied — unitCost includes product cost + allocated FREIGHT/INSURANCE/CUSTOM_DUTY components.</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded p-3 border border-amber-200 dark:border-amber-800">
          <p className="font-semibold text-amber-700 dark:text-amber-400">Layer Status Lifecycle</p>
          <p className="text-muted-foreground mt-1">ACTIVE (full qty) → PARTIALLY_CONSUMED (some issued) → FULLY_CONSUMED (qty = 0) → CLOSED (period-end). EXPIRED = auto-flag from Batch &amp; Expiry engine.</p>
        </div>
      </div>
    </Card>
  )
}

function LandedCostTab() {
  const docs = [
    {
      id: 'lcd-001', docNumber: 'LC-2026-001', docDate: '2026-06-20', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0456',
      supplier: 'Mumbai Dry Fruits Co.', productCost: 425000, totalLanded: 450250, totalAllocated: 25250, status: 'POSTED',
      allocations: [
        { component: 'FREIGHT', amount: 12500, method: 'VALUE', percent: 49.50, vendor: 'VRL Logistics', invoice: 'VRL-2026-1187' },
        { component: 'INSURANCE', amount: 4250, method: 'VALUE', percent: 16.83, vendor: 'TATA AIG', invoice: 'TAIG-MAR-2026-0456' },
        { component: 'CUSTOM_DUTY', amount: 8500, method: 'VALUE', percent: 33.66, vendor: 'Mumbai Customs', invoice: 'CUS-2026-7741' },
      ],
    },
    {
      id: 'lcd-002', docNumber: 'LC-2026-002', docDate: '2026-06-15', refType: 'GRN', refNumber: 'GRN-2026-00080',
      supplier: 'Anand Dairy Ltd.', productCost: 52000, totalLanded: 55900, totalAllocated: 3900, status: 'ALLOCATED',
      allocations: [
        { component: 'FREIGHT', amount: 2600, method: 'QUANTITY', percent: 66.67, vendor: 'ColdEx Logistics', invoice: 'CE-2026-8821' },
        { component: 'LOADING', amount: 500, method: 'EQUAL', percent: 12.82, vendor: '—', invoice: '—' },
        { component: 'UNLOADING', amount: 500, method: 'EQUAL', percent: 12.82, vendor: '—', invoice: '—' },
        { component: 'HANDLING', amount: 300, method: 'EQUAL', percent: 7.69, vendor: '—', invoice: '—' },
      ],
    },
    {
      id: 'lcd-003', docNumber: 'LC-2026-003', docDate: '2026-07-08', refType: 'SHIPMENT', refNumber: 'SHP-2026-0123',
      supplier: null, productCost: 60800, totalLanded: 64800, totalAllocated: 0, status: 'DRAFT',
      allocations: [
        { component: 'TRANSPORT', amount: 3200, method: 'WEIGHT', percent: 80, vendor: 'SnowMan Cold Chain', invoice: 'SNW-2026-4452' },
        { component: 'INSURANCE', amount: 800, method: 'VALUE', percent: 20, vendor: 'ICICI Lombard', invoice: 'ICL-TRN-2026-0921' },
      ],
    },
  ]
  const componentColors: Record<string, string> = {
    FREIGHT: 'bg-blue-100 text-blue-800',
    INSURANCE: 'bg-emerald-100 text-emerald-800',
    CUSTOM_DUTY: 'bg-rose-100 text-rose-800',
    TRANSPORT: 'bg-cyan-100 text-cyan-800',
    LOADING: 'bg-amber-100 text-amber-800',
    UNLOADING: 'bg-orange-100 text-orange-800',
    HANDLING: 'bg-purple-100 text-purple-800',
    BROKERAGE: 'bg-indigo-100 text-indigo-800',
  }
  const methodColors: Record<string, string> = {
    QUANTITY: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    WEIGHT: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    VOLUME: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    VALUE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    EQUAL: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-500 text-white',
    PENDING_APPROVAL: 'bg-amber-600 text-white',
    APPROVED: 'bg-blue-600 text-white',
    ALLOCATED: 'bg-emerald-600 text-white',
    POSTED: 'bg-emerald-700 text-white',
    CANCELLED: 'bg-red-600 text-white',
  }
  const [allocated, setAllocated] = useState<Record<string, boolean>>({})
  return (
    <div className="space-y-4">
      {docs.map(d => {
        const isAllocated = allocated[d.id] || d.status === 'ALLOCATED' || d.status === 'POSTED'
        return (
          <Card key={d.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono">{d.docNumber}</Badge>
                  <Badge className={statusColors[allocated[d.id] ? 'ALLOCATED' : d.status]}>{allocated[d.id] ? 'ALLOCATED' : d.status}</Badge>
                  <Badge variant="outline">{d.refType}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{d.refNumber}</span>
                </div>
                <p className="font-semibold">{d.supplier || 'Internal shipment'}</p>
                <p className="text-xs text-muted-foreground">Document date: {d.docDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Landed Cost</p>
                <p className="text-2xl font-bold">₹{(d.productCost + (isAllocated ? d.allocations.reduce((s, a) => s + a.amount, 0) : d.totalAllocated)).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Product ₹{d.productCost.toLocaleString('en-IN')} + Components ₹{(isAllocated ? d.allocations.reduce((s, a) => s + a.amount, 0) : d.totalAllocated).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {d.allocations.map((a, i) => (
                <div key={i} className="border rounded-md p-3 bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={componentColors[a.component]}>{a.component.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className={cn('text-[10px]', methodColors[a.method])}>{a.method}</Badge>
                  </div>
                  <p className="text-lg font-bold">₹{a.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground">Allocation: {a.percent}%</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{a.vendor}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{a.invoice}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="text-muted-foreground">
                <span className="font-semibold">{d.allocations.length}</span> cost components ·
                Allocation methods: <span className="font-mono">{Array.from(new Set(d.allocations.map(a => a.method))).join(', ')}</span>
              </div>
              {d.status === 'DRAFT' && !allocated[d.id] && (
                <Button size="sm" onClick={() => setAllocated({ ...allocated, [d.id]: true })}>
                  <ArrowRightCircle className="mr-1 h-4 w-4" /> Allocate Components
                </Button>
              )}
              {isAllocated && d.status === 'DRAFT' && (
                <Badge className="bg-emerald-600 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Allocated just now</Badge>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function RevaluationTab() {
  const initial = [
    { id: 'irv-001', revNumber: 'REV-2026-001', revDate: '2026-07-09', product: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', type: 'INCREASE', reason: 'Supplier price increase — new stock procured at higher rate', oldCost: 820, newCost: 850, costDiff: 30, totalQty: 480, valueChange: 14400, status: 'PENDING_APPROVAL', createdBy: 'Ramesh Yadav' },
    { id: 'irv-002', revNumber: 'REV-2026-002', revDate: '2026-07-07', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', type: 'DECREASE', reason: 'Standard cost revision — BOM optimization reduces cashew content by 4%', oldCost: 600, newCost: 580, costDiff: -20, totalQty: 380, valueChange: -7600, status: 'POSTED', createdBy: 'Sandeep Kumar' },
    { id: 'irv-003', revNumber: 'REV-2026-003', revDate: '2026-07-06', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', type: 'MARKET_ADJUSTMENT', reason: 'Festive season demand spike — market price adjustment (Raksha Bandhan + Diwali)', oldCost: 600, newCost: 625, costDiff: 25, totalQty: 500, valueChange: 12500, status: 'APPROVED', createdBy: 'CEO Vikram' },
  ]
  const [revs, setRevs] = useState(initial)
  const typeColors: Record<string, string> = {
    INCREASE: 'bg-emerald-600 text-white',
    DECREASE: 'bg-red-600 text-white',
    MARKET_ADJUSTMENT: 'bg-amber-600 text-white',
    POLICY_CHANGE: 'bg-purple-600 text-white',
    STANDARD_COST_UPDATE: 'bg-blue-600 text-white',
  }
  const typeBorder: Record<string, string> = {
    INCREASE: 'border-l-emerald-500',
    DECREASE: 'border-l-red-500',
    MARKET_ADJUSTMENT: 'border-l-amber-500',
    POLICY_CHANGE: 'border-l-purple-500',
    STANDARD_COST_UPDATE: 'border-l-blue-500',
  }
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-500 text-white',
    PENDING_APPROVAL: 'bg-amber-600 text-white',
    APPROVED: 'bg-blue-600 text-white',
    POSTED: 'bg-emerald-700 text-white',
    REJECTED: 'bg-red-600 text-white',
    CANCELLED: 'bg-slate-400 text-white',
  }
  const handleApprove = (id: string) => {
    setRevs(revs.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r))
  }
  return (
    <div className="space-y-4">
      {revs.map(r => (
        <Card key={r.id} className={cn('p-5 border-l-4', typeBorder[r.type])}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono">{r.revNumber}</Badge>
                <Badge className={typeColors[r.type]}>{r.type.replace(/_/g, ' ')}</Badge>
                <Badge className={statusColors[r.status]}>{r.status.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="font-semibold">{r.product}</p>
              <p className="text-xs text-muted-foreground">{r.warehouse} · Revaluation date: {r.revDate} · Created by: {r.createdBy}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Value Change</p>
              <p className={cn('text-2xl font-bold', r.valueChange > 0 ? 'text-emerald-600' : 'text-red-600')}>
                {r.valueChange > 0 ? '+' : ''}₹{r.valueChange.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">Qty {r.totalQty} × ₹{r.costDiff} diff</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{r.reason}</p>
          <div className="grid gap-3 sm:grid-cols-3 mb-3">
            <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Old Unit Cost</p>
              <p className="text-xl font-bold">₹{r.oldCost}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground mb-1" />
              <p className={cn('text-sm font-semibold', r.costDiff > 0 ? 'text-emerald-600' : 'text-red-600')}>
                {r.costDiff > 0 ? '+' : ''}₹{r.costDiff}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">New Unit Cost</p>
              <p className="text-xl font-bold">₹{r.newCost}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">
              Revaluation type: <span className="font-semibold">{r.type.replace(/_/g, ' ')}</span> ·
              GL posting: {r.status === 'POSTED' ? <span className="font-mono text-emerald-600">GL-2026-0912 ✓</span> : <span className="text-amber-600">Pending CFO approval</span>}
            </p>
            {r.status === 'PENDING_APPROVAL' && (
              <Button size="sm" onClick={() => handleApprove(r.id)}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Approve Revaluation
              </Button>
            )}
            {r.status === 'APPROVED' && (
              <Badge className="bg-blue-600 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Approved — pending GL posting</Badge>
            )}
            {r.status === 'POSTED' && (
              <Badge className="bg-emerald-700 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Posted to GL</Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

function GLPostingsTab() {
  const postings = [
    { id: 'igp-001', postingNumber: 'GL-2026-0881', postingDate: '2026-06-20 12:00', sourceType: 'INVENTORY_TRANSACTION', sourceNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', entryType: 'DEBIT', inventoryAccount: 'RAW_MATERIAL', offsetAccount: 'GRNI', qty: 500, unitCost: 850, amount: 425000, description: 'Goods receipt — cashew 500 kg @ ₹850' },
    { id: 'igp-002', postingNumber: 'GL-2026-0882', postingDate: '2026-06-20 12:00', sourceType: 'INVENTORY_TRANSACTION', sourceNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', entryType: 'CREDIT', inventoryAccount: 'GRNI', offsetAccount: 'RAW_MATERIAL', qty: 500, unitCost: 850, amount: 425000, description: 'GRNI clearing — cashew 500 kg @ ₹850' },
    { id: 'igp-003', postingNumber: 'GL-2026-0895', postingDate: '2026-07-01 16:00', sourceType: 'INVENTORY_TRANSACTION', sourceNumber: 'MO-2026-0089', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', entryType: 'DEBIT', inventoryAccount: 'FINISHED_GOODS', offsetAccount: 'WIP', qty: 500, unitCost: 600, amount: 300000, description: 'Production receipt — Kaju Katli 500 BOX @ ₹600' },
    { id: 'igp-004', postingNumber: 'GL-2026-0896', postingDate: '2026-07-01 16:00', sourceType: 'INVENTORY_TRANSACTION', sourceNumber: 'MO-2026-0089', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', entryType: 'CREDIT', inventoryAccount: 'WIP', offsetAccount: 'FINISHED_GOODS', qty: 500, unitCost: 600, amount: 300000, description: 'WIP clearing — Kaju Katli production order MO-2026-0089' },
    { id: 'igp-005', postingNumber: 'GL-2026-0918', postingDate: '2026-07-05 14:00', sourceType: 'INVENTORY_TRANSACTION', sourceNumber: 'INV-2026-00892', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', entryType: 'DEBIT', inventoryAccount: 'COGS', offsetAccount: 'FINISHED_GOODS', qty: 100, unitCost: 510, amount: 51000, description: 'COGS for sales invoice INV-2026-00892 — 100 BOX @ ₹510 (FIFO)' },
    { id: 'igp-006', postingNumber: 'GL-2026-0919', postingDate: '2026-07-05 14:00', sourceType: 'INVENTORY_TRANSACTION', sourceNumber: 'INV-2026-00892', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', entryType: 'CREDIT', inventoryAccount: 'FINISHED_GOODS', offsetAccount: 'COGS', qty: 100, unitCost: 510, amount: 51000, description: 'Inventory relief for sales invoice INV-2026-00892 — 100 BOX' },
  ]
  const accountColors: Record<string, string> = {
    INVENTORY_ASSET: 'bg-emerald-100 text-emerald-800',
    RAW_MATERIAL: 'bg-amber-100 text-amber-800',
    FINISHED_GOODS: 'bg-blue-100 text-blue-800',
    WIP: 'bg-purple-100 text-purple-800',
    COGS: 'bg-rose-100 text-rose-800',
    GRNI: 'bg-cyan-100 text-cyan-800',
    PURCHASE_VARIANCE: 'bg-orange-100 text-orange-800',
    SCRAP: 'bg-red-100 text-red-800',
    WRITE_OFF: 'bg-slate-100 text-slate-800',
  }
  const totalDebit = postings.filter(p => p.entryType === 'DEBIT').reduce((s, p) => s + p.amount, 0)
  const totalCredit = postings.filter(p => p.entryType === 'CREDIT').reduce((s, p) => s + p.amount, 0)
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Inventory GL Postings — Double Entry Journal</h3>
        <div className="flex items-center gap-3 text-sm">
          <Badge className="bg-emerald-600 text-white">DEBIT ₹{totalDebit.toLocaleString('en-IN')}</Badge>
          <Badge className="bg-red-600 text-white">CREDIT ₹{totalCredit.toLocaleString('en-IN')}</Badge>
          <Badge className="bg-emerald-700 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Balanced</Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3">Posting # / Date</th>
              <th className="py-2 pr-3">Source / Reference</th>
              <th className="py-2 pr-3">Product / Warehouse</th>
              <th className="py-2 pr-3">Entry</th>
              <th className="py-2 pr-3">Inventory Account</th>
              <th className="py-2 pr-3">Offset Account</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="py-2 pr-3 text-right">Unit Cost</th>
              <th className="py-2 pr-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {postings.map(p => (
              <tr key={p.id} className={cn('border-b hover:bg-muted/30', p.entryType === 'DEBIT' ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'bg-red-50/40 dark:bg-red-950/20')}>
                <td className="py-3 pr-3">
                  <p className="font-mono text-xs font-semibold">{p.postingNumber}</p>
                  <p className="text-[10px] text-muted-foreground">{p.postingDate}</p>
                </td>
                <td className="py-3 pr-3">
                  <p className="text-xs">{p.sourceType.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.sourceNumber}</p>
                </td>
                <td className="py-3 pr-3">
                  <p className="font-medium text-xs">{p.product}</p>
                  <p className="text-[10px] text-muted-foreground">{p.warehouse}</p>
                </td>
                <td className="py-3 pr-3">
                  <Badge className={p.entryType === 'DEBIT' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}>
                    {p.entryType}
                  </Badge>
                </td>
                <td className="py-3 pr-3"><Badge className={accountColors[p.inventoryAccount] || 'bg-slate-100 text-slate-800'} variant="outline">{p.inventoryAccount.replace(/_/g, ' ')}</Badge></td>
                <td className="py-3 pr-3"><Badge className={accountColors[p.offsetAccount] || 'bg-slate-100 text-slate-800'} variant="outline">{p.offsetAccount.replace(/_/g, ' ')}</Badge></td>
                <td className="py-3 pr-3 text-right font-mono text-xs">{p.qty}</td>
                <td className="py-3 pr-3 text-right font-mono text-xs">₹{p.unitCost}</td>
                <td className={cn('py-3 pr-3 text-right font-mono font-bold', p.entryType === 'DEBIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')}>
                  {p.entryType === 'DEBIT' ? '+' : '−'}₹{p.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded p-3 border border-emerald-200 dark:border-emerald-800">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">DEBIT Entry (Asset Increase / Expense)</p>
          <p className="text-muted-foreground mt-1">Increases inventory asset (RAW_MATERIAL / FINISHED_GOODS / WIP) or recognizes COGS expense. Posted when stock is received or consumed for sales.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 rounded p-3 border border-red-200 dark:border-red-800">
          <p className="font-semibold text-red-700 dark:text-red-400">CREDIT Entry (Asset Decrease / Liability)</p>
          <p className="text-muted-foreground mt-1">Decreases inventory asset (inventory relief on sale) or clears GRNI liability. Offset to DEBIT — every posting must have a matching pair.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3 border border-blue-200 dark:border-blue-800">
          <p className="font-semibold text-blue-700 dark:text-blue-400">Source Types</p>
          <p className="text-muted-foreground mt-1">INVENTORY_TRANSACTION (receipt/issue/transfer) · REVALUATION (cost adjustment) · LANDED_COST (component allocation) · ADJUSTMENT (gain/loss) · WRITE_OFF (damage/expiry).</p>
        </div>
      </div>
    </Card>
  )
}

// ─── Mission Control Module (Sprint 21) ─────────────────
type MissionControlTab = 'mission' | 'kpis' | 'classification' | 'ageing' | 'reorder'
