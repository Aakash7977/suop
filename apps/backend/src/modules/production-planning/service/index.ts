/** Production Planning Service — Capacity planning, scheduling engine, material availability */
import { productionPlanRepository, productionPlanLineRepository, productionScheduleRepository, capacityPlanRepository } from '../repository'
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

export const productionPlanningService = {
  async createPlan(data: { planName: string; planType?: string; planHorizon?: string; startDate: string; endDate: string; description?: string; lines: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()
    if (new Date(data.endDate) < new Date(data.startDate)) {
      throw new BusinessRuleError('End date must be after start date', { code: 'PLAN.INVALID_DATES' })
    }
    const planNumber = await productionPlanRepository.generatePlanNumber(tenantId)
    const plan = await productionPlanRepository.create({
      tenantId, planNumber, planName: data.planName, planType: data.planType ?? 'MPS', planHorizon: data.planHorizon ?? 'MONTHLY',
      startDate: data.startDate, endDate: data.endDate, status: 'DRAFT', description: data.description,
    })
    let lineNo = 1
    for (const line of data.lines) {
      await productionPlanLineRepository.create({ ...line, tenantId, planId: plan!['id'], lineNo })
      lineNo++
    }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ProductionPlan', entityId: String(plan!['id']), entityCode: planNumber, after: data })
    return plan
  },

  async getPlan(id: string) {
    const { tenantId } = getContext()
    const plan = await productionPlanRepository.findById(tenantId, id)
    if (!plan) throw new NotFoundError('ProductionPlan', id)
    const lines = await productionPlanLineRepository.listForPlan(tenantId, id)
    return { ...plan, lines }
  },

  async listPlans(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { tenantId } = getContext()
    return productionPlanRepository.list(tenantId, params)
  },

  /** Check material availability for a plan line */
  async checkMaterialAvailability(planLineId: string) {
    const { tenantId } = getContext()
    // Get plan line
    const lineResult = await query(`SELECT * FROM production_plan_lines WHERE tenant_id = $1 AND id = $2`, [tenantId, planLineId])
    if (lineResult.rows.length === 0) throw new NotFoundError('PlanLine', planLineId)
    const line = lineResult.rows[0]!

    // Get BOM for product
    const bomResult = await query(`SELECT id FROM bom_headers WHERE tenant_id = $1 AND product_id = $2 AND is_default = true AND status = 'APPROVED' AND deleted_at IS NULL LIMIT 1`, [tenantId, line['product_id']])
    if (bomResult.rows.length === 0) {
      return { available: false, reason: 'No approved BOM found for product' }
    }

    // Get BOM lines
    const bomLinesResult = await query(`SELECT * FROM bom_lines WHERE tenant_id = $1 AND bom_id = $2`, [tenantId, bomResult.rows[0]!['id']])
    let allAvailable = true
    const materialStatus: Array<Record<string, unknown>> = []
    for (const bomLine of bomLinesResult.rows) {
      const requiredQty = Number(bomLine['quantity']) * Number(line['planned_qty'])
      const invResult = await query<{ total: string }>(`SELECT COALESCE(SUM(available_qty), 0) as total FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND deleted_at IS NULL AND is_blocked = false`, [tenantId, bomLine['product_id']])
      const availableQty = Number(invResult.rows[0]!.total)
      const isAvailable = availableQty >= requiredQty
      if (!isAvailable) allAvailable = false
      materialStatus.push({
        productId: bomLine['product_id'], productSku: bomLine['product_sku'],
        requiredQty, availableQty, isAvailable, shortfall: Math.max(requiredQty - availableQty, 0),
      })
    }

    // Update plan line
    await query(`UPDATE production_plan_lines SET material_available = $3 WHERE tenant_id = $1 AND id = $2`, [tenantId, planLineId, allAvailable])

    return { available: allAvailable, materials: materialStatus }
  },

  /** Finite scheduling: allocate capacity from work center */
  async schedulePlanLine(planLineId: string, schedulingType: 'FINITE' | 'INFINITE' = 'FINITE') {
    const { tenantId, userId, ctx } = getContext()
    const lineResult = await query(`SELECT * FROM production_plan_lines WHERE tenant_id = $1 AND id = $2`, [tenantId, planLineId])
    if (lineResult.rows.length === 0) throw new NotFoundError('PlanLine', planLineId)
    const line = lineResult.rows[0]!

    if (!line['work_center_id']) {
      throw new BusinessRuleError('Plan line must have a work center for scheduling', { code: 'PLAN.NO_WORK_CENTER' })
    }

    // Estimate production time (simplified: based on quantity and work center capacity)
    const wcResult = await query<{ capacity: string }>(`SELECT capacity_per_hour FROM work_centers WHERE tenant_id = $1 AND id = $2`, [tenantId, line['work_center_id']])
    const capacityPerHour = Number(wcResult.rows[0]?.['capacity'] ?? 1)
    const requiredMinutes = Math.ceil((Number(line['planned_qty']) / capacityPerHour) * 60)

    if (schedulingType === 'FINITE') {
      // Check capacity availability
      const planDate = (line['planned_start_date'] ? String(line['planned_start_date']) : new Date().toISOString().split('T')[0]!) as string
      const available = await capacityPlanRepository.checkAvailability(tenantId, String(line['work_center_id']), planDate, null, requiredMinutes)
      if (!available) {
        throw new BusinessRuleError(`Insufficient capacity on ${planDate}. Required: ${requiredMinutes} minutes`, { code: 'PLAN.NO_CAPACITY' })
      }
      // Allocate capacity
      await capacityPlanRepository.findOrCreate(tenantId, String(line['work_center_id']), planDate, null, 480)
      await capacityPlanRepository.allocate(tenantId, String(line['work_center_id']), planDate, null, requiredMinutes)
    }

    // Create schedule
    const scheduleNumber = await productionScheduleRepository.generateScheduleNumber(tenantId)
    const scheduledStart = line['planned_start_date'] ? new Date(String(line['planned_start_date'])).toISOString() : new Date().toISOString()
    const scheduledEnd = new Date(new Date(scheduledStart).getTime() + requiredMinutes * 60000).toISOString()

    const schedule = await productionScheduleRepository.create({
      tenantId, scheduleNumber, planId: line['plan_id'], planLineId,
      productId: line['product_id'], productSku: line['product_sku'], productName: line['product_name'],
      scheduledQty: line['planned_qty'], uomId: line['uom_id'], uomCode: line['uom_code'],
      workCenterId: line['work_center_id'], productionLineId: line['production_line_id'],
      scheduledStart, scheduledEnd, schedulingType, status: 'SCHEDULED',
    })

    // Mark plan line as scheduled
    await query(`UPDATE production_plan_lines SET is_scheduled = true, capacity_available = true WHERE tenant_id = $1 AND id = $2`, [tenantId, planLineId])

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SCHEDULED', entityType: 'ProductionPlanLine', entityId: planLineId, after: { scheduleNumber, schedulingType, requiredMinutes } })
    await eventBus.writeToOutbox({ eventName: 'ProductionLineScheduled', payload: { planLineId, scheduleNumber }, tenantId })

    return schedule
  },

  async listSchedules(params: { page?: number; pageSize?: number; status?: string; workCenterId?: string } = {}) {
    const { tenantId } = getContext()
    return productionScheduleRepository.list(tenantId, params)
  },
}
