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
import { deliveryApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function DispatchModule() {
  const [tab, setTab] = useState<DispatchTab>('overview')

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true); setError('')
      try {
        const res = await deliveryApi.listDeliveryOrders({ page: 1, search: search || undefined })
        if (!cancelled) setData(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [search])
  const tabs: Array<{ key: DispatchTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'dispatches', label: 'Dispatches', icon: <Truck className="h-4 w-4" /> },
    { key: 'vehicles', label: 'Vehicles', icon: <Boxes className="h-4 w-4" /> },
    { key: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { key: 'gateexit', label: 'Gate Exit', icon: <ShieldCheck className="h-4 w-4" /> },
  ]

  const overviewStats = [
    { label: 'Pending Dispatch', value: '1', sub: 'PLANNED — awaiting vehicle', icon: <Clock className="h-5 w-5 text-amber-600" />, color: 'text-amber-600' },
    { label: 'Loading In Progress', value: '1', sub: 'BRANCH_TRANSFER · 04:20', icon: <ActivityIcon className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
    { label: 'Sealed Vehicles', value: '1', sub: 'Cold chain · awaiting gate exit', icon: <LockIcon className="h-5 w-5 text-amber-600" />, color: 'text-amber-600' },
    { label: 'Dispatched Today', value: '1', sub: 'EXPORT_SHIPMENT · 15:00', icon: <Truck className="h-5 w-5 text-emerald-600" />, color: 'text-emerald-600' },
    { label: 'Available Vehicles', value: '0', sub: 'All 5 vehicles assigned', icon: <Boxes className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
    { label: 'Avg Loading Time', value: '32 min', sub: 'SLA: ≤ 45 min', icon: <Clock className="h-5 w-5 text-indigo-600" />, color: 'text-indigo-600' },
    { label: 'Vehicle Fill %', value: '32%', sub: 'Weight utilization avg', icon: <Gauge className="h-5 w-5 text-cyan-600" />, color: 'text-cyan-600' },
    { label: 'On-Time Dispatch %', value: '94.2%', sub: 'SLA: ≥ 92%', icon: <TrendingUp className="h-5 w-5 text-emerald-600" />, color: 'text-emerald-600' },
  ]

  const dispatchFlow = [
    { label: 'Packed Orders', icon: <PackageCheck className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    { label: 'Dispatch Planning', icon: <Workflow className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
    { label: 'Vehicle Assignment', icon: <Truck className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    { label: 'Loading', icon: <Boxes className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    { label: 'Barcode Verification', icon: <ScanLine className="h-4 w-4" />, color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
    { label: 'Seal Vehicle', icon: <LockIcon className="h-4 w-4" />, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    { label: 'Gate Exit', icon: <ShieldCheck className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
    { label: 'Carrier', icon: <Truck className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    { label: 'Customer', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  ]

  const vehicleLoadVerification = ['Loading Complete', 'Scan Every Pallet', 'Scan Vehicle', 'Verify Dispatch Plan', 'Generate Manifest', 'Apply Seal', 'Security Gate Verification', 'Vehicle Exit']

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><Truck className="h-7 w-7" /> Dispatch, Shipping & Load Management Engine</h2>
            <p className="text-blue-100 text-sm max-w-3xl">The final outbound warehouse operation — converting packed cartons into dispatched shipments. 9 dispatch types, 5 vehicle types, 4 ownership models, load planning (weight/volume/pallet utilization), 7 shipping document types, 4 vehicle seal types, gate exit verification. Vehicle Load Verification (Chief Architect recommendation): 8-step chain from Loading Complete → Vehicle Exit ensures zero wrong-vehicle and zero wrong-load dispatches.</p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 27 · Part 4 WMS</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">Sprint 27 · 223 tables</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">6 Dispatch Orders</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">5 Dispatch Vehicles</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">3 Load Plans</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">4 Shipping Documents</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">2 Vehicle Seals</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">2 Gate Exit Logs</Badge>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <Button key={t.key} variant={tab === t.key ? 'default' : 'outline'} size="sm" onClick={() => setTab(t.key)} className="gap-2">
            {t.icon}{t.label}
          </Button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map(s => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Workflow className="h-5 w-5" /> Dispatch Flow — 9 Steps</h3>
            <div className="flex flex-wrap items-center gap-2">
              {dispatchFlow.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[110px]', step.color)}>
                    {step.icon}
                    <span className="text-xs font-medium text-center">{step.label}</span>
                  </div>
                  {i < dispatchFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Packed Orders → Dispatch Planning → Vehicle Assignment → Loading → Barcode Verification → Seal Vehicle → Gate Exit → Carrier → Customer. Each step has a verification gate; failure at any step halts the dispatch and raises an exception. The status of every dispatch order flows through this pipeline.</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 flex-shrink-0">
                <ScanLine className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Vehicle Load Verification <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Chief Architect Recommendation</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">After Loading Complete, the loading supervisor follows an 8-step verification chain to ensure zero wrong-vehicle and zero wrong-load dispatches. Every pallet is scanned against the dispatch plan, the vehicle number is confirmed, the manifest is generated, the seal is applied, and security does the gate verification before vehicle exit. This gives complete genealogy: Sales Order → Picking Task → Packing Job → Carton → Dispatch Order → Vehicle → Seal → Gate Exit → Carrier Tracking → Customer Delivery.</p>
                <div className="flex flex-wrap items-center gap-2">
                  {vehicleLoadVerification.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">{i + 1}. {step}</Badge>
                      {i < vehicleLoadVerification.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Failure at any step blocks the dispatch. Step 2 (Scan Every Pallet) eliminates wrong-load errors. Step 3 (Scan Vehicle) eliminates wrong-vehicle errors. Step 6 (Apply Seal) ensures tamper-evidence. Step 7 (Security Gate Verification) is the final human check.</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Boxes className="h-5 w-5" /> Vehicle Seals — Tamper Evidence</h3>
              <p className="text-xs text-muted-foreground mb-3">Vehicle seals are applied after loading complete and verified at gate exit. A verified seal means the vehicle has not been opened since leaving the dock. Four seal types cover different security needs.</p>
              <div className="space-y-2">
                {VEHICLE_SEALS_DATA.map(s => (
                  <div key={s.id} className="p-3 rounded-md bg-muted/50 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', SEAL_TYPE_COLORS[s.sealType])}>{s.sealType}</Badge>
                        <Badge className={cn('text-xs', SEAL_STATUS_COLORS[s.status])}>{s.status}</Badge>
                      </div>
                      <span className="font-mono text-xs font-bold">{s.sealNumber}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Dispatch: {s.dispatchNumber} · Applied: {s.appliedAt} by {s.appliedByName}</p>
                    {s.verifiedAt && <p className="text-xs text-emerald-700 dark:text-emerald-400">Verified: {s.verifiedAt} by {s.verifiedByName}</p>}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Workflow className="h-5 w-5" /> Load Plans — Capacity Utilization</h3>
              <p className="text-xs text-muted-foreground mb-3">Each load plan computes weight, volume, and pallet utilization against the vehicle capacity, then generates a loading sequence (back-to-front for multi-stop routes).</p>
              <div className="space-y-3">
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold">LP-001 · DSP-2026-0002</span>
                    <Badge variant="outline" className="text-xs">COMPLETED</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Vehicle: MH-04-CD-5678 (Container, 12T / 45m³)</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><span className="text-xs w-20">Weight</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: '30%' }} /></div><span className="text-xs font-mono">0.30%</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs w-20">Volume</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '40%' }} /></div><span className="text-xs font-mono">0.40%</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">3-step loading sequence · 1 pallet position · DD-03</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold">LP-003 · DSP-2026-0005</span>
                    <Badge variant="outline" className="text-xs">COMPLETED</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Vehicle: CONT-MUM-EXP-001 (Flatbed, 20T / 60m³)</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><span className="text-xs w-20">Weight</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: '29%' }} /></div><span className="text-xs font-mono">0.29%</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs w-20">Volume</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '53%' }} /></div><span className="text-xs font-mono">0.53%</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">4-step loading sequence · 1 pallet position · Export container</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'dispatches' && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Dispatch #</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium">Warehouse</th>
                  <th className="pb-2 pr-3 font-medium">Partner</th>
                  <th className="pb-2 pr-3 font-medium">Vehicle / Driver</th>
                  <th className="pb-2 pr-3 font-medium">Carrier / Route</th>
                  <th className="pb-2 pr-3 font-medium">Priority</th>
                  <th className="pb-2 pr-3 font-medium">Orders/Cartons/Qty</th>
                  <th className="pb-2 pr-3 font-medium">Weight/Volume</th>
                  <th className="pb-2 pr-3 font-medium">Timing</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {DISPATCH_ORDERS_DATA.map(o => (
                  <tr key={o.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 pr-3 font-mono text-xs font-semibold">{o.dispatchNumber}<div className="text-xs text-muted-foreground font-sans">{o.dispatchDate}</div></td>
                    <td className="py-3 pr-3"><Badge className={cn('text-xs', DISPATCH_TYPE_COLORS[o.dispatchType])}>{o.dispatchType}</Badge></td>
                    <td className="py-3 pr-3"><Badge className={cn('text-xs', DISPATCH_STATUS_COLORS[o.status])}>{o.status}</Badge></td>
                    <td className="py-3 pr-3 text-xs">{o.warehouseName}</td>
                    <td className="py-3 pr-3 text-xs">{o.partnerName}</td>
                    <td className="py-3 pr-3 text-xs"><span className="font-mono">{o.vehicleNumber}</span><div className="text-muted-foreground">{o.driverName}</div></td>
                    <td className="py-3 pr-3 text-xs">{o.carrierName}<div className="text-muted-foreground">{o.routeName}</div></td>
                    <td className="py-3 pr-3"><Badge className={cn('text-xs', DISPATCH_PRIORITY_COLORS[o.priority])}>{o.priority}</Badge></td>
                    <td className="py-3 pr-3 text-xs">{o.totalOrders}O / {o.totalCartons}C / {o.totalQty}Q</td>
                    <td className="py-3 pr-3 text-xs">{o.totalWeightKg} kg<div className="text-muted-foreground">{o.totalVolumeM3} m³</div></td>
                    <td className="py-3 pr-3 text-xs">
                      <div>Planned: {o.plannedDispatchAt}</div>
                      {o.loadingStartedAt && <div className="text-muted-foreground">Load: {o.loadingStartedAt} → {o.loadingCompletedAt || '...'}</div>}
                      {o.sealedAt && <div className="text-amber-700 dark:text-amber-400">Sealed: {o.sealedAt}</div>}
                      {o.dispatchedAt && <div className="text-emerald-700 dark:text-emerald-400">Dispatched: {o.dispatchedAt}</div>}
                      {o.loadingDurationMin !== null && <div className="text-muted-foreground">Duration: {o.loadingDurationMin} min</div>}
                    </td>
                    <td className="py-3">
                      {(o.status === 'LOADING' || o.status === 'LOADED') ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Complete</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Types:</span>
            {Object.keys(DISPATCH_TYPE_COLORS).slice(0, 6).map(t => (
              <Badge key={t} className={cn('text-xs', DISPATCH_TYPE_COLORS[t])}>{t}</Badge>
            ))}
            <span className="ml-3">Statuses:</span>
            {Object.keys(DISPATCH_STATUS_COLORS).slice(0, 7).map(s => (
              <Badge key={s} className={cn('text-xs', DISPATCH_STATUS_COLORS[s])}>{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {tab === 'vehicles' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DISPATCH_VEHICLES_DATA.map(v => (
              <Card key={v.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', VEHICLE_TYPE_COLORS[v.vehicleType])}>{v.vehicleType}</Badge>
                      <Badge className={cn('text-xs', VEHICLE_OWNERSHIP_COLORS[v.ownershipType])}>{v.ownershipType}</Badge>
                      <Badge className={cn('text-xs', VEHICLE_STATUS_COLORS[v.status])}>{v.status}</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold">{v.vehicleNumber}</p>
                    <p className="text-xs text-muted-foreground">ID: {v.id} · GPS: {v.hasGPS ? <span className="text-emerald-700 dark:text-emerald-400 font-mono">{v.gpsDeviceId}</span> : <span className="text-red-700 dark:text-red-400">offline</span>}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-muted-foreground">Max Wt</p>
                    <p className="font-semibold">{v.maxWeightKg} kg</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-muted-foreground">Max Vol</p>
                    <p className="font-semibold">{v.maxVolumeM3} m³</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-muted-foreground">Pallets</p>
                    <p className="font-semibold">{v.palletCapacity}</p>
                  </div>
                </div>
                {v.isTemperatureControlled ? (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300">
                    <Snowflake className="h-4 w-4" />
                    <span className="text-xs font-medium">Temperature Controlled: {v.minTemp}°C to {v.maxTemp}°C</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-muted/30 text-muted-foreground">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-xs">Ambient (no temperature control)</span>
                  </div>
                )}
                <div className="space-y-1 text-xs mb-3 border-t pt-2">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Driver</span><span className="font-semibold">{v.driverName}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Phone</span><span className="font-mono">{v.driverPhone}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">License</span><span className="font-mono text-xs">{v.driverLicense}</span></div>
                  {v.helperName && <div className="flex items-center justify-between"><span className="text-muted-foreground">Helper</span><span className="font-semibold">{v.helperName}</span></div>}
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Avg Utilization</span>
                    <span className="font-semibold">{v.avgUtilization}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full', v.avgUtilization > 85 ? 'bg-emerald-500' : v.avgUtilization > 70 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${v.avgUtilization}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{v.totalTrips} total trips</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Boxes className="h-5 w-5" /> Fleet Summary</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">By Ownership</p>
                <div className="flex flex-wrap gap-1">
                  <Badge className="bg-blue-600 text-white text-xs">OWN_FLEET × 2</Badge>
                  <Badge className="bg-amber-500 text-white text-xs">THIRD_PARTY × 2</Badge>
                  <Badge className="bg-slate-400 text-white text-xs">RENTAL × 1</Badge>
                </div>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">By Type</p>
                <div className="flex flex-wrap gap-1">
                  <Badge className={cn('text-xs', VEHICLE_TYPE_COLORS.TRUCK)}>TRUCK × 1</Badge>
                  <Badge className={cn('text-xs', VEHICLE_TYPE_COLORS.CONTAINER)}>CONTAINER × 1</Badge>
                  <Badge className={cn('text-xs', VEHICLE_TYPE_COLORS.REFRIGERATED)}>REFRIGERATED × 1</Badge>
                  <Badge className={cn('text-xs', VEHICLE_TYPE_COLORS.TEMPO)}>TEMPO × 1</Badge>
                  <Badge className={cn('text-xs', VEHICLE_TYPE_COLORS.FLATBED)}>FLATBED × 1</Badge>
                </div>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Temperature Control</p>
                <p className="text-sm font-semibold">1 vehicle (20%) — Cold chain 2-8°C</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">GPS Coverage</p>
                <p className="text-sm font-semibold">4/5 (80%) — 1 rental offline</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {SHIPPING_DOCUMENTS_DATA.map(d => (
              <Card key={d.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', DOC_TYPE_COLORS[d.documentType])}>{d.documentType}</Badge>
                      <Badge className={cn('text-xs', DOC_STATUS_COLORS[d.status])}>{d.status}</Badge>
                      <Badge variant="outline" className="text-xs">{d.format}</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold">{d.documentNumber}</p>
                    <p className="text-xs text-muted-foreground">{d.documentDate} · Dispatch: {d.dispatchNumber}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Partner</p>
                    <p className="font-semibold text-xs">{d.partnerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ship-To Address</p>
                    <p className="text-xs">{d.shipToAddress}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
                  <div>
                    <p className="text-muted-foreground">Generated</p>
                    <p className="font-semibold text-xs">{d.generatedAt || <span className="italic text-muted-foreground">pending</span>}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Printed</p>
                    <p className="font-semibold text-xs">{d.printedAt || <span className="italic text-muted-foreground">pending</span>}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-mono text-xs font-semibold">{d.fileSizeBytes ? `${Math.round(d.fileSizeBytes / 1024)} KB` : <span className="italic text-muted-foreground">—</span>}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 border-t pt-2">
                  <span className="text-xs text-muted-foreground">{d.fileUrl ? <span className="font-mono">{d.fileUrl}</span> : <span className="italic">no file generated yet</span>}</span>
                  {d.status === 'PENDING' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><FileText className="h-3 w-3" /> Generate</Button>}
                  {d.status === 'GENERATED' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Printer className="h-3 w-3" /> Print</Button>}
                  {d.status === 'PRINTED' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ArrowRight className="h-3 w-3" /> Send</Button>}
                  {d.status === 'SENT' && <Badge variant="outline" className="text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1 inline" />Sent</Badge>}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Shipping Document Lifecycle <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">7 Document Types</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">Seven document types accompany each dispatch, generated in sequence as the dispatch moves through its lifecycle. Status flow: PENDING → GENERATED → PRINTED → SENT. The Delivery Manifest is the master document — it lists every carton, weight, and pallet on the vehicle, and is signed by the carrier at hand-off. The e-Way Bill is mandatory under GST for movement of goods above ₹50,000.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'DELIVERY_CHALLAN', desc: 'Internal proof of movement — created at dispatch, signed by driver' },
                    { name: 'TAX_INVOICE_REF', desc: 'GST invoice reference — linked to commercial engine' },
                    { name: 'PACKING_LIST', desc: 'Carton-level detail for receiver — item × qty per carton' },
                    { name: 'DELIVERY_MANIFEST', desc: 'Carrier hand-off document — master list of cartons/pallets' },
                    { name: 'EXPORT_DOCUMENTS', desc: 'Customs + port — Bill of Lading, Shipping Bill, COO' },
                    { name: 'TRANSPORT_RECEIPT', desc: 'LR (Lorry Receipt) / GR (Goods Receipt) — carrier acknowledgment' },
                    { name: 'E_WAY_BILL_REF', desc: 'GSTN e-way bill — mandatory for movement > ₹50,000' },
                  ].map(t => (
                    <div key={t.name} className="p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn('text-xs', DOC_TYPE_COLORS[t.name])}>{t.name}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'gateexit' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {GATE_EXIT_LOGS_DATA.map(g => (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', GATE_EXIT_STATUS_COLORS[g.status])}>{g.status}</Badge>
                      <Badge variant="outline" className="text-xs">{g.exitNumber}</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold">Dispatch: {g.dispatchNumber}</p>
                    <p className="text-xs text-muted-foreground">{g.exitDate} · Vehicle: <span className="font-mono">{g.vehicleNumber}</span></p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1 text-xs mb-3 border-t pt-2">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Driver</span><span className="font-semibold">{g.driverName}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Security Officer</span><span className="font-semibold">{g.securityOfficerName}</span></div>
                  {g.exitTime && <div className="flex items-center justify-between"><span className="text-muted-foreground">Exit Time</span><span className="font-semibold text-emerald-700 dark:text-emerald-400">{g.exitTime}</span></div>}
                  {g.approvedByName && <div className="flex items-center justify-between"><span className="text-muted-foreground">Approved By</span><span className="font-semibold">{g.approvedByName}</span></div>}
                </div>
                <div className="border-t pt-2 mb-3">
                  <p className="text-xs font-semibold mb-2">Verification Checklist</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={cn('flex flex-col items-center gap-1 p-2 rounded-md', g.sealVerified ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400')}>
                      {g.sealVerified ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangleIcon className="h-4 w-4" />}
                      <span className="font-medium">Seal Verified</span>
                    </div>
                    <div className={cn('flex flex-col items-center gap-1 p-2 rounded-md', g.documentsVerified ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400')}>
                      {g.documentsVerified ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangleIcon className="h-4 w-4" />}
                      <span className="font-medium">Docs Verified</span>
                    </div>
                    <div className={cn('flex flex-col items-center gap-1 p-2 rounded-md', g.vehicleInspected ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400')}>
                      {g.vehicleInspected ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangleIcon className="h-4 w-4" />}
                      <span className="font-medium">Vehicle Insp.</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground italic mb-2">{g.remarks}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Gate log: {g.id}</span>
                    {(g.status === 'PENDING' || g.status === 'VERIFIED') ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={!g.sealVerified || !g.documentsVerified || !g.vehicleInspected}>
                        <CheckCircle2 className="h-3 w-3" /> Approve &amp; Exit
                      </Button>
                    ) : g.status === 'EXITED' ? (
                      <Badge variant="outline" className="text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1 inline" />Exited</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Gate Exit Verification <Badge className="bg-emerald-500 text-emerald-950 hover:bg-emerald-500">Final Checkpoint</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">Gate Exit is the final checkpoint before vehicle leaves the warehouse premises. Security officer verifies three things: (1) Seal intact &amp; number matches dispatch order, (2) Shipping documents printed &amp; attached to vehicle, (3) Vehicle inspection — driver license, vehicle number plate matches, no unauthorized cargo. Only after all three checks pass does the gate manager approve and the vehicle exits. Failure at any check DENIES the exit and raises an exception.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="p-3 rounded-md bg-muted/50">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-2"><LockIcon className="h-4 w-4 text-amber-600" /> 1. Seal Verification</p>
                    <p className="text-xs text-muted-foreground">Security verifies seal number matches the dispatch order's VehicleSeal record. Broken seal = DENY exit.</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> 2. Document Check</p>
                    <p className="text-xs text-muted-foreground">Delivery Manifest, e-Way Bill, Delivery Challan printed and attached. No docs = DENY exit.</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-2"><Truck className="h-4 w-4 text-purple-600" /> 3. Vehicle Inspection</p>
                    <p className="text-xs text-muted-foreground">Driver license valid, vehicle number matches, no unauthorized cargo. Mismatch = DENY exit.</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Status flow: PENDING (awaiting inspection) → VERIFIED (all 3 checks passed) → APPROVED (gate manager approves) → EXITED (vehicle has left premises) — or DENIED if any check fails. Approved = EXITED in this implementation.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Settings Module (Sprint 2) ─────────────────────────
function SettingsModule() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Platform Settings</h2>
        <p className="text-slate-300 text-sm">Configuration, Infrastructure, Health Monitoring</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'PostgreSQL', status: 'healthy', icon: <Database className="h-5 w-5" /> },
          { name: 'Redis', status: 'healthy', icon: <Zap className="h-5 w-5" /> },
          { name: 'RabbitMQ', status: 'healthy', icon: <Activity className="h-5 w-5" /> },
          { name: 'MinIO Storage', status: 'healthy', icon: <HardDrive className="h-5 w-5" /> },
          { name: 'OpenSearch', status: 'offline', icon: <Search className="h-5 w-5" /> },
          { name: 'Backend API', status: 'healthy', icon: <Server className="h-5 w-5" /> },
        ].map(s => (
          <Card key={s.name} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', s.status === 'healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>{s.icon}</div>
                <div><p className="text-sm font-medium">{s.name}</p></div>
              </div>
              <Badge className={cn('text-xs', s.status === 'healthy' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground')}>{s.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// SPRINT 28 — WAVE PLANNING & TASK ORCHESTRATION MODULES
// Epic 1-8: Wave Planning, Task Engine, Workforce, Equipment,
//           Control Tower, SLA, Exceptions, Workforce Analytics
// ═════════════════════════════════════════════════════════

// ─── Shared Sprint 28 Helpers ────────────────────────────
