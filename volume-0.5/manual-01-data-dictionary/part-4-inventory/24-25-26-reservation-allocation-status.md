# Manual 1 · Part 4 · Entities 24, 25, 26 — Stock Commitment Layer (Reservation, Allocation, Stock Status)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 4 — Inventory Domain |
| Entities | Stock Reservation (024), Inventory Allocation (025), Stock Status (026) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Stock Commitment Architecture

The Stock Commitment Layer manages how available stock is **reserved** for future operations and **allocated** to specific tasks. This is critical for:

- **Sales orders** — reserve stock when order placed, allocate when picking starts
- **Production orders** — reserve ingredients when order planned, allocate when issued
- **Stock transfers** — reserve at source, allocate when picking
- **Restaurant orders** — reserve ingredients for KOT, allocate when kitchen prep starts

### Commitment Lifecycle

```
1. AVAILABLE (in inventory_master.available_qty)
        ↓ Reserve
2. RESERVED (in inventory_master.reserved_qty) — StockReservation entity
        ↓ Allocate
3. ALLOCATED (in inventory_master.allocated_qty) — InventoryAllocation entity
        ↓ Pick/Issue
4. CONSUMED (ledger entry — quantity removed from stock entirely)
```

### Why Two Stages (Reservation vs Allocation)?

- **Reservation** = "soft commit" — stock set aside for a future operation, but still physically at the location. Can be cancelled without physical movement.
- **Allocation** = "hard commit" — stock assigned to a specific picking/dispatch task. Physical movement is imminent.

Example: Customer places order for 5kg Kaju Katli → 5kg moves from `available` to `reserved` (Reservation). When warehouse starts picking → 5kg moves from `reserved` to `allocated` (Allocation). When picked + dispatched → 5kg removed from stock entirely (Ledger entry).

---

## Entity 024 — Stock Reservation

### 1. Business Purpose

The `StockReservation` entity represents a **soft commitment of stock** for a future operation. Stock is reserved when:
- Sales order is placed (before picking)
- Production order is planned (before material issue)
- Stock transfer is requested (before picking)
- Restaurant KOT is generated (before kitchen prep)

Reservation moves stock from `available_qty` to `reserved_qty` in `inventory_master`. The stock is still physically at the location but unavailable for new reservations.

### Reservation Lifecycle

```
ACTIVE (stock reserved, awaiting allocation)
   ↓ Allocate
PARTIALLY_ALLOCATED (some stock allocated, some still reserved)
   ↓ Fully allocate
FULLY_ALLOCATED (all reserved stock now allocated)
   ↓ Pick/Issue
CONSUMED (stock issued — reservation closed)
   ↓ Or cancel
CANCELLED (reservation cancelled, stock returned to available)
   ↓ Or expire
EXPIRED (reservation passed expiry date, stock returned to available)
```

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
| Table Name | `stock_reservations` |
| Prisma Model | `StockReservation` |
| File Location | `prisma/schema/transactional/inventory/stock_reservation.prisma` |
| Partitioning | None initially; future monthly partitioning by `created_at` if > 1M |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `RSV-` | Reservation number (e.g., `RSV-2026-000001`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities | Facility |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, PARTIALLY_ALLOCATED, FULLY_ALLOCATED, CONSUMED, EXPIRED, CANCELLED | Reservation lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Reservation-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `reservation_number` | VARCHAR(50) | Yes | — | Unique per company, human-readable | Display number (same as code) | Public | — |
| `inventory_master_id` | UUID | Yes | — | FK to `inventory_master.id` | The stock being reserved | Internal | — |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product (denormalized from inventory_master) | Internal | — |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch (denormalized) | Internal | — |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` | Warehouse (denormalized) | Internal | — |
| `location_id` | UUID | Yes | — | FK to `locations.id` | Location (denormalized) | Internal | — |
| `reserved_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity reserved (in base UOM) | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal | — |
| `allocated_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0, ≤ reserved_quantity | Quantity allocated to picking tasks | Internal | — |
| `consumed_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0, ≤ reserved_quantity | Quantity actually consumed (issued) | Internal | — |
| `remaining_quantity` | DECIMAL(18,4) | No | — | Generated: `reserved_quantity - allocated_quantity - consumed_quantity` | Quantity still reserved (not allocated/consumed) | Internal | — |
| `reservation_type` | ENUM | Yes | — | SALES_ORDER, PRODUCTION_ORDER, STOCK_TRANSFER, KOT, CUSTOMER_HOLD, QUALITY_HOLD, OTHER | What the reservation is for | Internal | — |
| `source_document_type` | VARCHAR(30) | Yes | — | SALES_ORDER, PRODUCTION_ORDER, STOCK_TRANSFER, KOT, etc. | Source document type | Internal | — |
| `source_document_id` | UUID | Yes | — | FK to source document | Source document ID | Internal | — |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number | Internal | — |
| `customer_id` | UUID | No | NULL | FK to `customers.id`; set if reservation_type = SALES_ORDER | Customer (for sales orders) | Confidential | — |
| `priority` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Reservation priority (affects allocation order) | Internal | — |
| `reserved_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When reservation was created | Internal | — |
| `reserved_by` | UUID | Yes | — | FK to `user_accounts.id` | Who created the reservation | Internal | — |
| `required_by` | TIMESTAMPTZ | No | NULL | — | When the stock is needed (drives allocation priority) | Internal | Allocation AI |
| `expires_at` | TIMESTAMPTZ | Yes | — | > reserved_at | When reservation expires (auto-cancel, return stock to available) | Internal | — |
| `expired_at` | TIMESTAMPTZ | No | NULL | — | Actual expiry timestamp | Internal | — |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation timestamp | Internal | — |
| `cancelled_by` | UUID | No | NULL | FK to `user_accounts.id` | Who cancelled | Internal | — |
| `cancellation_reason` | VARCHAR(200) | No | NULL | Required if status = CANCELLED | Cancellation reason | Internal | — |
| `consumed_at` | TIMESTAMPTZ | No | NULL | — | When fully consumed | Internal | — |
| `auto_release_enabled` | BOOLEAN | Yes | `true` | — | If true, auto-release on expiry | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| StockReservation → Company | N : 1 | `company_id` | RESTRICT |
| StockReservation → Facility | N : 1 | `facility_id` | RESTRICT |
| StockReservation → InventoryMaster | N : 1 | `inventory_master_id` | SET NULL |
| StockReservation → Product | N : 1 | `product_id` | RESTRICT |
| StockReservation → Batch | N : 1 | `batch_id` | SET NULL |
| StockReservation → Warehouse (Facility) | N : 1 | `warehouse_id` | RESTRICT |
| StockReservation → Location | N : 1 | `location_id` | RESTRICT |
| StockReservation → UOM | N : 1 | `uom_id` | RESTRICT |
| StockReservation → Customer | N : 1 | `customer_id` | SET NULL |
| StockReservation → UserAccount (reserved_by) | N : 1 | `reserved_by` | RESTRICT |
| StockReservation → UserAccount (cancelled_by) | N : 1 | `cancelled_by` | SET NULL |
| StockReservation → InventoryAllocation | 1 : N | `inventory_allocations.reservation_id` | CASCADE |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_stock_reservations` | PK | `id` |
| `uq_reservations_code_company` | UNIQUE | `company_id, code` |
| `idx_reservations_status` | B-TREE | `status, expires_at` |
| `idx_reservations_inventory` | B-TREE | `inventory_master_id, status` |
| `idx_reservations_product` | B-TREE | `product_id, status` |
| `idx_reservations_batch` | B-TREE | `batch_id, status` |
| `idx_reservations_source` | B-TREE | `source_document_type, source_document_id` |
| `idx_reservations_customer` | B-TREE | `customer_id, status WHERE customer_id IS NOT NULL` |
| `idx_reservations_expiring` | PARTIAL | `expires_at WHERE status = 'ACTIVE' AND expires_at < NOW() + INTERVAL '1 hour'` |
| `idx_reservations_priority` | B-TREE | `priority, required_by WHERE status IN ('ACTIVE', 'PARTIALLY_ALLOCATED')` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `reserved_quantity` > 0 | DB CHECK |
| 3 | `allocated_quantity` ≤ `reserved_quantity` | DB CHECK |
| 4 | `consumed_quantity` ≤ `reserved_quantity` | DB CHECK |
| 5 | `allocated_quantity + consumed_quantity` ≤ `reserved_quantity` | DB CHECK |
| 6 | `expires_at` > `reserved_at` | DB CHECK |
| 7 | `uom_id` must equal `inventory_master.uom_id` | App |
| 8 | Cannot reserve more than `inventory_master.available_qty` (unless negative_stock_allowed) | App |
| 9 | `cancellation_reason` required if status = CANCELLED | DB CHECK |
| 10 | On create: increment `inventory_master.reserved_qty`, decrement `inventory_master.available_qty` (same transaction) | App |
| 11 | On cancel/expire: decrement `inventory_master.reserved_qty`, increment `inventory_master.available_qty` (same transaction) | App |
| 12 | On consume: decrement `inventory_master.reserved_qty` (or allocated_qty), write ledger entry, decrement `inventory_master.on_hand_qty` (same transaction) | App |
| 13 | Status transitions: ACTIVE → PARTIALLY_ALLOCATED → FULLY_ALLOCATED → CONSUMED (or CANCELLED / EXPIRED at any point) | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/stock-reservations` (GET, POST), `/api/v1/stock-reservations/:id` (GET, PATCH), `/api/v1/stock-reservations/:id/cancel` (POST), `/api/v1/stock-reservations/:id/extend` (POST — extend expiry), `/api/v1/stock-reservations/by-source` (GET), `/api/v1/stock-reservations/expiring` (GET) |
| **UI** | Reservation List, Reservation Detail (with allocations + consumption), Reservation Create Form, Expiring Reservations Dashboard |
| **Mobile** | View reservations for a batch/product, cancel reservation (L3+), reservation alerts |
| **Reports** | Active Reservations Report, Expiring Reservations, Reservation by Customer/Product/Source, Reservation Aging |
| **Audit** | Full; mandatory reason for cancellation, expiry override, quantity change |

### 13-16. Security / AI / Performance / Example

**Security**: `reservation_number`, `product_id`, `reserved_quantity` = Internal; `customer_id` = Confidential; `priority`, `required_by` = Internal.

**AI**: Allocation AI (prioritizes reservations for allocation), Expiry Prediction AI (predicts which reservations will expire unused), Demand Forecast AI (uses reservation patterns).

**Performance**: < 100k per company; Redis cache TTL 5 min; expiring reservations checked every minute by Scheduler Service.

```json
{
  "id": "01928f7a-...-rsv-001",
  "code": "RSV-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "reservation_number": "RSV-2026-000001",
  "inventory_master_id": "01928f7a-...-inv-001",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "reserved_quantity": 5.0000,
  "allocated_quantity": 0.0000,
  "consumed_quantity": 0.0000,
  "remaining_quantity": 5.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "reservation_type": "SALES_ORDER",
  "source_document_type": "SALES_ORDER",
  "source_document_id": "01928f7a-...-so-001",
  "source_document_number": "SO-2026-000123",
  "customer_id": "01928f7a-...-customer-001",
  "priority": "HIGH",
  "reserved_at": "2026-07-07T10:00:00Z",
  "reserved_by": "01928f7a-...-user-sales-clerk",
  "required_by": "2026-07-08T18:00:00Z",
  "expires_at": "2026-07-08T18:00:00Z",
  "auto_release_enabled": true,
  "status": "ACTIVE",
  "version": 1
}
```

---

## Entity 025 — Inventory Allocation

### 1. Business Purpose

The `InventoryAllocation` entity represents a **hard commitment of stock** to a specific picking/dispatch task. When a reservation is allocated, the stock is assigned to a picker and a picking task is created.

Allocation moves stock from `reserved_qty` to `allocated_qty` in `inventory_master`. The stock is still physically at the location but is now assigned to a specific task.

### Allocation Lifecycle

```
CREATED (allocation created, picking task generated)
   ↓ Pick starts
IN_PROGRESS (picker is picking the stock)
   ↓ Pick complete
PICKED (stock picked, awaiting dispatch)
   ↓ Dispatch
DISPATCHED (stock left the location — ledger entry written)
   ↓ Or cancel
CANCELLED (allocation cancelled, stock returned to reserved)
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
| Table Name | `inventory_allocations` |
| Prisma Model | `InventoryAllocation` |
| File Location | `prisma/schema/transactional/inventory/inventory_allocation.prisma` |

### 4. Field Dictionary

#### 4.1 Universal Base + Allocation-Specific

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `ALLOC-` | Allocation number |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities | Facility |
| `status` | ENUM | Yes | `CREATED` | CREATED, IN_PROGRESS, PICKED, DISPATCHED, CANCELLED, SHORT_PICKED | Allocation lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `allocation_number` | VARCHAR(50) | Yes | — | Human-readable | Display number |
| `reservation_id` | UUID | Yes | — | FK to `stock_reservations.id` | Parent reservation |
| `inventory_master_id` | UUID | Yes | — | FK to `inventory_master.id` | Stock being allocated |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product (denormalized) |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch (denormalized) |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` | Warehouse |
| `location_id` | UUID | Yes | — | FK to `locations.id` | Pick-from location |
| `allocated_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity allocated | Internal |
| `picked_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity actually picked | Internal |
| `short_pick_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity not picked (shortage) | Internal |
| `dispatched_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity dispatched | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `allocation_type` | ENUM | Yes | — | SALES_PICK, PRODUCTION_ISSUE, TRANSFER_PICK, KOT_PICK, OTHER | Allocation type | Internal |
| `picking_task_id` | UUID | No | NULL | FK to `picking_tasks.id` | Associated picking task | Internal |
| `picker_user_id` | UUID | No | NULL | FK to `user_accounts.id` | Assigned picker | Internal |
| `source_document_type` | VARCHAR(30) | Yes | — | — | Source document type | Internal |
| `source_document_id` | UUID | Yes | — | FK to source | Source document ID | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Allocation priority | Internal |
| `allocated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When allocated | Internal |
| `allocated_by` | UUID | Yes | — | FK to `user_accounts.id` | Who allocated | Internal |
| `pick_started_at` | TIMESTAMPTZ | No | NULL | — | When picking started | Internal |
| `picked_at` | TIMESTAMPTZ | No | NULL | — | When picking completed | Internal |
| `dispatched_at` | TIMESTAMPTZ | No | NULL | — | When dispatched | Internal |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation timestamp | Internal |
| `cancellation_reason` | VARCHAR(200) | No | NULL | Required if status = CANCELLED | Cancellation reason | Internal |
| `short_pick_reason` | VARCHAR(200) | No | NULL | Required if short_pick_quantity > 0 | Reason for short pick | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| InventoryAllocation → StockReservation | N : 1 | `reservation_id` | CASCADE |
| InventoryAllocation → InventoryMaster | N : 1 | `inventory_master_id` | SET NULL |
| InventoryAllocation → PickingTask | N : 1 | `picking_task_id` | SET NULL |
| InventoryAllocation → Product, Batch, Warehouse, Location, UOM, UserAccount | N : 1 each | various | RESTRICT/SET NULL |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_inventory_allocations` | PK | `id` |
| `uq_allocations_code_company` | UNIQUE | `company_id, code` |
| `idx_allocations_status` | B-TREE | `status, allocated_at DESC` |
| `idx_allocations_reservation` | B-TREE | `reservation_id` |
| `idx_allocations_inventory` | B-TREE | `inventory_master_id` |
| `idx_allocations_picker` | B-TREE | `picker_user_id, status WHERE status IN ('CREATED', 'IN_PROGRESS')` |
| `idx_allocations_source` | B-TREE | `source_document_type, source_document_id` |
| `idx_allocations_priority` | B-TREE | `priority, allocated_at WHERE status = 'CREATED'` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `allocated_quantity` > 0 | DB CHECK |
| 3 | `picked_quantity` ≤ `allocated_quantity` | DB CHECK |
| 4 | `dispatched_quantity` ≤ `picked_quantity` | DB CHECK |
| 5 | `short_pick_quantity` = `allocated_quantity - picked_quantity` | App |
| 6 | `cancellation_reason` required if status = CANCELLED | DB CHECK |
| 7 | `short_pick_reason` required if `short_pick_quantity > 0` | DB CHECK |
| 8 | On create: decrement `inventory_master.reserved_qty`, increment `inventory_master.allocated_qty` | App |
| 9 | On dispatch: decrement `inventory_master.allocated_qty` + `inventory_master.on_hand_qty`, write ledger entry | App |
| 10 | On cancel: decrement `inventory_master.allocated_qty`, increment `inventory_master.reserved_qty` | App |
| 11 | Status transitions: CREATED → IN_PROGRESS → PICKED → DISPATCHED (or CANCELLED / SHORT_PICKED) | App |
| 12 | `allocated_quantity` ≤ `reservation.remaining_quantity` | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/inventory-allocations` (GET, POST), `/api/v1/inventory-allocations/:id` (GET, PATCH), `/api/v1/inventory-allocations/:id/start-pick` (POST), `/api/v1/inventory-allocations/:id/complete-pick` (POST), `/api/v1/inventory-allocations/:id/dispatch` (POST), `/api/v1/inventory-allocations/:id/cancel` (POST), `/api/v1/inventory-allocations/by-picker/:userId` (GET) |
| **UI** | Allocation List, Allocation Detail (with picking task + dispatch), Picker Assignment Board, Short Pick Report |
| **Mobile** | Picker's task list (allocations assigned to user), pick confirmation with barcode scan, short pick entry, dispatch confirmation |
| **Reports** | Active Allocations, Picker Productivity, Short Pick Analysis, Allocation Aging, Dispatch Performance |
| **Audit** | Full; mandatory reason for cancellation, short pick, quantity change |

### 13-16. Security / AI / Performance / Example

**Security**: All fields Internal except `allocation_number` (Public).

**AI**: Picking Optimization AI (optimizes pick path across allocations), Picker Assignment AI (assigns allocations to optimal picker), Short Pick Prediction AI (predicts short picks based on inventory accuracy).

**Performance**: < 200k per company; Redis cache TTL 5 min.

```json
{
  "id": "01928f7a-...-alloc-001",
  "code": "ALLOC-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "allocation_number": "ALLOC-2026-000001",
  "reservation_id": "01928f7a-...-rsv-001",
  "inventory_master_id": "01928f7a-...-inv-001",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_id": "01928f7a-...-bin-fg-01-01",
  "allocated_quantity": 5.0000,
  "picked_quantity": 0.0000,
  "short_pick_quantity": 0.0000,
  "dispatched_quantity": 0.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "allocation_type": "SALES_PICK",
  "picking_task_id": "01928f7a-...-pick-task-001",
  "picker_user_id": "01928f7a-...-user-picker-001",
  "source_document_type": "SALES_ORDER",
  "source_document_id": "01928f7a-...-so-001",
  "source_document_number": "SO-2026-000123",
  "priority": "HIGH",
  "allocated_at": "2026-07-07T11:00:00Z",
  "allocated_by": "01928f7a-...-user-warehouse-mgr",
  "status": "IN_PROGRESS",
  "pick_started_at": "2026-07-07T11:15:00Z",
  "version": 2
}
```

---

## Entity 026 — Stock Status

### 1. Business Purpose

The `StockStatus` entity is a **reference data entity** (not transactional) that defines the **canonical list of stock status values** and their business meaning. While `inventory_master.stock_status` is an enum field, the `StockStatus` entity provides:

- Canonical status definitions
- Status transitions rules (which statuses can transition to which)
- Status-specific behaviors (e.g., BLOCKED stock cannot be picked)
- Color codes for UI display
- Default reasons for each status

This is a **closed enum** — the statuses are seeded at deployment and cannot be added to without an ADR (per Ch 25 §25.3).

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
| Schema | `master` |
| Table Name | `stock_statuses` |
| Prisma Model | `StockStatus` |
| File Location | `prisma/schema/master/inventory/stock_status.prisma` |
| Lifecycle | Seeded at deployment; not user-creatable |

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique globally, UPPER_SNAKE_CASE | Status code (e.g., `AVAILABLE`, `RESERVED`) |
| `name` | VARCHAR(50) | Yes | — | Unique | Display name | Public |
| `description` | TEXT | No | NULL | — | Detailed description | Internal |
| `status_category` | ENUM | Yes | — | AVAILABLE, COMMITTED, UNAVAILABLE, DISPOSED | High-level category | Internal |
| `is_pickable` | BOOLEAN | Yes | `false` | — | If true, stock in this status can be picked | Internal |
| `is_reservable` | BOOLEAN | Yes | `false` | — | If true, stock in this status can be reserved | Internal |
| `is_sellable` | BOOLEAN | Yes | `false` | — | If true, stock in this status can be sold | Internal |
| `is_producible` | BOOLEAN | Yes | `false` | — | If true, stock can be used in production | Internal |
| `is_transferable` | BOOLEAN | Yes | `false` | — | If true, stock can be transferred | Internal |
| `is_counted_in_inventory` | BOOLEAN | Yes | `true` | — | If true, counts toward on_hand_qty | Internal |
| `is_counted_in_valuation` | BOOLEAN | Yes | `true` | — | If true, counts toward inventory valuation | Internal |
| `color_code` | VARCHAR(7) | Yes | — | Hex color | UI color | Public |
| `icon_name` | VARCHAR(50) | No | NULL | — | Icon identifier | Public |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `default_reason_code` | VARCHAR(50) | No | NULL | FK to `stock_reason_codes.code` | Default reason for entering this status | Internal |
| `is_seed_status` | BOOLEAN | Yes | `true` | — | If true, seeded at deployment (cannot be deleted) | Internal |
| `allowed_transitions` | TEXT[] | No | NULL | Array of status codes this can transition to | Allowed next statuses | Internal |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| StockStatus → StockReasonCode | N : 1 | `default_reason_code` | SET NULL |
| StockStatus → InventoryMaster | 1 : N | `inventory_master.stock_status` (enum, not FK) | — |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_stock_statuses` | PK | `id` |
| `uq_stock_statuses_code` | UNIQUE | `code` |
| `idx_stock_statuses_category` | B-TREE | `status_category, display_order` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique globally | DB |
| 2 | `name` unique globally | DB |
| 3 | `is_seed_status = true` statuses cannot be deleted | App |
| 4 | `code` is immutable for seed statuses | App |
| 5 | `allowed_transitions` must reference valid status codes | App |
| 6 | At least one of `is_pickable`/`is_reservable`/`is_sellable`/`is_producible`/`is_transferable` should be true (except for terminal statuses like SCRAPPED) | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/stock-statuses` (GET), `/api/v1/stock-statuses/:code` (GET) — read-only (no POST/PATCH/DELETE for seed statuses) |
| **UI** | Status reference table in admin settings, status legend on inventory screens |
| **Mobile** | Status badge rendering (color + icon) |
| **Reports** | Stock Status Distribution Report |
| **Audit** | Full for non-seed status changes (rare) |

### 13-16. Security / AI / Performance / Example

**Security**: All fields Public or Internal (reference data).

**AI**: Status Prediction AI (predicts status transitions), Stock Health Score AI (uses status distribution).

**Performance**: < 20 rows (seeded); Redis cache TTL 24 hours.

#### Seeded Stock Statuses

```json
[
  {
    "id": "01928f7a-...-ss-available",
    "code": "AVAILABLE",
    "name": "Available",
    "description": "Stock available for any operation — reservation, allocation, picking, selling, production, transfer",
    "status_category": "AVAILABLE",
    "is_pickable": true,
    "is_reservable": true,
    "is_sellable": true,
    "is_producible": true,
    "is_transferable": true,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": true,
    "color_code": "#10B981",
    "icon_name": "check-circle",
    "display_order": 10,
    "allowed_transitions": ["RESERVED", "ALLOCATED", "QC_HOLD", "BLOCKED", "DAMAGED", "EXPIRED", "RETURNED", "SCRAPPED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-reserved",
    "code": "RESERVED",
    "name": "Reserved",
    "description": "Stock reserved for a future operation (sales order, production order, transfer). Still physically at location.",
    "status_category": "COMMITTED",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": true,
    "color_code": "#3B82F6",
    "icon_name": "lock",
    "display_order": 20,
    "allowed_transitions": ["AVAILABLE", "ALLOCATED", "CANCELLED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-allocated",
    "code": "ALLOCATED",
    "name": "Allocated",
    "description": "Stock allocated to a specific picking/dispatch task. Physical movement imminent.",
    "status_category": "COMMITTED",
    "is_pickable": true,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": true,
    "color_code": "#8B5CF6",
    "icon_name": "package",
    "display_order": 30,
    "allowed_transitions": ["AVAILABLE", "DISPATCHED", "CANCELLED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-qc-hold",
    "code": "QC_HOLD",
    "name": "QC Hold",
    "description": "Stock under quality control inspection. Cannot be used until released.",
    "status_category": "UNAVAILABLE",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": true,
    "color_code": "#F59E0B",
    "icon_name": "shield",
    "display_order": 40,
    "allowed_transitions": ["AVAILABLE", "BLOCKED", "SCRAPPED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-blocked",
    "code": "BLOCKED",
    "name": "Blocked",
    "description": "Stock blocked — quarantined, recalled, or manual hold. Cannot be used.",
    "status_category": "UNAVAILABLE",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": true,
    "color_code": "#EF4444",
    "icon_name": "ban",
    "display_order": 50,
    "allowed_transitions": ["AVAILABLE", "SCRAPPED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-damaged",
    "code": "DAMAGED",
    "name": "Damaged",
    "description": "Stock damaged — awaiting scrap or return to supplier.",
    "status_category": "UNAVAILABLE",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": false,
    "color_code": "#DC2626",
    "icon_name": "alert-triangle",
    "display_order": 60,
    "allowed_transitions": ["SCRAPPED", "RETURNED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-expired",
    "code": "EXPIRED",
    "name": "Expired",
    "description": "Stock past expiry date — awaiting disposal.",
    "status_category": "UNAVAILABLE",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": false,
    "color_code": "#6B7280",
    "icon_name": "clock",
    "display_order": 70,
    "allowed_transitions": ["SCRAPPED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-returned",
    "code": "RETURNED",
    "name": "Returned",
    "description": "Customer return — awaiting inspection before restocking or scrap.",
    "status_category": "UNAVAILABLE",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": false,
    "color_code": "#F97316",
    "icon_name": "rotate-ccw",
    "display_order": 80,
    "allowed_transitions": ["AVAILABLE", "DAMAGED", "SCRAPPED"],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-scrapped",
    "code": "SCRAPPED",
    "name": "Scrapped",
    "description": "Stock scrapped — awaiting destruction/disposal.",
    "status_category": "DISPOSED",
    "is_pickable": false,
    "is_reservable": false,
    "is_sellable": false,
    "is_producible": false,
    "is_transferable": false,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": false,
    "color_code": "#000000",
    "icon_name": "trash",
    "display_order": 90,
    "allowed_transitions": [],
    "is_seed_status": true
  },
  {
    "id": "01928f7a-...-ss-mixed",
    "code": "MIXED",
    "name": "Mixed",
    "description": "Multiple status buckets have quantity > 0 (computed status, not a real status).",
    "status_category": "AVAILABLE",
    "is_pickable": true,
    "is_reservable": true,
    "is_sellable": true,
    "is_producible": true,
    "is_transferable": true,
    "is_counted_in_inventory": true,
    "is_counted_in_valuation": true,
    "color_code": "#6366F1",
    "icon_name": "layers",
    "display_order": 100,
    "allowed_transitions": [],
    "is_seed_status": true
  }
]
```
