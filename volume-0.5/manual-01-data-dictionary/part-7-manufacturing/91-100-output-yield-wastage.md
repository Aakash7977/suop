# Manual 1 · Part 7 · Sections 5 · Entities 91-100 — Production Output, Yield & Wastage Management

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Domain |
| Section | 5 — Production Output, Yield & Wastage Management |
| Entities | 091–100 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.4, Ch 10 §10.6 |
| Last Updated | 2026-07-07 |

---

## Overview — Output & Yield Architecture

Section 5 ensures **complete production accounting** — every gram of material is tracked from input to output, including primary products, by-products, co-products, wastage, and scrap. This feeds directly into cost variance and manufacturing intelligence.

```
PRODUCTION EXECUTION (071)
  ↓ Yields
FINISHED GOODS (091) + SEMI-FINISHED (092) + BY-PRODUCTS (093) + CO-PRODUCTS (094)
  ↓ Losses
PRODUCTION WASTAGE (095) + SCRAP (096)
  ↓ Measured by
YIELD ANALYSIS (097) + PRODUCTION VARIANCE (098) + COST VARIANCE (099)
  ↓ Aggregated in
PRODUCTION SUMMARY (100)
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Complete production accounting** | All inputs must equal all outputs (FG + SF + ByP + CoP + Waste + Scrap) |
| **Multi-stage manufacturing** | Semi-finished goods (092) supported as both input and output |
| **By-product management** | Auto-generated inventory; configurable cost allocation |
| **Co-product management** | Proportional costing across multiple primary outputs |
| **Waste categorization** | 8 specific waste types (Process, Evaporation, Spillage, etc.) |
| **CAPA trigger** | Wastage above tolerance auto-triggers CAPA (per Ch 18 §18.8) |
| **Cost variance** | Standard vs Actual tracked across 5 cost components |

---

## Entity 091 — Finished Goods Receipt

### 1. Business Purpose
Records completed production entering inventory. Distinct from Entity 079 (which handles the physical movement and ledger write), Entity 091 is the **production accounting record** that validates the output against the Production Order.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
 |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `FGR-` | Receipt code | Internal |
| `production_order_id` | UUID | Yes | — | FK to `production_orders` | Source order | Internal |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Source batch (per Part 7: "Batch mandatory") | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | FG product | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities` | Receiving warehouse | Internal |
| `location_id` | UUID | Yes | — | FK to `locations` | Receiving bin | Internal |
| `good_quantity` | DECIMAL(18,4) | Yes | — | ≥ 0 | Good quantity (per Part 7) | Internal |
| `rejected_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Rejected quantity | Internal |
| `qc_status` | ENUM | Yes | `PASSED` | PENDING, PASSED, FAILED, CONDITIONAL | QC release status | Confidential |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Recording operator | Internal |
| `receipt_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Receipt timestamp | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | PRODUCTION_IN ledger entry | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, CANCELLED | Status | Internal |

### 5-16. Standard Pattern
- **Validation**: Inventory updated only after successful validation (per Part 7). `good_quantity` + `rejected_quantity` ≤ batch actual_quantity.
- **API**: `/api/v1/fg-receipts` (POST).
- **AI**: Yield Prediction AI.

---

## Entity 092 — Semi-Finished Goods

### 1. Business Purpose
Intermediate products (Sugar Syrup, Milk Base, Dough, etc.) used in multi-stage manufacturing. These are produced, stored temporarily, and consumed in subsequent production stages.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `SFG-` | SF code | Internal |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Producing batch | Internal |
| `product_id` | UUID | Yes | — | FK to `products` (SEMI_FINISHED) | SF product | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity produced | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `destination_warehouse_id` | UUID | Yes | — | FK to `facilities` | Storage warehouse | Internal |
| `shelf_life_days` | INTEGER | Yes | — | > 0 | Short shelf life (e.g., 3 days for sweet base) | Internal |
| `consumed_in_order_id` | UUID | No | NULL | FK to `production_orders` | Order that consumed this SF | Internal |
| `consumed_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity consumed | Internal |
| `status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, CONSUMED, EXPIRED, SCRAPPED | Lifecycle | Internal |

---

## Entity 093 — By-Product

### 1. Business Purpose
Secondary sellable products generated during production (e.g., ghee from milk processing, broken cashew pieces). Per Part 7: *"Inventory generated automatically. Cost allocation configurable."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Source batch | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | By-product | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity generated | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `cost_allocation_method` | ENUM | Yes | `ZERO_COST` | ZERO_COST, PROPORTIONAL, FIXED_AMOUNT, MARKET_VALUE | Cost allocation (per Part 7) | Confidential |
| `allocated_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost allocated to by-product | Confidential |
| `inventory_updated` | BOOLEAN | Yes | `false` | — | Auto-inventory flag | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | Receipt ledger entry | Internal |

---

## Entity 094 — Co-Product

### 1. Business Purpose
Multiple primary finished products from one process (e.g., Milk → Cream + Skim Milk + Butter). Supports proportional costing.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Source batch | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Co-product | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity produced | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `cost_allocation_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Proportion of total cost | Confidential |
| `allocated_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Allocated cost | Confidential |
| `sales_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Market sales value (for allocation) | Confidential |

---

## Entity 095 — Production Wastage

### 1. Business Purpose
Records production losses. Per Part 7: *"Above tolerance requires CAPA."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Source batch | Internal |
| `waste_type` | ENUM | Yes | — | PROCESS_LOSS, EVAPORATION, SPILLAGE, OPERATOR_ERROR, MACHINE_ERROR, CLEANING_LOSS, SAMPLING_LOSS, OTHER | Waste type (per Part 7) | Internal |
| `stage_id` | UUID | No | NULL | FK to `production_stages` | Stage where waste occurred | Internal |
| `expected_loss_qty` | DECIMAL(18,4) | Yes | — | ≥ 0 | Expected loss (from recipe) | Internal |
| `expected_loss_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Expected % | Internal |
| `actual_loss_qty` | DECIMAL(18,4) | Yes | — | ≥ 0 | Actual loss | Internal |
| `actual_loss_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Actual % | Internal |
| `variance_qty` | DECIMAL(18,4) | No | — | Generated: `actual - expected` | Variance | Internal |
| `reason` | TEXT | Yes | — | Min 10 chars | Waste reason | Internal |
| `responsible_user_id` | UUID | No | NULL | FK to `user_accounts` | Responsible operator | Internal |
| `approval_id` | UUID | No | NULL | FK to `approvals` | Variance approval | Internal |
| `capa_id` | UUID | No | NULL | FK to `capas` | Triggered CAPA (if > tolerance) | Confidential |
| `cost_impact` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Financial impact | Confidential |

---

## Entity 096 — Scrap Management

### 1. Business Purpose
Non-recoverable waste (Burnt Material, Damaged Packaging, Rejected Product, Expired Mix). Supports Destruction, Recycling, or Vendor Return.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Source batch | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Scrapped product | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Scrap quantity | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `disposition` | ENUM | Yes | `DESTRUCTION` | DESTRUCTION, RECYCLING, VENDOR_RETURN, ANIMAL_FEED | Disposition method (per Part 7) | Internal |
| `reason` | TEXT | Yes | — | Min 10 chars | Scrap reason | Internal |
| `disposal_date` | DATE | No | NULL | — | Date of disposal | Internal |
| `disposal_witness_id` | UUID | No | NULL | FK to `user_accounts` | Witness (compliance) | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | SCRAP ledger entry | Internal |
| `cost_impact` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Financial impact | Confidential |

---

## Entity 097 — Yield Analysis

### 1. Business Purpose
Measures production efficiency. Formula: `Yield % = (Actual Output / Expected Output) × 100`.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Analyzed batch | Internal |
| `expected_output_qty` | DECIMAL(18,4) | Yes | — | > 0 | Expected from recipe | Internal |
| `actual_output_qty` | DECIMAL(18,4) | Yes | — | ≥ 0 | Actual good quantity | Internal |
| `expected_yield_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Expected % | Internal |
| `actual_yield_pct` | DECIMAL(5,2) | Yes | — | Generated: `(actual / expected) * 100` | Actual % | Internal |
| `variance_pct` | DECIMAL(5,2) | No | — | Generated: `actual - expected` | Variance | Internal |
| `target_yield_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Target (per Part 7: "Target") | Internal |
| `is_target_achieved` | BOOLEAN | Yes | `false` | — | Target met flag | Internal |
| `analysis_notes` | TEXT | No | NULL | — | AI/Manual analysis | Internal |

---

## Entity 098 — Production Variance

### 1. Business Purpose
Tracks deviations across multiple categories (Material, Machine, Labor, Time, Utility, Quality, Yield).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Analyzed batch | Internal |
| `variance_category` | ENUM | Yes | — | MATERIAL, MACHINE, LABOR, TIME, UTILITY, QUALITY, YIELD | Category (per Part 7) | Internal |
| `expected_value` | DECIMAL(18,4) | Yes | — | — | Expected | Internal |
| `actual_value` | DECIMAL(18,4) | Yes | — | — | Actual | Internal |
| `variance_value` | DECIMAL(18,4) | No | — | Generated: `actual - expected` | Variance | Internal |
| `variance_pct` | DECIMAL(5,2) | No | — | — | Variance % | Internal |
| `reason_code` | VARCHAR(50) | No | NULL | — | Reason code | Internal |
| `reason_text` | TEXT | Yes | — | Min 10 chars | Detailed reason | Internal |

---

## Entity 099 — Cost Variance

### 1. Business Purpose
Compares Standard Cost vs Actual Cost across 5 components (Raw Material, Labor, Machine, Utility, Packaging).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Analyzed batch | Internal |
| `cost_component` | ENUM | Yes | — | RAW_MATERIAL, LABOR, MACHINE, UTILITY, PACKAGING | Component (per Part 7) | Confidential |
| `standard_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Standard | Confidential |
| `actual_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Actual | Confidential |
| `variance_amount` | DECIMAL(18,4) | No | — | Generated: `actual - standard` | Variance | Confidential |
| `variance_pct` | DECIMAL(5,2) | No | — | — | Variance % | Confidential |
| `reason` | TEXT | No | NULL | — | Reason for variance | Internal |

---

## Entity 100 — Production Summary

### 1. Business Purpose
Daily production snapshot aggregating all metrics for reporting and AI.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `summary_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `production_line_id` | UUID | No | NULL | FK to `production_lines` | Line (NULL = all) | Internal |
| `orders_completed` | INTEGER | Yes | `0` | ≥ 0 | Completed orders | Internal |
| `good_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Good qty | Internal |
| `rejected_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Rejected qty | Internal |
| `yield_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg yield | Internal |
| `wastage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg wastage | Internal |
| `downtime_min` | INTEGER | Yes | `0` | ≥ 0 | Total downtime | Internal |
| `labor_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Total labor hours | Internal |
| `machine_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Total machine hours | Internal |
| `energy_consumed` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total energy | Internal |
| `oee_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg OEE | Internal |
| `total_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total production cost | Confidential |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `summary_date`.
- **AI**: Yield Prediction, Waste Prediction, Cost Optimization, Production Optimization.
