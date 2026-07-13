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

export function ReceivingModule() {
  const [tab, setTab] = useState<RecvTab>('overview')
  const tabs: Array<{ key: RecvTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'asns', label: 'ASNs', icon: <Truck className="h-4 w-4" /> },
    { key: 'appointments', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
    { key: 'docks', label: 'Docks', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'exceptions', label: 'Exceptions', icon: <AlertTriangle className="h-4 w-4" /> },
  ]

  const overviewStats = [
    { label: 'Active ASNs', value: '4', sub: '2 ARRIVED · 2 CONFIRMED', icon: <Truck className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
    { label: "Today's Appointments", value: '2', sub: '1 ARRIVED · 1 CONFIRMED', icon: <Calendar className="h-5 w-5 text-cyan-600" />, color: 'text-cyan-600' },
    { label: 'Available Docks', value: '2', sub: 'of 5 docks', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, color: 'text-emerald-600' },
    { label: 'Occupied Docks', value: '2', sub: 'RD-01, RD-02', icon: <Activity className="h-5 w-5 text-amber-600" />, color: 'text-amber-600' },
    { label: 'Gate Entries Today', value: '3', sub: '1 broken seal', icon: <ShieldCheck className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
    { label: 'Active Exceptions', value: '2', sub: '1 PENDING · 1 REVIEW', icon: <AlertTriangle className="h-5 w-5 text-red-600" />, color: 'text-red-600' },
    { label: 'Avg Dock-to-Stock', value: '42 min', sub: 'SLA: ≤ 60 min', icon: <Clock className="h-5 w-5 text-indigo-600" />, color: 'text-indigo-600' },
    { label: 'Receiving Efficiency', value: '94.5%', sub: 'On-time: 87.5%', icon: <Gauge className="h-5 w-5 text-teal-600" />, color: 'text-teal-600' },
  ]

  const receivingFlow = [
    { label: 'Supplier', icon: <Users2 className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    { label: 'ASN', icon: <FileText className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    { label: 'Appointment', icon: <Calendar className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
    { label: 'Gate Entry', icon: <ShieldCheck className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    { label: 'Dock', icon: <Warehouse className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    { label: 'Unload', icon: <ArrowDownToLine className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    { label: 'Verify', icon: <ClipboardCheck className="h-4 w-4" />, color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
    { label: 'Goods Receipt', icon: <PackageCheck className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
    { label: 'Putaway', icon: <ArrowUpFromLine className="h-4 w-4" />, color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  ]

  const palletHierarchy = [
    { level: '1 Pallet', qty: '1', color: 'bg-emerald-500', desc: 'Scan ONE barcode — receive entire pallet' },
    { level: 'Boxes', qty: '48', color: 'bg-blue-500', desc: 'Pallet-internal packing list (printed by supplier)' },
    { level: 'Packs', qty: '24', color: 'bg-purple-500', desc: 'Inner packs per box (6 packs × 8 boxes)' },
    { level: 'Units', qty: '12', color: 'bg-amber-500', desc: 'Smallest sellable unit per pack' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><Truck className="h-7 w-7" /> Receiving Operations & ASN Engine</h2>
            <p className="text-emerald-100 text-sm max-w-3xl">Advanced Shipping Notices, Receiving Appointments, Gate Entries, Loading Docks, Receiving Exceptions — the physical warehouse receiving layer. 9-step flow: Supplier → ASN → Appointment → Gate Entry → Dock → Unload → Verify → Goods Receipt → Putaway.</p>
          </div>
          <Badge className="bg-emerald-500 text-emerald-950 hover:bg-emerald-500">Sprint 27 · Part 4 WMS</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">Sprint 27 · 223 tables</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">6 ASNs</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">4 Appointments</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">3 Gate Entries</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">5 Loading Docks</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">4 Receiving Exceptions</Badge>
        </div>
      </Card>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">New receiving/ module (ASN, Appointments, Docks)</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>

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
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Workflow className="h-5 w-5" /> Receiving Flow — 9 Steps</h3>
            <div className="flex flex-wrap items-center gap-2">
              {receivingFlow.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[90px]', step.color)}>
                    {step.icon}
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>
                  {i < receivingFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">The ASN is the digital twin of incoming cargo before it physically arrives. Without an ASN, the gate cannot pre-validate, the dock cannot be pre-assigned, and the receiving clerk has no expected-quantity to scan against.</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex-shrink-0">
                <Boxes className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Pallet-Level Receiving <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Chief Architect Recommendation</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">Receive by scanning ONE pallet barcode instead of 48 individual box barcodes. The system trusts the pallet-internal packing list (printed by supplier) and verifies via 5% statistical sampling. This reduces receiving time by 80% (40 min → 8 min/vehicle) and barcode-scan errors by 95% (3% → 0.1%).</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {palletHierarchy.map((h, i) => (
                    <div key={h.level} className="flex items-center gap-2">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-md text-white font-bold text-sm', h.color)}>{h.qty}</div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{h.level}</p>
                        <p className="text-xs text-muted-foreground">{i === 0 ? 'Pallet level' : `per ${palletHierarchy[i - 1].level.toLowerCase()}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  <span>1 Pallet → 48 Boxes → 24 Packs → 12 Units · Each level has its own barcode + packing slip</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'asns' && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3 font-medium">ASN Number</th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Supplier</th>
                  <th className="py-2 px-3 font-medium">Expected Arrival</th>
                  <th className="py-2 px-3 font-medium">Vehicle</th>
                  <th className="py-2 px-3 font-medium">Warehouse</th>
                  <th className="py-2 px-3 font-medium text-center">Lines</th>
                  <th className="py-2 px-3 font-medium text-center">Pallets</th>
                  <th className="py-2 px-3 font-medium text-center">Cartons</th>
                  <th className="py-2 px-3 font-medium text-center">Total Qty</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {RECV_ASNS.map(a => (
                  <tr key={a.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-3 font-mono text-xs font-semibold">{a.asnNumber}</td>
                    <td className="py-2 px-3"><Badge className={cn('text-xs', RECV_TYPE_COLORS[a.receivingType])}>{a.receivingType.replace(/_/g, ' ')}</Badge></td>
                    <td className="py-2 px-3 text-xs">{a.supplierName}</td>
                    <td className="py-2 px-3 text-xs font-mono">{a.expectedArrival}</td>
                    <td className="py-2 px-3 text-xs font-mono">{a.vehicleNumber}</td>
                    <td className="py-2 px-3 text-xs">{a.warehouseName}</td>
                    <td className="py-2 px-3 text-center font-mono">{a.totalLines}</td>
                    <td className="py-2 px-3 text-center font-mono">{a.totalPallets}</td>
                    <td className="py-2 px-3 text-center font-mono">{a.totalCartons}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold">{a.totalQuantity}</td>
                    <td className="py-2 px-3"><Badge className={cn('text-xs', ASN_STATUS_COLORS[a.status])}>{a.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="py-2 px-3 text-center">
                      {a.status === 'CONFIRMED' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Confirm</Button>
                      )}
                      {a.status !== 'CONFIRMED' && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">6 ASNs across 8 receiving types — PURCHASE_ORDER, INTER_WAREHOUSE_TRANSFER, CUSTOMER_RETURN, SUPPLIER_REPLACEMENT, MANUFACTURING_RECEIPT, VENDOR_MANAGED_INVENTORY</p>
            <Badge variant="outline">7 status colors · 8 type colors</Badge>
          </div>
        </Card>
      )}

      {tab === 'appointments' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {RECV_APPOINTMENTS.map(a => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">{a.appointmentNumber}</p>
                    <p className="text-xs text-muted-foreground">{a.warehouseName} · Dock {a.dockCode}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={cn('text-xs', APPT_PRIORITY_COLORS[a.priority])}>{a.priority}</Badge>
                    <Badge className={cn('text-xs', APPT_STATUS_COLORS[a.status])}>{a.status.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-mono text-sm font-semibold">{a.appointmentDate}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Time Slot</p>
                    <p className="font-mono text-sm font-semibold">{a.startTime}–{a.endTime}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">ASN</p>
                    <p className="font-mono text-sm font-semibold">{a.asnNumber || '—'}</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2"><Users2 className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Supplier:</span><span className="font-medium">{a.supplierName}</span></div>
                  <div className="flex items-center gap-2"><Truck className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Vehicle:</span><span className="font-mono font-medium">{a.vehicleNumber}</span></div>
                  <div className="flex items-center gap-2"><UserCog className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Driver:</span><span className="font-medium">{a.driverName}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'docks' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {RECV_DOCKS.map(d => (
              <Card key={d.id} className={cn('p-4 border-l-4', d.status === 'AVAILABLE' && 'border-l-emerald-500', d.status === 'OCCUPIED' && 'border-l-amber-500', d.status === 'MAINTENANCE' && 'border-l-red-500', d.status === 'CLOSED' && 'border-l-slate-500')}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold">{d.dockCode}</p>
                    <p className="text-xs text-muted-foreground">{d.dockName}</p>
                  </div>
                  <Badge className={cn('text-xs', DOCK_STATUS_COLORS[d.status])}>{d.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn('text-xs', DOCK_TYPE_COLORS[d.dockType])}>{d.dockType.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className="text-xs">{d.maxVehicleSize}</Badge>
                  {d.isTemperatureControlled && <Badge className="text-xs bg-cyan-500 text-white"><Snowflake className="h-3 w-3 mr-1" />{d.temperatureZone}</Badge>}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Warehouse</span>
                    <span className="font-medium text-right">{d.warehouseName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Door #</span>
                    <span className="font-mono font-medium">{d.dockDoorNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-mono font-medium">{d.currentVehicleNumber || '—'}</span>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={cn('rounded-md p-1.5', d.hasForkliftAccess ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                    <Truck className="h-3 w-3 mx-auto mb-0.5" />
                    <p className="text-[10px] font-medium">Forklift</p>
                  </div>
                  <div className={cn('rounded-md p-1.5', d.hasPalletJack ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                    <Package className="h-3 w-3 mx-auto mb-0.5" />
                    <p className="text-[10px] font-medium">Pallet Jack</p>
                  </div>
                  <div className={cn('rounded-md p-1.5', d.hasConveyor ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                    <ArrowDownToLine className="h-3 w-3 mx-auto mb-0.5" />
                    <p className="text-[10px] font-medium">Conveyor</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-muted-foreground">Avg Unload</p>
                    <p className="font-mono font-semibold">{d.avgUnloadTime} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Operations</p>
                    <p className="font-mono font-semibold">{d.totalOperations}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'exceptions' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {RECV_EXCEPTIONS.map(e => (
              <Card key={e.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold">{e.exceptionNumber}</p>
                    <p className="text-xs text-muted-foreground">ASN {e.asnNumber} · {e.exceptionDate}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={cn('text-xs', EXCEPTION_TYPE_COLORS[e.exceptionType])}>{e.exceptionType.replace(/_/g, ' ')}</Badge>
                    <Badge className={cn('text-xs', RESOLUTION_STATUS_COLORS[e.resolutionStatus])}>{e.resolutionStatus.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{e.description}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-md bg-muted/50 p-2 text-center">
                    <p className="text-xs text-muted-foreground">Expected</p>
                    <p className="font-mono text-sm font-semibold">{e.expectedQty}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2 text-center">
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="font-mono text-sm font-semibold">{e.receivedQty}</p>
                  </div>
                  <div className={cn('rounded-md p-2 text-center', e.differenceQty < 0 ? 'bg-red-100 dark:bg-red-950' : e.differenceQty > 0 ? 'bg-amber-100 dark:bg-amber-950' : 'bg-muted/50')}>
                    <p className="text-xs text-muted-foreground">Difference</p>
                    <p className={cn('font-mono text-sm font-bold', e.differenceQty < 0 ? 'text-red-600 dark:text-red-400' : e.differenceQty > 0 ? 'text-amber-600 dark:text-amber-400' : '')}>{e.differenceQty > 0 ? '+' : ''}{e.differenceQty}</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1 text-xs mb-3">
                  <div className="flex items-center gap-2"><Package className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Product:</span><span className="font-medium">{e.productName}</span></div>
                  {e.resolutionNotes && (
                    <div className="flex items-start gap-2"><FileText className="h-3 w-3 text-muted-foreground mt-0.5" /><span className="text-muted-foreground">Notes:</span><span className="font-medium flex-1">{e.resolutionNotes}</span></div>
                  )}
                  {e.resolvedByName && (
                    <div className="flex items-center gap-2"><UserCog className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Resolved by:</span><span className="font-medium">{e.resolvedByName}</span></div>
                  )}
                </div>
                {e.resolutionStatus === 'PENDING' && (
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Resolve Exception</Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Directed Putaway Module (Sprint 25) ───────────────────
type PutawayTab = 'overview' | 'tasks' | 'rules' | 'pallets' | 'forklift'

const PUTAWAY_TYPE_COLORS: Record<string, string> = {
  DIRECTED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  CROSS_DOCK: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PALLET: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  COLD_STORAGE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  RETURNS: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  STANDARD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  LOADING: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  UNLOADING: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  REPLENISHMENT: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
}

const PUTAWAY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-500 text-white',
  ASSIGNED: 'bg-cyan-600 text-white',
  IN_PROGRESS: 'bg-purple-600 text-white',
  COMPLETED: 'bg-emerald-600 text-white',
  PARTIALLY_COMPLETED: 'bg-amber-500 text-white',
  CANCELLED: 'bg-red-600 text-white',
  AVAILABLE: 'bg-emerald-600 text-white',
}

const PUTAWAY_PRIORITY_COLORS: Record<string, string> = {
  EMERGENCY: 'bg-red-600 text-white',
  HIGH: 'bg-amber-500 text-white',
  NORMAL: 'bg-blue-500 text-white',
  LOW: 'bg-slate-400 text-white',
}

const STRATEGY_COLORS: Record<string, string> = {
  FEFO: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  FIFO: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  ABC: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  CLOSEST_EMPTY: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  FAST_MOVING_ZONE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
}

const PALLET_TYPE_COLORS: Record<string, string> = {
  STANDARD: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  EURO: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  CHEP: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  PLASTIC: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  DISPOSABLE: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const PALLET_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-600 text-white',
  LOADED: 'bg-amber-500 text-white',
  STORED: 'bg-blue-600 text-white',
  EMPTY: 'bg-slate-400 text-white',
  QUARANTINED: 'bg-red-600 text-white',
}

const FORKLIFT_TYPE_COLORS: Record<string, string> = {
  PUTAWAY: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  TRANSFER: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PICKING: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  LOADING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  UNLOADING: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
}

const FORKLIFT_STATUS_COLORS: Record<string, string> = {
  ASSIGNED: 'bg-cyan-600 text-white',
  IN_PROGRESS: 'bg-purple-600 text-white',
  COMPLETED: 'bg-emerald-600 text-white',
  CANCELLED: 'bg-red-600 text-white',
}

const PUTAWAY_TASKS = [
  { id: 'pt-001', taskNumber: 'PT-2026-0001', taskDate: '2026-07-09 08:30', type: 'DIRECTED', warehouseName: 'Raw Material Warehouse', sourceZone: 'RECEIVING_DOCK_R01', destZone: 'BULK_STORAGE_A', referenceNumber: 'ASN-2026-0001', priority: 'HIGH', status: 'IN_PROGRESS', assignedOperatorName: 'Rajesh Kumar (FL-01)', totalLines: 3, totalPallets: 12, totalQuantity: 1800, putawayProgress: 33, estTimeMin: 45, actualTimeMin: 28 },
  { id: 'pt-002', taskNumber: 'PT-2026-0002', taskDate: '2026-07-09 07:00', type: 'CROSS_DOCK', warehouseName: 'Finished Goods Warehouse', sourceZone: 'RECEIVING_DOCK_R02', destZone: 'DISPATCH_STAGING_D01', referenceNumber: 'ST-2026-0018', priority: 'EMERGENCY', status: 'COMPLETED', assignedOperatorName: 'Sunil Yadav (FL-02)', totalLines: 2, totalPallets: 8, totalQuantity: 960, putawayProgress: 100, estTimeMin: 30, actualTimeMin: 35 },
  { id: 'pt-003', taskNumber: 'PT-2026-0003', taskDate: '2026-07-09 09:00', type: 'PALLET', warehouseName: 'Finished Goods Warehouse', sourceZone: 'RECEIVING_DOCK_R02', destZone: 'HIGH_RACK_C', referenceNumber: 'PRD-2026-0156', priority: 'NORMAL', status: 'ASSIGNED', assignedOperatorName: 'Deepak Sharma (FL-03)', totalLines: 2, totalPallets: 6, totalQuantity: 720, putawayProgress: 0, estTimeMin: 25, actualTimeMin: null },
  { id: 'pt-004', taskNumber: 'PT-2026-0004', taskDate: '2026-07-09 05:30', type: 'COLD_STORAGE', warehouseName: 'Cold Storage Warehouse', sourceZone: 'RECEIVING_DOCK_C01', destZone: 'CHILLED_ZONE_B', referenceNumber: 'PO-2026-0051', priority: 'HIGH', status: 'PARTIALLY_COMPLETED', assignedOperatorName: 'Imran Sheikh (FL-04)', totalLines: 4, totalPallets: 10, totalQuantity: 400, putawayProgress: 50, estTimeMin: 60, actualTimeMin: 48 },
  { id: 'pt-005', taskNumber: 'PT-2026-0005', taskDate: '2026-07-08 16:00', type: 'RETURNS', warehouseName: 'Finished Goods Warehouse', sourceZone: 'RETURNS_INSPECTION_R', destZone: 'RETURNS_QUARANTINE_Q', referenceNumber: 'SR-2026-0093', priority: 'LOW', status: 'PENDING', assignedOperatorName: null, totalLines: 1, totalPallets: 1, totalQuantity: 24, putawayProgress: 0, estTimeMin: 15, actualTimeMin: null },
  { id: 'pt-006', taskNumber: 'PT-2026-0006', taskDate: '2026-07-09 10:00', type: 'STANDARD', warehouseName: 'Packaging Warehouse', sourceZone: 'RECEIVING_DOCK_P01', destZone: 'PACKAGING_PICKFACE_P', referenceNumber: 'PO-2026-0062', priority: 'NORMAL', status: 'PENDING', assignedOperatorName: null, totalLines: 2, totalPallets: 5, totalQuantity: 500, putawayProgress: 0, estTimeMin: 30, actualTimeMin: null },
]

const PUTAWAY_RULES = [
  { id: 'pr-001', ruleCode: 'PA-FEFO-001', ruleName: 'First Expiry First Out (FEFO)', strategy: 'FEFO', priority: 1, isActive: true, description: 'Directs putaway of expiry-sensitive products to bins closest to the pick face, ensuring the soonest-to-expire batch is picked first.', factorWeights: { capacity: 20, distance: 30, compatibility: 15, temperature: 20, pickingEfficiency: 15 }, conditions: ['productCategory IN (FOOD, PERISHABLE, CHILLED)', 'shelfLifeDays <= 180', 'hasExpiryDate = true'], targetZones: ['PICK_FACE_A', 'PICK_FACE_B'] },
  { id: 'pr-002', ruleCode: 'PA-FIFO-002', ruleName: 'First In First Out (FIFO)', strategy: 'FIFO', priority: 2, isActive: true, description: 'Directs putaway of non-perishable raw materials to bins by arrival date — earliest received stock is positioned for first picking.', factorWeights: { capacity: 25, distance: 25, compatibility: 20, temperature: 10, pickingEfficiency: 20 }, conditions: ['productCategory = RAW_MATERIAL', 'shelfLifeDays > 180', 'perishableFlag = false'], targetZones: ['BULK_STORAGE_A', 'BULK_STORAGE_B'] },
  { id: 'pr-003', ruleCode: 'PA-ABC-003', ruleName: 'ABC Classification Slotting', strategy: 'ABC', priority: 3, isActive: true, description: 'A-class items (top 20% revenue, fast-moving) slotted to ground-floor pick-face bins for maximum picking speed. B-class to mid-level. C-class to high reserve racks.', factorWeights: { capacity: 15, distance: 35, compatibility: 10, temperature: 5, pickingEfficiency: 35 }, conditions: ['abcClass IN (A, B, C)', 'fsnClass IN (FAST, MEDIUM)'], targetZones: ['PICK_FACE_A', 'PICK_FACE_B', 'HIGH_RACK_C', 'HIGH_RACK_D'] },
  { id: 'pr-004', ruleCode: 'PA-CLSEMPTY-004', ruleName: 'Closest Empty Bin', strategy: 'CLOSEST_EMPTY', priority: 4, isActive: true, description: 'Fallback rule for items with no specific slotting rule — finds the geographically closest empty bin to the receiving dock, minimizing forklift travel distance.', factorWeights: { capacity: 30, distance: 40, compatibility: 15, temperature: 5, pickingEfficiency: 10 }, conditions: ['ruleFallback = true', 'binStatus = EMPTY'], targetZones: ['ANY_ZONE'] },
  { id: 'pr-005', ruleCode: 'PA-FASTMV-005', ruleName: 'Fast-Moving Zone Slotting', strategy: 'FAST_MOVING_ZONE', priority: 5, isActive: true, description: 'Fast-moving SKUs (FSN=FAST, >50 picks/month) slotted to the fast-moving zone near the dispatch dock for outbound velocity optimization.', factorWeights: { capacity: 10, distance: 30, compatibility: 10, temperature: 5, pickingEfficiency: 45 }, conditions: ['fsnClass = FAST', 'monthlyPickCount > 50', 'dispatchFrequency = DAILY'], targetZones: ['FAST_MOVING_ZONE_F', 'DISPATCH_STAGING_D01'] },
]

const WAREHOUSE_PALLETS = [
  { id: 'plt-001', palletBarcode: 'PAL-2026-0001', qrCode: 'QR-PAL-2026-0001', palletType: 'STANDARD', warehouseName: 'Raw Material Warehouse', currentLocation: 'A-05-03-12', currentZone: 'BULK_STORAGE_A', maxWeightKg: 1000, currentWeightKg: 750, weightUtilizationPct: 75, maxCartons: 48, currentCartons: 36, productCount: 3, cartonCount: 36, status: 'LOADED' },
  { id: 'plt-002', palletBarcode: 'PAL-2026-0002', qrCode: 'QR-PAL-2026-0002', palletType: 'EURO', warehouseName: 'Raw Material Warehouse', currentLocation: 'RECV-STG-01', currentZone: 'RECEIVING', maxWeightKg: 1200, currentWeightKg: 950, weightUtilizationPct: 79, maxCartons: 48, currentCartons: 40, productCount: 2, cartonCount: 40, status: 'LOADED' },
  { id: 'plt-003', palletBarcode: 'PAL-2026-0003', qrCode: 'QR-PAL-2026-0003', palletType: 'CHEP', warehouseName: 'Cold Storage Warehouse', currentLocation: 'B-CS-02-08', currentZone: 'CHILLED_ZONE_B', maxWeightKg: 1100, currentWeightKg: 880, weightUtilizationPct: 80, maxCartons: 40, currentCartons: 32, productCount: 2, cartonCount: 32, status: 'STORED' },
  { id: 'plt-004', palletBarcode: 'PAL-2026-0004', qrCode: 'QR-PAL-2026-0004', palletType: 'STANDARD', warehouseName: 'Finished Goods Warehouse', currentLocation: 'PALLET_POOL_01', currentZone: 'POOL', maxWeightKg: 1000, currentWeightKg: 0, weightUtilizationPct: 0, maxCartons: 48, currentCartons: 0, productCount: 0, cartonCount: 0, status: 'EMPTY' },
]

const FORKLIFT_TASKS_DATA = [
  { id: 'ft-001', taskNumber: 'FT-2026-0001', type: 'PUTAWAY', status: 'IN_PROGRESS', priority: 'HIGH', assignedOperatorName: 'Rajesh Kumar', forkliftCode: 'FL-01', forkliftType: 'COUNTERBALANCE', putawayTaskNumber: 'PT-2026-0001', fromLocation: 'RECV-STG-01', toLocation: 'A-05-03-12', fromZone: 'RECEIVING', toZone: 'BULK_STORAGE_A', palletBarcode: 'PAL-2026-0001', travelDistanceM: 85, estTravelTimeMin: 4, actualTravelTimeMin: 5, durationMin: 28 },
  { id: 'ft-002', taskNumber: 'FT-2026-0002', type: 'TRANSFER', status: 'COMPLETED', priority: 'NORMAL', assignedOperatorName: 'Sunil Yadav', forkliftCode: 'FL-02', forkliftType: 'REACH_TRUCK', putawayTaskNumber: 'PT-2026-0002', fromLocation: 'RECV-STG-02', toLocation: 'D-01-STG-01', fromZone: 'RECEIVING', toZone: 'DISPATCH_STAGING_D01', palletBarcode: 'PAL-2026-0004', travelDistanceM: 45, estTravelTimeMin: 2, actualTravelTimeMin: 2, durationMin: 35 },
  { id: 'ft-003', taskNumber: 'FT-2026-0003', type: 'PUTAWAY', status: 'ASSIGNED', priority: 'NORMAL', assignedOperatorName: 'Deepak Sharma', forkliftCode: 'FL-03', forkliftType: 'COUNTERBALANCE', putawayTaskNumber: 'PT-2026-0003', fromLocation: 'RECV-STG-02', toLocation: 'C-08-04-22', fromZone: 'RECEIVING', toZone: 'HIGH_RACK_C', palletBarcode: 'PAL-2026-0002', travelDistanceM: 120, estTravelTimeMin: 6, actualTravelTimeMin: null, durationMin: null },
  { id: 'ft-004', taskNumber: 'FT-2026-0004', type: 'PICKING', status: 'IN_PROGRESS', priority: 'EMERGENCY', assignedOperatorName: 'Imran Sheikh', forkliftCode: 'FL-04', forkliftType: 'ORDER_PICKER', putawayTaskNumber: null, fromLocation: 'B-CS-02-08', toLocation: 'PICK_FACE_A', fromZone: 'CHILLED_ZONE_B', toZone: 'PICK_FACE_A', palletBarcode: 'PAL-2026-0003', travelDistanceM: 65, estTravelTimeMin: 3, actualTravelTimeMin: 4, durationMin: 18 },
  { id: 'ft-005', taskNumber: 'FT-2026-0005', type: 'TRANSFER', status: 'COMPLETED', priority: 'HIGH', assignedOperatorName: 'Rajesh Kumar', forkliftCode: 'FL-01', forkliftType: 'COUNTERBALANCE', putawayTaskNumber: 'PT-2026-0004', fromLocation: 'RECV-CHILL-01', toLocation: 'B-CS-02-08', fromZone: 'RECEIVING', toZone: 'CHILLED_ZONE_B', palletBarcode: 'PAL-2026-0003', travelDistanceM: 95, estTravelTimeMin: 5, actualTravelTimeMin: 6, durationMin: 48 },
]
