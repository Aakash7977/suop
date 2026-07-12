# Section 1: Test Checklist

**Section**: Login + Dashboard + Organization
**Date**: 2026-07-12

---

## 1. Login Screen Tests

### Functional Tests
- [ ] Login with valid credentials → redirects to ERP shell
- [ ] Login with invalid email → shows error message
- [ ] Login with invalid password → shows error message
- [ ] Login with empty email → HTML5 validation prevents submit
- [ ] Login with empty password → HTML5 validation prevents submit
- [ ] Password show/hide toggle works
- [ ] Remember me checkbox toggles state
- [ ] Demo mode button → instant access, shows Demo badge
- [ ] Loading spinner appears during login
- [ ] Error message displays on failed login
- [ ] Error message clears on new attempt

### Token Tests
- [ ] After login, `suop_auth` is set in localStorage
- [ ] After login, `suop_access_token` is set in localStorage (FIX NEEDED)
- [ ] After logout, both localStorage keys are cleared
- [ ] On page refresh, auth state is restored from localStorage
- [ ] Expired token → redirect to login screen

### Responsive Tests
- [ ] Login card centers on mobile (p-3)
- [ ] Login card centers on desktop (p-4)
- [ ] Logo scales on mobile (h-14) vs desktop (h-16)
- [ ] All inputs are tappable on mobile

### Accessibility Tests
- [ ] Email input has associated Label
- [ ] Password input has associated Label
- [ ] Show/hide button has descriptive action
- [ ] Form can be submitted with Enter key
- [ ] Error message is readable by screen reader

---

## 2. Dashboard Tests

### Rendering Tests
- [ ] Welcome banner displays with correct text
- [ ] 4 stat cards render with icons
- [ ] Stat card click navigates to correct module
- [ ] Sprint progress list renders all items
- [ ] Each sprint item shows name + description + Done badge

### Data Tests (after wiring)
- [ ] Products count comes from `GET /api/v1/catalog/products?pageSize=1` → `meta.total`
- [ ] Roles count comes from `GET /api/v1/admin/roles?pageSize=1` → `meta.total`
- [ ] Companies count comes from `GET /api/v1/organization/companies?pageSize=1` → `meta.total`
- [ ] Loading state shows skeleton while fetching
- [ ] Error state shows message if API fails
- [ ] Demo mode shows placeholder values (no API calls)

### Navigation Tests
- [ ] Click "Products" card → navigates to Product Master
- [ ] Click "Roles" card → navigates to RBAC
- [ ] Click "Branches" card → navigates to Organization
- [ ] Click "Compliance" card → navigates to PIM

---

## 3. Organization Tests

### Tree Rendering Tests (after wiring)
- [ ] Organization tree loads from `GET /api/v1/organization/hierarchy`
- [ ] Loading skeleton shows while fetching
- [ ] Tree renders all nodes from API response
- [ ] Expand/collapse works for nodes with children
- [ ] Node selection highlights selected node
- [ ] Node icons match type (ENTERPRISE/COMPANY/BU/BRANCH)
- [ ] Node code displays in monospace badge

### Detail Panel Tests (to implement)
- [ ] Clicking a node shows detail panel
- [ ] Detail panel shows: name, code, type, status
- [ ] Detail panel shows: GSTIN, PAN, CIN (for companies)
- [ ] Detail panel shows: address, city, state, country
- [ ] Detail panel shows: plant count, warehouse count
- [ ] Detail panel shows: created date, updated date

### CRUD Tests (to implement)
- [ ] "Add Entity" button opens create dialog
- [ ] Create form validates required fields (code, name)
- [ ] Create form validates code uniqueness
- [ ] Create form validates GSTIN format
- [ ] Create form validates PAN format
- [ ] Submit creates company via `POST /api/v1/organization/companies`
- [ ] Success: tree refreshes, toast notification shows
- [ ] Error: error message displays, form stays open
- [ ] Edit button opens edit dialog with pre-filled data
- [ ] Edit form shows version (optimistic concurrency)
- [ ] Submit updates via `PATCH /api/v1/organization/companies/:id`
- [ ] Delete button shows confirmation dialog
- [ ] Delete confirms before calling `DELETE /api/v1/organization/companies/:id`
- [ ] Soft-delete: node disappears from tree

### Stat Card Tests (after wiring)
- [ ] Enterprises count = count of ENTERPRISE type nodes in hierarchy
- [ ] Companies count = count of COMPANY type nodes in hierarchy
- [ ] Branches count = count of BRANCH type nodes in hierarchy
- [ ] Warehouses count = `GET /api/v1/organization/warehouses?pageSize=1` → `meta.total`

### Permission Tests
- [ ] User without `org:read` → cannot access Organization module
- [ ] User without `org:create` → "Add Entity" button hidden
- [ ] User without `org:update` → Edit button hidden
- [ ] User without `org:delete` → Delete button hidden
- [ ] Demo mode → all buttons visible (no permission check)

### Error Handling Tests
- [ ] API 401 → redirect to login
- [ ] API 403 → show "Insufficient permissions" message
- [ ] API 404 → show "Not found" message
- [ ] API 409 → show "Conflict: version mismatch" message
- [ ] API 500 → show "Server error" message with retry button
- [ ] Network error → show "Connection failed" with retry button

---

## 4. Sidebar Tests

- [ ] All 27 sections render
- [ ] 200+ nav items render with correct icons
- [ ] Available items are clickable
- [ ] Unavailable items show "Soon" badge and are disabled
- [ ] Active module is highlighted
- [ ] Clicking a nav item switches the main content
- [ ] Sidebar scrolls independently
- [ ] Mobile: sidebar is hidden by default
- [ ] Mobile: hamburger button opens sidebar drawer
- [ ] Mobile: clicking nav item closes sidebar

---

## 5. Header Tests

- [ ] Module title displays correct name
- [ ] Zoom in (Ctrl +) increases zoom
- [ ] Zoom out (Ctrl -) decreases zoom
- [ ] Reset zoom (Ctrl 0) sets to 100%
- [ ] Zoom percentage displays
- [ ] Sprint badge displays
- [ ] Demo badge displays only in demo mode
- [ ] Mobile link opens /mobile page
- [ ] Sign Out button logs out user

---

## 6. Integration Tests

- [ ] Login → Dashboard → Organization (full navigation flow)
- [ ] Login → Dashboard → click Products card → Product Master
- [ ] Login → Organization → tree loads from API
- [ ] Login → Organization → click node → detail shows
- [ ] Login → Organization → Add Entity → create → tree refreshes
- [ ] Logout → redirect to login screen
- [ ] Page refresh → auth state restored → same module shown

---

## 7. Test Summary

| Category | Tests | Currently Passing | After Implementation |
|---|---|---|---|
| Login functional | 11 | 11 | 11 |
| Login token | 5 | 3 | 5 |
| Login responsive | 4 | 4 | 4 |
| Login accessibility | 5 | 4 | 5 |
| Dashboard rendering | 5 | 5 | 5 |
| Dashboard data | 6 | 0 | 6 |
| Dashboard navigation | 4 | 4 | 4 |
| Organization tree | 7 | 5 | 7 |
| Organization detail | 6 | 0 | 6 |
| Organization CRUD | 13 | 0 | 13 |
| Organization stats | 4 | 0 | 4 |
| Organization permissions | 5 | 0 | 5 |
| Error handling | 6 | 0 | 6 |
| Sidebar | 10 | 10 | 10 |
| Header | 9 | 9 | 9 |
| Integration | 7 | 2 | 7 |
| **Total** | **101** | **57** | **101** |
