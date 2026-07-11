'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { quotationApi, type Quotation, type ComparisonResult } from '../api/client'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, FileText, Clock, Trophy, Scale, TrendingDown, Star } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><FileText className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  TECHNICAL_REVIEW: 'bg-cyan-100 text-cyan-700',
  COMMERCIAL_REVIEW: 'bg-amber-100 text-amber-700',
  RECOMMENDED: 'bg-purple-100 text-purple-700',
  AWARDED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-zinc-100 text-zinc-500',
}

function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function QuotationDashboard({ onNavigate }: { onNavigate: () => void }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, awarded: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [all, pending, awarded] = await Promise.all([
          quotationApi.list({ page: 1 }),
          quotationApi.list({ page: 1, status: 'COMMERCIAL_REVIEW' }),
          quotationApi.list({ page: 1, status: 'AWARDED' }),
        ])
        setStats({ total: all.meta.total, pending: pending.meta.total, awarded: awarded.meta.total })
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <LoadingState />

  const cards = [
    { label: 'Total Quotations', value: stats.total, icon: FileText, color: 'text-blue-600' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600' },
    { label: 'Awarded', value: stats.awarded, icon: Trophy, color: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Supplier Quotation Management</h2>
        <p className="text-slate-300 text-sm">Manage supplier quotations, compare bids, and award contracts — the single approved source for vendor pricing.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(c => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
              <c.icon className={`h-8 w-8 ${c.color}`} />
            </div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={onNavigate}>View All Quotations</Button>
      </div>
    </div>
  )
}

function QuotationList({ onBack }: { onBack: () => void }) {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await quotationApi.list({ page: 1, pageSize: 50, search: search || undefined, status: statusFilter || undefined })
      setQuotations(result.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load quotations')
    } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingState />
  if (error) return <ErrorState msg={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">All Quotations</h2>
        <Button variant="outline" onClick={onBack}>Back to Dashboard</Button>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Search by quotation number or supplier..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <select className="px-3 py-2 border rounded-md text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="TECHNICAL_REVIEW">Technical Review</option>
          <option value="COMMERCIAL_REVIEW">Commercial Review</option>
          <option value="RECOMMENDED">Recommended</option>
          <option value="AWARDED">Awarded</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <Button variant="outline" onClick={load}><Search className="h-4 w-4 mr-1" />Search</Button>
      </div>
      {quotations.length === 0 ? (
        <EmptyState msg="No quotations found" />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Quotation #</th>
                <th className="text-left p-3 font-medium">Supplier</th>
                <th className="text-left p-3 font-medium">RFQ #</th>
                <th className="text-right p-3 font-medium">Grand Total</th>
                <th className="text-center p-3 font-medium">Score</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{q.quotation_number}</td>
                  <td className="p-3">{q.supplier_name} <span className="text-xs text-muted-foreground">({q.supplier_code})</span></td>
                  <td className="p-3 font-mono text-xs">{q.rfq_number}</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(Number(q.grand_total), q.currency)}</td>
                  <td className="p-3 text-center">
                    {q.overall_score ? <Badge variant="secondary">{Number(q.overall_score).toFixed(1)}</Badge> : '—'}
                    {q.is_best_value && <Trophy className="inline ml-1 h-3 w-3 text-amber-500" />}
                  </td>
                  <td className="p-3 text-center"><Badge className={statusColors[q.status] || 'bg-gray-100'}>{q.status.replace(/_/g, ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function QuotationModule() {
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard')
  return view === 'dashboard'
    ? <QuotationDashboard onNavigate={() => setView('list')} />
    : <QuotationList onBack={() => setView('dashboard')} />
}
