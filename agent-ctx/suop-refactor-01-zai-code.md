# Task: SUOP ERP — Enterprise Design System & Monolith Refactor

**Agent:** Z.ai Code (single-agent execution; no Task/subagent tool available in this environment, so all phases were executed by the primary agent)
**Task ID:** suop-refactor-01
**Date:** 2025-07-12
**Status:** ✅ Complete

---

## Objective

Refactor the monolithic `src/app/page.tsx` (37,080 lines, 340 functions) into a
modular architecture by:

1. Building an enterprise design system in `src/components/enterprise/`.
2. Building React-Hook-Form-bound field primitives in `src/components/enterprise/forms/`.
3. Replacing `page.tsx` with a <500-line routing/composition shell.
4. Scaffolding 11 feature modules under `src/features/`.
5. Preserving the original monolith as `src/app/page.tsx.bak`.

## What was delivered

### 1. Enterprise design system — `src/components/enterprise/` (35 components + barrel)

All 35 requested components implemented, each 50–150 lines, TypeScript-typed,
built on shadcn/ui primitives + Tailwind + lucide-react:

`DataGrid` (TanStack Table — sorting/filter/pagination/bulk-select),
`MasterDetailLayout`, `WorkflowTimeline`, `StatusBadge`, `KPICard` (with SVG
sparkline), `DashboardCard`, `AdvancedFilters`, `BulkActionBar`, `SearchPanel`,
`QuickActionMenu`, `Wizard`, `StepIndicator`, `Timeline`, `ActivityFeed`,
`AttachmentViewer`, `BarcodeViewer` (pure-SVG barcode + QR, no external deps),
`CommandPalette` (cmdk, ⌘K hotkey), `GlobalSearch` (⇧⌘K), `NotificationCenter`,
`EnterpriseModal`, `EnterpriseDrawer`, `EnterpriseTabs` (badges + vertical),
`FormLayout`, `SplitView` (Resizable), `TreeView`, `SidebarNavigation`
(grouped + favorites + recents + collapse + mobile drawer), `BreadcrumbNav`,
`EmptyState`, `ErrorState`, `LoadingState` (5 variants), `PageHeader`,
`ConfirmationDialog` (4 risk levels), `AuditViewer` (field-level diff),
`ApprovalTimeline`, `DocumentPreview` (zoom/rotate).

Barrel export: `src/components/enterprise/index.ts`.

### 2. Form field primitives — `src/components/enterprise/forms/` (18 fields + FieldBase + barrel)

`TextField`, `NumberField`, `SelectField`, `AutocompleteField`, `BarcodeField`,
`QrField`, `CurrencyField`, `DateField`, `DateTimeField`, `FileField`,
`ImageField` (thumbnail preview), `SignatureField` (canvas → data URL),
`CheckboxField`, `ToggleField`, `TextareaField`, `TagsField` (chips),
`MultiSelectField`, `FieldArray` (useFieldArray).

All use `react-hook-form`'s `Controller` via `useFormContext`, accept
`name`/`label`/`required`/`error`/`description`, and share a `FieldBase`
wrapper. Barrel: `src/components/enterprise/forms/index.ts`.

### 3. New `src/app/page.tsx` — 387 lines (under 500 ✓)

Pure routing/composition:
- Gates on `useAuthStore` → renders `LoginScreen` when unauthenticated.
- Renders `AdminShell` (sidebar + header + routed content + footer) otherwise.
- Uses `SidebarNavigation`, `CommandPalette` (⌘K), `GlobalSearch` (⇧⌘K),
  `NotificationCenter`, `BreadcrumbNav` (via `PageHeader` in feature pages).
- `MODULE_REGISTRY` maps nav keys → feature-module page components.
- Persists favorites/recents to `localStorage`.
- Mobile-responsive: collapsible sidebar + mobile drawer.
- Sticky footer (`mt-auto`) per layout rules.

Original monolith preserved as `src/app/page.tsx.bak` (37,080 lines untouched).

### 4. Feature modules — `src/features/` (11 modules + shared, each with `index.ts`)

- `shared/` — `types.ts` (ModuleKey, NavItem, Breadcrumb, Command, Notification,
  TimelineEntry, KPIDefinition, etc.), `navigation.ts` (navItems, moduleGroups,
  moduleMeta, buildGroupedNav), `components/FeaturePage.tsx` (shared
  PageHeader + EnterpriseTabs placeholder composition), barrel `index.ts`.
- `procurement`, `inventory`, `warehouse`, `manufacturing`, `quality`,
  `finance`, `crm`, `hr`, `analytics`, `administration` — each exports its
  `{Module}Page` which delegates to `FeaturePage` with module-specific
  sub-modules (5–6 tabs each).
- `platform/` — exports `LoginScreen` (email/password + demo mode, wired to
  auth store) and `DashboardPage` (KPI skeletons + empty states — no mock data).

### 5. Shared types & navigation config

- `src/features/shared/types.ts` — `ModuleKey` union, `NavItem`, `Breadcrumb`,
  `Command`, `Notification`, `TimelineEntry`, `KPIDefinition`, `RiskLevel`,
  `StatusKind`, `PageHeaderProps`.
- `src/features/shared/navigation.ts` — `navItems`, `moduleGroups`,
  `moduleMeta`, `buildGroupedNav()`.

## Verification

- **ESLint** (`bunx eslint src/app/page.tsx src/components/enterprise src/features`):
  **0 errors, 1 warning** (TanStack Table `useReactTable` incompatible-library
  notice — known/expected, non-blocking).
- **TypeScript** (`bunx tsc --noEmit` scoped to new files): **0 errors**.
- **Dev server** (`bun run dev`): compiles cleanly, `GET /` returns **HTTP 200**
  (23.9 KB), renders the `LoginScreen` ("SUOP Admin", "Sudhastar Unified").
- **`page.tsx` line count**: 387 (< 500 ✓).

## Issues encountered & resolved

1. **`BreadcrumbNav` name collision** — the shadcn `Breadcrumb` primitive was
   aliased as `BreadcrumbNav`, colliding with the exported component function.
   Fixed by aliasing the primitive to `BreadcrumbRoot`.
2. **"Cannot create components during render"** (`react-hooks/static-components`)
   — the `MODULE_REGISTRY[key] ?? (() => <DashboardPage/>)` fallback created an
   inline component during render. Fixed by switching to a `renderPage()` helper
   that returns `ReactNode` (`MODULE_REGISTRY[activeKey]?.() ?? <DashboardPage/>`),
   avoiding the creation of a new component type during render.
3. **Unused `eslint-disable` directives** — removed `@next/next/no-img-element`
   disable comments in `AttachmentViewer`, `DocumentPreview`, `ImageField` (the
   rule is off in the project config, so the disables were flagged as unused).

## Notes for the next agent

- The feature-module pages are intentionally `ComingSoon` placeholders built via
  `FeaturePage`. The real module UI from `page.tsx.bak` should be migrated
  incrementally into each `src/features/<module>/pages/` directory, replacing
  the placeholder tabs with real content.
- The `DataGrid` warning is benign; if React Compiler strictness is later
  required, wrap the table instance in `useMemo`/disable compiler for that file.
- The auth store already supports Supabase + local + demo modes — no auth
  changes were needed; `LoginScreen` reuses the existing `useAuthStore`.
- `src/app/page.tsx.bak` is preserved for reference but is NOT compiled by
  Next.js (`.bak` extension) and is NOT linted by the default config.
