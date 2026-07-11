/**
 * Organization Module — Types
 */

export type OrgEntityStatus = 'DRAFT' | 'CONFIGURED' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

export type PlantType = 'MANUFACTURING' | 'DISTRIBUTION' | 'WAREHOUSE' | 'RETAIL' | 'RESTAURANT'
export type WarehouseType = 'RAW_MATERIAL' | 'FINISHED_GOODS' | 'PACKAGING' | 'DISTRIBUTION' | 'QUARANTINE'
export type CostCenterType = 'PRODUCTION' | 'SERVICE' | 'ADMIN' | 'SALES'

export interface CompanyInput {
  code: string
  name: string
  legalName?: string
  description?: string
  parentId?: string
  gstin?: string
  pan?: string
  cin?: string
  email?: string
  phone?: string
  website?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  defaultTimezone?: string
  defaultCurrency?: string
}

export interface BusinessUnitInput {
  companyId: string
  code: string
  name: string
  description?: string
  parentId?: string
}

export interface DivisionInput {
  businessUnitId: string
  code: string
  name: string
  description?: string
  parentId?: string
}

export interface RegionInput {
  divisionId: string
  code: string
  name: string
  description?: string
  country?: string
  state?: string
}

export interface PlantInput {
  regionId: string
  code: string
  name: string
  description?: string
  plantType?: PlantType
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  timezone?: string
  currency?: string
  email?: string
  phone?: string
}

export interface WarehouseInput {
  plantId: string
  code: string
  name: string
  description?: string
  warehouseType?: WarehouseType
  addressLine1?: string
  city?: string
  state?: string
  country?: string
  timezone?: string
  isDefault?: boolean
  totalAreaSqft?: number
}

export interface DepartmentInput {
  code: string
  name: string
  description?: string
  companyId?: string
  businessUnitId?: string
  plantId?: string
  parentId?: string
}

export interface CostCenterInput {
  code: string
  name: string
  description?: string
  plantId?: string
  departmentId?: string
  costCenterType?: CostCenterType
}

export interface FinancialYearInput {
  code: string
  name: string
  startDate: string
  endDate: string
  isCurrent?: boolean
}

export interface WorkingCalendarInput {
  plantId?: string
  name: string
  year: number
  workingDays: string[]
  shifts?: Array<{ name: string; startTime: string; endTime: string }>
  holidays?: Array<{ date: string; name: string }>
}

export interface TaxConfigInput {
  taxType: string
  taxCode: string
  description?: string
  rate: number
  effectiveFrom: string
  effectiveTo?: string
  hsnCode?: string
}

export interface HierarchyNode {
  id: string
  code: string
  name: string
  type: string
  status: string
  children?: HierarchyNode[]
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  filter?: Record<string, unknown>
}
