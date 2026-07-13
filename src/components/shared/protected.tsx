'use client'

/**
 * @suop/frontend — Centralized RBAC Components & Hooks
 *
 * Provides:
 *   - usePermission()  — hook for imperative permission checks
 *   - <Protected>      — wrapper that hides children if user lacks permission
 *   - <PermissionButton> — Button that auto-disables when permission missing
 *   - <PermissionLink> — Link that hides when permission missing
 *   - useModuleAccess() — hook for sidebar module visibility
 *
 * All components use the auth-store's hasPermission() under the hood.
 * In demo mode, all permission checks return true.
 */

import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { hasModuleAccess, type ModuleKey } from '@/lib/module-permissions'
import { Button, type ButtonProps } from '@/components/ui/button'

// ─── usePermission Hook ─────────────────────────────────────────────────────

export interface PermissionHook {
  /** Check if user has a single permission */
  hasPermission: (permission: string) => boolean
  /** Check if user has ANY of the given permissions (OR) */
  hasAnyPermission: (permissions: string[]) => boolean
  /** Check if user has ALL of the given permissions (AND) */
  hasAllPermissions: (permissions: string[]) => boolean
  /** Check if user can access a sidebar module */
  hasModuleAccess: (moduleKey: ModuleKey) => boolean
  /** True if running in demo mode (all permissions granted) */
  isDemoMode: boolean
  /** True if user is super admin */
  isSuperAdmin: boolean
  /** User's roles */
  roles: string[]
}

export function usePermission(): PermissionHook {
  const storeHasPermission = useAuthStore(s => s.hasPermission)
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const user = useAuthStore(s => s.user)

  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false
  const roles = user?.roles ?? []

  const hasPermission = (perm: string) => storeHasPermission(perm)
  const hasAnyPermission = (perms: string[]) => perms.some(p => storeHasPermission(p))
  const hasAllPermissions = (perms: string[]) => perms.every(p => storeHasPermission(p))
  const hasModuleAccessCheck = (moduleKey: ModuleKey) =>
    hasModuleAccess(moduleKey, storeHasPermission, { isDemoMode, isSuperAdmin })

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess: hasModuleAccessCheck,
    isDemoMode,
    isSuperAdmin,
    roles,
  }
}

// ─── <Protected> Component ──────────────────────────────────────────────────

export interface ProtectedProps {
  /** Required permission(s) */
  permission?: string | string[]
  /** If true (default false), user needs ALL listed permissions. If false, ANY. */
  requireAll?: boolean
  /** Module key — checks module-level access */
  module?: ModuleKey
  /** Fallback to render if permission denied (defaults to null) */
  fallback?: ReactNode
  /** Children to render if permission granted */
  children: ReactNode
}

/**
 * Conditionally render children based on user permissions.
 *
 * Examples:
 *   <Protected permission="org:create"><Button>Add</Button></Protected>
 *   <Protected permission={['org:create', 'org:update']} requireAll>
 *     <Button>Add & Edit</Button>
 *   </Protected>
 *   <Protected module="inventory"><InventoryPanel /></Protected>
 */
export function Protected({ permission, requireAll = false, module: moduleKey, fallback = null, children }: ProtectedProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess } = usePermission()

  // Module-level check
  if (moduleKey) {
    return hasModuleAccess(moduleKey) ? <>{children}</> : <>{fallback}</>
  }

  // Permission-level check
  if (!permission) return <>{children}</>

  const perms = Array.isArray(permission) ? permission : [permission]
  const allowed = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)
  return allowed ? <>{children}</> : <>{fallback}</>
}

// ─── <PermissionButton> Component ───────────────────────────────────────────

export interface PermissionButtonProps extends ButtonProps {
  /** Required permission(s) */
  permission?: string | string[]
  /** If true, user needs ALL listed permissions. If false (default), ANY. */
  requireAll?: boolean
  /** If true (default), button is hidden when permission denied. If false, button is disabled. */
  hideWhenDenied?: boolean
  /** Children */
  children: ReactNode
}

/**
 * A Button that auto-hides or auto-disables based on user permissions.
 *
 * Examples:
 *   <PermissionButton permission="org:create" onClick={handleCreate}>Add</PermissionButton>
 *   <PermissionButton permission="org:archive" hideWhenDenied={false}>Archive</PermissionButton>
 */
export function PermissionButton({
  permission,
  requireAll = false,
  hideWhenDenied = true,
  children,
  ...buttonProps
}: PermissionButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  if (!permission) {
    return <Button {...buttonProps}>{children}</Button>
  }

  const perms = Array.isArray(permission) ? permission : [permission]
  const allowed = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)

  if (!allowed) {
    if (hideWhenDenied) return null
    return (
      <Button {...buttonProps} disabled title="Insufficient permissions">
        {children}
      </Button>
    )
  }

  return <Button {...buttonProps}>{children}</Button>
}

// ─── <ProtectedAction> Component ────────────────────────────────────────────

export interface ProtectedActionProps {
  /** Required permission(s) */
  permission: string | string[]
  /** If true, user needs ALL listed permissions. If false (default), ANY. */
  requireAll?: boolean
  /** Render function — receives whether action is allowed */
  children: (allowed: boolean) => ReactNode
}

/**
 * Low-level wrapper for custom conditional rendering.
 * Useful for table row actions, context menus, etc.
 *
 * Example:
 *   <ProtectedAction permission="po:approve">
 *     {(allowed) => (
 *       <Button disabled={!allowed} onClick={handleApprove}>Approve</Button>
 *     )}
 *   </ProtectedAction>
 */
export function ProtectedAction({ permission, requireAll = false, children }: ProtectedActionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
  const perms = Array.isArray(permission) ? permission : [permission]
  const allowed = requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms)
  return <>{children(allowed)}</>
}

// ─── Exports ────────────────────────────────────────────────────────────────

export { hasModuleAccess } from '@/lib/module-permissions'
