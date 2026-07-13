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

export function TaskQueueModule() {
  const [filter, setFilter] = useState<string>('ALL')
  const [assignmentFilter, setAssignmentFilter] = useState<string>('ALL')

  const tasks = [
    { id: 'T1', num: 'TASK-2026-001', type: 'PICK', priority: 'EMERGENCY', status: 'IN_PROGRESS', wave: 'WAVE-2026-004', operator: 'Suresh M.', equipment: 'FL-002', from: 'C-02-03-A', to: 'PK-01', product: 'Kaju Katli 500g', qty: '24 PCS', sla: '10:45', slaRisk: 'OK', progress: 75 },
    { id: 'T2', num: 'TASK-2026-002', type: 'PUTAWAY', priority: 'HIGH', status: 'ASSIGNED', wave: '—', operator: 'Ramesh P.', equipment: 'FL-001', from: 'RECV-01', to: 'B-01-02-C', product: 'Saffron 10g × 100', qty: '100 PCS', sla: '11:30', slaRisk: 'OK', progress: 0 },
    { id: 'T3', num: 'TASK-2026-003', type: 'PICK', priority: 'HIGH', status: 'OPEN', wave: 'WAVE-2026-001', operator: null, equipment: null, from: 'C-03-01-B', to: 'PK-02', product: 'Mysore Pak 250g', qty: '48 PCS', sla: '11:30', slaRisk: 'WARNING', progress: 0 },
    { id: 'T4', num: 'TASK-2026-004', type: 'PACK', priority: 'NORMAL', status: 'IN_PROGRESS', wave: 'WAVE-2026-001', operator: 'Lakshmi V.', equipment: '—', from: 'PK-01', to: 'DISP-01', product: 'Mixed Sweets Box', qty: '12 BOX', sla: '12:00', slaRisk: 'OK', progress: 50 },
    { id: 'T5', num: 'TASK-2026-005', type: 'LOAD', priority: 'HIGH', status: 'OPEN', wave: 'WAVE-2026-006', operator: null, equipment: 'FL-003', from: 'DISP-01', to: 'TRUCK-MH12', product: 'Multi-product', qty: '8 PALLET', sla: '14:30', slaRisk: 'OK', progress: 0 },
    { id: 'T6', num: 'TASK-2026-006', type: 'RECEIVE', priority: 'NORMAL', status: 'IN_PROGRESS', wave: '—', operator: 'Anil K.', equipment: '—', from: 'DOCK-02', to: 'RECV-02', product: 'Raw Almonds 25kg', qty: '40 BAG', sla: '13:00', slaRisk: 'CRITICAL', progress: 30 },
    { id: 'T7', num: 'TASK-2026-007', type: 'REPLENISH', priority: 'NORMAL', status: 'ASSIGNED', wave: '—', operator: 'Mahesh R.', equipment: 'RT-001', from: 'B-02-04-A', to: 'C-01-02-C', product: 'Gulab Jamun 1kg', qty: '12 PCS', sla: '14:00', slaRisk: 'OK', progress: 0 },
    { id: 'T8', num: 'TASK-2026-008', type: 'COUNT', priority: 'LOW', status: 'OPEN', wave: '—', operator: null, equipment: null, from: 'B-01-01', to: '—', product: 'Cycle Count Zone B1', qty: '—', sla: '18:00', slaRisk: 'OK', progress: 0 },
    { id: 'T9', num: 'TASK-2026-009', type: 'PICK', priority: 'EMERGENCY', status: 'ESCALATED', wave: 'WAVE-2026-004', operator: null, equipment: null, from: 'C-04-02-A', to: 'PK-03', product: 'Dry Fruit Mix 1kg', qty: '6 PCS', sla: '10:30 (OVERDUE)', slaRisk: 'CRITICAL', progress: 0 },
    { id: 'T10', num: 'TASK-2026-010', type: 'TRANSFER', priority: 'NORMAL', status: 'COMPLETED', wave: '—', operator: 'Suresh M.', equipment: 'FL-002', from: 'B-01-03', to: 'C-02-01', product: 'Pista 500g', qty: '24 PCS', sla: '09:30', slaRisk: 'OK', progress: 100 },
  ]

  const filteredTasks = tasks.filter(t =>
    (filter === 'ALL' || t.type === filter) &&
    (assignmentFilter === 'ALL' || (assignmentFilter === 'ASSIGNED' && t.operator) || (assignmentFilter === 'UNASSIGNED' && !t.operator))
  )

  const stats = [
    { label: 'Open Tasks', value: tasks.filter(t => t.status === 'OPEN').length, color: 'text-slate-600' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, color: 'text-emerald-600' },
    { label: 'SLA Critical', value: tasks.filter(t => t.slaRisk === 'CRITICAL').length, color: 'text-rose-600' },
    { label: 'Unassigned', value: tasks.filter(t => !t.operator).length, color: 'text-amber-600' },
    { label: 'Escalated', value: tasks.filter(t => t.status === 'ESCALATED').length, color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Warehouse Task Engine</h2>
        <p className="text-sm text-muted-foreground mt-1">Operator work queue · auto-prioritized · SLA-tracked · scan-verified</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>

      {/* Auto-Assignment Banner */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Workflow className="h-5 w-5" /></div>
            <div><p className="font-semibold text-sm">Auto-Assignment Engine Active</p><p className="text-xs text-muted-foreground">Tasks auto-assigned by skill · workload · distance · zone · shift</p></div>
          </div>
          <div className="flex items-center gap-2"><Badge className="bg-emerald-500">4 Tasks Auto-Routed</Badge><Button size="sm" variant="outline">Configure Rules</Button></div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
          <option value="ALL">All Types</option>
          {['RECEIVE', 'PUTAWAY', 'PICK', 'PACK', 'TRANSFER', 'COUNT', 'INSPECT', 'LOAD', 'DISPATCH', 'REPLENISH'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={assignmentFilter} onChange={e => setAssignmentFilter(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
          <option value="ALL">All Assignments</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="UNASSIGNED">Unassigned</option>
        </select>
      </div>

      {/* Task Cards */}
      <div className="space-y-2">
        {filteredTasks.map(t => {
          const b = s28BadgeForStatus(t.status)
          const slaColor = t.slaRisk === 'CRITICAL' ? 'text-rose-600 bg-rose-50 border-rose-300' : t.slaRisk === 'WARNING' ? 'text-amber-600 bg-amber-50 border-amber-300' : 'text-emerald-600 bg-emerald-50 border-emerald-300'
          const typeColors: Record<string, string> = { PICK: 'bg-blue-100 text-blue-700', PUTAWAY: 'bg-emerald-100 text-emerald-700', PACK: 'bg-purple-100 text-purple-700', LOAD: 'bg-amber-100 text-amber-700', RECEIVE: 'bg-cyan-100 text-cyan-700', REPLENISH: 'bg-orange-100 text-orange-700', COUNT: 'bg-slate-100 text-slate-700', TRANSFER: 'bg-indigo-100 text-indigo-700', DISPATCH: 'bg-pink-100 text-pink-700', INSPECT: 'bg-yellow-100 text-yellow-700' }
          return (
            <Card key={t.id} className={`p-3 ${t.status === 'ESCALATED' ? 'border-rose-400 bg-rose-50/30' : ''}`}>
              <div className="flex items-center gap-4">
                {/* Priority Bar */}
                <div className={`w-1 self-stretch rounded-full ${t.priority === 'EMERGENCY' ? 'bg-red-500' : t.priority === 'HIGH' ? 'bg-orange-500' : t.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-slate-300'}`} />

                {/* Task Number & Type */}
                <div className="w-32">
                  <div className="font-mono text-xs font-semibold text-blue-700">{t.num}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[t.type] || 'bg-slate-100'}`}>{t.type}</span>
                </div>

                {/* Product & Movement */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.product}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{t.from}</span><ArrowRight className="h-3 w-3" /><span className="font-mono">{t.to}</span>
                    <span className="ml-2 font-mono">Qty: {t.qty}</span>
                  </div>
                </div>

                {/* Assignment */}
                <div className="w-40 text-xs">
                  {t.operator ? (<div className="flex items-center gap-1.5"><UserCheck className="h-3 w-3 text-emerald-600" /><span className="truncate">{t.operator}</span></div>) : (<div className="text-amber-600 flex items-center gap-1"><UserCog className="h-3 w-3" />Unassigned</div>)}
                  {t.equipment && <div className="text-muted-foreground mt-0.5 flex items-center gap-1"><Truck className="h-3 w-3" />{t.equipment}</div>}
                </div>

                {/* SLA */}
                <div className={`px-2 py-1 rounded text-xs border ${slaColor}`}>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span className="font-mono">{t.sla}</span></div>
                  <div className="text-[10px] mt-0.5">{t.slaRisk}</div>
                </div>

                {/* Status */}
                <div className="w-28">
                  <span className={`text-xs px-2 py-1 rounded ${b.cls} block text-center`}>{b.label}</span>
                  {t.progress > 0 && t.progress < 100 && <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${t.progress}%` }} /></div>}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {!t.operator && t.status === 'OPEN' && <Button size="sm" variant="outline" className="h-7 text-xs">Auto-Assign</Button>}
                  {t.status === 'ESCALATED' && <Button size="sm" variant="destructive" className="h-7 text-xs">Resolve</Button>}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Epic 4: Workforce Management Module ────────────────
