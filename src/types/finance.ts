export interface ProductCost { id: string; cost_id: string; status: string; version: number; created_at: string }
export interface GstConfig { id: string; code: string; name: string; tax_rate?: string; status: string; version: number }
export interface Currency { id: string; code: string; name: string; symbol: string; decimal_places: number; status: string }
export interface ExchangeRate { id: string; from_currency: string; to_currency: string; rate: string; effective_date: string; status: string }
