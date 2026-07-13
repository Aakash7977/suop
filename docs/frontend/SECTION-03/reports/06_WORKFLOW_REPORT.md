# 06 — Workflow Report

**Section**: 03 — Master Data Management
**Date**: 2026-07-13

---

## 1. Registered Workflows (8 total)

| # | Workflow Name | Module | States | Transitions | Status |
|---|---|---|---|---|---|
| 1 | `ProductLifecycle` | product | 6 | 8 | ✅ Working |
| 2 | `CustomerLifecycle` | customer | 7 | 12 | ✅ Working |
| 3 | `SupplierLifecycle` | supplier | 8 | 13 | ✅ Working |
| 4 | `OrganizationLifecycle` | organization | 5 | 7 | ✅ Working |
| 5 | `RecipeLifecycle` | recipe-bom | 4 | 5 | ✅ Working |
| 6 | `JournalEntryLifecycle` | general-ledger | 6 | 7 | ✅ Working |
| 7 | `FinancialFoundationJournalEntryLifecycle` | financial-foundation | 4 | 5 | ✅ Working |
| 8 | `TaxReturnLifecycle` | gst-taxation | 4 | 4 | ✅ Working |

## 2. Workflows Fixed During Recovery

| # | Workflow Name | Module | Issue | Fix |
|---|---|---|---|---|
| 9 | `GstConfigurationLifecycle` | gst-taxation | Service looked up this name but workflow registered as `TaxReturnLifecycle` | Added registration for `GstConfigurationLifecycle` with 5 states (DRAFT, ACTIVE, SUSPENDED, ARCHIVED, AMENDED) and 6 transitions |
| 10 | `ProductCostLifecycle` | product-costing | No workflow file existed; service looked up `ProductCostLifecycle` | Created `workflow/index.ts` with 5 states (DRAFT, CALCULATED, APPROVED, POSTED, ARCHIVED) and 6 transitions |
| 11 | `CrmActivityLifecycle` | crm-foundation | No workflow file existed; service looked up `CrmActivityLifecycle` | Created `workflow/index.ts` with 5 states (DRAFT, IN_PROGRESS, COMPLETED, CANCELLED, ARCHIVED) and 6 transitions |

## 3. Lifecycle State Diagrams

### Product Lifecycle
```
DRAFT → REVIEW → APPROVED → ACTIVE → DISCONTINUED → ARCHIVED
                ↗                    ↓               ↓
                └──── DRAFT ←─────── ACTIVE ←───────┘
```
Allowed transitions (frontend constant `PRODUCT_LIFECYCLE_TRANSITIONS`):
- DRAFT → REVIEW
- REVIEW → APPROVED, DRAFT
- APPROVED → ACTIVE
- ACTIVE → DISCONTINUED, ARCHIVED
- DISCONTINUED → ACTIVE, ARCHIVED

### Customer Lifecycle
```
LEAD → PROSPECT → APPROVED → ACTIVE → BLOCKED → INACTIVE → ARCHIVED
                   ↑                    ↓        ↓          ↓
                   └── PROSPECT ←───────┘        └── ACTIVE ┘
```

### Supplier Lifecycle
```
DRAFT → VERIFICATION → APPROVED → ACTIVE → PROBATION → BLOCKED → BLACKLISTED → ARCHIVED
                                            ↓          ↓                        ↑
                                            └──────────└────────────────────────┘
```

### Organization Lifecycle (shared by Company, Plant, Warehouse)
```
DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED
                       ↑          ↓
                       └──────────┘
```

## 4. Frontend Transition Implementation

### ProductMasterModule — ✅ IMPLEMENTED
- Transition dropdown in Actions column
- Shows only allowed next states based on current status
- Calls `productApi.transition(id, targetStatus, version)`
- RBAC gated: `hasPermission('product:update')`
- Toast on success/error
- Auto-refresh after transition

### Other Modules — ❌ NOT YET IMPLEMENTED
- Customer transition: backend ready (`customerApi.transition`), frontend not wired
- Supplier transition: backend ready (`supplierApi.transition`), frontend not wired
- Plant transition: backend ready (`plantApi.transition`), frontend not wired
- Company transition: backend ready (`companyApi.transition`), frontend not wired

## 5. Workflow Engine

**Source**: `apps/backend/src/core/workflow/state-machine.ts`

The workflow engine provides:
- `workflowRegistry.register(definition)` — register a workflow
- `workflowRegistry.get(name)` — retrieve a workflow
- State validation: checks if transition is allowed
- Guard support: custom validators can block transitions
- Event emission: on successful transition

All Section 03 modules use the workflow engine for lifecycle transitions via `POST /:id/transition` endpoints.

---

**END OF WORKFLOW REPORT**
