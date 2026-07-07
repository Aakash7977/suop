# Manual 1 · Part 6 · Entity 49 — Warehouse Movement

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 6 — Warehouse Management Domain (WMS) |
| Entity | Warehouse Movement (049) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 10 §10.6, Ch 17 §17.2, Part 6 §"Warehouse Movement" |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `WarehouseMovement` entity tracks **every physical movement of goods within or across warehouses**. Per Volume 0 Chapter 10 §10.6, this is one of the 8 enterprise ledgers — specifically the **Warehouse Ledger**. Per Part 6, every movement is:

- **Barcode-driven** — every movement requires barcode scan validation (per Ch 17 §17.8)
- **Auditable** — every movement is permanently recorded (per Ch 18 §18.14)
- **Inventory Ledger integration** — every completed movement writes to `inventory_ledger` (per Ch 10 §10.5)
- **Event-publishing** — every movement publishes domain events (per Ch 3 §3.7)

### Distinction: Warehouse Movement vs. Inventory Ledger

| Aspect | Warehouse Movement (049) | Inventory Ledger (022) |
|---|---|---|
| **Focus** | Physical movement execution | Financial/stock accounting |
| **Granularity** | Per movement task (putaway, pick, transfer) | Per stock-impacting transaction |
| **Volume** | Higher (every scan creates a movement) | Lower (only stock-impacting events) |
| **Use case** | Warehouse operations, operator tracking, path optimization | Stock accuracy, valuation, traceability |
| **Relationship** | Warehouse Movement → triggers → Inventory Ledger entry | Independent source of truth |

**Example**: A putaway task involves 3 scans (scan product, scan batch, scan bin). The Warehouse Movement records all 3 scans + operator + timestamps. The Inventory Ledger records 1 entry (the stock movement from receiving to bin).

### Movement Types (per Part 6)

| Movement Type | Description | Inventory Impact |
|---|---|---|
| **PUTAWAY** | Move from receiving to storage bin | RECEIPT ledger entry |
| **PICKING** | Move from storage to dispatch/packing | ISSUE ledger entry |
| **TRANSFER** | Move between bins within warehouse | TRANSFER_OUT + TRANSFER_IN |
| **REPLENISHMENT** | Move from reserve to picking face | TRANSFER_OUT + TRANSFER_IN |
| **RELOCATION** | Move within same warehouse (reslotting) | TRANSFER_OUT + TRANSFER_IN |
| **RETURNS** | Move from returns area to storage or scrap | RETURN ledger entry |
| **CYCLE_COUNT** | Movement for counting (no physical move) | ADJUSTMENT (if variance) |
| **DISPATCH** | Move from warehouse to vehicle | ISSUE ledger entry |
| **RECEIVING** | Move from vehicle to receiving area | RECEIPT ledger entry |
| **CROSS_DOCK** | Receive → immediately dispatch (no putaway) | RECEIPT + ISSUE |
| **SCRAP** | Move to scrap area | SCRAP ledger entry |

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Warehouse Head |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Warehouse Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `warehouse_movements` |
| Prisma Model | `WarehouseMovement` |
| File Location | `prisma/schema/transactional/warehouse/warehouse_movement.prisma` |
| **Partitioning** | **Monthly by `movement_date`** (per Part 6 Performance Strategy) — high volume table |
| Immutability | Mutable during execution (DRAFT → IN_PROGRESS); immutable after COMPLETED |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `WM-` | Movement code (e.g., `WM-2026-000001`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` | Facility |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Warehouse |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, IN_PROGRESS, COMPLETED, CANCELLED, FAILED | Movement lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator (system or user) |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete (rare) |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Movement Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `movement_number` | VARCHAR(50) | Yes | — | Unique per company, format `WM-{YEAR}-{SEQ}` | Display number | Public | — |
| `movement_date` | DATE | Yes | `CURRENT_DATE` | — | Movement date (for partitioning) | Internal | — |
| `movement_type` | ENUM | Yes | — | PUTAWAY, PICKING, TRANSFER, REPLENISHMENT, RELOCATION, RETURNS, CYCLE_COUNT, DISPATCH, RECEIVING, CROSS_DOCK, SCRAP | Movement type (per Part 6) | Internal | Movement analytics |
| `movement_category` | ENUM | Yes | — | INBOUND, OUTBOUND, INTERNAL | High-level category | Internal | — |
| `movement_origin` | ENUM | Yes | `MANUAL` | MANUAL, TASK_DRIVEN, AUTO_REPLENISHMENT, AUTO_RESLOT, SYSTEM | How movement was initiated | Internal | — |
| `is_barcode_validated` | BOOLEAN | Yes | `false` | — | Whether barcode validation passed (per Ch 17 §17.8) | Internal | — |
| `barcode_scan_count` | INTEGER | Yes | `0` | ≥ 0 | Number of barcode scans in this movement | Internal | Scan analytics |
| `is_offline_created` | BOOLEAN | Yes | `false` | — | Created offline (mobile, per Ch 11 Q3) | Internal | — |
| `sync_id` | UUID | No | NULL | — | Offline sync correlation ID | Internal | — |

#### 4.3 Source & Destination (Locations)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `source_warehouse_id` | UUID | No | NULL | FK to `facilities.id` (WAREHOUSE) | Source warehouse (for inter-warehouse) | Internal |
| `source_location_id` | UUID | No | NULL | FK to `locations.id` (BIN) | Source bin | Internal |
| `source_location_code` | VARCHAR(200) | No | NULL | Denormalized | Source complete location code | Internal |
| `source_zone_id` | UUID | No | NULL | FK to `locations.id` (ZONE) | Source zone (denormalized) | Internal |
| `destination_warehouse_id` | UUID | No | NULL | FK to `facilities.id` (WAREHOUSE) | Destination warehouse | Internal |
| `destination_location_id` | UUID | Yes | — | FK to `locations.id` (BIN) | Destination bin | Internal |
| `destination_location_code` | VARCHAR(200) | No | NULL | Denormalized | Destination complete location code | Internal |
| `destination_zone_id` | UUID | No | NULL | FK to `locations.id` (ZONE) | Destination zone (denormalized) | Internal |
| `is_inter_warehouse` | BOOLEAN | Yes | `false` | Generated: `source_warehouse_id != destination_warehouse_id` | Inter-warehouse movement | Internal |
| `is_inter_zone` | BOOLEAN | Yes | `false` | Generated: `source_zone_id != destination_zone_id` | Inter-zone movement | Internal |

#### 4.4 Product & Batch

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `product_id` | UUID | Yes | — | FK to `products.id` | Product being moved | Internal | — |
| `batch_id` | UUID | No | NULL | FK to `batches.id`; required if `product.batch_required = true` | Batch | Internal | — |
| `batch_number` | VARCHAR(50) | No | NULL | Denormalized | Batch number (for quick display) | Public | — |
| `lot_id` | UUID | No | NULL | FK to `lots.id` | Supplier lot | Internal | — |
| `inventory_master_id` | UUID | No | NULL | FK to `inventory_master.id` | Source inventory record | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal | — |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity moved | Internal | — |
| `quantity_uom` | DECIMAL(18,4) | No | NULL | — | Quantity in alternate UOM (if applicable) | Internal | — |

#### 4.5 Operator & Device

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Operator who performed movement | Internal |
| `operator_name` | VARCHAR(150) | No | NULL | Denormalized | Operator name | Internal |
| `device_id` | VARCHAR(100) | No | NULL | — | Device used (per Ch 6 §6.17) | Internal |
| `device_type` | ENUM | No | NULL | MOBILE, TABLET, HANDHELD_SCANNER, DESKTOP, AGV, ROBOT | Device type | Internal |
| `scanner_id` | VARCHAR(100) | No | NULL | — | Scanner ID (if barcode scanner used) | Internal |
| `ip_address` | VARCHAR(45) | No | NULL | — | Source IP (if desktop) | Confidential |
| `session_id` | UUID | No | NULL | — | User session | Internal |

#### 4.6 Task Reference

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `warehouse_task_id` | UUID | No | NULL | FK to `warehouse_tasks.id` | Associated warehouse task (if task-driven) | Internal |
| `task_number` | VARCHAR(50) | No | NULL | Denormalized | Task number | Internal |
| `source_document_type` | VARCHAR(30) | No | NULL | GRN, STOCK_TRANSFER, PRODUCTION_ORDER, SALES_ORDER, etc. | Source document | Internal |
| `source_document_id` | UUID | No | NULL | FK to source | Source document ID | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number | Internal |

#### 4.7 Timestamps

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `movement_date` | DATE | Yes | `CURRENT_DATE` | — | Movement date | Internal | — |
| `started_at` | TIMESTAMPTZ | No | NULL | — | When movement started (first scan) | Internal | Productivity AI |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | When movement completed | Internal | — |
| `duration_seconds` | INTEGER | No | NULL | ≥ 0; Generated: `completed_at - started_at` | Duration in seconds | Internal | Productivity AI |
| `travel_distance_m` | DECIMAL(10,2) | No | NULL | ≥ 0 | Travel distance (source to destination) | Internal | Path optimization AI |
| `estimated_duration_sec` | INTEGER | No | NULL | ≥ 0 | AI-estimated duration | Internal | — |

#### 4.8 Inventory Ledger Integration

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger.id` | Inventory ledger entry created by this movement | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Multiple ledger entries (for transfers: TRANSFER_OUT + TRANSFER_IN) | Internal |
| `is_ledger_written` | BOOLEAN | Yes | `false` | — | Whether ledger entry written | Internal |

#### 4.9 Barcode Scan Details

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `barcode_scans` | JSONB | No | `'[]'::JSONB` | — | Array of barcode scan events: `[{ scan_type, barcode_value, scanned_at, result }]` | Internal |
| `first_scan_at` | TIMESTAMPTZ | No | NULL | — | First barcode scan timestamp | Internal |
| `last_scan_at` | TIMESTAMPTZ | No | NULL | — | Last barcode scan timestamp | Internal |
| `scan_failure_count` | INTEGER | Yes | `0` | ≥ 0 | Number of scan failures | Internal |
| `scan_failure_reasons` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Failure reasons | Internal |

#### 4.10 Exception Handling

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `has_exception` | BOOLEAN | Yes | `false` | — | Whether exception occurred | Internal |
| `exception_id` | UUID | No | NULL | FK to `exceptions.id` | Exception record (per Ch 5 §5.15) | Internal |
| `exception_type` | VARCHAR(50) | No | NULL | — | Exception type (WRONG_BARCODE, WRONG_LOCATION, etc.) | Internal |
| `exception_resolution` | TEXT | No | NULL | — | How exception was resolved | Internal |

#### 4.11 Performance & Analytics

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `productivity_score` | DECIMAL(5,2) | No | NULL | 0–100 | Operator productivity score for this movement | Internal | Productivity AI |
| `efficiency_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Efficiency vs estimated time | Internal | — |
| `is_optimal_path` | BOOLEAN | No | NULL | — | Whether optimal path was taken | Internal | Path optimization AI |
| `path_variance_m` | DECIMAL(10,2) | No | NULL | — | Variance from optimal path | Internal | — |

#### 4.12 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

---

## 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| WarehouseMovement → Company, Facility, Warehouse | N : 1 each | various | RESTRICT |
| WarehouseMovement → Location (source, destination, zones) | N : 1 each | various | SET NULL |
| WarehouseMovement → Product, Batch, Lot, UOM, InventoryMaster | N : 1 each | various | SET NULL/RESTRICT |
| WarehouseMovement → UserAccount (operator) | N : 1 | `operator_user_id` | RESTRICT |
| WarehouseMovement → WarehouseTask | N : 1 | `warehouse_task_id` | SET NULL |
| WarehouseMovement → InventoryLedger | N : 1 | `ledger_entry_id` | SET NULL |
| WarehouseMovement → Exception | N : 1 | `exception_id` | SET NULL |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_warehouse_movements` | PRIMARY KEY | `id` | Default PK |
| `uq_wm_code_company` | UNIQUE | `company_id, code` | Code uniqueness |
| `uq_wm_number_company` | UNIQUE | `company_id, movement_number` | Movement number uniqueness |
| `idx_wm_date` | B-TREE | `movement_date DESC` | **Partition pruning** (monthly) |
| `idx_wm_status` | B-TREE | `status, movement_date DESC` | Default filter |
| `idx_wm_type` | B-TREE | `movement_type, movement_date DESC` | Filter by type |
| `idx_wm_warehouse` | B-TREE | `warehouse_id, movement_date DESC` | Warehouse movements |
| `idx_wm_product` | B-TREE | `product_id, movement_date DESC` | Product movement history |
| `idx_wm_batch` | B-TREE | `batch_id, movement_date DESC WHERE batch_id IS NOT NULL` | Batch movement history |
| `idx_wm_operator` | B-TREE | `operator_user_id, movement_date DESC` | Operator productivity |
| `idx_wm_source_location` | B-TREE | `source_location_id WHERE source_location_id IS NOT NULL` | Location movement history |
| `idx_wm_dest_location` | B-TREE | `destination_location_id` | Location movement history |
| `idx_wm_task` | B-TREE | `warehouse_task_id WHERE warehouse_task_id IS NOT NULL` | Task movement history |
| `idx_wm_barcode_validated` | PARTIAL | `movement_date WHERE is_barcode_validated = false` | Unvalidated movements (audit) |
| `idx_wm_offline` | PARTIAL | `movement_date WHERE is_offline_created = true` | Offline movements |
| `idx_wm_exception` | PARTIAL | `movement_date WHERE has_exception = true` | Exception movements |
| `idx_wm_ledger_pending` | PARTIAL | `movement_date WHERE is_ledger_written = false AND status = 'COMPLETED'` | Ledger write pending (reconciliation) |

### Partitioning

```sql
-- Monthly partitions (per Part 6 Performance Strategy)
CREATE TABLE warehouse_movements_2026_07 PARTITION OF warehouse_movements
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- pg_partman manages automatically
```

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique per company | DB | Unique constraint |
| 2 | `movement_number` unique per company | DB | Unique constraint |
| 3 | `quantity` > 0 | DB | CHECK constraint |
| 4 | `destination_location_id` required | DB | NOT NULL |
| 5 | `operator_user_id` required | DB | NOT NULL |
| 6 | `batch_id` required if `product.batch_required = true` | App | Service-layer |
| 7 | `destination_location_id` must be BIN-level | App | Service-layer |
| 8 | `source_location_id` if set must be BIN-level | App | Service-layer |
| 9 | Cannot move to blocked location | App | Service-layer (per Ch 17 §17.8 validation #7) |
| 10 | Cannot move recalled batch | App | Service-layer |
| 11 | Cannot move expired batch (unless movement_type = SCRAP) | App | Service-layer |
| 12 | Barcode validation required (per Ch 17 §17.8 — 7-point validation) | App | Barcode Engine integration |
| 13 | `is_barcode_validated = true` required before COMPLETED | App | Service-layer |
| 14 | On COMPLETED: write to `inventory_ledger` (same transaction, per Ch 10 §10.5) | App | Outbox pattern |
| 15 | `duration_seconds` auto-computed on COMPLETED | App | Trigger |
| 16 | `is_inter_warehouse` and `is_inter_zone` auto-computed | App | Generated |
| 17 | Status transitions: DRAFT → IN_PROGRESS → COMPLETED (or CANCELLED / FAILED) | App | Workflow Engine |
| 18 | Cannot modify after COMPLETED (immutable) | App | Service-layer |
| 19 | `scan_failure_count` increments on each scan failure | App | Event-driven |
| 20 | If `has_exception = true`, `exception_id` required | DB | CHECK constraint |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/warehouse-movements` | GET | List movements | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements/:id` | GET | Get movement details | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements` | POST | Create movement (DRAFT) | `WAREHOUSE:CREATE` |
| `/api/v1/warehouse-movements/:id` | PATCH | Update movement (only DRAFT/IN_PROGRESS) | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-movements/:id/start` | POST | Start movement (first scan) | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-movements/:id/scan` | POST | Record barcode scan | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-movements/:id/complete` | POST | Complete movement (writes ledger) | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-movements/:id/cancel` | POST | Cancel movement | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-movements/:id/fail` | POST | Mark as failed (with exception) | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-movements/by-product/:productId` | GET | Product movement history | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements/by-batch/:batchId` | GET | Batch movement history | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements/by-location/:locationId` | GET | Location movement history | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements/by-operator/:userId` | GET | Operator movements | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements/by-task/:taskId` | GET | Task movements | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-movements/offline-sync` | POST | Sync offline movements | `WAREHOUSE:CREATE` |
| `/api/v1/warehouse-movements/analytics` | GET | Movement analytics | `WAREHOUSE:VIEW` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Movement List | AG Grid with multi-filter (type, date, warehouse, operator, status) | `/warehouse/movements` |
| Movement Detail | Single movement with scan history + ledger entry + exception | `/warehouse/movements/:id` |
| Movement by Product | All movements for a product | `/warehouse/products/:id/movements` |
| Movement by Location | All movements at a bin | `/warehouse/locations/:id/movements` |
| Operator Productivity | Movements per operator with productivity scores | `/warehouse/operators/:id/movements` |
| Movement Analytics | Charts: movements by type/day/warehouse/operator | `/warehouse/movements/analytics` |
| Offline Movement Queue | Pending sync movements (mobile) | `/warehouse/movements/offline` |
| Exception Movements | Movements with exceptions | `/warehouse/movements/exceptions` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| **Barcode scan to create movement** | Primary interaction — scan product → scan batch → scan location |
| Movement completion on mobile | Confirm movement with final scan |
| Offline movement creation | Create movements offline, sync later (per Ch 11 Q3) |
| Movement history lookup | View recent movements on mobile |
| Exception reporting | Report exception from mobile (per Ch 5 §5.15) |
| Movement alerts | Push notifications for assigned movements |

---

## 11. Reports

| Report | Use of Warehouse Movement |
|---|---|
| Movement History Report | All movements in period (per Part 6 Reports) |
| Movement by Type | Putaway/picking/transfer counts |
| Operator Productivity Report | Movements per operator, avg duration |
| Travel Distance Report | Total travel distance per operator/warehouse |
| Picking Efficiency Report | Picks per hour, avg pick time |
| Putaway Performance | Avg putaway time, putaway accuracy |
| Movement Heatmap | Visual heatmap of movement frequency by location |
| Scan Failure Report | Scan failures by type/location/operator |
| Exception Report | Movements with exceptions |
| Offline Movement Report | Offline movements + sync status |
| Movement Cycle Time | Avg time from start to complete |
| Cross-Dock Report | Cross-dock movements (per WMS 2.0) |
| Replenishment Report | Replenishment movements |
| Path Optimization Report | Actual vs optimal path variance |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (during DRAFT/IN_PROGRESS) | Yes | Optional | Permanent |
| COMPLETED | Yes | Optional | Permanent |
| CANCELLED | Yes | **Mandatory** (reason) | Permanent |
| FAILED | Yes | **Mandatory** (exception reason) | Permanent |
| DELETE (soft — rare) | Yes | **Mandatory** | Permanent |
| Barcode scan events | Yes (in `barcode_scans` JSONB) | N/A | 7 years |
| Ledger write | Yes (via ledger entry audit) | N/A | Permanent |

**Audit Level**: Full — all field changes captured; barcode scans preserved in JSONB; ledger entries immutable + hash-chained.

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `movement_number`, `movement_date`, `movement_type`, `product_id`, `quantity` | Internal | L2+ Warehouse |
| `operator_user_id`, `operator_name`, `device_id`, `scanner_id` | Internal | L2+ Warehouse, HR |
| `source_*`, `destination_*` (locations) | Internal | L2+ Warehouse |
| `ip_address`, `session_id` | Confidential | L2+ IT, Audit |
| `barcode_scans`, `scan_failure_count` | Internal | L2+ Warehouse, IT |
| `productivity_score`, `efficiency_pct` | Internal | L2+ Warehouse, HR |
| `ledger_entry_ids` | Internal | L2+ Warehouse, Finance |
| `exception_*` | Internal | L2+ Warehouse, Quality |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| **Warehouse Slotting AI** | Uses movement frequency to recommend slotting |
| **Travel Path Optimization AI** | Uses source/destination + travel_distance to optimize paths |
| **Picking Optimization AI** | Analyzes picking movements for pick path optimization |
| **Labor Planning AI** | Uses movement volume + duration for workforce planning |
| **Congestion Prediction AI** | Analyzes movement density by zone/aisle |
| **Productivity Analysis AI** | Operator productivity scoring |
| **Heat Map AI** | Movement frequency heat maps |
| **Replenishment Prediction AI** | Predicts when replenishment needed |
| **Anomaly Detection AI** | Detects unusual movement patterns (potential fraud) |
| **Capacity Forecast AI** | Predicts warehouse capacity needs |
| **Digital Twin AI** | Movement simulation for warehouse optimization |
| **Cross-Dock Optimization AI** | Identifies cross-dock opportunities |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| **Row count** | HIGH volume — ~100,000+ movements/month at scale (~1M+/year) |
| **Partitioning** | Monthly by `movement_date` (per Part 6 Performance Strategy); pg_partman auto-managed |
| **Partition pruning** | Time-range queries hit only relevant partitions |
| **Cache strategy** | Redis cache NOT used for movements (always query fresh); analytics use pre-aggregated daily/hourly summaries |
| **Hot path: movement lookup** | By `movement_number` — indexed < 10ms |
| **Hot path: operator productivity** | By `operator_user_id + movement_date` — indexed |
| **Hot path: location history** | By `source_location_id` / `destination_location_id` — indexed |
| **Barcode scans** | Stored in JSONB — queried when needed (not hot path) |
| **Ledger write** | Same transaction as movement COMPLETED (per Ch 10 §10.5 Outbox pattern) |
| **Aggregations** | For dashboards, use pre-aggregated daily/hourly summary tables (per Ch 15 Q82) — never aggregate movements directly |
| **Cold-tier archival** | Partitions older than 2 years → detach → Parquet → FDW (per Ch 10 Q4) |
| **N+1 prevention** | Eager-load `product`, `batch`, `operator`, `locations` when listing |

---

## 16. Example Records

### Example 1: Putaway Movement

```json
{
  "id": "01928f7a-...-wm-001",
  "code": "WM-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "movement_number": "WM-2026-000001",
  "movement_date": "2026-07-07",
  "movement_type": "PUTAWAY",
  "movement_category": "INTERNAL",
  "movement_origin": "TASK_DRIVEN",
  "is_barcode_validated": true,
  "barcode_scan_count": 3,
  "source_location_id": "01928f7a-...-bin-recv-01",
  "source_location_code": "WH-RM-01-Z09-R-D-01-S01-B01",
  "source_zone_id": "01928f7a-...-zone-recv",
  "destination_location_id": "01928f7a-...-bin-rm-01-01",
  "destination_location_code": "WH-RM-01-Z01-A-R01-S01-B01",
  "destination_zone_id": "01928f7a-...-zone-rm-01",
  "is_inter_warehouse": false,
  "is_inter_zone": true,
  "product_id": "01928f7a-...-prod-sugar",
  "batch_id": "01928f7a-...-batch-002",
  "batch_number": "SUP-MUR-2026-042",
  "inventory_master_id": "01928f7a-...-inv-002",
  "uom_id": "01928f7a-...-uom-kg",
  "quantity": 495.0000,
  "operator_user_id": "01928f7a-...-user-wh-operator-01",
  "operator_name": "Suresh Kumar",
  "device_id": "TAB-WH-001",
  "device_type": "TABLET",
  "scanner_id": "ZEBRA-TC52-001",
  "warehouse_task_id": "01928f7a-...-task-putaway-001",
  "task_number": "TASK-2026-000001",
  "source_document_type": "GOODS_RECEIPT_NOTE",
  "source_document_id": "01928f7a-...-grn-001",
  "source_document_number": "GRN-2026-000001",
  "started_at": "2026-07-07T14:30:00Z",
  "completed_at": "2026-07-07T14:35:30Z",
  "duration_seconds": 330,
  "travel_distance_m": 45.50,
  "estimated_duration_sec": 300,
  "ledger_entry_id": "01928f7a-...-ledger-001",
  "is_ledger_written": true,
  "barcode_scans": [
    {
      "scan_type": "PRODUCT",
      "barcode_value": "SDH-PRD-000001-7",
      "scanned_at": "2026-07-07T14:30:15Z",
      "result": "SUCCESS"
    },
    {
      "scan_type": "BATCH",
      "barcode_value": "SDH-PLT-01-BAT-2026-000002",
      "scanned_at": "2026-07-07T14:31:00Z",
      "result": "SUCCESS"
    },
    {
      "scan_type": "LOCATION",
      "barcode_value": "SDH-WH-RM-01-Z01-A-R01-S01-B01",
      "scanned_at": "2026-07-07T14:35:00Z",
      "result": "SUCCESS"
    }
  ],
  "first_scan_at": "2026-07-07T14:30:15Z",
  "last_scan_at": "2026-07-07T14:35:00Z",
  "scan_failure_count": 0,
  "has_exception": false,
  "productivity_score": 95.00,
  "efficiency_pct": 90.91,
  "is_optimal_path": true,
  "status": "COMPLETED",
  "version": 2
}
```

### Example 2: Picking Movement (with FEFO)

```json
{
  "id": "01928f7a-...-wm-002",
  "code": "WM-2026-000002",
  "movement_number": "WM-2026-000002",
  "movement_date": "2026-07-07",
  "movement_type": "PICKING",
  "movement_category": "OUTBOUND",
  "movement_origin": "TASK_DRIVEN",
  "is_barcode_validated": true,
  "barcode_scan_count": 3,
  "source_location_id": "01928f7a-...-bin-fg-01-01-05",
  "source_location_code": "WH-FG-01-Z02-B-R02-S01-B05",
  "destination_location_id": "01928f7a-...-bin-dispatch-01",
  "destination_location_code": "WH-FG-01-Z08-D-01-S01-B01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "batch_number": "SDS-2026-000001",
  "quantity": 5.0000,
  "operator_user_id": "01928f7a-...-user-picker-001",
  "operator_name": "Rajesh Patel",
  "device_id": "ZEBRA-TC52-002",
  "device_type": "HANDHELD_SCANNER",
  "warehouse_task_id": "01928f7a-...-task-pick-001",
  "source_document_type": "SALES_ORDER",
  "source_document_number": "SO-2026-000123",
  "started_at": "2026-07-07T15:00:00Z",
  "completed_at": "2026-07-07T15:02:30Z",
  "duration_seconds": 150,
  "travel_distance_m": 28.30,
  "estimated_duration_sec": 180,
  "ledger_entry_id": "01928f7a-...-ledger-002",
  "is_ledger_written": true,
  "barcode_scans": [
    { "scan_type": "PRODUCT", "barcode_value": "SDH-PRD-000123-7", "scanned_at": "2026-07-07T15:00:10Z", "result": "SUCCESS" },
    { "scan_type": "BATCH", "barcode_value": "SDH-PLT-01-BAT-2026-000001", "scanned_at": "2026-07-07T15:01:00Z", "result": "SUCCESS" },
    { "scan_type": "LOCATION", "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S01-B05", "scanned_at": "2026-07-07T15:02:00Z", "result": "SUCCESS" }
  ],
  "first_scan_at": "2026-07-07T15:00:10Z",
  "last_scan_at": "2026-07-07T15:02:00Z",
  "scan_failure_count": 0,
  "productivity_score": 110.00,
  "efficiency_pct": 120.00,
  "is_optimal_path": true,
  "status": "COMPLETED",
  "version": 1,
  "tags": ["fefo-pick", "fast-pick"]
}
```

### Example 3: Movement with Exception (Wrong Location)

```json
{
  "id": "01928f7a-...-wm-003",
  "code": "WM-2026-000003",
  "movement_number": "WM-2026-000003",
  "movement_date": "2026-07-07",
  "movement_type": "PUTAWAY",
  "movement_category": "INTERNAL",
  "is_barcode_validated": false,
  "barcode_scan_count": 4,
  "scan_failure_count": 1,
  "scan_failure_reasons": ["WRONG_LOCATION"],
  "has_exception": true,
  "exception_id": "01928f7a-...-exc-001",
  "exception_type": "WRONG_LOCATION",
  "exception_resolution": "Operator scanned wrong bin. Re-scanned correct bin after guided recovery. Movement completed.",
  "barcode_scans": [
    { "scan_type": "PRODUCT", "barcode_value": "SDH-PRD-000123-7", "scanned_at": "2026-07-07T16:00:10Z", "result": "SUCCESS" },
    { "scan_type": "BATCH", "barcode_value": "SDH-PLT-01-BAT-2026-000001", "scanned_at": "2026-07-07T16:00:45Z", "result": "SUCCESS" },
    { "scan_type": "LOCATION", "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S01-B99", "scanned_at": "2026-07-07T16:01:20Z", "result": "FAILURE", "failure_reason": "WRONG_LOCATION" },
    { "scan_type": "LOCATION", "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S01-B05", "scanned_at": "2026-07-07T16:02:30Z", "result": "SUCCESS" }
  ],
  "started_at": "2026-07-07T16:00:10Z",
  "completed_at": "2026-07-07T16:03:00Z",
  "duration_seconds": 170,
  "status": "COMPLETED",
  "version": 3
}
```

### Example 4: Offline Movement (Created on Mobile)

```json
{
  "id": "01928f7a-...-wm-004",
  "code": "WM-2026-000004",
  "movement_number": "WM-2026-000004",
  "movement_date": "2026-07-07",
  "movement_type": "PICKING",
  "movement_category": "OUTBOUND",
  "is_offline_created": true,
  "sync_id": "01928f7a-...-sync-001",
  "is_barcode_validated": true,
  "barcode_scan_count": 3,
  "operator_user_id": "01928f7a-...-user-picker-002",
  "device_id": "TAB-WH-003",
  "device_type": "TABLET",
  "quantity": 10.0000,
  "started_at": "2026-07-07T17:30:00Z",
  "completed_at": "2026-07-07T17:33:00Z",
  "is_ledger_written": false,
  "status": "COMPLETED",
  "version": 1,
  "tags": ["offline", "pending-sync"]
}
```
