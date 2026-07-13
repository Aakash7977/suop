# 02 — Business Logic Report

**Section**: 03 — Master Data Management
**Date**: 2026-07-13

---

## 1. Business Purpose

Section 03 is the **data backbone** of the SUOP ERP. Every transaction (sales, purchase, manufacturing, invoice, shipment) references master data created here. Based on SAP S/4HANA, Oracle Fusion, Microsoft Dynamics 365, Infor CloudSuite, and Aptean patterns.

## 2. Actors and Departments

| Persona | Department | Modules |
|---|---|---|
| Master Data Steward | MDM | Product Master, PIM, Governance |
| Procurement Officer | Procurement | Supplier, Brand, UOM, Payment Terms |
| Sales Manager | Sales | Customer, Price Lists, Currency |
| Plant Manager | Manufacturing | Plant, Warehouse, Cost Center |
| Warehouse Supervisor | Operations | Warehouse, Storage Bins |
| Tax Accountant | Finance | HSN/SAC, Tax, GST |
| Finance Controller | Finance | Cost Center, Department, Currency |
| System Admin | IT | Reference Masters, RBAC |

## 3. Business Rules Implemented

### Product Master
- SKU unique per tenant (backend: `productService.create` line 21)
- Cannot delete ACTIVE product (backend: `productService.delete` line 75)
- Lifecycle: DRAFT → REVIEW → APPROVED → ACTIVE → DISCONTINUED → ARCHIVED
- Transition dropdown only shows allowed next states (frontend: `PRODUCT_LIFECYCLE_TRANSITIONS`)
- Delete button hidden for ACTIVE products (frontend: `p.status !== 'ACTIVE'`)
- Food manufacturing: batch tracking, serial tracking, expiry tracking, FEFO/FIFO/LIFO, shelf life days, storage condition, inspection required

### Customer Master
- Customer code unique per tenant
- GSTIN unique + regex validated (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`)
- PAN regex validated (`/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`)
- Cannot modify BLOCKED customer
- Cannot delete ACTIVE customer or customer with outstanding balance
- Lifecycle: LEAD → PROSPECT → APPROVED → ACTIVE → BLOCKED → INACTIVE → ARCHIVED
- Credit hold auto-set when outstanding > credit limit

### Supplier Master
- Vendor code unique per tenant
- GSTIN unique globally
- Cannot modify BLACKLISTED supplier
- Cannot delete ACTIVE supplier
- Blacklisting is CRITICAL severity audit
- Preferred supplier assignment revokes previous preferred for same product
- Compliance records auto-flag 30 days before expiry
- Lifecycle: DRAFT → VERIFICATION → APPROVED → ACTIVE → PROBATION → BLOCKED → BLACKLISTED → ARCHIVED

### Organization
- Company code unique per tenant
- Cannot delete company with child companies
- Hard delete requires `system:tenant:cross` permission
- Only one default warehouse per plant
- Financial year end > start, no overlap
- Lifecycle: DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED

### Pricing Engine
- Price list code unique per tenant
- Overlapping price lists resolved by priority (lower = higher)
- Customer-specific price overrides product-specific
- Promotions apply only within date window
- Coupon usage cannot exceed limit
- Stackable discounts combine; non-stackable override
- Tax mode INCLUSIVE vs EXCLUSIVE affects final price
- Multi-step calculation: base price → customer discount → promotion → coupon → tax

### Inventory
- Stock-in: quantity > 0, inspection lot must be PASSED/CONDITIONAL_PASS, expiry mandatory for batch-tracked
- Stock-out: quantity > 0, insufficient stock check, FEFO/FIFO strategy, cannot issue blocked/expired
- Moving average cost recalculated on each stock-in
- Ledger entries are IMMUTABLE (is_immutable = true)

## 4. Food Manufacturing Specifics

- 9 product types: RAW_MATERIAL, SEMI_FINISHED, FINISHED_GOOD, PACKAGING, CONSUMABLE, SERVICE, ASSET, BY_PRODUCT, SCRAP
- FEFO (First Expiry First Out) as default FIFO strategy
- Batch tracking, serial tracking, expiry tracking (boolean flags)
- Shelf life in days
- Storage condition (free text — "Cool & Dry", "Refrigerated", etc.)
- Inspection required flag (quality gate before stock-in)
- HSN code for GST compliance
- ABC/XYZ classification for demand planning
- Reorder level, reorder quantity, safety stock, lead time

## 5. Downstream Dependencies

| Module | Depends On Section 03 For |
|---|---|
| Procurement (PO, RFQ) | Supplier, Product, UOM, HSN |
| Sales (SO, Delivery) | Customer, Product, Price Lists |
| Inventory | Product, Warehouse, Storage Locations |
| Manufacturing | Product, Plant, UOM, BOM |
| Quality | Product, Supplier, Batch/Lot |
| Finance | Cost Center, Currency, Tax |

---

**END OF BUSINESS LOGIC REPORT**
