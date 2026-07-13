/** CAPA Management Repository */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { randomUUID } from 'node:crypto'

export const capaActionRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO capa_actions (id, tenant_id, capa_id, action_type, action_description, action_owner, action_owner_name, due_date, completed_date, status, priority, escalation_level, escalated_at, escalated_to, escalated_to_name, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())`, [id, data['tenantId'], data['capaId'], data['actionType'], data['actionDescription'], data['actionOwner'] ?? null, data['actionOwnerName'] ?? null, data['dueDate'] ?? null, data['completedDate'] ?? null, data['status'] ?? 'OPEN', data['priority'] ?? 'NORMAL', data['escalationLevel'] ?? 0, data['escalatedAt'] ?? null, data['escalatedTo'] ?? null, data['escalatedToName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForCapa(tenantId: string, capaId: string) {
    const result = await scopedQuery(`SELECT * FROM capa_actions WHERE tenant_id = $1 AND capa_id = $2 ORDER BY created_at`, [tenantId, capaId], { tableAlias: 'capa_actions' })
    return result.rows
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const setParts: string[] = ['updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = { status: 'status', completedDate: 'completed_date', escalationLevel: 'escalation_level', escalatedAt: 'escalated_at', escalatedTo: 'escalated_to', escalatedToName: 'escalated_to_name' }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    const result = await query(`UPDATE capa_actions SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 RETURNING *`, vals)
    return result.rows[0] ?? null
  },
}

export const capaVerificationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO capa_verifications (id, tenant_id, capa_id, verification_type, verification_method, verification_date, result, verified_by, verified_by_name, evidence, remarks, created_at) VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,$8,$9,$10,NOW())`, [id, data['tenantId'], data['capaId'], data['verificationType'] ?? 'EFFECTIVENESS', data['verificationMethod'] ?? null, data['result'], data['verifiedBy'] ?? null, data['verifiedByName'] ?? null, data['evidence'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForCapa(tenantId: string, capaId: string) {
    const result = await scopedQuery(`SELECT * FROM capa_verifications WHERE tenant_id = $1 AND capa_id = $2 ORDER BY verification_date DESC`, [tenantId, capaId], { tableAlias: 'capa_verifications' })
    return result.rows
  },
}

export const capaEffectivenessRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO capa_effectiveness_reviews (id, tenant_id, capa_id, review_date, review_period_days, effectiveness_rating, metrics_before, metrics_after, is_effective, reviewed_by, reviewed_by_name, follow_up_required, follow_up_notes, remarks, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`, [id, data['tenantId'], data['capaId'], data['reviewPeriodDays'] ?? 30, data['effectivenessRating'], data['metricsBefore'] ? JSON.stringify(data['metricsBefore']) : null, data['metricsAfter'] ? JSON.stringify(data['metricsAfter']) : null, data['isEffective'] ?? false, data['reviewedBy'] ?? null, data['reviewedByName'] ?? null, data['followUpRequired'] ?? false, data['followUpNotes'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForCapa(tenantId: string, capaId: string) {
    const result = await scopedQuery(`SELECT * FROM capa_effectiveness_reviews WHERE tenant_id = $1 AND capa_id = $2 ORDER BY review_date DESC`, [tenantId, capaId], { tableAlias: 'capa_effectiveness_reviews' })
    return result.rows
  },
}

export const capaEscalationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO capa_escalations (id, tenant_id, capa_id, action_id, escalation_level, escalated_from, escalated_from_name, escalated_to, escalated_to_name, escalation_reason, escalated_at, resolved_at, status, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),$11,$12,$13,NOW())`, [id, data['tenantId'], data['capaId'], data['actionId'] ?? null, data['escalationLevel'], data['escalatedFrom'] ?? null, data['escalatedFromName'] ?? null, data['escalatedTo'] ?? null, data['escalatedToName'] ?? null, data['escalationReason'], data['resolvedAt'] ?? null, data['status'] ?? 'ACTIVE', data['remarks'] ?? null])
    return id
  },
  async listForCapa(tenantId: string, capaId: string) {
    const result = await scopedQuery(`SELECT * FROM capa_escalations WHERE tenant_id = $1 AND capa_id = $2 ORDER BY escalated_at DESC`, [tenantId, capaId], { tableAlias: 'capa_escalations' })
    return result.rows
  },
}
