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
import { pushToast, useAuthStore as useSectionAuth } from '../api/clients'

type BPTab = 'overview' | 'partners' | 'addresses' | 'contacts' | 'financial' | 'compliance' | 'groups' | 'banking' | 'relationships' | 'scorecards'

export function BusinessPartnerModule() {
  const [tab, setTab] = useState<BPTab>('overview')
  const tabs: Array<{ key: BPTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'partners', label: 'Partners', icon: <Users2 className="h-4 w-4" /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPinned className="h-4 w-4" /> },
    { key: 'contacts', label: 'Contacts', icon: <Phone className="h-4 w-4" /> },
    { key: 'financial', label: 'Financial', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'compliance', label: 'Compliance', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'groups', label: 'Groups', icon: <FolderTree className="h-4 w-4" /> },
    { key: 'banking', label: 'Banking', icon: <IndianRupee className="h-4 w-4" /> },
    { key: 'relationships', label: 'Relationships', icon: <Handshake className="h-4 w-4" /> },
    { key: 'scorecards', label: 'Scorecards', icon: <Award className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Users2 className="h-7 w-7" /> Enterprise Business Partner Platform
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              Unified master for Customers, Suppliers, Transporters, Franchisees, Corporate Clients,
              Delivery Partners, and Service Providers. One partner can play multiple roles — no duplication.
              Every module (Finance, Inventory, Sales, Purchase) references the same partner record.
            </p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 9</Badge>
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

      {tab === 'overview' && <BPOverviewTab />}
      {tab === 'partners' && <BPPartnersTab />}
      {tab === 'addresses' && <BPAddressesTab />}
      {tab === 'contacts' && <BPContactsTab />}
      {tab === 'financial' && <BPFinancialTab />}
      {tab === 'compliance' && <BPComplianceTab />}
      {tab === 'groups' && <BPGroupsTab />}
      {tab === 'banking' && <BPBankingTab />}
      {tab === 'relationships' && <BPRelationshipsTab />}
      {tab === 'scorecards' && <BPScorecardsTab />}
    </div>
  )
}

function BPOverviewTab() {
  const stats = [
    { label: 'Total Partners', value: '10', sub: 'All Active', icon: <Users2 className="h-5 w-5 text-blue-600" /> },
    { label: 'Customer Groups', value: '5', sub: 'Retail, Wholesale, Corporate, VIP, Export', icon: <FolderTree className="h-5 w-5 text-emerald-600" /> },
    { label: 'Supplier Groups', value: '5', sub: 'Raw, Packaging, Transport, Maint, Utility', icon: <Package className="h-5 w-5 text-purple-600" /> },
    { label: 'Total Credit Exposure', value: '₹2.41Cr', sub: 'Across all partners', icon: <CreditCard className="h-5 w-5 text-amber-600" /> },
    { label: 'Scorecards', value: '6', sub: 'Q2 2026 graded', icon: <Award className="h-5 w-5 text-pink-600" /> },
    { label: 'Relationships', value: '5', sub: 'Parent/subsidiary/franchise', icon: <Handshake className="h-5 w-5 text-teal-600" /> },
    { label: 'Low Risk Partners', value: '7', sub: 'Risk score &lt; 25', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
    { label: 'Medium Risk Partners', value: '3', sub: 'Risk 25-50', icon: <AlertIcon className="h-5 w-5 text-amber-600" /> },
  ]
  const roleBreakdown = [
    { role: 'CUSTOMER', count: 3, color: 'bg-blue-500' },
    { role: 'SUPPLIER', count: 4, color: 'bg-purple-500' },
    { role: 'DISTRIBUTOR', count: 2, color: 'bg-emerald-500' },
    { role: 'TRANSPORTER', count: 1, color: 'bg-amber-500' },
    { role: 'DELIVERY_PARTNER', count: 2, color: 'bg-pink-500' },
    { role: 'FRANCHISE', count: 1, color: 'bg-rose-500' },
    { role: 'CORPORATE', count: 3, color: 'bg-indigo-500' },
    { role: 'MANUFACTURER', count: 1, color: 'bg-cyan-500' },
    { role: 'RETAIL_OUTLET', count: 2, color: 'bg-teal-500' },
    { role: 'SERVICE_PROVIDER', count: 2, color: 'bg-violet-500' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: s.sub }} />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users2 className="h-5 w-5" /> Partner Role Breakdown</h3>
        <p className="text-xs text-muted-foreground mb-4">One partner can hold multiple roles. Total role assignments below.</p>
        <div className="space-y-2">
          {roleBreakdown.map(r => (
            <div key={r.role} className="flex items-center gap-3">
              <div className="w-40 text-sm font-medium">{r.role.replace(/_/g, ' ')}</div>
              <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                <div className={cn('h-full flex items-center justify-end pr-2 text-white text-xs font-medium', r.color)} style={{ width: `${(r.count / 4) * 100}%` }}>{r.count}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Handshake className="h-5 w-5 text-blue-600" /> Why Single Business Partner Master?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Modern enterprise ERPs (SAP, Oracle, Microsoft Dynamics) use a unified business partner master instead of
          separate Customer Master and Supplier Master. One organization can play multiple roles over time:
        </p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          {[
            'A supplier can later become a customer',
            'A customer can become a distributor',
            'A transporter can become a service provider',
            'A franchisee is also a retail outlet',
            'One PAN/GST record per organization',
            'Bank accounts reusable across roles',
            'Compliance certificates shared across roles',
            'Scorecards evaluate any role performance',
          ].map(benefit => (
            <div key={benefit} className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function BPPartnersTab() {
  const [partners, setPartners] = useState<Array<{ id: string; code: string; name: string; type: string; roles: string[]; gst: string; credit: number; risk: string; riskScore: number; status: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const [custRes, suppRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/api/v1/sales/customers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('suop_access_token') || ''}` }
          }).then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/api/v1/procurement/suppliers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('suop_access_token') || ''}` }
          }).then(r => r.json()).catch(() => ({ data: [] })),
        ])
        if (cancelled) return
        const customers = (custRes.data || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          code: c.customer_code as string,
          name: c.trade_name as string,
          type: 'CORPORATE',
          roles: ['CUSTOMER'],
          gst: (c.gstin as string) || '—',
          credit: Number(c.credit_limit || 0),
          risk: (c.risk_rating as string) || 'MEDIUM',
          riskScore: 0,
          status: (c.status as string) || 'ACTIVE',
        }))
        const suppliers = (suppRes.data || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          code: s.vendor_code as string,
          name: s.trade_name as string,
          type: 'COMPANY',
          roles: ['SUPPLIER'],
          gst: (s.gstin as string) || '—',
          credit: Number(s.credit_limit || 0),
          risk: (s.risk_level as string) || 'MEDIUM',
          riskScore: 0,
          status: (s.status as string) || 'ACTIVE',
        }))
        setPartners([...customers, ...suppliers])
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load partners')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = partners.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()) || p.gst.toLowerCase().includes(search.toLowerCase())
  )
  const roleColor: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-800', SUPPLIER: 'bg-purple-100 text-purple-800',
    DISTRIBUTOR: 'bg-emerald-100 text-emerald-800', TRANSPORTER: 'bg-amber-100 text-amber-800',
    DELIVERY_PARTNER: 'bg-pink-100 text-pink-800', FRANCHISE: 'bg-rose-100 text-rose-800',
    CORPORATE: 'bg-indigo-100 text-indigo-800', MANUFACTURER: 'bg-cyan-100 text-cyan-800',
    RETAIL_OUTLET: 'bg-teal-100 text-teal-800', SERVICE_PROVIDER: 'bg-violet-100 text-violet-800',
  }
  const riskColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-800', MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Business Partners</h3>
        <p className="text-xs text-muted-foreground mt-1">{loading ? 'Loading...' : `${partners.length} partners (${partners.filter(p => p.roles.includes('CUSTOMER')).length} customers, ${partners.filter(p => p.roles.includes('SUPPLIER')).length} suppliers). Filter by role or type. Duplicate GST/PAN auto-detected on create.`}</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Create Partner dialog — use Customer Master or Supplier Master for now')}><Plus className="mr-1 h-4 w-4" /> New Partner</Button>
      </div>
      <div className="mb-3 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, code, or GST..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-8" />
      </div>
      {error && <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-md p-3 mb-3">{error}</div>}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><Users2 className="h-10 w-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No partners found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Code</th><th className="font-medium">Legal Name</th>
              <th className="font-medium">Type</th><th className="font-medium">Roles</th>
              <th className="font-medium">GST</th><th className="font-medium text-right">Credit Limit</th>
              <th className="font-medium">Risk</th><th className="font-medium">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/40">
                  <td className="py-2.5 font-mono text-xs">{p.code}</td>
                  <td className="font-medium">{p.name}</td>
                  <td><Badge variant="outline" className="text-xs">{p.type}</Badge></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.roles.map(r => <span key={r} className={cn('inline-block px-1.5 py-0.5 rounded text-xs font-medium', roleColor[r])}>{r.replace(/_/g, ' ')}</span>)}
                    </div>
                  </td>
                  <td className="font-mono text-xs">{p.gst}</td>
                  <td className="text-right font-mono">{p.credit > 0 ? `₹${p.credit.toLocaleString('en-IN')}` : '—'}</td>
                  <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', riskColor[p.risk] || 'bg-slate-100')}>{p.risk}</span></td>
                  <td><Badge className={cn('text-xs', p.status === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-slate-500 hover:bg-slate-500')}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function BPAddressesTab() {
  const addresses = [
    { partner: 'Tata Consumer Products', type: 'REGISTERED_OFFICE', line1: 'Bombay House, Homi Mody Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true },
    { partner: 'Tata Consumer Products', type: 'BILLING', line1: 'Tower A, Tata Chambers', city: 'Mumbai', state: 'Maharashtra', pincode: '400020', isDefault: false },
    { partner: 'Tata Consumer Products', type: 'SHIPPING', line1: 'Plot 12, MIDC Industrial Area', city: 'Pune', state: 'Maharashtra', pincode: '411019', isDefault: false },
    { partner: 'Konkan Cashew Processors', type: 'FACTORY', line1: 'Survey 45, Ratnagiri Road', city: 'Ratnagiri', state: 'Maharashtra', pincode: '415612', isDefault: true },
    { partner: 'Konkan Cashew Processors', type: 'BILLING', line1: 'Shop 8, APMC Market', city: 'Vashi', state: 'Maharashtra', pincode: '400703', isDefault: false },
    { partner: 'Blue Dart Express', type: 'WAREHOUSE', line1: 'Hub 4, Sahara Logistics Park', city: 'Mumbai', state: 'Maharashtra', pincode: '400709', isDefault: true },
    { partner: 'Blue Dart Express', type: 'BRANCH', line1: 'Airport Road, Cargo Terminal', city: 'Bengaluru', state: 'Karnataka', pincode: '560017', isDefault: false },
    { partner: 'Sudhamrit Franchise - Andheri West', type: 'RETAIL_OUTLET', line1: 'Shop 12, Lokhandwala Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', isDefault: true },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Address Management</h3>
        <p className="text-xs text-muted-foreground mt-1">9 address types: Registered Office, Billing, Shipping, Factory, Warehouse, Branch, Restaurant, Pickup, Return. Reusable across modules.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Create Address — POST /api/v1/sales/customers/:id/addresses')}><Plus className="mr-1 h-4 w-4" /> New Address</Button>
      </div>
      <div className="space-y-3">
        {addresses.map((a, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-start gap-3">
            <MapPinned className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{a.partner}</p>
                <Badge variant="outline" className="text-xs">{a.type.replace(/_/g, ' ')}</Badge>
                {a.isDefault && <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Default</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPContactsTab() {
  const contacts = [
    { partner: 'Tata Consumer Products', name: 'Rajesh Mehta', designation: 'Procurement Head', email: 'rajesh.mehta@tataconsumer.com', mobile: '+91 98200 12345', primary: true },
    { partner: 'Tata Consumer Products', name: 'Priya Sharma', designation: 'Accounts Manager', email: 'priya.sharma@tataconsumer.com', mobile: '+91 98200 67890', primary: false },
    { partner: 'Konkan Cashew Processors', name: 'Suresh Patil', designation: 'Director', email: 'suresh@konkancashew.in', mobile: '+91 94210 11111', primary: true },
    { partner: 'Blue Dart Express', name: 'Anil Kumar', designation: 'Key Account Manager', email: 'anil.kumar@bluedart.com', mobile: '+91 99300 22222', primary: true },
    { partner: 'Reliance Retail', name: 'Vikram Iyer', designation: 'Category Manager - Foods', email: 'vikram.iyer@ril.com', mobile: '+91 98200 33333', primary: true },
    { partner: 'Amul', name: 'Deepak Patel', designation: 'Sales Manager (Maharashtra)', email: 'deepak.patel@amul.coop', mobile: '+91 94260 44444', primary: true },
    { partner: 'Infosys', name: 'Lakshmi Nair', designation: 'Admin Head', email: 'lakshmi.nair@infosys.com', mobile: '+91 99860 55555', primary: true },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Contact Management</h3>
        <p className="text-xs text-muted-foreground mt-1">Per-partner contacts with designation, department, email, mobile, office phone, WhatsApp, and preferred contact channel.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Create Contact — POST /api/v1/sales/customers/:id/contacts')}><Plus className="mr-1 h-4 w-4" /> New Contact</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Partner</th><th className="font-medium">Name</th>
            <th className="font-medium">Designation</th><th className="font-medium">Email</th>
            <th className="font-medium">Mobile</th><th className="font-medium">Primary</th>
          </tr></thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2.5">{c.partner}</td>
                <td className="font-medium">{c.name}</td>
                <td className="text-xs">{c.designation}</td>
                <td className="text-xs"><a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a></td>
                <td className="font-mono text-xs">{c.mobile}</td>
                <td>{c.primary ? <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Yes</Badge> : <Badge variant="outline" className="text-xs">No</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPFinancialTab() {
  const profiles = [
    { partner: 'Tata Consumer Products', creditLimit: 5000000, outstanding: 1250000, available: 3750000, creditDays: 60, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_60', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Konkan Cashew Processors', creditLimit: 1000000, outstanding: 280000, available: 720000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Sri Balaji Sugar', creditLimit: 2500000, outstanding: 1850000, available: 650000, creditDays: 45, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_45', taxCategory: 'REGISTERED', risk: 'MEDIUM' },
    { partner: 'Blue Dart Express', creditLimit: 500000, outstanding: 145000, available: 355000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Reliance Retail', creditLimit: 8000000, outstanding: 4200000, available: 3800000, creditDays: 45, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_45', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Sudhamrit Andheri Franchise', creditLimit: 500000, outstanding: 85000, available: 415000, creditDays: 15, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_15', taxCategory: 'COMPOSITION', risk: 'MEDIUM' },
    { partner: 'Amul', creditLimit: 3000000, outstanding: 920000, available: 2080000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Infosys', creditLimit: 2000000, outstanding: 540000, available: 1460000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Mumbai Packaging', creditLimit: 800000, outstanding: 410000, available: 390000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'MEDIUM' },
    { partner: 'Zomato', creditLimit: 300000, outstanding: 67000, available: 233000, creditDays: 15, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_15', taxCategory: 'REGISTERED', risk: 'LOW' },
  ]
  const riskColor: Record<string, string> = { LOW: 'text-emerald-600', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600' }
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-1">Financial Profiles</h3>
      <p className="text-xs text-muted-foreground mb-4">Credit limits, outstanding balances, payment terms, tax category, and risk rating per partner. One profile per partner.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Partner</th>
            <th className="font-medium text-right">Credit Limit</th><th className="font-medium text-right">Outstanding</th>
            <th className="font-medium text-right">Available</th><th className="font-medium">Days</th>
            <th className="font-medium">Terms</th><th className="font-medium">Tax</th><th className="font-medium">Risk</th>
          </tr></thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.partner} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{p.partner}</td>
                <td className="text-right font-mono">₹{p.creditLimit.toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-red-600">₹{p.outstanding.toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-emerald-600">₹{p.available.toLocaleString('en-IN')}</td>
                <td className="text-center">{p.creditDays}</td>
                <td><Badge variant="outline" className="text-xs font-mono">{p.paymentTerms}</Badge></td>
                <td><Badge variant="outline" className="text-xs">{p.taxCategory}</Badge></td>
                <td className={cn('font-semibold', riskColor[p.risk])}>{p.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPComplianceTab() {
  const compliance = [
    { partner: 'Tata Consumer Products', type: 'GST', number: '27AAACT2727Q1ZW', authority: 'GSTN', issueDate: '2017-07-01', expiry: null, status: 'ACTIVE' },
    { partner: 'Tata Consumer Products', type: 'PAN', number: 'AAACT2727Q', authority: 'Income Tax Dept', issueDate: '1998-04-12', expiry: null, status: 'ACTIVE' },
    { partner: 'Konkan Cashew Processors', type: 'GST', number: '27AAGCK1234M1Z2', authority: 'GSTN', issueDate: '2017-07-01', expiry: null, status: 'ACTIVE' },
    { partner: 'Konkan Cashew Processors', type: 'FSSAI', number: '11522034000123', authority: 'FSSAI', issueDate: '2024-01-15', expiry: '2027-01-14', status: 'ACTIVE' },
    { partner: 'Konkan Cashew Processors', type: 'MSME', number: 'UDYAM-MH-12-0044521', authority: 'MSME Ministry', issueDate: '2020-08-10', expiry: null, status: 'ACTIVE' },
    { partner: 'Sri Balaji Sugar', type: 'GST', number: '37AAECS7890P1Z5', authority: 'GSTN', issueDate: '2017-07-01', expiry: null, status: 'ACTIVE' },
    { partner: 'Amul', type: 'FSSAI', number: '10322034000111', authority: 'FSSAI', issueDate: '2023-06-01', expiry: '2026-05-31', status: 'EXPIRED' },
    { partner: 'Amul', type: 'ISO', number: 'ISO 22000:2018', authority: 'ISO Cert Body', issueDate: '2023-09-01', expiry: '2026-08-31', status: 'ACTIVE' },
    { partner: 'Mumbai Packaging', type: 'MSME', number: 'UDYAM-MH-16-0099887', authority: 'MSME Ministry', issueDate: '2021-03-15', expiry: null, status: 'ACTIVE' },
  ]
  const statusColor: Record<string, string> = { ACTIVE: 'bg-emerald-600 hover:bg-emerald-600', EXPIRED: 'bg-red-600 hover:bg-red-600', PENDING_VERIFICATION: 'bg-amber-500 hover:bg-amber-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Compliance Management</h3>
        <p className="text-xs text-muted-foreground mt-1">8 compliance types: GST, PAN, MSME, FSSAI, IEC, ISO, Agreements, Insurance. Document uploads + verification workflow. Expiry alerts.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Add Compliance — POST /api/v1/procurement/suppliers/:id/compliances')}><Plus className="mr-1 h-4 w-4" /> Add Compliance</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Partner</th><th className="font-medium">Type</th>
            <th className="font-medium">Certificate Number</th><th className="font-medium">Authority</th>
            <th className="font-medium">Issue</th><th className="font-medium">Expiry</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {compliance.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2.5">{c.partner}</td>
                <td><Badge variant="outline" className="text-xs font-mono">{c.type}</Badge></td>
                <td className="font-mono text-xs">{c.number}</td>
                <td className="text-xs">{c.authority}</td>
                <td className="text-xs text-muted-foreground">{c.issueDate}</td>
                <td className="text-xs text-muted-foreground">{c.expiry || '—'}</td>
                <td><Badge className={statusColor[c.status] || 'bg-gray-600'}>{c.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPGroupsTab() {
  const groups = [
    { code: 'CG-RETAIL', name: 'Retail Customers', type: 'CUSTOMER', discount: 0, terms: 'CASH', members: 1245 },
    { code: 'CG-WHOLESALE', name: 'Wholesale Customers', type: 'CUSTOMER', discount: 5, terms: 'NET_30', members: 89 },
    { code: 'CG-CORPORATE', name: 'Corporate Customers', type: 'CUSTOMER', discount: 8, terms: 'NET_45', members: 32 },
    { code: 'CG-VIP', name: 'VIP Customers', type: 'CUSTOMER', discount: 12, terms: 'NET_30', members: 18 },
    { code: 'CG-EXPORT', name: 'Export Customers', type: 'CUSTOMER', discount: 0, terms: 'ADVANCE', members: 7 },
    { code: 'SG-RAW-MATERIAL', name: 'Raw Material Suppliers', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 24 },
    { code: 'SG-PACKAGING', name: 'Packaging Suppliers', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 12 },
    { code: 'SG-TRANSPORT', name: 'Transport Services', type: 'SUPPLIER', discount: null, terms: 'NET_15', members: 8 },
    { code: 'SG-MAINTENANCE', name: 'Maintenance Services', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 6 },
    { code: 'SG-UTILITY', name: 'Utility Providers', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 4 },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Customer & Supplier Groups</h3>
        <p className="text-xs text-muted-foreground mt-1">Classification for pricing tiers, payment terms defaults, and reporting. Plus flexible partner tags for ad-hoc labeling.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Create Group — POST /api/v1/sales/customer-groups')}><Plus className="mr-1 h-4 w-4" /> New Group</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map(g => (
          <div key={g.code} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{g.code}</p>
                <p className="font-medium">{g.name}</p>
              </div>
              <Badge className={g.type === 'CUSTOMER' ? 'bg-blue-600 hover:bg-blue-600' : 'bg-purple-600 hover:bg-purple-600'}>{g.type}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {g.discount !== null && <span>Discount: <span className="font-mono font-medium text-foreground">{g.discount}%</span></span>}
              <span>Terms: <span className="font-mono font-medium text-foreground">{g.terms}</span></span>
              <span>·</span>
              <span><span className="font-mono font-medium text-foreground">{g.members.toLocaleString('en-IN')}</span> members</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPBankingTab() {
  const accounts = [
    { partner: 'Tata Consumer Products', accountName: 'Tata Consumer Products Ltd', accountNumber: '**** **** **** 4521', bank: 'HDFC Bank', branch: 'Fort, Mumbai', ifsc: 'HDFC0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Tata Consumer Products', accountName: 'Tata Consumer Products Ltd', accountNumber: '**** **** **** 7821', bank: 'State Bank of India', branch: 'Nariman Point', ifsc: 'SBIN0000001', type: 'CURRENT', isDefault: false, verified: true },
    { partner: 'Konkan Cashew Processors', accountName: 'Konkan Cashew Processors Pvt Ltd', accountNumber: '**** **** **** 1192', bank: 'Bank of Maharashtra', branch: 'Ratnagiri', ifsc: 'MAHB0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Blue Dart Express', accountName: 'Blue Dart Express Ltd', accountNumber: '**** **** **** 3344', bank: 'ICICI Bank', branch: 'Andheri East', ifsc: 'ICIC0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Blue Dart Express', accountName: 'Blue Dart Express Ltd', accountNumber: '**** **** **** 9912', bank: 'Axis Bank', branch: 'Bengaluru MG Road', ifsc: 'UTIB0000001', type: 'CURRENT', isDefault: false, verified: true },
    { partner: 'Reliance Retail', accountName: 'Reliance Retail Ltd', accountNumber: '**** **** **** 5567', bank: 'HDFC Bank', branch: 'Bandra Kurla Complex', ifsc: 'HDFC0000123', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Amul', accountName: 'GCMMF Ltd', accountNumber: '**** **** **** 2298', bank: 'Bank of Baroda', branch: 'Anand', ifsc: 'BARB0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Infosys', accountName: 'Infosys Ltd', accountNumber: '**** **** **** 8890', bank: 'HDFC Bank', branch: 'Electronics City', ifsc: 'HDFC0000456', type: 'CURRENT', isDefault: true, verified: true },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Bank Accounts</h3>
        <p className="text-xs text-muted-foreground mt-1">Per-partner bank accounts with IFSC, SWIFT (for export), UPI ID. Account numbers masked in UI (encrypted at rest). Verification workflow for each account.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Add Bank Account — backend endpoint pending')}><Plus className="mr-1 h-4 w-4" /> Add Bank Account</Button>
      </div>
      <div className="space-y-3">
        {accounts.map((a, i) => (
          <div key={i} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-muted-foreground">{a.partner}</p>
                <p className="font-medium">{a.accountName}</p>
              </div>
              <div className="flex items-center gap-1">
                {a.isDefault && <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Default</Badge>}
                {a.verified ? <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge> : <Badge variant="outline" className="text-xs">Pending</Badge>}
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-2 text-xs">
              <div><p className="text-muted-foreground">Account No</p><p className="font-mono">{a.accountNumber}</p></div>
              <div><p className="text-muted-foreground">Bank</p><p>{a.bank}, {a.branch}</p></div>
              <div><p className="text-muted-foreground">IFSC</p><p className="font-mono">{a.ifsc}</p></div>
              <div><p className="text-muted-foreground">Type</p><Badge variant="outline" className="text-xs">{a.type}</Badge></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPRelationshipsTab() {
  const relationships = [
    { from: 'Tata Consumer Products', to: 'Sudhamrit Foods Ltd.', type: 'CUSTOMER_OF', validFrom: '2026-01-15', status: 'ACTIVE' },
    { from: 'Reliance Retail', to: 'Reliance Industries Ltd.', type: 'SUBSIDIARY', validFrom: '2026-01-12', status: 'ACTIVE' },
    { from: 'Konkan Cashew Processors', to: 'Sudhamrit Foods Ltd.', type: 'PREFERRED_SUPPLIER', validFrom: '2026-01-20', status: 'ACTIVE' },
    { from: 'Amul', to: 'Sudhamrit Foods Ltd.', type: 'STRATEGIC_PARTNER', validFrom: '2026-01-18', status: 'ACTIVE' },
    { from: 'Sudhamrit Franchise - Andheri West', to: 'Sudhamrit Foods Ltd.', type: 'FRANCHISE', validFrom: '2026-03-05', status: 'ACTIVE' },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Business Partner Relationships</h3>
        <p className="text-xs text-muted-foreground mt-1">Track parent/subsidiary, distributor/dealer, franchise, preferred supplier, strategic partner, sister concern, JV partner relationships between partners.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Create Relationship — backend endpoint pending')}><Plus className="mr-1 h-4 w-4" /> New Relationship</Button>
      </div>
      <div className="space-y-3">
        {relationships.map((r, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-center gap-3">
            <Handshake className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{r.from}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <p className="font-medium text-sm">{r.to}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">{r.type.replace(/_/g, ' ')}</Badge>
                <span>Valid from: {r.validFrom}</span>
              </div>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{r.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPScorecardsTab() {
  const scorecards = [
    { partner: 'Amul', period: 'Q2 2026', onTime: 97.8, accuracy: 99.5, quality: 98.5, complaints: 0.5, payment: 96.0, response: 95.0, overall: 97.8, grade: 'A+', orders: 218, value: 8450000 },
    { partner: 'Tata Consumer Products', period: 'Q2 2026', onTime: null, accuracy: null, quality: 95.0, complaints: 0.8, payment: 99.0, response: null, overall: 96.2, grade: 'A+', orders: 32, value: 12500000 },
    { partner: 'Konkan Cashew Processors', period: 'Q2 2026', onTime: 94.5, accuracy: 98.2, quality: 96.0, complaints: 1.2, payment: 92.0, response: 88.0, overall: 93.5, grade: 'A', orders: 142, value: 3845000 },
    { partner: 'Blue Dart Express', period: 'Q2 2026', onTime: 91.2, accuracy: 96.8, quality: 92.0, complaints: 2.8, payment: 88.0, response: 90.5, overall: 91.6, grade: 'A', orders: 485, value: 1240000 },
    { partner: 'Sri Balaji Sugar', period: 'Q2 2026', onTime: 82.0, accuracy: 88.5, quality: 90.0, complaints: 3.5, payment: 85.0, response: 78.0, overall: 83.5, grade: 'B', orders: 56, value: 2890000 },
    { partner: 'Mumbai Packaging Solutions', period: 'Q2 2026', onTime: 75.5, accuracy: 82.0, quality: 85.0, complaints: 5.2, payment: 78.0, response: 72.0, overall: 78.5, grade: 'C', orders: 38, value: 580000 },
  ]
  const gradeColor: Record<string, string> = { 'A+': 'bg-emerald-600 text-white', 'A': 'bg-emerald-500 text-white', 'B': 'bg-amber-500 text-white', 'C': 'bg-orange-500 text-white', 'D': 'bg-red-600 text-white' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Partner Scorecards</h3>
        <p className="text-xs text-muted-foreground mt-1">Quarterly evaluations: on-time delivery, order accuracy, quality, complaints, payment history, response time. Composite overall score + letter grade. Future: AI risk prediction, customer lifetime value.</p></div>
        <Button size="sm" onClick={() => pushToast('info', 'Create Scorecard — backend endpoint pending')}><Plus className="mr-1 h-4 w-4" /> New Scorecard</Button>
      </div>
      <div className="space-y-3">
        {scorecards.map(s => (
          <div key={s.partner} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{s.partner}</p>
                <p className="text-xs text-muted-foreground">{s.period} · {s.orders} orders · ₹{s.value.toLocaleString('en-IN')} business value</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-2xl font-bold">{s.overall}</p>
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
                <span className={cn('inline-flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm', gradeColor[s.grade])}>{s.grade}</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">On-Time</p><p className="font-mono font-semibold">{s.onTime !== null ? `${s.onTime}%` : '—'}</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Accuracy</p><p className="font-mono font-semibold">{s.accuracy !== null ? `${s.accuracy}%` : '—'}</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Quality</p><p className="font-mono font-semibold">{s.quality}%</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Complaints</p><p className="font-mono font-semibold">{s.complaints}%</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Payment</p><p className="font-mono font-semibold">{s.payment}%</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Response</p><p className="font-mono font-semibold">{s.response !== null ? `${s.response}%` : '—'}</p></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
