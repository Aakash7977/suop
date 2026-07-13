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

export function MissionControlModule() {
  const [tab, setTab] = useState<MissionControlTab>('mission')
  const tabs: Array<{ key: MissionControlTab; label: string; icon: React.ReactNode }> = [
    { key: 'mission', label: 'Mission Control', icon: <Gauge className="h-4 w-4" /> },
    { key: 'kpis', label: 'KPIs', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'classification', label: 'ABC / XYZ / FSN', icon: <Grid3x3 className="h-4 w-4" /> },
    { key: 'ageing', label: 'Ageing', icon: <History className="h-4 w-4" /> },
    { key: 'reorder', label: 'Reorder', icon: <PackageOpen className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-violet-900 to-fuchsia-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <BarChart3 className="h-7 w-7" /> Mission Control &amp; Inventory Analytics
            </h2>
            <p className="text-indigo-200 text-sm max-w-3xl">
              Single-pane-of-glass command center aggregating 10 inventory KPIs, ABC/XYZ/FSN classification,
              6-bucket ageing analysis, reorder rules with urgency signals, real-time alerts, and 4 executive
              report types — driving data-driven inventory decisions across the enterprise.
            </p>
          </div>
          <Badge className="bg-emerald-500 text-emerald-950 hover:bg-emerald-500">Sprint 21 · PART 3 COMPLETE</Badge>
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
      {tab === 'mission' && <MissionControlCommandTab />}
      {tab === 'kpis' && <MissionControlKpisTab />}
      {tab === 'classification' && <MissionControlClassificationTab />}
      {tab === 'ageing' && <MissionControlAgeingTab />}
      {tab === 'reorder' && <MissionControlReorderTab />}
    </div>
  )
}

function MissionControlCommandTab() {
  const heroStats = [
    { label: 'Total Inventory Value', value: '₹16.56L', sub: '8 SKUs · 24 batches · 2 warehouses', icon: <IndianRupee className="h-5 w-5 text-emerald-400" />, accent: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30' },
    { label: 'Today&apos;s Transactions', value: '142', sub: '78 issues · 35 receipts · 29 transfers', icon: <Activity className="h-5 w-5 text-blue-400" />, accent: 'from-blue-500/20 to-blue-600/5 border-blue-500/30' },
    { label: 'Pending Approvals', value: '7', sub: '3 adjustments · 2 revaluations · 2 counts', icon: <ClipboardList className="h-5 w-5 text-amber-400" />, accent: 'from-amber-500/20 to-amber-600/5 border-amber-500/30' },
    { label: 'Expired Stock', value: '18', sub: 'units across 3 batches — dispose immediately', icon: <AlertTriangle className="h-5 w-5 text-red-400" />, accent: 'from-red-500/20 to-red-600/5 border-red-500/30' },
    { label: 'Active Recalls', value: '1', sub: '2 batches · 280 units · 14 customers', icon: <AlertOctagon className="h-5 w-5 text-rose-400" />, accent: 'from-rose-500/20 to-rose-600/5 border-rose-500/30' },
    { label: 'Reorder Required', value: '2', sub: '1 CRITICAL · 1 HIGH · ₹1.85L value', icon: <PackageOpen className="h-5 w-5 text-orange-400" />, accent: 'from-orange-500/20 to-orange-600/5 border-orange-500/30' },
  ]
  const gauges = [
    { label: 'Inventory Accuracy', value: 94.2, target: 98, color: 'bg-amber-500', text: 'text-amber-400', status: 'below target' },
    { label: 'Stock Availability', value: 96.8, target: 98, color: 'bg-amber-500', text: 'text-amber-400', status: 'below target' },
    { label: 'Warehouse Utilization', value: 78.5, target: 80, color: 'bg-emerald-500', text: 'text-emerald-400', status: 'on target' },
    { label: 'Order Fill Rate', value: 98.1, target: 99, color: 'bg-emerald-500', text: 'text-emerald-400', status: 'on target' },
  ]
  const alerts = [
    { label: 'Expired Stock', count: 18, severity: 'critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { label: 'Near Expiry (7 days)', count: 24, severity: 'high', icon: <Clock className="h-4 w-4" />, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { label: 'Blocked Batches', count: 3, severity: 'high', icon: <ShieldAlert className="h-4 w-4" />, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { label: 'Quarantined Items', count: 5, severity: 'medium', icon: <ShieldCheck className="h-4 w-4" />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { label: 'Dead Stock Items', count: 2, severity: 'medium', icon: <Archive className="h-4 w-4" />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { label: 'Stock-Out Items', count: 1, severity: 'critical', icon: <AlertOctagon className="h-4 w-4" />, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  ]
  const ops = [
    { label: 'Putaway Tasks', count: 12, total: 18, color: 'bg-blue-500' },
    { label: 'Picking Tasks', count: 18, total: 35, color: 'bg-purple-500' },
    { label: 'Receiving Tasks', count: 5, total: 8, color: 'bg-cyan-500' },
    { label: 'Open Transfers', count: 3, total: 5, color: 'bg-indigo-500' },
  ]
  return (
    <div className="space-y-6">
      {/* PART 3 COMPLETE celebration banner */}
      <Card className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">PART 3 COMPLETE <Sparkles className="h-5 w-5 text-amber-200" /></h3>
              <p className="text-emerald-100 text-sm">Enterprise Inventory Engine — 21/21 Sprints delivered. 185 database tables. Production-ready.</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">Sprint 21 of 21 · 100%</Badge>
        </div>
      </Card>

      {/* Top row: 6 hero stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {heroStats.map(s => (
          <Card key={s.label} className={cn('p-5 bg-gradient-to-br border', s.accent)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">{s.icon}</div>
              <span className="text-xs text-slate-400 uppercase tracking-wide">live</span>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm font-medium text-slate-200 mt-1">{s.label}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Middle row: 4 KPI gauges */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Gauge className="h-5 w-5 text-indigo-600" /> Live KPI Gauges — Service &amp; Capacity</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gauges.map(g => (
            <div key={g.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{g.label}</p>
                <span className={cn('text-xs font-medium', g.text)}>{g.status}</span>
              </div>
              <p className={cn('text-2xl font-bold', g.text)}>{g.value.toFixed(1)}%</p>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className={cn('h-full rounded-full', g.color)} style={{ width: `${g.value}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Target: {g.target}%</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom row: Alerts + Pending Operations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /> Active Alerts ({alerts.length})</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {alerts.map(a => (
              <div key={a.label} className={cn('flex items-center gap-3 rounded-md border p-3', a.color)}>
                {a.icon}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{a.severity}</p>
                </div>
                <span className="text-2xl font-bold">{a.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><ListChecks className="h-5 w-5 text-blue-600" /> Pending Operations</h3>
          <div className="space-y-3">
            {ops.map(o => (
              <div key={o.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{o.label}</p>
                  <span className="text-sm text-muted-foreground">{o.count} of {o.total} pending</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full', o.color)} style={{ width: `${(o.count / o.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function MissionControlKpisTab() {
  const kpis = [
    { id: 'kpi-001', name: 'Inventory Turnover', value: 8.4, unit: 'turns/year', target: 10, trend: 'up', trendPercent: 6.2, onTarget: false, category: 'EFFICIENCY', desc: 'COGS / Average Inventory' },
    { id: 'kpi-002', name: 'Avg Days in Inventory', value: 43.5, unit: 'days', target: 35, trend: 'down', trendPercent: 4.1, onTarget: true, category: 'EFFICIENCY', desc: '365 / Inventory Turnover' },
    { id: 'kpi-003', name: 'Inventory Accuracy', value: 94.2, unit: '%', target: 98, trend: 'up', trendPercent: 1.8, onTarget: false, category: 'QUALITY', desc: 'System vs Physical count match' },
    { id: 'kpi-004', name: 'Stock Availability', value: 96.8, unit: '%', target: 98, trend: 'up', trendPercent: 0.9, onTarget: false, category: 'SERVICE', desc: 'Order lines fulfillable from stock' },
    { id: 'kpi-005', name: 'Warehouse Utilization', value: 78.5, unit: '%', target: 80, trend: 'stable', trendPercent: 0.3, onTarget: true, category: 'CAPACITY', desc: 'Used / Total storage volume' },
    { id: 'kpi-006', name: 'Stock-Out %', value: 3.2, unit: '%', target: 2, trend: 'down', trendPercent: 1.1, onTarget: false, category: 'SERVICE', desc: 'SKUs with zero on-hand (lower better)' },
    { id: 'kpi-007', name: 'Overstock %', value: 12.4, unit: '%', target: 8, trend: 'up', trendPercent: 2.6, onTarget: false, category: 'EFFICIENCY', desc: 'On-hand > 1.5× reorder point' },
    { id: 'kpi-008', name: 'Damaged Stock %', value: 0.8, unit: '%', target: 0.5, trend: 'stable', trendPercent: 0.1, onTarget: true, category: 'QUALITY', desc: 'Damage qty / Issued qty' },
    { id: 'kpi-009', name: 'Expired Stock %', value: 1.5, unit: '%', target: 0.8, trend: 'down', trendPercent: 0.4, onTarget: false, category: 'QUALITY', desc: 'Expired batch qty / Total on-hand' },
    { id: 'kpi-010', name: 'Order Fill Rate', value: 98.1, unit: '%', target: 99, trend: 'up', trendPercent: 0.6, onTarget: true, category: 'SERVICE', desc: 'Lines shipped complete first attempt' },
  ]
  const categoryColor: Record<string, string> = {
    EFFICIENCY: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    QUALITY: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    SERVICE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    CAPACITY: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  }
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <FileText className="inline h-4 w-4 mr-1" /> 10 Inventory KPIs across 4 categories — Efficiency, Quality, Service, Capacity.
          Each KPI has a value, target, trend direction (up/down/stable), trend %, and on-target indicator. Live snapshot from cycle count + transaction engine.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(k => (
          <Card key={k.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <Badge className={cn('text-xs', categoryColor[k.category])}>{k.category}</Badge>
              {k.onTarget
                ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                : <X className="h-5 w-5 text-red-600" />}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{k.name}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold">{k.value}</span>
              <span className="text-sm text-muted-foreground">{k.unit}</span>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-muted-foreground">Target: <span className="font-semibold text-foreground">{k.target} {k.unit}</span></span>
              <span className={cn('inline-flex items-center gap-1 font-medium',
                k.trend === 'up' ? 'text-emerald-600' : k.trend === 'down' ? 'text-red-600' : 'text-slate-500')}>
                {k.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {k.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {k.trend === 'stable' && <Activity className="h-3 w-3" />}
                {k.trend === 'up' ? '+' : k.trend === 'down' ? '-' : '±'}{k.trendPercent}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{k.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function MissionControlClassificationTab() {
  const products = [
    { id: 'cls-001', name: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', abc: 'A', xyz: 'X', fsn: 'FAST', combined: 'AX', valuePct: 49.5, variability: 0.12, daysLastMove: 0, totalValue: 819600 },
    { id: 'cls-002', name: 'Kaju Katli 500g', warehouse: 'Mumbai DC', abc: 'A', xyz: 'X', fsn: 'FAST', combined: 'AX', valuePct: 31.6, variability: 0.18, daysLastMove: 1, totalValue: 522610 },
    { id: 'cls-003', name: 'Ghee (Raw Material)', warehouse: 'Mumbai Plant Warehouse', abc: 'A', xyz: 'Y', fsn: 'FAST', combined: 'AY', valuePct: 2.5, variability: 0.34, daysLastMove: 2, totalValue: 41600 },
    { id: 'cls-004', name: 'Soan Cake 1kg', warehouse: 'Mumbai DC', abc: 'B', xyz: 'Y', fsn: 'SLOW', combined: 'BY', valuePct: 5.7, variability: 0.42, daysLastMove: 14, totalValue: 93750 },
    { id: 'cls-005', name: 'Mixed Namkeen 200g', warehouse: 'Mumbai DC', abc: 'B', xyz: 'Y', fsn: 'SLOW', combined: 'BY', valuePct: 2.7, variability: 0.38, daysLastMove: 4, totalValue: 45050 },
    { id: 'cls-006', name: 'Printed Box 500g (Packaging)', warehouse: 'Mumbai Plant Warehouse', abc: 'C', xyz: 'X', fsn: 'FAST', combined: 'CX', valuePct: 4.1, variability: 0.15, daysLastMove: 0, totalValue: 68000 },
    { id: 'cls-007', name: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', abc: 'C', xyz: 'Z', fsn: 'NON_MOVING', combined: 'CZ', valuePct: 0.4, variability: 0.89, daysLastMove: 141, totalValue: 7296 },
    { id: 'cls-008', name: 'Sugar (Raw Material)', warehouse: 'Mumbai Plant Warehouse', abc: 'C', xyz: 'Z', fsn: 'NON_MOVING', combined: 'CZ', valuePct: 0.0, variability: 1.0, daysLastMove: 210, totalValue: 0 },
  ]
  const abcStyle: Record<string, string> = {
    A: 'bg-emerald-500 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-slate-500 text-white',
  }
  const xyzStyle: Record<string, string> = {
    X: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    Y: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    Z: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  }
  const fsnStyle: Record<string, string> = {
    FAST: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    SLOW: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    NON_MOVING: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  }
  const combinedStyle: Record<string, string> = {
    AX: 'bg-emerald-600 text-white', AY: 'bg-emerald-500 text-white', AZ: 'bg-amber-500 text-white',
    BX: 'bg-blue-500 text-white', BY: 'bg-blue-400 text-white', BZ: 'bg-amber-400 text-white',
    CX: 'bg-slate-500 text-white', CY: 'bg-slate-400 text-white', CZ: 'bg-red-500 text-white',
  }
  return (
    <div className="space-y-4">
      {/* ABC explanation card */}
      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Grid3x3 className="h-5 w-5 text-indigo-600" /> Pareto-Based ABC Classification Principle</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 p-4 bg-emerald-50 dark:bg-emerald-950/30">
            <Badge className="bg-emerald-500 text-white mb-2">Class A</Badge>
            <p className="text-sm font-medium">Top 20% items → 80% value</p>
            <p className="text-xs text-muted-foreground mt-1">Tight control — daily cycle counts, JIT replenishment, executive review.</p>
          </div>
          <div className="rounded-lg border border-blue-200 dark:border-blue-900 p-4 bg-blue-50 dark:bg-blue-950/30">
            <Badge className="bg-blue-500 text-white mb-2">Class B</Badge>
            <p className="text-sm font-medium">Next 30% items → 15% value</p>
            <p className="text-xs text-muted-foreground mt-1">Standard control — weekly cycle counts, normal reorder policies.</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/30">
            <Badge className="bg-slate-500 text-white mb-2">Class C</Badge>
            <p className="text-sm font-medium">Bottom 50% items → 5% value</p>
            <p className="text-xs text-muted-foreground mt-1">Minimal control — monthly counts, bulk reorder, two-bin system.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 mt-4 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted"><Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">X</Badge><span>Stable demand (CV &lt; 0.25)</span></div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted"><Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Y</Badge><span>Variable demand (CV 0.25-0.5)</span></div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted"><Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">FAST</Badge><span>Moved in last 30 days</span></div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted"><Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Z</Badge><span>Irregular demand (CV &gt; 0.5)</span></div>
        </div>
      </Card>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">This module requires: <code className="font-mono">GET /api/v1/operations/dashboard (aggregation endpoint)</code>. See <code>MISSING_BACKEND_ITEMS.md</code> for details. Data shown below is mock.</p>
        </div>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Inventory Classification Matrix — 8 Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 px-3">Warehouse</th>
                <th className="py-2 px-3 text-center">ABC</th>
                <th className="py-2 px-3 text-center">XYZ</th>
                <th className="py-2 px-3 text-center">FSN</th>
                <th className="py-2 px-3 text-center">Combined</th>
                <th className="py-2 px-3 text-right">Value %</th>
                <th className="py-2 px-3 text-right">Variability</th>
                <th className="py-2 px-3 text-right">Days Since Move</th>
                <th className="py-2 pl-3 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 pr-3 font-medium">{p.name}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{p.warehouse}</td>
                  <td className="py-2 px-3 text-center"><Badge className={cn('text-xs', abcStyle[p.abc])}>{p.abc}</Badge></td>
                  <td className="py-2 px-3 text-center"><Badge className={cn('text-xs', xyzStyle[p.xyz])}>{p.xyz}</Badge></td>
                  <td className="py-2 px-3 text-center"><Badge className={cn('text-xs', fsnStyle[p.fsn])}>{p.fsn}</Badge></td>
                  <td className="py-2 px-3 text-center"><Badge className={cn('text-xs font-bold', combinedStyle[p.combined])}>{p.combined}</Badge></td>
                  <td className="py-2 px-3 text-right font-mono">{p.valuePct.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-mono text-xs">{p.variability.toFixed(2)}</td>
                  <td className={cn('py-2 px-3 text-right font-mono', p.daysLastMove > 90 ? 'text-red-600 font-semibold' : p.daysLastMove > 30 ? 'text-amber-600' : 'text-emerald-600')}>{p.daysLastMove}</td>
                  <td className="py-2 pl-3 text-right font-mono text-xs">₹{p.totalValue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MissionControlAgeingTab() {
  const products = [
    { id: 'age-001', name: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', total: 980, value: 819600, avg: 12, buckets: [850, 100, 30, 0, 0, 0] },
    { id: 'age-002', name: 'Kaju Katli 500g', warehouse: 'Mumbai DC', total: 878, value: 522610, avg: 8, buckets: [820, 50, 8, 0, 0, 0] },
    { id: 'age-003', name: 'Mixed Namkeen 200g', warehouse: 'Mumbai DC', total: 850, value: 45050, avg: 45, buckets: [200, 450, 150, 50, 0, 0] },
    { id: 'age-004', name: 'Soan Cake 1kg', warehouse: 'Mumbai DC', total: 150, value: 93750, avg: 75, buckets: [30, 40, 60, 20, 0, 0] },
    { id: 'age-005', name: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', total: 24, value: 7296, avg: 142, buckets: [0, 0, 4, 14, 6, 0] },
    { id: 'age-006', name: 'Sugar (Raw Material)', warehouse: 'Mumbai Plant Warehouse', total: 0, value: 0, avg: 210, buckets: [0, 0, 0, 0, 0, 0] },
  ]
  const bucketLabels = ['0-30', '31-60', '61-90', '91-180', '181-365', '365+']
  const bucketColor = (idx: number, qty: number) => {
    if (qty === 0) return 'text-muted-foreground'
    if (idx === 0) return 'text-emerald-600 font-semibold'
    if (idx === 1) return 'text-emerald-500'
    if (idx === 2) return 'text-amber-600'
    if (idx === 3) return 'text-orange-600'
    if (idx === 4) return 'text-red-600 font-semibold'
    return 'text-red-700 font-bold'
  }
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <History className="inline h-4 w-4 mr-1" /> Stock bucketed into 6 age ranges — fresh (0-30 days, green) → dead stock (365+ days, red).
          Drives dead-stock identification, FEFO compliance, and provisioning for slow-mover write-offs per Ind AS 2.
        </p>
      </Card>
      <Card className="p-5">
        <h3 className="font-semibold mb-3">Inventory Ageing Matrix — 6 Products × 6 Buckets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Product</th>
                {bucketLabels.map(b => <th key={b} className="py-2 px-3 text-center">{b} days</th>)}
                <th className="py-2 px-3 text-right">Total Qty</th>
                <th className="py-2 px-3 text-right">Avg Days</th>
                <th className="py-2 pl-3 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.warehouse}</p>
                  </td>
                  {p.buckets.map((b, i) => (
                    <td key={i} className={cn('py-2 px-3 text-center font-mono', bucketColor(i, b))}>{b}</td>
                  ))}
                  <td className="py-2 px-3 text-right font-mono font-semibold">{p.total}</td>
                  <td className={cn('py-2 px-3 text-right font-mono', p.avg > 90 ? 'text-red-600 font-semibold' : p.avg > 30 ? 'text-amber-600' : 'text-emerald-600')}>{p.avg}</td>
                  <td className="py-2 pl-3 text-right font-mono text-xs">₹{p.value.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="border-t-2 font-semibold bg-muted/30">
                <td className="py-2 pr-3">TOTAL</td>
                {bucketLabels.map((_, i) => (
                  <td key={i} className="py-2 px-3 text-center font-mono">{products.reduce((s, p) => s + p.buckets[i], 0)}</td>
                ))}
                <td className="py-2 px-3 text-right font-mono">{products.reduce((s, p) => s + p.total, 0)}</td>
                <td className="py-2 px-3 text-right font-mono">—</td>
                <td className="py-2 pl-3 text-right font-mono text-xs">₹{products.reduce((s, p) => s + p.value, 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-600" /> Fresh (0-60)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500" /> Aging (61-90)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-600" /> Old (91-180)</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-600" /> Dead Stock (181+)</span>
        </div>
      </Card>
    </div>
  )
}

function MissionControlReorderTab() {
  const rules = [
    { id: 'rr-001', name: 'Cashew Nuts (Raw Material)', warehouse: 'Mumbai Plant Warehouse', supplier: 'Mumbai Dry Fruits Co.', min: 200, max: 1500, safety: 150, reorderPoint: 350, current: 980, leadTime: 7, dailyUse: 28, daysSupply: 35, suggestedQty: 0, urgency: 'OK' },
    { id: 'rr-002', name: 'Kaju Katli 500g', warehouse: 'Mumbai DC', supplier: 'In-house Production', min: 150, max: 1200, safety: 100, reorderPoint: 280, current: 175, leadTime: 2, dailyUse: 65, daysSupply: 2.7, suggestedQty: 605, urgency: 'CRITICAL' },
    { id: 'rr-003', name: 'Ghee (Raw Material)', warehouse: 'Mumbai Plant Warehouse', supplier: 'Anand Dairy Ltd.', min: 40, max: 200, safety: 30, reorderPoint: 60, current: 80, leadTime: 5, dailyUse: 6, daysSupply: 13.3, suggestedQty: 0, urgency: 'OK' },
    { id: 'rr-004', name: 'Soan Cake 1kg', warehouse: 'Mumbai DC', supplier: 'In-house Production', min: 60, max: 400, safety: 50, reorderPoint: 90, current: 150, leadTime: 3, dailyUse: 8, daysSupply: 18.8, suggestedQty: 0, urgency: 'LOW' },
    { id: 'rr-005', name: 'Mixed Namkeen 200g', warehouse: 'Mumbai DC', supplier: 'In-house Production', min: 200, max: 1500, safety: 150, reorderPoint: 400, current: 850, leadTime: 2, dailyUse: 22, daysSupply: 38.6, suggestedQty: 0, urgency: 'OK' },
    { id: 'rr-006', name: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', supplier: 'In-house Production', min: 20, max: 150, safety: 25, reorderPoint: 50, current: 24, leadTime: 3, dailyUse: 4, daysSupply: 6.0, suggestedQty: 100, urgency: 'HIGH' },
  ]
  const urgencyStyle: Record<string, { bg: string; border: string; badge: string; bar: string }> = {
    CRITICAL: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-300 dark:border-red-900', badge: 'bg-red-600 text-white', bar: 'bg-red-600' },
    HIGH: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300 dark:border-orange-900', badge: 'bg-orange-500 text-white', bar: 'bg-orange-500' },
    MEDIUM: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-900', badge: 'bg-amber-500 text-white', bar: 'bg-amber-500' },
    LOW: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-300 dark:border-blue-900', badge: 'bg-blue-500 text-white', bar: 'bg-blue-500' },
    OK: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-900', badge: 'bg-emerald-600 text-white', bar: 'bg-emerald-600' },
  }
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
        <p className="text-sm text-orange-900 dark:text-orange-200">
          <PackageOpen className="inline h-4 w-4 mr-1" /> Reorder Point = Safety Stock + (Avg Daily Consumption × Lead Time).
          When on-hand ≤ reorder point, replenishment triggers. Urgency escalates as days of supply drop below lead time.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map(r => {
          const style = urgencyStyle[r.urgency]
          const pct = Math.min(100, (r.current / r.max) * 100)
          const reorderPct = Math.min(100, (r.reorderPoint / r.max) * 100)
          return (
            <Card key={r.id} className={cn('p-5 border-2', style.bg, style.border)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm leading-tight">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.warehouse}</p>
                </div>
                <Badge className={cn('text-xs font-bold', style.badge)}>{r.urgency}</Badge>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span className="font-medium text-right">{r.supplier}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lead Time</span><span className="font-medium">{r.leadTime} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Daily Consumption</span><span className="font-medium">{r.dailyUse} /day</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Days of Supply</span><span className={cn('font-semibold', r.daysSupply < r.leadTime ? 'text-red-600' : r.daysSupply < r.leadTime * 2 ? 'text-amber-600' : 'text-emerald-600')}>{r.daysSupply} days</span></div>
              </div>
              {/* Current vs Reorder Point progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Current: {r.current} · Reorder Point: {r.reorderPoint}</span><span className="text-muted-foreground">Max: {r.max}</span></div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full', style.bar)} style={{ width: `${pct}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-700" style={{ left: `${reorderPct}%` }} title={`Reorder point: ${r.reorderPoint}`} />
                </div>
                <p className="text-xs text-muted-foreground">Vertical red line = reorder point</p>
              </div>
              {/* Stock levels grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Min</p>
                  <p className="font-mono font-semibold text-sm">{r.min}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Safety</p>
                  <p className="font-mono font-semibold text-sm text-blue-600">{r.safety}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className={cn('font-mono font-bold text-sm', r.current <= r.reorderPoint ? 'text-red-600' : 'text-emerald-600')}>{r.current}</p>
                </div>
              </div>
              {r.suggestedQty > 0 && (
                <div className="mt-3 p-2 rounded-md bg-white/60 dark:bg-black/20 border border-red-300 dark:border-red-900">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Suggested Reorder: <span className="font-mono">{r.suggestedQty} units</span>
                  </p>
                </div>
              )}
              {r.suggestedQty === 0 && (
                <div className="mt-3 p-2 rounded-md bg-white/60 dark:bg-black/20 border border-emerald-300 dark:border-emerald-900">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Stock level healthy — no reorder needed
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Warehouse Management Module (Sprint 22 — PART 4 BEGINS) ───
type WarehouseTab = 'overview' | 'warehouses' | 'zones' | 'temperature' | 'rules'

const WAREHOUSE_TYPE_COLORS: Record<string, string> = {
  RAW_MATERIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PACKAGING: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  FINISHED_GOODS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  QUARANTINE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  RETURNS: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  SCRAP: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  COLD_STORAGE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  TRANSIT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  DISTRIBUTION_CENTER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  DARK_STORE: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300',
}

const ZONE_TYPE_COLORS: Record<string, string> = {
  RECEIVING: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  PUTAWAY: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  STORAGE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  PICKING: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PACKING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  DISPATCH: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  RETURNS: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  QUARANTINE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  QUALITY_INSPECTION: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  DAMAGED_GOODS: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300',
}

const TEMP_ZONE_COLORS: Record<string, string> = {
  AMBIENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CHILLED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  FROZEN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  HUMIDITY_CONTROLLED: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
}

const WAREHOUSE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-600 text-white',
  INACTIVE: 'bg-slate-500 text-white',
  MAINTENANCE: 'bg-amber-500 text-white',
  CLOSED: 'bg-red-600 text-white',
}

const ENFORCEMENT_COLORS: Record<string, string> = {
  BLOCK: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  WARN: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  LOG: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const WHM_WAREHOUSES = [
  { id: 'wh-rm-mum', code: 'WH-RM-MUM', name: 'Raw Material Warehouse', type: 'RAW_MATERIAL', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Rajesh Patel', city: 'Mumbai', volumeM3: 4500, weightKg: 250000, pallets: 600, bins: 4800, hours: '06:00 - 22:00', status: 'ACTIVE', workingDays: 'Mon-Sat' },
  { id: 'wh-pkg-mum', code: 'WH-PKG-MUM', name: 'Packaging Warehouse', type: 'PACKAGING', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Sneha Kulkarni', city: 'Mumbai', volumeM3: 2200, weightKg: 80000, pallets: 280, bins: 2200, hours: '07:00 - 19:00', status: 'ACTIVE', workingDays: 'Mon-Sat' },
  { id: 'wh-fg-mum', code: 'WH-FG-MUM', name: 'Finished Goods Warehouse', type: 'FINISHED_GOODS', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Anil Deshpande', city: 'Mumbai', volumeM3: 3800, weightKg: 180000, pallets: 500, bins: 4000, hours: '06:00 - 23:00', status: 'ACTIVE', workingDays: 'Mon-Sun' },
  { id: 'wh-qua-mum', code: 'WH-QUA-MUM', name: 'Quarantine Warehouse', type: 'QUARANTINE', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Priya Nair', city: 'Mumbai', volumeM3: 800, weightKg: 40000, pallets: 100, bins: 800, hours: '08:00 - 20:00', status: 'ACTIVE', workingDays: 'Mon-Fri' },
  { id: 'wh-ret-mum-dc', code: 'WH-RET-MUM-DC', name: 'Returns Warehouse', type: 'RETURNS', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai DC', manager: 'Vikas Shetty', city: 'Bhiwandi', volumeM3: 1200, weightKg: 60000, pallets: 150, bins: 1200, hours: '09:00 - 18:00', status: 'ACTIVE', workingDays: 'Mon-Sat' },
  { id: 'wh-scr-mum-dc', code: 'WH-SCR-MUM-DC', name: 'Scrap Warehouse', type: 'SCRAP', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai DC', manager: 'Mahesh Iyer', city: 'Bhiwandi', volumeM3: 500, weightKg: 25000, pallets: 60, bins: 480, hours: '09:00 - 17:00', status: 'MAINTENANCE', workingDays: 'Mon-Fri' },
]

const WHM_ZONES = [
  { id: 'zn-001', code: 'Z-RM-01', name: 'Receiving Zone', type: 'RECEIVING', warehouse: 'WH-RM-MUM', parentZone: '—', tempZone: '—', volumeM3: 400, weightKg: 30000, pallets: 50, bins: 100, restricted: false, status: 'ACTIVE' },
  { id: 'zn-002', code: 'Z-RM-02', name: 'Putaway Zone', type: 'PUTAWAY', warehouse: 'WH-RM-MUM', parentZone: 'Z-RM-01', tempZone: '—', volumeM3: 200, weightKg: 15000, pallets: 25, bins: 50, restricted: false, status: 'ACTIVE' },
  { id: 'zn-003', code: 'Z-RM-03', name: 'Storage Zone-Ambient', type: 'STORAGE', warehouse: 'WH-RM-MUM', parentZone: '—', tempZone: 'TZ-AMB-01 (AMBIENT)', volumeM3: 2400, weightKg: 180000, pallets: 320, bins: 2560, restricted: false, status: 'ACTIVE' },
  { id: 'zn-004', code: 'Z-RM-04', name: 'Storage Zone-Cold', type: 'STORAGE', warehouse: 'WH-RM-MUM', parentZone: '—', tempZone: 'TZ-CHL-01 (CHILLED)', volumeM3: 800, weightKg: 30000, pallets: 100, bins: 800, restricted: true, status: 'ACTIVE' },
  { id: 'zn-005', code: 'Z-FG-01', name: 'Picking Zone', type: 'PICKING', warehouse: 'WH-FG-MUM', parentZone: '—', tempZone: '—', volumeM3: 600, weightKg: 24000, pallets: 80, bins: 800, restricted: false, status: 'ACTIVE' },
  { id: 'zn-006', code: 'Z-FG-02', name: 'Packing Zone', type: 'PACKING', warehouse: 'WH-FG-MUM', parentZone: '—', tempZone: '—', volumeM3: 400, weightKg: 16000, pallets: 50, bins: 200, restricted: false, status: 'ACTIVE' },
  { id: 'zn-007', code: 'Z-FG-03', name: 'Dispatch Zone', type: 'DISPATCH', warehouse: 'WH-FG-MUM', parentZone: '—', tempZone: '—', volumeM3: 500, weightKg: 20000, pallets: 70, bins: 100, restricted: false, status: 'ACTIVE' },
  { id: 'zn-008', code: 'Z-QU-01', name: 'Quarantine Zone', type: 'QUARANTINE', warehouse: 'WH-QUA-MUM', parentZone: '—', tempZone: '—', volumeM3: 600, weightKg: 30000, pallets: 80, bins: 600, restricted: true, status: 'ACTIVE' },
  { id: 'zn-009', code: 'Z-QU-02', name: 'Quality Inspection Zone', type: 'QUALITY_INSPECTION', warehouse: 'WH-QUA-MUM', parentZone: 'Z-QU-01', tempZone: '—', volumeM3: 200, weightKg: 10000, pallets: 20, bins: 40, restricted: true, status: 'ACTIVE' },
  { id: 'zn-010', code: 'Z-RT-01', name: 'Damaged Goods Zone', type: 'DAMAGED_GOODS', warehouse: 'WH-RET-MUM-DC', parentZone: '—', tempZone: '—', volumeM3: 300, weightKg: 15000, pallets: 40, bins: 200, restricted: true, status: 'ACTIVE' },
]

const WHM_TEMP_ZONES = [
  { id: 'tz-001', code: 'TZ-AMB-01', name: 'Ambient Storage', type: 'AMBIENT', warehouse: 'WH-RM-MUM', minTemp: 15.0, maxTemp: 30.0, targetTemp: 22.0, minHum: 30.0, maxHum: 60.0, lastReading: 23.5, lastReadingAt: '09 Jul 07:45', alert: false, monitoring: 'ACTIVE' },
  { id: 'tz-002', code: 'TZ-CHL-01', name: 'Chilled Storage (Perishables)', type: 'CHILLED', warehouse: 'WH-RM-MUM', minTemp: 2.0, maxTemp: 8.0, targetTemp: 4.0, minHum: 50.0, maxHum: 75.0, lastReading: 9.4, lastReadingAt: '09 Jul 07:50', alert: true, monitoring: 'ACTIVE' },
  { id: 'tz-003', code: 'TZ-FRZ-01', name: 'Frozen Storage (Ice Cream Line)', type: 'FROZEN', warehouse: 'WH-FG-MUM', minTemp: -25.0, maxTemp: -18.0, targetTemp: -22.0, minHum: 40.0, maxHum: 60.0, lastReading: -21.8, lastReadingAt: '09 Jul 07:55', alert: false, monitoring: 'ACTIVE' },
  { id: 'tz-004', code: 'TZ-HUM-01', name: 'Humidity-Controlled Storage (Dry Sweets)', type: 'HUMIDITY_CONTROLLED', warehouse: 'WH-FG-MUM', minTemp: 18.0, maxTemp: 25.0, targetTemp: 20.0, minHum: 35.0, maxHum: 50.0, lastReading: 21.4, lastReadingAt: '09 Jul 08:00', alert: true, monitoring: 'ACTIVE' },
]

const WHM_RULES = [
  { id: 'wr-001', code: 'MAX_BIN_WEIGHT', name: 'Maximum Bin Weight', type: 'MAX_BIN_WEIGHT', value: '25', unit: 'KG', enforcement: 'BLOCK', warehouse: 'WH-RM-MUM', desc: 'No single bin may hold more than 25 kg of stock to prevent structural damage & ergonomic injury.' },
  { id: 'wr-002', code: 'FEFO_ENABLED', name: 'FEFO Picking Enforced', type: 'FEFO_ENABLED', value: 'true', unit: 'BOOLEAN', enforcement: 'BLOCK', warehouse: 'WH-FG-MUM', desc: 'Picking must follow First-Expired-First-Out across all FG bins. Non-FEFO picks are blocked.' },
  { id: 'wr-003', code: 'BARCODE_MANDATORY', name: 'Barcode Scan Mandatory', type: 'BARCODE_MANDATORY', value: 'true', unit: 'BOOLEAN', enforcement: 'WARN', warehouse: 'WH-RM-MUM', desc: 'Every receive/putaway/pick/dispatch must scan barcode. Manual entry triggers a warning.' },
  { id: 'wr-004', code: 'QUALITY_INSPECTION_REQUIRED', name: 'Quality Inspection Required', type: 'QUALITY_INSPECTION_REQUIRED', value: 'true', unit: 'BOOLEAN', enforcement: 'BLOCK', warehouse: 'WH-QUA-MUM', desc: 'All inbound & returned stock must pass QA inspection before release to storage.' },
  { id: 'wr-005', code: 'MAX_STACK_HEIGHT', name: 'Maximum Pallet Stack Height', type: 'MAX_STACK_HEIGHT', value: '2.4', unit: 'M', enforcement: 'WARN', warehouse: 'WH-FG-MUM', desc: 'Pallet stack may not exceed 2.4 m to comply with ceiling clearance & forklift safety.' },
]

const WHM_RECOMMENDED = [
  { code: 'WH-RM-MUM', name: 'Raw Material Warehouse', type: 'RAW_MATERIAL', purpose: 'Inbound raw materials (cashew, sugar, ghee, flour) for Mumbai plant. FEFO + quarantine enforced.' },
  { code: 'WH-PKG-MUM', name: 'Packaging Warehouse', type: 'PACKAGING', purpose: 'Packaging materials (printed boxes, films, labels, pouches). Bulk storage with barcode tracking.' },
  { code: 'WH-FG-MUM', name: 'Finished Goods Warehouse', type: 'FINISHED_GOODS', purpose: 'Finished sweets & namkeen awaiting dispatch to DCs. FEFO strictly enforced.' },
  { code: 'WH-QUA-MUM', name: 'Quarantine Warehouse', type: 'QUARANTINE', purpose: 'Holds inbound RM & FG awaiting QA release. Auto-release on pass, scrap on fail.' },
  { code: 'WH-RET-MUM-DC', name: 'Returns Warehouse', type: 'RETURNS', purpose: 'Customer returns from Mumbai DC. Sorted by reason, routed to scrap/quarantine/restock.' },
  { code: 'WH-SCR-MUM-DC', name: 'Scrap Warehouse', type: 'SCRAP', purpose: 'Expired, damaged, recalled & condemned stock pending disposal. Requires finance approval.' },
]
