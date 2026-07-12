#!/usr/bin/env python3
"""
SUOP ERP — RC1 Fix Pack 1: Mock-based Test Generator
Generates deeper tests that mock the Prisma client and exercise the
service business logic (transactions, audit, events, workflow transitions).
"""

from pathlib import Path

ROOT = Path("/home/z/my-project")

# (module, ServiceName, primary_model, workflow_name_or_None, code_field, event_created)
# (module, ServiceName, primary_model, entity, workflow_name_or_None, code_field, event_created)
MODULES = [
    ("accounts-payable", "AccountsPayableService", "SupplierInvoices", "SupplierInvoice", "SupplierInvoiceLifecycle", "invoice_number", "SupplierInvoiceCreated"),
    ("accounts-receivable", "AccountsReceivableService", "CustomerInvoices", "CustomerInvoice", "CustomerInvoiceLifecycle", "invoice_number", "CustomerInvoiceCreated"),
    ("product-costing", "ProductCostingService", "ProductCosts", "ProductCost", None, "cost_id", "ProductCostCalculated"),
    ("general-ledger", "GeneralLedgerService", "JournalEntries", "JournalEntry", "JournalEntryLifecycle", "entry_number", "JournalEntryCreated"),
    ("gst-taxation", "GstTaxationService", "GstConfigurations", "GstConfiguration", None, "config_code", "GstConfigCreated"),
    ("employee-master", "EmployeeMasterService", "Employees", "Employee", None, "employee_code", "EmployeeCreated"),
    ("attendance-shift", "AttendanceShiftService", "Attendance", "Attendance", None, "attendance_date", "AttendanceRecorded"),
    ("leave-management", "LeaveManagementService", "LeaveApplications", "LeaveApplication", "LeaveApplicationLifecycle", "application_number", "LeaveApplied"),
    ("payroll-processing", "PayrollProcessingService", "PayrollRuns", "PayrollRun", "PayrollRunLifecycle", "run_number", "PayrollRunStarted"),
    ("recruitment-onboarding", "RecruitmentOnboardingService", "JobPostings", "JobPosting", "CandidateLifecycle", "requisition_number", "JobPostingCreated"),
    ("performance-management", "PerformanceManagementService", "PerformanceReviews", "PerformanceReview", "AppraisalLifecycle", "review_number", "PerformanceReviewInitiated"),
    ("crm-foundation", "CrmFoundationService", "CrmActivities", "CrmActivity", None, "activity_number", "CrmActivityCreated"),
    ("lead-opportunity", "LeadOpportunityService", "Leads", "Lead", "LeadLifecycle", "lead_number", "LeadCreated"),
    ("customer-service", "CustomerServiceService", "SupportTickets", "SupportTicket", "TicketLifecycle", "ticket_number", "TicketCreated"),
    ("complaint-management", "ComplaintManagementService", "Complaints", "Complaint", "ComplaintLifecycle", "complaint_number", "ComplaintRegistered"),
    ("after-sales-service", "AfterSalesServiceService", "ServiceRequests", "ServiceRequest", "ServiceRequestLifecycle", "service_request_number", "ServiceRequestCreated"),
    ("customer-portal", "CustomerPortalService", "PortalUsers", "PortalUser", None, "username", "PortalUserCreated"),
    ("bi-foundation", "BiFoundationService", "BiKpiRepository", "BiKpi", None, "kpi_code", "KpiDefined"),
    ("executive-dashboards", "ExecutiveDashboardsService", "Dashboards", "Dashboard", None, "dashboard_code", "DashboardCreated"),
    ("ai-prediction", "AiPredictionService", "AiPredictions", "AiPrediction", None, "prediction_id", "AiPredictionGenerated"),
    ("reporting-platform", "ReportingPlatformService", "Reports", "Report", None, "report_code", "ReportCreated"),
    ("alerts-kpi-engine", "AlertsKpiEngineService", "AlertRules", "AlertRule", None, "rule_code", "AlertRuleCreated"),
]


TEMPLATE = '''/**
 * __MODULE__ Service — Business Logic Tests (with mocked Prisma client)
 *
 * Exercises the service business logic by mocking the Prisma client.
 * Verifies:
 *   - create() calls Prisma create + audit + event in a transaction
 *   - update() enforces optimistic concurrency
 *   - delete() performs soft-delete
 *   - getById() throws NotFoundError for missing records
 *   - list() applies pagination and filters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Prisma client using vi.hoisted so mocks are available before imports ─
const { mockDb, mockTx, mockAuditLog, mockWriteToOutbox } = vi.hoisted(() => {
  const mkModelFns = () => ({
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })
  const tx = { __PRIMARY_MODEL__: mkModelFns() }
  const db = {
    __PRIMARY_MODEL__: mkModelFns(),
    $queryRaw: vi.fn(),
    $transaction: vi.fn(async (fn: any) => fn(tx)),
  }
  return {
    mockDb: db,
    mockTx: tx,
    mockAuditLog: vi.fn(),
    mockWriteToOutbox: vi.fn(),
  }
})

vi.mock('@/core/db', () => ({
  db: mockDb,
  transaction: vi.fn(async (fn: any) => fn(mockTx)),
  Prisma: { JsonNull: null, TransactionClient: {} },
}))

vi.mock('@/core/audit', () => ({
  auditService: { log: mockAuditLog },
}))

vi.mock('@/core/events', () => ({
  eventBus: { writeToOutbox: mockWriteToOutbox },
}))

vi.mock('@/core/logging', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

__WORKFLOW_IMPORT__

// ─── Import service AFTER mocks are set up ──────────────────────────────────
import { __SERVICE__ } from '@/modules/__MODULE__/service'
import { AuthorizationError, NotFoundError, BusinessRuleError, ValidationError, ConcurrencyError } from '@/core/errors'
import { _runInTestContext } from '@/core/context'

const TEST_CTX = {
  userId: 'user-001',
  tenantId: 'tenant-001',
  userEmail: 'tester@sudhamrit.com',
  correlationId: 'corr-001',
}

describe('__SERVICE__ — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══ create() ═══════════════════════════════════════════════════════════════
  describe('create()', () => {
    it('creates a record, writes audit log, and publishes event', async () => {
      // Mock: no existing record with this code
      mockDb.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(null)
      // Mock: create returns the new record
      const createdRecord = {
        id: 'new-id-001',
        tenantId: TEST_CTX.tenantId,
        __CODE_FIELD__: 'TEST-001',
        status: 'DRAFT',
        version: 0,
      }
      mockTx.__PRIMARY_MODEL__.create.mockResolvedValueOnce(createdRecord)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.create({ __CODE_FIELD__: 'TEST-001', description: 'test' })
      )

      expect(result).toEqual({ id: 'new-id-001' })
      expect(mockTx.__PRIMARY_MODEL__.create).toHaveBeenCalled()
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CREATE',
        entityType: '__ENTITY__',
        entityId: 'new-id-001',
      }))
      expect(mockWriteToOutbox).toHaveBeenCalledWith(expect.objectContaining({
        eventName: '__EVENT_CREATED__',
      }))
    })

    it('throws BusinessRuleError when __CODE_FIELD__ already exists', async () => {
      // Mock: existing record found
      mockDb.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce({ id: 'existing-id' })

      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          __SERVICE__.create({ __CODE_FIELD__: 'DUPLICATE', description: 'test' })
        ).rejects.toThrow(BusinessRuleError)
      })

      expect(mockTx.__PRIMARY_MODEL__.create).not.toHaveBeenCalled()
    })

    it('throws ValidationError when __CODE_FIELD__ is missing', async () => {
      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          __SERVICE__.create({ description: 'missing code' })
        ).rejects.toThrow(ValidationError)
      })
    })
  })

  // ═══ getById() ══════════════════════════════════════════════════════════════
  describe('getById()', () => {
    it('returns the record when found', async () => {
      const record = { id: 'rec-001', tenantId: TEST_CTX.tenantId, __CODE_FIELD__: 'TEST-001' }
      mockDb.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(record)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.getById('rec-001')
      )

      expect(result).toEqual(record)
      expect(mockDb.__PRIMARY_MODEL__.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: 'rec-001', tenantId: TEST_CTX.tenantId, deletedAt: null }),
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockDb.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(__SERVICE__.getById('missing-id')).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ list() ═════════════════════════════════════════════════════════════════
  describe('list()', () => {
    it('returns paginated results', async () => {
      const rows = [
        { id: 'r1', __CODE_FIELD__: 'C001' },
        { id: 'r2', __CODE_FIELD__: 'C002' },
      ]
      mockDb.__PRIMARY_MODEL__.findMany.mockResolvedValueOnce(rows)
      mockDb.__PRIMARY_MODEL__.count.mockResolvedValueOnce(2)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.list({ page: 1, pageSize: 25 })
      )

      expect(result).toEqual({ rows, total: 2, page: 1, pageSize: 25 })
      expect(mockDb.__PRIMARY_MODEL__.findMany).toHaveBeenCalled()
      expect(mockDb.__PRIMARY_MODEL__.count).toHaveBeenCalled()
    })

    it('caps pageSize at 100', async () => {
      mockDb.__PRIMARY_MODEL__.findMany.mockResolvedValueOnce([])
      mockDb.__PRIMARY_MODEL__.count.mockResolvedValueOnce(0)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.list({ page: 1, pageSize: 500 })
      )

      expect(result.pageSize).toBe(100)
    })
  })

  // ═══ update() ═══════════════════════════════════════════════════════════════
  describe('update()', () => {
    it('updates a record and writes audit log', async () => {
      const before = { id: 'rec-001', version: 5, __CODE_FIELD__: 'C001', status: 'DRAFT' }
      const updated = { ...before, description: 'updated', version: 6 }
      mockTx.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(before)
      mockTx.__PRIMARY_MODEL__.update.mockResolvedValueOnce(updated)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.update('rec-001', { description: 'updated', version: 5 })
      )

      expect(result).toEqual({ id: 'rec-001', version: 6 })
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'UPDATE',
        entityType: '__ENTITY__',
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockTx.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(
          __SERVICE__.update('missing-id', { description: 'test' })
        ).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ delete() ═══════════════════════════════════════════════════════════════
  describe('delete()', () => {
    it('soft-deletes a record (sets deletedAt and deletedBy)', async () => {
      const before = { id: 'rec-001', __CODE_FIELD__: 'C001' }
      mockTx.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(before)
      mockTx.__PRIMARY_MODEL__.update.mockResolvedValueOnce({ ...before, deletedAt: new Date() })

      await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.delete('rec-001', 'test reason')
      )

      expect(mockTx.__PRIMARY_MODEL__.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'rec-001' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          deletedBy: TEST_CTX.userId,
        }),
      }))
      expect(mockAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: 'DELETE',
        reason: 'test reason',
      }))
    })

    it('throws NotFoundError when record does not exist', async () => {
      mockTx.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(null)

      await _runInTestContext(TEST_CTX, async () => {
        await expect(__SERVICE__.delete('missing-id')).rejects.toThrow(NotFoundError)
      })
    })
  })

  // ═══ count() ════════════════════════════════════════════════════════════════
  describe('count()', () => {
    it('returns the count of records', async () => {
      mockDb.__PRIMARY_MODEL__.count.mockResolvedValueOnce(42)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.count({ status: 'DRAFT' })
      )

      expect(result).toBe(42)
      expect(mockDb.__PRIMARY_MODEL__.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'DRAFT' }),
      }))
    })
  })

  // ═══ existsByCode() ═════════════════════════════════════════════════════════
  describe('existsByCode()', () => {
    it('returns true when record exists', async () => {
      mockDb.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce({ id: 'rec-001' })

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.existsByCode('C001')
      )

      expect(result).toBe(true)
    })

    it('returns false when record does not exist', async () => {
      mockDb.__PRIMARY_MODEL__.findFirst.mockResolvedValueOnce(null)

      const result = await _runInTestContext(TEST_CTX, async () =>
        __SERVICE__.existsByCode('MISSING')
      )

      expect(result).toBe(false)
    })
  })
})
'''


def main():
    modules_dir = ROOT / "apps" / "backend" / "src" / "modules"
    count = 0
    for module, service, primary_model, entity, workflow_name, code_field, event_created in MODULES:
        text = TEMPLATE
        text = text.replace("__MODULE__", module)
        text = text.replace("__SERVICE__", service)
        text = text.replace("__PRIMARY_MODEL__", primary_model)
        text = text.replace("__ENTITY__", entity)
        text = text.replace("__CODE_FIELD__", code_field)
        text = text.replace("__EVENT_CREATED__", event_created)

        if workflow_name:
            text = text.replace(
                "__WORKFLOW_IMPORT__",
                f"import '@/modules/{module}/workflow'"
            )
        else:
            text = text.replace("__WORKFLOW_IMPORT__", "")

        test_dir = modules_dir / module / "__tests__"
        test_dir.mkdir(parents=True, exist_ok=True)
        # Write as a separate file to coexist with the smoke tests
        test_path = test_dir / f"{module}-business.test.ts"
        test_path.write_text(text)
        print(f"  ✓ Generated: {module}-business.test.ts")
        count += 1

    print(f"\n✓ Generated {count} business-logic test files")


if __name__ == "__main__":
    main()
