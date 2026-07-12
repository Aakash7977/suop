# 02 — API Mapping: Login + Dashboard + Organization

**Scope**: Every HTTP endpoint reachable from this section, mapped to its frontend caller, its backend service method, and its database tables.
**Convention**: All endpoints are prefixed `/api/v1/`. All responses use the standard envelope from `apps/backend/src/core/response/envelope.ts`.

---

## 1. Endpoint Inventory by Module

### 1.1 Auth endpoints (12)

| # | Endpoint | Method | Frontend caller | Service method | Permission | DB tables touched |
|---|---|---|---|---|---|---|
| A-01 | `/auth/login` | POST | `authClient.login` ← `useAuthStore.login` ← `LoginScreen.onLogin` | `authService.login` | Public | `users`, `audit_logs`, `event_outbox` |
| A-02 | `/auth/logout` | POST | `authClient.logout` ← `useAuthStore.logout` ← Header Sign Out | `authService.logout` | Authenticated | `audit_logs`, `event_outbox` |
| A-03 | `/auth/refresh` | POST | `authClient.refresh` (auto on 401) | `authService.refresh` | Public (refresh token) | `audit_logs` |
| A-04 | `/auth/me` | GET | `authClient.getCurrentUser` ← `useAuthStore.initialize` | `authService.getCurrentUser` | Authenticated | `users`, `user_roles` |
| A-05 | `/auth/change-password` | POST | `authClient.changePassword` (not surfaced in section) | `authService.changePassword` | Authenticated | `users`, `audit_logs` |
| A-06 | `/auth/forgot-password` | POST | `authClient.forgotPassword` (not surfaced in section) | `authService.forgotPassword` | Public | `users`, `event_outbox` |
| A-07 | `/auth/reset-password` | POST | `authClient.resetPassword` (not surfaced in section) | `authService.resetPassword` | Public (token) | `users`, `audit_logs` |
| A-08 | `/auth/sessions` | GET | `authClient.listSessions` (not surfaced in section) | `authService.listSessions` | Authenticated | `user_sessions` |
| A-09 | `/auth/sessions/:id/revoke` | POST | `authClient.revokeSession` (not surfaced in section) | `authService.revokeSession` | Authenticated | `user_sessions`, `audit_logs` |
| A-10 | `/auth/devices` | GET | `authClient.listDevices` (not surfaced in section) | `authService.listDevices` | Authenticated | `devices` |
| A-11 | `/auth/invite` | POST | `authClient.inviteUser` (not surfaced in section) | `authService.inviteUser` | `AUTH_MANAGE_USERS` | `users`, `event_outbox` |
| A-12 | `/auth/accept-invitation` | POST | `authClient.acceptInvitation` (not surfaced in section) | `authService.acceptInvitation` | Public (token) | `users`, `audit_logs` |

**In-section usage**: A-01 and A-02 are exercised by the Login screen and the Sign Out button. A-03 and A-04 run on shell boot. The remaining 8 endpoints exist and have client wrappers but no UI in this section.

### 1.2 Organization endpoints (22)

| # | Endpoint | Method | Frontend caller | Service method | Permission |
|---|---|---|---|---|---|
| O-01 | `/organization/companies` | GET | `orgClient.companyApi.list` (NOT WIRED) | `companyService.list` | `ORG_READ` |
| O-02 | `/organization/companies/:id` | GET | `orgClient.companyApi.get` (NOT WIRED) | `companyService.getById` | `ORG_READ` |
| O-03 | `/organization/companies` | POST | `orgClient.companyApi.create` (NOT WIRED) | `companyService.create` | `ORG_CREATE` |
| O-04 | `/organization/companies/:id` | PATCH | `orgClient.companyApi.update` (NOT WIRED) | `companyService.update` | `ORG_UPDATE` |
| O-05 | `/organization/companies/:id` | DELETE | `orgClient.companyApi.delete` (NOT WIRED) | `companyService.delete` | `ORG_DELETE` |
| O-06 | `/organization/companies/:id/transition` | POST | `orgClient.companyApi.transition` (NOT WIRED) | `companyService.transition` | `ORG_UPDATE` |
| O-07 | `/organization/companies/:id/restore` | POST | `orgClient.companyApi.restore` (NOT WIRED) | `companyService.restore` | `ORG_UPDATE` |
| O-08 | `/organization/companies/:id/hard-delete` | DELETE | `orgClient.companyApi.hardDelete` (NOT WIRED) | `companyService.hardDelete` | `ORG_DELETE` |
| O-09 | `/organization/plants` | GET | `orgClient.plantApi.list` (NOT WIRED) | `plantService.list` | `ORG_READ` |
| O-10 | `/organization/plants/:id` | GET | `orgClient.plantApi.get` (NOT WIRED) | `plantService.getById` | `ORG_READ` |
| O-11 | `/organization/plants` | POST | `orgClient.plantApi.create` (NOT WIRED) | `plantService.create` | `ORG_CREATE` |
| O-12 | `/organization/plants/:id` | PATCH | `orgClient.plantApi.update` (NOT WIRED) | `plantService.update` | `ORG_UPDATE` |
| O-13 | `/organization/plants/:id/transition` | POST | `orgClient.plantApi.transition` (NOT WIRED) | `plantService.transition` | `ORG_UPDATE` |
| O-14 | `/organization/warehouses` | GET | `orgClient.warehouseApi.list` (NOT WIRED) | `warehouseService.list` | `ORG_READ` |
| O-15 | `/organization/warehouses/:id` | GET | `orgClient.warehouseApi.get` (NOT WIRED) | `warehouseService.getById` | `ORG_READ` |
| O-16 | `/organization/warehouses` | POST | `orgClient.warehouseApi.create` (NOT WIRED) | `warehouseService.create` | `ORG_CREATE` |
| O-17 | `/organization/warehouses/:id` | PATCH | `orgClient.warehouseApi.update` (NOT WIRED) | `warehouseService.update` | `ORG_UPDATE` |
| O-18 | `/organization/departments` | GET/POST | `orgClient.departmentApi.*` (NOT WIRED) | `departmentService.*` | `ORG_READ`/`ORG_CREATE` |
| O-19 | `/organization/cost-centers` | GET/POST | `orgClient.costCenterApi.*` (NOT WIRED) | `costCenterService.*` | `ORG_READ`/`ORG_CREATE` |
| O-20 | `/organization/financial-years` | GET/POST | `orgClient.financialYearApi.*` (NOT WIRED) | `financialYearService.*` | `ORG_READ`/`ORG_CREATE` |
| O-21 | `/organization/financial-years/current` | GET | `orgClient.financialYearApi.getCurrent` (NOT WIRED) | `financialYearService.getCurrent` | `ORG_READ` |
| O-22 | `/organization/hierarchy` | GET | `orgClient.hierarchyApi.getTree` (NOT WIRED) | `hierarchyService.getTree` | `ORG_READ` |

**In-section usage**: zero. The `OrganizationModule` renders a hardcoded tree and does not call any of the 22 endpoints. All 22 endpoints have client wrappers ready for use.

### 1.3 User management endpoints (29)

The user-management module exposes 29 endpoints covering users CRUD, lock/unlock, role assign/revoke, sessions, login-history, assignments, preferences, roles CRUD, clone, permissions, and delegations. **None are surfaced inside this section.** They are listed here for completeness because the Dashboard's "Roles=15" stat card conceptually depends on `roleService.list`.

---

## 2. Request/Response Contracts (Representative)

### 2.1 `POST /api/v1/auth/login`

```json
// Request
{ "email": "string", "password": "string", "remember": true }

// Response (envelope)
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "tenantId": "uuid",
      "email": "string",
      "status": "ACTIVE",
      "roles": ["..."]
    }
  },
  "meta": { "correlationId": "uuid" }
}
```

### 2.2 `GET /api/v1/organization/hierarchy`

```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": "uuid",
        "type": "ENTERPRISE",
        "code": "SUDHASTAR",
        "name": "Sudhastar Group",
        "children": [
          { "type": "COMPANY", "id": "uuid", "name": "Sudhastar Foods Ltd",
            "children": [ { "type": "BU", "name": "Manufacturing BU",
              "children": [ { "type": "BRANCH", "name": "Mumbai Plant" } ] } ] }
        ]
      }
    ]
  }
}
```

### 2.3 `POST /api/v1/organization/companies` (create)

Required fields (from migration 0002): `code`, `name`, `legal_name`, `gstin`, `pan`, `cin`, `default_timezone`, `default_currency`. Optional: `parent_id`, `description`, contact/address fields. The server validates GSTIN/PAN/CIN format and returns 422 on failure.

---

## 3. Authentication Header Convention

Every authenticated endpoint requires:

```
Authorization: Bearer <accessToken>
X-Tenant-Id: <tenantId>     // injected by middleware from JWT claim
X-Correlation-Id: <uuid>    // injected by request-id middleware
```

### 3.1 Token storage — critical mismatch

| Component | Key read | Key written |
|---|---|---|
| `auth-store.ts` | `suop_auth` | `suop_auth` |
| All 14 API clients in `src/modules/*/api/client.ts` | `suop_access_token` | — (clients never write) |
| `mobile-app/src/api/client.ts` | `suop_access_token` | — |

The auth store **does not write** `suop_access_token`. As a result every API client call after login will read `null` from `localStorage.getItem('suop_access_token')` and produce a request with no `Authorization` header. Backend middleware will reject with 401.

**Resolution path**: see `12_IMPLEMENTATION_PLAN.md`, work item W-01.

---

## 4. Endpoint-to-Database Traceability

| Endpoint | Read tables | Write tables | Audit table |
|---|---|---|---|
| A-01 login | `users` | `audit_logs`, `event_outbox` | `audit_logs` (success/fail) |
| A-02 logout | — | `audit_logs`, `event_outbox` | `audit_logs` |
| A-04 me | `users`, `user_roles` | — | — |
| O-01 companies list | `companies`, `business_units` | — | — |
| O-03 companies create | `tenants` (FK) | `companies`, `audit_logs`, `event_outbox` | `audit_logs` |
| O-22 hierarchy | `companies`, `business_units`, `divisions`, `regions`, `plants`, `warehouses` | — | — |

All writes flow through the standard transactional pattern in `apps/backend/src/core/db/transaction.ts` and emit events to `event_outbox` for the outbox dispatcher.

---

## 5. Coverage Matrix

| Surface | Endpoints defined | Endpoints with frontend client | Endpoints actually called from this section |
|---|---|---|---|
| Auth | 12 | 12 | 4 (login, logout, refresh, me) |
| Organization | 22 | 22 | 0 |
| User management | 29 | ~20 | 0 |
| **Section total** | **63** | **54** | **4** |

**Coverage rate in section**: 4 / 63 ≈ **6.3 %**. The gap is the single biggest integration opportunity in the project.

---

## 6. API Client Quality Notes

- All clients use a shared `fetch` wrapper and the standard envelope parser.
- Error handling normalises backend errors into a typed `ApiError` with `code`, `message`, `details`, and `correlationId`.
- Pagination is supported via `page` + `pageSize` query params and the envelope's `meta.pagination` block.
- Soft-delete is honoured by default (`?includeDeleted=true` to include).
- **Gap**: no retry/backoff; no automatic refresh-token call on 401 — both must be added at the wrapper layer.

---

## 7. Conclusion

The backend is over-built relative to what the section consumes: 63 endpoints and 14 client wrappers are available, but only 4 endpoints are reached. The `orgClient` is fully implemented and unit-tested yet unused. The blocker is not capability — it is wiring, plus a single critical key mismatch in `localStorage`. Fixing W-01 unblocks all 22 organisation endpoints at once.
