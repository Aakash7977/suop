import type { PaginatedResponse, SingleResponse } from './common'

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
