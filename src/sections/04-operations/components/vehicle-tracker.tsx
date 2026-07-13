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

export function VehicleTrackerModule() {
  const vehicles = [
    { id: 'V1', num: 'MH12-AB-1234', type: 'CONTAINER', driver: 'Imran Sheikh', phone: '+91 98765 43210', purpose: 'INBOUND_DELIVERY', location: 'DOCK-02', status: 'UNLOADING', arrival: '08:45', expectedDep: '10:30', waitMin: 8, dock: 'DOCK-02', asn: 'ASN-2026-018', carrier: 'VRL Logistics', ownership: 'THIRD_PARTY', capacity: '24 T', pallets: 18, refrigerated: false },
    { id: 'V2', num: 'KA05-CD-5678', type: 'COLD_TRUCK', driver: 'Ravi Kumar', phone: '+91 98765 43211', purpose: 'INBOUND_DELIVERY', location: 'C-01 (Cold Hold)', status: 'IN_YARD', arrival: '09:10', expectedDep: '11:00', waitMin: 15, dock: null, asn: 'ASN-2026-019', carrier: 'Cold Chain Logistics', ownership: 'THIRD_PARTY', capacity: '8 T', pallets: 10, refrigerated: true, temp: '4°C' },
    { id: 'V3', num: 'DL01-EF-9012', type: 'MINI_TRUCK', driver: 'Suresh Yadav', phone: '+91 98765 43212', purpose: 'OUTBOUND_DISPATCH', location: 'DOCK-05', status: 'LOADING', arrival: '08:30', expectedDep: '10:45', waitMin: 22, dock: 'DOCK-05', asn: null, dispatch: 'DSP-2026-008', carrier: 'Blue Dart', ownership: 'COURIER', capacity: '3 T', pallets: 6, refrigerated: false },
    { id: 'V4', num: 'TN09-GH-3456', type: 'TRAILER', driver: 'Anand Pillai', phone: '+91 98765 43213', purpose: 'OUTBOUND_DISPATCH', location: 'W-02 (Waiting)', status: 'WAITING', arrival: '08:50', expectedDep: '11:30', waitMin: 35, dock: null, asn: null, dispatch: 'DSP-2026-009', carrier: 'In-House', ownership: 'OWN_FLEET', capacity: '20 T', pallets: 24, refrigerated: false },
    { id: 'V5', num: 'MH04-IJ-7890', type: 'BULK_TRUCK', driver: 'Vijay More', phone: '+91 98765 43214', purpose: 'INBOUND_DELIVERY', location: 'W-03 (Waiting)', status: 'WAITING', arrival: '09:00', expectedDep: '11:45', waitMin: 42, dock: null, asn: 'ASN-2026-020', carrier: 'In-House', ownership: 'OWN_FLEET', capacity: '15 T', pallets: 0, refrigerated: false },
    { id: 'V6', num: 'GJ01-KL-1234', type: 'SMALL_VAN', driver: 'Prakash Patel', phone: '+91 98765 43215', purpose: 'PICKUP', location: 'W-04 (Waiting)', status: 'WAITING', arrival: '09:15', expectedDep: '10:30', waitMin: 5, dock: null, asn: null, dispatch: null, carrier: '—', ownership: 'THIRD_PARTY', capacity: '1 T', pallets: 2, refrigerated: false },
    { id: 'V7', num: 'MH12-MN-5678', type: 'COURIER_VEHICLE', driver: 'Deepak Jha', phone: '+91 98765 43216', purpose: 'OUTBOUND_DISPATCH', location: 'H-01 (Holding)', status: 'IN_YARD', arrival: '08:40', expectedDep: '10:15', waitMin: 18, dock: null, asn: null, dispatch: 'DSP-2026-010', carrier: 'Delhivery', ownership: 'COURIER', capacity: '2 T', pallets: 4, refrigerated: false },
    { id: 'V8', num: 'KA03-OP-9012', type: 'MILK_TANKER', driver: 'Mohan Das', phone: '+91 98765 43217', purpose: 'INBOUND_DELIVERY', location: 'S-01 (Staging)', status: 'READY', arrival: '09:05', expectedDep: '10:30', waitMin: 2, dock: null, asn: 'ASN-2026-021', carrier: 'In-House', ownership: 'OWN_FLEET', capacity: '12 T', pallets: 0, refrigerated: true, temp: '2°C' },
  ]

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Vehicle Tracker</h2><p className="text-sm text-muted-foreground mt-1">Real-time vehicle location · driver info · capacity · temperature · dock status</p></div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Vehicles', value: vehicles.length, color: 'text-blue-600' },
          { label: 'Loading', value: vehicles.filter(v => v.status === 'LOADING').length, color: 'text-amber-600' },
          { label: 'Unloading', value: vehicles.filter(v => v.status === 'UNLOADING').length, color: 'text-purple-600' },
          { label: 'Waiting', value: vehicles.filter(v => v.status === 'WAITING').length, color: 'text-orange-600' },
          { label: 'Ready', value: vehicles.filter(v => v.status === 'READY').length, color: 'text-emerald-600' },
          { label: 'Cold Chain', value: vehicles.filter(v => v.refrigerated).length, color: 'text-cyan-600' },
        ].map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">New yard/ module (VehicleTracker)</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(v => {
          const b = s28BadgeForStatus(v.status)
          const purposeColors: Record<string, string> = { INBOUND_DELIVERY: 'bg-emerald-100 text-emerald-700', OUTBOUND_DISPATCH: 'bg-amber-100 text-amber-700', PICKUP: 'bg-blue-100 text-blue-700', RETURN: 'bg-rose-100 text-rose-700', TRANSFER: 'bg-purple-100 text-purple-700', SERVICE: 'bg-slate-100 text-slate-700' }
          return (
            <Card key={v.id} className={`p-4 ${v.refrigerated ? 'border-cyan-300 bg-cyan-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${v.refrigerated ? 'bg-cyan-100' : 'bg-muted'}`}><Truck className={`h-5 w-5 ${v.refrigerated ? 'text-cyan-700' : 'text-slate-700'}`} /></div>
                  <div>
                    <div className="font-mono font-semibold text-sm">{v.num}</div>
                    <div className="text-[10px] text-muted-foreground">{v.type.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded ${b.cls}`}>{b.label}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Driver:</span><span>{v.driver}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span className="font-mono">{v.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Purpose:</span><span className={`text-[10px] px-1.5 py-0.5 rounded ${purposeColors[v.purpose]}`}>{v.purpose.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Location:</span><span className="font-mono text-blue-700">{v.location}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Arrival:</span><span className="font-mono">{v.arrival}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Exp. Departure:</span><span className="font-mono">{v.expectedDep}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Waiting:</span><span className={`font-mono ${v.waitMin > 30 ? 'text-rose-600 font-bold' : v.waitMin > 15 ? 'text-amber-600' : 'text-emerald-600'}`}>{v.waitMin}m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Capacity:</span><span className="font-mono">{v.capacity} · {v.pallets} pallets</span></div>
                {v.refrigerated && v.temp && <div className="flex justify-between"><span className="text-muted-foreground">Temp:</span><span className="font-mono text-cyan-700">{v.temp}</span></div>}
                {v.carrier && <div className="flex justify-between"><span className="text-muted-foreground">Carrier:</span><span>{v.carrier}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Ownership:</span><span className="text-[10px]">{v.ownership.replace(/_/g, ' ')}</span></div>
                {v.asn && <div className="flex justify-between"><span className="text-muted-foreground">ASN:</span><span className="font-mono text-blue-700">{v.asn}</span></div>}
                {v.dispatch && <div className="flex justify-between"><span className="text-muted-foreground">Dispatch:</span><span className="font-mono text-blue-700">{v.dispatch}</span></div>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Epic 6: Gate Console Module ────────────────────────
