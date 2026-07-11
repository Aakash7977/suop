/** Quality Foundation Service — Standards, specs, test methods, KPIs, dashboard */
import { qualityStandardRepository, inspectionTypeRepository, qualitySpecRepository, testMethodRepository, testParameterRepository, inspectionTemplateRepository, qualityKpiRepository } from '../repository'
import { auditService } from '@/core/audit'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const qualityFoundationService = {
  async createStandard(data: { standardCode: string; standardName: string; standardType?: string; version?: string; issuingBody?: string; effectiveDate?: string; expiryDate?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const standard = await qualityStandardRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'QualityStandard', entityId: String(standard!['id']), entityCode: data.standardCode, after: data })
    return standard
  },

  async listStandards(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return qualityStandardRepository.list(tenantId, params)
  },

  async createSpec(data: { specCode: string; specName: string; productId?: string; productSku?: string; productName?: string; specType?: string; version?: string; description?: string; parameters?: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()
    const spec = await qualitySpecRepository.create({ tenantId, ...data, isActive: true })
    if (data.parameters) {
      let sortOrder = 0
      for (const param of data.parameters) {
        await testParameterRepository.create({ ...param, tenantId, specId: spec!['id'], sortOrder })
        sortOrder++
      }
    }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'QualitySpecification', entityId: String(spec!['id']), entityCode: data.specCode, after: data })
    return spec
  },

  async listSpecs(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return qualitySpecRepository.list(tenantId, params)
  },

  async createTestMethod(data: { methodCode: string; methodName: string; methodType?: string; standardReference?: string; equipmentRequired?: string; durationHours?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const method = await testMethodRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'TestMethod', entityId: String(method!['id']), entityCode: data.methodCode, after: data })
    return method
  },

  async listTestMethods(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return testMethodRepository.list(tenantId, params)
  },

  async createInspectionType(data: { typeCode: string; typeName: string; inspectionCategory?: string; description?: string; sortOrder?: number }) {
    const { tenantId, userId, ctx } = getContext()
    const type = await inspectionTypeRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'InspectionType', entityId: String(type!['id']), entityCode: data.typeCode, after: data })
    return type
  },

  async listInspectionTypes(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return inspectionTypeRepository.list(tenantId, params)
  },

  async createInspectionTemplate(data: { templateCode: string; templateName: string; inspectionTypeId?: string; productId?: string; productCategoryId?: string; specId?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const template = await inspectionTemplateRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'InspectionTemplate', entityId: String(template!['id']), entityCode: data.templateCode, after: data })
    return template
  },

  async listInspectionTemplates(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return inspectionTemplateRepository.list(tenantId, params)
  },

  async listKpis(params: { page?: number; pageSize?: number; period?: string } = {}) {
    const { tenantId } = getContext()
    return qualityKpiRepository.list(tenantId, params)
  },

  async getQualityDashboard() {
    const { tenantId } = getContext()
    const [ncrResult, capaResult, recallResult, iqcResult, fgqcResult] = await Promise.all([
      query<{ cnt: string; open: string; critical: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN status IN ('OPEN','CONTAINED','UNDER_INVESTIGATION') THEN 1 END) as open, COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical FROM ncrs WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query<{ cnt: string; open: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN status IN ('OPEN','IN_PROGRESS') THEN 1 END) as open FROM capa_records WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query<{ cnt: string; active: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN status NOT IN ('CLOSED') THEN 1 END) as active FROM recalls WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query<{ cnt: string; pending: string; passed: string; failed: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN inspection_status = 'PENDING' THEN 1 END) as pending, COUNT(CASE WHEN inspection_status = 'PASSED' THEN 1 END) as passed, COUNT(CASE WHEN inspection_status = 'FAILED' THEN 1 END) as failed FROM inspection_lots WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query<{ cnt: string; pending: string; passed: string; failed: string }>(`SELECT COUNT(*) as cnt, COUNT(CASE WHEN inspection_status = 'PENDING' THEN 1 END) as pending, COUNT(CASE WHEN inspection_status = 'PASSED' THEN 1 END) as passed, COUNT(CASE WHEN inspection_status = 'FAILED' THEN 1 END) as failed FROM fgqc_inspection_lots WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
    ])

    // Calculate First Pass Yield (FPY) and Right First Time (RFT)
    const iqcTotal = Number(iqcResult.rows[0]?.['cnt'] ?? 0)
    const iqcPassed = Number(iqcResult.rows[0]?.['passed'] ?? 0)
    const fqcTotal = Number(fgqcResult.rows[0]?.['cnt'] ?? 0)
    const fqcPassed = Number(fgqcResult.rows[0]?.['passed'] ?? 0)
    const fpy = iqcTotal > 0 ? Math.round((iqcPassed / iqcTotal) * 10000) / 100 : 0
    const rft = fqcTotal > 0 ? Math.round((fqcPassed / fqcTotal) * 10000) / 100 : 0

    return {
      ncrs: { total: Number(ncrResult.rows[0]?.['cnt'] ?? 0), open: Number(ncrResult.rows[0]?.['open'] ?? 0), critical: Number(ncrResult.rows[0]?.['critical'] ?? 0) },
      capas: { total: Number(capaResult.rows[0]?.['cnt'] ?? 0), open: Number(capaResult.rows[0]?.['open'] ?? 0) },
      recalls: { total: Number(recallResult.rows[0]?.['cnt'] ?? 0), active: Number(recallResult.rows[0]?.['active'] ?? 0) },
      iqc: { total: iqcTotal, pending: Number(iqcResult.rows[0]?.['pending'] ?? 0), passed: iqcPassed, failed: Number(iqcResult.rows[0]?.['failed'] ?? 0) },
      fgqc: { total: fqcTotal, pending: Number(fgqcResult.rows[0]?.['pending'] ?? 0), passed: fqcPassed, failed: Number(fgqcResult.rows[0]?.['failed'] ?? 0) },
      kpis: { firstPassYield: fpy, rightFirstTime: rft },
    }
  },

  async calculateQualityKpis(period: string) {
    const { tenantId } = getContext()
    // First Pass Yield
    const iqcResult = await query<{ total: string; passed: string }>(`SELECT COUNT(*) as total, COUNT(CASE WHEN inspection_status = 'PASSED' THEN 1 END) as passed FROM inspection_lots WHERE tenant_id = $1 AND deleted_at IS NULL AND lot_date >= DATE_TRUNC('month', NOW())`, [tenantId])
    const fpy = Number(iqcResult.rows[0]?.['total'] ?? 0) > 0 ? Math.round((Number(iqcResult.rows[0]?.['passed'] ?? 0) / Number(iqcResult.rows[0]?.['total'] ?? 1)) * 10000) / 100 : 0

    // Defect Rate (NCRs per 1000 units inspected)
    const ncrResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ncrs WHERE tenant_id = $1 AND deleted_at IS NULL AND ncr_date >= DATE_TRUNC('month', NOW())`, [tenantId])
    const defectRate = Number(ncrResult.rows[0]?.['cnt'] ?? 0)

    // CAPA Closure Rate
    const capaResult = await query<{ total: string; closed: string }>(`SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed FROM capa_records WHERE tenant_id = $1 AND deleted_at IS NULL AND capa_date >= DATE_TRUNC('month', NOW())`, [tenantId])
    const capaClosureRate = Number(capaResult.rows[0]?.['total'] ?? 0) > 0 ? Math.round((Number(capaResult.rows[0]?.['closed'] ?? 0) / Number(capaResult.rows[0]?.['total'] ?? 1)) * 10000) / 100 : 0

    // Upsert KPIs
    await qualityKpiRepository.upsert({ tenantId, kpiCode: 'FPY', kpiName: 'First Pass Yield', kpiType: 'PERCENTAGE', kpiValue: fpy, kpiTarget: 95, kpiUnit: '%', period, trend: fpy >= 95 ? 'UP' : 'DOWN', status: fpy >= 95 ? 'ON_TARGET' : 'BELOW_TARGET' })
    await qualityKpiRepository.upsert({ tenantId, kpiCode: 'DEFECT_RATE', kpiName: 'Defect Rate (NCRs)', kpiType: 'COUNT', kpiValue: defectRate, kpiTarget: 5, kpiUnit: 'count', period, trend: defectRate <= 5 ? 'UP' : 'DOWN', status: defectRate <= 5 ? 'ON_TARGET' : 'BELOW_TARGET' })
    await qualityKpiRepository.upsert({ tenantId, kpiCode: 'CAPA_CLOSURE', kpiName: 'CAPA Closure Rate', kpiType: 'PERCENTAGE', kpiValue: capaClosureRate, kpiTarget: 90, kpiUnit: '%', period, trend: capaClosureRate >= 90 ? 'UP' : 'DOWN', status: capaClosureRate >= 90 ? 'ON_TARGET' : 'BELOW_TARGET' })

    return { firstPassYield: fpy, defectRate, capaClosureRate }
  },
}
