# Section 1: Business Flow

**Section**: Login + Dashboard + Organization
**Date**: 2026-07-12

---

## 1. Login Flow

```
User opens browser
    ↓
page.tsx renders Home()
    ↓
useAuthStore.initialize()
    ↓
Check localStorage for 'suop_auth'
    ↓
┌─────────────────────────────────┐
│ Found?                          │
├──────── ┬───────────────────────┤
│ YES     │ NO                    │
│ ↓       │ ↓                     │
│ Set     │ Check Supabase        │
│ auth    │ session               │
│ state   │ ↓                     │
│ Render  │ Found?                │
│ ERP     │ YES → Set auth state  │
│ shell   │ NO  → Show LoginScreen│
└─────────┴───────────────────────┘

LoginScreen:
    User enters email + password
    ↓
    Click "Sign In"
    ↓
    useAuthStore.login(email, password)
    ↓
    authClient.login() → POST /api/v1/auth/login
    ↓
┌────────────────────────────────────┐
│ Backend:                           │
│ 1. Validate email + password       │
│ 2. Verify Argon2id hash            │
│ 3. Check account lock status       │
│ 4. Generate JWT access token (15m) │
│ 5. Generate refresh token (30d)    │
│ 6. Write audit log (LOGIN)         │
│ 7. Publish UserLoggedIn event      │
│ 8. Return tokens + user profile    │
└────────────────────────────────────┘
    ↓
    Auth store:
    1. Store user + tokens in state
    2. Persist to localStorage
    3. Set isAuthenticated = true
    ↓
    page.tsx re-renders → shows ERP shell
```

### Demo Mode Flow
```
Click "Demo Mode"
    ↓
    useAuthStore.loginDemo()
    ↓
    Set user = { id: 'demo-user', email: 'demo@sudhastar.com' }
    Set isDemoMode = true
    ↓
    page.tsx renders ERP shell with Demo badge
```

---

## 2. Dashboard Flow

```
User lands on Dashboard (default module)
    ↓
DashboardModule() renders
    ↓
┌─────────────────────────────────────────┐
│ Current (inline data):                  │
│ 1. Show welcome banner (static)         │
│ 2. Show 4 stat cards (hardcoded values) │
│ 3. Show sprint progress list (27 items) │
│                                         │
│ Should be (API-connected):              │
│ 1. Show welcome banner (static)         │
│ 2. Fetch real counts:                   │
│    - productClient.list({pageSize:1})   │
│    - userClient.listRoles({pageSize:1}) │
│    - orgClient.companyApi.list({pageSize:1}) │
│ 3. Show sprint progress (can stay)      │
└─────────────────────────────────────────┘
    ↓
    User clicks a stat card
    ↓
    setActiveModule(card.module)
    ↓
    page.tsx renders the selected module
```

---

## 3. Organization Flow

### Current (Broken) Flow
```
User clicks "Organization" in sidebar
    ↓
OrganizationModule() renders
    ↓
    Displays hardcoded tree:
    Sudhastar Group
    ├── Sudhastar Foods Ltd.
    │   ├── Manufacturing BU
    │   │   ├── Mumbai Plant
    │   │   └── Pune Plant
    │   ├── Retail BU
    │   │   ├── Mumbai Store 01
    │   │   └── Pune Store 01
    │   └── Restaurant BU
    │       └── Mumbai Restaurant
    └── Sudhastar Logistics Ltd.
        └── Distribution BU
            └── Mumbai DC
    ↓
    User clicks a tree node
    ↓
    setSelectedNode(node.code)
    ↓
    Nothing else happens (no detail panel)
    ↓
    User clicks "Add Entity"
    ↓
    Nothing happens (no handler)
```

### Target (Connected) Flow
```
User clicks "Organization" in sidebar
    ↓
OrganizationModule() renders
    ↓
    useEffect(() => {
      orgClient.hierarchyApi.getTree()
    }, [])
    ↓
    Loading state: show skeleton
    ↓
    API returns real hierarchy from PostgreSQL
    ↓
    Render real tree with real data
    ↓
    User clicks a tree node
    ↓
    Fetch detail: orgClient.companyApi.get(node.id)
    ↓
    Show detail panel with:
    - Company info (code, name, GSTIN, PAN, address)
    - Status badge (ACTIVE/INACTIVE)
    - Plants count
    - Warehouses count
    - Action buttons (Edit, Add Plant, Add Warehouse)
    ↓
    User clicks "Add Entity"
    ↓
    Show create dialog with form
    ↓
    User fills form, clicks Save
    ↓
    orgClient.companyApi.create(formData)
    ↓
    Refresh tree
```

---

## 4. Data Dependencies

```
Organization Module
    ↓
    ┌─────────────────┐
    │  companies      │ ← Referenced by: products, suppliers, customers,
    │  plants         │   purchase orders, sales orders, inventory,
    │  warehouses     │   manufacturing, quality, finance, HR, CRM
    │  departments    │
    │  cost_centers   │
    │  financial_years│
    └─────────────────┘
         ↑
    Every module in the ERP references these entities via:
    - company_id
    - plant_id
    - warehouse_id
    - department_id
    - cost_center_id
    - financial_year_id
```

---

## 5. Events

| Event | Trigger | Consumer |
|---|---|---|
| `UserLoggedIn` | Successful login | Security monitoring, notification engine |
| `UserLoggedOut` | Logout | Session cleanup |
| `CompanyCreated` | Organization create | Audit log, notification |
| `PlantActivated` | Plant workflow transition | Manufacturing, inventory modules |
| `WarehouseCreated` | Warehouse create | Inventory, WMS modules |

---

## 6. Audit Records

| Action | Audit Entry |
|---|---|
| Login | `action: LOGIN, entityType: User, entityId: userId` |
| Failed login | `action: LOGIN, severity: WARN` |
| Logout | `action: LOGOUT, entityType: User` |
| Create company | `action: CREATE, entityType: Company, entityId: companyId` |
| Update company | `action: UPDATE, entityType: Company, before/after diff` |
| Delete company | `action: DELETE, entityType: Company, reason` |
| Workflow transition | `action: TRANSITION, before/after status` |

All audit records include: `tenantId`, `correlationId`, `actorId`, `actorName`, `ipAddress`, `userAgent`, `timestamp`.
