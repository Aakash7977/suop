# SUOP ERP — Module Dependency Map (v1.0)

**Document Version**: 1.0
**Frozen At**: 2026-07-11
**Phase**: 9B — Architecture Freeze
**Status**: 🔒 FROZEN

---

## 1. Enterprise Module Dependency Chain

SUOP ERP follows a strict bottom-up dependency chain. Each layer depends only on layers below it. **No upward dependencies, no circular dependencies.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Layer 9: Finance                          │
│              (Invoicing, Payments, GL, Costing)                  │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                     Layer 8: Quality                             │
│           (IQC, NCR, COA, Recalls, Calibration)                  │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                   Layer 7: Manufacturing                          │
│         (BOM, Routing, Work Orders, Batch Records)               │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                     Layer 6: Inventory                           │
│           (Stock, Movements, Valuation, Cycle Count)             │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                    Layer 5: Procurement                          │
│     (PR → RFQ → Quotation → PO → GRN → Quality → Stock-in)      │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                 Layer 4: Master Data                             │
│         (Products, Suppliers, Customers, Pricing)                │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                      Layer 3: RBAC                               │
│              (Roles, Permissions, Assignments)                   │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                  Layer 2: Authentication                         │
│            (Users, Sessions, JWT, Password Policy)               │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                  Layer 1: Organization                           │
│        (Tenants, Companies, Plants, Warehouses, Depts)           │
└──────────────────────────▲──────────────────────────────────────┘
                           │ depends on
┌──────────────────────────┴──────────────────────────────────────┐
│                  Layer 0: Foundation                             │
│  (DB, Audit, Events, Logging, Workflow Engine, Config, Files)    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer-by-Layer Dependencies

### Layer 0: Foundation (Phase 0 — ✅ Complete)

**Modules**: `core/*` (13 components)

| Component | Depends On | Provides |
|---|---|---|
| `core/db` | Prisma, PGlite | Database client + extensions |
| `core/audit` | `core/db`, `core/context` | Audit log service |
| `core/auth` | argon2, jsonwebtoken | Password hashing, JWT, sessions |
| `core/context` | AsyncLocalStorage | Request-scoped context |
| `core/errors` | — | Error classes + codes |
| `core/events` | — | In-process event bus |
| `core/files` | S3 SDK, local fs | File upload service |
| `core/jobs` | `core/db` | Background job queue |
| `core/logging` | pino | Structured logger |
| `core/notifications` | `core/db`, `core/events` | Notification engine |
| `core/permissions` | — | RBAC permission registry |
| `core/response` | — | HTTP response envelope |
| `core/validation` | zod | Schema validation helpers |
| `core/workflow` | — | State machine engine |

**No dependencies on business modules.**

---

### Layer 1: Organization (Phase 1 — ✅ Complete)

**Module**: `modules/organization`

**Depends On**:
- Layer 0: `core/db`, `core/audit`, `core/workflow`, `core/events`, `core/errors`, `core/logging`

**Provides**:
- Multi-tenant organization hierarchy (Tenants → Companies → Plants → Warehouses → Departments)
- Cost centers, working calendars, financial years
- Reference data (currencies, timezones, tax configs)

**Required By**:
- Layer 2 (Authentication) — users belong to a tenant
- Layer 4 (Master Data) — products/suppliers/customers belong to a tenant + plant
- Layer 5 (Procurement) — PRs originate from a department/plant

**Key Entities**: `Tenant`, `Company`, `Plant`, `Warehouse`, `Department`, `CostCenter`

---

### Layer 2: Authentication (Phase 2 — ✅ Complete)

**Module**: `modules/auth`

**Depends On**:
- Layer 0: `core/auth` (JWT, Argon2id), `core/context`, `core/audit`, `core/errors`
- Layer 1: `organization` (tenant scoping)

**Provides**:
- User authentication (login, logout, refresh)
- Password management (reset, change, history)
- Session management (multi-device, revocable)
- User invitations (token-based)
- Device registry

**Required By**:
- Layer 3 (RBAC) — roles are assigned to authenticated users
- All layers above — every API request requires authentication

**Key Entities**: `User`, `RefreshToken`, `UserInvitation`, `PasswordResetToken`, `LoginHistory`, `DeviceRegistry`

---

### Layer 3: RBAC / User Management (Phase 3 — ✅ Complete)

**Module**: `modules/user-management`

**Depends On**:
- Layer 0: `core/permissions`, `core/audit`
- Layer 1: `organization` (entities for assignment)
- Layer 2: `auth` (users to assign roles to)

**Provides**:
- Role management (CRUD + lifecycle)
- Permission registry (38 permissions across 11 resources)
- User-role assignments
- User-entity assignments (user → plant, user → department, user → cost center)
- User preferences (UI, notifications)

**Required By**:
- Layer 4+ — every business module checks permissions via `core/permissions` middleware

**Key Entities**: `Role`, `Permission`, `RolePermission`, `UserRole`, `UserAssignment`, `UserPreference`

---

### Layer 4: Master Data (Phase 4-6 — ✅ Complete)

**Modules**: `modules/product`, `modules/supplier`, `modules/customer`

**Depends On**:
- Layer 0: `core/db`, `core/audit`, `core/workflow`, `core/files` (for compliance docs)
- Layer 1: `organization` (tenant + plant scoping)
- Layer 3: `permissions` (RBAC checks)

**Provides**:
- **Product Master**: Products, categories, brands, UoMs, barcodes, conversions
- **Supplier Master**: Suppliers, contacts, addresses, compliances, product mappings
- **Customer Master**: Customers, groups, contacts, addresses, credit info

**Required By**:
- Layer 5 (Procurement) — PRs reference products; RFQs reference suppliers
- Layer 6 (Inventory) — stock is per-product
- Layer 7 (Manufacturing) — BOMs reference products
- Layer 8 (Quality) — COA/NCR reference products + suppliers
- Layer 9 (Finance) — invoices reference customers + products

**Key Entities**: `Product`, `ProductCategory`, `ProductBrand`, `ProductUoM`, `ProductBarcode`, `Supplier`, `SupplierContact`, `SupplierAddress`, `SupplierCompliance`, `SupplierProductMapping`, `Customer`, `CustomerGroup`, `CustomerContact`, `CustomerAddress`

---

### Layer 5: Procurement (Phase 7-9 — 🚧 In Progress)

**Modules**: `modules/procurement`, `modules/rfq`, `modules/quotation`

**Depends On**:
- Layer 0: `core/db`, `core/audit`, `core/workflow`, `core/events`
- Layer 1: `organization` (department, plant)
- Layer 3: `permissions` (PR_APPROVE, RFQ_APPROVE, QUOT_APPROVE)
- Layer 4: `product` (PR lines reference products), `supplier` (RFQ invites suppliers)

**Provides**:
- **Purchase Requisition**: Multi-level approval workflow (Dept → Budget → Proc)
- **RFQ**: Supplier invitation + response collection
- **Quotation**: Supplier quotation comparison + award (Phase 9, in progress)

**Required By**:
- Layer 6 (Inventory) — approved PRs / awarded RFQs generate stock-in movements
- Layer 8 (Quality) — received goods trigger IQC
- Layer 9 (Finance) — POs become invoices

**Procurement Sub-Workflow**:
```
PR (DRAFT → SUBMITTED → DEPT_REVIEW → BUDGET_APPROVAL → PROC_REVIEW → APPROVED)
                                                                              │
                                                                              ▼ convert
RFQ (DRAFT → SUBMITTED → SENT → SUPPLIER_RESPONSE → EVALUATION → AWARDED → CLOSED)
                                                                       │
                                                                       ▼ supplier submits
Quotation (DRAFT → SUBMITTED → TECHNICAL_REVIEW → COMMERCIAL_REVIEW → RECOMMENDED → AWARDED → ARCHIVED)
                                                                                              │
                                                                                              ▼ generates
                                                                                         Purchase Order (future)
```

**Key Entities**: `PurchaseRequisition`, `PurchaseRequisitionLine`, `PurchaseRequisitionApproval`, `RFQ`, `RFQLine`, `RFQSupplier`, `SupplierQuotation`, `SupplierQuotationLine`

---

### Layer 6: Inventory (Phase 10 — 🔲 Planned)

**Module**: `modules/inventory` (not yet implemented)

**Depends On**:
- Layer 0: `core/*`
- Layer 1: `organization` (warehouse scoping)
- Layer 3: `permissions`
- Layer 4: `product` (stock is per-product)
- Layer 5: `procurement` (stock-in from GRN), `customer` (stock-out from sales)

**Provides**:
- Stock ledger (immutable movement records)
- Real-time stock levels (per warehouse, per product, per batch)
- Stock valuation (FIFO, weighted average)
- Cycle count + physical inventory
- Stock adjustments + reversals

**Required By**:
- Layer 7 (Manufacturing) — raw material consumption
- Layer 8 (Quality) — sample extraction, hold/release
- Layer 9 (Finance) — inventory valuation for GL

**Key Entities (Planned)**: `StockLedger`, `StockSummary`, `StockMovement`, `CycleCount`, `StockAdjustment`, `Batch`, `SerialNumber`

---

### Layer 7: Manufacturing / MES (Phase 11 — 🔲 Planned)

**Module**: `modules/mes` (not yet implemented)

**Depends On**:
- Layer 0: `core/*`
- Layer 1: `organization` (plant scoping)
- Layer 3: `permissions`
- Layer 4: `product` (finished goods, raw materials)
- Layer 6: `inventory` (raw material availability, finished goods receipt)

**Provides**:
- Bill of Materials (BOM)
- Routing (operations, work centers)
- Work Orders (production orders)
- Batch records (FSSAI compliance)
- Production confirmation
- Cost accumulation

**Required By**:
- Layer 8 (Quality) — in-process quality checks
- Layer 9 (Finance) — production cost posting

**Key Entities (Planned)**: `BOM`, `BOMLine`, `Routing`, `RoutingOperation`, `WorkCenter`, `WorkOrder`, `WorkOrderOperation`, `BatchRecord`, `ProductionConfirmation`

---

### Layer 8: Quality / QMS (Phase 12 — 🔲 Planned)

**Module**: `modules/qms` (not yet implemented)

**Depends On**:
- Layer 0: `core/*`, `core/files` (COA, evidence photos)
- Layer 1: `organization`
- Layer 3: `permissions`
- Layer 4: `product`, `supplier`
- Layer 5: `procurement` (GRN triggers IQC)
- Layer 6: `inventory` (hold/release stock)
- Layer 7: `manufacturing` (in-process checks)

**Provides**:
- Incoming Quality Control (IQC)
- Non-Conformance Reports (NCR)
- Certificate of Analysis (COA) signing
- Calibration management
- Recall management
- Statistical Process Control (SPC)

**Required By**:
- Layer 9 (Finance) — quality cost tracking
- Layer 6 (Inventory) — hold/release decisions

**Key Entities (Planned)**: `IQCInspection`, `IQCResult`, `NCR`, `NCRClosure`, `COA`, `COASignature`, `CalibrationRecord`, `Recall`, `RecallExecution`, `SPCChart`

---

### Layer 9: Finance (Phase 13 — 🔲 Planned)

**Module**: `modules/finance` (not yet implemented)

**Depends On**:
- Layer 0: `core/*`
- Layer 1: `organization` (cost centers, financial years)
- Layer 3: `permissions`
- Layer 4: `product`, `customer`, `supplier`
- Layer 5: `procurement` (PO → invoice)
- Layer 6: `inventory` (valuation)
- Layer 7: `manufacturing` (production cost)
- Layer 8: `quality` (quality costs)

**Provides**:
- Accounts Payable (AP)
- Accounts Receivable (AR)
- General Ledger (GL)
- Cost accounting
- Tax management (GST)
- Financial reporting

**Key Entities (Planned)**: `Invoice`, `Payment`, `GLEntry`, `GLAccount`, `CostCenterTransaction`, `TaxTransaction`, `JournalEntry`, `FinancialStatement`

---

## 3. Cross-Module Communication Rules

### 3.1 Allowed Communication

| Method | Direction | Example |
|---|---|---|
| **Domain Events** | Any → Any (downward) | `rfq.awarded` event triggers PO creation |
| **Service call** | Upper → Lower only | `procurement` calls `product.findById()` |
| **Shared types** | Any → `packages/shared` | Type-only imports |
| **Database FK** | Any → Any (data level) | `purchase_requisition_lines.product_id → products.id` |

### 3.2 Forbidden Communication

| Method | Reason |
|---|---|
| Direct import of another module's `repository/` | Bypasses service layer |
| Direct import of another module's `routes/` | HTTP-bound |
| Upward service call (lower → upper) | Violates layering |
| Circular events (A → B → A) | Infinite loop risk |

### 3.3 Event-Driven Decoupling

Modules communicate **asynchronously** via domain events for non-critical paths:

```typescript
// RFQ module publishes
eventBus.publish('rfq.awarded', { rfqId, supplierId, quotationId })

// Quotation module subscribes (no direct dependency)
eventBus.subscribe('rfq.awarded', async (event) => {
  await quotationService.transitionToAwarded(event.payload.quotationId)
})

// Future: Inventory module subscribes
eventBus.subscribe('rfq.awarded', async (event) => {
  // Prepare for incoming stock
})
```

---

## 4. Implementation Status

| Layer | Module | Phase | Status | Tests |
|---|---|---|---|---|
| 0 | Foundation | Phase 0 | ✅ Complete | 233 |
| 1 | Organization | Phase 1 | ✅ Complete | 29 |
| 2 | Authentication | Phase 2 | ✅ Complete | 44 |
| 3 | RBAC | Phase 3 | ✅ Complete | 20 |
| 4a | Product | Phase 4 | ✅ Complete | 30 |
| 4b | Supplier | Phase 5 | ✅ Complete | 41 |
| 4c | Customer | Phase 6 | ✅ Complete | 34 |
| 5a | Procurement (PR) | Phase 7 | ✅ Complete | 36 |
| 5b | RFQ | Phase 8 | ✅ Complete | 36 |
| 5c | Quotation | Phase 9 | 🚧 In Progress | 0 (scaffolded) |
| 6 | Inventory | Phase 10 | 🔲 Planned | — |
| 7 | Manufacturing (MES) | Phase 11 | 🔲 Planned | — |
| 8 | Quality (QMS) | Phase 12 | 🔲 Planned | — |
| 9 | Finance | Phase 13 | 🔲 Planned | — |
| **Total** | | | | **503** |

---

## 5. Future Module Dependencies (WMS, EDI, BI)

```
                    ┌─────────────────────────────────┐
                    │  Business Intelligence (BI)     │
                    │  (Reads from all layers)        │
                    └─────────────────────────────────┘
                                ▲
                                │ reads
                    ┌───────────┴────────────┐
                    │   Data Warehouse / ETL  │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌─────────▼──────┐
│   WMS          │    │   MES           │    │   EDI          │
│ (Warehouse     │    │ (Manufacturing  │    │ (Electronic    │
│  Management)   │    │  Execution)     │    │  Data Interch.)│
└───────┬────────┘    └────────┬────────┘    └─────────┬──────┘
        │                      │                       │
        └──────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Core ERP Layers    │
                    │  (1 through 9)      │
                    └─────────────────────┘
```

- **WMS** (Warehouse Management): Depends on Layer 6 (Inventory), provides advanced warehouse operations (putaway, picking, packing, shipping)
- **MES** (Manufacturing Execution): = Layer 7, depends on Layers 4-6
- **EDI** (Electronic Data Interchange): Cross-cutting, integrates with Layers 4, 5, 9 for supplier/customer document exchange
- **BI** (Business Intelligence): Read-only, consumes from all layers via ETL

---

*This document is FROZEN as of Phase 9B. Layer changes require ADR + version bump.*
