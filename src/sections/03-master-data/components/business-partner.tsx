/**
 * Section 03 — Master Data Management
 * Business Partner Module — 100% Live API Integration
 *
 * 10 sub-tabs:
 * 1. Overview      — Stats from live customer + supplier APIs
 * 2. Partners      — Unified customer + supplier list with transition + delete
 * 3. Addresses     — Customer/supplier addresses (via get detail)
 * 4. Contacts      — Customer/supplier contacts (via get detail + add)
 * 5. Financial     — Customer credit status (live)
 * 6. Compliance    — Supplier compliances (via get detail + add)
 * 7. Groups        — Customer groups + supplier categories (live CRUD)
 * 8. Banking       — NO backend → EmptyState
 * 9. Relationships — NO backend → EmptyState
 * 10. Scorecards   — NO backend → EmptyState
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Download, Upload, Trash2, X, Loader2, AlertCircle,
  Users2, BarChart3, Tag, Percent, Calculator, Gift, Clock,
  ClipboardCheck, ShieldCheck, TrendingUp, ArrowRightCircle,
  IndianRupee, CreditCard, MapPinned, Phone, Handshake, Award,
  FolderTree, Building2, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { customerApi, supplierApi, type Customer, type Supplier } from '../api/clients'
import { CUSTOMER_LIFECYCLE_TRANSITIONS, SUPPLIER_LIFECYCLE_TRANSITIONS } from '../constants/master-data'

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

// ─── Helper: unified partner type ─────────────────────────────────────────────

interface UnifiedPartner {
  id: string
  code: string
  name: string
  type: 'CUSTOMER' | 'SUPPLIER'
  roles: string[]
  gst: string
  credit: number
  risk: string
  status: string
  version: number
  raw: Customer | Supplier
}

async function loadPartners(search?: string): Promise<UnifiedPartner[]> {
  const [custRes, suppRes] = await Promise.all([
    customerApi.list({ page: 1, search, pageSize: 100 }).catch(() => ({ data: [] as Customer[], meta: { total: 0 } })),
    supplierApi.list({ page: 1, search, pageSize: 100 }).catch(() => ({ data: [] as Supplier[], meta: { total: 0 } })),
  ])
  const customers: UnifiedPartner[] = (custRes.data || []).map(c => ({
    id: c.id, code: c.customer_code, name: c.trade_name, type: 'CUSTOMER' as const,
    roles: ['CUSTOMER'], gst: c.gstin || '—', credit: Number(c.credit_limit || 0),
    risk: c.risk_rating || 'MEDIUM', status: c.status, version: c.version, raw: c,
  }))
  const suppliers: UnifiedPartner[] = (suppRes.data || []).map(s => ({
    id: s.id, code: s.vendor_code, name: s.trade_name, type: 'SUPPLIER' as const,
    roles: ['SUPPLIER'], gst: s.gstin || '—', credit: Number(s.credit_limit || 0),
    risk: s.risk_level || 'MEDIUM', status: s.status, version: s.version, raw: s,
  }))
  return [...customers, ...suppliers]
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function BPOverviewTab() {
  const [stats, setStats] = useState<Array<{ label: string; value: string; sub: string; icon: React.ReactNode }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const partners = await loadPartners()
        if (cancelled) return
        const customers = partners.filter(p => p.type === 'CUSTOMER')
        const suppliers = partners.filter(p => p.type === 'SUPPLIER')
        const activeCount = partners.filter(p => p.status === 'ACTIVE').length
        const totalCredit = partners.reduce((sum, p) => sum + p.credit, 0)
        const lowRisk = partners.filter(p => p.risk === 'LOW').length
        setStats([
          { label: 'Total Partners', value: String(partners.length), sub: 'All types', icon: <Users2 className="h-5 w-5 text-blue-600" /> },
          { label: 'Customers', value: String(customers.length), sub: `${customers.filter(c => c.status === 'ACTIVE').length} Active`, icon: <Users2 className="h-5 w-5 text-emerald-600" /> },
          { label: 'Suppliers', value: String(suppliers.length), sub: `${suppliers.filter(s => s.status === 'ACTIVE').length} Active`, icon: <Users2 className="h-5 w-5 text-purple-600" /> },
          { label: 'Active', value: String(activeCount), sub: 'Currently trading', icon: <ShieldCheck className="h-5 w-5 text-teal-600" /> },
          { label: 'Total Credit Exposure', value: `₹${(totalCredit / 100000).toFixed(1)}L`, sub: 'Across all partners', icon: <CreditCard className="h-5 w-5 text-amber-600" /> },
          { label: 'Low Risk', value: String(lowRisk), sub: 'Risk score < 25', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
          { label: 'Banking', value: 'N/A', sub: 'Backend not available', icon: <IndianRupee className="h-5 w-5 text-pink-600" /> },
          { label: 'Scorecards', value: 'N/A', sub: 'Backend not available', icon: <Award className="h-5 w-5 text-indigo-600" /> },
        ])
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      {error && <ErrorState message={error} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(8)].map((_, i) => <Card key={i} className="p-4"><div className="h-16 bg-muted/50 rounded animate-pulse" /></Card>)
        ) : (
          stats.map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Partners Tab — Live with transition + delete ─────────────────────────────

function BPPartnersTab() {
  const { hasPermission } = useAuthStore()
  const [partners, setPartners] = useState<UnifiedPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await loadPartners(search)
      setPartners(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load partners')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const filtered = partners.filter(p => !typeFilter || p.type === typeFilter)

  const roleColor: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-800', SUPPLIER: 'bg-purple-100 text-purple-800',
  }
  const riskColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-800', MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800',
  }

  async function handleTransition(p: UnifiedPartner, targetStatus: string) {
    try {
      if (p.type === 'CUSTOMER') {
        await customerApi.transition(p.id, targetStatus, p.version)
      } else {
        await supplierApi.transition(p.id, targetStatus, p.version)
      }
      toast({ title: `Partner transitioned to ${targetStatus}` })
      load()
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : 'Transition failed', variant: 'destructive' })
    }
  }

  async function handleDelete(p: UnifiedPartner) {
    if (!confirm(`Delete ${p.name}? This cannot be undone.`)) return
    try {
      if (p.type === 'CUSTOMER') {
        await customerApi.delete(p.id, p.version)
      } else {
        await supplierApi.delete(p.id, p.version)
      }
      toast({ title: 'Partner deleted' })
      load()
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : 'Delete failed', variant: 'destructive' })
    }
  }

  function handleExport() {
    if (filtered.length === 0) { toast({ title: 'No data to export' }); return }
    const headers = ['Code', 'Name', 'Type', 'GST', 'Credit', 'Risk', 'Status']
    const rows = filtered.map(p => [p.code, p.name, p.type, p.gst, p.credit, p.risk, p.status])
    import('@/lib/csv').then(({ exportToCSV }) => exportToCSV('business-partners', headers, rows))
    toast({ title: `Exported ${filtered.length} partners` })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Business Partners</h3>
          <p className="text-xs text-muted-foreground mt-1">{loading ? 'Loading...' : `${filtered.length} partners (${filtered.filter(p => p.type === 'CUSTOMER').length} customers, ${filtered.filter(p => p.type === 'SUPPLIER').length} suppliers)`}</p>
        </div>
        {hasPermission('customer:export') && <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export</Button>}
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, code, or GST..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 rounded-md border px-3 text-sm bg-background">
          <option value="">All Types</option>
          <option value="CUSTOMER">Customers</option>
          <option value="SUPPLIER">Suppliers</option>
        </select>
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState rows={5} /> : filtered.length === 0 ? (
        <EmptyState icon={Users2} title="No partners found" description="No business partners match the current criteria." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Code</th><th className="font-medium">Name</th>
              <th className="font-medium">Type</th><th className="font-medium">GST</th>
              <th className="font-medium text-right">Credit</th><th className="font-medium">Risk</th>
              <th className="font-medium">Status</th><th className="font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/40">
                  <td className="py-2.5 font-mono text-xs">{p.code}</td>
                  <td className="font-medium">{p.name}</td>
                  <td><span className={cn('inline-block px-1.5 py-0.5 rounded text-xs font-medium', roleColor[p.type])}>{p.type}</span></td>
                  <td className="font-mono text-xs">{p.gst}</td>
                  <td className="text-right font-mono">{p.credit > 0 ? `₹${p.credit.toLocaleString('en-IN')}` : '—'}</td>
                  <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', riskColor[p.risk] || 'bg-slate-100')}>{p.risk}</span></td>
                  <td><Badge className={cn('text-xs', p.status === 'ACTIVE' ? 'bg-emerald-600' : p.status === 'BLOCKED' || p.status === 'BLACKLISTED' ? 'bg-red-600' : 'bg-slate-500')}>{p.status}</Badge></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {hasPermission(p.type === 'CUSTOMER' ? 'customer:update' : 'supplier:update') && (
                        <>
                          {(p.type === 'CUSTOMER' ? CUSTOMER_LIFECYCLE_TRANSITIONS[p.status] : SUPPLIER_LIFECYCLE_TRANSITIONS[p.status])?.length > 0 && (
                            <select
                              className="h-7 text-xs rounded border bg-background px-1"
                              value=""
                              onChange={e => e.target.value && handleTransition(p, e.target.value)}
                            >
                              <option value="">Transition...</option>
                              {(p.type === 'CUSTOMER' ? CUSTOMER_LIFECYCLE_TRANSITIONS[p.status] : SUPPLIER_LIFECYCLE_TRANSITIONS[p.status])?.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                          {p.status !== 'ACTIVE' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDelete(p)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ─── Addresses Tab — Via partner detail ───────────────────────────────────────

function BPAddressesTab() {
  const [partners, setPartners] = useState<UnifiedPartner[]>([])
  const [selected, setSelected] = useState<UnifiedPartner | null>(null)
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadPartners().then(setPartners).catch(() => setPartners([])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) { setDetail(null); return }
    setDetailLoading(true)
    const api = selected.type === 'CUSTOMER' ? customerApi : supplierApi
    api.get(selected.id).then(r => setDetail(r.data)).catch(() => setDetail(null)).finally(() => setDetailLoading(false))
  }, [selected])

  const addresses = (detail as Record<string, unknown>)?.addresses as Array<Record<string, unknown>> | undefined

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Address Management</h3>
        <p className="text-xs text-muted-foreground mt-1">9 address types: Registered Office, Billing, Shipping, Factory, Warehouse, Branch, Restaurant, Pickup, Return.</p></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <p className="text-xs font-medium mb-2">Select Partner:</p>
          <select className="w-full h-9 rounded-md border px-3 text-sm bg-background" value={selected?.id || ''} onChange={e => { const p = partners.find(x => x.id === e.target.value); setSelected(p || null) }}>
            <option value="">— Select —</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          {!selected ? (
            <EmptyState icon={MapPinned} title="Select a partner" description="Select a partner to view their addresses." />
          ) : detailLoading ? (
            <LoadingState rows={3} />
          ) : addresses && addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((a, i) => (
                <div key={i} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">{String(a.addressType || a.address_type || '—')}</Badge>
                    {a.isPrimary && <Badge className="bg-blue-600 text-xs">Primary</Badge>}
                  </div>
                  <p className="font-medium">{String(a.addressLine1 || a.address_line_1 || '—')}</p>
                  <p className="text-xs text-muted-foreground">{String(a.city || '—')}, {String(a.state || '—')} {String(a.postalCode || a.postal_code || '')}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={MapPinned} title="No addresses found" description="This partner has no addresses on record." />
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Contacts Tab — Via partner detail + add ──────────────────────────────────

function BPContactsTab() {
  const { hasPermission } = useAuthStore()
  const [partners, setPartners] = useState<UnifiedPartner[]>([])
  const [selected, setSelected] = useState<UnifiedPartner | null>(null)
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadPartners().then(setPartners).catch(() => setPartners([])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) { setDetail(null); return }
    setDetailLoading(true)
    const api = selected.type === 'CUSTOMER' ? customerApi : supplierApi
    api.get(selected.id).then(r => setDetail(r.data)).catch(() => setDetail(null)).finally(() => setDetailLoading(false))
  }, [selected])

  const contacts = (detail as Record<string, unknown>)?.contacts as Array<Record<string, unknown>> | undefined

  async function handleAddContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    setAdding(true)
    try {
      const fd = new FormData(e.currentTarget)
      const data = { name: fd.get('name'), designation: fd.get('designation') || undefined, email: fd.get('email') || undefined, phone: fd.get('phone') || undefined, isPrimary: fd.get('isPrimary') === 'on' }
      if (selected.type === 'CUSTOMER') {
        await customerApi.addContact(selected.id, data as never)
      } else {
        await supplierApi.addContact(selected.id, data as never)
      }
      toast({ title: 'Contact added successfully' })
      setShowAdd(false)
      const api = selected.type === 'CUSTOMER' ? customerApi : supplierApi
      const r = await api.get(selected.id); setDetail(r.data)
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : 'Failed to add contact', variant: 'destructive' })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Contact Management</h3>
        <p className="text-xs text-muted-foreground mt-1">Manage contacts for customers and suppliers.</p></div>
        {selected && hasPermission(selected.type === 'CUSTOMER' ? 'customer:update' : 'supplier:update') && (
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="mr-1 h-4 w-4" /> Add Contact</Button>
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <p className="text-xs font-medium mb-2">Select Partner:</p>
          <select className="w-full h-9 rounded-md border px-3 text-sm bg-background" value={selected?.id || ''} onChange={e => { const p = partners.find(x => x.id === e.target.value); setSelected(p || null) }}>
            <option value="">— Select —</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          {loading || detailLoading ? <LoadingState rows={3} /> : !selected ? (
            <EmptyState icon={Phone} title="Select a partner" description="Select a partner to view their contacts." />
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={i} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">{String(c.name || '—')}</p>
                    <p className="text-xs text-muted-foreground">{String(c.designation || '')}</p>
                  </div>
                  <div className="text-right text-xs">
                    {c.email && <p>{String(c.email)}</p>}
                    {c.phone && <p className="text-muted-foreground">{String(c.phone)}</p>}
                    {c.isPrimary && <Badge className="bg-blue-600 text-xs mt-1">Primary</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Phone} title="No contacts found" description="This partner has no contacts on record." />
          )}
        </div>
      </div>

      {showAdd && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
          <Card className="p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold">Add Contact to {selected.name}</h3><Button size="icon" variant="ghost" onClick={() => setShowAdd(false)} disabled={adding}><X className="h-4 w-4" /></Button></div>
            <form onSubmit={handleAddContact} className="space-y-3">
              <div><Label className="text-xs">Name *</Label><Input name="name" required className="h-8" /></div>
              <div><Label className="text-xs">Designation</Label><Input name="designation" className="h-8" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Email</Label><Input name="email" type="email" className="h-8" /></div>
                <div><Label className="text-xs">Phone</Label><Input name="phone" className="h-8" /></div>
              </div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isPrimary" /> Primary Contact</label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</Button>
                <Button type="submit" size="sm" disabled={adding}>{adding ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Adding...</> : 'Add Contact'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  )
}

// ─── Financial Tab — Customer credit status ───────────────────────────────────

function BPFinancialTab() {
  const [partners, setPartners] = useState<UnifiedPartner[]>([])
  const [selected, setSelected] = useState<UnifiedPartner | null>(null)
  const [credit, setCredit] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [creditLoading, setCreditLoading] = useState(false)

  useEffect(() => {
    loadPartners().then(p => { setPartners(p.filter(x => x.type === 'CUSTOMER')); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected || selected.type !== 'CUSTOMER') { setCredit(null); return }
    setCreditLoading(true)
    customerApi.getCredit(selected.id).then(r => setCredit(r.data)).catch(() => setCredit(null)).finally(() => setCreditLoading(false))
  }, [selected])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Financial Profiles</h3>
        <p className="text-xs text-muted-foreground mt-1">Customer credit status and financial profiles. Supplier financial data is available via supplier detail.</p></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <p className="text-xs font-medium mb-2">Select Customer:</p>
          <select className="w-full h-9 rounded-md border px-3 text-sm bg-background" value={selected?.id || ''} onChange={e => { const p = partners.find(x => x.id === e.target.value); setSelected(p || null) }}>
            <option value="">— Select —</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          {loading || creditLoading ? <LoadingState rows={4} /> : !selected ? (
            <EmptyState icon={CreditCard} title="Select a customer" description="Select a customer to view their financial profile." />
          ) : credit ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Credit Limit</p><p className="text-xl font-bold">₹{Number(credit.creditLimit || 0).toLocaleString('en-IN')}</p></div>
                <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-amber-600">₹{Number(credit.outstandingBalance || 0).toLocaleString('en-IN')}</p></div>
                <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Available Credit</p><p className="text-xl font-bold text-emerald-600">₹{Number(credit.availableCredit || 0).toLocaleString('en-IN')}</p></div>
                <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">Utilization %</p><p className="text-xl font-bold">{Number(credit.creditUtilizationPct || 0).toFixed(1)}%</p></div>
              </div>
              {credit.creditHold && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-700">⚠ Credit Hold Active — outstanding balance exceeds credit limit</p></div>}
            </div>
          ) : (
            <EmptyState icon={CreditCard} title="No financial data" description="Credit status not available for this customer." />
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Compliance Tab — Supplier compliances ────────────────────────────────────

function BPComplianceTab() {
  const { hasPermission } = useAuthStore()
  const [partners, setPartners] = useState<UnifiedPartner[]>([])
  const [selected, setSelected] = useState<UnifiedPartner | null>(null)
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadPartners().then(p => { setPartners(p.filter(x => x.type === 'SUPPLIER')); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) { setDetail(null); return }
    setDetailLoading(true)
    supplierApi.get(selected.id).then(r => setDetail(r.data)).catch(() => setDetail(null)).finally(() => setDetailLoading(false))
  }, [selected])

  const compliances = (detail as Record<string, unknown>)?.compliances as Array<Record<string, unknown>> | undefined

  async function handleAddCompliance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    setAdding(true)
    try {
      const fd = new FormData(e.currentTarget)
      await supplierApi.addCompliance(selected.id, {
        complianceType: fd.get('type') as string,
        licenseNumber: (fd.get('license') as string) || undefined,
        issuingAuthority: (fd.get('authority') as string) || undefined,
        expiryDate: (fd.get('expiry') as string) || undefined,
      })
      toast({ title: 'Compliance record added' })
      setShowAdd(false)
      const r = await supplierApi.get(selected.id); setDetail(r.data)
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : 'Failed to add compliance', variant: 'destructive' })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Compliance Management</h3>
        <p className="text-xs text-muted-foreground mt-1">FSSAI, HACCP, ISO, GST, PAN, MSME, Insurance, NDA, Vendor Agreement — for suppliers.</p></div>
        {selected && hasPermission('supplier:update') && (
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="mr-1 h-4 w-4" /> Add Compliance</Button>
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <p className="text-xs font-medium mb-2">Select Supplier:</p>
          <select className="w-full h-9 rounded-md border px-3 text-sm bg-background" value={selected?.id || ''} onChange={e => { const p = partners.find(x => x.id === e.target.value); setSelected(p || null) }}>
            <option value="">— Select —</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          {loading || detailLoading ? <LoadingState rows={3} /> : !selected ? (
            <EmptyState icon={ShieldCheck} title="Select a supplier" description="Select a supplier to view their compliance records." />
          ) : compliances && compliances.length > 0 ? (
            <div className="space-y-2">
              {compliances.map((c, i) => (
                <div key={i} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">{String(c.complianceType || c.compliance_type || '—')}</Badge>
                    <Badge className={cn('text-xs', c.status === 'APPROVED' || c.status === 'ACTIVE' ? 'bg-emerald-600' : c.status === 'EXPIRED' ? 'bg-red-600' : 'bg-amber-500')}>{String(c.status || '—')}</Badge>
                  </div>
                  {c.licenseNumber && <p className="text-xs">License: {String(c.licenseNumber)}</p>}
                  {c.expiryDate && <p className="text-xs text-muted-foreground">Expiry: {String(c.expiryDate)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShieldCheck} title="No compliance records" description="This supplier has no compliance records." />
          )}
        </div>
      </div>

      {showAdd && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
          <Card className="p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold">Add Compliance to {selected.name}</h3><Button size="icon" variant="ghost" onClick={() => setShowAdd(false)} disabled={adding}><X className="h-4 w-4" /></Button></div>
            <form onSubmit={handleAddCompliance} className="space-y-3">
              <div><Label className="text-xs">Compliance Type *</Label><select name="type" required className="w-full h-8 rounded-md border px-2 text-sm bg-background"><option>FSSAI</option><option>ISO_22000</option><option>HACCP</option><option>GST_REG</option><option>PAN</option><option>MSME</option><option>INSURANCE</option><option>NDA</option><option>VENDOR_AGREEMENT</option></select></div>
              <div><Label className="text-xs">License Number</Label><Input name="license" className="h-8" /></div>
              <div><Label className="text-xs">Issuing Authority</Label><Input name="authority" className="h-8" /></div>
              <div><Label className="text-xs">Expiry Date</Label><Input name="expiry" type="date" className="h-8" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</Button>
                <Button type="submit" size="sm" disabled={adding}>{adding ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Adding...</> : 'Add'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  )
}

// ─── Groups Tab — Customer groups + Supplier categories ───────────────────────

function BPGroupsTab() {
  const { hasPermission } = useAuthStore()
  const [groups, setGroups] = useState<Array<{ id: string; code: string; name: string; type: 'CUSTOMER' | 'SUPPLIER' }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [custRes, suppRes] = await Promise.all([
        customerApi.listGroups().catch(() => ({ data: [] })),
        supplierApi.listCategories().catch(() => ({ data: [] })),
      ])
      const customerGroups = (custRes.data || []).map((g: Record<string, unknown>) => ({ id: String(g.id), code: String(g.code), name: String(g.name), type: 'CUSTOMER' as const }))
      const supplierCats = (suppRes.data || []).map((c: Record<string, unknown>) => ({ id: String(c.id), code: String(c.code), name: String(c.name), type: 'SUPPLIER' as const }))
      setGroups([...customerGroups, ...supplierCats])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)
    try {
      const fd = new FormData(e.currentTarget)
      const type = fd.get('type') as string
      const data = { code: fd.get('code'), name: fd.get('name') }
      if (type === 'CUSTOMER') {
        await customerApi.createGroup(data as never)
      } else {
        await supplierApi.createCategory(data as never)
      }
      toast({ title: 'Group created successfully' })
      setShowCreate(false)
      load()
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : 'Failed to create group', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Partner Groups & Categories</h3>
        <p className="text-xs text-muted-foreground mt-1">{loading ? 'Loading...' : `${groups.length} groups (${groups.filter(g => g.type === 'CUSTOMER').length} customer, ${groups.filter(g => g.type === 'SUPPLIER').length} supplier)`}</p></div>
        {(hasPermission('customer:create') || hasPermission('supplier:create')) && <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-1 h-4 w-4" /> New Group</Button>}
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState rows={4} /> : groups.length === 0 ? (
        <EmptyState icon={FolderTree} title="No groups found" description="Create customer groups or supplier categories to organize partners." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {groups.map(g => (
            <div key={g.id} className="flex items-center gap-2 p-2 rounded-lg border">
              <FolderTree className={cn('h-4 w-4', g.type === 'CUSTOMER' ? 'text-blue-600' : 'text-purple-600')} />
              <span className="text-sm font-medium flex-1">{g.name}</span>
              <Badge variant="outline" className="text-xs">{g.type}</Badge>
              <Badge variant="outline" className="text-xs font-mono">{g.code}</Badge>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !creating && setShowCreate(false)}>
          <Card className="p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold">Create Group</h3><Button size="icon" variant="ghost" onClick={() => setShowCreate(false)} disabled={creating}><X className="h-4 w-4" /></Button></div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label className="text-xs">Type</Label><select name="type" className="w-full h-8 rounded-md border px-2 text-sm bg-background"><option>CUSTOMER</option><option>SUPPLIER</option></select></div>
              <div><Label className="text-xs">Code *</Label><Input name="code" required className="h-8" /></div>
              <div><Label className="text-xs">Name *</Label><Input name="name" required className="h-8" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</Button>
                <Button type="submit" size="sm" disabled={creating}>{creating ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Creating...</> : 'Create'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  )
}

// ─── Banking Tab — NO BACKEND ─────────────────────────────────────────────────

function BPBankingTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Bank Account Management</h3>
        <p className="text-xs text-muted-foreground mt-1">Bank account management requires a dedicated backend endpoint.</p></div>
      </div>
      <EmptyState icon={IndianRupee} title="Backend endpoint not available" description="The bank accounts API (GET/POST /api/v1/sales/customers/:id/bank-accounts or /api/v1/procurement/suppliers/:id/bank-accounts) does not exist in the backend. Bank details are currently stored as fields on the customer/supplier record (bankName, accountNumber, ifscCode) but there is no dedicated bank account CRUD endpoint for managing multiple accounts per partner." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. The customer and supplier create DTOs include bankName, accountNumber, ifscCode fields, but there is no multi-account management endpoint.</p>
      </div>
    </Card>
  )
}

// ─── Relationships Tab — NO BACKEND ───────────────────────────────────────────

function BPRelationshipsTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Partner Relationships</h3>
        <p className="text-xs text-muted-foreground mt-1">Parent/subsidiary, franchise, preferred supplier relationships.</p></div>
      </div>
      <EmptyState icon={Handshake} title="Backend endpoint not available" description="The partner relationships API does not exist in the backend. This feature would allow tracking parent/subsidiary relationships, franchise agreements, preferred supplier designations, and strategic partnerships between business partners." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model exists for partner relationships.</p>
      </div>
    </Card>
  )
}

// ─── Scorecards Tab — NO BACKEND ──────────────────────────────────────────────

function BPScorecardsTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Partner Scorecards</h3>
        <p className="text-xs text-muted-foreground mt-1">Quarterly performance scorecards with on-time delivery, accuracy, quality metrics.</p></div>
      </div>
      <EmptyState icon={Award} title="Backend endpoint not available" description="The partner scorecards API does not exist in the backend. This feature would allow quarterly performance tracking with metrics: on-time delivery %, order accuracy %, quality acceptance %, complaint count, payment timeliness, response time — with composite score and letter grade." />
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model exists for partner scorecards.</p>
      </div>
    </Card>
  )
}
