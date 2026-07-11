'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { customerApi, type Customer } from '../api/client'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, Users, Shield, AlertOctagon, ChevronRight } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><Users className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  LEAD: 'bg-slate-100 text-slate-700', PROSPECT: 'bg-blue-100 text-blue-700', APPROVED: 'bg-cyan-100 text-cyan-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700', BLOCKED: 'bg-red-100 text-red-700', INACTIVE: 'bg-amber-100 text-amber-700', ARCHIVED: 'bg-zinc-100 text-zinc-500',
}
const riskColors: Record<string, string> = { LOW: 'text-emerald-600', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' }
const typeColors: Record<string, string> = {
  RETAIL: 'bg-blue-100 text-blue-700', WHOLESALE: 'bg-purple-100 text-purple-700', DISTRIBUTOR: 'bg-emerald-100 text-emerald-700',
  CORPORATE: 'bg-indigo-100 text-indigo-700', EXPORT: 'bg-orange-100 text-orange-700', FRANCHISE: 'bg-pink-100 text-pink-700',
}

type Tab = 'dashboard' | 'customers' | 'groups'
const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <Users className="h-4 w-4" /> },
  { key: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
  { key: 'groups', label: 'Groups', icon: <Shield className="h-4 w-4" /> },
]

function CustomerDashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState({ total: 0, active: 0, creditHold: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try {
        const [all, active] = await Promise.all([
          customerApi.list({ page: 1 }),
          customerApi.list({ page: 1, status: 'ACTIVE' }),
        ])
        setStats({ total: all.meta.total, active: active.meta.total, creditHold: 0 })
      } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <LoadingState />
  const cards = [
    { label: 'Total Customers', value: stats.total, icon: Users, color: 'text-blue-600', tab: 'customers' as Tab },
    { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', tab: 'customers' as Tab },
    { label: 'Credit Hold', value: stats.creditHold, icon: AlertOctagon, color: 'text-red-600', tab: 'customers' as Tab },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Customer Master Dashboard</h2>
        <p className="text-slate-300 text-sm">Centralized customer management — Sales, Distribution, Retail, Restaurant, CRM, and Finance.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const result = await customerApi.list({ page, search: search || undefined }); setCustomers(result.data); setTotal(result.meta.total) }
    catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { load() }, [load])

  const handleTransition = async (c: Customer, target: string) => {
    try { await customerApi.transition(c.id, target, c.version); setSuccessMsg(`Customer "${c.trade_name}" transitioned to ${target}`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Customers</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Customer</Button></div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by code, name, or GSTIN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {customers.length === 0 ? <EmptyState msg="No customers found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">GSTIN</th><th className="text-left px-4 py-3">Risk</th><th className="text-left px-4 py-3">Credit Hold</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{c.customer_code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{c.trade_name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${typeColors[c.customer_type] || 'bg-slate-100'}`}>{c.customer_type}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs">{c.gstin || '—'}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${riskColors[c.risk_rating] || 'text-muted-foreground'}`}>{c.risk_rating}</td>
                    <td className="px-4 py-3 text-center">{c.credit_hold && <AlertOctagon className="h-4 w-4 text-red-500 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[c.status] || 'bg-slate-100'}`}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {c.status === 'LEAD' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(c, 'PROSPECT')}>Qualify</Button>}
                        {c.status === 'PROSPECT' && <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700" onClick={() => handleTransition(c, 'APPROVED')}>Approve</Button>}
                        {c.status === 'APPROVED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(c, 'ACTIVE')}>Activate</Button>}
                        {c.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(c, 'BLOCKED')}>Block</Button>}
                        {c.status === 'BLOCKED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(c, 'ACTIVE')}>Unblock</Button>}
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
        <p className="text-xs text-muted-foreground">{total} customers · Page {page}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      </div>)}
    </div>
  )
}

function GroupList() {
  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { try { const r = await customerApi.listGroups(); setGroups(r.data) } catch {} finally { setLoading(false) } })() }, [])
  if (loading) return <LoadingState />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Customer Groups</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Group</Button></div>
      <Card className="p-0 overflow-hidden">
        {groups.length === 0 ? <EmptyState msg="No groups found." /> : (
          <table className="w-full"><thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase"><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th></tr></thead>
          <tbody>{groups.map(g => <tr key={g.id} className="border-t hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs text-blue-700">{g.code}</td><td className="px-4 py-3 font-medium text-sm">{g.name}</td></tr>)}</tbody></table>
        )}
      </Card>
    </div>
  )
}

export function CustomerModule() {
  const [tab, setTab] = useState<Tab>('dashboard')
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t.icon}{t.label}</button>))}
      </div>
      {tab === 'dashboard' && <CustomerDashboard onNavigate={setTab} />}
      {tab === 'customers' && <CustomerList />}
      {tab === 'groups' && <GroupList />}
    </div>
  )
}
