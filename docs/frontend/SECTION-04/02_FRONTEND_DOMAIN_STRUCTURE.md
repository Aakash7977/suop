# 02 — Frontend Domain Structure

**Date**: 2026-07-13
**Status**: ARCHITECTURE BASELINE

---

## Complete Domain → File Mapping

### src/api/organization/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `companies.ts` | `companyApi` | organization | `/api/v1/organization/companies` | `src/modules/organization/api/client.ts` |
| `plants.ts` | `plantApi` | organization | `/api/v1/organization/plants` | `src/modules/organization/api/client.ts` |
| `warehouses.ts` | `orgWarehouseApi` | organization | `/api/v1/organization/warehouses` | `src/modules/organization/api/client.ts` |
| `departments.ts` | `departmentApi` | organization | `/api/v1/organization/departments` | `src/modules/organization/api/client.ts` |
| `cost-centers.ts` | `costCenterApi` | organization | `/api/v1/organization/cost-centers` | `src/modules/organization/api/client.ts` |
| `financial-years.ts` | `financialYearApi` | organization | `/api/v1/organization/financial-years` | `src/modules/organization/api/client.ts` |
| `hierarchy.ts` | `hierarchyApi` | organization | `/api/v1/organization/hierarchy` | `src/modules/organization/api/client.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/inventory/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `inventory.ts` | `inventoryApi` | inventory | `/api/v1/inventory/inventory` | `src/modules/inventory/api/client.ts` |
| `ledger.ts` | `inventoryLedgerApi` (split from inventoryApi) | inventory | `/api/v1/inventory/ledger` | `src/modules/inventory/api/client.ts` |
| `transactions.ts` | `inventoryTxnApi` (split from inventoryApi) | inventory | `/api/v1/inventory/transactions` | `src/modules/inventory/api/client.ts` |
| `reservations.ts` | `reservationApi` (split from inventoryApi) | inventory | `/api/v1/inventory/reservations` | `src/modules/inventory/api/client.ts` |
| `blocks.ts` | `stockBlockApi` (split from inventoryApi) | inventory | `/api/v1/inventory/blocks` | `src/modules/inventory/api/client.ts` |
| `batches.ts` | `batchApi` (split from inventoryApi) | inventory | `/api/v1/inventory/batches` | `src/modules/inventory/api/client.ts` |
| `expiry.ts` | `expiryApi` (split from inventoryApi) | inventory | `/api/v1/inventory/expiry` | `src/modules/inventory/api/client.ts` |
| `index.ts` | barrel | — | — | — |

**Note**: The existing `inventoryApi` is a monolith with 14 methods. In the new structure, it should be split by entity for clarity. However, to avoid breaking existing imports, the barrel `index.ts` will also export `inventoryApi` as a combined object.

### src/api/warehouse/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `zones.ts` | `zoneApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/zones` | `src/modules/warehouse/api/client.ts` |
| `aisles.ts` | `aisleApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/aisles` | `src/modules/warehouse/api/client.ts` |
| `racks.ts` | `rackApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/racks` | `src/modules/warehouse/api/client.ts` |
| `bins.ts` | `binApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/bins` | `src/modules/warehouse/api/client.ts` |
| `putaway.ts` | `putawayApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/putaway-tasks` | `src/modules/warehouse/api/client.ts` |
| `barcodes.ts` | `barcodeApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/barcodes` | `src/modules/warehouse/api/client.ts` |
| `scan.ts` | `scanApi` (from warehouseApi) | warehouse | `/api/v1/warehouse/scan` | `src/modules/warehouse/api/client.ts` |
| `goods-receipt.ts` | `goodsReceiptApi` | goods-receipt | `/api/v1/warehouse/grns` | `src/modules/goods-receipt/api/client.ts` |
| `index.ts` | barrel (also exports combined `warehouseApi`) | — | — | — |

### src/api/manufacturing/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `batches.ts` | `batchMfgApi` | batch-manufacturing | `/api/v1/manufacturing/batches` | `src/sections/04-operations/api/clients.ts` |
| `recipes.ts` | `recipeApi` (NEW — backend exists) | recipe-bom | `/api/v1/manufacturing/recipes` | (no client exists) |
| `mes.ts` | `mesApi` (NEW — backend exists) | mes | `/api/v1/mes` | (no client exists) |
| `production-orders.ts` | `productionOrderApi` (NEW — backend exists) | production-order | `/api/v1/manufacturing/orders` | (no client exists) |
| `index.ts` | barrel | — | — | — |

### src/api/sales/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `orders.ts` | `salesOrderApi` | sales-order | `/api/v1/sales/orders` | `src/sections/04-operations/api/clients.ts` |
| `fulfillment.ts` | `fulfillmentApi` | order-fulfillment | `/api/v1/sales/fulfillment` | `src/sections/04-operations/api/clients.ts` |
| `pick-pack.ts` | `pickPackDispatchApi` | pick-pack-dispatch | `/api/v1/sales/pick-pack-dispatch` | `src/sections/04-operations/api/clients.ts` |
| `delivery.ts` | `deliveryApi` | delivery-management | `/api/v1/sales/delivery` | `src/sections/04-operations/api/clients.ts` |
| `returns.ts` | `returnsApi` (NEW — backend exists) | customer-returns | `/api/v1/sales/returns` | (no client exists) |
| `pricing.ts` | `pricingApi` | pricing-engine | `/api/v1/sales/pricing` | `src/sections/03-master-data/api/clients.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/procurement/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `requisitions.ts` | `procurementApi` | procurement | `/api/v1/procurement/requisitions` | `src/modules/procurement/api/client.ts` |
| `purchase-orders.ts` | `purchaseOrderApi` | purchase-order | `/api/v1/procurement/purchase-orders` | `src/modules/purchase-order/api/client.ts` |
| `quotations.ts` | `quotationApi` | quotation | `/api/v1/procurement/quotations` | `src/modules/quotation/api/client.ts` |
| `rfqs.ts` | `rfqApi` | rfq | `/api/v1/procurement/rfqs` | `src/modules/rfq/api/client.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/quality/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `inspection.ts` | `qualityInspectionApi` | quality-inspection | `/api/v1/quality` | `src/modules/quality-inspection/api/client.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/finance/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `costing.ts` | `costingApi` | product-costing | `/api/v1/finance/costing` | `src/sections/04-operations/api/clients.ts` |
| `gst.ts` | `gstApi` | gst-taxation | `/api/v1/finance/gst` | `src/sections/03-master-data/api/clients.ts` |
| `foundation.ts` | `financeApi` | financial-foundation | `/api/v1/finance/foundation` | `src/sections/03-master-data/api/clients.ts` |
| `gl.ts` | `glApi` (NEW — backend exists) | general-ledger | `/api/v1/finance/gl` | (no client exists) |
| `index.ts` | barrel | — | — | — |

### src/api/hr/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `attendance.ts` | `workforceApi` → rename to `attendanceApi` | attendance-shift | `/api/v1/hrms/attendance` | `src/sections/04-operations/api/clients.ts` |
| `performance.ts` | `performanceApi` (NEW — backend exists) | performance-management | `/api/v1/hrms/performance` | (no client exists) |
| `index.ts` | barrel | — | — | — |

### src/api/administration/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `auth.ts` | `authClient` | auth | `/api/v1/auth` | `src/modules/auth/api/client.ts` |
| `users.ts` | `userMgmtApi` | user-management | `/api/v1/admin` | `src/modules/user-management/api/client.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/catalog/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `products.ts` | `productApi` | product | `/api/v1/catalog` | `src/modules/product/api/client.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/partners/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `customers.ts` | `customerApi` | customer | `/api/v1/sales/customers` | `src/modules/customer/api/client.ts` |
| `suppliers.ts` | `supplierApi` | supplier | `/api/v1/procurement/suppliers` | `src/modules/supplier/api/client.ts` |
| `index.ts` | barrel | — | — | — |

### src/api/bi/
| File | Client | Backend Module | Mount Prefix | Source (current) |
|---|---|---|---|---|
| `alerts.ts` | `alertsApi` (NEW — backend exists) | alerts-kpi-engine | `/api/v1/bi/alerts` | (no client exists) |
| `index.ts` | barrel | — | — | — |

---

## Summary

| Domain | Files | Clients | New Clients Needed |
|---|---|---|---|
| organization | 8 | 7 | 0 |
| inventory | 8 | 7 (split from 1) | 0 |
| warehouse | 9 | 8 (split from 2) + GRN | 0 |
| manufacturing | 4 | 4 | 3 (recipe, mes, production-orders) |
| sales | 7 | 7 | 1 (returns) |
| procurement | 5 | 4 | 0 |
| quality | 2 | 1 | 0 |
| finance | 5 | 5 | 1 (gl) |
| hr | 3 | 2 | 1 (performance) |
| administration | 3 | 2 | 0 |
| catalog | 2 | 1 | 0 |
| partners | 3 | 2 | 0 |
| bi | 2 | 1 | 1 (alerts) |
| **Total** | **61** | **47** | **6 new** |

---

**END OF FRONTEND DOMAIN STRUCTURE**
