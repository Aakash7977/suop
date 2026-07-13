/** Production Planning Repository */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const productionPlanRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', planNumber: 'plan_number', planName: 'plan_name',
      planType: 'plan_type', planHorizon: 'plan_horizon', startDate: 'start_date', endDate: 'end_date',
      status: 'status', approvalNotes: 'approval_notes', description: 'description',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO production_plans (${cols.join(', ')}, plan_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM production_plans WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'production_plans' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const total = await scopedCount('production_plans', 'production_plans', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM production_plans WHERE ${where} ORDER BY plan_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'production_plans' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generatePlanNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_plans WHERE tenant_id = $1 AND plan_number LIKE 'PP-${year}-%'`, [tenantId])
    return `PP-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const productionPlanLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO production_plan_lines (id, tenant_id, plan_id, line_no, product_id, product_sku, product_name, planned_qty, uom_id, uom_code, planned_start_date, planned_end_date, work_center_id, production_line_id, recipe_id, bom_id, routing_id, priority, material_available, capacity_available, is_scheduled, production_order_id, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,NOW())`, [id, data['tenantId'], data['planId'], data['lineNo'], data['productId'], data['productSku'] ?? null, data['productName'] ?? null, data['plannedQty'], data['uomId'] ?? null, data['uomCode'] ?? null, data['plannedStartDate'] ?? null, data['plannedEndDate'] ?? null, data['workCenterId'] ?? null, data['productionLineId'] ?? null, data['recipeId'] ?? null, data['bomId'] ?? null, data['routingId'] ?? null, data['priority'] ?? 'NORMAL', data['materialAvailable'] ?? false, data['capacityAvailable'] ?? false, data['isScheduled'] ?? false, data['productionOrderId'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForPlan(tenantId: string, planId: string) {
    const result = await scopedQuery(`SELECT * FROM production_plan_lines WHERE tenant_id = $1 AND plan_id = $2 ORDER BY line_no`, [tenantId, planId], { tableAlias: 'production_plan_lines' })
    return result.rows
  },
}

export const productionScheduleRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', scheduleNumber: 'schedule_number', planId: 'plan_id', planLineId: 'plan_line_id',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      scheduledQty: 'scheduled_qty', uomId: 'uom_id', uomCode: 'uom_code',
      workCenterId: 'work_center_id', workCenterCode: 'work_center_code',
      productionLineId: 'production_line_id', machineId: 'machine_id', shiftId: 'shift_id',
      scheduledStart: 'scheduled_start', scheduledEnd: 'scheduled_end',
      schedulingType: 'scheduling_type', status: 'status',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO production_schedules (${cols.join(', ')}, schedule_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM production_schedules WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'production_schedules' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; workCenterId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.workCenterId) { where += ` AND work_center_id = $${idx++}`; sqlParams.push(params.workCenterId) }
    const total = await scopedCount('production_schedules', 'production_schedules', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM production_schedules WHERE ${where} ORDER BY scheduled_start DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'production_schedules' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generateScheduleNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_schedules WHERE tenant_id = $1 AND schedule_number LIKE 'SCH-${year}-%'`, [tenantId])
    return `SCH-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const capacityPlanRepository = {
  async findOrCreate(tenantId: string, workCenterId: string, planDate: string, shiftId: string | null, availableMinutes: number): Promise<Record<string, unknown>> {
    const existing = await scopedQuery(`SELECT * FROM capacity_plans WHERE tenant_id = $1 AND work_center_id = $2 AND plan_date = $3 AND COALESCE(shift_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($4::uuid, '00000000-0000-0000-0000-000000000000'::uuid)`, [tenantId, workCenterId, planDate, shiftId], { tableAlias: 'capacity_plans' })
    if (existing.rows.length > 0) return existing.rows[0] as Record<string, unknown>
    const id = randomUUID()
    await query(`INSERT INTO capacity_plans (id, tenant_id, work_center_id, work_center_code, plan_date, shift_id, available_capacity_minutes, allocated_capacity_minutes, remaining_capacity_minutes, utilization_percent, created_at, updated_at) VALUES ($1,$2,$3,NULL,$4,$5,$6,0,$6,0,NOW(),NOW())`, [id, tenantId, workCenterId, planDate, shiftId, availableMinutes])
    const result = await scopedQuery(`SELECT * FROM capacity_plans WHERE id = $1`, [id], { tableAlias: 'capacity_plans' })
    return result.rows[0] as Record<string, unknown>
  },
  async allocate(tenantId: string, workCenterId: string, planDate: string, shiftId: string | null, minutes: number) {
    await query(`UPDATE capacity_plans SET allocated_capacity_minutes = allocated_capacity_minutes + $4, remaining_capacity_minutes = remaining_capacity_minutes - $4, utilization_percent = CASE WHEN available_capacity_minutes > 0 THEN (allocated_capacity_minutes + $4) * 100.0 / available_capacity_minutes ELSE 0 END, updated_at = NOW() WHERE tenant_id = $1 AND work_center_id = $2 AND plan_date = $3 AND COALESCE(shift_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($5::uuid, '00000000-0000-0000-0000-000000000000'::uuid)`, [tenantId, workCenterId, planDate, minutes, shiftId])
  },
  async checkAvailability(tenantId: string, workCenterId: string, planDate: string, shiftId: string | null, requiredMinutes: number): Promise<boolean> {
    const result = await query<{ remaining: string }>(`SELECT remaining_capacity_minutes as remaining FROM capacity_plans WHERE tenant_id = $1 AND work_center_id = $2 AND plan_date = $3 AND COALESCE(shift_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($4::uuid, '00000000-0000-0000-0000-000000000000'::uuid)`, [tenantId, workCenterId, planDate, shiftId])
    if (result.rows.length === 0) return true // no capacity plan = infinite
    return Number(result.rows[0]!.remaining) >= requiredMinutes
  },
}

export const materialReservationRepo = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', reservationNumber: 'reservation_number',
      productionOrderId: 'production_order_id', productionOrderNumber: 'production_order_number',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      warehouseId: 'warehouse_id', batchId: 'batch_id', lotId: 'lot_id',
      reservedQty: 'reserved_qty', uomId: 'uom_id', uomCode: 'uom_code',
      consumptionStrategy: 'consumption_strategy', status: 'status', expiresAt: 'expires_at',
      reservedBy: 'reserved_by', reservedByName: 'reserved_by_name', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO material_reservations (${cols.join(', ')}, reservation_date, created_at, updated_at) VALUES (${ph}, NOW(), NOW(), NOW())`, vals)
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productionOrderId?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productionOrderId) { where += ` AND production_order_id = $${idx++}`; sqlParams.push(params.productionOrderId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const total = await scopedCount('material_reservations', 'material_reservations', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM material_reservations WHERE ${where} ORDER BY reservation_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'material_reservations' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generateReservationNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM material_reservations WHERE tenant_id = $1 AND reservation_number LIKE 'PMR-${year}-%'`, [tenantId])
    return `PMR-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}
