// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 46 — PRODUCTION SCHEDULING, FINITE CAPACITY PLANNING & OPTIMIZATION
// Admin modules: Scheduling Dashboard, Machine Schedule, Shift Planner,
// Campaign Planner, Constraint Center, Simulation Console, Production Calendar,
// Capacity Heat Map
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Scheduling Dashboard ───────────────────────────────────────────────
function SchedulingDashboardModule() {
  const kpis = {
    totalSchedules: 12, activeSchedules: 3, published: 8, draft: 3, executing: 1,
    avgUtilization: 87.5, totalChangeovers: 24, totalChangeoverMin: 720,
    campaignsActive: 2, constraintsDetected: 4, constraintsResolved: 18,
    simulationsRun: 6, optimizationScore: 89.2,
  }
  const schedules = [
    { number: 'SCH-2026-00012', plant: 'THN', line: 'LINE-KK-01', lineName: 'Kaju Katli Line', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 116, availableHrs: 120, utilization: 96.7, changeovers: 4, constraints: 0, status: 'EXECUTING', version: 3, optimizationScore: 92.5, planner: 'Lakshmi V.' },
    { number: 'SCH-2026-00011', plant: 'THN', line: 'LINE-IB-01', lineName: 'Idli Batter Line', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 102, availableHrs: 120, utilization: 85.0, changeovers: 2, constraints: 0, status: 'PUBLISHED', version: 2, optimizationScore: 88.0, planner: 'Lakshmi V.' },
    { number: 'SCH-2026-00010', plant: 'THN', line: 'LINE-NM-01', lineName: 'Namkeen Line', type: 'WEEKLY', date: '2026-07-09', method: 'CAMPAIGN', plannedHrs: 108, availableHrs: 120, utilization: 90.0, changeovers: 3, constraints: 1, status: 'PUBLISHED', version: 4, optimizationScore: 84.2, planner: 'Lakshmi V.' },
    { number: 'SCH-2026-00009', plant: 'THN', line: 'LINE-ML-01', lineName: 'Motichoor Line', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 98, availableHrs: 120, utilization: 81.7, changeovers: 2, constraints: 0, status: 'PUBLISHED', version: 1, optimizationScore: 90.0, planner: 'Lakshmi V.' },
    { number: 'SCH-2026-00008', plant: 'THN', line: 'LINE-GUL-01', lineName: 'Gulab Jamun Line', type: 'WEEKLY', date: '2026-07-09', method: 'CAMPAIGN', plannedHrs: 64, availableHrs: 80, utilization: 80.0, changeovers: 1, constraints: 0, status: 'PUBLISHED', version: 2, optimizationScore: 95.0, planner: 'Lakshmi V.' },
  ]
  const methodColors: Record<string, string> = { FINITE_CAPACITY: 'bg-blue-100 text-blue-700', CAMPAIGN: 'bg-emerald-100 text-emerald-700', INFINITE_CAPACITY: 'bg-slate-100 text-slate-700', FORWARD: 'bg-amber-100 text-amber-700', BACKWARD: 'bg-purple-100 text-purple-700', JUST_IN_TIME: 'bg-cyan-100 text-cyan-700', PRIORITY: 'bg-rose-100 text-rose-700', MANUAL: 'bg-slate-100 text-slate-700' }
  const statusColors: Record<string, string> = { DRAFT: 'bg-slate-100 text-slate-700', SIMULATED: 'bg-amber-100 text-amber-700', PUBLISHED: 'bg-blue-100 text-blue-700', EXECUTING: 'bg-emerald-100 text-emerald-700', COMPLETED: 'bg-emerald-200 text-emerald-800', ARCHIVED: 'bg-zinc-100 text-zinc-700', CANCELLED: 'bg-rose-100 text-rose-700' }
  const utilColor = (u: number) => u >= 90 ? 'text-emerald-600' : u >= 75 ? 'text-amber-600' : 'text-rose-600'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-blue-600" />Scheduling Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Finite Capacity Scheduling · Never creates an impossible schedule</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Schedule</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Schedules', value: kpis.totalSchedules, color: 'text-blue-600', icon: Calendar },
          { label: 'Executing', value: kpis.executing, color: 'text-emerald-600', icon: Activity },
          { label: 'Avg Utilization', value: `${kpis.avgUtilization}%`, color: 'text-emerald-600', icon: Gauge },
          { label: 'Changeovers', value: kpis.totalChangeovers, color: 'text-amber-600', icon: GitFork },
          { label: 'Campaigns Active', value: kpis.campaignsActive, color: 'text-purple-600', icon: Boxes },
          { label: 'Optimization Score', value: kpis.optimizationScore, color: 'text-emerald-600', icon: Target },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/40" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Scheduling Architecture — Demand → Material + Capacity + Operators → Optimized Schedule</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Demand', 'Production Orders', 'Material Availability + Machine Capacity + Operator Availability', 'Scheduling Engine', 'Optimized Production Schedule', 'Shop Floor'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">8 Scheduling Methods: Finite Capacity · Infinite Capacity · Forward · Backward · Just-In-Time · Campaign · Priority · Manual</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Production Schedules</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Schedule Number</th>
                <th className="px-3 py-2 font-medium">Plant / Line</th>
                <th className="px-3 py-2 font-medium">Type / Date</th>
                <th className="px-3 py-2 font-medium">Method</th>
                <th className="px-3 py-2 font-medium text-right">Planned / Available Hrs</th>
                <th className="px-3 py-2 font-medium text-center">Utilization</th>
                <th className="px-3 py-2 font-medium text-center">Changeovers</th>
                <th className="px-3 py-2 font-medium text-center">Constraints</th>
                <th className="px-3 py-2 font-medium text-center">Opt Score</th>
                <th className="px-3 py-2 font-medium text-center">Version</th>
                <th className="px-3 py-2 font-medium">Planner</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.number} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{s.number}</td>
                  <td className="px-3 py-2"><p>{s.plant}</p><p className="text-[10px] text-muted-foreground">{s.lineName}</p></td>
                  <td className="px-3 py-2"><p className="text-[11px]">{s.type}</p><p className="text-[10px] text-muted-foreground">{s.date}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${methodColors[s.method]}`}>{s.method.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-right"><p className="font-medium">{s.plannedHrs} / {s.availableHrs}</p><p className="text-[10px] text-muted-foreground">hours</p></td>
                  <td className={`px-3 py-2 text-center font-bold ${utilColor(s.utilization)}`}>{s.utilization}%</td>
                  <td className="px-3 py-2 text-center">{s.changeovers}</td>
                  <td className="px-3 py-2 text-center"><span className={s.constraints > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>{s.constraints}</span></td>
                  <td className={`px-3 py-2 text-center font-bold ${s.optimizationScore >= 90 ? 'text-emerald-600' : s.optimizationScore >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{s.optimizationScore}</td>
                  <td className="px-3 py-2 text-center">v{s.version}</td>
                  <td className="px-3 py-2 text-[11px]">{s.planner}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Machine Schedule (Gantt-style timeline) ────────────────────────────
function MachineScheduleModule() {
  const machines = [
    { code: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', operations: 4, runtime: 280, setup: 80, cleaning: 30, idle: 30, utilization: 88.0, status: 'RUNNING' },
    { code: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', operations: 3, runtime: 255, setup: 40, cleaning: 0, idle: 65, utilization: 92.5, status: 'RUNNING' },
    { code: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', operations: 3, runtime: 210, setup: 0, cleaning: 90, idle: 60, utilization: 78.0, status: 'CLEANING' },
    { code: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', operations: 2, runtime: 120, setup: 60, cleaning: 0, idle: 180, utilization: 65.0, status: 'SETUP' },
    { code: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', operations: 0, runtime: 0, setup: 0, cleaning: 0, idle: 360, utilization: 25.0, status: 'FAULT' },
  ]
  const timeline = [
    { machine: 'MIX-01', type: 'PRODUCTION', product: 'Kaju Katli 500g', start: '06:00', end: '07:30', duration: 90, shift: 'A', status: 'COMPLETED' },
    { machine: 'MIX-01', type: 'CHANGE_OVER', product: '→ Kesar Kaju Katli', start: '07:30', end: '07:40', duration: 10, shift: 'A', status: 'COMPLETED' },
    { machine: 'MIX-01', type: 'PRODUCTION', product: 'Kesar Kaju Katli 500g', start: '07:40', end: '09:00', duration: 80, shift: 'A', status: 'IN_PROGRESS' },
    { machine: 'MIX-01', type: 'PRODUCTION', product: 'Pista Kaju Katli 500g', start: '09:00', end: '10:30', duration: 90, shift: 'B', status: 'PLANNED' },
    { machine: 'MIX-01', type: 'FULL_CLEAN', product: '→ Gulab Jamun (allergen)', start: '10:30', end: '11:45', duration: 75, shift: 'B', status: 'PLANNED' },
    { machine: 'MIX-01', type: 'PRODUCTION', product: 'Gulab Jamun 1kg', start: '11:45', end: '13:30', duration: 105, shift: 'B', status: 'PLANNED' },
    { machine: 'COOK-01', type: 'PRODUCTION', product: 'Kaju Katli 500g', start: '06:30', end: '08:00', duration: 90, shift: 'A', status: 'COMPLETED' },
    { machine: 'COOK-01', type: 'PRODUCTION', product: 'Kesar Kaju Katli 500g', start: '08:00', end: '09:30', duration: 90, shift: 'A', status: 'IN_PROGRESS' },
    { machine: 'COOK-01', type: 'PRODUCTION', product: 'Kaju Katli 1kg', start: '11:00', end: '13:00', duration: 120, shift: 'B', status: 'PLANNED' },
  ]
  const typeColors: Record<string, string> = { PRODUCTION: 'bg-emerald-500', SETUP: 'bg-purple-500', CLEANING: 'bg-cyan-500', MAINTENANCE: 'bg-amber-500', IDLE: 'bg-slate-300', CHANGE_OVER: 'bg-amber-400', FULL_CLEAN: 'bg-rose-500' }
  const statusColors: Record<string, string> = { RUNNING: 'bg-emerald-100 text-emerald-700', CLEANING: 'bg-cyan-100 text-cyan-700', SETUP: 'bg-purple-100 text-purple-700', FAULT: 'bg-rose-100 text-rose-700', IDLE: 'bg-slate-100 text-slate-700' }
  const opStatusColors: Record<string, string> = { COMPLETED: 'opacity-50', IN_PROGRESS: 'ring-2 ring-blue-500', PLANNED: 'opacity-80' }
  const utilColor = (u: number) => u >= 85 ? 'text-emerald-600' : u >= 60 ? 'text-amber-600' : 'text-rose-600'
  // Gantt visualization: 6:00 to 14:00 = 8 hours = 480 min, each hour = 60px
  const timeToX = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return ((h - 6) * 60 + m)
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-purple-600" />Machine Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Epic 2 · Gantt timeline · Machine operations · Setup/Cleaning/Maintenance/Idle</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Machines', value: 5, color: 'text-blue-600' },
          { label: 'Total Operations', value: 12, color: 'text-blue-600' },
          { label: 'Total Runtime', value: '865 min', color: 'text-emerald-600' },
          { label: 'Avg Utilization', value: '69.7%', color: 'text-amber-600' },
          { label: 'Blocked', value: 1, color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Machine Utilization Summary</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium">Line</th>
                <th className="px-3 py-2 font-medium text-center">Operations</th>
                <th className="px-3 py-2 font-medium text-right">Runtime (min)</th>
                <th className="px-3 py-2 font-medium text-right">Setup</th>
                <th className="px-3 py-2 font-medium text-right">Cleaning</th>
                <th className="px-3 py-2 font-medium text-right">Idle</th>
                <th className="px-3 py-2 font-medium text-center">Utilization</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{m.code}</p><p className="text-[10px] text-muted-foreground">{m.name}</p></td>
                  <td className="px-3 py-2 text-[11px]">{m.line}</td>
                  <td className="px-3 py-2 text-center font-medium">{m.operations}</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-medium">{m.runtime}</td>
                  <td className="px-3 py-2 text-right text-purple-600">{m.setup}</td>
                  <td className="px-3 py-2 text-right text-cyan-600">{m.cleaning}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{m.idle}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${m.utilization >= 85 ? 'bg-emerald-500' : m.utilization >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.utilization}%` }} /></div>
                      <span className={`font-bold ${utilColor(m.utilization)}`}>{m.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[m.status]}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Gantt Timeline (06:00 - 14:00) — Kaju Katli Line Campaign</h3>
        <div className="overflow-x-auto">
          {/* Time axis */}
          <div className="flex border-b border-slate-200 mb-2 ml-32" style={{ minWidth: '480px' }}>
            {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map(t => (
              <div key={t} className="text-[10px] text-muted-foreground text-center" style={{ width: '60px' }}>{t}</div>
            ))}
          </div>
          {/* Machine rows */}
          {['MIX-01', 'COOK-01'].map(machineCode => (
            <div key={machineCode} className="flex items-center mb-2" style={{ minWidth: '480px' }}>
              <div className="w-32 text-xs font-mono text-blue-700 pr-2 flex-shrink-0">{machineCode}</div>
              <div className="flex-1 relative h-8 bg-muted/30 rounded" style={{ minWidth: '480px' }}>
                {timeline.filter(t => t.machine === machineCode).map((op, i) => {
                  const left = timeToX(op.start)
                  const width = timeToX(op.end) - left
                  return (
                    <div key={i} className={`absolute h-7 rounded ${typeColors[op.type]} ${opStatusColors[op.status]} flex items-center justify-center text-[9px] text-white font-medium overflow-hidden`}
                      style={{ left: `${left}px`, width: `${width}px`, top: '2px' }} title={`${op.product} (${op.start}-${op.end})`}>
                      {width > 30 && op.product.length > 8 ? op.product.slice(0, 12) + '...' : op.product}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] mt-3 flex-wrap">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> Production</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded" /> Changeover</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded" /> Full Clean (Allergen)</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-cyan-500 rounded" /> Cleaning</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded" /> Setup</span>
        </div>
      </Card>
    </div>
  )
}

// ─── Shift Planner ──────────────────────────────────────────────────────
function ShiftPlannerModule() {
  const shifts = [
    { code: 'SHIFT-A', name: 'Morning Shift', start: '06:00', end: '14:00', durationHrs: 8, operators: 4, supervisors: 1, capacityPercent: 100, breaks: ['10:00-10:15', '12:30-13:00'], status: 'COMPLETED' },
    { code: 'SHIFT-B', name: 'Afternoon Shift', start: '14:00', end: '22:00', durationHrs: 8, operators: 3, supervisors: 1, capacityPercent: 95, breaks: ['18:00-18:15', '20:30-21:00'], status: 'IN_PROGRESS' },
    { code: 'SHIFT-C', name: 'Night Shift', start: '22:00', end: '06:00', durationHrs: 8, operators: 2, supervisors: 1, capacityPercent: 75, breaks: ['02:00-02:15', '04:30-05:00'], status: 'PLANNED' },
    { code: 'WEEKEND', name: 'Weekend Shift', start: '06:00', end: '14:00', durationHrs: 8, operators: 2, supervisors: 1, capacityPercent: 60, breaks: ['10:00-10:15'], status: 'PLANNED' },
    { code: 'FESTIVAL', name: 'Festival Shift (Diwali)', start: '06:00', end: '22:00', durationHrs: 16, operators: 6, supervisors: 2, capacityPercent: 150, breaks: ['10:00-10:30', '14:00-15:00', '18:00-18:30'], status: 'PLANNED' },
    { code: 'OVERTIME', name: 'Overtime Shift', start: '22:00', end: '02:00', durationHrs: 4, operators: 2, supervisors: 1, capacityPercent: 50, breaks: [], status: 'PLANNED' },
  ]
  const operatorAvailability = [
    { operator: 'OP-001', name: 'Rajesh Kumar', shift: 'SHIFT-A', skills: ['MIXING', 'COOKING', 'PACKING'], assigned: true, hoursToday: 8, overtimeHrs: 0, certValid: true },
    { operator: 'OP-002', name: 'Anil Reddy', shift: 'SHIFT-A', skills: ['GRINDING', 'MIXING'], assigned: true, hoursToday: 8, overtimeHrs: 0, certValid: true },
    { operator: 'OP-003', name: 'Suresh Mehta', shift: 'SHIFT-B', skills: ['FRYING', 'PACKING'], assigned: true, hoursToday: 6, overtimeHrs: 0, certValid: true },
    { operator: 'OP-004', name: 'Vijay Patel', shift: 'SHIFT-B', skills: ['PACKING'], assigned: true, hoursToday: 5, overtimeHrs: 0, certValid: true },
    { operator: 'OP-005', name: 'Lakshmi V.', shift: 'SHIFT-A', skills: ['SUPERVISION', 'ALL'], assigned: true, hoursToday: 8, overtimeHrs: 0, certValid: true },
    { operator: 'OP-006', name: 'Mahesh K.', shift: 'SHIFT-B', skills: ['MAINTENANCE'], assigned: false, hoursToday: 4, overtimeHrs: 2, certValid: false, certExpiry: '2026-08-01' },
  ]
  const statusColors: Record<string, string> = { COMPLETED: 'bg-emerald-100 text-emerald-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', PLANNED: 'bg-amber-100 text-amber-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-emerald-600" />Shift Planner</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Epic 3 · 6 shift types · Operator availability · Capacity planning</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Shifts', value: 6, color: 'text-blue-600' },
          { label: 'Total Operators', value: 6, color: 'text-emerald-600' },
          { label: 'Active Operators', value: 5, color: 'text-emerald-600' },
          { label: 'Avg Capacity', value: '90%', color: 'text-emerald-600' },
          { label: 'Cert Expiring', value: 1, color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Shift Schedule</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Shift Code</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium text-center">Hours</th>
                <th className="px-3 py-2 font-medium text-center">Operators</th>
                <th className="px-3 py-2 font-medium text-center">Supervisors</th>
                <th className="px-3 py-2 font-medium text-center">Capacity</th>
                <th className="px-3 py-2 font-medium">Breaks</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(s => (
                <tr key={s.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{s.code}</td>
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 text-[11px]">{s.start} - {s.end}</td>
                  <td className="px-3 py-2 text-center font-medium">{s.durationHrs}h</td>
                  <td className="px-3 py-2 text-center font-bold text-emerald-600">{s.operators}</td>
                  <td className="px-3 py-2 text-center">{s.supervisors}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`font-bold ${s.capacityPercent >= 100 ? 'text-emerald-600' : s.capacityPercent >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>{s.capacityPercent}%</span>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground">{s.breaks.length > 0 ? s.breaks.join(', ') : 'No breaks'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[s.status]}`}>{s.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Operator Availability</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Operator</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Shift</th>
                <th className="px-3 py-2 font-medium">Skills</th>
                <th className="px-3 py-2 font-medium text-center">Assigned</th>
                <th className="px-3 py-2 font-medium text-center">Hours Today</th>
                <th className="px-3 py-2 font-medium text-center">Overtime</th>
                <th className="px-3 py-2 font-medium">Certification</th>
              </tr>
            </thead>
            <tbody>
              {operatorAvailability.map(o => (
                <tr key={o.operator} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{o.operator}</td>
                  <td className="px-3 py-2 font-medium">{o.name}</td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{o.shift}</span></td>
                  <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{o.skills.map(s => <span key={s} className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-700">{s}</span>)}</div></td>
                  <td className="px-3 py-2 text-center">{o.assigned ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-rose-600 mx-auto" />}</td>
                  <td className="px-3 py-2 text-center font-medium">{o.hoursToday}h</td>
                  <td className={`px-3 py-2 text-center font-medium ${o.overtimeHrs > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{o.overtimeHrs}h</td>
                  <td className="px-3 py-2">{o.certValid ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">✓ Valid</span> : <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">⚠ Exp {(o as any).certExpiry}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Campaign Planner ───────────────────────────────────────────────────
function CampaignPlannerModule() {
  const campaigns = [
    { code: 'CMP-2026-00003', name: 'Kaju Katli Family Campaign', type: 'PRODUCT_FAMILY', family: 'KATLI', products: 4, skus: ['KK-500', 'KKK-500', 'PKK-500', 'DFM-500'], schedule: 'SCH-2026-00012', line: 'LINE-KK-01', start: '2026-07-09', end: '2026-07-11', durationMin: 2880, setupMin: 80, cleaningMin: 30, savedSetupMin: 120, savedCost: 2400, sequence: ['Plain Kaju Katli', 'Kesar Kaju Katli', 'Pista Kaju Katli', 'Dry Fruit Mix Sweet'], rationale: 'Same family - minimal changeover, allergen-safe sequence', status: 'EXECUTING' },
    { code: 'CMP-2026-00002', name: 'Milk Sweets Campaign', type: 'PRODUCT_FAMILY', family: 'MILK_SWEET', products: 3, skus: ['GUL-1KG', 'RAS-1KG', 'GJB-1KG'], schedule: 'SCH-2026-00008', line: 'LINE-GUL-01', start: '2026-07-12', end: '2026-07-13', durationMin: 1440, setupMin: 60, cleaningMin: 30, savedSetupMin: 90, savedCost: 1800, sequence: ['Gulab Jamun 1kg', 'Rasgulla 1kg', 'Gulab Jamun Box'], rationale: 'Same family - shared syrup process, reduced cleaning', status: 'PLANNED' },
    { code: 'CMP-2026-00001', name: 'Namkeen Campaign', type: 'PRODUCT_FAMILY', family: 'NAMKEEN', products: 5, skus: ['NM-500', 'BNM-500', 'CNM-500', 'PNM-500', 'MNM-500'], schedule: 'SCH-2026-00010', line: 'LINE-NM-01', start: '2026-07-05', end: '2026-07-07', durationMin: 2880, setupMin: 90, cleaningMin: 60, savedSetupMin: 150, savedCost: 3000, sequence: ['Plain Namkeen', 'Bhujia Namkeen', 'Corn Namkeen', 'Potato Namkeen', 'Mixed Namkeen'], rationale: 'Same family - shared fryer, sequential flavor build-up', status: 'COMPLETED' },
  ]
  const statusColors: Record<string, string> = { PLANNED: 'bg-amber-100 text-amber-700', EXECUTING: 'bg-emerald-100 text-emerald-700', COMPLETED: 'bg-emerald-200 text-emerald-800', CANCELLED: 'bg-rose-100 text-rose-700' }
  const familyColors: Record<string, string> = { KATLI: 'bg-amber-100 text-amber-700', MILK_SWEET: 'bg-blue-100 text-blue-700', NAMKEEN: 'bg-orange-100 text-orange-700', CHOCOLATE: 'bg-purple-100 text-purple-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Boxes className="h-6 w-6 text-purple-600" />Campaign Planner</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Epic 6 · Group similar products · Minimize cleaning · Reduce allergen risk</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Campaign</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Campaigns', value: 3, color: 'text-purple-600' },
          { label: 'Active', value: 1, color: 'text-emerald-600' },
          { label: 'Planned', value: 1, color: 'text-amber-600' },
          { label: 'Total Saved Setup', value: '360 min', color: 'text-emerald-600' },
          { label: 'Total Saved Cost', value: fmtINR(7200), color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <Boxes className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Chief Architect Recommendation — Campaign by Product Family</p>
            <p className="text-xs text-muted-foreground mt-1">Example sequence: Plain Kaju Katli → Kesar Kaju Katli → Pista Kaju Katli → Dry Fruit Mix Sweet → Milk Sweets → Chocolate Sweets. Benefits: Fewer cleanings, reduced contamination risk, lower water/detergent/labor, increased utilization, higher capacity, better food safety.</p>
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        {campaigns.map(c => (
          <Card key={c.code} className="p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-blue-700">{c.code}</span>
                <span className="text-sm font-semibold">{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${familyColors[c.family]}`}>{c.family.replace(/_/g, ' ')}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[c.status]}`}>{c.status}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600 font-bold">Saved {c.savedSetupMin} min · {fmtINR(c.savedCost)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
              <div><p className="text-muted-foreground">Products</p><p className="font-bold">{c.products}</p></div>
              <div><p className="text-muted-foreground">Line</p><p className="font-medium">{c.line}</p></div>
              <div><p className="text-muted-foreground">Schedule</p><p className="font-mono text-blue-700">{c.schedule}</p></div>
              <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{c.start} → {c.end}</p></div>
              <div><p className="text-muted-foreground">Setup Time</p><p className="font-medium text-purple-600">{c.setupMin} min</p></div>
              <div><p className="text-muted-foreground">Cleaning Time</p><p className="font-medium text-cyan-600">{c.cleaningMin} min</p></div>
              <div><p className="text-muted-foreground">Total Duration</p><p className="font-medium">{c.durationMin} min</p></div>
              <div><p className="text-muted-foreground">Saved</p><p className="font-bold text-emerald-600">{c.savedSetupMin} min ({fmtINR(c.savedCost)})</p></div>
            </div>
            <div className="bg-muted/30 rounded p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">PRODUCTION SEQUENCE</p>
              <div className="flex items-center gap-2 overflow-x-auto">
                {c.sequence.map((prod, i, arr) => (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <div className="px-3 py-1.5 bg-white border rounded text-xs font-medium">{i + 1}. {prod}</div>
                    {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-purple-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2"><strong>Rationale:</strong> {c.rationale}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Constraint Center ──────────────────────────────────────────────────
function ConstraintCenterModule() {
  const constraints = [
    { code: 'CON-00048', schedule: 'SCH-2026-00010', type: 'MATERIAL_AVAILABILITY', desc: 'Cashew W320 short by 5 KG for Namkeen campaign', resource: 'MATERIAL', resourceCode: 'CAS-W320', resourceName: 'Cashew W320', status: 'VALIDATED', severity: 'WARNING', action: 'Reserved from incoming PO-2026-00150, arrives 2026-07-10' },
    { code: 'CON-00047', schedule: 'SCH-2026-00012', type: 'MACHINE_CAPACITY', desc: 'FRY-01 unavailable due to fault', resource: 'MACHINE', resourceCode: 'FRY-01', resourceName: 'Continuous Fryer 01', status: 'VIOLATED', severity: 'BLOCKER', action: 'Maintenance scheduled, schedule revised to skip FRY-01 ops' },
    { code: 'CON-00046', schedule: 'SCH-2026-00012', type: 'OPERATOR_SKILLS', desc: 'Operator OP-006 certification expired for PACK-03', resource: 'OPERATOR', resourceCode: 'OP-006', resourceName: 'Mahesh K.', status: 'RESOLVED', severity: 'ERROR', action: 'Reassigned to OP-004 (Vijay Patel)' },
    { code: 'CON-00045', schedule: 'SCH-2026-00011', type: 'MAINTENANCE_WINDOW', desc: 'GRIND-01 maintenance scheduled 2026-07-10 14:00-16:00', resource: 'MACHINE', resourceCode: 'GRIND-01', resourceName: 'Wet Grinder 01', status: 'VALIDATED', severity: 'INFO', action: 'Schedule avoids maintenance window automatically' },
    { code: 'CON-00044', schedule: 'SCH-2026-00010', type: 'SHELF_LIFE', desc: 'Shwet Idli Batter expires 2026-07-16 - must produce by 2026-07-14', resource: 'MATERIAL', resourceCode: 'IB-1KG', resourceName: 'Shwet Idli Batter 1kg', status: 'RESOLVED', severity: 'WARNING', action: 'Production scheduled 2026-07-12' },
  ]
  const statusColors: Record<string, string> = { DETECTED: 'bg-slate-100 text-slate-700', VALIDATED: 'bg-blue-100 text-blue-700', RESOLVED: 'bg-emerald-100 text-emerald-700', VIOLATED: 'bg-rose-100 text-rose-700', BYPASSED: 'bg-amber-100 text-amber-700' }
  const severityColors: Record<string, string> = { INFO: 'bg-blue-100 text-blue-700', WARNING: 'bg-amber-100 text-amber-700', ERROR: 'bg-orange-100 text-orange-700', BLOCKER: 'bg-rose-100 text-rose-700' }
  const typeIcons: Record<string, string> = { MATERIAL_AVAILABILITY: '📦', MACHINE_CAPACITY: '🏭', OPERATOR_SKILLS: '👤', CLEANING_TIME: '🧽', MAINTENANCE_WINDOW: '🔧', SHELF_LIFE: '📅', BATCH_SIZE: '⚖️', UTILITY_CAPACITY: '⚡' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-rose-600" />Constraint Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Epic 4 · 8 constraint types · Auto violation avoidance · Scheduler never creates impossible schedule</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Constraints', value: 22, color: 'text-blue-600' },
          { label: 'Resolved', value: 18, color: 'text-emerald-600' },
          { label: 'Validated', value: 4, color: 'text-blue-600' },
          { label: 'Violated', value: 1, color: 'text-rose-600' },
          { label: 'Blockers', value: 1, color: 'text-rose-700' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">8 Constraint Types Supported</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { type: 'MATERIAL_AVAILABILITY', desc: 'Raw materials + packaging available' },
            { type: 'MACHINE_CAPACITY', desc: 'Machine not overloaded/blocked' },
            { type: 'OPERATOR_SKILLS', desc: 'Certified operator available' },
            { type: 'CLEANING_TIME', desc: 'Cleaning window accounted for' },
            { type: 'MAINTENANCE_WINDOW', desc: 'Avoid scheduled maintenance' },
            { type: 'SHELF_LIFE', desc: 'Produce before expiry' },
            { type: 'BATCH_SIZE', desc: 'Minimum/maximum batch sizes' },
            { type: 'UTILITY_CAPACITY', desc: 'Gas/steam/power available' },
          ].map(c => (
            <div key={c.type} className="p-2 rounded border bg-muted/20 flex items-center gap-2">
              <span className="text-base">{typeIcons[c.type]}</span>
              <div><p className="text-[11px] font-medium">{c.type.replace(/_/g, ' ')}</p><p className="text-[10px] text-muted-foreground">{c.desc}</p></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Active Constraints</h3></div>
        <div className="space-y-2 p-3">
          {constraints.map(c => (
            <div key={c.code} className={`p-3 rounded-lg border-l-4 ${c.severity === 'BLOCKER' ? 'border-rose-500 bg-rose-50/30' : c.severity === 'ERROR' ? 'border-orange-500 bg-orange-50/30' : c.severity === 'WARNING' ? 'border-amber-400 bg-amber-50/30' : 'border-blue-400 bg-blue-50/30'}`}>
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-blue-700">{c.code}</span>
                  <span className="text-base">{typeIcons[c.type]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{c.type.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${severityColors[c.severity]}`}>{c.severity}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[c.status]}`}>{c.status}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{c.schedule}</span>
              </div>
              <p className="text-xs font-medium">{c.desc}</p>
              <p className="text-[11px] text-muted-foreground mt-1"><strong>Resource:</strong> {c.resourceCode} ({c.resourceName})</p>
              <p className="text-[11px] text-emerald-700 mt-1"><strong>Action:</strong> {c.action}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Simulation Console ─────────────────────────────────────────────────
function SimulationConsoleModule() {
  const simulations = [
    { code: 'SIM-2026-00006', source: 'SCH-2026-00012', scenario: 'MACHINE_FAILURE', desc: 'FRY-01 fails for 4 hours', impact: -12, delayMin: 90, costImpact: 1800, affectedOps: 3, affectedMachines: 2, revised: true, revisedUtil: 84.5, duration: 2840, time: '2h ago' },
    { code: 'SIM-2026-00005', source: 'SCH-2026-00010', scenario: 'RUSH_ORDER', desc: 'Emergency order: 200 KG Mixed Namkeen', impact: 8, delayMin: 0, costImpact: -600, affectedOps: 2, affectedMachines: 1, revised: true, revisedUtil: 96.0, duration: 1980, time: '5h ago' },
    { code: 'SIM-2026-00004', source: 'SCH-2026-00011', scenario: 'MATERIAL_DELAY', desc: 'Urad Dal delivery delayed 2 hours', impact: -5, delayMin: 45, costImpact: 600, affectedOps: 1, affectedMachines: 1, revised: true, revisedUtil: 82.0, duration: 1240, time: '1d ago' },
    { code: 'SIM-2026-00003', source: 'SCH-2026-00009', scenario: 'OPERATOR_ABSENCE', desc: 'OP-003 calls in sick', impact: -8, delayMin: 60, costImpact: 800, affectedOps: 2, affectedMachines: 1, revised: true, revisedUtil: 76.0, duration: 1480, time: '2d ago' },
    { code: 'SIM-2026-00002', source: 'SCH-2026-00008', scenario: 'DEMAND_INCREASE', desc: 'Demand +20% for Gulab Jamun festival', impact: 15, delayMin: 0, costImpact: -1200, affectedOps: 3, affectedMachines: 2, revised: true, revisedUtil: 92.0, duration: 2120, time: '3d ago' },
    { code: 'SIM-2026-00001', source: 'SCH-2026-00012', scenario: 'POWER_SHUTDOWN', desc: '2-hour power shutdown at 14:00', impact: -10, delayMin: 120, costImpact: 2400, affectedOps: 4, affectedMachines: 3, revised: true, revisedUtil: 81.0, duration: 2680, time: '4d ago' },
  ]
  const scenarioColors: Record<string, string> = { MACHINE_FAILURE: 'bg-rose-100 text-rose-700', RUSH_ORDER: 'bg-emerald-100 text-emerald-700', MATERIAL_DELAY: 'bg-amber-100 text-amber-700', OPERATOR_ABSENCE: 'bg-orange-100 text-orange-700', DEMAND_INCREASE: 'bg-blue-100 text-blue-700', POWER_SHUTDOWN: 'bg-purple-100 text-purple-700' }
  const scenarioIcons: Record<string, string> = { MACHINE_FAILURE: '🏭', RUSH_ORDER: '📦', MATERIAL_DELAY: '🚚', OPERATOR_ABSENCE: '👤', DEMAND_INCREASE: '📈', POWER_SHUTDOWN: '⚡' }
  const fmtINR = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><PlayCircle className="h-6 w-6 text-purple-600" />Simulation Console</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Epic 8 · 6 scenarios · Revised schedule generation · &lt;15s target</p>
        </div>
        <Button size="sm"><PlayCircle className="mr-1 h-4 w-4" />Run Simulation</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Simulations', value: 6, color: 'text-purple-600' },
          { label: 'Revised Schedules', value: 6, color: 'text-emerald-600' },
          { label: 'Avg Duration', value: '2.07s', color: 'text-emerald-600' },
          { label: 'Total Delay', value: '315 min', color: 'text-rose-600' },
          { label: 'Total Cost Impact', value: fmtINR(3800), color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">6 Simulation Scenarios</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { type: 'MACHINE_FAILURE', desc: 'Simulate machine breakdown', icon: '🏭' },
            { type: 'RUSH_ORDER', desc: 'Emergency order insertion', icon: '📦' },
            { type: 'MATERIAL_DELAY', desc: 'Material delivery late', icon: '🚚' },
            { type: 'OPERATOR_ABSENCE', desc: 'Operator unavailable', icon: '👤' },
            { type: 'DEMAND_INCREASE', desc: 'Demand surge scenario', icon: '📈' },
            { type: 'POWER_SHUTDOWN', desc: 'Utility failure', icon: '⚡' },
          ].map(s => (
            <div key={s.type} className="p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2 mb-1"><span className="text-xl">{s.icon}</span><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${scenarioColors[s.type]}`}>{s.type.replace(/_/g, ' ')}</span></div>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Simulations</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Source Schedule</th>
                <th className="px-3 py-2 font-medium">Scenario</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium text-center">Capacity Impact</th>
                <th className="px-3 py-2 font-medium text-center">Delay (min)</th>
                <th className="px-3 py-2 font-medium text-right">Cost Impact</th>
                <th className="px-3 py-2 font-medium text-center">Affected Ops</th>
                <th className="px-3 py-2 font-medium text-center">Revised Util</th>
                <th className="px-3 py-2 font-medium text-center">Duration</th>
                <th className="px-3 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map(s => (
                <tr key={s.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{s.code}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{s.source}</td>
                  <td className="px-3 py-2"><span className="text-base mr-1">{scenarioIcons[s.scenario]}</span><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${scenarioColors[s.scenario]}`}>{s.scenario.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground max-w-[200px] truncate" title={s.desc}>{s.desc}</td>
                  <td className={`px-3 py-2 text-center font-bold ${s.impact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.impact > 0 ? '+' : ''}{s.impact}%</td>
                  <td className={`px-3 py-2 text-center font-medium ${s.delayMin > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{s.delayMin > 0 ? s.delayMin : '—'}</td>
                  <td className={`px-3 py-2 text-right font-bold ${s.costImpact > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{s.costImpact > 0 ? '+' : '-'}{fmtINR(s.costImpact)}</td>
                  <td className="px-3 py-2 text-center">{s.affectedOps}</td>
                  <td className={`px-3 py-2 text-center font-medium ${s.revisedUtil >= 85 ? 'text-emerald-600' : s.revisedUtil >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>{s.revisedUtil}%</td>
                  <td className="px-3 py-2 text-center text-[11px]">{(s.duration / 1000).toFixed(2)}s</td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Production Calendar ────────────────────────────────────────────────
function ProductionCalendarModule() {
  // Simple calendar view: 7 days, 5 lines
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const lines = [
    { line: 'LINE-KK-01', name: 'Kaju Katli Line', schedule: { Mon: { product: 'Kaju Katli 500g', qty: 95, util: 92 }, Tue: { product: 'Kesar Kaju Katli', qty: 90, util: 88 }, Wed: { product: 'Pista Kaju Katli', qty: 85, util: 85 }, Thu: { product: 'Dry Fruit Mix', qty: 80, util: 80 }, Fri: { product: 'Cleaning', qty: 0, util: 0 }, Sat: null, Sun: null } },
    { line: 'LINE-IB-01', name: 'Idli Batter Line', schedule: { Mon: { product: 'Shwet Idli Batter', qty: 100, util: 85 }, Tue: { product: 'Shwet Idli Batter', qty: 100, util: 85 }, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null } },
    { line: 'LINE-NM-01', name: 'Namkeen Line', schedule: { Mon: { product: 'Mixed Namkeen', qty: 250, util: 90 }, Tue: { product: 'Bhujia Namkeen', qty: 200, util: 85 }, Wed: { product: 'Corn Namkeen', qty: 180, util: 80 }, Thu: { product: 'FRY-01 Fault', qty: 0, util: 25 }, Fri: { product: 'Maintenance', qty: 0, util: 0 }, Sat: null, Sun: null } },
    { line: 'LINE-ML-01', name: 'Motichoor Line', schedule: { Mon: { product: 'Motichoor Laddu', qty: 98, util: 82 }, Tue: { product: 'Motichoor Laddu', qty: 98, util: 82 }, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null } },
    { line: 'LINE-GUL-01', name: 'Gulab Jamun Line', schedule: { Mon: null, Tue: null, Wed: { product: 'Gulab Jamun', qty: 67, util: 80 }, Thu: { product: 'Rasgulla', qty: 50, util: 75 }, Fri: null, Sat: null, Sun: null } },
  ]
  const cellColor = (util: number) => util === 0 ? 'bg-slate-100' : util >= 85 ? 'bg-emerald-100' : util >= 70 ? 'bg-amber-100' : 'bg-rose-100'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-cyan-600" />Production Calendar</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Weekly calendar view · All production lines · Color-coded utilization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">Week of Jul 9-15, 2026</span>
          <Button size="sm" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-200 px-3 py-2 bg-muted/50 text-left font-medium sticky left-0">Production Line</th>
                {days.map(d => <th key={d} className="border border-slate-200 px-3 py-2 bg-muted/50 text-center font-medium min-w-[140px]">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.line}>
                  <td className="border border-slate-200 px-3 py-2 sticky left-0 bg-white">
                    <p className="font-mono text-[10px] text-blue-700">{l.line}</p>
                    <p className="text-[11px] font-medium">{l.name}</p>
                  </td>
                  {days.map(d => {
                    const cell = (l.schedule as any)[d]
                    return (
                      <td key={d} className={`border border-slate-200 px-2 py-2 text-center ${cell ? cellColor(cell.util) : 'bg-slate-50'}`}>
                        {cell ? (
                          <div>
                            <p className="text-[10px] font-medium truncate" title={cell.product}>{cell.product}</p>
                            {cell.qty > 0 && <p className="text-[10px] text-muted-foreground">{cell.qty} KG</p>}
                            <p className={`text-[10px] font-bold ${cell.util >= 85 ? 'text-emerald-700' : cell.util >= 70 ? 'text-amber-700' : cell.util > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{cell.util}%</p>
                          </div>
                        ) : <span className="text-[10px] text-slate-400">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Calendar Legend</h3>
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <span className="flex items-center gap-1"><div className="w-4 h-4 bg-emerald-100 rounded" /> High Utilization (≥85%)</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 bg-amber-100 rounded" /> Medium Utilization (70-84%)</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 bg-rose-100 rounded" /> Low Utilization (&lt;70%)</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 bg-slate-100 rounded" /> No Production</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 bg-slate-50 rounded border" /> Idle / Off</span>
        </div>
      </Card>
    </div>
  )
}

// ─── Capacity Heat Map ──────────────────────────────────────────────────
function CapacityHeatMapModule() {
  // Heat map: 5 machines × 8 hours (06:00 - 14:00)
  const machines = ['MIX-01', 'COOK-01', 'COOL-01', 'PACK-03', 'FRY-01']
  const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00']
  // utilization matrix [machine][hour] 0-100
  const heatData: Record<string, number[]> = {
    'MIX-01': [100, 100, 100, 100, 100, 75, 100, 100],
    'COOK-01': [85, 100, 100, 100, 0, 100, 100, 100],
    'COOL-01': [0, 100, 100, 100, 50, 0, 0, 100],
    'PACK-03': [0, 0, 0, 0, 65, 100, 100, 100],
    'FRY-01': [0, 0, 0, 0, 0, 0, 0, 0],
  }
  const heatColor = (v: number) => {
    if (v === 0) return 'bg-slate-200'
    if (v >= 90) return 'bg-emerald-500'
    if (v >= 70) return 'bg-emerald-400'
    if (v >= 50) return 'bg-amber-400'
    if (v >= 25) return 'bg-amber-500'
    return 'bg-rose-500'
  }
  const machineNames: Record<string, string> = { 'MIX-01': 'Industrial Mixer 01', 'COOK-01': 'Cooking Kettle 01', 'COOL-01': 'Cooling Tunnel 01', 'PACK-03': 'Packaging Machine 03', 'FRY-01': 'Continuous Fryer 01' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Grid3x3 className="h-6 w-6 text-orange-600" />Capacity Heat Map</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 46 · Machine utilization by hour · Identify bottlenecks · Optimize scheduling</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Utilization', value: '69.7%', color: 'text-amber-600' },
          { label: 'Peak Hour', value: '08:00 (97%)', color: 'text-emerald-600' },
          { label: 'Low Hour', value: '06:00 (37%)', color: 'text-rose-600' },
          { label: 'Bottleneck', value: 'MIX-01', color: 'text-rose-600' },
          { label: 'Idle Machine', value: 'FRY-01', color: 'text-rose-700' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Machine Utilization Heat Map (06:00 - 14:00)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-200 px-3 py-2 bg-muted/50 text-left font-medium sticky left-0">Machine</th>
                {hours.map(h => <th key={h} className="border border-slate-200 px-3 py-2 bg-muted/50 text-center font-medium min-w-[80px]">{h}</th>)}
                <th className="border border-slate-200 px-3 py-2 bg-muted/50 text-center font-medium">Avg</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => {
                const data = heatData[m]
                const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length)
                return (
                  <tr key={m}>
                    <td className="border border-slate-200 px-3 py-2 sticky left-0 bg-white">
                      <p className="font-mono text-[10px] text-blue-700">{m}</p>
                      <p className="text-[10px] text-muted-foreground">{machineNames[m]}</p>
                    </td>
                    {data.map((v, i) => (
                      <td key={i} className={`border border-slate-200 px-2 py-3 text-center ${heatColor(v)}`}>
                        <span className={`text-xs font-bold ${v === 0 ? 'text-slate-400' : 'text-white'}`}>{v === 0 ? '—' : `${v}%`}</span>
                      </td>
                    ))}
                    <td className="border border-slate-200 px-3 py-2 text-center">
                      <span className={`font-bold ${avg >= 70 ? 'text-emerald-600' : avg >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{avg}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Heat Map Legend & Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Utilization Scale</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-rose-500 rounded" /><span>0-25% (Critical)</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-4 h-4 bg-amber-500 rounded" /><span>25-50% (Low)</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-4 h-4 bg-amber-400 rounded" /><span>50-70% (Medium)</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-4 h-4 bg-emerald-400 rounded" /><span>70-90% (Good)</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-4 h-4 bg-emerald-500 rounded" /><span>90-100% (Optimal)</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-4 h-4 bg-slate-200 rounded" /><span>0% (Idle/Off)</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Key Insights</p>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded border-l-4 border-rose-500 bg-rose-50/30">
                <p className="font-medium text-rose-700">FRY-01 - Idle all day</p>
                <p className="text-[10px] text-muted-foreground">Fault since 14:25 yesterday. Maintenance in progress. 0% utilization.</p>
              </div>
              <div className="p-2 rounded border-l-4 border-amber-400 bg-amber-50/30">
                <p className="font-medium text-amber-700">MIX-01 - Bottleneck at 11:00 (75%)</p>
                <p className="text-[10px] text-muted-foreground">Full clean for allergen changeover reduces capacity. Consider campaign scheduling.</p>
              </div>
              <div className="p-2 rounded border-l-4 border-emerald-500 bg-emerald-50/30">
                <p className="font-medium text-emerald-700">COOK-01 - Optimal (92.5% avg)</p>
                <p className="text-[10px] text-muted-foreground">Well-utilized, no bottlenecks. Maintain current schedule.</p>
              </div>
              <div className="p-2 rounded border-l-4 border-amber-400 bg-amber-50/30">
                <p className="font-medium text-amber-700">PACK-03 - Idle morning (06:00-09:00)</p>
                <p className="text-[10px] text-muted-foreground">No packaging scheduled until 10:00. Consider parallel packaging of earlier batches.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
