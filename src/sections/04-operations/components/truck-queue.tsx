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

export function TruckQueueModule() {
  const queue = [
    { id: 'Q1', num: 'Q-2026-018', pos: 1, vehicle: 'MH12-AB-1234', type: 'CONTAINER', driver: 'Imran Sheikh', purpose: 'INBOUND_DELIVERY', queueType: 'PRIORITY', priority: 85, waitMin: 8, estDock: '10:45', status: 'ASSIGNED', dock: 'DOCK-02', delay: null },
    { id: 'Q2', num: 'Q-2026-019', pos: 2, vehicle: 'KA05-CD-5678', type: 'COLD_TRUCK', driver: 'Ravi Kumar', purpose: 'INBOUND_DELIVERY', queueType: 'COLD_CHAIN', priority: 90, waitMin: 15, estDock: '10:55', status: 'WAITING', dock: null, delay: null },
    { id: 'Q3', num: 'Q-2026-020', pos: 3, vehicle: 'DL01-EF-9012', type: 'MINI_TRUCK', driver: 'Suresh Yadav', purpose: 'OUTBOUND_DISPATCH', queueType: 'FIFO', priority: 50, waitMin: 22, estDock: '11:10', status: 'WAITING', dock: null, delay: null },
    { id: 'Q4', num: 'Q-2026-021', pos: 4, vehicle: 'TN09-GH-3456', type: 'TRAILER', driver: 'Anand Pillai', purpose: 'OUTBOUND_DISPATCH', queueType: 'FIFO', priority: 50, waitMin: 35, estDock: '11:25', status: 'WAITING', dock: null, delay: 'Dock occupied' },
    { id: 'Q5', num: 'Q-2026-022', pos: 5, vehicle: 'MH04-IJ-7890', type: 'BULK_TRUCK', driver: 'Vijay More', purpose: 'INBOUND_DELIVERY', queueType: 'FIFO', priority: 50, waitMin: 42, estDock: '11:40', status: 'WAITING', dock: null, delay: null },
    { id: 'Q6', num: 'Q-2026-023', pos: 6, vehicle: 'GJ01-KL-1234', type: 'SMALL_VAN', driver: 'Prakash Patel', purpose: 'PICKUP', queueType: 'PRIORITY', priority: 75, waitMin: 5, estDock: '10:50', status: 'PRIORITY_BOOSTED', dock: null, delay: null },
    { id: 'Q7', num: 'Q-2026-024', pos: 7, vehicle: 'MH12-MN-5678', type: 'COURIER_VEHICLE', driver: 'Deepak Jha', purpose: 'OUTBOUND_DISPATCH', queueType: 'FIFO', priority: 50, waitMin: 18, estDock: '11:05', status: 'WAITING', dock: null, delay: null },
    { id: 'Q8', num: 'Q-2026-025', pos: 8, vehicle: 'KA03-OP-9012', type: 'MILK_TANKER', driver: 'Mohan Das', purpose: 'INBOUND_DELIVERY', queueType: 'EMERGENCY', priority: 100, waitMin: 2, estDock: '10:40', status: 'PRIORITY_BOOSTED', dock: null, delay: null },
  ]

  const queueTypeColors: Record<string, string> = { FIFO: 'bg-slate-100 text-slate-700', PRIORITY: 'bg-orange-100 text-orange-700', COLD_CHAIN: 'bg-blue-100 text-blue-700', EMERGENCY: 'bg-red-100 text-red-700', VIP_SUPPLIER: 'bg-purple-100 text-purple-700', MANUAL_OVERRIDE: 'bg-amber-100 text-amber-700' }

  const stats = [
    { label: 'In Queue', value: queue.length, color: 'text-blue-600' },
    { label: 'Avg Wait', value: `${Math.round(queue.reduce((a, q) => a + q.waitMin, 0) / queue.length)}m`, color: 'text-amber-600' },
    { label: 'Priority Boosted', value: queue.filter(q => q.status === 'PRIORITY_BOOSTED').length, color: 'text-orange-600' },
    { label: 'Delayed', value: queue.filter(q => q.delay).length, color: 'text-rose-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Truck Queue Management</h2><p className="text-sm text-muted-foreground mt-1">FIFO · Priority · Cold Chain · Emergency · VIP Supplier · Manual Override</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm"><Filter className="mr-1 h-4 w-4" />Filter</Button><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add to Queue</Button></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-600 flex items-center justify-center text-white"><Workflow className="h-5 w-5" /></div>
            <div><p className="font-semibold text-sm">Queue Engine Active</p><p className="text-xs text-muted-foreground">Priority rules: Emergency &gt; Cold Chain &gt; VIP &gt; Priority &gt; FIFO</p></div>
          </div>
          <Button size="sm" variant="outline">Configure Rules</Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Live Queue</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Pos</th><th className="text-left px-4 py-3 font-medium">Queue #</th>
              <th className="text-left px-4 py-3 font-medium">Vehicle</th><th className="text-left px-4 py-3 font-medium">Driver</th>
              <th className="text-left px-4 py-3 font-medium">Purpose</th><th className="text-left px-4 py-3 font-medium">Queue Type</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th><th className="text-left px-4 py-3 font-medium">Wait</th>
              <th className="text-left px-4 py-3 font-medium">Est. Dock</th><th className="text-left px-4 py-3 font-medium">Assigned Dock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th><th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {queue.map(q => {
                const b = s28BadgeForStatus(q.status)
                return (
                  <tr key={q.id} className={`border-b hover:bg-muted/30 ${q.status === 'PRIORITY_BOOSTED' ? 'bg-orange-50/50' : ''} ${q.delay ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-4 py-3"><span className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${q.pos <= 3 ? 'bg-amber-500 text-white' : 'bg-muted'}`}>{q.pos}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{q.num}</td>
                    <td className="px-4 py-3"><div className="font-mono text-xs font-medium">{q.vehicle}</div><div className="text-[10px] text-muted-foreground">{q.type.replace(/_/g, ' ')}</div></td>
                    <td className="px-4 py-3 text-xs">{q.driver}</td>
                    <td className="px-4 py-3 text-[10px] font-mono">{q.purpose.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${queueTypeColors[q.queueType]}`}>{q.queueType.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${q.priority === 100 ? 'bg-red-500' : q.priority >= 75 ? 'bg-orange-500' : q.priority >= 50 ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${q.priority}%` }} /></div><span className="text-[10px] font-mono">{q.priority}</span></div></td>
                    <td className="px-4 py-3 font-mono text-xs"><span className={q.waitMin > 30 ? 'text-rose-600 font-bold' : q.waitMin > 15 ? 'text-amber-600' : 'text-emerald-600'}>{q.waitMin}m</span></td>
                    <td className="px-4 py-3 font-mono text-xs">{q.estDock}</td>
                    <td className="px-4 py-3 font-mono text-xs">{q.dock || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                    <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">{q.status === 'WAITING' && <Button size="sm" variant="outline" className="h-7 text-xs">Assign</Button>}{q.delay && <Button size="sm" variant="destructive" className="h-7 text-xs">Resolve</Button>}<Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'FIFO Queue', desc: 'First-in, first-out — default for normal vehicles', count: queue.filter(q => q.queueType === 'FIFO').length, color: 'border-slate-300 bg-slate-50' },
          { title: 'Priority Queue', desc: 'Boosted priority for VIP customers & urgent orders', count: queue.filter(q => q.queueType === 'PRIORITY' || q.queueType === 'VIP_SUPPLIER').length, color: 'border-orange-300 bg-orange-50' },
          { title: 'Cold Chain Priority', desc: 'Refrigerated vehicles get priority to preserve cold chain', count: queue.filter(q => q.queueType === 'COLD_CHAIN').length, color: 'border-blue-300 bg-blue-50' },
        ].map(qt => (
          <Card key={qt.title} className={`p-4 ${qt.color}`}>
            <div className="flex items-center justify-between mb-1"><h4 className="font-semibold text-sm">{qt.title}</h4><Badge variant="secondary">{qt.count}</Badge></div>
            <p className="text-xs text-muted-foreground">{qt.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Epic 4: Dock Schedule Module ───────────────────────
