/** Customer Service — Business logic for Customer Master */
import { customerRepository, customerContactRepository, customerAddressRepository, customerGroupRepository } from '../repository'
import '@/modules/customer/workflow'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, ConflictError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const customerService = {
  async create(data: Record<string, unknown>) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: customer code must be unique
    const existing = await customerRepository.findByCode(tenantId, String(data['customerCode']))
    if (existing) throw new ConflictError(`Customer with code '${data['customerCode']}' already exists`)

    // Business rule: GSTIN must be unique (if provided)
    if (data['gstin']) {
      const existingGstin = await customerRepository.findByGstin(String(data['gstin']))
      if (existingGstin) throw new ConflictError(`Customer with GSTIN '${data['gstin']}' already exists`)
    }

    // Business rule: GSTIN format validation
    if (data['gstin'] && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(String(data['gstin']))) {
      throw new BusinessRuleError('Invalid GSTIN format', { code: 'CUSTOMER.INVALID_GSTIN' })
    }

    // Business rule: PAN format validation
    if (data['pan'] && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(data['pan']))) {
      throw new BusinessRuleError('Invalid PAN format', { code: 'CUSTOMER.INVALID_PAN' })
    }

    // Business rule: credit limit must be non-negative
    if (data['creditLimit'] !== undefined && Number(data['creditLimit']) < 0) {
      throw new BusinessRuleError('Credit limit cannot be negative', { code: 'CUSTOMER.NEGATIVE_CREDIT' })
    }

    const customer = await customerRepository.create({ ...data, tenantId })
    if (!customer) throw new Error('Failed to create customer')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Customer', entityId: String(customer['id']), entityCode: String(customer['customer_code']), after: customer })
    await eventBus.writeToOutbox({ eventName: 'CustomerCreated', payload: { customerId: String(customer['id']), code: String(customer['customer_code']), name: String(customer['trade_name']) }, tenantId })

    return customer
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const customer = await customerRepository.findById(tenantId, id)
    if (!customer) throw new NotFoundError('Customer', id)
    const [contacts, addresses] = await Promise.all([
      customerContactRepository.listForCustomer(tenantId, id),
      customerAddressRepository.listForCustomer(tenantId, id),
    ])
    return { ...customer, contacts, addresses }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; customerType?: string; groupId?: string; creditHold?: boolean } = {}) {
    const { tenantId } = getContext()
    return customerRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await customerRepository.findById(tenantId, id)
    // Phase 1.6: Removed dead `targetStatus` reference — maker-checker is enforced
    // in the transition() method where targetStatus is actually defined.
    if (!existing) throw new NotFoundError('Customer', id)
    // Business rule: cannot modify blocked customer
    if (existing['status'] === 'BLOCKED' && data['status'] !== 'ACTIVE') {
      throw new BusinessRuleError('Cannot modify a blocked customer. Unblock first.', { code: 'CUSTOMER.BLOCKED' })
    }
    const updated = await customerRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('Customer was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Customer', entityId: id, entityCode: String(existing['customer_code']), before: existing, after: updated })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await customerRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Customer', id)
    // Business rule: cannot delete active customer
    if (existing['status'] === 'ACTIVE') throw new BusinessRuleError('Cannot delete an active customer. Block or archive first.', { code: 'CUSTOMER.ACTIVE_DELETE' })
    // Business rule: cannot delete customer with outstanding balance
    if (Number(existing['outstanding_balance'] ?? 0) > 0) throw new BusinessRuleError('Cannot delete customer with outstanding balance', { code: 'CUSTOMER.OUTSTANDING_BALANCE' })
    const deleted = await customerRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('Customer was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'Customer', entityId: id, entityCode: String(existing['customer_code']), before: existing })
  },

  async transition(id: string, targetStatus: string, version: number) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, ctx } = getContext()
    const existing = await customerRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Customer', id)
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('CustomerLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Status transition denied: ${check.reason}`, { code: 'CUSTOMER.TRANSITION_DENIED' })
    const updated = await customerRepository.updateStatus(tenantId, id, targetStatus, version, userId)
    if (!updated) throw new ConcurrencyError('Customer was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'Customer', entityId: id, entityCode: String(existing['customer_code']), before: { status: existing['status'] }, after: { status: targetStatus } })
    if (targetStatus === 'APPROVED') await eventBus.writeToOutbox({ eventName: 'CustomerApproved', payload: { customerId: id }, tenantId })
    if (targetStatus === 'BLOCKED') await eventBus.writeToOutbox({ eventName: 'CustomerBlocked', payload: { customerId: id }, tenantId })
    if (targetStatus === 'ARCHIVED') await eventBus.writeToOutbox({ eventName: 'CustomerArchived', payload: { customerId: id }, tenantId })
    return updated
  },

  async addContact(customerId: string, data: { name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const customer = await customerRepository.findById(tenantId, customerId)
    if (!customer) throw new NotFoundError('Customer', customerId)
    const id = await customerContactRepository.create({ tenantId, customerId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'CustomerContact', entityId: id, reason: `Contact added to ${customer['customer_code']}` })
    return id
  },

  async addAddress(customerId: string, data: { addressType: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const customer = await customerRepository.findById(tenantId, customerId)
    if (!customer) throw new NotFoundError('Customer', customerId)
    const id = await customerAddressRepository.create({ tenantId, customerId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'CustomerAddress', entityId: id, reason: `Address added to ${customer['customer_code']}` })
    return id
  },

  async getCreditStatus(id: string) {
    const { tenantId } = getContext()
    const customer = await customerRepository.findById(tenantId, id)
    if (!customer) throw new NotFoundError('Customer', id)
    return {
      customerId: id,
      customerCode: String(customer['customer_code']),
      tradeName: String(customer['trade_name']),
      creditLimit: customer['credit_limit'],
      outstandingBalance: customer['outstanding_balance'],
      creditDays: customer['credit_days'],
      creditHold: customer['credit_hold'],
      riskRating: customer['risk_rating'],
      availableCredit: customer['credit_limit'] !== null ? Number(customer['credit_limit']) - Number(customer['outstanding_balance'] ?? 0) : null,
      creditUtilizationPct: customer['credit_limit'] !== null && Number(customer['credit_limit']) > 0 ? (Number(customer['outstanding_balance'] ?? 0) / Number(customer['credit_limit'])) * 100 : 0,
    }
  },

  async lookupByGstin(gstin: string) {
    getContext()
    const result = await customerRepository.findByGstin(gstin)
    return result
  },
}

export const customerGroupService = {
  async list() { const { tenantId } = getContext(); return customerGroupRepository.list(tenantId) },
  async create(data: { code: string; name: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await customerGroupRepository.create({ tenantId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'CustomerGroup', entityId: id, entityCode: data.code })
    return id
  },
}
