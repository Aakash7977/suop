/** Product Service — Business logic for Product Master */
import { productRepository, categoryRepository, brandRepository, uomRepository, barcodeRepository } from '../repository'
import '@/modules/product/workflow'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, ConflictError, ConcurrencyError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const productService = {
  async create(data: Record<string, unknown>) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: SKU must be unique
    const existing = await productRepository.findBySku(tenantId, String(data['sku']))
    if (existing) throw new ConflictError(`Product with SKU '${data['sku']}' already exists`)

    // Business rule: base UOM must exist
    if (data['baseUomId']) {
      const uom = await uomRepository.findById(tenantId, String(data['baseUomId']))
      if (!uom) throw new BusinessRuleError('Base UOM not found', { code: 'PRODUCT.UOM_NOT_FOUND' })
    }

    // Business rule: category must exist if specified
    if (data['categoryId']) {
      const cat = await categoryRepository.findById(tenantId, String(data['categoryId']))
      if (!cat) throw new BusinessRuleError('Category not found', { code: 'PRODUCT.CATEGORY_NOT_FOUND' })
    }

    const product = await productRepository.create({ ...data, tenantId })
    if (!product) throw new Error('Failed to create product')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Product', entityId: String(product['id']), entityCode: String(product['sku']), after: product })

    await eventBus.writeToOutbox({ eventName: 'ProductCreated', payload: { productId: String(product['id']), sku: String(product['sku']), name: String(product['name']) }, tenantId })

    return product
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const product = await productRepository.findById(tenantId, id)
    if (!product) throw new NotFoundError('Product', id)
    const barcodes = await barcodeRepository.listForProduct(tenantId, id)
    return { ...product, barcodes }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; productType?: string; status?: string; categoryId?: string; brandId?: string; abcClass?: string } = {}) {
    const { tenantId } = getContext()
    return productRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Product', id)
    const updated = await productRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('Product was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Product', entityId: id, entityCode: String(existing['sku']), before: existing, after: updated })
    await eventBus.writeToOutbox({ eventName: 'ProductUpdated', payload: { productId: id, sku: String(existing['sku']) }, tenantId })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Product', id)
    // Business rule: cannot delete active products
    if (existing['status'] === 'ACTIVE') throw new BusinessRuleError('Cannot delete an active product. Discontinue first.', { code: 'PRODUCT.ACTIVE_DELETE' })
    const deleted = await productRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('Product was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'Product', entityId: id, entityCode: String(existing['sku']), before: existing })
  },

  async transition(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Product', id)
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('ProductLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Status transition denied: ${check.reason}`, { code: 'PRODUCT.TRANSITION_DENIED' })
    const updated = await productRepository.updateStatus(tenantId, id, targetStatus, version, userId)
    if (!updated) throw new ConcurrencyError('Product was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'Product', entityId: id, entityCode: String(existing['sku']), before: { status: existing['status'] }, after: { status: targetStatus } })
    if (targetStatus === 'APPROVED') { await eventBus.writeToOutbox({ eventName: 'ProductApproved', payload: { productId: id, sku: String(existing['sku']) }, tenantId }) }
    if (targetStatus === 'ARCHIVED') { await eventBus.writeToOutbox({ eventName: 'ProductArchived', payload: { productId: id, sku: String(existing['sku']) }, tenantId }) }
    return updated
  },

  async lookupByBarcode(barcode: string) {
    getContext()
    const product = await productRepository.findByBarcode(barcode)
    if (!product) throw new NotFoundError('Product (barcode)', barcode)
    return product
  },

  async addBarcode(productId: string, data: { barcodeType: string; barcodeValue: string; isPrimary?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const product = await productRepository.findById(tenantId, productId)
    if (!product) throw new NotFoundError('Product', productId)
    // Business rule: barcode must be unique
    const existing = await barcodeRepository.findByValue(data.barcodeValue)
    if (existing) throw new ConflictError(`Barcode '${data.barcodeValue}' already exists`)
    const id = await barcodeRepository.create({ tenantId, productId, ...data })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ProductBarcode', entityId: id, entityCode: data.barcodeValue, reason: `Barcode added to product ${product['sku']}` })
    return id
  },

  async listBarcodes(productId: string) {
    const { tenantId } = getContext()
    return barcodeRepository.listForProduct(tenantId, productId)
  },
}

export const categoryService = {
  async list() { const { tenantId } = getContext(); return categoryRepository.list(tenantId) },
  async create(data: { code: string; name: string; description?: string; productType?: string; parentId?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const cat = await categoryRepository.create({ tenantId, ...data, createdBy: userId })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ProductCategory', entityId: String(cat?.['id'] ?? ''), entityCode: data.code })
    return cat
  },
}

export const brandService = {
  async list() { const { tenantId } = getContext(); return brandRepository.list(tenantId) },
  async create(data: { code: string; name: string; description?: string; manufacturer?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const brand = await brandRepository.create({ tenantId, ...data, createdBy: userId })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ProductBrand', entityId: String(brand?.['id'] ?? ''), entityCode: data.code })
    return brand
  },
}

export const uomService = {
  async list() { const { tenantId } = getContext(); return uomRepository.list(tenantId) },
}
