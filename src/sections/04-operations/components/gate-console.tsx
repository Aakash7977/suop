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

export function GateConsoleModule() {
  const [showCheckIn, setShowCheckIn] = useState(false)
  const entries = [
    { id: 'GE1', num: 'GE-2026-018', pass: 'GP-2026-018', vehicle: 'MH12-AB-1234', type: 'CONTAINER', driver: 'Imran Sheikh', purpose: 'INBOUND_DELIVERY', gate: 'GATE-01', officer: 'Mahesh Tiwari', entryTime: '08:45', expectedExit: '10:30', docs: true, inspect: true, seal: true, status: 'AT_DOCK', photoFront: true, photoSeal: true },
    { id: 'GE2', num: 'GE-2026-019', pass: 'GP-2026-019', vehicle: 'KA05-CD-5678', type: 'COLD_TRUCK', driver: 'Ravi Kumar', purpose: 'INBOUND_DELIVERY', gate: 'GATE-01', officer: 'Mahesh Tiwari', entryTime: '09:10', expectedExit: '11:00', docs: true, inspect: true, seal: false, status: 'IN_YARD', photoFront: true, photoSeal: false },
    { id: 'GE3', num: 'GE-2026-020', pass: 'GP-2026-020', vehicle: 'DL01-EF-9012', type: 'MINI_TRUCK', driver: 'Suresh Yadav', purpose: 'OUTBOUND_DISPATCH', gate: 'GATE-02', officer: 'Suresh Pillai', entryTime: '08:30', expectedExit: '10:45', docs: true, inspect: false, seal: true, status: 'AT_DOCK', photoFront: true, photoSeal: true },
    { id: 'GE4', num: 'GE-2026-021', pass: 'GP-2026-021', vehicle: 'TN09-GH-3456', type: 'TRAILER', driver: 'Anand Pillai', purpose: 'OUTBOUND_DISPATCH', gate: 'GATE-02', officer: 'Suresh Pillai', entryTime: '08:50', expectedExit: '11:30', docs: true, inspect: true, seal: true, status: 'IN_YARD', photoFront: true, photoSeal: true },
    { id: 'GE5', num: 'GE-2026-022', pass: 'GP-2026-022', vehicle: 'MH04-IJ-7890', type: 'BULK_TRUCK', driver: 'Vijay More', purpose: 'INBOUND_DELIVERY', gate: 'GATE-01', officer: 'Mahesh Tiwari', entryTime: '09:00', expectedExit: '11:45', docs: true, inspect: false, seal: false, status: 'IN_YARD', photoFront: true, photoSeal: false },
    { id: 'GE6', num: 'GE-2026-023', pass: 'GP-2026-023', vehicle: 'GJ01-KL-1234', type: 'SMALL_VAN', driver: 'Prakash Patel', purpose: 'PICKUP', gate: 'GATE-02', officer: 'Suresh Pillai', entryTime: '09:15', expectedExit: '10:30', docs: true, inspect: true, seal: false, status: 'IN_YARD', photoFront: true, photoSeal: false },
  ]

  const exits = [
    { id: 'GX1', num: 'GX-2026-008', entry: 'GE-2026-015', pass: 'GP-2026-015', vehicle: 'MH12-EXIT-01', driver: 'Imran Khan', gate: 'GATE-01', officer: 'Mahesh Tiwari', exitTime: '08:30', yardMin: 95, docs: true, seal: true, inspect: true, status: 'EXITED' },
    { id: 'GX2', num: 'GX-2026-007', entry: 'GE-2026-014', pass: 'GP-2026-014', vehicle: 'KA05-EXIT-02', driver: 'Vijay Kumar', gate: 'GATE-02', officer: 'Suresh Pillai', exitTime: '07:45', yardMin: 68, docs: true, seal: true, inspect: false, status: 'EXITED' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Gate Console</h2><p className="text-sm text-muted-foreground mt-1">Vehicle check-in / check-out · gate pass · seal verification · photo evidence</p></div>
        <Button size="sm" onClick={() => setShowCheckIn(!showCheckIn)}><Plus className="mr-2 h-4 w-4" />New Check-In</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Entered Today', value: entries.length, color: 'text-emerald-600' },
          { label: 'In Yard', value: entries.filter(e => e.status === 'IN_YARD').length, color: 'text-amber-600' },
          { label: 'At Dock', value: entries.filter(e => e.status === 'AT_DOCK').length, color: 'text-blue-600' },
          { label: 'Exited Today', value: exits.length, color: 'text-slate-600' },
          { label: 'Seal Verified', value: entries.filter(e => e.seal).length, color: 'text-purple-600' },
          { label: 'Photo Evidence', value: entries.filter(e => e.photoFront).length, color: 'text-cyan-600' },
        ].map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      {showCheckIn && (
        <Card className="p-4 border-emerald-300 bg-emerald-50/50">
          <h3 className="font-semibold mb-3">New Vehicle Check-In</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div><Label className="text-xs">Vehicle Number</Label><Input className="mt-1" placeholder="MH12-AB-XXXX" /></div>
            <div><Label className="text-xs">Vehicle Type</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>SMALL_VAN</option><option>MINI_TRUCK</option><option>CONTAINER</option><option>TRAILER</option><option>COLD_TRUCK</option><option>BULK_TRUCK</option></select></div>
            <div><Label className="text-xs">Driver Name</Label><Input className="mt-1" placeholder="Full name" /></div>
            <div><Label className="text-xs">Driver Phone</Label><Input className="mt-1" placeholder="+91 XXXXX XXXXX" /></div>
            <div><Label className="text-xs">Purpose</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>INBOUND_DELIVERY</option><option>OUTBOUND_DISPATCH</option><option>PICKUP</option><option>RETURN</option><option>TRANSFER</option><option>SERVICE</option></select></div>
            <div><Label className="text-xs">ASN / Dispatch #</Label><Input className="mt-1" placeholder="ASN-2026-XXX" /></div>
            <div><Label className="text-xs">Gate</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>GATE-01</option><option>GATE-02</option></select></div>
            <div><Label className="text-xs">Pass Type</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>QR</option><option>BARCODE</option><option>RFID</option></select></div>
            <div className="md:col-span-4 flex gap-2"><Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Generate Pass &amp; Check-In</Button><Button size="sm" variant="outline" onClick={() => setShowCheckIn(false)}>Cancel</Button></div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Active Gate Entries (Check-In)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Entry #</th><th className="text-left px-4 py-3 font-medium">Gate Pass</th>
              <th className="text-left px-4 py-3 font-medium">Vehicle</th><th className="text-left px-4 py-3 font-medium">Driver</th>
              <th className="text-left px-4 py-3 font-medium">Purpose</th><th className="text-left px-4 py-3 font-medium">Gate</th>
              <th className="text-left px-4 py-3 font-medium">Officer</th><th className="text-left px-4 py-3 font-medium">Entry</th>
              <th className="text-left px-4 py-3 font-medium">Exp. Exit</th><th className="text-left px-4 py-3 font-medium">Verifications</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {entries.map(e => {
                const b = s28BadgeForStatus(e.status)
                return (
                  <tr key={e.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{e.num}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1"><QrCode className="h-3 w-3 text-purple-600" /><span className="font-mono text-xs">{e.pass}</span></div></td>
                    <td className="px-4 py-3"><div className="font-mono text-xs font-medium">{e.vehicle}</div><div className="text-[10px] text-muted-foreground">{e.type.replace(/_/g, ' ')}</div></td>
                    <td className="px-4 py-3 text-xs">{e.driver}</td>
                    <td className="px-4 py-3 text-[10px] font-mono">{e.purpose.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.gate}</td>
                    <td className="px-4 py-3 text-xs">{e.officer}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.entryTime}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.expectedExit}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${e.docs ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Documents">D</span>
                      <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${e.inspect ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Inspected">I</span>
                      <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${e.seal ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Seal">S</span>
                      <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${e.photoFront ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Photo">P</span>
                    </div></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Recent Exits (Check-Out)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Exit #</th><th className="text-left px-4 py-3 font-medium">Vehicle</th>
              <th className="text-left px-4 py-3 font-medium">Driver</th><th className="text-left px-4 py-3 font-medium">Gate</th>
              <th className="text-left px-4 py-3 font-medium">Officer</th><th className="text-left px-4 py-3 font-medium">Exit Time</th>
              <th className="text-left px-4 py-3 font-medium">Yard Time</th><th className="text-left px-4 py-3 font-medium">Verifications</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {exits.map(x => (
                <tr key={x.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{x.num}</td>
                  <td className="px-4 py-3 font-mono text-xs">{x.vehicle}</td>
                  <td className="px-4 py-3 text-xs">{x.driver}</td>
                  <td className="px-4 py-3 font-mono text-xs">{x.gate}</td>
                  <td className="px-4 py-3 text-xs">{x.officer}</td>
                  <td className="px-4 py-3 font-mono text-xs">{x.exitTime}</td>
                  <td className="px-4 py-3 font-mono text-xs"><span className={x.yardMin > 90 ? 'text-amber-600 font-bold' : 'text-emerald-600'}>{x.yardMin}m</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${x.docs ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Documents">D</span>
                    <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${x.inspect ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Inspected">I</span>
                    <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] ${x.seal ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`} title="Seal">S</span>
                  </div></td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">Exited</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 7: Yard Control Tower Module ──────────────────
