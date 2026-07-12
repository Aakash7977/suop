# Section 1: API Mapping

**Section**: Login + Dashboard + Organization
**Date**: 2026-07-12

---

## 1. Frontend → Backend API Mapping

### Login Screen

| UI Element | Frontend Code | API Client Method | Backend Endpoint | Status |
|---|---|---|---|---|
| Sign In button | `useAuthStore.login(email, password)` | `authClient.login()` | `POST /api/v1/auth/login` | ✅ Connected |
| Demo Mode button | `useAuthStore.loginDemo()` | (local, no API) | N/A | ✅ Working (no backend) |
| Logout (header) | `useAuthStore.logout()` | `authClient.logout()` | `POST /api/v1/auth/logout` | ✅ Connected |
| Token refresh | Auth store auto-refresh | `authClient.refresh()` | `POST /api/v1/auth/refresh` | ✅ Available |

### Dashboard Module

| UI Element | Frontend Code | API Client Method | Backend Endpoint | Status |
|---|---|---|---|---|
| Products stat card | Hardcoded `value: 12` | `productClient.list()` | `GET /api/v1/catalog/products?pageSize=1` | ❌ Not wired |
| Roles stat card | Hardcoded `value: 15` | `userClient.listRoles()` | `GET /api/v1/admin/roles?pageSize=1` | ❌ Not wired |
| Branches stat card | Hardcoded `value: 8` | `orgClient.companyApi.list()` | `GET /api/v1/organization/companies?pageSize=1` | ❌ Not wired |
| Compliance stat card | Hardcoded `value: 6` | N/A | N/A | ❌ No backend endpoint |
| Sprint progress list | Hardcoded `sprintData` array | N/A | N/A | ❌ No backend endpoint (static info) |

### Organization Module

| UI Element | Frontend Code | API Client Method | Backend Endpoint | Status |
|---|---|---|---|---|
| Organization tree | Hardcoded `tree` array | `orgClient.hierarchyApi.getTree()` | `GET /api/v1/organization/hierarchy` | ❌ Not wired |
| Enterprises stat | Hardcoded `value: 1` | Derived from hierarchy | Same as above | ❌ Not wired |
| Companies stat | Hardcoded `value: 2` | `orgClient.companyApi.list({pageSize:1})` | `GET /api/v1/organization/companies?pageSize=1` | ❌ Not wired |
| Branches stat | Hardcoded `value: 8` | `orgClient.plantApi.list({pageSize:1})` | `GET /api/v1/organization/plants?pageSize=1` | ❌ Not wired |
| Warehouses stat | Hardcoded `value: 4` | `orgClient.warehouseApi.list({pageSize:1})` | `GET /api/v1/organization/warehouses?pageSize=1` | ❌ Not wired |
| "Add Entity" button | No handler | `orgClient.companyApi.create()` | `POST /api/v1/organization/companies` | ❌ Not wired |
| Node selection detail | Shows selected code only | `orgClient.companyApi.get(id)` | `GET /api/v1/organization/companies/:id` | ❌ Not wired |

---

## 2. Available API Client Methods (Not Yet Used)

### Organization API Client (`src/modules/organization/api/client.ts`)

```typescript
// Company
companyApi.list({ page?, pageSize?, search? })     // GET /api/v1/organization/companies
companyApi.get(id)                                  // GET /api/v1/organization/companies/:id
companyApi.create(data)                             // POST /api/v1/organization/companies
companyApi.update(id, data, version)                // PATCH /api/v1/organization/companies/:id
companyApi.delete(id, version)                      // DELETE /api/v1/organization/companies/:id
companyApi.transition(id, targetStatus, version)    // POST /api/v1/organization/companies/:id/transition

// Plant
plantApi.list({ page?, pageSize?, search? })       // GET /api/v1/organization/plants
plantApi.get(id)                                    // GET /api/v1/organization/plants/:id
plantApi.create(data)                               // POST /api/v1/organization/plants
plantApi.transition(id, targetStatus, version)      // POST /api/v1/organization/plants/:id/transition

// Warehouse
warehouseApi.list({ page?, pageSize?, search?, plantId? })  // GET /api/v1/organization/warehouses
warehouseApi.get(id)                                         // GET /api/v1/organization/warehouses/:id
warehouseApi.create(data)                                    // POST /api/v1/organization/warehouses

// Department
departmentApi.list({ page?, pageSize?, search? })   // GET /api/v1/organization/departments
departmentApi.create(data)                          // POST /api/v1/organization/departments

// Cost Center
costCenterApi.list({ page?, pageSize?, search? })   // GET /api/v1/organization/cost-centers
costCenterApi.create(data)                          // POST /api/v1/organization/cost-centers

// Financial Year
financialYearApi.list({ page?, pageSize? })         // GET /api/v1/organization/financial-years
financialYearApi.getCurrent()                        // GET /api/v1/organization/financial-years/current
financialYearApi.create(data)                        // POST /api/v1/organization/financial-years

// Hierarchy
hierarchyApi.getTree()                               // GET /api/v1/organization/hierarchy
```

### Auth API Client (`src/modules/auth/api/client.ts`)

```typescript
authClient.login(email, password)                    // POST /api/v1/auth/login
authClient.logout(refreshToken)                      // POST /api/v1/auth/logout
authClient.refresh(refreshToken)                     // POST /api/v1/auth/refresh
authClient.getCurrentUser()                          // GET /api/v1/auth/me
authClient.changePassword(currentPassword, newPassword)  // POST /api/v1/auth/change-password
authClient.forgotPassword(email)                     // POST /api/v1/auth/forgot-password
authClient.resetPassword(token, newPassword)         // POST /api/v1/auth/reset-password
authClient.listSessions()                            // GET /api/v1/auth/sessions
authClient.revokeSession(tokenHash)                  // POST /api/v1/auth/sessions/:id/revoke
authClient.listDevices()                             // GET /api/v1/auth/devices
authClient.inviteUser({ email, roles, firstName, lastName, designation })  // POST /api/v1/auth/invite
authClient.acceptInvitation({ token, username, password, firstName, lastName })  // POST /api/v1/auth/accept-invitation
```

---

## 3. Token Management

The auth store stores the JWT token in localStorage:

```typescript
// In auth-store.ts (login method)
localStorage.setItem('suop_auth', JSON.stringify({
  user, session, isAuthenticated: true, isDemoMode: false, authMode: 'local',
}))
```

However, the token is NOT stored under the key that the API clients expect:
- Auth store uses: `localStorage.getItem('suop_auth')` → parses JSON → `session.access_token`
- API clients use: `localStorage.getItem('suop_access_token')`

**Gap**: The auth store does NOT set `suop_access_token` in localStorage. This means all API client calls will be missing the `Authorization` header.

**Fix**: In `auth-store.ts`, after successful login, also set:
```typescript
localStorage.setItem('suop_access_token', data.accessToken)
```

---

## 4. API Response Format

All backend APIs return a consistent envelope:

```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "meta": {
    "correlationId": "uuid",
    "page": 1,
    "pageSize": 25,
    "total": 150
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": [{ "field": "id", "code": "REQUIRED", "message": "ID is required" }]
  },
  "meta": { "correlationId": "uuid" }
}
```

All API clients already handle this envelope correctly.
