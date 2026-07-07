# Manual 1 · Part 11 · Section 3 · Entities 301-310 — Accounts Payable, Procurement Accounting & Vendor Payments

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 11 — Enterprise Finance & Accounting |
| Section | 3 — Accounts Payable (AP), Procurement Accounting & Vendor Payments |
| Entities | 301–310 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.3, Ch 10 §10.6, Part 11 §3 |
| Last Updated | 2026-07-07 |

---

## Overview — Procure-to-Pay (P2P) Accounting Flow

Section 3 completes the **Procure-to-Pay financial workflow**, connecting Procurement, Warehouse, Inventory, and Finance:

```
Purchase Order → Goods Receipt (GRN) → Vendor Invoice → Three-Way Match
  → Accounting Event → Journal Posting → Vendor Ledger
  → Payment Proposal → Vendor Payment → Bank → General Ledger
```

### P2P Accounting Flow (Per Part 11 — Locked)

```
GRN:
  Debit Inventory
  Credit GRNI (Goods Received Not Invoiced)

Vendor Invoice:
  Debit GRNI
  Credit Vendor Payable
  (Debit Input Tax — if GST)

Vendor Payment:
  Debit Vendor Payable
  Credit Bank
```

### Integrated Enhancement: Financial Workflow Engine
All AP approvals route through a **configurable Financial Workflow Engine** (shared across platform):
- Amount-based approval matrices
- Department-based routing
- BU approvals, Emergency paths, Delegation
- SLA monitoring, Escalation rules, Parallel approvals, Digital signatures

---

## Entity 301 — Vendor Ledger

### 1. Business Purpose
Maintains financial balance for each vendor. Per Part 11: *"Derived automatically from AP transactions. Cannot be edited manually."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `vendor_id` | UUID | Yes | — | FK to `suppliers`, UNIQUE | Vendor (per Part 11: "vendor_id") | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `gl_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | AP control account | Confidential |
| `opening_balance` | DECIMAL(18,4) | Yes | `0` | — | Opening (per Part 11: "opening_balance") | Confidential |
| `total_debit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Debits — payments (per Part 11: "debit") | Confidential |
| `total_credit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Credits — invoices (per Part 11: "credit") | Confidential |
| `closing_balance` | DECIMAL(18,4) | Yes | `0` | Generated: `opening + credit - debit` | Closing (per Part 11: "closing_balance") | Confidential |
| `current_balance` | DECIMAL(18,4) | Yes | `0` | — | Real-time outstanding | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `aging_bucket` | VARCHAR(20) | No | NULL | — | Current aging (per Part 11: "aging_bucket") | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 302 — Vendor Invoice

### 1. Business Purpose
Represents supplier invoices. Per Part 11: Status — Draft, Received, Under Verification, Approved, Rejected, Paid, Cancelled.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `invoice_number` | VARCHAR(50) | Yes | — | Unique per vendor | Invoice number (per Part 11: "Invoice Number") | Internal |
| `invoice_number_supplier` | VARCHAR(50) | Yes | — | — | Supplier's invoice ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `vendor_id` | UUID | Yes | — | FK to `suppliers` | Vendor (per Part 11: "Vendor") | Confidential |
| `purchase_order_id` | UUID | No | NULL | FK to `purchase_orders` | PO (per Part 11: "Purchase Order") | Internal |
| `grn_id` | UUID | No | NULL | FK to `goods_receipt_notes` | GRN (per Part 11: "GRN") | Internal |
| `invoice_date` | DATE | Yes | — | — | Invoice date (per Part 11: "Invoice Date") | Internal |
| `due_date` | DATE | Yes | — | > invoice_date | Due date (per Part 11: "Due Date") | Internal |
| `received_date` | DATE | Yes | `CURRENT_DATE` | — | Received in finance | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency (per Part 11: "Currency") | Internal |
| `exchange_rate` | DECIMAL(12,6) | No | `1.000000` | > 0 | FX rate | Confidential |
| `subtotal` | DECIMAL(18,4) | Yes | — | ≥ 0 | Pre-tax (per Part 11: "Subtotal") | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax (per Part 11: "Tax") | Confidential |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Discount | Confidential |
| `rounding_adjustment` | DECIMAL(18,4) | Yes | `0` | — | Rounding | Confidential |
| `total_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total (per Part 11: "Total") | Confidential |
| `total_amount_base_currency` | DECIMAL(18,4) | Yes | — | — | In base currency | Confidential |
| `tds_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | TDS deducted | Confidential |
| `tds_section` | VARCHAR(20) | No | NULL | — | TDS section (e.g., "194C") | Confidential |
| `net_payable_amount` | DECIMAL(18,4) | Yes | — | — | After TDS | Confidential |
| `payment_terms_id` | UUID | Yes | — | FK to `payment_terms` | Payment terms | Confidential |
| `invoice_file_id` | UUID | No | NULL | FK to `file_attachments` | Scanned invoice | Confidential |
| `is_duplicate_suspected` | BOOLEAN | Yes | `false` | — | Duplicate flag (per Part 11: "Duplicate invoice prevention") | Confidential |
| `duplicate_check_details` | JSONB | No | NULL | — | Duplicate analysis | Internal |
| `three_way_match_id` | UUID | No | NULL | FK to `three_way_matches` (Entity 303) | Match result | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Posted event | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `payment_id` | UUID | No | NULL | FK to `vendor_payments` (Entity 308) | Payment | Confidential |
| `paid_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Amount paid so far | Confidential |
| `balance_amount` | DECIMAL(18,4) | No | — | Generated: `net_payable - paid` | Outstanding | Confidential |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `approval_comments` | TEXT | No | NULL | — | Comments | Internal |
| `rejected_reason` | TEXT | No | NULL | Required if REJECTED | Reason | Internal |
| `invoice_status` | ENUM | Yes | `DRAFT` | DRAFT, RECEIVED, UNDER_VERIFICATION, APPROVED, REJECTED, PAID, PARTIALLY_PAID, CANCELLED (per Part 11: "Invoice Status") | Status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `invoice_date` (per Part 11 Performance Strategy)
- **Index**: `uq_vi_invoice_vendor`, `idx_vi_vendor`, `idx_vi_po`, `idx_vi_grn`, `idx_vi_status`, `idx_vi_due_date`, `idx_vi_duplicate`
- **Validation**: `invoice_number` unique per vendor (duplicate prevention); `total_amount = subtotal + tax - discount + rounding`; `net_payable = total - tds`
- **AI**: Duplicate Invoice Detection (OCR + matching), Invoice OCR Validation, Fraud Detection

---

## Entity 303 — Three-Way Matching

### 1. Business Purpose
Validates supplier invoices. Per Part 11: Matches PO → GRN → Invoice on Quantity, Price, Tax, Currency. *"Mismatch beyond tolerance requires approval."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `match_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `vendor_invoice_id` | UUID | Yes | — | FK to `vendor_invoices` | Invoice (per Part 11: "Vendor Invoice") | Confidential |
| `purchase_order_id` | UUID | Yes | — | FK to `purchase_orders` | PO (per Part 11: "Purchase Order") | Internal |
| `grn_id` | UUID | Yes | — | FK to `goods_receipt_notes` | GRN (per Part 11: "Goods Receipt") | Internal |
| `quantity_match` | BOOLEAN | Yes | `false` | — | Qty matched (per Part 11: "Quantity") | Internal |
| `quantity_variance` | DECIMAL(18,4) | No | NULL | — | Qty variance | Internal |
| `price_match` | BOOLEAN | Yes | `false` | — | Price matched (per Part 11: "Price") | Internal |
| `price_variance` | DECIMAL(18,4) | No | NULL | — | Price variance | Confidential |
| `tax_match` | BOOLEAN | Yes | `false` | — | Tax matched (per Part 11: "Tax") | Internal |
| `tax_variance` | DECIMAL(18,4) | No | NULL | — | Tax variance | Confidential |
| `currency_match` | BOOLEAN | Yes | `false` | — | Currency matched (per Part 11: "Currency") | Internal |
| `overall_match` | BOOLEAN | Yes | `false` | Generated: all match | Overall (per Part 11: "Validation") | Confidential |
| `tolerance_qty_pct` | DECIMAL(5,2) | Yes | `2.00` | 0-100 | Qty tolerance | Internal |
| `tolerance_price_pct` | DECIMAL(5,2) | Yes | `1.00` | 0-100 | Price tolerance | Internal |
| `mismatch_details` | JSONB | No | `'[]'` | — | Array of `{ field, expected, actual, variance, tolerance_breach }` | Confidential |
| `approval_required` | BOOLEAN | Yes | `false` | Generated: any tolerance breach | Approval needed (per Part 11: "Mismatch beyond tolerance requires approval") | Confidential |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `approval_reason` | TEXT | No | NULL | — | Reason for override | Internal |
| `match_status` | ENUM | Yes | `PENDING` | PENDING, MATCHED, MISMATCH_TOLERANCE, MISMATCH_BREACH, APPROVED, REJECTED | Status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |

---

## Entity 304 — Vendor Credit Note

### 1. Business Purpose
Records supplier-issued credits. Per Part 11 reasons: Returned Goods, Price Difference, Damaged Material, Overbilling, Tax Adjustment.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `credit_note_number` | VARCHAR(50) | Yes | — | Unique per vendor | Display | Internal |
| `vendor_id` | UUID | Yes | — | FK to `suppliers` | Vendor | Confidential |
| `vendor_invoice_id` | UUID | No | NULL | FK to `vendor_invoices` | Original invoice | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `credit_reason` | ENUM | Yes | — | RETURNED_GOODS, PRICE_DIFFERENCE, DAMAGED_MATERIAL, OVERBILLING, TAX_ADJUSTMENT (per Part 11: "Reasons") | Reason | Internal |
| `credit_amount` | DECIMAL(18,4) | Yes | — | > 0 | Credit amount | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `credit_date` | DATE | Yes | `CURRENT_DATE` | — | Credit date | Internal |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `adjusted_against_invoice` | BOOLEAN | Yes | `false` | — | Adjusted against invoice | Internal |
| `adjustment_invoice_id` | UUID | No | NULL | FK to `vendor_invoices` | Invoice adjusted | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, ADJUSTED, PAID, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 305 — Vendor Debit Note

### 1. Business Purpose
Records debit adjustments. Per Part 11 reasons: Short Supply, Penalty, Late Delivery, Quality Deduction, Freight Recovery.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `debit_note_number` | VARCHAR(50) | Yes | — | Unique per vendor | Display | Internal |
| `vendor_id` | UUID | Yes | — | FK to `suppliers` | Vendor | Confidential |
| `vendor_invoice_id` | UUID | No | NULL | FK to `vendor_invoices` | Original invoice | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `debit_reason` | ENUM | Yes | — | SHORT_SUPPLY, PENALTY, LATE_DELIVERY, QUALITY_DEDUCTION, FREIGHT_RECOVERY (per Part 11: "Reasons") | Reason | Internal |
| `debit_amount` | DECIMAL(18,4) | Yes | — | > 0 | Debit amount | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `debit_date` | DATE | Yes | `CURRENT_DATE` | — | Debit date | Internal |
| `reason_details` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Approver | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, ADJUSTED, REJECTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 306 — Advance Payment

### 1. Business Purpose
Payments before receipt. Per Part 11: Advance Number, Vendor, Amount, Currency, Adjustment Status, Balance. Supports partial adjustment.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `advance_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 11: "Advance Number") | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `vendor_id` | UUID | Yes | — | FK to `suppliers` | Vendor (per Part 11: "Vendor") | Confidential |
| `purchase_order_id` | UUID | No | NULL | FK to `purchase_orders` | Linked PO | Internal |
| `advance_amount` | DECIMAL(18,4) | Yes | — | > 0 | Advance (per Part 11: "Amount") | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency (per Part 11: "Currency") | Internal |
| `advance_date` | DATE | Yes | `CURRENT_DATE` | — | Advance date | Internal |
| `adjusted_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Adjusted against invoices | Confidential |
| `balance_amount` | DECIMAL(18,4) | No | — | Generated: `advance - adjusted` | Balance (per Part 11: "Balance") | Confidential |
| `adjustment_status` | ENUM | Yes | `PENDING` | PENDING, PARTIALLY_ADJUSTED, FULLY_ADJUSTED, REFUNDED | Status (per Part 11: "Adjustment Status") | Internal |
| `payment_id` | UUID | Yes | — | FK to `vendor_payments` (Entity 308) | Payment record | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 307 — Payment Proposal

### 1. Business Purpose
Suggests payable invoices. Per Part 11: Selection by Due Date, Vendor, Priority, Discount, Cash Position, Currency, Approval Level. AI: Payment optimization.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `proposal_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal | |
| `proposal_date` | DATE | Yes | `CURRENT_DATE` | — | Proposal date | Internal | |
| `payment_due_date` | DATE | Yes | — | — | Target payment date | Internal | |
| `total_proposed_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total proposed | Confidential | |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal | |
| `invoice_count` | INTEGER | Yes | `0` | ≥ 0 | Invoices included | Internal | |
| `vendor_count` | INTEGER | Yes | `0` | ≥ 0 | Vendors included | Internal | |
| `selection_criteria` | JSONB | Yes | `'{}'` | — | Criteria: `{ due_date_range, vendors, priority, min_amount, max_amount, discount_only }` (per Part 11: "Selection Criteria") | Internal | |
| `cash_position` | DECIMAL(18,4) | Yes | `0` | — | Available cash (per Part 11: "Cash Position") | Confidential | |
| `is_cash_sufficient` | BOOLEAN | Yes | `false` | Generated: `cash_position >= total_proposed` | Cash check | Confidential | |
| `discount_opportunity_amount` | DECIMAL(18,4) | No | `0` | ≥ 0 | Early payment discounts available | Confidential | |
| `is_ai_optimized` | BOOLEAN | Yes | `false` | — | AI-optimized (per Part 11 AI: "Payment optimization") | Internal | Payment AI |
| `ai_confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI confidence | Internal | |
| `ai_recommendations` | JSONB | No | NULL | — | AI payment recommendations | Internal | Payment AI |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver (per Part 11: "Approval Level") | Confidential | |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal | |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, PARTIALLY_PAID, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 308 — Vendor Payment

### 1. Business Purpose
Executes payments. Per Part 11 methods: Bank Transfer, Cheque, UPI, RTGS, NEFT, Wire Transfer, Cash.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payment_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 11: "Payment Number") | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `vendor_id` | UUID | Yes | — | FK to `suppliers` | Vendor (per Part 11: "Vendor") | Confidential |
| `payment_proposal_id` | UUID | No | NULL | FK to `payment_proposals` | Source proposal | Internal |
| `payment_method` | ENUM | Yes | — | BANK_TRANSFER, CHEQUE, UPI, RTGS, NEFT, WIRE_TRANSFER, CASH (per Part 11: "Payment Methods") | Method | Confidential |
| `payment_amount` | DECIMAL(18,4) | Yes | — | > 0 | Amount (per Part 11: "Amount") | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `payment_date` | DATE | Yes | `CURRENT_DATE` | — | Payment date (per Part 11: "Payment Date") | Internal |
| `bank_account_id` | UUID | No | NULL | FK to `bank_accounts` | Bank (per Part 11: "Bank") | Confidential |
| `bank_reference_number` | VARCHAR(100) | No | NULL | — | Bank reference (per Part 11: "Reference") | Internal |
| `cheque_number` | VARCHAR(50) | No | NULL | — | Cheque number (if cheque) | Confidential |
| `upi_reference` | VARCHAR(100) | No | NULL | — | UPI reference | Internal |
| `rtgs_neft_reference` | VARCHAR(100) | No | NULL | — | RTGS/NEFT reference | Internal |
| `tds_deducted` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | TDS amount | Confidential |
| `discount_availed` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Early payment discount | Confidential |
| `net_paid_amount` | DECIMAL(18,4) | Yes | — | — | Net amount | Confidential |
| `invoice_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Invoices being paid | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Posted event | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, PROCESSED, COMPLETED, FAILED, CANCELLED (per Part 11: "Status") | Status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 309 — Vendor Aging

### 1. Business Purpose
Tracks outstanding liabilities. Per Part 11 buckets: Current, 1-30, 31-60, 61-90, 91-180, 180+ Days. AI: Cash flow prediction.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal | |
| `vendor_id` | UUID | Yes | — | FK to `suppliers` | Vendor | Confidential | |
| `current_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Not yet due (per Part 11: "Current") | Confidential | Cash Flow AI |
| `bucket_1_30` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 1-30 days (per Part 11: "1–30 Days") | Confidential | Cash Flow AI |
| `bucket_31_60` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 31-60 days | Confidential | |
| `bucket_61_90` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 61-90 days | Confidential | |
| `bucket_91_180` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 91-180 days (per Part 11: "91–180 Days") | Confidential | Risk AI |
| `bucket_180_plus` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 180+ days (per Part 11: "180+ Days") | Confidential | Risk AI |
| `total_outstanding` | DECIMAL(18,4) | Yes | `0` | Generated: SUM of all buckets | Total | Confidential | |
| `overdue_amount` | DECIMAL(18,4) | Yes | `0` | Generated: `total - current` | Overdue | Confidential | |
| `overdue_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Overdue % | Confidential | |
| `ai_cash_flow_prediction` | DECIMAL(18,4) | No | NULL | — | Predicted payment date | Confidential | Cash Flow AI |
| `ai_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | Vendor risk (per Part 11 AI: "Cash flow prediction") | Confidential | Risk AI |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 310 — Accounts Payable Dashboard

### 1. Business Purpose
Per Part 11: Open Invoices, Overdue Payments, Upcoming Payments, Vendor Aging, Cash Requirement, Blocked Invoices, Payment Queue, Discount Opportunities.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `open_invoices_count` | INTEGER | Yes | `0` | ≥ 0 | Open (per Part 11: "Open Invoices") | Internal |
| `open_invoices_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Open amount | Confidential |
| `overdue_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue (per Part 11: "Overdue Payments") | Confidential |
| `overdue_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overdue amount | Confidential |
| `upcoming_payments_7d` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Next 7 days (per Part 11: "Upcoming Payments") | Confidential |
| `upcoming_payments_30d` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Next 30 days | Confidential |
| `vendor_aging_summary` | JSONB | Yes | `'{}'` | — | Aging: `{ current, 1-30, 31-60, 61-90, 91-180, 180+ }` (per Part 11: "Vendor Aging") | Confidential |
| `cash_requirement_30d` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash needed (per Part 11: "Cash Requirement") | Confidential |
| `blocked_invoices_count` | INTEGER | Yes | `0` | ≥ 0 | Blocked (per Part 11: "Blocked Invoices") | Internal |
| `payment_queue_count` | INTEGER | Yes | `0` | ≥ 0 | Queue (per Part 11: "Payment Queue") | Internal |
| `discount_opportunities` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Discounts available (per Part 11: "Discount Opportunities") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI AP insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 11 Sections 1-3 Completion Summary

**All 30 Finance Foundation, GL/COA, and Accounts Payable entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **Enterprise Accounting Event Engine** — All modules generate events, not journals (per Part 11 §1)
2. **Universal Posting Rules Engine** — Configurable rules convert events to journals; no accounting logic in operational modules (per Enhancement)
3. **Three-Layer Financial Architecture** — Journal Lines (immutable) → GL (balances) → Financial Cube (pre-aggregated)
4. **Finance Micro Kernel** — 10 shared services (Posting, Tax, Currency, Fiscal Calendar, Journal, Budget, Cost Allocation, Consolidation, Event, Reporting)
5. **Multi-company consolidation** — Legal Entity → Company → BU hierarchy
6. **Fiscal Calendar control** — Open → Soft Close → Hard Close → Locked (per Part 11)
7. **Financial Dimensions** — 12+ configurable dimensions for analysis
8. **Immutable journal entries** — Layer 1 never edited; corrections via reversal (per Part 11 §2)
9. **Three-Way Matching** — PO → GRN → Invoice validation with tolerance (per Part 11 §3)
10. **Payment Proposal engine** — AI-optimized payment scheduling (per Part 11 §3)
11. **Vendor aging** — 6 buckets with AI cash flow prediction
12. **Duplicate invoice prevention** — System-level check before approval
13. **TDS/TCS compliance** — Built into invoice and payment processing
14. **Financial Workflow Engine** — Shared approval service across platform (per Enhancement)
15. **Complete audit trail** — All financial events, journals, postings permanently audited
