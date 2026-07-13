# 07 — Estimated Backend Effort

**Date**: 2026-07-13
**Status**: FINAL

---

## Effort Summary by Category

| Category | Modules | Hours | Priority |
|---|---|---|---|
| Critical Bug Fixes | 8 bugs across 6 modules | 10 | P0 — MUST DO FIRST |
| Permission Model Overhaul | 20 modules, 60+ new permissions | 14 | P0 — blocks RBAC |
| Missing CRUD Endpoints | 12 modules need PATCH/DELETE | 64 | P1 — blocks frontend CRUD |
| Missing WMS Modules | 9 new modules | 420 | P1 — blocks 27 frontend modules |
| Domain Logic in Stub Modules | 6 stub modules + 5 thin wrappers | 517 | P2 — blocks real ERP operations |
| Testing | All new + modified code | 50 | P3 — before certification |
| **Total Backend Effort** | | **1,075 hours** | |

---

## Effort by Missing Module

| # | Module | Tables | APIs | Workflows | Permissions | Events | Effort |
|---|---|---|---|---|---|---|---|
| 1 | stock-transfer | 4 | 12 | 1 (6 states) | 5 | 4 | 50h |
| 2 | stock-adjustment | 3 | 10 | 1 (5 states) | 4 | 4 | 40h |
| 3 | cycle-count | 4 | 15 | 1 (8 states) | 5 | 4 | 70h |
| 4 | receiving | 5 | 20 | 1 (5 states) | 4 | 4 | 80h |
| 5 | yard | 5 | 15 | 1 (5 states) | 4 | 3 | 60h |
| 6 | eam | 8 | 30 | 2 (10 states) | 5 | 5 | 120h |
| 7 | task-queue | 1 | 8 | 0 | 3 | 2 | 30h |
| 8 | mission-control | 0 (read-only) | 10 | 0 | 1 | 0 | 30h |
| 9 | control-tower | 3 | 15 | 1 (4 states) | 4 | 3 | 50h |
| **Total** | **33 tables** | **135 APIs** | **8 workflows** | **35 permissions** | **29 events** | **530h** |

---

## Effort by Stub Module (Domain Logic Implementation)

| # | Module | Prisma Models (existing, unused) | What's Missing | Effort |
|---|---|---|---|---|
| 1 | general-ledger | JournalEntries, JournalEntryLines, GlPostings | Double-entry validation, posting, reversal, trial balance | 60h |
| 2 | product-costing | ProductCosts, CostRollups, CostRollupLines, CostVariances, BatchCosts, InventoryValuations | Cost calculation from BOM, variance, standard cost update | 40h |
| 3 | gst-taxation | GstConfigurations, TaxRules, TaxReturns, TaxRegisters | E-invoice, GSTR returns, tax engine | 80h |
| 4 | attendance-shift | Attendance, Rosters, RosterLines, Timesheets, OvertimeRequests | Clock-in/out, roster, overtime, timesheet | 40h |
| 5 | performance-management | PerformanceCycles, EmployeeGoals, Appraisals, Feedback360 | Goals, appraisals, 360 feedback | 60h |
| 6 | alerts-kpi-engine | AlertRules, Alerts, AlertEscalations, KpiMonitoring, NotificationDigests | Alert firing, KPI computation, escalation | 50h |
| **Total** | | **27 existing models (mostly unused)** | | **330h** |

---

## Effort by Bug Fix

| # | Bug | Module | Effort |
|---|---|---|---|
| BUG-4 | CRITICAL: pick-pack-dispatch corrupts inventory | pick-pack-dispatch | 4h |
| BUG-5 | CRITICAL: AUDIT_READ for write in 3 modules | product-costing, GL, GST | 2h |
| BUG-6 | CRITICAL: ORG_* proxy in 2 modules | attendance, performance | 1h |
| BUG-1,2,3 | Field-map typos in 3 modules | inventory, warehouse | 1.5h |
| BUG-7 | OEE calculation bug | mes | 2h |
| BUG-8 | warehouse_operator missing INVENTORY_ADJUST | permissions | 0.5h |
| BUG-9 | No version field in customer-returns | customer-returns | 1h |
| BUG-10 | Lowercase table name | order-fulfillment | 0.5h |
| BUG-11 | No SO status validation | pick-pack-dispatch | 1h |
| BUG-12 | DELETE uses PR_CREATE | procurement | 0.5h |
| BUG-13 | NCR/CAPA read permission inconsistency | quality-inspection | 0.5h |
| **Total** | | | **15h** |

---

## Combined Effort (Backend + Frontend)

| Work Area | Hours |
|---|---|
| Backend bug fixes | 10 |
| Backend permission overhaul | 14 |
| Backend missing CRUD endpoints | 64 |
| Backend missing modules (9) | 420 |
| Backend domain logic (stubs) | 330 |
| Backend testing | 50 |
| Frontend wiring (existing backend) | 80 |
| Frontend wiring (new backend) | 120 |
| Frontend RBAC + UX + testing | 100 |
| **Grand Total** | **1,188 hours** |

---

**END OF ESTIMATED BACKEND EFFORT**
