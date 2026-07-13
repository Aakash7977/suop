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
import { fulfillmentApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function WavePlanningModule() {
  const [view, setView] = useState<'list' | 'kanban' | 'gantt'>('list')

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true); setError('')
      try {
        const res = await fulfillmentApi.listWaves({ page: 1, search: search || undefined })
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
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [showCreate, setShowCreate] = useState(false)

  const waves = [
    { id: 'W1', num: 'WAVE-2026-001', type: 'MULTI_ORDER', priority: 'HIGH', status: 'IN_PROGRESS', warehouse: 'WH-MUM-MAIN', zone: 'C-Picking', orders: 24, lines: 156, tasks: 42, plannedStart: '09:00', plannedFinish: '11:30', actualStart: '09:02', progress: 64, operator: 'Rajesh K.' },
    { id: 'W2', num: 'WAVE-2026-002', type: 'CARRIER', priority: 'NORMAL', status: 'RELEASED', warehouse: 'WH-MUM-MAIN', zone: 'C-Picking', orders: 18, lines: 89, tasks: 28, plannedStart: '11:30', plannedFinish: '13:30', actualStart: null, progress: 0, operator: '—' },
    { id: 'W3', num: 'WAVE-2026-003', type: 'ZONE', priority: 'NORMAL', status: 'COMPLETED', warehouse: 'WH-DEL-NORTH', zone: 'B-Bulk', orders: 12, lines: 67, tasks: 19, plannedStart: '07:00', plannedFinish: '09:00', actualStart: '06:58', progress: 100, operator: 'Anita S.' },
    { id: 'W4', num: 'WAVE-2026-004', type: 'EMERGENCY', priority: 'EMERGENCY', status: 'IN_PROGRESS', warehouse: 'WH-MUM-MAIN', zone: 'C-Picking', orders: 4, lines: 22, tasks: 8, plannedStart: '10:15', plannedFinish: '10:45', actualStart: '10:14', progress: 88, operator: 'Suresh M.' },
    { id: 'W5', num: 'WAVE-2026-005', type: 'BATCH', priority: 'NORMAL', status: 'DRAFT', warehouse: 'WH-BLR-CENTRAL', zone: 'D-Pack', orders: 32, lines: 210, tasks: 56, plannedStart: '14:00', plannedFinish: '17:00', actualStart: null, progress: 0, operator: '—' },
    { id: 'W6', num: 'WAVE-2026-006', type: 'ROUTE', priority: 'HIGH', status: 'RELEASED', warehouse: 'WH-MUM-MAIN', zone: 'E-Dispatch', orders: 15, lines: 78, tasks: 22, plannedStart: '13:00', plannedFinish: '15:00', actualStart: null, progress: 0, operator: '—' },
    { id: 'W7', num: 'WAVE-2026-007', type: 'PRIORITY', priority: 'HIGH', status: 'ON_HOLD', warehouse: 'WH-HYD-WEST', zone: 'C-Picking', orders: 9, lines: 45, tasks: 14, plannedStart: '12:00', plannedFinish: '14:00', actualStart: null, progress: 0, operator: '—' },
    { id: 'W8', num: 'WAVE-2026-008', type: 'MULTI_ORDER', priority: 'NORMAL', status: 'COMPLETED', warehouse: 'WH-MUM-MAIN', zone: 'C-Picking', orders: 21, lines: 134, tasks: 38, plannedStart: '08:00', plannedFinish: '10:00', actualStart: '07:59', progress: 100, operator: 'Rajesh K.' },
  ]

  const filteredWaves = waves.filter(w =>
    (filterStatus === 'ALL' || w.status === filterStatus) &&
    (filterType === 'ALL' || w.type === filterType)
  )

  const stats = [
    { label: 'Total Waves', value: waves.length, icon: <Waves className="h-5 w-5 text-blue-600" />, cls: 'from-blue-500 to-blue-600' },
    { label: 'In Progress', value: waves.filter(w => w.status === 'IN_PROGRESS').length, icon: <Activity className="h-5 w-5 text-amber-600" />, cls: 'from-amber-500 to-amber-600' },
    { label: 'Released', value: waves.filter(w => w.status === 'RELEASED').length, icon: <PlayCircle className="h-5 w-5 text-emerald-600" />, cls: 'from-emerald-500 to-emerald-600' },
    { label: 'Draft', value: waves.filter(w => w.status === 'DRAFT').length, icon: <FileText className="h-5 w-5 text-slate-600" />, cls: 'from-slate-500 to-slate-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wave Planning Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Group orders into waves · auto-generate tasks · optimize operator assignment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="mr-2 h-4 w-4" />New Wave</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${s.cls} flex items-center justify-center text-white`}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Wave Panel */}
      {showCreate && (
        <Card className="p-4 border-blue-300 bg-blue-50/50">
          <h3 className="font-semibold mb-3">Create New Wave</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div><Label className="text-xs">Wave Type</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>SINGLE_ORDER</option><option>MULTI_ORDER</option><option>BATCH</option><option>ZONE</option><option>CARRIER</option><option>ROUTE</option><option>PRIORITY</option><option>EMERGENCY</option></select></div>
            <div><Label className="text-xs">Warehouse</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md">{S28_WAREHOUSES.map(w => <option key={w}>{w}</option>)}</select></div>
            <div><Label className="text-xs">Priority</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>EMERGENCY</option><option>HIGH</option><option>NORMAL</option><option>LOW</option></select></div>
            <div><Label className="text-xs">Strategy</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>FIFO</option><option>FEFO</option><option>LIFO</option><option>PRIORITY</option><option>ZONE_SEQUENCE</option></select></div>
            <div><Label className="text-xs">Planned Start</Label><Input type="time" className="mt-1" /></div>
            <div><Label className="text-xs">Planned Finish</Label><Input type="time" className="mt-1" /></div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Create Wave</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option><option value="RELEASED">Released</option><option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option><option value="ON_HOLD">On Hold</option><option value="CANCELLED">Cancelled</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
          <option value="ALL">All Types</option>
          <option value="SINGLE_ORDER">Single Order</option><option value="MULTI_ORDER">Multi Order</option><option value="BATCH">Batch</option>
          <option value="ZONE">Zone</option><option value="CARRIER">Carrier</option><option value="ROUTE">Route</option>
          <option value="PRIORITY">Priority</option><option value="EMERGENCY">Emergency</option>
        </select>
        <div className="flex-1" />
        <div className="flex rounded-md border overflow-hidden">
          {(['list', 'kanban', 'gantt'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-medium capitalize ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{v}</button>
          ))}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Wave #</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                  <th className="text-left px-4 py-3 font-medium">Warehouse / Zone</th>
                  <th className="text-left px-4 py-3 font-medium">Orders</th>
                  <th className="text-left px-4 py-3 font-medium">Tasks</th>
                  <th className="text-left px-4 py-3 font-medium">Schedule</th>
                  <th className="text-left px-4 py-3 font-medium">Operator</th>
                  <th className="text-left px-4 py-3 font-medium">Progress</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaves.map(w => {
                  const b = s28BadgeForStatus(w.status)
                  return (
                    <tr key={w.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{w.num}</td>
                      <td className="px-4 py-3"><span className="text-xs font-mono px-2 py-0.5 bg-muted rounded">{w.type}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${s28PriorityBadge(w.priority)}`}>{w.priority}</span></td>
                      <td className="px-4 py-3 text-xs"><div className="font-medium">{w.warehouse}</div><div className="text-muted-foreground">{w.zone}</div></td>
                      <td className="px-4 py-3 font-mono">{w.orders}</td>
                      <td className="px-4 py-3 font-mono">{w.tasks}</td>
                      <td className="px-4 py-3 text-xs"><div>{w.plannedStart} → {w.plannedFinish}</div>{w.actualStart && <div className="text-emerald-600">Started: {w.actualStart}</div>}</td>
                      <td className="px-4 py-3 text-xs">{w.operator}</td>
                      <td className="px-4 py-3 min-w-[100px]"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${w.progress === 100 ? 'bg-emerald-500' : w.progress > 0 ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${w.progress}%` }} /></div><span className="text-xs font-mono w-8">{w.progress}%</span></div></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                      <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['DRAFT', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map(col => {
            const colWaves = filteredWaves.filter(w => w.status === col)
            return (
              <div key={col} className="space-y-2">
                <div className="flex items-center justify-between px-2"><span className="text-xs font-semibold uppercase">{col.replace('_', ' ')}</span><Badge variant="secondary">{colWaves.length}</Badge></div>
                {colWaves.map(w => (
                  <Card key={w.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold text-blue-700">{w.num}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${s28PriorityBadge(w.priority)}`}>{w.priority}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{w.type.replace('_', ' ')}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Orders:</span><span className="font-mono">{w.orders}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tasks:</span><span className="font-mono">{w.tasks}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">WH:</span><span className="font-mono">{w.warehouse}</span></div>
                    </div>
                    {w.progress > 0 && <div className="mt-2 flex items-center gap-2"><div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${w.progress}%` }} /></div><span className="text-[10px] font-mono">{w.progress}%</span></div>}
                    <div className="mt-2 pt-2 border-t text-[10px] text-muted-foreground">{w.plannedStart} → {w.plannedFinish}</div>
                  </Card>
                ))}
                {colWaves.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No waves</div>}
              </div>
            )
          })}
        </div>
      )}

      {/* Gantt View */}
      {view === 'gantt' && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Wave Schedule — Today</h3>
          <div className="space-y-2">
            {filteredWaves.map(w => {
              const startHour = parseInt(w.plannedStart.split(':')[0]) + parseInt(w.plannedStart.split(':')[1]) / 60
              const endHour = parseInt(w.plannedFinish.split(':')[0]) + parseInt(w.plannedFinish.split(':')[1]) / 60
              const leftPct = ((startHour - 6) / 12) * 100
              const widthPct = ((endHour - startHour) / 12) * 100
              const colors: Record<string, string> = { IN_PROGRESS: 'bg-blue-500', RELEASED: 'bg-emerald-500', COMPLETED: 'bg-slate-400', DRAFT: 'bg-slate-300', ON_HOLD: 'bg-orange-500', CANCELLED: 'bg-rose-500' }
              return (
                <div key={w.id} className="flex items-center gap-2">
                  <div className="w-32 text-xs font-mono truncate">{w.num}</div>
                  <div className="flex-1 relative h-7 bg-muted/40 rounded">
                    <div className="absolute top-0 h-full rounded flex items-center px-2 text-[10px] text-white font-medium" style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%`, backgroundColor: '' }}>
                      <div className={`absolute inset-0 rounded ${colors[w.status] || 'bg-slate-400'}`} />
                      <span className="relative z-10 truncate">{w.orders} ord · {w.tasks} tasks</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-between text-xs text-muted-foreground mt-2 pl-32 pr-2">
              {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
        </Card>
      )}

      {/* Wave Types Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-sm">Wave Type Strategies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { type: 'SINGLE_ORDER', desc: 'One order, one wave — used for emergency or VIP dispatch', icon: <Package className="h-4 w-4" /> },
            { type: 'MULTI_ORDER', desc: 'Multiple orders grouped for batch picking efficiency', icon: <Layers3 className="h-4 w-4" /> },
            { type: 'BATCH', desc: 'Large batch processing for high-volume fulfillment', icon: <Boxes className="h-4 w-4" /> },
            { type: 'ZONE', desc: 'All orders within a specific warehouse zone', icon: <MapPin className="h-4 w-4" /> },
            { type: 'CARRIER', desc: 'Grouped by shipping carrier for dock optimization', icon: <Truck className="h-4 w-4" /> },
            { type: 'ROUTE', desc: 'Delivery route-based grouping for logistics', icon: <Route className="h-4 w-4" /> },
            { type: 'PRIORITY', desc: 'High-priority orders processed first', icon: <Flag className="h-4 w-4" /> },
            { type: 'EMERGENCY', desc: 'Override all other waves — immediate dispatch', icon: <Siren className="h-4 w-4" /> },
          ].map(t => (
            <div key={t.type} className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1 text-blue-700">{t.icon}<span className="font-mono font-semibold">{t.type}</span></div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 2: Task Queue Module ──────────────────────────
