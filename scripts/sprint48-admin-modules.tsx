// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 48 — AI MANUFACTURING INTELLIGENCE, AUTONOMOUS OPTIMIZATION & SMART FACTORY PLATFORM
// Admin modules: AI Smart Factory Dashboard, AI Recommendations, AI Predictive Maintenance,
// AI Predictive Quality, AI Recipe Optimization, AI Energy Optimization, AI Root Cause Explorer,
// AI Continuous Improvement Engine
// ═══════════════════════════════════════════════════════════════════════════════
// All required lucide-react icons (Brain, Lightbulb, Sparkles, TrendingUp, TrendingDown,
// AlertTriangle, AlertCircle, CheckCircle2, Activity, Gauge, Target, Zap, Server, Settings,
// Wrench, ShieldCheck, ArrowRight, Plus, Download, FileText, Calendar, Clock, Percent,
// IndianRupee, Package, Recycle, FlaskConical) are already imported in src/app/page.tsx.

// ─── AI Smart Factory Dashboard ─────────────────────────────────────────
function AISmartFactoryDashboardModule() {
  const kpis = {
    totalRecommendations: 47,
    pending: 12,
    approved: 18,
    implemented: 15,
    avgConfidence: 88.3,
    totalImpact: 38400,
    activeModels: 7,
    predictions: 12480,
  }
  const widgets = [
    { label: 'Total Recommendations', value: `${kpis.totalRecommendations}`, unit: 'AI-generated', icon: Lightbulb, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Pending Review', value: `${kpis.pending}`, unit: 'awaiting approval', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Approved', value: `${kpis.approved}`, unit: 'ready to implement', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Implemented', value: `${kpis.implemented}`, unit: 'in production', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Avg Confidence', value: `${kpis.avgConfidence}%`, unit: 'across all models', icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Total Impact', value: `₹${kpis.totalImpact.toLocaleString('en-IN')}`, unit: 'potential savings', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Active AI Models', value: `${kpis.activeModels}`, unit: 'in production', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Predictions Today', value: `${kpis.predictions.toLocaleString('en-IN')}`, unit: 'inferences run', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  ]
  const models = [
    { name: 'Production Optimizer', version: 'v3.2.1', accuracy: 87.5, predictions: 3120, status: 'ACTIVE', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { name: 'Predictive Maintenance', version: 'v4.1.0', accuracy: 92.0, predictions: 2480, status: 'ACTIVE', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { name: 'Predictive Quality', version: 'v2.8.3', accuracy: 89.5, predictions: 2960, status: 'ACTIVE', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { name: 'Recipe Optimizer', version: 'v1.9.2', accuracy: 84.0, predictions: 1120, status: 'ACTIVE', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { name: 'Energy Optimizer', version: 'v2.4.1', accuracy: 95.0, predictions: 980, status: 'ACTIVE', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    { name: 'Root Cause Analyzer', version: 'v1.5.4', accuracy: 86.0, predictions: 540, status: 'ACTIVE', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { name: 'Scheduling Optimizer', version: 'v2.1.0', accuracy: 82.5, predictions: 1280, status: 'ACTIVE', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  ]
  const phases = [
    { phase: 'Phase 1', title: 'AI Advisor', status: 'ACTIVE', color: 'border-emerald-400 bg-emerald-50', badge: 'bg-emerald-500', desc: 'AI generates recommendations; humans review, approve and execute. 47 recommendations in pipeline.', metrics: ['47 recommendations', '88.3% avg confidence', '15 implemented'] },
    { phase: 'Phase 2', title: 'AI Co-Pilot', status: 'PLANNED', color: 'border-blue-400 bg-blue-50', badge: 'bg-blue-500', desc: 'AI executes approved actions autonomously within guardrails; humans supervise and intervene on exceptions.', metrics: ['Autonomous execution', 'Guardrail policy engine', 'Exception escalation'] },
    { phase: 'Phase 3', title: 'Smart Factory', status: 'FUTURE', color: 'border-purple-400 bg-purple-50', badge: 'bg-purple-500', desc: 'Self-optimizing factory. AI continuously learns, predicts, and adapts production in real-time.', metrics: ['Closed-loop optimization', 'Real-time adaptation', 'Continuous learning'] },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" />AI Smart Factory Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · Autonomous optimization platform · 7 AI models · 12,480 daily predictions · Chief Architect 3-phase maturity roadmap</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Activity className="mr-1 h-4 w-4" />Live Models</Button>
          <Button size="sm"><Sparkles className="mr-1 h-4 w-4" />Generate Insights</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {widgets.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <w.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />Chief Architect Recommendation — 3-Phase Smart Factory Maturity Roadmap</p>
            <p className="text-xs text-muted-foreground mt-1">Evolve from <span className="font-semibold text-emerald-700">AI Advisor</span> (human-in-loop) → <span className="font-semibold text-blue-700">AI Co-Pilot</span> (human-on-loop) → <span className="font-semibold text-purple-700">Smart Factory</span> (closed-loop autonomy). Each phase unlocks 3-5x productivity gains while preserving audit, safety and human override.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              {phases.map(p => (
                <div key={p.phase} className={`rounded-lg border-2 p-3 ${p.color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{p.phase}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded text-white font-bold ${p.badge}`}>{p.status}</span>
                  </div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{p.desc}</p>
                  <div className="mt-2 space-y-0.5">
                    {p.metrics.map(m => (
                      <p key={m} className="text-[10px] flex items-center gap-1"><ArrowRight className="h-2.5 w-2.5" />{m}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Server className="h-4 w-4 text-purple-600" />Active AI Models — 7 in Production</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {models.map(m => (
            <Card key={m.name} className={`p-3 ${m.bg}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.version} · {m.predictions.toLocaleString('en-IN')} predictions</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">{m.status}</Badge>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">Model Accuracy</span>
                  <span className={`font-bold ${m.color}`}>{m.accuracy}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border">
                  <div className={`h-full ${m.bg.replace('bg-', 'bg-').replace('-50', '-400')}`} style={{ width: `${m.accuracy}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI Recommendations Center ──────────────────────────────────────────
function AIRecommendationsModule() {
  const summary = {
    total: 47,
    pending: 12,
    approved: 18,
    implemented: 15,
    avgConfidence: 88.3,
  }
  const recommendations = [
    { code: 'REC-001', model: 'Predictive Maintenance', type: 'PREVENTIVE_ACTION', title: 'Schedule Hydraulic Replacement — FRY-01', desc: 'Hydraulic pressure trending downward; predicted failure within 7 days. Replace pump and seals proactively.', impact: 'Prevent 240 min downtime', quantified: '₹9,600', confidence: 92, priority: 'CRITICAL', status: 'PENDING', requiresApproval: true, scope: 'machine:FRY-01', evidence: ['30-day pressure trend', 'Vibration spectrum analysis', 'Historical MTBF data'] },
    { code: 'REC-002', model: 'Energy Optimizer', type: 'LOAD_SHIFTING', title: 'Shift COOK-01 Batch Cycle to Off-Peak', desc: 'Move 3 batch cycles from 14:00-18:00 to 22:00-06:00 to leverage off-peak tariff.', impact: '20.3% energy cost reduction', quantified: '₹8,400', confidence: 95, priority: 'HIGH', status: 'APPROVED', requiresApproval: true, scope: 'machine:COOK-01', evidence: ['Tariff schedule analysis', 'Load profile 30-day', 'Production flexibility matrix'] },
    { code: 'REC-003', model: 'Predictive Quality', type: 'PROCESS_ADJUSTMENT', title: 'Adjust Frying Temperature for Namkeen Batch', desc: 'Reduce oil temperature by 5°C; current 185°C trending toward burn threshold.', impact: 'Prevent 8% quality rejection', quantified: '₹3,200', confidence: 87, priority: 'CRITICAL', status: 'PENDING', requiresApproval: true, scope: 'product:Namkeen', evidence: ['Color sensor trend', 'Temperature deviation log', 'Historical burn incidents'] },
    { code: 'REC-004', model: 'Recipe Optimizer', type: 'INGREDIENT_SUBSTITUTION', title: 'Reduce Sugar Content in Kaju Katli by 2%', desc: 'Taste tests confirm no perceptible difference; saves material cost per batch.', impact: 'Cost reduction per batch', quantified: '₹380', confidence: 84, priority: 'MEDIUM', status: 'IMPLEMENTED', requiresApproval: true, scope: 'product:Kaju Katli', evidence: ['240 taste tests', 'Sensory panel scores', 'Cost analysis'] },
    { code: 'REC-005', model: 'Production Optimizer', type: 'SCHEDULE_RESEQUENCE', title: 'Re-sequence Line B for Campaign Scheduling', desc: 'Group Motichoor runs to reduce changeover time by 41.7%.', impact: 'Reduce changeover time', quantified: '₹7,200', confidence: 88, priority: 'HIGH', status: 'APPROVED', requiresApproval: true, scope: 'line:B', evidence: ['Changeover SMED analysis', 'Historical batch sequence', 'Cleaning time data'] },
    { code: 'REC-006', model: 'Scheduling Optimizer', type: 'OPERATOR_ASSIGNMENT', title: 'Cross-assign Operator R-04 to Line A', desc: 'Operator R-04 idle on Line C; Line A has 2-hour setup pending. Reduce setup time.', impact: 'Reduce setup time', quantified: '₹600', confidence: 83, priority: 'LOW', status: 'IMPLEMENTED', requiresApproval: false, scope: 'line:A', evidence: ['Operator skill matrix', 'Line workload balance', 'Setup time logs'] },
    { code: 'REC-007', model: 'Root Cause Analyzer', type: 'STANDARD_WORK_UPDATE', title: 'Update 5S Standard Work for Setup Reduction', desc: 'Reorganize tools at Line B workstation per 5S audit findings.', impact: 'Reduce setup time 50%', quantified: '₹1,800', confidence: 91, priority: 'MEDIUM', status: 'IMPLEMENTED', requiresApproval: true, scope: 'line:B', evidence: ['5S audit report', 'Time-motion study', 'Operator feedback'] },
  ]
  const priorityColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    HIGH: 'bg-amber-100 text-amber-700 border-amber-300',
    MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
    LOW: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-300',
    IMPLEMENTED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Lightbulb className="h-6 w-6 text-amber-500" />AI Recommendations Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · 47 AI-generated recommendations across 7 models · Human-in-loop approval workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Bulk Approve</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Recommendations', value: summary.total, icon: Lightbulb, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Pending', value: summary.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Approved', value: summary.approved, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Implemented', value: summary.implemented, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Avg Confidence', value: `${summary.avgConfidence}%`, icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
        ].map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Recommendations Pipeline — 7 Active</h3>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">CRITICAL</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">HIGH</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">MEDIUM</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">LOW</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Model / Type</th>
                <th className="text-left p-2">Recommendation</th>
                <th className="text-left p-2">Impact</th>
                <th className="text-left p-2">Confidence</th>
                <th className="text-left p-2">Priority</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Scope</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map(r => (
                <tr key={r.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top">
                    <p className="font-mono font-semibold">{r.code}</p>
                    {r.requiresApproval && <p className="text-[9px] text-amber-600 mt-0.5">⌬ approval</p>}
                  </td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{r.model}</p>
                    <p className="text-[10px] text-muted-foreground">{r.type}</p>
                  </td>
                  <td className="p-2 align-top max-w-xs">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{r.desc}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.evidence.slice(0, 2).map(e => (
                        <span key={e} className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{e}</span>
                      ))}
                      {r.evidence.length > 2 && <span className="text-[9px] text-muted-foreground">+{r.evidence.length - 2} more</span>}
                    </div>
                  </td>
                  <td className="p-2 align-top">
                    <p className="text-[10px] text-muted-foreground">{r.impact}</p>
                    <p className="font-semibold text-emerald-700">{r.quantified}</p>
                  </td>
                  <td className="p-2 align-top">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${r.confidence >= 90 ? 'bg-emerald-500' : r.confidence >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${r.confidence}%` }} />
                      </div>
                      <span className="font-semibold text-[10px]">{r.confidence}%</span>
                    </div>
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${priorityColor[r.priority]}`}>{r.priority}</Badge></td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${statusColor[r.status]}`}>{r.status}</Badge></td>
                  <td className="p-2 align-top"><code className="text-[10px] bg-muted px-1 py-0.5 rounded">{r.scope}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── AI Predictive Maintenance ──────────────────────────────────────────
function AIPredictiveMaintenanceModule() {
  const summary = {
    predictions: 3,
    critical: 1,
    avgConfidence: 78.5,
    preventedDowntime: 540,
    preventedCost: 16800,
  }
  const predictions = [
    {
      machine: 'FRY-01', failureType: 'Hydraulic Pump Failure', probability: 92,
      failureDate: '2025-02-14', actionDate: '2025-02-10', runtimeHours: 8420,
      avgTemp: 78, avgVibration: 4.8, lastMaintenance: '2024-11-20', machineAge: 5.2,
      action: 'Replace hydraulic pump and seals; flush system; recalibrate pressure sensor',
      estDowntime: 240, estCost: 9600, confidence: 92, status: 'CRITICAL',
    },
    {
      machine: 'COOK-01', failureType: 'Bearing Wear Failure', probability: 45,
      failureDate: '2025-03-08', actionDate: '2025-02-28', runtimeHours: 12680,
      avgTemp: 65, avgVibration: 3.2, lastMaintenance: '2024-12-15', machineAge: 7.8,
      action: 'Schedule preventive bearing replacement during next planned downtime window',
      estDowntime: 180, estCost: 4800, confidence: 78, status: 'WARNING',
    },
    {
      machine: 'MIX-01', failureType: 'Motor Winding Failure', probability: 28,
      failureDate: '2025-04-02', actionDate: '2025-03-15', runtimeHours: 18420,
      avgTemp: 72, avgVibration: 2.6, lastMaintenance: '2025-01-08', machineAge: 9.4,
      action: 'Inspect motor windings; plan rewind or replacement in Q1 maintenance budget',
      estDowntime: 360, estCost: 7200, confidence: 66, status: 'MONITOR',
    },
  ]
  const failureTypes = [
    { type: 'Hydraulic Pump Failure', count: 1, desc: 'Pressure decay, seal degradation', avgProbability: 92 },
    { type: 'Bearing Wear Failure', count: 1, desc: 'Vibration signature, temperature rise', avgProbability: 45 },
    { type: 'Motor Winding Failure', count: 1, desc: 'Insulation breakdown, current imbalance', avgProbability: 28 },
    { type: 'Conveyor Belt Wear', count: 4, desc: 'Visual inspection, thickness gauging', avgProbability: 15 },
    { type: 'Sensor Drift', count: 6, desc: 'Calibration deviation, signal noise', avgProbability: 22 },
    { type: 'Valve Seat Erosion', count: 2, desc: 'Leakage rate, cycle count', avgProbability: 35 },
    { type: 'Gearbox Lubrication', count: 3, desc: 'Oil analysis, particle count', avgProbability: 18 },
  ]
  const statusColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    WARNING: 'bg-amber-100 text-amber-700 border-amber-300',
    MONITOR: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-amber-600" />AI Predictive Maintenance</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · Failure prediction 7-60 days ahead · 540 min downtime prevented · ₹16,800 cost avoided</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Activity className="mr-1 h-4 w-4" />Live Sensors</Button>
          <Button size="sm"><Calendar className="mr-1 h-4 w-4" />Schedule Maintenance</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Predictions', value: summary.predictions, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Critical', value: summary.critical, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Avg Confidence', value: `${summary.avgConfidence}%`, icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Downtime Prevented', value: `${summary.preventedDowntime} min`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Cost Avoided', value: `₹${summary.preventedCost.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
        ].map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-lg font-bold mt-1 ${w.color}`}>{w.value}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" />Active Failure Predictions — 3 Machines at Risk</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {predictions.map(p => (
            <Card key={p.machine} className="overflow-hidden">
              <div className={`p-3 border-b ${p.status === 'CRITICAL' ? 'bg-rose-50 border-rose-200' : p.status === 'WARNING' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{p.machine}</p>
                    <p className="text-[10px] text-muted-foreground">{p.failureType}</p>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${statusColor[p.status]}`}>{p.status}</Badge>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Failure Probability</span>
                    <span className={`font-bold ${p.probability >= 70 ? 'text-rose-600' : p.probability >= 40 ? 'text-amber-600' : 'text-blue-600'}`}>{p.probability}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border">
                    <div className={`h-full ${p.probability >= 70 ? 'bg-rose-500' : p.probability >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${p.probability}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Predicted failure: <span className="font-semibold">{p.failureDate}</span> · Action by: <span className="font-semibold">{p.actionDate}</span></p>
                </div>
              </div>
              <div className="p-3 space-y-2 text-[11px]">
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-[9px] text-muted-foreground">Runtime Hours</p><p className="font-semibold">{p.runtimeHours.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Machine Age</p><p className="font-semibold">{p.machineAge} yrs</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Avg Temp</p><p className="font-semibold">{p.avgTemp}°C</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Avg Vibration</p><p className="font-semibold">{p.avgVibration} mm/s</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Last Maint.</p><p className="font-semibold">{p.lastMaintenance}</p></div>
                  <div><p className="text-[9px] text-muted-foreground">Est. Downtime</p><p className="font-semibold text-rose-600">{p.estDowntime} min</p></div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-[9px] text-muted-foreground">Recommended Action</p>
                  <p className="font-medium">{p.action}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Est. Cost if Failure</p>
                    <p className="font-bold text-rose-600">₹{p.estCost.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Confidence</p>
                    <p className="font-bold text-purple-600">{p.confidence}%</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Failure Type Catalogue — 7 Patterns Tracked</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Failure Type</th>
                <th className="text-left p-2">Description</th>
                <th className="text-center p-2">Active Predictions</th>
                <th className="text-center p-2">Avg Probability</th>
              </tr>
            </thead>
            <tbody>
              {failureTypes.map(f => (
                <tr key={f.type} className="border-t hover:bg-muted/20">
                  <td className="p-2 font-medium">{f.type}</td>
                  <td className="p-2 text-muted-foreground">{f.desc}</td>
                  <td className="p-2 text-center font-semibold">{f.count}</td>
                  <td className="p-2 text-center">
                    <span className={`font-semibold ${f.avgProbability >= 70 ? 'text-rose-600' : f.avgProbability >= 40 ? 'text-amber-600' : 'text-blue-600'}`}>{f.avgProbability}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── AI Predictive Quality ──────────────────────────────────────────────
function AIPredictiveQualityModule() {
  const summary = {
    predictions: 3,
    critical: 1,
    high: 1,
    medium: 1,
    avgConfidence: 81.7,
  }
  const predictions = [
    {
      batch: 'BATCH-NM-4821', product: 'Namkeen', machine: 'FRY-01',
      type: 'QUALITY_FAILURE', riskLevel: 'CRITICAL', probability: 87,
      riskFactors: ['Oil temp +3°C above target', 'Frying time +12s', 'Batch color score 6.2 (target 7.5)', 'Moisture content 2.1% (target 1.5%)'],
      actions: ['Reduce oil temperature to 180°C', 'Shorten frying time by 10s', 'Increase oil filtration frequency', 'Quarantine batch for QA inspection'],
      confidence: 89, status: 'PENDING', outcome: 'Pending — batch in process',
    },
    {
      batch: 'BATCH-MT-3392', product: 'Motichoor Laddu', machine: 'COOK-01',
      type: 'BATCH_REJECTION', riskLevel: 'HIGH', probability: 62,
      riskFactors: ['Sugar syrup consistency 88° (target 92°)', 'Boiling time -8 min', 'Operator changeover at 14:30', 'Ambient humidity 68%'],
      actions: ['Extend boiling time by 5 min', 'Verify sugar syrup temperature', 'Add humidity control check', 'Increase sampling frequency'],
      confidence: 78, status: 'PENDING', outcome: 'Pending — under monitoring',
    },
    {
      batch: 'BATCH-ID-7145', product: 'Idli Batter', machine: 'MIX-01',
      type: 'YIELD_REDUCTION', riskLevel: 'MEDIUM', probability: 35,
      riskFactors: ['Grinding time -10 min vs standard', 'Rice-soak time 4.2 hrs (target 5 hrs)', 'Particle size 0.18mm (target 0.15mm)', 'Fermentation temp 28°C (target 32°C)'],
      actions: ['Increase grinding time by 12 min', 'Extend rice soak to 5 hrs', 'Adjust fermentation chamber temp', 'Calibrate particle size sensor'],
      confidence: 78, status: 'APPROVED', outcome: 'In progress — adjustments applied',
    },
  ]
  const riskColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    HIGH: 'bg-amber-100 text-amber-700 border-amber-300',
    MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />AI Predictive Quality</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · Quality failure prediction per batch · Prevent rejections before they happen</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><AlertTriangle className="mr-1 h-4 w-4" />Quarantine At-Risk</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Predictions', value: summary.predictions, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Critical Risk', value: summary.critical, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'High Risk', value: summary.high, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Medium Risk', value: summary.medium, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Avg Confidence', value: `${summary.avgConfidence}%`, icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
        ].map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-lg font-bold mt-1 ${w.color}`}>{w.value}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" />Active Quality Predictions — 3 Batches at Risk</h3>
        <div className="space-y-3">
          {predictions.map(p => (
            <Card key={p.batch} className="overflow-hidden">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">{p.batch}</p>
                    <p className="text-[10px] text-muted-foreground">{p.product} · {p.machine} · {p.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] ${riskColor[p.riskLevel]}`}>{p.riskLevel}</Badge>
                  <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300">{p.status}</Badge>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Failure Probability</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${p.probability >= 70 ? 'bg-rose-500' : p.probability >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${p.probability}%` }} />
                    </div>
                    <span className={`font-bold text-sm ${p.probability >= 70 ? 'text-rose-600' : p.probability >= 40 ? 'text-amber-600' : 'text-blue-600'}`}>{p.probability}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Confidence: <span className="font-semibold text-purple-600">{p.confidence}%</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Risk Factors</p>
                  <ul className="space-y-0.5">
                    {p.riskFactors.map(f => (
                      <li key={f} className="text-[11px] flex items-start gap-1"><AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Recommended Actions</p>
                  <ul className="space-y-0.5">
                    {p.actions.map(a => (
                      <li key={a} className="text-[11px] flex items-start gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-3 border-t bg-muted/20 text-[11px]">
                <p className="text-[10px] text-muted-foreground">Actual Outcome</p>
                <p className="font-medium">{p.outcome}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI Recipe Optimization ─────────────────────────────────────────────
function AIRecipeOptimizationModule() {
  const optimizations = [
    {
      product: 'Kaju Katli', recipe: 'KK-STD-v2.4', change: 'Reduce sugar by 2%',
      saving: 380, confidence: 84, tasteTests: 240, tasteScore: 8.7,
      rationale: 'Sensory panel detected no perceptible sweetness difference at -2% sugar. Material cost reduction with no quality regression.',
      status: 'PENDING_APPROVAL',
    },
    {
      product: 'Motichoor Laddu', recipe: 'MT-STD-v1.8', change: 'Adjust cooking time +5 min',
      saving: 120, confidence: 78, tasteTests: 96, tasteScore: 8.4,
      rationale: 'Extended caramelization improves binding and reduces breakage rate by 3.2%. Texture score improved 0.4 points.',
      status: 'PENDING_APPROVAL',
    },
    {
      product: 'Idli Batter', recipe: 'ID-STD-v3.1', change: 'Increase grinding time +12 min',
      saving: 0, confidence: 82, tasteTests: 144, tasteScore: 8.6,
      rationale: 'Finer particle size improves fermentation consistency. Yield improvement of 1.5% with no perceptible taste change.',
      status: 'PENDING_APPROVAL',
    },
  ]
  const comparison = [
    { product: 'Kaju Katli', version: 'v2.3 (current)', yield: 94.2, waste: 5.8, cost: 18600, time: 95, taste: 8.7 },
    { product: 'Kaju Katli', version: 'v2.4 (proposed)', yield: 94.5, waste: 5.5, cost: 18220, time: 95, taste: 8.7 },
    { product: 'Motichoor Laddu', version: 'v1.7 (current)', yield: 91.8, waste: 8.2, cost: 14200, time: 78, taste: 8.0 },
    { product: 'Motichoor Laddu', version: 'v1.8 (proposed)', yield: 93.1, waste: 6.9, cost: 14080, time: 83, taste: 8.4 },
    { product: 'Idli Batter', version: 'v3.0 (current)', yield: 96.4, waste: 3.6, cost: 6800, time: 42, taste: 8.5 },
    { product: 'Idli Batter', version: 'v3.1 (proposed)', yield: 97.9, waste: 2.1, cost: 6800, time: 54, taste: 8.6 },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-purple-600" />AI Recipe Optimization</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · AI-suggested recipe adjustments · Validated by taste tests · Human approval required</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Proposals</Button>
          <Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Submit for Approval</Button>
        </div>
      </div>
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Human Approval Required</p>
            <p className="text-xs text-muted-foreground mt-1">All AI recipe optimizations are <span className="font-semibold">recommendations only</span>. Final recipe changes require Master Chef / QA Manager approval after taste test validation. AI never modifies production recipes autonomously.</p>
          </div>
        </div>
      </Card>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" />Recipe Optimization Proposals — 3 Active</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {optimizations.map(o => (
            <Card key={o.product} className="overflow-hidden">
              <div className="p-3 border-b bg-purple-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{o.product}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{o.recipe}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300">{o.status}</Badge>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Proposed Change</p>
                  <p className="font-semibold text-sm text-purple-700">{o.change}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{o.rationale}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Cost Saving/Batch</p>
                    <p className="font-bold text-emerald-600">{o.saving > 0 ? `₹${o.saving.toLocaleString('en-IN')}` : 'Yield gain'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Confidence</p>
                    <p className="font-bold text-purple-600">{o.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Taste Tests</p>
                    <p className="font-semibold">{o.tasteTests}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Taste Score</p>
                    <p className="font-semibold">{o.tasteScore}/10</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Recipe Comparison — Current vs Proposed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Version</th>
                <th className="text-center p-2">Yield %</th>
                <th className="text-center p-2">Waste %</th>
                <th className="text-center p-2">Cost/Batch</th>
                <th className="text-center p-2">Prod. Time (min)</th>
                <th className="text-center p-2">Taste Score</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((c, i) => (
                <tr key={i} className={`border-t hover:bg-muted/20 ${c.version.includes('proposed') ? 'bg-purple-50/50' : ''}`}>
                  <td className="p-2 font-medium">{c.product}</td>
                  <td className="p-2">
                    <code className={`text-[10px] px-1 py-0.5 rounded ${c.version.includes('proposed') ? 'bg-purple-100 text-purple-700' : 'bg-muted text-muted-foreground'}`}>{c.version}</code>
                  </td>
                  <td className="p-2 text-center font-semibold text-emerald-600">{c.yield}%</td>
                  <td className="p-2 text-center font-semibold text-rose-600">{c.waste}%</td>
                  <td className="p-2 text-center">₹{c.cost.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-center">{c.time}</td>
                  <td className="p-2 text-center font-semibold">{c.taste}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── AI Energy Optimization ─────────────────────────────────────────────
function AIEnergyOptimizationModule() {
  const summary = {
    count: 4,
    potentialSaving: 18800,
    actualSaving: 2980,
    avgConfidence: 93,
  }
  const optimizations = [
    {
      machine: 'COOK-01', type: 'LOAD_SHIFTING', title: 'Off-Peak Batch Scheduling',
      current: 412, optimized: 328, unit: 'kWh/day', savingPct: 20.3,
      recommendation: 'Shift 3 batch cycles from peak (14:00-18:00) to off-peak (22:00-06:00) window. Maintain daily output target.',
      estSaving: 8400, confidence: 95, status: 'APPROVED', icon: Clock,
    },
    {
      machine: 'FRY-01', type: 'GAS_OPTIMIZATION', title: 'Burner Tuning & Idle Shutdown',
      current: 28.4, optimized: 24.1, unit: 'm³/day', savingPct: 15.1,
      recommendation: 'Recalibrate gas burners; implement 90-second idle auto-shutoff between batches; install oxygen trim control.',
      estSaving: 4200, confidence: 92, status: 'PENDING', icon: Zap,
    },
    {
      machine: 'CONV-01', type: 'AUTO_SHUTDOWN', title: 'Idle Conveyor Auto-Shutoff',
      current: 86, optimized: 0, unit: 'kWh/day', savingPct: 100,
      recommendation: 'Conveyor runs continuously during shift; install occupancy sensor to auto-shutoff when no product present for 60 seconds.',
      estSaving: 3200, confidence: 98, status: 'IMPLEMENTED', icon: Settings,
    },
    {
      machine: 'COOL-01', type: 'PEAK_REDUCTION', title: 'Pre-Cooling & Peak Avoidance',
      current: 184, optimized: 134, unit: 'kWh/day', savingPct: 27.1,
      recommendation: 'Pre-cool storage chambers during off-peak; raise set-point by 2°C during peak window; deploy thermal mass buffering.',
      estSaving: 3000, confidence: 88, status: 'PENDING', icon: Activity,
    },
  ]
  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-300',
    IMPLEMENTED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-yellow-600" />AI Energy Optimization</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · 95% model accuracy · ₹18,800 potential annual saving · Load shifting, gas, peak reduction</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Approve All</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Optimizations', value: summary.count, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Potential Saving', value: `₹${summary.potentialSaving.toLocaleString('en-IN')}`, icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Actual Saving', value: `₹${summary.actualSaving.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Avg Confidence', value: `${summary.avgConfidence}%`, icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
        ].map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-lg font-bold mt-1 ${w.color}`}>{w.value}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-yellow-600" />Active Energy Optimizations — 4 Machines</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {optimizations.map(o => (
            <Card key={o.machine} className="overflow-hidden">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <o.icon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{o.machine} — {o.title}</p>
                    <p className="text-[10px] text-muted-foreground">{o.type}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[9px] ${statusColor[o.status]}`}>{o.status}</Badge>
              </div>
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200">
                    <p className="text-[9px] text-muted-foreground">Current</p>
                    <p className="font-bold text-rose-600 text-sm">{o.current} <span className="text-[9px]">{o.unit}</span></p>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                    <p className="text-[9px] text-muted-foreground">Optimized</p>
                    <p className="font-bold text-emerald-600 text-sm">{o.optimized} <span className="text-[9px]">{o.unit}</span></p>
                  </div>
                  <div className="p-2 rounded bg-yellow-50 border border-yellow-200">
                    <p className="text-[9px] text-muted-foreground">Saving</p>
                    <p className="font-bold text-yellow-700 text-sm">{o.savingPct}%</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{o.recommendation}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Est. Annual Saving</p>
                    <p className="font-bold text-emerald-600">₹{o.estSaving.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground">Confidence</p>
                    <p className="font-bold text-purple-600">{o.confidence}%</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI Root Cause Explorer ─────────────────────────────────────────────
function AIRootCauseExplorerModule() {
  const summary = {
    analyses: 5,
    avgConfidence: 85.7,
  }
  const analyses = [
    {
      incident: 'Namkeen Batch Burn', type: 'QUALITY_INCIDENT', date: '2025-02-08',
      batch: 'BATCH-NM-4810', machine: 'FRY-01',
      desc: '38 kg Namkeen batch rejected due to excessive browning; burn marks detected at QA inspection.',
      rootCause: 'Oil temperature sensor drifted +6°C above setpoint over 4 hours; PID controller did not catch drift due to faulty calibration.',
      category: 'PROCESS_VARIATION', confidence: 89,
      evidence: [
        { source: 'Temperature Log', value: '185°C setpoint, 191°C actual, 4hr drift' },
        { source: 'Sensor Calibration', value: 'Last calibration 47 days ago (policy: 30 days)' },
        { source: 'PID Controller Log', value: 'No alarm raised; setpoint deviation threshold 10°C' },
        { source: 'Operator Shift Log', value: 'Handover at 14:00; no anomaly noted' },
      ],
      correlatedFactors: ['Sensor calibration overdue by 17 days', 'High production load (3 batches/hr)', 'Ambient temperature 32°C'],
      actions: ['Recalibrate oil temp sensor monthly (was quarterly)', 'Reduce PID deviation threshold from 10°C to 5°C', 'Add automated drift alarm every 30 min', 'Update operator SOP for sensor verification'],
      status: 'RESOLVED',
    },
    {
      incident: 'FRY-01 Unexpected Downtime', type: 'MACHINE_FAILURE', date: '2025-02-05',
      batch: 'N/A', machine: 'FRY-01',
      desc: 'FRY-01 hydraulic pump failed at 11:42; 4h 0min downtime; 2 batches delayed.',
      rootCause: 'Hydraulic pump seal degraded due to thermal cycling; vibration signature showed early bearing wear 12 days prior but alarm was muted.',
      category: 'MACHINE_DOWNTIME', confidence: 92,
      evidence: [
        { source: 'Vibration Spectrum', value: '4.8 mm/s RMS (threshold 4.0); bearing frequency peak at 142 Hz' },
        { source: 'Maintenance Log', value: 'Vibration alarm raised 2025-01-24; muted by maintenance team' },
        { source: 'Oil Analysis', value: 'Particle count 3.2x normal; iron content 48 ppm' },
        { source: 'Thermal Image', value: 'Pump housing +18°C above ambient; bearing race hot spot' },
      ],
      correlatedFactors: ['Vibration alarm muted 12 days before failure', 'Oil particle count rising for 8 days', 'Pump age 5.2 years (MTBF 4.5 years)'],
      actions: ['Disable alarm muting without QA sign-off', 'Trigger predictive maintenance at 4.0 mm/s vibration', 'Add oil particle count to daily checklist', 'Schedule pump replacement at 4-year preventive interval'],
      status: 'RESOLVED',
    },
    {
      incident: 'Kaju Katli Yield Loss', type: 'YIELD_DEGRADATION', date: '2025-02-03',
      batch: 'BATCH-KK-2298', machine: 'CUT-01',
      desc: 'Kaju Katli batch yield dropped to 89.2% (target 94%); 12 kg material loss attributed to cutting waste.',
      rootCause: 'Cutting blade thickness worn by 0.3mm; blade replacement interval extended beyond standard 5000 cycles to 7200 cycles.',
      category: 'PROCESS_VARIATION', confidence: 76,
      evidence: [
        { source: 'Blade Inspection', value: 'Thickness 1.2mm (spec 1.5mm); edge radius 0.4mm (spec 0.1mm)' },
        { source: 'Cycle Count Log', value: '7200 cycles since last replacement; policy 5000 cycles' },
        { source: 'Yield Trend', value: 'Gradual decline 94% → 89.2% over 14 days' },
        { source: 'Waste Analysis', value: 'Cutting waste 10.8% (target 6%); edge ragged' },
      ],
      correlatedFactors: ['Blade replacement overdue by 2200 cycles', 'Yield decline correlated with cycle count', 'Operator reported ragged edges 3 days ago'],
      actions: ['Replace blade immediately', 'Enforce 5000-cycle hard limit via MES', 'Add daily blade-edge visual inspection', 'Trigger yield-decline alert at 92%'],
      status: 'IN_PROGRESS',
    },
  ]
  const statusColor: Record<string, string> = {
    RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
    OPEN: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><AlertCircle className="h-6 w-6 text-rose-600" />AI Root Cause Explorer</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · AI-driven RCA · Evidence + correlation + recommendation · 85.7% avg confidence</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export RCA Reports</Button>
          <Button size="sm"><Sparkles className="mr-1 h-4 w-4" />Run New Analysis</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Analyses Completed', value: summary.analyses, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Avg Confidence', value: `${summary.avgConfidence}%`, icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Resolved', value: 2, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'In Progress', value: 1, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
        ].map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-lg font-bold mt-1 ${w.color}`}>{w.value}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" />Root Cause Analyses — 3 Recent Incidents</h3>
        <div className="space-y-3">
          {analyses.map(a => (
            <Card key={a.incident} className="overflow-hidden">
              <div className="p-3 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <div>
                      <p className="font-semibold text-sm">{a.incident}</p>
                      <p className="text-[10px] text-muted-foreground">{a.type} · {a.date} · {a.machine}{a.batch !== 'N/A' && ` · ${a.batch}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] bg-purple-100 text-purple-700 border-purple-300">{a.category}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${statusColor[a.status]}`}>{a.status}</Badge>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">{a.desc}</p>
              </div>
              <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Target className="h-3 w-3" />Probable Root Cause (Confidence: <span className="font-bold text-purple-600">{a.confidence}%</span>)</p>
                  <p className="text-xs font-medium bg-purple-50 border border-purple-200 rounded p-2">{a.rootCause}</p>
                  <div className="mt-3">
                    <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Correlated Factors</p>
                    <ul className="space-y-0.5">
                      {a.correlatedFactors.map(f => (
                        <li key={f} className="text-[11px] flex items-start gap-1"><ArrowRight className="h-2.5 w-2.5 text-amber-500 mt-1 flex-shrink-0" />{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-3 w-3" />Supporting Evidence</p>
                  <div className="bg-muted/30 rounded p-2 border font-mono text-[10px]">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(a.evidence, null, 2)}</pre>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t bg-emerald-50/30">
                <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />Recommended Actions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {a.actions.map((act, i) => (
                    <p key={i} className="text-[11px] flex items-start gap-1"><span className="font-bold text-emerald-600">{i + 1}.</span>{act}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI Continuous Improvement Engine ───────────────────────────────────
function AIContinuousImprovementModule() {
  const summary = {
    improvements: 8,
    totalSavings: 28320,
    avgImprovement: 58.6,
    bestPractices: 5,
  }
  const improvements = [
    {
      source: 'AI', title: 'Namkeen Burn Reduction', type: 'QUALITY_IMPROVEMENT',
      before: '8.2% rejection rate', after: '3.3% rejection rate', improvementPct: 59.5,
      costSaving: 2520, implementedBy: 'QA Team + AI', date: '2025-02-09',
      learning: 'Sensor drift is the leading cause of frying-quality incidents. Monthly calibration + reduced PID threshold prevents 90% of burn events.',
      bestPractice: 'BP-QA-001: Sensor Calibration Discipline', published: true,
    },
    {
      source: 'KAIZEN', title: '5S Setup Reduction at Line B', type: 'SETUP_TIME_REDUCTION',
      before: '46 min avg setup', after: '23 min avg setup', improvementPct: 50.0,
      costSaving: 1800, implementedBy: 'Line B Operators', date: '2025-02-06',
      learning: 'Tool organization per 5S principles halves changeover time. Visual management boards sustain gains better than SOP-only deployment.',
      bestPractice: 'BP-OPS-002: 5S Visual Changeover Board', published: true,
    },
    {
      source: 'AI', title: 'Operator Cross-Assignment Optimization', type: 'WORKFORCE_OPTIMIZATION',
      before: '120 min idle operator time/shift', after: '20 min idle operator time/shift', improvementPct: 83.3,
      costSaving: 600, implementedBy: 'Production Planner + AI', date: '2025-02-04',
      learning: 'Real-time operator-skill matching to line workload eliminates 83% of idle time. Skill matrix must be kept current weekly.',
      bestPractice: 'BP-OPS-003: Dynamic Skill-Workload Matching', published: true,
    },
    {
      source: 'LESSON_LEARNED', title: 'Campaign Scheduling for Motichoor', type: 'SCHEDULE_OPTIMIZATION',
      before: '12 hrs changeover/week', after: '7 hrs changeover/week', improvementPct: 41.7,
      costSaving: 7200, implementedBy: 'Production Manager', date: '2025-02-01',
      learning: 'Grouping Motichoor runs into campaigns reduces cleaning time by 41.7%. Trade-off: requires 2-day finished-goods buffer.',
      bestPractice: 'BP-OPS-004: Campaign Scheduling with Buffer', published: true,
    },
  ]
  const bestPractices = [
    { code: 'BP-QA-001', title: 'Sensor Calibration Discipline', domain: 'Quality', adoption: 4, impact: '₹2,520/mo', published: '2025-02-09' },
    { code: 'BP-OPS-002', title: '5S Visual Changeover Board', domain: 'Operations', adoption: 3, impact: '₹1,800/mo', published: '2025-02-06' },
    { code: 'BP-OPS-003', title: 'Dynamic Skill-Workload Matching', domain: 'Operations', adoption: 5, impact: '₹600/mo', published: '2025-02-04' },
    { code: 'BP-OPS-004', title: 'Campaign Scheduling with Buffer', domain: 'Planning', adoption: 2, impact: '₹7,200/mo', published: '2025-02-01' },
    { code: 'BP-MAINT-005', title: 'Predictive Vibration Threshold', domain: 'Maintenance', adoption: 6, impact: '₹9,600/mo', published: '2025-01-28' },
  ]
  const sourceColor: Record<string, string> = {
    AI: 'bg-purple-100 text-purple-700 border-purple-300',
    KAIZEN: 'bg-blue-100 text-blue-700 border-blue-300',
    LESSON_LEARNED: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Recycle className="h-6 w-6 text-emerald-600" />AI Continuous Improvement Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 48 · Closed-loop learning · AI + Kaizen + Lessons Learned · ₹28,320 total savings · 5 best practices published</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Learnings</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Log Improvement</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Improvements Logged', value: summary.improvements, icon: Recycle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Total Savings', value: `₹${summary.totalSavings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Avg Improvement', value: `${summary.avgImprovement}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Best Practices Published', value: summary.bestPractices, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
        ].map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-lg font-bold mt-1 ${w.color}`}>{w.value}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" />Recent Improvements — 4 Logged</h3>
        <div className="space-y-3">
          {improvements.map(imp => (
            <Card key={imp.title} className="overflow-hidden">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{imp.title}</p>
                    <p className="text-[10px] text-muted-foreground">{imp.type} · Implemented {imp.date} by {imp.implementedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] ${sourceColor[imp.source]}`}>{imp.source}</Badge>
                  {imp.published && <Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300"><BookOpen className="h-2.5 w-2.5 mr-0.5" />Published</Badge>}
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-rose-50 border border-rose-200">
                      <p className="text-[9px] text-muted-foreground">Before</p>
                      <p className="font-semibold text-rose-700 text-xs">{imp.before}</p>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                      <p className="text-[9px] text-muted-foreground">After</p>
                      <p className="font-semibold text-emerald-700 text-xs">{imp.after}</p>
                    </div>
                  </div>
                  <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200">
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" />Learning Notes</p>
                    <p className="text-[11px] text-amber-900">{imp.learning}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-purple-50 border border-purple-200">
                      <p className="text-[9px] text-muted-foreground">Improvement</p>
                      <p className="font-bold text-purple-700 text-lg">{imp.improvementPct}%</p>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                      <p className="text-[9px] text-muted-foreground">Cost Saving</p>
                      <p className="font-bold text-emerald-700 text-lg">₹{imp.costSaving.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  {imp.published && (
                    <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-200">
                      <p className="text-[9px] text-muted-foreground flex items-center gap-1"><BookOpen className="h-2.5 w-2.5" />Best Practice Tag</p>
                      <p className="text-[11px] font-semibold text-blue-700">{imp.bestPractice}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-600" />Best Practices Library — 5 Published</h3>
          <span className="text-[10px] text-muted-foreground">Reusable across all plants & lines</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">Domain</th>
                <th className="text-center p-2">Adoption (lines)</th>
                <th className="text-center p-2">Monthly Impact</th>
                <th className="text-center p-2">Published</th>
              </tr>
            </thead>
            <tbody>
              {bestPractices.map(bp => (
                <tr key={bp.code} className="border-t hover:bg-muted/20">
                  <td className="p-2"><code className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700">{bp.code}</code></td>
                  <td className="p-2 font-medium">{bp.title}</td>
                  <td className="p-2 text-muted-foreground">{bp.domain}</td>
                  <td className="p-2 text-center font-semibold">{bp.adoption}</td>
                  <td className="p-2 text-center font-semibold text-emerald-600">{bp.impact}</td>
                  <td className="p-2 text-center text-muted-foreground">{bp.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
