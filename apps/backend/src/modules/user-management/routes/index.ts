/**
 * User Management API Routes
 *
 * Users: list, get, update, lock, unlock, assign role, revoke role, sessions, login history
 * Roles: list, get, create, update, delete, clone, assign permission, revoke permission, compare
 * Permissions: list, modules, groups
 * Assignments: create, revoke, list for user
 * Delegations: create, list, revoke
 * Preferences: get, set
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { userService, roleService, permissionService, delegationService } from '../service'

export const userManagementRoutes = new Hono()

// ─── Schemas ────────────────────────────────────────────────────────────────

const roleCreateSchema = z.object({
  name: z.string().min(2).max(50),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['SYSTEM', 'CUSTOM', 'TEMPLATE']).default('CUSTOM'),
  permissionCodes: z.array(z.string()).optional(),
})

const roleCloneSchema = z.object({
  newName: z.string().min(2).max(50),
  newDisplayName: z.string().min(1).max(100),
})

const assignmentSchema = z.object({
  userId: z.string().uuid(),
  entityType: z.enum(['COMPANY', 'BUSINESS_UNIT', 'REGION', 'PLANT', 'WAREHOUSE', 'DEPARTMENT', 'COST_CENTER', 'PROJECT', 'TEAM']),
  entityId: z.string().uuid(),
  entityName: z.string().optional(),
  roleId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false),
})

const delegationSchema = z.object({
  delegatorId: z.string().uuid(),
  delegateId: z.string().uuid(),
  approvalType: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  maxAmount: z.number().positive().optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime(),
  reason: z.string().optional(),
})

// ─── User Routes ────────────────────────────────────────────────────────────

userManagementRoutes.get('/users', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const result = await userService.list({
    page: Number(c.req.query('page') ?? 1),
    pageSize: Number(c.req.query('pageSize') ?? 25),
    search: c.req.query('search') ?? undefined,
    status: c.req.query('status') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

userManagementRoutes.get('/users/:id', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const user = await userService.getById(c.req.param('id')!)
  return c.json(success(user))
})

userManagementRoutes.patch('/users/:id', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const id = c.req.param('id')!
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await userService.update(id, body, version)
  return c.json(success(updated, { message: 'User updated' }))
})

userManagementRoutes.post('/users/:id/lock', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  await userService.lockUser(c.req.param('id')!)
  return c.json(success({ locked: true }, { message: 'User locked' }))
})

userManagementRoutes.post('/users/:id/unlock', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  await userService.unlockUser(c.req.param('id')!)
  return c.json(success({ unlocked: true }, { message: 'User unlocked' }))
})

userManagementRoutes.post('/users/:id/roles/:roleName', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  await userService.assignRole(c.req.param('id')!, c.req.param('roleName')!)
  return c.json(success({ assigned: true }, { message: 'Role assigned' }))
})

userManagementRoutes.delete('/users/:id/roles/:roleName', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  await userService.revokeRole(c.req.param('id')!, c.req.param('roleName')!)
  return c.json(success({ revoked: true }, { message: 'Role revoked' }))
})

userManagementRoutes.get('/users/:id/sessions', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const sessions = await userService.getUserSessions(c.req.param('id')!)
  return c.json(success(sessions))
})

userManagementRoutes.post('/users/:id/sessions/revoke-all', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  await userService.revokeAllSessions(c.req.param('id')!)
  return c.json(success({ revoked: true }, { message: 'All sessions revoked' }))
})

userManagementRoutes.get('/users/:id/login-history', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const history = await userService.getUserLoginHistory(c.req.param('id')!)
  return c.json(success(history))
})

userManagementRoutes.post('/users/:id/assignments', requirePermission(Permission.AUTH_MANAGE_USERS), zValidator('json', assignmentSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof assignmentSchema>
  const result = await userService.assignToEntity(body)
  return c.json(success(result, { message: 'Assignment created' }), 201)
})

userManagementRoutes.delete('/assignments/:id', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  await userService.revokeAssignment(c.req.param('id')!)
  return c.json(success({ revoked: true }, { message: 'Assignment revoked' }))
})

userManagementRoutes.get('/users/:id/preferences', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const prefs = await userService.getPreferences(c.req.param('id')!)
  return c.json(success(prefs))
})

userManagementRoutes.post('/users/:id/preferences', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const body = await c.req.json()
  await userService.setPreference(c.req.param('id')!, body.key, body.value)
  return c.json(success({ set: true }, { message: 'Preference saved' }))
})

// ─── Role Routes ────────────────────────────────────────────────────────────

userManagementRoutes.get('/roles', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const result = await roleService.list({
    page: Number(c.req.query('page') ?? 1),
    pageSize: Number(c.req.query('pageSize') ?? 25),
    search: c.req.query('search') ?? undefined,
    category: c.req.query('category') ?? undefined,
    status: c.req.query('status') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

userManagementRoutes.get('/roles/:id', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const role = await roleService.getById(c.req.param('id')!)
  return c.json(success(role))
})

userManagementRoutes.post('/roles', requirePermission(Permission.AUTH_MANAGE_ROLES), zValidator('json', roleCreateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof roleCreateSchema>
  const role = await roleService.create(body)
  return c.json(success(role, { message: 'Role created' }), 201)
})

userManagementRoutes.patch('/roles/:id', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const id = c.req.param('id')!
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await roleService.update(id, body, version)
  return c.json(success(updated, { message: 'Role updated' }))
})

userManagementRoutes.delete('/roles/:id', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await roleService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Role deleted' }))
})

userManagementRoutes.post('/roles/:id/clone', requirePermission(Permission.AUTH_MANAGE_ROLES), zValidator('json', roleCloneSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof roleCloneSchema>
  const cloned = await roleService.clone(c.req.param('id')!, body.newName, body.newDisplayName)
  return c.json(success(cloned, { message: 'Role cloned' }), 201)
})

userManagementRoutes.post('/roles/:id/permissions/:code', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  await roleService.assignPermission(c.req.param('id')!, c.req.param('code')!)
  return c.json(success({ assigned: true }, { message: 'Permission assigned' }))
})

userManagementRoutes.delete('/roles/:id/permissions/:code', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  await roleService.revokePermission(c.req.param('id')!, c.req.param('code')!)
  return c.json(success({ revoked: true }, { message: 'Permission revoked' }))
})

userManagementRoutes.get('/roles/compare', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const role1 = c.req.query('role1')!
  const role2 = c.req.query('role2')!
  const comparison = await roleService.compareRoles(role1, role2)
  return c.json(success(comparison))
})

// ─── Permission Routes ──────────────────────────────────────────────────────

userManagementRoutes.get('/permissions', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const perms = await permissionService.list({
    module: c.req.query('module') ?? undefined,
    group: c.req.query('group') ?? undefined,
    search: c.req.query('search') ?? undefined,
  })
  return c.json(success(perms))
})

userManagementRoutes.get('/permissions/modules', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const modules = await permissionService.listModules()
  return c.json(success(modules))
})

userManagementRoutes.get('/permissions/groups', requirePermission(Permission.AUTH_MANAGE_ROLES), async (c) => {
  const groups = await permissionService.listGroups()
  return c.json(success(groups))
})

// ─── Delegation Routes ──────────────────────────────────────────────────────

userManagementRoutes.get('/delegations', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  const result = await delegationService.list({
    page: Number(c.req.query('page') ?? 1),
    pageSize: Number(c.req.query('pageSize') ?? 25),
    delegatorId: c.req.query('delegatorId') ?? undefined,
    delegateId: c.req.query('delegateId') ?? undefined,
    status: c.req.query('status') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

userManagementRoutes.post('/delegations', requirePermission(Permission.AUTH_MANAGE_USERS), zValidator('json', delegationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof delegationSchema>
  const id = await delegationService.create(body)
  return c.json(success({ id }, { message: 'Delegation created' }), 201)
})

userManagementRoutes.delete('/delegations/:id', requirePermission(Permission.AUTH_MANAGE_USERS), async (c) => {
  await delegationService.revoke(c.req.param('id')!)
  return c.json(success({ revoked: true }, { message: 'Delegation revoked' }))
})
