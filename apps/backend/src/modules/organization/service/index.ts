/**
 * Organization Service — Business Logic Layer
 *
 * Per Phase 0 Architecture §7.2:
 *   - Business rules, validation, orchestration
 *   - No direct DB access (uses repository)
 *   - Calls workflow engine for status changes
 *   - Publishes domain events
 *   - Writes audit logs
 */

import {
  companyRepository, plantRepository,
  warehouseRepository, departmentRepository, costCenterRepository,
  financialYearRepository, hierarchyRepository,
} from '../repository'
import { workflowRegistry } from '@/core/workflow'
// Import the workflow definition to trigger registration at module load
import '@/modules/organization/workflow'
import { auditService } from '@/core/audit'
import { eventBus, EventName } from '@/core/events'
import { getRequestContext } from '@/core/context'
import {
  BusinessRuleError, NotFoundError, ConcurrencyError, ConflictError, ValidationError,
  AuthorizationError,
} from '@/core/errors'
import type { CompanyInput, PlantInput, WarehouseInput } from '../types'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

// ─── Helper: get tenant + user from context ─────────────────────────────────

function getContext() {
  const ctx = getRequestContext()
  if (!ctx || !ctx.tenantId) {
    throw new ValidationError('No tenant context available')
  }
  return { tenantId: ctx.tenantId, userId: ctx.userId, ctx }
}

// ─── Company Service ────────────────────────────────────────────────────────

export const companyService = {
  async create(input: CompanyInput) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: code must be unique within tenant
    const existing = await companyRepository.findByCode(tenantId, input.code)
    if (existing) {
      throw new ConflictError(`Company with code '${input.code}' already exists`)
    }

    // Business rule: parent must exist if specified
    if (input.parentId) {
      const parent = await companyRepository.findById(tenantId, input.parentId)
      if (!parent) {
        throw new BusinessRuleError('Parent company not found', { code: 'ORG.PARENT_NOT_FOUND' })
      }
    }

    const company = await companyRepository.create(tenantId, input, userId ?? undefined)
    if (!company) throw new Error('Failed to create company')

    // Audit log
    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'Company', entityId: String(company['id']),
      entityCode: String(company['code']), after: company,
    })

    // Domain event
    await eventBus.writeToOutbox({
      eventName: EventName.CompanyCreated,
      payload: { companyId: company['id'], code: company['code'], name: company['name'] },
      tenantId,
    })

    return company
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const company = await companyRepository.findById(tenantId, id)
    if (!company) throw new NotFoundError('Company', id)
    return company
  },

  async list(params: { page?: number; pageSize?: number; search?: string }) {
    const { tenantId } = getContext()
    return companyRepository.list(tenantId, params)
  },

  async update(id: string, input: Partial<CompanyInput>, version: number) {
    const { tenantId, userId, ctx } = getContext()

    const existing = await companyRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Company', id)

    const updated = await companyRepository.update(tenantId, id, input, version, userId ?? undefined)
    if (!updated) {
      throw new ConcurrencyError('Company was modified by another transaction')
    }

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'UPDATE', entityType: 'Company', entityId: id,
      entityCode: String(existing['code']), before: existing, after: updated,
    })

    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()

    const existing = await companyRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Company', id)

    // Business rule: cannot delete company with children
    const children = await companyRepository.getChildren(tenantId, id)
    if (children.length > 0) {
      throw new BusinessRuleError('Cannot delete company with child companies', { code: 'ORG.HAS_CHILDREN' })
    }

    const deleted = await companyRepository.softDelete(tenantId, id, version, userId ?? undefined)
    if (!deleted) {
      throw new ConcurrencyError('Company was modified by another transaction')
    }

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'DELETE', entityType: 'Company', entityId: id,
      entityCode: String(existing['code']), before: existing,
    })
  },

  async restore(id: string) {
    const { tenantId, userId, ctx } = getContext()
    const restored = await companyRepository.restore(tenantId, id)
    if (!restored) throw new NotFoundError('Company (deleted)', id)
    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'UPDATE', entityType: 'Company', entityId: id,
      entityCode: String(restored['code']), after: restored,
      reason: 'Restored from soft delete',
    })
    return restored
  },

  async hardDelete(id: string) {
    const { tenantId, userId, ctx } = getContext()
    if (!ctx.permissions.includes('system:tenant:cross')) {
      throw new AuthorizationError('Hard delete requires system administrator privileges')
    }
    await companyRepository.hardDelete(tenantId, id)
    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'DELETE', entityType: 'Company', entityId: id,
      severity: 'CRITICAL', reason: 'Hard delete (permanent)',
    })
  },

  async transition(id: string, targetStatus: string, version: number) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, ctx } = getContext()

    const existing = await companyRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Company', id)

    // Use workflow engine
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('OrganizationLifecycle')
    const check = await machine.canTransition(existing as never, targetStatus as never, {
      userId, tenantId, correlationId: ctx.correlationId,
    })
    if (!check.allowed) {
      throw new BusinessRuleError(`Status transition denied: ${check.reason}`, { code: 'ORG.TRANSITION_DENIED' })
    }

    const updated = await companyRepository.updateStatus(tenantId, id, targetStatus, version, userId ?? undefined)
    if (!updated) {
      throw new ConcurrencyError('Company was modified by another transaction')
    }

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'TRANSITION', entityType: 'Company', entityId: id,
      entityCode: String(existing['code']), before: { status: existing['status'] }, after: { status: targetStatus },
    })

    return updated
  },
}

// ─── Plant Service ──────────────────────────────────────────────────────────

export const plantService = {
  async create(input: PlantInput) {
    const { tenantId, userId, ctx } = getContext()

    const plant = await plantRepository.create(tenantId, input, userId ?? undefined)
    if (!plant) throw new Error('Failed to create plant')

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'Plant', entityId: String(plant['id']),
      entityCode: String(plant['code']), after: plant,
    })

    return plant
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const plant = await plantRepository.findById(tenantId, id)
    if (!plant) throw new NotFoundError('Plant', id)
    return plant
  },

  async list(params: { page?: number; pageSize?: number; search?: string }) {
    const { tenantId } = getContext()
    return plantRepository.list(tenantId, params)
  },

  async transition(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await plantRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Plant', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('OrganizationLifecycle')
    const check = await machine.canTransition(existing as never, targetStatus as never, {
      userId, tenantId, correlationId: ctx.correlationId,
    })
    if (!check.allowed) {
      throw new BusinessRuleError(`Status transition denied: ${check.reason}`, { code: 'ORG.TRANSITION_DENIED' })
    }

    const updated = await plantRepository.updateStatus(tenantId, id, targetStatus, version, userId ?? undefined)
    if (!updated) throw new ConcurrencyError('Plant was modified by another transaction')

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'TRANSITION', entityType: 'Plant', entityId: id,
      entityCode: String(existing['code']), before: { status: existing['status'] }, after: { status: targetStatus },
    })

    // Domain event for plant activation
    if (targetStatus === 'ACTIVE') {
      await eventBus.writeToOutbox({
        eventName: EventName.PlantActivated,
        payload: { plantId: id, plantCode: existing['code'] },
        tenantId,
      })
    }

    return updated
  },
}

// ─── Warehouse Service ──────────────────────────────────────────────────────

export const warehouseService = {
  async create(input: WarehouseInput) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: only one default warehouse per plant
    if (input.isDefault) {
      const existing = await warehouseRepository.list(tenantId, { filter: { plantId: input.plantId }, pageSize: 200 })
      for (const wh of existing.rows) {
        if (wh['is_default']) {
          throw new BusinessRuleError('Plant already has a default warehouse', { code: 'ORG.DEFAULT_WAREHOUSE_EXISTS' })
        }
      }
    }

    const warehouse = await warehouseRepository.create(tenantId, input, userId ?? undefined)
    if (!warehouse) throw new Error('Failed to create warehouse')

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'Warehouse', entityId: String(warehouse['id']),
      entityCode: String(warehouse['code']), after: warehouse,
    })

    return warehouse
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const warehouse = await warehouseRepository.findById(tenantId, id)
    if (!warehouse) throw new NotFoundError('Warehouse', id)
    return warehouse
  },

  async list(params: { page?: number; pageSize?: number; search?: string; plantId?: string }) {
    const { tenantId } = getContext()
    return warehouseRepository.list(tenantId, { ...params, filter: params.plantId ? { plantId: params.plantId } : undefined })
  },
}

// ─── Department Service ─────────────────────────────────────────────────────

export const departmentService = {
  async create(input: Parameters<typeof departmentRepository.create>[1]) {
    const { tenantId, userId, ctx } = getContext()
    const dept = await departmentRepository.create(tenantId, input, userId ?? undefined)
    if (!dept) throw new Error('Failed to create department')
    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'Department', entityId: String(dept['id']),
      entityCode: String(dept['code']), after: dept,
    })
    return dept
  },

  async list(params: { page?: number; pageSize?: number; search?: string }) {
    const { tenantId } = getContext()
    return departmentRepository.list(tenantId, params)
  },
}

// ─── Cost Center Service ────────────────────────────────────────────────────

export const costCenterService = {
  async create(input: Parameters<typeof costCenterRepository.create>[1]) {
    const { tenantId, userId, ctx } = getContext()
    const cc = await costCenterRepository.create(tenantId, input, userId ?? undefined)
    if (!cc) throw new Error('Failed to create cost center')
    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'CostCenter', entityId: String(cc['id']),
      entityCode: String(cc['code']), after: cc,
    })
    return cc
  },

  async list(params: { page?: number; pageSize?: number; search?: string }) {
    const { tenantId } = getContext()
    return costCenterRepository.list(tenantId, params)
  },
}

// ─── Financial Year Service ─────────────────────────────────────────────────

export const financialYearService = {
  async create(input: Parameters<typeof financialYearRepository.create>[1]) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: end date must be after start date
    if (new Date(input.endDate) <= new Date(input.startDate)) {
      throw new BusinessRuleError('End date must be after start date', { code: 'ORG.FY_INVALID_DATES' })
    }

    // Business rule: no overlapping financial years
    const existing = await financialYearRepository.list(tenantId, { pageSize: 100 })
    const newStart = new Date(input.startDate)
    const newEnd = new Date(input.endDate)
    for (const fy of existing.rows) {
      const fyStart = new Date(fy['start_date'] as string)
      const fyEnd = new Date(fy['end_date'] as string)
      if (newStart < fyEnd && newEnd > fyStart) {
        throw new ConflictError(`Financial year overlaps with existing: ${fy['code']}`)
      }
    }

    const fy = await financialYearRepository.create(tenantId, input, userId ?? undefined)
    if (!fy) throw new Error('Failed to create financial year')

    await auditService.log({
      tenantId, correlationId: ctx.correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'FinancialYear', entityId: String(fy['id']),
      entityCode: String(fy['code']), after: fy,
    })

    return fy
  },

  async list(params: { page?: number; pageSize?: number }) {
    const { tenantId } = getContext()
    return financialYearRepository.list(tenantId, params)
  },

  async getCurrent() {
    const { tenantId } = getContext()
    return financialYearRepository.findCurrent(tenantId)
  },
}

// ─── Hierarchy Service ──────────────────────────────────────────────────────

export const hierarchyService = {
  async getTree() {
    const { tenantId } = getContext()
    return hierarchyRepository.getFullTree(tenantId)
  },
}
