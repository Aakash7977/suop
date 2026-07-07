# Manual 1 · Part 5 · Entities 31-33 — Supplier Triad (Master, Qualification, Performance)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 5 — Procurement & Supplier Domain |
| Entities | Supplier Master (031), Supplier Qualification (032), Supplier Performance (033) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §2.2, Ch 2 §2.3, Ch 4 §4.4, Ch 7 §7.4, Ch 18 §18.5 |
| Last Updated | 2026-07-07 |

---

## Overview — Supplier Triad Architecture

The Supplier Triad is the **vendor management foundation** of SUOP's procurement domain. Three tightly-coupled entities:

```
Supplier Master (031)
  │ — Who the supplier is (legal, contact, commercial)
  ├── Supplier Qualification (032)
  │    — Compliance verification (FSSAI, GST, ISO, NDA, insurance)
  └── Supplier Performance (033)
       — Ongoing performance measurement (delivery, quality, price, responsiveness)
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Single Supplier Master** | One supplier = one record, even if supplying multiple product types |
| **Multi-type suppliers** | A supplier can supply RAW_MATERIAL + PACKAGING + SERVICE (via `supplier_types[]` array) |
| **Qualification is mandatory** | No Purchase Order without ACTIVE qualification (per Ch 5 §5.3 Source-to-Stock) |
| **Performance is continuous** | Auto-computed from GRN history + QC results + delivery timeliness |
| **Strategic Sourcing ready** | Schema reserves fields for Blanket POs, AVL, Contracts (per Enterprise Architect Enhancement) |

---

## Entity 031 — Supplier Master

### 1. Business Purpose

The `Supplier` entity represents an **approved vendor** supplying goods or services to Sudhastar. Per Volume 0 Chapter 1 §2.2, suppliers include:

- **Raw Material Suppliers** — sugar, ghee, dry fruits, flour, milk
- **Packaging Suppliers** — boxes, wrappers, labels, films
- **Transport Vendors** — logistics providers
- **Service Providers** — cleaning, maintenance, consulting
- **Machinery Vendors** — equipment suppliers
- **Chemical Suppliers** — production chemicals
- **Contract Manufacturers** — outsourced manufacturing

Supplier Master is the **single source of truth for vendor data** — every Purchase Order, GRN, payment, and performance metric references it. It holds legal identity (GSTIN, PAN), commercial terms (payment terms, currency, lead time), and operational attributes (preferred status, rating).

Per Volume 0 Chapter 7 §7.4, Supplier Master is owned by the Procurement department. Per Chapter 4 §4.4, it inherits the Universal Base Entity. Per Chapter 7 §7.6, supplier-related specifications may be versioned (e.g., contract terms).

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Procurement Head |
| Data Owner | Procurement Head |
| Technical Owner | Backend Lead — Procurement Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `suppliers` |
| Prisma Model | `Supplier` |
| File Location | `prisma/schema/master/procurement/supplier.prisma` |
| Partitioning | None (medium volume — max ~5,000 suppliers) |
| Lifecycle | 8-stage Master Data Lifecycle (per Ch 7 §7.5) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `SUP-` | Supplier code (e.g., `SUP-000001`) — **immutable after activation** |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — Supplier is company-wide (facility-specific terms via `supplier_facility_overrides`) |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle (DRAFT, SUBMITTED, REVIEWED, APPROVED, PUBLISHED, ACTIVE, INACTIVE, ARCHIVED) | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification (UTC) |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Supplier Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `supplier_name` | VARCHAR(250) | Yes | — | Min 3, max 250, unique per company | Legal entity name (e.g., "Mursaleen Traders Pvt Ltd") | Public | — |
| `supplier_name_short` | VARCHAR(80) | Yes | — | Min 2, max 80 | Short name (e.g., "Mursaleen") | Public | — |
| `trade_name` | VARCHAR(250) | No | NULL | — | Trade/brand name if different from legal | Public | — |
| `description` | TEXT | No | NULL | — | Detailed description of supplier | Internal | — |
| `supplier_types` | TEXT[] | Yes | — | Non-empty subset of: RAW_MATERIAL, PACKAGING, SERVICE, TRANSPORT, MACHINERY, CHEMICAL, CONTRACT_MANUFACTURER, TRADING, CLEANING, OTHER | Supplier type(s) — multi-type supported | Internal | Vendor AI |
| `supplier_category_id` | UUID | No | NULL | FK to `supplier_categories.id` | Category for grouping | Internal | — |
| `is_preferred` | BOOLEAN | Yes | `false` | — | Preferred supplier (priority in RFQ/PO) | Internal | Vendor AI |
| `is_strategic` | BOOLEAN | Yes | `false` | — | Strategic supplier (long-term partnership) | Confidential | Strategic AI |
| `is_blacklisted` | BOOLEAN | Yes | `false` | — | Blacklisted (cannot receive new POs) | Confidential | Risk AI |
| `blacklist_reason` | VARCHAR(200) | No | NULL | Required if `is_blacklisted = true` | Blacklist reason | Confidential | — |
| `blacklisted_at` | TIMESTAMPTZ | No | NULL | — | Blacklist timestamp | Internal | — |
| `blacklisted_by` | UUID | No | NULL | FK to `user_accounts.id` | Who blacklisted | Internal | — |

#### 4.3 Legal & Tax Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `gstin` | VARCHAR(15) | Yes | — | Format `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`, unique per company, GSTIN checksum valid | GST Identification Number | Confidential |
| `pan` | VARCHAR(10) | Yes | — | Format `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`, unique per company | Permanent Account Number | Confidential |
| `tan` | VARCHAR(10) | No | NULL | Format `^[A-Z]{4}[0-9]{5}[A-Z]{1}$` | Tax Deduction Account Number | Confidential |
| `msme_registration_no` | VARCHAR(20) | No | NULL | — | MSME registration (for payment terms compliance) | Confidential |
| `msme_type` | ENUM | No | NULL | MICRO, SMALL, MEDIUM, NULL | MSME classification | Confidential |
| `cin` | VARCHAR(21) | No | NULL | Format for companies | Corporate Identity Number (for companies) | Internal |
| `fssai_license_no` | VARCHAR(17) | No | NULL | Format `^[0-9]{14}$` | FSSAI license (for food suppliers — per Ch 18 §18.7) | Confidential |
| `fssai_license_expiry` | DATE | No | NULL | Must be future if set | FSSAI license expiry | Internal |
| `iec_code` | VARCHAR(10) | No | NULL | — | Importer Exporter Code (for import/export suppliers) | Confidential |
| `website` | VARCHAR(200) | No | NULL | URL format | Supplier website | Public |

#### 4.4 Contact Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `primary_contact_person` | VARCHAR(150) | Yes | — | Min 3 | Primary contact name | Internal |
| `primary_contact_designation` | VARCHAR(100) | No | NULL | — | Designation | Internal |
| `primary_email` | VARCHAR(150) | Yes | — | Email format | Primary email | Internal |
| `primary_phone` | VARCHAR(20) | Yes | — | E.164 format | Primary phone | Internal |
| `secondary_contact_person` | VARCHAR(150) | No | NULL | — | Secondary contact | Internal |
| `secondary_email` | VARCHAR(150) | No | NULL | Email format | Secondary email | Internal |
| `secondary_phone` | VARCHAR(20) | No | NULL | E.164 format | Secondary phone | Internal |
| `accounts_contact_person` | VARCHAR(150) | No | NULL | — | Accounts contact | Confidential |
| `accounts_email` | VARCHAR(150) | No | NULL | Email format | Accounts email | Confidential |
| `accounts_phone` | VARCHAR(20) | No | NULL | E.164 format | Accounts phone | Confidential |

#### 4.5 Address Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `address_line1` | VARCHAR(200) | Yes | — | Min 5 chars | Registered address | Internal |
| `address_line2` | VARCHAR(200) | No | NULL | — | Address line 2 | Internal |
| `city` | VARCHAR(100) | Yes | — | — | City | Public |
| `state` | VARCHAR(50) | Yes | — | Valid state | State | Public |
| `country` | CHAR(2) | Yes | `IN` | ISO 3166-1 alpha-2 | Country | Public |
| `pincode` | VARCHAR(10) | Yes | — | Regex per country | PIN code | Internal |
| `gst_state_code` | CHAR(2) | Yes | — | First 2 digits of GSTIN | GST state code (auto-derived) | Internal |
| `is_interstate` | BOOLEAN | Yes | — | Generated: `gst_state_code != company.gst_state_code` | Interstate supplier (affects tax) | Internal |

#### 4.6 Commercial Terms Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `default_payment_terms_id` | UUID | Yes | — | FK to `payment_terms.id` | Default payment terms | Confidential | — |
| `default_currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Default currency | Internal | — |
| `default_lead_time_days` | INTEGER | Yes | `7` | ≥ 0 | Standard lead time (per Ch 5 §5.18 KPI) | Internal | Lead time AI |
| `minimum_order_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Minimum order value | Confidential | — |
| `credit_limit` | DECIMAL(18,4) | No | NULL | ≥ 0 | Credit limit (per Finance) | Confidential | Risk AI |
| `outstanding_payable` | DECIMAL(18,4) | No | `0` | ≥ 0 | Current outstanding (denormalized from AP) | Confidential | Risk AI |
| `available_credit` | DECIMAL(18,4) | No | — | Generated: `credit_limit - outstanding_payable` | Available credit | Confidential | — |
| `default_discount_pct` | DECIMAL(5,2) | No | `0` | 0–100 | Default discount percentage | Confidential | — |
| `price_list_id` | UUID | No | NULL | FK to `price_lists.id` | Default price list | Confidential | — |

#### 4.7 Performance Summary (Denormalized from Supplier Performance entity)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `overall_rating` | DECIMAL(5,2) | No | NULL | 0–100 | Overall performance rating (denormalized) | Internal | Vendor AI |
| `on_time_delivery_pct` | DECIMAL(5,2) | No | NULL | 0–100 | On-time delivery percentage (denormalized) | Internal | Risk AI |
| `quality_score` | DECIMAL(5,2) | No | NULL | 0–100 | Quality score (denormalized) | Internal | — |
| `rejection_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Rejection percentage (denormalized) | Internal | — |
| `total_pos_value` | DECIMAL(18,4) | No | `0` | ≥ 0 | Total PO value YTD (denormalized) | Confidential | Spend AI |
| `total_pos_count` | INTEGER | No | `0` | ≥ 0 | Total PO count YTD | Internal | — |
| `last_po_date` | DATE | No | NULL | — | Last PO date | Internal | — |
| `last_grn_date` | DATE | No | NULL | — | Last GRN date | Internal | — |
| `last_rating_calculated_at` | TIMESTAMPTZ | No | NULL | — | When rating last recalculated | Internal | — |

#### 4.8 Banking Fields (for Accounts Payable)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `bank_name` | VARCHAR(100) | No | NULL | — | Bank name | **Restricted** |
| `bank_account_number` | VARCHAR(30) | No | NULL | — | Account number (encrypted at rest) | **Restricted** |
| `bank_ifsc_code` | VARCHAR(11) | No | NULL | Format `^[A-Z]{4}0[A-Z0-9]{6}$` | IFSC code | **Restricted** |
| `bank_branch` | VARCHAR(100) | No | NULL | — | Branch | **Restricted** |
| `upi_id` | VARCHAR(50) | No | NULL | — | UPI ID | **Restricted** |
| `is_bank_verified` | BOOLEAN | Yes | `false` | — | Bank details verified flag | Confidential |

#### 4.9 Strategic Sourcing Fields (Future-Ready per Enhancement)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `has_blanket_agreement` | BOOLEAN | Yes | `false` | — | Whether blanket PO agreement exists | Internal |
| `contract_id` | UUID | No | NULL | FK to `vendor_contracts.id` (future) | Active contract reference | Confidential |
| `is_in_avl` | BOOLEAN | Yes | `true` | — | In Approved Vendor List | Internal |
| `avl_category_ids` | UUID[] | No | `ARRAY[]::UUID[]` | FK array to `supplier_categories.id` | AVL categories | Internal |
| `preferred_for_products` | UUID[] | No | `ARRAY[]::UUID[]` | FK array to `products.id` | Products this supplier is preferred for | Internal |

#### 4.10 Status & Lifecycle

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `is_active` | BOOLEAN | Yes | `true` | — | Active flag | Public |
| `is_archived` | BOOLEAN | Yes | `false` | — | Archived flag | Internal |
| `onboarded_date` | DATE | No | NULL | — | Date supplier was onboarded | Internal |
| `exit_date` | DATE | No | NULL | — | Date supplier exited (if INACTIVE) | Internal |
| `exit_reason` | VARCHAR(200) | No | NULL | Required if status = INACTIVE | Exit reason | Internal |

#### 4.11 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields for supplier-specific attributes | Internal |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal |

---

## 5. Relationships

### 5.1 Inbound Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Supplier → Company | N : 1 | `company_id` | RESTRICT |
| Supplier → SupplierCategory | N : 1 | `supplier_category_id` | SET NULL |
| Supplier → PaymentTerms | N : 1 | `default_payment_terms_id` | RESTRICT |
| Supplier → Currency | N : 1 | `default_currency_code` | RESTRICT |
| Supplier → PriceList | N : 1 | `price_list_id` | SET NULL |
| Supplier → VendorContract | N : 1 | `contract_id` | SET NULL |

### 5.2 Outbound Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Supplier → SupplierQualification | 1 : N | `supplier_qualifications.supplier_id` | CASCADE |
| Supplier → SupplierPerformance | 1 : N | `supplier_performances.supplier_id` | CASCADE |
| Supplier → SupplierFacilityOverride | 1 : N | `supplier_facility_overrides.supplier_id` | CASCADE |
| Supplier → PurchaseOrder | 1 : N | `purchase_orders.supplier_id` | RESTRICT |
| Supplier → GoodsReceiptNote | 1 : N | `goods_receipt_notes.supplier_id` | RESTRICT |
| Supplier → PurchaseReturn | 1 : N | `purchase_returns.supplier_id` | RESTRICT |
| Supplier → RFQ | 1 : N | `rfqs.supplier_id` (or via join table for multi-supplier RFQ) | SET NULL |
| Supplier → VendorQuotation | 1 : N | `vendor_quotations.supplier_id` | CASCADE |
| Supplier → Batch (procured) | 1 : N | `batches.supplier_id` | SET NULL |
| Supplier → FileAttachment | 1 : N | `file_attachments.entity_id` (where entity_type=SUPPLIER) | SET NULL |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_suppliers` | PRIMARY KEY | `id` | Default PK |
| `uq_suppliers_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_suppliers_name_company` | UNIQUE PARTIAL | `company_id, supplier_name WHERE deleted_at IS NULL` | Name uniqueness |
| `uq_suppliers_gstin` | UNIQUE PARTIAL | `company_id, gstin WHERE deleted_at IS NULL` | GSTIN uniqueness (per Part 5 business rules) |
| `uq_suppliers_pan` | UNIQUE PARTIAL | `company_id, pan WHERE deleted_at IS NULL` | PAN uniqueness |
| `uq_suppliers_fssai` | UNIQUE PARTIAL | `fssai_license_no WHERE fssai_license_no IS NOT NULL AND deleted_at IS NULL` | FSSAI uniqueness |
| `idx_suppliers_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_suppliers_type` | GIN | `supplier_types` | Array containment (find RAW_MATERIAL suppliers) |
| `idx_suppliers_preferred` | PARTIAL | `company_id WHERE is_preferred = true AND status = 'ACTIVE'` | Preferred suppliers |
| `idx_suppliers_strategic` | PARTIAL | `company_id WHERE is_strategic = true AND status = 'ACTIVE'` | Strategic suppliers |
| `idx_suppliers_blacklisted` | PARTIAL | `company_id WHERE is_blacklisted = true` | Blacklisted suppliers |
| `idx_suppliers_rating` | B-TREE | `overall_rating DESC NULLS LAST WHERE status = 'ACTIVE'` | Top-rated suppliers |
| `idx_suppliers_search` | GIN | `to_tsvector('english', supplier_name \|\| ' ' \|\| supplier_name_short \|\| ' ' \|\| code \|\| ' ' \|\| gstin)` | Full-text search (per Ch 7 §7.15) |
| `idx_suppliers_tags` | GIN | `tags` | Tag-based filtering |
| `idx_suppliers_avl_products` | GIN | `preferred_for_products` | Find preferred suppliers for a product |

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` must be unique per company | DB + App | Unique constraint |
| 2 | `supplier_name` must be unique per company (active) | DB | Unique partial |
| 3 | `gstin` must be unique per company (active) and pass checksum validation | DB + App | Unique + custom validator |
| 4 | `pan` must be unique per company (active) | DB | Unique partial |
| 5 | `code` is **immutable** after `status = ACTIVE` | App | Service-layer + audit |
| 6 | `gstin` first 2 digits must match `gst_state_code` | App | Zod schema |
| 7 | `gst_state_code` auto-derived from `gstin` first 2 digits | App | Service-layer |
| 8 | `is_interstate` auto-computed: `gst_state_code != company.gst_state_code` | App | Trigger |
| 9 | `is_blacklisted = true` requires `blacklist_reason` | DB | CHECK constraint |
| 10 | Inactive suppliers cannot receive new Purchase Orders | App | Service-layer validation on PO create |
| 11 | Blacklisted suppliers cannot receive new POs | App | Service-layer validation |
| 12 | State transition DRAFT → SUBMITTED requires `supplier_name`, `gstin`, `pan`, `supplier_types`, `address_line1`, `city`, `state`, `primary_contact_person`, `primary_email`, `primary_phone`, `default_payment_terms_id` | App | Master Data Quality Validator |
| 13 | State transition APPROVED → PUBLISHED requires Supplier Qualification ACTIVE | App | Cross-entity validation |
| 14 | `available_credit` must be ≥ 0 (cannot exceed credit limit) | App | Service-layer (enforced at PO create) |
| 15 | `fssai_license_expiry` must be > today if set | App + DB | CHECK + Zod |
| 16 | Banking fields encrypted at rest (per Ch 23 §23.6) | App | Application-level encryption |
| 17 | `bank_ifsc_code` format validation | App | Zod schema |
| 18 | Cannot delete supplier with POs, GRNs, or outstanding payments | App | Referential integrity check |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/suppliers` | GET | List suppliers | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/:id` | GET | Get supplier details | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers` | POST | Create supplier (DRAFT) | `PROCUREMENT:CREATE` |
| `/api/v1/suppliers/:id` | PATCH | Update supplier | `PROCUREMENT:EDIT` |
| `/api/v1/suppliers/:id/submit` | POST | Submit for approval | `PROCUREMENT:EDIT` |
| `/api/v1/suppliers/:id/approve` | POST | Approve supplier | `PROCUREMENT:APPROVE` |
| `/api/v1/suppliers/:id/activate` | POST | Activate supplier | `PROCUREMENT:APPROVE` |
| `/api/v1/suppliers/:id/deactivate` | POST | Deactivate supplier | `PROCUREMENT:APPROVE` |
| `/api/v1/suppliers/:id/blacklist` | POST | Blacklist supplier | `PROCUREMENT:APPROVE` + Sensitive Operation |
| `/api/v1/suppliers/:id/whitelist` | POST | Remove from blacklist | `PROCUREMENT:APPROVE` + Sensitive Operation |
| `/api/v1/suppliers/:id/qualifications` | GET | List qualifications | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/:id/performance` | GET | Get performance scorecard | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/:id/purchase-orders` | GET | List POs for supplier | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/:id/grns` | GET | List GRNs for supplier | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/:id/ledger` | GET | Supplier transaction ledger | `PROCUREMENT:VIEW` + Finance scope |
| `/api/v1/suppliers/search` | GET | Search suppliers | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/preferred` | GET | List preferred suppliers | `PROCUREMENT:VIEW` |
| `/api/v1/suppliers/by-type/:type` | GET | List suppliers by type | `PROCUREMENT:VIEW` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Supplier List | AG Grid with multi-filter (type, status, rating, preferred) | `/procurement/suppliers` |
| Supplier Detail | Tabbed: Overview, Qualification, Performance, POs, GRNs, Banking, Audit | `/procurement/suppliers/:id` |
| Supplier Create Form | Multi-section: Identity, Legal, Contact, Address, Commercial, Banking | `/procurement/suppliers/new` |
| Supplier Approval Queue | Approval cards for pending suppliers | `/procurement/approvals/suppliers` |
| Supplier Performance Dashboard | Scorecards with trends | `/procurement/suppliers/:id/performance` |
| Preferred Suppliers | Filtered list of preferred suppliers | `/procurement/suppliers/preferred` |
| Blacklisted Suppliers | List with reasons | `/procurement/suppliers/blacklisted` |
| Supplier Comparison | Side-by-side comparison of 2-4 suppliers | `/procurement/suppliers/compare` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Supplier lookup | Search suppliers on mobile |
| Supplier info card | View contact, rating, lead time |
| Supplier visit documentation | Record notes/photos from supplier visits |
| GRN with supplier confirmation | Verify supplier at goods receipt |
| Supplier approval | L3+ approve supplier on mobile |
| Supplier certificate expiry alerts | Push notifications |

---

## 11. Reports

| Report | Use of Supplier |
|---|---|
| Supplier Master Report | Complete supplier list with all attributes |
| Vendor Performance Report | Per Ch 15 §15.9 — on-time delivery, quality, rejection rate |
| Procurement Spend Analysis | Spend per supplier, per category, per period |
| Supplier Rating Distribution | Suppliers grouped by rating tiers |
| Preferred Supplier Report | Preferred suppliers by category |
| Blacklisted Supplier Report | Blacklisted suppliers with reasons |
| Supplier Expiry Report | Certificates/licenses nearing expiry |
| Interstate Supplier Report | Suppliers by GST state (for tax planning) |
| MSME Supplier Report | MSME suppliers (for compliance) |
| Supplier Concentration Risk | Top suppliers by spend (risk analysis) |
| Lead Time Analysis | Per-supplier lead time trends |
| New Supplier Onboarding | Suppliers onboarded in period |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, gstin, pan, fssai, banking, is_blacklisted) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| BLACKLIST / WHITELIST | Yes | **Mandatory** | Permanent |
| ACTIVATE / DEACTIVATE | Yes | **Mandatory** | Permanent |
| DELETE (soft — only if no POs) | Yes | **Mandatory** | Permanent |
| EXPORT | Yes | **Mandatory** | 7 years |

**Audit Level**: Full

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `supplier_name`, `trade_name`, `supplier_types`, `website`, `city`, `state`, `country`, `is_active` | Public | All authenticated users |
| `code`, `description`, `supplier_category_id`, `is_preferred`, `is_strategic`, contact fields, address | Internal | L2+ Procurement, Operations |
| `gstin`, `pan`, `tan`, `cin`, `fssai_license_no`, `msme_*`, `iec_code` | Confidential | L2+ Procurement, Finance, Compliance |
| `default_payment_terms_id`, `credit_limit`, `outstanding_payable`, `default_discount_pct`, `price_list_id`, `total_pos_value` | Confidential | L2+ Finance, Procurement |
| Banking fields (`bank_*`, `upi_id`) | **Restricted** | L2+ Finance only (encrypted at rest per Ch 23 §23.6) |
| `is_blacklisted`, `blacklist_reason` | Confidential | L2+ Procurement, Compliance |
| `has_blanket_agreement`, `contract_id`, `is_in_avl` | Internal | L2+ Procurement |
| `overall_rating`, `on_time_delivery_pct`, `quality_score` | Internal | L2+ Procurement |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| **Vendor Recommendation AI** | Recommends best supplier for a product based on rating, price, lead time |
| **Supplier Risk Score AI** | Predicts supplier risk (financial, operational, quality) |
| **Lead Time Prediction AI** | Predicts actual lead time based on historical performance |
| **Price Trend Analysis AI** | Analyzes price trends per supplier |
| **Procurement Cost Optimization AI** | Identifies cost-saving opportunities (alternative suppliers, bulk discounts) |
| **Spend Forecasting AI** | Forecasts spend per supplier, per category |
| **Supplier Performance Prediction AI** | Predicts future performance based on trends |
| **Strategic Sourcing AI** | Recommends strategic partnerships, blanket agreements |
| **Blacklist Prediction AI** | Predicts suppliers at risk of blacklisting |
| **MSME Compliance AI** | Ensures MSME payment terms compliance (per Indian regulations) |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 5,000 per company |
| Cache strategy | Redis cache, TTL 1 hour, invalidated on update; performance summary cached separately with 15-min TTL |
| Query patterns | By `company_id + code`, `gstin`, `supplier_name` (full-text), `supplier_types` (array contains), `is_preferred`, `overall_rating` |
| Hot path: PO create | Supplier lookup by ID — cached |
| Hot path: GRN create | Supplier lookup by ID — cached |
| Banking fields | Encrypted at rest (per Ch 23 §23.6); decrypted only in Finance module |
| N+1 prevention | Eager-load `qualification`, `performance` when listing |

---

## 16. Example Records

### Example 1: Mursaleen Traders (Raw Material Supplier)

```json
{
  "id": "01928f7a-...-sup-001",
  "code": "SUP-000001",
  "company_id": "01928f7a-...-company",
  "supplier_name": "Mursaleen Traders Private Limited",
  "supplier_name_short": "Mursaleen",
  "trade_name": "Mursaleen Traders",
  "description": "Supplier of raw sugar, dry fruits, and ghee for manufacturing",
  "supplier_types": ["RAW_MATERIAL"],
  "is_preferred": true,
  "is_strategic": true,
  "is_blacklisted": false,
  "gstin": "27AAACM1234F1Z5",
  "pan": "AAACM1234F",
  "tan": "MUMM12345B",
  "msme_registration_no": null,
  "msme_type": null,
  "fssai_license_no": "10020065000123",
  "fssai_license_expiry": "2028-03-15",
  "website": "https://mursaleentraders.com",
  "primary_contact_person": "Mr. Abdul Mursaleen",
  "primary_contact_designation": "Managing Director",
  "primary_email": "abdul@mursaleentraders.com",
  "primary_phone": "+919876543210",
  "accounts_contact_person": "Mr. Imran Khan",
  "accounts_email": "accounts@mursaleentraders.com",
  "accounts_phone": "+912012345678",
  "address_line1": "123 Wholesale Market",
  "address_line2": "Mumbai APMC, Vashi",
  "city": "Navi Mumbai",
  "state": "Maharashtra",
  "country": "IN",
  "pincode": "400703",
  "gst_state_code": "27",
  "is_interstate": true,
  "default_payment_terms_id": "01928f7a-...-pt-net30",
  "default_currency_code": "INR",
  "default_lead_time_days": 7,
  "minimum_order_value": 10000.0000,
  "credit_limit": 500000.0000,
  "outstanding_payable": 125000.0000,
  "available_credit": 375000.0000,
  "default_discount_pct": 2.00,
  "overall_rating": 92.50,
  "on_time_delivery_pct": 94.00,
  "quality_score": 95.00,
  "rejection_pct": 1.50,
  "total_pos_value": 4500000.0000,
  "total_pos_count": 87,
  "last_po_date": "2026-07-01",
  "last_grn_date": "2026-07-05",
  "bank_name": "HDFC Bank",
  "bank_account_number": "ENC[AES256_BASE64]",
  "bank_ifsc_code": "HDFC0001234",
  "bank_branch": "Vashi Branch",
  "is_bank_verified": true,
  "has_blanket_agreement": true,
  "is_in_avl": true,
  "preferred_for_products": ["01928f7a-...-prod-sugar", "01928f7a-...-prod-ghee"],
  "is_active": true,
  "is_archived": false,
  "onboarded_date": "2024-04-15",
  "status": "ACTIVE",
  "version": 8,
  "tags": ["strategic", "preferred", "raw-material", "fssai-compliant"]
}
```

### Example 2: PackPro Industries (Packaging Supplier)

```json
{
  "id": "01928f7a-...-sup-002",
  "code": "SUP-000002",
  "company_id": "01928f7a-...-company",
  "supplier_name": "PackPro Industries LLP",
  "supplier_name_short": "PackPro",
  "supplier_types": ["PACKAGING"],
  "is_preferred": true,
  "gstin": "27AALFP9876B1Z2",
  "pan": "AALFP9876B",
  "default_lead_time_days": 14,
  "credit_limit": 200000.0000,
  "overall_rating": 88.00,
  "on_time_delivery_pct": 90.00,
  "quality_score": 92.00,
  "is_msme": true,
  "msme_type": "SMALL",
  "msme_registration_no": "MH1234567890",
  "status": "ACTIVE",
  "version": 3
}
```

### Example 3: Blacklisted Supplier

```json
{
  "id": "01928f7a-...-sup-003",
  "code": "SUP-000003",
  "company_id": "01928f7a-...-company",
  "supplier_name": "CheapPack Solutions",
  "supplier_types": ["PACKAGING"],
  "is_preferred": false,
  "is_strategic": false,
  "is_blacklisted": true,
  "blacklist_reason": "Repeated quality failures (3 batches rejected in 30 days) and unresponsive to CAPA requests. Quality score dropped below 60%.",
  "blacklisted_at": "2026-06-15T10:00:00Z",
  "blacklisted_by": "01928f7a-...-user-procurement-head",
  "overall_rating": 45.00,
  "quality_score": 52.00,
  "rejection_pct": 28.50,
  "status": "ACTIVE",
  "version": 12,
  "tags": ["blacklisted", "quality-issues"]
}
```

---

## Entity 032 — Supplier Qualification

### 1. Business Purpose

The `SupplierQualification` entity tracks **vendor onboarding compliance and ongoing certification**. Per Volume 0 Chapter 5 §5.3 (Source-to-Stock process), a supplier cannot receive Purchase Orders without ACTIVE qualification. This ensures:

- **Food safety compliance** — FSSAI license verified for food suppliers (per Ch 18 §18.7)
- **Tax compliance** — GSTIN verified
- **Quality standards** — ISO 22000, HACCP certificates for manufacturing suppliers
- **Legal protection** — NDA, insurance certificates
- **Operational readiness** — Bank details, audit completion

Qualification is **time-bound** — certificates expire and require revalidation. The Compliance Calendar (per Ch 18 §18.11) tracks expiry dates and triggers alerts.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Procurement Head |
| Data Owner | Procurement Head + Compliance Officer |
| Technical Owner | Backend Lead — Procurement Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `supplier_qualifications` |
| Prisma Model | `SupplierQualification` |
| Lifecycle | 8-stage master lifecycle + time-bound validity |

### 4. Field Dictionary

#### Universal Base + Qualification-Specific

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `QUAL-` | Qualification record code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id` | Qualified supplier |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, ACTIVE, EXPIRED, SUSPENDED, REJECTED | Qualification status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `qualification_type` | ENUM | Yes | — | INITIAL, PERIODIC_REVALIDATION, POST_INCIDENT, UPGRADE | Qualification trigger type |
| `qualification_date` | DATE | Yes | — | — | Date of qualification approval |
| `valid_from` | DATE | Yes | — | — | Qualification valid from |
| `valid_until` | DATE | Yes | — | > valid_from | Qualification valid until (per Ch 7 §7.11 effective dating) |
| `is_active` | BOOLEAN | Yes | `true` | — | Active flag |
| `fssai_verified` | BOOLEAN | Yes | `false` | — | FSSAI license verified |
| `fssai_license_no` | VARCHAR(17) | No | NULL | — | FSSAI license number (verified copy) |
| `fssai_expiry` | DATE | No | NULL | — | FSSAI expiry |
| `fssai_certificate_file_id` | UUID | No | NULL | FK to `file_attachments.id` | FSSAI certificate file |
| `gst_verified` | BOOLEAN | Yes | `false` | — | GST verified |
| `gst_certificate_file_id` | UUID | No | NULL | FK to `file_attachments.id` | GST certificate |
| `pan_verified` | BOOLEAN | Yes | `false` | — | PAN verified |
| `pan_card_file_id` | UUID | No | NULL | FK to `file_attachments.id` | PAN card file |
| `iso_22000_certified` | BOOLEAN | Yes | `false` | — | ISO 22000 certification |
| `iso_22000_certificate_no` | VARCHAR(50) | No | NULL | — | Certificate number |
| `iso_22000_expiry` | DATE | No | NULL | — | Expiry |
| `iso_22000_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Certificate file |
| `haccp_certified` | BOOLEAN | Yes | `false` | — | HACCP certification |
| `haccp_certificate_no` | VARCHAR(50) | No | NULL | — | Certificate number |
| `haccp_expiry` | DATE | No | NULL | — | Expiry |
| `haccp_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Certificate file |
| `gmp_certified` | BOOLEAN | Yes | `false` | — | GMP certification |
| `gmp_expiry` | DATE | No | NULL | — | Expiry |
| `gmp_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Certificate file |
| `nda_signed` | BOOLEAN | Yes | `false` | — | NDA signed |
| `nda_signed_date` | DATE | No | NULL | — | NDA date |
| `nda_file_id` | UUID | No | NULL | FK to `file_attachments.id` | NDA document |
| `insurance_verified` | BOOLEAN | Yes | `false` | — | Insurance verified |
| `insurance_provider` | VARCHAR(100) | No | NULL | — | Insurance provider |
| `insurance_coverage_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Coverage amount |
| `insurance_expiry` | DATE | No | NULL | — | Insurance expiry |
| `insurance_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Insurance certificate |
| `bank_details_verified` | BOOLEAN | Yes | `false` | — | Bank details verified |
| `bank_verification_date` | DATE | No | NULL | — | Verification date |
| `audit_completed` | BOOLEAN | Yes | `false` | — | Supplier audit completed |
| `audit_date` | DATE | No | NULL | — | Audit date |
| `audit_score` | DECIMAL(5,2) | No | NULL | 0–100 | Audit score |
| `audited_by` | UUID | No | NULL | FK to `user_accounts.id` | Auditor |
| `audit_report_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Audit report |
| `factory_visit_completed` | BOOLEAN | Yes | `false` | — | Factory visit done (for manufacturing suppliers) |
| `factory_visit_date` | DATE | No | NULL | — | Visit date |
| `factory_visit_report_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Visit report |
| `sample_test_passed` | BOOLEAN | Yes | `false` | — | Sample product test passed |
| `sample_test_date` | DATE | No | NULL | — | Test date |
| `sample_test_report_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Test report |
| `compliance_score` | DECIMAL(5,2) | No | NULL | 0–100 | Overall compliance score |
| `qualification_score` | DECIMAL(5,2) | No | NULL | 0–100 | Overall qualification score |
| `reviewed_by` | UUID | No | NULL | FK to `user_accounts.id` | Reviewer |
| `reviewed_at` | TIMESTAMPTZ | No | NULL | — | Review timestamp |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Approver |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp |
| `approval_comments` | TEXT | No | NULL | — | Approval comments |
| `rejection_reason` | TEXT | No | NULL | Required if status = REJECTED | Rejection reason |
| `suspension_reason` | TEXT | No | NULL | Required if status = SUSPENDED | Suspension reason |
| `next_review_date` | DATE | No | NULL | — | Next periodic review date |
| `remarks` | TEXT | No | NULL | — | Annotation |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | SupplierQualification → Company, Supplier, UserAccount (reviewer, approver, auditor), FileAttachment (multiple — one per certificate) |
| **Index** | `uq_qualifications_code_company`, `uq_qualifications_supplier_active` (one active per supplier), `idx_qualifications_status`, `idx_qualifications_expiry`, `idx_qualifications_expiring_soon` (partial) |
| **Validation** | `valid_until` > `valid_from`, only one ACTIVE qualification per supplier, FSSAI required for food suppliers, GST + PAN mandatory, audit required for manufacturing suppliers, all certificate expiry dates must be future when approved |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/suppliers/:id/qualifications` (GET, POST), `/api/v1/supplier-qualifications/:id` (GET, PATCH), `/api/v1/supplier-qualifications/:id/submit` (POST), `/api/v1/supplier-qualifications/:id/approve` (POST), `/api/v1/supplier-qualifications/:id/reject` (POST), `/api/v1/supplier-qualifications/:id/suspend` (POST), `/api/v1/supplier-qualifications/:id/revalidate` (POST), `/api/v1/supplier-qualifications/expiring` (GET) |
| **UI** | Qualification List per supplier, Qualification Detail (with document viewer), Qualification Wizard (multi-step), Expiring Qualifications Dashboard, Compliance Calendar integration |
| **Mobile** | View qualification status, document upload (certificate photos), expiry alerts, factory visit documentation |
| **Reports** | Supplier Qualification Report, Compliance Status Report, Expiring Certificates Report, Audit Score Report, Revalidation Due Report |
| **Audit** | Full; mandatory reason for suspension, rejection; all certificate changes audited |

### 13-16. Security / AI / Performance / Example

**Security**: Most fields Confidential (compliance documents); file attachments access-controlled.

**AI**: Compliance Prediction AI (predicts compliance risk), Revalidation Reminder AI, Audit Score Prediction AI.

**Performance**: < 2 per supplier (current + history); Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-qual-001",
  "code": "QUAL-2026-000001",
  "company_id": "01928f7a-...-company",
  "supplier_id": "01928f7a-...-sup-001",
  "qualification_type": "INITIAL",
  "qualification_date": "2024-04-15",
  "valid_from": "2024-04-15",
  "valid_until": "2027-04-14",
  "fssai_verified": true,
  "fssai_license_no": "10020065000123",
  "fssai_expiry": "2028-03-15",
  "gst_verified": true,
  "pan_verified": true,
  "iso_22000_certified": true,
  "iso_22000_certificate_no": "ISO22000-MUR-2024",
  "iso_22000_expiry": "2027-04-14",
  "haccp_certified": true,
  "haccp_expiry": "2027-04-14",
  "gmp_certified": true,
  "gmp_expiry": "2027-04-14",
  "nda_signed": true,
  "nda_signed_date": "2024-04-10",
  "insurance_verified": true,
  "insurance_coverage_amount": 5000000.0000,
  "insurance_expiry": "2027-04-14",
  "bank_details_verified": true,
  "audit_completed": true,
  "audit_date": "2024-04-12",
  "audit_score": 92.50,
  "factory_visit_completed": true,
  "factory_visit_date": "2024-04-05",
  "sample_test_passed": true,
  "sample_test_date": "2024-04-08",
  "compliance_score": 95.00,
  "qualification_score": 93.75,
  "approved_by": "01928f7a-...-user-procurement-head",
  "approved_at": "2024-04-15T10:00:00Z",
  "next_review_date": "2026-04-15",
  "status": "ACTIVE",
  "version": 2
}
```

---

## Entity 033 — Supplier Performance

### 1. Business Purpose

The `SupplierPerformance` entity records **ongoing performance measurement** for each supplier. Per Volume 0 Chapter 5 §5.18 (Process KPIs), supplier performance KPIs include:

- **On-Time Delivery** — % of deliveries on or before promised date
- **Quality Score** — % of GRNs that passed QC without rejection
- **Rejection %** — % of received quantity rejected
- **Price Stability** — price variation over time
- **Response Time** — average time to respond to RFQs
- **Complaint Count** — number of quality complaints
- **Audit Score** — most recent audit score
- **Overall Rating** — weighted composite score

Performance is **auto-computed** from GRN history, QC results, and PO data. It updates the `overall_rating` on Supplier Master (denormalized for fast lookup). Performance history is retained permanently for trend analysis.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Procurement Head |
| Data Owner | Procurement Head |
| Technical Owner | Backend Lead — Procurement Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `supplier_performances` |
| Prisma Model | `SupplierPerformance` |
| Partitioning | Monthly by `period_date` (high volume over time) |

### 4. Field Dictionary

#### Universal Base + Performance-Specific

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PERF-` | Performance record code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id` | Evaluated supplier |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `performance_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `period_type` | ENUM | Yes | — | MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, LIFETIME | Evaluation period |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | > period_start_date | Period end | Internal |
| `period_date` | DATE | Yes | — | Last day of period (for partitioning) | Period reference date | Internal |
| `total_pos` | INTEGER | Yes | `0` | ≥ 0 | Total POs in period | Internal |
| `total_pos_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total PO value | Confidential |
| `total_grns` | INTEGER | Yes | `0` | ≥ 0 | Total GRNs in period | Internal |
| `total_deliveries` | INTEGER | Yes | `0` | ≥ 0 | Total deliveries | Internal |
| `on_time_deliveries` | INTEGER | Yes | `0` | ≥ 0 | Deliveries on/before promised date | Internal |
| `late_deliveries` | INTEGER | Yes | `0` | ≥ 0 | Deliveries after promised date | Internal |
| `on_time_delivery_pct` | DECIMAL(5,2) | Yes | — | 0–100, Generated: `(on_time_deliveries / total_deliveries) * 100` | On-time delivery % | Internal | Risk AI |
| `avg_delay_days` | DECIMAL(5,2) | No | NULL | ≥ 0 | Average delay days for late deliveries | Internal |
| `total_qty_ordered` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity ordered | Internal |
| `total_qty_received` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity received | Internal |
| `total_qty_rejected` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total quantity rejected (QC fail) | Internal |
| `rejection_pct` | DECIMAL(5,2) | Yes | — | 0–100, Generated: `(total_qty_rejected / total_qty_received) * 100` | Rejection % | Internal |
| `quality_score` | DECIMAL(5,2) | Yes | — | 0–100, Generated: `100 - rejection_pct` | Quality score | Internal |
| `avg_qc_inspection_time_hours` | DECIMAL(8,2) | No | NULL | ≥ 0 | Average QC inspection time | Internal |
| `total_complaints` | INTEGER | Yes | `0` | ≥ 0 | Customer complaints linked to supplier | Internal |
| `complaint_resolution_avg_days` | DECIMAL(5,2) | No | NULL | ≥ 0 | Avg complaint resolution time | Internal |
| `total_rfq_invited` | INTEGER | Yes | `0` | ≥ 0 | RFQs invited to | Internal |
| `total_rfq_responded` | INTEGER | Yes | `0` | ≥ 0 | RFQs responded to | Internal |
| `rfq_response_rate` | DECIMAL(5,2) | Yes | — | 0–100 | RFQ response % | Internal |
| `avg_rfq_response_time_hours` | DECIMAL(8,2) | No | NULL | ≥ 0 | Avg RFQ response time | Internal |
| `price_variance_pct` | DECIMAL(5,2) | No | NULL | — | Price variation over period | Confidential |
| `price_trend` | ENUM | No | NULL | INCREASING, STABLE, DECREASING | Price trend direction | Confidential |
| `audit_score` | DECIMAL(5,2) | No | NULL | 0–100 | Latest audit score | Internal |
| `audit_date` | DATE | No | NULL | — | Latest audit date | Internal |
| `compliance_score` | DECIMAL(5,2) | No | NULL | 0–100 | Compliance score (from qualification) | Internal |
| `weight_on_time` | DECIMAL(5,2) | Yes | `30.00` | 0–100 | Weight for on-time delivery in overall score | Internal |
| `weight_quality` | DECIMAL(5,2) | Yes | `30.00` | 0–100 | Weight for quality | Internal |
| `weight_price` | DECIMAL(5,2) | Yes | `20.00` | 0–100 | Weight for price stability | Internal |
| `weight_response` | DECIMAL(5,2) | Yes | `10.00` | 0–100 | Weight for response time | Internal |
| `weight_compliance` | DECIMAL(5,2) | Yes | `10.00` | 0–100 | Weight for compliance | Internal |
| `overall_score` | DECIMAL(5,2) | Yes | — | 0–100, Generated: weighted average | Overall performance score | Internal |
| `performance_grade` | ENUM | Yes | — | A_PLUS (90+), A (80-89), B (70-79), C (60-69), D (50-59), F (<50), Generated from overall_score | Letter grade | Internal |
| `rating_trend` | ENUM | No | NULL | IMPROVING, STABLE, DECLINING | Trend vs previous period | Internal |
| `previous_score` | DECIMAL(5,2) | No | NULL | — | Previous period score | Internal |
| `score_change` | DECIMAL(5,2) | No | NULL | — | Change from previous | Internal |
| `risk_level` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH, CRITICAL | Supplier risk level | Confidential | Risk AI |
| `risk_factors` | JSONB | No | `'{}'::JSONB` | — | Detailed risk factors | Confidential |
| `calculated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When score calculated | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | SupplierPerformance → Company, Supplier; references GRN, QC, PO data (computed, not FK) |
| **Index** | `uq_performances_supplier_period` (unique: supplier + period), `idx_performances_period_date` (partition), `idx_performances_grade`, `idx_performances_risk` |
| **Validation** | Weights must sum to 100, only one performance record per supplier per period, `period_end_date` > `period_start_date`, scores 0–100 |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/suppliers/:id/performance` (GET — current + history), `/api/v1/suppliers/:id/performance/:periodId` (GET), `/api/v1/supplier-performances/calculate` (POST — trigger recalculation), `/api/v1/supplier-performances/leaderboard` (GET — top suppliers), `/api/v1/supplier-performances/at-risk` (GET — high-risk suppliers), `/api/v1/supplier-performances/trend` (GET — trend analysis) |
| **UI** | Performance Scorecard per supplier, Performance Leaderboard, At-Risk Suppliers Dashboard, Trend Charts, Weight Configuration, Grade Distribution |
| **Mobile** | View supplier rating, at-risk alerts, performance trend charts |
| **Reports** | Vendor Performance Report (per Ch 15 §15.9), Supplier Leaderboard, At-Risk Suppliers, Performance Trends, Grade Distribution, Category-wise Performance |
| **Audit** | Full; mandatory reason for manual score override, weight change |

### 13-16. Security / AI / Performance / Example

**Security**: Scores, ratings = Internal; `total_pos_value`, `price_variance_pct`, `risk_factors` = Confidential.

**AI**: Vendor Recommendation AI, Risk Prediction AI, Performance Prediction AI, Blacklist Prediction AI, Price Trend AI, Lead Time Prediction AI.

**Performance**: Auto-calculated by scheduled job (monthly); < 5,000 records per company; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-perf-001",
  "code": "PERF-2026-000001",
  "company_id": "01928f7a-...-company",
  "supplier_id": "01928f7a-...-sup-001",
  "performance_number": "PERF-2026-000001",
  "period_type": "MONTHLY",
  "period_start_date": "2026-06-01",
  "period_end_date": "2026-06-30",
  "period_date": "2026-06-30",
  "total_pos": 8,
  "total_pos_value": 425000.0000,
  "total_grns": 7,
  "total_deliveries": 7,
  "on_time_deliveries": 6,
  "late_deliveries": 1,
  "on_time_delivery_pct": 85.71,
  "avg_delay_days": 2.00,
  "total_qty_ordered": 5000.0000,
  "total_qty_received": 4850.0000,
  "total_qty_rejected": 75.0000,
  "rejection_pct": 1.55,
  "quality_score": 98.45,
  "total_complaints": 0,
  "total_rfq_invited": 3,
  "total_rfq_responded": 3,
  "rfq_response_rate": 100.00,
  "avg_rfq_response_time_hours": 18.50,
  "price_variance_pct": 2.50,
  "price_trend": "STABLE",
  "audit_score": 92.50,
  "compliance_score": 95.00,
  "weight_on_time": 30.00,
  "weight_quality": 30.00,
  "weight_price": 20.00,
  "weight_response": 10.00,
  "weight_compliance": 10.00,
  "overall_score": 92.50,
  "performance_grade": "A_PLUS",
  "rating_trend": "IMPROVING",
  "previous_score": 88.00,
  "score_change": 4.50,
  "risk_level": "LOW",
  "calculated_at": "2026-07-01T02:00:00Z",
  "status": "COMPLETED",
  "version": 1
}
```
