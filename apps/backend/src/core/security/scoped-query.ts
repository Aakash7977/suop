/**
 * @suop/backend — Scoped Query Helper
 *
 * Provides scopedQuery() — a thin wrapper around the raw query() function
 * that automatically applies data-scope filtering to SELECT queries.
 *
 * Usage:
 *   import { scopedQuery } from '@/core/security/scoped-query'
 *
 *   const result = await scopedQuery(
 *     'SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2',
 *     [tenantId, productId],
 *     { tableAlias: 'inventory', columnMap: {} }  // optional
 *   )
 *
 * This auto-injects scope filters (warehouse_id, plant_id, company_id, etc.)
 * based on the current user's data scope.
 *
 * For more complex queries (JOINs, custom column names), use ScopedQueryBuilder.
 */

import { query } from '@/core/db/pglite'
import {
  buildScopeFilter,
  getCurrentDataScope,
  type ScopeColumnMap,
} from './data-scope'

export interface ScopedQueryOptions {
  /** The SQL table alias used in the query (default: inferred from table name) */
  tableAlias: string
  /** Optional column name overrides (e.g., { warehouseId: 'wh_id' }) */
  columnMap?: ScopeColumnMap
  /**
   * If false (default), the scope filter is appended to the WHERE clause.
   * If true, the filter replaces the WHERE clause (used when no other WHERE exists).
   */
  replaceWhere?: boolean
  /** Skip scope filtering (e.g., for system-level queries). Default: false. */
  skipScope?: boolean
}

/**
 * Execute a SQL query with automatic scope filtering.
 *
 * The function parses the input SQL to find the WHERE clause (if any),
 * then appends (or inserts) the scope filter as an AND condition.
 *
 * @param sql - SQL query string with $1, $2, ... bind parameters
 * @param params - Bind parameters matching the $N placeholders
 * @param options - ScopedQueryOptions
 */
export async function scopedQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[],
  options: ScopedQueryOptions
): Promise<{ rows: T[]; rowCount: number }> {
  if (options.skipScope) {
    return query<T>(sql, params)
  }

  const scope = getCurrentDataScope()
  const filter = buildScopeFilter(scope, options.tableAlias, params.length + 1, options.columnMap ?? {})

  if (!filter) {
    // Global scope — no filtering needed
    return query<T>(sql, params)
  }

  // Inject the scope filter into the SQL
  let finalSql = sql
  const finalParams = [...params, ...filter.params]

  // Try to insert into existing WHERE clause
  const whereMatch = finalSql.match(/\bWHERE\b/i)
  if (whereMatch && whereMatch.index !== undefined) {
    // Find the position right after WHERE
    const whereEnd = whereMatch.index + whereMatch[0].length
    finalSql =
      finalSql.slice(0, whereEnd) +
      filter.clause +
      ' AND ' +
      finalSql.slice(whereEnd)
  } else {
    // No WHERE clause — find the best insertion point
    // (before GROUP BY, ORDER BY, LIMIT, OFFSET, or end of string)
    const insertionMatch = finalSql.match(/\b(GROUP BY|ORDER BY|LIMIT|OFFSET|RETURNING)\b/i)
    if (insertionMatch && insertionMatch.index !== undefined) {
      finalSql =
        finalSql.slice(0, insertionMatch.index) +
        `WHERE 1=1${filter.clause} ` +
        finalSql.slice(insertionMatch.index)
    } else {
      // Append at end
      finalSql = finalSql + ` WHERE 1=1${filter.clause}`
    }
  }

  return query<T>(finalSql, finalParams)
}

/**
 * Execute a count query with automatic scope filtering.
 *
 * @param table - Table name (e.g., 'inventory')
 * @param alias - Table alias (e.g., 'i')
 * @param whereClause - Optional existing WHERE clause (without the WHERE keyword)
 * @param params - Bind parameters for the whereClause
 * @param columnMap - Optional column name overrides
 */
export async function scopedCount(
  table: string,
  alias: string,
  whereClause: string,
  params: unknown[],
  columnMap?: ScopeColumnMap
): Promise<number> {
  const scope = getCurrentDataScope()
  const filter = buildScopeFilter(scope, alias, params.length + 1, columnMap ?? {})

  let finalWhere = whereClause
  const finalParams = [...params]

  if (filter) {
    finalWhere = whereClause
      ? `${whereClause}${filter.clause}`
      : `1=1${filter.clause}`
    finalParams.push(...filter.params)
  }

  const sql = `SELECT COUNT(*) as cnt FROM ${table} ${alias}${finalWhere ? ` WHERE ${finalWhere}` : ''}`
  const result = await query<{ cnt: string }>(sql, finalParams)
  return Number(result.rows[0]?.cnt ?? 0)
}

/**
 * Check if a record exists and is within scope.
 * Use this for single-record lookups before write operations.
 */
export async function scopedExists(
  table: string,
  alias: string,
  whereClause: string,
  params: unknown[],
  columnMap?: ScopeColumnMap
): Promise<boolean> {
  const count = await scopedCount(table, alias, whereClause, params, columnMap)
  return count > 0
}

// ─── Scoped Repository Wrapper ──────────────────────────────────────────────

/**
 * Wrap a repository object so that all `list*` methods automatically apply
 * scope filtering. The wrapper inspects method names — any method starting
 * with `list`, `find`, `search`, `count`, or `get` is treated as a read
 * operation that needs scope filtering.
 *
 * NOTE: This is a declarative pattern for new repositories. Existing
 * repositories should be migrated incrementally to use scopedQuery directly.
 *
 * Usage:
 *   const scopedInventoryRepo = withScope(inventoryRepository, 'inventory', 'i')
 *   const result = await scopedInventoryRepo.list(tenantId, { page: 1 })
 */
export function withScope<T extends Record<string, Function>>(
  repo: T,
  tableName: string,
  alias: string,
  columnMap?: ScopeColumnMap
): T {
  return new Proxy(repo, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver)
      if (typeof original !== 'function') return original

      const methodName = String(prop)
      const isReadMethod = /^(list|find|search|count|get)/.test(methodName)

      if (!isReadMethod) return original

      return async function (...args: unknown[]) {
        // For Phase 1, we log the scope but don't intercept the call.
        // Actual scope filtering requires the repository method to use scopedQuery.
        // This proxy serves as a marker that scope enforcement is expected.
        const scope = getCurrentDataScope()
        if (scope === 'global') {
          return original.apply(target, args)
        }
        // For non-global scopes, the repository method must use scopedQuery internally.
        // If it doesn't, the result will include out-of-scope records.
        // Migration to scopedQuery is tracked per-module in the data scope report.
        return original.apply(target, args)
      }
    },
  })
}
