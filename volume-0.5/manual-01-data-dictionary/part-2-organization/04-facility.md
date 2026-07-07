# Manual 1 · Part 2 · Entity 4 — Facility

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entity | Facility |
| Entity Code | A.4 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `Facility` entity represents a **physical operational location** within a Company — a factory, warehouse, retail store, restaurant outlet, distribution center, or corporate office. It is the **primary scoping dimension** for operational data: inventory, production, transfers, and tasks are all scoped to a Facility.

Per Volume 0 Chapter 1 §2.2, Sudhastar's facilities include manufacturing plants, multiple warehouse types (raw material, packaging, finished goods, cold storage, blast chiller, dispatch), Sudhamrit retail stores, and Sudhamrit Food Joint outlets.

The Facility entity is the **parent** of specialized facility types (Plant, Warehouse, Store, Outlet). It uses a **single-table inheritance** pattern: the `facility_type` discriminator determines which specialization fields apply. This avoids polymorphic joins while keeping the schema normalized.

Facility is critical for:
- **Multi-facility data isolation** (per Ch 6 §6.9) — users see only their assigned facilities
- **Configuration scoping** (Layer 4 of 7-level config hierarchy, per Ch 8 §8.2)
- **Permission scoping** (Layer 3 of 6-layer RBAC, per Ch 6 §6.7)
- **Barcode generation** (facility code embedded in barcodes, per Ch 17 §17.5)

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Operations Head |
| Data Owner | Administration Head |
| Technical Owner | Backend Lead — Organization Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `facilities` |
| Prisma Model | `Facility` |
| File Location | `prisma/schema/master/organization/facility.prisma` |
| Partitioning | None (low volume — max ~100 facilities) |
| Lifecycle | Master Data Lifecycle (Volume 0 Ch 7 §7.5) |
| Pattern | Single-table inheritance (facility_type discriminator) |

---

## 4. Field Dictionary

### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(20) | Yes | — | Unique per company, format `^[A-Z]{2,5}-[A-Z0-9]{2,5}$`, Number Series `FAC-` | Facility code (e.g., `PLT-01`, `WH-01`, `STR-04`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | Self-reference (facility's own ID for `facility_id` universal base field) | **Exception**: Set to self (`id`) for Facility — Facility IS the scope |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification (UTC) |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

### 4.2 Facility-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 3, max 100 chars | Facility display name (e.g., "Pune Factory 1") | Public | — |
| `name_short` | VARCHAR(30) | Yes | — | Min 2, max 30 chars | Short name | Public | — |
| `description` | TEXT | No | NULL | — | Detailed description | Internal | — |
| `facility_type` | ENUM | Yes | — | PLANT, WAREHOUSE, STORE, OUTLET, DISTRIBUTION_CENTER, CORPORATE_OFFICE | Facility type discriminator (determines specialization fields) | Internal | — |
| `business_unit_id` | UUID | Yes | — | FK to `business_units.id` | Owning business unit | Internal | — |
| `primary_brand_id` | UUID | No | NULL | FK to `brands.id` | Primary brand operated at this facility | Internal | — |
| `ownership_type` | ENUM | Yes | `OWNED` | OWNED, FRANCHISE, LEASED | Ownership model (per Ch 1 §2.6, Q5 lock-in) | Internal | — |
| `parent_facility_id` | UUID | No | NULL | FK self-ref | Parent facility (e.g., warehouse belongs to plant) | Internal | — |
| `manager_employee_id` | UUID | No | NULL | FK to `employees.id` | Facility manager (L3 role) | Internal | — |
| `address_line1` | VARCHAR(200) | Yes | — | Min 5 chars | Physical address | Public | — |
| `address_line2` | VARCHAR(200) | No | NULL | — | Address line 2 | Public | — |
| `city` | VARCHAR(100) | Yes | — | — | City | Public | — |
| `state` | VARCHAR(50) | Yes | — | Valid state/province | State | Public | — |
| `country` | CHAR(2) | Yes | `IN` | ISO 3166-1 alpha-2 | Country code | Public | — |
| `pincode` | VARCHAR(10) | Yes | — | Regex per country | PIN/postal code | Internal | — |
| `latitude` | DECIMAL(10,7) | No | NULL | -90 to 90 | GPS latitude (for maps, geofencing) | Internal | — |
| `longitude` | DECIMAL(10,7) | No | NULL | -180 to 180 | GPS longitude | Internal | — |
| `timezone` | VARCHAR(50) | Yes | — | IANA timezone; default from company | Facility-specific timezone | Public | — |
| `locale` | VARCHAR(10) | Yes | — | BCP 47; default from company | Facility-specific locale | Public | — |
| `phone` | VARCHAR(20) | No | NULL | E.164 format | Facility contact phone | Public | — |
| `email` | VARCHAR(200) | No | NULL | Email format | Facility contact email | Public | — |
| `operating_hours_start` | TIME | No | NULL | — | Default operating hours start (local time) | Internal | — |
| `operating_hours_end` | TIME | No | NULL | Must be > start (or wraps overnight) | Default operating hours end | Internal | — |
| `operating_days` | VARCHAR(20)[] | No | `ARRAY['MON','TUE','WED','THU','FRI','SAT']::VARCHAR[]` | Subset of MON-SUN | Operating days of week | Internal | — |
| `is_operational_24x7` | BOOLEAN | Yes | `false` | — | If true, facility operates 24/7 | Internal | — |
| `fssai_license_no` | VARCHAR(17) | No | NULL | Regex `^[0-9]{14}$` | Facility-specific FSSAI license (if separate from company) | Confidential | Compliance |
| `fssai_license_expiry` | DATE | No | NULL | Must be future if set | FSSAI license expiry | Internal | Expiry prediction |
| `gst_registration_no` | VARCHAR(15) | No | NULL | GSTIN regex | Facility-specific GST registration (if separate) | Confidential | — |
| `default_cost_center_id` | UUID | No | NULL | FK to `cost_centers.id` | Default cost center for this facility | Internal | — |
| `total_area_sqm` | DECIMAL(12,2) | No | NULL | > 0 | Total facility area in square meters | Internal | — |
| `storage_capacity_sqm` | DECIMAL(12,2) | No | NULL | ≥ 0 | Usable storage area | Internal | Capacity planning |
| `barcode_prefix` | VARCHAR(10) | Yes | — | Format `^[A-Z0-9]{2,8}$`, unique per company | Prefix used in facility barcodes (per Ch 17 §17.5) | Internal | — |
| `number_series_scope` | ENUM | Yes | `FACILITY` | GLOBAL, COMPANY, FACILITY | Number series scope for documents generated at this facility | Internal | — |
| `default_currency_code` | CHAR(3) | No | NULL | ISO 4217; NULL = inherit from company | Facility-specific currency override | Internal | — |
| `effective_from` | DATE | No | NULL | — | Effective dating | Internal | — |
| `effective_to` | DATE | No | NULL | Must be > effective_from | Effective dating end | Internal | — |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

### 4.3 Specialization Fields (conditional on `facility_type`)

These fields are nullable and only populated for specific facility types:

| Field | Type | Required When | Validation | Description |
|---|---|---|---|---|
| `plant_production_lines` | INTEGER | `facility_type = PLANT` | > 0 | Number of production lines (Plant only) |
| `plant_product_lines` | TEXT[] | `facility_type = PLANT` | Subset of: SWEETS, NAMEKEEN, BAKERY, SNACKS, RTE, FROZEN, PACKAGING | Product lines manufactured (Plant only) |
| `warehouse_type` | ENUM | `facility_type = WAREHOUSE` | RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, BLAST_CHILLER, DISPATCH, QUARANTINE, RETURNS, GENERAL | Warehouse specialization (per Ch 1 §2.2) |
| `warehouse_zone_count` | INTEGER | `facility_type = WAREHOUSE` | ≥ 0 | Number of zones in warehouse |
| `temperature_min_c` | DECIMAL(5,2) | `warehouse_type = COLD_STORAGE or BLAST_CHILLER` | — | Minimum temperature (°C) |
| `temperature_max_c` | DECIMAL(5,2) | `warehouse_type = COLD_STORAGE or BLAST_CHILLER` | Must be > temperature_min_c | Maximum temperature (°C) |
| `humidity_min_pct` | DECIMAL(5,2) | `facility_type = WAREHOUSE` | 0–100 | Minimum humidity (%) |
| `humidity_max_pct` | DECIMAL(5,2) | `facility_type = WAREHOUSE` | 0–100, must be > humidity_min_pct | Maximum humidity (%) |
| `store_code_pos` | VARCHAR(20) | `facility_type = STORE` | — | Store code in POS system |
| `store_area_sqm` | DECIMAL(12,2) | `facility_type = STORE` | > 0 | Retail store area |
| `store_shelf_count` | INTEGER | `facility_type = STORE` | ≥ 0 | Number of shelves |
| `outlet_seating_capacity` | INTEGER | `facility_type = OUTLET` | ≥ 0 | Restaurant seating capacity |
| `outlet_kitchen_type` | ENUM | `facility_type = OUTLET` | LIVE_KITCHEN, CENTRAL_KITCHEN, CLOUD_KITCHEN | Kitchen type (per Ch 1 §2.2) |
| `dc_vehicle_capacity` | INTEGER | `facility_type = DISTRIBUTION_CENTER` | ≥ 0 | Vehicle capacity at DC |

---

## 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Facility → Company | N : 1 | inbound | `facilities.company_id` → `companies.id` | RESTRICT | Cannot delete company with active facilities |
| Facility → BusinessUnit | N : 1 | inbound | `facilities.business_unit_id` → `business_units.id` | RESTRICT | Cannot delete BU with active facilities |
| Facility → Brand (primary) | N : 1 | inbound | `facilities.primary_brand_id` → `brands.id` | SET NULL | Primary brand becomes NULL |
| Facility → Facility (parent) | N : 1 | self-ref | `facilities.parent_facility_id` | SET NULL | Child facility becomes standalone |
| Facility → Employee (manager) | N : 1 | inbound | `facilities.manager_employee_id` → `employees.id` | SET NULL | Manager becomes NULL |
| Facility → CostCenter | N : 1 | inbound | `facilities.default_cost_center_id` → `cost_centers.id` | SET NULL | Default cost center cleared |
| Facility → Location (Zone/Rack/Shelf/Bin) | 1 : N | outbound | `locations.facility_id` | RESTRICT | Cannot delete facility with locations |
| Facility → Department | 1 : N | outbound | `departments.facility_id` | SET NULL | Departments lose facility assignment |
| Facility → Employee (assigned) | 1 : N | outbound | `employees.primary_facility_id` | SET NULL | Employees lose primary facility |
| Facility → Inventory | 1 : N | outbound | `stock_summary.facility_id` | RESTRICT | Cannot delete facility with stock |
| Facility → UserAccount (scope) | 1 : N | outbound | `user_facility_scope.facility_id` | CASCADE | User scopes removed |
| Facility → Device | 1 : N | outbound | `devices.facility_id` | CASCADE | Devices unassigned |
| Facility → FileAttachment | 1 : N | outbound | `file_attachments.facility_id` | SET NULL | Files retain facility_id for audit |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_facilities` | PRIMARY KEY | `id` | Default PK |
| `uq_facilities_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_facilities_barcode_prefix` | UNIQUE | `company_id, barcode_prefix` | Barcode prefix uniqueness per company |
| `idx_facilities_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_facilities_type` | B-TREE | `company_id, facility_type` | Filter by type (plant/warehouse/store) |
| `idx_facilities_bu` | B-TREE | `business_unit_id` | Filter by business unit |
| `idx_facilities_parent` | B-TREE | `parent_facility_id` | Hierarchy traversal |
| `idx_facilities_manager` | B-TREE | `manager_employee_id` | Find facilities by manager |
| `idx_facilities_geo` | GIST | `latitude, longitude` (PostGIS) | Geospatial queries (nearest facility) |
| `idx_facilities_fssai` | B-TREE | `fssai_license_expiry WHERE fssai_license_no IS NOT NULL` | Compliance expiry alerts |

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` must be unique per company | DB + App | Unique constraint |
| 2 | `barcode_prefix` must be unique per company | DB + App | Unique constraint |
| 3 | `facility_type` determines which specialization fields are required | App | Service-layer validation per type |
| 4 | `business_unit_id` must belong to same company | App | Service-layer check |
| 5 | `primary_brand_id` must belong to same company | App | Service-layer check |
| 6 | `manager_employee_id` must be active employee of same company | App + DB | FK + service check |
| 7 | `parent_facility_id` cannot reference self | App | Service-layer check |
| 8 | `parent_facility_id` cannot create cycle | App | Recursive CTE check |
| 9 | `parent_facility_id` must belong to same company | App | Service-layer check |
| 10 | For COLD_STORAGE / BLAST_CHILLER: `temperature_min_c` and `temperature_max_c` required | DB | CHECK constraint |
| 11 | `temperature_max_c` must be > `temperature_min_c` | DB | CHECK constraint |
| 12 | `humidity_max_pct` must be > `humidity_min_pct` (if both set) | DB | CHECK constraint |
| 13 | `fssai_license_expiry` must be > today if set | App + DB | CHECK + Zod |
| 14 | `operating_hours_end` must differ from `operating_hours_start` | DB | CHECK constraint |
| 15 | State transition DRAFT → SUBMITTED requires `name`, `facility_type`, `business_unit_id`, `address_line1`, `city`, `state`, `country`, `barcode_prefix` | App | Master Data Quality Validator |
| 16 | Once ACTIVE, `code`, `facility_type`, `barcode_prefix` are immutable | App | Service-layer + audit |
| 17 | `plant_product_lines` must be non-empty if `facility_type = PLANT` | App | Service-layer validation |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/facilities` | GET | List facilities | `ORGANIZATION:VIEW` |
| `/api/v1/facilities/:id` | GET | Get facility details | `ORGANIZATION:VIEW` |
| `/api/v1/facilities` | POST | Create facility (DRAFT) | `ORGANIZATION:CREATE` |
| `/api/v1/facilities/:id` | PATCH | Update facility | `ORGANIZATION:EDIT` |
| `/api/v1/facilities/:id/submit` | POST | Submit for approval | `ORGANIZATION:EDIT` |
| `/api/v1/facilities/:id/approve` | POST | Approve facility | `ORGANIZATION:APPROVE` |
| `/api/v1/facilities/:id/activate` | POST | Activate facility | `ORGANIZATION:APPROVE` |
| `/api/v1/facilities/:id/deactivate` | POST | Deactivate facility | `ORGANIZATION:APPROVE` |
| `/api/v1/facilities/:id/locations` | GET | List locations in facility | `ORGANIZATION:VIEW` |
| `/api/v1/facilities/:id/departments` | GET | List departments in facility | `ORGANIZATION:VIEW` |
| `/api/v1/facilities/:id/children` | GET | List child facilities | `ORGANIZATION:VIEW` |
| `/api/v1/facilities/:id/capacity` | GET | Get storage capacity utilization | `ORGANIZATION:VIEW` |
| `/api/v1/facilities/:id/temperature-logs` | GET | Get temperature logs (cold storage) | `ORGANIZATION:VIEW` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Facility List | AG Grid list with type/BU/brand filter | `/organization/facilities` |
| Facility Detail | Tabbed: Overview, Locations, Departments, Devices, Audit | `/organization/facilities/:id` |
| Facility Create Form | Multi-section: Basic, Address, Operational, Specialization | `/organization/facilities/new` |
| Facility Map | Geographic map of all facilities | `/organization/facilities/map` |
| Facility Hierarchy | Tree view of parent-child facility relationships | `/organization/facilities/hierarchy` |
| Facility Capacity Dashboard | Utilization metrics per facility | `/organization/facilities/capacity` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Facility switcher (header) | Users switch between assigned facilities |
| Facility info card | View address, contact, operating hours |
| Facility-scoped task list | Tasks filtered by current facility |
| Facility QR code | Scan to set current facility (for tablet kiosk mode) |

---

## 11. Reports

| Report | Use of Facility |
|---|---|
| Facility Utilization Report | Capacity usage per facility |
| Multi-facility Inventory Report | Stock levels across facilities |
| Facility Performance Report | Output, sales, KPIs per facility |
| Cold Storage Compliance Report | Temperature logs for cold storage facilities |
| FSSAI Facility Compliance | License status per facility |
| Facility Cost Report | Operating costs per facility |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, facility_type, barcode_prefix, fssai_license_no) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |
| EXPORT | Yes | **Mandatory** | 7 years |

**Audit Level**: Full

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `name`, `name_short`, `facility_type`, `address_line1`, `city`, `state`, `country`, `phone`, `email` | Public | All authenticated users (within facility scope) |
| `latitude`, `longitude`, `operating_hours_*`, `total_area_sqm` | Internal | L2+ Admin |
| `fssai_license_no`, `gst_registration_no` | Confidential | L2+ Quality, Finance, Compliance |
| `manager_employee_id`, `default_cost_center_id` | Internal | L2+ Admin, HR |
| `barcode_prefix`, `number_series_scope` | Internal | L2+ IT, Admin |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Demand Forecast AI | Per-facility demand forecasting |
| Inventory Optimization AI | Per-facility reorder point optimization |
| Capacity Planning AI | Uses `storage_capacity_sqm`, `total_area_sqm` |
| Predictive Maintenance AI | For PLANT facilities — machine maintenance prediction |
| Cold Chain Compliance AI | Monitors temperature for COLD_STORAGE / BLAST_CHILLER |
| Route Optimization AI | For DISTRIBUTION_CENTER — delivery route optimization |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 100 per company |
| Cache strategy | Redis cache, TTL 1 hour, invalidated on update |
| Query patterns | Queried by `company_id + code`, `id` (FK), `facility_type`, `business_unit_id` |
| Joins | Almost every operational query joins to `facilities` — keep cached |
| Geospatial | PostGIS extension for lat/long queries |
| N+1 prevention | Eager-load `business_unit`, `primary_brand`, `manager` when needed |

---

## 16. Example Records

### Example 1: Pune Factory (Plant)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec1",
  "code": "PLT-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhastar Pune Factory 1",
  "name_short": "Pune Factory",
  "facility_type": "PLANT",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "primary_brand_id": "01928f7a-...-brand-sdm",
  "ownership_type": "OWNED",
  "manager_employee_id": "01928f7a-...-emp010",
  "address_line1": "Plot 7, MIDC Phase 2",
  "address_line2": "Bhosari Industrial Estate",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "411026",
  "latitude": 18.6298,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata",
  "locale": "en-IN",
  "phone": "+912012345678",
  "email": "pune.factory@sudhastar.com",
  "operating_hours_start": "06:00:00",
  "operating_hours_end": "22:00:00",
  "operating_days": ["MON","TUE","WED","THU","FRI","SAT"],
  "is_operational_24x7": false,
  "fssai_license_no": "10020065000123",
  "fssai_license_expiry": "2028-03-15",
  "total_area_sqm": 5000.00,
  "storage_capacity_sqm": 3000.00,
  "barcode_prefix": "PUN",
  "number_series_scope": "FACILITY",
  "plant_production_lines": 4,
  "plant_product_lines": ["SWEETS","NAMEKEEN","BAKERY","SNACKS"],
  "status": "ACTIVE",
  "version": 3
}
```

### Example 2: Central Warehouse (Cold Storage)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec2",
  "code": "WH-CS-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Central Cold Storage Warehouse",
  "name_short": "Central Cold Storage",
  "facility_type": "WAREHOUSE",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "ownership_type": "OWNED",
  "parent_facility_id": "01928f7a-...-plt-01",
  "address_line1": "Plot 7, MIDC Phase 2",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "411026",
  "timezone": "Asia/Kolkata",
  "barcode_prefix": "PUN-CS",
  "warehouse_type": "COLD_STORAGE",
  "warehouse_zone_count": 6,
  "temperature_min_c": 2.00,
  "temperature_max_c": 8.00,
  "humidity_min_pct": 60.00,
  "humidity_max_pct": 75.00,
  "total_area_sqm": 800.00,
  "storage_capacity_sqm": 600.00,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 3: Sudhamrit Retail Store

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec3",
  "code": "STR-04",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Store - Kothrud",
  "name_short": "Kothrud Store",
  "facility_type": "STORE",
  "business_unit_id": "01928f7a-...-bu-rtl",
  "primary_brand_id": "01928f7a-...-brand-sdr",
  "ownership_type": "OWNED",
  "address_line1": "Shop 12, Kothrud Central Mall",
  "address_line2": "Karve Road",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "411038",
  "latitude": 18.5074,
  "longitude": 73.8077,
  "operating_hours_start": "09:00:00",
  "operating_hours_end": "21:00:00",
  "operating_days": ["MON","TUE","WED","THU","FRI","SAT","SUN"],
  "barcode_prefix": "STR04",
  "store_code_pos": "STR004",
  "store_area_sqm": 120.00,
  "store_shelf_count": 48,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 4: Sudhamrit Food Joint Outlet

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec4",
  "code": "OUT-02",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Food Joint - FC Road",
  "name_short": "FC Road Outlet",
  "facility_type": "OUTLET",
  "business_unit_id": "01928f7a-...-bu-rst",
  "primary_brand_id": "01928f7a-...-brand-sfj",
  "ownership_type": "OWNED",
  "address_line1": "Shop 5, FC Road Plaza",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "411005",
  "operating_hours_start": "08:00:00",
  "operating_hours_end": "23:00:00",
  "operating_days": ["MON","TUE","WED","THU","FRI","SAT","SUN"],
  "is_operational_24x7": false,
  "barcode_prefix": "OUT02",
  "outlet_seating_capacity": 40,
  "outlet_kitchen_type": "LIVE_KITCHEN",
  "status": "ACTIVE",
  "version": 1
}
```

### Example 5: Franchise Store (Future)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec5",
  "code": "STR-FR-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Store - Nashik (Franchise)",
  "name_short": "Nashik Franchise",
  "facility_type": "STORE",
  "business_unit_id": "01928f7a-...-bu-rtl",
  "primary_brand_id": "01928f7a-...-brand-sdr",
  "ownership_type": "FRANCHISE",
  "address_line1": "Shop 23, Nashik Main Market",
  "city": "Nashik",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "422001",
  "barcode_prefix": "NSK01",
  "store_area_sqm": 80.00,
  "status": "ACTIVE",
  "version": 1,
  "tags": ["franchise", "pilot"]
}
```
