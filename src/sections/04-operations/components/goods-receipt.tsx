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
import { goodsReceiptApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function GoodsReceiptModule() {
  const { hasPermission } = useAuthStore()
  const [tab, setTab] = useState<GRNTab>('overview')
  const tabs: Array<{ key: GRNTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Dashboard', icon: <Gauge className="h-4 w-4" /> },
    { key: 'grns', label: 'Goods Receipts', icon: <Truck className="h-4 w-4" /> },
    { key: 'putaway', label: 'Putaway Tasks', icon: <PackageOpen className="h-4 w-4" /> },
    { key: 'quality', label: 'Quality Holds', icon: <FlaskConical className="h-4 w-4" /> },
    { key: 'rules', label: 'Putaway Rules', icon: <ListChecks className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-cyan-950 via-blue-900 to-indigo-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Truck className="h-7 w-7" /> Goods Receipt & Intelligent Putaway Engine
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              The first real inventory operation — stock physically enters SUOP. Create GRNs, scan barcodes,
              verify supplier deliveries, assign batches, quality hold for inspection, intelligent putaway with
              FIFO/FEFO/ABC strategies, and automatic ledger posting.
            </p>
          </div>
          <Badge className="bg-cyan-500 text-cyan-950 hover:bg-cyan-500">Sprint 13</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-cyan-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-cyan-900 dark:text-cyan-200">Receiving Flow (Food Manufacturing Best Practice)</p>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
              Supplier Truck → Receiving Dock → Goods Receipt → Quality Check → Temporary Receiving Area → Putaway → Storage Bin → Available Stock. Stock is NOT available until quality release + putaway completion.
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

      {tab === 'overview' && <GRNOverviewTab />}
      {tab === 'grns' && <GRNListTab />}
      {tab === 'putaway' && <GRNPutawayTab />}
      {tab === 'quality' && <GRNQualityTab />}
      {tab === 'rules' && <GRNRulesTab />}
    </div>
  )
}

function GRNOverviewTab() {
  const [stats, setStats] = useState<Array<{ label: string; value: string; sub: string; icon: React.ReactNode }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await goodsReceiptApi.list({ page: 1, pageSize: 1000 })
        if (cancelled) return
        const grns = res.data || []
        const completed = grns.filter((g: any) => g.status === 'CLOSED' || g.status === 'ACCEPTED').length
        const pending = grns.filter((g: any) => g.status === 'DRAFT' || g.status === 'VERIFIED').length
        const rejected = grns.reduce((s: number, g: any) => s + Number(g.total_rejected_qty || 0), 0)
        const totalValue = grns.reduce((s: number, g: any) => s + Number(g.total_accepted_qty || 0) * Number(g.total_qty || 0), 0)
        setStats([
          { label: 'Total GRNs', value: String(grns.length), sub: `${completed} completed · ${pending} pending`, icon: <Truck className="h-5 w-5 text-blue-600" /> },
          { label: 'Pending Verification', value: String(pending), sub: 'Awaiting verification', icon: <PackageCheckIcon className="h-5 w-5 text-emerald-600" /> },
          { label: 'Completed', value: String(completed), sub: 'Accepted or closed', icon: <CheckCircle2 className="h-5 w-5 text-purple-600" /> },
          { label: 'Rejected Qty', value: String(rejected), sub: 'Total rejected units', icon: <AlertOctagon className="h-5 w-5 text-red-600" /> },
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
        {loading ? [...Array(4)].map((_, i) => <Card key={i} className="p-4"><div className="h-16 bg-muted/50 rounded animate-pulse" /></Card>) : stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck className="h-5 w-5" /> Receiving & Putaway Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// Every receipt follows: Supplier Delivery → GRN → Quality Check → Putaway → Available Stock</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> Create <span className="text-cyan-600">Goods Receipt Note (GRN)</span> with line items</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Quality Hold</span> if required — stock held in quarantine</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-purple-600">Putaway Engine</span> suggests storage bin</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-emerald-600">Inventory Ledger</span> auto-posted on acceptance</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function GRNListTab() {
  const [grns, setGrns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await goodsReceiptApi.list({ page: 1, search })
        if (!cancelled) setGrns(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load GRNs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [search])

  // No mock data — uses real API data from goodsReceiptApi.list()
  const typeColor: Record<string, string> = {
    PURCHASE_RECEIPT: 'bg-blue-100 text-blue-800', MANUFACTURING_RECEIPT: 'bg-emerald-100 text-emerald-800',
    SALES_RETURN: 'bg-purple-100 text-purple-800', CUSTOMER_RETURN: 'bg-pink-100 text-pink-800',
    OPENING_STOCK: 'bg-slate-100 text-slate-800', INTER_BRANCH_RECEIPT: 'bg-cyan-100 text-cyan-800',
    WAREHOUSE_TRANSFER_RECEIPT: 'bg-indigo-100 text-indigo-800', STOCK_CORRECTION: 'bg-amber-100 text-amber-800',
    DONATION_RECEIPT: 'bg-teal-100 text-teal-800', SAMPLE_RECEIPT: 'bg-violet-100 text-violet-800',
  }
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', APPROVED: 'bg-blue-600 hover:bg-blue-600', PUTAWAY_IN_PROGRESS: 'bg-amber-500 hover:bg-amber-500', PENDING_APPROVAL: 'bg-orange-500 hover:bg-orange-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REJECTED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Goods Receipt Notes (GRN)</h3>
        <p className="text-xs text-muted-foreground mt-1">10 receipt types. Each GRN tracks ordered vs received vs accepted vs rejected quantities. Quality hold separates receiving from putaway for food safety.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New GRN</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">GRN #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Supplier / Source</th>
            <th className="font-medium">Reference</th><th className="font-medium">Warehouse</th>
            <th className="font-medium text-right">Ordered</th><th className="font-medium text-right">Received</th>
            <th className="font-medium text-right">Accepted</th><th className="font-medium text-right">Rejected</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Quality</th>
            <th className="font-medium">Posted</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {grns.map((g: any) => (
              <tr key={g.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{g.grn_number}</td>
                <td><Badge variant="outline" className="text-xs">GRN</Badge></td>
                <td className="text-xs text-muted-foreground">{g.grn_date ? new Date(g.grn_date).toLocaleDateString('en-IN') : '—'}</td>
                <td className="text-xs">{g.supplier_name || <span className="text-muted-foreground">—</span>}</td>
                <td className="font-mono text-xs">{g.po_number || '—'}</td>
                <td className="text-xs">{g.warehouse_name || '—'}</td>
                <td className="text-right font-mono">{Number(g.total_qty || 0).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono">{Number(g.total_qty || 0).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-emerald-600">{Number(g.total_accepted_qty || 0).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-red-600">{Number(g.total_rejected_qty || 0).toLocaleString('en-IN')}</td>
                <td className="text-right font-mono">₹{Number(g.supplier_invoice_amount || 0).toLocaleString('en-IN')}</td>
                <td><Badge variant="outline" className="text-xs">{g.status === 'ACCEPTED' ? 'APPROVED' : g.status === 'UNDER_INSPECTION' ? 'INSPECTION' : 'N/A'}</Badge></td>
                <td className="text-center">{g.status === 'ACCEPTED' || g.status === 'CLOSED' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <Clock className="h-4 w-4 text-amber-500 mx-auto" />}</td>
                <td><Badge className={(statusColor[g.status] || statusColor['DRAFT']) + ' text-xs'}>{String(g.status || '').replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GRNPutawayTab() {
  const { hasPermission } = useAuthStore()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const { warehouseApi } = await import('@/api')
        const res = await warehouseApi.listPutawayTasks({ page: 1 })
        if (!cancelled) setTasks(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load putaway tasks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING: 'bg-amber-500 hover:bg-amber-500', ASSIGNED: 'bg-cyan-600 hover:bg-cyan-600', CANCELLED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Putaway Tasks</h3>
        <p className="text-xs text-muted-foreground mt-1">Putaway tasks assigned to warehouse operators.</p></div>
        {hasPermission('warehouse:create') && <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Generate Tasks</Button>}
      </div>
      {error && <div className="text-sm text-rose-500 mb-3">{error}</div>}
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={PackageOpen} title="No putaway tasks" description="Putaway tasks will appear here when GRNs are accepted." />
      ) : (
        <div className="space-y-3">
          {tasks.map((t: any) => (
            <div key={t.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-xs">{t.task_number}</p>
                  </div>
                  <p className="font-medium">{t.product_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-xs font-mono">{Number(t.quantity).toLocaleString('en-IN')} units</Badge>
                    <span>{t.warehouse_name}</span>
                    {t.target_bin_code && <><ArrowRight className="h-3 w-3" /><span>{t.target_bin_code}</span></>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={(statusColor[t.status] || statusColor['PENDING']) + ' text-xs'}>{String(t.status || '').replace(/_/g, ' ')}</Badge>
                  {t.assigned_to_name && <p className="text-xs text-muted-foreground mt-1">{t.assigned_to_name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function GRNQualityTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5" /> Quality Hold Management</h3>
        <p className="text-xs text-muted-foreground mt-1">Quality holds are managed in the Quality Inspection module.</p></div>
      </div>
      <EmptyState icon={FlaskConical} title="Quality holds are in Quality module" description="Navigate to Quality Inspection to manage quality holds, inspections, and releases." />
    </Card>
  )
}

function GRNRulesTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Putaway Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">Putaway rules are configured in the Warehouse module.</p></div>
      </div>
      <EmptyState icon={ListChecks} title="Putaway rules are in Warehouse module" description="Navigate to Warehouse to configure putaway rules (FIFO, FEFO, ABC, Zone, Temperature)." />
    </Card>
  )
}

// ─── Stock Issue & Outbound Module (Sprint 14) ──────────
type SITab = 'overview' | 'issues' | 'picking' | 'scrap' | 'damage'
