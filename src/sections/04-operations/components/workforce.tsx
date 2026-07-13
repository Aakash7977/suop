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
import { attendanceApi as workforceApi } from '@/api'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function WorkforceModule() {
  const { hasPermission } = useAuthStore()
  const [view, setView] = useState<'operators' | 'shifts' | 'attendance'>('operators')

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true); setError('')
      try {
        const res = await workforceApi.listAttendance({ page: 1, search: search || undefined })
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

  const operators = [
    { id: 'O1', code: 'OP-001', name: 'Rajesh Kumar', shift: 'Morning', shiftTime: '06:00-14:00', zone: 'C-Picking', skill: 'EXPERT', rating: 92, status: 'ACTIVE', online: true, today: 14, week: 78, accuracy: 98.5, util: 87, certs: ['FORKLIFT', 'REACH_TRUCK', 'SCANNER'] },
    { id: 'O2', code: 'OP-002', name: 'Anita Sharma', shift: 'Morning', shiftTime: '06:00-14:00', zone: 'B-Bulk', skill: 'ADVANCED', rating: 85, status: 'ACTIVE', online: true, today: 11, week: 65, accuracy: 97.2, util: 82, certs: ['FORKLIFT', 'STACKER'] },
    { id: 'O3', code: 'OP-003', name: 'Suresh Mehta', shift: 'Morning', shiftTime: '06:00-14:00', zone: 'E-Dispatch', skill: 'EXPERT', rating: 88, status: 'ACTIVE', online: true, today: 18, week: 92, accuracy: 99.1, util: 94, certs: ['FORKLIFT', 'REACH_TRUCK'] },
    { id: 'O4', code: 'OP-004', name: 'Lakshmi V.', shift: 'Evening', shiftTime: '14:00-22:00', zone: 'D-Pack', skill: 'INTERMEDIATE', rating: 72, status: 'ACTIVE', online: true, today: 8, week: 41, accuracy: 96.0, util: 68, certs: ['SCANNER'] },
    { id: 'O5', code: 'OP-005', name: 'Ramesh Patel', shift: 'Evening', shiftTime: '14:00-22:00', zone: 'B-Bulk', skill: 'ADVANCED', rating: 79, status: 'ACTIVE', online: false, today: 0, week: 52, accuracy: 95.5, util: 0, certs: ['FORKLIFT', 'STACKER', 'SCANNER'] },
    { id: 'O6', code: 'OP-006', name: 'Mahesh Reddy', shift: 'Night', shiftTime: '22:00-06:00', zone: 'A-Receiving', skill: 'ADVANCED', rating: 81, status: 'ACTIVE', online: true, today: 6, week: 38, accuracy: 97.8, util: 71, certs: ['REACH_TRUCK', 'SCANNER'] },
    { id: 'O7', code: 'OP-007', name: 'Anil Kumar', shift: 'Morning', shiftTime: '06:00-14:00', zone: 'A-Receiving', skill: 'INTERMEDIATE', rating: 68, status: 'ON_LEAVE', online: false, today: 0, week: 22, accuracy: 94.3, util: 0, certs: ['SCANNER'] },
    { id: 'O8', code: 'OP-008', name: 'Priya Nair', shift: 'Morning', shiftTime: '06:00-14:00', zone: 'D-Pack', skill: 'BEGINNER', rating: 55, status: 'ACTIVE', online: true, today: 4, week: 18, accuracy: 92.0, util: 54, certs: ['SCANNER'] },
  ]

  const shifts = [
    { code: 'SHIFT-M', name: 'Morning Shift', start: '06:00', end: '14:00', break: '10:00-10:15', operators: 5, present: 4, late: 1, absent: 0, type: 'REGULAR' },
    { code: 'SHIFT-E', name: 'Evening Shift', start: '14:00', end: '22:00', break: '18:00-18:15', operators: 3, present: 2, late: 0, absent: 0, type: 'REGULAR' },
    { code: 'SHIFT-N', name: 'Night Shift', start: '22:00', end: '06:00', break: '02:00-02:15', operators: 2, present: 2, late: 0, absent: 0, type: 'REGULAR' },
    { code: 'SHIFT-OT', name: 'Overtime Pool', start: '—', end: '—', break: '—', operators: 4, present: 1, late: 0, absent: 0, type: 'OVERTIME' },
  ]

  const attendance = operators.map(o => ({
    code: o.code, name: o.name, shift: o.shift,
    checkIn: o.status === 'ACTIVE' && o.online ? (o.shift === 'Morning' ? '05:58' : o.shift === 'Evening' ? '14:02' : '22:05') : '—',
    checkOut: '—',
    status: o.status === 'ON_LEAVE' ? 'ON_LEAVE' : (o.online ? 'PRESENT' : 'ABSENT'),
    workedHours: o.online ? 6.5 : 0, late: 0, ot: 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Workforce Management</h2><p className="text-sm text-muted-foreground mt-1">Operator skill matrix · shifts · attendance · KPI tracking</p></div>
        {hasPermission('hr:create') && <Button size="sm"><Plus className="mr-2 h-4 w-4" />New Operator</Button>}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Operators', value: operators.length, icon: <Users className="h-5 w-5 text-blue-600" /> },
          { label: 'Online Now', value: operators.filter(o => o.online).length, icon: <Radio className="h-5 w-5 text-emerald-600" /> },
          { label: 'On Leave', value: operators.filter(o => o.status === 'ON_LEAVE').length, icon: <Calendar className="h-5 w-5 text-amber-600" /> },
          { label: 'Avg Accuracy', value: `${(operators.reduce((a, o) => a + o.accuracy, 0) / operators.length).toFixed(1)}%`, icon: <CheckCircle2 className="h-5 w-5 text-purple-600" /> },
          { label: 'Avg Utilization', value: `${(operators.reduce((a, o) => a + o.util, 0) / operators.length).toFixed(0)}%`, icon: <Gauge className="h-5 w-5 text-orange-600" /> },
        ].map(s => (
          <Card key={s.label} className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{s.icon}</div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div></div></Card>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex rounded-md border overflow-hidden w-fit">
        {(['operators', 'shifts', 'attendance'] as const).map(v => <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 text-sm font-medium capitalize ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{v}</button>)}
      </div>

      {/* Operators View */}
      {view === 'operators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operators.map(o => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${o.online ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>{o.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className="font-semibold text-sm">{o.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{o.code}</div>
                  </div>
                </div>
                <span className={`h-2 w-2 rounded-full ${o.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Shift:</span><span>{o.shift} ({o.shiftTime})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zone:</span><span className="font-mono">{o.zone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Skill:</span><Badge variant="outline" className="text-[10px]">{o.skill}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Today / Week:</span><span className="font-mono">{o.today} / {o.week}</span></div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div><div className="flex justify-between text-[10px] text-muted-foreground"><span>Accuracy</span><span>{o.accuracy}%</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${o.accuracy}%` }} /></div></div>
                <div><div className="flex justify-between text-[10px] text-muted-foreground"><span>Utilization</span><span>{o.util}%</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${o.util}%` }} /></div></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {o.certs.map(c => <span key={c} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono">{c}</span>)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Shifts View */}
      {view === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shifts.map(s => (
            <Card key={s.code} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Clock className="h-5 w-5 text-indigo-700" /></div><div><div className="font-semibold">{s.name}</div><div className="text-xs text-muted-foreground font-mono">{s.start} → {s.end}</div></div></div>
                <Badge variant={s.type === 'OVERTIME' ? 'default' : 'secondary'} className="text-[10px]">{s.type}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center my-3">
                <div className="p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Operators</p><p className="text-lg font-bold">{s.operators}</p></div>
                <div className="p-2 bg-emerald-50 rounded"><p className="text-xs text-muted-foreground">Present</p><p className="text-lg font-bold text-emerald-700">{s.present}</p></div>
                <div className="p-2 bg-amber-50 rounded"><p className="text-xs text-muted-foreground">Late</p><p className="text-lg font-bold text-amber-700">{s.late}</p></div>
              </div>
              <div className="text-xs text-muted-foreground">Break: <span className="font-mono">{s.break}</span></div>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance View */}
      {view === 'attendance' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr>
                <th className="text-left px-4 py-3 font-medium">Operator</th><th className="text-left px-4 py-3 font-medium">Shift</th>
                <th className="text-left px-4 py-3 font-medium">Check In</th><th className="text-left px-4 py-3 font-medium">Check Out</th>
                <th className="text-left px-4 py-3 font-medium">Worked Hrs</th><th className="text-left px-4 py-3 font-medium">Late (min)</th>
                <th className="text-left px-4 py-3 font-medium">OT (min)</th><th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {attendance.map(a => {
                  const b = s28BadgeForStatus(a.status)
                  return (
                    <tr key={a.code} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3"><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground font-mono">{a.code}</div></td>
                      <td className="px-4 py-3 text-xs">{a.shift}</td>
                      <td className="px-4 py-3 font-mono text-xs">{a.checkIn}</td>
                      <td className="px-4 py-3 font-mono text-xs">{a.checkOut}</td>
                      <td className="px-4 py-3 font-mono">{a.workedHours}</td>
                      <td className="px-4 py-3 font-mono">{a.late}</td>
                      <td className="px-4 py-3 font-mono">{a.ot}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Epic 5: Equipment Management Module ────────────────
