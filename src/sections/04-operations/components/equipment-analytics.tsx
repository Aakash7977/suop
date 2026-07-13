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

export function EquipmentAnalyticsModule() {
  const kpis = [
    { label: 'Equipment Utilization', value: '74%', target: '80%', trend: '+3%', color: 'text-emerald-600' },
    { label: 'MTBF (hours)', value: '342h', target: '400h', trend: '+12h', color: 'text-emerald-600' },
    { label: 'MTTR (hours)', value: '2.8h', target: '2.0h', trend: '+0.3h', color: 'text-amber-600' },
    { label: 'Battery Health Avg', value: '86%', target: '90%', trend: '+1%', color: 'text-emerald-600' },
    { label: 'Maintenance Compliance', value: '92%', target: '95%', trend: '+2%', color: 'text-emerald-600' },
    { label: 'Equipment Availability', value: '88%', target: '92%', trend: '+1%', color: 'text-emerald-600' },
  ]

  const equipmentUtil = [
    { code: 'FL-001', util: 87, downtime: 4, tasks: 342 },
    { code: 'FL-002', util: 79, downtime: 8, tasks: 287 },
    { code: 'FL-003', util: 32, downtime: 0, tasks: 124 },
    { code: 'RT-001', util: 91, downtime: 12, tasks: 412 },
    { code: 'ST-001', util: 68, downtime: 6, tasks: 198 },
    { code: 'SC-001', util: 84, downtime: 2, tasks: 12453 },
    { code: 'SC-002', util: 22, downtime: 0, tasks: 5421 },
    { code: 'OP-001', util: 71, downtime: 4, tasks: 218 },
  ]

  const maintenanceTrend = [
    { month: 'Jan', planned: 12, completed: 11, cost: 38500 },
    { month: 'Feb', planned: 14, completed: 13, cost: 42800 },
    { month: 'Mar', planned: 11, completed: 11, cost: 31200 },
    { month: 'Apr', planned: 16, completed: 14, cost: 52400 },
    { month: 'May', planned: 13, completed: 12, cost: 41500 },
    { month: 'Jun', planned: 18, completed: 17, cost: 68200 },
    { month: 'Jul', planned: 15, completed: 9, cost: 45800 },
  ]
  const maxPlanned = Math.max(...maintenanceTrend.map(m => m.planned))

  const operatorUsage = [
    { op: 'Rajesh K. (OP-001)', equipUsed: 4, hoursToday: 6.5, hoursWeek: 38, tasksToday: 14, certifications: 5 },
    { op: 'Suresh M. (OP-003)', equipUsed: 3, hoursToday: 7.2, hoursWeek: 42, tasksToday: 18, certifications: 4 },
    { op: 'Anita S. (OP-002)', equipUsed: 3, hoursToday: 5.8, hoursWeek: 35, tasksToday: 11, certifications: 3 },
    { op: 'Mahesh R. (OP-006)', equipUsed: 2, hoursToday: 4.5, hoursWeek: 28, tasksToday: 6, certifications: 2 },
    { op: 'Ramesh P. (OP-005)', equipUsed: 0, hoursToday: 0, hoursWeek: 32, tasksToday: 0, certifications: 3 },
  ]

  const replacementForecast = [
    { equipment: 'FL-004 (Toyota 8FBE15)', reason: 'Hydraulic failure — beyond economic repair', estCost: 950000, recommended: '2026-07-30', urgency: 'CRITICAL' },
    { equipment: 'BAT-RT-001 (RT-001 Battery)', reason: '1240/1500 cycles — health 65%', estCost: 85000, recommended: '2026-09-15', urgency: 'HIGH' },
    { equipment: 'SC-006 (Honeywell VW-320)', reason: 'Trigger broken — obsolete model', estCost: 28000, recommended: '2026-08-01', urgency: 'MEDIUM' },
    { equipment: 'ST-001 (Godrej GSX-10)', reason: '734 hours — nearing end of life', estCost: 380000, recommended: '2026-12-15', urgency: 'LOW' },
  ]

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Equipment Analytics</h2><p className="text-sm text-muted-foreground mt-1">Utilization · MTBF · MTTR · maintenance cost · operator usage · replacement forecast</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</p>
            <p className="text-xl font-bold mt-1">{k.value}</p>
            <div className="flex items-center justify-between mt-1"><span className={`text-[10px] ${k.color}`}>{k.trend}</span><span className="text-[10px] text-muted-foreground">Target: {k.target}</span></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Equipment Utilization (Today)</h3>
          <div className="space-y-2">
            {equipmentUtil.map(e => (
              <div key={e.code} className="flex items-center gap-3">
                <div className="w-16 font-mono text-xs font-semibold">{e.code}</div>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden relative"><div className={`h-full ${e.util > 80 ? 'bg-emerald-500' : e.util > 60 ? 'bg-amber-500' : e.util > 30 ? 'bg-orange-500' : 'bg-slate-400'}`} style={{ width: `${e.util}%` }} /></div>
                <div className="w-10 text-xs font-mono text-right">{e.util}%</div>
                <div className="w-20 text-[10px] text-muted-foreground text-right">{e.downtime}h down</div>
                <div className="w-16 text-[10px] text-muted-foreground text-right">{e.tasks} tasks</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Maintenance Trend (6 months)</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {maintenanceTrend.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-mono text-muted-foreground">₹{(m.cost / 1000).toFixed(0)}k</div>
                <div className="w-full bg-muted/40 rounded-t-md overflow-hidden flex-1 flex items-end relative">
                  <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 absolute bottom-0" style={{ height: `${(m.planned / maxPlanned) * 100}%` }} />
                  <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 absolute bottom-0" style={{ height: `${(m.completed / maxPlanned) * 100}%` }} />
                </div>
                <div className="text-xs">{m.month}</div>
                <div className="text-[10px] text-muted-foreground">{m.completed}/{m.planned}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-500 rounded" />Planned</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded" />Completed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-600 rounded" />Cost (₹k)</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Operator Equipment Usage</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr>
                <th className="text-left px-4 py-2 font-medium">Operator</th><th className="text-left px-4 py-2 font-medium">Equip Used</th>
                <th className="text-left px-4 py-2 font-medium">Today</th><th className="text-left px-4 py-2 font-medium">Week</th>
                <th className="text-left px-4 py-2 font-medium">Tasks</th><th className="text-left px-4 py-2 font-medium">Certs</th>
              </tr></thead>
              <tbody>
                {operatorUsage.map(o => (
                  <tr key={o.op} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs font-medium">{o.op}</td>
                    <td className="px-4 py-2 font-mono text-xs">{o.equipUsed}</td>
                    <td className="px-4 py-2 font-mono text-xs">{o.hoursToday}h</td>
                    <td className="px-4 py-2 font-mono text-xs">{o.hoursWeek}h</td>
                    <td className="px-4 py-2 font-mono text-xs">{o.tasksToday}</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{o.certifications}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Replacement Forecast</h3></div>
          <div className="p-3 space-y-2">
            {replacementForecast.map((r, i) => {
              const urgencyColors: Record<string, string> = { CRITICAL: 'border-rose-400 bg-rose-50', HIGH: 'border-orange-300 bg-orange-50', MEDIUM: 'border-amber-200 bg-amber-50', LOW: 'border-slate-200 bg-slate-50' }
              const urgencyBadge: Record<string, string> = { CRITICAL: 'bg-rose-100 text-rose-700', HIGH: 'bg-orange-100 text-orange-700', MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-slate-100 text-slate-700' }
              return (
                <div key={i} className={`p-3 rounded border ${urgencyColors[r.urgency]}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-mono text-xs font-semibold">{r.equipment}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${urgencyBadge[r.urgency]}`}>{r.urgency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.reason}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span>Est. Cost: <span className="font-mono font-bold text-purple-700">₹{r.estCost.toLocaleString('en-IN')}</span></span>
                    <span>Recommended: <span className="font-mono">{r.recommended}</span></span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white"><Brain className="h-5 w-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">AI-Ready Equipment Optimization Insights</h3>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>FL-003</strong> has 32% utilization — consider reassigning to higher-traffic zone or renting out.</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>MTTR 2.8h</strong> exceeds 2.0h target — recommend stocking critical parts (hydraulic pumps, battery cells) on-site.</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>July maintenance completion</strong> at 60% (9/15) — backlog building. Add 1 technician for 2 weeks.</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>Battery replacement</strong> for BAT-RT-001 should be scheduled before Sept 10 to prevent mid-shift failure.</span></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
