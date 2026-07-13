# 03 — Partial Modules

**Date**: 2026-07-13
**Status**: FINAL

---

## 🟡 PARTIAL Modules (19 of 29)

Each module has a functional backend but lacks some capabilities needed for full frontend wiring.

---

### 1. `inventory` — 🟡 PARTIAL
**Endpoints**: 14 | **Missing**: PATCH, DELETE, stock-transfer, stock-adjustment, reverse/repost
**Bugs**: BUG-1 (reservedBy_Name typo), BUG-2 (blockedBy_Name typo)
**RBAC**: ✅ Proper (INVENTORY_READ, INVENTORY_POST, INVENTORY_ADJUST)
**What's missing for frontend**: Edit stock levels, delete inventory records (by design — immutable), transfer stock between warehouses, adjust stock with variance
**Effort to complete**: 20 hours

### 2. `warehouse` — 🟡 PARTIAL
**Endpoints**: 16 | **Missing**: PATCH/DELETE for zones, aisles, racks, bins, barcodes
**Bugs**: BUG-3 (assignedTo_Name typo)
**RBAC**: ⚠️ Uses INVENTORY_* proxy (should be WAREHOUSE_*)
**What's missing for frontend**: Edit zone/aisle/rack/bin details, delete/deactivate bins, reassign putaway tasks
**Effort to complete**: 15 hours

### 3. `procurement` — 🟡 PARTIAL
**Endpoints**: 6 | **Missing**: Dedicated PR_* permissions
**Bugs**: BUG-12 (DELETE uses PR_CREATE)
**RBAC**: ⚠️ Uses PO_* proxy
**What's missing for frontend**: Nothing functional — just permission cleanup
**Effort to complete**: 2 hours

### 4. `quality-inspection` — 🟡 PARTIAL
**Endpoints**: 20 | **Missing**: PATCH/DELETE on lots/plans/holds/ncrs/capas, CAPA transition endpoint
**Bugs**: BUG-13 (NCR/CAPA reads use GRN_READ)
**RBAC**: ⚠️ Mixed (IQC_*, NCR_*, GRN_READ)
**What's missing for frontend**: Edit inspection results, cancel NCRs, close CAPAs
**Effort to complete**: 10 hours

### 5. `batch-manufacturing` — 🟡 PARTIAL
**Endpoints**: 9 | **Missing**: UPDATE/DELETE on batches, events on transition/split/merge
**RBAC**: ⚠️ Uses PRODUCT_* proxy
**What's missing for frontend**: Edit batch details, delete batches, event-driven notifications
**Effort to complete**: 8 hours

### 6. `product-costing` — 🟡 PARTIAL (Stub-template)
**Endpoints**: 8 | **Missing**: Cost calculation from BOM, variance analysis, standard cost update
**Bugs**: BUG-5 (AUDIT_READ for R+W)
**RBAC**: ❌ Broken (AUDIT_READ for both)
**What's missing for frontend**: Real cost data (currently generic CRUD with no calculation)
**Effort to complete**: 40 hours (implement actual cost logic)

### 7. `financial-foundation` — 🟡 PARTIAL
**Endpoints**: 14 | **Missing**: UPDATE/DELETE on all entities, events
**RBAC**: ⚠️ AUDIT_READ/CRITICAL proxy
**What's missing for frontend**: Edit accounts, close fiscal years, update exchange rates
**Effort to complete**: 12 hours

### 8. `general-ledger` — 🟡 PARTIAL (Stub-template)
**Endpoints**: 8 | **Missing**: Double-entry validation, GL posting, reversal
**Bugs**: BUG-5 (AUDIT_READ for R+W)
**RBAC**: ❌ Broken (AUDIT_READ for both)
**What's missing for frontend**: Post journal entries, reverse posted entries, view trial balance
**Effort to complete**: 60 hours (implement actual GL logic)

### 9. `gst-taxation` — 🟡 PARTIAL (Stub-template)
**Endpoints**: 8 | **Missing**: E-invoice generation, GSTR returns, tax calculation
**Bugs**: BUG-5 (AUDIT_READ for R+W)
**RBAC**: ❌ Broken (AUDIT_READ for both)
**What's missing for frontend**: Generate e-invoices, file returns, view tax liability
**Effort to complete**: 80 hours (implement actual GST logic)

### 10. `mes` — 🟡 PARTIAL
**Endpoints**: 13 | **Missing**: UPDATE/DELETE for work centers/machines/shifts, downtime workflow
**Bugs**: BUG-7 (OEE calculation bug), BUG-8 (warehouse_operator lacks INVENTORY_ADJUST)
**RBAC**: ⚠️ Uses PRODUCT_* proxy
**What's missing for frontend**: Edit machine details, delete work centers, OEE dashboard with correct metrics
**Effort to complete**: 15 hours

### 11. `order-fulfillment` — 🟡 PARTIAL
**Endpoints**: 4 | **Missing**: PATCH/DELETE, cancel/release, short-pick handling
**RBAC**: ⚠️ Uses CUSTOMER_* proxy
**What's missing for frontend**: Cancel allocations, release waves, handle short picks
**Effort to complete**: 10 hours

### 12. `pick-pack-dispatch` — 🟡 PARTIAL
**Endpoints**: 6 | **Missing**: PATCH/DELETE, pick-complete, pack-complete, dispatch-confirm transitions
**Bugs**: BUG-4 (CRITICAL: corrupts inventory on shipment), BUG-11 (no SO status validation)
**RBAC**: ⚠️ Uses CUSTOMER_* proxy
**What's missing for frontend**: Complete pick tasks, complete packing, confirm dispatch
**Effort to complete**: 15 hours (including bug fix)

### 13. `delivery-management` — 🟡 PARTIAL
**Endpoints**: 6 | **Missing**: PATCH/DELETE, reschedule, exception resolution
**RBAC**: ⚠️ Uses CUSTOMER_* proxy
**What's missing for frontend**: Reschedule deliveries, resolve exceptions, update delivery status
**Effort to complete**: 10 hours

### 14. `sales-order` — 🟡 PARTIAL
**Endpoints**: 5 | **Missing**: PATCH (update), DELETE, SO line update
**RBAC**: ⚠️ Uses CUSTOMER_* proxy
**What's missing for frontend**: Edit sales orders, delete sales orders, update line items
**Effort to complete**: 8 hours

### 15. `customer-returns` — 🟡 PARTIAL
**Endpoints**: 8 | **Missing**: PATCH/DELETE on RMA, refund approval, inventory restock
**Bugs**: BUG-9 (no version field)
**RBAC**: ⚠️ Uses CUSTOMER_* proxy
**What's missing for frontend**: Edit RMAs, approve refunds, restock inventory
**Effort to complete**: 10 hours

### 16. `attendance-shift` — 🟡 PARTIAL (Stub-template)
**Endpoints**: 7 | **Missing**: Clock-in/out, shift roster, overtime calculation, timesheet integration
**Bugs**: BUG-6 (ORG_* proxy)
**RBAC**: ❌ Broken (ORG_* for HR functions)
**What's missing for frontend**: Clock in/out, view shifts, manage rosters, approve overtime
**Effort to complete**: 40 hours (implement actual attendance logic)

### 17. `performance-management` — 🟡 PARTIAL (Stub-template)
**Endpoints**: 7 | **Missing**: Goals, appraisals, 360 feedback (5 Prisma models exist but unused)
**Bugs**: BUG-6 (ORG_* proxy)
**RBAC**: ❌ Broken (ORG_* for HR functions)
**What's missing for frontend**: Set goals, conduct appraisals, collect 360 feedback
**Effort to complete**: 60 hours (implement actual performance logic)

### 18. `alerts-kpi-engine` — 🟡 PARTIAL (Stub-template)
**Endpoints**: 7 | **Missing**: Alert firing engine, KPI computation, escalation
**RBAC**: ⚠️ AUDIT_READ/CRITICAL
**What's missing for frontend**: View fired alerts, configure KPI thresholds, see escalations
**Effort to complete**: 50 hours (implement actual alert logic)

### 19. `financial-foundation` — 🟡 PARTIAL
(See #7 above — listed twice in raw audit; same module)

---

## Summary

| Gap Type | Modules Affected | Effort |
|---|---|---|
| Missing PATCH/DELETE | 12 | ~80 hours |
| Broken RBAC (proxy permissions) | 15 | ~16 hours |
| Stub-template (no domain logic) | 6 | ~330 hours |
| Critical bugs | 5 | ~8 hours |
| Missing events | 4 | ~4 hours |
| **Total to complete all PARTIAL modules** | **19** | **~438 hours** |

---

**END OF PARTIAL MODULES**
