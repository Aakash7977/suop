/**
 * SUOP — Auth Store (Zustand)
 *
 * Enterprise authentication with multi-mode support:
 * 1. Backend JWT auth (primary — calls SUOP backend at API_BASE)
 * 2. Supabase auth (if NEXT_PUBLIC_SUPABASE_URL configured)
 * 3. Local fallback (any email/password works — dev/demo only)
 * 4. Demo Mode (instant access, no credentials)
 *
 * Token Storage:
 *   - suop_auth: JSON blob with user, session, authMode (for session restore)
 *   - suop_access_token: raw JWT string (read by all API clients)
 *   - suop_refresh_token: raw refresh token string
 *
 * Multi-tab sync: listens to 'storage' event for suop_auth changes.
 */

import { create } from 'zustand'
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signOut as supabaseSignOut,
  getSession,
  getCurrentUser,
} from '@/lib/supabase'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  roles: string[]
  permissions: string[]
  tenantId: string
  defaultCompanyId?: string | null
  defaultPlantId?: string | null
  designation?: string | null
}

interface AuthSession {
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
}

interface AuthState {
  user: AppUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isDemoMode: boolean
  authMode: 'backend' | 'supabase' | 'local' | 'demo' | 'none'

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginDemo: () => void
  logout: () => Promise<void>
  clearError: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  getAccessToken: () => string | null
  refreshSession: () => Promise<boolean>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

function persistAuth(data: {
  user: AppUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  isDemoMode: boolean
  authMode: string
}) {
  try {
    localStorage.setItem('suop_auth', JSON.stringify(data))
    if (data.session?.accessToken) {
      localStorage.setItem('suop_access_token', data.session.accessToken)
    } else {
      localStorage.removeItem('suop_access_token')
    }
    if (data.session?.refreshToken) {
      localStorage.setItem('suop_refresh_token', data.session.refreshToken)
    } else {
      localStorage.removeItem('suop_refresh_token')
    }
  } catch {
    // localStorage may be unavailable (SSR, private mode)
  }
}

function clearAuthStorage() {
  try {
    localStorage.removeItem('suop_auth')
    localStorage.removeItem('suop_access_token')
    localStorage.removeItem('suop_refresh_token')
  } catch {
    // ignore
  }
}

function readPersistedAuth(): { user: AppUser; session: AuthSession; isDemoMode: boolean; authMode: string } | null {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('suop_auth') : null
    if (!stored) return null
    const data = JSON.parse(stored)
    if (!data?.isAuthenticated || !data?.user) return null

    // Reconstruct session from stored data or localStorage tokens
    const accessToken = data.session?.accessToken || localStorage.getItem('suop_access_token') || null
    const refreshToken = data.session?.refreshToken || localStorage.getItem('suop_refresh_token') || null

    if (!accessToken && !data.isDemoMode) return null

    return {
      user: data.user,
      session: data.session || (accessToken ? {
        accessToken,
        refreshToken: refreshToken || '',
        accessExpiresAt: 0,
        refreshExpiresAt: 0,
      } : null),
      isDemoMode: data.isDemoMode || false,
      authMode: data.authMode || 'local',
    }
  } catch {
    return null
  }
}

// ─── Backend Auth Client (inline — avoids circular dep with modules/auth/api/client.ts) ───

async function backendLogin(email: string, password: string): Promise<{
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
  user: AppUser
}> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Login failed')
  }
  const d = json.data
  return {
    accessToken: d.accessToken,
    refreshToken: d.refreshToken,
    accessExpiresAt: d.accessExpiresAt,
    refreshExpiresAt: d.refreshExpiresAt,
    user: {
      id: d.user.id,
      email: d.user.email,
      username: d.user.username,
      firstName: d.user.firstName,
      lastName: d.user.lastName,
      roles: d.user.roles || [],
      permissions: d.user.permissions || [],
      tenantId: d.user.tenantId,
      defaultCompanyId: d.user.defaultCompanyId,
      defaultPlantId: d.user.defaultPlantId,
    },
  }
}

async function backendRefresh(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
} | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) return null
    const d = json.data
    return {
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      accessExpiresAt: d.accessExpiresAt,
      refreshExpiresAt: d.refreshExpiresAt,
    }
  } catch {
    return null
  }
}

async function backendLogout(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // ignore — logout should always succeed client-side
  }
}

// ─── Auth Store ─────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isDemoMode: false,
  authMode: 'none',

  initialize: async () => {
    // 1. Check localStorage for persisted session
    const persisted = readPersistedAuth()
    if (persisted) {
      set({
        user: persisted.user,
        session: persisted.session,
        isAuthenticated: true,
        isDemoMode: persisted.isDemoMode,
        authMode: persisted.authMode as AuthState['authMode'],
        isLoading: false,
      })

      // If backend auth, check if access token is expired and try refresh
      if (persisted.authMode === 'backend' && persisted.session) {
        const now = Math.floor(Date.now() / 1000)
        if (persisted.session.accessExpiresAt && persisted.session.accessExpiresAt < now) {
          // Token expired — try refresh
          const refreshed = await backendRefresh(persisted.session.refreshToken)
          if (refreshed) {
            const newSession: AuthSession = {
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              accessExpiresAt: refreshed.accessExpiresAt,
              refreshExpiresAt: refreshed.refreshExpiresAt,
            }
            set({ session: newSession })
            persistAuth({
              user: persisted.user,
              session: newSession,
              isAuthenticated: true,
              isDemoMode: false,
              authMode: 'backend',
            })
          } else {
            // Refresh failed — clear auth
            clearAuthStorage()
            set({ user: null, session: null, isAuthenticated: false, authMode: 'none', isLoading: false })
            return
          }
        }
      }

      // 2. Setup multi-tab sync
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key === 'suop_auth') {
            if (e.newValue === null) {
              // Logged out in another tab
              set({ user: null, session: null, isAuthenticated: false, isDemoMode: false, authMode: 'none' })
            } else {
              // Auth changed in another tab
              const restored = readPersistedAuth()
              if (restored) {
                set({
                  user: restored.user,
                  session: restored.session,
                  isAuthenticated: true,
                  isDemoMode: restored.isDemoMode,
                  authMode: restored.authMode as AuthState['authMode'],
                })
              }
            }
          }
        })
      }
      return
    }

    // 3. If Supabase is configured, try to restore session
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await Promise.race([
          getSession(),
          new Promise<any>((resolve) => setTimeout(() => resolve({ session: null }), 3000)),
        ])

        if (sessionData?.session) {
          const { data: userData } = await Promise.race([
            getCurrentUser(),
            new Promise<any>((resolve) => setTimeout(() => resolve({ user: null }), 3000)),
          ])

          if (userData?.user) {
            const user: AppUser = {
              id: userData.user.id,
              email: userData.user.email || '',
              roles: [],
              permissions: [],
              tenantId: '',
            }
            const session: AuthSession = {
              accessToken: sessionData.session.access_token,
              refreshToken: sessionData.session.refresh_token || '',
              accessExpiresAt: sessionData.session.expires_at || 0,
              refreshExpiresAt: 0,
            }
            set({
              user,
              session,
              isAuthenticated: true,
              isDemoMode: false,
              authMode: 'supabase',
              isLoading: false,
            })
            persistAuth({ user, session, isAuthenticated: true, isDemoMode: false, authMode: 'supabase' })
            return
          }
        }
      } catch {
        // Supabase failed, fall through to login screen
      }
    }

    // 4. No session found — show login screen
    set({ isLoading: false, isAuthenticated: false })
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    if (!email || !password) {
      set({ isLoading: false, error: 'Email and password are required' })
      return { success: false, error: 'Email and password are required' }
    }

    // ─── Try backend JWT auth first ───
    try {
      const result = await backendLogin(email, password)
      const session: AuthSession = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessExpiresAt: result.accessExpiresAt,
        refreshExpiresAt: result.refreshExpiresAt,
      }
      set({
        user: result.user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isDemoMode: false,
        authMode: 'backend',
      })
      persistAuth({ user: result.user, session, isAuthenticated: true, isDemoMode: false, authMode: 'backend' })
      return { success: true }
    } catch (backendErr: any) {
      // Backend auth failed — try Supabase if configured, otherwise local fallback
      const backendMsg = backendErr?.message || ''
      // Don't log warnings for expected failures (wrong password etc.)
      void backendMsg
    }

    // ─── If Supabase is configured, try Supabase auth ───
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await signInWithEmail(email, password)

        if (error) {
          set({ isLoading: false, error: error.message })
          return { success: false, error: error.message }
        }

        if (data?.user) {
          const user: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            roles: [],
            permissions: [],
            tenantId: '',
          }
          const session: AuthSession = {
            accessToken: data.session?.access_token || '',
            refreshToken: data.session?.refresh_token || '',
            accessExpiresAt: data.session?.expires_at || 0,
            refreshExpiresAt: 0,
          }
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isDemoMode: false,
            authMode: 'supabase',
          })
          persistAuth({ user, session, isAuthenticated: true, isDemoMode: false, authMode: 'supabase' })
          return { success: true }
        }
      } catch (err: any) {
        // Supabase call failed — fall through to local auth
        void err
      }
    }

    // ─── Local fallback auth (no backend/Supabase needed) ───
    await new Promise(resolve => setTimeout(resolve, 300))

    const user: AppUser = {
      id: 'local-' + Date.now(),
      email: email,
      roles: ['SUPER_ADMIN'], // Local mode gets all permissions
      permissions: Object.keys(ALL_PERMISSIONS),
      tenantId: 'local-tenant',
    }
    const session: AuthSession = {
      accessToken: 'local-token-' + Date.now(),
      refreshToken: 'local-refresh-' + Date.now(),
      accessExpiresAt: Math.floor(Date.now() / 1000) + 86400, // 24h
      refreshExpiresAt: Math.floor(Date.now() / 1000) + 86400 * 30, // 30d
    }

    set({
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: false,
      authMode: 'local',
    })
    persistAuth({ user, session, isAuthenticated: true, isDemoMode: false, authMode: 'local' })
    return { success: true }
  },

  loginDemo: () => {
    const user: AppUser = {
      id: 'demo-user',
      email: 'demo@sudhastar.com',
      roles: ['SUPER_ADMIN'],
      permissions: Object.keys(ALL_PERMISSIONS),
      tenantId: 'demo-tenant',
    }
    const session: AuthSession = {
      accessToken: 'demo-token',
      refreshToken: 'demo-refresh',
      accessExpiresAt: Math.floor(Date.now() / 1000) + 86400,
      refreshExpiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
    }

    set({
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: true,
      authMode: 'demo',
    })
    persistAuth({ user, session, isAuthenticated: true, isDemoMode: true, authMode: 'demo' })
  },

  logout: async () => {
    const { session, authMode } = get()

    // Call backend logout if using backend auth
    if (authMode === 'backend' && session?.refreshToken) {
      await backendLogout(session.refreshToken)
    }

    // Sign out from Supabase if using it
    if (authMode === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        await supabaseSignOut()
      } catch {
        // ignore
      }
    }

    clearAuthStorage()
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
      isDemoMode: false,
      authMode: 'none',
    })
  },

  clearError: () => set({ error: null }),

  hasPermission: (permission: string) => {
    const { user, isDemoMode } = get()
    if (isDemoMode) return true
    if (!user) return false
    if (user.roles.includes('SUPER_ADMIN')) return true
    return user.permissions.includes(permission)
  },

  hasRole: (role: string) => {
    const { user, isDemoMode } = get()
    if (isDemoMode) return true
    if (!user) return false
    return user.roles.includes(role)
  },

  getAccessToken: () => {
    const { session, isDemoMode } = get()
    if (isDemoMode) return 'demo-token'
    return session?.accessToken || null
  },

  refreshSession: async () => {
    const { session, authMode, user } = get()
    if (authMode !== 'backend' || !session?.refreshToken) return false

    const refreshed = await backendRefresh(session.refreshToken)
    if (!refreshed) return false

    const newSession: AuthSession = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      accessExpiresAt: refreshed.accessExpiresAt,
      refreshExpiresAt: refreshed.refreshExpiresAt,
    }
    set({ session: newSession })
    if (user) {
      persistAuth({ user, session: newSession, isAuthenticated: true, isDemoMode: false, authMode: 'backend' })
    }
    return true
  },
}))

// ─── All Permissions (for local/demo mode) ──────────────────────────────────

const ALL_PERMISSIONS: Record<string, string> = {
  ORG_READ: 'org:read', ORG_CREATE: 'org:create', ORG_UPDATE: 'org:update', ORG_DELETE: 'org:delete',
  AUTH_MANAGE_USERS: 'auth:manage_users', AUTH_MANAGE_ROLES: 'auth:manage_roles', AUTH_RESET_PASSWORD: 'auth:reset_password',
  PRODUCT_READ: 'product:read', PRODUCT_CREATE: 'product:create', PRODUCT_UPDATE: 'product:update', PRODUCT_DELETE: 'product:delete',
  SUPPLIER_READ: 'supplier:read', SUPPLIER_CREATE: 'supplier:create', SUPPLIER_UPDATE: 'supplier:update', SUPPLIER_DELETE: 'supplier:delete', SUPPLIER_BLACKLIST: 'supplier:blacklist',
  CUSTOMER_READ: 'customer:read', CUSTOMER_CREATE: 'customer:create', CUSTOMER_UPDATE: 'customer:update', CUSTOMER_DELETE: 'customer:delete',
  PO_READ: 'po:read', PO_CREATE: 'po:create', PO_UPDATE: 'po:update', PO_DELETE: 'po:delete', PO_APPROVE: 'po:approve', PO_APPROVE_ANY: 'po:approve:any', PO_ISSUE: 'po:issue', PO_CLOSE: 'po:close', PO_CANCEL: 'po:cancel', PO_RECEIVE: 'po:receive', PO_EXPORT: 'po:export',
  QUOT_READ: 'quot:read', QUOT_CREATE: 'quot:create', QUOT_APPROVE: 'quot:approve', QUOT_REJECT: 'quot:reject', QUOT_AWARD: 'quot:award',
  GRN_READ: 'grn:read', GRN_CREATE: 'grn:create', GRN_POST: 'grn:post', GRN_PUTAWAY: 'grn:putaway',
  IQC_INSPECT: 'iqc:inspect', IQC_APPROVE: 'iqc:approve', NCR_CREATE: 'ncr:create', NCR_APPROVE: 'ncr:approve', COA_SIGN: 'coa:sign', RECALL_INITIATE: 'recall:initiate',
  INVENTORY_READ: 'inventory:read', INVENTORY_POST: 'inventory:post', INVENTORY_ADJUST: 'inventory:adjust', INVENTORY_REVERSE: 'inventory:reverse',
  AUDIT_READ: 'audit:read', AUDIT_READ_CRITICAL: 'audit:read:critical',
  SYSTEM_TENANT_CROSS: 'system:tenant:cross', SYSTEM_REFERENCE_UPDATE: 'system:reference:update',
}
