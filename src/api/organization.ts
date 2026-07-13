/**
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
