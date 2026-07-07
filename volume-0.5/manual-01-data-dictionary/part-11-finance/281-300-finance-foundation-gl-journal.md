# Manual 1 · Part 11 · Sections 1 & 2 · Entities 281-300 — Finance Foundation, GL, COA & Journal Engine

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 11 — Enterprise Finance & Accounting |
| Sections | 1 (Finance Foundation) & 2 (Chart of Accounts, GL & Journal Engine) |
| Entities | 281–300 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 3 §3.4, Ch 4 §4.4, Ch 10 §10.6, Ch 18 §18.14, Part 11 §1-2 |
| Last Updated | 2026-07-07 |

---

## Overview — Enterprise Finance Architecture

Part 11 implements the **financial source of truth** for SUOP. The architecture is built on two critical innovations recommended by the Chief Enterprise Architect:

### 1. Accounting Event Engine (Core Platform Service)
Every operational module (Procurement, Warehouse, Manufacturing, Retail, Restaurant, HR, Maintenance) generates **Accounting Events** — NOT journal entries. The Finance module converts those events into journal entries via configurable Posting Rules.

```
Operational Module (e.g., GRN)
  ↓ Generates
Accounting Event (Entity 288)
  ↓ Converted by
Posting Rule (Entity 296)
  ↓ Creates
Journal Entry (Entity 294)
  ↓ Posts to
General Ledger (Entity 293)
  ↓ Aggregated in
Financial Cube (pre-aggregated for reporting)
```

**Benefit**: If accounting rules change, only Posting Rules change — no operational module code changes.

### 2. Three-Layer Financial Architecture

| Layer | Purpose | Characteristics |
|---|---|---|
| **Layer 1: Journal Lines** | Immutable transaction history | Never edited, complete audit trail |
| **Layer 2: General Ledger** | Running account balances | Supports drill-down, optimized for ops |
| **Layer 3: Financial Cube** | Pre-aggregated balances | Executive dashboards, CFO reports, AI forecasting |

### 3. Finance Micro Kernel (Shared Services)

| Service | Purpose |
|---|---|
| Posting Engine | Converts events to journals via rules |
| Tax Engine | GST, CGST, SGST, IGST, TDS, TCS calculation |
| Currency Engine | Multi-currency conversion, exchange rates |
| Fiscal Calendar | Period control, open/close, soft/hard close |
| Journal Engine | Journal creation, validation, posting |
| Budget Engine | Budget planning, tracking, variance |
| Cost Allocation Engine | Cost center allocation, activity-based costing |
| Consolidation Engine | Multi-company consolidation |
| Accounting Event Engine | Event generation, routing, processing |
| Financial Reporting Engine | Trial Balance, P&L, Balance Sheet, Cash Flow |

---

## SECTION 1: Finance Foundation & Enterprise Accounting Architecture (Entities 281-290)

---

## Entity 281 — Legal Entity

### 1. Business Purpose
Represents a **legally registered company**. Per Part 11: *"One legal entity may own multiple companies. Legal Entity cannot be deleted after transactions exist."*

### 2-4. Owner / Schema / Fields

| Owner | L2 — Finance Head |
|---|---|
| Schema | `master` |
| Table | `legal_entities` |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `LE-` | Entity code (per Part 11: "entity_code") | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Operating company | Internal |
| `legal_entity_name` | VARCHAR(200) | Yes | — | Min 3 | Legal name (per Part 11: "entity_name") | Public |
| `registration_number` | VARCHAR(50) | No | NULL | — | Company registration (per Part 11: "registration_number") | Confidential |
| `gstin` | VARCHAR(15) | No | NULL | GSTIN format + checksum | GSTIN (per Part 11: "GSTIN") | Confidential |
| `pan` | VARCHAR(10) | No | NULL | PAN format | PAN (per Part 11: "PAN") | Confidential |
| `tan` | VARCHAR(10) | No | NULL | TAN format | TAN | Confidential |
| `cin` | VARCHAR(21) | No | NULL | CIN format | Corporate Identity Number | Confidential |
| `country` | CHAR(2) | Yes | `IN` | ISO 3166-1 | Country (per Part 11: "country") | Public |
| `base_currency` | CHAR(3) | Yes | `INR` | ISO 4217 | Base currency (per Part 11: "base_currency") | Internal |
| `registered_address` | JSONB | Yes | `'{}'` | — | Legal address | Internal |
| `tax_jurisdiction` | VARCHAR(50) | Yes | `INDIA` | — | Tax jurisdiction | Confidential |
| `is_consolidation_parent` | BOOLEAN | Yes | `false` | — | Parent for consolidation | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DISSOLVED | Status (per Part 11: "status") | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Relationships**: → Company (1:N); → Fiscal Calendar, Accounting Policy, Consolidation
- **Validation**: Cannot delete after transactions exist (per Part 11); GSTIN unique
- **AI**: Consolidation AI, Tax Compliance AI

---

## Entity 282 — Company Master (Finance Extension)

### 1. Business Purpose
Extends Company (Entity A.1, Part 2) with **financial attributes** — default currency, financial year, intercompany settings. Per Part 11: Supports Multi-company, Consolidation, Intercompany Accounting.

### 4. Field Dictionary (Finance Extension Fields — added to Part 2 Company)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `legal_entity_id` | UUID | Yes | — | FK to `legal_entities` | Parent legal entity (per Part 11: "Legal Entity") | Confidential |
| `default_currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Default currency (per Part 11: "Default Currency") | Internal |
| `financial_year_start_month` | SMALLINT | Yes | `4` | 1-12 | FY start (April = 4 for India) (per Part 11: "Financial Year") | Internal |
| `financial_year_end_month` | SMALLINT | Yes | `3` | 1-12 | FY end | Internal |
| `is_intercompany_enabled` | BOOLEAN | Yes | `false` | — | Intercompany accounting (per Part 11: "Intercompany Accounting") | Confidential |
| `intercompany_clearing_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | IC clearing account | Confidential |
| `consolidation_method` | ENUM | No | NULL | FULL_CONSOLIDATION, PROPORTIONATE, EQUITY | Method (per Part 11: "Consolidation") | Confidential |
| `local_tax_authority` | VARCHAR(100) | No | NULL | — | Tax authority (e.g., "GSTN") | Confidential |
| `accounting_standard` | ENUM | Yes | `IND_AS` | IND_AS, IFRS, GAAP, IGAAP | Accounting standard | Confidential |
| `is_separate_legal_books` | BOOLEAN | Yes | `false` | — | Maintains separate legal books | Confidential |

---

## Entity 283 — Business Unit (Finance Extension)

### 1. Business Purpose
Extends Business Unit (Entity A.2, Part 2) with **financial attributes** — separate P&L, cost allocation. Per Part 11: Supports Separate Profit & Loss.

### 4. Field Dictionary (Finance Extension Fields)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `is_profit_center` | BOOLEAN | Yes | `false` | — | Tracks P&L (per Part 11: "Separate Profit & Loss") | Confidential |
| `is_cost_center` | BOOLEAN | Yes | `true` | — | Tracks costs | Confidential |
| `default_revenue_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | Default revenue account | Confidential |
| `default_expense_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | Default expense account | Confidential |
| `budget_id` | UUID | No | NULL | FK to `budgets` | Annual budget | Confidential |
| `intercompany_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | IC account for this BU | Confidential |

---

## Entity 284 — Fiscal Calendar

### 1. Business Purpose
Controls accounting periods. Per Part 11: Period Status — Open, Soft Close, Hard Close, Locked. *"Closed periods cannot accept new journals."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | Financial year (per Part 11: "Financial Year") | Internal |
| `fiscal_quarter` | ENUM | Yes | — | Q1, Q2, Q3, Q4 | Quarter (per Part 11: "Quarter") | Internal |
| `fiscal_month` | SMALLINT | Yes | — | 1-12 | Month (per Part 11: "Month") | Internal |
| `period_name` | VARCHAR(50) | Yes | — | — | Display (e.g., "FY2026-Q1-Apr") | Internal |
| `start_date` | DATE | Yes | — | — | Start (per Part 11: "Start Date") | Internal |
| `end_date` | DATE | Yes | — | > start_date | End (per Part 11: "End Date") | Internal |
| `period_status` | ENUM | Yes | `OPEN` | OPEN, SOFT_CLOSE, HARD_CLOSE, LOCKED (per Part 11) | Status | Confidential |
| `soft_closed_at` | TIMESTAMPTZ | No | NULL | — | Soft close time | Internal |
| `soft_closed_by` | UUID | No | NULL | FK to `user_accounts` | Who soft-closed | Internal |
| `hard_closed_at` | TIMESTAMPTZ | No | NULL | — | Hard close time | Confidential |
| `hard_closed_by` | UUID | No | NULL | FK to `user_accounts` | Who hard-closed | Confidential |
| `locked_at` | TIMESTAMPTZ | No | NULL | — | Lock time | Confidential |
| `locked_by` | UUID | No | NULL | FK to `user_accounts` | Who locked | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Validation**: `end_date` > `start_date`; HARD_CLOSE/LOCKED rejects new journal posts; period transitions follow Open → Soft Close → Hard Close → Locked (no reversal without super admin)
- **Index**: `uq_fc_company_period` (company_id, fiscal_year, fiscal_month), `idx_fc_status`, `idx_fc_dates`
- **Audit**: Full; mandatory reason for period close/lock; all transitions permanently audited

---

## Entity 285 — Financial Dimension

### 1. Business Purpose
Enterprise financial analysis. Per Part 11: Company, Branch, Department, BU, Project, Product Category, Cost Center, Profit Center, Employee, Customer, Vendor. Supports unlimited future dimensions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dimension_code` | VARCHAR(30) | Yes | — | Unique per company | Code (e.g., `DIM_DEPT`) | Internal |
| `dimension_name` | VARCHAR(100) | Yes | — | Min 2 | Display name (per Part 11) | Public |
| `dimension_type` | ENUM | Yes | — | COMPANY, BRANCH, DEPARTMENT, BUSINESS_UNIT, PROJECT, PRODUCT_CATEGORY, COST_CENTER, PROFIT_CENTER, EMPLOYEE, CUSTOMER, VENDOR, CUSTOM | Type (per Part 11) | Internal |
| `source_entity_type` | VARCHAR(30) | No | NULL | — | Source entity (e.g., "departments") | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Required on all journals | Internal |
| `is_configurable` | BOOLEAN | Yes | `true` | — | User-configurable values | Internal |
| `allowed_values_query` | TEXT | No | NULL | — | SQL/API for allowed values | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 286 — Cost Center (Finance Extension)

### 1. Business Purpose
Extends Cost Center (Entity A.13, Part 2) with financial KPIs. Per Part 11: Budget, Actual, Variance.

### 4. Field Dictionary (Finance Extension Fields)
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `gl_expense_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | Default expense GL | Confidential |
| `annual_budget` | DECIMAL(18,4) | No | NULL | ≥ 0 | Annual budget (per Part 11: "Budget") | Confidential |
| `ytd_actual` | DECIMAL(18,4) | Yes | `0` | — | Year-to-date actual (per Part 11: "Actual") | Confidential |
| `budget_variance` | DECIMAL(18,4) | No | — | Generated: `budget - actual` | Variance (per Part 11: "Variance") | Confidential |
| `budget_variance_pct` | DECIMAL(5,2) | No | — | — | Variance % | Confidential |
| `is_active_for_posting` | BOOLEAN | Yes | `true` | — | Can receive postings | Internal |
| `cost_allocation_method` | ENUM | No | NULL | DIRECT, STEP_DOWN, ACTIVITY_BASED | Allocation method | Confidential |

---

## Entity 287 — Profit Center (Finance Extension)

### 1. Business Purpose
Extends Business Unit/Cost Center with profitability tracking. Per Part 11: Retail Division, Restaurant Division, Export Division, Manufacturing Unit A/B.

### 4. Field Dictionary (Finance Extension Fields)
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `gl_revenue_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | Default revenue GL | Confidential |
| `gl_cogs_account_id` | UUID | No | NULL | FK to `chart_of_accounts` | COGS account | Confidential |
| `annual_revenue_budget` | DECIMAL(18,4) | No | NULL | ≥ 0 | Revenue budget | Confidential |
| `annual_expense_budget` | DECIMAL(18,4) | No | NULL | ≥ 0 | Expense budget | Confidential |
| `ytd_revenue` | DECIMAL(18,4) | Yes | `0` | — | YTD revenue | Confidential |
| `ytd_expense` | DECIMAL(18,4) | Yes | `0` | — | YTD expense | Confidential |
| `ytd_profit` | DECIMAL(18,4) | No | — | Generated: `revenue - expense` | YTD profit | Confidential |
| `profit_margin_pct` | DECIMAL(5,2) | No | — | — | Margin % | Confidential |

---

## Entity 288 — Accounting Event

### 1. Business Purpose
**Core platform service** — financial event generated by business modules. Per Part 11: *"Events are immutable after posting."* This is the **Accounting Event Engine** that all operational modules use.

### 2-4. Owner / Schema / Fields

| Owner | L2 — Finance Head (policy); All modules (generation) |
|---|---|
| Schema | `transactional` |
| Table | `accounting_events` |
| **Partitioning** | **Monthly by `event_timestamp`** (high volume) |
| **Immutability** | Immutable after POSTED status |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `event_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 11: "Event Number") | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `source_module` | ENUM | Yes | — | PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, HR, MAINTENANCE, FINANCE, INVENTORY, QUALITY | Module (per Part 11: "Module") | Internal |
| `source_transaction_type` | VARCHAR(50) | Yes | — | — | Transaction type (e.g., "GOODS_RECEIPT", "SALES", "PRODUCTION_COMPLETION") (per Part 11: "Transaction") | Internal |
| `source_document_type` | VARCHAR(30) | No | NULL | — | Source doc type (e.g., "GRN", "PO", "SALES_ORDER") | Internal |
| `source_document_id` | UUID | No | NULL | — | Source doc ID (per Part 11: "Reference") | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source doc number | Internal |
| `event_type` | VARCHAR(50) | Yes | — | — | Event type (e.g., "INVENTORY_RECEIPT", "REVENUE_RECOGNITION") | Internal |
| `event_description` | TEXT | Yes | — | Min 10 chars | Description | Internal |
| `amount` | DECIMAL(18,4) | Yes | — | — | Financial amount (per Part 11: "Amount") | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency (per Part 11: "Currency") | Internal |
| `exchange_rate` | DECIMAL(12,6) | No | NULL | > 0 | FX rate (if non-base currency) | Confidential |
| `amount_base_currency` | DECIMAL(18,4) | Yes | — | — | Amount in base currency | Confidential |
| `financial_dimensions` | JSONB | No | `'{}'` | — | Dimensions: `{ cost_center, profit_center, department, ... }` | Confidential |
| `event_timestamp` | TIMESTAMPTZ | Yes | `NOW()` | — | Event time (per Part 11: "Timestamp") | Internal |
| `posting_status` | ENUM | Yes | `PENDING` | PENDING, POSTED, FAILED, CANCELLED (per Part 11: "Posting Status") | Status | Internal |
| `posting_rule_id` | UUID | No | NULL | FK to `posting_rules` (Entity 296) | Rule used for posting | Internal |
| `journal_entry_id` | UUID | No | NULL | FK to `journal_entries` (Entity 294) | Generated journal | Confidential |
| `error_message` | TEXT | No | NULL | — | Error (if FAILED) | Internal |
| `posted_at` | TIMESTAMPTZ | No | NULL | — | When posted | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `event_timestamp` (per Part 11 Performance Strategy)
- **Index**: `uq_ae_event_number_company`, `idx_ae_module`, `idx_ae_source_doc`, `idx_ae_posting_status`, `idx_ae_timestamp`, `idx_ae_event_type`
- **Validation**: Immutable after POSTED; `amount_base_currency` = `amount * exchange_rate` if non-base
- **API**: `/api/v1/accounting-events` (GET, POST — from modules), `/:id/post` (POST — trigger posting), `/:id/cancel` (POST), `/pending` (GET)
- **Integration**: Every operational module calls `AccountingEventService.create()` — never writes to GL directly
- **AI**: Anomaly Detection (detect unusual events), Posting Error Prediction, Duplicate Event Detection

---

## Entity 289 — Accounting Policy

### 1. Business Purpose
Enterprise accounting configuration. Per Part 11: Inventory Valuation (FIFO, Weighted Avg, Standard Cost), Revenue Recognition, Expense Recognition, Depreciation Method, Tax Rules. *"Version controlled."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Confidential |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 11) | Public |
| `policy_category` | ENUM | Yes | — | INVENTORY_VALUATION, REVENUE_RECOGNITION, EXPENSE_RECOGNITION, DEPRECIATION, TAX, INTERCOMPANY, CONSOLIDATION, OTHER | Category | Confidential |
| `policy_value` | JSONB | Yes | `'{}'` | — | Policy configuration: `{ method: "FIFO", parameters: {...} }` (per Part 11) | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `version_number` | INTEGER | Yes | `1` | ≥ 1 | Version (per Part 11: "Version controlled") | Internal |
| `previous_version_id` | UUID | No | NULL | FK self-ref | Previous version | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver (CFO) | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 290 — Finance Dashboard

### 1. Business Purpose
Per Part 11: Cash Position, Receivables, Payables, Today's Revenue/Expenses, Pending Journals, Budget Variance, Net Profit, Working Capital, Cash Flow.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `cash_position` | DECIMAL(18,4) | Yes | `0` | — | Cash (per Part 11: "Cash Position") | Confidential |
| `receivables_total` | DECIMAL(18,4) | Yes | `0` | — | AR (per Part 11: "Receivables") | Confidential |
| `payables_total` | DECIMAL(18,4) | Yes | `0` | — | AP (per Part 11: "Payables") | Confidential |
| `revenue_today` | DECIMAL(18,4) | Yes | `0` | — | Revenue (per Part 11: "Today's Revenue") | Confidential |
| `expenses_today` | DECIMAL(18,4) | Yes | `0` | — | Expenses (per Part 11: "Today's Expenses") | Confidential |
| `pending_journals` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 11: "Pending Journals") | Internal |
| `budget_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Variance (per Part 11: "Budget Variance") | Confidential |
| `net_profit` | DECIMAL(18,4) | Yes | `0` | — | Net profit (per Part 11: "Net Profit") | Confidential |
| `working_capital` | DECIMAL(18,4) | Yes | `0` | — | Working capital (per Part 11: "Working Capital") | Confidential |
| `cash_flow_today` | DECIMAL(18,4) | Yes | `0` | — | Cash flow (per Part 11: "Cash Flow") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI financial insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## SECTION 2: Chart of Accounts (COA), General Ledger & Journal Engine (Entities 291-300)

---

## Entity 291 — Chart of Accounts (COA)

### 1. Business Purpose
Defines every financial account. Per Part 11: Account Types — Assets, Liabilities, Equity, Revenue, Expense, Memo, Control. *"Account Codes are immutable. Version controlled."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `account_code` | VARCHAR(30) | Yes | — | Unique per company, immutable | Account code (per Part 11: "account_code") | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `account_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 11: "account_name") | Confidential |
| `account_type` | ENUM | Yes | — | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE, MEMO, CONTROL (per Part 11: "account_type") | Type | Confidential |
| `account_group_id` | UUID | No | NULL | FK to `account_groups` (Entity 292) | Group | Internal |
| `parent_account_id` | UUID | No | NULL | FK self-ref | Parent (per Part 11: "parent_account") | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency (per Part 11: "currency") | Internal |
| `is_posting_allowed` | BOOLEAN | Yes | `true` | — | Can receive postings (per Part 11: "posting_allowed") | Confidential |
| `is_reconciliation_account` | BOOLEAN | Yes | `false` | — | Requires reconciliation | Internal |
| `version_number` | INTEGER | Yes | `1` | ≥ 1 | Version (per Part 11: "Version controlled") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status (per Part 11: "status") | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 292 — Account Group

### 1. Business Purpose
Groups accounts. Per Part 11: Current Assets, Fixed Assets, Current Liabilities, Long-Term Liabilities, Sales Revenue, Operating Expenses, Taxes, Inventory, Payroll.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `group_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `group_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 11) | Public |
| `account_type` | ENUM | Yes | — | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE, MEMO, CONTROL | Must match child accounts | Internal |
| `parent_group_id` | UUID | No | NULL | FK self-ref | Parent group (hierarchy) | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `is_balance_sheet` | BOOLEAN | Yes | `false` | — | Appears on Balance Sheet | Internal |
| `is_profit_loss` | BOOLEAN | Yes | `false` | — | Appears on P&L | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 293 — General Ledger Account

### 1. Business Purpose
Posting account with running balances. Per Part 11: Opening Balance, Debit, Credit, Closing Balance, Current Balance. Supports Daily/Monthly/Yearly Balance. This is **Layer 2** of the Three-Layer Financial Architecture.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `coa_id` | UUID | Yes | — | FK to `chart_of_accounts` (Entity 291) | Linked COA account | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | Fiscal year | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period (e.g., "2026-04") | Internal |
| `opening_balance` | DECIMAL(18,4) | Yes | `0` | — | Opening (per Part 11: "Opening Balance") | Confidential |
| `total_debit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Debits (per Part 11: "Debit") | Confidential |
| `total_credit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Credits (per Part 11: "Credit") | Confidential |
| `closing_balance` | DECIMAL(18,4) | Yes | `0` | Generated: `opening + debit - credit` (for debit accounts) or `opening + credit - debit` (for credit accounts) | Closing (per Part 11: "Closing Balance") | Confidential |
| `current_balance` | DECIMAL(18,4) | Yes | `0` | — | Real-time balance (per Part 11: "Current Balance") | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `base_currency_balance` | DECIMAL(18,4) | Yes | `0` | — | Balance in base currency | Confidential |
| `journal_entry_count` | INTEGER | Yes | `0` | ≥ 0 | Total journal entries | Internal |
| `last_posted_at` | TIMESTAMPTZ | No | NULL | — | Last journal post | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 294 — Journal Entry

### 1. Business Purpose
Financial transaction. Per Part 11: Status — Draft, Pending Approval, Approved, Posted, Reversed, Cancelled. This is **Layer 1** of the Three-Layer Architecture (immutable after POSTED).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `journal_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 11: "Journal Number") | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company (per Part 11: "Company") | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY (per Part 11: "Period") | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `journal_type` | ENUM | Yes | — | GENERAL, PURCHASE, SALES, INVENTORY, PRODUCTION, PAYROLL, DEPRECIATION, TAX, INTERCOMPANY, ADJUSTMENT, REVERSAL, OPENING_BALANCE, CLOSING, YEAR_END (per Part 11: "Enterprise Journal Types") | Type | Internal |
| `posting_date` | DATE | Yes | — | Must be in open period | Posting date (per Part 11: "Posting Date") | Internal |
| `reference_number` | VARCHAR(50) | No | NULL | — | Reference (per Part 11: "Reference") | Internal |
| `source_module` | VARCHAR(30) | No | NULL | — | Source module (per Part 11: "Source Module") | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` (Entity 288) | Source event | Confidential |
| `total_debit` | DECIMAL(18,4) | Yes | `0` | — | Total debit | Confidential |
| `total_credit` | DECIMAL(18,4) | Yes | `0` | — | Total credit | Confidential |
| `is_balanced` | BOOLEAN | Yes | `false` | Generated: `total_debit = total_credit` | Balanced (per Part 11: "Debit = Credit mandatory") | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `reversed_by_journal_id` | UUID | No | NULL | FK self-ref | Reversal journal | Confidential |
| `is_reversed` | BOOLEAN | Yes | `false` | — | Reversed flag | Confidential |
| `reversal_reason` | TEXT | No | NULL | Required if `is_reversed = true` | Reversal reason | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `posted_at` | TIMESTAMPTZ | No | NULL | — | Posting time | Internal |
| `journal_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, POSTED, REVERSED, CANCELLED (per Part 11: "Journal Status") | Status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `posting_date` (per Part 11 Performance Strategy)
- **Validation**: `total_debit = total_credit` (double-entry); `posting_date` must be in OPEN period; immutable after POSTED
- **Index**: `uq_je_journal_number_company`, `idx_je_company_period`, `idx_je_type`, `idx_je_status`, `idx_je_posting_date`, `idx_je_source_module`
- **Audit**: Full; immutable after POSTED; reversal creates new journal (never edits posted)

---

## Entity 295 — Journal Line

### 1. Business Purpose
Debit/Credit details. Per Part 11: *"Debit = Credit mandatory."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `journal_entry_id` | UUID | Yes | — | FK to `journal_entries` | Parent journal | Confidential |
| `line_number` | INTEGER | Yes | — | > 0, unique per journal | Line number | Internal |
| `gl_account_id` | UUID | Yes | — | FK to `chart_of_accounts` (posting allowed only) | GL account (per Part 11: "GL Account") | Confidential |
| `debit_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Debit (per Part 11: "Debit") | Confidential |
| `credit_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Credit (per Part 11: "Credit") | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency (per Part 11: "Currency") | Internal |
| `exchange_rate` | DECIMAL(12,6) | No | `1.000000` | > 0 | FX rate (per Part 11: "Exchange Rate") | Confidential |
| `base_currency_debit` | DECIMAL(18,4) | Yes | `0` | — | Debit in base currency | Confidential |
| `base_currency_credit` | DECIMAL(18,4) | Yes | `0` | — | Credit in base currency | Confidential |
| `financial_dimensions` | JSONB | No | `'{}'` | — | Dimensions: `{ cost_center, profit_center, dept, ... }` (per Part 11: "Financial Dimensions") | Confidential |
| `narration` | TEXT | Yes | — | Min 5 chars | Description (per Part 11: "Narration") | Internal |
| `line_status` | ENUM | Yes | `ACTIVE` | ACTIVE, REVERSED | Status | Internal |

### 5-16. Standard Pattern
- **Validation**: `debit_amount` or `credit_amount` must be > 0 (not both, not neither); `base_currency = amount * exchange_rate`
- **Immutable**: After parent journal is POSTED, lines are immutable

---

## Entity 296 — Posting Rule

### 1. Business Purpose
**Universal Posting Rules Engine** — automatic accounting mapping. Per Part 11: Converts Accounting Events to Journal Entries. This is the **configurable bridge** between operations and finance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rule_code` | VARCHAR(30) | Yes | — | Unique per company | Rule code | Confidential |
| `rule_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Confidential |
| `source_module` | ENUM | Yes | — | PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, HR, MAINTENANCE, INVENTORY, QUALITY | Source module (per Part 11: "Business Event") | Internal |
| `event_type` | VARCHAR(50) | Yes | — | — | Event type to match (e.g., "GOODS_RECEIPT", "RETAIL_SALE") | Internal |
| `debit_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | Debit account (per Part 11: "Debit") | Confidential |
| `credit_account_id` | UUID | Yes | — | FK to `chart_of_accounts` | Credit account (per Part 11: "Credit") | Confidential |
| `debit_account_type` | ENUM | Yes | `FIXED` | FIXED, DYNAMIC, DIMENSION_BASED | How debit account is determined | Internal |
| `credit_account_type` | ENUM | Yes | `FIXED` | FIXED, DYNAMIC, DIMENSION_BASED | How credit account is determined | Internal |
| `debit_account_resolver` | TEXT | No | NULL | — | JS/SQL expression for dynamic resolution | Confidential |
| `credit_account_resolver` | TEXT | No | NULL | — | JS/SQL expression for dynamic resolution | Confidential |
| `amount_source` | ENUM | Yes | `EVENT_AMOUNT` | EVENT_AMOUNT, LINE_AMOUNT, CALCULATED | Amount source | Internal |
| `amount_formula` | TEXT | No | NULL | — | Calculation formula (if CALCULATED) | Confidential |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `version_number` | INTEGER | Yes | `1` | ≥ 1 | Version | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | CFO approval | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 297 — Journal Template

### 1. Business Purpose
Reusable journals. Per Part 11: Monthly Rent, Salary, Depreciation, Interest, Insurance, Utility Bills. Supports recurring journals.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `template_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `template_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `template_type` | ENUM | Yes | `RECURRING` | RECURRING, STANDARD, REVERSAL | Type | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `journal_type` | ENUM | Yes | `GENERAL` | Same as Entity 294 | Journal type | Internal |
| `template_lines` | JSONB | Yes | `'[]'` | — | Array of `{ gl_account_id, debit, credit, narration, dimensions }` | Confidential |
| `recurrence_frequency` | ENUM | No | NULL | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Frequency (per Part 11: "Recurring journals") | Internal |
| `recurrence_day` | INTEGER | No | NULL | 1-31 | Day of month | Internal |
| `last_generated_at` | TIMESTAMPTZ | No | NULL | — | Last auto-generation | Internal |
| `next_generation_date` | DATE | No | NULL | — | Next scheduled | Internal |
| `is_auto_post` | BOOLEAN | Yes | `false` | — | Auto-post on generation | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 298 — Fiscal Period Control

### 1. Business Purpose
Controls posting periods per module. Per Part 11: Allow AP, AR, Inventory, Payroll, GL per period. *"Hard Closed periods reject posting."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `fiscal_calendar_id` | UUID | Yes | — | FK to `fiscal_calendars` (Entity 284) | Period | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `allow_ap_posting` | BOOLEAN | Yes | `true` | — | Allow AP (per Part 11: "Allow AP") | Confidential |
| `allow_ar_posting` | BOOLEAN | Yes | `true` | — | Allow AR (per Part 11: "Allow AR") | Confidential |
| `allow_inventory_posting` | BOOLEAN | Yes | `true` | — | Allow Inventory (per Part 11: "Allow Inventory") | Confidential |
| `allow_payroll_posting` | BOOLEAN | Yes | `true` | — | Allow Payroll (per Part 11: "Allow Payroll") | Confidential |
| `allow_gl_posting` | BOOLEAN | Yes | `true` | — | Allow GL (per Part 11: "Allow GL") | Confidential |
| `period_status` | ENUM | Yes | `OPEN` | OPEN, SOFT_CLOSE, HARD_CLOSE, LOCKED | Overall status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 299 — Trial Balance

### 1. Business Purpose
Financial validation. Per Part 11: Opening Balance, Debit, Credit, Closing Balance. Supports Monthly, Quarterly, Yearly.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `tb_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `fiscal_year` | INTEGER | Yes | — | YYYY | FY | Internal |
| `fiscal_period` | VARCHAR(10) | Yes | — | — | Period | Internal |
| `tb_type` | ENUM | Yes | `MONTHLY` | MONTHLY, QUARTERLY, YEARLY (per Part 11) | Type | Internal |
| `total_accounts` | INTEGER | Yes | `0` | ≥ 0 | Accounts included | Internal |
| `total_debit` | DECIMAL(18,4) | Yes | `0` | — | Total debit (per Part 11: "Debit") | Confidential |
| `total_credit` | DECIMAL(18,4) | Yes | `0` | — | Total credit (per Part 11: "Credit") | Confidential |
| `is_balanced` | BOOLEAN | Yes | `false` | Generated: `total_debit = total_credit` | Balanced | Internal |
| `balance_difference` | DECIMAL(18,4) | Yes | `0` | Generated: `total_debit - total_credit` | Difference | Confidential |
| `generated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Generation time | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 300 — Finance Posting Dashboard

### 1. Business Purpose
Per Part 11: Pending Journals, Posted Today, Posting Errors, Trial Balance, Open Periods, Journal Queue, Approval Queue, Financial Health.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `pending_journals` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 11: "Pending Journals") | Internal |
| `posted_today` | INTEGER | Yes | `0` | ≥ 0 | Posted (per Part 11: "Posted Today") | Internal |
| `posting_errors` | INTEGER | Yes | `0` | ≥ 0 | Errors (per Part 11: "Posting Errors") | Confidential |
| `trial_balance_balanced` | BOOLEAN | Yes | `false` | — | TB status (per Part 11: "Trial Balance") | Internal |
| `open_periods_count` | INTEGER | Yes | `0` | ≥ 0 | Open periods (per Part 11: "Open Periods") | Internal |
| `journal_queue_depth` | INTEGER | Yes | `0` | ≥ 0 | Queue (per Part 11: "Journal Queue") | Internal |
| `approval_queue_count` | INTEGER | Yes | `0` | ≥ 0 | Approvals (per Part 11: "Approval Queue") | Internal |
| `financial_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Health (per Part 11: "Financial Health") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI posting insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
