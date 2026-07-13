/** Token management for API authentication */

export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem('suop_access_token')
}

export function setAuthToken(token: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('suop_access_token', token)
}

export function clearAuthToken(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('suop_access_token')
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem('suop_refresh_token')
}
