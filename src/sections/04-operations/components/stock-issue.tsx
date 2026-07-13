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

export function StockIssueModule() {
  const [tab, setTab] = useState<SITab>('overview')
  const tabs: Array<{ key: SITab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Dashboard', icon: <Gauge className="h-4 w-4" /> },
    { key: 'issues', label: 'Stock Issues', icon: <ArrowUpFromLine className="h-4 w-4" /> },
    { key: 'picking', label: 'Picking Tasks', icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: 'scrap', label: 'Scrap Records', icon: <Trash2 className="h-4 w-4" /> },
    { key: 'damage', label: 'Damage Records', icon: <AlertTriangleIcon className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-rose-950 via-red-900 to-orange-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ArrowUpFromLine className="h-7 w-7" /> Stock Issue & Outbound Engine
            </h2>
            <p className="text-rose-200 text-sm max-w-3xl">
              Every movement where inventory leaves stock — production issues, kitchen issues, sales issues,
              samples, scrap, damage, internal consumption, returns to supplier. Barcode-based picking with
              FIFO/FEFO strategies. Automatic ledger posting on issue.
            </p>
          </div>
          <Badge className="bg-rose-500 text-rose-950 hover:bg-rose-500">Sprint 14</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-rose-900 dark:text-rose-200">Outbound Flow (Issue Request → Picking → Issue)</p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Production Order → Issue Request → Warehouse Approval → Picking Task → Barcode Scan → Stock Issue → Production → Consumption → Inventory Ledger. No unauthorized stock withdrawals.
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

      {tab === 'overview' && <SIOverviewTab />}
      {tab === 'issues' && <SIListTab />}
      {tab === 'picking' && <SIPickingTab />}
      {tab === 'scrap' && <SIScrapTab />}
      {tab === 'damage' && <SIDamageTab />}
    </div>
  )
}

function SIOverviewTab() {
  const stats = [
    { label: 'Total Issues', value: '8', sub: '6 ISSUED · 1 PICKING · 1 PENDING', icon: <ArrowUpFromLine className="h-5 w-5 text-blue-600" /> },
    { label: "Today's Issues", value: '2', sub: '285 units · ₹0 (in progress)', icon: <PackageCheckIcon className="h-5 w-5 text-emerald-600" /> },
    { label: 'Pending Approval', value: '1', sub: 'Kitchen issue - Chef Rajesh', icon: <ClipboardCheck className="h-5 w-5 text-amber-600" /> },
    { label: 'Picking In Progress', value: '1', sub: 'PK-2026-00237 · 120/250 picked', icon: <ClipboardCheck className="h-5 w-5 text-purple-600" /> },
    { label: 'Scrap Records', value: '5', sub: '1 pending approval (₹19,320)', icon: <Trash2 className="h-5 w-5 text-red-600" /> },
    { label: 'Damage Records', value: '4', sub: '1 under review', icon: <AlertTriangleIcon className="h-5 w-5 text-orange-600" /> },
    { label: 'Total Scrap Value', value: '₹28,881', sub: 'Across 5 scrap records', icon: <IndianRupee className="h-5 w-5 text-red-600" /> },
    { label: 'Total Damage Value', value: '₹20,006', sub: '₹4,250 insurance claimable', icon: <IndianRupee className="h-5 w-5 text-orange-600" /> },
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5" /> Outbound Issue Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 11 issue types: Production, Kitchen, Sales, Sample, Damage, Scrap, Internal Consumption, Maintenance, Transfer, Return to Supplier, Adjustment</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Stock Request</span> from Production Order / Sales Order / Material Requisition</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Warehouse Approval</span> — prevents unauthorized withdrawals</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-purple-600">Picking Task</span> generated with FIFO/FEFO/Zone strategy</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-cyan-600">Barcode Scan</span> — validates product, batch, location, quantity</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-emerald-600">Stock Issue</span> posted — inventory ledger auto-updated</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-indigo-600">Material Consumption</span> tracked for production costing</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> → <span className="text-pink-600">Finance</span> notified — COGS/WIP accounts updated</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SIListTab() {
  const issues = [
    { id: 'si-001', number: 'SI-2026-00234', type: 'PRODUCTION_ISSUE', date: '2026-07-01', ref: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', destination: 'Production Line 1', status: 'ISSUED', lines: 3, requested: 180, issued: 180, value: 153000, posted: true, picking: true, requestedBy: 'Anita Desai', approvedBy: 'Anita Desai' },
    { id: 'si-002', number: 'SI-2026-00235', type: 'SALES_ISSUE', date: '2026-07-05', ref: 'INV-2026-00892', warehouse: 'Mumbai DC', destination: 'Tata Consumer Products', status: 'ISSUED', lines: 1, requested: 100, issued: 100, value: 54000, posted: true, picking: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-003', number: 'SI-2026-00236', type: 'SALES_ISSUE', date: '2026-07-06', ref: 'INV-2026-00915', warehouse: 'Mumbai DC', destination: 'Reliance Retail', status: 'ISSUED', lines: 1, requested: 48, issued: 48, value: 25920, posted: true, picking: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-004', number: 'SI-2026-00237', type: 'PRODUCTION_ISSUE', date: '2026-07-09', ref: 'MO-2026-0095', warehouse: 'Mumbai Plant Warehouse', destination: 'Production Line 2', status: 'PICKING_IN_PROGRESS', lines: 4, requested: 250, issued: 0, value: 0, posted: false, picking: false, requestedBy: 'Anita Desai', approvedBy: 'Anita Desai' },
    { id: 'si-005', number: 'SI-2026-00238', type: 'KITCHEN_ISSUE', date: '2026-07-09', ref: 'MR-2026-0042', warehouse: 'Mumbai Plant Warehouse', destination: 'Restaurant Kitchen', status: 'PENDING_APPROVAL', lines: 5, requested: 35, issued: 0, value: 0, posted: false, picking: false, requestedBy: 'Chef Rajesh', approvedBy: null },
    { id: 'si-006', number: 'SI-2026-00239', type: 'INTERNAL_CONSUMPTION', date: '2026-07-08', ref: 'MR-2026-0039', warehouse: 'Mumbai Plant Warehouse', destination: 'Maintenance Dept', status: 'ISSUED', lines: 2, requested: 12, issued: 12, value: 3400, posted: true, picking: true, requestedBy: 'Maintenance Team', approvedBy: 'Anita Desai' },
    { id: 'si-007', number: 'SI-2026-00240', type: 'SAMPLE_ISSUE', date: '2026-07-07', ref: 'MR-2026-0036', warehouse: 'Mumbai DC', destination: 'Sales Team (Trade Show)', status: 'ISSUED', lines: 3, requested: 15, issued: 15, value: 8100, posted: true, picking: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-008', number: 'SI-2026-00241', type: 'RETURN_TO_SUPPLIER', date: '2026-07-06', ref: 'PR-2026-0012', warehouse: 'Mumbai Plant Warehouse', destination: 'Sri Balaji Sugar', status: 'ISSUED', lines: 1, requested: 50, issued: 50, value: 2250, posted: true, picking: true, requestedBy: 'Suresh Patil', approvedBy: 'Anita Desai' },
  ]
  const typeColor: Record<string, string> = {
    PRODUCTION_ISSUE: 'bg-blue-100 text-blue-800', KITCHEN_ISSUE: 'bg-orange-100 text-orange-800',
    SALES_ISSUE: 'bg-purple-100 text-purple-800', SAMPLE_ISSUE: 'bg-teal-100 text-teal-800',
    DAMAGE_ISSUE: 'bg-red-100 text-red-800', SCRAP_ISSUE: 'bg-gray-100 text-gray-800',
    INTERNAL_CONSUMPTION: 'bg-amber-100 text-amber-800', MAINTENANCE_ISSUE: 'bg-cyan-100 text-cyan-800',
    TRANSFER_ISSUE: 'bg-indigo-100 text-indigo-800', RETURN_TO_SUPPLIER: 'bg-pink-100 text-pink-800',
    ADJUSTMENT_ISSUE: 'bg-slate-100 text-slate-800',
  }
  const statusColor: Record<string, string> = { ISSUED: 'bg-emerald-600 hover:bg-emerald-600', PICKING_IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REJECTED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Issues</h3>
        <p className="text-xs text-muted-foreground mt-1">11 issue types. Each issue tracks requested vs issued quantities. Picking required before issue. Auto-posts to inventory ledger on completion.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Issue</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Issue #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Reference</th>
            <th className="font-medium">Warehouse</th><th className="font-medium">Destination</th>
            <th className="font-medium text-right">Requested</th><th className="font-medium text-right">Issued</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Posted</th>
            <th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {issues.map(i => (
              <tr key={i.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{i.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[i.type])}>{i.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{i.date}</td>
                <td className="font-mono text-xs">{i.ref}</td>
                <td className="text-xs">{i.warehouse}</td>
                <td className="text-xs">{i.destination}</td>
                <td className="text-right font-mono">{i.requested}</td>
                <td className="text-right font-mono text-emerald-600">{i.issued || '—'}</td>
                <td className="text-right font-mono">{i.value > 0 ? `₹${i.value.toLocaleString('en-IN')}` : '—'}</td>
                <td className="text-center">{i.posted ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <Clock className="h-4 w-4 text-amber-500 mx-auto" />}</td>
                <td><Badge className={statusColor[i.status] + ' text-xs'}>{i.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function SIPickingTab() {
  const tasks = [
    { id: 'pk-001', taskNumber: 'PK-2026-00234', issueNumber: 'SI-2026-00234', strategy: 'FEFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'COMPLETED', totalLines: 3, pickedLines: 3, totalQty: 180, pickedQty: 180, assignedTo: 'Ramesh Yadav', duration: 18, completedAt: '2026-07-01 08:18' },
    { id: 'pk-002', taskNumber: 'PK-2026-00235', issueNumber: 'SI-2026-00235', strategy: 'FEFO', warehouse: 'Mumbai DC', zone: 'Zone C - Cold Storage', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 100, pickedQty: 100, assignedTo: 'Ramesh Yadav', duration: 8, completedAt: '2026-07-05 13:50' },
    { id: 'pk-003', taskNumber: 'PK-2026-00236', issueNumber: 'SI-2026-00236', strategy: 'FEFO', warehouse: 'Mumbai DC', zone: 'Zone C - Cold Storage', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 48, pickedQty: 48, assignedTo: 'Ramesh Yadav', duration: 6, completedAt: '2026-07-06 11:20' },
    { id: 'pk-004', taskNumber: 'PK-2026-00237', issueNumber: 'SI-2026-00237', strategy: 'FIFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'IN_PROGRESS', totalLines: 4, pickedLines: 2, totalQty: 250, pickedQty: 120, assignedTo: 'Sandeep Kumar', duration: null, completedAt: null },
    { id: 'pk-005', taskNumber: 'PK-2026-00240', issueNumber: 'SI-2026-00240', strategy: 'FEFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 50, pickedQty: 50, assignedTo: 'Ramesh Yadav', duration: 5, completedAt: '2026-07-06 15:30' },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING: 'bg-amber-500 hover:bg-amber-500', ASSIGNED: 'bg-cyan-600 hover:bg-cyan-600' }
  const strategyColor: Record<string, string> = { FIFO: 'bg-blue-100 text-blue-800', FEFO: 'bg-emerald-100 text-emerald-800', NEAREST_BIN: 'bg-amber-100 text-amber-800', WAVE: 'bg-purple-100 text-purple-800', ZONE: 'bg-cyan-100 text-cyan-800', PRIORITY: 'bg-pink-100 text-pink-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Picking Tasks</h3>
        <p className="text-xs text-muted-foreground mt-1">6 strategies: FIFO, FEFO, Nearest Bin, Wave, Zone, Priority. Barcode-verified picking with short-pick tracking.</p></div>
      </div>
      <div className="space-y-3">
        {tasks.map(t => {
          const progress = t.totalQty > 0 ? Math.round((t.pickedQty / t.totalQty) * 100) : 0
          return (
            <div key={t.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-xs">{t.taskNumber}</p>
                    <Badge variant="outline" className="text-xs">{t.issueNumber}</Badge>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', strategyColor[t.strategy])}>{t.strategy}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.warehouse} · {t.zone}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Assigned to: {t.assignedTo}{t.duration && ` · ${t.duration} min`}</p>
                </div>
                <Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono">{t.pickedLines}/{t.totalLines} lines</span>
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div className={cn('h-full', t.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-blue-600')} style={{ width: `${progress}%` }} />
                </div>
                <span className="font-mono font-medium">{t.pickedQty}/{t.totalQty} ({progress}%)</span>
              </div>
              {t.status === 'IN_PROGRESS' && (
                <Button size="sm" variant="outline" className="h-7 text-xs mt-2"><CheckCircle2 className="mr-1 h-3 w-3" /> Complete Picking</Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SIScrapTab() {
  const scraps = [
    { id: 'scrap-001', number: 'SCRAP-2026-0012', type: 'PRODUCTION_SCRAP', date: '2026-07-01', product: 'Kaju Katli 500g', batch: 'KK-2607-01', warehouse: 'Mumbai Plant Warehouse', qty: 8, value: 2800, reason: 'Shape deformation during molding', disposal: 'DESTROYED', status: 'POSTED', createdBy: 'Anita Desai' },
    { id: 'scrap-002', number: 'SCRAP-2026-0013', type: 'EXPIRED_PRODUCTS', date: '2026-07-08', product: 'Kaju Katli 500g', batch: 'KK-2606-05', warehouse: 'Mumbai Plant Warehouse', qty: 56, value: 19320, reason: 'Past expiry date - recall batch', disposal: 'DESTROYED', status: 'PENDING_APPROVAL', createdBy: 'Anita Desai' },
    { id: 'scrap-003', number: 'SCRAP-2026-0014', type: 'WAREHOUSE_DAMAGE', date: '2026-07-07', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', warehouse: 'Mumbai DC', qty: 12, value: 636, reason: 'Rat damage in storage bin B3', disposal: 'DESTROYED', status: 'POSTED', createdBy: 'Ramesh Yadav' },
    { id: 'scrap-004', number: 'SCRAP-2026-0015', type: 'QUALITY_REJECTION', date: '2026-07-09', product: 'Cashew Nuts (Raw)', batch: null, warehouse: 'Mumbai Plant Warehouse', qty: 5, value: 4250, reason: 'Damaged in transit - packaging crushed', disposal: 'RETURNED_TO_SUPPLIER', status: 'APPROVED', createdBy: 'Suresh Patil' },
    { id: 'scrap-005', number: 'SCRAP-2026-0016', type: 'PRODUCTION_SCRAP', date: '2026-07-05', product: 'Soan Cake 1kg', batch: 'SC-2606-04', warehouse: 'Mumbai Plant Warehouse', qty: 3, value: 1875, reason: 'Sugar crystallization - quality fail', disposal: 'RECYCLED', status: 'POSTED', createdBy: 'Anita Desai' },
  ]
  const typeColor: Record<string, string> = { PRODUCTION_SCRAP: 'bg-blue-100 text-blue-800', WAREHOUSE_DAMAGE: 'bg-amber-100 text-amber-800', TRANSPORT_DAMAGE: 'bg-orange-100 text-orange-800', EXPIRED_PRODUCTS: 'bg-red-100 text-red-800', CUSTOMER_DAMAGE_RETURNS: 'bg-purple-100 text-purple-800', QUALITY_REJECTION: 'bg-pink-100 text-pink-800' }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', APPROVED: 'bg-blue-600 hover:bg-blue-600', DISPOSED: 'bg-cyan-600 hover:bg-cyan-600' }
  const disposalColor: Record<string, string> = { DESTROYED: 'text-red-600', RECYCLED: 'text-emerald-600', SOLD_AS_SCRAP: 'text-amber-600', DONATED: 'text-blue-600', RETURNED_TO_SUPPLIER: 'text-purple-600', ANIMAL_FEED: 'text-teal-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Trash2 className="h-5 w-5" /> Scrap Records</h3>
        <p className="text-xs text-muted-foreground mt-1">6 scrap types. Disposal methods: Destroyed, Recycled, Sold as Scrap, Donated, Returned to Supplier, Animal Feed. Requires approval before posting to inventory.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Scrap</Button>
      </div>
      <div className="space-y-3">
        {scraps.map(s => (
          <div key={s.id} className={cn('border rounded-lg p-3', s.status === 'PENDING_APPROVAL' && 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20')}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{s.number}</p>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[s.type])}>{s.type.replace(/_/g, ' ')}</span>
                </div>
                <p className="font-medium">{s.product}{s.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {s.batch}</span>}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span>Qty: <span className="font-mono font-semibold">{s.qty}</span></span>
                  <span>Value: <span className="font-mono font-semibold text-red-600">₹{s.value.toLocaleString('en-IN')}</span></span>
                  <span>Disposal: <span className={cn('font-semibold', disposalColor[s.disposal])}>{s.disposal.replace(/_/g, ' ')}</span></span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[s.status] + ' text-xs'}>{s.status}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{s.date}</p>
                <p className="text-xs text-muted-foreground">By: {s.createdBy}</p>
              </div>
            </div>
            {s.status === 'PENDING_APPROVAL' && (
              <Button size="sm" variant="default" className="h-7 text-xs mt-1 bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" />Approve & Post</Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function SIDamageTab() {
  const damages = [
    { id: 'dmg-001', number: 'DMG-2026-0012', type: 'TRANSPORT_DAMAGE', severity: 'MODERATE', date: '2026-07-09', product: 'Cashew Nuts (Raw)', batch: null, warehouse: 'Mumbai Plant Warehouse', qty: 5, value: 4250, reason: 'Packaging crushed during transit', disposition: 'RETURN_TO_SUPPLIER', status: 'POSTED', insurance: true, claimAmount: 4250, reportedBy: 'Suresh Patil' },
    { id: 'dmg-002', number: 'DMG-2026-0013', type: 'STORAGE_DAMAGE', severity: 'MINOR', date: '2026-07-07', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', warehouse: 'Mumbai DC', qty: 12, value: 636, reason: 'Rat damage in storage bin B3', disposition: 'SCRAP', status: 'POSTED', insurance: false, reportedBy: 'Ramesh Yadav' },
    { id: 'dmg-003', number: 'DMG-2026-0014', type: 'HANDLING_DAMAGE', severity: 'MINOR', date: '2026-07-08', product: 'Kaju Katli 500g', batch: 'KK-2607-01', warehouse: 'Mumbai DC', qty: 4, value: 2160, reason: 'Box dropped during putaway', disposition: 'REPACK', status: 'APPROVED', insurance: false, reportedBy: 'Sandeep Kumar' },
    { id: 'dmg-004', number: 'DMG-2026-0015', type: 'CUSTOMER_RETURN_DAMAGE', severity: 'MODERATE', date: '2026-07-07', product: 'Kaju Katli 500g', batch: 'KK-2606-05', warehouse: 'Mumbai DC', qty: 24, value: 12960, reason: 'Customer returned - taste deviation', disposition: 'PENDING_REVIEW', status: 'UNDER_REVIEW', insurance: false, reportedBy: 'Vikram Iyer' },
  ]
  const typeColor: Record<string, string> = { WAREHOUSE_DAMAGE: 'bg-amber-100 text-amber-800', TRANSPORT_DAMAGE: 'bg-orange-100 text-orange-800', HANDLING_DAMAGE: 'bg-blue-100 text-blue-800', STORAGE_DAMAGE: 'bg-purple-100 text-purple-800', CUSTOMER_RETURN_DAMAGE: 'bg-pink-100 text-pink-800', PRODUCTION_DAMAGE: 'bg-cyan-100 text-cyan-800' }
  const severityColor: Record<string, string> = { MINOR: 'text-amber-600', MODERATE: 'text-orange-600', SEVERE: 'text-red-600', TOTAL_LOSS: 'text-red-700' }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', APPROVED: 'bg-blue-600 hover:bg-blue-600', UNDER_REVIEW: 'bg-amber-500 hover:bg-amber-500', REPORTED: 'bg-orange-500 hover:bg-orange-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><AlertTriangleIcon className="h-5 w-5" /> Damage Records</h3>
        <p className="text-xs text-muted-foreground mt-1">6 damage types · 4 severity levels. Disposition: Repairable, Scrap, Donate, Return to Supplier, Write Off, Repack. Insurance claim tracking.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Report Damage</Button>
      </div>
      <div className="space-y-3">
        {damages.map(d => (
          <div key={d.id} className={cn('border rounded-lg p-3', (d.status === 'UNDER_REVIEW' || d.status === 'REPORTED') && 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20')}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{d.number}</p>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[d.type])}>{d.type.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className={cn('text-xs font-semibold', severityColor[d.severity])}>{d.severity}</Badge>
                </div>
                <p className="font-medium">{d.product}{d.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {d.batch}</span>}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.reason}</p>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span>Qty: <span className="font-mono font-semibold">{d.qty}</span></span>
                  <span>Value: <span className="font-mono font-semibold text-red-600">₹{d.value.toLocaleString('en-IN')}</span></span>
                  <span>Disposition: <span className="font-semibold">{d.disposition.replace(/_/g, ' ')}</span></span>
                  {d.insurance && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">Insurance: ₹{d.claimAmount?.toLocaleString('en-IN')}</Badge>}
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[d.status] + ' text-xs'}>{d.status.replace(/_/g, ' ')}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{d.date}</p>
                <p className="text-xs text-muted-foreground">By: {d.reportedBy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Stock Transfer Module (Sprint 15) ──────────────────
type TransferTab = 'overview' | 'transfers' | 'transit' | 'bin'
