# 03 — Separation of Duties

**Date**: 2026-07-13
**Status**: FINAL

---

## 1. SoD Principles

1. **Maker-Checker**: The person who creates a transaction cannot approve it
2. **Financial Integrity**: Anyone who can create/modify financial records cannot also post/approve them
3. **Audit Independence**: Auditors have read-only access — no write permissions on any module
4. **Procurement Integrity**: The person who approves a PO cannot receive goods against it
5. **Quality Independence**: Quality cannot dispatch goods or modify inventory quantities
6. **Inventory Integrity**: Finance cannot directly adjust inventory quantities (must go through warehouse)

---

## 2. Critical SoD Rules

| # | Rule | Violation Example | Enforcement |
|---|---|---|---|
| SoD-01 | PO approver cannot receive goods | User with `po:approve` + `po:receive` | Role design — procurement_manager has `po:approve` but NOT `po:receive`; warehouse_operator has `po:receive` but NOT `po:approve` |
| SoD-02 | GL creator cannot post entries | User with `gl:create` + `gl:post` | Role design — finance_accountant has `gl:create` but NOT `gl:post`; finance_manager has `gl:post` but NOT `gl:create` |
| SoD-03 | Auditor cannot modify any data | User with `audit:read` + any write permission | Role design — auditor role has ONLY `*:read` permissions |
| SoD-04 | Quality cannot dispatch | User with `quality:approve` + `shipment:create` | Role design — quality_manager has no warehouse/sales write permissions |
| SoD-05 | Finance cannot adjust inventory | User with `gl:*` + `inventory:adjust` | Role design — finance roles have no `inventory:adjust` |
| SoD-06 | Warehouse cannot approve pricing | User with `warehouse:*` + `pricing:create` | Role design — warehouse roles have no `pricing:create` |
| SoD-07 | PR creator cannot approve PR | User with `pr:create` + `pr:approve` | Role design — procurement_officer has `pr:create` but NOT `pr:approve`; procurement_manager has `pr:approve` |
| SoD-08 | Cost creator cannot approve revaluation | User with `costing:create` + `costing:approve` | Role design — finance_accountant has `costing:create` but NOT `costing:approve`; finance_manager has `costing:approve` |
| SoD-09 | NCR creator cannot approve NCR | User with `ncr:create` + `ncr:approve` | Role design — quality inspectors create NCRs; quality_manager approves |
| SoD-10 | Stock adjuster cannot approve adjustment | User with `inventory:adjust` + `inventory:adjust:approve` | Role design — warehouse_supervisor adjusts; warehouse_manager (future) or tenant_admin approves |
| SoD-11 | SO creator cannot approve SO | User with `so:create` + `so:approve` | Role design — sales_officer creates; sales_manager approves |
| SoD-12 | Leave applicant cannot approve own leave | User with `leave:create` + `leave:approve` | Application logic — system must check approver ≠ applicant (not just role-based) |

---

## 3. Cross-Module Conflict Matrix

| Module A (Create) | Module B (Approve) | Conflict? | Reason |
|---|---|---|---|
| Purchase Requisition | Purchase Order Approval | ✅ Yes | PR creator should not approve resulting PO |
| Purchase Order | Goods Receipt | ✅ Yes | PO approver should not receive goods |
| Sales Order | Sales Order Approval | ✅ Yes | SO creator should not approve own SO |
| Journal Entry | GL Posting | ✅ Yes | JE creator should not post to GL |
| Cost Record | Cost Revaluation Approval | ✅ Yes | Cost creator should not approve revaluation |
| NCR | NCR Approval | ✅ Yes | NCR creator should not approve NCR closure |
| Stock Adjustment | Adjustment Approval | ✅ Yes | Adjuster should not approve own adjustment |
| Cycle Count | Variance Approval | ✅ Yes | Counter should not approve variance |
| Inspection Result | Inspection Approval | ✅ Yes | Inspector should not approve own results |
| Leave Application | Leave Approval | ✅ Yes | Applicant should not approve own leave |
| Batch Creation | Batch Transition | ❌ No | Manufacturing supervisor can both create and transition (operational, not financial) |
| Putaway Task | Putaway Completion | ❌ No | Warehouse operator creates and completes (operational) |
| Pick List | Pick Completion | ❌ No | Warehouse operator picks and completes (operational) |

---

## 4. SoD Enforcement Points

| Enforcement Layer | How | Example |
|---|---|---|
| **Role Design** | Roles are designed so no single role has both create + approve for the same entity | procurement_officer (create) vs procurement_manager (approve) |
| **Route Guard** | `requirePermission()` middleware checks permission on every endpoint | POST /po/:id/approve requires `po:approve` — procurement_officer lacks this |
| **Service Layer** | Service can check if the actor is the same user who created the record | `if (record.createdBy === ctx.userId) throw new BusinessRuleError('Cannot approve own record')` |
| **Audit Trail** | Every approval is logged with actor — compliance can detect violations | auditService.log({ action: 'APPROVE', actorId, entityId }) |
| **Frontend UI** | Buttons hidden/disabled based on `hasPermission()` | `{hasPermission('po:approve') && <Button>Approve</Button>}` |

---

**END OF SEPARATION OF DUTIES**
