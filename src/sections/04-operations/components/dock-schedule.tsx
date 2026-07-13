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

export function DockScheduleModule() {
  const docks = [
    { code: 'DOCK-01', name: 'Receiving Dock 01', type: 'RECEIVING', status: 'OCCUPIED', vehicle: 'MH12-AB-1234', util: 78, ops: 4, cold: false, bulk: false, leveler: true, seal: false },
    { code: 'DOCK-02', name: 'Receiving Dock 02', type: 'RECEIVING', status: 'OCCUPIED', vehicle: 'KA05-CD-5678', util: 92, ops: 6, cold: false, bulk: false, leveler: true, seal: true },
    { code: 'DOCK-03', name: 'Shared Dock 03', type: 'SHARED', status: 'AVAILABLE', vehicle: null, util: 45, ops: 3, cold: false, bulk: false, leveler: true, seal: false },
    { code: 'DOCK-04', name: 'Bulk Dock 04', type: 'BULK', status: 'MAINTENANCE', vehicle: null, util: 0, ops: 0, cold: false, bulk: true, leveler: true, seal: false },
    { code: 'DOCK-05', name: 'Dispatch Dock 05', type: 'DISPATCH', status: 'OCCUPIED', vehicle: 'DL01-EF-9012', util: 85, ops: 5, cold: false, bulk: false, leveler: true, seal: true },
    { code: 'DOCK-06', name: 'Dispatch Dock 06', type: 'DISPATCH', status: 'AVAILABLE', vehicle: null, util: 62, ops: 4, cold: false, bulk: false, leveler: true, seal: false },
    { code: 'DOCK-07', name: 'Express Dock 07', type: 'EXPRESS', status: 'AVAILABLE', vehicle: null, util: 38, ops: 8, cold: false, bulk: false, leveler: true, seal: false },
    { code: 'DOCK-COLD-01', name: 'Cold Receiving Dock', type: 'COLD', status: 'OCCUPIED', vehicle: 'TN09-GH-3456', util: 71, ops: 2, cold: true, bulk: false, leveler: true, seal: true },
    { code: 'DOCK-COLD-02', name: 'Cold Dispatch Dock', type: 'COLD', status: 'AVAILABLE', vehicle: null, util: 55, ops: 3, cold: true, bulk: false, leveler: true, seal: false },
  ]

  const schedule = [
    { dock: 'DOCK-01', time: '10:00-11:00', vehicle: 'MH12-AB-1234', carrier: 'VRL Logistics', type: 'APPOINTMENT', status: 'IN_PROGRESS' },
    { dock: 'DOCK-01', time: '11:30-12:30', vehicle: 'MH04-XY-1111', carrier: 'In-House', type: 'APPOINTMENT', status: 'CONFIRMED' },
    { dock: 'DOCK-02', time: '10:00-11:00', vehicle: 'KA05-CD-5678', carrier: 'In-House', type: 'APPOINTMENT', status: 'IN_PROGRESS' },
    { dock: 'DOCK-02', time: '11:30-12:30', vehicle: '—', carrier: '—', type: 'WALK_IN', status: 'SCHEDULED' },
    { dock: 'DOCK-05', time: '10:00-11:00', vehicle: 'DL01-EF-9012', carrier: 'Blue Dart', type: 'CROSS_DOCK', status: 'IN_PROGRESS' },
    { dock: 'DOCK-05', time: '11:30-13:00', vehicle: 'TN09-BB-4444', carrier: 'In-House', type: 'PRIORITY', status: 'CONFIRMED' },
    { dock: 'DOCK-07', time: '10:00-10:30', vehicle: 'GJ01-KL-1234', carrier: '—', type: 'PRIORITY', status: 'COMPLETED' },
    { dock: 'DOCK-COLD-01', time: '11:00-12:30', vehicle: 'TN09-GH-3456', carrier: 'Cold Chain Logistics', type: 'APPOINTMENT', status: 'IN_PROGRESS' },
  ]

  const typeIcons: Record<string, React.ReactNode> = { RECEIVING: <ArrowDownToLine className="h-4 w-4" />, DISPATCH: <ArrowUpFromLine className="h-4 w-4" />, SHARED: <ArrowLeftRight className="h-4 w-4" />, COLD: <Snowflake className="h-4 w-4" />, BULK: <Package className="h-4 w-4" />, EXPRESS: <Zap className="h-4 w-4" /> }
  const typeColors: Record<string, string> = { RECEIVING: 'bg-emerald-100 text-emerald-700', DISPATCH: 'bg-amber-100 text-amber-700', SHARED: 'bg-blue-100 text-blue-700', COLD: 'bg-cyan-100 text-cyan-700', BULK: 'bg-purple-100 text-purple-700', EXPRESS: 'bg-orange-100 text-orange-700' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Dock Door Scheduling</h2><p className="text-sm text-muted-foreground mt-1">Receiving · Dispatch · Shared · Cold · Bulk · Express docks with capacity planning</p></div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Appointment</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Docks', value: docks.length, color: 'text-blue-600' },
          { label: 'Available', value: docks.filter(d => d.status === 'AVAILABLE').length, color: 'text-emerald-600' },
          { label: 'Occupied', value: docks.filter(d => d.status === 'OCCUPIED').length, color: 'text-amber-600' },
          { label: 'Maintenance', value: docks.filter(d => d.status === 'MAINTENANCE').length, color: 'text-orange-600' },
          { label: 'Avg Utilization', value: `${Math.round(docks.reduce((a, d) => a + d.util, 0) / docks.length)}%`, color: 'text-purple-600' },
        ].map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">New yard/ module (DockSchedule)</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dock Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {docks.map(d => {
            const b = s28BadgeForStatus(d.status)
            return (
              <Card key={d.code} className={`p-3 ${d.status === 'MAINTENANCE' ? 'border-orange-300 bg-orange-50/30' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2"><div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColors[d.type]}`}>{typeIcons[d.type]}</div><div><div className="font-mono font-semibold text-xs">{d.code}</div><div className="text-[10px] text-muted-foreground">{d.name}</div></div></div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.cls}`}>{b.label}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Current Vehicle:</span><span className="font-mono">{d.vehicle || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ops Today:</span><span className="font-mono">{d.ops}</span></div>
                  <div><div className="flex justify-between text-[10px] text-muted-foreground"><span>Utilization</span><span>{d.util}%</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${d.util > 80 ? 'bg-rose-500' : d.util > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${d.util}%` }} /></div></div>
                  <div className="flex gap-1 pt-1">
                    {d.cold && <span className="text-[9px] px-1 py-0.5 bg-cyan-100 text-cyan-700 rounded">COLD</span>}
                    {d.bulk && <span className="text-[9px] px-1 py-0.5 bg-purple-100 text-purple-700 rounded">BULK</span>}
                    {d.leveler && <span className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-700 rounded">LEVELER</span>}
                    {d.seal && <span className="text-[9px] px-1 py-0.5 bg-emerald-100 text-emerald-700 rounded">SEAL</span>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Today's Schedule */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Today&apos;s Schedule</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto suop-main-scroll">
            {schedule.map((s, i) => {
              const b = s28BadgeForStatus(s.status)
              const bookingColors: Record<string, string> = { APPOINTMENT: 'bg-blue-50', WALK_IN: 'bg-amber-50', CROSS_DOCK: 'bg-purple-50', PRIORITY: 'bg-orange-50' }
              return (
                <div key={i} className={`p-2 rounded border ${bookingColors[s.type] || 'bg-muted'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold">{s.dock}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.cls}`}>{b.label}</span>
                  </div>
                  <div className="text-xs font-medium">{s.time}</div>
                  <div className="text-[11px] text-muted-foreground">{s.vehicle} · {s.carrier}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.type.replace(/_/g, ' ')}</div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Epic 2: Yard Map Module ────────────────────────────
