# 05 — Database Mapping: Login + Dashboard + Organization

**Scope**: Every database table touched by this section, with columns, indexes, constraints, and lifecycle hooks.
**Source of truth**: `apps/backend/prisma/schema.prisma`, migrations `0002_organization.sql`, `0004_auth.sql`, `0005_auth_indexes.sql`.

---

## 1. Tables in Scope

### 1.1 Auth tables

| Table | Purpose | Soft delete | Tenant scoped |
|---|---|---|---|
| `users` | User accounts | Yes (`deleted_at`) | Yes (`tenant_id`) |
| `user_roles` | Role assignments | Yes | Yes |
| `refresh_tokens` | JWT refresh tokens (hashed) | No (purged) | Yes |
| `user_sessions` | Active sessions | No (TTL) | Yes |
| `devices` | Registered/trusted devices | Yes | Yes |
| `login_history` | Login audit | No (append-only) | Yes |
| `audit_logs` | Cross-module audit trail | No (append-only) | Yes |
| `event_outbox` | Outbox pattern events | No (purged) | Yes |

### 1.2 Organization tables (migration 0002)

`tenants`, `companies`, `business_units`, `divisions`, `regions`, `plants`, `warehouses`, `departments`, `cost_centers`, `financial_years`, `working_calendars`, `reference_timezones`, `reference_currencies`, `tax_configs`.

### 1.3 Reference data

`reference_timezones` and `reference_currencies` are seed tables populated at migration time; they back the `default_timezone` and `default_currency` fields on `companies` and `plants`.

---

## 2. Enterprise Contract Columns

Every business table carries the same nine-column contract:

| Column | Type | Purpose |
|---|---|---|
| `id` | UUID (PK) | Surrogate key |
| `tenant_id` | UUID (FK → tenants) | Multi-tenant isolation |
| `status` | Enum/text | Lifecycle state |
| `version` | Int | Optimistic concurrency |
| `created_at` | Timestamptz | Creation timestamp |
| `updated_at` | Timestamptz | Last mutation |
| `deleted_at` | Timestamptz (nullable) | Soft delete marker |
| `created_by` | UUID (FK → users) | Audit actor |
| `updated_by` | UUID (FK → users) | Audit actor |

The Prisma client extensions in `apps/backend/src/core/db/extensions/` enforce: tenant scoping (auto `WHERE tenant_id`), soft-delete filtering (auto `WHERE deleted_at IS NULL`), and audit column injection.

---

## 3. Companies Table — Full Column Map

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | PK |
| `tenant_id` | UUID | No | FK → tenants |
| `code` | Text | No | Unique per tenant |
| `name` | Text | No | Display name |
| `legal_name` | Text | No | Statutory name |
| `description` | Text | Yes | Free text |
| `parent_id` | UUID | Yes | FK → companies (self-ref) |
| `gstin` | Text | No | GST identification (IN) |
| `pan` | Text | No | PAN (IN) |
| `cin` | Text | No | Corporate identity number |
| `email` | Text | Yes | Contact email |
| `phone` | Text | Yes | Contact phone |
| `website` | Text | Yes | URL |
| `address_line_1` | Text | Yes | Address |
| `address_line_2` | Text | Yes | Address |
| `city` | Text | Yes | |
| `state` | Text | Yes | |
| `country` | Text | Yes | ISO code |
| `postal_code` | Text | Yes | |
| `default_timezone` | Text | No | FK → reference_timezones |
| `default_currency` | Text | No | FK → reference_currencies |
| `status` | Text | No | `DRAFT`/`CONFIGURED`/`ACTIVE`/`SUSPENDED`/`ARCHIVED` |
| `version` | Int | No | Optimistic lock |
| `created_at` | Timestamptz | No | |
| `updated_at` | Timestamptz | No | |
| `deleted_at` | Timestamptz | Yes | Soft delete |
| `created_by` | UUID | No | FK → users |
| `updated_by` | UUID | No | FK → users |

### 3.1 Indexes (companies)

- Primary key: `id`
- Unique: `(tenant_id, code)`
- Secondary: `(tenant_id, gstin)`, `(tenant_id, parent_id)`, `(tenant_id, status)`, `(tenant_id, deleted_at)`

---

## 4. Plants Table — Column Map

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | PK |
| `tenant_id` | UUID | No | FK → tenants |
| `region_id` | UUID | Yes | FK → regions |
| `code` | Text | No | Unique per tenant |
| `name` | Text | No | |
| `description` | Text | Yes | |
| `plant_type` | Text | No | e.g., `MANUFACTURING`, `DISTRIBUTION` |
| `address_line_1/2` | Text | Yes | |
| `city`, `state`, `country`, `postal_code` | Text | Yes | |
| `timezone` | Text | No | |
| `currency` | Text | No | |
| `email`, `phone` | Text | Yes | |
| `status` | Text | No | Same lifecycle enum |
| `version` | Int | No | |
| Audit columns | — | — | Per enterprise contract |

**Indexes**: PK on `id`; unique on `(tenant_id, code)`; secondary on `(tenant_id, region_id)`, `(tenant_id, status)`.

---

## 5. Warehouses Table — Column Map

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID | No | PK |
| `tenant_id` | UUID | No | FK → tenants |
| `plant_id` | UUID | No | FK → plants |
| `code` | Text | No | Unique per tenant |
| `name` | Text | No | |
| `description` | Text | Yes | |
| `warehouse_type` | Text | No | `RAW`, `FINISHED`, `FG_DISTRIBUTION`, etc. |
| `address_*` | Text | Yes | |
| `timezone` | Text | No | |
| `is_default` | Boolean | No | One default per plant |
| `total_area_sqft` | Numeric | Yes | Capacity planning |
| `status`, `version`, audit columns | — | — | Per enterprise contract |

**Indexes**: PK on `id`; unique on `(tenant_id, code)`; secondary on `(tenant_id, plant_id)`, `(tenant_id, status)`; partial unique on `(tenant_id, plant_id)` where `is_default = true` (one default per plant).

---

## 6. Hierarchy Resolution

The `hierarchyService.getTree()` builds the org tree by joining six tables in order:

```
tenants
  └── companies (where parent_id IS NULL)         ← ENTERPRISE
        └── companies (where parent_id = …)        ← COMPANY
              └── business_units                   ← BU
                    └── divisions                  ← DIVISION
                          └── regions              ← REGION
                                └── plants         ← BRANCH/PLANT
                                      └── warehouses
```

Each level is fetched with `WHERE tenant_id = $1 AND deleted_at IS NULL` and assembled in memory. The result matches the four-node-type icon map (`ENTERPRISE`, `COMPANY`, `BU`, `BRANCH`) used in the frontend `OrganizationModule`.

### 6.1 Hierarchy query plan

For a tenant with 2 enterprises, 2 companies, 8 plants, 4 warehouses:

- 6 single-table queries (no recursive CTE), each indexed by `(tenant_id, …)`.
- Total rows fetched: ~16.
- Assembled in memory in O(n) time.
- No N+1 risk because each level is fetched in bulk.

---

## 7. Audit Log Schema

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `timestamp` | Timestamptz | Default now() |
| `actor_type` | Text | `USER`, `SYSTEM`, `SERVICE` |
| `actor_id` | UUID | FK → users (nullable for SYSTEM) |
| `action` | Text | e.g., `company.create`, `auth.login` |
| `severity` | Text | `INFO`, `WARN`, `ERROR`, `CRITICAL` |
| `entity_type` | Text | e.g., `company`, `plant`, `user` |
| `entity_id` | UUID | The affected entity |
| `before` | Jsonb | State before mutation |
| `after` | Jsonb | State after mutation |
| `diff` | Jsonb | Field-level diff |
| `correlation_id` | UUID | Cross-service trace |

**Indexes**: PK on `id`; `(tenant_id, timestamp DESC)`; `(tenant_id, entity_type, entity_id)`; `(tenant_id, actor_id, timestamp DESC)`.

Within this section, the auth service writes 1 row per login attempt (success or failure) and the organisation service writes 1 row per CRUD mutation (9 call sites total).

---

## 8. Event Outbox Schema

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `event_name` | Text | e.g., `UserLoggedIn`, `CompanyCreated` |
| `payload` | Jsonb | Event body |
| `status` | Text | `PENDING`, `PUBLISHED`, `FAILED` |
| `published_at` | Timestamptz | Nullable |
| `retry_count` | Int | Default 0 |

The dispatcher polls `status = 'PENDING'` every few seconds, publishes to the in-process event bus, and marks rows `PUBLISHED`. Failed rows are retried up to `MAX_RETRIES` then moved to a dead-letter store.

Within this section, the following events fire:
- `UserRegistered` — on invite acceptance
- `UserLoggedIn` — on successful login
- `UserLoggedOut` — on logout
- `CompanyCreated` — on company create
- `PlantActivated` — on plant transition to ACTIVE

---

## 9. Migration Provenance

| Migration | Adds | Notes |
|---|---|---|
| `0002_organization.sql` | All 14 organisation tables + indexes | Foundation |
| `0004_auth.sql` | `users` table with Argon2id hash, account lock columns | Foundation |
| `0005_auth_indexes.sql` | Indexes on `users(tenant_id, email)`, `(tenant_id, status)`, `(tenant_id, locked_until)` | Performance |

The migrations are idempotent and run via PGlite in dev and via Prisma migrate in production.

---

## 10. Data Volume Estimates

For a 5-tenant, 100-user ERP instance after 12 months:

| Table | Estimated rows | Storage |
|---|---|---|
| `users` | 500 | < 1 MB |
| `companies` | 50 | < 1 MB |
| `plants` | 200 | < 1 MB |
| `warehouses` | 400 | < 1 MB |
| `audit_logs` | ~500K (1K/day) | ~150 MB |
| `event_outbox` (active) | < 1K (purged) | < 5 MB |
| `login_history` | ~150K (300/day) | ~50 MB |

`audit_logs` and `login_history` are the growth tables. A monthly partitioning strategy is recommended once the table exceeds 10M rows.

---

## 11. Frontend-to-Table Traceability

| Frontend element | Backing table(s) | Wired? |
|---|---|---|
| Login email field | `users.email` | Yes |
| Login password field | `users.password_hash` (Argon2id) | Yes (via service) |
| Demo mode button | (none — bypasses DB) | n/a |
| Dashboard "Products=12" | `products` (other section) | No (hardcoded) |
| Dashboard "Roles=15" | `roles` | No (hardcoded) |
| Dashboard "Branches=8" | `plants` (count where `status='ACTIVE'`) | No (hardcoded) |
| Dashboard "Compliance=6" | (no source table) | No (hardcoded) |
| Dashboard sprint list | (no source table — historical) | No (acceptable) |
| Org tree ENTERPRISE node | `tenants` + top-level `companies` | No (hardcoded) |
| Org tree COMPANY node | `companies` (where `parent_id IS NULL` or = enterprise) | No (hardcoded) |
| Org tree BU node | `business_units` | No (hardcoded) |
| Org tree BRANCH node | `plants` | No (hardcoded) |
| Org stat Enterprises=1 | count of top-level `companies` | No (hardcoded) |
| Org stat Companies=2 | count of `companies` | No (hardcoded) |
| Org stat Branches=8 | count of `plants` | No (hardcoded) |
| Org stat Warehouses=4 | count of `warehouses` | No (hardcoded) |
| "Add Entity" button | would write to `companies`/`plants`/`warehouses` | No (no handler) |

---

## 12. Database-Level Risks

| # | Risk | Mitigation |
|---|---|---|
| DB-1 | `audit_logs` unbounded growth | Add monthly partitioning + 2-year retention job |
| DB-2 | No FK enforcement on `created_by`/`updated_by` to soft-deleted users | Use `DEFERRABLE` FK or accept null on user delete |
| DB-3 | `event_outbox` retry storm on outage | Backoff + circuit breaker in dispatcher |
| DB-4 | Tenant_id leak via raw SQL in repository | All raw SQL audited; consider lint rule |
| DB-5 | No unique constraint on `users(tenant_id, email)` across soft-deleted | Add partial unique index where `deleted_at IS NULL` |

---

## 13. Conclusion

The database layer is the strongest part of this section: every table follows the enterprise contract, indexes are sensible, the audit trail is comprehensive, and the outbox pattern is in place. The disconnect is purely on the frontend: every visual element in Dashboard and Organization maps to a real table, but the wiring is absent. Connecting the org tree to `hierarchyService.getTree()` and the Dashboard counters to their respective `count` queries is a one-sprint job that requires zero schema changes.
