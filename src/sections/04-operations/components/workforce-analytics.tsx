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

export function WorkforceAnalyticsModule() {
  const operatorKPIs = [
    { rank: 1, code: 'OP-003', name: 'Suresh Mehta', tasks: 92, accuracy: 99.1, util: 94, idle: 12, travel: 38, avgDur: 3.8, rating: 88 },
    { rank: 2, code: 'OP-001', name: 'Rajesh Kumar', tasks: 78, accuracy: 98.5, util: 87, idle: 18, travel: 42, avgDur: 4.2, rating: 92 },
    { rank: 3, code: 'OP-002', name: 'Anita Sharma', tasks: 65, accuracy: 97.2, util: 82, idle: 22, travel: 48, avgDur: 4.6, rating: 85 },
    { rank: 4, code: 'OP-005', name: 'Ramesh Patel', tasks: 52, accuracy: 95.5, util: 79, idle: 28, travel: 52, avgDur: 5.1, rating: 79 },
    { rank: 5, code: 'OP-006', name: 'Mahesh Reddy', tasks: 38, accuracy: 97.8, util: 71, idle: 35, travel: 58, avgDur: 5.4, rating: 81 },
    { rank: 6, code: 'OP-004', name: 'Lakshmi V.', tasks: 41, accuracy: 96.0, util: 68, idle: 32, travel: 45, avgDur: 5.2, rating: 72 },
    { rank: 7, code: 'OP-008', name: 'Priya Nair', tasks: 18, accuracy: 92.0, util: 54, idle: 48, travel: 65, avgDur: 6.8, rating: 55 },
    { rank: 8, code: 'OP-007', name: 'Anil Kumar', tasks: 22, accuracy: 94.3, util: 0, idle: 0, travel: 0, avgDur: 0, rating: 68 },
  ]

  const dailyTrend = [
    { day: 'Mon', tasks: 312, accuracy: 97.2 }, { day: 'Tue', tasks: 345, accuracy: 96.8 },
    { day: 'Wed', tasks: 389, accuracy: 97.5 }, { day: 'Thu', tasks: 367, accuracy: 98.1 },
    { day: 'Fri', tasks: 412, accuracy: 96.5 }, { day: 'Sat', tasks: 298, accuracy: 97.8 },
    { day: 'Sun', tasks: 187, accuracy: 98.5 },
  ]
  const maxTasks = Math.max(...dailyTrend.map(d => d.tasks))

  const skillMatrix = [
    { skill: 'FORKLIFT', certified: 6, expert: 2, advanced: 3, intermediate: 1, beginner: 0 },
    { skill: 'REACH_TRUCK', certified: 4, expert: 1, advanced: 2, intermediate: 1, beginner: 0 },
    { skill: 'STACKER', certified: 5, expert: 1, advanced: 2, intermediate: 2, beginner: 0 },
    { skill: 'PICKER', certified: 8, expert: 3, advanced: 3, intermediate: 2, beginner: 0 },
    { skill: 'PACKER', certified: 7, expert: 2, advanced: 2, intermediate: 2, beginner: 1 },
    { skill: 'RECEIVER', certified: 5, expert: 1, advanced: 2, intermediate: 1, beginner: 1 },
    { skill: 'CYCLE_COUNT', certified: 4, expert: 1, advanced: 1, intermediate: 2, beginner: 0 },
    { skill: 'SCANNER', certified: 8, expert: 8, advanced: 0, intermediate: 0, beginner: 0 },
  ]

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Workforce Analytics</h2><p className="text-sm text-muted-foreground mt-1">Operator productivity · skill matrix · accuracy · utilization insights</p></div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks Completed (7d)', value: dailyTrend.reduce((a, d) => a + d.tasks, 0), icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, change: '+12%' },
          { label: 'Avg Accuracy', value: `${(dailyTrend.reduce((a, d) => a + d.accuracy, 0) / dailyTrend.length).toFixed(1)}%`, icon: <Target className="h-5 w-5 text-blue-600" />, change: '+0.3%' },
          { label: 'Avg Utilization', value: '78%', icon: <Gauge className="h-5 w-5 text-orange-600" />, change: '+5%' },
          { label: 'Idle Hours (7d)', value: '142h', icon: <Clock className="h-5 w-5 text-amber-600" />, change: '-8%' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between"><div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{s.icon}</div><span className="text-xs text-emerald-600">{s.change}</span></div>
            <p className="text-xs text-muted-foreground mt-2">{s.label}</p><p className="text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Trend Chart */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="font-semibold mb-3">Tasks Completed — Last 7 Days</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {dailyTrend.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-mono text-muted-foreground">{d.tasks}</div>
                <div className="w-full bg-muted/40 rounded-t-md overflow-hidden flex-1 flex items-end"><div className="w-full bg-gradient-to-t from-blue-600 to-blue-400" style={{ height: `${(d.tasks / maxTasks) * 100}%` }} /></div>
                <div className="text-xs">{d.day}</div>
                <div className="text-[10px] text-emerald-600">{d.accuracy}%</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-500 rounded" />Tasks</span><span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded" />Accuracy %</span></div>
        </Card>

        {/* Skill Matrix Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Skill Matrix</h3>
          <div className="space-y-2 text-xs">
            {skillMatrix.map(s => (
              <div key={s.skill} className="flex items-center gap-2">
                <div className="w-24 font-mono text-[10px]">{s.skill}</div>
                <div className="flex-1 flex h-4 rounded overflow-hidden">
                  <div className="bg-emerald-500" style={{ width: `${(s.expert / 8) * 100}%` }} title={`${s.expert} expert`} />
                  <div className="bg-blue-500" style={{ width: `${(s.advanced / 8) * 100}%` }} title={`${s.advanced} advanced`} />
                  <div className="bg-amber-500" style={{ width: `${(s.intermediate / 8) * 100}%` }} title={`${s.intermediate} intermediate`} />
                  <div className="bg-slate-300" style={{ width: `${(s.beginner / 8) * 100}%` }} title={`${s.beginner} beginner`} />
                </div>
                <div className="w-8 text-right font-mono">{s.certified}/8</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded" />Expert</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-500 rounded" />Advanced</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500 rounded" />Inter.</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-slate-300 rounded" />Beginner</span>
          </div>
        </Card>
      </div>

      {/* Operator Leaderboard */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">Operator Performance Leaderboard</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Rank</th><th className="text-left px-4 py-3 font-medium">Operator</th>
              <th className="text-left px-4 py-3 font-medium">Tasks (7d)</th><th className="text-left px-4 py-3 font-medium">Accuracy</th>
              <th className="text-left px-4 py-3 font-medium">Utilization</th><th className="text-left px-4 py-3 font-medium">Idle (min)</th>
              <th className="text-left px-4 py-3 font-medium">Travel (min)</th><th className="text-left px-4 py-3 font-medium">Avg Dur</th>
              <th className="text-left px-4 py-3 font-medium">Rating</th>
            </tr></thead>
            <tbody>
              {operatorKPIs.map(o => (
                <tr key={o.code} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3"><span className={`font-bold ${o.rank === 1 ? 'text-amber-600' : o.rank === 2 ? 'text-slate-500' : o.rank === 3 ? 'text-orange-700' : 'text-muted-foreground'}`}>#{o.rank}</span></td>
                  <td className="px-4 py-3"><div className="font-medium">{o.name}</div><div className="text-xs text-muted-foreground font-mono">{o.code}</div></td>
                  <td className="px-4 py-3 font-mono">{o.tasks}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-mono text-xs w-12">{o.accuracy}%</span><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${o.accuracy > 97 ? 'bg-emerald-500' : o.accuracy > 95 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${o.accuracy}%` }} /></div></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-mono text-xs w-10">{o.util}%</span><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${o.util > 80 ? 'bg-emerald-500' : o.util > 60 ? 'bg-amber-500' : 'bg-slate-300'}`} style={{ width: `${o.util}%` }} /></div></div></td>
                  <td className="px-4 py-3 font-mono text-xs">{o.idle}m</td>
                  <td className="px-4 py-3 font-mono text-xs">{o.travel}m</td>
                  <td className="px-4 py-3 font-mono text-xs">{o.avgDur > 0 ? `${o.avgDur}m` : '—'}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${o.rating > 85 ? 'border-emerald-300 text-emerald-700' : o.rating > 70 ? 'border-blue-300 text-blue-700' : 'border-amber-300 text-amber-700'}`}>{o.rating}/100</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white"><Brain className="h-5 w-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">AI-Ready Task Optimization Insights</h3>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>Priya Nair</strong> has 48 min idle time — consider cross-training on PICKER skill to improve utilization.</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>Travel time</strong> averages 42 min/operator/day — zone-based assignment could reduce by ~30%.</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>Morning shift</strong> has 18% higher throughput than evening — consider rebalancing wave releases.</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><span><strong>FORKLIFT certification</strong> gap: 6/8 certified — train Lakshmi & Priya to enable forklift task assignment.</span></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// SPRINT 29 — CROSS-DOCKING, DOCK YARD & YARD MANAGEMENT
// Epic 1: Cross-Dock · Epic 2: Yard · Epic 3: Truck Queue
// Epic 4: Dock Scheduling · Epic 5: Trailers · Epic 6: Gate
// ═════════════════════════════════════════════════════════

// ─── Epic 1: Cross-Dock Console Module ──────────────────
