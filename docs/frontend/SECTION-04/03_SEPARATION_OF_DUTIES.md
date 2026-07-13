# 03 — Separation of Duties (FINAL)

**Date**: 2026-07-13
**Status**: FINAL — PERMANENT SECURITY FOUNDATION

---

## 1. SoD Principles (7 Enterprise Principles)

1. **Maker-Checker**: The person who creates a transaction cannot approve, post, or release it
2. **Financial Integrity**: Anyone who creates/modifies financial records cannot also post/approve/reverse them
3. **Audit Independence**: Auditors have read-only access — zero write permissions on any module
4. **Procurement Integrity**: PO approver cannot receive goods; PR creator cannot approve PR or resulting PO
5. **Quality Independence**: Quality cannot dispatch goods, modify inventory quantities, or approve payments
6. **Inventory Integrity**: Finance cannot directly adjust inventory; Warehouse cannot modify GL
7. **Vendor Integrity**: Vendor creator cannot approve vendor; Vendor approver cannot create payment for same vendor

---

## 2. Critical SoD Rules (24 — expanded from 12)

### Procurement SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-01 | PR creator cannot approve PR | Role: procurement_officer (create) vs procurement_manager (approve) |
| SoD-02 | PO approver cannot receive goods | Role: procurement_manager (approve) vs warehouse_operator (receive) |
| SoD-03 | PO approver cannot approve payment for same PO | Role: procurement_manager (po:approve) vs finance_manager (payment:approve) — system must check PO approver ≠ payment approver |
| SoD-04 | Vendor creator cannot approve vendor | Role: procurement_officer (supplier:create) vs procurement_manager (supplier:approve) |
| SoD-05 | Vendor approver cannot create payment for same vendor | Cross-module check: supplier:approver ≠ payment:creator for same vendor |

### Finance SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-06 | JE creator cannot post JE | Role: finance_accountant (gl:create) vs finance_manager (gl:post) |
| SoD-07 | JE poster cannot reverse JE | Application check: gl:post actor ≠ gl:reverse actor for same entry |
| SoD-08 | Cost creator cannot approve revaluation | Role: finance_accountant (costing:create) vs finance_manager (costing:approve) |
| SoD-09 | Period closer cannot reopen period | Application check: finance:period:close actor ≠ finance:period:reopen actor for same period |
| SoD-10 | Payment creator cannot approve payment | Role: finance_accountant or finance_manager (payment:create) vs finance_manager (payment:approve) — system must check creator ≠ approver |

### Sales SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-11 | SO creator cannot approve SO | Role: sales_officer (so:create) vs sales_manager (so:approve) |
| SoD-12 | Discount creator cannot approve discount | Application check: pricing:create actor ≠ pricing:approve actor (future) |
| SoD-13 | Credit hold override requires senior approval | Role: only sales_manager has customer:credit:override |

### Warehouse & Inventory SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-14 | Stock adjuster cannot approve adjustment | Role: warehouse_supervisor (inventory:adjust) vs tenant_admin (inventory:adjust:approve) |
| SoD-15 | GRN creator cannot post GRN | Role: warehouse_supervisor (grn:create) vs warehouse_supervisor (grn:post) — application must check creator ≠ poster for same GRN |
| SoD-16 | Putaway task creator cannot complete own task | Application check: putaway:create actor ≠ putaway:complete actor for same task |

### Manufacturing SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-17 | Recipe creator cannot approve recipe | Role: manufacturing_supervisor has both — application must check recipe:create actor ≠ recipe:approve actor |
| SoD-18 | Batch creator cannot approve batch creation | Application check: batch:create actor ≠ batch:approve actor |
| SoD-19 | Production order creator cannot approve production order | Application check: production:create actor ≠ production:approve actor |

### Quality SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-20 | Inspection creator cannot approve inspection | Role: quality inspector (quality:inspect) vs quality_manager (quality:approve) |
| SoD-21 | NCR creator cannot approve NCR | Role: quality inspector (ncr:create) vs quality_manager (ncr:approve) |
| SoD-22 | Recall initiator must be different from recall approver | Application check: recall:initiate actor ≠ recall:approve actor |

### HR SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-23 | Employee creator cannot approve payroll | Role: hr_officer (hr:create) vs hr_manager or finance_manager (payroll:approve) |
| SoD-24 | Leave applicant cannot approve own leave | Application check: leave:create actor ≠ leave:approve actor (also check approver ≠ applicant at user level, not just role level) |

### Administration SoD

| # | Rule | Enforcement |
|---|---|---|
| SoD-25 | Role administrator cannot assign roles to self | Application check: role:manage actor cannot modify own roles |
| SoD-26 | Audit log cannot be modified by anyone | Technical: audit_log table is append-only (no UPDATE/DELETE at DB level) |
| SoD-27 | Break glass user cannot perform irreversible actions | Role design: break_glass role has NO post/approve/delete/override permissions |

---

## 3. Cross-Module Conflict Matrix

| Module A (Create) | Module B (Approve/Post) | Conflict? | SoD Rule |
|---|---|---|---|
| Purchase Requisition | Purchase Order Approval | ✅ Yes | SoD-01 |
| Purchase Order | Goods Receipt | ✅ Yes | SoD-02 |
| Purchase Order | Payment Approval | ✅ Yes | SoD-03 |
| Vendor Master | Vendor Approval | ✅ Yes | SoD-04 |
| Vendor Approval | Payment Creation | ✅ Yes | SoD-05 |
| Journal Entry | GL Posting | ✅ Yes | SoD-06 |
| GL Posting | GL Reversal | ✅ Yes | SoD-07 |
| Cost Record | Cost Revaluation Approval | ✅ Yes | SoD-08 |
| Fiscal Period Close | Fiscal Period Reopen | ✅ Yes | SoD-09 |
| Payment | Payment Approval | ✅ Yes | SoD-10 |
| Sales Order | SO Approval | ✅ Yes | SoD-11 |
| Discount/Promotion | Discount Approval | ✅ Yes | SoD-12 |
| Credit Hold | Credit Override | ✅ Yes | SoD-13 |
| Stock Adjustment | Adjustment Approval | ✅ Yes | SoD-14 |
| Goods Receipt | GRN Posting | ✅ Yes | SoD-15 |
| Putaway Task | Putaway Completion | ✅ Yes | SoD-16 |
| Recipe | Recipe Approval | ✅ Yes | SoD-17 |
| Batch | Batch Approval | ✅ Yes | SoD-18 |
| Production Order | Production Approval | ✅ Yes | SoD-19 |
| Inspection | Inspection Approval | ✅ Yes | SoD-20 |
| NCR | NCR Approval | ✅ Yes | SoD-21 |
| Recall Initiation | Recall Approval | ✅ Yes | SoD-22 |
| Employee Record | Payroll Approval | ✅ Yes | SoD-23 |
| Leave Application | Leave Approval | ✅ Yes | SoD-24 |
| Role Assignment | Self-Role Assignment | ✅ Yes | SoD-25 |
| (Any) | Audit Log Modification | ✅ Yes | SoD-26 |
| Break Glass | Post/Approve/Delete | ✅ Yes | SoD-27 |

---

## 4. Enforcement Architecture

| Layer | How | Example |
|---|---|---|
| **Role Design** | Roles designed so no single role has both create + approve for same entity | procurement_officer (create) vs procurement_manager (approve) |
| **Route Guard** | `requirePermission()` checks on every endpoint | POST /gl/:id/post requires `gl:post` — finance_accountant lacks this |
| **Service Layer** | Service checks if actor created the record | `if (record.createdBy === ctx.userId) throw new BusinessRuleError('Cannot approve own record')` |
| **Data Scope** | Scope limits what records a user can see/act on | warehouse_operator:wh can only see/act on their warehouse's stock |
| **Audit Trail** | Every approval/post logged with actor — compliance detects violations | auditService.log({ action: 'APPROVE', actorId, entityId, severity: 'INFO' }) |
| **Break Glass** | Emergency access is read-only + configure — no irreversible actions | break_glass role lacks all `*:post`, `*:approve`, `*:delete`, `*:override` |
| **Frontend UI** | Buttons hidden/disabled based on `hasPermission()` | `{hasPermission('gl:post') && <Button>Post</Button>}` |

---

## 5. Delegation Architecture

### Delegation Model

```
User A (Manager) → delegates to → User B (Delegate)
User B can now: approve:as-delegate for delegated domain
User A retains: full approve authority (delegation doesn't revoke)
```

### Delegation Rules

1. **Explicit**: Delegation must be explicitly created by the delegating user
2. **Time-limited**: Delegation has start and end datetime (max 30 days)
3. **Domain-scoped**: Delegation is per-domain (e.g., delegate SO approvals only, not PO approvals)
4. **Auditable**: Every delegation created/used/expired is logged
5. **Revocable**: Delegating user can revoke at any time
6. **No chaining**: Delegate cannot delegate to another user (no delegation chains)
7. **SoD preserved**: Delegate must already have the base role (e.g., to approve SOs as delegate, user must be a sales_manager or sales_officer with delegate permission)

### Delegation Permissions

| Permission | Description |
|---|---|
| `so:delegate` | Delegate SO approval authority |
| `so:approve:as-delegate` | Approve SO on behalf of delegating user |
| `pr:delegate` | Delegate PR approval authority |
| `pr:approve:as-delegate` | Approve PR as delegate |
| `po:delegate` | Delegate PO approval authority |
| `po:approve:as-delegate` | Approve PO as delegate |
| `gl:delegate` | Delegate GL approval authority |
| `gl:approve:as-delegate` | Approve GL as delegate |
| `leave:delegate` | Delegate leave approval authority |
| `leave:approve:as-delegate` | Approve leave as delegate |
| `attendance:delegate` | Delegate attendance approval |
| `attendance:approve:as-delegate` | Approve attendance as delegate |

---

**END OF SEPARATION OF DUTIES (FINAL)**
