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
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function StockTransferModule() {
  const [tab, setTab] = useState<TransferTab>('overview')
  const tabs: Array<{ key: TransferTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Dashboard', icon: <Gauge className="h-4 w-4" /> },
    { key: 'transfers', label: 'Transfers', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { key: 'transit', label: 'In Transit', icon: <Truck className="h-4 w-4" /> },
    { key: 'bin', label: 'Bin Transfers', icon: <MapPinIcon className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ArrowLeftRight className="h-7 w-7" /> Stock Transfer & In-Transit Engine
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              Move inventory across warehouses, branches, stores, restaurants, bins, and locations.
              11 transfer types with full in-transit tracking, barcode verification, and receiving confirmation.
            </p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 15</Badge>
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
      {tab === 'overview' && <TransferOverviewTab />}
      {tab === 'transfers' && <TransferListTab />}
      {tab === 'transit' && <TransferTransitTab />}
      {tab === 'bin' && <TransferBinTab />}
    </div>
  )
}

function TransferOverviewTab() {
  const stats = [
    { label: 'Total Transfers', value: '8', sub: '3 COMPLETED · 2 IN_TRANSIT', icon: <ArrowLeftRight className="h-5 w-5 text-blue-600" /> },
    { label: 'In Transit', value: '2', sub: '5 items · ₹1.04L value', icon: <Truck className="h-5 w-5 text-amber-600" /> },
    { label: 'Pending Approval', value: '1', sub: 'Restaurant transfer request', icon: <ClipboardCheck className="h-5 w-5 text-orange-600" /> },
    { label: 'Dispatched (not received)', value: '1', sub: 'Cold storage transfer', icon: <PackageOpen className="h-5 w-5 text-purple-600" /> },
    { label: 'Partial Receipt', value: '1', sub: '2 units short (return)', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> },
    { label: 'Bin Transfers', value: '4', sub: '2 PENDING · 2 COMPLETED', icon: <MapPinIcon className="h-5 w-5 text-teal-600" /> },
    { label: 'In-Transit Value', value: '₹1.04L', sub: 'Across 5 items in transit', icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
    { label: 'Completed Today', value: '0', sub: 'No completions today yet', icon: <CheckCircle2 className="h-5 w-5 text-slate-600" /> },
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowLeftRight className="h-5 w-5" /> Transfer Workflow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 11 transfer types: WH→WH, WH→Store, WH→Restaurant, Plant→WH, Plant→Store, Branch→Branch, Bin→Bin, Loc→Loc, Cold Storage, Transit Vehicle, Return</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Transfer Request</span> — source and destination specified</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Approval</span> — warehouse manager approves</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-purple-600">Picking & Dispatch</span> — stock removed from source, loaded on vehicle</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-cyan-600">In Transit</span> — inventory tracked in transit (not available at either location)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-indigo-600">Receiving</span> — destination scans and verifies delivery</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-emerald-600">Completed</span> — inventory available at destination, ledger updated</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function TransferListTab() {
  const transfers = [
    { id: 'st-001', number: 'ST-2026-0042', type: 'PLANT_TO_WAREHOUSE', date: '2026-07-03', source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'COMPLETED', lines: 1, requested: 358, dispatched: 358, received: 358, value: 125300, requestedBy: 'Anita Desai' },
    { id: 'st-002', number: 'ST-2026-0043', type: 'WAREHOUSE_TO_STORE', date: '2026-07-06', source: 'Mumbai DC', dest: 'Mumbai Retail Store 01', vehicle: 'MH-04-TR-1192', carrier: 'Blue Dart', status: 'COMPLETED', lines: 2, requested: 72, dispatched: 72, received: 72, value: 38880, requestedBy: 'Vikram Iyer' },
    { id: 'st-003', number: 'ST-2026-0044', type: 'WAREHOUSE_TO_WAREHOUSE', date: '2026-07-08', source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'IN_TRANSIT', lines: 3, requested: 200, dispatched: 200, received: 0, value: 70000, requestedBy: 'Anita Desai' },
    { id: 'st-004', number: 'ST-2026-0045', type: 'BRANCH_TO_BRANCH', date: '2026-07-09', source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: null, carrier: null, status: 'APPROVED', lines: 2, requested: 150, dispatched: 0, received: 0, value: 52500, requestedBy: 'Suresh Patil' },
    { id: 'st-005', number: 'ST-2026-0046', type: 'WAREHOUSE_TO_RESTAURANT', date: '2026-07-09', source: 'Mumbai Plant Warehouse', dest: 'Sudhamrit Restaurant Mumbai', vehicle: null, carrier: null, status: 'SUBMITTED', lines: 5, requested: 45, dispatched: 0, received: 0, value: 0, requestedBy: 'Chef Rajesh' },
    { id: 'st-006', number: 'ST-2026-0047', type: 'RETURN_TRANSFER', date: '2026-07-07', source: 'Mumbai Retail Store 01', dest: 'Mumbai DC', vehicle: 'MH-04-TR-1192', carrier: 'Blue Dart', status: 'PARTIALLY_RECEIVED', lines: 1, requested: 24, dispatched: 24, received: 22, value: 12960, requestedBy: 'Vikram Iyer' },
    { id: 'st-007', number: 'ST-2026-0048', type: 'COLD_STORAGE_TRANSFER', date: '2026-07-09', source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'DISPATCHED', lines: 2, requested: 100, dispatched: 100, received: 0, value: 35000, requestedBy: 'Anita Desai' },
    { id: 'st-008', number: 'ST-2026-0049', type: 'PLANT_TO_STORE', date: '2026-07-05', source: 'Mumbai Plant Warehouse', dest: 'Mumbai Retail Store 01', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'COMPLETED', lines: 1, requested: 48, dispatched: 48, received: 48, value: 25920, requestedBy: 'Vikram Iyer' },
  ]
  const typeColor: Record<string, string> = { PLANT_TO_WAREHOUSE: 'bg-blue-100 text-blue-800', WAREHOUSE_TO_STORE: 'bg-purple-100 text-purple-800', WAREHOUSE_TO_RESTAURANT: 'bg-orange-100 text-orange-800', WAREHOUSE_TO_WAREHOUSE: 'bg-cyan-100 text-cyan-800', BRANCH_TO_BRANCH: 'bg-indigo-100 text-indigo-800', RETURN_TRANSFER: 'bg-pink-100 text-pink-800', COLD_STORAGE_TRANSFER: 'bg-teal-100 text-teal-800', PLANT_TO_STORE: 'bg-emerald-100 text-emerald-800' }
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_TRANSIT: 'bg-amber-500 hover:bg-amber-500', DISPATCHED: 'bg-blue-600 hover:bg-blue-600', APPROVED: 'bg-cyan-600 hover:bg-cyan-600', SUBMITTED: 'bg-orange-500 hover:bg-orange-500', PARTIALLY_RECEIVED: 'bg-red-500 hover:bg-red-500', DRAFT: 'bg-slate-500 hover:bg-slate-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Transfers</h3>
        <p className="text-xs text-muted-foreground mt-1">11 transfer types. Source ≠ Destination enforced. Workflow: Request → Approve → Dispatch → Transit → Receive → Complete.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Transfer</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Transfer #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Source</th>
            <th className="font-medium">Destination</th><th className="font-medium text-right">Req</th>
            <th className="font-medium text-right">Disp</th><th className="font-medium text-right">Recv</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{t.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[t.type] || 'bg-slate-100 text-slate-800')}>{t.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{t.date}</td>
                <td className="text-xs">{t.source}</td>
                <td className="text-xs">{t.dest}</td>
                <td className="text-right font-mono">{t.requested}</td>
                <td className="text-right font-mono text-amber-600">{t.dispatched || '—'}</td>
                <td className="text-right font-mono text-emerald-600">{t.received || '—'}</td>
                <td className="text-right font-mono">{t.value > 0 ? `₹${t.value.toLocaleString('en-IN')}` : '—'}</td>
                <td><Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TransferTransitTab() {
  const items = [
    { id: 'iit-001', transferNumber: 'ST-2026-0044', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 100, source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-08 14:00', eta: '2026-07-09 12:00', status: 'IN_TRANSIT', value: 35000 },
    { id: 'iit-002', transferNumber: 'ST-2026-0044', product: 'Soan Cake 1kg', batch: 'SC-2606-04', qty: 50, source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-08 14:00', eta: '2026-07-09 12:00', status: 'IN_TRANSIT', value: 31250 },
    { id: 'iit-003', transferNumber: 'ST-2026-0044', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 50, source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-08 14:00', eta: '2026-07-09 12:00', status: 'IN_TRANSIT', value: 2650 },
    { id: 'iit-004', transferNumber: 'ST-2026-0048', product: 'Gulab Jamun 1kg', batch: 'GJ-2607-01', qty: 60, source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-09 08:00', eta: '2026-07-09 10:00', status: 'IN_TRANSIT', value: 18240 },
    { id: 'iit-005', transferNumber: 'ST-2026-0048', product: 'Kaju Katli 250g', batch: null, qty: 40, source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-09 08:00', eta: '2026-07-09 10:00', status: 'IN_TRANSIT', value: 16800 },
  ]
  const statusColor: Record<string, string> = { IN_TRANSIT: 'bg-amber-500 hover:bg-amber-500', DELIVERED: 'bg-emerald-600 hover:bg-emerald-600', DELAYED: 'bg-red-600 hover:bg-red-600', LOST: 'bg-red-700 hover:bg-red-700' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Truck className="h-5 w-5" /> In-Transit Inventory</h3>
        <p className="text-xs text-muted-foreground mt-1">Stock removed from source but not yet received at destination. Tracked separately — not available at either location. 5 items in transit worth ₹1.04L.</p></div>
      </div>
      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="border rounded-lg p-3 border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{i.transferNumber}</p>
                  <Badge variant="outline" className="text-xs font-mono">{i.qty} units</Badge>
                  {i.batch && <Badge variant="outline" className="text-xs">Batch: {i.batch}</Badge>}
                </div>
                <p className="font-medium">{i.product}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">{i.source}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium text-foreground">{i.dest}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Vehicle: {i.vehicle} · Driver: {i.driver} · Carrier: {i.carrier}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dispatched: {i.dispatchedAt} · ETA: {i.eta}</p>
              </div>
              <div className="text-right">
                <Badge className={statusColor[i.status] + ' text-xs'}>{i.status.replace(/_/g, ' ')}</Badge>
                <p className="text-xs font-mono font-semibold text-amber-600 mt-1">₹{i.value.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function TransferBinTab() {
  const bins = [
    { id: 'bt-001', number: 'BT-2026-0023', date: '2026-07-08', warehouse: 'Mumbai Plant Warehouse', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 100, fromZone: 'Receiving Area', fromBin: 'RCV-01', toZone: 'Zone C - Cold Storage', toBin: 'C2-03', reason: 'REORGANIZATION', status: 'COMPLETED', createdBy: 'Ramesh Yadav' },
    { id: 'bt-002', number: 'BT-2026-0024', date: '2026-07-08', warehouse: 'Mumbai Plant Warehouse', product: 'Sugar (Raw)', batch: null, qty: 50, fromZone: 'Zone A', fromBin: 'A2-01', toZone: 'Zone A', toBin: 'A2-03', reason: 'CONSOLIDATION', status: 'COMPLETED', createdBy: 'Ramesh Yadav' },
    { id: 'bt-003', number: 'BT-2026-0025', date: '2026-07-09', warehouse: 'Mumbai DC', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 200, fromZone: 'Zone B', fromBin: 'B1-02', toZone: 'Zone B', toBin: 'B3-05', reason: 'CAPACITY_OPTIMIZATION', status: 'PENDING', createdBy: 'Sandeep Kumar' },
    { id: 'bt-004', number: 'BT-2026-0026', date: '2026-07-09', warehouse: 'Mumbai Plant Warehouse', product: 'Ghee (Raw)', batch: null, qty: 10, fromZone: 'Zone C', fromBin: 'C1-01', toZone: 'Zone C', toBin: 'C1-04', reason: 'TEMP_CONTROL', status: 'PENDING', createdBy: 'Suresh Patil' },
  ]
  const reasonColor: Record<string, string> = { REORGANIZATION: 'bg-blue-100 text-blue-800', CONSOLIDATION: 'bg-purple-100 text-purple-800', CAPACITY_OPTIMIZATION: 'bg-amber-100 text-amber-800', CYCLE_COUNT_PREP: 'bg-teal-100 text-teal-800', TEMP_CONTROL: 'bg-cyan-100 text-cyan-800', MANUAL: 'bg-slate-100 text-slate-800' }
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', PENDING: 'bg-amber-500 hover:bg-amber-500', CANCELLED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><MapPinIcon className="h-5 w-5" /> Bin & Location Transfers</h3>
        <p className="text-xs text-muted-foreground mt-1">Move stock within the same warehouse: rack→rack, bin→bin, shelf→shelf. No warehouse change. 6 reasons: Reorganization, Consolidation, Capacity Optimization, Cycle Count Prep, Temp Control, Manual.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Bin Transfer</Button>
      </div>
      <div className="space-y-3">
        {bins.map(b => (
          <div key={b.id} className="border rounded-lg p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-mono text-xs">{b.number}</p>
                <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', reasonColor[b.reason])}>{b.reason.replace(/_/g, ' ')}</span>
              </div>
              <p className="font-medium text-sm">{b.product} <span className="text-muted-foreground ml-2 text-xs">{b.batch && `Batch: ${b.batch}`}</span></p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Badge variant="outline" className="text-xs font-mono">{b.qty}</Badge>
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{b.fromZone} / {b.fromBin}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{b.toZone} / {b.toBin}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{b.warehouse} · {b.date} · By: {b.createdBy}</p>
            </div>
            <Badge className={statusColor[b.status] + ' text-xs flex-shrink-0'}>{b.status}</Badge>
            {b.status === 'PENDING' && <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0"><CheckCircle2 className="mr-1 h-3 w-3" /> Complete</Button>}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Adjustment & Reconciliation Module (Sprint 16) ──────
type AdjustmentTab = 'overview' | 'adjustments' | 'damage' | 'rootcauses'
