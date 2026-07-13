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

export function ControlTowerModule() {
  const [liveMode, setLiveMode] = useState(true)

  const kpis = [
    { label: 'Tasks / Hour', value: 42, target: 50, trend: '+8%', color: 'text-emerald-600' },
    { label: 'Orders / Hour', value: 18, target: 20, trend: '+12%', color: 'text-emerald-600' },
    { label: 'Avg Completion', value: '4.2 min', target: '3.5 min', trend: '-5%', color: 'text-amber-600' },
    { label: 'Operator Util', value: '78%', target: '85%', trend: '+3%', color: 'text-emerald-600' },
    { label: 'Equipment Util', value: '64%', target: '70%', trend: '+2%', color: 'text-emerald-600' },
    { label: 'Warehouse Eff', value: '92%', target: '95%', trend: '+1%', color: 'text-emerald-600' },
  ]

  const zoneHeat = [
    { zone: 'A-Receiving', load: 75, color: 'bg-amber-500', tasks: 6 },
    { zone: 'B-Bulk', load: 45, color: 'bg-emerald-500', tasks: 3 },
    { zone: 'C-Picking', load: 92, color: 'bg-rose-500', tasks: 14 },
    { zone: 'D-Pack', load: 68, color: 'bg-amber-500', tasks: 8 },
    { zone: 'E-Dispatch', load: 88, color: 'bg-rose-500', tasks: 11 },
    { zone: 'F-Cold', load: 30, color: 'bg-emerald-500', tasks: 2 },
  ]

  const dockActivity = [
    { dock: 'DOCK-01', status: 'LOADING', vehicle: 'MH12-AB-1234', carrier: 'VRL Logistics', eta: 'On Time', progress: 65 },
    { dock: 'DOCK-02', status: 'UNLOADING', vehicle: 'KA05-CD-5678', carrier: 'In-House', eta: 'On Time', progress: 40 },
    { dock: 'DOCK-03', status: 'IDLE', vehicle: null, carrier: null, eta: null, progress: 0 },
    { dock: 'DOCK-04', status: 'LOADING', vehicle: 'DL01-EF-9012', carrier: 'Blue Dart', eta: '5 min late', progress: 85 },
    { dock: 'DOCK-05', status: 'MAINTENANCE', vehicle: null, carrier: null, eta: null, progress: 0 },
  ]

  const vehicleQueue = [
    { id: 'Q1', vehicle: 'MH12-XY-1111', type: 'INBOUND', purpose: 'Delivery', arrival: '10:30', status: 'WAITING', bay: null, dock: null },
    { id: 'Q2', vehicle: 'KA05-ZZ-2222', type: 'OUTBOUND', purpose: 'Dispatch', arrival: '10:45', status: 'ASSIGNED', bay: null, dock: 'DOCK-04' },
    { id: 'Q3', vehicle: 'DL01-AA-3333', type: 'INBOUND', purpose: 'Returns', arrival: '11:00', status: 'WAITING', bay: null, dock: null },
    { id: 'Q4', vehicle: 'TN09-BB-4444', type: 'OUTBOUND', purpose: 'Dispatch', arrival: '11:15', status: 'CHECKED_IN', bay: 'BAY-2', dock: null },
  ]

  const alerts = [
    { sev: 'CRITICAL', msg: 'SLA breach on TASK-2026-009 (WAVE-2026-004)', time: '2 min ago' },
    { sev: 'HIGH', msg: 'FL-005 out of service — hydraulic failure', time: '15 min ago' },
    { sev: 'WARNING', msg: 'FL-004 battery low (15%) — schedule charging', time: '20 min ago' },
    { sev: 'WARNING', msg: 'Operator OP-007 marked absent — shift uncovered', time: '35 min ago' },
    { sev: 'INFO', msg: 'WAVE-2026-001 reached 64% completion', time: '1 hour ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Warehouse Control Tower</h2><p className="text-sm text-muted-foreground mt-1">Real-time operational visibility · live KPIs · dock · yard · alerts</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><Switch checked={liveMode} onCheckedChange={setLiveMode} />{liveMode ? <span className="text-xs text-emerald-600 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />LIVE</span> : <span className="text-xs text-muted-foreground">PAUSED</span>}</div>
          <Badge variant="outline"><Activity className="mr-1 h-3 w-3" />Updated: just now</Badge>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</p>
            <p className="text-xl font-bold mt-1">{k.value}</p>
            <div className="flex items-center justify-between mt-1"><span className={`text-[10px] ${k.color}`}>{k.trend}</span><span className="text-[10px] text-muted-foreground">Target: {k.target}</span></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Zone Heat Map */}
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Warehouse Zone Heat Map</h3><Badge variant="outline">{liveMode && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />}Live Load</Badge></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {zoneHeat.map(z => (
              <div key={z.zone} className="p-3 rounded-lg border relative overflow-hidden">
                <div className={`absolute inset-0 ${z.color} opacity-10`} />
                <div className="relative">
                  <div className="text-xs font-semibold mb-1">{z.zone}</div>
                  <div className="text-2xl font-bold">{z.load}%</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{z.tasks} active tasks</div>
                  <div className="mt-2 h-1.5 bg-white/40 rounded-full overflow-hidden"><div className={`h-full ${z.color}`} style={{ width: `${z.load}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Live Alerts</h3><Badge variant="destructive" className="text-[10px]">{alerts.filter(a => a.sev === 'CRITICAL').length} CRITICAL</Badge></div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.map((a, i) => {
              const cls = a.sev === 'CRITICAL' ? 'border-rose-300 bg-rose-50' : a.sev === 'HIGH' ? 'border-orange-300 bg-orange-50' : a.sev === 'WARNING' ? 'border-amber-300 bg-amber-50' : 'border-blue-300 bg-blue-50'
              const txt = a.sev === 'CRITICAL' ? 'text-rose-700' : a.sev === 'HIGH' ? 'text-orange-700' : a.sev === 'WARNING' ? 'text-amber-700' : 'text-blue-700'
              return (
                <div key={i} className={`p-2 rounded border ${cls}`}>
                  <div className="flex items-start justify-between"><span className={`text-[10px] font-bold ${txt}`}>{a.sev}</span><span className="text-[10px] text-muted-foreground">{a.time}</span></div>
                  <p className="text-xs mt-0.5">{a.msg}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dock Activity */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Dock Activity</h3>
          <div className="space-y-2">
            {dockActivity.map(d => {
              const b = s28BadgeForStatus(d.status)
              return (
                <div key={d.dock} className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-16 font-mono text-xs font-semibold">{d.dock}</div>
                  <div className="flex-1">
                    {d.vehicle ? (<><div className="text-xs font-medium">{d.vehicle}</div><div className="text-[10px] text-muted-foreground">{d.carrier} · ETA: {d.eta}</div></>) : (<div className="text-xs text-muted-foreground">{d.status === 'MAINTENANCE' ? 'Under maintenance' : 'No vehicle'}</div>)}
                    {d.progress > 0 && <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${d.progress}%` }} /></div>}
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded ${b.cls}`}>{b.label}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Vehicle Queue */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Vehicle Yard Queue</h3>
          <div className="space-y-2">
            {vehicleQueue.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-2 border rounded">
                <Truck className={`h-4 w-4 ${v.type === 'INBOUND' ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div className="flex-1">
                  <div className="text-xs font-medium font-mono">{v.vehicle}</div>
                  <div className="text-[10px] text-muted-foreground">{v.type} · {v.purpose} · Arrived: {v.arrival}</div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${v.status === 'WAITING' ? 'bg-amber-100 text-amber-700' : v.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{v.status}</span>
                  {v.dock && <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{v.dock}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live Operators Grid */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Live Operator Status</h3><Badge variant="outline">7 Online · 1 Offline</Badge></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { name: 'Rajesh K.', task: 'PICK-003', util: 87, status: 'BUSY' },
            { name: 'Anita S.', task: 'COUNT', util: 82, status: 'BUSY' },
            { name: 'Suresh M.', task: 'PICK-001', util: 94, status: 'BUSY' },
            { name: 'Lakshmi V.', task: 'PACK-004', util: 68, status: 'BUSY' },
            { name: 'Ramesh P.', task: 'IDLE', util: 0, status: 'IDLE' },
            { name: 'Mahesh R.', task: 'REPL-007', util: 71, status: 'BUSY' },
            { name: 'Priya N.', task: 'PACK-008', util: 54, status: 'BUSY' },
            { name: 'Anil K.', task: '—', util: 0, status: 'OFFLINE' },
          ].map((o, i) => {
            const s = o.status === 'BUSY' ? 'bg-amber-500' : o.status === 'IDLE' ? 'bg-blue-500' : 'bg-slate-300'
            return (
              <div key={i} className="p-2 border rounded text-center">
                <div className="relative inline-block">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{o.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${s} border-2 border-background`} />
                </div>
                <div className="text-xs font-medium mt-1 truncate">{o.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{o.task}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{o.util}% util</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 6: SLA Dashboard Module ───────────────────────
