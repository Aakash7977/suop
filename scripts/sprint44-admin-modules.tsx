// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 44 — OEE, PRODUCTION ANALYTICS & MANUFACTURING PERFORMANCE INTELLIGENCE
// Admin modules: OEE Dashboard, Production Analytics, Machine Analytics,
// Operator Analytics, Downtime Center, Heat Maps, Cost Analytics, Executive Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ─── OEE Dashboard ──────────────────────────────────────────────────────
function OEEDashboardModule() {
  const plantOEE = { oee: 84.2, availability: 93.5, performance: 91.2, quality: 98.8, target: 85.0, variance: -0.8, status: 'WITHIN_TARGET' }
  const lines = [
    { line: 'LINE-KK-01', name: 'Kaju Katli Line', availability: 94.2, performance: 95.1, quality: 99.0, oee: 88.7, target: 88.0, variance: 0.7, status: 'WITHIN_TARGET', machines: 6, running: 5, fault: 1, output: 542, target: 560 },
    { line: 'LINE-IB-01', name: 'Idli Batter Line', availability: 96.8, performance: 88.5, quality: 99.5, oee: 85.2, target: 85.0, variance: 0.2, status: 'WITHIN_TARGET', machines: 4, running: 4, fault: 0, output: 95, target: 100 },
    { line: 'LINE-NM-01', name: 'Namkeen Line', availability: 87.5, performance: 84.2, quality: 97.8, oee: 72.0, target: 85.0, variance: -13.0, status: 'BELOW_TARGET', machines: 5, running: 3, fault: 1, output: 250, target: 320 },
    { line: 'LINE-ML-01', name: 'Motichoor Line', availability: 95.5, performance: 92.0, quality: 99.2, oee: 87.3, target: 85.0, variance: 2.3, status: 'WITHIN_TARGET', machines: 5, running: 5, fault: 0, output: 294, target: 290 },
    { line: 'LINE-GUL-01', name: 'Gulab Jamun Line', availability: 93.5, performance: 96.0, quality: 98.5, oee: 88.4, target: 85.0, variance: 3.4, status: 'WITHIN_TARGET', machines: 4, running: 4, fault: 0, output: 67, target: 50 },
  ]
  const trend = [
    { day: 'Mon', oee: 82.5 }, { day: 'Tue', oee: 85.1 }, { day: 'Wed', oee: 83.7 },
    { day: 'Thu', oee: 86.2 }, { day: 'Fri', oee: 84.5 }, { day: 'Sat', oee: 84.2 },
  ]
  const statusColors: Record<string, string> = { WITHIN_TARGET: 'bg-emerald-100 text-emerald-700', BELOW_TARGET: 'bg-amber-100 text-amber-700', CRITICAL: 'bg-rose-100 text-rose-700' }
  const Gauge = ({ value, label, color, target }: { value: number; label: string; color: string; target?: number }) => {
    const pct = Math.min(100, value)
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 50 50)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color }}>{value.toFixed(1)}%</p>
              {target && <p className="text-[9px] text-muted-foreground">tgt {target}%</p>}
            </div>
          </div>
        </div>
        <p className="text-xs font-medium mt-1">{label}</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Gauge className="h-6 w-6 text-emerald-600" />OEE Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · OEE = Availability × Performance × Quality · Plant roll-up from line level</p>
        </div>
        <Button size="sm"><Calculator className="mr-1 h-4 w-4" />Calculate OEE</Button>
      </div>
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Plant-Wide OEE (Thane Plant · Today)</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{plantOEE.oee}% <span className="text-base text-muted-foreground font-normal">/ target {plantOEE.target}%</span></p>
            <p className={`text-xs mt-1 ${plantOEE.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{plantOEE.variance >= 0 ? '+' : ''}{plantOEE.variance}% variance · {plantOEE.status.replace(/_/g, ' ')}</p>
          </div>
          <div className="flex items-center gap-6">
            <Gauge value={plantOEE.availability} label="Availability" color="#3b82f6" target={95} />
            <Gauge value={plantOEE.performance} label="Performance" color="#a855f7" target={95} />
            <Gauge value={plantOEE.quality} label="Quality" color="#10b981" target={99} />
            <Gauge value={plantOEE.oee} label="OEE" color="#f59e0b" target={85} />
          </div>
        </div>
      </Card>
      <Card className="p-4 bg-amber-50/50 border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">OEE Formula — Availability × Performance × Quality</p>
            <p className="text-xs text-muted-foreground mt-1">Example: 92% Availability × 96% Performance × 99% Quality = <strong>87.4% OEE</strong>. Layered approach: Calculate OEE at production line level first (e.g., Kaju Katli Line: 94% × 95% × 99% = 88.4%), then roll up to Sweet Department average, then to entire plant, then to Enterprise Manufacturing Dashboard.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Production Line OEE Breakdown</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Line</th>
                <th className="px-3 py-2 font-medium text-center">Availability</th>
                <th className="px-3 py-2 font-medium text-center">Performance</th>
                <th className="px-3 py-2 font-medium text-center">Quality</th>
                <th className="px-3 py-2 font-medium text-center">OEE</th>
                <th className="px-3 py-2 font-medium text-center">Target</th>
                <th className="px-3 py-2 font-medium text-center">Variance</th>
                <th className="px-3 py-2 font-medium text-center">Machines (Run/Fault)</th>
                <th className="px-3 py-2 font-medium text-right">Output / Target</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.line} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{l.line}</p><p className="text-[10px] text-muted-foreground">{l.name}</p></td>
                  <td className="px-3 py-2 text-center font-medium text-blue-600">{l.availability}%</td>
                  <td className="px-3 py-2 text-center font-medium text-purple-600">{l.performance}%</td>
                  <td className="px-3 py-2 text-center font-medium text-emerald-600">{l.quality}%</td>
                  <td className="px-3 py-2 text-center"><span className={`text-base font-bold ${l.oee >= l.target ? 'text-emerald-600' : 'text-rose-600'}`}>{l.oee}%</span></td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{l.target}%</td>
                  <td className={`px-3 py-2 text-center font-medium ${l.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{l.variance >= 0 ? '+' : ''}{l.variance}%</td>
                  <td className="px-3 py-2 text-center">{l.machines} ({l.running}/{l.fault}{l.fault > 0 ? ' ⚠' : ''})</td>
                  <td className="px-3 py-2 text-right"><p className="font-medium">{l.output} / {l.target} KG</p><div className="h-1 bg-muted rounded-full mt-1 overflow-hidden w-20 ml-auto"><div className={`h-full ${l.output >= l.target ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (l.output / l.target) * 100)}%` }} /></div></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[l.status]}`}>{l.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">7-Day OEE Trend (Plant)</h3>
        <div className="flex items-end gap-2 h-40">
          {trend.map(t => (
            <div key={t.day} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-muted rounded-t overflow-hidden flex items-end" style={{ height: '120px' }}>
                <div className={`w-full ${t.oee >= 85 ? 'bg-emerald-500' : t.oee >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ height: `${t.oee}%` }} />
              </div>
              <p className="text-[10px] mt-1 font-medium">{t.oee}%</p>
              <p className="text-[10px] text-muted-foreground">{t.day}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] mt-2">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> ≥85% Target</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded" /> 80-85%</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded" /> &lt;80% Critical</span>
        </div>
      </Card>
    </div>
  )
}

// ─── Production Analytics ────────────────────────────────────────────────
function ProductionAnalyticsModule() {
  const kpis = [
    { scope: 'LINE-KK-01', name: 'Kaju Katli Line', planned: 560, actual: 542, achievement: 96.8, good: 540, scrap: 2, rework: 0, yieldPct: 99.6, scrapRate: 0.4, cycleTime: 4.2, setup: 30, downtime: 25, runtime: 425, throughput: 76.5 },
    { scope: 'LINE-IB-01', name: 'Idli Batter Line', planned: 100, actual: 95, achievement: 95.0, good: 95, scrap: 0, rework: 0, yieldPct: 100, scrapRate: 0, cycleTime: 6.0, setup: 15, downtime: 10, runtime: 435, throughput: 13.1 },
    { scope: 'LINE-NM-01', name: 'Namkeen Line', planned: 320, actual: 250, achievement: 78.1, good: 248, scrap: 2, rework: 0, yieldPct: 99.2, scrapRate: 0.8, cycleTime: 3.8, setup: 45, downtime: 142, runtime: 313, throughput: 47.9 },
    { scope: 'LINE-ML-01', name: 'Motichoor Line', planned: 290, actual: 294, achievement: 101.4, good: 292, scrap: 2, rework: 0, yieldPct: 99.3, scrapRate: 0.7, cycleTime: 4.5, setup: 20, downtime: 15, runtime: 445, throughput: 39.6 },
    { scope: 'LINE-GUL-01', name: 'Gulab Jamun Line', planned: 50, actual: 67, achievement: 134.0, good: 66, scrap: 1, rework: 0, yieldPct: 98.5, scrapRate: 1.5, cycleTime: 5.5, setup: 10, downtime: 5, runtime: 465, throughput: 8.6 },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" />Production Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 2 · Production KPI Engine · 10 KPIs across hourly/shift/daily/weekly/monthly</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Planned', value: '1,320 KG', color: 'text-blue-600' },
          { label: 'Total Actual', value: '1,248 KG', color: 'text-emerald-600' },
          { label: 'Achievement', value: '94.5%', color: 'text-emerald-600' },
          { label: 'Avg Yield', value: '99.4%', color: 'text-emerald-600' },
          { label: 'Avg Scrap Rate', value: '0.55%', color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Line</th>
                <th className="px-3 py-2 font-medium text-right">Planned / Actual</th>
                <th className="px-3 py-2 font-medium text-center">Achievement</th>
                <th className="px-3 py-2 font-medium text-right">Good / Scrap / Rework</th>
                <th className="px-3 py-2 font-medium text-center">Yield</th>
                <th className="px-3 py-2 font-medium text-center">Scrap Rate</th>
                <th className="px-3 py-2 font-medium text-center">Cycle Time</th>
                <th className="px-3 py-2 font-medium text-center">Setup/Downtime/Runtime (min)</th>
                <th className="px-3 py-2 font-medium text-right">Throughput</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map(k => (
                <tr key={k.scope} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{k.scope}</p><p className="text-[10px] text-muted-foreground">{k.name}</p></td>
                  <td className="px-3 py-2 text-right"><p className="font-medium">{k.actual} / {k.planned}</p><p className="text-[10px] text-muted-foreground">KG</p></td>
                  <td className="px-3 py-2 text-center"><span className={`font-bold ${k.achievement >= 100 ? 'text-emerald-600' : k.achievement >= 90 ? 'text-amber-600' : 'text-rose-600'}`}>{k.achievement}%</span></td>
                  <td className="px-3 py-2 text-right"><p className="text-emerald-600">{k.good} / <span className="text-rose-600">{k.scrap}</span> / <span className="text-amber-600">{k.rework}</span></p></td>
                  <td className="px-3 py-2 text-center font-medium text-emerald-600">{k.yieldPct}%</td>
                  <td className="px-3 py-2 text-center font-medium text-rose-600">{k.scrapRate}%</td>
                  <td className="px-3 py-2 text-center">{k.cycleTime}s</td>
                  <td className="px-3 py-2 text-center text-[10px]"><span className="text-blue-600">{k.setup}</span> / <span className="text-rose-600">{k.downtime}</span> / <span className="text-emerald-600">{k.runtime}</span></td>
                  <td className="px-3 py-2 text-right font-bold">{k.throughput} <span className="text-[10px] font-normal text-muted-foreground">KG/H</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">10 Production KPIs Tracked</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            { kpi: 'Production Quantity', icon: Package },
            { kpi: 'Target Achievement', icon: Target },
            { kpi: 'Yield', icon: Percent },
            { kpi: 'Cycle Time', icon: Clock },
            { kpi: 'Setup Time', icon: Settings },
            { kpi: 'Downtime', icon: AlertTriangle },
            { kpi: 'Scrap Rate', icon: Trash2 },
            { kpi: 'Rework Rate', icon: Recycle },
            { kpi: 'Throughput', icon: TrendingUp },
            { kpi: 'Good Pieces', icon: CheckCircle2 },
          ].map(k => (
            <div key={k.kpi} className="p-2 rounded border bg-muted/20 flex items-center gap-2">
              <k.icon className="h-4 w-4 text-blue-600" />
              <span className="text-[11px]">{k.kpi}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">KPIs calculated across 5 periods: Hourly · Shift · Daily · Weekly · Monthly</p>
      </Card>
    </div>
  )
}

// ─── Machine Analytics ──────────────────────────────────────────────────
function MachineAnalyticsModule() {
  const machines = [
    { code: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', availability: 95.5, performance: 96.0, quality: 99.2, oee: 91.0, utilization: 92.5, runtime: 444, downtime: 22, cycles: 24, output: 47, scrap: 0, faults: 0, status: 'RUNNING' },
    { code: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', availability: 93.5, performance: 94.5, quality: 99.0, oee: 87.6, utilization: 88.0, runtime: 422, downtime: 30, cycles: 48, output: 1, scrap: 0, faults: 0, status: 'RUNNING' },
    { code: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', availability: 25.0, performance: 0, quality: 0, oee: 0, utilization: 25.0, runtime: 120, downtime: 360, cycles: 0, output: 0, scrap: 0, faults: 1, status: 'FAULT' },
    { code: 'GRIND-01', name: 'Wet Grinder 01', line: 'LINE-IB-01', availability: 96.0, performance: 95.0, quality: 100, oee: 91.2, utilization: 95.0, runtime: 456, downtime: 24, cycles: 8, output: 45, scrap: 0, faults: 0, status: 'RUNNING' },
    { code: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', availability: 88.0, performance: 85.0, quality: 98.9, oee: 73.8, utilization: 65.0, runtime: 312, downtime: 168, cycles: 16, output: 188, scrap: 2, faults: 0, status: 'SETUP' },
    { code: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', availability: 78.0, performance: 80.0, quality: 100, oee: 62.4, utilization: 78.0, runtime: 374, downtime: 106, cycles: 4, output: 4, scrap: 0, faults: 0, status: 'CLEANING' },
  ]
  const statusColors: Record<string, string> = { RUNNING: 'bg-emerald-100 text-emerald-700', SETUP: 'bg-purple-100 text-purple-700', CLEANING: 'bg-cyan-100 text-cyan-700', FAULT: 'bg-rose-100 text-rose-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-purple-600" />Machine Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 4 · Machine Utilization · Per-machine OEE · Downtime · Faults</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Machines', value: 24, color: 'text-blue-600' },
          { label: 'Avg OEE', value: '84.2%', color: 'text-emerald-600' },
          { label: 'Avg Utilization', value: '73.9%', color: 'text-amber-600' },
          { label: 'High Downtime', value: 2, color: 'text-rose-600' },
          { label: 'Frequent Faults', value: 1, color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Machine Utilization Measures</p>
            <p className="text-xs text-muted-foreground mt-1">Runtime · Idle Time · Downtime · Maintenance Time · Cleaning Time · Utilization % · Capacity %. Alerts: Low Utilization (&lt;60%), High Downtime (&gt;120 min), Frequent Faults (&gt;3/day).</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium text-center">Availability</th>
                <th className="px-3 py-2 font-medium text-center">Performance</th>
                <th className="px-3 py-2 font-medium text-center">Quality</th>
                <th className="px-3 py-2 font-medium text-center">OEE</th>
                <th className="px-3 py-2 font-medium text-center">Utilization</th>
                <th className="px-3 py-2 font-medium text-right">Runtime / Downtime (min)</th>
                <th className="px-3 py-2 font-medium text-right">Cycles</th>
                <th className="px-3 py-2 font-medium text-right">Output / Scrap</th>
                <th className="px-3 py-2 font-medium text-center">Faults</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{m.code}</p><p className="text-[10px] text-muted-foreground">{m.name}</p><p className="text-[9px] text-muted-foreground">{m.line}</p></td>
                  <td className="px-3 py-2 text-center font-medium text-blue-600">{m.availability}%</td>
                  <td className="px-3 py-2 text-center font-medium text-purple-600">{m.performance}%</td>
                  <td className="px-3 py-2 text-center font-medium text-emerald-600">{m.quality}%</td>
                  <td className="px-3 py-2 text-center"><span className={`text-base font-bold ${m.oee >= 85 ? 'text-emerald-600' : m.oee >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{m.oee}%</span></td>
                  <td className="px-3 py-2 text-center">
                    <span className={`font-medium ${m.utilization >= 80 ? 'text-emerald-600' : m.utilization >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{m.utilization}%</span>
                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden w-16 mx-auto"><div className={`h-full ${m.utilization >= 80 ? 'bg-emerald-500' : m.utilization >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.utilization}%` }} /></div>
                  </td>
                  <td className="px-3 py-2 text-right"><p className="text-emerald-600">{m.runtime} / <span className="text-rose-600">{m.downtime}</span></p></td>
                  <td className="px-3 py-2 text-right">{m.cycles}</td>
                  <td className="px-3 py-2 text-right"><span className="text-emerald-600">{m.output}</span> / <span className="text-rose-600">{m.scrap}</span></td>
                  <td className={`px-3 py-2 text-center font-bold ${m.faults > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{m.faults}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[m.status]}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Operator Analytics ─────────────────────────────────────────────────
function OperatorAnalyticsModule() {
  const operators = [
    { code: 'OP-001', name: 'Rajesh Kumar', role: 'MIXING_OPERATOR', units: 192, tasks: 8, batches: 4, machineMin: 480, idleMin: 15, attHrs: 8.0, otHrs: 0, quality: 99.2, safety: 100, overall: 96.8, efficiency: 98.5, training: false, certExp: '2027-03-15' },
    { code: 'OP-002', name: 'Anil Reddy', role: 'COOKING_OPERATOR', units: 95, tasks: 5, batches: 2, machineMin: 480, idleMin: 30, attHrs: 8.0, otHrs: 0, quality: 100, safety: 100, overall: 94.2, efficiency: 94.0, training: false, certExp: '2026-12-20' },
    { code: 'OP-003', name: 'Suresh Mehta', role: 'FRYING_OPERATOR', units: 248, tasks: 6, batches: 2, machineMin: 420, idleMin: 60, attHrs: 8.0, otHrs: 0, quality: 99.6, safety: 98, overall: 87.4, efficiency: 85.0, training: false, certExp: '2027-01-10' },
    { code: 'OP-004', name: 'Vijay Patel', role: 'PACKING_OPERATOR', units: 188, tasks: 4, batches: 2, machineMin: 240, idleMin: 90, attHrs: 7.5, otHrs: 0, quality: 98.9, safety: 100, overall: 82.6, efficiency: 80.0, training: false, certExp: '2026-09-15' },
    { code: 'OP-005', name: 'Lakshmi V.', role: 'SHIFT_SUPERVISOR', units: 0, tasks: 12, batches: 0, machineMin: 0, idleMin: 0, attHrs: 8.0, otHrs: 0, quality: 100, safety: 100, overall: 95.0, efficiency: 95.0, training: false, certExp: '2027-05-20' },
    { code: 'OP-006', name: 'Mahesh K.', role: 'MAINTENANCE_TECH', units: 0, tasks: 3, batches: 0, machineMin: 120, idleMin: 240, attHrs: 8.0, otHrs: 2.0, quality: 100, safety: 95, overall: 78.5, efficiency: 75.0, training: true, certExp: '2026-08-01' },
  ]
  const scoreColor = (s: number) => s >= 90 ? 'text-emerald-600' : s >= 80 ? 'text-amber-600' : 'text-rose-600'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-emerald-600" />Operator Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 3 · Operator productivity · Quality & safety scores · Training & certification tracking</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Operators', value: 6, color: 'text-blue-600' },
          { label: 'Active', value: 5, color: 'text-emerald-600' },
          { label: 'Avg Score', value: '89.1', color: 'text-emerald-600' },
          { label: 'Avg Efficiency', value: '87.9%', color: 'text-emerald-600' },
          { label: 'Training Needed', value: 1, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-emerald-50/50 border-emerald-200">
        <h3 className="font-semibold text-sm mb-3">Top 3 Performers</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { rank: 1, name: 'Rajesh Kumar', score: 96.8, role: 'Mixing Operator', emoji: '🥇' },
            { rank: 2, name: 'Lakshmi V.', score: 95.0, role: 'Shift Supervisor', emoji: '🥈' },
            { rank: 3, name: 'Anil Reddy', score: 94.2, role: 'Cooking Operator', emoji: '🥉' },
          ].map(p => (
            <div key={p.rank} className="p-3 rounded-lg border bg-white">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{p.emoji}</span>
                <span className={`text-2xl font-bold ${scoreColor(p.score)}`}>{p.score}</span>
              </div>
              <p className="text-sm font-medium mt-2">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.role}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Operator</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium text-right">Units</th>
                <th className="px-3 py-2 font-medium text-right">Tasks/Batches</th>
                <th className="px-3 py-2 font-medium text-right">Machine/Idle (min)</th>
                <th className="px-3 py-2 font-medium text-right">Att/OT (hrs)</th>
                <th className="px-3 py-2 font-medium text-center">Quality</th>
                <th className="px-3 py-2 font-medium text-center">Safety</th>
                <th className="px-3 py-2 font-medium text-center">Overall</th>
                <th className="px-3 py-2 font-medium text-center">Efficiency</th>
                <th className="px-3 py-2 font-medium">Cert Expiry</th>
              </tr>
            </thead>
            <tbody>
              {operators.map(o => (
                <tr key={o.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{o.name}</p><p className="text-[10px] text-muted-foreground font-mono">{o.code}</p></td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{o.role.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-right font-medium">{o.units}</td>
                  <td className="px-3 py-2 text-right">{o.tasks} / {o.batches}</td>
                  <td className="px-3 py-2 text-right text-[11px]"><span className="text-emerald-600">{o.machineMin}</span> / <span className="text-amber-600">{o.idleMin}</span></td>
                  <td className="px-3 py-2 text-right text-[11px]">{o.attHrs} / {o.otHrs > 0 ? <span className="text-amber-600">{o.otHrs}</span> : '0'}</td>
                  <td className={`px-3 py-2 text-center font-bold ${scoreColor(o.quality)}`}>{o.quality}</td>
                  <td className={`px-3 py-2 text-center font-bold ${scoreColor(o.safety)}`}>{o.safety}</td>
                  <td className={`px-3 py-2 text-center text-base font-bold ${scoreColor(o.overall)}`}>{o.overall}</td>
                  <td className={`px-3 py-2 text-center font-bold ${o.efficiency >= 90 ? 'text-emerald-600' : o.efficiency >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{o.efficiency}%</td>
                  <td className="px-3 py-2 text-[10px]"><span className={o.certExp === '2026-08-01' ? 'text-rose-600 font-bold' : 'text-muted-foreground'}>{o.certExp}</span>{o.training && <span className="ml-1 text-amber-600">⚠ Training</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Downtime Center ────────────────────────────────────────────────────
function DowntimeCenterModule() {
  const events = [
    { code: 'DTE-00048', machine: 'FRY-01', reason: 'MACHINE_FAILURE', category: 'EQUIPMENT', desc: 'Hydraulic pressure loss', start: '2026-07-09 14:25', end: null, duration: 35, shift: 'SHIFT-B', operator: 'Suresh Mehta', lostOutput: 48, lostCost: 4800, status: 'OPEN' },
    { code: 'DTE-00047', machine: 'COOL-01', reason: 'CLEANING', category: 'PLANNED', desc: 'Scheduled cleaning', start: '2026-07-09 13:30', end: '2026-07-09 14:00', duration: 30, shift: 'SHIFT-B', operator: 'Suresh Mehta', lostOutput: 0, lostCost: 0, status: 'RESOLVED' },
    { code: 'DTE-00046', machine: 'MIX-02', reason: 'MATERIAL_SHORTAGE', category: 'MATERIAL', desc: 'Urad Dal 2kg short', start: '2026-07-09 10:00', end: '2026-07-09 10:15', duration: 15, shift: 'SHIFT-A', operator: 'Anil Reddy', lostOutput: 12, lostCost: 1200, status: 'RESOLVED' },
    { code: 'DTE-00045', machine: 'PACK-03', reason: 'CHANGE_OVER', category: 'PLANNED', desc: 'Changeover from 1kg to 500g', start: '2026-07-09 11:30', end: '2026-07-09 12:00', duration: 30, shift: 'SHIFT-A', operator: 'Vijay Patel', lostOutput: 0, lostCost: 0, status: 'RESOLVED' },
    { code: 'DTE-00044', machine: 'CONV-01', reason: 'OPERATOR_DELAY', category: 'OPERATOR', desc: 'Operator late from break', start: '2026-07-09 09:30', end: '2026-07-09 09:45', duration: 15, shift: 'SHIFT-A', operator: null, lostOutput: 6, lostCost: 600, status: 'RESOLVED' },
  ]
  const pareto = [
    { reason: 'MACHINE_FAILURE', category: 'EQUIPMENT', count: 4, totalMin: 145, percent: 36.5, cumulative: 36.5, lostCost: 14400, severity: 'CRITICAL' },
    { reason: 'CLEANING', category: 'PLANNED', count: 8, totalMin: 90, percent: 22.6, cumulative: 59.1, lostCost: 0, severity: 'LOW' },
    { reason: 'CHANGE_OVER', category: 'PLANNED', count: 6, totalMin: 60, percent: 15.1, cumulative: 74.2, lostCost: 0, severity: 'LOW' },
    { reason: 'OPERATOR_DELAY', category: 'OPERATOR', count: 3, totalMin: 45, percent: 11.3, cumulative: 85.5, lostCost: 1800, severity: 'MEDIUM' },
    { reason: 'MATERIAL_SHORTAGE', category: 'MATERIAL', count: 2, totalMin: 30, percent: 7.5, cumulative: 93.0, lostCost: 2400, severity: 'MEDIUM' },
    { reason: 'MAINTENANCE', category: 'PLANNED', count: 2, totalMin: 18, percent: 4.5, cumulative: 97.5, lostCost: 0, severity: 'LOW' },
    { reason: 'QUALITY_HOLD', category: 'QUALITY', count: 1, totalMin: 10, percent: 2.5, cumulative: 100.0, lostCost: 500, severity: 'MEDIUM' },
  ]
  const categoryColors: Record<string, string> = { EQUIPMENT: 'bg-rose-100 text-rose-700', MATERIAL: 'bg-amber-100 text-amber-700', OPERATOR: 'bg-purple-100 text-purple-700', UTILITY: 'bg-orange-100 text-orange-700', PLANNED: 'bg-blue-100 text-blue-700', QUALITY: 'bg-cyan-100 text-cyan-700' }
  const statusColors: Record<string, string> = { OPEN: 'bg-rose-100 text-rose-700', RESOLVED: 'bg-emerald-100 text-emerald-700' }
  const severityColors: Record<string, string> = { LOW: 'bg-slate-100 text-slate-700', MEDIUM: 'bg-amber-100 text-amber-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-rose-100 text-rose-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-rose-600" />Downtime Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 5 · Pareto analysis · 8 reason codes · 6 categories · Heat map</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Events', value: 26, color: 'text-blue-600' },
          { label: 'Total Downtime', value: '398 min', color: 'text-rose-600' },
          { label: 'Lost Output', value: '84 KG', color: 'text-rose-600' },
          { label: 'Lost Cost', value: fmtINR(19100), color: 'text-rose-600' },
          { label: 'Top Reason', value: 'MACHINE_FAILURE', color: 'text-rose-700' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Pareto Chart — Downtime by Reason (80/20 analysis)</h3>
        <div className="space-y-2">
          {pareto.map(p => (
            <div key={p.reason} className="flex items-center gap-3">
              <div className="w-40 text-xs">
                <p className="font-medium">{p.reason.replace(/_/g, ' ')}</p>
                <span className={`text-[9px] px-1 py-0.5 rounded ${categoryColors[p.category]}`}>{p.category}</span>
              </div>
              <div className="flex-1 relative h-6 bg-muted rounded overflow-hidden">
                <div className={`h-full ${p.severity === 'CRITICAL' ? 'bg-rose-500' : p.severity === 'HIGH' ? 'bg-orange-500' : p.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${p.percent * 2}%` }} />
                <div className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium">{p.totalMin} min · {p.count} events</div>
              </div>
              <div className="w-16 text-right text-xs">
                <p className="font-bold">{p.percent}%</p>
                <p className="text-[9px] text-muted-foreground">cum {p.cumulative}%</p>
              </div>
              <div className="w-20 text-right text-xs">
                {p.lostCost > 0 ? <p className="text-rose-600 font-medium">{fmtINR(p.lostCost)}</p> : <p className="text-muted-foreground">—</p>}
              </div>
              <div className="w-20"><span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${severityColors[p.severity]}`}>{p.severity}</span></div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">Pareto insight: Top 2 reasons (MACHINE_FAILURE + CLEANING) account for 59.1% of all downtime. Focus maintenance on FRY-01 to address top reason.</p>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Downtime Events</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium">Reason / Category</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium text-center">Duration</th>
                <th className="px-3 py-2 font-medium">Shift / Operator</th>
                <th className="px-3 py-2 font-medium text-right">Lost Output</th>
                <th className="px-3 py-2 font-medium text-right">Lost Cost</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{e.code}</td>
                  <td className="px-3 py-2 font-mono text-[11px] font-medium text-blue-700">{e.machine}</td>
                  <td className="px-3 py-2"><p className="text-[11px] font-medium">{e.reason.replace(/_/g, ' ')}</p><span className={`text-[9px] px-1 py-0.5 rounded ${categoryColors[e.category]}`}>{e.category}</span></td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">{e.desc}</td>
                  <td className="px-3 py-2 text-[10px]"><p>{e.start}</p>{e.end && <p className="text-muted-foreground">→ {e.end}</p>}</td>
                  <td className="px-3 py-2 text-center font-bold text-rose-600">{e.duration}m</td>
                  <td className="px-3 py-2 text-[10px]"><p>{e.shift}</p>{e.operator && <p className="text-muted-foreground">{e.operator}</p>}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">{e.lostOutput > 0 ? `${e.lostOutput} KG` : '—'}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">{e.lostCost > 0 ? fmtINR(e.lostCost) : '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[e.status]}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Manufacturing Heat Maps ────────────────────────────────────────────
function ManufacturingHeatmapsModule() {
  const utilization = [
    { machine: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', utilization: 92.5, capacity: 95.0, runtimeMin: 444, plannedMin: 480, status: 'NORMAL', intensity: 92 },
    { machine: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', utilization: 88.0, capacity: 95.0, runtimeMin: 422, plannedMin: 480, status: 'NORMAL', intensity: 88 },
    { machine: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', utilization: 25.0, capacity: 95.0, runtimeMin: 120, plannedMin: 480, status: 'CRITICAL', intensity: 25 },
    { machine: 'GRIND-01', name: 'Wet Grinder 01', line: 'LINE-IB-01', utilization: 95.0, capacity: 95.0, runtimeMin: 456, plannedMin: 480, status: 'NORMAL', intensity: 95 },
    { machine: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', utilization: 65.0, capacity: 95.0, runtimeMin: 312, plannedMin: 480, status: 'WARNING', intensity: 65 },
    { machine: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', utilization: 78.0, capacity: 95.0, runtimeMin: 374, plannedMin: 480, status: 'WARNING', intensity: 78 },
  ]
  const intensityColor = (i: number) => i >= 85 ? 'bg-emerald-500' : i >= 60 ? 'bg-amber-500' : 'bg-rose-500'
  const statusColors: Record<string, string> = { NORMAL: 'bg-emerald-100 text-emerald-700', WARNING: 'bg-amber-100 text-amber-700', CRITICAL: 'bg-rose-100 text-rose-700', BOTTLENECK: 'bg-purple-100 text-purple-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Grid3x3 className="h-6 w-6 text-purple-600" />Manufacturing Heat Maps</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 6 · 6 heatmap types · Machine utilization · Bottleneck identification</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { type: 'MACHINE_UTILIZATION', desc: 'Runtime vs available', cells: 24, icon: Server },
          { type: 'OPERATOR_ACTIVITY', desc: 'Active vs idle', cells: 6, icon: Users },
          { type: 'PRODUCTION_SPEED', desc: 'Output rate by line', cells: 5, icon: Activity },
          { type: 'DOWNTIME', desc: 'Downtime density', cells: 24, icon: AlertTriangle },
          { type: 'QUALITY_FAILURES', desc: 'Reject rate', cells: 24, icon: ShieldCheck },
          { type: 'BOTTLENECKS', desc: 'Bottleneck ID', cells: 5, icon: GitBranch },
        ].map(h => (
          <Card key={h.type} className="p-3">
            <h.icon className="h-5 w-5 text-purple-600" />
            <p className="text-[10px] font-bold mt-2">{h.type.replace(/_/g, ' ')}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{h.desc}</p>
            <p className="text-[9px] text-blue-600 mt-1">{h.cells} cells</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Machine Utilization Heat Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {utilization.map(u => (
            <div key={u.machine} className={`p-3 rounded-lg border-2 ${u.status === 'CRITICAL' ? 'border-rose-400' : u.status === 'WARNING' ? 'border-amber-400' : 'border-emerald-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-mono text-[11px] font-bold text-blue-700">{u.machine}</p>
                  <p className="text-[10px] text-muted-foreground">{u.name}</p>
                  <p className="text-[9px] text-muted-foreground">{u.line}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[u.status]}`}>{u.status}</span>
              </div>
              <div className={`h-8 rounded ${intensityColor(u.intensity)} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{u.utilization}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                <div><p className="text-muted-foreground">Runtime</p><p className="font-medium">{u.runtimeMin}m</p></div>
                <div><p className="text-muted-foreground">Planned</p><p className="font-medium">{u.plannedMin}m</p></div>
                <div><p className="text-muted-foreground">Capacity</p><p className="font-medium">{u.capacity}%</p></div>
                <div><p className="text-muted-foreground">Intensity</p><p className="font-medium">{u.intensity}/100</p></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Production Bottlenecks</h3>
        <div className="space-y-2">
          {[
            { line: 'LINE-NM-01', name: 'Namkeen Line', bottleneck: 'FRY-01 (Hydraulic Fault)', impact: 'Production halted', lostOutput: 70, severity: 'CRITICAL' },
            { line: 'LINE-KK-01', name: 'Kaju Katli Line', bottleneck: 'COOL-01 (Cleaning overruns)', impact: 'WIP backlog', lostOutput: 12, severity: 'WARNING' },
            { line: 'LINE-IB-01', name: 'Idli Batter Line', bottleneck: 'None', impact: 'None', lostOutput: 0, severity: 'NORMAL' },
          ].map(b => (
            <div key={b.line} className={`p-3 rounded-lg border-l-4 ${b.severity === 'CRITICAL' ? 'border-rose-500 bg-rose-50/30' : b.severity === 'WARNING' ? 'border-amber-400 bg-amber-50/30' : 'border-emerald-400 bg-emerald-50/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] text-blue-700">{b.line}</p>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5"><strong>Bottleneck:</strong> {b.bottleneck}</p>
                  <p className="text-[11px] text-muted-foreground"><strong>Impact:</strong> {b.impact}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${b.lostOutput > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{b.lostOutput} KG</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[b.severity]}`}>{b.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Manufacturing Cost Analytics ───────────────────────────────────────
function CostAnalyticsModule() {
  const byProduct = [
    { product: 'Kaju Katli 500g', sku: 'KK-500', batches: 8, qty: 752, total: 161080, planned: 150400, variance: 10680, variancePct: 7.1, perKg: 214.2, marginPct: 38.8, trend: 'INCREASING' },
    { product: 'Kaju Katli 1kg', sku: 'KK-1KG', batches: 6, qty: 588, total: 125460, planned: 117600, variance: 7860, variancePct: 6.7, perKg: 213.4, marginPct: 37.3, trend: 'INCREASING' },
    { product: 'Shwet Idli Batter 1kg', sku: 'IB-1KG', batches: 4, qty: 380, total: 39330, planned: 38000, variance: 1330, variancePct: 3.5, perKg: 103.5, marginPct: 20.4, trend: 'STABLE' },
    { product: 'Motichoor Laddu 1kg', sku: 'ML-1KG', batches: 3, qty: 294, total: 47040, planned: 44100, variance: 2940, variancePct: 6.7, perKg: 160.0, marginPct: 33.3, trend: 'INCREASING' },
    { product: 'Mixed Namkeen 500g', sku: 'NM-500', batches: 2, qty: 500, total: 54300, planned: 50000, variance: 4300, variancePct: 8.6, perKg: 108.6, marginPct: 22.4, trend: 'INCREASING' },
  ]
  const trendColors: Record<string, string> = { INCREASING: 'bg-rose-100 text-rose-700', STABLE: 'bg-slate-100 text-slate-700', DECREASING: 'bg-emerald-100 text-emerald-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6 text-amber-600" />Manufacturing Cost Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 7 · Cost per batch/kg/machine/labor/energy · Variance trends · Line vs line</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Cost', value: fmtINR(184600), color: 'text-blue-600' },
          { label: 'Total Planned', value: fmtINR(178400), color: 'text-emerald-600' },
          { label: 'Total Variance', value: fmtINR(6200), color: 'text-rose-600' },
          { label: 'Avg Cost / Kg', value: fmtINR(152), color: 'text-purple-600' },
          { label: 'Avg Margin', value: '30.3%', color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Cost Analytics by Product</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium text-center">Batches</th>
                <th className="px-3 py-2 font-medium text-right">Total Qty</th>
                <th className="px-3 py-2 font-medium text-right">Total Cost</th>
                <th className="px-3 py-2 font-medium text-right">Planned Cost</th>
                <th className="px-3 py-2 font-medium text-right">Variance</th>
                <th className="px-3 py-2 font-medium text-center">Var %</th>
                <th className="px-3 py-2 font-medium text-right">Per Kg</th>
                <th className="px-3 py-2 font-medium text-center">Margin %</th>
                <th className="px-3 py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map(p => (
                <tr key={p.sku} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{p.product}</p><p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p></td>
                  <td className="px-3 py-2 text-center">{p.batches}</td>
                  <td className="px-3 py-2 text-right">{p.qty} KG</td>
                  <td className="px-3 py-2 text-right font-bold">{fmtINR(p.total)}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{fmtINR(p.planned)}</td>
                  <td className="px-3 py-2 text-right text-rose-600 font-medium">+{fmtINR(p.variance)}</td>
                  <td className="px-3 py-2 text-center text-rose-600 font-medium">{p.variancePct}%</td>
                  <td className="px-3 py-2 text-right font-medium">₹{p.perKg}</td>
                  <td className="px-3 py-2 text-center text-emerald-600 font-bold">{p.marginPct}%</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${trendColors[p.trend]}`}>{p.trend}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Cost Analytics by Production Line</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { line: 'LINE-KK-01', name: 'Kaju Katli Line', total: 286540, perKg: 213.8, variancePct: 6.9, marginPct: 38.1 },
            { line: 'LINE-IB-01', name: 'Idli Batter Line', total: 39330, perKg: 103.5, variancePct: 3.5, marginPct: 20.4 },
            { line: 'LINE-NM-01', name: 'Namkeen Line', total: 54300, perKg: 108.6, variancePct: 8.6, marginPct: 22.4 },
            { line: 'LINE-ML-01', name: 'Motichoor Line', total: 47040, perKg: 160.0, variancePct: 6.7, marginPct: 33.3 },
          ].map(l => (
            <div key={l.line} className="p-3 rounded-lg border bg-muted/20">
              <p className="font-mono text-[10px] text-blue-700">{l.line}</p>
              <p className="text-sm font-medium">{l.name}</p>
              <p className="text-base font-bold mt-2">{fmtINR(l.total)}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 pt-2 border-t border-slate-200">
                <div><p className="text-muted-foreground">Per Kg</p><p className="font-bold">₹{l.perKg}</p></div>
                <div><p className="text-muted-foreground">Variance</p><p className="font-bold text-rose-600">{l.variancePct}%</p></div>
                <div><p className="text-muted-foreground">Margin</p><p className="font-bold text-emerald-600">{l.marginPct}%</p></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Executive Manufacturing Dashboard ──────────────────────────────────
function ExecutiveDashboardModule() {
  const highlights = [
    { type: 'CRITICAL', title: 'FRY-01 Fault - Hydraulic Pressure Loss', impact: '70 KG lost output', action: 'Maintenance in progress' },
    { type: 'SUCCESS', title: 'LINE-ML-01 exceeded target by 1.4%', impact: '+4 KG extra output', action: 'No action needed' },
    { type: 'WARNING', title: 'Mixed Namkeen variance 8.6% over plan', impact: '₹2,150 cost overrun', action: 'Procurement to negotiate cashew contract' },
    { type: 'INFO', title: 'OEE 84.2% (target 85%) - 0.8% below target', impact: 'Slight miss', action: 'Monitor tomorrow' },
  ]
  const highlightColors: Record<string, string> = { CRITICAL: 'border-rose-500 bg-rose-50/40', SUCCESS: 'border-emerald-500 bg-emerald-50/40', WARNING: 'border-amber-400 bg-amber-50/40', INFO: 'border-blue-400 bg-blue-50/40' }
  const highlightBadge: Record<string, string> = { CRITICAL: 'bg-rose-100 text-rose-700', SUCCESS: 'bg-emerald-100 text-emerald-700', WARNING: 'bg-amber-100 text-amber-700', INFO: 'bg-blue-100 text-blue-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Radar className="h-6 w-6 text-purple-600" />Executive Manufacturing Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 44 · Epic 8 · Plant-wide roll-up · Factory health · Live metrics · Refresh &lt;5s</p>
        </div>
        <Badge variant="outline" className="text-emerald-700 border-emerald-300"><Activity className="mr-1 h-3 w-3" />Live · 1.8s refresh</Badge>
      </div>
      <Card className="p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 border-purple-300">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Thane Plant · Today · Factory Health</p>
            <p className="text-4xl font-bold text-purple-700 mt-1">87.5</p>
            <Badge className="mt-2 bg-emerald-500 hover:bg-emerald-600">HEALTHY</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2 rounded border bg-white/70"><p className="text-muted-foreground">Production</p><p className="text-lg font-bold text-emerald-600">1,248 KG</p><p className="text-[10px] text-muted-foreground">94.5% of target</p></div>
            <div className="p-2 rounded border bg-white/70"><p className="text-muted-foreground">Avg OEE</p><p className="text-lg font-bold text-purple-600">84.2%</p><p className="text-[10px] text-muted-foreground">target 85%</p></div>
            <div className="p-2 rounded border bg-white/70"><p className="text-muted-foreground">Machines Running</p><p className="text-lg font-bold text-blue-600">18/24</p><p className="text-[10px] text-rose-600">1 fault</p></div>
            <div className="p-2 rounded border bg-white/70"><p className="text-muted-foreground">Cost / Kg</p><p className="text-lg font-bold text-amber-600">₹152.4</p><p className="text-[10px] text-rose-600">+3.5% variance</p></div>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Availability', value: '93.5%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Performance', value: '91.2%', icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Quality (FPY)', value: '99.4%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Labor Efficiency', value: '87.9%', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Scrap Rate', value: '0.55%', icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Downtime', value: '142 min', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Active Alerts', value: '2 (1 critical)', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Total Cost', value: '₹1,84,600', icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <Card key={s.label} className={`p-3 ${s.bg}`}>
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
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Today's Highlights</h3>
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${highlightColors[h.type]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${highlightBadge[h.type]}`}>{h.type}</span>
                  <p className="text-xs font-medium">{h.title}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1"><strong>Impact:</strong> {h.impact}</p>
              <p className="text-[11px] text-blue-700"><strong>Action:</strong> {h.action}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 bg-purple-50/40 border-purple-200">
        <div className="flex items-start gap-3">
          <Radar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Executive Reports Available</p>
            <p className="text-xs text-muted-foreground mt-1">Daily · Weekly · Monthly · Quarterly · Annual · Custom date range. Role-based access (Plant Head, Production Head, Operations Director, CEO). Refresh target &lt;5 seconds for full plant aggregation. Historical analytics immutable after period close.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
