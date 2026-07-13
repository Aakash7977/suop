export interface Product {
  id: string; sku: string; item_code: string | null; name: string; short_name: string | null
  description: string | null; product_type: string; category_id: string | null; brand_id: string | null
  base_uom_id: string; hsn_code: string | null; gst_rate: string | null; mrp: string | null
  standard_cost: string | null; shelf_life_days: number | null; batch_required: boolean
  serial_required: boolean; expiry_tracking: boolean; fifo_strategy: string
  inspection_required: boolean; costing_method: string; abc_class: string | null
  xyz_class: string | null; fsn_class: string | null; is_critical: boolean
  procurement_type: string; status: string; version: number; created_at: string
  barcodes?: Array<{ id: string; barcode_type: string; barcodeValue: string; is_primary: boolean }>
}

export interface Category { id: string; code: string; name: string; product_type: string | null }
export interface Brand { id: string; code: string; name: string }
export interface UOM { id: string; code: string; name: string; symbol: string; uom_type: string }
