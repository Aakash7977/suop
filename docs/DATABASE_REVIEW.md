# Database Review — SUOP ERP v1.0 RC1

**Audit Date**: 2026-07-12
**Database Score**: **7.0 / 10** (🟢 Good with Gaps)

---

## 1. Migration Analysis

| Migration | Tables | Lines | Phase | Issues |
|---|---|---|---|---|
| 0001_init.sql | 10 | 317 | Phase 0 | ✅ Clean |
| 0002_organization.sql | 14 | 636 | Phase 1 | ✅ Clean |
| 0003_soft_delete.sql | 0 | 14 | Phase 0+ | ⚠️ Only adds columns, no tables |
| 0004_authentication.sql | 8 | 604 | Phase 2 | ✅ Clean |
| 0005_user_management.sql | 6 | 632 | Phase 3 | ✅ Clean |
| 0006_product_master.sql | 6 | 783 | Phase 4 | ✅ Clean |
| 0007_supplier_master.sql | 6 | 871 | Phase 5 | ✅ Clean |
| 0008_customer_master.sql | 4 | 862 | Phase 6 | ✅ Clean |
| 0009_procurement.sql | 3 | 892 | Phase 7 | ✅ Clean |
| 0010_rfq.sql | 3 | 928 | Phase 8 | ✅ Clean |
| 0011_purchase_orders.sql | 12 | 442 | Phase 10 | ✅ Clean |
| 0012_warehouse_inventory.sql | 30 | 899 | Phase 11-14 | ✅ Clean |
| 0013_manufacturing.sql | 42 | 589 | Phase 15-20 | ✅ Clean |
| 0014_quality_management.sql | 32 | 559 | Phase 21-26 | ✅ Clean |
| 0015_sales_distribution.sql | 35 | 598 | Phase 27-32 | ✅ Clean |
| 0016_finance.sql | 42 | 686 | Phase 33-38 | ✅ Clean |
| 0017_crm.sql | 40 | 658 | Phase 39-44 | ✅ Clean |
| 0018_hrms.sql | 46 | 723 | Phase 45-50 | ✅ Clean |
| 0019_bi_analytics.sql | 28 | 463 | Phase 51-55 | ✅ Clean |
| **Total** | **363** | **11,976** | | |

---

## 2. Schema Compliance

### 2.1 Reserved Columns ✅
- **145 tables** have `deleted_at` column (soft delete)
- **89 tables** have `version` column (optimistic locking)
- **All business tables** have `tenant_id` (multi-tenancy)
- **All business tables** have `created_at`, `updated_at`
- **Compliance**: 90% (some BI fact tables and log tables intentionally omit reserved columns)

### 2.2 Indexes
- **1,082 CREATE INDEX statements** across all migrations
- Tenant-scoped composite indexes on all business tables
- Status indexes on workflow tables
- Date indexes on time-series tables
- **Assessment**: ✅ Comprehensive indexing strategy

### 2.3 Unique Constraints
- **419 UNIQUE constraints** across all tables
- Tenant + business key uniqueness enforced (e.g., `uq_po_tenant_number`)
- **Assessment**: ✅ Good

### 2.4 Foreign Keys
- **336 REFERENCES** declarations
- FK constraints present in early migrations (0001-0010)
- ⚠️ **Later migrations (0011-0019) use UUID columns without explicit FK constraints** — relying on application-level validation
- **Assessment**: ⚠️ 50% of tables lack explicit FK constraints

---

## 3. Critical Database Issues

### D-001: 341 Tables Without Prisma Models (Critical)
- **Impact**: No type-safe database access for 94% of tables
- **Tables with Prisma models**: 22 (Phase 0 foundation + Phase 9 quotation + Phase 10 PO)
- **Tables without**: 341 (all business modules use raw SQL via PGlite)
- **Risk**: SQL injection if parameterization is missed, no compile-time column validation, no relation traversal
- **Fix**: Add all tables to `schema.prisma`, run `prisma generate`, replace raw SQL

### D-002: Missing FK Constraints in Later Migrations (High)
- **Migrations affected**: 0011-0019 (287 tables)
- **Reason**: Tables use `UUID` type for references but don't declare `FOREIGN KEY ... REFERENCES`
- **Risk**: Orphaned records, data integrity issues, no cascade rules
- **Fix**: Add FK constraints in a new migration

### D-003: No Migration Rollback Scripts (Medium)
- All migrations are forward-only (`CREATE TABLE IF NOT EXISTS`)
- No `DROP TABLE` or reversal scripts
- **Risk**: Cannot roll back a bad migration in production
- **Fix**: Either write down-migrations or adopt forward-fix policy

### D-004: No Query Performance Testing (Medium)
- Indexes exist but have never been tested under load
- No `EXPLAIN ANALYZE` results for critical queries
- **Risk**: Slow queries in production
- **Fix**: Load test with realistic data volumes

### D-005: PGlite Not Suitable for Production (High)
- Development uses PGlite (WASM PostgreSQL)
- PGlite lacks: RLS, full-text search, some extensions, connection pooling
- **Risk**: Dev/prod parity issues
- **Fix**: Use real PostgreSQL in staging and production

---

## 4. Index Strategy Assessment

| Index Type | Count | Assessment |
|---|---|---|
| Tenant + status composite | ~200 | ✅ Excellent for multi-tenant queries |
| Tenant + entity_id | ~150 | ✅ Good for entity lookups |
| Date indexes | ~80 | ✅ Good for time-range queries |
| Unique business key | 419 | ✅ Prevents duplicates |
| Full-text search | 0 | ⚠️ No FTS indexes |
| Partial indexes | 0 | ⚠️ No partial indexes for soft-delete filtering |
| GIN indexes (JSONB) | 0 | ⚠️ No GIN for JSONB columns |

---

## 5. Recommendations

1. Add all 363 tables to Prisma schema (Critical)
2. Add FK constraints for all cross-table references (High)
3. Add partial indexes for `WHERE deleted_at IS NULL` (Medium)
4. Add GIN indexes for JSONB columns (Low)
5. Test with real PostgreSQL, not just PGlite (High)
6. Add query timeout configuration (Medium)
