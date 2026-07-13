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
import { warehouseApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'

export function PutawayModule() {
  const [tab, setTab] = useState<PutawayTab>('overview')
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await warehouseApi.listPutawayTasks({ page: 1 })
        if (!cancelled) setTasks(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load putaway tasks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])
  const tabs: Array<{ key: PutawayTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'tasks', label: 'Tasks', icon: <PackageOpen className="h-4 w-4" /> },
    { key: 'rules', label: 'Rules', icon: <Workflow className="h-4 w-4" /> },
    { key: 'pallets', label: 'Pallets', icon: <Boxes className="h-4 w-4" /> },
    { key: 'forklift', label: 'Forklift', icon: <Truck className="h-4 w-4" /> },
  ]

  const overviewStats = [
    { label: 'Pending Putaway', value: '2', sub: 'Awaiting assignment', icon: <PackageOpen className="h-5 w-5 text-amber-600" />, color: 'text-amber-600' },
    { label: 'In Progress', value: '2', sub: '1 DIRECTED · 1 COLD_STORAGE', icon: <ActivityIcon className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
    { label: 'Completed Today', value: '1', sub: 'CROSS_DOCK · 35 min', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, color: 'text-emerald-600' },
    { label: 'Avg Putaway Time', value: '33 min', sub: 'SLA: ≤ 45 min', icon: <Clock className="h-5 w-5 text-indigo-600" />, color: 'text-indigo-600' },
    { label: 'Active Forklifts', value: '2', sub: 'FL-01, FL-04 in motion', icon: <Truck className="h-5 w-5 text-cyan-600" />, color: 'text-cyan-600' },
    { label: 'Pallets In Use', value: '3', sub: '2 LOADED · 1 STORED', icon: <Boxes className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
    { label: 'Putaway Accuracy', value: '98.2%', sub: 'SLA: ≥ 97%', icon: <Gauge className="h-5 w-5 text-teal-600" />, color: 'text-teal-600' },
    { label: 'Exception Count', value: '3', sub: '1 wrong-bin · 2 over-capacity', icon: <AlertTriangle className="h-5 w-5 text-red-600" />, color: 'text-red-600' },
  ]

  const directedFlow = [
    { label: 'Receiving', icon: <Truck className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    { label: 'Inspection', icon: <ClipboardCheck className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
    { label: 'Putaway Task', icon: <PackageOpen className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    { label: 'Bin Recommendation', icon: <MapPin className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    { label: 'Barcode Scan', icon: <ScanLine className="h-4 w-4" />, color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
    { label: 'Confirm Location', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    { label: 'Inventory Updated', icon: <Database className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  ]

  const operatorFlow = [
    'Operator Login', 'Assigned Tasks', 'Task #', 'Scan Pallet', 'System Shows Zone/Aisle/Rack/Shelf/Bin', 'Scan Bin', 'Complete',
  ]

  const binScoringFactors = [
    { factor: 'Capacity', weight: 20, color: 'bg-blue-500', desc: 'Current weight/volume utilization vs bin max' },
    { factor: 'Distance', weight: 30, color: 'bg-purple-500', desc: 'Forklift travel meters from receiving to bin' },
    { factor: 'Product Compatibility', weight: 15, color: 'bg-amber-500', desc: 'Same-product batching, allergen separation, batch isolation' },
    { factor: 'Temperature Match', weight: 20, color: 'bg-cyan-500', desc: 'Chilled bins for chilled products, ambient for ambient' },
    { factor: 'Picking Efficiency', weight: 15, color: 'bg-emerald-500', desc: 'Pick-face proximity for fast movers, high-rack for slow' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><PackageOpen className="h-7 w-7" /> Directed Putaway, Storage Optimization & Bin Intelligence</h2>
            <p className="text-indigo-100 text-sm max-w-3xl">The system — not the operator — decides WHERE each pallet goes. Operator follows step-by-step instructions: Scan Pallet → System shows Zone/Aisle/Rack/Shelf/Bin → Drive to bin → Scan bin → Confirm. Eliminates the 30% putaway-error rate of operator-decided putaway.</p>
          </div>
          <Badge className="bg-purple-500 text-purple-950 hover:bg-purple-500">Sprint 27 · Part 4 WMS</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">Sprint 27 · 223 tables</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">6 Putaway Tasks</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">5 Putaway Rules</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">4 Warehouse Pallets</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">5 Forklift Tasks</Badge>
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
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Workflow className="h-5 w-5" /> Directed Putaway Flow — 7 Steps</h3>
            <div className="flex flex-wrap items-center gap-2">
              {directedFlow.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[110px]', step.color)}>
                    {step.icon}
                    <span className="text-xs font-medium text-center">{step.label}</span>
                  </div>
                  {i < directedFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Directed Putaway flips the traditional model: the system computes the optimal bin and directs the operator step-by-step. The operator only confirms each step with a barcode scan — eliminating wrong-bin, wrong-zone, and mixed-product errors.</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex-shrink-0">
                <PackageOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Task-Driven Operator Workflow <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Chief Architect Recommendation</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">The operator&apos;s day is task-driven: login → see assigned tasks → pick a task → scan the pallet → system shows the target Zone/Aisle/Rack/Shelf/Bin → drive there → scan bin to confirm → mark task complete. No decision-making, no paper, no wrong bins.</p>
                <div className="flex flex-wrap items-center gap-2">
                  {operatorFlow.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">{i + 1}. {step}</Badge>
                      {i < operatorFlow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 flex-shrink-0">
                <Layers3 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Bin Scoring Formula <Badge className="bg-purple-500 text-purple-950 hover:bg-purple-500">5-Factor Scoring</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">Every candidate bin is scored 0-100 on five factors. The engine recommends the highest-scoring bin. Best Bin Score = Capacity + Distance + Product Compatibility + Temperature Match + Picking Efficiency.</p>
                <div className="space-y-3">
                  {binScoringFactors.map(f => (
                    <div key={f.factor} className="flex items-center gap-3">
                      <div className="w-44 flex-shrink-0">
                        <p className="text-xs font-medium">{f.factor}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                      </div>
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                        <div className={cn('h-full flex items-center justify-end pr-2 text-xs font-bold text-white', f.color)} style={{ width: `${f.weight * 2}%` }}>
                          {f.weight}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  <span>Best Bin Score = Capacity (20) + Distance (30) + Product Compatibility (15) + Temperature Match (20) + Picking Efficiency (15) = 100</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'tasks' && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Task #</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium">Warehouse</th>
                  <th className="pb-2 pr-3 font-medium">Source → Dest Zone</th>
                  <th className="pb-2 pr-3 font-medium">Priority</th>
                  <th className="pb-2 pr-3 font-medium">Operator</th>
                  <th className="pb-2 pr-3 font-medium">Lines/Plts/Qty</th>
                  <th className="pb-2 pr-3 font-medium">Progress</th>
                  <th className="pb-2 pr-3 font-medium">Timing</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {PUTAWAY_TASKS.map(t => (
                  <tr key={t.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 pr-3 font-mono text-xs font-semibold">{t.taskNumber}<div className="text-xs text-muted-foreground font-sans">{t.taskDate}</div></td>
                    <td className="py-3 pr-3"><Badge className={cn('text-xs', PUTAWAY_TYPE_COLORS[t.type])}>{t.type}</Badge></td>
                    <td className="py-3 pr-3"><Badge className={cn('text-xs', PUTAWAY_STATUS_COLORS[t.status])}>{t.status}</Badge></td>
                    <td className="py-3 pr-3 text-xs">{t.warehouseName}<div className="text-xs text-muted-foreground">{t.referenceNumber}</div></td>
                    <td className="py-3 pr-3 text-xs"><span className="font-mono">{t.sourceZone}</span><ArrowRight className="inline h-3 w-3 mx-1 text-muted-foreground" /><span className="font-mono">{t.destZone}</span></td>
                    <td className="py-3 pr-3"><Badge className={cn('text-xs', PUTAWAY_PRIORITY_COLORS[t.priority])}>{t.priority}</Badge></td>
                    <td className="py-3 pr-3 text-xs">{t.assignedOperatorName || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                    <td className="py-3 pr-3 text-xs">{t.totalLines}L · {t.totalPallets}P · {t.totalQuantity} qty</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full', t.putawayProgress === 100 ? 'bg-emerald-500' : t.putawayProgress > 0 ? 'bg-purple-500' : 'bg-slate-300')} style={{ width: `${t.putawayProgress}%` }} />
                        </div>
                        <span className="text-xs font-medium">{t.putawayProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-xs">est {t.estTimeMin}m{t.actualTimeMin !== null ? <div className="text-muted-foreground">act {t.actualTimeMin}m</div> : null}</td>
                    <td className="py-3">
                      {t.status === 'IN_PROGRESS' ? (
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
            {Object.keys(PUTAWAY_TYPE_COLORS).slice(0, 6).map(t => (
              <Badge key={t} className={cn('text-xs', PUTAWAY_TYPE_COLORS[t])}>{t}</Badge>
            ))}
            <span className="ml-3">Statuses:</span>
            {Object.keys(PUTAWAY_STATUS_COLORS).slice(0, 7).map(s => (
              <Badge key={s} className={cn('text-xs', PUTAWAY_STATUS_COLORS[s])}>{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {tab === 'rules' && (
        <div className="grid gap-4 md:grid-cols-2">
          {PUTAWAY_RULES.map(r => {
            const total = r.factorWeights.capacity + r.factorWeights.distance + r.factorWeights.compatibility + r.factorWeights.temperature + r.factorWeights.pickingEfficiency
            const factors = [
              { name: 'Capacity', value: r.factorWeights.capacity, color: 'bg-blue-500' },
              { name: 'Distance', value: r.factorWeights.distance, color: 'bg-purple-500' },
              { name: 'Compatibility', value: r.factorWeights.compatibility, color: 'bg-amber-500' },
              { name: 'Temperature', value: r.factorWeights.temperature, color: 'bg-cyan-500' },
              { name: 'Picking Eff.', value: r.factorWeights.pickingEfficiency, color: 'bg-emerald-500' },
            ]
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', STRATEGY_COLORS[r.strategy])}>{r.strategy}</Badge>
                      <Badge variant="outline" className="text-xs">Priority {r.priority}</Badge>
                      {r.isActive && <Badge className="bg-emerald-600 text-white text-xs">Active</Badge>}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{r.ruleCode}</p>
                    <h3 className="font-semibold mt-1">{r.ruleName}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                <div className="space-y-2 mb-3">
                  {factors.map(f => (
                    <div key={f.name} className="flex items-center gap-2">
                      <div className="w-24 text-xs text-muted-foreground">{f.name}</div>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full', f.color)} style={{ width: `${(f.value / total) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs font-semibold text-right">{f.value}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {r.conditions.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Target Zones</p>
                    <div className="flex flex-wrap gap-1">
                      {r.targetZones.map((z, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{z}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'pallets' && (
        <div className="grid gap-4 md:grid-cols-2">
          {WAREHOUSE_PALLETS.map(p => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Boxes className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold">{p.palletBarcode}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.qrCode}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn('text-xs', PALLET_TYPE_COLORS[p.palletType])}>{p.palletType}</Badge>
                      <Badge className={cn('text-xs', PALLET_STATUS_COLORS[p.status])}>{p.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Current Location</p>
                  <p className="font-mono text-sm font-semibold">{p.currentLocation}</p>
                  <p className="text-xs text-muted-foreground">{p.currentZone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <p className="text-muted-foreground">Weight (kg)</p>
                  <p className="font-semibold">{p.currentWeightKg} / {p.maxWeightKg}</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div className={cn('h-full', p.weightUtilizationPct >= 90 ? 'bg-red-500' : p.weightUtilizationPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${p.weightUtilizationPct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.weightUtilizationPct}% utilization</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cartons</p>
                  <p className="font-semibold">{p.currentCartons} / {p.maxCartons}</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div className={cn('h-full', p.currentCartons === 0 ? 'bg-slate-300' : 'bg-blue-500')} style={{ width: `${p.maxCartons > 0 ? (p.currentCartons / p.maxCartons) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.productCount} products · {p.cartonCount} cartons</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                <MapPin className="h-3 w-3" />
                <span>{p.warehouseName} · {p.currentZone}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'forklift' && (
        <div className="grid gap-4 md:grid-cols-2">
          {FORKLIFT_TASKS_DATA.map(f => (
            <Card key={f.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn('text-xs', FORKLIFT_TYPE_COLORS[f.type])}>{f.type}</Badge>
                    <Badge className={cn('text-xs', FORKLIFT_STATUS_COLORS[f.status])}>{f.status}</Badge>
                    <Badge className={cn('text-xs', PUTAWAY_PRIORITY_COLORS[f.priority])}>{f.priority}</Badge>
                  </div>
                  <p className="font-mono text-sm font-bold">{f.taskNumber}</p>
                  <p className="text-xs text-muted-foreground">{f.forkliftCode} · {f.forkliftType}{f.putawayTaskNumber ? ` · ${f.putawayTaskNumber}` : ''}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-mono text-xs font-semibold">{f.fromLocation}</p>
                  <p className="text-xs text-muted-foreground">{f.fromZone}</p>
                </div>
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-mono text-xs font-semibold">{f.toLocation}</p>
                  <p className="text-xs text-muted-foreground">{f.toZone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="text-muted-foreground">Route:</span>
                <span className="font-mono">{f.fromLocation}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">{f.toLocation}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <p className="text-muted-foreground">Operator</p>
                  <p className="font-semibold text-xs">{f.assignedOperatorName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-semibold text-xs">{f.travelDistanceM} m</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold text-xs">{f.durationMin !== null ? `${f.durationMin} min` : `${f.estTravelTimeMin} min est`}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-xs text-muted-foreground font-mono">{f.palletBarcode}</span>
                {f.status === 'IN_PROGRESS' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Complete</Button>
                )}
                {f.status === 'COMPLETED' && <Badge variant="outline" className="text-xs text-emerald-700">Done</Badge>}
                {f.status === 'ASSIGNED' && <Badge variant="outline" className="text-xs">Awaiting Start</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Picking, Packing & Order Fulfillment Module (Sprint 26) ────
type FulfillmentTab = 'overview' | 'picking' | 'packing' | 'cartons' | 'labels'

const FULFILLMENT_TYPE_COLORS: Record<string, string> = {
  RETAIL_ORDER: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  WHOLESALE_ORDER: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  DISTRIBUTOR_ORDER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  RESTAURANT_REPLENISHMENT: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  BRANCH_TRANSFER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  EXPORT_ORDER: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  CORPORATE_ORDER: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  ECOMMERCE_ORDER: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
  SAMPLE_ORDER: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const PICKING_STRATEGY_COLORS: Record<string, string> = {
  SINGLE_ORDER: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  BATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  WAVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  ZONE: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PICK_AND_PASS: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  CART: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  CLUSTER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  PALLET: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
}

const PICKING_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-500 text-white',
  ASSIGNED: 'bg-cyan-600 text-white',
  IN_PROGRESS: 'bg-purple-600 text-white',
  PICKED: 'bg-blue-600 text-white',
  PACKING: 'bg-amber-500 text-white',
  PACKED: 'bg-indigo-600 text-white',
  READY_TO_SHIP: 'bg-emerald-600 text-white',
  DISPATCHED: 'bg-teal-700 text-white',
  CANCELLED: 'bg-red-600 text-white',
  EXCEPTION: 'bg-rose-700 text-white',
}

const FULFILLMENT_PRIORITY_COLORS: Record<string, string> = {
  EMERGENCY: 'bg-red-600 text-white',
  HIGH: 'bg-amber-500 text-white',
  NORMAL: 'bg-blue-500 text-white',
  LOW: 'bg-slate-400 text-white',
}

const STATION_TYPE_COLORS: Record<string, string> = {
  STANDARD: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  BULK: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  COLD: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  EXPORT: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  FRAGILE: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  GIFT: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
}

const STATION_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-600 text-white',
  BUSY: 'bg-amber-500 text-white',
  MAINTENANCE: 'bg-red-600 text-white',
  CLOSED: 'bg-slate-500 text-white',
}

const PACKING_JOB_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-500 text-white',
  IN_PROGRESS: 'bg-purple-600 text-white',
  PACKED: 'bg-indigo-600 text-white',
  LABELED: 'bg-blue-600 text-white',
  READY_TO_SHIP: 'bg-emerald-600 text-white',
  EXCEPTION: 'bg-rose-700 text-white',
  CANCELLED: 'bg-red-600 text-white',
}

const VERIFICATION_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  VERIFIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MISMATCH: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  EXCEPTION: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const CARTON_CATEGORY_COLORS: Record<string, string> = {
  STANDARD: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  BULK: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  PALLET: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  MIXED: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  GIFT_BOX: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
  EXPORT: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  FRAGILE: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  COLD: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
}

const CARTON_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-amber-500 text-white',
  SEALED: 'bg-blue-600 text-white',
  LABELED: 'bg-emerald-600 text-white',
  LOADED: 'bg-purple-600 text-white',
  SHIPPED: 'bg-slate-500 text-white',
}

const LABEL_TYPE_COLORS: Record<string, string> = {
  ORDER_LABEL: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  CARTON_LABEL: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  COURIER_LABEL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  PALLET_LABEL: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  INTERNAL_LABEL: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  QR_LABEL: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  BARCODE_LABEL: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

const PRINT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PRINTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const PICKING_TASKS_DATA = [
  { id: 'pkt-001', pickingNumber: 'PK-2026-0001', pickingDate: '09 Jul 07:30', fulfillmentType: 'RETAIL_ORDER', pickingStrategy: 'SINGLE_ORDER', warehouseName: 'Finished Goods Warehouse', waveNumber: 'WV-2026-0001', referenceNumber: 'SO-2026-0231', partnerName: 'Sudhastar Retail Mumbai', pickerName: 'Ramesh Patil', priority: 'HIGH', priorityScore: 80, status: 'IN_PROGRESS', totalLines: 4, pickedLines: 2, totalQty: 120, pickedQty: 60, totalDistanceM: 145.5, estTimeMin: 18, pickDurationMin: 14 },
  { id: 'pkt-002', pickingNumber: 'PK-2026-0002', pickingDate: '09 Jul 06:00', fulfillmentType: 'WHOLESALE_ORDER', pickingStrategy: 'BATCH', warehouseName: 'Finished Goods Warehouse', waveNumber: 'WV-2026-0001', referenceNumber: 'SO-2026-0228', partnerName: 'Maharashtra Wholesale Distributors', pickerName: 'Suresh Kumar', priority: 'NORMAL', priorityScore: 50, status: 'PICKED', totalLines: 3, pickedLines: 3, totalQty: 360, pickedQty: 360, totalDistanceM: 220, estTimeMin: 30, pickDurationMin: 32 },
  { id: 'pkt-003', pickingNumber: 'PK-2026-0003', pickingDate: '09 Jul 08:00', fulfillmentType: 'DISTRIBUTOR_ORDER', pickingStrategy: 'WAVE', warehouseName: 'Finished Goods Warehouse', waveNumber: 'WV-2026-0002', referenceNumber: 'SO-2026-0245', partnerName: 'Pune Distributors Network', pickerName: 'Imran Khan', priority: 'HIGH', priorityScore: 75, status: 'PENDING', totalLines: 5, pickedLines: 0, totalQty: 480, pickedQty: 0, totalDistanceM: 285, estTimeMin: 35, pickDurationMin: null },
  { id: 'pkt-004', pickingNumber: 'PK-2026-0004', pickingDate: '09 Jul 05:00', fulfillmentType: 'RESTAURANT_REPLENISHMENT', pickingStrategy: 'ZONE', warehouseName: 'Cold Storage Warehouse', waveNumber: 'WV-2026-0003', referenceNumber: 'SO-2026-0218', partnerName: 'Mumbai Restaurant Group', pickerName: 'Lakshmi Iyer', priority: 'EMERGENCY', priorityScore: 95, status: 'PACKED', totalLines: 3, pickedLines: 3, totalQty: 90, pickedQty: 90, totalDistanceM: 95, estTimeMin: 15, pickDurationMin: 18 },
  { id: 'pkt-005', pickingNumber: 'PK-2026-0005', pickingDate: '09 Jul 04:00', fulfillmentType: 'BRANCH_TRANSFER', pickingStrategy: 'PICK_AND_PASS', warehouseName: 'Finished Goods Warehouse', waveNumber: 'WV-2026-0004', referenceNumber: 'TO-2026-0067', partnerName: 'Pune Retail Branch', pickerName: 'Vinod Mehta', priority: 'NORMAL', priorityScore: 60, status: 'READY_TO_SHIP', totalLines: 4, pickedLines: 4, totalQty: 240, pickedQty: 240, totalDistanceM: 175.5, estTimeMin: 22, pickDurationMin: 25 },
  { id: 'pkt-006', pickingNumber: 'PK-2026-0006', pickingDate: '08 Jul 14:00', fulfillmentType: 'EXPORT_ORDER', pickingStrategy: 'CART', warehouseName: 'Finished Goods Warehouse', waveNumber: 'WV-2026-0005', referenceNumber: 'SO-2026-0199', partnerName: 'Dubai Exports FZE', pickerName: 'Javed Akhtar', priority: 'HIGH', priorityScore: 85, status: 'DISPATCHED', totalLines: 4, pickedLines: 4, totalQty: 480, pickedQty: 480, totalDistanceM: 310, estTimeMin: 40, pickDurationMin: 42 },
]

const PACKING_STATIONS_DATA = [
  { id: 'ps-001', stationCode: 'PS-01', stationName: 'Standard Packing Station 01', stationType: 'STANDARD', warehouseId: 'wh-fg-mum', hasLabelPrinter: true, hasScale: true, hasBarcodeScanner: true, hasConveyor: true, maxConcurrentJobs: 2, currentJobs: 1, status: 'BUSY', totalJobsCompleted: 348, avgPackTimeMin: 22 },
  { id: 'ps-002', stationCode: 'PS-02', stationName: 'Cold Chain Packing Station 02', stationType: 'COLD', warehouseId: 'wh-cs-mum', hasLabelPrinter: true, hasScale: true, hasBarcodeScanner: true, hasConveyor: false, maxConcurrentJobs: 1, currentJobs: 0, status: 'AVAILABLE', totalJobsCompleted: 156, avgPackTimeMin: 28 },
  { id: 'ps-003', stationCode: 'PS-03', stationName: 'Export Packing Station 03', stationType: 'EXPORT', warehouseId: 'wh-fg-mum', hasLabelPrinter: true, hasScale: true, hasBarcodeScanner: true, hasConveyor: true, maxConcurrentJobs: 1, currentJobs: 0, status: 'AVAILABLE', totalJobsCompleted: 89, avgPackTimeMin: 45 },
]

const PACKING_JOBS_DATA = [
  { id: 'pjb-001', jobNumber: 'PJB-2026-0001', jobDate: '09 Jul 06:35', pickingTaskNumber: 'PK-2026-0002', stationCode: 'PS-01', packerName: 'Vinod Mehta', verificationRequired: true, verificationStatus: 'VERIFIED', cartonCount: 2, totalWeightKg: 36.5, totalVolumeM3: 0.18, status: 'IN_PROGRESS', startedAt: '09 Jul 06:35', durationMinutes: null, labelPrinted: false },
  { id: 'pjb-002', jobNumber: 'PJB-2026-0002', jobDate: '09 Jul 05:20', pickingTaskNumber: 'PK-2026-0004', stationCode: 'PS-02', packerName: 'Lakshmi Iyer', verificationRequired: true, verificationStatus: 'VERIFIED', cartonCount: 1, totalWeightKg: 12.8, totalVolumeM3: 0.06, status: 'LABELED', startedAt: '09 Jul 05:20', durationMinutes: 22, labelPrinted: true },
  { id: 'pjb-003', jobNumber: 'PJB-2026-0003', jobDate: '09 Jul 04:30', pickingTaskNumber: 'PK-2026-0005', stationCode: 'PS-01', packerName: 'Vinod Mehta', verificationRequired: true, verificationStatus: 'VERIFIED', cartonCount: 2, totalWeightKg: 24.3, totalVolumeM3: 0.14, status: 'READY_TO_SHIP', startedAt: '09 Jul 04:30', durationMinutes: 20, labelPrinted: true },
  { id: 'pjb-004', jobNumber: 'PJB-2026-0004', jobDate: '08 Jul 14:45', pickingTaskNumber: 'PK-2026-0006', stationCode: 'PS-03', packerName: 'Javed Akhtar', verificationRequired: true, verificationStatus: 'VERIFIED', cartonCount: 4, totalWeightKg: 58.4, totalVolumeM3: 0.32, status: 'READY_TO_SHIP', startedAt: '08 Jul 14:45', durationMinutes: 45, labelPrinted: true },
]

const CARTON_TYPES_DATA = [
  { id: 'ct-001', cartonCode: 'CT-STD-01', cartonName: 'Standard Carton 30×20×20 cm', lengthCm: 30, widthCm: 20, heightCm: 20, volumeM3: 0.012, maxWeightKg: 15, emptyWeightKg: 0.45, cartonCategory: 'STANDARD', status: 'ACTIVE' },
  { id: 'ct-002', cartonCode: 'CT-GBX-02', cartonName: 'Premium Gift Box 25×25×15 cm', lengthCm: 25, widthCm: 25, heightCm: 15, volumeM3: 0.0094, maxWeightKg: 8, emptyWeightKg: 0.65, cartonCategory: 'GIFT_BOX', status: 'ACTIVE' },
  { id: 'ct-003', cartonCode: 'CT-EXP-03', cartonName: 'Export Carton 40×30×30 cm (Double Wall)', lengthCm: 40, widthCm: 30, heightCm: 30, volumeM3: 0.036, maxWeightKg: 25, emptyWeightKg: 1.2, cartonCategory: 'EXPORT', status: 'ACTIVE' },
]

const CARTONS_DATA = [
  { id: 'ctn-001', cartonNumber: 'CTN-2026-0001', barcode: 'BC-CTN-2026-0001', cartonTypeName: 'Standard Carton', cartonCategoryId: 'STANDARD', packingJobNumber: 'PJB-2026-0001', productCount: 2, totalUnits: 240, weightKg: 18.5, status: 'OPEN' },
  { id: 'ctn-002', cartonNumber: 'CTN-2026-0002', barcode: 'BC-CTN-2026-0002', cartonTypeName: 'Standard Carton', cartonCategoryId: 'STANDARD', packingJobNumber: 'PJB-2026-0001', productCount: 1, totalUnits: 96, weightKg: 12.0, status: 'OPEN' },
  { id: 'ctn-003', cartonNumber: 'CTN-2026-0003', barcode: 'BC-CTN-2026-0003', cartonTypeName: 'Premium Gift Box', cartonCategoryId: 'GIFT_BOX', packingJobNumber: 'PJB-2026-0002', productCount: 3, totalUnits: 90, weightKg: 12.8, status: 'LABELED' },
  { id: 'ctn-004', cartonNumber: 'CTN-2026-0004', barcode: 'BC-CTN-2026-0004', cartonTypeName: 'Standard Carton', cartonCategoryId: 'STANDARD', packingJobNumber: 'PJB-2026-0003', productCount: 4, totalUnits: 240, weightKg: 24.3, status: 'LOADED' },
  { id: 'ctn-005', cartonNumber: 'CTN-2026-0005', barcode: 'BC-CTN-2026-0005', cartonTypeName: 'Export Carton', cartonCategoryId: 'EXPORT', packingJobNumber: 'PJB-2026-0004', productCount: 4, totalUnits: 480, weightKg: 14.6, status: 'SHIPPED' },
]

const SHIPPING_LABELS_DATA = [
  { id: 'sl-001', labelNumber: 'SHP-LBL-2026-0001', labelDate: '09 Jul 05:40', labelType: 'ORDER_LABEL', packingJobNumber: 'PJB-2026-0002', cartonNumber: 'CTN-2026-0003', partnerName: 'Mumbai Restaurant Group', shipToName: 'Chef Rajesh Sharma', shipToAddress: 'Marine Drive Restaurant, 12 Marine Lines, Mumbai 400020', carrierName: 'Blue Dart', trackingNumber: 'BD-2026-MUM-00142', contentSummary: 'Chilled Kaju Katli (30u), Chilled Soan Cake (30u), Refrigerated Dry Fruit Mix (30u)', totalWeight: 12.8, totalCartons: 1, format: 'PDF', printStatus: 'PRINTED' },
  { id: 'sl-002', labelNumber: 'SHP-LBL-2026-0002', labelDate: '09 Jul 04:52', labelType: 'CARTON_LABEL', packingJobNumber: 'PJB-2026-0003', cartonNumber: 'CTN-2026-0004', partnerName: 'Pune Retail Branch', shipToName: 'Sudhastar Pune Branch Manager', shipToAddress: 'FC Road Branch, Shop 14, FC Road, Pune 411005', carrierName: 'Delhivery', trackingNumber: 'DLV-2026-PUN-00089', contentSummary: 'Kaju Katli (60u), Soan Cake (60u), Pista Roll (60u), Anjeer Bar (60u) — Branch Transfer', totalWeight: 24.3, totalCartons: 1, format: 'PDF', printStatus: 'PRINTED' },
  { id: 'sl-003', labelNumber: 'SHP-LBL-2026-0003', labelDate: '08 Jul 15:35', labelType: 'COURIER_LABEL', packingJobNumber: 'PJB-2026-0004', cartonNumber: 'CTN-2026-0005', partnerName: 'Dubai Exports FZE', shipToName: 'Mr. Abdul Rahman', shipToAddress: 'Jebel Ali Free Zone, Office 402, Building 7, Dubai', carrierName: 'DHL Express', trackingNumber: 'DHL-EXPORT-2026-0042', contentSummary: 'Premium Kaju Katli 1kg Export (120u), Premium Soan Cake 2kg Export (120u), Premium Pista Roll 500g Export (120u), Premium Anjeer Bar 400g Export (120u)', totalWeight: 14.6, totalCartons: 1, format: 'ZPL', printStatus: 'PRINTED' },
  { id: 'sl-004', labelNumber: 'SHP-LBL-2026-0004', labelDate: '09 Jul 06:55', labelType: 'PALLET_LABEL', packingJobNumber: 'PJB-2026-0001', cartonNumber: null, partnerName: 'Maharashtra Wholesale Distributors', shipToName: 'Mr. Suresh Distributor', shipToAddress: 'Wholesale Hub, APMC Market, Vashi, Navi Mumbai 400703', carrierName: 'DTDC', trackingNumber: null, contentSummary: 'Wholesale pallet — 3 SKUs (360 units total). Cartons: CTN-2026-0001 + CTN-2026-0002.', totalWeight: 36.5, totalCartons: 2, format: 'PDF', printStatus: 'PENDING' },
]

const PICKING_STRATEGIES = [
  { strategy: 'SINGLE_ORDER', desc: 'One order, one picker — retail & e-commerce. Minimizes per-order travel distance.', color: 'bg-blue-500' },
  { strategy: 'BATCH', desc: 'Multiple similar orders picked together in one walk — wholesale & high-volume.', color: 'bg-purple-500' },
  { strategy: 'WAVE', desc: 'Orders released in waves by dispatch window — synchronizes with truck departure.', color: 'bg-emerald-500' },
  { strategy: 'ZONE', desc: 'Picker owns a zone, tote passes zone-to-zone — large warehouses with zone expertise.', color: 'bg-amber-500' },
  { strategy: 'PICK_AND_PASS', desc: 'Multi-zone orders passed between pickers via conveyor — high-throughput DCs.', color: 'bg-cyan-500' },
  { strategy: 'CART', desc: 'Cart-mounted mobile picking, batch of orders on one cart — e-commerce & multi-order.', color: 'bg-rose-500' },
  { strategy: 'CLUSTER', desc: 'Cluster-picking with multi-tote cart — high-density SKUs, single picker handles a cluster.', color: 'bg-indigo-500' },
  { strategy: 'PALLET', desc: 'Pallet-level picking for bulk & wholesale — full pallet out, no case-level handling.', color: 'bg-teal-500' },
]
