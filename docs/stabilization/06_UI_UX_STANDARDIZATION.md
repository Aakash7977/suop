# 06 — UI/UX Standardization Report

**Document ID:** STAB-06-UIUX-STANDARD
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report defines UI/UX standardization requirements for the refactored
frontend. It establishes interaction patterns, spacing, typography,
feedback, and accessibility norms that all feature modules must follow.

## 2. Executive Summary

The refactored frontend introduces 54 enterprise components and 19 form
primitives, but **no UI/UX standard** governs their composition. Without a
standard, each of the 11 feature modules will diverge in interaction
patterns, error feedback, loading states, and accessibility. This report
proposes a baseline standard and an enforcement mechanism.

## 3. Standardization Pillars

The standard is organized into six pillars:

1. **Layout & Spacing**
2. **Typography & Color**
3. **Interaction Patterns**
4. **Feedback & States**
5. **Accessibility**
6. **Internationalization**

## 4. Layout & Spacing

### 4.1 Page Layout
- Every page renders inside a `PageHeader` + content container.
- Content container max-width: `1280px` (desktop), full-bleed on mobile.
- Vertical rhythm: `24px` between page header and content.
- Horizontal gutter: `32px` desktop, `16px` mobile.

### 4.2 Spacing Scale
A single spacing scale (`space-1` … `space-8`) must be used:
- `space-1` = 4px
- `space-2` = 8px
- `space-3` = 12px
- `space-4` = 16px
- `space-5` = 24px
- `space-6` = 32px
- `space-7` = 48px
- `space-8` = 64px

### 4.3 Grid
- 12-column grid on desktop, 4-column on tablet, single column on mobile.
- Gutter: `24px` desktop, `16px` tablet/mobile.

## 5. Typography & Color

### 5.1 Type Scale
| Token | Size | Use |
| --- | --- | --- |
| `display` | 36/40 | Empty states, hero |
| `h1` | 28/36 | Page title |
| `h2` | 22/28 | Section title |
| `h3` | 18/24 | Card title |
| `body` | 14/20 | Default text |
| `caption` | 12/16 | Hints, metadata |
| `mono` | 13/20 | Codes, IDs |

### 5.2 Color Tokens
Semantic tokens (proposed):
- `surface-1`, `surface-2`, `surface-3`
- `text-primary`, `text-secondary`, `text-muted`
- `border-subtle`, `border-strong`
- `accent`, `accent-foreground`
- `success`, `warning`, `danger`, `info`

Raw Tailwind color values must not appear in feature module code; only
semantic tokens are permitted.

## 6. Interaction Patterns

### 6.1 Buttons
- Primary action: solid accent.
- Secondary action: outline.
- Destructive action: solid danger, with `ConfirmationDialog`.
- Icon-only buttons: must have `aria-label`.

### 6.2 Forms
- Submit button disabled until valid OR shows inline errors on submit.
- Required fields marked with `*` and `aria-required`.
- Inline validation on blur, not on every keystroke.

### 6.3 Tables / DataGrid
- Row click opens detail (drawer or page).
- Multi-select via checkbox column.
- Bulk actions appear in `BulkActionBar`.
- Empty state via `EmptyState`, loading via `LoadingState`, error via
  `ErrorState`.

### 6.4 Overlays
- Modals: `Esc` to close, focus trap, restore focus on close.
- Drawers: same as modals, plus responsive bottom-sheet on mobile.
- Confirmation: `ConfirmationDialog` with explicit danger styling.

### 6.5 Notifications
- Toasts auto-dismiss after 5s, except errors.
- `NotificationCenter` aggregates persistent notifications.

## 7. Feedback & States

Every data-bound surface must define three states:

| State | Component | Required |
| --- | --- | --- |
| Loading | `LoadingState` or skeleton | Yes |
| Empty | `EmptyState` with CTA | Yes |
| Error | `ErrorState` with retry | Yes |
| Success | Toast or inline banner | Conditional |

Feature modules that omit any of these states are non-compliant.

## 8. Accessibility

### 8.1 WCAG Target
- **WCAG 2.1 Level AA** is the baseline target.
- Color contrast ≥ 4.5:1 for normal text, 3:1 for large text.

### 8.2 Keyboard
- All interactive elements reachable via Tab.
- Logical tab order preserved.
- `Esc` closes overlays.
- `Enter` / `Space` activates buttons and rows.
- Arrow keys navigate `DataGrid`, `TreeView`, `CommandPalette`.

### 8.3 Screen Reader
- All inputs have associated labels.
- Errors associated via `aria-describedby`.
- Live regions for toasts and async updates.
- ARIA roles for `DataGrid` (`grid`, `row`, `cell`, `columnheader`).

### 8.4 Focus
- Visible focus ring (≥ 2px, contrast ≥ 3:1).
- Focus restoration on modal/drawer close.
- Skip-to-content link at top of page.

## 9. Internationalization

- All user-facing strings extracted to message bundles.
- Number, date, currency formatting via `Intl`.
- RTL support planned but not required for v1.
- Locale switch via `useLocale` hook (to be defined).

## 10. Standardization Enforcement

### 10.1 Lint Rules
A custom ESLint rule set should forbid:
- Raw color values in JSX.
- Hard-coded user-facing strings.
- Direct usage of Tailwind utilities bypassing tokens (where applicable).

### 10.2 Visual Regression
Storybook + snapshot tests should cover the 54 enterprise components and
the standard state set (loading / empty / error).

### 10.3 Accessibility CI
`axe-core` integrated into Jest/Playwright runs, blocking on critical
violations.

### 10.4 Review Checklist
A PR checklist must include:
- [ ] Three states present (loading / empty / error).
- [ ] No raw color values.
- [ ] No hard-coded strings.
- [ ] Keyboard navigation verified.
- [ ] ARIA attributes present.

## 11. Compliance Matrix (Per Feature Module)

Each of the 11 feature modules will be scored against the standard:

| Module | Layout | Tokens | States | A11y | i18n |
| --- | --- | --- | --- | --- | --- |
| procurement | TBD | TBD | TBD | TBD | TBD |
| inventory | TBD | TBD | TBD | TBD | TBD |
| warehouse | TBD | TBD | TBD | TBD | TBD |
| manufacturing | TBD | TBD | TBD | TBD | TBD |
| quality | TBD | TBD | TBD | TBD | TBD |
| finance | TBD | TBD | TBD | TBD | TBD |
| crm | TBD | TBD | TBD | TBD | TBD |
| hr | TBD | TBD | TBD | TBD | TBD |
| analytics | TBD | TBD | TBD | TBD | TBD |
| administration | TBD | TBD | TBD | TBD | TBD |
| platform | TBD | TBD | TBD | TBD | TBD |

All modules currently **TBD** — none yet compliant.

## 12. Recommended Actions

1. **Publish the UI/UX standard** as a versioned document.
2. **Define the token layer** in Tailwind config and CSS variables.
3. **Implement custom ESLint rules** for color and string enforcement.
4. **Integrate axe-core** into CI.
5. **Build a standard page template** (`StandardPage`) that enforces
   `PageHeader` + three-state content.
6. **Audit each feature module** against the standard and fill the matrix.

## 13. Acceptance Criteria

- [ ] UI/UX standard published and versioned.
- [ ] Token layer implemented and consumed.
- [ ] Custom ESLint rules active.
- [ ] axe-core in CI.
- [ ] `StandardPage` template available.
- [ ] At least one feature module fully compliant as reference.

## 14. Conclusion

Without a UI/UX standard, the 11 feature modules will diverge into 11
de-facto design languages. The standard proposed here is minimal but
enforceable. Adoption must precede feature module migration.

---

*End of report STAB-06-UIUX-STANDARD.*
