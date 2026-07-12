#!/usr/bin/env python3
"""
SUOP ERP — RC1 Fix Pack 1: Route Generator
Generates full CRUD + transition routes for all 22 stub modules.
Reuses the existing permission model; adds POST/PUT/DELETE/transition endpoints.
"""

from pathlib import Path

ROOT = Path("/home/z/my-project")

# (module, ServiceName, RoutesName, read_perm, write_perm)
# Reuse existing permissions since Fix Pack 1 does not add new permission scopes.
MODULES = [
    ("accounts-payable", "AccountsPayableService", "AccountsPayableRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("accounts-receivable", "AccountsReceivableService", "AccountsReceivableRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("product-costing", "ProductCostingService", "ProductCostingRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("general-ledger", "GeneralLedgerService", "GeneralLedgerRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("gst-taxation", "GstTaxationService", "GstTaxationRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("employee-master", "EmployeeMasterService", "EmployeeMasterRoutes", "ORG_READ", "ORG_UPDATE"),
    ("attendance-shift", "AttendanceShiftService", "AttendanceShiftRoutes", "ORG_READ", "ORG_UPDATE"),
    ("leave-management", "LeaveManagementService", "LeaveManagementRoutes", "ORG_READ", "ORG_UPDATE"),
    ("payroll-processing", "PayrollProcessingService", "PayrollProcessingRoutes", "ORG_READ", "ORG_UPDATE"),
    ("recruitment-onboarding", "RecruitmentOnboardingService", "RecruitmentOnboardingRoutes", "ORG_READ", "ORG_UPDATE"),
    ("performance-management", "PerformanceManagementService", "PerformanceManagementRoutes", "ORG_READ", "ORG_UPDATE"),
    ("crm-foundation", "CrmFoundationService", "CrmFoundationRoutes", "CUSTOMER_READ", "CUSTOMER_UPDATE"),
    ("lead-opportunity", "LeadOpportunityService", "LeadOpportunityRoutes", "CUSTOMER_READ", "CUSTOMER_UPDATE"),
    ("customer-service", "CustomerServiceService", "CustomerServiceRoutes", "CUSTOMER_READ", "CUSTOMER_UPDATE"),
    ("complaint-management", "ComplaintManagementService", "ComplaintManagementRoutes", "CUSTOMER_READ", "CUSTOMER_UPDATE"),
    ("after-sales-service", "AfterSalesServiceService", "AfterSalesServiceRoutes", "CUSTOMER_READ", "CUSTOMER_UPDATE"),
    ("customer-portal", "CustomerPortalService", "CustomerPortalRoutes", "CUSTOMER_READ", "CUSTOMER_UPDATE"),
    ("bi-foundation", "BiFoundationService", "BiFoundationRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("executive-dashboards", "ExecutiveDashboardsService", "ExecutiveDashboardsRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("ai-prediction", "AiPredictionService", "AiPredictionRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("reporting-platform", "ReportingPlatformService", "ReportingPlatformRoutes", "AUDIT_READ", "AUDIT_READ"),
    ("alerts-kpi-engine", "AlertsKpiEngineService", "AlertsKpiEngineRoutes", "AUDIT_READ", "AUDIT_READ"),
]


ROUTE_TEMPLATE = '''/**
 * __ROUTES_NAME__ — Full CRUD + workflow transition routes
 *
 * RC1 Fix Pack 1: Extended from stub (GET only) to full CRUD.
 *
 * Endpoints:
 *   GET    /                  List with pagination/filter/search
 *   GET    /:id               Get by ID
 *   POST   /                  Create (audit + event emitted by service)
 *   PUT    /:id               Update (optimistic concurrency via version)
 *   DELETE /:id               Soft-delete (deleted_at, deleted_by)
 *   POST   /:id/transition    Workflow state transition
 *   GET    /count             Count by status
 *   GET    /exists/:code      Check existence by code field
 */

import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { __SERVICE__ } from '../service'

export const __ROUTES_NAME__ = new Hono()

const READ_PERM = Permission.__READ_PERM__
const WRITE_PERM = Permission.__WRITE_PERM__

// ─── LIST ────────────────────────────────────────────────────────────────────
__ROUTES_NAME__.get('/', requirePermission(READ_PERM), async (c) => {
  const r = await __SERVICE__.list({
    page: Number(c.req.query('page') ?? 1),
    pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined,
    search: c.req.query('search') ?? undefined,
  })
  return c.json(paginated(r.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: r.page,
    pageSize: r.pageSize,
    total: r.total,
  }))
})

// ─── COUNT ───────────────────────────────────────────────────────────────────
__ROUTES_NAME__.get('/count', requirePermission(READ_PERM), async (c) => {
  const total = await __SERVICE__.count({
    status: c.req.query('status') ?? undefined,
  })
  return c.json(success({ total }))
})

// ─── EXISTS BY CODE ──────────────────────────────────────────────────────────
__ROUTES_NAME__.get('/exists/:code', requirePermission(READ_PERM), async (c) => {
  const exists = await __SERVICE__.existsByCode(c.req.param('code')!)
  return c.json(success({ exists }))
})

// ─── GET BY ID ───────────────────────────────────────────────────────────────
__ROUTES_NAME__.get('/:id', requirePermission(READ_PERM), async (c) => {
  const item = await __SERVICE__.getById(c.req.param('id')!)
  return c.json(success(item))
})

// ─── CREATE ──────────────────────────────────────────────────────────────────
__ROUTES_NAME__.post('/', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await __SERVICE__.create(body)
  return c.json(success(result), 201)
})

// ─── UPDATE ──────────────────────────────────────────────────────────────────
__ROUTES_NAME__.put('/:id', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await __SERVICE__.update(c.req.param('id')!, body)
  return c.json(success(result))
})

// ─── DELETE (soft) ───────────────────────────────────────────────────────────
__ROUTES_NAME__.delete('/:id', requirePermission(WRITE_PERM), async (c) => {
  const reason = c.req.query('reason') ?? undefined
  await __SERVICE__.delete(c.req.param('id')!, reason)
  return c.json(success({ id: c.req.param('id')!, deleted: true }))
})

// ─── TRANSITION (workflow) ───────────────────────────────────────────────────
__ROUTES_NAME__.post('/:id/transition', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await __SERVICE__.transition(
    c.req.param('id')!,
    body.targetState,
    body.reason,
  )
  return c.json(success(result))
})
'''


def main():
    out_dir = ROOT / "scripts" / "rc1" / "generated_routes"
    out_dir.mkdir(parents=True, exist_ok=True)
    modules_dir = ROOT / "apps" / "backend" / "src" / "modules"

    for module, service, routes, read_perm, write_perm in MODULES:
        text = ROUTE_TEMPLATE
        text = text.replace("__ROUTES_NAME__", routes)
        text = text.replace("__SERVICE__", service)
        text = text.replace("__READ_PERM__", read_perm)
        text = text.replace("__WRITE_PERM__", write_perm)
        (out_dir / f"{module}.ts").write_text(text)
        dst = modules_dir / module / "routes" / "index.ts"
        dst.write_text(text)
        print(f"  ✓ Installed: apps/backend/src/modules/{module}/routes/index.ts")

    print(f"\n✓ Installed {len(MODULES)} route files")


if __name__ == "__main__":
    main()
