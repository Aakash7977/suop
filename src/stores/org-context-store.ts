/**
 * SUOP — Global Context Store (Zustand)
 * Sprint 4: Chief Architect Recommendation — Global Context Service
 *
 * Maintains the current working context (Enterprise, Company, Branch,
 * Plant, Warehouse, Department) so every module automatically filters
 * data without asking users to reselect on every screen.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OrgContext {
  enterpriseId: string | null
  enterpriseName: string | null
  companyId: string | null
  companyName: string | null
  branchId: string | null
  branchName: string | null
  plantId: string | null
  plantName: string | null
  warehouseId: string | null
  warehouseName: string | null
  departmentId: string | null
  departmentName: string | null
}

interface ContextState extends OrgContext {
  setEnterprise: (id: string, name: string) => void
  setCompany: (id: string, name: string) => void
  setBranch: (id: string, name: string) => void
  setPlant: (id: string, name: string) => void
  setWarehouse: (id: string, name: string) => void
  setDepartment: (id: string, name: string) => void
  clearBelow: (level: 'enterprise' | 'company' | 'branch' | 'plant' | 'warehouse' | 'department') => void
  reset: () => void
  getBreadcrumb: () => Array<{ level: string; name: string }>
}

const EMPTY_CONTEXT: OrgContext = {
  enterpriseId: null, enterpriseName: null,
  companyId: null, companyName: null,
  branchId: null, branchName: null,
  plantId: null, plantName: null,
  warehouseId: null, warehouseName: null,
  departmentId: null, departmentName: null,
}

export const useOrgContextStore = create<ContextState>()(
  persist(
    (set, get) => ({
      ...EMPTY_CONTEXT,

      setEnterprise: (id, name) =>
        set({ ...EMPTY_CONTEXT, enterpriseId: id, enterpriseName: name }),

      setCompany: (id, name) =>
        set({ companyId: id, companyName: name, branchId: null, branchName: null, plantId: null, plantName: null, warehouseId: null, warehouseName: null, departmentId: null, departmentName: null }),

      setBranch: (id, name) =>
        set({ branchId: id, branchName: name, plantId: null, plantName: null, warehouseId: null, warehouseName: null, departmentId: null, departmentName: null }),

      setPlant: (id, name) =>
        set({ plantId: id, plantName: name, warehouseId: null, warehouseName: null }),

      setWarehouse: (id, name) =>
        set({ warehouseId: id, warehouseName: name }),

      setDepartment: (id, name) =>
        set({ departmentId: id, departmentName: name }),

      clearBelow: (level) => {
        const state = get()
        const updates: Partial<OrgContext> = {}
        const levels = ['enterprise', 'company', 'branch', 'plant', 'warehouse', 'department']
        const startIdx = levels.indexOf(level) + 1
        for (let i = startIdx; i < levels.length; i++) {
          const l = levels[i]
          updates[`${l}Id` as keyof OrgContext] = null
          updates[`${l}Name` as keyof OrgContext] = null
        }
        set(updates)
      },

      reset: () => set(EMPTY_CONTEXT),

      getBreadcrumb: () => {
        const s = get()
        const crumbs: Array<{ level: string; name: string }> = []
        if (s.enterpriseName) crumbs.push({ level: 'Enterprise', name: s.enterpriseName })
        if (s.companyName) crumbs.push({ level: 'Company', name: s.companyName })
        if (s.branchName) crumbs.push({ level: 'Branch', name: s.branchName })
        if (s.plantName) crumbs.push({ level: 'Plant', name: s.plantName })
        if (s.warehouseName) crumbs.push({ level: 'Warehouse', name: s.warehouseName })
        if (s.departmentName) crumbs.push({ level: 'Department', name: s.departmentName })
        return crumbs
      },
    }),
    { name: 'suop-org-context' }
  )
)
