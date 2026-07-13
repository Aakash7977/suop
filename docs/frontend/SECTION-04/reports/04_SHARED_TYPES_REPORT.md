# 04 — Shared Types Report

**Date**: 2026-07-13
**Status**: ✅ COMPLETE

## Types Architecture
- src/types/ contains 15 files (14 domain + 1 common + 1 barrel)
- API files import types from @/types (NOT define their own)
- Components import types from @/types

## Type Files Created
- common.ts: PaginatedResponse, SingleResponse, ErrorResponse, ListParams, PaginationParams
- organization.ts: Company, Plant, Warehouse, Department, CostCenter, FinancialYear, HierarchyNode
- catalog.ts: Product, Category, Brand, UOM
- partners.ts: Customer, CustomerGroup, Supplier, SupplierCategory
- inventory.ts: Inventory
- warehouse.ts: WarehouseBin, GoodsReceipt
- procurement.ts: PurchaseRequisition, PurchaseOrder, Quotation, Rfq
- sales.ts: SalesOrder, Allocation, WavePlan, PickList, PackingList, Shipment, DeliveryOrder, PriceList, Promotion, Coupon, TaxConfig
- manufacturing.ts: Batch, Recipe, WorkCenter, Machine, Shift
- quality.ts: InspectionLot, Ncr, Capa, QualityHold
- finance.ts: ProductCost, GstConfig, Currency, ExchangeRate
- hr.ts: AttendanceRecord, PerformanceCycle
- crm.ts: CrmActivity
- administration.ts: LoginResponse, CurrentUser, UserListItem, RoleItem, PermissionItem

## Duplicate Types: 0 (all types defined ONCE in src/types/)
