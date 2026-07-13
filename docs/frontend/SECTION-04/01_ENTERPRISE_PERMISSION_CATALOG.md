# 01 — Enterprise Permission Catalog

**Date**: 2026-07-13
**Status**: FINAL ARCHITECTURE (pending approval)
**Scope**: COMPLETE ERP — all 57 backend modules across 14 business domains
**Principle**: Every permission represents a REAL business capability. No proxy permissions.

---

## Naming Standard

```
<domain>:<action>[:<scope>]
```

- **domain**: Business domain (inventory, warehouse, sales, etc.)
- **action**: Specific capability (read, create, update, delete, approve, etc.)
- **scope** (optional): Sub-entity or context (e.g., `inventory:adjust:block`, `inventory:adjust:expired`)

### Standard Actions

| Action | Meaning | SAP Equivalent |
|---|---|---|
| `read` | View records | Display authorization |
| `create` | Create new records | Create authorization |
| `update` | Modify existing records | Change authorization |
| `delete` | Remove/archive records | Delete authorization |
| `approve` | Approve a workflow transition | Release authorization |
| `reject` | Reject a workflow transition | Rejection authorization |
| `post` | Post to ledger/GL (irreversible) | Post authorization |
| `cancel` | Cancel a transaction | Cancellation authorization |
| `reopen` | Reopen a closed transaction | Reversal authorization |
| `export` | Export data (CSV, PDF, Excel) | Export authorization |
| `import` | Import data (bulk upload) | Import authorization |
| `print` | Print documents (labels, invoices) | Print authorization |
| `configure` | Configure system settings | Customizing authorization |
| `audit` | View audit logs | Audit authorization |

---

## Complete Permission Catalog (14 domains, ~180 permissions)

### 1. Organization Domain (12 permissions)

| Permission | Description | Used By |
|---|---|---|
| `org:read` | View org hierarchy (companies, plants, warehouses) | All modules (reference data) |
| `org:create` | Create companies, plants, warehouses | Organization admin |
| `org:update` | Update org entities | Organization admin |
| `org:delete` | Delete/deactivate org entities | Organization admin |
| `org:configure` | Configure org settings (timezones, currencies) | System admin |
| `dept:read` | View departments | All modules (reference) |
| `dept:create` | Create departments | Organization admin |
| `dept:update` | Update departments | Organization admin |
| `dept:delete` | Delete departments | Organization admin |
| `costcenter:read` | View cost centers | Finance, manufacturing |
| `costcenter:create` | Create cost centers | Finance admin |
| `costcenter:update` | Update cost centers | Finance admin |

### 2. Catalog Domain (10 permissions)

| Permission | Description | Used By |
|---|---|---|
| `catalog:read` | View products, categories, brands, UOMs | All modules (reference) |
| `catalog:create` | Create products | Master data steward |
| `catalog:update` | Update products | Master data steward |
| `catalog:delete` | Delete/discontinue products | Master data admin |
| `catalog:approve` | Approve product lifecycle transitions | Product manager |
| `catalog:export` | Export product catalog | Sales, procurement |
| `catalog:import` | Import products (bulk) | Master data steward |
| `category:read` | View categories | All modules |
| `category:create` | Create categories | Master data steward |
| `brand:read` | View brands | All modules |

### 3. Partners Domain (14 permissions)

| Permission | Description | Used By |
|---|---|---|
| `customer:read` | View customers | Sales, finance, CRM |
| `customer:create` | Create customers | Sales officer |
| `customer:update` | Update customers | Sales officer |
| `customer:delete` | Delete/archive customers | Sales admin |
| `customer:approve` | Approve customer lifecycle transitions | Sales manager |
| `customer:credit:read` | View customer credit status | Finance, sales |
| `customer:credit:update` | Update credit limits | Finance manager |
| `supplier:read` | View suppliers | Procurement, quality |
| `supplier:create` | Create suppliers | Procurement officer |
| `supplier:update` | Update suppliers | Procurement officer |
| `supplier:delete` | Delete/archive suppliers | Procurement manager |
| `supplier:blacklist` | Blacklist a supplier | Procurement manager |
| `supplier:approve` | Approve supplier lifecycle transitions | Procurement manager |
| `supplier:compliance:read` | View supplier compliance records | Quality, procurement |

### 4. Inventory Domain (12 permissions)

| Permission | Description | Used By |
|---|---|---|
| `inventory:read` | View stock levels, balances, availability | All modules |
| `inventory:stockin` | Receive stock (goods receipt, production receipt) | Warehouse, manufacturing |
| `inventory:stockout` | Issue stock (sales, production, scrap) | Warehouse, manufacturing |
| `inventory:transfer` | Transfer stock between warehouses/bins | Warehouse supervisor |
| `inventory:adjust` | Adjust stock with variance + reason | Warehouse supervisor |
| `inventory:adjust:approve` | Approve stock adjustment | Warehouse manager |
| `inventory:reserve` | Reserve stock for orders | Sales, manufacturing |
| `inventory:reserve:release` | Release stock reservations | Sales, manufacturing |
| `inventory:block` | Block stock (quality hold, damage) | Quality, warehouse |
| `inventory:block:release` | Release stock blocks | Quality, warehouse manager |
| `inventory:expiry:mark` | Mark stock as expired | Warehouse operator, system |
| `inventory:reverse` | Reverse a posted transaction | Warehouse manager (with approval) |

### 5. Warehouse Domain (14 permissions)

| Permission | Description | Used By |
|---|---|---|
| `warehouse:read` | View zones, aisles, racks, bins | All warehouse modules |
| `warehouse:create` | Create zones, aisles, racks, bins | Warehouse admin |
| `warehouse:update` | Update zone/aisle/rack/bin details | Warehouse admin |
| `warehouse:delete` | Delete/deactivate zones, aisles, racks, bins | Warehouse admin |
| `putaway:read` | View putaway tasks | Warehouse operators |
| `putaway:create` | Create putaway tasks | System (auto), warehouse supervisor |
| `putaway:complete` | Complete putaway task | Warehouse operator |
| `putaway:reassign` | Reassign putaway task to different operator/bin | Warehouse supervisor |
| `barcode:read` | View barcodes | All modules |
| `barcode:create` | Generate barcodes | Warehouse, master data |
| `barcode:print` | Print barcode labels | Warehouse operator |
| `scan:execute` | Scan barcodes (putaway, pick, dispatch) | Warehouse operator |
| `scan:read` | View scan logs | Warehouse supervisor, auditor |
| `grn:read` | View goods receipts | Procurement, warehouse, quality |

### 6. Procurement Domain (16 permissions)

| Permission | Description | Used By |
|---|---|---|
| `pr:read` | View purchase requisitions | Procurement, finance |
| `pr:create` | Create purchase requisitions | Any department (requester) |
| `pr:update` | Update purchase requisitions | Requester |
| `pr:delete` | Delete purchase requisitions | Requester (draft only) |
| `pr:approve` | Approve purchase requisitions | Department head, procurement manager |
| `po:read` | View purchase orders | Procurement, finance, warehouse |
| `po:create` | Create purchase orders | Procurement officer |
| `po:update` | Update purchase orders | Procurement officer |
| `po:delete` | Delete purchase orders | Procurement manager |
| `po:approve` | Approve purchase orders | Procurement manager, finance |
| `po:issue` | Issue PO to supplier | Procurement officer |
| `po:cancel` | Cancel purchase orders | Procurement manager |
| `po:close` | Close purchase orders | Procurement manager |
| `po:receive` | Receive goods against PO | Warehouse operator |
| `po:export` | Export PO (PDF) | Procurement, finance |
| `quot:read` | View supplier quotations | Procurement |
| `quot:create` | Create quotations (supplier-side) | Supplier portal |
| `quot:approve` | Approve/award quotation | Procurement manager |
| `rfq:read` | View RFQs | Procurement |
| `rfq:create` | Create RFQs | Procurement officer |

### 7. Sales Domain (20 permissions)

| Permission | Description | Used By |
|---|---|---|
| `so:read` | View sales orders | Sales, finance, warehouse |
| `so:create` | Create sales orders | Sales officer |
| `so:update` | Update sales orders | Sales officer |
| `so:delete` | Delete sales orders | Sales manager |
| `so:approve` | Approve sales orders | Sales manager |
| `so:hold` | Hold sales orders | Sales manager |
| `so:release` | Release held sales orders | Sales manager |
| `allocation:read` | View inventory allocations | Sales, warehouse |
| `allocation:create` | Create allocations | System (auto), sales |
| `wave:read` | View wave plans | Warehouse supervisor |
| `wave:create` | Create wave plans | Warehouse supervisor |
| `wave:release` | Release waves for picking | Warehouse supervisor |
| `pick:read` | View pick lists | Warehouse operators |
| `pick:create` | Create pick lists | System (from waves) |
| `pick:complete` | Complete pick tasks | Warehouse operator |
| `pack:read` | View packing lists | Warehouse operators |
| `pack:create` | Create packing lists | Warehouse operator |
| `pack:complete` | Complete packing tasks | Warehouse operator |
| `shipment:read` | View shipments | Warehouse, logistics |
| `shipment:create` | Create shipments | Warehouse supervisor |
| `delivery:read` | View delivery orders | Logistics, sales |
| `delivery:create` | Create delivery orders | Logistics |
| `delivery:pod` | Confirm proof of delivery | Delivery driver, logistics |
| `returns:read` | View customer returns | Sales, quality, warehouse |
| `returns:create` | Create RMAs | Sales, customer service |
| `returns:approve` | Approve refunds | Finance, sales manager |
| `pricing:read` | View price lists, promotions, coupons | Sales |
| `pricing:create` | Create price lists, promotions | Sales manager |
| `pricing:calculate` | Calculate prices (resolution engine) | All sales channels |

### 8. Manufacturing Domain (14 permissions)

| Permission | Description | Used By |
|---|---|---|
| `batch:read` | View batches | Manufacturing, quality, inventory |
| `batch:create` | Create batches | Manufacturing planner |
| `batch:update` | Update batch details | Manufacturing planner |
| `batch:transition` | Transition batch lifecycle | Manufacturing supervisor |
| `batch:split` | Split a batch | Manufacturing supervisor |
| `batch:merge` | Merge batches | Manufacturing supervisor |
| `batch:trace` | View batch genealogy/traceability | Quality, auditor |
| `recipe:read` | View recipes, BOMs, routings | Manufacturing, costing |
| `recipe:create` | Create recipes | Manufacturing engineer |
| `recipe:approve` | Approve recipes | Manufacturing manager |
| `production:read` | View production orders | Manufacturing |
| `production:create` | Create production orders | Manufacturing planner |
| `production:transition` | Transition production orders | Manufacturing supervisor |
| `mes:read` | View MES data (machines, shifts, OEE) | Manufacturing, management |

### 9. Quality Domain (12 permissions)

| Permission | Description | Used By |
|---|---|---|
| `quality:read` | View inspection plans, lots, results | Quality, warehouse |
| `quality:inspect` | Perform inspections (record results) | Quality inspector |
| `quality:approve` | Approve inspection results | Quality manager |
| `quality:hold` | Create quality holds | Quality inspector |
| `quality:hold:release` | Release quality holds | Quality manager |
| `ncr:read` | View NCRs | Quality, manufacturing |
| `ncr:create` | Create NCRs | Quality inspector |
| `ncr:approve` | Approve/close NCRs | Quality manager |
| `capa:read` | View CAPAs | Quality, manufacturing |
| `capa:create` | Create CAPAs | Quality manager |
| `capa:approve` | Approve/close CAPAs | Quality manager |
| `coa:sign` | Sign certificates of analysis | Quality manager |
| `recall:read` | View recalls | Quality, management |
| `recall:initiate` | Initiate product recalls | Quality director |

### 10. Finance Domain (18 permissions)

| Permission | Description | Used By |
|---|---|---|
| `gl:read` | View journal entries, GL postings | Finance, auditor |
| `gl:create` | Create journal entries | Accountant |
| `gl:update` | Update journal entries (draft only) | Accountant |
| `gl:post` | Post journal entries (irreversible) | Finance manager |
| `gl:reverse` | Reverse posted entries | Finance manager |
| `costing:read` | View product costs, variances | Finance, manufacturing |
| `costing:create` | Create cost records | Cost accountant |
| `costing:update` | Update cost records | Cost accountant |
| `costing:approve` | Approve cost revaluations | Finance manager |
| `gst:read` | View GST configurations | Finance, sales |
| `gst:create` | Create GST configurations | Tax accountant |
| `gst:update` | Update GST configurations | Tax accountant |
| `finance:read` | View accounts, currencies, exchange rates | Finance |
| `finance:create` | Create accounts, currencies | Finance admin |
| `finance:update` | Update accounts, currencies, exchange rates | Finance admin |
| `finance:period:close` | Close fiscal periods | Finance manager |
| `ap:read` | View accounts payable | Finance |
| `ar:read` | View accounts receivable | Finance |

### 11. HR Domain (12 permissions)

| Permission | Description | Used By |
|---|---|---|
| `hr:read` | View employee records | HR, management |
| `hr:create` | Create employee records | HR officer |
| `hr:update` | Update employee records | HR officer |
| `attendance:read` | View attendance records | HR, supervisors |
| `attendance:create` | Record attendance (clock in/out) | Employees, HR |
| `attendance:update` | Update attendance records | HR officer |
| `attendance:approve` | Approve overtime, regularization | HR manager |
| `leave:read` | View leave applications | HR, employees |
| `leave:create` | Apply for leave | Employees |
| `leave:approve` | Approve/reject leave | Managers, HR |
| `performance:read` | View performance cycles, goals, appraisals | HR, management |
| `performance:configure` | Configure performance cycles | HR manager |

### 12. CRM Domain (8 permissions)

| Permission | Description | Used By |
|---|---|---|
| `crm:read` | View CRM activities, leads, opportunities | Sales, CRM |
| `crm:create` | Create CRM activities | Sales, CRM |
| `crm:update` | Update CRM activities | Sales, CRM |
| `complaint:read` | View customer complaints | Customer service, quality |
| `complaint:create` | Create complaints | Customer service |
| `complaint:resolve` | Resolve complaints | Customer service manager |
| `service:read` | View service requests | Customer service |
| `service:create` | Create service requests | Customer service |

### 13. BI & Administration Domain (10 permissions)

| Permission | Description | Used By |
|---|---|---|
| `bi:read` | View dashboards, reports | All roles (role-scoped) |
| `bi:configure` | Configure dashboards, KPIs | BI admin |
| `alerts:read` | View alerts | All roles |
| `alerts:configure` | Configure alert rules | System admin |
| `alerts:admin` | Manage alert rules (CRUD) | System admin |
| `user:read` | View user directory | IT admin, HR |
| `user:create` | Create/invite users | IT admin |
| `user:update` | Update users (lock/unlock, roles) | IT admin |
| `user:delete` | Delete users | IT admin |
| `role:manage` | Manage roles and permissions | IT admin |
| `audit:read` | View audit logs | Auditor, compliance |
| `audit:read:critical` | View critical audit logs | Auditor, compliance |
| `system:tenant:cross` | Cross-tenant operations | System admin only |
| `system:configure` | System configuration | System admin |

### 14. Future Modules (placeholder permissions)

| Permission | Description | When Needed |
|---|---|---|
| `receiving:read` | View ASNs, dock appointments | When receiving module is built |
| `receiving:create` | Create ASNs, schedule appointments | When receiving module is built |
| `yard:read` | View yard trucks, dock schedule | When yard module is built |
| `yard:checkin` | Gate check-in | When yard module is built |
| `yard:checkout` | Gate check-out | When yard module is built |
| `eam:read` | View equipment | When EAM module is built |
| `eam:create` | Register equipment | When EAM module is built |
| `eam:maintenance` | Schedule/perform maintenance | When EAM module is built |
| `cyclecount:read` | View cycle count requests | When cycle-count module is built |
| `cyclecount:execute` | Perform counts | When cycle-count module is built |
| `cyclecount:approve` | Approve count variances | When cycle-count module is built |
| `missioncontrol:read` | View operations dashboard | When mission-control module is built |
| `controltower:read` | View control tower | When control-tower module is built |
| `sla:configure` | Configure SLA rules | When control-tower module is built |

---

## Summary

| Domain | Permissions | Notes |
|---|---|---|
| Organization | 12 | Includes departments, cost centers |
| Catalog | 10 | Products, categories, brands |
| Partners | 14 | Customers + suppliers |
| Inventory | 12 | Stock, reservations, blocks, expiry |
| Warehouse | 14 | Zones, aisles, racks, bins, putaway, barcodes, scan, GRN |
| Procurement | 20 | PR, PO, quotations, RFQs |
| Sales | 29 | SO, allocation, wave, pick, pack, shipment, delivery, returns, pricing |
| Manufacturing | 14 | Batch, recipe, production, MES |
| Quality | 14 | Inspection, NCR, CAPA, COA, recall |
| Finance | 18 | GL, costing, GST, foundation, AP, AR |
| HR | 12 | Employees, attendance, leave, performance |
| CRM | 8 | Activities, complaints, service |
| BI & Admin | 14 | BI, alerts, users, roles, audit, system |
| Future (placeholder) | 14 | Receiving, yard, EAM, cycle count, mission control, control tower |
| **Total** | **~215** | |

---

**END OF ENTERPRISE PERMISSION CATALOG**
