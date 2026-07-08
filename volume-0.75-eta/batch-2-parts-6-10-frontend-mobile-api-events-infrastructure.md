# SUOP Volume 0.75 — Enterprise Technical Architecture (ETA)
# Batch 2 — Parts 6-10: Frontend, Mobile, API, Event-Driven & Infrastructure Architecture

## Document Metadata

| Attribute | Value |
|---|---|
| Volume | 0.75 — Enterprise Technical Architecture (ETA) |
| Batch | 2 |
| Parts | 6-10 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1-9, Volume 0.5 Manual 1 Parts 1-15, Volume 0.75 Batch 1 |
| Last Updated | 2026-07-08 |
| Purpose | Define how every UI, mobile app, API, event, and infrastructure component works together as a cloud-native enterprise platform |

---

## Overview — From Application to Cloud-Native Enterprise Platform

Batch 2 transforms SUOP from an application into a **cloud-native enterprise platform**. This batch defines how every UI, mobile app, API, event, and infrastructure component works together.

```
FRONTEND (Part 6)     MOBILE (Part 7)      API (Part 8)
  Next.js Desktop       React Native         REST + WebSocket
  ↓                     ↓                    ↓
  Feature Modules       Offline Sync         API Gateway
  ↓                     ↓                    ↓
  React Query           WatermelonDB         Business Modules
  ↓                     ↓                    ↓
  API SDK               API SDK              Database
                                                ↓
EVENTS (Part 9)              INFRASTRUCTURE (Part 10)
  Event Bus                    Kubernetes
  RabbitMQ                     Docker
  Domain Events                PostgreSQL + Redis + RabbitMQ
  Dead Letter Queue            CI/CD + Monitoring + HA
```

### 🏆 Architectural Lock: Backend-for-Frontend (BFF) Pattern (Q211)

Per Chief Enterprise Architect recommendation, the **Backend-for-Frontend (BFF) pattern** is hereby locked as **Architectural Decision Q211**. Instead of allowing every client application to call all backend services directly, dedicated BFFs mediate between clients and business services.

**Problem Solved**: Without BFFs, each client (desktop, mobile, POS, dashboard) makes direct API calls to business modules, leading to over-fetching, under-fetching, security complexity, and tight coupling between UI concerns and business services.

**Anti-Pattern (Forbidden)**:
```
Desktop ERP ──→ API Gateway ──→ All Business Services (direct)
Warehouse App ──→ API Gateway ──→ All Business Services (direct)
Retail POS ──→ API Gateway ──→ All Business Services (direct)
[... each client calls everything directly ...]
```

**Locked Pattern — Backend-for-Frontend**:
```
Desktop ERP ──────┐
Warehouse App ────┤
Retail POS ───────┤
Restaurant POS ───┤
Executive Dashboard┤
Mobile Apps ──────┘
        │
        ▼
┌──────────────────────────┐
│  Backend for Frontend    │
│  (Dedicated BFFs)        │
│                          │
│  • Admin BFF (ERP)       │
│  • Warehouse BFF         │
│  • Retail BFF (POS)      │
│  • Restaurant BFF        │
│  • Executive BFF         │
│  • Mobile BFF (ESS/MSS)  │
└──────────────────────────┘
        │
        ▼
    API Gateway
        │
        ▼
    Business Services
```

**BFF Responsibilities (Locked)**:
1. **Aggregate data** from multiple business services into client-optimized responses
2. **Transform data** to match client-specific formats (desktop vs mobile vs POS)
3. **Enforce client-specific security** and rate limiting
4. **Cache responses** for performance
5. **Handle client-specific error formatting**
6. **Provide client-specific WebSocket subscriptions**

**BFF Implementation Rules (Locked)**:
- Each BFF is a lightweight NestJS service (not a full business module)
- BFFs call Business Modules via internal API or in-process calls (modular monolith)
- BFFs do NOT contain business logic — only aggregation, transformation, and caching
- BFFs are optional (clients can still call API Gateway directly for simple use cases)
- BFFs are deployed as separate containers for independent scaling

**Architectural Benefits (Locked)**:
1. **Optimized APIs** for each client (no over-fetching/under-fetching)
2. **Better security** — each BFF enforces client-specific auth and rate limiting
3. **Easier evolution** — mobile and desktop apps can evolve independently
4. **Cleaner separation** between UI concerns and business services
5. **Widely used** in large-scale enterprise systems (Netflix, SoundCloud, Spotify)
6. **Scalable** — additional applications get their own BFF without affecting others

**Governance (Q211 — LOCKED)**: BFFs are owned by the Application Platform team (subset of Platform Kernel). Business modules are unaware of BFFs — they expose standard APIs. BFFs are consumers, not owners, of business logic.

---

# Part 6: Enterprise Frontend Architecture

## 6.1 Frontend Philosophy (Locked)

**The frontend is NOT responsible for business logic.**

It is a **presentation layer** that:
- Consumes APIs
- Displays data
- Validates user input (client-side only; backend is source of truth)
- Manages user interaction

### What the Frontend Does NOT Do
| Forbidden | Rationale |
|---|---|
| ❌ Business rule calculations | Backend owns all business logic (per Q206) |
| ❌ Direct database access | Must go through API (per Part 1 communication rules) |
| ❌ Cross-module orchestration | Backend handles cross-module flows |
| ❌ Data transformation beyond display | Backend transforms; frontend renders |

## 6.2 Frontend Architecture (Locked)

```text
Next.js Desktop App
    ↓
Feature Modules (lazy-loaded)
    ↓
Shared UI Components
    ↓
React Query (server state)
    ↓
API SDK (type-safe, centralized)
    ↓
REST / WebSocket
    ↓
Backend Services (via BFF → API Gateway)
```

### Architecture Layers

| Layer | Responsibility | Technology |
|---|---|---|
| **App Router** | Routing, layout, SSR/SSG | Next.js App Router |
| **Feature Modules** | Feature-specific pages & components | React + TypeScript |
| **Shared UI** | Reusable components | Shadcn UI, packages/ui |
| **Server State** | API data fetching & caching | TanStack Query (React Query) |
| **Client State** | UI-only state (modals, filters) | Zustand |
| **API SDK** | Type-safe API client | packages/sdk (auto-generated from OpenAPI) |

## 6.3 Technology Standards (Locked)

### Framework
| Technology | Purpose | Version |
|---|---|---|
| **Next.js** | React framework (App Router) | 15+ |
| **React** | UI library | 19+ |
| **TypeScript** | Type safety | 5.5+ |

### UI
| Technology | Purpose | Version |
|---|---|---|
| **Tailwind CSS** | Styling framework | 4+ |
| **Shadcn UI** | Component library (Radix-based) | Latest |
| **AG Grid Enterprise** | Advanced data tables | Latest |
| **TanStack Table** | Lightweight tables (headless) | 8+ |
| **React Hook Form** | Form management | 7+ |
| **Zod** | Schema validation | 3+ |

### Charts
| Technology | Purpose | Version |
|---|---|---|
| **Apache ECharts** | Enterprise charting library | 5+ |

### State Management
| Technology | Purpose | Version |
|---|---|---|
| **React Query** (TanStack Query) | Server state (API data, caching, mutations) | 5+ |
| **Zustand** | Client state (UI-only: modals, filters, theme) | 5+ |

### State Management Rules (Locked)
| State Type | Tool | Examples |
|---|---|---|
| **Server State** | React Query | Product list, PO details, user profile |
| **Client State** | Zustand | Modal open/close, active filters, sidebar toggle |
| **URL State** | Next.js searchParams | Page number, sort order, selected tab |
| **Form State** | React Hook Form | Input fields, validation |
| ❌ **Global Business State** | FORBIDDEN | No Redux for business data — use React Query |

## 6.4 UI Folder Structure (Locked)

```text
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group
│   ├── (dashboard)/        # Dashboard route group
│   ├── inventory/          # Inventory pages
│   ├── procurement/        # Procurement pages
│   ├── warehouse/          # Warehouse pages
│   ├── manufacturing/      # Manufacturing pages
│   ├── finance/            # Finance pages
│   ├── workforce/          # HR pages
│   ├── maintenance/        # EAM pages
│   ├── analytics/          # BI pages
│   └── layout.tsx          # Root layout
│
├── features/               # Feature modules (per business domain)
│   ├── inventory/          # Inventory feature
│   │   ├── components/     # Feature-specific components
│   │   ├── hooks/          # Feature-specific hooks
│   │   ├── schemas/        # Zod schemas for this feature
│   │   ├── types.ts        # Feature types
│   │   └── index.ts        # Feature exports
│   ├── procurement/
│   ├── warehouse/
│   └── ... (one per business module)
│
├── components/             # Shared UI components
│   ├── ui/                 # Shadcn UI primitives
│   ├── layouts/            # Page layouts
│   ├── tables/             # AG Grid wrappers
│   ├── forms/              # Form components
│   ├── charts/             # EChart wrappers
│   └── common/             # Common components (PageHeader, EmptyState, etc.)
│
├── layouts/                # Application layouts
│   ├── DashboardLayout.tsx
│   ├── AuthLayout.tsx
│   └── PrintLayout.tsx
│
├── hooks/                  # Shared hooks
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── services/               # API service layer
│   ├── api-client.ts       # Centralized API client
│   ├── inventory.service.ts
│   ├── procurement.service.ts
│   └── ... (one per business module)
│
├── stores/                 # Zustand stores
│   ├── auth.store.ts       # Auth state
│   ├── theme.store.ts      # Theme (light/dark)
│   ├── filter.store.ts     # Global filters
│   └── ui.store.ts         # UI state (sidebar, modals)
│
├── types/                  # Shared TypeScript types
│   ├── api.ts              # API types (auto-generated)
│   ├── common.ts           # Common types
│   └── index.ts
│
├── utils/                  # Utility functions
│   ├── format.ts           # Date, currency, number formatting
│   ├── validation.ts       # Common validation helpers
│   └── helpers.ts          # General helpers
│
└── styles/                 # Global styles
    ├── globals.css         # Global CSS + Tailwind
    └── themes.css          # Theme variables
```

## 6.5 UI Principles (Locked)

| Principle | Description | Implementation |
|---|---|---|
| **Desktop-first ERP** | Admin/ERP optimized for desktop | Full-width tables, keyboard shortcuts, dense layouts |
| **Keyboard-first navigation** | Power users navigate without mouse | Hotkeys, tab navigation, command palette (Cmd+K) |
| **Responsive where required** | Not mobile-first for ERP; responsive for dashboards | Breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536) |
| **Lazy loading** | Load features on demand | Next.js dynamic imports, React.lazy for heavy components |
| **Dark & Light themes** | User preference | CSS variables, Tailwind dark: modifier, system detection |
| **Accessibility (WCAG)** | WCAG 2.1 AA compliant | Radix UI (Shadcn), ARIA labels, keyboard nav, screen reader |
| **Multi-language support** | i18n ready | next-intl or react-i18next, locale-based loading |

## 6.6 UI Standards (Locked)

| Standard | Implementation |
|---|---|
| Every page uses a consistent layout | `DashboardLayout` with `PageHeader`, `Breadcrumb`, `Content` |
| No direct API calls from UI components | All API access through `services/` layer (SDK) |
| All API access goes through centralized SDK | `packages/sdk` auto-generated from OpenAPI |
| Business rules remain in backend | Frontend only validates format, not business rules |
| Loading states | Skeleton loaders, not spinners (better UX) |
| Error states | Error boundaries + user-friendly error messages |
| Empty states | Every list/table has an empty state with CTA |
| Optimistic updates | For mutations (via React Query `onMutate`) |
| Infinite scroll or pagination | Cursor-based pagination for large lists |

---

# Part 7: Enterprise Mobile Architecture

## 7.1 Mobile Philosophy (Locked)

**Mobile apps are operational tools. They should support offline-first workflows.**

The mobile architecture is designed for environments where network connectivity is unreliable (warehouses, retail floors, restaurant kitchens, field maintenance).

### Mobile vs Desktop Strategy
| Platform | Priority | UX Style | Connectivity |
|---|---|---|---|
| **Desktop ERP** | Desktop-first | Dense, keyboard-driven | Always online |
| **Mobile (Warehouse)** | Mobile-first | Touch, scanner-driven | Offline-first |
| **Mobile (POS)** | Mobile-first | Quick transactions | Offline-capable |
| **Mobile (Field)** | Mobile-first | Task-driven | Offline-first |

## 7.2 Mobile Applications (Locked)

| Application | Platform | Primary Users | Key Features |
|---|---|---|---|
| **Warehouse** | React Native (Android + iOS) | Warehouse operators | Picking, packing, receiving, stock count, scanner |
| **Retail POS** | React Native (Android + iOS) | Cashiers | Checkout, returns, inventory check, customer lookup |
| **Restaurant POS** | React Native (Android + iOS) | Servers, chefs | Order taking, kitchen display, menu, billing |
| **Workforce (ESS)** | React Native (Android + iOS) | All employees | Payslip, leave, attendance, expense, profile |
| **Manager (MSS)** | React Native (Android + iOS) | Managers | Approvals, team status, KPIs, alerts |
| **Maintenance** | React Native (Android + iOS) | Technicians | Work orders, checklists, QR scan, photos, LOTO |
| **Delivery** | React Native (Android + iOS) | Delivery drivers | Route, delivery confirmation, GPS, e-signature |

## 7.3 Mobile Architecture (Locked)

```text
React Native App
    ↓
Feature Screens (navigation via React Navigation)
    ↓
Offline Database (SQLite + WatermelonDB)
    ↓
Sync Engine (incremental, conflict-aware)
    ↓
API SDK (type-safe, offline-queue)
    ↓
Backend (via Mobile BFF → API Gateway)
    ↓
Event Bus (real-time updates)
```

### Architecture Layers

| Layer | Responsibility | Technology |
|---|---|---|
| **Screens** | UI rendering, user interaction | React Native + TypeScript |
| **Navigation** | Screen navigation, deep linking | React Navigation 7+ |
| **Offline DB** | Local data persistence | SQLite + WatermelonDB |
| **Sync Engine** | Bidirectional sync with backend | Custom sync + WatermelonDB sync |
| **API SDK** | Type-safe API client with offline queue | packages/sdk (mobile variant) |
| **Device Integration** | Camera, scanner, GPS, Bluetooth | React Native modules |

## 7.4 Offline Strategy (Locked)

### Local Storage
| Technology | Purpose | Version |
|---|---|---|
| **SQLite** | Local database | Latest |
| **WatermelonDB** | Offline-first ORM over SQLite | Latest |

### Synchronization
| Capability | Implementation |
|---|---|
| **Incremental Sync** | Only sync changed records (using `updated_at` watermark) |
| **Conflict Detection** | Last-write-wins with server authority; conflicts flagged for review |
| **Retry Queue** | Failed syncs queued and retried with exponential backoff |
| **Background Sync** | Sync runs in background when network available |
| **Manual Sync** | User can trigger sync manually (pull-to-refresh) |

### Offline Data Strategy
```text
Online Operation:
  User Action → API Call → Backend → Response → UI Update + Local DB Write

Offline Operation:
  User Action → Local DB Write → UI Update → Queue for Sync

Sync (when online):
  Queue → API Call → Backend → Response → Update Local DB + Clear Queue
```

## 7.5 Mobile Standards (Locked)

### Device Capabilities
| Capability | Implementation | Used By |
|---|---|---|
| **Camera** | react-native-vision-camera | Photos, document capture |
| **Barcode Scanner** | react-native-vision-camera + ML Kit | Warehouse, POS, Maintenance |
| **QR Scanner** | Same as barcode | All apps |
| **RFID** | Native module (device-specific) | Warehouse, Maintenance |
| **GPS** | @react-native-community/geolocation | Delivery, Maintenance, Attendance |
| **Bluetooth Printer** | react-native-ble-plx | POS, Warehouse, Restaurant |
| **Push Notifications** | Firebase Cloud Messaging + APNs | All apps |
| **Offline Queue** | WatermelonDB + custom queue | All apps |
| **Biometric** | react-native-biometrics | Auth, sensitive operations |
| **NFC** | react-native-nfc-manager | Asset identification, payments (future) |

## 7.6 Synchronization Rules (Locked)

Every offline transaction receives:

| Field | Type | Description |
|---|---|---|
| `local_id` | UUID v7 | Client-generated unique ID |
| `server_id` | UUID v7 | Server-assigned ID (null until synced) |
| `sync_status` | ENUM | `PENDING`, `SYNCING`, `SYNCED`, `CONFLICT`, `FAILED` |
| `retry_count` | INTEGER | Number of sync retries (max 5) |
| `last_sync_attempt_at` | TIMESTAMPTZ | Last sync attempt |
| `synced_at` | TIMESTAMPTZ | Successful sync time |
| `conflict_resolution` | ENUM | `SERVER_WINS`, `CLIENT_WINS`, `MANUAL_REVIEW` |

### Sync Conflict Resolution Strategy (Locked)
1. **Server Authority**: Server is the source of truth for most data
2. **Last-Write-Wins**: For non-critical data (notes, preferences)
3. **Manual Review**: For critical data (inventory adjustments, payments)
4. **Version-Based**: Each record has `version` column; conflicts detected via version mismatch

---

# Part 8: Enterprise API Architecture

## 8.1 API Philosophy (Locked)

**Every application communicates through well-defined APIs. No direct database access.**

Per Volume 0.75 Part 1 communication rules (Q202): Applications → REST → Business Modules → Events → Other Modules.

## 8.2 API Architecture (Locked)

```text
Client (Web/Mobile/POS/External)
    ↓
BFF (Backend-for-Frontend) [per Q211]
    ↓
API Gateway (Auth, Rate Limit, Logging, Routing)
    ↓
Authentication (JWT validation)
    ↓
Business Module (Controller → Service → Repository)
    ↓
Database (PostgreSQL)
```

## 8.3 API Standards (Locked)

| Standard | Implementation | Status |
|---|---|---|
| **REST** | Primary API style | ✅ Locked (Q208) |
| **GraphQL** | Future (for complex queries) | Planned |
| **WebSocket** | Real-time (dashboards, notifications, chat) | ✅ Locked |
| **OpenAPI** | API specification (auto-generated) | ✅ Locked |
| **Versioning** | URL path versioning (`/api/v1/`) | ✅ Locked |

## 8.4 URL Convention (Locked)

```text
/api/v1/products
/api/v1/inventory
/api/v1/inventory/transactions
/api/v1/warehouse
/api/v1/warehouse/locations
/api/v1/manufacturing
/api/v1/manufacturing/production-orders
/api/v1/finance
/api/v1/finance/journal-entries
/api/v1/workforce
/api/v1/workforce/employees
/api/v1/maintenance
/api/v1/maintenance/work-orders
```

### URL Naming Rules
| Rule | Example |
|---|---|
| Plural nouns | `/api/v1/products` (not `/api/v1/product`) |
| Nested resources | `/api/v1/products/{id}/variants` |
| Actions as verbs | `/api/v1/purchase-orders/{id}/approve` |
| Query parameters | `/api/v1/products?status=active&category=food` |
| Version in path | `/api/v1/`, `/api/v2/` |

## 8.5 Response Standard (Locked)

### Success Response
```json
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": {
    "id": "uuid-v7",
    "poNumber": "PO-MUM-2026-001248",
    "status": "PENDING_APPROVAL"
  },
  "meta": {
    "page": 1,
    "pageSize": 50,
    "total": 1250,
    "cursor": "eyJpZCI6IjEyMzQ1In0=",
    "correlationId": "uuid-v7"
  },
  "errors": []
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "meta": {
    "correlationId": "uuid-v7"
  },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "field": "quantity",
      "message": "Quantity must be greater than 0"
    }
  ]
}
```

### List Response (with pagination)
```json
{
  "success": true,
  "message": "",
  "data": [
    { "id": "uuid-1", "name": "Product A" },
    { "id": "uuid-2", "name": "Product B" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 50,
    "total": 1250,
    "hasNext": true,
    "cursor": "eyJpZCI6InV1aWQtMiJ9",
    "correlationId": "uuid-v7"
  },
  "errors": []
}
```

## 8.6 API Rules (Locked)

| Rule | Implementation |
|---|---|
| **Pagination** | Cursor-based (default); offset-based (for simple cases) |
| **Filtering** | Query params: `?status=active&category=food&min_price=100` |
| **Sorting** | `?sort=-created_at,name` (negative = descending) |
| **Search** | `?q=keyword` for full-text search |
| **Cursor Pagination** | `?cursor=abc123&limit=50` for large datasets |
| **Rate Limiting** | Per-endpoint limits via API Gateway (per Volume 0.5 Entity 695) |
| **Validation** | Class Validator + Zod on all inputs |
| **API Documentation** | OpenAPI 3.0 spec auto-generated from NestJS decorators |

### HTTP Status Codes (Locked)
| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate or version conflict |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled error |

## 8.7 WebSocket Standards (Locked)

### Use Cases
| Use Case | WebSocket Channel | Real-time Data |
|---|---|---|
| **Dashboards** | `dashboard:{dashboardId}` | Live KPI updates |
| **Mission Control** | `mission-control:{companyId}` | Live enterprise metrics |
| **Manufacturing** | `manufacturing:{lineId}` | OEE, production rate, alerts |
| **Warehouse** | `warehouse:{facilityId}` | Pick/pack status, inventory updates |
| **Notifications** | `notifications:{userId}` | Push notifications, alerts |
| **Chat** | `chat:{sessionId}` | AI Copilot, team chat |
| **Approvals** | `approvals:{userId}` | Pending approval notifications |

### WebSocket Message Format
```json
{
  "type": "inventory.updated",
  "channel": "warehouse:fac-mum-001",
  "payload": {
    "productId": "uuid-v7",
    "facilityId": "fac-mum-001",
    "newStock": 450.00,
    "unit": "PCS"
  },
  "timestamp": "2026-07-08T10:30:00Z",
  "correlationId": "uuid-v7"
}
```

---

# Part 9: Enterprise Event-Driven Architecture

## 9.1 Event Philosophy (Locked)

**Modules communicate using events. Never through direct module-to-module calls.**

Per Q202 (Event-Driven Inter-Module Communication): Business modules publish domain events; other modules subscribe and react. No module directly calls another module's service or database.

## 9.2 Event Architecture (Locked)

```text
Inventory Module
    ↓
publishes: InventoryReserved (domain event)
    ↓
Event Bus (RabbitMQ)
    ↓
    ├── Manufacturing Module (subscribes: InventoryReserved)
    ├── Warehouse Module (subscribes: InventoryReserved)
    ├── Finance Module (subscribes: InventoryReserved)
    └── Analytics Module (subscribes: InventoryReserved)
```

### Communication Flow
1. **Publisher** (e.g., Inventory Module) performs a business action
2. Publisher **publishes a domain event** to the Event Bus (RabbitMQ)
3. Event Bus **routes** the event to all subscribers
4. **Subscribers** (e.g., Manufacturing, Finance) process the event asynchronously
5. All processing is **audited** via the Audit Engine

## 9.3 Event Categories (Locked)

| Category | Description | Examples |
|---|---|---|
| **Domain Events** | Business domain events within SUOP | `InventoryReserved`, `PurchaseOrderApproved`, `InvoicePosted` |
| **Integration Events** | Events for external system integration | `OrderSyncedToTally`, `PaymentReceivedFromRazorpay` |
| **Platform Events** | Platform-level events | `UserLoggedIn`, `ConfigurationChanged`, `FeatureFlagToggled` |
| **System Events** | Infrastructure/system events | `ServiceStarted`, `DatabaseBackupCompleted`, `QueueDepthHigh` |
| **AI Events** | AI-specific events | `AIRequestCompleted`, `ModelDriftDetected`, `AIDecisionMade` |

## 9.4 Event Standards (Locked)

### Event Structure
Each event contains:

```json
{
  "eventId": "uuid-v7",
  "eventType": "InventoryReserved",
  "eventVersion": "1.0",
  "eventCategory": "DOMAIN",
  "correlationId": "uuid-v7",
  "causationId": "uuid-v7",
  "traceId": "uuid-v7",
  "sourceModule": "inventory",
  "sourceService": "inventory-service",
  "sourceEntityType": "inventory_reservation",
  "sourceEntityId": "uuid-v7",
  "sourceEntityCode": "RES-2026-001234",
  "payload": {
    "productId": "uuid-v7",
    "facilityId": "uuid-v7",
    "quantityReserved": 100.00,
    "workOrderId": "uuid-v7",
    "reservedBy": "uuid-v7"
  },
  "metadata": {
    "userId": "uuid-v7",
    "tenantId": "uuid-v7",
    "ipAddress": "192.168.1.50"
  },
  "eventTimestamp": "2026-07-08T10:30:00Z",
  "publishedAt": "2026-07-08T10:30:00.050Z"
}
```

### Required Fields (Locked)
| Field | Type | Required | Description |
|---|---|---|---|
| `eventId` | UUID v7 | ✅ | Unique event identifier |
| `correlationId` | UUID v7 | ✅ | Cross-service correlation |
| `entity` (sourceEntityType + sourceEntityId) | String + UUID | ✅ | Source entity |
| `user` (metadata.userId) | UUID v7 | ✅ | User who triggered the event |
| `timestamp` (eventTimestamp) | TIMESTAMPTZ | ✅ | When event occurred |
| `version` (eventVersion) | String | ✅ | Schema version |
| `payload` | JSON | ✅ | Event data |

## 9.5 Communication Pattern (Locked)

```text
Publisher (Business Module)
    ↓
publishes event
    ↓
RabbitMQ Exchange
    ↓
routes to Queues
    ↓
Consumers (Business Modules)
    ↓
process event
    ↓
Audit Engine (all events logged)
```

### RabbitMQ Topology
| Component | Configuration |
|---|---|
| **Exchange** | Topic exchange (`suop.events`) |
| **Queue** | One queue per consumer module per event category |
| **Binding** | Routing key pattern: `{module}.{entity}.{action}` (e.g., `inventory.reservation.created`) |
| **Dead Letter Exchange** | `suop.events.dlx` for failed events |
| **Retry Queue** | TTL-based retry with exponential backoff |

## 9.6 Queue Standards (Locked)

| Queue Type | Purpose | Implementation |
|---|---|---|
| **FIFO** | Ordered processing | RabbitMQ with `x-queue-type: classic` + single consumer |
| **Priority** | High-priority events first | RabbitMQ priority queues (`x-max-priority: 10`) |
| **Retry** | Failed event retries | TTL-based retry queue with exponential backoff |
| **Dead Letter Queue** | Permanently failed events | DLX + DLQ (per Volume 0.5 Entity 708) |
| **Delayed Queue** | Scheduled events | RabbitMQ delayed message plugin |

## 9.7 Event Naming Convention (Locked)

### Naming Pattern
```
{Entity}{Action} (PascalCase)

Examples:
InventoryReserved
InventoryReleased
PurchaseOrderApproved
ProductionCompleted
InvoicePosted
PayrollProcessed
MachineBreakdown
GoodsReceived
WorkOrderCompleted
EmployeeJoined
QualityFailureDetected
```

### Standard Domain Events (Locked)

| Module | Events Published |
|---|---|
| **Inventory** | `InventoryReserved`, `InventoryReleased`, `StockAdjusted`, `InventoryReceived`, `InventoryShipped`, `InventoryTransferred`, `InventoryValued` |
| **Procurement** | `PurchaseOrderCreated`, `PurchaseOrderApproved`, `PurchaseOrderRejected`, `GoodsReceived`, `VendorCreated` |
| **Manufacturing** | `ProductionOrderStarted`, `BatchProduced`, `ProductionOrderCompleted`, `QualityChecked`, `MaterialConsumed` |
| **Warehouse** | `GoodsPicked`, `GoodsPacked`, `GoodsShipped`, `GoodsReceived`, `StockCountCompleted`, `LocationChanged` |
| **Finance** | `InvoicePosted`, `PaymentReceived`, `PaymentMade`, `JournalEntryCreated`, `GLPosted`, `FinancialPeriodClosed` |
| **Workforce** | `EmployeeJoined`, `EmployeeTerminated`, `LeaveApproved`, `LeaveRejected`, `PayrollProcessed`, `AttendanceMarked` |
| **Maintenance** | `MachineBreakdown`, `WorkOrderCreated`, `WorkOrderCompleted`, `PMCompleted`, `AssetTransferred`, `CalibrationCompleted` |
| **Quality** | `QualityInspectionPassed`, `QualityInspectionFailed`, `QualityFailureDetected`, `CAPAOpened`, `CAPAClosed` |
| **Retail** | `SaleCompleted`, `SaleReturned`, `CustomerCreated`, `LoyaltyPointsEarned` |
| **Restaurant** | `OrderPlaced`, `OrderServed`, `OrderBilled`, `TableOccupied`, `TableCleared` |

---

# Part 10: Infrastructure, Cloud & Kubernetes Architecture

## 10.1 Infrastructure Philosophy (Locked)

**Every environment should be reproducible. Infrastructure should be defined as code.**

Per Q203 (Technology Stack Standards): Docker, Kubernetes, Terraform, GitHub Actions are the approved infrastructure technologies.

## 10.2 Deployment Architecture (Locked)

```text
Internet
    ↓
Cloudflare (CDN, DNS, WAF, DDoS Protection)
    ↓
Nginx Ingress Controller (TLS Termination, Load Balancing)
    ↓
Kubernetes Cluster
    ├── platform namespace (Auth, RBAC, Audit, Config)
    ├── business namespace (Inventory, Finance, HR, etc.)
    ├── monitoring namespace (Prometheus, Grafana, Loki, Tempo)
    ├── analytics namespace (Data Warehouse, BI, Digital Twin)
    └── ai namespace (AI Gateway, Copilot, Agents)
    ↓
Containers (Docker)
    ↓
Stateful Services
    ├── PostgreSQL (Primary + Read Replicas)
    ├── Redis (Sentinel for HA)
    ├── RabbitMQ (Cluster)
    ├── OpenSearch (Cluster)
    └── MinIO (S3 Compatible Object Storage)
```

## 10.3 Container Standards (Locked)

Every service container includes:

| Standard | Implementation |
|---|---|
| **Dockerfile** | Multi-stage build, minimal base image (Alpine or Distroless) |
| **Health Check** | `HEALTHCHECK` in Dockerfile or K8s `livenessProbe` |
| **Readiness Probe** | K8s `readinessProbe` (service ready to receive traffic) |
| **Liveness Probe** | K8s `livenessProbe` (service alive, restart if not) |
| **Non-root User** | Container runs as non-root user (security) |
| **Resource Limits** | CPU and memory limits defined in K8s deployment |
| **Graceful Shutdown** | SIGTERM handling with 30-second grace period |

### Example Dockerfile (Locked Pattern)
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

## 10.4 Kubernetes Architecture (Locked)

### Namespaces
| Namespace | Purpose | Services |
|---|---|---|
| `platform` | Platform Kernel services | Auth, RBAC, Audit, Config, Workflow, Notification, Search |
| `business` | Business modules | Inventory, Warehouse, Manufacturing, Finance, HR, EAM, etc. |
| `monitoring` | Observability stack | Prometheus, Grafana, Loki, Tempo, Alertmanager |
| `analytics` | Analytics & AI | Data Warehouse, BI, Digital Twin, AI Gateway, Copilot |
| `ingress` | Ingress controllers | Nginx Ingress Controller, Cert-Manager |

### Kubernetes Resources (Locked)
| Resource | Purpose |
|---|---|
| **Deployments** | Stateless services (business modules, BFFs) |
| **StatefulSets** | Stateful services (PostgreSQL, Redis, RabbitMQ, OpenSearch) |
| **DaemonSets** | Per-node services (log collectors, monitoring agents) |
| **ConfigMaps** | Configuration data (non-sensitive) |
| **Secrets** | Sensitive data (passwords, API keys, certificates) |
| **Ingress** | HTTP/HTTPS routing |
| **HPA** | Horizontal Pod Autoscaler (CPU/memory/custom metrics) |
| **PDB** | Pod Disruption Budget (ensure minimum availability) |
| **NetworkPolicies** | Network segmentation (restrict pod-to-pod communication) |

## 10.5 Infrastructure Components (Locked)

### Database
| Component | Configuration | HA Strategy |
|---|---|---|
| **PostgreSQL** | Primary + 2 Read Replicas | Streaming replication + automatic failover (Patroni) |
| **Connection Pooling** | PgBouncer | Sidecar container |
| **Backup** | pgBackRest + WAL archiving | Daily full + continuous WAL + monthly archive |

### Cache
| Component | Configuration | HA Strategy |
|---|---|---|
| **Redis** | Primary + 2 Replicas | Redis Sentinel for automatic failover |
| **Persistence** | AOF + RDB snapshots | Append-only file for durability |

### Messaging
| Component | Configuration | HA Strategy |
|---|---|---|
| **RabbitMQ** | 3-node cluster | Quorum queues for durability |
| **Management** | RabbitMQ Management UI | Access via internal ingress |

### Search
| Component | Configuration | HA Strategy |
|---|---|---|
| **OpenSearch** | 3-node cluster | Replication factor 2 |
| **Index Storage** | Persistent volumes | SSD-backed |

### Storage
| Component | Configuration | HA Strategy |
|---|---|---|
| **MinIO** | 4-node distributed mode | Erasure coding for durability |
| **S3 Compatible** | Standard S3 API | Versioning + lifecycle policies |

### Monitoring
| Component | Purpose | Retention |
|---|---|---|
| **Prometheus** | Metrics collection | 90 days |
| **Grafana** | Dashboards | N/A |
| **Loki** | Log aggregation | 30 days |
| **Tempo** | Distributed tracing | 7 days |
| **Alertmanager** | Alert routing | N/A |

### Ingress
| Component | Purpose |
|---|---|
| **Nginx Ingress Controller** | HTTP/HTTPS routing, TLS termination |
| **Cert-Manager** | Automatic TLS certificate management (Let's Encrypt) |

## 10.6 CI/CD Pipeline (Locked)

```text
GitHub Push
    ↓
GitHub Actions Trigger
    ↓
┌─────────────────────────────────┐
│  1. Lint & Type Check           │
│  2. Unit Tests (80%+ coverage)  │
│  3. Integration Tests           │
│  4. Build Docker Image          │
│  5. Security Scan (Trivy)       │
│  6. Push to Container Registry  │
│  7. Deploy to Staging           │
│  8. E2E Tests on Staging        │
│  9. Manual Approval (Production)│
│ 10. Deploy to Production        │
│ 11. Health Check Verification   │
│ 12. Slack/Teams Notification    │
└─────────────────────────────────┘
```

### CI/CD Standards (Locked)
| Stage | Tool | Gate |
|---|---|---|
| **Lint** | ESLint + Prettier | Must pass |
| **Type Check** | TypeScript compiler | Must pass |
| **Unit Tests** | Jest | 80%+ coverage |
| **Integration Tests** | Jest + Testcontainers | Must pass |
| **Security Scan** | Trivy (container) + npm audit | No critical vulnerabilities |
| **E2E Tests** | Playwright (frontend) + Supertest (API) | Must pass |
| **Deployment** | Helm + kubectl | Blue-green or rolling update |
| **Rollback** | Helm rollback | Automatic on health check failure |

## 10.7 Backup Strategy (Locked)

| Backup Type | Frequency | Retention | Storage |
|---|---|---|---|
| **Database Full Backup** | Daily (2:00 AM) | 30 days | Object storage + cross-region |
| **PITR (WAL Archiving)** | Continuous | 7 days | Object storage |
| **Object Storage Versioning** | Every change | 90 days | MinIO with versioning |
| **Monthly Archive** | 1st of month | 7 years (compliance) | Cold storage |
| **Disaster Recovery Region** | Daily replication | 90 days | Different cloud region |

## 10.8 High Availability Strategy (Locked)

| Component | HA Strategy | RTO | RPO |
|---|---|---|---|
| **Application Pods** | Multiple replicas + HPA | 0 seconds (auto-restart) | 0 |
| **PostgreSQL** | Primary + 2 replicas + Patroni | < 30 seconds | < 1 second |
| **Redis** | Sentinel with 3 nodes | < 10 seconds | < 1 second |
| **RabbitMQ** | 3-node cluster with quorum queues | < 30 seconds | 0 (durable queues) |
| **OpenSearch** | 3-node cluster | < 60 seconds | < 5 seconds |
| **MinIO** | 4-node erasure coding | < 60 seconds | 0 |
| **Nginx Ingress** | Multiple replicas | 0 seconds | N/A |
| **Cloudflare** | Global anycast | 0 seconds | N/A |

### SLO Targets (Locked)
| Metric | Target |
|---|---|
| **Availability** | 99.9% (43.8 min/month downtime) |
| **API Latency (P95)** | < 500ms |
| **API Latency (P99)** | < 2000ms |
| **Recovery Time Objective (RTO)** | < 30 minutes |
| **Recovery Point Objective (RPO)** | < 1 minute |

---

# Batch 2 Completion Summary

## Architectural Decisions Locked (Volume 0.75 Batch 2)

| Decision ID | Decision | Part |
|---|---|---|
| **Q211** | **Backend-for-Frontend (BFF) Pattern** | Part 6 |
| Q212 | Frontend Server State via React Query (no Redux for business data) | Part 6 |
| Q213 | Mobile Offline-First Architecture (WatermelonDB + SQLite) | Part 7 |
| Q214 | Mobile Sync: Server Authority with Conflict Detection | Part 7 |
| Q215 | API Response Standard (success/message/data/meta/errors) | Part 8 |
| Q216 | WebSocket for Real-Time (dashboards, notifications, chat) | Part 8 |
| Q217 | Event-Driven Module Communication via RabbitMQ | Part 9 |
| Q218 | Domain Event Naming Convention (EntityAction PascalCase) | Part 9 |
| Q219 | Kubernetes Multi-Namespace Architecture | Part 10 |
| Q220 | CI/CD Pipeline with Security Scans and Manual Production Approval | Part 10 |
| Q221 | High Availability: 99.9% SLO with < 30 min RTO | Part 10 |
| Q222 | Infrastructure as Code (Terraform + Helm + GitHub Actions) | Part 10 |

**Cumulative Architectural Decisions**: 222 (Q1-Q222)

## Volume 0.75 Progress Tracker

| Batch | Parts | Status |
|---|---|---|
| Batch 1 | 1-5 (Solution Arch, Tech Stack, Monorepo, Database, Backend) | ✅ COMPLETE |
| **Batch 2** | **6-10 (Frontend, Mobile, API, Events, Infrastructure)** | **✅ COMPLETE (LOCKED)** |
| Batch 3 | 11-15 (Security, DevOps, Observability, AI Platform, Performance) | ⏳ PENDING |
| Batch 4 | 16-20 (DR, Coding Standards, UI/UX, Dev Standards, Engineering Playbook) | ⏳ PENDING |

## Cumulative Status

| Metric | Value |
|---|---|
| Volume 0.5 Entities | 815 |
| Foundation Services | 66 + Platform Kernel (Q189/Q192) |
| Architectural Decisions | 222 (Q1-Q222) |
| Volume 0.75 Parts Complete | 10 of ~20 (50%) |

---

## 🏆 BFF Pattern — Q211 (Critical Decision)

The **Backend-for-Frontend** pattern is the critical infrastructure decision that enables SUOP to serve multiple applications (desktop ERP, warehouse, POS, restaurant, executive, mobile) without coupling them to business module internals.

### BFF Inventory (Locked)

| BFF | Serves | Key Responsibilities |
|---|---|---|
| **Admin BFF** | Desktop ERP (Next.js) | Aggregate ERP data, complex forms, dense tables |
| **Warehouse BFF** | Warehouse App (Web + Mobile) | Scanner workflows, pick/pack optimization, offline sync |
| **Retail BFF** | Retail POS | Fast checkout, customer lookup, inventory check |
| **Restaurant BFF** | Restaurant POS | Order flow, KDS, menu, billing, table management |
| **Executive BFF** | Executive Dashboard + Mission Control | Aggregated KPIs, real-time WebSocket, multi-module rollup |
| **Mobile BFF** | ESS, MSS, Maintenance, Delivery | Mobile-optimized APIs, offline sync protocol, push notifications |

---

*End of Volume 0.75 Batch 2. Next batch: Parts 11-15 (Security Architecture, DevOps Standards, Observability Architecture, AI Platform Architecture, Performance Architecture).*
