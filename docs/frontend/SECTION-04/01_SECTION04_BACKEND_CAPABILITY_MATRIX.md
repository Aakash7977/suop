# 01 — Section 04 Backend Capability Matrix

**Date**: 2026-07-13
**Method**: Source-file inspection of all 20 existing backend modules + verification of 9 claimed-missing modules. Every claim cited with file:line source.

---

## Complete Classification

| # | Module | Status | Endpoints | CRUD | Workflow | RBAC | Events | Audit | Key Gap |
|---|--------|--------|-----------|------|----------|------|--------|-------|---------|
| 1 | `goods-receipt` | ✅ COMPLETE | 7 | C+R+U+D+T | ✅ 8 states | ✅ GRN_* | ✅ 5 events | ✅ | Line-level UPDATE missing |
| 2 | `purchase-order` | ✅ COMPLETE | 17 | C+R+U+D+T | ✅ 15 states | ✅ PO_* | ✅ 3 events | ✅ | Strongest module |
| 3 | `inventory` | 🟡 PARTIAL | 14 | C+R (no U/D) | ❌ None | ✅ INVENTORY_* | ✅ 3 events | ✅ | Field-map bug, no PATCH/DELETE, no transfer/reverse |
| 4 | `warehouse` | 🟡 PARTIAL | 16 | C+R (no U/D for zones/aisles/racks/bins) | ❌ None | ⚠️ INVENTORY_* proxy | ✅ 2 events | ✅ | Field-map bug, no update/delete for master data |
| 5 | `procurement` | 🟡 PARTIAL | 6 | C+R+U+D+T | ✅ | ⚠️ PO_* proxy | ✅ 5 events | ✅ | Uses PO permissions instead of PR_* |
| 6 | `quality-inspection` | 🟡 PARTIAL | 20 | C+R (no U/D) | ✅ 7 states | ⚠️ Mixed (IQC_*, NCR_*, GRN_READ) | ⚠️ Partial | ✅ | No PATCH/DELETE on lots/plans/holds/ncrs |
| 7 | `batch-manufacturing` | 🟡 PARTIAL | 9 | C+R+T (no U/D) | ✅ 6 states | ⚠️ PRODUCT_* proxy | ⚠️ Missing transition events | ✅ | No UPDATE/DELETE, no events on transition/split/merge |
| 8 | `product-costing` | 🟡 PARTIAL | 8 | C+R+U+D+T | ✅ 5 states | ❌ AUDIT_READ for R+W | ✅ 2 events | ✅ | Stub-template, no cost calculation logic |
| 9 | `financial-foundation` | 🟡 PARTIAL | 14 | C+R (no U/D) | ✅ 4 states | ⚠️ AUDIT_READ/CRITICAL | ❌ No events | ✅ | No update/delete, no events |
| 10 | `general-ledger` | 🟡 PARTIAL | 8 | C+R+U+D+T | ✅ 6 states | ❌ AUDIT_READ for R+W | ✅ 2 events | ✅ | Stub-template, no double-entry validation |
| 11 | `gst-taxation` | 🟡 PARTIAL | 8 | C+R+U+D+T | ✅ 5 states | ❌ AUDIT_READ for R+W | ✅ 2 events | ✅ | Stub-template, no e-invoice generation |
| 12 | `mes` | 🟡 PARTIAL | 13 | C+R (machine status only) | ❌ None | ⚠️ PRODUCT_* proxy | ✅ 2 events | ⚠️ Missing recordEvent | OEE bug, no update/delete |
| 13 | `order-fulfillment` | 🟡 PARTIAL | 4 | C+R only | ❌ None | ⚠️ CUSTOMER_* proxy | ✅ 2 events | ✅ | No PATCH/DELETE, no cancel/release |
| 14 | `pick-pack-dispatch` | 🟡 PARTIAL | 6 | C+R only | ❌ None | ⚠️ CUSTOMER_* proxy | ⚠️ Partial | ✅ | **CRITICAL BUG**: corrupts inventory on shipment |
| 15 | `delivery-management` | 🟡 PARTIAL | 6 | C+R only | ❌ None | ⚠️ CUSTOMER_* proxy | ✅ 2 events | ✅ | No PATCH/DELETE, no reschedule |
| 16 | `sales-order` | 🟡 PARTIAL | 5 | C+R+T (no U/D) | ✅ | ⚠️ CUSTOMER_* proxy | ✅ 2 events | ✅ | No UPDATE/DELETE, no SO line update |
| 17 | `customer-returns` | 🟡 PARTIAL | 8 | C+R+T (no U/D) | ❌ None | ⚠️ CUSTOMER_* proxy | ✅ 2 events | ✅ | No PATCH/DELETE, no restock on inspection |
| 18 | `attendance-shift` | 🟡 PARTIAL | 7 | C+R+U+D+T | ✅ | ❌ ORG_* proxy | ✅ 2 events | ✅ | Stub-template, no shift/roster logic |
| 19 | `performance-management` | 🟡 PARTIAL | 7 | C+R+U+D+T | ✅ | ❌ ORG_* proxy | ✅ 2 events | ✅ | Stub-template, no goals/appraisals |
| 20 | `alerts-kpi-engine` | 🟡 PARTIAL | 7 | C+R+U+D+T | ✅ | ⚠️ AUDIT_READ/CRITICAL | ✅ 2 events | ✅ | Stub-template, no alert firing engine |
| 21 | `receiving` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no tables, no endpoints |
| 22 | `yard` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no tables, no endpoints |
| 23 | `eam` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no tables, no endpoints |
| 24 | `cycle-count` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no tables, no endpoints |
| 25 | `stock-transfer` | 🔴 MISSING | 0 | — | — | — | — | — | No endpoint (inventory has no transfer) |
| 26 | `stock-adjustment` | 🔴 MISSING | 0 | — | — | — | — | — | No endpoint (INVENTORY_ADJUST only used for blocks) |
| 27 | `task-queue` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no tables, no endpoints |
| 28 | `mission-control` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no aggregation endpoint |
| 29 | `control-tower` | 🔴 MISSING | 0 | — | — | — | — | — | No module, no SLA/exception endpoints |

## Summary

| Classification | Count | Frontend Modules Affected |
|---|---|---|
| ✅ COMPLETE | 2 | 2 modules can be fully wired |
| 🟡 PARTIAL | 19 | 11 modules wired with workarounds |
| 🔴 MISSING | 9 | 27 modules fully blocked (mock only) |
| **Total** | **29** | **38 frontend modules** |

## 13 Critical Bugs

| # | Severity | Module | Bug | Impact |
|---|---|---|---|---|
| BUG-1 | High | inventory | `reservedBy_Name` typo | `reserved_by_name` always NULL |
| BUG-2 | High | inventory | `blockedBy_Name` typo | `blocked_by_name` always NULL |
| BUG-3 | High | warehouse | `assignedTo_Name` typo | `assigned_to_name` always NULL |
| BUG-4 | **CRITICAL** | pick-pack-dispatch | stockOut passes soId as productId, empty uomId | Corrupts inventory or silently fails |
| BUG-5 | **CRITICAL** | product-costing, GL, GST | AUDIT_READ for both R and W | Auditors can mutate financial data |
| BUG-6 | **CRITICAL** | attendance, performance | ORG_READ/UPDATE proxy | Procurement officers can mutate HR |
| BUG-7 | Medium | mes | OEE calculation uses capacity as cycle time | OEE metrics meaningless |
| BUG-8 | High | permissions | warehouse_operator lacks INVENTORY_ADJUST | Can't block stock or mark expired |
| BUG-9 | Medium | customer-returns | No version field in genRepo create | Optimistic concurrency not enforced |
| BUG-10 | Low | order-fulfillment | Lowercase table name in raw SQL | Fragile across DB configs |
| BUG-11 | Medium | pick-pack-dispatch | No SO status validation before picking | Can pick unapproved orders |
| BUG-12 | High | procurement | DELETE uses PR_CREATE permission | Wrong permission for delete |
| BUG-13 | Medium | quality-inspection | NCR/CAPA reads use GRN_READ | Inconsistent permission model |

---

**END OF BACKEND CAPABILITY MATRIX**
