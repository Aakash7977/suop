#!/usr/bin/env python3
"""
Phase C: Create src/api/ domain files (14 domains + index).
ONE CLIENT PER BUSINESS AGGREGATE.
Includes backward compat aliases for renamed clients.
"""
from pathlib import Path

API_DIR = Path('/home/z/my-project/src/api')

# ─── administration.ts (authApi + userApi) ──────────────────────────────────

administration = """/**
 * Administration Domain — Authentication + User Management
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { LoginResponse, CurrentUser, UserListItem, RoleItem, PermissionItem } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ success: true; data: LoginResponse }>(`/api/v1/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: (refreshToken: string) =>
    apiFetch(`/api/v1/auth/logout`, { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  refresh: (refreshToken: string) =>
    apiFetch<{ success: true; data: { accessToken: string } }>(`/api/v1/auth/refresh`, { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  getCurrentUser: () => apiFetch<{ success: true; data: CurrentUser }>(`/api/v1/auth/me`),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch(`/api/v1/auth/change-password`, { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword: (email: string) =>
    apiFetch(`/api/v1/auth/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) =>
    apiFetch(`/api/v1/auth/reset-password`, { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  listSessions: () => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/auth/sessions`),
  revokeSession: (tokenHash: string) =>
    apiFetch(`/api/v1/auth/sessions/${tokenHash}/revoke`, { method: 'POST' }),
  listDevices: () => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/auth/devices`),
  inviteUser: (params: Record<string, unknown>) =>
    apiFetch(`/api/v1/auth/invite`, { method: 'POST', body: JSON.stringify(params) }),
  acceptInvitation: (params: Record<string, unknown>) =>
    apiFetch(`/api/v1/auth/accept-invitation`, { method: 'POST', body: JSON.stringify(params) }),
}

export const userApi = {
  listUsers: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<UserListItem>>(`/api/v1/admin/users?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getUser: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/admin/users/${id}`),
  lockUser: (id: string) => apiFetch(`/api/v1/admin/users/${id}/lock`, { method: 'POST' }),
  unlockUser: (id: string) => apiFetch(`/api/v1/admin/users/${id}/unlock`, { method: 'POST' }),
  getUserSessions: (id: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/admin/users/${id}/sessions`),
  revokeAllSessions: (id: string) => apiFetch(`/api/v1/admin/users/${id}/sessions/revoke-all`, { method: 'POST' }),
  getUserLoginHistory: (id: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/admin/users/${id}/login-history`),
  listRoles: (params?: { page?: number; search?: string; category?: string; status?: string }) =>
    apiFetch<PaginatedResponse<RoleItem>>(`/api/v1/admin/roles?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getRole: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/admin/roles/${id}`),
  createRole: (data: Record<string, unknown>) => apiFetch(`/api/v1/admin/roles`, { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRole: (id: string) => apiFetch(`/api/v1/admin/roles/${id}`, { method: 'DELETE' }),
  cloneRole: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/admin/roles/${id}/clone`, { method: 'POST', body: JSON.stringify(data) }),
  assignPermission: (roleId: string, permissionId: string) => apiFetch(`/api/v1/admin/roles/${roleId}/permissions`, { method: 'POST', body: JSON.stringify({ permissionId }) }),
  revokePermission: (roleId: string, permissionId: string) => apiFetch(`/api/v1/admin/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' }),
  listPermissions: (params?: { module?: string; group?: string; search?: string }) =>
    apiFetch<{ success: true; data: PermissionItem[] }>(`/api/v1/admin/permissions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listPermissionModules: () => apiFetch<{ success: true; data: string[] }>(`/api/v1/admin/permissions/modules`),
  listPermissionGroups: () => apiFetch<{ success: true; data: string[] }>(`/api/v1/admin/permissions/groups`),
}

// Backward compat
export const authClient = authApi
export const userMgmtApi = userApi
"""

# ─── catalog.ts (catalogApi — renamed from productApi) ──────────────────────

catalog = """/**
 * Catalog Domain — Products, Categories, Brands, UOMs, Barcodes
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { Product, Category, Brand, UOM } from '@/types'

export const catalogApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; productType?: string; status?: string }) =>
    apiFetch<PaginatedResponse<Product>>(`/api/v1/catalog/products?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Product }>(`/api/v1/catalog/products/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/catalog/products`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/catalog/products/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/catalog/products/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/catalog/products/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  lookupBarcode: (barcode: string) => apiFetch<{ success: true; data: Product }>(`/api/v1/catalog/products/barcode/${barcode}`),
  listCategories: () => apiFetch<{ success: true; data: Category[] }>(`/api/v1/catalog/categories`),
  createCategory: (data: Record<string, unknown>) => apiFetch(`/api/v1/catalog/categories`, { method: 'POST', body: JSON.stringify(data) }),
  listBrands: () => apiFetch<{ success: true; data: Brand[] }>(`/api/v1/catalog/brands`),
  createBrand: (data: Record<string, unknown>) => apiFetch(`/api/v1/catalog/brands`, { method: 'POST', body: JSON.stringify(data) }),
  listUOMs: () => apiFetch<{ success: true; data: UOM[] }>(`/api/v1/catalog/uoms`),
  listBarcodes: (productId: string) => apiFetch<{ success: true; data: Array<{ id: string; barcode_type: string; barcode_value: string; is_primary: boolean }> }>(`/api/v1/catalog/products/${productId}/barcodes`),
  addBarcode: (productId: string, data: { barcodeType?: string; barcodeValue: string; isPrimary?: boolean }) => apiFetch(`/api/v1/catalog/products/${productId}/barcodes`, { method: 'POST', body: JSON.stringify(data) }),
}

// Backward compat
export const productApi = catalogApi
"""

# ─── partners.ts (customerApi + supplierApi) ────────────────────────────────

partners = """/**
 * Partners Domain — Customers + Suppliers
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { Customer, CustomerGroup, Supplier, SupplierCategory } from '@/types'

export const customerApi = {
  list: (params?: { page?: number; search?: string; status?: string; customerType?: string }) =>
    apiFetch<PaginatedResponse<Customer>>(`/api/v1/sales/customers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/customers/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/customers`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/sales/customers/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/sales/customers/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/sales/customers/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  getCredit: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/customers/${id}/credit`),
  listGroups: () => apiFetch<{ success: true; data: CustomerGroup[] }>(`/api/v1/sales/customer-groups`),
  createGroup: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/customer-groups`, { method: 'POST', body: JSON.stringify(data) }),
  lookupByGstin: (gstin: string) => apiFetch<{ success: true; data: Customer }>(`/api/v1/sales/customers/gst/${gstin}`),
  addContact: (id: string, data: { name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) => apiFetch(`/api/v1/sales/customers/${id}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
  addAddress: (id: string, data: { addressType?: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) => apiFetch(`/api/v1/sales/customers/${id}/addresses`, { method: 'POST', body: JSON.stringify(data) }),
}

export const supplierApi = {
  list: (params?: { page?: number; search?: string; status?: string; vendorType?: string }) =>
    apiFetch<PaginatedResponse<Supplier>>(`/api/v1/procurement/suppliers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/suppliers/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/suppliers`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/suppliers/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/suppliers/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/procurement/suppliers/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  blacklist: (id: string, reason: string) => apiFetch(`/api/v1/procurement/suppliers/${id}/blacklist`, { method: 'POST', body: JSON.stringify({ reason }) }),
  listCategories: () => apiFetch<{ success: true; data: SupplierCategory[] }>(`/api/v1/procurement/supplier-categories`),
  createCategory: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/supplier-categories`, { method: 'POST', body: JSON.stringify(data) }),
  lookupByGstin: (gstin: string) => apiFetch<{ success: true; data: Supplier }>(`/api/v1/procurement/suppliers/gst/${gstin}`),
  listContacts: (id: string) => apiFetch<{ success: true; data: Array<Record<string, unknown>> }>(`/api/v1/procurement/suppliers/${id}/contacts`),
  addContact: (id: string, data: { name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) => apiFetch(`/api/v1/procurement/suppliers/${id}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
  addAddress: (id: string, data: { addressType?: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) => apiFetch(`/api/v1/procurement/suppliers/${id}/addresses`, { method: 'POST', body: JSON.stringify(data) }),
  addCompliance: (id: string, data: { complianceType: string; licenseNumber?: string; issuingAuthority?: string; issuedDate?: string; expiryDate?: string; documentUrl?: string; notes?: string }) => apiFetch(`/api/v1/procurement/suppliers/${id}/compliances`, { method: 'POST', body: JSON.stringify(data) }),
  assignProduct: (id: string, data: { productId: string; supplierSku?: string; unitPrice?: number; moq?: number; leadTimeDays?: number; isPreferred?: boolean }) => apiFetch(`/api/v1/procurement/suppliers/${id}/products`, { method: 'POST', body: JSON.stringify(data) }),
}
"""

# ─── organization.ts (organizationApi — merged 7 clients) ──────────────────

organization = """/**
 * Organization Domain — Companies, Plants, Warehouses, Departments, Cost Centers, Financial Years, Hierarchy
 * MERGED from 7 separate clients into ONE aggregate with sub-namespaces.
 */
import { apiFetch, buildQueryString, type PaginatedResponse, type SingleResponse } from '@/api/core'
import type { Company, Plant, Warehouse, Department, CostCenter, FinancialYear, HierarchyNode } from '@/types'

export const organizationApi = {
  companies: {
    list: (params?: { page?: number; pageSize?: number; search?: string }) =>
      apiFetch<PaginatedResponse<Company>>(`/api/v1/organization/companies?${buildQueryString(params as Record<string, string | number | undefined>)}`),
    get: (id: string) => apiFetch<SingleResponse<Company>>(`/api/v1/organization/companies/${id}`),
    create: (data: Partial<Company>) => apiFetch<SingleResponse<Company>>(`/api/v1/organization/companies`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Company>, version: number) => apiFetch<SingleResponse<Company>>(`/api/v1/organization/companies/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
    delete: (id: string, version: number) => apiFetch(`/api/v1/organization/companies/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
    transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/organization/companies/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
    restore: (id: string, version: number) => apiFetch(`/api/v1/organization/companies/${id}/restore`, { method: 'POST', headers: { 'If-Match': String(version) } }),
    hardDelete: (id: string, version: number) => apiFetch(`/api/v1/organization/companies/${id}/hard`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  },
  plants: {
    list: (params?: { page?: number; pageSize?: number; search?: string }) =>
      apiFetch<PaginatedResponse<Plant>>(`/api/v1/organization/plants?${buildQueryString(params as Record<string, string | number | undefined>)}`),
    get: (id: string) => apiFetch<SingleResponse<Plant>>(`/api/v1/organization/plants/${id}`),
    create: (data: Partial<Plant>) => apiFetch<SingleResponse<Plant>>(`/api/v1/organization/plants`, { method: 'POST', body: JSON.stringify(data) }),
    transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/organization/plants/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  },
  warehouses: {
    list: (params?: { page?: number; pageSize?: number; search?: string; plantId?: string }) =>
      apiFetch<PaginatedResponse<Warehouse>>(`/api/v1/organization/warehouses?${buildQueryString(params as Record<string, string | number | undefined>)}`),
    get: (id: string) => apiFetch<SingleResponse<Warehouse>>(`/api/v1/organization/warehouses/${id}`),
    create: (data: Partial<Warehouse>) => apiFetch<SingleResponse<Warehouse>>(`/api/v1/organization/warehouses`, { method: 'POST', body: JSON.stringify(data) }),
  },
  departments: {
    list: (params?: { page?: number; pageSize?: number; search?: string }) =>
      apiFetch<PaginatedResponse<Department>>(`/api/v1/organization/departments?${buildQueryString(params as Record<string, string | number | undefined>)}`),
    create: (data: Partial<Department>) => apiFetch(`/api/v1/organization/departments`, { method: 'POST', body: JSON.stringify(data) }),
  },
  costCenters: {
    list: (params?: { page?: number; pageSize?: number; search?: string }) =>
      apiFetch<PaginatedResponse<CostCenter>>(`/api/v1/organization/cost-centers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
    create: (data: Partial<CostCenter>) => apiFetch(`/api/v1/organization/cost-centers`, { method: 'POST', body: JSON.stringify(data) }),
  },
  financialYears: {
    list: (params?: { page?: number; pageSize?: number }) =>
      apiFetch<PaginatedResponse<FinancialYear>>(`/api/v1/organization/financial-years?${buildQueryString(params as Record<string, string | number | undefined>)}`),
    getCurrent: () => apiFetch<SingleResponse<FinancialYear | null>>(`/api/v1/organization/financial-years/current`),
    create: (data: Partial<FinancialYear>) => apiFetch(`/api/v1/organization/financial-years`, { method: 'POST', body: JSON.stringify(data) }),
  },
  hierarchy: {
    getTree: () => apiFetch<SingleResponse<HierarchyNode[]>>(`/api/v1/organization/hierarchy`),
  },
}

// Backward compat — old client names as aliases to sub-namespaces
export const companyApi = organizationApi.companies
export const plantApi = organizationApi.plants
export const orgWarehouseApi = organizationApi.warehouses
export const departmentApi = organizationApi.departments
export const costCenterApi = organizationApi.costCenters
export const financialYearApi = organizationApi.financialYears
export const hierarchyApi = organizationApi.hierarchy
"""

# ─── inventory.ts (inventoryApi — ONE client, NOT split) ────────────────────

inventory = """/**
 * Inventory Domain — Stock, Ledger, Transactions, Reservations, Blocks, Batches, Expiry
 * ONE client with ALL inventory operations.
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { Inventory } from '@/types'

export const inventoryApi = {
  list: (params?: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; expired?: boolean }) =>
    apiFetch<PaginatedResponse<Inventory>>(`/api/v1/inventory/inventory?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Inventory }>(`/api/v1/inventory/inventory/${id}`),
  stockIn: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/inventory/stock-in`, { method: 'POST', body: JSON.stringify(data) }),
  stockOut: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/inventory/stock-out`, { method: 'POST', body: JSON.stringify(data) }),
  listLedger: (params?: { page?: number; productId?: string; warehouseId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/ledger?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listTransactions: (params?: { page?: number; movementType?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/transactions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  reserve: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/reservations`, { method: 'POST', body: JSON.stringify(data) }),
  block: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/blocks`, { method: 'POST', body: JSON.stringify(data) }),
  getExpiring: (days?: number) => apiFetch<{ success: true; data: Inventory[] }>(`/api/v1/inventory/expiry?days=${days ?? 30}`),
  listBatches: (params?: { page?: number; productId?: string; search?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/batches?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  markExpired: () => apiFetch(`/api/v1/inventory/expiry/mark-expired`, { method: 'POST' }),
  listReservations: (params?: { page?: number; status?: string; productId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/reservations?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listBlocks: (params?: { page?: number; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/blocks?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  releaseReservation: (id: string, reason?: string) => apiFetch(`/api/v1/inventory/reservations/${id}/release`, { method: 'POST', body: JSON.stringify({ reason }) }),
}
"""

# ─── warehouse.ts (warehouseApi + goodsReceiptApi) ──────────────────────────

warehouse = """/**
 * Warehouse Domain — Zones, Aisles, Racks, Bins, Putaway, Barcodes, Scan, Goods Receipt
 * warehouseApi: ONE client for all warehouse operations.
 * goodsReceiptApi: Separate aggregate (own lifecycle) in same domain file.
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { WarehouseBin, GoodsReceipt } from '@/types'

export const warehouseApi = {
  listZones: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/zones?warehouseId=${warehouseId}`),
  listAisles: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/aisles?warehouseId=${warehouseId}`),
  listRacks: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/racks?warehouseId=${warehouseId}`),
  listBins: (warehouseId: string, params?: { zoneId?: string; aisleId?: string; rackId?: string }) =>
    apiFetch<{ success: true; data: WarehouseBin[] }>(`/api/v1/warehouse/bins?${buildQueryString({ warehouseId, ...params })}`),
  createBin: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/bins`, { method: 'POST', body: JSON.stringify(data) }),
  createZone: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/zones`, { method: 'POST', body: JSON.stringify(data) }),
  createAisle: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/aisles`, { method: 'POST', body: JSON.stringify(data) }),
  createRack: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/racks`, { method: 'POST', body: JSON.stringify(data) }),
  listPutawayTasks: (params?: { page?: number; status?: string; warehouseId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/warehouse/putaway-tasks?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPutawayTask: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/putaway-tasks`, { method: 'POST', body: JSON.stringify(data) }),
  completePutaway: (id: string, version: number) => apiFetch(`/api/v1/warehouse/putaway-tasks/${id}/complete`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  createBarcode: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/barcodes`, { method: 'POST', body: JSON.stringify(data) }),
  printBarcode: (id: string) => apiFetch(`/api/v1/warehouse/barcodes/${id}/print`, { method: 'POST' }),
  scan: (barcode: string, scanType: string) => apiFetch(`/api/v1/warehouse/scan`, { method: 'POST', body: JSON.stringify({ barcode, scanType }) }),
  listScanLogs: (params?: { page?: number; warehouseId?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/scan-logs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listBarcodes: (params?: { labelType?: string; productId?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/barcodes?${buildQueryString(params as Record<string, string | number | undefined>)}`),
}

export const goodsReceiptApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; supplierId?: string; poId?: string }) =>
    apiFetch<PaginatedResponse<GoodsReceipt>>(`/api/v1/warehouse/grns/grns?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: GoodsReceipt & { lines: unknown[]; attachments: unknown[]; damages: unknown[] } }>(`/api/v1/warehouse/grns/grns/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/grns/grns`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/warehouse/grns/grns/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
}
"""

# ─── procurement.ts (4 clients) ─────────────────────────────────────────────

procurement = """/**
 * Procurement Domain — Requisitions, Purchase Orders, Quotations, RFQs
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const procurementApi = {
  list: (params?: { page?: number; search?: string; status?: string; priority?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/requisitions/requisitions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/requisitions/requisitions/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/requisitions/requisitions`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number, comments?: string) => apiFetch(`/api/v1/procurement/requisitions/requisitions/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, comments }) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/requisitions/requisitions/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
}

export const purchaseOrderApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; poType?: string; supplierId?: string; plantId?: string; sortBy?: string; sortOrder?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/purchase-orders/pos?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/purchase-orders/pos/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number, extra?: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, ...extra }) }),
  issue: (id: string, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/issue`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  cancel: (id: string, version: number, reason?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/cancel`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ cancelReason: reason }) }),
  close: (id: string, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/close`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  supplierAccept: (id: string, version: number, notes?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/supplier-accept`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ notes }) }),
  supplierReject: (id: string, version: number, notes?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/supplier-reject`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ notes }) }),
  supplierCounter: (id: string, version: number, counterTotal: number, notes?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/supplier-counter`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ counterTotal, notes }) }),
  revision: (id: string, version: number, reason: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/revision`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ revisionReason: reason }) }),
  fromQuotation: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos/from-quotation`, { method: 'POST', body: JSON.stringify(data) }),
  pdf: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/purchase-orders/pos/${id}/pdf`),
  exportPdf: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/purchase-orders/pos/${id}/export-pdf`),
  search: (criteria: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos/search`, { method: 'POST', body: JSON.stringify(criteria) }),
}

export const quotationApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; rfqId?: string; supplierId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/quotations/quotations?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/quotations/quotations/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/quotations/quotations`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number, extra?: Record<string, unknown>) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, ...extra }) }),
}

export const rfqApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/rfqs/rfqs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/rfqs/rfqs/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/rfqs/rfqs`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
}
"""

# ─── sales.ts (6 clients) ───────────────────────────────────────────────────

sales = """/**
 * Sales Domain — Orders, Fulfillment, Pick-Pack, Delivery, Returns, Pricing
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { SalesOrder, Allocation, WavePlan, PickList, PackingList, Shipment, DeliveryOrder, PriceList, Promotion, Coupon, TaxConfig } from '@/types'

export const salesOrderApi = {
  list: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<SalesOrder>>(`/api/v1/sales/orders/orders?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: SalesOrder }>(`/api/v1/sales/orders/orders/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/orders/orders`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/sales/orders/orders/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  hold: (id: string) => apiFetch(`/api/v1/sales/orders/orders/${id}/hold`, { method: 'POST' }),
  releaseHold: (id: string) => apiFetch(`/api/v1/sales/orders/orders/${id}/release-hold`, { method: 'POST' }),
}

export const fulfillmentApi = {
  listAllocations: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Allocation>>(`/api/v1/sales/fulfillment/allocations?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createAllocation: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/fulfillment/allocations`, { method: 'POST', body: JSON.stringify(data) }),
  listWaves: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<WavePlan>>(`/api/v1/sales/fulfillment/waves?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createWave: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/fulfillment/waves`, { method: 'POST', body: JSON.stringify(data) }),
}

export const pickPackApi = {
  listPickLists: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<PickList>>(`/api/v1/sales/pick-pack-dispatch/pick-lists?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPickList: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pick-pack-dispatch/pick-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listPackingLists: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<PackingList>>(`/api/v1/sales/pick-pack-dispatch/packing-lists?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPackingList: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pick-pack-dispatch/packing-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listShipments: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Shipment>>(`/api/v1/sales/pick-pack-dispatch/shipments?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createShipment: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pick-pack-dispatch/shipments`, { method: 'POST', body: JSON.stringify(data) }),
}

// Backward compat
export const pickPackDispatchApi = pickPackApi

export const deliveryApi = {
  listDeliveryOrders: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<DeliveryOrder>>(`/api/v1/sales/delivery/delivery-orders?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createDeliveryOrder: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/delivery/delivery-orders`, { method: 'POST', body: JSON.stringify(data) }),
  listPods: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/delivery/pods?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPod: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/delivery/pods`, { method: 'POST', body: JSON.stringify(data) }),
  listExceptions: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/delivery/exceptions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createException: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/delivery/exceptions`, { method: 'POST', body: JSON.stringify(data) }),
}

export const returnsApi = {
  listRmas: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/returns/rmas?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getRma: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/sales/returns/rmas/${id}`),
  createRma: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/returns/rmas`, { method: 'POST', body: JSON.stringify(data) }),
  transitionRma: (id: string, targetStatus: string) => apiFetch(`/api/v1/sales/returns/rmas/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  listInspections: (rmaId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/sales/returns/rmas/${rmaId}/inspections`),
  createInspection: (rmaId: string, data: Record<string, unknown>) => apiFetch(`/api/v1/sales/returns/rmas/${rmaId}/inspections`, { method: 'POST', body: JSON.stringify(data) }),
  listRefunds: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/returns/refunds?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createRefund: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/returns/refunds`, { method: 'POST', body: JSON.stringify(data) }),
}

export const pricingApi = {
  listPriceLists: (params?: { page?: number; search?: string; isActive?: boolean }) =>
    apiFetch<PaginatedResponse<PriceList>>(`/api/v1/sales/pricing/price-lists?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPriceList: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/price-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listPromotions: (params?: { page?: number; search?: string }) =>
    apiFetch<PaginatedResponse<Promotion>>(`/api/v1/sales/pricing/promotions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPromotion: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/promotions`, { method: 'POST', body: JSON.stringify(data) }),
  listCoupons: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Coupon>>(`/api/v1/sales/pricing/coupons?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCoupon: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/coupons`, { method: 'POST', body: JSON.stringify(data) }),
  listTaxConfigs: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<TaxConfig>>(`/api/v1/sales/pricing/tax-configs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createTaxConfig: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/tax-configs`, { method: 'POST', body: JSON.stringify(data) }),
  calculate: (data: Record<string, unknown>) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/pricing/calculate`, { method: 'POST', body: JSON.stringify(data) }),
}
"""

# ─── manufacturing.ts (3 clients) ───────────────────────────────────────────

manufacturing = """/**
 * Manufacturing Domain — Batches, Recipes, MES
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const batchApi = {
  list: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/batches/batches?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/batches/batches`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string) => apiFetch(`/api/v1/manufacturing/batches/batches/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  split: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/batches/batches/${id}/split`, { method: 'POST', body: JSON.stringify(data) }),
  merge: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/batches/batches/merge`, { method: 'POST', body: JSON.stringify(data) }),
  getGenealogy: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/genealogy`),
  getForwardTrace: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/forward-traceability`),
  getBackwardTrace: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/backward-traceability`),
}

// Backward compat
export const batchMfgApi = batchApi

export const recipeApi = {
  list: (params?: { page?: number; productId?: string; status?: string; search?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/recipes/recipes?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/recipes/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/recipes/recipes`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string) => apiFetch(`/api/v1/manufacturing/recipes/recipes/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  listBoms: (params?: { page?: number; productId?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/recipes/boms?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getBom: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/boms/${id}`),
  createBom: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/recipes/boms`, { method: 'POST', body: JSON.stringify(data) }),
  transitionBom: (id: string, targetStatus: string) => apiFetch(`/api/v1/manufacturing/recipes/boms/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  explodeBom: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/boms/${id}/explode`),
  listRoutings: (params?: { page?: number; productId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/recipes/routings?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getRouting: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/routings/${id}`),
  createRouting: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/recipes/routings`, { method: 'POST', body: JSON.stringify(data) }),
}

export const mesApi = {
  listMachines: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/machines?page=1`),
  listWorkCenters: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/work-centers?page=1`),
  listShifts: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/shifts?page=1`),
  listDowntime: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/downtime?page=1`),
  listEvents: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/events?page=1`),
  getDashboard: () => apiFetch<{ success: true; data: unknown }>(`/api/v1/mes/dashboard`),
  getOee: (machineId: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/mes/analytics/oee/${machineId}`),
  createMachine: (data: Record<string, unknown>) => apiFetch(`/api/v1/mes/machines`, { method: 'POST', body: JSON.stringify(data) }),
  updateMachineStatus: (id: string, status: string) => apiFetch(`/api/v1/mes/machines/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  recordDowntime: (data: Record<string, unknown>) => apiFetch(`/api/v1/mes/downtime`, { method: 'POST', body: JSON.stringify(data) }),
}
"""

# ─── quality.ts (qualityApi) ────────────────────────────────────────────────

quality = """/**
 * Quality Domain — Inspection, NCR, CAPA, COA, Holds
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const qualityApi = {
  listLots: (params?: { page?: number; pageSize?: number; search?: string; status?: string; grnId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/lots?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getLot: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/quality/lots/${id}`),
  createLot: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/lots`, { method: 'POST', body: JSON.stringify(data) }),
  startInspection: (id: string, version: number) => apiFetch(`/api/v1/quality/lots/${id}/start`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  recordResult: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/quality/lots/${id}/results`, { method: 'POST', body: JSON.stringify(data) }),
  transitionLot: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/quality/lots/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  listNcrs: (params?: { page?: number; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/ncrs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getNcr: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/quality/ncrs/${id}`),
  createNcr: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/ncrs`, { method: 'POST', body: JSON.stringify(data) }),
  transitionNcr: (id: string, targetStatus: string) => apiFetch(`/api/v1/quality/ncrs/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  listHolds: (params?: { page?: number; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/holds?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createHold: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/holds`, { method: 'POST', body: JSON.stringify(data) }),
  releaseHold: (id: string) => apiFetch(`/api/v1/quality/holds/${id}/release`, { method: 'POST' }),
  listCapas: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/capas?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCapa: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/capas`, { method: 'POST', body: JSON.stringify(data) }),
  listPlans: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/plans?page=1`),
  getPlan: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/quality/plans/${id}`),
  createPlan: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/plans`, { method: 'POST', body: JSON.stringify(data) }),
  listSamplingPlans: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/sampling-plans?page=1`),
  createSamplingPlan: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/sampling-plans`, { method: 'POST', body: JSON.stringify(data) }),
}

// Backward compat
export const qualityInspectionApi = qualityApi
"""

# ─── finance.ts (4 clients) ─────────────────────────────────────────────────

finance = """/**
 * Finance Domain — Costing, GST, Financial Foundation, General Ledger
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { ProductCost, GstConfig, Currency, ExchangeRate } from '@/types'

export const costingApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<ProductCost>>(`/api/v1/finance/costing?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: ProductCost }>(`/api/v1/finance/costing/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/costing`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/finance/costing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/finance/costing/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/finance/costing/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

export const gstApi = {
  list: (params?: { page?: number; search?: string }) =>
    apiFetch<PaginatedResponse<GstConfig>>(`/api/v1/finance/gst?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: GstConfig }>(`/api/v1/finance/gst/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gst`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gst/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/finance/gst/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/finance/gst/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

export const financeFoundationApi = {
  listAccounts: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/accounts?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createAccount: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/accounts`, { method: 'POST', body: JSON.stringify(data) }),
  listFiscalYears: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/fiscal-years?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createFiscalYear: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/fiscal-years`, { method: 'POST', body: JSON.stringify(data) }),
  listCurrencies: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Currency>>(`/api/v1/finance/foundation/currencies?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCurrency: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/currencies`, { method: 'POST', body: JSON.stringify(data) }),
  listExchangeRates: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<ExchangeRate>>(`/api/v1/finance/foundation/exchange-rates?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createExchangeRate: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/exchange-rates`, { method: 'POST', body: JSON.stringify(data) }),
  listCostCenters: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/cost-centers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCostCenter: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/cost-centers`, { method: 'POST', body: JSON.stringify(data) }),
  listProfitCenters: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/profit-centers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createProfitCenter: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/profit-centers`, { method: 'POST', body: JSON.stringify(data) }),
  closeFiscalPeriod: (id: string) => apiFetch(`/api/v1/finance/foundation/fiscal-periods/${id}/close`, { method: 'POST' }),
}

// Backward compat
export const financeApi = financeFoundationApi

export const glApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/gl?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/finance/gl/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gl`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gl/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/finance/gl/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/finance/gl/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}
"""

# ─── hr.ts (2 clients) ──────────────────────────────────────────────────────

hr = """/**
 * HR Domain — Attendance, Performance
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { AttendanceRecord, PerformanceCycle } from '@/types'

export const attendanceApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<AttendanceRecord>>(`/api/v1/hrms/attendance?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: AttendanceRecord }>(`/api/v1/hrms/attendance/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/attendance`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/hrms/attendance/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/hrms/attendance/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

// Backward compat
export const workforceApi = attendanceApi

export const performanceApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<PerformanceCycle>>(`/api/v1/hrms/performance?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: PerformanceCycle }>(`/api/v1/hrms/performance/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/performance`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/performance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/hrms/performance/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/hrms/performance/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}
"""

# ─── crm.ts (1 client) ──────────────────────────────────────────────────────

crm = """/**
 * CRM Domain — Activities, Leads, Opportunities, Complaints
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const crmApi = {
  listActivities: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/crm/foundation?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getActivity: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/crm/foundation/${id}`),
  createActivity: (data: Record<string, unknown>) => apiFetch(`/api/v1/crm/foundation`, { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/crm/foundation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id: string) => apiFetch(`/api/v1/crm/foundation/${id}`, { method: 'DELETE' }),
  transitionActivity: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/crm/foundation/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}
"""

# ─── bi.ts (1 client) ───────────────────────────────────────────────────────

bi = """/**
 * BI Domain — Alerts, KPIs
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const alertsApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/bi/alerts?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/bi/alerts/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/bi/alerts`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/bi/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/bi/alerts/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/bi/alerts/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
  count: (params?: { status?: string }) => apiFetch<{ success: true; data: { count: number } }>(`/api/v1/bi/alerts/count?${buildQueryString(params as Record<string, string | number | undefined>)}`),
}
"""

# ─── Write all domain files ─────────────────────────────────────────────────

domains = {
    'administration.ts': administration,
    'catalog.ts': catalog,
    'partners.ts': partners,
    'organization.ts': organization,
    'inventory.ts': inventory,
    'warehouse.ts': warehouse,
    'procurement.ts': procurement,
    'sales.ts': sales,
    'manufacturing.ts': manufacturing,
    'quality.ts': quality,
    'finance.ts': finance,
    'hr.ts': hr,
    'crm.ts': crm,
    'bi.ts': bi,
}

for fname, content in domains.items():
    (API_DIR / fname).write_text(content)
    print(f"  ✓ api/{fname}")

# Create master barrel
barrel = """/** Frontend API Layer — SINGLE SOURCE OF TRUTH for all API clients */
export * from './core'
export * from './administration'
export * from './catalog'
export * from './partners'
export * from './organization'
export * from './inventory'
export * from './warehouse'
export * from './procurement'
export * from './sales'
export * from './manufacturing'
export * from './quality'
export * from './finance'
export * from './hr'
export * from './crm'
export * from './bi'
"""
(API_DIR / 'index.ts').write_text(barrel)
print(f"  ✓ api/index.ts")
print(f"\n✓ Phase C complete: {len(domains)+1} domain files created")
