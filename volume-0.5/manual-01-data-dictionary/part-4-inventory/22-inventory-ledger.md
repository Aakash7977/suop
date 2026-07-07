# Manual 1 · Part 4 · Entity 22 — Inventory Ledger

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 4 — Inventory Domain |
| Entity | Inventory Ledger (022) |
| Version | 1.0.0 |
| Status | ACTIVE — **IMMUTABLE** (per Ch 10 §10.5, Ch 26 §26.5) |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §2.4, Ch 4 §4.4, Ch 10 §10.2/§10.5/§10.6, Ch 17 §17.2, Ch 18 §18.5, Ch 26 §26.5 |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `InventoryLedger` is the **single source of truth for all inventory movements** in SUOP. Per Volume 0 Chapter 10 §10.5:

> *"Inventory is NEVER updated directly. Instead: Goods Receipt → Inventory Ledger → Current Stock View. The ledger is the source of truth. Current stock is a calculated or materialized view."*

Per Volume 0 Chapter 26 §26.5 (Ledger Pattern — IMMUTABLE pattern per Q146):

> *"Every inventory-changing transaction → Creates immutable ledger entry → Updates current balance → Publishes event → Updates analytics. Never update balances directly."*

### Why the Ledger Exists

The Inventory Ledger solves the fundamental enterprise problem: **how do you trust your inventory data?**

Without a ledger, inventory is a single number that gets overwritten. When something goes wrong (negative stock, missing quantity, customer complaint), there's no way to reconstruct what happened. You can't audit. You can't trace. You can't comply with FSSAI/HACCP.

With a ledger:
- Every movement is a **permanent record** (immutable, append-only)
- Current stock is **derived** (sum of ledger entries) — never directly edited
- Corrections create **reversal entries** (never in-place edits, per Ch 10 §10.2, Ch 18 §18.14)
- Full audit trail for any point in time
- 5-minute recall KPI (Ch 1 §2.8) traverses ledger entries
- 30-second investigation (Ch 18 enhancement) queries ledger

### Five Immutable Principles (per Part 4)

1. **Ledger is the source of truth** — current_stock_summary is a derived view
2. **Stock is never updated directly** — only via ledger entries
3. **Every movement is auditable** — every entry has actor, timestamp, reason
4. **Every movement belongs to a batch** — batch-level traceability
5. **Every movement publishes an enterprise event** — drives downstream modules (per Ch 3 §3.7, Ch 9 §9.8)

### Architectural Commitments (Locked, IMMUTABLE per Ch 26 Q146)

| Commitment | Enforcement |
|---|---|
| **Append-only** — INSERT only, no UPDATE, no DELETE | DB-level: REVOKE UPDATE, DELETE from all roles except `audit_maintenance` (used only for archival) |
| **Reversal pattern** — corrections via compensating entries | Service-layer enforces; ledger write API rejects UPDATE |
| **Hash-chained** — each entry's hash includes previous entry's hash | Tamper-evident (per Ch 18 Q106); daily verification job |
| **Partitioned monthly** by `transaction_time` | Per Ch 10 §10.11, Ch 10 Q3 |
| **Outbox pattern** — ledger write + event emission in same DB transaction | Per Ch 3 §3.7; no "DB updated but event lost" |

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Operations Head |
| Data Owner | L2 — Inventory Head |
| Technical Owner | Backend Lead — Inventory Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `inventory_ledger` |
| Prisma Model | `InventoryLedger` |
| File Location | `prisma/schema/transactional/inventory/inventory_ledger.prisma` |
| Partitioning | **Monthly by `transaction_time`** (per Ch 10 §10.11, Q3) — high volume table |
| Immutability | **ABSOLUTE** — DB triggers + REVOKE UPDATE/DELETE (per Ch 18 §18.14) |
| Retention | Permanent (per Ch 10 §10.13, Ch 18 §18.12) — never deleted, only archived to cold storage |
| Pattern | **Ledger Pattern** (per Ch 26 §26.5) — IMMUTABLE tier (per Q146) |

### PostgreSQL DDL (Critical Implementation)

```sql
-- Partitioned table
CREATE TABLE inventory_ledger (
  -- Primary key (UUID v7 for time-ordered locality)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  
  -- Sequential number (internal only, never exposed — per Ch 10 Q2)
  seq BIGSERIAL,
  
  -- Transaction identification
  transaction_number VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(30) NOT NULL,
  movement_type VARCHAR(30) NOT NULL,
  
  -- Source document
  source_document_type VARCHAR(30),
  source_document_id UUID,
  source_document_number VARCHAR(50),
  
  -- Reversal tracking (per Ch 10 §10.2)
  parent_transaction_id UUID,  -- for reversal entries, links to original
  is_reversed BOOLEAN DEFAULT false,
  reversal_reason TEXT,
  
  -- Scope
  company_id UUID NOT NULL,
  brand_id UUID,
  facility_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  location_id UUID NOT NULL,
  
  -- Entity references
  product_id UUID NOT NULL,
  batch_id UUID,
  lot_id UUID,  -- for procured lots (per Ch 4 Commitment #11)
  variant_id UUID,
  
  -- Quantities (signed — positive for in, negative for out)
  quantity_delta NUMERIC(18,4) NOT NULL,  -- signed (+ for in, - for out)
  quantity_before NUMERIC(18,4) NOT NULL,  -- balance before this entry
  quantity_after NUMERIC(18,4) NOT NULL,   -- balance after this entry
  uom_id UUID NOT NULL,
  
  -- Cost tracking (for valuation per Ch 15 §15.4)
  unit_cost NUMERIC(18,4),
  total_cost NUMERIC(18,4),
  currency_code CHAR(3) DEFAULT 'INR',
  
  -- Reason
  reason_code VARCHAR(50),
  reason_text TEXT,
  
  -- Actor (per Ch 6 §6.14 audit fields)
  actor_user_id UUID NOT NULL,
  device_id VARCHAR(100),
  ip_address VARCHAR(45),
  session_id UUID,
  
  -- Timestamps
  transaction_time TIMESTAMPTZ NOT NULL,  -- when the movement occurred
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- when ledger entry was written
  
  -- Hash chain (per Ch 18 Q106)
  previous_hash VARCHAR(64),
  current_hash VARCHAR(64) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Standard audit fields (but NO updated_at, NO deleted_at — immutable)
  created_by UUID NOT NULL
  
) PARTITION BY RANGE (transaction_time);

-- Create monthly partitions (pg_partman manages automatically)
-- Example: inventory_ledger_2026_07 for July 2026

-- CRITICAL: Revoke UPDATE and DELETE from ALL roles
REVOKE UPDATE, DELETE ON inventory_ledger FROM PUBLIC;
REVOKE UPDATE, DELETE ON ALL PARTITIONS OF inventory_ledger FROM PUBLIC;
-- Only audit_maintenance role can DETACH partitions for archival (still cannot UPDATE/DELETE rows)

-- DB trigger to prevent UPDATE/DELETE even by superusers (defense in depth)
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Inventory Ledger is IMMUTABLE. UPDATE/DELETE not allowed. Use reversal pattern.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_inventory_ledger
  BEFORE UPDATE ON inventory_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER no_delete_inventory_ledger
  BEFORE DELETE ON inventory_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
```

---

## 4. Field Dictionary

### 4.1 Identification Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key (time-ordered for insert locality per Ch 10 Q2) | — | — |
| `seq` | BIGSERIAL | Yes | auto | Internal only, never exposed in API | Sequential number for internal ordering + sync cursors (per Ch 10 Q2) | — | — |
| `transaction_number` | VARCHAR(50) | Yes | — | Unique per company, generated by Number Series `INV-` | Human-readable transaction number (e.g., `INV-2026-000001`) | Public | — |
| `transaction_type` | ENUM | Yes | — | RECEIPT, ISSUE, TRANSFER, ADJUSTMENT, PRODUCTION, QC, RETURN, SCRAP, REVERSAL | High-level transaction category | Internal | — |
| `movement_type` | ENUM | Yes | — | RECEIPT, ISSUE, TRANSFER_IN, TRANSFER_OUT, PRODUCTION_IN, PRODUCTION_OUT, RETURN, ADJUSTMENT, SCRAP, QC_HOLD, QC_RELEASE | Specific movement type (per Part 4) | Internal | Movement analytics |

### 4.2 Source Document

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `source_document_type` | VARCHAR(30) | No | NULL | — | Type of source document (PURCHASE_ORDER, GOODS_RECEIPT_NOTE, PRODUCTION_ORDER, STOCK_TRANSFER, SALES_ORDER, etc.) | Internal |
| `source_document_id` | UUID | No | NULL | FK to source document (polymorphic) | Source document ID | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number (e.g., `PO-2026-001`, `GRN-2026-001`) | Internal |

### 4.3 Reversal Tracking (per Ch 10 §10.2, Ch 18 §18.14)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `parent_transaction_id` | UUID | No | NULL | FK self-ref | For reversal entries — links to original transaction being reversed | Internal |
| `is_reversed` | BOOLEAN | Yes | `false` | — | If true, this entry has been reversed by a compensating entry | Internal |
| `reversal_reason` | TEXT | No | NULL | Required if this is a reversal entry (`parent_transaction_id` set) | Reason for reversal (mandatory per Ch 4 §4.12) | Internal |
| `reversed_by_entry_id` | UUID | No | NULL | FK self-ref | The reversal entry that reversed this one | Internal |

### 4.4 Scope Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company | Internal |
| `brand_id` | UUID | No | NULL | FK to `brands.id` | Brand (if product is brand-scoped) | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` | Facility where movement occurred | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE type) | Warehouse where movement occurred | Internal |
| `location_id` | UUID | Yes | — | FK to `locations.id` (BIN level) | Specific bin where movement occurred | Internal |

### 4.5 Entity References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `product_id` | UUID | Yes | — | FK to `products.id` | Product (mandatory) | Internal |
| `batch_id` | UUID | Conditional | NULL | FK to `batches.id`; required if `product.batch_required = true` | Batch (per Part 4 Principle 4) | Internal |
| `lot_id` | UUID | No | NULL | FK to `lots.id` | Supplier lot (for procured materials, per Ch 4 Commitment #11) | Internal |
| `variant_id` | UUID | No | NULL | FK to `product_variants.id` | Variant (if applicable) | Internal |

### 4.6 Quantities (Critical — the heart of the ledger)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `quantity_delta` | DECIMAL(18,4) | Yes | — | ≠ 0; sign convention: + for IN, - for OUT | Signed quantity change (the actual movement) | Internal | Demand AI |
| `quantity_before` | DECIMAL(18,4) | Yes | — | — | Balance at this location+product+batch BEFORE this entry | Internal | — |
| `quantity_after` | DECIMAL(18,4) | Yes | — | Must equal `quantity_before + quantity_delta` | Balance at this location+product+batch AFTER this entry | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id`; must equal `product.base_uom_id` | UOM for all quantity fields (always base UOM) | Internal | — |

### 4.7 Cost Tracking (for Valuation per Ch 15 §15.4)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Cost per unit at time of movement | Confidential |
| `total_cost` | DECIMAL(18,4) | No | NULL | Generated: `ABS(quantity_delta) * unit_cost` | Total cost impact | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Cost currency | Internal |

### 4.8 Reason (per Ch 4 §4.12)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `reason_code` | VARCHAR(50) | No | NULL | FK to `stock_reason_codes.code` | Structured reason code (per Part 4) | Internal |
| `reason_text` | TEXT | No | NULL | Required for ADJUSTMENT, SCRAP, REVERSAL | Free-text reason (mandatory for adjustments per Ch 4 §4.12) | Internal |

### 4.9 Actor (per Ch 6 §6.14)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `actor_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Who performed the movement | Internal |
| `device_id` | VARCHAR(100) | No | NULL | — | Device used (per Ch 6 §6.17) | Internal |
| `ip_address` | VARCHAR(45) | No | NULL | IPv4 or IPv6 | Source IP | Confidential |
| `session_id` | UUID | No | NULL | — | User session (for session reconstruction) | Internal |

### 4.10 Timestamps

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `transaction_time` | TIMESTAMPTZ | Yes | — | — | When the movement **occurred** (may differ from `created_at` for offline sync per Ch 11 Q3) | Internal |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When ledger entry was **written** to DB | Internal |

### 4.11 Hash Chain (per Ch 18 Q106 — Tamper-Evidence)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `previous_hash` | VARCHAR(64) | No | NULL | SHA-256 of previous entry's `current_hash` | Hash of previous ledger entry (NULL for first entry per partition) | Confidential |
| `current_hash` | VARCHAR(64) | Yes | — | SHA-256 of all fields + `previous_hash` | Hash of this entry (tamper-evident chain) | Confidential |

### 4.12 Metadata

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `metadata` | JSONB | No | `'{}'::JSONB` | — | Extensible metadata (e.g., temperature at time of movement, scanner used, GPS) | Internal |

### 4.13 Audit Field (Limited — Immutable)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator (immutable — no `updated_by`, `updated_at`, `deleted_at`) | Internal |

**Note**: Per immutability, there is **NO** `updated_at`, `updated_by`, `deleted_at`, or `version` field. These do not exist on the ledger. The ledger is append-only.

---

## 5. Relationships

### 5.1 Inbound Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| InventoryLedger → Company | N : 1 | inbound | `company_id` → `companies.id` | RESTRICT | Cannot delete company with ledger entries |
| InventoryLedger → Brand | N : 1 | inbound | `brand_id` → `brands.id` | SET NULL | Brand reference cleared |
| InventoryLedger → Facility | N : 1 | inbound | `facility_id` → `facilities.id` | RESTRICT | Cannot delete facility with ledger entries |
| InventoryLedger → Facility (warehouse) | N : 1 | inbound | `warehouse_id` → `facilities.id` | RESTRICT | Cannot delete warehouse with ledger entries |
| InventoryLedger → Location (bin) | N : 1 | inbound | `location_id` → `locations.id` | RESTRICT | Cannot delete location with ledger entries |
| InventoryLedger → Product | N : 1 | inbound | `product_id` → `products.id` | RESTRICT | Cannot delete product with ledger entries |
| InventoryLedger → Batch | N : 1 | inbound | `batch_id` → `batches.id` | RESTRICT | Cannot delete batch with ledger entries (per Entity 023) |
| InventoryLedger → Lot | N : 1 | inbound | `lot_id` → `lots.id` | SET NULL | Lot reference cleared |
| InventoryLedger → ProductVariant | N : 1 | inbound | `variant_id` → `product_variants.id` | SET NULL | Variant reference cleared |
| InventoryLedger → UOM | N : 1 | inbound | `uom_id` → `uoms.id` | RESTRICT | Cannot delete UOM used in ledger |
| InventoryLedger → UserAccount (actor) | N : 1 | inbound | `actor_user_id` → `user_accounts.id` | RESTRICT | Cannot delete user who performed movements |
| InventoryLedger → UserAccount (creator) | N : 1 | inbound | `created_by` → `user_accounts.id` | RESTRICT | — |
| InventoryLedger → InventoryLedger (parent) | N : 1 | self-ref | `parent_transaction_id` | SET NULL | Reversal link cleared (rare — reversals are themselves immutable) |
| InventoryLedger → InventoryLedger (reversed_by) | N : 1 | self-ref | `reversed_by_entry_id` | SET NULL | — |
| InventoryLedger → StockReasonCode | N : 1 | inbound | `reason_code` → `stock_reason_codes.code` | SET NULL | Reason code reference cleared |

### 5.2 Outbound Relationships

| Relationship | Cardinality | Direction | FK Field | Notes |
|---|---|---|---|---|
| InventoryLedger → InventoryMaster (summary) | N : 1 | derived | Computed: ledger entries aggregate to `inventory_master` | The summary table is **derived from** the ledger, not linked via FK |
| InventoryLedger → DomainEventOutbox | 1 : 1 | outbound | (via outbox pattern) | Each ledger entry publishes a domain event in same transaction (per Ch 3 §3.7) |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_inventory_ledger` | PRIMARY KEY | `id` | Default PK (UUID v7 — time-ordered) |
| `uq_ledger_transaction_number` | UNIQUE | `company_id, transaction_number` | Transaction number uniqueness per company |
| `uq_ledger_seq` | UNIQUE | `seq` | Internal sequential ordering |
| `idx_ledger_product_batch_location` | B-TREE | `product_id, batch_id, location_id, transaction_time DESC` | **Critical**: Compute current balance for a product+batch+location (fast lookup) |
| `idx_ledger_product_warehouse` | B-TREE | `product_id, warehouse_id, transaction_time DESC` | Find all movements of a product in a warehouse |
| `idx_ledger_batch` | B-TREE | `batch_id, transaction_time DESC` | Batch genealogy / recall queries (per Ch 18 §18.5) |
| `idx_ledger_transaction_time` | B-TREE | `transaction_time DESC` | Time-range queries (partition pruning) |
| `idx_ledger_movement_type` | B-TREE | `movement_type, transaction_time DESC` | Filter by movement type |
| `idx_ledger_actor` | B-TREE | `actor_user_id, transaction_time DESC` | User activity audit |
| `idx_ledger_source_doc` | B-TREE | `source_document_type, source_document_id` | Find ledger entries for a document |
| `idx_ledger_reversal` | PARTIAL | `parent_transaction_id WHERE parent_transaction_id IS NOT NULL` | Find reversal entries |
| `idx_ledger_reversed` | PARTIAL | `is_reversed WHERE is_reversed = true` | Find reversed entries |
| `idx_ledger_hash_chain` | B-TREE | `previous_hash` (for hash chain verification) | Hash chain integrity check |
| `idx_ledger_seq_sync` | B-TREE | `seq` (for offline sync cursors per Ch 11 Q3) | Mobile sync queries |

### Partitioning

```sql
-- Monthly partitions (pg_partman manages automatically)
CREATE TABLE inventory_ledger_2026_07 PARTITION OF inventory_ledger
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE inventory_ledger_2026_08 PARTITION OF inventory_ledger
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- pg_partman config: pre-create 3 months ahead, archive partitions older than 2 years to cold storage
```

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `transaction_number` must be unique per company | DB | Unique constraint |
| 2 | `quantity_delta` ≠ 0 (zero-quantity entries not allowed) | DB | CHECK constraint |
| 3 | `quantity_after` must equal `quantity_before + quantity_delta` | DB | CHECK constraint |
| 4 | `uom_id` must equal `product.base_uom_id` | App | Service-layer validation |
| 5 | `batch_id` required if `product.batch_required = true` | App | Service-layer validation |
| 6 | `lot_id` should be set for procured materials (best practice) | App | Service-layer recommendation |
| 7 | `reason_text` required for ADJUSTMENT, SCRAP, REVERSAL movement types | DB | CHECK constraint |
| 8 | `reversal_reason` required if `parent_transaction_id` is set | DB | CHECK constraint |
| 9 | `parent_transaction_id` cannot reference self | App | Service-layer check |
| 10 | `parent_transaction_id` cannot create cycle (reversal of reversal not allowed) | App | Service-layer check |
| 11 | If `parent_transaction_id` set, original entry's `is_reversed` must be set to true + `reversed_by_entry_id` set to this entry's ID (in same transaction) | App | Transactional enforcement |
| 12 | `current_hash` must be valid SHA-256 of all fields + `previous_hash` | App | Hash computation in service-layer |
| 13 | `previous_hash` must match the `current_hash` of the immediately preceding entry (per partition) | App | Hash chain validation |
| 14 | **NO UPDATE allowed** — enforced by DB trigger (per Commitment section) | DB | Trigger `prevent_ledger_modification` |
| 15 | **NO DELETE allowed** — enforced by DB trigger | DB | Trigger `prevent_ledger_modification` |
| 16 | `transaction_time` cannot be in the future (> 5 min ahead) | App | Service-layer validation |
| 17 | `quantity_before` must match the actual current balance (computed from previous entries) | App | Service-layer balance verification |
| 18 | If movement would cause negative stock and `product.negative_stock_allowed = false`, reject | App | Service-layer validation (per Part 4 Stock Status) |
| 19 | For TRANSFER_OUT: corresponding TRANSFER_IN entry must exist for destination (eventually consistent) | App | Workflow Engine enforcement |
| 20 | For REVERSAL: reversed entry's `quantity_delta` must be exact opposite sign | App | Service-layer validation |
| 21 | `actor_user_id` required (no anonymous ledger entries) | DB | NOT NULL |
| 22 | `location_id` must be a BIN-level location (not Zone/Aisle/Rack/Shelf) | App | Service-layer validation |

---

## 8. API Mapping

**Critical**: The Inventory Ledger API is **read-only** for external callers. Writes happen only through domain operations (Goods Receipt, Production Issue, Transfer, etc.) that internally write ledger entries.

| Endpoint | Method | Capability | Permission | Notes |
|---|---|---|---|---|
| `/api/v1/inventory-ledger` | GET | List ledger entries | `INVENTORY:VIEW` | Paginated, filtered by product/batch/warehouse/date/movement_type |
| `/api/v1/inventory-ledger/:id` | GET | Get ledger entry | `INVENTORY:VIEW` | Single entry detail |
| `/api/v1/inventory-ledger/by-batch/:batchId` | GET | Ledger entries for a batch | `INVENTORY:VIEW` | Recall + traceability |
| `/api/v1/inventory-ledger/by-product/:productId` | GET | Ledger entries for a product | `INVENTORY:VIEW` | Product movement history |
| `/api/v1/inventory-ledger/by-location/:locationId` | GET | Ledger entries for a location | `INVENTORY:VIEW` | Bin movement history |
| `/api/v1/inventory-ledger/by-document` | GET | Ledger entries for a source document | `INVENTORY:VIEW` | Document movement history |
| `/api/v1/inventory-ledger/balance` | GET | Get current balance | `INVENTORY:VIEW` | Computed from ledger (product+batch+location) |
| `/api/v1/inventory-ledger/balance-history` | GET | Get balance at a point in time | `INVENTORY:VIEW` | Historical balance reconstruction |
| `/api/v1/inventory-ledger/:id/reverse` | POST | Reverse an entry | `INVENTORY:APPROVE` + Sensitive Operation | Creates reversal entry (per Ch 6 §6.13) |
| `/api/v1/inventory-ledger/verify-hash-chain` | POST | Verify hash chain integrity | `IT:ADMIN` | Per Ch 18 Q106 — admin operation |
| `/api/v1/inventory-ledger/export` | POST | Export ledger entries | `INVENTORY:EXPORT` + Sensitive Operation | Async job per Ch 11 Q4 |
| `/api/v1/inventory-ledger/movement-summary` | GET | Aggregated movements by period | `INVENTORY:VIEW` | For reports/dashboards |

**Note**: There is **NO POST to create ledger entry directly** — ledger entries are created only by:
- Goods Receipt Note (GRN) → RECEIPT entries
- Production Order → PRODUCTION_IN / PRODUCTION_OUT entries
- Stock Transfer → TRANSFER_OUT (source) + TRANSFER_IN (destination) entries
- Sales Order / POS Sync → ISSUE entries
- Stock Adjustment → ADJUSTMENT entries
- QC Hold/Release → QC_HOLD / QC_RELEASE entries
- Scrap → SCRAP entries
- Return → RETURN entries
- Reversal → REVERSAL entries (compensating)

This is the **Ledger Pattern** (per Ch 26 §26.5) — domain operations own the ledger writes.

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Ledger Entry List | AG Grid with multi-filter (product, batch, warehouse, date, movement_type) | `/inventory/ledger` |
| Ledger Entry Detail | Single entry with all fields + hash chain verification | `/inventory/ledger/:id` |
| Batch Ledger View | All ledger entries for a batch (genealogy) | `/inventory/batches/:id/ledger` |
| Product Movement History | All movements for a product | `/inventory/products/:id/movements` |
| Location Movement History | All movements at a bin | `/warehouse/locations/:id/movements` |
| Reversal Console | L3+ interface for reversing entries (with audit) | `/inventory/ledger/reversals` |
| Hash Chain Verification | IT admin view of hash chain integrity | `/admin/ledger/hash-verification` |
| Balance Reconstruction | Historical balance at any point in time | `/inventory/ledger/balance-history` |
| Movement Analytics | Charts: movements by type, by day, by warehouse | `/inventory/ledger/analytics` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| View ledger entries for a batch | QC inspectors, warehouse staff |
| View movement history at a bin | Warehouse staff verifying stock |
| Reversal request | L3+ can request reversal (requires approval) |
| Offline movement queue | Movements created offline, sync as ledger entries (per Ch 11 Q3) |

---

## 11. Reports

| Report | Use of Inventory Ledger |
|---|---|
| Stock Ledger Report | Complete ledger for a period (per Ch 15 §15.3) |
| Movement Summary Report | Aggregated movements by type/warehouse/period |
| Batch Movement Report | All movements for a batch (recall support) |
| Product Movement Report | All movements for a product |
| Reversal Report | All reversal entries with reasons |
| Inventory Valuation Report | Compute stock value from ledger (per Ch 15 §15.4) |
| Inventory Turnover Report | Compute turnover from ledger |
| Slow-Moving Stock Report | Products with no ledger activity in N days |
| Dead Stock Report | Products with no issue movements in N days |
| Negative Stock Report | Entries that caused negative stock (if allowed) |
| Hash Chain Integrity Report | Verification results (per Ch 18 Q106) |
| Auditor's Report | Complete immutable audit trail for external auditors |
| FSSAI Traceability Report | Per FSSAI compliance (per Ch 18 §18.7) |

---

## 12. Audit Rules

**The Inventory Ledger IS the audit trail.** It is not separately audited — it is the immutable record.

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| INSERT (CREATE) | ✅ Yes — the entry itself is the audit record | Optional (mandatory for adjustments, scraps, reversals) | **Permanent** (per Ch 10 §10.13, Ch 18 §18.12) |
| UPDATE | ❌ **NEVER** — DB trigger prevents | N/A | N/A |
| DELETE | ❌ **NEVER** — DB trigger prevents | N/A | N/A |
| REVERSAL (new entry) | ✅ Yes — reversal entry itself is audited | **Mandatory** (`reversal_reason`) | Permanent |
| EXPORT | ✅ Yes (separate audit_log entry) | **Mandatory** | 7 years |
| HASH CHAIN VERIFICATION | ✅ Yes (logged in audit_log) | N/A | Permanent |

**Audit Level**: **Self-auditing** — the ledger is the audit trail. Plus, all reads/exports are logged in `audit_log` separately.

**Special**: Per Ch 18 Q106, ledger entries are **hash-chained** for tamper-evidence. Daily verification job recomputes hashes from genesis; any break = Critical security event.

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `transaction_number`, `transaction_type`, `movement_type`, `transaction_time`, `product_id`, `batch_id`, `quantity_delta`, `quantity_before`, `quantity_after`, `uom_id`, `source_document_*` | Internal | L2+ Inventory, Warehouse |
| `unit_cost`, `total_cost`, `currency_code` | Confidential | L2+ Finance |
| `actor_user_id`, `device_id`, `ip_address`, `session_id` | Confidential | L2+ IT, Audit |
| `reason_code`, `reason_text`, `reversal_reason` | Internal | L2+ Inventory |
| `previous_hash`, `current_hash` | Confidential | L2+ IT, Audit (hash chain integrity) |
| `metadata` | Internal | L2+ Inventory (per contents) |
| `company_id`, `brand_id`, `facility_id`, `warehouse_id`, `location_id` | Internal | L2+ scoped |

**Multi-tenant isolation**: Every query auto-filters by `company_id` (per Ch 6 §6.9). Facility isolation auto-filters by `facility_id` per user scope.

---

## 14. AI Relevance

The Inventory Ledger is the **primary data source for all inventory AI**.

| AI Capability | Usage |
|---|---|
| **Demand Forecast AI** | Consumes ledger entries (issue/sale patterns) to forecast demand |
| **Reorder Prediction AI** | Uses ledger to compute consumption velocity → reorder timing |
| **Inventory Optimization AI** | Analyzes ledger for slow-moving/fast-moving patterns |
| **Waste Prediction AI** | Predicts which batches will be scrapped (SCRAP entries) |
| **Stock Health Score AI** | Computes health score per product/batch from ledger patterns |
| **Inventory Risk Analysis AI** | Identifies stockout risk, overstock risk from ledger trends |
| **ABC Classification AI** | Classifies products by movement value (from ledger) |
| **Purchase Recommendation AI** | Recommends PO timing/quantity from ledger consumption |
| **Expiry Prediction AI** | Predicts which batches will expire before consumption |
| **Slow-Moving Analysis AI** | Identifies products with low ledger activity |
| **Warehouse Optimization AI** | Analyzes putaway/picking patterns from ledger |
| **Batch Optimization AI** | Recommends optimal batch sizes from ledger yield patterns |
| **Anomaly Detection AI** | Detects unusual ledger patterns (potential fraud/errors) |
| **Predictive Analytics AI** | Time-series forecasting from ledger data |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| **Row count** | HIGH volume — millions of entries per year (~3000-5000 entries/day at scale) |
| **Partitioning** | Monthly by `transaction_time` (per Ch 10 §10.11, Q3); pg_partman auto-manages |
| **Partition pruning** | Time-range queries hit only relevant partitions |
| **Cache strategy** | Redis cache NOT used for ledger (always query fresh — ledger is source of truth); current balances cached in `inventory_master` (5-min TTL) |
| **Hot path: balance lookup** | Dedicated `idx_ledger_product_batch_location` index; for real-time balance, use `inventory_master` (event-updated summary per Ch 10 Q1) |
| **Hot path: barcode scan** | Lookup via Batch.barcode_value → batch_id → ledger entries; < 200ms per Ch 20 §20.10 |
| **Hot path: recall query** | `idx_ledger_batch` + materialized path on Batch; < 60 sec for cold tier per Ch 18 Q108 |
| **Write performance** | Single INSERT < 10ms per Ch 26 Q150; transaction includes summary update + event outbox |
| **Aggregate queries** | Use pre-aggregated summary tables (`inventory_master`, daily/hourly summaries per Ch 15 Q82) — never aggregate ledger directly for dashboards |
| **Cold-tier archival** | Partitions older than 2 years → detach → export to Parquet → queryable via FDW (per Ch 10 Q4) |
| **Hash chain verification** | Daily job; verifies all entries in last 24h + sample of older entries |
| **N+1 prevention** | Eager-load `product`, `batch`, `location`, `actor_user` when listing |
| **Idempotency** | Outbox pattern ensures ledger write + event publish are atomic; idempotency key prevents duplicate entries from offline sync (per Ch 11 Q3, Ch 13 §13.11) |

---

## 16. Example Records

### Example 1: Goods Receipt (RECEIPT)

```json
{
  "id": "01928f7a-...-ledger-001",
  "seq": 1001,
  "transaction_number": "INV-2026-000001",
  "transaction_type": "RECEIPT",
  "movement_type": "RECEIPT",
  "source_document_type": "GOODS_RECEIPT_NOTE",
  "source_document_id": "01928f7a-...-grn-001",
  "source_document_number": "GRN-2026-000001",
  "company_id": "01928f7a-...-company",
  "brand_id": "01928f7a-...-brand-sdm",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_id": "01928f7a-...-bin-rm-01-01",
  "product_id": "01928f7a-...-prod-sugar",
  "batch_id": "01928f7a-...-batch-002",
  "lot_id": "01928f7a-...-lot-sugar-042",
  "quantity_delta": 500.0000,
  "quantity_before": 0.0000,
  "quantity_after": 500.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 45.0000,
  "total_cost": 22500.0000,
  "currency_code": "INR",
  "reason_code": "GRN_RECEIPT",
  "reason_text": "Goods received per GRN-2026-000001",
  "actor_user_id": "01928f7a-...-user-warehouse-clerk",
  "device_id": "TAB-WH-001",
  "ip_address": "192.168.1.100",
  "session_id": "01928f7a-...-session-001",
  "transaction_time": "2026-07-05T10:30:00Z",
  "created_at": "2026-07-05T10:30:01Z",
  "previous_hash": "abc123def456...",
  "current_hash": "def456ghi789...",
  "metadata": {
    "scanner_id": "ZEBRA-TC52-001",
    "po_number": "PO-2026-001",
    "supplier_invoice": "MUR-INV-2026-042"
  },
  "created_by": "01928f7a-...-user-warehouse-clerk"
}
```

### Example 2: Production Issue (PRODUCTION_OUT)

```json
{
  "id": "01928f7a-...-ledger-002",
  "seq": 1002,
  "transaction_number": "INV-2026-000002",
  "transaction_type": "PRODUCTION",
  "movement_type": "PRODUCTION_OUT",
  "source_document_type": "PRODUCTION_ORDER",
  "source_document_id": "01928f7a-...-po-001",
  "source_document_number": "WO-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_id": "01928f7a-...-bin-rm-01-01",
  "product_id": "01928f7a-...-prod-sugar",
  "batch_id": "01928f7a-...-batch-002",
  "quantity_delta": -25.0000,
  "quantity_before": 500.0000,
  "quantity_after": 475.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 45.0000,
  "total_cost": 1125.0000,
  "currency_code": "INR",
  "reason_code": "PRODUCTION_ISSUE",
  "reason_text": "Material issued to production order WO-2026-000001 for Kaju Katli batch BAT-2026-000001",
  "actor_user_id": "01928f7a-...-user-production-supervisor",
  "device_id": "TAB-PLT-001",
  "ip_address": "192.168.1.200",
  "transaction_time": "2026-07-07T08:30:00Z",
  "created_at": "2026-07-07T08:30:01Z",
  "previous_hash": "def456ghi789...",
  "current_hash": "ghi789jkl012...",
  "metadata": {
    "production_order_id": "01928f7a-...-po-001",
    "produced_batch_id": "01928f7a-...-batch-001",
    "recipe_version": "v3",
    "work_center": "WC-SWEETS-01"
  },
  "created_by": "01928f7a-...-user-production-supervisor"
}
```

### Example 3: Transfer Out (TRANSFER_OUT)

```json
{
  "id": "01928f7a-...-ledger-003",
  "seq": 1003,
  "transaction_number": "INV-2026-000003",
  "transaction_type": "TRANSFER",
  "movement_type": "TRANSFER_OUT",
  "source_document_type": "STOCK_TRANSFER",
  "source_document_id": "01928f7a-...-transfer-001",
  "source_document_number": "TRF-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "quantity_delta": -10.0000,
  "quantity_before": 42.5000,
  "quantity_after": 32.5000,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 580.0000,
  "total_cost": 5800.0000,
  "currency_code": "INR",
  "reason_code": "INTER_WAREHOUSE_TRANSFER",
  "reason_text": "Transfer to Sudhamrit Store Kothrud per TRF-2026-000001",
  "actor_user_id": "01928f7a-...-user-warehouse-clerk",
  "transaction_time": "2026-07-07T14:30:00Z",
  "created_at": "2026-07-07T14:30:01Z",
  "previous_hash": "ghi789jkl012...",
  "current_hash": "jkl012mno345...",
  "metadata": {
    "destination_warehouse_id": "01928f7a-...-wh-store-04",
    "destination_location_id": "01928f7a-...-bin-store-04-01",
    "transfer_id": "01928f7a-...-transfer-001",
    "vehicle_id": "DL01-A-4567"
  },
  "created_by": "01928f7a-...-user-warehouse-clerk"
}
```

### Example 4: Reversal Entry (REVERSAL — correcting a mistake)

```json
{
  "id": "01928f7a-...-ledger-004",
  "seq": 1004,
  "transaction_number": "INV-2026-000004",
  "transaction_type": "REVERSAL",
  "movement_type": "ADJUSTMENT",
  "parent_transaction_id": "01928f7a-...-ledger-003",
  "is_reversed": false,
  "reversal_reason": "Incorrect quantity entered — actual transfer was 5kg not 10kg. Reversing original entry; new entry with correct quantity will follow.",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "quantity_delta": 10.0000,
  "quantity_before": 32.5000,
  "quantity_after": 42.5000,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 580.0000,
  "total_cost": 5800.0000,
  "currency_code": "INR",
  "reason_code": "REVERSAL",
  "reason_text": "Reversal of INV-2026-000003 — incorrect quantity",
  "actor_user_id": "01928f7a-...-user-warehouse-manager",
  "transaction_time": "2026-07-07T15:00:00Z",
  "created_at": "2026-07-07T15:00:01Z",
  "previous_hash": "jkl012mno345...",
  "current_hash": "mno345pqr678...",
  "metadata": {
    "reversed_transaction_id": "01928f7a-...-ledger-003",
    "approved_by": "01928f7a-...-user-ops-head"
  },
  "created_by": "01928f7a-...-user-warehouse-manager"
}
```

### Example 5: QC Hold (QC_HOLD)

```json
{
  "id": "01928f7a-...-ledger-005",
  "seq": 1005,
  "transaction_number": "INV-2026-000005",
  "transaction_type": "QC",
  "movement_type": "QC_HOLD",
  "source_document_type": "QC_INSPECTION",
  "source_document_id": "01928f7a-...-qc-003",
  "source_document_number": "QC-2026-000003",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-12",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-004",
  "quantity_delta": 0.0000,
  "quantity_before": 25.0000,
  "quantity_after": 25.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "reason_code": "QC_HOLD_COMPLAINT",
  "reason_text": "Stock quarantined pending investigation of customer complaint",
  "actor_user_id": "01928f7a-...-user-qc-head",
  "transaction_time": "2026-07-06T15:30:00Z",
  "created_at": "2026-07-06T15:30:01Z",
  "previous_hash": "mno345pqr678...",
  "current_hash": "pqr678stu901...",
  "metadata": {
    "complaint_id": "01928f7a-...-complaint-001",
    "hold_duration_hours": 48,
    "auto_release": false
  },
  "created_by": "01928f7a-...-user-qc-head"
}
```

**Note**: QC_HOLD entries have `quantity_delta = 0` — they don't change total stock, but they move stock from `available` to `qc_hold` status bucket in `inventory_master`.

### Example 6: Scrap (SCRAP)

```json
{
  "id": "01928f7a-...-ledger-006",
  "seq": 1006,
  "transaction_number": "INV-2026-000006",
  "transaction_type": "SCRAP",
  "movement_type": "SCRAP",
  "source_document_type": "SCRAP_ORDER",
  "source_document_id": "01928f7a-...-scrap-001",
  "source_document_number": "SCRAP-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-05",
  "product_id": "01928f7a-...-prod-bhujia-200",
  "batch_id": "01928f7a-...-batch-005",
  "quantity_delta": -5.0000,
  "quantity_before": 5.0000,
  "quantity_after": 0.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 175.0000,
  "total_cost": 875.0000,
  "currency_code": "INR",
  "reason_code": "DAMAGED_BEYOND_USE",
  "reason_text": "5kg Bhujia damaged during handling — packets crushed, cannot be sold. Scrapping per damage report.",
  "actor_user_id": "01928f7a-...-user-warehouse-manager",
  "transaction_time": "2026-07-05T18:00:00Z",
  "created_at": "2026-07-05T18:00:01Z",
  "previous_hash": "pqr678stu901...",
  "current_hash": "stu901vwx234...",
  "metadata": {
    "damage_report_id": "01928f7a-...-damage-001",
    "disposition": "DESTROY",
    "destruction_method": "INCINERATION",
    "witnessed_by": "01928f7a-...-user-qc-inspector"
  },
  "created_by": "01928f7a-...-user-warehouse-manager"
}
```

### Example 7: Production Receipt (PRODUCTION_IN — finished goods received from production)

```json
{
  "id": "01928f7a-...-ledger-007",
  "seq": 1007,
  "transaction_number": "INV-2026-000007",
  "transaction_type": "PRODUCTION",
  "movement_type": "PRODUCTION_IN",
  "source_document_type": "PRODUCTION_ORDER",
  "source_document_id": "01928f7a-...-po-001",
  "source_document_number": "WO-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "quantity_delta": 50.0000,
  "quantity_before": 0.0000,
  "quantity_after": 50.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 580.0000,
  "total_cost": 29000.0000,
  "currency_code": "INR",
  "reason_code": "PRODUCTION_RECEIPT",
  "reason_text": "Finished goods received from production order WO-2026-000001",
  "actor_user_id": "01928f7a-...-user-production-supervisor",
  "transaction_time": "2026-07-07T11:30:00Z",
  "created_at": "2026-07-07T11:30:01Z",
  "previous_hash": "stu901vwx234...",
  "current_hash": "vwx234yza567...",
  "metadata": {
    "production_order_id": "01928f7a-...-po-001",
    "recipe_version": "v3",
    "yield_pct": 96.5,
    "planned_qty": 51.8,
    "actual_qty": 50.0,
    "wastage_qty": 1.8
  },
  "created_by": "01928f7a-...-user-production-supervisor"
}
```

---

## Critical Implementation Notes

### 1. Immutability Enforcement (3 Layers)

1. **DB-level**: `REVOKE UPDATE, DELETE` from all roles
2. **Trigger-level**: `prevent_ledger_modification()` trigger rejects any UPDATE/DELETE
3. **Application-level**: Prisma middleware intercepts any UPDATE/DELETE on `InventoryLedger` model

### 2. Hash Chain Computation

```typescript
function computeHash(entry: InventoryLedger, previousHash: string | null): string {
  const data = JSON.stringify({
    id: entry.id,
    transaction_number: entry.transaction_number,
    transaction_type: entry.transaction_type,
    movement_type: entry.movement_type,
    source_document_id: entry.source_document_id,
    parent_transaction_id: entry.parent_transaction_id,
    company_id: entry.company_id,
    facility_id: entry.facility_id,
    warehouse_id: entry.warehouse_id,
    location_id: entry.location_id,
    product_id: entry.product_id,
    batch_id: entry.batch_id,
    quantity_delta: entry.quantity_delta,
    quantity_before: entry.quantity_before,
    quantity_after: entry.quantity_after,
    uom_id: entry.uom_id,
    unit_cost: entry.unit_cost,
    reason_code: entry.reason_code,
    reason_text: entry.reason_text,
    actor_user_id: entry.actor_user_id,
    transaction_time: entry.transaction_time,
    previous_hash: previousHash,
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

### 3. Transactional Write Pattern (Outbox + Summary Update)

```typescript
async function writeLedgerEntry(entry: InventoryLedger): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Insert ledger entry (immutable)
    await tx.inventoryLedger.create({ data: entry });
    
    // 2. Update inventory_master summary (event-updated per Ch 10 Q1)
    await tx.inventoryMaster.upsert({
      where: { product_id_batch_id_location_id: { ... } },
      create: { ... },
      update: { 
        current_quantity: { increment: entry.quantity_delta },
        last_movement_at: entry.transaction_time,
        version: { increment: 1 }
      }
    });
    
    // 3. Write to outbox for event publication (per Ch 3 §3.7)
    await tx.domainEventOutbox.create({
      data: {
        event_type: 'inventory.ledger.entry',
        aggregate_id: entry.id,
        payload: entry,
      }
    });
  });
  // Outbox processor publishes event to Event Bus after commit
}
```

### 4. Reversal Pattern (per Ch 10 §10.2)

To reverse entry `INV-2026-000003`:
1. Create new entry `INV-2026-000004` with `quantity_delta = -original.quantity_delta` (opposite sign)
2. Set `INV-2026-000004.parent_transaction_id = INV-2026-000003.id`
3. Set `INV-2026-000003.is_reversed = true` (this UPDATE is allowed — it's a flag, not data change)
4. Set `INV-2026-000003.reversed_by_entry_id = INV-2026-000004.id`
5. Both writes in same transaction

**Note**: The `is_reversed` flag update is the ONLY UPDATE allowed on the ledger — and it's enforced via a separate trigger that only allows this specific field update.

### 5. Performance: Balance Computation

To compute current balance for a product+batch+location:
- **Option A (fast)**: Read from `inventory_master` (event-updated summary) — < 10ms
- **Option B (authoritative)**: `SELECT SUM(quantity_delta) FROM inventory_ledger WHERE product_id=? AND batch_id=? AND location_id=?` — < 100ms with index
- **Reconciliation**: Nightly job compares A vs B; drift = Critical alert (per Ch 10 Q1)

### 6. Partition Management

```sql
-- pg_partman configuration
SELECT partman.create_parent(
  'public.inventory_ledger',
  'transaction_time',
  'native',
  'monthly',
  p_premake => 3,  -- pre-create 3 months ahead
  p_start_partition => '2026-01-01'
);

-- Archive partitions older than 2 years to cold storage
-- (per Ch 10 Q4 — exported to Parquet, queryable via FDW)
```
