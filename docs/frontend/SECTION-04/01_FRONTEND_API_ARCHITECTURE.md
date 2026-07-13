# 01 — Frontend API Architecture

**Date**: 2026-07-13
**Status**: ARCHITECTURE BASELINE (pending approval)
**Principle**: Frontend and Backend are separate systems. Frontend API clients live in `src/api/`, NOT in backend module folders.

---

## 1. Architecture Principle

```
SUOP Frontend
├── src/
│   ├── api/                    ← Frontend API layer (ALL API clients)
│   │   ├── organization/       ← Domain: Organization
│   │   ├── inventory/          ← Domain: Inventory
│   │   ├── warehouse/          ← Domain: Warehouse
│   │   ├── manufacturing/      ← Domain: Manufacturing
│   │   ├── sales/              ← Domain: Sales & Distribution
│   │   ├── procurement/        ← Domain: Procurement
│   │   ├── quality/            ← Domain: Quality Management
│   │   ├── finance/            ← Domain: Finance & Controlling
│   │   ├── crm/                ← Domain: CRM
│   │   ├── hr/                 ← Domain: Human Resources
│   │   ├── administration/     ← Domain: Auth + User Management
│   │   └── bi/                 ← Domain: BI & Analytics
│   ├── components/             ← Shared UI components
│   │   ├── ui/                 ← shadcn primitives
│   │   └── shared/             ← Domain-agnostic shared (LoadingState, etc.)
│   ├── hooks/                  ← Shared hooks (useList, useMutation, etc.)
│   ├── lib/                    ← Shared utilities (format, csv, validate, badges, api)
│   ├── stores/                 ← Zustand stores (auth, org-context)
│   ├── sections/               ← Section-specific UI (03-master-data, 04-operations)
│   └── app/                    ← Next.js app router (page.tsx = orchestrator)
```

## 2. Why Not `src/modules/*/api/client.ts`?

The current pattern places frontend API clients inside `src/modules/<backend-module>/api/client.ts`. This is architecturally incorrect because:

1. **Mixes frontend with backend** — `src/modules/` was originally intended for backend module organization. Placing frontend TypeScript files there creates confusion about which code runs where.

2. **Section coupling** — Section 03 created clients in `src/sections/03-master-data/api/clients.ts`. Section 04 created clients in `src/sections/04-operations/api/clients.ts`. Future sections would create their own section-local clients. This means the SAME business domain (e.g., Sales) has its API client split across multiple section files.

3. **Cross-section imports** — Section 04 needs `pricingApi` (created by Section 03). It must import from `@/sections/03-master-data/api/clients` — coupling Section 04 to Section 03's internal file structure.

4. **Not enterprise-grade** — SAP, Oracle, and Dynamics all have a single "data access layer" that is independent of module-specific UI. The `src/api/` pattern mirrors this.

## 3. Domain Ownership Rules

Each business domain owns ALL its API clients. A domain may have multiple backend modules but consolidates them into one frontend API namespace.

| Domain | Backend Modules | API Namespace | Mount Prefixes |
|---|---|---|---|
| organization | organization | `src/api/organization/` | `/api/v1/organization` |
| inventory | inventory | `src/api/inventory/` | `/api/v1/inventory` |
| warehouse | warehouse, goods-receipt | `src/api/warehouse/` | `/api/v1/warehouse`, `/api/v1/warehouse/grns` |
| manufacturing | batch-manufacturing, recipe-bom, mes, production-order, production-planning, fgqc | `src/api/manufacturing/` | `/api/v1/manufacturing/*`, `/api/v1/mes` |
| sales | sales-order, order-fulfillment, pick-pack-dispatch, delivery-management, customer-returns, pricing-engine | `src/api/sales/` | `/api/v1/sales/*` |
| procurement | procurement, purchase-order, quotation, rfq | `src/api/procurement/` | `/api/v1/procurement/*` |
| quality | quality-inspection, quality-foundation, capa, coa, ncr, recall, supplier-quality | `src/api/quality/` | `/api/v1/quality/*` |
| finance | product-costing, financial-foundation, general-ledger, gst-taxation, accounts-payable, accounts-receivable | `src/api/finance/` | `/api/v1/finance/*` |
| crm | crm-foundation, lead-opportunity, customer-service, complaint, customer-portal, after-sales | `src/api/crm/` | `/api/v1/crm/*` |
| hr | attendance-shift, performance-management, payroll-processing, recruitment-onboarding, leave-management, employee-master | `src/api/hr/` | `/api/v1/hrms/*` |
| administration | auth, user-management | `src/api/administration/` | `/api/v1/auth`, `/api/v1/admin` |
| bi | alerts-kpi-engine, bi-foundation, executive-dashboards, reporting-platform, ai-prediction | `src/api/bi/` | `/api/v1/bi/*` |
| catalog | product | `src/api/catalog/` | `/api/v1/catalog` |
| partners | customer, supplier | `src/api/partners/` | `/api/v1/sales/customers`, `/api/v1/procurement/suppliers` |

## 4. API Client Conventions

1. **One file per backend module** within the domain directory:
   ```
   src/api/sales/
   ├── orders.ts          ← sales-order backend
   ├── fulfillment.ts     ← order-fulfillment backend
   ├── pick-pack.ts       ← pick-pack-dispatch backend
   ├── delivery.ts        ← delivery-management backend
   ├── returns.ts         ← customer-returns backend
   ├── pricing.ts         ← pricing-engine backend
   └── index.ts           ← barrel: export { salesOrderApi } from './orders', etc.
   ```

2. **All clients use shared `apiFetch`** from `@/lib/api` — NO inline copies.

3. **Types are co-located** with their client — `orders.ts` exports both `salesOrderApi` and `SalesOrder` interface.

4. **Barrel exports** via `index.ts` — consumers import from `@/api/sales` not individual files.

5. **Section code NEVER imports from another section** — always from `@/api/<domain>`.

---

**END OF FRONTEND API ARCHITECTURE**
