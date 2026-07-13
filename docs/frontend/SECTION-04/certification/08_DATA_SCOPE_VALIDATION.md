# 08 — Data Scope Validation

## Scope Model

| Scope | Code | Defined in DataScope enum? | Enforced in middleware? | Enforced in queries? |
|---|---|---|---|---|
| Own | `own` | ✅ | ❌ Not implemented | ❌ |
| Department | `dept` | ✅ | ❌ Not implemented | ❌ |
| Warehouse | `wh` | ✅ | ❌ Not implemented | ❌ |
| Plant | `plant` | ✅ | ❌ Not implemented | ❌ |
| Company | `company` | ✅ | ❌ Not implemented | ❌ |
| Business Unit | `bu` | ✅ | ❌ Not implemented | ❌ |
| Region | `region` | ✅ | ❌ Not implemented | ❌ |
| Global | `global` | ✅ | ❌ Not implemented | ❌ |

## Role Default Scopes (Designed)

| Role | Default Scope | Documented? |
|---|---|---|
| tenant_admin | global | ✅ |
| sales_officer | dept | ✅ |
| sales_manager | company | ✅ |
| procurement_officer | dept | ✅ |
| procurement_manager | company | ✅ |
| warehouse_operator | wh | ✅ |
| warehouse_supervisor | wh + plant | ✅ |
| finance_accountant | company | ✅ |
| finance_manager | company | ✅ |
| manufacturing_supervisor | plant | ✅ |
| quality_manager | plant | ✅ |
| hr_manager | company | ✅ |
| auditor | global (read-only) | ✅ |
| break_glass | global (time-limited) | ✅ |

## Gap Analysis

The DataScope enum is defined with 8 levels and role default scopes are documented, but:
1. ❌ No middleware to resolve scope from JWT claims
2. ❌ No query-level scope filtering (WHERE clauses don't include scope conditions)
3. ❌ No scope field in user profile/JWT
4. ❌ `requirePermission()` doesn't check scope

**Score: 7.5/10** (model designed and documented, enforcement not implemented)

