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

export function CrossDockAnalyticsModule() {
  const dailyTrend = [
    { day: 'Mon', crossDock: 18, total: 45, savings: 28500 },
    { day: 'Tue', crossDock: 22, total: 52, savings: 34200 },
    { day: 'Wed', crossDock: 28, total: 58, savings: 42800 },
    { day: 'Thu', crossDock: 24, total: 51, savings: 36500 },
    { day: 'Fri', crossDock: 32, total: 67, savings: 51200 },
    { day: 'Sat', crossDock: 19, total: 41, savings: 29800 },
    { day: 'Sun', crossDock: 12, total: 28, savings: 18400 },
  ]
  const maxTotal = Math.max(...dailyTrend.map(d => d.total))

  const topProducts = [
    { product: 'Shwet Idli Batter', crossDockOps: 42, storageAvoided: 92, savings: 18400 },
    { product: 'Kaju Katli 500g', crossDockOps: 28, storageAvoided: 76, savings: 12800 },
    { product: 'Mysore Pak 250g', crossDockOps: 24, storageAvoided: 68, savings: 9600 },
    { product: 'Gulab Jamun 1kg', crossDockOps: 18, storageAvoided: 52, savings: 7200 },
    { product: 'Dry Fruit Mix', crossDockOps: 15, storageAvoided: 45, savings: 6800 },
  ]

  const supplierPerf = [
    { supplier: 'Sudhamrit Foods Pvt', onTime: 96, avgDelay: 4, crossDockEligible: 92 },
    { supplier: 'Mysore Sweets Co', onTime: 91, avgDelay: 8, crossDockEligible: 85 },
    { supplier: 'Shwet Idli Batter', onTime: 98, avgDelay: 2, crossDockEligible: 95 },
    { supplier: 'Cold Chain Logistics', onTime: 88, avgDelay: 12, crossDockEligible: 78 },
    { supplier: 'Banu Sweets Supplier', onTime: 82, avgDelay: 18, crossDockEligible: 68 },
  ]

  const carrierPerf = [
    { carrier: 'VRL Logistics', onTime: 94, avgTurnaround: 48, util: 78 },
    { carrier: 'Blue Dart', onTime: 97, avgTurnaround: 32, util: 85 },
    { carrier: 'In-House Fleet', onTime: 99, avgTurnaround: 28, util: 92 },
    { carrier: 'Delhivery', onTime: 92, avgTurnaround: 38, util: 71 },
    { carrier: 'Cold Chain Logistics', onTime: 88, avgTurnaround: 52, util: 64 },
  ]

  const totalCrossDock = dailyTrend.reduce((a, d) => a + d.crossDock, 0)
  const totalOps = dailyTrend.reduce((a, d) => a + d.total, 0)
  const totalSavings = dailyTrend.reduce((a, d) => a + d.savings, 0)

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Cross-Dock Analytics</h2><p className="text-sm text-muted-foreground mt-1">Success rate · storage avoidance · cost savings · supplier &amp; carrier performance</p></div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Cross-Dock Rate', value: `${((totalCrossDock / totalOps) * 100).toFixed(1)}%`, icon: <ArrowLeftRight className="h-5 w-5 text-purple-600" />, change: '+3%' },
          { label: 'Storage Avoided', value: '426 ops', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, change: '+12%' },
          { label: 'Cost Saved (7d)', value: `₹${totalSavings.toLocaleString('en-IN')}`, icon: <IndianRupee className="h-5 w-5 text-emerald-700" />, change: '+18%' },
          { label: 'Avg Handling Saved', value: '78m / op', icon: <Clock className="h-5 w-5 text-blue-600" />, change: '+5m' },
          { label: 'Success Rate', value: '94.2%', icon: <Target className="h-5 w-5 text-orange-600" />, change: '+1.2%' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between"><div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{s.icon}</div><span className="text-xs text-emerald-600">{s.change}</span></div>
            <p className="text-xs text-muted-foreground mt-2">{s.label}</p><p className="text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Daily Cross-Dock vs Total Operations — Last 7 Days</h3>
        <div className="flex items-end justify-between gap-3 h-56">
          {dailyTrend.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-mono text-emerald-700">₹{(d.savings / 1000).toFixed(1)}k</div>
              <div className="w-full bg-muted/40 rounded-t-md overflow-hidden flex-1 flex items-end relative">
                <div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 absolute bottom-0" style={{ height: `${(d.total / maxTotal) * 100}%` }} />
                <div className="w-full bg-gradient-to-t from-purple-700 to-purple-500 absolute bottom-0" style={{ height: `${(d.crossDock / maxTotal) * 100}%` }} />
              </div>
              <div className="text-xs">{d.day}</div>
              <div className="text-[10px] text-muted-foreground">{d.crossDock}/{d.total}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-purple-500 rounded" />Cross-Dock Ops</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500 rounded" />Total Ops</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-600 rounded" />Cost Saved (₹k)</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Cross-Docked Products */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Top Cross-Docked Products</h3>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.product} className="flex items-center gap-3 p-2 border rounded">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-600 text-white' : 'bg-muted'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.product}</div>
                  <div className="text-[10px] text-muted-foreground">{p.crossDockOps} ops · {p.storageAvoided}% storage avoided</div>
                </div>
                <div className="text-right"><div className="text-sm font-bold text-emerald-700">₹{p.savings.toLocaleString('en-IN')}</div><div className="text-[10px] text-muted-foreground">saved</div></div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Predictions */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white"><Brain className="h-5 w-5" /></div>
            <div><h3 className="font-semibold text-sm">AI Predictions — Future Roadmap</h3><p className="text-xs text-muted-foreground">Predictive analytics for cross-dock optimization</p></div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 bg-white/50 rounded"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><div><strong>Dock Prediction:</strong> ML model forecasts dock availability 2 hours ahead — recommend reallocating DOCK-04 maintenance to off-peak (15:00-16:00).</div></div>
            <div className="flex items-start gap-2 p-2 bg-white/50 rounded"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><div><strong>Vehicle Arrival Prediction:</strong> Suppliers with &gt;15 min avg delay (Banu Sweets) — auto-pad appointment slots by 20 min buffer.</div></div>
            <div className="flex items-start gap-2 p-2 bg-white/50 rounded"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><div><strong>Congestion Prediction:</strong> Friday 14:00-17:00 is peak yard congestion — pre-stage outbound vehicles 30 min earlier.</div></div>
            <div className="flex items-start gap-2 p-2 bg-white/50 rounded"><Sparkles className="h-3 w-3 text-purple-600 mt-0.5" /><div><strong>Auto Cross-Dock Suggestion:</strong> Shwet Idli Batter has 95% cross-dock eligibility — enable auto-cross-dock rule for all future inbound.</div></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Supplier Performance</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr><th className="text-left px-4 py-2 font-medium">Supplier</th><th className="text-left px-4 py-2 font-medium">On-Time %</th><th className="text-left px-4 py-2 font-medium">Avg Delay</th><th className="text-left px-4 py-2 font-medium">CD Eligible</th></tr></thead>
              <tbody>
                {supplierPerf.map(s => (
                  <tr key={s.supplier} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs font-medium">{s.supplier}</td>
                    <td className="px-4 py-2"><div className="flex items-center gap-2"><span className="font-mono text-xs w-10">{s.onTime}%</span><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${s.onTime > 95 ? 'bg-emerald-500' : s.onTime > 88 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.onTime}%` }} /></div></div></td>
                    <td className="px-4 py-2 font-mono text-xs"><span className={s.avgDelay > 15 ? 'text-rose-600 font-bold' : s.avgDelay > 8 ? 'text-amber-600' : 'text-emerald-600'}>{s.avgDelay}m</span></td>
                    <td className="px-4 py-2 font-mono text-xs">{s.crossDockEligible}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-semibold">Carrier Performance</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr><th className="text-left px-4 py-2 font-medium">Carrier</th><th className="text-left px-4 py-2 font-medium">On-Time %</th><th className="text-left px-4 py-2 font-medium">Turnaround</th><th className="text-left px-4 py-2 font-medium">Utilization</th></tr></thead>
              <tbody>
                {carrierPerf.map(c => (
                  <tr key={c.carrier} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs font-medium">{c.carrier}</td>
                    <td className="px-4 py-2 font-mono text-xs"><span className={c.onTime > 95 ? 'text-emerald-600 font-bold' : c.onTime > 90 ? 'text-amber-600' : 'text-rose-600'}>{c.onTime}%</span></td>
                    <td className="px-4 py-2 font-mono text-xs">{c.avgTurnaround}m</td>
                    <td className="px-4 py-2"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${c.util > 80 ? 'bg-emerald-500' : c.util > 65 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${c.util}%` }} /></div><span className="font-mono text-xs">{c.util}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><Award className="h-5 w-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Chief Architect Recommendation — Auto Cross-Docking for Sudhamrit</h3>
            <p className="text-xs text-muted-foreground mt-1">For high-demand fresh products like Shwet Idli Batter, dairy-based sweets, and other short-shelf-life items, enable Automatic Cross-Docking. When the supplier truck arrives, the system detects pending retail/restaurant orders and routes inventory directly from receiving dock to dispatch dock — skipping warehouse storage entirely. This reduces handling cost, storage space usage, product aging, and delivery lead time — critical for fresh products.</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white/60 rounded"><div className="text-lg font-bold text-emerald-700">−42%</div><div className="text-[10px] text-muted-foreground">Handling Cost</div></div>
              <div className="p-2 bg-white/60 rounded"><div className="text-lg font-bold text-blue-700">−68%</div><div className="text-[10px] text-muted-foreground">Product Aging</div></div>
              <div className="p-2 bg-white/60 rounded"><div className="text-lg font-bold text-purple-700">−55%</div><div className="text-[10px] text-muted-foreground">Delivery Lead Time</div></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// SPRINT 30 — WAREHOUSE RESOURCE, EQUIPMENT & MAINTENANCE
// Epic 1: Equipment Master · Epic 2: Forklift · Epic 3: Scanners
// Epic 4: Battery · Epic 5: Maintenance · Epic 6: Breakdown · Epic 7: Cert
// ═════════════════════════════════════════════════════════

// ─── Epic 1: Equipment Master Module ────────────────────
