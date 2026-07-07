# Manual 1 · Part 6 · Entities 41-46 — WMS Extension to Location Hierarchy

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 6 — Warehouse Management Domain (WMS) |
| Entities | Warehouse Master (041), Zone (042), Aisle (043), Rack (044), Shelf (045), Bin (046) |
| Version | 1.0.0 |
| Status | ACTIVE — WMS Extension Layer |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §2.2, Ch 17, Part 2 (Organization Domain) |
| Last Updated | 2026-07-07 |

---

## Overview — WMS Extension Pattern

Entities 041–046 were **already defined in Part 2 (Organization Domain)** as the Location Hierarchy:

| Part 2 Entity | Part 6 Entity | Part 2 File |
|---|---|---|
| A.6 Warehouse | 041 Warehouse Master | `part-2-organization/06-warehouse.md` |
| A.7 Zone | 042 Zone Master | `part-2-organization/07-11-location-hierarchy.md` |
| A.8 Aisle | 043 Aisle Master | `part-2-organization/07-11-location-hierarchy.md` |
| A.9 Rack | 044 Rack Master | `part-2-organization/07-11-location-hierarchy.md` |
| A.10 Shelf | 045 Shelf Master | `part-2-organization/07-11-location-hierarchy.md` |
| A.11 Bin | 046 Bin Master | `part-2-organization/07-11-location-hierarchy.md` |

**Part 6 does NOT redefine these entities.** Instead, it adds a **WMS Extension Layer** — additional fields, behaviors, and configurations that transform the physical location hierarchy into an **intelligent warehouse execution system**.

### WMS Extension Architecture

```
PART 2 (Physical Location Hierarchy)
  Warehouse → Zone → Aisle → Rack → Shelf → Bin
        ↓
PART 6 (WMS Extension Layer)
  + Dock Management
  + Capacity Tracking
  + Slotting Intelligence
  + Movement Tracking
  + Task-Driven Execution
  + Heat Maps & Analytics
  + Digital Twin Ready
  + AI-Ready Metadata
```

### Why Extension Instead of Redefinition?

| Approach | Pros | Cons |
|---|---|---|
| **Redefine** (duplicate Part 2) | None | Massive duplication, sync issues, violation of "single source of truth" |
| **Extension** (Part 6 adds fields) | ✅ Single source of truth, no duplication, clear separation of concerns | Requires cross-reference |
| **Move** (relocate from Part 2 to Part 6) | Logical grouping | Breaks Part 2 Organization Domain completeness |

**Locked approach**: Extension — Part 2 owns the physical location hierarchy; Part 6 adds WMS-specific operational fields to the same entities (via Prisma schema extension or additional columns).

---

## WMS Extension Fields (Added to Part 2 Entities)

### Extension to Entity 041 — Warehouse Master (extends Part 2 A.6)

In addition to all fields defined in Part 2 (`part-2-organization/06-warehouse.md`), the following WMS-specific fields are added:

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `total_docks` | INTEGER | Yes | `0` | ≥ 0 | Number of docks (receiving + dispatch) | Internal | Dock scheduling AI |
| `receiving_dock_count` | INTEGER | Yes | `0` | ≥ 0 | Receiving docks | Internal | — |
| `dispatch_dock_count` | INTEGER | Yes | `0` | ≥ 0 | Dispatch docks | Internal | — |
| `total_aisles` | INTEGER | Yes | `0` | ≥ 0 | Total aisles (denormalized) | Internal | — |
| `total_racks` | INTEGER | Yes | `0` | ≥ 0 | Total racks (denormalized) | Internal | — |
| `total_shelves` | INTEGER | Yes | `0` | ≥ 0 | Total shelves (denormalized) | Internal | — |
| `total_bins` | INTEGER | Yes | `0` | ≥ 0 | Total bins (denormalized) | Internal | — |
| `empty_bins` | INTEGER | Yes | `0` | ≥ 0 | Empty bins (denormalized, event-updated) | Internal | Putaway AI |
| `occupied_bins` | INTEGER | Yes | `0` | ≥ 0 | Occupied bins (denormalized) | Internal | — |
| `bin_utilization_pct` | DECIMAL(5,2) | No | — | Generated: `(occupied_bins / total_bins) * 100` | Bin utilization % | Internal | Capacity AI |
| `capacity_utilization_pct` | DECIMAL(5,2) | No | — | Generated: `(used_bin_capacity / total_bin_capacity) * 100` | Capacity utilization % | Internal | Capacity AI |
| `total_operators` | INTEGER | Yes | `0` | ≥ 0 | Active warehouse operators | Internal | Labor planning AI |
| `active_tasks` | INTEGER | Yes | `0` | ≥ 0 | Active tasks (denormalized) | Internal | — |
| `pending_putaway_tasks` | INTEGER | Yes | `0` | ≥ 0 | Pending putaway tasks | Internal | — |
| `pending_picking_tasks` | INTEGER | Yes | `0` | ≥ 0 | Pending picking tasks | Internal | — |
| `avg_pick_time_min` | DECIMAL(8,2) | No | NULL | ≥ 0 | Average pick time (minutes) | Internal | Picking AI |
| `avg_putaway_time_min` | DECIMAL(8,2) | No | NULL | ≥ 0 | Average putaway time | Internal | — |
| `avg_travel_distance_m` | DECIMAL(10,2) | No | NULL | ≥ 0 | Average travel distance per pick | Internal | Path optimization AI |
| `last_movement_at` | TIMESTAMPTZ | No | NULL | — | Last warehouse movement | Internal | — |
| `is_digital_twin_enabled` | BOOLEAN | Yes | `false` | — | Digital Twin visualization enabled (per Ch 3 §3.8) | Internal | Digital Twin AI |
| `warehouse_map_file_id` | UUID | No | NULL | FK to `file_attachments.id` | 2D/3D warehouse map file | Internal | — |
| `layout_version` | VARCHAR(20) | No | NULL | — | Layout version (for map sync) | Internal | — |
| `operating_hours_start` | TIME | No | NULL | — | Operating hours start | Internal | — |
| `operating_hours_end` | TIME | No | NULL | — | Operating hours end | Internal | — |
| `is_24x7` | BOOLEAN | Yes | `false` | — | 24/7 operations | Internal | — |
| `shift_pattern` | ENUM | No | `DOUBLE_SHIFT` | SINGLE_SHIFT, DOUBLE_SHIFT, TRIPLE_SHIFT, CONTINUOUS | Shift pattern | Internal | Labor planning AI |

---

### Extension to Entity 042 — Zone Master (extends Part 2 A.7)

In addition to all fields in Part 2, the following WMS-specific fields are added:

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `is_receiving_zone` | BOOLEAN | Yes | `false` | — | Receiving zone (dock-adjacent) | Internal | — |
| `is_dispatch_zone` | BOOLEAN | Yes | `false` | — | Dispatch zone (dock-adjacent) | Internal | — |
| `is_qc_hold_zone` | BOOLEAN | Yes | `false` | — | QC hold zone (quarantine) | Internal | — |
| `is_picking_zone` | BOOLEAN | Yes | `false` | — | Dedicated picking zone | Internal | Picking AI |
| `is_packing_zone` | BOOLEAN | Yes | `false` | — | Packing zone | Internal | — |
| `is_cross_dock_zone` | BOOLEAN | Yes | `false` | — | Cross-docking zone (per WMS 2.0 enhancement) | Internal | Cross-dock AI |
| `is_returns_zone` | BOOLEAN | Yes | `false` | — | Returns processing zone | Internal | — |
| `is_damaged_zone` | BOOLEAN | Yes | `false` | — | Damaged goods zone | Internal | — |
| `is_scrap_zone` | BOOLEAN | Yes | `false` | — | Scrap zone | Internal | — |
| `is_bulk_storage` | BOOLEAN | Yes | `false` | — | Bulk storage zone | Internal | — |
| `is_fast_moving_zone` | BOOLEAN | Yes | `false` | — | Fast-moving zone (slotting) | Internal | Slotting AI |
| `is_slow_moving_zone` | BOOLEAN | Yes | `false` | — | Slow-moving zone | Internal | — |
| `dock_ids` | UUID[] | No | `ARRAY[]::UUID[]` | FK array to `docks.id` | Associated docks (for receiving/dispatch zones) | Internal | — |
| `dock_proximity_m` | DECIMAL(8,2) | No | NULL | ≥ 0 | Distance to nearest dock (meters) | Internal | Path optimization AI |
| `travel_path_priority` | INTEGER | No | NULL | 1–10 | Travel path priority (lower = higher traffic) | Internal | Congestion AI |
| `congestion_level` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH, CRITICAL | Current congestion (event-updated) | Internal | Congestion AI |
| `heat_score` | DECIMAL(5,2) | No | NULL | 0–100 | Heat map score (movement frequency) | Internal | Heat map AI |
| `slotting_score` | DECIMAL(5,2) | No | NULL | 0–100 | Slotting suitability score | Internal | Slotting AI |
| `recommended_product_lines` | TEXT[] | No | NULL | Product lines recommended for this zone | Internal | Slotting AI |
| `replenishment_source_zone_id` | UUID | No | NULL | FK self-ref | Source zone for replenishment | Internal | Replenishment AI |
| `replenishment_target_zone_id` | UUID | No | NULL | FK self-ref | Target zone for replenishment | Internal | — |

---

### Extension to Entity 043 — Aisle Master (extends Part 2 A.8)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `aisle_direction` | ENUM | No | `TWO_WAY` | ONE_WAY_NORTH, ONE_WAY_SOUTH, TWO_WAY | Traffic direction | Internal | Path optimization AI |
| `travel_speed_limit_kmh` | DECIMAL(5,2) | No | `5.00` | > 0 | Speed limit (for forklifts/AGVs) | Internal | — |
| `is_forklift_allowed` | BOOLEAN | Yes | `true` | — | Forklift access | Internal | — |
| `is_agv_enabled` | BOOLEAN | Yes | `false` | — | AGV navigation enabled (per Ch 24 §24.8) | Internal | Robotics AI |
| `is_pedestrian_only` | BOOLEAN | Yes | `false` | — | Pedestrian-only (no vehicles) | Internal | — |
| `traffic_density` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Traffic density (event-updated) | Internal | Congestion AI |
| `avg_traversal_time_sec` | DECIMAL(8,2) | No | NULL | ≥ 0 | Average traversal time | Internal | — |
| `optimal_pick_sequence` | INTEGER | No | NULL | ≥ 1 | Optimal pick sequence within warehouse | Internal | Pick path AI |

---

### Extension to Entity 044 — Rack Master (extends Part 2 A.9)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `rack_orientation` | ENUM | No | `NORTH_SOUTH` | NORTH_SOUTH, EAST_WEST | Rack orientation | Internal | Digital Twin |
| `is_mobile_rack` | BOOLEAN | Yes | `false` | — | Mobile rack (movable) | Internal | — |
| `is_drive_in_rack` | BOOLEAN | Yes | `false` | — | Drive-in rack (forklift enters) | Internal | — |
| `is_cantilever_rack` | BOOLEAN | Yes | `false` | — | Cantilever (for long items) | Internal | — |
| `is_mezzanine_rack` | BOOLEAN | Yes | `false` | — | Mezzanine (multi-tier) | Internal | — |
| `is_flow_through_rack` | BOOLEAN | Yes | `false` | — | Flow-through (gravity-fed) | Internal | — |
| `slotting_recommendation` | ENUM | No | NULL | A_ITEM, B_ITEM, C_ITEM, SLOW_MOVING, FAST_MOVING | AI-recommended slotting | Internal | Slotting AI |
| `slotting_score` | DECIMAL(5,2) | No | NULL | 0–100 | Slotting suitability score | Internal | Slotting AI |
| `abc_class` | ENUM | No | NULL | A, B, C | ABC classification (per Q9) | Internal | Cycle count AI |
| `velocity_score` | DECIMAL(5,2) | No | NULL | 0–100 | Movement velocity score | Internal | Slotting AI |
| `last_reslot_date` | DATE | No | NULL | — | Last reslotting date | Internal | — |
| `reslot_recommended` | BOOLEAN | Yes | `false` | — | AI recommends reslotting | Internal | Slotting AI |

---

### Extension to Entity 045 — Shelf Master (extends Part 2 A.10)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `shelf_depth_category` | ENUM | No | `STANDARD` | SHALLOW, STANDARD, DEEP, EXTRA_DEEP | Depth category | Internal | Slotting AI |
| `is_picking_friendly` | BOOLEAN | Yes | `true` | — | Ergonomic picking (waist height) | Internal | — |
| `ergonomic_score` | DECIMAL(5,2) | No | NULL | 0–100 | Ergonomic score (accessibility) | Internal | Slotting AI |
| `pick_frequency_per_day` | DECIMAL(8,2) | No | `0` | ≥ 0 | Pick frequency (event-updated) | Internal | Heat map AI |

---

### Extension to Entity 046 — Bin Master (extends Part 2 A.11)

In addition to all fields in Part 2, the following WMS-specific fields are added:

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `slotting_class` | ENUM | No | NULL | A_FAST, B_MEDIUM, C_SLOW, D_DEAD | Slotting classification | Internal | Slotting AI |
| `is_picking_face` | BOOLEAN | Yes | `false` | — | Primary picking face (vs reserve storage) | Internal | Picking AI |
| `is_reserve_face` | BOOLEAN | Yes | `false` | — | Reserve storage (replenishes picking face) | Internal | Replenishment AI |
| `picking_face_id` | UUID | No | NULL | FK self-ref | Linked picking face (if this is reserve) | Internal | Replenishment AI |
| `replenishment_threshold` | DECIMAL(14,2) | No | NULL | ≥ 0 | Threshold to trigger replenishment from reserve | Internal | Replenishment AI |
| `replenishment_qty` | DECIMAL(14,2) | No | NULL | ≥ 0 | Standard replenishment quantity | Internal | — |
| `velocity_score` | DECIMAL(5,2) | No | NULL | 0–100 | Movement velocity | Internal | Slotting AI |
| `pick_count_30d` | INTEGER | Yes | `0` | ≥ 0 | Pick count in last 30 days (event-updated) | Internal | Heat map AI |
| `pick_count_90d` | INTEGER | Yes | `0` | ≥ 0 | Pick count in last 90 days | Internal | Slotting AI |
| `last_pick_at` | TIMESTAMPTZ | No | NULL | — | Last pick timestamp | Internal | — |
| `heat_score` | DECIMAL(5,2) | No | NULL | 0–100 | Heat map score | Internal | Heat map AI |
| `is_cross_dock_bin` | BOOLEAN | Yes | `false` | — | Cross-dock bin (per WMS 2.0) | Internal | Cross-dock AI |
| `is_replenishment_pending` | BOOLEAN | Yes | `false` | — | Replenishment pending flag | Internal | — |
| `last_replenished_at` | TIMESTAMPTZ | No | NULL | — | Last replenishment timestamp | Internal | — |
| `slotting_recommendation` | ENUM | No | NULL | KEEP, MOVE_TO_FAST, MOVE_TO_SLOW, MOVE_TO_PICKING, MOVE_TO_RESERVE | AI slotting recommendation | Internal | Slotting AI |
| `reslot_priority` | INTEGER | No | NULL | 1–10 | Reslot priority (1 = highest) | Internal | Slotting AI |

---

## WMS 2.0 Intelligence Layer (Per Enterprise Architect Enhancement)

The WMS 2.0 enhancement is **fully integrated** via the extension fields above. Here's how each capability maps:

| WMS 2.0 Capability | Enabled By | Phase |
|---|---|---|
| **AI-driven slotting** | `slotting_score`, `slotting_recommendation`, `reslot_priority`, `velocity_score` on Rack/Shelf/Bin | Day One (fields); AI activation Phase 2 |
| **Dynamic pick-path optimization** | `optimal_pick_sequence`, `travel_path_priority`, `avg_travel_distance_m`, `dock_proximity_m` | Day One (fields); AI activation Phase 2 |
| **Heat maps** | `heat_score` on Zone/Bin, `pick_count_30d/90d`, `traffic_density` | Day One (event-updated) |
| **Congestion prediction** | `congestion_level`, `traffic_density`, `avg_traversal_time_sec` | Day One (fields); AI activation Phase 2 |
| **Dock appointment scheduling** | `dock_ids`, `dock_proximity_m` on Zone + Dock Master entity (047) | Day One |
| **Wave and cluster picking** | Warehouse Task entity (050) `wave_id`, `cluster_id` | Day One |
| **Multi-order batch picking** | Warehouse Task entity (050) `batch_pick_id`, `order_group_id` | Day One |
| **Cross-docking workflows** | `is_cross_dock_zone`, `is_cross_dock_bin` | Day One |
| **Automatic replenishment** | `is_picking_face`, `is_reserve_face`, `picking_face_id`, `replenishment_threshold`, `replenishment_qty`, `is_replenishment_pending` | Day One (event-triggered) |
| **Digital Twin visualization** | `is_digital_twin_enabled`, `warehouse_map_file_id`, `layout_version`, `rack_orientation`, coordinates (from Part 2) | Day One (schema); Phase 2 (visualization) |
| **AGV/Robotics ready** | `is_agv_enabled`, `is_forklift_allowed`, `travel_speed_limit_kmh`, `aisle_direction` | Day One (fields); Phase 3+ (per Ch 24 §24.8) |

---

## Updated Index Strategy (WMS Extension)

Additional indexes for WMS-specific queries (added to Part 2 base indexes):

| Index Name | Type | Table | Columns | Rationale |
|---|---|---|---|---|
| `idx_warehouse_utilization` | B-TREE | `facilities` (WAREHOUSE) | `bin_utilization_pct DESC` | Utilization ranking |
| `idx_zone_heat_score` | B-TREE | `locations` (ZONE) | `heat_score DESC` | Heat map queries |
| `idx_zone_congestion` | PARTIAL | `locations` (ZONE) | `zone_id WHERE congestion_level IN ('HIGH', 'CRITICAL')` | Congestion alerts |
| `idx_bin_picking_face` | PARTIAL | `locations` (BIN) | `warehouse_id WHERE is_picking_face = true AND is_empty = false` | Picking face lookup |
| `idx_bin_reserve_face` | PARTIAL | `locations` (BIN) | `picking_face_id WHERE is_reserve_face = true` | Reserve lookup |
| `idx_bin_replenishment_pending` | PARTIAL | `locations` (BIN) | `warehouse_id WHERE is_replenishment_pending = true` | Replenishment queue |
| `idx_bin_heat_score` | B-TREE | `locations` (BIN) | `heat_score DESC NULLS LAST` | Heat map |
| `idx_bin_slotting_recommendation` | PARTIAL | `locations` (BIN) | `slotting_recommendation WHERE slotting_recommendation IS NOT NULL` | Reslot queue |
| `idx_bin_velocity` | B-TREE | `locations` (BIN) | `velocity_score DESC NULLS LAST` | Velocity analysis |
| `idx_rack_reslot` | PARTIAL | `locations` (RACK) | `reslot_recommended WHERE reslot_recommended = true` | Reslot queue |
| `idx_aisle_congestion` | PARTIAL | `locations` (AISLE) | `aisle_id WHERE traffic_density IN ('HIGH', 'CRITICAL')` | Congestion alerts |

---

## Updated Validation Rules (WMS Extension)

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | If `is_receiving_zone = true`, zone must have associated `dock_ids` | App | Service-layer validation |
| 2 | If `is_dispatch_zone = true`, zone must have associated `dock_ids` | App | Service-layer validation |
| 3 | `is_picking_face` and `is_reserve_face` are mutually exclusive (a bin is one or the other, not both) | DB | CHECK constraint |
| 4 | If `is_reserve_face = true`, `picking_face_id` required | DB | CHECK constraint |
| 5 | `replenishment_threshold` < `bin_capacity` | App | Service-layer |
| 6 | `congestion_level` auto-updated by event handler based on active tasks in zone | App | Event-driven |
| 7 | `heat_score` auto-computed by scheduled job based on movement frequency | App | Scheduler Service |
| 8 | `slotting_recommendation` set by AI service (Phase 2); cannot be set manually | App | Service-layer (AI-only) |
| 9 | `bin_utilization_pct` auto-computed (generated column) | DB | Generated |
| 10 | If `is_cross_dock_zone = true`, zone must be dock-adjacent (`dock_proximity_m` < 50) | App | Service-layer |

---

## WMS Extension Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| UPDATE (slotting fields: `slotting_recommendation`, `reslot_priority`, `slotting_class`) | Yes | Optional | Permanent |
| UPDATE (capacity fields: `total_capacity`, `utilized_capacity`) | Yes | Optional | Permanent |
| UPDATE (`is_picking_face`, `is_reserve_face`, `picking_face_id`) | Yes | **Mandatory** | Permanent |
| UPDATE (`replenishment_threshold`, `replenishment_qty`) | Yes | **Mandatory** | Permanent |
| UPDATE (`operating_hours_*`, `shift_pattern`) | Yes | **Mandatory** | Permanent |
| Reslot execution | Yes | **Mandatory** | Permanent |
| Congestion level change to CRITICAL | Yes (auto-logged) | N/A | 7 years |

---

## Example: Extended Warehouse Record (with WMS fields)

```json
{
  "id": "01928f7a-...-wh-fg-01",
  "code": "WH-FG-01",
  "name": "Finished Goods Warehouse 1",
  "warehouse_type": "FINISHED_GOODS",
  "total_docks": 4,
  "receiving_dock_count": 2,
  "dispatch_dock_count": 2,
  "total_aisles": 12,
  "total_racks": 36,
  "total_shelves": 144,
  "total_bins": 720,
  "empty_bins": 180,
  "occupied_bins": 540,
  "bin_utilization_pct": 75.00,
  "capacity_utilization_pct": 72.50,
  "total_operators": 8,
  "active_tasks": 24,
  "pending_putaway_tasks": 5,
  "pending_picking_tasks": 12,
  "avg_pick_time_min": 3.50,
  "avg_putaway_time_min": 4.20,
  "avg_travel_distance_m": 45.50,
  "is_digital_twin_enabled": true,
  "warehouse_map_file_id": "01928f7a-...-file-map-001",
  "layout_version": "v2.1",
  "operating_hours_start": "06:00:00",
  "operating_hours_end": "22:00:00",
  "is_24x7": false,
  "shift_pattern": "DOUBLE_SHIFT",
  "status": "ACTIVE",
  "tags": ["high-utilization", "digital-twin-enabled"]
}
```

## Example: Extended Bin Record (with WMS 2.0 fields)

```json
{
  "id": "01928f7a-...-bin-fg-01-01",
  "code": "B05",
  "barcode_value": "SDH-WH-FG-01-Z02-B-R02-S01-B05",
  "is_picking_face": true,
  "is_reserve_face": false,
  "picking_face_id": null,
  "replenishment_threshold": 20.0000,
  "replenishment_qty": 50.0000,
  "velocity_score": 92.50,
  "pick_count_30d": 145,
  "pick_count_90d": 412,
  "last_pick_at": "2026-07-07T14:30:00Z",
  "heat_score": 88.00,
  "is_cross_dock_bin": false,
  "is_replenishment_pending": false,
  "last_replenished_at": "2026-07-07T08:00:00Z",
  "slotting_class": "A_FAST",
  "slotting_recommendation": "KEEP",
  "reslot_priority": null,
  "status": "ACTIVE"
}
```
