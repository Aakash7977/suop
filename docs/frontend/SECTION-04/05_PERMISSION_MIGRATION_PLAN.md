# 05 — Permission Migration Plan

**Date**: 2026-07-13
**Status**: FINAL (pending approval)

---

## 1. Migration Overview

| Metric | Value |
|---|---|
| Old permissions | 38 (many proxy) |
| New permissions | ~215 (domain-specific) |
| New roles | 6 (added to existing 6 = 12 total) |
| Route files to update | ~30 |
| Registry file to rewrite | 1 (`core/permissions/registry.ts`) |
| Estimated effort | 14 hours |
| Risk | LOW — backward compatible via aliases |

---

## 2. Migration Phases

### Step 1: Rewrite Permission Registry (2 hours)
1. Replace `Permission` enum with new ~215 domain-specific permissions
2. Add backward compatibility aliases:
   ```typescript
   // Backward compat aliases (to be removed after all routes updated)
   export const ORG_READ = Permission.ORG_READ  // already same
   export const IQC_INSPECT = Permission.QUALITY_INSPECT  // renamed
   export const INVENTORY_POST = Permission.INVENTORY_STOCKIN  // renamed
   ```
3. Define 12 roles (6 existing revised + 6 new)
4. Keep `PermissionChecker` class unchanged (works with any permission strings)

### Step 2: Update Route Files (10 hours)
For each of ~30 route files:
1. Replace proxy permissions with domain-specific permissions
2. Example: `Permission.AUDIT_READ` → `Permission.COSTING_READ` in product-costing routes
3. Example: `Permission.CUSTOMER_READ` → `Permission.SO_READ` in sales-order routes
4. Example: `Permission.PRODUCT_READ` → `Permission.BATCH_READ` in batch-manufacturing routes

**Order** (by domain):
1. Organization (1 file)
2. Catalog/Product (1 file)
3. Customer (1 file) + Supplier (1 file)
4. Inventory (1 file) + Warehouse (1 file) + Goods Receipt (1 file)
5. Procurement (1 file) + Purchase Order (1 file) + Quotation (1 file) + RFQ (1 file)
6. Sales Order (1 file) + Order Fulfillment (1 file) + Pick-Pack-Dispatch (1 file) + Delivery (1 file) + Returns (1 file) + Pricing (1 file)
7. Batch Manufacturing (1 file) + MES (1 file) + Recipe-BOM (1 file)
8. Quality Inspection (1 file) + Quality Foundation (1 file) + NCR (1 file) + CAPA (1 file) + COA (1 file) + Recall (1 file)
9. Product Costing (1 file) + GL (1 file) + GST (1 file) + Financial Foundation (1 file)
10. Attendance (1 file) + Performance (1 file) + Leave (1 file) + Payroll (1 file)
11. CRM (multiple files)
12. BI/Alerts (1 file) + User Management (1 file) + Auth (1 file)

### Step 3: Update Default Roles (1 hour)
1. Revise existing 6 roles to use new permissions
2. Add 6 new roles (sales_officer, sales_manager, warehouse_supervisor, finance_accountant, finance_manager, manufacturing_supervisor)
3. Remove customer write permissions from quality_manager, procurement_officer, procurement_manager

### Step 4: Verify Backend Build (30 min)
```bash
cd apps/backend && bun run build
```

### Step 5: Verify Frontend Build (30 min)
```bash
npx next build
```

### Step 6: Remove Backward Compat Aliases (after all routes verified)
Delete alias constants from registry.ts

---

## 3. Backward Compatibility Strategy

During migration, old permission names will be aliased to new ones:
```typescript
// Temporary aliases (delete after all consumers updated)
export const AUDIT_READ = Permission.AUDIT_READ  // unchanged
export const INVENTORY_POST = Permission.INVENTORY_STOCKIN  // renamed
export const IQC_INSPECT = Permission.QUALITY_INSPECT  // renamed
export const GRN_PUTAWAY = Permission.PUTAWAY_CREATE  // renamed
```

This ensures no route breaks during migration. After all routes are updated, aliases are removed.

---

## 4. Rollback Plan

If migration fails:
1. `git revert` to pre-migration commit
2. All old permissions restored
3. No data loss (permissions are code-only, not database)

---

**END OF PERMISSION MIGRATION PLAN**
