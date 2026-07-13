# 04 — Permission Naming Standard (FINAL)

**Date**: 2026-07-13
**Status**: FINAL — PERMANENT SECURITY FOUNDATION

---

## 1. Format

```
<domain>:<action>[:<sub-scope>][:<data-scope>]
```

### Components

| Component | Required | Example | Description |
|---|---|---|---|
| `domain` | ✅ | `inventory` | Business domain (lowercase, singular) |
| `action` | ✅ | `read` | One of 22 standard actions |
| `sub-scope` | Optional | `adjust:block` | Sub-entity or specific capability |
| `data-scope` | Optional | `wh` | Data visibility scope (own/dept/wh/plant/company/bu/region/global) |

### Examples

```
inventory:read                    — Read inventory (default scope from role)
inventory:read:wh                 — Read inventory in assigned warehouse(s)
inventory:read:global             — Read inventory across all warehouses
inventory:adjust:block            — Adjust inventory blocks specifically
so:approve:company                — Approve SOs within assigned company
gl:post:company                   — Post GL entries within assigned company
pricing:override                  — Override calculated price (no scope = default)
```

---

## 2. Standard Actions (22)

| Action | Purpose | Creates Immutable Data? | Used For |
|---|---|---|---|
| `view` | Navigation/dashboard visibility (no business data) | No | Menu items, dashboard cards |
| `read` | Access actual business records | No | List views, detail panels |
| `create` | Create new records | No | Create dialogs, POST endpoints |
| `update` | Modify existing records (non-workflow) | No | Edit dialogs, PATCH endpoints |
| `delete` | Hard delete (rarely used — prefer archive) | Yes | DELETE endpoints (admin only) |
| `close` | Close a transaction (reversible by reopen) | No | Close buttons |
| `archive` | Soft delete (restorable) | No | Archive buttons |
| `restore` | Restore archived record | No | Restore buttons |
| `approve` | Approve a workflow transition | No | Approve buttons |
| `reject` | Reject a workflow transition | No | Reject buttons |
| `release` | Release for next stage (post-approval, pre-execution) | No | Release buttons |
| `post` | Post to ledger (creates immutable entries) | Yes | Post buttons (GL, GRN) |
| `cancel` | Cancel a transaction | No | Cancel buttons |
| `reopen` | Reopen closed/cancelled transaction | No | Reopen buttons |
| `reverse` | Reverse posted transaction (compensating entry) | No | Reverse buttons |
| `override` | Override business rule (requires reason + audit) | No | Override buttons (manager only) |
| `export` | Export data to external format | No | Export buttons |
| `import` | Import data from external source | No | Import wizards |
| `print` | Print documents | No | Print buttons |
| `delegate` | Delegate approval authority | No | Delegation dialogs |
| `approve:as-delegate` | Approve on behalf of delegating user | No | Delegate approval buttons |
| `audit` | View audit logs | No | Audit log viewer |

### Configuration Actions (7 — split from `configure`)

| Action | Purpose |
|---|---|
| `settings` | Configure module settings |
| `workflow` | Configure workflow rules |
| `master` | Configure master data defaults |
| `templates` | Configure document templates |
| `numbering` | Configure number ranges |
| `notifications` | Configure notification rules |
| `approval-rules` | Configure approval thresholds/rules |

---

## 3. Data Scope Suffixes (8)

| Scope | Code | Who Gets This? |
|---|---|---|
| Own | `own` | Individual contributor (see own records only) |
| Department | `dept` | Department member (see dept records) |
| Warehouse | `wh` | Warehouse-assigned user |
| Plant | `plant` | Plant-assigned user |
| Company | `company` | Company-assigned user |
| Business Unit | `bu` | BU-assigned manager |
| Region | `region` | Region-assigned director |
| Global | `global` | Tenant admin, auditor (read-only) |

### Scope Resolution Rules

1. If no scope suffix is specified, the user's **default scope** from their role is used
2. A user can have multiple scopes (e.g., warehouse_supervisor has `wh` + `plant`)
3. Scopes are additive (union of accessible records)
4. `global` scope overrides all other scopes
5. Break glass role always has `global` scope (time-limited)

---

## 4. Domain Names (14 established + 6 future)

(Same as previous version — 50 domain names with mount prefix mapping. Unchanged.)

---

## 5. TypeScript Enum Convention

```typescript
export const Permission = {
  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_STOCKIN: 'inventory:stockin',
  INVENTORY_STOCKOUT: 'inventory:stockout',
  INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_TRANSFER_APPROVE: 'inventory:transfer:approve',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_ADJUST_APPROVE: 'inventory:adjust:approve',
  INVENTORY_RESERVE: 'inventory:reserve',
  INVENTORY_RESERVE_RELEASE: 'inventory:reserve:release',
  INVENTORY_BLOCK: 'inventory:block',
  INVENTORY_BLOCK_RELEASE: 'inventory:block:release',
  INVENTORY_EXPIRY_MARK: 'inventory:expiry:mark',
  INVENTORY_REVERSE: 'inventory:reverse',
  INVENTORY_OVERRIDE: 'inventory:override',
  INVENTORY_EXPORT: 'inventory:export',
  INVENTORY_IMPORT: 'inventory:import',
  LEDGER_READ: 'ledger:read',
  LEDGER_REVERSE: 'ledger:reverse',
  // ... etc
} as const
```

### Enum Naming Rules

1. `UPPER_SNAKE_CASE` for TypeScript constant
2. String value is `lowercase:lowercase` (matching the naming standard)
3. Sub-scopes use underscore in enum name: `INVENTORY_BLOCK_RELEASE` → `'inventory:block:release'`
4. Group by domain with comment headers

---

## 6. Migration from Old Permissions

(Same mapping as previous version — 38 old permissions → ~329 new permissions. Old permissions become aliases during migration, then removed.)

---

**END OF PERMISSION NAMING STANDARD (FINAL)**
