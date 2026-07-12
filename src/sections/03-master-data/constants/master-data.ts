/**
 * Section 03 — Master Data Management
 * Shared Constants
 *
 * Status colors, type labels, lifecycle state maps, and other UI constants
 * used across all Section 03 modules. Extracted from inline definitions in
 * page.tsx — values are preserved exactly.
 */

// ─── Status Badge Colors ────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-600 text-white',
  INACTIVE: 'bg-slate-500 text-white',
  DRAFT: 'bg-slate-400 text-white',
  REVIEW: 'bg-blue-500 text-white',
  APPROVED: 'bg-emerald-600 text-white',
  PUBLISHED: 'bg-emerald-700 text-white',
  DISCONTINUED: 'bg-amber-600 text-white',
  ARCHIVED: 'bg-slate-600 text-white',
  // Customer lifecycle
  LEAD: 'bg-blue-500 text-white',
  PROSPECT: 'bg-cyan-500 text-white',
  BLOCKED: 'bg-red-600 text-white',
  // Supplier lifecycle
  VERIFICATION: 'bg-amber-500 text-white',
  PROBATION: 'bg-orange-500 text-white',
  BLACKLISTED: 'bg-red-700 text-white',
  // Generic
  PENDING: 'bg-amber-500 text-white',
  EXPIRED: 'bg-red-600 text-white',
  COMPLETED: 'bg-emerald-600 text-white',
  FAILED: 'bg-red-600 text-white',
  MAINTENANCE: 'bg-amber-600 text-white',
}

// ─── Product Type Labels ────────────────────────────────────────────────────

export const PRODUCT_TYPES = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'SEMI_FINISHED', label: 'Semi Finished Goods' },
  { value: 'FINISHED_GOOD', label: 'Finished Goods' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'CONSUMABLE', label: 'Consumable' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'BY_PRODUCT', label: 'By Product' },
  { value: 'SCRAP', label: 'Scrap' },
] as const

// ─── Product Lifecycle States (ProductLifecycle workflow) ───────────────────

export const PRODUCT_LIFECYCLE_STATES = [
  'DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'DISCONTINUED', 'ARCHIVED',
] as const

export const PRODUCT_LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['REVIEW'],
  REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['ACTIVE'],
  ACTIVE: ['DISCONTINUED', 'ARCHIVED'],
  DISCONTINUED: ['ACTIVE', 'ARCHIVED'],
  ARCHIVED: [],
}

// ─── Customer Lifecycle States ──────────────────────────────────────────────

export const CUSTOMER_LIFECYCLE_STATES = [
  'LEAD', 'PROSPECT', 'APPROVED', 'ACTIVE', 'BLOCKED', 'INACTIVE', 'ARCHIVED',
] as const

export const CUSTOMER_LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  LEAD: ['PROSPECT'],
  PROSPECT: ['APPROVED', 'LEAD'],
  APPROVED: ['ACTIVE'],
  ACTIVE: ['BLOCKED', 'INACTIVE', 'ARCHIVED'],
  BLOCKED: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  INACTIVE: ['ACTIVE', 'ARCHIVED'],
  ARCHIVED: [],
}

// ─── Supplier Lifecycle States ──────────────────────────────────────────────

export const SUPPLIER_LIFECYCLE_STATES = [
  'DRAFT', 'VERIFICATION', 'APPROVED', 'ACTIVE', 'PROBATION', 'BLOCKED', 'BLACKLISTED', 'ARCHIVED',
] as const

export const SUPPLIER_LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['VERIFICATION'],
  VERIFICATION: ['APPROVED', 'DRAFT'],
  APPROVED: ['ACTIVE'],
  ACTIVE: ['PROBATION', 'BLOCKED', 'ARCHIVED'],
  PROBATION: ['ACTIVE', 'BLOCKED'],
  BLOCKED: ['ACTIVE', 'BLACKLISTED', 'ARCHIVED'],
  BLACKLISTED: ['ARCHIVED'],
  ARCHIVED: [],
}

// ─── Organization Lifecycle States ──────────────────────────────────────────

export const ORG_LIFECYCLE_STATES = [
  'DRAFT', 'CONFIGURED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED',
] as const

// ─── Customer Types ─────────────────────────────────────────────────────────

export const CUSTOMER_TYPES = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'DEALER', label: 'Dealer' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'FRANCHISE', label: 'Franchise' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'CASH', label: 'Cash' },
] as const

// ─── Supplier / Vendor Types ────────────────────────────────────────────────

export const VENDOR_TYPES = [
  { value: 'MANUFACTURER', label: 'Manufacturer' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'TRADER', label: 'Trader' },
  { value: 'SERVICE_PROVIDER', label: 'Service Provider' },
  { value: 'TRANSPORTER', label: 'Transporter' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'IMPORTER', label: 'Importer' },
] as const

export const SUPPLIER_TYPES = [
  { value: 'DOMESTIC', label: 'Domestic' },
  { value: 'INTERNATIONAL', label: 'International' },
  { value: 'LOCAL', label: 'Local' },
] as const

// ─── Plant Types ────────────────────────────────────────────────────────────

export const PLANT_TYPES = [
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'DISTRIBUTION', label: 'Distribution' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'RESTAURANT', label: 'Restaurant' },
] as const

// ─── Warehouse Types ────────────────────────────────────────────────────────

export const WAREHOUSE_TYPES = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'FINISHED_GOODS', label: 'Finished Goods' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'DISTRIBUTION', label: 'Distribution' },
  { value: 'QUARANTINE', label: 'Quarantine' },
  { value: 'COLD_STORAGE', label: 'Cold Storage' },
  { value: 'DEEP_FREEZE', label: 'Deep Freeze' },
  { value: 'RETURNS', label: 'Returns' },
  { value: 'TRANSIT', label: 'Transit' },
  { value: 'SCRAP', label: 'Scrap' },
  { value: 'DISTRIBUTION_CENTER', label: 'Distribution Center' },
  { value: 'DARK_STORE', label: 'Dark Store' },
] as const

// ─── Cost Center Types ──────────────────────────────────────────────────────

export const COST_CENTER_TYPES = [
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SALES', label: 'Sales' },
] as const

// ─── Risk Levels ────────────────────────────────────────────────────────────

export const RISK_LEVELS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
] as const

// ─── Payment Terms ──────────────────────────────────────────────────────────

export const PAYMENT_TERMS = [
  { value: 'NET15', label: 'Net 15' },
  { value: 'NET30', label: 'Net 30' },
  { value: 'NET45', label: 'Net 45' },
  { value: 'NET60', label: 'Net 60' },
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: 'ADVANCE', label: 'Advance' },
] as const

// ─── FIFO Strategies ────────────────────────────────────────────────────────

export const FIFO_STRATEGIES = [
  { value: 'FEFO', label: 'FEFO (First Expiry First Out)' },
  { value: 'FIFO', label: 'FIFO (First In First Out)' },
  { value: 'LIFO', label: 'LIFO (Last In First Out)' },
] as const

// ─── Costing Methods ────────────────────────────────────────────────────────

export const COSTING_METHODS = [
  { value: 'FIFO', label: 'FIFO' },
  { value: 'LIFO', label: 'LIFO' },
  { value: 'WEIGHTED_AVG', label: 'Weighted Average' },
  { value: 'STANDARD', label: 'Standard Cost' },
  { value: 'ACTUAL', label: 'Actual Cost' },
] as const

// ─── Procurement Types ──────────────────────────────────────────────────────

export const PROCUREMENT_TYPES = [
  { value: 'MAKE', label: 'Make' },
  { value: 'BUY', label: 'Buy' },
  { value: 'BOTH', label: 'Both' },
] as const

// ─── ABC / XYZ / FSN Classes ────────────────────────────────────────────────

export const ABC_CLASSES = [
  { value: 'A', label: 'A (High Value)' },
  { value: 'B', label: 'B (Medium Value)' },
  { value: 'C', label: 'C (Low Value)' },
] as const

export const XYZ_CLASSES = [
  { value: 'X', label: 'X (Stable Demand)' },
  { value: 'Y', label: 'Y (Variable Demand)' },
  { value: 'Z', label: 'Z (Irregular Demand)' },
] as const

// ─── GST Rates (Indian Tax Slabs) ───────────────────────────────────────────

export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28] as const

// ─── Barcode Types ──────────────────────────────────────────────────────────

export const BARCODE_TYPES = [
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC_A', label: 'UPC-A' },
  { value: 'UPC_E', label: 'UPC-E' },
  { value: 'CODE_128', label: 'Code 128' },
  { value: 'CODE_39', label: 'Code 39' },
  { value: 'GS1_128', label: 'GS1-128' },
  { value: 'ITF_14', label: 'ITF-14' },
  { value: 'INTERNAL', label: 'Internal' },
] as const

// ─── Address Types ──────────────────────────────────────────────────────────

export const ADDRESS_TYPES = [
  { value: 'BILLING', label: 'Billing' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'REGISTERED_OFFICE', label: 'Registered Office' },
  { value: 'FACTORY', label: 'Factory' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'RETURN', label: 'Return' },
] as const

// ─── Compliance Types ───────────────────────────────────────────────────────

export const COMPLIANCE_TYPES = [
  { value: 'FSSAI', label: 'FSSAI' },
  { value: 'ISO_22000', label: 'ISO 22000' },
  { value: 'HACCP', label: 'HACCP' },
  { value: 'GST_REG', label: 'GST Registration' },
  { value: 'PAN', label: 'PAN' },
  { value: 'MSME', label: 'MSME' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'NDA', label: 'NDA' },
  { value: 'VENDOR_AGREEMENT', label: 'Vendor Agreement' },
] as const

// ─── Validation Regexes ─────────────────────────────────────────────────────

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
export const PINCODE_REGEX = /^[0-9]{6}$/
export const PHONE_REGEX = /^[+]?[0-9]{10,15}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Pagination Options ─────────────────────────────────────────────────────

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250] as const

// ─── API Base URL ───────────────────────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'
