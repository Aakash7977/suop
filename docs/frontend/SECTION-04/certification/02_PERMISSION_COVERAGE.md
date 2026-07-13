# 02 — Permission Coverage

**Total permissions**: 332 string values (322 unique — 10 are backward-compat aliases)
**Domains covered**: 14 + 6 future placeholders
**Standard actions**: 22 + 7 configuration = 29

## Coverage by Domain

| Domain | Permissions | VIEW | READ | CREATE | UPDATE | DELETE | APPROVE | ARCHIVE | OVERRIDE | DELEGATE |
|---|---|---|---|---|---|---|---|---|---|---|
| Organization | 18 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Catalog | 16 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Partners | 22 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Inventory | 22 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Warehouse | 24 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Procurement | 30 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sales | 48 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manufacturing | 24 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Quality | 22 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Finance | 30 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| HR | 23 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| CRM | 12 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| BI & Admin | 20 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Future | 18 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

## Duplicates Analysis

10 duplicate permission string values found — ALL are intentional backward-compatibility aliases:
- `inventory:stockin` (INVENTORY_STOCKIN + INVENTORY_POST alias)
- `inventory:adjust` (INVENTORY_ADJUST + INVENTORY_ADJUST_OLD alias)
- `putaway:create` (PUTAWAY_CREATE + GRN_PUTAWAY alias)
- `quality:inspect` (QUALITY_INSPECT + IQC_INSPECT alias)
- `quality:approve` (QUALITY_APPROVE + IQC_APPROVE alias)
- `ncr:create`, `ncr:approve`, `recall:initiate`, `coa:sign`, `system:settings` (same-name aliases)

**Verdict**: ✅ No unintended duplicates. Aliases are temporary and documented.

## Naming Convention Compliance

All 322 unique permissions follow: `<domain>:<action>[:<sub-scope>]`
- All lowercase ✅
- Colon-separated ✅
- No abbreviations except well-known (po, so, grn, gl, gst, mes, eam, bi) ✅

**Score: 9.5/10** (aliases will be removed in future cleanup)

