/** Quotation Frontend API Client */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('suop_access_token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options.headers as Record<string, string>) || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json as T
}

export interface QuotationLine {
  id: string
  line_no: number
  product_id: string
  product_sku: string
  product_name: string
  quoted_qty: number
  uom_code: string
  unit_price: number
  line_total: number
  currency: string
  lead_time_days?: number
  remarks?: string
}

export interface Quotation {
  id: string
  quotation_number: string
  rfq_id: string
  rfq_number: string
  supplier_id: string
  supplier_code: string
  supplier_name: string
  quotation_date: string
  validity_date: string
  currency: string
  payment_terms: string
  delivery_terms?: string
  lead_time_days?: number
  tax_percent?: number
  discount_percent?: number
  freight_amount?: number
  insurance_amount?: number
  warranty_terms?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  grand_total: number
  technical_score?: number
  commercial_score?: number
  overall_score?: number
  rank?: number
  is_lowest_price: boolean
  is_best_value: boolean
  recommendation_notes?: string
  rejection_reason?: string
  status: string
  version: number
  lines?: QuotationLine[]
}

export interface QuotationComparison {
  quotationId: string
  quotationNumber: string
  supplierId: string
  supplierCode: string
  supplierName: string
  grandTotal: number
  currency: string
  leadTimeDays: number
  paymentTerms: string
  taxPercent: number
  discountPercent: number
  freightAmount: number
  insuranceAmount: number
  warrantyTerms?: string
  validityDate: string
  status: string
  technicalScore: number | null
  commercialScore: number | null
  overallScore: number | null
  rank: number | null
  supplierQualityRating: number | null
  supplierDeliveryRating: number | null
  supplierPriceRating: number | null
  supplierOverallRating: number | null
  supplierRiskLevel: string
  isPreferredSupplier: boolean
  onTimeDeliveryPct: number | null
  isLowestPrice: boolean
  isBestValue: boolean
}

export interface ComparisonResult {
  rfqId: string
  quotationCount: number
  lowestPriceQuotation: string | null
  bestValueQuotation: string | null
  comparisons: QuotationComparison[]
}

export const quotationApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; rfqId?: string; supplierId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.rfqId) qs.set('rfqId', params.rfqId)
    if (params?.supplierId) qs.set('supplierId', params.supplierId)
    return apiFetch<{ success: true; data: Quotation[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/procurement/quotations/quotations?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Quotation }>(`/api/v1/procurement/quotations/quotations/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/quotations/quotations`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number, extra?: Record<string, unknown>) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, ...extra }) }),
  compare: (rfqId: string) => apiFetch<{ success: true; data: ComparisonResult }>(`/api/v1/procurement/quotations/quotations/compare/${rfqId}`),
}
