# Section 1: UI Component Map

**Section**: Login + Dashboard + Organization
**Date**: 2026-07-12

---

## LoginScreen (line 89–148)

| Component | Type | Props | Purpose | Status |
|---|---|---|---|---|
| Root div | Container | `min-h-screen flex items-center justify-center` | Centered login card | ✅ |
| Logo badge | Div | `h-14 w-14 rounded-2xl bg-primary` | SUOP "S" logo | ✅ |
| Title | H1 | `text-xl md:text-2xl font-bold` | "SUOP Admin" | ✅ |
| Subtitle | P | `text-xs text-slate-400` | "Sudhastar Unified Operating Platform" | ✅ |
| Sprint badge | Badge | `variant="outline"` | "Sprint 55 · Parts 1-6 · 497 Tables" | ✅ |
| Login card | Card | `p-4 md:p-6 bg-slate-900/80` | Form container | ✅ |
| Email field | Input + Label | `type="email"` | Email input with mail icon | ✅ |
| Password field | Input + Label | `type="password"` | Password with show/hide toggle | ✅ |
| Remember me | Checkbox | Native input | "Remember me for 30 days" | ✅ |
| Error display | Div | `text-rose-400 bg-rose-950/50` | Shows login error message | ✅ |
| Sign In button | Button | `type="submit" disabled={loading}` | Triggers login | ✅ |
| Loading spinner | Loader2 | `animate-spin` | Shows during login | ✅ |
| Divider | Separator + span | "OR" | Visual separator | ✅ |
| Demo button | Button | `variant="outline"` | Demo mode access | ✅ |
| Help text | P | `text-[10px] text-slate-500` | Instructions | ✅ |

## DashboardModule (line 546–626)

| Component | Type | Purpose | Data Source | Status |
|---|---|---|---|---|
| Welcome banner | Card | Hero section with gradient | Static text | ✅ |
| Stats counter | Div | 223 tables, 821 entities, 249 decisions, 27 sprints | Hardcoded | ⚠️ |
| Stat cards (4) | Card grid | Products, Roles, Branches, Compliance | Hardcoded values | ⚠️ |
| Card click | Button | Navigate to module | `setActiveModule()` | ✅ |
| Sprint list | Card | Progress timeline | Hardcoded `sprintData` array (27 items) | ⚠️ |
| Sprint item | Div | Sprint name + description + Done badge | From `sprintData` | ✅ |
| Done badge | Badge | Green "Done" badge | Static | ✅ |

## OrganizationModule (line 629–700)

| Component | Type | Purpose | Data Source | Status |
|---|---|---|---|---|
| Header banner | Card | "Enterprise Organization Platform" title | Static text | ✅ |
| Stat cards (4) | Card grid | Enterprises, Companies, Branches, Warehouses | Hardcoded values | ⚠️ |
| Tree container | Card | Organization tree viewport | — | ✅ |
| Tree header | Div | Title + "Add Entity" button | — | ✅ |
| Add Entity button | Button | Create new org entity | No handler | ❌ |
| ScrollArea | ScrollArea | `h-[500px]` scrollable tree | — | ✅ |
| TreeItem | Component (recursive) | Renders a tree node | From `tree` array | ⚠️ |
| Expand/collapse | Button | Toggle children visibility | `useState(exp)` | ✅ |
| Node icon | Icon | Type-specific icon (Enterprise/Company/BU/Branch) | From `icons` map | ✅ |
| Node name | Span | Display name | From tree data | ✅ |
| Node code | Badge | Display code (monospace) | From tree data | ✅ |
| Node selection | Div onClick | Highlight selected node | `setSelectedNode()` | ✅ |

## Sidebar (line 150–542)

| Component | Type | Purpose | Status |
|---|---|---|---|
| Sidebar container | Aside | `w-64 border-r bg-sidebar` | ✅ |
| Logo section | Div | SUOP logo + name | ✅ |
| Nav sections | Nav | 27 sections with items | ✅ |
| Nav item | Button | Module selector with icon + name | ✅ |
| Availability badge | Badge | "Soon" for unavailable modules | ✅ |
| Active highlight | CSS | `bg-sidebar-accent` for active module | ✅ |
| Sign Out button | Button | `onClick={logout}` | ✅ |
| ScrollArea | ScrollArea | Sidebar content scroll | ✅ |

## Header (in Home component, line 35630+)

| Component | Type | Purpose | Status |
|---|---|---|---|
| Mobile menu button | Button | Toggle sidebar on mobile | ✅ |
| Module title | H1 | Current module name | ✅ |
| Zoom controls | Div | Zoom in/out/reset (Ctrl+/-) | ✅ |
| Sprint badge | Badge | "Sprint 55 · 497 Tables" | ✅ |
| Demo badge | Badge | "Demo" indicator | ✅ |
| Mobile link | A | Link to /mobile page | ✅ |

---

## Component Hierarchy

```
Home()
├── LoginScreen()                    [when !isAuthenticated]
│   ├── Logo + Title
│   ├── Login Form
│   │   ├── Email Input
│   │   ├── Password Input (with show/hide)
│   │   ├── Remember Me Checkbox
│   │   ├── Error Display
│   │   └── Sign In Button
│   └── Demo Mode Button
│
├── Sidebar                          [when isAuthenticated]
│   ├── Logo
│   ├── Nav Sections (27)
│   │   └── Nav Items (200+)
│   └── Sign Out Button
│
├── Header
│   ├── Mobile Menu Toggle
│   ├── Module Title
│   ├── Zoom Controls
│   ├── Sprint Badge
│   └── Demo Badge
│
└── Main Content
    ├── DashboardModule()            [when activeModule === 'dashboard']
    │   ├── Welcome Banner
    │   ├── Stat Cards (4)
    │   └── Sprint Progress List
    │
    └── OrganizationModule()         [when activeModule === 'organization']
        ├── Header Banner
        ├── Stat Cards (4)
        └── Organization Tree
            └── TreeItem (recursive)
                ├── Expand/Collapse Button
                ├── Type Icon
                ├── Node Name
                └── Node Code Badge
```
