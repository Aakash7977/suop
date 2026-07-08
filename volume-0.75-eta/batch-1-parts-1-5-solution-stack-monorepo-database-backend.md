# SUOP Volume 0.75 — Enterprise Technical Architecture (ETA)
# Batch 1 — Parts 1-5: Solution Architecture, Tech Stack, Monorepo, Database & Backend

## Document Metadata

| Attribute | Value |
|---|---|
| Volume | 0.75 — Enterprise Technical Architecture (ETA) |
| Batch | 1 |
| Parts | 1-5 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1-9, Volume 0.5 Manual 1 Parts 1-15 |
| Last Updated | 2026-07-08 |
| Purpose | Translate the 815-entity enterprise architecture (Volume 0.5) into a concrete technical implementation blueprint |

---

## Overview — From Architecture to Engineering

Volume 0.75 bridges the gap between the **enterprise business architecture** (Volume 0.5 — 815 entities, 66 Foundation Services, 198 Architectural Decisions) and the **implementation blueprint** (Volume 1 — sprint-by-sprint development plan).

Volume 0.75 answers: **How do we engineer the platform that implements the Volume 0.5 architecture?**

```
Volume 0    →  Volume 0.5       →  Volume 0.75          →  Volume 1
Vision         Data Dictionary      Technical Architecture   Development Blueprint
(Q1-Q160)      (815 entities)       (Engineering Standards)  (Sprint Roadmap)
```

### 🏆 Architectural Lock: Business Engine First Development Strategy (Q199)

Per Chief Enterprise Architect's **most important decision of the entire project**, the **Business Engine First** development strategy is hereby locked as **Architectural Decision Q199**.

**Problem Solved**: Instead of building modules as isolated applications (leading to duplicated business logic, inconsistency, and maintenance burden), build reusable **Business Engines** that multiple modules consume.

**Anti-Pattern (Forbidden)**:
```
Inventory Module (own inventory logic)
Warehouse Module (own inventory logic, duplicated)
Manufacturing Module (own inventory logic, duplicated)
Retail Module (own inventory logic, duplicated)
```

**Locked Pattern — Business Engine First**:
```
Inventory Engine
    │
    ├── Warehouse (consumes Inventory Engine)
    ├── Manufacturing (consumes Inventory Engine)
    ├── Retail (consumes Inventory Engine)
    ├── Restaurant (consumes Inventory Engine)
    └── Finance (consumes Inventory Engine for valuation)

Workflow Engine
    │
    ├── Purchase Approval (consumes Workflow Engine)
    ├── Leave Approval (consumes Workflow Engine)
    ├── Maintenance Approval (consumes Workflow Engine)
    └── Quality Approval (consumes Workflow Engine)

Accounting Event Engine
    │
    ├── Inventory (consumes Accounting Event Engine)
    ├── Sales (consumes Accounting Event Engine)
    ├── Payroll (consumes Accounting Event Engine)
    └── Maintenance (consumes Accounting Event Engine)
```

**Architectural Benefits (Locked)**:
1. **Prevents duplicated business logic** across modules
2. **Improves consistency** — one inventory valuation algorithm, one workflow engine, one accounting event engine
3. **Allows future applications to reuse** the same enterprise capabilities
4. **Architectural style used by modern enterprise software vendors** (SAP, Oracle, Microsoft Dynamics)
5. **Stronger long-term foundation** — engines evolve independently from applications
6. **Clearer ownership** — each engine has a dedicated team and contract

**Engine vs Module Distinction (Locked)**:
| Concept | Module | Engine |
|---|---|---|
| Purpose | Business domain (e.g., Warehouse) | Reusable capability (e.g., Inventory Engine) |
| Consumers | End users via applications | Other modules and applications |
| Examples | Warehouse, Manufacturing, Retail | Inventory Engine, Workflow Engine, Accounting Event Engine |
| Coupling | Consumes engines | Consumed by modules |
| Evolution | Domain-specific changes | Capability enhancements affect all consumers |

**Governance (Q199 — LOCKED)**: The Business Engines are owned by the Platform Kernel team (per Q189/Q192). Business modules **consume** engines via well-defined contracts; they **never reimplement** engine capabilities internally.

**Migration Path**: Build engines first as part of the Platform Kernel, then build business modules that consume them. This sequencing ensures no module is built on a shaky foundation.

---

# Part 1: Enterprise Solution Architecture

## 1.1 Architecture Vision

**SUOP is not a web application. It is an Enterprise Operating System (EOS).**

- Every application shares one platform
- Every module shares one business engine
- Every service shares one platform kernel

This is the fundamental architectural principle that distinguishes SUOP from traditional ERP implementations. SUOP is not a collection of applications; it is a unified operating system for the enterprise.

## 1.2 Enterprise Architecture Layers

```text
                        SUOP Enterprise Operating System

┌────────────────────────────────────────────────────────────┐
│                    Applications Layer                      │
│ Admin │ Warehouse │ Retail POS │ Restaurant │ Mobile │ BI │
└────────────────────────────────────────────────────────────┘
                           │
───────────────────────────┼────────────────────────────────
                           │
┌────────────────────────────────────────────────────────────┐
│                 Business Modules Layer                     │
│ Inventory │ WMS │ MES │ QMS │ Finance │ HR │ EAM │ CRM │
└────────────────────────────────────────────────────────────┘
                           │
───────────────────────────┼────────────────────────────────
                           │
┌────────────────────────────────────────────────────────────┐
│                 Business Engines Layer                     │
│ Inventory │ Workflow │ Accounting │ Pricing │ Reporting │
└────────────────────────────────────────────────────────────┘
                           │
───────────────────────────┼────────────────────────────────
                           │
┌────────────────────────────────────────────────────────────┐
│                  Platform Services Layer                   │
│ Auth │ RBAC │ Search │ Audit │ Notification │ Documents │
└────────────────────────────────────────────────────────────┘
                           │
───────────────────────────┼────────────────────────────────
                           │
┌────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                   │
│ PostgreSQL │ Redis │ RabbitMQ │ Object Storage │ Docker │
└────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | What It Does NOT Do |
|---|---|---|
| **Applications** | UI rendering, user interaction | No business logic |
| **Business Modules** | Domain-specific orchestration | No cross-module direct DB access |
| **Business Engines** | Reusable enterprise capabilities | No UI rendering |
| **Platform Services** | Cross-cutting concerns (Auth, RBAC, Audit) | No business domain logic |
| **Infrastructure** | Data persistence, messaging, storage | No application logic |

## 1.3 Architectural Principles (Locked)

| Principle | Description | Rationale |
|---|---|---|
| **Domain Driven Design (DDD)** | Bounded contexts, ubiquitous language, aggregates | Aligns code with business domains |
| **Modular Monolith First** | Single deployment, clear module boundaries | Simplicity initially; microservices when scale demands |
| **Event Driven** | Modules communicate via events, not direct calls | Decoupling, scalability, auditability |
| **API First** | Every capability exposed via API contract | Enables multi-client (web, mobile, POS, external) |
| **Mobile First for Operations** | Warehouse, POS, maintenance optimized for mobile | Operational users are mobile-first |
| **Desktop First for ERP** | Admin, finance, analytics optimized for desktop | Knowledge workers are desktop-first |
| **Cloud Native** | Containerized, scalable, resilient | Modern deployment standards |
| **AI Native** | AI capabilities built into platform, not bolted on | Consistent AI governance (per Q193) |
| **Offline First (Warehouse/POS)** | Works without network, syncs when online | Operational continuity in poor connectivity |

## 1.4 Bounded Contexts (Locked)

Per DDD principles, SUOP is divided into 15 bounded contexts:

| # | Bounded Context | Volume 0.5 Part | Primary Responsibility |
|---|---|---|---|
| 1 | Platform | Part 14 | Cross-cutting platform services |
| 2 | Organization | Parts 1-2 | Company, branch, department hierarchy |
| 3 | Identity | Part 14 §1 | Users, authentication, sessions |
| 4 | Inventory | Part 4 | Stock ledger, valuation, reservations |
| 5 | Warehouse | Part 6 | WMS, bin locations, pick/pack/ship |
| 6 | Manufacturing | Part 7 | MES, production orders, BOM, routing |
| 7 | Quality | Part 8 | QMS, inspections, CAPA, compliance |
| 8 | Retail | Part 9 | POS, retail operations, customer |
| 9 | Restaurant | Part 10 | Restaurant POS, kitchen, menu |
| 10 | Finance | Part 11 | Accounting, GL, AP/AR, reporting |
| 11 | Workforce | Part 12 | HR, payroll, attendance, performance |
| 12 | Maintenance | Part 13 | EAM, work orders, PM, reliability |
| 13 | Analytics | Part 15 §4-6 | Data warehouse, BI, digital twin |
| 14 | AI | Part 15 §1-3, 7 | AI gateway, copilot, agents |
| 15 | Procurement | Part 5 | Vendors, PO, GRN, supplier portal |

## 1.5 Communication Rules (Locked)

### Inter-Layer Communication
```
Applications → REST → Business Modules → Events → Other Modules
```

### Forbidden Patterns
- ❌ No module directly accesses another module's database
- ❌ No application directly accesses platform services (must go through business modules)
- ❌ No business engine directly renders UI
- ❌ No infrastructure layer contains business logic

### Allowed Patterns
- ✅ Applications call Business Modules via REST API
- ✅ Business Modules call Business Engines via in-process calls (modular monolith)
- ✅ Business Modules publish Events to Event Bus
- ✅ Business Modules subscribe to Events from other modules
- ✅ Business Engines call Platform Services via in-process calls
- ✅ Platform Services call Infrastructure via repositories

## 1.6 Architecture Decisions (Locked)

| Decision | Status | Rationale |
|---|---|---|
| Modular Monolith | ✅ LOCKED | Single deployment initially; microservices when scale demands |
| Domain Driven Design | ✅ LOCKED | Aligns code with business domains |
| CQRS Ready | ✅ LOCKED | Command/Query separation for future scaling |
| Event Driven | ✅ LOCKED | Decoupled module communication |
| Clean Architecture | ✅ LOCKED | Dependency inversion, testability |
| Hexagonal Architecture Compatible | ✅ LOCKED | Ports and adapters pattern |
| Business Engine First (Q199) | ✅ LOCKED | Reusable engines, no duplicated logic |

---

# Part 2: Enterprise Technology Stack Standards

## 2.1 Approved Technology Stack (Locked)

### Frontend (Desktop ERP)
| Technology | Purpose | Version Constraint |
|---|---|---|
| **Next.js** | React framework (App Router) | 15+ |
| **React** | UI library | 19+ |
| **TypeScript** | Type safety | 5.5+ |
| **Tailwind CSS** | Styling | 4+ |
| **Shadcn UI** | Component library | Latest |
| **TanStack Query** | Server state management | 5+ |
| **AG Grid Enterprise** | Data tables | Latest |
| **React Hook Form** | Form management | 7+ |
| **Zod** | Schema validation | 3+ |

### Mobile (Operational Apps)
| Technology | Purpose | Version Constraint |
|---|---|---|
| **React Native** | Cross-platform mobile | 0.75+ |
| **Expo** | Development toolchain | SDK 51+ (dev), EAS Build (prod) |
| **SQLite** | Local database | Latest |
| **WatermelonDB** | Offline-first sync | Latest |
| **Offline Sync** | Custom sync engine | Per SUOP spec |

### Backend
| Technology | Purpose | Version Constraint |
|---|---|---|
| **NestJS** | Node.js framework | 10+ |
| **TypeScript** | Type safety | 5.5+ |
| **Prisma ORM** | Primary ORM | 5+ |
| **Drizzle** | Optional for reporting queries | Latest |
| **BullMQ** | Job queue (Redis-backed) | Latest |
| **Passport** | Authentication | Latest |
| **Class Validator** | DTO validation | Latest |

### Database
| Technology | Purpose | Version Constraint |
|---|---|---|
| **PostgreSQL** | Primary database | 16+ |
| **Redis** | Cache, queues, sessions | 7+ |
| **Object Storage** | File storage (S3 compatible) | MinIO/AWS S3/Azure Blob |

### Messaging
| Technology | Purpose | Version Constraint |
|---|---|---|
| **RabbitMQ** | Primary message broker | 3.13+ |
| **Redis Streams** | Lightweight streaming | 7+ |
| **Kafka Ready** | Future scalability | Architecture supports migration |

### Search
| Technology | Purpose | Version Constraint |
|---|---|---|
| **OpenSearch** | Enterprise search (Elasticsearch compatible) | 2+ |

### Reports
| Technology | Purpose | Version Constraint |
|---|---|---|
| **FastReport / PDF Engine** | PDF generation | Latest |
| **ExcelJS** | Excel export | Latest |
| **CSV** | CSV export | Native |

### AI
| Technology | Purpose | Version Constraint |
|---|---|---|
| **OpenAI** | LLM provider | GPT-4 Turbo+ |
| **Azure OpenAI** | Enterprise LLM | Latest |
| **Gemini** | Google LLM | Latest |
| **Local LLM Support** | On-premise fallback | Ollama/vLLM |

### Monitoring
| Technology | Purpose | Version Constraint |
|---|---|---|
| **Prometheus** | Metrics collection | Latest |
| **Grafana** | Dashboards | Latest |
| **Loki** | Log aggregation | Latest |
| **Tempo** | Distributed tracing | Latest |
| **OpenTelemetry** | Instrumentation standard | Latest |

### Infrastructure
| Technology | Purpose | Version Constraint |
|---|---|---|
| **Docker** | Containerization | Latest |
| **Kubernetes** | Orchestration | 1.30+ |
| **Terraform** | Infrastructure as Code | Latest |
| **GitHub Actions** | CI/CD | Latest |
| **Nginx** | Reverse proxy / load balancer | Latest |
| **Cloudflare** | CDN, DNS, WAF | Latest |

## 2.2 Non-Negotiable Rules (Locked)

| Rule | Rationale |
|---|---|
| ❌ No PHP | TypeScript/Node.js is the standard |
| ❌ No WordPress | SUOP is a custom enterprise platform |
| ❌ No jQuery | React is the standard |
| ❌ No business logic in frontend | Frontend is only a client |
| ❌ No raw SQL inside controllers | Use repositories/ORM |
| ❌ No direct database access from UI | Must go through API layer |

These rules are **non-negotiable** and enforced through code review, linting, and CI/CD gates.

---

# Part 3: Enterprise Monorepo Architecture

## 3.1 Repository Structure (Locked)

```text
suop/
│
├── apps/                          # Application entry points
│   ├── admin/                     # Desktop ERP admin panel (Next.js)
│   ├── warehouse/                 # Warehouse management app (Next.js + mobile)
│   ├── retail-pos/                # Retail POS (Next.js + React Native)
│   ├── restaurant-pos/            # Restaurant POS (Next.js + React Native)
│   ├── executive-dashboard/       # Executive BI dashboard (Next.js)
│   ├── supplier-portal/           # Supplier portal (Next.js)
│   ├── customer-portal/           # Customer portal (Next.js)
│   ├── mobile-workforce/          # HR/ESS mobile app (React Native)
│   └── mobile-maintenance/        # EAM mobile app (React Native)
│
├── modules/                       # Business modules (bounded contexts)
│   ├── organization/              # Company, branch, department
│   ├── identity/                  # Users, auth, sessions
│   ├── product/                   # Product master data
│   ├── inventory/                 # Stock ledger, valuation
│   ├── procurement/               # Vendors, PO, GRN
│   ├── warehouse/                 # WMS operations
│   ├── manufacturing/             # MES operations
│   ├── quality/                   # QMS operations
│   ├── finance/                   # Accounting, GL
│   ├── workforce/                 # HR, payroll
│   ├── maintenance/               # EAM operations
│   ├── analytics/                 # BI, reporting
│   └── ai/                        # AI gateway, copilot
│
├── packages/                      # Shared packages (reusable)
│   ├── ui/                        # Common UI components
│   ├── auth/                      # Auth client library
│   ├── database/                  # Prisma schema, migrations
│   ├── sdk/                       # API client SDK
│   ├── barcode/                   # Barcode/QR scanning
│   ├── search/                    # Search client
│   ├── reporting/                 # Report generation
│   └── shared/                    # Utilities, constants, types
│
├── services/                      # Platform services (Business Engines + Platform Kernel)
│   ├── workflow/                  # Workflow Engine (Business Engine)
│   ├── notification/              # Notification Engine
│   ├── audit/                     # Audit Engine
│   ├── accounting-event/          # Accounting Event Engine (Business Engine)
│   ├── api-gateway/               # API Gateway
│   ├── integration/               # Integration Framework
│   └── scheduler/                 # Scheduler & Background Jobs
│
├── infrastructure/                # Infrastructure as Code
│   ├── docker/                    # Dockerfiles, docker-compose
│   ├── kubernetes/                # K8s manifests, Helm charts
│   ├── terraform/                 # Cloud infrastructure
│   └── monitoring/                # Prometheus, Grafana, Loki configs
│
├── tools/                         # Development tools
│   ├── generators/                # Code generators
│   ├── migrations/                # Database migration scripts
│   └── scripts/                   # Build, deploy, utility scripts
│
├── docs/                          # Documentation
│   ├── architecture/              # Architecture docs
│   ├── api/                       # API specs (OpenAPI)
│   ├── runbooks/                  # Operational runbooks
│   └── adr/                       # Architecture Decision Records
│
├── .github/                       # GitHub Actions workflows
├── turbo.json                     # Turborepo configuration
├── package.json                   # Root package.json
├── pnpm-workspace.yaml            # pnpm workspace config
├── tsconfig.base.json             # Shared TypeScript config
├── .eslintrc.js                   # ESLint config
├── .prettierrc                    # Prettier config
└── README.md                      # Project overview
```

## 3.2 Dependency Rules (Locked)

```
Applications → Modules → Platform Services → Infrastructure

Never reverse.
Never skip layers.
```

### Detailed Dependency Rules

| Source | Can Depend On | Cannot Depend On |
|---|---|---|
| `apps/*` | `modules/*`, `packages/*` | `services/*` directly, `infrastructure/*` |
| `modules/*` | `services/*`, `packages/*` | Other `modules/*` directly (use events) |
| `services/*` | `packages/*` | `modules/*`, `apps/*` |
| `packages/*` | `packages/shared` only | Anything else |
| `infrastructure/*` | Nothing (standalone) | Application code |

## 3.3 Shared Package Standards (Locked)

### `packages/ui`
| Component Type | Examples |
|---|---|
| Common Components | Button, Input, Modal, Card, Badge |
| Icons | SUOP icon set |
| Tables | AG Grid wrapper, data table |
| Forms | Form builder, field components |
| Charts | Chart wrapper (ReCharts/ECharts) |

### `packages/database`
| Content | Description |
|---|---|
| Schema | Prisma schema files |
| Migrations | Database migrations |
| Repositories | Base repository classes |
| Seeders | Test data generation |

### `packages/shared`
| Content | Description |
|---|---|
| Utilities | Date, string, number helpers |
| Constants | Enterprise constants |
| Validation | Zod schemas |
| Enums | Shared enumerations |
| Types | Shared TypeScript types |

### `packages/sdk`
| Content | Description |
|---|---|
| API Client | Auto-generated from OpenAPI |
| Authentication | Token management |
| Offline Sync | WatermelonDB sync protocol |
| Type-safe endpoints | Full type safety |

---

# Part 4: Enterprise Database Architecture

## 4.1 Database Philosophy (Locked)

**One enterprise database. Multiple schemas. Strong boundaries.**

- Single PostgreSQL instance (modular monolith)
- Each bounded context has its own schema
- No cross-schema foreign keys (use event-based synchronization)
- Strong logical boundaries enforced at application layer

## 4.2 Database Architecture (Locked)

```text
PostgreSQL
│
├── platform           # Platform Kernel tables
├── organization       # Company, branch, department
├── identity           # Users, sessions, devices
├── inventory          # Stock ledger, transactions
├── warehouse          # WMS operations
├── manufacturing      # MES operations
├── quality            # QMS operations
├── procurement        # Vendors, PO, GRN
├── finance            # Accounting, GL
├── workforce          # HR, payroll
├── maintenance        # EAM operations
├── retail             # Retail operations
├── restaurant         # Restaurant operations
├── analytics          # Data warehouse tables
├── audit              # Audit events (append-only)
└── ai                 # AI gateway, knowledge base
```

## 4.3 Database Standards (Locked)

### Primary Keys
| Standard | Implementation |
|---|---|
| UUID Primary Keys | `UUID v7` (time-ordered, sortable) |
| Foreign Keys Mandatory | All relationships explicitly defined |
| Soft Delete | `deleted_at TIMESTAMPTZ NULL` |
| Audit Columns | `created_at`, `updated_at`, `created_by`, `updated_by` |
| Version Column | `version INTEGER DEFAULT 1` for optimistic locking |
| Optimistic Locking | All updates check `WHERE version = :expected` |

### Naming Standards
| Standard | Example |
|---|---|
| snake_case | `inventory_transactions` |
| Plural table names only | `products` (not `product`) |
| Singular prohibited | ❌ `product` |
| Junction tables | `product_categories` |
| Audit tables | `audit_events` |
| Junction/mapping | `role_permissions` |

### Column Naming
| Pattern | Example |
|---|---|
| Foreign keys | `company_id`, `branch_id` |
| Boolean | `is_active`, `has_permission` |
| Timestamps | `created_at`, `updated_at`, `deleted_at` |
| Amounts | `amount`, `total_cost` |
| JSONB | `metadata`, `attributes`, `config` |

## 4.4 Performance Standards (Locked)

| Technique | When to Use |
|---|---|
| **Indexes** | All foreign keys, frequently queried columns, unique constraints |
| **Partitioning** | Time-series data (audit_events, sensor_readings) partitioned by month |
| **Materialized Views** | Pre-aggregated analytics (daily sales, monthly summaries) |
| **Read Replicas** | Reporting queries, analytics workloads |
| **Connection Pooling** | PgBouncer for connection management |
| **Partial Indexes** | `WHERE deleted_at IS NULL` for soft-deleted records |

### Index Strategy
```sql
-- Every foreign key gets an index
CREATE INDEX idx_products_company_id ON products(company_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_inventory_transactions 
    ON inventory_transactions(company_id, facility_id, product_id, transaction_date);

-- Partial indexes for soft-deleted records
CREATE INDEX idx_products_active 
    ON products(company_id) 
    WHERE deleted_at IS NULL;

-- Time-series partitioning
CREATE TABLE audit_events (...) PARTITION BY RANGE (action_timestamp);
```

## 4.5 Backup Strategy (Locked)

| Strategy | Frequency | Retention |
|---|---|---|
| **Daily Backup** | Every 24 hours | 30 days |
| **Point In Time Recovery** | Continuous (WAL archiving) | 7 days |
| **Replication** | Real-time (streaming replication) | Continuous |
| **Monthly Archive** | 1st of every month | 7 years (compliance) |
| **Cross-region Backup** | Daily | 90 days |

---

# Part 5: Enterprise Backend Architecture

## 5.1 Backend Philosophy (Locked)

**Backend owns all business logic. Frontend is only a client.**

The backend is the single source of truth for all business rules, validations, and data integrity. The frontend is a presentation layer that consumes APIs.

## 5.2 Backend Architecture (Locked)

```text
Controller (HTTP handling, DTO validation)
    ↓
Application Service (use cases, transactions, authorization)
    ↓
Domain Service (business rules, entities, validation, events)
    ↓
Repository (data access, persistence)
    ↓
Database (PostgreSQL)
```

### Layer Responsibilities

| Layer | Responsibility | What It Does NOT Do |
|---|---|---|
| **Controller** | HTTP handling, DTO validation, response formatting | No business logic |
| **Application Service** | Use case orchestration, transaction management, authorization | No HTTP handling, no DB access |
| **Domain Service** | Business rules, entity validation, domain events | No HTTP handling, no DB access |
| **Repository** | Data access, persistence, query execution | No business logic |

## 5.3 Standard Module Structure (Locked)

Every business module follows this directory structure:

```text
inventory/
│
├── controllers/               # HTTP controllers
│   ├── inventory.controller.ts
│   └── stock-adjustment.controller.ts
│
├── services/                  # Application & Domain services
│   ├── inventory.service.ts          # Application service
│   ├── stock-valuation.service.ts    # Domain service
│   └── reservation.service.ts        # Domain service
│
├── repositories/              # Data access
│   ├── inventory.repository.ts
│   └── stock-ledger.repository.ts
│
├── entities/                  # Domain entities
│   ├── inventory-item.entity.ts
│   └── stock-transaction.entity.ts
│
├── dto/                       # Data Transfer Objects
│   ├── create-stock-adjustment.dto.ts
│   └── inventory-query.dto.ts
│
├── events/                    # Domain events
│   ├── inventory-reserved.event.ts
│   ├── stock-adjusted.event.ts
│   └── inventory-received.event.ts
│
├── commands/                  # CQRS commands
│   ├── reserve-stock.command.ts
│   └── adjust-stock.command.ts
│
├── queries/                   # CQRS queries
│   ├── get-stock-balance.query.ts
│   └── get-valuation.query.ts
│
├── validators/                # Business validators
│   ├── stock-validator.ts
│   └── reservation-validator.ts
│
├── guards/                    # Authorization guards
│   ├── inventory-permission.guard.ts
│   └── facility-scope.guard.ts
│
├── interceptors/              # Cross-cutting interceptors
│   ├── audit.interceptor.ts
│   └── tenant.interceptor.ts
│
├── tests/                     # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── inventory.module.ts        # NestJS module definition
└── index.ts                   # Public API (exports)
```

## 5.4 Backend Standards (Locked)

| Standard | Implementation |
|---|---|
| **NestJS Modules** | Each bounded context is a NestJS module |
| **Dependency Injection** | All services injected, no manual instantiation |
| **CQRS Ready** | Commands and Queries separated (can split later) |
| **Repository Pattern** | All DB access through repositories, never in services |
| **DTO Validation** | All inputs validated via Class Validator + Zod |
| **Global Exception Filter** | Centralized error handling with proper HTTP status codes |
| **Request Logging** | Every request logged with correlation ID |
| **Audit Logging** | All state changes audited via Audit Engine |

## 5.5 API Standards (Locked)

| Standard | Implementation |
|---|---|
| **REST** | Primary API style |
| **JSON** | Request/response format |
| **OpenAPI** | Auto-generated API documentation (Swagger) |
| **Versioning** | URL path versioning (`/api/v1/`, `/api/v2/`) |
| **Pagination** | Cursor-based pagination for large datasets |
| **Filtering** | Query parameter filtering (`?status=active&category=food`) |
| **Sorting** | Query parameter sorting (`?sort=-created_at,name`) |
| **Cursor Pagination** | `?cursor=abc123&limit=50` for infinite scroll |

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 50,
    "total": 1250,
    "cursor": "eyJpZCI6IjEyMzQ1In0="
  },
  "correlationId": "uuid-v7"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "quantity", "message": "Quantity must be greater than 0" }
    ]
  },
  "correlationId": "uuid-v7"
}
```

## 5.6 Event Standards (Locked)

**Every module publishes domain events.** Events are the primary mechanism for cross-module communication.

### Event Naming Convention
```
{entity}.{action}    →   purchase_order.submitted
{entity}.{action}    →   inventory_reserved
{entity}.{action}    →   goods_received
```

### Event Structure
```json
{
  "eventId": "uuid-v7",
  "eventType": "purchase_order.submitted",
  "eventVersion": "1.0",
  "eventTimestamp": "2026-07-08T10:30:00Z",
  "source": "procurement-service",
  "sourceEntityType": "purchase_order",
  "sourceEntityId": "uuid-v7",
  "payload": { ... },
  "metadata": {
    "userId": "uuid-v7",
    "correlationId": "uuid-v7",
    "tenantId": "uuid-v7"
  }
}
```

### Standard Domain Events (Locked)

| Module | Events |
|---|---|
| **Inventory** | `InventoryReserved`, `InventoryReleased`, `StockAdjusted`, `InventoryReceived`, `InventoryShipped` |
| **Procurement** | `PurchaseOrderApproved`, `GoodsReceived`, `VendorCreated` |
| **Manufacturing** | `BatchProduced`, `ProductionOrderStarted`, `ProductionOrderCompleted` |
| **Finance** | `InvoicePosted`, `PaymentReceived`, `JournalEntryCreated` |
| **Workforce** | `EmployeeJoined`, `LeaveApproved`, `PayrollProcessed` |
| **Maintenance** | `MachineBreakdown`, `WorkOrderCompleted`, `PMCompleted` |
| **Quality** | `QualityInspectionPassed`, `QualityFailureDetected`, `CAPAOpened` |
| **Warehouse** | `GoodsPicked`, `GoodsPacked`, `GoodsShipped`, `GoodsReceived` |

## 5.7 Testing Standards (Locked)

| Test Type | Coverage Target | Tool |
|---|---|---|
| **Unit Tests** | 80%+ | Jest |
| **Integration Tests** | All critical paths | Jest + Testcontainers |
| **API Tests** | All endpoints | Supertest + Jest |
| **Contract Tests** | All public APIs | Pact |
| **Performance Tests** | Critical paths | k6 |

### Test File Naming
```
*.spec.ts          # Unit tests
*.integration.ts   # Integration tests
*.e2e.ts           # End-to-end tests
```

## 5.8 Security Standards (Locked)

| Standard | Implementation |
|---|---|
| **JWT** | Access tokens (15 min) + refresh tokens (7 days) |
| **RBAC** | Role-based access control per Volume 0.5 Part 14 §2 |
| **Permission Validation** | Every endpoint has `@Permissions()` decorator |
| **Tenant Validation** | Every query filtered by `company_id` / `branch_id` |
| **Audit Logging** | All state changes audited via `@Audit()` decorator |
| **Rate Limiting** | Per-endpoint rate limits via API Gateway |

---

# Batch 1 Completion Summary

## Architectural Decisions Locked (Volume 0.75 Batch 1)

| Decision ID | Decision | Part |
|---|---|---|
| **Q199** | **Business Engine First Development Strategy** (Most important decision of entire project) | Part 1 |
| Q200 | Modular Monolith Architecture | Part 1 |
| Q201 | Domain Driven Design with 15 Bounded Contexts | Part 1 |
| Q202 | Event-Driven Inter-Module Communication | Part 1 |
| Q203 | Technology Stack Standards (Locked, Non-Negotiable) | Part 2 |
| Q204 | Monorepo Architecture with Strict Dependency Rules | Part 3 |
| Q205 | Multi-Schema PostgreSQL Database Architecture | Part 4 |
| Q206 | Clean Architecture Backend (Controller → App Service → Domain Service → Repository) | Part 5 |
| Q207 | CQRS-Ready Command/Query Separation | Part 5 |
| Q208 | Cursor-Based API Pagination | Part 5 |
| Q209 | Domain Event Publishing for All Modules | Part 5 |
| Q210 | 80%+ Unit Test Coverage Requirement | Part 5 |

**Cumulative Architectural Decisions**: 210 (Q1-Q210)

## Foundation Services Status

All 66 Foundation Services from Volume 0.5 are confirmed and carried forward. No new Foundation Services added in Volume 0.75 Batch 1 (technical architecture defines how to build them, not new ones).

## Volume 0.75 Progress Tracker

| Batch | Parts | Status |
|---|---|---|
| **Batch 1** | **1-5 (Solution Arch, Tech Stack, Monorepo, Database, Backend)** | **✅ COMPLETE (LOCKED)** |
| Batch 2 | 6-10 (Frontend, Mobile, API, Events, Infrastructure) | ⏳ PENDING |
| Batch 3 | 11-15 (Security, DevOps, AI Arch, Engineering Standards) | ⏳ PENDING |

## Cumulative Status

| Metric | Value |
|---|---|
| Volume 0.5 Entities | 815 |
| Foundation Services | 66 + Platform Kernel (Q189/Q192) |
| Architectural Decisions | 210 (Q1-Q210) |
| Volume 0.75 Parts Complete | 5 of ~15 |

---

## 🏆 Business Engine First — Q199 (Most Important Decision of the Entire Project)

The **Business Engine First** development strategy is the **capstone architectural decision** that ties together everything from Volume 0.5 (815 entities, 66 Foundation Services) with the technical implementation in Volume 0.75.

### Why This Is the Most Important Decision

1. **It prevents the #1 enterprise software failure**: duplicated business logic across modules
2. **It aligns with modern enterprise vendors**: SAP, Oracle, Microsoft Dynamics all use this pattern
3. **It gives SUOP a stronger long-term foundation**: engines evolve independently from applications
4. **It enables the Platform Kernel vision** (Q189/Q192): engines ARE the platform kernel's business capabilities
5. **It makes Volume 1 implementation cleaner**: build engines first, then modules consume them

### Engine Build Order (Recommended for Volume 1)

```
Phase 1: Platform Foundation
  → Identity Engine, RBAC Engine, Configuration Engine

Phase 2: Business Engines
  → Inventory Engine (stock ledger, valuation, reservation)
  → Workflow Engine (approvals, routing, escalation)
  → Accounting Event Engine (journal postings, GL)
  → Notification Engine (multi-channel delivery)

Phase 3: Business Modules
  → Warehouse (consumes Inventory Engine)
  → Procurement (consumes Workflow Engine, Accounting Event Engine)
  → Manufacturing (consumes Inventory Engine, Workflow Engine)
  → Finance (consumes Accounting Event Engine)
  → HR/Workforce (consumes Workflow Engine, Accounting Event Engine)
  → Maintenance (consumes Inventory Engine, Workflow Engine)

Phase 4: Applications
  → Admin ERP (consumes all modules)
  → Warehouse App (consumes Warehouse module)
  → Retail POS (consumes Retail module)
  → Restaurant POS (consumes Restaurant module)
  → Mobile Apps (consumes respective modules)

Phase 5: Intelligence Layer
  → AI Gateway, Copilot, Agents
  → Data Warehouse, BI, Digital Twin
  → Mission Control, Platform Observability
```

---

*End of Volume 0.75 Batch 1. Next batch: Parts 6-10 (Frontend Architecture, Mobile Architecture, API Standards, Event-Driven Architecture, Infrastructure & Kubernetes Architecture).*
