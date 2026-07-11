/** Recipe & BOM Service — Multi-level BOM, versioning, alternate BOM, yield, byproducts, recipe cost */
import '@/modules/recipe-bom/workflow'
import {
  recipeRepository, recipeItemRepository, recipeByproductRepository,
  bomHeaderRepository, bomLineRepository, routingRepository, routingOperationRepository,
} from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const recipeBomService = {
  // ═══ Recipes ══════════════════════════════════════════════════════════════

  async createRecipe(data: {
    recipeCode: string; recipeName: string
    productId: string; productSku?: string; productName?: string
    version?: string; yieldPercent?: number; expectedLossPercent?: number
    batchSize?: number; batchUomId?: string; batchUomCode?: string
    productionTimeHours?: number; description?: string
    items: Array<Record<string, unknown>>
    byproducts?: Array<Record<string, unknown>>
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: must have at least one item
    if (!data.items || data.items.length === 0) {
      throw new BusinessRuleError('Recipe must have at least one item', { code: 'RECIPE.NO_ITEMS' })
    }

    // Business rule: yield + expected loss must be ≤ 100%
    const yieldPct = data.yieldPercent ?? 100
    const lossPct = data.expectedLossPercent ?? 0
    if (yieldPct + lossPct > 100) {
      throw new BusinessRuleError('Yield % + Expected Loss % cannot exceed 100%', { code: 'RECIPE.INVALID_YIELD_LOSS' })
    }

    // Calculate recipe cost from items
    let recipeCost = 0
    for (const item of data.items) {
      const unitCost = Number(item['unitCost'] ?? 0)
      const qty = Number(item['quantity'] ?? 0)
      recipeCost += unitCost * qty
    }

    const recipe = await recipeRepository.create({
      tenantId, recipeCode: data.recipeCode, recipeName: data.recipeName,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      version: data.version ?? '1.0', isActive: true, isDefault: false,
      yieldPercent: yieldPct, expectedLossPercent: lossPct,
      batchSize: data.batchSize, batchUomId: data.batchUomId, batchUomCode: data.batchUomCode,
      productionTimeHours: data.productionTimeHours, recipeCost,
      status: 'DRAFT', description: data.description,
    })

    // Create items
    let lineNo = 1
    for (const item of data.items) {
      await recipeItemRepository.create({ ...item, tenantId, recipeId: recipe!['id'], lineNo })
      lineNo++
    }

    // Create byproducts
    if (data.byproducts) {
      for (const bp of data.byproducts) {
        await recipeByproductRepository.create({ ...bp, tenantId, recipeId: recipe!['id'] })
      }
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Recipe', entityId: String(recipe!['id']), entityCode: data.recipeCode, after: data })
    await eventBus.writeToOutbox({ eventName: 'RecipeCreated', payload: { recipeId: String(recipe!['id']), recipeCode: data.recipeCode }, tenantId })

    return recipe
  },

  async getRecipe(id: string) {
    const { tenantId } = getContext()
    const recipe = await recipeRepository.findById(tenantId, id)
    if (!recipe) throw new NotFoundError('Recipe', id)
    const [items, byproducts] = await Promise.all([
      recipeItemRepository.listForRecipe(tenantId, id),
      recipeByproductRepository.listForRecipe(tenantId, id),
    ])
    return { ...recipe, items, byproducts }
  },

  async listRecipes(params: { page?: number; pageSize?: number; productId?: string; status?: string; search?: string } = {}) {
    const { tenantId } = getContext()
    return recipeRepository.list(tenantId, params)
  },

  async transitionRecipe(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await recipeRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Recipe', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('RecipeLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version_no']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'RECIPE.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'APPROVED') {
      updateData.approvedBy = userId
      updateData.approvedByName = ctx.userEmail
      updateData.approvedAt = new Date().toISOString()
    }

    const updated = await recipeRepository.update(tenantId, id, updateData, version)
    if (!updated) throw new BusinessRuleError('Recipe was modified by another transaction', { code: 'RECIPE.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'RECIPE_TRANSITION', entityType: 'Recipe', entityId: id, entityCode: String(existing['recipe_code']), before: { status: existing['status'] }, after: { status: targetStatus } })
    await eventBus.writeToOutbox({ eventName: 'RecipeApproved', payload: { recipeId: id, status: targetStatus }, tenantId })

    return updated
  },

  // ═══ BOM ══════════════════════════════════════════════════════════════════

  async createBom(data: {
    bomCode: string; bomName: string
    productId: string; productSku?: string; productName?: string
    bomType?: string; description?: string
    lines: Array<Record<string, unknown>>
  }) {
    const { tenantId, userId, ctx } = getContext()

    if (!data.lines || data.lines.length === 0) {
      throw new BusinessRuleError('BOM must have at least one line', { code: 'BOM.NO_LINES' })
    }

    const bom = await bomHeaderRepository.create({
      tenantId, bomCode: data.bomCode, bomName: data.bomName,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      bomType: data.bomType ?? 'STANDARD', isActive: true, isDefault: false,
      status: 'DRAFT', description: data.description,
    })

    // Create lines (support multi-level via parentBomLineId)
    let lineNo = 1
    for (const line of data.lines) {
      await bomLineRepository.create({
        ...line, tenantId, bomId: bom!['id'], lineNo,
        level: line['level'] ?? 1,
      })
      lineNo++
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'BOM', entityId: String(bom!['id']), entityCode: data.bomCode, after: data })
    return bom
  },

  async getBom(id: string) {
    const { tenantId } = getContext()
    const bom = await bomHeaderRepository.findById(tenantId, id)
    if (!bom) throw new NotFoundError('BOM', id)
    const lines = await bomLineRepository.listForBom(tenantId, id)
    return { ...bom, lines }
  },

  async listBoms(params: { page?: number; pageSize?: number; productId?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    return bomHeaderRepository.list(tenantId, params)
  },

  async transitionBom(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await bomHeaderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('BOM', id)
    if (!['DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPRECATED'].includes(targetStatus)) {
      throw new BusinessRuleError(`Invalid BOM status: ${targetStatus}`, { code: 'BOM.INVALID_STATUS' })
    }
    const updateData: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'APPROVED') {
      updateData.approvedBy = userId
      updateData.approvedByName = ctx.userEmail
      updateData.approvedAt = new Date().toISOString()
    }
    const updated = await bomHeaderRepository.update(tenantId, id, updateData, version)
    if (!updated) throw new BusinessRuleError('BOM was modified by another transaction', { code: 'BOM.CONCURRENCY' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BOM_TRANSITION', entityType: 'BOM', entityId: id, entityCode: String(existing['bom_code']), before: { status: existing['status'] }, after: { status: targetStatus } })
    return updated
  },

  /** Get multi-level BOM explosion (all components recursively) */
  async explodeBom(bomId: string): Promise<Array<Record<string, unknown>>> {
    const { tenantId } = getContext()
    const result: Array<Record<string, unknown>> = []
    await this._explodeRecursive(tenantId, bomId, 1, 1, result)
    return result
  },

  async _explodeRecursive(tenantId: string, bomId: string, level: number, parentLineNo: number, result: Array<Record<string, unknown>>) {
    const lines = await bomLineRepository.listForBom(tenantId, bomId)
    for (const line of lines) {
      result.push({ ...line, level, parentLineNo })
      // If this line is a phantom (sub-assembly), explode its BOM too
      if (line['is_phantom'] && line['product_id']) {
        const subBomResult = await query(`SELECT id FROM bom_headers WHERE tenant_id = $1 AND product_id = $2 AND is_default = true AND status = 'APPROVED' AND deleted_at IS NULL LIMIT 1`, [tenantId, line['product_id']])
        if (subBomResult.rows.length > 0) {
          await this._explodeRecursive(tenantId, String(subBomResult.rows[0]!['id']), level + 1, Number(line['line_no']), result)
        }
      }
    }
  },

  // ═══ Routings ═════════════════════════════════════════════════════════════

  async createRouting(data: { routingCode: string; routingName: string; productId?: string; bomId?: string; description?: string; operations: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()
    const routing = await routingRepository.create({ tenantId, ...data, isActive: true })
    let opNo = 1
    for (const op of data.operations) {
      await routingOperationRepository.create({ ...op, tenantId, routingId: routing!['id'], operationNo: op['operationNo'] ?? opNo })
      opNo++
    }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Routing', entityId: String(routing!['id']), entityCode: data.routingCode, after: data })
    return routing
  },

  async getRouting(id: string) {
    const { tenantId } = getContext()
    const routing = await routingRepository.findById(tenantId, id)
    if (!routing) throw new NotFoundError('Routing', id)
    const operations = await routingOperationRepository.listForRouting(tenantId, id)
    return { ...routing, operations }
  },

  async listRoutings(params: { page?: number; pageSize?: number; productId?: string } = {}) {
    const { tenantId } = getContext()
    return routingRepository.list(tenantId, params)
  },
}
