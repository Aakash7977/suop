# Manual 1 · Part 5 · Entities 34-36 — Pre-PO Flow (Purchase Requisition, RFQ, Vendor Quotation)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 5 — Procurement & Supplier Domain |
| Entities | Purchase Requisition (034), Request for Quotation (035), Vendor Quotation (036) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Pre-PO Flow Architecture

The Pre-PO Flow is the **demand-to-order conversion pipeline**:

```
1. PURCHASE REQUISITION (PR)
   │  Internal demand — "we need X quantity of Y by Z date"
   ↓ Approval
2. REQUEST FOR QUOTATION (RFQ) [Optional, per company policy]
   │  Invite suppliers to bid
   ↓ Vendor responses
3. VENDOR QUOTATION(s)
   │  Each supplier submits price, terms, delivery
   ↓ Comparison + selection
4. PURCHASE ORDER (PO) [Entity 037]
   Official purchasing document
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **PR is mandatory** | No PO without an approved PR (per Part 5 principles) |
| **RFQ is optional** | Configurable per company policy; small-value POs can skip RFQ |
| **Multi-supplier RFQ** | One RFQ can invite multiple suppliers; one quotation per supplier per RFQ |
| **Comparison matrix** | System auto-generates comparison for easy vendor selection |
| **Auto-PO from RFQ** | Winning quotation can auto-generate PO draft |

---

## Entity 034 — Purchase Requisition (PR)

### 1. Business Purpose

The `PurchaseRequisition` entity represents an **internal request for purchasing** — a department or user signals that they need materials or services. Per Volume 0 Chapter 5 §5.3 (Source-to-Stock), the PR is the **first step** in the procurement lifecycle:

```
Material Requirement → Purchase Requisition → Approval → RFQ (optional) → Purchase Order
```

PRs can originate from:
- **Manual request** — User creates PR for needed items
- **Auto-generated** — Rules Engine generates PR when stock drops below reorder point (per Ch 5 §5.16, Ch 14 §14.5)
- **Production planning** — Production planning generates PR for raw materials (per Ch 5 §5.4)
- **Restaurant KOT consumption** — Kitchen inventory low triggers PR (per Ch 5 §5.9)

PRs enforce the principle: **"No purchasing without business demand"** (per Part 5 principles).

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
| Table Name | `purchase_requisitions` (header) + `purchase_requisition_lines` (line items) |
| Prisma Models | `PurchaseRequisition`, `PurchaseRequisitionLine` |
| Pattern | Header-line |
| Lifecycle | 9-stage transactional lifecycle (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → EXECUTED → COMPLETED → CLOSED → ARCHIVED) per Ch 4 §4.6 |

### 4. Field Dictionary

#### 4.1 PR Header

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PR-` | PR number (e.g., `PR-2026-000001`) | Public | — |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | Internal | — |
| `facility_id` | UUID | Yes | — | FK to facilities | Requesting facility | Internal | — |
| `status` | ENUM | Yes | `DRAFT` | 9-stage transactional lifecycle | Lifecycle | Internal | — |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `pr_number` | VARCHAR(50) | Yes | — | Human-readable, format `PR-{YEAR}-{SEQ}` | Display number | Public | — |
| `pr_date` | DATE | Yes | `CURRENT_DATE` | — | PR creation date | Internal | — |
| `pr_type` | ENUM | Yes | `STANDARD` | STANDARD, AUTO_REORDER, PRODUCTION_PLANNED, EMERGENCY, PROJECT, SERVICE_REQUEST | PR origin type | Internal | Reorder AI |
| `pr_origin` | ENUM | Yes | `MANUAL` | MANUAL, AUTO_REORDER, PRODUCTION_PLAN, KOT_TRIGGER, LOW_STOCK_ALERT, USER_REQUEST | How PR was created | Internal | — |
| `department_id` | UUID | Yes | — | FK to `departments.id` | Requesting department (per Ch 4 §4.8 ownership) | Internal | — |
| `requester_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Who requested | Internal | — |
| `warehouse_id` | UUID | No | NULL | FK to `facilities.id` (WAREHOUSE) | Destination warehouse | Internal | — |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, EMERGENCY | Priority (per Part 5) | Internal | — |
| `required_by_date` | DATE | Yes | — | > pr_date | Date material required | Internal | Lead time AI |
| `business_justification` | TEXT | No | NULL | Required if priority IN (URGENT, EMERGENCY) | Justification for urgent/emergency | Internal | — |
| `total_estimated_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total estimated value | Confidential | — |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal | — |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of line items | Internal | — |
| `source_pr_id` | UUID | No | NULL | FK self-ref | Parent PR (for split PRs) | Internal | — |
| `source_document_type` | VARCHAR(30) | No | NULL | PRODUCTION_ORDER, SALES_ORDER, REORDER_RULE, etc. | Originating document | Internal | — |
| `source_document_id` | UUID | No | NULL | FK to source | Originating document ID | Internal | — |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Originating document number | Internal | — |
| `rfq_id` | UUID | No | NULL | FK to `rfqs.id` | Generated RFQ (if any) | Internal | — |
| `purchase_order_id` | UUID | No | NULL | FK to `purchase_orders.id` | Generated PO (if direct PO without RFQ) | Internal | — |
| `approval_flow_id` | UUID | No | NULL | FK to `approval_flows.id` | Approval workflow | Internal | — |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DELEGATED, ESCALATED | Approval status | Internal | — |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Final approver | Internal | — |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal | — |
| `approval_comments` | TEXT | No | NULL | — | Approval comments | Internal | — |
| `rejected_reason` | TEXT | No | NULL | Required if status = REJECTED | Rejection reason | Internal | — |
| `rejected_by` | UUID | No | NULL | FK to `user_accounts.id` | Who rejected | Internal | — |
| `rejected_at` | TIMESTAMPTZ | No | NULL | — | Rejection timestamp | Internal | — |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure timestamp | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

#### 4.2 PR Line Items

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `pr_id` | UUID | Yes | — | FK to `purchase_requisitions.id` | Parent PR |
| `line_number` | INTEGER | Yes | — | > 0, unique per PR | Line number | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product requested | Internal |
| `product_description` | TEXT | No | NULL | — | Description (if product not in master) | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity_requested` | DECIMAL(18,4) | Yes | — | > 0 | Requested quantity | Internal |
| `quantity_approved` | DECIMAL(18,4) | No | NULL | ≥ 0, ≤ quantity_requested | Approved quantity (may be less than requested) | Internal |
| `quantity_converted_to_po` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity converted to PO | Internal |
| `estimated_unit_price` | DECIMAL(18,4) | No | NULL | ≥ 0 | Estimated unit price | Confidential |
| `estimated_line_value` | DECIMAL(18,4) | No | — | Generated: `quantity_requested * estimated_unit_price` | Estimated line value | Confidential |
| `required_by_date` | DATE | Yes | — | ≥ pr.required_by_date | Line-specific required date | Internal |
| `preferred_supplier_id` | UUID | No | NULL | FK to `suppliers.id` | Preferred supplier (if any) | Internal |
| `budget_code` | VARCHAR(30) | No | NULL | — | Budget code for tracking | Confidential |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers.id` | Cost center | Confidential |
| `line_status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, APPROVED, PARTIALLY_CONVERTED, FULLY_CONVERTED, REJECTED, CLOSED | Line status | Internal |
| `line_remarks` | TEXT | No | NULL | — | Line annotation | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| PurchaseRequisition → Company, Facility, Department, Warehouse | N : 1 each | various | RESTRICT |
| PurchaseRequisition → UserAccount (requester, approver, rejector) | N : 1 each | various | RESTRICT |
| PurchaseRequisition → ApprovalFlow | N : 1 | `approval_flow_id` | SET NULL |
| PurchaseRequisition → RFQ | N : 1 | `rfq_id` | SET NULL |
| PurchaseRequisition → PurchaseOrder | N : 1 | `purchase_order_id` | SET NULL |
| PurchaseRequisition → PurchaseRequisitionLine | 1 : N | `purchase_requisition_lines.pr_id` | CASCADE |
| PurchaseRequisitionLine → Product, UOM, Supplier, CostCenter | N : 1 each | various | SET NULL/RESTRICT |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_purchase_requisitions` | PK | `id` |
| `uq_pr_code_company` | UNIQUE | `company_id, code` |
| `idx_pr_status` | B-TREE | `status, pr_date DESC` |
| `idx_pr_department` | B-TREE | `department_id, status` |
| `idx_pr_requester` | B-TREE | `requester_user_id, status` |
| `idx_pr_priority` | B-TREE | `priority, required_by_date WHERE status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW')` |
| `idx_pr_required_date` | B-TREE | `required_by_date, status` |
| `idx_pr_approval_pending` | PARTIAL | `facility_id, pr_date WHERE approval_status = 'PENDING' AND status = 'SUBMITTED'` |
| `idx_pr_auto_reorder` | PARTIAL | `company_id WHERE pr_origin = 'AUTO_REORDER'` |
| `pk_purchase_requisition_lines` | PK | `id` |
| `idx_prl_pr` | B-TREE | `pr_id, line_number` |
| `idx_prl_product` | B-TREE | `product_id` |
| `idx_prl_status` | B-TREE | `line_status` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `required_by_date` > `pr_date` | DB CHECK |
| 3 | `quantity_requested` > 0 on each line | DB CHECK |
| 4 | `quantity_approved` ≤ `quantity_requested` | DB CHECK |
| 5 | `business_justification` required if priority IN (URGENT, EMERGENCY) | DB CHECK |
| 6 | Approval required before EXECUTED status (per Ch 2 §2.6) | App |
| 7 | Approval routing based on total_estimated_value (per Ch 8 §8.10) | App |
| 8 | Cannot modify after APPROVED (must create new PR or amendment) | App |
| 9 | Line items required (at least 1) before SUBMITTED | App |
| 10 | `uom_id` must match `product.base_uom_id` or be convertible | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/purchase-requisitions` (GET, POST), `/api/v1/purchase-requisitions/:id` (GET, PATCH), `/api/v1/purchase-requisitions/:id/lines` (GET, POST), `/api/v1/purchase-requisitions/:id/submit` (POST), `/api/v1/purchase-requisitions/:id/approve` (POST), `/api/v1/purchase-requisitions/:id/reject` (POST), `/api/v1/purchase-requisitions/:id/convert-to-rfq` (POST), `/api/v1/purchase-requisitions/:id/convert-to-po` (POST — direct PO without RFQ), `/api/v1/purchase-requisitions/pending-approval` (GET), `/api/v1/purchase-requisitions/by-department/:deptId` (GET) |
| **UI** | PR List, PR Detail (with lines grid), PR Create Form (multi-line), Approval Queue, PR to RFQ/PO Converter, Auto-Generated PR Dashboard |
| **Mobile** | PR approval (L3+), PR creation (simple), PR status tracking, urgent PR alerts |
| **Reports** | PR Register, PR by Department, PR Aging, Auto-Generated PR Report, PR to PO Conversion Rate, Urgent PR Report |
| **Audit** | Full; mandatory reason for rejection, approval override, quantity change after approval |

### 13-16. Security / AI / Performance / Example

**Security**: `pr_number`, `pr_date`, `priority` = Public; `total_estimated_value`, `estimated_*_price` = Confidential; `budget_code`, `cost_center_id` = Confidential.

**AI**: Auto Reorder AI (generates PRs from low stock), Demand-Based Procurement AI, Lead Time Prediction AI, PR Approval Routing AI.

**Performance**: < 50k per year; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-pr-001",
    "code": "PR-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "pr_number": "PR-2026-000001",
    "pr_date": "2026-07-01",
    "pr_type": "AUTO_REORDER",
    "pr_origin": "LOW_STOCK_ALERT",
    "department_id": "01928f7a-...-dept-proc",
    "requester_user_id": "01928f7a-...-user-system",
    "warehouse_id": "01928f7a-...-wh-rm-01",
    "priority": "HIGH",
    "required_by_date": "2026-07-10",
    "total_estimated_value": 22500.0000,
    "currency_code": "INR",
    "total_lines": 1,
    "source_document_type": "REORDER_RULE",
    "approval_status": "APPROVED",
    "approved_by": "01928f7a-...-user-proc-head",
    "approved_at": "2026-07-01T14:00:00Z",
    "status": "APPROVED",
    "version": 3
  },
  "lines": [
    {
      "id": "01928f7a-...-prl-001",
      "pr_id": "01928f7a-...-pr-001",
      "line_number": 1,
      "product_id": "01928f7a-...-prod-sugar",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity_requested": 500.0000,
      "quantity_approved": 500.0000,
      "quantity_converted_to_po": 0.0000,
      "estimated_unit_price": 45.0000,
      "estimated_line_value": 22500.0000,
      "required_by_date": "2026-07-10",
      "preferred_supplier_id": "01928f7a-...-sup-001",
      "cost_center_id": "01928f7a-...-cc-mfg-swt",
      "line_status": "APPROVED"
    }
  ]
}
```

---

## Entity 035 — Request for Quotation (RFQ)

### 1. Business Purpose

The `RFQ` entity represents a **request for quotation** sent to multiple suppliers — inviting them to submit price quotes for the items in a Purchase Requisition. Per Part 5, RFQ is **optional** (configurable per company policy), but recommended for:
- High-value purchases (> configurable threshold, e.g., ₹50,000)
- New products (no established supplier)
- Periodic market price discovery
- Strategic sourcing initiatives

RFQ enables **competitive bidding** — suppliers submit quotations, the system generates a comparison matrix, and procurement selects the winning supplier based on price, quality, lead time, and other factors.

### RFQ Lifecycle

```
DRAFT → SENT (to suppliers) → QUOTES_RECEIVED → UNDER_EVALUATION → AWARDED → CLOSED
                                                      ↓
                                                  CANCELLED
```

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
| Table Name | `rfqs` (header) + `rfq_lines` (items) + `rfq_suppliers` (invited suppliers, many-to-many) |
| Prisma Models | `RFQ`, `RFQLine`, `RFQSupplier` |
| Pattern | Header-line + many-to-many |

### 4. Field Dictionary

#### 4.1 RFQ Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `RFQ-` | RFQ code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities | Facility |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SENT, QUOTES_RECEIVED, UNDER_EVALUATION, AWARDED, CLOSED, CANCELLED | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `rfq_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `rfq_date` | DATE | Yes | `CURRENT_DATE` | — | RFQ creation date | Internal |
| `rfq_type` | ENUM | Yes | `STANDARD` | STANDARD, REVERSE_AUCTION, MULTI_ROUND, BLANKET | RFQ type (Strategic Sourcing ready) | Internal |
| `pr_id` | UUID | No | NULL | FK to `purchase_requisitions.id` | Source PR | Internal |
| `buyer_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Procurement buyer managing RFQ | Internal |
| `department_id` | UUID | Yes | — | FK to `departments.id` | Requesting department | Internal |
| `warehouse_id` | UUID | No | NULL | FK to `facilities.id` | Destination warehouse | Internal |
| `title` | VARCHAR(200) | Yes | — | Min 5 | RFQ title | Public |
| `description` | TEXT | No | NULL | — | Detailed description | Internal |
| `closing_date` | DATE | Yes | — | > rfq_date | Quotation submission deadline | Internal |
| `closing_time` | TIMESTAMPTZ | Yes | — | — | Exact closing timestamp | Internal |
| `delivery_date_required` | DATE | Yes | — | > closing_date | Required delivery date | Internal |
| `delivery_location` | VARCHAR(200) | No | NULL | — | Delivery location | Internal |
| `payment_terms_id` | UUID | No | NULL | FK to `payment_terms.id` | Required payment terms | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of line items | Internal |
| `invited_supplier_count` | INTEGER | Yes | `0` | ≥ 0 | Suppliers invited | Internal |
| `responded_supplier_count` | INTEGER | Yes | `0` | ≥ 0 | Suppliers who responded | Internal |
| `winning_supplier_id` | UUID | No | NULL | FK to `suppliers.id` | Awarded supplier | Internal |
| `winning_quotation_id` | UUID | No | NULL | FK to `vendor_quotations.id` | Winning quotation | Internal |
| `awarded_at` | TIMESTAMPTZ | No | NULL | — | Award timestamp | Internal |
| `awarded_by` | UUID | No | NULL | FK to `user_accounts.id` | Who awarded | Internal |
| `award_justification` | TEXT | No | NULL | Required when awarded | Why this supplier won | Internal |
| `purchase_order_id` | UUID | No | NULL | FK to `purchase_orders.id` | Generated PO | Internal |
| `is_sealed` | BOOLEAN | Yes | `false` | — | If true, quotations sealed until closing | Confidential |
| `is_strategic` | BOOLEAN | Yes | `false` | — | Strategic sourcing RFQ | Confidential |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 RFQ Line Items + 4.3 RFQ Suppliers (M:N join)

(Similar to PR pattern — line items per product; join table for invited suppliers with response status)

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | RFQ → Company, Facility, PR, UserAccount, Department, Warehouse, Supplier (winning), VendorQuotation (winning), PO; RFQLine → Product, UOM; RFQSupplier → RFQ, Supplier |
| **Index** | `uq_rfq_code_company`, `idx_rfq_status`, `idx_rfq_closing_date`, `idx_rfq_buyer`, `idx_rfq_winning_supplier`, `idx_rfq_lines_rfq`, `idx_rfq_suppliers_rfq` |
| **Validation** | `closing_date` > `rfq_date`, at least 1 supplier invited before SENT, at least 1 line item, `award_justification` required when awarded, cannot award before closing_date (unless sealed bid opened) |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/rfqs` (GET, POST), `/api/v1/rfqs/:id` (GET, PATCH), `/api/v1/rfqs/:id/send` (POST — send to suppliers), `/api/v1/rfqs/:id/quotations` (GET — list received quotations), `/api/v1/rfqs/:id/comparison-matrix` (GET — auto-generated comparison), `/api/v1/rfqs/:id/award` (POST — award to supplier), `/api/v1/rfqs/:id/convert-to-po` (POST), `/api/v1/rfqs/:id/cancel` (POST), `/api/v1/rfqs/closing-soon` (GET) |
| **UI** | RFQ List, RFQ Detail (with lines + invited suppliers + received quotations), RFQ Create Wizard, Quotation Comparison Matrix (side-by-side), Award Decision Screen |
| **Mobile** | RFQ approval, closing-soon alerts, quotation review (L3+) |
| **Reports** | RFQ Register, RFQ Response Rate, Average Quotes per RFQ, Award Analysis, RFQ Cycle Time, Strategic Sourcing Report |
| **Audit** | Full; mandatory reason for award decision, cancellation, sealed bid opening |

### 13-16. Security / AI / Performance / Example

**Security**: `rfq_number`, `title` = Public; quotations, `winning_supplier_id`, `award_justification` = Confidential; `is_sealed` = Confidential.

**AI**: Vendor Recommendation AI (recommends suppliers to invite), Quotation Analysis AI (analyzes quotations for anomalies), Award Recommendation AI (recommends winning supplier), Price Prediction AI (predicts market price).

**Performance**: < 5k per year; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-rfq-001",
  "code": "RFQ-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "rfq_number": "RFQ-2026-000001",
  "rfq_date": "2026-07-01",
  "rfq_type": "STANDARD",
  "pr_id": "01928f7a-...-pr-001",
  "buyer_user_id": "01928f7a-...-user-buyer",
  "department_id": "01928f7a-...-dept-proc",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "title": "RFQ for Sugar (500 kg) - July 2026",
  "description": "Requirement for refined sugar for sweets manufacturing. Quality specs as per FSSAI standards.",
  "closing_date": "2026-07-05",
  "closing_time": "2026-07-05T18:00:00Z",
  "delivery_date_required": "2026-07-10",
  "delivery_location": "Pune Factory 1 - Raw Material Store",
  "payment_terms_id": "01928f7a-...-pt-net30",
  "currency_code": "INR",
  "total_lines": 1,
  "invited_supplier_count": 4,
  "responded_supplier_count": 3,
  "winning_supplier_id": "01928f7a-...-sup-001",
  "winning_quotation_id": "01928f7a-...-quote-001",
  "awarded_at": "2026-07-06T10:00:00Z",
  "awarded_by": "01928f7a-...-user-proc-head",
  "award_justification": "Mursaleen Traders offered best price (₹44.50/kg) with proven track record (92.5 rating) and 7-day lead time. Other suppliers either higher price or longer lead time.",
  "purchase_order_id": "01928f7a-...-po-001",
  "is_sealed": true,
  "status": "AWARDED",
  "version": 5
}
```

---

## Entity 036 — Vendor Quotation

### 1. Business Purpose

The `VendorQuotation` entity stores **price quotes submitted by suppliers** in response to an RFQ. Each supplier submits one quotation per RFQ, containing line-by-line pricing, terms, and delivery commitments. The system auto-generates a **comparison matrix** across all quotations for a given RFQ, enabling objective vendor selection.

Quotations are **immutable once submitted** (per audit trail requirements) — suppliers cannot modify after submission; they must withdraw and resubmit if changes needed.

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
| Table Name | `vendor_quotations` (header) + `vendor_quotation_lines` (line items) |
| Prisma Models | `VendorQuotation`, `VendorQuotationLine` |
| Immutability | Immutable after SUBMITTED status |

### 4. Field Dictionary

#### 4.1 Quotation Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `QUO-` | Quotation code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `supplier_id` | UUID | Yes | — | FK to `suppliers.id` | Quoting supplier | Confidential |
| `rfq_id` | UUID | Yes | — | FK to `rfqs.id` | Parent RFQ | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, UNDER_EVALUATION, ACCEPTED, REJECTED, WITHDRAWN, EXPIRED | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `quotation_number` | VARCHAR(50) | Yes | — | Display number | Internal |
| `quotation_number_supplier` | VARCHAR(50) | No | NULL | — | Supplier's quotation reference | Internal |
| `quotation_date` | DATE | Yes | `CURRENT_DATE` | — | Quotation date | Internal |
| `submitted_at` | TIMESTAMPTZ | No | NULL | — | Submission timestamp | Internal |
| `valid_until` | DATE | Yes | — | > quotation_date | Quotation validity date | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of lines | Internal |
| `subtotal` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Sum of line values | Confidential |
| `total_discount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total discount | Confidential |
| `total_tax` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total tax | Confidential |
| `freight_charges` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Freight charges | Confidential |
| `other_charges` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Other charges | Confidential |
| `grand_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Grand total | Confidential |
| `payment_terms_id` | UUID | Yes | — | FK to `payment_terms.id` | Offered payment terms | Confidential |
| `delivery_date_promised` | DATE | Yes | — | — | Promised delivery date | Internal |
| `delivery_terms` | VARCHAR(200) | No | NULL | — | Delivery terms (FOB, CIF, etc.) | Internal |
| `warranty_period_months` | INTEGER | No | NULL | ≥ 0 | Warranty period | Internal |
| `is_lowest_bid` | BOOLEAN | No | NULL | — | Generated: lowest grand_total among all quotations for RFQ | Confidential |
| `is_winning` | BOOLEAN | Yes | `false` | — | Whether this quotation won the RFQ | Internal |
| `evaluation_score` | DECIMAL(5,2) | No | NULL | 0–100 | Evaluation score (weighted: price, quality, lead time) | Confidential |
| `evaluation_rank` | INTEGER | No | NULL | ≥ 1 | Rank among all quotations (1 = best) | Confidential |
| `withdrawn_at` | TIMESTAMPTZ | No | NULL | — | Withdrawal timestamp | Internal |
| `withdrawn_reason` | TEXT | No | NULL | Required if status = WITHDRAWN | Withdrawal reason | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Quotation Line Items

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `quotation_id` | UUID | Yes | — | FK to `vendor_quotations.id` | Parent quotation |
| `rfq_line_id` | UUID | Yes | — | FK to `rfq_lines.id` | Corresponding RFQ line |
| `line_number` | INTEGER | Yes | — | > 0 | Line number | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity quoted | Internal |
| `unit_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit price | Confidential |
| `discount_pct` | DECIMAL(5,2) | Yes | `0` | 0–100 | Discount % | Confidential |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Discount amount | Confidential |
| `tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code` | Tax code | Confidential |
| `tax_pct` | DECIMAL(5,2) | Yes | `0` | 0–100 | Tax % | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax amount | Confidential |
| `line_total` | DECIMAL(18,4) | Yes | — | Generated: `(quantity * unit_price) - discount_amount + tax_amount` | Line total | Confidential |
| `lead_time_days` | INTEGER | Yes | — | ≥ 0 | Lead time for this line | Internal |
| `delivery_date_promised` | DATE | Yes | — | — | Line delivery date | Internal |
| `brand_offered` | VARCHAR(100) | No | NULL | — | Brand of product offered | Internal |
| `specifications` | TEXT | No | NULL | — | Technical specifications | Internal |
| `is_alternative` | BOOLEAN | Yes | `false` | — | If true, supplier offered alternative product | Internal |
| `alternative_product_id` | UUID | No | NULL | FK to `products.id` | Alternative product | Internal |
| `line_remarks` | TEXT | No | NULL | — | Line annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | VendorQuotation → Company, Supplier, RFQ, PaymentTerms; VendorQuotationLine → Quotation, RFQLine, Product, UOM, TaxCode, Product (alternative) |
| **Index** | `uq_quotations_code_company`, `uq_quotations_supplier_rfq` (one quotation per supplier per RFQ), `idx_quotations_status`, `idx_quotations_rfq`, `idx_quotations_winning`, `idx_quotation_lines_quotation`, `idx_quotation_lines_rfq_line` |
| **Validation** | One quotation per supplier per RFQ, `valid_until` > `quotation_date`, `grand_total` = subtotal - discount + tax + freight + other, immutable after SUBMITTED (except WITHDRAWN status), `line_total` must match calculation |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/rfqs/:rfqId/quotations` (GET, POST — submit), `/api/vendor-quotations/:id` (GET), `/api/vendor-quotations/:id/withdraw` (POST), `/api/rfqs/:rfqId/comparison` (GET — comparison matrix), `/api/vendor-quotations/:id/evaluate` (POST — score evaluation) |
| **UI** | Quotation List per RFQ, Quotation Detail, Comparison Matrix (side-by-side grid with color-coded best prices), Evaluation Scorecard, Award Decision View |
| **Mobile** | View quotations (L3+), approve award decision |
| **Reports** | Quotation Analysis, Price Comparison Report, Supplier Response Rate, Quotation to Award Conversion, Price Variance Analysis |
| **Audit** | Full; immutable after submission; mandatory reason for withdrawal, award decision |

### 13-16. Security / AI / Performance / Example

**Security**: All pricing fields Confidential (supplier-sensitive); `is_lowest_bid`, `evaluation_score`, `evaluation_rank` Confidential.

**AI**: Quotation Analysis AI (detects price anomalies), Award Recommendation AI (recommends winner based on weighted criteria), Price Prediction AI, Supplier Reliability AI.

**Performance**: < 10k per year (avg 2-3 quotations per RFQ); Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-quote-001",
    "code": "QUO-2026-000001",
    "company_id": "01928f7a-...-company",
    "supplier_id": "01928f7a-...-sup-001",
    "rfq_id": "01928f7a-...-rfq-001",
    "quotation_number": "QUO-2026-000001",
    "quotation_number_supplier": "MUR-Q-2026-042",
    "quotation_date": "2026-07-03",
    "submitted_at": "2026-07-03T14:30:00Z",
    "valid_until": "2026-07-15",
    "currency_code": "INR",
    "total_lines": 1,
    "subtotal": 22250.0000,
    "total_discount": 250.0000,
    "total_tax": 1100.0000,
    "freight_charges": 500.0000,
    "other_charges": 0.0000,
    "grand_total": 23600.0000,
    "payment_terms_id": "01928f7a-...-pt-net30",
    "delivery_date_promised": "2026-07-10",
    "delivery_terms": "FOR Destination",
    "is_lowest_bid": true,
    "is_winning": true,
    "evaluation_score": 94.50,
    "evaluation_rank": 1,
    "status": "ACCEPTED",
    "version": 2
  },
  "lines": [
    {
      "id": "01928f7a-...-ql-001",
      "quotation_id": "01928f7a-...-quote-001",
      "rfq_line_id": "01928f7a-...-rfl-001",
      "line_number": 1,
      "product_id": "01928f7a-...-prod-sugar",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity": 500.0000,
      "unit_price": 44.5000,
      "discount_pct": 1.00,
      "discount_amount": 222.5000,
      "tax_code": "GST-05",
      "tax_pct": 5.00,
      "tax_amount": 1100.0000,
      "line_total": 23600.0000,
      "lead_time_days": 7,
      "delivery_date_promised": "2026-07-10",
      "brand_offered": "Mursaleen Pure",
      "is_alternative": false
    }
  ]
}
```
