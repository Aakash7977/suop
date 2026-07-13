/**
 * Section 03 — Master Data Management
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 *
 * This file was extracted verbatim from page.tsx and wrapped with proper
 * TypeScript imports so it can live outside the monolithic file.
 * The original JSX structure, classes, colors, icons, and layout are
 * preserved 1:1 so the rendered UI is pixel-identical.
 *
 * Wire-up layer (live API calls, loading/error states, permission gating)
 * is added incrementally — see Git history for evolution.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, UtensilsCrossed as UtensilsCrossedIcon, DollarSign,
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
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice, FileSearch,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
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
import { s28BadgeForStatus } from '../utils/helpers'
import { toast } from '@/hooks/use-toast'

type CommercialTab = 'overview' | 'priceLists' | 'tax' | 'discounts' | 'promotions' | 'futurePrices' | 'approvals' | 'cost' | 'rules' | 'resolution'

export function CommercialEngineModule() {
  const [tab, setTab] = useState<CommercialTab>('overview')
  const tabs: Array<{ key: CommercialTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'priceLists', label: 'Price Lists', icon: <Tag className="h-4 w-4" /> },
    { key: 'tax', label: 'GST & Tax', icon: <Percent className="h-4 w-4" /> },
    { key: 'discounts', label: 'Discounts', icon: <Calculator className="h-4 w-4" /> },
    { key: 'promotions', label: 'Promotions', icon: <Gift className="h-4 w-4" /> },
    { key: 'futurePrices', label: 'Future Prices', icon: <Clock className="h-4 w-4" /> },
    { key: 'approvals', label: 'Approvals', icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: 'cost', label: 'Cost & Margin', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'rules', label: 'Commercial Rules', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'resolution', label: 'Price Resolution', icon: <Sparkles className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-amber-950 via-orange-900 to-red-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <IndianRupee className="h-7 w-7" /> Enterprise Commercial Engine
            </h2>
            <p className="text-amber-200 text-sm max-w-3xl">
              Unified pricing, taxation, discount, promotion, and margin engine. Every channel
              (Retail POS, Restaurant POS, ERP, E-commerce) consumes the same pricing logic via the
              Price Resolution Service. No module calculates prices independently.
            </p>
          </div>
          <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Sprint 8</Badge>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <CommercialOverviewTab />}
      {tab === 'priceLists' && <PriceListsTab />}
      {tab === 'tax' && <TaxTab />}
      {tab === 'discounts' && <DiscountsTab />}
      {tab === 'promotions' && <PromotionsTab />}
      {tab === 'futurePrices' && <FuturePricesTab />}
      {tab === 'approvals' && <ApprovalsTab />}
      {tab === 'cost' && <CostMarginTab />}
      {tab === 'rules' && <RulesTab />}
      {tab === 'resolution' && <ResolutionTab />}
    </div>
  )
}

function CommercialOverviewTab() {
  const stats = [
    { label: 'Price Lists', value: '6', sub: '5 Active', icon: <Tag className="h-5 w-5 text-blue-600" /> },
    { label: 'Tax Groups', value: '6', sub: 'GST 0/5/12/18/28 + Cess', icon: <Percent className="h-5 w-5 text-emerald-600" /> },
    { label: 'Discount Rules', value: '5', sub: '5 Active', icon: <Calculator className="h-5 w-5 text-purple-600" /> },
    { label: 'Promotions', value: '5', sub: '4 Active · 1 Scheduled', icon: <Gift className="h-5 w-5 text-pink-600" /> },
    { label: 'Future Prices', value: '4', sub: '2 Pending Approval', icon: <Clock className="h-5 w-5 text-amber-600" /> },
    { label: 'Pending Approvals', value: '3', sub: 'Avg SLA 7 days', icon: <ClipboardCheck className="h-5 w-5 text-red-600" /> },
    { label: 'Cost Profiles', value: '4', sub: 'All Tracked', icon: <TrendingUp className="h-5 w-5 text-indigo-600" /> },
    { label: 'Commercial Rules', value: '5', sub: 'Enforced', icon: <ShieldCheck className="h-5 w-5 text-teal-600" /> },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><IndianRupee className="h-5 w-5" /> Price Resolution Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// Every channel calls the same endpoint:</p>
          <p className="text-blue-600">POST /api/commercial/resolve-price</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> Base Price (from Price List, scoped by Company/Branch/Customer)</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> Quantity Break (volume discount tier)</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> Apply Discounts (stackable rules evaluated)</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> Apply Promotions (channel-specific, priority sorted)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> Compute Taxable Amount = ListPrice − Discounts − Promotions</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> Compute Tax (CGST + SGST intra-state, IGST inter-state)</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> Final Price = Taxable + Tax</p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-5 gap-2 text-center text-xs">
          {['Retail POS', 'Restaurant POS', 'ERP', 'E-commerce', 'Customer Portal'].map(ch => (
            <div key={ch} className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <p className="font-semibold text-amber-700 dark:text-amber-400">{ch}</p>
              <p className="text-muted-foreground mt-1">Consumes via API</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function PriceListsTab() {
  const lists = [
    { code: 'PL-RETAIL-MUM', name: 'Mumbai Retail Price List', type: 'RETAIL', currency: 'INR', validFrom: '2026-01-01', priority: 100, status: 'ACTIVE', taxMode: 'INCLUSIVE', items: 248 },
    { code: 'PL-WS-DIST', name: 'Wholesale Distributor Price List', type: 'WHOLESALE', currency: 'INR', validFrom: '2026-01-01', priority: 200, status: 'ACTIVE', taxMode: 'EXCLUSIVE', items: 180 },
    { code: 'PL-RST-MUM', name: 'Restaurant Menu Price List', type: 'RESTAURANT', currency: 'INR', validFrom: '2026-01-01', priority: 100, status: 'ACTIVE', taxMode: 'INCLUSIVE', items: 65 },
    { code: 'PL-CORP-TATA', name: 'Tata Corporate Contract', type: 'CORPORATE', currency: 'INR', validFrom: '2026-04-01', priority: 50, status: 'ACTIVE', taxMode: 'EXCLUSIVE', items: 92 },
    { code: 'PL-FEST-DIWALI', name: 'Diwali Festival Price List', type: 'FESTIVAL', currency: 'INR', validFrom: '2026-10-15', priority: 30, status: 'SCHEDULED', taxMode: 'INCLUSIVE', items: 45 },
    { code: 'PL-EXP-DUBAI', name: 'Dubai Export Price List', type: 'EXPORT', currency: 'USD', validFrom: '2026-01-01', priority: 150, status: 'ACTIVE', taxMode: 'EXCLUSIVE', items: 38 },
  ]
  const typeColor: Record<string, string> = {
    RETAIL: 'bg-blue-100 text-blue-800', WHOLESALE: 'bg-purple-100 text-purple-800',
    RESTAURANT: 'bg-orange-100 text-orange-800', CORPORATE: 'bg-emerald-100 text-emerald-800',
    FESTIVAL: 'bg-pink-100 text-pink-800', EXPORT: 'bg-amber-100 text-amber-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Price Lists</h3>
          <p className="text-xs text-muted-foreground mt-1">10 supported types: Retail, Wholesale, Distributor, Export, Restaurant, Online, Corporate, Employee, Festival, Special Contract</p>
        </div>
        <Button size="sm" onClick={() => toast({ title: 'Create Price List — POST /api/v1/sales/pricing/price-lists' })}><Plus className="mr-1 h-4 w-4" /> New Price List</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Name</th><th className="font-medium">Type</th>
            <th className="font-medium">Currency</th><th className="font-medium">Tax Mode</th><th className="font-medium">Priority</th>
            <th className="font-medium">Items</th><th className="font-medium">Valid From</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {lists.map(l => (
              <tr key={l.code} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{l.code}</td>
                <td className="font-medium">{l.name}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[l.type])}>{l.type}</span></td>
                <td className="font-mono">{l.currency}</td>
                <td><Badge variant="outline" className="text-xs">{l.taxMode}</Badge></td>
                <td className="font-mono">{l.priority}</td>
                <td>{l.items}</td>
                <td className="text-xs text-muted-foreground">{l.validFrom}</td>
                <td><Badge className={l.status === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-500'}>{l.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TaxTab() {
  const groups = [
    { code: 'GST-0', name: 'GST Exempt (Fresh Foods)', type: 'EXEMPT', rates: [], status: 'ACTIVE' },
    { code: 'GST-5', name: 'GST 5% (Food Items)', type: 'GST', rates: [{ c: 'CGST', r: 2.5 }, { c: 'SGST', r: 2.5 }], status: 'ACTIVE' },
    { code: 'GST-12', name: 'GST 12% (Processed Foods)', type: 'GST', rates: [{ c: 'CGST', r: 6 }, { c: 'SGST', r: 6 }], status: 'ACTIVE' },
    { code: 'GST-18', name: 'GST 18% (Beverages)', type: 'GST', rates: [{ c: 'CGST', r: 9 }, { c: 'SGST', r: 9 }], status: 'ACTIVE' },
    { code: 'GST-28', name: 'GST 28% (Luxury/Sin)', type: 'GST', rates: [{ c: 'CGST', r: 14 }, { c: 'SGST', r: 14 }], status: 'ACTIVE' },
    { code: 'CESS-5', name: 'Cess 5% over GST', type: 'CESS', rates: [{ c: 'CESS', r: 5 }], status: 'ACTIVE' },
  ]
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-semibold">GST & Tax Engine</h3>
          <p className="text-xs text-muted-foreground mt-1">Supports GST (CGST/SGST/IGST), CESS, TCS, TDS (future). HSN/SAC mapped per product. Tax rules engine for state/type/category-based overrides.</p></div>
          <Button size="sm" onClick={() => toast({ title: 'Create Tax Config — POST /api/v1/sales/pricing/tax-configs' })}><Plus className="mr-1 h-4 w-4" /> New Tax Group</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map(g => (
            <div key={g.code} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{g.code}</p>
                  <p className="font-medium">{g.name}</p>
                </div>
                <Badge variant="outline" className="text-xs">{g.type}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.rates.length === 0 ? <Badge variant="outline" className="text-xs">EXEMPT (0%)</Badge> :
                  g.rates.map(r => <Badge key={r.c} variant="outline" className="text-xs font-mono">{r.c}: {r.r}%</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Tax Calculation Modes</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border rounded-lg p-3"><p className="font-medium text-sm mb-1">Exclusive (Tax added on top)</p><p className="text-xs text-muted-foreground">Used for: Wholesale, Export, B2B. Price ₹100 + 5% GST = ₹105</p></div>
          <div className="border rounded-lg p-3"><p className="font-medium text-sm mb-1">Inclusive (Tax included in price)</p><p className="text-xs text-muted-foreground">Used for: Retail, Restaurant, E-commerce. MRP ₹105 includes ₹5 GST</p></div>
        </div>
      </Card>
    </div>
  )
}

function DiscountsTab() {
  const discounts = [
    { code: 'DISC-5PCT', name: '5% General Discount', type: 'PERCENTAGE', value: 5, kind: 'PERCENTAGE', max: 50, stackable: true, status: 'ACTIVE' },
    { code: 'DISC-FLAT-50', name: 'Flat ₹50 Off (above ₹500)', type: 'FLAT', value: 50, kind: 'AMOUNT', max: null, stackable: false, status: 'ACTIVE' },
    { code: 'DISC-VOL-10', name: 'Volume Discount 10% (10+ units)', type: 'VOLUME', value: 10, kind: 'PERCENTAGE', max: 200, stackable: false, status: 'ACTIVE' },
    { code: 'DISC-EMP-15', name: 'Employee Discount 15%', type: 'CUSTOMER', value: 15, kind: 'PERCENTAGE', max: null, stackable: false, status: 'ACTIVE' },
    { code: 'DISC-SENIOR', name: 'Senior Citizen 7%', type: 'CUSTOMER', value: 7, kind: 'PERCENTAGE', max: null, stackable: false, status: 'ACTIVE' },
  ]
  const typeColor: Record<string, string> = {
    PERCENTAGE: 'bg-blue-100 text-blue-800', FLAT: 'bg-purple-100 text-purple-800',
    VOLUME: 'bg-amber-100 text-amber-800', CUSTOMER: 'bg-emerald-100 text-emerald-800',
    COUPON: 'bg-pink-100 text-pink-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Discount Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">9 supported types: Flat, Percentage, Buy X Get Y, Volume, Combo, Category, Brand, Customer, Coupon</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Discount — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Discount</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Name</th><th className="font-medium">Type</th>
            <th className="font-medium">Value</th><th className="font-medium">Max</th><th className="font-medium">Stackable</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d.code} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{d.code}</td>
                <td className="font-medium">{d.name}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[d.type])}>{d.type}</span></td>
                <td className="font-mono">{d.kind === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}</td>
                <td className="font-mono text-xs">{d.max !== null ? `₹${d.max}` : '—'}</td>
                <td>{d.stackable ? <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">Yes</Badge> : <Badge variant="outline" className="text-xs">No</Badge>}</td>
                <td><Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{d.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function PromotionsTab() {
  const promos = [
    { code: 'PROMO-DIWALI-2026', name: 'Diwali Dhamaka 15% Off', type: 'AUTOMATIC', offer: 'PERCENT_OFF', value: 15, channels: ['RETAIL_POS', 'ECOMMERCE'], validFrom: '2026-10-15', validTo: '2026-11-15', used: 234, max: 1000, priority: 50, status: 'SCHEDULED' },
    { code: 'PROMO-WEEKEND', name: 'Weekend Special 10%', type: 'AUTOMATIC', offer: 'PERCENT_OFF', value: 10, channels: ['RETAIL_POS'], validFrom: '2026-01-01', validTo: null, used: 1582, max: null, priority: 100, status: 'ACTIVE' },
    { code: 'PROMO-HAPPY-HRS', name: 'Happy Hours 20% (4-7PM)', type: 'AUTOMATIC', offer: 'PERCENT_OFF', value: 20, channels: ['RESTAURANT_POS'], validFrom: '2026-01-01', validTo: null, used: 765, max: null, priority: 80, status: 'ACTIVE' },
    { code: 'PROMO-BUY2GET1', name: 'Buy 2 Get 1 Free Sweets', type: 'AUTOMATIC', offer: 'BUY_X_GET_Y', value: null, channels: ['RETAIL_POS'], validFrom: '2026-01-01', validTo: null, used: 423, max: null, priority: 90, status: 'ACTIVE' },
    { code: 'PROMO-COUPON-WELCOME', name: 'Welcome Coupon ₹100 Off', type: 'COUPON', offer: 'FLAT_OFF', value: 100, channels: ['ALL'], validFrom: '2026-01-01', validTo: null, used: 891, max: 5000, priority: 70, status: 'ACTIVE' },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Promotions</h3>
        <p className="text-xs text-muted-foreground mt-1">4 supported types: Automatic, Manual, Coupon, Loyalty. Channel-scoped. Priority sorted. Conflict detection rules.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Promotion — POST /api/v1/sales/pricing/promotions' })}><Plus className="mr-1 h-4 w-4" /> New Promotion</Button>
      </div>
      <div className="space-y-3">
        {promos.map(p => (
          <div key={p.code} className="border rounded-lg p-3 hover:bg-muted/40">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs text-muted-foreground">{p.code}</p>
                  <Badge variant="outline" className="text-xs">{p.type}</Badge>
                  <Badge variant="outline" className="text-xs">{p.offer}</Badge>
                  {p.value !== null && <Badge variant="outline" className="text-xs font-mono">{p.offer === 'PERCENT_OFF' ? `${p.value}%` : `₹${p.value}`}</Badge>}
                </div>
                <p className="font-medium">{p.name}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span>Channels: {p.channels.join(', ')}</span>
                  <span>·</span><span>Valid: {p.validFrom} → {p.validTo || 'ongoing'}</span>
                  <span>·</span><span>Used: {p.used}{p.max ? ` / ${p.max}` : ''}</span>
                </div>
              </div>
              <Badge className={p.status === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-500'}>{p.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FuturePricesTab() {
  const prices = [
    { product: 'Kaju Katli 500g', current: 540, future: 580, change: 7.41, effective: '2026-08-01', auto: true, status: 'PENDING_APPROVAL' },
    { product: 'Soan Cake 1kg', current: 880, future: 920, change: 4.55, effective: '2026-08-01', auto: true, status: 'APPROVED' },
    { product: 'Mixed Namkeen 200g', current: 85, future: 80, change: -5.88, effective: '2026-07-15', auto: true, status: 'SCHEDULED' },
    { product: 'Gulab Jamun 1kg', current: 420, future: 450, change: 7.14, effective: '2026-09-01', auto: true, status: 'PENDING_APPROVAL' },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Future Pricing</h3>
        <p className="text-xs text-muted-foreground mt-1">Scheduled price changes with automatic activation, expiry, rollback, and approval workflow.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Schedule Price Change — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> Schedule Price Change</Button>
      </div>
      <div className="space-y-3">
        {prices.map(p => (
          <div key={p.product} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{p.product}</p>
              <Badge className={p.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-600' : p.status === 'SCHEDULED' ? 'bg-blue-600 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-500'}>{p.status.replace('_', ' ')}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono">₹{p.current}</span>
              <ArrowRightCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">₹{p.future}</span>
              <Badge variant="outline" className={p.change > 0 ? 'text-red-600 border-red-200' : 'text-emerald-600 border-emerald-200'}>
                {p.change > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {p.change > 0 ? '+' : ''}{p.change}%
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">Effective: {p.effective}</span>
              {p.auto && <Badge variant="outline" className="text-xs">Auto-activate</Badge>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ApprovalsTab() {
  const approvals = [
    { id: 'ap-001', type: 'PRICE_LIST', name: 'Diwali Festival Price List', stage: 'PRICING_TEAM', status: 'IN_REVIEW', sla: '2026-09-15', breached: false },
    { id: 'ap-002', type: 'FUTURE_PRICE', name: 'Kaju Katli Price Change +7.41%', stage: 'FINANCE', status: 'IN_REVIEW', sla: '2026-07-20', breached: false },
    { id: 'ap-003', type: 'PROMOTION', name: 'Diwali Dhamaka 15% Off', stage: 'MANAGEMENT', status: 'IN_REVIEW', sla: '2026-09-20', breached: false },
    { id: 'ap-004', type: 'FUTURE_PRICE', name: 'Gulab Jamun Price Change +7.14%', stage: 'DRAFT', status: 'PENDING', sla: '2026-07-25', breached: false },
    { id: 'ap-005', type: 'DISCOUNT_RULE', name: 'Senior Citizen 7% Discount', stage: 'APPROVED', status: 'APPROVED', sla: '2026-06-30', breached: false },
  ]
  const stages = ['DRAFT', 'PRICING_TEAM', 'FINANCE', 'MANAGEMENT', 'APPROVED', 'PUBLISHED']
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Price Approval Workflow</h3>
      <div className="mb-4 flex items-center gap-1 text-xs">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="px-2 py-1 rounded border bg-muted/40 font-mono">{s}</div>
            {i < stages.length - 1 && <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground" />}
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {approvals.map(a => (
          <div key={a.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">{a.type}</Badge>
                <p className="font-medium text-sm">{a.name}</p>
              </div>
              <Badge className={a.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-600' : a.status === 'IN_REVIEW' ? 'bg-blue-600 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-500'}>{a.status.replace('_', ' ')}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Current Stage: <span className="font-mono font-medium text-foreground">{a.stage}</span></span>
              <span>·</span>
              <span>SLA Due: {a.sla}</span>
              {a.breached && <Badge variant="destructive" className="text-xs">SLA BREACHED</Badge>}
              {a.status !== 'APPROVED' && a.status !== 'PUBLISHED' && (
                <Button size="sm" variant="outline" className="ml-auto h-7 text-xs" onClick={() => toast({ title: 'Advance Stage — approval workflow backend pending' })}>
                  <ArrowRightCircle className="mr-1 h-3 w-3" /> Advance Stage
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CostMarginTab() {
  const profiles = [
    { product: 'Kaju Katli 500g', method: 'FIFO', purchase: 320, average: 325, fifo: 318, weighted: 327, standard: 330, last: 332, total: 350, margin: 54.29, selling: 540 },
    { product: 'Soan Cake 1kg', method: 'WEIGHTED_AVERAGE', purchase: 580, average: 585, fifo: 575, weighted: 588, standard: 590, last: 595, total: 625, margin: 28.64, selling: 880 },
    { product: 'Mixed Namkeen 200g', method: 'STANDARD', purchase: 48, average: 50, fifo: 47, weighted: 51, standard: 52, last: 49, total: 53, margin: 37.65, selling: 85 },
    { product: 'Gulab Jamun 1kg', method: 'LAST_PURCHASE', purchase: 280, average: 278, fifo: 275, weighted: 282, standard: 285, last: 290, total: 304, margin: 27.62, selling: 420 },
  ]
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-1">Cost & Margin Engine</h3>
      <p className="text-xs text-muted-foreground mb-4">4 costing methods: FIFO, Weighted Average, Standard, Last Purchase. Tracks landing cost, overhead, total cost, and computes margins in real-time.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th><th className="font-medium">Method</th>
            <th className="font-medium text-right">Purchase</th><th className="font-medium text-right">Avg</th>
            <th className="font-medium text-right">FIFO</th><th className="font-medium text-right">Wtd Avg</th>
            <th className="font-medium text-right">Std</th><th className="font-medium text-right">Last</th>
            <th className="font-medium text-right">Total</th><th className="font-medium text-right">Selling</th>
            <th className="font-medium text-right">Margin%</th>
          </tr></thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.product} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{p.product}</td>
                <td><Badge variant="outline" className="text-xs font-mono">{p.method}</Badge></td>
                <td className="text-right font-mono">₹{p.purchase}</td>
                <td className="text-right font-mono text-xs">₹{p.average}</td>
                <td className="text-right font-mono text-xs">₹{p.fifo}</td>
                <td className="text-right font-mono text-xs">₹{p.weighted}</td>
                <td className="text-right font-mono text-xs">₹{p.standard}</td>
                <td className="text-right font-mono text-xs">₹{p.last}</td>
                <td className="text-right font-mono font-semibold">₹{p.total}</td>
                <td className="text-right font-mono">₹{p.selling}</td>
                <td className="text-right font-mono"><span className={p.margin > 30 ? 'text-emerald-600 font-semibold' : p.margin > 15 ? 'text-amber-600' : 'text-red-600 font-semibold'}>{p.margin}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function RulesTab() {
  const rules = [
    { code: 'MIN-SELL-PRICE', name: 'Minimum Selling Price (Below Cost)', type: 'MIN_SELLING_PRICE', enforcement: 'HARD_BLOCK', desc: 'Selling price cannot be below cost' },
    { code: 'MAX-DISC-30', name: 'Maximum Discount 30%', type: 'MAX_DISCOUNT', enforcement: 'OVERRIDE_WITH_REASON', desc: 'Discounts above 30% require justification reason' },
    { code: 'MIN-MARGIN-15', name: 'Minimum Margin 15%', type: 'MIN_MARGIN', enforcement: 'WARN', desc: 'Warns when margin falls below 15%' },
    { code: 'HOLIDAY-MKUP', name: 'Festival Holiday Markup 5%', type: 'HOLIDAY_PRICING', enforcement: 'HARD_BLOCK', desc: 'Auto-applies 5% markup on Diwali/Holi/Christmas' },
    { code: 'CONTRACT-TATA', name: 'Tata Corporate Contract Pricing', type: 'CONTRACT_PRICING', enforcement: 'HARD_BLOCK', desc: 'Forces Tata customer to use contract price list' },
  ]
  const enfColor: Record<string, string> = {
    HARD_BLOCK: 'bg-red-100 text-red-800', OVERRIDE_WITH_REASON: 'bg-amber-100 text-amber-800', WARN: 'bg-yellow-100 text-yellow-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Commercial Rules Engine</h3>
        <p className="text-xs text-muted-foreground mt-1">Enforcement rules: Minimum Selling Price, Maximum Discount, Minimum Margin, Customer Pricing, Location Pricing, Holiday Pricing, Contract Pricing. Future: AI Dynamic Pricing, Demand Pricing.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Rule — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
      </div>
      <div className="space-y-3">
        {rules.map(r => (
          <div key={r.code} className="border rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                  <Badge variant="outline" className="text-xs">{r.type.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </div>
              <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', enfColor[r.enforcement])}>{r.enforcement.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ResolutionTab() {
  const [productId, setProductId] = useState('prd-kaju-katli')
  const [quantity, setQuantity] = useState('1')
  const [channel, setChannel] = useState('RETAIL_POS')
  const [customerId, setCustomerId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function resolve() {
    setLoading(true)
    try {
      const token = localStorage.getItem('suop_access_token') || ''
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/api/v1/sales/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          productId, productName: productId, customerId: customerId || undefined,
          channelId: channel, quantity: Number(quantity) || 1, basePrice: 540,
        }),
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
      else setResult({ error: json.message })
    } catch (e) {
      // Backend may not be running; show demo result
      setResult({
        requestId: 'demo-' + Date.now(),
        basePrice: 540,
        listPrice: Number(quantity) >= 10 ? 513 : 540,
        appliedDiscounts: [{ code: 'DISC-5PCT', name: '5% General Discount', amount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.05).toFixed(2)) }],
        appliedPromotions: channel === 'RETAIL_POS' ? [{ code: 'PROMO-WEEKEND', name: 'Weekend Special 10%', amount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.10).toFixed(2)) }] : [],
        discountAmount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.05).toFixed(2)),
        promotionAmount: channel === 'RETAIL_POS' ? Number(((Number(quantity) >= 10 ? 513 : 540) * 0.10).toFixed(2)) : 0,
        taxableAmount: Number((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)).toFixed(2),
        taxComponents: [{ component: 'CGST', rate: 2.5, amount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.025).toFixed(2)) }, { component: 'SGST', rate: 2.5, amount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.025).toFixed(2)) }],
        taxAmount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.05).toFixed(2)),
        finalPrice: Number(((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 1.05).toFixed(2),
        resolutionTrace: [
          { step: 'BASE_PRICE', source: 'PRICE_LIST', value: 540 },
          { step: 'LIST_PRICE', value: Number(quantity) >= 10 ? 513 : 540 },
          ...(Number(quantity) >= 10 ? [{ step: 'QUANTITY_BREAK', quantity: Number(quantity), discountPercent: 5, value: 513 }] : []),
          { step: 'DISCOUNTS_APPLIED', count: 1, totalAmount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.05).toFixed(2)) },
          { step: 'PROMOTIONS_APPLIED', count: channel === 'RETAIL_POS' ? 1 : 0, totalAmount: channel === 'RETAIL_POS' ? Number(((Number(quantity) >= 10 ? 513 : 540) * 0.10).toFixed(2)) : 0 },
          { step: 'TAXABLE_AMOUNT', value: Number((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)).toFixed(2) },
          { step: 'TAX_CALCULATED', mode: 'EXCLUSIVE', components: 2, totalAmount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.05).toFixed(2)) },
          { step: 'FINAL_PRICE', value: Number(((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 1.05).toFixed(2) },
        ],
        responseTimeMs: 3,
        note: 'Backend offline — showing simulated resolution. Start backend: cd mini-services/suop-backend && bun run index.ts'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Price Resolution Service</h3>
            <p className="text-xs text-muted-foreground mt-1">
              The single source of truth for pricing. Your Retail POS and Restaurant POS will call this endpoint
              instead of maintaining their own pricing logic. Returns the final price with full audit trail.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          <div><Label className="text-xs">Product ID</Label>
            <Input value={productId} onChange={e => setProductId(e.target.value)} className="font-mono text-sm" /></div>
          <div><Label className="text-xs">Quantity</Label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs">Channel</Label>
            <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm bg-background">
              <option value="RETAIL_POS">Retail POS</option>
              <option value="RESTAURANT_POS">Restaurant POS</option>
              <option value="ERP">ERP</option>
              <option value="ECOMMERCE">E-commerce</option>
              <option value="CUSTOMER_PORTAL">Customer Portal</option>
            </select></div>
          <div><Label className="text-xs">Customer ID (optional)</Label>
            <Input value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="cust-tata-001" className="font-mono text-sm" /></div>
        </div>
        <Button onClick={resolve} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resolving...</> : <><PlayCircle className="mr-2 h-4 w-4" />Resolve Price</>}
        </Button>
      </Card>

      {result && !result.error && (
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs text-muted-foreground">Final Price</p>
              <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">₹{Number(result.finalPrice).toFixed(2)}</p></div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Request ID</p>
                <p className="font-mono text-xs">{result.requestId?.slice(0, 18)}...</p>
                <p className="text-xs text-muted-foreground mt-2">Response Time</p>
                <p className="font-mono text-xs">{result.responseTimeMs}ms</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Base Price</p><p className="font-mono font-semibold">₹{Number(result.basePrice).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">List Price</p><p className="font-mono font-semibold">₹{Number(result.listPrice).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Discount</p><p className="font-mono text-red-600">−₹{Number(result.discountAmount).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Promotion</p><p className="font-mono text-red-600">−₹{Number(result.promotionAmount).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Taxable Amount</p><p className="font-mono font-semibold">₹{Number(result.taxableAmount).toFixed(2)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground">Tax Components</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {result.taxComponents?.map((tc: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs font-mono">{tc.component}: ₹{tc.amount} ({tc.rate}%)</Badge>
                  ))}
                </div>
              </div>
              <div><p className="text-xs text-muted-foreground">Tax Total</p><p className="font-mono text-blue-600">+₹{Number(result.taxAmount).toFixed(2)}</p></div>
            </div>
            {result.appliedDiscounts?.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Applied Discounts:</p>
                {result.appliedDiscounts.map((d: any, i: number) => (
                  <Badge key={i} variant="outline" className="mr-1 text-xs">{d.code}: −₹{d.amount}</Badge>
                ))}
              </div>
            )}
            {result.appliedPromotions?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Applied Promotions:</p>
                {result.appliedPromotions.map((p: any, i: number) => (
                  <Badge key={i} variant="outline" className="mr-1 text-xs bg-pink-50 dark:bg-pink-950/30">{p.code}: −₹{p.amount}</Badge>
                ))}
              </div>
            )}
            {result.note && <p className="mt-3 text-xs text-amber-600 italic">{result.note}</p>}
          </Card>

          {result.resolutionTrace && (
            <Card className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Resolution Trace (Audit Trail)</h4>
              <div className="space-y-1.5 font-mono text-xs">
                {result.resolutionTrace.map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/40">
                    <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                    <span className="font-semibold text-blue-600">{t.step}</span>
                    {t.source && <span className="text-muted-foreground">← {t.source}</span>}
                    {t.value !== undefined && <span className="ml-auto">₹{Number(t.value).toFixed(2)}</span>}
                    {t.count !== undefined && <span className="ml-auto text-muted-foreground">{t.count} applied, total ₹{t.totalAmount?.toFixed(2)}</span>}
                    {t.discountPercent && <span className="ml-auto text-muted-foreground">−{t.discountPercent}%</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
      {result?.error && (
        <Card className="p-6 border-red-200"><p className="text-red-600 text-sm">{result.error}</p></Card>
      )}
    </div>
  )
}
