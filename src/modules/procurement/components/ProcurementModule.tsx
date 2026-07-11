'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { procurementApi, type PurchaseRequisition } from '../api/client'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, ClipboardList, ChevronRight, Clock, DollarSign } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><ClipboardList className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', SUBMITTED: 'bg-blue-100 text-blue-700', DEPT_REVIEW: 'bg-cyan-100 text-cyan-700',
  BUDGET_APPROVAL: 'bg-amber-100 text-amber-700', PROC_REVIEW: 'bg-purple-100 text-purple-700', APPROVED: 'bg-emerald-100 text-emerald-700',
  CONVERTED_TO_RFQ: 'bg-indigo-100 text-indigo-700', CLOSED: 'bg-zinc-100 text-zinc-500', CANCELLED: 'bg-orange-100 text-orange-700', REJECTED: 'bg-red-100 text-red-700',
}
const priorityColors: Record<string, string> = { LOW: 'text-slate-600', NORMAL: 'text-blue-600', HIGH: 'text-amber-600', URGENT: 'text-orange-600', CRITICAL: 'text-red-600' }

type Tab = 'dashboard' | 'requisitions'
const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <ClipboardList className="h-4 w-4" /> },
  { key: 'requisitions', label: 'Requisitions', icon: <ClipboardList className="h-4 w-4" /> },
]

function ProcurementDashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, totalValue: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try {
        const all = await procurementApi.list({ page: 1 })
        const pending = await procurementApi.list({ page: 1, status: 'PROC_REVIEW' })
        const approved = await procurementApi.list({ page: 1, status: 'APPROVED' })
        let totalValue = 0
        for (const pr of all.data) { totalValue += Number(pr.estimated_total ?? 0) }
        setStats({ total: all.meta.total, pending: pending.meta.total, approved: approved.meta.total, totalValue })
      } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <LoadingState />
  const cards = [
    { label: 'Total Requisitions', value: stats.total, icon: ClipboardList, color: 'text-blue-600', tab: 'requisitions' as Tab },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-600', tab: 'requisitions' as Tab },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', tab: 'requisitions' as Tab },
    { label: 'Total Estimated', value: `₹${stats.totalValue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-purple-600', tab: 'requisitions' as Tab },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Procurement Dashboard</h2>
        <p className="text-slate-300 text-sm">Purchase requisitions — from request to approval to RFQ conversion.</p>
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

function RequisitionList() {
  const [prs, setPrs] = useState<PurchaseRequisition[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const result = await procurementApi.list({ page, search: search || undefined, status: statusFilter || undefined }); setPrs(result.data); setTotal(result.meta.total) }
    catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search, statusFilter])
  useEffect(() => { load() }, [load])

  const handleTransition = async (pr: PurchaseRequisition, target: string) => {
    try { await procurementApi.transition(pr.id, target, pr.version); setSuccessMsg(`PR ${pr.pr_number} → ${target}`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Purchase Requisitions</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Requisition</Button></div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by PR number..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option><option value="SUBMITTED">Submitted</option><option value="DEPT_REVIEW">Dept Review</option>
          <option value="BUDGET_APPROVAL">Budget Approval</option><option value="PROC_REVIEW">Proc Review</option><option value="APPROVED">Approved</option>
          <option value="CONVERTED_TO_RFQ">Converted to RFQ</option><option value="CLOSED">Closed</option><option value="CANCELLED">Cancelled</option><option value="REJECTED">Rejected</option>
        </select>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {prs.length === 0 ? <EmptyState msg="No purchase requisitions found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">PR Number</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Required Date</th><th className="text-right px-4 py-3">Est. Total</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {prs.map(pr => (
                  <tr key={pr.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{pr.pr_number}</td>
                    <td className="px-4 py-3 text-xs">{pr.requisition_type.replace(/_/g, ' ')}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${priorityColors[pr.priority] || 'text-muted-foreground'}`}>{pr.priority}</td>
                    <td className="px-4 py-3 text-xs font-mono">{new Date(pr.required_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">₹{Number(pr.estimated_total).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[pr.status] || 'bg-slate-100'}`}>{pr.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {pr.status === 'DRAFT' && <Button size="sm" className="h-7 text-xs" onClick={() => handleTransition(pr, 'SUBMITTED')}>Submit</Button>}
                        {pr.status === 'SUBMITTED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(pr, 'DEPT_REVIEW')}>Dept Review</Button>}
                        {pr.status === 'DEPT_REVIEW' && <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => handleTransition(pr, 'BUDGET_APPROVAL')}>Budget</Button>}
                        {pr.status === 'BUDGET_APPROVAL' && <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => handleTransition(pr, 'PROC_REVIEW')}>Proc Review</Button>}
                        {pr.status === 'PROC_REVIEW' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(pr, 'APPROVED')}>Approve</Button>}
                        {pr.status === 'APPROVED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(pr, 'CONVERTED_TO_RFQ')}>To RFQ</Button>}
                        {['DRAFT', 'SUBMITTED'].includes(pr.status) && <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => handleTransition(pr, 'CANCELLED')}>Cancel</Button>}
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
        <p className="text-xs text-muted-foreground">{total} requisitions · Page {page}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      </div>)}
    </div>
  )
}

export function ProcurementModule() {
  const [tab, setTab] = useState<Tab>('dashboard')
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t.icon}{t.label}</button>))}
      </div>
      {tab === 'dashboard' && <ProcurementDashboard onNavigate={setTab} />}
      {tab === 'requisitions' && <RequisitionList />}
    </div>
  )
}
