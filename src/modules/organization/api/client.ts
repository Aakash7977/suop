/**
 * SUOP Frontend — Organization API Client
 *
 * Talks to the SUOP Backend service at the configured API URL.
 * No mock data — all responses come from real PostgreSQL via the backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string
  tenant_id: string
  code: string
  name: string
  legal_name: string | null
  description: string | null
  parent_id: string | null
  gstin: string | null
  pan: string | null
  cin: string | null
  email: string | null
  phone: string | null
  website: string | null
  address_line_1: string | null
  city: string | null
  state: string | null
  country: string
  postal_code: string | null
  default_timezone: string | null
  default_currency: string | null
  status: string
  version: number
  created_at: string
  updated_at: string
}

export interface Plant {
  id: string
  tenant_id: string
  region_id: string
  code: string
  name: string
  description: string | null
  plant_type: string
  address_line_1: string | null
  city: string | null
  state: string | null
  country: string
  timezone: string
  currency: string
  email: string | null
  phone: string | null
  status: string
  version: number
}

export interface Warehouse {
  id: string
  tenant_id: string
  plant_id: string
  code: string
  name: string
  description: string | null
  warehouse_type: string
  is_default: boolean
  status: string
  version: number
}

export interface Department {
  id: string
  tenant_id: string
  code: string
  name: string
  description: string | null
  company_id: string | null
  business_unit_id: string | null
  plant_id: string | null
  status: string
  version: number
}

export interface CostCenter {
  id: string
  tenant_id: string
  code: string
  name: string
  description: string | null
  plant_id: string | null
  department_id: string | null
  cost_center_type: string
  status: string
  version: number
}

export interface FinancialYear {
  id: string
  tenant_id: string
  code: string
  name: string
  start_date: string
  end_date: string
  status: string
  is_current: boolean
  version: number
}

export interface HierarchyNode {
  id: string
  code: string
  name: string
  type: string
  status: string
  children?: HierarchyNode[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SingleResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; code: string; message: string }>
  }
}

// ─── Token Management ───────────────────────────────────────────────────────

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  if (authToken) return authToken
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('suop_auth')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        authToken = data.token ?? null
      } catch {
        // ignore
      }
    }
  }
  return authToken
}

// ─── Fetch Helper ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  const json = await response.json()

  if (!response.ok || !json.success) {
    const error: ErrorResponse = json
    throw new Error(error.error?.message || `HTTP ${response.status}`)
  }

  return json as T
}

// ─── Company API ────────────────────────────────────────────────────────────

export const companyApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    return apiFetch<PaginatedResponse<Company>>(`/api/v1/organization/companies?${qs}`)
  },

  get: (id: string) =>
    apiFetch<SingleResponse<Company>>(`/api/v1/organization/companies/${id}`),

  create: (data: Partial<Company>) =>
    apiFetch<SingleResponse<Company>>('/api/v1/organization/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Company>, version: number) =>
    apiFetch<SingleResponse<Company>>(`/api/v1/organization/companies/${id}`, {
      method: 'PATCH',
      headers: { 'If-Match': String(version) },
      body: JSON.stringify(data),
    }),

  delete: (id: string, version: number) =>
    apiFetch<SingleResponse<{ deleted: boolean }>>(`/api/v1/organization/companies/${id}`, {
      method: 'DELETE',
      headers: { 'If-Match': String(version) },
    }),

  transition: (id: string, targetStatus: string, version: number) =>
    apiFetch<SingleResponse<Company>>(`/api/v1/organization/companies/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ targetStatus, version }),
    }),
}

// ─── Plant API ──────────────────────────────────────────────────────────────

export const plantApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    return apiFetch<PaginatedResponse<Plant>>(`/api/v1/organization/plants?${qs}`)
  },

  get: (id: string) =>
    apiFetch<SingleResponse<Plant>>(`/api/v1/organization/plants/${id}`),

  create: (data: Partial<Plant>) =>
    apiFetch<SingleResponse<Plant>>('/api/v1/organization/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  transition: (id: string, targetStatus: string, version: number) =>
    apiFetch<SingleResponse<Plant>>(`/api/v1/organization/plants/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ targetStatus, version }),
    }),
}

// ─── Warehouse API ──────────────────────────────────────────────────────────

export const warehouseApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; plantId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    if (params?.plantId) qs.set('plantId', params.plantId)
    return apiFetch<PaginatedResponse<Warehouse>>(`/api/v1/organization/warehouses?${qs}`)
  },

  get: (id: string) =>
    apiFetch<SingleResponse<Warehouse>>(`/api/v1/organization/warehouses/${id}`),

  create: (data: Partial<Warehouse>) =>
    apiFetch<SingleResponse<Warehouse>>('/api/v1/organization/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Department API ─────────────────────────────────────────────────────────

export const departmentApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    return apiFetch<PaginatedResponse<Department>>(`/api/v1/organization/departments?${qs}`)
  },

  create: (data: Partial<Department>) =>
    apiFetch<SingleResponse<Department>>('/api/v1/organization/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Cost Center API ────────────────────────────────────────────────────────

export const costCenterApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    return apiFetch<PaginatedResponse<CostCenter>>(`/api/v1/organization/cost-centers?${qs}`)
  },

  create: (data: Partial<CostCenter>) =>
    apiFetch<SingleResponse<CostCenter>>('/api/v1/organization/cost-centers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Financial Year API ─────────────────────────────────────────────────────

export const financialYearApi = {
  list: (params?: { page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    return apiFetch<PaginatedResponse<FinancialYear>>(`/api/v1/organization/financial-years?${qs}`)
  },

  getCurrent: () =>
    apiFetch<SingleResponse<FinancialYear | null>>('/api/v1/organization/financial-years/current'),

  create: (data: Partial<FinancialYear>) =>
    apiFetch<SingleResponse<FinancialYear>>('/api/v1/organization/financial-years', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ─── Hierarchy API ──────────────────────────────────────────────────────────

export const hierarchyApi = {
  getTree: () =>
    apiFetch<SingleResponse<HierarchyNode[]>>('/api/v1/organization/hierarchy'),
}

// ─── Token Generation (temporary — will be replaced by real auth) ───────────

export const authApi = {
  getTestToken: () =>
    fetch(`${API_BASE}/api/v1/_internal/smoke-test/token`, { method: 'POST' })
      .then(r => r.json())
      .then(j => j.data?.token as string),
}
