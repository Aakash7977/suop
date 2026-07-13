export interface Inventory {
  id: string; product_sku: string; product_name: string; warehouse_name: string
  bin_code: string | null; batch_number: string | null; lot_number: string | null
  quantity: number; available_qty: number; reserved_qty: number; blocked_qty: number
  unit_cost: number; moving_avg_cost: number; expiry_date: string | null
  is_expired: boolean; is_blocked: boolean
}
