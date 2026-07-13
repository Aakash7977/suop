# 01 — Enterprise Permission Catalog (FINAL)

**Date**: 2026-07-13
**Status**: FINAL — PERMANENT SECURITY FOUNDATION
**Scope**: Complete SUOP ERP — all 57+ backend modules across 14 business domains
**Standard**: SAP S/4HANA / Oracle Fusion / Microsoft Dynamics 365 / Infor / Aptean level

---

## 1. Standard Actions (22 — expanded from 15)

| Action | Meaning | Irreversible? | SAP Equivalent |
|---|---|---|---|
| `view` | See in dashboards/navigation (no business data) | No | Display auth (S_TCODE) |
| `read` | Access actual business data records | No | Display auth (S_ALV_LAYO) |
| `create` | Create new records | No | Create auth |
| `update` | Modify existing records (non-workflow) | No | Change auth |
| `delete` | Hard delete (rarely used) | Yes | Delete auth |
| `close` | Close a transaction (reversible by reopen) | No | Close auth |
| `archive` | Archive a record (soft delete, restorable) | No | Archive auth |
| `restore` | Restore an archived record | No | Restore auth |
| `approve` | Approve a workflow transition | No | Release auth |
| `reject` | Reject a workflow transition | No | Rejection auth |
| `release` | Release for next stage (post-approval, pre-execution) | No | Release auth |
| `post` | Post to ledger/GL (creates immutable entries) | Yes | Post auth |
| `cancel` | Cancel a transaction | No | Cancellation auth |
| `reopen` | Reopen a closed/cancelled transaction | No | Reversal auth |
| `reverse` | Reverse a posted transaction (creates compensating entry) | No | Reversal auth |
| `override` | Override a business rule (requires reason + audit) | No | Exception auth |
| `export` | Export data to external format | No | Export auth |
| `import` | Import data from external source | No | Import auth |
| `print` | Print documents | No | Print auth |
| `delegate` | Delegate approval authority to another user | No | Substitution auth |
| `approve:as-delegate` | Approve on behalf of delegating user | No | Proxy auth |
| `audit` | View audit logs | No | Audit auth |

### Configuration Actions (7 — split from `configure`)

| Action | Meaning |
|---|---|
| `settings` | Configure module settings |
| `workflow` | Configure workflow rules |
| `master` | Configure master data defaults |
| `templates` | Configure document templates |
| `numbering` | Configure number ranges |
| `notifications` | Configure notification rules |
| `approval-rules` | Configure approval thresholds/rules |

---

## 2. Data Scope Model

Every permission operates within a data scope. Scopes are hierarchical:

| Scope Level | Code | Meaning | Example |
|---|---|---|---|
| Own | `own` | Only records created by the user | `warehouse:read:own` — see only bins you created |
| Department | `dept` | Records within user's department | `so:read:dept` — see SOs from your department |
| Warehouse | `wh` | Records within assigned warehouse(s) | `inventory:read:wh` — see stock in your warehouse |
| Plant | `plant` | Records within assigned plant(s) | `production:read:plant` — see production orders in your plant |
| Company | `company` | Records within assigned company | `gl:read:company` — see GL entries for your company |
| Business Unit | `bu` | Records within business unit | `so:read:bu` — see SOs across plants in your BU |
| Region | `region` | Records within geographic region | `sales:read:region` — see sales for your region |
| Global | `global` | All records within tenant | `inventory:read:global` — see all inventory (admin only) |

### Scope Implementation

```typescript
// Permission string format with scope:
// <domain>:<action>[:<sub-scope>][:<data-scope>]

// Examples:
'inventory:read:wh'        // Read inventory in assigned warehouse(s)
'inventory:read:global'    // Read inventory across all warehouses (admin)
'so:approve:company'       // Approve SOs within assigned company
'gl:post:company'          // Post GL entries within assigned company
```

### Default Scope Rules

| Role | Default Scope | Can Override? |
|---|---|---|
| warehouse_operator | `wh` | No |
| warehouse_supervisor | `wh` + `plant` | No |
| sales_officer | `dept` | No |
| sales_manager | `company` | No |
| procurement_officer | `dept` | No |
| procurement_manager | `company` | No |
| finance_accountant | `company` | No |
| finance_manager | `company` | No |
| manufacturing_supervisor | `plant` | No |
| quality_manager | `plant` | No |
| auditor | `global` (read-only) | No |
| tenant_admin | `global` | Yes (via system:tenant:cross) |
| break_glass | `global` (time-limited) | No — auto-revoked |

---

## 3. Emergency Access (Break Glass)

| Permission | Description |
|---|---|
| `system:break-glass:activate` | Activate emergency access (requires reason, auto-logged, time-limited) |
| `system:break-glass:deactivate` | Deactivate emergency access (auto after timeout) |

### Break Glass Rules

1. **Mandatory reason**: User must provide a reason for activation (stored in audit log)
2. **Time-limited**: Maximum 4 hours, auto-revoked
3. **Full audit trail**: Every action during break glass is logged with CRITICAL severity
4. **Notification**: Security officer receives email alert on activation
5. **Review required**: Break glass sessions must be reviewed by security officer within 24 hours
6. **Rate limited**: Maximum 2 activations per user per 24 hours
7. **No SoD bypass**: Break glass grants READ access to all modules + CONFIGURE only — does NOT grant POST, APPROVE, DELETE, or OVERRIDE

---

## 4. Complete Permission Catalog by Domain

### 4.1 Organization Domain (18 permissions)

| Permission | Description |
|---|---|
| `org:view` | View org structure in navigation/dashboards |
| `org:read` | Read company/plant/warehouse records |
| `org:create` | Create org entities |
| `org:update` | Update org entities |
| `org:archive` | Archive org entities |
| `org:restore` | Restore archived org entities |
| `org:settings` | Configure org settings (timezones, currencies) |
| `dept:read` | View departments |
| `dept:create` | Create departments |
| `dept:update` | Update departments |
| `dept:archive` | Archive departments |
| `costcenter:read` | View cost centers |
| `costcenter:create` | Create cost centers |
| `costcenter:update` | Update cost centers |
| `fy:read` | View financial years |
| `fy:create` | Create financial years |
| `fy:close` | Close financial years |
| `fy:reopen` | Reopen financial years |

### 4.2 Catalog Domain (16 permissions)

| Permission | Description |
|---|---|
| `catalog:view` | See products in navigation |
| `catalog:read` | Read product records |
| `catalog:create` | Create products |
| `catalog:update` | Update products |
| `catalog:archive` | Archive/discontinue products |
| `catalog:restore` | Restore discontinued products |
| `catalog:approve` | Approve product lifecycle transitions |
| `catalog:override` | Override product validation rules (e.g., duplicate SKU) |
| `catalog:export` | Export product catalog |
| `catalog:import` | Import products (bulk) |
| `category:read` | View categories |
| `category:create` | Create categories |
| `category:update` | Update categories |
| `brand:read` | View brands |
| `brand:create` | Create brands |
| `uom:read` | View UOMs |

### 4.3 Partners Domain (22 permissions)

| Permission | Description |
|---|---|
| `customer:view` | See customers in navigation |
| `customer:read` | Read customer records |
| `customer:create` | Create customers |
| `customer:update` | Update customers |
| `customer:archive` | Archive customers |
| `customer:restore` | Restore archived customers |
| `customer:approve` | Approve customer lifecycle (LEAD→PROSPECT→APPROVED→ACTIVE) |
| `customer:credit:read` | View customer credit status |
| `customer:credit:update` | Update credit limits |
| `customer:credit:override` | Override credit hold (senior manager only) |
| `supplier:view` | See suppliers in navigation |
| `supplier:read` | Read supplier records |
| `supplier:create` | Create suppliers |
| `supplier:update` | Update suppliers |
| `supplier:archive` | Archive suppliers |
| `supplier:approve` | Approve supplier lifecycle (DRAFT→VERIFICATION→APPROVED→ACTIVE) |
| `supplier:blacklist` | Blacklist a supplier (CRITICAL audit) |
| `supplier:compliance:read` | View supplier compliance records |
| `supplier:compliance:create` | Add compliance records |
| `supplier:product:assign` | Assign products to suppliers |
| `supplier:category:read` | View supplier categories |
| `supplier:category:create` | Create supplier categories |

### 4.4 Inventory Domain (22 permissions)

| Permission | Description |
|---|---|
| `inventory:view` | See inventory in dashboards (summary only) |
| `inventory:read` | Read stock levels, balances, availability |
| `inventory:stockin` | Receive stock (goods receipt, production receipt) |
| `inventory:stockout` | Issue stock (sales, production, scrap) |
| `inventory:transfer` | Transfer stock between warehouses/bins |
| `inventory:transfer:approve` | Approve stock transfer requests |
| `inventory:adjust` | Adjust stock with variance + reason |
| `inventory:adjust:approve` | Approve stock adjustment |
| `inventory:reserve` | Reserve stock for orders |
| `inventory:reserve:release` | Release stock reservations |
| `inventory:block` | Block stock (quality hold, damage) |
| `inventory:block:release` | Release stock blocks |
| `inventory:expiry:mark` | Mark stock as expired |
| `inventory:reverse` | Reverse a posted transaction |
| `inventory:override` | Override stock validation (e.g., issue blocked stock with reason) |
| `inventory:export` | Export inventory data |
| `inventory:import` | Import opening stock |
| `ledger:read` | View immutable stock ledger |
| `ledger:reverse` | Reverse ledger entry (creates compensating entry — requires approval) |
| `batch:read` | View inventory batches |
| `batch:expiry:read` | View expiry alerts |
| `cyclecount:read` | View cycle count results (future) |

### 4.5 Warehouse Domain (24 permissions)

| Permission | Description |
|---|---|
| `warehouse:view` | See warehouse in navigation |
| `warehouse:read` | Read zones, aisles, racks, bins |
| `warehouse:create` | Create zones, aisles, racks, bins |
| `warehouse:update` | Update zone/aisle/rack/bin details |
| `warehouse:archive` | Archive zones, aisles, racks, bins |
| `warehouse:restore` | Restore archived warehouse entities |
| `warehouse:settings` | Configure warehouse settings |
| `warehouse:numbering` | Configure bin numbering schemes |
| `putaway:view` | See putaway tasks in dashboard |
| `putaway:read` | Read putaway tasks |
| `putaway:create` | Create putaway tasks |
| `putaway:complete` | Complete putaway task |
| `putaway:reassign` | Reassign putaway task to different operator/bin |
| `putaway:override` | Override putaway bin recommendation |
| `barcode:read` | View barcodes |
| `barcode:create` | Generate barcodes |
| `barcode:print` | Print barcode labels |
| `scan:execute` | Scan barcodes (putaway, pick, dispatch) |
| `scan:read` | View scan logs |
| `grn:view` | See GRNs in navigation |
| `grn:read` | Read goods receipts |
| `grn:create` | Create goods receipts |
| `grn:post` | Post goods receipt (triggers inventory update) |
| `grn:close` | Close goods receipt |

### 4.6 Procurement Domain (30 permissions)

| Permission | Description |
|---|---|
| `pr:view` | See purchase requisitions in navigation |
| `pr:read` | Read purchase requisitions |
| `pr:create` | Create purchase requisitions |
| `pr:update` | Update purchase requisitions |
| `pr:delete` | Delete draft purchase requisitions |
| `pr:approve` | Approve purchase requisitions |
| `pr:reject` | Reject purchase requisitions |
| `pr:delegate` | Delegate PR approval authority |
| `pr:approve:as-delegate` | Approve PR as delegate |
| `po:view` | See purchase orders in navigation |
| `po:read` | Read purchase orders |
| `po:create` | Create purchase orders |
| `po:update` | Update purchase orders |
| `po:archive` | Archive purchase orders |
| `po:approve` | Approve purchase orders |
| `po:reject` | Reject purchase order approval |
| `po:release` | Release approved PO for execution |
| `po:issue` | Issue PO to supplier |
| `po:cancel` | Cancel purchase orders |
| `po:close` | Close purchase orders |
| `po:reopen` | Reopen closed purchase orders |
| `po:receive` | Receive goods against PO |
| `po:export` | Export PO (PDF) |
| `po:delegate` | Delegate PO approval authority |
| `po:approve:as-delegate` | Approve PO as delegate |
| `po:override` | Override PO validation (e.g., exceed budget) |
| `quot:read` | View supplier quotations |
| `quot:create` | Create quotations |
| `quot:approve` | Approve/award quotation |
| `rfq:read` | View RFQs |
| `rfq:create` | Create RFQs |

### 4.7 Sales Domain (42 permissions)

| Permission | Description |
|---|---|
| `so:view` | See sales orders in navigation |
| `so:read` | Read sales orders |
| `so:create` | Create sales orders |
| `so:update` | Update sales orders |
| `so:archive` | Archive sales orders |
| `so:approve` | Approve sales orders |
| `so:reject` | Reject sales orders |
| `so:hold` | Hold sales orders |
| `so:release` | Release held sales orders |
| `so:cancel` | Cancel sales orders |
| `so:close` | Close sales orders |
| `so:reopen` | Reopen closed sales orders |
| `so:delegate` | Delegate SO approval authority |
| `so:approve:as-delegate` | Approve SO as delegate |
| `so:override` | Override SO validation (e.g., credit hold override) |
| `allocation:view` | See allocations in dashboard |
| `allocation:read` | Read inventory allocations |
| `allocation:create` | Create allocations |
| `allocation:cancel` | Cancel allocations |
| `wave:view` | See waves in dashboard |
| `wave:read` | Read wave plans |
| `wave:create` | Create wave plans |
| `wave:release` | Release waves for picking |
| `wave:cancel` | Cancel waves |
| `pick:view` | See pick lists in dashboard |
| `pick:read` | Read pick lists |
| `pick:create` | Create pick lists |
| `pick:complete` | Complete pick tasks |
| `pick:override` | Override pick validation (e.g., short pick with reason) |
| `pack:read` | Read packing lists |
| `pack:create` | Create packing lists |
| `pack:complete` | Complete packing tasks |
| `shipment:read` | Read shipments |
| `shipment:create` | Create shipments |
| `shipment:override` | Override shipment validation (e.g., seal number override) |
| `delivery:read` | Read delivery orders |
| `delivery:create` | Create delivery orders |
| `delivery:pod` | Confirm proof of delivery |
| `delivery:cancel` | Cancel delivery orders |
| `returns:read` | Read customer returns (RMA) |
| `returns:create` | Create RMAs |
| `returns:approve` | Approve refunds |
| `pricing:read` | Read price lists, promotions, coupons |
| `pricing:create` | Create price lists, promotions |
| `pricing:override` | Override calculated price (senior manager only) |
| `pricing:calculate` | Calculate prices (resolution engine) |
| `pricing:approval-rules` | Configure pricing approval rules |

### 4.8 Manufacturing Domain (24 permissions)

| Permission | Description |
|---|---|
| `batch:view` | See batches in navigation |
| `batch:read` | Read batches |
| `batch:create` | Create batches |
| `batch:update` | Update batch details |
| `batch:approve` | Approve batch creation |
| `batch:release` | Release batch for production |
| `batch:transition` | Transition batch lifecycle |
| `batch:split` | Split a batch |
| `batch:merge` | Merge batches |
| `batch:trace` | View batch genealogy/traceability |
| `batch:archive` | Archive batches |
| `recipe:read` | Read recipes, BOMs, routings |
| `recipe:create` | Create recipes |
| `recipe:update` | Update recipes |
| `recipe:approve` | Approve recipes |
| `recipe:archive` | Archive recipes |
| `production:read` | Read production orders |
| `production:create` | Create production orders |
| `production:approve` | Approve production orders |
| `production:release` | Release production orders for execution |
| `production:start` | Start production |
| `production:complete` | Complete production |
| `production:close` | Close production orders |
| `mes:read` | View MES data (machines, shifts, OEE) |

### 4.9 Quality Domain (22 permissions)

| Permission | Description |
|---|---|
| `quality:view` | See quality module in navigation |
| `quality:read` | Read inspection plans, lots, results |
| `quality:inspect` | Perform inspections (record results) |
| `quality:approve` | Approve inspection results |
| `quality:reject` | Reject inspection results |
| `quality:hold` | Create quality holds |
| `quality:hold:release` | Release quality holds |
| `quality:override` | Override quality decision (e.g., conditional pass → pass) |
| `ncr:read` | Read NCRs |
| `ncr:create` | Create NCRs |
| `ncr:approve` | Approve/close NCRs |
| `ncr:reject` | Reject NCR resolution |
| `capa:read` | Read CAPAs |
| `capa:create` | Create CAPAs |
| `capa:approve` | Approve/close CAPAs |
| `coa:read` | Read certificates of analysis |
| `coa:sign` | Sign certificates of analysis |
| `recall:read` | Read recalls |
| `recall:initiate` | Initiate product recalls |
| `recall:approve` | Approve recall execution |
| `recall:close` | Close recalls |
| `quality:approval-rules` | Configure quality approval thresholds |

### 4.10 Finance Domain (30 permissions)

| Permission | Description |
|---|---|
| `gl:view` | See GL in navigation |
| `gl:read` | Read journal entries, GL postings |
| `gl:create` | Create journal entries (draft) |
| `gl:update` | Update draft journal entries |
| `gl:approve` | Approve journal entries |
| `gl:post` | Post journal entries (irreversible) |
| `gl:reverse` | Reverse posted entries |
| `gl:archive` | Archive journal entries |
| `gl:delegate` | Delegate GL approval authority |
| `gl:approve:as-delegate` | Approve GL as delegate |
| `costing:read` | Read product costs, variances |
| `costing:create` | Create cost records |
| `costing:update` | Update cost records |
| `costing:approve` | Approve cost revaluations |
| `costing:override` | Override cost calculation |
| `gst:read` | Read GST configurations |
| `gst:create` | Create GST configurations |
| `gst:update` | Update GST configurations |
| `gst:export` | Export GST returns |
| `finance:read` | Read accounts, currencies, exchange rates |
| `finance:create` | Create accounts, currencies |
| `finance:update` | Update accounts, currencies, exchange rates |
| `finance:period:close` | Close fiscal periods |
| `finance:period:reopen` | Reopen fiscal periods |
| `finance:approval-rules` | Configure finance approval thresholds |
| `finance:override` | Override financial validation (e.g., post to closed period) |
| `ap:read` | Read accounts payable |
| `ar:read` | Read accounts receivable |
| `payment:create` | Create payments |
| `payment:approve` | Approve payments |

### 4.11 HR Domain (22 permissions)

| Permission | Description |
|---|---|
| `hr:view` | See HR module in navigation |
| `hr:read` | Read employee records |
| `hr:create` | Create employee records |
| `hr:update` | Update employee records |
| `hr:archive` | Archive employee records |
| `attendance:read` | Read attendance records |
| `attendance:create` | Record attendance (clock in/out) |
| `attendance:update` | Update attendance records |
| `attendance:approve` | Approve overtime, regularization |
| `attendance:delegate` | Delegate attendance approval |
| `attendance:approve:as-delegate` | Approve attendance as delegate |
| `leave:read` | Read leave applications |
| `leave:create` | Apply for leave |
| `leave:approve` | Approve/reject leave |
| `leave:delegate` | Delegate leave approval |
| `leave:approve:as-delegate` | Approve leave as delegate |
| `leave:cancel` | Cancel approved leave |
| `performance:read` | Read performance cycles, goals, appraisals |
| `performance:configure` | Configure performance cycles |
| `performance:appraise` | Conduct appraisals |
| `performance:approve` | Approve appraisal results |
| `payroll:read` | Read payroll data |
| `payroll:approve` | Approve payroll |

### 4.12 CRM Domain (12 permissions)

| Permission | Description |
|---|---|
| `crm:view` | See CRM in navigation |
| `crm:read` | Read CRM activities |
| `crm:create` | Create CRM activities |
| `crm:update` | Update CRM activities |
| `complaint:read` | Read customer complaints |
| `complaint:create` | Create complaints |
| `complaint:approve` | Approve complaint resolution |
| `complaint:resolve` | Resolve complaints |
| `service:read` | Read service requests |
| `service:create` | Create service requests |
| `service:close` | Close service requests |
| `lead:read` | Read leads/opportunities |

### 4.13 BI & Administration Domain (20 permissions)

| Permission | Description |
|---|---|
| `bi:view` | See dashboards in navigation |
| `bi:read` | Read dashboard data |
| `bi:settings` | Configure dashboards |
| `bi:templates` | Configure report templates |
| `alerts:read` | Read alerts |
| `alerts:settings` | Configure alert rules |
| `alerts:admin` | Manage alert rules (CRUD) |
| `alerts:override` | Override alert (dismiss without resolution) |
| `user:view` | See user directory |
| `user:read` | Read user records |
| `user:create` | Create/invite users |
| `user:update` | Update users (lock/unlock, roles) |
| `user:archive` | Archive users |
| `role:manage` | Manage roles and permissions |
| `audit:read` | Read audit logs |
| `audit:read:critical` | Read critical audit logs |
| `audit:export` | Export audit logs |
| `system:settings` | Configure system settings |
| `system:tenant:cross` | Cross-tenant operations |
| `system:break-glass:activate` | Emergency access activation |

### 4.14 Future Modules (18 placeholder permissions)

| Permission | Description |
|---|---|
| `receiving:view` | See receiving in navigation |
| `receiving:read` | Read ASNs, dock appointments |
| `receiving:create` | Create ASNs, schedule appointments |
| `receiving:approve` | Approve dock assignments |
| `yard:view` | See yard in navigation |
| `yard:read` | Read yard trucks, dock schedule |
| `yard:checkin` | Gate check-in |
| `yard:checkout` | Gate check-out |
| `eam:view` | See equipment in navigation |
| `eam:read` | Read equipment records |
| `eam:create` | Register equipment |
| `eam:update` | Update equipment |
| `eam:maintenance` | Schedule/perform maintenance |
| `cyclecount:read` | Read cycle count requests |
| `cyclecount:execute` | Perform counts |
| `cyclecount:approve` | Approve count variances |
| `missioncontrol:read` | Read operations dashboard |
| `controltower:read` | Read control tower |

---

## 5. Summary

| Domain | Permissions |
|---|---|
| Organization | 18 |
| Catalog | 16 |
| Partners | 22 |
| Inventory | 22 |
| Warehouse | 24 |
| Procurement | 30 |
| Sales | 48 |
| Manufacturing | 24 |
| Quality | 22 |
| Finance | 30 |
| HR | 23 |
| CRM | 12 |
| BI & Administration | 20 |
| Future (placeholder) | 18 |
| **Total** | **~329** |

### Improvements Applied

| # | Improvement | Impact |
|---|---|---|
| 1 | VIEW separated from READ | +14 `*:view` permissions |
| 2 | APPROVE/RELEASE/POST separated | +12 `*:release`, `*:post` permissions |
| 3 | CLOSE/ARCHIVE/RESTORE added | +18 `*:close`, `*:archive`, `*:restore` permissions |
| 4 | OVERRIDE permissions added | +12 `*:override` permissions |
| 5 | CONFIGURE split into 7 specialized | +7 configuration actions |
| 6 | DATA SCOPE model | +8 scope levels (applied via `:scope` suffix) |
| 7 | DELEGATION permissions | +8 `*:delegate`, `*:approve:as-delegate` permissions |
| 8 | Strengthened SoD | +12 new SoD rules |
| 9 | Emergency Access | +2 `system:break-glass:*` permissions + 7 rules |

---

**END OF ENTERPRISE PERMISSION CATALOG (FINAL)**
