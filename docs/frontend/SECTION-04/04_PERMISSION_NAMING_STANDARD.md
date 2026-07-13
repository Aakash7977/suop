# 04 — Permission Naming Standard

**Date**: 2026-07-13
**Status**: FINAL

---

## 1. Naming Convention

```
<domain>:<action>[:<scope>]
```

### Rules

1. **domain** — lowercase, singular business domain name (e.g., `inventory`, `warehouse`, `sales`)
2. **action** — lowercase verb from the standard action list (see below)
3. **scope** — optional sub-entity or context (e.g., `inventory:adjust:block`, `customer:credit:read`)
4. Use `:` as separator (not `.`, `-`, or `_`)
5. No abbreviations except well-known ones (`po`, `so`, `grn`, `gl`, `gst`, `mes`, `eam`, `bi`)

### Standard Actions (15)

| Action | When to Use | Irreversible? |
|---|---|---|
| `read` | View/list records | No |
| `create` | Create new records | No |
| `update` | Modify existing records (non-workflow) | No |
| `delete` | Remove or archive records | No (soft delete) |
| `approve` | Approve a workflow transition | No (can be reversed) |
| `reject` | Reject a workflow transition | No |
| `post` | Post to ledger (irreversible — creates ledger entries) | Yes |
| `cancel` | Cancel a transaction | No (can be reopened) |
| `reopen` | Reopen a closed/cancelled transaction | No |
| `export` | Export data to external format | No |
| `import` | Import data from external source | No |
| `print` | Print documents | No |
| `configure` | Configure system settings | No |
| `audit` | View audit logs | No |
| `admin` | Full administrative access to a domain | No |

### Domain Names (14 established + 6 future)

| Domain | Used For | Mount Prefix |
|---|---|---|
| `org` | Organization hierarchy | `/api/v1/organization` |
| `catalog` | Products, categories, brands, UOMs | `/api/v1/catalog` |
| `customer` | Customer master | `/api/v1/sales/customers` |
| `supplier` | Supplier master | `/api/v1/procurement/suppliers` |
| `inventory` | Stock, ledger, reservations, blocks | `/api/v1/inventory` |
| `warehouse` | Zones, aisles, racks, bins | `/api/v1/warehouse` |
| `grn` | Goods receipt notes | `/api/v1/warehouse/grns` |
| `po` | Purchase orders | `/api/v1/procurement/purchase-orders` |
| `pr` | Purchase requisitions | `/api/v1/procurement/requisitions` |
| `quot` | Quotations | `/api/v1/procurement/quotations` |
| `rfq` | RFQs | `/api/v1/procurement/rfqs` |
| `so` | Sales orders | `/api/v1/sales/orders` |
| `pricing` | Price lists, promotions, coupons | `/api/v1/sales/pricing` |
| `allocation` | Inventory allocations | `/api/v1/sales/fulfillment/allocations` |
| `wave` | Wave plans | `/api/v1/sales/fulfillment/waves` |
| `pick` | Pick lists | `/api/v1/sales/pick-pack-dispatch/pick-lists` |
| `pack` | Packing lists | `/api/v1/sales/pick-pack-dispatch/packing-lists` |
| `shipment` | Shipments | `/api/v1/sales/pick-pack-dispatch/shipments` |
| `delivery` | Delivery orders, PODs | `/api/v1/sales/delivery` |
| `returns` | Customer returns (RMA) | `/api/v1/sales/returns` |
| `batch` | Batch manufacturing | `/api/v1/manufacturing/batches` |
| `recipe` | Recipes, BOMs, routings | `/api/v1/manufacturing/recipes` |
| `production` | Production orders | `/api/v1/manufacturing/orders` |
| `mes` | MES (machines, shifts, OEE) | `/api/v1/mes` |
| `quality` | Inspection lots, plans | `/api/v1/quality` |
| `ncr` | Non-conformance reports | `/api/v1/quality/ncrs` |
| `capa` | CAPAs | `/api/v1/quality/capas` |
| `coa` | Certificates of analysis | `/api/v1/quality/coa` |
| `recall` | Product recalls | `/api/v1/quality/recall` |
| `gl` | General ledger | `/api/v1/finance/gl` |
| `costing` | Product costing | `/api/v1/finance/costing` |
| `gst` | GST configuration | `/api/v1/finance/gst` |
| `finance` | Financial foundation (accounts, currencies) | `/api/v1/finance/foundation` |
| `hr` | Employee master | `/api/v1/hrms/employees` |
| `attendance` | Attendance/shift | `/api/v1/hrms/attendance` |
| `leave` | Leave management | `/api/v1/hrms/leave` |
| `performance` | Performance management | `/api/v1/hrms/performance` |
| `crm` | CRM activities | `/api/v1/crm/foundation` |
| `complaint` | Customer complaints | `/api/v1/crm/complaints` |
| `bi` | Business intelligence | `/api/v1/bi/*` |
| `alerts` | Alert rules | `/api/v1/bi/alerts` |
| `user` | User management | `/api/v1/admin` |
| `role` | Role management | `/api/v1/admin` |
| `audit` | Audit logs | (internal) |
| `system` | System configuration | (internal) |
| `receiving` | (Future) ASN, docks | When built |
| `yard` | (Future) Yard management | When built |
| `eam` | (Future) Equipment management | When built |
| `cyclecount` | (Future) Cycle counting | When built |
| `missioncontrol` | (Future) Operations dashboard | When built |
| `controltower` | (Future) Control tower | When built |
| `sla` | (Future) SLA configuration | When built |

---

## 2. Migration from Old to New Permissions

| Old Permission | New Permission(s) | Modules Affected |
|---|---|---|
| `AUDIT_READ` (used as proxy for reads) | Replace with domain-specific `*:read` | 8+ modules |
| `AUDIT_READ_CRITICAL` (used as proxy for writes) | Replace with domain-specific `*:create`/`*:update` | 6 modules |
| `ORG_READ` (used as proxy) | Replace with domain-specific `*:read` | attendance, performance |
| `ORG_UPDATE` (used as proxy) | Replace with domain-specific `*:update` | attendance, performance |
| `CUSTOMER_READ` (used as proxy for sales reads) | `so:read`, `allocation:read`, `pricing:read`, etc. | 5 sales modules |
| `CUSTOMER_UPDATE` (used as proxy for sales writes) | `so:create`, `wave:create`, `pricing:create`, etc. | 5 sales modules |
| `PRODUCT_READ` (used as proxy for mfg reads) | `batch:read`, `recipe:read`, `mes:read` | 3 mfg modules |
| `PRODUCT_CREATE` (used as proxy for mfg creates) | `batch:create`, `recipe:create` | 2 mfg modules |
| `PRODUCT_UPDATE` (used as proxy for mfg transitions) | `batch:transition`, `recipe:approve` | 2 mfg modules |
| `INVENTORY_READ` (used for warehouse reads) | `warehouse:read` (for zones/bins) + `inventory:read` (for stock) | warehouse module |
| `INVENTORY_POST` (used for warehouse creates) | `warehouse:create`, `putaway:create`, `scan:execute` | warehouse module |
| `IQC_INSPECT` | `quality:inspect` | quality module |
| `IQC_APPROVE` | `quality:approve` | quality module |
| `NCR_CREATE` | `ncr:create` | quality module |
| `NCR_APPROVE` | `ncr:approve` | quality module |
| `COA_SIGN` | `coa:sign` | quality module |
| `RECALL_INITIATE` | `recall:initiate` | quality module |
| `GRN_READ` | `grn:read` | goods-receipt module |
| `GRN_CREATE` | `grn:create` | goods-receipt module |
| `GRN_POST` | `grn:post` | goods-receipt module |
| `GRN_PUTAWAY` | `putaway:create` | warehouse module |
| `INVENTORY_ADJUST` | `inventory:adjust` | inventory module |
| `INVENTORY_REVERSE` | `inventory:reverse` | inventory module |

---

## 3. TypeScript Enum Naming

```typescript
// Domain prefix + Action, both UPPER_SNAKE_CASE
export const Permission = {
  INVENTORY_READ: 'inventory:read',
  INVENTORY_STOCKIN: 'inventory:stockin',
  INVENTORY_STOCKOUT: 'inventory:stockout',
  INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_ADJUST_APPROVE: 'inventory:adjust:approve',
  // ...
} as const
```

---

**END OF PERMISSION NAMING STANDARD**
