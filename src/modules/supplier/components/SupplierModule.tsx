'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supplierApi, type Supplier } from '../api/client'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, Truck, Shield, Star, ChevronRight } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><Truck className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', VERIFICATION: 'bg-blue-100 text-blue-700', APPROVED: 'bg-cyan-100 text-cyan-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700', PROBATION: 'bg-amber-100 text-amber-700', BLOCKED: 'bg-orange-100 text-orange-700',
  BLACKLISTED: 'bg-red-100 text-red-700', ARCHIVED: 'bg-zinc-100 text-zinc-500',
}
const riskColors: Record<string, string> = { LOW: 'text-emerald-600', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' }

type Tab = 'dashboard' | 'suppliers' | 'categories'
const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <Truck className="h-4 w-4" /> },
  { key: 'suppliers', label: 'Suppliers', icon: <Truck className="h-4 w-4" /> },
  { key: 'categories', label: 'Categories', icon: <Shield className="h-4 w-4" /> },
]

function SupplierDashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState({ total: 0, active: 0, preferred: 0, blocked: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try {
        const [all, active, preferred, blocked] = await Promise.all([
          supplierApi.list({ page: 1 }),
          supplierApi.list({ page: 1, status: 'ACTIVE' }),
          supplierApi.list({ page: 1, status: 'ACTIVE' }), // isPreferred filter not in query param yet
          supplierApi.list({ page: 1, status: 'BLOCKED' }),
        ])
        setStats({ total: all.meta.total, active: active.meta.total, preferred: 0, blocked: blocked.meta.total })
      } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <LoadingState />
  const cards = [
    { label: 'Total Suppliers', value: stats.total, icon: Truck, color: 'text-blue-600', tab: 'suppliers' as Tab },
    { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', tab: 'suppliers' as Tab },
    { label: 'Blocked', value: stats.blocked, icon: AlertCircle, color: 'text-orange-600', tab: 'suppliers' as Tab },
    { label: 'Preferred', value: stats.preferred, icon: Star, color: 'text-amber-600', tab: 'suppliers' as Tab },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Supplier Master Dashboard</h2>
        <p className="text-slate-300 text-sm">Centralized vendor management — procurement, quality, finance, and compliance.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(c.tab)}>
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{c.label}</p><c.icon className={`h-5 w-5 ${c.color}`} /></div>
            <p className="text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await supplierApi.list({ page, search: search || undefined })
      setSuppliers(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { load() }, [load])

  const handleTransition = async (s: Supplier, target: string) => {
    try { await supplierApi.transition(s.id, target, s.version); setSuccessMsg(`Supplier "${s.legal_name}" transitioned to ${target}`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Suppliers</h2>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Supplier</Button>
      </div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by vendor code, name, or GSTIN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {suppliers.length === 0 ? <EmptyState msg="No suppliers found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Vendor Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">GSTIN</th><th className="text-left px-4 py-3">Risk</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{s.vendor_code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{s.legal_name}{s.is_preferred && <Star className="inline ml-1 h-3 w-3 text-amber-500" />}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.vendor_type}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs">{s.gstin || '—'}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${riskColors[s.risk_level] || 'text-muted-foreground'}`}>{s.risk_level}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[s.status] || 'bg-slate-100'}`}>{s.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {s.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(s, 'VERIFICATION')}>Verify</Button>}
                        {s.status === 'VERIFICATION' && <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700" onClick={() => handleTransition(s, 'APPROVED')}>Approve</Button>}
                        {s.status === 'APPROVED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(s, 'ACTIVE')}>Activate</Button>}
                        {s.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(s, 'PROBATION')}>Probation</Button>}
                        {s.status === 'PROBATION' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(s, 'ACTIVE')}>Reactivate</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
      {total > 25 && (<div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{total} suppliers · Page {page}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      </div>)}
    </div>
  )
}

function CategoryList() {
  const [cats, setCats] = useState<SupplierCategory[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { try { const r = await supplierApi.listCategories(); setCats(r.data) } catch {} finally { setLoading(false) } })() }, [])
  if (loading) return <LoadingState />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Supplier Categories</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Category</Button></div>
      <Card className="p-0 overflow-hidden">
        {cats.length === 0 ? <EmptyState msg="No categories found." /> : (
          <table className="w-full"><thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase"><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Vendor Type</th></tr></thead>
          <tbody>{cats.map(c => <tr key={c.id} className="border-t hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs text-blue-700">{c.code}</td><td className="px-4 py-3 font-medium text-sm">{c.name}</td><td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{c.supplier_type}</Badge></td><td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{c.vendor_type}</Badge></td></tr>)}</tbody></table>
        )}
      </Card>
    </div>
  )
}

export function SupplierModule() {
  const [tab, setTab] = useState<Tab>('dashboard')
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t.icon}{t.label}</button>
        ))}
      </div>
      {tab === 'dashboard' && <SupplierDashboard onNavigate={setTab} />}
      {tab === 'suppliers' && <SupplierList />}
      {tab === 'categories' && <CategoryList />}
    </div>
  )
}
