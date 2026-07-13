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

export function EquipmentModule() {
  const equipment = [
    { id: 'E1', code: 'FL-001', type: 'FORKLIFT', make: 'Toyota', model: '8FBE15', serial: 'TY2024-001', status: 'IN_USE', battery: 78, op: 'Rajesh K.', task: 'TASK-2026-002', wh: 'WH-MUM-MAIN', lastMaint: '2026-06-15', nextMaint: '2026-09-15', hours: 1245.5, tasksDone: 342, certs: ['FORKLIFT'] },
    { id: 'E2', code: 'FL-002', type: 'FORKLIFT', make: 'Godrej', model: 'GXE-15T', serial: 'GD2024-118', status: 'IN_USE', battery: 62, op: 'Suresh M.', task: 'TASK-2026-001', wh: 'WH-MUM-MAIN', lastMaint: '2026-06-20', nextMaint: '2026-09-20', hours: 982.3, tasksDone: 287, certs: ['FORKLIFT'] },
    { id: 'E3', code: 'FL-003', type: 'FORKLIFT', make: 'Toyota', model: '8FBE20', serial: 'TY2024-002', status: 'AVAILABLE', battery: 95, op: null, task: null, wh: 'WH-MUM-MAIN', lastMaint: '2026-07-01', nextMaint: '2026-10-01', hours: 456.8, tasksDone: 124, certs: ['FORKLIFT'] },
    { id: 'E4', code: 'RT-001', type: 'REACH_TRUCK', make: 'Crown', model: 'RR5200', serial: 'CR2024-005', status: 'IN_USE', battery: 45, op: 'Mahesh R.', task: 'TASK-2026-007', wh: 'WH-MUM-MAIN', lastMaint: '2026-05-10', nextMaint: '2026-08-10', hours: 1876.2, tasksDone: 412, certs: ['REACH_TRUCK'] },
    { id: 'E5', code: 'ST-001', type: 'STACKER', make: 'Godrej', model: 'GSX-10', serial: 'GD2024-201', status: 'CHARGING', battery: 23, op: null, task: null, wh: 'WH-MUM-MAIN', lastMaint: '2026-06-25', nextMaint: '2026-09-25', hours: 734.1, tasksDone: 198, certs: ['STACKER'] },
    { id: 'E6', code: 'HPT-001', type: 'HAND_PALLET_TRUCK', make: 'Nilkamal', model: 'HP-20', serial: 'NK2024-001', status: 'AVAILABLE', battery: null, op: null, task: null, wh: 'WH-MUM-MAIN', lastMaint: '2026-06-01', nextMaint: '2026-09-01', hours: null, tasksDone: 678, certs: [] },
    { id: 'E7', code: 'SC-001', type: 'SCANNER', make: 'Zebra', model: 'TC52', serial: 'ZB2024-1001', status: 'IN_USE', battery: 88, op: 'Anita S.', task: 'TASK-2026-003', wh: 'WH-MUM-MAIN', lastMaint: '2026-07-05', nextMaint: '2027-07-05', hours: null, tasksDone: 1245, certs: ['SCANNER'] },
    { id: 'E8', code: 'FL-004', type: 'FORKLIFT', make: 'Toyota', model: '8FBE15', serial: 'TY2024-003', status: 'MAINTENANCE', battery: 0, op: null, task: null, wh: 'WH-MUM-MAIN', lastMaint: '2026-07-08', nextMaint: '2026-10-08', hours: 2104.7, tasksDone: 567, certs: ['FORKLIFT'] },
    { id: 'E9', code: 'PR-001', type: 'LABEL_PRINTER', make: 'Zebra', model: 'ZT411', serial: 'ZB2024-2001', status: 'AVAILABLE', battery: null, op: null, task: null, wh: 'WH-MUM-MAIN', lastMaint: '2026-06-10', nextMaint: '2026-09-10', hours: null, tasksDone: 8920, certs: [] },
    { id: 'E10', code: 'FL-005', type: 'FORKLIFT', make: 'Godrej', model: 'GXE-15T', serial: 'GD2024-119', status: 'OUT_OF_SERVICE', battery: 0, op: null, task: null, wh: 'WH-MUM-MAIN', lastMaint: '2026-07-09', nextMaint: '2026-10-09', hours: 1890.4, tasksDone: 421, certs: ['FORKLIFT'] },
  ]

  const stats = [
    { label: 'Total Equipment', value: equipment.length, color: 'text-blue-600' },
    { label: 'Available', value: equipment.filter(e => e.status === 'AVAILABLE').length, color: 'text-emerald-600' },
    { label: 'In Use', value: equipment.filter(e => e.status === 'IN_USE').length, color: 'text-amber-600' },
    { label: 'Charging', value: equipment.filter(e => e.status === 'CHARGING').length, color: 'text-blue-600' },
    { label: 'Maintenance', value: equipment.filter(e => e.status === 'MAINTENANCE').length, color: 'text-orange-600' },
    { label: 'Out of Service', value: equipment.filter(e => e.status === 'OUT_OF_SERVICE').length, color: 'text-rose-600' },
  ]

  const typeIcons: Record<string, React.ReactNode> = {
    FORKLIFT: <Truck className="h-4 w-4" />,
    REACH_TRUCK: <Truck className="h-4 w-4" />,
    STACKER: <Truck className="h-4 w-4" />,
    HAND_PALLET_TRUCK: <Truck className="h-4 w-4" />,
    SCANNER: <ScanLine className="h-4 w-4" />,
    LABEL_PRINTER: <Printer className="h-4 w-4" />,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Equipment Management</h2><p className="text-sm text-muted-foreground mt-1">Forklifts · scanners · reach trucks · battery & maintenance tracking</p></div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Equipment</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">New eam/ module (Equipment)</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map(e => {
          const b = s28BadgeForStatus(e.status)
          const batteryColor = e.battery === null ? 'bg-slate-200' : e.battery > 60 ? 'bg-emerald-500' : e.battery > 30 ? 'bg-amber-500' : e.battery > 10 ? 'bg-orange-500' : 'bg-rose-500'
          return (
            <Card key={e.id} className={`p-4 ${e.status === 'OUT_OF_SERVICE' ? 'border-rose-300 bg-rose-50/30' : e.status === 'MAINTENANCE' ? 'border-orange-300 bg-orange-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{typeIcons[e.type] || <Truck className="h-4 w-4" />}</div>
                  <div>
                    <div className="font-mono font-semibold text-sm">{e.code}</div>
                    <div className="text-xs text-muted-foreground">{e.make} {e.model}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-mono">{e.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Serial:</span><span className="font-mono">{e.serial}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Warehouse:</span><span className="font-mono">{e.wh}</span></div>
                {e.battery !== null && (
                  <div className="flex items-center gap-2 mt-2"><span className="text-muted-foreground text-[10px] w-16">Battery:</span><div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative"><div className={`h-full ${batteryColor}`} style={{ width: `${e.battery}%` }} />{e.battery < 20 && e.status === 'CHARGING' && <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-medium">⚡</span>}</div><span className="text-[10px] font-mono w-8">{e.battery}%</span></div>
                )}
                {e.op && <div className="flex justify-between mt-1"><span className="text-muted-foreground">Operator:</span><span>{e.op}</span></div>}
                {e.task && <div className="flex justify-between"><span className="text-muted-foreground">Task:</span><span className="font-mono text-blue-600">{e.task}</span></div>}
                {e.hours !== null && <div className="flex justify-between"><span className="text-muted-foreground">Op Hours:</span><span className="font-mono">{e.hours}h</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Tasks Done:</span><span className="font-mono">{e.tasksDone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Next Maint:</span><span className="font-mono text-orange-600">{e.nextMaint}</span></div>
              </div>
              {e.certs.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{e.certs.map(c => <span key={c} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono">{c}</span>)}</div>}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Epic 8: Warehouse Control Tower ────────────────────
