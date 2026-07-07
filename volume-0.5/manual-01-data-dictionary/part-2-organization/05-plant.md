# Manual 1 · Part 2 · Entity 5 — Plant

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entity | Plant (Facility Specialization) |
| Entity Code | A.5 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `Plant` entity is a **specialization of Facility** for manufacturing operations. Per Volume 0 Chapter 1 §2.2, Sudhastar's plants manufacture sweets, namkeen, bakery products, snacks, ready-to-eat foods, and frozen foods. A Plant is where raw materials are transformed into finished or semi-finished goods through recipes, BOMs, production orders, and quality inspections.

The Plant entity extends Facility with manufacturing-specific attributes: production lines, product lines manufactured, machine inventory, production capacity, shift configuration, and compliance certifications. It is the parent entity for Production Lines, Work Centers, and Machines (defined in the Manufacturing domain).

**Important architectural note**: Plant uses a **view-based specialization pattern**. The physical data lives in the `facilities` table (with `facility_type = PLANT`). The `plants` database view exposes only PLANT-type facilities with their manufacturing-specific fields. This avoids polymorphic table joins while providing a clean domain-specific API.

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head |
| Data Owner | Manufacturing Head |
| Technical Owner | Backend Lead — Manufacturing Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `plants` (VIEW — backed by `facilities` table) |
| Prisma Model | `Plant` (view-based) |
| File Location | `prisma/schema/master/organization/plant.prisma` |
| Base Table | `facilities WHERE facility_type = 'PLANT'` |
| Partitioning | None (inherits from facilities) |

### View Definition

```sql
CREATE VIEW plants AS
SELECT
  f.*,
  f.plant_production_lines AS production_lines,
  f.plant_product_lines AS product_lines
FROM facilities f
WHERE f.facility_type = 'PLANT'
  AND f.deleted_at IS NULL;
```

---

## 4. Field Dictionary

### 4.1 Inherited Fields (from Facility — Section A.4)

All universal base fields and common facility fields are inherited. See Entity A.4 (Facility) for complete definitions.

### 4.2 Plant-Specific Fields

These fields are stored on the `facilities` table (per Facility §4.3 specialization fields) but exposed via the `plants` view:

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `production_lines` | INTEGER | Yes | — | > 0 | Number of production lines in the plant | Internal | Capacity planning |
| `product_lines` | TEXT[] | Yes | — | Non-empty subset of: SWEETS, NAMEKEEN, BAKERY, SNACKS, RTE, FROZEN, PACKAGING | Product lines manufactured at this plant | Internal | Demand forecast |
| `production_capacity_per_day` | DECIMAL(12,2) | No | NULL | > 0 | Total production capacity (kg or units) per day across all lines | Internal | Capacity AI |
| `default_shift_pattern` | ENUM | No | `DOUBLE_SHIFT` | SINGLE_SHIFT, DOUBLE_SHIFT, TRIPLE_SHIFT, CONTINUOUS | Default shift pattern | Internal | — |
| `has_blast_chiller` | BOOLEAN | Yes | `false` | — | Whether plant has an on-site blast chiller | Internal | — |
| `has_cold_storage` | BOOLEAN | Yes | `false` | — | Whether plant has on-site cold storage | Internal | — |
| `has_retort_processing` | BOOLEAN | Yes | `false` | — | Whether plant has retort processing capability (per Ch 1 §2.2) | Internal | — |
| `has_packaging_line` | BOOLEAN | Yes | `true` | — | Whether plant has a packaging line | Internal | — |
| `quality_lab_on_site` | BOOLEAN | Yes | `true` | — | Whether plant has an on-site quality lab | Internal | — |
| `iso_22000_certified` | BOOLEAN | Yes | `false` | — | ISO 22000 food safety certification | Confidential | Compliance |
| `iso_22000_expiry` | DATE | No | NULL | Must be future if set | ISO 22000 certification expiry | Internal | Expiry prediction |
| `haccp_certified` | BOOLEAN | Yes | `false` | — | HACCP certification | Confidential | Compliance |
| `haccp_expiry` | DATE | No | NULL | Must be future if set | HACCP certification expiry | Internal | Expiry prediction |
| `gmp_certified` | BOOLEAN | Yes | `false` | — | GMP (Good Manufacturing Practice) certification | Confidential | Compliance |
| `gmp_expiry` | DATE | No | NULL | Must be future if set | GMP certification expiry | Internal | Expiry prediction |

---

## 5. Relationships

### Inherited Relationships (from Facility)

All Facility relationships apply. See Entity A.4 §5.

### Plant-Specific Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Plant → ProductionLine | 1 : N | outbound | `production_lines.plant_id` (facility_id) | CASCADE | Production lines deleted with plant |
| Plant → WorkCenter | 1 : N | outbound | `work_centers.plant_id` (facility_id) | CASCADE | Work centers deleted with plant |
| Plant → Machine | 1 : N | outbound | `machines.facility_id` | RESTRICT | Cannot delete plant with active machines |
| Plant → Recipe | 1 : N | outbound | `recipes.plant_id` (nullable — some recipes are company-wide) | SET NULL | Recipes become company-wide |
| Plant → ProductionOrder | 1 : N | outbound | `production_orders.plant_id` | RESTRICT | Cannot delete plant with production orders |
| Plant → ColdStorageZone (on-site) | 1 : N | outbound | `storage_zones.facility_id WHERE zone_type = COLD_STORAGE` | CASCADE | Cold storage zones deleted with plant |
| Plant → BlastChillerZone (on-site) | 1 : N | outbound | `storage_zones.facility_id WHERE zone_type = BLAST_CHILLER` | CASCADE | Blast chiller zones deleted with plant |

---

## 6. Index Strategy

Inherits all Facility indexes (see Entity A.4 §6). Additional:

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `idx_plants_product_lines` | GIN | `plant_product_lines` | Array containment queries (find plants that manufacture SWEETS) |
| `idx_plants_certifications` | B-TREE | `iso_22000_expiry, haccp_expiry, gmp_expiry` | Compliance expiry alerts |

---

## 7. Validation Rules

Inherits all Facility validation rules (see Entity A.4 §7). Additional:

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `facility_type` must be `PLANT` | DB | View WHERE clause |
| 2 | `production_lines` must be > 0 | DB | CHECK constraint on facilities table |
| 3 | `product_lines` must be non-empty array | DB + App | CHECK constraint + Zod |
| 4 | `product_lines` must be subset of allowed values | App | Zod enum validation |
| 5 | If `has_blast_chiller = true`, a BLAST_CHILLER zone must exist in facility | App | Service-layer cross-entity validation |
| 6 | If `has_cold_storage = true`, a COLD_STORAGE zone must exist in facility | App | Service-layer cross-entity validation |
| 7 | Certification expiry dates must be > today if certification is `true` | App + DB | CHECK + Zod |
| 8 | `production_capacity_per_day` if set must be > 0 | DB | CHECK constraint |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/plants` | GET | List plants | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id` | GET | Get plant details | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id/production-lines` | GET | List production lines | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id/machines` | GET | List machines in plant | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id/recipes` | GET | List recipes for plant | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id/capacity` | GET | Get production capacity utilization | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id/certifications` | GET | Get compliance certifications | `ORGANIZATION:VIEW` |
| `/api/v1/plants/:id/shifts` | GET | List shift patterns | `ORGANIZATION:VIEW` |

**Note**: Plant creation, update, and lifecycle operations use the Facility endpoints (`/api/v1/facilities`) with `facility_type = PLANT`.

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Plant List | AG Grid list of plants with product-line filter | `/organization/plants` |
| Plant Detail | Tabbed: Overview, Production Lines, Machines, Recipes, QC, Capacity | `/organization/plants/:id` |
| Plant Capacity Dashboard | Production capacity vs actual utilization | `/organization/plants/:id/capacity` |
| Plant Compliance | Certifications + expiry alerts | `/organization/plants/:id/compliance` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Plant info card | View product lines, shift pattern, capacity |
| Plant-scoped production tasks | Production operators see tasks for their plant |
| Plant compliance check | QC inspectors view certifications on mobile |

---

## 11. Reports

| Report | Use of Plant |
|---|---|
| Plant Production Report | Output, yield, wastage per plant |
| Plant Capacity Utilization | Planned vs actual production capacity |
| Plant Compliance Report | ISO 22000, HACCP, GMP certification status |
| Plant Cost Analysis | Operating cost per plant |
| Multi-Plant Comparison | Cross-plant performance comparison |

---

## 12. Audit Rules

Inherits Facility audit rules (see Entity A.4 §12). Additional:

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| UPDATE (certifications: iso_22000_*, haccp_*, gmp_*) | Yes | **Mandatory** | Permanent |
| UPDATE (production_lines, product_lines) | Yes | **Mandatory** | Permanent |

---

## 13. Security Classification

Inherits Facility security classification. Additional:

| Field Category | Classification | Access |
|---|---|---|
| `production_lines`, `product_lines`, `production_capacity_per_day` | Internal | L2+ Manufacturing, Admin |
| `iso_22000_*`, `haccp_*`, `gmp_*` | Confidential | L2+ Quality, Compliance |
| `has_blast_chiller`, `has_cold_storage`, `has_retort_processing` | Internal | L2+ Manufacturing |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Production Scheduling AI | Per-plant production optimization |
| Predictive Maintenance AI | Machine maintenance per plant |
| Yield Optimization AI | Per-plant yield analysis and recommendations |
| Capacity Planning AI | Uses `production_capacity_per_day`, `production_lines` |
| Compliance Prediction AI | Predicts certification renewal needs |
| Demand Forecast AI | Per-plant demand forecasting by product line |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 10 plants per company |
| View performance | View backed by indexed `facility_type` filter — near-zero overhead |
| Cache strategy | Redis cache, TTL 1 hour |
| Query patterns | Queried by `company_id`, `product_lines` (array contains), `id` |

---

## 16. Example Records

### Example 1: Pune Factory (Full Plant Record)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec1",
  "code": "PLT-01",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhastar Pune Factory 1",
  "name_short": "Pune Factory",
  "facility_type": "PLANT",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "ownership_type": "OWNED",
  "address_line1": "Plot 7, MIDC Phase 2",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "411026",
  "timezone": "Asia/Kolkata",
  "barcode_prefix": "PUN",
  "production_lines": 4,
  "product_lines": ["SWEETS", "NAMEKEEN", "BAKERY", "SNACKS"],
  "production_capacity_per_day": 5000.00,
  "default_shift_pattern": "DOUBLE_SHIFT",
  "has_blast_chiller": true,
  "has_cold_storage": true,
  "has_retort_processing": true,
  "has_packaging_line": true,
  "quality_lab_on_site": true,
  "iso_22000_certified": true,
  "iso_22000_expiry": "2027-06-30",
  "haccp_certified": true,
  "haccp_expiry": "2027-06-30",
  "gmp_certified": true,
  "gmp_expiry": "2027-06-30",
  "status": "ACTIVE",
  "version": 3
}
```

### Example 2: Mumbai Snacks Plant (Specialized)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ec6",
  "code": "PLT-02",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhastar Mumbai Snacks Plant",
  "name_short": "Mumbai Snacks",
  "facility_type": "PLANT",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "ownership_type": "OWNED",
  "address_line1": "Plot 15, Taloja MIDC",
  "city": "Navi Mumbai",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "410208",
  "barcode_prefix": "MUM",
  "production_lines": 2,
  "product_lines": ["SNACKS", "RTE"],
  "production_capacity_per_day": 3000.00,
  "default_shift_pattern": "TRIPLE_SHIFT",
  "has_blast_chiller": false,
  "has_cold_storage": true,
  "has_retort_processing": true,
  "has_packaging_line": true,
  "quality_lab_on_site": true,
  "iso_22000_certified": true,
  "iso_22000_expiry": "2026-12-31",
  "haccp_certified": true,
  "haccp_expiry": "2026-12-31",
  "gmp_certified": true,
  "gmp_expiry": "2027-03-31",
  "status": "ACTIVE",
  "version": 1
}
```
