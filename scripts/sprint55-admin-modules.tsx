// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 55 — NON-CONFORMANCE (NCR) · DEVIATION MANAGEMENT · QUALITY INCIDENT CONTROL
// Admin modules: NCR & Incident Dashboard, Deviation Management,
// Quarantine Dashboard, Root Cause & Risk Assessment
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: 25 of 26 requested icons are ALREADY imported in
// src/app/page.tsx (lines 4–34). No new icon imports needed. Verified icons:
//   FileWarning (31), AlertTriangle (14/27), AlertCircle (5/20), ShieldAlert (24),
//   ShieldCheck (13/32), CheckCircle2 (11), X (16), Lock (5/29), Clock (17),
//   Activity (15/25), Search (7/22), GitBranch (12), Brain (9), TrendingUp (17),
//   TrendingDown (17), Pause (33), Play (33), Package (10), PackageX (33),
//   IndianRupee (17), ArrowRight (6), Plus (7), Download (11), History (13/22),
//   Target (30)
//
// Unlock is NOT imported in src/app/page.tsx. Per task spec fallback rule,
// CheckCircle2 (already imported, line 11) is used in its place for
// unlocked / released quarantine items (green check = released from hold).
//
// CONFLICT NOTE: grep of `^function.*Module` in src/app/page.tsx against
// (ncr|deviation|quarantine|incident|root.cause|risk|disposition|escalation)
// returned ONE existing collision:
//   - IQCNCRRModule (line 28436)  — IQC-prefixed NCR module (legacy register)
// Per task spec, ALL Sprint 55 modules use the `NCR` prefix to avoid any
// naming collision with the existing IQC module:
//   NCRDashboardModule, NCRDeviationModule,
//   NCRQuarantineModule, NCRInvestigationModule
// Zero residual collisions.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── NCR & Incident Dashboard ─────────────────────────────────────────
function NCRDashboardModule() {
  // KPIs — 48 total NCRs · 8 open · 3 investigating · 2 disposition pending · 35 closed
  // 2 critical · 1 food safety critical · 12 major · 33 minor
  // 4 quarantined batches (₹84,000) · 5 deviations open · 18 approved · 2 rejected
  // avg closure 4.5 days · 3 active escalations
  const totalNCRs = 48
  const quarantinedValue = 84000

  const kpis = [
    { label: 'Total NCRs', value: String(totalNCRs), unit: 'all time · 5 shown below', icon: FileWarning, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Open NCRs', value: '8', unit: 'awaiting acknowledgement', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Investigating', value: '3', unit: 'root cause in progress', icon: Search, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Disposition Pending', value: '2', unit: 'awaiting decision', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Closed NCRs', value: '35', unit: 'resolution complete', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Critical', value: '2', unit: 'CRITICAL severity', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Food Safety Critical', value: '1', unit: 'CCP / consumer safety risk', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Major', value: '12', unit: 'MAJOR severity', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Minor', value: '33', unit: 'MINOR severity', icon: Activity, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
    { label: 'Quarantined Batches', value: '4', unit: `₹${quarantinedValue.toLocaleString('en-IN')} value on hold`, icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Deviations Open', value: '5', unit: 'awaiting review', icon: GitBranch, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Deviations Approved', value: '18', unit: 'use-as-is / conditional', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Deviations Rejected', value: '2', unit: 'rework / reject / destroy', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Avg Closure Time', value: '4.5', unit: 'days (target ≤ 5 days)', icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Active Escalations', value: '3', unit: '1 plant head · 2 QA head', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  ]

  // 5 NCRs (latest) — full detail per spec
  const ncrs = [
    {
      number: 'NCR-00048',
      source: 'CCP_MONITORING',
      sourceLabel: 'CCP Monitoring',
      batch: 'BATCH-NM-26F007',
      product: 'Namkeen (250g pouch)',
      incidentType: 'METAL_DETECTION_FAILURE',
      incidentLabel: 'Metal Detection Failure',
      description: 'Metal detector on NM-LINE-02 failed ferrous 1.5mm test piece during CCP verification at 14:32. Line paused immediately. Suspected metal fragment in batch produced 14:00–14:30.',
      severity: 'FOOD_SAFETY_CRITICAL',
      reportedBy: 'SCADA Auto-Alert',
      reportedAt: '2026-02-18 14:32',
      quarantined: true,
      qty: '250 kg',
      status: 'INVESTIGATING',
      assignedTo: 'R. Iyer (QA Lead)',
      escalationLevel: 'L3',
      escalatedTo: 'Plant Head',
    },
    {
      number: 'NCR-00047',
      source: 'IPQC_CHECK',
      sourceLabel: 'IPQC Check',
      batch: 'BATCH-MT-26E012',
      product: 'Motichoor Laddu (1kg box)',
      incidentType: 'SUGAR_CRYSTALLIZATION',
      incidentLabel: 'Sugar Crystallization',
      description: 'Sugar syrup crystallization detected in Motichoor Laddu batch — grain size exceeds 80 mesh; product texture compromised. IPQC sample at cooling stage flagged.',
      severity: 'MAJOR',
      reportedBy: 'S. Kulkarni (QA Lead)',
      reportedAt: '2026-02-18 11:15',
      quarantined: true,
      qty: '2 kg',
      status: 'DISPOSITION_PENDING',
      assignedTo: 'S. Kulkarni (QA Lead)',
      escalationLevel: 'L2',
      escalatedTo: 'QA Manager',
    },
    {
      number: 'NCR-00046',
      source: 'CUSTOMER_COMPLAINT',
      sourceLabel: 'Customer Complaint',
      batch: 'BATCH-KK-26D098',
      product: 'Kaju Katli (500g box)',
      incidentType: 'TASTE_DEVIATION',
      incidentLabel: 'Taste Deviation',
      description: 'Customer complaint (CMP-00342) — taste deviation reported on Kaju Katli batch KK-26D098; described as “off / soapy aftertaste.” Sample retention pulled for sensory + rancidity test.',
      severity: 'CRITICAL',
      reportedBy: 'Customer Care',
      reportedAt: '2026-02-17 18:05',
      quarantined: true,
      qty: '96 pcs',
      status: 'INVESTIGATING',
      assignedTo: 'Dr. A. Mehta (QA Manager)',
      escalationLevel: 'L2',
      escalatedTo: 'QA Head',
    },
    {
      number: 'NCR-00045',
      source: 'IQC_REJECTION',
      sourceLabel: 'IQC Rejection',
      batch: 'BATCH-CH-26C045',
      product: 'Red Chilli Powder (Raw Material)',
      incidentType: 'SPECIFICATION_DEVIATION',
      incidentLabel: 'Specification Deviation',
      description: 'IQC rejection — Red Chilli powder received lot CH-26C045 failed colour value spec (ASTA 38 vs required ≥ 42) and moisture 9.8% vs ≤ 8%. Batch returned to supplier with debit note.',
      severity: 'CRITICAL',
      reportedBy: 'IQC Inspector — Priya N.',
      reportedAt: '2026-02-15 09:40',
      quarantined: false,
      qty: '50 kg (returned)',
      status: 'CLOSED',
      assignedTo: 'Procurement Team',
      escalationLevel: 'L1',
      escalatedTo: 'QA Supervisor',
    },
    {
      number: 'NCR-00044',
      source: 'FGQC_CHECK',
      sourceLabel: 'FGQC Check',
      batch: 'BATCH-NM-26B021',
      product: 'Namkeen (500g pouch)',
      incidentType: 'PACKAGING_DEFECT',
      incidentLabel: 'Packaging Defect',
      description: 'FGQC identified seal wrinkle on 18 pouches of 500g Namkeen batch NM-26B021. Seal integrity test passed but visual reject per AQL. Rework — re-sealed and re-inspected.',
      severity: 'MINOR',
      reportedBy: 'FGQC Operator — Mahesh K.',
      reportedAt: '2026-02-13 16:22',
      quarantined: false,
      qty: '18 pouches',
      status: 'CLOSED',
      assignedTo: 'Packaging Supervisor',
      escalationLevel: 'L1',
      escalatedTo: 'QA Supervisor',
    },
  ]

  // 12 NCR source modules
  const sourceModules = [
    { code: 'IQC_REJECTION', name: 'IQC Rejection', icon: ShieldCheck, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'IPQC_CHECK', name: 'IPQC Check', icon: Beaker, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'FGQC_CHECK', name: 'FGQC Check', icon: CheckCircle2, color: 'bg-teal-100 text-teal-700 border-teal-300' },
    { code: 'CCP_MONITORING', name: 'CCP Monitoring', icon: ShieldAlert, color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { code: 'CUSTOMER_COMPLAINT', name: 'Customer Complaint', icon: AlertCircle, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { code: 'INTERNAL_AUDIT', name: 'Internal Audit', icon: FileText, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'REGULATORY_FINDING', name: 'Regulatory Finding', icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'SUPPLIER_DEVIATION', name: 'Supplier Deviation', icon: GitBranch, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { code: 'PROCESS_AUDIT', name: 'Process Audit', icon: Activity, color: 'bg-sky-100 text-sky-700 border-sky-300' },
    { code: 'EMP_FAILURE', name: 'EMP Failure', icon: Microscope, color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
    { code: 'STORAGE_DEVIATION', name: 'Storage Deviation', icon: Package, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'TRANSPORT_DAMAGE', name: 'Transport Damage', icon: PackageX, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ]

  // 12 incident types
  const incidentTypes = [
    { code: 'METAL_DETECTION_FAILURE', name: 'Metal Detection Failure', severity: 'FOOD_SAFETY_CRITICAL' },
    { code: 'SUGAR_CRYSTALLIZATION', name: 'Sugar Crystallization', severity: 'MAJOR' },
    { code: 'TASTE_DEVIATION', name: 'Taste Deviation', severity: 'CRITICAL' },
    { code: 'SPECIFICATION_DEVIATION', name: 'Specification Deviation', severity: 'CRITICAL' },
    { code: 'PACKAGING_DEFECT', name: 'Packaging Defect', severity: 'MINOR' },
    { code: 'LABELLING_ERROR', name: 'Labelling Error', severity: 'MAJOR' },
    { code: 'FOREIGN_MATERIAL', name: 'Foreign Material', severity: 'FOOD_SAFETY_CRITICAL' },
    { code: 'ALLERGEN_CROSS_CONTACT', name: 'Allergen Cross-Contact', severity: 'FOOD_SAFETY_CRITICAL' },
    { code: 'MICROBIAL_CONTAMINATION', name: 'Microbial Contamination', severity: 'FOOD_SAFETY_CRITICAL' },
    { code: 'TEMPERATURE_BREACH', name: 'Temperature Breach', severity: 'CRITICAL' },
    { code: 'WEIGHT_DEVIATION', name: 'Weight Deviation', severity: 'MAJOR' },
    { code: 'SEAL_INTEGRITY', name: 'Seal Integrity', severity: 'MINOR' },
  ]

  // 4 severity levels with escalation rules
  const severityRules = [
    {
      level: 'MINOR', icon: Activity, color: 'bg-sky-100 text-sky-700 border-sky-300',
      sla: '5 business days', escalation: 'L1 → QA Supervisor',
      desc: 'Cosmetic / minor deviation. No consumer safety impact. Resolved at line level.',
    },
    {
      level: 'MAJOR', icon: AlertCircle, color: 'bg-amber-100 text-amber-700 border-amber-300',
      sla: '3 business days', escalation: 'L2 → QA Manager',
      desc: 'Quality attribute failure (texture, colour, weight). Batch impact. Disposition required.',
    },
    {
      level: 'CRITICAL', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-300',
      sla: '24 hours', escalation: 'L2 → QA Head',
      desc: 'Specification breach or customer complaint. Batch quarantined, full investigation mandatory.',
    },
    {
      level: 'FOOD_SAFETY_CRITICAL', icon: ShieldAlert, color: 'bg-rose-100 text-rose-700 border-rose-300',
      sla: '4 hours', escalation: 'L3 → Plant Head + Food Safety Team Leader',
      desc: 'CCP failure, allergen, pathogen, or foreign material. Auto-inventory lock, block dispatch, regulatory disclosure may apply.',
    },
  ]

  // Chief Architect recommendation — Critical NCR auto-response chain (5 stages)
  const architectStages = [
    {
      stage: 1, code: 'INVENTORY_AUTO_LOCK', name: 'Auto-Lock Inventory via Batch Genealogy',
      icon: Lock, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-300',
      desc: 'On CRITICAL / FOOD_SAFETY_CRITICAL NCR creation, the system traverses the batch genealogy tree upstream (raw materials) and downstream (semi-finished, finished, packed). Every batch linked to the non-conforming batch is instantly locked — no further issue, transfer, or dispatch permitted.',
      actor: 'WMS + Genealogy Engine (automated)', output: 'Batch status = LOCKED across genealogy',
    },
    {
      stage: 2, code: 'POS_RESTAURANT_BLOCK', name: 'Block POS / Restaurant Sale',
      icon: X, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300',
      desc: 'Locked batches are blocked at every downstream sales channel. POS terminals cannot bill the product (UPC blocked), restaurant POS cannot place the order, and B2B dispatch holds are enforced at the dock. No human override available — only QA Head can release.',
      actor: 'POS + Restaurant + Dispatch (automated)', output: 'UPC/SKU = NON-SALEABLE for affected batches',
    },
    {
      stage: 3, code: 'QUALITY_NOTIFICATION', name: 'Notify Quality Team',
      icon: BellRing, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300',
      desc: 'Real-time in-app + email + SMS alerts sent to QA Manager, QA Lead, Plant Manager, and (for FOOD_SAFETY_CRITICAL) Food Safety Team Leader. Acknowledgement is tracked with timestamp; unacknowledged alerts auto-escalate in 15 minutes.',
      actor: 'Notification Service (automated)', output: 'Alert delivery + ack timestamps',
    },
    {
      stage: 4, code: 'INVESTIGATION_INITIATED', name: 'Start Investigation',
      icon: Search, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300',
      desc: 'An investigation record is auto-created in the QMS, linked to the NCR. Default analysis method (5-Whys) is pre-loaded with the immediate cause field. CAPA workflow is opened for root-cause and corrective/preventive action tracking.',
      actor: 'QMS (automated)', output: 'Investigation ID + CAPA record linked',
    },
    {
      stage: 5, code: 'ESCALATION_LADDER', name: 'Escalation Ladder Engaged',
      icon: TrendingUp, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300',
      desc: 'Severity-based escalation ladder is engaged (L1 → L2 → L3). For FOOD_SAFETY_CRITICAL, the Plant Head is notified within 4 hours and regulatory disclosure is evaluated. The NCR cannot be closed until disposition is recorded and CAPA verified.',
      actor: 'Escalation Engine (automated)', output: 'Escalation log + ack chain',
    },
  ]

  const severityColor: Record<string, string> = {
    MINOR: 'bg-sky-100 text-sky-700 border-sky-300',
    MAJOR: 'bg-amber-100 text-amber-700 border-amber-300',
    CRITICAL: 'bg-orange-100 text-orange-700 border-orange-300',
    FOOD_SAFETY_CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const statusColor: Record<string, string> = {
    OPEN: 'bg-rose-100 text-rose-700 border-rose-300',
    INVESTIGATING: 'bg-amber-100 text-amber-700 border-amber-300',
    DISPOSITION_PENDING: 'bg-orange-100 text-orange-700 border-orange-300',
    CLOSED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  const escalationColor: Record<string, string> = {
    L1: 'bg-slate-100 text-slate-700 border-slate-300',
    L2: 'bg-amber-100 text-amber-700 border-amber-300',
    L3: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileWarning className="h-6 w-6 text-rose-600" />NCR &amp; Incident Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 55 · 48 total NCRs (8 open · 3 investigating · 2 disposition pending · 35 closed) · Severity: 2 critical · 1 food safety critical · 12 major · 33 minor · 4 quarantined batches (₹{quarantinedValue.toLocaleString('en-IN')}) · 5 deviations open / 18 approved / 2 rejected · avg closure 4.5 days · 3 active escalations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />NCR Report</Button>
          <Button size="sm" variant="outline"><Lock className="mr-1 h-4 w-4" />Quarantine View</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New NCR</Button>
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

      {/* Chief Architect recommendation — Critical NCR auto-response */}
      <Card className="p-5 bg-gradient-to-r from-rose-50 to-purple-50 border-rose-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" />Chief Architect Recommendation — Critical NCR Triggers Automated Inventory &amp; Sales Lock</p>
            <p className="text-xs text-muted-foreground mt-1">When a CRITICAL or FOOD_SAFETY_CRITICAL NCR is created, the system does not wait for a human to act. It traverses the <span className="font-semibold text-rose-700">batch genealogy tree</span> in real time and locks every batch linked to the non-conforming lot — upstream raw materials and downstream semi-finished / finished / packed goods. POS and restaurant channels are immediately blocked from selling the affected UPCs, dispatch holds are enforced at the dock, and the quality team is notified with auto-escalation if acknowledgement is not received within 15 minutes. An investigation record is opened automatically with a pre-loaded 5-Whys template and a CAPA workflow. No operator, supervisor, or plant manager can override the lock — only the QA Head can release after disposition is recorded.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {architectStages.map((s) => (
                <div key={s.code} className={`rounded-lg border p-3 ${s.bg}`}>
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Stage {s.stage}</span>
                  </div>
                  <p className={`font-semibold text-xs mt-1 ${s.color}`}>{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-1 gap-1">
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

      {/* Severity levels with escalation rules */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" />Severity Levels &amp; Escalation Rules</h3>
            <p className="text-xs text-muted-foreground mt-0.5">4 severity tiers — each defines SLA, escalation ladder, and response posture. FOOD_SAFETY_CRITICAL triggers full auto-lock chain.</p>
          </div>
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">4 Levels</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {severityRules.map((s) => (
            <div key={s.level} className={`rounded-lg border p-3 ${s.color}`}>
              <div className="flex items-center gap-1.5">
                <s.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{s.level}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{s.desc}</p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">SLA:</span>
                  <span className="text-[10px] font-semibold">{s.sla}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Esc:</span>
                  <span className="text-[10px] font-semibold">{s.escalation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* NCR source modules */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><GitBranch className="h-4 w-4 text-blue-600" />NCR Source Modules</h3>
            <p className="text-xs text-muted-foreground mt-0.5">12 source modules feed the NCR register — every non-conformance is tagged with its origin for trend analysis and CAPA targeting.</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">12 Sources</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {sourceModules.map((m) => (
            <div key={m.code} className={`rounded-lg border px-3 py-2 ${m.color}`}>
              <div className="flex items-center gap-1.5">
                <m.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{m.code}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{m.name}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Incident types */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Incident Types</h3>
            <p className="text-xs text-muted-foreground mt-0.5">12 incident-type taxonomies — drives default severity, investigation method, and CAPA template selection.</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">12 Types</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {incidentTypes.map((t) => (
            <div key={t.code} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">{t.code}</p>
                <p className="text-[11px] font-semibold text-foreground">{t.name}</p>
              </div>
              <Badge variant="outline" className={`text-[9px] ${severityColor[t.severity]}`}>{t.severity}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* NCR register — 5 latest */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><FileWarning className="h-4 w-4 text-rose-600" />NCR Register — 5 Latest</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each NCR captures number, source module, batch, product, incident type, description, severity, reporter, quarantine flag + qty, status, assignee, and escalation level + escalatee.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"><Search className="mr-1 h-4 w-4" />Search</Button>
            <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
          </div>
        </div>
        <div className="space-y-3">
          {ncrs.map((n) => (
            <div key={n.number} className={`rounded-lg border p-4 ${n.severity === 'FOOD_SAFETY_CRITICAL' ? 'border-rose-300 bg-rose-50/40' : n.severity === 'CRITICAL' ? 'border-orange-300 bg-orange-50/40' : n.severity === 'MAJOR' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground font-mono">{n.number}</span>
                    <Badge variant="outline" className={`text-[9px] ${severityColor[n.severity]}`}>{n.severity}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${statusColor[n.status]}`}>{n.status}</Badge>
                    {n.quarantined && (
                      <Badge variant="outline" className="text-[9px] bg-purple-100 text-purple-700 border-purple-300">
                        <Lock className="mr-1 h-3 w-3" />QUARANTINED · {n.qty}
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-[9px] ${escalationColor[n.escalationLevel]}`}>
                      <TrendingUp className="mr-1 h-3 w-3" />{n.escalationLevel} → {n.escalatedTo}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[11px]">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Source</p>
                      <p className="font-semibold text-foreground">{n.sourceLabel}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Batch</p>
                      <p className="font-mono font-semibold text-foreground">{n.batch}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Product</p>
                      <p className="font-semibold text-foreground">{n.product}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Incident Type</p>
                      <p className="font-semibold text-foreground">{n.incidentLabel}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Reported By</p>
                      <p className="font-semibold text-foreground">{n.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Reported At</p>
                      <p className="font-semibold text-foreground">{n.reportedAt}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Assigned To</p>
                      <p className="font-semibold text-foreground">{n.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Quantity Impact</p>
                      <p className="font-semibold text-foreground">{n.qty}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3 leading-snug border-l-2 border-slate-200 pl-2">{n.description}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><Search className="mr-1 h-3 w-3" />Investigate</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><GitBranch className="mr-1 h-3 w-3" />Genealogy</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><History className="mr-1 h-3 w-3" />Audit Trail</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Deviation Management ─────────────────────────────────────────────
function NCRDeviationModule() {
  // 3 deviations
  const deviations = [
    {
      code: 'DEV-00012',
      linkedNCR: 'NCR-00047',
      deviationType: 'PROCESS_DEVIATION',
      typeLabel: 'Process Deviation',
      plannedValue: '100.0% sugar',
      actualValue: '98.0% sugar',
      deviationAmount: '-2.0%',
      unit: '% w/w',
      impactAssessment: 'Reduced sugar content affects binding and shelf-life. Sensory panel reported slight texture deviation. Within acceptable range for conditional release with shortened shelf-life (90 days vs 120 days).',
      affectedQty: '2 kg',
      reviewDecision: 'CONDITIONAL',
      status: 'CONDITIONAL',
      reviewer: 'Dr. A. Mehta (QA Manager)',
      reviewedAt: '2026-02-18 14:00',
    },
    {
      code: 'DEV-00011',
      linkedNCR: 'NCR-00044',
      deviationType: 'TEMPERATURE_DEVIATION',
      typeLabel: 'Temperature Deviation',
      plannedValue: '175.0 °C',
      actualValue: '177.0 °C',
      deviationAmount: '+2.0',
      unit: '°C',
      impactAssessment: 'Frying oil temperature 2°C above set-point for 4 minutes. Within validated process window (175 ± 5°C). No product quality or safety impact. Oil quality parameters within spec.',
      affectedQty: '120 kg',
      reviewDecision: 'APPROVED',
      status: 'APPROVED',
      reviewer: 'R. Iyer (QA Lead)',
      reviewedAt: '2026-02-13 17:30',
    },
    {
      code: 'DEV-00010',
      linkedNCR: 'NCR-00048',
      deviationType: 'SPECIFICATION_DEVIATION',
      typeLabel: 'Specification Deviation',
      plannedValue: 'Fe 1.5mm / Non-Fe 2.0mm reject',
      actualValue: 'Ferrous 1.5mm test piece NOT rejected',
      deviationAmount: 'FAIL',
      unit: 'detection test',
      impactAssessment: 'Metal detector failed to reject ferrous 1.5mm test piece during CCP verification. CRITICAL — potential metal fragment in product. Line paused; batch quarantined; full investigation initiated. No conditional release possible.',
      affectedQty: '250 kg',
      reviewDecision: 'PENDING',
      status: 'OPEN',
      reviewer: '— (pending)',
      reviewedAt: '— (pending)',
    },
  ]

  // 7 deviation types
  const deviationTypes = [
    { code: 'RECIPE', name: 'Recipe', icon: Beaker, color: 'bg-blue-100 text-blue-700 border-blue-300', desc: 'Ingredient ratio or formulation deviation from master recipe' },
    { code: 'TEMPERATURE', name: 'Temperature', icon: Thermometer, color: 'bg-rose-100 text-rose-700 border-rose-300', desc: 'Cooking, frying, cooling, or storage temperature outside validated window' },
    { code: 'WEIGHT', name: 'Weight', icon: Scale, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Unit or batch weight outside ± tolerance per AQL plan' },
    { code: 'PACKAGING', name: 'Packaging', icon: Package, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: 'Packaging material, seal, or labelling deviation from specification' },
    { code: 'CLEANING', name: 'Cleaning', icon: Droplets, color: 'bg-teal-100 text-teal-700 border-teal-300', desc: 'Cleaning / sanitation verification (ATP, visual, micro) outside limit' },
    { code: 'PROCESS', name: 'Process', icon: Activity, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Process parameter (time, speed, pressure, RPM) deviation from SOP' },
    { code: 'SPECIFICATION', name: 'Specification', icon: ShieldAlert, color: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Finished good or raw material specification breach (CoA, CCP, IQC spec)' },
  ]

  // Deviation workflow — 5 stages
  const workflowStages = [
    {
      stage: 1, code: 'DETECTED', name: 'Detected',
      icon: AlertTriangle, color: 'bg-rose-100 text-rose-700 border-rose-300',
      desc: 'Deviation detected by operator, sensor, or QA inspector. Event captured with timestamp, batch, parameter, planned vs actual value.',
    },
    {
      stage: 2, code: 'QUALITY_REVIEW', name: 'Quality Review',
      icon: Search, color: 'bg-amber-100 text-amber-700 border-amber-300',
      desc: 'QA reviews the deviation, verifies measurement, links to NCR if applicable, and assesses immediate consumer-safety risk. Batch placed on hold if risk uncertain.',
    },
    {
      stage: 3, code: 'RISK_ASSESSMENT', name: 'Risk Assessment',
      icon: Target, color: 'bg-orange-100 text-orange-700 border-orange-300',
      desc: 'Risk assessment using severity × likelihood × detectability (RPN). Impact on safety, quality, regulatory, and customer is evaluated and documented.',
    },
    {
      stage: 4, code: 'DECISION', name: 'Decision',
      icon: Brain, color: 'bg-purple-100 text-purple-700 border-purple-300',
      desc: 'Decision recorded: APPROVED (use-as-is), CONDITIONAL (with constraints), or REJECTED (rework / reject / destroy). Rationale and reviewer signature captured.',
    },
    {
      stage: 5, code: 'APPROVE_REJECT', name: 'Approve / Reject',
      icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      desc: 'Final authorisation — for CRITICAL deviations, QA Head signature required. Batch disposition is updated in WMS; CAPA opened if preventive action needed.',
    },
  ]

  const decisionColor: Record<string, string> = {
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    CONDITIONAL: 'bg-amber-100 text-amber-700 border-amber-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
    PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  const statusColor: Record<string, string> = {
    OPEN: 'bg-rose-100 text-rose-700 border-rose-300',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    CONDITIONAL: 'bg-amber-100 text-amber-700 border-amber-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="h-6 w-6 text-purple-600" />Deviation Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 55 · 3 deviations shown · 7 deviation types · Workflow: Detected → Quality Review → Risk Assessment → Decision → Approve / Reject · Each deviation captures code, linked NCR, type, planned vs actual value, deviation amount, unit, impact assessment, affected qty, review decision, and status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Log Deviation</Button>
        </div>
      </div>

      {/* Deviation workflow */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-purple-600" />Deviation Workflow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">5-stage mandatory workflow — every deviation moves through detection, quality review, risk assessment, decision, and final authorisation. No stage can be skipped.</p>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">5 Stages</Badge>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {workflowStages.map((s, i) => (
            <div key={s.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${s.color} px-3 py-2 min-w-[170px]`}>
                <div className="flex items-center gap-1.5">
                  <s.icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wide">Stage {s.stage}</span>
                </div>
                <p className="text-[11px] font-semibold mt-1">{s.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{s.desc}</p>
              </div>
              {i < workflowStages.length - 1 && (
                <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 7 deviation types */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Deviation Types</h3>
            <p className="text-xs text-muted-foreground mt-0.5">7 deviation-type taxonomies drive the risk-assessment template, reviewer assignment, and CAPA workflow.</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">7 Types</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {deviationTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border p-3 ${t.color}`}>
              <div className="flex items-center gap-1.5">
                <t.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{t.code}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{t.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Deviation register — 3 records */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><GitBranch className="h-4 w-4 text-purple-600" />Deviation Register — 3 Records</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each deviation links to its NCR, captures planned vs actual value, deviation amount with unit, impact assessment, affected quantity, review decision, and current status.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"><Search className="mr-1 h-4 w-4" />Search</Button>
            <Button size="sm" variant="outline"><History className="mr-1 h-4 w-4" />Audit Trail</Button>
          </div>
        </div>
        <div className="space-y-3">
          {deviations.map((d) => (
            <div key={d.code} className={`rounded-lg border p-4 ${d.status === 'OPEN' ? 'border-rose-300 bg-rose-50/40' : d.status === 'CONDITIONAL' ? 'border-amber-200 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground font-mono">{d.code}</span>
                    <Badge variant="outline" className="text-[9px] bg-blue-100 text-blue-700 border-blue-300">{d.typeLabel}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${decisionColor[d.reviewDecision]}`}>Decision: {d.reviewDecision}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${statusColor[d.status]}`}>{d.status}</Badge>
                    <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-700 border-slate-300">
                      <FileWarning className="mr-1 h-3 w-3" />Linked: {d.linkedNCR}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[11px]">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Planned Value</p>
                      <p className="font-semibold text-foreground font-mono">{d.plannedValue}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Actual Value</p>
                      <p className="font-semibold text-foreground font-mono">{d.actualValue}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Deviation</p>
                      <p className={`font-bold font-mono ${d.deviationAmount === 'FAIL' ? 'text-rose-700' : d.deviationAmount.startsWith('-') ? 'text-amber-700' : 'text-orange-700'}`}>{d.deviationAmount} {d.unit}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Affected Qty</p>
                      <p className="font-semibold text-foreground">{d.affectedQty}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Reviewer</p>
                      <p className="font-semibold text-foreground">{d.reviewer}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Reviewed At</p>
                      <p className="font-semibold text-foreground">{d.reviewedAt}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Impact Assessment</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug border-l-2 border-slate-200 pl-2">{d.impactAssessment}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><Search className="mr-1 h-3 w-3" />Review</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><Target className="mr-1 h-3 w-3" />Risk</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><History className="mr-1 h-3 w-3" />Trail</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Quarantine Dashboard ─────────────────────────────────────────────
function NCRQuarantineModule() {
  const totalQuarantineValue = 84000

  // 4 quarantined items
  const quarantines = [
    {
      code: 'QRT-00004',
      ncrNumber: 'NCR-00048',
      batch: 'BATCH-NM-26F007',
      itemName: 'Namkeen (250g pouch)',
      itemType: 'FINISHED_GOODS',
      qty: 250,
      uom: 'kg',
      warehouse: 'WH-1 · Mumbai',
      quarantineBin: 'QA-HOLD-2',
      locked: true,
      disposition: 'UNDER_INVESTIGATION',
      dispositionLabel: 'Under Investigation',
      releaseInfo: '— (investigation in progress)',
    },
    {
      code: 'QRT-00003',
      ncrNumber: 'NCR-00047',
      batch: 'BATCH-MT-26E012',
      itemName: 'Motichoor Laddu (1kg box)',
      itemType: 'FINISHED_GOODS',
      qty: 2,
      uom: 'kg',
      warehouse: 'WH-1 · Mumbai',
      quarantineBin: 'QA-HOLD-1',
      locked: true,
      disposition: 'DISPOSITION_PENDING',
      dispositionLabel: 'Disposition Pending',
      releaseInfo: '— (awaiting QA Manager decision)',
    },
    {
      code: 'QRT-00002',
      ncrNumber: 'NCR-00046',
      batch: 'BATCH-KK-26D098',
      itemName: 'Kaju Katli (500g box)',
      itemType: 'FINISHED_GOODS',
      qty: 96,
      uom: 'pcs',
      warehouse: 'WH-2 · Pune',
      quarantineBin: 'QA-HOLD-3',
      locked: true,
      disposition: 'UNDER_INVESTIGATION',
      dispositionLabel: 'Under Investigation',
      releaseInfo: '— (sensory + rancidity test pending)',
    },
    {
      code: 'QRT-00001',
      ncrNumber: 'NCR-00045',
      batch: 'BATCH-CH-26C045',
      itemName: 'Red Chilli Powder (Raw Material)',
      itemType: 'RAW_MATERIAL',
      qty: 50,
      uom: 'kg',
      warehouse: 'WH-RM · Mumbai',
      quarantineBin: 'QA-HOLD-RM-1',
      locked: false,
      disposition: 'RELEASED',
      dispositionLabel: 'Released — Returned to Supplier',
      releaseInfo: '2026-02-16 11:00 · Debit note DN-00871 raised · Supplier pickup completed',
    },
  ]

  // Quarantine workflow — 5 stages
  const workflowStages = [
    {
      stage: 1, code: 'QUALITY_INCIDENT', name: 'Quality Incident',
      icon: FileWarning, color: 'bg-rose-100 text-rose-700 border-rose-300',
      desc: 'Quality incident / NCR raised. Affected batch identified via genealogy lookup.',
    },
    {
      stage: 2, code: 'BATCH_LOCKED', name: 'Batch Locked',
      icon: Lock, color: 'bg-purple-100 text-purple-700 border-purple-300',
      desc: 'Batch locked in WMS — no issue, transfer, or dispatch permitted. POS / restaurant / B2B blocked.',
    },
    {
      stage: 3, code: 'MOVE_TO_QUARANTINE', name: 'Move to Quarantine',
      icon: Package, color: 'bg-amber-100 text-amber-700 border-amber-300',
      desc: 'Stock physically moved to QA-HOLD bin. Transfer recorded with two-person verification.',
    },
    {
      stage: 4, code: 'INVESTIGATION', name: 'Investigation',
      icon: Search, color: 'bg-blue-100 text-blue-700 border-blue-300',
      desc: 'Investigation, root cause, and risk assessment completed. Disposition recommendation prepared.',
    },
    {
      stage: 5, code: 'DISPOSITION', name: 'Disposition',
      icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      desc: 'Final disposition recorded — release, conditional release, rework, reprocess, reject, destroy, or return to supplier.',
    },
  ]

  // 7 disposition options
  const dispositionOptions = [
    { code: 'RELEASE', name: 'Release', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: 'Batch meets all specs — released to saleable stock' },
    { code: 'CONDITIONAL_RELEASE', name: 'Conditional Release', icon: ShieldCheck, color: 'bg-teal-100 text-teal-700 border-teal-300', desc: 'Released with constraints (shorter shelf-life, restricted channel)' },
    { code: 'REWORK', name: 'Rework', icon: Activity, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Reworked in-process (re-seal, re-pack, re-sort) to meet spec' },
    { code: 'REPROCESS', name: 'Reprocess', icon: GitBranch, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Reprocessed through manufacturing cycle to recover material' },
    { code: 'REJECT', name: 'Reject', icon: X, color: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Rejected — scrapped / disposed as waste (non-saleable)' },
    { code: 'DESTROY', name: 'Destroy', icon: PackageX, color: 'bg-rose-100 text-rose-700 border-rose-300', desc: 'Destroyed under witness (food safety / regulatory risk)' },
    { code: 'RETURN_SUPPLIER', name: 'Return Supplier', icon: TrendingDown, color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Returned to supplier with debit note (raw material IQC failure)' },
  ]

  // 5 item types
  const itemTypes = [
    { code: 'RAW_MATERIAL', name: 'Raw Material', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'SEMI_FINISHED', name: 'Semi-Finished', icon: Activity, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'FINISHED_GOODS', name: 'Finished Goods', icon: Package, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'PACKAGING', name: 'Packaging', icon: Package, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'RETENTION_SAMPLE', name: 'Retention Sample', icon: Beaker, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ]

  const dispositionColor: Record<string, string> = {
    UNDER_INVESTIGATION: 'bg-blue-100 text-blue-700 border-blue-300',
    DISPOSITION_PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    RELEASED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    REWORK: 'bg-orange-100 text-orange-700 border-orange-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const itemTypeColor: Record<string, string> = {
    RAW_MATERIAL: 'bg-blue-100 text-blue-700 border-blue-300',
    SEMI_FINISHED: 'bg-amber-100 text-amber-700 border-amber-300',
    FINISHED_GOODS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PACKAGING: 'bg-purple-100 text-purple-700 border-purple-300',
    RETENTION_SAMPLE: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6 text-purple-600" />Quarantine Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 55 · 4 quarantined items · Total held value ₹{totalQuarantineValue.toLocaleString('en-IN')} · 3 under investigation / pending · 1 released (returned to supplier) · Workflow: Quality Incident → Batch Locked → Move to Quarantine → Investigation → Disposition · 7 disposition options · 5 item types</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Quarantine Report</Button>
          <Button size="sm" variant="outline"><GitBranch className="mr-1 h-4 w-4" />Genealogy</Button>
          <Button size="sm"><Lock className="mr-1 h-4 w-4" />New Quarantine</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="flex items-start justify-between">
            <Lock className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-foreground">4</span>
          </div>
          <p className="text-xs font-semibold mt-2 text-foreground">Quarantined Items</p>
          <p className="text-[10px] text-muted-foreground leading-tight">3 locked · 1 released</p>
        </Card>
        <Card className="p-4 border-rose-200 bg-rose-50">
          <div className="flex items-start justify-between">
            <IndianRupee className="h-5 w-5 text-rose-600" />
            <span className="text-2xl font-bold text-foreground">₹{totalQuarantineValue.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-xs font-semibold mt-2 text-foreground">Total Held Value</p>
          <p className="text-[10px] text-muted-foreground leading-tight">working capital locked</p>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-start justify-between">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-bold text-foreground">2</span>
          </div>
          <p className="text-xs font-semibold mt-2 text-foreground">Under Investigation</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Namkeen · Kaju Katli</p>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-start justify-between">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-bold text-foreground">1</span>
          </div>
          <p className="text-xs font-semibold mt-2 text-foreground">Released</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Chilli — returned to supplier</p>
        </Card>
      </div>

      {/* Quarantine workflow */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-purple-600" />Quarantine Workflow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">5-stage mandatory workflow — every quarantined batch moves from quality incident through batch lock, physical move to QA-HOLD bin, investigation, and final disposition with two-person verification.</p>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">5 Stages</Badge>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {workflowStages.map((s, i) => (
            <div key={s.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${s.color} px-3 py-2 min-w-[170px]`}>
                <div className="flex items-center gap-1.5">
                  <s.icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wide">Stage {s.stage}</span>
                </div>
                <p className="text-[11px] font-semibold mt-1">{s.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{s.desc}</p>
              </div>
              {i < workflowStages.length - 1 && (
                <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 7 disposition options */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Disposition Options</h3>
            <p className="text-xs text-muted-foreground mt-0.5">7 disposition outcomes — each requires QA Head signature for CRITICAL / FOOD_SAFETY_CRITICAL NCRs. Two-person witness required for Destroy and Return Supplier.</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">7 Options</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {dispositionOptions.map((d) => (
            <div key={d.code} className={`rounded-lg border p-3 ${d.color}`}>
              <div className="flex items-center gap-1.5">
                <d.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{d.code}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{d.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{d.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Item types */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Package className="h-4 w-4 text-blue-600" />Item Types</h3>
            <p className="text-xs text-muted-foreground mt-0.5">5 item-type taxonomies classify quarantined stock — drives bin location, handling SOP, and disposition authority.</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">5 Types</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {itemTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border px-3 py-2 ${t.color}`}>
              <div className="flex items-center gap-1.5">
                <t.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{t.code}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{t.name}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Quarantine register — 4 items */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Lock className="h-4 w-4 text-purple-600" />Quarantine Register — 4 Items</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each item captures code, linked NCR, batch, item name, item type, quantity + UoM, warehouse, quarantine bin, locked status, disposition, and release info.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"><Search className="mr-1 h-4 w-4" />Search</Button>
            <Button size="sm" variant="outline"><History className="mr-1 h-4 w-4" />Audit Trail</Button>
          </div>
        </div>
        <div className="space-y-3">
          {quarantines.map((q) => (
            <div key={q.code} className={`rounded-lg border p-4 ${q.locked ? 'border-purple-200 bg-purple-50/40' : 'border-emerald-200 bg-emerald-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground font-mono">{q.code}</span>
                    {q.locked ? (
                      <Badge variant="outline" className="text-[9px] bg-purple-100 text-purple-700 border-purple-300">
                        <Lock className="mr-1 h-3 w-3" />LOCKED
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />UNLOCKED (fallback for Unlock icon)
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-[9px] ${dispositionColor[q.disposition]}`}>{q.dispositionLabel}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${itemTypeColor[q.itemType]}`}>{q.itemType}</Badge>
                    <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-700 border-slate-300">
                      <FileWarning className="mr-1 h-3 w-3" />NCR: {q.ncrNumber}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[11px]">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Item Name</p>
                      <p className="font-semibold text-foreground">{q.itemName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Batch</p>
                      <p className="font-mono font-semibold text-foreground">{q.batch}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Quantity</p>
                      <p className="font-semibold text-foreground">{q.qty} {q.uom}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Warehouse</p>
                      <p className="font-semibold text-foreground">{q.warehouse}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Quarantine Bin</p>
                      <p className="font-mono font-semibold text-foreground">{q.quarantineBin}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Release Info</p>
                      <p className="font-semibold text-foreground">{q.releaseInfo}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><Search className="mr-1 h-3 w-3" />Investigate</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><GitBranch className="mr-1 h-3 w-3" />Genealogy</Button>
                  {q.locked ? (
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" />Disposition</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"><History className="mr-1 h-3 w-3" />View Release</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Root Cause & Risk Assessment ─────────────────────────────────────
function NCRInvestigationModule() {
  // 3 investigations linked to NCRs
  const investigations = [
    {
      code: 'INV-00048',
      ncr: 'NCR-00048',
      analysisMethod: '5_WHYS',
      methodLabel: '5 Whys',
      why1: 'Why did the metal detector fail to reject the test piece? — Sensitivity drift on ferrous channel.',
      why2: 'Why did sensitivity drift? — Calibration verification not performed at start of shift.',
      why3: 'Why was calibration verification skipped? — Operator relied on previous shift’s verification (handover gap).',
      why4: 'Why was there a handover gap? — No digital handover checklist enforced for CCP equipment.',
      why5: 'Why no digital checklist? — CCP handover SOP not yet integrated into MES (system gap).',
      immediateCause: 'Metal detector ferrous-channel sensitivity drift — calibration verification skipped at shift start.',
      rootCause: 'CCP equipment handover SOP not enforced digitally in MES — operators can skip start-of-shift calibration verification without system block.',
      contributingFactors: '1) Shift handover relies on paper log. 2) No system block when calibration overdue. 3) Previous CCP pass logged 6 hours prior — drift window unidentified. 4) Operator training on CCP verification frequency last refreshed 14 months ago.',
      evidence: 'Metal detector event log (SCADA export 14:32) · Calibration certificate (last 2026-02-15) · Shift handover paper log (2026-02-18 06:00) · Batch NM-26F007 genealogy report · Witness statement — Operator S. Patil',
      investigator: 'Dr. A. Mehta (QA Manager) · R. Iyer (QA Lead)',
      status: 'IN_PROGRESS',
      startedAt: '2026-02-18 15:00',
      completedAt: '— (in progress)',
      // Risk: severity 10 × likelihood 8 × detectability 5 = 400 → CRITICAL
      severity: 10, likelihood: 8, detectability: 5,
    },
    {
      code: 'INV-00046',
      ncr: 'NCR-00046',
      analysisMethod: 'FISHBONE',
      methodLabel: 'Fishbone (Ishikawa)',
      why1: '— (fishbone method — see categories below)',
      why2: '—',
      why3: '—',
      why4: '—',
      why5: '—',
      immediateCause: 'Off / soapy aftertaste reported by customer on Kaju Katli batch KK-26D098.',
      rootCause: '— (investigation in progress — fishbone categories being populated)',
      contributingFactors: 'Man: operator rotation. Machine: grinder cleaning frequency. Material: cashew lot supplier change. Method: roasting time adjustment. Measurement: peroxide value test interval. Environment: storage temperature log review pending.',
      evidence: 'Customer complaint CMP-00342 · Retention sample KK-26D098 (pulled) · Sensory panel scheduled 2026-02-19 · Rancidity (PV) test in progress · Cashew lot CoA under review',
      investigator: 'Dr. A. Mehta (QA Manager)',
      status: 'IN_PROGRESS',
      startedAt: '2026-02-17 19:00',
      completedAt: '— (in progress)',
      // Risk: severity 9 × likelihood 5 × detectability 6 = 270 → HIGH
      severity: 9, likelihood: 5, detectability: 6,
    },
    {
      code: 'INV-00045',
      ncr: 'NCR-00045',
      analysisMethod: '5_WHYS',
      methodLabel: '5 Whys',
      why1: 'Why did chilli powder fail colour spec? — ASTA colour value 38 vs required ≥ 42.',
      why2: 'Why was colour value low? — Supplier sourced from a different growing region with lower capsaicin pigment density.',
      why3: 'Why was a different region sourced? — Supplier substituted lot due to primary region shortage (unreported).',
      why4: 'Why was substitution unreported? — Supplier quality agreement does not mandate region-change notification.',
      why5: 'Why no notification clause? — Supplier qualification process did not assess multi-region sourcing risk.',
      immediateCause: 'Red chilli powder lot CH-26C045 received with ASTA colour 38 (spec ≥ 42) and moisture 9.8% (spec ≤ 8%) — IQC rejection.',
      rootCause: 'Supplier process gap — supplier substituted chilli lot from a different growing region due to primary-region shortage without notifying procurement; supplier quality agreement lacked region-change notification clause.',
      contributingFactors: '1) Supplier quality agreement gap — no region-change notification clause. 2) Procurement not alerted on lot substitution. 3) Incoming CoA did not flag ASTA / moisture trend. 4) Single-supplier dependency for red chilli.',
      evidence: 'IQC rejection report IQC-26C045-REJ · Supplier CoA (lot CH-26C045) · Supplier correspondence (region substitution) · Debit note DN-00871 · Supplier CAPA acknowledgement',
      investigator: 'S. Kulkarni (QA Lead) · Priya N. (IQC Inspector)',
      status: 'COMPLETED',
      startedAt: '2026-02-15 10:30',
      completedAt: '2026-02-16 16:00',
      // Risk: severity 7 × likelihood 6 × detectability 4 = 168 → HIGH
      severity: 7, likelihood: 6, detectability: 4,
    },
  ]

  // 5 analysis methods
  const analysisMethods = [
    { code: '5_WHYS', name: '5 Whys', icon: Brain, color: 'bg-blue-100 text-blue-700 border-blue-300', desc: 'Iterative question-asking — drill from symptom to root cause in 5 steps' },
    { code: 'FISHBONE', name: 'Fishbone (Ishikawa)', icon: GitBranch, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: '6M cause categories — Man, Machine, Material, Method, Measurement, Environment' },
    { code: 'FAULT_TREE', name: 'Fault Tree Analysis', icon: GitBranch, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Top-down boolean logic tree — maps failure paths from event to root causes' },
    { code: 'PARETO', name: 'Pareto (80/20)', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: '80/20 rule — prioritises the vital few causes responsible for most incidents' },
    { code: 'TIMELINE', name: 'Timeline Analysis', icon: Clock, color: 'bg-teal-100 text-teal-700 border-teal-300', desc: 'Chronological event reconstruction — identifies sequence and timing gaps' },
  ]

  // Risk level thresholds — RPN = severity × likelihood × detectability (max 1000)
  const rpnLevels = [
    { level: 'LOW', range: '1 – 49', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', action: 'Monitor · routine review' },
    { level: 'MEDIUM', range: '50 – 149', color: 'bg-amber-100 text-amber-700 border-amber-300', action: 'Investigate · preventive CAPA' },
    { level: 'HIGH', range: '150 – 349', color: 'bg-orange-100 text-orange-700 border-orange-300', action: 'Corrective CAPA · manager sign-off' },
    { level: 'CRITICAL', range: '350 – 1000', color: 'bg-rose-100 text-rose-700 border-rose-300', action: 'Immediate action · QA Head + Plant Head sign-off' },
  ]

  // Risk level calculator
  const riskLevel = (rpn: number): { label: string; color: string } => {
    if (rpn >= 350) return { label: 'CRITICAL', color: 'bg-rose-100 text-rose-700 border-rose-300' }
    if (rpn >= 150) return { label: 'HIGH', color: 'bg-orange-100 text-orange-700 border-orange-300' }
    if (rpn >= 50) return { label: 'MEDIUM', color: 'bg-amber-100 text-amber-700 border-amber-300' }
    return { label: 'LOW', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' }
  }

  const statusColor: Record<string, string> = {
    IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    NOT_STARTED: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  const methodColor: Record<string, string> = {
    '5_WHYS': 'bg-blue-100 text-blue-700 border-blue-300',
    FISHBONE: 'bg-purple-100 text-purple-700 border-purple-300',
    FAULT_TREE: 'bg-amber-100 text-amber-700 border-amber-300',
    PARETO: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    TIMELINE: 'bg-teal-100 text-teal-700 border-teal-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-indigo-600" />Root Cause &amp; Risk Assessment</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 55 · 3 investigations linked to NCRs · 5 analysis methods (5-Whys, Fishbone, Fault Tree, Pareto, Timeline) · RPN = severity × likelihood × detectability · 4 risk levels (LOW / MEDIUM / HIGH / CRITICAL) · Each investigation captures code, NCR, analysis method, 5 Whys fields, immediate cause, root cause, contributing factors, evidence, investigator, and status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Investigation Report</Button>
          <Button size="sm" variant="outline"><Target className="mr-1 h-4 w-4" />Risk Matrix</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Investigation</Button>
        </div>
      </div>

      {/* RPN formula & risk levels */}
      <Card className="p-5 bg-gradient-to-r from-indigo-50 to-rose-50 border-indigo-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Target className="h-4 w-4 text-indigo-600" />Risk Priority Number (RPN) — FMEA-Based Risk Scoring</p>
            <p className="text-xs text-muted-foreground mt-1">Each investigation carries a Risk Priority Number computed as <span className="font-mono font-bold text-indigo-700">RPN = Severity (1–10) × Likelihood (1–10) × Detectability (1–10)</span> — range 1 to 1000. Severity measures consequence; likelihood measures probability of occurrence; detectability measures the chance the issue is caught before reaching the consumer (10 = undetectable). The RPN drives the risk level, the required CAPA authority, and the escalation path.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {rpnLevels.map((r) => (
                <div key={r.level} className={`rounded-lg border p-3 ${r.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide">{r.level}</span>
                    <span className="text-[10px] font-mono font-bold">RPN {r.range}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{r.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 5 analysis methods */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Brain className="h-4 w-4 text-indigo-600" />Root Cause Analysis Methods</h3>
            <p className="text-xs text-muted-foreground mt-0.5">5 analysis methods — each NCR’s investigation selects one or more methods based on incident type, complexity, and severity.</p>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">5 Methods</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {analysisMethods.map((m) => (
            <div key={m.code} className={`rounded-lg border p-3 ${m.color}`}>
              <div className="flex items-center gap-1.5">
                <m.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{m.code}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{m.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Investigation register — 3 records */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Search className="h-4 w-4 text-indigo-600" />Investigation Register — 3 Records</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each investigation captures code, linked NCR, analysis method, 5 Whys fields (when applicable), immediate cause, root cause, contributing factors, evidence, investigator, and status. Risk assessment (RPN + risk level) shown per investigation.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"><Search className="mr-1 h-4 w-4" />Search</Button>
            <Button size="sm" variant="outline"><History className="mr-1 h-4 w-4" />Audit Trail</Button>
          </div>
        </div>
        <div className="space-y-4">
          {investigations.map((inv) => {
            const rpn = inv.severity * inv.likelihood * inv.detectability
            const risk = riskLevel(rpn)
            return (
              <div key={inv.code} className={`rounded-lg border p-4 ${inv.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground font-mono">{inv.code}</span>
                      <Badge variant="outline" className={`text-[9px] ${methodColor[inv.analysisMethod]}`}>{inv.methodLabel}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${statusColor[inv.status]}`}>{inv.status}</Badge>
                      <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-700 border-slate-300">
                        <FileWarning className="mr-1 h-3 w-3" />NCR: {inv.ncr}
                      </Badge>
                      <Badge variant="outline" className={`text-[9px] ${risk.color}`}>
                        <Target className="mr-1 h-3 w-3" />RPN {rpn} · {risk.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[11px]">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Investigator</p>
                        <p className="font-semibold text-foreground">{inv.investigator}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Started</p>
                        <p className="font-semibold text-foreground">{inv.startedAt}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Completed</p>
                        <p className="font-semibold text-foreground">{inv.completedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RPN breakdown */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Severity</p>
                    <p className="text-sm font-bold text-rose-700">{inv.severity} / 10</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Likelihood</p>
                    <p className="text-sm font-bold text-amber-700">{inv.likelihood} / 10</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Detectability</p>
                    <p className="text-sm font-bold text-orange-700">{inv.detectability} / 10</p>
                  </div>
                  <div className={`rounded-md border px-2 py-1.5 ${risk.color}`}>
                    <p className="text-[9px] uppercase font-bold">RPN</p>
                    <p className="text-sm font-bold">{rpn} · {risk.label}</p>
                  </div>
                </div>

                {/* 5 Whys (only for 5_WHYS method) */}
                {inv.analysisMethod === '5_WHYS' && (
                  <div className="mt-3">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1"><Brain className="h-3 w-3" />5 Whys Analysis</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[10px]">
                      <div className="rounded border border-slate-200 bg-white/60 px-2 py-1"><span className="font-bold text-blue-700">Why 1:</span> <span className="text-muted-foreground">{inv.why1}</span></div>
                      <div className="rounded border border-slate-200 bg-white/60 px-2 py-1"><span className="font-bold text-blue-700">Why 2:</span> <span className="text-muted-foreground">{inv.why2}</span></div>
                      <div className="rounded border border-slate-200 bg-white/60 px-2 py-1"><span className="font-bold text-blue-700">Why 3:</span> <span className="text-muted-foreground">{inv.why3}</span></div>
                      <div className="rounded border border-slate-200 bg-white/60 px-2 py-1"><span className="font-bold text-blue-700">Why 4:</span> <span className="text-muted-foreground">{inv.why4}</span></div>
                      <div className="rounded border border-slate-200 bg-white/60 px-2 py-1 md:col-span-2"><span className="font-bold text-blue-700">Why 5:</span> <span className="text-muted-foreground">{inv.why5}</span></div>
                    </div>
                  </div>
                )}

                {/* Immediate cause + root cause */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded border border-amber-200 bg-amber-50/40 px-2 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-amber-700 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Immediate Cause</p>
                    <p className="text-[11px] text-foreground mt-1 leading-snug">{inv.immediateCause}</p>
                  </div>
                  <div className="rounded border border-rose-200 bg-rose-50/40 px-2 py-1.5">
                    <p className="text-[9px] uppercase font-bold text-rose-700 flex items-center gap-1"><Target className="h-3 w-3" />Root Cause</p>
                    <p className="text-[11px] text-foreground mt-1 leading-snug">{inv.rootCause}</p>
                  </div>
                </div>

                {/* Contributing factors */}
                <div className="mt-2 rounded border border-slate-200 bg-white/60 px-2 py-1.5">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1"><GitBranch className="h-3 w-3" />Contributing Factors</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{inv.contributingFactors}</p>
                </div>

                {/* Evidence */}
                <div className="mt-2 rounded border border-slate-200 bg-white/60 px-2 py-1.5">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" />Evidence</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{inv.evidence}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><Search className="mr-1 h-3 w-3" />View Detail</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><Download className="mr-1 h-3 w-3" />Export Report</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><FileWarning className="mr-1 h-3 w-3" />Linked NCR</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" />Open CAPA</Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
