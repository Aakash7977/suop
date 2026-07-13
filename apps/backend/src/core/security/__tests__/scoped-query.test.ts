/**
 * @suop/backend — Scoped Query Tests
 * Tests for the scopedQuery, scopedCount, ScopedQueryBuilder helpers.
 * Verifies that scope filters are correctly injected into SQL.
 */

import { describe, test, expect } from 'vitest'
import { scopedCount, scopedExists, withScope, type ScopedQueryOptions } from '../scoped-query'
import { ScopedQueryBuilder, buildScopeFilter, getCurrentDataScope } from '../data-scope'
import { DataScope } from '@/core/permissions/registry'
import { _runInTestContext, getRequestContext } from '@/core/context'

function withCtx<T>(ctx: Record<string, unknown>, fn: () => Promise<T>): Promise<T> {
  return _runInTestContext(ctx as any, fn)
}

// We don't actually execute queries against the DB — we test that the
// SQL string and params are correctly constructed. The scopedQuery function
// calls the underlying query() which we'd need to mock for full integration.
// For these tests, we focus on the SQL building logic via ScopedQueryBuilder.

describe('ScopedQueryBuilder — SQL Construction', () => {
  test('global scope: no scope filter added', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .whereScope()

      const { sql, params } = builder.build()
      expect(sql).toContain('WHERE i.tenant_id = $1')
      expect(sql).not.toContain('warehouse_id')
      expect(params).toEqual(['t-1'])
    })
  })

  test('warehouse scope: warehouse_id filter added', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'], warehouseIds: ['wh-1'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .whereScope()
        .limit(25)

      const { sql, params } = builder.build()
      expect(sql).toContain('i.warehouse_id = ANY')
      expect(params).toEqual(['t-1', ['wh-1'], 25])
    })
  })

  test('plant scope: plant_id filter added', async () => {
    await withCtx({
      userId: 'sup', roles: ['quality_manager'], plantIds: ['plant-1'],
    }, async () => {
      const builder = new ScopedQueryBuilder('batches', 'b')
        .where('b.tenant_id = $1', ['t-1'])
        .whereScope()

      const { sql } = builder.build()
      expect(sql).toContain('b.plant_id = ANY')
    })
  })

  test('own scope: created_by OR assigned_to filter added', async () => {
    await withCtx({
      userId: 'user-1', roles: [],
    }, async () => {
      const builder = new ScopedQueryBuilder('sales_orders', 's')
        .where('s.tenant_id = $1', ['t-1'])
        .whereScope()

      const { sql } = builder.build()
      expect(sql).toMatch(/s\.created_by = \$\d+ OR s\.assigned_to = \$\d+/)
    })
  })

  test('multiple where() calls AND-ed', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .where('i.product_id = $1', ['p-1'])
        .where('i.warehouse_id = $1', ['wh-1'])
        .whereScope()

      const { sql } = builder.build()
      // 3 where() calls → 3 ANDs (no scope filter for global)
      expect(sql).toMatch(/WHERE.*AND.*AND/)
    })
  })

  test('orderBy adds ORDER BY clause', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .whereScope()
        .orderBy('created_at', 'DESC')

      const { sql } = builder.build()
      expect(sql).toContain('ORDER BY created_at DESC')
    })
  })

  test('limit and offset add LIMIT and OFFSET clauses', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .whereScope()
        .limit(25)
        .offset(50)

      const { sql, params } = builder.build()
      expect(sql).toContain('LIMIT')
      expect(sql).toContain('OFFSET')
      expect(params).toEqual([25, 50])
    })
  })

  test('buildCount does not include ORDER BY / LIMIT / OFFSET', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .whereScope()
        .orderBy('created_at')
        .limit(25)
        .offset(50)

      const { sql } = builder.buildCount()
      expect(sql).not.toContain('ORDER BY')
      expect(sql).not.toContain('LIMIT')
      expect(sql).not.toContain('OFFSET')
      expect(sql).toContain('COUNT(*)')
    })
  })

  test('whereScope is idempotent (calling twice does not duplicate filter)', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'], warehouseIds: ['wh-1'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .whereScope()
        .whereScope()  // duplicate call

      const { sql } = builder.build()
      // Count occurrences of warehouse_id filter — should be exactly 1
      const matches = sql.match(/warehouse_id = ANY/g)
      expect(matches?.length ?? 0).toBe(1)
    })
  })

  test('custom column map overrides default column names', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'], warehouseIds: ['wh-1'],
    }, async () => {
      const builder = new ScopedQueryBuilder('custom_table', 'c', {
        warehouseId: 'wh_key',
      })
        .where('c.tenant_id = $1', ['t-1'])
        .whereScope()

      const { sql } = builder.build()
      expect(sql).toContain('c.wh_key = ANY')
    })
  })

  test('select clause can be customized', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .select('id, product_id, quantity')
        .whereScope()

      const { sql } = builder.build()
      expect(sql).toContain('SELECT id, product_id, quantity')
    })
  })
})

describe('scopedCount / scopedExists — Function Signatures', () => {
  // These would normally require DB access; we test that they don't throw
  // during construction by checking the function exists and accepts args.
  test('scopedCount is a function', () => {
    expect(typeof scopedCount).toBe('function')
  })

  test('scopedExists is a function', () => {
    expect(typeof scopedExists).toBe('function')
  })
})

describe('withScope — Repository Proxy', () => {
  test('withScope wraps a repository and returns a proxy', () => {
    const repo = {
      list: async () => [],
      findById: async () => null,
      create: async () => ({ id: '1' }),
    }
    const scoped = withScope(repo, 'inventory', 'i')
    expect(scoped).toBeDefined()
    expect(typeof scoped.list).toBe('function')
    expect(typeof scoped.findById).toBe('function')
    expect(typeof scoped.create).toBe('function')
  })

  test('withScope proxy passes through non-function properties', () => {
    const repo = { tableName: 'inventory', list: async () => [] }
    const scoped = withScope(repo, 'inventory', 'i')
    expect((scoped as any).tableName).toBe('inventory')
  })
})

describe('getCurrentDataScope — Runtime Scope Detection', () => {
  test('returns global when tenant_admin', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      expect(getCurrentDataScope()).toBe(DataScope.GLOBAL)
    })
  })

  test('returns wh when warehouse_operator', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'],
    }, async () => {
      expect(getCurrentDataScope()).toBe(DataScope.WAREHOUSE)
    })
  })

  test('returns dept when sales_officer', async () => {
    await withCtx({
      userId: 'off', roles: ['sales_officer'],
    }, async () => {
      expect(getCurrentDataScope()).toBe(DataScope.DEPT)
    })
  })

  test('uses cached dataScope when set on context', async () => {
    await withCtx({
      userId: 'u1', roles: ['tenant_admin'], dataScope: DataScope.PLANT,
    }, async () => {
      expect(getCurrentDataScope()).toBe(DataScope.PLANT)
    })
  })
})

describe('buildScopeFilter — Edge Cases', () => {
  test('unknown scope → fail closed (AND 1=0)', async () => {
    await withCtx({
      userId: 'u1', roles: ['tenant_admin'],
    }, async () => {
      const f = buildScopeFilter('unknown_scope', 'i', 1)
      expect(f!.clause).toBe(' AND 1=0')
    })
  })

  test('warehouse scope with null warehouseIds → fail closed', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'],
      // warehouseIds not set
    }, async () => {
      const f = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      expect(f!.clause).toBe(' AND 1=0')
    })
  })

  test('paramCount is correct for each scope', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'], warehouseIds: ['wh-1'],
    }, async () => {
      const f = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      expect(f!.paramCount).toBe(1)
    })
  })
})
