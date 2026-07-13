/**
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
