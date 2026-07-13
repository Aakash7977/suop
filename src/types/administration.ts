export interface LoginResponse { accessToken: string; refreshToken: string; user: CurrentUser }
export interface CurrentUser {
  id: string; email: string; username: string; firstName: string; lastName: string
  roles: string[]; permissions: string[]; tenantId: string
  defaultCompanyId?: string; defaultPlantId?: string; designation?: string
}
export interface UserListItem { id: string; email: string; username: string; status: string }
export interface RoleItem { id: string; name: string; description: string | null }
export interface PermissionItem { id: string; name: string; module: string }
