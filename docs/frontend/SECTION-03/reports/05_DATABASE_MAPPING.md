# 05 — Database Mapping

**Section**: 03 — Master Data Management
**Date**: 2026-07-13
**Prisma Schema**: 300+ models in `apps/backend/prisma/schema.prisma`

---

## 1. Prisma Models Used by Section 03

### Product Domain
| Prisma Model | Schema Line | Raw SQL Table | Used By |
|---|---|---|---|
| `Products` | 1392 | `products` | productApi, ProductMasterModule |
| `ProductCategories` | 1317 | `product_categories` | productApi.listCategories |
| `ProductBrands` | 1340 | `product_brands` | productApi.listBrands |
| `ProductUoms` | 1359 | `product_uoms` | productApi.listUOMs |
| `UomConversions` | 1378 | `uom_conversions` | (model exists, no endpoint yet) |
| `ProductBarcodes` | 1468 | `product_barcodes` | productApi.addBarcode, listBarcodes |

### Business Partner Domain
| Prisma Model | Schema Line | Raw SQL Table | Used By |
|---|---|---|---|
| `Customers` | 1670 | `customers` | customerApi, BusinessPartnerModule |
| `CustomerGroups` | 1653 | `customer_groups` | customerApi.listGroups |
| `CustomerContacts` | 1721 | `customer_contacts` | customerApi.addContact |
| `CustomerAddresses` | 1741 | `customer_addresses` | customerApi.addAddress |
| `Suppliers` | 1502 | `suppliers` | supplierApi, BusinessPartnerModule |
| `SupplierCategories` | 1483 | `supplier_categories` | supplierApi.listCategories |
| `SupplierContacts` | 1567 | `supplier_contacts` | supplierApi.addContact |
| `SupplierAddresses` | 1587 | `supplier_addresses` | supplierApi.addAddress |
| `SupplierCompliances` | 1609 | `supplier_compliances` | supplierApi.addCompliance |
| `SupplierProductMappings` | 1629 | `supplier_product_mappings` | supplierApi.assignProduct |

### Organization Domain
| Prisma Model | Schema Line | Raw SQL Table | Used By |
|---|---|---|---|
| `Companies` | 729 | `companies` | companyApi, OrganizationModule |
| `BusinessUnits` | 764 | `business_units` | hierarchyApi (via getFullTree) |
| `Divisions` | 785 | `divisions` | hierarchyApi |
| `Regions` | 806 | `regions` | hierarchyApi |
| `Plants` | 828 | `plants` | plantApi, PlantMasterModule |
| `Warehouses` | 859 | `warehouses` | orgWarehouseApi, WarehouseModule |
| `Departments` | 887 | `departments` | departmentApi |
| `CostCenters` | 910 | `cost_centers` | costCenterApi |
| `FinancialYears` | 932 | `financial_years` | financialYearApi |

### Warehouse Domain
| Prisma Model | Schema Line | Raw SQL Table | Used By |
|---|---|---|---|
| `WarehouseZones` | 2629 | `warehouse_zones` | warehouseApi.listZones/createZone |
| `WarehouseAisles` | 2653 | `warehouse_aisles` | warehouseApi.listAisles/createAisle |
| `WarehouseRacks` | 2677 | `warehouse_racks` | warehouseApi.listRacks/createRack |
| `WarehouseBins` | 2705 | `warehouse_bins` | warehouseApi.listBins/createBin |
| `PutawayTasks` | 2736 | `putaway_tasks` | warehouseApi.listPutawayTasks/createPutawayTask |
| `BarcodeLabels` | 2781 | `barcode_labels` | warehouseApi.createBarcode/printBarcode |
| `ScanLogs` | 2826 | `scan_logs` | warehouseApi.listScanLogs |

### Inventory Domain
| Prisma Model | Schema Line | Raw SQL Table | Used By |
|---|---|---|---|
| `Batches` | 2383 | `batches` | inventoryApi.listBatches |
| `Lots` | 2409 | `lots` | inventoryApi (internal) |
| `Inventory` | 2437 | `inventory` | inventoryApi.list/get |
| `InventoryTransactions` | 2479 | `inventory_transactions` | inventoryApi.listTransactions |
| `InventoryLedger` | 2520 | `inventory_ledger` | inventoryApi.listLedger |
| `StockReservations` | 2557 | `stock_reservations` | inventoryApi.reserve/release |
| `StockBlocks` | 2593 | `stock_blocks` | inventoryApi.block |

### Pricing Domain
| Prisma Model | Schema Line | Raw SQL Table | Used By |
|---|---|---|---|
| `PriceLists` | 4927 | `price_lists` | pricingApi.listPriceLists |
| `PriceListItems` | 4952 | `price_list_items` | pricingApi (via calculate) |
| `CustomerPriceAgreements` | 4979 | `customer_price_agreements` | pricingApi (via calculate) |
| `Promotions` | 5004 | `promotions` | pricingApi.listPromotions |
| `Coupons` | 5040 | `coupons` | pricingApi.listCoupons |
| `TaxConfigurations` | 5086 | `tax_configurations` | pricingApi.listTaxConfigs |

### Finance Domain
| Prisma Model | Schema Line | Used By |
|---|---|---|
| `GstConfigurations` | 6775 | gstApi |
| `ProductCosts` | 6425 | productCostingService |
| `JournalEntries` | 6595 | generalLedgerService |
| `ChartOfAccounts` | 5795 | financialFoundationService |
| `FiscalYears` | 5823 | financialFoundationService |
| `Currencies` | 5890 | financeApi.listCurrencies |
| `ExchangeRates` | 5909 | financeApi.listExchangeRates |

### Cross-Cutting
| Prisma Model | Schema Line | Used By |
|---|---|---|
| `AuditLog` | 24 | auditService (all modules) |
| `EventOutbox` | 65 | eventBus (all modules) |
| `Tenants` | 704 | All modules (tenant scoping) |
| `Users` | 1023 | Auth context |
| `Roles` | 1198 | RBAC |
| `Permissions` | 1223 | RBAC |

## 2. Persistence Patterns

| Module | Pattern | Notes |
|---|---|---|
| Product, Customer, Supplier, Organization, Warehouse, Inventory, Recipe-BOM | Raw SQL via `query()` | Direct PostgreSQL queries via PGlite |
| GST, Product Costing, General Ledger, CRM Foundation | Prisma client `db.ModelName` | Uses Prisma ORM |
| Financial Foundation | Generic repository `genRepo` | Pattern: `genRepo(db, 'ChartOfAccounts')` |
| Pricing Engine | Raw SQL (direct in service) | Complex JOIN queries for calculatePrice |

## 3. Schema Mismatches (Known Technical Debt)

1. **Customer/Supplier**: Raw SQL tables (`customers`/`suppliers`) vs Prisma `BusinessPartner` unified model — not migrated
2. **Two `cost_centers` concepts**: Organization module (PRODUCTION/SERVICE/ADMIN/SALES) vs Financial Foundation (parent_cc_id, company_id, plant_id)
3. **Inventory**: Raw SQL `inventory` vs Prisma `StockBalance` — not migrated
4. **Warehouse**: Raw SQL `warehouse_*` vs Prisma `WarehouseMaster/Zone/Aisle/Rack/Bin` — not migrated

These are documented technical debt items, NOT blocking Section 03.

---

**END OF DATABASE MAPPING**
