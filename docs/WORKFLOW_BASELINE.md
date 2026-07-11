# SUOP ERP — Workflow Baseline (v1.0)

**Document Version**: 1.0
**Frozen At**: 2026-07-11
**Phase**: 9B — Architecture Freeze
**Status**: 🔒 FROZEN

---

## 1. Workflow Engine Overview

SUOP uses a custom state machine engine (`core/workflow/state-machine.ts`) for all entity lifecycles. Every business entity with a `status` column has an associated workflow definition.

### 1.1 State Machine Components

| Component | Purpose |
|---|---|
| **States** | Finite set of valid statuses (e.g., `DRAFT`, `ACTIVE`, `ARCHIVED`) |
| **Initial State** | Starting state when entity is created |
| **Transitions** | Allowed state changes (`from → to`) |
| **Guards** | Conditions that must pass before transition (optional) |
| **Hooks** | Side effects executed on transition (optional) |
| **Final States** | Terminal states (no outgoing transitions) |

### 1.2 Workflow Definition Pattern

Every module defines its workflow in `modules/<module>/workflow/index.ts`:

```typescript
import { createStateMachine } from '@/core/workflow'

export const entityWorkflow = createStateMachine({
  name: 'EntityLifecycle',
  initialState: 'DRAFT',
  states: ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const,
  transitions: [
    { from: 'DRAFT', to: 'ACTIVE', guard: canActivate, hook: onActivate },
    { from: 'ACTIVE', to: 'ARCHIVED' },
  ],
})
```

---

## 2. Module Workflows

### 2.1 Organization Workflow

**Name**: `OrganizationLifecycle`
**Applies to**: Companies, Plants, Warehouses, Departments, Cost Centers

#### States
| State | Description | Editable? |
|---|---|---|
| `DRAFT` | Initial state, being configured | ✅ Yes |
| `CONFIGURED` | Configuration complete, pending activation | ✅ Yes |
| `ACTIVE` | Operational | ⚠️ Limited (no structural changes) |
| `SUSPENDED` | Temporarily inactive | ❌ No |
| `ARCHIVED` | Permanently retired (terminal) | ❌ No |

#### State Diagram
```
┌────────┐     submit      ┌────────────┐    activate    ┌────────┐
│ DRAFT  │ ───────────────▶│ CONFIGURED │ ─────────────▶│ ACTIVE │
└────┬───┘                 └──────┬─────┘                └───┬────┘
     │                            │                          │
     │     ◀── return ────────────┘                          │
     │                                                    suspend│
     │                                                          ▼
     │                              ┌───────────┐    reactivate ┌────────┐
     │                              │ SUSPENDED │ ◀─────────── │ ACTIVE │
     │                              └─────┬─────┘              └────────┘
     │                                    │
     │                                    │ archive
     │                                    ▼
     │                              ┌───────────┐
     │              archive         │ ARCHIVED  │ (terminal)
     └─────────────────────────────▶│           │
                                    └───────────┘
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `CONFIGURED` | submit | `org:update` |
| `CONFIGURED` | `ACTIVE` | activate | `org:update` |
| `CONFIGURED` | `DRAFT` | return | `org:update` |
| `ACTIVE` | `SUSPENDED` | suspend | `org:update` |
| `SUSPENDED` | `ACTIVE` | reactivate | `org:update` |
| `SUSPENDED` | `ARCHIVED` | archive | `org:delete` |
| `ACTIVE` | `ARCHIVED` | archive | `org:delete` |

---

### 2.2 Authentication (User Lifecycle) Workflow

**Name**: `UserLifecycle`
**Applies to**: Users

#### States
| State | Description | Can Login? |
|---|---|---|
| `INVITED` | Invitation sent, not yet accepted | ❌ No |
| `ACTIVATED` | Password set, pending first login | ❌ No |
| `ACTIVE` | Normal active user | ✅ Yes |
| `LOCKED` | Temporarily locked (too many failed attempts) | ❌ No |
| `DISABLED` | Administratively disabled | ❌ No |
| `ARCHIVED` | Permanently retired (terminal) | ❌ No |

#### State Diagram
```
┌─────────┐  accept-invitation  ┌───────────┐  first-login  ┌────────┐
│ INVITED │ ──────────────────▶│ ACTIVATED │ ────────────▶│ ACTIVE │
└─────────┘                     └───────────┘               └───┬────┘
                                                                │
                                              ┌─────────────────┼─────────────────┐
                                              │ lock            │ disable         │ archive
                                              ▼                 ▼                 ▼
                                        ┌────────┐        ┌──────────┐      ┌──────────┐
                                        │ LOCKED │        │ DISABLED │      │ ARCHIVED │
                                        └───┬────┘        └────┬─────┘      └──────────┘
                                            │ unlock           │ reenable       (terminal)
                                            └───▶ ACTIVE       └───▶ ACTIVE
                                            │ disable          │ archive
                                            ▼                  ▼
                                       ┌──────────┐      ┌──────────┐
                                       │ DISABLED │      │ ARCHIVED │
                                       └──────────┘      └──────────┘
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `INVITED` | `ACTIVATED` | accept-invitation | (public with token) |
| `ACTIVATED` | `ACTIVE` | first-login | (system, automatic) |
| `ACTIVE` | `LOCKED` | auto (5 failed logins) | (system) |
| `LOCKED` | `ACTIVE` | unlock | `auth:manage_users` |
| `ACTIVE` | `DISABLED` | disable | `auth:manage_users` |
| `LOCKED` | `DISABLED` | disable | `auth:manage_users` |
| `DISABLED` | `ACTIVE` | reenable | `auth:manage_users` |
| `ACTIVE` | `ARCHIVED` | archive | `auth:manage_users` |
| `DISABLED` | `ARCHIVED` | archive | `auth:manage_users` |
| `LOCKED` | `ARCHIVED` | archive | `auth:manage_users` |

---

### 2.3 User Management (Role Lifecycle) Workflow

**Name**: `RoleLifecycle`
**Applies to**: Roles

#### States
| State | Description | Assignable? |
|---|---|---|
| `DRAFT` | Being defined | ❌ No |
| `ACTIVE` | Available for assignment | ✅ Yes |
| `DEPRECATED` | No longer assignable, existing assignments retained | ❌ No |
| `ARCHIVED` | Permanently retired (terminal) | ❌ No |

#### State Diagram
```
┌────────┐  activate  ┌────────┐  deprecate  ┌────────────┐
│ DRAFT  │ ─────────▶│ ACTIVE │ ──────────▶│ DEPRECATED │
└────────┘            └───┬────┘            └─────┬──────┘
                          │                       │
                          │ archive               │ reactivate
                          ▼                       ▼
                    ┌──────────┐            ┌────────┐
                    │ ARCHIVED │◀───────────│ ACTIVE │
                    └──────────┘   archive  └────────┘
                    (terminal)               ┌────────────┐
                                             │ DEPRECATED │ ── archive ──▶ ARCHIVED
                                             └────────────┘
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `ACTIVE` | activate | `auth:manage_roles` |
| `ACTIVE` | `DEPRECATED` | deprecate | `auth:manage_roles` |
| `DEPRECATED` | `ACTIVE` | reactivate | `auth:manage_roles` |
| `ACTIVE` | `ARCHIVED` | archive | `auth:manage_roles` |
| `DEPRECATED` | `ARCHIVED` | archive | `auth:manage_roles` |

---

### 2.4 Product Workflow

**Name**: `ProductLifecycle`
**Applies to**: Products

#### States
| State | Description | Orderable? |
|---|---|---|
| `DRAFT` | Being defined | ❌ No |
| `REVIEW` | Pending approval | ❌ No |
| `APPROVED` | Approved, not yet live | ❌ No |
| `ACTIVE` | Live, orderable | ✅ Yes |
| `DISCONTINUED` | No longer orderable, existing inventory sellable | ⚠️ Sell existing only |
| `ARCHIVED` | Permanently retired (terminal) | ❌ No |

#### State Diagram
```
┌────────┐  submit   ┌────────┐  approve  ┌──────────┐  go-live  ┌────────┐
│ DRAFT  │ ────────▶│ REVIEW │ ────────▶│ APPROVED │ ─────────▶│ ACTIVE │
└────────┘           └────┬───┘           └──────────┘            └───┬────┘
     ▲                    │                                            │
     │ ◀── return ────────┘                                            │
     │                                                                 │
     │                       reject                                    │ discontinue
     │                         ──▶ (back to DRAFT)                     ▼
     │                                                          ┌──────────────┐
     │                                                          │ DISCONTINUED │
     │                                                          └──────┬───────┘
     │                                                                 │
     │                                                          reactivate│
     │                                                                 ▼
     │                                                          ┌────────┐
     │                                                          │ ACTIVE │
     │                                                          └───┬────┘
     │                                                  archive      │
     └──────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                                                    ┌──────────┐
                                                    │ ARCHIVED │ (terminal)
                                                    └──────────┘
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `REVIEW` | submit | `product:update` |
| `REVIEW` | `APPROVED` | approve | `product:update` |
| `REVIEW` | `DRAFT` | return | `product:update` |
| `APPROVED` | `ACTIVE` | go-live | `product:update` |
| `ACTIVE` | `DISCONTINUED` | discontinue | `product:update` |
| `DISCONTINUED` | `ACTIVE` | reactivate | `product:update` |
| `ACTIVE` | `ARCHIVED` | archive | `product:delete` |
| `DISCONTINUED` | `ARCHIVED` | archive | `product:delete` |

---

### 2.5 Supplier Workflow

**Name**: `SupplierLifecycle`
**Applies to**: Suppliers

#### States
| State | Description | Can Supply? |
|---|---|---|
| `DRAFT` | Being onboarded | ❌ No |
| `VERIFICATION` | Undergoing verification | ❌ No |
| `APPROVED` | Verified, not yet active | ❌ No |
| `ACTIVE` | Active supplier | ✅ Yes |
| `PROBATION` | Performance issues, under review | ⚠️ Limited |
| `BLOCKED` | Temporarily blocked | ❌ No |
| `BLACKLISTED` | Permanently barred (terminal) | ❌ No |
| `ARCHIVED` | Retired (terminal) | ❌ No |

#### State Diagram
```
┌────────┐  submit    ┌──────────────┐  approve  ┌──────────┐  activate  ┌────────┐
│ DRAFT  │ ─────────▶│ VERIFICATION │ ─────────▶│ APPROVED │ ──────────▶│ ACTIVE │
└────┬───┘            └──────┬───────┘           └──────────┘            └───┬────┘
     │                       │                                                 │
     │ ◀── return ───────────┘                                                 │
     │                                                                         │
     │                                                                  probation│
     │                                                                         ▼
     │                                                                  ┌──────────┐
     │                                                                  │ PROBATION│
     │                                                                  └────┬─────┘
     │                                            reactivate ◀──────────────│
     │                                                                       │
     │                                                                  block│
     │                                                                       ▼
     │                                                                  ┌────────┐
     │                                                       reactivate │ BLOCKED │
     │                                                  ┌────────────────└────┬───┘
     │                                                  │                      │
     │                                            ┌─────▼────┐                 │ blacklist
     │                                            │  ACTIVE  │                 ▼
     │                                            └──────────┘          ┌─────────────┐
     │                                                                  │ BLACKLISTED │ (terminal)
     │                                                                  └─────────────┘
     │  archive (from ACTIVE, BLOCKED, BLACKLISTED)
     └──────────────────────────────────────────────────────────────▶┌──────────┐
                                                                      │ ARCHIVED │ (terminal)
                                                                      └──────────┘
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `VERIFICATION` | submit | `supplier:update` |
| `VERIFICATION` | `APPROVED` | approve | `supplier:update` |
| `VERIFICATION` | `DRAFT` | return | `supplier:update` |
| `APPROVED` | `ACTIVE` | activate | `supplier:update` |
| `ACTIVE` | `PROBATION` | probation | `supplier:update` |
| `PROBATION` | `ACTIVE` | reactivate | `supplier:update` |
| `ACTIVE` | `BLOCKED` | block | `supplier:update` |
| `PROBATION` | `BLOCKED` | block | `supplier:update` |
| `BLOCKED` | `ACTIVE` | unblock | `supplier:update` |
| `ACTIVE` | `BLACKLISTED` | blacklist | `supplier:blacklist` |
| `BLOCKED` | `BLACKLISTED` | blacklist | `supplier:blacklist` |
| `ACTIVE` | `ARCHIVED` | archive | `supplier:delete` |
| `BLOCKED` | `ARCHIVED` | archive | `supplier:delete` |
| `BLACKLISTED` | `ARCHIVED` | archive | `supplier:delete` |

---

### 2.6 Customer Workflow

**Name**: `CustomerLifecycle`
**Applies to**: Customers

#### States
| State | Description | Orderable? |
|---|---|---|
| `LEAD` | Initial contact (funnel entry) | ❌ No |
| `PROSPECT` | Qualified lead | ❌ No |
| `APPROVED` | Approved for ordering | ❌ No |
| `ACTIVE` | Active customer | ✅ Yes |
| `BLOCKED` | Temporarily blocked | ❌ No |
| `INACTIVE` | Dormant (no orders for 90+ days) | ❌ No |
| `ARCHIVED` | Retired (terminal) | ❌ No |

#### State Diagram
```
┌──────┐  qualify  ┌──────────┐  approve  ┌──────────┐  activate  ┌────────┐
│ LEAD │ ────────▶│ PROSPECT │ ─────────▶│ APPROVED │ ──────────▶│ ACTIVE │
└──┬───┘           └────┬─────┘           └──────────┘            └───┬────┘
   │                    │                                              │
   │ ◀── disqualify ────┘                                              │
   │                                                                   │
   │                                                            block  │
   │                                                                   ▼
   │                                                            ┌────────┐
   │                                                  unblock   │ BLOCKED│
   │                                                  ┌─────────└───┬────┘
   │                                                  │             │
   │                                            ┌─────▼────┐        │
   │                                            │  ACTIVE  │        │ deactivate
   │                                            └─────┬────┘        │
   │                                                  │              ▼
   │                                          reactivate│      ┌──────────┐
   │                                                  └────────────│ INACTIVE │
   │                                                                └────┬─────┘
   │                                                                       │
   │  archive (from ACTIVE, BLOCKED, INACTIVE)                             │
   └───────────────────────────────────────────────────────────────────────▶┌──────────┐
                                                                            │ ARCHIVED │ (terminal)
                                                                            └──────────┘
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `LEAD` | `PROSPECT` | qualify | `customer:update` |
| `PROSPECT` | `APPROVED` | approve | `customer:update` |
| `PROSPECT` | `LEAD` | disqualify | `customer:update` |
| `APPROVED` | `ACTIVE` | activate | `customer:update` |
| `ACTIVE` | `BLOCKED` | block | `customer:update` |
| `BLOCKED` | `ACTIVE` | unblock | `customer:update` |
| `ACTIVE` | `INACTIVE` | deactivate | `customer:update` (or system auto) |
| `BLOCKED` | `INACTIVE` | deactivate | `customer:update` |
| `INACTIVE` | `ACTIVE` | reactivate | `customer:update` |
| `ACTIVE` | `ARCHIVED` | archive | `customer:delete` |
| `BLOCKED` | `ARCHIVED` | archive | `customer:delete` |
| `INACTIVE` | `ARCHIVED` | archive | `customer:delete` |

---

### 2.7 Procurement (Purchase Requisition) Workflow

**Name**: `PurchaseRequisitionLifecycle`
**Applies to**: Purchase Requisitions

#### States
| State | Description | Editable? |
|---|---|---|
| `DRAFT` | Being composed | ✅ Yes |
| `SUBMITTED` | Submitted for approval | ❌ No |
| `DEPT_REVIEW` | Department head review | ❌ No |
| `BUDGET_APPROVAL` | Budget controller review | ❌ No |
| `PROC_REVIEW` | Procurement team review | ❌ No |
| `APPROVED` | Approved, ready for RFQ conversion | ❌ No |
| `CONVERTED_TO_RFQ` | Converted to one or more RFQs | ❌ No |
| `CLOSED` | Completed (terminal) | ❌ No |
| `CANCELLED` | Cancelled by requester (terminal) | ❌ No |
| `REJECTED` | Rejected by approver | ⚠️ Can resubmit → DRAFT |

#### State Diagram
```
┌────────┐  submit  ┌───────────┐  dept-approve  ┌─────────────────┐
│ DRAFT  │ ────────▶│ SUBMITTED │ ─────────────▶│ DEPT_REVIEW     │
└────┬───┘           └─────┬─────┘                └────────┬────────┘
     │                     │                               │
     │ cancel              │ cancel                        │ budget-approve
     ▼                     ▼                               ▼
┌───────────┐       ┌───────────┐                  ┌─────────────────┐
│ CANCELLED │       │ CANCELLED │                  │ BUDGET_APPROVAL │
└───────────┘       └───────────┘                  └────────┬────────┘
                     (terminal)                              │
                                                            │ proc-approve
                                                            ▼
                                                    ┌─────────────────┐
                                                    │   PROC_REVIEW   │
                                                    └────────┬────────┘
                                                             │ approve
                                                             ▼
                                                    ┌─────────────────┐
                                                    │    APPROVED     │
                                                    └────────┬────────┘
                                                             │ convert
                                                             ▼
                                                    ┌─────────────────┐
                                                    │ CONVERTED_TO_RFQ│
                                                    └────────┬────────┘
                                                             │ close
                                                             ▼
                                                    ┌─────────────────┐
                                                    │     CLOSED      │ (terminal)
                                                    └─────────────────┘

  From DEPT_REVIEW / BUDGET_APPROVAL / PROC_REVIEW:
    ├── reject ──▶ REJECTED ──▶ (resubmit) ──▶ DRAFT
    └── return ──▶ DRAFT (for revision)
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `SUBMITTED` | submit | `pr:create` |
| `DRAFT` | `CANCELLED` | cancel | `pr:create` |
| `SUBMITTED` | `DEPT_REVIEW` | dept-review | `pr:approve` |
| `SUBMITTED` | `CANCELLED` | cancel | `pr:create` |
| `DEPT_REVIEW` | `BUDGET_APPROVAL` | budget-approve | `pr:approve` |
| `DEPT_REVIEW` | `REJECTED` | reject | `pr:approve` |
| `DEPT_REVIEW` | `DRAFT` | return | `pr:approve` |
| `BUDGET_APPROVAL` | `PROC_REVIEW` | proc-review | `pr:approve` |
| `BUDGET_APPROVAL` | `REJECTED` | reject | `pr:approve` |
| `BUDGET_APPROVAL` | `DRAFT` | return | `pr:approve` |
| `PROC_REVIEW` | `APPROVED` | approve | `pr:approve` |
| `PROC_REVIEW` | `REJECTED` | reject | `pr:approve` |
| `PROC_REVIEW` | `DRAFT` | return | `pr:approve` |
| `APPROVED` | `CONVERTED_TO_RFQ` | convert | `rfq:create` |
| `APPROVED` | `CLOSED` | close | `pr:approve` |
| `CONVERTED_TO_RFQ` | `CLOSED` | close | (system, automatic) |
| `REJECTED` | `DRAFT` | resubmit | `pr:create` |

---

### 2.8 RFQ Workflow

**Name**: `RfqLifecycle`
**Applies to**: Request for Quotations

#### States
| State | Description |
|---|---|
| `DRAFT` | Being composed |
| `SUBMITTED` | Submitted for internal approval |
| `SENT` | Sent to invited suppliers |
| `SUPPLIER_RESPONSE` | Awaiting supplier responses |
| `EVALUATION` | Evaluating received quotations |
| `AWARDED` | Awarded to a supplier |
| `CLOSED` | Completed or closed without award (terminal) |
| `CANCELLED` | Cancelled (terminal) |

#### State Diagram
```
┌────────┐ submit  ┌───────────┐ send  ┌────────┐ first-response  ┌────────────────────┐
│ DRAFT  │ ───────▶│ SUBMITTED │ ─────▶│  SENT  │ ──────────────▶│ SUPPLIER_RESPONSE  │
└────┬───┘          └─────┬─────┘       └───┬────┘                 └─────────┬──────────┘
     │                    │                  │                                │
     │ cancel             │ cancel           │ cancel                         │ close (no responses)
     ▼                    ▼                  ▼                                ▼
┌───────────┐      ┌───────────┐      ┌───────────┐                  ┌───────────┐
│ CANCELLED │      │ CANCELLED │      │ CANCELLED │                  │  CLOSED   │
└───────────┘      └───────────┘      └───────────┘                  └───────────┘
(terminal)          (terminal)         (terminal)                      (terminal)

  SUPPLIER_RESPONSE ── start-evaluation ──▶ EVALUATION
                                            ┌─────┴─────┐
                                       award│           │ close (no award)
                                            ▼           ▼
                                       ┌─────────┐  ┌───────────┐
                                       │ AWARDED │  │  CLOSED   │
                                       └────┬────┘  └───────────┘
                                            │ close    (terminal)
                                            ▼
                                       ┌───────────┐
                                       │  CLOSED   │
                                       └───────────┘
                                       (terminal)
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `SUBMITTED` | submit | `rfq:create` |
| `DRAFT` | `CANCELLED` | cancel | `rfq:create` |
| `SUBMITTED` | `SENT` | send | `rfq:approve` |
| `SUBMITTED` | `CANCELLED` | cancel | `rfq:create` |
| `SENT` | `SUPPLIER_RESPONSE` | first-response | (system, automatic) |
| `SENT` | `CANCELLED` | cancel | `rfq:create` |
| `SUPPLIER_RESPONSE` | `EVALUATION` | start-evaluation | `rfq:approve` |
| `SUPPLIER_RESPONSE` | `CANCELLED` | cancel | `rfq:create` |
| `SUPPLIER_RESPONSE` | `CLOSED` | close (no responses) | `rfq:approve` |
| `EVALUATION` | `AWARDED` | award | `rfq:approve` |
| `EVALUATION` | `CANCELLED` | cancel | `rfq:create` |
| `EVALUATION` | `CLOSED` | close (no award) | `rfq:approve` |
| `AWARDED` | `CLOSED` | close | (system, automatic) |
| `SENT` | `CLOSED` | close (no responses) | `rfq:approve` |

---

### 2.9 Quotation Workflow (Phase 9 — In Progress)

**Name**: `QuotationLifecycle`
**Applies to**: Supplier Quotations

#### States
| State | Description |
|---|---|
| `DRAFT` | Supplier composing quotation |
| `SUBMITTED` | Submitted by supplier |
| `TECHNICAL_REVIEW` | Technical evaluation in progress |
| `COMMERCIAL_REVIEW` | Commercial (price) evaluation |
| `RECOMMENDED` | Recommended for award |
| `AWARDED` | Awarded (won the RFQ) |
| `REJECTED` | Rejected at any review stage |
| `ARCHIVED` | Archived (terminal) |

#### State Diagram
```
┌────────┐ submit  ┌───────────┐ tech-review  ┌──────────────────┐
│ DRAFT  │ ───────▶│ SUBMITTED │ ───────────▶│ TECHNICAL_REVIEW │
└────────┘          └───────────┘              └────────┬─────────┘
                                                        │
                                          ┌─────────────┼─────────────┐
                                          │ commercial  │ reject       │
                                          ▼             ▼              ▼
                              ┌────────────────────┐ ┌──────────┐
                              │ COMMERCIAL_REVIEW  │ │ REJECTED │
                              └─────────┬──────────┘ └────┬─────┘
                                        │                  │
                          ┌─────────────┼──────────┐       │
                          │ recommend   │ reject   │       │
                          ▼             ▼          │       │
                    ┌──────────────┐ ┌──────────┐  │       │
                    │ RECOMMENDED  │ │ REJECTED │  │       │
                    └──────┬───────┘ └────┬─────┘  │       │
                           │              │        │       │
                  ┌────────┼────────┐    │        │       │
                  │ award  │ reject │    │        │       │
                  ▼        ▼        │    │        │       │
              ┌────────┐ ┌──────────┐ │    │        │       │
              │AWARDED │ │ REJECTED │ │    │        │       │
              └───┬────┘ └────┬─────┘ │    │        │       │
                  │           │       │    │        │       │
                  │ archive   │ archive    │        │       │
                  ▼           ▼        │    │        │       │
              ┌──────────────────┐    │    │        │       │
              │     ARCHIVED     │◀───┴────┴────────┴───────┘
              └──────────────────┘
                  (terminal)
```

#### Transitions
| From | To | Trigger | Permission |
|---|---|---|---|
| `DRAFT` | `SUBMITTED` | submit | `quot:create` |
| `SUBMITTED` | `TECHNICAL_REVIEW` | tech-review | `quot:approve` |
| `TECHNICAL_REVIEW` | `COMMERCIAL_REVIEW` | commercial-review | `quot:approve` |
| `TECHNICAL_REVIEW` | `REJECTED` | reject | `quot:approve` |
| `COMMERCIAL_REVIEW` | `RECOMMENDED` | recommend | `quot:approve` |
| `COMMERCIAL_REVIEW` | `REJECTED` | reject | `quot:approve` |
| `RECOMMENDED` | `AWARDED` | award | `quot:approve` |
| `RECOMMENDED` | `REJECTED` | reject | `quot:approve` |
| `AWARDED` | `ARCHIVED` | archive | (system, automatic) |
| `REJECTED` | `ARCHIVED` | archive | (system, automatic) |

---

## 3. Workflow Audit Trail

Every transition is recorded in the `audit_logs` table with:

| Field | Value |
|---|---|
| `action` | `TRANSITION` |
| `entity_type` | Entity name (e.g., `PurchaseRequisition`) |
| `entity_id` | Entity UUID |
| `entity_code` | Human-readable code (e.g., `PR-2026-00001`) |
| `before` | Previous state |
| `after` | New state |
| `actor_id` | User who triggered the transition |
| `reason` | Optional reason (e.g., rejection reason) |
| `severity` | `INFO` (normal) or `WARN` (rejection/cancellation) |

---

## 4. Domain Events

Each transition fires a domain event via the event bus:

| Pattern | Example |
|---|---|
| `<entity>.<action>` | `rfq.submitted`, `purchase_requisition.approved` |
| `<entity>.<state>` | `supplier.activated`, `customer.archived` |

Events are published to the `event_outbox` table for durable, at-least-once delivery.

---

## 5. Workflow Validation Rules

1. **Transition must be defined**: Attempting an undefined transition returns 422
2. **Guard must pass**: If a guard is defined and returns false, transition is blocked
3. **Permission required**: User must have the required permission (checked in route, not workflow)
4. **Optimistic concurrency**: `If-Match` header version must match current entity version
5. **Soft-deleted entities**: Cannot transition (returns 422)
6. **Terminal states**: Cannot transition out (returns 422)

---

*This document is FROZEN as of Phase 9B. Workflow changes require ADR + version bump.*
