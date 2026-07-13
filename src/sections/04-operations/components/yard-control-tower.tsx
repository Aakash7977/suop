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

export function YardControlTowerModule() {
  const [liveMode, setLiveMode] = useState(true)

  const kpis = [
    { label: 'Vehicles Waiting', value: 5, target: 3, trend: '+2', color: 'text-amber-600' },
    { label: 'Loading', value: 2, target: 4, trend: '-1', color: 'text-blue-600' },
    { label: 'Unloading', value: 1, target: 2, trend: '0', color: 'text-purple-600' },
    { label: 'Avg Yard Time', value: '38m', target: '30m', trend: '+8m', color: 'text-amber-600' },
    { label: 'Dock Util %', value: '67%', target: '80%', trend: '+5%', color: 'text-emerald-600' },
    { label: 'Truck Turnaround', value: '52m', target: '45m', trend: '+7m', color: 'text-rose-600' },
    { label: 'Avg Queue Time', value: '18m', target: '15m', trend: '+3m', color: 'text-amber-600' },
    { label: 'Cross-Dock %', value: '34%', target: '40%', trend: '+2%', color: 'text-emerald-600' },
  ]

  const dockActivity = [
    { dock: 'DOCK-01', status: 'OCCUPIED', vehicle: 'MH12-AB-1234', operation: 'UNLOADING', progress: 65, eta: '15 min' },
    { dock: 'DOCK-02', status: 'OCCUPIED', vehicle: 'KA05-CD-5678', operation: 'UNLOADING', progress: 40, eta: '25 min' },
    { dock: 'DOCK-03', status: 'AVAILABLE', vehicle: null, operation: null, progress: 0, eta: null },
    { dock: 'DOCK-05', status: 'OCCUPIED', vehicle: 'DL01-EF-9012', operation: 'LOADING', progress: 85, eta: '5 min' },
    { dock: 'DOCK-06', status: 'AVAILABLE', vehicle: null, operation: null, progress: 0, eta: null },
    { dock: 'DOCK-07', status: 'AVAILABLE', vehicle: null, operation: null, progress: 0, eta: null },
    { dock: 'DOCK-COLD-01', status: 'OCCUPIED', vehicle: 'TN09-GH-3456', operation: 'UNLOADING', progress: 71, eta: '10 min' },
    { dock: 'DOCK-COLD-02', status: 'AVAILABLE', vehicle: null, operation: null, progress: 0, eta: null },
  ]

  const alerts = [
    { sev: 'CRITICAL', msg: 'Milk Tanker KA03-OP-9012 waiting 2m — cold chain priority boosted', time: '1 min ago' },
    { sev: 'HIGH', msg: 'Truck turnaround exceeded target by 7 minutes (52m vs 45m)', time: '5 min ago' },
    { sev: 'WARNING', msg: 'DOCK-04 still under maintenance — 1 hour delayed', time: '15 min ago' },
    { sev: 'WARNING', msg: 'Average queue time 18m — exceeds 15m target', time: '20 min ago' },
    { sev: 'INFO', msg: 'Cross-dock CD-2026-002 completed — 75 minutes saved', time: '30 min ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Yard Control Tower</h2><p className="text-sm text-muted-foreground mt-1">Real-time yard operations · dock activity · queue · gate · cross-dock</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><Switch checked={liveMode} onCheckedChange={setLiveMode} />{liveMode ? <span className="text-xs text-emerald-600 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />LIVE</span> : <span className="text-xs text-muted-foreground">PAUSED</span>}</div>
          <Badge variant="outline"><Activity className="mr-1 h-3 w-3" />Updated: just now</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</p>
            <p className="text-xl font-bold mt-1">{k.value}</p>
            <div className="flex items-center justify-between mt-1"><span className={`text-[10px] ${k.color}`}>{k.trend}</span><span className="text-[10px] text-muted-foreground">Target: {k.target}</span></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Dock Activity — Live</h3><Badge variant="outline">{liveMode && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />}8 docks</Badge></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dockActivity.map(d => {
              const b = s28BadgeForStatus(d.status)
              return (
                <div key={d.dock} className={`p-3 rounded-lg border ${d.status === 'OCCUPIED' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'}`}>
                  <div className="flex items-center justify-between mb-2"><span className="font-mono text-xs font-semibold">{d.dock}</span><span className={`text-[9px] px-1.5 py-0.5 rounded ${b.cls}`}>{b.label}</span></div>
                  {d.vehicle ? (<>
                    <div className="text-xs font-mono">{d.vehicle}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{d.operation}</div>
                    {d.progress > 0 && <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${d.progress}%` }} /></div>}
                    <div className="text-[10px] text-blue-600 mt-1">ETA: {d.eta}</div>
                  </>) : <div className="text-xs text-muted-foreground">Ready for assignment</div>}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Live Alerts</h3><Badge variant="destructive" className="text-[10px]">{alerts.filter(a => a.sev === 'CRITICAL').length} CRITICAL</Badge></div>
          <div className="space-y-2 max-h-80 overflow-y-auto suop-main-scroll">
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

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Cross-Dock Operations — Live</h3>
        <div className="space-y-2">
          {[
            { num: 'CD-2026-001', stage: 'CROSS_DOCK_IN_PROGRESS', from: 'DOCK-02', to: 'DOCK-07', progress: 65, eta: '20 min' },
            { num: 'CD-2026-004', stage: 'OUTBOUND_LOADED', from: 'DOCK-03', to: 'DOCK-06', progress: 88, eta: '5 min' },
            { num: 'CD-2026-005', stage: 'INBOUND_ARRIVED', from: 'DOCK-COLD-01', to: 'DOCK-COLD-02', progress: 25, eta: '45 min' },
          ].map(cd => (
            <div key={cd.num} className="flex items-center gap-3 p-2 border rounded">
              <span className="font-mono text-xs font-semibold text-blue-700 w-32">{cd.num}</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{cd.stage.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2 text-xs font-mono"><span className="text-emerald-600">{cd.from}</span><ArrowRight className="h-3 w-3" /><span className="text-amber-600">{cd.to}</span></div>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[200px]"><div className="h-full bg-purple-500" style={{ width: `${cd.progress}%` }} /></div>
              <span className="text-xs font-mono w-10">{cd.progress}%</span>
              <span className="text-xs text-blue-600">ETA: {cd.eta}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 8: Cross-Dock Analytics Module ────────────────
