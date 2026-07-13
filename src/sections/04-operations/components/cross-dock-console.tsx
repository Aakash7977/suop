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

export function CrossDockConsoleModule() {
  const { hasPermission } = useAuthStore()
  const [filter, setFilter] = useState<string>('ALL')
  const [showCreate, setShowCreate] = useState(false)

  const crossDockOrders = [
    { id: 'CD1', num: 'CD-2026-001', type: 'PRE_DISTRIBUTIVE', status: 'IN_PROGRESS', priority: 'HIGH', supplier: 'Sudhamrit Foods Pvt', outbound: 'SO-2026-1024 (Retail Replen)', partner: 'Sudhamrit Retail Bandra', inDock: 'DOCK-02', outDock: 'DOCK-07', lines: 12, qty: '480 PCS', weight: 142.5, expectedIn: '10:30', actualIn: '10:32', expectedOut: '11:30', storageAvoided: true, costSaved: 1850, timeSaved: 90, progress: 65 },
    { id: 'CD2', num: 'CD-2026-002', type: 'OPPORTUNISTIC', status: 'COMPLETED', priority: 'NORMAL', supplier: 'Mysore Sweets Co', outbound: 'SO-2026-1031 (Distributor)', partner: 'Mumbai Distributors', inDock: 'DOCK-01', outDock: 'DOCK-05', lines: 8, qty: '240 PCS', weight: 78.2, expectedIn: '08:00', actualIn: '07:58', expectedOut: '09:00', storageAvoided: true, costSaved: 1240, timeSaved: 75, progress: 100 },
    { id: 'CD3', num: 'CD-2026-003', type: 'PRE_DISTRIBUTIVE', status: 'PLANNED', priority: 'EMERGENCY', supplier: 'Shwet Idli Batter', outbound: 'SO-2026-1042 (Restaurant Replen)', partner: 'Sudhamrit Restaurant Hub', inDock: 'DOCK-02', outDock: 'DOCK-08', lines: 5, qty: '60 BOX', weight: 36.0, expectedIn: '14:00', actualIn: null, expectedOut: '15:00', storageAvoided: true, costSaved: 950, timeSaved: 60, progress: 0 },
    { id: 'CD4', num: 'CD-2026-004', type: 'POST_DISTRIBUTIVE', status: 'OUTBOUND_LOADED', priority: 'NORMAL', supplier: 'Multiple', outbound: 'SO-2026-1038 (Multi-Partner)', partner: 'Multi-partner consolidation', inDock: 'DOCK-03', outDock: 'DOCK-06', lines: 18, qty: '720 PCS', weight: 215.8, expectedIn: '09:00', actualIn: '08:55', expectedOut: '12:00', storageAvoided: true, costSaved: 2680, timeSaved: 120, progress: 88 },
    { id: 'CD5', num: 'CD-2026-005', type: 'PRE_DISTRIBUTIVE', status: 'INBOUND_ARRIVED', priority: 'HIGH', supplier: 'Cold Chain Logistics', outbound: 'SO-2026-1045 (Cold Chain)', partner: 'Sudhamrit Cold Hub', inDock: 'DOCK-COLD-01', outDock: 'DOCK-COLD-02', lines: 6, qty: '120 BOX', weight: 84.0, expectedIn: '11:00', actualIn: '11:05', expectedOut: '12:30', storageAvoided: true, costSaved: 1620, timeSaved: 90, progress: 25 },
    { id: 'CD6', num: 'CD-2026-006', type: 'OPPORTUNISTIC', status: 'EXCEPTION', priority: 'HIGH', supplier: 'Banu Sweets Supplier', outbound: 'SO-2026-1029 (Retail)', partner: 'Sudhamrit Retail Andheri', inDock: 'DOCK-04', outDock: 'DOCK-06', lines: 4, qty: '48 PCS', weight: 28.5, expectedIn: '13:00', actualIn: '13:10', expectedOut: '14:00', storageAvoided: false, costSaved: 0, timeSaved: 0, progress: 30 },
  ]

  const filtered = crossDockOrders.filter(o => filter === 'ALL' || o.status === filter || o.type === filter)

  const stats = [
    { label: 'Cross-Dock Orders', value: crossDockOrders.length, color: 'text-blue-600' },
    { label: 'In Progress', value: crossDockOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'INBOUND_ARRIVED' || o.status === 'OUTBOUND_LOADED').length, color: 'text-amber-600' },
    { label: 'Completed', value: crossDockOrders.filter(o => o.status === 'COMPLETED').length, color: 'text-emerald-600' },
    { label: 'Exceptions', value: crossDockOrders.filter(o => o.status === 'EXCEPTION').length, color: 'text-rose-600' },
    { label: 'Storage Avoided', value: `${crossDockOrders.filter(o => o.storageAvoided).length}/${crossDockOrders.length}`, color: 'text-purple-600' },
    { label: 'Cost Saved (₹)', value: crossDockOrders.reduce((a, o) => a + o.costSaved, 0).toLocaleString('en-IN'), color: 'text-emerald-700' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Cross-Dock Console</h2><p className="text-sm text-muted-foreground mt-1">Direct inbound-to-outbound routing · zero warehouse storage · cost &amp; time savings</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>{hasPermission('shipment:create') && <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="mr-2 h-4 w-4" />New Cross-Dock</Button>}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Backend Not Available</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Requires: <code className="font-mono">New cross-dock/ module</code>. Data shown is mock. See MISSING_BACKEND_ITEMS.md.</p>
        </div>
      </div>
      </div>

      {/* Workflow Diagram */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
        <h3 className="font-semibold mb-3 text-sm">Cross-Dock Workflow</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {['Inbound Shipment', 'Order Matching', 'Cross-Dock Eligible?', 'Outbound Dock', 'Load Vehicle', 'Dispatch'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-white border rounded-md font-medium">{step}</div>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-blue-600" />}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">No warehouse storage is created for cross-docked inventory. Inventory moves directly from inbound to outbound dock.</p>
      </Card>

      {showCreate && (
        <Card className="p-4 border-blue-300 bg-blue-50/50">
          <h3 className="font-semibold mb-3">Create Cross-Dock Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div><Label className="text-xs">Cross-Dock Type</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>PRE_DISTRIBUTIVE</option><option>POST_DISTRIBUTIVE</option><option>OPPORTUNISTIC</option></select></div>
            <div><Label className="text-xs">Inbound ASN</Label><Input className="mt-1" placeholder="ASN-2026-XXX" /></div>
            <div><Label className="text-xs">Outbound Order</Label><Input className="mt-1" placeholder="SO-2026-XXX" /></div>
            <div><Label className="text-xs">Priority</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>EMERGENCY</option><option>HIGH</option><option>NORMAL</option><option>LOW</option></select></div>
            <div><Label className="text-xs">Inbound Dock</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>DOCK-01</option><option>DOCK-02</option><option>DOCK-03</option><option>DOCK-COLD-01</option></select></div>
            <div><Label className="text-xs">Outbound Dock</Label><select className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"><option>DOCK-05</option><option>DOCK-06</option><option>DOCK-07</option><option>DOCK-COLD-02</option></select></div>
            <div className="md:col-span-2 flex items-end gap-2"><Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Create Cross-Dock</Button><Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {['ALL', 'PLANNED', 'INBOUND_ARRIVED', 'IN_PROGRESS', 'OUTBOUND_LOADED', 'COMPLETED', 'EXCEPTION'].map(f => <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1 rounded-full border ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>{f.replace(/_/g, ' ')}</button>)}
      </div>

      <div className="space-y-2">
        {filtered.map(o => {
          const b = s28BadgeForStatus(o.status)
          const typeColors: Record<string, string> = { PRE_DISTRIBUTIVE: 'bg-blue-100 text-blue-700', POST_DISTRIBUTIVE: 'bg-purple-100 text-purple-700', OPPORTUNISTIC: 'bg-emerald-100 text-emerald-700' }
          return (
            <Card key={o.id} className={`p-4 ${o.status === 'EXCEPTION' ? 'border-rose-300 bg-rose-50/30' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-1 self-stretch rounded-full ${o.priority === 'EMERGENCY' ? 'bg-red-500' : o.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <div className="w-40">
                  <div className="font-mono text-xs font-semibold text-blue-700">{o.num}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[o.type]}`}>{o.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{o.outbound}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Supplier: {o.supplier} · Partner: {o.partner}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 font-mono"><span className="text-emerald-600">{o.inDock}</span><ArrowRight className="h-3 w-3" /><span className="text-amber-600">{o.outDock}</span></div>
                </div>
                <div className="w-32 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Lines:</span><span className="font-mono">{o.lines}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Qty:</span><span className="font-mono">{o.qty}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Weight:</span><span className="font-mono">{o.weight}kg</span></div>
                </div>
                <div className="w-32 text-xs">
                  <div>In: <span className="font-mono">{o.expectedIn}</span>{o.actualIn && <span className="text-emerald-600 ml-1">({o.actualIn})</span>}</div>
                  <div>Out: <span className="font-mono">{o.expectedOut}</span></div>
                  {o.progress > 0 && <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${o.progress}%` }} /></div>}
                </div>
                <div className="w-32 text-xs">
                  {o.storageAvoided ? (<div className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Storage Avoided</div>) : <div className="text-rose-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Storage Used</div>}
                  {o.costSaved > 0 && <div className="text-muted-foreground mt-0.5">Saved: ₹{o.costSaved}</div>}
                  {o.timeSaved > 0 && <div className="text-muted-foreground">Time: +{o.timeSaved}m</div>}
                </div>
                <div className="w-24"><span className={`text-xs px-2 py-1 rounded ${b.cls} block text-center`}>{b.label}</span></div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Cross-Dock Rules Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-sm">Cross-Dock Eligibility Rules</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { rule: 'SAME_DAY_DISPATCH', desc: 'Outbound order scheduled for same day as inbound arrival', icon: <Calendar className="h-4 w-4" /> },
            { rule: 'PRIORITY_CUSTOMER', desc: 'VIP customer orders get cross-dock priority', icon: <Star className="h-4 w-4" /> },
            { rule: 'RETAIL_REPLENISHMENT', desc: 'Fast-moving retail SKUs bypass storage', icon: <Store className="h-4 w-4" /> },
            { rule: 'RESTAURANT_REPLENISHMENT', desc: 'Fresh ingredients for restaurant hubs', icon: <UtensilsCrossed className="h-4 w-4" /> },
            { rule: 'TRANSFER_ORDERS', desc: 'Inter-warehouse transfers via cross-dock', icon: <ArrowLeftRight className="h-4 w-4" /> },
            { rule: 'DISTRIBUTOR_ORDERS', desc: 'Large distributor dispatches consolidated', icon: <Truck className="h-4 w-4" /> },
            { rule: 'TEMPERATURE_SENSITIVE', desc: 'Cold-chain goods minimize time in yard', icon: <Thermometer className="h-4 w-4" /> },
            { rule: 'PERISHABLE_GOODS', desc: 'Short shelf-life items (batter, dairy sweets)', icon: <Snowflake className="h-4 w-4" /> },
          ].map(r => (
            <div key={r.rule} className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1 text-blue-700">{r.icon}<span className="font-mono font-semibold text-[10px]">{r.rule}</span></div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 3: Truck Queue Module ─────────────────────────
