# Manual 1 · Part 2 · Entities 7-11 — Location Hierarchy (Zone, Aisle, Rack, Shelf, Bin)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entities | Zone (A.7), Aisle (A.8), Rack (A.9), Shelf (A.10), Bin (A.11) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Location Hierarchy Pattern

The Location Hierarchy defines the **physical storage address system** within a Warehouse. Every physical storage location is uniquely identified and barcode-labeled (per Ch 17 §17.3). The hierarchy is:

```
Warehouse
  └── Zone (functional area: Raw Material, Cold Storage, Dispatch, etc.)
       └── Aisle (vertical division within zone)
            └── Rack (vertical storage unit within aisle)
                 └── Shelf (horizontal level within rack)
                      └── Bin (smallest addressable storage unit — barcode-labeled)
```

### Shared Architectural Decisions

| Decision | Value |
|---|---|
| Physical storage | All 5 entities use a **single `locations` table** with `location_level` discriminator (ZONE, AISLE, RACK, SHELF, BIN) — single-table with type discriminator pattern |
| Prisma models | Separate models per level (Zone, Aisle, Rack, Shelf, Bin) for type safety, all backed by `locations` table |
| Barcode | Every level gets a barcode (per Ch 17 §17.3) — `SDH-WH01-Z01-A03-R02-S01-B05` |
| Coordinates | All levels support `coordinate_x/y/z` for Smart Warehouse Navigation (per Ch 17 enhancement) |
| Capacity tracking | Only Bin level tracks actual stock capacity; Zone/Rack levels aggregate |
| Self-reference | Each level has `parent_location_id` pointing to the level above |

### Single Table Schema

All 5 entities share the `locations` table:

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  code VARCHAR(50) NOT NULL,
  company_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  location_level VARCHAR(10) NOT NULL, -- ZONE | AISLE | RACK | SHELF | BIN
  parent_location_id UUID, -- FK self-ref
  name VARCHAR(100) NOT NULL,
  ...
  -- Level-specific fields (nullable, populated based on location_level)
  zone_type VARCHAR(20), -- ZONE only
  temperature_min_c DECIMAL(5,2), -- ZONE only (for cold zones)
  bin_capacity DECIMAL(14,2), -- BIN only
  ...
);
```

---

## Entity A.7 — Zone

### 1. Business Purpose

A `Zone` is a **functional area within a warehouse** — the top level of the location hierarchy. Per Volume 0 Chapter 1 §2.2, Sudhastar's warehouses have zones like Raw Material, Packaging, Finished Goods, Cold Storage, Blast Chiller, Dispatch, Quarantine, and Returns. Zones group related storage areas and enable zone-based putaway/picking strategies (per Ch 8 §8.3).

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L3 — Warehouse Manager |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Warehouse Module |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table | `locations WHERE location_level = 'ZONE'` |
| Prisma Model | `Zone` (view-based on `locations`) |

### 4. Field Dictionary

#### Universal Base + Location Common Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(50) | Yes | — | Unique per warehouse, format `Z##` | Zone code (e.g., `Z01`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (warehouse) | Parent warehouse |
| `warehouse_id` | UUID | Yes | — | FK to facilities (warehouse) | Same as facility_id for zones |
| `location_level` | ENUM | Yes | `ZONE` | Always `ZONE` | Discriminator |
| `parent_location_id` | UUID | No | NULL | FK self-ref | NULL for Zone (parent is warehouse) |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Operational status |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto | Last modification |
| `created_by` | UUID | Yes | — | FK to user_accounts | Creator |
| `updated_by` | UUID | Yes | — | FK to user_accounts | Modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft delete |
| `version` | INTEGER | Yes | `1` | — | Optimistic concurrency |

#### Zone-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100 | Zone display name (e.g., "Raw Material Zone") | Public | — |
| `description` | TEXT | No | NULL | — | Zone description | Internal | — |
| `zone_type` | ENUM | Yes | — | RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, BLAST_CHILLER, DISPATCH, QUARANTINE, RETURNS, GENERAL | Functional zone type (per Ch 5 §5.3) | Internal | Putaway AI |
| `zone_category` | ENUM | No | `STORAGE` | STORAGE, STAGING, RECEIVING, SHIPPING, CROSS_DOCK, QUALITY_HOLD | Operational zone category | Internal | — |
| `temperature_min_c` | DECIMAL(5,2) | Conditional | NULL | Required if zone_type IN (COLD_STORAGE, BLAST_CHILLER) | Min temperature (°C) | Internal | Cold chain AI |
| `temperature_max_c` | DECIMAL(5,2) | Conditional | NULL | Required if zone_type IN (COLD_STORAGE, BLAST_CHILLER) | Max temperature (°C) | Internal | Cold chain AI |
| `humidity_min_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Min humidity (%) | Internal | — |
| `humidity_max_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Max humidity (%) | Internal | — |
| `area_sqm` | DECIMAL(12,2) | No | NULL | > 0 | Zone area (sq meters) | Internal | Capacity AI |
| `aisle_count` | INTEGER | No | NULL | ≥ 0 | Number of aisles (denormalized) | Internal | — |
| `rack_count` | INTEGER | No | NULL | ≥ 0 | Number of racks (denormalized) | Internal | — |
| `bin_count` | INTEGER | No | NULL | ≥ 0 | Number of bins (denormalized) | Internal | — |
| `total_bin_capacity` | DECIMAL(14,2) | No | NULL | ≥ 0 | Sum of bin capacities | Internal | Capacity AI |
| `coordinate_x` | DECIMAL(10,2) | No | NULL | — | X coordinate on warehouse map (for Smart Navigation) | Internal | Navigation AI |
| `coordinate_y` | DECIMAL(10,2) | No | NULL | — | Y coordinate | Internal | Navigation AI |
| `coordinate_z` | DECIMAL(10,2) | No | NULL | — | Z coordinate (floor level) | Internal | Navigation AI |
| `access_restricted` | BOOLEAN | Yes | `false` | — | If true, only authorized users can access | Internal | — |
| `allowed_product_lines` | TEXT[] | No | NULL | Subset of product lines | Product lines allowed in this zone (NULL = all) | Internal | Putaway AI |
| `allowed_uom_classes` | TEXT[] | No | NULL | Subset of WEIGHT, COUNT, VOLUME, LENGTH | UOM classes allowed (NULL = all) | Internal | — |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated: `SDH-WH01-Z01` | Full barcode string (per Ch 17 §17.5) | Public | — |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Zone → Warehouse | N : 1 | `facility_id` → `facilities.id` | RESTRICT |
| Zone → Aisle | 1 : N | `locations.parent_location_id` (where level=AISLE) | CASCADE |
| Zone → Location (all descendants) | 1 : N | recursive: all locations under this zone | CASCADE |
| Zone → StockSummary | 1 : N | `stock_summary.zone_id` | RESTRICT |
| Zone → PutawayTask | 1 : N | `putaway_tasks.zone_id` | SET NULL |
| Zone → TempSensorLog | 1 : N | `temp_sensor_logs.zone_id` | CASCADE |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_locations` | PK | `id` |
| `uq_locations_zone_code` | UNIQUE | `warehouse_id, code, location_level` |
| `idx_locations_zone_type` | B-TREE | `warehouse_id, zone_type` |
| `idx_locations_parent` | B-TREE | `parent_location_id` |
| `idx_locations_barcode` | B-TREE | `barcode_value` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per warehouse | DB |
| 2 | `zone_type` required | DB |
| 3 | Temperature fields required for COLD_STORAGE / BLAST_CHILLER | DB CHECK |
| 4 | `temperature_max_c` > `temperature_min_c` | DB CHECK |
| 5 | `barcode_value` auto-generated from company-warehouse-zone code | App |
| 6 | `parent_location_id` must be NULL for zones | DB CHECK |
| 7 | `allowed_product_lines` if set must be valid product line values | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/warehouses/:wid/zones` (GET, POST), `/api/v1/zones/:id` (GET, PATCH), `/api/v1/zones/:id/aisles` (GET), `/api/v1/zones/:id/capacity` (GET) |
| **UI** | Zone List (AG Grid), Zone Detail (tabbed: Aisles, Racks, Bins, Capacity, Temp Logs), Warehouse Map (visual zones) |
| **Mobile** | Zone info card, zone-scoped tasks, zone barcode scan for navigation |
| **Reports** | Zone Utilization, Zone Capacity, Cold Chain Zone Compliance, Zone-wise Stock Report |
| **Audit** | Full audit; mandatory reason for zone_type change, temperature range change, access_restricted change |

### 13. Security Classification

| Fields | Classification |
|---|---|
| `name`, `code`, `barcode_value` | Public |
| `zone_type`, `zone_category`, `area_sqm`, `aisle_count`, `bin_count` | Internal |
| `temperature_*`, `humidity_*` | Internal |
| `coordinate_*` | Internal |
| `access_restricted`, `allowed_product_lines` | Internal |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Putaway AI | Uses `zone_type`, `allowed_product_lines` for putaway suggestions |
| Cold Chain AI | Monitors `temperature_*` for cold zones |
| Capacity Planning AI | Uses `total_bin_capacity`, `area_sqm` |
| Navigation AI | Uses `coordinate_*` for Smart Warehouse Navigation |

### 15. Performance Notes

- Row count: < 20 per warehouse
- Cache: Redis, TTL 1 hour
- Queries: by `warehouse_id + code`, `zone_type`, `barcode_value`

### 16. Example Records

```json
{
  "id": "01928f7a-...-zone01",
  "code": "Z01",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_level": "ZONE",
  "parent_location_id": null,
  "name": "Raw Material Zone A",
  "zone_type": "RAW_MATERIAL",
  "zone_category": "STORAGE",
  "area_sqm": 250.00,
  "aisle_count": 4,
  "rack_count": 12,
  "bin_count": 288,
  "total_bin_capacity": 14400.00,
  "barcode_value": "SDH-WH-RM-01-Z01",
  "coordinate_x": 0.00,
  "coordinate_y": 0.00,
  "status": "ACTIVE",
  "version": 1
}
```

Cold Storage Zone example:
```json
{
  "id": "01928f7a-...-zone05",
  "code": "Z05",
  "facility_id": "01928f7a-...-wh-cs-01",
  "warehouse_id": "01928f7a-...-wh-cs-01",
  "location_level": "ZONE",
  "name": "Cold Storage Zone - Dairy",
  "zone_type": "COLD_STORAGE",
  "temperature_min_c": 2.00,
  "temperature_max_c": 8.00,
  "humidity_min_pct": 60.00,
  "humidity_max_pct": 75.00,
  "allowed_product_lines": ["SWEETS", "RTE", "FROZEN"],
  "barcode_value": "SDH-WH-CS-01-Z05",
  "access_restricted": true,
  "status": "ACTIVE"
}
```

---

## Entity A.8 — Aisle

### 1. Business Purpose

An `Aisle` is a **vertical passageway within a zone** — the second level of the location hierarchy. Aisles group racks that are accessible from the same passageway. They enable aisle-based picking optimization (pick all items in one aisle before moving to the next) and support forklift navigation routing.

### 2-3. Owner & Schema

Same as Zone — stored in `locations` table with `location_level = 'AISLE'`. Owner: L3 Warehouse Manager.

### 4. Field Dictionary

#### Aisle-Specific Fields (in addition to Location Common)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100 | Aisle name (e.g., "Aisle A") | Public |
| `aisle_number` | VARCHAR(10) | Yes | — | Unique per zone | Aisle identifier (e.g., `A`, `B`, `01`) | Public |
| `parent_location_id` | UUID | Yes | — | FK to zone (location_level=ZONE) | Parent zone | Internal |
| `rack_count` | INTEGER | No | NULL | ≥ 0 | Number of racks (denormalized) | Internal |
| `bin_count` | INTEGER | No | NULL | ≥ 0 | Number of bins (denormalized) | Internal |
| `length_m` | DECIMAL(8,2) | No | NULL | > 0 | Aisle length (meters) | Internal |
| `width_m` | DECIMAL(8,2) | No | NULL | > 0 | Aisle width (meters) | Internal |
| `coordinate_x` | DECIMAL(10,2) | No | NULL | — | X coordinate (start of aisle) | Internal |
| `coordinate_y` | DECIMAL(10,2) | No | NULL | — | Y coordinate | Internal |
| `coordinate_z` | DECIMAL(10,2) | No | NULL | — | Z coordinate (floor level) | Internal |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated: `SDH-WH01-Z01-A03` | Full barcode | Public |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-12. Relationships / Index / Validation / API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **Relationships** | Aisle → Zone (N:1), Aisle → Rack (1:N), Aisle → StockSummary (1:N) |
| **Index** | `uq_locations_aisle_code` on `(parent_location_id, code)`, `idx_locations_aisle_barcode` |
| **Validation** | `parent_location_id` required (must be ZONE), `aisle_number` unique per zone, `barcode_value` auto-generated |
| **API** | `/api/v1/zones/:zid/aisles` (GET, POST), `/api/v1/aisles/:id` (GET, PATCH), `/api/v1/aisles/:id/racks` (GET) |
| **UI** | Aisle list within zone detail, aisle view on warehouse map |
| **Mobile** | Aisle info, aisle-scanned for navigation, aisle-based pick path |
| **Reports** | Aisle utilization, aisle-based pick efficiency |
| **Audit** | Full; mandatory reason for barcode reassignment |

### 13-14. Security & AI

| Fields | Classification |
|---|---|
| `name`, `aisle_number`, `barcode_value` | Public |
| `length_m`, `width_m`, `coordinate_*` | Internal |

**AI Usage**: Navigation AI (coordinate-based routing), Picking AI (aisle-sequenced pick optimization).

### 15-16. Performance & Example

- Row count: < 20 per zone
- Cache: Redis, TTL 1 hour

```json
{
  "id": "01928f7a-...-aisle01",
  "code": "A",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_level": "AISLE",
  "parent_location_id": "01928f7a-...-zone01",
  "name": "Aisle A",
  "aisle_number": "A",
  "rack_count": 3,
  "bin_count": 72,
  "length_m": 15.50,
  "width_m": 2.50,
  "coordinate_x": 5.00,
  "coordinate_y": 0.00,
  "barcode_value": "SDH-WH-RM-01-Z01-A",
  "status": "ACTIVE",
  "version": 1
}
```

---

## Entity A.9 — Rack

### 1. Business Purpose

A `Rack` is a **vertical storage structure within an aisle** — the third level. Racks hold multiple shelves at different heights. They are the primary unit of physical storage infrastructure and have capacity constraints that prevent overstocking.

### 4. Field Dictionary (Rack-Specific)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100 | Rack name (e.g., "Rack A-01") | Public |
| `rack_number` | VARCHAR(10) | Yes | — | Unique per aisle | Rack identifier | Public |
| `parent_location_id` | UUID | Yes | — | FK to aisle (location_level=AISLE) | Parent aisle | Internal |
| `shelf_count` | INTEGER | No | NULL | ≥ 0 | Number of shelves (denormalized) | Internal |
| `bin_count` | INTEGER | No | NULL | ≥ 0 | Number of bins (denormalized) | Internal |
| `height_m` | DECIMAL(8,2) | No | NULL | > 0 | Rack height (meters) | Internal |
| `width_m` | DECIMAL(8,2) | No | NULL | > 0 | Rack width (meters) | Internal |
| `depth_m` | DECIMAL(8,2) | No | NULL | > 0 | Rack depth (meters) | Internal |
| `max_load_kg` | DECIMAL(10,2) | No | NULL | > 0 | Maximum load capacity (kg) | Internal |
| `current_load_kg` | DECIMAL(10,2) | No | `0` | ≥ 0 | Current load (denormalized from bins) | Internal |
| `coordinate_x` | DECIMAL(10,2) | No | NULL | — | X coordinate | Internal |
| `coordinate_y` | DECIMAL(10,2) | No | NULL | — | Y coordinate | Internal |
| `coordinate_z` | DECIMAL(10,2) | No | NULL | — | Z coordinate | Internal |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated: `SDH-WH01-Z01-A03-R02` | Full barcode | Public |
| `rack_type` | ENUM | No | `STANDARD` | STANDARD, DRIVE_IN, CANTILEVER, MEZZANINE, MOBILE, FLOW_THROUGH | Rack structural type | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-12. Relationships / Index / Validation / API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **Relationships** | Rack → Aisle (N:1), Rack → Shelf (1:N), Rack → StockSummary (1:N) |
| **Index** | `uq_locations_rack_code` on `(parent_location_id, code)`, `idx_locations_rack_barcode` |
| **Validation** | `parent_location_id` required (must be AISLE), `rack_number` unique per aisle, `current_load_kg` ≤ `max_load_kg` (enforced at stock movement time), `barcode_value` auto-generated |
| **API** | `/api/v1/aisles/:aid/racks` (GET, POST), `/api/v1/racks/:id` (GET, PATCH), `/api/v1/racks/:id/shelves` (GET), `/api/v1/racks/:id/load` (GET) |
| **UI** | Rack list within aisle detail, rack 3D view on warehouse map, rack load indicator |
| **Mobile** | Rack info, rack barcode scan for putaway/picking, rack load warning |
| **Reports** | Rack utilization, rack load analysis, rack capacity report |
| **Audit** | Full; mandatory reason for `max_load_kg` change, `rack_type` change |

### 13-16. Security / AI / Performance / Example

**Security**: `name`, `rack_number`, `barcode_value` = Public; `height_m`, `width_m`, `depth_m`, `max_load_kg`, `current_load_kg`, `coordinate_*`, `rack_type` = Internal.

**AI**: Capacity AI (load optimization), Navigation AI (coordinate routing), Putaway AI (rack selection by load).

**Performance**: < 30 per aisle; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-rack01",
  "code": "R01",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_level": "RACK",
  "parent_location_id": "01928f7a-...-aisle01",
  "name": "Rack A-01",
  "rack_number": "01",
  "shelf_count": 4,
  "bin_count": 24,
  "height_m": 2.50,
  "width_m": 1.20,
  "depth_m": 0.80,
  "max_load_kg": 500.00,
  "current_load_kg": 320.50,
  "rack_type": "STANDARD",
  "coordinate_x": 5.00,
  "coordinate_y": 1.50,
  "barcode_value": "SDH-WH-RM-01-Z01-A-R01",
  "status": "ACTIVE",
  "version": 1
}
```

---

## Entity A.10 — Shelf

### 1. Business Purpose

A `Shelf` is a **horizontal level within a rack** — the fourth level. Shelves divide a rack into vertically stacked storage levels. Each shelf can hold multiple bins side by side. Shelves are useful for organizing products by size, weight, or accessibility (heavier items on lower shelves, lighter on higher).

### 4. Field Dictionary (Shelf-Specific)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100 | Shelf name (e.g., "Shelf 1") | Public |
| `shelf_number` | VARCHAR(10) | Yes | — | Unique per rack | Shelf identifier (e.g., `01`, `02`) | Public |
| `parent_location_id` | UUID | Yes | — | FK to rack (location_level=RACK) | Parent rack | Internal |
| `bin_count` | INTEGER | No | NULL | ≥ 0 | Number of bins (denormalized) | Internal |
| `height_from_floor_m` | DECIMAL(8,2) | No | NULL | > 0 | Height from floor (meters) | Internal |
| `shelf_height_m` | DECIMAL(8,2) | No | NULL | > 0 | Vertical space between shelves (meters) | Internal |
| `max_load_kg` | DECIMAL(10,2) | No | NULL | > 0 | Maximum load (kg) | Internal |
| `current_load_kg` | DECIMAL(10,2) | No | `0` | ≥ 0 | Current load (denormalized) | Internal |
| `coordinate_x` | DECIMAL(10,2) | No | NULL | — | X coordinate | Internal |
| `coordinate_y` | DECIMAL(10,2) | No | NULL | — | Y coordinate | Internal |
| `coordinate_z` | DECIMAL(10,2) | No | NULL | — | Z coordinate (height) | Internal |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated: `SDH-WH01-Z01-A03-R02-S01` | Full barcode | Public |
| `accessibility_level` | ENUM | No | `GROUND` | GROUND, REACHABLE, LADDER_REQUIRED, FORKLIFT_REQUIRED | Accessibility (ergonomics) | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-16. Relationships / Index / Validation / API / UI / Mobile / Reports / Audit / Security / AI / Performance / Example

| Section | Summary |
|---|---|
| **Relationships** | Shelf → Rack (N:1), Shelf → Bin (1:N), Shelf → StockSummary (1:N) |
| **Index** | `uq_locations_shelf_code` on `(parent_location_id, code)`, `idx_locations_shelf_barcode` |
| **Validation** | `parent_location_id` required (must be RACK), `shelf_number` unique per rack, `current_load_kg` ≤ `max_load_kg`, `barcode_value` auto-generated |
| **API** | `/api/v1/racks/:rid/shelves` (GET, POST), `/api/v1/shelves/:id` (GET, PATCH), `/api/v1/shelves/:id/bins` (GET) |
| **UI** | Shelf list within rack detail, shelf on warehouse map |
| **Mobile** | Shelf info, shelf barcode scan |
| **Reports** | Shelf utilization, shelf load analysis |
| **Audit** | Full; mandatory reason for `max_load_kg` change |
| **Security** | `name`, `shelf_number`, `barcode_value` = Public; `height_*`, `max_load_kg`, `current_load_kg`, `coordinate_*`, `accessibility_level` = Internal |
| **AI** | Putaway AI (accessibility-based placement — heavy items on GROUND shelves), Navigation AI |
| **Performance** | < 10 per rack; Redis cache TTL 1 hour |

```json
{
  "id": "01928f7a-...-shelf01",
  "code": "S01",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_level": "SHELF",
  "parent_location_id": "01928f7a-...-rack01",
  "name": "Shelf 1",
  "shelf_number": "01",
  "bin_count": 6,
  "height_from_floor_m": 0.50,
  "shelf_height_m": 0.60,
  "max_load_kg": 150.00,
  "current_load_kg": 85.20,
  "coordinate_x": 5.00,
  "coordinate_y": 1.50,
  "coordinate_z": 0.50,
  "barcode_value": "SDH-WH-RM-01-Z01-A-R01-S01",
  "accessibility_level": "GROUND",
  "status": "ACTIVE",
  "version": 1
}
```

---

## Entity A.11 — Bin

### 1. Business Purpose

A `Bin` is the **smallest addressable storage unit** — the fifth and final level of the location hierarchy. Bins are where actual stock is placed. Every bin has a unique barcode (per Ch 17 §17.3) that warehouse staff scan during putaway and picking operations. Bins track capacity, current stock, and enforce constraints (mixed SKU, mixed batch) per the warehouse configuration.

The Bin is the **leaf node** of the location tree. All inventory is stored at the bin level — `stock_summary` and `inventory_ledger` both reference `bin_id` (location_id) for every stock movement. The 5-minute batch recall KPI (Ch 1 §2.8) traverses from batch → bin → stock → sale.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L3 — Warehouse Manager |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Warehouse Module |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table | `locations WHERE location_level = 'BIN'` |
| Prisma Model | `Bin` (view-based on `locations`) |

### 4. Field Dictionary (Bin-Specific)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100 | Bin name (e.g., "Bin 01") | Public | — |
| `bin_number` | VARCHAR(10) | Yes | — | Unique per shelf | Bin identifier (e.g., `01`, `02`) | Public | — |
| `parent_location_id` | UUID | Yes | — | FK to shelf (location_level=SHELF) | Parent shelf | Internal | — |
| `bin_capacity` | DECIMAL(14,2) | Yes | — | > 0 | Maximum capacity (in bin_capacity_uom) | Internal | Capacity AI |
| `bin_capacity_uom` | VARCHAR(10) | Yes | — | FK to `uoms.code` | UOM for capacity (e.g., `KG`, `EA`) | Internal | — |
| `current_stock_qty` | DECIMAL(14,2) | No | `0` | ≥ 0 | Current stock quantity (denormalized from stock_summary) | Internal | Capacity AI |
| `current_stock_uom` | VARCHAR(10) | No | NULL | FK to `uoms.code` | UOM of current stock | Internal | — |
| `utilization_pct` | DECIMAL(5,2) | No | — | Generated: `(current_stock_qty / bin_capacity) * 100` | Utilization percentage | Internal | — |
| `coordinate_x` | DECIMAL(10,2) | No | NULL | — | X coordinate (for navigation) | Internal | Navigation AI |
| `coordinate_y` | DECIMAL(10,2) | No | NULL | — | Y coordinate | Internal | Navigation AI |
| `coordinate_z` | DECIMAL(10,2) | No | NULL | — | Z coordinate | Internal | Navigation AI |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated: `SDH-WH01-Z01-A03-R02-S01-B05` | Full barcode (per Ch 17 §17.5) | Public | — |
| `allowed_skus` | UUID[] | No | NULL | Array of product IDs | Specific SKUs allowed (NULL = any SKU respecting warehouse mixed_sku rules) | Internal | Putaway AI |
| `assigned_sku_id` | UUID | No | NULL | FK to `products.id` | If set, bin is dedicated to one SKU | Internal | Putaway AI |
| `last_stocked_at` | TIMESTAMPTZ | No | NULL | — | Last time stock was putaway here | Internal | — |
| `last_picked_at` | TIMESTAMPTZ | No | NULL | — | Last time stock was picked here | Internal | — |
| `is_empty` | BOOLEAN | Yes | `true` | Generated: `current_stock_qty = 0` | Whether bin is currently empty | Public | — |
| `is_blocked` | BOOLEAN | Yes | `false` | — | If true, no putaway allowed (quality hold, maintenance) | Internal | — |
| `blocked_reason` | VARCHAR(200) | No | NULL | Required if `is_blocked = true` | Reason for blocking | Internal | — |
| `blocked_until` | TIMESTAMPTZ | No | NULL | — | Auto-unblock time (NULL = manual unblock only) | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Bin → Shelf | N : 1 | `parent_location_id` → shelf | RESTRICT |
| Bin → StockSummary | 1 : N | `stock_summary.location_id` → `bin.id` | RESTRICT (cannot delete bin with stock) |
| Bin → InventoryLedger | 1 : N | `inventory_ledger.location_id` → `bin.id` | RESTRICT (cannot delete bin with ledger entries) |
| Bin → PutawayTask | 1 : N | `putaway_tasks.destination_bin_id` → `bin.id` | SET NULL |
| Bin → PickingTask | 1 : N | `picking_tasks.source_bin_id` → `bin.id` | SET NULL |
| Bin → CycleCountItem | 1 : N | `cycle_count_items.bin_id` → `bin.id` | SET NULL |
| Bin → Product (assigned) | N : 1 | `assigned_sku_id` → `products.id` | SET NULL |

### 6. Index Strategy

| Index | Type | Columns | Rationale |
|---|---|---|---|
| `uq_locations_bin_code` | UNIQUE | `parent_location_id, code` | Bin uniqueness per shelf |
| `idx_locations_bin_barcode` | B-TREE | `barcode_value` | Barcode scan lookup (< 150ms per Ch 17 §17.8) |
| `idx_locations_bin_warehouse` | B-TREE | `warehouse_id, location_level` | List all bins in warehouse |
| `idx_locations_bin_assigned_sku` | B-TREE | `assigned_sku_id WHERE assigned_sku_id IS NOT NULL` | Find bins assigned to a SKU |
| `idx_locations_bin_empty` | PARTIAL | `WHERE location_level = 'BIN' AND current_stock_qty = 0 AND is_blocked = false` | Find empty available bins (putaway optimization) |
| `idx_locations_bin_blocked` | PARTIAL | `WHERE location_level = 'BIN' AND is_blocked = true` | Find blocked bins |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per shelf | DB |
| 2 | `parent_location_id` required (must be SHELF) | DB |
| 3 | `bin_capacity` > 0 | DB CHECK |
| 4 | `current_stock_qty` ≤ `bin_capacity` (in same UOM) | App (enforced at stock movement time) |
| 5 | `barcode_value` auto-generated from full hierarchy path | App |
| 6 | If warehouse `mixed_sku_allowed = false`, bin can only hold one SKU | App (enforced at putaway) |
| 7 | If `assigned_sku_id` is set, only that SKU can be putaway here | App |
| 8 | If `is_blocked = true`, no putaway allowed | App |
| 9 | If `is_blocked = true`, `blocked_reason` required | DB CHECK |
| 10 | `blocked_until` if set must be future | App |
| 11 | `bin_capacity_uom` must be valid UOM of same class as `current_stock_uom` | App |
| 12 | Cannot delete bin with stock (`current_stock_qty > 0`) | App |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/shelves/:sid/bins` | GET | List bins on shelf | `WAREHOUSE:VIEW` |
| `/api/v1/bins/:id` | GET | Get bin details | `WAREHOUSE:VIEW` |
| `/api/v1/bins/:id` | PATCH | Update bin (capacity, assignment, block/unblock) | `WAREHOUSE:EDIT` |
| `/api/v1/bins/:id/stock` | GET | Get current stock in bin | `WAREHOUSE:VIEW` |
| `/api/v1/bins/:id/history` | GET | Get stock movement history | `WAREHOUSE:VIEW` |
| `/api/v1/bins/:id/block` | POST | Block bin | `WAREHOUSE:EDIT` |
| `/api/v1/bins/:id/unblock` | POST | Unblock bin | `WAREHOUSE:EDIT` |
| `/api/v1/bins/lookup?barcode=X` | GET | Lookup bin by barcode (< 150ms) | `WAREHOUSE:VIEW` |
| `/api/v1/bins/empty?warehouseId=X` | GET | Find empty available bins | `WAREHOUSE:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Bin List | AG Grid within shelf detail | `/organization/warehouses/:wid/locations` |
| Bin Detail | Tabbed: Stock, History, Capacity, Block/Unblock | `/organization/bins/:id` |
| Bin Map | Visual bin layout on shelf (color-coded by utilization) | `/organization/warehouses/:wid/map` |
| Bin Utilization Heatmap | Color-coded by utilization % | `/organization/warehouses/:wid/heatmap` |
| Blocked Bins | List of all blocked bins with reasons | `/organization/warehouses/:wid/blocked` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Bin barcode scan | Primary interaction — scan to confirm putaway/picking location |
| Bin info card | Show current stock, capacity, utilization |
| Bin block/unblock | Quick action from mobile |
| Smart Navigation | Navigate to bin with visual map (per Ch 17 enhancement) |
| Bin QR code | Alternative to barcode (scan for full location info) |

### 11. Reports

| Report | Use of Bin |
|---|---|
| Bin Utilization Report | Per-bin utilization, empty bins, over-utilized bins |
| Bin Occupancy Map | Visual heatmap of warehouse |
| Blocked Bin Report | All blocked bins with reasons and duration |
| Bin Movement History | All stock movements per bin |
| ABC Analysis by Bin | Bin classification by movement velocity |
| Bin Capacity Analysis | Bins at/near capacity |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (capacity, assigned_sku_id) | Yes | **Mandatory** | Permanent |
| BLOCK / UNBLOCK | Yes | **Mandatory** (reason for block) | Permanent |
| DELETE (soft — only if empty) | Yes | **Mandatory** | Permanent |
| Barcode reprint | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

### 13. Security Classification

| Fields | Classification | Access |
|---|---|---|
| `name`, `bin_number`, `barcode_value`, `is_empty` | Public | All warehouse-scoped users |
| `bin_capacity`, `current_stock_qty`, `utilization_pct`, `coordinate_*` | Internal | L3+ Warehouse |
| `assigned_sku_id`, `allowed_skus`, `is_blocked`, `blocked_reason` | Internal | L3+ Warehouse |
| `last_stocked_at`, `last_picked_at` | Internal | L3+ Warehouse |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Putaway AI | Suggests optimal bin based on SKU, capacity, mixed rules, accessibility |
| Picking AI | Optimizes pick path across bins |
| Capacity AI | Predicts bin overflow risk |
| Navigation AI | Uses coordinates for Smart Warehouse Navigation |
| ABC Classification AI | Classifies bins by movement velocity for cycle counting |
| Empty Bin Optimization | Suggests bin consolidation to free up space |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 1000 per warehouse (could be 10,000+ for large warehouses) |
| Cache strategy | Redis cache, TTL 5 min (shorter — changes frequently); barcode lookup cached separately with 1-hour TTL |
| Barcode lookup | Dedicated index on `barcode_value` — must be < 150ms per Ch 17 §17.8 |
| `current_stock_qty` | Updated by event handler on each stock movement (per Ch 10 Q1 event-updated summary pattern) |
| `utilization_pct` | Generated column (computed by DB) |
| `is_empty` | Generated column |
| Empty bin query | Partial index for fast putaway suggestions |
| N+1 prevention | Eager-load parent shelf → rack → aisle → zone when full path needed |

### 16. Example Records

### Example 1: Standard Bin (with stock)

```json
{
  "id": "01928f7a-...-bin01",
  "code": "B01",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_level": "BIN",
  "parent_location_id": "01928f7a-...-shelf01",
  "name": "Bin 01",
  "bin_number": "01",
  "bin_capacity": 50.00,
  "bin_capacity_uom": "KG",
  "current_stock_qty": 32.50,
  "current_stock_uom": "KG",
  "utilization_pct": 65.00,
  "barcode_value": "SDH-WH-RM-01-Z01-A-R01-S01-B01",
  "is_empty": false,
  "is_blocked": false,
  "last_stocked_at": "2026-07-07T08:30:00Z",
  "last_picked_at": "2026-07-06T16:45:00Z",
  "coordinate_x": 5.10,
  "coordinate_y": 1.55,
  "coordinate_z": 0.55,
  "status": "ACTIVE",
  "version": 15
}
```

### Example 2: Dedicated Bin (assigned to one SKU)

```json
{
  "id": "01928f7a-...-bin05",
  "code": "B05",
  "facility_id": "01928f7a-...-wh-fg-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_level": "BIN",
  "parent_location_id": "01928f7a-...-shelf02",
  "name": "Kaju Katli 500g - Dedicated Bin",
  "bin_number": "05",
  "bin_capacity": 100.00,
  "bin_capacity_uom": "KG",
  "current_stock_qty": 75.20,
  "current_stock_uom": "KG",
  "utilization_pct": 75.20,
  "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S01-B05",
  "assigned_sku_id": "01928f7a-...-product-kaju-katli-500",
  "is_empty": false,
  "is_blocked": false,
  "last_stocked_at": "2026-07-07T06:00:00Z",
  "last_picked_at": "2026-07-07T07:15:00Z",
  "status": "ACTIVE",
  "version": 42
}
```

### Example 3: Blocked Bin (quality hold)

```json
{
  "id": "01928f7a-...-bin12",
  "code": "B12",
  "facility_id": "01928f7a-...-wh-fg-01",
  "warehouse_id": "01928f7a-...-wh-fg-01",
  "location_level": "BIN",
  "parent_location_id": "01928f7a-...-shelf03",
  "name": "Bin 12 - Quality Hold",
  "bin_number": "12",
  "bin_capacity": 80.00,
  "bin_capacity_uom": "KG",
  "current_stock_qty": 45.00,
  "current_stock_uom": "KG",
  "utilization_pct": 56.25,
  "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S02-B12",
  "is_empty": false,
  "is_blocked": true,
  "blocked_reason": "QC Hold — pending inspection for batch B240315",
  "blocked_until": "2026-07-07T18:00:00Z",
  "status": "ACTIVE",
  "version": 8,
  "tags": ["quality-hold", "pending-inspection"]
}
```

### Example 4: Empty Bin (available for putaway)

```json
{
  "id": "01928f7a-...-bin20",
  "code": "B20",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "location_level": "BIN",
  "parent_location_id": "01928f7a-...-shelf04",
  "name": "Bin 20",
  "bin_number": "20",
  "bin_capacity": 60.00,
  "bin_capacity_uom": "KG",
  "current_stock_qty": 0.00,
  "current_stock_uom": null,
  "utilization_pct": 0.00,
  "barcode_value": "SDH-WH-RM-01-Z01-A-R01-S04-B20",
  "is_empty": true,
  "is_blocked": false,
  "status": "ACTIVE",
  "version": 1
}
```
