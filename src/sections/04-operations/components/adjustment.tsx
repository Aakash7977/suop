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

export function AdjustmentModule() {
  const [tab, setTab] = useState<AdjustmentTab>('overview')
  const tabs: Array<{ key: AdjustmentTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'adjustments', label: 'Adjustments', icon: <ShieldAlert className="h-4 w-4" /> },
    { key: 'damage', label: 'Damage', icon: <AlertTriangleIcon className="h-4 w-4" /> },
    { key: 'rootcauses', label: 'Root Causes', icon: <ListChecks className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-rose-950 via-red-900 to-orange-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldAlert className="h-7 w-7" /> Adjustment & Reconciliation Engine
            </h2>
            <p className="text-rose-200 text-sm max-w-3xl">
              Inventory adjustments, damage reports, expiry disposal, and root cause analysis.
              13 adjustment types, 10 reasons, severity-based damage handling, expiry blocking,
              and corrective action tracking with recurrence detection.
            </p>
          </div>
          <Badge className="bg-rose-500 text-rose-950 hover:bg-rose-500">Sprint 16</Badge>
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
      {tab === 'overview' && <AdjustmentOverviewTab />}
      {tab === 'adjustments' && <AdjustmentListTab />}
      {tab === 'damage' && <AdjustmentDamageTab />}
      {tab === 'rootcauses' && <AdjustmentRootCauseTab />}
    </div>
  )
}

function AdjustmentOverviewTab() {
  const stats = [
    { label: 'Total Adjustments', value: '8', sub: '2 POSTED · 3 PENDING', icon: <ShieldAlert className="h-5 w-5 text-rose-600" /> },
    { label: 'Pending Approval', value: '3', sub: 'STOCK_LOSS, SHRINKAGE, PRODUCTION_VARIANCE', icon: <Clock className="h-5 w-5 text-amber-600" /> },
    { label: 'Damage Reports', value: '4', sub: '1 SEVERE · 1 TOTAL_LOSS', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> },
    { label: 'Expiry Adjustments', value: '3', sub: '1 EXPIRED · 1 NEAR_EXPIRY · 1 BLOCKED', icon: <Clock className="h-5 w-5 text-orange-600" /> },
    { label: 'Write-Off Value', value: '₹69,236', sub: 'Damage + Expiry + Posted write-offs', icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
    { label: 'Root Causes', value: '5', sub: '2 OPEN · 2 IN_PROGRESS · 1 COMPLETED', icon: <ListChecks className="h-5 w-5 text-purple-600" /> },
    { label: 'Recurring Issues', value: '2', sub: 'STORAGE + PRODUCTION', icon: <AlertTriangleIcon className="h-5 w-5 text-pink-600" /> },
    { label: 'Reasons Configured', value: '10', sub: 'INCREASE / DECREASE / NEUTRAL', icon: <Tag className="h-5 w-5 text-blue-600" /> },
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Adjustment & Reconciliation Workflow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 13 adjustment types: STOCK_GAIN, STOCK_LOSS, DAMAGE, EXPIRY, SHRINKAGE, THEFT, PRODUCTION_VARIANCE, PACKING_VARIANCE, SUPPLIER_SHORTAGE, CUSTOMER_RETURN_CORRECTION, BARCODE_CORRECTION, OPENING_BALANCE_CORRECTION, FINANCIAL_RECONCILIATION</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Identify Discrepancy</span> — cycle count, damage event, expiry scan, or system reconciliation</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Capture Evidence</span> — photo required for DAMAGE / EXPIRY / THEFT; reason code mandatory</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-orange-600">Submit for Approval</span> — routed by reason approvalLevel (SUPERVISOR / WAREHOUSE_MANAGER / FINANCE / MANAGEMENT)</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-cyan-600">Approve / Reject</span> — write-offs require finance + management sign-off</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-indigo-600">Post to Inventory</span> — ledger updated, system_qty → physical_qty reconciled</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-emerald-600">Post to Finance (GL)</span> — write-off value journalized to loss / shrinkage account</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> → <span className="text-purple-600">Root Cause Analysis</span> — corrective + preventive actions assigned with due date and recurrence flag</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function AdjustmentListTab() {
  const adjustments = [
    { id: 'adj-001', number: 'ADJ-2026-0101', date: '2026-07-09', type: 'STOCK_GAIN', warehouse: 'Mumbai DC', reason: 'FOUND', lines: 2, systemQty: 100, physicalQty: 118, diff: 18, value: 5400, status: 'POSTED', posted: true, writeOff: false, photo: true, requestedBy: 'Ramesh Yadav' },
    { id: 'adj-002', number: 'ADJ-2026-0102', date: '2026-07-09', type: 'STOCK_LOSS', warehouse: 'Mumbai Plant Warehouse', reason: 'COUNTING_ERROR', lines: 1, systemQty: 60, physicalQty: 54, diff: -6, value: -1800, status: 'PENDING_APPROVAL', posted: false, writeOff: false, photo: false, requestedBy: 'Sandeep Kumar' },
    { id: 'adj-003', number: 'ADJ-2026-0103', date: '2026-07-08', type: 'DAMAGE', warehouse: 'Mumbai DC', reason: 'DAMAGE', lines: 1, systemQty: 60, physicalQty: 48, diff: -12, value: -7200, status: 'APPROVED', posted: false, writeOff: true, photo: true, requestedBy: 'Suresh Patil' },
    { id: 'adj-004', number: 'ADJ-2026-0104', date: '2026-07-07', type: 'EXPIRY', warehouse: 'Mumbai Retail Store 01', reason: 'EXPIRY', lines: 1, systemQty: 24, physicalQty: 0, diff: -24, value: -4800, status: 'POSTED', posted: true, writeOff: true, photo: true, requestedBy: 'Vikram Iyer' },
    { id: 'adj-005', number: 'ADJ-2026-0105', date: '2026-07-09', type: 'SHRINKAGE', warehouse: 'Mumbai Retail Store 01', reason: 'LOST', lines: 3, systemQty: 200, physicalQty: 191, diff: -9, value: -2700, status: 'SUBMITTED', posted: false, writeOff: false, photo: false, requestedBy: 'Vikram Iyer' },
    { id: 'adj-006', number: 'ADJ-2026-0106', date: '2026-07-06', type: 'THEFT', warehouse: 'Mumbai DC', reason: 'THEFT', lines: 1, systemQty: 20, physicalQty: 16, diff: -4, value: -16000, status: 'REJECTED', posted: false, writeOff: false, photo: true, requestedBy: 'Suresh Patil' },
    { id: 'adj-007', number: 'ADJ-2026-0107', date: '2026-07-09', type: 'PRODUCTION_VARIANCE', warehouse: 'Mumbai Plant Warehouse', reason: 'PRODUCTION_LOSS', lines: 2, systemQty: 500, physicalQty: 485, diff: -15, value: -9750, status: 'PENDING_APPROVAL', posted: false, writeOff: false, photo: true, requestedBy: 'Chef Rajesh' },
    { id: 'adj-008', number: 'ADJ-2026-0108', date: '2026-07-09', type: 'BARCODE_CORRECTION', warehouse: 'Mumbai DC', reason: 'WRONG_ENTRY', lines: 1, systemQty: 0, physicalQty: 0, diff: 0, value: 0, status: 'APPROVED', posted: false, writeOff: false, photo: false, requestedBy: 'Sandeep Kumar' },
  ]
  const typeColor: Record<string, string> = {
    STOCK_GAIN: 'bg-emerald-100 text-emerald-800',
    STOCK_LOSS: 'bg-red-100 text-red-800',
    DAMAGE: 'bg-orange-100 text-orange-800',
    EXPIRY: 'bg-amber-100 text-amber-800',
    SHRINKAGE: 'bg-pink-100 text-pink-800',
    THEFT: 'bg-rose-100 text-rose-800',
    PRODUCTION_VARIANCE: 'bg-purple-100 text-purple-800',
    PACKING_VARIANCE: 'bg-violet-100 text-violet-800',
    SUPPLIER_SHORTAGE: 'bg-cyan-100 text-cyan-800',
    CUSTOMER_RETURN_CORRECTION: 'bg-teal-100 text-teal-800',
    BARCODE_CORRECTION: 'bg-blue-100 text-blue-800',
    OPENING_BALANCE_CORRECTION: 'bg-slate-100 text-slate-800',
    FINANCIAL_RECONCILIATION: 'bg-indigo-100 text-indigo-800',
  }
  const statusColor: Record<string, string> = {
    POSTED: 'bg-emerald-600 hover:bg-emerald-600',
    APPROVED: 'bg-cyan-600 hover:bg-cyan-600',
    PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500',
    SUBMITTED: 'bg-orange-500 hover:bg-orange-500',
    REJECTED: 'bg-red-600 hover:bg-red-600',
    DRAFT: 'bg-slate-500 hover:bg-slate-500',
    CANCELLED: 'bg-slate-600 hover:bg-slate-600',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Inventory Adjustments</h3>
        <p className="text-xs text-muted-foreground mt-1">13 adjustment types · 7 statuses. system_qty vs physical_qty → difference posted to inventory + GL after approval. Write-offs require FINANCE/MANAGEMENT approval.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Adjustment</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Adjustment #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Warehouse</th>
            <th className="font-medium">Reason</th><th className="font-medium text-right">System</th>
            <th className="font-medium text-right">Physical</th><th className="font-medium text-right">Diff</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Status</th><th className="font-medium">Flags</th>
          </tr></thead>
          <tbody>
            {adjustments.map(a => (
              <tr key={a.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{a.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[a.type] || 'bg-slate-100 text-slate-800')}>{a.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{a.date}</td>
                <td className="text-xs">{a.warehouse}</td>
                <td className="text-xs"><Badge variant="outline" className="text-xs">{a.reason.replace(/_/g, ' ')}</Badge></td>
                <td className="text-right font-mono text-slate-600">{a.systemQty}</td>
                <td className="text-right font-mono text-slate-900 font-medium">{a.physicalQty}</td>
                <td className={cn('text-right font-mono font-bold', a.diff > 0 ? 'text-emerald-600' : a.diff < 0 ? 'text-red-600' : 'text-slate-400')}>{a.diff > 0 ? '+' : ''}{a.diff}</td>
                <td className={cn('text-right font-mono', a.value < 0 ? 'text-red-600' : a.value > 0 ? 'text-emerald-600' : 'text-slate-400')}>{a.value !== 0 ? `₹${Math.abs(a.value).toLocaleString('en-IN')}` : '—'}</td>
                <td><Badge className={statusColor[a.status] + ' text-xs'}>{a.status.replace(/_/g, ' ')}</Badge></td>
                <td className="text-xs">
                  <div className="flex items-center gap-1">
                    {a.posted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    {a.writeOff && <Trash2 className="h-3.5 w-3.5 text-red-600" />}
                    {a.photo && <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AdjustmentDamageTab() {
  const reports = [
    { id: 'dmg-001', number: 'DR-2026-0901', date: '2026-07-08', type: 'WAREHOUSE_DAMAGE', severity: 'SEVERE', product: 'Kaju Katli 500g', batch: 'KK-2607-04', qty: 12, unitCost: 600, value: 7200, warehouse: 'Mumbai DC', photos: 4, disposition: 'WRITE_OFF', status: 'POSTED', reportedBy: 'Suresh Patil', adjNumber: 'ADJ-2026-0103', desc: '12 units crushed during forklift handling — outer carton damaged, inner packs contaminated.' },
    { id: 'dmg-002', number: 'DR-2026-0902', date: '2026-07-09', type: 'TRANSPORT_DAMAGE', severity: 'MODERATE', product: 'Soan Cake 1kg', batch: 'SC-2606-04', qty: 6, unitCost: 625, value: 3750, warehouse: 'Mumbai DC', photos: 2, disposition: 'REPACK', status: 'UNDER_REVIEW', reportedBy: 'Ramesh Yadav', adjNumber: null, desc: '6 units outer box dented during truck unload — contents intact, repackable.' },
    { id: 'dmg-003', number: 'DR-2026-0903', date: '2026-07-09', type: 'STORAGE_DAMAGE', severity: 'MINOR', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 18, unitCost: 53, value: 954, warehouse: 'Mumbai DC', photos: 1, disposition: 'REPAIRABLE', status: 'REPORTED', reportedBy: 'Sandeep Kumar', adjNumber: null, desc: '18 packets with minor seal damage from cold storage humidity — sealable via rework.' },
    { id: 'dmg-004', number: 'DR-2026-0904', date: '2026-07-07', type: 'PRODUCTION_DAMAGE', severity: 'TOTAL_LOSS', product: 'Gulab Jamun 1kg', batch: 'GJ-2607-01', qty: 24, unitCost: 304, value: 7296, warehouse: 'Mumbai Plant Warehouse', photos: 6, disposition: 'SCRAP', status: 'DISPOSED', reportedBy: 'Chef Rajesh', adjNumber: 'ADJ-2026-0107', desc: 'Full batch burned due to thermostat malfunction — disposed to animal feed vendor.' },
  ]
  const typeColor: Record<string, string> = {
    FOOD_DAMAGE: 'bg-amber-100 text-amber-800',
    TRANSPORT_DAMAGE: 'bg-blue-100 text-blue-800',
    WAREHOUSE_DAMAGE: 'bg-purple-100 text-purple-800',
    PRODUCTION_DAMAGE: 'bg-orange-100 text-orange-800',
    STORAGE_DAMAGE: 'bg-cyan-100 text-cyan-800',
    HANDLING_DAMAGE: 'bg-pink-100 text-pink-800',
  }
  const severityColor: Record<string, string> = {
    MINOR: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    MODERATE: 'bg-amber-100 text-amber-800 border-amber-300',
    SEVERE: 'bg-orange-100 text-orange-800 border-orange-300',
    TOTAL_LOSS: 'bg-red-100 text-red-800 border-red-300',
  }
  const dispositionColor: Record<string, string> = {
    PENDING_REVIEW: 'bg-slate-100 text-slate-800',
    SCRAP: 'bg-red-100 text-red-800',
    REPAIRABLE: 'bg-emerald-100 text-emerald-800',
    DONATE: 'bg-teal-100 text-teal-800',
    RETURN_TO_SUPPLIER: 'bg-blue-100 text-blue-800',
    WRITE_OFF: 'bg-rose-100 text-rose-800',
    REPACK: 'bg-purple-100 text-purple-800',
  }
  const statusColor: Record<string, string> = {
    REPORTED: 'bg-orange-500 hover:bg-orange-500',
    UNDER_REVIEW: 'bg-amber-500 hover:bg-amber-500',
    APPROVED: 'bg-cyan-600 hover:bg-cyan-600',
    POSTED: 'bg-emerald-600 hover:bg-emerald-600',
    DISPOSED: 'bg-slate-600 hover:bg-slate-600',
    CANCELLED: 'bg-red-600 hover:bg-red-600',
  }
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-semibold flex items-center gap-2"><AlertTriangleIcon className="h-5 w-5" /> Damage Reports</h3>
          <p className="text-xs text-muted-foreground mt-1">6 damage types · 4 severity levels · 7 dispositions. Photo evidence required. Linked to inventory adjustment on posting.</p></div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Damage Report</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map(r => (
            <div key={r.id} className={cn('border rounded-lg p-4', severityColor[r.severity])}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-xs">{r.number}</p>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[r.type])}>{r.type.replace(/_/g, ' ')}</span>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold border', severityColor[r.severity])}>{r.severity.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="font-medium">{r.product}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Batch: {r.batch} · {r.warehouse} · {r.date}</p>
                </div>
                <Badge className={statusColor[r.status] + ' text-xs flex-shrink-0'}>{r.status.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="bg-background/50 rounded p-2"><p className="text-muted-foreground">Damaged Qty</p><p className="font-mono font-bold">{r.qty}</p></div>
                <div className="bg-background/50 rounded p-2"><p className="text-muted-foreground">Unit Cost</p><p className="font-mono">₹{r.unitCost.toLocaleString('en-IN')}</p></div>
                <div className="bg-background/50 rounded p-2"><p className="text-muted-foreground">Total Value</p><p className="font-mono font-bold text-red-600">₹{r.value.toLocaleString('en-IN')}</p></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('inline-block px-2 py-0.5 rounded font-medium', dispositionColor[r.disposition])}>{r.disposition.replace(/_/g, ' ')}</span>
                  {r.adjNumber && <Badge variant="outline" className="text-xs font-mono">{r.adjNumber}</Badge>}
                </div>
                <span className="flex items-center gap-1 text-muted-foreground"><ShieldAlert className="h-3 w-3" />{r.photos} photo{r.photos !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Reported by: {r.reportedBy}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AdjustmentRootCauseTab() {
  const causes = [
    { id: 'rc-001', adjNumber: 'ADJ-2026-0103', category: 'STORAGE', detail: 'Pallets stacked too high in Zone B causing top-tier product crush damage during forklift retrieval.', affectedQty: 12, affectedValue: 7200, correctiveAction: 'Reduce max stacking height from 5 to 3 pallets. Install racking guards on top tier.', preventiveAction: 'Add rack height sensors + weekly safety audit.', owner: 'Anita Desai', dueDate: '2026-07-20', status: 'IN_PROGRESS', recurring: true, recurrenceCount: 3 },
    { id: 'rc-002', adjNumber: 'ADJ-2026-0102', category: 'HUMAN_ERROR', detail: 'Cycle count clerk missed 6 units in dark corner of Zone A — physical count discrepancy.', affectedQty: 6, affectedValue: 1800, correctiveAction: 'Re-train cycle count staff on full-sweep methodology. Add task lighting to Zone A corners.', preventiveAction: 'Add lighting + monthly count audit on Zone A.', owner: 'Sandeep Kumar', dueDate: '2026-07-15', status: 'OPEN', recurring: false, recurrenceCount: 1 },
    { id: 'rc-003', adjNumber: 'ADJ-2026-0108', category: 'SYSTEM_ERROR', detail: 'Barcode master mismatch — GS1 GTIN for Kaju Katli 500g not synced from PIM to scanner database, causing wrong scans during putaway.', affectedQty: 0, affectedValue: 0, correctiveAction: 'Force PIM → scanner sync job. Add validation rule to fail putaway if barcode not recognized.', preventiveAction: 'Add nightly PIM sync verification alert.', owner: 'Ramesh Yadav', dueDate: '2026-07-12', status: 'COMPLETED', recurring: false, recurrenceCount: 0 },
    { id: 'rc-004', adjNumber: 'ADJ-2026-0107', category: 'PRODUCTION', detail: 'Thermostat on cooker #3 malfunctioned, temperature exceeded BOM threshold by 12°C causing batch burn and yield drop.', affectedQty: 15, affectedValue: 9750, correctiveAction: 'Replace thermostat, recalibrate cooker #3, add 15-min temperature logging interval.', preventiveAction: 'Quarterly thermostat calibration schedule.', owner: 'Chef Rajesh', dueDate: '2026-07-13', status: 'OPEN', recurring: true, recurrenceCount: 2 },
    { id: 'rc-005', adjNumber: 'ADJ-2026-0104', category: 'RECEIVING', detail: 'GRN inspector did not verify expiry date on incoming batch — expired stock accepted into Mumbai Retail Store 01 inventory.', affectedQty: 24, affectedValue: 4800, correctiveAction: 'Add mandatory expiry date check to GRN workflow with photo evidence.', preventiveAction: 'Update GRN checklist, train 4 receiving staff on near-expiry rejection policy.', owner: 'Vikram Iyer', dueDate: '2026-07-18', status: 'IN_PROGRESS', recurring: false, recurrenceCount: 1 },
  ]
  const categoryColor: Record<string, string> = {
    RECEIVING: 'bg-blue-100 text-blue-800',
    STORAGE: 'bg-amber-100 text-amber-800',
    PRODUCTION: 'bg-orange-100 text-orange-800',
    PACKING: 'bg-purple-100 text-purple-800',
    PICKING: 'bg-cyan-100 text-cyan-800',
    DISPATCH: 'bg-teal-100 text-teal-800',
    TRANSPORT: 'bg-indigo-100 text-indigo-800',
    RETAIL: 'bg-pink-100 text-pink-800',
    RESTAURANT: 'bg-rose-100 text-rose-800',
    SYSTEM_ERROR: 'bg-red-100 text-red-800',
    HUMAN_ERROR: 'bg-violet-100 text-violet-800',
  }
  const statusColor: Record<string, string> = {
    OPEN: 'bg-orange-500 hover:bg-orange-500',
    IN_PROGRESS: 'bg-amber-500 hover:bg-amber-500',
    COMPLETED: 'bg-emerald-600 hover:bg-emerald-600',
    OVERDUE: 'bg-red-600 hover:bg-red-600',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Root Cause Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">11 categories. Each adjustment with value impact triggers RCA. Corrective + preventive actions tracked with owner, due date, and recurrence flag.</p></div>
      </div>
      <div className="space-y-4">
        {causes.map(c => (
          <div key={c.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold', categoryColor[c.category])}>{c.category.replace(/_/g, ' ')}</span>
                <Badge variant="outline" className="text-xs font-mono">{c.adjNumber}</Badge>
                {c.recurring && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 text-xs"><AlertTriangleIcon className="mr-1 h-3 w-3" />Recurring ({c.recurrenceCount}x)</Badge>}
              </div>
              <Badge className={statusColor[c.status] + ' text-xs'}>{c.status.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-sm mb-3">{c.detail}</p>
            <div className="grid gap-3 md:grid-cols-2 mb-3">
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-3 border border-amber-200 dark:border-amber-900">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><AlertTriangleIcon className="h-3 w-3" /> Corrective Action</p>
                <p className="text-xs text-foreground">{c.correctiveAction}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded p-3 border border-emerald-200 dark:border-emerald-900">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Preventive Action</p>
                <p className="text-xs text-foreground">{c.preventiveAction}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span>Owner: <span className="font-medium text-foreground">{c.owner}</span></span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due: {c.dueDate}</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />Impact: ₹{c.affectedValue.toLocaleString('en-IN')} ({c.affectedQty} units)</span>
              </div>
              {c.status !== 'COMPLETED' && <Button size="sm" variant="outline" className="h-7 text-xs"><CheckCircle2 className="mr-1 h-3 w-3" /> Mark Complete</Button>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Reservation & Allocation Module (Sprint 17) ────────
type ReservationTab = 'overview' | 'reservations' | 'rules' | 'availability'
