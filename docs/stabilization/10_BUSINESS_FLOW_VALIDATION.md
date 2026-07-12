# 10 — Business Flow Validation Report

**Document ID:** STAB-10-BUSINESS-FLOW
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report identifies the critical business flows that must be validated
end-to-end on the refactored frontend before any release. It maps each
flow to its participating feature modules, backend workflows, and
permissions, and defines a validation plan.

## 2. Executive Summary

The backend implements **38 workflows** spanning procurement, inventory,
manufacturing, quality, finance, and HR. The frontend, post-refactoring,
exposes 11 feature modules that are currently placeholder pages. No
business flow has been validated end-to-end on the new frontend. This
report enumerates the **12 critical flows** that must pass before release.

## 3. Critical Flows

The following 12 flows are designated critical. Failure of any one blocks
release.

| # | Flow | Primary Module | Backend Workflow(s) |
| --- | --- | --- | --- |
| 1 | Purchase Order: create → approve → receive | procurement | po.create, po.approve, po.receive |
| 2 | Inventory: receive → put-away → adjust | inventory, warehouse | inv.receive, inv.putaway, inv.adjust |
| 3 | Manufacturing: work order → issue → complete | manufacturing | mo.create, mo.issue, mo.complete |
| 4 | Quality: inspection → NCR → disposition | quality | qa.inspect, qa.ncr, qa.disposition |
| 5 | Sales Order: quote → order → invoice → payment | crm, finance | so.quote, so.order, ar.invoice, ar.payment |
| 6 | AP Invoice: receive → match → pay | finance | ap.receive, ap.match, ap.pay |
| 7 | GL: journal entry → post → close period | finance | gl.je, gl.post, gl.close |
| 8 | HR: hire → onboard → payroll | hr | hr.hire, hr.onboard, pr.run |
| 9 | Warehouse: pick → pack → ship | warehouse | wh.pick, wh.pack, wh.ship |
| 10 | Returns: RMA → inspect → refund | crm, quality, finance | rma.create, qa.inspect, ar.refund |
| 11 | Asset: acquire → depreciate → dispose | finance | fa.acquire, fa.depreciate, fa.dispose |
| 12 | Admin: user create → role assign → audit | administration, platform | usr.create, role.assign, audit.view |

## 4. Validation Methodology

Each flow is validated in three dimensions:

1. **Functional** — every step completes successfully on the new UI.
2. **RBAC** — only authorized users can execute each step.
3. **Audit** — each step writes an audit entry on the backend.

Validation is performed via:
- Manual scripted walkthrough (once per flow).
- Playwright e2e test (one per flow).
- RBAC matrix verification (per step).
- Audit log inspection (per step).

## 5. Per-Flow Detail (Selected)

### 5.1 Purchase Order Flow
**Modules:** procurement (primary), inventory (receiving), finance
(matching).
**Permissions:** `po.view`, `po.create`, `po.approve`, `po.receive`,
`inv.receive`.
**Steps:**
1. Buyer creates a draft PO (form: vendor, lines, delivery date).
2. Buyer submits PO for approval.
3. Approver reviews and approves (or rejects) PO.
4. Vendor ships goods; warehouse receives against PO.
5. Inventory auto-updates; receipt recorded.
6. AP matches receipt to PO and invoice (3-way match).

**Validation criteria:**
- Each step renders the correct enterprise component (DataGrid, Form,
  Wizard, ConfirmationDialog).
- RBAC enforced at each transition.
- Audit entry written at each transition.
- PO status badge reflects state via `StatusBadge`.
- Workflow timeline visible via `WorkflowTimeline`.

### 5.2 Manufacturing Order Flow
**Modules:** manufacturing (primary), inventory (issue), quality
(inspection).
**Permissions:** `mo.view`, `mo.create`, `mo.issue`, `mo.complete`,
`qa.inspect`.
**Steps:**
1. Planner creates a work order from a BOM.
2. Operator issues materials against the order.
3. Operator records completion and yields.
4. Quality inspects the output.
5. Inventory updated with finished goods.

### 5.3 Sales-to-Cash Flow
**Modules:** crm (quote, order), finance (invoice, payment).
**Permissions:** `so.view`, `so.quote`, `so.order`, `ar.invoice`,
`ar.payment`.
**Steps:**
1. Sales rep creates a quote.
2. Customer accepts; quote converted to order.
3. Order fulfillment triggers invoice.
4. Customer payment recorded and applied.
5. GL updated.

### 5.4 HR Hire-to-Pay Flow
**Modules:** hr (hire, onboard), finance (payroll).
**Permissions:** `hr.hire`, `hr.onboard`, `pr.run`.
**Steps:**
1. HR creates employee record.
2. Onboarding tasks assigned and completed.
3. Payroll cycle includes the new employee.
4. GL updated with payroll expense.

## 6. Findings

### F-01 — Zero Flows Validated on New Frontend
None of the 12 critical flows have been exercised on the refactored
frontend. Modules are placeholder pages.

### F-02 — No E2E Tests for Flows
No Playwright tests exist. Each flow must have at least one e2e test.

### F-03 — API Wiring Missing Per Flow
Each flow crosses multiple feature modules. API clients exist for 14
modules but are not wired to feature module services.

### F-04 — Mock Data in Dashboard Does Not Represent Flows
`DashboardPage.tsx` mock data does not cover flow state transitions.

### F-05 — WorkflowTimeline Not Exercised
The `WorkflowTimeline` component has not been validated against real
workflow state data.

### F-06 — StatusBadge State Mapping Unverified
The mapping from backend workflow states to `StatusBadge` colors is not
documented or verified.

### F-07 — Cross-Module Navigation Untested
Each flow requires navigation between modules (e.g. procurement →
warehouse). The route registry does not yet exist (see report 05).

### F-08 — Audit Viewer Not Wired
The `AuditViewer` component exists but no flow has been validated to
produce a readable audit trail.

## 7. Validation Plan

### Sprint 1 — Flow 1 (Purchase Order) as reference
- Migrate procurement module from placeholder to functional.
- Wire API client to feature module services.
- Build Playwright e2e for the full PO flow.
- Validate RBAC at each step.
- Validate audit entries.

### Sprint 2 — Flows 2, 3, 5
- Inventory/warehouse receiving.
- Manufacturing work order.
- Sales-to-cash.

### Sprint 3 — Flows 4, 6, 7
- Quality inspection.
- AP invoice.
- GL close.

### Sprint 4 — Flows 8, 9, 10, 11, 12
- HR, warehouse ship, returns, asset, admin.

## 8. Per-Flow Validation Checklist

For each flow, the following must pass:

- [ ] All steps render the correct enterprise component.
- [ ] Form validation prevents invalid submissions.
- [ ] RBAC enforced at each transition.
- [ ] Audit entry written at each transition.
- [ ] WorkflowTimeline displays the state history.
- [ ] StatusBadge reflects current state.
- [ ] Cross-module navigation works.
- [ ] Error states (network, validation, permission) handled gracefully.
- [ ] Playwright e2e passes.
- [ ] Performance: each step < 2s perceived latency.

## 9. Acceptance Criteria

- [ ] All 12 critical flows validated.
- [ ] One Playwright e2e per flow.
- [ ] RBAC matrix verified per flow.
- [ ] Audit trail verified per flow.
- [ ] At least one flow per module validated.

## 10. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| BR1 | Critical flow broken on new frontend | Critical |
| BR2 | RBAC bypass on a flow step | Critical |
| BR3 | Missing audit trail | High |
| BR4 | Cross-module navigation broken | High |
| BR5 | Performance regression | Medium |

## 11. Conclusion

Validating the 12 critical flows is the **functional proof** that the
refactoring has not regressed the application. Each flow must be migrated
from placeholder to functional, wired to its API client, and covered by
an e2e test. This is the largest body of work in the stabilization phase.

---

*End of report STAB-10-BUSINESS-FLOW.*
