'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2, FileText, ShieldCheck } from 'lucide-react'
import { qualityInspectionApi, type InspectionLot } from '../api/client'

const statusColors: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700', IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PASSED: 'bg-emerald-100 text-emerald-700', CONDITIONAL_PASS: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700', ON_HOLD: 'bg-amber-100 text-amber-700',
}

export default function QualityInspectionModule() {
  const [lots, setLots] = useState<InspectionLot[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try { const result = await qualityInspectionApi.listLots({ page: 1, pageSize: 50 }); setLots(result.data) } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Incoming Quality Inspection (IQC)</h2>
        <p className="text-slate-300 text-sm">AQL-based sampling, test parameter recording, pass/conditional pass/reject decisions, NCR + CAPA management.</p>
      </Card>
      {lots.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2"><FileText className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">No inspection lots found</p></div>
      ) : (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Lot Number</th><th className="text-left p-3">Product</th><th className="text-right p-3">Lot Qty</th><th className="text-right p-3">Sample</th><th className="text-center p-3">Status</th></tr></thead>
            <tbody>{lots.map(l => (<tr key={l.id} className="border-t hover:bg-muted/30"><td className="p-3 font-mono text-xs">{l.lot_number}</td><td className="p-3">{l.product_name}</td><td className="p-3 text-right">{Number(l.lot_quantity)}</td><td className="p-3 text-right">{l.sample_size}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs ${statusColors[l.inspection_status] || 'bg-gray-100'}`}>{l.inspection_status.replace(/_/g, ' ')}</span></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
