// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 54 — FOOD SAFETY MANAGEMENT (HACCP · CCP · EMP · SANITATION · ALLERGEN · FOOD DEFENSE)
// Admin modules: FS Dashboard, HACCP Plan & Hazard Analysis, CCP Monitor,
// Environmental Monitoring & Sanitation, Allergen Matrix & Food Defense
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: 22 of 23 requested icons are ALREADY imported in
// src/app/page.tsx (lines 4–34). No new icon imports needed. Verified icons:
//   ShieldCheck, ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, X,
//   Activity, Thermometer, Beaker, Microscope, QrCode, FileText, FileWarning,
//   Clock, MapPin, Bell, BellRing, Pause, Play, StopCircle, Calendar, Droplets
//
// SprayCan is NOT imported in src/app/page.tsx. Per task spec fallback rule,
// Droplets (already imported, line 28) is used in its place for sanitation-
// related indicators (chemical application, ATP test reagent, cleaning agents).
//
// CONFLICT NOTE: grep of `^function.*Module` in src/app/page.tsx against
// (food.safety|haccp|hazard|ccp|environmental|sanitation|allergen|defense)
// returned ONE existing collision:
//   - IPQCCCPModule  (line 29380)  — IPQC-prefixed CCP module
// Per task spec, ALL Sprint 54 modules use the `FS` prefix:
//   FSDashboardModule, FSHACCPModule, FSCCPModule,
//   FSEnvironmentalModule, FSAllergenModule
// Zero residual collisions.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── FS Dashboard ──────────────────────────────────────────────────────
function FSDashboardModule() {
  // KPIs — HACCP, CCP, EMP, Sanitation, Allergen, Food Defense, Food Fraud, Alerts
  const kpis = [
    { label: 'HACCP Plans', value: '4', unit: '3 active · 1 draft', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Active Plans', value: '3', unit: 'Kaju Katli · Namkeen · Milk Sweets', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Total Hazards', value: '24', unit: '6 critical · 9 high · 6 medium · 3 low', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Critical Hazards', value: '6', unit: 'require CCP control', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'CCPs', value: '7', unit: '6 within limit · 1 breach', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'OPRPs', value: '8', unit: 'operational prerequisite programs', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'CCP Checks Today', value: '124', unit: '122 passed · 2 breaches', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'CCP Pass Rate', value: '98.4%', unit: '122 of 124 checks passed', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'CCP Breaches', value: '2', unit: 'production paused · batch on hold', icon: Pause, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'EMP Samples', value: '48', unit: '5 pending · 40 passed · 3 failed', icon: Microscope, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'EMP Pending', value: '5', unit: 'awaiting lab analysis', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'EMP Failed', value: '3', unit: 'corrective cleaning triggered', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Sanitation Records', value: '24', unit: '20 verified · 1 failed · 3 pending', icon: Droplets, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Sanitation Verified', value: '20', unit: 'ATP/visual/micro verified', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Sanitation Failed', value: '1', unit: 'ATP 45 RLU > limit 30 RLU', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Allergen Products', value: '15', unit: '8 with declared allergens', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Cross-Contact Incidents', value: '0', unit: 'no allergen cross-contact', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Food Defense', value: 'ACTIVE', unit: '5 of 5 controls verified', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Food Fraud Assessments', value: '12', unit: '2 high · 4 medium · 6 low', icon: FileWarning, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Active Alerts', value: '2', unit: '1 critical · 1 warning', icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  ]

  // Food safety flow — 8 stages from Supplier to Dispatch
  const safetyFlow = [
    { step: 1, code: 'SUPPLIER', name: 'Supplier', icon: ShieldCheck, color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Approved supplier · CoA verified' },
    { step: 2, code: 'IQC', name: 'IQC', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700 border-blue-300', desc: 'Incoming quality check on raw material' },
    { step: 3, code: 'MANUFACTURING', name: 'Manufacturing', icon: Activity, color: 'bg-indigo-100 text-indigo-700 border-indigo-300', desc: 'Batch production under SOP' },
    { step: 4, code: 'CCP', name: 'CCP', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: 'Critical control point monitored' },
    { step: 5, code: 'IPQC', name: 'IPQC', icon: Beaker, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'In-process quality check' },
    { step: 6, code: 'FGQC', name: 'FGQC', icon: CheckCircle2, color: 'bg-teal-100 text-teal-700 border-teal-300', desc: 'Finished goods quality check' },
    { step: 7, code: 'WAREHOUSE', name: 'Warehouse', icon: MapPin, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Stored under controlled conditions' },
    { step: 8, code: 'DISPATCH', name: 'Dispatch', icon: QrCode, color: 'bg-cyan-100 text-cyan-700 border-cyan-300', desc: 'Pallet scanned · released · shipped' },
  ]

  // Chief Architect recommendation — CCP breach escalation chain (6 stages)
  const escalationStages = [
    {
      stage: 1, code: 'CCP_EXCEEDS_LIMIT', name: 'CCP Exceeds Critical Limit',
      icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300',
      desc: 'CCP sensor or operator reading exceeds the critical limit (e.g. cooking temp < 110°C, metal detector fail). System auto-detects via SCADA or manual entry triggers the breach.',
      actor: 'SCADA / Operator', output: 'Breach event recorded with timestamp',
    },
    {
      stage: 2, code: 'PRODUCTION_PAUSED', name: 'Production Line Paused',
      icon: Pause, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300',
      desc: 'Production line is automatically paused. MES disables further batch operations on the line. Operators cannot override the pause; only QA/Production Manager can resume after corrective action.',
      actor: 'MES (automated)', output: 'Line status = PAUSED',
    },
    {
      stage: 3, code: 'BATCH_ON_HOLD', name: 'Affected Batch on Hold',
      icon: StopCircle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300',
      desc: 'The batch(es) produced since the last verified CCP check are quarantined. Stock is moved to QA-HOLD location; dispatch and shipping are blocked for those batches.',
      actor: 'WMS (automated)', output: 'Batch status = ON_HOLD',
    },
    {
      stage: 4, code: 'INCIDENT_CREATED', name: 'Food Safety Incident Created',
      icon: FileWarning, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300',
      desc: 'A food safety incident is auto-created in the QMS with the CCP code, batch, deviation magnitude, and product traceability. CAPA workflow is initiated for root-cause analysis.',
      actor: 'QMS (automated)', output: 'Incident ID + CAPA record',
    },
    {
      stage: 5, code: 'ALERTS_SENT', name: 'Alerts Sent to Stakeholders',
      icon: BellRing, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-300',
      desc: 'Real-time alerts (in-app + email + SMS) sent to QA Manager, Production Head, Plant Manager, and (if severity = CRITICAL) Food Safety Team Leader. Acknowledgement is tracked.',
      actor: 'Notification Service', output: 'Alert delivery + acknowledgement',
    },
    {
      stage: 6, code: 'CORRECTIVE_ACTION_APPROVAL', name: 'Cannot Resume Until Approved',
      icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300',
      desc: 'Production cannot resume until QA Manager documents and approves corrective actions (reheat, reprocess, reject, equipment repair). Each action is timestamped, signed, and linked to the incident.',
      actor: 'QA Manager', output: 'Resume authorization + signature',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />Food Safety Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 54 · HACCP · CCP Monitoring · Environmental Monitoring · Sanitation · Allergen · Food Defense · Food Fraud · 4 HACCP plans · 24 hazards · 7 CCPs · 8 OPRPs · 124 CCP checks today (98.4% pass) · 48 EMP samples · 24 sanitation records · 15 allergen products · 0 cross-contact incidents · 12 fraud assessments · 2 active alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />FS Report</Button>
          <Button size="sm" variant="outline"><QrCode className="mr-1 h-4 w-4" />Trace Batch</Button>
          <Button size="sm"><ShieldCheck className="mr-1 h-4 w-4" />New CCP Check</Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`p-4 border ${kpi.bg}`}>
            <div className="flex items-start justify-between">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
            </div>
            <p className="text-xs font-semibold mt-2 text-foreground">{kpi.label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{kpi.unit}</p>
          </Card>
        ))}
      </div>

      {/* Food safety flow */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-600" />Food Safety Flow · Supplier to Dispatch</h3>
            <p className="text-xs text-muted-foreground mt-0.5">8-stage food safety chain — every batch passes through supplier verification, IQC, manufacturing, CCP monitoring, IPQC, FGQC, warehouse, and dispatch with full traceability</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />Live
          </Badge>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {safetyFlow.map((step, i) => (
            <div key={step.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${step.color} px-3 py-2 min-w-[160px]`}>
                <div className="flex items-center gap-1.5">
                  <step.icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wide">Stage {step.step}</span>
                </div>
                <p className="text-[11px] font-semibold mt-1">{step.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{step.desc}</p>
              </div>
              {i < safetyFlow.length - 1 && (
                <span className="text-slate-400 shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Chief Architect recommendation — CCP breach escalation */}
      <Card className="p-5 bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" />Chief Architect Recommendation — Every CCP Digitally Monitored with Automatic Escalation</p>
            <p className="text-xs text-muted-foreground mt-1">Every Critical Control Point is monitored digitally (SCADA sensor or operator-verified entry). When a CCP reading exceeds the critical limit, the system cannot be silently corrected — it triggers a <span className="font-semibold text-rose-700">6-stage mandatory escalation chain</span>: production paused → batch on hold → incident created → alerts sent → corrective actions documented → resume only after QA approval. No operator, supervisor, or even plant manager can bypass this chain. The CCP breach and its full corrective-action trail are permanently linked to the batch record for traceability and audit.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {escalationStages.map((s) => (
                <div key={s.code} className={`rounded-lg border p-3 ${s.bg}`}>
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Stage {s.stage}</span>
                  </div>
                  <p className={`font-semibold text-xs mt-1 ${s.color}`}>{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Actor</p>
                      <p className="text-[10px] font-semibold text-foreground">{s.actor}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Output</p>
                      <p className="text-[10px] font-semibold text-foreground">{s.output}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Active alert panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-4 border-rose-300 bg-rose-50/60">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="h-5 w-5 text-rose-600" />
            <p className="text-sm font-semibold text-rose-700">CRITICAL · CCP Breach — Metal Detection (Namkeen Line)</p>
          </div>
          <p className="text-[11px] text-muted-foreground">CCP-CCP-002 (Metal Detection — Namkeen) FAILED at 14:32 on batch BATCH-NM-26F007. Production line NM-LINE-02 paused; batch on hold in QA-HOLD-2. Incident INC-FS-0042 raised. Corrective action pending QA Manager approval.</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" className="flex-1 text-[11px] h-7"><FileWarning className="mr-1 h-3.5 w-3.5" />View Incident</Button>
            <Button size="sm" variant="outline" className="flex-1 text-[11px] h-7"><Pause className="mr-1 h-3.5 w-3.5" />Line Status</Button>
          </div>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-700">WARNING · EMP Sample Failed — Hand Swab Coliform</p>
          </div>
          <p className="text-[11px] text-muted-foreground">EMP sample EMP-0123 (Hand Swab — Line 1 Operator) tested positive for coliform at 12 CFU/cm² (limit &lt; 10 CFU/cm²). Corrective action: retraining + hand-wash verification + retest scheduled in 24 hours.</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" className="flex-1 text-[11px] h-7"><Microscope className="mr-1 h-3.5 w-3.5" />View EMP</Button>
            <Button size="sm" variant="outline" className="flex-1 text-[11px] h-7"><Droplets className="mr-1 h-3.5 w-3.5" />Corrective Clean</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── FS HACCP Plan & Hazard Analysis ───────────────────────────────────
function FSHACCPModule() {
  // 4 HACCP plans
  const plans = [
    {
      number: 'HACCP-001', name: 'Kaju Katli', plant: 'Plant 1 — Mumbai', family: 'Dry Fruit Sweets',
      version: 'v2.0', standard: 'HACCP', status: 'ACTIVE',
      hazards: 8, ccps: 3, oprps: 2, effectiveDate: '2025-11-15',
      nextReview: '2026-11-15', teamLead: 'Dr. A. Mehta (QA Manager)',
      desc: 'Cashew-based sweet — controls cover roasting temperature, metal detection, cooling, and packaging integrity.',
    },
    {
      number: 'HACCP-002', name: 'Namkeen', plant: 'Plant 1 — Mumbai', family: 'Savoury Snacks',
      version: 'v1.5', standard: 'ISO_22000', status: 'ACTIVE',
      hazards: 6, ccps: 2, oprps: 2, effectiveDate: '2025-09-20',
      nextReview: '2026-09-20', teamLead: 'R. Iyer (QA Lead)',
      desc: 'Fried savoury mix — controls cover frying oil temperature, metal detection, and seasoning allergen segregation.',
    },
    {
      number: 'HACCP-003', name: 'Milk Sweets', plant: 'Plant 2 — Pune', family: 'Dairy Sweets',
      version: 'v1.2', standard: 'FSSAI', status: 'ACTIVE',
      hazards: 7, ccps: 2, oprps: 2, effectiveDate: '2025-12-01',
      nextReview: '2026-12-01', teamLead: 'S. Kulkarni (QA Lead)',
      desc: 'Milk-based sweets (Gulab Jamun, Kalakand) — controls cover milk pasteurisation, frying temperature, and sugar syrup concentration.',
    },
    {
      number: 'HACCP-004', name: 'Idli Batter', plant: 'Plant 2 — Pune', family: 'Refrigerated Foods',
      version: 'v1.0', standard: 'BRCGS', status: 'DRAFT',
      hazards: 3, ccps: 0, oprps: 1, effectiveDate: '— (draft)',
      nextReview: '— (draft)', teamLead: 'P. Deshmukh (QA)',
      desc: 'Fermented rice-and-lentil batter — draft plan under review. Hazard analysis in progress; CCPs pending team approval.',
    },
  ]

  // 6 hazard types
  const hazardTypes = [
    { code: 'BIOLOGICAL', name: 'Biological', icon: Microscope, color: 'bg-rose-100 text-rose-700 border-rose-300', desc: 'Pathogenic bacteria (Salmonella, E. coli, Listeria), viruses, parasites — controlled by cooking temp, pasteurisation, sanitation' },
    { code: 'CHEMICAL', name: 'Chemical', icon: Beaker, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Cleaning chemical residues, pesticide residues, allergen cross-contact, mycotoxins — controlled by rinsing, supplier CoA, segregation' },
    { code: 'PHYSICAL', name: 'Physical', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Metal fragments, glass, plastic, stones — controlled by metal detectors, sieves, visual inspection, equipment maintenance' },
    { code: 'ALLERGEN', name: 'Allergen', icon: ShieldAlert, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Undeclared allergens (milk, nuts, soy, gluten) — controlled by dedicated equipment, sequencing, validated cleaning, labelling' },
    { code: 'RADIOLOGICAL', name: 'Radiological', icon: Activity, color: 'bg-teal-100 text-teal-700 border-teal-300', desc: 'Radiological contamination (rare) — controlled by supplier sourcing, monitoring of high-risk ingredients' },
    { code: 'FOREIGN_MATERIAL', name: 'Foreign Material', icon: AlertCircle, color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Hair, insects, packaging fragments, wood splinters — controlled by GMP, pest control, sealed packaging, foreign-material detectors' },
  ]

  // Risk matrix — Likelihood (1-5) × Severity (1-5) = Risk Score → LOW/MEDIUM/HIGH/CRITICAL
  const likelihoodLabels = ['Rare (1)', 'Unlikely (2)', 'Possible (3)', 'Likely (4)', 'Almost Certain (5)']
  const severityLabels = ['Negligible (1)', 'Minor (2)', 'Moderate (3)', 'Major (4)', 'Catastrophic (5)']

  // Risk categorisation function
  const riskCategory = (score: number): { label: string; bg: string; text: string } => {
    if (score >= 20) return { label: 'CRITICAL', bg: 'bg-rose-600', text: 'text-white' }
    if (score >= 12) return { label: 'HIGH', bg: 'bg-orange-500', text: 'text-white' }
    if (score >= 6) return { label: 'MEDIUM', bg: 'bg-amber-400', text: 'text-slate-900' }
    return { label: 'LOW', bg: 'bg-emerald-400', text: 'text-slate-900' }
  }

  // Sample hazards per plan (a few representative ones for context)
  const planHazards = [
    { plan: 'HACCP-001 (Kaju Katli)', hazard: 'Salmonella in raw cashew', type: 'BIOLOGICAL', likelihood: 3, severity: 5, score: 15, control: 'CCP-1 Roasting at 110°C ≥ 15 min', status: 'CRITICAL' },
    { plan: 'HACCP-001 (Kaju Katli)', hazard: 'Metal fragment from grinder', type: 'PHYSICAL', likelihood: 2, severity: 4, score: 8, control: 'CCP-2 Metal detection Fe 1.5mm / Non-Fe 2.0mm', status: 'HIGH' },
    { plan: 'HACCP-001 (Kaju Katli)', hazard: 'Tree nut undeclared cross-contact', type: 'ALLERGEN', likelihood: 2, severity: 5, score: 10, control: 'OPRP dedicated line + validated cleaning', status: 'HIGH' },
    { plan: 'HACCP-002 (Namkeen)', hazard: 'Under-fried product — oil absorption / pathogens', type: 'BIOLOGICAL', likelihood: 2, severity: 4, score: 8, control: 'CCP-4 Frying oil temp ≥ 175°C ≥ 3 min', status: 'HIGH' },
    { plan: 'HACCP-002 (Namkeen)', hazard: 'Gluten cross-contact from seasoning', type: 'ALLERGEN', likelihood: 3, severity: 4, score: 12, control: 'OPRP sequencing — gluten-free first', status: 'HIGH' },
    { plan: 'HACCP-003 (Milk Sweets)', hazard: 'Listeria in raw milk', type: 'BIOLOGICAL', likelihood: 2, severity: 5, score: 10, control: 'CCP-6 Pasteurisation 72°C ≥ 15 sec', status: 'HIGH' },
    { plan: 'HACCP-003 (Milk Sweets)', hazard: 'Aflatoxin M1 in milk', type: 'CHEMICAL', likelihood: 2, severity: 3, score: 6, control: 'Supplier CoA + monthly monitoring', status: 'MEDIUM' },
    { plan: 'HACCP-004 (Idli Batter)', hazard: 'Wild fermentation contamination', type: 'BIOLOGICAL', likelihood: 3, severity: 3, score: 9, control: 'OPRP starter culture + temp control', status: 'MEDIUM' },
  ]

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const standardColor: Record<string, string> = {
    HACCP: 'bg-blue-100 text-blue-700 border-blue-300',
    ISO_22000: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    FSSAI: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    BRCGS: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const riskStatusColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-blue-600" />HACCP Plan & Hazard Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 54 · 4 HACCP plans (3 active · 1 draft) · 24 hazards (6 critical · 9 high · 6 medium · 3 low) · 7 CCPs · 8 OPRPs · Standards: HACCP, ISO 22000, FSSAI, BRCGS · Each plan includes number, name, plant, family, version, standard, status, hazard/CCP/OPRP counts, and effective date</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export Plans</Button>
          <Button size="sm" variant="outline"><Activity className="mr-1 h-4 w-4" />Risk Matrix</Button>
          <Button size="sm"><ShieldCheck className="mr-1 h-4 w-4" />New HACCP Plan</Button>
        </div>
      </div>

      {/* HACCP plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <Card key={p.number} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{p.number}</span>
                  <Badge variant="outline" className={standardColor[p.standard]}>{p.standard.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={statusColor[p.status]}>{p.status}</Badge>
                </div>
                <h3 className="text-lg font-bold mt-1">{p.name} <span className="text-xs font-mono text-muted-foreground">{p.version}</span></h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{p.plant} · {p.family}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-500/40" />
            </div>
            <p className="text-xs text-muted-foreground leading-snug mb-3">{p.desc}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-md border border-rose-200 bg-rose-50/60 p-2 text-center">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 mx-auto" />
                <p className="text-lg font-bold text-rose-700 mt-1">{p.hazards}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Hazards</p>
              </div>
              <div className="rounded-md border border-indigo-200 bg-indigo-50/60 p-2 text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 mx-auto" />
                <p className="text-lg font-bold text-indigo-700 mt-1">{p.ccps}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">CCPs</p>
              </div>
              <div className="rounded-md border border-purple-200 bg-purple-50/60 p-2 text-center">
                <Activity className="h-3.5 w-3.5 text-purple-600 mx-auto" />
                <p className="text-lg font-bold text-purple-700 mt-1">{p.oprps}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">OPRPs</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Effective Date</p>
                <p className="font-semibold text-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{p.effectiveDate}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Next Review</p>
                <p className="font-semibold text-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{p.nextReview}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Food Safety Team Lead</p>
                <p className="font-semibold text-foreground">{p.teamLead}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Hazard types */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-600" />Hazard Types · 6 Categories</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Every hazard identified in HACCP analysis is classified into one of 6 types — each type drives the control measure (CCP, OPRP, or prerequisite program)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {hazardTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border p-3 ${t.color}`}>
              <div className="flex items-center gap-1.5">
                <t.icon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wide">{t.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk matrix */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-purple-600" />Risk Matrix · Likelihood (1-5) × Severity (1-5) = Risk Score</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Risk score drives the control category: LOW (1-5) → prerequisite program · MEDIUM (6-11) → OPRP · HIGH (12-19) → OPRP with monitoring · CRITICAL (20-25) → CCP mandatory</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-300 bg-slate-100 p-2 text-left">
                  <p className="font-bold text-slate-700">Likelihood ↓ / Severity →</p>
                </th>
                {severityLabels.map((s) => (
                  <th key={s} className="border border-slate-300 bg-slate-100 p-2 text-center min-w-[90px]">
                    <p className="font-bold text-slate-700">{s}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {likelihoodLabels.map((l, li) => (
                <tr key={l}>
                  <td className="border border-slate-300 bg-slate-100 p-2 text-left">
                    <p className="font-bold text-slate-700">{l}</p>
                  </td>
                  {severityLabels.map((s, si) => {
                    const score = (li + 1) * (si + 1)
                    const cat = riskCategory(score)
                    return (
                      <td key={s} className={`border border-slate-300 p-2 text-center ${cat.bg} ${cat.text}`}>
                        <p className="font-bold">{score}</p>
                        <p className="text-[9px] font-semibold">{cat.label}</p>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">LOW (1-5) — Prerequisite</Badge>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">MEDIUM (6-11) — OPRP</Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">HIGH (12-19) — OPRP + Monitoring</Badge>
          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300">CRITICAL (20-25) — CCP Mandatory</Badge>
        </div>
      </Card>

      {/* Hazard register */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-600" />Hazard Register · Representative Hazards (8 of 24)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each hazard records the HACCP plan, hazard description, type, likelihood, severity, computed risk score, control measure (CCP / OPRP), and risk category</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">HACCP Plan</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Hazard</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Type</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-700">L</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-700">S</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-700">Score</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Control Measure</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-700">Risk</th>
              </tr>
            </thead>
            <tbody>
              {planHazards.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-[10px]">{h.plan}</td>
                  <td className="border border-slate-300 p-2">{h.hazard}</td>
                  <td className="border border-slate-300 p-2"><Badge variant="outline" className="text-[9px]">{h.type}</Badge></td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{h.likelihood}</td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{h.severity}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold">{h.score}</td>
                  <td className="border border-slate-300 p-2 text-[10px]">{h.control}</td>
                  <td className="border border-slate-300 p-2 text-center"><Badge variant="outline" className={`text-[9px] ${riskStatusColor[h.status]}`}>{h.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── FS CCP Monitor ────────────────────────────────────────────────────
function FSCCPModule() {
  // 7 CCPs
  const ccps = [
    {
      code: 'CCP-001', name: 'Cooking Temperature', stage: 'Cooking (Kaju Katli)',
      hazard: 'Salmonella in raw cashew', hazardType: 'BIOLOGICAL',
      criticalMin: 110, criticalMax: null, target: 115, tolerance: 5, unit: '°C',
      monitoringMethod: 'SCADA PT-100 sensor (auto)', frequency: 'Continuous (1-min log)',
      monitoredBy: 'SCADA + Operator verify', lastReading: 110, lastStatus: 'WITHIN_LIMIT',
      lastChecked: '2026-02-18 14:35', correctiveAction: '— (within limit)',
      plan: 'HACCP-001 (Kaju Katli)',
    },
    {
      code: 'CCP-002', name: 'Metal Detection — Kaju Katli', stage: 'Packaging (Kaju Katli)',
      hazard: 'Metal fragment from grinder', hazardType: 'PHYSICAL',
      criticalMin: null, criticalMax: null, target: 0, tolerance: 0, unit: 'PASS/FAIL',
      monitoringMethod: 'Metal detector (Ferrous 1.5mm / Non-Ferrous 2.0mm / SS 2.5mm)', frequency: 'Every batch + hourly challenge test',
      monitoredBy: 'Metal Detector (auto) + Operator', lastReading: 'PASS', lastStatus: 'WITHIN_LIMIT',
      lastChecked: '2026-02-18 14:40', correctiveAction: '— (within limit)',
      plan: 'HACCP-001 (Kaju Katli)',
    },
    {
      code: 'CCP-003', name: 'Cooling Temperature', stage: 'Cooling (Kaju Katli)',
      hazard: 'Post-cook microbial growth', hazardType: 'BIOLOGICAL',
      criticalMin: null, criticalMax: 25, target: 24, tolerance: 1, unit: '°C',
      monitoringMethod: 'Cooling tunnel RTD sensor (auto)', frequency: 'Continuous (5-min log)',
      monitoredBy: 'SCADA + Operator verify', lastReading: 24, lastStatus: 'WITHIN_LIMIT',
      lastChecked: '2026-02-18 14:45', correctiveAction: '— (within limit)',
      plan: 'HACCP-001 (Kaju Katli)',
    },
    {
      code: 'CCP-004', name: 'Frying Oil Temperature', stage: 'Frying (Namkeen)',
      hazard: 'Under-fried product — oil absorption / pathogens', hazardType: 'BIOLOGICAL',
      criticalMin: 175, criticalMax: null, target: 182, tolerance: 7, unit: '°C',
      monitoringMethod: 'SCADA thermocouple (auto)', frequency: 'Continuous (1-min log)',
      monitoredBy: 'SCADA + Operator verify', lastReading: 182, lastStatus: 'WITHIN_LIMIT',
      lastChecked: '2026-02-18 14:30', correctiveAction: '— (within limit)',
      plan: 'HACCP-002 (Namkeen)',
    },
    {
      code: 'CCP-005', name: 'Metal Detection — Namkeen', stage: 'Packaging (Namkeen)',
      hazard: 'Metal fragment from fryer / seasoning drum', hazardType: 'PHYSICAL',
      criticalMin: null, criticalMax: null, target: 0, tolerance: 0, unit: 'PASS/FAIL',
      monitoringMethod: 'Metal detector (Ferrous 1.5mm / Non-Ferrous 2.0mm / SS 2.5mm)', frequency: 'Every batch + hourly challenge test',
      monitoredBy: 'Metal Detector (auto) + Operator', lastReading: 'FAIL', lastStatus: 'CRITICAL_BREACH',
      lastChecked: '2026-02-18 14:32', correctiveAction: 'Production paused · batch on hold · incident INC-FS-0042 raised · QA investigation in progress',
      plan: 'HACCP-002 (Namkeen)',
    },
    {
      code: 'CCP-006', name: 'Sugar Syrup Temperature', stage: 'Syrup Prep (Milk Sweets)',
      hazard: 'Insufficient sugar concentration — preservation failure', hazardType: 'CHEMICAL',
      criticalMin: 110, criticalMax: null, target: 112, tolerance: 2, unit: '°C',
      monitoringMethod: 'SCADA PT-100 sensor (auto)', frequency: 'Continuous (1-min log)',
      monitoredBy: 'SCADA + Operator verify', lastReading: 110, lastStatus: 'WITHIN_LIMIT',
      lastChecked: '2026-02-18 14:25', correctiveAction: '— (within limit)',
      plan: 'HACCP-003 (Milk Sweets)',
    },
    {
      code: 'CCP-007', name: 'Packaging Seal Integrity', stage: 'Packaging (Milk Sweets)',
      hazard: 'Seal failure — contamination / shelf-life', hazardType: 'PHYSICAL',
      criticalMin: null, criticalMax: null, target: 0, tolerance: 0, unit: 'PASS/FAIL',
      monitoringMethod: 'Seal-test (destructive) every 30 min + visual every pack', frequency: 'Every 30 min',
      monitoredBy: 'Operator + QA verify', lastReading: 'PASS', lastStatus: 'WITHIN_LIMIT',
      lastChecked: '2026-02-18 14:15', correctiveAction: '— (within limit)',
      plan: 'HACCP-003 (Milk Sweets)',
    },
  ]

  // CCP breach handling — 4-stage workflow
  const breachHandling = [
    {
      step: 1, code: 'DETECT', name: 'Breach Detected',
      icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300',
      desc: 'CCP reading exceeds critical limit (or PASS/FAIL = FAIL). SCADA or operator logs breach with timestamp and magnitude of deviation.',
    },
    {
      step: 2, code: 'PAUSE', name: 'Production Paused',
      icon: Pause, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300',
      desc: 'MES auto-pauses the production line. No further operations allowed. Operator override is disabled at the PLC level.',
    },
    {
      step: 3, code: 'HOLD', name: 'Batch on Hold + Alert',
      icon: StopCircle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300',
      desc: 'Affected batch(es) auto-quarantined to QA-HOLD location. Dispatch blocked. Real-time alerts sent to QA Manager, Production Head, and Plant Manager.',
    },
    {
      step: 4, code: 'INVESTIGATE', name: 'Incident + CAPA',
      icon: FileWarning, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-300',
      desc: 'Food safety incident auto-created in QMS. CAPA workflow initiated. Production cannot resume until QA Manager documents corrective actions and digitally signs the resume authorisation.',
    },
  ]

  const statusColor: Record<string, string> = {
    WITHIN_LIMIT: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    CRITICAL_BREACH: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-indigo-600" />CCP Monitor</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 54 · 7 Critical Control Points · 6 within limit · 1 critical breach · 124 checks today (122 passed · 2 breaches) · Each CCP records code, name, stage, hazard controlled, critical limits, target, tolerance, unit, monitoring method, frequency, monitored-by, last reading, last status, last-checked time, and corrective action</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export Log</Button>
          <Button size="sm" variant="outline"><Activity className="mr-1 h-4 w-4" />Breach History</Button>
          <Button size="sm"><ShieldCheck className="mr-1 h-4 w-4" />Record Check</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Within Limit</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">6</p>
        </Card>
        <Card className="p-3 border-rose-300 bg-rose-50/60">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Critical Breach</span><AlertTriangle className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Paused Lines</span><Pause className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-purple-200 bg-purple-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Open Incidents</span><FileWarning className="h-4 w-4 text-purple-600" /></div>
          <p className="text-xl font-bold text-purple-700 mt-1">1</p>
        </Card>
      </div>

      {/* CCP breach handling */}
      <Card className="p-5 bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Pause className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Pause className="h-4 w-4 text-rose-600" />CCP Breach Handling — Production Paused · Batch on Hold · Alert Generated</p>
            <p className="text-xs text-muted-foreground mt-1">A CCP breach is not a silent event. The system enforces a <span className="font-semibold text-rose-700">4-stage mandatory workflow</span> the moment any CCP reading crosses its critical limit: detection → production pause → batch hold + alerts → incident + CAPA. No resume is possible until the QA Manager signs off corrective actions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {breachHandling.map((s) => (
                <div key={s.code} className={`rounded-lg border p-3 ${s.bg}`}>
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Step {s.step}</span>
                  </div>
                  <p className={`font-semibold text-xs mt-1 ${s.color}`}>{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* CCP cards */}
      <div className="space-y-3">
        {ccps.map((c) => (
          <Card key={c.code} className={`p-4 ${c.lastStatus === 'CRITICAL_BREACH' ? 'border-rose-300 bg-rose-50/30' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{c.code}</span>
                  <Badge variant="outline" className={statusColor[c.lastStatus]}>
                    {c.lastStatus === 'WITHIN_LIMIT' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {c.lastStatus.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">{c.hazardType}</Badge>
                </div>
                <h3 className="text-base font-bold mt-1">{c.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.stage} · {c.plan}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  {c.unit === 'PASS/FAIL' ? (
                    c.lastStatus === 'WITHIN_LIMIT' ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <X className="h-6 w-6 text-rose-600" />
                  ) : (
                    <Thermometer className={`h-6 w-6 ${c.lastStatus === 'WITHIN_LIMIT' ? 'text-emerald-600' : 'text-rose-600'}`} />
                  )}
                  <span className={`text-2xl font-bold ${c.lastStatus === 'WITHIN_LIMIT' ? 'text-emerald-700' : 'text-rose-700'}`}>{c.lastReading}{c.unit !== 'PASS/FAIL' && c.unit}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Last checked {c.lastChecked}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Hazard Controlled</p>
                <p className="font-semibold text-foreground">{c.hazard}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Critical Limits</p>
                <p className="font-semibold text-foreground font-mono">
                  {c.criticalMin !== null ? `≥ ${c.criticalMin}${c.unit}` : ''}
                  {c.criticalMin !== null && c.criticalMax !== null ? ' / ' : ''}
                  {c.criticalMax !== null ? `≤ ${c.criticalMax}${c.unit}` : ''}
                  {c.criticalMin === null && c.criticalMax === null ? `${c.unit} (binary)` : ''}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Target / Tolerance</p>
                <p className="font-semibold text-foreground font-mono">{c.target}{c.unit !== 'PASS/FAIL' && c.unit} ± {c.tolerance}{c.unit !== 'PASS/FAIL' && c.unit}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Frequency</p>
                <p className="font-semibold text-foreground">{c.frequency}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Monitoring Method</p>
                <p className="font-semibold text-foreground">{c.monitoringMethod}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Monitored By</p>
                <p className="font-semibold text-foreground">{c.monitoredBy}</p>
              </div>
              <div className="md:col-span-1">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Unit</p>
                <p className="font-semibold text-foreground font-mono">{c.unit}</p>
              </div>
            </div>
            {c.lastStatus === 'CRITICAL_BREACH' && (
              <div className="mt-3 pt-3 border-t border-rose-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-rose-700">Corrective Action — Production Paused · Batch on Hold</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.correctiveAction}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="text-[10px] h-7"><FileWarning className="mr-1 h-3 w-3" />View Incident</Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-7"><Pause className="mr-1 h-3 w-3" />Line Status</Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-7"><ShieldCheck className="mr-1 h-3 w-3" />Resume (QA Only)</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── FS Environmental Monitoring & Sanitation ──────────────────────────
function FSEnvironmentalModule() {
  // 4 EMP samples
  const empSamples = [
    {
      code: 'EMP-0123', type: 'HAND_SWAB', typeLabel: 'Hand Swab',
      zone: 'ZONE_1', zoneLabel: 'Zone 1 — Product Contact',
      location: 'Line 1 Operator Station (Kaju Katli)', scheduledDate: '2026-02-18',
      testType: 'COLIFORM', result: '12 CFU/cm² (coliform positive)', status: 'FAIL',
      alertLevel: 'HIGH',
      desc: 'Operator hand swab tested positive for coliform at 12 CFU/cm² — limit is < 10 CFU/cm². Corrective: retraining + hand-wash verification + retest in 24h.',
    },
    {
      code: 'EMP-0122', type: 'SURFACE_SWAB', typeLabel: 'Surface Swab',
      zone: 'ZONE_1', zoneLabel: 'Zone 1 — Product Contact',
      location: 'Kaju Katli Cooling Table — Surface', scheduledDate: '2026-02-18',
      testType: 'TPC', result: '8 CFU/cm² (TPC within limit)', status: 'PASS',
      alertLevel: 'NONE',
      desc: 'Surface swab of cooling table — Total Plate Count 8 CFU/cm² (limit < 100 CFU/cm²). Within specification.',
    },
    {
      code: 'EMP-0121', type: 'DRAIN_SAMPLE', typeLabel: 'Drain Sample',
      zone: 'ZONE_3', zoneLabel: 'Zone 3 — Non-Product / Drain',
      location: 'Plant 1 — Floor Drain D-04 (Namkeen area)', scheduledDate: '2026-02-18',
      testType: 'LISTERIA', result: 'Not Detected (Listeria spp.)', status: 'PASS',
      alertLevel: 'NONE',
      desc: 'Drain swab tested for Listeria spp. — Not Detected. Zone 3 monitoring per EMP schedule.',
    },
    {
      code: 'EMP-0120', type: 'WATER_SAMPLE', typeLabel: 'Water Sample',
      zone: 'ZONE_2', zoneLabel: 'Zone 2 — Non-Product Contact / Utility',
      location: 'RO Plant Output — Main Distribution Loop', scheduledDate: '2026-02-18',
      testType: 'TPC', result: '< 1 CFU/mL (TPC within limit)', status: 'PASS',
      alertLevel: 'NONE',
      desc: 'Plant process water (RO output) — TPC < 1 CFU/mL (limit < 100 CFU/mL). Within specification.',
    },
  ]

  // 3 sanitation records
  const sanitationRecords = [
    {
      code: 'SAN-0089', type: 'PRE_PRODUCTION', typeLabel: 'Pre-Production',
      area: 'Line 1 — Kaju Katli (Mixer, Grinder, Cooling Table)',
      chemicalUsed: 'Caustic 2% + Peracetic Acid 0.5%',
      contactTime: '15 min caustic + 5 min PAA',
      verificationMethod: 'ATP_TEST', verificationLabel: 'ATP Test',
      atpReading: 12, atpLimit: 30, atpUnit: 'RLU',
      result: 'PASS', verifiedBy: 'S. Pawar (Sanitation Lead)',
      verifiedAt: '2026-02-18 06:30',
      desc: 'Pre-production sanitation of Line 1. ATP 12 RLU vs limit 30 RLU — PASS. Line released for production.',
    },
    {
      code: 'SAN-0088', type: 'BETWEEN_PRODUCT', typeLabel: 'Between-Product',
      area: 'Line 2 — Namkeen (Fryer, Seasoning Drum, Conveyor)',
      chemicalUsed: 'Caustic 3% + Hot Water 80°C rinse',
      contactTime: '20 min caustic + 10 min hot rinse',
      verificationMethod: 'ATP_TEST', verificationLabel: 'ATP Test',
      atpReading: 45, atpLimit: 30, atpUnit: 'RLU',
      result: 'FAIL', verifiedBy: 'S. Pawar (Sanitation Lead)',
      verifiedAt: '2026-02-18 11:45',
      desc: 'Between-product sanitation after allergen-containing namkeen batch. ATP 45 RLU > limit 30 RLU — FAIL. Re-cleaning required before next product changeover.',
    },
    {
      code: 'SAN-0087', type: 'END_OF_DAY', typeLabel: 'End-of-Day',
      area: 'Plant 1 — All Lines + Floors + Drains',
      chemicalUsed: 'Caustic 2% + Quaternary Ammonium 0.2%',
      contactTime: '30 min caustic + 15 min QAC + rinse',
      verificationMethod: 'VISUAL', verificationLabel: 'Visual',
      atpReading: null, atpLimit: null, atpUnit: '—',
      result: 'PASS', verifiedBy: 'R. Nair (Shift Supervisor)',
      verifiedAt: '2026-02-18 22:15',
      desc: 'End-of-day plant sanitation. Visual inspection verified — no residue, no soil, no standing water. Floors and drains sanitised.',
    },
  ]

  const empTypeColor: Record<string, string> = {
    SURFACE_SWAB: 'bg-blue-100 text-blue-700 border-blue-300',
    DRAIN_SAMPLE: 'bg-amber-100 text-amber-700 border-amber-300',
    HAND_SWAB: 'bg-purple-100 text-purple-700 border-purple-300',
    WATER_SAMPLE: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  }
  const zoneColor: Record<string, string> = {
    ZONE_1: 'bg-rose-100 text-rose-700 border-rose-300',
    ZONE_2: 'bg-amber-100 text-amber-700 border-amber-300',
    ZONE_3: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  const empStatusColor: Record<string, string> = {
    PASS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    FAIL: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const alertLevelColor: Record<string, string> = {
    NONE: 'bg-slate-100 text-slate-700 border-slate-300',
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
    HIGH: 'bg-rose-100 text-rose-700 border-rose-300',
    CRITICAL: 'bg-rose-600 text-white border-rose-700',
  }
  const sanTypeColor: Record<string, string> = {
    PRE_PRODUCTION: 'bg-blue-100 text-blue-700 border-blue-300',
    BETWEEN_PRODUCT: 'bg-amber-100 text-amber-700 border-amber-300',
    END_OF_DAY: 'bg-slate-100 text-slate-700 border-slate-300',
    DEEP_CLEAN: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const sanResultColor: Record<string, string> = {
    PASS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    FAIL: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const verificationIcon: Record<string, typeof Beaker> = {
    ATP_TEST: Activity,
    VISUAL: CheckCircle2,
    MICROBIOLOGY: Microscope,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Microscope className="h-6 w-6 text-cyan-600" />Environmental Monitoring & Sanitation</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 54 · 4 EMP samples (1 fail · 3 pass) · 3 sanitation records (2 pass · 1 fail) · EMP covers Zone 1 (product contact), Zone 2 (non-product / utility), Zone 3 (drain / non-product) · Sanitation covers pre-production, between-product, end-of-day, deep-clean with ATP / visual / microbiology verification</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />EMP Schedule</Button>
          <Button size="sm" variant="outline"><Droplets className="mr-1 h-4 w-4" />Sanitation Log</Button>
          <Button size="sm"><Microscope className="mr-1 h-4 w-4" />New EMP Sample</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 border-cyan-200 bg-cyan-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">EMP Samples</span><Microscope className="h-4 w-4 text-cyan-600" /></div>
          <p className="text-xl font-bold text-cyan-700 mt-1">4</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">EMP Passed</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">3</p>
        </Card>
        <Card className="p-3 border-rose-300 bg-rose-50/60">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">EMP Failed</span><X className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-teal-200 bg-teal-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Sanitation Verified</span><Droplets className="h-4 w-4 text-teal-600" /></div>
          <p className="text-xl font-bold text-teal-700 mt-1">2 of 3</p>
        </Card>
      </div>

      {/* EMP samples */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Microscope className="h-4 w-4 text-cyan-600" />Environmental Monitoring Program (EMP) · 4 Samples</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each EMP sample records code, type (surface swab / drain / hand swab / water), zone (1/2/3), location, scheduled date, test type (TPC / Listeria / Coliform), result, status (PASS/FAIL), and alert level</p>
        </div>
        <div className="space-y-3">
          {empSamples.map((s) => (
            <div key={s.code} className={`rounded-lg border p-3 ${s.status === 'FAIL' ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{s.code}</span>
                    <Badge variant="outline" className={`text-[9px] ${empTypeColor[s.type]}`}>{s.typeLabel}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${zoneColor[s.zone]}`}>{s.zoneLabel}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${empStatusColor[s.status]}`}>
                      {s.status === 'PASS' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                      {s.status}
                    </Badge>
                    <Badge variant="outline" className={`text-[9px] ${alertLevelColor[s.alertLevel]}`}>Alert: {s.alertLevel}</Badge>
                  </div>
                  <p className="text-sm font-bold mt-1">{s.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Test Type</p>
                  <Badge variant="outline" className="text-[10px]">{s.testType}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] mb-2">
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Scheduled Date</p>
                  <p className="font-semibold text-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{s.scheduledDate}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Result</p>
                  <p className={`font-semibold ${s.status === 'FAIL' ? 'text-rose-700' : 'text-emerald-700'}`}>{s.result}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">{s.desc}</p>
              {s.status === 'FAIL' && (
                <div className="mt-2 pt-2 border-t border-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <p className="text-[10px] text-rose-700 font-semibold">Corrective Action Triggered — retrain operator · verify hand-wash protocol · retest in 24 hours · quarantine affected production window</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Sanitation records */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Droplets className="h-4 w-4 text-teal-600" />Sanitation Records · 3 Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each sanitation record captures code, type (pre-production / between-product / end-of-day / deep-clean), area, chemical used, contact time, verification method (ATP / visual / microbiology), ATP reading vs limit, result, verified-by, and status</p>
        </div>
        <div className="space-y-3">
          {sanitationRecords.map((r) => {
            const VIcon = verificationIcon[r.verificationMethod] || CheckCircle2
            return (
              <div key={r.code} className={`rounded-lg border p-3 ${r.result === 'FAIL' ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">{r.code}</span>
                      <Badge variant="outline" className={`text-[9px] ${sanTypeColor[r.type]}`}>{r.typeLabel}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${sanResultColor[r.result]}`}>
                        {r.result === 'PASS' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        {r.result}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]"><VIcon className="h-3 w-3 mr-1" />{r.verificationLabel}</Badge>
                    </div>
                    <p className="text-sm font-bold mt-1">{r.area}</p>
                  </div>
                  {r.atpReading !== null && (
                    <div className="text-right shrink-0">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">ATP Reading</p>
                      <p className={`text-lg font-bold ${r.result === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {r.atpReading} <span className="text-xs font-normal text-muted-foreground">/ {r.atpLimit} {r.atpUnit}</span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] mb-2">
                  <div className="md:col-span-2">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Chemical Used</p>
                    <p className="font-semibold text-foreground">{r.chemicalUsed}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Contact Time</p>
                    <p className="font-semibold text-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{r.contactTime}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Verification Method</p>
                    <p className="font-semibold text-foreground flex items-center gap-1"><VIcon className="h-3 w-3" />{r.verificationLabel}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Verified By</p>
                    <p className="font-semibold text-foreground">{r.verifiedBy}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Verified At</p>
                    <p className="font-semibold text-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{r.verifiedAt}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">{r.desc}</p>
                {r.result === 'FAIL' && (
                  <div className="mt-2 pt-2 border-t border-rose-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <p className="text-[10px] text-rose-700 font-semibold">Re-Cleaning Required — line blocked for next product changeover until ATP re-test passes (≤ 30 RLU) and QA verifies</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ─── FS Allergen Matrix & Food Defense ─────────────────────────────────
function FSAllergenModule() {
  // 4 allergen matrix entries (representative of 15 allergen products)
  const allergenMatrix = [
    {
      productCode: 'PROD-KK-500', productName: 'Kaju Katli 500g', family: 'Dry Fruit Sweets',
      allergens: ['Tree Nuts'],
      contains: ['Tree Nuts'], mayContain: [],
      dedicatedEquipment: true, cleaningValidation: true, sequencingRequired: false,
      lastCleaningValidation: '2026-02-15 14:00', lastSequencingReview: '— (N/A — dedicated line)',
      labelDeclaration: 'CONTAINS: Tree Nuts (Cashew)', status: 'VERIFIED',
    },
    {
      productCode: 'PROD-KK-KESAR', productName: 'Kesar Kaju Katli 250g', family: 'Dry Fruit Sweets',
      allergens: ['Tree Nuts', 'Milk'],
      contains: ['Tree Nuts', 'Milk'], mayContain: [],
      dedicatedEquipment: true, cleaningValidation: true, sequencingRequired: false,
      lastCleaningValidation: '2026-02-16 09:30', lastSequencingReview: '— (N/A — dedicated line)',
      labelDeclaration: 'CONTAINS: Tree Nuts (Cashew), Milk', status: 'VERIFIED',
    },
    {
      productCode: 'PROD-GJ-400', productName: 'Gulab Jamun 400g', family: 'Dairy Sweets',
      allergens: ['Milk', 'Gluten'],
      contains: ['Milk', 'Gluten'], mayContain: ['Tree Nuts'],
      dedicatedEquipment: false, cleaningValidation: true, sequencingRequired: true,
      lastCleaningValidation: '2026-02-18 07:00', lastSequencingReview: '2026-02-15 16:00',
      labelDeclaration: 'CONTAINS: Milk, Gluten. MAY CONTAIN: Tree Nuts', status: 'VERIFIED',
    },
    {
      productCode: 'PROD-NM-MIX', productName: 'Mixed Namkeen 200g', family: 'Savoury Snacks',
      allergens: ['Soy', 'Gluten'],
      contains: ['Soy', 'Gluten'], mayContain: ['Peanuts', 'Sesame'],
      dedicatedEquipment: false, cleaningValidation: true, sequencingRequired: true,
      lastCleaningValidation: '2026-02-18 11:45', lastSequencingReview: '2026-02-17 18:00',
      labelDeclaration: 'CONTAINS: Soy, Gluten. MAY CONTAIN: Peanuts, Sesame', status: 'VERIFIED',
    },
  ]

  // 8 FSSAI-mandated allergens
  const fssaiAllergens = [
    { code: 'MILK', name: 'Milk', icon: Droplets, color: 'bg-cyan-100 text-cyan-700 border-cyan-300', desc: 'Milk and milk products (including lactose)' },
    { code: 'TREE_NUTS', name: 'Tree Nuts', icon: ShieldAlert, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Almond, cashew, walnut, pecan, pistachio, hazelnut, brazil nut, macadamia' },
    { code: 'PEANUTS', name: 'Peanuts', icon: ShieldAlert, color: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Peanuts and peanut products (legume family)' },
    { code: 'SESAME', name: 'Sesame', icon: ShieldAlert, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', desc: 'Sesame seeds and sesame-derived products' },
    { code: 'SOY', name: 'Soy', icon: Beaker, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: 'Soybeans and soy products (lecithin, protein, sauce)' },
    { code: 'GLUTEN', name: 'Gluten', icon: Beaker, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Wheat, rye, barley, oats and their derivatives (Celiac concern)' },
    { code: 'MUSTARD', name: 'Mustard', icon: Beaker, color: 'bg-rose-100 text-rose-700 border-rose-300', desc: 'Mustard seeds and mustard-derived products' },
    { code: 'SULPHITES', name: 'Sulphites', icon: Beaker, color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Sulphur dioxide and sulphites > 10 mg/kg (asthma concern)' },
  ]

  // Food defense plan — 5 controls
  const defenseControls = [
    { code: 'FACILITY_SECURITY', name: 'Facility Security', icon: ShieldCheck, status: 'VERIFIED', desc: 'Perimeter fencing, CCTV coverage, access control at all entry points, visitor badge required' },
    { code: 'RESTRICTED_AREAS', name: 'Restricted Areas', icon: ShieldAlert, status: 'VERIFIED', desc: 'Production floor, raw material store, labelling station — access restricted to authorised personnel only' },
    { code: 'VISITOR_MANAGEMENT', name: 'Visitor Management', icon: QrCode, status: 'VERIFIED', desc: 'Visitor pre-registration, escorted access, badge logging, sign-in/out audit trail' },
    { code: 'TAMPER_DETECTION', name: 'Tamper Detection', icon: AlertTriangle, status: 'VERIFIED', desc: 'Tamper-evident seals on packaging, shrink-bands on retail jars, periodic seal-integrity checks' },
    { code: 'INTENTIONAL_CONTAMINATION', name: 'Intentional Contamination Prevention', icon: ShieldCheck, status: 'VERIFIED', desc: 'Vulnerability assessment (TACCP), ingredient supply-chain integrity, sealed-supplier program, recall readiness' },
  ]

  // Food fraud — 12 assessments (representative 6 shown)
  const fraudAssessments = [
    { code: 'FFA-006', ingredient: 'Cashew W240', supplier: 'Mumbai Dry Fruits Pvt Ltd', risk: 'HIGH', vulnerability: 'Substitution with cheaper grades, country-of-origin mislabelling', mitigation: 'Supplier audit + DNA/barcode testing quarterly + CoA per batch' },
    { code: 'FFA-007', ingredient: 'Saffron (Kesar)', supplier: 'Kashmir Saffron Co-op', risk: 'HIGH', vulnerability: 'Adulteration with corn-silk or synthetic dyes, dilution', mitigation: 'ISO 3632 spectrophotometric test every batch + supplier direct (co-op)' },
    { code: 'FFA-008', ingredient: 'Milk (Raw)', supplier: 'Local Dairy Cooperative', risk: 'MEDIUM', vulnerability: 'Adulteration with water, urea, melamine', mitigation: 'Lactometer + urea test + daily mass-balance reconciliation' },
    { code: 'FFA-009', ingredient: 'Edible Oil (Palm)', supplier: 'Refined Oils India Ltd', risk: 'MEDIUM', vulnerability: 'Substitution with lower-grade oil, mixed-origin oils', mitigation: 'Fatty-acid profile test monthly + supplier CoA per tanker' },
    { code: 'FFA-010', ingredient: 'Wheat Flour (Maida)', supplier: 'Pune Roller Flour Mill', risk: 'MEDIUM', vulnerability: 'Bran contamination, ash content misrepresentation', mitigation: 'Ash + moisture test per batch + supplier audit annually' },
    { code: 'FFA-011', ingredient: 'Sugar (S-30)', supplier: 'Sugar Syndicate Maharashtra', risk: 'LOW', vulnerability: 'Low risk — commodity, well-regulated', mitigation: 'Routine CoA verification + visual inspection' },
  ]

  const matrixStatusColor: Record<string, string> = {
    VERIFIED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    REVIEW: 'bg-orange-100 text-orange-700 border-orange-300',
  }
  const defenseStatusColor: Record<string, string> = {
    VERIFIED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    FAILED: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const fraudRiskColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
    HIGH: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-amber-600" />Allergen Matrix & Food Defense</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 54 · 15 allergen products (4 representative) · 8 FSSAI-mandated allergens · 0 cross-contact incidents · Food defense plan ACTIVE (5 of 5 controls verified) · 12 food fraud assessments (2 high · 4 medium · 6 low)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Allergen Report</Button>
          <Button size="sm" variant="outline"><ShieldCheck className="mr-1 h-4 w-4" />Defense Plan</Button>
          <Button size="sm"><ShieldAlert className="mr-1 h-4 w-4" />New Assessment</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Allergen Products</span><ShieldAlert className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">15</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Cross-Contact Incidents</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">0</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Food Defense</span><ShieldCheck className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">ACTIVE</p>
        </Card>
        <Card className="p-3 border-purple-200 bg-purple-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Fraud Assessments</span><FileWarning className="h-4 w-4 text-purple-600" /></div>
          <p className="text-xl font-bold text-purple-700 mt-1">12</p>
        </Card>
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">High-Risk Fraud</span><AlertTriangle className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">2</p>
        </Card>
      </div>

      {/* Allergen matrix */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" />Allergen Matrix · 4 Representative Products</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each product records declared allergens (CONTAINS / MAY CONTAIN), dedicated-equipment flag, cleaning-validation requirement, sequencing requirement, last validation date, and label declaration text</p>
        </div>
        <div className="space-y-3">
          {allergenMatrix.map((m) => (
            <div key={m.productCode} className="rounded-lg border border-slate-200 bg-slate-50/30 p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{m.productCode}</span>
                    <Badge variant="outline" className={`text-[9px] ${matrixStatusColor[m.status]}`}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />{m.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold mt-1">{m.productName} <span className="text-[10px] font-normal text-muted-foreground">· {m.family}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] mb-2">
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Contains</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {m.contains.map((a) => (
                      <Badge key={a} variant="outline" className="bg-rose-100 text-rose-700 border-rose-300 text-[9px]">{a}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">May Contain</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {m.mayContain.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic">— (none)</span>
                    ) : m.mayContain.map((a) => (
                      <Badge key={a} variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-[9px]">{a}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Dedicated Equipment</p>
                  <p className={`font-semibold ${m.dedicatedEquipment ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {m.dedicatedEquipment ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : <X className="inline h-3 w-3 mr-1" />}
                    {m.dedicatedEquipment ? 'Yes (dedicated)' : 'No (shared)'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Cleaning Validation</p>
                  <p className={`font-semibold ${m.cleaningValidation ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {m.cleaningValidation ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : <X className="inline h-3 w-3 mr-1" />}
                    {m.cleaningValidation ? 'Required & Verified' : 'Required — Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Sequencing Required</p>
                  <p className={`font-semibold ${m.sequencingRequired ? 'text-amber-700' : 'text-slate-600'}`}>
                    {m.sequencingRequired ? <AlertTriangle className="inline h-3 w-3 mr-1" /> : <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                    {m.sequencingRequired ? 'Yes — schedule enforced' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Last Cleaning Validation</p>
                  <p className="font-semibold text-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{m.lastCleaningValidation}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Last Sequencing Review</p>
                  <p className="font-semibold text-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{m.lastSequencingReview}</p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Label Declaration</p>
                  <p className="font-semibold text-foreground font-mono text-[10px]">{m.labelDeclaration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 8 FSSAI allergens */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" />8 FSSAI-Mandated Allergens · Per Product Declaration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">FSSAI Food Safety and Standards (Labelling) Regulations require declaration of 8 allergen categories on pre-packaged food labels — the allergen matrix tracks each against every SKU</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {fssaiAllergens.map((a) => (
            <div key={a.code} className={`rounded-lg border p-3 ${a.color}`}>
              <div className="flex items-center gap-1.5">
                <a.icon className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wide">{a.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{a.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Food defense plan */}
      <Card className="p-5 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-300">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Food Defense Plan · ACTIVE · 5 of 5 Controls Verified</p>
            <p className="text-xs text-muted-foreground mt-1">Food defense (TACCP — Threat Assessment & Critical Control Point) protects against intentional contamination, tampering, and food fraud. All 5 control categories are verified and audited monthly.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {defenseControls.map((d) => (
            <div key={d.code} className={`rounded-lg border p-3 ${defenseStatusColor[d.status]}`}>
              <div className="flex items-center gap-1.5">
                <d.icon className="h-4 w-4 shrink-0" />
                {d.status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3 ml-auto" />}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wide mt-2">{d.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{d.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Food fraud assessments */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><FileWarning className="h-4 w-4 text-purple-600" />Food Fraud (VACCP) Assessments · 12 Total (6 representative shown)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Vulnerability Assessment & Critical Control Point — each ingredient is assessed for fraud vulnerability (substitution, adulteration, mislabelling). 2 high-risk · 4 medium-risk · 6 low-risk · 2 high-risk ingredients (cashew, saffron) require batch-level testing.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Code</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Ingredient</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Supplier</th>
                <th className="border border-slate-300 p-2 text-center font-bold text-slate-700">Risk</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Vulnerability</th>
                <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {fraudAssessments.map((f) => (
                <tr key={f.code} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 font-mono text-[10px]">{f.code}</td>
                  <td className="border border-slate-300 p-2 font-semibold">{f.ingredient}</td>
                  <td className="border border-slate-300 p-2">{f.supplier}</td>
                  <td className="border border-slate-300 p-2 text-center"><Badge variant="outline" className={`text-[9px] ${fraudRiskColor[f.risk]}`}>{f.risk}</Badge></td>
                  <td className="border border-slate-300 p-2 text-[10px]">{f.vulnerability}</td>
                  <td className="border border-slate-300 p-2 text-[10px]">{f.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">LOW: 6</Badge>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">MEDIUM: 4</Badge>
          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300">HIGH: 2</Badge>
        </div>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 54 — FOOD SAFETY MODULE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
// 1. FSDashboardModule        — KPIs (20) · food safety flow (8 stages) ·
//                                Chief Architect CCP escalation (6 stages) ·
//                                2 active alert panels
// 2. FSHACCPModule            — 4 HACCP plans · 6 hazard types ·
//                                risk matrix (5×5) · hazard register (8 rows)
// 3. FSCCPModule              — 7 CCPs (6 within · 1 breach) ·
//                                CCP breach handling (4 stages) · per-CCP cards
// 4. FSEnvironmentalModule    — 4 EMP samples (3 pass · 1 fail) ·
//                                3 sanitation records (2 pass · 1 fail) ·
//                                ATP / visual / microbiology verification
// 5. FSAllergenModule         — 4 allergen-matrix products · 8 FSSAI allergens ·
//                                food defense (5 controls) ·
//                                food fraud VACCP (6 of 12 assessments)
//
// TOTAL: 5 modules · 0 function-name conflicts · 0 missing-icon imports
// (SprayCan not imported → Droplets used as fallback per spec)
// ═══════════════════════════════════════════════════════════════════════════════
