# 08 — UI Component Map: Login + Dashboard + Organization

**Scope**: Every component, sub-component, icon, layout primitive, and design token used in the section.
**Source**: `src/app/page.tsx` lines 89–700 and 35332+, plus `src/components/ui/*`.

---

## 1. Component Tree

```
Home (line 35332)
├── (if !isAuthenticated)
│   └── LoginScreen (89–148)
│       ├── Card (ui/card)
│       ├── Input (ui/input) × 2
│       │   ├── Mail icon (lucide)
│       │   ├── Lock icon (lucide)
│       │   └── Eye / EyeOff toggle (lucide)
│       ├── Checkbox (ui/checkbox) — remember me
│       ├── Button (ui/button) — Sign In
│       │   └── Loader2 icon (animate-spin) when loading
│       └── Button (ui/button) — Demo Mode
│
└── (if isAuthenticated)
    ├── Sidebar
    │   ├── 27 sections × N items (each with `available` boolean)
    │   └── Button — Sign Out
    ├── Header
    │   ├── Mobile menu trigger (Sheet on mobile)
    │   ├── Module title (text)
    │   ├── Zoom controls (3 Buttons)
    │   ├── Sprint badge (Badge)
    │   ├── Demo badge (Badge, when isDemoMode)
    │   └── Mobile link (Anchor)
    └── Main content (switch on activeModule)
        ├── (activeModule === 'dashboard') → DashboardModule (546–626)
        │   ├── Welcome banner (Card)
        │   │   └── 4 inline stats (text)
        │   ├── 4 stat cards (Card × 4, onClick = setActiveModule)
        │   │   └── Each card: icon + label + value
        │   └── Sprint list (Card)
        │       └── 27 × { CheckCircle2 icon + label + "Done" Badge }
        │
        └── (activeModule === 'organization') → OrganizationModule (629–700)
            ├── Header row
            │   └── Button — "Add Entity" (NO onClick)
            ├── 4 stat cards (Card × 4)
            │   └── Each: icon + label + hardcoded value
            └── ScrollArea (h-[500px])
                └── TreeItem (recursive)
                    ├── ChevronRight / ChevronDown (expand/collapse)
                    ├── Icon per node type (ENTERPRISE/COMPANY/BU/BRANCH)
                    └── (if children) → TreeItem × N
```

---

## 2. LoginScreen Component Breakdown

### 2.1 State

| Hook | Type | Default | Purpose |
|---|---|---|---|
| `email` | string | `''` | Email input value |
| `password` | string | `''` | Password input value |
| `show` | boolean | `false` | Show/hide password |
| `rem` | boolean | `false` | Remember me |
| `loading` | boolean | `false` | Submit in flight |
| `loginError` | string \| null | `null` | Error message |

### 2.2 Layout

- Container: `min-h-screen flex items-center justify-center bg-slate-950 p-3 md:p-4`
- Card: `max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4`
- Inputs: `bg-slate-900 border-slate-800` with icon on the left
- Error block: `bg-rose-950/50 text-rose-400 text-sm rounded-md p-2`
- Submit button: `w-full` when loading shows `Loader2 animate-spin`

### 2.3 Accessibility

- Inputs have `type` and visible labels (placeholder-as-label pattern — recommend explicit `<Label>` for screen readers).
- Show/hide button has `aria-label` (verify in implementation).
- Error message is not associated with the input via `aria-describedby` — recommend adding.
- Form submits on Enter via `<form onSubmit>`.

### 2.4 Interactions

| Element | Event | Handler | Effect |
|---|---|---|---|
| Email input | onChange | setEmail | State update |
| Password input | onChange | setPassword | State update |
| Eye toggle | onClick | setShow(!show) | Toggle password visibility |
| Remember checkbox | onCheckedChange | setRem | State update |
| Sign In button | onClick / form submit | onLogin(email, password, rem) | Calls auth store |
| Demo Mode button | onClick | onDemo() | Calls `useAuthStore.loginDemo()` |

---

## 3. DashboardModule Component Breakdown

### 3.1 Static data

```ts
const sprintData = [
  { name: 'Sprint 1', status: 'Done', … },
  …
  { name: 'Sprint 27', status: 'Done', … }
];  // 27 entries
```

### 3.2 Layout

- Welcome banner: `bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6`
  - 4 inline stats: 223 tables, 821 entities, 249 decisions, 27 sprints
- Stat cards grid: `grid grid-cols-2 md:grid-cols-4 gap-4`
  - Each card: `bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-indigo-500`
  - Hardcoded values: Products=12, Roles=15, Branches=8, Compliance=6
- Sprint list: `bg-slate-900 border border-slate-800 rounded-xl p-4`
  - Each row: `flex items-center justify-between py-2 border-b border-slate-800 last:border-0`
  - `CheckCircle2` icon (text-emerald-400) + sprint name + `Badge` "Done"

### 3.3 Interactions

| Element | Event | Handler | Effect |
|---|---|---|---|
| Stat card (Products) | onClick | setActiveModule('products') | Navigate |
| Stat card (Roles) | onClick | setActiveModule('rbac') | Navigate |
| Stat card (Branches) | onClick | setActiveModule('organization') | Navigate |
| Stat card (Compliance) | onClick | setActiveModule('compliance') | Navigate |

### 3.4 Missing

- No loading skeleton.
- No error state.
- No empty state (impossible today because data is hardcoded).
- No refresh button.
- No real-time updates.

---

## 4. OrganizationModule Component Breakdown

### 4.1 State

| Hook | Type | Default | Purpose |
|---|---|---|---|
| `selectedNode` | string \| null | `null` | Selected tree node id |
| `exp` (in TreeItem) | boolean | `false` | Expand/collapse per node |

### 4.2 Static data

```ts
const tree = [
  {
    type: 'ENTERPRISE',
    name: 'Sudhastar Group',
    children: [
      {
        type: 'COMPANY',
        name: 'Sudhastar Foods Ltd',
        children: [
          {
            type: 'BU',
            name: 'Manufacturing BU',
            children: [
              { type: 'BRANCH', name: 'Mumbai Plant' },
              { type: 'BRANCH', name: 'Delhi Plant' },
              …
            ]
          }
        ]
      },
      …
    ]
  }
];
```

### 4.3 Icon map

```ts
const iconMap = {
  ENTERPRISE: Building2,
  COMPANY: Factory,
  BU: Layers,
  BRANCH: MapPin
};
```

### 4.4 TreeItem component (recursive)

```
TreeItem({ node, depth })
├── Button (toggle expand)
│   ├── ChevronRight / ChevronDown (if children)
│   └── Icon (from iconMap[node.type])
├── Span (node.name)
└── (if exp && children)
    └── TreeItem × children.length (depth + 1)
```

- Indentation via `paddingLeft: depth * 16` (inline style).
- Selected node styled with `bg-indigo-500/20`.

### 4.5 Layout

- Header row: `flex items-center justify-between mb-4`
  - Title "Organization Structure"
  - Button "Add Entity" (variant=default) — **no onClick**
- Stat cards grid: `grid grid-cols-2 md:grid-cols-4 gap-4`
  - Hardcoded: Enterprises=1, Companies=2, Branches=8, Warehouses=4
- ScrollArea: `h-[500px]` containing the tree

### 4.6 Missing

- No detail panel when `selectedNode` is set.
- No CRUD forms.
- No transition buttons.
- No search/filter input.
- No loading skeleton.
- No error state.
- No "Add Entity" handler.

---

## 5. Shared UI Primitives Used

| Primitive | File | Used in |
|---|---|---|
| Card | `ui/card.tsx` | Login, Dashboard, Organization |
| Button | `ui/button.tsx` | Login, Dashboard cards, Org "Add Entity", Header, Sidebar |
| Input | `ui/input.tsx` | Login |
| Checkbox | `ui/checkbox.tsx` | Login remember-me |
| Badge | `ui/badge.tsx` | Dashboard "Done", Header sprint/demo |
| ScrollArea | `ui/scroll-area.tsx` | Organization tree |
| Sheet | `ui/sheet.tsx` | Header mobile menu |
| Label | `ui/label.tsx` | (available, not used in Login — gap) |
| Skeleton | `ui/skeleton.tsx` | (available, not used — gap) |
| Toast / Toaster | `ui/toast.tsx`, `ui/toaster.tsx` | (available, not used — gap) |
| AlertDialog | `ui/alert-dialog.tsx` | (available, not used — gap) |
| Form | `ui/form.tsx` | (available, not used — gap) |
| Breadcrumb | `ui/breadcrumb.tsx` | (available, not used — gap) |

The project ships a full shadcn/ui kit. This section uses ~6 of ~50 available primitives. Many gaps (loading skeleton, error toast, confirm dialog, breadcrumbs, form validation) could be closed with components that are already installed.

---

## 6. Iconography (lucide-react)

| Icon | Used in |
|---|---|
| `Mail` | Login email input |
| `Lock` | Login password input |
| `Eye` / `EyeOff` | Login password toggle |
| `Loader2` | Login submit spinner |
| `CheckCircle2` | Dashboard sprint list |
| `Building2` | Org tree ENTERPRISE |
| `Factory` | Org tree COMPANY |
| `Layers` | Org tree BU |
| `MapPin` | Org tree BRANCH |
| `ChevronRight` / `ChevronDown` | Org tree expand/collapse |
| `Plus` | (would be) Org "Add Entity" |
| `ZoomIn` / `ZoomOut` | Header zoom controls |

Icon usage is consistent and on-brand.

---

## 7. Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `bg-slate-950` | Page background |
| Surface | `bg-slate-900` | Cards |
| Border | `border-slate-800` | Card borders |
| Primary | `from-indigo-600 to-purple-600` | Welcome banner gradient |
| Primary hover | `hover:border-indigo-500` | Stat cards |
| Success | `text-emerald-400` | CheckCircle2 |
| Error | `text-rose-400` on `bg-rose-950/50` | Login error |
| Text primary | `text-white` | Headings |
| Text muted | `text-slate-400` | Labels |
| Radius | `rounded-xl` | Cards |

The palette is a dark slate + indigo/purple accent. No light mode exists. A dark-mode toggle is listed as a low-priority gap.

---

## 8. Responsive Behaviour

| Breakpoint | Login | Dashboard | Organization |
|---|---|---|---|
| < 768px (mobile) | `p-3`, full width, max-w-md | Stat cards 2×2 grid, sprint list stacked | Stat cards 2×2 grid, tree full width |
| ≥ 768px (tablet) | `p-4`, max-w-md centred | Stat cards 4×1 grid | Stat cards 4×1 grid |
| ≥ 1024px (desktop) | Same | Same | Same |

The Header collapses to a hamburger menu on mobile (Sheet component). The Sidebar collapses to a drawer. The zoom controls are desktop-only (Ctrl+/-/0 keyboard).

---

## 9. Keyboard Support

| Shortcut | Scope | Action |
|---|---|---|
| Enter | Login form | Submit |
| Ctrl + `+` | Shell | Zoom in |
| Ctrl + `-` | Shell | Zoom out |
| Ctrl + `0` | Shell | Reset zoom |
| Tab | Login | Move between fields |
| Space | Login checkbox | Toggle remember me |

Missing:

- No Escape-to-close on the "Add Entity" dialog (because there is no dialog).
- No arrow-key navigation in the tree.
- No `/` to focus search (because there is no search).

---

## 10. Component-Level Gaps

| # | Gap | Recommended primitive |
|---|---|---|
| UI-1 | No loading skeleton on Dashboard / Org | `Skeleton` |
| UI-2 | No error toast | `Toaster` + `useToast` |
| UI-3 | No confirm dialog before destructive actions | `AlertDialog` |
| UI-4 | No form validation on Login | `Form` + zod |
| UI-5 | No breadcrumbs | `Breadcrumb` |
| UI-6 | No node-detail panel | New `NodeDetail` component |
| UI-7 | No search/filter on tree | `Input` + filter logic |
| UI-8 | No transition dialog | New `TransitionDialog` component |
| UI-9 | No audit timeline viewer | New `AuditTimeline` component |
| UI-10 | No empty state for tree (when tenant has no companies) | New `EmptyState` component |
| UI-11 | No tenant indicator in Header | `Badge` |
| UI-12 | No permission-gated button | `hasPermission` HOC |

---

## 11. Accessibility Audit Summary

| Criterion | Status | Notes |
|---|---|---|
| Colour contrast | Pass | Slate-950 / white is > 15:1 |
| Keyboard navigation | Partial | Tree not keyboard-navigable |
| Screen reader labels | Partial | Login inputs use placeholder, not `<Label>` |
| Focus management | Pass | Visible focus rings on buttons/inputs |
| ARIA on dynamic content | Fail | Tree expand/collapse lacks `aria-expanded` |
| Error association | Fail | Login error not linked via `aria-describedby` |
| Reduced motion | Fail | `animate-spin` does not respect `prefers-reduced-motion` |

---

## 12. Conclusion

The section is visually polished and uses a coherent dark-slate design language. The component tree is shallow and easy to follow. However, the section uses only ~6 of the ~50 available shadcn primitives, leaving loading, error, confirmation, and breadcrumb patterns unimplemented despite the primitives being installed. The biggest UX gaps — no node-detail panel, no CRUD forms, no transition UI — are component-level absences, not styling issues. Closing them is a matter of composing existing primitives, not introducing a new design system.
