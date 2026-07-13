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

export function ReservationModule() {
  const [tab, setTab] = useState<ReservationTab>('overview')
  const tabs: Array<{ key: ReservationTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'reservations', label: 'Reservations', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'rules', label: 'Allocation Rules', icon: <ListChecks className="h-4 w-4" /> },
    { key: 'availability', label: 'Availability', icon: <Boxes className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Reservation & Allocation Engine
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              Inventory reservations across sales, production, kitchen, transfer, maintenance, project, sample, and emergency.
              6 allocation strategies (FIFO, FEFO, LIFO, NEAREST_BIN, LOWEST_COST, HIGHEST_PRIORITY), priority matrix,
              and real-time availability snapshots with short-supply detection.
            </p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 17</Badge>
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
      {tab === 'overview' && <ReservationOverviewTab />}
      {tab === 'reservations' && <ReservationListTab />}
      {tab === 'rules' && <AllocationRulesTab />}
      {tab === 'availability' && <AvailabilityTab />}
    </div>
  )
}

function ReservationOverviewTab() {
  const stats = [
    { label: 'Active Reservations', value: '4', sub: '2 ACTIVE · 2 PARTIALLY_ALLOCATED', icon: <ShieldCheck className="h-5 w-5 text-blue-600" /> },
    { label: 'Fully Allocated', value: '2', sub: 'PRODUCTION + EMERGENCY', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
    { label: 'Short Supply Items', value: '2', sub: 'Soan Cake + Gulab Jamun', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> },
    { label: 'Released / Expired', value: '1', sub: 'SAMPLE_RESERVATION released', icon: <Archive className="h-5 w-5 text-slate-600" /> },
    { label: 'Allocation Rules', value: '6', sub: 'FIFO · FEFO · LIFO · NEAREST · LOWEST · PRIORITY', icon: <ListChecks className="h-5 w-5 text-purple-600" /> },
    { label: 'Available Stock Value', value: '₹3.47L', sub: 'across 4 warehouses', icon: <IndianRupee className="h-5 w-5 text-amber-600" /> },
  ]
  const flowSteps = [
    { n: 1, label: 'Business Document', detail: 'Sales Order / Production Order / Transfer / Project', color: 'text-blue-600' },
    { n: 2, label: 'Reservation Request', detail: 'Auto-create reservation with priority + expiry', color: 'text-cyan-600' },
    { n: 3, label: 'Availability Check', detail: 'Query AvailabilitySnapshot (onHand − reserved − allocated − blocked)', color: 'text-amber-600' },
    { n: 4, label: 'Reservation Created', detail: 'Stock earmarked — available pool reduced', color: 'text-orange-600' },
    { n: 5, label: 'Allocation', detail: 'Apply allocation rule (FIFO / FEFO / LIFO / NEAREST / LOWEST / PRIORITY)', color: 'text-purple-600' },
    { n: 6, label: 'Picking', detail: 'Pick list generated against allocated bin', color: 'text-violet-600' },
    { n: 7, label: 'Issue / Consumption', detail: 'Stock issued — ledger updated, reservation moves to FULLY_ISSUED', color: 'text-indigo-600' },
    { n: 8, label: 'Inventory Ledger', detail: 'Reservation → Allocation → Issue chain recorded for audit', color: 'text-emerald-600' },
  ]
  const priorityMatrix = [
    { rank: 1, source: 'Manufacturing Orders', exampleType: 'PRODUCTION_ORDER', priority: 'CRITICAL', score: 95, sla: '24 hrs', notes: 'Production line stoppage costs >50K/hr — highest non-emergency priority.' },
    { rank: 2, source: 'Customer Sales Orders', exampleType: 'SALES_ORDER', priority: 'HIGH', score: 80, sla: '48 hrs', notes: 'Wholesale + retail orders. VIP customers get CRITICAL override.' },
    { rank: 3, source: 'Restaurant / Kitchen', exampleType: 'KITCHEN_ORDER', priority: 'NORMAL', score: 60, sla: '8 hrs', notes: 'Same-day consumption — short reservation window.' },
    { rank: 4, source: 'Stock Transfers', exampleType: 'TRANSFER_ORDER', priority: 'NORMAL', score: 50, sla: '144 hrs', notes: 'Inter-warehouse restocking — 6-day reservation window.' },
    { rank: 5, source: 'Samples & Marketing', exampleType: 'SAMPLE_RESERVATION', priority: 'LOW', score: 25, sla: '288 hrs', notes: '12-day window — low priority, can be bumped by higher orders.' },
  ]
  const priorityColor: Record<string, string> = {
    CRITICAL: 'bg-orange-100 text-orange-800',
    HIGH: 'bg-amber-100 text-amber-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    LOW: 'bg-slate-100 text-slate-800',
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Reservation → Allocation → Issue Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 8 reservation types: SALES_ORDER, PRODUCTION_ORDER, KITCHEN_ORDER, TRANSFER_ORDER, MAINTENANCE_ORDER, PROJECT_RESERVATION, SAMPLE_RESERVATION, EMERGENCY_RESERVATION</p>
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ListChecks className="h-5 w-5" /> Reservation Priority Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3 font-medium text-muted-foreground">Rank</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Source</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Example Type</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Default Priority</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Score</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">SLA</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {priorityMatrix.map(p => (
                <tr key={p.rank} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono">{p.rank}</td>
                  <td className="py-2 pr-3 font-medium">{p.source}</td>
                  <td className="py-2 pr-3"><Badge variant="outline" className="font-mono text-xs">{p.exampleType}</Badge></td>
                  <td className="py-2 pr-3"><Badge className={priorityColor[p.priority]}>{p.priority}</Badge></td>
                  <td className="py-2 pr-3 font-mono">{p.score}</td>
                  <td className="py-2 pr-3">{p.sla}</td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ReservationListTab() {
  const reservations = [
    { id: 'res-001', number: 'RSV-2026-0001', date: '2026-07-09', type: 'SALES_ORDER', priority: 'HIGH', score: 80, warehouse: 'Mumbai DC', refType: 'SALES_ORDER', refNumber: 'SO-2026-0451', partner: 'Sai Distribution Pvt Ltd', requested: 250, reserved: 250, allocated: 180, issued: 0, status: 'ACTIVE', expiry: '2026-07-12', autoRelease: 72, createdBy: 'Anita Desai' },
    { id: 'res-002', number: 'RSV-2026-0002', date: '2026-07-09', type: 'PRODUCTION_ORDER', priority: 'CRITICAL', score: 95, warehouse: 'Mumbai Plant Warehouse', refType: 'PRODUCTION_ORDER', refNumber: 'PO-2026-0078', partner: null, requested: 1200, reserved: 1200, allocated: 1200, issued: 600, status: 'FULLY_ALLOCATED', expiry: '2026-07-10', autoRelease: 24, createdBy: 'Chef Rajesh' },
    { id: 'res-003', number: 'RSV-2026-0003', date: '2026-07-09', type: 'KITCHEN_ORDER', priority: 'NORMAL', score: 60, warehouse: 'Mumbai Plant Warehouse', refType: 'KITCHEN_REQUISITION', refNumber: 'KR-2026-0234', partner: null, requested: 80, reserved: 80, allocated: 45, issued: 45, status: 'PARTIALLY_ALLOCATED', expiry: '2026-07-09', autoRelease: 8, createdBy: 'Chef Rajesh' },
    { id: 'res-004', number: 'RSV-2026-0004', date: '2026-07-08', type: 'TRANSFER_ORDER', priority: 'NORMAL', score: 50, warehouse: 'Mumbai DC', refType: 'STOCK_TRANSFER', refNumber: 'ST-2026-0156', partner: null, requested: 400, reserved: 380, allocated: 200, issued: 0, status: 'ACTIVE', expiry: '2026-07-14', autoRelease: 144, createdBy: 'Ramesh Yadav' },
    { id: 'res-005', number: 'RSV-2026-0005', date: '2026-07-07', type: 'MAINTENANCE_ORDER', priority: 'LOW', score: 30, warehouse: 'Mumbai Plant Warehouse', refType: 'MAINTENANCE_WO', refNumber: 'MWO-2026-0089', partner: null, requested: 15, reserved: 15, allocated: 15, issued: 0, status: 'ACTIVE', expiry: '2026-07-21', autoRelease: 240, createdBy: 'Sandeep Kumar' },
    { id: 'res-006', number: 'RSV-2026-0006', date: '2026-07-06', type: 'PROJECT_RESERVATION', priority: 'HIGH', score: 75, warehouse: 'Mumbai DC', refType: 'PROJECT', refNumber: 'PRJ-2026-0012', partner: 'Wedding Belles Events', requested: 600, reserved: 550, allocated: 320, issued: 100, status: 'PARTIALLY_ALLOCATED', expiry: '2026-07-25', autoRelease: 360, createdBy: 'Anita Desai' },
    { id: 'res-007', number: 'RSV-2026-0007', date: '2026-07-05', type: 'SAMPLE_RESERVATION', priority: 'LOW', score: 25, warehouse: 'Mumbai Retail Store 01', refType: 'SAMPLE_REQUEST', refNumber: 'SR-2026-0042', partner: 'Apna Bazaar Chain', requested: 12, reserved: 12, allocated: 12, issued: 12, status: 'RELEASED', expiry: '2026-07-19', autoRelease: 288, createdBy: 'Vikram Iyer' },
    { id: 'res-008', number: 'RSV-2026-0008', date: '2026-07-09', type: 'EMERGENCY_RESERVATION', priority: 'EMERGENCY', score: 100, warehouse: 'Mumbai DC', refType: 'EMERGENCY_REQUEST', refNumber: 'ER-2026-0003', partner: 'Lifeline Hospital Canteen', requested: 50, reserved: 50, allocated: 50, issued: 0, status: 'FULLY_ALLOCATED', expiry: '2026-07-10', autoRelease: 12, createdBy: 'Anita Desai' },
  ]
  const typeColor: Record<string, string> = {
    SALES_ORDER: 'bg-blue-100 text-blue-800',
    PRODUCTION_ORDER: 'bg-purple-100 text-purple-800',
    KITCHEN_ORDER: 'bg-orange-100 text-orange-800',
    TRANSFER_ORDER: 'bg-cyan-100 text-cyan-800',
    MAINTENANCE_ORDER: 'bg-slate-100 text-slate-800',
    PROJECT_RESERVATION: 'bg-violet-100 text-violet-800',
    SAMPLE_RESERVATION: 'bg-pink-100 text-pink-800',
    EMERGENCY_RESERVATION: 'bg-red-100 text-red-800',
    QUALITY_RESERVATION: 'bg-teal-100 text-teal-800',
  }
  const priorityColor: Record<string, string> = {
    EMERGENCY: 'bg-red-600 hover:bg-red-600 text-white',
    CRITICAL: 'bg-orange-500 hover:bg-orange-500 text-white',
    HIGH: 'bg-amber-500 hover:bg-amber-500 text-white',
    NORMAL: 'bg-blue-600 hover:bg-blue-600 text-white',
    LOW: 'bg-slate-500 hover:bg-slate-500 text-white',
  }
  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-blue-600 hover:bg-blue-600 text-white',
    PARTIALLY_ALLOCATED: 'bg-amber-500 hover:bg-amber-500 text-white',
    FULLY_ALLOCATED: 'bg-emerald-600 hover:bg-emerald-600 text-white',
    RELEASED: 'bg-slate-500 hover:bg-slate-500 text-white',
    EXPIRED: 'bg-rose-600 hover:bg-rose-600 text-white',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> All Reservations ({reservations.length})</h3>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Reservation</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">Reservation #</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Date</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Type</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Priority</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Reference</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Warehouse</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Req</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Rsvd</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Alloc</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Issued</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Status</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 pr-3 font-mono text-xs">{r.number}</td>
                <td className="py-2 pr-3 text-xs">{r.date}</td>
                <td className="py-2 pr-3"><Badge className={typeColor[r.type]}>{r.type}</Badge></td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1">
                    <Badge className={priorityColor[r.priority]}>{r.priority}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">{r.score}</span>
                  </div>
                </td>
                <td className="py-2 pr-3 text-xs"><div className="font-mono">{r.refNumber}</div><div className="text-muted-foreground">{r.partner || '—'}</div></td>
                <td className="py-2 pr-3 text-xs">{r.warehouse}</td>
                <td className="py-2 pr-3 font-mono text-right">{r.requested}</td>
                <td className="py-2 pr-3 font-mono text-right text-blue-600">{r.reserved}</td>
                <td className="py-2 pr-3 font-mono text-right text-purple-600">{r.allocated}</td>
                <td className="py-2 pr-3 font-mono text-right text-emerald-600">{r.issued}</td>
                <td className="py-2 pr-3"><Badge className={statusColor[r.status]}>{r.status}</Badge></td>
                <td className="py-2 pr-3 text-xs">{r.expiry}<div className="text-muted-foreground">{r.autoRelease}h</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AllocationRulesTab() {
  const rules = [
    { id: 'alr-001', code: 'FEFO-PERISHABLE', name: 'FEFO for Perishable Items', description: 'First Expiry First Out — strict for dairy, sweets, and short-shelf-life products.', strategy: 'FEFO', priority: 10, reservationType: 'SALES_ORDER', category: 'PERISHABLES', productType: 'FINISHED_GOOD', warehouse: 'All Warehouses', batchPreference: 'EXPIRY_BASED', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-002', code: 'FIFO-RAW-MATERIAL', name: 'FIFO for Raw Materials', description: 'First In First Out — for raw materials and ingredients in plant warehouse.', strategy: 'FIFO', priority: 20, reservationType: 'PRODUCTION_ORDER', category: 'RAW_MATERIALS', productType: 'RAW_MATERIAL', warehouse: 'Mumbai Plant Warehouse', batchPreference: 'SAME_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-003', code: 'LIFO-FINISHED', name: 'LIFO for Finished Goods', description: 'Last In First Out — for finished goods in dispatch zone, picks freshest batch first.', strategy: 'LIFO', priority: 30, reservationType: 'SALES_ORDER', category: 'FINISHED_GOODS', productType: 'FINISHED_GOOD', warehouse: 'Mumbai DC', batchPreference: 'AUTO_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-004', code: 'NEAREST-BIN-PICK', name: 'Nearest Bin for Picking', description: 'Optimize picker travel time — picks from nearest bin to dispatch dock.', strategy: 'NEAREST_BIN', priority: 40, reservationType: 'TRANSFER_ORDER', category: 'ANY', productType: 'ANY', warehouse: 'All Warehouses', batchPreference: 'MULTIPLE_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-005', code: 'LOWEST-COST-PROJ', name: 'Lowest Cost for Project Reservations', description: 'Select stock from lowest-cost batches for project/event reservations to maximize margin.', strategy: 'LOWEST_COST', priority: 50, reservationType: 'PROJECT_RESERVATION', category: 'FINISHED_GOODS', productType: 'FINISHED_GOOD', warehouse: 'All Warehouses', batchPreference: 'SUPPLIER_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-006', code: 'HIGHEST-PRIORITY-EMR', name: 'Highest Priority for Emergency', description: 'Override all other reservations — emergency orders get highest-priority stock access.', strategy: 'HIGHEST_PRIORITY', priority: 5, reservationType: 'EMERGENCY_RESERVATION', category: 'ANY', productType: 'ANY', warehouse: 'All Warehouses', batchPreference: 'AUTO_BATCH', excludeExpired: true, excludeQuarantine: false, excludeBlocked: false, status: 'ACTIVE' },
  ]
  const strategyColor: Record<string, string> = {
    FIFO: 'bg-blue-100 text-blue-800',
    FEFO: 'bg-amber-100 text-amber-800',
    LIFO: 'bg-purple-100 text-purple-800',
    NEAREST_BIN: 'bg-cyan-100 text-cyan-800',
    LOWEST_COST: 'bg-emerald-100 text-emerald-800',
    HIGHEST_PRIORITY: 'bg-red-100 text-red-800',
  }
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Allocation Rules ({rules.length})</h3>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
        </div>
        <p className="text-xs text-muted-foreground">Rules evaluated by ascending priority (lower number = higher precedence). First matching rule wins for each reservation line.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                <p className="font-semibold text-sm">{r.name}</p>
              </div>
              <Badge className={strategyColor[r.strategy]}>{r.strategy}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-mono">#{r.priority}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reservation Type</span><Badge variant="outline" className="text-xs">{r.reservationType}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Product Category</span><span>{r.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Warehouse</span><span className="truncate ml-2">{r.warehouse}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Batch Preference</span><Badge variant="outline" className="text-xs">{r.batchPreference}</Badge></div>
            </div>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-1">
              {r.excludeExpired && <Badge variant="outline" className="text-xs text-rose-700 border-rose-300">No Expired</Badge>}
              {r.excludeQuarantine ? <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">No Quarantine</Badge> : <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">Allow Quarantine</Badge>}
              {r.excludeBlocked ? <Badge variant="outline" className="text-xs text-red-700 border-red-300">No Blocked</Badge> : <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">Allow Blocked</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AvailabilityTab() {
  const snapshots = [
    { id: 'avs-001', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', onHand: 480, reserved: 250, allocated: 180, inTransit: 100, blocked: 12, unitCost: 600 },
    { id: 'avs-002', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', onHand: 1500, reserved: 600, allocated: 600, inTransit: 0, blocked: 0, unitCost: 45 },
    { id: 'avs-003', product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', onHand: 80, reserved: 40, allocated: 30, inTransit: 50, blocked: 0, unitCost: 520 },
    { id: 'avs-004', product: 'Soan Cake 1kg', warehouse: 'Mumbai DC', onHand: 60, reserved: 80, allocated: 50, inTransit: 40, blocked: 6, unitCost: 625 },
    { id: 'avs-005', product: 'Mixed Namkeen 200g', warehouse: 'Mumbai DC', onHand: 850, reserved: 200, allocated: 150, inTransit: 0, blocked: 24, unitCost: 53 },
    { id: 'avs-006', product: 'Gulab Jamun 1kg', warehouse: 'Mumbai Retail Store 01', onHand: 24, reserved: 30, allocated: 20, inTransit: 0, blocked: 0, unitCost: 304 },
  ]
  const rows = snapshots.map(s => ({
    ...s,
    available: s.onHand - s.reserved - s.allocated - s.blocked,
    totalValue: s.onHand * s.unitCost,
  }))
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><Boxes className="h-5 w-5" /> Availability Snapshots ({rows.length})</h3>
        <Badge variant="outline" className="text-xs">Snapshot: 2026-07-09 09:30 IST</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">Product</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Warehouse</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">On Hand</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Reserved</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Allocated</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">In Transit</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Blocked</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Available</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Stock Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 pr-3 font-medium">{r.product}</td>
                <td className="py-2 pr-3 text-xs">{r.warehouse}</td>
                <td className="py-2 pr-3 font-mono text-right">{r.onHand}</td>
                <td className="py-2 pr-3 font-mono text-right text-amber-600">{r.reserved}</td>
                <td className="py-2 pr-3 font-mono text-right text-purple-600">{r.allocated}</td>
                <td className="py-2 pr-3 font-mono text-right text-blue-600">{r.inTransit}</td>
                <td className="py-2 pr-3 font-mono text-right text-red-600">{r.blocked}</td>
                <td className="py-2 pr-3 font-mono text-right">
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold',
                    r.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')}>
                    {r.available > 0 ? `+${r.available}` : r.available}
                  </span>
                </td>
                <td className="py-2 pr-3 font-mono text-right text-xs">{formatINR(r.totalValue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-semibold">
              <td className="py-2 pr-3" colSpan={2}>Totals</td>
              <td className="py-2 pr-3 font-mono text-right">{rows.reduce((s, r) => s + r.onHand, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-amber-600">{rows.reduce((s, r) => s + r.reserved, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-purple-600">{rows.reduce((s, r) => s + r.allocated, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-blue-600">{rows.reduce((s, r) => s + r.inTransit, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-red-600">{rows.reduce((s, r) => s + r.blocked, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right">{rows.reduce((s, r) => s + r.available, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-xs">{formatINR(rows.reduce((s, r) => s + r.totalValue, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
        <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4" />
          <strong>Short Supply Alert:</strong> 2 items showing negative availability — Soan Cake 1kg (-76) and Gulab Jamun 1kg (-26). Reserved + allocated qty exceeds on-hand. Trigger replenishment or release lower-priority reservations.
        </p>
      </div>
    </Card>
  )
}

// ─── Cycle Count & Audit Module (Sprint 18) ─────────────
type CycleCountTab = 'overview' | 'physical' | 'plans' | 'variances'
