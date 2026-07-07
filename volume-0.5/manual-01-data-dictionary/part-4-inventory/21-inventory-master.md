# Manual 1 · Part 4 · Entity 21 — Inventory Master

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 4 — Inventory Domain |
| Entity | Inventory Master (021) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 10 §10.5, Ch 10 Q1, Ch 26 §26.5 |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `InventoryMaster` entity is the **current state summary of inventory** — what's available, reserved, on-hold, etc., right now, at a specific location for a specific product+batch. It is **NOT the source of truth** (per Volume 0 Chapter 10 §10.5 — that's the Inventory Ledger). It is a **calculated operational table** maintained by event handlers that process ledger entries.

### Why It Exists (per Ch 10 Q1)

Without `InventoryMaster`, every query for "how much Kaju Katli 500g is in Bin A-01-02?" would require aggregating all ledger entries for that product+batch+location — potentially thousands of rows per query. With `InventoryMaster`, the answer is a single indexed lookup (< 10ms vs. 100ms+ for aggregation).

Per Volume 0 Chapter 10 Q1, `InventoryMaster` uses the **event-updated summary table pattern** (selected over materialized views and on-demand calculation):
- **Read-optimized**: Single row lookup, indexed
- **Write-coherent**: Updated in same DB transaction as ledger entry (atomic per Ch 10 Q1)
- **Reconciled**: Nightly job compares summary vs. ledger aggregates; drift = Critical alert
- **Mobile-friendly**: Mobile clients can read current stock without computing from ledger

### Architectural Rules (Locked)

| Rule | Enforcement |
|---|---|
| **Never edited manually** | Service-layer rejects direct writes; only event handlers can update |
| **Updated only from Inventory Ledger** | Each ledger entry triggers summary update in same transaction |
| **Negative stock configurable** | Per `product.negative_stock_allowed` (per Ch 5 §5.10, Part 4 §"Negative Stock") |
| **Every quantity must balance against ledger** | Nightly reconciliation job |
| **6 status buckets** | Available, Reserved, Allocated, QC Hold, Blocked, Damaged (per Part 4 §"Stock Status") |
| **Event-updated** | Not materialized view (per Ch 10 Q1 — materialized views can't be updated in same transaction) |

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Inventory Head |
| Data Owner | Inventory Head |
| Technical Owner | Backend Lead — Inventory Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `inventory_master` |
| Prisma Model | `InventoryMaster` |
| File Location | `prisma/schema/transactional/inventory/inventory_master.prisma` |
| Partitioning | None initially (medium volume — max ~1M rows); future hash partitioning by `warehouse_id` if > 50M |
| Update Pattern | **Event-updated summary** (per Ch 10 Q1) — updated by event handler on each ledger entry |
| Immutability | Mutable (this is the summary, not the source of truth) |

---

## 4. Field Dictionary

### 4.1 Identification Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK | Internal primary key | — | — |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company | Internal | — |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` | Facility | Internal | — |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Warehouse | Internal | — |
| `location_id` | UUID | Yes | — | FK to `locations.id` (BIN level) | Specific bin | Internal | — |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal | Demand AI |
| `batch_id` | UUID | Conditional | NULL | FK to `batches.id`; required if `product.batch_required = true` | Batch | Internal | Expiry AI |
| `lot_id` | UUID | No | NULL | FK to `lots.id` | Supplier lot (for procured materials) | Internal | — |

### 4.2 Quantity Buckets (per Part 4 §"Stock Status" — 6 buckets)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `available_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 (or < 0 if negative_stock_allowed) | **Available** for new reservations | Internal | Reorder AI |
| `reserved_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Reserved** for outbound ops (sales, production, transfer) — not yet allocated | Internal | — |
| `allocated_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Allocated** to specific picking/dispatch tasks | Internal | — |
| `qc_hold_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **QC Hold** — under inspection, cannot be used | Internal | — |
| `blocked_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Blocked** — quarantined, recalled, or manual hold | Internal | — |
| `damaged_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Damaged** — awaiting scrap/return | Internal | Waste AI |
| `expired_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Expired** — past expiry_date, awaiting disposal | Internal | Expiry AI |
| `in_transit_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **In Transit** — being transferred, not yet received | Internal | — |
| `returned_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Returned** — customer returns awaiting inspection | Internal | — |
| `scrapped_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | **Scrapped** — awaiting disposal/destruction | Internal | Waste AI |

### 4.3 Computed Quantities (Generated Columns)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `on_hand_qty` | DECIMAL(18,4) | Yes | — | Generated: `available_qty + reserved_qty + allocated_qty + qc_hold_qty + blocked_qty + damaged_qty + expired_qty + returned_qty + scrapped_qty` (excludes in_transit) | Total physical stock at this location | Internal |
| `total_qty` | DECIMAL(18,4) | Yes | — | Generated: `on_hand_qty + in_transit_qty` | Total stock including in-transit | Internal |
| `usable_qty` | DECIMAL(18,4) | Yes | — | Generated: `available_qty + reserved_qty + allocated_qty` | Stock that can be drawn from (available + committed) | Internal |
| `unavailable_qty` | DECIMAL(18,4) | Yes | — | Generated: `qc_hold_qty + blocked_qty + damaged_qty + expired_qty + returned_qty + scrapped_qty` | Stock not usable | Internal |

### 4.4 Status & Classification

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `stock_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, RESERVED, ALLOCATED, QC_HOLD, BLOCKED, DAMAGED, EXPIRED, RETURNED, SCRAPPED, MIXED | Primary status (MIXED if multiple buckets have qty > 0) | Internal |
| `is_empty` | BOOLEAN | Yes | `true` | Generated: `on_hand_qty = 0` | Whether location+product+batch has no stock | Public |
| `is_low_stock` | BOOLEAN | Yes | `false` | Generated: `available_qty ≤ product.reorder_point` (event-updated) | Low stock indicator | Internal |
| `is_negative` | BOOLEAN | Yes | `false` | Generated: `available_qty < 0` | Negative stock flag (rare, per Ch 15 §15.10) | Internal |

### 4.5 Batch-Specific Fields (when batch_id is set)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `expiry_date` | DATE | No | NULL | From batch.expiry_date (denormalized) | Expiry date (per Part 4 §"Expiry Control") | Public | Expiry AI |
| `manufacturing_date` | DATE | No | NULL | From batch.manufacturing_date | Manufacturing date | Public | — |
| `shelf_life_remaining_days` | INTEGER | No | NULL | Generated: `expiry_date - CURRENT_DATE` | Days to expiry | Internal | Expiry AI |
| `is_near_expiry` | BOOLEAN | Yes | `false` | Generated: `shelf_life_remaining_days ≤ near_expiry_threshold` (per product config) | Near-expiry flag | Internal | — |
| `is_expired` | BOOLEAN | Yes | `false` | Generated: `CURRENT_DATE > expiry_date` | Expired flag | Internal | — |
| `qc_status` | ENUM | No | NULL | From batch.qc_status | QC status (denormalized) | Confidential | — |
| `recall_status` | ENUM | No | NULL | From batch.recall_status | Recall status (denormalized) | Confidential | — |

### 4.6 UOM & Cost

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `uom_id` | UUID | Yes | — | FK to `uoms.id`; must equal product.base_uom_id | UOM for all quantity fields | Internal |
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Current unit cost (per valuation method, per Ch 15 §15.4) | Confidential |
| `total_value` | DECIMAL(18,4) | No | NULL | Generated: `on_hand_qty * unit_cost` | Total inventory value at this location | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Cost currency | Internal |
| `valuation_method` | ENUM | No | NULL | FIFO, LIFO, WEIGHTED_AVG, STANDARD_COST, SPECIFIC; NULL = inherit from product | Valuation method | Confidential |

### 4.7 Movement Tracking (Denormalized)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `last_movement_at` | TIMESTAMPTZ | No | NULL | From latest ledger entry | Last inventory movement timestamp | Internal |
| `last_movement_type` | ENUM | No | NULL | From latest ledger entry | Last movement type | Internal |
| `last_movement_id` | UUID | No | NULL | FK to `inventory_ledger.id` | Reference to latest ledger entry | Internal |
| `last_received_at` | TIMESTAMPTZ | No | NULL | From latest RECEIPT/PRODUCTION_IN/TRANSFER_IN entry | Last received timestamp | Internal |
| `last_issued_at` | TIMESTAMPTZ | No | NULL | From latest ISSUE/PRODUCTION_OUT/TRANSFER_OUT entry | Last issued timestamp | Internal |
| `last_counted_at` | TIMESTAMPTZ | No | NULL | From latest cycle count | Last cycle count timestamp | Internal |
| `last_counted_by` | UUID | No | NULL | FK to `user_accounts.id` | Who last counted | Internal |
| `last_count_variance` | DECIMAL(18,4) | No | NULL | — | Last count variance (expected - actual) | Internal |

### 4.8 Reservation & Allocation Tracking

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `active_reservation_count` | INTEGER | Yes | `0` | ≥ 0 | Number of active reservations against this stock | Internal |
| `active_allocation_count` | INTEGER | Yes | `0` | ≥ 0 | Number of active allocations | Internal |
| `reserved_until` | TIMESTAMPTZ | No | NULL | — | Earliest reservation expiry | Internal |

### 4.9 Universal Base Fields (Modified — no `code` field needed)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE (for empty/disabled combos) | Operational status (not lifecycle) |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | First stock arrival (when first ledger entry created this row) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update on every ledger entry | Last update timestamp |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator (typically the actor of first ledger entry) |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last updater (typically actor of latest ledger entry) |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete (rare — used only when location+product+batch combo permanently invalid) |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency (per Ch 4 §4.4) | Increments on each update |

**Note**: `InventoryMaster` does NOT have a `code` field (it's a summary, not a master entity with business code).

### 4.10 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields for location+product+batch-specific attributes | Internal |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal |

---

## 5. Relationships

### 5.1 Inbound Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| InventoryMaster → Company | N : 1 | inbound | `company_id` | RESTRICT | Cannot delete company with inventory |
| InventoryMaster → Facility | N : 1 | inbound | `facility_id` | RESTRICT | Cannot delete facility with inventory |
| InventoryMaster → Facility (warehouse) | N : 1 | inbound | `warehouse_id` | RESTRICT | Cannot delete warehouse with inventory |
| InventoryMaster → Location (bin) | N : 1 | inbound | `location_id` | CASCADE | Summary deleted with location (but ledger retained) |
| InventoryMaster → Product | N : 1 | inbound | `product_id` | RESTRICT | Cannot delete product with inventory |
| InventoryMaster → Batch | N : 1 | inbound | `batch_id` | CASCADE | Summary deleted with batch (but ledger retained) |
| InventoryMaster → Lot | N : 1 | inbound | `lot_id` | SET NULL | Lot reference cleared |
| InventoryMaster → UOM | N : 1 | inbound | `uom_id` | RESTRICT | Cannot delete UOM used in inventory |

### 5.2 Derived Relationship (Not FK — Computed)

| Relationship | Cardinality | Direction | Notes |
|---|---|---|---|
| InventoryMaster → InventoryLedger | N : 1 (derived) | Computed: `inventory_master` is the **aggregation** of `inventory_ledger` entries for this product+batch+location combo |

### 5.3 Outbound Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade |
|---|---|---|---|---|
| InventoryMaster → StockReservation | 1 : N | outbound | `stock_reservations.inventory_master_id` | SET NULL |
| InventoryMaster → InventoryAllocation | 1 : N | outbound | `inventory_allocations.inventory_master_id` | SET NULL |
| InventoryMaster → CycleCountItem | 1 : N | outbound | `cycle_count_items.inventory_master_id` | SET NULL |
| InventoryMaster → InventorySnapshot | 1 : N | outbound | `inventory_snapshots.inventory_master_id` | SET NULL |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_inventory_master` | PRIMARY KEY | `id` | Default PK |
| `uq_inv_master_loc_prod_batch` | UNIQUE | `location_id, product_id, COALESCE(batch_id, '00000000-0000-0000-0000-000000000000')` | **Critical**: One summary row per location+product+batch combo |
| `idx_inv_master_product` | B-TREE | `product_id, warehouse_id` | Find all stock for a product |
| `idx_inv_master_warehouse` | B-TREE | `warehouse_id, location_id` | Warehouse stock overview |
| `idx_inv_master_batch` | B-TREE | `batch_id WHERE batch_id IS NOT NULL` | Find stock by batch |
| `idx_inv_master_status` | B-TREE | `stock_status, warehouse_id` | Filter by status |
| `idx_inv_master_low_stock` | PARTIAL | `product_id, warehouse_id WHERE is_low_stock = true` | Low stock report (per Ch 5 §5.16) |
| `idx_inv_master_near_expiry` | PARTIAL | `expiry_date WHERE is_near_expiry = true` | Near-expiry report |
| `idx_inv_master_expired` | PARTIAL | `expiry_date WHERE is_expired = true` | Expired stock report |
| `idx_inv_master_empty` | PARTIAL | `location_id WHERE is_empty = true` | Find empty bins (putaway optimization) |
| `idx_inv_master_negative` | PARTIAL | `product_id, location_id WHERE is_negative = true` | Negative stock alerts (per Ch 15 §15.10) |
| `idx_inv_master_recall` | PARTIAL | `batch_id WHERE recall_status != 'NOT_RECALLED'` | Recalled stock lookup |
| `idx_inv_master_updated` | B-TREE | `updated_at DESC` | Recent changes / sync |
| `idx_inv_master_expiry_fefo` | B-TREE | `product_id, warehouse_id, expiry_date ASC WHERE stock_status IN ('AVAILABLE', 'RESERVED', 'ALLOCATED') AND available_qty > 0` | FEFO picking optimization (per Ch 5 §5.16) |

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | Unique combo: `(location_id, product_id, batch_id)` — one summary row per combo | DB | Unique constraint |
| 2 | All quantity fields ≥ 0 (except `available_qty` if `product.negative_stock_allowed = true`) | DB | CHECK constraint |
| 3 | `on_hand_qty` must equal sum of physical buckets (available + reserved + allocated + qc_hold + blocked + damaged + expired + returned + scrapped) | DB | Generated column |
| 4 | `uom_id` must equal `product.base_uom_id` | App | Service-layer validation |
| 5 | `batch_id` required if `product.batch_required = true` | App | Service-layer validation |
| 6 | `location_id` must be BIN-level (not Zone/Aisle/Rack/Shelf) | App | Service-layer validation |
| 7 | `warehouse_id` must be a WAREHOUSE-type facility | App | Service-layer validation |
| 8 | `expiry_date` must match `batch.expiry_date` (denormalized — must stay in sync) | App | Event handler enforces on batch update |
| 9 | **Never updated manually** — only via event handler processing ledger entries | App | Service-layer rejects direct writes from non-event-handler code |
| 10 | `version` increments on every update (optimistic concurrency per Ch 4 §4.4) | App | Prisma middleware |
| 11 | `stock_status` auto-computed: if multiple buckets > 0, status = MIXED; else status = the bucket with qty > 0 | App | Trigger or service-layer |
| 12 | `is_low_stock` recomputed when `available_qty` changes OR when `product.reorder_point` changes | App | Event-driven |
| 13 | `is_near_expiry` and `is_expired` recomputed daily by scheduled job | App | Scheduler Service |
| 14 | `total_value` recomputed when `on_hand_qty` OR `unit_cost` changes | App | Trigger |
| 15 | Reconciliation: nightly job compares `on_hand_qty` vs `SUM(quantity_delta)` from ledger for same combo; drift = Critical alert | App | Scheduler Service |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission | Notes |
|---|---|---|---|---|
| `/api/v1/inventory` | GET | List inventory summaries | `INVENTORY:VIEW` | Paginated, filtered by product/warehouse/location/status |
| `/api/v1/inventory/:id` | GET | Get inventory summary | `INVENTORY:VIEW` | Single record |
| `/api/v1/inventory/by-product/:productId` | GET | Get inventory for a product | `INVENTORY:VIEW` | Across all locations |
| `/api/v1/inventory/by-batch/:batchId` | GET | Get inventory for a batch | `INVENTORY:VIEW` | Across all locations |
| `/api/v1/inventory/by-location/:locationId` | GET | Get inventory at a location | `INVENTORY:VIEW` | All products at a bin |
| `/api/v1/inventory/by-warehouse/:warehouseId` | GET | Get warehouse inventory | `INVENTORY:VIEW` | All stock in warehouse |
| `/api/v1/inventory/low-stock` | GET | Get low-stock items | `INVENTORY:VIEW` | Per Ch 5 §5.16 reorder engine |
| `/api/v1/inventory/near-expiry` | GET | Get near-expiry items | `INVENTORY:VIEW` | Per Ch 5 §5.16 |
| `/api/v1/inventory/expired` | GET | Get expired items | `INVENTORY:VIEW` | For disposal workflow |
| `/api/v1/inventory/recalled` | GET | Get recalled stock | `INVENTORY:VIEW` | For recall workflow |
| `/api/v1/inventory/negative` | GET | Get negative stock items | `INVENTORY:VIEW` | Per Ch 15 §15.10 |
| `/api/v1/inventory/valuation` | GET | Get inventory valuation | `INVENTORY:VIEW` + Finance scope | Per Ch 15 §15.4 |
| `/api/v1/inventory/reconcile` | POST | Trigger reconciliation | `IT:ADMIN` | Compares summary vs ledger |
| `/api/v1/inventory/fefo-suggest` | POST | Get FEFO picking suggestion | `WAREHOUSE:VIEW` | Per Ch 5 §5.16 |
| `/api/v1/inventory/movements-summary` | GET | Get movement summary | `INVENTORY:VIEW` | Aggregated from ledger |

**Note**: There is **NO POST/PATCH/DELETE** endpoint for direct inventory_master manipulation. All updates happen internally via ledger event handlers.

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Inventory List | AG Grid with multi-filter (product, warehouse, location, status, batch) | `/inventory` |
| Inventory Detail | Single record detail with movement history | `/inventory/:id` |
| Inventory by Product | All stock for a product across locations | `/inventory/products/:id` |
| Inventory by Batch | All stock for a batch | `/inventory/batches/:id` |
| Inventory by Location | All stock at a bin (with bin map) | `/warehouse/locations/:id/inventory` |
| Warehouse Stock Overview | Warehouse-level stock summary | `/warehouse/:id/inventory` |
| Low Stock Dashboard | Items below reorder point | `/inventory/low-stock` |
| Near-Expiry Dashboard | Items approaching expiry | `/inventory/near-expiry` |
| Expired Stock Dashboard | Items past expiry | `/inventory/expired` |
| Negative Stock Report | Items with negative stock | `/inventory/negative` |
| Inventory Valuation Report | Stock value by warehouse/category | `/inventory/valuation` |
| Inventory Heatmap | Visual heatmap by bin utilization | `/warehouse/:id/heatmap` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Inventory lookup by barcode scan | Scan product → see stock across locations |
| Inventory at location | Scan bin → see all stock at that bin |
| Low stock alerts | Push notifications for low stock items |
| Near-expiry alerts | Push notifications for near-expiry stock |
| Recall alerts | Push notifications for recalled stock |
| Inventory count entry | Mobile cycle count entry (writes to cycle_count, not directly to inventory_master) |
| Stock transfer | Mobile-initiated transfer (creates ledger entries) |

---

## 11. Reports

| Report | Use of Inventory Master |
|---|---|
| Stock Summary Report | Current stock by product/warehouse/location (per Ch 15 §15.3) |
| Low Stock Report | Items below reorder point |
| Near-Expiry Report | Items approaching expiry (configurable threshold) |
| Expired Stock Report | Items past expiry |
| Inventory Valuation Report | Stock value by warehouse/category (per Ch 15 §15.4) |
| Inventory Turnover Report | Combine with ledger for turnover analysis |
| Slow-Moving Stock Report | Items with no recent movement (combine with ledger) |
| Dead Stock Report | Items with no movement in N days |
| Stock Status Report | Items by status (available/reserved/blocked/etc.) |
| Negative Stock Report | Items with negative available_qty |
| Recalled Stock Report | Items in recalled batches |
| ABC Analysis Report | Items by ABC class + value |
| Batch Aging Report | Stock by batch age |
| Warehouse Utilization Report | Stock by warehouse + bin utilization |
| Cold Chain Stock Report | Cold chain items with temperature compliance |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE (auto, on first ledger entry for combo) | Yes (via ledger entry audit) | N/A | Permanent (via ledger) |
| UPDATE (auto, on each ledger entry) | Yes (via ledger entry audit) | N/A | Permanent (via ledger) |
| MANUAL UPDATE | ❌ **NOT ALLOWED** | N/A | N/A |
| DELETE (soft — rare) | Yes | **Mandatory** | Permanent |
| EXPORT | Yes | **Mandatory** | 7 years |

**Audit Level**: Indirect — `InventoryMaster` changes are audited via the `InventoryLedger` entries that trigger them. The ledger IS the audit trail (per Entity 022).

**Reconciliation Audit**: Nightly reconciliation results logged in `audit_log` with drift details (if any).

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `product_id`, `batch_id`, `location_id`, `warehouse_id`, `available_qty`, `on_hand_qty`, `is_empty`, `expiry_date`, `is_expired` | Internal | L2+ Inventory, Warehouse, Manufacturing |
| `reserved_qty`, `allocated_qty`, `active_reservation_count` | Internal | L2+ Inventory, Sales |
| `qc_hold_qty`, `qc_status`, `recall_status` | Confidential | L2+ Quality |
| `blocked_qty`, `damaged_qty`, `expired_qty`, `returned_qty`, `scrapped_qty` | Internal | L2+ Inventory, Quality |
| `unit_cost`, `total_value`, `valuation_method` | Confidential | L2+ Finance |
| `last_counted_at`, `last_counted_by`, `last_count_variance` | Internal | L2+ Inventory, Audit |

**Multi-tenant isolation**: Auto-filtered by `company_id` (per Ch 6 §6.9). Facility isolation auto-filtered by `facility_id` per user scope.

---

## 14. AI Relevance

`InventoryMaster` is the **primary real-time data source for inventory AI**.

| AI Capability | Usage |
|---|---|
| **Reorder Prediction AI** | Uses `available_qty` vs `product.reorder_point` |
| **Demand Forecast AI** | Uses `available_qty` + historical ledger for demand prediction |
| **Inventory Optimization AI** | Analyzes `available_qty` patterns for reorder point optimization |
| **Expiry Prediction AI** | Uses `expiry_date`, `shelf_life_remaining_days`, `available_qty` to predict expiry risk |
| **Stock Health Score AI** | Computes health score from status buckets + age + movement |
| **Inventory Risk Analysis AI** | Identifies stockout/overstock risk from `available_qty` trends |
| **ABC Classification AI** | Uses `total_value` + movement velocity for ABC classification |
| **Purchase Recommendation AI** | Recommends POs based on `available_qty` + reorder point + lead time |
| **Slow-Moving Analysis AI** | Identifies items with high `on_hand_qty` but low movement |
| **Waste Prediction AI** | Predicts which `available_qty` will become `expired_qty` or `damaged_qty` |
| **Warehouse Optimization AI** | Analyzes `available_qty` distribution for bin optimization |
| **FEFO Picking AI** | Uses `expiry_date` for pick path optimization (per Ch 5 §5.16) |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| **Row count** | Medium-high — ~1M rows at scale (one per active location+product+batch combo) |
| **Cache strategy** | Redis cache, TTL 5 min (shorter — quantities change frequently); low-stock + near-expiry lists cached separately with 1-min TTL |
| **Hot path: stock lookup** | Single-row indexed lookup by `(location_id, product_id, batch_id)` < 10ms per Ch 26 Q150 |
| **Hot path: product stock** | Indexed by `product_id, warehouse_id` — returns all stock for a product in a warehouse |
| **Hot path: FEFO picking** | `idx_inv_master_expiry_fefo` partial index — fast FEFO lookup |
| **Hot path: low stock** | `idx_inv_master_low_stock` partial index — fast low-stock report |
| **Updates** | Event-updated in same transaction as ledger entry (per Ch 10 Q1); < 10ms per update |
| **Reconciliation** | Nightly job — compares `on_hand_qty` vs `SUM(quantity_delta)` from ledger; runs in < 30 min for 1M rows |
| **Denormalized fields** | `expiry_date`, `qc_status`, `recall_status` updated by event handler when batch changes |
| **Aggregations** | For dashboards, use pre-aggregated daily/hourly summary tables (per Ch 15 Q82) — not direct aggregation of `inventory_master` |
| **N+1 prevention** | Eager-load `product`, `batch`, `location` when listing |

### Event-Updated Summary Pattern (per Ch 10 Q1)

```typescript
// On each ledger entry, in same DB transaction:
async function processLedgerEntry(entry: InventoryLedger): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Insert ledger entry (immutable — per Entity 022)
    await tx.inventoryLedger.create({ data: entry });
    
    // 2. Update inventory_master summary (event-updated)
    const statusBucket = mapMovementTypeToBucket(entry.movement_type);
    await tx.inventoryMaster.upsert({
      where: { 
        location_id_product_id_batch_id: {
          location_id: entry.location_id,
          product_id: entry.product_id,
          batch_id: entry.batch_id,
        }
      },
      create: {
        // First entry for this combo — create summary
        company_id: entry.company_id,
        facility_id: entry.facility_id,
        warehouse_id: entry.warehouse_id,
        location_id: entry.location_id,
        product_id: entry.product_id,
        batch_id: entry.batch_id,
        lot_id: entry.lot_id,
        uom_id: entry.uom_id,
        [`${statusBucket}_qty`]: Math.abs(entry.quantity_delta),
        available_qty: entry.quantity_delta, // signed
        on_hand_qty: entry.quantity_delta,
        expiry_date: await getBatchExpiry(entry.batch_id),
        // ... other denormalized fields
        last_movement_at: entry.transaction_time,
        last_movement_type: entry.movement_type,
        last_movement_id: entry.id,
        version: 1,
      },
      update: {
        // Subsequent entries — update existing summary
        available_qty: { increment: entry.quantity_delta },
        [`${statusBucket}_qty`]: entry.quantity_delta > 0 
          ? { increment: Math.abs(entry.quantity_delta) }
          : { decrement: Math.abs(entry.quantity_delta) },
        last_movement_at: entry.transaction_time,
        last_movement_type: entry.movement_type,
        last_movement_id: entry.id,
        version: { increment: 1 },
      }
    });
    
    // 3. Write to outbox for event publication
    await tx.domainEventOutbox.create({ ... });
  });
}
```

### Reconciliation Job (Nightly)

```sql
-- Compare inventory_master.on_hand_qty vs SUM(ledger.quantity_delta)
SELECT 
  im.location_id, im.product_id, im.batch_id,
  im.on_hand_qty AS summary_qty,
  COALESCE(SUM(il.quantity_delta), 0) AS ledger_qty,
  im.on_hand_qty - COALESCE(SUM(il.quantity_delta), 0) AS drift
FROM inventory_master im
LEFT JOIN inventory_ledger il ON il.location_id = im.location_id 
                              AND il.product_id = im.product_id
                              AND (il.batch_id = im.batch_id OR (il.batch_id IS NULL AND im.batch_id IS NULL))
GROUP BY im.location_id, im.product_id, im.batch_id, im.on_hand_qty
HAVING im.on_hand_qty != COALESCE(SUM(il.quantity_delta), 0);
-- Any drift → Critical alert + auto-freeze affected bins
```

---

## 16. Example Records

### Example 1: Kaju Katli 500g — Available Stock

```json
{
  "id": "01928f7a-...-inv-001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "lot_id": null,
  "available_qty": 37.5000,
  "reserved_qty": 5.0000,
  "allocated_qty": 0.0000,
  "qc_hold_qty": 0.0000,
  "blocked_qty": 0.0000,
  "damaged_qty": 0.0000,
  "expired_qty": 0.0000,
  "in_transit_qty": 0.0000,
  "returned_qty": 0.0000,
  "scrapped_qty": 0.0000,
  "on_hand_qty": 42.5000,
  "total_qty": 42.5000,
  "usable_qty": 42.5000,
  "unavailable_qty": 0.0000,
  "stock_status": "MIXED",
  "is_empty": false,
  "is_low_stock": false,
  "is_negative": false,
  "expiry_date": "2026-07-28",
  "manufacturing_date": "2026-07-07",
  "shelf_life_remaining_days": 21,
  "is_near_expiry": false,
  "is_expired": false,
  "qc_status": "PASSED",
  "recall_status": "NOT_RECALLED",
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 580.0000,
  "total_value": 24650.0000,
  "currency_code": "INR",
  "valuation_method": "FIFO",
  "last_movement_at": "2026-07-07T14:30:00Z",
  "last_movement_type": "TRANSFER_OUT",
  "last_movement_id": "01928f7a-...-ledger-003",
  "last_received_at": "2026-07-07T11:30:00Z",
  "last_issued_at": "2026-07-07T14:30:00Z",
  "last_counted_at": "2026-07-05T10:00:00Z",
  "last_counted_by": "01928f7a-...-user-counter",
  "last_count_variance": 0.0000,
  "active_reservation_count": 1,
  "active_allocation_count": 0,
  "reserved_until": "2026-07-08T18:00:00Z",
  "status": "ACTIVE",
  "version": 5,
  "tags": ["premium", "festive-stock"]
}
```

### Example 2: Sugar Raw Material — High Volume

```json
{
  "id": "01928f7a-...-inv-002",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_id": "01928f7a-...-bin-rm-01-01",
  "product_id": "01928f7a-...-prod-sugar",
  "batch_id": "01928f7a-...-batch-002",
  "lot_id": "01928f7a-...-lot-sugar-042",
  "available_qty": 300.0000,
  "reserved_qty": 50.0000,
  "allocated_qty": 0.0000,
  "qc_hold_qty": 0.0000,
  "blocked_qty": 0.0000,
  "damaged_qty": 0.0000,
  "expired_qty": 0.0000,
  "in_transit_qty": 0.0000,
  "returned_qty": 0.0000,
  "scrapped_qty": 0.0000,
  "on_hand_qty": 350.0000,
  "total_qty": 350.0000,
  "usable_qty": 350.0000,
  "unavailable_qty": 0.0000,
  "stock_status": "MIXED",
  "is_empty": false,
  "is_low_stock": false,
  "is_negative": false,
  "expiry_date": "2028-07-05",
  "shelf_life_remaining_days": 728,
  "is_near_expiry": false,
  "is_expired": false,
  "qc_status": "PASSED",
  "recall_status": "NOT_RECALLED",
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 47.5000,
  "total_value": 16625.0000,
  "currency_code": "INR",
  "valuation_method": "WEIGHTED_AVG",
  "active_reservation_count": 2,
  "status": "ACTIVE",
  "version": 8
}
```

### Example 3: Cold Chain Item — Near Expiry

```json
{
  "id": "01928f7a-...-inv-003",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-cs-01",
  "location_id": "01928f7a-...-bin-cs-01-05",
  "product_id": "01928f7a-...-prod-gulab-jamun-500",
  "batch_id": "01928f7a-...-batch-003",
  "available_qty": 18.5000,
  "reserved_qty": 10.0000,
  "allocated_qty": 0.0000,
  "qc_hold_qty": 0.0000,
  "blocked_qty": 0.0000,
  "damaged_qty": 0.0000,
  "expired_qty": 0.0000,
  "in_transit_qty": 0.0000,
  "returned_qty": 0.0000,
  "scrapped_qty": 0.0000,
  "on_hand_qty": 28.5000,
  "stock_status": "MIXED",
  "is_empty": false,
  "is_low_stock": false,
  "is_negative": false,
  "expiry_date": "2026-07-14",
  "manufacturing_date": "2026-07-07",
  "shelf_life_remaining_days": 7,
  "is_near_expiry": true,
  "is_expired": false,
  "requires_cold_chain": true,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 290.0000,
  "total_value": 8265.0000,
  "active_reservation_count": 1,
  "status": "ACTIVE",
  "version": 3,
  "tags": ["cold-chain", "perishable", "near-expiry", "priority"]
}
```

### Example 4: Recalled Stock — Blocked

```json
{
  "id": "01928f7a-...-inv-004",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-12",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-004",
  "available_qty": 0.0000,
  "reserved_qty": 0.0000,
  "allocated_qty": 0.0000,
  "qc_hold_qty": 0.0000,
  "blocked_qty": 25.0000,
  "damaged_qty": 0.0000,
  "expired_qty": 0.0000,
  "in_transit_qty": 0.0000,
  "returned_qty": 0.0000,
  "scrapped_qty": 0.0000,
  "on_hand_qty": 25.0000,
  "stock_status": "BLOCKED",
  "is_empty": false,
  "is_low_stock": false,
  "expiry_date": "2026-07-11",
  "shelf_life_remaining_days": 4,
  "is_near_expiry": true,
  "is_expired": false,
  "qc_status": "FAILED",
  "recall_status": "RECALL_IN_PROGRESS",
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 580.0000,
  "total_value": 14500.0000,
  "status": "ACTIVE",
  "version": 8,
  "tags": ["recalled", "blocked", "complaint", "high-priority"]
}
```

### Example 5: Empty Bin (No Stock)

```json
{
  "id": "01928f7a-...-inv-005",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_id": "01928f7a-...-bin-rm-01-20",
  "product_id": "01928f7a-...-prod-flour",
  "batch_id": "01928f7a-...-batch-006",
  "available_qty": 0.0000,
  "reserved_qty": 0.0000,
  "allocated_qty": 0.0000,
  "qc_hold_qty": 0.0000,
  "blocked_qty": 0.0000,
  "damaged_qty": 0.0000,
  "expired_qty": 0.0000,
  "in_transit_qty": 0.0000,
  "returned_qty": 0.0000,
  "scrapped_qty": 0.0000,
  "on_hand_qty": 0.0000,
  "stock_status": "AVAILABLE",
  "is_empty": true,
  "is_low_stock": true,
  "is_negative": false,
  "uom_id": "01928f7a-...-uom-kg",
  "unit_cost": 35.0000,
  "total_value": 0.0000,
  "status": "ACTIVE",
  "version": 1,
  "tags": ["empty", "available-for-putaway"]
}
```

### Example 6: Negative Stock (Rare — if allowed)

```json
{
  "id": "01928f7a-...-inv-006",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-08",
  "product_id": "01928f7a-...-prod-bhujia-200",
  "batch_id": "01928f7a-...-batch-007",
  "available_qty": -5.0000,
  "reserved_qty": 0.0000,
  "allocated_qty": 0.0000,
  "qc_hold_qty": 0.0000,
  "blocked_qty": 0.0000,
  "damaged_qty": 0.0000,
  "expired_qty": 0.0000,
  "on_hand_qty": -5.0000,
  "stock_status": "AVAILABLE",
  "is_empty": false,
  "is_low_stock": true,
  "is_negative": true,
  "uom_id": "01928f7a-...-uom-kg",
  "last_movement_at": "2026-07-07T16:00:00Z",
  "last_movement_type": "ISSUE",
  "status": "ACTIVE",
  "version": 12,
  "tags": ["negative-stock", "investigation-required"]
}
```
