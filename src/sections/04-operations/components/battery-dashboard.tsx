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

export function BatteryDashboardModule() {
  const batteries = [
    { id: 'B1', code: 'BAT-FL-001', equipment: 'FL-001', type: 'LITHIUM_ION', voltage: 48, capacity: 600, percent: 78, charging: 'NOT_CHARGING', health: 92, cycles: 412, maxCycles: 1500, station: null, lastCharged: 'Today 06:00', replacement: '2027-06-15', replaceRec: false },
    { id: 'B2', code: 'BAT-FL-002', equipment: 'FL-002', type: 'LITHIUM_ION', voltage: 48, capacity: 600, percent: 62, charging: 'NOT_CHARGING', health: 88, cycles: 487, maxCycles: 1500, station: null, lastCharged: 'Today 05:30', replacement: '2027-04-20', replaceRec: false },
    { id: 'B3', code: 'BAT-FL-003', equipment: 'FL-003', type: 'LITHIUM_ION', voltage: 48, capacity: 750, percent: 95, charging: 'NOT_CHARGING', health: 99, cycles: 78, maxCycles: 1500, station: null, lastCharged: 'Today 07:00', replacement: '2028-07-01', replaceRec: false },
    { id: 'B4', code: 'BAT-RT-001', equipment: 'RT-001', type: 'LITHIUM_ION', voltage: 80, capacity: 800, percent: 45, charging: 'NOT_CHARGING', health: 65, cycles: 1240, maxCycles: 1500, station: null, lastCharged: 'Today 04:00', replacement: '2026-09-10', replaceRec: true },
    { id: 'B5', code: 'BAT-ST-001', equipment: 'ST-001', type: 'LEAD_ACID', voltage: 24, capacity: 250, percent: 23, charging: 'CHARGING', health: 78, cycles: 320, maxCycles: 500, station: 'CS-01', lastCharged: 'Yesterday 18:00', replacement: '2026-12-25', replaceRec: false },
    { id: 'B6', code: 'BAT-SC-001', equipment: 'SC-001', type: 'LITHIUM_ION', voltage: 3.7, capacity: 4.5, percent: 88, charging: 'NOT_CHARGING', health: 95, cycles: 142, maxCycles: 1000, station: null, lastCharged: 'Today 06:30', replacement: '2027-05-12', replaceRec: false },
  ]

  const stations = [
    { code: 'CS-01', name: 'Charging Station 01', type: 'MULTI_BAY', zone: 'Charging Room', bays: 4, occupied: 2, voltage: 48, current: 30, status: 'PARTIAL' },
    { code: 'CS-02', name: 'Charging Station 02', type: 'FAST_CHARGE', zone: 'Charging Room', bays: 2, occupied: 0, voltage: 80, current: 50, status: 'AVAILABLE' },
    { code: 'CS-03', name: 'Charging Station 03', type: 'SINGLE_BAY', zone: 'Zone B', bays: 1, occupied: 1, voltage: 48, current: 30, status: 'FULL' },
    { code: 'CS-04', name: 'Charging Station 04', type: 'SWAP_STATION', zone: 'Zone E', bays: 6, occupied: 4, voltage: 48, current: 30, status: 'PARTIAL' },
  ]

  const alerts = [
    { sev: 'CRITICAL', msg: 'BAT-RT-001 health 65% — replacement recommended (1240/1500 cycles)', battery: 'BAT-RT-001' },
    { sev: 'WARNING', msg: 'BAT-ST-001 battery at 23% — currently charging at CS-01', battery: 'BAT-ST-001' },
    { sev: 'WARNING', msg: 'BAT-FL-002 battery at 62% — monitor for recharge', battery: 'BAT-FL-002' },
    { sev: 'INFO', msg: 'BAT-FL-003 fully charged (95%) — ready for assignment', battery: 'BAT-FL-003' },
  ]

  const stats = [
    { label: 'Total Batteries', value: batteries.length, color: 'text-blue-600' },
    { label: 'Avg Health', value: `${Math.round(batteries.reduce((a, b) => a + b.health, 0) / batteries.length)}%`, color: 'text-emerald-600' },
    { label: 'Charging Now', value: batteries.filter(b => b.charging === 'CHARGING').length, color: 'text-blue-600' },
    { label: 'Low Battery', value: batteries.filter(b => b.percent < 30).length, color: 'text-amber-600' },
    { label: 'Replace Recommended', value: batteries.filter(b => b.replaceRec).length, color: 'text-rose-600' },
    { label: 'Avg Cycles', value: Math.round(batteries.reduce((a, b) => a + b.cycles, 0) / batteries.length), color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Battery &amp; Charging Dashboard</h2><p className="text-sm text-muted-foreground mt-1">Battery health · cycle count · charging stations · replacement forecasting</p></div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <h3 className="font-semibold mb-3">Battery Status — All Equipment</h3>
          <div className="space-y-2">
            {batteries.map(bat => {
              const batteryColor = bat.percent > 60 ? 'bg-emerald-500' : bat.percent > 30 ? 'bg-amber-500' : bat.percent > 10 ? 'bg-orange-500' : 'bg-rose-500'
              const healthColor = bat.health > 80 ? 'text-emerald-600' : bat.health > 60 ? 'text-amber-600' : 'text-rose-600'
              return (
                <div key={bat.id} className={`p-3 border rounded ${bat.replaceRec ? 'border-rose-300 bg-rose-50/30' : bat.percent < 30 ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs font-semibold text-blue-700 w-28">{bat.code}</div>
                    <div className="text-xs text-muted-foreground w-20">{bat.equipment}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground w-10">Charge:</span><div className="flex-1 h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${batteryColor}`} style={{ width: `${bat.percent}%` }} /></div><span className="text-[10px] font-mono w-8">{bat.percent}%{bat.charging === 'CHARGING' && ' ⚡'}</span></div>
                      <div className="flex items-center gap-2 mt-1"><span className="text-[10px] text-muted-foreground w-10">Health:</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${bat.health > 80 ? 'bg-emerald-500' : bat.health > 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${bat.health}%` }} /></div><span className={`text-[10px] font-mono w-12 ${healthColor}`}>{bat.health}%</span></div>
                    </div>
                    <div className="text-right text-[10px]">
                      <div className="font-mono">{bat.cycles}/{bat.maxCycles}</div>
                      <div className="text-muted-foreground">{bat.type.replace(/_/g, ' ')}</div>
                    </div>
                    {bat.replaceRec && <Badge variant="destructive" className="text-[9px]">REPLACE</Badge>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Charging Stations</h3>
            <div className="space-y-2">
              {stations.map(s => {
                const b = s28BadgeForStatus(s.status)
                return (
                  <div key={s.code} className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold">{s.code}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${b.cls}`}>{b.label}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{s.name} · {s.type.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-muted-foreground">Zone: {s.zone}</div>
                    <div className="flex items-center gap-2 mt-1"><span className="text-[10px] text-muted-foreground">Bays:</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${s.occupied === s.bays ? 'bg-rose-500' : s.occupied > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(s.occupied / s.bays) * 100}%` }} /></div><span className="text-[10px] font-mono">{s.occupied}/{s.bays}</span></div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Battery Alerts</h3>
            <div className="space-y-2">
              {alerts.map((a, i) => {
                const cls = a.sev === 'CRITICAL' ? 'border-rose-300 bg-rose-50' : a.sev === 'WARNING' ? 'border-amber-300 bg-amber-50' : 'border-blue-300 bg-blue-50'
                const txt = a.sev === 'CRITICAL' ? 'text-rose-700' : a.sev === 'WARNING' ? 'text-amber-700' : 'text-blue-700'
                return (
                  <div key={i} className={`p-2 rounded border ${cls}`}>
                    <span className={`text-[10px] font-bold ${txt}`}>{a.sev}</span>
                    <p className="text-xs mt-0.5">{a.msg}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Epic 5: Maintenance Planner Module ─────────────────
