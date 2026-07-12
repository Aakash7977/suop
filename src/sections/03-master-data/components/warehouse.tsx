/**
 * Section 03 — Master Data Management
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 *
 * This file was extracted verbatim from page.tsx and wrapped with proper
 * TypeScript imports so it can live outside the monolithic file.
 * The original JSX structure, classes, colors, icons, and layout are
 * preserved 1:1 so the rendered UI is pixel-identical.
 *
 * Wire-up layer (live API calls, loading/error states, permission gating)
 * is added incrementally — see Git history for evolution.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, UtensilsCrossed as UtensilsCrossedIcon, DollarSign,
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
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice, FileSearch,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
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
import { s28BadgeForStatus } from '../utils/helpers'
import { pushToast, useAuthStore as useSectionAuth } from '../api/clients'

// ─── Warehouse Management Module (Sprint 22 — PART 4 BEGINS) ───
type WarehouseTab = 'overview' | 'warehouses' | 'zones' | 'temperature' | 'rules'

const WAREHOUSE_TYPE_COLORS: Record<string, string> = {
  RAW_MATERIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PACKAGING: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  FINISHED_GOODS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  QUARANTINE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  RETURNS: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  SCRAP: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  COLD_STORAGE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  TRANSIT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  DISTRIBUTION_CENTER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  DARK_STORE: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300',
}

const ZONE_TYPE_COLORS: Record<string, string> = {
  RECEIVING: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  PUTAWAY: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  STORAGE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  PICKING: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PACKING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  DISPATCH: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  RETURNS: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  QUARANTINE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  QUALITY_INSPECTION: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  DAMAGED_GOODS: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300',
}

const TEMP_ZONE_COLORS: Record<string, string> = {
  AMBIENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CHILLED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  FROZEN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  HUMIDITY_CONTROLLED: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
}

const WAREHOUSE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-600 text-white',
  INACTIVE: 'bg-slate-500 text-white',
  MAINTENANCE: 'bg-amber-500 text-white',
  CLOSED: 'bg-red-600 text-white',
}

const ENFORCEMENT_COLORS: Record<string, string> = {
  BLOCK: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  WARN: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  LOG: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const WHM_WAREHOUSES = [
  { id: 'wh-rm-mum', code: 'WH-RM-MUM', name: 'Raw Material Warehouse', type: 'RAW_MATERIAL', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Rajesh Patel', city: 'Mumbai', volumeM3: 4500, weightKg: 250000, pallets: 600, bins: 4800, hours: '06:00 - 22:00', status: 'ACTIVE', workingDays: 'Mon-Sat' },
  { id: 'wh-pkg-mum', code: 'WH-PKG-MUM', name: 'Packaging Warehouse', type: 'PACKAGING', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Sneha Kulkarni', city: 'Mumbai', volumeM3: 2200, weightKg: 80000, pallets: 280, bins: 2200, hours: '07:00 - 19:00', status: 'ACTIVE', workingDays: 'Mon-Sat' },
  { id: 'wh-fg-mum', code: 'WH-FG-MUM', name: 'Finished Goods Warehouse', type: 'FINISHED_GOODS', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Anil Deshpande', city: 'Mumbai', volumeM3: 3800, weightKg: 180000, pallets: 500, bins: 4000, hours: '06:00 - 23:00', status: 'ACTIVE', workingDays: 'Mon-Sun' },
  { id: 'wh-qua-mum', code: 'WH-QUA-MUM', name: 'Quarantine Warehouse', type: 'QUARANTINE', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai Plant', manager: 'Priya Nair', city: 'Mumbai', volumeM3: 800, weightKg: 40000, pallets: 100, bins: 800, hours: '08:00 - 20:00', status: 'ACTIVE', workingDays: 'Mon-Fri' },
  { id: 'wh-ret-mum-dc', code: 'WH-RET-MUM-DC', name: 'Returns Warehouse', type: 'RETURNS', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai DC', manager: 'Vikas Shetty', city: 'Bhiwandi', volumeM3: 1200, weightKg: 60000, pallets: 150, bins: 1200, hours: '09:00 - 18:00', status: 'ACTIVE', workingDays: 'Mon-Sat' },
  { id: 'wh-scr-mum-dc', code: 'WH-SCR-MUM-DC', name: 'Scrap Warehouse', type: 'SCRAP', company: 'SUOP Sweets Pvt. Ltd.', branch: 'Mumbai DC', manager: 'Mahesh Iyer', city: 'Bhiwandi', volumeM3: 500, weightKg: 25000, pallets: 60, bins: 480, hours: '09:00 - 17:00', status: 'MAINTENANCE', workingDays: 'Mon-Fri' },
]

const WHM_ZONES = [
  { id: 'zn-001', code: 'Z-RM-01', name: 'Receiving Zone', type: 'RECEIVING', warehouse: 'WH-RM-MUM', parentZone: '—', tempZone: '—', volumeM3: 400, weightKg: 30000, pallets: 50, bins: 100, restricted: false, status: 'ACTIVE' },
  { id: 'zn-002', code: 'Z-RM-02', name: 'Putaway Zone', type: 'PUTAWAY', warehouse: 'WH-RM-MUM', parentZone: 'Z-RM-01', tempZone: '—', volumeM3: 200, weightKg: 15000, pallets: 25, bins: 50, restricted: false, status: 'ACTIVE' },
  { id: 'zn-003', code: 'Z-RM-03', name: 'Storage Zone-Ambient', type: 'STORAGE', warehouse: 'WH-RM-MUM', parentZone: '—', tempZone: 'TZ-AMB-01 (AMBIENT)', volumeM3: 2400, weightKg: 180000, pallets: 320, bins: 2560, restricted: false, status: 'ACTIVE' },
  { id: 'zn-004', code: 'Z-RM-04', name: 'Storage Zone-Cold', type: 'STORAGE', warehouse: 'WH-RM-MUM', parentZone: '—', tempZone: 'TZ-CHL-01 (CHILLED)', volumeM3: 800, weightKg: 30000, pallets: 100, bins: 800, restricted: true, status: 'ACTIVE' },
  { id: 'zn-005', code: 'Z-FG-01', name: 'Picking Zone', type: 'PICKING', warehouse: 'WH-FG-MUM', parentZone: '—', tempZone: '—', volumeM3: 600, weightKg: 24000, pallets: 80, bins: 800, restricted: false, status: 'ACTIVE' },
  { id: 'zn-006', code: 'Z-FG-02', name: 'Packing Zone', type: 'PACKING', warehouse: 'WH-FG-MUM', parentZone: '—', tempZone: '—', volumeM3: 400, weightKg: 16000, pallets: 50, bins: 200, restricted: false, status: 'ACTIVE' },
  { id: 'zn-007', code: 'Z-FG-03', name: 'Dispatch Zone', type: 'DISPATCH', warehouse: 'WH-FG-MUM', parentZone: '—', tempZone: '—', volumeM3: 500, weightKg: 20000, pallets: 70, bins: 100, restricted: false, status: 'ACTIVE' },
  { id: 'zn-008', code: 'Z-QU-01', name: 'Quarantine Zone', type: 'QUARANTINE', warehouse: 'WH-QUA-MUM', parentZone: '—', tempZone: '—', volumeM3: 600, weightKg: 30000, pallets: 80, bins: 600, restricted: true, status: 'ACTIVE' },
  { id: 'zn-009', code: 'Z-QU-02', name: 'Quality Inspection Zone', type: 'QUALITY_INSPECTION', warehouse: 'WH-QUA-MUM', parentZone: 'Z-QU-01', tempZone: '—', volumeM3: 200, weightKg: 10000, pallets: 20, bins: 40, restricted: true, status: 'ACTIVE' },
  { id: 'zn-010', code: 'Z-RT-01', name: 'Damaged Goods Zone', type: 'DAMAGED_GOODS', warehouse: 'WH-RET-MUM-DC', parentZone: '—', tempZone: '—', volumeM3: 300, weightKg: 15000, pallets: 40, bins: 200, restricted: true, status: 'ACTIVE' },
]

const WHM_TEMP_ZONES = [
  { id: 'tz-001', code: 'TZ-AMB-01', name: 'Ambient Storage', type: 'AMBIENT', warehouse: 'WH-RM-MUM', minTemp: 15.0, maxTemp: 30.0, targetTemp: 22.0, minHum: 30.0, maxHum: 60.0, lastReading: 23.5, lastReadingAt: '09 Jul 07:45', alert: false, monitoring: 'ACTIVE' },
  { id: 'tz-002', code: 'TZ-CHL-01', name: 'Chilled Storage (Perishables)', type: 'CHILLED', warehouse: 'WH-RM-MUM', minTemp: 2.0, maxTemp: 8.0, targetTemp: 4.0, minHum: 50.0, maxHum: 75.0, lastReading: 9.4, lastReadingAt: '09 Jul 07:50', alert: true, monitoring: 'ACTIVE' },
  { id: 'tz-003', code: 'TZ-FRZ-01', name: 'Frozen Storage (Ice Cream Line)', type: 'FROZEN', warehouse: 'WH-FG-MUM', minTemp: -25.0, maxTemp: -18.0, targetTemp: -22.0, minHum: 40.0, maxHum: 60.0, lastReading: -21.8, lastReadingAt: '09 Jul 07:55', alert: false, monitoring: 'ACTIVE' },
  { id: 'tz-004', code: 'TZ-HUM-01', name: 'Humidity-Controlled Storage (Dry Sweets)', type: 'HUMIDITY_CONTROLLED', warehouse: 'WH-FG-MUM', minTemp: 18.0, maxTemp: 25.0, targetTemp: 20.0, minHum: 35.0, maxHum: 50.0, lastReading: 21.4, lastReadingAt: '09 Jul 08:00', alert: true, monitoring: 'ACTIVE' },
]

const WHM_RULES = [
  { id: 'wr-001', code: 'MAX_BIN_WEIGHT', name: 'Maximum Bin Weight', type: 'MAX_BIN_WEIGHT', value: '25', unit: 'KG', enforcement: 'BLOCK', warehouse: 'WH-RM-MUM', desc: 'No single bin may hold more than 25 kg of stock to prevent structural damage & ergonomic injury.' },
  { id: 'wr-002', code: 'FEFO_ENABLED', name: 'FEFO Picking Enforced', type: 'FEFO_ENABLED', value: 'true', unit: 'BOOLEAN', enforcement: 'BLOCK', warehouse: 'WH-FG-MUM', desc: 'Picking must follow First-Expired-First-Out across all FG bins. Non-FEFO picks are blocked.' },
  { id: 'wr-003', code: 'BARCODE_MANDATORY', name: 'Barcode Scan Mandatory', type: 'BARCODE_MANDATORY', value: 'true', unit: 'BOOLEAN', enforcement: 'WARN', warehouse: 'WH-RM-MUM', desc: 'Every receive/putaway/pick/dispatch must scan barcode. Manual entry triggers a warning.' },
  { id: 'wr-004', code: 'QUALITY_INSPECTION_REQUIRED', name: 'Quality Inspection Required', type: 'QUALITY_INSPECTION_REQUIRED', value: 'true', unit: 'BOOLEAN', enforcement: 'BLOCK', warehouse: 'WH-QUA-MUM', desc: 'All inbound & returned stock must pass QA inspection before release to storage.' },
  { id: 'wr-005', code: 'MAX_STACK_HEIGHT', name: 'Maximum Pallet Stack Height', type: 'MAX_STACK_HEIGHT', value: '2.4', unit: 'M', enforcement: 'WARN', warehouse: 'WH-FG-MUM', desc: 'Pallet stack may not exceed 2.4 m to comply with ceiling clearance & forklift safety.' },
]

const WHM_RECOMMENDED = [
  { code: 'WH-RM-MUM', name: 'Raw Material Warehouse', type: 'RAW_MATERIAL', purpose: 'Inbound raw materials (cashew, sugar, ghee, flour) for Mumbai plant. FEFO + quarantine enforced.' },
  { code: 'WH-PKG-MUM', name: 'Packaging Warehouse', type: 'PACKAGING', purpose: 'Packaging materials (printed boxes, films, labels, pouches). Bulk storage with barcode tracking.' },
  { code: 'WH-FG-MUM', name: 'Finished Goods Warehouse', type: 'FINISHED_GOODS', purpose: 'Finished sweets & namkeen awaiting dispatch to DCs. FEFO strictly enforced.' },
  { code: 'WH-QUA-MUM', name: 'Quarantine Warehouse', type: 'QUARANTINE', purpose: 'Holds inbound RM & FG awaiting QA release. Auto-release on pass, scrap on fail.' },
  { code: 'WH-RET-MUM-DC', name: 'Returns Warehouse', type: 'RETURNS', purpose: 'Customer returns from Mumbai DC. Sorted by reason, routed to scrap/quarantine/restock.' },
  { code: 'WH-SCR-MUM-DC', name: 'Scrap Warehouse', type: 'SCRAP', purpose: 'Expired, damaged, recalled & condemned stock pending disposal. Requires finance approval.' },
]

export function WarehouseModule() {
  const [tab, setTab] = useState<WarehouseTab>('overview')
  const tabs: Array<{ key: WarehouseTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'warehouses', label: 'Warehouses', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'zones', label: 'Zones', icon: <Layers3 className="h-4 w-4" /> },
    { key: 'temperature', label: 'Temperature', icon: <Thermometer className="h-4 w-4" /> },
    { key: 'rules', label: 'Rules', icon: <ShieldCheck className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-amber-950 via-orange-900 to-red-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Warehouse className="h-7 w-7" /> Warehouse Management System
            </h2>
            <p className="text-amber-200 text-sm max-w-3xl">
              Multi-warehouse architecture covering the full physical lifecycle of stock —
              inbound (Raw Material + Quarantine), production support (Packaging), outbound (Finished Goods),
              reverse logistics (Returns), and disposal (Scrap). 6 warehouses · 10 zones · 4 temperature zones ·
              8 database tables. PART 4 BEGUN.
            </p>
          </div>
          <Badge className="bg-orange-500 text-orange-950 hover:bg-orange-500">Sprint 22 · PART 4 BEGUN</Badge>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <WarehouseOverviewTab />}
      {tab === 'warehouses' && <WarehouseWarehousesTab />}
      {tab === 'zones' && <WarehouseZonesTab />}
      {tab === 'temperature' && <WarehouseTemperatureTab />}
      {tab === 'rules' && <WarehouseRulesTab />}
    </div>
  )
}

function WarehouseOverviewTab() {
  const stats = [
    { label: 'Total Warehouses', value: '6', sub: '4 Plant · 2 DC', icon: <Warehouse className="h-5 w-5 text-amber-600" /> },
    { label: 'Active Warehouses', value: '5', sub: '1 in MAINTENANCE', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
    { label: 'Total Zones', value: '10', sub: '4 restricted · 2 cold', icon: <Layers3 className="h-5 w-5 text-blue-600" /> },
    { label: 'Temperature Zones', value: '4', sub: '2 alerts active', icon: <Thermometer className="h-5 w-5 text-cyan-600" /> },
    { label: 'Avg Utilization', value: '69.3%', sub: 'WH-FG at 81% — highest', icon: <Gauge className="h-5 w-5 text-purple-600" /> },
    { label: 'Cold Storage Units', value: '2', sub: '1 CHILLED · 1 FROZEN', icon: <Snowflake className="h-5 w-5 text-sky-600" /> },
    { label: 'Access Rules', value: '3', sub: 'Manager · Operator · QA', icon: <UserCog className="h-5 w-5 text-indigo-600" /> },
    { label: 'Operating Rules', value: '5', sub: '3 BLOCK · 2 WARN', icon: <ShieldCheck className="h-5 w-5 text-rose-600" /> },
  ]
  const hierarchy = [
    { level: 'Company', icon: <Building2 className="h-4 w-4" />, desc: 'SUOP Sweets Pvt. Ltd.', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
    { level: 'Branch', icon: <Building className="h-4 w-4" />, desc: 'Mumbai Plant · Mumbai DC', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { level: 'Warehouse', icon: <Warehouse className="h-4 w-4" />, desc: 'WH-RM-MUM · WH-FG-MUM · ...', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { level: 'Zone', icon: <Layers3 className="h-4 w-4" />, desc: 'Receiving · Storage · Picking', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    { level: 'Aisle', icon: <Route className="h-4 w-4" />, desc: 'A-01 · A-02 · B-01 ...', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
    { level: 'Rack', icon: <Grid3x3 className="h-4 w-4" />, desc: 'R-01 · R-02 · R-03 ...', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
    { level: 'Shelf', icon: <Box className="h-4 w-4" />, desc: 'S-01 · S-02 · S-03 ...', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { level: 'Bin', icon: <Hash className="h-4 w-4" />, desc: 'Smallest addressable unit', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  ]
  return (
    <div className="space-y-6">
      {/* PART 4 BEGUN celebration banner */}
      <Card className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">PART 4 BEGUN <Warehouse className="h-5 w-5 text-amber-200" /></h3>
              <p className="text-amber-100 text-sm">Enterprise Warehouse Management System — Sprint 22 of 33. 6-warehouse Mumbai architecture laid.</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">Sprint 22 · 193 tables</Badge>
        </div>
      </Card>

      {/* 8 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{s.icon}</div></div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Hierarchy diagram */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Network className="h-5 w-5 text-indigo-600" /> Warehouse Hierarchy — 8 Levels</h3>
        <p className="text-sm text-muted-foreground mb-4">Physical storage is addressed through 8 nested levels. The Bin is the smallest addressable storage unit where stock lives.</p>
        <div className="flex flex-wrap items-center gap-2">
          {hierarchy.map((h, i) => (
            <div key={h.level} className="flex items-center gap-2">
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md', h.color)}>
                {h.icon}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">{h.level}</p>
                  <p className="text-xs opacity-80">{h.desc}</p>
                </div>
              </div>
              {i < hierarchy.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Chief Architect recommendation table */}
      <Card className="p-5">
        <h3 className="font-semibold mb-1 flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-600" /> Chief Architect — Recommended 6-Warehouse Mumbai Architecture</h3>
        <p className="text-sm text-muted-foreground mb-4">Six warehouses cover the full physical lifecycle of stock: inbound (RM + Quarantine), production support (Packaging), outbound (FG), reverse logistics (Returns), and disposal (Scrap).</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">Code</th>
                <th className="text-left px-3 py-2 font-medium">Warehouse</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-left px-3 py-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {WHM_RECOMMENDED.map(w => (
                <tr key={w.code} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{w.code}</td>
                  <td className="px-3 py-2 font-medium">{w.name}</td>
                  <td className="px-3 py-2"><Badge className={cn('text-xs', WAREHOUSE_TYPE_COLORS[w.type])}>{w.type.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground">{w.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function WarehouseWarehousesTab() {
  const [warehouses, setWarehouses] = useState<typeof WHM_WAREHOUSES | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const token = localStorage.getItem('suop_access_token') || ''
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/api/v1/organization/warehouses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const json = await res.json()
        if (cancelled) return
        if (json.success && json.data) {
          // Map API warehouses to the UI shape; fall back to mock for missing fields
          const mapped = json.data.map((w: Record<string, unknown>) => ({
            id: w.id as string,
            code: (w.code as string) || '—',
            name: (w.name as string) || '—',
            type: (w.warehouse_type as string) || 'DISTRIBUTION',
            company: '—',
            branch: '—',
            manager: '—',
            city: (w.city as string) || '—',
            volumeM3: 0,
            weightKg: 0,
            pallets: 0,
            bins: 0,
            hours: '—',
            status: (w.status as string) || 'ACTIVE',
            workingDays: 'Mon-Sat',
          }))
          setWarehouses(mapped.length > 0 ? mapped : WHM_WAREHOUSES)
        } else {
          setWarehouses(WHM_WAREHOUSES)
        }
      } catch {
        if (!cancelled) { setWarehouses(WHM_WAREHOUSES); setError('Using sample data — backend not reachable') }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const data = warehouses || WHM_WAREHOUSES
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <Warehouse className="inline h-4 w-4 mr-1" /> {loading ? 'Loading warehouses...' : `${data.length} warehouses across 11 supported types (RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, DEEP_FREEZE, RETURNS, TRANSIT, QUARANTINE, SCRAP, DISTRIBUTION_CENTER, DARK_STORE). Each has a dedicated manager, capacity limits, and operating hours.`}
        </p>
      </Card>
      {error && <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-2">{error}</div>}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">Code</th>
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-left px-3 py-2 font-medium">Branch</th>
                <th className="text-left px-3 py-2 font-medium">Manager</th>
                <th className="text-left px-3 py-2 font-medium">City</th>
                <th className="text-right px-3 py-2 font-medium">Volume (m³)</th>
                <th className="text-right px-3 py-2 font-medium">Pallets</th>
                <th className="text-right px-3 py-2 font-medium">Bins</th>
                <th className="text-left px-3 py-2 font-medium">Hours</th>
                <th className="text-center px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i} className="border-b"><td colSpan={11} className="h-10 bg-muted/30 animate-pulse" /></tr>)
              ) : data.map(w => (
                <tr key={w.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{w.code}</td>
                  <td className="px-3 py-2 font-medium">{w.name}</td>
                  <td className="px-3 py-2"><Badge className={cn('text-xs', WAREHOUSE_TYPE_COLORS[w.type] || 'bg-slate-100 text-slate-800')}>{w.type.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{w.branch}</td>
                  <td className="px-3 py-2 text-xs">{w.manager}</td>
                  <td className="px-3 py-2 text-xs">{w.city}</td>
                  <td className="px-3 py-2 text-right font-mono">{w.volumeM3.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">{w.pallets}</td>
                  <td className="px-3 py-2 text-right font-mono">{w.bins.toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs">{w.hours}</td>
                  <td className="px-3 py-2 text-center"><Badge className={cn('text-xs', WAREHOUSE_STATUS_COLORS[w.status] || 'bg-slate-100 text-slate-800')}>{w.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function WarehouseZonesTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
        <p className="text-sm text-purple-900 dark:text-purple-200">
          <Layers3 className="inline h-4 w-4 mr-1" /> 10 zones across 10 zone types (RECEIVING, PUTAWAY, STORAGE, PICKING, PACKING, DISPATCH, RETURNS, QUARANTINE, QUALITY_INSPECTION, DAMAGED_GOODS). Each zone may be linked to a temperature zone, support a parent zone, and be restricted.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WHM_ZONES.map(z => (
          <Card key={z.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{z.code}</p>
                <p className="font-semibold text-sm">{z.name}</p>
              </div>
              <Badge className={cn('text-xs', ZONE_TYPE_COLORS[z.type])}>{z.type.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Warehouse</span>
                <span className="font-mono">{z.warehouse}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Parent Zone</span>
                <span className="font-mono">{z.parentZone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Temp Zone</span>
                <span className="font-mono text-right">{z.tempZone}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div><p className="text-muted-foreground">Volume</p><p className="font-mono font-semibold">{z.volumeM3} m³</p></div>
              <div><p className="text-muted-foreground">Pallets</p><p className="font-mono font-semibold">{z.pallets}</p></div>
              <div><p className="text-muted-foreground">Bins</p><p className="font-mono font-semibold">{z.bins}</p></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              {z.restricted ? <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"><LockIcon className="mr-1 h-3 w-3" /> Restricted</Badge> : <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Open</Badge>}
              <Badge className="text-xs bg-emerald-600 text-white">{z.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WarehouseTemperatureTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900">
        <p className="text-sm text-cyan-900 dark:text-cyan-200">
          <Thermometer className="inline h-4 w-4 mr-1" /> 4 temperature zones across 5 supported types (AMBIENT, CHILLED, FROZEN, DEEP_FREEZE, HUMIDITY_CONTROLLED). Each zone has min/max/target temp + humidity range, with sensor-driven alerts when readings breach thresholds.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {WHM_TEMP_ZONES.map(t => (
          <Card key={t.id} className={cn('p-5 border-2', t.alert ? 'border-red-300 dark:border-red-800' : 'border-emerald-200 dark:border-emerald-900')}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', TEMP_ZONE_COLORS[t.type])}>
                  {t.type === 'FROZEN' || t.type === 'DEEP_FREEZE' ? <Snowflake className="h-5 w-5" /> : t.type === 'HUMIDITY_CONTROLLED' ? <Droplets className="h-5 w-5" /> : <Thermometer className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{t.code}</p>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.warehouse}</p>
                </div>
              </div>
              <Badge className={cn('text-xs', TEMP_ZONE_COLORS[t.type])}>{t.type.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Min Temp</p>
                <p className="text-sm font-mono font-semibold">{t.minTemp.toFixed(1)}°C</p>
              </div>
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 p-2">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400">{t.targetTemp.toFixed(1)}°C</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Max Temp</p>
                <p className="text-sm font-mono font-semibold">{t.maxTemp.toFixed(1)}°C</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Humidity Range</span>
              <span className="font-mono">{t.minHum.toFixed(0)}% - {t.maxHum.toFixed(0)}%</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Last Reading</p>
                <p className={cn('text-lg font-bold font-mono', t.alert ? 'text-red-600' : 'text-emerald-600')}>{t.lastReading.toFixed(1)}°C</p>
                <p className="text-xs text-muted-foreground">{t.lastReadingAt}</p>
              </div>
              {t.alert ? (
                <Badge className="bg-red-600 text-white"><AlertTriangle className="mr-1 h-3 w-3" /> ALERT</Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white"><CheckCircle2 className="mr-1 h-3 w-3" /> NORMAL</Badge>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Monitoring: {t.monitoring}</span>
              <Badge variant="outline" className="text-xs">{t.alert ? 'Action required' : 'Within range'}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WarehouseRulesTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900">
        <p className="text-sm text-rose-900 dark:text-rose-200">
          <ShieldCheck className="inline h-4 w-4 mr-1" /> 5 warehouse operating rules across 10 rule types (MAX_BIN_WEIGHT, MAX_STACK_HEIGHT, HAZARDOUS_MATERIAL, FOOD_SAFETY, FIFO/FEFO_ENABLED, BARCODE_MANDATORY, QUALITY_INSPECTION_REQUIRED, MAX_PICK_TIME, PUTAWAY_RULE). Enforcement modes: BLOCK (operation rejected), WARN (logged warning), LOG (silent audit).
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WHM_RULES.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                <p className="font-semibold text-sm">{r.name}</p>
              </div>
              <Badge className={cn('text-xs', ENFORCEMENT_COLORS[r.enforcement])}>{r.enforcement}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rule Type</span>
                <Badge variant="outline" className="font-mono text-xs">{r.type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Value</span>
                <span className="font-mono font-semibold text-base">{r.value} <span className="text-xs text-muted-foreground">{r.unit}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Warehouse</span>
                <span className="font-mono">{r.warehouse}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              {r.enforcement === 'BLOCK' ? (
                <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"><ShieldAlert className="mr-1 h-3 w-3" /> Operation blocked</Badge>
              ) : r.enforcement === 'WARN' ? (
                <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><AlertTriangle className="mr-1 h-3 w-3" /> Warning logged</Badge>
              ) : (
                <Badge className="text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"><FileText className="mr-1 h-3 w-3" /> Audit logged</Badge>
              )}
              <Badge className="text-xs bg-emerald-600 text-white">{r.id ? 'ACTIVE' : 'INACTIVE'}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Warehouse Location & Bin Management Module (Sprint 23) ───
type WhLocTab = 'overview' | 'bins' | 'aisles' | 'racks' | 'capacity'

const TRAFFIC_DIRECTION_COLORS: Record<string, string> = {
  ONE_WAY: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  TWO_WAY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  FORKLIFT_ONLY: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  WALKING_ONLY: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const PICKING_LEVEL_COLORS: Record<string, string> = {
  GROUND: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MID: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  TOP: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const ACCESSIBILITY_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MODERATE: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  DIFFICULT: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  LADDER_REQUIRED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const BIN_TYPE_COLORS: Record<string, string> = {
  STANDARD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  BULK: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PICK_FACE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  CROSS_DOCK: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  QUARANTINE: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const BIN_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-600 text-white',
  OCCUPIED: 'bg-blue-600 text-white',
  RESERVED: 'bg-amber-500 text-white',
  BLOCKED: 'bg-red-600 text-white',
  MAINTENANCE: 'bg-orange-500 text-white',
  CLEANING: 'bg-cyan-500 text-white',
  DISABLED: 'bg-slate-500 text-white',
}

const BIN_TEMP_ZONE_COLORS: Record<string, string> = {
  AMBIENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CHILLED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  FROZEN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  HUMIDITY_CONTROLLED: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
}

const ALERT_TYPE_COLORS: Record<string, string> = {
  FULL: 'bg-red-600 text-white',
  OVERLOADED: 'bg-red-700 text-white',
  UNDERUTILIZED: 'bg-amber-500 text-white',
  NEAR_FULL: 'bg-amber-600 text-white',
}

const WH_LOC_AISLES = [
  { id: 'aisle-a', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits', description: 'Main aisle for raw cashew, almonds, and dry fruit storage. Two-way forklift traffic.', lengthM: 24.00, widthM: 3.50, trafficDirection: 'TWO_WAY', status: 'ACTIVE', rackCount: 2, shelfCount: 4, binCount: 4 },
  { id: 'aisle-b', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold', aisleCode: 'B', aisleName: 'Aisle B — Cold Storage (Ghee & Perishables)', description: 'Chilled aisle for ghee, butter, and perishable raw materials. Forklift-only due to narrow cold-room doors.', lengthM: 18.00, widthM: 2.80, trafficDirection: 'FORKLIFT_ONLY', status: 'ACTIVE', rackCount: 2, shelfCount: 3, binCount: 3 },
  { id: 'aisle-c', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face', description: 'High-velocity pick-face aisle for top-selling sweets (Kaju Katli, Soan Cake). One-way to maximize pick speed.', lengthM: 30.00, widthM: 2.50, trafficDirection: 'ONE_WAY', status: 'ACTIVE', rackCount: 2, shelfCount: 3, binCount: 4 },
  { id: 'aisle-d', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-02', zoneName: 'Packing Zone', aisleCode: 'D', aisleName: 'Aisle D — Packing & Dispatch Staging', description: 'Packing aisle with bulk dispatch staging. Two-way forklift traffic for pallet movement.', lengthM: 22.00, widthM: 4.00, trafficDirection: 'TWO_WAY', status: 'ACTIVE', rackCount: 1, shelfCount: 1, binCount: 1 },
  { id: 'aisle-e', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse', zoneCode: '—', zoneName: 'Frozen Storage', aisleCode: 'E', aisleName: 'Aisle E — Frozen Desserts (Ice Cream Line)', description: 'Sub-zero aisle for ice cream and frozen desserts. Forklift-only due to insulated doors and ice buildup.', lengthM: 15.00, widthM: 3.00, trafficDirection: 'FORKLIFT_ONLY', status: 'ACTIVE', rackCount: 1, shelfCount: 1, binCount: 2 },
  { id: 'aisle-f', warehouseCode: 'WH-PKG-MUM', warehouseName: 'Packaging Warehouse', zoneCode: '—', zoneName: 'Bulk Packaging Storage', aisleCode: 'F', aisleName: 'Aisle F — Printed Boxes & Films', description: 'Bulk storage aisle for printed boxes, films, and labels. Two-way forklift for pallet movement.', lengthM: 28.00, widthM: 4.50, trafficDirection: 'TWO_WAY', status: 'ACTIVE', rackCount: 1, shelfCount: 1, binCount: 1 },
]

const WH_LOC_RACKS = [
  { id: 'rack-01', warehouseCode: 'WH-RM-MUM', aisleCode: 'A', rackCode: 'R-01', rackName: 'Rack 01 — Cashew Bulk', description: 'Heavy-duty bulk rack for raw cashew sacks (25 kg each).', heightM: 4.50, widthM: 2.40, depthM: 1.20, maxWeightKg: 2000.00, shelfCount: 3, fireZone: 'FZ-A1', status: 'ACTIVE' },
  { id: 'rack-02', warehouseCode: 'WH-RM-MUM', aisleCode: 'A', rackCode: 'R-02', rackName: 'Rack 02 — Almonds & Dry Fruits', description: 'Standard rack for boxed almonds, pistachios, and mixed dry fruits.', heightM: 4.20, widthM: 2.20, depthM: 1.10, maxWeightKg: 1500.00, shelfCount: 2, fireZone: 'FZ-A1', status: 'ACTIVE' },
  { id: 'rack-03', warehouseCode: 'WH-RM-MUM', aisleCode: 'B', rackCode: 'R-03', rackName: 'Rack 03 — Ghee Drums', description: 'Stainless-steel drum rack for ghee (50 kg drums). Heated aisles, condensation-controlled.', heightM: 3.80, widthM: 2.00, depthM: 1.00, maxWeightKg: 1800.00, shelfCount: 2, fireZone: 'FZ-B1', status: 'ACTIVE' },
  { id: 'rack-04', warehouseCode: 'WH-RM-MUM', aisleCode: 'B', rackCode: 'R-04', rackName: 'Rack 04 — Perishables', description: 'Short rack for perishable raw materials (cream, milk). Frequent rotation.', heightM: 2.40, widthM: 1.80, depthM: 0.90, maxWeightKg: 800.00, shelfCount: 1, fireZone: 'FZ-B2', status: 'ACTIVE' },
  { id: 'rack-05', warehouseCode: 'WH-FG-MUM', aisleCode: 'C', rackCode: 'R-05', rackName: 'Rack 05 — Kaju Katli Pick Face', description: 'Pick-face rack for Kaju Katli 500g boxes. Ground-level easy access.', heightM: 2.10, widthM: 1.80, depthM: 0.80, maxWeightKg: 600.00, shelfCount: 2, fireZone: 'FZ-C1', status: 'ACTIVE' },
  { id: 'rack-06', warehouseCode: 'WH-FG-MUM', aisleCode: 'C', rackCode: 'R-06', rackName: 'Rack 06 — Soan Cake & Mixed Sweets', description: 'Pick-face rack for premium sweets. Multi-level with mid-shelf access.', heightM: 3.60, widthM: 2.00, depthM: 0.90, maxWeightKg: 900.00, shelfCount: 1, fireZone: 'FZ-C2', status: 'ACTIVE' },
  { id: 'rack-07', warehouseCode: 'WH-CS-MUM', aisleCode: 'E', rackCode: 'R-07', rackName: 'Rack 07 — Frozen Ice Cream', description: 'Insulated rack for ice cream tubs (-22°C). Single shelf to preserve cold airflow.', heightM: 2.20, widthM: 1.60, depthM: 1.00, maxWeightKg: 500.00, shelfCount: 1, fireZone: 'FZ-E1', status: 'ACTIVE' },
  { id: 'rack-08', warehouseCode: 'WH-PKG-MUM', aisleCode: 'F', rackCode: 'R-08', rackName: 'Rack 08 — Printed Boxes', description: 'Wide rack for printed packaging boxes (500-unit bundles).', heightM: 4.80, widthM: 3.00, depthM: 1.50, maxWeightKg: 2500.00, shelfCount: 1, fireZone: 'FZ-F1', status: 'ACTIVE' },
]

const WH_LOC_BINS = [
  { id: 'bin-001', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-01', shelfCode: 'S-01', binCode: 'A-01-01-01', barcode: 'BC-A01010101', qrCode: 'QR-A-01-01-01', maxWeightKg: 2000.00, maxVolumeM3: 6.50, currentWeightKg: 1750.00, currentVolumeM3: 5.20, utilizationPercent: 87.50, temperatureZone: 'AMBIENT', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Cashew 25kg × 70 sacks', currentItemTypes: 1 },
  { id: 'bin-002', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-01', shelfCode: 'S-02', binCode: 'A-01-02-01', barcode: 'BC-A01020101', qrCode: 'QR-A-01-02-01', maxWeightKg: 1200.00, maxVolumeM3: 5.20, currentWeightKg: 480.00, currentVolumeM3: 1.90, utilizationPercent: 40.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-003', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-01', shelfCode: 'S-03', binCode: 'A-01-03-01', barcode: 'BC-A01030101', qrCode: 'QR-A-01-03-01', maxWeightKg: 600.00, maxVolumeM3: 4.10, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-004', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-02', shelfCode: 'S-04', binCode: 'A-02-04-01', barcode: 'BC-A02040101', qrCode: 'QR-A-02-04-01', maxWeightKg: 1500.00, maxVolumeM3: 4.80, currentWeightKg: 950.00, currentVolumeM3: 3.10, utilizationPercent: 63.33, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'OCCUPIED', statusReason: 'Almond 10kg × 95 boxes', currentItemTypes: 1 },
  { id: 'bin-005', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-04', aisleCode: 'B', rackCode: 'R-03', shelfCode: 'S-06', binCode: 'B-03-06-01', barcode: 'BC-B03060101', qrCode: 'QR-B-03-06-01', maxWeightKg: 1800.00, maxVolumeM3: 3.80, currentWeightKg: 1800.00, currentVolumeM3: 3.80, utilizationPercent: 100.00, temperatureZone: 'CHILLED', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Ghee 50kg × 36 drums — at capacity', currentItemTypes: 1 },
  { id: 'bin-006', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-04', aisleCode: 'B', rackCode: 'R-03', shelfCode: 'S-07', binCode: 'B-03-07-01', barcode: 'BC-B03070101', qrCode: 'QR-B-03-07-01', maxWeightKg: 1000.00, maxVolumeM3: 2.90, currentWeightKg: 220.00, currentVolumeM3: 0.65, utilizationPercent: 22.00, temperatureZone: 'CHILLED', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-007', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-04', aisleCode: 'B', rackCode: 'R-04', shelfCode: 'S-08', binCode: 'B-04-08-01', barcode: 'BC-B04080101', qrCode: 'QR-B-04-08-01', maxWeightKg: 800.00, maxVolumeM3: 2.40, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'CHILLED', binType: 'QUARANTINE', status: 'BLOCKED', statusReason: 'Spillage — awaiting deep clean', currentItemTypes: 0 },
  { id: 'bin-008', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-05', shelfCode: 'S-09', binCode: 'C-05-09-01', barcode: 'BC-C05090101', qrCode: 'QR-C-05-09-01', maxWeightKg: 400.00, maxVolumeM3: 1.60, currentWeightKg: 142.00, currentVolumeM3: 0.95, utilizationPercent: 35.50, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'OCCUPIED', statusReason: 'Kaju Katli 500g × 142 boxes (KK-2607-01)', currentItemTypes: 1 },
  { id: 'bin-009', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-05', shelfCode: 'S-10', binCode: 'C-05-10-01', barcode: 'BC-C05100101', qrCode: 'QR-C-05-10-01', maxWeightKg: 300.00, maxVolumeM3: 1.20, currentWeightKg: 285.00, currentVolumeM3: 1.10, utilizationPercent: 95.00, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'OCCUPIED', statusReason: 'Kaju Katli 250g × 570 boxes — near capacity', currentItemTypes: 1 },
  { id: 'bin-010', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-06', shelfCode: 'S-11', binCode: 'C-06-11-01', barcode: 'BC-C06110101', qrCode: 'QR-C-06-11-01', maxWeightKg: 500.00, maxVolumeM3: 2.00, currentWeightKg: 89.00, currentVolumeM3: 0.85, utilizationPercent: 17.80, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'RESERVED', statusReason: 'Reserved for production order PRD-2026-0156 (Soan Cake 1kg)', currentItemTypes: 1 },
  { id: 'bin-011', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-02', aisleCode: 'D', rackCode: '—', shelfCode: '—', binCode: 'D-00-00-01', barcode: 'BC-D00000001', qrCode: 'QR-D-00-00-01', maxWeightKg: 1000.00, maxVolumeM3: 4.00, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-012', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-05', shelfCode: 'S-09', binCode: 'C-05-09-02', barcode: 'BC-C05090102', qrCode: 'QR-C-05-09-02', maxWeightKg: 400.00, maxVolumeM3: 1.60, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'MAINTENANCE', statusReason: 'Rack re-leveling scheduled 10-Jul-2026', currentItemTypes: 0 },
  { id: 'bin-013', warehouseCode: 'WH-CS-MUM', zoneCode: '—', aisleCode: 'E', rackCode: 'R-07', shelfCode: 'S-12', binCode: 'E-07-12-01', barcode: 'BC-E07120101', qrCode: 'QR-E-07-12-01', maxWeightKg: 500.00, maxVolumeM3: 1.60, currentWeightKg: 312.00, currentVolumeM3: 1.05, utilizationPercent: 62.40, temperatureZone: 'FROZEN', binType: 'STANDARD', status: 'OCCUPIED', statusReason: 'Vanilla ice cream 1L × 312 tubs', currentItemTypes: 1 },
  { id: 'bin-014', warehouseCode: 'WH-CS-MUM', zoneCode: '—', aisleCode: 'E', rackCode: 'R-07', shelfCode: 'S-12', binCode: 'E-07-12-02', barcode: 'BC-E07120102', qrCode: 'QR-E-07-12-02', maxWeightKg: 500.00, maxVolumeM3: 1.60, currentWeightKg: 540.00, currentVolumeM3: 1.65, utilizationPercent: 108.00, temperatureZone: 'FROZEN', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Chocolate ice cream 1L × 540 tubs — OVERLOADED', currentItemTypes: 1 },
  { id: 'bin-015', warehouseCode: 'WH-PKG-MUM', zoneCode: '—', aisleCode: 'F', rackCode: 'R-08', shelfCode: '—', binCode: 'F-08-00-01', barcode: 'BC-F08000001', qrCode: 'QR-F-08-00-01', maxWeightKg: 2500.00, maxVolumeM3: 12.00, currentWeightKg: 1420.00, currentVolumeM3: 7.80, utilizationPercent: 56.80, temperatureZone: 'AMBIENT', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Printed Kaju Katli 500g boxes × 2840', currentItemTypes: 1 },
]

const WH_LOC_CAPACITY_LOGS = [
  { id: 'bcl-001', binCode: 'B-03-06-01', warehouseName: 'Raw Material Warehouse', currentWeightKg: 1800.00, currentVolumeM3: 3.80, maxWeightKg: 1800.00, maxVolumeM3: 3.80, utilizationPercent: 100.00, alertType: 'FULL', alertMessage: 'Bin at 100% capacity. No further putaway allowed. Suggest overflow to B-03-07-01.', itemTypes: 1, totalQuantity: 36, snapshotAt: '09 Jul 08:45' },
  { id: 'bcl-002', binCode: 'E-07-12-02', warehouseName: 'Cold Storage Warehouse', currentWeightKg: 540.00, currentVolumeM3: 1.65, maxWeightKg: 500.00, maxVolumeM3: 1.60, utilizationPercent: 108.00, alertType: 'OVERLOADED', alertMessage: 'Bin OVERLOADED — 540 kg exceeds 500 kg max (8% over). Structural risk. Immediate redistribution required.', itemTypes: 1, totalQuantity: 540, snapshotAt: '09 Jul 07:35' },
  { id: 'bcl-003', binCode: 'A-01-02-01', warehouseName: 'Raw Material Warehouse', currentWeightKg: 480.00, currentVolumeM3: 1.90, maxWeightKg: 1200.00, maxVolumeM3: 5.20, utilizationPercent: 40.00, alertType: 'UNDERUTILIZED', alertMessage: 'Bin at 40% utilization for 7+ days. Consider consolidating or re-slotting for fast-moving stock.', itemTypes: 0, totalQuantity: 0, snapshotAt: '09 Jul 08:30' },
  { id: 'bcl-004', binCode: 'C-05-10-01', warehouseName: 'Finished Goods Warehouse', currentWeightKg: 285.00, currentVolumeM3: 1.10, maxWeightKg: 300.00, maxVolumeM3: 1.20, utilizationPercent: 95.00, alertType: 'NEAR_FULL', alertMessage: 'Bin at 95% capacity. Reserve for current SKU only — disable mixed-SKU putaway to prevent overflow.', itemTypes: 1, totalQuantity: 570, snapshotAt: '09 Jul 09:20' },
]

function utilizationColor(p: number): string {
  if (p >= 100) return 'bg-red-600'
  if (p >= 90) return 'bg-amber-500'
  if (p >= 60) return 'bg-emerald-500'
  if (p >= 30) return 'bg-blue-500'
  return 'bg-slate-400'
}

function utilizationTextColor(p: number): string {
  if (p >= 100) return 'text-red-600 dark:text-red-400'
  if (p >= 90) return 'text-amber-600 dark:text-amber-400'
  if (p >= 60) return 'text-emerald-600 dark:text-emerald-400'
  if (p >= 30) return 'text-blue-600 dark:text-blue-400'
  return 'text-slate-500'
}

