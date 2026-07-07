# Manual 1 · Part 6 · Entities 47-48 — Dock Management & Warehouse Location

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 6 — Warehouse Management Domain (WMS) |
| Entities | Dock Master (047), Warehouse Location (048) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Entity 047 — Dock Master

### 1. Business Purpose

The `Dock` entity represents a **physical dock** at a warehouse — the point where goods are received from suppliers or dispatched to customers/stores. Dock management is critical for:

- **Receiving scheduling** — schedule inbound deliveries (ASNs) to specific docks
- **Dispatch scheduling** — schedule outbound shipments to specific docks
- **Dock utilization** — track dock occupancy, identify bottlenecks
- **Cross-docking** — receive and immediately dispatch without putaway (per WMS 2.0)
- **Vehicle management** — track vehicle arrival, unloading, departure
- **Labor planning** — assign receiving/dispatch teams to docks

Per Part 6 Warehouse Architecture, docks are the **entry and exit points** of the warehouse. Every GRN and every dispatch references a dock. Dock appointments enable **planned receiving** rather than chaotic vehicle queues.

### Dock Types

| Type | Description | Use Case |
|---|---|---|
| **RECEIVING** | Inbound only | Supplier deliveries, returns |
| **DISPATCH** | Outbound only | Customer shipments, store transfers |
| **COMBINED** | Both inbound and outbound | Small warehouses with limited docks |
| **CROSS_DOCK** | Dedicated cross-docking | Receive → immediately dispatch (per WMS 2.0) |
| **RAIL** | Rail dock | Rail deliveries (future) |
| **CONTAINER** | Container handling | Import/export containers |

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
| Schema | `master` |
| Table Name | `docks` |
| Prisma Model | `Dock` |
| File Location | `prisma/schema/master/warehouse/dock.prisma` |
| Partitioning | None (low volume — max ~20 docks per warehouse) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK | Internal primary key |
| `code` | VARCHAR(20) | Yes | — | Unique per warehouse, Number Series `DOCK-` | Dock code (e.g., `DOCK-01`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` (warehouse) | Parent warehouse |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE type) | Same as facility_id for docks |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, UNDER_MAINTENANCE, CLOSED | Operational status |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Dock-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `dock_number` | VARCHAR(20) | Yes | — | Unique per warehouse | Display dock number (e.g., `D-01`, `R-01` for receiving) | Public | — |
| `dock_name` | VARCHAR(100) | Yes | — | Min 3 | Dock display name (e.g., "Receiving Dock 1") | Public | — |
| `dock_type` | ENUM | Yes | — | RECEIVING, DISPATCH, COMBINED, CROSS_DOCK, RAIL, CONTAINER | Dock type | Internal | Dock scheduling AI |
| `dock_category` | ENUM | No | NULL | INBOUND, OUTBOUND, BIDIRECTIONAL | Directional category | Internal | — |
| `zone_id` | UUID | No | NULL | FK to `locations.id` (ZONE level) | Associated zone (receiving/dispatch zone) | Internal | — |
| `location_id` | UUID | No | NULL | FK to `locations.id` (exact dock location) | Dock physical location | Internal | — |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated: `SDH-{WH}-{DOCK}` | Dock barcode (per Ch 17 §17.5) | Public | Scan analytics |
| `dock_capacity_vehicles` | INTEGER | Yes | `1` | ≥ 1 | Number of vehicles that can be at dock simultaneously | Internal | Capacity AI |
| `current_vehicle_count` | INTEGER | Yes | `0` | ≥ 0 | Vehicles currently at dock (event-updated) | Internal | — |
| `is_occupied` | BOOLEAN | Yes | `false` | Generated: `current_vehicle_count > 0` | Dock occupied flag | Internal | — |
| `max_vehicle_size` | ENUM | Yes | `TRUCK` | THREE_WHEELER, TEMPO, TRUCK, LARGE_TRUCK, CONTAINER, ANY | Max vehicle size | Internal | — |
| `vehicle_types_allowed` | TEXT[] | No | NULL | Subset of vehicle types | Allowed vehicle types (NULL = all) | Internal | — |
| `dock_height_m` | DECIMAL(5,2) | No | NULL | > 0 | Dock platform height (for loading dock) | Internal | — |
| `dock_leveler_type` | ENUM | No | NULL | NONE, MECHANICAL, HYDRAULIC, PNEUMATIC | Dock leveler type | Internal | — |
| `has_dock_shelter` | BOOLEAN | Yes | `false` | — | Dock shelter (weather protection) | Internal | — |
| `has_dock_seal` | BOOLEAN | Yes | `false` | — | Dock seal (temperature control) | Internal | — |
| `temperature_controlled` | BOOLEAN | Yes | `false` | — | Cold chain dock | Internal | — |
| `temperature_min_c` | DECIMAL(5,2) | No | NULL | Required if temperature_controlled=true | Min temperature | Internal | Cold chain AI |
| `temperature_max_c` | DECIMAL(5,2) | No | NULL | Required if temperature_controlled=true | Max temperature | Internal | Cold chain AI |
| `is_cross_dock_enabled` | BOOLEAN | Yes | `false` | — | Cross-docking enabled (per WMS 2.0) | Internal | Cross-dock AI |
| `operating_hours_start` | TIME | No | NULL | — | Dock operating hours start | Internal | — |
| `operating_hours_end` | TIME | No | NULL | — | Dock operating hours end | Internal | — |
| `is_24x7` | BOOLEAN | Yes | `false` | — | 24/7 dock | Internal | — |
| `total_appointments_today` | INTEGER | Yes | `0` | ≥ 0 | Appointments scheduled today | Internal | Dock scheduling AI |
| `completed_appointments_today` | INTEGER | Yes | `0` | ≥ 0 | Completed appointments today | Internal | — |
| `avg_unload_time_min` | DECIMAL(8,2) | No | NULL | ≥ 0 | Average unload time | Internal | — |
| `avg_load_time_min` | DECIMAL(8,2) | No | NULL | ≥ 0 | Average load time | Internal | — |
| `utilization_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Dock utilization % (event-updated) | Internal | Capacity AI |
| `last_vehicle_at` | TIMESTAMPTZ | No | NULL | — | Last vehicle at dock | Internal | — |
| `last_appointment_at` | TIMESTAMPTZ | No | NULL | — | Last appointment | Internal | — |
| `assigned_team_id` | UUID | No | NULL | FK to `teams.id` | Assigned receiving/dispatch team | Internal | — |
| `assigned_supervisor_id` | UUID | No | NULL | FK to `user_accounts.id` | Dock supervisor | Internal | — |
| `equipment_available` | TEXT[] | No | NULL | Subset: FORKLIFT, PALLET_TRUCK, HAND_TRUCK, CONVEYOR, CRANE | Equipment at dock | Internal | — |
| `is_appt_required` | BOOLEAN | Yes | `true` | — | Appointment required for dock | Internal | — |
| `appt_buffer_time_min` | INTEGER | Yes | `30` | ≥ 0 | Buffer time between appointments | Internal | Dock scheduling AI |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Dock → Company, Facility, Warehouse | N : 1 each | various | RESTRICT |
| Dock → Location (zone, exact location) | N : 1 each | various | SET NULL |
| Dock → Team (assigned) | N : 1 | `assigned_team_id` | SET NULL |
| Dock → UserAccount (supervisor) | N : 1 | `assigned_supervisor_id` | SET NULL |
| Dock → DockAppointment | 1 : N | `dock_appointments.dock_id` | CASCADE |
| Dock → GoodsReceiptNote | 1 : N | `goods_receipt_notes.dock_used` | SET NULL |
| Dock → StockTransfer (dispatch) | 1 : N | `stock_transfers.dispatch_dock_id` | SET NULL |
| Dock → Vehicle | 1 : N | `vehicles.current_dock_id` | SET NULL |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_docks` | PK | `id` |
| `uq_docks_number_warehouse` | UNIQUE | `warehouse_id, dock_number` |
| `uq_docks_barcode` | UNIQUE | `barcode_value` |
| `idx_docks_status` | B-TREE | `warehouse_id, status` |
| `idx_docks_type` | B-TREE | `warehouse_id, dock_type` |
| `idx_docks_occupied` | PARTIAL | `warehouse_id WHERE is_occupied = true` |
| `idx_docks_available` | PARTIAL | `warehouse_id WHERE is_occupied = false AND status = 'ACTIVE'` |
| `idx_docks_cross_dock` | PARTIAL | `warehouse_id WHERE is_cross_dock_enabled = true` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `dock_number` unique per warehouse | DB |
| 2 | `barcode_value` globally unique | DB |
| 3 | If `dock_type = RECEIVING`, `dock_category` must be `INBOUND` | App |
| 4 | If `dock_type = DISPATCH`, `dock_category` must be `OUTBOUND` | App |
| 5 | If `temperature_controlled = true`, temperature fields required | DB CHECK |
| 6 | `temperature_max_c` > `temperature_min_c` | DB CHECK |
| 7 | `current_vehicle_count` ≤ `dock_capacity_vehicles` | App (enforced at vehicle arrival) |
| 8 | `dock_number` immutable after activation | App |
| 9 | Cannot delete dock with appointments or GRNs | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/docks` (GET, POST), `/api/v1/docks/:id` (GET, PATCH), `/api/v1/docks/:id/appointments` (GET), `/api/v1/docks/available` (GET — available docks), `/api/v1/docks/:id/schedule` (GET — appointment schedule), `/api/v1/docks/:id/occupy` (POST — vehicle arrived), `/api/v1/docks/:id/release` (POST — vehicle departed), `/api/v1/docks/utilization` (GET) |
| **UI** | Dock List, Dock Detail (with appointment calendar + current vehicle), Dock Scheduling Calendar (visual), Dock Utilization Dashboard, Cross-Dock Board |
| **Mobile** | Dock scan (vehicle arrival), dock status on mobile, appointment confirmation |
| **Reports** | Dock Utilization Report, Dock Appointment Adherence, Avg Load/Unload Time, Dock Congestion Report |
| **Audit** | Full; mandatory reason for status change (UNDER_MAINTENANCE, CLOSED), capacity change |

### 13-16. Security / AI / Performance / Example

**Security**: `dock_number`, `dock_name`, `dock_type`, `barcode_value` = Public; capacity, utilization, equipment = Internal; `assigned_team_id`, `assigned_supervisor_id` = Internal.

**AI**: Dock Scheduling AI (optimizes appointments), Capacity Prediction AI, Congestion Prediction AI, Cross-Dock Optimization AI, Labor Planning AI.

**Performance**: < 50 per company; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-dock-001",
  "code": "DOCK-01",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-wh-fg-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "dock_number": "R-01",
  "dock_name": "Receiving Dock 1",
  "dock_type": "RECEIVING",
  "dock_category": "INBOUND",
  "barcode_value": "SDH-WH-FG-01-DOCK-R01",
  "dock_capacity_vehicles": 1,
  "current_vehicle_count": 1,
  "is_occupied": true,
  "max_vehicle_size": "TRUCK",
  "dock_height_m": 1.20,
  "dock_leveler_type": "HYDRAULIC",
  "has_dock_shelter": true,
  "has_dock_seal": false,
  "temperature_controlled": false,
  "is_cross_dock_enabled": false,
  "operating_hours_start": "06:00:00",
  "operating_hours_end": "22:00:00",
  "is_24x7": false,
  "total_appointments_today": 4,
  "completed_appointments_today": 2,
  "avg_unload_time_min": 35.50,
  "utilization_pct": 68.50,
  "last_vehicle_at": "2026-07-07T10:15:00Z",
  "assigned_team_id": "01928f7a-...-team-recv-01",
  "assigned_supervisor_id": "01928f7a-...-user-recv-sup",
  "equipment_available": ["FORKLIFT", "PALLET_TRUCK", "HAND_TRUCK"],
  "is_appt_required": true,
  "appt_buffer_time_min": 30,
  "status": "ACTIVE",
  "version": 3
}
```

---

## Entity 048 — Warehouse Location

### 1. Business Purpose

The `WarehouseLocation` entity represents the **complete, unique storage address** within a warehouse — the composite of Warehouse + Zone + Aisle + Rack + Shelf + Bin. While each level exists as a separate entity (per Part 2 Location Hierarchy), the `WarehouseLocation` provides a **denormalized, queryable composite address** for:

- **Barcode lookup** — scan a bin barcode → get complete address in one query
- **Reporting** — group by zone/aisle/rack without joins
- **UI display** — show "WH01-Z01-A04-R12-S03-B08" as single string
- **AI training** — movement patterns by full address
- **Digital Twin** — map visualization with complete address

This entity is a **materialized view** of the Location Hierarchy, not a separate physical entity. It's auto-populated and maintained by event handlers when locations are created/updated.

### Complete Location Code Format (per Part 6)

```
WH01-A-04-12-03-08
│    │  │  │  │  └── Bin (08)
│    │  │  │  └───── Shelf (03)
│    │  │  └──────── Rack (12)
│    │  └─────────── Aisle (04)
│    └────────────── Zone (A)
└─────────────────── Warehouse (WH01)
```

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
| Schema | `master` (materialized view) |
| Table Name | `warehouse_locations` (materialized view on `locations` table) |
| Prisma Model | `WarehouseLocation` |
| Pattern | **Materialized view** — auto-populated from Location Hierarchy |
| Refresh | Event-driven (refresh on location create/update/delete) |

### Materialized View Definition

```sql
CREATE MATERIALIZED VIEW warehouse_locations AS
SELECT
  b.id AS bin_id,
  b.code AS bin_code,
  b.barcode_value,
  b.warehouse_id,
  w.code AS warehouse_code,
  w.name AS warehouse_name,
  z.id AS zone_id,
  z.code AS zone_code,
  z.name AS zone_name,
  z.zone_type,
  a.id AS aisle_id,
  a.code AS aisle_code,
  a.name AS aisle_name,
  r.id AS rack_id,
  r.code AS rack_code,
  r.name AS rack_name,
  s.id AS shelf_id,
  s.code AS shelf_code,
  s.name AS shelf_name,
  -- Complete address code
  CONCAT(w.code, '-', z.code, '-', a.code, '-', r.code, '-', s.code, '-', b.code) AS complete_location_code,
  -- Full address text
  CONCAT(w.name, ' > ', z.name, ' > ', a.name, ' > ', r.name, ' > ', s.name, ' > ', b.name) AS complete_location_name,
  -- Coordinates (for Digital Twin)
  b.coordinate_x,
  b.coordinate_y,
  b.coordinate_z,
  -- Capacity
  b.bin_capacity,
  b.current_stock_qty,
  b.utilization_pct,
  b.is_empty,
  b.is_blocked,
  -- WMS extension fields
  b.is_picking_face,
  b.is_reserve_face,
  b.heat_score,
  b.velocity_score,
  b.slotting_class,
  -- Status
  b.status,
  b.deleted_at
FROM locations b
JOIN locations s ON b.parent_location_id = s.id AND s.location_level = 'SHELF'
JOIN locations r ON s.parent_location_id = r.id AND r.location_level = 'RACK'
JOIN locations a ON r.parent_location_id = a.id AND a.location_level = 'AISLE'
JOIN locations z ON a.parent_location_id = z.id AND z.location_level = 'ZONE'
JOIN facilities w ON b.warehouse_id = w.id
WHERE b.location_level = 'BIN'
  AND b.deleted_at IS NULL
WITH DATA;

-- Unique index for fast lookup
CREATE UNIQUE INDEX idx_warehouse_locations_bin_id ON warehouse_locations (bin_id);
CREATE INDEX idx_warehouse_locations_barcode ON warehouse_locations (barcode_value);
CREATE INDEX idx_warehouse_locations_complete_code ON warehouse_locations (complete_location_code);
CREATE INDEX idx_warehouse_locations_warehouse ON warehouse_locations (warehouse_id, zone_id, aisle_id);
```

### 4. Field Dictionary (Materialized View Fields)

| Field | Type | Source | Description | Security Class |
|---|---|---|---|---|
| `bin_id` | UUID | `locations.id` (BIN) | Bin location ID (PK of view) | Internal |
| `bin_code` | VARCHAR(50) | `locations.code` | Bin code | Public |
| `barcode_value` | VARCHAR(100) | `locations.barcode_value` | Full barcode | Public |
| `warehouse_id` | UUID | `locations.warehouse_id` | Warehouse ID | Internal |
| `warehouse_code` | VARCHAR(20) | `facilities.code` | Warehouse code (e.g., `WH-FG-01`) | Public |
| `warehouse_name` | VARCHAR(100) | `facilities.name` | Warehouse name | Public |
| `zone_id` | UUID | `locations.id` (ZONE) | Zone ID | Internal |
| `zone_code` | VARCHAR(50) | `locations.code` (ZONE) | Zone code | Public |
| `zone_name` | VARCHAR(100) | `locations.name` (ZONE) | Zone name | Public |
| `zone_type` | ENUM | `locations.zone_type` | Zone type | Internal |
| `aisle_id` | UUID | `locations.id` (AISLE) | Aisle ID | Internal |
| `aisle_code` | VARCHAR(50) | `locations.code` (AISLE) | Aisle code | Public |
| `aisle_name` | VARCHAR(100) | `locations.name` (AISLE) | Aisle name | Public |
| `rack_id` | UUID | `locations.id` (RACK) | Rack ID | Internal |
| `rack_code` | VARCHAR(50) | `locations.code` (RACK) | Rack code | Public |
| `rack_name` | VARCHAR(100) | `locations.name` (RACK) | Rack name | Public |
| `shelf_id` | UUID | `locations.id` (SHELF) | Shelf ID | Internal |
| `shelf_code` | VARCHAR(50) | `locations.code` (SHELF) | Shelf code | Public |
| `shelf_name` | VARCHAR(100) | `locations.name` (SHELF) | Shelf name | Public |
| `complete_location_code` | VARCHAR(200) | Generated | `WH01-A-04-12-03-08` | Public |
| `complete_location_name` | VARCHAR(500) | Generated | `Warehouse > Zone > Aisle > Rack > Shelf > Bin` | Public |
| `coordinate_x` | DECIMAL(10,2) | `locations.coordinate_x` | X coordinate | Internal |
| `coordinate_y` | DECIMAL(10,2) | `locations.coordinate_y` | Y coordinate | Internal |
| `coordinate_z` | DECIMAL(10,2) | `locations.coordinate_z` | Z coordinate | Internal |
| `bin_capacity` | DECIMAL(14,2) | `locations.bin_capacity` | Bin capacity | Internal |
| `current_stock_qty` | DECIMAL(14,2) | `locations.current_stock_qty` | Current stock | Internal |
| `utilization_pct` | DECIMAL(5,2) | `locations.utilization_pct` | Utilization % | Internal |
| `is_empty` | BOOLEAN | `locations.is_empty` | Empty flag | Public |
| `is_blocked` | BOOLEAN | `locations.is_blocked` | Blocked flag | Internal |
| `is_picking_face` | BOOLEAN | WMS extension | Picking face | Internal |
| `is_reserve_face` | BOOLEAN | WMS extension | Reserve face | Internal |
| `heat_score` | DECIMAL(5,2) | WMS extension | Heat score | Internal |
| `velocity_score` | DECIMAL(5,2) | WMS extension | Velocity score | Internal |
| `slotting_class` | ENUM | WMS extension | Slotting class | Internal |
| `status` | ENUM | `locations.status` | Status | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | Materialized view — derives from Location Hierarchy entities (Part 2) |
| **Index** | `idx_warehouse_locations_bin_id` (unique), `idx_warehouse_locations_barcode` (critical for scan lookup < 200ms), `idx_warehouse_locations_complete_code`, `idx_warehouse_locations_warehouse` |
| **Validation** | N/A (materialized view — read-only; refreshed event-driven) |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/warehouse-locations` (GET — list with filter), `/api/v1/warehouse-locations/:binId` (GET), `/api/v1/warehouse-locations/by-barcode/:barcode` (GET — fast lookup < 200ms), `/api/v1/warehouse-locations/by-code/:completeCode` (GET), `/api/v1/warehouse-locations/heatmap` (GET — heat map data), `/api/v1/warehouse-locations/empty` (GET — empty bins), `/api/v1/warehouse-locations/utilization` (GET — utilization by warehouse/zone) |
| **UI** | Location Lookup (fast barcode search), Warehouse Map (visual heatmap), Location Tree (expandable hierarchy), Empty Bin Finder, Utilization Dashboard |
| **Mobile** | Location barcode scan (primary), location info card on scan, navigation to location (Smart Warehouse Navigation per Ch 17 enhancement) |
| **Reports** | Location Utilization Report, Heat Map Report, Empty Bin Report, Blocked Bin Report, Picking Face vs Reserve Analysis |
| **Audit** | N/A (materialized view — source entities audited in Part 2) |

### 13-16. Security / AI / Performance / Example

**Security**: `complete_location_code`, `complete_location_name`, `barcode_value` = Public; capacity, utilization, heat score = Internal.

**AI**: Heat Map AI, Slotting AI, Path Optimization AI, Digital Twin AI.

**Performance**: Materialized view refreshed event-driven (on location changes); barcode lookup < 200ms per Ch 20 §20.10.

```json
{
  "bin_id": "01928f7a-...-bin-fg-01-01-05",
  "bin_code": "B05",
  "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S01-B05",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "warehouse_code": "WH-FG-01",
  "warehouse_name": "Finished Goods Warehouse 1",
  "zone_id": "01928f7a-...-zone-fg-02",
  "zone_code": "Z02",
  "zone_name": "Finished Goods Zone B",
  "zone_type": "FINISHED_GOODS",
  "aisle_id": "01928f7a-...-aisle-b",
  "aisle_code": "B",
  "aisle_name": "Aisle B",
  "rack_id": "01928f7a-...-rack-02",
  "rack_code": "R02",
  "rack_name": "Rack B-02",
  "shelf_id": "01928f7a-...-shelf-01",
  "shelf_code": "S01",
  "shelf_name": "Shelf 1",
  "complete_location_code": "WH-FG-01-Z02-B-R02-S01-B05",
  "complete_location_name": "Finished Goods Warehouse 1 > Finished Goods Zone B > Aisle B > Rack B-02 > Shelf 1 > Bin 05",
  "coordinate_x": 15.50,
  "coordinate_y": 8.20,
  "coordinate_z": 1.50,
  "bin_capacity": 100.0000,
  "current_stock_qty": 75.2000,
  "utilization_pct": 75.20,
  "is_empty": false,
  "is_blocked": false,
  "is_picking_face": true,
  "is_reserve_face": false,
  "heat_score": 88.00,
  "velocity_score": 92.50,
  "slotting_class": "A_FAST",
  "status": "ACTIVE"
}
```
