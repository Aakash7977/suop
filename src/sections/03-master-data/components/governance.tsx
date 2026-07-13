/**
 * Section 03 — Master Data Management
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 *
 * This file was extracted verbatim from page.tsx and wrapped with proper
 * TypeScript imports so it can live outside the monolithic file.
 * The original JSX structure, classes, colors, icons, and layout are
 * preserved 1:1 so the rendered UI is pixel-identical.
 *
 * Wire-up layer (live API calls, loading/error states, permission gating)
 * is added incrementally — see Git history for evolution.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, UtensilsCrossed as UtensilsCrossedIcon, DollarSign,
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
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice, FileSearch,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
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
import { s28BadgeForStatus } from '../utils/helpers'
import { toast } from '@/hooks/use-toast'

type GovTab = 'overview' | 'lifecycle' | 'approvals' | 'import' | 'export' | 'validation' | 'duplicates' | 'audit' | 'quality' | 'history'

export function GovernanceModule() {
  const [tab, setTab] = useState<GovTab>('overview')
  const tabs: Array<{ key: GovTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'lifecycle', label: 'Lifecycle', icon: <Workflow className="h-4 w-4" /> },
    { key: 'approvals', label: 'Approvals', icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'import', label: 'Import', icon: <UploadCloud className="h-4 w-4" /> },
    { key: 'export', label: 'Export', icon: <DownloadCloud className="h-4 w-4" /> },
    { key: 'validation', label: 'Validation', icon: <ListChecks className="h-4 w-4" /> },
    { key: 'duplicates', label: 'Duplicates', icon: <GitMerge className="h-4 w-4" /> },
    { key: 'audit', label: 'Audit Trail', icon: <HistoryIcon className="h-4 w-4" /> },
    { key: 'quality', label: 'Quality', icon: <ShieldAlert className="h-4 w-4" /> },
    { key: 'history', label: 'Change History', icon: <History className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-violet-950 via-purple-900 to-fuchsia-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Data Governance & Master Data Quality
            </h2>
            <p className="text-violet-200 text-sm max-w-3xl">
              Enterprise-grade governance: product lifecycle enforcement, multi-level approval workflows,
              bulk import/export with rollback, validation framework, duplicate detection & merge,
              complete audit trail, and real-time data quality scoring.
            </p>
          </div>
          <Badge className="bg-violet-500 text-violet-950 hover:bg-violet-500">Sprint 11 · Part 2 ✓</Badge>
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

      {tab === 'overview' && <GovOverviewTab />}
      {tab === 'lifecycle' && <GovLifecycleTab />}
      {tab === 'approvals' && <GovApprovalsTab />}
      {tab === 'import' && <GovImportTab />}
      {tab === 'export' && <GovExportTab />}
      {tab === 'validation' && <GovValidationTab />}
      {tab === 'duplicates' && <GovDuplicatesTab />}
      {tab === 'audit' && <GovAuditTab />}
      {tab === 'quality' && <GovQualityTab />}
      {tab === 'history' && <GovHistoryTab />}
    </div>
  )
}

function GovOverviewTab() {
  const stats = [
    { label: 'Active Products', value: '2', sub: 'In ACTIVE lifecycle state', icon: <Package className="h-5 w-5 text-emerald-600" /> },
    { label: 'Pending Approvals', value: '2', sub: '1 IN_REVIEW · 1 PENDING', icon: <ClipboardList className="h-5 w-5 text-amber-600" /> },
    { label: 'SLA Breached', value: '1', sub: 'Old Laddu (rejected)', icon: <AlertOctagon className="h-5 w-5 text-red-600" /> },
    { label: 'Import Jobs', value: '5', sub: '2 COMPLETED · 1 ROLLBACK', icon: <UploadCloud className="h-5 w-5 text-blue-600" /> },
    { label: 'Export Jobs', value: '4', sub: '3 COMPLETED · 1 EXPORTING', icon: <DownloadCloud className="h-5 w-5 text-purple-600" /> },
    { label: 'Validation Rules', value: '10', sub: 'All ACTIVE', icon: <ListChecks className="h-5 w-5 text-teal-600" /> },
    { label: 'Pending Duplicates', value: '2', sub: 'Need resolution', icon: <GitMerge className="h-5 w-5 text-pink-600" /> },
    { label: 'Audit Entries', value: '8', sub: 'Full trail', icon: <HistoryIcon className="h-5 w-5 text-indigo-600" /> },
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
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><Gauge className="h-5 w-5 text-emerald-600" /> Overall Data Quality Score</h3>
            <p className="text-xs text-muted-foreground mt-1">Aggregated across 9 product metrics + 3 business partner metrics</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-emerald-600">91.6</p>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 mt-1">Grade A</Badge>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Completeness</p><p className="font-bold text-emerald-600">87.5%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Accuracy</p><p className="font-bold text-emerald-600">94.2%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Consistency</p><p className="font-bold text-emerald-600">91.8%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Duplicate Rate</p><p className="font-bold text-emerald-600">2.3%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Approval SLA</p><p className="font-bold text-amber-600">88.0%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Validation Errors</p><p className="font-bold text-amber-600">47</p></div>
        </div>
      </Card>
      <Card className="p-6 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-violet-600" /> Part 2 — Enterprise Master Data Platform: COMPLETE</h3>
        <p className="text-sm text-muted-foreground mb-3">All 11 sprints of Part 2 are done. The foundation is finished:</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {[
            'Sprint 6: Product Foundation',
            'Sprint 7: PIM Platform',
            'Sprint 8: Commercial Engine',
            'Sprint 9: Business Partner Platform',
            'Sprint 10: Identification & Traceability',
            'Sprint 11: Data Governance & Quality',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 p-2 rounded bg-background">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Next: Part 3 — Enterprise Inventory Engine (10 sprints) begins the actual ERP transaction layer.</p>
      </Card>
    </div>
  )
}

function GovLifecycleTab() {
  const lifecycles = [
    { id: 'plc-001', product: 'Kaju Katli 500g', state: 'ACTIVE', prev: 'PUBLISHED', submitted: '2026-06-15', approved: '2026-06-18', published: '2026-06-20', activated: '2026-06-20', reason: null, transitions: 4 },
    { id: 'plc-002', product: 'Kaju Katli 250g', state: 'UNDER_REVIEW', prev: 'DRAFT', submitted: '2026-07-08', approved: null, published: null, reason: 'Pending QA review', transitions: 1 },
    { id: 'plc-003', product: 'Soan Cake 1kg', state: 'ACTIVE', prev: 'PUBLISHED', submitted: '2026-05-10', approved: '2026-05-12', published: '2026-05-15', activated: '2026-05-15', reason: null, transitions: 4 },
    { id: 'plc-004', product: 'Mixed Namkeen 200g', state: 'APPROVED', prev: 'UNDER_REVIEW', submitted: '2026-07-05', approved: '2026-07-07', published: null, reason: 'Awaiting publish', transitions: 2 },
    { id: 'plc-005', product: 'Gulab Jamun 1kg', state: 'INACTIVE', prev: 'ACTIVE', submitted: '2026-04-01', approved: '2026-04-03', published: '2026-04-05', activated: '2026-04-05', reason: 'Seasonal - summer off-season', transitions: 5 },
    { id: 'plc-006', product: 'Diwali Gift Hampers 2026', state: 'DRAFT', prev: null, submitted: null, approved: null, published: null, reason: 'New product in design', transitions: 0 },
    { id: 'plc-007', product: 'Old Recipe Laddu 500g', state: 'ARCHIVED', prev: 'DISCONTINUED', reason: 'Recipe discontinued, replaced by new formulation', transitions: 6 },
    { id: 'plc-008', product: 'Pista Roll 250g', state: 'DISCONTINUED', prev: 'INACTIVE', reason: 'Low demand', transitions: 5 },
  ]
  const stateColor: Record<string, string> = {
    DRAFT: 'bg-slate-500 hover:bg-slate-500', UNDER_REVIEW: 'bg-amber-500 hover:bg-amber-500',
    APPROVED: 'bg-blue-600 hover:bg-blue-600', PUBLISHED: 'bg-indigo-600 hover:bg-indigo-600',
    ACTIVE: 'bg-emerald-600 hover:bg-emerald-600', INACTIVE: 'bg-gray-600 hover:bg-gray-600',
    DISCONTINUED: 'bg-orange-600 hover:bg-orange-600', ARCHIVED: 'bg-red-700 hover:bg-red-700',
  }
  const states = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED']
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Product Lifecycle Management</h3>
        <p className="text-xs text-muted-foreground mt-1">8 lifecycle states enforced. Every transition recorded with timestamp, actor, and reason. Archived products cannot be edited.</p></div>
        <Button size="sm"><Workflow className="mr-1 h-4 w-4" /> Transition</Button>
      </div>
      <div className="mb-4 flex items-center gap-1 text-xs overflow-x-auto pb-2">
        {states.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className="px-2 py-1 rounded border bg-muted/40 font-mono whitespace-nowrap">{s.replace(/_/g, ' ')}</div>
            {i < states.length - 1 && <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th><th className="font-medium">Current State</th>
            <th className="font-medium">Previous</th><th className="font-medium">Submitted</th>
            <th className="font-medium">Approved</th><th className="font-medium">Published</th>
            <th className="font-medium">Transitions</th><th className="font-medium">Reason</th>
          </tr></thead>
          <tbody>
            {lifecycles.map(l => (
              <tr key={l.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{l.product}</td>
                <td><Badge className={stateColor[l.state] + ' text-xs'}>{l.state.replace(/_/g, ' ')}</Badge></td>
                <td className="text-xs text-muted-foreground">{l.prev ? l.prev.replace(/_/g, ' ') : '—'}</td>
                <td className="text-xs text-muted-foreground">{l.submitted || '—'}</td>
                <td className="text-xs text-muted-foreground">{l.approved || '—'}</td>
                <td className="text-xs text-muted-foreground">{l.published || '—'}</td>
                <td className="text-center font-mono">{l.transitions}</td>
                <td className="text-xs text-muted-foreground max-w-xs truncate">{l.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GovApprovalsTab() {
  const workflows = [
    { id: 'awf-001', product: 'Kaju Katli 250g', type: 'STANDARD', stage: 'QA', status: 'IN_REVIEW', sla: '2026-07-12', breached: false, steps: 6, completed: 2 },
    { id: 'awf-002', product: 'Mixed Namkeen 200g', type: 'STANDARD', stage: 'PUBLISHER', status: 'IN_REVIEW', sla: '2026-07-09', breached: false, steps: 6, completed: 5 },
    { id: 'awf-003', product: 'Diwali Gift Hampers 2026', type: 'PARALLEL', stage: 'CREATOR', status: 'PENDING', sla: '2026-08-15', breached: false, steps: 6, completed: 0 },
    { id: 'awf-004', product: 'Pista Roll 250g', type: 'CONDITIONAL', stage: 'COMPLETED', status: 'PUBLISHED', sla: '2025-10-15', breached: false, steps: 4, completed: 4 },
    { id: 'awf-005', product: 'Old Recipe Laddu 500g', type: 'STANDARD', stage: 'COMPLETED', status: 'REJECTED', sla: '2026-01-20', breached: true, steps: 3, completed: 3 },
  ]
  const stages = ['CREATOR', 'REVIEWER', 'QA', 'COMPLIANCE', 'FINANCE', 'PUBLISHER', 'COMPLETED']
  const statusColor: Record<string, string> = { PENDING: 'bg-amber-500 hover:bg-amber-500', IN_REVIEW: 'bg-blue-600 hover:bg-blue-600', PUBLISHED: 'bg-emerald-600 hover:bg-emerald-600', REJECTED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Product Approval Workflow</h3>
        <p className="text-xs text-muted-foreground mt-1">6-stage workflow: Creator → Reviewer → QA → Compliance → Finance (optional) → Publisher. Supports STANDARD, PARALLEL, and CONDITIONAL workflows with SLA tracking.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Workflow — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Workflow</Button>
      </div>
      <div className="mb-4 flex items-center gap-1 text-xs overflow-x-auto pb-2">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className="px-2 py-1 rounded border bg-muted/40 font-mono whitespace-nowrap">{s}</div>
            {i < stages.length - 1 && <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {workflows.map(w => {
          const progress = w.steps > 0 ? Math.round((w.completed / w.steps) * 100) : 0
          return (
            <div key={w.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{w.product}</p>
                    <Badge variant="outline" className="text-xs">{w.type}</Badge>
                    {w.breached && <Badge variant="destructive" className="text-xs">SLA BREACHED</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Current stage: <span className="font-mono font-medium text-foreground">{w.stage}</span> · SLA due: {w.sla}</p>
                </div>
                <Badge className={statusColor[w.status] + ' text-xs'}>{w.status.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div className={cn('h-full', w.status === 'PUBLISHED' ? 'bg-emerald-600' : w.status === 'REJECTED' ? 'bg-red-600' : 'bg-blue-600')} style={{ width: `${progress}%` }} />
                </div>
                <span className="font-mono font-medium">{w.completed} / {w.steps} steps ({progress}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function GovImportTab() {
  const jobs = [
    { id: 'ij-001', code: 'IMP-PROD-2026-0142', entity: 'PRODUCT', file: 'products_batch_july.xlsx', format: 'EXCEL', total: 250, success: 242, errors: 5, duplicates: 3, status: 'COMPLETED', initiated: '2026-07-08 10:00', completed: '2026-07-08 10:15' },
    { id: 'ij-002', code: 'IMP-BP-2026-0089', entity: 'BUSINESS_PARTNER', file: 'customers_import.csv', format: 'CSV', total: 500, success: 485, errors: 12, duplicates: 3, status: 'COMPLETED', initiated: '2026-07-07 14:00', completed: '2026-07-07 14:08' },
    { id: 'ij-003', code: 'IMP-PROD-2026-0143', entity: 'PRODUCT', file: 'new_sweets_catalog.xlsx', format: 'EXCEL', total: 0, success: 0, errors: 0, duplicates: 0, status: 'PREVIEWING', initiated: '2026-07-09 11:00', completed: null },
    { id: 'ij-004', code: 'IMP-PROD-2026-0140', entity: 'PRODUCT', file: 'faulty_import.xlsx', format: 'EXCEL', total: 100, success: 45, errors: 55, duplicates: 0, status: 'ROLLBACK', initiated: '2026-07-05 09:00', completed: '2026-07-05 09:10', rollbackReason: 'Excessive validation errors - rolled back per policy' },
    { id: 'ij-005', code: 'IMP-PRICE-2026-0034', entity: 'PRICE_LIST', file: 'price_update_august.csv', format: 'CSV', total: 0, success: 0, errors: 0, duplicates: 0, status: 'QUEUED', initiated: '2026-07-09 12:00', completed: null },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', PREVIEWING: 'bg-blue-600 hover:bg-blue-600', QUEUED: 'bg-amber-500 hover:bg-amber-500', ROLLBACK: 'bg-red-600 hover:bg-red-600', FAILED: 'bg-red-700 hover:bg-red-700' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Import Jobs</h3>
        <p className="text-xs text-muted-foreground mt-1">Excel/CSV import with validation, preview, duplicate detection, error reporting, and rollback. All jobs support rollback for safety.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Start Import — backend endpoint pending' })}><UploadCloud className="mr-1 h-4 w-4" /> New Import</Button>
      </div>
      <div className="space-y-3">
        {jobs.map(j => (
          <div key={j.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs">{j.code}</p>
                  <Badge variant="outline" className="text-xs">{j.entity.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className="text-xs font-mono">{j.format}</Badge>
                </div>
                <p className="font-medium text-sm">{j.file}</p>
              </div>
              <Badge className={statusColor[j.status] + ' text-xs'}>{j.status}</Badge>
            </div>
            {j.total > 0 && (
              <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                <div><p className="text-muted-foreground">Total</p><p className="font-mono font-semibold">{j.total}</p></div>
                <div><p className="text-muted-foreground">Success</p><p className="font-mono font-semibold text-emerald-600">{j.success}</p></div>
                <div><p className="text-muted-foreground">Errors</p><p className="font-mono font-semibold text-red-600">{j.errors}</p></div>
                <div><p className="text-muted-foreground">Duplicates</p><p className="font-mono font-semibold text-amber-600">{j.duplicates}</p></div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Initiated: {j.initiated}{j.completed && ` · Completed: ${j.completed}`}</p>
            {j.rollbackReason && <p className="text-xs text-red-600 mt-1">⚠ {j.rollbackReason}</p>}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovExportTab() {
  const jobs = [
    { id: 'ej-001', code: 'EXP-PROD-2026-0056', entity: 'PRODUCT', format: 'EXCEL', file: 'product_master_export.xlsx', total: 1248, exported: 1248, size: '240 KB', status: 'COMPLETED', initiated: '2026-07-08 16:00', completed: '2026-07-08 16:02' },
    { id: 'ej-002', code: 'EXP-BP-2026-0023', entity: 'BUSINESS_PARTNER', format: 'CSV', file: 'business_partners.csv', total: 1412, exported: 1412, size: '376 KB', status: 'COMPLETED', initiated: '2026-07-07 11:00', completed: '2026-07-07 11:01' },
    { id: 'ej-003', code: 'EXP-PROD-2026-0057', entity: 'PRODUCT', format: 'PDF', file: 'product_catalog_q3.pdf', total: 0, exported: 0, size: null, status: 'EXPORTING', initiated: '2026-07-09 13:00', completed: null },
    { id: 'ej-004', code: 'EXP-PRICE-2026-0012', entity: 'PRICE_LIST', format: 'JSON', file: 'price_lists_api.json', total: 6, exported: 6, size: '45 KB', status: 'COMPLETED', initiated: '2026-07-08 09:00', completed: '2026-07-08 09:00' },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', EXPORTING: 'bg-blue-600 hover:bg-blue-600', QUEUED: 'bg-amber-500 hover:bg-amber-500', FAILED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Export Jobs</h3>
        <p className="text-xs text-muted-foreground mt-1">Export to Excel, CSV, PDF, or JSON. Filtered exports with custom field selection.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Start Export — backend endpoint pending' })}><DownloadCloud className="mr-1 h-4 w-4" /> New Export</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Job Code</th><th className="font-medium">Entity</th>
            <th className="font-medium">Format</th><th className="font-medium">File</th>
            <th className="font-medium text-right">Rows</th><th className="font-medium">Size</th>
            <th className="font-medium">Status</th><th className="font-medium">Completed</th>
          </tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{j.code}</td>
                <td><Badge variant="outline" className="text-xs">{j.entity.replace(/_/g, ' ')}</Badge></td>
                <td><Badge variant="outline" className="text-xs font-mono">{j.format}</Badge></td>
                <td className="text-xs">{j.file}</td>
                <td className="text-right font-mono">{j.exported > 0 ? `${j.exported} / ${j.total}` : '—'}</td>
                <td className="text-xs">{j.size || '—'}</td>
                <td><Badge className={statusColor[j.status] + ' text-xs'}>{j.status}</Badge></td>
                <td className="text-xs text-muted-foreground">{j.completed || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GovValidationTab() {
  const rules = [
    { code: 'PROD-NAME-REQ', name: 'Product Name Required', entity: 'PRODUCT', field: 'productName', type: 'REQUIRED', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-SKU-UNIQUE', name: 'SKU Must Be Unique', entity: 'PRODUCT', field: 'sku', type: 'UNIQUE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-BARCODE-UNIQUE', name: 'Barcode Must Be Unique', entity: 'PRODUCT', field: 'barcode', type: 'UNIQUE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-PRICE-RANGE', name: 'Price Range (₹1 - ₹100000)', entity: 'PRODUCT', field: 'sellingPrice', type: 'RANGE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-HSN-REGEX', name: 'HSN Code Format (4-8 digits)', entity: 'PRODUCT', field: 'hsnCode', type: 'REGEX', severity: 'WARNING', enforcement: 'WARN', status: 'ACTIVE' },
    { code: 'BP-GST-REGEX', name: 'GST Number Format (15 chars)', entity: 'BUSINESS_PARTNER', field: 'gstNumber', type: 'REGEX', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'BP-PAN-UNIQUE', name: 'PAN Must Be Unique', entity: 'BUSINESS_PARTNER', field: 'panNumber', type: 'UNIQUE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-CAT-XREF', name: 'Category Must Exist', entity: 'PRODUCT', field: 'categoryId', type: 'CROSS_REFERENCE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-MARGIN-BIZ', name: 'Margin Must Be > 5%', entity: 'PRODUCT', field: 'marginPercent', type: 'BUSINESS_RULE', severity: 'WARNING', enforcement: 'WARN', status: 'ACTIVE' },
    { code: 'PROD-UOM-REQ', name: 'UOM Required for Stock Items', entity: 'PRODUCT', field: 'defaultUomId', type: 'REQUIRED', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
  ]
  const typeColor: Record<string, string> = { REQUIRED: 'bg-blue-100 text-blue-800', UNIQUE: 'bg-purple-100 text-purple-800', RANGE: 'bg-amber-100 text-amber-800', REGEX: 'bg-cyan-100 text-cyan-800', BUSINESS_RULE: 'bg-emerald-100 text-emerald-800', CROSS_REFERENCE: 'bg-pink-100 text-pink-800' }
  const sevColor: Record<string, string> = { ERROR: 'text-red-600', WARNING: 'text-amber-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Validation Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">6 validation types: Required, Unique, Range, Regex, Business Rule, Cross-Reference. Enforcement modes: BLOCK, WARN, LOG.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Validation Rule — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Rule Name</th>
            <th className="font-medium">Entity</th><th className="font-medium">Field</th>
            <th className="font-medium">Type</th><th className="font-medium">Severity</th>
            <th className="font-medium">Enforcement</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.code} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{r.code}</td>
                <td className="font-medium">{r.name}</td>
                <td><Badge variant="outline" className="text-xs">{r.entity.replace(/_/g, ' ')}</Badge></td>
                <td className="font-mono text-xs">{r.field}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[r.type])}>{r.type.replace(/_/g, ' ')}</span></td>
                <td className={cn('font-semibold', sevColor[r.severity])}>{r.severity}</td>
                <td><Badge variant="outline" className="text-xs">{r.enforcement}</Badge></td>
                <td><Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GovDuplicatesTab() {
  const duplicates = [
    { id: 'dc-001', primary: 'Kaju Katli 500g', duplicate: 'Kaju Katri 500g', rule: 'SIMILAR_NAME', score: 92.5, matched: ['name (92% similar)', 'category (match)', 'brand (match)'], status: 'PENDING' },
    { id: 'dc-002', primary: 'Soan Cake 1kg', duplicate: 'Soan Papdi 1kg', rule: 'SIMILAR_NAME', score: 78.3, matched: ['name (78% similar)', 'category (match)'], status: 'FALSE_POSITIVE', notes: 'Different products - Soan Cake vs Soan Papdi' },
    { id: 'dc-003', primary: 'Mixed Namkeen 200g', duplicate: 'Namkeen Mix 200g', rule: 'SIMILAR_NAME', score: 88.9, matched: ['name (89% similar)', 'category (match)', 'weight (match)'], status: 'MERGED', action: 'KEEP_PRIMARY', notes: 'Confirmed duplicate - merged into primary' },
    { id: 'dc-004', primary: 'Gulab Jamun 1kg', duplicate: 'Gulab Jamun (1kg tin)', rule: 'BARCODE', score: 100, matched: ['barcode (exact match)'], status: 'MERGED', action: 'ARCHIVE_DUPLICATE', notes: 'Same barcode - archived duplicate' },
    { id: 'dc-005', primary: 'Pista Roll 250g', duplicate: 'Pista Roll 250gms', rule: 'SKU', score: 95.0, matched: ['sku (95% similar)', 'name (match)'], status: 'PENDING' },
    { id: 'dc-006', primary: 'Cashew Nuts (Raw)', duplicate: 'Cashew Nut Raw Material', rule: 'SIMILAR_NAME', score: 85.7, matched: ['name (86% similar)'], status: 'IGNORED', notes: 'Different grade specifications' },
  ]
  const statusColor: Record<string, string> = { PENDING: 'bg-amber-500 hover:bg-amber-500', MERGED: 'bg-emerald-600 hover:bg-emerald-600', IGNORED: 'bg-gray-500 hover:bg-gray-500', FALSE_POSITIVE: 'bg-blue-600 hover:bg-blue-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Duplicate Detection & Merge</h3>
        <p className="text-xs text-muted-foreground mt-1">6 detection rules: Name, SKU, Barcode, HSN, Brand, Similar Names. Merge options: Keep Primary, Merge References, Archive Duplicate. Side-by-side comparison supported.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Scanning duplicates — backend endpoint pending' })}><GitMerge className="mr-1 h-4 w-4" /> Scan Duplicates</Button>
      </div>
      <div className="space-y-3">
        {duplicates.map(d => (
          <div key={d.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{d.primary}</p>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <p className="font-medium text-sm text-muted-foreground">{d.duplicate}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{d.rule.replace(/_/g, ' ')}</Badge>
                  <span>Match: <span className="font-mono font-semibold text-foreground">{d.score}%</span></span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.matched.map((m, i) => <Badge key={i} variant="outline" className="text-xs">{m}</Badge>)}
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[d.status] + ' text-xs'}>{d.status.replace(/_/g, ' ')}</Badge>
                {d.action && <p className="text-xs text-muted-foreground mt-1">{d.action.replace(/_/g, ' ')}</p>}
              </div>
            </div>
            {d.notes && <p className="text-xs text-muted-foreground mt-1 pt-1 border-t">{d.notes}</p>}
            {d.status === 'PENDING' && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => toast({ title: 'Merge — backend endpoint pending' })}><GitMerge className="mr-1 h-3 w-3" />Merge</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast({ title: 'Mark False Positive — backend endpoint pending' })}>Mark False Positive</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Ignore</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovAuditTab() {
  const audit = [
    { id: 'mda-001', entity: 'Kaju Katli 500g', type: 'PRODUCT', action: 'UPDATE', module: 'PIM', user: 'Priya Sharma', role: 'PIM Manager', fields: ['sellingPrice: ₹520 → ₹540', 'mrp: ₹580 → ₹600'], reason: 'Quarterly price review', ip: '192.168.1.45', time: '2026-07-08 14:30' },
    { id: 'mda-002', entity: 'Mixed Namkeen 200g', type: 'PRODUCT', action: 'CREATE', module: 'Product Master', user: 'Rajesh Mehta', role: 'Product Manager', fields: ['New product created'], reason: 'New product launch', ip: '192.168.1.50', time: '2026-07-08 09:15' },
    { id: 'mda-003', entity: 'Old Recipe Laddu 500g', type: 'PRODUCT', action: 'ARCHIVE', module: 'Lifecycle', user: 'Anita Desai', role: 'Admin', fields: ['lifecycleState: DISCONTINUED → ARCHIVED'], reason: 'Recipe discontinued 6 months ago', ip: '192.168.1.10', time: '2026-01-15 10:00' },
    { id: 'mda-004', entity: 'Tata Consumer Products', type: 'BUSINESS_PARTNER', action: 'UPDATE', module: 'Business Partner', user: 'Suresh Patil', role: 'Accounts Manager', fields: ['creditLimit: ₹4500000 → ₹5000000'], reason: 'Annual credit review', ip: '192.168.1.55', time: '2026-07-07 16:45' },
    { id: 'mda-005', entity: 'Kaju Katli 500g', type: 'PRODUCT', action: 'MERGE', module: 'Duplicate Manager', user: 'Priya Sharma', role: 'PIM Manager', fields: ['Merged "Kaju Katri 500g" into "Kaju Katli 500g"'], reason: 'Duplicate detected and merged', ip: '192.168.1.45', time: '2026-07-06 11:20' },
    { id: 'mda-006', entity: 'Diwali Festival Price List', type: 'PRICE_LIST', action: 'CREATE', module: 'Commercial Engine', user: 'Vikram Iyer', role: 'Pricing Manager', fields: ['New price list with 45 items'], reason: 'Diwali festival preparation', ip: '192.168.1.60', time: '2026-09-01 14:00' },
    { id: 'mda-007', entity: 'Gulab Jamun 1kg', type: 'PRODUCT', action: 'UPDATE', module: 'PIM', user: 'Rajesh Mehta', role: 'Product Manager', fields: ['lifecycleState: ACTIVE → INACTIVE'], reason: 'Summer off-season - temporarily inactive', ip: '192.168.1.50', time: '2026-07-01 08:00' },
    { id: 'mda-008', entity: 'Konkan Cashew Processors', type: 'BUSINESS_PARTNER', action: 'UPDATE', module: 'Business Partner', user: 'Suresh Patil', role: 'Accounts Manager', fields: ['compliance.FSSAI verified'], reason: 'Annual compliance renewal', ip: '192.168.1.55', time: '2026-06-28 15:30' },
  ]
  const actionColor: Record<string, string> = { CREATE: 'bg-emerald-100 text-emerald-800', UPDATE: 'bg-blue-100 text-blue-800', DELETE: 'bg-red-100 text-red-800', ARCHIVE: 'bg-orange-100 text-orange-800', RESTORE: 'bg-cyan-100 text-cyan-800', MERGE: 'bg-purple-100 text-purple-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Master Data Audit Trail</h3>
        <p className="text-xs text-muted-foreground mt-1">Every change tracked: before/after values, user, role, timestamp, module, IP address, reason. Filterable by action and module.</p></div>
      </div>
      <div className="space-y-2">
        {audit.map(a => (
          <div key={a.id} className="border rounded-lg p-3 flex items-start gap-3">
            <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium flex-shrink-0', actionColor[a.action])}>{a.action}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-sm">{a.entity}</p>
                <Badge variant="outline" className="text-xs">{a.type.replace(/_/g, ' ')}</Badge>
                <Badge variant="outline" className="text-xs">{a.module}</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {a.fields.map((f, i) => <span key={i} className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded">{f}</span>)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{a.user}</span> ({a.role}) · {a.time} · IP: {a.ip}
              </p>
              {a.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {a.reason}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovQualityTab() {
  const metrics = [
    { entity: 'PRODUCT', name: 'COMPLETENESS', value: 87.5, unit: 'PERCENT', score: 87.5, desc: '87.5% of required fields populated across 1248 products' },
    { entity: 'PRODUCT', name: 'ACCURACY', value: 94.2, unit: 'PERCENT', score: 94.2, desc: '94.2% of products passed validation rules' },
    { entity: 'PRODUCT', name: 'CONSISTENCY', value: 91.8, unit: 'PERCENT', score: 91.8, desc: '91.8% consistent across all channels' },
    { entity: 'PRODUCT', name: 'DUPLICATE_PERCENT', value: 2.3, unit: 'PERCENT', score: 97.7, desc: '2.3% duplicate rate (29 duplicates out of 1248)' },
    { entity: 'PRODUCT', name: 'APPROVAL_SLA', value: 88.0, unit: 'PERCENT', score: 88.0, desc: '88% of approvals completed within SLA' },
    { entity: 'PRODUCT', name: 'VALIDATION_ERRORS', value: 47, unit: 'COUNT', score: 92.0, desc: '47 active validation errors across products' },
    { entity: 'PRODUCT', name: 'INACTIVE_PRODUCTS', value: 124, unit: 'COUNT', score: 90.0, desc: '124 inactive products (9.9% of catalog)' },
    { entity: 'PRODUCT', name: 'MISSING_IMAGES', value: 89, unit: 'COUNT', score: 92.9, desc: '89 products missing images (7.1%)' },
    { entity: 'PRODUCT', name: 'MISSING_BARCODES', value: 23, unit: 'COUNT', score: 98.2, desc: '23 products missing barcodes (1.8%)' },
    { entity: 'BUSINESS_PARTNER', name: 'COMPLETENESS', value: 92.1, unit: 'PERCENT', score: 92.1, desc: '92.1% of required fields populated' },
    { entity: 'BUSINESS_PARTNER', name: 'DUPLICATE_PERCENT', value: 1.1, unit: 'PERCENT', score: 98.9, desc: '1.1% duplicate rate (15 out of 1412)' },
    { entity: 'BUSINESS_PARTNER', name: 'MISSING_GST', value: 34, unit: 'COUNT', score: 97.6, desc: '34 partners missing GST (2.4%)' },
  ]
  const scoreColor = (s: number) => s >= 95 ? 'text-emerald-600' : s >= 85 ? 'text-blue-600' : s >= 75 ? 'text-amber-600' : 'text-red-600'
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Data Quality Dashboard</h3>
        <p className="text-xs text-muted-foreground mt-1">9 quality metrics for products + 3 for business partners. Overall score: 91.6 (Grade A). Real-time monitoring with trend analysis.</p></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <div key={i} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{m.entity.replace(/_/g, ' ')}</p>
                <p className="font-medium text-sm">{m.name.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right">
                <p className={cn('text-2xl font-bold', scoreColor(m.score))}>{m.unit === 'PERCENT' ? `${m.value}%` : m.value}</p>
                <p className="text-xs text-muted-foreground">Score: <span className={cn('font-bold', scoreColor(m.score))}>{m.score}</span></p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{m.desc}</p>
            <div className="mt-2 h-1.5 bg-muted rounded overflow-hidden">
              <div className={cn('h-full', m.score >= 95 ? 'bg-emerald-600' : m.score >= 85 ? 'bg-blue-600' : m.score >= 75 ? 'bg-amber-500' : 'bg-red-600')} style={{ width: `${m.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovHistoryTab() {
  const history = [
    { id: 'pch-001', product: 'Kaju Katli 500g', version: 5, type: 'PRICE_CHANGE', fields: ['sellingPrice: ₹520 → ₹540', 'mrp: ₹580 → ₹600'], editor: 'Priya Sharma', reason: 'Quarterly price review', time: '2026-07-08 14:30', rollback: true },
    { id: 'pch-002', product: 'Kaju Katli 500g', version: 4, type: 'UPDATE', fields: ['description updated', 'ingredients clarified'], editor: 'Rajesh Mehta', reason: 'Compliance review - ingredient clarity', time: '2026-06-20 11:00', rollback: true },
    { id: 'pch-003', product: 'Kaju Katli 500g', version: 3, type: 'LIFECYCLE_TRANSITION', fields: ['lifecycleState: PUBLISHED → ACTIVE'], editor: 'System', reason: 'Auto-activation after publish', time: '2026-06-20 10:00', rollback: false },
    { id: 'pch-004', product: 'Kaju Katli 500g', version: 2, type: 'LIFECYCLE_TRANSITION', fields: ['lifecycleState: APPROVED → PUBLISHED'], editor: 'Anita Desai', reason: 'Approved for publication', time: '2026-06-20 09:30', rollback: false },
    { id: 'pch-005', product: 'Kaju Katli 500g', version: 1, type: 'CREATE', fields: ['Initial product creation'], editor: 'Rajesh Mehta', reason: 'New product', time: '2026-06-15 08:00', rollback: false },
    { id: 'pch-006', product: 'Mixed Namkeen 200g', version: 3, type: 'CATEGORY_CHANGE', fields: ['categoryId: Sweets → Namkeen'], editor: 'Priya Sharma', reason: 'Reclassification - product is savory not sweet', time: '2026-07-09 10:00', rollback: true },
  ]
  const typeColor: Record<string, string> = { CREATE: 'bg-emerald-100 text-emerald-800', UPDATE: 'bg-blue-100 text-blue-800', PRICE_CHANGE: 'bg-amber-100 text-amber-800', CATEGORY_CHANGE: 'bg-purple-100 text-purple-800', LIFECYCLE_TRANSITION: 'bg-indigo-100 text-indigo-800', ARCHIVE: 'bg-orange-100 text-orange-800', RESTORE: 'bg-cyan-100 text-cyan-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Product Change History</h3>
        <p className="text-xs text-muted-foreground mt-1">Versioned history with before/after snapshots. Rollback support for reversible changes. Every change records editor, reason, and approval link.</p></div>
      </div>
      <div className="space-y-2">
        {history.map(h => (
          <div key={h.id} className="border rounded-lg p-3 flex items-start gap-3">
            <div className="flex h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold items-center justify-center flex-shrink-0">v{h.version}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-sm">{h.product}</p>
                <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[h.type])}>{h.type.replace(/_/g, ' ')}</span>
                {h.rollback && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Rollbackable</Badge>}
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {h.fields.map((f, i) => <span key={i} className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded">{f}</span>)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{h.editor}</span> · {h.time}
              </p>
              {h.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {h.reason}</p>}
            </div>
            {h.rollback && (
              <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0" onClick={() => toast({ title: 'Rollback — backend endpoint pending' })}>Rollback</Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
