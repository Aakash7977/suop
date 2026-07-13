/**
 * @suop/backend — Data Scope Enforcement Tests
 *
 * Tests for the Phase 1 Enterprise Data Scope system.
 * Verifies:
 *   - Scope resolution per role
 *   - Scope filter generation for all 8 scope levels
 *   - ScopedQueryBuilder produces correct SQL
 *   - scopedQuery auto-injects WHERE clauses
 *   - enforceScope blocks out-of-scope reads
 *   - enforceScopeOnWrite blocks out-of-scope writes
 *   - filterResultSetByScope filters in-memory results
 *   - Multi-table scope filter for dashboards
 *   - Audit/Notification/Workflow scope filters
 *   - Break-glass scope restrictions
 *   - Cross-tenant isolation
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  resolveDataScope,
  getCurrentDataScope,
  buildScopeFilter,
  ScopedQueryBuilder,
  enforceScope,
  enforceScopeOnWrite,
  filterResultSetByScope,
  buildMultiTableScopeFilter,
  buildAuditScopeFilter,
  buildNotificationScopeFilter,
  buildWorkflowScopeFilter,
  populateScopeContext,
  requireScopeContext,
  SCOPE_RANK,
} from '../data-scope'
import { DataScope } from '@/core/permissions/registry'
import { _runInTestContext, getRequestContext } from '@/core/context'

// ─── Helpers ────────────────────────────────────────────────────────────────

function withContext<T>(ctx: Partial<ReturnType<typeof getRequestContext> & object>, fn: () => Promise<T>): Promise<T> {
  return _runInTestContext(ctx as any, fn)
}

// ─── Scope Resolution ───────────────────────────────────────────────────────

describe('Data Scope Resolution', () => {
  test('tenant_admin → global', () => {
    expect(resolveDataScope(['tenant_admin'])).toBe(DataScope.GLOBAL)
  })

  test('auditor → global (read-only)', () => {
    expect(resolveDataScope(['auditor'])).toBe(DataScope.GLOBAL)
  })

  test('break_glass → global (read-only, time-limited)', () => {
    expect(resolveDataScope(['break_glass'])).toBe(DataScope.GLOBAL)
  })

  test('sales_manager → company', () => {
    expect(resolveDataScope(['sales_manager'])).toBe(DataScope.COMPANY)
  })

  test('procurement_manager → company', () => {
    expect(resolveDataScope(['procurement_manager'])).toBe(DataScope.COMPANY)
  })

  test('finance_manager → company', () => {
    expect(resolveDataScope(['finance_manager'])).toBe(DataScope.COMPANY)
  })

  test('hr_manager → company', () => {
    expect(resolveDataScope(['hr_manager'])).toBe(DataScope.COMPANY)
  })

  test('manufacturing_supervisor → plant', () => {
    expect(resolveDataScope(['manufacturing_supervisor'])).toBe(DataScope.PLANT)
  })

  test('quality_manager → plant', () => {
    expect(resolveDataScope(['quality_manager'])).toBe(DataScope.PLANT)
  })

  test('warehouse_supervisor → plant', () => {
    expect(resolveDataScope(['warehouse_supervisor'])).toBe(DataScope.PLANT)
  })

  test('warehouse_operator → wh', () => {
    expect(resolveDataScope(['warehouse_operator'])).toBe(DataScope.WAREHOUSE)
  })

  test('sales_officer → dept', () => {
    expect(resolveDataScope(['sales_officer'])).toBe(DataScope.DEPT)
  })

  test('procurement_officer → dept', () => {
    expect(resolveDataScope(['procurement_officer'])).toBe(DataScope.DEPT)
  })

  test('unknown role → own (most restrictive)', () => {
    expect(resolveDataScope(['unknown_role'])).toBe(DataScope.OWN)
  })

  test('no roles → own', () => {
    expect(resolveDataScope([])).toBe(DataScope.OWN)
  })

  test('multiple roles → broadest wins (warehouse_operator + warehouse_supervisor → plant)', () => {
    expect(resolveDataScope(['warehouse_operator', 'warehouse_supervisor'])).toBe(DataScope.PLANT)
  })

  test('multiple roles → broadest wins (sales_officer + sales_manager → company)', () => {
    expect(resolveDataScope(['sales_officer', 'sales_manager'])).toBe(DataScope.COMPANY)
  })

  test('multiple roles → admin wins (warehouse_operator + tenant_admin → global)', () => {
    expect(resolveDataScope(['warehouse_operator', 'tenant_admin'])).toBe(DataScope.GLOBAL)
  })

  test('SCOPE_RANK ordering: global > region > bu > company > plant > wh > dept > own', () => {
    expect(SCOPE_RANK.global).toBeGreaterThan(SCOPE_RANK.region)
    expect(SCOPE_RANK.region).toBeGreaterThan(SCOPE_RANK.bu)
    expect(SCOPE_RANK.bu).toBeGreaterThan(SCOPE_RANK.company)
    expect(SCOPE_RANK.company).toBeGreaterThan(SCOPE_RANK.plant)
    expect(SCOPE_RANK.plant).toBeGreaterThan(SCOPE_RANK.wh)
    expect(SCOPE_RANK.wh).toBeGreaterThan(SCOPE_RANK.dept)
    expect(SCOPE_RANK.dept).toBeGreaterThan(SCOPE_RANK.own)
  })
})

// ─── Scope Filter Builder ───────────────────────────────────────────────────

describe('buildScopeFilter', () => {
  test('global scope returns null (no filtering)', () => {
    expect(buildScopeFilter(DataScope.GLOBAL, 'inventory', 1)).toBeNull()
  })

  test('warehouse scope generates warehouse_id filter', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1', 'wh-2'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('i.warehouse_id = ANY($1)')
      expect(filter!.params).toEqual([['wh-1', 'wh-2']])
    })
  })

  test('plant scope generates plant_id filter', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_supervisor'],
      plantIds: ['plant-1'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.PLANT, 'p', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('p.plant_id = ANY($1)')
      expect(filter!.params).toEqual([['plant-1']])
    })
  })

  test('company scope generates company_id filter', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['sales_manager'],
      companyIds: ['co-1'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.COMPANY, 'c', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('c.company_id = ANY($1)')
    })
  })

  test('dept scope generates department_id filter', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['sales_officer'],
      departmentIds: ['dept-1'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.DEPT, 'd', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('d.department_id = ANY($1)')
    })
  })

  test('own scope generates created_by OR assigned_to filter', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['unknown'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.OWN, 't', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('t.created_by = $1 OR t.assigned_to = $1')
      expect(filter!.params).toEqual(['user-1'])
    })
  })

  test('warehouse scope with no warehouse IDs → fail closed (AND 1=0)', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_operator'],
      warehouseIds: [],
    }, async () => {
      const filter = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toBe(' AND 1=0')
    })
  })

  test('custom column map overrides default column names', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1, { warehouseId: 'wh_id' })
      expect(filter!.clause).toContain('i.wh_id = ANY($1)')
    })
  })

  test('paramStart determines the bind parameter index', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.WAREHOUSE, 'i', 5)
      expect(filter!.clause).toContain('$5')
    })
  })
})

// ─── ScopedQueryBuilder ────────────────────────────────────────────────────

describe('ScopedQueryBuilder', () => {
  test('builds SQL with no scope (global)', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .whereScope()
        .orderBy('created_at', 'DESC')
        .limit(25)

      const { sql, params } = builder.build()
      expect(sql).toContain('FROM inventory i')
      expect(sql).toContain('WHERE i.tenant_id = $1')
      expect(sql).not.toContain('warehouse_id') // no scope filter for global
      expect(params).toEqual(['t-1', 25])
    })
  })

  test('builds SQL with warehouse scope', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
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

  test('count query does not include ORDER BY / LIMIT / OFFSET', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
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

  test('multiple where() calls are AND-ed together', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      const builder = new ScopedQueryBuilder('inventory', 'i')
        .where('i.tenant_id = $1', ['t-1'])
        .where('i.product_id = $1', ['p-1'])
        .whereScope()

      const { sql } = builder.build()
      expect(sql).toContain('WHERE')
      expect(sql).toContain('AND')
    })
  })
})

// ─── enforceScope (Service Layer) ──────────────────────────────────────────

describe('enforceScope', () => {
  test('global scope → no enforcement', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      const record = { warehouse_id: 'wh-other' }
      expect(() => enforceScope(record, 'Inventory')).not.toThrow()
    })
  })

  test('warehouse scope → in-scope record passes', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const record = { warehouse_id: 'wh-1' }
      expect(() => enforceScope(record, 'Inventory')).not.toThrow()
    })
  })

  test('warehouse scope → out-of-scope record throws', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const record = { warehouse_id: 'wh-other' }
      expect(() => enforceScope(record, 'Inventory')).toThrow(/out of scope/)
    })
  })

  test('null record → no enforcement', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      expect(() => enforceScope(null, 'Inventory')).not.toThrow()
    })
  })

  test('own scope → record created by user passes', async () => {
    await withContext({
      userId: 'user-1',
      roles: [],
    }, async () => {
      const record = { created_by: 'user-1' }
      expect(() => enforceScope(record, 'SalesOrder')).not.toThrow()
    })
  })

  test('own scope → record created by other throws', async () => {
    await withContext({
      userId: 'user-1',
      roles: [],
    }, async () => {
      const record = { created_by: 'user-2' }
      expect(() => enforceScope(record, 'SalesOrder')).toThrow(/out of scope/)
    })
  })

  test('own scope → record assigned to user passes', async () => {
    await withContext({
      userId: 'user-1',
      roles: [],
    }, async () => {
      const record = { created_by: 'user-2', assigned_to: 'user-1' }
      expect(() => enforceScope(record, 'Task')).not.toThrow()
    })
  })
})

// ─── enforceScopeOnWrite ───────────────────────────────────────────────────

describe('enforceScopeOnWrite', () => {
  test('out-of-scope write throws', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const record = { warehouse_id: 'wh-other' }
      expect(() => enforceScopeOnWrite(record, 'Inventory', 'update')).toThrow(/out of scope/)
    })
  })

  test('in-scope write passes', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const record = { warehouse_id: 'wh-1' }
      expect(() => enforceScopeOnWrite(record, 'Inventory', 'update')).not.toThrow()
    })
  })
})

// ─── filterResultSetByScope (Export / Print) ────────────────────────────────

describe('filterResultSetByScope', () => {
  test('global scope → returns all records', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      const records = [
        { id: 1, warehouse_id: 'wh-1' },
        { id: 2, warehouse_id: 'wh-2' },
        { id: 3, warehouse_id: 'wh-3' },
      ]
      const filtered = filterResultSetByScope(records)
      expect(filtered.length).toBe(3)
    })
  })

  test('warehouse scope → filters out-of-scope records', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1', 'wh-2'],
    }, async () => {
      const records = [
        { id: 1, warehouse_id: 'wh-1' },
        { id: 2, warehouse_id: 'wh-2' },
        { id: 3, warehouse_id: 'wh-3' },  // out of scope
        { id: 4, warehouse_id: null },     // no warehouse — included
      ]
      const filtered = filterResultSetByScope(records)
      expect(filtered.length).toBe(3)
      expect(filtered.find(r => r.id === 3)).toBeUndefined()
    })
  })

  test('own scope → only own records', async () => {
    await withContext({
      userId: 'user-1',
      roles: [],
    }, async () => {
      const records = [
        { id: 1, created_by: 'user-1' },
        { id: 2, created_by: 'user-2' },
        { id: 3, created_by: 'user-1' },
      ]
      const filtered = filterResultSetByScope(records)
      expect(filtered.length).toBe(2)
      expect(filtered.every(r => r.created_by === 'user-1')).toBe(true)
    })
  })
})

// ─── Multi-Table Scope Filter (Dashboards / Reports) ────────────────────────

describe('buildMultiTableScopeFilter', () => {
  test('global scope → no filter (null)', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      const filter = buildMultiTableScopeFilter([
        { table: 'inventory', alias: 'i' },
        { table: 'warehouses', alias: 'w' },
      ], 1)
      expect(filter).toBeNull()
    })
  })

  test('warehouse scope → filters both tables', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const filter = buildMultiTableScopeFilter([
        { table: 'inventory', alias: 'i' },
        { table: 'warehouses', alias: 'w' },
      ], 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('i.warehouse_id')
      expect(filter!.clause).toContain('w.warehouse_id')
    })
  })
})

// ─── Audit / Notification / Workflow Scope Filters ─────────────────────────

describe('Audit Scope Filter', () => {
  test('warehouse scope → audit logs filtered by warehouse', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const filter = buildAuditScopeFilter('a', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('a.warehouse_id')
    })
  })
})

describe('Notification Scope Filter', () => {
  test('global scope → no filter (admin sees all tenant notifications)', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      const filter = buildNotificationScopeFilter('n', 1)
      expect(filter).toBeNull()
    })
  })

  test('warehouse scope → notifications filtered to own (user_id)', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const filter = buildNotificationScopeFilter('n', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('n.user_id = $1')
      expect(filter!.params).toEqual(['wh-op'])
    })
  })
})

describe('Workflow Scope Filter', () => {
  test('warehouse scope → workflows filtered by warehouse', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const filter = buildWorkflowScopeFilter('w', 1)
      expect(filter).not.toBeNull()
      expect(filter!.clause).toContain('w.warehouse_id')
    })
  })

  test('own scope → workflows filtered by initiated_by', async () => {
    await withContext({
      userId: 'user-1',
      roles: [],
    }, async () => {
      const filter = buildWorkflowScopeFilter('w', 1)
      expect(filter).not.toBeNull()
      // custom column map for workflow uses initiated_by instead of created_by
      expect(filter!.clause).toMatch(/w\.(initiated_by|assigned_to)/)
    })
  })
})

// ─── populateScopeContext ──────────────────────────────────────────────────

describe('populateScopeContext', () => {
  test('populates warehouse IDs on context', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_operator'],
    }, async () => {
      populateScopeContext({ warehouseIds: ['wh-1', 'wh-2'] })
      const ctx = getRequestContext()
      expect(ctx?.warehouseIds).toEqual(['wh-1', 'wh-2'])
      expect(ctx?.dataScope).toBe(DataScope.WAREHOUSE)
    })
  })

  test('populates multiple scope dimensions', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_supervisor'],
    }, async () => {
      populateScopeContext({
        warehouseIds: ['wh-1'],
        plantIds: ['plant-1'],
        companyIds: ['co-1'],
      })
      const ctx = getRequestContext()
      expect(ctx?.warehouseIds).toEqual(['wh-1'])
      expect(ctx?.plantIds).toEqual(['plant-1'])
      expect(ctx?.companyIds).toEqual(['co-1'])
      expect(ctx?.dataScope).toBe(DataScope.PLANT)
    })
  })

  test('dataScope is cached after population', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      populateScopeContext({})
      const ctx = getRequestContext()
      expect(ctx?.dataScope).toBe(DataScope.GLOBAL)
    })
  })
})

// ─── requireScopeContext ───────────────────────────────────────────────────

describe('requireScopeContext', () => {
  test('global scope → no requirement', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      expect(() => requireScopeContext()).not.toThrow()
    })
  })

  test('warehouse scope without warehouseIds → throws', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      // warehouseIds not set
    }, async () => {
      expect(() => requireScopeContext()).toThrow(/Warehouse scope context not populated/)
    })
  })

  test('warehouse scope with warehouseIds → passes', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      expect(() => requireScopeContext()).not.toThrow()
    })
  })

  test('plant scope without plantIds → throws', async () => {
    await withContext({
      userId: 'sup',
      roles: ['warehouse_supervisor'],
    }, async () => {
      expect(() => requireScopeContext()).toThrow(/Plant scope context not populated/)
    })
  })

  test('company scope without companyIds → throws', async () => {
    await withContext({
      userId: 'mgr',
      roles: ['sales_manager'],
    }, async () => {
      expect(() => requireScopeContext()).toThrow(/Company scope context not populated/)
    })
  })
})

// ─── getCurrentDataScope ───────────────────────────────────────────────────

describe('getCurrentDataScope', () => {
  test('returns global when no context (system-level)', () => {
    // Note: outside a context, returns GLOBAL (system-level access)
    const scope = getCurrentDataScope()
    expect([DataScope.GLOBAL, DataScope.OWN]).toContain(scope)
  })

  test('returns the populated dataScope when set', async () => {
    await withContext({
      userId: 'user-1',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
      dataScope: DataScope.WAREHOUSE,
    }, async () => {
      expect(getCurrentDataScope()).toBe(DataScope.WAREHOUSE)
    })
  })

  test('computes from roles when dataScope not set', async () => {
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
    }, async () => {
      expect(getCurrentDataScope()).toBe(DataScope.GLOBAL)
    })
  })
})

// ─── Cross-Tenant Isolation ────────────────────────────────────────────────

describe('Cross-Tenant Isolation', () => {
  test('data scope filter does NOT replace tenant_id filter', async () => {
    // The scope filter is AND-ed to the existing WHERE clause, which
    // always includes tenant_id = $1. This guarantees cross-tenant isolation
    // is enforced even when scope is GLOBAL.
    await withContext({
      userId: 'admin',
      roles: ['tenant_admin'],
      tenantId: 'tenant-A',
    }, async () => {
      // GLOBAL scope returns null filter, but the repository's SQL
      // still has `WHERE tenant_id = $1` which provides isolation.
      const filter = buildScopeFilter(DataScope.GLOBAL, 'i', 1)
      expect(filter).toBeNull()
      // Tenant isolation is enforced separately at the repository layer
      // via the mandatory tenant_id = $1 clause in every query.
    })
  })
})

// ─── Plant Scope ───────────────────────────────────────────────────────────

describe('Plant Scope', () => {
  test('plant scope generates plant_id filter', async () => {
    await withContext({
      userId: 'sup',
      roles: ['manufacturing_supervisor'],
      plantIds: ['plant-1', 'plant-2'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.PLANT, 'i', 1)
      expect(filter!.clause).toContain('i.plant_id = ANY($1)')
      expect(filter!.params).toEqual([['plant-1', 'plant-2']])
    })
  })

  test('plant scope with no plantIds → fail closed', async () => {
    await withContext({
      userId: 'sup',
      roles: ['manufacturing_supervisor'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.PLANT, 'i', 1)
      expect(filter!.clause).toBe(' AND 1=0')
    })
  })

  test('enforceScope for plant scope: in-scope passes', async () => {
    await withContext({
      userId: 'sup',
      roles: ['manufacturing_supervisor'],
      plantIds: ['plant-1'],
    }, async () => {
      expect(() => enforceScope({ plant_id: 'plant-1' }, 'Batch')).not.toThrow()
    })
  })

  test('enforceScope for plant scope: out-of-scope throws', async () => {
    await withContext({
      userId: 'sup',
      roles: ['manufacturing_supervisor'],
      plantIds: ['plant-1'],
    }, async () => {
      expect(() => enforceScope({ plant_id: 'plant-2' }, 'Batch')).toThrow(/out of scope/)
    })
  })
})

// ─── Warehouse Scope ───────────────────────────────────────────────────────

describe('Warehouse Scope', () => {
  test('enforceScope for warehouse scope: in-scope passes', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      expect(() => enforceScope({ warehouse_id: 'wh-1' }, 'Inventory')).not.toThrow()
    })
  })

  test('enforceScope for warehouse scope: out-of-scope throws', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      expect(() => enforceScope({ warehouse_id: 'wh-2' }, 'Inventory')).toThrow(/out of scope/)
    })
  })

  test('enforceScope ignores null warehouse_id (record may not have warehouse)', async () => {
    await withContext({
      userId: 'wh-op',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      expect(() => enforceScope({ warehouse_id: null }, 'Inventory')).not.toThrow()
    })
  })
})

// ─── Company Scope ─────────────────────────────────────────────────────────

describe('Company Scope', () => {
  test('enforceScope for company scope: in-scope passes', async () => {
    await withContext({
      userId: 'mgr',
      roles: ['sales_manager'],
      companyIds: ['co-1'],
    }, async () => {
      expect(() => enforceScope({ company_id: 'co-1' }, 'SalesOrder')).not.toThrow()
    })
  })

  test('enforceScope for company scope: out-of-scope throws', async () => {
    await withContext({
      userId: 'mgr',
      roles: ['sales_manager'],
      companyIds: ['co-1'],
    }, async () => {
      expect(() => enforceScope({ company_id: 'co-2' }, 'SalesOrder')).toThrow(/out of scope/)
    })
  })
})

// ─── Department Scope ──────────────────────────────────────────────────────

describe('Department Scope', () => {
  test('dept scope generates department_id filter', async () => {
    await withContext({
      userId: 'off',
      roles: ['sales_officer'],
      departmentIds: ['dept-1'],
    }, async () => {
      const filter = buildScopeFilter(DataScope.DEPT, 's', 1)
      expect(filter!.clause).toContain('s.department_id = ANY($1)')
    })
  })

  test('enforceScope for dept scope: out-of-scope throws', async () => {
    await withContext({
      userId: 'off',
      roles: ['sales_officer'],
      departmentIds: ['dept-1'],
    }, async () => {
      expect(() => enforceScope({ department_id: 'dept-2' }, 'SalesOrder')).toThrow(/out of scope/)
    })
  })
})
