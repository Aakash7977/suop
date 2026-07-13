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

export function ForkliftDashboardModule() {
  const forklifts = [
    { id: 'F1', code: 'FL-001', type: 'ELECTRIC_FORKLIFT', mfr: 'Toyota', model: '8FBE15', capacity: '1500 kg', lift: '3000 mm', battery: 78, op: 'Rajesh K.', zone: 'C-Picking', task: 'TASK-2026-002', hours: 1245.5, sinceService: 124, status: 'IN_USE', nextService: '250h or 2026-09-15' },
    { id: 'F2', code: 'FL-002', type: 'ELECTRIC_FORKLIFT', mfr: 'Godrej', model: 'GXE-15T', capacity: '1500 kg', lift: '3000 mm', battery: 62, op: 'Suresh M.', zone: 'E-Dispatch', task: 'TASK-2026-001', hours: 982.3, sinceService: 82, status: 'IN_USE', nextService: '250h or 2026-09-20' },
    { id: 'F3', code: 'FL-003', type: 'ELECTRIC_FORKLIFT', mfr: 'Toyota', model: '8FBE20', capacity: '2000 kg', lift: '3500 mm', battery: 95, op: null, zone: 'B-Bulk', task: null, hours: 456.8, sinceService: 56, status: 'AVAILABLE', nextService: '250h or 2026-10-01' },
    { id: 'F4', code: 'RT-001', type: 'REACH_TRUCK', mfr: 'Crown', model: 'RR5200', capacity: '2000 kg', lift: '9000 mm', battery: 45, op: 'Mahesh R.', zone: 'B-Bulk', task: 'TASK-2026-007', hours: 1876.2, sinceService: 245, status: 'IN_USE', nextService: '250h or 2026-08-10' },
    { id: 'F5', code: 'ST-001', type: 'PALLET_STACKER', mfr: 'Godrej', model: 'GSX-10', capacity: '1000 kg', lift: '2000 mm', battery: 23, op: null, zone: 'Charging Bay', task: null, hours: 734.1, sinceService: 134, status: 'CHARGING', nextService: '250h or 2026-09-25' },
    { id: 'F6', code: 'FL-004', type: 'ELECTRIC_FORKLIFT', mfr: 'Toyota', model: '8FBE15', capacity: '1500 kg', lift: '3000 mm', battery: 0, op: null, zone: 'Maintenance', task: null, hours: 2104.7, sinceService: 304, status: 'BREAKDOWN', nextService: 'OVERDUE — hydraulic failure' },
    { id: 'F7', code: 'OP-001', type: 'ORDER_PICKER', mfr: 'Crown', model: 'OP-9000', capacity: '500 kg', lift: '9000 mm', battery: 71, op: 'Priya N.', zone: 'C-Picking', task: 'TASK-2026-015', hours: 312.4, sinceService: 38, status: 'IN_USE', nextService: '250h or 2026-11-01' },
  ]

  const assignments = [
    { id: 'A1', forklift: 'FL-001', op: 'Rajesh K.', task: 'TASK-2026-002', zone: 'C-Picking', assigned: '08:30', duration: 95, hours: 1.5, status: 'ACTIVE', condition: 'GOOD' },
    { id: 'A2', forklift: 'FL-002', op: 'Suresh M.', task: 'TASK-2026-001', zone: 'E-Dispatch', assigned: '08:15', duration: 110, hours: 1.8, status: 'ACTIVE', condition: 'GOOD' },
    { id: 'A3', forklift: 'RT-001', op: 'Mahesh R.', task: 'TASK-2026-007', zone: 'B-Bulk', assigned: '09:00', duration: 65, hours: 1.1, status: 'ACTIVE', condition: 'GOOD' },
    { id: 'A4', forklift: 'OP-001', op: 'Priya N.', task: 'TASK-2026-015', zone: 'C-Picking', assigned: '09:15', duration: 48, hours: 0.8, status: 'ACTIVE', condition: 'MINOR_DAMAGE' },
  ]

  const stats = [
    { label: 'Total Fleet', value: forklifts.length, color: 'text-blue-600' },
    { label: 'In Use', value: forklifts.filter(f => f.status === 'IN_USE').length, color: 'text-amber-600' },
    { label: 'Available', value: forklifts.filter(f => f.status === 'AVAILABLE').length, color: 'text-emerald-600' },
    { label: 'Charging', value: forklifts.filter(f => f.status === 'CHARGING').length, color: 'text-blue-600' },
    { label: 'Breakdown', value: forklifts.filter(f => f.status === 'BREAKDOWN').length, color: 'text-rose-600' },
    { label: 'Avg Battery', value: `${Math.round(forklifts.reduce((a, f) => a + (f.battery || 0), 0) / forklifts.length)}%`, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Forklift Fleet Dashboard</h2><p className="text-sm text-muted-foreground mt-1">Electric / Diesel / Reach Truck / Order Picker / Pallet Stacker — battery · operator · task · maintenance</p></div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forklifts.map(f => {
          const b = s28BadgeForStatus(f.status)
          const batteryColor = f.battery > 60 ? 'bg-emerald-500' : f.battery > 30 ? 'bg-amber-500' : f.battery > 10 ? 'bg-orange-500' : 'bg-rose-500'
          const typeColors: Record<string, string> = { ELECTRIC_FORKLIFT: 'bg-blue-100 text-blue-700', DIESEL_FORKLIFT: 'bg-amber-100 text-amber-700', REACH_TRUCK: 'bg-purple-100 text-purple-700', ORDER_PICKER: 'bg-emerald-100 text-emerald-700', PALLET_STACKER: 'bg-orange-100 text-orange-700' }
          const serviceOverdue = f.sinceService > 250
          return (
            <Card key={f.id} className={`p-4 ${f.status === 'BREAKDOWN' ? 'border-rose-300 bg-rose-50/30' : serviceOverdue ? 'border-orange-300 bg-orange-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center"><Truck className="h-5 w-5 text-amber-700" /></div>
                  <div>
                    <div className="font-mono font-semibold text-sm">{f.code}</div>
                    <div className="text-[10px] text-muted-foreground">{f.mfr} {f.model}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[f.type]}`}>{f.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Capacity:</span><span className="font-mono">{f.capacity}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lift Height:</span><span className="font-mono">{f.lift}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zone:</span><span className="font-mono">{f.zone}</span></div>
                {f.op && <div className="flex justify-between"><span className="text-muted-foreground">Operator:</span><span>{f.op}</span></div>}
                {f.task && <div className="flex justify-between"><span className="text-muted-foreground">Task:</span><span className="font-mono text-blue-600">{f.task}</span></div>}
                <div className="flex items-center gap-2 mt-2"><span className="text-muted-foreground text-[10px] w-16">Battery:</span><div className="flex-1 h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${batteryColor}`} style={{ width: `${f.battery}%` }} /></div><span className="text-[10px] font-mono w-8">{f.battery}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Op Hours:</span><span className="font-mono">{f.hours}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Since Service:</span><span className={`font-mono ${serviceOverdue ? 'text-rose-600 font-bold' : f.sinceService > 200 ? 'text-amber-600' : ''}`}>{f.sinceService}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Next Service:</span><span className={`font-mono ${f.status === 'BREAKDOWN' ? 'text-rose-600' : 'text-orange-600'}`}>{f.nextService}</span></div>
              </div>
              <div className="mt-2"><span className={`text-xs px-2 py-1 rounded ${b.cls} block text-center`}>{b.label}</span></div>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Active Forklift Assignments</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-2 font-medium">Forklift</th><th className="text-left px-4 py-2 font-medium">Operator</th>
              <th className="text-left px-4 py-2 font-medium">Task</th><th className="text-left px-4 py-2 font-medium">Zone</th>
              <th className="text-left px-4 py-2 font-medium">Assigned</th><th className="text-left px-4 py-2 font-medium">Duration</th>
              <th className="text-left px-4 py-2 font-medium">Op Hours</th><th className="text-left px-4 py-2 font-medium">Condition</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs font-semibold text-blue-700">{a.forklift}</td>
                  <td className="px-4 py-2 text-xs">{a.op}</td>
                  <td className="px-4 py-2 font-mono text-xs">{a.task}</td>
                  <td className="px-4 py-2 font-mono text-xs">{a.zone}</td>
                  <td className="px-4 py-2 font-mono text-xs">{a.assigned}</td>
                  <td className="px-4 py-2 font-mono text-xs">{a.duration}m</td>
                  <td className="px-4 py-2 font-mono text-xs">{a.hours}h</td>
                  <td className="px-4 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${a.condition === 'GOOD' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{a.condition.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-2"><span className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 3: Scanner Management Module ──────────────────
