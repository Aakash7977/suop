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
  const stats = [
    { label: 'Total GRNs', value: '8', sub: '5 COMPLETED · 1 PENDING', icon: <Truck className="h-5 w-5 text-blue-600" /> },
    { label: "Today's Receipts", value: '3', sub: '5,393 units · ₹3.63L value', icon: <PackageCheckIcon className="h-5 w-5 text-emerald-600" /> },
    { label: 'Pending Putaway', value: '3', sub: 'Awaiting storage assignment', icon: <PackageOpen className="h-5 w-5 text-amber-600" /> },
    { label: 'Quality Holds (Active)', value: '2', sub: 'Ghee lab test + Customer return', icon: <FlaskConical className="h-5 w-5 text-red-600" /> },
    { label: 'Rejected Quantity', value: '5', sub: 'Cashew damaged in transit', icon: <AlertOctagon className="h-5 w-5 text-orange-600" /> },
    { label: 'Putaway Tasks', value: '6', sub: '4 COMPLETED · 1 IN PROGRESS · 1 PENDING', icon: <ClipboardCheck className="h-5 w-5 text-purple-600" /> },
    { label: 'Putaway Rules', value: '5', sub: 'FIFO, FEFO, ABC, ZONE, TEMPERATURE', icon: <ListChecks className="h-5 w-5 text-teal-600" /> },
    { label: 'Inventory Posted', value: '5/8', sub: 'Auto-posted to ledger on approval', icon: <BookOpen className="h-5 w-5 text-indigo-600" /> },
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck className="h-5 w-5" /> Receiving & Putaway Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 10 receipt types: Purchase, Manufacturing, Sales Return, Customer Return, Opening Stock, Inter-Branch, Warehouse Transfer, Stock Correction, Donation, Sample</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Supplier Delivery</span> arrives at Receiving Dock (vehicle, driver, gate entry)</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → Create <span className="text-cyan-600">Goods Receipt Note (GRN)</span> with line items (ordered vs received vs accepted vs rejected)</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-amber-600">Quality Hold</span> (if required) — stock held in quarantine until inspection</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-purple-600">Putaway Engine</span> suggests storage bin based on rules (FIFO/FEFO/ABC/Zone/Temperature)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → Warehouse operator completes <span className="text-indigo-600">Putaway Task</span> — stock moved to storage bin</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-emerald-600">Inventory Ledger</span> auto-posted — stock becomes AVAILABLE</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> → <span className="text-pink-600">Finance</span> notified — GRNI account credited, Raw Material account debited</p>
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

  const _grns = [
    { id: 'gr-001', grnNumber: 'GRN-2026-00142', type: 'PURCHASE_RECEIPT', date: '2026-07-08', supplier: 'Konkan Cashew Processors', ref: 'PO-2026-0142', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-12-AB-4521', status: 'COMPLETED', qualityHold: true, qualityStatus: 'APPROVED', lines: 3, ordered: 380, received: 380, accepted: 380, rejected: 0, value: 114000, posted: true, putaway: true, receivedBy: 'Suresh Patil' },
    { id: 'gr-002', grnNumber: 'GRN-2026-00143', type: 'PURCHASE_RECEIPT', date: '2026-07-08', supplier: 'Sri Balaji Sugar', ref: 'PO-2026-0156', warehouse: 'Mumbai Plant Warehouse', vehicle: 'AP-09-CD-8832', status: 'COMPLETED', qualityHold: false, qualityStatus: 'APPROVED', lines: 1, ordered: 500, received: 500, accepted: 500, rejected: 0, value: 25000, posted: true, putaway: true, receivedBy: 'Suresh Patil' },
    { id: 'gr-003', grnNumber: 'GRN-2026-00144', type: 'MANUFACTURING_RECEIPT', date: '2026-07-01', supplier: null, ref: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', vehicle: null, status: 'COMPLETED', qualityHold: true, qualityStatus: 'APPROVED', lines: 1, ordered: 500, received: 500, accepted: 500, rejected: 0, value: 175000, posted: true, putaway: true, receivedBy: 'Anita Desai' },
    { id: 'gr-004', grnNumber: 'GRN-2026-00145', type: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Amul', ref: 'PO-2026-0178', warehouse: 'Mumbai Plant Warehouse', vehicle: 'GJ-01-EF-1192', status: 'APPROVED', qualityHold: true, qualityStatus: 'INSPECTION', lines: 2, ordered: 100, received: 98, accepted: 0, rejected: 0, value: 52000, posted: false, putaway: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-005', grnNumber: 'GRN-2026-00146', type: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Mumbai Packaging Solutions', ref: 'PO-2026-0203', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-04-GH-7745', status: 'PUTAWAY_IN_PROGRESS', qualityHold: false, qualityStatus: 'APPROVED', lines: 1, ordered: 5000, received: 5000, accepted: 5000, rejected: 0, value: 60000, posted: true, putaway: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-006', grnNumber: 'GRN-2026-00147', type: 'SALES_RETURN', date: '2026-07-07', supplier: null, ref: 'INV-2026-00789', warehouse: 'Mumbai DC', vehicle: null, status: 'APPROVED', qualityHold: true, qualityStatus: 'PENDING', lines: 1, ordered: 0, received: 24, accepted: 0, rejected: 0, value: 12960, posted: false, putaway: false, receivedBy: 'Vikram Iyer' },
    { id: 'gr-007', grnNumber: 'GRN-2026-00148', type: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Konkan Cashew Processors', ref: 'PO-2026-0210', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-12-AB-4521', status: 'PENDING_APPROVAL', qualityHold: true, qualityStatus: 'PENDING', lines: 2, ordered: 300, received: 295, accepted: 0, rejected: 5, value: 250750, posted: false, putaway: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-008', grnNumber: 'GRN-2026-00149', type: 'OPENING_STOCK', date: '2026-01-01', supplier: null, ref: 'OS-2026-001', warehouse: 'Mumbai Plant Warehouse', vehicle: null, status: 'COMPLETED', qualityHold: false, qualityStatus: 'APPROVED', lines: 12, ordered: 0, received: 2400, accepted: 2400, rejected: 0, value: 840000, posted: true, putaway: true, receivedBy: 'System' },
  ]
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
            {grns.map(g => (
              <tr key={g.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{g.grnNumber}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[g.type])}>{g.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{g.date}</td>
                <td className="text-xs">{g.supplier || <span className="text-muted-foreground">—</span>}</td>
                <td className="font-mono text-xs">{g.ref}</td>
                <td className="text-xs">{g.warehouse}</td>
                <td className="text-right font-mono">{g.ordered || '—'}</td>
                <td className="text-right font-mono">{g.received}</td>
                <td className="text-right font-mono text-emerald-600">{g.accepted || '—'}</td>
                <td className="text-right font-mono text-red-600">{g.rejected || '—'}</td>
                <td className="text-right font-mono">₹{g.value.toLocaleString('en-IN')}</td>
                <td>{g.qualityHold ? <Badge variant="outline" className="text-xs">{g.qualityStatus}</Badge> : <Badge variant="outline" className="text-xs text-emerald-600">N/A</Badge>}</td>
                <td className="text-center">{g.posted ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <Clock className="h-4 w-4 text-amber-500 mx-auto" />}</td>
                <td><Badge className={statusColor[g.status] + ' text-xs'}>{g.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GRNPutawayTab() {
  const tasks = [
    { id: 'pt-001', taskNumber: 'PT-2026-00142', grnNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw)', batch: null, qty: 200, from: 'Receiving Dock 1', to: 'Zone A - Rack A1, Bin 03', zone: 'Zone A - Raw Materials', strategy: 'FIFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 11:30' },
    { id: 'pt-002', taskNumber: 'PT-2026-00143', grnNumber: 'GRN-2026-00142', product: 'Sugar (Raw)', batch: null, qty: 150, from: 'Receiving Dock 1', to: 'Zone A - Rack A2, Bin 01', zone: 'Zone A - Raw Materials', strategy: 'FIFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 11:45' },
    { id: 'pt-003', taskNumber: 'PT-2026-00144', grnNumber: 'GRN-2026-00142', product: 'Ghee (Raw)', batch: null, qty: 30, from: 'Receiving Dock 1', to: 'Zone C - Cold Storage, Rack C1', zone: 'Zone C - Cold Storage', strategy: 'FEFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 12:00' },
    { id: 'pt-004', taskNumber: 'PT-2026-00145', grnNumber: 'GRN-2026-00144', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 500, from: 'Production Line 1', to: 'Zone C - Cold Storage, Rack C2', zone: 'Zone C - Cold Storage', strategy: 'FEFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-01 17:00' },
    { id: 'pt-005', taskNumber: 'PT-2026-00146', grnNumber: 'GRN-2026-00146', product: 'Packaging Boxes', batch: null, qty: 5000, from: 'Receiving Dock 2', to: 'Zone B - Rack B1, Bin 01-05', zone: 'Zone B - Packaging Bulk', strategy: 'ZONE', status: 'IN_PROGRESS', assignedTo: 'Sandeep Kumar', completedAt: null },
    { id: 'pt-006', taskNumber: 'PT-2026-00147', grnNumber: 'GRN-2026-00145', product: 'Ghee (Raw)', batch: null, qty: 98, from: 'Receiving Dock 1', to: 'PENDING - Quality Hold', zone: null, strategy: 'FEFO', status: 'PENDING', assignedTo: null, completedAt: null },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING: 'bg-amber-500 hover:bg-amber-500', ASSIGNED: 'bg-cyan-600 hover:bg-cyan-600', CANCELLED: 'bg-red-600 hover:bg-red-600' }
  const strategyColor: Record<string, string> = { FIFO: 'bg-blue-100 text-blue-800', FEFO: 'bg-emerald-100 text-emerald-800', ABC: 'bg-purple-100 text-purple-800', ZONE: 'bg-amber-100 text-amber-800', TEMPERATURE: 'bg-cyan-100 text-cyan-800', MANUAL: 'bg-slate-100 text-slate-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Putaway Tasks</h3>
        <p className="text-xs text-muted-foreground mt-1">Intelligent putaway engine suggests storage bins based on product type, temperature zone, and strategy (FIFO/FEFO/ABC/Zone). Operators complete tasks by moving stock to assigned bins.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Generate Tasks</Button>
      </div>
      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{t.taskNumber}</p>
                  <Badge variant="outline" className="text-xs">{t.grnNumber}</Badge>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', strategyColor[t.strategy])}>{t.strategy}</span>
                </div>
                <p className="font-medium">{t.product}{t.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {t.batch}</span>}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs font-mono">{t.qty} units</Badge>
                  <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{t.from}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{t.to}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge>
                {t.assignedTo && <p className="text-xs text-muted-foreground mt-1">{t.assignedTo}</p>}
                {t.completedAt && <p className="text-xs text-muted-foreground">{t.completedAt}</p>}
              </div>
            </div>
            {t.status !== 'COMPLETED' && t.status !== 'PENDING' && (
              <Button size="sm" variant="outline" className="h-7 text-xs mt-1"><CheckCircle2 className="mr-1 h-3 w-3" /> Complete Putaway</Button>
            )}
            {t.status === 'PENDING' && t.to.includes('Quality Hold') && (
              <p className="text-xs text-amber-600 mt-1">⚠ Blocked by quality hold — cannot putaway until inspection complete</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GRNQualityTab() {
  const holds = [
    { id: 'qh-001', holdNumber: 'QH-2026-0012', grnNumber: 'GRN-2026-00145', product: 'Ghee (Raw)', batch: null, qtyHeld: 98, reason: 'QUALITY_CHECK', inspectionType: 'LAB_TEST', result: 'PENDING', status: 'ACTIVE', resolution: 'PENDING', createdBy: 'Suresh Patil', notes: 'Sample sent to external lab for adulteration test' },
    { id: 'qh-002', holdNumber: 'QH-2026-0013', grnNumber: 'GRN-2026-00147', product: 'Customer Return Kaju Katli', batch: 'KK-2606-05', qtyHeld: 24, reason: 'SUPPLIER_ISSUE', inspectionType: 'VISUAL', result: 'PENDING', status: 'ACTIVE', resolution: 'PENDING', createdBy: 'Vikram Iyer', notes: 'Customer returned - taste deviation complaint. Awaiting investigation.' },
    { id: 'qh-003', holdNumber: 'QH-2026-0011', grnNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw)', batch: null, qtyHeld: 200, reason: 'QUALITY_CHECK', inspectionType: 'SAMPLE_TEST', result: 'PASSED', status: 'RESOLVED', resolution: 'RELEASED', releasedQty: 200, rejectedQty: 0, createdBy: 'Suresh Patil', resolvedBy: 'Anita Desai', notes: 'Sample tested - quality approved. Released for production.' },
    { id: 'qh-004', holdNumber: 'QH-2026-0010', grnNumber: 'GRN-2026-00144', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qtyHeld: 500, reason: 'QUALITY_CHECK', inspectionType: 'VISUAL', result: 'PASSED', status: 'RESOLVED', resolution: 'RELEASED', releasedQty: 500, rejectedQty: 0, createdBy: 'Anita Desai', resolvedBy: 'Anita Desai', notes: 'Production batch quality check passed. Grade A.' },
    { id: 'qh-005', holdNumber: 'QH-2026-0014', grnNumber: 'GRN-2026-00147', product: 'Cashew Nuts (Raw)', batch: null, qtyHeld: 5, reason: 'DAMAGE_SUSPECTED', inspectionType: 'VISUAL', result: 'FAILED', status: 'RESOLVED', resolution: 'REJECTED', releasedQty: 0, rejectedQty: 5, createdBy: 'Suresh Patil', resolvedBy: 'Anita Desai', notes: '5 units damaged in transit - packaging crushed. Rejected and scrapped.' },
  ]
  const reasonColor: Record<string, string> = { QUALITY_CHECK: 'bg-blue-100 text-blue-800', SUPPLIER_ISSUE: 'bg-amber-100 text-amber-800', DAMAGE_SUSPECTED: 'bg-orange-100 text-orange-800', EXPIRY_CHECK: 'bg-red-100 text-red-800', SPEC_VERIFICATION: 'bg-purple-100 text-purple-800', RANDOM_SAMPLE: 'bg-teal-100 text-teal-800' }
  const resultColor: Record<string, string> = { PENDING: 'text-amber-600', PASSED: 'text-emerald-600', FAILED: 'text-red-600', CONDITIONAL_PASS: 'text-blue-600' }
  const statusColor: Record<string, string> = { ACTIVE: 'bg-red-600 hover:bg-red-600', RESOLVED: 'bg-emerald-600 hover:bg-emerald-600', CANCELLED: 'bg-gray-500 hover:bg-gray-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5" /> Quality Hold Management</h3>
        <p className="text-xs text-muted-foreground mt-1">6 hold reasons: Quality Check, Supplier Issue, Damage Suspected, Expiry Check, Spec Verification, Random Sample. Stock held in quarantine until released, rejected, or scrapped.</p></div>
      </div>
      <div className="space-y-3">
        {holds.map(h => (
          <div key={h.id} className={cn('border rounded-lg p-3', h.status === 'ACTIVE' && 'border-red-200 bg-red-50/50 dark:bg-red-950/20')}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{h.holdNumber}</p>
                  <Badge variant="outline" className="text-xs">{h.grnNumber}</Badge>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', reasonColor[h.reason])}>{h.reason.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className="text-xs">{h.inspectionType.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-medium">{h.product}{h.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {h.batch}</span>}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Quantity held: <span className="font-mono font-semibold text-foreground">{h.qtyHeld}</span> units</p>
                {h.notes && <p className="text-xs text-muted-foreground mt-1">{h.notes}</p>}
              </div>
              <div className="text-right">
                <Badge className={statusColor[h.status] + ' text-xs'}>{h.status}</Badge>
                <p className="text-xs mt-1">Result: <span className={cn('font-semibold', resultColor[h.result || 'PENDING'])}>{h.result || 'PENDING'}</span></p>
                <p className="text-xs text-muted-foreground">{h.resolution.replace(/_/g, ' ')}</p>
              </div>
            </div>
            {h.status === 'RESOLVED' && (
              <div className="flex items-center gap-3 text-xs pt-2 border-t">
                <span>Released: <span className="font-mono font-semibold text-emerald-600">{h.releasedQty || 0}</span></span>
                <span>Rejected: <span className="font-mono font-semibold text-red-600">{h.rejectedQty || 0}</span></span>
                <span className="text-muted-foreground">By: {h.resolvedBy}</span>
              </div>
            )}
            {h.status === 'ACTIVE' && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" />Release</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-300">Reject</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Partial Release</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GRNRulesTab() {
  const rules = [
    { code: 'PA-RAW-FIFO', name: 'Raw Materials → FIFO Zone A', strategy: 'FIFO', productType: 'RAW_MATERIAL', targetZone: 'Zone A - Raw Materials', tempZone: 'AMBIENT', priority: 50, status: 'ACTIVE' },
    { code: 'PA-FG-FEFO', name: 'Finished Goods → FEFO Cold Storage', strategy: 'FEFO', productType: 'FINISHED_GOOD', targetZone: 'Zone C - Cold Storage', tempZone: 'REFRIGERATED', priority: 30, status: 'ACTIVE' },
    { code: 'PA-PKG-ZONE', name: 'Packaging → Zone B Bulk', strategy: 'ZONE', productType: 'PACKAGING', targetZone: 'Zone B - Packaging Bulk', tempZone: 'AMBIENT', priority: 100, status: 'ACTIVE' },
    { code: 'PA-ABC-HIGH', name: 'High-Value Items → Secure Zone', strategy: 'ABC', productType: 'FINISHED_GOOD', targetZone: 'Zone D - Secure', tempZone: 'AMBIENT', priority: 20, status: 'ACTIVE' },
    { code: 'PA-FROZEN', name: 'Frozen Items → Freezer Zone', strategy: 'TEMPERATURE', productType: 'FINISHED_GOOD', targetZone: 'Zone E - Freezer', tempZone: 'FROZEN', priority: 10, status: 'ACTIVE' },
  ]
  const strategyColor: Record<string, string> = { FIFO: 'bg-blue-100 text-blue-800', FEFO: 'bg-emerald-100 text-emerald-800', ABC: 'bg-purple-100 text-purple-800', ZONE: 'bg-amber-100 text-amber-800', TEMPERATURE: 'bg-cyan-100 text-cyan-800', MANUAL: 'bg-slate-100 text-slate-800' }
  const tempColor: Record<string, string> = { AMBIENT: 'text-amber-600', REFRIGERATED: 'text-blue-600', FROZEN: 'text-cyan-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Putaway Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">5 strategies: FIFO (First In First Out), FEFO (First Expiry First Out), ABC (High-value secure), ZONE (by product type), TEMPERATURE (cold chain). Rules matched by priority — lower number = higher priority.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
      </div>
      <div className="space-y-3">
        {rules.map(r => (
          <div key={r.code} className="border rounded-lg p-3 flex items-center gap-3">
            <span className={cn('inline-block px-3 py-1 rounded text-xs font-bold flex-shrink-0', strategyColor[r.strategy])}>{r.strategy}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                <p className="font-medium">{r.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Product type: <span className="font-medium text-foreground">{r.productType.replace(/_/g, ' ')}</span></span>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{r.targetZone}</span>
                <span>·</span>
                <span className={cn('font-medium', tempColor[r.tempZone])}>{r.tempZone}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground">Priority</p>
              <p className="font-mono font-bold text-lg">{r.priority}</p>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs flex-shrink-0">{r.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Stock Issue & Outbound Module (Sprint 14) ──────────
type SITab = 'overview' | 'issues' | 'picking' | 'scrap' | 'damage'
