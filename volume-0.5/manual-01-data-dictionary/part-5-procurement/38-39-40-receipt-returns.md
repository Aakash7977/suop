# Manual 1 · Part 5 · Entities 38, 39, 40 — Receipt & Returns (ASN, GRN, Purchase Return)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 5 — Procurement & Supplier Domain |
| Entities | Advance Shipping Notice (038), Goods Receipt Note (039), Purchase Return (040) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Receipt & Returns Architecture

The Receipt & Returns trio completes the procurement lifecycle after the Purchase Order:

```
PURCHASE ORDER (037) — Official purchasing document
        ↓ Supplier prepares shipment
1. ASN (038) — Supplier informs expected shipment (enables dock planning)
        ↓ Vehicle arrives
2. GRN (039) — Records receipt of goods (writes to Inventory Ledger per Ch 10 §10.5)
        ↓ If defective
3. PURCHASE RETURN (040) — Return defective goods to supplier
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **ASN is optional but recommended** | Suppliers can send ASN for dock planning; GRN can be created without ASN |
| **GRN writes to Inventory Ledger** | Per Ch 10 §10.5 ledger-first architecture (per Entity 022) |
| **GRN cannot bypass QC** | If `product.qc_required = true`, GRN lines must pass QC before stock becomes AVAILABLE |
| **Purchase Return creates ledger entry** | Returns write RETURN movement type to ledger |
| **Partial GRNs supported** | One PO can have multiple GRNs (partial deliveries) |

---

## Entity 038 — Advance Shipping Notice (ASN)

### 1. Business Purpose

The `ASN` entity represents an **advance shipping notice** from a supplier — informing SUOP of an expected shipment before it arrives. Per Part 5, ASN enables:

- **Dock planning** — schedule receiving dock and labor based on expected arrivals
- **Receiving preparation** — warehouse team prepares space, equipment, barcode labels
- **Warehouse scheduling** — optimize receiving workflow
- **Cross-docking** — prepare cross-dock if shipment is for immediate transfer
- **Supplier performance** — compare ASN vs actual arrival for delivery accuracy

ASN is **optional** — suppliers may not always send it. But when received, it dramatically improves receiving efficiency.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Warehouse Head |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Procurement Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `asns` (header) + `asn_lines` (line items) |
| Prisma Models | `ASN`, `ASNLine` |
| Pattern | Header-line |
| Lifecycle | DRAFT → SENT (by supplier) → RECEIVED (at dock) → COMPLETED → CLOSED |

### 4. Field Dictionary

#### 4.1 ASN Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `ASN-` | ASN code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (warehouse) | Receiving facility |
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id` | Shipping supplier | Internal |
| `po_id` | UUID | No | NULL | FK to `purchase_orders.id` | Source PO | Internal |
| `po_number` | VARCHAR(50) | No | NULL | Denormalized | PO number | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SENT, RECEIVED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED, CLOSED | Lifecycle | Internal |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `asn_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `asn_number_supplier` | VARCHAR(50) | No | NULL | — | Supplier's ASN reference | Internal |
| `asn_date` | DATE | Yes | `CURRENT_DATE` | — | ASN creation date | Internal |
| `shipment_date` | DATE | Yes | — | — | Supplier shipment date | Internal |
| `expected_arrival_date` | DATE | Yes | — | ≥ shipment_date | Expected arrival date | Internal |
| `expected_arrival_time` | TIMESTAMPTZ | No | NULL | — | Expected arrival timestamp | Internal |
| `actual_arrival_date` | DATE | No | NULL | — | Actual arrival date | Internal |
| `actual_arrival_time` | TIMESTAMPTZ | No | NULL | — | Actual arrival timestamp | Internal |
| `vehicle_number` | VARCHAR(20) | No | NULL | — | Vehicle number | Internal |
| `vehicle_type` | ENUM | No | NULL | TRUCK, TEMPO, CONTAINER, THREE_WHEELER, OTHER | Vehicle type | Internal |
| `driver_name` | VARCHAR(100) | No | NULL | — | Driver name | Internal |
| `driver_phone` | VARCHAR(20) | No | NULL | E.164 | Driver phone | Internal |
| `transporter_name` | VARCHAR(150) | No | NULL | — | Transporter name | Internal |
| `lr_number` | VARCHAR(50) | No | NULL | — | Lorry Receipt number | Internal |
| `lr_date` | DATE | No | NULL | — | LR date | Internal |
| `total_packages` | INTEGER | Yes | `0` | ≥ 0 | Total packages | Internal |
| `total_pallets` | INTEGER | No | NULL | ≥ 0 | Total pallets | Internal |
| `total_weight_kg` | DECIMAL(12,4) | No | NULL | ≥ 0 | Total weight (kg) | Internal |
| `total_volume_cbm` | DECIMAL(12,4) | No | NULL | ≥ 0 | Total volume (cbm) | Internal |
| `shipping_from_address` | JSONB | No | NULL | — | Supplier shipping address snapshot | Internal |
| `shipping_to_address` | JSONB | Yes | — | — | Receiving address snapshot | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal |
| `total_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total shipment value | Confidential |
| `temperature_controlled` | BOOLEAN | Yes | `false` | — | Cold chain shipment | Internal |
| `temperature_min_c` | DECIMAL(5,2) | No | NULL | — | Min temperature | Internal |
| `temperature_max_c` | DECIMAL(5,2) | No | NULL | — | Max temperature | Internal |
| `humidity_controlled` | BOOLEAN | Yes | `false` | — | Humidity-controlled shipment | Internal |
| `special_handling_instructions` | TEXT | No | NULL | — | Handling instructions | Internal |
| `insurance_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Insurance value | Confidential |
| `insurance_provider` | VARCHAR(100) | No | NULL | — | Insurance provider | Internal |
| `freight_paid_by` | ENUM | Yes | `SUPPLIER` | SUPPLIER, BUYER | Who pays freight | Internal |
| `freight_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Freight amount | Confidential |
| `grn_id` | UUID | No | NULL | FK to `goods_receipt_notes.id` | Generated GRN | Internal |
| `grn_number` | VARCHAR(50) | No | NULL | — | GRN number (denormalized) | Internal |
| `dock_assigned` | VARCHAR(30) | No | NULL | — | Assigned receiving dock | Internal |
| `received_by` | UUID | No | NULL | FK to `user_accounts.id` | Who received | Internal |
| `received_at` | TIMESTAMPTZ | No | NULL | — | Receipt timestamp | Internal |
| `variance_with_grn` | JSONB | No | NULL | — | Variance between ASN and actual GRN | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 ASN Lines

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `asn_id` | UUID | Yes | — | FK to `asns.id` | Parent ASN |
| `line_number` | INTEGER | Yes | — | > 0, unique per ASN | Line number | Internal |
| `po_line_id` | UUID | No | NULL | FK to `purchase_order_lines.id` | Corresponding PO line | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity_shipped` | DECIMAL(18,4) | Yes | — | > 0 | Quantity shipped per ASN | Internal |
| `quantity_received` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity actually received (denormalized from GRN) | Internal |
| `quantity_variance` | DECIMAL(18,4) | No | — | Generated: `quantity_received - quantity_shipped` | Variance | Internal |
| `batch_number_supplier` | VARCHAR(50) | No | NULL | — | Supplier's batch number | Internal |
| `manufacturing_date` | DATE | No | NULL | — | Manufacturing date | Internal |
| `expiry_date` | DATE | No | NULL | — | Expiry date | Internal |
| `package_count` | INTEGER | No | NULL | ≥ 0 | Number of packages for this line | Internal |
| `weight_kg` | DECIMAL(12,4) | No | NULL | ≥ 0 | Weight | Internal |
| `unit_price` | DECIMAL(18,4) | No | NULL | ≥ 0 | Unit price (from PO) | Confidential |
| `line_value` | DECIMAL(18,4) | No | — | Generated: `quantity_shipped * unit_price` | Line value | Confidential |
| `line_status` | ENUM | Yes | `OPEN` | OPEN, RECEIVED, PARTIALLY_RECEIVED, VARIANCE, CLOSED | Line status | Internal |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | ASN → Company, Facility, Supplier, PO, GRN, UserAccount; ASNLine → ASN, POLine, Product, UOM |
| **Index** | `uq_asn_code_company`, `idx_asn_status`, `idx_asn_supplier`, `idx_asn_po`, `idx_asn_expected_arrival`, `idx_asn_lines_asn`, `idx_asn_lines_product` |
| **Validation** | `expected_arrival_date` ≥ `shipment_date`, `actual_arrival_date` ≥ `shipment_date` (if set), `quantity_shipped` > 0, temperature fields required if `temperature_controlled = true`, PO must be RELEASED before ASN |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/asns` (GET, POST), `/api/v1/asns/:id` (GET, PATCH), `/api/v1/asns/:id/send` (POST), `/api/v1/asns/:id/receive` (POST — vehicle arrived), `/api/v1/asns/:id/convert-to-grn` (POST — generate GRN from ASN), `/api/v1/asns/:id/cancel` (POST), `/api/v1/asns/expected-today` (GET), `/api/v1/asns/by-supplier/:supplierId` (GET) |
| **UI** | ASN List, ASN Detail (with lines + receiving), Expected Arrivals Dashboard, Dock Planning Calendar, ASN to GRN Converter, Variance Report |
| **Mobile** | ASN arrival confirmation (scan vehicle), mobile receiving against ASN, variance entry, dock assignment |
| **Reports** | ASN Register, Expected Arrivals, ASN vs Actual Variance, Dock Utilization, Supplier ASN Compliance |
| **Audit** | Full; mandatory reason for cancellation, variance explanation |

### 13-16. Security / AI / Performance / Example

**Security**: `asn_number`, `asn_date`, `expected_arrival_date` = Public; `total_value`, `insurance_value`, `freight_amount` = Confidential; vehicle/driver info = Internal.

**AI**: Dock Scheduling AI (optimizes dock assignment), Arrival Prediction AI (predicts actual arrival time), Variance Prediction AI.

**Performance**: < 10k per year; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-asn-001",
    "code": "ASN-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "supplier_id": "01928f7a-...-sup-001",
    "po_id": "01928f7a-...-po-001",
    "po_number": "PO-2026-000001",
    "asn_number": "ASN-2026-000001",
    "asn_number_supplier": "MUR-ASN-2026-042",
    "asn_date": "2026-07-10",
    "shipment_date": "2026-07-10",
    "expected_arrival_date": "2026-07-13",
    "expected_arrival_time": "2026-07-13T10:00:00Z",
    "vehicle_number": "MH12-AB-1234",
    "vehicle_type": "TRUCK",
    "driver_name": "Ramesh Kumar",
    "driver_phone": "+919876543210",
    "transporter_name": "SafeLog Transport",
    "lr_number": "SL-LR-2026-042",
    "lr_date": "2026-07-10",
    "total_packages": 20,
    "total_pallets": 2,
    "total_weight_kg": 510.0000,
    "currency_code": "INR",
    "total_value": 23600.0000,
    "freight_paid_by": "SUPPLIER",
    "dock_assigned": "DOCK-01",
    "status": "SENT",
    "version": 1
  },
  "lines": [
    {
      "id": "01928f7a-...-asnl-001",
      "asn_id": "01928f7a-...-asn-001",
      "line_number": 1,
      "po_line_id": "01928f7a-...-pol-001",
      "product_id": "01928f7a-...-prod-sugar",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity_shipped": 500.0000,
      "quantity_received": 0.0000,
      "batch_number_supplier": "MUR-LOT-2026-042",
      "manufacturing_date": "2026-06-15",
      "expiry_date": "2028-06-15",
      "package_count": 20,
      "weight_kg": 510.0000,
      "unit_price": 44.5000,
      "line_value": 22250.0000,
      "line_status": "OPEN"
    }
  ]
}
```

---

## Entity 039 — Goods Receipt Note (GRN)

### 1. Business Purpose

The `GoodsReceiptNote` (GRN) entity records the **receipt of purchased goods** at the warehouse. Per Volume 0 Chapter 5 §5.3 (Source-to-Stock) and Chapter 10 §10.5 (Ledger-first architecture), the GRN is the **critical handoff point** between procurement and inventory:

```
Vehicle Arrival → Unload → Verification → GRN CREATED → QC (if required) → INVENTORY LEDGER ENTRY → Stock Available
```

### Critical Architectural Rule

**GRN writes to the Inventory Ledger** (per Ch 10 §10.5, Ch 26 §26.5 Ledger Pattern):

- On GRN creation: writes RECEIPT entry to `inventory_ledger` (immutable)
- On GRN creation: updates `inventory_master` (event-updated summary, per Ch 10 Q1)
- Stock is NOT available until QC passes (if `product.qc_required = true`) — stock goes to `qc_hold_qty` bucket
- After QC pass: writes QC_RELEASE entry, moves stock from `qc_hold_qty` to `available_qty`

### GRN Lifecycle

```
DRAFT → SUBMITTED → UNDER_VERIFICATION → VERIFIED → QC_PENDING → QC_PASSED → COMPLETED → CLOSED
                                            ↓                ↓
                                        REJECTED        QC_FAILED
                                            ↓                ↓
                                        RETURNED       RETURNED/SCRAPPED
```

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Warehouse Head |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Procurement Module + Inventory Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `goods_receipt_notes` (header) + `goods_receipt_note_lines` (line items) |
| Prisma Models | `GoodsReceiptNote`, `GoodsReceiptNoteLine` |
| Pattern | Header-line |
| **Critical** | GRN creation triggers Inventory Ledger write (same DB transaction, per Outbox pattern) |

### 4. Field Dictionary

#### 4.1 GRN Header

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `GRN-` | GRN code (e.g., `GRN-2026-000001`) | Public | — |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | Internal | — |
| `facility_id` | UUID | Yes | — | FK to facilities (warehouse) | Receiving facility | Internal | — |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Receiving warehouse | Internal | — |
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id` | Supplier | Confidential | — |
| `po_id` | UUID | No | NULL | FK to `purchase_orders.id` | Source PO (optional for direct receipt) | Internal | — |
| `asn_id` | UUID | No | NULL | FK to `asns.id` | Source ASN (if any) | Internal | — |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, UNDER_VERIFICATION, VERIFIED, QC_PENDING, QC_PASSED, QC_FAILED, COMPLETED, CLOSED, RETURNED, CANCELLED | Lifecycle | Internal | — |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `grn_number` | VARCHAR(50) | Yes | — | Display number | Public | — |
| `grn_date` | DATE | Yes | `CURRENT_DATE` | — | GRN date | Internal | — |
| `grn_type` | ENUM | Yes | `PO_RECEIPT` | PO_RECEIPT, DIRECT_RECEIPT, RETURN_RECEIPT, TRANSFER_RECEIPT, CONSIGNMENT_RECEIPT | GRN type | Internal | — |
| `received_by` | UUID | Yes | — | FK to `user_accounts.id` | Who received | Internal | — |
| `verified_by` | UUID | No | NULL | FK to `user_accounts.id` | Who verified | Internal | — |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification timestamp | Internal | — |
| `vehicle_number` | VARCHAR(20) | No | NULL | — | Vehicle number | Internal | — |
| `driver_name` | VARCHAR(100) | No | NULL | — | Driver name | Internal | — |
| `lr_number` | VARCHAR(50) | No | NULL | — | LR number | Internal | — |
| `arrival_datetime` | TIMESTAMPTZ | Yes | — | — | Vehicle arrival time | Internal | — |
| `unload_start_datetime` | TIMESTAMPTZ | No | NULL | — | Unload start | Internal | — |
| `unload_end_datetime` | TIMESTAMPTZ | No | NULL | — | Unload end | Internal | — |
| `verification_datetime` | TIMESTAMPTZ | No | NULL | — | Verification complete | Internal | — |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of lines | Internal | — |
| `total_quantity_received` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity received | Internal | — |
| `total_quantity_accepted` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity accepted (passed QC) | Internal | — |
| `total_quantity_rejected` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity rejected | Internal | — |
| `total_quantity_putaway` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity putaway | Internal | — |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal | — |
| `total_value_received` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value received | Confidential | — |
| `total_value_accepted` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value accepted | Confidential | — |
| `total_value_rejected` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value rejected | Confidential | — |
| `requires_qc` | BOOLEAN | Yes | `false` | — | Whether QC required (auto-derived from products) | Internal | — |
| `qc_status` | ENUM | No | NULL | PENDING, IN_PROGRESS, PASSED, FAILED, PARTIAL | QC status | Confidential | — |
| `qc_inspection_id` | UUID | No | NULL | FK to `qc_inspections.id` | QC inspection | Confidential | — |
| `qc_completed_at` | TIMESTAMPTZ | No | NULL | — | QC completion | Internal | — |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries created by this GRN | Internal | — |
| `putaway_completed` | BOOLEAN | Yes | `false` | — | Whether putaway completed | Internal | — |
| `putaway_completed_at` | TIMESTAMPTZ | No | NULL | — | Putaway completion | Internal | — |
| `supplier_invoice_number` | VARCHAR(50) | No | NULL | — | Supplier invoice reference | Confidential | — |
| `supplier_invoice_date` | DATE | No | NULL | — | Supplier invoice date | Internal | — |
| `supplier_invoice_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Invoice value | Confidential | — |
| `invoice_variance` | DECIMAL(18,4) | No | NULL | — | Variance between GRN and invoice | Confidential | — |
| `gate_entry_number` | VARCHAR(30) | No | NULL | — | Gate entry number | Internal | — |
| `dock_used` | VARCHAR(30) | No | NULL | — | Receiving dock | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

#### 4.2 GRN Lines

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `grn_id` | UUID | Yes | — | FK to `goods_receipt_notes.id` | Parent GRN |
| `line_number` | INTEGER | Yes | — | > 0, unique per GRN | Line number | Internal |
| `po_line_id` | UUID | No | NULL | FK to `purchase_order_lines.id` | Source PO line | Internal |
| `asn_line_id` | UUID | No | NULL | FK to `asn_lines.id` | Source ASN line | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity_ordered` | DECIMAL(18,4) | No | NULL | ≥ 0 | Quantity ordered (from PO) | Internal |
| `quantity_asn` | DECIMAL(18,4) | No | NULL | ≥ 0 | Quantity per ASN | Internal |
| `quantity_received` | DECIMAL(18,4) | Yes | — | > 0 | Quantity actually received | Internal |
| `quantity_accepted` | DECIMAL(18,4) | Yes | `0` | ≥ 0, ≤ quantity_received | Quantity accepted (passed QC) | Internal |
| `quantity_rejected` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity rejected | Internal |
| `quantity_variance` | DECIMAL(18,4) | No | — | Generated: `quantity_received - quantity_ordered` | Variance vs PO | Internal |
| `rejection_reason_code` | VARCHAR(50) | No | NULL | FK to `stock_reason_codes.code`; required if `quantity_rejected > 0` | Rejection reason | Internal |
| `rejection_reason_text` | TEXT | No | NULL | Required if `quantity_rejected > 0` | Rejection explanation | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch created/assigned | Internal |
| `batch_number` | VARCHAR(50) | No | NULL | — | Batch number | Public |
| `lot_number_supplier` | VARCHAR(50) | No | NULL | — | Supplier's lot number | Internal |
| `manufacturing_date` | DATE | No | NULL | — | Manufacturing date | Public |
| `expiry_date` | DATE | No | NULL | — | Expiry date | Public |
| `unit_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit price (from PO) | Confidential |
| `line_value_received` | DECIMAL(18,4) | Yes | — | Generated: `quantity_received * unit_price` | Line value received | Confidential |
| `line_value_accepted` | DECIMAL(18,4) | Yes | `0` | — | Line value accepted | Confidential |
| `qc_required` | BOOLEAN | Yes | `true` | — | QC required for this line | Internal |
| `qc_status` | ENUM | No | NULL | PENDING, PASSED, FAILED, CONDITIONAL | Line QC status | Confidential |
| `putaway_location_id` | UUID | No | NULL | FK to `locations.id` (BIN) | Putaway location | Internal |
| `putaway_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity putaway | Internal |
| `putaway_task_id` | UUID | No | NULL | FK to `putaway_tasks.id` | Putaway task | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger.id` | Ledger entry for this line | Internal |
| `line_status` | ENUM | Yes | `RECEIVED` | RECEIVED, VERIFIED, QC_PENDING, QC_PASSED, QC_FAILED, PUTAWAY, COMPLETED, REJECTED | Line status | Internal |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | GRN → Company, Facility, Warehouse, Supplier, PO, ASN, UserAccount (received_by, verified_by), QCInspection; GRNLine → GRN, POLine, ASNLine, Product, UOM, Batch, Location, PutawayTask, InventoryLedger, StockReasonCode |
| **Index** | `uq_grn_code_company`, `idx_grn_status`, `idx_grn_supplier`, `idx_grn_po`, `idx_grn_asn`, `idx_grn_date`, `idx_grn_qc_pending` (partial), `idx_grn_lines_grn`, `idx_grn_lines_product`, `idx_grn_lines_batch`, `idx_grn_lines_qc_status` |
| **Validation** | At least 1 line, `quantity_received` > 0, `quantity_accepted` ≤ `quantity_received`, `quantity_rejected` = `quantity_received` - `quantity_accepted`, `rejection_reason_*` required if `quantity_rejected > 0`, batch required if `product.batch_required = true`, expiry_date required if `product.expiry_required = true`, **cannot bypass QC if `product.qc_required = true`** (per Part 5 business rules) |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/grns` (GET, POST), `/api/v1/grns/:id` (GET, PATCH), `/api/v1/grns/:id/lines` (GET, POST), `/api/v1/grns/:id/submit` (POST), `/api/v1/grns/:id/verify` (POST), `/api/v1/grns/:id/start-qc` (POST), `/api/v1/grns/:id/complete-qc` (POST), `/api/v1/grns/:id/putaway` (POST — initiate putaway), `/api/v1/grns/:id/close` (POST), `/api/v1/grns/:id/cancel` (POST), `/api/v1/grns/by-po/:poId` (GET), `/api/v1/grns/by-supplier/:supplierId` (GET), `/api/v1/grns/pending-qc` (GET), `/api/v1/grns/pending-putaway` (GET) |
| **UI** | GRN List, GRN Detail (with lines + QC + putaway), GRN Create Form (multi-line with barcode scan), QC Results Entry, Putaway Suggestions, Gate Entry Integration, Variance Report |
| **Mobile** | Mobile GRN creation (primary — barcode scan + quantity entry), offline GRN (sync later), QC entry on mobile, putaway confirmation, variance entry |
| **Reports** | GRN Register, Pending GRNs (per Part 5), QC Pass/Fail Rate, Rejection Analysis, GRN Cycle Time, Putaway Performance, Variance Report, Supplier Delivery Performance |
| **Audit** | Full; **immutable after COMPLETED**; ledger entries are hash-chained (per Ch 18 Q106); mandatory reason for cancellation, rejection |

### 13-16. Security / AI / Performance / Example

**Security**: `grn_number`, `grn_date` = Public; quantities = Internal; `unit_price`, `line_value_*`, `total_value_*`, `supplier_invoice_*` = Confidential; `qc_status` = Confidential.

**AI**: Putaway Optimization AI (suggests putaway locations), QC Prediction AI (predicts QC pass/fail), Variance Detection AI, Supplier Performance AI (updates from GRN data).

**Performance**: < 20k per year; Redis cache TTL 1 hour.

### Critical Implementation: GRN → Ledger Write (Same Transaction)

```typescript
async function completeGRN(grnId: UUID): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const grn = await tx.goodsReceiptNote.findUnique({ 
      where: { id: grnId }, 
      include: { lines: true } 
    });
    
    // 1. Update GRN status to COMPLETED
    await tx.goodsReceiptNote.update({
      where: { id: grnId },
      data: { status: 'COMPLETED' }
    });
    
    // 2. For each line, write to Inventory Ledger (immutable)
    for (const line of grn.lines) {
      if (line.quantity_accepted > 0) {
        const ledgerEntry = await tx.inventoryLedger.create({
          data: {
            transaction_number: await numberSeriesService.next('INV', grn.company_id),
            transaction_type: 'RECEIPT',
            movement_type: 'RECEIPT',
            source_document_type: 'GOODS_RECEIPT_NOTE',
            source_document_id: grn.id,
            source_document_number: grn.grn_number,
            company_id: grn.company_id,
            facility_id: grn.facility_id,
            warehouse_id: grn.warehouse_id,
            location_id: line.putaway_location_id,
            product_id: line.product_id,
            batch_id: line.batch_id,
            lot_id: line.lot_id,
            quantity_delta: line.quantity_accepted,  // positive = receipt
            quantity_before: await getCurrentBalance(line.product_id, line.batch_id, line.putaway_location_id),
            quantity_after: 0,  // computed
            uom_id: line.uom_id,
            unit_cost: line.unit_price,
            total_cost: line.quantity_accepted * line.unit_price,
            reason_code: 'GRN_RECEIPT',
            reason_text: `Goods received per ${grn.grn_number}`,
            actor_user_id: grn.received_by,
            transaction_time: grn.arrival_datetime,
            previous_hash: await getPreviousHash(),
            current_hash: '',  // computed
          }
        });
        
        // 3. Update Inventory Master (event-updated summary)
        await tx.inventoryMaster.upsert({
          where: { location_id_product_id_batch_id: { ... } },
          create: { ... },
          update: { 
            available_qty: { increment: line.quantity_accepted },  // or qc_hold_qty if QC required
            on_hand_qty: { increment: line.quantity_accepted },
            last_movement_at: grn.arrival_datetime,
            version: { increment: 1 }
          }
        });
        
        // 4. Write to Event Outbox (for Event Bus publication)
        await tx.domainEventOutbox.create({
          data: {
            event_type: 'inventory.stock.received',
            aggregate_id: ledgerEntry.id,
            payload: { grn_id: grn.id, line_id: line.id, ... }
          }
        });
      }
    }
  });
  // Outbox processor publishes events after commit
}
```

#### Example: GRN with QC

```json
{
  "header": {
    "id": "01928f7a-...-grn-001",
    "code": "GRN-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "warehouse_id": "01928f7a-...-wh-rm-01",
    "supplier_id": "01928f7a-...-sup-001",
    "po_id": "01928f7a-...-po-001",
    "asn_id": "01928f7a-...-asn-001",
    "grn_number": "GRN-2026-000001",
    "grn_date": "2026-07-13",
    "grn_type": "PO_RECEIPT",
    "received_by": "01928f7a-...-user-wh-clerk",
    "vehicle_number": "MH12-AB-1234",
    "driver_name": "Ramesh Kumar",
    "arrival_datetime": "2026-07-13T10:15:00Z",
    "unload_start_datetime": "2026-07-13T10:20:00Z",
    "unload_end_datetime": "2026-07-13T10:45:00Z",
    "verification_datetime": "2026-07-13T11:00:00Z",
    "total_lines": 1,
    "total_quantity_received": 500.0000,
    "total_quantity_accepted": 495.0000,
    "total_quantity_rejected": 5.0000,
    "total_quantity_putaway": 0.0000,
    "currency_code": "INR",
    "total_value_received": 22250.0000,
    "total_value_accepted": 22027.5000,
    "total_value_rejected": 222.5000,
    "requires_qc": true,
    "qc_status": "PASSED",
    "qc_inspection_id": "01928f7a-...-qc-001",
    "qc_completed_at": "2026-07-13T14:00:00Z",
    "putaway_completed": false,
    "supplier_invoice_number": "MUR-INV-2026-042",
    "supplier_invoice_date": "2026-07-10",
    "supplier_invoice_value": 23600.0000,
    "gate_entry_number": "GE-2026-000042",
    "dock_used": "DOCK-01",
    "status": "QC_PASSED",
    "version": 4
  },
  "lines": [
    {
      "id": "01928f7a-...-grnl-001",
      "grn_id": "01928f7a-...-grn-001",
      "line_number": 1,
      "po_line_id": "01928f7a-...-pol-001",
      "asn_line_id": "01928f7a-...-asnl-001",
      "product_id": "01928f7a-...-prod-sugar",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity_ordered": 500.0000,
      "quantity_asn": 500.0000,
      "quantity_received": 500.0000,
      "quantity_accepted": 495.0000,
      "quantity_rejected": 5.0000,
      "quantity_variance": 0.0000,
      "rejection_reason_code": "DAMAGE_HANDLING",
      "rejection_reason_text": "5kg damaged during transit — packets torn. Returning to supplier.",
      "batch_id": "01928f7a-...-batch-002",
      "batch_number": "SUP-MUR-2026-042",
      "lot_number_supplier": "MUR-LOT-2026-042",
      "manufacturing_date": "2026-06-15",
      "expiry_date": "2028-06-15",
      "unit_price": 44.5000,
      "line_value_received": 22250.0000,
      "line_value_accepted": 22027.5000,
      "qc_required": true,
      "qc_status": "PASSED",
      "putaway_location_id": null,
      "putaway_quantity": 0.0000,
      "line_status": "QC_PASSED"
    }
  ]
}
```

---

## Entity 040 — Purchase Return

### 1. Business Purpose

The `PurchaseReturn` entity records **return of defective or unwanted goods to a supplier**. Per Part 5, returns can happen for multiple reasons:

- **Quality Failure** — QC failure after GRN
- **Damage** — Damage during storage/handling (post-GRN)
- **Wrong Item** — Supplier shipped wrong product
- **Expiry** — Stock expired before use
- **Over Supply** — Supplier sent more than ordered
- **Supplier Recall** — Supplier initiated recall

Returns write RETURN movement type to Inventory Ledger (per Ch 10 §10.5), removing stock from inventory. Returns may also create a credit note from supplier (Accounts Payable integration).

### Return Lifecycle

```
DRAFT → SUBMITTED → APPROVED → DISPATCHED → COMPLETED → CLOSED
                ↓
          REJECTED
```

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Procurement Head |
| Data Owner | Procurement Head + Warehouse Head |
| Technical Owner | Backend Lead — Procurement Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `purchase_returns` (header) + `purchase_return_lines` (line items) |
| Prisma Models | `PurchaseReturn`, `PurchaseReturnLine` |
| Pattern | Header-line |
| **Critical** | Return completion triggers Inventory Ledger write (RETURN movement type) |

### 4. Field Dictionary

#### 4.1 Return Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PRET-` | Return code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities | Facility |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Warehouse |
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id` | Supplier | Confidential |
| `po_id` | UUID | No | NULL | FK to `purchase_orders.id` | Source PO | Internal |
| `grn_id` | UUID | No | NULL | FK to `goods_receipt_notes.id` | Source GRN | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, APPROVED, REJECTED, DISPATCHED, COMPLETED, CLOSED, CANCELLED | Lifecycle | Internal |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `return_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `return_date` | DATE | Yes | `CURRENT_DATE` | — | Return date | Internal |
| `return_type` | ENUM | Yes | — | QUALITY_FAILURE, DAMAGE, WRONG_ITEM, EXPIRY, OVER_SUPPLY, SUPPLIER_RECALL, NEGOTIATED_RETURN | Return reason category | Internal |
| `return_reason` | TEXT | Yes | — | Min 10 chars | Detailed reason | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `requested_by` | UUID | Yes | — | FK to `user_accounts.id` | Who requested | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Who approved | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `approval_comments` | TEXT | No | NULL | — | Approval comments | Internal |
| `rejected_reason` | TEXT | No | NULL | Required if status = REJECTED | Rejection reason | Internal |
| `dispatched_at` | TIMESTAMPTZ | No | NULL | — | Dispatch timestamp | Internal |
| `dispatched_by` | UUID | No | NULL | FK to `user_accounts.id` | Who dispatched | Internal |
| `vehicle_number` | VARCHAR(20) | No | NULL | — | Vehicle number | Internal |
| `driver_name` | VARCHAR(100) | No | NULL | — | Driver | Internal |
| `lr_number` | VARCHAR(50) | No | NULL | — | LR number | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion timestamp | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of lines | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total return quantity | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `total_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total return value | Confidential |
| `credit_note_expected` | BOOLEAN | Yes | `true` | — | Whether credit note expected | Confidential |
| `credit_note_number` | VARCHAR(50) | No | NULL | — | Supplier credit note number | Confidential |
| `credit_note_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Credit note value | Confidential |
| `credit_note_received_at` | DATE | No | NULL | — | Credit note receipt date | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries | Internal |
| `supplier_rma_number` | VARCHAR(50) | No | NULL | — | Supplier RMA reference | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Return Lines

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `return_id` | UUID | Yes | — | FK to `purchase_returns.id` | Parent return |
| `line_number` | INTEGER | Yes | — | > 0, unique per return | Line number | Internal |
| `grn_line_id` | UUID | No | NULL | FK to `goods_receipt_note_lines.id` | Source GRN line | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity_returned` | DECIMAL(18,4) | Yes | — | > 0 | Quantity being returned | Internal |
| `unit_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit price (from PO/GRN) | Confidential |
| `line_value` | DECIMAL(18,4) | Yes | — | Generated: `quantity_returned * unit_price` | Line value | Confidential |
| `return_reason_code` | VARCHAR(50) | Yes | — | FK to `stock_reason_codes.code` | Specific reason | Internal |
| `return_reason_text` | TEXT | Yes | — | Min 10 chars | Detailed reason | Internal |
| `location_id` | UUID | Yes | — | FK to `locations.id` | Source location | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger.id` | Ledger entry | Internal |
| `line_status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, DISPATCHED, COMPLETED | Line status | Internal |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | PurchaseReturn → Company, Facility, Warehouse, Supplier, PO, GRN, UserAccount; ReturnLine → Return, GRNLine, Product, Batch, UOM, Location, InventoryLedger, StockReasonCode |
| **Index** | `uq_returns_code_company`, `idx_returns_status`, `idx_returns_supplier`, `idx_returns_po`, `idx_returns_grn`, `idx_returns_date`, `idx_return_lines_return`, `idx_return_lines_product`, `idx_return_lines_batch` |
| **Validation** | At least 1 line, `quantity_returned` > 0, must reference GRN if `return_type` IN (QUALITY_FAILURE, DAMAGE, OVER_SUPPLY), `return_reason_text` min 10 chars, approval required before DISPATCHED, ledger entry created on COMPLETED, credit note tracking |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/purchase-returns` (GET, POST), `/api/v1/purchase-returns/:id` (GET, PATCH), `/api/v1/purchase-returns/:id/submit` (POST), `/api/v1/purchase-returns/:id/approve` (POST), `/api/v1/purchase-returns/:id/reject` (POST), `/api/v1/purchase-returns/:id/dispatch` (POST), `/api/v1/purchase-returns/:id/complete` (POST), `/api/v1/purchase-returns/:id/credit-note` (POST — record credit note), `/api/v1/purchase-returns/by-supplier/:supplierId` (GET), `/api/v1/purchase-returns/by-grn/:grnId` (GET) |
| **UI** | Return List, Return Detail (with lines + approval), Return Create Form (from GRN or standalone), Approval Queue, Credit Note Tracker, Dispatch Confirmation |
| **Mobile** | Return initiation from GRN (mobile), dispatch confirmation, credit note entry |
| **Reports** | Purchase Return Report, Returns by Supplier, Returns by Reason, Return Value Analysis, Credit Note Tracking, Pending Returns |
| **Audit** | Full; mandatory reason for return, approval, rejection; ledger entries immutable + hash-chained |

### 13-16. Security / AI / Performance / Example

**Security**: `return_number`, `return_date` = Public; `total_value`, `line_value`, `unit_price`, `credit_note_*` = Confidential; supplier info = Confidential.

**AI**: Return Prediction AI (predicts which receipts will result in returns), Supplier Quality AI (tracks return rates per supplier), Damage Pattern AI.

**Performance**: < 5k per year; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-pret-001",
    "code": "PRET-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "warehouse_id": "01928f7a-...-wh-rm-01",
    "supplier_id": "01928f7a-...-sup-001",
    "po_id": "01928f7a-...-po-001",
    "grn_id": "01928f7a-...-grn-001",
    "return_number": "PRET-2026-000001",
    "return_date": "2026-07-13",
    "return_type": "DAMAGE",
    "return_reason": "5kg sugar damaged during transit — packets torn. Returning to supplier per QC rejection at GRN.",
    "priority": "HIGH",
    "requested_by": "01928f7a-...-user-wh-mgr",
    "approved_by": "01928f7a-...-user-proc-head",
    "approved_at": "2026-07-13T15:00:00Z",
    "approval_comments": "Approved — damage documented with photos. Returning to supplier for credit.",
    "total_lines": 1,
    "total_quantity": 5.0000,
    "currency_code": "INR",
    "total_value": 222.5000,
    "credit_note_expected": true,
    "supplier_rma_number": "MUR-RMA-2026-005",
    "status": "APPROVED",
    "version": 2
  },
  "lines": [
    {
      "id": "01928f7a-...-pretl-001",
      "return_id": "01928f7a-...-pret-001",
      "line_number": 1,
      "grn_line_id": "01928f7a-...-grnl-001",
      "product_id": "01928f7a-...-prod-sugar",
      "batch_id": "01928f7a-...-batch-002",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity_returned": 5.0000,
      "unit_price": 44.5000,
      "line_value": 222.5000,
      "return_reason_code": "DAMAGE_TRANSIT",
      "return_reason_text": "5kg sugar packets torn during transit — material exposed, not usable",
      "location_id": "01928f7a-...-bin-rm-01-01",
      "line_status": "APPROVED"
    }
  ]
}
```

---

## Part 5 Completion Summary

**All 10 Procurement & Supplier Domain entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| 031 Supplier Master | `31-32-33-supplier-triad.md` | ✅ Complete |
| 032 Supplier Qualification | `31-32-33-supplier-triad.md` | ✅ Complete |
| 033 Supplier Performance | `31-32-33-supplier-triad.md` | ✅ Complete |
| 034 Purchase Requisition | `34-35-36-pre-po-flow.md` | ✅ Complete |
| 035 RFQ | `34-35-36-pre-po-flow.md` | ✅ Complete |
| 036 Vendor Quotation | `34-35-36-pre-po-flow.md` | ✅ Complete |
| 037 Purchase Order | `37-purchase-order.md` | ✅ Complete (most detailed) |
| 038 ASN | `38-39-40-receipt-returns.md` | ✅ Complete |
| 039 GRN | `38-39-40-receipt-returns.md` | ✅ Complete (writes to Inventory Ledger) |
| 040 Purchase Return | `38-39-40-receipt-returns.md` | ✅ Complete |

### Key Architectural Decisions in Part 5

1. **Multi-supplier architecture** — Single Supplier Master with multi-type support (`supplier_types[]` array)
2. **Supplier qualification mandatory** — No PO without ACTIVE qualification (per Ch 5 §5.3 Source-to-Stock)
3. **Supplier performance auto-computed** — From GRN history + QC results + delivery timeliness
4. **PR is mandatory** — No PO without approved PR (per Part 5 principles)
5. **RFQ is optional** — Configurable per company policy; small-value POs can skip
6. **Multi-supplier RFQ** — One RFQ, multiple quotations, comparison matrix, award decision
7. **PO immutable after APPROVED** — Changes require formal Amendment (new PO referencing original)
8. **PO approval value-based** — L3 (< ₹1L), L2 (₹1L-₹10L), L1 + Sensitive Operation (> ₹10L)
9. **PO partitioned monthly** — Per Part 5 Performance Strategy
10. **ASN enables dock planning** — Optional but recommended
11. **GRN writes to Inventory Ledger** — Per Ch 10 §10.5 ledger-first; same DB transaction (Outbox pattern)
12. **GRN cannot bypass QC** — If `product.qc_required = true`, stock goes to `qc_hold_qty` until QC passes
13. **Purchase Return writes RETURN ledger entry** — Per Ch 10 §10.5
14. **Strategic Sourcing fields reserved** — Blanket POs, Contracts, AVL, multi-round RFQ (per Enterprise Architect Enhancement)
15. **Banking fields encrypted at rest** — Per Ch 23 §23.6 (Restricted security classification)
16. **MSME compliance** — Payment terms compliance per Indian regulations
17. **GST/TDS compliance** — Interstate tax treatment, TDS deduction, GST supply type tracking
18. **Credit limit enforcement** — PO creation checks `supplier.available_credit`
19. **Snapshot fields on PO** — Supplier address + payment terms captured at approval (immutable audit)
20. **All procurement events auditable** — Per Ch 18 §18.14 immutable history
