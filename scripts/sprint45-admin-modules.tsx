// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 45 — WASTE, SCRAP, YIELD, BY-PRODUCT & REWORK MANAGEMENT
// Admin modules: Waste Dashboard, Scrap Center, Yield Dashboard, Rework Orders,
// Disposal Center, Waste Cost Analysis, Sustainability Dashboard, Food Loss Analytics
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Waste Dashboard ────────────────────────────────────────────────────
function WasteDashboardModule() {
  const kpis = {
    totalWasteKg: 184.5, totalWasteCost: 36900, totalScrapKg: 12.4, totalScrapValue: 2480,
    avgYieldPercent: 96.8, yieldVariance: -1.2, reworkOrdersOpen: 3, reworkOrdersCompleted: 8,
    recoveryPercent: 18.5, recyclingPercent: 42.0, foodWastePercent: 3.2,
    byProductsValue: 8420, disposalCostThisMonth: 4800, wasteReductionPct: 12.5,
  }
  const wasteByCategory = [
    { category: 'PROCESS_WASTE', kg: 84.2, cost: 12630, percent: 45.6, color: 'bg-blue-500', disposition: 'EXPECTED' },
    { category: 'QUALITY_WASTE', kg: 28.4, cost: 8520, percent: 15.4, color: 'bg-rose-500', disposition: 'DESTROY' },
    { category: 'PACKAGING_WASTE', kg: 22.8, cost: 2280, percent: 12.4, color: 'bg-purple-500', disposition: 'RECYCLE' },
    { category: 'MATERIAL_WASTE', kg: 18.6, cost: 5580, percent: 10.1, color: 'bg-amber-500', disposition: 'REWORK' },
    { category: 'CLEANING_WASTE', kg: 15.2, cost: 760, percent: 8.2, color: 'bg-cyan-500', disposition: 'DISPOSE' },
    { category: 'FOOD_WASTE', kg: 9.8, cost: 2940, percent: 5.3, color: 'bg-emerald-500', disposition: 'DONATE' },
    { category: 'UTILITY_WASTE', kg: 5.5, cost: 4190, percent: 3.0, color: 'bg-orange-500', disposition: 'TRACK' },
  ]
  const chiefArchitectCategories = [
    { category: 'Process Loss', example: 'Moisture evaporation during cooking', action: 'Record as expected process loss; include in yield calculations' },
    { category: 'Recoverable By-Product', example: 'Broken kaju katli pieces, sugar syrup recovery', action: 'Return to approved inventory or reuse through controlled processes' },
    { category: 'Rework Material', example: 'Packaging defects with acceptable product quality', action: 'Generate rework order, send back for repacking/reprocessing' },
    { category: 'Quality Reject', example: 'Burnt sweets, contaminated batches', action: 'Quarantine, quality review, destroy if required' },
    { category: 'Packaging Waste', example: 'Damaged cartons, torn labels, broken trays', action: 'Record separately to monitor packaging supplier quality' },
    { category: 'Utility Loss', example: 'Excess oil, gas, electricity, water usage', action: 'Track for operational efficiency and cost reduction' },
  ]
  const recentWaste = [
    { code: 'WR-00148', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', category: 'QUALITY_WASTE', reason: 'BURNT_PRODUCT', qty: 4.2, uom: 'KG', cost: 840, disposition: 'DESTROY', operator: 'Suresh Mehta', time: '14:30' },
    { code: 'WR-00147', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', category: 'PROCESS_WASTE', reason: 'COOKING_LOSS', qty: 1.0, uom: 'KG', cost: 200, disposition: 'EXPECTED', operator: 'Rajesh Kumar', time: '08:00' },
    { code: 'WR-00146', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', category: 'MATERIAL_WASTE', reason: 'BROKEN_PRODUCT', qty: 0.5, uom: 'KG', cost: 100, disposition: 'REWORK', operator: 'Rajesh Kumar', time: '11:35' },
    { code: 'WR-00145', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', category: 'PACKAGING_WASTE', reason: 'PACKAGING_DAMAGE', qty: 2.0, uom: 'KG', cost: 200, disposition: 'RECYCLE', operator: 'Anil Reddy', time: '13:00' },
  ]
  const dispositionColors: Record<string, string> = { EXPECTED: 'bg-blue-100 text-blue-700', DESTROY: 'bg-rose-100 text-rose-700', RECYCLE: 'bg-purple-100 text-purple-700', REWORK: 'bg-amber-100 text-amber-700', DISPOSE: 'bg-slate-100 text-slate-700', DONATE: 'bg-emerald-100 text-emerald-700', TRACK: 'bg-orange-100 text-orange-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Trash2 className="h-6 w-6 text-rose-600" />Waste Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Waste Intelligence Engine · 100% yield is impossible - measure, classify, analyze, reduce</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Record Waste</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Waste', value: `${kpis.totalWasteKg} KG`, color: 'text-rose-600', icon: Trash2 },
          { label: 'Waste Cost', value: fmtINR(kpis.totalWasteCost), color: 'text-rose-600', icon: IndianRupee },
          { label: 'Avg Yield', value: `${kpis.avgYieldPercent}%`, color: 'text-emerald-600', icon: Percent },
          { label: 'Recovery %', value: `${kpis.recoveryPercent}%`, color: 'text-emerald-600', icon: Recycle },
          { label: 'By-Products Value', value: fmtINR(kpis.byProductsValue), color: 'text-emerald-600', icon: Package },
          { label: 'Waste Reduction', value: `${kpis.wasteReductionPct}%`, color: 'text-emerald-600', icon: TrendingDown },
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
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Chief Architect Recommendation — Do NOT treat all losses as "waste"</p>
            <p className="text-xs text-muted-foreground mt-1">Categorize losses because each requires different business handling. Distinguishing normal manufacturing loss from avoidable inefficiencies enables targeted process improvements and accurate production costing.</p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Waste by Category (7 categories)</h3>
          <div className="space-y-2">
            {wasteByCategory.map(c => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{c.category.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">{c.kg} KG · {fmtINR(c.cost)} · {c.percent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${c.color}`} style={{ width: `${c.percent * 2}%` }} />
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${dispositionColors[c.disposition]}`}>{c.disposition}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">6 Loss Categories & Actions</h3>
          <div className="space-y-2">
            {chiefArchitectCategories.map(c => (
              <div key={c.category} className="p-2 rounded border bg-muted/20">
                <p className="text-xs font-bold text-blue-700">{c.category}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5"><strong>Example:</strong> {c.example}</p>
                <p className="text-[10px] text-emerald-700 mt-0.5"><strong>Action:</strong> {c.action}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Waste Records</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Cost</th>
                <th className="px-3 py-2 font-medium">Disposition</th>
                <th className="px-3 py-2 font-medium">Operator / Time</th>
              </tr>
            </thead>
            <tbody>
              {recentWaste.map(w => (
                <tr key={w.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{w.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{w.batch}</p><p className="font-medium">{w.product}</p></td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{w.category.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px]">{w.reason.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 text-right font-bold text-rose-600">{w.qty} {w.uom}</td>
                  <td className="px-3 py-2 text-right font-bold text-rose-600">{fmtINR(w.cost)}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${dispositionColors[w.disposition]}`}>{w.disposition}</span></td>
                  <td className="px-3 py-2 text-[10px]"><p>{w.operator}</p><p className="text-muted-foreground">{w.time}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Scrap Center ───────────────────────────────────────────────────────
function ScrapCenterModule() {
  const records = [
    { code: 'MSC-00048', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', reason: 'BURNT_PRODUCT', desc: 'Burnt beyond recovery', qty: 4.2, uom: 'KG', value: 840, disposition: 'DESTROY', status: 'IN_SCRAP_INVENTORY', line: 'LINE-NM-01', operator: 'Suresh Mehta', time: '14:30' },
    { code: 'MSC-00047', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', reason: 'BROKEN_PRODUCT', desc: 'Broken pieces during cutting', qty: 0.5, uom: 'KG', value: 100, disposition: 'REWORK', status: 'RECOVERED', line: 'LINE-KK-01', operator: 'Rajesh Kumar', time: '08:00' },
    { code: 'MSC-00046', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', reason: 'QUALITY_REJECT', desc: 'Taste deviation - quality hold', qty: 2.0, uom: 'KG', value: 600, disposition: 'REWORK', status: 'IN_SCRAP_INVENTORY', line: 'LINE-ML-01', operator: 'Suresh M.', time: '18:00' },
    { code: 'MSC-00045', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', reason: 'PACKAGING_DAMAGE', desc: 'Pouch tear during packaging', qty: 2.0, uom: 'KG', value: 200, disposition: 'DISPOSE', status: 'DISPOSED', line: 'LINE-IB-01', operator: 'Anil Reddy', time: '13:00' },
  ]
  const inventory = [
    { code: 'MSI-001', sku: 'NM-500', name: 'Mixed Namkeen 500g (Scrap)', totalQty: 4.2, uom: 'KG', value: 840, plant: 'THN', bin: 'SCRAP-Q-01', status: 'AWAITING_DISPOSAL' },
    { code: 'MSI-002', sku: 'ML-1KG', name: 'Motichoor Laddu 1kg (Scrap)', totalQty: 2.0, uom: 'KG', value: 600, plant: 'THN', bin: 'SCRAP-Q-02', status: 'RECOVERABLE' },
  ]
  const reasonColors: Record<string, string> = { BURNT_PRODUCT: 'bg-rose-100 text-rose-700', BROKEN_PRODUCT: 'bg-amber-100 text-amber-700', QUALITY_REJECT: 'bg-red-100 text-red-700', PACKAGING_DAMAGE: 'bg-purple-100 text-purple-700', EXPIRED: 'bg-zinc-100 text-zinc-700', CONTAMINATED: 'bg-red-100 text-red-700', OPERATOR_ERROR: 'bg-orange-100 text-orange-700', MACHINE_FAILURE: 'bg-rose-100 text-rose-700' }
  const dispositionColors: Record<string, string> = { REUSE: 'bg-emerald-100 text-emerald-700', REWORK: 'bg-amber-100 text-amber-700', SELL: 'bg-blue-100 text-blue-700', DESTROY: 'bg-rose-100 text-rose-700', DISPOSE: 'bg-slate-100 text-slate-700', DONATE: 'bg-emerald-100 text-emerald-700' }
  const statusColors: Record<string, string> = { RECORDED: 'bg-blue-100 text-blue-700', IN_SCRAP_INVENTORY: 'bg-amber-100 text-amber-700', DISPOSED: 'bg-slate-100 text-slate-700', RECOVERED: 'bg-emerald-100 text-emerald-700', SOLD: 'bg-blue-100 text-blue-700', DONATED: 'bg-emerald-100 text-emerald-700', AWAITING_DISPOSAL: 'bg-rose-100 text-rose-700', RECOVERABLE: 'bg-amber-100 text-amber-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Trash2 className="h-6 w-6 text-amber-600" />Scrap Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Epic 2 · 8 scrap reasons · 6 disposition options · Scrap inventory quarantine</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Scrap', value: '12.4 KG', color: 'text-rose-600' },
          { label: 'Scrap Value', value: fmtINR(2480), color: 'text-rose-600' },
          { label: 'In Inventory', value: '6.2 KG', color: 'text-amber-600' },
          { label: 'Recovered', value: '0.5 KG', color: 'text-emerald-600' },
          { label: 'Disposed', value: '2.0 KG', color: 'text-slate-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Scrap Records</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium text-right">Qty / Value</th>
                <th className="px-3 py-2 font-medium">Disposition</th>
                <th className="px-3 py-2 font-medium">Line / Operator</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{r.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{r.batch}</p><p className="font-medium">{r.product}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${reasonColors[r.reason]}`}>{r.reason.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">{r.desc}</td>
                  <td className="px-3 py-2 text-right"><p className="font-bold text-rose-600">{r.qty} {r.uom}</p><p className="text-[10px] text-rose-600">{fmtINR(r.value)}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${dispositionColors[r.disposition]}`}>{r.disposition}</span></td>
                  <td className="px-3 py-2 text-[10px]"><p>{r.line}</p><p className="text-muted-foreground">{r.operator}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[r.status]}`}>{r.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Scrap Inventory (Quarantine)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">SKU / Name</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Value</th>
                <th className="px-3 py-2 font-medium">Plant / Bin</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => (
                <tr key={i.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{i.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{i.sku}</p><p className="font-medium">{i.name}</p></td>
                  <td className="px-3 py-2 text-right font-bold">{i.totalQty} {i.uom}</td>
                  <td className="px-3 py-2 text-right font-bold text-rose-600">{fmtINR(i.value)}</td>
                  <td className="px-3 py-2 text-[11px]"><p>{i.plant}</p><p className="font-mono text-blue-700">{i.bin}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[i.status]}`}>{i.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Yield Dashboard ────────────────────────────────────────────────────
function YieldDashboardModule() {
  const results = [
    { code: 'YLD-00048', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', recipe: 'RCP-KK-001 V2.3', inputQty: 95, expectedOutput: 94, actualOutput: 94, uom: 'KG', expectedYield: 98.9, actualYield: 98.9, variance: 0, lossQty: 1.0, lossPercent: 1.1, cookingLoss: 1.0, moistureLoss: 0, trimmingLoss: 0, scrapLoss: 0, reworkLoss: 0, status: 'WITHIN_THRESHOLD' },
    { code: 'YLD-00047', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', recipe: 'RCP-KK-001 V2.3', inputQty: 100, expectedOutput: 99, actualOutput: 98, uom: 'KG', expectedYield: 99.0, actualYield: 98.0, variance: -1.0, lossQty: 2.0, lossPercent: 2.0, cookingLoss: 1.5, moistureLoss: 0, trimmingLoss: 0, scrapLoss: 0.5, reworkLoss: 0, status: 'WITHIN_THRESHOLD' },
    { code: 'YLD-00046', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', recipe: 'RCP-IB-002 V1.5', inputQty: 100, expectedOutput: 96, actualOutput: 95, uom: 'KG', expectedYield: 96.0, actualYield: 95.0, variance: -1.0, lossQty: 5.0, lossPercent: 5.0, cookingLoss: 0, moistureLoss: 3.0, trimmingLoss: 0, scrapLoss: 2.0, reworkLoss: 0, status: 'WITHIN_THRESHOLD' },
    { code: 'YLD-00045', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', recipe: 'RCP-ML-003 V1.2', inputQty: 100, expectedOutput: 98, actualOutput: 96, uom: 'KG', expectedYield: 98.0, actualYield: 96.0, variance: -2.0, lossQty: 4.0, lossPercent: 4.0, cookingLoss: 1.5, moistureLoss: 0.5, trimmingLoss: 0, scrapLoss: 2.0, reworkLoss: 0, status: 'BELOW_THRESHOLD' },
    { code: 'YLD-00044', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', recipe: 'RCP-NM-004 V1.1', inputQty: 254, expectedOutput: 252, actualOutput: 248, uom: 'KG', expectedYield: 99.2, actualYield: 97.6, variance: -1.6, lossQty: 6.0, lossPercent: 2.4, cookingLoss: 1.8, moistureLoss: 0, trimmingLoss: 0, scrapLoss: 4.2, reworkLoss: 0, status: 'BELOW_THRESHOLD' },
  ]
  const statusColors: Record<string, string> = { WITHIN_THRESHOLD: 'bg-emerald-100 text-emerald-700', BELOW_THRESHOLD: 'bg-amber-100 text-amber-700', CRITICAL: 'bg-rose-100 text-rose-700' }
  const yieldColor = (y: number) => y >= 98 ? 'text-emerald-600' : y >= 95 ? 'text-amber-600' : 'text-rose-600'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Percent className="h-6 w-6 text-emerald-600" />Yield Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Epic 3 · Yield % = Actual Output ÷ Input × 100 · 5 loss breakdowns</p>
        </div>
        <Button size="sm"><Calculator className="mr-1 h-4 w-4" />Calculate Yield</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Yield', value: '96.8%', color: 'text-emerald-600' },
          { label: 'Avg Expected', value: '97.8%', color: 'text-blue-600' },
          { label: 'Avg Variance', value: '-1.2%', color: 'text-rose-600' },
          { label: 'Total Loss', value: '18.0 KG', color: 'text-rose-600' },
          { label: 'Loss Value', value: '₹3,600', color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-emerald-50/50 border-emerald-200">
        <div className="flex items-start gap-3">
          <Percent className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Yield Formula</p>
            <p className="text-xs text-muted-foreground mt-1"><strong>Actual Output ÷ Input Material × 100 = Yield %</strong>. Measures: Expected Yield · Actual Yield · Yield Loss · Yield Variance. Loss breakdown: Cooking Loss · Moisture Loss · Trimming Loss · Scrap Loss · Rework Loss.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Recipe</th>
                <th className="px-3 py-2 font-medium text-right">Input → Output</th>
                <th className="px-3 py-2 font-medium text-center">Expected</th>
                <th className="px-3 py-2 font-medium text-center">Actual</th>
                <th className="px-3 py-2 font-medium text-center">Variance</th>
                <th className="px-3 py-2 font-medium text-right">Loss Qty / %</th>
                <th className="px-3 py-2 font-medium">Loss Breakdown (Cook/Mois/Trim/Scrap/Rework)</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{r.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{r.batch}</p><p className="font-medium">{r.product}</p></td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground font-mono">{r.recipe}</td>
                  <td className="px-3 py-2 text-right"><p className="text-blue-600">{r.inputQty}</p><p className="text-emerald-600 font-bold">→ {r.actualOutput} {r.uom}</p></td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{r.expectedYield}%</td>
                  <td className={`px-3 py-2 text-center text-base font-bold ${yieldColor(r.actualYield)}`}>{r.actualYield}%</td>
                  <td className={`px-3 py-2 text-center font-medium ${r.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{r.variance >= 0 ? '+' : ''}{r.variance}%</td>
                  <td className="px-3 py-2 text-right"><p className="font-bold text-rose-600">{r.lossQty} {r.uom}</p><p className="text-[10px] text-rose-600">{r.lossPercent}%</p></td>
                  <td className="px-3 py-2 text-[10px]"><span className="text-orange-600">{r.cookingLoss}</span> / <span className="text-blue-600">{r.moistureLoss}</span> / <span className="text-purple-600">{r.trimmingLoss}</span> / <span className="text-rose-600">{r.scrapLoss}</span> / <span className="text-amber-600">{r.reworkLoss}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[r.status]}`}>{r.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Rework Orders ──────────────────────────────────────────────────────
function ReworkOrdersModule() {
  const orders = [
    { number: 'RWO-00012', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'PARTIAL_REWORK', reason: 'TASTE_DEVIATION', desc: 'Sugar level slightly low - rework with syrup addition', originalQty: 2.0, reworkQty: 2.0, recoveredQty: 0, scrappedQty: 0, uom: 'KG', supervisor: 'Lakshmi V.', approvedAt: '2026-07-09 09:00', workCenter: 'WC-ML-04', operator: 'Suresh M.', startedAt: '2026-07-09 10:00', qualityStatus: 'PENDING', reworkCost: 240, status: 'IN_PROGRESS' },
    { number: 'RWO-00011', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'PARTIAL_REWORK', reason: 'PACKAGING_DEFECT', desc: '0.5kg broken pieces - repack', originalQty: 0.5, reworkQty: 0.5, recoveredQty: 0.5, scrappedQty: 0, uom: 'KG', supervisor: 'Lakshmi V.', approvedAt: '2026-07-09 12:00', workCenter: 'WC-KK-08', operator: 'Vijay Patel', startedAt: '2026-07-09 12:30', completedAt: '2026-07-09 13:00', qualityStatus: 'PASSED', reworkCost: 60, status: 'COMPLETED' },
    { number: 'RWO-00010', batch: 'GUL-THN-20260707-000018', product: 'Gulab Jamun 1kg', type: 'FULL_REWORK', reason: 'SHAPE_DEFECT', desc: 'Irregular shape - reshape and re-fry', originalQty: 5.0, reworkQty: 5.0, recoveredQty: 4.5, scrappedQty: 0.5, uom: 'KG', supervisor: 'Lakshmi V.', approvedAt: '2026-07-07 16:00', workCenter: 'WC-GUL-02', operator: 'Suresh Mehta', startedAt: '2026-07-07 16:30', completedAt: '2026-07-07 18:00', qualityStatus: 'PASSED', reworkCost: 600, status: 'COMPLETED' },
    { number: 'RWO-00009', batch: 'RAS-THN-20260705-000008', product: 'Rasgulla 1kg', type: 'PARTIAL_REWORK', reason: 'QUALITY_HOLD', desc: 'Syrup concentration low - reprocess in syrup', originalQty: 3.0, reworkQty: 3.0, recoveredQty: 0, scrappedQty: 0, uom: 'KG', status: 'PENDING_APPROVAL' },
  ]
  const typeColors: Record<string, string> = { PARTIAL_REWORK: 'bg-blue-100 text-blue-700', FULL_REWORK: 'bg-purple-100 text-purple-700' }
  const reasonColors: Record<string, string> = { PACKAGING_DEFECT: 'bg-purple-100 text-purple-700', QUALITY_HOLD: 'bg-amber-100 text-amber-700', RECIPE_DEVIATION: 'bg-rose-100 text-rose-700', TEMPERATURE_DEVIATION: 'bg-orange-100 text-orange-700', SHAPE_DEFECT: 'bg-cyan-100 text-cyan-700', TASTE_DEVIATION: 'bg-amber-100 text-amber-700' }
  const statusColors: Record<string, string> = { PENDING_APPROVAL: 'bg-amber-100 text-amber-700', APPROVED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-emerald-100 text-emerald-700', REJECTED: 'bg-rose-100 text-rose-700', CANCELLED: 'bg-slate-100 text-slate-700' }
  const qualityColors: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', PASSED: 'bg-emerald-100 text-emerald-700', FAILED: 'bg-rose-100 text-rose-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Recycle className="h-6 w-6 text-purple-600" />Rework Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Epic 5 · Partial/Full rework · Supervisor approval · Recipe adjustment · Quality check</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Rework Order</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Orders', value: 11, color: 'text-blue-600' },
          { label: 'Open', value: 3, color: 'text-amber-600' },
          { label: 'In Progress', value: 1, color: 'text-blue-600' },
          { label: 'Completed', value: 7, color: 'text-emerald-600' },
          { label: 'Total Cost', value: fmtINR(4280), color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <Recycle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Rework Workflow</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Rejected Batch', 'Inspection', 'Rework Decision', 'Rework Order', 'Production', 'Quality Check', 'Release'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-purple-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Supports: Partial Rework · Full Rework · Supervisor Approval · Recipe Adjustment</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">RWO Number</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium text-right">Original → Recovered / Scrapped</th>
                <th className="px-3 py-2 font-medium">Supervisor / Approved</th>
                <th className="px-3 py-2 font-medium">Operator / Started</th>
                <th className="px-3 py-2 font-medium text-right">Cost</th>
                <th className="px-3 py-2 font-medium">QC</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.number} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{o.number}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{o.batch}</p><p className="font-medium">{o.product}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[o.type]}`}>{o.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${reasonColors[o.reason]}`}>{o.reason.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground max-w-[200px] truncate" title={o.desc}>{o.desc}</td>
                  <td className="px-3 py-2 text-right"><p className="text-blue-600">{o.originalQty} {o.uom}</p><p className="text-emerald-600 font-medium">→ {o.recoveredQty} {o.uom}</p>{o.scrappedQty > 0 && <p className="text-rose-600 text-[10px]">Scrap: {o.scrappedQty}</p>}</td>
                  <td className="px-3 py-2 text-[10px]"><p>{o.supervisor || '—'}</p><p className="text-muted-foreground">{o.approvedAt || 'Pending'}</p></td>
                  <td className="px-3 py-2 text-[10px]"><p>{o.operator || '—'}</p><p className="text-muted-foreground">{o.startedAt || 'Not started'}</p></td>
                  <td className="px-3 py-2 text-right font-bold text-rose-600">{o.reworkCost ? fmtINR(o.reworkCost) : '—'}</td>
                  <td className="px-3 py-2">{o.qualityStatus && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${qualityColors[o.qualityStatus]}`}>{o.qualityStatus}</span>}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[o.status]}`}>{o.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Disposal Center ────────────────────────────────────────────────────
function DisposalCenterModule() {
  const disposals = [
    { code: 'WDP-00048', batch: 'NAM-THN-20260705-000018', type: 'QUALITY_WASTE', desc: 'Burnt namkeen - unfit for consumption', qty: 6.2, uom: 'KG', method: 'AUTHORIZED_VENDOR_DISPOSAL', vendor: 'Green Waste Solutions Pvt Ltd', license: 'GWS-FSSAI-2024-0142', cost: 310, authorizedBy: 'Lakshmi V.', date: '2026-07-06', certificate: 'CERT-GWS-0048', status: 'COMPLETED' },
    { code: 'WDP-00047', batch: 'KAJ-THN-20260628-000011', type: 'QUALITY_WASTE', desc: 'Recalled batch - taste deviation', qty: 12.0, uom: 'KG', method: 'INCINERATION', vendor: 'Maharashtra Waste Mgmt', license: 'MWM-2024-0892', cost: 840, authorizedBy: 'Quality Head', date: '2026-07-08', certificate: 'CERT-MWM-0047', status: 'COMPLETED' },
    { code: 'WDP-00046', batch: 'SHW-THN-20260702-000041', type: 'FOOD_WASTE', desc: 'Expired batter - donated before expiry', qty: 8.0, uom: 'KG', method: 'COMPOSTING', vendor: 'Angels NGO', license: 'NGO-REG-2018-0451', cost: 0, authorizedBy: 'Lakshmi V.', date: '2026-07-08', certificate: 'CERT-NGO-0046', status: 'COMPLETED' },
    { code: 'WDP-00045', batch: 'Multiple', type: 'PACKAGING_WASTE', desc: 'Damaged cartons, torn labels', qty: 22.8, uom: 'KG', method: 'RECYCLING', vendor: 'EcoPack Recyclers', license: 'EPR-2024-0234', cost: 0, authorizedBy: 'Warehouse Head', date: '2026-07-09', certificate: 'CERT-ECO-0045', status: 'COMPLETED' },
    { code: 'WDP-00044', batch: 'NAM-THN-20260709-000021', type: 'QUALITY_WASTE', desc: 'Burnt product awaiting disposal', qty: 4.2, uom: 'KG', method: 'AUTHORIZED_VENDOR_DISPOSAL', vendor: 'Green Waste Solutions Pvt Ltd', license: 'GWS-FSSAI-2024-0142', cost: 210, authorizedBy: null, date: '2026-07-10', certificate: null, status: 'SCHEDULED' },
  ]
  const methodColors: Record<string, string> = { INCINERATION: 'bg-rose-100 text-rose-700', COMPOSTING: 'bg-emerald-100 text-emerald-700', RECYCLING: 'bg-blue-100 text-blue-700', MUNICIPAL_DISPOSAL: 'bg-slate-100 text-slate-700', AUTHORIZED_VENDOR_DISPOSAL: 'bg-purple-100 text-purple-700' }
  const statusColors: Record<string, string> = { SCHEDULED: 'bg-amber-100 text-amber-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Archive className="h-6 w-6 text-slate-600" />Disposal Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Epic 6 · 5 disposal methods · Vendor license · Certificate · Photo evidence</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Schedule Disposal</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Disposals', value: 48, color: 'text-blue-600' },
          { label: 'Total Qty', value: '184.5 KG', color: 'text-slate-600' },
          { label: 'Total Cost', value: fmtINR(4800), color: 'text-rose-600' },
          { label: 'Completed', value: 47, color: 'text-emerald-600' },
          { label: 'Scheduled', value: 1, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">5 Disposal Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { method: 'INCINERATION', desc: 'High-heat destruction for hazardous/burnt waste', count: 8, qty: 28.4, cost: 1980 },
            { method: 'COMPOSTING', desc: 'Organic food waste → compost', count: 6, qty: 14.8, cost: 0 },
            { method: 'RECYCLING', desc: 'Packaging waste → recyclers', count: 14, qty: 52.6, cost: 0 },
            { method: 'MUNICIPAL_DISPOSAL', desc: 'General waste to municipal facility', count: 2, qty: 4.5, cost: 300 },
            { method: 'AUTHORIZED_VENDOR_DISPOSAL', desc: 'FSSAI-licensed vendor for food waste', count: 18, qty: 84.2, cost: 2520 },
          ].map(m => (
            <div key={m.method} className="p-3 rounded-lg border bg-muted/20">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${methodColors[m.method]}`}>{m.method.replace(/_/g, ' ')}</span>
              <p className="text-[10px] text-muted-foreground mt-2">{m.desc}</p>
              <div className="grid grid-cols-2 gap-1 mt-2 text-[10px]">
                <div><p className="text-muted-foreground">Count</p><p className="font-bold">{m.count}</p></div>
                <div><p className="text-muted-foreground">Qty</p><p className="font-bold">{m.qty} KG</p></div>
              </div>
              <p className="text-[10px] text-rose-600 mt-1">{fmtINR(m.cost)}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Batch</th>
                <th className="px-3 py-2 font-medium">Waste Type / Description</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium">Method</th>
                <th className="px-3 py-2 font-medium">Vendor / License</th>
                <th className="px-3 py-2 font-medium text-right">Cost</th>
                <th className="px-3 py-2 font-medium">Authorized By / Date</th>
                <th className="px-3 py-2 font-medium">Certificate</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {disposals.map(d => (
                <tr key={d.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{d.code}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{d.batch}</td>
                  <td className="px-3 py-2"><p className="text-[10px] text-muted-foreground">{d.type.replace(/_/g, ' ')}</p><p className="text-[11px]">{d.desc}</p></td>
                  <td className="px-3 py-2 text-right font-bold">{d.qty} {d.uom}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors[d.method]}`}>{d.method.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[10px]"><p className="font-medium">{d.vendor}</p><p className="text-muted-foreground font-mono">{d.license}</p></td>
                  <td className="px-3 py-2 text-right font-bold text-rose-600">{d.cost > 0 ? fmtINR(d.cost) : '—'}</td>
                  <td className="px-3 py-2 text-[10px]"><p>{d.authorizedBy || '—'}</p><p className="text-muted-foreground">{d.date}</p></td>
                  <td className="px-3 py-2 font-mono text-[10px] text-emerald-600">{d.certificate || '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[d.status]}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Waste Cost Analysis ────────────────────────────────────────────────
function WasteCostAnalysisModule() {
  const byProduct = [
    { product: 'Kaju Katli 500g', totalWasteCost: 5680, materialCost: 4200, laborCost: 480, machineCost: 320, energyCost: 280, packagingCost: 400, totalWasteKg: 12.4, costPerKg: 458, batches: 8 },
    { product: 'Kaju Katli 1kg', totalWasteCost: 4320, materialCost: 3400, laborCost: 360, machineCost: 240, energyCost: 200, packagingCost: 120, totalWasteKg: 9.8, costPerKg: 441, batches: 6 },
    { product: 'Shwet Idli Batter 1kg', totalWasteCost: 1840, materialCost: 1200, laborCost: 240, machineCost: 160, energyCost: 80, packagingCost: 160, totalWasteKg: 4.2, costPerKg: 438, batches: 4 },
    { product: 'Motichoor Laddu 1kg', totalWasteCost: 3120, materialCost: 2400, laborCost: 240, machineCost: 240, energyCost: 160, packagingCost: 80, totalWasteKg: 7.2, costPerKg: 433, batches: 3 },
    { product: 'Mixed Namkeen 500g', totalWasteCost: 8940, materialCost: 6800, laborCost: 720, machineCost: 640, energyCost: 480, packagingCost: 300, totalWasteKg: 18.4, costPerKg: 486, batches: 2 },
  ]
  const byLine = [
    { line: 'LINE-KK-01', name: 'Kaju Katli Line', totalWasteCost: 10000, totalWasteKg: 22.2, costPerKg: 450 },
    { line: 'LINE-IB-01', name: 'Idli Batter Line', totalWasteCost: 1840, totalWasteKg: 4.2, costPerKg: 438 },
    { line: 'LINE-NM-01', name: 'Namkeen Line', totalWasteCost: 8940, totalWasteKg: 18.4, costPerKg: 486 },
    { line: 'LINE-ML-01', name: 'Motichoor Line', totalWasteCost: 3120, totalWasteKg: 7.2, costPerKg: 433 },
    { line: 'LINE-GUL-01', name: 'Gulab Jamun Line', totalWasteCost: 1200, totalWasteKg: 3.1, costPerKg: 387 },
  ]
  const trend = [
    { week: 'W1', wasteCost: 24800, wasteKg: 124.5 },
    { week: 'W2', wasteCost: 22100, wasteKg: 110.2 },
    { week: 'W3', wasteCost: 19500, wasteKg: 98.8 },
    { week: 'W4', wasteCost: 18400, wasteKg: 92.4 },
  ]
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6 text-rose-600" />Waste Cost Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Epic 7 · Material + Labor + Machine + Energy + Packaging Loss → Total Waste Cost</p>
        </div>
        <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Waste Cost', value: fmtINR(36900), color: 'text-rose-600' },
          { label: 'Material Loss', value: fmtINR(18000), color: 'text-rose-600' },
          { label: 'Labor Loss', value: fmtINR(2040), color: 'text-amber-600' },
          { label: 'Machine Loss', value: fmtINR(1600), color: 'text-amber-600' },
          { label: 'Energy Loss', value: fmtINR(1200), color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">4-Week Waste Cost Trend (Decreasing 25.8%)</h3>
        <div className="flex items-end gap-3 h-32">
          {trend.map(t => (
            <div key={t.week} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-muted rounded-t overflow-hidden flex items-end" style={{ height: '80px' }}>
                <div className="w-full bg-rose-500" style={{ height: `${(t.wasteCost / 24800) * 100}%` }} />
              </div>
              <p className="text-[10px] mt-1 font-bold text-rose-600">{fmtINR(t.wasteCost)}</p>
              <p className="text-[10px] text-muted-foreground">{t.wasteKg} KG · {t.week}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Waste Cost by Product</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium text-right">Material</th>
                <th className="px-3 py-2 font-medium text-right">Labor</th>
                <th className="px-3 py-2 font-medium text-right">Machine</th>
                <th className="px-3 py-2 font-medium text-right">Energy</th>
                <th className="px-3 py-2 font-medium text-right">Packaging</th>
                <th className="px-3 py-2 font-medium text-right">Total Cost</th>
                <th className="px-3 py-2 font-medium text-right">Waste Qty</th>
                <th className="px-3 py-2 font-medium text-right">Cost / Kg</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map(p => (
                <tr key={p.product} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{p.product}<p className="text-[10px] text-muted-foreground">{p.batches} batches</p></td>
                  <td className="px-3 py-2 text-right text-rose-600">{fmtINR(p.materialCost)}</td>
                  <td className="px-3 py-2 text-right text-amber-600">{fmtINR(p.laborCost)}</td>
                  <td className="px-3 py-2 text-right text-purple-600">{fmtINR(p.machineCost)}</td>
                  <td className="px-3 py-2 text-right text-orange-600">{fmtINR(p.energyCost)}</td>
                  <td className="px-3 py-2 text-right text-blue-600">{fmtINR(p.packagingCost)}</td>
                  <td className="px-3 py-2 text-right font-bold text-rose-700">{fmtINR(p.totalWasteCost)}</td>
                  <td className="px-3 py-2 text-right">{p.totalWasteKg} KG</td>
                  <td className="px-3 py-2 text-right font-bold">₹{p.costPerKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Waste Cost by Production Line</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3">
          {byLine.map(l => (
            <div key={l.line} className="p-3 rounded-lg border bg-muted/20">
              <p className="font-mono text-[10px] text-blue-700">{l.line}</p>
              <p className="text-xs font-medium">{l.name}</p>
              <p className="text-lg font-bold text-rose-600 mt-2">{fmtINR(l.totalWasteCost)}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 pt-2 border-t border-slate-200">
                <div><p className="text-muted-foreground">Waste Qty</p><p className="font-bold">{l.totalWasteKg} KG</p></div>
                <div><p className="text-muted-foreground">Cost / Kg</p><p className="font-bold">₹{l.costPerKg}</p></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Sustainability Dashboard ───────────────────────────────────────────
function SustainabilityDashboardModule() {
  const kpis = {
    foodWasteKg: 9.8, foodWastePercent: 3.2, foodWasteTrend: -15.0,
    recoveryPercent: 18.5, recoveryTrend: 8.0,
    recyclingPercent: 42.0, recyclingTrend: 12.0,
    waterUsageLiters: 12480, waterTrend: -5.0,
    energyUsageKwh: 1840, energyTrend: -3.0,
    wasteReductionPercent: 12.5, carbonKgCo2e: 248.5,
  }
  const foodWasteByCategory = [
    { category: 'Cooking Loss', kg: 42.5, percent: 23.0, expected: true, actionable: false },
    { category: 'Moisture Loss', kg: 28.4, percent: 15.4, expected: true, actionable: false },
    { category: 'Burnt Product', kg: 18.2, percent: 9.9, expected: false, actionable: true },
    { category: 'Broken Product', kg: 24.8, percent: 13.4, expected: false, actionable: true },
    { category: 'Packaging Damage', kg: 22.8, percent: 12.4, expected: false, actionable: true },
    { category: 'Trimming Loss', kg: 16.5, percent: 8.9, expected: true, actionable: false },
    { category: 'Operator Error', kg: 12.4, percent: 6.7, expected: false, actionable: true },
    { category: 'Machine Failure', kg: 9.8, percent: 5.3, expected: false, actionable: true },
    { category: 'Cleaning Waste', kg: 9.1, percent: 4.9, expected: true, actionable: false },
  ]
  const recoveryBreakdown = [
    { type: 'By-Product Recovery', kg: 34.5, value: 8420, percent: 64.0 },
    { type: 'Rework Recovery', kg: 12.5, value: 4280, percent: 23.0 },
    { type: 'Recycling', kg: 7.0, value: 0, percent: 13.0 },
  ]
  const monthlyTrend = [
    { month: 'Jan', foodWaste: 5.8, recovery: 12.5, recycling: 28.0 },
    { month: 'Feb', foodWaste: 5.2, recovery: 14.2, recycling: 32.0 },
    { month: 'Mar', foodWaste: 4.8, recovery: 15.8, recycling: 35.0 },
    { month: 'Apr', foodWaste: 4.2, recovery: 16.4, recycling: 38.0 },
    { month: 'May', foodWaste: 3.8, recovery: 17.2, recycling: 40.0 },
    { month: 'Jun', foodWaste: 3.5, recovery: 18.0, recycling: 41.0 },
    { month: 'Jul', foodWaste: 3.2, recovery: 18.5, recycling: 42.0 },
  ]
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Globe2 className="h-6 w-6 text-emerald-600" />Sustainability Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Epic 8 · Food waste · Recovery · Recycling · Water · Energy · ESG metrics (Future: Carbon Accounting)</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Food Waste', value: `${kpis.foodWasteKg} KG`, sub: `${kpis.foodWastePercent}% of output`, trend: `${kpis.foodWasteTrend}%`, color: 'text-rose-600', icon: Trash2 },
          { label: 'Recovery Rate', value: `${kpis.recoveryPercent}%`, sub: `+${kpis.recoveryTrend}% trend`, trend: `+${kpis.recoveryTrend}%`, color: 'text-emerald-600', icon: Recycle },
          { label: 'Recycling Rate', value: `${kpis.recyclingPercent}%`, sub: `+${kpis.recyclingTrend}% trend`, trend: `+${kpis.recyclingTrend}%`, color: 'text-emerald-600', icon: Recycle },
          { label: 'Water Usage', value: `${kpis.waterUsageLiters.toLocaleString()} L`, sub: `${kpis.waterTrend}% trend`, trend: `${kpis.waterTrend}%`, color: 'text-blue-600', icon: Droplets },
          { label: 'Energy Usage', value: `${kpis.energyUsageKwh} kWh`, sub: `${kpis.energyTrend}% trend`, trend: `${kpis.energyTrend}%`, color: 'text-amber-600', icon: Zap },
          { label: 'Waste Reduction', value: `${kpis.wasteReductionPercent}%`, sub: 'vs last period', trend: ' improving', color: 'text-emerald-600', icon: TrendingDown },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/40" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-emerald-50/50 border-emerald-200">
        <div className="flex items-start gap-3">
          <Globe2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">ESG Metrics — Environmental, Social, Governance</p>
            <p className="text-xs text-muted-foreground mt-1">Food Loss per Tonne: <strong>14.8 KG</strong> · Waste to Landfill: <strong>32.0%</strong> · Waste Diverted from Landfill: <strong>68.0%</strong> · Water Usage per Kg: <strong>9.98 L</strong> · Energy Usage per Kg: <strong>1.47 kWh</strong> · Carbon Footprint: <strong>{kpis.carbonKgCo2e} kg CO2e</strong> (Future: full ESG Reporting, Carbon Accounting)</p>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Food Waste by Category (9 categories)</h3>
          <div className="space-y-2">
            {foodWasteByCategory.map(c => (
              <div key={c.category} className="flex items-center gap-2">
                <div className="w-32 text-[11px]">{c.category}</div>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div className={`h-full ${c.expected ? 'bg-blue-400' : c.actionable ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${c.percent * 3}%` }} />
                </div>
                <div className="w-12 text-right text-[10px] font-bold">{c.kg} KG</div>
                <div className="w-12 text-right text-[10px] text-muted-foreground">{c.percent}%</div>
                <div className="w-20">{c.expected ? <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-700">Expected</span> : c.actionable ? <span className="text-[9px] px-1 py-0.5 rounded bg-rose-100 text-rose-700">Actionable</span> : <span className="text-[9px] text-slate-500">—</span>}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">Recovery Breakdown (54 KG recovered · {fmtINR(12700)} value)</h3>
          <div className="space-y-3">
            {recoveryBreakdown.map(r => (
              <div key={r.type}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{r.type}</span>
                  <span className="text-muted-foreground">{r.kg} KG · {r.value > 0 ? fmtINR(r.value) : '—'} · {r.percent}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${r.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">7-Month Sustainability Trend (Food Waste ↓, Recovery ↑, Recycling ↑)</h3>
        <div className="flex items-end gap-2 h-40">
          {monthlyTrend.map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col" style={{ height: '120px' }}>
                <div className="bg-emerald-500 rounded-t" style={{ height: `${m.recycling * 1.2}px` }} title={`Recycling: ${m.recycling}%`} />
                <div className="bg-emerald-400" style={{ height: `${m.recovery * 3}px` }} title={`Recovery: ${m.recovery}%`} />
                <div className="bg-rose-500 rounded-b" style={{ height: `${m.foodWaste * 8}px` }} title={`Food Waste: ${m.foodWaste}%`} />
              </div>
              <p className="text-[10px] text-muted-foreground">{m.month}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] mt-2">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded" /> Food Waste</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-400 rounded" /> Recovery</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> Recycling</span>
        </div>
      </Card>
    </div>
  )
}

// ─── Food Loss Analytics ────────────────────────────────────────────────
function FoodLossAnalyticsModule() {
  const foodLossByProduct = [
    { product: 'Mixed Namkeen 500g', lossKg: 6.0, lossPercent: 2.4, lossCost: 1200, avoidable: 4.2, unavoidable: 1.8, trend: 'INCREASING' },
    { product: 'Kaju Katli 1kg', lossKg: 2.0, lossPercent: 2.0, lossCost: 400, avoidable: 0.5, unavoidable: 1.5, trend: 'STABLE' },
    { product: 'Motichoor Laddu 1kg', lossKg: 4.0, lossPercent: 4.0, lossCost: 800, avoidable: 2.0, unavoidable: 2.0, trend: 'INCREASING' },
    { product: 'Shwet Idli Batter 1kg', lossKg: 5.0, lossPercent: 5.0, lossCost: 500, avoidable: 2.0, unavoidable: 3.0, trend: 'DECREASING' },
    { product: 'Kaju Katli 500g', lossKg: 1.0, lossPercent: 1.1, lossCost: 200, avoidable: 0, unavoidable: 1.0, trend: 'STABLE' },
  ]
  const trendColors: Record<string, string> = { INCREASING: 'bg-rose-100 text-rose-700', STABLE: 'bg-slate-100 text-slate-700', DECREASING: 'bg-emerald-100 text-emerald-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><AlertCircle className="h-6 w-6 text-rose-600" />Food Loss Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 45 · Food Loss Analytics · Avoidable vs Unavoidable · Product-level loss insights</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Food Loss', value: '18.0 KG', color: 'text-rose-600' },
          { label: 'Total Loss Cost', value: fmtINR(3100), color: 'text-rose-600' },
          { label: 'Avoidable Loss', value: '8.7 KG (48%)', color: 'text-rose-700' },
          { label: 'Unavoidable Loss', value: '9.3 KG (52%)', color: 'text-amber-600' },
          { label: 'Loss per Tonne', value: '14.8 KG', color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-rose-50/50 border-rose-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Avoidable vs Unavoidable Food Loss</p>
            <p className="text-xs text-muted-foreground mt-1"><strong>Unavoidable (52%):</strong> Process losses like cooking evaporation, moisture loss, trimming — expected during normal production. <strong>Avoidable (48%):</strong> Burnt product, broken pieces, operator error, machine failure — actionable for reduction. Target: Reduce avoidable loss from 48% to 30% in next quarter through operator training and preventive maintenance.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Food Loss by Product</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium text-right">Loss Qty</th>
                <th className="px-3 py-2 font-medium text-center">Loss %</th>
                <th className="px-3 py-2 font-medium text-right">Loss Cost</th>
                <th className="px-3 py-2 font-medium text-right">Avoidable</th>
                <th className="px-3 py-2 font-medium text-right">Unavoidable</th>
                <th className="px-3 py-2 font-medium text-center">Avoidable %</th>
                <th className="px-3 py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {foodLossByProduct.map(p => {
                const avoidablePct = p.lossKg > 0 ? (p.avoidable / p.lossKg) * 100 : 0
                return (
                  <tr key={p.product} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{p.product}</td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{p.lossKg} KG</td>
                    <td className="px-3 py-2 text-center text-rose-600">{p.lossPercent}%</td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{fmtINR(p.lossCost)}</td>
                    <td className="px-3 py-2 text-right text-rose-700 font-medium">{p.avoidable} KG</td>
                    <td className="px-3 py-2 text-right text-amber-600">{p.unavoidable} KG</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-amber-200 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${avoidablePct}%` }} /></div>
                        <span className="text-[10px] font-bold text-rose-700">{avoidablePct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${trendColors[p.trend]}`}>{p.trend}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
