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

export function ExceptionCenterModule() {
  const { hasPermission } = useAuthStore()
  const [filter, setFilter] = useState<string>('ALL')

  const exceptions = [
    { id: 'X1', num: 'EX-2026-018', type: 'TASK_FAILURE', source: 'PICKING', task: 'TASK-2026-009', wave: 'WAVE-2026-004', sev: 'CRITICAL', status: 'OPEN', title: 'Operator unavailable for emergency pick', reported: '10:35', by: 'Auto-Engine', assigned: null, impact: 'MAJOR', delay: 35 },
    { id: 'X2', num: 'EX-2026-017', type: 'NO_STOCK', source: 'PICKING', task: 'TASK-2026-015', wave: 'WAVE-2026-001', sev: 'HIGH', status: 'ASSIGNED', title: 'Insufficient stock at C-03-01-B (Mysore Pak)', reported: '10:18', by: 'Scan Engine', assigned: 'Rajesh K.', impact: 'MODERATE', delay: 15 },
    { id: 'X3', num: 'EX-2026-016', type: 'EQUIPMENT_FAILURE', source: 'EQUIPMENT', task: null, wave: null, sev: 'HIGH', status: 'INVESTIGATING', title: 'FL-005 hydraulic failure during loading', reported: '10:05', by: 'Suresh M.', assigned: 'Maintenance', impact: 'MAJOR', delay: 45 },
    { id: 'X4', num: 'EX-2026-015', type: 'WRONG_BIN', source: 'PUTAWAY', task: 'TASK-2026-022', wave: null, sev: 'MEDIUM', status: 'RESOLVED', title: 'Operator scanned wrong bin — system blocked', reported: '09:42', by: 'Validation Engine', assigned: 'Ramesh P.', impact: 'MINOR', delay: 5 },
    { id: 'X5', num: 'EX-2026-014', type: 'PRIORITY_CHANGE', source: 'WAVE', task: null, wave: 'WAVE-2026-007', sev: 'MEDIUM', status: 'CLOSED', title: 'Customer requested priority upgrade — wave reordered', reported: '09:20', by: 'Customer Service', assigned: 'Supervisor', impact: 'MINOR', delay: 0 },
    { id: 'X6', num: 'EX-2026-013', type: 'TEMPERATURE_ALARM', source: 'INVENTORY', task: null, wave: null, sev: 'CRITICAL', status: 'RESOLVED', title: 'Cold zone F-01 temp exceeded 8°C threshold', reported: '08:55', by: 'IoT Sensor', assigned: 'Maintenance', impact: 'SEVERE', delay: 0 },
    { id: 'X7', num: 'EX-2026-012', type: 'EMERGENCY_ORDER', source: 'WAVE', task: null, wave: 'WAVE-2026-004', sev: 'HIGH', status: 'CLOSED', title: 'Emergency order inserted — wave priority boosted', reported: '08:30', by: 'Sales Team', assigned: 'Auto-Engine', impact: 'MODERATE', delay: 0 },
    { id: 'X8', num: 'EX-2026-011', type: 'SHORT_PICK', source: 'PICKING', task: 'TASK-2026-008', wave: 'WAVE-2026-001', sev: 'LOW', status: 'RESOLVED', title: 'Short pick — 2 units missing, substituted', reported: '08:15', by: 'Lakshmi V.', assigned: 'Supervisor', impact: 'NEGLIGIBLE', delay: 0 },
  ]

  const filtered = exceptions.filter(e => filter === 'ALL' || e.type === filter || e.status === filter)

  const stats = [
    { label: 'Open', value: exceptions.filter(e => e.status === 'OPEN').length, color: 'text-rose-600' },
    { label: 'Assigned', value: exceptions.filter(e => e.status === 'ASSIGNED').length, color: 'text-blue-600' },
    { label: 'Investigating', value: exceptions.filter(e => e.status === 'INVESTIGATING').length, color: 'text-amber-600' },
    { label: 'Resolved (24h)', value: exceptions.filter(e => e.status === 'RESOLVED').length, color: 'text-emerald-600' },
    { label: 'Critical', value: exceptions.filter(e => e.sev === 'CRITICAL').length, color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Exception Center</h2><p className="text-sm text-muted-foreground mt-1">Warehouse exceptions · supervisor workflow · escalation matrix</p></div>
        {hasPermission('quality:inspect') && <Button size="sm" variant="destructive"><Siren className="mr-2 h-4 w-4" />Report Exception</Button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">Operations exception endpoint</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>
      </div>

      {/* Exception Workflow */}
      <Card className="p-4 bg-gradient-to-r from-slate-50 to-slate-100">
        <h3 className="font-semibold mb-3 text-sm">Exception Resolution Workflow</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {['Exception Raised', 'Auto-Routed to Supervisor', 'Investigation', 'Decision', 'Reassign / Escalate / Close', 'Audit Logged'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-white border rounded-md font-medium">{step}</div>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'TASK_FAILURE', 'NO_STOCK', 'WRONG_BIN', 'EQUIPMENT_FAILURE', 'OPERATOR_UNAVAILABLE', 'PRIORITY_CHANGE', 'EMERGENCY_ORDER', 'TEMPERATURE_ALARM', 'SHORT_PICK'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1 rounded-full border ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>{f.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(e => {
          const sb = s28BadgeForStatus(e.status)
          const sevColor = e.sev === 'CRITICAL' ? 'border-rose-400 bg-rose-50/50' : e.sev === 'HIGH' ? 'border-orange-300 bg-orange-50/30' : e.sev === 'MEDIUM' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
          const sevBadge = e.sev === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : e.sev === 'HIGH' ? 'bg-orange-100 text-orange-700' : e.sev === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
          const typeIcons: Record<string, React.ReactNode> = {
            TASK_FAILURE: <AlertOctagon className="h-4 w-4" />, NO_STOCK: <Package className="h-4 w-4" />,
            WRONG_BIN: <MapPin className="h-4 w-4" />, EQUIPMENT_FAILURE: <Truck className="h-4 w-4" />,
            OPERATOR_UNAVAILABLE: <UserCog className="h-4 w-4" />, PRIORITY_CHANGE: <Flag className="h-4 w-4" />,
            EMERGENCY_ORDER: <Siren className="h-4 w-4" />, TEMPERATURE_ALARM: <Thermometer className="h-4 w-4" />,
            SHORT_PICK: <PackageOpen className="h-4 w-4" />,
          }
          return (
            <Card key={e.id} className={`p-4 ${sevColor}`}>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">{typeIcons[e.type] || <AlertTriangle className="h-4 w-4" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-semibold text-blue-700">{e.num}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{e.type}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sevBadge}`}>{e.sev}</span>
                    <span className="text-[10px] text-muted-foreground">Source: {e.source}</span>
                    {e.task && <span className="text-[10px] text-muted-foreground font-mono">Task: {e.task}</span>}
                    {e.wave && <span className="text-[10px] text-muted-foreground font-mono">Wave: {e.wave}</span>}
                  </div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>Reported: {e.reported} by {e.by}</span>
                    <span>·</span>
                    <span>Assigned to: {e.assigned || '—'}</span>
                    <span>·</span>
                    <span>Impact: <span className="font-medium">{e.impact}</span></span>
                    {e.delay > 0 && <><span>·</span><span className="text-rose-600">Delay: {e.delay}m</span></>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${sb.cls}`}>{sb.label}</span>
                  {(e.status === 'OPEN' || e.status === 'ASSIGNED' || e.status === 'INVESTIGATING') && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Reassign</Button>
                      <Button size="sm" variant="default" className="h-7 text-xs">Escalate</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">Close</Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Epic 8: Workforce Analytics Module ─────────────────
