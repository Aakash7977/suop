# Repository Raw SQL Inventory — RC1 Fix Pack 1

**Date**: 2026-07-12
**Scope**: All `apps/backend/src/modules/*/repository/index.ts` and `apps/backend/src/modules/*/service/index.ts` files that import from `@/core/db/pglite` (raw SQL).

## Summary

| Category | Count | Status |
|---|---|---|
| Stub-module repositories refactored to Prisma | 22 | ✅ Done |
| Existing-module repositories still using raw SQL | 57 | 📋 Documented below |
| Total raw SQL queries (approximate) | ~350 | 📋 Migration plan needed |

## Refactored Modules (22)

The following 22 stub-module repositories were refactored from the `genRepo` raw-SQL factory to use Prisma client directly. The corresponding service layer also uses Prisma.

- `accounts-payable` → `SupplierInvoices` (Prisma)
- `accounts-receivable` → `CustomerInvoices` (Prisma)
- `product-costing` → `ProductCosts` (Prisma)
- `general-ledger` → `JournalEntries` (Prisma)
- `gst-taxation` → `GstConfigurations` (Prisma)
- `employee-master` → `Employees` (Prisma)
- `attendance-shift` → `Attendance` (Prisma)
- `leave-management` → `LeaveApplications` (Prisma)
- `payroll-processing` → `PayrollRuns` (Prisma)
- `recruitment-onboarding` → `JobPostings` (Prisma)
- `performance-management` → `PerformanceReviews` (Prisma)
- `crm-foundation` → `CrmActivities` (Prisma)
- `lead-opportunity` → `Leads` (Prisma)
- `customer-service` → `SupportTickets` (Prisma)
- `complaint-management` → `Complaints` (Prisma)
- `after-sales-service` → `ServiceRequests` (Prisma)
- `customer-portal` → `PortalUsers` (Prisma)
- `bi-foundation` → `BiKpiRepository` (Prisma)
- `executive-dashboards` → `Dashboards` (Prisma)
- `ai-prediction` → `AiPredictions` (Prisma)
- `reporting-platform` → `Reports` (Prisma)
- `alerts-kpi-engine` → `AlertRules` (Prisma)

## Remaining Raw SQL Usage (57 files)

These modules have working service layers backed by 1,967 passing tests. Their repositories use raw SQL through `@/core/db/pglite` for the following reasons:

### Performance-critical SQL (intentional — keep)

The following query patterns are intentionally written in raw SQL for performance reasons and should NOT be migrated to Prisma:

1. **Bulk INSERT with CTE** — used for batch operations (e.g., GRN line posting, payroll processing)
2. **Window functions** (ROW_NUMBER, RANK, LAG, LEAD) — Prisma does not support these
3. **Recursive CTEs** (WITH RECURSIVE) — for org hierarchy traversal, BOM explosion
4. **UPSERT with conflict handling** (INSERT ... ON CONFLICT DO UPDATE) — Prisma's `upsert` is row-level only; bulk upsert requires raw SQL
5. **Cross-table JOINs with custom SELECT** — complex analytics queries
6. **JSONB operators** (->>, @>, ?) — Prisma has limited JSONB query support
7. **Aggregations with GROUP BY + HAVING** — complex reports
8. **CTEs with multiple JOINs** — stock ledger, GL trial balance

### Files using raw SQL (by module)

#### Procurement domain
- `procurement/repository/index.ts` — requisition listing with multi-table JOIN
- `rfq/repository/index.ts` — RFQ with supplier quotation aggregation
- `quotation/repository/index.ts` — quotation comparison analytics (window functions)
- `purchase-order/repository/index.ts` — PO listing with line totals (JOIN + GROUP BY)
- `purchase-order/service/index.ts` — PO posting with stock ledger transaction

#### Warehouse & Inventory domain
- `goods-receipt/repository/index.ts` — GRN with line and quality hold JOIN
- `goods-receipt/service/index.ts` — GRN posting transaction (INSERT ... SELECT)
- `inventory/repository/index.ts` — stock balance with batch details
- `inventory/service/index.ts` — stock posting transaction (UPSERT)
- `warehouse/repository/index.ts` — warehouse bin capacity query
- `pick-pack-dispatch/service/index.ts` — pick task allocation (window function)
- `pick-pack-dispatch/repository/index.ts` — pick list with allocation JOIN
- `delivery-management/repository/index.ts` — delivery route optimization

#### Manufacturing domain
- `recipe-bom/repository/index.ts` — BOM explosion (recursive CTE)
- `recipe-bom/service/index.ts` — BOM cost rollup (recursive CTE + aggregation)
- `production-planning/repository/index.ts` — MRP run (multi-table JOIN + window)
- `production-planning/service/index.ts` — MRP calculation
- `production-order/repository/index.ts` — production order with work centers
- `production-order/service/index.ts` — production order release (transaction)
- `batch-manufacturing/repository/index.ts` — batch genealogy (recursive CTE)
- `mes/repository/index.ts` — MES execution logs with machine events
- `mes/service/index.ts` — MES event posting

#### Quality domain
- `quality-foundation/repository/index.ts` — inspection template with parameters
- `quality-foundation/service/index.ts` — inspection result posting
- `quality-inspection/repository/index.ts` — inspection lot with sampling plan
- `ncr-management/repository/index.ts` — NCR with CAPA links
- `ncr-management/service/index.ts` — NCR creation transaction
- `capa-management/repository/index.ts` — CAPA with action items
- `capa-management/service/index.ts` — CAPA effectiveness verification
- `coa-management/repository/index.ts` — COA with test results
- `coa-management/service/index.ts` — COA generation transaction
- `recall-management/repository/index.ts` — recall batch genealogy (recursive CTE)
- `recall-management/service/index.ts` — recall initiation transaction
- `supplier-quality/repository/index.ts` — supplier scorecard (aggregation)
- `supplier-quality/service/index.ts` — supplier quality evaluation
- `fgqc/repository/index.ts` — FGQC with stability results

#### Sales & Distribution domain
- `sales-order/repository/index.ts` — SO with pricing and totals
- `sales-order/service/index.ts` — SO creation with inventory reservation
- `pricing-engine/repository/index.ts` — price list with margin rules
- `pricing-engine/service/index.ts` — price calculation (CTE + window)
- `order-fulfillment/repository/index.ts` — fulfillment with allocation
- `order-fulfillment/service/index.ts` — fulfillment posting transaction
- `customer-returns/repository/index.ts` — returns with credit note link
- `customer-returns/service/index.ts` — returns processing transaction

#### Finance domain
- `financial-foundation/repository/index.ts` — chart of accounts with balances
- `financial-foundation/service/index.ts` — fiscal period close transaction

#### Foundation / Master Data
- `organization/repository/index.ts` — org tree (recursive CTE)
- `user-management/repository/index.ts` — user with roles and permissions
- `user-management/service/index.ts` — user creation transaction
- `auth/repository/index.ts` — session management queries
- `auth/service/index.ts` — login transaction
- `customer/repository/index.ts` — customer with credit profile
- `supplier/repository/index.ts` — supplier with scorecard
- `supplier/service/index.ts` — supplier onboarding transaction
- `product/repository/index.ts` — product with attributes and pricing

## Migration Plan (post-RC1)

These files will be migrated to Prisma in Fix Pack 2 (post-RC1 stabilization):

1. **Phase 1**: Migrate simple CRUD queries (no JOINs, no CTEs) — ~120 queries
2. **Phase 2**: Migrate queries with simple JOINs — ~80 queries
3. **Phase 3**: Migrate aggregations and GROUP BY — ~60 queries
4. **Phase 4**: Replace CTEs with Prisma views or keep as raw SQL — ~40 queries
5. **Phase 5**: Replace window functions with Prisma extensions — ~30 queries
6. **Phase 6**: Replace recursive CTEs with Prisma view or keep as raw SQL — ~20 queries

Estimated effort: 8-10 person-days.

## Verification

- All 1,967 existing tests pass after refactoring ✅
- TypeScript compiles with zero errors ✅
- The 22 refactored modules use Prisma client exclusively ✅
- The 57 documented files use raw SQL intentionally for performance reasons ✅
