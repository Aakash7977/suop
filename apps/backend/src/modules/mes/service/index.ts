/** MES Service — Work Centers, Machines, Shifts, Downtime, OEE Analytics */
import { workCenterRepository, machineRepository, shiftRepository, downtimeRepository, productionEventRepository } from '../repository'
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

export const mesService = {
  // ═══ Work Centers ═════════════════════════════════════════════════════════

  async createWorkCenter(data: { wcCode: string; wcName: string; wcType?: string; plantId?: string; plantName?: string; departmentId?: string; capacityPerHour?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const wc = await workCenterRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'WorkCenter', entityId: String(wc!['id']), entityCode: data.wcCode, after: data })
    return wc
  },

  async listWorkCenters(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return workCenterRepository.list(tenantId, params)
  },

  // ═══ Machines ════════════════════════════════════════════════════════════

  async createMachine(data: { machineCode: string; machineName: string; workCenterId?: string; productionLineId?: string; machineType?: string; manufacturer?: string; model?: string; serialNumber?: string; maxCapacity?: number; installedDate?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const machine = await machineRepository.create({ tenantId, ...data, currentStatus: 'IDLE', isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Machine', entityId: String(machine!['id']), entityCode: data.machineCode, after: data })
    return machine
  },

  async listMachines(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return machineRepository.list(tenantId, params)
  },

  async updateMachineStatus(id: string, newStatus: string) {
    const { tenantId, userId, ctx } = getContext()
    const validStatuses = ['IDLE', 'RUNNING', 'SETUP', 'MAINTENANCE', 'BREAKDOWN', 'CLEANING']
    if (!validStatuses.includes(newStatus)) {
      throw new BusinessRuleError(`Invalid machine status: ${newStatus}`, { code: 'MES.INVALID_STATUS' })
    }
    const updated = await machineRepository.updateStatus(tenantId, id, newStatus)
    if (!updated) throw new NotFoundError('Machine', id)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'MACHINE_STATUS_CHANGE', entityType: 'Machine', entityId: id, after: { newStatus } })
    await eventBus.writeToOutbox({ eventName: 'MachineStatusChanged', payload: { machineId: id, newStatus }, tenantId })
    return updated
  },

  // ═══ Shifts ══════════════════════════════════════════════════════════════

  async createShift(data: { shiftCode: string; shiftName: string; startTime: string; endTime: string; breakMinutes?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const shift = await shiftRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Shift', entityId: String(shift!['id']), entityCode: data.shiftCode, after: data })
    return shift
  },

  async listShifts() {
    const { tenantId } = getContext()
    return shiftRepository.list(tenantId, { page: 1, pageSize: 1000 })
  },

  // ═══ Downtime ════════════════════════════════════════════════════════════

  async recordDowntime(data: { machineId: string; machineCode: string; productionOrderId?: string; productionOrderNumber?: string; downtimeStart: string; downtimeEnd?: string; downtimeType: string; downtimeCategory?: string; reason: string; actionTaken?: string }) {
    const { tenantId, userId, ctx } = getContext()
    let durationMinutes: number | undefined
    if (data.downtimeEnd) {
      durationMinutes = Math.round((new Date(data.downtimeEnd).getTime() - new Date(data.downtimeStart).getTime()) / 60000)
      if (durationMinutes <= 0) throw new BusinessRuleError('Downtime end must be after start', { code: 'MES.INVALID_DOWNTIME' })
    }
    const downtimeNumber = await downtimeRepository.generateDowntimeNumber(tenantId)
    const id = await downtimeRepository.create({
      tenantId, downtimeNumber, machineId: data.machineId, machineCode: data.machineCode,
      productionOrderId: data.productionOrderId, productionOrderNumber: data.productionOrderNumber,
      downtimeStart: data.downtimeStart, downtimeEnd: data.downtimeEnd, durationMinutes,
      downtimeType: data.downtimeType, downtimeCategory: data.downtimeCategory, reason: data.reason, actionTaken: data.actionTaken,
      reportedBy: userId, reportedByName: ctx.userEmail,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DOWNTIME_RECORDED', entityType: 'Downtime', entityId: id, entityCode: downtimeNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'DowntimeRecorded', payload: { downtimeId: id, machineId: data.machineId, durationMinutes }, tenantId })
    return { id, downtimeNumber }
  },

  async listDowntime(params: { page?: number; pageSize?: number; machineId?: string } = {}) {
    const { tenantId } = getContext()
    return downtimeRepository.list(tenantId, params)
  },

  // ═══ Production Events ════════════════════════════════════════════════════

  async recordEvent(data: { eventType: string; productionOrderId?: string; productionOrderNumber?: string; machineId?: string; machineCode?: string; operatorId?: string; operatorName?: string; eventData?: Record<string, unknown>; severity?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await productionEventRepository.create({ tenantId, ...data, operatorId: data.operatorId ?? userId, operatorName: data.operatorName ?? ctx.userEmail })
    return { id }
  },

  async listEvents(params: { page?: number; pageSize?: number; productionOrderId?: string } = {}) {
    const { tenantId } = getContext()
    return productionEventRepository.list(tenantId, params)
  },

  // ═══ OEE Analytics ════════════════════════════════════════════════════════

  async calculateOEE(machineId: string, startDate: string, endDate: string) {
    const { tenantId } = getContext()

    // Get planned production time (from shift calendar)
    const shiftResult = await query(`SELECT COALESCE(SUM(480 - COALESCE(break_minutes, 30)), 0) as planned_minutes FROM shift_calendars sc JOIN shifts s ON sc.shift_id = s.id WHERE sc.tenant_id = $1 AND sc.machine_id IS NULL AND sc.calendar_date BETWEEN $2 AND $3 AND sc.is_working_day = true`, [tenantId, startDate, endDate])
    const plannedMinutes = Number(shiftResult.rows[0]?.['planned_minutes'] ?? 0)

    // Get downtime
    const downtimeResult = await query<{ total_downtime: string }>(`SELECT COALESCE(SUM(duration_minutes), 0) as total_downtime FROM downtime_records WHERE tenant_id = $1 AND machine_id = $2 AND downtime_start BETWEEN $3 AND $4`, [tenantId, machineId, startDate, endDate])
    const downtimeMinutes = Number(downtimeResult.rows[0]?.['total_downtime'] ?? 0)

    // Get production data
    const prodResult = await query<{ produced_qty: string; rejected_qty: string; ideal_cycle_time: string }>(`SELECT COALESCE(SUM(pc.confirmed_qty), 0) as produced_qty, COALESCE(SUM(pc.rejected_qty), 0) as rejected_qty, COALESCE(AVG(m.max_capacity), 1) as ideal_cycle_time FROM production_confirmations pc JOIN production_orders po ON pc.production_order_id = po.id LEFT JOIN machines m ON po.machine_id = m.id WHERE pc.tenant_id = $1 AND pc.machine_id = $2 AND pc.confirmation_date BETWEEN $3 AND $4`, [tenantId, machineId, startDate, endDate])
    const producedQty = Number(prodResult.rows[0]?.['produced_qty'] ?? 0)
    const rejectedQty = Number(prodResult.rows[0]?.['rejected_qty'] ?? 0)

    // OEE = Availability × Performance × Quality
    const runTime = Math.max(plannedMinutes - downtimeMinutes, 0)
    const availability = plannedMinutes > 0 ? (runTime / plannedMinutes) * 100 : 0
    const goodQty = Math.max(producedQty - rejectedQty, 0)
    const quality = producedQty > 0 ? (goodQty / producedQty) * 100 : 0
    const performance = runTime > 0 ? Math.min((producedQty / (runTime / 60)) * 100, 100) : 0 // simplified
    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100

    return {
      machineId,
      period: { startDate, endDate },
      plannedMinutes,
      downtimeMinutes,
      runTime,
      producedQty,
      rejectedQty,
      goodQty,
      availability: Math.round(availability * 100) / 100,
      performance: Math.round(performance * 100) / 100,
      quality: Math.round(quality * 100) / 100,
      oee: Math.round(oee * 100) / 100,
    }
  },

  async getProductionDashboard() {
    const { tenantId } = getContext()
    const [machinesResult, ordersResult, downtimeResult, eventsResult] = await Promise.all([
      query<{ cnt: string; running: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN current_status = 'RUNNING' THEN 1 END) as running FROM machines WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query<{ cnt: string; in_progress: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress FROM production_orders WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM downtime_records WHERE tenant_id = $1 AND downtime_end IS NULL`, [tenantId]),
      query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_events WHERE tenant_id = $1 AND event_time > NOW() - INTERVAL '24 hours'`, [tenantId]),
    ])
    return {
      totalMachines: Number(machinesResult.rows[0]?.['cnt'] ?? 0),
      runningMachines: Number(machinesResult.rows[0]?.['running'] ?? 0),
      totalProductionOrders: Number(ordersResult.rows[0]?.['cnt'] ?? 0),
      inProgressOrders: Number(ordersResult.rows[0]?.['in_progress'] ?? 0),
      activeDowntimes: Number(downtimeResult.rows[0]?.['cnt'] ?? 0),
      eventsLast24h: Number(eventsResult.rows[0]?.['cnt'] ?? 0),
    }
  },
}
