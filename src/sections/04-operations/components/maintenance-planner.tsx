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

export function MaintenancePlannerModule() {
  const [view, setView] = useState<'schedule' | 'tasks' | 'plans'>('schedule')

  const schedule = [
    { id: 'MS1', date: '2026-07-15', time: '10:00-12:00', equipment: 'FL-001', type: 'WEEKLY', technician: 'Ramesh Tech', status: 'SCHEDULED', result: null, cost: null },
    { id: 'MS2', date: '2026-07-09', time: '08:00-09:00', equipment: 'FL-004', type: 'DAILY', technician: 'Suresh Tech', status: 'IN_PROGRESS', result: null, cost: null },
    { id: 'MS3', date: '2026-07-08', time: '14:00-16:00', equipment: 'RT-001', type: 'MONTHLY', technician: 'Ramesh Tech', status: 'COMPLETED', result: 'PASS', cost: 4500 },
    { id: 'MS4', date: '2026-07-10', time: '09:00-11:00', equipment: 'ST-001', type: 'WEEKLY', technician: 'Anil Tech', status: 'SCHEDULED', result: null, cost: null },
    { id: 'MS5', date: '2026-07-07', time: '10:00-12:00', equipment: 'FL-002', type: 'CALIBRATION', technician: 'Ramesh Tech', status: 'OVERDUE', result: null, cost: null },
    { id: 'MS6', date: '2026-07-20', time: '08:00-17:00', equipment: 'FL-001', type: 'ANNUAL', technician: 'Multi-Tech Team', status: 'SCHEDULED', result: null, cost: null },
  ]

  const tasks = [
    { id: 'T1', num: 'MT-2026-018', equipment: 'FL-004', type: 'REPAIR', desc: 'Hydraulic system repair', technician: 'Suresh Tech', scheduled: '2026-07-09 08:00', status: 'IN_PROGRESS', result: null, parts: ['Hydraulic pump', 'Seal kit'], cost: 18500 },
    { id: 'T2', num: 'MT-2026-017', equipment: 'RT-001', type: 'SERVICE', desc: 'Monthly service — mast chain lubrication', technician: 'Ramesh Tech', scheduled: '2026-07-08 14:00', status: 'COMPLETED', result: 'PASS', parts: ['Chain lube'], cost: 4500 },
    { id: 'T3', num: 'MT-2026-016', equipment: 'FL-001', type: 'INSPECTION', desc: 'Weekly safety inspection', technician: 'Anil Tech', scheduled: '2026-07-15 10:00', status: 'OPEN', result: null, parts: [], cost: null },
    { id: 'T4', num: 'MT-2026-015', equipment: 'SC-006', type: 'REPAIR', desc: 'Scanner trigger button replacement', technician: 'Suresh Tech', scheduled: '2026-07-10 11:00', status: 'OPEN', result: null, parts: ['Trigger button'], cost: 850 },
    { id: 'T5', num: 'MT-2026-014', equipment: 'PR-001', type: 'CALIBRATION', desc: 'Print head calibration', technician: 'Ramesh Tech', scheduled: '2026-07-12 09:00', status: 'ASSIGNED', result: null, parts: [], cost: null },
  ]

  const plans = [
    { code: 'MP-001', name: 'Forklift Weekly Inspection', applies: 'EQUIPMENT_TYPE', type: 'FORKLIFT', freq: 'WEEKLY', interval: 1, unit: 'WEEKS', maintType: 'INSPECTION', duration: 60, active: true, lastExec: '2026-07-01', nextExec: '2026-07-08' },
    { code: 'MP-002', name: 'Reach Truck Monthly Service', applies: 'EQUIPMENT_TYPE', type: 'REACH_TRUCK', freq: 'MONTHLY', interval: 1, unit: 'MONTHS', maintType: 'SERVICE', duration: 120, active: true, lastExec: '2026-06-08', nextExec: '2026-07-08' },
    { code: 'MP-003', name: 'Forklift Annual Overhaul', applies: 'EQUIPMENT_TYPE', type: 'FORKLIFT', freq: 'ANNUAL', interval: 1, unit: 'MONTHS', maintType: 'OVERHAUL', duration: 480, active: true, lastExec: '2025-07-20', nextExec: '2026-07-20' },
    { code: 'MP-004', name: 'Scanner Print Head Calibration', applies: 'EQUIPMENT_TYPE', type: 'LABEL_PRINTER', freq: 'CALIBRATION', interval: 3, unit: 'MONTHS', maintType: 'CALIBRATION', duration: 30, active: true, lastExec: '2026-04-12', nextExec: '2026-07-12' },
    { code: 'MP-005', name: 'Forklift Run-Based Service (250h)', applies: 'EQUIPMENT_TYPE', type: 'FORKLIFT', freq: 'RUN_BASED', interval: 250, unit: 'HOURS', maintType: 'SERVICE', duration: 180, active: true, lastExec: '2026-06-15', nextExec: null },
  ]

  const stats = [
    { label: 'Scheduled (7d)', value: schedule.filter(s => s.status === 'SCHEDULED').length, color: 'text-blue-600' },
    { label: 'In Progress', value: schedule.filter(s => s.status === 'IN_PROGRESS').length, color: 'text-amber-600' },
    { label: 'Completed', value: schedule.filter(s => s.status === 'COMPLETED').length, color: 'text-emerald-600' },
    { label: 'Overdue', value: schedule.filter(s => s.status === 'OVERDUE').length, color: 'text-rose-600' },
    { label: 'Active Plans', value: plans.filter(p => p.active).length, color: 'text-purple-600' },
    { label: 'Open Tasks', value: tasks.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Maintenance Planner</h2><p className="text-sm text-muted-foreground mt-1">Preventive maintenance · daily/weekly/monthly/quarterly/annual · calibration · run-based</p></div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Schedule Maintenance</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <div className="flex rounded-md border overflow-hidden w-fit">
        {(['schedule', 'tasks', 'plans'] as const).map(v => <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 text-sm font-medium capitalize ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{v}</button>)}
      </div>

      {view === 'schedule' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Maintenance Schedule</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr>
                <th className="text-left px-4 py-3 font-medium">Date / Time</th><th className="text-left px-4 py-3 font-medium">Equipment</th>
                <th className="text-left px-4 py-3 font-medium">Type</th><th className="text-left px-4 py-3 font-medium">Technician</th>
                <th className="text-left px-4 py-3 font-medium">Result</th><th className="text-left px-4 py-3 font-medium">Cost</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {schedule.map(s => {
                  const b = s28BadgeForStatus(s.status)
                  return (
                    <tr key={s.id} className={`border-b hover:bg-muted/30 ${s.status === 'OVERDUE' ? 'bg-rose-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs"><div>{s.date}</div><div className="text-muted-foreground">{s.time}</div></td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{s.equipment}</td>
                      <td className="px-4 py-3"><span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{s.type}</span></td>
                      <td className="px-4 py-3 text-xs">{s.technician}</td>
                      <td className="px-4 py-3 text-xs">{s.result ? <span className={s.result === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}>{s.result}</span> : '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.cost ? `₹${s.cost.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === 'tasks' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Maintenance Tasks</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr>
                <th className="text-left px-4 py-3 font-medium">Task #</th><th className="text-left px-4 py-3 font-medium">Equipment</th>
                <th className="text-left px-4 py-3 font-medium">Type</th><th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Technician</th><th className="text-left px-4 py-3 font-medium">Scheduled</th>
                <th className="text-left px-4 py-3 font-medium">Parts</th><th className="text-left px-4 py-3 font-medium">Cost</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {tasks.map(t => {
                  const b = s28BadgeForStatus(t.status)
                  return (
                    <tr key={t.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs text-blue-700">{t.num}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.equipment}</td>
                      <td className="px-4 py-3"><span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{t.type}</span></td>
                      <td className="px-4 py-3 text-xs">{t.desc}</td>
                      <td className="px-4 py-3 text-xs">{t.technician}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.scheduled}</td>
                      <td className="px-4 py-3 text-[10px]">{t.parts.length > 0 ? t.parts.join(', ') : '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.cost ? `₹${t.cost.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === 'plans' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Maintenance Plans</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr>
                <th className="text-left px-4 py-3 font-medium">Code</th><th className="text-left px-4 py-3 font-medium">Plan Name</th>
                <th className="text-left px-4 py-3 font-medium">Applies To</th><th className="text-left px-4 py-3 font-medium">Frequency</th>
                <th className="text-left px-4 py-3 font-medium">Type</th><th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Last Exec</th><th className="text-left px-4 py-3 font-medium">Next Exec</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.code} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{p.code}</td>
                    <td className="px-4 py-3 text-xs">{p.name}</td>
                    <td className="px-4 py-3 text-[10px] font-mono">{p.type}</td>
                    <td className="px-4 py-3 text-[10px]"><span className="font-mono">{p.freq}</span> · {p.interval} {p.unit}</td>
                    <td className="px-4 py-3 text-[10px] font-mono">{p.maintType}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.duration}m</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.lastExec}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.nextExec || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
        <h3 className="font-semibold mb-3 text-sm">Maintenance Workflow</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {['Equipment', 'Maintenance Due', 'Work Order', 'Technician', 'Service', 'Available'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-white border rounded-md font-medium">{step}</div>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-blue-600" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 6: Breakdown Console Module ───────────────────
