/**
 * @suop/backend — Enterprise Data Scope Enforcement (Phase 1 — FINAL)
 *
 * Architecture: FROZEN — do not redesign.
 *
 * Provides universal, automatic scope enforcement across:
 *   - Repositories (via scopedQuery / ScopeFilter builder)
 *   - Services (via enforceScope / enforceScopeOnWrite)
 *   - Controllers (via scopeContext middleware)
 *   - Query Builders (via ScopeFilter)
 *   - Dashboards / Reports / Exports / Print (via buildScopeClause)
 *   - Workflow / Audit / Notification queries (via scopedQuery)
 *
 * 8 scope levels (broadest → narrowest):
 *   global → region → bu → company → plant → wh → dept → own
 *
 * NO query may return data outside the user's resolved scope.
 * The enforceScopeOnWrite function guarantees writes cannot cross scope either.
 */

import { getRequestContext } from '@/core/context'
import { DataScope } from '@/core/permissions/registry'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'

// ─── Scope Resolution ───────────────────────────────────────────────────────

/**
 * Role → Default Scope mapping. The broadest scope across all of a user's
 * roles wins (so a user who is both warehouse_operator AND warehouse_supervisor
 * gets PLANT, not WAREHOUSE).
 *
 * Note: tenant_admin / auditor / break_glass always get GLOBAL.
 */
const ROLE_SCOPE_PRECEDENCE: Array<{ roles: string[]; scope: string }> = [
  { roles: ['tenant_admin', 'auditor', 'break_glass'], scope: DataScope.GLOBAL },
  { roles: ['sales_manager', 'procurement_manager', 'finance_accountant', 'finance_manager', 'hr_manager'], scope: DataScope.COMPANY },
  { roles: ['manufacturing_supervisor', 'quality_manager', 'warehouse_supervisor'], scope: DataScope.PLANT },
  { roles: ['warehouse_operator'], scope: DataScope.WAREHOUSE },
  { roles: ['sales_officer', 'procurement_officer'], scope: DataScope.DEPT },
]

/**
 * Scope precedence rank — higher number = broader scope.
 * Used to compute the broadest scope when a user has multiple roles.
 */
export const SCOPE_RANK: Record<string, number> = {
  [DataScope.OWN]: 1,
  [DataScope.DEPT]: 2,
  [DataScope.WAREHOUSE]: 3,
  [DataScope.PLANT]: 4,
  [DataScope.COMPANY]: 5,
  [DataScope.BU]: 6,
  [DataScope.REGION]: 7,
  [DataScope.GLOBAL]: 8,
}

/**
 * Resolve the data scope for the current user based on their roles.
 * Returns the broadest scope available across all roles.
 */
export function resolveDataScope(roles: string[]): string {
  if (!roles || roles.length === 0) return DataScope.OWN

  let broadest = DataScope.OWN
  for (const entry of ROLE_SCOPE_PRECEDENCE) {
    if (entry.roles.some((r) => roles.includes(r))) {
      if (SCOPE_RANK[entry.scope] > SCOPE_RANK[broadest]) {
        broadest = entry.scope
      }
    }
  }
  return broadest
}

// ─── Scope Context Accessors ────────────────────────────────────────────────

/**
 * Get the user's resolved data scope from the request context.
 * Falls back to computing from roles if not pre-populated.
 */
export function getCurrentDataScope(): string {
  const ctx = getRequestContext()
  if (!ctx) return DataScope.GLOBAL // system-level — no restriction
  if (ctx.dataScope) return ctx.dataScope
  return resolveDataScope(ctx.roles)
}

/** Get assigned warehouse IDs from context (or null if not set). */
export function getAssignedWarehouseIds(): string[] | null {
  const ctx = getRequestContext()
  if (!ctx) return null
  return ctx.warehouseIds ?? null
}

/** Get assigned plant IDs from context (or null if not set). */
export function getAssignedPlantIds(): string[] | null {
  const ctx = getRequestContext()
  if (!ctx) return null
  return ctx.plantIds ?? null
}

/** Get assigned company IDs from context (or null if not set). */
export function getAssignedCompanyIds(): string[] | null {
  const ctx = getRequestContext()
  if (!ctx) return null
  return ctx.companyIds ?? null
}

/** Get assigned department IDs from context (or null if not set). */
export function getAssignedDepartmentIds(): string[] | null {
  const ctx = getRequestContext()
  if (!ctx) return null
  return ctx.departmentIds ?? null
}

/** Get assigned business unit IDs from context (or null if not set). */
export function getAssignedBusinessUnitIds(): string[] | null {
  const ctx = getRequestContext()
  if (!ctx) return null
  return ctx.businessUnitIds ?? null
}

/** Get assigned region IDs from context (or null if not set). */
export function getAssignedRegionIds(): string[] | null {
  const ctx = getRequestContext()
  if (!ctx) return null
  return ctx.regionIds ?? null
}

/**
 * Get the current user ID (for OWN scope filtering).
 */
export function getCurrentUserId(): string | null {
  const ctx = getRequestContext()
  return ctx?.userId ?? null
}

// ─── Scope Filter Builder ───────────────────────────────────────────────────

export interface ScopeFilterResult {
  /** Additional SQL clause to AND into the WHERE clause (e.g., " AND t.warehouse_id = ANY($3)") */
  clause: string
  /** Bind parameters for the clause */
  params: unknown[]
  /** Number of bind parameters consumed (for next paramStart) */
  paramCount: number
}

/**
 * Scope column mapping — describes which column on a given table corresponds
 * to each scope dimension. Different tables use different column names.
 *
 * Example:
 *   ScopeFilter.build('inventory', { tableAlias: 'i', scope: 'wh' })
 *   → resolves warehouse_ids from context → 'i.warehouse_id = ANY($N)'
 */
export interface ScopeColumnMap {
  warehouseId?: string     // default: 'warehouse_id'
  plantId?: string         // default: 'plant_id'
  companyId?: string       // default: 'company_id'
  departmentId?: string    // default: 'department_id'
  businessUnitId?: string  // default: 'bu_id'
  regionId?: string        // default: 'region_id'
  createdBy?: string       // default: 'created_by'
  assignedTo?: string      // default: 'assigned_to'
}

/**
 * Build a scope filter clause for inclusion in a SQL WHERE clause.
 *
 * @param scope - The data scope to apply (from getCurrentDataScope())
 * @param tableAlias - SQL table alias (e.g., 'i', 'inv', 'inventory')
 * @param paramStart - The starting bind parameter index ($N)
 * @param columnMap - Optional column name overrides
 * @returns ScopeFilterResult with clause + params, OR null if no filtering needed (global scope)
 */
export function buildScopeFilter(
  scope: string,
  tableAlias: string,
  paramStart: number,
  columnMap: ScopeColumnMap = {}
): ScopeFilterResult | null {
  const cols = {
    warehouseId: columnMap.warehouseId ?? 'warehouse_id',
    plantId: columnMap.plantId ?? 'plant_id',
    companyId: columnMap.companyId ?? 'company_id',
    departmentId: columnMap.departmentId ?? 'department_id',
    businessUnitId: columnMap.businessUnitId ?? 'bu_id',
    regionId: columnMap.regionId ?? 'region_id',
    createdBy: columnMap.createdBy ?? 'created_by',
    assignedTo: columnMap.assignedTo ?? 'assigned_to',
  }

  let i = paramStart
  const params: unknown[] = []

  switch (scope) {
    case DataScope.GLOBAL:
      return null // No filtering — global scope sees everything (within tenant)

    case DataScope.REGION: {
      const regionIds = getAssignedRegionIds()
      if (!regionIds || regionIds.length === 0) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(regionIds)
      return { clause: ` AND ${tableAlias}.${cols.regionId} = ANY($${i++})`, params, paramCount: 1 }
    }

    case DataScope.BU: {
      const buIds = getAssignedBusinessUnitIds()
      if (!buIds || buIds.length === 0) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(buIds)
      return { clause: ` AND ${tableAlias}.${cols.businessUnitId} = ANY($${i++})`, params, paramCount: 1 }
    }

    case DataScope.COMPANY: {
      const companyIds = getAssignedCompanyIds()
      if (!companyIds || companyIds.length === 0) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(companyIds)
      return { clause: ` AND ${tableAlias}.${cols.companyId} = ANY($${i++})`, params, paramCount: 1 }
    }

    case DataScope.PLANT: {
      const plantIds = getAssignedPlantIds()
      if (!plantIds || plantIds.length === 0) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(plantIds)
      return { clause: ` AND ${tableAlias}.${cols.plantId} = ANY($${i++})`, params, paramCount: 1 }
    }

    case DataScope.WAREHOUSE: {
      const whIds = getAssignedWarehouseIds()
      if (!whIds || whIds.length === 0) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(whIds)
      return { clause: ` AND ${tableAlias}.${cols.warehouseId} = ANY($${i++})`, params, paramCount: 1 }
    }

    case DataScope.DEPT: {
      const deptIds = getAssignedDepartmentIds()
      if (!deptIds || deptIds.length === 0) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(deptIds)
      return { clause: ` AND ${tableAlias}.${cols.departmentId} = ANY($${i++})`, params, paramCount: 1 }
    }

    case DataScope.OWN: {
      const userId = getCurrentUserId()
      if (!userId) return { clause: ' AND 1=0', params: [], paramCount: 0 }
      params.push(userId)
      // Filter by created_by OR assigned_to (whichever applies)
      return {
        clause: ` AND (${tableAlias}.${cols.createdBy} = $${i} OR ${tableAlias}.${cols.assignedTo} = $${i})`,
        params,
        paramCount: 1,
      }
    }

    default:
      // Unknown scope — fail closed (no access)
      return { clause: ' AND 1=0', params: [], paramCount: 0 }
  }
}

/**
 * Backward-compat alias for buildScopeFilter (older signature).
 * @deprecated Use buildScopeFilter instead.
 */
export function applyScopeFilter(
  scope: string,
  tableAlias: string,
  paramStart: number
): { clause: string; params: unknown[] } | null {
  const result = buildScopeFilter(scope, tableAlias, paramStart)
  if (!result) return null
  return { clause: result.clause, params: result.params }
}

// ─── Scoped Query Builder ───────────────────────────────────────────────────

/**
 * ScopedQueryBuilder — fluent builder for constructing scope-filtered SQL.
 *
 * Usage:
 *   const result = await new ScopedQueryBuilder('inventory', 'i')
 *     .where('product_id = $1', [productId])
 *     .whereScope()                              // auto-injects scope filter
 *     .orderBy('created_at', 'DESC')
 *     .limit(25)
 *     .offset(0)
 *     .execute()
 */
export class ScopedQueryBuilder {
  private tableName: string
  private alias: string
  private wheres: Array<{ clause: string; params: unknown[] }> = []
  private orderBys: string[] = []
  private limitValue?: number
  private offsetValue?: number
  private selectClause: string = '*'
  private columnMap: ScopeColumnMap
  private scopeApplied = false

  constructor(tableName: string, alias: string, columnMap: ScopeColumnMap = {}) {
    this.tableName = tableName
    this.alias = alias
    this.columnMap = columnMap
  }

  select(selectClause: string): this {
    this.selectClause = selectClause
    return this
  }

  where(clause: string, params: unknown[] = []): this {
    this.wheres.push({ clause, params })
    return this
  }

  /** Auto-inject the user's data scope filter. Call once per query. */
  whereScope(): this {
    if (this.scopeApplied) return this
    const scope = getCurrentDataScope()
    const filter = buildScopeFilter(scope, this.alias, 1, this.columnMap)
    if (filter) {
      this.wheres.push({ clause: filter.clause, params: filter.params })
    }
    this.scopeApplied = true
    return this
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderBys.push(`${column} ${direction}`)
    return this
  }

  limit(n: number): this {
    this.limitValue = n
    return this
  }

  offset(n: number): this {
    this.offsetValue = n
    return this
  }

  /** Build the SQL string and parameter list. */
  build(): { sql: string; params: unknown[] } {
    const params: unknown[] = []
    let paramIdx = 1

    // Re-number parameters (since they may be added in any order)
    const renumberedWheres: string[] = []
    for (const w of this.wheres) {
      let clause = w.clause
      for (const p of w.params) {
        clause = clause.replace(/\$\d+/, () => `$${paramIdx++}`)
        params.push(p)
      }
      renumberedWheres.push(clause)
    }

    const whereClause = renumberedWheres.length > 0
      ? `WHERE ${renumberedWheres.join(' AND ')}`
      : ''

    const orderByClause = this.orderBys.length > 0
      ? `ORDER BY ${this.orderBys.join(', ')}`
      : ''

    const limitClause = this.limitValue !== undefined ? `LIMIT $${paramIdx++}` : ''
    if (this.limitValue !== undefined) params.push(this.limitValue)

    const offsetClause = this.offsetValue !== undefined ? `OFFSET $${paramIdx++}` : ''
    if (this.offsetValue !== undefined) params.push(this.offsetValue)

    const sql = `SELECT ${this.selectClause} FROM ${this.tableName} ${this.alias} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.replace(/\s+/g, ' ').trim()

    return { sql, params }
  }

  /** Build the count query (no limit/offset/order). */
  buildCount(): { sql: string; params: unknown[] } {
    const params: unknown[] = []
    let paramIdx = 1
    const renumberedWheres: string[] = []
    for (const w of this.wheres) {
      let clause = w.clause
      for (const p of w.params) {
        clause = clause.replace(/\$\d+/, () => `$${paramIdx++}`)
        params.push(p)
      }
      renumberedWheres.push(clause)
    }
    const whereClause = renumberedWheres.length > 0 ? `WHERE ${renumberedWheres.join(' AND ')}` : ''
    const sql = `SELECT COUNT(*) as cnt FROM ${this.tableName} ${this.alias} ${whereClause}`.replace(/\s+/g, ' ').trim()
    return { sql, params }
  }
}

// ─── Service-Layer Enforcement ──────────────────────────────────────────────

/**
 * Verify that a record is within the current user's data scope.
 * Use this BEFORE returning a record to the user (e.g., in findById).
 *
 * @param record - The DB record (must have relevant scope columns populated)
 * @param entityType - Type name for error message (e.g., 'Inventory', 'PurchaseOrder')
 * @throws AuthorizationError if record is out of scope
 */
export function enforceScope(
  record: Record<string, unknown> | null,
  entityType: string
): void {
  if (!record) return
  const ctx = getRequestContext()
  if (!ctx) return // system-level — no scope enforcement
  if (!ctx.userId) return // unauthenticated — handled by auth middleware

  const scope = getCurrentDataScope()
  if (scope === DataScope.GLOBAL) return

  // For each scope level, check the corresponding column
  switch (scope) {
    case DataScope.COMPANY: {
      const companyIds = ctx.companyIds ?? []
      const recordCompanyId = record['company_id'] as string | null
      if (recordCompanyId && !companyIds.includes(recordCompanyId)) {
        throw new AuthorizationError(`${entityType} out of scope — company mismatch`)
      }
      break
    }
    case DataScope.PLANT: {
      const plantIds = ctx.plantIds ?? []
      const recordPlantId = record['plant_id'] as string | null
      if (recordPlantId && !plantIds.includes(recordPlantId)) {
        throw new AuthorizationError(`${entityType} out of scope — plant mismatch`)
      }
      break
    }
    case DataScope.WAREHOUSE: {
      const whIds = ctx.warehouseIds ?? []
      const recordWhId = record['warehouse_id'] as string | null
      if (recordWhId && !whIds.includes(recordWhId)) {
        throw new AuthorizationError(`${entityType} out of scope — warehouse mismatch`)
      }
      break
    }
    case DataScope.DEPT: {
      const deptIds = ctx.departmentIds ?? []
      const recordDeptId = record['department_id'] as string | null
      if (recordDeptId && !deptIds.includes(recordDeptId)) {
        throw new AuthorizationError(`${entityType} out of scope — department mismatch`)
      }
      break
    }
    case DataScope.OWN: {
      const userId = ctx.userId
      const createdBy = record['created_by'] as string | null
      const assignedTo = record['assigned_to'] as string | null
      if (createdBy !== userId && assignedTo !== userId) {
        throw new AuthorizationError(`${entityType} out of scope — not created by or assigned to user`)
      }
      break
    }
  }
}

/**
 * Verify that a record the user is about to WRITE to (update/delete/transition)
 * is within the current user's data scope.
 *
 * @param record - The existing DB record (must have scope columns populated)
 * @param entityType - Type name for error message
 * @param operation - The write operation (e.g., 'update', 'delete', 'transition')
 * @throws AuthorizationError if record is out of scope
 */
export function enforceScopeOnWrite(
  record: Record<string, unknown> | null,
  entityType: string,
  operation: string
): void {
  if (!record) return
  enforceScope(record, entityType)
  // Additional write-specific checks can go here
  void operation
}

/**
 * Verify that the scope context is properly populated for the current request.
 * Use this in middleware to ensure scope info is loaded before any query runs.
 *
 * @throws BusinessRuleError if scope context is missing for a scoped user
 */
export function requireScopeContext(): void {
  const ctx = getRequestContext()
  if (!ctx) return
  if (!ctx.userId) return

  const scope = getCurrentDataScope()
  if (scope === DataScope.GLOBAL) return

  // For each scope level, verify the corresponding IDs are populated
  switch (scope) {
    case DataScope.COMPANY:
      if (!ctx.companyIds || ctx.companyIds.length === 0) {
        throw new BusinessRuleError('Company scope context not populated — cannot enforce data scope', {
          code: 'SCOPE.CONTEXT_MISSING',
        })
      }
      break
    case DataScope.PLANT:
      if (!ctx.plantIds || ctx.plantIds.length === 0) {
        throw new BusinessRuleError('Plant scope context not populated', { code: 'SCOPE.CONTEXT_MISSING' })
      }
      break
    case DataScope.WAREHOUSE:
      if (!ctx.warehouseIds || ctx.warehouseIds.length === 0) {
        throw new BusinessRuleError('Warehouse scope context not populated', { code: 'SCOPE.CONTEXT_MISSING' })
      }
      break
    case DataScope.DEPT:
      if (!ctx.departmentIds || ctx.departmentIds.length === 0) {
        throw new BusinessRuleError('Department scope context not populated', { code: 'SCOPE.CONTEXT_MISSING' })
      }
      break
  }
}

// ─── Scope Context Population ───────────────────────────────────────────────

/**
 * Populate the scope context for the current request.
 * Called by the auth/scope middleware after authentication.
 *
 * In production, this would load the user's warehouse/plant/company/dept
 * assignments from the database. For Phase 1, we accept them from the JWT
 * claims or user profile.
 */
export function populateScopeContext(params: {
  warehouseIds?: string[]
  plantIds?: string[]
  companyIds?: string[]
  departmentIds?: string[]
  businessUnitIds?: string[]
  regionIds?: string[]
}): void {
  const ctx = getRequestContext()
  if (!ctx) return

  if (params.warehouseIds) ctx.warehouseIds = params.warehouseIds
  if (params.plantIds) ctx.plantIds = params.plantIds
  if (params.companyIds) ctx.companyIds = params.companyIds
  if (params.departmentIds) ctx.departmentIds = params.departmentIds
  if (params.businessUnitIds) ctx.businessUnitIds = params.businessUnitIds
  if (params.regionIds) ctx.regionIds = params.regionIds

  // Resolve and cache the data scope
  ctx.dataScope = resolveDataScope(ctx.roles)
}

// ─── Multi-Scope Aggregation (for dashboards/reports) ───────────────────────

/**
 * Build an aggregated scope clause for dashboard/report queries that JOIN
 * multiple tables. Returns the WHERE clause additions for ALL joined tables.
 *
 * Example:
 *   const filter = buildMultiTableScopeFilter([
 *     { table: 'inventory', alias: 'i', columnMap: {} },
 *     { table: 'warehouses', alias: 'w', columnMap: {} },
 *   ], 1)
 */
export function buildMultiTableScopeFilter(
  tables: Array<{ table: string; alias: string; columnMap?: ScopeColumnMap }>,
  paramStart: number
): ScopeFilterResult | null {
  const scope = getCurrentDataScope()
  if (scope === DataScope.GLOBAL) return null

  let i = paramStart
  const params: unknown[] = []
  const clauses: string[] = []

  for (const { alias, columnMap } of tables) {
    const filter = buildScopeFilter(scope, alias, i, columnMap ?? {})
    if (filter) {
      clauses.push(filter.clause.replace(/\$\d+/, () => `$${i++}`))
      params.push(...filter.params)
    }
  }

  if (clauses.length === 0) return null
  return {
    clause: clauses.join(''),
    params,
    paramCount: i - paramStart,
  }
}

// ─── Export / Print Scope Filtering ─────────────────────────────────────────

/**
 * Filter an in-memory result set by scope (for export/print workflows
 * that fetch data, then transform it).
 *
 * This is the fallback when SQL-level filtering isn't possible (e.g.,
 * data already loaded into memory). All export and print pipelines MUST
 * call this on the final result set.
 */
export function filterResultSetByScope<T extends Record<string, unknown>>(
  records: T[]
): T[] {
  const ctx = getRequestContext()
  if (!ctx || !ctx.userId) return records
  const scope = getCurrentDataScope()
  if (scope === DataScope.GLOBAL) return records

  return records.filter((record) => {
    switch (scope) {
      case DataScope.COMPANY:
        return !record['company_id'] || (ctx.companyIds ?? []).includes(record['company_id'] as string)
      case DataScope.PLANT:
        return !record['plant_id'] || (ctx.plantIds ?? []).includes(record['plant_id'] as string)
      case DataScope.WAREHOUSE:
        return !record['warehouse_id'] || (ctx.warehouseIds ?? []).includes(record['warehouse_id'] as string)
      case DataScope.DEPT:
        return !record['department_id'] || (ctx.departmentIds ?? []).includes(record['department_id'] as string)
      case DataScope.OWN:
        return record['created_by'] === ctx.userId || record['assigned_to'] === ctx.userId
      default:
        return true
    }
  })
}

// ─── Audit / Notification Scope Helpers ─────────────────────────────────────

/**
 * Build a scope filter for audit log queries.
 * Audit logs are scoped by the entity's scope columns (company_id, plant_id, etc.)
 */
export function buildAuditScopeFilter(
  tableAlias: string,
  paramStart: number
): ScopeFilterResult | null {
  // Audit logs have company_id, plant_id, warehouse_id, department_id columns
  // Use the standard scope filter
  return buildScopeFilter(getCurrentDataScope(), tableAlias, paramStart, {
    companyId: 'company_id',
    plantId: 'plant_id',
    warehouseId: 'warehouse_id',
    departmentId: 'department_id',
  })
}

/**
 * Build a scope filter for notification queries.
 * Notifications are scoped by user_id (OWN) or by org context.
 */
export function buildNotificationScopeFilter(
  tableAlias: string,
  paramStart: number
): ScopeFilterResult | null {
  const ctx = getRequestContext()
  if (!ctx?.userId) return { clause: ' AND 1=0', params: [], paramCount: 0 }
  const scope = getCurrentDataScope()

  // Notifications are always OWN scope — user only sees their notifications
  if (scope === DataScope.GLOBAL) {
    // Global scope users (admin/auditor) see all notifications in their tenant
    return null
  }
  // All other scopes — only see own notifications
  return {
    clause: ` AND ${tableAlias}.user_id = $${paramStart}`,
    params: [ctx.userId],
    paramCount: 1,
  }
}

// ─── Workflow Scope Filter ──────────────────────────────────────────────────

/**
 * Build a scope filter for workflow state queries.
 * Workflow instances carry the scope of their originating entity.
 */
export function buildWorkflowScopeFilter(
  tableAlias: string,
  paramStart: number
): ScopeFilterResult | null {
  return buildScopeFilter(getCurrentDataScope(), tableAlias, paramStart, {
    companyId: 'company_id',
    plantId: 'plant_id',
    warehouseId: 'warehouse_id',
    departmentId: 'department_id',
    createdBy: 'initiated_by',
  })
}
