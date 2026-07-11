'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { rfqApi, type Rfq } from '../api/client'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, FileText, Clock, Users } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><FileText className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', SUBMITTED: 'bg-blue-100 text-blue-700', SENT: 'bg-cyan-100 text-cyan-700',
  SUPPLIER_RESPONSE: 'bg-amber-100 text-amber-700', EVALUATION: 'bg-purple-100 text-purple-700', AWARDED: 'bg-indigo-100 text-indigo-700',
  CLOSED: 'bg-zinc-100 text-zinc-500', CANCELLED: 'bg-red-100 text-red-700',
}
const typeColors: Record<string, string> = { SINGLE_SUPPLIER: 'bg-blue-100 text-blue-700', MULTI_SUPPLIER: 'bg-emerald-100 text-emerald-700', OPEN: 'bg-purple-100 text-purple-700' }

function RfqDashboard({ onNavigate }: { onNavigate: () => void }) {
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try {
        const [all, active, closed] = await Promise.all([
          rfqApi.list({ page: 1 }),
          rfqApi.list({ page: 1, status: 'SENT' }),
          rfqApi.list({ page: 1, status: 'CLOSED' }),
        ])
        setStats({ total: all.meta.total, active: active.meta.total, closed: closed.meta.total })
      } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <LoadingState />
  const cards = [
    { label: 'Total RFQs', value: stats.total, icon: FileText, color: 'text-blue-600' },
    { label: 'Active (Sent)', value: stats.active, icon: Clock, color: 'text-amber-600' },
    { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: 'text-emerald-600' },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">RFQ Management Dashboard</h2>
        <p className="text-slate-300 text-sm">Request for Quotation — from creation to supplier invitation to evaluation and award.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(c => (
          <Card key={c.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigate}>
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{c.label}</p><c.icon className={`h-5 w-5 ${c.color}`} /></div>
            <p className="text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function RfqList() {
  const [rfqs, setRfqs] = useState<Rfq[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const result = await rfqApi.list({ page, search: search || undefined, status: statusFilter || undefined }); setRfqs(result.data); setTotal(result.meta.total) }
    catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search, statusFilter])
  useEffect(() => { load() }, [load])

  const handleTransition = async (rfq: Rfq, target: string) => {
    try { await rfqApi.transition(rfq.id, target, rfq.version); setSuccessMsg(`RFQ ${rfq.rfq_number} → ${target}`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Request for Quotations</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New RFQ</Button></div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by RFQ number..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option><option value="SUBMITTED">Submitted</option><option value="SENT">Sent</option>
          <option value="SUPPLIER_RESPONSE">Supplier Response</option><option value="EVALUATION">Evaluation</option>
          <option value="AWARDED">Awarded</option><option value="CLOSED">Closed</option><option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {rfqs.length === 0 ? <EmptyState msg="No RFQs found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">RFQ Number</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">PR Ref</th>
                <th className="text-left px-4 py-3">Closing Date</th><th className="text-left px-4 py-3">Buyer</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {rfqs.map(rfq => (
                  <tr key={rfq.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{rfq.rfq_number}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${typeColors[rfq.rfq_type] || 'bg-slate-100'}`}>{rfq.rfq_type.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-xs font-mono">{rfq.pr_number || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono">{new Date(rfq.closing_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs">{rfq.buyer_name}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[rfq.status] || 'bg-slate-100'}`}>{rfq.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {rfq.status === 'DRAFT' && <Button size="sm" className="h-7 text-xs" onClick={() => handleTransition(rfq, 'SUBMITTED')}>Submit</Button>}
                        {rfq.status === 'SUBMITTED' && <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700" onClick={() => handleTransition(rfq, 'SENT')}>Send</Button>}
                        {rfq.status === 'SENT' && <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => handleTransition(rfq, 'SUPPLIER_RESPONSE')}>Responses</Button>}
                        {rfq.status === 'SUPPLIER_RESPONSE' && <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => handleTransition(rfq, 'EVALUATION')}>Evaluate</Button>}
                        {rfq.status === 'EVALUATION' && <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => handleTransition(rfq, 'AWARDED')}>Award</Button>}
                        {rfq.status === 'AWARDED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(rfq, 'CLOSED')}>Close</Button>}
                        {['DRAFT', 'SUBMITTED', 'SENT'].includes(rfq.status) && <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => handleTransition(rfq, 'CANCELLED')}>Cancel</Button>}
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
        <p className="text-xs text-muted-foreground">{total} RFQs · Page {page}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      </div>)}
    </div>
  )
}

type Tab = 'dashboard' | 'rfqs'
const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <FileText className="h-4 w-4" /> },
  { key: 'rfqs', label: 'RFQs', icon: <FileText className="h-4 w-4" /> },
]

export function RfqModule() {
  const [tab, setTab] = useState<Tab>('dashboard')
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t.icon}{t.label}</button>))}
      </div>
      {tab === 'dashboard' && <RfqDashboard onNavigate={() => setTab('rfqs')} />}
      {tab === 'rfqs' && <RfqList />}
    </div>
  )
}
