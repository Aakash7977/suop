# Manual 1 · Part 2 · Entity 6 — Warehouse

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entity | Warehouse (Facility Specialization) |
| Entity Code | A.6 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `Warehouse` entity is a **specialization of Facility** for storage and material handling operations. Per Volume 0 Chapter 1 §2.2, Sudhastar operates multiple warehouse types:

- **Raw Material Store** — stores incoming ingredients and packaging
- **Packaging Store** — stores packaging materials
- **Finished Goods** — stores completed products ready for dispatch
- **Cold Storage** — temperature-controlled storage for perishables (2-8°C)
- **Blast Chiller** — rapid cooling facility for freshly cooked products
- **Dispatch** — staging area for outbound shipments
- **Quarantine** — holds stock under quality inspection
- **Returns** — processes returned goods

The Warehouse entity extends Facility with warehouse-specific attributes: zone count, temperature/humidity ranges (for cold storage/blast chiller), storage capacity, and putaway/picking strategy configuration. It is the parent for the Location Hierarchy (Zone → Aisle → Rack → Shelf → Bin, entities A.7–A.11).

Like Plant, Warehouse uses a **view-based specialization pattern** — physical data lives in `facilities` table with `facility_type = WAREHOUSE`.

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Warehouse Head |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Warehouse Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `warehouses` (VIEW — backed by `facilities` table) |
| Prisma Model | `Warehouse` (view-based) |
| File Location | `prisma/schema/master/organization/warehouse.prisma` |
| Base Table | `facilities WHERE facility_type = 'WAREHOUSE'` |
| Partitioning | None (inherits from facilities) |

### View Definition

```sql
CREATE VIEW warehouses AS
SELECT
  f.*,
  f.warehouse_type AS warehouse_type,
  f.warehouse_zone_count AS zone_count,
  f.temperature_min_c AS temperature_min_c,
  f.temperature_max_c AS temperature_max_c,
  f.humidity_min_pct AS humidity_min_pct,
  f.humidity_max_pct AS humidity_max_pct
FROM facilities f
WHERE f.facility_type = 'WAREHOUSE'
  AND f.deleted_at IS NULL;
```

---

## 4. Field Dictionary

### 4.1 Inherited Fields (from Facility — Section A.4)

All universal base fields and common facility fields are inherited. See Entity A.4 (Facility) for complete definitions.

### 4.2 Warehouse-Specific Fields

Stored on `facilities` table (per Facility §4.3) and exposed via `warehouses` view:

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `warehouse_type` | ENUM | Yes | — | RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, BLAST_CHILLER, DISPATCH, QUARANTINE, RETURNS, GENERAL | Warehouse specialization (per Ch 1 §2.2, extended in Ch 5 §5.3) | Internal | — |
| `zone_count` | INTEGER | Yes | `0` | ≥ 0 | Number of zones in warehouse | Internal | — |
| `temperature_min_c` | DECIMAL(5,2) | Conditional | NULL | Required if warehouse_type IN (COLD_STORAGE, BLAST_CHILLER) | Minimum temperature (°C) | Internal | Cold chain AI |
| `temperature_max_c` | DECIMAL(5,2) | Conditional | NULL | Required if warehouse_type IN (COLD_STORAGE, BLAST_CHILLER); must be > temperature_min_c | Maximum temperature (°C) | Internal | Cold chain AI |
| `humidity_min_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Minimum humidity (%) | Internal | — |
| `humidity_max_pct` | DECIMAL(5,2) | No | NULL | 0–100, must be > humidity_min_pct | Maximum humidity (%) | Internal | — |
| `putaway_strategy` | ENUM | Yes | `AUTO_SUGGEST` | MANUAL, AUTO_SUGGEST, AUTO_ASSIGN, ZONE_BASED, PRODUCT_BASED | Default putaway strategy (per Ch 8 §8.3) | Internal | Putaway AI |
| `picking_strategy` | ENUM | Yes | `FEFO` | FEFO, FIFO, LIFO, ZONE_BASED, BATCH_BASED | Default picking strategy (per Ch 5 §5.16, Ch 8 §8.3) | Internal | Picking AI |
| `cycle_count_frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, ON_DEMAND | Default cycle count frequency (per Q9) | Internal | — |
| `abc_classification_enabled` | BOOLEAN | Yes | `true` | — | Whether ABC-based cycle counting is enabled | Internal | — |
| `mixed_sku_allowed` | BOOLEAN | Yes | `false` | — | Whether a single bin can hold multiple SKUs | Internal | — |
| `mixed_batch_allowed` | BOOLEAN | Yes | `true` | — | Whether a single bin can hold multiple batches of same SKU | Internal | — |
| `max_bin_capacity_pct` | DECIMAL(5,2) | Yes | `90.00` | 50–100 | Maximum bin capacity utilization before overflow alert | Internal | — |
| `overflow_warehouse_id` | UUID | No | NULL | FK to `facilities.id` (WAREHOUSE type) | Warehouse to use for overflow stock | Internal | — |
| `default_uom_class` | VARCHAR(20) | No | NULL | WEIGHT, COUNT, VOLUME, LENGTH | Default UOM class for items stored | Internal | — |
| `rack_count` | INTEGER | No | NULL | ≥ 0 | Total rack count (denormalized for quick stats) | Internal | — |
| `bin_count` | INTEGER | No | NULL | ≥ 0 | Total bin count (denormalized for quick stats) | Internal | — |
| `total_bin_capacity` | DECIMAL(14,2) | No | NULL | ≥ 0 | Sum of all bin capacities | Internal | Capacity AI |
| `used_bin_capacity` | DECIMAL(14,2) | No | `0` | ≥ 0 | Currently used bin capacity | Internal | Capacity AI |
| `barcode_prefix` | VARCHAR(10) | Yes | — | Unique per company | Warehouse-specific barcode prefix (e.g., `WH-CS-01`) | Internal | — |
| `temp_sensor_count` | INTEGER | No | NULL | ≥ 0 | Number of temperature sensors (for cold storage) | Internal | IoT |
| `temp_logging_interval_min` | INTEGER | No | NULL | 1–1440 | Temperature logging interval in minutes | Internal | IoT |
| `temp_alert_threshold_min` | DECIMAL(5,2) | No | NULL | — | Alert if temp below this for X minutes | Internal | Cold chain AI |
| `temp_alert_threshold_max` | DECIMAL(5,2) | No | NULL | — | Alert if temp above this for X minutes | Internal | Cold chain AI |
| `has_iot_sensors` | BOOLEAN | Yes | `false` | — | Whether IoT sensors are installed (future-ready per Ch 24 §24.4) | Internal | IoT |
| `has_conveyor_system` | BOOLEAN | Yes | `false` | — | Whether conveyor system is installed (future per Ch 24 §24.8) | Internal | Robotics |
| `has_agv_fleet` | BOOLEAN | Yes | `false` | — | Whether AGVs are deployed (future per Ch 24 §24.8) | Internal | Robotics |

---

## 5. Relationships

### Inherited Relationships (from Facility)

All Facility relationships apply. See Entity A.4 §5.

### Warehouse-Specific Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Warehouse → Zone | 1 : N | outbound | `storage_zones.warehouse_id` (facility_id) | CASCADE | Zones deleted with warehouse |
| Warehouse → Location (Rack/Shelf/Bin) | 1 : N | outbound | `locations.warehouse_id` | CASCADE | Locations deleted with warehouse |
| Warehouse → StockSummary | 1 : N | outbound | `stock_summary.warehouse_id` | RESTRICT | Cannot delete warehouse with stock |
| Warehouse → InventoryLedger | 1 : N | outbound | `inventory_ledger.warehouse_id` | RESTRICT | Cannot delete warehouse with ledger entries |
| Warehouse → PutawayTask | 1 : N | outbound | `putaway_tasks.warehouse_id` | SET NULL | Tasks retain warehouse_id for audit |
| Warehouse → PickingTask | 1 : N | outbound | `picking_tasks.warehouse_id` | SET NULL | Tasks retain warehouse_id for audit |
| Warehouse → StockTransfer (source) | 1 : N | outbound | `stock_transfers.source_warehouse_id` | RESTRICT | Cannot delete warehouse with pending transfers |
| Warehouse → StockTransfer (dest) | 1 : N | outbound | `stock_transfers.destination_warehouse_id` | RESTRICT | Cannot delete warehouse with pending transfers |
| Warehouse → Warehouse (overflow) | N : 1 | self-ref | `warehouses.overflow_warehouse_id` | SET NULL | Overflow warehouse reference cleared |
| Warehouse → TempSensorLog | 1 : N | outbound | `temp_sensor_logs.warehouse_id` | CASCADE | Logs deleted with warehouse |

---

## 6. Index Strategy

Inherits all Facility indexes. Additional:

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `idx_warehouses_type` | B-TREE | `company_id, warehouse_type` | Filter by warehouse type |
| `idx_warehouses_overflow` | B-TREE | `overflow_warehouse_id` | Find warehouses using this as overflow |
| `idx_warehouses_cold_chain` | B-TREE | `warehouse_type WHERE warehouse_type IN ('COLD_STORAGE', 'BLAST_CHILLER')` | Quick filter for cold chain facilities |

---

## 7. Validation Rules

Inherits all Facility validation rules. Additional:

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `facility_type` must be `WAREHOUSE` | DB | View WHERE clause |
| 2 | `warehouse_type` is required | DB | NOT NULL constraint |
| 3 | For COLD_STORAGE / BLAST_CHILLER: `temperature_min_c` and `temperature_max_c` required | DB | CHECK constraint |
| 4 | `temperature_max_c` > `temperature_min_c` | DB | CHECK constraint |
| 5 | `humidity_max_pct` > `humidity_min_pct` (if both set) | DB | CHECK constraint |
| 6 | `overflow_warehouse_id` cannot reference self | App | Service-layer check |
| 7 | `overflow_warehouse_id` must be same company | App | Service-layer check |
| 8 | `max_bin_capacity_pct` must be between 50 and 100 | DB | CHECK constraint |
| 9 | `putaway_strategy` and `picking_strategy` must be valid enum values | DB | CHECK constraint |
| 10 | If `mixed_sku_allowed = false`, bins cannot contain multiple SKUs | App | Enforced at stock movement time |
| 11 | If `mixed_batch_allowed = false`, bins cannot contain multiple batches | App | Enforced at stock movement time |
| 12 | `temp_logging_interval_min` if set must be 1–1440 (1 min to 24 hrs) | DB | CHECK constraint |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/warehouses` | GET | List warehouses | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id` | GET | Get warehouse details | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id/zones` | GET | List zones in warehouse | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id/locations` | GET | List locations (rack/shelf/bin tree) | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id/capacity` | GET | Get capacity utilization | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id/stock-summary` | GET | Get stock summary | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id/temperature-logs` | GET | Get temperature logs (cold storage) | `ORGANIZATION:VIEW` |
| `/api/v1/warehouses/:id/putaway-suggest` | POST | Get putaway suggestions | `WAREHOUSE:VIEW` |
| `/api/v1/warehouses/:id/picking-suggest` | POST | Get picking suggestions | `WAREHOUSE:VIEW` |
| `/api/v1/warehouses/:id/cycle-count` | POST | Trigger cycle count | `WAREHOUSE:EDIT` |

**Note**: Warehouse creation, update, and lifecycle operations use the Facility endpoints with `facility_type = WAREHOUSE`.

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Warehouse List | AG Grid list with type filter | `/organization/warehouses` |
| Warehouse Detail | Tabbed: Overview, Zones, Locations, Capacity, Stock, Temp Logs | `/organization/warehouses/:id` |
| Warehouse Map | Visual 2D/3D layout of zones, racks, shelves, bins | `/organization/warehouses/:id/map` |
| Capacity Dashboard | Utilization by zone, rack, bin | `/organization/warehouses/:id/capacity` |
| Cold Chain Monitor | Temperature charts + alerts (cold storage only) | `/organization/warehouses/:id/cold-chain` |
| Cycle Count Dashboard | Pending + completed cycle counts | `/organization/warehouses/:id/cycle-counts` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Warehouse switcher | Operators switch between assigned warehouses |
| Warehouse info card | View type, capacity, operating hours |
| Warehouse-scoped tasks | Putaway, picking, cycle count tasks |
| Warehouse QR code scan | Scan to set current warehouse (kiosk mode) |
| Cold chain alerts | Push notifications for temperature breaches |
| Warehouse map navigation | Smart Warehouse Navigation (per Ch 17 enhancement) |

---

## 11. Reports

| Report | Use of Warehouse |
|---|---|
| Warehouse Utilization Report | Capacity usage, bin occupancy, overflow |
| Warehouse Stock Report | Stock levels, aging, valuation |
| Cold Chain Compliance Report | Temperature logs, breach incidents |
| Cycle Count Accuracy Report | Variance analysis per warehouse |
| Putaway/Picking Performance | Time, accuracy, productivity per warehouse |
| Multi-Warehouse Comparison | Cross-warehouse performance |

---

## 12. Audit Rules

Inherits Facility audit rules. Additional:

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| UPDATE (temperature ranges, strategies) | Yes | **Mandatory** | Permanent |
| UPDATE (overflow_warehouse_id) | Yes | **Mandatory** | Permanent |
| Temperature breach event | Yes (auto-logged) | N/A | 7 years (compliance) |

---

## 13. Security Classification

Inherits Facility security classification. Additional:

| Field Category | Classification | Access |
|---|---|---|
| `warehouse_type`, `zone_count`, `putaway_strategy`, `picking_strategy` | Internal | L2+ Warehouse, Admin |
| `temperature_*`, `humidity_*` | Internal | L2+ Warehouse, Quality |
| `temp_sensor_count`, `temp_logging_interval_min` | Internal | L2+ IT, Warehouse |
| `overflow_warehouse_id` | Internal | L2+ Warehouse |
| `has_iot_sensors`, `has_conveyor_system`, `has_agv_fleet` | Internal | L2+ IT, Operations |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Putaway Optimization AI | Suggests optimal putaway locations |
| Picking Optimization AI | Optimizes pick paths |
| Capacity Planning AI | Uses `total_bin_capacity`, `used_bin_capacity` |
| Cold Chain Compliance AI | Monitors temperature, predicts breaches |
| Inventory Optimization AI | Per-warehouse reorder points |
| Cycle Count AI | Suggests which bins to count based on risk |
| Robotics Integration (future) | Uses `has_agv_fleet`, `has_conveyor_system` for orchestration |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 50 per company |
| View performance | View backed by indexed `facility_type` filter |
| Cache strategy | Redis cache, TTL 1 hour |
| Capacity fields | `used_bin_capacity` updated by event handler on each stock movement (per Ch 10 Q1 pattern) |
| Temperature logs | High volume — partitioned daily (per Ch 10 §10.11) |
| Query patterns | Queried by `company_id`, `warehouse_type`, `id` (FK) |

---

## 16. Example Records

### Example 1: Raw Material Warehouse

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ed1",
  "code": "WH-RM-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Pune Raw Material Store",
  "name_short": "RM Store",
  "facility_type": "WAREHOUSE",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "parent_facility_id": "01928f7a-...-plt-01",
  "address_line1": "Plot 7, MIDC Phase 2",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "411026",
  "barcode_prefix": "PUN-RM",
  "warehouse_type": "RAW_MATERIAL",
  "zone_count": 4,
  "putaway_strategy": "AUTO_SUGGEST",
  "picking_strategy": "FEFO",
  "cycle_count_frequency": "MONTHLY",
  "abc_classification_enabled": true,
  "mixed_sku_allowed": false,
  "mixed_batch_allowed": true,
  "max_bin_capacity_pct": 90.00,
  "total_area_sqm": 1000.00,
  "storage_capacity_sqm": 800.00,
  "rack_count": 20,
  "bin_count": 480,
  "total_bin_capacity": 24000.00,
  "used_bin_capacity": 16800.00,
  "default_uom_class": "WEIGHT",
  "has_iot_sensors": false,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 2: Cold Storage Warehouse

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ed2",
  "code": "WH-CS-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Central Cold Storage",
  "name_short": "Cold Storage",
  "facility_type": "WAREHOUSE",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "parent_facility_id": "01928f7a-...-plt-01",
  "barcode_prefix": "PUN-CS",
  "warehouse_type": "COLD_STORAGE",
  "zone_count": 6,
  "temperature_min_c": 2.00,
  "temperature_max_c": 8.00,
  "humidity_min_pct": 60.00,
  "humidity_max_pct": 75.00,
  "putaway_strategy": "AUTO_ASSIGN",
  "picking_strategy": "FEFO",
  "cycle_count_frequency": "WEEKLY",
  "mixed_sku_allowed": false,
  "mixed_batch_allowed": true,
  "max_bin_capacity_pct": 85.00,
  "total_area_sqm": 800.00,
  "storage_capacity_sqm": 600.00,
  "temp_sensor_count": 12,
  "temp_logging_interval_min": 5,
  "temp_alert_threshold_min": 1.5,
  "temp_alert_threshold_max": 8.5,
  "has_iot_sensors": true,
  "status": "ACTIVE",
  "version": 2
}
```

### Example 3: Blast Chiller

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ed3",
  "code": "WH-BC-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Blast Chiller Unit 1",
  "name_short": "Blast Chiller",
  "facility_type": "WAREHOUSE",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "parent_facility_id": "01928f7a-...-plt-01",
  "barcode_prefix": "PUN-BC",
  "warehouse_type": "BLAST_CHILLER",
  "zone_count": 2,
  "temperature_min_c": -40.00,
  "temperature_max_c": -35.00,
  "putaway_strategy": "MANUAL",
  "picking_strategy": "FEFO",
  "cycle_count_frequency": "ON_DEMAND",
  "total_area_sqm": 100.00,
  "storage_capacity_sqm": 80.00,
  "temp_sensor_count": 4,
  "temp_logging_interval_min": 1,
  "temp_alert_threshold_min": -41.0,
  "temp_alert_threshold_max": -34.0,
  "has_iot_sensors": true,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 4: Finished Goods Warehouse with Overflow

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ed4",
  "code": "WH-FG-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Finished Goods Warehouse 1",
  "name_short": "FG WH 1",
  "facility_type": "WAREHOUSE",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "barcode_prefix": "PUN-FG",
  "warehouse_type": "FINISHED_GOODS",
  "zone_count": 8,
  "putaway_strategy": "ZONE_BASED",
  "picking_strategy": "FEFO",
  "cycle_count_frequency": "WEEKLY",
  "overflow_warehouse_id": "01928f7a-...-wh-fg-02",
  "total_area_sqm": 1500.00,
  "storage_capacity_sqm": 1200.00,
  "rack_count": 30,
  "bin_count": 720,
  "total_bin_capacity": 36000.00,
  "used_bin_capacity": 32000.00,
  "status": "ACTIVE",
  "version": 1,
  "tags": ["high-utilization", "overflow-active"]
}
```

### Example 5: Dispatch Warehouse

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ed5",
  "code": "WH-DSP-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Dispatch Staging Area",
  "name_short": "Dispatch",
  "facility_type": "WAREHOUSE",
  "business_unit_id": "01928f7a-...-bu-dst",
  "barcode_prefix": "PUN-DS",
  "warehouse_type": "DISPATCH",
  "zone_count": 3,
  "putaway_strategy": "MANUAL",
  "picking_strategy": "MANUAL",
  "cycle_count_frequency": "DAILY",
  "total_area_sqm": 300.00,
  "storage_capacity_sqm": 250.00,
  "status": "ACTIVE",
  "version": 1
}
```
