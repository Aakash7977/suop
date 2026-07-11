/**
 * User Management Service — Business logic for users, roles, permissions, assignments, delegations.
 *
 * Uses Phase 0 foundation: Workflow Engine, Audit Service, Event Bus, RBAC.
 * Uses Phase 2: Auth repository for user operations.
 */
import {
  roleRepository, permissionRepository, rolePermissionRepository,
  userAssignmentRepository, delegationRepository, userPreferenceRepository,
} from '../repository'
import '@/modules/user-management/workflow'

import { auditService } from '@/core/audit'

import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { userRepository, userRoleRepository, loginHistoryRepository, refreshTokenRepository } from '@/modules/auth/repository'
import {
  BusinessRuleError, NotFoundError, ConflictError, AuthorizationError,
} from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

// ─── User Management Service ────────────────────────────────────────────────

export const userService = {
  async list(params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (email ILIKE $${idx} OR username ILIKE $${idx} OR first_name ILIKE $${idx} OR last_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM users WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT id, tenant_id, username, email, email_verified, status, first_name, last_name, designation, last_login_at, last_login_ip, failed_login_attempts, mfa_enabled, created_at FROM users WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const user = await userRepository.findById(tenantId, id)
    if (!user) throw new NotFoundError('User', id)
    const roles = await userRoleRepository.getRoles(id)
    const assignments = await userAssignmentRepository.listForUser(tenantId, id)
    return { ...user, roles, assignments }
  },

  async update(id: string, data: { firstName?: string; lastName?: string; designation?: string; phone?: string; timezone?: string; locale?: string }, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await userRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('User', id)
    await query(
      `UPDATE users SET first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name), designation = COALESCE($5, designation), phone = COALESCE($6, phone), timezone = COALESCE($7, timezone), locale = COALESCE($8, locale), version = version + 1, updated_at = NOW(), updated_by = $9 WHERE tenant_id = $1 AND id = $2 AND version = $10`,
      [tenantId, id, data.firstName ?? null, data.lastName ?? null, data.designation ?? null, data.phone ?? null, data.timezone ?? null, data.locale ?? null, userId, version]
    )
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'User', entityId: id, before: existing, reason: 'User profile updated' })
    return userRepository.findById(tenantId, id)
  },

  async assignRole(userId: string, roleName: string) {
    const { tenantId, userId: adminId, ctx } = getContext()
    const role = await roleRepository.findByName(tenantId, roleName)
    if (!role) throw new NotFoundError('Role', roleName)
    await userRoleRepository.assignRole(tenantId, userId, roleName, adminId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: adminId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'User', entityId: userId, reason: `Role assigned: ${roleName}` })
  },

  async revokeRole(userId: string, roleName: string) {
    const { tenantId, userId: adminId, ctx } = getContext()
    await userRoleRepository.revokeRole(userId, roleName)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: adminId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'User', entityId: userId, reason: `Role revoked: ${roleName}` })
  },

  async assignToEntity(params: { userId: string; entityType: string; entityId: string; entityName?: string; roleId?: string; isPrimary?: boolean }) {
    const { tenantId, userId: adminId, ctx } = getContext()
    const assignment = await userAssignmentRepository.create({ tenantId, ...params, assignedBy: adminId })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: adminId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'UserAssignment', entityId: assignment ? String(assignment['id']) : null, reason: `Assigned to ${params.entityType}: ${params.entityName ?? params.entityId}` })
    return assignment
  },

  async revokeAssignment(assignmentId: string) {
    const { tenantId, userId: adminId, ctx } = getContext()
    await userAssignmentRepository.revoke(tenantId, assignmentId, adminId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: adminId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'UserAssignment', entityId: assignmentId, reason: 'Assignment revoked' })
  },

  async lockUser(targetUserId: string) {
    const { tenantId, userId, ctx } = getContext()
    await userRepository.lockUser(targetUserId, 30)
    await userRepository.updateStatus(targetUserId, 'LOCKED', userId)
    await refreshTokenRepository.revokeAllForUser(targetUserId, 'Locked by admin')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'User', entityId: targetUserId, severity: 'WARN', reason: 'Account locked by admin' })
  },

  async unlockUser(targetUserId: string) {
    const { tenantId, userId, ctx } = getContext()
    await userRepository.unlockUser(targetUserId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'User', entityId: targetUserId, reason: 'Account unlocked by admin' })
  },

  async getUserSessions(userId: string) {
    return refreshTokenRepository.listActiveForUser(userId)
  },

  async getUserLoginHistory(userId: string) {
    return loginHistoryRepository.listForUser(userId, 20)
  },

  async revokeAllSessions(userId: string) {
    const { tenantId, userId: adminId, ctx } = getContext()
    await refreshTokenRepository.revokeAllForUser(userId, 'Revoked by admin')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: adminId, actorName: ctx.userEmail, action: 'LOGOUT', entityType: 'User', entityId: userId, reason: 'All sessions revoked by admin' })
  },

  async getPreferences(userId: string) {
    const { tenantId } = getContext()
    return userPreferenceRepository.listForUser(tenantId, userId)
  },

  async setPreference(userId: string, key: string, value: string) {
    const { tenantId } = getContext()
    await userPreferenceRepository.set(tenantId, userId, key, value)
  },
}

// ─── Role Management Service ────────────────────────────────────────────────

export const roleService = {
  async list(params: { page?: number; pageSize?: number; search?: string; category?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    return roleRepository.list(tenantId, params)
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const role = await roleRepository.findById(tenantId, id)
    if (!role) throw new NotFoundError('Role', id)
    const permissions = await rolePermissionRepository.listForRole(tenantId, id)
    return { ...role, permissions }
  },

  async create(data: { name: string; displayName: string; description?: string; category?: string; permissionCodes?: string[] }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await roleRepository.findByName(tenantId, data.name)
    if (existing) throw new ConflictError(`Role '${data.name}' already exists`)
    const role = await roleRepository.create({ tenantId, name: data.name, displayName: data.displayName, description: data.description, category: data.category ?? 'CUSTOM', createdBy: userId })
    if (!role) throw new Error('Failed to create role')
    // Assign permissions if provided
    if (data.permissionCodes) {
      for (const code of data.permissionCodes) {
        const perm = await permissionRepository.findByCode(code)
        if (perm) await rolePermissionRepository.assign(tenantId, String(role['id']), String(perm['id']), userId)
      }
    }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Role', entityId: String(role['id']), entityCode: String(data.name) })
    return role
  },

  async update(id: string, data: { displayName?: string; description?: string; status?: string }, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const updated = await roleRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new Error('Role update failed — version mismatch or not found')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Role', entityId: String(id) })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const role = await roleRepository.findById(tenantId, id)
    if (!role) throw new NotFoundError('Role', id)
    if (role['is_system']) throw new BusinessRuleError('Cannot delete system role', { code: 'ROLE.SYSTEM_ROLE' })
    const deleted = await roleRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new Error('Role delete failed — version mismatch')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'Role', entityId: String(id) })
  },

  async clone(sourceRoleId: string, newName: string, newDisplayName: string) {
    const { tenantId, userId, ctx } = getContext()
    const cloned = await roleRepository.clone(tenantId, sourceRoleId, newName, newDisplayName, userId)
    if (!cloned) throw new NotFoundError('Role (source)', sourceRoleId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Role', entityId: String(cloned['id']), entityCode: String(newName), reason: `Cloned from ${sourceRoleId}` })
    return cloned
  },

  async assignPermission(roleId: string, permissionCode: string) {
    const { tenantId, userId, ctx } = getContext()
    const perm = await permissionRepository.findByCode(permissionCode)
    if (!perm) throw new NotFoundError('Permission', permissionCode)
    await rolePermissionRepository.assign(tenantId, roleId, String(perm['id']), userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Role', entityId: roleId, reason: `Permission assigned: ${permissionCode}` })
  },

  async revokePermission(roleId: string, permissionCode: string) {
    const { tenantId, userId, ctx } = getContext()
    const perm = await permissionRepository.findByCode(permissionCode)
    if (!perm) throw new NotFoundError('Permission', permissionCode)
    await rolePermissionRepository.revoke(tenantId, roleId, String(perm['id']))
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Role', entityId: roleId, reason: `Permission revoked: ${permissionCode}` })
  },

  async compareRoles(roleId1: string, roleId2: string) {
    const { tenantId } = getContext()
    const [role1, role2] = await Promise.all([
      roleRepository.findById(tenantId, roleId1),
      roleRepository.findById(tenantId, roleId2),
    ])
    if (!role1 || !role2) throw new NotFoundError('Role')
    const [perms1, perms2] = await Promise.all([
      rolePermissionRepository.listForRoleCodes(tenantId, roleId1),
      rolePermissionRepository.listForRoleCodes(tenantId, roleId2),
    ])
    const set1 = new Set(perms1); const set2 = new Set(perms2)
    return {
      role1: { id: roleId1, name: role1['name'], permissions: perms1 },
      role2: { id: roleId2, name: role2['name'], permissions: perms2 },
      common: perms1.filter((p: string) => set2.has(p)),
      onlyInRole1: perms1.filter((p: string) => !set2.has(p)),
      onlyInRole2: perms2.filter((p: string) => !set1.has(p)),
    }
  },
}

// ─── Permission Service ─────────────────────────────────────────────────────

export const permissionService = {
  async list(params: { module?: string; group?: string; search?: string } = {}) {
    return permissionRepository.list(params)
  },

  async listModules() {
    return permissionRepository.listModules()
  },

  async listGroups() {
    return permissionRepository.listGroups()
  },
}

// ─── Delegation Service ─────────────────────────────────────────────────────

export const delegationService = {
  async create(data: { delegatorId: string; delegateId: string; approvalType: string; entityType?: string; entityId?: string; maxAmount?: number; effectiveFrom: string; effectiveTo: string; reason?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.delegatorId === data.delegateId) throw new BusinessRuleError('Cannot delegate to self', { code: 'DELEGATION.SELF_DELEGATION' })
    const id = await delegationRepository.create({ tenantId, ...data, createdBy: userId })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ApprovalDelegation', entityId: id, reason: `Delegation: ${data.approvalType}` })
    return id
  },

  async list(params: { page?: number; pageSize?: number; delegatorId?: string; delegateId?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    return delegationRepository.list(tenantId, params)
  },

  async revoke(id: string) {
    const { tenantId, userId, ctx } = getContext()
    await delegationRepository.revoke(tenantId, id, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'ApprovalDelegation', entityId: id, reason: 'Delegation revoked' })
  },
}
