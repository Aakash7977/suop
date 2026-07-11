#!/usr/bin/env python3
"""
Append Sprint 56 (CAPA) + Sprint 57 (COA/Compliance) frontend modules
to /home/z/my-project/src/app/page.tsx

Modules added:
  Sprint 56:
    - CAPADashboardModule          (capadashboard)
    - CorrectiveActionsModule      (correctiveactions)
    - PreventiveActionsModule      (preventiveactions)
    - EffectivenessReviewModule    (effectivenessreview)
    - ContinuousImprovementModule  (continuousimprovement)
  Sprint 57:
    - COADashboardModule           (coadashboard)
    - CertificateGeneratorModule   (coagenerator)
    - ComplianceDocumentLibraryModule (compliancedocs)
    - RegulatoryComplianceModule   (regulatorycompliance)
    - COAComplianceDashboardModule (coacompliancedashboard)
"""

import re

PAGE_PATH = "/home/z/my-project/src/app/page.tsx"

# ─────────────────────────────────────────────────────────────────────────
# Sprint 56 — CAPA modules
# ─────────────────────────────────────────────────────────────────────────
SPRINT_56_MODULES = r'''
// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 56 — CAPA (Corrective & Preventive Actions) MODULES
// ═══════════════════════════════════════════════════════════════════════════════

type CapaTab = 'overview' | 'open' | 'effectiveness' | 'closed'

function CAPADashboardModule() {
  const [tab, setTab] = useState<CapaTab>('overview')
  const [showCreate, setShowCreate] = useState(false)
  const tabs: Array<{ key: CapaTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'open', label: 'Open CAPAs', icon: <FileWarning className="h-4 w-4" /> },
    { key: 'effectiveness', label: 'Effectiveness Review', icon: <CheckCircle2 className="h-4 w-4" /> },
    { key: 'closed', label: 'Closed CAPAs', icon: <Archive className="h-4 w-4" /> },
  ]

  const capaRecords = [
    {
      capaNumber: 'CAPA-2026-000001', sourceNcrNumber: 'NCR-2026-000018',
      department: 'PRODUCTION', plant: 'MUMBAI-P1',
      capaType: 'BOTH', priority: 'HIGH', riskLevel: 'HIGH', riskScore: 72,
      title: 'Kaju Katli batch rejected for moisture content > 8%',
      rootCause: 'Cooling tunnel humidifier sensor drift; recalibration overdue by 5 months.',
      ownerName: 'Rajesh Kumar', assignedToRole: 'PRODUCTION_MANAGER',
      dueDate: '2026-07-25', status: 'IN_PROGRESS',
      effectivenessStatus: 'PENDING',
      estimatedCost: 18500, actualCost: null, costSaved: null,
      actionCount: 4, completedActions: 2,
    },
    {
      capaNumber: 'CAPA-2026-000002', sourceNcrNumber: 'NCR-2026-000021',
      department: 'WAREHOUSE', plant: 'MUMBAI-P1',
      capaType: 'CORRECTIVE', priority: 'MEDIUM', riskLevel: 'MODERATE', riskScore: 36,
      title: 'Cross-contact allergen risk: Tree nuts adjacent to dairy',
      rootCause: 'Putaway rule did not enforce allergen segregation.',
      ownerName: 'Priya Sharma', assignedToRole: 'WAREHOUSE_MANAGER',
      dueDate: '2026-07-20', status: 'AWAITING_VERIFICATION',
      effectivenessStatus: 'IN_PROGRESS',
      estimatedCost: 4200, actualCost: 3850, costSaved: null,
      actionCount: 2, completedActions: 2,
    },
    {
      capaNumber: 'CAPA-2026-000003', sourceReference: 'COMP-2026-000007',
      department: 'QUALITY', plant: 'MUMBAI-P1',
      capaType: 'BOTH', priority: 'CRITICAL', riskLevel: 'CATASTROPHIC', riskScore: 96,
      title: 'Customer complaint: Metal shaving in Kaju Katli 1kg box',
      rootCause: 'Worn cutter blade + metal detector sensitivity threshold too high (3.0mm vs 2.5mm per SOP).',
      ownerName: 'Anil Verma', assignedToRole: 'QUALITY_HEAD',
      dueDate: '2026-07-15', status: 'AWAITING_VERIFICATION',
      effectivenessStatus: 'IN_PROGRESS',
      estimatedCost: 86000, actualCost: 78500, costSaved: 240000,
      actionCount: 5, completedActions: 4,
    },
    {
      capaNumber: 'CAPA-2026-000004', sourceReference: 'AUDIT-INT-2026-012',
      department: 'MAINTENANCE', plant: 'MUMBAI-P1',
      capaType: 'PREVENTIVE', priority: 'LOW', riskLevel: 'LOW', riskScore: 12,
      title: 'Internal audit: 3 equipment past preventive maintenance',
      rootCause: 'PM calendar not synchronized with new shift pattern.',
      ownerName: 'Sanjay Patel', assignedToRole: 'MAINTENANCE_MANAGER',
      dueDate: '2026-07-18', status: 'CLOSED',
      effectivenessStatus: 'EFFECTIVE',
      estimatedCost: 12500, actualCost: 11800, costSaved: 35000,
      actionCount: 2, completedActions: 2,
    },
  ]

  const filtered = capaRecords.filter(c => {
    if (tab === 'open') return ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_VERIFICATION'].includes(c.status)
    if (tab === 'effectiveness') return c.status === 'AWAITING_VERIFICATION' || c.effectivenessStatus === 'IN_PROGRESS'
    if (tab === 'closed') return c.status === 'CLOSED'
    return true
  })

  const priorityColor: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-red-100 text-red-700',
  }
  const statusColor: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    AWAITING_VERIFICATION: 'bg-purple-100 text-purple-700',
    CLOSED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-slate-100 text-slate-500 line-through',
  }
  const riskColor: Record<string, string> = {
    LOW: 'text-emerald-600',
    MODERATE: 'text-blue-600',
    HIGH: 'text-amber-600',
    CATASTROPHIC: 'text-red-600 font-bold',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-rose-950 via-red-900 to-orange-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Enterprise CAPA Center
            </h2>
            <p className="text-rose-200 text-sm max-w-3xl">
              Corrective and Preventive Action engine — every NCR, complaint, audit finding, or
              management review item becomes a measurable improvement with effectiveness verification.
              Auto-escalation, overdue tracking, and continuous improvement register integration.
            </p>
          </div>
          <Badge className="bg-rose-500 text-rose-950 hover:bg-rose-500">Sprint 56 · PART 6 QMS</Badge>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Open CAPAs</p>
            <FileWarning className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold">11</p>
          <p className="text-[10px] text-muted-foreground mt-1">2 overdue</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Awaiting Verification</p>
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">4</p>
          <p className="text-[10px] text-muted-foreground mt-1">Effectiveness rate 87.5%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Closed YTD</p>
            <Archive className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold">13</p>
          <p className="text-[10px] text-muted-foreground mt-1">Avg closure 14.2 days</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Cost Saved YTD</p>
            <IndianRupee className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold">₹2,85,400</p>
          <p className="text-[10px] text-muted-foreground mt-1">From 13 closed CAPAs</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />New CAPA
        </Button>
      </div>

      {showCreate && (
        <Card className="p-6 border-2 border-rose-200 bg-rose-50/50">
          <h3 className="font-semibold mb-4">Create New CAPA</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>NCR</option><option>COMPLAINT</option><option>AUDIT</option><option>INTERNAL</option><option>MANAGEMENT_REVIEW</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Source Reference</Label>
              <Input placeholder="NCR-2026-000018 or AUDIT-INT-2026-012" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>QUALITY</option><option>PRODUCTION</option><option>MAINTENANCE</option><option>WAREHOUSE</option><option>PROCUREMENT</option><option>ENGINEERING</option><option>HR</option><option>FOOD_SAFETY</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option>LOW</option><option>MODERATE</option><option>HIGH</option><option>CATASTROPHIC</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Title</Label>
              <Input placeholder="Brief title describing the issue" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Problem Statement</Label>
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Detailed problem statement..." />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Root Cause (initial hypothesis)</Label>
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Root cause hypothesis — formal analysis happens after assignment" />
            </div>
            <div className="md:col-span-3 flex items-end gap-2">
              <Button size="sm"><CheckCircle2 className="mr-1 h-4 w-4" />Create CAPA (Draft)</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.capaNumber} className="border rounded-lg p-4 hover:bg-muted/30">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-semibold text-blue-700">{c.capaNumber}</span>
                    <Badge variant="outline" className={`text-[10px] ${priorityColor[c.priority]}`}>{c.priority}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[c.status]}`}>{c.status.replace(/_/g, ' ')}</Badge>
                    <span className={`text-[10px] ${riskColor[c.riskLevel]}`}>RISK: {c.riskLevel} (RPN {c.riskScore})</span>
                    <span className="text-[10px] text-muted-foreground">{c.capaType}</span>
                  </div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Root Cause:</strong> {c.rootCause}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>Source: {c.sourceNcrNumber || c.sourceReference}</span>
                    <span>·</span>
                    <span>Dept: {c.department}</span>
                    <span>·</span>
                    <span>Owner: {c.ownerName}</span>
                    <span>·</span>
                    <span>Due: {c.dueDate}</span>
                    <span>·</span>
                    <span>Actions: {c.completedActions}/{c.actionCount} complete</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Actions</Button>
                    {c.status === 'AWAITING_VERIFICATION' && (
                      <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700">Verify</Button>
                    )}
                    {c.status === 'CLOSED' && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs">Audit Trail</Button>
                    )}
                  </div>
                  {(c.estimatedCost || c.costSaved) && (
                    <div className="text-[10px] text-muted-foreground text-right">
                      {c.estimatedCost && <div>Est: ₹{c.estimatedCost.toLocaleString('en-IN')}</div>}
                      {c.costSaved && <div className="text-emerald-600 font-semibold">Saved: ₹{c.costSaved.toLocaleString('en-IN')}</div>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(c.completedActions / c.actionCount) * 100}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-24 text-right">{Math.round((c.completedActions / c.actionCount) * 100)}% complete</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-amber-50/50 border-amber-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900">Chief Architect Recommendation — Auto-CAPA Severity Rules (Sudhamrit)</p>
            <p className="text-xs text-amber-800 mt-1">
              Configure automatic CAPA generation based on NCR severity:
              <strong> Minor NCR</strong> → Supervisor approval + simple corrective action.
              <strong> Major NCR</strong> → Full CAPA + effectiveness verification + department manager approval.
              <strong> Critical / Food Safety NCR</strong> → Immediate quarantine + CAPA + management review + effectiveness verification + mandatory batch genealogy linkage.
              Every CAPA must have at least one preventive action — corrective alone is insufficient.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function CorrectiveActionsModule() {
  const [filter, setFilter] = useState('ALL')
  const actions = [
    { capaNumber: 'CAPA-2026-000001', actionCategory: 'EQUIPMENT_CALIBRATION', actionTitle: 'Recalibrate humidifier sensor #HT-04', responsiblePerson: 'Maintenance Team', dueDate: '2026-07-09', status: 'COMPLETED', verifiedAt: '2026-07-09T15:00:00Z', evidenceUrl: '/evidence/calib-ht04.pdf' },
    { capaNumber: 'CAPA-2026-000001', actionCategory: 'RECIPE_CORRECTION', actionTitle: 'Re-inspect batch KK-250-2026-145', responsiblePerson: 'Quality Team', dueDate: '2026-07-09', status: 'COMPLETED', verifiedAt: '2026-07-09T17:00:00Z', evidenceUrl: '/evidence/reinspect.pdf' },
    { capaNumber: 'CAPA-2026-000002', actionCategory: 'PACKAGING_CHANGE', actionTitle: 'Move cashew bags to nut-only zone Z-03-A', responsiblePerson: 'Warehouse Team', dueDate: '2026-07-06', status: 'COMPLETED', verifiedAt: '2026-07-06T16:00:00Z' },
    { capaNumber: 'CAPA-2026-000003', actionCategory: 'EQUIPMENT_CALIBRATION', actionTitle: 'Replace cutter blade PL2-CUT-03 + recalibrate metal detector', responsiblePerson: 'Maintenance', dueDate: '2026-07-05', status: 'COMPLETED', verifiedAt: '2026-07-05T18:00:00Z' },
    { capaNumber: 'CAPA-2026-000003', actionCategory: 'SPECIFICATION_UPDATE', actionTitle: 'Reset metal detector sensitivity to 2.5mm Fe / 3.0mm Non-Fe per SOP-QA-021', responsiblePerson: 'Quality Team', dueDate: '2026-07-05', status: 'COMPLETED', verifiedAt: '2026-07-05T19:00:00Z' },
    { capaNumber: 'CAPA-2026-000003', actionCategory: 'CLEANING_REVISION', actionTitle: 'Recall and inspect batch KK-1KG-2026-138 (450 boxes)', responsiblePerson: 'Production + QA', dueDate: '2026-07-07', status: 'COMPLETED', verifiedAt: '2026-07-07T12:00:00Z' },
    { capaNumber: 'CAPA-2026-000004', actionCategory: 'MACHINE_REPAIR', actionTitle: 'Complete overdue PM for M-03, CV-07, O-02', responsiblePerson: 'Maintenance Team', dueDate: '2026-07-08', status: 'COMPLETED', verifiedAt: '2026-07-08T16:00:00Z' },
  ]
  const categories = ['ALL', 'MACHINE_REPAIR', 'OPERATOR_RETRAINING', 'RECIPE_CORRECTION', 'SUPPLIER_REPLACEMENT', 'PACKAGING_CHANGE', 'CLEANING_REVISION', 'SPECIFICATION_UPDATE', 'EQUIPMENT_CALIBRATION']

  const filtered = filter === 'ALL' ? actions : actions.filter(a => a.actionCategory === filter)

  const statusBadge: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    VERIFIED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-slate-100 text-slate-500 line-through',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-orange-950 via-amber-900 to-yellow-900 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Corrective Actions</h2>
        <p className="text-amber-200 text-sm max-w-3xl">
          Machine repair, operator retraining, recipe correction, supplier replacement, packaging change,
          cleaning revision, specification update, equipment calibration — every corrective action is tracked
          with responsible person, due date, evidence, and verification.
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={cn('text-xs px-3 py-1 rounded-full border transition-colors',
                filter === c ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">CAPA #</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Responsible</th>
                <th className="text-left px-4 py-3">Due</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Verified</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-[11px] text-blue-700">{a.capaNumber}</td>
                  <td className="px-4 py-3 text-[11px]"><Badge variant="outline" className="text-[10px]">{a.actionCategory.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-4 py-3 text-sm font-medium">{a.actionTitle}</td>
                  <td className="px-4 py-3 text-xs">{a.responsiblePerson}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.dueDate}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`text-[10px] ${statusBadge[a.status]}`}>{a.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-muted-foreground font-mono">{a.verifiedAt ? a.verifiedAt.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><FileText className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">{a.status === 'COMPLETED' ? 'View Evidence' : 'Update'}</Button>
                    </div>
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

function PreventiveActionsModule() {
  const actions = [
    { capaNumber: 'CAPA-2026-000001', actionCategory: 'ADDITIONAL_INSPECTION', actionTitle: 'Add humidity sensor check to daily pre-start checklist', responsiblePerson: 'Production Supervisor', status: 'IN_PROGRESS', targetDate: '2026-07-15', progress: 60 },
    { capaNumber: 'CAPA-2026-000001', actionCategory: 'NEW_SOP', actionTitle: 'Update SOP-MFG-014: Humidifier calibration every 4 months', responsiblePerson: 'Quality Manager', status: 'OPEN', targetDate: '2026-07-20', progress: 0 },
    { capaNumber: 'CAPA-2026-000002', actionCategory: 'AUTOMATION', actionTitle: 'Update WMS putaway rule to enforce allergen distance ≥ 3m', responsiblePerson: 'IT + Quality', status: 'COMPLETED', targetDate: '2026-07-07', progress: 100 },
    { capaNumber: 'CAPA-2026-000003', actionCategory: 'TRAINING', actionTitle: 'Operator retraining on metal detector sensitivity check (every shift start)', responsiblePerson: 'HR + Quality', status: 'COMPLETED', targetDate: '2026-07-09', progress: 100 },
    { capaNumber: 'CAPA-2026-000003', actionCategory: 'QUALITY_GATE', actionTitle: 'Add 2.5mm Fe test piece challenge at start, middle, end of every shift', responsiblePerson: 'Quality Manager', status: 'IN_PROGRESS', targetDate: '2026-07-12', progress: 75 },
    { capaNumber: 'CAPA-2026-000004', actionCategory: 'AUTOMATION', actionTitle: 'Auto-sync PM calendar with shift schedule changes', responsiblePerson: 'IT', status: 'COMPLETED', targetDate: '2026-07-10', progress: 100 },
  ]

  const categoryDescription: Record<string, string> = {
    NEW_SOP: 'Create new Standard Operating Procedure to formalize the corrected process',
    TRAINING: 'Train operators, supervisors, or vendors on the updated procedure',
    ADDITIONAL_INSPECTION: 'Add periodic inspection to catch drift before it becomes a defect',
    MACHINE_UPGRADE: 'Replace or upgrade equipment to eliminate root cause',
    SUPPLIER_AUDIT: 'Audit supplier to prevent recurrence of incoming material issues',
    RECIPE_VALIDATION: 'Validate updated recipe at pilot scale before production rollout',
    AUTOMATION: 'Automate the control check to remove human error',
    QUALITY_GATE: 'Add a hard quality gate that blocks production if check fails',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-cyan-900 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Preventive Actions</h2>
        <p className="text-emerald-200 text-sm max-w-3xl">
          Prevent recurrence — every CAPA must include at least one preventive action.
          Types: New SOP, Training, Additional Inspection, Machine Upgrade, Supplier Audit,
          Recipe Validation, Automation, Quality Gate.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Preventive</p><ShieldCheck className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">18</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Completed</p><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">12</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">In Progress</p><Activity className="h-5 w-5 text-amber-600" /></div>
          <p className="text-2xl font-bold">4</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Open</p><Clock className="h-5 w-5 text-blue-600" /></div>
          <p className="text-2xl font-bold">2</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          {actions.map((a, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-blue-700">{a.capaNumber}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50">{a.actionCategory.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
                  </div>
                  <p className="font-medium text-sm">{a.actionTitle}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{categoryDescription[a.actionCategory]}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>Owner: {a.responsiblePerson}</span>
                    <span>·</span>
                    <span>Target: {a.targetDate}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs">Update</Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${a.progress}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-12 text-right">{a.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function EffectivenessReviewModule() {
  const verifications = [
    {
      verificationNumber: 'VER-2026-000001', capaNumber: 'CAPA-2026-000004',
      verificationMethod: 'AUDIT', waitingPeriodDays: 30, plannedDate: '2026-08-12', actualDate: '2026-07-13',
      inspectorName: 'Audit Team', verificationResult: 'EFFECTIVE', effectivenessScore: 95,
      evidenceUrl: '/evidence/ver-001.pdf', remarks: 'PM calendar auto-sync verified across 3 schedule changes. No overdue PMs since fix.',
      followUpRequired: false, status: 'COMPLETED',
    },
    {
      verificationNumber: 'VER-2026-000002', capaNumber: 'CAPA-2026-000002',
      verificationMethod: 'INSPECTION', waitingPeriodDays: 14, plannedDate: '2026-07-20', actualDate: null,
      inspectorName: 'Warehouse Manager', verificationResult: null, effectivenessScore: null,
      remarks: 'Waiting period ongoing — verify allergen segregation in next weekly cycle count.',
      followUpRequired: false, status: 'IN_PROGRESS',
    },
    {
      verificationNumber: 'VER-2026-000003', capaNumber: 'CAPA-2026-000003',
      verificationMethod: 'KPI_MONITORING', waitingPeriodDays: 45, plannedDate: '2026-08-25', actualDate: null,
      inspectorName: 'Quality Head', verificationResult: null, effectivenessScore: null,
      remarks: 'KPI: Customer complaints related to foreign matter. Target: 0 in next 90 days for affected customer.',
      followUpRequired: false, status: 'PLANNED',
    },
    {
      verificationNumber: 'VER-2026-000004', capaNumber: 'CAPA-2026-000001',
      verificationMethod: 'DATA_ANALYSIS', waitingPeriodDays: 30, plannedDate: '2026-08-09', actualDate: null,
      inspectorName: 'Quality Manager', verificationResult: null, effectivenessScore: null,
      remarks: 'Track moisture readings for batches produced after humidifier recalibration. Target: <6% for 30 consecutive batches.',
      followUpRequired: false, status: 'PLANNED',
    },
  ]

  const resultColor: Record<string, string> = {
    EFFECTIVE: 'bg-emerald-100 text-emerald-700',
    INEFFECTIVE: 'bg-red-100 text-red-700',
    PARTIALLY_EFFECTIVE: 'bg-amber-100 text-amber-700',
  }
  const statusColor: Record<string, string> = {
    PLANNED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-950 via-fuchsia-900 to-pink-900 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Effectiveness Verification</h2>
        <p className="text-purple-200 text-sm max-w-3xl">
          A CAPA is not closed until effectiveness is verified. Workflow: Action Completed → Waiting Period →
          Verification Audit → Effective? → Close (or → New CAPA if ineffective). Tracks verification result,
          evidence, inspector, date, and remarks.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Verifications</p><FileCheck2 className="h-5 w-5 text-purple-600" /></div>
          <p className="text-2xl font-bold">11</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Effective</p><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">9</p>
          <p className="text-[10px] text-emerald-600 mt-1">87.5% effectiveness rate</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Ineffective → New CAPA</p><AlertTriangle className="h-5 w-5 text-red-600" /></div>
          <p className="text-2xl font-bold">1</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">In Progress / Planned</p><Clock className="h-5 w-5 text-amber-600" /></div>
          <p className="text-2xl font-bold">1</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          {verifications.map(v => (
            <div key={v.verificationNumber} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-blue-700">{v.verificationNumber}</span>
                    <span className="text-[10px] text-muted-foreground">linked to</span>
                    <span className="font-mono text-[11px] text-blue-700">{v.capaNumber}</span>
                    <Badge variant="outline" className="text-[10px]">{v.verificationMethod.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[v.status]}`}>{v.status}</Badge>
                    {v.verificationResult && (
                      <Badge className={`text-[10px] ${resultColor[v.verificationResult]}`}>{v.verificationResult.replace(/_/g, ' ')}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Method:</strong> {v.verificationMethod.replace(/_/g, ' ')} · <strong>Waiting:</strong> {v.waitingPeriodDays} days</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Planned:</strong> {v.plannedDate} · <strong>Actual:</strong> {v.actualDate || '—'}</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Inspector:</strong> {v.inspectorName}</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Remarks:</strong> {v.remarks}</p>
                  {v.effectivenessScore !== null && (
                    <p className="text-xs mt-1"><strong className="text-muted-foreground">Score:</strong> <span className="font-bold text-emerald-700">{v.effectivenessScore}/100</span></p>
                  )}
                  {v.followUpRequired && (
                    <Badge className="bg-red-100 text-red-700 text-[10px] mt-2">Follow-up CAPA required</Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {v.status === 'PLANNED' && <Button size="sm" variant="outline" className="h-7 text-xs">Schedule</Button>}
                  {v.status === 'IN_PROGRESS' && <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700">Submit Result</Button>}
                  {v.status === 'COMPLETED' && <Button size="sm" variant="ghost" className="h-7 text-xs">View Evidence</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ContinuousImprovementModule() {
  const [filter, setFilter] = useState('ALL')
  const improvements = [
    { ciNumber: 'CI-2026-000001', title: 'Reduce Kaju Katli moisture variation', improvementType: 'KAIZEN', status: 'IN_PROGRESS', progressPercent: 65, department: 'PRODUCTION', championName: 'Rajesh Kumar', baselineValue: 8.4, targetValue: 5.5, actualValue: 6.1, unitOfMeasure: '%', estimatedSavings: 85000, actualSavings: null, implementationCost: 22000, roiPercent: 286.4, startDate: '2026-06-01', targetDate: '2026-07-31' },
    { ciNumber: 'CI-2026-000002', title: 'OEE improvement on Packaging Line 2', improvementType: 'OEE_IMPROVEMENT', status: 'COMPLETED', progressPercent: 100, department: 'PRODUCTION', championName: 'Anil Verma', baselineValue: 68, targetValue: 78, actualValue: 79.2, unitOfMeasure: '%', estimatedSavings: 142000, actualSavings: 158000, implementationCost: 45000, roiPercent: 351.1, startDate: '2026-04-01', targetDate: '2026-06-30', completedDate: '2026-06-25' },
    { ciNumber: 'CI-2026-000003', title: 'Reduce sugar waste in cooking line', improvementType: 'WASTE_REDUCTION', status: 'IN_PROGRESS', progressPercent: 40, department: 'PRODUCTION', championName: 'Sanjay Patel', baselineValue: 4.2, targetValue: 2.0, actualValue: 3.1, unitOfMeasure: '%', estimatedSavings: 95000, actualSavings: null, implementationCost: 18000, roiPercent: null, startDate: '2026-06-15', targetDate: '2026-08-31' },
    { ciNumber: 'CI-2026-000004', title: 'Energy saving: Replace boiler with high-efficiency unit', improvementType: 'ENERGY_SAVING', status: 'PROPOSED', progressPercent: 0, department: 'ENGINEERING', championName: 'Engineering Team', baselineValue: 850, targetValue: 600, actualValue: null, unitOfMeasure: 'kWh/day', estimatedSavings: 225000, actualSavings: null, implementationCost: 850000, roiPercent: 26.5, startDate: null, targetDate: '2026-12-31' },
    { ciNumber: 'CI-2026-000005', title: '5S implementation in raw material warehouse', improvementType: 'LEAN', status: 'COMPLETED', progressPercent: 100, department: 'WAREHOUSE', championName: 'Priya Sharma', baselineValue: 38, targetValue: 95, actualValue: 92, unitOfMeasure: '% audit score', estimatedSavings: 35000, actualSavings: 38000, implementationCost: 8500, roiPercent: 447.1, startDate: '2026-03-01', targetDate: '2026-05-31', completedDate: '2026-05-28' },
    { ciNumber: 'CI-2026-000006', title: 'Cost saving: Bulk sugar procurement from direct mill', improvementType: 'COST_SAVING', status: 'COMPLETED', progressPercent: 100, department: 'PROCUREMENT', championName: 'Procurement Team', baselineValue: 42, targetValue: 38, actualValue: 37.2, unitOfMeasure: '₹/kg', estimatedSavings: 180000, actualSavings: 192000, implementationCost: 5000, roiPercent: 3740.0, startDate: '2026-02-01', targetDate: '2026-03-31', completedDate: '2026-03-20' },
  ]
  const types = ['ALL', 'KAIZEN', 'LEAN', 'WASTE_REDUCTION', 'OEE_IMPROVEMENT', 'QUALITY_IMPROVEMENT', 'COST_SAVING', 'ENERGY_SAVING']
  const filtered = filter === 'ALL' ? improvements : improvements.filter(i => i.improvementType === filter)

  const typeColor: Record<string, string> = {
    KAIZEN: 'bg-blue-100 text-blue-700',
    LEAN: 'bg-purple-100 text-purple-700',
    WASTE_REDUCTION: 'bg-amber-100 text-amber-700',
    OEE_IMPROVEMENT: 'bg-emerald-100 text-emerald-700',
    QUALITY_IMPROVEMENT: 'bg-rose-100 text-rose-700',
    COST_SAVING: 'bg-teal-100 text-teal-700',
    ENERGY_SAVING: 'bg-cyan-100 text-cyan-700',
  }
  const statusColor: Record<string, string> = {
    PROPOSED: 'bg-slate-100 text-slate-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    ON_HOLD: 'bg-orange-100 text-orange-700',
    CANCELLED: 'bg-slate-100 text-slate-500 line-through',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-violet-900 to-purple-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Continuous Improvement Register</h2>
            <p className="text-indigo-200 text-sm max-w-3xl">
              Kaizen, Lean, Waste Reduction, OEE Improvement, Quality Improvement, Cost Saving, Energy Saving —
              every improvement project tracked with baseline, target, actual, savings, ROI, and impact metrics.
            </p>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-amber-950"><Plus className="mr-2 h-4 w-4" />New Improvement</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Projects</p><Activity className="h-5 w-5 text-indigo-600" /></div>
          <p className="text-2xl font-bold">18</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Active</p><PlayCircle className="h-5 w-5 text-amber-600" /></div>
          <p className="text-2xl font-bold">7</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Completed YTD</p><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">9</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Savings YTD</p><IndianRupee className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">₹4,12,500</p>
          <p className="text-[10px] text-emerald-600 mt-1">ROI 285.4% on ₹1.45L investment</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn('text-xs px-3 py-1 rounded-full border transition-colors',
                filter === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(imp => (
            <div key={imp.ciNumber} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-blue-700">{imp.ciNumber}</span>
                    <Badge className={`text-[10px] ${typeColor[imp.improvementType]}`}>{imp.improvementType.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[imp.status]}`}>{imp.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="font-medium text-sm">{imp.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>Dept: {imp.department}</span>
                    <span>·</span>
                    <span>Champion: {imp.championName}</span>
                    <span>·</span>
                    <span>Start: {imp.startDate || '—'}</span>
                    <span>·</span>
                    <span>Target: {imp.targetDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  {imp.actualSavings && (
                    <p className="text-emerald-700 font-bold text-sm">₹{imp.actualSavings.toLocaleString('en-IN')}</p>
                  )}
                  {imp.roiPercent && (
                    <p className="text-[10px] text-muted-foreground">ROI {imp.roiPercent.toFixed(1)}%</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground">Baseline</p>
                  <p className="font-mono font-semibold">{imp.baselineValue} {imp.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Target</p>
                  <p className="font-mono font-semibold">{imp.targetValue} {imp.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Actual</p>
                  <p className={`font-mono font-semibold ${imp.actualValue !== null && imp.actualValue <= imp.targetValue ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {imp.actualValue !== null ? `${imp.actualValue} ${imp.unitOfMeasure}` : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${imp.progressPercent}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-12 text-right">{imp.progressPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
'''

# ─────────────────────────────────────────────────────────────────────────
# Sprint 57 — COA & Compliance modules
# ─────────────────────────────────────────────────────────────────────────
SPRINT_57_MODULES = r'''
// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 57 — COA, COMPLIANCE & REGULATORY CONTROL MODULES
// ═══════════════════════════════════════════════════════════════════════════════

type COATab = 'overview' | 'drafts' | 'signed' | 'distributed' | 'blocked'

function COADashboardModule() {
  const [tab, setTab] = useState<COATab>('overview')
  const tabs: Array<{ key: COATab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'drafts', label: 'Drafts', icon: <FileText className="h-4 w-4" /> },
    { key: 'signed', label: 'Signed', icon: <FileCheck2 className="h-4 w-4" /> },
    { key: 'distributed', label: 'Distributed', icon: <Send className="h-4 w-4" /> },
    { key: 'blocked', label: 'Blocked', icon: <AlertTriangle className="h-4 w-4" /> },
  ]

  const coas = [
    {
      coaNumber: 'COA-2026-000001', batchNumber: 'KK-250-2026-145', productName: 'Kaju Katli 250g',
      manufactureDate: '2026-07-08', expiryDate: '2026-10-06',
      customerName: 'Pune Distributors Pvt Ltd', customerPoNumber: 'PO-2026-0231',
      regulatoryStandard: 'FSSAI', signedBy: 'Dr. Anil Verma', signedAt: '2026-07-10T12:00:00Z',
      status: 'SIGNED', testCount: 8, allTestsPassed: true,
      fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true,
    },
    {
      coaNumber: 'COA-2026-000002', batchNumber: 'BP-250-2026-092', productName: 'Badam Pista Roll 250g',
      manufactureDate: '2026-07-05', expiryDate: '2026-10-03',
      customerName: 'Bengaluru Retail Chain', customerPoNumber: 'PO-2026-0228',
      regulatoryStandard: 'FSSAI', signedBy: 'Dr. Anil Verma', signedAt: '2026-07-07T11:00:00Z',
      status: 'DISTRIBUTED', testCount: 3, allTestsPassed: true,
      fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true,
    },
    {
      coaNumber: 'COA-2026-000003', batchNumber: 'CW-100-2026-218', productName: 'Chocolate Wafer 100g',
      manufactureDate: '2026-07-10', expiryDate: '2027-01-10',
      customerName: 'Export Customer - Dubai', customerPoNumber: 'PO-EXP-2026-0018',
      regulatoryStandard: 'EXPORT_COMPLIANCE', signedBy: null, signedAt: null,
      status: 'DRAFT', testCount: 0, allTestsPassed: false,
      fgqcPassed: true, labApproved: false, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true,
      blockedReason: 'Awaiting lab approval for export parameter: Aflatoxin B1',
    },
    {
      coaNumber: 'COA-2026-000004', batchNumber: 'KK-500-2026-088', productName: 'Kaju Katli 500g',
      manufactureDate: '2026-07-09', expiryDate: '2026-10-07',
      customerName: 'Mumbai Restaurant Group', customerPoNumber: 'PO-2026-0234',
      regulatoryStandard: 'FSSAI', signedBy: null, signedAt: null,
      status: 'DRAFT', testCount: 8, allTestsPassed: true,
      fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true,
    },
    {
      coaNumber: 'COA-2026-000005', batchNumber: 'CW-100-2026-216', productName: 'Chocolate Wafer 100g',
      manufactureDate: '2026-07-08', expiryDate: '2027-01-08',
      customerName: 'Goa Distributor', customerPoNumber: 'PO-2026-0230',
      regulatoryStandard: 'FSSAI', signedBy: 'Dr. Anil Verma', signedAt: '2026-07-09T15:00:00Z',
      status: 'SIGNED', testCount: 5, allTestsPassed: true,
      fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true,
    },
  ]

  const filtered = coas.filter(c => {
    if (tab === 'drafts') return c.status === 'DRAFT'
    if (tab === 'signed') return c.status === 'SIGNED'
    if (tab === 'distributed') return c.status === 'DISTRIBUTED'
    if (tab === 'blocked') return !c.allTestsPassed || c.blockedReason
    return true
  })

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    GENERATED: 'bg-blue-100 text-blue-700',
    SIGNED: 'bg-emerald-100 text-emerald-700',
    DISTRIBUTED: 'bg-purple-100 text-purple-700',
    ARCHIVED: 'bg-slate-100 text-slate-500',
    REVOKED: 'bg-red-100 text-red-700',
    SUPERSEDED: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-cyan-950 via-blue-900 to-indigo-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <FileCheck2 className="h-7 w-7" /> Certificate of Analysis (COA) Center
            </h2>
            <p className="text-cyan-200 text-sm max-w-3xl">
              Auto-generate regulatory COA documents from approved laboratory + FGQC data.
              Includes digital signature, QR code for verification, version control,
              and immutable archival. Blocks generation until all pre-conditions verified.
            </p>
          </div>
          <Badge className="bg-cyan-500 text-cyan-950 hover:bg-cyan-500">Sprint 57 · PART 6 QMS</Badge>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total COAs (YTD)</p><FileText className="h-5 w-5 text-blue-600" /></div>
          <p className="text-2xl font-bold">156</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Pending Signature</p><PenTool className="h-5 w-5 text-amber-600" /></div>
          <p className="text-2xl font-bold">6</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Blocked Batches</p><AlertTriangle className="h-5 w-5 text-red-600" /></div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-[10px] text-red-600 mt-1">Lab approval pending</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Avg Generation Time</p><Clock className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">1.8s</p>
          <p className="text-[10px] text-emerald-600 mt-1">Target <3s ✓</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Generate COA</Button>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-3 py-3">COA #</th>
                <th className="text-left px-3 py-3">Batch</th>
                <th className="text-left px-3 py-3">Product</th>
                <th className="text-left px-3 py-3">Customer</th>
                <th className="text-left px-3 py-3">Standard</th>
                <th className="text-center px-3 py-3">Tests</th>
                <th className="text-center px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Signed</th>
                <th className="text-right px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.coaNumber} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-3 font-mono text-[11px] text-blue-700">{c.coaNumber}</td>
                  <td className="px-3 py-3 font-mono text-[11px]">{c.batchNumber}</td>
                  <td className="px-3 py-3 text-xs font-medium">{c.productName}</td>
                  <td className="px-3 py-3 text-xs">{c.customerName}</td>
                  <td className="px-3 py-3"><Badge variant="outline" className="text-[10px]">{c.regulatoryStandard.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-3 py-3 text-center text-xs">
                    <span className={c.allTestsPassed ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>{c.testCount}</span>
                  </td>
                  <td className="px-3 py-3 text-center"><Badge className={`text-[10px] ${statusColor[c.status]}`}>{c.status}</Badge></td>
                  <td className="px-3 py-3 text-[10px] text-muted-foreground font-mono">{c.signedAt ? c.signedAt.split('T')[0] : '—'}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><QrCode className="h-3.5 w-3.5" /></Button>
                      {c.status === 'DRAFT' && c.allTestsPassed && <Button size="sm" className="h-7 text-xs">Sign</Button>}
                      {c.status === 'SIGNED' && <Button size="sm" variant="outline" className="h-7 text-xs">Distribute</Button>}
                      {c.status === 'DISTRIBUTED' && <Button size="sm" variant="ghost" className="h-7 text-xs">Archive</Button>}
                      {c.blockedReason && <Button size="sm" variant="outline" className="h-7 text-xs text-red-700 border-red-300">View Block</Button>}
                    </div>
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

function CertificateGeneratorModule() {
  const [selectedBatch, setSelectedBatch] = useState('KK-250-2026-145')
  const [selectedTemplate, setSelectedTemplate] = useState('COA-TMPL-KK-001')
  const [selectedStandard, setSelectedStandard] = useState('FSSAI')

  const eligibleBatches = [
    { batch: 'KK-250-2026-145', product: 'Kaju Katli 250g', customer: 'Pune Distributors', fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true, eligible: true },
    { batch: 'BP-250-2026-092', product: 'Badam Pista Roll 250g', customer: 'Bengaluru Retail', fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true, eligible: true },
    { batch: 'CW-100-2026-218', product: 'Chocolate Wafer 100g', customer: 'Export - Dubai', fgqcPassed: true, labApproved: false, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true, eligible: false, blockedReason: 'Aflatoxin B1 result pending' },
    { batch: 'KK-500-2026-088', product: 'Kaju Katli 500g', customer: 'Mumbai Restaurant', fgqcPassed: true, labApproved: true, shelfLifeValid: true, packagingApproved: true, foodSafetyPassed: true, eligible: true },
  ]

  const templates = [
    { code: 'COA-TMPL-KK-001', name: 'Kaju Katli Standard Template', standard: 'FSSAI', active: true },
    { code: 'COA-TMPL-BP-001', name: 'Badam Pista Roll Template', standard: 'FSSAI', active: true },
    { code: 'COA-TMPL-CW-EXP-001', name: 'Chocolate Wafer Export Template', standard: 'EXPORT_COMPLIANCE', active: true },
    { code: 'COA-TMPL-GENERIC-FSSAI', name: 'Generic FSSAI Template', standard: 'FSSAI', active: true },
  ]

  const selectedBatchData = eligibleBatches.find(b => b.batch === selectedBatch)

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-900 text-white border-0">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <FileCheck2 className="h-7 w-7" /> COA Generator
        </h2>
        <p className="text-blue-200 text-sm max-w-3xl">
          Generate Certificate of Analysis from approved lab + FGQC data. Validates all pre-conditions
          (FGQC, Lab, Shelf-life, Packaging, Food Safety) before allowing generation. Includes digital
          signature and QR code for customer verification.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Step 1: Select Eligible Batch</h3>
          <div className="space-y-2">
            {eligibleBatches.map(b => (
              <button key={b.batch} onClick={() => setSelectedBatch(b.batch)}
                className={cn('w-full text-left p-3 rounded-md border transition-colors',
                  selectedBatch === b.batch ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                  !b.eligible && 'opacity-60')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[11px] text-blue-700">{b.batch}</p>
                    <p className="text-sm font-medium">{b.product}</p>
                    <p className="text-[10px] text-muted-foreground">{b.customer}</p>
                  </div>
                  <div className="text-right">
                    {b.eligible ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" />Eligible</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-[10px]"><AlertTriangle className="mr-1 h-3 w-3" />Blocked</Badge>
                    )}
                  </div>
                </div>
                {b.blockedReason && <p className="text-[10px] text-red-600 mt-1">⚠ {b.blockedReason}</p>}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Step 2: Pre-Condition Validation</h3>
          {selectedBatchData ? (
            <div className="space-y-2">
              {[
                { label: 'FGQC Passed', value: selectedBatchData.fgqcPassed },
                { label: 'Laboratory Approved', value: selectedBatchData.labApproved },
                { label: 'Shelf-Life Valid', value: selectedBatchData.shelfLifeValid },
                { label: 'Packaging Approved', value: selectedBatchData.packagingApproved },
                { label: 'Food Safety Passed', value: selectedBatchData.foodSafetyPassed },
              ].map(check => (
                <div key={check.label} className={cn('flex items-center justify-between p-2 rounded border', check.value ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
                  <span className="text-sm">{check.label}</span>
                  {check.value ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                </div>
              ))}
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">All checks must pass to generate COA. Any failure blocks generation per validation rule.</p>
                <Button size="sm" disabled={!selectedBatchData.eligible} className="w-full">
                  {selectedBatchData.eligible ? (
                    <><FileCheck2 className="mr-2 h-4 w-4" />Generate COA</>
                  ) : (
                    <><AlertTriangle className="mr-2 h-4 w-4" />Blocked — Resolve Issues</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a batch to view pre-conditions.</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Step 3: Template & Standard</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>COA Template</Label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              {templates.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Regulatory Standard</Label>
            <select value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option>FSSAI</option><option>ISO_22000</option><option>HACCP</option><option>BRCGS</option><option>EXPORT_COMPLIANCE</option><option>CUSTOMER_SPEC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Customer (Optional)</Label>
            <Input placeholder="Select customer for customer-specific COA" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <QrCode className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-blue-900">QR Code Verification (Chief Architect Recommendation)</p>
            <p className="text-xs text-blue-800 mt-1">
              Every generated COA includes a QR code that allows customers, distributors, or auditors to verify
              the certificate&apos;s authenticity and view the approved batch information without exposing
              confidential internal data. The QR links to a public verification page that displays: certificate
              number, batch number, product name, manufacture/expiry date, signed-by name + role, signature
              timestamp, and signature hash (for tamper verification).
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ComplianceDocumentLibraryModule() {
  const [filter, setFilter] = useState('ALL')
  const documents = [
    { documentCode: 'DOC-2026-000001', documentType: 'COA', title: 'COA - KK-250-2026-145 - Kaju Katli 250g', linkedBatch: 'KK-250-2026-145', version: 1, status: 'APPROVED', signedBy: 'Dr. Anil Verma', signedAt: '2026-07-10T12:00:00Z', isImmutable: true, qrVerificationEnabled: true, retentionYears: 7, fileSizeBytes: 184320, createdAt: '2026-07-10T11:30:00Z' },
    { documentCode: 'DOC-2026-000002', documentType: 'COC', title: 'Certificate of Conformity - BP-250-2026-092', linkedBatch: 'BP-250-2026-092', version: 1, status: 'APPROVED', signedBy: 'Quality Manager', signedAt: '2026-07-07T11:00:00Z', isImmutable: true, qrVerificationEnabled: true, retentionYears: 7, fileSizeBytes: 102400, createdAt: '2026-07-07T10:30:00Z' },
    { documentCode: 'DOC-2026-000003', documentType: 'LAB_REPORT', title: 'Microbiological Lab Report - KK-250-2026-145', linkedBatch: 'KK-250-2026-145', version: 1, status: 'APPROVED', signedBy: 'Lab Director', signedAt: '2026-07-10T11:00:00Z', isImmutable: true, qrVerificationEnabled: true, retentionYears: 7, fileSizeBytes: 256000, createdAt: '2026-07-10T10:00:00Z' },
    { documentCode: 'DOC-2026-000004', documentType: 'CALIBRATION_CERT', title: 'Calibration Certificate - Humidifier HT-04', version: 1, status: 'APPROVED', signedBy: 'Calibration Lab', signedAt: '2026-07-09T15:00:00Z', isImmutable: true, qrVerificationEnabled: false, retentionYears: 5, fileSizeBytes: 89000, createdAt: '2026-07-09T14:00:00Z' },
    { documentCode: 'DOC-2026-000005', documentType: 'AUDIT_REPORT', title: 'Internal Audit Report - July 2026', version: 2, status: 'APPROVED', signedBy: 'Audit Team Lead', signedAt: '2026-07-05T17:00:00Z', isImmutable: true, qrVerificationEnabled: false, retentionYears: 10, fileSizeBytes: 425000, createdAt: '2026-07-05T16:30:00Z' },
    { documentCode: 'DOC-2026-000006', documentType: 'INSPECTION_REPORT', title: 'Packaging Line Inspection - PL2 - July', version: 1, status: 'APPROVED', signedBy: 'QC Inspector', signedAt: '2026-07-08T16:00:00Z', isImmutable: true, qrVerificationEnabled: true, retentionYears: 5, fileSizeBytes: 168000, createdAt: '2026-07-08T15:30:00Z' },
    { documentCode: 'DOC-2026-000007', documentType: 'CLEANING_RECORD', title: 'Deep Cleaning Record - Cooling Tunnel 1 - July', version: 1, status: 'APPROVED', signedBy: 'Sanitation Lead', signedAt: '2026-07-03T18:00:00Z', isImmutable: true, qrVerificationEnabled: false, retentionYears: 3, fileSizeBytes: 64000, createdAt: '2026-07-03T17:30:00Z' },
  ]
  const types = ['ALL', 'COA', 'COC', 'INSPECTION_REPORT', 'LAB_REPORT', 'AUDIT_REPORT', 'CALIBRATION_CERT', 'CLEANING_RECORD']
  const filtered = filter === 'ALL' ? documents : documents.filter(d => d.documentType === filter)

  const typeIcon: Record<string, React.ReactNode> = {
    COA: <FileCheck2 className="h-4 w-4 text-blue-600" />,
    COC: <ShieldCheck className="h-4 w-4 text-purple-600" />,
    INSPECTION_REPORT: <ClipboardCheck className="h-4 w-4 text-amber-600" />,
    LAB_REPORT: <FlaskConical className="h-4 w-4 text-cyan-600" />,
    AUDIT_REPORT: <FileText className="h-4 w-4 text-rose-600" />,
    CALIBRATION_CERT: <Gauge className="h-4 w-4 text-emerald-600" />,
    CLEANING_RECORD: <Archive className="h-4 w-4 text-slate-600" />,
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Archive className="h-7 w-7" /> Compliance Document Library
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl">
              Centralized library for all compliance documents — COA, COC, inspection reports, lab reports,
              audit reports, calibration certificates, cleaning records. Version controlled, digitally signed,
              QR-verifiable, immutable after approval, with configurable retention.
            </p>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-amber-950"><Upload className="mr-2 h-4 w-4" />Upload Document</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Documents</p><Archive className="h-5 w-5 text-slate-600" /></div><p className="text-2xl font-bold">506</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Immutable (Approved)</p><Lock className="h-5 w-5 text-emerald-600" /></div><p className="text-2xl font-bold">489</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">QR-Enabled</p><QrCode className="h-5 w-5 text-blue-600" /></div><p className="text-2xl font-bold">312</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Pending Approval</p><Clock className="h-5 w-5 text-amber-600" /></div><p className="text-2xl font-bold">17</p></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn('text-xs px-3 py-1 rounded-full border transition-colors',
                filter === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(d => (
            <div key={d.documentCode} className="border rounded-lg p-3 hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  {typeIcon[d.documentType]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-blue-700">{d.documentCode}</span>
                    <Badge variant="outline" className="text-[10px]">{d.documentType.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px]">v{d.version}</Badge>
                    {d.isImmutable && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]"><Lock className="mr-1 h-3 w-3" />Immutable</Badge>}
                    {d.qrVerificationEnabled && <Badge className="bg-blue-100 text-blue-700 text-[10px]"><QrCode className="mr-1 h-3 w-3" />QR</Badge>}
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{d.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    {d.linkedBatch && <span>Batch: {d.linkedBatch}</span>}
                    <span>Signed: {d.signedBy}</span>
                    <span>·</span>
                    <span>{d.signedAt.split('T')[0]}</span>
                    <span>·</span>
                    <span>Retention: {d.retentionYears}y</span>
                    <span>·</span>
                    <span>{(d.fileSizeBytes / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
                  {d.qrVerificationEnabled && <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><QrCode className="h-3.5 w-3.5" /></Button>}
                  <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function RegulatoryComplianceModule() {
  const compliances = [
    { complianceCode: 'COMP-FSSAI-001', standardName: 'FSSAI', standardVersion: '2024', issuingAuthority: 'Food Safety and Standards Authority of India', certificateNumber: 'FSS-12345678990123', issuedDate: '2026-01-15', expiryDate: '2027-01-14', renewalDueDate: '2026-12-14', scopeDescription: 'All Sudhamrit manufacturing units in Maharashtra', approvalStatus: 'APPROVED', nextAuditDate: '2026-10-15', lastAuditDate: '2026-04-12', status: 'ACTIVE' },
    { complianceCode: 'COMP-ISO22000-001', standardName: 'ISO_22000', standardVersion: '2018', issuingAuthority: 'ISO', certificateNumber: 'ISO22000-SUDHAMRIT-2018-007', issuedDate: '2025-09-01', expiryDate: '2028-08-31', renewalDueDate: '2028-07-31', scopeDescription: 'Food safety management system — manufacturing and packaging', approvalStatus: 'APPROVED', nextAuditDate: '2026-09-01', lastAuditDate: '2026-03-15', status: 'ACTIVE' },
    { complianceCode: 'COMP-HACCP-001', standardName: 'HACCP', standardVersion: 'Rev 4', issuingAuthority: 'HACCP Alliance', certificateNumber: 'HACCP-SUDH-2026-014', issuedDate: '2026-02-01', expiryDate: '2027-01-31', renewalDueDate: '2026-12-31', scopeDescription: 'All HACCP-critical processes (cooking, cooling, packaging)', approvalStatus: 'APPROVED', nextAuditDate: '2026-08-15', lastAuditDate: '2026-02-15', status: 'ACTIVE' },
    { complianceCode: 'COMP-BRCGS-001', standardName: 'BRCGS', standardVersion: 'Issue 9', issuingAuthority: 'BRCGS', certificateNumber: 'BRCGS-SUDH-2025-0987', issuedDate: '2025-06-01', expiryDate: '2026-05-31', renewalDueDate: '2026-04-30', scopeDescription: 'Storage and distribution of food products', approvalStatus: 'RENEWAL_PENDING', nextAuditDate: '2026-04-15', lastAuditDate: '2025-06-01', status: 'RENEWAL_PENDING' },
    { complianceCode: 'COMP-EXPORT-001', standardName: 'EXPORT_COMPLIANCE', standardVersion: '2026', issuingAuthority: 'DGFT / APEDA', certificateNumber: 'APEDA-EXP-2026-0042', issuedDate: '2026-03-01', expiryDate: '2027-02-28', renewalDueDate: '2027-01-31', scopeDescription: 'Export-eligible: Kaju Katli, Badam Pista Roll (GCC, EU)', approvalStatus: 'APPROVED', nextAuditDate: '2026-09-01', lastAuditDate: '2026-03-01', status: 'ACTIVE' },
  ]

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    EXPIRED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-amber-100 text-amber-700',
    REVOKED: 'bg-red-100 text-red-700',
    RENEWAL_PENDING: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Regulatory Compliance Master
            </h2>
            <p className="text-emerald-200 text-sm max-w-3xl">
              Track all regulatory certifications — FSSAI, ISO 22000, HACCP, BRCGS, FDA (future),
              Export Compliance, Customer Specifications. Manage certificate validity, expiry,
              renewal, approval, and audit scheduling.
            </p>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-amber-950"><Plus className="mr-2 h-4 w-4" />Add Compliance</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Active Certifications</p><ShieldCheck className="h-5 w-5 text-emerald-600" /></div><p className="text-2xl font-bold">4</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Renewal Pending</p><Clock className="h-5 w-5 text-orange-600" /></div><p className="text-2xl font-bold">1</p><p className="text-[10px] text-orange-600 mt-1">BRCGS due 2026-04-30</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Audit Readiness</p><Gauge className="h-5 w-5 text-blue-600" /></div><p className="text-2xl font-bold">92.5%</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Compliance %</p><Percent className="h-5 w-5 text-emerald-600" /></div><p className="text-2xl font-bold">96.8%</p></Card>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          {compliances.map(c => (
            <div key={c.complianceCode} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-blue-700">{c.complianceCode}</span>
                    <Badge className={`text-[10px] ${statusColor[c.status]}`}>{c.status.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px]">{c.standardName.replace(/_/g, ' ')} {c.standardVersion}</Badge>
                  </div>
                  <p className="text-sm font-medium">{c.issuingAuthority}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Certificate: <span className="font-mono">{c.certificateNumber}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{c.scopeDescription}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-[11px]">
                    <div><p className="text-muted-foreground">Issued</p><p className="font-mono font-semibold">{c.issuedDate}</p></div>
                    <div><p className="text-muted-foreground">Expiry</p><p className={`font-mono font-semibold ${c.status === 'EXPIRED' || c.status === 'RENEWAL_PENDING' ? 'text-orange-700' : ''}`}>{c.expiryDate}</p></div>
                    <div><p className="text-muted-foreground">Renewal Due</p><p className="font-mono font-semibold text-orange-700">{c.renewalDueDate}</p></div>
                    <div><p className="text-muted-foreground">Next Audit</p><p className="font-mono font-semibold">{c.nextAuditDate}</p></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">View Certificate</Button>
                  {c.status === 'RENEWAL_PENDING' && <Button size="sm" className="h-7 text-xs bg-orange-600 hover:bg-orange-700">Initiate Renewal</Button>}
                  {c.status === 'ACTIVE' && <Button size="sm" variant="ghost" className="h-7 text-xs">Schedule Audit</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function COAComplianceDashboardModule() {
  const monthlyTrend = [
    { month: 'Jan', generated: 18, signed: 17, distributed: 17 },
    { month: 'Feb', generated: 22, signed: 22, distributed: 21 },
    { month: 'Mar', generated: 25, signed: 24, distributed: 23 },
    { month: 'Apr', generated: 20, signed: 20, distributed: 19 },
    { month: 'May', generated: 28, signed: 27, distributed: 27 },
    { month: 'Jun', generated: 24, signed: 23, distributed: 23 },
    { month: 'Jul', generated: 19, signed: 9, distributed: 8 },
  ]
  const maxVal = Math.max(...monthlyTrend.map(m => m.generated))

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-violet-950 via-purple-900 to-fuchsia-900 text-white border-0">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Activity className="h-7 w-7" /> COA + Compliance Analytics Dashboard
        </h2>
        <p className="text-violet-200 text-sm max-w-3xl">
          Executive view of COA generation, compliance certification status, audit readiness, and document library.
          Real-time KPIs for regulatory performance across all standards.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">COAs Generated (YTD)</p><FileCheck2 className="h-5 w-5 text-blue-600" /></div>
          <p className="text-2xl font-bold">156</p>
          <p className="text-[10px] text-emerald-600 mt-1">+18% vs last year</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Pending Signature</p><PenTool className="h-5 w-5 text-amber-600" /></div>
          <p className="text-2xl font-bold">6</p>
          <p className="text-[10px] text-amber-600 mt-1">Avg wait 2.3h</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Active Certifications</p><ShieldCheck className="h-5 w-5 text-emerald-600" /></div>
          <p className="text-2xl font-bold">4</p>
          <p className="text-[10px] text-orange-600 mt-1">1 renewal pending</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Audit Readiness</p><Gauge className="h-5 w-5 text-purple-600" /></div>
          <p className="text-2xl font-bold">92.5%</p>
          <p className="text-[10px] text-emerald-600 mt-1">Above 90% target ✓</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">COA Generation Trend (Last 7 Months)</h3>
          <div className="space-y-2">
            {monthlyTrend.map(m => (
              <div key={m.month} className="flex items-center gap-2">
                <div className="w-10 text-xs font-semibold text-muted-foreground">{m.month}</div>
                <div className="flex-1 flex gap-1">
                  <div className="h-6 bg-blue-500 rounded-sm flex items-center justify-end pr-1" style={{ width: `${(m.generated / maxVal) * 60}%` }}>
                    <span className="text-[9px] text-white font-semibold">{m.generated}</span>
                  </div>
                  <div className="h-6 bg-emerald-500 rounded-sm flex items-center justify-end pr-1" style={{ width: `${(m.signed / maxVal) * 60}%` }}>
                    <span className="text-[9px] text-white font-semibold">{m.signed}</span>
                  </div>
                  <div className="h-6 bg-purple-500 rounded-sm flex items-center justify-end pr-1" style={{ width: `${(m.distributed / maxVal) * 60}%` }}>
                    <span className="text-[9px] text-white font-semibold">{m.distributed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-[11px]">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" />Generated</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" />Signed</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded" />Distributed</div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Documents by Type</h3>
          <div className="space-y-2">
            {[
              { type: 'COA', count: 156, color: 'bg-blue-500' },
              { type: 'COC', count: 28, color: 'bg-purple-500' },
              { type: 'INSPECTION_REPORT', count: 42, color: 'bg-amber-500' },
              { type: 'LAB_REPORT', count: 156, color: 'bg-cyan-500' },
              { type: 'AUDIT_REPORT', count: 12, color: 'bg-rose-500' },
              { type: 'CALIBRATION_CERT', count: 28, color: 'bg-emerald-500' },
              { type: 'CLEANING_RECORD', count: 84, color: 'bg-slate-500' },
            ].map(d => {
              const max = 156
              return (
                <div key={d.type} className="flex items-center gap-2">
                  <div className="w-32 text-[10px] text-muted-foreground truncate">{d.type.replace(/_/g, ' ')}</div>
                  <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                    <div className={`h-full ${d.color} flex items-center justify-end pr-2`} style={{ width: `${(d.count / max) * 100}%` }}>
                      <span className="text-[9px] text-white font-semibold">{d.count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Compliance Certification Status</h3>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { std: 'FSSAI', status: 'ACTIVE', expiry: '2027-01-14', color: 'emerald' },
            { std: 'ISO 22000', status: 'ACTIVE', expiry: '2028-08-31', color: 'emerald' },
            { std: 'HACCP', status: 'ACTIVE', expiry: '2027-01-31', color: 'emerald' },
            { std: 'BRCGS', status: 'RENEWAL', expiry: '2026-05-31', color: 'orange' },
            { std: 'EXPORT', status: 'ACTIVE', expiry: '2027-02-28', color: 'emerald' },
          ].map(c => (
            <div key={c.std} className="border rounded-lg p-3 text-center">
              <p className="text-xs font-semibold">{c.std}</p>
              <Badge className={`mt-2 text-[10px] ${c.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</Badge>
              <p className="text-[10px] text-muted-foreground mt-2">Expires</p>
              <p className="text-[10px] font-mono">{c.expiry}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-purple-900">Implementation Wave 3 — Complete</p>
            <p className="text-xs text-purple-800 mt-1">
              Sprint 56 (CAPA + Continuous Improvement) + Sprint 57 (COA + Compliance) close the complete
              quality improvement loop: Quality Incident → NCR → Investigation → Root Cause → CAPA →
              Implementation → Effectiveness Check → COA Generation → Regulatory Compliance → Continuous Improvement.
              Next wave: Sprint 58 + 59 + 60 — Audit Management, Customer Complaint Management & Supplier Quality Analytics.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
'''

# ─────────────────────────────────────────────────────────────────────────
# Sidebar config additions
# ─────────────────────────────────────────────────────────────────────────
SIDEBAR_INSERT = r'''
  {
    section: 'Part 6 — CAPA & Continuous Improvement (Sprint 56) — NEW',
    items: [
      { name: 'CAPA Dashboard', icon: <ShieldCheck className="h-4 w-4" />, module: 'capadashboard', available: true },
      { name: 'Corrective Actions', icon: <Wrench className="h-4 w-4" />, module: 'correctiveactions', available: true },
      { name: 'Preventive Actions', icon: <ShieldCheck className="h-4 w-4" />, module: 'preventiveactions', available: true },
      { name: 'Effectiveness Review', icon: <CheckCircle2 className="h-4 w-4" />, module: 'effectivenessreview', available: true },
      { name: 'Continuous Improvement', icon: <Activity className="h-4 w-4" />, module: 'continuousimprovement', available: true },
    ]
  },
  {
    section: 'Part 6 — COA & Compliance (Sprint 57) — NEW',
    items: [
      { name: 'COA Dashboard', icon: <FileCheck2 className="h-4 w-4" />, module: 'coadashboard', available: true },
      { name: 'COA Generator', icon: <FileText className="h-4 w-4" />, module: 'coagenerator', available: true },
      { name: 'Document Library', icon: <Archive className="h-4 w-4" />, module: 'compliancedocs', available: true },
      { name: 'Regulatory Compliance', icon: <ShieldCheck className="h-4 w-4" />, module: 'regulatorycompliance', available: true },
      { name: 'Compliance Dashboard', icon: <BarChart3 className="h-4 w-4" />, module: 'coacompliancedashboard', available: true },
    ]
  },
'''

# ModuleKey additions
MODULEKEY_INSERT = "\n  | 'capadashboard' | 'correctiveactions' | 'preventiveactions' | 'effectivenessreview' | 'continuousimprovement'\n  | 'coadashboard' | 'coagenerator' | 'compliancedocs' | 'regulatorycompliance' | 'coacompliancedashboard'"

# Module names + render conditions
MODULENAMES_INSERT = "\n    capadashboard: 'CAPA Dashboard', correctiveactions: 'Corrective Actions', preventiveactions: 'Preventive Actions', effectivenessreview: 'Effectiveness Review', continuousimprovement: 'Continuous Improvement',\n    coadashboard: 'COA Dashboard', coagenerator: 'COA Generator', compliancedocs: 'Document Library', regulatorycompliance: 'Regulatory Compliance', coacompliancedashboard: 'Compliance Dashboard',"

RENDER_INSERT = "\n            {activeModule === 'capadashboard' && <CAPADashboardModule />}\n            {activeModule === 'correctiveactions' && <CorrectiveActionsModule />}\n            {activeModule === 'preventiveactions' && <PreventiveActionsModule />}\n            {activeModule === 'effectivenessreview' && <EffectivenessReviewModule />}\n            {activeModule === 'continuousimprovement' && <ContinuousImprovementModule />}\n            {activeModule === 'coadashboard' && <COADashboardModule />}\n            {activeModule === 'coagenerator' && <CertificateGeneratorModule />}\n            {activeModule === 'compliancedocs' && <ComplianceDocumentLibraryModule />}\n            {activeModule === 'regulatorycompliance' && <RegulatoryComplianceModule />}\n            {activeModule === 'coacompliancedashboard' && <COAComplianceDashboardModule />}"

# Need to add Send, Lock icons to imports (if not already there)
ICON_IMPORTS_ADDITION = ", Send, Lock"

def main():
    with open(PAGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    if "CAPADashboardModule" in content:
        print("Sprint 56/57 frontend modules already present — skipping.")
        return

    # 1. Add Send, Lock icons to the lucide-react import if missing
    if "Send," not in content and " Send " not in content:
        # Add to the last lucide-react import line
        content = content.replace(
            "Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool\n} from 'lucide-react'",
            "Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send, Lock\n} from 'lucide-react'"
        )

    # 2. Add ModuleKey types — find the line with "'manufacturing' | 'quality'" and insert before it
    mk_marker = "  | 'manufacturing' | 'quality'"
    if mk_marker not in content:
        raise SystemExit("Could not find ModuleKey 'manufacturing' marker")
    content = content.replace(mk_marker, MODULEKEY_INSERT + mk_marker)

    # 3. Add SIDEBAR_SECTIONS entries — find the NCR section and insert after it
    sidebar_marker = "      { name: 'Investigation', icon: <Search className=\"h-4 w-4\" />, module: 'ncrinvestigation', available: true },\n    ]\n  },"
    if sidebar_marker not in content:
        raise SystemExit("Could not find sidebar NCR section marker")
    content = content.replace(sidebar_marker, sidebar_marker + SIDEBAR_INSERT)

    # 4. Add module names — find the "ai: 'AI Copilot'," line and insert before it
    names_marker = "    ai: 'AI Copilot',"
    if names_marker not in content:
        raise SystemExit("Could not find moduleNames 'ai' marker")
    content = content.replace(names_marker, MODULENAMES_INSERT + "\n" + names_marker)

    # 5. Add render conditions — find the existing NCR render and insert after it
    render_marker = "{activeModule === 'ncrinvestigation' && <NCRInvestigationModule />}"
    if render_marker not in content:
        raise SystemExit("Could not find NCR render marker")
    content = content.replace(render_marker, render_marker + RENDER_INSERT)

    # 6. Append the module function definitions at the end of the file (just before the final closing — but easier: append)
    content = content.rstrip() + "\n" + SPRINT_56_MODULES + "\n" + SPRINT_57_MODULES + "\n"

    with open(PAGE_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print("Successfully inserted Sprint 56 + 57 frontend modules.")
    print(f"  - {SPRINT_56_MODULES.count('function ')} Sprint 56 functions")
    print(f"  - {SPRINT_57_MODULES.count('function ')} Sprint 57 functions")
    print(f"  - 10 new sidebar items")
    print(f"  - 10 new ModuleKey types")

if __name__ == "__main__":
    main()
