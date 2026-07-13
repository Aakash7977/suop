/**
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
