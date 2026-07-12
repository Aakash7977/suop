# Section 1: Login + Dashboard + Organization — Enterprise Audit

**Section**: Login Screen, Dashboard Module, Organization Module
**Lines**: 89–700 of `src/app/page.tsx`
**Functions**: `LoginScreen()`, `DashboardModule()`, `OrganizationModule()`

---

## 1. Business Purpose

### Login Screen (line 89)
- **Why**: Entry point for all users. Authenticates against the backend JWT auth system.
- **Who**: All ERP users (admin, managers, operators, auditors)
- **Problem solved**: Secure access control with multi-mode auth (Supabase, local, demo)
- **Downstream**: Every module depends on the auth token from this screen

### Dashboard Module (line 546)
- **Why**: Executive overview of the ERP system — shows sprint progress and quick stats
- **Who**: All authenticated users (first screen after login)
- **Problem solved**: At-a-glance visibility into system status and module availability
- **Downstream**: Quick navigation to Products, RBAC, Organization, PIM

### Organization Module (line 629)
- **Why**: Hierarchical view of enterprise structure (Enterprise → Company → BU → Branch)
- **Who**: Administrators, plant managers, warehouse managers
- **Problem solved**: Visual organization tree for navigating the company hierarchy
- **Downstream**: Every module references org entities (plant_id, warehouse_id, company_id)

---

## 2. Workflow

### Login Workflow
1. User enters email + password
2. `useAuthStore.login()` calls `authClient.login()` → `POST /api/v1/auth/login`
3. Backend validates credentials (Argon2id), returns JWT access + refresh tokens
4. Token stored in localStorage (`suop_access_token`)
5. Auth store sets `isAuthenticated = true`
6. Page renders the main ERP shell

### Dashboard Workflow
- No backend workflow — displays static sprint progress data
- Quick stat cards link to modules via `activeModule` state

### Organization Workflow
- **Current**: Displays inline hardcoded tree (Sudhastar Group structure)
- **Backend available**: `GET /api/v1/organization/hierarchy` returns real tree
- **Backend available**: `GET /api/v1/organization/companies` returns paginated companies
- **Gap**: Frontend does NOT call these APIs

---

## 3. Database

### Auth Tables (used by backend)
- `users` — user accounts with Argon2id password hash
- `user_roles` — role assignments
- `refresh_tokens` — JWT refresh tokens (hashed)
- `login_history` — audit trail of logins
- `user_sessions` — active sessions
- `devices` — registered devices

### Organization Tables
- `tenants` — multi-tenant isolation
- `companies` — company master (code, name, GSTIN, PAN, CIN)
- `plants` — manufacturing plants
- `warehouses` — warehouse master
- `departments` — organizational departments
- `cost_centers` — cost center master
- `financial_years` — fiscal year configuration

### Indexes
- `companies`: tenant_id, code (unique), gstin
- `plants`: tenant_id, code (unique)
- `warehouses`: tenant_id, plant_id, code (unique)

### Soft Delete
- All tables have `deleted_at` column
- Prisma soft-delete extension auto-filters

### Tenant Isolation
- All tables have `tenant_id` — Prisma tenant extension auto-injects WHERE clause

---

## 4. Backend APIs

### Auth APIs (all exist and work)
| Endpoint | Method | Purpose | Permission |
|---|---|---|---|
| `/api/v1/auth/login` | POST | Login with email+password | Public |
| `/api/v1/auth/logout` | POST | Logout (revoke refresh token) | Authenticated |
| `/api/v1/auth/refresh` | POST | Refresh access token | Public |
| `/api/v1/auth/me` | GET | Get current user profile | Authenticated |
| `/api/v1/auth/change-password` | POST | Change password | Authenticated |
| `/api/v1/auth/forgot-password` | POST | Request password reset | Public |
| `/api/v1/auth/reset-password` | POST | Reset password with token | Public |
| `/api/v1/auth/sessions` | GET | List active sessions | Authenticated |
| `/api/v1/auth/sessions/:id/revoke` | POST | Revoke a session | Authenticated |
| `/api/v1/auth/devices` | GET | List registered devices | Authenticated |
| `/api/v1/auth/invite` | POST | Invite a user | `auth:manage_users` |
| `/api/v1/auth/accept-invitation` | POST | Accept invitation | Public |

### Organization APIs (all exist and work)
| Endpoint | Method | Purpose | Permission |
|---|---|---|---|
| `/api/v1/organization/companies` | GET | List companies (paginated) | `org:read` |
| `/api/v1/organization/companies/:id` | GET | Get company by ID | `org:read` |
| `/api/v1/organization/companies` | POST | Create company | `org:create` |
| `/api/v1/organization/companies/:id` | PATCH | Update company | `org:update` |
| `/api/v1/organization/companies/:id` | DELETE | Soft-delete company | `org:delete` |
| `/api/v1/organization/companies/:id/transition` | POST | Workflow transition | `org:update` |
| `/api/v1/organization/companies/:id/restore` | POST | Restore deleted | `org:update` |
| `/api/v1/organization/plants` | GET | List plants | `org:read` |
| `/api/v1/organization/plants/:id` | GET | Get plant | `org:read` |
| `/api/v1/organization/plants` | POST | Create plant | `org:create` |
| `/api/v1/organization/plants/:id/transition` | POST | Workflow transition | `org:update` |
| `/api/v1/organization/warehouses` | GET | List warehouses | `org:read` |
| `/api/v1/organization/warehouses/:id` | GET | Get warehouse | `org:read` |
| `/api/v1/organization/warehouses` | POST | Create warehouse | `org:create` |
| `/api/v1/organization/departments` | GET | List departments | `org:read` |
| `/api/v1/organization/departments` | POST | Create department | `org:create` |
| `/api/v1/organization/cost-centers` | GET | List cost centers | `org:read` |
| `/api/v1/organization/cost-centers` | POST | Create cost center | `org:create` |
| `/api/v1/organization/financial-years` | GET | List financial years | `org:read` |
| `/api/v1/organization/financial-years/current` | GET | Get current FY | `org:read` |
| `/api/v1/organization/financial-years` | POST | Create financial year | `org:create` |
| `/api/v1/organization/hierarchy` | GET | Get org tree | `org:read` |

### Frontend API Client (exists, NOT wired)
- `src/modules/organization/api/client.ts` — full CRUD client for companies, plants, warehouses, departments, cost centers, financial years, hierarchy
- `src/modules/auth/api/client.ts` — full auth client (login, logout, refresh, me, sessions, devices, invite)

---

## 5. Frontend Analysis

### Login Screen (line 89–148)
| Element | Status | Issue |
|---|---|---|
| Email input | ✅ Works | — |
| Password input | ✅ Works | — |
| Show/hide password | ✅ Works | — |
| Remember me checkbox | ✅ Works | — |
| Sign In button | ✅ Works | Calls `useAuthStore.login()` |
| Demo Mode button | ✅ Works | Calls `useAuthStore.loginDemo()` |
| Error display | ✅ Works | Shows `loginError` state |
| Loading spinner | ✅ Works | Shows `Loader2 animate-spin` |
| Responsive | ✅ Works | Mobile padding `p-3 md:p-4` |
| Enter key submit | ✅ Works | Form `onSubmit` |

### Dashboard Module (line 546–626)
| Element | Status | Issue |
|---|---|---|
| Welcome banner | ✅ Works | Static text |
| Stat cards (4) | ⚠️ Inline data | Hardcoded: Products=12, Roles=15, Branches=8, Compliance=6 |
| Sprint progress list | ⚠️ Inline data | 27 sprints hardcoded in `sprintData` array |
| Click navigation | ✅ Works | `setActiveModule()` on card click |

### Organization Module (line 629–700)
| Element | Status | Issue |
|---|---|---|
| Org tree display | ⚠️ Inline data | Hardcoded tree (Sudhastar Group) |
| Tree expand/collapse | ✅ Works | useState `exp` |
| Node selection | ✅ Works | `setSelectedNode()` |
| Stat cards (4) | ⚠️ Inline data | Hardcoded: Enterprises=1, Companies=2, Branches=8, Warehouses=4 |
| "Add Entity" button | ❌ Non-functional | No onClick handler |
| Icons by type | ✅ Works | ENTERPRISE/COMPANY/BU/BRANCH icons |
| Responsive | ✅ Works | Grid layout |

---

## 6. Findings Summary

| # | Finding | Severity | Location |
|---|---|---|---|
| F-01 | Dashboard stats are hardcoded (Products=12, Roles=15, etc.) | Medium | Line 597-601 |
| F-02 | Organization tree is hardcoded (not from API) | High | Line 631-651 |
| F-03 | Organization stats are hardcoded | Medium | Line 684-688 |
| F-04 | "Add Entity" button has no handler | High | Line 694 |
| F-05 | API client exists but not imported | Critical | Organization module |
| F-06 | No loading state on Organization module | Medium | Line 629 |
| F-07 | No error state on Organization module | Medium | Line 629 |
| F-08 | Sprint data is static (27 sprints) | Low | Line 547-575 |
| F-09 | No node detail panel when selecting a tree node | Medium | Line 666 |
| F-10 | No CRUD operations for companies/plants/warehouses | High | Line 629-700 |

---

## 7. Permissions Required

| Module | Read | Create | Update | Delete |
|---|---|---|---|---|
| Organization | `org:read` | `org:create` | `org:update` | `org:delete` |
| Dashboard | None (all authenticated) | N/A | N/A | N/A |
| Login | Public | N/A | N/A | N/A |

---

## 8. Conclusion

The Login screen is fully functional. The Dashboard and Organization modules are visually complete but use hardcoded inline data instead of calling the existing backend APIs. The API clients are already written and tested — they just need to be imported and called from page.tsx.

**Section Score**: 6.5/10 (visual quality is good, but data is disconnected from backend)
