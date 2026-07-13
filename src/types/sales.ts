export interface SalesOrder { id: string; order_number: string; status: string; version: number }
export interface Allocation { id: string; allocation_number: string; status: string; version: number }
export interface WavePlan { id: string; wave_number: string; status: string; version: number }
export interface PickList { id: string; pick_list_number: string; status: string; version: number }
export interface PackingList { id: string; packing_list_number: string; status: string; version: number }
export interface Shipment { id: string; shipment_number: string; status: string; version: number }
export interface DeliveryOrder { id: string; delivery_number: string; status: string; version: number }
export interface PriceList { id: string; code: string; name: string; price_list_type?: string; currency: string; valid_from: string; valid_to?: string; priority: number; status: string; tax_mode?: string; version: number }
export interface Promotion { id: string; code: string; name: string; promotion_type: string; offer_type?: string; discount_value?: string; start_date: string; end_date: string; status: string; usage_limit?: number; used_count?: number; version: number }
export interface Coupon { id: string; coupon_code: string; coupon_name: string; coupon_type: string; discount_type: string; discount_value: string; status: string; usage_limit?: number; used_count?: number; version: number }
export interface TaxConfig { id: string; code: string; name: string; tax_type: string; rate: string; status: string; version: number }
