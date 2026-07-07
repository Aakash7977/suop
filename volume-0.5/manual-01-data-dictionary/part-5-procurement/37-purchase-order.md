# Manual 1 · Part 5 · Entity 37 — Purchase Order (PO)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 5 — Procurement & Supplier Domain |
| Entity | Purchase Order (037) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.3, Ch 5 §5.18, Ch 7 §7.5, Ch 9 §9.6 |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `PurchaseOrder` entity is the **official purchasing document** — a legally binding commitment to purchase goods or services from a supplier at agreed prices, terms, and delivery dates. Per Volume 0 Chapter 5 §5.3 (Source-to-Stock), the PO is the central artifact of the procurement lifecycle:

```
Purchase Requisition → RFQ (optional) → Vendor Selection → PURCHASE ORDER → Supplier Dispatch → GRN → QC → Inventory
```

The PO is:
- **Legally binding** — once approved, creates obligation to pay upon receipt
- **Immutable after approval** — changes require formal amendment (per Part 5 business rules)
- **Multi-line** — one PO can contain multiple products
- **Multi-delivery** — can have multiple GRNs against it (partial deliveries)
- **Multi-currency** — supports foreign currency purchases
- **Approval-gated** — high-value POs require multi-tier approval (per Ch 2 §2.6, Ch 8 §8.10)

### PO Types

| Type | Description | Use Case |
|---|---|---|
| **STANDARD** | One-time purchase | Most common — standard procurement |
| **BLANKET** | Blanket PO (Strategic Sourcing) | Long-term agreement; multiple releases against it |
| **CONTRACT** | Contract PO (Strategic Sourcing) | Master contract; specific POs reference it |
| **SERVICE** | Service order | For services (cleaning, maintenance, consulting) |
| **CONSIGNMENT** | Consignment PO | Goods at our location but owned by supplier until consumed |
| **DROP_SHIP** | Drop shipment | Supplier ships directly to customer |

### PO Lifecycle (per Part 5)

```
DRAFT → SUBMITTED → APPROVED → RELEASED → SUPPLIER_CONFIRMED → ASN_EXPECTED → PARTIAL_RECEIPT → FULLY_RECEIVED → CLOSED
                                    ↓                                                                              ↓
                                REJECTED                                                                    CANCELLED
```

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Procurement Head |
| Data Owner | Procurement Head |
| Technical Owner | Backend Lead — Procurement Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `purchase_orders` (header) + `purchase_order_lines` (line items) |
| Prisma Models | `PurchaseOrder`, `PurchaseOrderLine` |
| File Location | `prisma/schema/transactional/procurement/purchase_order.prisma` |
| **Partitioning** | **Monthly by `po_date`** (per Part 5 Performance Strategy) |
| Lifecycle | 9-stage transactional lifecycle (per Ch 4 §4.6) |
| Immutability | Immutable after APPROVED status (changes require Amendment) |

---

## 4. Field Dictionary

### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PO-` | PO number (e.g., `PO-2026-000001`) — **immutable** |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` | Purchasing facility |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, RELEASED, SUPPLIER_CONFIRMED, PARTIAL_RECEIPT, FULLY_RECEIVED, CLOSED, CANCELLED, REJECTED | Lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator (buyer) |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete (rare) |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

### 4.2 PO Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `po_number` | VARCHAR(50) | Yes | — | Unique per company, format `PO-{YEAR}-{SEQ}` | Display PO number | Public | — |
| `po_date` | DATE | Yes | `CURRENT_DATE` | — | PO creation date | Internal | — |
| `po_type` | ENUM | Yes | `STANDARD` | STANDARD, BLANKET, CONTRACT, SERVICE, CONSIGNMENT, DROP_SHIP | PO type | Internal | — |
| `po_origin` | ENUM | Yes | `MANUAL` | MANUAL, FROM_PR, FROM_RFQ, AUTO_REORDER, BLANKET_RELEASE | How PO was created | Internal | — |
| `is_amendment` | BOOLEAN | Yes | `false` | — | If true, this is an amendment to an existing PO | Internal | — |
| `original_po_id` | UUID | No | NULL | FK self-ref; set if `is_amendment = true` | Original PO being amended | Internal | — |
| `amendment_number` | INTEGER | No | NULL | ≥ 1; set if `is_amendment = true` | Amendment sequence number | Internal | — |
| `amendment_reason` | TEXT | No | NULL | Required if `is_amendment = true` | Reason for amendment | Internal | — |

### 4.3 Party References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id`; supplier must be ACTIVE and not blacklisted | Supplier | Confidential |
| `supplier_code` | VARCHAR(30) | No | NULL | Denormalized from supplier | Supplier code (for quick display) | Internal |
| `supplier_name` | VARCHAR(250) | No | NULL | Denormalized | Supplier name | Public |
| `supplier_gstin` | VARCHAR(15) | No | NULL | Denormalized | Supplier GSTIN (for tax calc) | Confidential |
| `supplier_address_snapshot` | JSONB | Yes | — | Snapshot of supplier address at PO time | Immutable address snapshot (per audit) | Internal |
| `buyer_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Procurement buyer | Internal |
| `buyer_name` | VARCHAR(150) | No | NULL | Denormalized | Buyer name | Internal |
| `department_id` | UUID | Yes | — | FK to `departments.id` | Requesting department | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Delivery warehouse | Internal |
| `warehouse_address_snapshot` | JSONB | Yes | — | Snapshot of delivery address | Immutable delivery address | Internal |

### 4.4 Source References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `pr_id` | UUID | No | NULL | FK to `purchase_requisitions.id` | Source PR | Internal |
| `pr_number` | VARCHAR(50) | No | NULL | Denormalized | PR number | Internal |
| `rfq_id` | UUID | No | NULL | FK to `rfqs.id` | Source RFQ | Internal |
| `rfq_number` | VARCHAR(50) | No | NULL | Denormalized | RFQ number | Internal |
| `winning_quotation_id` | UUID | No | NULL | FK to `vendor_quotations.id` | Winning quotation | Internal |
| `contract_id` | UUID | No | NULL | FK to `vendor_contracts.id` (Strategic Sourcing) | Parent contract (for CONTRACT POs) | Confidential |
| `blanket_po_id` | UUID | No | NULL | FK self-ref; set for BLANKET_RELEASE | Parent blanket PO | Internal |

### 4.5 Date Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `po_date` | DATE | Yes | `CURRENT_DATE` | — | PO date | Internal | — |
| `required_delivery_date` | DATE | Yes | — | > po_date | Required delivery date | Internal | Lead time AI |
| `promised_delivery_date` | DATE | No | NULL | ≥ required_delivery_date if set | Supplier-promised delivery | Internal | — |
| `actual_delivery_date` | DATE | No | NULL | — | Actual delivery date (set on full receipt) | Internal | — |
| `valid_until` | DATE | Yes | — | > po_date | PO validity date | Internal | — |
| `approved_date` | DATE | No | NULL | — | Approval date | Internal | — |
| `released_date` | DATE | No | NULL | — | Release date (sent to supplier) | Internal | — |
| `supplier_confirmed_date` | DATE | No | NULL | — | Supplier confirmation date | Internal | — |
| `closed_date` | DATE | No | NULL | — | Closure date | Internal | — |

### 4.6 Commercial Terms

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | PO currency | Internal |
| `exchange_rate` | DECIMAL(12,6) | No | NULL | > 0; required if currency ≠ company base currency | Exchange rate (for foreign currency) | Confidential |
| `exchange_rate_date` | DATE | No | NULL | — | Exchange rate date | Internal |
| `payment_terms_id` | UUID | Yes | — | FK to `payment_terms.id` | Payment terms | Confidential |
| `payment_terms_snapshot` | JSONB | Yes | — | Snapshot of terms at PO time | Immutable terms snapshot | Confidential |
| `delivery_terms` | ENUM | Yes | `FOR_DESTINATION` | EX_WORKS, FOB_ORIGIN, FOR_DESTINATION, CIF, C_AND_F, DDP | Delivery terms (Incoterms) | Internal |
| `mode_of_transport` | ENUM | No | NULL | ROAD, RAIL, AIR, SEA, COURIER | Transport mode | Internal |

### 4.7 Financial Summary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of line items | Internal |
| `subtotal` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Sum of line subtotals (before discount/tax) | Confidential |
| `total_discount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total discount | Confidential |
| `total_tax` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total tax | Confidential |
| `freight_charges` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Freight charges | Confidential |
| `insurance_charges` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Insurance charges | Confidential |
| `packing_charges` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Packing charges | Confidential |
| `other_charges` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Other charges | Confidential |
| `rounding_adjustment` | DECIMAL(18,4) | Yes | `0` | — | Rounding adjustment | Confidential |
| `grand_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Grand total | Confidential |
| `grand_total_base_currency` | DECIMAL(18,4) | No | NULL | — | Grand total in base currency | Confidential |
| `total_received_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value received so far (denormalized from GRNs) | Confidential |
| `total_invoiced_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value invoiced by supplier | Confidential |
| `total_paid_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value paid | Confidential |
| `outstanding_value` | DECIMAL(18,4) | No | — | Generated: `grand_total - total_received_value` | Outstanding value | Confidential |

### 4.8 Approval Tracking

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `approval_flow_id` | UUID | No | NULL | FK to `approval_flows.id` | Approval workflow | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DELEGATED, ESCALATED | Approval status | Internal |
| `approval_level` | INTEGER | Yes | `0` | ≥ 0 | Current approval level | Internal |
| `total_approval_levels` | INTEGER | Yes | `1` | ≥ 1 | Total approval levels required | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Final approver | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Final approval timestamp | Internal |
| `approval_comments` | TEXT | No | NULL | — | Approval comments | Internal |
| `rejection_reason` | TEXT | No | NULL | Required if status = REJECTED | Rejection reason | Internal |
| `rejected_by` | UUID | No | NULL | FK to `user_accounts.id` | Who rejected | Internal |
| `rejected_at` | TIMESTAMPTZ | No | NULL | — | Rejection timestamp | Internal |

### 4.9 Receipt Tracking

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `total_quantity_ordered` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity across all lines | Internal |
| `total_quantity_received` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity received | Internal |
| `total_quantity_rejected` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity rejected at GRN | Internal |
| `total_quantity_returned` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity returned post-receipt | Internal |
| `receipt_completion_pct` | DECIMAL(5,2) | No | — | Generated: `(total_quantity_received / total_quantity_ordered) * 100` | Receipt % complete | Internal |
| `grn_count` | INTEGER | Yes | `0` | ≥ 0 | Number of GRNs against this PO | Internal |
| `first_grn_date` | DATE | No | NULL | — | First GRN date | Internal |
| `last_grn_date` | DATE | No | NULL | — | Last GRN date | Internal |
| `is_fully_received` | BOOLEAN | Yes | `false` | Generated | Fully received flag | Internal |
| `is_partially_received` | BOOLEAN | Yes | `false` | Generated | Partially received flag | Internal |

### 4.10 Compliance & Special Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `requires_qc_inspection` | BOOLEAN | Yes | `true` | — | Whether QC required on receipt | Internal |
| `qc_inspection_type` | ENUM | No | `INCOMING` | NONE, INCOMING, INCOMING_AND_FINAL | QC inspection stages | Internal |
| `is_interstate` | BOOLEAN | Yes | — | Generated: supplier state ≠ company state | Interstate purchase (affects tax) | Internal |
| `tax_treatment` | ENUM | Yes | — | INTRA_STATE, INTER_STATE, IMPORT, EXPORT | Tax treatment | Confidential |
| `gst_supply_type` | ENUM | No | NULL | REGULAR, REVERSE_CHARGE, COMPOSITION, EXEMPT, NIL_RATED | GST supply type | Confidential |
| `tds_applicable` | BOOLEAN | Yes | `false` | — | TDS deduction applicable | Confidential |
| `tds_section` | VARCHAR(20) | No | NULL | — | TDS section (194C, 194J, etc.) | Confidential |
| `tds_rate_pct` | DECIMAL(5,2) | No | NULL | ≥ 0 | TDS rate | Confidential |
| `is_msme_supplier` | BOOLEAN | Yes | `false` | — | MSME supplier (payment terms compliance) | Confidential |
| `msme_payment_due_days` | INTEGER | No | NULL | — | MSME mandatory payment days (per regulations) | Confidential |

### 4.11 Status & Closure

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `is_closed` | BOOLEAN | Yes | `false` | — | Closed flag | Internal |
| `closure_reason` | VARCHAR(200) | No | NULL | Required if status = CLOSED | Closure reason | Internal |
| `closed_by` | UUID | No | NULL | FK to `user_accounts.id` | Who closed | Internal |
| `cancel_reason` | VARCHAR(200) | No | NULL | Required if status = CANCELLED | Cancellation reason | Internal |
| `cancelled_by` | UUID | No | NULL | FK to `user_accounts.id` | Who cancelled | Internal |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation timestamp | Internal |

### 4.12 Strategic Sourcing Fields (Future-Ready)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `blanket_release_number` | INTEGER | No | NULL | — | Release number (for BLANKET_RELEASE POs) | Internal |
| `blanket_total_limit` | DECIMAL(18,4) | No | NULL | ≥ 0 | Blanket PO total limit | Confidential |
| `blanket_utilized_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value utilized (for blanket POs) | Confidential |
| `blanket_remaining_value` | DECIMAL(18,4) | No | — | Generated: `blanket_total_limit - blanket_utilized_value` | Remaining blanket value | Confidential |
| `contract_start_date` | DATE | No | NULL | — | Contract period start (for CONTRACT POs) | Internal |
| `contract_end_date` | DATE | No | NULL | > contract_start_date | Contract period end | Internal |

### 4.13 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 4.14 PO Line Items (purchase_order_lines)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `po_id` | UUID | Yes | — | FK to `purchase_orders.id` | Parent PO |
| `line_number` | INTEGER | Yes | — | > 0, unique per PO | Line number | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `product_description` | TEXT | No | NULL | — | Description (snapshot) | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity_ordered` | DECIMAL(18,4) | Yes | — | > 0 | Ordered quantity | Internal |
| `quantity_received` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Received quantity (denormalized from GRNs) | Internal |
| `quantity_rejected` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Rejected quantity | Internal |
| `quantity_returned` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Returned quantity | Internal |
| `quantity_balance` | DECIMAL(18,4) | No | — | Generated: `quantity_ordered - quantity_received` | Balance to receive | Internal |
| `unit_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit price | Confidential |
| `discount_pct` | DECIMAL(5,2) | Yes | `0` | 0–100 | Discount % | Confidential |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Discount amount | Confidential |
| `tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code` | Tax code | Confidential |
| `tax_pct` | DECIMAL(5,2) | Yes | `0` | 0–100 | Tax % | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax amount | Confidential |
| `line_subtotal` | DECIMAL(18,4) | Yes | — | Generated: `quantity_ordered * unit_price` | Line subtotal | Confidential |
| `line_total` | DECIMAL(18,4) | Yes | — | Generated: `line_subtotal - discount_amount + tax_amount` | Line total | Confidential |
| `required_delivery_date` | DATE | Yes | — | — | Line delivery date | Internal |
| `promised_delivery_date` | DATE | No | NULL | — | Supplier-promised date | Internal |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers.id` | Cost center | Confidential |
| `budget_code` | VARCHAR(30) | No | NULL | — | Budget code | Confidential |
| `pr_line_id` | UUID | No | NULL | FK to `purchase_requisition_lines.id` | Source PR line | Internal |
| `quotation_line_id` | UUID | No | NULL | FK to `vendor_quotation_lines.id` | Source quotation line | Internal |
| `qc_required` | BOOLEAN | Yes | `true` | — | QC required for this line | Internal |
| `qc_specification_id` | UUID | No | NULL | FK to `qc_specifications.id` | QC spec | Internal |
| `batch_required` | BOOLEAN | Yes | `true` | — | Batch tracking required | Internal |
| `line_status` | ENUM | Yes | `OPEN` | OPEN, PARTIALLY_RECEIVED, FULLY_RECEIVED, CLOSED, CANCELLED | Line status | Internal |
| `line_remarks` | TEXT | No | NULL | — | Line annotation | Internal |

---

## 5. Relationships

### 5.1 Inbound

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| PO → Company, Facility, Supplier, Buyer (User), Department, Warehouse, PR, RFQ, VendorQuotation, PaymentTerms, ApprovalFlow, VendorContract, PO (original/blanket) | N : 1 each | various | RESTRICT/SET NULL |

### 5.2 Outbound

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| PO → PurchaseOrderLine | 1 : N | `purchase_order_lines.po_id` | CASCADE |
| PO → GoodsReceiptNote | 1 : N | `goods_receipt_notes.po_id` | RESTRICT |
| PO → ASN | 1 : N | `asns.po_id` | SET NULL |
| PO → PurchaseReturn | 1 : N | `purchase_returns.po_id` | SET NULL |
| PO → Batch | 1 : N | `batches.purchase_order_id` | SET NULL |
| PO → InventoryLedger | 1 : N | `inventory_ledger.source_document_id` (where type=PO) | SET NULL |
| PO → PurchaseOrderAmendment | 1 : N | `purchase_order_amendments.original_po_id` | SET NULL |
| PO → FileAttachment | 1 : N | `file_attachments.entity_id` (where entity_type=PURCHASE_ORDER) | SET NULL |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_purchase_orders` | PRIMARY KEY | `id` | Default PK |
| `uq_po_code_company` | UNIQUE | `company_id, code` | Code uniqueness |
| `uq_po_number_company` | UNIQUE | `company_id, po_number` | PO number uniqueness |
| `idx_po_status` | B-TREE | `status, po_date DESC` | Default filter |
| `idx_po_supplier` | B-TREE | `supplier_id, po_date DESC` | Supplier PO history |
| `idx_po_warehouse` | B-TREE | `warehouse_id, status` | Warehouse POs |
| `idx_po_buyer` | B-TREE | `buyer_user_id, status` | Buyer's POs |
| `idx_po_date` | B-TREE | `po_date DESC` (partition pruning) | Time-range queries |
| `idx_po_required_delivery` | B-TREE | `required_delivery_date, status WHERE status IN ('APPROVED', 'RELEASED', 'SUPPLIER_CONFIRMED')` | Late delivery tracking |
| `idx_po_approval_pending` | PARTIAL | `facility_id, po_date WHERE approval_status = 'PENDING' AND status = 'SUBMITTED'` | Approval queue |
| `idx_po_partial_receipt` | PARTIAL | `supplier_id WHERE is_partially_received = true AND is_fully_received = false` | Partial receipt tracking |
| `idx_po_search` | GIN | `to_tsvector('english', po_number \|\| ' ' \|\| supplier_name \|\| ' ' \|\| code)` | Full-text search |
| `idx_po_tags` | GIN | `tags` | Tag filtering |
| `idx_po_amendment` | PARTIAL | `original_po_id WHERE is_amendment = true` | Amendment lookup |
| `idx_po_blanket` | PARTIAL | `company_id WHERE po_type = 'BLANKET'` | Blanket PO lookup |
| `pk_purchase_order_lines` | PK | `id` |
| `idx_pol_po` | B-TREE | `po_id, line_number` |
| `idx_pol_product` | B-TREE | `product_id` |
| `idx_pol_status` | B-TREE | `line_status` |
| `idx_pol_balance` | PARTIAL | `po_id WHERE line_status IN ('OPEN', 'PARTIALLY_RECEIVED')` | Open lines (for GRN) |

### Partitioning

```sql
-- Monthly partitions (per Part 5 Performance Strategy)
CREATE TABLE purchase_orders_2026_07 PARTITION OF purchase_orders
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- pg_partman manages automatically
```

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique per company | DB | Unique constraint |
| 2 | `po_number` unique per company | DB | Unique constraint |
| 3 | `code` and `po_number` are **immutable** after creation | App | Service-layer + audit |
| 4 | Supplier must be ACTIVE and not blacklisted | App | Service-layer validation |
| 5 | Supplier must have ACTIVE qualification | App | Cross-entity validation |
| 6 | At least 1 line item required before SUBMITTED | App | Service-layer |
| 7 | `quantity_ordered` > 0 on each line | DB | CHECK |
| 8 | `unit_price` ≥ 0 on each line | DB | CHECK |
| 9 | `required_delivery_date` > `po_date` | DB | CHECK |
| 10 | `valid_until` > `po_date` | DB | CHECK |
| 11 | `grand_total` = subtotal - total_discount + total_tax + freight + insurance + packing + other + rounding | App | Service-layer verification |
| 12 | Approval required before RELEASED (per Ch 2 §2.6) | App | Workflow Engine |
| 13 | Approval routing based on grand_total (per Ch 8 §8.10) — higher value = more approvers | App | Approval Engine |
| 14 | L3 approval for < ₹1,00,000 | App | Approval Engine |
| 15 | L2 approval for ₹1,00,000 – ₹10,00,000 | App | Approval Engine |
| 16 | L1 approval + Sensitive Operation for > ₹10,00,000 (per Ch 6 §6.13) | App | Approval Engine |
| 17 | **PO immutable after APPROVED** — changes require Amendment (new PO with `is_amendment = true`) | App | Service-layer enforcement |
| 18 | Cannot cancel PO with received quantity > 0 (must close instead) | App | Service-layer |
| 19 | Cannot delete PO with GRNs | App | Referential integrity |
| 20 | `total_quantity_received` ≤ `total_quantity_ordered` (allow over-tolerance per config) | App | Service-layer |
| 21 | Credit limit check: `supplier.outstanding_payable + grand_total` ≤ `supplier.credit_limit` (unless overridden) | App | Service-layer |
| 22 | MSME payment terms compliance (per regulations) | App | Service-layer validation |
| 23 | Foreign currency PO requires `exchange_rate` | DB | CHECK |
| 24 | `tax_treatment` auto-derived from `is_interstate` | App | Service-layer |
| 25 | State transitions follow defined lifecycle | App | Workflow Engine |
| 26 | Amendment must reference original PO | DB | CHECK |
| 27 | Blanket PO release cannot exceed `blanket_remaining_value` | App | Service-layer |
| 28 | `supplier_address_snapshot` and `payment_terms_snapshot` captured at APPROVED status (immutable audit) | App | Service-layer |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/purchase-orders` | GET | List POs | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/:id` | GET | Get PO details | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders` | POST | Create PO (DRAFT) | `PROCUREMENT:CREATE` |
| `/api/v1/purchase-orders/:id` | PATCH | Update PO (only in DRAFT) | `PROCUREMENT:EDIT` |
| `/api/v1/purchase-orders/:id/lines` | GET, POST | Manage lines | `PROCUREMENT:EDIT` |
| `/api/v1/purchase-orders/:id/submit` | POST | Submit for approval | `PROCUREMENT:EDIT` |
| `/api/v1/purchase-orders/:id/approve` | POST | Approve PO | `PROCUREMENT:APPROVE` |
| `/api/v1/purchase-orders/:id/reject` | POST | Reject PO | `PROCUREMENT:APPROVE` |
| `/api/v1/purchase-orders/:id/release` | POST | Release to supplier | `PROCUREMENT:APPROVE` |
| `/api/v1/purchase-orders/:id/supplier-confirm` | POST | Supplier confirms | `PROCUREMENT:EDIT` |
| `/api/v1/purchase-orders/:id/amend` | POST | Create amendment | `PROCUREMENT:APPROVE` + Sensitive Operation |
| `/api/v1/purchase-orders/:id/cancel` | POST | Cancel PO | `PROCUREMENT:APPROVE` |
| `/api/v1/purchase-orders/:id/close` | POST | Close PO | `PROCUREMENT:APPROVE` |
| `/api/v1/purchase-orders/:id/grns` | GET | List GRNs | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/:id/asns` | GET | List ASNs | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/:id/returns` | GET | List returns | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/:id/ledger` | GET | PO-related ledger entries | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/:id/print` | GET | Generate PDF | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/:id/email` | POST | Email PO to supplier | `PROCUREMENT:EDIT` |
| `/api/v1/purchase-orders/pending-approval` | GET | Approval queue | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/late-deliveries` | GET | Late deliveries | `PROCUREMENT:VIEW` |
| `/api/v1/purchase-orders/open` | GET | Open POs | `PROCUREMENT:VIEW` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| PO List | AG Grid with multi-filter (supplier, status, date, value) | `/procurement/purchase-orders` |
| PO Detail | Tabbed: Overview, Lines, Approvals, GRNs, ASNs, Returns, Ledger, Audit | `/procurement/purchase-orders/:id` |
| PO Create Form | Multi-section: Header, Lines, Commercial, Compliance, Approval | `/procurement/purchase-orders/new` |
| PO Approval Queue | Approval cards with value-based routing | `/procurement/approvals/po` |
| PO Amendment Wizard | Create amendment with diff view | `/procurement/purchase-orders/:id/amend` |
| PO Print View | Formal PDF layout for supplier | `/procurement/purchase-orders/:id/print` |
| Open PO Dashboard | POs awaiting receipt | `/procurement/po/open` |
| Late Delivery Report | POs past delivery date | `/procurement/po/late` |
| Blanket PO Manager | Blanket PO utilization tracking | `/procurement/po/blanket` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| PO approval (L3+) | Approve/reject from mobile |
| PO status tracking | View PO status, delivery date |
| PO to supplier email | Send PO from mobile |
| GRN against PO | Receive goods referencing PO |
| Late delivery alerts | Push notifications |
| Supplier confirmation | Supplier confirms PO (future vendor portal) |

---

## 11. Reports

| Report | Use of PO |
|---|---|
| Purchase Register | All POs in period (per Part 5 Reports) |
| Open Purchase Orders | POs awaiting receipt (per Part 5) |
| Pending GRNs | POs with pending receipts (per Part 5) |
| Late Deliveries | POs past delivery date (per Part 5) |
| Purchase Spend Analysis | Spend by supplier/category/period |
| PO to GRN Cycle Time | Average time from PO to GRN |
| Approval Cycle Time | Average approval time |
| Amendment Report | POs amended with reasons |
| Cancellation Report | Cancelled POs with reasons |
| Blanket PO Utilization | Blanket PO release tracking |
| MSME Compliance Report | MSME POs and payment compliance |
| Tax Report | GST treatment summary |
| Supplier-wise PO Report | POs per supplier |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (only in DRAFT) | Yes | Optional | Permanent |
| SUBMIT | Yes | Optional | Permanent |
| APPROVE / REJECT | Yes | **Mandatory** (reason for reject) | Permanent |
| RELEASE | Yes | Optional | Permanent |
| AMEND (creates new PO) | Yes | **Mandatory** (amendment_reason) | Permanent |
| CANCEL | Yes | **Mandatory** (cancel_reason) | Permanent |
| CLOSE | Yes | **Mandatory** (closure_reason) | Permanent |
| PRICE CHANGE (via amendment) | Yes | **Mandatory** | Permanent |
| QUANTITY CHANGE (via amendment) | Yes | **Mandatory** | Permanent |
| SUPPLIER CHANGE (via amendment) | Yes | **Mandatory** + Sensitive Operation | Permanent |
| DELETE (soft — rare, only if no GRNs) | Yes | **Mandatory** | Permanent |
| EXPORT | Yes | **Mandatory** | 7 years |

**Audit Level**: Full — all field changes captured with old/new values. After APPROVED, changes only via Amendment (new PO record referencing original).

**Special**: POs are hash-chained for tamper-evidence (per Ch 18 Q106).

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `po_number`, `po_date`, `po_type`, `supplier_name`, `warehouse_id`, `status` | Public | All procurement-scoped users |
| `code`, `buyer_user_id`, `department_id`, dates, `total_lines`, `total_quantity_*` | Internal | L2+ Procurement |
| `unit_price`, `subtotal`, `grand_total`, `*_charges`, `*_value`, `payment_terms_*`, `exchange_rate` | Confidential | L2+ Procurement, Finance |
| `supplier_id`, `supplier_gstin` | Confidential | L2+ Procurement, Finance |
| `tax_treatment`, `gst_supply_type`, `tds_*`, `is_msme_supplier` | Confidential | L2+ Finance |
| `blanket_total_limit`, `blanket_utilized_value`, `contract_*` | Confidential | L2+ Procurement, Finance |
| `approval_*` | Internal | L2+ Procurement |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| **Demand-Based Procurement AI** | Generates POs from demand forecast |
| **Automatic Reorder AI** | Auto-creates POs at reorder point (per Ch 5 §5.16) |
| **Vendor Recommendation AI** | Recommends best supplier for PO |
| **Price Trend Analysis AI** | Analyzes price trends across POs |
| **Lead Time Prediction AI** | Predicts actual lead time per supplier |
| **Supplier Risk Score AI** | Risk assessment at PO creation |
| **Procurement Cost Optimization AI** | Identifies cost-saving opportunities |
| **Spend Forecasting AI** | Forecasts spend by category/supplier |
| **Late Delivery Prediction AI** | Predicts PO delivery delays |
| **Approval Routing AI** | Optimizes approval routing |
| **PO Anomaly Detection AI** | Detects unusual PO patterns (potential fraud) |
| **Blanket PO Optimization AI** | Recommends blanket agreements |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | Medium-high — ~10,000 POs/year at scale |
| **Partitioning** | Monthly by `po_date` (per Part 5 Performance Strategy); pg_partman auto-managed |
| Cache strategy | Redis cache, TTL 1 hour; approval queue cached separately with 5-min TTL |
| Query patterns | By `company_id + po_number`, `supplier_id + po_date`, `status`, `buyer_user_id`, `warehouse_id`, `required_delivery_date` |
| Hot path: GRN create | PO lookup by ID — cached |
| Hot path: approval queue | Partial index on pending approvals — fast |
| Snapshot fields | `supplier_address_snapshot`, `payment_terms_snapshot` captured at approval — prevents supplier master changes from affecting historical POs |
| Denormalized fields | `total_quantity_received`, `total_received_value`, etc. updated by event handler on each GRN |
| N+1 prevention | Eager-load `supplier`, `lines`, `warehouse` when listing |
| Aggregations | For dashboards, use pre-aggregated daily/monthly summary tables (per Ch 15 Q82) |

---

## 16. Example Records

### Example 1: Standard PO (from RFQ)

```json
{
  "header": {
    "id": "01928f7a-...-po-001",
    "code": "PO-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "po_number": "PO-2026-000001",
    "po_date": "2026-07-06",
    "po_type": "STANDARD",
    "po_origin": "FROM_RFQ",
    "is_amendment": false,
    "supplier_id": "01928f7a-...-sup-001",
    "supplier_code": "SUP-000001",
    "supplier_name": "Mursaleen Traders Private Limited",
    "supplier_gstin": "27AAACM1234F1Z5",
    "supplier_address_snapshot": {
      "line1": "123 Wholesale Market",
      "line2": "Mumbai APMC, Vashi",
      "city": "Navi Mumbai",
      "state": "Maharashtra",
      "pincode": "400703",
      "gstin": "27AAACM1234F1Z5"
    },
    "buyer_user_id": "01928f7a-...-user-buyer",
    "buyer_name": "Priya Sharma",
    "department_id": "01928f7a-...-dept-proc",
    "warehouse_id": "01928f7a-...-wh-rm-01",
    "warehouse_address_snapshot": {
      "line1": "Plot 7, MIDC Phase 2",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411026"
    },
    "pr_id": "01928f7a-...-pr-001",
    "pr_number": "PR-2026-000001",
    "rfq_id": "01928f7a-...-rfq-001",
    "rfq_number": "RFQ-2026-000001",
    "winning_quotation_id": "01928f7a-...-quote-001",
    "required_delivery_date": "2026-07-13",
    "promised_delivery_date": "2026-07-13",
    "valid_until": "2026-08-05",
    "currency_code": "INR",
    "payment_terms_id": "01928f7a-...-pt-net30",
    "payment_terms_snapshot": {
      "code": "NET30",
      "description": "Net 30 days",
      "credit_days": 30
    },
    "delivery_terms": "FOR_DESTINATION",
    "mode_of_transport": "ROAD",
    "total_lines": 1,
    "subtotal": 22250.0000,
    "total_discount": 222.5000,
    "total_tax": 1100.0000,
    "freight_charges": 500.0000,
    "grand_total": 23600.0000,
    "grand_total_base_currency": 23600.0000,
    "total_quantity_ordered": 500.0000,
    "requires_qc_inspection": true,
    "qc_inspection_type": "INCOMING",
    "is_interstate": true,
    "tax_treatment": "INTER_STATE",
    "gst_supply_type": "REGULAR",
    "tds_applicable": true,
    "tds_section": "194C",
    "tds_rate_pct": 1.00,
    "is_msme_supplier": false,
    "approval_status": "APPROVED",
    "approved_by": "01928f7a-...-user-proc-head",
    "approved_at": "2026-07-06T16:00:00Z",
    "approved_date": "2026-07-06",
    "released_date": "2026-07-06",
    "status": "RELEASED",
    "version": 3
  },
  "lines": [
    {
      "id": "01928f7a-...-pol-001",
      "po_id": "01928f7a-...-po-001",
      "line_number": 1,
      "product_id": "01928f7a-...-prod-sugar",
      "product_description": "Refined Sugar (Raw Material)",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity_ordered": 500.0000,
      "quantity_received": 0.0000,
      "quantity_rejected": 0.0000,
      "quantity_returned": 0.0000,
      "quantity_balance": 500.0000,
      "unit_price": 44.5000,
      "discount_pct": 1.00,
      "discount_amount": 222.5000,
      "tax_code": "GST-05-IGST",
      "tax_pct": 5.00,
      "tax_amount": 1100.0000,
      "line_subtotal": 22250.0000,
      "line_total": 23600.0000,
      "required_delivery_date": "2026-07-13",
      "promised_delivery_date": "2026-07-13",
      "cost_center_id": "01928f7a-...-cc-mfg-swt",
      "pr_line_id": "01928f7a-...-prl-001",
      "quotation_line_id": "01928f7a-...-ql-001",
      "qc_required": true,
      "batch_required": true,
      "line_status": "OPEN"
    }
  ]
}
```

### Example 2: Partially Received PO

```json
{
  "header": {
    "id": "01928f7a-...-po-002",
    "code": "PO-2026-000002",
    "po_number": "PO-2026-000002",
    "supplier_name": "PackPro Industries LLP",
    "total_quantity_ordered": 5000.0000,
    "total_quantity_received": 3000.0000,
    "total_quantity_rejected": 50.0000,
    "receipt_completion_pct": 60.00,
    "grn_count": 2,
    "first_grn_date": "2026-06-20",
    "last_grn_date": "2026-06-25",
    "is_partially_received": true,
    "is_fully_received": false,
    "total_received_value": 13500.0000,
    "grand_total": 22500.0000,
    "outstanding_value": 9000.0000,
    "status": "PARTIAL_RECEIPT",
    "version": 5
  }
}
```

### Example 3: Blanket PO (Strategic Sourcing)

```json
{
  "header": {
    "id": "01928f7a-...-po-003",
    "code": "PO-2026-BLANKET-001",
    "po_number": "PO-2026-BL-001",
    "po_type": "BLANKET",
    "po_origin": "MANUAL",
    "supplier_name": "Mursaleen Traders Private Limited",
    "po_date": "2026-04-01",
    "valid_until": "2027-03-31",
    "contract_start_date": "2026-04-01",
    "contract_end_date": "2027-03-31",
    "blanket_total_limit": 5000000.0000,
    "blanket_utilized_value": 2250000.0000,
    "blanket_remaining_value": 2750000.0000,
    "grand_total": 5000000.0000,
    "total_received_value": 2250000.0000,
    "status": "PARTIAL_RECEIPT",
    "version": 8,
    "tags": ["strategic", "blanket", "annual-contract"]
  }
}
```

### Example 4: Cancelled PO

```json
{
  "header": {
    "id": "01928f7a-...-po-004",
    "code": "PO-2026-000004",
    "po_number": "PO-2026-000004",
    "po_date": "2026-06-15",
    "supplier_name": "CheapPack Solutions",
    "cancel_reason": "Supplier blacklisted due to repeated quality failures. PO cancelled before any delivery.",
    "cancelled_by": "01928f7a-...-user-proc-head",
    "cancelled_at": "2026-06-16T10:00:00Z",
    "total_quantity_ordered": 1000.0000,
    "total_quantity_received": 0.0000,
    "status": "CANCELLED",
    "version": 2
  }
}
```
