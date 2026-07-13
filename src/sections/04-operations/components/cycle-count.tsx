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

export function CycleCountModule() {
  const [tab, setTab] = useState<CycleCountTab>('overview')
  const tabs: Array<{ key: CycleCountTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'physical', label: 'Physical Counts', icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: 'plans', label: 'Cycle Plans', icon: <ListChecks className="h-4 w-4" /> },
    { key: 'variances', label: 'Variances', icon: <AlertTriangle className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ClipboardCheck className="h-7 w-7" /> Cycle Count &amp; Audit Engine
            </h2>
            <p className="text-teal-200 text-sm max-w-3xl">
              Physical inventory, cycle counts, count teams, and variance management. 8 count types
              (Annual, Cycle, Blind, Spot, ABC, Random, Bin, Investigation), 4 ABC-strategy plans,
              6 variance types, and team-based execution with recount workflows.
            </p>
          </div>
          <Badge className="bg-emerald-500 text-emerald-950 hover:bg-emerald-500">Sprint 18</Badge>
        </div>
      </Card>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">New cycle-count/ module</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <CycleCountOverviewTab />}
      {tab === 'physical' && <PhysicalCountsTab />}
      {tab === 'plans' && <CyclePlansTab />}
      {tab === 'variances' && <CountVariancesTab />}
    </div>
  )
}

function CycleCountOverviewTab() {
  const stats = [
    { label: 'Total Counts', value: '8', sub: '3 COMPLETED · 2 IN PROGRESS · 1 PENDING_APPROVAL', icon: <ClipboardCheck className="h-5 w-5 text-emerald-600" /> },
    { label: 'In Progress', value: '2', sub: 'PI-2026-0001 + PI-2026-0006', icon: <Activity className="h-5 w-5 text-blue-600" /> },
    { label: 'Completed', value: '3', sub: 'PI-2026-0002 · 0005 · 0007', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
    { label: 'Avg Accuracy %', value: '97.93%', sub: 'across 8 counts · target ≥ 99%', icon: <Percent className="h-5 w-5 text-amber-600" /> },
    { label: 'Variance Value', value: '−₹71,900', sub: 'net negative — primarily Kaju Katli', icon: <TrendingDown className="h-5 w-5 text-red-600" /> },
    { label: 'Recount Required', value: '1', sub: 'PI-2026-0008 — 35 units missing', icon: <AlertTriangle className="h-5 w-5 text-orange-600" /> },
    { label: 'Count Teams', value: '3', sub: 'ALPHA · BRAVO · CHARLIE — 11 members', icon: <Users2 className="h-5 w-5 text-purple-600" /> },
    { label: 'Cycle Plans', value: '4', sub: 'DAILY · WEEKLY · MONTHLY · QUARTERLY', icon: <ListChecks className="h-5 w-5 text-cyan-600" /> },
  ]
  const flowSteps = [
    { n: 1, label: 'Schedule Count', detail: 'Cycle plan auto-generates physical inventory header with team + warehouse', color: 'text-blue-600' },
    { n: 2, label: 'Generate Count Sheets', detail: 'System pulls onHand qty from ledger + creates count lines per bin/batch', color: 'text-cyan-600' },
    { n: 3, label: 'Execute Count', detail: 'Team counts physical stock — blind count hides system qty to avoid bias', color: 'text-amber-600' },
    { n: 4, label: 'Enter Counted Qty', detail: 'Counted qty recorded per line — variance auto-calculated vs system', color: 'text-orange-600' },
    { n: 5, label: 'Variance Detection', detail: 'Variance &gt; threshold triggers investigation; recount for high-value misses', color: 'text-red-600' },
    { n: 6, label: 'Root Cause Analysis', detail: 'Identify MISSING / EXTRA / WRONG_LOCATION / WRONG_BATCH / WRONG_UOM / WRONG_PRODUCT', color: 'text-rose-600' },
    { n: 7, label: 'Approval & Adjustment', detail: 'Supervisor / Warehouse Mgr / Finance approves — stock adjustment posted to ledger', color: 'text-purple-600' },
    { n: 8, label: 'Audit Trail', detail: 'Count → Variance → Approval → Adjustment chain recorded for audit compliance', color: 'text-emerald-600' },
  ]
  const abcStrategy = [
    { class: 'A', description: 'High-value items (top 20% revenue)', frequency: 'DAILY', itemsPerCycle: 25, accuracyTarget: 99.5, itemsTracked: 250 },
    { class: 'B', description: 'Medium-value items (next 30% revenue)', frequency: 'WEEKLY', itemsPerCycle: 50, accuracyTarget: 99.0, itemsTracked: 400 },
    { class: 'C', description: 'Low-value items (bottom 50% revenue)', frequency: 'YEARLY', itemsPerCycle: 100, accuracyTarget: 98.0, itemsTracked: 800 },
  ]
  const classColor: Record<string, string> = {
    A: 'bg-red-100 text-red-800',
    B: 'bg-amber-100 text-amber-800',
    C: 'bg-emerald-100 text-emerald-800',
  }
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Count Execution Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 8 count types: ANNUAL_COUNT, CYCLE_COUNT, BLIND_COUNT, SPOT_COUNT, ABC_COUNT, RANDOM_COUNT, BIN_COUNT, INVESTIGATION_COUNT</p>
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
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ListChecks className="h-5 w-5" /> ABC Strategy — Count Frequency Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3 font-medium text-muted-foreground">ABC Class</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Description</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Count Frequency</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Items / Cycle</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Accuracy Target</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Items Tracked</th>
              </tr>
            </thead>
            <tbody>
              {abcStrategy.map(a => (
                <tr key={a.class} className="border-b last:border-0">
                  <td className="py-2 pr-3"><Badge className={classColor[a.class]}>Class {a.class}</Badge></td>
                  <td className="py-2 pr-3">{a.description}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">{a.frequency}</Badge></td>
                  <td className="py-2 pr-3 font-mono">{a.itemsPerCycle}</td>
                  <td className="py-2 pr-3 font-mono">{a.accuracyTarget}%</td>
                  <td className="py-2 pr-3 font-mono">{a.itemsTracked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function PhysicalCountsTab() {
  const counts = [
    { id: 'pi-001', countNumber: 'PI-2026-0001', countDate: '2026-07-09', countType: 'ANNUAL_COUNT', warehouseName: 'Mumbai DC', teamName: 'Alpha Count Team', totalLines: 480, countedLines: 412, systemQty: 18500, countedQty: 18350, varianceQty: -150, varianceValue: -42500, accuracyPct: 99.19, status: 'IN_PROGRESS', approvalLevel: 'WAREHOUSE_MANAGER' },
    { id: 'pi-002', countNumber: 'PI-2026-0002', countDate: '2026-07-08', countType: 'CYCLE_COUNT', warehouseName: 'Mumbai Plant Warehouse', teamName: 'Bravo Count Team', totalLines: 120, countedLines: 120, systemQty: 8400, countedQty: 8320, varianceQty: -80, varianceValue: -18400, accuracyPct: 99.05, status: 'COMPLETED', approvalLevel: 'SUPERVISOR' },
    { id: 'pi-003', countNumber: 'PI-2026-0003', countDate: '2026-07-09', countType: 'BLIND_COUNT', warehouseName: 'Mumbai DC', teamName: 'Charlie Count Team', totalLines: 45, countedLines: 45, systemQty: 920, countedQty: 935, varianceQty: 15, varianceValue: 9300, accuracyPct: 98.37, status: 'PENDING_APPROVAL', approvalLevel: 'FINANCE' },
    { id: 'pi-004', countNumber: 'PI-2026-0004', countDate: '2026-07-09', countType: 'SPOT_COUNT', warehouseName: 'Mumbai Retail Store 01', teamName: 'Alpha Count Team', totalLines: 12, countedLines: 12, systemQty: 280, countedQty: 265, varianceQty: -15, varianceValue: -4560, accuracyPct: 94.64, status: 'VARIANCE_INVESTIGATION', approvalLevel: 'SUPERVISOR' },
    { id: 'pi-005', countNumber: 'PI-2026-0005', countDate: '2026-07-07', countType: 'ABC_COUNT', warehouseName: 'Mumbai Plant Warehouse', teamName: 'Bravo Count Team', totalLines: 220, countedLines: 220, systemQty: 14200, countedQty: 14180, varianceQty: -20, varianceValue: -6800, accuracyPct: 99.86, status: 'COMPLETED', approvalLevel: 'SUPERVISOR' },
    { id: 'pi-006', countNumber: 'PI-2026-0006', countDate: '2026-07-09', countType: 'RANDOM_COUNT', warehouseName: 'Pune DC', teamName: 'Charlie Count Team', totalLines: 50, countedLines: 35, systemQty: 3100, countedQty: 3085, varianceQty: -15, varianceValue: -3250, accuracyPct: 99.52, status: 'IN_PROGRESS', approvalLevel: 'SUPERVISOR' },
    { id: 'pi-007', countNumber: 'PI-2026-0007', countDate: '2026-07-06', countType: 'BIN_COUNT', warehouseName: 'Mumbai DC', teamName: 'Alpha Count Team', totalLines: 85, countedLines: 85, systemQty: 6400, countedQty: 6380, varianceQty: -20, varianceValue: -8200, accuracyPct: 99.69, status: 'COMPLETED', approvalLevel: 'SUPERVISOR' },
    { id: 'pi-008', countNumber: 'PI-2026-0008', countDate: '2026-07-05', countType: 'INVESTIGATION_COUNT', warehouseName: 'Mumbai DC', teamName: 'Bravo Count Team', totalLines: 8, countedLines: 8, systemQty: 480, countedQty: 445, varianceQty: -35, varianceValue: -21000, accuracyPct: 92.71, status: 'RECOUNT_REQUIRED', approvalLevel: 'FINANCE' },
  ]
  const typeColor: Record<string, string> = {
    ANNUAL_COUNT: 'bg-blue-100 text-blue-800',
    CYCLE_COUNT: 'bg-cyan-100 text-cyan-800',
    BLIND_COUNT: 'bg-purple-100 text-purple-800',
    SPOT_COUNT: 'bg-amber-100 text-amber-800',
    ABC_COUNT: 'bg-emerald-100 text-emerald-800',
    RANDOM_COUNT: 'bg-rose-100 text-rose-800',
    BIN_COUNT: 'bg-indigo-100 text-indigo-800',
    INVESTIGATION_COUNT: 'bg-red-100 text-red-800',
  }
  const statusColor: Record<string, string> = {
    IN_PROGRESS: 'bg-blue-600 text-white',
    COMPLETED: 'bg-emerald-600 text-white',
    PENDING_APPROVAL: 'bg-amber-600 text-white',
    VARIANCE_INVESTIGATION: 'bg-orange-600 text-white',
    RECOUNT_REQUIRED: 'bg-red-600 text-white',
    APPROVED: 'bg-emerald-700 text-white',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Physical Inventory Counts</h3>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" />New Count</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">Count #</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Date</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Type</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Warehouse</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Team</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">System Qty</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Counted Qty</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Variance</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Accuracy</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {counts.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 pr-3 font-mono">{c.countNumber}</td>
                <td className="py-2 pr-3 text-xs">{c.countDate}</td>
                <td className="py-2 pr-3"><Badge className={typeColor[c.countType]}>{c.countType.replace('_', ' ')}</Badge></td>
                <td className="py-2 pr-3 text-xs">{c.warehouseName}</td>
                <td className="py-2 pr-3 text-xs">{c.teamName}</td>
                <td className="py-2 pr-3 text-right font-mono">{c.systemQty.toLocaleString()}</td>
                <td className="py-2 pr-3 text-right font-mono">{c.countedQty.toLocaleString()}</td>
                <td className={cn('py-2 pr-3 text-right font-mono font-semibold', c.varianceQty < 0 ? 'text-red-600' : c.varianceQty > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
                  {c.varianceQty > 0 ? '+' : ''}{c.varianceQty}
                  <span className="block text-xs font-normal text-muted-foreground">₹{c.varianceValue.toLocaleString('en-IN')}</span>
                </td>
                <td className={cn('py-2 pr-3 text-right font-mono', c.accuracyPct >= 99 ? 'text-emerald-600' : c.accuracyPct >= 95 ? 'text-amber-600' : 'text-red-600')}>{c.accuracyPct}%</td>
                <td className="py-2 pr-3"><Badge className={statusColor[c.status]}>{c.status.replace('_', ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function CyclePlansTab() {
  const plans = [
    { id: 'ccp-001', planCode: 'CC-DAILY-A', planName: 'Daily Cycle Count — Category A', frequency: 'DAILY', abcClass: 'A', itemsPerCycle: 25, varianceThreshold: 0.5, recountTrigger: 1.0, nextRunDate: '2026-07-10', lastRunDate: '2026-07-09', avgAccuracy: 99.05, totalExecutions: 142, activeSchedules: 1, status: 'ACTIVE', strategy: 'High-value items counted daily — 25 SKUs per day covering entire Category A in ~10 days.' },
    { id: 'ccp-002', planCode: 'CC-WEEKLY-B', planName: 'Weekly Cycle Count — Category B', frequency: 'WEEKLY', abcClass: 'B', itemsPerCycle: 50, varianceThreshold: 1.0, recountTrigger: 2.0, nextRunDate: '2026-07-14', lastRunDate: '2026-07-07', avgAccuracy: 99.86, totalExecutions: 28, activeSchedules: 1, status: 'ACTIVE', strategy: 'Medium-value items counted weekly — 50 SKUs per week covering Category B in ~4 weeks.' },
    { id: 'ccp-003', planCode: 'CC-MONTHLY-C', planName: 'Monthly Cycle Count — Category C', frequency: 'MONTHLY', abcClass: 'C', itemsPerCycle: 100, varianceThreshold: 2.0, recountTrigger: 5.0, nextRunDate: '2026-07-31', lastRunDate: '2026-06-30', avgAccuracy: 98.42, totalExecutions: 6, activeSchedules: 1, status: 'ACTIVE', strategy: 'Low-value items counted monthly — 100 SKUs per cycle covering Category C quarterly.' },
    { id: 'ccp-004', planCode: 'CC-QTR-ALL', planName: 'Quarterly Full Warehouse Count', frequency: 'QUARTERLY', abcClass: 'ALL', itemsPerCycle: 480, varianceThreshold: 1.0, recountTrigger: 3.0, nextRunDate: '2026-10-01', lastRunDate: '2026-07-09', avgAccuracy: 99.19, totalExecutions: 4, activeSchedules: 1, status: 'ACTIVE', strategy: 'Full warehouse count once per quarter — covers all categories including slow-moving items.' },
  ]
  const freqColor: Record<string, string> = {
    DAILY: 'bg-blue-100 text-blue-800',
    WEEKLY: 'bg-cyan-100 text-cyan-800',
    MONTHLY: 'bg-amber-100 text-amber-800',
    QUARTERLY: 'bg-purple-100 text-purple-800',
    YEARLY: 'bg-emerald-100 text-emerald-800',
  }
  const classColor: Record<string, string> = {
    A: 'bg-red-100 text-red-800',
    B: 'bg-amber-100 text-amber-800',
    C: 'bg-emerald-100 text-emerald-800',
    ALL: 'bg-slate-100 text-slate-800',
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map(p => (
        <Card key={p.id} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{p.planCode}</p>
              <h4 className="font-semibold">{p.planName}</h4>
            </div>
            <Badge className="bg-emerald-600 text-white">{p.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={freqColor[p.frequency]}>{p.frequency}</Badge>
            <Badge className={classColor[p.abcClass]}>ABC Class {p.abcClass}</Badge>
            <Badge variant="outline">{p.itemsPerCycle} items/cycle</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{p.strategy}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground">Variance Threshold</p>
              <p className="font-mono font-semibold">{p.varianceThreshold}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Recount Trigger</p>
              <p className="font-mono font-semibold text-orange-600">{p.recountTrigger}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Avg Accuracy</p>
              <p className={cn('font-mono font-semibold', p.avgAccuracy >= 99 ? 'text-emerald-600' : 'text-amber-600')}>{p.avgAccuracy}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Executions</p>
              <p className="font-mono font-semibold">{p.totalExecutions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Last Run</p>
              <p className="font-mono">{p.lastRunDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Next Run</p>
              <p className="font-mono font-semibold text-blue-600">{p.nextRunDate}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{p.activeSchedules} active schedule{p.activeSchedules !== 1 ? 's' : ''}</span>
            <Button size="sm" variant="outline"><Calendar className="mr-1 h-3 w-3" />View Schedules</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function CountVariancesTab() {
  const variances = [
    { id: 'cv-001', varianceNumber: 'VAR-2026-0001', countNumber: 'PI-2026-0008', productName: 'Kaju Katli 500g', warehouseName: 'Mumbai DC', binLocation: 'BIN-B-04', batchNumber: 'KK-2606-08', varianceType: 'MISSING', systemQty: 480, countedQty: 445, varianceQty: -35, unitCost: 600, varianceValue: -21000, rootCause: 'SUSPECTED_THEFT', investigationStatus: 'IN_PROGRESS', resolutionStatus: 'PENDING_RECOUNT', assignedTo: 'Anita Desai', identifiedAt: '2026-07-05 12:30', notes: '35 units missing — high-value item. CCTV review in progress. Recount ordered.' },
    { id: 'cv-002', varianceNumber: 'VAR-2026-0002', countNumber: 'PI-2026-0003', productName: 'Kaju Katli 500g', warehouseName: 'Mumbai DC', binLocation: 'BIN-A-12', batchNumber: 'KK-2607-01', varianceType: 'EXTRA', systemQty: 200, countedQty: 215, varianceQty: 15, unitCost: 600, varianceValue: 9000, rootCause: 'UNRECORDED_RECEIPT', investigationStatus: 'COMPLETED', resolutionStatus: 'ADJUSTMENT_POSTED', assignedTo: 'Vikram Iyer', identifiedAt: '2026-07-09 11:15', notes: '15 extra units — traced to GRN-2026-0512 not yet posted to bin. Stock receipt confirmed.' },
    { id: 'cv-003', varianceNumber: 'VAR-2026-0003', countNumber: 'PI-2026-0007', productName: 'Soan Cake 1kg', warehouseName: 'Mumbai DC', binLocation: 'BIN-C-08', batchNumber: 'SC-2606-12', varianceType: 'WRONG_LOCATION', systemQty: 60, countedQty: 0, varianceQty: -60, unitCost: 625, varianceValue: -37500, rootCause: 'PUTAWAY_ERROR', investigationStatus: 'COMPLETED', resolutionStatus: 'RELOCATED', assignedTo: 'Anita Desai', identifiedAt: '2026-07-06 15:20', notes: '60 units not in BIN-C-08 — found in adjacent BIN-C-09. Putaway operator error during reorganization.' },
    { id: 'cv-004', varianceNumber: 'VAR-2026-0004', countNumber: 'PI-2026-0002', productName: 'Ghee (Raw)', warehouseName: 'Mumbai Plant Warehouse', binLocation: 'BIN-RM-02', batchNumber: 'GHEE-2606-A', varianceType: 'WRONG_BATCH', systemQty: 80, countedQty: 78, varianceQty: -2, unitCost: 520, varianceValue: -1040, rootCause: 'BATCH_MIXING', investigationStatus: 'COMPLETED', resolutionStatus: 'BATCH_CORRECTED', assignedTo: 'Ramesh Yadav', identifiedAt: '2026-07-08 09:45', notes: '2 tins of GHEE-2606-A counted as GHEE-2606-B. Batch labels corrected in system.' },
    { id: 'cv-005', varianceNumber: 'VAR-2026-0005', countNumber: 'PI-2026-0005', productName: 'Sugar (Raw)', warehouseName: 'Mumbai Plant Warehouse', binLocation: 'BIN-RM-05', batchNumber: 'SUG-2606-01', varianceType: 'WRONG_UOM', systemQty: 1500, countedQty: 1480, varianceQty: -20, unitCost: 45, varianceValue: -900, rootCause: 'UOM_CONVERSION', investigationStatus: 'COMPLETED', resolutionStatus: 'UOM_RECALCULATED', assignedTo: 'Ramesh Yadav', identifiedAt: '2026-07-07 13:10', notes: '20 kg variance — system recorded in KG, physical count in bags. UOM conversion applied.' },
    { id: 'cv-006', varianceNumber: 'VAR-2026-0006', countNumber: 'PI-2026-0004', productName: 'Gulab Jamun 1kg', warehouseName: 'Mumbai Retail Store 01', binLocation: 'DISPLAY-BIN-A', batchNumber: 'GJ-2607-03', varianceType: 'WRONG_PRODUCT', systemQty: 80, countedQty: 65, varianceQty: -15, unitCost: 304, varianceValue: -4560, rootCause: 'MISIDENTIFICATION', investigationStatus: 'COMPLETED', resolutionStatus: 'CORRECTED', assignedTo: 'Anita Desai', identifiedAt: '2026-07-09 14:35', notes: '15 boxes were Kala Jamun mislabeled as Gulab Jamun. Product master updated, POS label corrected.' },
  ]
  const varianceColor: Record<string, string> = {
    MISSING: 'bg-red-100 text-red-800 border-red-200',
    EXTRA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    WRONG_LOCATION: 'bg-amber-100 text-amber-800 border-amber-200',
    WRONG_BATCH: 'bg-orange-100 text-orange-800 border-orange-200',
    WRONG_UOM: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    WRONG_PRODUCT: 'bg-purple-100 text-purple-800 border-purple-200',
  }
  const resolutionColor: Record<string, string> = {
    PENDING_RECOUNT: 'bg-red-600 text-white',
    ADJUSTMENT_POSTED: 'bg-emerald-600 text-white',
    RELOCATED: 'bg-blue-600 text-white',
    BATCH_CORRECTED: 'bg-cyan-600 text-white',
    UOM_RECALCULATED: 'bg-teal-600 text-white',
    CORRECTED: 'bg-emerald-600 text-white',
    WRITTEN_OFF: 'bg-slate-600 text-white',
    CLOSED: 'bg-slate-600 text-white',
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {variances.map(v => (
        <Card key={v.id} className={cn('p-5 border-l-4', v.varianceType === 'MISSING' ? 'border-l-red-500' : v.varianceType === 'EXTRA' ? 'border-l-emerald-500' : v.varianceType === 'WRONG_LOCATION' ? 'border-l-amber-500' : v.varianceType === 'WRONG_BATCH' ? 'border-l-orange-500' : v.varianceType === 'WRONG_UOM' ? 'border-l-cyan-500' : 'border-l-purple-500')}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{v.varianceNumber} · {v.countNumber}</p>
              <h4 className="font-semibold">{v.productName}</h4>
            </div>
            <Badge className={varianceColor[v.varianceType]}>{v.varianceType.replace('_', ' ')}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">System</p>
              <p className="font-mono font-semibold">{v.systemQty}</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Counted</p>
              <p className="font-mono font-semibold">{v.countedQty}</p>
            </div>
            <div className={cn('text-center p-2 rounded', v.varianceQty < 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30')}>
              <p className="text-muted-foreground">Variance</p>
              <p className={cn('font-mono font-bold', v.varianceQty < 0 ? 'text-red-600' : 'text-emerald-600')}>{v.varianceQty > 0 ? '+' : ''}{v.varianceQty}</p>
            </div>
          </div>
          <div className="space-y-1 text-xs mb-3">
            <p className="flex justify-between"><span className="text-muted-foreground">Variance Value:</span><span className={cn('font-mono font-semibold', v.varianceValue < 0 ? 'text-red-600' : 'text-emerald-600')}>₹{v.varianceValue.toLocaleString('en-IN')}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Warehouse / Bin:</span><span className="font-mono">{v.warehouseName} · {v.binLocation}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Batch:</span><span className="font-mono">{v.batchNumber}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Root Cause:</span><span className="font-semibold">{v.rootCause.replace(/_/g, ' ')}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Assigned To:</span><span>{v.assignedTo}</span></p>
          </div>
          <p className="text-xs text-muted-foreground italic mb-3">&quot;{v.notes}&quot;</p>
          <div className="pt-3 border-t flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">{v.investigationStatus}</Badge>
              <Badge className={resolutionColor[v.resolutionStatus]}>{v.resolutionStatus.replace(/_/g, ' ')}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{v.identifiedAt}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Batch & Expiry Management Module (Sprint 19) ───────
type BatchTab = 'overview' | 'batches' | 'alerts' | 'recalls' | 'genealogy'
