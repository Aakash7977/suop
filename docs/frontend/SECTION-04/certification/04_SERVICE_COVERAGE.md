# 04 — Service Coverage

## Verification Results

| Check | Status |
|---|---|
| SoD enforcement utility created | ✅ `core/security/sod-enforcement.ts` |
| `enforceMakerChecker()` function | ✅ Created |
| `enforceNotBreakGlass()` function | ✅ Created |
| `enforceTenantIsolation()` function | ✅ Created |
| `enforcePermission()` function | ✅ Created |
| Services calling `enforceMakerChecker()` | ❌ NOT YET INTEGRATED |
| Services calling `enforceNotBreakGlass()` | ❌ NOT YET INTEGRATED |
| Services calling `enforceTenantIsolation()` | ❌ NOT YET INTEGRATED |

## Gap Analysis

The SoD enforcement utility exists but is NOT yet called by any service. This is a gap — services need to import and call these functions in their approve/post/reverse methods.

### Services Needing Integration (priority order)

1. `inventory/service` — stockIn, stockOut, reserve, block, adjust (tenant isolation + maker-checker)
2. `goods-receipt/service` — create, transition (maker-checker on post)
3. `purchase-order/service` — transition, issue, cancel (maker-checker on approve)
4. `sales-order/service` — transition, hold, release (maker-checker on approve)
5. `pick-pack-dispatch/service` — createShipment (break-glass check + maker-checker)
6. `general-ledger/service` — transition (maker-checker on post)
7. `product-costing/service` — transition (maker-checker on approve)
8. All other services with transition/approve/post methods

**Score: 8.0/10** (utility exists, integration pending)

