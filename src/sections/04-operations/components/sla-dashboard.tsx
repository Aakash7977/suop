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

export function SLADashboardModule() {
  const slaConfigs = [
    { code: 'SLA-RECV-01', name: 'Receiving SLA', task: 'RECEIVE', priority: 'NORMAL', target: 60, warning: 48, critical: 60, onTime: 94, total: 156, violations: 9, penalty: 0 },
    { code: 'SLA-PUT-01', name: 'Putaway SLA', task: 'PUTAWAY', priority: 'NORMAL', target: 45, warning: 36, critical: 45, onTime: 91, total: 234, violations: 21, penalty: 0 },
    { code: 'SLA-PICK-01', name: 'Picking SLA', task: 'PICK', priority: 'HIGH', target: 30, warning: 24, critical: 30, onTime: 88, total: 412, violations: 49, penalty: 4500 },
    { code: 'SLA-PACK-01', name: 'Packing SLA', task: 'PACK', priority: 'NORMAL', target: 20, warning: 16, critical: 20, onTime: 96, total: 287, violations: 11, penalty: 0 },
    { code: 'SLA-DISP-01', name: 'Dispatch SLA', task: 'DISPATCH', priority: 'HIGH', target: 90, warning: 72, critical: 90, onTime: 93, total: 178, violations: 12, penalty: 2800 },
    { code: 'SLA-TRN-01', name: 'Transfer SLA', task: 'TRANSFER', priority: 'NORMAL', target: 60, warning: 48, critical: 60, onTime: 98, total: 89, violations: 2, penalty: 0 },
    { code: 'SLA-CC-01', name: 'Cycle Count SLA', task: 'CYCLE_COUNT', priority: 'LOW', target: 240, warning: 192, critical: 240, onTime: 99, total: 56, violations: 1, penalty: 0 },
  ]

  const violations = [
    { id: 'V1', num: 'SLA-V-2026-012', sla: 'SLA-PICK-01', task: 'TASK-2026-009', op: 'Unassigned', sev: 'CRITICAL', overrun: 35, deadline: '10:30', actual: null, status: 'OPEN' },
    { id: 'V2', num: 'SLA-V-2026-011', sla: 'SLA-RECV-01', task: 'TASK-2026-006', op: 'Anil K.', sev: 'MAJOR', overrun: 18, deadline: '12:30', actual: null, status: 'INVESTIGATING' },
    { id: 'V3', num: 'SLA-V-2026-010', sla: 'SLA-PICK-01', task: 'TASK-2026-003', op: 'Unassigned', sev: 'WARNING', overrun: 0, deadline: '11:30', actual: null, status: 'OPEN' },
    { id: 'V4', num: 'SLA-V-2026-009', sla: 'SLA-PICK-01', task: 'TASK-2026-014', op: 'Rajesh K.', sev: 'MINOR', overrun: 12, deadline: '09:30', actual: '09:42', status: 'RESOLVED' },
    { id: 'V5', num: 'SLA-V-2026-008', sla: 'SLA-DISP-01', task: 'TASK-2026-021', op: 'Suresh M.', sev: 'MAJOR', overrun: 28, deadline: '08:30', actual: '08:58', status: 'RESOLVED' },
    { id: 'V6', num: 'SLA-V-2026-007', sla: 'SLA-PUT-01', task: 'TASK-2026-031', op: 'Anita S.', sev: 'WARNING', overrun: 8, deadline: '11:00', actual: '11:08', status: 'WAIVED' },
  ]

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">SLA Monitoring Dashboard</h2><p className="text-sm text-muted-foreground mt-1">Service Level Agreements per task type · violation tracking · penalty monitoring</p></div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total SLA Tracked', value: slaConfigs.length, color: 'text-blue-600' },
          { label: 'Total Tasks (30d)', value: slaConfigs.reduce((a, s) => a + s.total, 0), color: 'text-slate-700' },
          { label: 'On-Time %', value: `${(slaConfigs.reduce((a, s) => a + s.onTime * s.total, 0) / slaConfigs.reduce((a, s) => a + s.total, 0)).toFixed(1)}%`, color: 'text-emerald-600' },
          { label: 'Open Violations', value: violations.filter(v => v.status === 'OPEN' || v.status === 'INVESTIGATING').length, color: 'text-rose-600' },
          { label: 'Penalty (30d)', value: `₹${slaConfigs.reduce((a, s) => a + s.penalty, 0).toLocaleString('en-IN')}`, color: 'text-amber-600' },
        ].map(s => <Card key={s.label} className="p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      {/* SLA Compliance Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">SLA Compliance by Task Type</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">SLA Code</th><th className="text-left px-4 py-3 font-medium">Task Type</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th><th className="text-left px-4 py-3 font-medium">Target (min)</th>
              <th className="text-left px-4 py-3 font-medium">Tasks (30d)</th><th className="text-left px-4 py-3 font-medium">On-Time %</th>
              <th className="text-left px-4 py-3 font-medium">Compliance</th><th className="text-left px-4 py-3 font-medium">Violations</th>
              <th className="text-left px-4 py-3 font-medium">Penalty</th>
            </tr></thead>
            <tbody>
              {slaConfigs.map(s => {
                const color = s.onTime >= 95 ? 'bg-emerald-500' : s.onTime >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                return (
                  <tr key={s.code} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{s.code}</td>
                    <td className="px-4 py-3 text-xs">{s.name}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border ${s28PriorityBadge(s.priority)}`}>{s.priority}</span></td>
                    <td className="px-4 py-3 font-mono">{s.target}</td>
                    <td className="px-4 py-3 font-mono">{s.total}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{s.onTime}%</td>
                    <td className="px-4 py-3 min-w-[120px]"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${s.onTime}%` }} /></div></div></td>
                    <td className="px-4 py-3 font-mono"><span className={s.violations > 10 ? 'text-rose-600 font-bold' : s.violations > 0 ? 'text-amber-600' : 'text-emerald-600'}>{s.violations}</span></td>
                    <td className="px-4 py-3 font-mono text-xs">{s.penalty > 0 ? <span className="text-amber-700">₹{s.penalty.toLocaleString('en-IN')}</span> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Violations */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between"><h3 className="font-semibold">Recent SLA Violations</h3><Button size="sm" variant="outline"><Filter className="mr-1 h-3 w-3" />Filter</Button></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Violation #</th><th className="text-left px-4 py-3 font-medium">SLA</th>
              <th className="text-left px-4 py-3 font-medium">Task</th><th className="text-left px-4 py-3 font-medium">Operator</th>
              <th className="text-left px-4 py-3 font-medium">Severity</th><th className="text-left px-4 py-3 font-medium">Deadline</th>
              <th className="text-left px-4 py-3 font-medium">Actual</th><th className="text-left px-4 py-3 font-medium">Overrun</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {violations.map(v => {
                const b = s28BadgeForStatus(v.sev)
                const sb = s28BadgeForStatus(v.status)
                return (
                  <tr key={v.id} className={`border-b hover:bg-muted/30 ${v.sev === 'CRITICAL' ? 'bg-rose-50/50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{v.num}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.sla}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.task}</td>
                    <td className="px-4 py-3 text-xs">{v.op}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                    <td className="px-4 py-3 font-mono text-xs">{v.deadline}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.actual || '—'}</td>
                    <td className="px-4 py-3 font-mono"><span className={v.overrun > 20 ? 'text-rose-600 font-bold' : v.overrun > 0 ? 'text-amber-600' : 'text-muted-foreground'}>{v.overrun}m</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${sb.cls}`}>{sb.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 7: Exception Center Module ────────────────────
