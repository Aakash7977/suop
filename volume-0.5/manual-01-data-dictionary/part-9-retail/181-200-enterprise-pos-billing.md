# Manual 1 · Part 9 · Section 2 · Entities 181-200 — Enterprise POS, Billing Engine & Customer Transactions

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 9 — Enterprise Retail Operations |
| Section | 2 — Enterprise POS, Billing Engine & Customer Transactions |
| Entities | 181–200 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §1.2, Ch 5 §5.8, Ch 13 §13.10, Part 9 §2 |
| Last Updated | 2026-07-07 |

---

## Overview — Enterprise POS Architecture

Section 2 defines the **transactional core** of retail operations. Per the Chief Enterprise Architect recommendation, this is designed as an **Enterprise POS Platform + Integration Layer** — not a from-scratch POS. The existing Sudhamrit POS will be treated as **Retail POS v1** and evolved into SUOP Enterprise POS through structured enhancements.

```
EXISTING POS (v1)                    SUOP ENTERPRISE PLATFORM
  ↓                                          ↑
  ──── POS INTEGRATION LAYER ────────────────┘
         ↓
  Master Sync ←→ Transaction Sync ←→ Event Sync
```

### Enterprise POS Principles (Locked)

| Principle | Implementation |
|---|---|
| **Barcode-first billing** | Every sale starts with barcode/QR scan |
| **Real-time inventory update** | Every sale writes to Inventory Ledger (per Ch 10 §10.5) |
| **Offline capable** | Mobile/tablet POS works offline, syncs on reconnect (per Ch 11 Q3) |
| **Multi-payment** | Cash, UPI, Card, Wallet, Gift Card, Store Credit, BNPL, Split |
| **Digital receipt** | Email/SMS/WhatsApp receipt; paper optional |
| **Loyalty integrated** | Points earned/redeemed at POS |
| **Promotion engine** | Centralized promotions pushed to POS |
| **Event-driven ERP sync** | Sale → Inventory → Ledger → Analytics → Finance (per Ch 3 §3.7) |
| **Complete audit trail** | Every price override, void, refund, manager approval audited |

---

## ⭐ Enterprise POS Integration Layer (Special Chapter)

### Architecture

Since Sudhamrit already operates a POS system, SUOP does **NOT** replace it. Instead, SUOP integrates via a **bidirectional Integration Layer** (built on the Integration Hub per Ch 13).

### Integration Tiers

#### Tier 1: Master Data Sync (SUOP → POS)

| Data | Direction | Frequency | Mechanism |
|---|---|---|---|
| Products | SUOP → POS | Real-time (event-driven) | REST API + Webhook |
| Prices | SUOP → POS | Real-time (event-driven) | REST API + Webhook |
| Promotions | SUOP → POS | Scheduled (5 min) | Batch API |
| Customers | Bidirectional | Real-time | REST API + Webhook |
| Stores/Employees | SUOP → POS | On-change | REST API |
| Tax Codes | SUOP → POS | On-change | REST API |
| Barcodes | SUOP → POS | Real-time (event-driven) | REST API + Webhook |

#### Tier 2: Transaction Sync (POS → SUOP)

| Data | Direction | Frequency | Mechanism |
|---|---|---|---|
| Sales Transactions | POS → SUOP | Real-time (webhook) | REST API webhook |
| Sales Line Items | POS → SUOP | Real-time (webhook) | Embedded in transaction |
| Payments | POS → SUOP | Real-time (webhook) | Embedded in transaction |
| Returns/Refunds | POS → SUOP | Real-time (webhook) | REST API webhook |
| Shift Open/Close | POS → SUOP | Event-driven | REST API webhook |
| Stock Movements | POS → SUOP | Real-time (webhook) | REST API webhook |

#### Tier 3: Event Sync (SUOP internal, triggered by POS transactions)

```
POS Sale Completed
  ↓ Webhook to SUOP
  ↓ SUOP processes:
  ├── Inventory Ledger entry (ISSUE movement type, per Ch 10 §10.5)
  ├── Stock Summary update (available_qty decremented)
  ├── Customer loyalty points updated
  ├── Promotion effectiveness tracked
  ├── Analytics domain updated (real-time KPI tiles)
  ├── Finance domain updated (revenue, tax)
  ├── Reorder Engine checks stock threshold
  ├── AI models consume transaction data
  └── Dashboard refreshed via WebSocket
```

### Integration Schema

#### POS Sync Log (Foundation entity — tracks every sync operation)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `sync_code` | VARCHAR(30) | Yes | — | Unique per company, `PSYNC-` | Sync code | Internal |
| `sync_type` | ENUM | Yes | — | MASTER_SYNC, TRANSACTION_SYNC, EVENT_SYNC | Sync tier (per Integration Layer) | Internal |
| `sync_direction` | ENUM | Yes | — | SUOP_TO_POS, POS_TO_SUOP, BIDIRECTIONAL | Direction | Internal |
| `data_type` | VARCHAR(30) | Yes | — | PRODUCT, PRICE, PROMOTION, CUSTOMER, SALE, RETURN, PAYMENT, SHIFT, STOCK_MOVEMENT | Data synced | Internal |
| `pos_system_code` | VARCHAR(30) | Yes | — | — | POS system identifier (e.g., "SUDHAMRIT_POS_V1") | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `payload` | JSONB | Yes | `'{}'` | — | Synced data payload | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, FAILED, RETRY | Sync status | Internal |
| `retry_count` | INTEGER | Yes | `0` | 0-5 | Retry attempts | Internal |
| `error_message` | TEXT | No | NULL | — | Error details (if failed) | Internal |
| `synced_at` | TIMESTAMPTZ | No | NULL | — | Completion timestamp | Internal |
| `next_retry_at` | TIMESTAMPTZ | No | NULL | — | Next retry (if failed) | Internal |
| `idempotency_key` | VARCHAR(100) | No | NULL | — | Dedup key (per Ch 13 §13.11) | Internal |

### Conflict Resolution Strategy

| Conflict Type | Resolution Rule |
|---|---|
| Price mismatch (POS vs SUOP) | SUOP price wins (POS is slave for pricing) |
| Promotion conflict | SUOP promotion wins (centralized management) |
| Customer profile conflict | Latest timestamp wins |
| Inventory variance | SUOP ledger is source of truth (per Ch 10 §10.5) |
| Duplicate transaction | Idempotency key deduplication (per Ch 13 §13.11) |
| Offline transaction replay | Last-Writer-Wins for stock; idempotent for transactions |

### POS Evolution Roadmap (Per Chief Architect Recommendation)

| Phase | Action |
|---|---|
| **Phase 1** | Evaluate existing POS codebase against this specification |
| **Phase 2** | Gap analysis: Current POS vs SUOP Enterprise POS spec |
| **Phase 3** | Integration Layer built (API adapters, sync engine, event publisher) |
| **Phase 4** | POS enhanced: offline sync, event publishing, loyalty, promotions |
| **Phase 5** | POS fully integrated with SUOP ERP, Warehouse, Finance, Inventory |

---

## Entity 181 — POS Terminal

### 1. Business Purpose
Represents every billing terminal. Per Part 9: Terminal Status — ACTIVE, OFFLINE, LOCKED, MAINTENANCE.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `terminal_code` | VARCHAR(30) | Yes | — | Unique per store | Terminal code (per Part 9) | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` (Entity 171) | Store | Internal |
| `device_name` | VARCHAR(100) | Yes | — | Min 3 | Display name (per Part 9) | Public |
| `terminal_type` | ENUM | Yes | `DESKTOP` | DESKTOP, TABLET, MOBILE, SELF_CHECKOUT, KIOSK | Terminal type | Internal |
| `cashier_user_id` | UUID | No | NULL | FK to `user_accounts` | Current cashier | Internal |
| `ip_address` | VARCHAR(45) | No | NULL | IPv4/IPv6 | IP (per Part 9) | Internal |
| `mac_address` | VARCHAR(20) | No | NULL | MAC format | MAC (per Part 9) | Internal |
| `pos_software_version` | VARCHAR(20) | No | NULL | — | POS software version | Internal |
| `pos_system_code` | VARCHAR(30) | Yes | `SUDHAMRIT_POS_V1` | — | POS system identifier | Internal |
| `is_offline_capable` | BOOLEAN | Yes | `true` | — | Can work offline (per Part 9) | Internal |
| `last_sync_at` | TIMESTAMPTZ | No | NULL | — | Last successful sync | Internal |
| `last_heartbeat_at` | TIMESTAMPTZ | No | NULL | — | Last heartbeat | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, OFFLINE, LOCKED, MAINTENANCE (per Part 9) | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 182 — Sales Transaction

### 1. Business Purpose
Represents completed customer sales. Per Part 9: *"Transaction Number immutable. No direct deletion."* This entity receives data from the POS via the Integration Layer.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `SAL-` | Transaction code | Internal |
| `transaction_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 9) — immutable | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store (per Part 9) | Internal |
| `pos_terminal_id` | UUID | Yes | — | FK to `pos_terminals` (Entity 181) | POS terminal (per Part 9) | Internal |
| `cashier_user_id` | UUID | Yes | — | FK to `user_accounts` | Cashier (per Part 9) | Internal |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` (Entity 185) | Customer (NULL = walk-in) | Confidential |
| `shift_id` | UUID | No | NULL | FK to `pos_shifts` (Entity 191) | Cashier shift | Internal |
| `transaction_date` | DATE | Yes | `CURRENT_DATE` | — | Transaction date (per Part 9) | Internal |
| `transaction_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Transaction timestamp | Internal |
| `subtotal` | DECIMAL(18,4) | Yes | — | ≥ 0 | Pre-discount subtotal (per Part 9) | Confidential |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total discount (per Part 9) | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total tax (per Part 9) | Confidential |
| `round_off` | DECIMAL(18,4) | Yes | `0` | — | Round off | Confidential |
| `grand_total` | DECIMAL(18,4) | Yes | — | ≥ 0 | Grand total (per Part 9) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal |
| `item_count` | INTEGER | Yes | `0` | ≥ 0 | Total items | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity | Internal |
| `payment_status` | ENUM | Yes | `PAID` | PAID, PARTIAL, UNPAID, REFUNDED | Payment status (per Part 9) | Internal |
| `pos_reference_number` | VARCHAR(50) | No | NULL | — | POS internal reference (for sync) | Internal |
| `sync_id` | UUID | No | NULL | — | POS sync correlation ID | Internal |
| `is_offline_transaction` | BOOLEAN | Yes | `false` | — | Created offline on POS | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries (ISSUE type) | Internal |
| `is_voided` | BOOLEAN | Yes | `false` | — | Voided flag | Confidential |
| `void_reason` | TEXT | No | NULL | Required if `is_voided = true` | Void reason | Internal |
| `voided_by` | UUID | No | NULL | FK to `user_accounts` | Who voided | Internal |
| `voided_at` | TIMESTAMPTZ | No | NULL | — | Void timestamp | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, HELD, COMPLETED, VOIDED, REFUNDED | Status (per Part 9) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `transaction_date` (high volume — thousands/day)
- **Validation**: `transaction_number` immutable; no direct deletion; `grand_total` = `subtotal - discount + tax + round_off`
- **Integration**: On receive from POS: write ISSUE entries to Inventory Ledger (per Ch 10 §10.5); update Stock Summary; publish `retail.sale.completed` event
- **API**: `/api/v1/sales-transactions` (GET, POST — from POS sync), `/:id/void` (POST), `/:id/refund` (POST)
- **AI**: Basket Analysis, Cross Sell, Up Sell, Fraud Detection, Demand Forecast

---

## Entity 183 — Sales Line Item

### 1. Business Purpose
Stores product lines per transaction. Per Part 9: Supports Barcode, QR Code, Weighted Products, Serial Tracking.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `transaction_id` | UUID | Yes | — | FK to `sales_transactions` (Entity 182) | Parent transaction | Internal |
| `line_number` | INTEGER | Yes | — | > 0, unique per transaction | Line number | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product sold | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch (FEFO) | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity sold | Internal |
| `unit_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit price (per Part 9) | Confidential |
| `mrp` | DECIMAL(18,4) | No | NULL | ≥ 0 | Maximum Retail Price | Public |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Line discount (per Part 9) | Confidential |
| `discount_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Discount % | Confidential |
| `tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes` | Tax code | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax amount | Confidential |
| `net_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Net line total (per Part 9) | Confidential |
| `promotion_id` | UUID | No | NULL | FK to `promotions` (Entity 187) | Applied promotion | Internal |
| `barcode_scanned` | VARCHAR(100) | No | NULL | — | Barcode that was scanned | Internal |
| `is_weighted` | BOOLEAN | Yes | `false` | — | Weighted product (per Part 9) | Internal |
| `weight_kg` | DECIMAL(12,4) | No | NULL | > 0 | Weight (if weighted) | Internal |
| `is_returned` | BOOLEAN | Yes | `false` | — | This line was returned | Internal |
| `returned_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Returned qty | Internal |
| `line_status` | ENUM | Yes | `ACTIVE` | ACTIVE, RETURNED, EXCHANGED, VOIDED | Status | Internal |

---

## Entity 184 — Payment Transaction

### 1. Business Purpose
Handles payments. Per Part 9: Cash, UPI, Credit Card, Debit Card, Wallet, Gift Card, Store Credit, Split Payment, Bank Transfer.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payment_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 9) | Internal |
| `transaction_id` | UUID | Yes | — | FK to `sales_transactions` (Entity 182) | Parent sale | Internal |
| `payment_method` | ENUM | Yes | — | CASH, UPI, CREDIT_CARD, DEBIT_CARD, WALLET, GIFT_CARD, STORE_CREDIT, BNPL, BANK_TRANSFER, SPLIT (per Part 9) | Method | Confidential |
| `amount` | DECIMAL(18,4) | Yes | — | > 0 | Payment amount (per Part 9) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `reference_number` | VARCHAR(100) | No | NULL | — | Payment reference (per Part 9) | Internal |
| `gateway_name` | VARCHAR(50) | No | NULL | — | Payment gateway (per Part 9) | Internal |
| `gateway_transaction_id` | VARCHAR(100) | No | NULL | — | Gateway transaction ID | Internal |
| `approval_code` | VARCHAR(50) | No | NULL | — | Approval code (per Part 9) | Confidential |
| `card_last_4` | VARCHAR(4) | No | NULL | — | Last 4 digits (card) | Confidential |
| `card_type` | ENUM | No | NULL | VISA, MASTERCARD, RUPAY, AMEX, OTHER | Card type | Internal |
| `upi_id` | VARCHAR(100) | No | NULL | — | UPI ID | Internal |
| `wallet_name` | VARCHAR(50) | No | NULL | — | Wallet (Paytm, PhonePe, etc.) | Internal |
| `gift_card_id` | UUID | No | NULL | FK to `gift_cards` (Entity 193) | Gift card used | Confidential |
| `is_split_payment` | BOOLEAN | Yes | `false` | — | Part of split payment | Internal |
| `split_sequence` | INTEGER | No | NULL | > 0 | Split sequence | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, FAILED, REFUNDED | Status (per Part 9) | Internal |

---

## Entity 185 — Customer Master (Retail)

### 1. Business Purpose
Retail customer profile. Per Part 9: Supports Walk-in, Registered, Corporate, Wholesale.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `customer_code` | VARCHAR(30) | Yes | — | Unique per company, `CUS-` | Customer code | Internal |
| `customer_name` | VARCHAR(200) | Yes | — | Min 2 | Name (per Part 9) | Public |
| `mobile_number` | VARCHAR(20) | No | NULL | E.164 | Mobile (per Part 9) | Confidential |
| `email` | VARCHAR(200) | No | NULL | Email format | Email (per Part 9) | Confidential |
| `birthday` | DATE | No | NULL | — | Birthday (per Part 9) | Internal |
| `anniversary` | DATE | No | NULL | — | Anniversary | Internal |
| `customer_type` | ENUM | Yes | `WALK_IN` | WALK_IN, REGISTERED, CORPORATE, WHOLESALE (per Part 9) | Type | Internal |
| `loyalty_level` | ENUM | No | NULL | SILVER, GOLD, PLATINUM, DIAMOND (per Part 9) | Loyalty tier | Internal |
| `wallet_balance` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Wallet balance (per Part 9) | Confidential |
| `reward_points` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Loyalty points (per Part 9) | Internal |
| `preferred_store_id` | UUID | No | NULL | FK to `stores` | Preferred store (per Part 9) | Internal |
| `total_purchases` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Lifetime purchases | Confidential |
| `total_visits` | INTEGER | Yes | `0` | ≥ 0 | Total visits | Internal |
| `last_visit_date` | DATE | No | NULL | — | Last visit | Internal |
| `address` | JSONB | No | NULL | — | Address | Internal |
| `gst_number` | VARCHAR(15) | No | NULL | GSTIN format | GST (for corporate) | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, BLOCKED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 186 — Loyalty Program

### 1. Business Purpose
Customer rewards. Per Part 9: Points Earned, Points Redeemed, Tier, Membership, Expiry, Bonus Rules. Levels: Silver, Gold, Platinum, Diamond.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `program_name` | VARCHAR(200) | Yes | — | Min 3 | Program name | Public |
| `tier` | ENUM | Yes | `SILVER` | SILVER, GOLD, PLATINUM, DIAMOND (per Part 9) | Tier | Public |
| `min_purchase_for_tier` | DECIMAL(18,4) | Yes | — | ≥ 0 | Min purchase to qualify | Confidential |
| `points_per_rupee` | DECIMAL(5,2) | Yes | `1.00` | > 0 | Earn rate (per Part 9) | Internal |
| `redemption_rate` | DECIMAL(5,2) | Yes | `0.10` | > 0 | Points-to-rupee conversion | Internal |
| `minimum_redemption_points` | INTEGER | Yes | `100` | > 0 | Min points to redeem | Internal |
| `points_expiry_months` | INTEGER | Yes | `12` | > 0 | Expiry (per Part 9) | Internal |
| `bonus_rules` | JSONB | No | `'{}'` | — | Bonus earning rules (per Part 9) | Internal |
| `birthday_bonus_points` | INTEGER | Yes | `0` | ≥ 0 | Birthday bonus | Internal |
| `anniversary_bonus_points` | INTEGER | Yes | `0` | ≥ 0 | Anniversary bonus | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 187 — Promotion Engine

### 1. Business Purpose
Enterprise promotion management. Per Part 9 types: Percentage, Flat, Buy X Get Y, Combo, Festival, Happy Hour, Coupon, Bundle, Category Discount. *"Version controlled. Priority-based evaluation."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `promotion_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `promotion_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 9) | Public |
| `promotion_type` | ENUM | Yes | — | PERCENTAGE, FLAT_DISCOUNT, BUY_X_GET_Y, COMBO, FESTIVAL_OFFER, HAPPY_HOUR, COUPON, BUNDLE, CATEGORY_DISCOUNT (per Part 9) | Type | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `store_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable stores (NULL = all) | Internal |
| `product_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable products | Internal |
| `category_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable categories | Internal |
| `discount_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Discount value (% or amount) | Confidential |
| `discount_type` | ENUM | Yes | `PERCENTAGE` | PERCENTAGE, FLAT_AMOUNT | Calculation type | Internal |
| `min_purchase_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Min purchase required | Internal |
| `max_discount_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Cap on discount | Confidential |
| `buy_quantity` | INTEGER | No | NULL | > 0 | Buy X (for Buy X Get Y) | Internal |
| `get_quantity` | INTEGER | No | NULL | > 0 | Get Y (for Buy X Get Y) | Internal |
| `start_date` | DATE | Yes | — | — | Start date | Internal |
| `end_date` | DATE | Yes | — | > start_date | End date | Internal |
| `happy_hour_start` | TIME | No | NULL | — | Happy hour start (per Part 9) | Internal |
| `happy_hour_end` | TIME | No | NULL | — | Happy hour end | Internal |
| `priority` | INTEGER | Yes | `100` | > 0 | Evaluation priority (lower = higher) (per Part 9) | Internal |
| `version_number` | INTEGER | Yes | `1` | ≥ 1 | Version (per Part 9: "Version controlled") | Internal |
| `is_stacked` | BOOLEAN | Yes | `false` | — | Can stack with other promotions | Internal |
| `usage_limit_total` | INTEGER | No | NULL | > 0 | Max total uses | Internal |
| `usage_limit_per_customer` | INTEGER | No | NULL | > 0 | Max uses per customer | Internal |
| `usage_count` | INTEGER | Yes | `0` | ≥ 0 | Current usage count | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, PAUSED, EXPIRED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 188 — Pricing Engine

### 1. Business Purpose
Determines selling price. Per Part 9: MRP, Store Price, Member Price, Wholesale Price, Time-based, Campaign Price. Priority: Campaign → Store → Member → Default.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `price_list_code` | VARCHAR(30) | Yes | — | Unique per company | Price list code | Internal |
| `price_list_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `price_type` | ENUM | Yes | — | MRP, STORE_PRICE, MEMBER_PRICE, WHOLESALE_PRICE, TIME_BASED, CAMPAIGN_PRICE (per Part 9) | Type | Confidential |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal |
| `store_id` | UUID | No | NULL | FK to `stores` | Store-specific (NULL = all) | Internal |
| `price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Selling price | Confidential |
| `mrp` | DECIMAL(18,4) | Yes | — | ≥ price | Maximum Retail Price | Public |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `priority` | INTEGER | Yes | `100` | > 0 | Evaluation priority (per Part 9: Campaign → Store → Member → Default) | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `time_based_start` | TIME | No | NULL | — | Time-based start (per Part 9) | Internal |
| `time_based_end` | TIME | No | NULL | — | Time-based end | Internal |
| `min_quantity` | DECIMAL(18,4) | No | NULL | > 0 | Min qty for price (wholesale) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 189 — Retail Return

### 1. Business Purpose
Product return. Per Part 9 reasons: Damaged, Wrong Item, Expired, Customer Dissatisfaction, Billing Error. Disposition: Refund, Exchange, Store Credit, Repair, Reject.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `return_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `original_transaction_id` | UUID | Yes | — | FK to `sales_transactions` (Entity 182) | Original sale | Internal |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` | Customer | Confidential |
| `store_id` | UUID | Yes | — | FK to `stores` | Return store | Internal |
| `return_date` | DATE | Yes | `CURRENT_DATE` | — | Return date | Internal |
| `return_reason` | ENUM | Yes | — | DAMAGED, WRONG_ITEM, EXPIRED, CUSTOMER_DISSATISFACTION, BILLING_ERROR (per Part 9) | Reason | Internal |
| `return_type` | ENUM | Yes | — | FULL_RETURN, PARTIAL_RETURN | Full or partial | Internal |
| `total_return_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Return amount | Confidential |
| `disposition` | ENUM | Yes | — | REFUND, EXCHANGE, STORE_CREDIT, REPAIR, REJECT (per Part 9) | Disposition | Internal |
| `refund_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Refund amount | Confidential |
| `refund_method` | ENUM | No | NULL | CASH, UPI, CARD, WALLET, STORE_CREDIT | Refund method | Confidential |
| `exchange_transaction_id` | UUID | No | NULL | FK to `sales_transactions` | Exchange sale | Internal |
| `credit_note_number` | VARCHAR(50) | No | NULL | — | Credit note | Confidential |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver (manager) | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries (RETURN type) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, APPROVED, COMPLETED, REJECTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 190 — Cash Drawer

### 1. Business Purpose
Tracks cash operations. Per Part 9: Opening Balance, Cash Sales, Refunds, Safe Drop, Closing Balance, Variance, Approval.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `drawer_number` | VARCHAR(30) | Yes | — | Unique per store+shift | Drawer ID | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `pos_terminal_id` | UUID | Yes | — | FK to `pos_terminals` | Terminal | Internal |
| `shift_id` | UUID | Yes | — | FK to `pos_shifts` (Entity 191) | Shift | Internal |
| `opening_balance` | DECIMAL(18,4) | Yes | — | ≥ 0 | Opening (per Part 9) | Confidential |
| `cash_sales` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash sales (per Part 9) | Confidential |
| `cash_refunds` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash refunds (per Part 9) | Confidential |
| `safe_drops` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Safe drops (per Part 9) | Confidential |
| `cash_added` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash added (float) | Confidential |
| `expected_closing` | DECIMAL(18,4) | Yes | — | Generated: `opening + sales - refunds - safe_drops + added` | Expected | Confidential |
| `actual_closing` | DECIMAL(18,4) | No | NULL | ≥ 0 | Counted closing (per Part 9) | Confidential |
| `variance` | DECIMAL(18,4) | No | NULL | Generated: `actual - expected` | Variance (per Part 9) | Confidential |
| `variance_approved_by` | UUID | No | NULL | FK to `user_accounts` | Variance approval (per Part 9) | Confidential |
| `status` | ENUM | Yes | `OPEN` | OPEN, CLOSED | Status | Internal |

---

## Entity 191 — POS Shift

### 1. Business Purpose
Controls cashier sessions. Per Part 9: Shift Number, Cashier, Opening Time, Closing Time, Opening Cash, Closing Cash, Difference, Approval.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `shift_number` | VARCHAR(50) | Yes | — | Unique per store+date | Display (per Part 9) | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `pos_terminal_id` | UUID | Yes | — | FK to `pos_terminals` | Terminal | Internal |
| `cashier_user_id` | UUID | Yes | — | FK to `user_accounts` | Cashier (per Part 9) | Internal |
| `shift_date` | DATE | Yes | `CURRENT_DATE` | — | Shift date | Internal |
| `opening_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Opening time (per Part 9) | Internal |
| `closing_time` | TIMESTAMPTZ | No | NULL | — | Closing time (per Part 9) | Internal |
| `opening_cash` | DECIMAL(18,4) | Yes | — | ≥ 0 | Opening cash (per Part 9) | Confidential |
| `closing_cash` | DECIMAL(18,4) | No | NULL | ≥ 0 | Closing cash (per Part 9) | Confidential |
| `cash_difference` | DECIMAL(18,4) | No | NULL | — | Difference (per Part 9) | Confidential |
| `total_sales` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Shift total sales | Confidential |
| `total_returns` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Shift total returns | Confidential |
| `transaction_count` | INTEGER | Yes | `0` | ≥ 0 | Transactions processed | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Closing approval | Internal |
| `status` | ENUM | Yes | `OPEN` | OPEN, CLOSED, SUSPENDED | Status | Internal |

---

## Entity 192 — Coupon Master

### 1. Business Purpose
Discount coupons. Per Part 9 types: Percentage, Fixed, Product Specific, Customer Specific, Store Specific.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `coupon_code` | VARCHAR(30) | Yes | — | Unique per company | Coupon code | Internal |
| `coupon_type` | ENUM | Yes | — | PERCENTAGE, FIXED, PRODUCT_SPECIFIC, CUSTOMER_SPECIFIC, STORE_SPECIFIC (per Part 9) | Type | Internal |
| `discount_value` | DECIMAL(18,4) | Yes | — | ≥ 0 | Discount value | Confidential |
| `min_purchase` | DECIMAL(18,4) | No | NULL | ≥ 0 | Min purchase required | Internal |
| `max_discount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Max discount cap | Confidential |
| `product_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable products | Internal |
| `store_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable stores | Internal |
| `customer_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable customers | Confidential |
| `valid_from` | DATE | Yes | — | — | Valid from | Internal |
| `valid_to` | DATE | Yes | — | > valid_from | Valid to | Internal |
| `usage_limit` | INTEGER | No | NULL | > 0 | Max uses | Internal |
| `usage_count` | INTEGER | Yes | `0` | ≥ 0 | Current uses | Internal |
| `is_single_use` | BOOLEAN | Yes | `false` | — | Single use per customer | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, EXPIRED | Status | Internal |

---

## Entity 193 — Gift Card

### 1. Business Purpose
Stored value cards. Per Part 9: Card Number, Balance, Expiry, Activation, Redemption, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `card_number` | VARCHAR(30) | Yes | — | Unique globally | Card number (per Part 9) | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `initial_balance` | DECIMAL(18,4) | Yes | — | > 0 | Initial value (per Part 9) | Confidential |
| `current_balance` | DECIMAL(18,4) | Yes | — | ≥ 0 | Current balance (per Part 9) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `issued_date` | DATE | Yes | `CURRENT_DATE` | — | Issue date | Internal |
| `expiry_date` | DATE | Yes | — | > issued_date | Expiry (per Part 9) | Internal |
| `activated_at` | TIMESTAMPTZ | No | NULL | — | Activation time (per Part 9) | Internal |
| `activated_by` | UUID | No | NULL | FK to `user_accounts` | Activator | Internal |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` | Linked customer | Confidential |
| `is_digital` | BOOLEAN | Yes | `false` | — | Digital gift card | Internal |
| `status` | ENUM | Yes | `INACTIVE` | INACTIVE, ACTIVE, REDEEMED, EXPIRED, BLOCKED | Status (per Part 9) | Internal |

---

## Entity 194 — Customer Wallet

### 1. Business Purpose
Store credits. Per Part 9: Refund, Cashback, Promotions, Loyalty.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers`, UNIQUE | Wallet owner | Confidential |
| `balance` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Current balance | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `total_credited` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Lifetime credits | Confidential |
| `total_debited` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Lifetime debits | Confidential |
| `last_transaction_at` | TIMESTAMPTZ | No | NULL | — | Last wallet transaction | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, FROZEN, CLOSED | Status | Internal |

---

## Entity 195 — POS Device

### 1. Business Purpose
Connected hardware. Per Part 9: Barcode Scanner, Receipt Printer, Label Printer, Cash Drawer, Customer Display, Weighing Scale, Card Machine, QR Scanner.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `device_code` | VARCHAR(30) | Yes | — | Unique per store | Device code | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `pos_terminal_id` | UUID | Yes | — | FK to `pos_terminals` | Connected terminal | Internal |
| `device_type` | ENUM | Yes | — | BARCODE_SCANNER, RECEIPT_PRINTER, LABEL_PRINTER, CASH_DRAWER, CUSTOMER_DISPLAY, WEIGHING_SCALE, CARD_MACHINE, QR_SCANNER (per Part 9) | Type | Internal |
| `device_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Public |
| `manufacturer` | VARCHAR(100) | No | NULL | — | Make | Internal |
| `model` | VARCHAR(100) | No | NULL | — | Model | Internal |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Internal |
| `connection_type` | ENUM | Yes | `USB` | USB, BLUETOOTH, WIFI, ETHERNET, SERIAL | Connection | Internal |
| `ip_address` | VARCHAR(45) | No | NULL | — | IP (if networked) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, OFFLINE, ERROR, MAINTENANCE | Status | Internal |

---

## Entity 196 — Omnichannel Order

### 1. Business Purpose
Unified order management. Per Part 9 sources: POS, Website, Mobile App, Marketplace, WhatsApp, Phone Order.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `order_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `order_source` | ENUM | Yes | — | POS, WEBSITE, MOBILE_APP, MARKETPLACE, WHATSAPP, PHONE_ORDER (per Part 9) | Source | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Fulfilling store | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `order_date` | TIMESTAMPTZ | Yes | `NOW()` | — | Order date | Internal |
| `subtotal` | DECIMAL(18,4) | Yes | — | ≥ 0 | Subtotal | Confidential |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Discount | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax | Confidential |
| `grand_total` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `fulfillment_type` | ENUM | Yes | `PICKUP` | PICKUP, HOME_DELIVERY, STORE_SHIPMENT | Fulfillment | Internal |
| `pickup_id` | UUID | No | NULL | FK to `store_pickups` (Entity 197) | Pickup details | Internal |
| `delivery_id` | UUID | No | NULL | FK to `home_deliveries` (Entity 198) | Delivery details | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, PAID, PARTIAL, REFUNDED | Payment | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 197 — Store Pickup

### 1. Business Purpose
Per Part 9: Click & Collect, Pickup Verification, Pickup OTP, Customer Signature.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `order_id` | UUID | Yes | — | FK to `omnichannel_orders` | Parent order | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Pickup store | Internal |
| `pickup_code` | VARCHAR(20) | Yes | — | Unique | Pickup code | Internal |
| `otp_code` | VARCHAR(6) | Yes | — | — | Pickup OTP (per Part 9) | Confidential |
| `otp_expiry` | TIMESTAMPTZ | Yes | — | — | OTP expiry | Internal |
| `requested_pickup_time` | TIMESTAMPTZ | Yes | — | — | Requested slot | Internal |
| `actual_pickup_time` | TIMESTAMPTZ | No | NULL | — | Actual pickup | Internal |
| `customer_signature_file_id` | UUID | No | NULL | FK to `file_attachments` | Signature (per Part 9) | Confidential |
| `picked_up_by` | UUID | No | NULL | FK to `user_accounts` | Store staff | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, READY, COMPLETED, EXPIRED, CANCELLED | Status | Internal |

---

## Entity 198 — Home Delivery

### 1. Business Purpose
Per Part 9: Delivery Address, Delivery Slot, Driver, Tracking, Delivery Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `order_id` | UUID | Yes | — | FK to `omnichannel_orders` | Parent order | Internal |
| `delivery_address` | JSONB | Yes | `'{}'` | — | Delivery address (per Part 9) | Confidential |
| `delivery_slot_start` | TIMESTAMPTZ | Yes | — | — | Slot start (per Part 9) | Internal |
| `delivery_slot_end` | TIMESTAMPTZ | Yes | — | > slot_start | Slot end | Internal |
| `driver_user_id` | UUID | No | NULL | FK to `user_accounts` | Driver (per Part 9) | Internal |
| `vehicle_number` | VARCHAR(20) | No | NULL | — | Vehicle | Internal |
| `tracking_url` | VARCHAR(500) | No | NULL | — | Live tracking (per Part 9) | Public |
| `delivery_charge` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Delivery charge | Confidential |
| `dispatched_at` | TIMESTAMPTZ | No | NULL | — | Dispatch time | Internal |
| `delivered_at` | TIMESTAMPTZ | No | NULL | — | Delivery time | Internal |
| `delivery_otp` | VARCHAR(6) | Yes | — | — | Delivery OTP | Confidential |
| `customer_signature_file_id` | UUID | No | NULL | FK to `file_attachments` | Proof of delivery | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, SCHEDULED, DISPATCHED, IN_TRANSIT, DELIVERED, FAILED, RETURNED | Status | Internal |

---

## Entity 199 — POS Audit

### 1. Business Purpose
Tracks sensitive POS operations. Per Part 9: Price Override, Discount Override, Refund, Void, Manager Approval, Cash Variance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(30) | Yes | — | Unique per company | Audit code | Confidential |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `pos_terminal_id` | UUID | Yes | — | FK to `pos_terminals` | Terminal | Internal |
| `audit_type` | ENUM | Yes | — | PRICE_OVERRIDE, DISCOUNT_OVERRIDE, REFUND, VOID, MANAGER_APPROVAL, CASH_VARIANCE (per Part 9) | Type | Confidential |
| `entity_type` | VARCHAR(30) | No | NULL | — | Affected entity (TRANSACTION, LINE_ITEM, SHIFT) | Internal |
| `entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `original_value` | DECIMAL(18,4) | No | NULL | — | Original value | Confidential |
| `new_value` | DECIMAL(18,4) | No | NULL | — | New value | Confidential |
| `reason` | TEXT | Yes | — | Min 10 chars | Reason | Internal |
| `performed_by` | UUID | Yes | — | FK to `user_accounts` | Operator | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Manager (per Part 9) | Confidential |
| `performed_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Timestamp | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, REJECTED | Status | Internal |

---

## Entity 200 — Retail Transaction Dashboard

### 1. Business Purpose
Per Part 9: Sales Today, Average Basket, Transactions, Returns, Cash, Card, UPI, Loyalty Usage, Promotion Usage, Top Products.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `sales_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Sales (per Part 9) | Confidential |
| `transaction_count` | INTEGER | Yes | `0` | ≥ 0 | Transactions (per Part 9) | Internal |
| `avg_basket_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Avg basket (per Part 9) | Confidential |
| `returns_today` | INTEGER | Yes | `0` | ≥ 0 | Returns (per Part 9) | Internal |
| `cash_sales` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash (per Part 9) | Confidential |
| `card_sales` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Card (per Part 9) | Confidential |
| `upi_sales` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | UPI (per Part 9) | Confidential |
| `loyalty_usage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Loyalty usage (per Part 9) | Internal |
| `promotion_usage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Promo usage (per Part 9) | Internal |
| `top_products` | JSONB | No | NULL | — | Top 10 products: `[{ product_id, qty, value }]` (per Part 9) | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI retail insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 9 Section 2 Completion Summary

**All 20 Enterprise POS entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **Enterprise POS architecture** — Platform + Integration Layer (not from scratch)
2. **POS Integration Layer** — Bidirectional sync (Master, Transaction, Event tiers)
3. **Multi-payment support** — Cash, UPI, Card, Wallet, Gift Card, Store Credit, BNPL, Split
4. **Offline-first synchronization** — POS works offline; syncs on reconnect
5. **Event-driven ERP integration** — Sale → Inventory → Ledger → Analytics → Finance
6. **Loyalty engine** — Silver/Gold/Platinum/Diamond tiers, points, wallet
7. **Promotion engine** — 9 promotion types, version-controlled, priority-based
8. **Pricing engine** — Campaign → Store → Member → Default priority
9. **Omnichannel ready** — POS, Web, Mobile, Marketplace, WhatsApp, Phone
10. **Device abstraction** — Barcode scanner, printer, scale, card machine, ESL
11. **AI-ready retail platform** — Cross sell, Up sell, Basket Analysis, Fraud Detection
12. **POS Audit trail** — Every override, void, refund, variance permanently audited
13. **Cash management** — Drawer, shift, safe drop, variance, approval
14. **Returns & Refunds** — Full/partial, 5 reasons, 5 dispositions, credit notes
15. **Existing POS preserved** — Treated as v1, evolved through structured enhancement
