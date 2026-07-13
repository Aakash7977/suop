#!/usr/bin/env python3
"""
Phase B+C: Create src/types/ and src/api/ domain files.
Migrates ALL existing API clients into the approved domain structure.
Maintains ONE CLIENT PER BUSINESS AGGREGATE.
"""
from pathlib import Path

PROJECT = Path('/home/z/my-project')

# ─── Phase B: Create src/types/ ──────────────────────────────────────────────

types_common = """/**
 * Common shared types used across ALL API domains.
 */

export interface PaginatedMeta {
  total: number
  page: number
  pageSize: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginatedMeta
}

export interface SingleResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; code: string; message: string }>
  }
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  [key: string]: string | number | undefined
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}
"""

types_organization = """import type { PaginatedResponse, SingleResponse } from './common'

export interface Company {
  id: string; tenant_id: string; code: string; name: string; legal_name: string | null
  description: string | null; parent_id: string | null; gstin: string | null; pan: string | null
  cin: string | null; email: string | null; phone: string | null; website: string | null
  address_line_1: string | null; city: string | null; state: string | null; country: string
  postal_code: string | null; default_timezone: string | null; default_currency: string | null
  status: string; version: number; created_at: string; updated_at: string
}

export interface Plant {
  id: string; tenant_id: string; region_id: string; code: string; name: string
  description: string | null; plant_type: string; address_line_1: string | null
  city: string | null; state: string | null; country: string; timezone: string
  currency: string; email: string | null; phone: string | null; status: string; version: number
}

export interface Warehouse {
  id: string; tenant_id: string; plant_id: string; code: string; name: string
  description: string | null; warehouse_type: string; is_default: boolean
  status: string; version: number
}

export interface Department {
  id: string; tenant_id: string; code: string; name: string; description: string | null
  company_id: string | null; business_unit_id: string | null; plant_id: string | null
  status: string; version: number
}

export interface CostCenter {
  id: string; tenant_id: string; code: string; name: string; description: string | null
  plant_id: string | null; department_id: string | null; cost_center_type: string
  status: string; version: number
}

export interface FinancialYear {
  id: string; tenant_id: string; code: string; name: string; start_date: string
  end_date: string; status: string; is_current: boolean; version: number
}

export interface HierarchyNode {
  id: string; code: string; name: string; type: string; status: string
  children?: HierarchyNode[]
}
"""

types_catalog = """export interface Product {
  id: string; sku: string; item_code: string | null; name: string; short_name: string | null
  description: string | null; product_type: string; category_id: string | null; brand_id: string | null
  base_uom_id: string; hsn_code: string | null; gst_rate: string | null; mrp: string | null
  standard_cost: string | null; shelf_life_days: number | null; batch_required: boolean
  serial_required: boolean; expiry_tracking: boolean; fifo_strategy: string
  inspection_required: boolean; costing_method: string; abc_class: string | null
  xyz_class: string | null; fsn_class: string | null; is_critical: boolean
  procurement_type: string; status: string; version: number; created_at: string
  barcodes?: Array<{ id: string; barcode_type: string; barcodeValue: string; is_primary: boolean }>
}

export interface Category { id: string; code: string; name: string; product_type: string | null }
export interface Brand { id: string; code: string; name: string }
export interface UOM { id: string; code: string; name: string; symbol: string; uom_type: string }
"""

types_partners = """export interface Customer {
  id: string; customer_code: string; customer_type: string; trade_name: string
  legal_name: string | null; gstin: string | null; primary_email: string | null
  phone: string | null; status: string; risk_rating: string; credit_limit: string | null
  outstanding_balance: string; credit_hold: boolean; version: number
}

export interface CustomerGroup { id: string; code: string; name: string }

export interface Supplier {
  id: string; vendor_code: string; legal_name: string; trade_name: string
  gstin: string | null; pan: string | null; primary_email: string | null; phone: string | null
  vendor_type: string; supplier_type: string; status: string; risk_level: string
  is_preferred: boolean; credit_limit: string | null; payment_terms: string; version: number
}

export interface SupplierCategory {
  id: string; code: string; name: string; supplier_type: string; vendor_type: string
}
"""

types_inventory = """export interface Inventory {
  id: string; product_sku: string; product_name: string; warehouse_name: string
  bin_code: string | null; batch_number: string | null; lot_number: string | null
  quantity: number; available_qty: number; reserved_qty: number; blocked_qty: number
  unit_cost: number; moving_avg_cost: number; expiry_date: string | null
  is_expired: boolean; is_blocked: boolean
}
"""

types_warehouse = """export interface WarehouseBin {
  id: string; bin_code: string; bin_name: string; bin_type: string; level: number
  capacity: number; used_capacity: number; is_active: boolean; is_blocked: boolean
}

export interface GoodsReceipt {
  id: string; grn_number: string; grn_date: string; po_number: string | null
  supplier_name: string; supplier_code: string | null; total_qty: number
  total_accepted_qty: number; status: string; version: number
}
"""

types_sales = """export interface SalesOrder { id: string; order_number: string; status: string; version: number }
export interface Allocation { id: string; allocation_number: string; status: string; version: number }
export interface WavePlan { id: string; wave_number: string; status: string; version: number }
export interface PickList { id: string; pick_list_number: string; status: string; version: number }
export interface PackingList { id: string; packing_list_number: string; status: string; version: number }
export interface Shipment { id: string; shipment_number: string; status: string; version: number }
export interface DeliveryOrder { id: string; delivery_number: string; status: string; version: number }
export interface PriceList { id: string; code: string; name: string; price_list_type?: string; currency: string; valid_from: string; valid_to?: string; priority: number; status: string; tax_mode?: string; version: number }
export interface Promotion { id: string; code: string; name: string; promotion_type: string; offer_type?: string; discount_value?: string; start_date: string; end_date: string; status: string; usage_limit?: number; used_count?: number; version: number }
export interface Coupon { id: string; coupon_code: string; coupon_name: string; coupon_type: string; discount_type: string; discount_value: string; status: string; usage_limit?: number; used_count?: number; version: number }
export interface TaxConfig { id: string; code: string; name: string; tax_type: string; rate: string; status: string; version: number }
"""

types_manufacturing = """export interface Batch { id: string; batch_number: string; status: string; version: number }
export interface Recipe { id: string; recipe_number: string; status: string; version: number }
export interface WorkCenter { id: string; code: string; name: string; status: string }
export interface Machine { id: string; code: string; name: string; status: string }
export interface Shift { id: string; code: string; name: string; status: string }
"""

types_quality = """export interface InspectionLot { id: string; lot_number: string; status: string; version: number }
export interface Ncr { id: string; ncr_number: string; status: string; version: number }
export interface Capa { id: string; capa_number: string; status: string; version: number }
export interface QualityHold { id: string; hold_number: string; status: string }
"""

types_finance = """export interface ProductCost { id: string; cost_id: string; status: string; version: number; created_at: string }
export interface GstConfig { id: string; code: string; name: string; tax_rate?: string; status: string; version: number }
export interface Currency { id: string; code: string; name: string; symbol: string; decimal_places: number; status: string }
export interface ExchangeRate { id: string; from_currency: string; to_currency: string; rate: string; effective_date: string; status: string }
"""

types_hr = """export interface AttendanceRecord { id: string; attendance_id: string; status: string; version: number }
export interface PerformanceCycle { id: string; cycle_id: string; status: string; version: number }
"""

types_crm = """export interface CrmActivity { id: string; activity_id: string; status: string; version: number }
"""

types_administration = """export interface LoginResponse { accessToken: string; refreshToken: string; user: CurrentUser }
export interface CurrentUser {
  id: string; email: string; username: string; firstName: string; lastName: string
  roles: string[]; permissions: string[]; tenantId: string
  defaultCompanyId?: string; defaultPlantId?: string; designation?: string
}
export interface UserListItem { id: string; email: string; username: string; status: string }
export interface RoleItem { id: string; name: string; description: string | null }
export interface PermissionItem { id: string; name: string; module: string }
"""

types_procurement = """export interface PurchaseRequisition { id: string; pr_number: string; status: string; version: number }
export interface PurchaseOrder { id: string; po_number: string; status: string; version: number }
export interface Quotation { id: string; quotation_number: string; status: string; version: number }
export interface Rfq { id: string; rfq_number: string; status: string; version: number }
"""

# Write all type files
types_dir = PROJECT / 'src/types'
types_files = {
    'common.ts': types_common,
    'organization.ts': types_organization,
    'catalog.ts': types_catalog,
    'partners.ts': types_partners,
    'inventory.ts': types_inventory,
    'warehouse.ts': types_warehouse,
    'procurement.ts': types_procurement,
    'sales.ts': types_sales,
    'manufacturing.ts': types_manufacturing,
    'quality.ts': types_quality,
    'finance.ts': types_finance,
    'hr.ts': types_hr,
    'crm.ts': types_crm,
    'administration.ts': types_administration,
}

for fname, content in types_files.items():
    (types_dir / fname).write_text(content)
    print(f"  ✓ types/{fname}")

# Create types/index.ts barrel
types_barrel = """/** Shared types barrel — import from @/types */
export * from './common'
export * from './organization'
export * from './catalog'
export * from './partners'
export * from './inventory'
export * from './warehouse'
export * from './procurement'
export * from './sales'
export * from './manufacturing'
export * from './quality'
export * from './finance'
export * from './hr'
export * from './crm'
export * from './administration'
"""
(types_dir / 'index.ts').write_text(types_barrel)
print("  ✓ types/index.ts")
print(f"\n✓ Phase B complete: {len(types_files)+1} type files created")
