/**
 * Data Scope Middleware
 * Resolves the user's data scope from their roles and attaches it to the request context.
 * Used by repositories to filter queries by scope (own, dept, wh, plant, company, global).
 */

import { getContext } from '@/core/context'
import { DEFAULT_ROLES, DataScope, PermissionChecker } from '@/core/permissions/registry'

/**
 * Resolve the data scope for the current user based on their roles.
 * Returns the broadest scope available across all roles.
 */
export function resolveDataScope(roles: string[]): string {
  if (roles.includes('tenant_admin') || roles.includes('auditor') || roles.includes('break_glass')) {
    return DataScope.GLOBAL
  }
  if (roles.includes('sales_manager') || roles.includes('procurement_manager') ||
      roles.includes('finance_accountant') || roles.includes('finance_manager') ||
      roles.includes('hr_manager')) {
    return DataScope.COMPANY
  }
  if (roles.includes('manufacturing_supervisor') || roles.includes('quality_manager') ||
      roles.includes('warehouse_supervisor')) {
    return DataScope.PLANT
  }
  if (roles.includes('warehouse_operator')) {
    return DataScope.WAREHOUSE
  }
  if (roles.includes('sales_officer') || roles.includes('procurement_officer')) {
    return DataScope.DEPT
  }
  return DataScope.OWN
}

/**
 * Get the user's assigned warehouse IDs (from user profile or org context).
 * Used when scope is WAREHOUSE to filter queries.
 */
export function getAssignedWarehouseIds(): string[] | null {
  const ctx = getContext()
  if (!ctx) return null
  // Check org context store for warehouse assignment
  const warehouseId = (ctx as any).warehouseId
  if (warehouseId) return [warehouseId]
  return null
}

/**
 * Get the user's assigned plant IDs.
 */
export function getAssignedPlantIds(): string[] | null {
  const ctx = getContext()
  if (!ctx) return null
  const plantId = (ctx as any).plantId
  if (plantId) return [plantId]
  return null
}

/**
 * Get the user's assigned company IDs.
 */
export function getAssignedCompanyIds(): string[] | null {
  const ctx = getContext()
  if (!ctx) return null
  const companyId = (ctx as any).companyId
  if (companyId) return [companyId]
  return null
}

/**
 * Get the user's department IDs.
 */
export function getAssignedDepartmentIds(): string[] | null {
  const ctx = getContext()
  if (!ctx) return null
  const departmentId = (ctx as any).departmentId
  if (departmentId) return [departmentId]
  return null
}

/**
 * Apply scope filter to a query WHERE clause.
 * Returns the additional WHERE conditions and parameters.
 *
 * @param scope - The resolved data scope
 * @param tableAlias - The table alias (e.g., 'i' for inventory)
 * @param paramStart - The starting parameter index ($N)
 * @returns { clause: string, params: unknown[] } or null if global scope
 */
export function applyScopeFilter(
  scope: string,
  tableAlias: string,
  paramStart: number
): { clause: string; params: unknown[] } | null {
  let i = paramStart
  const params: unknown[] = []

  switch (scope) {
    case DataScope.GLOBAL:
      return null  // No filtering — see everything

    case DataScope.COMPANY: {
      const companyIds = getAssignedCompanyIds()
      if (!companyIds || companyIds.length === 0) return { clause: ' AND 1=0', params: [] }  // No company = no access
      params.push(companyIds)
      return { clause: ` AND ${tableAlias}.company_id = ANY($${i++})`, params }
    }

    case DataScope.PLANT: {
      const plantIds = getAssignedPlantIds()
      if (!plantIds || plantIds.length === 0) return { clause: ' AND 1=0', params: [] }
      params.push(plantIds)
      return { clause: ` AND ${tableAlias}.plant_id = ANY($${i++})`, params }
    }

    case DataScope.WAREHOUSE: {
      const whIds = getAssignedWarehouseIds()
      if (!whIds || whIds.length === 0) return { clause: ' AND 1=0', params: [] }
      params.push(whIds)
      return { clause: ` AND ${tableAlias}.warehouse_id = ANY($${i++})`, params }
    }

    case DataScope.DEPT: {
      const deptIds = getAssignedDepartmentIds()
      if (!deptIds || deptIds.length === 0) return { clause: ' AND 1=0', params: [] }
      params.push(deptIds)
      return { clause: ` AND ${tableAlias}.department_id = ANY($${i++})`, params }
    }

    case DataScope.OWN: {
      const ctx = getContext()
      if (!ctx?.userId) return { clause: ' AND 1=0', params: [] }
      params.push(ctx.userId)
      return { clause: ` AND ${tableAlias}.created_by = $${i++}`, params }
    }

    default:
      return null
  }
}
