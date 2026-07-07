# Manual 1 · Part 9 · Sections 3, 4 & 5 · Entities 201-230 — Store Operations, Merchandising & Retail Intelligence

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 9 — Enterprise Retail Operations |
| Sections | 3 (Store Ops), 4 (Merchandising), 5 (Retail Intelligence) |
| Entities | 201–230 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.6, Ch 10 §10.5, Ch 14 §14.3, Ch 24 §24.7, Part 9 §3-5 |
| Last Updated | 2026-07-07 |

---

## Overview — Retail Operations, Merchandising & Intelligence

Sections 3–5 complete the Retail Operations domain by defining **store inventory execution**, **merchandising & planograms**, and **retail intelligence & AI**.

```
STORE OPERATIONS (Sec 3: 201-210)
  Receiving → Inventory → Replenishment → Transfer → Cycle Count → Damage/Shrinkage/Expiry → Tasks
  ↓ Feeds
MERCHANDISING (Sec 4: 211-220)
  Category → Assortment → Space Planning → Planogram → Display → Visual Merch → Compliance → Audit
  ↓ Analyzed by
RETAIL INTELLIGENCE (Sec 5: 221-230)
  KPIs → Dashboard → Mission Control → Omnichannel → Customer Analytics → Forecast → AI Copilot → Digital Twin
```

### Integrated Enhancements
1. **Retail Operations Command Center** (per Sec 3 Enhancement) — Real-time multi-store monitoring
2. **Retail Digital Twin & Computer Vision** (per Sec 4 Enhancement) — AI shelf cameras, heat maps, AI Merchandising Copilot
3. **AI Retail Copilot** (per Sec 5) — Replenishment, promotion, transfer, shelf optimization recommendations

---

# SECTION 3: Store Operations & Inventory Execution (Entities 201-210)

## Entity 201 — Store Receiving

### 1. Business Purpose
Receives inventory from warehouse or supplier. Per Part 9: *"Barcode verification mandatory. Receiving updates Inventory Ledger."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `SRCV-` | Receiving code | Internal |
| `receiving_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` (Entity 171) | Receiving store | Internal |
| `source_type` | ENUM | Yes | — | WAREHOUSE_TRANSFER, SUPPLIER_DIRECT, STORE_TRANSFER, RETURN_FROM_CUSTOMER | Source (per Part 9) | Internal |
| `source_entity_id` | UUID | Yes | — | — | Source document ID (transfer/PO) | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source doc number | Internal |
| `received_by` | UUID | Yes | — | FK to `user_accounts` | Receiver (per Part 9) | Internal |
| `received_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Received time (per Part 9) | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Total lines | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total qty | Internal |
| `barcode_verified` | BOOLEAN | Yes | `false` | — | Barcode scan completed (per Part 9) | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries (RECEIPT type) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, IN_PROGRESS, COMPLETED, CANCELLED | Status (per Part 9) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 202 — Store Inventory

### 1. Business Purpose
Current inventory inside store. Per Part 9: *"Calculated from Inventory Ledger."* This is the store-level equivalent of `inventory_master` (Entity 021) — it references the same ledger but provides a store-scoped view.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `store_id` | UUID | Yes | — | FK to `stores` | Store (per Part 9) | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product (per Part 9) | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch (per Part 9) | Internal |
| `shelf_id` | UUID | No | NULL | FK to `shelf_masters` (Entity 174) | Shelf (per Part 9) | Internal |
| `available_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Available (per Part 9) | Internal |
| `reserved_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Reserved | Internal |
| `damaged_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Damaged (per Part 9) | Internal |
| `expiry_date` | DATE | No | NULL | — | Expiry (per Part 9) | Public |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `stock_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, LOW_STOCK, OUT_OF_STOCK, EXPIRED, DAMAGED, RESERVED | Status (per Part 9) | Internal |
| `last_movement_at` | TIMESTAMPTZ | No | NULL | — | Last inventory movement | Internal |
| `last_count_at` | TIMESTAMPTZ | No | NULL | — | Last cycle count | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

**Note**: Store Inventory is derived from `inventory_master` filtered by `facility_id = store_id`. It may be a materialized view or a separate denormalized table for store-specific queries.

---

## Entity 203 — Shelf Replenishment

### 1. Business Purpose
Moves inventory from back store to shelf. Per Part 9: Supports AI automatic replenishment.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `task_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 9) | Internal | |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal | |
| `product_id` | UUID | Yes | — | FK to `products` | Product (per Part 9) | Internal | |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch (FEFO) | Internal | |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Target shelf (per Part 9) | Internal | |
| `required_qty` | DECIMAL(18,4) | Yes | — | > 0 | Required (per Part 9) | Internal | Replenishment AI |
| `completed_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Completed (per Part 9) | Internal | |
| `assigned_to` | UUID | No | NULL | FK to `user_accounts` | Employee (per Part 9) | Internal | |
| `is_ai_generated` | BOOLEAN | Yes | `false` | — | AI auto-generated (per Part 9 AI) | Internal | Replenishment AI |
| `ai_confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI confidence | Internal | |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority | Internal | |
| `started_at` | TIMESTAMPTZ | No | NULL | — | Start time | Internal | |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion time | Internal | |
| `status` | ENUM | Yes | `PENDING` | PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED | Status (per Part 9) | Internal | |

---

## Entity 204 — Store Transfer

### 1. Business Purpose
Transfer stock between stores. Per Part 9: Source → Destination, Products, Approval, Dispatch, Receipt, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `transfer_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 9) | Public |
| `source_store_id` | UUID | Yes | — | FK to `stores` | Source (per Part 9) | Internal |
| `destination_store_id` | UUID | Yes | — | FK to `stores` | Destination (per Part 9) | Internal |
| `transfer_type` | ENUM | Yes | — | INTER_STORE, WAREHOUSE_TO_STORE, STORE_TO_WAREHOUSE | Type | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Total lines | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total qty | Internal |
| `total_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `dispatched_at` | TIMESTAMPTZ | No | NULL | — | Dispatch time | Internal |
| `received_at` | TIMESTAMPTZ | No | NULL | — | Receipt time | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries (TRANSFER_OUT + TRANSFER_IN) | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, DISPATCHED, RECEIVED, COMPLETED, CANCELLED | Status (per Part 9) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 205 — Cycle Count (Store)

### 1. Business Purpose
Daily stock verification. Per Part 9: ABC Count, Random Count, Full Count, Category Count. *"Scanner mandatory. Variance approval required."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `count_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `count_type` | ENUM | Yes | — | ABC_COUNT, RANDOM_COUNT, FULL_COUNT, CATEGORY_COUNT (per Part 9) | Type | Internal |
| `count_date` | DATE | Yes | `CURRENT_DATE` | — | Count date | Internal |
| `counted_by` | UUID | Yes | — | FK to `user_accounts` | Counter | Internal |
| `supervisor_id` | UUID | No | NULL | FK to `user_accounts` | Supervisor (per Part 9) | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Total items counted | Internal |
| `variance_items` | INTEGER | Yes | `0` | ≥ 0 | Items with variance | Internal |
| `accuracy_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Count accuracy | Internal |
| `scanner_used` | BOOLEAN | Yes | `true` | — | Scanner mandatory (per Part 9) | Internal |
| `variance_approved_by` | UUID | No | NULL | FK to `user_accounts` | Variance approval (per Part 9) | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, SUBMITTED, APPROVED, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 206 — Stock Adjustment (Store)

### 1. Business Purpose
Corrects inventory. Per Part 9 reasons: Damage, Loss, Shrinkage, Expiry, Counting Error, Promotion. *"Approval mandatory."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `adjustment_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch | Internal |
| `old_quantity` | DECIMAL(18,4) | Yes | — | — | System qty | Internal |
| `new_quantity` | DECIMAL(18,4) | Yes | — | ≥ 0 | Physical qty | Internal |
| `variance_quantity` | DECIMAL(18,4) | No | — | Generated: `new - old` | Variance | Internal |
| `reason` | ENUM | Yes | — | DAMAGE, LOSS, SHRINKAGE, EXPIRY, COUNTING_ERROR, PROMOTION (per Part 9) | Reason | Internal |
| `reason_text` | TEXT | Yes | — | Min 10 chars | Detailed reason | Internal |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Approval (per Part 9) | Confidential |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | ADJUSTMENT ledger entry | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, APPROVED, COMPLETED, REJECTED | Status | Internal |

---

## Entity 207 — Damage Register

### 1. Business Purpose
Tracks damaged goods. Per Part 9: Broken, Leaking, Expired, Customer Damage, Transit Damage, Store Damage. Disposition: Destroy, Return Vendor, Discount Sale, Rework.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `damage_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Damaged qty | Internal |
| `damage_category` | ENUM | Yes | — | BROKEN, LEAKING, EXPIRED, CUSTOMER_DAMAGE, TRANSIT_DAMAGE, STORE_DAMAGE (per Part 9) | Category | Internal |
| `disposition` | ENUM | Yes | — | DESTROY, RETURN_VENDOR, DISCOUNT_SALE, REWORK (per Part 9) | Disposition | Internal |
| `cost_impact` | DECIMAL(18,4) | No | NULL | ≥ 0 | Financial impact | Confidential |
| `photo_file_id` | UUID | No | NULL | FK to `file_attachments` | Evidence photo | Internal |
| `reported_by` | UUID | Yes | — | FK to `user_accounts` | Reporter | Internal |
| `reported_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Report time | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, DISPOSED, RETURNED, DISCOUNTED, REWORKED | Status | Internal |

---

## Entity 208 — Shrinkage Register

### 1. Business Purpose
Tracks unexplained inventory loss. Per Part 9: Theft, Misplacement, Counting Error, Unknown. AI: Shrinkage Risk Prediction.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `shrinkage_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal | |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal | |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal | |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Shrinkage qty | Internal | |
| `value` | DECIMAL(18,4) | Yes | — | ≥ 0 | Financial value | Confidential | |
| `reason` | ENUM | Yes | — | THEFT, MISPLACEMENT, COUNTING_ERROR, UNKNOWN (per Part 9) | Reason | Confidential | |
| `ai_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI shrinkage risk (per Part 9 AI) | Confidential | Shrinkage AI |
| `ai_recommendation` | TEXT | No | NULL | — | AI preventive action | Internal | |
| `reported_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Report time | Internal | |
| `status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, RESOLVED, CLOSED | Status | Internal | |

---

## Entity 209 — Expiry Management

### 1. Business Purpose
Tracks expiring products. Per Part 9: Expiry Date, Remaining Days, Priority, Action. Actions: Discount, Transfer, Return, Destroy, Promotion.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal | |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal | |
| `batch_id` | UUID | Yes | — | FK to `batches` | Batch | Internal | |
| `expiry_date` | DATE | Yes | — | — | Expiry (per Part 9) | Public | Expiry AI |
| `remaining_days` | INTEGER | Yes | — | Generated: `expiry_date - CURRENT_DATE` | Days remaining (per Part 9) | Internal | |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | At-risk qty | Internal | |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW (per Part 9) | Priority | Internal | |
| `recommended_action` | ENUM | No | NULL | DISCOUNT, TRANSFER, RETURN, DESTROY, PROMOTION (per Part 9) | AI-recommended action | Internal | Expiry AI |
| `action_taken` | ENUM | No | NULL | DISCOUNT, TRANSFER, RETURN, DESTROY, PROMOTION, NONE | Actual action | Internal | |
| `action_taken_at` | TIMESTAMPTZ | No | NULL | — | Action timestamp | Internal | |
| `value_at_risk` | DECIMAL(18,4) | Yes | — | ≥ 0 | Financial value | Confidential | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ACTIONED, EXPIRED, RESOLVED | Status | Internal | |

---

## Entity 210 — Store Task

### 1. Business Purpose
Daily operational work. Per Part 9: Shelf Audit, Price Check, Cleaning, Replenishment, Cycle Count, Promotion Setup, Expiry Check, Returns. Priority: Critical, High, Medium, Low.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `task_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `task_type` | ENUM | Yes | — | SHELF_AUDIT, PRICE_CHECK, CLEANING, REPLENISHMENT, CYCLE_COUNT, PROMOTION_SETUP, EXPIRY_CHECK, RETURNS (per Part 9) | Type | Internal |
| `description` | TEXT | Yes | — | Min 10 chars | Task details | Internal |
| `assigned_to` | UUID | No | NULL | FK to `user_accounts` | Assignee | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW (per Part 9) | Priority | Internal |
| `due_date` | TIMESTAMPTZ | Yes | — | — | Due date | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion time | Internal |
| `photo_required` | BOOLEAN | Yes | `false` | — | Photo evidence needed | Internal |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Evidence photos | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 4: Merchandising, Category Management & Planograms (Entities 211-220)

## Entity 211 — Category Master (Retail)

### 1. Business Purpose
Defines enterprise product categories (retail-specific, extends Product Category from Part 3). Per Part 9: Supports hierarchy — Food → Sweets → Kaju Sweets → Premium Kaju.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(30) | Yes | — | Unique per company | Code (per Part 9) | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 9) | Public |
| `parent_category_id` | UUID | No | NULL | FK self-ref | Parent (per Part 9: "Parent Category") | Internal |
| `department` | VARCHAR(50) | No | NULL | — | Department (per Part 9) | Internal |
| `business_unit_id` | UUID | No | NULL | FK to `business_units` | BU (per Part 9) | Internal |
| `manager_user_id` | UUID | No | NULL | FK to `user_accounts` | Manager (per Part 9) | Internal |
| `priority` | INTEGER | Yes | `100` | > 0 | Priority (per Part 9) | Internal |
| `level` | INTEGER | Yes | `1` | ≥ 1 | Hierarchy level | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 212 — Product Assortment

### 1. Business Purpose
Determines products available in stores. Per Part 9: Store Cluster, Category, Product, Dates, Priority, Mandatory, Seasonal. Supports store-specific assortment.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assortment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `store_cluster_id` | UUID | No | NULL | FK to `store_clusters` | Store cluster (per Part 9) | Internal |
| `store_id` | UUID | No | NULL | FK to `stores` | Store-specific (NULL = cluster) | Internal |
| `category_id` | UUID | Yes | — | FK to `category_masters` | Category (per Part 9) | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product (per Part 9) | Internal |
| `start_date` | DATE | Yes | — | — | Start (per Part 9) | Internal |
| `end_date` | DATE | No | NULL | > start_date | End (per Part 9) | Internal |
| `priority` | INTEGER | Yes | `100` | > 0 | Priority (per Part 9) | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory (per Part 9: "Mandatory Flag") | Internal |
| `is_seasonal` | BOOLEAN | Yes | `false` | — | Seasonal (per Part 9: "Seasonal Flag") | Internal |
| `facing_recommended` | INTEGER | No | NULL | > 0 | Recommended facings | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 213 — Space Planning

### 1. Business Purpose
Allocates shelf space. Per Part 9: Store, Category, Shelf dimensions, Allocated %, Occupied %, Remaining %. AI: Space optimization.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal | |
| `category_id` | UUID | Yes | — | FK to `category_masters` | Category (per Part 9) | Internal | |
| `shelf_length_cm` | DECIMAL(8,2) | Yes | — | > 0 | Length (per Part 9) | Internal | |
| `shelf_height_cm` | DECIMAL(8,2) | Yes | — | > 0 | Height (per Part 9) | Internal | |
| `shelf_width_cm` | DECIMAL(8,2) | Yes | — | > 0 | Width (per Part 9) | Internal | |
| `total_space_sqm` | DECIMAL(12,4) | Yes | — | > 0 | Total space | Internal | |
| `allocated_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Allocated (per Part 9) | Internal | Space AI |
| `occupied_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Occupied (per Part 9) | Internal | |
| `remaining_pct` | DECIMAL(5,2) | No | — | Generated: `100 - occupied` | Remaining (per Part 9) | Internal | |
| `ai_optimization_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI space efficiency | Internal | Space AI |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal | |

---

## Entity 214 — Advanced Planogram

### 1. Business Purpose
Enterprise shelf blueprint. Per Part 9: Version controlled, effective dated, store specific. Stores Shelf, Product, Facing, Stacking, Sequence, Priority, Visual Rules, Compliance Rules.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `planogram_code` | VARCHAR(30) | Yes | — | Unique per company+store | Code | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store specific (per Part 9) | Internal |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Shelf | Internal |
| `category_id` | UUID | Yes | — | FK to `category_masters` | Category | Internal |
| `version_number` | INTEGER | Yes | `1` | > 0 | Version (per Part 9: "Version controlled") | Internal |
| `effective_from` | DATE | Yes | — | — | Effective (per Part 9: "Effective dated") | Internal |
| `effective_to` | DATE | No | NULL | Auto-set when superseded | End | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active version | Internal |
| `layout_data` | JSONB | Yes | `'{}'` | — | Array of `{ product_id, row, column, facing, stacking, sequence, priority }` (per Part 9) | Internal |
| `visual_rules` | JSONB | No | `'{}'` | — | Visual merchandising rules | Internal |
| `compliance_rules` | JSONB | No | `'{}'` | — | Compliance checking rules (per Part 9) | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Internal |
| `ai_optimized` | BOOLEAN | Yes | `false` | — | AI-optimized planogram | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, ACTIVE, INACTIVE | Status | Internal |

---

## Entity 215 — Display Location

### 1. Business Purpose
Special merchandising locations. Per Part 9: End Cap, Island Display, Checkout, Festival Display, Impulse Zone, Entrance, Seasonal Display.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `display_code` | VARCHAR(30) | Yes | — | Unique per store | Code | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `display_type` | ENUM | Yes | — | END_CAP, ISLAND_DISPLAY, CHECKOUT, FESTIVAL_DISPLAY, IMPULSE_ZONE, ENTRANCE, SEASONAL_DISPLAY (per Part 9) | Type | Internal |
| `display_name` | VARCHAR(100) | Yes | — | Min 3 | Name | Public |
| `location_description` | TEXT | No | NULL | — | Where in store | Internal |
| `area_sqm` | DECIMAL(12,4) | No | NULL | > 0 | Display area | Internal |
| `capacity` | INTEGER | Yes | `0` | ≥ 0 | Product capacity | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 216 — Visual Merchandising

### 1. Business Purpose
Store presentation standards. Per Part 9: Display Theme, Color Theme, Lighting, Brand Standards, Signage, POSM, Photos, Instructions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `vm_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `vm_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `store_id` | UUID | No | NULL | FK to `stores` | Store (NULL = all stores) | Internal |
| `display_theme` | VARCHAR(100) | No | NULL | — | Theme (per Part 9: "Display Theme") | Internal |
| `color_theme` | VARCHAR(100) | No | NULL | — | Color (per Part 9: "Color Theme") | Internal |
| `lighting_requirements` | TEXT | No | NULL | — | Lighting (per Part 9) | Internal |
| `brand_standards` | TEXT | No | NULL | — | Brand standards (per Part 9) | Internal |
| `signage_requirements` | TEXT | No | NULL | — | Signage (per Part 9) | Internal |
| `posm_requirements` | TEXT | No | NULL | — | POSM (per Part 9: Point of Sale Material) | Internal |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Reference photos (per Part 9: "Photos") | Internal |
| `instructions` | TEXT | Yes | — | Min 20 chars | Setup instructions (per Part 9: "Instructions") | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | — | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 217 — Shelf Compliance

### 1. Business Purpose
Measures execution. Per Part 9: Correct Product, Facing, Price, Label, Clean, No Damage, Stock Available, Photo Match. Compliance Score 0-100.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `compliance_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal | |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal | |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Shelf | Internal | |
| `planogram_id` | UUID | Yes | — | FK to `advanced_planograms` | Expected planogram | Internal | |
| `audit_date` | DATE | Yes | — | — | Audit date | Internal | |
| `correct_product` | BOOLEAN | Yes | `false` | — | Correct product (per Part 9) | Internal | |
| `correct_facing` | BOOLEAN | Yes | `false` | — | Correct facing (per Part 9) | Internal | |
| `correct_price` | BOOLEAN | Yes | `false` | — | Correct price (per Part 9) | Internal | |
| `correct_label` | BOOLEAN | Yes | `false` | — | Correct label (per Part 9) | Internal | |
| `clean_shelf` | BOOLEAN | Yes | `false` | — | Clean (per Part 9) | Internal | |
| `no_damage` | BOOLEAN | Yes | `false` | — | No damage (per Part 9) | Internal | |
| `stock_available` | BOOLEAN | Yes | `false` | — | Stock present (per Part 9) | Internal | |
| `photo_match` | BOOLEAN | Yes | `false` | — | Photo matches reference (per Part 9) | Internal | Vision AI |
| `compliance_score` | DECIMAL(5,2) | Yes | — | 0-100 | Score (per Part 9: "Compliance Score 0–100") | Internal | |
| `vision_compliance_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI Vision score (per Retail 2.0 Enhancement) | Internal | Vision AI |
| `vision_anomalies` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | AI-detected issues | Internal | |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Evidence photos | Internal | |
| `audited_by` | UUID | Yes | — | FK to `user_accounts` | Auditor | Internal | |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal | |

---

## Entity 218 — Retail Audit

### 1. Business Purpose
Enterprise store inspections. Per Part 9: Daily, Weekly, Monthly, Festival, Brand, Compliance, Food Safety. Photos, Videos, GPS, Time, Digital Signature.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `store_id` | UUID | Yes | — | FK to `stores` | Audited store | Internal |
| `audit_type` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, FESTIVAL, BRAND, COMPLIANCE, FOOD_SAFETY (per Part 9) | Type | Confidential |
| `auditor_user_id` | UUID | Yes | — | FK to `user_accounts` | Auditor | Internal |
| `audit_date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `checklist_id` | UUID | No | NULL | FK to `quality_checklists` | Audit checklist | Internal |
| `findings` | JSONB | Yes | `'[]'` | — | Array of `{ item, result, notes }` (per Part 9: "Findings") | Confidential |
| `score` | DECIMAL(5,2) | Yes | — | 0-100 | Audit score (per Part 9: "Score") | Confidential |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos (per Part 9) | Internal |
| `video_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Videos (per Part 9) | Internal |
| `gps_coordinates` | JSONB | No | NULL | — | GPS (per Part 9: "GPS") `{ lat, long }` | Internal |
| `audit_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Time (per Part 9: "Time") | Internal |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Signature (per Part 9: "Digital Signature") | Confidential |
| `capa_id` | UUID | No | NULL | FK to `capas` | Triggered CAPA | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | SCHEDULED, IN_PROGRESS, COMPLETED | Status | Internal |

---

## Entity 219 — Promotion Display

### 1. Business Purpose
Tracks promotional displays. Per Part 9: Festival, BOGO, Weekend Offer, Combo, Seasonal, Launch. Measures: Display Compliance, Sales Lift, ROI.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `display_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `promotion_id` | UUID | Yes | — | FK to `promotions` (Entity 187) | Linked promotion | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `display_location_id` | UUID | Yes | — | FK to `display_locations` (Entity 215) | Physical location | Internal |
| `display_type` | ENUM | Yes | — | FESTIVAL, BOGO, WEEKEND_OFFER, COMBO_OFFER, SEASONAL_CAMPAIGN, LAUNCH_DISPLAY (per Part 9) | Type | Internal |
| `setup_date` | DATE | Yes | — | — | Setup date | Internal |
| `teardown_date` | DATE | No | NULL | — | Teardown date | Internal |
| `compliance_status` | ENUM | Yes | `PENDING` | PENDING, COMPLIANT, NON_COMPLIANT | Display compliance (per Part 9) | Internal |
| `sales_lift_pct` | DECIMAL(5,2) | No | NULL | — | Sales lift % (per Part 9: "Sales Lift") | Confidential |
| `roi_pct` | DECIMAL(5,2) | No | NULL | — | ROI % (per Part 9: "ROI") | Confidential |
| `baseline_sales` | DECIMAL(18,4) | No | NULL | ≥ 0 | Pre-promo baseline | Confidential |
| `promo_sales` | DECIMAL(18,4) | No | NULL | ≥ 0 | During promo | Confidential |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Display photos | Internal |
| `status` | ENUM | Yes | `ACTIVE` | SCHEDULED, ACTIVE, COMPLETED, CANCELLED | Status | Internal |

---

## Entity 220 — Merchandising Dashboard

### 1. Business Purpose
Per Part 9: Category Sales, Shelf Compliance, Planogram Compliance, Display Performance, Out of Stock, Dead Stock, Store Ranking, Category Ranking, Promotion Success.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `store_id` | UUID | No | NULL | FK to `stores` | Store (NULL = all) | Internal |
| `category_sales` | JSONB | Yes | `'{}'` | — | Sales by category (per Part 9) | Confidential |
| `shelf_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance (per Part 9) | Internal |
| `planogram_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Planogram (per Part 9) | Internal |
| `display_performance` | JSONB | No | NULL | — | Display ROI (per Part 9) | Internal |
| `out_of_stock_count` | INTEGER | Yes | `0` | ≥ 0 | OOS (per Part 9) | Internal |
| `dead_stock_count` | INTEGER | Yes | `0` | ≥ 0 | Dead stock (per Part 9) | Internal |
| `store_ranking` | JSONB | No | NULL | — | Top/bottom stores (per Part 9) | Internal |
| `category_ranking` | JSONB | No | NULL | — | Top/bottom categories (per Part 9) | Internal |
| `promotion_success_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Promo success (per Part 9) | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI merchandising insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 5: Retail Intelligence, Omnichannel, Executive Dashboards & AI (Entities 221-230)

## Entity 221 — Retail KPI Library

### 1. Business Purpose
Central repository for retail KPIs. Per Part 9: Sales, Gross Margin, Net Margin, Average Basket, Basket Size, UPT, Sales Per Employee/Hour/SqFt, Stock Turnover, Sell Through %, OOS %, Shrinkage %, Customer Retention, Promotion ROI. *"Single KPI definition across enterprise. Version controlled."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | KPI code (e.g., `RTL_AVG_BASKET`) | Internal |
| `kpi_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `kpi_category` | ENUM | Yes | — | SALES, MARGIN, BASKET, PRODUCTIVITY, INVENTORY, CUSTOMER, PROMOTION, OPERATIONAL | Category | Internal |
| `formula` | TEXT | Yes | — | — | Formula (per Part 9: "Version controlled") | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM | Internal |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target | Internal |
| `current_value` | DECIMAL(18,4) | No | NULL | — | Latest | Internal |
| `version_number` | INTEGER | Yes | `1` | ≥ 1 | Version (per Part 9) | Internal |
| `store_id` | UUID | No | NULL | FK to `stores` | Scope (NULL = company) | Internal |
| `snapshot_date` | DATE | Yes | — | — | Measurement date | Internal |

---

## Entity 222 — Retail Dashboard

### 1. Business Purpose
Live operational dashboard. Per Part 9: Today's Sales, Store Ranking, Top Products, Slow Movers, Cash Position, Returns, Promotions, Customer Count, Inventory Health, Out of Stock.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_name` | VARCHAR(100) | Yes | — | — | Name | Public |
| `store_id` | UUID | No | NULL | FK to `stores` | Scope (NULL = all) | Internal |
| `widget_configuration` | JSONB | Yes | `'{}'` | — | Widgets (per Part 9) | Internal |
| `refresh_interval_sec` | INTEGER | Yes | `30` | > 0 | Refresh rate | Internal |
| `target_audience` | ENUM | Yes | `STORE_MANAGER` | STORE_MANAGER, AREA_MANAGER, RETAIL_HEAD, EXECUTIVE | Audience | Internal |
| `is_mission_control_enabled` | BOOLEAN | Yes | `false` | — | Shows on Mission Control | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 223 — Retail Mission Control

### 1. Business Purpose
Enterprise retail command center. Per Part 9: Store Status, POS Status, Inventory, Shelf Compliance, Promotion Status, Customer Traffic, Alerts, Store Ranking, AI Recommendations.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `control_room_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `scope` | ENUM | Yes | `COMPANY` | STORE, REGION, CLUSTER, COMPANY | Monitoring scope | Internal |
| `view_configuration` | JSONB | Yes | `'{}'` | — | Widget layout (per Part 9) | Internal |
| `display_duration_sec` | INTEGER | Yes | `30` | > 0 | Rotation interval | Internal |
| `is_live` | BOOLEAN | Yes | `true` | — | Real-time data | Internal |
| `websocket_endpoint` | VARCHAR(200) | No | NULL | — | Live data endpoint | Internal |
| `ai_recommendations` | JSONB | No | NULL | — | Live AI recommendations (per Part 9) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 224 — Omnichannel Order Hub

### 1. Business Purpose
Unified retail order management. Per Part 9: Store, Website, Mobile App, WhatsApp, Marketplace, B2B, Subscription. Order Types: Delivery, Pickup, Reservation, Ship From Store, Endless Aisle.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `hub_order_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `order_source` | ENUM | Yes | — | STORE_POS, WEBSITE, MOBILE_APP, WHATSAPP, MARKETPLACE, B2B, SUBSCRIPTION (per Part 9) | Source | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Fulfilling store | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `order_type` | ENUM | Yes | — | DELIVERY, PICKUP, RESERVATION, SHIP_FROM_STORE, ENDLESS_AISLE (per Part 9) | Type | Internal |
| `total_value` | DECIMAL(18,4) | Yes | — | ≥ 0 | Order total | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, PAID, PARTIAL, REFUNDED | Payment | Internal |
| `fulfillment_status` | ENUM | Yes | `PENDING` | PENDING, CONFIRMED, PREPARING, READY, DISPATCHED, COMPLETED, CANCELLED | Fulfillment | Internal |
| `linked_transaction_id` | UUID | No | NULL | FK to `sales_transactions` | POS transaction (if POS) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED, CANCELLED, RETURNED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 225 — Customer Analytics

### 1. Business Purpose
Enterprise customer intelligence. Per Part 9: Purchase Frequency, Lifetime Value, Average Basket, Favorite Categories, Buying Pattern, Visit Frequency, Promotion Response, Retention. AI: Customer Segmentation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers`, UNIQUE | Customer | Confidential | |
| `purchase_frequency_days` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Days between purchases (per Part 9) | Confidential | Segmentation AI |
| `lifetime_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | LTV (per Part 9) | Confidential | |
| `avg_basket_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Avg basket (per Part 9) | Confidential | |
| `favorite_categories` | JSONB | No | `'[]'` | — | Top categories (per Part 9) | Internal | |
| `buying_pattern` | ENUM | No | NULL | WEEKLY, MONTHLY, FESTIVAL_SEASONAL, IMPULSE, BULK | Pattern (per Part 9) | Internal | Segmentation AI |
| `visit_frequency_per_month` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Visits/month (per Part 9) | Internal | |
| `promotion_response_rate` | DECIMAL(5,2) | Yes | `0` | 0-100 | Promo response (per Part 9) | Internal | |
| `retention_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Retention (per Part 9) | Confidential | Churn AI |
| `churn_risk_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Churn risk | Confidential | Churn AI |
| `ai_segment` | VARCHAR(50) | No | NULL | — | AI customer segment (per Part 9 AI) | Confidential | Segmentation AI |
| `last_analyzed_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Last analysis | Internal | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal | |

---

## Entity 226 — Sales Forecast

### 1. Business Purpose
Predicts future demand. Per Part 9 levels: Store, Category, SKU, Region, Company. AI: Demand Prediction, Seasonality, Festival Impact, Weather Impact.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `forecast_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal | |
| `forecast_level` | ENUM | Yes | — | STORE, CATEGORY, SKU, REGION, COMPANY (per Part 9) | Level | Internal | |
| `target_entity_id` | UUID | Yes | — | — | Entity ID | Internal | |
| `forecast_date` | DATE | Yes | — | — | Forecast date | Internal | |
| `forecast_horizon` | ENUM | Yes | `WEEKLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY | Horizon | Internal | |
| `predicted_value` | DECIMAL(18,4) | Yes | — | ≥ 0 | Predicted sales | Confidential | Demand AI |
| `confidence_lower` | DECIMAL(18,4) | No | NULL | — | Lower bound | Internal | |
| `confidence_upper` | DECIMAL(18,4) | No | NULL | — | Upper bound | Internal | |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Model used | Internal | |
| `seasonality_factor` | DECIMAL(5,2) | No | NULL | — | Seasonality impact (per Part 9) | Internal | |
| `festival_impact_factor` | DECIMAL(5,2) | No | NULL | — | Festival impact (per Part 9) | Internal | |
| `weather_impact_factor` | DECIMAL(5,2) | No | NULL | — | Weather impact (per Part 9) | Internal | |
| `accuracy_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Model accuracy | Internal | |
| `actual_value` | DECIMAL(18,4) | No | NULL | — | Actual (for training) | Internal | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, VERIFIED, EXPIRED | Status | Internal | |

---

## Entity 227 — Inventory Forecast

### 1. Business Purpose
Predicts inventory needs. Per Part 9: Replenishment, Store Transfer, Warehouse Planning, Safety Stock, Seasonal Stock.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `forecast_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal |
| `forecast_date` | DATE | Yes | — | — | Forecast date | Internal |
| `current_stock` | DECIMAL(18,4) | Yes | — | ≥ 0 | Current qty | Internal |
| `predicted_demand` | DECIMAL(18,4) | Yes | — | ≥ 0 | Predicted demand (per Part 9) | Internal |
| `recommended_replenishment` | DECIMAL(18,4) | Yes | — | ≥ 0 | Replenishment qty (per Part 9) | Internal |
| `safety_stock_recommended` | DECIMAL(18,4) | Yes | — | ≥ 0 | Safety stock (per Part 9) | Internal |
| `seasonal_stock_recommended` | DECIMAL(18,4) | No | NULL | ≥ 0 | Seasonal stock (per Part 9) | Internal |
| `reorder_date_recommended` | DATE | Yes | — | — | When to reorder | Internal |
| `stockout_risk_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Stockout risk | Confidential |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Model | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, VERIFIED, EXPIRED | Status | Internal |

---

## Entity 228 — Retail Benchmark

### 1. Business Purpose
Enterprise comparison. Per Part 9: Store, Region, Cluster, Manager, Department, Category, Promotion.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `benchmark_name` | VARCHAR(200) | Yes | — | — | Name | Internal |
| `benchmark_type` | ENUM | Yes | — | STORE, REGION, CLUSTER, MANAGER, DEPARTMENT, CATEGORY, PROMOTION (per Part 9) | Type | Internal |
| `metric_code` | VARCHAR(30) | Yes | — | FK to `retail_kpi_library` | Compared metric | Internal |
| `period_start` | DATE | Yes | — | — | Period start | Internal |
| `period_end` | DATE | Yes | — | > period_start | Period end | Internal |
| `entity_ids` | UUID[] | Yes | — | — | Entities compared | Internal |
| `results` | JSONB | Yes | `'{}'` | — | Results: `[{ entity_id, value, rank }]` | Internal |
| `best_entity_id` | UUID | No | NULL | — | Top performer | Internal |
| `worst_entity_id` | UUID | No | NULL | — | Bottom performer | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 229 — AI Retail Copilot

### 1. Business Purpose
Enterprise AI assistant. Per Part 9: Recommend Replenishment, Suggest Promotions, Identify Slow Movers, Predict Stockouts, Recommend Transfers, Optimize Shelf Space, Improve Basket Value, Detect Sales Anomalies.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `recommendation_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `recommendation_type` | ENUM | Yes | — | REPLENISHMENT, PROMOTION_SUGGESTION, SLOW_MOVER_ALERT, STOCKOUT_PREDICTION, TRANSFER_RECOMMENDATION, SHELF_OPTIMIZATION, BASKET_IMPROVEMENT, SALES_ANOMALY (per Part 9) | Type | Internal |
| `target_entity_type` | VARCHAR(30) | Yes | — | STORE, PRODUCT, CATEGORY, CUSTOMER | Target | Internal |
| `target_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `description` | TEXT | Yes | — | Min 20 chars | Recommendation (per Part 9) | Internal |
| `expected_impact` | JSONB | No | NULL | — | `{ "revenue_lift_pct": X, "cost_reduction_pct": Y }` | Confidential |
| `confidence_score` | DECIMAL(5,2) | Yes | — | 0-100 | AI confidence | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Source model | Internal |
| `action_taken` | ENUM | Yes | `PENDING` | PENDING, ACCEPTED, REJECTED, IMPLEMENTED | Status | Internal |
| `actioned_by` | UUID | No | NULL | FK to `user_accounts` | Who actioned | Internal |
| `actioned_at` | TIMESTAMPTZ | No | NULL | — | Action time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 230 — Retail Digital Twin

### 1. Business Purpose
Virtual retail network. Per Part 9: Models Stores, Shelves, Customers, Inventory, Sales, Employees, Promotions, Traffic. Supports Simulation, Scenario Planning, Capacity Planning, Expansion Planning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `twin_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `scope` | ENUM | Yes | `STORE` | STORE, CLUSTER, REGION, COMPANY | Twin scope | Internal |
| `scope_entity_id` | UUID | Yes | — | — | Scoped entity ID | Internal |
| `twin_model_file_id` | UUID | Yes | — | FK to `file_attachments` | 3D/2D model file | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Model version | Internal |
| `real_time_data_feed` | BOOLEAN | Yes | `true` | — | Live data feed | Internal |
| `iot_endpoint` | VARCHAR(200) | No | NULL | — | MQTT/WebSocket endpoint | Internal |
| `simulation_capabilities` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Enabled simulations (per Part 9) | Internal |
| `last_synced_at` | TIMESTAMPTZ | No | NULL | — | Last sync | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Part 9 Completion Summary

**Part 9 (Enterprise Retail Operations) is now COMPLETE** with 60 entities (171–230) across 5 sections.

### Key Achievements

1. **Digital Store Model** — Complete physical-to-digital store representation
2. **Enterprise POS Integration** — Existing POS preserved; Integration Layer connects to SUOP
3. **Store Operations** — Receiving, replenishment, transfers, cycle count, damage, shrinkage, expiry
4. **Merchandising** — Category hierarchy, assortment, space planning, version-controlled planograms
5. **Shelf Compliance** — Audit with photo evidence + AI Vision compliance scoring
6. **Retail Intelligence** — KPIs, dashboards, Mission Control, AI Copilot, Digital Twin
7. **Omnichannel** — 7 order sources, 5 fulfillment types, unified order hub
8. **Customer Analytics** — LTV, churn risk, AI segmentation, buying patterns
9. **AI Forecasting** — Demand prediction with seasonality, festival, weather impact
10. **Retail 2.0** — AI shelf cameras, heat maps, smart carts, RFID, self-checkout, digital twin

### Part 9 Entity Count by Section

| Section | Entities | Count |
|---|---|---|
| 1. Retail Foundation | 171–180 | 10 |
| 2. Enterprise POS | 181–200 | 20 |
| 3. Store Operations | 201–210 | 10 |
| 4. Merchandising | 211–220 | 10 |
| 5. Retail Intelligence | 221–230 | 10 |
| **Total** | **171–230** | **60** |
