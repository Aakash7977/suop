export interface WarehouseBin {
  id: string; bin_code: string; bin_name: string; bin_type: string; level: number
  capacity: number; used_capacity: number; is_active: boolean; is_blocked: boolean
}

export interface GoodsReceipt {
  id: string; grn_number: string; grn_date: string; po_number: string | null
  supplier_name: string; supplier_code: string | null; total_qty: number
  total_accepted_qty: number; status: string; version: number
}
