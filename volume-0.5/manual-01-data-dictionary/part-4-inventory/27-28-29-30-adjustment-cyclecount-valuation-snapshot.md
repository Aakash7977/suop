# Manual 1 · Part 4 · Entities 27, 28, 29, 30 — Inventory Operations (Adjustment, Cycle Count, Valuation, Snapshot)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 4 — Inventory Domain |
| Entities | Inventory Adjustment (027), Cycle Count (028), Inventory Valuation (029), Inventory Snapshot (030) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Entity 027 — Inventory Adjustment

### 1. Business Purpose

The `InventoryAdjustment` entity records **corrections to physical inventory** — when the system stock (from `inventory_master`) doesn't match the actual physical stock. Per Volume 0 Chapter 5 §5.15 (Exception Management), adjustments are **exception events** that require:

- Mandatory reason (per Ch 4 §4.12)
- Approval (per Ch 2 §2.6 — Inventory Head or higher)
- CAPA reference for significant variances (per Ch 18 §18.8)
- Audit trail (immutable — adjustments write to `inventory_ledger` via ADJUSTMENT movement type)

### Adjustment Scenarios

| Scenario | Reason Code | Approval Required |
|---|---|---|
| Cycle count variance | `CYCLE_COUNT_VARIANCE` | L3+ Warehouse Manager |
| Damage during handling | `DAMAGE_HANDLING` | L3+ Warehouse Manager |
| Damage in storage | `DAMAGE_STORAGE` | L3+ Warehouse Manager |
| Theft / pilferage | `THEFT` | L2+ + Security |
| Shrinkage (unexplained) | `SHRINKAGE` | L2+ + CAPA required |
| Expired stock discovery | `EXPIRY_DISCOVERY` | L3+ QC |
| Receipt error correction | `RECEIPT_ERROR` | L3+ Procurement |
| Issue error correction | `ISSUE_ERROR` | L3+ Manufacturing |
| System error correction | `SYSTEM_ERROR` | L2+ IT + Inventory |
| Quality rejection | `QUALITY_REJECTION` | L3+ QC |
| Reclassification | `RECLASSIFICATION` | L3+ Inventory |
| Initial stock load | `INITIAL_LOAD` | L2+ (one-time) |

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Inventory Head |
| Data Owner | Inventory Head |
| Technical Owner | Backend Lead — Inventory Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `inventory_adjustments` |
| Prisma Model | `InventoryAdjustment` |
| File Location | `prisma/schema/transactional/inventory/inventory_adjustment.prisma` |
| Lifecycle | 8-stage transactional lifecycle (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → EXECUTED → COMPLETED → CLOSED → ARCHIVED) per Ch 4 §4.6 |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `ADJ-` | Adjustment number (e.g., `ADJ-2026-000001`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities | Facility |
| `status` | ENUM | Yes | `DRAFT` | 8-stage transactional lifecycle | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Adjustment-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `adjustment_number` | VARCHAR(50) | Yes | — | Unique per company | Display number | Public | — |
| `adjustment_type` | ENUM | Yes | — | CYCLE_COUNT, DAMAGE, LOSS, THEFT, SHRINKAGE, EXPIRY, RECEIPT_ERROR, ISSUE_ERROR, SYSTEM_ERROR, QUALITY_REJECTION, RECLASSIFICATION, INITIAL_LOAD | Adjustment category | Internal | — |
| `adjustment_date` | DATE | Yes | — | ≤ today | Date of adjustment (when variance discovered) | Internal | — |
| `inventory_master_id` | UUID | Yes | — | FK to `inventory_master.id` | The stock being adjusted | Internal | — |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product (denormalized) | Internal | — |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch (denormalized) | Internal | — |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` | Warehouse | Internal | — |
| `location_id` | UUID | Yes | — | FK to `locations.id` | Location | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal | — |
| `old_quantity` | DECIMAL(18,4) | Yes | — | — | System quantity before adjustment | Internal | — |
| `new_quantity` | DECIMAL(18,4) | Yes | — | ≥ 0 (or < 0 if negative_stock_allowed) | Physical quantity after adjustment | Internal | — |
| `variance_quantity` | DECIMAL(18,4) | Yes | — | Generated: `new_quantity - old_quantity` (signed) | Variance (positive = gain, negative = loss) | Internal | Waste AI |
| `variance_pct` | DECIMAL(5,2) | No | — | Generated: `(variance_quantity / old_quantity) * 100` | Variance percentage | Internal | — |
| `variance_value` | DECIMAL(18,4) | No | — | Generated: `variance_quantity * unit_cost` | Financial impact of variance | Confidential | — |
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Unit cost for variance calculation | Confidential | — |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal | — |
| `reason_code` | VARCHAR(50) | Yes | — | FK to `stock_reason_codes.code` | Structured reason | Internal | — |
| `reason_text` | TEXT | Yes | — | Min 10 chars (mandatory per Ch 4 §4.12) | Detailed reason | Internal | — |
| `source_document_type` | VARCHAR(30) | No | NULL | CYCLE_COUNT, DAMAGE_REPORT, etc. | Source document type | Internal | — |
| `source_document_id` | UUID | No | NULL | FK to source | Source document ID | Internal | — |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number | Internal | — |
| `capa_id` | UUID | No | NULL | FK to `capas.id`; required if `abs(variance_pct) > 5` | CAPA reference (per Ch 18 §18.8) | Confidential | — |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger.id`; set when adjustment executed | Resulting ledger entry | Internal | — |
| `discovered_by` | UUID | Yes | — | FK to `user_accounts.id` | Who discovered the variance | Internal | — |
| `discovered_at` | TIMESTAMPTZ | Yes | — | — | When variance discovered | Internal | — |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id`; set when status = APPROVED | Who approved | Internal | — |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal | — |
| `approval_comments` | TEXT | No | NULL | — | Approver comments | Internal | — |
| `executed_at` | TIMESTAMPTZ | No | NULL | — | When adjustment executed (ledger entry written) | Internal | — |
| `executed_by` | UUID | No | NULL | FK to `user_accounts.id` | Who executed | Internal | — |
| `is_financial_impact` | BOOLEAN | Yes | `false` | Generated: `abs(variance_value) > 1000` (configurable) | Flag for finance review | Confidential | — |
| `requires_capa` | BOOLEAN | Yes | `false` | Generated: `abs(variance_pct) > 5 OR abs(variance_value) > 10000` | CAPA required flag | Confidential | — |
| `remarks` | TEXT | No | NULL | — | Additional annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| InventoryAdjustment → Company, Facility, InventoryMaster, Product, Batch, Warehouse, Location, UOM | N : 1 each | various | RESTRICT |
| InventoryAdjustment → StockReasonCode | N : 1 | `reason_code` | SET NULL |
| InventoryAdjustment → Capa | N : 1 | `capa_id` | SET NULL |
| InventoryAdjustment → InventoryLedger | N : 1 | `ledger_entry_id` | SET NULL |
| InventoryAdjustment → UserAccount (discovered_by, approved_by, executed_by) | N : 1 each | various | RESTRICT |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_inventory_adjustments` | PK | `id` |
| `uq_adjustments_code_company` | UNIQUE | `company_id, code` |
| `idx_adjustments_status` | B-TREE | `status, adjustment_date DESC` |
| `idx_adjustments_inventory` | B-TREE | `inventory_master_id` |
| `idx_adjustments_product` | B-TREE | `product_id, adjustment_date DESC` |
| `idx_adjustments_batch` | B-TREE | `batch_id WHERE batch_id IS NOT NULL` |
| `idx_adjustments_warehouse` | B-TREE | `warehouse_id, adjustment_date DESC` |
| `idx_adjustments_type` | B-TREE | `adjustment_type, adjustment_date DESC` |
| `idx_adjustments_reason` | B-TREE | `reason_code, adjustment_date DESC` |
| `idx_adjustments_high_variance` | PARTIAL | `abs(variance_pct) WHERE abs(variance_pct) > 5 AND status = 'EXECUTED'` | High-variance adjustments (CAPA candidates) |
| `idx_adjustments_financial_impact` | PARTIAL | `adjustment_date WHERE is_financial_impact = true` | Finance review queue |
| `idx_adjustments_pending_approval` | PARTIAL | `facility_id, adjustment_date WHERE status = 'SUBMITTED'` | Approval queue |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `new_quantity` ≥ 0 (unless negative_stock_allowed) | DB CHECK |
| 3 | `variance_quantity` must equal `new_quantity - old_quantity` | DB CHECK |
| 4 | `reason_text` min 10 chars (mandatory per Ch 4 §4.12) | App |
| 5 | `capa_id` required if `abs(variance_pct) > 5` | App |
| 6 | `capa_id` required if `abs(variance_value) > 10000` (configurable threshold) | App |
| 7 | Approval required before EXECUTED status | App |
| 8 | L3+ approval for adjustments < ₹10,000 | App |
| 9 | L2+ approval for adjustments ≥ ₹10,000 | App |
| 10 | L1+ approval + Sensitive Operation for adjustments ≥ ₹1,00,000 | App |
| 11 | On execute: write ADJUSTMENT ledger entry (per Ch 10 §10.2); update `inventory_master` | App |
| 12 | `old_quantity` must match `inventory_master.on_hand_qty` at time of execution (prevent race conditions) | App |
| 13 | Status transitions follow 8-stage lifecycle | App |
| 14 | Cannot modify after EXECUTED (must reverse with new adjustment) | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/inventory-adjustments` (GET, POST), `/api/v1/inventory-adjustments/:id` (GET, PATCH), `/api/v1/inventory-adjustments/:id/submit` (POST), `/api/v1/inventory-adjustments/:id/approve` (POST), `/api/v1/inventory-adjustments/:id/reject` (POST), `/api/v1/inventory-adjustments/:id/execute` (POST — writes ledger entry), `/api/v1/inventory-adjustments/pending-approval` (GET), `/api/v1/inventory-adjustments/high-variance` (GET) |
| **UI** | Adjustment List, Adjustment Detail (with approval workflow), Adjustment Create Form, Approval Queue, High-Variance Dashboard, CAPA Link Manager |
| **Mobile** | Adjustment creation from cycle count, damage report from mobile, approval on mobile (L3+) |
| **Reports** | Adjustment Report, Variance Analysis, Adjustment by Reason, Financial Impact Report, CAPA-triggering Adjustments, Adjustment Trends |
| **Audit** | Full; **mandatory reason** for all adjustments; hash-chained ledger entry on execute |

### 13-16. Security / AI / Performance / Example

**Security**: `adjustment_number`, `product_id`, `old_quantity`, `new_quantity` = Internal; `variance_value`, `unit_cost`, `is_financial_impact` = Confidential; `capa_id` = Confidential.

**AI**: Variance Pattern AI (detects systematic variance patterns), Waste Prediction AI (predicts which locations will have damage), Theft Detection AI (anomaly detection in adjustments), CAPA Recommendation AI (recommends CAPA for high-variance items).

**Performance**: < 50k per year; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-adj-001",
  "code": "ADJ-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "adjustment_number": "ADJ-2026-000001",
  "adjustment_type": "CYCLE_COUNT",
  "adjustment_date": "2026-07-07",
  "inventory_master_id": "01928f7a-...-inv-001",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "uom_id": "01928f7a-...-uom-kg",
  "old_quantity": 42.5000,
  "new_quantity": 41.8000,
  "variance_quantity": -0.7000,
  "variance_pct": -1.65,
  "variance_value": -406.0000,
  "unit_cost": 580.0000,
  "currency_code": "INR",
  "reason_code": "CYCLE_COUNT_VARIANCE",
  "reason_text": "Cycle count variance — 0.7kg short during monthly count. Likely sampling error or minor pilferage. Investigating.",
  "source_document_type": "CYCLE_COUNT",
  "source_document_id": "01928f7a-...-cc-001",
  "source_document_number": "CC-2026-000001",
  "discovered_by": "01928f7a-...-user-counter",
  "discovered_at": "2026-07-07T10:30:00Z",
  "approved_by": "01928f7a-...-user-wh-mgr",
  "approved_at": "2026-07-07T14:00:00Z",
  "approval_comments": "Approved — variance within acceptable range (<2%). Monitor for pattern.",
  "executed_at": "2026-07-07T14:15:00Z",
  "executed_by": "01928f7a-...-user-inventory-clerk",
  "ledger_entry_id": "01928f7a-...-ledger-010",
  "is_financial_impact": false,
  "requires_capa": false,
  "status": "EXECUTED",
  "version": 4
}
```

---

## Entity 028 — Cycle Count

### 1. Business Purpose

The `CycleCount` entity records **continuous inventory verification** — counting a subset of inventory on a regular schedule rather than doing a full physical count. Per Volume 0 Chapter 5 §5.16 and Q9, SUOP supports:

- **ABC Counting** — A items (high-value, fast-moving) counted weekly, B items monthly, C items quarterly
- **Random Counting** — random sample counts
- **Full Counting** — complete physical count (rare, disruptive)

Cycle counting maintains **inventory accuracy > 99%** (per Ch 1 §2.8 KPI) without halting operations.

### Cycle Count Lifecycle

```
SCHEDULED (auto-generated by Scheduler Service per ABC schedule)
   ↓ Start count
IN_PROGRESS (counter counting items)
   ↓ Submit count
SUBMITTED (counter submitted, awaiting review)
   ↓ Review
REVIEWED (supervisor reviewed)
   ↓ Approve
APPROVED (variances accepted)
   ↓ Execute adjustments
COMPLETED (adjustments written to ledger)
   ↓ Or cancel
CANCELLED
```

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Warehouse Head |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Inventory Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `cycle_counts` (header) + `cycle_count_items` (line items) |
| Prisma Models | `CycleCount`, `CycleCountItem` |
| Pattern | Header-line (one count → many items) |

### 4. Field Dictionary

#### 4.1 Cycle Count Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `CC-` | Count number |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (warehouse) | Warehouse |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, IN_PROGRESS, SUBMITTED, REVIEWED, APPROVED, COMPLETED, CANCELLED | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `count_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `count_type` | ENUM | Yes | — | ABC_A, ABC_B, ABC_C, RANDOM, FULL, ADHOC, LOCATION_SPECIFIC, PRODUCT_SPECIFIC | Count type | Internal |
| `count_frequency` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, ON_DEMAND | Frequency | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Warehouse | Internal |
| `zone_id` | UUID | No | NULL | FK to `locations.id` (ZONE level) | Specific zone (NULL = entire warehouse) | Internal |
| `scheduled_date` | DATE | Yes | — | — | Scheduled count date | Internal |
| `started_at` | TIMESTAMPTZ | No | NULL | — | When counting started | Internal |
| `submitted_at` | TIMESTAMPTZ | No | NULL | — | When counter submitted | Internal |
| `reviewed_at` | TIMESTAMPTZ | No | NULL | — | When supervisor reviewed | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion timestamp | Internal |
| `counter_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Assigned counter | Internal |
| `supervisor_user_id` | UUID | No | NULL | FK to `user_accounts.id` | Supervisor (L4+) | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Total items to count (denormalized) | Internal |
| `counted_items` | INTEGER | Yes | `0` | ≥ 0 | Items counted so far | Internal |
| `variance_items` | INTEGER | Yes | `0` | ≥ 0 | Items with variance | Internal |
| `accuracy_pct` | DECIMAL(5,2) | No | — | Generated: `(counted_items - variance_items) / counted_items * 100` | Count accuracy | Internal |
| `total_variance_value` | DECIMAL(18,4) | No | `0` | — | Total financial variance | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Cycle Count Item (Line Item)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `cycle_count_id` | UUID | Yes | — | FK to `cycle_counts.id` | Parent count | — |
| `inventory_master_id` | UUID | Yes | — | FK to `inventory_master.id` | Stock being counted | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch | Internal |
| `location_id` | UUID | Yes | — | FK to `locations.id` | Location | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `system_quantity` | DECIMAL(18,4) | Yes | — | — | System quantity (from inventory_master) | Internal |
| `counted_quantity` | DECIMAL(18,4) | No | NULL | ≥ 0 | Physical counted quantity | Internal |
| `variance_quantity` | DECIMAL(18,4) | No | — | Generated: `counted_quantity - system_quantity` | Variance | Internal |
| `variance_pct` | DECIMAL(5,2) | No | — | Generated | Variance percentage | Internal |
| `variance_value` | DECIMAL(18,4) | No | — | — | Financial variance | Confidential |
| `unit_cost` | DECIMAL(18,4) | No | NULL | — | Unit cost | Confidential |
| `count_status` | ENUM | Yes | `PENDING` | PENDING, COUNTED, VARIANCE, MATCHED, ADJUSTED | Item status | Internal |
| `counted_at` | TIMESTAMPTZ | No | NULL | — | When counted | Internal |
| `counted_by` | UUID | No | NULL | FK to `user_accounts.id` | Who counted | Internal |
| `reason_code` | VARCHAR(50) | No | NULL | FK to `stock_reason_codes.code`; required if variance | Reason for variance | Internal |
| `reason_text` | TEXT | No | NULL | Required if variance > threshold | Variance explanation | Internal |
| `adjustment_id` | UUID | No | NULL | FK to `inventory_adjustments.id` | Resulting adjustment | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| CycleCount → Company, Facility, Warehouse | N : 1 each | various | RESTRICT |
| CycleCount → Location (zone) | N : 1 | `zone_id` | SET NULL |
| CycleCount → UserAccount (counter, supervisor) | N : 1 each | various | RESTRICT |
| CycleCount → CycleCountItem | 1 : N | `cycle_count_items.cycle_count_id` | CASCADE |
| CycleCountItem → InventoryMaster, Product, Batch, Location, UOM | N : 1 each | various | SET NULL/RESTRICT |
| CycleCountItem → InventoryAdjustment | N : 1 | `adjustment_id` | SET NULL |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_cycle_counts` | PK | `id` |
| `uq_cycle_counts_code_company` | UNIQUE | `company_id, code` |
| `idx_cycle_counts_status` | B-TREE | `status, scheduled_date` |
| `idx_cycle_counts_warehouse` | B-TREE | `warehouse_id, scheduled_date DESC` |
| `idx_cycle_counts_counter` | B-TREE | `counter_user_id, status WHERE status = 'IN_PROGRESS'` |
| `idx_cycle_counts_type` | B-TREE | `count_type, scheduled_date` |
| `pk_cycle_count_items` | PK | `id` |
| `idx_cc_items_count` | B-TREE | `cycle_count_id, count_status` |
| `idx_cc_items_variance` | PARTIAL | `cycle_count_id WHERE count_status = 'VARIANCE'` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `counted_quantity` ≥ 0 | DB CHECK |
| 3 | `system_quantity` must match `inventory_master.on_hand_qty` at count time | App |
| 4 | `reason_text` required if `abs(variance_pct) > 2` | App |
| 5 | Counter cannot approve own count (4-eyes principle) | App |
| 6 | Status transitions follow lifecycle | App |
| 7 | On APPROVED: auto-generate `InventoryAdjustment` for each variance item | App |
| 8 | On COMPLETED: write ADJUSTMENT ledger entries for all variances | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/cycle-counts` (GET, POST), `/api/v1/cycle-counts/:id` (GET, PATCH), `/api/v1/cycle-counts/:id/start` (POST), `/api/v1/cycle-counts/:id/items/:itemId/count` (POST — record count), `/api/v1/cycle-counts/:id/submit` (POST), `/api/v1/cycle-counts/:id/review` (POST), `/api/v1/cycle-counts/:id/approve` (POST), `/api/v1/cycle-counts/:id/complete` (POST — execute adjustments), `/api/v1/cycle-counts/schedule` (POST — auto-generate per ABC), `/api/v1/cycle-counts/accuracy-report` (GET) |
| **UI** | Cycle Count List, Cycle Count Detail (with items grid), Count Entry Screen (large numbers, barcode scan), Variance Review, Accuracy Dashboard |
| **Mobile** | Mobile count entry (primary — barcode scan + quantity), offline count (sync later), variance reason entry |
| **Reports** | Cycle Count Accuracy Report, Variance Analysis, ABC Count Schedule, Counter Productivity, Warehouse Accuracy Ranking |
| **Audit** | Full; mandatory reason for variances; ledger entries for adjustments |

### 13-16. Security / AI / Performance / Example

**Security**: `count_number`, `count_type` = Public; quantities, variances = Internal; `total_variance_value`, `variance_value`, `unit_cost` = Confidential.

**AI**: Cycle Count Optimization AI (recommends which items to count), Variance Pattern AI (detects systematic variance patterns), Counter Performance AI (evaluates counter accuracy).

**Performance**: < 10k counts/year; ~100 items per count average; Redis cache TTL 1 hour.

#### Example: ABC_A Weekly Count

```json
{
  "header": {
    "id": "01928f7a-...-cc-001",
    "code": "CC-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "count_number": "CC-2026-000001",
    "count_type": "ABC_A",
    "count_frequency": "WEEKLY",
    "warehouse_id": "01928f7a-...-wh-fg-01",
    "scheduled_date": "2026-07-07",
    "started_at": "2026-07-07T09:00:00Z",
    "counter_user_id": "01928f7a-...-user-counter",
    "supervisor_user_id": "01928f7a-...-user-wh-supervisor",
    "total_items": 50,
    "counted_items": 50,
    "variance_items": 3,
    "accuracy_pct": 94.00,
    "total_variance_value": -1250.0000,
    "currency_code": "INR",
    "status": "APPROVED",
    "version": 6
  },
  "items": [
    {
      "id": "01928f7a-...-cc-item-001",
      "cycle_count_id": "01928f7a-...-cc-001",
      "inventory_master_id": "01928f7a-...-inv-001",
      "product_id": "01928f7a-...-prod-kaju-katli-500",
      "batch_id": "01928f7a-...-batch-001",
      "location_id": "01928f7a-...-bin-fg-01-01",
      "uom_id": "01928f7a-...-uom-kg",
      "system_quantity": 42.5000,
      "counted_quantity": 41.8000,
      "variance_quantity": -0.7000,
      "variance_pct": -1.65,
      "variance_value": -406.0000,
      "unit_cost": 580.0000,
      "count_status": "VARIANCE",
      "counted_at": "2026-07-07T10:30:00Z",
      "counted_by": "01928f7a-...-user-counter",
      "reason_code": "CYCLE_COUNT_VARIANCE",
      "reason_text": "0.7kg short — likely sampling error or minor pilferage",
      "adjustment_id": "01928f7a-...-adj-001"
    },
    {
      "id": "01928f7a-...-cc-item-002",
      "cycle_count_id": "01928f7a-...-cc-001",
      "inventory_master_id": "01928f7a-...-inv-002",
      "product_id": "01928f7a-...-prod-sugar",
      "batch_id": "01928f7a-...-batch-002",
      "location_id": "01928f7a-...-bin-rm-01-01",
      "uom_id": "01928f7a-...-uom-kg",
      "system_quantity": 350.0000,
      "counted_quantity": 350.0000,
      "variance_quantity": 0.0000,
      "variance_pct": 0.00,
      "count_status": "MATCHED",
      "counted_at": "2026-07-07T10:45:00Z",
      "counted_by": "01928f7a-...-user-counter"
    }
  ]
}
```

---

## Entity 029 — Inventory Valuation

### 1. Business Purpose

The `InventoryValuation` entity records **inventory value calculations** at a point in time. Per Volume 0 Chapter 15 §15.4, SUOP supports multiple valuation methods:

- **FIFO** (First In, First Out) — oldest stock valued first
- **LIFO** (Last In, First Out) — newest stock valued first
- **Weighted Average** — average cost across all stock
- **Standard Cost** — predefined cost per product
- **Specific Identification** — actual cost per batch (per Ch 15 §15.4)

Valuation is computed:
- **On-demand** — for ad-hoc reports
- **Scheduled** — daily/monthly snapshots for financial close
- **Real-time** — `inventory_master.total_value` is real-time (event-updated)

The `InventoryValuation` entity stores the **detailed calculation** behind the summary value — which batches at which costs make up the total.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Finance Head |
| Data Owner | Finance Head |
| Technical Owner | Backend Lead — Finance Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `inventory_valuations` |
| Prisma Model | `InventoryValuation` |
| File Location | `prisma/schema/transactional/inventory/inventory_valuation.prisma` |
| Partitioning | Monthly by `valuation_date` (high volume over time) |

### 4. Field Dictionary

#### 4.1 Universal Base + Valuation-Specific

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `VAL-` | Valuation number |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | FK to facilities; NULL = company-wide | Facility scope |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `valuation_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `valuation_date` | DATE | Yes | — | ≤ today | "As of" date for valuation | Internal |
| `valuation_type` | ENUM | Yes | — | DAILY, MONTHLY, QUARTERLY, FINANCIAL_CLOSE, ON_DEMAND, ADJUSTMENT_IMPACT | Valuation trigger type | Internal |
| `valuation_method` | ENUM | Yes | — | FIFO, LIFO, WEIGHTED_AVG, STANDARD_COST, SPECIFIC | Method used (per Ch 15 §15.4) | Confidential |
| `warehouse_id` | UUID | No | NULL | FK to `facilities.id`; NULL = all warehouses | Warehouse scope | Internal |
| `category_id` | UUID | No | NULL | FK to `product_categories.id`; NULL = all categories | Category scope | Internal |
| `product_id` | UUID | No | NULL | FK to `products.id`; NULL = all products | Product scope | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | — | Total quantity valued | Internal |
| `total_value` | DECIMAL(18,4) | Yes | `0` | — | Total inventory value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Number of items valued | Internal |
| `total_batches` | INTEGER | Yes | `0` | ≥ 0 | Number of batches | Internal |
| `fifo_layers_count` | INTEGER | No | NULL | ≥ 0 | FIFO layers (for FIFO method) | Internal |
| `avg_cost` | DECIMAL(18,4) | No | NULL | — | Weighted average cost | Confidential |
| `variance_from_last` | DECIMAL(18,4) | No | NULL | — | Variance from previous valuation | Confidential |
| `variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance percentage | Confidential |
| `calculated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When calculation ran | Internal |
| `calculation_duration_ms` | INTEGER | No | NULL | ≥ 0 | Calculation time | Internal |
| `is_financial_close` | BOOLEAN | Yes | `false` | — | If true, this is a financial close valuation (immutable) | Confidential |
| `is_snapshot` | BOOLEAN | Yes | `true` | — | If true, valuation is a snapshot (point-in-time) | Internal |
| `snapshot_id` | UUID | No | NULL | FK to `inventory_snapshots.id` | Linked snapshot | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Valuation Items (Line Items — stored as `inventory_valuation_items`)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `valuation_id` | UUID | Yes | — | FK to `inventory_valuations.id` | Parent valuation | — |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` | Warehouse | Internal |
| `location_id` | UUID | No | NULL | FK to `locations.id` | Location | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | — | Quantity valued | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `unit_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit cost per valuation method | Confidential |
| `total_value` | DECIMAL(18,4) | Yes | — | Generated: `quantity * unit_cost` | Total value | Confidential |
| `fifo_layer` | INTEGER | No | NULL | — | FIFO layer number (for FIFO method) | Internal |
| `fifo_age_days` | INTEGER | No | NULL | — | Age of FIFO layer | Internal |
| `cost_method_detail` | JSONB | No | NULL | — | Method-specific details (e.g., weighted avg components) | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | InventoryValuation → Company, Facility, Warehouse, Category, Product, Snapshot, UserAccount; InventoryValuationItem → Valuation, Product, Batch, Warehouse, Location, UOM |
| **Index** | `uq_valuations_code_company`, `idx_valuations_date`, `idx_valuations_method`, `idx_valuations_financial_close`, `idx_val_items_valuation`, `idx_val_items_product_batch` |
| **Validation** | `code` unique per company, `valuation_date` ≤ today, `total_value` = SUM(item.total_value), financial close valuations are immutable once COMPLETED, valuation method must match company config |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/inventory-valuations` (GET, POST), `/api/v1/inventory-valuations/:id` (GET), `/api/v1/inventory-valuations/calculate` (POST — trigger calculation), `/api/v1/inventory-valuations/:id/items` (GET — line items), `/api/v1/inventory-valuations/by-method/:method` (GET), `/api/v1/inventory-valuations/financial-close` (POST — monthly close) |
| **UI** | Valuation List, Valuation Detail (with items grid), Valuation Method Configurator, FIFO Layer Viewer, Financial Close Wizard, Valuation Trend Charts |
| **Mobile** | View-only valuation summaries (L2+) |
| **Reports** | Inventory Valuation Report (per Ch 15 §15.4), FIFO Layer Report, Valuation Method Comparison, Monthly Valuation Trend, Variance Analysis |
| **Audit** | Full; financial close valuations are immutable (per Ch 18 §18.14); hash-chained for tamper-evidence |

### 13-16. Security / AI / Performance / Example

**Security**: `valuation_number`, `valuation_date`, `valuation_method` = Internal; `total_value`, `unit_cost`, `avg_cost`, `variance_*` = Confidential.

**AI**: Cost Optimization AI (identifies cost reduction opportunities), Valuation Trend AI (predicts future valuation), FIFO Optimization AI (recommends optimal stock rotation).

**Performance**: Calculations run as async BullMQ job (per Ch 11 Q4); < 5 min for full company valuation; Redis cache TTL 1 hour for completed valuations.

```json
{
  "header": {
    "id": "01928f7a-...-val-001",
    "code": "VAL-2026-000007",
    "company_id": "01928f7a-...-company",
    "facility_id": null,
    "valuation_number": "VAL-2026-000007",
    "valuation_date": "2026-07-07",
    "valuation_type": "DAILY",
    "valuation_method": "FIFO",
    "total_quantity": 1247.5000,
    "total_value": 487325.0000,
    "currency_code": "INR",
    "total_items": 145,
    "total_batches": 23,
    "fifo_layers_count": 38,
    "variance_from_last": 12500.0000,
    "variance_pct": 2.63,
    "calculated_at": "2026-07-07T23:30:00Z",
    "calculation_duration_ms": 145000,
    "is_financial_close": false,
    "is_snapshot": true,
    "status": "COMPLETED",
    "version": 1
  },
  "items": [
    {
      "id": "01928f7a-...-val-item-001",
      "valuation_id": "01928f7a-...-val-001",
      "product_id": "01928f7a-...-prod-kaju-katli-500",
      "batch_id": "01928f7a-...-batch-001",
      "warehouse_id": "01928f7a-...-wh-fg-01",
      "location_id": "01928f7a-...-bin-fg-01-01",
      "quantity": 42.5000,
      "uom_id": "01928f7a-...-uom-kg",
      "unit_cost": 580.0000,
      "total_value": 24650.0000,
      "fifo_layer": 1,
      "fifo_age_days": 0
    }
  ]
}
```

---

## Entity 030 — Inventory Snapshot

### 1. Business Purpose

The `InventorySnapshot` entity records **point-in-time inventory state** — a complete picture of all inventory at a specific moment. Per Volume 0 Chapter 15 §15.3 and Q83, snapshots are used for:

- **Daily snapshots** — operational tracking, trend analysis
- **Weekly snapshots** — management reporting
- **Monthly snapshots** — financial close (immutable per Q83)
- **Quarterly snapshots** — strategic review
- **Ad-hoc snapshots** — pre/post major operations (e.g., before physical count)

Snapshots enable:
- Historical trend analysis ("inventory value over last 12 months")
- Period-over-period comparison (WoW, MoM, YoY)
- Financial close (snapshot is immutable record of month-end stock)
- Audit trail (what was the stock on date X?)
- AI training data (historical patterns for forecasting)

### Snapshot vs. Ledger

| Aspect | Inventory Ledger | Inventory Snapshot |
|---|---|---|
| Granularity | Per movement | Per product+batch+location at point in time |
| Volume | Very high (millions/year) | Low-medium (1 snapshot/day × items) |
| Use case | Traceability, audit | Trend analysis, financial close |
| Mutability | Immutable | Immutable (especially financial close) |
| Retention | Permanent | Permanent (financial close); 7 years (operational) |

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Finance Head (financial close) / L2 — Inventory Head (operational) |
| Data Owner | Finance Head |
| Technical Owner | Backend Lead — Inventory Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `inventory_snapshots` (header) + `inventory_snapshot_items` (line items) |
| Prisma Models | `InventorySnapshot`, `InventorySnapshotItem` |
| Pattern | Header-line |
| Partitioning | Monthly by `snapshot_date` |

### 4. Field Dictionary

#### 4.1 Snapshot Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `SNAP-` | Snapshot number |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | FK to facilities; NULL = company-wide | Facility scope |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `snapshot_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `snapshot_date` | DATE | Yes | — | ≤ today | "As of" date | Internal |
| `snapshot_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Exact snapshot timestamp | Internal |
| `snapshot_type` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, FINANCIAL_CLOSE, PRE_COUNT, POST_COUNT, ADHOC | Snapshot type | Internal |
| `warehouse_id` | UUID | No | NULL | FK to `facilities.id`; NULL = all warehouses | Warehouse scope | Internal |
| `total_skus` | INTEGER | Yes | `0` | ≥ 0 | Number of SKUs in snapshot | Internal |
| `total_batches` | INTEGER | Yes | `0` | ≥ 0 | Number of batches | Internal |
| `total_locations` | INTEGER | Yes | `0` | ≥ 0 | Number of locations with stock | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | — | Total quantity across all items | Internal |
| `total_value` | DECIMAL(18,4) | Yes | `0` | — | Total inventory value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `valuation_method` | ENUM | No | NULL | FIFO, LIFO, WEIGHTED_AVG, STANDARD_COST, SPECIFIC | Valuation method used | Confidential |
| `is_financial_close` | BOOLEAN | Yes | `false` | — | If true, immutable financial close snapshot | Confidential |
| `variance_from_last` | DECIMAL(18,4) | No | NULL | — | Value variance from previous snapshot | Confidential |
| `variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance percentage | Confidential |
| `generated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When snapshot was generated | Internal |
| `generation_duration_ms` | INTEGER | No | NULL | ≥ 0 | Generation time | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Snapshot Items (Line Items)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `snapshot_id` | UUID | Yes | — | FK to `inventory_snapshots.id` | Parent snapshot | — |
| `inventory_master_id` | UUID | Yes | — | FK to `inventory_master.id` | Source inventory | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` | Warehouse | Internal |
| `location_id` | UUID | Yes | — | FK to `locations.id` | Location | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | — | Quantity at snapshot time | Internal |
| `available_qty` | DECIMAL(18,4) | Yes | — | — | Available quantity | Internal |
| `reserved_qty` | DECIMAL(18,4) | Yes | — | — | Reserved quantity | Internal |
| `allocated_qty` | DECIMAL(18,4) | Yes | — | — | Allocated quantity | Internal |
| `qc_hold_qty` | DECIMAL(18,4) | Yes | — | — | QC hold quantity | Internal |
| `blocked_qty` | DECIMAL(18,4) | Yes | — | — | Blocked quantity | Internal |
| `damaged_qty` | DECIMAL(18,4) | Yes | — | — | Damaged quantity | Internal |
| `expired_qty` | DECIMAL(18,4) | Yes | — | — | Expired quantity | Internal |
| `unit_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit cost | Confidential |
| `total_value` | DECIMAL(18,4) | Yes | — | Generated: `quantity * unit_cost` | Total value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `expiry_date` | DATE | No | NULL | — | Batch expiry (denormalized) | Public |
| `manufacturing_date` | DATE | No | NULL | — | Batch manufacturing date | Public |
| `stock_status` | ENUM | Yes | — | — | Stock status at snapshot | Internal |
| `abc_class` | ENUM | No | NULL | A, B, C | ABC class (denormalized) | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | InventorySnapshot → Company, Facility, Warehouse, UserAccount; InventorySnapshotItem → Snapshot, InventoryMaster, Product, Batch, Warehouse, Location, UOM |
| **Index** | `uq_snapshots_code_company`, `idx_snapshots_date_type`, `idx_snapshots_financial_close`, `idx_snap_items_snapshot`, `idx_snap_items_product`, `idx_snap_items_batch` |
| **Validation** | `code` unique per company, `snapshot_date` ≤ today, `total_value` = SUM(item.total_value), financial close snapshots immutable (DB trigger prevents UPDATE/DELETE), `quantity` = SUM of all bucket quantities |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/inventory-snapshots` (GET, POST), `/api/v1/inventory-snapshots/:id` (GET), `/api/v1/inventory-snapshots/:id/items` (GET), `/api/v1/inventory-snapshots/generate` (POST — trigger generation), `/api/v1/inventory-snapshots/financial-close` (POST — monthly close), `/api/v1/inventory-snapshots/trend` (GET — historical trend), `/api/v1/inventory-snapshots/compare` (GET — compare two snapshots) |
| **UI** | Snapshot List, Snapshot Detail (with items grid), Snapshot Trend Charts, Financial Close Wizard, Snapshot Comparison View |
| **Mobile** | View-only snapshot summaries (L2+) |
| **Reports** | Inventory Snapshot Report, Trend Analysis, Period-over-Period Comparison, Financial Close Report, Snapshot Variance Report |
| **Audit** | Full; financial close snapshots are immutable (per Ch 18 §18.14); hash-chained for tamper-evidence |

### 13-16. Security / AI / Performance / Example

**Security**: `snapshot_number`, `snapshot_date` = Public; quantities = Internal; `total_value`, `unit_cost`, `variance_*` = Confidential.

**AI**: Trend Analysis AI (predicts future inventory value), Seasonality AI (detects seasonal patterns), Anomaly Detection AI (flags unusual snapshots).

**Performance**: Snapshot generation runs as async BullMQ job (per Ch 11 Q4); < 5 min for full company snapshot; financial close snapshots archived to cold storage after 2 years (per Ch 10 Q4).

```json
{
  "header": {
    "id": "01928f7a-...-snap-001",
    "code": "SNAP-2026-000187",
    "company_id": "01928f7a-...-company",
    "facility_id": null,
    "snapshot_number": "SNAP-2026-000187",
    "snapshot_date": "2026-07-07",
    "snapshot_time": "2026-07-07T23:59:59Z",
    "snapshot_type": "DAILY",
    "total_skus": 145,
    "total_batches": 23,
    "total_locations": 480,
    "total_quantity": 1247.5000,
    "total_value": 487325.0000,
    "currency_code": "INR",
    "valuation_method": "FIFO",
    "is_financial_close": false,
    "variance_from_last": 12500.0000,
    "variance_pct": 2.63,
    "generated_at": "2026-07-07T23:30:00Z",
    "generation_duration_ms": 145000,
    "status": "COMPLETED",
    "version": 1
  },
  "items": [
    {
      "id": "01928f7a-...-snap-item-001",
      "snapshot_id": "01928f7a-...-snap-001",
      "inventory_master_id": "01928f7a-...-inv-001",
      "product_id": "01928f7a-...-prod-kaju-katli-500",
      "batch_id": "01928f7a-...-batch-001",
      "warehouse_id": "01928f7a-...-wh-fg-01",
      "location_id": "01928f7a-...-bin-fg-01-01",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity": 42.5000,
      "available_qty": 37.5000,
      "reserved_qty": 5.0000,
      "allocated_qty": 0.0000,
      "qc_hold_qty": 0.0000,
      "blocked_qty": 0.0000,
      "damaged_qty": 0.0000,
      "expired_qty": 0.0000,
      "unit_cost": 580.0000,
      "total_value": 24650.0000,
      "currency_code": "INR",
      "expiry_date": "2026-07-28",
      "manufacturing_date": "2026-07-07",
      "stock_status": "MIXED",
      "abc_class": "A"
    }
  ]
}
```

---

## Part 4 Completion Summary

**All 10 Inventory Domain entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| 021 Inventory Master | `21-inventory-master.md` | ✅ Complete |
| 022 Inventory Ledger | `22-inventory-ledger.md` | ✅ Complete (IMMUTABLE — most detailed) |
| 023 Batch Master | `23-batch-master.md` | ✅ Complete |
| 024 Stock Reservation | `24-25-26-reservation-allocation-status.md` | ✅ Complete |
| 025 Inventory Allocation | `24-25-26-reservation-allocation-status.md` | ✅ Complete |
| 026 Stock Status | `24-25-26-reservation-allocation-status.md` | ✅ Complete |
| 027 Inventory Adjustment | `27-28-29-30-adjustment-cyclecount-valuation-snapshot.md` | ✅ Complete |
| 028 Cycle Count | `27-28-29-30-adjustment-cyclecount-valuation-snapshot.md` | ✅ Complete |
| 029 Inventory Valuation | `27-28-29-30-adjustment-cyclecount-valuation-snapshot.md` | ✅ Complete |
| 030 Inventory Snapshot | `27-28-29-30-adjustment-cyclecount-valuation-snapshot.md` | ✅ Complete |

### Key Architectural Decisions in Part 4

1. **Ledger-first architecture** (per Ch 10 §10.5, Ch 26 §26.5) — Inventory Ledger is the immutable source of truth; Inventory Master is event-updated summary
2. **3-layer immutability enforcement** on ledger — DB REVOKE + DB trigger + application-layer
3. **Hash-chained ledger entries** (per Ch 18 Q106) — tamper-evident, daily verification
4. **Reversal pattern** (per Ch 10 §10.2) — corrections via compensating entries, never in-place edits
5. **Monthly partitioning** on ledger (per Ch 10 §10.11, Q3) — pg_partman auto-managed
6. **6 status buckets** in Inventory Master — available, reserved, allocated, qc_hold, blocked, damaged, expired, returned, scrapped, in_transit
7. **Batch vs Lot distinction** (per Ch 4 Commitment #11) — Batch = manufactured, Lot = procured; both stored separately
8. **Materialized path for genealogy** — `genealogy_path` on Batch for O(1) recall queries (per Ch 18 Q108)
9. **Two-stage stock commitment** — Reservation (soft) → Allocation (hard) → Consumption (ledger)
10. **ABC cycle counting** (per Q9) — A weekly, B monthly, C quarterly
11. **CAPA mandatory for high variances** — > 5% variance or > ₹10,000 value triggers CAPA (per Ch 18 §18.8)
12. **5 valuation methods** (per Ch 15 §15.4) — FIFO, LIFO, Weighted Avg, Standard Cost, Specific
13. **Snapshot immutability for financial close** — DB trigger prevents UPDATE/DELETE on financial close snapshots
14. **Outbox pattern** for event-driven updates — ledger write + summary update + event publish in same transaction (per Ch 3 §3.7)
15. **Nightly reconciliation** — compare Inventory Master vs. Ledger aggregates; drift = Critical alert (per Ch 10 Q1)
