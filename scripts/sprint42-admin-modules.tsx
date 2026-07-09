// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 42 — PRODUCTION COSTING, MFG FINANCE & VARIANCE ANALYSIS
// Admin modules: Cost Dashboard, Batch Cost, Variance, Labor, Machine, Utility,
// Overhead, Roll-Up, Mfg Finance
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Production Cost Dashboard ──────────────────────────────────────────
function ProductionCostDashboardModule() {
  const kpis = {
    totalProductionCost: 184600, totalPlannedCost: 178400, totalVariance: 6200,
    variancePercent: 3.5, batchesCosted: 24, batchesPending: 3,
    avgCostPerKg: 152.4, journalsGenerated: 47, journalsPosted: 47,
    postingSuccessRate: 100, avgCalculationMs: 2840, avgJournalMs: 1240,
  }
  const costBreakdown = [
    { component: 'Material', amount: 95000, percent: 51.5, color: 'bg-blue-500' },
    { component: 'Packaging', amount: 28000, percent: 15.2, color: 'bg-purple-500' },
    { component: 'Labor', amount: 24000, percent: 13.0, color: 'bg-emerald-500' },
    { component: 'Machine', amount: 18000, percent: 9.8, color: 'bg-amber-500' },
    { component: 'Utility', amount: 8600, percent: 4.7, color: 'bg-cyan-500' },
    { component: 'Overhead', amount: 9000, percent: 4.9, color: 'bg-pink-500' },
    { component: 'Quality', amount: 2000, percent: 1.1, color: 'bg-orange-500' },
  ]
  const recentBatches = [
    { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', qty: 94, planned: 18800, actual: 20140, variance: 1340, variancePct: 7.1, perKg: 214.3, status: 'REVIEW_REQUIRED' },
    { batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', qty: 98, planned: 19600, actual: 20901, variance: 1301, variancePct: 6.6, perKg: 213.3, status: 'REVIEW_REQUIRED' },
    { batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', qty: 95, planned: 9500, actual: 9835, variance: 335, variancePct: 3.5, perKg: 103.5, status: 'WITHIN_THRESHOLD' },
    { batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', qty: 98, planned: 14700, actual: 15680, variance: 980, variancePct: 6.7, perKg: 160.0, status: 'REVIEW_REQUIRED' },
    { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', qty: 250, planned: 25000, actual: 27150, variance: 2150, variancePct: 8.6, perKg: 108.6, status: 'CRITICAL' },
  ]
  const profitability = [
    { product: 'Kaju Katli 500g', costPerUnit: 107.13, sellingPrice: 175, margin: 67.87, marginPct: 38.8 },
    { product: 'Kaju Katli 1kg', costPerUnit: 213.27, sellingPrice: 340, margin: 126.73, marginPct: 37.3 },
    { product: 'Shwet Idli Batter 1kg', costPerUnit: 103.5, sellingPrice: 130, margin: 26.5, marginPct: 20.4 },
    { product: 'Motichoor Laddu 1kg', costPerUnit: 160.0, sellingPrice: 240, margin: 80.0, marginPct: 33.3 },
    { product: 'Mixed Namkeen 500g', costPerUnit: 108.6, sellingPrice: 140, margin: 31.4, marginPct: 22.4 },
  ]
  const varianceStatusColors: Record<string, string> = { WITHIN_THRESHOLD: 'bg-emerald-100 text-emerald-700', REVIEW_REQUIRED: 'bg-amber-100 text-amber-700', CRITICAL: 'bg-rose-100 text-rose-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6 text-amber-600" />Production Cost Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Material + Labor + Machine + Utilities + Overhead = Manufacturing Cost → Finance</p>
        </div>
        <Button size="sm"><Calculator className="mr-1 h-4 w-4" />Calculate Cost</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Production Cost', value: fmtINR(kpis.totalProductionCost), color: 'text-blue-600', icon: IndianRupee },
          { label: 'Total Planned Cost', value: fmtINR(kpis.totalPlannedCost), color: 'text-emerald-600', icon: Calculator },
          { label: 'Total Variance', value: fmtINR(kpis.totalVariance), color: 'text-rose-600', icon: TrendingUp },
          { label: 'Variance %', value: `${kpis.variancePercent}%`, color: 'text-amber-600', icon: Percent },
          { label: 'Batches Costed', value: kpis.batchesCosted, color: 'text-blue-600', icon: Boxes },
          { label: 'Avg Cost / Kg', value: fmtINR(kpis.avgCostPerKg), color: 'text-purple-600', icon: Scale },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/40" />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Journals Generated', value: kpis.journalsGenerated, color: 'text-blue-600' },
          { label: 'Journals Posted', value: kpis.journalsPosted, color: 'text-emerald-600' },
          { label: 'Posting Success', value: `${kpis.postingSuccessRate}%`, color: 'text-emerald-600' },
          { label: 'Avg Calc Time', value: `${(kpis.avgCalculationMs / 1000).toFixed(2)}s`, color: 'text-cyan-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Three-Way Cost Comparison (Chief Architect Recommendation)</p>
            <p className="text-xs text-muted-foreground mt-1">For every batch: <strong>(1) Planned Cost</strong> from approved recipe+BOM before production, <strong>(2) Actual Manufacturing Cost</strong> after production (material+labor+machine+utilities+packaging), <strong>(3) Variance Cost</strong> = difference highlighting inefficiencies (excess ingredient, low yield, downtime, overtime). Gives management complete profitability visibility and drives continuous improvement.</p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Cost Breakdown</h3>
          <div className="space-y-2">
            {costBreakdown.map(c => (
              <div key={c.component}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{c.component}</span>
                  <span className="text-muted-foreground">{fmtINR(c.amount)} ({c.percent}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Profitability by Product</h3>
          <div className="space-y-2">
            {profitability.map(p => (
              <div key={p.product} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                <div className="flex-1">
                  <p className="text-xs font-medium">{p.product}</p>
                  <p className="text-[10px] text-muted-foreground">Cost: ₹{p.costPerUnit} · Sell: ₹{p.sellingPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">₹{p.margin}</p>
                  <p className="text-[10px] text-emerald-600">{p.marginPct}% margin</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Batch Costs</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Batch</th>
                <th className="px-3 py-2 font-medium">Product / Qty</th>
                <th className="px-3 py-2 font-medium text-right">Planned</th>
                <th className="px-3 py-2 font-medium text-right">Actual</th>
                <th className="px-3 py-2 font-medium text-right">Variance</th>
                <th className="px-3 py-2 font-medium text-right">Var %</th>
                <th className="px-3 py-2 font-medium text-right">Per Kg</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches.map(b => (
                <tr key={b.batch} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{b.batch}</td>
                  <td className="px-3 py-2"><p className="font-medium">{b.product}</p><p className="text-[10px] text-muted-foreground">{b.qty} KG</p></td>
                  <td className="px-3 py-2 text-right">{fmtINR(b.planned)}</td>
                  <td className="px-3 py-2 text-right font-medium">{fmtINR(b.actual)}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">+{fmtINR(b.variance)}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">{b.variancePct}%</td>
                  <td className="px-3 py-2 text-right font-medium">₹{b.perKg}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${varianceStatusColors[b.status]}`}>{b.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Batch Cost Analysis ────────────────────────────────────────────────
function BatchCostAnalysisModule() {
  const [selectedBatch, setSelectedBatch] = useState('KAJ-THN-20260709-000145')
  const threeWay = {
    planned: { material: 9200, packaging: 1280, labor: 2300, machine: 1700, utility: 800, overhead: 1150, quality: 200, warehouse: 50, total: 16880, perKg: 179.6 },
    actual: { material: 9400, packaging: 1340, labor: 2400, machine: 1800, utility: 860, overhead: 1200, quality: 200, warehouse: 50, total: 20140, perKg: 214.3 },
    variance: { material: 200, packaging: 60, labor: 100, machine: 100, utility: 60, overhead: 50, quality: 0, warehouse: 0, total: 1340, perKg: 14.3 },
  }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  const components = ['material', 'packaging', 'labor', 'machine', 'utility', 'overhead', 'quality', 'warehouse', 'total']
  const compLabels: Record<string, string> = { material: 'Material', packaging: 'Packaging', labor: 'Labor', machine: 'Machine', utility: 'Utility', overhead: 'Overhead', quality: 'Quality', warehouse: 'WH Transfer', total: 'Total' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Boxes className="h-6 w-6 text-blue-600" />Batch Cost Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 6 · 3-way comparison: Planned vs Actual vs Variance · Cost per kg</p>
        </div>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="text-xs border rounded px-2 py-1.5 bg-background h-9">
          <option>KAJ-THN-20260709-000145 · Kaju Katli 500g</option>
          <option>KAJ-THN-20260709-000146 · Kaju Katli 1kg</option>
          <option>SHW-THN-20260709-000047 · Shwet Idli Batter 1kg</option>
          <option>NAM-THN-20260709-000021 · Mixed Namkeen 500g</option>
        </select>
      </div>
      <Card className="p-4 bg-blue-50/40 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-xs text-blue-700">{selectedBatch}</p>
            <p className="font-semibold">Kaju Katli 500g · 94 KG batch</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Cost per KG</p>
            <p className="text-2xl font-bold text-blue-700">₹214.3</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Three-Way Cost Comparison</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Cost Component</th>
                <th className="px-3 py-2 font-medium text-right">Planned Cost</th>
                <th className="px-3 py-2 font-medium text-right">Actual Cost</th>
                <th className="px-3 py-2 font-medium text-right">Variance</th>
                <th className="px-3 py-2 font-medium text-right">Variance %</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {components.map(c => {
                const planned = (threeWay.planned as any)[c]
                const actual = (threeWay.actual as any)[c]
                const variance = (threeWay.variance as any)[c]
                const variancePct = planned > 0 ? (variance / planned) * 100 : 0
                const isTotal = c === 'total'
                return (
                  <tr key={c} className={`border-t hover:bg-muted/30 ${isTotal ? 'bg-blue-50/50 font-bold' : ''}`}>
                    <td className="px-3 py-2">{compLabels[c]}</td>
                    <td className="px-3 py-2 text-right">{fmtINR(planned)}</td>
                    <td className="px-3 py-2 text-right">{fmtINR(actual)}</td>
                    <td className={`px-3 py-2 text-right ${variance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{variance > 0 ? '+' : ''}{fmtINR(variance)}</td>
                    <td className={`px-3 py-2 text-right ${variancePct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{variancePct > 0 ? '+' : ''}{variancePct.toFixed(1)}%</td>
                    <td className="px-3 py-2">{!isTotal && variance > 0 && variancePct > 5 ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">REVIEW</span> : !isTotal ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">OK</span> : <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">REVIEW_REQUIRED</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-emerald-50/50 border-emerald-200">
          <p className="text-xs text-muted-foreground">Planned Cost</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{fmtINR(threeWay.planned.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">₹{threeWay.planned.perKg}/KG · From approved recipe+BOM</p>
        </Card>
        <Card className="p-4 bg-blue-50/50 border-blue-200">
          <p className="text-xs text-muted-foreground">Actual Manufacturing Cost</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{fmtINR(threeWay.actual.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">₹{threeWay.actual.perKg}/KG · From actual consumption</p>
        </Card>
        <Card className="p-4 bg-rose-50/50 border-rose-200">
          <p className="text-xs text-muted-foreground">Variance Cost</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">+{fmtINR(threeWay.variance.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">+₹{threeWay.variance.perKg}/KG · 7.1% over plan</p>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Profitability Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border bg-muted/20">
            <p className="text-xs text-muted-foreground">Cost / Unit</p>
            <p className="text-lg font-bold">₹107.13</p>
          </div>
          <div className="p-3 rounded-lg border bg-muted/20">
            <p className="text-xs text-muted-foreground">Selling Price / Unit</p>
            <p className="text-lg font-bold text-emerald-600">₹175.00</p>
          </div>
          <div className="p-3 rounded-lg border bg-emerald-50">
            <p className="text-xs text-muted-foreground">Gross Margin / Unit</p>
            <p className="text-lg font-bold text-emerald-600">₹67.87</p>
          </div>
          <div className="p-3 rounded-lg border bg-emerald-50">
            <p className="text-xs text-muted-foreground">Gross Margin %</p>
            <p className="text-lg font-bold text-emerald-600">38.8%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Variance Dashboard ─────────────────────────────────────────────────
function VarianceDashboardModule() {
  const varianceByType = [
    { type: 'MATERIAL', count: 6, favorable: 4, unfavorable: 2, totalAmount: 2800, avgPercent: 2.1, severity: 'MEDIUM' },
    { type: 'LABOR', count: 9, favorable: 6, unfavorable: 3, totalAmount: 1500, avgPercent: 3.4, severity: 'LOW' },
    { type: 'MACHINE', count: 6, favorable: 2, unfavorable: 4, totalAmount: 1900, avgPercent: 5.2, severity: 'HIGH' },
    { type: 'YIELD', count: 4, favorable: 3, unfavorable: 1, totalAmount: -800, avgPercent: -1.5, severity: 'LOW' },
    { type: 'UTILITY', count: 6, favorable: 5, unfavorable: 1, totalAmount: 400, avgPercent: 2.8, severity: 'LOW' },
    { type: 'OVERHEAD', count: 6, favorable: 4, unfavorable: 2, totalAmount: 400, avgPercent: 1.9, severity: 'LOW' },
    { type: 'PURCHASE_PRICE', count: 3, favorable: 1, unfavorable: 2, totalAmount: 1200, avgPercent: 4.5, severity: 'MEDIUM' },
    { type: 'TIME', count: 4, favorable: 2, unfavorable: 2, totalAmount: 0, avgPercent: 0, severity: 'LOW' },
  ]
  const topVariances = [
    { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'MATERIAL', amount: 1500, percent: 8.6, direction: 'UNFAVORABLE', severity: 'CRITICAL', cause: 'Cashew price spike + oil cost increase', action: 'Negotiate annual contract with Sri Balaji Cashews', owner: 'Procurement Head', status: 'OPEN' },
    { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'MACHINE', amount: 600, percent: 8.6, direction: 'UNFAVORABLE', severity: 'HIGH', cause: 'FRY-01 downtime 25 mins', action: 'Schedule preventive maintenance', owner: 'Maintenance Lead', status: 'IN_PROGRESS' },
    { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'MATERIAL', amount: 200, percent: 2.2, direction: 'UNFAVORABLE', severity: 'LOW', cause: 'Cashew W320 lot price higher', action: 'Accept - within tolerance', owner: null, status: 'ACCEPTED' },
    { batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'LABOR', amount: 200, percent: 6.7, direction: 'UNFAVORABLE', severity: 'MEDIUM', cause: 'Operator overtime due to batch rework', action: 'Review rework procedure', owner: 'Production Supervisor', status: 'OPEN' },
    { batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'UTILITY', amount: 50, percent: 5.9, direction: 'UNFAVORABLE', severity: 'LOW', cause: 'Gas pressure fluctuation', action: 'Install regulator', owner: 'Maintenance Lead', status: 'OPEN' },
  ]
  const severityColors: Record<string, string> = { LOW: 'bg-slate-100 text-slate-700', MEDIUM: 'bg-amber-100 text-amber-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-rose-100 text-rose-700' }
  const directionColors: Record<string, string> = { FAVORABLE: 'bg-emerald-100 text-emerald-700', UNFAVORABLE: 'bg-rose-100 text-rose-700' }
  const statusColors: Record<string, string> = { OPEN: 'bg-amber-100 text-amber-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', RESOLVED: 'bg-emerald-100 text-emerald-700', ACCEPTED: 'bg-slate-100 text-slate-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-rose-600" />Variance Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 7 · 8 variance types · Favorable vs Unfavorable · Root cause tracking</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Variances', value: 24, color: 'text-blue-600' },
          { label: 'Favorable', value: 14, color: 'text-emerald-600' },
          { label: 'Unfavorable', value: 10, color: 'text-rose-600' },
          { label: 'Critical', value: 1, color: 'text-rose-700' },
          { label: 'Total Variance Amount', value: fmtINR(6200), color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Variances by Type</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Variance Type</th>
                <th className="px-3 py-2 font-medium text-center">Count</th>
                <th className="px-3 py-2 font-medium text-center">Favorable</th>
                <th className="px-3 py-2 font-medium text-center">Unfavorable</th>
                <th className="px-3 py-2 font-medium text-right">Total Amount</th>
                <th className="px-3 py-2 font-medium text-right">Avg %</th>
                <th className="px-3 py-2 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {varianceByType.map(v => (
                <tr key={v.type} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{v.type.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 text-center">{v.count}</td>
                  <td className="px-3 py-2 text-center text-emerald-600">{v.favorable}</td>
                  <td className="px-3 py-2 text-center text-rose-600">{v.unfavorable}</td>
                  <td className={`px-3 py-2 text-right font-medium ${v.totalAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{v.totalAmount > 0 ? '+' : ''}{fmtINR(v.totalAmount)}</td>
                  <td className={`px-3 py-2 text-right ${v.avgPercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{v.avgPercent > 0 ? '+' : ''}{v.avgPercent}%</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColors[v.severity]}`}>{v.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Top Variances (Requiring Action)</h3></div>
        <div className="space-y-2 p-3">
          {topVariances.map((v, i) => (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${v.severity === 'CRITICAL' ? 'border-rose-500 bg-rose-50/30' : v.severity === 'HIGH' ? 'border-orange-500 bg-orange-50/30' : 'border-amber-400 bg-amber-50/30'}`}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-blue-700">{v.batch}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{v.type}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${directionColors[v.direction]}`}>{v.direction}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityColors[v.severity]}`}>{v.severity}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[v.status]}`}>{v.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rose-600">+{fmtINR(v.amount)}</p>
                  <p className="text-[10px] text-rose-600">+{v.percent}%</p>
                </div>
              </div>
              <p className="text-xs font-medium">{v.product}</p>
              <p className="text-[11px] text-muted-foreground mt-1"><strong>Root Cause:</strong> {v.cause}</p>
              <p className="text-[11px] text-blue-700 mt-1"><strong>Action:</strong> {v.action}</p>
              {v.owner && <p className="text-[10px] text-muted-foreground mt-1">Owner: {v.owner}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Labor Cost Module ──────────────────────────────────────────────────
function LaborCostModule() {
  const allocations = [
    { code: 'LCA-2026-00048', po: 'PO-2026-00125', operator: 'Rajesh Kumar (OP-001)', shift: 'SHIFT-A', type: 'DIRECT', start: '06:30', end: '08:00', hours: 1.5, rate: 250, regular: 375, overtime: 0, total: 375, product: 'Kaju Katli 500g', wc: 'WC-KK-03' },
    { code: 'LCA-2026-00047', po: 'PO-2026-00125', operator: 'Rajesh Kumar (OP-001)', shift: 'SHIFT-A', type: 'DIRECT', start: '08:00', end: '10:00', hours: 2.0, rate: 250, regular: 500, overtime: 0, total: 500, product: 'Kaju Katli 500g', wc: 'WC-KK-03' },
    { code: 'LCA-2026-00046', po: 'PO-2026-00125', operator: 'Rajesh Kumar (OP-001)', shift: 'SHIFT-A', type: 'SETUP', start: '06:00', end: '06:30', hours: 0.5, rate: 250, regular: 125, overtime: 0, total: 125, product: 'Kaju Katli 500g', wc: 'WC-KK-03' },
    { code: 'LCA-2026-00045', po: 'PO-2026-00126', operator: 'Anil Reddy (OP-002)', shift: 'SHIFT-A', type: 'DIRECT', start: '05:00', end: '08:00', hours: 3.0, rate: 220, regular: 660, overtime: 0, total: 660, product: 'Shwet Idli Batter 1kg', wc: 'WC-IB-02' },
    { code: 'LCA-2026-00044', po: 'PO-2026-00127', operator: 'Suresh Mehta (OP-003)', shift: 'SHIFT-B', type: 'OVERTIME', start: '14:00', end: '17:00', hours: 3.0, rate: 240, regular: 0, overtime: 1080, total: 1080, product: 'Mixed Namkeen 500g', wc: 'WC-NM-04' },
    { code: 'LCA-2026-00043', po: null, operator: 'Lakshmi V. (OP-005)', shift: 'SHIFT-A', type: 'INDIRECT', start: '06:00', end: '14:00', hours: 8.0, rate: 350, regular: 2800, overtime: 0, total: 2800, product: null, wc: 'ALL' },
  ]
  const typeColors: Record<string, string> = { DIRECT: 'bg-emerald-100 text-emerald-700', INDIRECT: 'bg-slate-100 text-slate-700', OVERTIME: 'bg-amber-100 text-amber-700', SETUP: 'bg-blue-100 text-blue-700', IDLE: 'bg-rose-100 text-rose-700', TRAINING: 'bg-purple-100 text-purple-700', CLEANING: 'bg-cyan-100 text-cyan-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-emerald-600" />Labor Cost Allocation</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 3 · Hours × Rate = Labor Cost · Direct/Indirect/Overtime/Setup/Idle/Training/Cleaning</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Labor Cost', value: fmtINR(18420), color: 'text-emerald-600' },
          { label: 'Direct Labor', value: fmtINR(14240), color: 'text-emerald-600' },
          { label: 'Indirect Labor', value: fmtINR(2800), color: 'text-slate-600' },
          { label: 'Overtime', value: fmtINR(1080), color: 'text-amber-600' },
          { label: 'Setup', value: fmtINR(125), color: 'text-blue-600' },
          { label: 'Idle', value: fmtINR(0), color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Operator / Shift</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium text-right">Hours</th>
                <th className="px-3 py-2 font-medium text-right">Rate</th>
                <th className="px-3 py-2 font-medium text-right">Regular</th>
                <th className="px-3 py-2 font-medium text-right">Overtime</th>
                <th className="px-3 py-2 font-medium text-right">Total</th>
                <th className="px-3 py-2 font-medium">Product / WC</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(a => (
                <tr key={a.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{a.code}</td>
                  <td className="px-3 py-2"><p className="font-medium">{a.operator}</p><p className="text-[10px] text-muted-foreground">{a.shift}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[a.type]}`}>{a.type}</span></td>
                  <td className="px-3 py-2 text-[11px]">{a.start} - {a.end}</td>
                  <td className="px-3 py-2 text-right font-medium">{a.hours}h</td>
                  <td className="px-3 py-2 text-right">₹{a.rate}/h</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{fmtINR(a.regular)}</td>
                  <td className="px-3 py-2 text-right text-amber-600">{a.overtime > 0 ? fmtINR(a.overtime) : '—'}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmtINR(a.total)}</td>
                  <td className="px-3 py-2 text-[11px]">{a.product || '—'}<p className="text-[10px] text-muted-foreground">{a.wc}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-emerald-50/40 border-emerald-200">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Labor Cost Formula</p>
            <p className="text-xs text-muted-foreground mt-1">Hours Worked × Hourly Rate = Labor Cost. Overtime: Hours × Overtime Rate (typically 1.5x). Indirect labor (supervisors, cleaners) allocated by Labor Hours method. Setup time tracked separately for accurate machine costing.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Machine Cost Module ────────────────────────────────────────────────
function MachineCostModule() {
  const allocations = [
    { code: 'MCA-2026-00048', po: 'PO-2026-00125', machine: 'COOK-01', name: 'Cooking Kettle 01', start: '06:35', end: '08:00', runtime: 1.42, setup: 0.5, idle: 0, downtime: 0, rate: 800, runtimeCost: 1136, setupCost: 400, maintenance: 50, total: 1586 },
    { code: 'MCA-2026-00047', po: 'PO-2026-00125', machine: 'COOK-01', name: 'Cooking Kettle 01', start: '11:00', end: '13:00', runtime: 2.0, setup: 0, idle: 0, downtime: 0, rate: 800, runtimeCost: 1600, setupCost: 0, maintenance: 50, total: 1650 },
    { code: 'MCA-2026-00046', po: 'PO-2026-00126', machine: 'GRIND-01', name: 'Wet Grinder 01', start: '05:10', end: '08:00', runtime: 2.83, setup: 0.17, idle: 0, downtime: 0, rate: 500, runtimeCost: 1416, setupCost: 84, maintenance: 0, total: 1500 },
    { code: 'MCA-2026-00045', po: 'PO-2026-00127', machine: 'FRY-01', name: 'Continuous Fryer 01', start: '06:00', end: '10:00', runtime: 3.5, setup: 0.5, idle: 0, downtime: 0.42, rate: 1000, runtimeCost: 3500, setupCost: 500, maintenance: 0, total: 4000 },
    { code: 'MCA-2026-00044', po: 'PO-2026-00129', machine: 'PACK-03', name: 'Packaging Machine 03', start: '14:00', end: '17:00', runtime: 2.5, setup: 0.5, idle: 0, downtime: 0, rate: 600, runtimeCost: 1500, setupCost: 300, maintenance: 100, total: 1900 },
  ]
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-amber-600" />Machine Cost Allocation</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 4 · Machine Runtime × Cost Rate = Machine Cost · Tracks setup/idle/downtime</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Machine Cost', value: fmtINR(10636), color: 'text-amber-600' },
          { label: 'Runtime Cost', value: fmtINR(9152), color: 'text-amber-600' },
          { label: 'Setup Cost', value: fmtINR(1284), color: 'text-blue-600' },
          { label: 'Maintenance', value: fmtINR(200), color: 'text-purple-600' },
          { label: 'Downtime Hours', value: '0.42h', color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium text-right">Runtime</th>
                <th className="px-3 py-2 font-medium text-right">Setup</th>
                <th className="px-3 py-2 font-medium text-right">Downtime</th>
                <th className="px-3 py-2 font-medium text-right">Rate/h</th>
                <th className="px-3 py-2 font-medium text-right">Runtime Cost</th>
                <th className="px-3 py-2 font-medium text-right">Setup Cost</th>
                <th className="px-3 py-2 font-medium text-right">Maint.</th>
                <th className="px-3 py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(a => (
                <tr key={a.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{a.code}</td>
                  <td className="px-3 py-2"><p className="font-medium">{a.machine}</p><p className="text-[10px] text-muted-foreground">{a.name}</p></td>
                  <td className="px-3 py-2 text-[11px]">{a.start} - {a.end}</td>
                  <td className="px-3 py-2 text-right font-medium">{a.runtime}h</td>
                  <td className="px-3 py-2 text-right text-blue-600">{a.setup}h</td>
                  <td className={`px-3 py-2 text-right ${a.downtime > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>{a.downtime}h</td>
                  <td className="px-3 py-2 text-right">₹{a.rate}</td>
                  <td className="px-3 py-2 text-right text-amber-600">{fmtINR(a.runtimeCost)}</td>
                  <td className="px-3 py-2 text-right text-blue-600">{fmtINR(a.setupCost)}</td>
                  <td className="px-3 py-2 text-right text-purple-600">{fmtINR(a.maintenance)}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmtINR(a.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-amber-50/40 border-amber-200">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Machine Cost Formula</p>
            <p className="text-xs text-muted-foreground mt-1">Machine Runtime × Machine Cost Rate = Machine Cost. Cost rate includes depreciation + electricity + maintenance + consumables. Setup, idle, and downtime tracked separately for accurate variance analysis. Downtime above threshold triggers production exception.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Utility Cost Module ────────────────────────────────────────────────
function UtilityCostModule() {
  const utilities = [
    { code: 'UC-2026-00048', po: 'PO-2026-00125', type: 'ELECTRICITY', consumed: 145.5, uom: 'KWH', rate: 8.5, total: 1237, method: 'MACHINE_HOURS' },
    { code: 'UC-2026-00047', po: 'PO-2026-00125', type: 'GAS', consumed: 4.2, uom: 'M3', rate: 65, total: 273, method: 'MACHINE_HOURS' },
    { code: 'UC-2026-00046', po: 'PO-2026-00126', type: 'ELECTRICITY', consumed: 89.4, uom: 'KWH', rate: 8.5, total: 760, method: 'MACHINE_HOURS' },
    { code: 'UC-2026-00045', po: 'PO-2026-00127', type: 'ELECTRICITY', consumed: 178.8, uom: 'KWH', rate: 8.5, total: 1520, method: 'MACHINE_HOURS' },
    { code: 'UC-2026-00044', po: 'PO-2026-00127', type: 'GAS', consumed: 28.5, uom: 'M3', rate: 65, total: 1853, method: 'MACHINE_HOURS' },
    { code: 'UC-2026-00043', po: 'PO-2026-00127', type: 'WATER', consumed: 850, uom: 'LITER', rate: 0.8, total: 680, method: 'PRODUCTION_QTY' },
    { code: 'UC-2026-00042', po: 'PO-2026-00129', type: 'STEAM', consumed: 12.0, uom: 'TON', rate: 1500, total: 18000, method: 'BATCH_QTY' },
  ]
  const typeIcons: Record<string, string> = { ELECTRICITY: '⚡', GAS: '🔥', STEAM: '♨️', WATER: '💧', COMPRESSED_AIR: '💨', COOLING: '❄️' }
  const typeColors: Record<string, string> = { ELECTRICITY: 'bg-amber-100 text-amber-700', GAS: 'bg-orange-100 text-orange-700', STEAM: 'bg-rose-100 text-rose-700', WATER: 'bg-cyan-100 text-cyan-700', COMPRESSED_AIR: 'bg-blue-100 text-blue-700', COOLING: 'bg-blue-100 text-blue-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-amber-600" />Utility Cost</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 4 · Electricity · Gas · Steam · Compressed Air · Water · Cooling</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type: 'ELECTRICITY', icon: '⚡', total: 3517, consumption: 413.7, uom: 'KWH', color: 'border-amber-300 bg-amber-50' },
          { type: 'GAS', icon: '🔥', total: 2126, consumption: 32.7, uom: 'M3', color: 'border-orange-300 bg-orange-50' },
          { type: 'WATER', icon: '💧', total: 680, consumption: 850, uom: 'LITER', color: 'border-cyan-300 bg-cyan-50' },
          { type: 'STEAM', icon: '♨️', total: 1800, consumption: 12.0, uom: 'TON', color: 'border-rose-300 bg-rose-50' },
        ].map(u => (
          <Card key={u.type} className={`p-3 border-2 ${u.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{u.icon}</span>
              <span className="text-[10px] font-bold">{u.type}</span>
            </div>
            <p className="text-base font-bold mt-2">{fmtINR(u.total)}</p>
            <p className="text-[10px] text-muted-foreground">{u.consumption} {u.uom}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Production Order</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium text-right">Consumed</th>
                <th className="px-3 py-2 font-medium text-right">Rate</th>
                <th className="px-3 py-2 font-medium text-right">Total Cost</th>
                <th className="px-3 py-2 font-medium">Allocation Method</th>
              </tr>
            </thead>
            <tbody>
              {utilities.map(u => (
                <tr key={u.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{u.code}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{u.po}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[u.type]}`}>{typeIcons[u.type]} {u.type}</span></td>
                  <td className="px-3 py-2 text-right">{u.consumed} {u.uom}</td>
                  <td className="px-3 py-2 text-right">₹{u.rate}/{u.uom}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmtINR(u.total)}</td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{u.method.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Overhead Allocation Module ─────────────────────────────────────────
function OverheadAllocationModule() {
  const overheads = [
    { code: 'OHA-2026-00018', type: 'FACTORY_RENT', description: 'Monthly rent allocation', total: 150000, allocated: 320, method: 'MACHINE_HOURS' },
    { code: 'OHA-2026-00017', type: 'DEPRECIATION', description: 'Equipment depreciation', total: 80000, allocated: 280, method: 'MACHINE_HOURS' },
    { code: 'OHA-2026-00016', type: 'SUPERVISION', description: 'Supervisor salary allocation', total: 60000, allocated: 200, method: 'LABOR_HOURS' },
    { code: 'OHA-2026-00015', type: 'CLEANING', description: 'Plant cleaning', total: 25000, allocated: 150, method: 'BATCH_QTY' },
    { code: 'OHA-2026-00014', type: 'INSURANCE', description: 'Factory insurance', total: 30000, allocated: 100, method: 'FIXED_PERCENTAGE' },
    { code: 'OHA-2026-00013', type: 'ADMINISTRATION', description: 'Admin overhead allocation', total: 120000, allocated: 150, method: 'PRODUCTION_QTY' },
  ]
  const methodColors: Record<string, string> = { MACHINE_HOURS: 'bg-amber-100 text-amber-700', LABOR_HOURS: 'bg-emerald-100 text-emerald-700', PRODUCTION_QTY: 'bg-blue-100 text-blue-700', BATCH_QTY: 'bg-purple-100 text-purple-700', FIXED_PERCENTAGE: 'bg-slate-100 text-slate-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-purple-600" />Overhead Allocation</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 5 · Factory Rent · Depreciation · Cleaning · Supervision · Insurance · Maintenance · Admin</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Overhead Pool', value: fmtINR(465000), color: 'text-purple-600' },
          { label: 'Allocated to Batches', value: fmtINR(9000), color: 'text-blue-600' },
          { label: 'Factory Rent', value: fmtINR(150000), color: 'text-amber-600' },
          { label: 'Depreciation', value: fmtINR(80000), color: 'text-slate-600' },
          { label: 'Supervision', value: fmtINR(60000), color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Overhead Type</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium text-right">Total Pool</th>
                <th className="px-3 py-2 font-medium text-right">Allocated</th>
                <th className="px-3 py-2 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {overheads.map(o => (
                <tr key={o.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{o.code}</td>
                  <td className="px-3 py-2 font-medium">{o.type.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">{o.description}</td>
                  <td className="px-3 py-2 text-right">{fmtINR(o.total)}</td>
                  <td className="px-3 py-2 text-right font-bold text-purple-700">{fmtINR(o.allocated)}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors[o.method]}`}>{o.method.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">5 Allocation Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { method: 'MACHINE_HOURS', description: 'Best for machine-intensive operations', color: 'border-amber-300 bg-amber-50' },
            { method: 'LABOR_HOURS', description: 'Best for labor-intensive operations', color: 'border-emerald-300 bg-emerald-50' },
            { method: 'PRODUCTION_QTY', description: 'Spread by output quantity', color: 'border-blue-300 bg-blue-50' },
            { method: 'BATCH_QTY', description: 'Spread evenly across batches', color: 'border-purple-300 bg-purple-50' },
            { method: 'FIXED_PERCENTAGE', description: 'Pre-determined percentage', color: 'border-slate-300 bg-slate-50' },
          ].map(m => (
            <div key={m.method} className={`p-3 rounded-lg border ${m.color}`}>
              <p className="text-xs font-bold">{m.method.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{m.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Cost Roll-Up Module ────────────────────────────────────────────────
function CostRollupModule() {
  const rollups = [
    { product: 'Kaju Katli 500g', sku: 'KK-500', batches: 8, qty: 752, totalCost: 161080, planned: 150400, variance: 10680, variancePct: 7.1, perKg: 214.2, marginPct: 38.8 },
    { product: 'Kaju Katli 1kg', sku: 'KK-1KG', batches: 6, qty: 588, totalCost: 125460, planned: 117600, variance: 7860, variancePct: 6.7, perKg: 213.4, marginPct: 37.3 },
    { product: 'Shwet Idli Batter 1kg', sku: 'IB-1KG', batches: 4, qty: 380, totalCost: 39330, planned: 38000, variance: 1330, variancePct: 3.5, perKg: 103.5, marginPct: 20.4 },
    { product: 'Motichoor Laddu 1kg', sku: 'ML-1KG', batches: 3, qty: 294, totalCost: 47040, planned: 44100, variance: 2940, variancePct: 6.7, perKg: 160.0, marginPct: 33.3 },
    { product: 'Mixed Namkeen 500g', sku: 'NM-500', batches: 2, qty: 500, totalCost: 54300, planned: 50000, variance: 4300, variancePct: 8.6, perKg: 108.6, marginPct: 22.4 },
  ]
  const byLine = [
    { line: 'LINE-KK-01', name: 'Kaju Katli Line', batches: 14, totalCost: 286540, perKg: 213.8, variancePct: 6.9, marginPct: 38.1 },
    { line: 'LINE-IB-01', name: 'Idli Batter Line', batches: 4, totalCost: 39330, perKg: 103.5, variancePct: 3.5, marginPct: 20.4 },
    { line: 'LINE-NM-01', name: 'Namkeen Line', batches: 2, totalCost: 54300, perKg: 108.6, variancePct: 8.6, marginPct: 22.4 },
    { line: 'LINE-ML-01', name: 'Motichoor Line', batches: 3, totalCost: 47040, perKg: 160.0, variancePct: 6.7, marginPct: 33.3 },
  ]
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6 text-blue-600" />Cost Roll-Up</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 9 · Aggregated cost by product / production line / plant · Profitability analysis</p>
        </div>
        <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Production Cost', value: fmtINR(184600), color: 'text-blue-600' },
          { label: 'Total Planned Cost', value: fmtINR(178400), color: 'text-emerald-600' },
          { label: 'Total Variance', value: fmtINR(6200), color: 'text-rose-600' },
          { label: 'Avg Cost / Kg', value: fmtINR(152.4), color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Cost Roll-Up by Product</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium text-center">Batches</th>
                <th className="px-3 py-2 font-medium text-right">Total Qty</th>
                <th className="px-3 py-2 font-medium text-right">Total Cost</th>
                <th className="px-3 py-2 font-medium text-right">Planned</th>
                <th className="px-3 py-2 font-medium text-right">Variance</th>
                <th className="px-3 py-2 font-medium text-right">Var %</th>
                <th className="px-3 py-2 font-medium text-right">Per Kg</th>
                <th className="px-3 py-2 font-medium text-right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {rollups.map(r => (
                <tr key={r.sku} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{r.product}</p><p className="text-[10px] text-muted-foreground font-mono">{r.sku}</p></td>
                  <td className="px-3 py-2 text-center">{r.batches}</td>
                  <td className="px-3 py-2 text-right">{r.qty} KG</td>
                  <td className="px-3 py-2 text-right font-bold">{fmtINR(r.totalCost)}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{fmtINR(r.planned)}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">+{fmtINR(r.variance)}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">{r.variancePct}%</td>
                  <td className="px-3 py-2 text-right font-medium">₹{r.perKg}</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-bold">{r.marginPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Cost Roll-Up by Production Line</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Line</th>
                <th className="px-3 py-2 font-medium text-center">Batches</th>
                <th className="px-3 py-2 font-medium text-right">Total Cost</th>
                <th className="px-3 py-2 font-medium text-right">Per Kg</th>
                <th className="px-3 py-2 font-medium text-right">Variance %</th>
                <th className="px-3 py-2 font-medium text-right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {byLine.map(l => (
                <tr key={l.line} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{l.name}</p><p className="text-[10px] text-muted-foreground font-mono">{l.line}</p></td>
                  <td className="px-3 py-2 text-center">{l.batches}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmtINR(l.totalCost)}</td>
                  <td className="px-3 py-2 text-right font-medium">₹{l.perKg}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">{l.variancePct}%</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-bold">{l.marginPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <h3 className="font-semibold text-sm mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-2 rounded border bg-emerald-50/50"><p className="font-semibold text-emerald-700">Best Performing Line</p><p className="text-muted-foreground mt-1">LINE-IB-01 (Idli Batter) — lowest variance (3.5%)</p></div>
          <div className="p-2 rounded border bg-rose-50/50"><p className="font-semibold text-rose-700">Worst Performing Line</p><p className="text-muted-foreground mt-1">LINE-NM-01 (Namkeen) — highest variance (8.6%)</p></div>
          <div className="p-2 rounded border bg-emerald-50/50"><p className="font-semibold text-emerald-700">Most Profitable Product</p><p className="text-muted-foreground mt-1">Kaju Katli 500g — 38.8% gross margin</p></div>
          <div className="p-2 rounded border bg-amber-50/50"><p className="font-semibold text-amber-700">Least Profitable Product</p><p className="text-muted-foreground mt-1">Shwet Idli Batter 1kg — 20.4% gross margin</p></div>
        </div>
      </Card>
    </div>
  )
}

// ─── Manufacturing Finance Module ───────────────────────────────────────
function ManufacturingFinanceModule() {
  const journals = [
    { entryNumber: 'MJE-2026-00051', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'VARIANCE_POSTING', date: '2026-07-09 11:16', debit: 1340, credit: 1340, balanced: true, posted: true, postedAt: '11:16:30', postingMs: 1240, period: 'FY2026-Q1-Jul', description: 'Material + Labor + Machine + Utility + Overhead variance for Kaju Katli 500g batch' },
    { entryNumber: 'MJE-2026-00050', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'FG_VALUATION', date: '2026-07-09 11:15', debit: 20140, credit: 20140, balanced: true, posted: true, postedAt: '11:15:30', postingMs: 1180, period: 'FY2026-Q1-Jul', description: 'FG inventory valuation for Kaju Katli 500g (94 KG)' },
    { entryNumber: 'MJE-2026-00049', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'OVERHEAD_ALLOCATION', date: '2026-07-09 11:14', debit: 1200, credit: 1200, balanced: true, posted: true, postedAt: '11:14:30', postingMs: 980, period: 'FY2026-Q1-Jul', description: 'Factory overhead allocation' },
    { entryNumber: 'MJE-2026-00048', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'LABOR_ALLOCATION', date: '2026-07-09 11:13', debit: 2400, credit: 2400, balanced: true, posted: true, postedAt: '11:13:30', postingMs: 1020, period: 'FY2026-Q1-Jul', description: 'Direct labor allocation - Rajesh Kumar 4 hours' },
    { entryNumber: 'MJE-2026-00047', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'MATERIAL_CONSUMPTION', date: '2026-07-09 11:12', debit: 9400, credit: 9400, balanced: true, posted: true, postedAt: '11:12:30', postingMs: 1340, period: 'FY2026-Q1-Jul', description: 'Raw material consumption - 55 KG Cashew + 35 KG Sugar + 4 KG Ghee' },
    { entryNumber: 'MJE-2026-00044', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', type: 'FG_VALUATION', date: '2026-07-09 09:42', debit: 27150, credit: 27150, balanced: true, posted: true, postedAt: '09:42:30', postingMs: 1420, period: 'FY2026-Q1-Jul', description: 'FG inventory valuation for Mixed Namkeen 500g (250 KG)' },
  ]
  const journalExamples = [
    { type: 'MATERIAL_CONSUMPTION', debit: 'WIP Inventory', credit: 'Raw Material Inventory', description: 'When materials consumed in production' },
    { type: 'LABOR_ALLOCATION', debit: 'WIP Inventory', credit: 'Payroll Clearing', description: 'When labor hours allocated to production' },
    { type: 'FG_VALUATION', debit: 'Finished Goods Inventory', credit: 'WIP Inventory', description: 'When production completes - FG valued at actual cost' },
    { type: 'VARIANCE_POSTING', debit: 'Variance Account', credit: 'WIP Inventory', description: 'When actual ≠ standard - variance posted' },
  ]
  const typeColors: Record<string, string> = { MATERIAL_CONSUMPTION: 'bg-blue-100 text-blue-700', WIP_POSTING: 'bg-amber-100 text-amber-700', FG_VALUATION: 'bg-emerald-100 text-emerald-700', VARIANCE_POSTING: 'bg-rose-100 text-rose-700', LABOR_ALLOCATION: 'bg-purple-100 text-purple-700', MACHINE_ALLOCATION: 'bg-orange-100 text-orange-700', OVERHEAD_ALLOCATION: 'bg-pink-100 text-pink-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-blue-600" />Manufacturing Finance</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 42 · Epic 8 · Auto-generated journal entries → General Ledger · Balanced · &lt;2s posting target</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Journals', value: 47, color: 'text-blue-600' },
          { label: 'Posted', value: 47, color: 'text-emerald-600' },
          { label: 'Pending', value: 0, color: 'text-amber-600' },
          { label: 'Failed', value: 0, color: 'text-rose-600' },
          { label: 'Total Debit', value: fmtINR(184600), color: 'text-blue-600' },
          { label: 'Success Rate', value: '100%', color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Auto-Generated Finance Flow</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Material Consumption', 'WIP Journal', 'Finished Goods Journal', 'Variance Journal', 'General Ledger'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Every cost adjustment generates balanced journal entries. Posts to GL automatically in &lt;2s. Cost history is immutable after financial period closure.</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Journal Entry Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {journalExamples.map(j => (
            <div key={j.type} className="p-3 rounded-lg border bg-muted/20">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[j.type]}`}>{j.type.replace(/_/g, ' ')}</span>
              <p className="text-xs mt-2"><span className="text-emerald-600 font-medium">Debit:</span> {j.debit}</p>
              <p className="text-xs"><span className="text-rose-600 font-medium">Credit:</span> {j.credit}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{j.description}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Manufacturing Journals</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Entry Number</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Batch</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium text-right">Debit</th>
                <th className="px-3 py-2 font-medium text-right">Credit</th>
                <th className="px-3 py-2 font-medium text-center">Balanced</th>
                <th className="px-3 py-2 font-medium text-center">Posting</th>
                <th className="px-3 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {journals.map(j => (
                <tr key={j.entryNumber} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{j.entryNumber}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[j.type]}`}>{j.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{j.batch}</td>
                  <td className="px-3 py-2 text-[11px]">{j.date}</td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-600">{fmtINR(j.debit)}</td>
                  <td className="px-3 py-2 text-right font-medium text-rose-600">{fmtINR(j.credit)}</td>
                  <td className="px-3 py-2 text-center">{j.balanced ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <AlertTriangle className="h-4 w-4 text-rose-600 mx-auto" />}</td>
                  <td className="px-3 py-2 text-center">{j.posted ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">{(j.postingMs / 1000).toFixed(2)}s</span> : <span className="text-[10px] text-amber-600">PENDING</span>}</td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[280px] truncate" title={j.description}>{j.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
