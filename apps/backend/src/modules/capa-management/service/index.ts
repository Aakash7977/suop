/** CAPA Management Service — Actions, verification, effectiveness, escalations */
import '@/modules/capa-management/workflow'
import { capaActionRepository, capaVerificationRepository, capaEffectivenessRepository, capaEscalationRepository } from '../repository'
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

export const capaManagementService = {
  async transitionCapa(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await query(`SELECT * FROM capa_records WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    if (existing.rows.length === 0) throw new NotFoundError('CAPA', id)
    const capa = existing.rows[0]!

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('QMSCAPALifecycle')
    const check = await machine.canTransition({ id, status: String(capa['status']), version: Number(capa['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'CAPA.TRANSITION_DENIED' })

    // Business rule: Every CAPA requires effectiveness verification before closure
    if (targetStatus === 'CLOSED' && String(capa['status']) !== 'EFFECTIVENESS_REVIEW') {
      // Check if effectiveness review exists
      const effResult = await query(`SELECT id FROM capa_effectiveness_reviews WHERE tenant_id = $1 AND capa_id = $2 AND is_effective = true`, [tenantId, id])
      if (effResult.rows.length === 0) {
        throw new BusinessRuleError('CAPA cannot be closed without effectiveness verification', { code: 'CAPA.NO_EFFECTIVENESS' })
      }
    }

    const result = await query(`UPDATE capa_records SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, targetStatus, userId, version])
    if (result.rows.length === 0) throw new BusinessRuleError('CAPA was modified by another transaction', { code: 'CAPA.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CAPA_TRANSITION', entityType: 'CAPA', entityId: id, entityCode: String(capa['capa_number']), before: { status: capa['status'] }, after: { status: targetStatus } })

    if (targetStatus === 'CLOSED') {
      await eventBus.writeToOutbox({ eventName: 'CAPAClosed', payload: { capaId: id, capaNumber: String(capa['capa_number']) }, tenantId })
    }

    return result.rows[0]
  },

  async addAction(capaId: string, data: { actionType: 'CORRECTIVE' | 'PREVENTIVE'; actionDescription: string; actionOwner?: string; actionOwnerName?: string; dueDate?: string; priority?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await capaActionRepository.create({
      tenantId, capaId, actionType: data.actionType, actionDescription: data.actionDescription,
      actionOwner: data.actionOwner, actionOwnerName: data.actionOwnerName,
      dueDate: data.dueDate, status: 'OPEN', priority: data.priority ?? 'NORMAL',
      escalationLevel: 0, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CAPA_ACTION_ADDED', entityType: 'CAPA', entityId: capaId, after: { actionId: id, actionType: data.actionType } })
    return { id }
  },

  async listActions(capaId: string) {
    const { tenantId } = getContext()
    return capaActionRepository.listForCapa(tenantId, capaId)
  },

  async completeAction(actionId: string) {
    const { tenantId, userId, ctx } = getContext()
    const updated = await capaActionRepository.update(tenantId, actionId, { status: 'COMPLETED', completedDate: new Date().toISOString() })
    if (!updated) throw new NotFoundError('CAPAAction', actionId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CAPA_ACTION_COMPLETED', entityType: 'CAPA', entityId: String(updated['capa_id']), after: { actionId } })
    return updated
  },

  async escalateAction(capaId: string, actionId: string, data: { escalationReason: string; escalatedTo?: string; escalatedToName?: string }) {
    const { tenantId, userId, ctx } = getContext()
    // Get current escalation level
    const actions = await capaActionRepository.listForCapa(tenantId, capaId)
    const action = actions.find(a => String(a['id']) === actionId)
    if (!action) throw new NotFoundError('CAPAAction', actionId)
    const newLevel = Number(action['escalation_level'] ?? 0) + 1

    await capaActionRepository.update(tenantId, actionId, { escalationLevel: newLevel, escalatedAt: new Date().toISOString(), escalatedTo: data.escalatedTo, escalatedToName: data.escalatedToName })
    await capaEscalationRepository.create({
      tenantId, capaId, actionId, escalationLevel: newLevel,
      escalatedFrom: userId, escalatedFromName: ctx.userEmail,
      escalatedTo: data.escalatedTo, escalatedToName: data.escalatedToName,
      escalationReason: data.escalationReason, status: 'ACTIVE',
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CAPA_ESCALATED', entityType: 'CAPA', entityId: capaId, after: { actionId, escalationLevel: newLevel } })
    return { escalationLevel: newLevel }
  },

  async addVerification(capaId: string, data: { verificationType?: string; verificationMethod?: string; result: string; evidence?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await capaVerificationRepository.create({
      tenantId, capaId, verificationType: data.verificationType ?? 'EFFECTIVENESS',
      verificationMethod: data.verificationMethod, result: data.result,
      verifiedBy: userId, verifiedByName: ctx.userEmail, evidence: data.evidence, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CAPA_VERIFIED', entityType: 'CAPA', entityId: capaId, after: { verificationId: id, result: data.result } })
    return { id }
  },

  async listVerifications(capaId: string) {
    const { tenantId } = getContext()
    return capaVerificationRepository.listForCapa(tenantId, capaId)
  },

  async addEffectivenessReview(capaId: string, data: { reviewPeriodDays?: number; effectivenessRating: string; metricsBefore?: Record<string, unknown>; metricsAfter?: Record<string, unknown>; isEffective: boolean; followUpRequired?: boolean; followUpNotes?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await capaEffectivenessRepository.create({
      tenantId, capaId, reviewPeriodDays: data.reviewPeriodDays ?? 30,
      effectivenessRating: data.effectivenessRating,
      metricsBefore: data.metricsBefore, metricsAfter: data.metricsAfter,
      isEffective: data.isEffective, reviewedBy: userId, reviewedByName: ctx.userEmail,
      followUpRequired: data.followUpRequired ?? false, followUpNotes: data.followUpNotes, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CAPA_EFFECTIVENESS_REVIEW', entityType: 'CAPA', entityId: capaId, after: { reviewId: id, isEffective: data.isEffective } })
    return { id }
  },

  async listEffectivenessReviews(capaId: string) {
    const { tenantId } = getContext()
    return capaEffectivenessRepository.listForCapa(tenantId, capaId)
  },

  async listEscalations(capaId: string) {
    const { tenantId } = getContext()
    return capaEscalationRepository.listForCapa(tenantId, capaId)
  },
}
