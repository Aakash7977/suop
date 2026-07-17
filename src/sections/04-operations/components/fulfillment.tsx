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
import { pickPackApi as pickPackDispatchApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function FulfillmentModule() {
  const { hasPermission } = useAuthStore()
  const [tab, setTab] = useState<FulfillmentTab>('overview')

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true); setError('')
      try {
        const res = await pickPackDispatchApi.listPickLists({ page: 1, search: search || undefined })
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
  const tabs: Array<{ key: FulfillmentTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'picking', label: 'Picking', icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: 'packing', label: 'Packing', icon: <PackageCheck className="h-4 w-4" /> },
    { key: 'cartons', label: 'Cartons', icon: <Boxes className="h-4 w-4" /> },
    { key: 'labels', label: 'Labels', icon: <Tag className="h-4 w-4" /> },
  ]

  const [stats, setStats] = useState<Array<{ label: string; value: string; sub: string; icon: React.ReactNode }>>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadStats() {
      setStatsLoading(true)
      try {
        const { fulfillmentApi } = await import('@/api')
        const [allocRes, waveRes] = await Promise.all([
          fulfillmentApi.listAllocations({ page: 1, pageSize: 1 }).catch(() => ({ meta: { total: 0 } })),
          fulfillmentApi.listWaves({ page: 1, pageSize: 1 }).catch(() => ({ meta: { total: 0 } })),
        ])
        if (cancelled) return
        setStats([
          { label: 'Total Allocations', value: String(allocRes.meta?.total ?? 0), sub: 'All allocations', icon: <ClipboardCheck className="h-5 w-5 text-amber-600" /> },
          { label: 'Total Waves', value: String(waveRes.meta?.total ?? 0), sub: 'All wave plans', icon: <Waves className="h-5 w-5 text-purple-600" /> },
          { label: 'Pick Lists', value: String(data.length), sub: 'From pick-pack API', icon: <PackageCheck className="h-5 w-5 text-emerald-600" /> },
          { label: 'Search Results', value: String(data.length), sub: search ? `Filter: ${search}` : 'All', icon: <Search className="h-5 w-5 text-cyan-600" /> },
        ])
      } catch { if (!cancelled) setStats([]) }
      finally { if (!cancelled) setStatsLoading(false) }
    }
    loadStats()
    return () => { cancelled = true }
  }, [data.length, search])

  const fulfillmentFlow = [
    { label: 'Sales Order', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    { label: 'Allocation', icon: <Layers3 className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
    { label: 'Wave Planning', icon: <Workflow className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    { label: 'Picking Task', icon: <ClipboardCheck className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    { label: 'Barcode Picking', icon: <ScanLine className="h-4 w-4" />, color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
    { label: 'Packing', icon: <PackageCheck className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
    { label: 'Quality Check', icon: <ShieldCheck className="h-4 w-4" />, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    { label: 'Shipping Label', icon: <Tag className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    { label: 'Dispatch Ready', icon: <Truck className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-amber-900 via-rose-900 to-purple-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><ClipboardCheck className="h-7 w-7" /> Picking, Packing & Order Fulfillment Engine</h2>
            <p className="text-amber-100 text-sm max-w-3xl">The heart of warehouse outbound — converting Sales Orders into directed pick walks with two-stage barcode verification (Pick: Scan Bin→Product→Batch→Tote; Pack: second-scan verification→pack→label→dispatch). 6 fulfillment types, 8 picking strategies, cartonization engine, multi-carrier shipping labels.</p>
          </div>
          <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Sprint 27 · Part 4 WMS</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">Sprint 27 · 223 tables</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">6 Picking Tasks</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">3 Packing Stations</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">4 Packing Jobs</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">3 Carton Types</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">5 Cartons</Badge>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">4 Shipping Labels</Badge>
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
            {(statsLoading ? [...Array(4)].map((_, i) => <Card key={i} className="p-4"><div className="h-16 bg-muted/50 rounded animate-pulse" /></Card>) : stats.map(s => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </Card>
            )))}
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Workflow className="h-5 w-5" /> Fulfillment Flow — 9 Steps</h3>
            <div className="flex flex-wrap items-center gap-2">
              {fulfillmentFlow.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[110px]', step.color)}>
                    {step.icon}
                    <span className="text-xs font-medium text-center">{step.label}</span>
                  </div>
                  {i < fulfillmentFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Sales Order → Allocation → Wave Planning → Picking Task → Barcode Picking → Packing → Quality Check → Shipping Label → Dispatch Ready. Each step has a directed workflow with barcode verification. The status of every picking task flows through this pipeline.</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex-shrink-0">
                <ScanLine className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Two-Stage Barcode Verification <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Chief Architect Recommendation</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">Two-Stage Barcode Verification is the Chief Architect recommendation. Stage 1 (Pick): picker scans Bin → Product → Batch → Tote in sequence — each scan matched against expected value; mismatch blocks the line and raises an exception (WRONG_BIN, WRONG_PRODUCT, WRONG_BATCH). Stage 2 (Pack): packer re-scans each picked unit at the Packing Station; system cross-checks against the picking task before sealing. This drives picking accuracy from 75% (paper-based) to 99.4% (double-scan) and gives complete genealogy: Sales Order → Picking Task → Picking Line → Packing Job → Carton → Shipping Label → Carrier Tracking.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-purple-600" /> Stage 1 — Pick</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Scan Bin', 'Scan Product', 'Scan Batch', 'Scan Tote'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">{i + 1}. {step}</Badge>
                          {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Each scan matched against expected value. Mismatch raises exception.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-2"><PackageCheck className="h-4 w-4 text-emerald-600" /> Stage 2 — Pack</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Second Scan Verification', 'Pack', 'Label', 'Dispatch'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">{i + 1}. {step}</Badge>
                          {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Re-scan at Packing Station cross-checks against picking task before sealing.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Layers3 className="h-5 w-5" /> Picking Strategies — 8 Types</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {PICKING_STRATEGIES.map(s => (
                <div key={s.strategy} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                  <div className={cn('h-3 w-3 rounded-full mt-1 flex-shrink-0', s.color)} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">{s.strategy}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'picking' && (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Picking #</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Strategy</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium">Warehouse</th>
                  <th className="pb-2 pr-3 font-medium">Partner</th>
                  <th className="pb-2 pr-3 font-medium">Picker</th>
                  <th className="pb-2 pr-3 font-medium">Priority</th>
                  <th className="pb-2 pr-3 font-medium">Lines/Qty Progress</th>
                  <th className="pb-2 pr-3 font-medium">Pick Path</th>
                  <th className="pb-2 pr-3 font-medium">Timing</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {PICKING_TASKS_DATA.map(t => {
                  const linePct = t.totalLines > 0 ? Math.round((t.pickedLines / t.totalLines) * 100) : 0
                  return (
                    <tr key={t.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 pr-3 font-mono text-xs font-semibold">{t.pickingNumber}<div className="text-xs text-muted-foreground font-sans">{t.pickingDate}</div><div className="text-xs text-muted-foreground font-sans">{t.referenceNumber} · {t.waveNumber}</div></td>
                      <td className="py-3 pr-3"><Badge className={cn('text-xs', FULFILLMENT_TYPE_COLORS[t.fulfillmentType])}>{t.fulfillmentType}</Badge></td>
                      <td className="py-3 pr-3"><Badge className={cn('text-xs', PICKING_STRATEGY_COLORS[t.pickingStrategy])}>{t.pickingStrategy}</Badge></td>
                      <td className="py-3 pr-3"><Badge className={cn('text-xs', PICKING_STATUS_COLORS[t.status])}>{t.status}</Badge></td>
                      <td className="py-3 pr-3 text-xs">{t.warehouseName}</td>
                      <td className="py-3 pr-3 text-xs">{t.partnerName}</td>
                      <td className="py-3 pr-3 text-xs">{t.pickerName}</td>
                      <td className="py-3 pr-3"><Badge className={cn('text-xs', FULFILLMENT_PRIORITY_COLORS[t.priority])}>{t.priority}</Badge></td>
                      <td className="py-3 pr-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={cn('h-full', linePct === 100 ? 'bg-emerald-500' : linePct > 0 ? 'bg-purple-500' : 'bg-slate-300')} style={{ width: `${linePct}%` }} />
                          </div>
                          <span className="text-xs font-medium">{t.pickedLines}/{t.totalLines}L</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{t.pickedQty}/{t.totalQty} qty</div>
                      </td>
                      <td className="py-3 pr-3 text-xs">{t.totalDistanceM} m<div className="text-muted-foreground">est {t.estTimeMin}m</div></td>
                      <td className="py-3 pr-3 text-xs">{t.pickDurationMin !== null ? `${t.pickDurationMin} min` : <span className="text-muted-foreground italic">not started</span>}</td>
                      <td className="py-3">
                        {t.status === 'IN_PROGRESS' ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Complete</Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Types:</span>
            {Object.keys(FULFILLMENT_TYPE_COLORS).slice(0, 6).map(t => (
              <Badge key={t} className={cn('text-xs', FULFILLMENT_TYPE_COLORS[t])}>{t}</Badge>
            ))}
            <span className="ml-3">Strategies:</span>
            {Object.keys(PICKING_STRATEGY_COLORS).slice(0, 6).map(s => (
              <Badge key={s} className={cn('text-xs', PICKING_STRATEGY_COLORS[s])}>{s}</Badge>
            ))}
            <span className="ml-3">Statuses:</span>
            {Object.keys(PICKING_STATUS_COLORS).slice(0, 7).map(s => (
              <Badge key={s} className={cn('text-xs', PICKING_STATUS_COLORS[s])}>{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {tab === 'packing' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><PackageCheck className="h-5 w-5" /> Packing Jobs</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {PACKING_JOBS_DATA.map(j => (
                <Card key={j.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn('text-xs', PACKING_JOB_STATUS_COLORS[j.status])}>{j.status}</Badge>
                        <Badge className={cn('text-xs', VERIFICATION_COLORS[j.verificationStatus])}>{j.verificationStatus}</Badge>
                        {j.labelPrinted ? <Badge variant="outline" className="text-xs text-emerald-700"><Printer className="h-3 w-3 mr-1 inline" />Label</Badge> : <Badge variant="outline" className="text-xs text-amber-700"><Printer className="h-3 w-3 mr-1 inline" />No Label</Badge>}
                      </div>
                      <p className="font-mono text-sm font-bold">{j.jobNumber}</p>
                      <p className="text-xs text-muted-foreground">Picking: {j.pickingTaskNumber} · Station: {j.stationCode}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <PackageCheck className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-2 rounded-md bg-muted/50">
                      <p className="text-muted-foreground">Packer</p>
                      <p className="font-semibold text-xs">{j.packerName}</p>
                    </div>
                    <div className="p-2 rounded-md bg-muted/50">
                      <p className="text-muted-foreground">Started</p>
                      <p className="font-semibold text-xs">{j.startedAt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cartons</p>
                      <p className="font-semibold">{j.cartonCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight / Volume</p>
                      <p className="font-semibold">{j.totalWeightKg} kg · {j.totalVolumeM3} m³</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">{j.durationMinutes !== null ? `${j.durationMinutes} min` : <span className="italic">in progress</span>}</span>
                    {j.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Complete</Button>
                    )}
                    {j.status === 'READY_TO_SHIP' && <Badge variant="outline" className="text-xs text-emerald-700">Ready</Badge>}
                    {j.status === 'LABELED' && <Badge variant="outline" className="text-xs text-blue-700">Labeled</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Boxes className="h-5 w-5" /> Packing Stations</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {PACKING_STATIONS_DATA.map(s => (
                <Card key={s.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn('text-xs', STATION_TYPE_COLORS[s.stationType])}>{s.stationType}</Badge>
                        <Badge className={cn('text-xs', STATION_STATUS_COLORS[s.status])}>{s.status}</Badge>
                      </div>
                      <p className="font-mono text-sm font-bold">{s.stationCode}</p>
                      <p className="text-xs text-muted-foreground">{s.stationName}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Boxes className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-semibold">{s.currentJobs}/{s.maxConcurrentJobs} jobs</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Pack Time</p>
                      <p className="font-semibold">{s.avgPackTimeMin} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Jobs Completed</p>
                      <p className="font-semibold">{s.totalJobsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warehouse</p>
                      <p className="font-semibold text-xs">{s.warehouseId}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 border-t pt-2">
                    {s.hasLabelPrinter && <Badge variant="outline" className="text-xs"><Printer className="h-3 w-3 mr-1 inline" />Label</Badge>}
                    {s.hasScale && <Badge variant="outline" className="text-xs"><Scale className="h-3 w-3 mr-1 inline" />Scale</Badge>}
                    {s.hasBarcodeScanner && <Badge variant="outline" className="text-xs"><ScanLine className="h-3 w-3 mr-1 inline" />Scanner</Badge>}
                    {s.hasConveyor && <Badge variant="outline" className="text-xs"><ArrowRight className="h-3 w-3 mr-1 inline" />Conveyor</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'cartons' && (
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Box className="h-5 w-5" /> Cartons</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Carton #</th>
                    <th className="pb-2 pr-3 font-medium">Barcode</th>
                    <th className="pb-2 pr-3 font-medium">Type</th>
                    <th className="pb-2 pr-3 font-medium">Packing Job</th>
                    <th className="pb-2 pr-3 font-medium">Products</th>
                    <th className="pb-2 pr-3 font-medium">Units</th>
                    <th className="pb-2 pr-3 font-medium">Weight (kg)</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CARTONS_DATA.map(c => (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 pr-3 font-mono text-xs font-semibold">{c.cartonNumber}</td>
                      <td className="py-3 pr-3 font-mono text-xs"><Barcode className="h-3 w-3 mr-1 inline" />{c.barcode}</td>
                      <td className="py-3 pr-3"><Badge className={cn('text-xs', CARTON_CATEGORY_COLORS[c.cartonCategoryId])}>{c.cartonTypeName}</Badge></td>
                      <td className="py-3 pr-3 font-mono text-xs">{c.packingJobNumber}</td>
                      <td className="py-3 pr-3 text-xs">{c.productCount} SKUs</td>
                      <td className="py-3 pr-3 text-xs font-semibold">{c.totalUnits}</td>
                      <td className="py-3 pr-3 text-xs">{c.weightKg}</td>
                      <td className="py-3"><Badge className={cn('text-xs', CARTON_STATUS_COLORS[c.status])}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Statuses:</span>
              {Object.keys(CARTON_STATUS_COLORS).map(s => (
                <Badge key={s} className={cn('text-xs', CARTON_STATUS_COLORS[s])}>{s}</Badge>
              ))}
            </div>
          </Card>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Box className="h-5 w-5" /> Carton Types</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {CARTON_TYPES_DATA.map(c => (
                <Card key={c.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn('text-xs', CARTON_CATEGORY_COLORS[c.cartonCategory])}>{c.cartonCategory}</Badge>
                        <Badge variant="outline" className="text-xs text-emerald-700">{c.status}</Badge>
                      </div>
                      <p className="font-mono text-sm font-bold">{c.cartonCode}</p>
                      <p className="text-xs text-muted-foreground">{c.cartonName}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted border border-dashed border-muted-foreground/30">
                      <Box className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Dimensions</p>
                      <p className="font-semibold text-xs">{c.lengthCm}×{c.widthCm}×{c.heightCm} cm</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume</p>
                      <p className="font-semibold text-xs">{c.volumeM3} m³</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Weight</p>
                      <p className="font-semibold text-xs">{c.maxWeightKg} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Empty Weight</p>
                      <p className="font-semibold text-xs">{c.emptyWeightKg} kg</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'labels' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {SHIPPING_LABELS_DATA.map(l => (
              <Card key={l.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', LABEL_TYPE_COLORS[l.labelType])}>{l.labelType}</Badge>
                      <Badge className={cn('text-xs', PRINT_STATUS_COLORS[l.printStatus])}>{l.printStatus}</Badge>
                      <Badge variant="outline" className="text-xs">{l.format}</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold">{l.labelNumber}</p>
                    <p className="text-xs text-muted-foreground">{l.labelDate} · {l.carrierName}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Recipient</p>
                    <p className="font-semibold text-xs">{l.shipToName}</p>
                    <p className="text-xs text-muted-foreground">{l.shipToAddress}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Partner</p>
                    <p className="font-semibold text-xs">{l.partnerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Content Summary</p>
                    <p className="text-xs">{l.contentSummary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-semibold">{l.totalWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cartons</p>
                    <p className="font-semibold">{l.totalCartons}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tracking</p>
                    <p className="font-mono text-xs font-semibold">{l.trackingNumber || <span className="italic text-muted-foreground">pending</span>}</p>
                  </div>
                </div>
                {l.packingJobNumber && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <PackageCheck className="h-3 w-3" />
                    <span>Packing Job: {l.packingJobNumber}{l.cartonNumber ? ` · Carton: ${l.cartonNumber}` : ''}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 flex-shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">Future Carrier Integrations <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Planned</Badge></h3>
                <p className="text-sm text-muted-foreground mb-4">Multi-carrier integration roadmap — each carrier has its own API for label generation, rate shopping, tracking, and pickup scheduling. The Shipping Label engine generates the label in the carrier-specific format (PDF for standard, ZPL for Zebra thermal printers) and submits to the carrier API.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'Shiprocket', desc: 'Multi-carrier aggregator — 17+ carriers, rate shopping, automated allocation', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
                    { name: 'Blue Dart', desc: 'Air priority — express domestic, FedEx-aligned network', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
                    { name: 'Delhivery', desc: 'Surface + air — pan-India, e-commerce specialization', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
                    { name: 'DTDC', desc: 'Pan-India — retail network, COD, hyperlocal', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
                    { name: 'FedEx', desc: 'International express — air freight, customs clearance', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
                    { name: 'DHL', desc: 'International standard — global network, B2B export', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
                  ].map(c => (
                    <div key={c.name} className="p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn('text-xs', c.color)}>{c.name}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Dispatch, Shipping & Load Management Module (Sprint 27) ──
type DispatchTab = 'overview' | 'dispatches' | 'vehicles' | 'documents' | 'gateexit'

const DISPATCH_TYPE_COLORS: Record<string, string> = {
  RETAIL_DISPATCH: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  DISTRIBUTOR_DISPATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  RESTAURANT_REPLENISHMENT: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  BRANCH_TRANSFER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  EXPORT_SHIPMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  COURIER_SHIPMENT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DIRECT_DELIVERY: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  CUSTOMER_PICKUP: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
  VENDOR_RETURN: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const DISPATCH_STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-slate-500 text-white',
  VEHICLE_ASSIGNED: 'bg-cyan-600 text-white',
  LOADING: 'bg-purple-600 text-white',
  LOADED: 'bg-indigo-600 text-white',
  SEALED: 'bg-amber-600 text-white',
  GATE_EXIT: 'bg-teal-600 text-white',
  DISPATCHED: 'bg-emerald-600 text-white',
  DELIVERED: 'bg-emerald-700 text-white',
  CANCELLED: 'bg-red-600 text-white',
  EXCEPTION: 'bg-rose-700 text-white',
}

const DISPATCH_PRIORITY_COLORS: Record<string, string> = {
  EMERGENCY: 'bg-red-600 text-white',
  HIGH: 'bg-amber-500 text-white',
  NORMAL: 'bg-blue-500 text-white',
  LOW: 'bg-slate-400 text-white',
}

const VEHICLE_TYPE_COLORS: Record<string, string> = {
  TRUCK: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  CONTAINER: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  REFRIGERATED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  TEMPO: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  FLATBED: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  VAN: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  MINI_TRUCK: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const VEHICLE_OWNERSHIP_COLORS: Record<string, string> = {
  OWN_FLEET: 'bg-blue-600 text-white',
  THIRD_PARTY: 'bg-amber-500 text-white',
  COURIER: 'bg-purple-600 text-white',
  RENTAL: 'bg-slate-400 text-white',
}

const VEHICLE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-600 text-white',
  ASSIGNED: 'bg-cyan-600 text-white',
  LOADING: 'bg-purple-600 text-white',
  LOADED: 'bg-indigo-600 text-white',
  IN_TRANSIT: 'bg-blue-600 text-white',
  MAINTENANCE: 'bg-amber-600 text-white',
  OFFLINE: 'bg-slate-500 text-white',
}

const DOC_TYPE_COLORS: Record<string, string> = {
  DELIVERY_CHALLAN: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  TAX_INVOICE_REF: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PACKING_LIST: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  DELIVERY_MANIFEST: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  EXPORT_DOCUMENTS: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  TRANSPORT_RECEIPT: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  E_WAY_BILL_REF: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

const DOC_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  GENERATED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  PRINTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  SENT: 'bg-emerald-600 text-white',
  VOID: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const GATE_EXIT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  VERIFIED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  APPROVED: 'bg-emerald-600 text-white',
  EXITED: 'bg-emerald-700 text-white',
  DENIED: 'bg-red-600 text-white',
}

const SEAL_TYPE_COLORS: Record<string, string> = {
  BOLT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  CABLE: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  ELECTRONIC: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  TAMPER_PROOF: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

const SEAL_STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  VERIFIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  BROKEN: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  REMOVED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

// DISPATCH_ORDERS_DATA removed — use live API

// DISPATCH_VEHICLES_DATA removed — use live API

// SHIPPING_DOCUMENTS_DATA removed — use live API

// VEHICLE_SEALS_DATA removed — use live API

// GATE_EXIT_LOGS_DATA removed — use live API
