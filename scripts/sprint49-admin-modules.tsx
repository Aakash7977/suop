// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 49 — ENTERPRISE QUALITY FOUNDATION & QUALITY MASTER ENGINE (PART 6 QMS BEGINS)
// Admin modules: QMS Dashboard, Standards Management, Inspection Master, Quality
// Specifications, Sampling Plans, Test Methods & Equipment, Quality Calendar, Quality Organization
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: ShieldCheck, ClipboardCheck, FileText, Calendar, Settings,
// FlaskConical, Gauge, CheckCircle2, AlertTriangle, Clock, Plus, Download, Shield,
// Award, Stamp, FileCheck, FolderTree, BookOpen, Wrench are already imported in
// src/app/page.tsx. Add `Beaker, Microscope` to the existing lucide-react import
// block (lines 4-33 of page.tsx) before inserting this snippet.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── QMS Foundation Dashboard ──────────────────────────────────────────
function QMSDashboardModule() {
  const kpis = [
    { label: 'Quality Departments', value: '3', unit: 'plants covered', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Quality Standards', value: '8', unit: '6 active · 1 approved · 1 draft', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Active Standards', value: '6', unit: 'in production use', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Inspection Types', value: '11', unit: 'visual → microbiology', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Inspection Templates', value: '24', unit: '20 active · 4 draft', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Sampling Plans', value: '6', unit: 'AQL · batch · risk', icon: Gauge, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Specifications', value: '18', unit: '15 active · 3 draft', icon: FolderTree, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Test Methods', value: '14', unit: 'manual → instrument', icon: FlaskConical, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Test Equipment', value: '12', unit: 'across 3 labs', icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
    { label: 'Calibration Due', value: '2', unit: '1 overdue · 1 due', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Upcoming Audits', value: '3', unit: 'next 30 days', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pending Approvals', value: '4', unit: 'awaiting QA head', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ]
  const subModules = [
    { name: 'Standards Management', count: '8', desc: 'FSSAI, HACCP, ISO 22000, BRCGS, Internal, Customer, Export standards with version control', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { name: 'Inspection Master', count: '11 types', desc: '24 inspection templates covering RM, IPQC, FG & packaging across all products', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { name: 'Quality Specifications', count: '18', desc: 'Product-wise parameter matrix with min/max/target/tolerance/critical limits & severity', icon: FolderTree, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    { name: 'Sampling Plans', count: '6', desc: '100% inspection, AQL 2.5/1.0, batch sampling, risk-based selection', icon: Gauge, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { name: 'Test Methods & Equipment', count: '14 + 12', desc: 'Manual, laboratory, instrument, digital, microbiological & chemical methods', icon: FlaskConical, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { name: 'Quality Calendar', count: '8 events', desc: 'Calibration, audits, certifications, training, regulatory inspections', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { name: 'Quality Organization', count: '3 depts', desc: 'Thane Quality Dept, RM Lab, FG Lab with 4-tier role hierarchy', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ]
  const reuseFlow = [
    { stage: 'Procurement', desc: 'Vendor RM inspection against approved spec', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { stage: 'Manufacturing', desc: 'IPQC checks at cooking, frying, mixing', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { stage: 'Packaging', desc: 'Label, weight, seal, metal detection', icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-100' },
    { stage: 'Warehouse', desc: 'Batch release, shelf-life, dispatch QA', icon: FolderTree, color: 'text-amber-600', bg: 'bg-amber-100' },
    { stage: 'Customer Quality', desc: 'Complaint investigation, COA, traceability', icon: Stamp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />Quality Foundation Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · Enterprise Quality Management System · Single centralized Quality Master reused across Procurement, Manufacturing, Packaging, Warehouse & Customer Quality</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export QMS Report</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Quality Record</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpis.map(w => (
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
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600" />Chief Architect Recommendation — Single Centralized Quality Master</p>
            <p className="text-xs text-muted-foreground mt-1">Build <span className="font-semibold text-emerald-700">one shared Quality Master</span> (Product → Approved Quality Specification) reused across all 5 quality touchpoints. Eliminates conflicting departmental standards and ensures a single source of truth for parameters, sampling, test methods & acceptance criteria.</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-3">
              {reuseFlow.map((s, i) => (
                <div key={s.stage} className={`rounded-lg border p-2 ${s.bg} border-transparent relative`}>
                  <div className="flex items-center gap-1">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{i + 1}</span>
                  </div>
                  <p className={`font-semibold text-[11px] mt-1 ${s.color}`}>{s.stage}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FolderTree className="h-4 w-4 text-teal-600" />QMS Sub-Module Overview — 7 Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {subModules.map(m => (
            <Card key={m.name} className={`p-3 ${m.bg} hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <Badge variant="outline" className="text-[9px]">{m.count}</Badge>
              </div>
              <p className="font-semibold text-sm">{m.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── QMS Standards Management ──────────────────────────────────────────
function QMSStandardsModule() {
  const summary = { total: 8, active: 6, approved: 1, draft: 1, superseded: 0 }
  const standards = [
    { code: 'FSSAI-2018', name: 'FSSAI 2018', type: 'FSSAI', version: 'v2.0', effective: '2025-11-15', expiry: '2028-11-14', approvedBy: 'Lakshmi V. (QA Head)', status: 'ACTIVE', supersedes: 'FSSAI-2011', scope: 'India Food Safety', clauses: 142 },
    { code: 'HACCP-REV7', name: 'HACCP Rev 7', type: 'HACCP', version: 'v1.0', effective: '2025-09-20', expiry: '2028-09-19', approvedBy: 'Lakshmi V. (QA Head)', status: 'ACTIVE', supersedes: 'HACCP-REV6', scope: 'Hazard Analysis', clauses: 7 },
    { code: 'ISO-22000', name: 'ISO 22000:2018', type: 'ISO', version: 'v2018', effective: '2025-08-10', expiry: '2028-08-09', approvedBy: 'Lakshmi V. (QA Head)', status: 'ACTIVE', supersedes: 'ISO-22000:2005', scope: 'Food Safety Mgmt', clauses: 10 },
    { code: 'BRCGS-I9', name: 'BRCGS Issue 9', type: 'BRCGS', version: 'v9.0', effective: '2025-12-05', expiry: '2026-12-04', approvedBy: 'Lakshmi V. (QA Head)', status: 'ACTIVE', supersedes: 'BRCGS-I8', scope: 'Global Food Safety', clauses: 9 },
    { code: 'INT-KK-001', name: 'Internal Kaju Katli Spec', type: 'INTERNAL', version: 'v2.3', effective: '2026-01-15', expiry: null, approvedBy: 'Suresh Mehta (QA Mgr)', status: 'ACTIVE', supersedes: 'INT-KK-001 v2.2', scope: 'Product Specification', clauses: 18 },
    { code: 'CUST-BB-001', name: 'Big Bazaar Customer Spec', type: 'CUSTOMER', version: 'v1.1', effective: '2025-10-01', expiry: '2026-10-01', approvedBy: 'Anil Reddy (Cust QA)', status: 'ACTIVE', supersedes: 'CUST-BB-001 v1.0', scope: 'Customer Requirement', clauses: 12 },
    { code: 'EXP-APEDA', name: 'APEDA Export Standard', type: 'EXPORT', version: 'v2025', effective: '2026-02-01', expiry: '2027-10-29', approvedBy: 'Lakshmi V. (QA Head)', status: 'APPROVED', supersedes: 'EXP-APEDA v2024', scope: 'Export Compliance', clauses: 24 },
    { code: 'FDA-FSMA', name: 'FDA FSMA', type: 'FSSAI', version: 'v1.0', effective: null, expiry: null, approvedBy: 'Pending QA Head', status: 'DRAFT', supersedes: null, scope: 'US Export Compliance', clauses: 0 },
  ]
  const typeColor: Record<string, string> = {
    FSSAI: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    ISO: 'bg-blue-100 text-blue-700 border-blue-300',
    HACCP: 'bg-purple-100 text-purple-700 border-purple-300',
    BRCGS: 'bg-amber-100 text-amber-700 border-amber-300',
    INTERNAL: 'bg-slate-100 text-slate-700 border-slate-300',
    CUSTOMER: 'bg-pink-100 text-pink-700 border-pink-300',
    EXPORT: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  }
  const statusColor: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-300',
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    SUPERSEDED: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-purple-600" />Standards Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 8 quality standards · FSSAI / HACCP / ISO 22000 / BRCGS / Internal / Customer / Export · Version-controlled approval workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Registry</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Standard</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Standards', value: summary.total, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Active', value: summary.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Approved (Pending)', value: summary.approved, icon: Stamp, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Draft', value: summary.draft, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Superseded', value: summary.superseded, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
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
          <h3 className="font-semibold text-sm flex items-center gap-2"><Award className="h-4 w-4 text-purple-600" />Quality Standards Registry — 8 Records</h3>
          <div className="flex items-center gap-2 text-[10px]">
            {Object.keys(typeColor).map(t => (
              <span key={t} className={`px-1.5 py-0.5 rounded ${typeColor[t]}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Standard Name</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Version</th>
                <th className="text-left p-2">Effective</th>
                <th className="text-left p-2">Expiry</th>
                <th className="text-left p-2">Approved By</th>
                <th className="text-center p-2">Clauses</th>
                <th className="text-left p-2">Supersedes</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {standards.map(s => (
                <tr key={s.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{s.code}</code></td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.scope}</p>
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${typeColor[s.type]}`}>{s.type}</Badge></td>
                  <td className="p-2 align-top"><span className="font-mono text-[11px] font-semibold">{s.version}</span></td>
                  <td className="p-2 align-top text-muted-foreground">{s.effective || <span className="text-slate-400 italic">—</span>}</td>
                  <td className="p-2 align-top text-muted-foreground">{s.expiry || <span className="text-slate-400 italic">no expiry</span>}</td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{s.approvedBy.split(' (')[0]}</p>
                    <p className="text-[10px] text-muted-foreground">{s.approvedBy.includes('(') ? s.approvedBy.match(/\(([^)]+)\)/)?.[1] : ''}</p>
                  </td>
                  <td className="p-2 align-top text-center font-semibold">{s.clauses || '—'}</td>
                  <td className="p-2 align-top">
                    {s.supersedes ? <code className="text-[9px] px-1 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through">{s.supersedes}</code> : <span className="text-slate-400 italic text-[10px]">—</span>}
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${statusColor[s.status]}`}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-blue-50 border-blue-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Approval Workflow & Version Control</p>
            <p className="text-xs text-muted-foreground mt-1">All standards follow a 4-stage approval workflow: <span className="font-semibold text-slate-700">Draft → Review → Approved → Active</span>. When a new version is activated, the previous version is automatically marked SUPERSEDED. Effective and expiry dates govern validity; expired standards are flagged for renewal. Each standard supersedes a prior version, preserving the complete audit trail.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
              {[
                { stage: '1 · Draft', desc: 'QA Manager creates new standard', color: 'bg-slate-100 text-slate-700', icon: FileText },
                { stage: '2 · Review', desc: 'Cross-functional review committee', color: 'bg-amber-100 text-amber-700', icon: ClipboardCheck },
                { stage: '3 · Approved', desc: 'QA Head signs off; awaiting effective date', color: 'bg-blue-100 text-blue-700', icon: Stamp },
                { stage: '4 · Active', desc: 'Live in production; supersedes prior', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
              ].map(s => (
                <div key={s.stage} className={`rounded-lg p-2 ${s.color}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className="h-3.5 w-3.5" />
                    <p className="text-[11px] font-bold uppercase tracking-wide">{s.stage}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── QMS Inspection Master ─────────────────────────────────────────────
function QMSInspectionMasterModule() {
  const inspectionTypes = [
    { code: 'IT-VISUAL', name: 'Visual Inspection', category: 'VISUAL', method: 'QUALITATIVE', unit: null, count: 8 },
    { code: 'IT-WEIGHT', name: 'Weight Check', category: 'WEIGHT', method: 'QUANTITATIVE', unit: 'g / kg', count: 6 },
    { code: 'IT-TEMP', name: 'Temperature', category: 'TEMPERATURE', method: 'QUANTITATIVE', unit: '°C', count: 5 },
    { code: 'IT-MOISTURE', name: 'Moisture Content', category: 'MOISTURE', method: 'QUANTITATIVE', unit: '%', count: 4 },
    { code: 'IT-TASTE', name: 'Taste Test', category: 'TASTE', method: 'QUALITATIVE', unit: null, count: 3 },
    { code: 'IT-COLOR', name: 'Color Check', category: 'COLOR', method: 'QUALITATIVE', unit: null, count: 4 },
    { code: 'IT-TEXTURE', name: 'Texture', category: 'TEXTURE', method: 'QUALITATIVE', unit: null, count: 3 },
    { code: 'IT-PACKAGING', name: 'Packaging Check', category: 'PACKAGING', method: 'QUALITATIVE', unit: null, count: 5 },
    { code: 'IT-METAL', name: 'Metal Detection', category: 'METAL_DETECTION', method: 'QUALITATIVE', unit: null, count: 2 },
    { code: 'IT-MICRO', name: 'Microbiological', category: 'MICROBIOLOGY', method: 'QUANTITATIVE', unit: 'CFU/g', count: 4 },
    { code: 'IT-CHEMICAL', name: 'Chemical Analysis', category: 'CHEMICAL', method: 'QUANTITATIVE', unit: 'ppm', count: 3 },
  ]
  const templates = [
    { code: 'ITPL-RM-001', name: 'Cashew RM Inspection', inspType: 'RAW_MATERIAL', scope: 'RAW_MATERIAL', product: 'Cashew Nuts W240', standard: 'INT-KK-001', sampling: 'SP-AQL-2.5', params: 9, status: 'ACTIVE' },
    { code: 'ITPL-RM-002', name: 'Sugar RM Inspection', inspType: 'RAW_MATERIAL', scope: 'RAW_MATERIAL', product: 'Sugar S30', standard: 'FSSAI-2018', sampling: 'SP-RANDOM', params: 6, status: 'ACTIVE' },
    { code: 'ITPL-RM-003', name: 'Ghee RM Inspection', inspType: 'RAW_MATERIAL', scope: 'RAW_MATERIAL', product: 'Cow Ghee', standard: 'FSSAI-2018', sampling: 'SP-AQL-1.0', params: 8, status: 'ACTIVE' },
    { code: 'ITPL-IP-001', name: 'Cooking IPQC', inspType: 'IN_PROCESS', scope: 'IN_PROCESS', product: 'Kaju Katli Mix', standard: 'INT-KK-001', sampling: 'SP-BATCH', params: 7, status: 'ACTIVE' },
    { code: 'ITPL-IP-002', name: 'Frying IPQC', inspType: 'IN_PROCESS', scope: 'IN_PROCESS', product: 'Namkeen Mix', standard: 'INT-NM-002', sampling: 'SP-BATCH', params: 6, status: 'ACTIVE' },
    { code: 'ITPL-FG-001', name: 'Kaju Katli FG Inspection', inspType: 'FINISHED_GOODS', scope: 'FINISHED_GOODS', product: 'Kaju Katli 500g', standard: 'INT-KK-001', sampling: 'SP-AQL-2.5', params: 11, status: 'ACTIVE' },
    { code: 'ITPL-FG-002', name: 'Namkeen FG Inspection', inspType: 'FINISHED_GOODS', scope: 'FINISHED_GOODS', product: 'Mixed Namkeen 500g', standard: 'INT-NM-002', sampling: 'SP-AQL-2.5', params: 10, status: 'ACTIVE' },
    { code: 'ITPL-PK-001', name: 'Packaging Label Inspection', inspType: 'PACKAGING', scope: 'PACKAGING', product: 'All Packaging', standard: 'FSSAI-2018', sampling: 'SP-FULL', params: 8, status: 'ACTIVE' },
  ]
  const scopeColor: Record<string, string> = {
    RAW_MATERIAL: 'bg-blue-100 text-blue-700 border-blue-300',
    IN_PROCESS: 'bg-amber-100 text-amber-700 border-amber-300',
    FINISHED_GOODS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PACKAGING: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const typeIcon: Record<string, any> = { VISUAL: Eye, WEIGHT: Gauge, TEMPERATURE: Thermometer, MOISTURE: Droplets, TASTE: Beaker, COLOR: Eye, TEXTURE: Beaker, PACKAGING: FileCheck, METAL_DETECTION: Shield, MICROBIOLOGY: Microscope, CHEMICAL: FlaskConical }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-indigo-600" />Inspection Master</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 11 inspection types · 8 inspection templates · Covers RM, IPQC, FG & packaging · Linked to standards, sampling plans & specifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Templates</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Template</Button>
        </div>
      </div>
      <Card className="p-4 bg-indigo-50 border-indigo-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FolderTree className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Inspection Types Catalogue — 11 Types</p>
            <p className="text-xs text-muted-foreground mt-1">Each inspection type maps to a measurement method (qualitative or quantitative) and unit. Templates combine multiple inspection types into a single inspection workflow.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
              {inspectionTypes.map(t => {
                const Icon = typeIcon[t.category] || ClipboardCheck
                return (
                  <div key={t.code} className="rounded-lg border border-indigo-200 bg-white p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="text-[10px] font-mono text-muted-foreground">{t.code}</span>
                    </div>
                    <p className="font-semibold text-[11px]">{t.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">{t.method}</span>
                      {t.unit && <span className="text-[9px] font-semibold text-indigo-600">{t.unit}</span>}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">{t.count} templates use this</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" />Inspection Templates — 8 Active (24 total, 20 active)</h3>
          <div className="flex items-center gap-2 text-[10px]">
            {Object.keys(scopeColor).map(s => (
              <span key={s} className={`px-1.5 py-0.5 rounded ${scopeColor[s]}`}>{s.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Template Name</th>
                <th className="text-left p-2">Scope</th>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Standard</th>
                <th className="text-left p-2">Sampling Plan</th>
                <th className="text-center p-2">Parameters</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{t.code}</code></td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.inspType.replace('_', ' ')}</p>
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${scopeColor[t.scope]}`}>{t.scope.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top">{t.product}</td>
                  <td className="p-2 align-top"><code className="text-[10px] text-purple-600">{t.standard}</code></td>
                  <td className="p-2 align-top"><code className="text-[10px] text-amber-600">{t.sampling}</code></td>
                  <td className="p-2 align-top text-center">
                    <span className="font-bold text-indigo-600">{t.params}</span>
                    <p className="text-[9px] text-muted-foreground">parameters</p>
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── QMS Quality Specifications ────────────────────────────────────────
function QMSSpecificationsModule() {
  const [expanded, setExpanded] = useState<string | null>('SPEC-KK-500')
  const specs = [
    {
      code: 'SPEC-KK-500', name: 'Kaju Katli 500g', version: 'v3.1', effective: '2026-01-15', approvedBy: 'Suresh Mehta (QA Mgr)', status: 'ACTIVE',
      params: [
        { name: 'Cashew Content', min: 60, max: 75, target: 70, tolerance: '±5', criticalLow: 55, criticalHigh: 80, unit: '%', severity: 'CRITICAL' },
        { name: 'Sugar Syrup Consistency', min: null, max: null, target: 'Soft ball stage (112-116°C)', tolerance: 'qualitative', criticalLow: null, criticalHigh: null, unit: '—', severity: 'MAJOR' },
        { name: 'Moisture Content', min: 4, max: 8, target: 6, tolerance: '±2', criticalLow: null, criticalHigh: 10, unit: '%', severity: 'MAJOR' },
        { name: 'Silver Foil Coverage', min: 90, max: 100, target: 95, tolerance: '±5', criticalLow: 80, criticalHigh: null, unit: '%', severity: 'MINOR' },
        { name: 'Thickness', min: 7, max: 9, target: 8, tolerance: '±1', criticalLow: 6, criticalHigh: 11, unit: 'mm', severity: 'MINOR' },
        { name: 'Color', min: null, max: null, target: 'Off-white to pale ivory', tolerance: 'visual match', criticalLow: null, criticalHigh: null, unit: '—', severity: 'MAJOR' },
        { name: 'Taste & Aroma', min: null, max: null, target: 'Sweet, no rancid/off-taste', tolerance: 'panel', criticalLow: null, criticalHigh: null, unit: '—', severity: 'CRITICAL' },
        { name: 'Free Fatty Acid (as oleic)', min: null, max: 0.5, target: 0.3, tolerance: '≤0.5', criticalLow: null, criticalHigh: 1.0, unit: '%', severity: 'CRITICAL' },
      ],
    },
    {
      code: 'SPEC-KK-1KG', name: 'Kaju Katli 1kg', version: 'v3.0', effective: '2026-01-15', approvedBy: 'Suresh Mehta (QA Mgr)', status: 'ACTIVE',
      params: [
        { name: 'Cashew Content', min: 60, max: 75, target: 70, tolerance: '±5', criticalLow: 55, criticalHigh: 80, unit: '%', severity: 'CRITICAL' },
        { name: 'Net Weight', min: 995, max: 1005, target: 1000, tolerance: '±5', criticalLow: 990, criticalHigh: 1010, unit: 'g', severity: 'CRITICAL' },
        { name: 'Moisture Content', min: 4, max: 8, target: 6, tolerance: '±2', criticalLow: null, criticalHigh: 10, unit: '%', severity: 'MAJOR' },
        { name: 'Piece Count', min: 70, max: 85, target: 78, tolerance: '±8', criticalLow: null, criticalHigh: null, unit: 'pcs', severity: 'MINOR' },
        { name: 'Shelf Life', min: 60, max: 90, target: 75, tolerance: 'qualitative', criticalLow: 45, criticalHigh: null, unit: 'days', severity: 'MAJOR' },
        { name: 'Peroxide Value', min: null, max: 5.0, target: 2.0, tolerance: '≤5.0', criticalLow: null, criticalHigh: 10.0, unit: 'meq/kg', severity: 'CRITICAL' },
      ],
    },
    {
      code: 'SPEC-IB-1KG', name: 'Shwet Idli Batter 1kg', version: 'v1.4', effective: '2025-11-20', approvedBy: 'Lakshmi V. (QA Head)', status: 'ACTIVE',
      params: [
        { name: 'Rice : Urad Dal Ratio', min: 3.0, max: 4.0, target: 3.5, tolerance: '±0.5', criticalLow: 2.5, criticalHigh: 4.5, unit: 'ratio', severity: 'CRITICAL' },
        { name: 'Net Weight', min: 995, max: 1005, target: 1000, tolerance: '±5', criticalLow: 990, criticalHigh: 1010, unit: 'g', severity: 'CRITICAL' },
        { name: 'pH', min: 4.2, max: 5.0, target: 4.6, tolerance: '±0.4', criticalLow: 3.8, criticalHigh: 5.4, unit: 'pH', severity: 'MAJOR' },
        { name: 'Total Titrable Acidity', min: 0.6, max: 1.2, target: 0.9, tolerance: '±0.3', criticalLow: null, criticalHigh: 1.5, unit: '%', severity: 'MAJOR' },
        { name: 'Salt Content', min: 1.0, max: 1.5, target: 1.2, tolerance: '±0.3', criticalLow: null, criticalHigh: 2.0, unit: '%', severity: 'MINOR' },
        { name: 'Microbial — Total Plate Count', min: null, max: 10000, target: 5000, tolerance: '≤10000', criticalLow: null, criticalHigh: 50000, unit: 'CFU/g', severity: 'CRITICAL' },
        { name: 'Coliform Count', min: null, max: 10, target: 0, tolerance: '≤10', criticalLow: null, criticalHigh: 100, unit: 'CFU/g', severity: 'CRITICAL' },
      ],
    },
    {
      code: 'SPEC-NM-500', name: 'Mixed Namkeen 500g', version: 'v2.2', effective: '2025-12-10', approvedBy: 'Suresh Mehta (QA Mgr)', status: 'ACTIVE',
      params: [
        { name: 'Net Weight', min: 497, max: 503, target: 500, tolerance: '±3', criticalLow: 495, criticalHigh: 505, unit: 'g', severity: 'CRITICAL' },
        { name: 'Moisture Content', min: 2, max: 5, target: 3, tolerance: '±1.5', criticalLow: null, criticalHigh: 7, unit: '%', severity: 'MAJOR' },
        { name: 'Oil Content', min: 22, max: 30, target: 26, tolerance: '±4', criticalLow: null, criticalHigh: 35, unit: '%', severity: 'MAJOR' },
        { name: 'Free Fatty Acid (as oleic)', min: null, max: 0.5, target: 0.25, tolerance: '≤0.5', criticalLow: null, criticalHigh: 1.0, unit: '%', severity: 'CRITICAL' },
        { name: 'Peroxide Value', min: null, max: 5.0, target: 1.5, tolerance: '≤5.0', criticalLow: null, criticalHigh: 10.0, unit: 'meq/kg', severity: 'CRITICAL' },
        { name: 'Salt Content', min: 1.5, max: 2.5, target: 2.0, tolerance: '±0.5', criticalLow: null, criticalHigh: null, unit: '%', severity: 'MINOR' },
        { name: 'Metal Detection (Fe/Non-Fe/SS)', min: null, max: 0, target: 0, tolerance: 'PASS', criticalLow: null, criticalHigh: null, unit: '—', severity: 'CRITICAL' },
        { name: 'Texture (Crispiness)', min: null, max: null, target: 'Crisp, no sogginess', tolerance: 'panel', criticalLow: null, criticalHigh: null, unit: '—', severity: 'MINOR' },
      ],
    },
  ]
  const severityColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    MAJOR: 'bg-amber-100 text-amber-700 border-amber-300',
    MINOR: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  const toggle = (code: string) => setExpanded(expanded === code ? null : code)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FolderTree className="h-6 w-6 text-teal-600" />Quality Specifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 18 product specifications (15 active) · Each parameter defines min/max/target/tolerance/critical limit/unit/severity · Click to expand parameter matrix</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Specs</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Specification</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Specifications', value: 18, icon: FolderTree, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
          { label: 'Active', value: 15, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Critical Parameters', value: 47, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Pending Approval', value: 3, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
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
      <div className="space-y-3">
        {specs.map(s => {
          const isOpen = expanded === s.code
          const critical = s.params.filter(p => p.severity === 'CRITICAL').length
          const major = s.params.filter(p => p.severity === 'MAJOR').length
          const minor = s.params.filter(p => p.severity === 'MINOR').length
          return (
            <Card key={s.code} className="overflow-hidden">
              <button onClick={() => toggle(s.code)} className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <FolderTree className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-semibold">{s.code}</code>
                      <span className="text-[10px] font-mono text-muted-foreground">{s.version}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Effective {s.effective} · Approved by {s.approvedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] bg-rose-100 text-rose-700 border-rose-300`}>{critical} CRIT</Badge>
                  <Badge variant="outline" className={`text-[9px] bg-amber-100 text-amber-700 border-amber-300`}>{major} MAJ</Badge>
                  <Badge variant="outline" className={`text-[9px] bg-blue-100 text-blue-700 border-blue-300`}>{minor} MIN</Badge>
                  <Badge variant="outline" className={`text-[9px] ${statusColor[s.status]}`}>{s.status}</Badge>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t bg-muted/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
                        <tr>
                          <th className="text-left p-2">Parameter</th>
                          <th className="text-center p-2">Min</th>
                          <th className="text-center p-2">Target</th>
                          <th className="text-center p-2">Max</th>
                          <th className="text-center p-2">Tolerance</th>
                          <th className="text-center p-2">Critical Low</th>
                          <th className="text-center p-2">Critical High</th>
                          <th className="text-center p-2">Unit</th>
                          <th className="text-center p-2">Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.params.map((p, i) => (
                          <tr key={i} className="border-t hover:bg-white">
                            <td className="p-2 align-top font-medium">{p.name}</td>
                            <td className="p-2 align-top text-center text-muted-foreground">{p.min ?? <span className="text-slate-400 italic">—</span>}</td>
                            <td className="p-2 align-top text-center font-semibold">{p.target}</td>
                            <td className="p-2 align-top text-center text-muted-foreground">{p.max ?? <span className="text-slate-400 italic">—</span>}</td>
                            <td className="p-2 align-top text-center"><code className="text-[10px] px-1 py-0.5 rounded bg-muted">{p.tolerance}</code></td>
                            <td className="p-2 align-top text-center text-rose-600">{p.criticalLow ?? <span className="text-slate-400 italic">—</span>}</td>
                            <td className="p-2 align-top text-center text-rose-600">{p.criticalHigh ?? <span className="text-slate-400 italic">—</span>}</td>
                            <td className="p-2 align-top text-center"><code className="text-[10px]">{p.unit}</code></td>
                            <td className="p-2 align-top text-center"><Badge variant="outline" className={`text-[9px] ${severityColor[p.severity]}`}>{p.severity}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2 bg-muted/20 border-t flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{s.params.length} parameters · {critical} critical · {major} major · {minor} minor</span>
                    <span>Auto-fail any critical-limit breach · NCR raised automatically</span>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── QMS Sampling Plans ────────────────────────────────────────────────
function QMSSamplingPlansModule() {
  const plans = [
    { code: 'SP-FULL', name: '100% Inspection', type: 'FULL_INSPECTION', aql: null, sampleSize: null, acceptance: null, rejection: null, status: 'ACTIVE', useCase: 'Critical packaging, labels, high-value items', risk: 'LOW' },
    { code: 'SP-RANDOM', name: 'Random Sampling 10%', type: 'RANDOM_SAMPLING', aql: null, sampleSize: 10, acceptance: null, rejection: null, status: 'ACTIVE', useCase: 'Low-risk RM lots, periodic verification', risk: 'MEDIUM' },
    { code: 'SP-AQL-2.5', name: 'AQL 2.5 General', type: 'AQL_SAMPLING', aql: '2.5', sampleSize: 50, acceptance: 3, rejection: 4, status: 'ACTIVE', useCase: 'Standard FG batches per ISO 2859-1', risk: 'MEDIUM' },
    { code: 'SP-AQL-1.0', name: 'AQL 1.0 Critical', type: 'AQL_SAMPLING', aql: '1.0', sampleSize: 80, acceptance: 2, rejection: 3, status: 'ACTIVE', useCase: 'Critical parameters (microbial, metal detection)', risk: 'HIGH' },
    { code: 'SP-BATCH', name: 'Batch Sampling', type: 'BATCH_SAMPLING', aql: null, sampleSize: 5, acceptance: 0, rejection: 1, status: 'ACTIVE', useCase: 'IPQC checks at cooking, frying, mixing stages', risk: 'MEDIUM' },
    { code: 'SP-RISK', name: 'Risk-Based Sampling', type: 'RISK_BASED', aql: null, sampleSize: 15, acceptance: 1, rejection: 2, status: 'ACTIVE', useCase: 'Dynamic sampling based on supplier risk score & history', risk: 'VARIABLE' },
  ]
  const typeDescriptions = [
    { type: 'FULL_INSPECTION', name: '100% Inspection', desc: 'Every unit in the lot is inspected. Used for critical-safety items, low-volume high-value products, or when AQL would yield zero-defect tolerance.', when: 'Packaging labels, metal detection, weights & measures' },
    { type: 'RANDOM_SAMPLING', name: 'Random Sampling', desc: 'Statistically random selection of a fixed percentage (e.g., 10%) from the lot. Simple and fast for low-risk verification.', when: 'RM lots from approved suppliers with good history' },
    { type: 'AQL_SAMPLING', name: 'AQL Sampling (ISO 2859-1)', desc: 'Acceptance Quality Limit sampling per ISO 2859-1. Defines sample size (n), acceptance number (Ac) and rejection number (Re) for given lot size and inspection level.', when: 'Standard production batches; configurable AQL (1.0/2.5/4.0)' },
    { type: 'BATCH_SAMPLING', name: 'Batch Sampling', desc: 'Fixed sample taken from each batch at process stage. Zero-defect policy (Ac=0, Re=1) for in-process checks.', when: 'IPQC at cooking, frying, mixing — one sample per batch' },
    { type: 'RISK_BASED', name: 'Risk-Based Sampling', desc: 'Dynamic sample size based on supplier risk score, defect history, seasonality, and parameter criticality. Higher risk → larger sample.', when: 'Suppliers with variable quality; new product launches' },
    { type: 'STRATIFIED', name: 'Stratified Sampling (planned)', desc: 'Lot divided into strata (e.g., by production shift, machine, time) and samples drawn from each stratum proportionally.', when: 'Multi-shift production; detecting shift-specific drift' },
  ]
  const typeColor: Record<string, string> = {
    FULL_INSPECTION: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    RANDOM_SAMPLING: 'bg-blue-100 text-blue-700 border-blue-300',
    AQL_SAMPLING: 'bg-amber-100 text-amber-700 border-amber-300',
    BATCH_SAMPLING: 'bg-purple-100 text-purple-700 border-purple-300',
    RISK_BASED: 'bg-rose-100 text-rose-700 border-rose-300',
    STRATIFIED: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  const riskColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-rose-100 text-rose-700',
    VARIABLE: 'bg-purple-100 text-purple-700',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Gauge className="h-6 w-6 text-amber-600" />Sampling Plans</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 6 sampling plans · 100% inspection, random, AQL 2.5/1.0, batch, risk-based · Aligned with ISO 2859-1 acceptance sampling</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Plans</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Sampling Plan</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Gauge className="h-4 w-4 text-amber-600" />Sampling Plans Registry — 6 Active</h3>
          <span className="text-[10px] text-muted-foreground">AQL = Acceptable Quality Limit · Ac = Acceptance # · Re = Rejection #</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Plan Name</th>
                <th className="text-left p-2">Type</th>
                <th className="text-center p-2">AQL</th>
                <th className="text-center p-2">Sample Size (n)</th>
                <th className="text-center p-2">Accept (Ac)</th>
                <th className="text-center p-2">Reject (Re)</th>
                <th className="text-center p-2">Risk</th>
                <th className="text-left p-2">Use Case</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{p.code}</code></td>
                  <td className="p-2 align-top font-medium">{p.name}</td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${typeColor[p.type]}`}>{p.type.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top text-center font-semibold">{p.aql ?? <span className="text-slate-400 italic">—</span>}</td>
                  <td className="p-2 align-top text-center font-bold text-amber-600">{p.sampleSize ?? '100%'}</td>
                  <td className="p-2 align-top text-center font-semibold text-emerald-600">{p.acceptance ?? '—'}</td>
                  <td className="p-2 align-top text-center font-semibold text-rose-600">{p.rejection ?? '—'}</td>
                  <td className="p-2 align-top text-center"><span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${riskColor[p.risk]}`}>{p.risk}</span></td>
                  <td className="p-2 align-top max-w-xs"><p className="text-[10px] text-muted-foreground">{p.useCase}</p></td>
                  <td className="p-2 align-top"><Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-amber-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Sampling Type Methodology — 6 Approaches</p>
            <p className="text-xs text-muted-foreground mt-1">Each sampling type defines how samples are selected and how the lot is accepted or rejected. Choose based on criticality, lot size, supplier risk and inspection cost.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
              {typeDescriptions.map(t => (
                <div key={t.type} className="rounded-lg border border-amber-200 bg-white p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className={`text-[9px] ${typeColor[t.type]}`}>{t.type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="font-semibold text-xs">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
                  <div className="mt-2 pt-2 border-t border-amber-100">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">When to use</p>
                    <p className="text-[10px] text-slate-700">{t.when}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── QMS Test Methods & Equipment ──────────────────────────────────────
function QMSTestMethodsModule() {
  const testMethods = [
    { code: 'TM-MOIST-OVEN', name: 'Moisture Oven Method', type: 'LABORATORY', duration: '4 hrs', standard: 'AOAC 950.46', equipmentCount: 2, status: 'ACTIVE' },
    { code: 'TM-WT-BAL', name: 'Weight Balance Method', type: 'INSTRUMENT', duration: '2 min', standard: 'ISO 9001', equipmentCount: 4, status: 'ACTIVE' },
    { code: 'TM-TEMP-DIG', name: 'Temperature Digital Probe', type: 'DIGITAL', duration: '30 sec', standard: 'ISO 17025', equipmentCount: 3, status: 'ACTIVE' },
    { code: 'TM-METAL-DET', name: 'Metal Detection Test', type: 'INSTRUMENT', duration: '1 min', standard: 'HACCP CCP', equipmentCount: 2, status: 'ACTIVE' },
    { code: 'TM-TPC', name: 'Total Plate Count', type: 'MICROBIOLOGICAL', duration: '72 hrs', standard: 'ISO 4833-1', equipmentCount: 3, status: 'ACTIVE' },
    { code: 'TM-FFA', name: 'Free Fatty Acid Titration', type: 'CHEMICAL', duration: '45 min', standard: 'AOAC 940.28', equipmentCount: 2, status: 'ACTIVE' },
    { code: 'TM-VIS-CHK', name: 'Visual Inspection Method', type: 'MANUAL', duration: '2 min', standard: 'Internal SOP-QA-01', equipmentCount: 0, status: 'ACTIVE' },
    { code: 'TM-TASTE-PNL', name: 'Taste Panel Evaluation', type: 'MANUAL', duration: '15 min', standard: 'Internal SOP-QA-02', equipmentCount: 0, status: 'ACTIVE' },
  ]
  const equipment = [
    { code: 'TE-MOIST-01', name: 'Moisture Meter TE-01', type: 'Moisture Analyzer', location: 'FG Lab', lastCalibrated: '2026-04-15', nextCalibration: '2026-07-15', calibrationStatus: 'DUE', certificate: 'CAL-2026-0451' },
    { code: 'TE-BAL-01', name: 'Precision Balance TE-BAL-01', type: 'Weighing Scale', location: 'RM Lab', lastCalibrated: '2026-05-20', nextCalibration: '2026-08-20', calibrationStatus: 'OK', certificate: 'CAL-2026-0387' },
    { code: 'TE-TMP-01', name: 'Digital Thermometer TE-TMP-01', type: 'Temperature Probe', location: 'Cooking Floor', lastCalibrated: '2026-06-10', nextCalibration: '2026-09-10', calibrationStatus: 'OK', certificate: 'CAL-2026-0412' },
    { code: 'TE-MD-01', name: 'Metal Detector TE-MD-01', type: 'Metal Detector', location: 'Packaging Line B', lastCalibrated: '2026-06-12', nextCalibration: '2026-07-12', calibrationStatus: 'OVERDUE', certificate: 'CAL-2026-0415' },
    { code: 'TE-MIC-01', name: 'Compound Microscope TE-MIC-01', type: 'Microscope', location: 'Micro Lab', lastCalibrated: '2026-03-05', nextCalibration: '2026-09-05', calibrationStatus: 'OK', certificate: 'CAL-2026-0298' },
  ]
  const typeColor: Record<string, string> = {
    MANUAL: 'bg-slate-100 text-slate-700 border-slate-300',
    LABORATORY: 'bg-purple-100 text-purple-700 border-purple-300',
    INSTRUMENT: 'bg-blue-100 text-blue-700 border-blue-300',
    DIGITAL: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    MICROBIOLOGICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    CHEMICAL: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const typeIcon: Record<string, any> = { MANUAL: Eye, LABORATORY: FlaskConical, INSTRUMENT: Gauge, DIGITAL: Thermometer, MICROBIOLOGICAL: Microscope, CHEMICAL: Beaker }
  const calColor: Record<string, string> = {
    OK: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    DUE: 'bg-amber-100 text-amber-700 border-amber-300',
    OVERDUE: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-rose-600" />Test Methods & Equipment</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 14 test methods (8 shown) · 12 equipment across 3 labs · Calibration tracking with NIST-traceable certificates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Wrench className="mr-1 h-4 w-4" />Calibration Schedule</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Test Method</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Test Methods', value: 14, icon: FlaskConical, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Equipment Count', value: 12, icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Calibration Due', value: 2, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Overdue', value: 1, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
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
          <h3 className="font-semibold text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-rose-600" />Test Methods Registry — 8 Active (14 total)</h3>
          <div className="flex items-center gap-2 text-[10px]">
            {Object.keys(typeColor).map(t => (
              <span key={t} className={`px-1.5 py-0.5 rounded ${typeColor[t]}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Method Name</th>
                <th className="text-left p-2">Type</th>
                <th className="text-center p-2">Duration</th>
                <th className="text-left p-2">Standard</th>
                <th className="text-center p-2">Equipment</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {testMethods.map(m => {
                const Icon = typeIcon[m.type] || FlaskConical
                return (
                  <tr key={m.code} className="border-t hover:bg-muted/20">
                    <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{m.code}</code></td>
                    <td className="p-2 align-top">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${typeColor[m.type]}`}>{m.type}</Badge></td>
                    <td className="p-2 align-top text-center font-mono text-[11px]">{m.duration}</td>
                    <td className="p-2 align-top"><code className="text-[10px] text-purple-600">{m.standard}</code></td>
                    <td className="p-2 align-top text-center font-semibold">{m.equipmentCount || <span className="text-slate-400 italic">—</span>}</td>
                    <td className="p-2 align-top"><Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">{m.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Wrench className="h-4 w-4 text-slate-600" />Test Equipment & Calibration — 5 Tracked (12 total)</h3>
          <span className="text-[10px] text-muted-foreground">NIST-traceable · ISO 17025 compliant</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Equipment Code</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Location</th>
                <th className="text-left p-2">Last Calibrated</th>
                <th className="text-left p-2">Next Calibration</th>
                <th className="text-left p-2">Certificate</th>
                <th className="text-center p-2">Calibration Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(e => (
                <tr key={e.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{e.code}</code></td>
                  <td className="p-2 align-top font-medium">{e.name}</td>
                  <td className="p-2 align-top text-muted-foreground">{e.type}</td>
                  <td className="p-2 align-top">{e.location}</td>
                  <td className="p-2 align-top text-muted-foreground">{e.lastCalibrated}</td>
                  <td className="p-2 align-top">
                    <span className={e.calibrationStatus === 'OVERDUE' ? 'font-semibold text-rose-600' : e.calibrationStatus === 'DUE' ? 'font-semibold text-amber-600' : 'text-muted-foreground'}>{e.nextCalibration}</span>
                  </td>
                  <td className="p-2 align-top"><code className="text-[10px] text-blue-600">{e.certificate}</code></td>
                  <td className="p-2 align-top text-center"><Badge variant="outline" className={`text-[9px] ${calColor[e.calibrationStatus]}`}>{e.calibrationStatus}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── QMS Quality Calendar ──────────────────────────────────────────────
function QMSCalendarModule() {
  const events = [
    { code: 'QCAL-001', type: 'EQUIPMENT_CALIBRATION', title: 'Metal Detector TE-MD-01 calibration', date: '2026-07-12', freq: 'MONTHLY', assigned: 'Suresh Mehta', status: 'OVERDUE' },
    { code: 'QCAL-002', type: 'EQUIPMENT_CALIBRATION', title: 'Moisture Meter TE-MOIST-01 calibration', date: '2026-07-15', freq: 'QUARTERLY', assigned: 'Anil Reddy', status: 'SCHEDULED' },
    { code: 'QCAL-003', type: 'INTERNAL_AUDIT', title: 'BRCGS internal audit — Q2 2026', date: '2026-07-20', freq: 'QUARTERLY', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
    { code: 'QCAL-004', type: 'ROUTINE_INSPECTION', title: 'GMP monthly inspection — Thane plant', date: '2026-07-25', freq: 'MONTHLY', assigned: 'Anil Reddy', status: 'SCHEDULED' },
    { code: 'QCAL-005', type: 'CERTIFICATION_RENEWAL', title: 'FSSAI license renewal', date: '2026-08-01', freq: 'ANNUAL', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
    { code: 'QCAL-006', type: 'TRAINING', title: 'HACCP refresher training — all QA staff', date: '2026-08-08', freq: 'SEMIANNUAL', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
    { code: 'QCAL-007', type: 'REGULATORY_INSPECTION', title: 'FSSAI regulatory inspection', date: '2026-08-15', freq: 'ANNUAL', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
    { code: 'QCAL-008', type: 'EQUIPMENT_CALIBRATION', title: 'Balance TE-BAL-01 calibration', date: '2026-06-20', freq: 'QUARTERLY', assigned: 'Anil Reddy', status: 'COMPLETED' },
  ]
  const typeColor: Record<string, string> = {
    EQUIPMENT_CALIBRATION: 'bg-slate-100 text-slate-700 border-slate-300',
    INTERNAL_AUDIT: 'bg-purple-100 text-purple-700 border-purple-300',
    ROUTINE_INSPECTION: 'bg-blue-100 text-blue-700 border-blue-300',
    CERTIFICATION_RENEWAL: 'bg-amber-100 text-amber-700 border-amber-300',
    TRAINING: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    REGULATORY_INSPECTION: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const typeIcon: Record<string, any> = {
    EQUIPMENT_CALIBRATION: Wrench,
    INTERNAL_AUDIT: ShieldCheck,
    ROUTINE_INSPECTION: ClipboardCheck,
    CERTIFICATION_RENEWAL: Award,
    TRAINING: BookOpen,
    REGULATORY_INSPECTION: Shield,
  }
  const statusColor: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-300',
    OVERDUE: 'bg-rose-100 text-rose-700 border-rose-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const overdue = events.filter(e => e.status === 'OVERDUE').length
  const scheduled = events.filter(e => e.status === 'SCHEDULED').length
  const completed = events.filter(e => e.status === 'COMPLETED').length
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-blue-600" />Quality Calendar</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 8 upcoming quality events · Calibration, audits, inspections, certifications, training · Timeline view sorted by date</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Calendar</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Schedule Event</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Scheduled', value: scheduled, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
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
      {overdue > 0 && (
        <Card className="p-4 bg-rose-50 border-rose-300">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-rose-600" />{overdue} Overdue Event{overdue > 1 ? 's' : ''} — Immediate Action Required</p>
              <p className="text-xs text-muted-foreground mt-1">Metal Detector TE-MD-01 calibration overdue by 3 days. Critical HACCP CCP — must calibrate before next production run. Assigned to Suresh Mehta.</p>
              <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]"><Wrench className="mr-1 h-3 w-3" />Schedule Calibration Now</Button>
            </div>
          </div>
        </Card>
      )}
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600" />Quality Events Timeline — {events.length} Events</h3>
          <div className="flex items-center gap-2 text-[10px]">
            {Object.keys(typeColor).map(t => (
              <span key={t} className={`px-1.5 py-0.5 rounded ${typeColor[t]}`}>{t.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-3 p-4">
            {sorted.map(e => {
              const Icon = typeIcon[e.type] || Calendar
              const isOverdue = e.status === 'OVERDUE'
              const isCompleted = e.status === 'COMPLETED'
              return (
                <div key={e.code} className="relative flex items-start gap-4 pl-2">
                  <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-rose-100' : isCompleted ? 'bg-emerald-100' : 'bg-blue-100'} border-2 border-background`}>
                    <Icon className={`h-4 w-4 ${isOverdue ? 'text-rose-600' : isCompleted ? 'text-emerald-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 pb-3 border-b last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{e.code}</code>
                          <p className="font-semibold text-sm">{e.title}</p>
                          {isOverdue && <Badge variant="outline" className="text-[9px] bg-rose-100 text-rose-700 border-rose-300 animate-pulse">OVERDUE</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          <span className="font-semibold">{e.date}</span> · {e.freq} · Assigned to {e.assigned}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-[9px] ${typeColor[e.type]}`}>{e.type.replace('_', ' ')}</Badge>
                        <Badge variant="outline" className={`text-[9px] ${statusColor[e.status]}`}>{e.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── QMS Quality Organization / Departments ────────────────────────────
function QMSDepartmentsModule() {
  const departments = [
    { code: 'QD-THN-01', name: 'Thane Quality Department', plant: 'THN — Thane Plant', manager: 'Lakshmi V.', role: 'QA Head', inspectionScope: 'ALL', defaultLab: 'Central Lab', staff: 14, status: 'ACTIVE' },
    { code: 'QD-THN-02', name: 'Raw Material Lab', plant: 'THN — Thane Plant', manager: 'Anil Reddy', role: 'RM Lab Manager', inspectionScope: 'RAW_MATERIAL', defaultLab: 'RM Lab', staff: 5, status: 'ACTIVE' },
    { code: 'QD-THN-03', name: 'Finished Goods Lab', plant: 'THN — Thane Plant', manager: 'Suresh Mehta', role: 'FG Lab Manager', inspectionScope: 'FINISHED_GOODS', defaultLab: 'FG Lab', staff: 6, status: 'ACTIVE' },
  ]
  const roles = [
    { role: 'Inspector', level: 'L1', staff: 12, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: ClipboardCheck,
      perms: [
        { name: 'Perform inspections', granted: true },
        { name: 'Record results', granted: true },
        { name: 'Raise NCR', granted: true },
        { name: 'Approve lot release', granted: false },
        { name: 'Reject lot', granted: false },
        { name: 'Approve CAPA', granted: false },
        { name: 'Sign COA', granted: false },
        { name: 'Calibrate equipment', granted: false },
      ] },
    { role: 'Supervisor', level: 'L2', staff: 4, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Shield,
      perms: [
        { name: 'Perform inspections', granted: true },
        { name: 'Record results', granted: true },
        { name: 'Raise NCR', granted: true },
        { name: 'Approve lot release', granted: true },
        { name: 'Reject lot', granted: true },
        { name: 'Approve CAPA', granted: true },
        { name: 'Sign COA', granted: false },
        { name: 'Calibrate equipment', granted: false },
      ] },
    { role: 'Manager', level: 'L3', staff: 2, color: 'bg-purple-50 border-purple-200 text-purple-700', icon: Stamp,
      perms: [
        { name: 'Perform inspections', granted: true },
        { name: 'Record results', granted: true },
        { name: 'Raise NCR', granted: true },
        { name: 'Approve lot release', granted: true },
        { name: 'Reject lot', granted: true },
        { name: 'Approve CAPA', granted: true },
        { name: 'Sign COA', granted: true },
        { name: 'Calibrate equipment', granted: false },
      ] },
    { role: 'Head', level: 'L4', staff: 1, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: Award,
      perms: [
        { name: 'Perform inspections', granted: true },
        { name: 'Record results', granted: true },
        { name: 'Raise NCR', granted: true },
        { name: 'Approve lot release', granted: true },
        { name: 'Reject lot', granted: true },
        { name: 'Approve CAPA', granted: true },
        { name: 'Sign COA', granted: true },
        { name: 'Calibrate equipment', granted: true },
      ] },
  ]
  const scopeColor: Record<string, string> = {
    ALL: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    RAW_MATERIAL: 'bg-blue-100 text-blue-700 border-blue-300',
    FINISHED_GOODS: 'bg-amber-100 text-amber-700 border-amber-300',
    IN_PROCESS: 'bg-purple-100 text-purple-700 border-purple-300',
    PACKAGING: 'bg-pink-100 text-pink-700 border-pink-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-emerald-600" />Quality Organization</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 49 · 3 quality departments at Thane Plant · 4-tier role hierarchy (Inspector → Supervisor → Manager → Head) · RBAC permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Org Chart</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Department</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Departments', value: 3, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'QA Staff', value: 19, icon: Users2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Labs', value: 3, icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Role Tiers', value: 4, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
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
          <h3 className="font-semibold text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-600" />Quality Departments — 3 Active</h3>
          <span className="text-[10px] text-muted-foreground">All at Thane Plant (THN)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Department Name</th>
                <th className="text-left p-2">Plant</th>
                <th className="text-left p-2">Manager</th>
                <th className="text-left p-2">Inspection Scope</th>
                <th className="text-left p-2">Default Lab</th>
                <th className="text-center p-2">Staff</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{d.code}</code></td>
                  <td className="p-2 align-top font-medium">{d.name}</td>
                  <td className="p-2 align-top text-muted-foreground">{d.plant}</td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{d.manager}</p>
                    <p className="text-[10px] text-muted-foreground">{d.role}</p>
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${scopeColor[d.inspectionScope]}`}>{d.inspectionScope.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top">{d.defaultLab}</td>
                  <td className="p-2 align-top text-center font-semibold">{d.staff}</td>
                  <td className="p-2 align-top"><Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">{d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-600" />Quality Role Hierarchy & Permissions — 4 Tiers</h3>
          <span className="text-[10px] text-muted-foreground">RBAC · Each role inherits lower-tier permissions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {roles.map(r => (
            <div key={r.role} className={`rounded-lg border-2 p-3 ${r.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center">
                  <r.icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="text-[9px] bg-white/80">{r.level}</Badge>
              </div>
              <p className="font-semibold text-sm">{r.role}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{r.staff} staff{r.staff > 1 ? ' members' : ' member'}</p>
              <div className="space-y-1">
                {r.perms.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-[10px]">
                    <span className={p.granted ? '' : 'text-muted-foreground/60 line-through'}>{p.name}</span>
                    {p.granted ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <span className="text-[9px] text-muted-foreground">✗</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 bg-emerald-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Segregation of Duties & Audit Trail</p>
            <p className="text-xs text-muted-foreground mt-1">Each quality action — lot release, NCR raise, CAPA approval, COA signing, equipment calibration — requires a specific role tier. Inspector cannot approve their own lot release; Supervisor cannot sign COA; only Head can authorize equipment calibration. All actions are recorded in the audit trail with user, timestamp and reason code.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Lot Release</p>
                <p className="text-xs font-semibold">Supervisor+</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">CAPA Approval</p>
                <p className="text-xs font-semibold">Supervisor+</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">COA Signing</p>
                <p className="text-xs font-semibold">Manager+</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Calibration</p>
                <p className="text-xs font-semibold">Head only</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
