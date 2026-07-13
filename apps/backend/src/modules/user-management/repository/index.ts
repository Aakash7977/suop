/**
 * User Management Repository — Roles, Permissions, Assignments, Delegations, Preferences
 */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const roleRepository = {
  async create(data: { tenantId: string; name: string; displayName: string; description?: string; category?: string; isSystem?: boolean; isTemplate?: boolean; createdBy?: string }) {
    const id = randomUUID()
    await query(
      `INSERT INTO roles (id, tenant_id, name, display_name, description, category, is_system, is_template, status, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'DRAFT',0,NOW(),NOW(),$9)`,
      [id, data.tenantId, data.name, data.displayName, data.description ?? null, data.category ?? 'CUSTOM', data.isSystem ?? false, data.isTemplate ?? false, data.createdBy ?? null]
    )
    return this.findById(data.tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM roles WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'roles' })
    return result.rows[0] ?? null
  },

  async findByName(tenantId: string, name: string) {
    const result = await scopedQuery(`SELECT * FROM roles WHERE tenant_id = $1 AND name = $2 AND deleted_at IS NULL`, [tenantId, name], { tableAlias: 'roles' })
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; category?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (name ILIKE $${idx} OR display_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.category) { where += ` AND category = $${idx++}`; sqlParams.push(params.category) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const total = await scopedCount('roles', 'roles', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM roles WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'roles' })
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: { displayName?: string; description?: string; status?: string }, version: number, updatedBy?: string) {
    const result = await query(
      `UPDATE roles SET display_name = COALESCE($3, display_name), description = COALESCE($4, description), status = COALESCE($5, status), version = version + 1, updated_at = NOW(), updated_by = $6 WHERE tenant_id = $1 AND id = $2 AND version = $7 AND deleted_at IS NULL RETURNING *`,
      [tenantId, id, data.displayName ?? null, data.description ?? null, data.status ?? null, updatedBy ?? null, version]
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE roles SET deleted_at = NOW(), status = 'ARCHIVED', version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async clone(tenantId: string, sourceRoleId: string, newName: string, newDisplayName: string, createdBy?: string) {
    const source = await this.findById(tenantId, sourceRoleId)
    if (!source) return null
    const cloned = await this.create({ tenantId, name: newName, displayName: newDisplayName, description: `Cloned from ${source['name']}`, category: 'CUSTOM', createdBy })
    if (cloned) {
      // Copy permissions
      const perms = await query(`SELECT permission_id FROM role_permissions WHERE tenant_id = $1 AND role_id = $2`, [tenantId, sourceRoleId])
      for (const p of perms.rows) {
        await query(`INSERT INTO role_permissions (id, tenant_id, role_id, permission_id, assigned_at, created_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT DO NOTHING`, [randomUUID(), tenantId, cloned['id'], p['permission_id']])
      }
    }
    return cloned
  },
}

export const permissionRepository = {
  async list(params: { module?: string; group?: string; search?: string } = {}) {
    let where = 'is_active = true'
    const sqlParams: unknown[] = []; let idx = 1
    if (params.module) { where += ` AND module = $${idx++}`; sqlParams.push(params.module) }
    if (params.group) { where += ` AND permission_group = $${idx++}`; sqlParams.push(params.group) }
    if (params.search) { where += ` AND (code ILIKE $${idx} OR display_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const result = await query(`SELECT * FROM permissions WHERE ${where} ORDER BY permission_group, sort_order, module, feature, action`, sqlParams)
    return result.rows
  },

  async findByCode(code: string) {
    const result = await scopedQuery(`SELECT * FROM permissions WHERE code = $1`, [code], { tableAlias: 'permissions' })
    return result.rows[0] ?? null
  },

  async listModules() {
    const result = await query(`SELECT DISTINCT module FROM permissions WHERE is_active = true ORDER BY module`)
    return result.rows.map((r: Record<string, unknown>) => String(r['module']))
  },

  async listGroups() {
    const result = await query(`SELECT DISTINCT permission_group FROM permissions WHERE is_active = true AND permission_group IS NOT NULL ORDER BY permission_group`)
    return result.rows.map((r: Record<string, unknown>) => String(r['permission_group']))
  },
}

export const rolePermissionRepository = {
  async assign(tenantId: string, roleId: string, permissionId: string, assignedBy?: string) {
    await query(`INSERT INTO role_permissions (id, tenant_id, role_id, permission_id, assigned_by, assigned_at, created_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT DO NOTHING`, [randomUUID(), tenantId, roleId, permissionId, assignedBy ?? null])
  },

  async revoke(tenantId: string, roleId: string, permissionId: string) {
    await query(`DELETE FROM role_permissions WHERE tenant_id = $1 AND role_id = $2 AND permission_id = $3`, [tenantId, roleId, permissionId])
  },

  async listForRole(tenantId: string, roleId: string) {
    const result = await query(
      `SELECT p.* FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.tenant_id = $1 AND rp.role_id = $2 ORDER BY p.module, p.feature, p.action`,
      [tenantId, roleId]
    )
    return result.rows
  },

  async listForRoleCodes(tenantId: string, roleId: string): Promise<string[]> {
    const result = await query(`SELECT p.code FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.tenant_id = $1 AND rp.role_id = $2`, [tenantId, roleId])
    return result.rows.map((r: Record<string, unknown>) => String(r['code']))
  },
}

export const userAssignmentRepository = {
  async create(data: { tenantId: string; userId: string; entityType: string; entityId: string; entityName?: string; roleId?: string; isPrimary?: boolean; assignedBy?: string }) {
    const id = randomUUID()
    await query(
      `INSERT INTO user_assignments (id, tenant_id, user_id, entity_type, entity_id, entity_name, role_id, is_primary, status, assigned_by, assigned_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE',$9,NOW(),NOW(),NOW())`,
      [id, data.tenantId, data.userId, data.entityType, data.entityId, data.entityName ?? null, data.roleId ?? null, data.isPrimary ?? false, data.assignedBy ?? null]
    )
    return this.findById(data.tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM user_assignments WHERE tenant_id = $1 AND id = $2`, [tenantId, id], { tableAlias: 'user_assignments' })
    return result.rows[0] ?? null
  },

  async listForUser(tenantId: string, userId: string) {
    const result = await scopedQuery(`SELECT * FROM user_assignments WHERE tenant_id = $1 AND user_id = $2 AND status = 'ACTIVE' ORDER BY is_primary DESC, assigned_at DESC`, [tenantId, userId], { tableAlias: 'user_assignments' })
    return result.rows
  },

  async revoke(tenantId: string, id: string, revokedBy?: string) {
    await query(`UPDATE user_assignments SET status = 'INACTIVE', revoked_at = NOW(), revoked_by = $3, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, id, revokedBy ?? null])
  },
}

export const delegationRepository = {
  async create(data: { tenantId: string; delegatorId: string; delegateId: string; approvalType: string; entityType?: string; entityId?: string; maxAmount?: number; effectiveFrom: string; effectiveTo: string; reason?: string; createdBy?: string }) {
    const id = randomUUID()
    await query(
      `INSERT INTO approval_delegations (id, tenant_id, delegator_id, delegate_id, approval_type, entity_type, entity_id, max_amount, currency, effective_from, effective_to, status, reason, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'INR',$9,$10,'ACTIVE',$11,$12,NOW(),NOW())`,
      [id, data.tenantId, data.delegatorId, data.delegateId, data.approvalType, data.entityType ?? null, data.entityId ?? null, data.maxAmount ?? null, data.effectiveFrom, data.effectiveTo, data.reason ?? null, data.createdBy ?? null]
    )
    return id
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; delegatorId?: string; delegateId?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'; const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.delegatorId) { where += ` AND delegator_id = $${idx++}`; sqlParams.push(params.delegatorId) }
    if (params.delegateId) { where += ` AND delegate_id = $${idx++}`; sqlParams.push(params.delegateId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const total = await scopedCount('approval_delegations', 'approval_delegations', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM approval_delegations WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'approval_delegations' })
    return { rows: result.rows, total, page, pageSize }
  },

  async revoke(tenantId: string, id: string, revokedBy?: string) {
    await query(`UPDATE approval_delegations SET status = 'REVOKED', revoked_at = NOW(), revoked_by = $3, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, id, revokedBy ?? null])
  },
}

export const userPreferenceRepository = {
  async get(tenantId: string, userId: string, key: string) {
    const result = await scopedQuery(`SELECT * FROM user_preferences WHERE tenant_id = $1 AND user_id = $2 AND pref_key = $3`, [tenantId, userId, key], { tableAlias: 'user_preferences' })
    return result.rows[0] ?? null
  },

  async set(tenantId: string, userId: string, key: string, value: string) {
    await query(
      `INSERT INTO user_preferences (id, tenant_id, user_id, pref_key, pref_value, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (tenant_id, user_id, pref_key) DO UPDATE SET pref_value = $5, updated_at = NOW()`,
      [randomUUID(), tenantId, userId, key, value]
    )
  },

  async listForUser(tenantId: string, userId: string) {
    const result = await scopedQuery(`SELECT * FROM user_preferences WHERE tenant_id = $1 AND user_id = $2`, [tenantId, userId], { tableAlias: 'user_preferences' })
    return result.rows
  },
}
