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

export function EquipmentMasterModule() {
  const [filterCat, setFilterCat] = useState<string>('ALL')
  const [showCreate, setShowCreate] = useState(false)

  const equipment = [
    { id: 'E1', code: 'FL-001', name: 'Toyota Electric Forklift', type: 'FORKLIFT', category: 'FORKLIFT', mfr: 'Toyota', model: '8FBE15', serial: 'TY2024-001', status: 'IN_USE', battery: 78, op: 'Rajesh K.', wh: 'WH-MUM-MAIN', purchaseDate: '2024-03-15', warranty: '2027-03-15', cost: 850000, hours: 1245.5, lastMaint: '2026-06-15', nextMaint: '2026-09-15', qr: 'QR-FL-001' },
    { id: 'E2', code: 'FL-002', name: 'Godrej Forklift', type: 'FORKLIFT', category: 'FORKLIFT', mfr: 'Godrej', model: 'GXE-15T', serial: 'GD2024-118', status: 'IN_USE', battery: 62, op: 'Suresh M.', wh: 'WH-MUM-MAIN', purchaseDate: '2024-04-20', warranty: '2027-04-20', cost: 720000, hours: 982.3, lastMaint: '2026-06-20', nextMaint: '2026-09-20', qr: 'QR-FL-002' },
    { id: 'E3', code: 'FL-003', name: 'Toyota Forklift Spare', type: 'FORKLIFT', category: 'FORKLIFT', mfr: 'Toyota', model: '8FBE20', serial: 'TY2024-002', status: 'AVAILABLE', battery: 95, op: null, wh: 'WH-MUM-MAIN', purchaseDate: '2024-07-01', warranty: '2027-07-01', cost: 920000, hours: 456.8, lastMaint: '2026-07-01', nextMaint: '2026-10-01', qr: 'QR-FL-003' },
    { id: 'E4', code: 'RT-001', name: 'Crown Reach Truck', type: 'REACH_TRUCK', category: 'REACH_TRUCK', mfr: 'Crown', model: 'RR5200', serial: 'CR2024-005', status: 'IN_USE', battery: 45, op: 'Mahesh R.', wh: 'WH-MUM-MAIN', purchaseDate: '2023-11-10', warranty: '2026-11-10', cost: 1250000, hours: 1876.2, lastMaint: '2026-05-10', nextMaint: '2026-08-10', qr: 'QR-RT-001' },
    { id: 'E5', code: 'ST-001', name: 'Godrej Stacker', type: 'STACKER', category: 'STACKER', mfr: 'Godrej', model: 'GSX-10', serial: 'GD2024-201', status: 'CHARGING', battery: 23, op: null, wh: 'WH-MUM-MAIN', purchaseDate: '2024-01-25', warranty: '2027-01-25', cost: 380000, hours: 734.1, lastMaint: '2026-06-25', nextMaint: '2026-09-25', qr: 'QR-ST-001' },
    { id: 'E6', code: 'SC-001', name: 'Zebra Scanner', type: 'SCANNER', category: 'SCANNER', mfr: 'Zebra', model: 'TC52', serial: 'ZB2024-1001', status: 'IN_USE', battery: 88, op: 'Anita S.', wh: 'WH-MUM-MAIN', purchaseDate: '2024-05-12', warranty: '2026-05-12', cost: 45000, hours: null, lastMaint: '2026-07-05', nextMaint: '2027-07-05', qr: 'QR-SC-001' },
    { id: 'E7', code: 'SC-002', name: 'Zebra Scanner 2', type: 'SCANNER', category: 'SCANNER', mfr: 'Zebra', model: 'TC52', serial: 'ZB2024-1002', status: 'AVAILABLE', battery: 92, op: null, wh: 'WH-MUM-MAIN', purchaseDate: '2024-05-12', warranty: '2026-05-12', cost: 45000, hours: null, lastMaint: '2026-07-05', nextMaint: '2027-07-05', qr: 'QR-SC-002' },
    { id: 'E8', code: 'FL-004', name: 'Toyota Forklift Broken', type: 'FORKLIFT', category: 'FORKLIFT', mfr: 'Toyota', model: '8FBE15', serial: 'TY2024-003', status: 'BREAKDOWN', battery: 0, op: null, wh: 'WH-MUM-MAIN', purchaseDate: '2023-02-10', warranty: '2026-02-10', cost: 850000, hours: 2104.7, lastMaint: '2026-07-08', nextMaint: '2026-10-08', qr: 'QR-FL-004' },
    { id: 'E9', code: 'MD-001', name: 'Samsung Galaxy Tab A9', type: 'TABLET', category: 'MOBILE_DEVICE', mfr: 'Samsung', model: 'Galaxy Tab A9', serial: 'SM2024-5001', status: 'ASSIGNED', battery: 65, op: 'Lakshmi V.', wh: 'WH-MUM-MAIN', purchaseDate: '2024-08-15', warranty: '2026-08-15', cost: 22000, hours: null, lastMaint: '2026-07-10', nextMaint: '2027-07-10', qr: 'QR-MD-001' },
    { id: 'E10', code: 'PR-001', name: 'Zebra Label Printer', type: 'LABEL_PRINTER', category: 'LABEL_PRINTER', mfr: 'Zebra', model: 'ZT411', serial: 'ZB2024-2001', status: 'AVAILABLE', battery: null, op: null, wh: 'WH-MUM-MAIN', purchaseDate: '2024-02-10', warranty: '2026-02-10', cost: 68000, hours: null, lastMaint: '2026-06-10', nextMaint: '2026-09-10', qr: 'QR-PR-001' },
  ]

  const filtered = equipment.filter(e => filterCat === 'ALL' || e.category === filterCat)

  const stats = [
    { label: 'Total Equipment', value: equipment.length, color: 'text-blue-600' },
    { label: 'Available', value: equipment.filter(e => e.status === 'AVAILABLE').length, color: 'text-emerald-600' },
    { label: 'In Use', value: equipment.filter(e => e.status === 'IN_USE').length, color: 'text-amber-600' },
    { label: 'Charging', value: equipment.filter(e => e.status === 'CHARGING').length, color: 'text-blue-600' },
    { label: 'Breakdown', value: equipment.filter(e => e.status === 'BREAKDOWN').length, color: 'text-rose-600' },
    { label: 'Total Value (₹)', value: `${(equipment.reduce((a, e) => a + e.cost, 0) / 100000).toFixed(1)}L`, color: 'text-purple-600' },
  ]

  const typeIcons: Record<string, React.ReactNode> = {
    FORKLIFT: <Truck className="h-4 w-4" />, REACH_TRUCK: <Truck className="h-4 w-4" />, STACKER: <Truck className="h-4 w-4" />, SCANNER: <ScanLine className="h-4 w-4" />, TABLET: <Smartphone className="h-4 w-4" />, LABEL_PRINTER: <Printer className="h-4 w-4" />,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Equipment Master</h2><p className="text-sm text-muted-foreground mt-1">Lifecycle management · QR-coded · purchase · warranty · maintenance schedule</p></div>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="mr-2 h-4 w-4" />Register Equipment</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      {showCreate && (
        <Card className="p-4 border-blue-300 bg-blue-50/50">
          <h3 className="font-semibold mb-3">Register New Equipment</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div><Label className="text-xs">Equipment Code</Label><Input className="mt-1" placeholder="FL-XXX" /></div>
            <div><Label className="text-xs">Equipment Name</Label><Input className="mt-1" placeholder="Toyota Forklift" /></div>
            <div><Label className="text-xs">Category</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>FORKLIFT</option><option>REACH_TRUCK</option><option>STACKER</option><option>SCANNER</option><option>MOBILE_DEVICE</option><option>LABEL_PRINTER</option></select></div>
            <div><Label className="text-xs">Manufacturer</Label><Input className="mt-1" placeholder="Toyota" /></div>
            <div><Label className="text-xs">Model</Label><Input className="mt-1" placeholder="8FBE15" /></div>
            <div><Label className="text-xs">Serial Number</Label><Input className="mt-1" placeholder="TY2024-XXX" /></div>
            <div><Label className="text-xs">Purchase Date</Label><Input type="date" className="mt-1" /></div>
            <div><Label className="text-xs">Purchase Cost (₹)</Label><Input type="number" className="mt-1" /></div>
            <div className="md:col-span-4 flex gap-2"><Button size="sm"><QrCode className="mr-1 h-4 w-4" />Generate QR &amp; Register</Button><Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {['ALL', 'FORKLIFT', 'REACH_TRUCK', 'STACKER', 'SCANNER', 'MOBILE_DEVICE', 'LABEL_PRINTER'].map(f => <button key={f} onClick={() => setFilterCat(f)} className={`text-xs px-3 py-1 rounded-full border ${filterCat === f ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>{f.replace(/_/g, ' ')}</button>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(e => {
          const b = s28BadgeForStatus(e.status)
          const batteryColor = e.battery === null ? 'bg-slate-200' : e.battery > 60 ? 'bg-emerald-500' : e.battery > 30 ? 'bg-amber-500' : e.battery > 10 ? 'bg-orange-500' : 'bg-rose-500'
          const warrantyActive = new Date(e.warranty) > new Date()
          return (
            <Card key={e.id} className={`p-4 ${e.status === 'BREAKDOWN' ? 'border-rose-300 bg-rose-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{typeIcons[e.type] || <Truck className="h-4 w-4" />}</div>
                  <div>
                    <div className="font-mono font-semibold text-sm">{e.code}</div>
                    <div className="text-xs text-muted-foreground">{e.name}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span>
                  <span className="text-[9px] font-mono text-purple-600">{e.qr}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer:</span><span>{e.mfr} {e.model}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Serial:</span><span className="font-mono">{e.serial}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Warehouse:</span><span className="font-mono">{e.wh}</span></div>
                {e.op && <div className="flex justify-between"><span className="text-muted-foreground">Operator:</span><span>{e.op}</span></div>}
                {e.battery !== null && (
                  <div className="flex items-center gap-2 mt-2"><span className="text-muted-foreground text-[10px] w-16">Battery:</span><div className="flex-1 h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${batteryColor}`} style={{ width: `${e.battery}%` }} /></div><span className="text-[10px] font-mono w-8">{e.battery}%</span></div>
                )}
                {e.hours !== null && <div className="flex justify-between"><span className="text-muted-foreground">Op Hours:</span><span className="font-mono">{e.hours}h</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Purchase:</span><span className="font-mono">{e.purchaseDate} · ₹{(e.cost / 100000).toFixed(1)}L</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Warranty:</span><span className={`font-mono ${warrantyActive ? 'text-emerald-600' : 'text-rose-600'}`}>{e.warranty} {warrantyActive ? '(Active)' : '(Expired)'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Next Maint:</span><span className="font-mono text-orange-600">{e.nextMaint}</span></div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><Award className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-sm">Chief Architect Recommendation — Treat Every Scanner as Enterprise Asset</h3>
            <p className="text-xs text-muted-foreground mt-1">For Sudhamrit, manage every barcode scanner, Android handheld, forklift, printer, and tablet as a tracked enterprise asset with full lifecycle: Purchase → Register → Assign → Daily Health Check → Software Updates → Battery Monitoring → Repair/Maintenance → Retire → Replace. This ensures warehouse productivity is never impacted by untracked equipment failures.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 2: Forklift Dashboard Module ──────────────────
