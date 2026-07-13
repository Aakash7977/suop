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
// Enterprise Permission Catalog — ~329 domain-specific permissions
// Updated to match the approved enterprise permission architecture

const ALL_PERMISSIONS: Record<string, string> = {
  // Organization
  ORG_VIEW: 'org:view', ORG_READ: 'org:read', ORG_CREATE: 'org:create', ORG_UPDATE: 'org:update',
  ORG_ARCHIVE: 'org:archive', ORG_RESTORE: 'org:restore', ORG_SETTINGS: 'org:settings',
  DEPT_READ: 'dept:read', DEPT_CREATE: 'dept:create', DEPT_UPDATE: 'dept:update', DEPT_ARCHIVE: 'dept:archive',
  COSTCENTER_READ: 'costcenter:read', COSTCENTER_CREATE: 'costcenter:create', COSTCENTER_UPDATE: 'costcenter:update',
  FY_READ: 'fy:read', FY_CREATE: 'fy:create', FY_CLOSE: 'fy:close', FY_REOPEN: 'fy:reopen',
  // Catalog
  CATALOG_VIEW: 'catalog:view', CATALOG_READ: 'catalog:read', CATALOG_CREATE: 'catalog:create',
  CATALOG_UPDATE: 'catalog:update', CATALOG_ARCHIVE: 'catalog:archive', CATALOG_RESTORE: 'catalog:restore',
  CATALOG_APPROVE: 'catalog:approve', CATALOG_OVERRIDE: 'catalog:override', CATALOG_EXPORT: 'catalog:export', CATALOG_IMPORT: 'catalog:import',
  CATEGORY_READ: 'category:read', CATEGORY_CREATE: 'category:create', CATEGORY_UPDATE: 'category:update',
  BRAND_READ: 'brand:read', BRAND_CREATE: 'brand:create', UOM_READ: 'uom:read',
  // Partners
  CUSTOMER_VIEW: 'customer:view', CUSTOMER_READ: 'customer:read', CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update', CUSTOMER_ARCHIVE: 'customer:archive', CUSTOMER_RESTORE: 'customer:restore',
  CUSTOMER_APPROVE: 'customer:approve', CUSTOMER_CREDIT_READ: 'customer:credit:read',
  CUSTOMER_CREDIT_UPDATE: 'customer:credit:update', CUSTOMER_CREDIT_OVERRIDE: 'customer:credit:override',
  SUPPLIER_VIEW: 'supplier:view', SUPPLIER_READ: 'supplier:read', SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_UPDATE: 'supplier:update', SUPPLIER_ARCHIVE: 'supplier:archive', SUPPLIER_APPROVE: 'supplier:approve',
  SUPPLIER_BLACKLIST: 'supplier:blacklist', SUPPLIER_COMPLIANCE_READ: 'supplier:compliance:read',
  SUPPLIER_COMPLIANCE_CREATE: 'supplier:compliance:create', SUPPLIER_PRODUCT_ASSIGN: 'supplier:product:assign',
  SUPPLIER_CATEGORY_READ: 'supplier:category:read', SUPPLIER_CATEGORY_CREATE: 'supplier:category:create',
  // Inventory
  INVENTORY_VIEW: 'inventory:view', INVENTORY_READ: 'inventory:read', INVENTORY_STOCKIN: 'inventory:stockin',
  INVENTORY_STOCKOUT: 'inventory:stockout', INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_TRANSFER_APPROVE: 'inventory:transfer:approve', INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_ADJUST_APPROVE: 'inventory:adjust:approve', INVENTORY_RESERVE: 'inventory:reserve',
  INVENTORY_RESERVE_RELEASE: 'inventory:reserve:release', INVENTORY_BLOCK: 'inventory:block',
  INVENTORY_BLOCK_RELEASE: 'inventory:block:release', INVENTORY_EXPIRY_MARK: 'inventory:expiry:mark',
  INVENTORY_REVERSE: 'inventory:reverse', INVENTORY_OVERRIDE: 'inventory:override',
  INVENTORY_EXPORT: 'inventory:export', INVENTORY_IMPORT: 'inventory:import',
  LEDGER_READ: 'ledger:read', LEDGER_REVERSE: 'ledger:reverse',
  // Warehouse
  WAREHOUSE_VIEW: 'warehouse:view', WAREHOUSE_READ: 'warehouse:read', WAREHOUSE_CREATE: 'warehouse:create',
  WAREHOUSE_UPDATE: 'warehouse:update', WAREHOUSE_ARCHIVE: 'warehouse:archive', WAREHOUSE_RESTORE: 'warehouse:restore',
  WAREHOUSE_SETTINGS: 'warehouse:settings', WAREHOUSE_NUMBERING: 'warehouse:numbering',
  PUTAWAY_VIEW: 'putaway:view', PUTAWAY_READ: 'putaway:read', PUTAWAY_CREATE: 'putaway:create',
  PUTAWAY_COMPLETE: 'putaway:complete', PUTAWAY_REASSIGN: 'putaway:reassign', PUTAWAY_OVERRIDE: 'putaway:override',
  BARCODE_READ: 'barcode:read', BARCODE_CREATE: 'barcode:create', BARCODE_PRINT: 'barcode:print',
  SCAN_EXECUTE: 'scan:execute', SCAN_READ: 'scan:read',
  GRN_VIEW: 'grn:view', GRN_READ: 'grn:read', GRN_CREATE: 'grn:create', GRN_POST: 'grn:post', GRN_CLOSE: 'grn:close',
  // Procurement
  PR_VIEW: 'pr:view', PR_READ: 'pr:read', PR_CREATE: 'pr:create', PR_UPDATE: 'pr:update', PR_DELETE: 'pr:delete',
  PR_APPROVE: 'pr:approve', PR_REJECT: 'pr:reject', PR_DELEGATE: 'pr:delegate', PR_APPROVE_AS_DELEGATE: 'pr:approve:as-delegate',
  PO_VIEW: 'po:view', PO_READ: 'po:read', PO_CREATE: 'po:create', PO_UPDATE: 'po:update', PO_ARCHIVE: 'po:archive',
  PO_APPROVE: 'po:approve', PO_REJECT: 'po:reject', PO_RELEASE: 'po:release', PO_ISSUE: 'po:issue',
  PO_CANCEL: 'po:cancel', PO_CLOSE: 'po:close', PO_REOPEN: 'po:reopen', PO_RECEIVE: 'po:receive',
  PO_EXPORT: 'po:export', PO_DELEGATE: 'po:delegate', PO_APPROVE_AS_DELEGATE: 'po:approve:as-delegate', PO_OVERRIDE: 'po:override',
  QUOT_READ: 'quot:read', QUOT_CREATE: 'quot:create', QUOT_APPROVE: 'quot:approve',
  RFQ_READ: 'rfq:read', RFQ_CREATE: 'rfq:create',
  // Sales
  SO_VIEW: 'so:view', SO_READ: 'so:read', SO_CREATE: 'so:create', SO_UPDATE: 'so:update', SO_ARCHIVE: 'so:archive',
  SO_APPROVE: 'so:approve', SO_REJECT: 'so:reject', SO_HOLD: 'so:hold', SO_RELEASE: 'so:release',
  SO_CANCEL: 'so:cancel', SO_CLOSE: 'so:close', SO_REOPEN: 'so:reopen',
  SO_DELEGATE: 'so:delegate', SO_APPROVE_AS_DELEGATE: 'so:approve:as-delegate', SO_OVERRIDE: 'so:override',
  ALLOCATION_VIEW: 'allocation:view', ALLOCATION_READ: 'allocation:read', ALLOCATION_CREATE: 'allocation:create', ALLOCATION_CANCEL: 'allocation:cancel',
  WAVE_VIEW: 'wave:view', WAVE_READ: 'wave:read', WAVE_CREATE: 'wave:create', WAVE_RELEASE: 'wave:release', WAVE_CANCEL: 'wave:cancel',
  PICK_VIEW: 'pick:view', PICK_READ: 'pick:read', PICK_CREATE: 'pick:create', PICK_COMPLETE: 'pick:complete', PICK_OVERRIDE: 'pick:override',
  PACK_READ: 'pack:read', PACK_CREATE: 'pack:create', PACK_COMPLETE: 'pack:complete',
  SHIPMENT_READ: 'shipment:read', SHIPMENT_CREATE: 'shipment:create', SHIPMENT_OVERRIDE: 'shipment:override',
  DELIVERY_READ: 'delivery:read', DELIVERY_CREATE: 'delivery:create', DELIVERY_POD: 'delivery:pod', DELIVERY_CANCEL: 'delivery:cancel',
  RETURNS_READ: 'returns:read', RETURNS_CREATE: 'returns:create', RETURNS_APPROVE: 'returns:approve',
  PRICING_READ: 'pricing:read', PRICING_CREATE: 'pricing:create', PRICING_OVERRIDE: 'pricing:override',
  PRICING_CALCULATE: 'pricing:calculate', PRICING_APPROVAL_RULES: 'pricing:approval-rules',
  // Manufacturing
  BATCH_VIEW: 'batch:view', BATCH_READ: 'batch:read', BATCH_CREATE: 'batch:create', BATCH_UPDATE: 'batch:update',
  BATCH_APPROVE: 'batch:approve', BATCH_RELEASE: 'batch:release', BATCH_TRANSITION: 'batch:transition',
  BATCH_SPLIT: 'batch:split', BATCH_MERGE: 'batch:merge', BATCH_TRACE: 'batch:trace', BATCH_ARCHIVE: 'batch:archive',
  RECIPE_READ: 'recipe:read', RECIPE_CREATE: 'recipe:create', RECIPE_UPDATE: 'recipe:update', RECIPE_APPROVE: 'recipe:approve', RECIPE_ARCHIVE: 'recipe:archive',
  PRODUCTION_READ: 'production:read', PRODUCTION_CREATE: 'production:create', PRODUCTION_APPROVE: 'production:approve',
  PRODUCTION_RELEASE: 'production:release', PRODUCTION_START: 'production:start', PRODUCTION_COMPLETE: 'production:complete', PRODUCTION_CLOSE: 'production:close',
  MES_READ: 'mes:read',
  // Quality
  QUALITY_VIEW: 'quality:view', QUALITY_READ: 'quality:read', QUALITY_INSPECT: 'quality:inspect',
  QUALITY_APPROVE: 'quality:approve', QUALITY_REJECT: 'quality:reject', QUALITY_HOLD: 'quality:hold',
  QUALITY_HOLD_RELEASE: 'quality:hold:release', QUALITY_OVERRIDE: 'quality:override',
  NCR_READ: 'ncr:read', NCR_CREATE: 'ncr:create', NCR_APPROVE: 'ncr:approve', NCR_REJECT: 'ncr:reject',
  CAPA_READ: 'capa:read', CAPA_CREATE: 'capa:create', CAPA_APPROVE: 'capa:approve',
  COA_READ: 'coa:read', COA_SIGN: 'coa:sign',
  RECALL_READ: 'recall:read', RECALL_INITIATE: 'recall:initiate', RECALL_APPROVE: 'recall:approve', RECALL_CLOSE: 'recall:close',
  QUALITY_APPROVAL_RULES: 'quality:approval-rules',
  // Finance
  GL_VIEW: 'gl:view', GL_READ: 'gl:read', GL_CREATE: 'gl:create', GL_UPDATE: 'gl:update',
  GL_APPROVE: 'gl:approve', GL_POST: 'gl:post', GL_REVERSE: 'gl:reverse', GL_ARCHIVE: 'gl:archive',
  GL_DELEGATE: 'gl:delegate', GL_APPROVE_AS_DELEGATE: 'gl:approve:as-delegate',
  COSTING_READ: 'costing:read', COSTING_CREATE: 'costing:create', COSTING_UPDATE: 'costing:update',
  COSTING_APPROVE: 'costing:approve', COSTING_OVERRIDE: 'costing:override',
  GST_READ: 'gst:read', GST_CREATE: 'gst:create', GST_UPDATE: 'gst:update', GST_EXPORT: 'gst:export',
  FINANCE_READ: 'finance:read', FINANCE_CREATE: 'finance:create', FINANCE_UPDATE: 'finance:update',
  FINANCE_PERIOD_CLOSE: 'finance:period:close', FINANCE_PERIOD_REOPEN: 'finance:period:reopen',
  FINANCE_APPROVAL_RULES: 'finance:approval-rules', FINANCE_OVERRIDE: 'finance:override',
  AP_READ: 'ap:read', AR_READ: 'ar:read', PAYMENT_CREATE: 'payment:create', PAYMENT_APPROVE: 'payment:approve',
  // HR
  HR_VIEW: 'hr:view', HR_READ: 'hr:read', HR_CREATE: 'hr:create', HR_UPDATE: 'hr:update', HR_ARCHIVE: 'hr:archive',
  ATTENDANCE_READ: 'attendance:read', ATTENDANCE_CREATE: 'attendance:create', ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_APPROVE: 'attendance:approve', ATTENDANCE_DELEGATE: 'attendance:delegate', ATTENDANCE_APPROVE_AS_DELEGATE: 'attendance:approve:as-delegate',
  LEAVE_READ: 'leave:read', LEAVE_CREATE: 'leave:create', LEAVE_APPROVE: 'leave:approve',
  LEAVE_DELEGATE: 'leave:delegate', LEAVE_APPROVE_AS_DELEGATE: 'leave:approve:as-delegate', LEAVE_CANCEL: 'leave:cancel',
  PERFORMANCE_READ: 'performance:read', PERFORMANCE_CONFIGURE: 'performance:configure',
  PERFORMANCE_APPRAISE: 'performance:appraise', PERFORMANCE_APPROVE: 'performance:approve',
  PAYROLL_READ: 'payroll:read', PAYROLL_APPROVE: 'payroll:approve',
  // CRM
  CRM_VIEW: 'crm:view', CRM_READ: 'crm:read', CRM_CREATE: 'crm:create', CRM_UPDATE: 'crm:update',
  COMPLAINT_READ: 'complaint:read', COMPLAINT_CREATE: 'complaint:create', COMPLAINT_APPROVE: 'complaint:approve', COMPLAINT_RESOLVE: 'complaint:resolve',
  SERVICE_READ: 'service:read', SERVICE_CREATE: 'service:create', SERVICE_CLOSE: 'service:close', LEAD_READ: 'lead:read',
  // BI & Administration
  BI_VIEW: 'bi:view', BI_READ: 'bi:read', BI_SETTINGS: 'bi:settings', BI_TEMPLATES: 'bi:templates',
  ALERTS_READ: 'alerts:read', ALERTS_SETTINGS: 'alerts:settings', ALERTS_ADMIN: 'alerts:admin', ALERTS_OVERRIDE: 'alerts:override',
  USER_VIEW: 'user:view', USER_READ: 'user:read', USER_CREATE: 'user:create', USER_UPDATE: 'user:update', USER_ARCHIVE: 'user:archive',
  ROLE_MANAGE: 'role:manage',
  AUDIT_READ: 'audit:read', AUDIT_READ_CRITICAL: 'audit:read:critical', AUDIT_EXPORT: 'audit:export',
  SYSTEM_SETTINGS: 'system:settings', SYSTEM_TENANT_CROSS: 'system:tenant:cross', SYSTEM_BREAK_GLASS_ACTIVATE: 'system:break-glass:activate',
  AUTH_MANAGE_USERS: 'auth:manage_users', AUTH_MANAGE_ROLES: 'auth:manage_roles', AUTH_RESET_PASSWORD: 'auth:reset_password',
  // Backward compat aliases (temporary)
  INVENTORY_POST: 'inventory:stockin', GRN_PUTAWAY: 'putaway:create',
  IQC_INSPECT: 'quality:inspect', IQC_APPROVE: 'quality:approve',
  SYSTEM_REFERENCE_UPDATE: 'system:settings',
}
