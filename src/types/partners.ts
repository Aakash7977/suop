export interface Customer {
  id: string; customer_code: string; customer_type: string; trade_name: string
  legal_name: string | null; gstin: string | null; primary_email: string | null
  phone: string | null; status: string; risk_rating: string; credit_limit: string | null
  outstanding_balance: string; credit_hold: boolean; version: number
}

export interface CustomerGroup { id: string; code: string; name: string }

export interface Supplier {
  id: string; vendor_code: string; legal_name: string; trade_name: string
  gstin: string | null; pan: string | null; primary_email: string | null; phone: string | null
  vendor_type: string; supplier_type: string; status: string; risk_level: string
  is_preferred: boolean; credit_limit: string | null; payment_terms: string; version: number
}

export interface SupplierCategory {
  id: string; code: string; name: string; supplier_type: string; vendor_type: string
}
