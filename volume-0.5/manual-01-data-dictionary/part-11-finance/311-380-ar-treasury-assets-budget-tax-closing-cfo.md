# Manual 1 · Part 11 · Sections 4-10 · Entities 311-380 — AR, Treasury, Assets, Budget, Tax, Closing & CFO Intelligence

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 11 — Enterprise Finance & Accounting |
| Sections | 4 (AR), 5 (Treasury), 6 (Fixed Assets), 7 (Budgeting), 8 (Tax), 9 (Closing), 10 (CFO Intelligence) |
| Entities | 311–380 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 3 §3.4, Ch 10 §10.6, Part 11 §4-10 |
| Last Updated | 2026-07-07 |

---

## Overview — Complete Finance Architecture

Sections 4-10 complete the Enterprise Finance module with Order-to-Cash (AR), Treasury/Banking, Fixed Assets, Budgeting/Cost Centers, Tax Engine (GST/TDS/e-Invoice), Financial Closing/Consolidation, and CFO Mission Control with AI.

### Integrated Enhancements (Per Chief Architect)
1. **Financial Integration Hub** — Standard event contracts, idempotent processing, retry queues, event replay between operational modules and Finance
2. **Financial Rules Engine** — Centrally manages Posting Rules, Budget Control, Tax Rules, Approval Rules, Compliance Rules — all configuration-driven, not hardcoded
3. **Three-Layer Architecture** — Journal Lines → GL → Financial Cube (pre-aggregated for CFO dashboards)
4. **CFO Copilot** — Natural language queries ("Why did gross margin fall?", "Predict next month's cash position")

---

# SECTION 4: Accounts Receivable (AR), Customer Invoicing & Collections (Entities 311-320)

## Entity 311 — Customer Ledger
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers`, UNIQUE | Customer | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `gl_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | AR control account | Confidential |
| `opening_balance` | DECIMAL(18,4) | Yes | `0` | — | Opening | Confidential |
| `total_debit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Invoices | Confidential |
| `total_credit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Receipts | Confidential |
| `closing_balance` | DECIMAL(18,4) | Yes | `0` | Generated | Outstanding | Confidential |
| `credit_limit` | DECIMAL(18,4) | No | NULL | ≥ 0 | Approved limit | Confidential |
| `available_credit` | DECIMAL(18,4) | No | — | Generated: `credit_limit - closing` | Available | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, FROZEN, CLOSED | Status | Internal |

## Entity 312 — Customer Invoice
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `invoice_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `invoice_type` | ENUM | Yes | `TAX_INVOICE` | TAX_INVOICE, PROFORMA, EXPORT, DEBIT, SUBSCRIPTION (per Part 11) | Type | Internal |
| `invoice_date` | DATE | Yes | — | — | Date | Internal |
| `due_date` | DATE | Yes | — | > invoice_date | Due | Internal |
| `subtotal` | DECIMAL(18,4) | Yes | — | ≥ 0 | Pre-tax | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax | Confidential |
| `total_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total | Confidential |
| `paid_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Paid | Confidential |
| `balance_amount` | DECIMAL(18,4) | No | — | Generated: `total - paid` | Outstanding | Confidential |
| `source_order_id` | UUID | No | NULL | — | Source sales order | Internal |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `invoice_status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, POSTED, PAID, PARTIALLY_PAID, CANCELLED (per Part 11) | Status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |

## Entity 313 — Customer Receipt
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `receipt_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `receipt_amount` | DECIMAL(18,4) | Yes | — | > 0 | Amount | Confidential |
| `payment_method` | ENUM | Yes | — | CASH, UPI, CARD, BANK_TRANSFER, CHEQUE, WALLET (per Part 11) | Method | Confidential |
| `receipt_date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `invoice_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Invoices settled | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, BOUNCED, CANCELLED | Status | Internal |

## Entity 314 — Customer Credit Note
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `credit_note_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `original_invoice_id` | UUID | No | NULL | FK to `customer_invoices` | Original invoice | Confidential |
| `credit_reason` | ENUM | Yes | — | SALES_RETURN, PRICING_ERROR, DISCOUNT_ADJUSTMENT, DAMAGE, GOODWILL (per Part 11) | Reason | Internal |
| `credit_amount` | DECIMAL(18,4) | Yes | — | > 0 | Amount | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, ADJUSTED, PAID, CANCELLED | Status | Internal |

## Entity 315 — Customer Debit Note
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `debit_note_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `debit_reason` | ENUM | Yes | — | SHORT_PAYMENT, INTEREST, PENALTY, PRICE_REVISION (per Part 11) | Reason | Internal |
| `debit_amount` | DECIMAL(18,4) | Yes | — | > 0 | Amount | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, ADJUSTED, CANCELLED | Status | Internal |

## Entity 316 — Customer Credit Limit
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers`, UNIQUE | Customer | Confidential |
| `approved_limit` | DECIMAL(18,4) | Yes | — | ≥ 0 | Approved (per Part 11: "Approved Limit") | Confidential |
| `utilized_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utilized (per Part 11: "Utilized") | Confidential |
| `available_limit` | DECIMAL(18,4) | No | — | Generated: `approved - utilized` | Available (per Part 11: "Available") | Confidential |
| `is_blocked` | BOOLEAN | Yes | `false` | — | Blocked (per Part 11: "Blocked") | Confidential |
| `ai_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | Risk score (per Part 11: "Risk Score") | Confidential |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Approver | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, FROZEN | Status | Internal |

## Entity 317 — Collections
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `invoice_id` | UUID | Yes | — | FK to `customer_invoices` | Overdue invoice | Confidential |
| `due_date` | DATE | Yes | — | — | Due (per Part 11: "Due Date") | Internal |
| `overdue_days` | INTEGER | No | NULL | ≥ 0 | Days overdue | Internal |
| `collection_agent_id` | UUID | No | NULL | FK to `user_accounts` | Agent (per Part 11: "Collection Agent") | Internal |
| `promise_to_pay_date` | DATE | No | NULL | — | PTP (per Part 11: "Promise To Pay") | Internal |
| `recovery_status` | ENUM | Yes | `PENDING` | PENDING, CONTACTED, PTP_MADE, PARTIALLY_RECOVERED, FULLY_RECOVERED, WRITTEN_OFF (per Part 11: "Recovery Status") | Status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |

## Entity 318 — Customer Aging
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `current_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Current (per Part 11: "Current") | Confidential |
| `bucket_30` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 1-30 days | Confidential |
| `bucket_60` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 31-60 days | Confidential |
| `bucket_90` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 61-90 days | Confidential |
| `bucket_180_plus` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | 180+ days | Confidential |
| `total_outstanding` | DECIMAL(18,4) | Yes | `0` | Generated | Total | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

## Entity 319 — Revenue Recognition
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `source_entity_type` | VARCHAR(30) | Yes | — | — | Source (SALES_ORDER, INVOICE, SUBSCRIPTION) | Internal |
| `source_entity_id` | UUID | Yes | — | — | Source ID | Internal |
| `recognition_method` | ENUM | Yes | `IMMEDIATE` | IMMEDIATE, DEFERRED, MILESTONE, SUBSCRIPTION (per Part 11) | Method | Confidential |
| `total_revenue` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total | Confidential |
| `recognized_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Already recognized | Confidential |
| `deferred_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Deferred | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

## Entity 320 — AR Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_outstanding` | DECIMAL(18,4) | Yes | `0` | — | Outstanding (per Part 11: "Outstanding") | Confidential |
| `total_overdue` | DECIMAL(18,4) | Yes | `0` | — | Overdue (per Part 11: "Overdue") | Confidential |
| `collections_today` | DECIMAL(18,4) | Yes | `0` | — | Today's collections (per Part 11) | Confidential |
| `customer_aging_summary` | JSONB | Yes | `'{}'` | — | Aging buckets (per Part 11: "Customer Aging") | Confidential |
| `blocked_customers_count` | INTEGER | Yes | `0` | ≥ 0 | Blocked (per Part 11: "Blocked Customers") | Internal |
| `top_debtors` | JSONB | No | `'[]'` | — | Top 10 debtors (per Part 11: "Top Debtors") | Confidential |
| `collection_efficiency_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Efficiency (per Part 11) | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI AR insights (per Part 11 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 5: Banking, Treasury & Cash Management (Entities 321-330)

## Entity 321 — Bank Master
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `bank_code` | VARCHAR(20) | Yes | — | Unique | Bank code | Internal |
| `bank_name` | VARCHAR(200) | Yes | — | Min 3 | Name (per Part 11: "Bank") | Public |
| `branch_name` | VARCHAR(200) | No | NULL | — | Branch (per Part 11: "Branch") | Internal |
| `ifsc_code` | VARCHAR(11) | No | NULL | IFSC format | IFSC (per Part 11: "IFSC") | Internal |
| `swift_code` | VARCHAR(20) | No | NULL | — | SWIFT (for international) | Internal |
| `country` | CHAR(2) | Yes | `IN` | ISO 3166-1 | Country | Public |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 322 — Bank Account
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `bank_id` | UUID | Yes | — | FK to `bank_masters` | Bank | Internal |
| `account_number` | VARCHAR(30) | Yes | — | — | Account number (per Part 11: "Account Number") | **Restricted** |
| `account_type` | ENUM | Yes | `CURRENT` | CURRENT, SAVINGS, OD, CC, ESCROW, FOREIGN_CURRENCY (per Part 11) | Type | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency (per Part 11: "Currency") | Internal |
| `current_balance` | DECIMAL(18,4) | Yes | `0` | — | Real-time balance | Confidential |
| `is_active` | BOOLEAN | Yes | `true` | — | Active (per Part 11: "Status") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, CLOSED | Status | Internal |

## Entity 323 — Bank Transaction
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `bank_account_id` | UUID | Yes | — | FK to `bank_accounts` | Account | Confidential |
| `transaction_type` | ENUM | Yes | — | RECEIPT, PAYMENT, TRANSFER, INTEREST, CHARGES (per Part 11) | Type | Confidential |
| `amount` | DECIMAL(18,4) | Yes | — | ≠ 0 | Amount | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `transaction_date` | DATE | Yes | — | — | Date | Internal |
| `reference_number` | VARCHAR(100) | No | NULL | — | Bank reference | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `reconciliation_status` | ENUM | Yes | `PENDING` | PENDING, MATCHED, UNMATCHED (per Part 11: "Reconciliation") | Status | Internal |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Posted journal | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

## Entity 324 — Bank Reconciliation
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `reconciliation_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `bank_account_id` | UUID | Yes | — | FK to `bank_accounts` | Account | Confidential |
| `reconciliation_date` | DATE | Yes | — | — | Date | Internal |
| `bank_statement_balance` | DECIMAL(18,4) | Yes | — | — | Bank balance (per Part 11: "Bank Statement") | Confidential |
| `erp_balance` | DECIMAL(18,4) | Yes | — | — | ERP balance (per Part 11: "ERP") | Confidential |
| `difference` | DECIMAL(18,4) | Yes | — | Generated: `bank - erp` | Difference (per Part 11: "Difference") | Confidential |
| `matched_count` | INTEGER | Yes | `0` | ≥ 0 | Matched transactions | Internal |
| `unmatched_count` | INTEGER | Yes | `0` | ≥ 0 | Unmatched | Internal |
| `adjustment_journal_id` | UUID | No | NULL | FK to `journal_entries` | Adjustment (per Part 11: "Adjustment") | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED | Status | Internal |

## Entity 325 — Cash Ledger
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Location (store/restaurant/plant) | Internal |
| `cash_type` | ENUM | Yes | — | CASH_DRAWER, PETTY_CASH, SAFE (per Part 11: "Cash Drawer", "Safe", "Petty Cash") | Type | Confidential |
| `opening_balance` | DECIMAL(18,4) | Yes | `0` | — | Opening | Confidential |
| `cash_in` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash in (per Part 11: "Cash In") | Confidential |
| `cash_out` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash out (per Part 11: "Cash Out") | Confidential |
| `closing_balance` | DECIMAL(18,4) | Yes | `0` | Generated | Closing | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |

## Entity 326 — Treasury Forecast
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal | |
| `forecast_date` | DATE | Yes | — | — | Forecast date | Internal | |
| `forecast_horizon` | ENUM | Yes | `WEEKLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY | Horizon | Internal | |
| `projected_inflows` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Expected receipts (per Part 11: "Cash Flow") | Confidential | Cash Flow AI |
| `projected_outflows` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Expected payments | Confidential | |
| `net_cash_flow` | DECIMAL(18,4) | No | — | Generated: `inflows - outflows` | Net | Confidential | |
| `projected_closing_balance` | DECIMAL(18,4) | Yes | — | — | Projected closing | Confidential | |
| `liquidity_status` | ENUM | Yes | `NORMAL` | SURPLUS, NORMAL, TIGHT, DEFICIT (per Part 11: "Liquidity") | Status | Confidential | |
| `ai_confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI confidence | Internal | Cash Flow AI |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal | |

## Entity 327 — Investment Register
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `investment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `investment_type` | ENUM | Yes | — | FD, MUTUAL_FUND, GOVT_SECURITIES, CORPORATE_BONDS (per Part 11) | Type | Confidential |
| `principal_amount` | DECIMAL(18,4) | Yes | — | > 0 | Principal | Confidential |
| `interest_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | Rate | Confidential |
| `maturity_date` | DATE | Yes | — | — | Maturity | Internal |
| `current_value` | DECIMAL(18,4) | Yes | — | ≥ 0 | Current market value | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, MATURED, LIQUIDATED | Status | Internal |

## Entity 328 — Loan Register
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `loan_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `loan_type` | ENUM | Yes | — | TERM_LOAN, WORKING_CAPITAL, EQUIPMENT, MORTGAGE | Type | Confidential |
| `principal_amount` | DECIMAL(18,4) | Yes | — | > 0 | Principal (per Part 11: "Principal") | Confidential |
| `interest_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | Rate (per Part 11: "Interest") | Confidential |
| `emi_amount` | DECIMAL(18,4) | Yes | — | > 0 | EMI (per Part 11: "EMI") | Confidential |
| `outstanding_balance` | DECIMAL(18,4) | Yes | — | ≥ 0 | Outstanding (per Part 11: "Outstanding") | Confidential |
| `next_due_date` | DATE | Yes | — | — | Next due (per Part 11: "Due Date") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED, DEFAULTED | Status | Internal |

## Entity 329 — Foreign Currency
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `currency_code` | CHAR(3) | Yes | — | ISO 4217 | Currency | Internal |
| `rate_date` | DATE | Yes | — | — | Rate date | Internal |
| `exchange_rate` | DECIMAL(12,6) | Yes | — | > 0 | Rate (per Part 11: "Exchange Rates") | Confidential |
| `is_base_currency` | BOOLEAN | Yes | `false` | — | Is base | Internal |
| `gain_loss_amount` | DECIMAL(18,4) | No | NULL | — | Revaluation gain/loss (per Part 11: "Gain/Loss", "Revaluation") | Confidential |
| `revaluation_journal_id` | UUID | No | NULL | FK to `journal_entries` | Forex adjustment (per Part 11: "Forex Adjustment") | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

## Entity 330 — Treasury Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_cash_position` | DECIMAL(18,4) | Yes | `0` | — | Cash (per Part 11: "Cash Position") | Confidential |
| `total_bank_balance` | DECIMAL(18,4) | Yes | `0` | — | Bank (per Part 11: "Bank Balance") | Confidential |
| `total_loans_outstanding` | DECIMAL(18,4) | Yes | `0` | — | Loans (per Part 11: "Loans") | Confidential |
| `total_investments_value` | DECIMAL(18,4) | Yes | `0` | — | Investments (per Part 11: "Investments") | Confidential |
| `liquidity_ratio` | DECIMAL(5,2) | Yes | `0` | — | Liquidity (per Part 11: "Liquidity") | Confidential |
| `forecasted_cash_30d` | DECIMAL(18,4) | Yes | `0` | — | 30-day forecast (per Part 11: "Forecast") | Confidential |
| `outstanding_payments_7d` | DECIMAL(18,4) | Yes | `0` | — | Payments due (per Part 11: "Outstanding Payments") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI treasury insights (per Part 11 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 6: Fixed Assets, Asset Accounting & Depreciation (Entities 331-340)

## Entity 331 — Asset Master
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_code` | VARCHAR(30) | Yes | — | Unique per company, immutable | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `asset_name` | VARCHAR(200) | Yes | — | Min 3 | Name | Public |
| `asset_type` | ENUM | Yes | — | LAND, BUILDING, MACHINE, VEHICLE, COMPUTER, FURNITURE, TOOLS, LICENSE (per Part 11) | Type | Internal |
| `category_id` | UUID | Yes | — | FK to `asset_categories` (Entity 332) | Category | Internal |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Internal |
| `location_id` | UUID | No | NULL | FK to `facilities` | Physical location | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department | Internal |
| `responsible_employee_id` | UUID | No | NULL | FK to `employees` | Responsible | Internal |
| `purchase_date` | DATE | Yes | — | — | Purchase date | Internal |
| `purchase_cost` | DECIMAL(18,4) | Yes | — | > 0 | Cost | Confidential |
| `current_value` | DECIMAL(18,4) | Yes | — | — | Current book value | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DISPOSED, LOST | Status | Internal |

## Entity 332 — Asset Category
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 11: "Manufacturing", "Warehouse", etc.) | Public |
| `default_useful_life_years` | INTEGER | Yes | — | > 0 | Default useful life | Internal |
| `default_depreciation_method` | ENUM | Yes | `STRAIGHT_LINE` | STRAIGHT_LINE, WDV, UNITS_OF_PRODUCTION, CUSTOM | Default method | Confidential |
| `gl_asset_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | Asset GL | Confidential |
| `gl_depreciation_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | Accumulated dep. GL | Confidential |
| `gl_expense_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | Dep. expense GL | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 333 — Asset Capitalization
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_masters` | Asset | Internal |
| `capitalization_date` | DATE | Yes | — | — | Date capitalized | Internal |
| `purchase_cost` | DECIMAL(18,4) | Yes | — | > 0 | Purchase (per Part 11: "Purchase") | Confidential |
| `installation_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Installation (per Part 11: "Installation") | Confidential |
| `commissioning_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Commissioning (per Part 11: "Commissioning") | Confidential |
| `total_capitalized_cost` | DECIMAL(18,4) | Yes | — | Generated: SUM of all costs | Total | Confidential |
| `useful_life_years` | INTEGER | Yes | — | > 0 | Useful life (per Part 11: "Useful Life") | Internal |
| `salvage_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Salvage | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Capitalization journal | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

## Entity 334 — Depreciation Schedule
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_masters` | Asset | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `depreciation_method` | ENUM | Yes | — | STRAIGHT_LINE, WDV, UNITS_OF_PRODUCTION, CUSTOM (per Part 11: "Methods") | Method | Confidential |
| `opening_book_value` | DECIMAL(18,4) | Yes | — | — | Opening | Confidential |
| `depreciation_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Depreciation for period | Confidential |
| `closing_book_value` | DECIMAL(18,4) | Yes | — | Generated: `opening - depreciation` | Closing | Confidential |
| `accumulated_depreciation` | DECIMAL(18,4) | Yes | — | — | Total accumulated | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

## Entity 335 — Depreciation Journal
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `journal_entry_id` | UUID | Yes | — | FK to `journal_entries` | Posted journal (per Part 11: "Automatically generated") | Confidential |
| `depreciation_schedule_id` | UUID | Yes | — | FK to `depreciation_schedules` | Schedule | Internal |
| `expense_amount` | DECIMAL(18,4) | Yes | — | > 0 | Expense (per Part 11: "Expense") | Confidential |
| `accumulated_dep_amount` | DECIMAL(18,4) | Yes | — | > 0 | Accumulated dep. (per Part 11: "Accumulated Depreciation") | Confidential |
| `posted_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Posting time | Internal |
| `status` | ENUM | Yes | `POSTED` | PENDING, POSTED, REVERSED | Status | Internal |

## Entity 336 — Asset Transfer
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_masters` | Asset | Internal |
| `transfer_type` | ENUM | Yes | — | LOCATION, DEPARTMENT, COMPANY, EMPLOYEE (per Part 11) | Type | Internal |
| `from_entity_id` | UUID | Yes | — | — | From | Internal |
| `to_entity_id` | UUID | Yes | — | — | To | Internal |
| `transfer_date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Approver | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Intercompany journal (if cross-company) | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, CANCELLED | Status | Internal |

## Entity 337 — Asset Disposal
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_masters` | Asset | Internal |
| `disposal_reason` | ENUM | Yes | — | SOLD, SCRAPPED, LOST, DESTROYED, DONATED (per Part 11: "Reasons") | Reason | Internal |
| `disposal_date` | DATE | Yes | — | — | Date | Internal |
| `book_value_at_disposal` | DECIMAL(18,4) | Yes | — | — | Book value | Confidential |
| `sale_proceeds` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Sale amount | Confidential |
| `gain_loss_amount` | DECIMAL(18,4) | Yes | — | Generated: `proceeds - book_value` | Gain/Loss | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Disposal journal | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

## Entity 338 — Asset Revaluation
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_masters` | Asset | Internal |
| `revaluation_type` | ENUM | Yes | — | INCREASE, DECREASE (per Part 11) | Type | Confidential |
| `old_value` | DECIMAL(18,4) | Yes | — | — | Old book value | Confidential |
| `new_value` | DECIMAL(18,4) | Yes | — | ≥ 0 | New fair value (per Part 11: "Fair Value") | Confidential |
| `revaluation_amount` | DECIMAL(18,4) | Yes | — | Generated: `new - old` | Difference | Confidential |
| `revaluation_date` | DATE | Yes | — | — | Date | Internal |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Approver | Confidential |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` | Revaluation journal | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

## Entity 339 — Asset Audit
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `audit_date` | DATE | Yes | — | — | Date | Internal |
| `audited_by` | UUID | Yes | — | FK to `user_accounts` | Auditor | Internal |
| `asset_verified` | BOOLEAN | Yes | `false` | — | Physically verified (per Part 11: "Verification") | Internal |
| `asset_condition` | ENUM | Yes | `GOOD` | EXCELLENT, GOOD, FAIR, POOR, DAMAGED | Condition (per Part 11: "Condition") | Internal |
| `location_confirmed` | BOOLEAN | Yes | `false` | — | Location matches (per Part 11: "Location") | Internal |
| `responsible_confirmed` | BOOLEAN | Yes | `false` | — | Responsible matches (per Part 11: "Responsible Employee") | Internal |
| `findings` | TEXT | No | NULL | — | Audit findings | Internal |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Evidence photos | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal |

## Entity 340 — Asset Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_assets_count` | INTEGER | Yes | `0` | ≥ 0 | Assets (per Part 11: "Assets") | Internal |
| `total_asset_value` | DECIMAL(18,4) | Yes | `0` | — | Asset value (per Part 11: "Asset Value") | Confidential |
| `depreciation_ytd` | DECIMAL(18,4) | Yes | `0` | — | Depreciation (per Part 11: "Depreciation") | Confidential |
| `maintenance_due_count` | INTEGER | Yes | `0` | ≥ 0 | Maintenance due (per Part 11: "Maintenance Due") | Internal |
| `asset_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Health (per Part 11: "Asset Health") | Internal |
| `utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization (per Part 11: "Utilization") | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI asset insights (per Part 11 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 7: Enterprise Budgeting, Cost Centers & Profit Centers (Entities 341-350)

## Entity 341 — Budget Master
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `budget_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `budget_name` | VARCHAR(200) | Yes | — | Min 3 | Name (per Part 11: "Budget Name") | Public |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY (per Part 11: "Financial Year") | Internal |
| `budget_type` | ENUM | Yes | `OPERATING` | OPERATING, CAPEX, OPEX, PROJECT, CASH | Type | Internal |
| `active_version_id` | UUID | No | NULL | FK to `budget_versions` | Active version | Internal |
| `total_budget_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED (per Part 11: "Approval Status") | Status | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, CLOSED | Status (per Part 11: "Status") | Internal |

## Entity 342 — Budget Version
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `budget_id` | UUID | Yes | — | FK to `budget_masters` | Parent budget | Internal |
| `version_number` | INTEGER | Yes | — | > 0, unique per budget | Version (per Part 11: "Version") | Internal |
| `version_type` | ENUM | Yes | `ORIGINAL` | ORIGINAL, REVISION, FORECAST, FINAL (per Part 11: "Supports") | Type | Internal |
| `change_reason` | TEXT | No | NULL | — | Reason for version | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `total_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Version total | Confidential |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `is_active` | BOOLEAN | Yes | `false` | — | Active version | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, ACTIVE, ARCHIVED | Status | Internal |

## Entity 343 — Budget Allocation
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `budget_version_id` | UUID | Yes | — | FK to `budget_versions` | Parent version | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company (per Part 11: "Company") | Internal |
| `business_unit_id` | UUID | No | NULL | FK to `business_units` | BU (per Part 11: "Business Unit") | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 11: "Department") | Internal |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers` | Cost center | Internal |
| `fiscal_month` | SMALLINT | Yes | — | 1-12 | Month (per Part 11: "Month") | Internal |
| `budget_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Budget (per Part 11: "Budget Amount") | Confidential |
| `actual_amount` | DECIMAL(18,4) | Yes | `0` | — | Actual (per Part 11: "Actual Amount") | Confidential |
| `variance` | DECIMAL(18,4) | No | — | Generated: `budget - actual` | Variance (per Part 11: "Variance") | Confidential |
| `variance_pct` | DECIMAL(5,2) | No | — | — | Variance % | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |

## Entity 344 — Budget Revision
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `budget_id` | UUID | Yes | — | FK to `budget_masters` | Parent budget | Internal |
| `revision_number` | INTEGER | Yes | — | > 0 | Revision number | Internal |
| `revision_reason` | ENUM | Yes | — | EXPANSION, INFLATION, NEW_PROJECT, MANAGEMENT_DECISION, EMERGENCY (per Part 11: "Reasons") | Reason | Internal |
| `revision_details` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `old_amount` | DECIMAL(18,4) | Yes | — | — | Old | Confidential |
| `new_amount` | DECIMAL(18,4) | Yes | — | — | New | Confidential |
| `difference` | DECIMAL(18,4) | No | — | Generated: `new - old` | Difference | Confidential |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Approval time | Internal |
| `status` | ENUM | Yes | `APPROVED` | PENDING, APPROVED, REJECTED | Status | Internal |

## Entity 345 — Budget Approval
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `budget_id` | UUID | Yes | — | FK to `budget_masters` | Budget | Confidential |
| `approval_level` | ENUM | Yes | — | DEPARTMENT_HEAD, FINANCE_MANAGER, CFO (per Part 11: "Workflow") | Level | Internal |
| `approver_user_id` | UUID | Yes | — | FK to `user_accounts` | Approver | Confidential |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Status | Confidential |
| `comments` | TEXT | No | NULL | — | Comments | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

## Entity 346 — Cost Center (Budget Extension)
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `cost_center_id` | UUID | Yes | — | FK to `cost_centers` | Linked cost center | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `annual_budget` | DECIMAL(18,4) | Yes | — | ≥ 0 | Budget (per Part 11: "Budget") | Confidential |
| `ytd_actual` | DECIMAL(18,4) | Yes | `0` | — | Actual (per Part 11: "Actual") | Confidential |
| `variance` | DECIMAL(18,4) | No | — | Generated | Variance (per Part 11: "Variance") | Confidential |
| `manager_user_id` | UUID | Yes | — | FK to `user_accounts` | Manager (per Part 11: "Manager") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status (per Part 11: "Status") | Internal |

## Entity 347 — Profit Center (Budget Extension)
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `profit_center_id` | UUID | Yes | — | FK to `business_units` (where is_profit_center) | Linked profit center | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `revenue_budget` | DECIMAL(18,4) | Yes | — | ≥ 0 | Revenue budget | Confidential |
| `cost_budget` | DECIMAL(18,4) | Yes | — | ≥ 0 | Cost budget | Confidential |
| `profit_budget` | DECIMAL(18,4) | No | — | Generated: `revenue - cost` | Profit budget | Confidential |
| `ytd_revenue` | DECIMAL(18,4) | Yes | `0` | — | YTD revenue (per Part 11: "Revenue") | Confidential |
| `ytd_cost` | DECIMAL(18,4) | Yes | `0` | — | YTD cost (per Part 11: "Cost") | Confidential |
| `ytd_profit` | DECIMAL(18,4) | No | — | Generated | YTD profit (per Part 11: "Gross Profit", "Net Profit") | Confidential |
| `margin_pct` | DECIMAL(5,2) | No | — | — | Margin (per Part 11: "Margin") | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 348 — Budget Forecast
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `budget_id` | UUID | Yes | — | FK to `budget_masters` | Parent budget | Internal | |
| `forecast_type` | ENUM | Yes | `ROLLING` | ROLLING, QUARTERLY, MONTHLY, ANNUAL (per Part 11: "Forecast Types") | Type | Internal | |
| `forecast_period` | VARCHAR(10) | Yes | — | — | Period | Internal | |
| `forecasted_revenue` | DECIMAL(18,4) | Yes | — | ≥ 0 | Revenue (per Part 11 AI: "Revenue Prediction") | Confidential | Revenue AI |
| `forecasted_expense` | DECIMAL(18,4) | Yes | — | ≥ 0 | Expense (per Part 11 AI: "Expense Prediction") | Confidential | Expense AI |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models` | Model | Internal | |
| `confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal | |

## Entity 349 — Variance Analysis
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `budget_allocation_id` | UUID | Yes | — | FK to `budget_allocations` | Budget line | Confidential |
| `budget_amount` | DECIMAL(18,4) | Yes | — | — | Budget (per Part 11: "Budget") | Confidential |
| `actual_amount` | DECIMAL(18,4) | Yes | — | — | Actual (per Part 11: "Actual") | Confidential |
| `difference` | DECIMAL(18,4) | No | — | Generated: `actual - budget` | Difference (per Part 11: "Difference") | Confidential |
| `variance_pct` | DECIMAL(5,2) | No | — | — | Variance % (per Part 11: "Variance %") | Confidential |
| `trend` | ENUM | No | NULL | FAVORABLE, UNFAVORABLE, NEUTRAL | Trend (per Part 11: "Trend") | Internal |
| `reason` | TEXT | No | NULL | — | Reason (per Part 11: "Reason") | Internal |
| `corrective_action` | TEXT | No | NULL | — | Action (per Part 11: "Corrective Action") | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

## Entity 350 — Budget Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `budget_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization (per Part 11: "Budget Utilization") | Confidential |
| `department_budget_summary` | JSONB | Yes | `'{}'` | — | By dept (per Part 11: "Department Budget") | Confidential |
| `cost_center_budget_summary` | JSONB | Yes | `'{}'` | — | By cost center (per Part 11: "Cost Center Budget") | Confidential |
| `profit_center_margins` | JSONB | Yes | `'{}'` | — | Margins (per Part 11: "Profit Center Margin") | Confidential |
| `total_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Variance (per Part 11: "Budget Variance") | Confidential |
| `forecast_accuracy_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Accuracy (per Part 11: "Forecast Accuracy") | Internal |
| `capex_total` | DECIMAL(18,4) | Yes | `0` | — | CAPEX (per Part 11: "CAPEX") | Confidential |
| `opex_total` | DECIMAL(18,4) | Yes | `0` | — | OPEX (per Part 11: "OPEX") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI budget insights (per Part 11 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 8: Enterprise Tax Engine (Entities 351-360)

## Entity 351 — Tax Master
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `tax_code` | VARCHAR(20) | Yes | — | Unique per company | Code (per Part 11: "Tax Code") | Confidential |
| `tax_name` | VARCHAR(100) | Yes | — | Min 3 | Name (per Part 11: "Tax Name") | Internal |
| `tax_type` | ENUM | Yes | — | GST, CGST, SGST, IGST, CESS, TDS, TCS, VAT, SALES_TAX, OTHER | Type | Confidential |
| `country` | CHAR(2) | Yes | `IN` | ISO 3166-1 | Country (per Part 11: "Country") | Internal |
| `state` | VARCHAR(50) | No | NULL | — | State (per Part 11: "State") | Internal |
| `tax_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | Rate (per Part 11: "Rate") | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective (per Part 11: "Effective Date") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status (per Part 11: "Status") | Internal |

## Entity 352 — GST Configuration
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `gst_type` | ENUM | Yes | — | CGST, SGST, IGST, CESS (per Part 11) | Type | Confidential |
| `is_reverse_charge` | BOOLEAN | Yes | `false` | — | RCM (per Part 11: "Reverse Charge") | Confidential |
| `is_composition_scheme` | BOOLEAN | Yes | `false` | — | Composition (per Part 11: "Composition") | Confidential |
| `input_tax_credit_eligible` | BOOLEAN | Yes | `true` | — | ITC eligible | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 353 — HSN/SAC Master
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `hsn_code` | VARCHAR(10) | Yes | — | Unique, format `^[0-9]{4,8}$` | HSN/SAC (per Part 11: "HSN Code") | Internal |
| `description` | TEXT | Yes | — | Min 5 | Description (per Part 11: "Description") | Internal |
| `gst_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | GST rate (per Part 11: "GST Rate") | Confidential |
| `category` | VARCHAR(50) | No | NULL | — | Category (per Part 11: "Category") | Internal |
| `unit` | VARCHAR(20) | No | NULL | — | Unit of measurement | Internal |
| `is_mandatory` | BOOLEAN | Yes | `true` | — | Mandatory on invoices | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status (per Part 11: "Status") | Internal |

## Entity 354 — Tax Rule
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rule_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Confidential |
| `rule_name` | VARCHAR(200) | Yes | — | Min 3 | Name | Internal |
| `conditions` | JSONB | Yes | `'{}'` | — | Conditions: `{ customer_type, vendor_type, state, country, product_category, transaction_type }` (per Part 11: "Conditions") | Confidential |
| `tax_code` | VARCHAR(20) | Yes | — | FK to `tax_masters` | Applicable tax | Confidential |
| `priority` | INTEGER | Yes | `100` | > 0 | Evaluation priority | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | — | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 355 — Tax Group
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `group_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `group_name` | VARCHAR(100) | Yes | — | Min 3 | Name (per Part 11: "Domestic Sales", "Export Sales", etc.) | Internal |
| `tax_rule_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Rules in group (per Part 11: "Groups tax rules") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 356 — TDS Management
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `tds_section` | VARCHAR(20) | Yes | — | — | Section (e.g., "194C", "194J") (per Part 11: "Contractors", "Professional Fees") | Confidential |
| `tds_description` | VARCHAR(200) | Yes | — | — | Description | Internal |
| `tds_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | Rate | Confidential |
| `threshold_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Threshold for deduction | Confidential |
| `applicable_for` | ENUM | Yes | — | VENDOR_PAYMENT, PROFESSIONAL_FEES, CONTRACTOR, RENT, INTEREST, COMMISSION (per Part 11) | Applicable | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 357 — TCS Management
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `tcs_code` | VARCHAR(20) | Yes | — | — | Code | Confidential |
| `tcs_description` | VARCHAR(200) | Yes | — | — | Description | Internal |
| `tcs_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | Rate | Confidential |
| `threshold_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Threshold (per Part 11: "Threshold") | Confidential |
| `applicable_products` | UUID[] | No | `ARRAY[]::UUID[]` | — | Products (per Part 11: "Applicable Products") | Internal |
| `applicable_customers` | UUID[] | No | `ARRAY[]::UUID[]` | — | Customers (per Part 11: "Applicable Customers") | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 358 — e-Invoice
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `invoice_id` | UUID | Yes | — | FK to `customer_invoices` | Source invoice | Confidential |
| `irn` | VARCHAR(100) | No | NULL | — | Invoice Reference Number (per Part 11: "IRN") | Confidential |
| `qr_code_file_id` | UUID | No | NULL | FK to `file_attachments` | QR code (per Part 11: "QR Code") | Internal |
| `acknowledgement_number` | VARCHAR(50) | No | NULL | — | Ack no (per Part 11: "Acknowledgement Number") | Confidential |
| `signed_invoice_file_id` | UUID | No | NULL | FK to `file_attachments` | Signed invoice (per Part 11: "Signed Invoice") | Confidential |
| `generated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Generation time | Internal |
| `api_status` | ENUM | Yes | `PENDING` | PENDING, GENERATED, FAILED, CANCELLED | Status (per Part 11: "Status") | Internal |
| `error_message` | TEXT | No | NULL | — | Error (if FAILED) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CANCELLED | Status | Internal |

## Entity 359 — e-Way Bill
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ewb_number` | VARCHAR(50) | Yes | — | Unique | e-Way Bill number | Confidential |
| `invoice_id` | UUID | Yes | — | FK to `customer_invoices` | Source invoice | Confidential |
| `vehicle_number` | VARCHAR(20) | No | NULL | — | Vehicle (per Part 11: "Vehicle") | Internal |
| `transporter_id` | VARCHAR(50) | No | NULL | — | Transporter (per Part 11: "Transporter") | Internal |
| `from_place` | VARCHAR(200) | Yes | — | — | Origin | Internal |
| `to_place` | VARCHAR(200) | Yes | — | — | Destination | Internal |
| `distance_km` | DECIMAL(8,2) | No | NULL | ≥ 0 | Distance (per Part 11: "Distance") | Internal |
| `validity_expiry` | TIMESTAMPTZ | Yes | — | — | Expiry (per Part 11: "Expiry") | Internal |
| `generated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Generation time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, CANCELLED (per Part 11: "Status") | Status | Internal |

## Entity 360 — Tax Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `gst_payable` | DECIMAL(18,4) | Yes | `0` | — | Payable (per Part 11: "GST Payable") | Confidential |
| `gst_receivable` | DECIMAL(18,4) | Yes | `0` | — | Receivable (per Part 11: "GST Receivable") | Confidential |
| `tds_total` | DECIMAL(18,4) | Yes | `0` | — | TDS (per Part 11: "TDS") | Confidential |
| `tcs_total` | DECIMAL(18,4) | Yes | `0` | — | TCS (per Part 11: "TCS") | Confidential |
| `e_invoices_count` | INTEGER | Yes | `0` | ≥ 0 | e-Invoices (per Part 11: "e-Invoices") | Internal |
| `e_way_bills_count` | INTEGER | Yes | `0` | ≥ 0 | e-Way Bills (per Part 11: "e-Way Bills") | Internal |
| `total_tax_liability` | DECIMAL(18,4) | Yes | `0` | — | Liability (per Part 11: "Tax Liability") | Confidential |
| `upcoming_returns` | JSONB | Yes | `'[]'` | — | Returns due (per Part 11: "Upcoming Returns") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI tax insights (per Part 11 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 9: Financial Closing, Consolidation & Financial Statements (Entities 361-370)

## Entity 361 — Financial Close Calendar
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period (per Part 11: "Closing Period") | Internal |
| `department_id` | UUID | Yes | — | FK to `departments` | Department (per Part 11: "Department") | Internal |
| `due_date` | DATE | Yes | — | — | Due (per Part 11: "Due Date") | Internal |
| `responsible_user_id` | UUID | Yes | — | FK to `user_accounts` | Responsible (per Part 11: "Responsible Person") | Internal |
| `completion_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED | Status (per Part 11: "Completion Status") | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED | Approval (per Part 11: "Approval Status") | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |

## Entity 362 — Closing Checklist
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `close_calendar_id` | UUID | Yes | — | FK to `financial_close_calendars` | Parent close | Internal |
| `checklist_item` | ENUM | Yes | — | AP_CLOSED, AR_CLOSED, INVENTORY_CLOSED, PAYROLL_CLOSED, TAX_POSTED, FIXED_ASSETS_POSTED, BANK_RECONCILED, TRIAL_BALANCE_VERIFIED (per Part 11: "Closing Checklist") | Item | Internal |
| `is_completed` | BOOLEAN | Yes | `false` | — | Completed | Internal |
| `completed_by` | UUID | No | NULL | FK to `user_accounts` | Who completed | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | When | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED | Status | Internal |

## Entity 363 — Ledger Reconciliation
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `reconciliation_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `reconciliation_type` | ENUM | Yes | — | BANK, AP, AR, INVENTORY, PAYROLL, FIXED_ASSETS, TAX (per Part 11: "Ledger Reconciliation") | Type | Confidential |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `sub_ledger_balance` | DECIMAL(18,4) | Yes | — | — | Sub-ledger | Confidential |
| `gl_balance` | DECIMAL(18,4) | Yes | — | — | GL balance | Confidential |
| `difference` | DECIMAL(18,4) | Yes | — | Generated: `sub_ledger - gl` | Difference | Confidential |
| `is_matched` | BOOLEAN | Yes | `false` | Generated: `difference = 0` | Matched | Internal |
| `adjustment_journal_id` | UUID | No | NULL | FK to `journal_entries` | Adjustment | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, MATCHED, ADJUSTED, COMPLETED | Status | Internal |

## Entity 364 — Intercompany Transactions
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `transaction_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `from_company_id` | UUID | Yes | — | FK to `companies` | From (per Part 11: "Company A") | Internal |
| `to_company_id` | UUID | Yes | — | FK to `companies` | To (per Part 11: "Company B") | Internal |
| `transaction_type` | ENUM | Yes | — | INTERCOMPANY_SALES, INTERCOMPANY_PURCHASES, INTERNAL_TRANSFERS, SETTLEMENT (per Part 11) | Type | Confidential |
| `amount` | DECIMAL(18,4) | Yes | — | > 0 | Amount | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `transaction_date` | DATE | Yes | — | — | Date | Internal |
| `from_journal_id` | UUID | No | NULL | FK to `journal_entries` | From journal | Confidential |
| `to_journal_id` | UUID | No | NULL | FK to `journal_entries` | To journal | Confidential |
| `is_eliminated` | BOOLEAN | Yes | `false` | — | Eliminated in consolidation | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, MATCHED, ELIMINATED, COMPLETED | Status | Internal |

## Entity 365 — Consolidation Engine
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `consolidation_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `parent_company_id` | UUID | Yes | — | FK to `companies` | Parent | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `companies_consolidated` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Subsidiaries (per Part 11: "Multi Company") | Internal |
| `elimination_entries_count` | INTEGER | Yes | `0` | ≥ 0 | Eliminations | Internal |
| `consolidated_total_assets` | DECIMAL(18,4) | Yes | `0` | — | Assets | Confidential |
| `consolidated_total_liabilities` | DECIMAL(18,4) | Yes | `0` | — | Liabilities | Confidential |
| `consolidated_net_profit` | DECIMAL(18,4) | Yes | `0` | — | Net profit | Confidential |
| `currency_translation_adjustment` | DECIMAL(18,4) | Yes | `0` | — | FX adjustment (per Part 11: "Multi Currency") | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal |

## Entity 366 — Financial Statements
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `statement_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `statement_type` | ENUM | Yes | — | BALANCE_SHEET, PROFIT_LOSS, CASH_FLOW, TRIAL_BALANCE, GENERAL_LEDGER, DAY_BOOK (per Part 11: "Financial Statements") | Type | Confidential |
| `statement_data` | JSONB | Yes | `'{}'` | — | Full statement content | Confidential |
| `generated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Generation time | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, PUBLISHED | Status | Internal |

## Entity 367 — Cash Flow Statement
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `financial_statement_id` | UUID | Yes | — | FK to `financial_statements` | Parent | Confidential |
| `operating_activities` | DECIMAL(18,4) | Yes | `0` | — | Operating (per Part 11: "Operating Activities") | Confidential |
| `investing_activities` | DECIMAL(18,4) | Yes | `0` | — | Investing (per Part 11: "Investing Activities") | Confidential |
| `financing_activities` | DECIMAL(18,4) | Yes | `0` | — | Financing (per Part 11: "Financing Activities") | Confidential |
| `net_cash_flow` | DECIMAL(18,4) | Yes | `0` | Generated: SUM | Net | Confidential |
| `opening_cash_balance` | DECIMAL(18,4) | Yes | `0` | — | Opening | Confidential |
| `closing_cash_balance` | DECIMAL(18,4) | Yes | `0` | Generated: `opening + net` | Closing | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

## Entity 368 — Balance Sheet
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `financial_statement_id` | UUID | Yes | — | FK to `financial_statements` | Parent | Confidential |
| `total_assets` | DECIMAL(18,4) | Yes | `0` | — | Assets (per Part 11: "Assets") | Confidential |
| `total_liabilities` | DECIMAL(18,4) | Yes | `0` | — | Liabilities (per Part 11: "Liabilities") | Confidential |
| `total_equity` | DECIMAL(18,4) | Yes | `0` | — | Equity (per Part 11: "Equity") | Confidential |
| `working_capital` | DECIMAL(18,4) | No | NULL | — | Working capital (per Part 11: "Working Capital") | Confidential |
| `net_worth` | DECIMAL(18,4) | No | NULL | — | Net worth (per Part 11: "Net Worth") | Confidential |
| `is_balanced` | BOOLEAN | Yes | `false` | Generated: `assets = liabilities + equity` | Balanced | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

## Entity 369 — Profit & Loss Statement
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `financial_statement_id` | UUID | Yes | — | FK to `financial_statements` | Parent | Confidential |
| `total_revenue` | DECIMAL(18,4) | Yes | `0` | — | Revenue (per Part 11: "Revenue") | Confidential |
| `total_cogs` | DECIMAL(18,4) | Yes | `0` | — | COGS (per Part 11: "COGS") | Confidential |
| `gross_profit` | DECIMAL(18,4) | Yes | `0` | Generated: `revenue - cogs` | Gross (per Part 11: "Gross Profit") | Confidential |
| `operating_expenses` | DECIMAL(18,4) | Yes | `0` | — | OpEx (per Part 11: "Operating Expense") | Confidential |
| `ebitda` | DECIMAL(18,4) | Yes | `0` | Generated: `gross - opex` | EBITDA (per Part 11: "EBITDA") | Confidential |
| `net_profit` | DECIMAL(18,4) | Yes | `0` | — | Net (per Part 11: "Net Profit") | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

## Entity 370 — Financial Closing Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `closing_progress_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Progress (per Part 11: "Closing Progress") | Internal |
| `pending_tasks_count` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 11: "Pending Tasks") | Internal |
| `reconciliation_status` | JSONB | Yes | `'{}'` | — | Status by type (per Part 11: "Reconciliation Status") | Confidential |
| `trial_balance_balanced` | BOOLEAN | Yes | `false` | — | TB (per Part 11: "Trial Balance") | Internal |
| `consolidation_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED | Consolidation (per Part 11: "Consolidation Status") | Internal |
| `financial_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Health (per Part 11: "Financial Health") | Confidential |
| `period_status` | ENUM | Yes | `OPEN` | OPEN, SOFT_CLOSE, HARD_CLOSE | Period (per Part 11: "Period Status") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI closing insights (per Part 11 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 10: CFO Mission Control, Finance Intelligence & AI (Entities 371-380)

## Entity 371 — Finance KPI Library
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | Code (e.g., `FIN_EBITDA`) | Internal |
| `kpi_name` | VARCHAR(100) | Yes | — | — | Name (per Part 11: "Enterprise KPIs") | Public |
| `kpi_category` | ENUM | Yes | — | REVENUE, PROFITABILITY, LIQUIDITY, EFFICIENCY, LEVERAGE, RETURNS | Category | Internal |
| `formula` | TEXT | Yes | — | — | Formula | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM | Internal |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target | Internal |
| `current_value` | DECIMAL(18,4) | No | NULL | — | Latest | Confidential |
| `company_id` | UUID | No | NULL | FK to `companies` | Scope | Internal |
| `snapshot_date` | DATE | Yes | — | — | Measurement date | Internal |

## Entity 372 — CFO Dashboard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_name` | VARCHAR(100) | Yes | — | — | Name | Public |
| `company_id` | UUID | No | NULL | FK to `companies` | Scope | Internal |
| `widget_configuration` | JSONB | Yes | `'{}'` | — | Widgets (per Part 11: "CFO Dashboard") | Internal |
| `refresh_interval_sec` | INTEGER | Yes | `30` | > 0 | Refresh | Internal |
| `target_audience` | ENUM | Yes | `CFO` | FINANCE_MANAGER, CFO, CEO, BOARD | Audience | Internal |
| `is_mission_control_enabled` | BOOLEAN | Yes | `false` | — | Shows on Mission Control | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 373 — Cash Flow Forecast
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `forecast_date` | DATE | Yes | — | — | Date | Internal |
| `forecast_horizon` | ENUM | Yes | `WEEKLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL (per Part 11: "Forecast") | Horizon | Internal |
| `projected_inflows` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Inflows | Confidential |
| `projected_outflows` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Outflows | Confidential |
| `net_cash_flow` | DECIMAL(18,4) | No | NULL | Generated | Net | Confidential |
| `projected_closing` | DECIMAL(18,4) | Yes | `0` | — | Projected closing | Confidential |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models` | AI model | Internal |
| `confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

## Entity 374 — Financial Risk Engine
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `risk_type` | ENUM | Yes | — | LIQUIDITY_RISK, CREDIT_RISK, VENDOR_RISK, CUSTOMER_RISK, CURRENCY_RISK, COMPLIANCE_RISK (per Part 11: "Monitors") | Type | Confidential |
| `risk_score` | DECIMAL(5,2) | Yes | — | 0-100 | Score | Confidential |
| `risk_category` | ENUM | Yes | — | LOW, MEDIUM, HIGH, CRITICAL | Category | Confidential |
| `risk_description` | TEXT | Yes | — | Min 10 chars | Description | Internal |
| `mitigation_plan` | TEXT | No | NULL | — | Mitigation | Internal |
| `ai_predicted` | BOOLEAN | Yes | `false` | — | AI-predicted risk | Internal |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models` | Model | Internal |
| `assessed_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Assessment time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, MITIGATED, CLOSED | Status | Internal |

## Entity 375 — Working Capital Engine
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `receivables` | DECIMAL(18,4) | Yes | `0` | — | AR (per Part 11: "Receivables") | Confidential |
| `inventory` | DECIMAL(18,4) | Yes | `0` | — | Inventory (per Part 11: "Inventory") | Confidential |
| `payables` | DECIMAL(18,4) | Yes | `0` | — | AP (per Part 11: "Payables") | Confidential |
| `cash` | DECIMAL(18,4) | Yes | `0` | — | Cash (per Part 11: "Cash") | Confidential |
| `working_capital` | DECIMAL(18,4) | Yes | `0` | Generated: `(receivables + inventory + cash) - payables` | WC (per Part 11: "Working Capital") | Confidential |
| `current_ratio` | DECIMAL(8,4) | No | NULL | — | Current ratio | Confidential |
| `quick_ratio` | DECIMAL(8,4) | No | NULL | — | Quick ratio | Confidential |
| `cash_conversion_cycle_days` | DECIMAL(8,2) | No | NULL | — | CCC | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

## Entity 376 — Profitability Analysis
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `analysis_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `dimension_type` | ENUM | Yes | — | PRODUCT, CUSTOMER, STORE, RESTAURANT, PLANT, BUSINESS_UNIT, PROJECT, REGION (per Part 11: "Measures") | Dimension | Internal |
| `dimension_id` | UUID | Yes | — | — | Entity ID | Internal |
| `revenue` | DECIMAL(18,4) | Yes | `0` | — | Revenue | Confidential |
| `cost` | DECIMAL(18,4) | Yes | `0` | — | Cost | Confidential |
| `gross_profit` | DECIMAL(18,4) | Yes | `0` | Generated | Gross | Confidential |
| `gross_margin_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Margin | Confidential |
| `net_profit` | DECIMAL(18,4) | Yes | `0` | — | Net | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

## Entity 377 — Financial Planning AI
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `plan_type` | ENUM | Yes | — | REVENUE_FORECAST, EXPENSE_FORECAST, BUDGET_FORECAST, CAPITAL_PLANNING, SCENARIO_ANALYSIS (per Part 11: "Provides") | Type | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `plan_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `projected_values` | JSONB | Yes | `'{}'` | — | Projections | Confidential |
| `scenario_type` | ENUM | No | NULL | BEST_CASE, BASE_CASE, WORST_CASE | Scenario (per Part 11: "Scenario Analysis") | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Model | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | — | 0-100 | Confidence | Internal |
| `recommendations` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | AI recommendations | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

## Entity 378 — CFO Copilot
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `query_text` | TEXT | Yes | — | Min 5 | Natural language query (per Part 11: "Natural Language Queries") | Internal |
| `query_result` | JSONB | Yes | `'{}'` | — | AI-generated answer + data | Confidential |
| `query_type` | ENUM | Yes | — | FINANCIAL_ANALYSIS, FORECAST, COMPARISON, ANOMALY, RECOMMENDATION | Type | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | LLM model | Internal |
| `response_time_ms` | INTEGER | No | NULL | ≥ 0 | Response time | Internal |
| `user_id` | UUID | Yes | — | FK to `user_accounts` | Who asked | Internal |
| `asked_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Time | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, FAILED | Status | Internal |

## Entity 379 — Enterprise Finance Mission Control
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `control_room_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `company_id` | UUID | No | NULL | FK to `companies` | Scope | Internal |
| `view_configuration` | JSONB | Yes | `'{}'` | — | Widget layout (per Part 11: "Displays") | Internal |
| `display_duration_sec` | INTEGER | Yes | `30` | > 0 | Rotation | Internal |
| `is_live` | BOOLEAN | Yes | `true` | — | Real-time | Internal |
| `websocket_endpoint` | VARCHAR(200) | No | NULL | — | Live endpoint | Internal |
| `live_revenue` | DECIMAL(18,4) | No | NULL | — | Live revenue | Confidential |
| `live_cash` | DECIMAL(18,4) | No | NULL | — | Live cash | Confidential |
| `live_profit` | DECIMAL(18,4) | No | NULL | — | Live profit | Confidential |
| `ai_recommendations` | JSONB | No | NULL | — | Live AI recommendations | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

## Entity 380 — Executive Finance Scorecard
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scorecard_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | No | NULL | FK to `companies` | Scope | Internal |
| `scorecard_type` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL | Period | Internal |
| `revenue_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Revenue growth (per Part 11: "Revenue Growth") | Confidential |
| `profit_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Profit growth (per Part 11: "Profit Growth") | Confidential |
| `cash_position_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Cash (per Part 11: "Cash Position") | Confidential |
| `ebitda_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | EBITDA | Confidential |
| `budget_performance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Budget (per Part 11: "Budget Performance") | Confidential |
| `inventory_value` | DECIMAL(18,4) | Yes | `0` | — | Inventory (per Part 11: "Inventory Value") | Confidential |
| `return_on_assets` | DECIMAL(5,2) | Yes | `0` | — | ROA (per Part 11: "Return on Assets") | Confidential |
| `return_on_equity` | DECIMAL(5,2) | Yes | `0` | — | ROE (per Part 11: "Return on Equity") | Confidential |
| `overall_financial_health` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall (per Part 11: "Overall Financial Health") | Confidential |
| `overall_grade` | ENUM | Yes | — | A, B, C, D, F | Grade | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 11 Completion Summary

**Part 11 (Enterprise Finance & Accounting) is now COMPLETE** with 100 entities (281–380) across 10 sections.

### Key Architectural Achievements

1. **Accounting Event Engine** — All modules generate events, not journals
2. **Universal Posting Rules Engine** — Configurable rules, no hardcoded accounting
3. **Three-Layer Architecture** — Journal Lines → GL → Financial Cube
4. **Finance Micro Kernel** — 10 shared services
5. **Procure-to-Pay (P2P)** — Complete AP with Three-Way Matching
6. **Order-to-Cash (O2C)** — Complete AR with Collections + Credit Management
7. **Treasury** — Banking, cash, investments, loans, multi-currency
8. **Fixed Assets** — Full lifecycle with auto-depreciation
9. **Budgeting** — Multi-level, versioned, with AI forecasting
10. **Tax Engine** — GST, TDS, TCS, e-Invoice, e-Way Bill
11. **Financial Closing** — Checklist, reconciliation, consolidation
12. **CFO Mission Control** — Live dashboards, AI Copilot, financial intelligence
13. **Financial Integration Hub** — Standard event contracts, idempotent processing
14. **Financial Rules Engine** — Centralized accounting/budget/tax/approval/compliance rules
15. **CFO Copilot** — Natural language financial queries
