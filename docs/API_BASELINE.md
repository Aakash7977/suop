# SUOP ERP — API Baseline (v1.0)

**Document Version**: 1.0
**Frozen At**: 2026-07-11
**Phase**: 9B — Architecture Freeze
**Status**: 🔒 FROZEN

---

## 1. API Overview

| Property | Value |
|---|---|
| **Protocol** | HTTPS (HTTP/2) |
| **Style** | RESTful |
| **Base URL** | `https://api.sudhamrit.com/api/v1` (production) |
| **Local URL** | `http://localhost:3030/api/v1` (development) |
| **Auth** | JWT Bearer (access + refresh tokens) |
| **Format** | JSON (request + response) |
| **Pagination** | `?pageNumber=1&pageSize=20` |
| **Total endpoints** | 89 (across 9 modules) |

---

## 2. Response Envelope

Every response uses the standard envelope (`core/response/envelope.ts`):

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-11T10:00:00Z",
    "correlationId": "uuid-v7",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [ ... ]
  },
  "meta": {
    "timestamp": "2026-07-11T10:00:00Z",
    "correlationId": "uuid-v7",
    "version": "1.0.0"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "timestamp": "...",
    "correlationId": "...",
    "version": "1.0.0",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## 3. Authentication

All endpoints except `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/accept-invitation` require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Permission Format
Permissions follow `<resource>:<action>` format (e.g., `org:read`, `supplier:create`).

---

## 4. Endpoints by Module

### 4.1 Organization Module (18 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/companies` | `org:read` | — | List companies (paginated) |
| 2 | GET | `/companies/:id` | `org:read` | — | Get company by ID |
| 3 | POST | `/companies` | `org:create` | → `DRAFT` | Create company |
| 4 | PATCH | `/companies/:id` | `org:update` | — | Update company (optimistic concurrency) |
| 5 | DELETE | `/companies/:id` | `org:delete` | → soft delete | Soft delete company |
| 6 | POST | `/companies/:id/transition` | `org:update` | state machine | Transition company state |
| 7 | POST | `/companies/:id/restore` | `org:update` | `ARCHIVED → ACTIVE` | Restore soft-deleted company |
| 8 | DELETE | `/companies/:id/hard` | `org:delete` | — | Hard delete (permanent) |
| 9 | GET | `/plants` | `org:read` | — | List plants |
| 10 | GET | `/plants/:id` | `org:read` | — | Get plant by ID |
| 11 | POST | `/plants` | `org:create` | → `DRAFT` | Create plant |
| 12 | POST | `/plants/:id/transition` | `org:update` | state machine | Transition plant state |
| 13 | GET | `/warehouses` | `org:read` | — | List warehouses |
| 14 | GET | `/warehouses/:id` | `org:read` | — | Get warehouse by ID |
| 15 | POST | `/warehouses` | `org:create` | → `DRAFT` | Create warehouse |
| 16 | GET | `/departments` | `org:read` | — | List departments |
| 17 | POST | `/departments` | `org:create` | → `DRAFT` | Create department |
| 18 | GET | `/cost-centers` | `org:read` | — | List cost centers |
| 19 | POST | `/cost-centers` | `org:create` | → `DRAFT` | Create cost center |

### 4.2 Authentication Module (11 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | POST | `/auth/login` | (public) | → `ACTIVE` | Login with email + password |
| 2 | POST | `/auth/logout` | (authenticated) | — | Revoke current session |
| 3 | POST | `/auth/refresh` | (refresh token) | — | Rotate refresh token, issue new access token |
| 4 | POST | `/auth/forgot-password` | (public) | — | Send password reset email |
| 5 | POST | `/auth/reset-password` | (reset token) | — | Reset password with token |
| 6 | POST | `/auth/change-password` | (authenticated) | — | Change password (requires current password) |
| 7 | GET | `/auth/me` | (authenticated) | — | Get current user profile |
| 8 | GET | `/auth/sessions` | (authenticated) | — | List active sessions |
| 9 | POST | `/auth/sessions/:id/revoke` | (authenticated) | — | Revoke a specific session |
| 10 | GET | `/auth/devices` | (authenticated) | — | List trusted devices |
| 11 | POST | `/auth/invite` | `auth:manage_users` | → `INVITED` | Invite new user |
| 12 | POST | `/auth/accept-invitation` | (public) | `INVITED → ACTIVATED` | Accept invitation and set password |

### 4.3 User Management Module (19 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/users` | `auth:manage_users` | — | List users (paginated) |
| 2 | GET | `/users/:id` | `auth:manage_users` | — | Get user by ID |
| 3 | PATCH | `/users/:id` | `auth:manage_users` | — | Update user profile |
| 4 | POST | `/users/:id/lock` | `auth:manage_users` | `ACTIVE → LOCKED` | Lock user account |
| 5 | POST | `/users/:id/unlock` | `auth:manage_users` | `LOCKED → ACTIVE` | Unlock user account |
| 6 | POST | `/users/:id/roles/:roleName` | `auth:manage_roles` | — | Assign role to user |
| 7 | DELETE | `/users/:id/roles/:roleName` | `auth:manage_roles` | — | Remove role from user |
| 8 | GET | `/users/:id/sessions` | `auth:manage_users` | — | List user's active sessions |
| 9 | POST | `/users/:id/sessions/revoke-all` | `auth:manage_users` | — | Revoke all user sessions |
| 10 | GET | `/users/:id/login-history` | `auth:manage_users` | — | Get user login history |
| 11 | POST | `/users/:id/assignments` | `auth:manage_users` | — | Assign user to entity (plant, dept, etc.) |
| 12 | DELETE | `/assignments/:id` | `auth:manage_users` | — | Remove user assignment |
| 13 | GET | `/users/:id/preferences` | `auth:manage_users` | — | Get user preferences |
| 14 | POST | `/users/:id/preferences` | `auth:manage_users` | — | Update user preferences |
| 15 | GET | `/roles` | `auth:manage_roles` | — | List roles |
| 16 | GET | `/roles/:id` | `auth:manage_roles` | — | Get role by ID |
| 17 | POST | `/roles` | `auth:manage_roles` | → `DRAFT` | Create role |
| 18 | PATCH | `/roles/:id` | `auth:manage_roles` | — | Update role |
| 19 | DELETE | `/roles/:id` | `auth:manage_roles` | → soft delete | Delete role |

### 4.4 Product Master Module (14 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/products` | `product:read` | — | List products (paginated, filterable) |
| 2 | GET | `/products/:id` | `product:read` | — | Get product by ID |
| 3 | POST | `/products` | `product:create` | → `DRAFT` | Create product |
| 4 | PATCH | `/products/:id` | `product:update` | — | Update product |
| 5 | DELETE | `/products/:id` | `product:delete` | → soft delete | Soft delete product |
| 6 | POST | `/products/:id/transition` | `product:update` | state machine | Transition product state |
| 7 | GET | `/products/barcode/:barcode` | `product:read` | — | Lookup product by barcode |
| 8 | GET | `/products/:id/barcodes` | `product:read` | — | List product's barcodes |
| 9 | POST | `/products/:id/barcodes` | `product:update` | — | Add barcode to product |
| 10 | GET | `/categories` | `product:read` | — | List product categories |
| 11 | POST | `/categories` | `product:create` | — | Create category |
| 12 | GET | `/brands` | `product:read` | — | List brands |
| 13 | POST | `/brands` | `product:create` | — | Create brand |
| 14 | GET | `/uoms` | `product:read` | — | List units of measure |

### 4.5 Supplier Master Module (14 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/suppliers` | `supplier:read` | — | List suppliers (paginated) |
| 2 | GET | `/suppliers/:id` | `supplier:read` | — | Get supplier by ID |
| 3 | POST | `/suppliers` | `supplier:create` | → `DRAFT` | Create supplier |
| 4 | PATCH | `/suppliers/:id` | `supplier:update` | — | Update supplier |
| 5 | DELETE | `/suppliers/:id` | `supplier:delete` | → soft delete | Soft delete supplier |
| 6 | POST | `/suppliers/:id/transition` | `supplier:update` | state machine | Transition supplier state |
| 7 | POST | `/suppliers/:id/blacklist` | `supplier:blacklist` | → `BLACKLISTED` | Blacklist supplier |
| 8 | GET | `/suppliers/gst/:gstin` | `supplier:read` | — | Lookup supplier by GSTIN |
| 9 | GET | `/suppliers/:id/contacts` | `supplier:read` | — | List supplier contacts |
| 10 | POST | `/suppliers/:id/contacts` | `supplier:update` | — | Add supplier contact |
| 11 | POST | `/suppliers/:id/addresses` | `supplier:update` | — | Add supplier address |
| 12 | POST | `/suppliers/:id/compliances` | `supplier:update` | — | Add compliance certificate |
| 13 | POST | `/suppliers/:id/products` | `supplier:update` | — | Map supplier to product |
| 14 | GET | `/supplier-categories` | `supplier:read` | — | List supplier categories |
| 15 | POST | `/supplier-categories` | `supplier:create` | — | Create supplier category |

### 4.6 Customer Master Module (12 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/customers` | `customer:read` | — | List customers (paginated) |
| 2 | GET | `/customers/:id` | `customer:read` | — | Get customer by ID |
| 3 | POST | `/customers` | `customer:create` | → `LEAD` | Create customer (starts as LEAD) |
| 4 | PATCH | `/customers/:id` | `customer:update` | — | Update customer |
| 5 | DELETE | `/customers/:id` | `customer:delete` | → soft delete | Soft delete customer |
| 6 | POST | `/customers/:id/transition` | `customer:update` | state machine | Transition customer state |
| 7 | GET | `/customers/:id/credit` | `customer:read` | — | Get customer credit info |
| 8 | GET | `/customers/gst/:gstin` | `customer:read` | — | Lookup customer by GSTIN |
| 9 | POST | `/customers/:id/contacts` | `customer:update` | — | Add customer contact |
| 10 | POST | `/customers/:id/addresses` | `customer:update` | — | Add customer address |
| 11 | GET | `/customer-groups` | `customer:read` | — | List customer groups |
| 12 | POST | `/customer-groups` | `customer:create` | — | Create customer group |

### 4.7 Procurement Module (7 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/requisitions` | `pr:read` | — | List purchase requisitions |
| 2 | GET | `/requisitions/:id` | `pr:read` | — | Get PR by ID |
| 3 | POST | `/requisitions` | `pr:create` | → `DRAFT` | Create purchase requisition |
| 4 | PATCH | `/requisitions/:id` | `pr:create` | — | Update PR (only in DRAFT) |
| 5 | DELETE | `/requisitions/:id` | `pr:create` | → soft delete | Delete PR (only in DRAFT) |
| 6 | POST | `/requisitions/:id/transition` | `pr:approve` | state machine | Transition PR state (submit, approve, reject) |

### 4.8 RFQ Module (7 endpoints)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/rfqs` | `rfq:read` | — | List RFQs |
| 2 | GET | `/rfqs/:id` | `rfq:read` | — | Get RFQ by ID |
| 3 | POST | `/rfqs` | `rfq:create` | → `DRAFT` | Create RFQ |
| 4 | PATCH | `/rfqs/:id` | `rfq:create` | — | Update RFQ (only in DRAFT) |
| 5 | DELETE | `/rfqs/:id` | `rfq:create` | → soft delete | Delete RFQ (only in DRAFT) |
| 6 | POST | `/rfqs/:id/transition` | `rfq:approve` | state machine | Transition RFQ state |
| 7 | POST | `/rfqs/:id/suppliers` | `rfq:create` | — | Invite supplier to RFQ |

### 4.9 Quotation Module (8 endpoints, Phase 9 — in progress)

| # | Method | URL | Permission | Workflow | Description |
|---|---|---|---|---|---|
| 1 | GET | `/quotations` | `quot:read` | — | List supplier quotations |
| 2 | GET | `/quotations/:id` | `quot:read` | — | Get quotation by ID |
| 3 | POST | `/quotations` | `quot:create` | → `DRAFT` | Create supplier quotation |
| 4 | PATCH | `/quotations/:id` | `quot:create` | — | Update quotation (only in DRAFT) |
| 5 | DELETE | `/quotations/:id` | `quot:create` | → soft delete | Delete quotation (only in DRAFT) |
| 6 | POST | `/quotations/:id/transition` | `quot:approve` | state machine | Transition quotation state |
| 7 | GET | `/quotations/compare/:rfqId` | `quot:read` | — | Compare all quotations for an RFQ |

---

## 5. Standard Endpoint Patterns

Every CRUD module follows these patterns:

### 5.1 List (GET)
```
GET /api/v1/<resource>?pageNumber=1&pageSize=20&status=ACTIVE&search=...
```
- Returns paginated array
- Supports `status`, `search`, date range filters
- Always tenant-scoped

### 5.2 Get by ID (GET)
```
GET /api/v1/<resource>/:id
```
- Returns single resource or 404
- Includes `version` for optimistic concurrency

### 5.3 Create (POST)
```
POST /api/v1/<resource>
Content-Type: application/json
{ ...resource fields... }
```
- Validates body with Zod schema
- Creates with `status = 'DRAFT'` (or module-specific initial state)
- Returns 201 with created resource
- Audit log entry created

### 5.4 Update (PATCH)
```
PATCH /api/v1/<resource>/:id
If-Match: <version>
{ ...fields to update... }
```
- Uses PATCH (partial update), not PUT
- Requires `If-Match` header with current `version` (optimistic concurrency)
- Returns 409 Conflict if version mismatch
- Returns 422 if resource is not in an editable state

### 5.5 Soft Delete (DELETE)
```
DELETE /api/v1/<resource>/:id
```
- Sets `deleted_at` and `deleted_by`
- Does NOT remove from database
- Resource can be restored (if module supports it)

### 5.6 Hard Delete (DELETE)
```
DELETE /api/v1/<resource>/:id/hard
```
- Permanently removes from database
- Requires elevated permission (e.g., `org:delete` not just `org:update`)
- Audit log entry with `severity: 'CRITICAL'`

### 5.7 State Transition (POST)
```
POST /api/v1/<resource>/:id/transition
{ "action": "submit" | "approve" | "reject" | ... }
```
- Validates transition against state machine
- Returns 422 if transition not allowed from current state
- Fires domain event (e.g., `rfq.submitted`)
- Audit log entry with action `TRANSITION`

---

## 6. Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/query failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Authenticated but lacks permission |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Optimistic concurrency version mismatch |
| `PRECONDITION_FAILED` | 412 | Missing `If-Match` header |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation (e.g., invalid state transition) |
| `RATE_LIMITED` | 429 | Too many requests (future) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Database/Redis down |

---

## 7. Rate Limiting (Planned)

| Endpoint Type | Rate Limit |
|---|---|
| Public (`/auth/login`, `/auth/forgot-password`) | 10 req/min per IP |
| Authenticated read (GET) | 100 req/min per user |
| Authenticated write (POST/PATCH/DELETE) | 30 req/min per user |
| Bulk operations | 5 req/min per user |

---

*This document is FROZEN as of Phase 9B. New endpoints require ADR + version bump.*
