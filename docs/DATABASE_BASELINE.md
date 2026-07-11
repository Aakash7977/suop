# SUOP ERP — Database Baseline (v1.0)

**Document Version**: 1.0
**Frozen At**: 2026-07-11
**Phase**: 9B — Architecture Freeze
**Status**: 🔒 FROZEN

---

## 1. Database Overview

| Property | Value |
|---|---|
| **DBMS** | PostgreSQL 15+ |
| **Development** | PGlite (WASM PostgreSQL, file-based) |
| **Production** | Managed PostgreSQL (RDS/Cloud SQL/Supabase) |
| **ORM** | Prisma 6.11+ |
| **Schema** | `public` |
| **Multi-tenancy** | Shared database, shared schema, `tenant_id` column + RLS-ready |
| **Primary key** | UUID v7 (time-sortable) |
| **Total tables** | 60 (across 10 migrations) |
| **Total migrations** | 10 (0001–0010) |
| **Total indexes** | 40+ (see §4) |

---

## 2. Prisma Models

The Prisma schema (`apps/backend/prisma/schema.prisma`) currently defines **10 models** for the Phase 0 foundation. Business module tables exist as raw SQL migrations and will be added to the Prisma schema in future phases.

### 2.1 Phase 0 Foundation Models (10)

| # | Model | Table | Purpose |
|---|---|---|---|
| 1 | `AuditLog` | `audit_logs` | Immutable append-only audit trail |
| 2 | `EventOutbox` | `event_outbox` | Durable domain event delivery (outbox pattern) |
| 3 | `NotificationOutbox` | `notification_outbox` | Notification queue (4 channels) |
| 4 | `RefreshToken` | `refresh_tokens` | JWT refresh tokens (rotating, hash-indexed) |
| 5 | `IdempotencyKey` | `idempotency_keys` | Idempotent API request deduplication |
| 6 | `FeatureFlag` | `feature_flags` | Runtime feature toggle registry |
| 7 | `BackgroundJob` | `background_jobs` | DB-backed job queue with retries + DLQ |
| 8 | `FileUpload` | `file_uploads` | File metadata (S3/local storage abstraction) |
| 9 | `SupplierQuotation` | `supplier_quotations` | Phase 9 quotation header (in progress) |
| 10 | `SupplierQuotationLine` | `supplier_quotation_lines` | Phase 9 quotation line items |

### 2.2 Business Module Tables (50, via raw SQL)

These tables exist in migrations but are NOT yet in the Prisma schema. They are accessed via raw SQL queries through the PGlite/Prisma client.

#### Organization Module (14 tables)
| Table | Purpose |
|---|---|
| `tenants` | Multi-tenant root entities |
| `companies` | Legal entities within a tenant |
| `business_units` | Business units within a company |
| `divisions` | Divisions within a business unit |
| `departments` | Departments |
| `plants` | Manufacturing facilities |
| `warehouses` | Storage facilities |
| `regions` | Geographic regions |
| `cost_centers` | Cost centers for accounting |
| `working_calendars` | Working day calendars |
| `financial_years` | Fiscal year definitions |
| `tax_configs` | Tax configuration |
| `reference_currencies` | Supported currencies |
| `reference_timezones` | Supported timezones |

#### Authentication Module (8 tables)
| Table | Purpose |
|---|---|
| `users` | User accounts |
| `user_invitations` | Pending user invitations |
| `email_verification_tokens` | Email verification flow |
| `password_reset_tokens` | Password reset flow |
| `password_history` | Password history (rotation enforcement) |
| `login_history` | Login audit trail |
| `device_registry` | Trusted device registry |
| `refresh_tokens` (in Prisma) | JWT refresh tokens |

#### User Management Module (6 tables)
| Table | Purpose |
|---|---|
| `roles` | Role definitions |
| `permissions` | Permission catalog |
| `role_permissions` | Role ↔ permission mapping |
| `user_roles` | User ↔ role mapping |
| `user_assignments` | User entity assignments (plant, dept, etc.) |
| `user_preferences` | Per-user UI/notification preferences |

#### Product Master Module (6 tables)
| Table | Purpose |
|---|---|
| `products` | Product master (SKU, name, category) |
| `product_barcodes` | Product barcodes (multi-barcode support) |
| `product_categories` | Product category hierarchy |
| `product_brands` | Brand master |
| `product_uoms` | Unit of measure master |
| `uom_conversions` | UoM conversion factors |

#### Supplier Master Module (6 tables)
| Table | Purpose |
|---|---|
| `suppliers` | Supplier master |
| `supplier_categories` | Supplier classification |
| `supplier_contacts` | Supplier contact persons |
| `supplier_addresses` | Supplier addresses |
| `supplier_compliances` | Compliance certificates (GST, FSSAI, ISO) |
| `supplier_product_mappings` | Supplier ↔ product mapping |

#### Customer Master Module (4 tables)
| Table | Purpose |
|---|---|
| `customers` | Customer master |
| `customer_groups` | Customer groups (for pricing/discounts) |
| `customer_contacts` | Customer contact persons |
| `customer_addresses` | Customer addresses |

#### Procurement Module (3 tables)
| Table | Purpose |
|---|---|
| `purchase_requisitions` | PR header |
| `purchase_requisition_lines` | PR line items |
| `purchase_requisition_approvals` | PR approval trail |

#### RFQ Module (3 tables)
| Table | Purpose |
|---|---|
| `rfqs` | RFQ header |
| `rfq_lines` | RFQ line items |
| `rfq_suppliers` | RFQ ↔ supplier invitations |

#### Quotation Module (2 tables, Phase 9 in progress)
| Table | Purpose |
|---|---|
| `supplier_quotations` | Quotation header (in Prisma) |
| `supplier_quotation_lines` | Quotation line items (in Prisma) |

---

## 3. Table Relationships

### 3.1 Entity Relationship Diagram (Conceptual)

```
                          ┌─────────┐
                          │ tenants │
                          └────┬────┘
                               │ 1:N
                          ┌────▼────┐
                          │companies│
                          └────┬────┘
                               │ 1:N
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌────────────┐
        │  plants  │    │warehouses│    │departments │
        └──────────┘    └──────────┘    └────────────┘

  ┌─────────┐  1:N  ┌──────────┐  N:1  ┌─────────────────┐
  │  users  │──────▶│user_roles│◀──────│     roles       │
  └────┬────┘       └──────────┘       └────────┬────────┘
       │ 1:N                                     │ N:N
       ▼                                  ┌──────▼──────┐
  ┌──────────────┐                        │ permissions │
  │login_history │                        └─────────────┘
  └──────────────┘

  ┌──────────┐  N:N  ┌──────────────────────┐  N:1  ┌─────────────┐
  │ products │◀─────▶│supplier_product_maps │──────▶│  suppliers  │
  └────┬─────┘       └──────────────────────┘       └──────┬──────┘
       │ 1:N                                          1:N  │
       ▼                                                   ▼
  ┌──────────────┐                              ┌────────────────────┐
  │product_barcod│                              │supplier_compliances│
  └──────────────┘                              └────────────────────┘

  ┌────────────────────────┐  1:N  ┌──────────────────────────┐
  │purchase_requisitions   │──────▶│purchase_requisition_lines│
  └───────────┬────────────┘       └──────────────────────────┘
              │ 1:N
              ▼
  ┌─────────────────────────┐
  │purchase_requisition_    │
  │approvals                │
  └─────────────────────────┘

  ┌──────┐  1:N  ┌──────────────┐  N:1  ┌───────────┐
  │ rfqs │──────▶│  rfq_lines   │──────▶│ products  │
  └──┬───┘       └──────────────┘       └───────────┘
     │ 1:N
     ▼
  ┌──────────────┐  N:1  ┌───────────┐
  │ rfq_suppliers│──────▶│ suppliers │
  └──────────────┘       └───────────┘

  ┌──────────────────────┐  1:N  ┌─────────────────────────────┐
  │ supplier_quotations  │──────▶│ supplier_quotation_lines    │
  └──────────┬───────────┘       └─────────────────────────────┘
             │ N:1
             ▼
        ┌──────────┐
        │   rfqs   │
        └──────────┘
```

### 3.2 Key Foreign Key Relationships

| Child Table | FK Column | Parent Table | Relationship |
|---|---|---|---|
| `companies` | `tenant_id` | `tenants` | N:1 |
| `business_units` | `company_id` | `companies` | N:1 |
| `plants` | `company_id` | `companies` | N:1 |
| `warehouses` | `plant_id` | `plants` | N:1 |
| `departments` | `company_id` | `companies` | N:1 |
| `users` | `tenant_id` | `tenants` | N:1 |
| `user_roles` | `user_id` | `users` | N:1 |
| `user_roles` | `role_id` | `roles` | N:1 |
| `role_permissions` | `role_id` | `roles` | N:1 |
| `role_permissions` | `permission_id` | `permissions` | N:1 |
| `products` | `category_id` | `product_categories` | N:1 |
| `products` | `brand_id` | `product_brands` | N:1 |
| `products` | `uom_id` | `product_uoms` | N:1 |
| `suppliers` | `category_id` | `supplier_categories` | N:1 |
| `supplier_contacts` | `supplier_id` | `suppliers` | N:1 |
| `supplier_addresses` | `supplier_id` | `suppliers` | N:1 |
| `supplier_compliances` | `supplier_id` | `suppliers` | N:1 |
| `supplier_product_mappings` | `supplier_id` | `suppliers` | N:1 |
| `supplier_product_mappings` | `product_id` | `products` | N:1 |
| `customers` | `group_id` | `customer_groups` | N:1 |
| `customer_contacts` | `customer_id` | `customers` | N:1 |
| `customer_addresses` | `customer_id` | `customers` | N:1 |
| `purchase_requisitions` | `requested_by` | `users` | N:1 |
| `purchase_requisition_lines` | `requisition_id` | `purchase_requisitions` | N:1 |
| `purchase_requisition_lines` | `product_id` | `products` | N:1 |
| `purchase_requisition_approvals` | `requisition_id` | `purchase_requisitions` | N:1 |
| `purchase_requisition_approvals` | `approved_by` | `users` | N:1 |
| `rfqs` | `requisition_id` | `purchase_requisitions` | N:1 (optional) |
| `rfq_lines` | `rfq_id` | `rfqs` | N:1 |
| `rfq_lines` | `product_id` | `products` | N:1 |
| `rfq_suppliers` | `rfq_id` | `rfqs` | N:1 |
| `rfq_suppliers` | `supplier_id` | `suppliers` | N:1 |
| `supplier_quotations` | `rfq_id` | `rfqs` | N:1 |
| `supplier_quotations` | `supplier_id` | `suppliers` | N:1 |
| `supplier_quotation_lines` | `quotation_id` | `supplier_quotations` | N:1 |
| `supplier_quotation_lines` | `rfq_line_id` | `rfq_lines` | N:1 |
| `refresh_tokens` | `user_id` | `users` | N:1 |
| `audit_logs` | `tenant_id` | `tenants` | N:1 |
| `audit_logs` | `actor_id` | `users` | N:1 (optional) |

---

## 4. Index Strategy

### 4.1 Index Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Standard index | `idx_<table>_<columns>` | `idx_audit_tenant_entity` |
| Unique index | `uq_<table>_<columns>` | `uq_idempotency_tenant_key` |
| Primary key | `<table>_pkey` | `audit_logs_pkey` |
| Foreign key | `fk_<table>_<column>` | `fk_users_tenant_id` |

### 4.2 Index Categories

#### Tenant Scoping Indexes (multi-tenant isolation)
Every business table has a composite index on `(tenant_id, <filterable_column>)` to ensure efficient tenant-scoped queries.

| Index | Table | Columns |
|---|---|---|
| `idx_audit_tenant_entity` | `audit_logs` | `(tenant_id, entity_type, entity_id)` |
| `idx_audit_tenant_action` | `audit_logs` | `(tenant_id, action)` |
| `idx_audit_tenant_severity` | `audit_logs` | `(tenant_id, severity)` |
| `idx_outbox_tenant` | `event_outbox` | `(tenant_id)` |
| `idx_notif_tenant_user` | `notification_outbox` | `(tenant_id, user_id)` |
| `idx_jobs_tenant_name` | `background_jobs` | `(tenant_id, job_name)` |
| `idx_files_tenant_category` | `file_uploads` | `(tenant_id, category)` |
| `idx_files_tenant_entity` | `file_uploads` | `(tenant_id, linked_entity_type, linked_entity_id)` |

#### Status / Workflow Indexes (state machine queries)
| Index | Table | Columns |
|---|---|---|
| `idx_jobs_status_scheduled` | `background_jobs` | `(status, scheduled_for)` |
| `idx_outbox_status_created` | `event_outbox` | `(status, created_at)` |
| `idx_notif_status_created` | `notification_outbox` | `(status, created_at)` |

#### Lookup Indexes (foreign key searches)
| Index | Table | Columns |
|---|---|---|
| `idx_refresh_user` | `refresh_tokens` | `(user_id)` |
| `idx_refresh_expires` | `refresh_tokens` | `(expires_at)` |
| `idx_idempotency_expires` | `idempotency_keys` | `(expires_at)` |
| `idx_audit_correlation` | `audit_logs` | `(correlation_id)` |
| `idx_audit_timestamp` | `audit_logs` | `(timestamp)` |

#### Unique Indexes (business keys)
| Index | Table | Columns |
|---|---|---|
| `refresh_tokens_token_hash_key` | `refresh_tokens` | `(token_hash)` |
| `uq_idempotency_tenant_key` | `idempotency_keys` | `(tenant_id, key)` |
| `users_email_key` | `users` | `(email)` — unique per tenant |
| `users_username_key` | `users` | `(username)` — unique per tenant |
| `suppliers_gstin_key` | `suppliers` | `(gstin)` — unique per tenant |
| `customers_gstin_key` | `customers` | `(gstin)` — unique per tenant |
| `products_sku_key` | `products` | `(sku)` — unique per tenant |

### 4.3 Index Strategy Principles

1. **Tenant-first**: All composite indexes lead with `tenant_id` for RLS-friendly queries.
2. **Status-second**: Workflow state queries are indexed for dashboard performance.
3. **Soft-delete aware**: Queries filter `WHERE deleted_at IS NULL`; partial indexes recommended for production.
4. **No over-indexing**: Each index has a documented query pattern. Avoid speculative indexes.
5. **UUID v7 primary keys**: Time-sortable, no separate creation-timestamp index needed for ordering by ID.

---

## 5. Migration History

### 5.1 Migration Files

| # | File | Phase | Tables | Lines | Description |
|---|---|---|---|---|---|
| 1 | `0001_init.sql` | Phase 0 | 10 | ~600 | Foundation tables (audit, outbox, refresh tokens, etc.) |
| 2 | `0002_organization.sql` | Phase 1 | 14 | ~500 | Organization hierarchy (tenants, companies, plants, warehouses) |
| 3 | `0003_soft_delete.sql` | Phase 0+ | 0 | ~200 | Add `deleted_at`, `deleted_by` columns to all tables |
| 4 | `0004_authentication.sql` | Phase 2 | 8 | ~400 | Auth tables (users, invitations, password reset, login history) |
| 5 | `0005_user_management.sql` | Phase 3 | 6 | ~350 | RBAC tables (roles, permissions, user_roles, assignments) |
| 6 | `0006_product_master.sql` | Phase 4 | 6 | ~450 | Product master (products, categories, brands, UoMs, barcodes) |
| 7 | `0007_supplier_master.sql` | Phase 5 | 6 | ~500 | Supplier master (suppliers, contacts, addresses, compliances) |
| 8 | `0008_customer_master.sql` | Phase 6 | 4 | ~400 | Customer master (customers, groups, contacts, addresses) |
| 9 | `0009_procurement.sql` | Phase 7 | 3 | ~350 | Purchase requisitions (header, lines, approvals) |
| 10 | `0010_rfq.sql` | Phase 8 | 3 | ~928 | RFQ management (rfqs, lines, suppliers) |
| **Total** | | | **60** | **~4,678** | |

### 5.2 Migration Principles

1. **Sequential numbering**: `NNNN_description.sql` (zero-padded, never renumbered)
2. **Forward-only**: No down migrations (rollback = new forward migration)
3. **Idempotent where possible**: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
4. **Reserved columns**: Every table includes `id`, `tenant_id`, `version`, `created_at/by`, `updated_at/by`, `deleted_at/by`
5. **No data migrations in schema migrations**: Schema changes only; data backfill is a separate job
6. **Foreign keys explicit**: All FK relationships declared with `ON DELETE` behavior

### 5.3 Migration Execution

| Environment | Method |
|---|---|
| Development | Manual SQL execution against PGlite |
| Test (CI) | Vitest setup handles table creation |
| Staging | `bunx prisma migrate deploy` (applies pending migrations) |
| Production | `bunx prisma migrate deploy` (manual approval required) |

### 5.4 Future Migrations (Planned)

| # | Phase | Description |
|---|---|---|
| 0011 | Phase 9 | Quotation module tables (if not already in 0001) |
| 0012 | Phase 10 | Purchase Order module |
| 0013 | Phase 11 | Goods Receipt Note module |
| 0014 | Phase 12 | Inventory module |
| 0015+ | Future | WMS, MES, QMS, Finance modules |

---

## 6. Reserved Columns (Universal Schema)

Every table in the database includes these reserved columns:

| Column | Type | Default | Purpose |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | Primary key (UUID v7 recommended) |
| `tenant_id` | UUID | NOT NULL | Multi-tenant isolation |
| `version` | INT | 1 | Optimistic concurrency (incremented on update) |
| `status` | TEXT | `'DRAFT'` | Workflow state (state machine) |
| `created_at` | TIMESTAMP | `CURRENT_TIMESTAMP` | Creation timestamp |
| `created_by` | UUID | NULL | Creator user ID |
| `updated_at` | TIMESTAMP | `CURRENT_TIMESTAMP` | Last update timestamp |
| `updated_by` | UUID | NULL | Updater user ID |
| `deleted_at` | TIMESTAMP | NULL | Soft delete marker (NULL = active) |
| `deleted_by` | UUID | NULL | Deleter user ID |

These are enforced by Prisma extensions (`soft-delete`, `tenant`, `audit`) in `core/db/extensions/`.

---

## 7. Multi-Tenancy Strategy

### 7.1 Model: Shared Database, Shared Schema

All tenants share the same database and schema. Tenant isolation is achieved via:

1. **`tenant_id` column** on every business table
2. **Prisma tenant extension** (`core/db/extensions/tenant.ts`) automatically injects `WHERE tenant_id = ?` on all queries
3. **PostgreSQL Row-Level Security (RLS)** — ready to enable in production (PGlite does not support RLS)

### 7.2 Tenant Context

The tenant ID is extracted from the JWT token during authentication and stored in the request context (`core/context/`). The Prisma extension reads it from the context for every query.

### 7.3 Cross-Tenant Access

Cross-tenant queries require the `SYSTEM_TENANT_CROSS` permission (reserved for system administrators and auditors).

---

## 8. Backup Strategy

| Environment | Method | Frequency | Retention |
|---|---|---|---|
| Development | PGlite file copy | Manual | Until next session |
| Staging | `pg_dump` | Daily | 7 days |
| Production | Managed snapshot | Hourly + Daily | 35 days (PITR) |

---

*This document is FROZEN as of Phase 9B. Schema changes require a new migration + ADR.*
