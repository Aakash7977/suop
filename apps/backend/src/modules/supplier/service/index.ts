/** Supplier Service — Business logic for Supplier Master */
import {
  supplierRepository, supplierContactRepository, supplierAddressRepository,
  supplierComplianceRepository, supplierProductMappingRepository, supplierCategoryRepository,
} from '../repository'
import '@/modules/supplier/workflow'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, ConflictError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { query } from '@/core/db/pglite'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const supplierService = {
  async create(data: Record<string, unknown>) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: vendor code must be unique
    const existing = await supplierRepository.findByVendorCode(tenantId, String(data['vendorCode']))
    if (existing) throw new ConflictError(`Supplier with vendor code '${data['vendorCode']}' already exists`)

    // Business rule: GSTIN must be unique (if provided)
    if (data['gstin']) {
      const existingGstin = await supplierRepository.findByGstin(String(data['gstin']))
      if (existingGstin) throw new ConflictError(`Supplier with GSTIN '${data['gstin']}' already exists`)
    }

    // Business rule: GSTIN format validation
    if (data['gstin'] && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(String(data['gstin']))) {
      throw new BusinessRuleError('Invalid GSTIN format', { code: 'SUPPLIER.INVALID_GSTIN' })
    }

    // Business rule: PAN format validation
    if (data['pan'] && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(data['pan']))) {
      throw new BusinessRuleError('Invalid PAN format', { code: 'SUPPLIER.INVALID_PAN' })
    }

    const supplier = await supplierRepository.create({ ...data, tenantId })
    if (!supplier) throw new Error('Failed to create supplier')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Supplier', entityId: String(supplier['id']), entityCode: String(supplier['vendor_code']), after: supplier })
    await eventBus.writeToOutbox({ eventName: 'SupplierCreated', payload: { supplierId: String(supplier['id']), vendorCode: String(supplier['vendor_code']), name: String(supplier['legal_name']) }, tenantId })

    return supplier
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const supplier = await supplierRepository.findById(tenantId, id)
    if (!supplier) throw new NotFoundError('Supplier', id)
    const [contacts, addresses, compliances, products] = await Promise.all([
      supplierContactRepository.listForSupplier(tenantId, id),
      supplierAddressRepository.listForSupplier(tenantId, id),
      supplierComplianceRepository.listForSupplier(tenantId, id),
      supplierProductMappingRepository.listForSupplier(tenantId, id),
    ])
    return { ...supplier, contacts, addresses, compliances, products }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; vendorType?: string; categoryId?: string; isPreferred?: boolean } = {}) {
    const { tenantId } = getContext()
    return supplierRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await supplierRepository.findById(tenantId, id)
    // Maker-Checker: cannot approve own supplier (SoD-04)
    if (targetStatus === 'APPROVED' || targetStatus === 'ACTIVE') {
      const { enforceMakerChecker } = await import('@/core/security/sod-enforcement')
      enforceMakerChecker(existing?.['created_by'] as string, 'approve', 'Supplier')
    }

    if (!existing) throw new NotFoundError('Supplier', id)
    // Business rule: cannot modify blacklisted supplier
    if (existing['status'] === 'BLACKLISTED') throw new BusinessRuleError('Cannot modify a blacklisted supplier', { code: 'SUPPLIER.BLACKLISTED' })
    const updated = await supplierRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('Supplier was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Supplier', entityId: id, entityCode: String(existing['vendor_code']), before: existing, after: updated })
    await eventBus.writeToOutbox({ eventName: 'SupplierUpdated', payload: { supplierId: id }, tenantId })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await supplierRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Supplier', id)
    if (existing['status'] === 'ACTIVE') throw new BusinessRuleError('Cannot delete an active supplier. Block or archive first.', { code: 'SUPPLIER.ACTIVE_DELETE' })
    const deleted = await supplierRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('Supplier was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'Supplier', entityId: id, entityCode: String(existing['vendor_code']), before: existing })
  },

  async transition(id: string, targetStatus: string, version: number) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, ctx } = getContext()
    const existing = await supplierRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Supplier', id)
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('SupplierLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Status transition denied: ${check.reason}`, { code: 'SUPPLIER.TRANSITION_DENIED' })
    const updated = await supplierRepository.updateStatus(tenantId, id, targetStatus, version, userId)
    if (!updated) throw new ConcurrencyError('Supplier was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'Supplier', entityId: id, entityCode: String(existing['vendor_code']), before: { status: existing['status'] }, after: { status: targetStatus } })
    if (targetStatus === 'APPROVED') await eventBus.writeToOutbox({ eventName: 'SupplierApproved', payload: { supplierId: id }, tenantId })
    if (targetStatus === 'BLOCKED') await eventBus.writeToOutbox({ eventName: 'SupplierBlocked', payload: { supplierId: id }, tenantId })
    return updated
  },

  async blacklist(id: string, reason: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await supplierRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Supplier', id)
    if (existing['status'] === 'BLACKLISTED') throw new BusinessRuleError('Supplier is already blacklisted', { code: 'SUPPLIER.ALREADY_BLACKLISTED' })
    await supplierRepository.blacklist(tenantId, id, reason, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'Supplier', entityId: id, entityCode: String(existing['vendor_code']), severity: 'CRITICAL', reason: `Blacklisted: ${reason}` })
    await eventBus.writeToOutbox({ eventName: 'SupplierBlacklisted', payload: { supplierId: id, reason }, tenantId })
  },

  async addContact(supplierId: string, data: { name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const supplier = await supplierRepository.findById(tenantId, supplierId)
    if (!supplier) throw new NotFoundError('Supplier', supplierId)
    const id = await supplierContactRepository.create({ tenantId, supplierId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SupplierContact', entityId: id, reason: `Contact added to ${supplier['vendor_code']}` })
    return id
  },

  async addAddress(supplierId: string, data: { addressType: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const supplier = await supplierRepository.findById(tenantId, supplierId)
    if (!supplier) throw new NotFoundError('Supplier', supplierId)
    const id = await supplierAddressRepository.create({ tenantId, supplierId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SupplierAddress', entityId: id, reason: `Address added to ${supplier['vendor_code']}` })
    return id
  },

  async addCompliance(supplierId: string, data: { complianceType: string; licenseNumber?: string; issuingAuthority?: string; issuedDate?: string; expiryDate?: string; documentUrl?: string; notes?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const supplier = await supplierRepository.findById(tenantId, supplierId)
    if (!supplier) throw new NotFoundError('Supplier', supplierId)
    const id = await supplierComplianceRepository.create({ tenantId, supplierId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SupplierCompliance', entityId: id, reason: `Compliance ${data.complianceType} added to ${supplier['vendor_code']}` })
    return id
  },

  async assignProduct(supplierId: string, data: { productId: string; supplierSku?: string; unitPrice?: number; moq?: number; leadTimeDays?: number; isPreferred?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const supplier = await supplierRepository.findById(tenantId, supplierId)
    if (!supplier) throw new NotFoundError('Supplier', supplierId)
    // Business rule: if isPreferred, revoke previous preferred for same product
    if (data.isPreferred) {
      const existing = await query(`SELECT id FROM supplier_product_mappings WHERE tenant_id = $1 AND product_id = $2 AND is_preferred = true AND status = 'ACTIVE'`, [tenantId, data.productId])
      for (const row of existing.rows) {
        await supplierProductMappingRepository.revoke(String(row['id']))
      }
    }
    const id = await supplierProductMappingRepository.create({ tenantId, supplierId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SupplierProductMapping', entityId: id, reason: `Product assigned to ${supplier['vendor_code']}` })
    return id
  },

  async lookupByGstin(gstin: string) {
    const { tenantId } = getContext()
    const result = await query(`SELECT * FROM suppliers WHERE tenant_id = $1 AND gstin = $2 AND deleted_at IS NULL`, [tenantId, gstin])
    return result.rows[0] ?? null
  },
}

export const supplierCategoryService = {
  async list() { const { tenantId } = getContext(); return supplierCategoryRepository.list(tenantId) },
  async create(data: { code: string; name: string; description?: string; supplierType?: string; vendorType?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await supplierCategoryRepository.create({ tenantId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SupplierCategory', entityId: id, entityCode: data.code })
    return id
  },
}
