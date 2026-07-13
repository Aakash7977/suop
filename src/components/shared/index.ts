/**
 * Shared components barrel — reusable across ALL sections.
 */

export { LoadingState, LoadingCard } from './loading-state'
export { ErrorState } from './error-state'
export { EmptyState } from './empty-state'
export { ConfirmDialog } from './confirm-dialog'

// Phase 1 Enterprise RBAC — centralized permission gating
export {
  usePermission,
  Protected,
  PermissionButton,
  ProtectedAction,
  hasModuleAccess,
  type PermissionHook,
  type ProtectedProps,
  type PermissionButtonProps,
  type ProtectedActionProps,
} from './protected'
