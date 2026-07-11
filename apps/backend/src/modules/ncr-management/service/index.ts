/** NCR Management Service — Root cause, containment, disposition, material hold, quality cost */
import '@/modules/ncr-management/workflow'
import { ncrRootCauseRepository, ncrContainmentRepository, ncrDispositionRepository, materialHoldRepository, qualityCostRepository } from '../repository'
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

export const ncrManagementService = {
  // ═══ NCR Transition (extended workflow) ═══════════════════════════════════

  async transitionNcr(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const existing = await query(`SELECT * FROM ncrs WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    if (existing.rows.length === 0) throw new NotFoundError('NCR', id)
    const ncr = existing.rows[0]!

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('QMSNCRLifecycle')
    const check = await machine.canTransition({ id, status: String(ncr['status']), version: Number(ncr['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'NCR.TRANSITION_DENIED' })

    const result = await query(`UPDATE ncrs SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, targetStatus, userId, version])
    if (result.rows.length === 0) throw new BusinessRuleError('NCR was modified by another transaction', { code: 'NCR.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'NCR_TRANSITION', entityType: 'NCR', entityId: id, entityCode: String(ncr['ncr_number']), before: { status: ncr['status'] }, after: { status: targetStatus } })

    // Business rule: High severity NCR automatically creates CAPA
    if (targetStatus === 'CAPA_INITIATED' && (ncr['severity'] === 'CRITICAL' || ncr['severity'] === 'MAJOR')) {
      await this.autoCreateCapa(tenantId, id, String(ncr['ncr_number']), userId, userEmail, ctx.correlationId)
    }

    return result.rows[0]
  },

  async autoCreateCapa(tenantId: string, ncrId: string, ncrNumber: string, userId: string, userName: string, correlationId: string) {
    const capaNumber = `CAPA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`
    const id = randomUUID()
    await query(`INSERT INTO capa_records (id, tenant_id, capa_number, capa_date, ncr_id, ncr_number, corrective_action, preventive_action, action_owner, action_owner_name, status, version, created_at, updated_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,'OPEN',0,NOW(),NOW())`, [id, tenantId, capaNumber, ncrId, ncrNumber, `Auto-generated corrective action for NCR ${ncrNumber}`, `Auto-generated preventive action for NCR ${ncrNumber}`, userId, userName])
    await auditService.log({ tenantId, correlationId, actorType: 'SYSTEM', actorId: userId, actorName: userName, action: 'CAPA_AUTO_CREATED', entityType: 'NCR', entityId: ncrId, entityCode: ncrNumber, after: { capaId: id, capaNumber } })
    await eventBus.writeToOutbox({ eventName: 'CAPAAutoCreated', payload: { capaId: id, capaNumber, ncrId, ncrNumber }, tenantId })
    return { id, capaNumber }
  },

  // ═══ Root Cause ═══════════════════════════════════════════════════════════

  async addRootCause(ncrId: string, data: { rootCauseCategory: string; rootCauseDescription: string; analysisMethod?: string; fishboneCategory?: string; remarks?: string }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const id = await ncrRootCauseRepository.create({
      tenantId, ncrId, rootCauseCategory: data.rootCauseCategory, rootCauseDescription: data.rootCauseDescription,
      analysisMethod: data.analysisMethod, fishboneCategory: data.fishboneCategory,
      identifiedBy: userId, identifiedByName: userEmail, isVerified: false, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'ROOT_CAUSE_ADDED', entityType: 'NCR', entityId: ncrId, after: { rootCauseId: id, category: data.rootCauseCategory } })
    return { id }
  },

  async listRootCauses(ncrId: string) {
    const { tenantId } = getContext()
    return ncrRootCauseRepository.listForNcr(tenantId, ncrId)
  },

  // ═══ Containment ══════════════════════════════════════════════════════════

  async addContainment(ncrId: string, data: { containmentAction: string; containmentType?: string; affectedQty?: number; affectedLocation?: string; remarks?: string }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const id = await ncrContainmentRepository.create({
      tenantId, ncrId, containmentAction: data.containmentAction, containmentType: data.containmentType ?? 'IMMEDIATE',
      affectedQty: data.affectedQty, affectedLocation: data.affectedLocation,
      implementedBy: userId, implementedByName: userEmail, isEffective: false, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'CONTAINMENT_ADDED', entityType: 'NCR', entityId: ncrId, after: { containmentId: id } })
    return { id }
  },

  async listContainments(ncrId: string) {
    const { tenantId } = getContext()
    return ncrContainmentRepository.listForNcr(tenantId, ncrId)
  },

  // ═══ Disposition ══════════════════════════════════════════════════════════

  async addDisposition(ncrId: string, data: { dispositionType: string; dispositionReason: string; dispositionQty?: number; remarks?: string }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const id = await ncrDispositionRepository.create({
      tenantId, ncrId, dispositionType: data.dispositionType, dispositionReason: data.dispositionReason,
      dispositionQty: data.dispositionQty, approvedBy: userId, approvedByName: userEmail, approvedAt: new Date().toISOString(),
      status: 'APPROVED', remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'DISPOSITION_ADDED', entityType: 'NCR', entityId: ncrId, after: { dispositionId: id, type: data.dispositionType } })
    return { id }
  },

  async listDispositions(ncrId: string) {
    const { tenantId } = getContext()
    return ncrDispositionRepository.listForNcr(tenantId, ncrId)
  },

  // ═══ Material Hold ════════════════════════════════════════════════════════

  async createMaterialHold(data: {
    holdType?: string; sourceId?: string; sourceType?: string; sourceNumber?: string
    productId: string; productSku: string; productName?: string
    batchId?: string; batchNumber?: string; lotId?: string; lotNumber?: string
    warehouseId?: string; warehouseName?: string
    heldQty: number; uomId?: string; uomCode?: string
    holdReason: string; holdLocation?: string; remarks?: string
  }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    if (data.heldQty <= 0) throw new BusinessRuleError('Held quantity must be positive', { code: 'MH.INVALID_QTY' })

    const holdNumber = await materialHoldRepository.generateHoldNumber(tenantId)
    const hold = await materialHoldRepository.create({
      tenantId, holdNumber, holdType: data.holdType ?? 'NCR',
      sourceId: data.sourceId, sourceType: data.sourceType, sourceNumber: data.sourceNumber,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchId: data.batchId, batchNumber: data.batchNumber, lotId: data.lotId, lotNumber: data.lotNumber,
      warehouseId: data.warehouseId, warehouseName: data.warehouseName,
      heldQty: data.heldQty, uomId: data.uomId, uomCode: data.uomCode,
      holdReason: data.holdReason, holdLocation: data.holdLocation ?? 'QUALITY_HOLD_AREA',
      heldBy: userId, heldByName: userEmail,
      scrapQty: 0, reworkQty: 0, status: 'ACTIVE', remarks: data.remarks,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'MATERIAL_HOLD_CREATED', entityType: 'MaterialHold', entityId: String(hold!['id']), entityCode: holdNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'MaterialHoldCreated', payload: { holdId: String(hold!['id']), holdNumber, productId: data.productId, heldQty: data.heldQty }, tenantId })

    return hold
  },

  async listMaterialHolds(params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const { tenantId } = getContext()
    return materialHoldRepository.list(tenantId, params)
  },

  async releaseMaterialHold(id: string, releaseReason: string, disposition: string) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const existing = await materialHoldRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('MaterialHold', id)
    const released = await materialHoldRepository.release(tenantId, id, userId, userEmail, releaseReason, disposition)
    if (!released) throw new BusinessRuleError('Hold is not active or already released', { code: 'MH.NOT_ACTIVE' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'MATERIAL_HOLD_RELEASED', entityType: 'MaterialHold', entityId: id, entityCode: String(existing['hold_number']), after: { releaseReason, disposition } })
    await eventBus.writeToOutbox({ eventName: 'MaterialHoldReleased', payload: { holdId: id, disposition }, tenantId })
    return released
  },

  // ═══ Quality Cost ═════════════════════════════════════════════════════════

  async recordQualityCost(data: { costCategory: string; costType: string; ncrId?: string; capaId?: string; productId?: string; productSku?: string; amount: number; currency?: string; description?: string }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    if (data.amount <= 0) throw new BusinessRuleError('Cost amount must be positive', { code: 'QC.INVALID_AMOUNT' })
    const id = await qualityCostRepository.create({ tenantId, ...data, recordedBy: userId, recordedByName: userEmail })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'QUALITY_COST_RECORDED', entityType: 'QualityCost', entityId: id, after: data })
    return { id }
  },

  async listQualityCosts(params: { page?: number; pageSize?: number; costCategory?: string } = {}) {
    const { tenantId } = getContext()
    return qualityCostRepository.list(tenantId, params)
  },
}

// Need to import randomUUID for autoCreateCapa
import { randomUUID } from 'node:crypto'
