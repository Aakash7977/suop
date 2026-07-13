# Section 02: RBAC + User Management + Role Management + Permission Management

**Complete Enterprise Discovery & Analysis Report**
**Date**: 2026-07-12
**Source**: `src/app/page.tsx` lines 922–1548 + backend modules (auth, user-management)

---

## 1. Executive Summary

The RBAC module (`RBACModule()`) is the enterprise authorization platform managing Users, Roles, Permissions, Feature Flags, and Approval Authority. It was partially implemented in Section 02 with 15 API endpoints wired, 5 tabs (Users, Roles, Permissions, Flags, Approvals), and 4 dialogs (Invite User, Edit User, Create Role, Clone Role). The module uses 39 `useState` hooks, 6 `useEffect` hooks, and makes 29 API calls across its lifecycle.

**Current Production Readiness Score**: 7.5/10 — functional but with identified gaps in several enterprise areas.

---

## 2. Business Purpose

### Why This Screen Exists
The RBAC module is the **security backbone** of the ERP. Every action across all 200+ modules is gated by permissions defined and managed here. Without this module functioning correctly, the entire ERP security model collapses.

### Who Uses It
| Persona | Department | Usage |
|---|---|---|
| System Administrator | IT | User provisioning, role assignment, account lock/unlock |
| Security Officer | Compliance | Permission audits, role reviews, delegation management |
| HR Manager | HR | User onboarding via invitations, designation updates |
| Department Head | Operations | Approval authority configuration, delegation setup |
| Auditor | Internal Audit | Login history review, session audit, permission matrix review |

### Business Problems Solved
1. **User Provisioning**: Create user accounts via invitation flow
2. **Access Control**: Assign roles with specific permission sets
3. **Security Monitoring**: Track login attempts, sessions, device history
4. **Account Security**: Lock/unlock accounts, revoke sessions, force password changes
5. **Delegation**: Temporarily delegate approval authority during absence
6. **Compliance**: Audit trail for every user/role/permission change

### Downstream Dependencies
Every module in the ERP depends on RBAC:
- **Procurement**: `po:approve`, `po:create`, `po:read`
- **Inventory**: `inventory:post`, `inventory:adjust`
- **Manufacturing**: Production order permissions
- **Quality**: `iqc:inspect`, `iqc:approve`, `ncr:create`
- **Finance**: `audit:read`, financial approval permissions
- **Sales**: `customer:read`, `customer:create`

---

## 3. Current Features

### Already Implemented (from Section 02 work)
| Feature | Status | API Connected |
|---|---|---|
| User list with table | ✅ | `GET /api/v1/admin/users` |
| User search (name, email, username) | ✅ | Query param `search` |
| User status filter (ACTIVE/LOCKED/DISABLED/INVITED) | ✅ | Query param `status` |
| User pagination | ✅ | Query param `page` |
| User detail panel | ✅ | `GET /api/v1/admin/users/:id` |
| Login history (last 5 entries) | ✅ | `GET /api/v1/admin/users/:id/login-history` |
| Lock user | ✅ | `POST /api/v1/admin/users/:id/lock` |
| Unlock user | ✅ | `POST /api/v1/admin/users/:id/unlock` |
| Edit user (6 fields) | ✅ | `PATCH /api/v1/admin/users/:id` |
| Invite user dialog | ✅ | `POST /api/v1/auth/invite` |
| Revoke all sessions | ✅ | `POST /api/v1/admin/users/:id/sessions/revoke-all` |
| Role list with search | ✅ | `GET /api/v1/admin/roles` |
| Role detail panel | ✅ | `GET /api/v1/admin/roles/:id` |
| Create role | ✅ | `POST /api/v1/admin/roles` |
| Clone role | ✅ | `POST /api/v1/admin/roles/:id/clone` |
| Delete role (with confirmation) | ✅ | `DELETE /api/v1/admin/roles/:id` |
| Permission matrix table | ✅ | `GET /api/v1/admin/permissions` |
| Permission search | ✅ | Client-side filter |
| Permission module filter | ✅ | Query param `module` |
| Permission modules list | ✅ | `GET /api/v1/admin/permissions/modules` |
| Live stats (users, roles, permissions counts) | ✅ | 3 parallel API calls |
| Loading skeletons | ✅ | All tabs |
| Error handling with demo fallback | ✅ | All tabs |
| RBAC on buttons | ✅ | `hasPermission('auth:manage_users')`, `hasPermission('auth:manage_roles')` |
| Feature Flags tab (preserved) | ✅ | Static data |
| Approvals tab (preserved) | ✅ | Static data |

### Not Yet Implemented (Gaps)
| Feature | Priority | Effort |
|---|---|---|
| Delete user (soft delete) | High | 2 hours |
| Disable user | High | 1 hour |
| Force password change | High | 2 hours |
| Reset password (admin) | High | 2 hours |
| Role assignment to user (UI) | High | 3 hours |
| Role revocation from user (UI) | High | 2 hours |
| Permission assignment to role (UI) | High | 3 hours |
| Permission revocation from role (UI) | High | 2 hours |
| Role comparison | Medium | 2 hours |
| Approval delegations CRUD | Medium | 4 hours |
| User assignments (entity-level) | Medium | 4 hours |
| User preferences management | Low | 2 hours |
| Export users (CSV/Excel) | Medium | 2 hours |
| Export roles | Low | 1 hour |
| Bulk user actions (bulk lock, bulk unlock) | Medium | 3 hours |
| User device list | Low | 2 hours |
| Change password (self-service) | Medium | 2 hours |
| Forgot password flow | Medium | 3 hours |
| MFA enable/disable | Low | 2 hours |
| Role edit (PATCH) | Medium | 2 hours |
| Role status transition (activate/deactivate) | Medium | 2 hours |
| Toast notifications on success/error | Medium | 2 hours |
| Audit timeline viewer | Low | 3 hours |
| Responsive table (horizontal scroll on mobile) | Low | 1 hour |

---

## 4. Current Components

### Component Hierarchy
```
RBACModule()
├── Header Banner (Card with gradient)
├── Stats Cards (4 cards: Users, Roles, Permissions, Feature Flags)
├── Tab Navigation (5 tabs)
│
├── Users Tab
│   ├── Search Input + Status Filter + Invite Button
│   ├── User Table (7 columns: User, Email, Designation, Status, MFA, Last Login, Actions)
│   │   └── Row Actions: Lock, Unlock, Edit
│   ├── Pagination (Previous/Next)
│   └── User Detail Panel (right side)
│       ├── User info (username, email, name, status, designation, phone, timezone, MFA)
│       ├── Roles badges
│       ├── Action buttons (Lock, Unlock, Revoke Sessions, Edit)
│       └── Login History (last 5 entries)
│
├── Roles Tab
│   ├── Search Input + Create Role Button
│   ├── Role List (cards with: name, display_name, category, status, system badge)
│   └── Role Detail Panel (right side)
│       ├── Role info (name, display_name, description, category, status)
│       ├── Permissions list (badges)
│       └── Action buttons (Clone, Delete)
│
├── Permissions Tab
│   ├── Search Input + Module Filter Dropdown
│   └── Permission Table (6 columns: Code, Display Name, Module, Feature, Action, Group)
│
├── Feature Flags Tab (preserved — static)
│   └── Flag cards with Switch + State badge
│
├── Approvals Tab (preserved — static)
│   └── Approval matrix (Level, Approver, Min, Max)
│
└── Dialogs
    ├── Invite User Dialog (email, firstName, lastName, designation, role)
    ├── Edit User Dialog (firstName, lastName, designation, phone, timezone, locale)
    ├── Create Role Dialog (name, displayName, description)
    └── Clone Role Dialog (newName, newDisplayName)
```

### State Summary
- **39 `useState` hooks** — managing users, roles, permissions, loading states, errors, selections, dialogs, search/filters
- **6 `useEffect` hooks** — loading users, roles, permissions, stats, user detail, role detail
- **29 API calls** — across all effects and action handlers
- **4 dialog modals** — invite, edit, create role, clone role

---

## 5. Backend Mapping

### Complete Endpoint Map

#### User Management (12 endpoints)
| UI Element | Action | API Client Method | Backend Route | Service Method | Repository | Permission |
|---|---|---|---|---|---|---|
| User table | Load list | `apiFetch('/api/v1/admin/users')` | `GET /admin/users` | `userService.list()` | `userRepository` (raw SQL) | `auth:manage_users` |
| User detail panel | Load detail | `apiFetch('/api/v1/admin/users/:id')` | `GET /admin/users/:id` | `userService.getById()` | `userRepository.findById()` | `auth:manage_users` |
| Edit user dialog | Submit | `apiFetch('/api/v1/admin/users/:id', PATCH)` | `PATCH /admin/users/:id` | `userService.update()` | `userRepository` (UPDATE) | `auth:manage_users` |
| Lock button | Click | `apiFetch('/api/v1/admin/users/:id/lock', POST)` | `POST /admin/users/:id/lock` | `userService.lockUser()` | `userRepository.lockUser()` | `auth:manage_users` |
| Unlock button | Click | `apiFetch('/api/v1/admin/users/:id/unlock', POST)` | `POST /admin/users/:id/unlock` | `userService.unlockUser()` | `userRepository.unlockUser()` | `auth:manage_users` |
| Revoke sessions | Click | `apiFetch('/api/v1/admin/users/:id/sessions/revoke-all', POST)` | `POST /admin/users/:id/sessions/revoke-all` | `userService.revokeAllSessions()` | `refreshTokenRepository` | `auth:manage_users` |
| Login history | Auto-load | `apiFetch('/api/v1/admin/users/:id/login-history')` | `GET /admin/users/:id/login-history` | `userService.getUserLoginHistory()` | `loginHistoryRepository.listForUser()` | `auth:manage_users` |
| Sessions list | Auto-load | `apiFetch('/api/v1/admin/users/:id/sessions')` | `GET /admin/users/:id/sessions` | `userService.getUserSessions()` | `refreshTokenRepository` | `auth:manage_users` |
| Invite dialog | Submit | `apiFetch('/api/v1/auth/invite', POST)` | `POST /auth/invite` | `authService.inviteUser()` | `invitationRepository.create()` | `auth:manage_users` |
| — | — | `POST /admin/users/:id/roles/:roleName` | `POST /admin/users/:id/roles/:roleName` | `userService.assignRole()` | `userRoleRepository.assignRole()` | `auth:manage_roles` |
| — | — | `DELETE /admin/users/:id/roles/:roleName` | `DELETE /admin/users/:id/roles/:roleName` | `userService.revokeRole()` | `userRoleRepository.revokeRole()` | `auth:manage_roles` |
| — | — | `POST /admin/users/:id/assignments` | `POST /admin/users/:id/assignments` | `userService.assignToEntity()` | `userAssignmentRepository.create()` | `auth:manage_users` |

#### Role Management (8 endpoints)
| UI Element | Action | API Client Method | Backend Route | Service Method | Repository | Permission |
|---|---|---|---|---|---|---|
| Role list | Load | `apiFetch('/api/v1/admin/roles')` | `GET /admin/roles` | `roleService.list()` | `roleRepository.list()` | `auth:manage_roles` |
| Role detail | Load | `apiFetch('/api/v1/admin/roles/:id')` | `GET /admin/roles/:id` | `roleService.getById()` | `roleRepository.findById()` | `auth:manage_roles` |
| Create role dialog | Submit | `apiFetch('/api/v1/admin/roles', POST)` | `POST /admin/roles` | `roleService.create()` | `roleRepository.create()` | `auth:manage_roles` |
| — | — | `PATCH /admin/roles/:id` | `PATCH /admin/roles/:id` | `roleService.update()` | `roleRepository.update()` | `auth:manage_roles` |
| Delete role | Click | `apiFetch('/api/v1/admin/roles/:id', DELETE)` | `DELETE /admin/roles/:id` | `roleService.delete()` | `roleRepository.softDelete()` | `auth:manage_roles` |
| Clone role dialog | Submit | `apiFetch('/api/v1/admin/roles/:id/clone', POST)` | `POST /admin/roles/:id/clone` | `roleService.clone()` | `roleRepository.clone()` | `auth:manage_roles` |
| — | — | `POST /admin/roles/:id/permissions/:code` | `POST /admin/roles/:id/permissions/:code` | `roleService.assignPermission()` | `rolePermissionRepository.assign()` | `auth:manage_roles` |
| — | — | `DELETE /admin/roles/:id/permissions/:code` | `DELETE /admin/roles/:id/permissions/:code` | `roleService.revokePermission()` | `rolePermissionRepository.revoke()` | `auth:manage_roles` |

#### Permission Management (4 endpoints)
| UI Element | Action | API Client Method | Backend Route | Service Method | Repository | Permission |
|---|---|---|---|---|---|---|
| Permission table | Load | `apiFetch('/api/v1/admin/permissions')` | `GET /admin/permissions` | `permissionService.list()` | `permissionRepository.list()` | `auth:manage_roles` |
| Module dropdown | Load | `apiFetch('/api/v1/admin/permissions/modules')` | `GET /admin/permissions/modules` | `permissionService.listModules()` | `permissionRepository.listModules()` | `auth:manage_roles` |
| — | — | `GET /admin/permissions/groups` | `GET /admin/permissions/groups` | `permissionService.listGroups()` | `permissionRepository.listGroups()` | `auth:manage_roles` |
| — | — | `GET /admin/roles/compare` | `GET /admin/roles/compare` | `roleService.compareRoles()` | — | `auth:manage_roles` |

#### Delegation Management (3 endpoints — NOT wired)
| UI Element | Action | Backend Route | Permission |
|---|---|---|---|
| — | — | `GET /admin/delegations` | `auth:manage_users` |
| — | — | `POST /admin/delegations` | `auth:manage_users` |
| — | — | `DELETE /admin/delegations/:id` | `auth:manage_users` |

#### Auth Endpoints (3 endpoints — used by auth store, not RBACModule)
| UI Element | Action | Backend Route | Permission |
|---|---|---|---|
| Invite dialog | Submit | `POST /auth/invite` | `auth:manage_users` |
| — | — | `POST /auth/accept-invitation` | Public |
| — | — | `POST /auth/change-password` | Authenticated |

---

## 6. Workflow Mapping

### User Lifecycle Workflow (`UserLifecycle`)
```
INVITED → ACTIVATED → ACTIVE → LOCKED → DISABLED → ARCHIVED
                ↑                   ↓
                └───────────────────┘
                    (unlock)
```

| Transition | Frontend Trigger | Backend Method | Audit Action |
|---|---|---|---|
| INVITED → ACTIVATED | User accepts invitation | `authService.acceptInvitation()` | `CREATE` |
| ACTIVATED → ACTIVE | First login after activation | `authService.login()` (auto) | `LOGIN` |
| ACTIVE → LOCKED | Admin clicks "Lock" | `userService.lockUser()` | `TRANSITION` |
| LOCKED → ACTIVE | Admin clicks "Unlock" | `userService.unlockUser()` | `TRANSITION` |
| ACTIVE → DISABLED | (Not implemented in frontend) | `userRepository.updateStatus()` | `TRANSITION` |
| DISABLED → ACTIVE | (Not implemented in frontend) | `userRepository.updateStatus()` | `TRANSITION` |
| Any → ARCHIVED | (Not implemented in frontend) | `userRepository.updateStatus()` | `TRANSITION` |
| Auto-lock after 5 failed logins | (Backend auto) | `authService.login()` → `userRepository.lockUser()` | `ACCOUNT_LOCKED` |

### Role Lifecycle
Roles do not have a formal workflow. Status is managed via:
- `roleService.create()` → status = `ACTIVE`
- `roleService.update(id, { status })` → transition (not wired in frontend)
- `roleService.delete()` → soft delete (`deleted_at` set)

### Events Fired
| Event | Trigger | Consumer |
|---|---|---|
| `UserRegistered` | User accepts invitation | Notification engine |
| `UserLoggedIn` | Successful login | Security monitoring |
| `UserLoggedOut` | Logout | Session cleanup |

### Audit Trail
- **Auth service**: 13 `auditService.log()` calls (login, logout, password change, invite, lock, unlock)
- **User management service**: 17 `auditService.log()` calls (role assign, role revoke, user update, lock, unlock, assignment create/revoke, delegation create/revoke, preference set)
- All audit entries include: `tenantId`, `correlationId`, `actorId`, `actorName`, `ipAddress`, `userAgent`, `action`, `entityType`, `entityId`, `before/after`

---

## 7. Database Mapping

### Tables Used

#### Auth Tables (migration 0004)
| Table | Purpose | Key Columns | Soft Delete | Tenant Isolation |
|---|---|---|---|---|
| `users` | User accounts | id, tenant_id, username, email, password_hash, status, failed_login_attempts, locked_until, mfa_enabled, last_login_at | ✅ `deleted_at` | ✅ `tenant_id` |
| `user_roles` | Role assignments | user_id, role_name, tenant_id | ❌ | ✅ `tenant_id` |
| `login_history` | Login audit trail | user_id, email, success, failure_reason, ip_address, user_agent, timestamp | ❌ | ✅ `tenant_id` |
| `password_history` | Password reuse prevention | user_id, password_hash, changed_at | ❌ | ✅ `tenant_id` |
| `device_registry` | Registered devices | user_id, fingerprint, device_name, last_seen | ❌ | ✅ `tenant_id` |
| `user_invitations` | Pending invitations | email, token_hash, roles, invited_by, expires_at | ❌ | ✅ `tenant_id` |
| `password_reset_tokens` | Password reset flow | user_id, token_hash, expires_at | ❌ | ✅ `tenant_id` |
| `email_verification_tokens` | Email verification | user_id, token_hash, expires_at | ❌ | ✅ `tenant_id` |

#### User Management Tables (migration 0005)
| Table | Purpose | Key Columns | Soft Delete | Tenant Isolation |
|---|---|---|---|---|
| `roles` | Role definitions | id, tenant_id, name, display_name, description, category, is_system, is_template, status, version | ✅ `deleted_at` | ✅ `tenant_id` |
| `permissions` | Permission catalog | id, module, feature, action, code, display_name, permission_group | ❌ | ❌ (global catalog) |
| `role_permissions` | Permission assignments to roles | role_id, permission_id, tenant_id | ❌ | ✅ `tenant_id` |
| `user_assignments` | Entity-level user assignments | user_id, entity_type, entity_id, entity_name, role_id, is_primary | ❌ | ✅ `tenant_id` |
| `approval_delegations` | Approval authority delegations | delegator_id, delegate_id, approval_type, entity_type, max_amount, effective_from, effective_to | ❌ | ✅ `tenant_id` |
| `user_preferences` | User-specific settings | user_id, key, value | ❌ | ✅ `tenant_id` |

### Business Rules (Backend-Enforced)
1. **Email uniqueness**: `userRepository.findByEmail()` — checked during invite
2. **Username uniqueness**: `userRepository.findByUsername()` — checked during registration
3. **Password history**: Last 10 passwords cannot be reused (`PASSWORD_HISTORY_COUNT = 10`)
4. **Password strength**: `z.string().min(12)` — Zod validation
5. **Max failed logins**: 5 attempts → auto-lock (`MAX_FAILED_LOGINS = 5`)
6. **Lock duration**: 30 minutes (`LOCK_DURATION_MIN = 30`)
7. **Role name uniqueness**: `roleRepository.findByName()` — checked during create
8. **System role protection**: `is_system` roles cannot be deleted (frontend checks)
9. **Optimistic concurrency**: `version` field on roles, `If-Match` header on PATCH/DELETE
10. **Tenant isolation**: All queries scoped by `tenant_id`

### Validation Rules (Zod Schemas)
| Schema | Fields | Rules |
|---|---|---|
| `loginSchema` | email, password, tenantId?, deviceFingerprint?, deviceName? | email: valid email; password: min 1 |
| `changePasswordSchema` | currentPassword, newPassword | currentPassword: min 1; newPassword: min 12 |
| `forgotPasswordSchema` | email | valid email |
| `resetPasswordSchema` | token, newPassword | token: min 1; newPassword: min 12 |
| `inviteSchema` | email, firstName?, lastName?, designation?, roles, defaultCompanyId?, defaultPlantId?, message? | email: valid; roles: array min 1 |
| `roleCreateSchema` | name, displayName, description?, category, permissionCodes? | name: 2-50 chars; displayName: 1-100 chars |
| `roleCloneSchema` | newName, newDisplayName | newName: 2-50; newDisplayName: 1-100 |
| `assignmentSchema` | userId, entityType, entityId, entityName?, roleId?, isPrimary | entityType: enum (9 types); isPrimary: default false |
| `delegationSchema` | delegatorId, delegateId, approvalType, entityType?, entityId?, maxAmount?, effectiveFrom, effectiveTo, reason? | maxAmount: positive; dates: datetime |

---

## 8. Permission Mapping

### Permissions Used in This Section
| Permission Code | Used For | Enforced In Frontend? |
|---|---|---|
| `auth:manage_users` | View users, lock/unlock, edit, invite, revoke sessions, assignments, delegations | ✅ Yes (`hasPermission('auth:manage_users')`) |
| `auth:manage_roles` | View roles, create/edit/delete/clone roles, assign/revoke permissions, view permissions | ✅ Yes (`hasPermission('auth:manage_roles')`) |
| `auth:reset_password` | Force password reset (not yet implemented) | ❌ Not implemented |

### Default Roles (from backend)
| Role | Category | System? | Typically Has Permissions |
|---|---|---|---|
| `SUPER_ADMIN` | EXECUTIVE | Yes | All 54 permissions |
| `FIN_MGR` | MANAGEMENT | No | Finance-related permissions |
| `HR_MGR` | MANAGEMENT | No | HR-related permissions |
| `WH_MGR` | MANAGER | No | Warehouse/inventory permissions |
| `CASHIER` | OPERATOR | No | POS/sales permissions |
| `AUDITOR` | CLERK | No | `audit:read`, read-only access |

---

## 9. Data Flow

### User List Data Flow
```
User opens RBAC tab → 'users'
    ↓
useEffect triggers
    ↓
apiFetch('GET /api/v1/admin/users?page=1&search=...&status=...')
    ↓
Backend: authMiddleware → tenantMiddleware → requirePermission('auth:manage_users')
    ↓
Route: userManagementRoutes.get('/users')
    ↓
Service: userService.list({ page, search, status })
    ↓
Repository: userRepository (raw SQL SELECT FROM users WHERE tenant_id = $1 AND deleted_at IS NULL)
    ↓
Database: PostgreSQL (PGlite in dev)
    ↓
Response: { success: true, data: [...], meta: { total, page, pageSize } }
    ↓
Frontend: setUsers(json.data), setUsersTotal(json.meta.total)
    ↓
Render: User table with rows
```

### Invite User Data Flow
```
Admin clicks "Invite User"
    ↓
Dialog opens (form: email, firstName, lastName, designation, role)
    ↓
Admin fills form, clicks "Send Invitation"
    ↓
apiFetch('POST /api/v1/auth/invite', { email, firstName, lastName, designation, roles: [roleName] })
    ↓
Backend: requirePermission('auth:manage_users') → zValidator(inviteSchema)
    ↓
Service: authService.inviteUser({ email, firstName, lastName, designation, roles })
    ↓
Repository: invitationRepository.create({ tenantId, email, tokenHash, roles, ... })
    ↓
Audit: auditService.log({ action: 'CREATE', entityType: 'UserInvitation' })
    ↓
Response: { success: true, data: { invitationId, token } }
    ↓
Frontend: close dialog, (ideally: show toast, refresh user list)
```

### Lock User Data Flow
```
Admin clicks Lock button on user row
    ↓
apiFetch('POST /api/v1/admin/users/:id/lock')
    ↓
Backend: requirePermission('auth:manage_users')
    ↓
Service: userService.lockUser(targetUserId)
    ↓
  1. Fetch user → check exists
    2. Check status (must be ACTIVE)
    3. Call auth service lockUser()
    4. auth service: userRepository.lockUser(userId, 30min)
    5. auth service: userRepository.updateStatus(userId, 'LOCKED')
    6. Audit: auditService.log({ action: 'TRANSITION', entityType: 'User' })
    7. Event: (no specific event, but audit recorded)
    ↓
Response: { success: true }
    ↓
Frontend: setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'LOCKED' } : u))
    ↓
UI: User row shows LOCKED badge, Unlock button appears
```

---

## 10. Current Problems

### Critical Issues
| # | Issue | Impact | Location |
|---|---|---|---|
| C-01 | No "Delete User" or "Disable User" button | Cannot deactivate accounts — security risk | Users tab |
| C-02 | No "Force Password Change" or "Reset Password" button | Admin cannot reset forgotten passwords | Users tab |
| C-03 | No role assignment UI (assign/revoke roles to users) | Admins cannot change user roles from the UI | User detail panel |
| C-04 | No permission assignment UI (assign/revoke permissions to roles) | Admins cannot modify role permissions from the UI | Role detail panel |

### High Issues
| # | Issue | Impact | Location |
|---|---|---|---|
| H-01 | No toast notifications on success/error | Users don't know if action succeeded | All actions |
| H-02 | No "Edit Role" dialog (PATCH endpoint exists but not wired) | Cannot rename or update role description | Roles tab |
| H-03 | No role status transition (activate/deactivate) | Cannot deactivate roles without deleting | Roles tab |
| H-04 | No bulk actions (bulk lock, bulk unlock, bulk export) | Inefficient for large user bases | Users tab |
| H-05 | No export functionality (CSV/Excel) | Cannot export user/role lists for audit | All tabs |
| H-06 | No confirmation dialog for lock/unlock (only delete has one) | Accidental locks possible | Users tab |

### Medium Issues
| # | Issue | Impact | Location |
|---|---|---|---|
| M-01 | No delegation management UI | Cannot set up approval delegations | Missing tab |
| M-02 | No user assignments UI (entity-level) | Cannot assign users to specific plants/warehouses | Missing from detail |
| M-03 | No user device list | Cannot view/manage registered devices | User detail |
| M-04 | No role comparison feature | Cannot compare two roles side-by-side | Roles tab |
| M-05 | No user preferences management | Cannot view/set user-specific settings | User detail |
| M-06 | No MFA enable/disable toggle | Cannot manage MFA from admin panel | User detail |
| M-07 | No audit timeline viewer | Cannot see user's full audit history | User detail |
| M-08 | Sessions list loaded but not displayed | API call made but no UI rendering | User detail |
| M-09 | No column sorting on tables | Cannot sort by name, email, status, etc. | All tables |
| M-10 | No saved views / column visibility | Cannot customize table layout | All tables |

### Low Issues
| # | Issue | Impact | Location |
|---|---|---|---|
| L-01 | Feature Flags tab uses static data | Cannot toggle actual feature flags | Flags tab |
| L-02 | Approvals tab uses static data | Cannot edit approval matrix | Approvals tab |
| L-03 | No keyboard navigation (tab order, shortcuts) | Accessibility gap | All tabs |
| L-04 | No empty state illustration | Generic text only | All tabs |
| L-05 | No responsive table (horizontal scroll on mobile) | Poor mobile UX | All tables |

---

## 11. Production Readiness Score

| Dimension | Score | Notes |
|---|---|---|
| UI | 7/10 | Good layout, tabs, detail panels. Missing some enterprise features (bulk actions, export). |
| UX | 6/10 | Loading skeletons ✅, error handling ✅. Missing toasts, confirmations (except delete), empty states. |
| Business Logic | 8/10 | Backend is complete (all rules enforced server-side). Frontend reuses backend correctly. |
| Backend Integration | 8/10 | 15 of 30 endpoints wired. Missing: role update, role assign/revoke, permission assign/revoke, delegations, assignments, preferences. |
| API Usage | 7/10 | Uses inline `apiFetch` instead of existing `userMgmtApi` client. Works but duplicates code. |
| Workflow | 6/10 | Lock/unlock works. Missing: disable, archive, role status transitions. |
| RBAC | 8/10 | `hasPermission` on all action buttons. Missing: field-level readonly, menu hiding. |
| Security | 8/10 | Backend enforces all security. Frontend sends Bearer token. Missing: session timeout warning. |
| Performance | 8/10 | Parallel API calls, cancel-on-unmount, Promise.allSettled. Good. |
| Testing | 3/10 | No frontend tests. Backend: 3,299 tests (unchanged). |
| Accessibility | 4/10 | Missing: keyboard navigation, ARIA labels, screen reader support. |
| Documentation | 7/10 | This report. Backend well-documented. Frontend lacks component docs. |
| **Production Readiness** | **7.5/10** | Functional but needs enterprise polish (toasts, bulk, export, role editing, permission management). |

---

## 12. Recommended Enterprise Implementation Strategy

### Phase 1: Critical Gaps (C-01 to C-04) — 10 hours
1. Add "Disable User" button → `PATCH /api/v1/admin/users/:id` with `{ status: 'DISABLED' }`
2. Add "Reset Password" button → new dialog → `POST /api/v1/auth/reset-password` (admin-initiated)
3. Add role assignment UI in user detail → dropdown of available roles + assign/revoke buttons
4. Add permission assignment UI in role detail → checkbox list + assign/revoke buttons

### Phase 2: High Gaps (H-01 to H-06) — 12 hours
1. Add toast notifications (success/error) on all CRUD actions
2. Add "Edit Role" dialog → `PATCH /api/v1/admin/roles/:id`
3. Add role status transition buttons (Activate/Deactivate)
4. Add bulk selection + bulk actions (lock, unlock, export)
5. Add CSV export for users and roles
6. Add confirmation dialogs for lock/unlock

### Phase 3: Medium Gaps (M-01 to M-10) — 20 hours
1. Add Delegations tab → CRUD for approval delegations
2. Add user assignments section in user detail
3. Add device list in user detail
4. Add role comparison feature
5. Add column sorting on all tables
6. Display sessions list in user detail (already fetched)

### Phase 4: Low Gaps (L-01 to L-05) — 8 hours
1. Wire Feature Flags to backend (if API exists) or keep as config
2. Wire Approvals to backend (if API exists) or keep as config
3. Add keyboard navigation
4. Add empty state illustrations
5. Add responsive table handling

### Total Estimated Effort: ~50 hours (1 developer, 1 week)

---

## 13. Summary

The RBAC module is **functionally operational** with 15 API endpoints connected, covering user listing, detail, lock/unlock, edit, invite, and role CRUD. The backend is **enterprise-complete** with 30 endpoints, full workflow support, audit logging, and tenant isolation.

The main gaps are in **permission management UI** (assigning/revoke permissions to roles), **role assignment to users** (the UI doesn't exist despite backend support), and **enterprise UX features** (toasts, bulk actions, exports, confirmations).

**The existing UI design should be preserved.** All new features should be added as extensions to the current tab structure and dialog patterns.

**Production Readiness**: 7.5/10 — **CONDITIONAL GO** (functional for basic operations, needs Phase 1-2 for enterprise readiness)
