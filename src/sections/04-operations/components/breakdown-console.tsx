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

export function BreakdownConsoleModule() {
  const breakdowns = [
    { id: 'BD1', num: 'BD-2026-018', equipment: 'FL-004', type: 'FORKLIFT', category: 'HYDRAULIC', severity: 'CRITICAL', desc: 'Hydraulic pressure loss during loading at DOCK-04', reportedBy: 'Suresh M.', reportedAt: '10:05', technician: 'Suresh Tech', status: 'IN_PROGRESS', diagnosis: 'Hydraulic pump failure', repair: 'Replacing pump + seal kit', parts: ['Hydraulic pump', 'Seal kit'], cost: 18500, downtime: 95, photos: 3 },
    { id: 'BD2', num: 'BD-2026-017', equipment: 'SC-006', type: 'SCANNER', category: 'PHYSICAL_DAMAGE', severity: 'MEDIUM', desc: 'Scanner trigger button broken — dropped on concrete floor', reportedBy: 'Mahesh R.', reportedAt: '09:30', technician: 'Suresh Tech', status: 'ASSIGNED', diagnosis: null, repair: null, parts: [], cost: null, downtime: 45, photos: 2 },
    { id: 'BD3', num: 'BD-2026-016', equipment: 'FL-002', type: 'FORKLIFT', category: 'ELECTRICAL', severity: 'HIGH', desc: 'Battery not holding charge — drops from 100% to 20% in 2 hours', reportedBy: 'Suresh M.', reportedAt: '08:15', technician: 'Ramesh Tech', status: 'REPAIRED', diagnosis: 'Battery cell degradation', repair: 'Replaced 4 battery cells', parts: ['4× Battery cell'], cost: 12000, downtime: 180, photos: 4 },
    { id: 'BD4', num: 'BD-2026-015', equipment: 'RT-001', type: 'REACH_TRUCK', category: 'MECHANICAL', severity: 'LOW', desc: 'Mast chain making noise during lift', reportedBy: 'Mahesh R.', reportedAt: '2026-07-07 14:30', technician: 'Ramesh Tech', status: 'RETURNED_TO_SERVICE', diagnosis: 'Chain lubrication needed', repair: 'Lubricated mast chain', parts: ['Chain lube'], cost: 500, downtime: 60, photos: 1 },
    { id: 'BD5', num: 'BD-2026-014', equipment: 'PR-001', type: 'LABEL_PRINTER', category: 'SOFTWARE', severity: 'MEDIUM', desc: 'Print labels smudged — calibration off', reportedBy: 'Lakshmi V.', reportedAt: '2026-07-06 11:00', technician: 'Anil Tech', status: 'TESTED', diagnosis: 'Print head alignment', repair: 'Calibrated print head', parts: [], cost: 0, downtime: 30, photos: 0 },
    { id: 'BD6', num: 'BD-2026-013', equipment: 'ST-001', type: 'STACKER', category: 'BATTERY', severity: 'HIGH', desc: 'Battery not charging — charger port loose', reportedBy: 'Anita S.', reportedAt: '2026-07-05 09:00', technician: 'Ramesh Tech', status: 'RETURNED_TO_SERVICE', diagnosis: 'Loose charging port', repair: 'Re-soldered charging port', parts: ['Charging port'], cost: 800, downtime: 240, photos: 2 },
  ]

  const stats = [
    { label: 'Open Breakdowns', value: breakdowns.filter(b => b.status === 'OPEN' || b.status === 'ASSIGNED' || b.status === 'IN_PROGRESS').length, color: 'text-rose-600' },
    { label: 'In Progress', value: breakdowns.filter(b => b.status === 'IN_PROGRESS').length, color: 'text-amber-600' },
    { label: 'Repaired', value: breakdowns.filter(b => b.status === 'REPAIRED' || b.status === 'TESTED' || b.status === 'RETURNED_TO_SERVICE').length, color: 'text-emerald-600' },
    { label: 'Critical', value: breakdowns.filter(b => b.severity === 'CRITICAL').length, color: 'text-red-600' },
    { label: 'Total Downtime (h)', value: (breakdowns.reduce((a, b) => a + b.downtime, 0) / 60).toFixed(1), color: 'text-orange-600' },
    { label: 'Repair Cost (₹)', value: breakdowns.reduce((a, b) => a + (b.cost || 0), 0).toLocaleString('en-IN'), color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Breakdown Console</h2><p className="text-sm text-muted-foreground mt-1">Report · diagnose · repair · test · return to service · downtime tracking</p></div>
        <Button size="sm" variant="destructive"><AlertOctagon className="mr-2 h-4 w-4" />Report Breakdown</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <Card className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300">
        <h3 className="font-semibold mb-3 text-sm">Breakdown Resolution Workflow</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {['Breakdown', 'Report', 'Assign Technician', 'Repair', 'Test', 'Return To Service'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-white border rounded-md font-medium">{step}</div>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-rose-600" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {breakdowns.map(b => {
          const sb = s28BadgeForStatus(b.status)
          const sevColor = b.severity === 'CRITICAL' ? 'border-rose-400 bg-rose-50/50' : b.severity === 'HIGH' ? 'border-orange-300 bg-orange-50/30' : b.severity === 'MEDIUM' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
          const sevBadge = b.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : b.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : b.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
          const catColors: Record<string, string> = { MECHANICAL: 'bg-amber-100 text-amber-700', ELECTRICAL: 'bg-yellow-100 text-yellow-700', HYDRAULIC: 'bg-blue-100 text-blue-700', BATTERY: 'bg-purple-100 text-purple-700', SOFTWARE: 'bg-cyan-100 text-cyan-700', PHYSICAL_DAMAGE: 'bg-rose-100 text-rose-700' }
          return (
            <Card key={b.id} className={`p-4 ${sevColor}`}>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0"><AlertTriangle className="h-4 w-4 text-rose-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-semibold text-blue-700">{b.num}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColors[b.category] || 'bg-slate-100'}`}>{b.category.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sevBadge}`}>{b.severity}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Equipment: {b.equipment} ({b.type})</span>
                  </div>
                  <p className="text-sm font-medium">{b.desc}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>Reported: {b.reportedAt} by {b.reportedBy}</span>
                    <span>·</span>
                    <span>Technician: {b.technician || '—'}</span>
                    {b.diagnosis && <><span>·</span><span>Diagnosis: {b.diagnosis}</span></>}
                    {b.repair && <><span>·</span><span>Repair: {b.repair}</span></>}
                    {b.parts.length > 0 && <><span>·</span><span>Parts: {b.parts.join(', ')}</span></>}
                    {b.cost !== null && <><span>·</span><span>Cost: ₹{b.cost.toLocaleString('en-IN')}</span></>}
                    <span>·</span>
                    <span className={b.downtime > 120 ? 'text-rose-600 font-bold' : b.downtime > 60 ? 'text-amber-600' : ''}>Downtime: {b.downtime}m</span>
                    {b.photos > 0 && <><span>·</span><span>📷 {b.photos} photos</span></>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${sb.cls}`}>{sb.label}</span>
                  {(b.status === 'OPEN' || b.status === 'ASSIGNED' || b.status === 'IN_PROGRESS') && (
                    <Button size="sm" variant="default" className="h-7 text-xs">Update Status</Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Epic 7: Certification Center Module ────────────────
