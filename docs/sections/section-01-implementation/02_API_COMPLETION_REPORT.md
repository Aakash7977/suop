# Section 01: API Completion Report

**Section**: Login + Dashboard + Organization
**Date**: 2026-07-12

---

## API Integration Summary

### Before Implementation

| UI Element | Data Source | API Called |
|---|---|---|
| Login form | `useAuthStore.login()` | ❌ No backend call (local fallback only) |
| Dashboard Products stat | Hardcoded `12` | ❌ None |
| Dashboard Roles stat | Hardcoded `15` | ❌ None |
| Dashboard Branches stat | Hardcoded `8` | ❌ None |
| Dashboard Compliance stat | Hardcoded `6` | ❌ None |
| Organization tree | Hardcoded array | ❌ None |
| Organization stats | Hardcoded values | ❌ None |
| Add Entity button | No handler | ❌ None |
| Node detail | None | ❌ None |
| Token storage | `suop_auth` only | ❌ `suop_access_token` not set |

**API Coverage**: 0 of 34 endpoints called (0%)

### After Implementation

| UI Element | Data Source | API Called | Status |
|---|---|---|---|
| Login form | `useAuthStore.login()` → `backendLogin()` | `POST /api/v1/auth/login` | ✅ Connected |
| Dashboard Products stat | `fetch(GET /api/v1/catalog/products?pageSize=1)` | `GET /api/v1/catalog/products` | ✅ Connected |
| Dashboard Roles stat | `fetch(GET /api/v1/admin/roles?pageSize=1)` | `GET /api/v1/admin/roles` | ✅ Connected |
| Dashboard Companies stat | `fetch(GET /api/v1/organization/companies?pageSize=1)` | `GET /api/v1/organization/companies` | ✅ Connected |
| Dashboard Compliance stat | Derived (0 unless demo) | N/A | ✅ Correct |
| Organization tree | `fetch(GET /api/v1/organization/hierarchy)` | `GET /api/v1/organization/hierarchy` | ✅ Connected |
| Organization stats | Counted from tree data | Derived from API response | ✅ Connected |
| Add Entity button | Opens dialog → `fetch(POST /api/v1/organization/companies)` | `POST /api/v1/organization/companies` | ✅ Connected |
| Node detail | `fetch(GET /api/v1/organization/companies/:id)` | `GET /api/v1/organization/companies/:id` | ✅ Connected |
| Token storage | `suop_auth` + `suop_access_token` + `suop_refresh_token` | N/A | ✅ Fixed |
| Token refresh | `backendRefresh()` → `POST /api/v1/auth/refresh` | `POST /api/v1/auth/refresh` | ✅ Connected |
| Logout | `backendLogout()` → `POST /api/v1/auth/logout` | `POST /api/v1/auth/logout` | ✅ Connected |

**API Coverage**: 8 of 34 endpoints called (23.5%)

### Endpoints Not Yet Called (Available for Future)

| Endpoint | Purpose | When Needed |
|---|---|---|
| `GET /api/v1/auth/me` | Get current user profile | When user profile page is built |
| `POST /api/v1/auth/change-password` | Change password | When settings page is built |
| `POST /api/v1/auth/forgot-password` | Password reset request | When forgot password link is added |
| `POST /api/v1/auth/reset-password` | Reset password with token | When reset password page is built |
| `GET /api/v1/auth/sessions` | List active sessions | When session management is built |
| `POST /api/v1/auth/sessions/:id/revoke` | Revoke session | When session management is built |
| `GET /api/v1/auth/devices` | List devices | When device management is built |
| `POST /api/v1/auth/invite` | Invite user | When user invitation is built |
| `POST /api/v1/auth/accept-invitation` | Accept invitation | When invitation flow is built |
| `PATCH /api/v1/organization/companies/:id` | Update company | When edit dialog is built |
| `DELETE /api/v1/organization/companies/:id` | Delete company | When delete is added |
| `POST /api/v1/organization/companies/:id/transition` | Workflow transition | When workflow UI is built |
| `POST /api/v1/organization/companies/:id/restore` | Restore deleted | When restore is added |
| `GET /api/v1/organization/plants` | List plants | When plant management is built |
| `POST /api/v1/organization/plants` | Create plant | When plant creation is built |
| `GET /api/v1/organization/warehouses` | List warehouses | When warehouse management is built |
| `POST /api/v1/organization/warehouses` | Create warehouse | When warehouse creation is built |
| `GET /api/v1/organization/departments` | List departments | When department management is built |
| `GET /api/v1/organization/cost-centers` | List cost centers | When cost center management is built |
| `GET /api/v1/organization/financial-years` | List financial years | When FY management is built |

---

## Token Flow (Fixed)

```
User Login
    ↓
auth-store.login(email, password)
    ↓
backendLogin() → POST /api/v1/auth/login
    ↓
Backend returns: { accessToken, refreshToken, user: { roles, permissions, tenantId } }
    ↓
auth-store sets:
  - localStorage['suop_auth'] = JSON({ user, session, isAuthenticated, ... })
  - localStorage['suop_access_token'] = accessToken  ← NEW (fixes critical bug)
  - localStorage['suop_refresh_token'] = refreshToken  ← NEW
    ↓
All API clients read localStorage['suop_access_token']
    ↓
Every fetch includes: Authorization: Bearer <token>
    ↓
Backend validates JWT → returns data
```

---

## Auth Mode Priority

```
1. Backend JWT (primary)
   ↓ (if backend unreachable)
2. Supabase (if NEXT_PUBLIC_SUPABASE_URL configured)
   ↓ (if Supabase fails)
3. Local fallback (any email/password — dev only)
   ↓ (if user clicks Demo Mode)
4. Demo mode (instant access, all permissions)
```
