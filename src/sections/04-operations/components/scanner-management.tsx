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

export function ScannerManagementModule() {
  const [view, setView] = useState<'scanners' | 'mobile'>('scanners')

  const scanners = [
    { id: 'S1', code: 'SC-001', type: 'HANDHELD_2D', mfr: 'Zebra', model: 'TC52', serial: 'ZB2024-1001', op: 'Anita S.', battery: 88, status: 'IN_USE', scansToday: 284, scansLife: 12453, lastScan: '10:42', supports: ['1D', '2D', 'QR'], wh: 'WH-MUM-MAIN' },
    { id: 'S2', code: 'SC-002', type: 'HANDHELD_2D', mfr: 'Zebra', model: 'TC52', serial: 'ZB2024-1002', op: null, battery: 92, status: 'AVAILABLE', scansToday: 0, scansLife: 11024, lastScan: null, supports: ['1D', '2D', 'QR'], wh: 'WH-MUM-MAIN' },
    { id: 'S3', code: 'SC-003', type: 'WEARABLE_RING', mfr: 'ProGlove', model: 'MARK 3', serial: 'PG2024-0501', op: 'Rajesh K.', battery: 76, status: 'IN_USE', scansToday: 312, scansLife: 8920, lastScan: '10:45', supports: ['1D', '2D', 'QR'], wh: 'WH-MUM-MAIN' },
    { id: 'S4', code: 'SC-004', type: 'HANDHELD_2D', mfr: 'Honeywell', model: 'CT60', serial: 'HW2024-0801', op: 'Suresh M.', battery: 54, status: 'IN_USE', scansToday: 198, scansLife: 9842, lastScan: '10:38', supports: ['1D', '2D', 'QR', 'GS1'], wh: 'WH-MUM-MAIN' },
    { id: 'S5', code: 'SC-005', type: 'MOBILE_COMPUTER', mfr: 'Zebra', model: 'TC22', serial: 'ZB2024-1100', op: null, battery: 18, status: 'CHARGING', scansToday: 142, scansLife: 4521, lastScan: '09:55', supports: ['1D', '2D', 'QR'], wh: 'WH-MUM-MAIN' },
    { id: 'S6', code: 'SC-006', type: 'HANDHELD_1D', mfr: 'Honeywell', model: 'VW-320', serial: 'HW2023-0900', op: null, battery: null, status: 'BROKEN', scansToday: 0, scansLife: 18456, lastScan: '2026-06-15', supports: ['1D'], wh: 'WH-MUM-MAIN' },
  ]

  const mobile = [
    { id: 'M1', code: 'MD-001', name: 'Samsung Galaxy Tab A9', type: 'TABLET', mfr: 'Samsung', model: 'Galaxy Tab A9', serial: 'SM2024-5001', imei: '358912456789012', os: 'Android 14', osVer: '14.0', app: 'SUOP Scanner', appVer: '1.4.2', op: 'Lakshmi V.', battery: 65, charging: false, connectivity: 'ONLINE', wifi: 'SUOP-WH-MUM', ip: '192.168.1.42', lastSync: '10:42', status: 'IN_USE', wh: 'WH-MUM-MAIN' },
    { id: 'M2', code: 'MD-002', name: 'Zebra TC52 Handheld', type: 'ANDROID_SCANNER', mfr: 'Zebra', model: 'TC52', serial: 'ZB2024-1001', imei: '358912456789013', os: 'Android 13', osVer: '13.1', app: 'SUOP Scanner', appVer: '1.4.2', op: 'Anita S.', battery: 88, charging: false, connectivity: 'ONLINE', wifi: 'SUOP-WH-MUM', ip: '192.168.1.45', lastSync: '10:42', status: 'IN_USE', wh: 'WH-MUM-MAIN' },
    { id: 'M3', code: 'MD-003', name: 'Zebra TC22 Handheld', type: 'ANDROID_SCANNER', mfr: 'Zebra', model: 'TC22', serial: 'ZB2024-1100', imei: '358912456789014', os: 'Android 13', osVer: '13.0', app: 'SUOP Scanner', appVer: '1.4.1', op: null, battery: 18, charging: true, connectivity: 'OFFLINE', wifi: null, ip: null, lastSync: '09:55', status: 'CHARGING', wh: 'WH-MUM-MAIN' },
    { id: 'M4', code: 'MD-004', name: 'Samsung Galaxy A14', type: 'ANDROID_SCANNER', mfr: 'Samsung', model: 'Galaxy A14', serial: 'SM2024-6001', imei: '358912456789015', os: 'Android 14', osVer: '14.0', app: 'SUOP Scanner', appVer: '1.4.2', op: 'Priya N.', battery: 54, charging: false, connectivity: 'WEAK', wifi: 'SUOP-WH-MUM', ip: '192.168.1.52', lastSync: '10:30', status: 'IN_USE', wh: 'WH-MUM-MAIN' },
  ]

  const scannerStats = [
    { label: 'Total Scanners', value: scanners.length, color: 'text-blue-600' },
    { label: 'In Use', value: scanners.filter(s => s.status === 'IN_USE').length, color: 'text-amber-600' },
    { label: 'Available', value: scanners.filter(s => s.status === 'AVAILABLE').length, color: 'text-emerald-600' },
    { label: 'Charging', value: scanners.filter(s => s.status === 'CHARGING').length, color: 'text-blue-600' },
    { label: 'Broken', value: scanners.filter(s => s.status === 'BROKEN').length, color: 'text-rose-600' },
    { label: 'Scans Today', value: scanners.reduce((a, s) => a + s.scansToday, 0), color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Scanner &amp; Mobile Device Management</h2><p className="text-sm text-muted-foreground mt-1">Enterprise asset lifecycle · IMEI · OS version · app sync · battery · connectivity</p></div>
        <div className="flex rounded-md border overflow-hidden w-fit">
          {(['scanners', 'mobile'] as const).map(v => <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 text-sm font-medium capitalize ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{v === 'mobile' ? 'Mobile Devices' : 'Scanners'}</button>)}
        </div>
      </div>

      {view === 'scanners' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {scannerStats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scanners.map(s => {
              const b = s28BadgeForStatus(s.status)
              const batteryColor = s.battery === null ? 'bg-slate-200' : s.battery > 60 ? 'bg-emerald-500' : s.battery > 30 ? 'bg-amber-500' : s.battery > 10 ? 'bg-orange-500' : 'bg-rose-500'
              const typeColors: Record<string, string> = { HANDHELD_1D: 'bg-slate-100 text-slate-700', HANDHELD_2D: 'bg-blue-100 text-blue-700', WEARABLE_RING: 'bg-purple-100 text-purple-700', FIXED_MOUNT: 'bg-amber-100 text-amber-700', MOBILE_COMPUTER: 'bg-emerald-100 text-emerald-700' }
              return (
                <Card key={s.id} className={`p-4 ${s.status === 'BROKEN' ? 'border-rose-300 bg-rose-50/30' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><ScanLine className="h-5 w-5 text-blue-700" /></div>
                      <div>
                        <div className="font-mono font-semibold text-sm">{s.code}</div>
                        <div className="text-[10px] text-muted-foreground">{s.mfr} {s.model}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[s.type]}`}>{s.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Serial:</span><span className="font-mono">{s.serial}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Operator:</span><span>{s.op || '—'}</span></div>
                    {s.battery !== null && (
                      <div className="flex items-center gap-2 mt-2"><span className="text-muted-foreground text-[10px] w-16">Battery:</span><div className="flex-1 h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${batteryColor}`} style={{ width: `${s.battery}%` }} /></div><span className="text-[10px] font-mono w-8">{s.battery}%</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-muted-foreground">Scans Today:</span><span className="font-mono">{s.scansToday}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Lifetime Scans:</span><span className="font-mono">{s.scansLife.toLocaleString('en-IN')}</span></div>
                    {s.lastScan && <div className="flex justify-between"><span className="text-muted-foreground">Last Scan:</span><span className="font-mono">{s.lastScan}</span></div>}
                    <div className="flex gap-1 pt-1">{s.supports.map(cap => <span key={cap} className="text-[9px] px-1 py-0.5 bg-muted rounded font-mono">{cap}</span>)}</div>
                  </div>
                  <div className="mt-2"><span className={`text-xs px-2 py-1 rounded ${b.cls} block text-center`}>{b.label}</span></div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {view === 'mobile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mobile.map(m => {
            const b = s28BadgeForStatus(m.status)
            const batteryColor = m.battery > 60 ? 'bg-emerald-500' : m.battery > 30 ? 'bg-amber-500' : m.battery > 10 ? 'bg-orange-500' : 'bg-rose-500'
            const connColor = m.connectivity === 'ONLINE' ? 'text-emerald-600' : m.connectivity === 'WEAK' ? 'text-amber-600' : 'text-rose-600'
            return (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center"><Smartphone className="h-5 w-5 text-purple-700" /></div>
                    <div>
                      <div className="font-mono font-semibold text-sm">{m.code}</div>
                      <div className="text-[10px] text-muted-foreground">{m.name}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span>
                    <span className={`text-[10px] font-mono ${connColor}`}>{m.connectivity}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer:</span><span>{m.mfr} {m.model}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Serial / IMEI:</span><span className="font-mono">{m.serial} / {m.imei}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">OS:</span><span>{m.os} {m.osVer}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">App:</span><span>{m.app} v{m.appVer}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Operator:</span><span>{m.op || '—'}</span></div>
                  <div className="flex items-center gap-2 mt-2"><span className="text-muted-foreground text-[10px] w-16">Battery:</span><div className="flex-1 h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${batteryColor}`} style={{ width: `${m.battery}%` }} /></div><span className="text-[10px] font-mono w-8">{m.battery}%{m.charging && ' ⚡'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">WiFi:</span><span className="font-mono">{m.wifi || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IP:</span><span className="font-mono">{m.ip || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Sync:</span><span className="font-mono">{m.lastSync}</span></div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Epic 4: Battery Dashboard Module ───────────────────
