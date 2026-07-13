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

export function BatchExpiryModule() {
  const [tab, setTab] = useState<BatchTab>('overview')
  const tabs: Array<{ key: BatchTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'batches', label: 'Batches', icon: <Boxes className="h-4 w-4" /> },
    { key: 'alerts', label: 'Expiry Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
    { key: 'recalls', label: 'Recalls', icon: <PackageOpen className="h-4 w-4" /> },
    { key: 'genealogy', label: 'Genealogy', icon: <GitBranch className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-rose-950 via-orange-900 to-amber-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Calendar className="h-7 w-7" /> Batch &amp; Expiry Management Engine
            </h2>
            <p className="text-amber-200 text-sm max-w-3xl">
              End-to-end batch lifecycle, shelf-life rules, FEFO prioritization, expiry monitoring,
              product recall engine, and forward/backward batch genealogy traceability for food
              safety and FSSAI compliance.
            </p>
          </div>
          <Badge className="bg-rose-500 text-rose-950 hover:bg-rose-500">Sprint 19</Badge>
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
      {tab === 'overview' && <BatchOverviewTab />}
      {tab === 'batches' && <BatchMastersTab />}
      {tab === 'alerts' && <ExpiryAlertsTab />}
      {tab === 'recalls' && <ProductRecallsTab />}
      {tab === 'genealogy' && <BatchGenealogyTab />}
    </div>
  )
}

function BatchOverviewTab() {
  const stats = [
    { label: 'Total Batches', value: '10', sub: '5 FINISHED · 3 RAW · 1 PKG · 1 EXP', icon: <Boxes className="h-5 w-5 text-blue-600" /> },
    { label: 'Available', value: '5', sub: 'BM-001 · 002 · 003 · 006 · 008', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
    { label: 'Blocked / Quarantined', value: '2', sub: 'BM-005 BLOCKED · BM-007 QUARANTINED', icon: <ShieldAlert className="h-5 w-5 text-amber-600" /> },
    { label: 'Expired', value: '1', sub: 'BM-004 GJ-2606-12 — past expiry', icon: <AlertOctagon className="h-5 w-5 text-red-600" /> },
    { label: 'Near Expiry Alerts', value: '3', sub: '1 NEAR_EXPIRY · 2 CRITICAL · 1 EXPIRED', icon: <AlertTriangle className="h-5 w-5 text-orange-600" /> },
    { label: 'Active Recalls', value: '2', sub: 'RC-001 RETURNS · RC-003 INVESTIGATING', icon: <PackageOpen className="h-5 w-5 text-rose-600" /> },
    { label: 'Shelf-Life Rules', value: '5', sub: 'Sweets 30d · Namkeen 45d · Dairy 7d', icon: <ListChecks className="h-5 w-5 text-cyan-600" /> },
    { label: 'Genealogy Links', value: '5', sub: 'Raw → Finished batch traceability', icon: <GitBranch className="h-5 w-5 text-purple-600" /> },
  ]
  const flowSteps = [
    { n: 1, label: 'Batch Creation', detail: 'Production order / GRN creates batch master with manufacturingDate + expiryDate from shelf-life rule', color: 'text-blue-600' },
    { n: 2, label: 'Quality Inspection', detail: 'QC tests sample — assigns quality grade A/B/C/REJECT and quality status PENDING/PASSED/FAILED/QUARANTINE', color: 'text-cyan-600' },
    { n: 3, label: 'Status: AVAILABLE', detail: 'Batch released to stock — FEFO priority calculated based on days-to-expiry (lower = picked first)', color: 'text-emerald-600' },
    { n: 4, label: 'Shelf-Life Monitoring', detail: 'Expiry engine scans daily — generates alerts at 30/15/7/3/0 day thresholds per shelf-life rule', color: 'text-amber-600' },
    { n: 5, label: 'Action Triggers', detail: 'FEFO_PRIORITIZE · DISCOUNT · DONATE · DESTROY · RETURN_TO_SUPPLIER — for NEAR_EXPIRY / CRITICAL / EXPIRED', color: 'text-orange-600' },
    { n: 6, label: 'Recall Engine', detail: 'Customer complaint / quality issue triggers recall (FULL/PARTIAL/WITHDRAWAL) — affected batches traced via genealogy', color: 'text-rose-600' },
    { n: 7, label: 'Genealogy Trace', detail: 'Forward trace: Batch → Customers (recall impact). Backward trace: Batch → Raw Materials (root cause analysis)', color: 'text-purple-600' },
    { n: 8, label: 'Disposition & Audit', detail: 'Recalled stock disposition (RETURNED/DISPOSED/WRITTEN_OFF) + full audit trail in batch_history', color: 'text-indigo-600' },
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> Food Safety &amp; Batch Lifecycle Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 7 batch types: RAW_MATERIAL, PACKAGING_MATERIAL, SEMI_FINISHED, FINISHED_GOODS, RETURNED_GOODS, QUALITY_HOLD, TRIAL_BATCH, REWORK_BATCH</p>
          <p className="text-muted-foreground">// 11 batch statuses: PLANNED, CREATED, RELEASED, AVAILABLE, RESERVED, BLOCKED, QUARANTINED, EXPIRED, RECALLED, CONSUMED, CLOSED</p>
          <div className="space-y-1 pt-2">
            {flowSteps.map(s => (
              <p key={s.n}>
                <Badge variant="outline" className="font-mono">{s.n}</Badge> → <span className={s.color}>{s.label}</span> — <span className="text-muted-foreground">{s.detail}</span>
              </p>
            ))}
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><GitBranch className="h-5 w-5" /> FEFO Strategy — First Expiry First Out</h3>
        <p className="text-sm text-muted-foreground mb-3">
          FEFO (First Expiry First Out) is the primary stock allocation strategy for perishable food products.
          Each batch is assigned a <span className="font-semibold text-foreground">fefoPriority</span> score based on
          days-to-expiry — <span className="font-semibold text-foreground">lower priority = picked first</span>.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">Priority 1–5 · EXPIRED / CRITICAL</p>
            <p className="text-xs text-muted-foreground mt-1">Past expiry or &lt;7 days remaining — auto-flag EXPIRED or BLOCK stock, action immediately</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">Priority 6–20 · NEAR_EXPIRY</p>
            <p className="text-xs text-muted-foreground mt-1">7–15 days remaining — FEFO prioritize in picklist, offer discount or donate</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Priority 21–50 · APPROACHING</p>
            <p className="text-xs text-muted-foreground mt-1">15–30 days remaining — monitor closely, surface in dashboards &amp; alerts</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Priority 51+ · HEALTHY</p>
            <p className="text-xs text-muted-foreground mt-1">&gt;30 days remaining — normal stock rotation, no action required</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function BatchMastersTab() {
  const batches = [
    { id: 'bm-001', batchNumber: 'KK-2607-01', productName: 'Kaju Katli 500g', batchType: 'FINISHED_GOODS', manufacturingDate: '2026-07-01', expiryDate: '2026-07-31', batchStatus: 'AVAILABLE', warehouseName: 'Mumbai DC', originalQty: 500, currentQty: 358, uomName: 'BOX', unitCost: 600, totalValue: 214800, fefoPriority: 10, qualityGrade: 'A', daysToExpiry: 22 },
    { id: 'bm-002', batchNumber: 'KK-2607-02', productName: 'Kaju Katli 500g', batchType: 'FINISHED_GOODS', manufacturingDate: '2026-07-05', expiryDate: '2026-08-04', batchStatus: 'AVAILABLE', warehouseName: 'Mumbai DC', originalQty: 400, currentQty: 380, uomName: 'BOX', unitCost: 600, totalValue: 228000, fefoPriority: 20, qualityGrade: 'A', daysToExpiry: 26 },
    { id: 'bm-003', batchNumber: 'NM-2607-03', productName: 'Mixed Namkeen 200g', batchType: 'FINISHED_GOODS', manufacturingDate: '2026-07-03', expiryDate: '2026-08-17', batchStatus: 'AVAILABLE', warehouseName: 'Mumbai DC', originalQty: 1000, currentQty: 850, uomName: 'PACK', unitCost: 53, totalValue: 45050, fefoPriority: 15, qualityGrade: 'A', daysToExpiry: 39 },
    { id: 'bm-004', batchNumber: 'GJ-2606-12', productName: 'Gulab Jamun 1kg', batchType: 'FINISHED_GOODS', manufacturingDate: '2026-06-25', expiryDate: '2026-07-10', batchStatus: 'EXPIRED', warehouseName: 'Mumbai DC', originalQty: 200, currentQty: 24, uomName: 'BOX', unitCost: 304, totalValue: 7296, fefoPriority: 1, qualityGrade: 'C', daysToExpiry: -1 },
    { id: 'bm-005', batchNumber: 'SC-2606-15', productName: 'Soan Cake 1kg', batchType: 'FINISHED_GOODS', manufacturingDate: '2026-07-04', expiryDate: '2026-07-12', batchStatus: 'BLOCKED', warehouseName: 'Mumbai DC', originalQty: 150, currentQty: 60, uomName: 'BOX', unitCost: 625, totalValue: 37500, fefoPriority: 5, qualityGrade: 'B', daysToExpiry: 3 },
    { id: 'bm-006', batchNumber: 'CASHEW-RM-2606', productName: 'Cashew Nuts (Raw Material)', batchType: 'RAW_MATERIAL', manufacturingDate: '2026-06-20', expiryDate: '2026-12-20', batchStatus: 'AVAILABLE', warehouseName: 'Mumbai Plant Warehouse', originalQty: 500, currentQty: 320, uomName: 'KG', unitCost: 850, totalValue: 272000, fefoPriority: 100, qualityGrade: 'A', daysToExpiry: 164 },
    { id: 'bm-007', batchNumber: 'GHEE-RM-2606-A', productName: 'Ghee (Raw Material)', batchType: 'RAW_MATERIAL', manufacturingDate: '2026-06-15', expiryDate: '2026-09-15', batchStatus: 'QUARANTINED', warehouseName: 'Mumbai Plant Warehouse', originalQty: 100, currentQty: 80, uomName: 'KG', unitCost: 520, totalValue: 41600, fefoPriority: 50, qualityGrade: 'B', daysToExpiry: 68 },
    { id: 'bm-008', batchNumber: 'PKG-BOX-2607-001', productName: 'Printed Box 500g (Packaging)', batchType: 'PACKAGING_MATERIAL', manufacturingDate: '2026-07-01', expiryDate: '2027-07-01', batchStatus: 'AVAILABLE', warehouseName: 'Mumbai Plant Warehouse', originalQty: 10000, currentQty: 8500, uomName: 'PCS', unitCost: 8, totalValue: 68000, fefoPriority: 200, qualityGrade: 'A', daysToExpiry: 357 },
    { id: 'bm-009', batchNumber: 'KK-2606-05', productName: 'Kaju Katli 500g', batchType: 'FINISHED_GOODS', manufacturingDate: '2026-06-15', expiryDate: '2026-07-15', batchStatus: 'RECALLED', warehouseName: 'Mumbai DC', originalQty: 300, currentQty: 56, uomName: 'BOX', unitCost: 600, totalValue: 33600, fefoPriority: 1, qualityGrade: 'C', daysToExpiry: 6 },
    { id: 'bm-010', batchNumber: 'SUG-RM-2606-01', productName: 'Sugar (Raw Material)', batchType: 'RAW_MATERIAL', manufacturingDate: '2026-06-10', expiryDate: '2027-06-10', batchStatus: 'CONSUMED', warehouseName: 'Mumbai Plant Warehouse', originalQty: 1500, currentQty: 0, uomName: 'KG', unitCost: 45, totalValue: 0, fefoPriority: 300, qualityGrade: 'A', daysToExpiry: 336 },
  ]
  const typeColor: Record<string, string> = {
    RAW_MATERIAL: 'bg-amber-100 text-amber-800',
    PACKAGING_MATERIAL: 'bg-cyan-100 text-cyan-800',
    SEMI_FINISHED: 'bg-purple-100 text-purple-800',
    FINISHED_GOODS: 'bg-emerald-100 text-emerald-800',
    RETURNED_GOODS: 'bg-rose-100 text-rose-800',
    QUALITY_HOLD: 'bg-orange-100 text-orange-800',
    TRIAL_BATCH: 'bg-blue-100 text-blue-800',
    REWORK_BATCH: 'bg-indigo-100 text-indigo-800',
  }
  const statusColor: Record<string, string> = {
    PLANNED: 'bg-slate-100 text-slate-800',
    CREATED: 'bg-blue-100 text-blue-800',
    RELEASED: 'bg-cyan-100 text-cyan-800',
    AVAILABLE: 'bg-emerald-600 text-white',
    RESERVED: 'bg-teal-100 text-teal-800',
    BLOCKED: 'bg-orange-600 text-white',
    QUARANTINED: 'bg-amber-600 text-white',
    EXPIRED: 'bg-red-600 text-white',
    RECALLED: 'bg-rose-600 text-white',
    CONSUMED: 'bg-slate-600 text-white',
    CLOSED: 'bg-slate-800 text-white',
  }
  const gradeColor: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-800',
    B: 'bg-amber-100 text-amber-800',
    C: 'bg-orange-100 text-orange-800',
    REJECT: 'bg-red-100 text-red-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><Boxes className="h-5 w-5" /> Batch Master Records</h3>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" />New Batch</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">Batch #</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Product</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Type</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Mfg Date</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Expiry</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Days Left</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">FEFO</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Grade</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Curr Qty</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Value ₹</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 pr-3 font-mono text-xs">{b.batchNumber}</td>
                <td className="py-2 pr-3 text-xs">{b.productName}</td>
                <td className="py-2 pr-3"><Badge className={typeColor[b.batchType]}>{b.batchType.replace(/_/g, ' ')}</Badge></td>
                <td className="py-2 pr-3 text-xs font-mono">{b.manufacturingDate}</td>
                <td className="py-2 pr-3 text-xs font-mono">{b.expiryDate}</td>
                <td className={cn('py-2 pr-3 text-right font-mono font-semibold', b.daysToExpiry < 0 ? 'text-red-600' : b.daysToExpiry < 7 ? 'text-amber-600' : 'text-emerald-600')}>
                  {b.daysToExpiry < 0 ? `${b.daysToExpiry}d` : `${b.daysToExpiry}d`}
                </td>
                <td className="py-2 pr-3"><Badge variant="outline" className="font-mono">P{b.fefoPriority}</Badge></td>
                <td className="py-2 pr-3"><Badge className={gradeColor[b.qualityGrade]}>{b.qualityGrade}</Badge></td>
                <td className="py-2 pr-3 text-right font-mono">{b.currentQty.toLocaleString()} <span className="text-xs text-muted-foreground">{b.uomName}</span></td>
                <td className="py-2 pr-3 text-right font-mono">{b.totalValue.toLocaleString('en-IN')}</td>
                <td className="py-2 pr-3"><Badge className={statusColor[b.batchStatus]}>{b.batchStatus}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ExpiryAlertsTab() {
  const alerts = [
    { id: 'ea-001', batchNumber: 'KK-2607-01', productName: 'Kaju Katli 500g', alertLevel: 'NEAR_EXPIRY', daysToExpiry: 22, expiryDate: '2026-07-31', quantity: 358, uomName: 'BOX', unitCost: 600, totalValue: 214800, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null },
    { id: 'ea-002', batchNumber: 'KK-2607-02', productName: 'Kaju Katli 500g', alertLevel: 'HEALTHY', daysToExpiry: 26, expiryDate: '2026-08-04', quantity: 380, uomName: 'BOX', unitCost: 600, totalValue: 228000, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null },
    { id: 'ea-003', batchNumber: 'NM-2607-03', productName: 'Mixed Namkeen 200g', alertLevel: 'HEALTHY', daysToExpiry: 39, expiryDate: '2026-08-17', quantity: 850, uomName: 'PACK', unitCost: 53, totalValue: 45050, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null },
    { id: 'ea-004', batchNumber: 'GJ-2606-12', productName: 'Gulab Jamun 1kg', alertLevel: 'EXPIRED', daysToExpiry: -1, expiryDate: '2026-07-10', quantity: 24, uomName: 'BOX', unitCost: 304, totalValue: 7296, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null },
    { id: 'ea-005', batchNumber: 'SC-2606-15', productName: 'Soan Cake 1kg', alertLevel: 'CRITICAL', daysToExpiry: 3, expiryDate: '2026-07-12', quantity: 60, uomName: 'BOX', unitCost: 625, totalValue: 37500, warehouseName: 'Mumbai DC', status: 'ACKNOWLEDGED', actionTaken: 'FEFO_PRIORITIZE' },
    { id: 'ea-006', batchNumber: 'KK-2606-05', productName: 'Kaju Katli 500g', alertLevel: 'CRITICAL', daysToExpiry: 6, expiryDate: '2026-07-15', quantity: 56, uomName: 'BOX', unitCost: 600, totalValue: 33600, warehouseName: 'Mumbai DC', status: 'ACTIONED', actionTaken: 'RETURN_TO_SUPPLIER' },
    { id: 'ea-007', batchNumber: 'CASHEW-RM-2606', productName: 'Cashew Nuts (Raw Material)', alertLevel: 'HEALTHY', daysToExpiry: 164, expiryDate: '2026-12-20', quantity: 320, uomName: 'KG', unitCost: 850, totalValue: 272000, warehouseName: 'Mumbai Plant Warehouse', status: 'ACTIVE', actionTaken: null },
    { id: 'ea-008', batchNumber: 'GHEE-RM-2606-A', productName: 'Ghee (Raw Material)', alertLevel: 'HEALTHY', daysToExpiry: 68, expiryDate: '2026-09-15', quantity: 80, uomName: 'KG', unitCost: 520, totalValue: 41600, warehouseName: 'Mumbai Plant Warehouse', status: 'ACTIVE', actionTaken: null },
  ]
  const levelColor: Record<string, string> = {
    HEALTHY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    NEAR_EXPIRY: 'bg-amber-100 text-amber-800 border-amber-200',
    CRITICAL: 'bg-orange-100 text-orange-800 border-orange-200',
    EXPIRED: 'bg-red-100 text-red-800 border-red-200',
  }
  const levelBorder: Record<string, string> = {
    HEALTHY: 'border-l-emerald-500',
    NEAR_EXPIRY: 'border-l-amber-500',
    CRITICAL: 'border-l-orange-500',
    EXPIRED: 'border-l-red-500',
  }
  const actionColor: Record<string, string> = {
    FEFO_PRIORITIZE: 'bg-blue-600 text-white',
    DISCOUNT: 'bg-amber-600 text-white',
    DONATE: 'bg-emerald-600 text-white',
    DESTROY: 'bg-red-600 text-white',
    RETURN_TO_SUPPLIER: 'bg-purple-600 text-white',
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {alerts.map(a => (
        <Card key={a.id} className={cn('p-5 border-l-4', levelBorder[a.alertLevel])}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{a.batchNumber} · {a.warehouseName}</p>
              <h4 className="font-semibold">{a.productName}</h4>
            </div>
            <Badge className={levelColor[a.alertLevel]}>{a.alertLevel.replace(/_/g, ' ')}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Days Left</p>
              <p className={cn('font-mono font-bold', a.daysToExpiry < 0 ? 'text-red-600' : a.daysToExpiry < 7 ? 'text-amber-600' : a.daysToExpiry < 30 ? 'text-orange-600' : 'text-emerald-600')}>
                {a.daysToExpiry < 0 ? `${a.daysToExpiry}` : `${a.daysToExpiry}d`}
              </p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-mono font-semibold">{a.quantity} <span className="text-xs">{a.uomName}</span></p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Value ₹</p>
              <p className="font-mono font-semibold">{a.totalValue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="space-y-1 text-xs mb-3">
            <p className="flex justify-between"><span className="text-muted-foreground">Expiry Date:</span><span className="font-mono">{a.expiryDate}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Unit Cost:</span><span className="font-mono">₹{a.unitCost}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Alert Status:</span><span className="font-semibold">{a.status}</span></p>
          </div>
          {a.actionTaken ? (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1">Action Taken:</p>
              <Badge className={actionColor[a.actionTaken]}>{a.actionTaken.replace(/_/g, ' ')}</Badge>
            </div>
          ) : (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Available Actions:</p>
              <div className="flex flex-wrap gap-1">
                {a.alertLevel !== 'HEALTHY' && (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-xs"><GitBranch className="mr-1 h-3 w-3" />FEFO Prioritize</Button>
                    {a.alertLevel === 'NEAR_EXPIRY' && <Button size="sm" variant="outline" className="h-7 text-xs"><Percent className="mr-1 h-3 w-3" />Discount</Button>}
                    {a.alertLevel === 'NEAR_EXPIRY' && <Button size="sm" variant="outline" className="h-7 text-xs"><Gift className="mr-1 h-3 w-3" />Donate</Button>}
                    {a.alertLevel === 'EXPIRED' && <Button size="sm" variant="outline" className="h-7 text-xs text-red-600"><Trash2 className="mr-1 h-3 w-3" />Destroy</Button>}
                    {(a.alertLevel === 'CRITICAL' || a.alertLevel === 'EXPIRED') && <Button size="sm" variant="outline" className="h-7 text-xs"><ArrowLeftRight className="mr-1 h-3 w-3" />Return</Button>}
                  </>
                )}
                {a.alertLevel === 'HEALTHY' && <span className="text-xs text-muted-foreground italic">No action required — stock is healthy</span>}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function ProductRecallsTab() {
  const recalls = [
    {
      id: 'pr-001', recallNumber: 'RC-2026-001', recallDate: '2026-07-08', recallType: 'FULL_RECALL', recallReason: 'QUALITY_ISSUE',
      productName: 'Kaju Katli 500g', description: 'Sugar proportion deviation in Kaju Katli batches produced between Jun 15-20. Affected batches: KK-2606-05, KK-2606-06, KK-2606-07.',
      reportedBy: 'QC Manager Anita', complaintNumber: 'CC-2026-0012', status: 'RETURNS_IN_PROGRESS',
      totalBatchesAffected: 3, totalQuantityRecalled: 168, totalQuantityReturned: 84, totalCustomersAffected: 12, totalValue: 100800,
      initiatedAt: '2026-07-08T09:00:00Z', noticeSentAt: '2026-07-08T10:30:00Z', completedAt: null,
      approvedByName: 'CEO Vikram', remarks: 'Market-wide recall. Refund + replacement offered. FSSAI notified.',
      batches: [
        { batchNumber: 'KK-2606-05', quantityProduced: 300, quantityInStock: 56, quantityDispatched: 244, quantityReturned: 56, status: 'RETURNED' },
        { batchNumber: 'KK-2606-06', quantityProduced: 280, quantityInStock: 0, quantityDispatched: 280, quantityReturned: 28, status: 'NOTIFIED' },
        { batchNumber: 'KK-2606-07', quantityProduced: 320, quantityInStock: 0, quantityDispatched: 320, quantityReturned: 0, status: 'IDENTIFIED' },
      ],
    },
    {
      id: 'pr-002', recallNumber: 'RC-2026-002', recallDate: '2026-07-06', recallType: 'PARTIAL_RECALL', recallReason: 'MISLABELING',
      productName: 'Gulab Jamun 1kg', description: '15 boxes of Kala Jamun mislabeled as Gulab Jamun in batch GJ-2607-03. Only specific shipment to Andheri retail chain affected.',
      reportedBy: 'Store Manager Pune', complaintNumber: 'CC-2026-0008', status: 'COMPLETED',
      totalBatchesAffected: 1, totalQuantityRecalled: 15, totalQuantityReturned: 15, totalCustomersAffected: 3, totalValue: 4560,
      initiatedAt: '2026-07-06T11:00:00Z', noticeSentAt: '2026-07-06T12:00:00Z', completedAt: '2026-07-07T15:00:00Z',
      approvedByName: 'COO Anita', remarks: 'All 15 units recovered from 3 customers. No health impact — only labeling issue.',
      batches: [
        { batchNumber: 'GJ-2607-03', quantityProduced: 200, quantityInStock: 80, quantityDispatched: 120, quantityReturned: 15, status: 'DISPOSED' },
      ],
    },
    {
      id: 'pr-003', recallNumber: 'RC-2026-003', recallDate: '2026-07-09', recallType: 'MARKET_WITHDRAWAL', recallReason: 'FOREIGN_OBJECT',
      productName: 'Mixed Namkeen 200g', description: 'Customer reported small plastic fragment in Mixed Namkeen 200g pack — batch NM-2607-01. Voluntary withdrawal initiated as precaution.',
      reportedBy: 'Customer Care Helpline', complaintNumber: 'CC-2026-0018', status: 'INVESTIGATING',
      totalBatchesAffected: 1, totalQuantityRecalled: 200, totalQuantityReturned: 0, totalCustomersAffected: 1, totalValue: 10600,
      initiatedAt: '2026-07-09T14:00:00Z', noticeSentAt: null, completedAt: null,
      approvedByName: null, remarks: 'Withdrawal (not full recall) — only 1 complaint. Investigation in progress to identify source of contamination in packaging line.',
      batches: [],
    },
  ]
  const typeColor: Record<string, string> = {
    FULL_RECALL: 'bg-red-600 text-white',
    PARTIAL_RECALL: 'bg-orange-600 text-white',
    MARKET_WITHDRAWAL: 'bg-amber-600 text-white',
    SUPPLIER_RECALL: 'bg-purple-600 text-white',
    INTERNAL_RECALL: 'bg-blue-600 text-white',
  }
  const reasonColor: Record<string, string> = {
    QUALITY_ISSUE: 'bg-orange-100 text-orange-800',
    CONTAMINATION: 'bg-red-100 text-red-800',
    MISLABELING: 'bg-amber-100 text-amber-800',
    FOREIGN_OBJECT: 'bg-rose-100 text-rose-800',
    REGULATORY: 'bg-purple-100 text-purple-800',
    CUSTOMER_COMPLAINT: 'bg-blue-100 text-blue-800',
  }
  const statusColor: Record<string, string> = {
    INITIATED: 'bg-blue-600 text-white',
    INVESTIGATING: 'bg-amber-600 text-white',
    RECALL_NOTICE_SENT: 'bg-orange-600 text-white',
    RETURNS_IN_PROGRESS: 'bg-purple-600 text-white',
    COMPLETED: 'bg-emerald-600 text-white',
    CANCELLED: 'bg-slate-600 text-white',
  }
  const batchStatusColor: Record<string, string> = {
    IDENTIFIED: 'bg-blue-100 text-blue-800',
    NOTIFIED: 'bg-amber-100 text-amber-800',
    RETURNED: 'bg-purple-100 text-purple-800',
    DISPOSED: 'bg-red-100 text-red-800',
    WRITTEN_OFF: 'bg-slate-100 text-slate-800',
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recalls.map(r => (
        <Card key={r.id} className={cn('p-5 border-l-4', r.recallType === 'FULL_RECALL' ? 'border-l-red-500' : r.recallType === 'PARTIAL_RECALL' ? 'border-l-orange-500' : 'border-l-amber-500')}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{r.recallNumber} · {r.recallDate}</p>
              <h4 className="font-semibold text-sm">{r.productName}</h4>
            </div>
            <Badge className={typeColor[r.recallType]}>{r.recallType.replace(/_/g, ' ')}</Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge className={reasonColor[r.recallReason]}>{r.recallReason.replace(/_/g, ' ')}</Badge>
            <Badge className={statusColor[r.status]}>{r.status.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3 italic">&quot;{r.description}&quot;</p>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Batches Affected</p>
              <p className="font-mono font-bold">{r.totalBatchesAffected}</p>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Qty Recalled</p>
              <p className="font-mono font-bold">{r.totalQuantityRecalled}</p>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Qty Returned</p>
              <p className="font-mono font-bold text-emerald-600">{r.totalQuantityReturned}</p>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Customers</p>
              <p className="font-mono font-bold">{r.totalCustomersAffected}</p>
            </div>
          </div>
          <div className="space-y-1 text-xs mb-3">
            <p className="flex justify-between"><span className="text-muted-foreground">Total Value:</span><span className="font-mono font-semibold text-red-600">₹{r.totalValue.toLocaleString('en-IN')}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Reported By:</span><span>{r.reportedBy}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Complaint #:</span><span className="font-mono">{r.complaintNumber}</span></p>
            {r.approvedByName && <p className="flex justify-between"><span className="text-muted-foreground">Approved By:</span><span>{r.approvedByName}</span></p>}
          </div>
          {r.batches.length > 0 && (
            <div className="mb-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Affected Batches ({r.batches.length}):</p>
              <div className="space-y-1">
                {r.batches.map(b => (
                  <div key={b.batchNumber} className="flex items-center justify-between text-xs p-1.5 bg-muted/30 rounded">
                    <span className="font-mono">{b.batchNumber}</span>
                    <span className="text-muted-foreground">{b.quantityReturned}/{b.quantityDispatched} returned</span>
                    <Badge className={batchStatusColor[b.status]}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Timeline:</p>
            <div className="text-xs space-y-1 mb-3">
              <p className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />Initiated: <span className="font-mono">{r.initiatedAt.slice(0, 16).replace('T', ' ')}</span></p>
              {r.noticeSentAt && <p className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />Notice Sent: <span className="font-mono">{r.noticeSentAt.slice(0, 16).replace('T', ' ')}</span></p>}
              {r.completedAt && <p className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />Completed: <span className="font-mono">{r.completedAt.slice(0, 16).replace('T', ' ')}</span></p>}
            </div>
            {r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
              <Button size="sm" className="w-full h-8"><ArrowRightCircle className="mr-1 h-3 w-3" />Advance Status</Button>
            )}
            {r.status === 'COMPLETED' && <Badge className="bg-emerald-600 text-white w-full justify-center py-1">Recall Closed</Badge>}
          </div>
        </Card>
      ))}
    </div>
  )
}

function BatchGenealogyTab() {
  const genealogies = [
    { id: 'bg-001', fromBatchNumber: 'CASHEW-RM-2606', fromProductName: 'Cashew Nuts (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'PRODUCED_FROM', quantityUsed: 180, productionOrderId: 'MO-2026-0089', productionDate: '2026-07-01' },
    { id: 'bg-002', fromBatchNumber: 'SUG-RM-2606-01', fromProductName: 'Sugar (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'USED_IN', quantityUsed: 150, productionOrderId: 'MO-2026-0089', productionDate: '2026-07-01' },
    { id: 'bg-003', fromBatchNumber: 'GHEE-RM-2606-A', fromProductName: 'Ghee (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'USED_IN', quantityUsed: 40, productionOrderId: 'MO-2026-0089', productionDate: '2026-07-01' },
    { id: 'bg-004', fromBatchNumber: 'CASHEW-RM-2606', fromProductName: 'Cashew Nuts (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchNumber: 'KK-2607-02', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'PRODUCED_FROM', quantityUsed: 160, productionOrderId: 'MO-2026-0090', productionDate: '2026-07-05' },
    { id: 'bg-005', fromBatchNumber: 'PKG-BOX-2607-001', fromProductName: 'Printed Box 500g (Packaging)', fromBatchType: 'PACKAGING_MATERIAL', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'USED_IN', quantityUsed: 500, productionOrderId: 'MO-2026-0089', productionDate: '2026-07-02' },
  ]
  const relColor: Record<string, string> = {
    PRODUCED_FROM: 'bg-emerald-100 text-emerald-800',
    USED_IN: 'bg-blue-100 text-blue-800',
    REPACKED_FROM: 'bg-amber-100 text-amber-800',
    REWORKED_FROM: 'bg-purple-100 text-purple-800',
    BLEND_OF: 'bg-cyan-100 text-cyan-800',
  }
  const fromTypeColor = 'bg-amber-100 text-amber-800'
  const toTypeColor = 'bg-emerald-100 text-emerald-800'
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><GitBranch className="h-5 w-5" /> Batch Genealogy — Forward &amp; Backward Traceability</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><ArrowRightCircle className="mr-1 h-3 w-3" />Forward Trace</Button>
            <Button size="sm" variant="outline"><ArrowDownToLine className="mr-1 h-3 w-3" />Backward Trace</Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Forward trace (Batch → Outputs): &quot;Where did this raw material go?&quot; — used in recall impact analysis.
          Backward trace (Batch → Inputs): &quot;What went into this finished batch?&quot; — used in root cause analysis.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {genealogies.map(g => (
          <Card key={g.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Badge className={relColor[g.relationshipType]}>{g.relationshipType.replace(/_/g, ' ')}</Badge>
              <span className="text-xs text-muted-foreground font-mono">{g.productionOrderId}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* From batch */}
              <div className="flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <div className="flex items-center gap-1 mb-1">
                  <Badge className={fromTypeColor}>FROM · {g.fromBatchType.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-mono text-xs font-semibold">{g.fromBatchNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{g.fromProductName}</p>
              </div>
              {/* Arrow + qty */}
              <div className="flex flex-col items-center text-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <Badge variant="outline" className="font-mono text-xs mt-1">{g.quantityUsed} units</Badge>
              </div>
              {/* To batch */}
              <div className="flex-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center gap-1 mb-1">
                  <Badge className={toTypeColor}>TO · {g.toBatchType.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-mono text-xs font-semibold">{g.toBatchNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{g.toProductName}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Production Date:</span>
              <span className="font-mono">{g.productionDate}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><GitMerge className="h-5 w-5" /> Genealogy Tree — KK-2607-01 (Backward Trace)</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// Backward trace: what raw materials + packaging went into finished batch KK-2607-01?</p>
          <div className="space-y-1 pt-2">
            <p><Badge className="bg-emerald-600 text-white">FINISHED</Badge> <span className="font-semibold">KK-2607-01</span> — Kaju Katli 500g (500 BOX produced)</p>
            <p className="pl-4">↑ PRODUCED_FROM</p>
            <p className="pl-8"><Badge className="bg-amber-100 text-amber-800">RAW</Badge> <span className="font-mono">CASHEW-RM-2606</span> — Cashew Nuts — <span className="text-muted-foreground">180 KG used</span></p>
            <p className="pl-8"><Badge className="bg-amber-100 text-amber-800">RAW</Badge> <span className="font-mono">SUG-RM-2606-01</span> — Sugar — <span className="text-muted-foreground">150 KG used</span></p>
            <p className="pl-8"><Badge className="bg-amber-100 text-amber-800">RAW</Badge> <span className="font-mono">GHEE-RM-2606-A</span> — Ghee — <span className="text-muted-foreground">40 KG used</span></p>
            <p className="pl-8"><Badge className="bg-cyan-100 text-cyan-800">PKG</Badge> <span className="font-mono">PKG-BOX-2607-001</span> — Printed Box 500g — <span className="text-muted-foreground">500 PCS used</span></p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Costing & Valuation Module (Sprint 20) ─────────────
type CostingTab = 'overview' | 'layers' | 'landed' | 'revaluation' | 'gl'
