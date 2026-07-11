'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileText } from 'lucide-react'
import { goodsReceiptApi, type GoodsReceipt } from '../api/client'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', VERIFIED: 'bg-blue-100 text-blue-700',
  UNDER_INSPECTION: 'bg-amber-100 text-amber-700', ACCEPTED: 'bg-emerald-100 text-emerald-700',
  PARTIALLY_ACCEPTED: 'bg-yellow-100 text-yellow-700', REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-zinc-100 text-zinc-500', CANCELLED: 'bg-red-100 text-red-700',
}

export default function GoodsReceiptModule() {
  const [grns, setGrns] = useState<GoodsReceipt[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try { const result = await goodsReceiptApi.list({ page: 1, pageSize: 50 }); setGrns(result.data) } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Goods Receipt (GRN)</h2>
        <p className="text-slate-300 text-sm">Receive supplier deliveries against purchase orders with damage recording and short/over receipt tracking.</p>
      </Card>
      {grns.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2"><FileText className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">No goods receipts found</p></div>
      ) : (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">GRN Number</th><th className="text-left p-3">Supplier</th><th className="text-right p-3">Total Qty</th><th className="text-center p-3">Status</th></tr></thead>
            <tbody>{grns.map(g => (<tr key={g.id} className="border-t hover:bg-muted/30"><td className="p-3 font-mono text-xs">{g.grn_number}</td><td className="p-3">{g.supplier_name}</td><td className="p-3 text-right">{Number(g.total_qty)}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs ${statusColors[g.status] || 'bg-gray-100'}`}>{g.status.replace(/_/g, ' ')}</span></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
