/** MES Repository — Work Centers, Production Lines, Machines, Shifts, Downtime, Events */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

function createRepo(tableName: string, fields: Record<string, string>) {
  return {
    async create(data: Record<string, unknown>) {
      const id = randomUUID()
      const cols: string[] = ['id']; const vals: unknown[] = [id]
      for (const [key, col] of Object.entries(fields)) {
        if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
      }
      const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
      await query(`INSERT INTO ${tableName} (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
      return this.findById(String(data['tenantId']), id)
    },
    async findById(tenantId: string, id: string) {
      const result = await query(`SELECT * FROM ${tableName} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
      return result.rows[0] ?? null
    },
    async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
      const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
      let where = 'tenant_id = $1 AND deleted_at IS NULL'
      const sqlParams: unknown[] = [tenantId]; let idx = 2
      if (params.search) { where += ` AND (wc_code ILIKE $${idx} OR wc_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
      if (params.isActive !== undefined) { where += ` AND is_active = $${idx++}`; sqlParams.push(params.isActive) }
      const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ${tableName} WHERE ${where}`, sqlParams)
      const total = Number(countResult.rows[0]!.cnt)
      const result = await query(`SELECT * FROM ${tableName} WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
      return { rows: result.rows, total, page, pageSize }
    },
  }
}

export const workCenterRepository = createRepo('work_centers', {
  tenantId: 'tenant_id', wcCode: 'wc_code', wcName: 'wc_name', wcType: 'wc_type',
  plantId: 'plant_id', plantName: 'plant_name', departmentId: 'department_id',
  capacityPerHour: 'capacity_per_hour', isActive: 'is_active', description: 'description',
})

export const productionLineRepository = createRepo('production_lines', {
  tenantId: 'tenant_id', lineCode: 'line_code', lineName: 'line_name',
  workCenterId: 'work_center_id', plantId: 'plant_id', plantName: 'plant_name',
  capacityPerShift: 'capacity_per_shift', isActive: 'is_active', description: 'description',
})

export const machineRepository = {
  ...createRepo('machines', {
    tenantId: 'tenant_id', machineCode: 'machine_code', machineName: 'machine_name',
    workCenterId: 'work_center_id', productionLineId: 'production_line_id',
    machineType: 'machine_type', manufacturer: 'manufacturer', model: 'model', serialNumber: 'serial_number',
    maxCapacity: 'max_capacity', currentStatus: 'current_status', isActive: 'is_active', installedDate: 'installed_date',
    description: 'description',
  }),
  async updateStatus(tenantId: string, id: string, newStatus: string) {
    const result = await query(`UPDATE machines SET current_status = $3, updated_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, [tenantId, id, newStatus])
    return result.rows[0] ?? null
  },
}

export const shiftRepository = createRepo('shifts', {
  tenantId: 'tenant_id', shiftCode: 'shift_code', shiftName: 'shift_name',
  startTime: 'start_time', endTime: 'end_time', breakMinutes: 'break_minutes', isActive: 'is_active', description: 'description',
})

export const downtimeRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO downtime_records (id, tenant_id, downtime_number, machine_id, machine_code, production_order_id, production_order_number, downtime_start, downtime_end, duration_minutes, downtime_type, downtime_category, reason, action_taken, reported_by, reported_by_name, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())`, [id, data['tenantId'], data['downtimeNumber'], data['machineId'], data['machineCode'], data['productionOrderId'] ?? null, data['productionOrderNumber'] ?? null, data['downtimeStart'], data['downtimeEnd'] ?? null, data['durationMinutes'] ?? null, data['downtimeType'], data['downtimeCategory'] ?? null, data['reason'], data['actionTaken'] ?? null, data['reportedBy'] ?? null, data['reportedByName'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; machineId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'; const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.machineId) { where += ` AND machine_id = $${idx++}`; sqlParams.push(params.machineId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM downtime_records WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM downtime_records WHERE ${where} ORDER BY downtime_start DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateDowntimeNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM downtime_records WHERE tenant_id = $1 AND downtime_number LIKE 'DT-${year}-%'`, [tenantId])
    return `DT-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const productionEventRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO production_events (id, tenant_id, event_type, event_time, production_order_id, production_order_number, machine_id, machine_code, operator_id, operator_name, event_data, severity, description, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`, [id, data['tenantId'], data['eventType'], data['productionOrderId'] ?? null, data['productionOrderNumber'] ?? null, data['machineId'] ?? null, data['machineCode'] ?? null, data['operatorId'] ?? null, data['operatorName'] ?? null, data['eventData'] ? JSON.stringify(data['eventData']) : null, data['severity'] ?? 'INFO', data['description'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productionOrderId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'; const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productionOrderId) { where += ` AND production_order_id = $${idx++}`; sqlParams.push(params.productionOrderId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_events WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM production_events WHERE ${where} ORDER BY event_time DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}
