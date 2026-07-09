/**
 * SUOP Backend — Identity Platform Service
 * Sprint 3: Epics 2-9 — Authentication, JWT, Password, Sessions, Devices, Audit
 *
 * This service provides authentication APIs that work alongside Supabase Auth.
 * Supabase handles the actual JWT/refresh token management; this service
 * provides additional enterprise features (sessions, devices, audit, password policy).
 *
 * Endpoints:
 *   POST /api/auth/register       — Register new user
 *   POST /api/auth/login          — Login (delegates to Supabase)
 *   POST /api/auth/logout         — Logout
 *   POST /api/auth/refresh        — Refresh token
 *   GET  /api/auth/me             — Get current user
 *   POST /api/auth/change-password — Change password
 *   POST /api/auth/forgot-password — Send reset email
 *   POST /api/auth/reset-password  — Reset password with token
 *   POST /api/auth/send-verification — Send email verification
 *   POST /api/auth/verify-email   — Verify email with token
 *   GET  /api/sessions            — List user sessions
 *   DELETE /api/sessions/:id      — Revoke session
 *   DELETE /api/sessions/all      — Revoke all sessions
 *   GET  /api/devices             — List user devices
 *   DELETE /api/devices/:id       — Remove device
 *   GET  /api/health             — Health check (from Sprint 2)
 *   GET  /api/health/detailed    — Detailed health (from Sprint 2)
 *   GET  /api/info               — Platform info (from Sprint 2)
 *   GET  /api/modules            — Module list (from Sprint 2)
 */

import { createClient } from '@supabase/supabase-js'

const PORT = 3030
const VERSION = "27.0.0"

// ─── Supabase Admin Client (service role) ───────────────
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ─── Structured Logger ──────────────────────────────────
function log(level: string, message: string, metadata?: Record<string, unknown>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: 'suop-backend',
    module: 'identity',
    message,
    ...metadata,
  }))
}

// ─── Standard API Response ──────────────────────────────
function successResponse<T>(data: T, message: string = '') {
  return {
    success: true,
    message,
    data,
    meta: { correlationId: crypto.randomUUID() },
    errors: [],
  }
}

function errorResponse(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
  return {
    success: false,
    message,
    data: null,
    meta: { correlationId: crypto.randomUUID() },
    errors: [{ code, field: '', message }],
  }
}

// ─── Password Policy Check (Epic 4) ─────────────────────
function validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '12')

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }
  if (process.env.PASSWORD_REQUIRE_UPPERCASE === 'true' && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (process.env.PASSWORD_REQUIRE_LOWERCASE === 'true' && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (process.env.PASSWORD_REQUIRE_NUMBER === 'true' && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (process.env.PASSWORD_REQUIRE_SPECIAL === 'true' && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return { valid: errors.length === 0, errors }
}

// ─── TCP Connection Check (from Sprint 2) ───────────────
async function checkTcpConnection(host: string, port: number, timeoutMs: number = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const socket = Bun.connect({
        hostname: host,
        port: port,
        socket: {
          open() { resolve(true) },
          error() { resolve(false) },
        },
      })
      setTimeout(() => { try { socket.then(s => s.end()) } catch {} resolve(false) }, timeoutMs)
    } catch { resolve(false) }
  })
}

// ─── Health Checks ──────────────────────────────────────
async function checkService(name: string, host: string, port: number): Promise<{ name: string; status: string; latency: number; details?: string }> {
  const start = Date.now()
  const connected = await checkTcpConnection(host, port, 2000)
  return {
    name,
    status: connected ? 'healthy' : 'offline',
    latency: Date.now() - start,
    details: connected ? `Connected to ${host}:${port}` : `Cannot connect to ${host}:${port}`,
  }
}

// ─── Create Supabase Client ─────────────────────────────
function getSupabaseClient(token?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: token ? {
      headers: { Authorization: `Bearer ${token}` },
    } : undefined,
  })
}

// ═══════════════════════════════════════════════════════════
// SPRINT 8 — COMMERCIAL ENGINE SEED DATA (in-memory)
// (mirrors prisma schema price_lists, tax_groups, etc.)
// ═══════════════════════════════════════════════════════════
const COMMERCIAL_DATA = {
  priceLists: [
    { id: 'pl-retail-001', code: 'PL-RETAIL-MUM', name: 'Mumbai Retail Price List', type: 'RETAIL', currency: 'INR', validFrom: '2026-01-01', validTo: null, priority: 100, status: 'ACTIVE', taxMode: 'INCLUSIVE', itemCount: 248, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'pl-wholesale-001', code: 'PL-WS-DIST', name: 'Wholesale Distributor Price List', type: 'WHOLESALE', currency: 'INR', validFrom: '2026-01-01', validTo: null, priority: 200, status: 'ACTIVE', taxMode: 'EXCLUSIVE', itemCount: 180, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'pl-restaurant-001', code: 'PL-RST-MUM', name: 'Restaurant Menu Price List', type: 'RESTAURANT', currency: 'INR', validFrom: '2026-01-01', validTo: null, priority: 100, status: 'ACTIVE', taxMode: 'INCLUSIVE', itemCount: 65, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'pl-corporate-001', code: 'PL-CORP-TATA', name: 'Tata Corporate Contract Price List', type: 'CORPORATE', currency: 'INR', validFrom: '2026-04-01', validTo: '2027-03-31', priority: 50, status: 'ACTIVE', taxMode: 'EXCLUSIVE', itemCount: 92, createdAt: '2026-04-01T00:00:00Z' },
    { id: 'pl-festival-001', code: 'PL-FEST-DIWALI', name: 'Diwali Festival Price List', type: 'FESTIVAL', currency: 'INR', validFrom: '2026-10-15', validTo: '2026-11-15', priority: 30, status: 'SCHEDULED', taxMode: 'INCLUSIVE', itemCount: 45, createdAt: '2026-09-01T00:00:00Z' },
    { id: 'pl-export-001', code: 'PL-EXP-DUBAI', name: 'Dubai Export Price List', type: 'EXPORT', currency: 'USD', validFrom: '2026-01-01', validTo: null, priority: 150, status: 'ACTIVE', taxMode: 'EXCLUSIVE', itemCount: 38, createdAt: '2026-01-01T00:00:00Z' },
  ],
  taxGroups: [
    { id: 'tg-gst-5', code: 'GST-5', name: 'GST 5% (Food Items)', type: 'GST', isCompound: false, status: 'ACTIVE', rates: [{ componentType: 'CGST', ratePercentage: 2.5 }, { componentType: 'SGST', ratePercentage: 2.5 }], createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tg-gst-12', code: 'GST-12', name: 'GST 12% (Processed Foods)', type: 'GST', isCompound: false, status: 'ACTIVE', rates: [{ componentType: 'CGST', ratePercentage: 6 }, { componentType: 'SGST', ratePercentage: 6 }], createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tg-gst-18', code: 'GST-18', name: 'GST 18% (Beverages)', type: 'GST', isCompound: false, status: 'ACTIVE', rates: [{ componentType: 'CGST', ratePercentage: 9 }, { componentType: 'SGST', ratePercentage: 9 }], createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tg-gst-28', code: 'GST-28', name: 'GST 28% (Luxury/Sin)', type: 'GST', isCompound: false, status: 'ACTIVE', rates: [{ componentType: 'CGST', ratePercentage: 14 }, { componentType: 'SGST', ratePercentage: 14 }], createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tg-gst-0', code: 'GST-0', name: 'GST Exempt (Fresh Foods)', type: 'EXEMPT', isCompound: false, status: 'ACTIVE', rates: [], createdAt: '2026-01-01T00:00:00Z' },
    { id: 'tg-cess-5', code: 'CESS-5', name: 'Cess 5% over GST', type: 'CESS', isCompound: true, status: 'ACTIVE', rates: [{ componentType: 'CESS', ratePercentage: 5 }], createdAt: '2026-01-01T00:00:00Z' },
  ],
  discounts: [
    { id: 'd-001', code: 'DISC-5PCT', name: '5% General Discount', type: 'PERCENTAGE', discountValue: 5, discountType: 'PERCENTAGE', maxDiscountAmount: 50, isStackable: true, validFrom: '2026-01-01', validTo: null, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'd-002', code: 'DISC-FLAT-50', name: 'Flat ₹50 Off (above ₹500)', type: 'FLAT', discountValue: 50, discountType: 'AMOUNT', maxDiscountAmount: null, isStackable: false, validFrom: '2026-01-01', validTo: null, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'd-003', code: 'DISC-VOL-10', name: 'Volume Discount 10% (10+ units)', type: 'VOLUME', discountValue: 10, discountType: 'PERCENTAGE', maxDiscountAmount: 200, isStackable: false, validFrom: '2026-01-01', validTo: null, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'd-004', code: 'DISC-EMP-15', name: 'Employee Discount 15%', type: 'CUSTOMER', discountValue: 15, discountType: 'PERCENTAGE', maxDiscountAmount: null, isStackable: false, validFrom: '2026-01-01', validTo: null, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'd-005', code: 'DISC-SENIOR', name: 'Senior Citizen 7%', type: 'CUSTOMER', discountValue: 7, discountType: 'PERCENTAGE', maxDiscountAmount: null, isStackable: false, validFrom: '2026-01-01', validTo: null, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
  ],
  promotions: [
    { id: 'p-001', code: 'PROMO-DIWALI-2026', name: 'Diwali Dhamaka 15% Off', type: 'AUTOMATIC', offerType: 'PERCENT_OFF', offerValue: 15, channels: ['RETAIL_POS', 'ECOMMERCE'], validFrom: '2026-10-15', validTo: '2026-11-15', maxUsageCount: 1000, usedCount: 234, priority: 50, status: 'SCHEDULED', createdAt: '2026-09-01T00:00:00Z' },
    { id: 'p-002', code: 'PROMO-WEEKEND', name: 'Weekend Special 10%', type: 'AUTOMATIC', offerType: 'PERCENT_OFF', offerValue: 10, channels: ['RETAIL_POS'], validFrom: '2026-01-01', validTo: null, maxUsageCount: null, usedCount: 1582, priority: 100, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'p-003', code: 'PROMO-HAPPY-HRS', name: 'Happy Hours 20% (4-7PM)', type: 'AUTOMATIC', offerType: 'PERCENT_OFF', offerValue: 20, channels: ['RESTAURANT_POS'], validFrom: '2026-01-01', validTo: null, maxUsageCount: null, usedCount: 765, priority: 80, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'p-004', code: 'PROMO-BUY2GET1', name: 'Buy 2 Get 1 Free Sweets', type: 'AUTOMATIC', offerType: 'BUY_X_GET_Y', offerValue: null, channels: ['RETAIL_POS'], validFrom: '2026-01-01', validTo: null, maxUsageCount: null, usedCount: 423, priority: 90, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'p-005', code: 'PROMO-COUPON-WELCOME', name: 'Welcome Coupon ₹100 Off', type: 'COUPON', offerType: 'FLAT_OFF', offerValue: 100, channels: ['ALL'], validFrom: '2026-01-01', validTo: null, maxUsageCount: 5000, usedCount: 891, priority: 70, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
  ],
  futurePrices: [
    { id: 'fp-001', productId: 'prd-kaju-katli', productName: 'Kaju Katli 500g', currentPrice: 540, futurePrice: 580, changePercent: 7.41, effectiveDate: '2026-08-01', expiryDate: null, autoActivate: true, status: 'PENDING_APPROVAL', createdAt: '2026-07-05T00:00:00Z' },
    { id: 'fp-002', productId: 'prd-soan-cake', productName: 'Soan Cake 1kg', currentPrice: 880, futurePrice: 920, changePercent: 4.55, effectiveDate: '2026-08-01', expiryDate: null, autoActivate: true, status: 'APPROVED', createdAt: '2026-07-03T00:00:00Z' },
    { id: 'fp-003', productId: 'prd-mix-namkeen', productName: 'Mixed Namkeen 200g', currentPrice: 85, futurePrice: 80, changePercent: -5.88, effectiveDate: '2026-07-15', expiryDate: null, autoActivate: true, status: 'SCHEDULED', createdAt: '2026-07-01T00:00:00Z' },
    { id: 'fp-004', productId: 'prd-gulab-jamun', productName: 'Gulab Jamun 1kg', currentPrice: 420, futurePrice: 450, changePercent: 7.14, effectiveDate: '2026-09-01', expiryDate: null, autoActivate: true, status: 'PENDING_APPROVAL', createdAt: '2026-07-08T00:00:00Z' },
  ],
  approvals: [
    { id: 'ap-001', entityType: 'PRICE_LIST', entityId: 'pl-festival-001', entityName: 'Diwali Festival Price List', currentStage: 'PRICING_TEAM', status: 'IN_REVIEW', slaDueAt: '2026-09-15', slaBreached: false, createdAt: '2026-09-01T00:00:00Z' },
    { id: 'ap-002', entityType: 'FUTURE_PRICE', entityId: 'fp-001', entityName: 'Kaju Katli Price Change +7.41%', currentStage: 'FINANCE', status: 'IN_REVIEW', slaDueAt: '2026-07-20', slaBreached: false, createdAt: '2026-07-05T00:00:00Z' },
    { id: 'ap-003', entityType: 'PROMOTION', entityId: 'p-001', entityName: 'Diwali Dhamaka 15% Off', currentStage: 'MANAGEMENT', status: 'IN_REVIEW', slaDueAt: '2026-09-20', slaBreached: false, createdAt: '2026-08-25T00:00:00Z' },
    { id: 'ap-004', entityType: 'FUTURE_PRICE', entityId: 'fp-004', entityName: 'Gulab Jamun Price Change +7.14%', currentStage: 'DRAFT', status: 'PENDING', slaDueAt: '2026-07-25', slaBreached: false, createdAt: '2026-07-08T00:00:00Z' },
    { id: 'ap-005', entityType: 'DISCOUNT_RULE', entityId: 'd-005', entityName: 'Senior Citizen 7% Discount', currentStage: 'APPROVED', status: 'APPROVED', slaDueAt: '2026-06-30', slaBreached: false, createdAt: '2026-06-15T00:00:00Z' },
  ],
  costProfiles: [
    { id: 'cp-001', productId: 'prd-kaju-katli', productName: 'Kaju Katli 500g', costingMethod: 'FIFO', purchaseCost: 320, averageCost: 325, fifoCost: 318, weightedAverageCost: 327, standardCost: 330, lastPurchaseCost: 332, landingCost: 335, overheadCost: 15, totalCost: 350, currentMargin: 54.29, status: 'ACTIVE' },
    { id: 'cp-002', productId: 'prd-soan-cake', productName: 'Soan Cake 1kg', costingMethod: 'WEIGHTED_AVERAGE', purchaseCost: 580, averageCost: 585, fifoCost: 575, weightedAverageCost: 588, standardCost: 590, lastPurchaseCost: 595, landingCost: 600, overheadCost: 25, totalCost: 625, currentMargin: 28.64, status: 'ACTIVE' },
    { id: 'cp-003', productId: 'prd-mix-namkeen', productName: 'Mixed Namkeen 200g', costingMethod: 'STANDARD', purchaseCost: 48, averageCost: 50, fifoCost: 47, weightedAverageCost: 51, standardCost: 52, lastPurchaseCost: 49, landingCost: 50, overheadCost: 3, totalCost: 53, currentMargin: 37.65, status: 'ACTIVE' },
    { id: 'cp-004', productId: 'prd-gulab-jamun', productName: 'Gulab Jamun 1kg', costingMethod: 'LAST_PURCHASE', purchaseCost: 280, averageCost: 278, fifoCost: 275, weightedAverageCost: 282, standardCost: 285, lastPurchaseCost: 290, landingCost: 292, overheadCost: 12, totalCost: 304, currentMargin: 27.62, status: 'ACTIVE' },
  ],
  rules: [
    { id: 'cr-001', code: 'MIN-SELL-PRICE', name: 'Minimum Selling Price (Below Cost)', ruleType: 'MIN_SELLING_PRICE', enforcementMode: 'HARD_BLOCK', status: 'ACTIVE', ruleValue: { threshold: 'COST', message: 'Selling price cannot be below cost' } },
    { id: 'cr-002', code: 'MAX-DISC-30', name: 'Maximum Discount 30%', ruleType: 'MAX_DISCOUNT', enforcementMode: 'OVERRIDE_WITH_REASON', status: 'ACTIVE', ruleValue: { maxPercent: 30, requiresReason: true } },
    { id: 'cr-003', code: 'MIN-MARGIN-15', name: 'Minimum Margin 15%', ruleType: 'MIN_MARGIN', enforcementMode: 'WARN', status: 'ACTIVE', ruleValue: { minPercent: 15 } },
    { id: 'cr-004', code: 'HOLIDAY-MKUP', name: 'Festival Holiday Markup 5%', ruleType: 'HOLIDAY_PRICING', enforcementMode: 'HARD_BLOCK', status: 'ACTIVE', ruleValue: { markupPercent: 5, holidays: ['DIWALI', 'HOLI', 'CHRISTMAS'] } },
    { id: 'cr-005', code: 'CONTRACT-TATA', name: 'Tata Corporate Contract Pricing', ruleType: 'CONTRACT_PRICING', enforcementMode: 'HARD_BLOCK', status: 'ACTIVE', ruleValue: { customerId: 'cust-tata-001', priceListId: 'pl-corporate-001' } },
  ],
  resolutionLogs: [] as any[],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 9 — BUSINESS PARTNER SEED DATA (in-memory)
// Unified master: Customers, Suppliers, Transporters, Franchisees,
// Corporate Clients, Delivery Partners, Service Providers
// ═══════════════════════════════════════════════════════════
const BP_DATA = {
  partners: [
    {
      id: 'bp-001', partnerCode: 'CUST-TATA-001', legalName: 'Tata Consumer Products Ltd.', displayName: 'Tata Consumer',
      partnerType: 'CORPORATE', status: 'ACTIVE',
      gstNumber: '27AAACT2727Q1ZW', panNumber: 'AAACT2727Q', msmeNumber: null, fssaiNumber: null,
      currency: 'INR', creditLimit: 5000000, creditDays: 60, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.tataconsumer.com',
      riskCategory: 'LOW', riskScore: 12.5, parentPartnerId: null,
      roles: ['CUSTOMER', 'CORPORATE'],
      addresses: 3, contacts: 4, bankAccounts: 2, complianceRecords: 5,
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'bp-002', partnerCode: 'SUP-CASHEW-01', legalName: 'Konkan Cashew Processors Pvt. Ltd.', displayName: 'Konkan Cashew',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '27AAGCK1234M1Z2', panNumber: 'AAGCK1234M', msmeNumber: 'UDYAM-MH-12-0044521', fssaiNumber: '11522034000123',
      currency: 'INR', creditLimit: 1000000, creditDays: 30, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.konkancashew.in',
      riskCategory: 'LOW', riskScore: 18.0, parentPartnerId: null,
      roles: ['SUPPLIER', 'MANUFACTURER'],
      addresses: 2, contacts: 3, bankAccounts: 1, complianceRecords: 4,
      createdAt: '2026-01-20T00:00:00Z',
    },
    {
      id: 'bp-003', partnerCode: 'SUP-SUGAR-AP', legalName: 'Sri Balaji Sugar Industries Ltd.', displayName: 'Sri Balaji Sugar',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '37AAECS7890P1Z5', panNumber: 'AAECS7890P', msmeNumber: null, fssaiNumber: null,
      currency: 'INR', creditLimit: 2500000, creditDays: 45, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.sribalajisugar.com',
      riskCategory: 'MEDIUM', riskScore: 35.0, parentPartnerId: null,
      roles: ['SUPPLIER'],
      addresses: 2, contacts: 2, bankAccounts: 1, complianceRecords: 3,
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'bp-004', partnerCode: 'TRANS-BLUE-01', legalName: 'Blue Dart Express Ltd.', displayName: 'Blue Dart',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '27AAACB1234M1Z6', panNumber: 'AAACB1234M', msmeNumber: null, fssaiNumber: null,
      currency: 'INR', creditLimit: 500000, creditDays: 30, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.bluedart.com',
      riskCategory: 'LOW', riskScore: 15.0, parentPartnerId: null,
      roles: ['TRANSPORTER', 'DELIVERY_PARTNER'],
      addresses: 5, contacts: 6, bankAccounts: 2, complianceRecords: 2,
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'bp-005', partnerCode: 'CUST-RELIANCE-01', legalName: 'Reliance Retail Ltd.', displayName: 'Reliance Retail',
      partnerType: 'CORPORATE', status: 'ACTIVE',
      gstNumber: '27AAACR5055K1ZA', panNumber: 'AAACR5055K', msmeNumber: null, fssaiNumber: null,
      currency: 'INR', creditLimit: 8000000, creditDays: 45, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.relianceretail.com',
      riskCategory: 'LOW', riskScore: 8.0, parentPartnerId: null,
      roles: ['CUSTOMER', 'DISTRIBUTOR', 'RETAIL_OUTLET'],
      addresses: 8, contacts: 12, bankAccounts: 3, complianceRecords: 5,
      createdAt: '2026-01-12T00:00:00Z',
    },
    {
      id: 'bp-006', partnerCode: 'FRANCH-MUM-01', legalName: 'Sudhamrit Franchise - Andheri West', displayName: 'Sudhamrit Andheri',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '27AAGCS5678P1Z9', panNumber: 'AAGCS5678P', msmeNumber: 'UDYAM-MH-27-0012345', fssaiNumber: '11522034567890',
      currency: 'INR', creditLimit: 500000, creditDays: 15, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: null,
      riskCategory: 'MEDIUM', riskScore: 28.0, parentPartnerId: 'bp-001' === 'bp-001' ? null : null,
      roles: ['FRANCHISE', 'RETAIL_OUTLET'],
      addresses: 1, contacts: 2, bankAccounts: 1, complianceRecords: 3,
      createdAt: '2026-03-05T00:00:00Z',
    },
    {
      id: 'bp-007', partnerCode: 'SUP-GHEE-AMUL', legalName: 'Amul (Gujarat Co-op Milk Marketing Federation)', displayName: 'Amul',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '24AAACG1234N1Z1', panNumber: 'AAACG1234N', msmeNumber: null, fssaiNumber: '10322034000111',
      currency: 'INR', creditLimit: 3000000, creditDays: 30, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.amul.com',
      riskCategory: 'LOW', riskScore: 10.0, parentPartnerId: null,
      roles: ['SUPPLIER', 'DISTRIBUTOR'],
      addresses: 4, contacts: 5, bankAccounts: 2, complianceRecords: 4,
      createdAt: '2026-01-18T00:00:00Z',
    },
    {
      id: 'bp-008', partnerCode: 'CUST-BLR-TECH', legalName: 'Infosys Technologies Ltd.', displayName: 'Infosys',
      partnerType: 'CORPORATE', status: 'ACTIVE',
      gstNumber: '29AAACI4798L1ZB', panNumber: 'AAACI4798L', msmeNumber: null, fssaiNumber: null,
      currency: 'INR', creditLimit: 2000000, creditDays: 30, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.infosys.com',
      riskCategory: 'LOW', riskScore: 5.0, parentPartnerId: null,
      roles: ['CUSTOMER', 'CORPORATE', 'SERVICE_PROVIDER'],
      addresses: 3, contacts: 8, bankAccounts: 2, complianceRecords: 4,
      createdAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'bp-009', partnerCode: 'SUP-PKG-MUMBAI', legalName: 'Mumbai Packaging Solutions', displayName: 'Mumbai Packaging',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '27AAFCM9012P1Z3', panNumber: 'AAFCM9012P', msmeNumber: 'UDYAM-MH-16-0099887', fssaiNumber: null,
      currency: 'INR', creditLimit: 800000, creditDays: 30, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: null,
      riskCategory: 'MEDIUM', riskScore: 32.0, parentPartnerId: null,
      roles: ['SUPPLIER'],
      addresses: 2, contacts: 3, bankAccounts: 1, complianceRecords: 3,
      createdAt: '2026-02-20T00:00:00Z',
    },
    {
      id: 'bp-010', partnerCode: 'DELIV-ZOMATO-01', legalName: 'Zomato Limited', displayName: 'Zomato',
      partnerType: 'COMPANY', status: 'ACTIVE',
      gstNumber: '29AAACZ4567Q1Z8', panNumber: 'AAACZ4567Q', msmeNumber: null, fssaiNumber: null,
      currency: 'INR', creditLimit: 300000, creditDays: 15, paymentMode: 'CREDIT',
      preferredLanguage: 'EN', website: 'https://www.zomato.com',
      riskCategory: 'LOW', riskScore: 20.0, parentPartnerId: null,
      roles: ['DELIVERY_PARTNER', 'SERVICE_PROVIDER'],
      addresses: 6, contacts: 4, bankAccounts: 1, complianceRecords: 2,
      createdAt: '2026-03-01T00:00:00Z',
    },
  ],
  groups: [
    { id: 'cg-001', groupCode: 'CG-RETAIL', groupName: 'Retail Customers', groupType: 'CUSTOMER', discountPercent: 0, paymentTermsDefault: 'CASH', memberCount: 1245, status: 'ACTIVE' },
    { id: 'cg-002', groupCode: 'CG-WHOLESALE', groupName: 'Wholesale Customers', groupType: 'CUSTOMER', discountPercent: 5, paymentTermsDefault: 'NET_30', memberCount: 89, status: 'ACTIVE' },
    { id: 'cg-003', groupCode: 'CG-CORPORATE', groupName: 'Corporate Customers', groupType: 'CUSTOMER', discountPercent: 8, paymentTermsDefault: 'NET_45', memberCount: 32, status: 'ACTIVE' },
    { id: 'cg-004', groupCode: 'CG-VIP', groupName: 'VIP Customers', groupType: 'CUSTOMER', discountPercent: 12, paymentTermsDefault: 'NET_30', memberCount: 18, status: 'ACTIVE' },
    { id: 'cg-005', groupCode: 'CG-EXPORT', groupName: 'Export Customers', groupType: 'CUSTOMER', discountPercent: 0, paymentTermsDefault: 'ADVANCE', memberCount: 7, status: 'ACTIVE' },
    { id: 'cg-006', groupCode: 'SG-RAW-MATERIAL', groupName: 'Raw Material Suppliers', groupType: 'SUPPLIER', discountPercent: null, paymentTermsDefault: 'NET_30', memberCount: 24, status: 'ACTIVE' },
    { id: 'cg-007', groupCode: 'SG-PACKAGING', groupName: 'Packaging Suppliers', groupType: 'SUPPLIER', discountPercent: null, paymentTermsDefault: 'NET_30', memberCount: 12, status: 'ACTIVE' },
    { id: 'cg-008', groupCode: 'SG-TRANSPORT', groupName: 'Transport Services', groupType: 'SUPPLIER', discountPercent: null, paymentTermsDefault: 'NET_15', memberCount: 8, status: 'ACTIVE' },
    { id: 'cg-009', groupCode: 'SG-MAINTENANCE', groupName: 'Maintenance Services', groupType: 'SUPPLIER', discountPercent: null, paymentTermsDefault: 'NET_30', memberCount: 6, status: 'ACTIVE' },
    { id: 'cg-010', groupCode: 'SG-UTILITY', groupName: 'Utility Providers', groupType: 'SUPPLIER', discountPercent: null, paymentTermsDefault: 'NET_30', memberCount: 4, status: 'ACTIVE' },
  ],
  scorecards: [
    { partnerId: 'bp-002', partnerName: 'Konkan Cashew Processors', periodYear: 2026, periodQuarter: 2, onTimeDeliveryRating: 94.5, orderAccuracyRating: 98.2, qualityRating: 96.0, complaintRate: 1.2, paymentHistoryRating: 92.0, responseTimeRating: 88.0, riskScore: 18.0, overallScore: 93.5, performanceGrade: 'A', totalOrders: 142, totalOrderValue: 3845000, totalComplaints: 2, totalReturns: 1 },
    { partnerId: 'bp-003', partnerName: 'Sri Balaji Sugar', periodYear: 2026, periodQuarter: 2, onTimeDeliveryRating: 82.0, orderAccuracyRating: 88.5, qualityRating: 90.0, complaintRate: 3.5, paymentHistoryRating: 85.0, responseTimeRating: 78.0, riskScore: 35.0, overallScore: 83.5, performanceGrade: 'B', totalOrders: 56, totalOrderValue: 2890000, totalComplaints: 5, totalReturns: 3 },
    { partnerId: 'bp-007', partnerName: 'Amul', periodYear: 2026, periodQuarter: 2, onTimeDeliveryRating: 97.8, orderAccuracyRating: 99.5, qualityRating: 98.5, complaintRate: 0.5, paymentHistoryRating: 96.0, responseTimeRating: 95.0, riskScore: 10.0, overallScore: 97.8, performanceGrade: 'A+', totalOrders: 218, totalOrderValue: 8450000, totalComplaints: 1, totalReturns: 0 },
    { partnerId: 'bp-004', partnerName: 'Blue Dart Express', periodYear: 2026, periodQuarter: 2, onTimeDeliveryRating: 91.2, orderAccuracyRating: 96.8, qualityRating: 92.0, complaintRate: 2.8, paymentHistoryRating: 88.0, responseTimeRating: 90.5, riskScore: 15.0, overallScore: 91.6, performanceGrade: 'A', totalOrders: 485, totalOrderValue: 1240000, totalComplaints: 14, totalReturns: 0 },
    { partnerId: 'bp-009', partnerName: 'Mumbai Packaging Solutions', periodYear: 2026, periodQuarter: 2, onTimeDeliveryRating: 75.5, orderAccuracyRating: 82.0, qualityRating: 85.0, complaintRate: 5.2, paymentHistoryRating: 78.0, responseTimeRating: 72.0, riskScore: 32.0, overallScore: 78.5, performanceGrade: 'C', totalOrders: 38, totalOrderValue: 580000, totalComplaints: 8, totalReturns: 4 },
    { partnerId: 'bp-001', partnerName: 'Tata Consumer Products', periodYear: 2026, periodQuarter: 2, onTimeDeliveryRating: null, orderAccuracyRating: null, qualityRating: 95.0, complaintRate: 0.8, paymentHistoryRating: 99.0, responseTimeRating: null, riskScore: 12.5, overallScore: 96.2, performanceGrade: 'A+', totalOrders: 32, totalOrderValue: 12500000, totalComplaints: 0, totalReturns: 0 },
  ],
  relationships: [
    { id: 'rel-001', fromPartner: 'Tata Consumer Products', toPartner: 'Sudhamrit Foods Ltd.', relationshipType: 'CUSTOMER_OF', validFrom: '2026-01-15', status: 'ACTIVE' },
    { id: 'rel-002', fromPartner: 'Reliance Retail', toPartner: 'Reliance Industries', relationshipType: 'SUBSIDIARY', validFrom: '2026-01-12', status: 'ACTIVE' },
    { id: 'rel-003', fromPartner: 'Konkan Cashew Processors', toPartner: 'Sudhamrit Foods Ltd.', relationshipType: 'PREFERRED_SUPPLIER', validFrom: '2026-01-20', status: 'ACTIVE' },
    { id: 'rel-004', fromPartner: 'Amul', toPartner: 'Sudhamrit Foods Ltd.', relationshipType: 'STRATEGIC_PARTNER', validFrom: '2026-01-18', status: 'ACTIVE' },
    { id: 'rel-005', fromPartner: 'Sudhamrit Franchise - Andheri West', toPartner: 'Sudhamrit Foods Ltd.', relationshipType: 'FRANCHISE', validFrom: '2026-03-05', status: 'ACTIVE' },
  ],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 10 — IDENTIFICATION & TRACEABILITY SEED DATA
// Barcodes, QR Codes, Batches, Lots, Serial Numbers, GS1,
// Label Templates, Print Jobs, Traceability Logs
// ═══════════════════════════════════════════════════════════
const ID_DATA = {
  barcodeTypes: [
    { code: 'EAN_13', name: 'EAN-13', isGs1Standard: true, length: 13, requiresChecksum: true },
    { code: 'EAN_8', name: 'EAN-8', isGs1Standard: true, length: 8, requiresChecksum: true },
    { code: 'UPC_A', name: 'UPC-A', isGs1Standard: true, length: 12, requiresChecksum: true },
    { code: 'UPC_E', name: 'UPC-E', isGs1Standard: true, length: 8, requiresChecksum: true },
    { code: 'CODE_128', name: 'Code 128', isGs1Standard: false, length: null, requiresChecksum: true },
    { code: 'CODE_39', name: 'Code 39', isGs1Standard: false, length: null, requiresChecksum: false },
    { code: 'GS1_128', name: 'GS1-128', isGs1Standard: true, length: null, requiresChecksum: true },
    { code: 'ITF_14', name: 'ITF-14', isGs1Standard: true, length: 14, requiresChecksum: true },
    { code: 'INTERNAL', name: 'Internal Barcode', isGs1Standard: false, length: null, requiresChecksum: false },
  ],
  barcodes: [
    { id: 'bc-001', barcode: '8901234567890', barcodeType: 'EAN_13', productName: 'Kaju Katli 500g', productId: 'prd-kaju-katli', isPrimary: true, status: 'ACTIVE' },
    { id: 'bc-002', barcode: '8901234567891', barcodeType: 'EAN_13', productName: 'Kaju Katli 250g', productId: 'prd-kaju-katli-250', isPrimary: true, status: 'ACTIVE' },
    { id: 'bc-003', barcode: '8901234567892', barcodeType: 'EAN_13', productName: 'Soan Cake 1kg', productId: 'prd-soan-cake', isPrimary: true, status: 'ACTIVE' },
    { id: 'bc-004', barcode: '8901234567893', barcodeType: 'EAN_13', productName: 'Mixed Namkeen 200g', productId: 'prd-mix-namkeen', isPrimary: true, status: 'ACTIVE' },
    { id: 'bc-005', barcode: '8901234567894', barcodeType: 'EAN_13', productName: 'Gulab Jamun 1kg', productId: 'prd-gulab-jamun', isPrimary: true, status: 'ACTIVE' },
    { id: 'bc-006', barcode: 'SUDH-INT-KK-500', barcodeType: 'INTERNAL', productName: 'Kaju Katli 500g (Internal)', productId: 'prd-kaju-katli', isPrimary: false, status: 'ACTIVE' },
    { id: 'bc-007', barcode: 'SUDH-INT-SC-1000', barcodeType: 'INTERNAL', productName: 'Soan Cake 1kg (Internal)', productId: 'prd-soan-cake', isPrimary: false, status: 'ACTIVE' },
    { id: 'bc-008', barcode: '00012345600012', barcodeType: 'ITF_14', productName: 'Kaju Katli Carton (12 pcs)', productId: 'prd-kaju-katli', isPrimary: false, status: 'ACTIVE' },
  ],
  qrCodes: [
    { id: 'qr-001', qrCode: 'QR-PROD-KK-001', purpose: 'PRODUCT', entityType: 'PRODUCT', entityName: 'Kaju Katli 500g', scanCount: 1247, lastScannedAt: '2026-07-08T15:23:00Z', isEncrypted: false, status: 'ACTIVE' },
    { id: 'qr-002', qrCode: 'QR-BATCH-KK-2607-01', purpose: 'BATCH', entityType: 'BATCH', entityName: 'Kaju Katli Batch KK-2607-01', scanCount: 384, lastScannedAt: '2026-07-09T11:15:00Z', isEncrypted: true, encryptionMethod: 'AES-256', status: 'ACTIVE' },
    { id: 'qr-003', qrCode: 'QR-WHSE-MUM-DC', purpose: 'WAREHOUSE', entityType: 'WAREHOUSE', entityName: 'Mumbai Distribution Center', scanCount: 5421, lastScannedAt: '2026-07-09T09:00:00Z', isEncrypted: false, status: 'ACTIVE' },
    { id: 'qr-004', qrCode: 'QR-LOC-A1-03', purpose: 'LOCATION', entityType: 'LOCATION', entityName: 'Rack A1, Bin 03 (Cold Storage)', scanCount: 892, lastScannedAt: '2026-07-09T14:30:00Z', isEncrypted: false, status: 'ACTIVE' },
    { id: 'qr-005', qrCode: 'QR-ASSET-MIXER-01', purpose: 'ASSET', entityType: 'ASSET', entityName: 'Industrial Mixer M-01', scanCount: 156, lastScannedAt: '2026-07-07T16:45:00Z', isEncrypted: true, encryptionMethod: 'AES-256', status: 'ACTIVE' },
    { id: 'qr-006', qrCode: 'QR-INV-2026-00892', purpose: 'INVOICE', entityType: 'INVOICE', entityName: 'Invoice INV-2026-00892 (Tata)', scanCount: 12, lastScannedAt: '2026-07-08T18:00:00Z', isEncrypted: false, status: 'ACTIVE' },
  ],
  batches: [
    { id: 'bat-001', batchNumber: 'KK-2607-01', productName: 'Kaju Katli 500g', productId: 'prd-kaju-katli', manufacturingDate: '2026-07-01', expiryDate: '2026-07-31', bestBeforeDate: '2026-07-25', quantityProduced: 500, quantityRemaining: 142, status: 'RELEASED', qualityGrade: 'A', lots: 3 },
    { id: 'bat-002', batchNumber: 'KK-2607-02', productName: 'Kaju Katli 500g', productId: 'prd-kaju-katli', manufacturingDate: '2026-07-05', expiryDate: '2026-08-04', bestBeforeDate: '2026-07-29', quantityProduced: 800, quantityRemaining: 800, status: 'QUARANTINED', qualityGrade: null, lots: 0, statusReason: 'Quality check pending' },
    { id: 'bat-003', batchNumber: 'SC-2606-04', productName: 'Soan Cake 1kg', productId: 'prd-soan-cake', manufacturingDate: '2026-06-15', expiryDate: '2026-09-15', bestBeforeDate: '2026-08-30', quantityProduced: 300, quantityRemaining: 89, status: 'RELEASED', qualityGrade: 'A', lots: 2 },
    { id: 'bat-004', batchNumber: 'MN-2607-03', productName: 'Mixed Namkeen 200g', productId: 'prd-mix-namkeen', manufacturingDate: '2026-07-08', expiryDate: '2026-08-22', bestBeforeDate: '2026-08-15', quantityProduced: 1200, quantityRemaining: 1180, status: 'PRODUCED', qualityGrade: 'B', lots: 4 },
    { id: 'bat-005', batchNumber: 'GJ-2606-02', productName: 'Gulab Jamun 1kg', productId: 'prd-gulab-jamun', manufacturingDate: '2026-06-20', expiryDate: '2026-07-20', bestBeforeDate: '2026-07-15', quantityProduced: 400, quantityRemaining: 0, status: 'EXPIRED', qualityGrade: null, lots: 2, statusReason: 'Past expiry - dispose' },
    { id: 'bat-006', batchNumber: 'GJ-2607-01', productName: 'Gulab Jamun 1kg', productId: 'prd-gulab-jamun', manufacturingDate: '2026-07-05', expiryDate: '2026-08-05', bestBeforeDate: '2026-07-30', quantityProduced: 600, quantityRemaining: 412, status: 'RELEASED', qualityGrade: 'A', lots: 3 },
    { id: 'bat-007', batchNumber: 'KK-2606-05', productName: 'Kaju Katli 500g', productId: 'prd-kaju-katli', manufacturingDate: '2026-06-25', expiryDate: '2026-07-25', bestBeforeDate: '2026-07-20', quantityProduced: 700, quantityRemaining: 56, status: 'BLOCKED', qualityGrade: 'C', lots: 2, statusReason: 'Customer complaint - investigation' },
    { id: 'bat-008', batchNumber: 'SC-2607-01', productName: 'Soan Cake 1kg', productId: 'prd-soan-cake', manufacturingDate: '2026-07-10', expiryDate: '2026-10-10', bestBeforeDate: '2026-09-25', quantityProduced: 0, quantityRemaining: 0, status: 'PLANNED', qualityGrade: null, lots: 0 },
  ],
  lots: [
    { id: 'lot-001', lotNumber: 'CASHEW-KK-2606', lotType: 'SUPPLIER_LOT', productName: 'Cashew Nuts (Raw Material)', supplier: 'Konkan Cashew Processors', supplierInvoice: 'PO-2026-0142', batch: 'KK-2607-01', quantity: 200, remaining: 35, quality: 'PASSED' },
    { id: 'lot-002', lotNumber: 'SUGAR-SB-2606', lotType: 'SUPPLIER_LOT', productName: 'Sugar (Raw Material)', supplier: 'Sri Balaji Sugar', supplierInvoice: 'PO-2026-0156', batch: 'KK-2607-01', quantity: 150, remaining: 28, quality: 'PASSED' },
    { id: 'lot-003', lotNumber: 'GHEE-AM-2606', lotType: 'SUPPLIER_LOT', productName: 'Ghee (Raw Material)', supplier: 'Amul', supplierInvoice: 'PO-2026-0178', batch: 'KK-2607-01', quantity: 50, remaining: 12, quality: 'PASSED' },
    { id: 'lot-004', lotNumber: 'PROD-KK-2607-01-A', lotType: 'PRODUCTION_LOT', productName: 'Kaju Katli (Production Run A)', supplier: null, supplierInvoice: null, batch: 'KK-2607-01', quantity: 250, remaining: 78, quality: 'PASSED' },
    { id: 'lot-005', lotNumber: 'PROD-KK-2607-01-B', lotType: 'PRODUCTION_LOT', productName: 'Kaju Katli (Production Run B)', supplier: null, supplierInvoice: null, batch: 'KK-2607-01', quantity: 250, remaining: 64, quality: 'PASSED' },
    { id: 'lot-006', lotNumber: 'PKG-MB-2607', lotType: 'SUPPLIER_LOT', productName: 'Packaging Boxes', supplier: 'Mumbai Packaging Solutions', supplierInvoice: 'PO-2026-0203', batch: null, quantity: 5000, remaining: 2840, quality: 'PASSED' },
    { id: 'lot-007', lotNumber: 'RET-KK-2606-05', lotType: 'RETURN_LOT', productName: 'Kaju Katli (Returned Batch)', supplier: null, supplierInvoice: null, batch: 'KK-2606-05', quantity: 24, remaining: 24, quality: 'QUARANTINED', inspectionNotes: 'Customer complaint: taste deviation' },
  ],
  serialNumbers: [
    { id: 'sn-001', serialNumber: 'SUDH-MIX-M01', productName: 'Industrial Dough Mixer', entityType: 'MACHINE', warrantyStart: '2025-04-01', warrantyEnd: '2027-04-01', status: 'IN_SERVICE', currentLocation: 'Mumbai Plant - Production Line 1', lastServiceDate: '2026-06-15', nextServiceDate: '2026-09-15' },
    { id: 'sn-002', serialNumber: 'SUDH-PACK-P02', productName: 'Automatic Packaging Machine', entityType: 'MACHINE', warrantyStart: '2025-04-01', warrantyEnd: '2027-04-01', status: 'IN_SERVICE', currentLocation: 'Mumbai Plant - Packaging Line 2', lastServiceDate: '2026-06-20', nextServiceDate: '2026-09-20' },
    { id: 'sn-003', serialNumber: 'SUDH-COLD-S01', productName: 'Walk-in Cold Storage Unit', entityType: 'EQUIPMENT', warrantyStart: '2024-01-15', warrantyEnd: '2026-01-15', status: 'UNDER_REPAIR', currentLocation: 'Mumbai DC - Cold Zone', lastServiceDate: '2026-07-01', nextServiceDate: '2026-07-12' },
    { id: 'sn-004', serialNumber: 'SUDH-FORL-F03', productName: 'Electric Forklift', entityType: 'EQUIPMENT', warrantyStart: '2024-08-01', warrantyEnd: '2026-08-01', status: 'IN_SERVICE', currentLocation: 'Pune Warehouse', lastServiceDate: '2026-05-10', nextServiceDate: '2026-08-10' },
    { id: 'sn-005', serialNumber: 'SUDH-POS-R001', productName: 'POS Terminal (Retail)', entityType: 'ELECTRONICS', warrantyStart: '2025-10-01', warrantyEnd: '2026-10-01', status: 'ACTIVE', currentLocation: 'Mumbai Retail Store 01', lastServiceDate: null, nextServiceDate: null },
  ],
  gs1Identifiers: [
    { id: 'gs1-001', gs1Type: 'GTIN', identifier: '08901234567890', entityType: 'PRODUCT', entityName: 'Kaju Katli 500g', companyPrefix: '8901234', checkDigit: '0' },
    { id: 'gs1-002', gs1Type: 'GTIN', identifier: '08901234567891', entityType: 'PRODUCT', entityName: 'Kaju Katli 250g', companyPrefix: '8901234', checkDigit: '1' },
    { id: 'gs1-003', gs1Type: 'GLN', identifier: '8901234000017', entityType: 'LOCATION', entityName: 'Mumbai Plant', companyPrefix: '8901234', checkDigit: '7' },
    { id: 'gs1-004', gs1Type: 'GLN', identifier: '8901234000024', entityType: 'LOCATION', entityName: 'Mumbai Distribution Center', companyPrefix: '8901234', checkDigit: '4' },
    { id: 'gs1-005', gs1Type: 'SSCC', identifier: '008901234000000018', entityType: 'LOGISTIC_UNIT', entityName: 'Pallet PAL-2026-001', companyPrefix: '8901234', checkDigit: '8' },
    { id: 'gs1-006', gs1Type: 'GS1_128', identifier: '(01)08901234567890(17)260731(10)KK260701', entityType: 'PRODUCT', entityName: 'Kaju Katli 500g with batch+expiry', companyPrefix: '8901234', checkDigit: '0' },
  ],
  labelTemplates: [
    { id: 'lt-001', templateCode: 'LBL-PROD-STD', templateName: 'Product Label (Standard)', labelType: 'PRODUCT', printFormat: 'THERMAL', widthMm: 100, heightMm: 60, status: 'PUBLISHED', version: 3, fields: 8 },
    { id: 'lt-002', templateCode: 'LBL-SHELF-STD', templateName: 'Shelf Label', labelType: 'SHELF', printFormat: 'THERMAL', widthMm: 80, heightMm: 40, status: 'PUBLISHED', version: 2, fields: 5 },
    { id: 'lt-003', templateCode: 'LBL-PALLET-STD', templateName: 'Pallet Label (GS1)', labelType: 'PALLET', printFormat: 'ZEBRA', widthMm: 150, heightMm: 100, status: 'PUBLISHED', version: 4, fields: 10 },
    { id: 'lt-004', templateCode: 'LBL-BATCH-EXP', templateName: 'Batch Label with Expiry', labelType: 'BATCH', printFormat: 'THERMAL', widthMm: 100, heightMm: 50, status: 'PUBLISHED', version: 2, fields: 6 },
    { id: 'lt-005', templateCode: 'LBL-LOC-QR', templateName: 'Location QR Label', labelType: 'LOCATION', printFormat: 'PDF', widthMm: 90, heightMm: 90, status: 'PUBLISHED', version: 1, fields: 4 },
    { id: 'lt-006', templateCode: 'LBL-SHIP-DISPATCH', templateName: 'Shipping Dispatch Label', labelType: 'SHIPPING', printFormat: 'A4', widthMm: 210, heightMm: 100, status: 'PUBLISHED', version: 5, fields: 12 },
    { id: 'lt-007', templateCode: 'LBL-QR-PROD', templateName: 'Product QR Code Label', labelType: 'QR', printFormat: 'THERMAL', widthMm: 60, heightMm: 60, status: 'PUBLISHED', version: 1, fields: 3 },
    { id: 'lt-008', templateCode: 'LBL-BC-EAN13', templateName: 'EAN-13 Barcode Label', labelType: 'BARCODE', printFormat: 'THERMAL', widthMm: 50, heightMm: 30, status: 'PENDING_APPROVAL', version: 1, fields: 2 },
  ],
  printJobs: [
    { id: 'lpj-001', templateName: 'Product Label (Standard)', printMode: 'BULK', entityType: 'PRODUCT', printerType: 'THERMAL', printerName: 'Zebra ZD420 - Plant 1', totalCopies: 500, printedCopies: 500, status: 'COMPLETED', requestedAt: '2026-07-08T10:00:00Z', completedAt: '2026-07-08T11:30:00Z' },
    { id: 'lpj-002', templateName: 'Batch Label with Expiry', printMode: 'SINGLE', entityType: 'BATCH', printerType: 'THERMAL', printerName: 'Brother TD-4520 - Plant 1', totalCopies: 50, printedCopies: 32, status: 'PRINTING', requestedAt: '2026-07-09T08:00:00Z' },
    { id: 'lpj-003', templateName: 'Pallet Label (GS1)', printMode: 'BULK', entityType: 'LOGISTIC_UNIT', printerType: 'ZEBRA', printerName: 'Zebra ZT411 - DC', totalCopies: 24, printedCopies: 0, status: 'QUEUED', requestedAt: '2026-07-09T09:15:00Z', scheduledAt: '2026-07-09T14:00:00Z' },
    { id: 'lpj-004', templateName: 'Location QR Label', printMode: 'BULK', entityType: 'LOCATION', printerType: 'LASER', printerName: 'HP LaserJet - Office', totalCopies: 120, printedCopies: 120, status: 'COMPLETED', requestedAt: '2026-07-07T15:00:00Z', completedAt: '2026-07-07T16:20:00Z' },
    { id: 'lpj-005', templateName: 'Shipping Dispatch Label', printMode: 'AUTO', entityType: 'INVOICE', printerType: 'NETWORK', printerName: 'Network Printer - Dispatch', totalCopies: 12, printedCopies: 8, status: 'PRINTING', requestedAt: '2026-07-09T11:00:00Z' },
    { id: 'lpj-006', templateName: 'Product Label (Standard)', printMode: 'REPRINT', entityType: 'PRODUCT', printerType: 'THERMAL', printerName: 'Zebra ZD420 - Plant 1', totalCopies: 100, printedCopies: 0, status: 'QUEUED', requestedAt: '2026-07-09T12:00:00Z' },
  ],
  traceabilityLogs: [
    { id: 'tl-001', entityType: 'RAW_MATERIAL', entityName: 'Cashew Lot CASHEW-KK-2606', eventType: 'PURCHASE_RECEIPT', fromEntityName: 'Konkan Cashew Processors', toEntityName: 'Mumbai Plant Warehouse', quantity: 200, referenceType: 'PURCHASE_ORDER', referenceNumber: 'PO-2026-0142', eventDate: '2026-06-28T09:00:00Z' },
    { id: 'tl-002', entityType: 'RAW_MATERIAL', entityName: 'Cashew Lot CASHEW-KK-2606', eventType: 'QUALITY_HOLD', fromEntityName: 'Mumbai Plant Warehouse', toEntityName: 'Quality Lab', quantity: 5, referenceType: 'QUALITY_ORDER', referenceNumber: 'QC-2026-0234', eventDate: '2026-06-28T14:00:00Z', notes: 'Sample for quality check' },
    { id: 'tl-003', entityType: 'RAW_MATERIAL', entityName: 'Cashew Lot CASHEW-KK-2606', eventType: 'PRODUCTION_INPUT', fromEntityName: 'Mumbai Plant Warehouse', toEntityName: 'Production Line 1 (Mixer M-01)', quantity: 180, referenceType: 'PRODUCTION_ORDER', referenceNumber: 'MO-2026-0089', eventDate: '2026-07-01T08:00:00Z' },
    { id: 'tl-004', entityType: 'BATCH', entityName: 'Batch KK-2607-01', batchId: 'bat-001', eventType: 'PRODUCTION_OUTPUT', fromEntityName: 'Production Line 1', toEntityName: 'Mumbai Plant Warehouse (Cold Zone)', quantity: 500, referenceType: 'PRODUCTION_ORDER', referenceNumber: 'MO-2026-0089', eventDate: '2026-07-01T16:00:00Z' },
    { id: 'tl-005', entityType: 'BATCH', entityName: 'Batch KK-2607-01', batchId: 'bat-001', eventType: 'WAREHOUSE_TRANSFER', fromEntityName: 'Mumbai Plant Warehouse', toEntityName: 'Mumbai Distribution Center', quantity: 358, referenceType: 'TRANSFER_ORDER', referenceNumber: 'TO-2026-0042', eventDate: '2026-07-03T10:00:00Z' },
    { id: 'tl-006', entityType: 'BATCH', entityName: 'Batch KK-2607-01', batchId: 'bat-001', eventType: 'SALES_DISPATCH', fromEntityName: 'Mumbai Distribution Center', toEntityName: 'Tata Consumer Products', quantity: 100, referenceType: 'INVOICE', referenceNumber: 'INV-2026-00892', eventDate: '2026-07-05T14:00:00Z' },
    { id: 'tl-007', entityType: 'BATCH', entityName: 'Batch KK-2607-01', batchId: 'bat-001', eventType: 'SALES_DISPATCH', fromEntityName: 'Mumbai Distribution Center', toEntityName: 'Reliance Retail (Andheri)', quantity: 48, referenceType: 'INVOICE', referenceNumber: 'INV-2026-00915', eventDate: '2026-07-06T11:30:00Z' },
    { id: 'tl-008', entityType: 'BATCH', entityName: 'Batch KK-2607-01', batchId: 'bat-001', eventType: 'SALES_DISPATCH', fromEntityName: 'Mumbai Distribution Center', toEntityName: 'Sudhamrit Retail Store 01', quantity: 24, referenceType: 'INVOICE', referenceNumber: 'INV-2026-00921', eventDate: '2026-07-06T15:45:00Z' },
    { id: 'tl-009', entityType: 'BATCH', entityName: 'Batch KK-2606-05', batchId: 'bat-007', eventType: 'RECALL', fromEntityName: 'Multiple Customers', toEntityName: 'Mumbai Plant Quality Lab', quantity: 56, referenceType: 'RECALL_ORDER', referenceNumber: 'RC-2026-001', eventDate: '2026-07-08T09:00:00Z', notes: 'Customer complaint: taste deviation - recall initiated' },
    { id: 'tl-010', entityType: 'BATCH', entityName: 'Batch KK-2606-05', batchId: 'bat-007', eventType: 'QUALITY_HOLD', fromEntityName: 'Quality Lab', toEntityName: 'Quarantine Zone', quantity: 56, referenceType: 'QUALITY_ORDER', referenceNumber: 'QC-2026-0351', eventDate: '2026-07-08T11:00:00Z', notes: 'Investigation: possible sugar proportion issue' },
  ],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 11 — DATA GOVERNANCE & MASTER DATA QUALITY SEED DATA
// Lifecycle, Approval Workflows, Import/Export, Validation,
// Duplicate Detection, Audit Trail, Quality Metrics, Change History
// ═══════════════════════════════════════════════════════════
const GOV_DATA = {
  lifecycles: [
    { id: 'plc-001', productName: 'Kaju Katli 500g', currentState: 'ACTIVE', previousState: 'PUBLISHED', submittedAt: '2026-06-15', approvedAt: '2026-06-18', publishedAt: '2026-06-20', activatedAt: '2026-06-20', stateReason: null, transitions: 4 },
    { id: 'plc-002', productName: 'Kaju Katli 250g', currentState: 'UNDER_REVIEW', previousState: 'DRAFT', submittedAt: '2026-07-08', approvedAt: null, publishedAt: null, stateReason: 'Pending QA review', transitions: 1 },
    { id: 'plc-003', productName: 'Soan Cake 1kg', currentState: 'ACTIVE', previousState: 'PUBLISHED', submittedAt: '2026-05-10', approvedAt: '2026-05-12', publishedAt: '2026-05-15', activatedAt: '2026-05-15', stateReason: null, transitions: 4 },
    { id: 'plc-004', productName: 'Mixed Namkeen 200g', currentState: 'APPROVED', previousState: 'UNDER_REVIEW', submittedAt: '2026-07-05', approvedAt: '2026-07-07', publishedAt: null, stateReason: 'Awaiting publish', transitions: 2 },
    { id: 'plc-005', productName: 'Gulab Jamun 1kg', currentState: 'INACTIVE', previousState: 'ACTIVE', submittedAt: '2026-04-01', approvedAt: '2026-04-03', publishedAt: '2026-04-05', activatedAt: '2026-04-05', inactivatedAt: '2026-07-01', stateReason: 'Seasonal - summer off-season', transitions: 5 },
    { id: 'plc-006', productName: 'Diwali Gift Hampers 2026', currentState: 'DRAFT', previousState: null, submittedAt: null, approvedAt: null, publishedAt: null, stateReason: 'New product in design', transitions: 0 },
    { id: 'plc-007', productName: 'Old Recipe Laddu 500g', currentState: 'ARCHIVED', previousState: 'DISCONTINUED', submittedAt: '2024-09-01', approvedAt: '2024-09-05', publishedAt: '2024-09-10', activatedAt: '2024-09-10', inactivatedAt: '2025-08-01', discontinuedAt: '2025-12-31', archivedAt: '2026-01-15', stateReason: 'Recipe discontinued, replaced by new formulation', transitions: 6 },
    { id: 'plc-008', productName: 'Pista Roll 250g', currentState: 'DISCONTINUED', previousState: 'INACTIVE', submittedAt: '2025-10-01', approvedAt: '2025-10-05', publishedAt: '2025-10-10', activatedAt: '2025-10-10', inactivatedAt: '2026-05-01', discontinuedAt: '2026-06-30', stateReason: 'Low demand', transitions: 5 },
  ],
  approvalWorkflows: [
    { id: 'awf-001', productName: 'Kaju Katli 250g', workflowType: 'STANDARD', currentStage: 'QA', status: 'IN_REVIEW', slaDueAt: '2026-07-12', slaBreached: false, initiatedAt: '2026-07-08', steps: 6, completedSteps: 2 },
    { id: 'awf-002', productName: 'Mixed Namkeen 200g', workflowType: 'STANDARD', currentStage: 'PUBLISHER', status: 'IN_REVIEW', slaDueAt: '2026-07-09', slaBreached: false, initiatedAt: '2026-07-05', steps: 6, completedSteps: 5 },
    { id: 'awf-003', productName: 'Diwali Gift Hampers 2026', workflowType: 'PARALLEL', currentStage: 'CREATOR', status: 'PENDING', slaDueAt: '2026-08-15', slaBreached: false, initiatedAt: '2026-07-08', steps: 6, completedSteps: 0 },
    { id: 'awf-004', productName: 'Pista Roll 250g', workflowType: 'CONDITIONAL', currentStage: 'COMPLETED', status: 'PUBLISHED', slaDueAt: '2025-10-15', slaBreached: false, initiatedAt: '2025-10-01', steps: 4, completedSteps: 4 },
    { id: 'awf-005', productName: 'Old Recipe Laddu 500g', workflowType: 'STANDARD', currentStage: 'COMPLETED', status: 'REJECTED', slaDueAt: '2026-01-20', slaBreached: true, initiatedAt: '2026-01-10', steps: 3, completedSteps: 3 },
  ],
  importJobs: [
    { id: 'ij-001', jobCode: 'IMP-PROD-2026-0142', entityType: 'PRODUCT', fileName: 'products_batch_july.xlsx', fileFormat: 'EXCEL', totalRows: 250, processedRows: 250, successRows: 242, errorRows: 5, duplicateRows: 3, status: 'COMPLETED', initiatedAt: '2026-07-08T10:00:00Z', completedAt: '2026-07-08T10:15:00Z' },
    { id: 'ij-002', jobCode: 'IMP-BP-2026-0089', entityType: 'BUSINESS_PARTNER', fileName: 'customers_import.csv', fileFormat: 'CSV', totalRows: 500, processedRows: 487, successRows: 485, errorRows: 12, duplicateRows: 3, status: 'COMPLETED', initiatedAt: '2026-07-07T14:00:00Z', completedAt: '2026-07-07T14:08:00Z' },
    { id: 'ij-003', jobCode: 'IMP-PROD-2026-0143', entityType: 'PRODUCT', fileName: 'new_sweets_catalog.xlsx', fileFormat: 'EXCEL', totalRows: 0, processedRows: 0, successRows: 0, errorRows: 0, duplicateRows: 0, status: 'PREVIEWING', initiatedAt: '2026-07-09T11:00:00Z', completedAt: null },
    { id: 'ij-004', jobCode: 'IMP-PROD-2026-0140', entityType: 'PRODUCT', fileName: 'faulty_import.xlsx', fileFormat: 'EXCEL', totalRows: 100, processedRows: 100, successRows: 45, errorRows: 55, duplicateRows: 0, status: 'ROLLBACK', initiatedAt: '2026-07-05T09:00:00Z', completedAt: '2026-07-05T09:10:00Z', rollbackReason: 'Excessive validation errors - rolled back per policy' },
    { id: 'ij-005', jobCode: 'IMP-PRICE-2026-0034', entityType: 'PRICE_LIST', fileName: 'price_update_august.csv', fileFormat: 'CSV', totalRows: 0, processedRows: 0, successRows: 0, errorRows: 0, duplicateRows: 0, status: 'QUEUED', initiatedAt: '2026-07-09T12:00:00Z', completedAt: null },
  ],
  exportJobs: [
    { id: 'ej-001', jobCode: 'EXP-PROD-2026-0056', entityType: 'PRODUCT', fileFormat: 'EXCEL', fileName: 'product_master_export.xlsx', totalRows: 1248, exportedRows: 1248, status: 'COMPLETED', fileSizeBytes: 245678, initiatedAt: '2026-07-08T16:00:00Z', completedAt: '2026-07-08T16:02:00Z' },
    { id: 'ej-002', jobCode: 'EXP-BP-2026-0023', entityType: 'BUSINESS_PARTNER', fileFormat: 'CSV', fileName: 'business_partners.csv', totalRows: 1412, exportedRows: 1412, status: 'COMPLETED', fileSizeBytes: 384567, initiatedAt: '2026-07-07T11:00:00Z', completedAt: '2026-07-07T11:01:00Z' },
    { id: 'ej-003', jobCode: 'EXP-PROD-2026-0057', entityType: 'PRODUCT', fileFormat: 'PDF', fileName: 'product_catalog_q3.pdf', totalRows: 0, exportedRows: 0, status: 'EXPORTING', initiatedAt: '2026-07-09T13:00:00Z', completedAt: null },
    { id: 'ej-004', jobCode: 'EXP-PRICE-2026-0012', entityType: 'PRICE_LIST', fileFormat: 'JSON', fileName: 'price_lists_api.json', totalRows: 6, exportedRows: 6, status: 'COMPLETED', fileSizeBytes: 45678, initiatedAt: '2026-07-08T09:00:00Z', completedAt: '2026-07-08T09:00:30Z' },
  ],
  validationRules: [
    { id: 'vr-001', ruleCode: 'PROD-NAME-REQ', ruleName: 'Product Name Required', entityType: 'PRODUCT', fieldName: 'productName', ruleType: 'REQUIRED', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-002', ruleCode: 'PROD-SKU-UNIQUE', ruleName: 'SKU Must Be Unique', entityType: 'PRODUCT', fieldName: 'sku', ruleType: 'UNIQUE', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-003', ruleCode: 'PROD-BARCODE-UNIQUE', ruleName: 'Barcode Must Be Unique', entityType: 'PRODUCT', fieldName: 'barcode', ruleType: 'UNIQUE', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-004', ruleCode: 'PROD-PRICE-RANGE', ruleName: 'Price Range (₹1 - ₹100000)', entityType: 'PRODUCT', fieldName: 'sellingPrice', ruleType: 'RANGE', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-005', ruleCode: 'PROD-HSN-REGEX', ruleName: 'HSN Code Format (4-8 digits)', entityType: 'PRODUCT', fieldName: 'hsnCode', ruleType: 'REGEX', severity: 'WARNING', enforcementMode: 'WARN', status: 'ACTIVE' },
    { id: 'vr-006', ruleCode: 'BP-GST-REGEX', ruleName: 'GST Number Format (15 chars)', entityType: 'BUSINESS_PARTNER', fieldName: 'gstNumber', ruleType: 'REGEX', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-007', ruleCode: 'BP-PAN-UNIQUE', ruleName: 'PAN Must Be Unique', entityType: 'BUSINESS_PARTNER', fieldName: 'panNumber', ruleType: 'UNIQUE', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-008', ruleCode: 'PROD-CAT-XREF', ruleName: 'Category Must Exist', entityType: 'PRODUCT', fieldName: 'categoryId', ruleType: 'CROSS_REFERENCE', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'vr-009', ruleCode: 'PROD-MARGIN-BIZ', ruleName: 'Margin Must Be > 5%', entityType: 'PRODUCT', fieldName: 'marginPercent', ruleType: 'BUSINESS_RULE', severity: 'WARNING', enforcementMode: 'WARN', status: 'ACTIVE' },
    { id: 'vr-010', ruleCode: 'PROD-UOM-REQ', ruleName: 'UOM Required for Stock Items', entityType: 'PRODUCT', fieldName: 'defaultUomId', ruleType: 'REQUIRED', severity: 'ERROR', enforcementMode: 'BLOCK', status: 'ACTIVE' },
  ],
  duplicateCandidates: [
    { id: 'dc-001', primaryName: 'Kaju Katli 500g', duplicateName: 'Kaju Katri 500g', detectionRule: 'SIMILAR_NAME', matchScore: 92.5, matchedFields: ['name (92% similar)', 'category (match)', 'brand (match)'], resolutionStatus: 'PENDING' },
    { id: 'dc-002', primaryName: 'Soan Cake 1kg', duplicateName: 'Soan Papdi 1kg', detectionRule: 'SIMILAR_NAME', matchScore: 78.3, matchedFields: ['name (78% similar)', 'category (match)'], resolutionStatus: 'FALSE_POSITIVE', resolutionNotes: 'Different products - Soan Cake vs Soan Papdi' },
    { id: 'dc-003', primaryName: 'Mixed Namkeen 200g', duplicateName: 'Namkeen Mix 200g', detectionRule: 'SIMILAR_NAME', matchScore: 88.9, matchedFields: ['name (89% similar)', 'category (match)', 'weight (match)'], resolutionStatus: 'MERGED', resolutionAction: 'KEEP_PRIMARY', resolutionNotes: 'Confirmed duplicate - merged into primary' },
    { id: 'dc-004', primaryName: 'Gulab Jamun 1kg', duplicateName: 'Gulab Jamun (1kg tin)', detectionRule: 'BARCODE', matchScore: 100, matchedFields: ['barcode (exact match)'], resolutionStatus: 'MERGED', resolutionAction: 'ARCHIVE_DUPLICATE', resolutionNotes: 'Same barcode - archived duplicate' },
    { id: 'dc-005', primaryName: 'Pista Roll 250g', duplicateName: 'Pista Roll 250gms', detectionRule: 'SKU', matchScore: 95.0, matchedFields: ['sku (95% similar)', 'name (match)'], resolutionStatus: 'PENDING' },
    { id: 'dc-006', primaryName: 'Cashew Nuts (Raw)', duplicateName: 'Cashew Nut Raw Material', detectionRule: 'SIMILAR_NAME', matchScore: 85.7, matchedFields: ['name (86% similar)'], resolutionStatus: 'IGNORED', resolutionNotes: 'Different grade specifications' },
  ],
  auditTrail: [
    { id: 'mda-001', entityType: 'PRODUCT', entityName: 'Kaju Katli 500g', action: 'UPDATE', moduleName: 'PIM', userName: 'Priya Sharma', userRole: 'PIM Manager', changedFields: ['sellingPrice: ₹520 → ₹540', 'mrp: ₹580 → ₹600'], reason: 'Quarterly price review', ipAddress: '192.168.1.45', changedAt: '2026-07-08T14:30:00Z' },
    { id: 'mda-002', entityType: 'PRODUCT', entityName: 'Mixed Namkeen 200g', action: 'CREATE', moduleName: 'Product Master', userName: 'Rajesh Mehta', userRole: 'Product Manager', changedFields: ['New product created'], reason: 'New product launch', ipAddress: '192.168.1.50', changedAt: '2026-07-08T09:15:00Z' },
    { id: 'mda-003', entityType: 'PRODUCT', entityName: 'Old Recipe Laddu 500g', action: 'ARCHIVE', moduleName: 'Lifecycle', userName: 'Anita Desai', userRole: 'Admin', changedFields: ['lifecycleState: DISCONTINUED → ARCHIVED'], reason: 'Recipe discontinued 6 months ago', ipAddress: '192.168.1.10', changedAt: '2026-01-15T10:00:00Z' },
    { id: 'mda-004', entityType: 'BUSINESS_PARTNER', entityName: 'Tata Consumer Products', action: 'UPDATE', moduleName: 'Business Partner', userName: 'Suresh Patil', userRole: 'Accounts Manager', changedFields: ['creditLimit: ₹4500000 → ₹5000000'], reason: 'Annual credit review', ipAddress: '192.168.1.55', changedAt: '2026-07-07T16:45:00Z' },
    { id: 'mda-005', entityType: 'PRODUCT', entityName: 'Kaju Katli 500g', action: 'MERGE', moduleName: 'Duplicate Manager', userName: 'Priya Sharma', userRole: 'PIM Manager', changedFields: ['Merged "Kaju Katri 500g" into "Kaju Katli 500g"'], reason: 'Duplicate detected and merged', ipAddress: '192.168.1.45', changedAt: '2026-07-06T11:20:00Z' },
    { id: 'mda-006', entityType: 'PRICE_LIST', entityName: 'Diwali Festival Price List', action: 'CREATE', moduleName: 'Commercial Engine', userName: 'Vikram Iyer', userRole: 'Pricing Manager', changedFields: ['New price list with 45 items'], reason: 'Diwali festival preparation', ipAddress: '192.168.1.60', changedAt: '2026-09-01T14:00:00Z' },
    { id: 'mda-007', entityType: 'PRODUCT', entityName: 'Gulab Jamun 1kg', action: 'UPDATE', moduleName: 'PIM', userName: 'Rajesh Mehta', userRole: 'Product Manager', changedFields: ['lifecycleState: ACTIVE → INACTIVE'], reason: 'Summer off-season - temporarily inactive', ipAddress: '192.168.1.50', changedAt: '2026-07-01T08:00:00Z' },
    { id: 'mda-008', entityType: 'BUSINESS_PARTNER', entityName: 'Konkan Cashew Processors', action: 'UPDATE', moduleName: 'Business Partner', userName: 'Suresh Patil', userRole: 'Accounts Manager', changedFields: ['compliance.FSSAI verified'], reason: 'Annual compliance renewal', ipAddress: '192.168.1.55', changedAt: '2026-06-28T15:30:00Z' },
  ],
  qualityMetrics: [
    { entityType: 'PRODUCT', metricName: 'COMPLETENESS', value: 87.5, unit: 'PERCENT', score: 87.5, description: '87.5% of required fields populated across 1248 products' },
    { entityType: 'PRODUCT', metricName: 'ACCURACY', value: 94.2, unit: 'PERCENT', score: 94.2, description: '94.2% of products passed validation rules' },
    { entityType: 'PRODUCT', metricName: 'CONSISTENCY', value: 91.8, unit: 'PERCENT', score: 91.8, description: '91.8% consistent across all channels' },
    { entityType: 'PRODUCT', metricName: 'DUPLICATE_PERCENT', value: 2.3, unit: 'PERCENT', score: 97.7, description: '2.3% duplicate rate (29 duplicates out of 1248)' },
    { entityType: 'PRODUCT', metricName: 'APPROVAL_SLA', value: 88.0, unit: 'PERCENT', score: 88.0, description: '88% of approvals completed within SLA' },
    { entityType: 'PRODUCT', metricName: 'VALIDATION_ERRORS', value: 47, unit: 'COUNT', score: 92.0, description: '47 active validation errors across products' },
    { entityType: 'PRODUCT', metricName: 'INACTIVE_PRODUCTS', value: 124, unit: 'COUNT', score: 90.0, description: '124 inactive products (9.9% of catalog)' },
    { entityType: 'PRODUCT', metricName: 'MISSING_IMAGES', value: 89, unit: 'COUNT', score: 92.9, description: '89 products missing images (7.1%)' },
    { entityType: 'PRODUCT', metricName: 'MISSING_BARCODES', value: 23, unit: 'COUNT', score: 98.2, description: '23 products missing barcodes (1.8%)' },
    { entityType: 'BUSINESS_PARTNER', metricName: 'COMPLETENESS', value: 92.1, unit: 'PERCENT', score: 92.1, description: '92.1% of required fields populated' },
    { entityType: 'BUSINESS_PARTNER', metricName: 'DUPLICATE_PERCENT', value: 1.1, unit: 'PERCENT', score: 98.9, description: '1.1% duplicate rate (15 out of 1412)' },
    { entityType: 'BUSINESS_PARTNER', metricName: 'MISSING_GST', value: 34, unit: 'COUNT', score: 97.6, description: '34 partners missing GST (2.4%)' },
  ],
  changeHistory: [
    { id: 'pch-001', productName: 'Kaju Katli 500g', version: 5, changeType: 'PRICE_CHANGE', changedFields: ['sellingPrice: ₹520 → ₹540', 'mrp: ₹580 → ₹600'], editedByName: 'Priya Sharma', reason: 'Quarterly price review', changedAt: '2026-07-08T14:30:00Z', rollbackable: true },
    { id: 'pch-002', productName: 'Kaju Katli 500g', version: 4, changeType: 'UPDATE', changedFields: ['description updated', 'ingredients clarified'], editedByName: 'Rajesh Mehta', reason: 'Compliance review - ingredient clarity', changedAt: '2026-06-20T11:00:00Z', rollbackable: true },
    { id: 'pch-003', productName: 'Kaju Katli 500g', version: 3, changeType: 'LIFECYCLE_TRANSITION', changedFields: ['lifecycleState: PUBLISHED → ACTIVE'], editedByName: 'System', reason: 'Auto-activation after publish', changedAt: '2026-06-20T10:00:00Z', rollbackable: false },
    { id: 'pch-004', productName: 'Kaju Katli 500g', version: 2, changeType: 'LIFECYCLE_TRANSITION', changedFields: ['lifecycleState: APPROVED → PUBLISHED'], editedByName: 'Anita Desai', reason: 'Approved for publication', changedAt: '2026-06-20T09:30:00Z', rollbackable: false },
    { id: 'pch-005', productName: 'Kaju Katli 500g', version: 1, changeType: 'CREATE', changedFields: ['Initial product creation'], editedByName: 'Rajesh Mehta', reason: 'New product', changedAt: '2026-06-15T08:00:00Z', rollbackable: false },
    { id: 'pch-006', productName: 'Mixed Namkeen 200g', version: 3, changeType: 'CATEGORY_CHANGE', changedFields: ['categoryId: Sweets → Namkeen'], editedByName: 'Priya Sharma', reason: 'Reclassification - product is savory not sweet', changedAt: '2026-07-09T10:00:00Z', rollbackable: true },
  ],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 12 — ENTERPRISE INVENTORY FOUNDATION SEED DATA
// Universal Stock Ledger — every stock change is a transaction
// ═══════════════════════════════════════════════════════════
const INV_DATA = {
  transactionTypes: [
    { code: 'GOODS_RECEIPT', name: 'Goods Receipt', effect: 'INCREASE', affectsAvailable: true, requiresApproval: false, reversible: true },
    { code: 'GOODS_ISSUE', name: 'Goods Issue', effect: 'DECREASE', affectsAvailable: true, requiresApproval: true, reversible: true },
    { code: 'TRANSFER', name: 'Stock Transfer', effect: 'NEUTRAL', affectsAvailable: true, requiresApproval: false, reversible: true },
    { code: 'ADJUSTMENT', name: 'Inventory Adjustment', effect: 'NEUTRAL', affectsAvailable: true, requiresApproval: true, reversible: true },
    { code: 'PRODUCTION_RECEIPT', name: 'Production Receipt', effect: 'INCREASE', affectsAvailable: true, requiresApproval: false, reversible: true },
    { code: 'PRODUCTION_CONSUMPTION', name: 'Production Consumption', effect: 'DECREASE', affectsAvailable: true, requiresApproval: false, reversible: true },
    { code: 'SALES', name: 'Sales Issue', effect: 'DECREASE', affectsAvailable: true, requiresApproval: false, reversible: true },
    { code: 'SALES_RETURN', name: 'Sales Return', effect: 'INCREASE', affectsAvailable: true, requiresApproval: true, reversible: true },
    { code: 'PURCHASE_RETURN', name: 'Purchase Return', effect: 'DECREASE', affectsAvailable: true, requiresApproval: true, reversible: true },
    { code: 'OPENING_STOCK', name: 'Opening Stock', effect: 'INCREASE', affectsAvailable: true, requiresApproval: true, reversible: false },
    { code: 'CYCLE_COUNT', name: 'Cycle Count Adjustment', effect: 'NEUTRAL', affectsAvailable: true, requiresApproval: true, reversible: true },
    { code: 'RESERVATION', name: 'Stock Reservation', effect: 'NEUTRAL', affectsReserved: true, requiresApproval: false, reversible: true },
    { code: 'ALLOCATION', name: 'Stock Allocation', effect: 'NEUTRAL', affectsAllocated: true, requiresApproval: false, reversible: true },
    { code: 'RELEASE', name: 'Reservation Release', effect: 'NEUTRAL', affectsReserved: true, requiresApproval: false, reversible: true },
    { code: 'SCRAP', name: 'Scrap', effect: 'DECREASE', affectsDamaged: true, requiresApproval: true, reversible: false },
    { code: 'DAMAGE', name: 'Damage', effect: 'NEUTRAL', affectsDamaged: true, requiresApproval: true, reversible: true },
    { code: 'EXPIRY', name: 'Expiry Write-off', effect: 'NEUTRAL', affectsExpired: true, requiresApproval: true, reversible: false },
    { code: 'STOCK_TAKE', name: 'Stock Take', effect: 'NEUTRAL', affectsAvailable: true, requiresApproval: true, reversible: true },
  ],
  inventoryStatuses: [
    { code: 'AVAILABLE', name: 'Available', isAvailable: true, isBlocked: false, color: '#10b981', order: 10 },
    { code: 'RESERVED', name: 'Reserved', isAvailable: false, isBlocked: false, color: '#3b82f6', order: 20 },
    { code: 'ALLOCATED', name: 'Allocated', isAvailable: false, isBlocked: false, color: '#8b5cf6', order: 30 },
    { code: 'IN_INSPECTION', name: 'In Inspection', isAvailable: false, isBlocked: true, color: '#f59e0b', order: 40 },
    { code: 'BLOCKED', name: 'Blocked', isAvailable: false, isBlocked: true, color: '#ef4444', order: 50 },
    { code: 'QUARANTINE', name: 'Quarantine', isAvailable: false, isBlocked: true, color: '#dc2626', order: 60 },
    { code: 'DAMAGED', name: 'Damaged', isAvailable: false, isBlocked: true, color: '#f97316', order: 70 },
    { code: 'EXPIRED', name: 'Expired', isAvailable: false, isBlocked: true, color: '#6b7280', order: 80 },
    { code: 'RETURNED', name: 'Returned', isAvailable: false, isBlocked: false, color: '#06b6d4', order: 90 },
    { code: 'TRANSIT', name: 'In Transit', isAvailable: false, isBlocked: false, color: '#a855f7', order: 100 },
  ],
  transactions: [
    { id: 'it-001', number: 'INV-2026-00142', type: 'GOODS_RECEIPT', date: '2026-07-08', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0142', warehouse: 'Mumbai Plant Warehouse', partner: 'Konkan Cashew Processors', status: 'POSTED', lines: 3, totalQty: 380, totalValue: 114000, createdBy: 'Suresh Patil' },
    { id: 'it-002', number: 'INV-2026-00143', type: 'GOODS_RECEIPT', date: '2026-07-08', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0156', warehouse: 'Mumbai Plant Warehouse', partner: 'Sri Balaji Sugar', status: 'POSTED', lines: 1, totalQty: 500, totalValue: 25000, createdBy: 'Suresh Patil' },
    { id: 'it-003', number: 'INV-2026-00144', type: 'PRODUCTION_RECEIPT', date: '2026-07-01', refType: 'PRODUCTION_ORDER', refNumber: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 1, totalQty: 500, totalValue: 175000, createdBy: 'Anita Desai' },
    { id: 'it-004', number: 'INV-2026-00145', type: 'TRANSFER', date: '2026-07-03', refType: 'TRANSFER_ORDER', refNumber: 'TO-2026-0042', warehouse: 'Mumbai Plant Warehouse', toWarehouse: 'Mumbai DC', partner: null, status: 'POSTED', lines: 1, totalQty: 358, totalValue: 125300, createdBy: 'Anita Desai' },
    { id: 'it-005', number: 'INV-2026-00146', type: 'SALES', date: '2026-07-05', refType: 'INVOICE', refNumber: 'INV-2026-00892', warehouse: 'Mumbai DC', partner: 'Tata Consumer Products', status: 'POSTED', lines: 1, totalQty: 100, totalValue: 54000, createdBy: 'Vikram Iyer' },
    { id: 'it-006', number: 'INV-2026-00147', type: 'SALES', date: '2026-07-06', refType: 'INVOICE', refNumber: 'INV-2026-00915', warehouse: 'Mumbai DC', partner: 'Reliance Retail', status: 'POSTED', lines: 1, totalQty: 48, totalValue: 25920, createdBy: 'Vikram Iyer' },
    { id: 'it-007', number: 'INV-2026-00148', type: 'RESERVATION', date: '2026-07-08', refType: 'SALES_ORDER', refNumber: 'SO-2026-0234', warehouse: 'Mumbai DC', partner: 'Infosys', status: 'POSTED', lines: 1, totalQty: 24, totalValue: 12960, createdBy: 'Vikram Iyer' },
    { id: 'it-008', number: 'INV-2026-00149', type: 'DAMAGE', date: '2026-07-07', refType: 'DAMAGE_REPORT', refNumber: 'DMG-2026-0012', warehouse: 'Mumbai DC', partner: null, status: 'PENDING_APPROVAL', lines: 1, totalQty: 8, totalValue: 4320, createdBy: 'Anita Desai' },
    { id: 'it-009', number: 'INV-2026-00150', type: 'ADJUSTMENT', date: '2026-07-09', refType: 'ADJUSTMENT_REQUEST', refNumber: 'ADJ-2026-0034', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'PENDING_APPROVAL', lines: 2, totalQty: 12, totalValue: 6480, createdBy: 'Suresh Patil' },
    { id: 'it-010', number: 'INV-2026-00151', type: 'OPENING_STOCK', date: '2026-01-01', refType: 'OPENING_STOCK', refNumber: 'OS-2026-001', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 12, totalQty: 2400, totalValue: 840000, createdBy: 'System' },
  ],
  stockBalances: [
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', available: 142, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 142, unitCost: 350, totalValue: 49700, expiryDate: '2026-07-31' },
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', available: 186, reserved: 24, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 210, unitCost: 350, totalValue: 73500, expiryDate: '2026-07-31' },
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2606-05', available: 0, reserved: 0, allocated: 0, damaged: 0, expired: 56, inTransit: 0, total: 56, unitCost: 345, totalValue: 19320, expiryDate: '2026-07-25' },
    { product: 'Soan Cake 1kg', warehouse: 'Mumbai Plant Warehouse', batch: 'SC-2606-04', available: 89, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 89, unitCost: 625, totalValue: 55625, expiryDate: '2026-09-15' },
    { product: 'Mixed Namkeen 200g', warehouse: 'Mumbai Plant Warehouse', batch: 'MN-2607-03', available: 1180, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 1180, unitCost: 53, totalValue: 62540, expiryDate: '2026-08-22' },
    { product: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', batch: 'GJ-2607-01', available: 412, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 412, unitCost: 304, totalValue: 125248, expiryDate: '2026-08-05' },
    { product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 35, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 35, unitCost: 850, totalValue: 29750, expiryDate: null },
    { product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 28, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 28, unitCost: 45, totalValue: 1260, expiryDate: null },
    { product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 12, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 12, unitCost: 520, totalValue: 6240, expiryDate: null },
    { product: 'Packaging Boxes', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 2840, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 2840, unitCost: 12, totalValue: 34080, expiryDate: null },
  ],
  ledgerEntries: [
    { id: 'sl-001', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 200, availDelta: 200, postingDate: '2026-07-08T10:15:00Z', isReversal: false },
    { id: 'sl-002', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 150, availDelta: 150, postingDate: '2026-07-08T10:15:00Z', isReversal: false },
    { id: 'sl-003', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 30, availDelta: 30, postingDate: '2026-07-08T10:15:00Z', isReversal: false },
    { id: 'sl-004', txnNumber: 'INV-2026-00143', txnType: 'GOODS_RECEIPT', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 500, availDelta: 500, postingDate: '2026-07-08T10:20:00Z', isReversal: false },
    { id: 'sl-005', txnNumber: 'INV-2026-00144', txnType: 'PRODUCTION_RECEIPT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', qtyDelta: 500, availDelta: 500, postingDate: '2026-07-01T16:00:00Z', isReversal: false },
    { id: 'sl-006', txnNumber: 'INV-2026-00145', txnType: 'TRANSFER', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', qtyDelta: -358, availDelta: -358, postingDate: '2026-07-03T10:00:00Z', isReversal: false },
    { id: 'sl-007', txnNumber: 'INV-2026-00145', txnType: 'TRANSFER', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: 358, availDelta: 358, postingDate: '2026-07-03T10:00:00Z', isReversal: false },
    { id: 'sl-008', txnNumber: 'INV-2026-00146', txnType: 'SALES', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -100, availDelta: -100, postingDate: '2026-07-05T14:00:00Z', isReversal: false },
    { id: 'sl-009', txnNumber: 'INV-2026-00147', txnType: 'SALES', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -48, availDelta: -48, postingDate: '2026-07-06T11:30:00Z', isReversal: false },
    { id: 'sl-010', txnNumber: 'INV-2026-00148', txnType: 'RESERVATION', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -24, availDelta: -24, reservedDelta: 24, postingDate: '2026-07-08T09:00:00Z', isReversal: false },
  ],
  movements: [
    { id: 'sm-001', product: 'Cashew Nuts (Raw)', batch: null, type: 'IN', qty: 200, fromWh: 'Konkan Cashew Processors', toWh: 'Mumbai Plant Warehouse', ref: 'PO-2026-0142', partner: 'Konkan Cashew Processors', performedBy: 'Suresh Patil', reason: 'Purchase receipt', date: '2026-07-08T10:15:00Z' },
    { id: 'sm-002', product: 'Sugar (Raw)', batch: null, type: 'IN', qty: 500, fromWh: 'Sri Balaji Sugar', toWh: 'Mumbai Plant Warehouse', ref: 'PO-2026-0156', partner: 'Sri Balaji Sugar', performedBy: 'Suresh Patil', reason: 'Purchase receipt', date: '2026-07-08T10:20:00Z' },
    { id: 'sm-003', product: 'Kaju Katli 500g', batch: 'KK-2607-01', type: 'IN', qty: 500, fromWh: 'Production Line 1', toWh: 'Mumbai Plant Warehouse', ref: 'MO-2026-0089', partner: null, performedBy: 'Anita Desai', reason: 'Production output', date: '2026-07-01T16:00:00Z' },
    { id: 'sm-004', product: 'Kaju Katli 500g', batch: 'KK-2607-01', type: 'TRANSFER', qty: 358, fromWh: 'Mumbai Plant Warehouse', toWh: 'Mumbai DC', ref: 'TO-2026-0042', partner: null, performedBy: 'Anita Desai', reason: 'Inter-warehouse transfer', date: '2026-07-03T10:00:00Z' },
    { id: 'sm-005', product: 'Kaju Katli 500g', batch: 'KK-2607-01', type: 'OUT', qty: 100, fromWh: 'Mumbai DC', toWh: 'Tata Consumer Products', ref: 'INV-2026-00892', partner: 'Tata Consumer Products', performedBy: 'Vikram Iyer', reason: 'Sales dispatch', date: '2026-07-05T14:00:00Z' },
    { id: 'sm-006', product: 'Kaju Katli 500g', batch: 'KK-2607-01', type: 'OUT', qty: 48, fromWh: 'Mumbai DC', toWh: 'Reliance Retail', ref: 'INV-2026-00915', partner: 'Reliance Retail', performedBy: 'Vikram Iyer', reason: 'Sales dispatch', date: '2026-07-06T11:30:00Z' },
    { id: 'sm-007', product: 'Kaju Katli 500g', batch: 'KK-2607-01', type: 'RESERVATION', qty: 24, fromWh: 'Mumbai DC', toWh: 'Mumbai DC (Reserved)', ref: 'SO-2026-0234', partner: 'Infosys', performedBy: 'Vikram Iyer', reason: 'Customer order reservation', date: '2026-07-08T09:00:00Z' },
  ],
  journalEntries: [
    { id: 'ij-001', entryNumber: 'IJ-2026-00284', txnNumber: 'INV-2026-00142', entryType: 'DEBIT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qty: 200, unitCost: 850, totalValue: 170000, account: 'RAW_MATERIAL', offsetAccount: 'GRNI', ref: 'PO-2026-0142', postingDate: '2026-07-08T10:15:00Z', isReversal: false },
    { id: 'ij-002', entryNumber: 'IJ-2026-00285', txnNumber: 'INV-2026-00142', entryType: 'CREDIT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qty: 200, unitCost: 850, totalValue: 170000, account: 'GRNI', offsetAccount: 'RAW_MATERIAL', ref: 'PO-2026-0142', postingDate: '2026-07-08T10:15:00Z', isReversal: false },
    { id: 'ij-003', entryNumber: 'IJ-2026-00286', txnNumber: 'INV-2026-00144', entryType: 'DEBIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', qty: 500, unitCost: 350, totalValue: 175000, account: 'FINISHED_GOODS', offsetAccount: 'WIP', ref: 'MO-2026-0089', postingDate: '2026-07-01T16:00:00Z', isReversal: false },
    { id: 'ij-004', entryNumber: 'IJ-2026-00287', txnNumber: 'INV-2026-00144', entryType: 'CREDIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', qty: 500, unitCost: 350, totalValue: 175000, account: 'WIP', offsetAccount: 'FINISHED_GOODS', ref: 'MO-2026-0089', postingDate: '2026-07-01T16:00:00Z', isReversal: false },
    { id: 'ij-005', entryNumber: 'IJ-2026-00288', txnNumber: 'INV-2026-00146', entryType: 'CREDIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', qty: 100, unitCost: 540, totalValue: 54000, account: 'FINISHED_GOODS', offsetAccount: 'COGS', ref: 'INV-2026-00892', postingDate: '2026-07-05T14:00:00Z', isReversal: false },
    { id: 'ij-006', entryNumber: 'IJ-2026-00289', txnNumber: 'INV-2026-00146', entryType: 'DEBIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', qty: 100, unitCost: 540, totalValue: 54000, account: 'COGS', offsetAccount: 'FINISHED_GOODS', ref: 'INV-2026-00892', postingDate: '2026-07-05T14:00:00Z', isReversal: false },
  ],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 13 — GOODS RECEIPT & PUTAWAY ENGINE SEED DATA
// First real inventory operation: stock physically enters SUOP
// ═══════════════════════════════════════════════════════════
const GRN_DATA = {
  goodsReceipts: [
    { id: 'gr-001', grnNumber: 'GRN-2026-00142', receiptType: 'PURCHASE_RECEIPT', date: '2026-07-08', supplier: 'Konkan Cashew Processors', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0142', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-12-AB-4521', driver: 'Ramesh Patil', gateEntry: 'GE-2026-0089', status: 'COMPLETED', qualityHold: true, qualityStatus: 'APPROVED', lines: 3, orderedQty: 380, receivedQty: 380, acceptedQty: 380, rejectedQty: 0, totalValue: 114000, inventoryPosted: true, putawayCompleted: true, receivedBy: 'Suresh Patil' },
    { id: 'gr-002', grnNumber: 'GRN-2026-00143', receiptType: 'PURCHASE_RECEIPT', date: '2026-07-08', supplier: 'Sri Balaji Sugar', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0156', warehouse: 'Mumbai Plant Warehouse', vehicle: 'AP-09-CD-8832', driver: 'Lakshmi Naidu', gateEntry: 'GE-2026-0090', status: 'COMPLETED', qualityHold: false, qualityStatus: 'APPROVED', lines: 1, orderedQty: 500, receivedQty: 500, acceptedQty: 500, rejectedQty: 0, totalValue: 25000, inventoryPosted: true, putawayCompleted: true, receivedBy: 'Suresh Patil' },
    { id: 'gr-003', grnNumber: 'GRN-2026-00144', receiptType: 'MANUFACTURING_RECEIPT', date: '2026-07-01', supplier: null, refType: 'PRODUCTION_ORDER', refNumber: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', vehicle: null, driver: null, gateEntry: null, status: 'COMPLETED', qualityHold: true, qualityStatus: 'APPROVED', lines: 1, orderedQty: 500, receivedQty: 500, acceptedQty: 500, rejectedQty: 0, totalValue: 175000, inventoryPosted: true, putawayCompleted: true, receivedBy: 'Anita Desai' },
    { id: 'gr-004', grnNumber: 'GRN-2026-00145', receiptType: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Amul', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0178', warehouse: 'Mumbai Plant Warehouse', vehicle: 'GJ-01-EF-1192', driver: 'Bharat Patel', gateEntry: 'GE-2026-0091', status: 'APPROVED', qualityHold: true, qualityStatus: 'INSPECTION', lines: 2, orderedQty: 100, receivedQty: 98, acceptedQty: 0, rejectedQty: 0, totalValue: 52000, inventoryPosted: false, putawayCompleted: false, receivedBy: 'Suresh Patil', qualityNotes: 'Ghee sample sent for lab test - awaiting results' },
    { id: 'gr-005', grnNumber: 'GRN-2026-00146', receiptType: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Mumbai Packaging Solutions', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0203', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-04-GH-7745', driver: 'Sandeep Kumar', gateEntry: 'GE-2026-0092', status: 'PUTAWAY_IN_PROGRESS', qualityHold: false, qualityStatus: 'APPROVED', lines: 1, orderedQty: 5000, receivedQty: 5000, acceptedQty: 5000, rejectedQty: 0, totalValue: 60000, inventoryPosted: true, putawayCompleted: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-006', grnNumber: 'GRN-2026-00147', receiptType: 'SALES_RETURN', date: '2026-07-07', supplier: null, refType: 'INVOICE', refNumber: 'INV-2026-00789', warehouse: 'Mumbai DC', vehicle: null, driver: null, gateEntry: null, status: 'APPROVED', qualityHold: true, qualityStatus: 'PENDING', lines: 1, orderedQty: 0, receivedQty: 24, acceptedQty: 0, rejectedQty: 0, totalValue: 12960, inventoryPosted: false, putawayCompleted: false, receivedBy: 'Vikram Iyer', qualityNotes: 'Customer return - quality check required before restocking' },
    { id: 'gr-007', grnNumber: 'GRN-2026-00148', receiptType: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Konkan Cashew Processors', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0210', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-12-AB-4521', driver: 'Ramesh Patil', gateEntry: 'GE-2026-0093', status: 'PENDING_APPROVAL', qualityHold: true, qualityStatus: 'PENDING', lines: 2, orderedQty: 300, receivedQty: 295, acceptedQty: 0, rejectedQty: 5, totalValue: 250750, inventoryPosted: false, putawayCompleted: false, receivedBy: 'Suresh Patil', qualityNotes: '5 units damaged in transit - rejected at receiving' },
    { id: 'gr-008', grnNumber: 'GRN-2026-00149', receiptType: 'OPENING_STOCK', date: '2026-01-01', supplier: null, refType: 'OPENING_STOCK', refNumber: 'OS-2026-001', warehouse: 'Mumbai Plant Warehouse', vehicle: null, driver: null, gateEntry: null, status: 'COMPLETED', qualityHold: false, qualityStatus: 'APPROVED', lines: 12, orderedQty: 0, receivedQty: 2400, acceptedQty: 2400, rejectedQty: 0, totalValue: 840000, inventoryPosted: true, putawayCompleted: true, receivedBy: 'System' },
  ],
  putawayRules: [
    { code: 'PA-RAW-FIFO', name: 'Raw Materials → FIFO Zone A', strategy: 'FIFO', productType: 'RAW_MATERIAL', targetZone: 'Zone A - Raw Materials', tempZone: 'AMBIENT', priority: 50, status: 'ACTIVE' },
    { code: 'PA-FG-FEFO', name: 'Finished Goods → FEFO Cold Storage', strategy: 'FEFO', productType: 'FINISHED_GOOD', targetZone: 'Zone C - Cold Storage', tempZone: 'REFRIGERATED', priority: 30, status: 'ACTIVE' },
    { code: 'PA-PKG-ZONE', name: 'Packaging → Zone B Bulk', strategy: 'ZONE', productType: 'PACKAGING', targetZone: 'Zone B - Packaging Bulk', tempZone: 'AMBIENT', priority: 100, status: 'ACTIVE' },
    { code: 'PA-ABC-HIGH', name: 'High-Value Items → Secure Zone', strategy: 'ABC', productType: 'FINISHED_GOOD', targetZone: 'Zone D - Secure', tempZone: 'AMBIENT', priority: 20, status: 'ACTIVE' },
    { code: 'PA-FROZEN', name: 'Frozen Items → Freezer Zone', strategy: 'TEMPERATURE', productType: 'FINISHED_GOOD', targetZone: 'Zone E - Freezer', tempZone: 'FROZEN', priority: 10, status: 'ACTIVE' },
  ],
  putawayTasks: [
    { id: 'pt-001', taskNumber: 'PT-2026-00142', grnNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw)', batch: null, qty: 200, from: 'Receiving Dock 1', to: 'Zone A - Rack A1, Bin 03', zone: 'Zone A - Raw Materials', strategy: 'FIFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 11:30' },
    { id: 'pt-002', taskNumber: 'PT-2026-00143', grnNumber: 'GRN-2026-00142', product: 'Sugar (Raw)', batch: null, qty: 150, from: 'Receiving Dock 1', to: 'Zone A - Rack A2, Bin 01', zone: 'Zone A - Raw Materials', strategy: 'FIFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 11:45' },
    { id: 'pt-003', taskNumber: 'PT-2026-00144', grnNumber: 'GRN-2026-00142', product: 'Ghee (Raw)', batch: null, qty: 30, from: 'Receiving Dock 1', to: 'Zone C - Cold Storage, Rack C1', zone: 'Zone C - Cold Storage', strategy: 'FEFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 12:00' },
    { id: 'pt-004', taskNumber: 'PT-2026-00145', grnNumber: 'GRN-2026-00144', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 500, from: 'Production Line 1', to: 'Zone C - Cold Storage, Rack C2', zone: 'Zone C - Cold Storage', strategy: 'FEFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-01 17:00' },
    { id: 'pt-005', taskNumber: 'PT-2026-00146', grnNumber: 'GRN-2026-00146', product: 'Packaging Boxes', batch: null, qty: 5000, from: 'Receiving Dock 2', to: 'Zone B - Rack B1, Bin 01-05', zone: 'Zone B - Packaging Bulk', strategy: 'ZONE', status: 'IN_PROGRESS', assignedTo: 'Sandeep Kumar', completedAt: null },
    { id: 'pt-006', taskNumber: 'PT-2026-00147', grnNumber: 'GRN-2026-00145', product: 'Ghee (Raw)', batch: null, qty: 98, from: 'Receiving Dock 1', to: 'PENDING - Quality Hold', zone: null, strategy: 'FEFO', status: 'PENDING', assignedTo: null, completedAt: null },
  ],
  qualityHolds: [
    { id: 'qh-001', holdNumber: 'QH-2026-0012', grnNumber: 'GRN-2026-00145', product: 'Ghee (Raw)', batch: null, qtyHeld: 98, reason: 'QUALITY_CHECK', inspectionType: 'LAB_TEST', result: 'PENDING', status: 'ACTIVE', resolution: 'PENDING', createdBy: 'Suresh Patil', notes: 'Sample sent to external lab for adulteration test' },
    { id: 'qh-002', holdNumber: 'QH-2026-0013', grnNumber: 'GRN-2026-00147', product: 'Customer Return Kaju Katli', batch: 'KK-2606-05', qtyHeld: 24, reason: 'SUPPLIER_ISSUE', inspectionType: 'VISUAL', result: 'PENDING', status: 'ACTIVE', resolution: 'PENDING', createdBy: 'Vikram Iyer', notes: 'Customer returned - taste deviation complaint. Awaiting investigation.' },
    { id: 'qh-003', holdNumber: 'QH-2026-0011', grnNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw)', batch: null, qtyHeld: 200, reason: 'QUALITY_CHECK', inspectionType: 'SAMPLE_TEST', result: 'PASSED', status: 'RESOLVED', resolution: 'RELEASED', releasedQty: 200, rejectedQty: 0, createdBy: 'Suresh Patil', resolvedBy: 'Anita Desai', notes: 'Sample tested - quality approved. Released for production.' },
    { id: 'qh-004', holdNumber: 'QH-2026-0010', grnNumber: 'GRN-2026-00144', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qtyHeld: 500, reason: 'QUALITY_CHECK', inspectionType: 'VISUAL', result: 'PASSED', status: 'RESOLVED', resolution: 'RELEASED', releasedQty: 500, rejectedQty: 0, createdBy: 'Anita Desai', resolvedBy: 'Anita Desai', notes: 'Production batch quality check passed. Grade A.' },
    { id: 'qh-005', holdNumber: 'QH-2026-0014', grnNumber: 'GRN-2026-00147', product: 'Cashew Nuts (Raw)', batch: null, qtyHeld: 5, reason: 'DAMAGE_SUSPECTED', inspectionType: 'VISUAL', result: 'FAILED', status: 'RESOLVED', resolution: 'REJECTED', releasedQty: 0, rejectedQty: 5, createdBy: 'Suresh Patil', resolvedBy: 'Anita Desai', notes: '5 units damaged in transit - packaging crushed. Rejected and scrapped.' },
  ],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 14 — STOCK ISSUE & OUTBOUND ENGINE SEED DATA
// Every movement where inventory leaves stock
// ═══════════════════════════════════════════════════════════
const SI_DATA = {
  stockIssues: [
    { id: 'si-001', issueNumber: 'SI-2026-00234', issueType: 'PRODUCTION_ISSUE', date: '2026-07-01', refType: 'PRODUCTION_ORDER', refNumber: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', destination: 'Production Line 1', status: 'ISSUED', lines: 3, requestedQty: 180, issuedQty: 180, totalValue: 153000, inventoryPosted: true, pickingCompleted: true, requestedBy: 'Anita Desai', approvedBy: 'Anita Desai' },
    { id: 'si-002', issueNumber: 'SI-2026-00235', issueType: 'SALES_ISSUE', date: '2026-07-05', refType: 'SALES_INVOICE', refNumber: 'INV-2026-00892', warehouse: 'Mumbai DC', destination: 'Tata Consumer Products', status: 'ISSUED', lines: 1, requestedQty: 100, issuedQty: 100, totalValue: 54000, inventoryPosted: true, pickingCompleted: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-003', issueNumber: 'SI-2026-00236', issueType: 'SALES_ISSUE', date: '2026-07-06', refType: 'SALES_INVOICE', refNumber: 'INV-2026-00915', warehouse: 'Mumbai DC', destination: 'Reliance Retail', status: 'ISSUED', lines: 1, requestedQty: 48, issuedQty: 48, totalValue: 25920, inventoryPosted: true, pickingCompleted: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-004', issueNumber: 'SI-2026-00237', issueType: 'PRODUCTION_ISSUE', date: '2026-07-09', refType: 'PRODUCTION_ORDER', refNumber: 'MO-2026-0095', warehouse: 'Mumbai Plant Warehouse', destination: 'Production Line 2', status: 'PICKING_IN_PROGRESS', lines: 4, requestedQty: 250, issuedQty: 0, totalValue: 0, inventoryPosted: false, pickingCompleted: false, requestedBy: 'Anita Desai', approvedBy: 'Anita Desai' },
    { id: 'si-005', issueNumber: 'SI-2026-00238', issueType: 'KITCHEN_ISSUE', date: '2026-07-09', refType: 'MATERIAL_REQUISITION', refNumber: 'MR-2026-0042', warehouse: 'Mumbai Plant Warehouse', destination: 'Restaurant Kitchen', status: 'PENDING_APPROVAL', lines: 5, requestedQty: 35, issuedQty: 0, totalValue: 0, inventoryPosted: false, pickingCompleted: false, requestedBy: 'Chef Rajesh', approvedBy: null },
    { id: 'si-006', issueNumber: 'SI-2026-00239', issueType: 'INTERNAL_CONSUMPTION', date: '2026-07-08', refType: 'MATERIAL_REQUISITION', refNumber: 'MR-2026-0039', warehouse: 'Mumbai Plant Warehouse', destination: 'Maintenance Dept', status: 'ISSUED', lines: 2, requestedQty: 12, issuedQty: 12, totalValue: 3400, inventoryPosted: true, pickingCompleted: true, requestedBy: 'Maintenance Team', approvedBy: 'Anita Desai' },
    { id: 'si-007', issueNumber: 'SI-2026-00240', issueType: 'SAMPLE_ISSUE', date: '2026-07-07', refType: 'MATERIAL_REQUISITION', refNumber: 'MR-2026-0036', warehouse: 'Mumbai DC', destination: 'Sales Team (Trade Show)', status: 'ISSUED', lines: 3, requestedQty: 15, issuedQty: 15, totalValue: 8100, inventoryPosted: true, pickingCompleted: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-008', issueNumber: 'SI-2026-00241', issueType: 'RETURN_TO_SUPPLIER', date: '2026-07-06', refType: 'PURCHASE_RETURN', refNumber: 'PR-2026-0012', warehouse: 'Mumbai Plant Warehouse', destination: 'Sri Balaji Sugar', status: 'ISSUED', lines: 1, requestedQty: 50, issuedQty: 50, totalValue: 2250, inventoryPosted: true, pickingCompleted: true, requestedBy: 'Suresh Patil', approvedBy: 'Anita Desai' },
  ],
  pickingTasks: [
    { id: 'pk-001', taskNumber: 'PK-2026-00234', issueNumber: 'SI-2026-00234', strategy: 'FEFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'COMPLETED', totalLines: 3, pickedLines: 3, totalQty: 180, pickedQty: 180, assignedTo: 'Ramesh Yadav', duration: 18, completedAt: '2026-07-01 08:18' },
    { id: 'pk-002', taskNumber: 'PK-2026-00235', issueNumber: 'SI-2026-00235', strategy: 'FEFO', warehouse: 'Mumbai DC', zone: 'Zone C - Cold Storage', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 100, pickedQty: 100, assignedTo: 'Ramesh Yadav', duration: 8, completedAt: '2026-07-05 13:50' },
    { id: 'pk-003', taskNumber: 'PK-2026-00236', issueNumber: 'SI-2026-00236', strategy: 'FEFO', warehouse: 'Mumbai DC', zone: 'Zone C - Cold Storage', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 48, pickedQty: 48, assignedTo: 'Ramesh Yadav', duration: 6, completedAt: '2026-07-06 11:20' },
    { id: 'pk-004', taskNumber: 'PK-2026-00237', issueNumber: 'SI-2026-00237', strategy: 'FIFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'IN_PROGRESS', totalLines: 4, pickedLines: 2, totalQty: 250, pickedQty: 120, assignedTo: 'Sandeep Kumar', duration: null, completedAt: null },
    { id: 'pk-005', taskNumber: 'PK-2026-00240', issueNumber: 'SI-2026-00240', strategy: 'FEFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 50, pickedQty: 50, assignedTo: 'Ramesh Yadav', duration: 5, completedAt: '2026-07-06 15:30' },
  ],
  scrapRecords: [
    { id: 'scrap-001', scrapNumber: 'SCRAP-2026-0012', scrapType: 'PRODUCTION_SCRAP', date: '2026-07-01', product: 'Kaju Katli 500g', batch: 'KK-2607-01', warehouse: 'Mumbai Plant Warehouse', qty: 8, value: 2800, reason: 'Shape deformation during molding', disposal: 'DESTROYED', status: 'POSTED', createdBy: 'Anita Desai' },
    { id: 'scrap-002', scrapNumber: 'SCRAP-2026-0013', scrapType: 'EXPIRED_PRODUCTS', date: '2026-07-08', product: 'Kaju Katli 500g', batch: 'KK-2606-05', warehouse: 'Mumbai Plant Warehouse', qty: 56, value: 19320, reason: 'Past expiry date - recall batch', disposal: 'DESTROYED', status: 'PENDING_APPROVAL', createdBy: 'Anita Desai' },
    { id: 'scrap-003', scrapNumber: 'SCRAP-2026-0014', scrapType: 'WAREHOUSE_DAMAGE', date: '2026-07-07', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', warehouse: 'Mumbai DC', qty: 12, value: 636, reason: 'Rat damage in storage bin B3', disposal: 'DESTROYED', status: 'POSTED', createdBy: 'Ramesh Yadav' },
    { id: 'scrap-004', scrapNumber: 'SCRAP-2026-0015', scrapType: 'QUALITY_REJECTION', date: '2026-07-09', product: 'Cashew Nuts (Raw)', batch: null, warehouse: 'Mumbai Plant Warehouse', qty: 5, value: 4250, reason: 'Damaged in transit - packaging crushed', disposal: 'RETURNED_TO_SUPPLIER', status: 'APPROVED', createdBy: 'Suresh Patil' },
    { id: 'scrap-005', scrapNumber: 'SCRAP-2026-0016', scrapType: 'PRODUCTION_SCRAP', date: '2026-07-05', product: 'Soan Cake 1kg', batch: 'SC-2606-04', warehouse: 'Mumbai Plant Warehouse', qty: 3, value: 1875, reason: 'Sugar crystallization - quality fail', disposal: 'RECYCLED', status: 'POSTED', createdBy: 'Anita Desai' },
  ],
  damageRecords: [
    { id: 'dmg-001', damageNumber: 'DMG-2026-0012', damageType: 'TRANSPORT_DAMAGE', severity: 'MODERATE', date: '2026-07-09', product: 'Cashew Nuts (Raw)', batch: null, warehouse: 'Mumbai Plant Warehouse', qty: 5, value: 4250, reason: 'Packaging crushed during transit', disposition: 'RETURN_TO_SUPPLIER', status: 'POSTED', insuranceClaim: true, claimAmount: 4250, reportedBy: 'Suresh Patil' },
    { id: 'dmg-002', damageNumber: 'DMG-2026-0013', damageType: 'STORAGE_DAMAGE', severity: 'MINOR', date: '2026-07-07', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', warehouse: 'Mumbai DC', qty: 12, value: 636, reason: 'Rat damage in storage bin B3', disposition: 'SCRAP', status: 'POSTED', insuranceClaim: false, reportedBy: 'Ramesh Yadav' },
    { id: 'dmg-003', damageNumber: 'DMG-2026-0014', damageType: 'HANDLING_DAMAGE', severity: 'MINOR', date: '2026-07-08', product: 'Kaju Katli 500g', batch: 'KK-2607-01', warehouse: 'Mumbai DC', qty: 4, value: 2160, reason: 'Box dropped during putaway', disposition: 'REPACK', status: 'APPROVED', insuranceClaim: false, reportedBy: 'Sandeep Kumar' },
    { id: 'dmg-004', damageNumber: 'DMG-2026-0015', damageType: 'CUSTOMER_RETURN_DAMAGE', severity: 'MODERATE', date: '2026-07-07', product: 'Kaju Katli 500g', batch: 'KK-2606-05', warehouse: 'Mumbai DC', qty: 24, value: 12960, reason: 'Customer returned - taste deviation', disposition: 'PENDING_REVIEW', status: 'UNDER_REVIEW', insuranceClaim: false, reportedBy: 'Vikram Iyer' },
  ],
}

// ═══════════════════════════════════════════════════════════
// SPRINT 15 — STOCK TRANSFER & IN-TRANSIT ENGINE SEED DATA
// ═══════════════════════════════════════════════════════════
const ST_DATA = {
  transfers: [
    { id: 'st-001', transferNumber: 'ST-2026-0042', transferType: 'PLANT_TO_WAREHOUSE', date: '2026-07-03', sourceWh: 'Mumbai Plant Warehouse', destWh: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', status: 'COMPLETED', lines: 1, requested: 358, dispatched: 358, received: 358, value: 125300, requestedBy: 'Anita Desai', eta: '2026-07-03', actualArrival: '2026-07-03' },
    { id: 'st-002', transferNumber: 'ST-2026-0043', transferType: 'WAREHOUSE_TO_STORE', date: '2026-07-06', sourceWh: 'Mumbai DC', destWh: 'Mumbai Retail Store 01', vehicle: 'MH-04-TR-1192', driver: 'Sandeep Kumar', carrier: 'Blue Dart Express', status: 'COMPLETED', lines: 2, requested: 72, dispatched: 72, received: 72, value: 38880, requestedBy: 'Vikram Iyer', eta: '2026-07-06', actualArrival: '2026-07-06' },
    { id: 'st-003', transferNumber: 'ST-2026-0044', transferType: 'WAREHOUSE_TO_WAREHOUSE', date: '2026-07-08', sourceWh: 'Mumbai DC', destWh: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', status: 'IN_TRANSIT', lines: 3, requested: 200, dispatched: 200, received: 0, value: 70000, requestedBy: 'Anita Desai', eta: '2026-07-09', actualArrival: null },
    { id: 'st-004', transferNumber: 'ST-2026-0045', transferType: 'BRANCH_TO_BRANCH', date: '2026-07-09', sourceWh: 'Mumbai DC', destWh: 'Pune Warehouse', vehicle: null, driver: null, carrier: null, status: 'APPROVED', lines: 2, requested: 150, dispatched: 0, received: 0, value: 52500, requestedBy: 'Suresh Patil', eta: null, actualArrival: null },
    { id: 'st-005', transferNumber: 'ST-2026-0046', transferType: 'WAREHOUSE_TO_RESTAURANT', date: '2026-07-09', sourceWh: 'Mumbai Plant Warehouse', destWh: 'Sudhamrit Restaurant Mumbai', vehicle: null, driver: null, carrier: null, status: 'SUBMITTED', lines: 5, requested: 45, dispatched: 0, received: 0, value: 0, requestedBy: 'Chef Rajesh', eta: null, actualArrival: null },
    { id: 'st-006', transferNumber: 'ST-2026-0047', transferType: 'RETURN_TRANSFER', date: '2026-07-07', sourceWh: 'Mumbai Retail Store 01', destWh: 'Mumbai DC', vehicle: 'MH-04-TR-1192', driver: 'Sandeep Kumar', carrier: 'Blue Dart Express', status: 'PARTIALLY_RECEIVED', lines: 1, requested: 24, dispatched: 24, received: 22, value: 12960, requestedBy: 'Vikram Iyer', eta: '2026-07-07', actualArrival: '2026-07-07' },
    { id: 'st-007', transferNumber: 'ST-2026-0048', transferType: 'COLD_STORAGE_TRANSFER', date: '2026-07-09', sourceWh: 'Mumbai Plant Warehouse', destWh: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', status: 'DISPATCHED', lines: 2, requested: 100, dispatched: 100, received: 0, value: 35000, requestedBy: 'Anita Desai', eta: '2026-07-09', actualArrival: null },
    { id: 'st-008', transferNumber: 'ST-2026-0049', transferType: 'PLANT_TO_STORE', date: '2026-07-05', sourceWh: 'Mumbai Plant Warehouse', destWh: 'Mumbai Retail Store 01', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', status: 'COMPLETED', lines: 1, requested: 48, dispatched: 48, received: 48, value: 25920, requestedBy: 'Vikram Iyer', eta: '2026-07-05', actualArrival: '2026-07-05' },
  ],
  inTransit: [
    { id: 'iit-001', transferNumber: 'ST-2026-0044', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 100, sourceWh: 'Mumbai DC', destWh: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', dispatchedAt: '2026-07-08T14:00:00Z', eta: '2026-07-09T12:00:00Z', status: 'IN_TRANSIT', value: 35000 },
    { id: 'iit-002', transferNumber: 'ST-2026-0044', product: 'Soan Cake 1kg', batch: 'SC-2606-04', qty: 50, sourceWh: 'Mumbai DC', destWh: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', dispatchedAt: '2026-07-08T14:00:00Z', eta: '2026-07-09T12:00:00Z', status: 'IN_TRANSIT', value: 31250 },
    { id: 'iit-003', transferNumber: 'ST-2026-0044', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 50, sourceWh: 'Mumbai DC', destWh: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', dispatchedAt: '2026-07-08T14:00:00Z', eta: '2026-07-09T12:00:00Z', status: 'IN_TRANSIT', value: 2650 },
    { id: 'iit-004', transferNumber: 'ST-2026-0047', product: 'Gulab Jamun 1kg', batch: 'GJ-2607-01', qty: 60, sourceWh: 'Mumbai Plant Warehouse', destWh: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', dispatchedAt: '2026-07-09T08:00:00Z', eta: '2026-07-09T10:00:00Z', status: 'IN_TRANSIT', value: 18240 },
    { id: 'iit-005', transferNumber: 'ST-2026-0047', product: 'Kaju Katli 250g', batch: null, qty: 40, sourceWh: 'Mumbai Plant Warehouse', destWh: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House Logistics', dispatchedAt: '2026-07-09T08:00:00Z', eta: '2026-07-09T10:00:00Z', status: 'IN_TRANSIT', value: 16800 },
  ],
  binTransfers: [
    { id: 'bt-001', binTransferNumber: 'BT-2026-0023', date: '2026-07-08', warehouse: 'Mumbai Plant Warehouse', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 100, fromZone: 'Receiving Area', fromBin: 'RCV-01', toZone: 'Zone C - Cold Storage', toBin: 'C2-03', reason: 'REORGANIZATION', status: 'COMPLETED', createdBy: 'Ramesh Yadav' },
    { id: 'bt-002', binTransferNumber: 'BT-2026-0024', date: '2026-07-08', warehouse: 'Mumbai Plant Warehouse', product: 'Sugar (Raw)', batch: null, qty: 50, fromZone: 'Zone A - Raw Materials', fromBin: 'A2-01', toZone: 'Zone A - Raw Materials', toBin: 'A2-03', reason: 'CONSOLIDATION', status: 'COMPLETED', createdBy: 'Ramesh Yadav' },
    { id: 'bt-003', binTransferNumber: 'BT-2026-0025', date: '2026-07-09', warehouse: 'Mumbai DC', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 200, fromZone: 'Zone B - General', fromBin: 'B1-02', toZone: 'Zone B - General', toBin: 'B3-05', reason: 'CAPACITY_OPTIMIZATION', status: 'PENDING', createdBy: 'Sandeep Kumar' },
    { id: 'bt-004', binTransferNumber: 'BT-2026-0026', date: '2026-07-09', warehouse: 'Mumbai Plant Warehouse', product: 'Ghee (Raw)', batch: null, qty: 10, fromZone: 'Zone C - Cold Storage', fromBin: 'C1-01', toZone: 'Zone C - Cold Storage', toBin: 'C1-04', reason: 'TEMP_CONTROL', status: 'PENDING', createdBy: 'Suresh Patil' },
  ],
}

// ─── Sprint 16: Adjustment & Reconciliation Seed Data ────
const ADJ_DATA = {
  adjustments: [
    { id: 'adj-001', adjustmentNumber: 'ADJ-2026-0101', adjustmentDate: '2026-07-09', adjustmentType: 'STOCK_GAIN', warehouseName: 'Mumbai DC', reason: 'FOUND', status: 'POSTED', totalLines: 2, totalAdjustmentQty: 18, totalAdjustmentValue: 5400, requestedByName: 'Ramesh Yadav', approvedByName: 'Anita Desai', approvedAt: '2026-07-09', postedAt: '2026-07-09', inventoryPosted: true, financePosted: true, isWriteOff: false, photoAttached: true, remarks: 'Stock found during cycle count in Zone B — verified against last count.' },
    { id: 'adj-002', adjustmentNumber: 'ADJ-2026-0102', adjustmentDate: '2026-07-09', adjustmentType: 'STOCK_LOSS', warehouseName: 'Mumbai Plant Warehouse', reason: 'COUNTING_ERROR', status: 'PENDING_APPROVAL', totalLines: 1, totalAdjustmentQty: -6, totalAdjustmentValue: -1800, requestedByName: 'Sandeep Kumar', approvedByName: null, approvedAt: null, postedAt: null, inventoryPosted: false, financePosted: false, isWriteOff: false, photoAttached: false, remarks: 'Physical count short by 6 units during cycle count.' },
    { id: 'adj-003', adjustmentNumber: 'ADJ-2026-0103', adjustmentDate: '2026-07-08', adjustmentType: 'DAMAGE', warehouseName: 'Mumbai DC', reason: 'DAMAGE', status: 'APPROVED', totalLines: 1, totalAdjustmentQty: -12, totalAdjustmentValue: -7200, requestedByName: 'Suresh Patil', approvedByName: 'Anita Desai', approvedAt: '2026-07-08', postedAt: null, inventoryPosted: false, financePosted: false, isWriteOff: true, photoAttached: true, remarks: '12 units crushed during forklift handling — damage report DR-2026-0901 attached.' },
    { id: 'adj-004', adjustmentNumber: 'ADJ-2026-0104', adjustmentDate: '2026-07-07', adjustmentType: 'EXPIRY', warehouseName: 'Mumbai Retail Store 01', reason: 'EXPIRY', status: 'POSTED', totalLines: 1, totalAdjustmentQty: -24, totalAdjustmentValue: -4800, requestedByName: 'Vikram Iyer', approvedByName: 'Anita Desai', approvedAt: '2026-07-07', postedAt: '2026-07-07', inventoryPosted: true, financePosted: true, isWriteOff: true, photoAttached: true, remarks: 'Expired batch disposed via expiry adjustment EXA-2026-001.' },
    { id: 'adj-005', adjustmentNumber: 'ADJ-2026-0105', adjustmentDate: '2026-07-09', adjustmentType: 'SHRINKAGE', warehouseName: 'Mumbai Retail Store 01', reason: 'LOST', status: 'SUBMITTED', totalLines: 3, totalAdjustmentQty: -9, totalAdjustmentValue: -2700, requestedByName: 'Vikram Iyer', approvedByName: null, approvedAt: null, postedAt: null, inventoryPosted: false, financePosted: false, isWriteOff: false, photoAttached: false, remarks: 'Retail shrinkage from monthly stock-take — 3 SKUs short.' },
    { id: 'adj-006', adjustmentNumber: 'ADJ-2026-0106', adjustmentDate: '2026-07-06', adjustmentType: 'THEFT', warehouseName: 'Mumbai DC', reason: 'THEFT', status: 'REJECTED', totalLines: 1, totalAdjustmentQty: -4, totalAdjustmentValue: -16000, requestedByName: 'Suresh Patil', approvedByName: 'Anita Desai', approvedAt: '2026-07-06', postedAt: null, inventoryPosted: false, financePosted: false, isWriteOff: false, photoAttached: true, remarks: 'Suspected theft of premium SKU — police FIR filed. Rejected pending investigation report.' },
    { id: 'adj-007', adjustmentNumber: 'ADJ-2026-0107', adjustmentDate: '2026-07-09', adjustmentType: 'PRODUCTION_VARIANCE', warehouseName: 'Mumbai Plant Warehouse', reason: 'PRODUCTION_LOSS', status: 'PENDING_APPROVAL', totalLines: 2, totalAdjustmentQty: -15, totalAdjustmentValue: -9750, requestedByName: 'Chef Rajesh', approvedByName: null, approvedAt: null, postedAt: null, inventoryPosted: false, financePosted: false, isWriteOff: false, photoAttached: true, remarks: 'Production variance: actual yield 4% below BOM standard for Kaju Katli batch KK-2607-08.' },
    { id: 'adj-008', adjustmentNumber: 'ADJ-2026-0108', adjustmentDate: '2026-07-09', adjustmentType: 'BARCODE_CORRECTION', warehouseName: 'Mumbai DC', reason: 'WRONG_ENTRY', status: 'APPROVED', totalLines: 1, totalAdjustmentQty: 0, totalAdjustmentValue: 0, requestedByName: 'Sandeep Kumar', approvedByName: 'Anita Desai', approvedAt: '2026-07-09', postedAt: null, inventoryPosted: false, financePosted: false, isWriteOff: false, photoAttached: false, remarks: 'Wrong barcode scanned during putaway — corrected product mapping (no qty impact).' },
  ],
  reasons: [
    { id: 'rsn-001', reasonCode: 'DAMAGE', reasonName: 'Damage / Breakage', effectType: 'DECREASE', requiresPhoto: true, requiresApproval: true, approvalLevel: 'WAREHOUSE_MANAGER', isWriteOff: true, displayOrder: 10, status: 'ACTIVE' },
    { id: 'rsn-002', reasonCode: 'EXPIRY', reasonName: 'Expired Stock', effectType: 'DECREASE', requiresPhoto: true, requiresApproval: true, approvalLevel: 'WAREHOUSE_MANAGER', isWriteOff: true, displayOrder: 20, status: 'ACTIVE' },
    { id: 'rsn-003', reasonCode: 'BROKEN_PACKAGING', reasonName: 'Broken Packaging', effectType: 'DECREASE', requiresPhoto: true, requiresApproval: true, approvalLevel: 'SUPERVISOR', isWriteOff: false, displayOrder: 30, status: 'ACTIVE' },
    { id: 'rsn-004', reasonCode: 'LOST', reasonName: 'Lost / Missing Stock', effectType: 'DECREASE', requiresPhoto: false, requiresApproval: true, approvalLevel: 'FINANCE', isWriteOff: true, displayOrder: 40, status: 'ACTIVE' },
    { id: 'rsn-005', reasonCode: 'FOUND', reasonName: 'Found Stock', effectType: 'INCREASE', requiresPhoto: false, requiresApproval: true, approvalLevel: 'SUPERVISOR', isWriteOff: false, displayOrder: 50, status: 'ACTIVE' },
    { id: 'rsn-006', reasonCode: 'THEFT', reasonName: 'Theft / Pilferage', effectType: 'DECREASE', requiresPhoto: true, requiresApproval: true, approvalLevel: 'MANAGEMENT', isWriteOff: true, displayOrder: 60, status: 'ACTIVE' },
    { id: 'rsn-007', reasonCode: 'WRONG_ENTRY', reasonName: 'Wrong Entry / Data Error', effectType: 'NEUTRAL', requiresPhoto: false, requiresApproval: true, approvalLevel: 'SUPERVISOR', isWriteOff: false, displayOrder: 70, status: 'ACTIVE' },
    { id: 'rsn-008', reasonCode: 'COUNTING_ERROR', reasonName: 'Counting Error', effectType: 'NEUTRAL', requiresPhoto: false, requiresApproval: true, approvalLevel: 'SUPERVISOR', isWriteOff: false, displayOrder: 80, status: 'ACTIVE' },
    { id: 'rsn-009', reasonCode: 'SUPPLIER_SHORTAGE', reasonName: 'Supplier Shortage', effectType: 'DECREASE', requiresPhoto: false, requiresApproval: true, approvalLevel: 'FINANCE', isWriteOff: false, displayOrder: 90, status: 'ACTIVE' },
    { id: 'rsn-010', reasonCode: 'PRODUCTION_LOSS', reasonName: 'Production Loss / Variance', effectType: 'DECREASE', requiresPhoto: true, requiresApproval: true, approvalLevel: 'FINANCE', isWriteOff: false, displayOrder: 100, status: 'ACTIVE' },
  ],
  damageReports: [
    { id: 'dmg-001', damageReportNumber: 'DR-2026-0901', reportDate: '2026-07-08', damageType: 'WAREHOUSE_DAMAGE', damageSeverity: 'SEVERE', productName: 'Kaju Katli 500g', batchNumber: 'KK-2607-04', damagedQty: 12, unitCost: 600, totalDamageValue: 7200, warehouseName: 'Mumbai DC', photoCount: 4, disposition: 'WRITE_OFF', status: 'POSTED', reportedByName: 'Suresh Patil', adjustmentNumber: 'ADJ-2026-0103', damageDescription: '12 units crushed during forklift handling — outer carton damaged, inner packs contaminated.' },
    { id: 'dmg-002', damageReportNumber: 'DR-2026-0902', reportDate: '2026-07-09', damageType: 'TRANSPORT_DAMAGE', damageSeverity: 'MODERATE', productName: 'Soan Cake 1kg', batchNumber: 'SC-2606-04', damagedQty: 6, unitCost: 625, totalDamageValue: 3750, warehouseName: 'Mumbai DC', photoCount: 2, disposition: 'REPACK', status: 'UNDER_REVIEW', reportedByName: 'Ramesh Yadav', adjustmentNumber: null, damageDescription: '6 units outer box dented during truck unload — contents intact, repackable.' },
    { id: 'dmg-003', damageReportNumber: 'DR-2026-0903', reportDate: '2026-07-09', damageType: 'STORAGE_DAMAGE', damageSeverity: 'MINOR', productName: 'Mixed Namkeen 200g', batchNumber: 'MN-2607-03', damagedQty: 18, unitCost: 53, totalDamageValue: 954, warehouseName: 'Mumbai DC', photoCount: 1, disposition: 'REPAIRABLE', status: 'REPORTED', reportedByName: 'Sandeep Kumar', adjustmentNumber: null, damageDescription: '18 packets with minor seal damage from cold storage humidity — sealable via rework.' },
    { id: 'dmg-004', damageReportNumber: 'DR-2026-0904', reportDate: '2026-07-07', damageType: 'PRODUCTION_DAMAGE', damageSeverity: 'TOTAL_LOSS', productName: 'Gulab Jamun 1kg', batchNumber: 'GJ-2607-01', damagedQty: 24, unitCost: 304, totalDamageValue: 7296, warehouseName: 'Mumbai Plant Warehouse', photoCount: 6, disposition: 'SCRAP', status: 'DISPOSED', reportedByName: 'Chef Rajesh', adjustmentNumber: 'ADJ-2026-0107', damageDescription: 'Full batch burned due to thermostat malfunction — disposed to animal feed vendor.' },
  ],
  expiryAdjustments: [
    { id: 'exa-001', expiryAdjustmentNumber: 'EXA-2026-001', adjustmentDate: '2026-07-07', productName: 'Kaju Katli 250g', batchNumber: 'KK-2606-12', expiredQty: 24, expiryDate: '2026-07-05', unitCost: 200, totalValue: 4800, warehouseName: 'Mumbai Retail Store 01', disposition: 'DESTROYED', disposalDate: '2026-07-07', status: 'POSTED', expiryCategory: 'EXPIRED', daysBeforeExpiry: -2, createdByName: 'Vikram Iyer', approvedByName: 'Anita Desai' },
    { id: 'exa-002', expiryAdjustmentNumber: 'EXA-2026-002', adjustmentDate: '2026-07-09', productName: 'Soan Cake 500g', batchNumber: 'SC-2605-22', expiredQty: 18, expiryDate: '2026-07-14', unitCost: 312, totalValue: 5616, warehouseName: 'Mumbai DC', disposition: 'PENDING', status: 'PENDING_APPROVAL', expiryCategory: 'NEAR_EXPIRY', daysBeforeExpiry: 5, createdByName: 'Suresh Patil', approvedByName: null },
    { id: 'exa-003', expiryAdjustmentNumber: 'EXA-2026-003', adjustmentDate: '2026-07-08', productName: 'Mixed Namkeen 200g', batchNumber: 'MN-2606-30', expiredQty: 60, expiryDate: '2026-07-12', unitCost: 53, totalValue: 3180, warehouseName: 'Mumbai DC', disposition: 'PENDING', status: 'APPROVED', expiryCategory: 'BLOCKED', daysBeforeExpiry: 4, createdByName: 'Sandeep Kumar', approvedByName: 'Anita Desai' },
  ],
  rootCauses: [
    { id: 'rc-001', adjustmentNumber: 'ADJ-2026-0103', rootCauseCategory: 'STORAGE', rootCauseDetail: 'Pallets stacked too high in Zone B causing top-tier product crush damage during forklift retrieval.', affectedQty: 12, affectedValue: 7200, correctiveAction: 'Reduce max stacking height from 5 to 3 pallets. Install racking guards on top tier.', preventiveAction: 'Add rack height sensors + weekly safety audit.', actionOwner: 'Anita Desai', actionDueDate: '2026-07-20', actionStatus: 'IN_PROGRESS', isRecurring: true, recurrenceCount: 3 },
    { id: 'rc-002', adjustmentNumber: 'ADJ-2026-0102', rootCauseCategory: 'HUMAN_ERROR', rootCauseDetail: 'Cycle count clerk missed 6 units in dark corner of Zone A — physical count discrepancy.', affectedQty: 6, affectedValue: 1800, correctiveAction: 'Re-train cycle count staff on full-sweep methodology. Add task lighting to Zone A corners.', preventiveAction: 'Add lighting + monthly count audit on Zone A.', actionOwner: 'Sandeep Kumar', actionDueDate: '2026-07-15', actionStatus: 'OPEN', isRecurring: false, recurrenceCount: 1 },
    { id: 'rc-003', adjustmentNumber: 'ADJ-2026-0108', rootCauseCategory: 'SYSTEM_ERROR', rootCauseDetail: 'Barcode master mismatch — GS1 GTIN for Kaju Katli 500g not synced from PIM to scanner database, causing wrong scans during putaway.', affectedQty: 0, affectedValue: 0, correctiveAction: 'Force PIM → scanner sync job. Add validation rule to fail putaway if barcode not recognized.', preventiveAction: 'Add nightly PIM sync verification alert.', actionOwner: 'Ramesh Yadav', actionDueDate: '2026-07-12', actionStatus: 'COMPLETED', isRecurring: false, recurrenceCount: 0 },
    { id: 'rc-004', adjustmentNumber: 'ADJ-2026-0107', rootCauseCategory: 'PRODUCTION', rootCauseDetail: 'Thermostat on cooker #3 malfunctioned, temperature exceeded BOM threshold by 12°C causing batch burn and yield drop.', affectedQty: 15, affectedValue: 9750, correctiveAction: 'Replace thermostat, recalibrate cooker #3, add 15-min temperature logging interval.', preventiveAction: 'Quarterly thermostat calibration schedule.', actionOwner: 'Chef Rajesh', actionDueDate: '2026-07-13', actionStatus: 'OPEN', isRecurring: true, recurrenceCount: 2 },
    { id: 'rc-005', adjustmentNumber: 'ADJ-2026-0104', rootCauseCategory: 'RECEIVING', rootCauseDetail: 'GRN inspector did not verify expiry date on incoming batch — expired stock accepted into Mumbai Retail Store 01 inventory.', affectedQty: 24, affectedValue: 4800, correctiveAction: 'Add mandatory expiry date check to GRN workflow with photo evidence.', preventiveAction: 'Update GRN checklist, train 4 receiving staff on near-expiry rejection policy.', actionOwner: 'Vikram Iyer', actionDueDate: '2026-07-18', actionStatus: 'IN_PROGRESS', isRecurring: false, recurrenceCount: 1 },
  ],
}

// ─── Sprint 17: Reservation & Allocation Seed Data ──────
const RES_DATA = {
  reservations: [
    { id: 'res-001', reservationNumber: 'RSV-2026-0001', reservationDate: '2026-07-09', reservationType: 'SALES_ORDER', priority: 'HIGH', priorityScore: 80, warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0451', partnerName: 'Sai Distribution Pvt Ltd', expiryDate: '2026-07-12', autoReleaseAfter: 72, status: 'ACTIVE', totalLines: 3, totalRequestedQty: 250, totalReservedQty: 250, totalAllocatedQty: 180, totalIssuedQty: 0, createdByName: 'Anita Desai', remarks: 'Urgent wholesale order — customer SLA 24hrs. Premium SKUs reserved.' },
    { id: 'res-002', reservationNumber: 'RSV-2026-0002', reservationDate: '2026-07-09', reservationType: 'PRODUCTION_ORDER', priority: 'CRITICAL', priorityScore: 95, warehouseName: 'Mumbai Plant Warehouse', branchName: 'Mumbai Plant', referenceType: 'PRODUCTION_ORDER', referenceNumber: 'PO-2026-0078', partnerName: null, expiryDate: '2026-07-10', autoReleaseAfter: 24, status: 'FULLY_ALLOCATED', totalLines: 5, totalRequestedQty: 1200, totalReservedQty: 1200, totalAllocatedQty: 1200, totalIssuedQty: 600, createdByName: 'Chef Rajesh', remarks: 'Kaju Katli production batch KK-2607-15 — BOM material reservation.' },
    { id: 'res-003', reservationNumber: 'RSV-2026-0003', reservationDate: '2026-07-09', reservationType: 'KITCHEN_ORDER', priority: 'NORMAL', priorityScore: 60, warehouseName: 'Mumbai Plant Warehouse', branchName: 'Mumbai Plant', referenceType: 'KITCHEN_REQUISITION', referenceNumber: 'KR-2026-0234', partnerName: null, expiryDate: '2026-07-09', autoReleaseAfter: 8, status: 'PARTIALLY_ALLOCATED', totalLines: 4, totalRequestedQty: 80, totalReservedQty: 80, totalAllocatedQty: 45, totalIssuedQty: 45, createdByName: 'Chef Rajesh', remarks: 'Daily kitchen requisition — cooking oil, sugar, ghee.' },
    { id: 'res-004', reservationNumber: 'RSV-2026-0004', reservationDate: '2026-07-08', reservationType: 'TRANSFER_ORDER', priority: 'NORMAL', priorityScore: 50, warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', referenceType: 'STOCK_TRANSFER', referenceNumber: 'ST-2026-0156', partnerName: null, expiryDate: '2026-07-14', autoReleaseAfter: 144, status: 'ACTIVE', totalLines: 6, totalRequestedQty: 400, totalReservedQty: 380, totalAllocatedQty: 200, totalIssuedQty: 0, createdByName: 'Ramesh Yadav', remarks: 'Inter-warehouse transfer to Pune DC — mixed SKUs.' },
    { id: 'res-005', reservationNumber: 'RSV-2026-0005', reservationDate: '2026-07-07', reservationType: 'MAINTENANCE_ORDER', priority: 'LOW', priorityScore: 30, warehouseName: 'Mumbai Plant Warehouse', branchName: 'Mumbai Plant', referenceType: 'MAINTENANCE_WO', referenceNumber: 'MWO-2026-0089', partnerName: null, expiryDate: '2026-07-21', autoReleaseAfter: 240, status: 'ACTIVE', totalLines: 2, totalRequestedQty: 15, totalReservedQty: 15, totalAllocatedQty: 15, totalIssuedQty: 0, createdByName: 'Sandeep Kumar', remarks: 'Maintenance spare parts — conveyor belt replacement scheduled.' },
    { id: 'res-006', reservationNumber: 'RSV-2026-0006', reservationDate: '2026-07-06', reservationType: 'PROJECT_RESERVATION', priority: 'HIGH', priorityScore: 75, warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', referenceType: 'PROJECT', referenceNumber: 'PRJ-2026-0012', partnerName: 'Wedding Belles Events', expiryDate: '2026-07-25', autoReleaseAfter: 360, status: 'PARTIALLY_ALLOCATED', totalLines: 8, totalRequestedQty: 600, totalReservedQty: 550, totalAllocatedQty: 320, totalIssuedQty: 100, createdByName: 'Anita Desai', remarks: 'Wedding event bulk order — 8 SKUs, long lead time reservation.' },
    { id: 'res-007', reservationNumber: 'RSV-2026-0007', reservationDate: '2026-07-05', reservationType: 'SAMPLE_RESERVATION', priority: 'LOW', priorityScore: 25, warehouseName: 'Mumbai Retail Store 01', branchName: 'Mumbai Retail', referenceType: 'SAMPLE_REQUEST', referenceNumber: 'SR-2026-0042', partnerName: 'Apna Bazaar Chain', expiryDate: '2026-07-19', autoReleaseAfter: 288, status: 'RELEASED', totalLines: 3, totalRequestedQty: 12, totalReservedQty: 12, totalAllocatedQty: 12, totalIssuedQty: 12, createdByName: 'Vikram Iyer', remarks: 'Free samples for new product launch — fully issued.' },
    { id: 'res-008', reservationNumber: 'RSV-2026-0008', reservationDate: '2026-07-09', reservationType: 'EMERGENCY_RESERVATION', priority: 'EMERGENCY', priorityScore: 100, warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', referenceType: 'EMERGENCY_REQUEST', referenceNumber: 'ER-2026-0003', partnerName: 'Lifeline Hospital Canteen', expiryDate: '2026-07-10', autoReleaseAfter: 12, status: 'FULLY_ALLOCATED', totalLines: 2, totalRequestedQty: 50, totalReservedQty: 50, totalAllocatedQty: 50, totalIssuedQty: 0, createdByName: 'Anita Desai', remarks: 'Emergency food supply — hospital canteen urgent need. Override standard SLA.' },
  ],
  allocationRules: [
    { id: 'alr-001', ruleCode: 'FEFO-PERISHABLE', ruleName: 'FEFO for Perishable Items', description: 'First Expiry First Out — strict for dairy, sweets, and short-shelf-life products.', strategy: 'FEFO', priority: 10, reservationType: 'SALES_ORDER', productCategory: 'PERISHABLES', productType: 'FINISHED_GOOD', warehouseName: 'All Warehouses', batchPreference: 'EXPIRY_BASED', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-002', ruleCode: 'FIFO-RAW-MATERIAL', ruleName: 'FIFO for Raw Materials', description: 'First In First Out — for raw materials and ingredients in plant warehouse.', strategy: 'FIFO', priority: 20, reservationType: 'PRODUCTION_ORDER', productCategory: 'RAW_MATERIALS', productType: 'RAW_MATERIAL', warehouseName: 'Mumbai Plant Warehouse', batchPreference: 'SAME_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-003', ruleCode: 'LIFO-FINISHED', ruleName: 'LIFO for Finished Goods', description: 'Last In First Out — for finished goods in dispatch zone, picks freshest batch first.', strategy: 'LIFO', priority: 30, reservationType: 'SALES_ORDER', productCategory: 'FINISHED_GOODS', productType: 'FINISHED_GOOD', warehouseName: 'Mumbai DC', batchPreference: 'AUTO_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-004', ruleCode: 'NEAREST-BIN-PICK', ruleName: 'Nearest Bin for Picking', description: 'Optimize picker travel time — picks from nearest bin to dispatch dock.', strategy: 'NEAREST_BIN', priority: 40, reservationType: 'TRANSFER_ORDER', productCategory: null, productType: null, warehouseName: 'All Warehouses', batchPreference: 'MULTIPLE_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-005', ruleCode: 'LOWEST-COST-PROJ', ruleName: 'Lowest Cost for Project Reservations', description: 'Select stock from lowest-cost batches for project/event reservations to maximize margin.', strategy: 'LOWEST_COST', priority: 50, reservationType: 'PROJECT_RESERVATION', productCategory: 'FINISHED_GOODS', productType: 'FINISHED_GOOD', warehouseName: 'All Warehouses', batchPreference: 'SUPPLIER_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-006', ruleCode: 'HIGHEST-PRIORITY-EMR', ruleName: 'Highest Priority for Emergency', description: 'Override all other reservations — emergency orders get highest-priority stock access.', strategy: 'HIGHEST_PRIORITY', priority: 5, reservationType: 'EMERGENCY_RESERVATION', productCategory: null, productType: null, warehouseName: 'All Warehouses', batchPreference: 'AUTO_BATCH', excludeExpired: true, excludeQuarantine: false, excludeBlocked: false, status: 'ACTIVE' },
  ],
  availabilitySnapshots: [
    { id: 'avs-001', productName: 'Kaju Katli 500g', warehouseName: 'Mumbai DC', onHandQty: 480, reservedQty: 250, allocatedQty: 180, inTransitQty: 100, blockedQty: 12, availableQty: 38, snapshotAt: '2026-07-09 09:30', unitCost: 600, totalValue: 288000 },
    { id: 'avs-002', productName: 'Sugar (Raw)', warehouseName: 'Mumbai Plant Warehouse', onHandQty: 1500, reservedQty: 600, allocatedQty: 600, inTransitQty: 0, blockedQty: 0, availableQty: 300, snapshotAt: '2026-07-09 09:30', unitCost: 45, totalValue: 67500 },
    { id: 'avs-003', productName: 'Ghee (Raw)', warehouseName: 'Mumbai Plant Warehouse', onHandQty: 80, reservedQty: 40, allocatedQty: 30, inTransitQty: 50, blockedQty: 0, availableQty: 10, snapshotAt: '2026-07-09 09:30', unitCost: 520, totalValue: 41600 },
    { id: 'avs-004', productName: 'Soan Cake 1kg', warehouseName: 'Mumbai DC', onHandQty: 60, reservedQty: 80, allocatedQty: 50, inTransitQty: 40, blockedQty: 6, availableQty: -76, snapshotAt: '2026-07-09 09:30', unitCost: 625, totalValue: 37500 },
    { id: 'avs-005', productName: 'Mixed Namkeen 200g', warehouseName: 'Mumbai DC', onHandQty: 850, reservedQty: 200, allocatedQty: 150, inTransitQty: 0, blockedQty: 24, availableQty: 476, snapshotAt: '2026-07-09 09:30', unitCost: 53, totalValue: 45050 },
    { id: 'avs-006', productName: 'Gulab Jamun 1kg', warehouseName: 'Mumbai Retail Store 01', onHandQty: 24, reservedQty: 30, allocatedQty: 20, inTransitQty: 0, blockedQty: 0, availableQty: -26, snapshotAt: '2026-07-09 09:30', unitCost: 304, totalValue: 7296 },
  ],
  priorityMatrix: [
    { rank: 1, source: 'Manufacturing Orders', exampleType: 'PRODUCTION_ORDER', defaultPriority: 'CRITICAL', defaultScore: 95, slaHours: 24, notes: 'Production line stoppage costs >50K/hr — highest non-emergency priority.' },
    { rank: 2, source: 'Customer Sales Orders', exampleType: 'SALES_ORDER', defaultPriority: 'HIGH', defaultScore: 80, slaHours: 48, notes: 'Wholesale + retail orders. VIP customers get CRITICAL override.' },
    { rank: 3, source: 'Restaurant / Kitchen', exampleType: 'KITCHEN_ORDER', defaultPriority: 'NORMAL', defaultScore: 60, slaHours: 8, notes: 'Same-day consumption — short reservation window.' },
    { rank: 4, source: 'Stock Transfers', exampleType: 'TRANSFER_ORDER', defaultPriority: 'NORMAL', defaultScore: 50, slaHours: 144, notes: 'Inter-warehouse restocking — 6-day reservation window.' },
    { rank: 5, source: 'Samples & Marketing', exampleType: 'SAMPLE_RESERVATION', defaultPriority: 'LOW', defaultScore: 25, slaHours: 288, notes: '12-day window — low priority, can be bumped by higher orders.' },
  ],
}

// ─── Sprint 18: Cycle Count & Audit Seed Data ───────────
const CC_DATA = {
  physicalInventories: [
    { id: 'pi-001', countNumber: 'PI-2026-0001', countDate: '2026-07-09', countType: 'ANNUAL_COUNT', warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', teamId: 'ct-001', teamName: 'Alpha Count Team', teamLead: 'Anita Desai', scope: 'FULL WAREHOUSE', totalLines: 480, countedLines: 412, pendingLines: 68, systemQty: 18500, countedQty: 18350, varianceQty: -150, varianceValue: -42500, accuracyPct: 99.19, status: 'IN_PROGRESS', approvalLevel: 'WAREHOUSE_MANAGER', scheduledStart: '2026-07-09 08:00', actualStart: '2026-07-09 08:15', expectedCompletion: '2026-07-10 18:00', remarks: 'Annual count — full Mumbai DC warehouse. Freezer section pending.' },
    { id: 'pi-002', countNumber: 'PI-2026-0002', countDate: '2026-07-08', countType: 'CYCLE_COUNT', warehouseName: 'Mumbai Plant Warehouse', branchName: 'Mumbai Plant', teamId: 'ct-002', teamName: 'Bravo Count Team', teamLead: 'Ramesh Yadav', scope: 'ABC CATEGORY A', totalLines: 120, countedLines: 120, pendingLines: 0, systemQty: 8400, countedQty: 8320, varianceQty: -80, varianceValue: -18400, accuracyPct: 99.05, status: 'COMPLETED', approvalLevel: 'SUPERVISOR', scheduledStart: '2026-07-08 06:00', actualStart: '2026-07-08 06:05', expectedCompletion: '2026-07-08 14:00', remarks: 'Monthly cycle count — Category A SKUs only. 4 variances identified.' },
    { id: 'pi-003', countNumber: 'PI-2026-0003', countDate: '2026-07-09', countType: 'BLIND_COUNT', warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', teamId: 'ct-003', teamName: 'Charlie Count Team', teamLead: 'Vikram Iyer', scope: 'HIGH-VALUE ITEMS', totalLines: 45, countedLines: 45, pendingLines: 0, systemQty: 920, countedQty: 935, varianceQty: 15, varianceValue: 9300, accuracyPct: 98.37, status: 'PENDING_APPROVAL', approvalLevel: 'FINANCE', scheduledStart: '2026-07-09 10:00', actualStart: '2026-07-09 10:00', expectedCompletion: '2026-07-09 16:00', remarks: 'Blind count — counters did not see system qty. 3 extra units found in Kaju Katli bin.' },
    { id: 'pi-004', countNumber: 'PI-2026-0004', countDate: '2026-07-09', countType: 'SPOT_COUNT', warehouseName: 'Mumbai Retail Store 01', branchName: 'Mumbai Retail', teamId: 'ct-001', teamName: 'Alpha Count Team', teamLead: 'Anita Desai', scope: 'BIN-A-12 + BIN-A-13', totalLines: 12, countedLines: 12, pendingLines: 0, systemQty: 280, countedQty: 265, varianceQty: -15, varianceValue: -4560, accuracyPct: 94.64, status: 'VARIANCE_INVESTIGATION', approvalLevel: 'SUPERVISOR', scheduledStart: '2026-07-09 14:00', actualStart: '2026-07-09 14:05', expectedCompletion: '2026-07-09 15:00', remarks: 'Spot count triggered by POS alert — 15 units short in Gulab Jamun display bin.' },
    { id: 'pi-005', countNumber: 'PI-2026-0005', countDate: '2026-07-07', countType: 'ABC_COUNT', warehouseName: 'Mumbai Plant Warehouse', branchName: 'Mumbai Plant', teamId: 'ct-002', teamName: 'Bravo Count Team', teamLead: 'Ramesh Yadav', scope: 'ABC CATEGORY B', totalLines: 220, countedLines: 220, pendingLines: 0, systemQty: 14200, countedQty: 14180, varianceQty: -20, varianceValue: -6800, accuracyPct: 99.86, status: 'COMPLETED', approvalLevel: 'SUPERVISOR', scheduledStart: '2026-07-07 07:00', actualStart: '2026-07-07 07:00', expectedCompletion: '2026-07-07 16:00', remarks: 'Quarterly ABC Category B count — minimal variance, 1 SKU short.' },
    { id: 'pi-006', countNumber: 'PI-2026-0006', countDate: '2026-07-09', countType: 'RANDOM_COUNT', warehouseName: 'Pune DC', branchName: 'Pune Branch', teamId: 'ct-003', teamName: 'Charlie Count Team', teamLead: 'Vikram Iyer', scope: 'RANDOM 50 BINS', totalLines: 50, countedLines: 35, pendingLines: 15, systemQty: 3100, countedQty: 3085, varianceQty: -15, varianceValue: -3250, accuracyPct: 99.52, status: 'IN_PROGRESS', approvalLevel: 'SUPERVISOR', scheduledStart: '2026-07-09 09:00', actualStart: '2026-07-09 09:10', expectedCompletion: '2026-07-09 17:00', remarks: 'Random sample of 50 bins — system-generated. 15 bins pending in cold storage.' },
    { id: 'pi-007', countNumber: 'PI-2026-0007', countDate: '2026-07-06', countType: 'BIN_COUNT', warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', teamId: 'ct-001', teamName: 'Alpha Count Team', teamLead: 'Anita Desai', scope: 'ZONE-3 ALL BINS', totalLines: 85, countedLines: 85, pendingLines: 0, systemQty: 6400, countedQty: 6380, varianceQty: -20, varianceValue: -8200, accuracyPct: 99.69, status: 'COMPLETED', approvalLevel: 'SUPERVISOR', scheduledStart: '2026-07-06 13:00', actualStart: '2026-07-06 13:00', expectedCompletion: '2026-07-06 18:00', remarks: 'Zone-3 bin count after reorganization. 1 missing carton traced to wrong bin.' },
    { id: 'pi-008', countNumber: 'PI-2026-0008', countDate: '2026-07-05', countType: 'INVESTIGATION_COUNT', warehouseName: 'Mumbai DC', branchName: 'Mumbai Branch', teamId: 'ct-002', teamName: 'Bravo Count Team', teamLead: 'Ramesh Yadav', scope: 'SKU: KAJU-KATLI-500G', totalLines: 8, countedLines: 8, pendingLines: 0, systemQty: 480, countedQty: 445, varianceQty: -35, varianceValue: -21000, accuracyPct: 92.71, status: 'RECOUNT_REQUIRED', approvalLevel: 'FINANCE', scheduledStart: '2026-07-05 11:00', actualStart: '2026-07-05 11:00', expectedCompletion: '2026-07-05 13:00', remarks: 'Investigation count — 35 units unaccounted. Suspected theft or unrecorded dispatch. Recount ordered by Finance.' },
  ],
  cyclePlans: [
    { id: 'ccp-001', planCode: 'CC-DAILY-A', planName: 'Daily Cycle Count — Category A', frequency: 'DAILY', abcClass: 'A', itemsPerCycle: 25, varianceThreshold: 0.5, recountTrigger: 1.0, nextRunDate: '2026-07-10', lastRunDate: '2026-07-09', avgAccuracy: 99.05, totalExecutions: 142, activeSchedules: 1, status: 'ACTIVE', strategy: 'High-value items counted daily — 25 SKUs per day covering entire Category A in ~10 days.' },
    { id: 'ccp-002', planCode: 'CC-WEEKLY-B', planName: 'Weekly Cycle Count — Category B', frequency: 'WEEKLY', abcClass: 'B', itemsPerCycle: 50, varianceThreshold: 1.0, recountTrigger: 2.0, nextRunDate: '2026-07-14', lastRunDate: '2026-07-07', avgAccuracy: 99.86, totalExecutions: 28, activeSchedules: 1, status: 'ACTIVE', strategy: 'Medium-value items counted weekly — 50 SKUs per week covering Category B in ~4 weeks.' },
    { id: 'ccp-003', planCode: 'CC-MONTHLY-C', planName: 'Monthly Cycle Count — Category C', frequency: 'MONTHLY', abcClass: 'C', itemsPerCycle: 100, varianceThreshold: 2.0, recountTrigger: 5.0, nextRunDate: '2026-07-31', lastRunDate: '2026-06-30', avgAccuracy: 98.42, totalExecutions: 6, activeSchedules: 1, status: 'ACTIVE', strategy: 'Low-value items counted monthly — 100 SKUs per cycle covering Category C quarterly.' },
    { id: 'ccp-004', planCode: 'CC-QTR-ALL', planName: 'Quarterly Full Warehouse Count', frequency: 'QUARTERLY', abcClass: 'ALL', itemsPerCycle: 480, varianceThreshold: 1.0, recountTrigger: 3.0, nextRunDate: '2026-10-01', lastRunDate: '2026-07-09', avgAccuracy: 99.19, totalExecutions: 4, activeSchedules: 1, status: 'ACTIVE', strategy: 'Full warehouse count once per quarter — covers all categories including slow-moving items.' },
  ],
  cycleSchedules: [
    { id: 'ccs-001', scheduleCode: 'SCH-2026-0710-A', planId: 'ccp-001', planName: 'Daily Cycle Count — Category A', scheduledDate: '2026-07-10', warehouseName: 'Mumbai DC', teamId: 'ct-001', teamName: 'Alpha Count Team', itemsScheduled: 25, itemsCounted: 0, varianceExpected: 0.5, status: 'SCHEDULED', windowStart: '2026-07-10 08:00', windowEnd: '2026-07-10 12:00', notes: 'Daily Category A count — top 25 high-value SKUs in Mumbai DC.' },
    { id: 'ccs-002', scheduleCode: 'SCH-2026-0708-A', planId: 'ccp-001', planName: 'Daily Cycle Count — Category A', scheduledDate: '2026-07-08', warehouseName: 'Mumbai Plant Warehouse', teamId: 'ct-002', teamName: 'Bravo Count Team', itemsScheduled: 25, itemsCounted: 25, varianceExpected: 0.5, actualVariance: -80, status: 'COMPLETED', windowStart: '2026-07-08 06:00', windowEnd: '2026-07-08 14:00', notes: 'Completed — 4 variances identified, all within threshold. Avg accuracy 99.05%.' },
    { id: 'ccs-003', scheduleCode: 'SCH-2026-0714-B', planId: 'ccp-002', planName: 'Weekly Cycle Count — Category B', scheduledDate: '2026-07-14', warehouseName: 'Mumbai DC', teamId: 'ct-003', teamName: 'Charlie Count Team', itemsScheduled: 50, itemsCounted: 0, varianceExpected: 1.0, status: 'SCHEDULED', windowStart: '2026-07-14 09:00', windowEnd: '2026-07-14 17:00', notes: 'Weekly Category B count — 50 SKUs across Mumbai DC.' },
    { id: 'ccs-004', scheduleCode: 'SCH-2026-0707-B', planId: 'ccp-002', planName: 'Weekly Cycle Count — Category B', scheduledDate: '2026-07-07', warehouseName: 'Mumbai Plant Warehouse', teamId: 'ct-002', teamName: 'Bravo Count Team', itemsScheduled: 50, itemsCounted: 50, varianceExpected: 1.0, actualVariance: -20, status: 'COMPLETED', windowStart: '2026-07-07 07:00', windowEnd: '2026-07-07 16:00', notes: 'Completed — minimal variance. 1 SKU short. Avg accuracy 99.86%.' },
  ],
  countTeams: [
    { id: 'ct-001', teamCode: 'ALPHA', teamName: 'Alpha Count Team', teamLead: 'Anita Desai', memberCount: 4, specializations: ['ANNUAL_COUNT', 'BIN_COUNT', 'SPOT_COUNT'], homeWarehouse: 'Mumbai DC', totalCounts: 38, avgAccuracy: 98.74, activeAssignments: 2, certificationLevel: 'LEVEL_3', status: 'ACTIVE', lastAssignment: '2026-07-09', notes: 'Primary Mumbai DC team — handles high-precision counts and investigations.' },
    { id: 'ct-002', teamCode: 'BRAVO', teamName: 'Bravo Count Team', teamLead: 'Ramesh Yadav', memberCount: 4, specializations: ['CYCLE_COUNT', 'ABC_COUNT', 'INVESTIGATION_COUNT'], homeWarehouse: 'Mumbai Plant Warehouse', totalCounts: 56, avgAccuracy: 99.32, activeAssignments: 0, certificationLevel: 'LEVEL_3', status: 'ACTIVE', lastAssignment: '2026-07-08', notes: 'Plant warehouse specialists — certified for raw material and finished goods counts.' },
    { id: 'ct-003', teamCode: 'CHARLIE', teamName: 'Charlie Count Team', teamLead: 'Vikram Iyer', memberCount: 3, specializations: ['BLIND_COUNT', 'RANDOM_COUNT', 'SPOT_COUNT'], homeWarehouse: 'Multi-Warehouse', totalCounts: 24, avgAccuracy: 98.91, activeAssignments: 1, certificationLevel: 'LEVEL_2', status: 'ACTIVE', lastAssignment: '2026-07-09', notes: 'Mobile team — performs blind and random counts across all warehouses.' },
  ],
  countVariances: [
    { id: 'cv-001', varianceNumber: 'VAR-2026-0001', countId: 'pi-008', countNumber: 'PI-2026-0008', productName: 'Kaju Katli 500g', warehouseName: 'Mumbai DC', binLocation: 'BIN-B-04', batchNumber: 'KK-2606-08', varianceType: 'MISSING', systemQty: 480, countedQty: 445, varianceQty: -35, unitCost: 600, varianceValue: -21000, rootCause: 'SUSPECTED_THEFT', investigationStatus: 'IN_PROGRESS', resolutionStatus: 'PENDING_RECOUNT', assignedTo: 'Anita Desai', identifiedAt: '2026-07-05 12:30', resolvedAt: null, notes: '35 units missing — high-value item. CCTV review in progress. Recount ordered.' },
    { id: 'cv-002', varianceNumber: 'VAR-2026-0002', countId: 'pi-003', countNumber: 'PI-2026-0003', productName: 'Kaju Katli 500g', warehouseName: 'Mumbai DC', binLocation: 'BIN-A-12', batchNumber: 'KK-2607-01', varianceType: 'EXTRA', systemQty: 200, countedQty: 215, varianceQty: 15, unitCost: 600, varianceValue: 9000, rootCause: 'UNRECORDED_RECEIPT', investigationStatus: 'COMPLETED', resolutionStatus: 'ADJUSTMENT_POSTED', assignedTo: 'Vikram Iyer', identifiedAt: '2026-07-09 11:15', resolvedAt: '2026-07-09 14:00', notes: '15 extra units — traced to GRN-2026-0512 not yet posted to bin. Stock receipt confirmed.' },
    { id: 'cv-003', varianceNumber: 'VAR-2026-0003', countId: 'pi-007', countNumber: 'PI-2026-0007', productName: 'Soan Cake 1kg', warehouseName: 'Mumbai DC', binLocation: 'BIN-C-08', batchNumber: 'SC-2606-12', varianceType: 'WRONG_LOCATION', systemQty: 60, countedQty: 0, varianceQty: -60, unitCost: 625, varianceValue: -37500, rootCause: 'PUTAWAY_ERROR', investigationStatus: 'COMPLETED', resolutionStatus: 'RELOCATED', assignedTo: 'Anita Desai', identifiedAt: '2026-07-06 15:20', resolvedAt: '2026-07-06 16:45', notes: '60 units not in BIN-C-08 — found in adjacent BIN-C-09. Putaway operator error during reorganization.' },
    { id: 'cv-004', varianceNumber: 'VAR-2026-0004', countId: 'pi-002', countNumber: 'PI-2026-0002', productName: 'Ghee (Raw)', warehouseName: 'Mumbai Plant Warehouse', binLocation: 'BIN-RM-02', batchNumber: 'GHEE-2606-A', varianceType: 'WRONG_BATCH', systemQty: 80, countedQty: 78, varianceQty: -2, unitCost: 520, varianceValue: -1040, rootCause: 'BATCH_MIXING', investigationStatus: 'COMPLETED', resolutionStatus: 'BATCH_CORRECTED', assignedTo: 'Ramesh Yadav', identifiedAt: '2026-07-08 09:45', resolvedAt: '2026-07-08 11:30', notes: '2 tins of GHEE-2606-A counted as GHEE-2606-B. Batch labels corrected in system.' },
    { id: 'cv-005', varianceNumber: 'VAR-2026-0005', countId: 'pi-005', countNumber: 'PI-2026-0005', productName: 'Sugar (Raw)', warehouseName: 'Mumbai Plant Warehouse', binLocation: 'BIN-RM-05', batchNumber: 'SUG-2606-01', varianceType: 'WRONG_UOM', systemQty: 1500, countedQty: 1480, varianceQty: -20, unitCost: 45, varianceValue: -900, rootCause: 'UOM_CONVERSION', investigationStatus: 'COMPLETED', resolutionStatus: 'UOM_RECALCULATED', assignedTo: 'Ramesh Yadav', identifiedAt: '2026-07-07 13:10', resolvedAt: '2026-07-07 14:00', notes: '20 kg variance — system recorded in KG, physical count in bags. UOM conversion applied.' },
    { id: 'cv-006', varianceNumber: 'VAR-2026-0006', countId: 'pi-004', countNumber: 'PI-2026-0004', productName: 'Gulab Jamun 1kg', warehouseName: 'Mumbai Retail Store 01', binLocation: 'DISPLAY-BIN-A', batchNumber: 'GJ-2607-03', varianceType: 'WRONG_PRODUCT', systemQty: 80, countedQty: 65, varianceQty: -15, unitCost: 304, varianceValue: -4560, rootCause: 'MISIDENTIFICATION', investigationStatus: 'COMPLETED', resolutionStatus: 'CORRECTED', assignedTo: 'Anita Desai', identifiedAt: '2026-07-09 14:35', resolvedAt: '2026-07-09 15:30', notes: '15 boxes were Kala Jamun mislabeled as Gulab Jamun. Product master updated, POS label corrected.' },
  ],
}

// ─── Sprint 19: Batch & Expiry Management Seed Data ─────
const BATCH_DATA = {
  batchMasters: [
    { id: 'bm-001', batchNumber: 'KK-2607-01', productName: 'Kaju Katli 500g', batchType: 'FINISHED_GOODS', supplierBatchNo: null, productionBatchNo: 'PB-KK-2607-01', productionOrderId: 'MO-2026-0089', supplierId: null, supplierName: null, manufacturingDate: '2026-07-01', packingDate: '2026-07-02', bestBeforeDate: '2026-07-31', expiryDate: '2026-07-31', batchStatus: 'AVAILABLE', statusReason: 'Released by QC after micro test', warehouseName: 'Mumbai DC', originalQty: 500, currentQty: 358, uomName: 'BOX', unitCost: 600, totalValue: 214800, fefoPriority: 10, storageConditions: 'Cool dry place', temperatureRange: '15-25°C', qualityGrade: 'A', qualityStatus: 'PASSED', createdByName: 'Chef Rajesh', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'bm-002', batchNumber: 'KK-2607-02', productName: 'Kaju Katli 500g', batchType: 'FINISHED_GOODS', supplierBatchNo: null, productionBatchNo: 'PB-KK-2607-02', productionOrderId: 'MO-2026-0090', supplierId: null, supplierName: null, manufacturingDate: '2026-07-05', packingDate: '2026-07-06', bestBeforeDate: '2026-08-04', expiryDate: '2026-08-04', batchStatus: 'AVAILABLE', statusReason: 'Quality A grade confirmed', warehouseName: 'Mumbai DC', originalQty: 400, currentQty: 380, uomName: 'BOX', unitCost: 600, totalValue: 228000, fefoPriority: 20, storageConditions: 'Cool dry place', temperatureRange: '15-25°C', qualityGrade: 'A', qualityStatus: 'PASSED', createdByName: 'Chef Rajesh', createdAt: '2026-07-05T17:00:00Z' },
    { id: 'bm-003', batchNumber: 'NM-2607-03', productName: 'Mixed Namkeen 200g', batchType: 'FINISHED_GOODS', supplierBatchNo: null, productionBatchNo: 'PB-NM-2607-03', productionOrderId: 'MO-2026-0091', supplierId: null, supplierName: null, manufacturingDate: '2026-07-03', packingDate: '2026-07-04', bestBeforeDate: '2026-08-17', expiryDate: '2026-08-17', batchStatus: 'AVAILABLE', statusReason: 'Released — shelf life 45 days', warehouseName: 'Mumbai DC', originalQty: 1000, currentQty: 850, uomName: 'PACK', unitCost: 53, totalValue: 45050, fefoPriority: 15, storageConditions: 'Airtight container', temperatureRange: '15-25°C', qualityGrade: 'A', qualityStatus: 'PASSED', createdByName: 'Sandeep Kumar', createdAt: '2026-07-03T14:00:00Z' },
    { id: 'bm-004', batchNumber: 'GJ-2606-12', productName: 'Gulab Jamun 1kg', batchType: 'FINISHED_GOODS', supplierBatchNo: null, productionBatchNo: 'PB-GJ-2606-12', productionOrderId: 'MO-2026-0078', supplierId: null, supplierName: null, manufacturingDate: '2026-06-25', packingDate: '2026-06-26', bestBeforeDate: '2026-07-10', expiryDate: '2026-07-10', batchStatus: 'EXPIRED', statusReason: 'Auto-flagged by expiry engine — past expiry', warehouseName: 'Mumbai DC', originalQty: 200, currentQty: 24, uomName: 'BOX', unitCost: 304, totalValue: 7296, fefoPriority: 1, storageConditions: 'Refrigerate', temperatureRange: '2-8°C', qualityGrade: 'C', qualityStatus: 'FAILED', createdByName: 'Chef Rajesh', createdAt: '2026-06-25T18:00:00Z' },
    { id: 'bm-005', batchNumber: 'SC-2606-15', productName: 'Soan Cake 1kg', batchType: 'FINISHED_GOODS', supplierBatchNo: null, productionBatchNo: 'PB-SC-2606-15', productionOrderId: 'MO-2026-0070', supplierId: null, supplierName: null, manufacturingDate: '2026-07-04', packingDate: '2026-07-05', bestBeforeDate: '2026-07-12', expiryDate: '2026-07-12', batchStatus: 'BLOCKED', statusReason: 'Customer complaint — taste deviation under investigation', warehouseName: 'Mumbai DC', originalQty: 150, currentQty: 60, uomName: 'BOX', unitCost: 625, totalValue: 37500, fefoPriority: 5, storageConditions: 'Cool dry place', temperatureRange: '15-25°C', qualityGrade: 'B', qualityStatus: 'QUARANTINE', createdByName: 'Chef Rajesh', createdAt: '2026-07-04T15:00:00Z' },
    { id: 'bm-006', batchNumber: 'CASHEW-RM-2606', productName: 'Cashew Nuts (Raw Material)', batchType: 'RAW_MATERIAL', supplierBatchNo: 'SUP-CAS-2026-007', productionBatchNo: null, productionOrderId: null, supplierId: 'sup-001', supplierName: 'Mumbai Dry Fruits Co.', manufacturingDate: '2026-06-20', packingDate: null, bestBeforeDate: '2026-12-20', expiryDate: '2026-12-20', batchStatus: 'AVAILABLE', statusReason: 'GRN posted — quality passed', warehouseName: 'Mumbai Plant Warehouse', originalQty: 500, currentQty: 320, uomName: 'KG', unitCost: 850, totalValue: 272000, fefoPriority: 100, storageConditions: 'Cool dry place', temperatureRange: '10-20°C', qualityGrade: 'A', qualityStatus: 'PASSED', createdByName: 'Ramesh Yadav', createdAt: '2026-06-20T10:00:00Z' },
    { id: 'bm-007', batchNumber: 'GHEE-RM-2606-A', productName: 'Ghee (Raw Material)', batchType: 'RAW_MATERIAL', supplierBatchNo: 'SUP-GHEE-2026-014', productionBatchNo: null, productionOrderId: null, supplierId: 'sup-002', supplierName: 'Anand Dairy Ltd.', manufacturingDate: '2026-06-15', packingDate: null, bestBeforeDate: '2026-09-15', expiryDate: '2026-09-15', batchStatus: 'QUARANTINED', statusReason: 'Pending quality check — fat content retest', warehouseName: 'Mumbai Plant Warehouse', originalQty: 100, currentQty: 80, uomName: 'KG', unitCost: 520, totalValue: 41600, fefoPriority: 50, storageConditions: 'Cool place', temperatureRange: '10-20°C', qualityGrade: 'B', qualityStatus: 'PENDING', createdByName: 'Ramesh Yadav', createdAt: '2026-06-15T09:30:00Z' },
    { id: 'bm-008', batchNumber: 'PKG-BOX-2607-001', productName: 'Printed Box 500g (Packaging)', batchType: 'PACKAGING_MATERIAL', supplierBatchNo: 'SUP-PKG-2026-045', productionBatchNo: null, productionOrderId: null, supplierId: 'sup-003', supplierName: 'PackPrint Industries', manufacturingDate: '2026-07-01', packingDate: null, bestBeforeDate: '2027-07-01', expiryDate: '2027-07-01', batchStatus: 'AVAILABLE', statusReason: 'Long-shelf-life packaging', warehouseName: 'Mumbai Plant Warehouse', originalQty: 10000, currentQty: 8500, uomName: 'PCS', unitCost: 8, totalValue: 68000, fefoPriority: 200, storageConditions: 'Dry place', temperatureRange: '15-30°C', qualityGrade: 'A', qualityStatus: 'PASSED', createdByName: 'Sandeep Kumar', createdAt: '2026-07-01T11:00:00Z' },
    { id: 'bm-009', batchNumber: 'KK-2606-05', productName: 'Kaju Katli 500g', batchType: 'FINISHED_GOODS', supplierBatchNo: null, productionBatchNo: 'PB-KK-2606-05', productionOrderId: 'MO-2026-0065', supplierId: null, supplierName: null, manufacturingDate: '2026-06-15', packingDate: '2026-06-16', bestBeforeDate: '2026-07-15', expiryDate: '2026-07-15', batchStatus: 'RECALLED', statusReason: 'Recall RC-2026-001 — sugar proportion issue', warehouseName: 'Mumbai DC', originalQty: 300, currentQty: 56, uomName: 'BOX', unitCost: 600, totalValue: 33600, fefoPriority: 1, storageConditions: 'Cool dry place', temperatureRange: '15-25°C', qualityGrade: 'C', qualityStatus: 'FAILED', createdByName: 'Chef Rajesh', createdAt: '2026-06-15T16:00:00Z' },
    { id: 'bm-010', batchNumber: 'SUG-RM-2606-01', productName: 'Sugar (Raw Material)', batchType: 'RAW_MATERIAL', supplierBatchNo: 'SUP-SUG-2026-021', productionBatchNo: null, productionOrderId: null, supplierId: 'sup-004', supplierName: 'EID Parry India', manufacturingDate: '2026-06-10', packingDate: null, bestBeforeDate: '2027-06-10', expiryDate: '2027-06-10', batchStatus: 'CONSUMED', statusReason: 'Fully consumed in production batches KK-2607-01 + KK-2607-02', warehouseName: 'Mumbai Plant Warehouse', originalQty: 1500, currentQty: 0, uomName: 'KG', unitCost: 45, totalValue: 0, fefoPriority: 300, storageConditions: 'Dry place', temperatureRange: '15-30°C', qualityGrade: 'A', qualityStatus: 'PASSED', createdByName: 'Ramesh Yadav', createdAt: '2026-06-10T08:00:00Z' },
  ],
  batchHistories: [
    { id: 'bh-001', batchId: 'bm-001', batchNumber: 'KK-2607-01', fromStatus: 'CREATED', toStatus: 'RELEASED', changedByName: 'QC Manager Anita', reason: 'Microbiological test passed', comments: 'Sample tested — yeast & mold within limits', referenceType: 'QUALITY_ORDER', referenceNumber: 'QC-2026-0234', changedAt: '2026-07-02T10:00:00Z' },
    { id: 'bh-002', batchId: 'bm-001', batchNumber: 'KK-2607-01', fromStatus: 'RELEASED', toStatus: 'AVAILABLE', changedByName: 'WH Manager Ramesh', reason: 'Stock putaway completed', comments: 'Moved to cold storage BIN-A-12', referenceType: 'PUTAWAY_TASK', referenceNumber: 'PA-2026-0234', changedAt: '2026-07-02T14:30:00Z' },
    { id: 'bh-003', batchId: 'bm-004', batchNumber: 'GJ-2606-12', fromStatus: 'AVAILABLE', toStatus: 'EXPIRED', changedByName: 'System Expiry Engine', reason: 'Auto-flag — expiry date crossed', comments: 'No action taken — pending destruction approval', referenceType: 'SYSTEM', referenceNumber: 'EXP-AUTO-2026-0710', changedAt: '2026-07-10T00:00:00Z' },
    { id: 'bh-004', batchId: 'bm-005', batchNumber: 'SC-2606-15', fromStatus: 'AVAILABLE', toStatus: 'BLOCKED', changedByName: 'QC Manager Anita', reason: 'Customer complaint CC-2026-0012', comments: 'Taste deviation reported — quarantining remaining stock', referenceType: 'CUSTOMER_COMPLAINT', referenceNumber: 'CC-2026-0012', changedAt: '2026-07-08T11:00:00Z' },
    { id: 'bh-005', batchId: 'bm-009', batchNumber: 'KK-2606-05', fromStatus: 'BLOCKED', toStatus: 'RECALLED', changedByName: 'CEO Vikram', reason: 'Recall RC-2026-001 authorized', comments: 'Full recall — sugar proportion issue affects all batches Jun 15-20', referenceType: 'RECALL_ORDER', referenceNumber: 'RC-2026-001', changedAt: '2026-07-08T09:00:00Z' },
  ],
  shelfLifeRules: [
    { id: 'slr-001', ruleCode: 'SL-SWEETS-30', ruleName: 'Sweets Shelf Life — 30 days', productId: null, productName: null, productCategoryId: 'cat-sweets', productType: 'FINISHED_GOODS', shelfLifeDays: 30, bestBeforeDays: 25, storageConditions: 'Cool dry place', minTemperature: 15, maxTemperature: 25, maxHumidity: 60, maxTransitDays: 5, alert30Days: false, alert15Days: true, alert7Days: true, alert3Days: true, alertToday: true, status: 'ACTIVE' },
    { id: 'slr-002', ruleCode: 'SL-NAMKEEN-45', ruleName: 'Namkeen Shelf Life — 45 days', productId: null, productName: null, productCategoryId: 'cat-namkeen', productType: 'FINISHED_GOODS', shelfLifeDays: 45, bestBeforeDays: 38, storageConditions: 'Airtight container', minTemperature: 15, maxTemperature: 25, maxHumidity: 50, maxTransitDays: 7, alert30Days: true, alert15Days: true, alert7Days: true, alert3Days: true, alertToday: true, status: 'ACTIVE' },
    { id: 'slr-003', ruleCode: 'SL-DAIRY-7', ruleName: 'Dairy Products Shelf Life — 7 days', productId: null, productName: null, productCategoryId: 'cat-dairy', productType: 'FINISHED_GOODS', shelfLifeDays: 7, bestBeforeDays: 5, storageConditions: 'Refrigerate', minTemperature: 2, maxTemperature: 8, maxHumidity: 80, maxTransitDays: 1, alert30Days: false, alert15Days: false, alert7Days: true, alert3Days: true, alertToday: true, status: 'ACTIVE' },
    { id: 'slr-004', ruleCode: 'SL-RAW-DRYFRUIT-180', ruleName: 'Raw Dry Fruits Shelf Life — 180 days', productId: null, productName: null, productCategoryId: 'cat-raw-dryfruit', productType: 'RAW_MATERIAL', shelfLifeDays: 180, bestBeforeDays: 150, storageConditions: 'Cool dry place', minTemperature: 10, maxTemperature: 20, maxHumidity: 40, maxTransitDays: 14, alert30Days: true, alert15Days: true, alert7Days: true, alert3Days: false, alertToday: true, status: 'ACTIVE' },
    { id: 'slr-005', ruleCode: 'SL-PKG-365', ruleName: 'Packaging Material Shelf Life — 365 days', productId: null, productName: null, productCategoryId: 'cat-packaging', productType: 'PACKAGING_MATERIAL', shelfLifeDays: 365, bestBeforeDays: 300, storageConditions: 'Dry place', minTemperature: 15, maxTemperature: 30, maxHumidity: 70, maxTransitDays: 30, alert30Days: true, alert15Days: false, alert7Days: false, alert3Days: false, alertToday: true, status: 'ACTIVE' },
  ],
  expiryAlerts: [
    { id: 'ea-001', batchId: 'bm-001', batchNumber: 'KK-2607-01', productName: 'Kaju Katli 500g', expiryDate: '2026-07-31', manufacturingDate: '2026-07-01', alertLevel: 'NEAR_EXPIRY', daysToExpiry: 22, quantity: 358, uomName: 'BOX', unitCost: 600, totalValue: 214800, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null, emailSent: true, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-002', batchId: 'bm-002', batchNumber: 'KK-2607-02', productName: 'Kaju Katli 500g', expiryDate: '2026-08-04', manufacturingDate: '2026-07-05', alertLevel: 'HEALTHY', daysToExpiry: 26, quantity: 380, uomName: 'BOX', unitCost: 600, totalValue: 228000, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null, emailSent: false, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-003', batchId: 'bm-003', batchNumber: 'NM-2607-03', productName: 'Mixed Namkeen 200g', expiryDate: '2026-08-17', manufacturingDate: '2026-07-03', alertLevel: 'HEALTHY', daysToExpiry: 39, quantity: 850, uomName: 'PACK', unitCost: 53, totalValue: 45050, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null, emailSent: false, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-004', batchId: 'bm-004', batchNumber: 'GJ-2606-12', productName: 'Gulab Jamun 1kg', expiryDate: '2026-07-10', manufacturingDate: '2026-06-25', alertLevel: 'EXPIRED', daysToExpiry: -1, quantity: 24, uomName: 'BOX', unitCost: 304, totalValue: 7296, warehouseName: 'Mumbai DC', status: 'ACTIVE', actionTaken: null, emailSent: true, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-005', batchId: 'bm-005', batchNumber: 'SC-2606-15', productName: 'Soan Cake 1kg', expiryDate: '2026-07-12', manufacturingDate: '2026-07-04', alertLevel: 'CRITICAL', daysToExpiry: 3, quantity: 60, uomName: 'BOX', unitCost: 625, totalValue: 37500, warehouseName: 'Mumbai DC', status: 'ACKNOWLEDGED', actionTaken: 'FEFO_PRIORITIZE', emailSent: true, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-006', batchId: 'bm-009', batchNumber: 'KK-2606-05', productName: 'Kaju Katli 500g', expiryDate: '2026-07-15', manufacturingDate: '2026-06-15', alertLevel: 'CRITICAL', daysToExpiry: 6, quantity: 56, uomName: 'BOX', unitCost: 600, totalValue: 33600, warehouseName: 'Mumbai DC', status: 'ACTIONED', actionTaken: 'RETURN_TO_SUPPLIER', emailSent: true, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-007', batchId: 'bm-006', batchNumber: 'CASHEW-RM-2606', productName: 'Cashew Nuts (Raw Material)', expiryDate: '2026-12-20', manufacturingDate: '2026-06-20', alertLevel: 'HEALTHY', daysToExpiry: 164, quantity: 320, uomName: 'KG', unitCost: 850, totalValue: 272000, warehouseName: 'Mumbai Plant Warehouse', status: 'ACTIVE', actionTaken: null, emailSent: false, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
    { id: 'ea-008', batchId: 'bm-007', batchNumber: 'GHEE-RM-2606-A', productName: 'Ghee (Raw Material)', expiryDate: '2026-09-15', manufacturingDate: '2026-06-15', alertLevel: 'HEALTHY', daysToExpiry: 68, quantity: 80, uomName: 'KG', unitCost: 520, totalValue: 41600, warehouseName: 'Mumbai Plant Warehouse', status: 'ACTIVE', actionTaken: null, emailSent: false, dashboardShown: true, createdAt: '2026-07-09T08:00:00Z' },
  ],
  productRecalls: [
    { id: 'pr-001', recallNumber: 'RC-2026-001', recallDate: '2026-07-08', recallType: 'FULL_RECALL', recallReason: 'QUALITY_ISSUE', description: 'Sugar proportion deviation in Kaju Katli batches produced between Jun 15-20. Affected batches: KK-2606-05, KK-2606-06, KK-2606-07.', complaintNumber: 'CC-2026-0012', reportedBy: 'QC Manager Anita', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', status: 'RETURNS_IN_PROGRESS', totalBatchesAffected: 3, totalQuantityRecalled: 168, totalQuantityReturned: 84, totalCustomersAffected: 12, totalValue: 100800, initiatedAt: '2026-07-08T09:00:00Z', noticeSentAt: '2026-07-08T10:30:00Z', completedAt: null, approvedByName: 'CEO Vikram', approvedAt: '2026-07-08T09:15:00Z', remarks: 'Market-wide recall. Refund + replacement offered. FSSAI notified.', createdByName: 'CEO Vikram', createdAt: '2026-07-08T09:00:00Z' },
    { id: 'pr-002', recallNumber: 'RC-2026-002', recallDate: '2026-07-06', recallType: 'PARTIAL_RECALL', recallReason: 'MISLABELING', description: '15 boxes of Kala Jamun mislabeled as Gulab Jamun in batch GJ-2607-03. Only specific shipment to Andheri retail chain affected.', complaintNumber: 'CC-2026-0008', reportedBy: 'Store Manager Pune', productId: 'prod-gj-1kg', productName: 'Gulab Jamun 1kg', status: 'COMPLETED', totalBatchesAffected: 1, totalQuantityRecalled: 15, totalQuantityReturned: 15, totalCustomersAffected: 3, totalValue: 4560, initiatedAt: '2026-07-06T11:00:00Z', noticeSentAt: '2026-07-06T12:00:00Z', completedAt: '2026-07-07T15:00:00Z', approvedByName: 'COO Anita', approvedAt: '2026-07-06T11:30:00Z', remarks: 'All 15 units recovered from 3 customers. No health impact — only labeling issue.', createdByName: 'COO Anita', createdAt: '2026-07-06T11:00:00Z' },
    { id: 'pr-003', recallNumber: 'RC-2026-003', recallDate: '2026-07-09', recallType: 'MARKET_WITHDRAWAL', recallReason: 'FOREIGN_OBJECT', description: 'Customer reported small plastic fragment in Mixed Namkeen 200g pack — batch NM-2607-01. Voluntary withdrawal initiated as precaution.', complaintNumber: 'CC-2026-0018', reportedBy: 'Customer Care Helpline', productId: 'prod-nm-200', productName: 'Mixed Namkeen 200g', status: 'INVESTIGATING', totalBatchesAffected: 1, totalQuantityRecalled: 200, totalQuantityReturned: 0, totalCustomersAffected: 1, totalValue: 10600, initiatedAt: '2026-07-09T14:00:00Z', noticeSentAt: null, completedAt: null, approvedByName: null, approvedAt: null, remarks: 'Withdrawal (not full recall) — only 1 complaint. Investigation in progress to identify source of contamination in packaging line.', createdByName: 'QC Manager Anita', createdAt: '2026-07-09T14:00:00Z' },
  ],
  recallBatches: [
    { id: 'rb-001', recallId: 'pr-001', batchId: 'bm-009', batchNumber: 'KK-2606-05', productName: 'Kaju Katli 500g', quantityProduced: 300, quantityInStock: 56, quantityDispatched: 244, quantityReturned: 56, manufacturingDate: '2026-06-15', expiryDate: '2026-07-15', status: 'RETURNED' },
    { id: 'rb-002', recallId: 'pr-001', batchId: null, batchNumber: 'KK-2606-06', productName: 'Kaju Katli 500g', quantityProduced: 280, quantityInStock: 0, quantityDispatched: 280, quantityReturned: 28, manufacturingDate: '2026-06-17', expiryDate: '2026-07-17', status: 'NOTIFIED' },
    { id: 'rb-003', recallId: 'pr-001', batchId: null, batchNumber: 'KK-2606-07', productName: 'Kaju Katli 500g', quantityProduced: 320, quantityInStock: 0, quantityDispatched: 320, quantityReturned: 0, manufacturingDate: '2026-06-19', expiryDate: '2026-07-19', status: 'IDENTIFIED' },
    { id: 'rb-004', recallId: 'pr-002', batchId: null, batchNumber: 'GJ-2607-03', productName: 'Gulab Jamun 1kg', quantityProduced: 200, quantityInStock: 80, quantityDispatched: 120, quantityReturned: 15, manufacturingDate: '2026-07-01', expiryDate: '2026-07-16', status: 'DISPOSED' },
  ],
  batchGenealogies: [
    { id: 'bg-001', fromBatchId: 'bm-006', fromBatchNumber: 'CASHEW-RM-2606', fromProductName: 'Cashew Nuts (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchId: 'bm-001', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'PRODUCED_FROM', quantityUsed: 180, uomId: 'uom-kg', productionOrderId: 'MO-2026-0089', productionDate: '2026-07-01', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'bg-002', fromBatchId: 'bm-010', fromBatchNumber: 'SUG-RM-2606-01', fromProductName: 'Sugar (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchId: 'bm-001', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'USED_IN', quantityUsed: 150, uomId: 'uom-kg', productionOrderId: 'MO-2026-0089', productionDate: '2026-07-01', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'bg-003', fromBatchId: 'bm-007', fromBatchNumber: 'GHEE-RM-2606-A', fromProductName: 'Ghee (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchId: 'bm-001', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'USED_IN', quantityUsed: 40, uomId: 'uom-kg', productionOrderId: 'MO-2026-0089', productionDate: '2026-07-01', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'bg-004', fromBatchId: 'bm-006', fromBatchNumber: 'CASHEW-RM-2606', fromProductName: 'Cashew Nuts (Raw Material)', fromBatchType: 'RAW_MATERIAL', toBatchId: 'bm-002', toBatchNumber: 'KK-2607-02', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'PRODUCED_FROM', quantityUsed: 160, uomId: 'uom-kg', productionOrderId: 'MO-2026-0090', productionDate: '2026-07-05', createdAt: '2026-07-05T17:00:00Z' },
    { id: 'bg-005', fromBatchId: 'bm-008', fromBatchNumber: 'PKG-BOX-2607-001', fromProductName: 'Printed Box 500g (Packaging)', fromBatchType: 'PACKAGING_MATERIAL', toBatchId: 'bm-001', toBatchNumber: 'KK-2607-01', toProductName: 'Kaju Katli 500g', toBatchType: 'FINISHED_GOODS', relationshipType: 'USED_IN', quantityUsed: 500, uomId: 'uom-pcs', productionOrderId: 'MO-2026-0089', productionDate: '2026-07-02', createdAt: '2026-07-02T10:00:00Z' },
  ],
}

// ─── Sprint 20: Costing & Valuation Seed Data ───────────
const COST_DATA = {
  costLayers: [
    { id: 'icl-001', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', batchId: 'bm-006', batchNumber: 'CASHEW-RM-2606', uomId: 'uom-kg', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', layerNumber: 1, receiptType: 'PURCHASE', receiptNumber: 'GRN-2026-00142', receiptDate: '2026-06-20', originalQty: 500, consumedQty: 0, remainingQty: 500, unitCost: 850, totalOriginalValue: 425000, totalConsumedValue: 0, totalRemainingValue: 425000, landedUnitCost: 901.50, hasLandedCost: true, status: 'ACTIVE', createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-07-09T08:00:00Z' },
    { id: 'icl-002', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', batchId: null, batchNumber: null, uomId: 'uom-kg', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', layerNumber: 2, receiptType: 'PURCHASE', receiptNumber: 'GRN-2026-00098', receiptDate: '2026-05-15', originalQty: 800, consumedQty: 320, remainingQty: 480, unitCost: 820, totalOriginalValue: 656000, totalConsumedValue: 262400, totalRemainingValue: 393600, landedUnitCost: 868.20, hasLandedCost: true, status: 'PARTIALLY_CONSUMED', createdAt: '2026-05-15T11:00:00Z', updatedAt: '2026-07-01T16:00:00Z' },
    { id: 'icl-003', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', batchId: null, batchNumber: null, uomId: 'uom-kg', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', layerNumber: 3, receiptType: 'PURCHASE', receiptNumber: 'GRN-2026-00071', receiptDate: '2026-04-22', originalQty: 600, consumedQty: 600, remainingQty: 0, unitCost: 780, totalOriginalValue: 468000, totalConsumedValue: 468000, totalRemainingValue: 0, landedUnitCost: 823.40, hasLandedCost: true, status: 'FULLY_CONSUMED', createdAt: '2026-04-22T09:00:00Z', updatedAt: '2026-06-20T18:00:00Z' },
    { id: 'icl-004', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', batchId: 'bm-001', batchNumber: 'KK-2607-01', uomId: 'uom-box', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'FIFO', layerNumber: 4, receiptType: 'PRODUCTION', receiptNumber: 'MO-2026-0089', receiptDate: '2026-07-01', originalQty: 500, consumedQty: 0, remainingQty: 500, unitCost: 600, totalOriginalValue: 300000, totalConsumedValue: 0, totalRemainingValue: 300000, landedUnitCost: null, hasLandedCost: false, status: 'ACTIVE', createdAt: '2026-07-01T16:00:00Z', updatedAt: '2026-07-09T08:00:00Z' },
    { id: 'icl-005', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', batchId: 'bm-002', batchNumber: 'KK-2607-02', uomId: 'uom-box', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'FIFO', layerNumber: 5, receiptType: 'PRODUCTION', receiptNumber: 'MO-2026-0090', receiptDate: '2026-07-05', originalQty: 400, consumedQty: 20, remainingQty: 380, unitCost: 580, totalOriginalValue: 232000, totalConsumedValue: 11600, totalRemainingValue: 220400, landedUnitCost: null, hasLandedCost: false, status: 'PARTIALLY_CONSUMED', createdAt: '2026-07-05T17:00:00Z', updatedAt: '2026-07-08T10:00:00Z' },
    { id: 'icl-006', productId: 'prod-ghee-raw', productName: 'Ghee (Raw Material)', batchId: 'bm-007', batchNumber: 'GHEE-RM-2606-A', uomId: 'uom-kg', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', layerNumber: 6, receiptType: 'PURCHASE', receiptNumber: 'GRN-2026-00080', receiptDate: '2026-06-15', originalQty: 100, consumedQty: 0, remainingQty: 100, unitCost: 520, totalOriginalValue: 52000, totalConsumedValue: 0, totalRemainingValue: 52000, landedUnitCost: 559, hasLandedCost: true, status: 'ACTIVE', createdAt: '2026-06-15T09:30:00Z', updatedAt: '2026-07-09T08:00:00Z' },
    { id: 'icl-007', productId: 'prod-sc-1kg', productName: 'Soan Cake 1kg', batchId: 'bm-005', batchNumber: 'SC-2606-15', uomId: 'uom-box', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'MOVING_AVERAGE', layerNumber: 7, receiptType: 'PRODUCTION', receiptNumber: 'MO-2026-0070', receiptDate: '2026-07-04', originalQty: 150, consumedQty: 0, remainingQty: 150, unitCost: 625, totalOriginalValue: 93750, totalConsumedValue: 0, totalRemainingValue: 93750, landedUnitCost: null, hasLandedCost: false, status: 'ACTIVE', createdAt: '2026-07-04T15:00:00Z', updatedAt: '2026-07-09T08:00:00Z' },
    { id: 'icl-008', productId: 'prod-gj-1kg', productName: 'Gulab Jamun 1kg', batchId: 'bm-004', batchNumber: 'GJ-2606-12', uomId: 'uom-box', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'WEIGHTED_AVERAGE', layerNumber: 8, receiptType: 'PRODUCTION', receiptNumber: 'MO-2026-0078', receiptDate: '2026-06-25', originalQty: 200, consumedQty: 176, remainingQty: 24, unitCost: 304, totalOriginalValue: 60800, totalConsumedValue: 53504, totalRemainingValue: 7296, landedUnitCost: 324, hasLandedCost: true, status: 'PARTIALLY_CONSUMED', createdAt: '2026-06-25T18:00:00Z', updatedAt: '2026-07-09T08:00:00Z' },
  ],
  costHistory: [
    { id: 'ich-001', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', unitCost: 820, totalQty: 480, totalValue: 393600, changeType: 'RECEIPT', changeReference: 'GRN-2026-00098', changeDate: '2026-05-15T11:00:00Z', previousUnitCost: 780, previousTotalValue: 468000, costVariance: 40, valueVariance: -74400, createdById: 'usr-005', createdAt: '2026-05-15T11:00:00Z' },
    { id: 'ich-002', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', unitCost: 820, totalQty: 320, totalValue: 262400, changeType: 'ISSUE', changeReference: 'MO-2026-0089', changeDate: '2026-07-01T16:00:00Z', previousUnitCost: 820, previousTotalValue: 393600, costVariance: 0, valueVariance: -131200, createdById: 'usr-005', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'ich-003', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'FIFO', unitCost: 600, totalQty: 500, totalValue: 300000, changeType: 'LANDED_COST', changeReference: 'LC-2026-002', changeDate: '2026-07-03T10:30:00Z', previousUnitCost: 580, previousTotalValue: 290000, costVariance: 20, valueVariance: 10000, createdById: 'usr-002', createdAt: '2026-07-03T10:30:00Z' },
    { id: 'ich-004', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'FIFO', unitCost: 625, totalQty: 500, totalValue: 312500, changeType: 'REVALUATION', changeReference: 'REV-2026-003', changeDate: '2026-07-06T14:00:00Z', previousUnitCost: 600, previousTotalValue: 300000, costVariance: 25, valueVariance: 12500, createdById: 'usr-001', createdAt: '2026-07-06T14:00:00Z' },
    { id: 'ich-005', productId: 'prod-ghee-raw', productName: 'Ghee (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', costingMethod: 'FIFO', unitCost: 520, totalQty: 100, totalValue: 52000, changeType: 'RECEIPT', changeReference: 'GRN-2026-00080', changeDate: '2026-06-15T09:30:00Z', previousUnitCost: 495, previousTotalValue: 49500, costVariance: 25, valueVariance: 2500, createdById: 'usr-005', createdAt: '2026-06-15T09:30:00Z' },
    { id: 'ich-006', productId: 'prod-sc-1kg', productName: 'Soan Cake 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', costingMethod: 'MOVING_AVERAGE', unitCost: 625, totalQty: 150, totalValue: 93750, changeType: 'RECEIPT', changeReference: 'MO-2026-0070', changeDate: '2026-07-04T15:00:00Z', previousUnitCost: 610, previousTotalValue: 91500, costVariance: 15, valueVariance: 2250, createdById: 'usr-003', createdAt: '2026-07-04T15:00:00Z' },
  ],
  landedCostDocuments: [
    {
      id: 'lcd-001', documentNumber: 'LC-2026-001', documentDate: '2026-06-20T10:00:00Z',
      referenceType: 'PURCHASE_ORDER', referenceNumber: 'PO-2026-0456',
      supplierId: 'sup-001', supplierName: 'Mumbai Dry Fruits Co.',
      productCost: 425000, totalLandedCost: 450250, totalAllocatedCost: 25250,
      status: 'POSTED', createdById: 'usr-005', approvedById: 'usr-002', approvedAt: '2026-06-20T12:00:00Z',
      createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-06-20T12:00:00Z',
      allocations: [
        { id: 'lca-001', documentId: 'lcd-001', costComponent: 'FREIGHT', description: 'Truck freight Mumbai→Plant', amount: 12500, currency: 'INR', allocationMethod: 'VALUE', allocationPercent: 49.50, vendorId: 'sup-014', vendorName: 'VRL Logistics', vendorInvoiceNo: 'VRL-2026-1187', isAllocated: true, allocatedAt: '2026-06-20T12:00:00Z', createdAt: '2026-06-20T10:00:00Z' },
        { id: 'lca-002', documentId: 'lcd-001', costComponent: 'INSURANCE', description: 'Marine insurance — cashew shipment', amount: 4250, currency: 'INR', allocationMethod: 'VALUE', allocationPercent: 16.83, vendorId: 'sup-021', vendorName: 'TATA AIG', vendorInvoiceNo: 'TAIG-MAR-2026-0456', isAllocated: true, allocatedAt: '2026-06-20T12:00:00Z', createdAt: '2026-06-20T10:00:00Z' },
        { id: 'lca-003', documentId: 'lcd-001', costComponent: 'CUSTOM_DUTY', description: 'Import duty — Mozambique cashew', amount: 8500, currency: 'INR', allocationMethod: 'VALUE', allocationPercent: 33.66, vendorId: 'sup-099', vendorName: 'Mumbai Customs', vendorInvoiceNo: 'CUS-2026-7741', isAllocated: true, allocatedAt: '2026-06-20T12:00:00Z', createdAt: '2026-06-20T10:00:00Z' },
      ],
    },
    {
      id: 'lcd-002', documentNumber: 'LC-2026-002', documentDate: '2026-06-15T09:30:00Z',
      referenceType: 'GRN', referenceNumber: 'GRN-2026-00080',
      supplierId: 'sup-002', supplierName: 'Anand Dairy Ltd.',
      productCost: 52000, totalLandedCost: 55900, totalAllocatedCost: 3900,
      status: 'ALLOCATED', createdById: 'usr-005', approvedById: 'usr-002', approvedAt: '2026-06-15T13:00:00Z',
      createdAt: '2026-06-15T09:30:00Z', updatedAt: '2026-06-15T13:00:00Z',
      allocations: [
        { id: 'lca-004', documentId: 'lcd-002', costComponent: 'FREIGHT', description: 'Refrigerated transport Anand→Mumbai', amount: 2600, currency: 'INR', allocationMethod: 'QUANTITY', allocationPercent: 66.67, vendorId: 'sup-014', vendorName: 'ColdEx Logistics', vendorInvoiceNo: 'CE-2026-8821', isAllocated: true, allocatedAt: '2026-06-15T13:00:00Z', createdAt: '2026-06-15T09:30:00Z' },
        { id: 'lca-005', documentId: 'lcd-002', costComponent: 'LOADING', description: 'Loading charges at Anand plant', amount: 500, currency: 'INR', allocationMethod: 'EQUAL', allocationPercent: 12.82, vendorId: null, vendorName: null, vendorInvoiceNo: null, isAllocated: true, allocatedAt: '2026-06-15T13:00:00Z', createdAt: '2026-06-15T09:30:00Z' },
        { id: 'lca-006', documentId: 'lcd-002', costComponent: 'UNLOADING', description: 'Unloading at Mumbai Plant', amount: 500, currency: 'INR', allocationMethod: 'EQUAL', allocationPercent: 12.82, vendorId: null, vendorName: null, vendorInvoiceNo: null, isAllocated: true, allocatedAt: '2026-06-15T13:00:00Z', createdAt: '2026-06-15T09:30:00Z' },
        { id: 'lca-007', documentId: 'lcd-002', costComponent: 'HANDLING', description: 'Refrigerated handling at dock', amount: 300, currency: 'INR', allocationMethod: 'EQUAL', allocationPercent: 7.69, vendorId: null, vendorName: null, vendorInvoiceNo: null, isAllocated: true, allocatedAt: '2026-06-15T13:00:00Z', createdAt: '2026-06-15T09:30:00Z' },
      ],
    },
    {
      id: 'lcd-003', documentNumber: 'LC-2026-003', documentDate: '2026-07-08T11:00:00Z',
      referenceType: 'SHIPMENT', referenceNumber: 'SHP-2026-0123',
      supplierId: null, supplierName: null,
      productCost: 60800, totalLandedCost: 64800, totalAllocatedCost: 0,
      status: 'DRAFT', createdById: 'usr-006', approvedById: null, approvedAt: null,
      createdAt: '2026-07-08T11:00:00Z', updatedAt: '2026-07-08T11:00:00Z',
      allocations: [
        { id: 'lca-008', documentId: 'lcd-003', costComponent: 'TRANSPORT', description: 'Refrigerated transport Mumbai DC→Bengaluru', amount: 3200, currency: 'INR', allocationMethod: 'WEIGHT', allocationPercent: 80, vendorId: 'sup-014', vendorName: 'SnowMan Cold Chain', vendorInvoiceNo: 'SNW-2026-4452', isAllocated: false, allocatedAt: null, createdAt: '2026-07-08T11:00:00Z' },
        { id: 'lca-009', documentId: 'lcd-003', costComponent: 'INSURANCE', description: 'Transit insurance for Gulab Jamun', amount: 800, currency: 'INR', allocationMethod: 'VALUE', allocationPercent: 20, vendorId: 'sup-021', vendorName: 'ICICI Lombard', vendorInvoiceNo: 'ICL-TRN-2026-0921', isAllocated: false, allocatedAt: null, createdAt: '2026-07-08T11:00:00Z' },
      ],
    },
  ],
  revaluations: [
    { id: 'irv-001', revaluationNumber: 'REV-2026-001', revaluationDate: '2026-07-09T10:00:00Z', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', productCategoryId: 'cat-raw-dryfruit', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', revaluationType: 'INCREASE', reason: 'Supplier price increase — new stock procured at higher rate', description: 'Q2 cashew market up 3.6% due to Mozambique crop shortage. Revaluing existing stock to current market rate.', oldUnitCost: 820, newUnitCost: 850, costDifference: 30, totalQty: 480, totalValueChange: 14400, glPostingNumber: null, glPosted: false, status: 'PENDING_APPROVAL', approvedById: null, approvedAt: null, postedAt: null, createdById: 'usr-005', createdByName: 'Ramesh Yadav', createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T10:00:00Z' },
    { id: 'irv-002', revaluationNumber: 'REV-2026-002', revaluationDate: '2026-07-07T15:00:00Z', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', productCategoryId: 'cat-sweets', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', revaluationType: 'DECREASE', reason: 'Standard cost revision — BOM optimization reduces cashew content by 4%', description: 'After R&D reformulation (BOM v2.1), standard cost reduced. Revaluing finished stock to new standard cost.', oldUnitCost: 600, newUnitCost: 580, costDifference: -20, totalQty: 380, totalValueChange: -7600, glPostingNumber: 'GL-2026-0912', glPosted: true, status: 'POSTED', approvedById: 'usr-002', approvedAt: '2026-07-07T15:30:00Z', postedAt: '2026-07-07T16:00:00Z', createdById: 'usr-003', createdByName: 'Sandeep Kumar', createdAt: '2026-07-07T15:00:00Z', updatedAt: '2026-07-07T16:00:00Z' },
    { id: 'irv-003', revaluationNumber: 'REV-2026-003', revaluationDate: '2026-07-06T14:00:00Z', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', productCategoryId: 'cat-sweets', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', revaluationType: 'MARKET_ADJUSTMENT', reason: 'Festive season demand spike — market price adjustment (Raksha Bandhan + Diwali)', description: 'Wholesale market rate up 4.2% due to festive demand. Adjusting inventory to NRV per Ind AS 2.', oldUnitCost: 600, newUnitCost: 625, costDifference: 25, totalQty: 500, totalValueChange: 12500, glPostingNumber: 'GL-2026-0905', glPosted: true, status: 'APPROVED', approvedById: 'usr-001', approvedAt: '2026-07-06T14:30:00Z', postedAt: null, createdById: 'usr-001', createdByName: 'CEO Vikram', createdAt: '2026-07-06T14:00:00Z', updatedAt: '2026-07-06T14:30:00Z' },
  ],
  glPostings: [
    { id: 'igp-001', postingNumber: 'GL-2026-0881', postingDate: '2026-06-20T12:00:00Z', sourceType: 'INVENTORY_TRANSACTION', sourceId: 'icl-001', sourceNumber: 'GRN-2026-00142', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', entryType: 'DEBIT', inventoryAccount: 'RAW_MATERIAL', offsetAccount: 'GRNI', quantity: 500, unitCost: 850, amount: 425000, description: 'Goods receipt — cashew 500 kg @ ₹850', status: 'POSTED', reversedBy: null, reversedAt: null, createdById: 'usr-005', createdAt: '2026-06-20T12:00:00Z' },
    { id: 'igp-002', postingNumber: 'GL-2026-0882', postingDate: '2026-06-20T12:00:00Z', sourceType: 'INVENTORY_TRANSACTION', sourceId: 'icl-001', sourceNumber: 'GRN-2026-00142', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', entryType: 'CREDIT', inventoryAccount: 'GRNI', offsetAccount: 'RAW_MATERIAL', quantity: 500, unitCost: 850, amount: 425000, description: 'GRNI clearing — cashew 500 kg @ ₹850', status: 'POSTED', reversedBy: null, reversedAt: null, createdById: 'usr-005', createdAt: '2026-06-20T12:00:00Z' },
    { id: 'igp-003', postingNumber: 'GL-2026-0895', postingDate: '2026-07-01T16:00:00Z', sourceType: 'INVENTORY_TRANSACTION', sourceId: 'icl-004', sourceNumber: 'MO-2026-0089', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', entryType: 'DEBIT', inventoryAccount: 'FINISHED_GOODS', offsetAccount: 'WIP', quantity: 500, unitCost: 600, amount: 300000, description: 'Production receipt — Kaju Katli 500 BOX @ ₹600', status: 'POSTED', reversedBy: null, reversedAt: null, createdById: 'usr-003', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'igp-004', postingNumber: 'GL-2026-0896', postingDate: '2026-07-01T16:00:00Z', sourceType: 'INVENTORY_TRANSACTION', sourceId: 'icl-004', sourceNumber: 'MO-2026-0089', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', entryType: 'CREDIT', inventoryAccount: 'WIP', offsetAccount: 'FINISHED_GOODS', quantity: 500, unitCost: 600, amount: 300000, description: 'WIP clearing — Kaju Katli production order MO-2026-0089', status: 'POSTED', reversedBy: null, reversedAt: null, createdById: 'usr-003', createdAt: '2026-07-01T16:00:00Z' },
    { id: 'igp-005', postingNumber: 'GL-2026-0918', postingDate: '2026-07-05T14:00:00Z', sourceType: 'INVENTORY_TRANSACTION', sourceId: null, sourceNumber: 'INV-2026-00892', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', entryType: 'DEBIT', inventoryAccount: 'COGS', offsetAccount: 'FINISHED_GOODS', quantity: 100, unitCost: 510, amount: 51000, description: 'COGS for sales invoice INV-2026-00892 — 100 BOX @ ₹510 (FIFO)', status: 'POSTED', reversedBy: null, reversedAt: null, createdById: 'usr-006', createdAt: '2026-07-05T14:00:00Z' },
    { id: 'igp-006', postingNumber: 'GL-2026-0919', postingDate: '2026-07-05T14:00:00Z', sourceType: 'INVENTORY_TRANSACTION', sourceId: null, sourceNumber: 'INV-2026-00892', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', entryType: 'CREDIT', inventoryAccount: 'FINISHED_GOODS', offsetAccount: 'COGS', quantity: 100, unitCost: 510, amount: 51000, description: 'Inventory relief for sales invoice INV-2026-00892 — 100 BOX', status: 'POSTED', reversedBy: null, reversedAt: null, createdById: 'usr-006', createdAt: '2026-07-05T14:00:00Z' },
  ],
  valuations: [
    { id: 'iv-001', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', productCategoryId: 'cat-raw-dryfruit', costingMethod: 'FIFO', onHandQty: 980, unitCost: 836.33, totalValue: 819600, abcClass: 'A', xyzClass: 'X', movementCategory: 'FAST_MOVING', daysInStock: 12, ageingCategory: '0-30', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-002', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', productCategoryId: 'cat-sweets', costingMethod: 'FIFO', onHandQty: 878, unitCost: 595.18, totalValue: 522610, abcClass: 'A', xyzClass: 'X', movementCategory: 'FAST_MOVING', daysInStock: 8, ageingCategory: '0-30', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-003', productId: 'prod-mn-200', productName: 'Mixed Namkeen 200g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', productCategoryId: 'cat-namkeen', costingMethod: 'WEIGHTED_AVERAGE', onHandQty: 850, unitCost: 53, totalValue: 45050, abcClass: 'B', xyzClass: 'Y', movementCategory: 'NORMAL', daysInStock: 45, ageingCategory: '31-60', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-004', productId: 'prod-sc-1kg', productName: 'Soan Cake 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', productCategoryId: 'cat-sweets', costingMethod: 'MOVING_AVERAGE', onHandQty: 150, unitCost: 625, totalValue: 93750, abcClass: 'B', xyzClass: 'Y', movementCategory: 'SLOW_MOVING', daysInStock: 75, ageingCategory: '61-90', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-005', productId: 'prod-gj-1kg', productName: 'Gulab Jamun 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', productCategoryId: 'cat-sweets', costingMethod: 'WEIGHTED_AVERAGE', onHandQty: 24, unitCost: 304, totalValue: 7296, abcClass: 'C', xyzClass: 'Z', movementCategory: 'DEAD_STOCK', daysInStock: 142, ageingCategory: '91-180', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-006', productId: 'prod-ghee-raw', productName: 'Ghee (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', productCategoryId: 'cat-raw-dairy', costingMethod: 'FIFO', onHandQty: 80, unitCost: 520, totalValue: 41600, abcClass: 'A', xyzClass: 'X', movementCategory: 'FAST_MOVING', daysInStock: 24, ageingCategory: '0-30', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-007', productId: 'prod-pkg-box', productName: 'Printed Box 500g (Packaging)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', productCategoryId: 'cat-packaging', costingMethod: 'MOVING_AVERAGE', onHandQty: 8500, unitCost: 8, totalValue: 68000, abcClass: 'C', xyzClass: 'X', movementCategory: 'NORMAL', daysInStock: 38, ageingCategory: '31-60', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
    { id: 'iv-008', productId: 'prod-sug-raw', productName: 'Sugar (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', productCategoryId: 'cat-raw-sugar', costingMethod: 'FIFO', onHandQty: 0, unitCost: 45, totalValue: 0, abcClass: 'C', xyzClass: 'Z', movementCategory: 'DEAD_STOCK', daysInStock: 210, ageingCategory: '180+', valuationDate: '2026-07-09T08:00:00Z', createdAt: '2026-07-09T08:00:00Z' },
  ],
}

// ─── Sprint 21: Inventory Analytics, AI Insights & Mission Control Seed Data ───
const ANALYTICS_DATA = {
  kpis: [
    { id: 'kpi-001', name: 'Inventory Turnover', code: 'INVENTORY_TURNOVER', value: 8.4, unit: 'turns/year', target: 10, targetMin: 8, targetMax: 12, trend: 'up', trendPercent: 6.2, onTarget: false, category: 'EFFICIENCY', description: 'COGS / Average Inventory — measures how many times inventory is sold & replaced in a year', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-002', name: 'Avg Days in Inventory', code: 'DAYS_IN_INVENTORY', value: 43.5, unit: 'days', target: 35, targetMin: 30, targetMax: 45, trend: 'down', trendPercent: 4.1, onTarget: true, category: 'EFFICIENCY', description: '365 / Inventory Turnover — average number of days stock sits before being sold', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-003', name: 'Inventory Accuracy', code: 'INVENTORY_ACCURACY', value: 94.2, unit: '%', target: 98, targetMin: 95, targetMax: 99, trend: 'up', trendPercent: 1.8, onTarget: false, category: 'QUALITY', description: '% of inventory locations where system qty = physical count qty (cycle count driven)', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-004', name: 'Stock Availability', code: 'STOCK_AVAILABILITY', value: 96.8, unit: '%', target: 98, targetMin: 95, targetMax: 99, trend: 'up', trendPercent: 0.9, onTarget: false, category: 'SERVICE', description: '% of order lines fulfillable from on-hand stock without backorder', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-005', name: 'Warehouse Utilization', code: 'WAREHOUSE_UTILIZATION', value: 78.5, unit: '%', target: 80, targetMin: 70, targetMax: 85, trend: 'stable', trendPercent: 0.3, onTarget: true, category: 'CAPACITY', description: 'Used storage volume / Total available storage volume across all warehouses', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-006', name: 'Stock-Out %', code: 'STOCK_OUT_PERCENT', value: 3.2, unit: '%', target: 2, targetMin: 1, targetMax: 3, trend: 'down', trendPercent: 1.1, onTarget: false, category: 'SERVICE', description: '% of SKUs with zero on-hand at the time of order — lower is better', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-007', name: 'Overstock %', code: 'OVERSTOCK_PERCENT', value: 12.4, unit: '%', target: 8, targetMin: 5, targetMax: 10, trend: 'up', trendPercent: 2.6, onTarget: false, category: 'EFFICIENCY', description: '% of SKUs where on-hand > 1.5 × reorder point — capital locked in slow movers', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-008', name: 'Damaged Stock %', code: 'DAMAGED_STOCK_PERCENT', value: 0.8, unit: '%', target: 0.5, targetMin: 0.3, targetMax: 1.0, trend: 'stable', trendPercent: 0.1, onTarget: true, category: 'QUALITY', description: 'Damage report qty / Total issued qty — warehouse handling quality indicator', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-009', name: 'Expired Stock %', code: 'EXPIRED_STOCK_PERCENT', value: 1.5, unit: '%', target: 0.8, targetMin: 0.5, targetMax: 1.2, trend: 'down', trendPercent: 0.4, onTarget: false, category: 'QUALITY', description: 'Expired batch qty / Total on-hand qty — FEFO effectiveness indicator', lastUpdated: '2026-07-09T08:00:00Z' },
    { id: 'kpi-010', name: 'Order Fill Rate', code: 'ORDER_FILL_RATE', value: 98.1, unit: '%', target: 99, targetMin: 97, targetMax: 99.5, trend: 'up', trendPercent: 0.6, onTarget: true, category: 'SERVICE', description: 'Order lines shipped complete on first attempt / Total order lines', lastUpdated: '2026-07-09T08:00:00Z' },
  ],
  ageing: [
    { id: 'age-001', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', totalQty: 980, totalValue: 819600, avgDaysInStock: 12, buckets: [
      { bucket: '0-30', qty: 850, value: 710800, percent: 86.7 },
      { bucket: '31-60', qty: 100, value: 83600, percent: 10.2 },
      { bucket: '61-90', qty: 30, value: 25200, percent: 3.1 },
      { bucket: '91-180', qty: 0, value: 0, percent: 0 },
      { bucket: '181-365', qty: 0, value: 0, percent: 0 },
      { bucket: '365+', qty: 0, value: 0, percent: 0 },
    ] },
    { id: 'age-002', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', totalQty: 878, totalValue: 522610, avgDaysInStock: 8, buckets: [
      { bucket: '0-30', qty: 820, value: 488300, percent: 93.4 },
      { bucket: '31-60', qty: 50, value: 29800, percent: 5.7 },
      { bucket: '61-90', qty: 8, value: 4510, percent: 0.9 },
      { bucket: '91-180', qty: 0, value: 0, percent: 0 },
      { bucket: '181-365', qty: 0, value: 0, percent: 0 },
      { bucket: '365+', qty: 0, value: 0, percent: 0 },
    ] },
    { id: 'age-003', productId: 'prod-mn-200', productName: 'Mixed Namkeen 200g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', totalQty: 850, totalValue: 45050, avgDaysInStock: 45, buckets: [
      { bucket: '0-30', qty: 200, value: 10600, percent: 23.5 },
      { bucket: '31-60', qty: 450, value: 23850, percent: 52.9 },
      { bucket: '61-90', qty: 150, value: 7950, percent: 17.6 },
      { bucket: '91-180', qty: 50, value: 2650, percent: 5.9 },
      { bucket: '181-365', qty: 0, value: 0, percent: 0 },
      { bucket: '365+', qty: 0, value: 0, percent: 0 },
    ] },
    { id: 'age-004', productId: 'prod-sc-1kg', productName: 'Soan Cake 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', totalQty: 150, totalValue: 93750, avgDaysInStock: 75, buckets: [
      { bucket: '0-30', qty: 30, value: 18750, percent: 20.0 },
      { bucket: '31-60', qty: 40, value: 25000, percent: 26.7 },
      { bucket: '61-90', qty: 60, value: 37500, percent: 40.0 },
      { bucket: '91-180', qty: 20, value: 12500, percent: 13.3 },
      { bucket: '181-365', qty: 0, value: 0, percent: 0 },
      { bucket: '365+', qty: 0, value: 0, percent: 0 },
    ] },
    { id: 'age-005', productId: 'prod-gj-1kg', productName: 'Gulab Jamun 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', totalQty: 24, totalValue: 7296, avgDaysInStock: 142, buckets: [
      { bucket: '0-30', qty: 0, value: 0, percent: 0 },
      { bucket: '31-60', qty: 0, value: 0, percent: 0 },
      { bucket: '61-90', qty: 4, value: 1216, percent: 16.7 },
      { bucket: '91-180', qty: 14, value: 4256, percent: 58.3 },
      { bucket: '181-365', qty: 6, value: 1824, percent: 25.0 },
      { bucket: '365+', qty: 0, value: 0, percent: 0 },
    ] },
    { id: 'age-006', productId: 'prod-sug-raw', productName: 'Sugar (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', totalQty: 0, totalValue: 0, avgDaysInStock: 210, buckets: [
      { bucket: '0-30', qty: 0, value: 0, percent: 0 },
      { bucket: '31-60', qty: 0, value: 0, percent: 0 },
      { bucket: '61-90', qty: 0, value: 0, percent: 0 },
      { bucket: '91-180', qty: 0, value: 0, percent: 0 },
      { bucket: '181-365', qty: 0, value: 0, percent: 0 },
      { bucket: '365+', qty: 0, value: 0, percent: 0 },
    ] },
  ],
  classifications: [
    { id: 'cls-001', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', abcClass: 'A', xyzClass: 'X', fsnClass: 'FAST', combinedClass: 'AX', valuePercent: 49.5, annualConsumptionValue: 6234520, demandVariability: 0.12, lastMovementDate: '2026-07-09', daysSinceLastMovement: 0, totalQty: 980, unitCost: 836.33, totalValue: 819600, classificationDate: '2026-07-09' },
    { id: 'cls-002', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', abcClass: 'A', xyzClass: 'X', fsnClass: 'FAST', combinedClass: 'AX', valuePercent: 31.6, annualConsumptionValue: 3975000, demandVariability: 0.18, lastMovementDate: '2026-07-08', daysSinceLastMovement: 1, totalQty: 878, unitCost: 595.18, totalValue: 522610, classificationDate: '2026-07-09' },
    { id: 'cls-003', productId: 'prod-ghee-raw', productName: 'Ghee (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', abcClass: 'A', xyzClass: 'Y', fsnClass: 'FAST', combinedClass: 'AY', valuePercent: 2.5, annualConsumptionValue: 312000, demandVariability: 0.34, lastMovementDate: '2026-07-07', daysSinceLastMovement: 2, totalQty: 80, unitCost: 520, totalValue: 41600, classificationDate: '2026-07-09' },
    { id: 'cls-004', productId: 'prod-sc-1kg', productName: 'Soan Cake 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', abcClass: 'B', xyzClass: 'Y', fsnClass: 'SLOW', combinedClass: 'BY', valuePercent: 5.7, annualConsumptionValue: 712500, demandVariability: 0.42, lastMovementDate: '2026-06-25', daysSinceLastMovement: 14, totalQty: 150, unitCost: 625, totalValue: 93750, classificationDate: '2026-07-09' },
    { id: 'cls-005', productId: 'prod-mn-200', productName: 'Mixed Namkeen 200g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', abcClass: 'B', xyzClass: 'Y', fsnClass: 'SLOW', combinedClass: 'BY', valuePercent: 2.7, annualConsumptionValue: 342000, demandVariability: 0.38, lastMovementDate: '2026-07-05', daysSinceLastMovement: 4, totalQty: 850, unitCost: 53, totalValue: 45050, classificationDate: '2026-07-09' },
    { id: 'cls-006', productId: 'prod-pkg-box', productName: 'Printed Box 500g (Packaging)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', abcClass: 'C', xyzClass: 'X', fsnClass: 'FAST', combinedClass: 'CX', valuePercent: 4.1, annualConsumptionValue: 516000, demandVariability: 0.15, lastMovementDate: '2026-07-09', daysSinceLastMovement: 0, totalQty: 8500, unitCost: 8, totalValue: 68000, classificationDate: '2026-07-09' },
    { id: 'cls-007', productId: 'prod-gj-1kg', productName: 'Gulab Jamun 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', abcClass: 'C', xyzClass: 'Z', fsnClass: 'NON_MOVING', combinedClass: 'CZ', valuePercent: 0.4, annualConsumptionValue: 52320, demandVariability: 0.89, lastMovementDate: '2026-02-18', daysSinceLastMovement: 141, totalQty: 24, unitCost: 304, totalValue: 7296, classificationDate: '2026-07-09' },
    { id: 'cls-008', productId: 'prod-sug-raw', productName: 'Sugar (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', abcClass: 'C', xyzClass: 'Z', fsnClass: 'NON_MOVING', combinedClass: 'CZ', valuePercent: 0.0, annualConsumptionValue: 0, demandVariability: 1.0, lastMovementDate: '2025-12-11', daysSinceLastMovement: 210, totalQty: 0, unitCost: 45, totalValue: 0, classificationDate: '2026-07-09' },
  ],
  reorderRules: [
    { id: 'rr-001', productId: 'prod-cas-raw', productName: 'Cashew Nuts (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', supplierName: 'Mumbai Dry Fruits Co.', minStock: 200, maxStock: 1500, safetyStock: 150, reorderPoint: 350, reorderQty: 800, currentStock: 980, leadTimeDays: 7, avgDailyConsumption: 28, daysOfSupply: 35, suggestedReorderQty: 0, urgency: 'OK', lastReorderDate: '2026-06-20', expectedDelivery: '2026-06-27', rule: 'Reorder when stock ≤ 350 (safety + 7 days × 28/day) → buy 800 kg' },
    { id: 'rr-002', productId: 'prod-kk-500', productName: 'Kaju Katli 500g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', supplierName: 'In-house Production', minStock: 150, maxStock: 1200, safetyStock: 100, reorderPoint: 280, reorderQty: 500, currentStock: 175, leadTimeDays: 2, avgDailyConsumption: 65, daysOfSupply: 2.7, suggestedReorderQty: 605, urgency: 'CRITICAL', lastReorderDate: '2026-07-01', expectedDelivery: '2026-07-11', rule: 'Production MO triggered when FG ≤ 280 (safety + 2 days × 65/day) → run MO for 500 boxes' },
    { id: 'rr-003', productId: 'prod-ghee-raw', productName: 'Ghee (Raw Material)', warehouseId: 'wh-001', warehouseName: 'Mumbai Plant Warehouse', supplierName: 'Anand Dairy Ltd.', minStock: 40, maxStock: 200, safetyStock: 30, reorderPoint: 60, reorderQty: 100, currentStock: 80, leadTimeDays: 5, avgDailyConsumption: 6, daysOfSupply: 13.3, suggestedReorderQty: 0, urgency: 'OK', lastReorderDate: '2026-06-15', expectedDelivery: '2026-06-20', rule: 'Reorder when stock ≤ 60 (safety + 5 days × 6/day) → buy 100 kg' },
    { id: 'rr-004', productId: 'prod-sc-1kg', productName: 'Soan Cake 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', supplierName: 'In-house Production', minStock: 60, maxStock: 400, safetyStock: 50, reorderPoint: 90, reorderQty: 200, currentStock: 150, leadTimeDays: 3, avgDailyConsumption: 8, daysOfSupply: 18.8, suggestedReorderQty: 0, urgency: 'LOW', lastReorderDate: '2026-07-04', expectedDelivery: '2026-07-07', rule: 'Production MO when stock ≤ 90 → run MO for 200 boxes' },
    { id: 'rr-005', productId: 'prod-mn-200', productName: 'Mixed Namkeen 200g', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', supplierName: 'In-house Production', minStock: 200, maxStock: 1500, safetyStock: 150, reorderPoint: 400, reorderQty: 700, currentStock: 850, leadTimeDays: 2, avgDailyConsumption: 22, daysOfSupply: 38.6, suggestedReorderQty: 0, urgency: 'OK', lastReorderDate: '2026-06-20', expectedDelivery: '2026-06-22', rule: 'Production MO when stock ≤ 400 → run MO for 700 pouches' },
    { id: 'rr-006', productId: 'prod-gj-1kg', productName: 'Gulab Jamun 1kg', warehouseId: 'wh-002', warehouseName: 'Mumbai DC', supplierName: 'In-house Production', minStock: 20, maxStock: 150, safetyStock: 25, reorderPoint: 50, reorderQty: 100, currentStock: 24, leadTimeDays: 3, avgDailyConsumption: 4, daysOfSupply: 6.0, suggestedReorderQty: 100, urgency: 'HIGH', lastReorderDate: '2026-06-25', expectedDelivery: '2026-06-28', rule: 'Production MO when stock ≤ 50 → run MO for 100 boxes (currently below reorder point)' },
  ],
  missionControl: {
    id: 'mcs-2026-07-09',
    snapshotDate: '2026-07-09T08:00:00Z',
    headline: 'PART 3 COMPLETE — Enterprise Inventory Engine 21/21 sprints delivered',
    inventory: {
      totalInventoryValue: 1656006,
      totalSkuCount: 8,
      activeBatches: 24,
      activeWarehouses: 2,
      totalOnHandQty: 11462,
      avgDaysInStock: 21.3,
    },
    operations: {
      todaysTransactions: 142,
      pendingApprovals: 7,
      openPutawayTasks: 12,
      openPickingTasks: 18,
      openReceivingTasks: 5,
      openTransfers: 3,
    },
    alerts: {
      expiredStock: 18,
      nearExpiry7Days: 24,
      blockedBatches: 3,
      quarantinedItems: 5,
      deadStockItems: 2,
      stockOutItems: 1,
    },
    recalls: {
      activeRecalls: 1,
      affectedBatches: 2,
      recalledQty: 280,
      affectedCustomers: 14,
    },
    reorder: {
      criticalItems: 1,
      highItems: 1,
      mediumItems: 0,
      lowItems: 1,
      okItems: 3,
      totalReorderValue: 184800,
    },
    kpis: {
      inventoryTurnover: 8.4,
      inventoryAccuracy: 94.2,
      stockAvailability: 96.8,
      warehouseUtilization: 78.5,
      orderFillRate: 98.1,
      stockOutPercent: 3.2,
      overstockPercent: 12.4,
      expiredStockPercent: 1.5,
    },
    classification: {
      classAItems: 3,
      classBItems: 2,
      classCItems: 3,
      fastMovingItems: 4,
      slowMovingItems: 2,
      nonMovingItems: 2,
      deadStockValue: 7296,
    },
    generatedAt: '2026-07-09T08:00:00Z',
    generatedBy: 'system-scheduler',
  },
  reports: [
    { id: 'rpt-001', reportType: 'INVENTORY_VALUATION', title: 'Monthly Inventory Valuation Report — July 2026', description: 'Period-end inventory valuation by costing method, ABC class, warehouse & product category. Reconciled to GL Inventory Asset account.', status: 'READY', format: 'PDF', generatedAt: '2026-07-09T06:00:00Z', generatedBy: 'CFO Anjali Mehta', fileSize: '2.4 MB', pageCount: 48, summary: 'Total inventory value ₹16.56L across 8 SKUs. FIFO layers ₹12.41L (74.9%), Weighted Avg ₹0.45L (2.7%), Moving Avg ₹3.70L (22.4%). Class A items hold 83.6% of value.' },
    { id: 'rpt-002', reportType: 'ABC_REPORT', title: 'ABC/XYZ/FSN Classification Report — Q2 2026', description: 'Pareto-based ABC (value), XYZ (demand variability), FSN (movement) classification with combined class matrix for all SKUs.', status: 'READY', format: 'XLSX', generatedAt: '2026-07-08T17:30:00Z', generatedBy: 'Supply Chain Head Rohit Kumar', fileSize: '512 KB', pageCount: 12, summary: '3 Class A items (49.5% + 31.6% + 2.5% = 83.6% value), 2 Class B (8.4% value), 3 Class C (8.0% value). 2 NON_MOVING CZ items flagged for write-off review.' },
    { id: 'rpt-003', reportType: 'DEAD_STOCK', title: 'Dead Stock & Slow-Mover Analysis — H1 2026', description: 'Items with zero consumption in 180+ days. Includes value-at-risk, last movement date, suggested action (write-off / discount / scrap).', status: 'PENDING', format: 'PDF', generatedAt: null, generatedBy: null, fileSize: null, pageCount: null, summary: null },
    { id: 'rpt-004', reportType: 'NEAR_EXPIRY', title: 'Near-Expiry & FEFO Compliance Report — July 2026', description: 'Batches expiring in next 7/15/30 days. FEFO adherence %, blocked batches, expiry disposal recommendations.', status: 'SCHEDULED', format: 'PDF', generatedAt: null, generatedBy: null, fileSize: null, pageCount: null, summary: null },
  ],
}

// ─── Sprint 22: Warehouse Foundation Seed Data (PART 4 BEGINS) ───
// Chief Architect recommendation: 6-warehouse multi-tier Mumbai architecture
const WH_DATA = {
  warehouses: [
    {
      id: 'wh-rm-mum',
      warehouseCode: 'WH-RM-MUM',
      warehouseName: 'Raw Material Warehouse',
      description: 'Stores incoming raw materials (cashew, sugar, ghee, flour) for Mumbai production plant. FEFO + quarantine enforced.',
      warehouseType: 'RAW_MATERIAL',
      companyId: 'co-suop-01',
      companyName: 'SUOP Sweets Pvt. Ltd.',
      branchId: 'br-mum-plant',
      branchName: 'Mumbai Plant',
      managerId: 'emp-rm-01',
      managerName: 'Rajesh Patel',
      addressLine1: 'Plot 14, MIDC Industrial Area',
      addressLine2: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400093',
      phone: '+91-22-2851-2000',
      email: 'rm.warehouse@suop.in',
      timezone: 'Asia/Kolkata',
      barcodeEnabled: true,
      fifoEnabled: false,
      fefoEnabled: true,
      qualityInspectionRequired: true,
      defaultPickingStrategy: 'FEFO',
      defaultPutawayStrategy: 'FEFO',
      defaultUom: 'KG',
      totalVolumeM3: 4500.00,
      totalWeightKg: 250000.00,
      totalPalletPositions: 600,
      totalBins: 4800,
      operatingHoursStart: '06:00',
      operatingHoursEnd: '22:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
      status: 'ACTIVE',
      statusReason: null,
    },
    {
      id: 'wh-pkg-mum',
      warehouseCode: 'WH-PKG-MUM',
      warehouseName: 'Packaging Warehouse',
      description: 'Stores packaging materials (printed boxes, films, labels, pouches) for Mumbai plant. Bulk storage with barcode tracking.',
      warehouseType: 'PACKAGING',
      companyId: 'co-suop-01',
      companyName: 'SUOP Sweets Pvt. Ltd.',
      branchId: 'br-mum-plant',
      branchName: 'Mumbai Plant',
      managerId: 'emp-pkg-01',
      managerName: 'Sneha Kulkarni',
      addressLine1: 'Plot 14, MIDC Industrial Area',
      addressLine2: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400093',
      phone: '+91-22-2851-2001',
      email: 'pkg.warehouse@suop.in',
      timezone: 'Asia/Kolkata',
      barcodeEnabled: true,
      fifoEnabled: true,
      fefoEnabled: false,
      qualityInspectionRequired: false,
      defaultPickingStrategy: 'FIFO',
      defaultPutawayStrategy: 'FIFO',
      defaultUom: 'EA',
      totalVolumeM3: 2200.00,
      totalWeightKg: 80000.00,
      totalPalletPositions: 280,
      totalBins: 2200,
      operatingHoursStart: '07:00',
      operatingHoursEnd: '19:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
      status: 'ACTIVE',
      statusReason: null,
    },
    {
      id: 'wh-fg-mum',
      warehouseCode: 'WH-FG-MUM',
      warehouseName: 'Finished Goods Warehouse',
      description: 'Stores finished sweets & namkeen produced at Mumbai plant before dispatch to DCs. FEFO strictly enforced for shelf-life compliance.',
      warehouseType: 'FINISHED_GOODS',
      companyId: 'co-suop-01',
      companyName: 'SUOP Sweets Pvt. Ltd.',
      branchId: 'br-mum-plant',
      branchName: 'Mumbai Plant',
      managerId: 'emp-fg-01',
      managerName: 'Anil Deshpande',
      addressLine1: 'Plot 14, MIDC Industrial Area',
      addressLine2: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400093',
      phone: '+91-22-2851-2002',
      email: 'fg.warehouse@suop.in',
      timezone: 'Asia/Kolkata',
      barcodeEnabled: true,
      fifoEnabled: false,
      fefoEnabled: true,
      qualityInspectionRequired: true,
      defaultPickingStrategy: 'FEFO',
      defaultPutawayStrategy: 'FEFO',
      defaultUom: 'EA',
      totalVolumeM3: 3800.00,
      totalWeightKg: 180000.00,
      totalPalletPositions: 500,
      totalBins: 4000,
      operatingHoursStart: '06:00',
      operatingHoursEnd: '23:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT,SUN',
      status: 'ACTIVE',
      statusReason: null,
    },
    {
      id: 'wh-qua-mum',
      warehouseCode: 'WH-QUA-MUM',
      warehouseName: 'Quarantine Warehouse',
      description: 'Holds incoming raw materials & FG awaiting quality inspection/release. Access restricted to QA team. Auto-release on pass, scrap on fail.',
      warehouseType: 'QUARANTINE',
      companyId: 'co-suop-01',
      companyName: 'SUOP Sweets Pvt. Ltd.',
      branchId: 'br-mum-plant',
      branchName: 'Mumbai Plant',
      managerId: 'emp-qa-01',
      managerName: 'Priya Nair',
      addressLine1: 'Plot 14, MIDC Industrial Area',
      addressLine2: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400093',
      phone: '+91-22-2851-2003',
      email: 'qa.warehouse@suop.in',
      timezone: 'Asia/Kolkata',
      barcodeEnabled: true,
      fifoEnabled: false,
      fefoEnabled: true,
      qualityInspectionRequired: true,
      defaultPickingStrategy: 'FEFO',
      defaultPutawayStrategy: 'FEFO',
      defaultUom: 'KG',
      totalVolumeM3: 800.00,
      totalWeightKg: 40000.00,
      totalPalletPositions: 100,
      totalBins: 800,
      operatingHoursStart: '08:00',
      operatingHoursEnd: '20:00',
      workingDays: 'MON,TUE,WED,THU,FRI',
      status: 'ACTIVE',
      statusReason: null,
    },
    {
      id: 'wh-ret-mum-dc',
      warehouseCode: 'WH-RET-MUM-DC',
      warehouseName: 'Returns Warehouse',
      description: 'Processes customer returns from Mumbai Distribution Center. Sorted by reason (damaged, expired, recall), then routed to scrap/quarantine/restock.',
      warehouseType: 'RETURNS',
      companyId: 'co-suop-01',
      companyName: 'SUOP Sweets Pvt. Ltd.',
      branchId: 'br-mum-dc',
      branchName: 'Mumbai DC',
      managerId: 'emp-ret-01',
      managerName: 'Vikas Shetty',
      addressLine1: 'B Wing, Logistics Park',
      addressLine2: 'Bhiwandi',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      country: 'India',
      pincode: '421302',
      phone: '+91-22-2541-3000',
      email: 'returns.mumdc@suop.in',
      timezone: 'Asia/Kolkata',
      barcodeEnabled: true,
      fifoEnabled: false,
      fefoEnabled: true,
      qualityInspectionRequired: true,
      defaultPickingStrategy: 'FEFO',
      defaultPutawayStrategy: 'FEFO',
      defaultUom: 'EA',
      totalVolumeM3: 1200.00,
      totalWeightKg: 60000.00,
      totalPalletPositions: 150,
      totalBins: 1200,
      operatingHoursStart: '09:00',
      operatingHoursEnd: '18:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
      status: 'ACTIVE',
      statusReason: null,
    },
    {
      id: 'wh-scr-mum-dc',
      warehouseCode: 'WH-SCR-MUM-DC',
      warehouseName: 'Scrap Warehouse',
      description: 'Holds expired, damaged, recalled, and condemned stock pending disposal. Heavily restricted access; requires finance approval for write-off.',
      warehouseType: 'SCRAP',
      companyId: 'co-suop-01',
      companyName: 'SUOP Sweets Pvt. Ltd.',
      branchId: 'br-mum-dc',
      branchName: 'Mumbai DC',
      managerId: 'emp-scr-01',
      managerName: 'Mahesh Iyer',
      addressLine1: 'C Wing, Logistics Park',
      addressLine2: 'Bhiwandi',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      country: 'India',
      pincode: '421302',
      phone: '+91-22-2541-3001',
      email: 'scrap.mumdc@suop.in',
      timezone: 'Asia/Kolkata',
      barcodeEnabled: true,
      fifoEnabled: false,
      fefoEnabled: false,
      qualityInspectionRequired: false,
      defaultPickingStrategy: 'FIFO',
      defaultPutawayStrategy: 'FIFO',
      defaultUom: 'KG',
      totalVolumeM3: 500.00,
      totalWeightKg: 25000.00,
      totalPalletPositions: 60,
      totalBins: 480,
      operatingHoursStart: '09:00',
      operatingHoursEnd: '17:00',
      workingDays: 'MON,TUE,WED,THU,FRI',
      status: 'MAINTENANCE',
      statusReason: 'Annual pest-control & deep cleaning scheduled 11-13 July 2026',
    },
  ],
  zones: [
    { id: 'zn-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-01', zoneName: 'Receiving Zone', zoneType: 'RECEIVING', parentZoneId: null, displayOrder: 10, temperatureZoneId: null, tempZoneType: null, volumeM3: 400.00, weightCapacityKg: 30000.00, palletPositions: 50, binCount: 100, isRestricted: false, accessRequired: false, status: 'ACTIVE' },
    { id: 'zn-002', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-02', zoneName: 'Putaway Zone', zoneType: 'PUTAWAY', parentZoneId: 'zn-001', displayOrder: 20, temperatureZoneId: null, tempZoneType: null, volumeM3: 200.00, weightCapacityKg: 15000.00, palletPositions: 25, binCount: 50, isRestricted: false, accessRequired: false, status: 'ACTIVE' },
    { id: 'zn-003', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', zoneType: 'STORAGE', parentZoneId: null, displayOrder: 30, temperatureZoneId: 'tz-001', tempZoneType: 'AMBIENT', volumeM3: 2400.00, weightCapacityKg: 180000.00, palletPositions: 320, binCount: 2560, isRestricted: false, accessRequired: false, status: 'ACTIVE' },
    { id: 'zn-004', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold', zoneType: 'STORAGE', parentZoneId: null, displayOrder: 40, temperatureZoneId: 'tz-002', tempZoneType: 'CHILLED', volumeM3: 800.00, weightCapacityKg: 30000.00, palletPositions: 100, binCount: 800, isRestricted: true, accessRequired: true, status: 'ACTIVE' },
    { id: 'zn-005', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', zoneType: 'PICKING', parentZoneId: null, displayOrder: 50, temperatureZoneId: null, tempZoneType: null, volumeM3: 600.00, weightCapacityKg: 24000.00, palletPositions: 80, binCount: 800, isRestricted: false, accessRequired: false, status: 'ACTIVE' },
    { id: 'zn-006', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-02', zoneName: 'Packing Zone', zoneType: 'PACKING', parentZoneId: null, displayOrder: 60, temperatureZoneId: null, tempZoneType: null, volumeM3: 400.00, weightCapacityKg: 16000.00, palletPositions: 50, binCount: 200, isRestricted: false, accessRequired: false, status: 'ACTIVE' },
    { id: 'zn-007', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-03', zoneName: 'Dispatch Zone', zoneType: 'DISPATCH', parentZoneId: null, displayOrder: 70, temperatureZoneId: null, tempZoneType: null, volumeM3: 500.00, weightCapacityKg: 20000.00, palletPositions: 70, binCount: 100, isRestricted: false, accessRequired: false, status: 'ACTIVE' },
    { id: 'zn-008', warehouseId: 'wh-qua-mum', warehouseCode: 'WH-QUA-MUM', warehouseName: 'Quarantine Warehouse', zoneCode: 'Z-QU-01', zoneName: 'Quarantine Zone', zoneType: 'QUARANTINE', parentZoneId: null, displayOrder: 80, temperatureZoneId: null, tempZoneType: null, volumeM3: 600.00, weightCapacityKg: 30000.00, palletPositions: 80, binCount: 600, isRestricted: true, accessRequired: true, status: 'ACTIVE' },
    { id: 'zn-009', warehouseId: 'wh-qua-mum', warehouseCode: 'WH-QUA-MUM', warehouseName: 'Quarantine Warehouse', zoneCode: 'Z-QU-02', zoneName: 'Quality Inspection Zone', zoneType: 'QUALITY_INSPECTION', parentZoneId: 'zn-008', displayOrder: 90, temperatureZoneId: null, tempZoneType: null, volumeM3: 200.00, weightCapacityKg: 10000.00, palletPositions: 20, binCount: 40, isRestricted: true, accessRequired: true, status: 'ACTIVE' },
    { id: 'zn-010', warehouseId: 'wh-ret-mum-dc', warehouseCode: 'WH-RET-MUM-DC', warehouseName: 'Returns Warehouse', zoneCode: 'Z-RT-01', zoneName: 'Damaged Goods Zone', zoneType: 'DAMAGED_GOODS', parentZoneId: null, displayOrder: 100, temperatureZoneId: null, tempZoneType: null, volumeM3: 300.00, weightCapacityKg: 15000.00, palletPositions: 40, binCount: 200, isRestricted: true, accessRequired: true, status: 'ACTIVE' },
  ],
  temperatureZones: [
    { id: 'tz-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'TZ-AMB-01', zoneName: 'Ambient Storage', tempZoneType: 'AMBIENT', minTemperature: 15.00, maxTemperature: 30.00, targetTemperature: 22.00, minHumidity: 30.00, maxHumidity: 60.00, targetHumidity: 45.00, alertThresholdMin: 2.00, alertThresholdMax: 2.00, isActive: true, lastReading: 23.50, lastReadingAt: '2026-07-09T07:45:00Z', status: 'ACTIVE' },
    { id: 'tz-002', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'TZ-CHL-01', zoneName: 'Chilled Storage (Perishables)', tempZoneType: 'CHILLED', minTemperature: 2.00, maxTemperature: 8.00, targetTemperature: 4.00, minHumidity: 50.00, maxHumidity: 75.00, targetHumidity: 60.00, alertThresholdMin: 1.00, alertThresholdMax: 1.50, isActive: true, lastReading: 5.20, lastReadingAt: '2026-07-09T07:50:00Z', status: 'ACTIVE' },
    { id: 'tz-003', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'TZ-FRZ-01', zoneName: 'Frozen Storage (Ice Cream Line)', tempZoneType: 'FROZEN', minTemperature: -25.00, maxTemperature: -18.00, targetTemperature: -22.00, minHumidity: 40.00, maxHumidity: 60.00, targetHumidity: 50.00, alertThresholdMin: 1.00, alertThresholdMax: 2.00, isActive: true, lastReading: -21.80, lastReadingAt: '2026-07-09T07:55:00Z', status: 'ACTIVE' },
    { id: 'tz-004', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'TZ-HUM-01', zoneName: 'Humidity-Controlled Storage (Dry Sweets)', tempZoneType: 'HUMIDITY_CONTROLLED', minTemperature: 18.00, maxTemperature: 25.00, targetTemperature: 20.00, minHumidity: 35.00, maxHumidity: 50.00, targetHumidity: 40.00, alertThresholdMin: 2.00, alertThresholdMax: 3.00, isActive: true, lastReading: 21.40, lastReadingAt: '2026-07-09T08:00:00Z', status: 'ACTIVE' },
  ],
  temperatureLogs: [
    { id: 'tlog-001', temperatureZoneId: 'tz-001', tempZoneType: 'AMBIENT', zoneName: 'Ambient Storage', warehouseCode: 'WH-RM-MUM', temperature: 23.50, humidity: 48.00, isAlert: false, alertType: null, alertMessage: null, sensorId: 'SNR-AMB-01', sensorLocation: 'Z-RM-03 / Rack 2 / Shelf 3', recordedAt: '2026-07-09T07:45:00Z' },
    { id: 'tlog-002', temperatureZoneId: 'tz-002', tempZoneType: 'CHILLED', zoneName: 'Chilled Storage (Perishables)', warehouseCode: 'WH-RM-MUM', temperature: 9.40, humidity: 62.00, isAlert: true, alertType: 'HIGH_TEMP', alertMessage: 'Temperature 9.40°C exceeds max threshold 8.00°C by 1.40°C. Chiller unit #2 may be failing.', sensorId: 'SNR-CHL-02', sensorLocation: 'Z-RM-04 / Rack 1 / Shelf 1', recordedAt: '2026-07-09T07:50:00Z' },
    { id: 'tlog-003', temperatureZoneId: 'tz-003', tempZoneType: 'FROZEN', zoneName: 'Frozen Storage (Ice Cream Line)', warehouseCode: 'WH-FG-MUM', temperature: -21.80, humidity: 52.00, isAlert: false, alertType: null, alertMessage: null, sensorId: 'SNR-FRZ-01', sensorLocation: 'Z-FG-FRZ / Rack 4 / Shelf 1', recordedAt: '2026-07-09T07:55:00Z' },
    { id: 'tlog-004', temperatureZoneId: 'tz-004', tempZoneType: 'HUMIDITY_CONTROLLED', zoneName: 'Humidity-Controlled Storage (Dry Sweets)', warehouseCode: 'WH-FG-MUM', temperature: 21.40, humidity: 54.00, isAlert: true, alertType: 'HIGH_HUMIDITY', alertMessage: 'Humidity 54% exceeds max threshold 50% by 4%. Dehumidifier check recommended.', sensorId: 'SNR-HUM-01', sensorLocation: 'Z-FG-HUM / Rack 1 / Shelf 2', recordedAt: '2026-07-09T08:00:00Z' },
  ],
  capacity: [
    { id: 'wcap-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: null, totalVolume: 4500.00, usedVolume: 3285.00, availableVolume: 1215.00, reservedVolume: 200.00, totalWeight: 250000.00, usedWeight: 178500.00, availableWeight: 71500.00, totalPallets: 600, usedPallets: 472, availablePallets: 128, totalBins: 4800, usedBins: 3696, availableBins: 1104, utilizationPercent: 73.00, snapshotDate: '2026-07-09T08:00:00Z' },
    { id: 'wcap-002', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneId: null, totalVolume: 3800.00, usedVolume: 3078.00, availableVolume: 722.00, reservedVolume: 150.00, totalWeight: 180000.00, usedWeight: 136800.00, availableWeight: 43200.00, totalPallets: 500, usedPallets: 405, availablePallets: 95, totalBins: 4000, usedBins: 3280, availableBins: 720, utilizationPercent: 81.00, snapshotDate: '2026-07-09T08:00:00Z' },
    { id: 'wcap-003', warehouseId: 'wh-pkg-mum', warehouseCode: 'WH-PKG-MUM', warehouseName: 'Packaging Warehouse', zoneId: null, totalVolume: 2200.00, usedVolume: 1188.00, availableVolume: 1012.00, reservedVolume: 100.00, totalWeight: 80000.00, usedWeight: 41600.00, availableWeight: 38400.00, totalPallets: 280, usedPallets: 154, availablePallets: 126, totalBins: 2200, usedBins: 1188, availableBins: 1012, utilizationPercent: 54.00, snapshotDate: '2026-07-09T08:00:00Z' },
  ],
  calendar: [
    { id: 'wcal-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', calendarDate: '2026-07-13', dayType: 'WORKING_DAY', startTime: '06:00', endTime: '22:00', shift1Start: '06:00', shift1End: '14:00', shift2Start: '14:00', shift2End: '22:00', shift3Start: null, shift3End: null, description: 'Regular working day — 2 shifts', isClosed: false },
    { id: 'wcal-002', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', calendarDate: '2026-08-15', dayType: 'HOLIDAY', startTime: null, endTime: null, shift1Start: null, shift1End: null, shift2Start: null, shift2End: null, shift3Start: null, shift3End: null, description: 'Independence Day — closed', isClosed: true },
    { id: 'wcal-003', warehouseId: 'wh-scr-mum-dc', warehouseCode: 'WH-SCR-MUM-DC', warehouseName: 'Scrap Warehouse', calendarDate: '2026-07-11', dayType: 'MAINTENANCE', startTime: '08:00', endTime: '12:00', shift1Start: '08:00', shift1End: '12:00', shift2Start: null, shift2End: null, shift3Start: null, shift3End: null, description: 'Annual pest-control & deep cleaning (11-13 July)', isClosed: true },
  ],
  accessRules: [
    { id: 'war-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', userRole: 'WAREHOUSE_MANAGER', canReceive: true, canPutaway: true, canPick: true, canPack: true, canDispatch: true, canAdjust: true, canCount: true, canAccessRestricted: true, canAccessColdStorage: true, restrictedZoneIds: [], status: 'ACTIVE' },
    { id: 'war-002', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', userRole: 'OPERATOR', canReceive: true, canPutaway: true, canPick: true, canPack: false, canDispatch: false, canAdjust: false, canCount: false, canAccessRestricted: false, canAccessColdStorage: false, restrictedZoneIds: ['zn-004'], status: 'ACTIVE' },
    { id: 'war-003', warehouseId: 'wh-qua-mum', warehouseCode: 'WH-QUA-MUM', warehouseName: 'Quarantine Warehouse', userRole: 'QUALITY_INSPECTOR', canReceive: false, canPutaway: false, canPick: false, canPack: false, canDispatch: false, canAdjust: true, canCount: true, canAccessRestricted: true, canAccessColdStorage: true, restrictedZoneIds: [], status: 'ACTIVE' },
  ],
  rules: [
    { id: 'wr-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', ruleCode: 'MAX_BIN_WEIGHT', ruleName: 'Maximum Bin Weight', description: 'No single bin may hold more than 25 kg of stock to prevent structural damage & ergonomic injury.', ruleType: 'MAX_BIN_WEIGHT', ruleValue: '25', ruleUnit: 'KG', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'wr-002', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', ruleCode: 'FEFO_ENABLED', ruleName: 'FEFO Picking Enforced', description: 'Picking must follow First-Expired-First-Out across all FG bins. Non-FEFO picks are blocked.', ruleType: 'FEFO_ENABLED', ruleValue: 'true', ruleUnit: 'BOOLEAN', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'wr-003', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', ruleCode: 'BARCODE_MANDATORY', ruleName: 'Barcode Scan Mandatory', description: 'Every receive/putaway/pick/dispatch must scan barcode. Manual entry triggers a warning.', ruleType: 'BARCODE_MANDATORY', ruleValue: 'true', ruleUnit: 'BOOLEAN', enforcementMode: 'WARN', status: 'ACTIVE' },
    { id: 'wr-004', warehouseId: 'wh-qua-mum', warehouseCode: 'WH-QUA-MUM', warehouseName: 'Quarantine Warehouse', ruleCode: 'QUALITY_INSPECTION_REQUIRED', ruleName: 'Quality Inspection Required', description: 'All inbound & returned stock must pass QA inspection before release to storage.', ruleType: 'QUALITY_INSPECTION_REQUIRED', ruleValue: 'true', ruleUnit: 'BOOLEAN', enforcementMode: 'BLOCK', status: 'ACTIVE' },
    { id: 'wr-005', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', ruleCode: 'MAX_STACK_HEIGHT', ruleName: 'Maximum Pallet Stack Height', description: 'Pallet stack may not exceed 2.4 m to comply with ceiling clearance & forklift safety.', ruleType: 'MAX_STACK_HEIGHT', ruleValue: '2.4', ruleUnit: 'M', enforcementMode: 'WARN', status: 'ACTIVE' },
  ],
}

// ─── Sprint 23 — Warehouse Location & Bin Management (LOC_DATA) ────
// Aisles, Racks, Shelves, Bins, Bin Capacity Logs — the digital map of the warehouse
const LOC_DATA = {
  aisles: [
    {
      id: 'aisle-a', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse',
      zoneId: 'zn-003', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient',
      aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits',
      description: 'Main aisle for raw cashew, almonds, and dry fruit storage. Two-way forklift traffic.',
      lengthM: 24.00, widthM: 3.50, trafficDirection: 'TWO_WAY',
      status: 'ACTIVE', displayOrder: 10,
      rackCount: 2, shelfCount: 4, binCount: 4,
    },
    {
      id: 'aisle-b', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse',
      zoneId: 'zn-004', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold',
      aisleCode: 'B', aisleName: 'Aisle B — Cold Storage (Ghee & Perishables)',
      description: 'Chilled aisle for ghee, butter, and perishable raw materials. Forklift-only due to narrow cold-room doors.',
      lengthM: 18.00, widthM: 2.80, trafficDirection: 'FORKLIFT_ONLY',
      status: 'ACTIVE', displayOrder: 20,
      rackCount: 2, shelfCount: 3, binCount: 3,
    },
    {
      id: 'aisle-c', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse',
      zoneId: 'zn-005', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone',
      aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face',
      description: 'High-velocity pick-face aisle for top-selling sweets (Kaju Katli, Soan Cake). One-way to maximize pick speed.',
      lengthM: 30.00, widthM: 2.50, trafficDirection: 'ONE_WAY',
      status: 'ACTIVE', displayOrder: 30,
      rackCount: 2, shelfCount: 3, binCount: 4,
    },
    {
      id: 'aisle-d', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse',
      zoneId: 'zn-006', zoneCode: 'Z-FG-02', zoneName: 'Packing Zone',
      aisleCode: 'D', aisleName: 'Aisle D — Packing & Dispatch Staging',
      description: 'Packing aisle with bulk dispatch staging. Two-way forklift traffic for pallet movement.',
      lengthM: 22.00, widthM: 4.00, trafficDirection: 'TWO_WAY',
      status: 'ACTIVE', displayOrder: 40,
      rackCount: 1, shelfCount: 1, binCount: 1,
    },
    {
      id: 'aisle-e', warehouseId: 'wh-cs-mum', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse',
      zoneId: null, zoneCode: null, zoneName: 'Frozen Storage',
      aisleCode: 'E', aisleName: 'Aisle E — Frozen Desserts (Ice Cream Line)',
      description: 'Sub-zero aisle for ice cream and frozen desserts. Forklift-only due to insulated doors and ice buildup.',
      lengthM: 15.00, widthM: 3.00, trafficDirection: 'FORKLIFT_ONLY',
      status: 'ACTIVE', displayOrder: 50,
      rackCount: 1, shelfCount: 1, binCount: 2,
    },
    {
      id: 'aisle-f', warehouseId: 'wh-pkg-mum', warehouseCode: 'WH-PKG-MUM', warehouseName: 'Packaging Warehouse',
      zoneId: null, zoneCode: null, zoneName: 'Bulk Packaging Storage',
      aisleCode: 'F', aisleName: 'Aisle F — Printed Boxes & Films',
      description: 'Bulk storage aisle for printed boxes, films, and labels. Two-way forklift for pallet movement.',
      lengthM: 28.00, widthM: 4.50, trafficDirection: 'TWO_WAY',
      status: 'ACTIVE', displayOrder: 60,
      rackCount: 1, shelfCount: 1, binCount: 1,
    },
  ],
  racks: [
    {
      id: 'rack-01', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse',
      zoneId: 'zn-003', zoneCode: 'Z-RM-03', aisleId: 'aisle-a', aisleCode: 'A',
      rackCode: 'R-01', rackName: 'Rack 01 — Cashew Bulk',
      description: 'Heavy-duty bulk rack for raw cashew sacks (25 kg each).',
      heightM: 4.50, widthM: 2.40, depthM: 1.20, maxWeightKg: 2000.00, shelfCount: 3, fireZone: 'FZ-A1',
      status: 'ACTIVE', displayOrder: 10,
    },
    {
      id: 'rack-02', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse',
      zoneId: 'zn-003', zoneCode: 'Z-RM-03', aisleId: 'aisle-a', aisleCode: 'A',
      rackCode: 'R-02', rackName: 'Rack 02 — Almonds & Dry Fruits',
      description: 'Standard rack for boxed almonds, pistachios, and mixed dry fruits.',
      heightM: 4.20, widthM: 2.20, depthM: 1.10, maxWeightKg: 1500.00, shelfCount: 2, fireZone: 'FZ-A1',
      status: 'ACTIVE', displayOrder: 20,
    },
    {
      id: 'rack-03', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse',
      zoneId: 'zn-004', zoneCode: 'Z-RM-04', aisleId: 'aisle-b', aisleCode: 'B',
      rackCode: 'R-03', rackName: 'Rack 03 — Ghee Drums',
      description: 'Stainless-steel drum rack for ghee (50 kg drums). Heated aisles, condensation-controlled.',
      heightM: 3.80, widthM: 2.00, depthM: 1.00, maxWeightKg: 1800.00, shelfCount: 2, fireZone: 'FZ-B1',
      status: 'ACTIVE', displayOrder: 30,
    },
    {
      id: 'rack-04', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse',
      zoneId: 'zn-004', zoneCode: 'Z-RM-04', aisleId: 'aisle-b', aisleCode: 'B',
      rackCode: 'R-04', rackName: 'Rack 04 — Perishables',
      description: 'Short rack for perishable raw materials (cream, milk). Frequent rotation.',
      heightM: 2.40, widthM: 1.80, depthM: 0.90, maxWeightKg: 800.00, shelfCount: 1, fireZone: 'FZ-B2',
      status: 'ACTIVE', displayOrder: 40,
    },
    {
      id: 'rack-05', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse',
      zoneId: 'zn-005', zoneCode: 'Z-FG-01', aisleId: 'aisle-c', aisleCode: 'C',
      rackCode: 'R-05', rackName: 'Rack 05 — Kaju Katli Pick Face',
      description: 'Pick-face rack for Kaju Katli 500g boxes. Ground-level easy access.',
      heightM: 2.10, widthM: 1.80, depthM: 0.80, maxWeightKg: 600.00, shelfCount: 2, fireZone: 'FZ-C1',
      status: 'ACTIVE', displayOrder: 50,
    },
    {
      id: 'rack-06', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse',
      zoneId: 'zn-005', zoneCode: 'Z-FG-01', aisleId: 'aisle-c', aisleCode: 'C',
      rackCode: 'R-06', rackName: 'Rack 06 — Soan Cake & Mixed Sweets',
      description: 'Pick-face rack for premium sweets. Multi-level with mid-shelf access.',
      heightM: 3.60, widthM: 2.00, depthM: 0.90, maxWeightKg: 900.00, shelfCount: 1, fireZone: 'FZ-C2',
      status: 'ACTIVE', displayOrder: 60,
    },
    {
      id: 'rack-07', warehouseId: 'wh-cs-mum', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse',
      zoneId: null, zoneCode: null, aisleId: 'aisle-e', aisleCode: 'E',
      rackCode: 'R-07', rackName: 'Rack 07 — Frozen Ice Cream',
      description: 'Insulated rack for ice cream tubs (-22°C). Single shelf to preserve cold airflow.',
      heightM: 2.20, widthM: 1.60, depthM: 1.00, maxWeightKg: 500.00, shelfCount: 1, fireZone: 'FZ-E1',
      status: 'ACTIVE', displayOrder: 70,
    },
    {
      id: 'rack-08', warehouseId: 'wh-pkg-mum', warehouseCode: 'WH-PKG-MUM', warehouseName: 'Packaging Warehouse',
      zoneId: null, zoneCode: null, aisleId: 'aisle-f', aisleCode: 'F',
      rackCode: 'R-08', rackName: 'Rack 08 — Printed Boxes',
      description: 'Wide rack for printed packaging boxes (500-unit bundles).',
      heightM: 4.80, widthM: 3.00, depthM: 1.50, maxWeightKg: 2500.00, shelfCount: 1, fireZone: 'FZ-F1',
      status: 'ACTIVE', displayOrder: 80,
    },
  ],
  shelves: [
    { id: 'shelf-01', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-01', rackCode: 'R-01', aisleCode: 'A', shelfCode: 'S-01', shelfName: 'Ground Shelf — Cashew 25kg sacks', level: 1, heightFromFloor: 0.30, maxWeightKg: 2000.00, maxVolumeM3: 6.50, pickingLevel: 'GROUND', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-02', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-01', rackCode: 'R-01', aisleCode: 'A', shelfCode: 'S-02', shelfName: 'Mid Shelf — Cashew overflow', level: 2, heightFromFloor: 1.80, maxWeightKg: 1200.00, maxVolumeM3: 5.20, pickingLevel: 'MID', accessibility: 'MODERATE', status: 'ACTIVE' },
    { id: 'shelf-03', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-01', rackCode: 'R-01', aisleCode: 'A', shelfCode: 'S-03', shelfName: 'High Shelf — Reserve', level: 3, heightFromFloor: 3.20, maxWeightKg: 600.00, maxVolumeM3: 4.10, pickingLevel: 'HIGH', accessibility: 'LADDER_REQUIRED', status: 'ACTIVE' },
    { id: 'shelf-04', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-02', rackCode: 'R-02', aisleCode: 'A', shelfCode: 'S-04', shelfName: 'Ground Shelf — Almond boxes', level: 1, heightFromFloor: 0.30, maxWeightKg: 1500.00, maxVolumeM3: 4.80, pickingLevel: 'GROUND', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-05', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-02', rackCode: 'R-02', aisleCode: 'A', shelfCode: 'S-05', shelfName: 'Mid Shelf — Pistachio & Mixed', level: 2, heightFromFloor: 1.70, maxWeightKg: 900.00, maxVolumeM3: 3.60, pickingLevel: 'MID', accessibility: 'MODERATE', status: 'ACTIVE' },
    { id: 'shelf-06', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-03', rackCode: 'R-03', aisleCode: 'B', shelfCode: 'S-06', shelfName: 'Ground Shelf — Ghee drums', level: 1, heightFromFloor: 0.20, maxWeightKg: 1800.00, maxVolumeM3: 3.80, pickingLevel: 'GROUND', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-07', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-03', rackCode: 'R-03', aisleCode: 'B', shelfCode: 'S-07', shelfName: 'Mid Shelf — Ghee overflow', level: 2, heightFromFloor: 1.60, maxWeightKg: 1000.00, maxVolumeM3: 2.90, pickingLevel: 'MID', accessibility: 'MODERATE', status: 'ACTIVE' },
    { id: 'shelf-08', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', rackId: 'rack-04', rackCode: 'R-04', aisleCode: 'B', shelfCode: 'S-08', shelfName: 'Ground Shelf — Cream & Milk', level: 1, heightFromFloor: 0.30, maxWeightKg: 800.00, maxVolumeM3: 2.40, pickingLevel: 'GROUND', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-09', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', rackId: 'rack-05', rackCode: 'R-05', aisleCode: 'C', shelfCode: 'S-09', shelfName: 'Ground Pick Face — Kaju Katli 500g', level: 1, heightFromFloor: 0.80, maxWeightKg: 400.00, maxVolumeM3: 1.60, pickingLevel: 'GROUND', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-10', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', rackId: 'rack-05', rackCode: 'R-05', aisleCode: 'C', shelfCode: 'S-10', shelfName: 'Mid Pick Face — Kaju Katli 250g', level: 2, heightFromFloor: 1.60, maxWeightKg: 300.00, maxVolumeM3: 1.20, pickingLevel: 'MID', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-11', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', rackId: 'rack-06', rackCode: 'R-06', aisleCode: 'C', shelfCode: 'S-11', shelfName: 'Ground Pick Face — Soan Cake 1kg', level: 1, heightFromFloor: 0.70, maxWeightKg: 500.00, maxVolumeM3: 2.00, pickingLevel: 'GROUND', accessibility: 'EASY', status: 'ACTIVE' },
    { id: 'shelf-12', warehouseId: 'wh-cs-mum', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse', rackId: 'rack-07', rackCode: 'R-07', aisleCode: 'E', shelfCode: 'S-12', shelfName: 'Ground Shelf — Ice Cream Tubs', level: 1, heightFromFloor: 0.40, maxWeightKg: 500.00, maxVolumeM3: 1.60, pickingLevel: 'GROUND', accessibility: 'MODERATE', status: 'ACTIVE' },
  ],
  bins: [
    { id: 'bin-001', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-003', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', aisleId: 'aisle-a', aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits', rackId: 'rack-01', rackCode: 'R-01', rackName: 'Rack 01 — Cashew Bulk', shelfId: 'shelf-01', shelfCode: 'S-01', shelfName: 'Ground Shelf — Cashew 25kg sacks', binCode: 'A-01-01-01', barcode: 'BC-A01010101', qrCode: 'QR-A-01-01-01', maxWeightKg: 2000.00, maxVolumeM3: 6.50, currentWeightKg: 1750.00, currentVolumeM3: 5.20, utilizationPercent: 87.50, temperatureZone: 'AMBIENT', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Cashew 25kg × 70 sacks', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-06-15T09:00:00Z', updatedAt: '2026-07-09T08:30:00Z' },
    { id: 'bin-002', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-003', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', aisleId: 'aisle-a', aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits', rackId: 'rack-01', rackCode: 'R-01', rackName: 'Rack 01 — Cashew Bulk', shelfId: 'shelf-02', shelfCode: 'S-02', shelfName: 'Mid Shelf — Cashew overflow', binCode: 'A-01-02-01', barcode: 'BC-A01020101', qrCode: 'QR-A-01-02-01', maxWeightKg: 1200.00, maxVolumeM3: 5.20, currentWeightKg: 480.00, currentVolumeM3: 1.90, utilizationPercent: 40.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, itemCapacity: 2, currentItemTypes: 0, createdAt: '2026-06-15T09:05:00Z', updatedAt: '2026-07-08T17:00:00Z' },
    { id: 'bin-003', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-003', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', aisleId: 'aisle-a', aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits', rackId: 'rack-01', rackCode: 'R-01', rackName: 'Rack 01 — Cashew Bulk', shelfId: 'shelf-03', shelfCode: 'S-03', shelfName: 'High Shelf — Reserve', binCode: 'A-01-03-01', barcode: 'BC-A01030101', qrCode: 'QR-A-01-03-01', maxWeightKg: 600.00, maxVolumeM3: 4.10, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, itemCapacity: 2, currentItemTypes: 0, createdAt: '2026-06-15T09:10:00Z', updatedAt: '2026-07-09T08:30:00Z' },
    { id: 'bin-004', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-003', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', aisleId: 'aisle-a', aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits', rackId: 'rack-02', rackCode: 'R-02', rackName: 'Rack 02 — Almonds & Dry Fruits', shelfId: 'shelf-04', shelfCode: 'S-04', shelfName: 'Ground Shelf — Almond boxes', binCode: 'A-02-04-01', barcode: 'BC-A02040101', qrCode: 'QR-A-02-04-01', maxWeightKg: 1500.00, maxVolumeM3: 4.80, currentWeightKg: 950.00, currentVolumeM3: 3.10, utilizationPercent: 63.33, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'OCCUPIED', statusReason: 'Almond 10kg × 95 boxes', itemCapacity: 2, currentItemTypes: 1, createdAt: '2026-06-15T09:15:00Z', updatedAt: '2026-07-09T07:45:00Z' },
    { id: 'bin-005', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-004', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold', aisleId: 'aisle-b', aisleCode: 'B', aisleName: 'Aisle B — Cold Storage (Ghee & Perishables)', rackId: 'rack-03', rackCode: 'R-03', rackName: 'Rack 03 — Ghee Drums', shelfId: 'shelf-06', shelfCode: 'S-06', shelfName: 'Ground Shelf — Ghee drums', binCode: 'B-03-06-01', barcode: 'BC-B03060101', qrCode: 'QR-B-03-06-01', maxWeightKg: 1800.00, maxVolumeM3: 3.80, currentWeightKg: 1800.00, currentVolumeM3: 3.80, utilizationPercent: 100.00, temperatureZone: 'CHILLED', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Ghee 50kg × 36 drums — at capacity', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-07-09T08:45:00Z' },
    { id: 'bin-006', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-004', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold', aisleId: 'aisle-b', aisleCode: 'B', aisleName: 'Aisle B — Cold Storage (Ghee & Perishables)', rackId: 'rack-03', rackCode: 'R-03', rackName: 'Rack 03 — Ghee Drums', shelfId: 'shelf-07', shelfCode: 'S-07', shelfName: 'Mid Shelf — Ghee overflow', binCode: 'B-03-07-01', barcode: 'BC-B03070101', qrCode: 'QR-B-03-07-01', maxWeightKg: 1000.00, maxVolumeM3: 2.90, currentWeightKg: 220.00, currentVolumeM3: 0.65, utilizationPercent: 22.00, temperatureZone: 'CHILLED', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, itemCapacity: 2, currentItemTypes: 0, createdAt: '2026-06-20T10:05:00Z', updatedAt: '2026-07-08T18:00:00Z' },
    { id: 'bin-007', warehouseId: 'wh-rm-mum', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneId: 'zn-004', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold', aisleId: 'aisle-b', aisleCode: 'B', aisleName: 'Aisle B — Cold Storage (Ghee & Perishables)', rackId: 'rack-04', rackCode: 'R-04', rackName: 'Rack 04 — Perishables', shelfId: 'shelf-08', shelfCode: 'S-08', shelfName: 'Ground Shelf — Cream & Milk', binCode: 'B-04-08-01', barcode: 'BC-B04080101', qrCode: 'QR-B-04-08-01', maxWeightKg: 800.00, maxVolumeM3: 2.40, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'CHILLED', binType: 'QUARANTINE', status: 'BLOCKED', statusReason: 'Spillage from previous batch — awaiting deep clean', itemCapacity: 1, currentItemTypes: 0, createdAt: '2026-06-25T11:00:00Z', updatedAt: '2026-07-09T06:00:00Z' },
    { id: 'bin-008', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneId: 'zn-005', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', aisleId: 'aisle-c', aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face', rackId: 'rack-05', rackCode: 'R-05', rackName: 'Rack 05 — Kaju Katli Pick Face', shelfId: 'shelf-09', shelfCode: 'S-09', shelfName: 'Ground Pick Face — Kaju Katli 500g', binCode: 'C-05-09-01', barcode: 'BC-C05090101', qrCode: 'QR-C-05-09-01', maxWeightKg: 400.00, maxVolumeM3: 1.60, currentWeightKg: 142.00, currentVolumeM3: 0.95, utilizationPercent: 35.50, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'OCCUPIED', statusReason: 'Kaju Katli 500g × 142 boxes (KK-2607-01)', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-07-01T08:00:00Z', updatedAt: '2026-07-09T09:15:00Z' },
    { id: 'bin-009', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneId: 'zn-005', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', aisleId: 'aisle-c', aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face', rackId: 'rack-05', rackCode: 'R-05', rackName: 'Rack 05 — Kaju Katli Pick Face', shelfId: 'shelf-10', shelfCode: 'S-10', shelfName: 'Mid Pick Face — Kaju Katli 250g', binCode: 'C-05-10-01', barcode: 'BC-C05100101', qrCode: 'QR-C-05-10-01', maxWeightKg: 300.00, maxVolumeM3: 1.20, currentWeightKg: 285.00, currentVolumeM3: 1.10, utilizationPercent: 95.00, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'OCCUPIED', statusReason: 'Kaju Katli 250g × 570 boxes — near capacity', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-07-01T08:05:00Z', updatedAt: '2026-07-09T09:20:00Z' },
    { id: 'bin-010', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneId: 'zn-005', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', aisleId: 'aisle-c', aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face', rackId: 'rack-06', rackCode: 'R-06', rackName: 'Rack 06 — Soan Cake & Mixed Sweets', shelfId: 'shelf-11', shelfCode: 'S-11', shelfName: 'Ground Pick Face — Soan Cake 1kg', binCode: 'C-06-11-01', barcode: 'BC-C06110101', qrCode: 'QR-C-06-11-01', maxWeightKg: 500.00, maxVolumeM3: 2.00, currentWeightKg: 89.00, currentVolumeM3: 0.85, utilizationPercent: 17.80, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'RESERVED', statusReason: 'Reserved for production order PRD-2026-0156 (Soan Cake 1kg)', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-07-05T10:00:00Z', updatedAt: '2026-07-09T11:00:00Z' },
    { id: 'bin-011', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneId: 'zn-006', zoneCode: 'Z-FG-02', zoneName: 'Packing Zone', aisleId: 'aisle-d', aisleCode: 'D', aisleName: 'Aisle D — Packing & Dispatch Staging', rackId: null, rackCode: null, rackName: null, shelfId: null, shelfCode: null, shelfName: null, binCode: 'D-00-00-01', barcode: 'BC-D00000001', qrCode: 'QR-D-00-00-01', maxWeightKg: 1000.00, maxVolumeM3: 4.00, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, itemCapacity: 4, currentItemTypes: 0, createdAt: '2026-07-02T09:00:00Z', updatedAt: '2026-07-09T08:00:00Z' },
    { id: 'bin-012', warehouseId: 'wh-fg-mum', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneId: 'zn-005', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', aisleId: 'aisle-c', aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face', rackId: 'rack-05', rackCode: 'R-05', rackName: 'Rack 05 — Kaju Katli Pick Face', shelfId: 'shelf-09', shelfCode: 'S-09', shelfName: 'Ground Pick Face — Kaju Katli 500g', binCode: 'C-05-09-02', barcode: 'BC-C05090102', qrCode: 'QR-C-05-09-02', maxWeightKg: 400.00, maxVolumeM3: 1.60, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'MAINTENANCE', statusReason: 'Rack re-leveling scheduled 10-Jul-2026', itemCapacity: 1, currentItemTypes: 0, createdAt: '2026-07-03T12:00:00Z', updatedAt: '2026-07-08T16:30:00Z' },
    { id: 'bin-013', warehouseId: 'wh-cs-mum', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse', zoneId: null, zoneCode: null, zoneName: 'Frozen Storage', aisleId: 'aisle-e', aisleCode: 'E', aisleName: 'Aisle E — Frozen Desserts (Ice Cream Line)', rackId: 'rack-07', rackCode: 'R-07', rackName: 'Rack 07 — Frozen Ice Cream', shelfId: 'shelf-12', shelfCode: 'S-12', shelfName: 'Ground Shelf — Ice Cream Tubs', binCode: 'E-07-12-01', barcode: 'BC-E07120101', qrCode: 'QR-E-07-12-01', maxWeightKg: 500.00, maxVolumeM3: 1.60, currentWeightKg: 312.00, currentVolumeM3: 1.05, utilizationPercent: 62.40, temperatureZone: 'FROZEN', binType: 'STANDARD', status: 'OCCUPIED', statusReason: 'Vanilla ice cream 1L × 312 tubs', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-06-28T07:00:00Z', updatedAt: '2026-07-09T07:30:00Z' },
    { id: 'bin-014', warehouseId: 'wh-cs-mum', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse', zoneId: null, zoneCode: null, zoneName: 'Frozen Storage', aisleId: 'aisle-e', aisleCode: 'E', aisleName: 'Aisle E — Frozen Desserts (Ice Cream Line)', rackId: 'rack-07', rackCode: 'R-07', rackName: 'Rack 07 — Frozen Ice Cream', shelfId: 'shelf-12', shelfCode: 'S-12', shelfName: 'Ground Shelf — Ice Cream Tubs', binCode: 'E-07-12-02', barcode: 'BC-E07120102', qrCode: 'QR-E-07-12-02', maxWeightKg: 500.00, maxVolumeM3: 1.60, currentWeightKg: 540.00, currentVolumeM3: 1.65, utilizationPercent: 108.00, temperatureZone: 'FROZEN', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Chocolate ice cream 1L × 540 tubs — OVERLOADED', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-06-28T07:05:00Z', updatedAt: '2026-07-09T07:35:00Z' },
    { id: 'bin-015', warehouseId: 'wh-pkg-mum', warehouseCode: 'WH-PKG-MUM', warehouseName: 'Packaging Warehouse', zoneId: null, zoneCode: null, zoneName: 'Bulk Packaging Storage', aisleId: 'aisle-f', aisleCode: 'F', aisleName: 'Aisle F — Printed Boxes & Films', rackId: 'rack-08', rackCode: 'R-08', rackName: 'Rack 08 — Printed Boxes', shelfId: null, shelfCode: null, shelfName: null, binCode: 'F-08-00-01', barcode: 'BC-F08000001', qrCode: 'QR-F-08-00-01', maxWeightKg: 2500.00, maxVolumeM3: 12.00, currentWeightKg: 1420.00, currentVolumeM3: 7.80, utilizationPercent: 56.80, temperatureZone: 'AMBIENT', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Printed Kaju Katli 500g boxes × 2840', itemCapacity: 1, currentItemTypes: 1, createdAt: '2026-06-30T09:00:00Z', updatedAt: '2026-07-09T08:15:00Z' },
  ],
  capacityLogs: [
    { id: 'bcl-001', binId: 'bin-005', binCode: 'B-03-06-01', warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse', currentWeightKg: 1800.00, currentVolumeM3: 3.80, maxWeightKg: 1800.00, maxVolumeM3: 3.80, utilizationPercent: 100.00, alertType: 'FULL', alertMessage: 'Bin at 100% capacity. No further putaway allowed. Suggest overflow to B-03-07-01.', itemTypes: 1, totalQuantity: 36, snapshotAt: '2026-07-09T08:45:00Z', createdAt: '2026-07-09T08:45:00Z' },
    { id: 'bcl-002', binId: 'bin-014', binCode: 'E-07-12-02', warehouseId: 'wh-cs-mum', warehouseName: 'Cold Storage Warehouse', currentWeightKg: 540.00, currentVolumeM3: 1.65, maxWeightKg: 500.00, maxVolumeM3: 1.60, utilizationPercent: 108.00, alertType: 'OVERLOADED', alertMessage: 'Bin OVERLOADED — 540 kg exceeds 500 kg max (8% over). Structural risk. Immediate redistribution required.', itemTypes: 1, totalQuantity: 540, snapshotAt: '2026-07-09T07:35:00Z', createdAt: '2026-07-09T07:35:00Z' },
    { id: 'bcl-003', binId: 'bin-002', binCode: 'A-01-02-01', warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse', currentWeightKg: 480.00, currentVolumeM3: 1.90, maxWeightKg: 1200.00, maxVolumeM3: 5.20, utilizationPercent: 40.00, alertType: 'UNDERUTILIZED', alertMessage: 'Bin at 40% utilization for 7+ days. Consider consolidating or re-slotting for fast-moving stock.', itemTypes: 0, totalQuantity: 0, snapshotAt: '2026-07-09T08:30:00Z', createdAt: '2026-07-09T08:30:00Z' },
    { id: 'bcl-004', binId: 'bin-009', binCode: 'C-05-10-01', warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse', currentWeightKg: 285.00, currentVolumeM3: 1.10, maxWeightKg: 300.00, maxVolumeM3: 1.20, utilizationPercent: 95.00, alertType: 'NEAR_FULL', alertMessage: 'Bin at 95% capacity. Reserve for current SKU only — disable mixed-SKU putaway to prevent overflow.', itemTypes: 1, totalQuantity: 570, snapshotAt: '2026-07-09T09:20:00Z', createdAt: '2026-07-09T09:20:00Z' },
  ],
}

// ─── Sprint 24 — Receiving Operations, Dock Management & ASN Engine (RECV_DATA) ────
// Advanced Shipping Notices, Receiving Appointments, Gate Entries, Loading Docks, Receiving Exceptions
const RECV_DATA = {
  asns: [
    {
      id: 'asn-001',
      asnNumber: 'ASN-2026-0001',
      asnDate: '2026-07-08T09:00:00Z',
      expectedArrival: '2026-07-09T08:00:00Z',
      receivingType: 'PURCHASE_ORDER',
      supplierId: 'sup-001', supplierName: 'Marwadi Cashew Suppliers',
      referenceType: 'PURCHASE_ORDER', referenceNumber: 'PO-2026-0042',
      vehicleNumber: 'MH-04-AB-1234', driverName: 'Ramesh Yadav', driverPhone: '+91-98200-11223',
      carrierName: 'Patel Transport Co.',
      warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      status: 'VEHICLE_ARRIVED',
      totalLines: 3, totalPallets: 12, totalCartons: 48, totalQuantity: 1800, totalWeight: 4500.00, totalVolume: 18.50,
      appointmentId: 'appt-001',
      createdById: 'usr-recv-01', createdByName: 'Receiving Clerk A',
      confirmedAt: '2026-07-08T10:30:00Z', completedAt: null,
      createdAt: '2026-07-08T09:00:00Z', updatedAt: '2026-07-09T07:55:00Z',
      lines: [
        { id: 'asnl-001', lineOrder: 10, productName: 'Raw Cashew W240 (25kg sack)', uomName: 'SACK', expectedQty: 60, receivedQty: 0, palletCount: 4, cartonCount: 16, batchNumber: 'CASH-2607-01', supplierBatchNo: 'MC-2607-A1', manufacturingDate: '2026-06-15T00:00:00Z', expiryDate: '2026-12-15T00:00:00Z', barcode: 'BC-CASH-W240-25', lineStatus: 'PENDING' },
        { id: 'asnl-002', lineOrder: 20, productName: 'Almond California (10kg box)', uomName: 'BOX', expectedQty: 80, receivedQty: 0, palletCount: 4, cartonCount: 16, batchNumber: 'ALM-2607-02', supplierBatchNo: 'MC-2607-A2', manufacturingDate: '2026-06-20T00:00:00Z', expiryDate: '2027-01-20T00:00:00Z', barcode: 'BC-ALM-CAL-10', lineStatus: 'PENDING' },
        { id: 'asnl-003', lineOrder: 30, productName: 'Pistachio Iranian (5kg box)', uomName: 'BOX', expectedQty: 40, receivedQty: 0, palletCount: 4, cartonCount: 16, batchNumber: 'PIS-2607-03', supplierBatchNo: 'MC-2607-A3', manufacturingDate: '2026-06-25T00:00:00Z', expiryDate: '2027-02-25T00:00:00Z', barcode: 'BC-PIS-IRN-5', lineStatus: 'PENDING' },
      ],
    },
    {
      id: 'asn-002',
      asnNumber: 'ASN-2026-0002',
      asnDate: '2026-07-07T14:00:00Z',
      expectedArrival: '2026-07-09T10:00:00Z',
      receivingType: 'INTER_WAREHOUSE_TRANSFER',
      supplierId: null, supplierName: null,
      referenceType: 'STOCK_TRANSFER', referenceNumber: 'ST-2026-0018',
      vehicleNumber: 'MH-12-CD-5678', driverName: 'Suresh Kumar', driverPhone: '+91-98200-22334',
      carrierName: 'Sudhastar Logistics',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      status: 'CONFIRMED',
      totalLines: 2, totalPallets: 8, totalCartons: 32, totalQuantity: 960, totalWeight: 720.00, totalVolume: 6.40,
      appointmentId: 'appt-002',
      createdById: 'usr-recv-02', createdByName: 'Plant Supervisor',
      confirmedAt: '2026-07-07T15:00:00Z', completedAt: null,
      createdAt: '2026-07-07T14:00:00Z', updatedAt: '2026-07-09T06:00:00Z',
      lines: [
        { id: 'asnl-004', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12)', uomName: 'BOX', expectedQty: 480, receivedQty: 0, palletCount: 4, cartonCount: 16, batchNumber: 'KK-2607-01', supplierBatchNo: null, manufacturingDate: '2026-07-01T00:00:00Z', expiryDate: '2026-10-01T00:00:00Z', barcode: 'BC-KK-500-B12', lineStatus: 'PENDING' },
        { id: 'asnl-005', lineOrder: 20, productName: 'Soan Cake 1kg (Box of 6)', uomName: 'BOX', expectedQty: 480, receivedQty: 0, palletCount: 4, cartonCount: 16, batchNumber: 'SC-2607-02', supplierBatchNo: null, manufacturingDate: '2026-07-03T00:00:00Z', expiryDate: '2026-09-03T00:00:00Z', barcode: 'BC-SC-1K-B6', lineStatus: 'PENDING' },
      ],
    },
    {
      id: 'asn-003',
      asnNumber: 'ASN-2026-0003',
      asnDate: '2026-07-06T11:00:00Z',
      expectedArrival: '2026-07-08T14:00:00Z',
      receivingType: 'CUSTOMER_RETURN',
      supplierId: null, supplierName: 'Retail Customer — Mumbai Store 01',
      referenceType: 'SALES_RETURN', referenceNumber: 'SR-2026-0093',
      vehicleNumber: 'MH-01-EF-9012', driverName: 'Ajay Singh', driverPhone: '+91-98200-33445',
      carrierName: 'Customer Vehicle',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      status: 'COMPLETED',
      totalLines: 1, totalPallets: 1, totalCartons: 4, totalQuantity: 24, totalWeight: 18.00, totalVolume: 0.24,
      appointmentId: 'appt-003',
      createdById: 'usr-recv-03', createdByName: 'Returns Clerk',
      confirmedAt: '2026-07-06T12:00:00Z', completedAt: '2026-07-08T16:30:00Z',
      createdAt: '2026-07-06T11:00:00Z', updatedAt: '2026-07-08T16:30:00Z',
      lines: [
        { id: 'asnl-006', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12)', uomName: 'BOX', expectedQty: 24, receivedQty: 24, palletCount: 1, cartonCount: 4, batchNumber: 'KK-2606-15', supplierBatchNo: null, manufacturingDate: '2026-06-10T00:00:00Z', expiryDate: '2026-09-10T00:00:00Z', barcode: 'BC-KK-500-B12', lineStatus: 'RECEIVED' },
      ],
    },
    {
      id: 'asn-004',
      asnNumber: 'ASN-2026-0004',
      asnDate: '2026-07-09T07:00:00Z',
      expectedArrival: '2026-07-10T08:30:00Z',
      receivingType: 'SUPPLIER_REPLACEMENT',
      supplierId: 'sup-002', supplierName: 'Marwadi Cashew Suppliers',
      referenceType: 'RECEIVING_EXCEPTION', referenceNumber: 'RE-2026-0011',
      vehicleNumber: 'MH-04-GH-3456', driverName: 'Mohan Lal', driverPhone: '+91-98200-44556',
      carrierName: 'Patel Transport Co.',
      warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      status: 'CONFIRMED',
      totalLines: 1, totalPallets: 2, totalCartons: 8, totalQuantity: 20, totalWeight: 500.00, totalVolume: 2.00,
      appointmentId: null,
      createdById: 'usr-recv-01', createdByName: 'Receiving Clerk A',
      confirmedAt: '2026-07-09T07:30:00Z', completedAt: null,
      createdAt: '2026-07-09T07:00:00Z', updatedAt: '2026-07-09T07:30:00Z',
      lines: [
        { id: 'asnl-007', lineOrder: 10, productName: 'Raw Cashew W240 (25kg sack)', uomName: 'SACK', expectedQty: 20, receivedQty: 0, palletCount: 2, cartonCount: 8, batchNumber: 'CASH-2607-04', supplierBatchNo: 'MC-2607-A4', manufacturingDate: '2026-06-28T00:00:00Z', expiryDate: '2026-12-28T00:00:00Z', barcode: 'BC-CASH-W240-25', lineStatus: 'PENDING' },
      ],
    },
    {
      id: 'asn-005',
      asnNumber: 'ASN-2026-0005',
      asnDate: '2026-07-09T06:00:00Z',
      expectedArrival: '2026-07-09T11:00:00Z',
      receivingType: 'MANUFACTURING_RECEIPT',
      supplierId: null, supplierName: null,
      referenceType: 'PRODUCTION_ORDER', referenceNumber: 'PRD-2026-0156',
      vehicleNumber: 'WH-INT-001', driverName: 'Internal Lift', driverPhone: null,
      carrierName: 'Internal Material Handling',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      status: 'RECEIVING',
      totalLines: 2, totalPallets: 6, totalCartons: 24, totalQuantity: 720, totalWeight: 540.00, totalVolume: 4.80,
      appointmentId: 'appt-004',
      createdById: 'usr-prod-01', createdByName: 'Production Supervisor',
      confirmedAt: '2026-07-09T06:30:00Z', completedAt: null,
      createdAt: '2026-07-09T06:00:00Z', updatedAt: '2026-07-09T10:45:00Z',
      lines: [
        { id: 'asnl-008', lineOrder: 10, productName: 'Soan Cake 1kg (Box of 6)', uomName: 'BOX', expectedQty: 360, receivedQty: 240, palletCount: 3, cartonCount: 12, batchNumber: 'SC-2607-08', supplierBatchNo: null, manufacturingDate: '2026-07-08T00:00:00Z', expiryDate: '2026-09-08T00:00:00Z', barcode: 'BC-SC-1K-B6', lineStatus: 'RECEIVING' },
        { id: 'asnl-009', lineOrder: 20, productName: 'Kaju Katli 250g (Box of 24)', uomName: 'BOX', expectedQty: 360, receivedQty: 0, palletCount: 3, cartonCount: 12, batchNumber: 'KK-2607-09', supplierBatchNo: null, manufacturingDate: '2026-07-08T00:00:00Z', expiryDate: '2026-10-08T00:00:00Z', barcode: 'BC-KK-250-B24', lineStatus: 'PENDING' },
      ],
    },
    {
      id: 'asn-006',
      asnNumber: 'ASN-2026-0006',
      asnDate: '2026-07-09T05:00:00Z',
      expectedArrival: '2026-07-11T09:00:00Z',
      receivingType: 'VENDOR_MANAGED_INVENTORY',
      supplierId: 'sup-003', supplierName: 'VMI Partner — Premium Dry Fruits LLP',
      referenceType: 'VMI_CONTRACT', referenceNumber: 'VMI-2026-CN-003',
      vehicleNumber: 'GJ-01-IJ-7890', driverName: 'Imran Khan', driverPhone: '+91-98200-55667',
      carrierName: 'VMI Dedicated Logistics',
      warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      status: 'DRAFT',
      totalLines: 2, totalPallets: 5, totalCartons: 20, totalQuantity: 600, totalWeight: 1500.00, totalVolume: 6.00,
      appointmentId: null,
      createdById: 'usr-vendor-01', createdByName: 'VMI Coordinator',
      confirmedAt: null, completedAt: null,
      createdAt: '2026-07-09T05:00:00Z', updatedAt: '2026-07-09T05:00:00Z',
      lines: [
        { id: 'asnl-010', lineOrder: 10, productName: 'Almond California (10kg box)', uomName: 'BOX', expectedQty: 50, receivedQty: 0, palletCount: 3, cartonCount: 10, batchNumber: 'ALM-2607-V1', supplierBatchNo: 'PDF-2607-V1', manufacturingDate: '2026-07-01T00:00:00Z', expiryDate: '2027-02-01T00:00:00Z', barcode: 'BC-ALM-CAL-10', lineStatus: 'PENDING' },
        { id: 'asnl-011', lineOrder: 20, productName: 'Pistachio Iranian (5kg box)', uomName: 'BOX', expectedQty: 100, receivedQty: 0, palletCount: 2, cartonCount: 10, batchNumber: 'PIS-2607-V2', supplierBatchNo: 'PDF-2607-V2', manufacturingDate: '2026-07-02T00:00:00Z', expiryDate: '2027-03-02T00:00:00Z', barcode: 'BC-PIS-IRN-5', lineStatus: 'PENDING' },
      ],
    },
  ],
  appointments: [
    {
      id: 'appt-001', appointmentNumber: 'RAP-2026-0001', appointmentDate: '2026-07-09T00:00:00Z',
      startTime: '2026-07-09T08:00:00Z', endTime: '2026-07-09T10:00:00Z',
      dockId: 'dock-rm-01', dockCode: 'RD-01',
      supplierId: 'sup-001', supplierName: 'Marwadi Cashew Suppliers',
      vehicleNumber: 'MH-04-AB-1234', driverName: 'Ramesh Yadav', driverPhone: '+91-98200-11223',
      asnId: 'asn-001', asnNumber: 'ASN-2026-0001',
      warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      priority: 'HIGH', status: 'ARRIVED',
      createdById: 'usr-recv-01', createdByName: 'Receiving Clerk A',
      createdAt: '2026-07-08T09:30:00Z', updatedAt: '2026-07-09T07:55:00Z',
    },
    {
      id: 'appt-002', appointmentNumber: 'RAP-2026-0002', appointmentDate: '2026-07-09T00:00:00Z',
      startTime: '2026-07-09T10:00:00Z', endTime: '2026-07-09T12:00:00Z',
      dockId: 'dock-fg-01', dockCode: 'RD-02',
      supplierId: null, supplierName: 'Sudhastar Pune Plant (Inter-WH)',
      vehicleNumber: 'MH-12-CD-5678', driverName: 'Suresh Kumar', driverPhone: '+91-98200-22334',
      asnId: 'asn-002', asnNumber: 'ASN-2026-0002',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      priority: 'NORMAL', status: 'CONFIRMED',
      createdById: 'usr-recv-02', createdByName: 'Plant Supervisor',
      createdAt: '2026-07-07T14:30:00Z', updatedAt: '2026-07-09T06:00:00Z',
    },
    {
      id: 'appt-003', appointmentNumber: 'RAP-2026-0003', appointmentDate: '2026-07-10T00:00:00Z',
      startTime: '2026-07-10T09:00:00Z', endTime: '2026-07-10T11:00:00Z',
      dockId: 'dock-fg-02', dockCode: 'RD-03',
      supplierId: 'sup-002', supplierName: 'Premium Packaging Solutions',
      vehicleNumber: 'MH-14-KL-2345', driverName: 'Vijay Patil', driverPhone: '+91-98200-66778',
      asnId: null, asnNumber: null,
      warehouseId: 'wh-pkg-mum', warehouseName: 'Packaging Warehouse',
      priority: 'NORMAL', status: 'SCHEDULED',
      createdById: 'usr-recv-04', createdByName: 'Packaging Clerk',
      createdAt: '2026-07-08T11:00:00Z', updatedAt: '2026-07-08T11:00:00Z',
    },
    {
      id: 'appt-004', appointmentNumber: 'RAP-2026-0004', appointmentDate: '2026-07-08T00:00:00Z',
      startTime: '2026-07-08T14:00:00Z', endTime: '2026-07-08T16:00:00Z',
      dockId: 'dock-fg-01', dockCode: 'RD-02',
      supplierId: null, supplierName: 'Internal Manufacturing Receipt',
      vehicleNumber: 'WH-INT-001', driverName: 'Internal Lift', driverPhone: null,
      asnId: 'asn-005', asnNumber: 'ASN-2026-0005',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      priority: 'EMERGENCY', status: 'COMPLETED',
      createdById: 'usr-prod-01', createdByName: 'Production Supervisor',
      createdAt: '2026-07-08T12:00:00Z', updatedAt: '2026-07-08T16:30:00Z',
    },
  ],
  gateEntries: [
    {
      id: 'ge-001', gatePassNumber: 'GP-IN-2026-0001', gateDate: '2026-07-09T00:00:00Z',
      entryType: 'INBOUND',
      vehicleNumber: 'MH-04-AB-1234', vehicleType: 'TRUCK', driverName: 'Ramesh Yadav', driverLicense: 'MH0420190001234', driverPhone: '+91-98200-11223',
      securityOfficerId: 'sec-001', securityOfficerName: 'Suresh Pawar',
      sealNumber: 'SL-2026-A001', sealIntact: true,
      arrivalTime: '2026-07-09T07:55:00Z', exitTime: null, durationMinutes: null,
      referenceType: 'ASN', referenceNumber: 'ASN-2026-0001',
      warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      photoUrls: ['gate-001-arrival.jpg', 'gate-001-seal.jpg', 'gate-001-cargo.jpg'],
      status: 'IN_WAREHOUSE', remarks: 'On-time arrival. Seal verified intact. Vehicle directed to Dock RD-01.',
      createdAt: '2026-07-09T07:55:00Z', updatedAt: '2026-07-09T08:10:00Z',
    },
    {
      id: 'ge-002', gatePassNumber: 'GP-IN-2026-0002', gateDate: '2026-07-09T00:00:00Z',
      entryType: 'INBOUND',
      vehicleNumber: 'GJ-01-IJ-7890', vehicleType: 'CONTAINER', driverName: 'Imran Khan', driverLicense: 'GJ0120180005678', driverPhone: '+91-98200-55667',
      securityOfficerId: 'sec-002', securityOfficerName: 'Anita Desai',
      sealNumber: 'SL-2026-B002', sealIntact: false,
      arrivalTime: '2026-07-09T06:30:00Z', exitTime: '2026-07-09T09:45:00Z', durationMinutes: 195,
      referenceType: 'ASN', referenceNumber: 'ASN-2026-0003',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      photoUrls: ['gate-002-arrival.jpg', 'gate-002-broken-seal.jpg', 'gate-002-cargo.jpg', 'gate-002-inspection.jpg'],
      status: 'DEPARTED', remarks: 'BROKEN SEAL detected at gate inspection. Receiving exception raised (RE-2026-0011). Cargo quarantined, then released after supplier replacement ASN-2026-0004 was authorized.',
      createdAt: '2026-07-09T06:30:00Z', updatedAt: '2026-07-09T09:45:00Z',
    },
    {
      id: 'ge-003', gatePassNumber: 'GP-IN-2026-0003', gateDate: '2026-07-09T00:00:00Z',
      entryType: 'INBOUND',
      vehicleNumber: 'WH-INT-001', vehicleType: 'VAN', driverName: 'Internal Material Handler', driverLicense: null, driverPhone: null,
      securityOfficerId: 'sec-001', securityOfficerName: 'Suresh Pawar',
      sealNumber: null, sealIntact: true,
      arrivalTime: '2026-07-09T10:45:00Z', exitTime: null, durationMinutes: null,
      referenceType: 'ASN', referenceNumber: 'ASN-2026-0005',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      photoUrls: ['gate-003-internal.jpg'],
      status: 'IN_WAREHOUSE', remarks: 'Internal inter-warehouse transfer from production block. No seal (internal vehicle). Manufacturing receipt in progress.',
      createdAt: '2026-07-09T10:45:00Z', updatedAt: '2026-07-09T10:50:00Z',
    },
  ],
  docks: [
    {
      id: 'dock-rm-01', warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      dockCode: 'RD-01', dockName: 'Receiving Dock 01 — Raw Material Bulk',
      dockType: 'RECEIVING_DOCK', dockDoorNumber: 'D-RM-01',
      maxVehicleSize: 'LARGE',
      isTemperatureControlled: false, temperatureZone: 'AMBIENT',
      hasForkliftAccess: true, hasPalletJack: true, hasConveyor: false,
      status: 'OCCUPIED', currentVehicleNumber: 'MH-04-AB-1234', currentAppointmentId: 'appt-001',
      totalOperations: 247, avgUnloadTime: 38,
      createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-07-09T08:00:00Z',
    },
    {
      id: 'dock-fg-01', warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      dockCode: 'RD-02', dockName: 'Mixed Dock 02 — FG Receiving & Dispatch',
      dockType: 'MIXED_DOCK', dockDoorNumber: 'D-FG-02',
      maxVehicleSize: 'MEDIUM',
      isTemperatureControlled: false, temperatureZone: 'AMBIENT',
      hasForkliftAccess: true, hasPalletJack: true, hasConveyor: true,
      status: 'OCCUPIED', currentVehicleNumber: 'WH-INT-001', currentAppointmentId: 'appt-004',
      totalOperations: 412, avgUnloadTime: 22,
      createdAt: '2026-01-15T09:05:00Z', updatedAt: '2026-07-09T10:45:00Z',
    },
    {
      id: 'dock-fg-02', warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      dockCode: 'DD-03', dockName: 'Dispatch Dock 03 — FG Outbound',
      dockType: 'DISPATCH_DOCK', dockDoorNumber: 'D-FG-03',
      maxVehicleSize: 'LARGE',
      isTemperatureControlled: false, temperatureZone: 'AMBIENT',
      hasForkliftAccess: true, hasPalletJack: true, hasConveyor: false,
      status: 'AVAILABLE', currentVehicleNumber: null, currentAppointmentId: null,
      totalOperations: 305, avgUnloadTime: 18,
      createdAt: '2026-01-15T09:10:00Z', updatedAt: '2026-07-08T18:00:00Z',
    },
    {
      id: 'dock-cs-01', warehouseId: 'wh-cs-mum', warehouseName: 'Cold Storage Warehouse',
      dockCode: 'CD-04', dockName: 'Cold Dock 04 — Chilled Receiving',
      dockType: 'COLD_DOCK', dockDoorNumber: 'D-CS-04',
      maxVehicleSize: 'MEDIUM',
      isTemperatureControlled: true, temperatureZone: 'CHILLED',
      hasForkliftAccess: true, hasPalletJack: true, hasConveyor: false,
      status: 'MAINTENANCE', currentVehicleNumber: null, currentAppointmentId: null,
      totalOperations: 158, avgUnloadTime: 45,
      createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-07-09T06:00:00Z',
    },
    {
      id: 'dock-pkg-01', warehouseId: 'wh-pkg-mum', warehouseName: 'Packaging Warehouse',
      dockCode: 'BD-05', dockName: 'Bulk Dock 05 — Packaging Materials',
      dockType: 'BULK_DOCK', dockDoorNumber: 'D-PKG-05',
      maxVehicleSize: 'CONTAINER',
      isTemperatureControlled: false, temperatureZone: 'AMBIENT',
      hasForkliftAccess: true, hasPalletJack: false, hasConveyor: true,
      status: 'AVAILABLE', currentVehicleNumber: null, currentAppointmentId: null,
      totalOperations: 89, avgUnloadTime: 55,
      createdAt: '2026-02-15T11:00:00Z', updatedAt: '2026-07-08T15:30:00Z',
    },
  ],
  exceptions: [
    {
      id: 're-001', exceptionNumber: 'RE-2026-0009', exceptionDate: '2026-07-09T09:30:00Z',
      asnId: 'asn-001', asnNumber: 'ASN-2026-0001', asnLineId: 'asnl-001',
      exceptionType: 'SHORT_DELIVERY',
      description: 'Supplier shipped 55 sacks instead of expected 60. Verified via physical count at receiving dock.',
      productId: 'prd-cash-w240', productName: 'Raw Cashew W240 (25kg sack)',
      expectedQty: 60, receivedQty: 55, differenceQty: -5,
      photoUrls: ['re-001-count.jpg', 're-001-invoice.jpg'],
      resolutionStatus: 'ACCEPTED', resolutionAction: 'SUPPLIER_CREDIT_NOTE', resolutionNotes: 'Supplier confirmed shortfall. Credit note CN-2026-0098 raised for 5 sacks (₹6,250). ASN line closed with received quantity.',
      resolvedById: 'usr-recv-01', resolvedByName: 'Receiving Clerk A', resolvedAt: '2026-07-09T11:00:00Z',
      status: 'RESOLVED', reportedById: 'usr-recv-01', reportedByName: 'Receiving Clerk A',
      createdAt: '2026-07-09T09:30:00Z', updatedAt: '2026-07-09T11:00:00Z',
    },
    {
      id: 're-002', exceptionNumber: 'RE-2026-0010', exceptionDate: '2026-07-09T10:15:00Z',
      asnId: 'asn-001', asnNumber: 'ASN-2026-0001', asnLineId: 'asnl-002',
      exceptionType: 'DAMAGED_GOODS',
      description: '4 boxes of California Almonds damaged in transit — outer carton crushed, inner product intact. Quality team inspecting.',
      productId: 'prd-alm-cal', productName: 'Almond California (10kg box)',
      expectedQty: 80, receivedQty: 76, differenceQty: -4,
      photoUrls: ['re-002-damaged-1.jpg', 're-002-damaged-2.jpg', 're-002-carton.jpg'],
      resolutionStatus: 'UNDER_REVIEW', resolutionAction: null, resolutionNotes: 'Quality team evaluating salvageability. Initial estimate: 2 boxes salvageable at 50% value, 2 boxes total loss.',
      resolvedById: null, resolvedByName: null, resolvedAt: null,
      status: 'ACTIVE', reportedById: 'usr-recv-01', reportedByName: 'Receiving Clerk A',
      createdAt: '2026-07-09T10:15:00Z', updatedAt: '2026-07-09T10:45:00Z',
    },
    {
      id: 're-003', exceptionNumber: 'RE-2026-0011', exceptionDate: '2026-07-09T06:45:00Z',
      asnId: 'asn-003', asnNumber: 'ASN-2026-0003', asnLineId: 'asnl-006',
      exceptionType: 'BROKEN_SEAL',
      description: 'Vehicle seal (SL-2026-B002) broken on arrival at gate. Cargo quarantined pending supplier verification. Inspection showed no obvious tampering with product, but chain-of-custody broken.',
      productId: 'prd-kk-500', productName: 'Kaju Katli 500g (Box of 12)',
      expectedQty: 24, receivedQty: 24, differenceQty: 0,
      photoUrls: ['re-003-broken-seal.jpg', 're-003-vehicle.jpg', 're-003-cargo.jpg'],
      resolutionStatus: 'REJECTED', resolutionAction: 'SUPPLIER_REPLACEMENT_ASN', resolutionNotes: 'Original ASN rejected despite quantity match — chain-of-custody broken. Supplier issued replacement ASN-2026-0004 with fresh batch. Original batch quarantined for 30 days then disposed.',
      resolvedById: 'usr-qa-01', resolvedByName: 'QA Manager', resolvedAt: '2026-07-09T13:00:00Z',
      status: 'RESOLVED', reportedById: 'sec-002', reportedByName: 'Anita Desai (Security)',
      createdAt: '2026-07-09T06:45:00Z', updatedAt: '2026-07-09T13:00:00Z',
    },
    {
      id: 're-004', exceptionNumber: 'RE-2026-0012', exceptionDate: '2026-07-09T11:30:00Z',
      asnId: 'asn-005', asnNumber: 'ASN-2026-0005', asnLineId: 'asnl-008',
      exceptionType: 'WRONG_PRODUCT',
      description: 'Production line sent 240 boxes of Soan Cake 1kg with 750g variant label mixup. Mismatch detected during receiving scan — barcode on 60 boxes does not match ASN line.',
      productId: 'prd-sc-1k', productName: 'Soan Cake 1kg (Box of 6)',
      expectedQty: 360, receivedQty: 240, differenceQty: -120,
      photoUrls: ['re-004-mixed-1.jpg', 're-004-label-mismatch.jpg'],
      resolutionStatus: 'PENDING', resolutionAction: null, resolutionNotes: null,
      resolvedById: null, resolvedByName: null, resolvedAt: null,
      status: 'ACTIVE', reportedById: 'usr-recv-02', reportedByName: 'Plant Supervisor',
      createdAt: '2026-07-09T11:30:00Z', updatedAt: '2026-07-09T11:30:00Z',
    },
  ],
}

// ─── Sprint 25 — Directed Putaway, Storage Optimization & Bin Intelligence Engine (PUTAWAY_DATA) ────
// WmsPutawayTask, WmsPutawayTaskLine, WmsPutawayRule, WarehousePallet, ForkliftTask
const PUTAWAY_DATA = {
  putawayTasks: [
    {
      id: 'pt-001',
      taskNumber: 'PT-2026-0001',
      taskDate: '2026-07-09T08:30:00Z',
      type: 'DIRECTED',
      warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      sourceZone: 'RECEIVING_DOCK_R01', destZone: 'BULK_STORAGE_A',
      referenceType: 'ASN', referenceNumber: 'ASN-2026-0001',
      priority: 'HIGH', status: 'IN_PROGRESS',
      assignedOperatorId: 'usr-flt-01', assignedOperatorName: 'Forklift Operator — Rajesh Kumar',
      forkliftId: 'fl-001', forkliftCode: 'FL-01',
      totalLines: 3, totalPallets: 12, totalCartons: 48, totalQuantity: 1800,
      putawayProgress: 33,
      startedAt: '2026-07-09T08:30:00Z', completedAt: null,
      estimatedTimeMin: 45, actualTimeMin: 28,
      createdAt: '2026-07-09T08:15:00Z', updatedAt: '2026-07-09T08:58:00Z',
      lines: [
        { id: 'ptl-001', lineOrder: 10, productName: 'Raw Cashew W240 (25kg sack)', batchNumber: 'CASH-2607-01', barcode: 'BC-CASH-W240-25', palletId: 'plt-001', palletBarcode: 'PAL-2026-0001', quantity: 60, putawayQty: 20, sourceBin: 'RECV-STG-01', recommendedBin: 'A-05-03-12', confirmedBin: 'A-05-03-12', lineStatus: 'IN_PROGRESS', binScore: 92 },
        { id: 'ptl-002', lineOrder: 20, productName: 'Almond California (10kg box)', batchNumber: 'ALM-2607-02', barcode: 'BC-ALM-CAL-10', palletId: 'plt-002', palletBarcode: 'PAL-2026-0002', quantity: 80, putawayQty: 0, sourceBin: 'RECV-STG-01', recommendedBin: 'A-06-02-08', confirmedBin: null, lineStatus: 'PENDING', binScore: 88 },
        { id: 'ptl-003', lineOrder: 30, productName: 'Pistachio Iranian (5kg box)', batchNumber: 'PIS-2607-03', barcode: 'BC-PIS-IRN-5', palletId: 'plt-003', palletBarcode: 'PAL-2026-0003', quantity: 40, putawayQty: 0, sourceBin: 'RECV-STG-01', recommendedBin: 'B-02-04-15', confirmedBin: null, lineStatus: 'PENDING', binScore: 85 },
      ],
    },
    {
      id: 'pt-002',
      taskNumber: 'PT-2026-0002',
      taskDate: '2026-07-09T07:00:00Z',
      type: 'CROSS_DOCK',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      sourceZone: 'RECEIVING_DOCK_R02', destZone: 'DISPATCH_STAGING_D01',
      referenceType: 'STOCK_TRANSFER', referenceNumber: 'ST-2026-0018',
      priority: 'EMERGENCY', status: 'COMPLETED',
      assignedOperatorId: 'usr-flt-02', assignedOperatorName: 'Forklift Operator — Sunil Yadav',
      forkliftId: 'fl-002', forkliftCode: 'FL-02',
      totalLines: 2, totalPallets: 8, totalCartons: 32, totalQuantity: 960,
      putawayProgress: 100,
      startedAt: '2026-07-09T07:00:00Z', completedAt: '2026-07-09T07:35:00Z',
      estimatedTimeMin: 30, actualTimeMin: 35,
      createdAt: '2026-07-09T06:45:00Z', updatedAt: '2026-07-09T07:35:00Z',
      lines: [
        { id: 'ptl-004', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12)', batchNumber: 'KK-2607-01', barcode: 'BC-KK-500-B12', palletId: 'plt-004', palletBarcode: 'PAL-2026-0004', quantity: 480, putawayQty: 480, sourceBin: 'RECV-STG-02', recommendedBin: 'D-01-STG-01', confirmedBin: 'D-01-STG-01', lineStatus: 'COMPLETED', binScore: 95 },
        { id: 'ptl-005', lineOrder: 20, productName: 'Soan Cake 1kg (Box of 6)', batchNumber: 'SC-2607-02', barcode: 'BC-SC-1K-B6', palletId: 'plt-004', palletBarcode: 'PAL-2026-0004', quantity: 480, putawayQty: 480, sourceBin: 'RECV-STG-02', recommendedBin: 'D-01-STG-02', confirmedBin: 'D-01-STG-02', lineStatus: 'COMPLETED', binScore: 94 },
      ],
    },
    {
      id: 'pt-003',
      taskNumber: 'PT-2026-0003',
      taskDate: '2026-07-09T09:00:00Z',
      type: 'PALLET',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      sourceZone: 'RECEIVING_DOCK_R02', destZone: 'HIGH_RACK_C',
      referenceType: 'PRODUCTION_ORDER', referenceNumber: 'PRD-2026-0156',
      priority: 'NORMAL', status: 'ASSIGNED',
      assignedOperatorId: 'usr-flt-03', assignedOperatorName: 'Forklift Operator — Deepak Sharma',
      forkliftId: 'fl-003', forkliftCode: 'FL-03',
      totalLines: 2, totalPallets: 6, totalCartons: 24, totalQuantity: 720,
      putawayProgress: 0,
      startedAt: null, completedAt: null,
      estimatedTimeMin: 25, actualTimeMin: null,
      createdAt: '2026-07-09T08:45:00Z', updatedAt: '2026-07-09T08:55:00Z',
      lines: [
        { id: 'ptl-006', lineOrder: 10, productName: 'Soan Cake 1kg (Box of 6)', batchNumber: 'SC-2607-08', barcode: 'BC-SC-1K-B6', palletId: 'plt-001', palletBarcode: 'PAL-2026-0001', quantity: 360, putawayQty: 0, sourceBin: 'RECV-STG-02', recommendedBin: 'C-08-04-22', confirmedBin: null, lineStatus: 'PENDING', binScore: 90 },
        { id: 'ptl-007', lineOrder: 20, productName: 'Kaju Katli 250g (Box of 24)', batchNumber: 'KK-2607-09', barcode: 'BC-KK-250-B24', palletId: 'plt-002', palletBarcode: 'PAL-2026-0002', quantity: 360, putawayQty: 0, sourceBin: 'RECV-STG-02', recommendedBin: 'C-08-05-18', confirmedBin: null, lineStatus: 'PENDING', binScore: 87 },
      ],
    },
    {
      id: 'pt-004',
      taskNumber: 'PT-2026-0004',
      taskDate: '2026-07-09T05:30:00Z',
      type: 'COLD_STORAGE',
      warehouseId: 'wh-cs-mum', warehouseName: 'Cold Storage Warehouse',
      sourceZone: 'RECEIVING_DOCK_C01', destZone: 'CHILLED_ZONE_B',
      referenceType: 'PURCHASE_ORDER', referenceNumber: 'PO-2026-0051',
      priority: 'HIGH', status: 'PARTIALLY_COMPLETED',
      assignedOperatorId: 'usr-flt-04', assignedOperatorName: 'Forklift Operator — Imran Sheikh',
      forkliftId: 'fl-004', forkliftCode: 'FL-04',
      totalLines: 4, totalPallets: 10, totalCartons: 40, totalQuantity: 400,
      putawayProgress: 50,
      startedAt: '2026-07-09T05:30:00Z', completedAt: null,
      estimatedTimeMin: 60, actualTimeMin: 48,
      createdAt: '2026-07-09T05:15:00Z', updatedAt: '2026-07-09T07:18:00Z',
      lines: [
        { id: 'ptl-008', lineOrder: 10, productName: 'Chilled Kaju Katli 500g (Box of 12)', batchNumber: 'CKK-2607-01', barcode: 'BC-CKK-500-B12', palletId: 'plt-003', palletBarcode: 'PAL-2026-0003', quantity: 120, putawayQty: 120, sourceBin: 'RECV-CHILL-01', recommendedBin: 'B-CS-02-08', confirmedBin: 'B-CS-02-08', lineStatus: 'COMPLETED', binScore: 96 },
        { id: 'ptl-009', lineOrder: 20, productName: 'Chilled Soan Cake 1kg (Box of 6)', batchNumber: 'CSC-2607-02', barcode: 'BC-CSC-1K-B6', palletId: 'plt-003', palletBarcode: 'PAL-2026-0003', quantity: 100, putawayQty: 80, sourceBin: 'RECV-CHILL-01', recommendedBin: 'B-CS-03-12', confirmedBin: 'B-CS-03-12', lineStatus: 'IN_PROGRESS', binScore: 93 },
        { id: 'ptl-010', lineOrder: 30, productName: 'Refrigerated Dry Fruit Mix 1kg', batchNumber: 'RDM-2607-03', barcode: 'BC-RDM-1K-01', palletId: 'plt-004', palletBarcode: 'PAL-2026-0004', quantity: 100, putawayQty: 0, sourceBin: 'RECV-CHILL-01', recommendedBin: 'B-CS-04-05', confirmedBin: null, lineStatus: 'PENDING', binScore: 91 },
        { id: 'ptl-011', lineOrder: 40, productName: 'Chilled Milk Cake 500g (Box of 12)', batchNumber: 'CMC-2607-04', barcode: 'BC-CMC-500-B12', palletId: 'plt-004', palletBarcode: 'PAL-2026-0004', quantity: 80, putawayQty: 0, sourceBin: 'RECV-CHILL-01', recommendedBin: 'B-CS-05-09', confirmedBin: null, lineStatus: 'PENDING', binScore: 89 },
      ],
    },
    {
      id: 'pt-005',
      taskNumber: 'PT-2026-0005',
      taskDate: '2026-07-08T16:00:00Z',
      type: 'RETURNS',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      sourceZone: 'RETURNS_INSPECTION_R', destZone: 'RETURNS_QUARANTINE_Q',
      referenceType: 'SALES_RETURN', referenceNumber: 'SR-2026-0093',
      priority: 'LOW', status: 'PENDING',
      assignedOperatorId: null, assignedOperatorName: null,
      forkliftId: null, forkliftCode: null,
      totalLines: 1, totalPallets: 1, totalCartons: 4, totalQuantity: 24,
      putawayProgress: 0,
      startedAt: null, completedAt: null,
      estimatedTimeMin: 15, actualTimeMin: null,
      createdAt: '2026-07-08T15:45:00Z', updatedAt: '2026-07-09T08:00:00Z',
      lines: [
        { id: 'ptl-012', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12) — Customer Return', batchNumber: 'KK-2606-15', barcode: 'BC-KK-500-B12-RET', palletId: 'plt-005', palletBarcode: 'PAL-2026-0005', quantity: 24, putawayQty: 0, sourceBin: 'RET-STG-01', recommendedBin: 'Q-RET-01-04', confirmedBin: null, lineStatus: 'PENDING', binScore: 78 },
      ],
    },
    {
      id: 'pt-006',
      taskNumber: 'PT-2026-0006',
      taskDate: '2026-07-09T10:00:00Z',
      type: 'STANDARD',
      warehouseId: 'wh-pkg-mum', warehouseName: 'Packaging Warehouse',
      sourceZone: 'RECEIVING_DOCK_P01', destZone: 'PACKAGING_PICKFACE_P',
      referenceType: 'PURCHASE_ORDER', referenceNumber: 'PO-2026-0062',
      priority: 'NORMAL', status: 'PENDING',
      assignedOperatorId: null, assignedOperatorName: null,
      forkliftId: null, forkliftCode: null,
      totalLines: 2, totalPallets: 5, totalCartons: 20, totalQuantity: 500,
      putawayProgress: 0,
      startedAt: null, completedAt: null,
      estimatedTimeMin: 30, actualTimeMin: null,
      createdAt: '2026-07-09T09:45:00Z', updatedAt: '2026-07-09T09:45:00Z',
      lines: [
        { id: 'ptl-013', lineOrder: 10, productName: 'Gift Box 500g (Flat pack)', batchNumber: 'GB-2607-05', barcode: 'BC-GB-500-FLAT', palletId: 'plt-005', palletBarcode: 'PAL-2026-0005', quantity: 250, putawayQty: 0, sourceBin: 'RECV-PKG-01', recommendedBin: 'P-02-01-10', confirmedBin: null, lineStatus: 'PENDING', binScore: 84 },
        { id: 'ptl-014', lineOrder: 20, productName: 'Decorative Tin 1kg', batchNumber: 'DT-2607-06', barcode: 'BC-DT-1K-01', palletId: 'plt-005', palletBarcode: 'PAL-2026-0005', quantity: 250, putawayQty: 0, sourceBin: 'RECV-PKG-01', recommendedBin: 'P-03-02-12', confirmedBin: null, lineStatus: 'PENDING', binScore: 82 },
      ],
    },
  ],
  putawayRules: [
    {
      id: 'pr-001', ruleCode: 'PA-FEFO-001', ruleName: 'First Expiry First Out (FEFO)',
      strategy: 'FEFO', priority: 1, isActive: true,
      description: 'Directs putaway of expiry-sensitive products (food, perishables) to bins closest to the pick face, ensuring the soonest-to-expire batch is picked first.',
      factorWeights: { capacity: 20, distance: 30, compatibility: 15, temperature: 20, pickingEfficiency: 15 },
      conditions: ['productCategory IN (FOOD, PERISHABLE, CHILLED)', 'shelfLifeDays <= 180', 'hasExpiryDate = true'],
      targetZones: ['PICK_FACE_A', 'PICK_FACE_B'],
    },
    {
      id: 'pr-002', ruleCode: 'PA-FIFO-002', ruleName: 'First In First Out (FIFO)',
      strategy: 'FIFO', priority: 2, isActive: true,
      description: 'Directs putaway of non-perishable raw materials to bins by arrival date — earliest received stock is positioned for first picking.',
      factorWeights: { capacity: 25, distance: 25, compatibility: 20, temperature: 10, pickingEfficiency: 20 },
      conditions: ['productCategory = RAW_MATERIAL', 'shelfLifeDays > 180', 'perishableFlag = false'],
      targetZones: ['BULK_STORAGE_A', 'BULK_STORAGE_B'],
    },
    {
      id: 'pr-003', ruleCode: 'PA-ABC-003', ruleName: 'ABC Classification Slotting',
      strategy: 'ABC', priority: 3, isActive: true,
      description: 'A-class items (top 20% revenue, fast-moving) slotted to ground-floor pick-face bins for maximum picking speed. B-class to mid-level. C-class to high reserve racks.',
      factorWeights: { capacity: 15, distance: 35, compatibility: 10, temperature: 5, pickingEfficiency: 35 },
      conditions: ['abcClass IN (A, B, C)', 'fsnClass IN (FAST, MEDIUM)'],
      targetZones: ['PICK_FACE_A', 'PICK_FACE_B', 'HIGH_RACK_C', 'HIGH_RACK_D'],
    },
    {
      id: 'pr-004', ruleCode: 'PA-CLSEMPTY-004', ruleName: 'Closest Empty Bin',
      strategy: 'CLOSEST_EMPTY', priority: 4, isActive: true,
      description: 'Fallback rule for items with no specific slotting rule — finds the geographically closest empty bin to the receiving dock, minimizing forklift travel distance.',
      factorWeights: { capacity: 30, distance: 40, compatibility: 15, temperature: 5, pickingEfficiency: 10 },
      conditions: ['ruleFallback = true', 'binStatus = EMPTY'],
      targetZones: ['ANY_ZONE'],
    },
    {
      id: 'pr-005', ruleCode: 'PA-FASTMV-005', ruleName: 'Fast-Moving Zone Slotting',
      strategy: 'FAST_MOVING_ZONE', priority: 5, isActive: true,
      description: 'Fast-moving SKUs (FSN=FAST, >50 picks/month) slotted to the fast-moving zone near the dispatch dock for outbound velocity optimization.',
      factorWeights: { capacity: 10, distance: 30, compatibility: 10, temperature: 5, pickingEfficiency: 45 },
      conditions: ['fsnClass = FAST', 'monthlyPickCount > 50', 'dispatchFrequency = DAILY'],
      targetZones: ['FAST_MOVING_ZONE_F', 'DISPATCH_STAGING_D01'],
    },
  ],
  warehousePallets: [
    {
      id: 'plt-001', palletBarcode: 'PAL-2026-0001', qrCode: 'QR-PAL-2026-0001',
      palletType: 'STANDARD', warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      currentLocation: 'A-05-03-12', currentZone: 'BULK_STORAGE_A',
      maxWeightKg: 1000, currentWeightKg: 750, weightUtilizationPct: 75,
      maxCartons: 48, currentCartons: 36, productCount: 3, cartonCount: 36,
      status: 'LOADED',
      loadedAt: '2026-07-09T08:35:00Z', storedAt: null,
      lastScanAt: '2026-07-09T08:58:00Z',
      createdAt: '2026-07-08T14:00:00Z', updatedAt: '2026-07-09T08:58:00Z',
    },
    {
      id: 'plt-002', palletBarcode: 'PAL-2026-0002', qrCode: 'QR-PAL-2026-0002',
      palletType: 'EURO', warehouseId: 'wh-rm-mum', warehouseName: 'Raw Material Warehouse',
      currentLocation: 'RECV-STG-01', currentZone: 'RECEIVING',
      maxWeightKg: 1200, currentWeightKg: 950, weightUtilizationPct: 79,
      maxCartons: 48, currentCartons: 40, productCount: 2, cartonCount: 40,
      status: 'LOADED',
      loadedAt: '2026-07-09T08:40:00Z', storedAt: null,
      lastScanAt: '2026-07-09T08:55:00Z',
      createdAt: '2026-07-08T14:15:00Z', updatedAt: '2026-07-09T08:55:00Z',
    },
    {
      id: 'plt-003', palletBarcode: 'PAL-2026-0003', qrCode: 'QR-PAL-2026-0003',
      palletType: 'CHEP', warehouseId: 'wh-cs-mum', warehouseName: 'Cold Storage Warehouse',
      currentLocation: 'B-CS-02-08', currentZone: 'CHILLED_ZONE_B',
      maxWeightKg: 1100, currentWeightKg: 880, weightUtilizationPct: 80,
      maxCartons: 40, currentCartons: 32, productCount: 2, cartonCount: 32,
      status: 'STORED',
      loadedAt: '2026-07-09T05:45:00Z', storedAt: '2026-07-09T06:20:00Z',
      lastScanAt: '2026-07-09T06:20:00Z',
      createdAt: '2026-07-08T10:00:00Z', updatedAt: '2026-07-09T06:20:00Z',
    },
    {
      id: 'plt-004', palletBarcode: 'PAL-2026-0004', qrCode: 'QR-PAL-2026-0004',
      palletType: 'STANDARD', warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      currentLocation: 'PALLET_POOL_01', currentZone: 'POOL',
      maxWeightKg: 1000, currentWeightKg: 0, weightUtilizationPct: 0,
      maxCartons: 48, currentCartons: 0, productCount: 0, cartonCount: 0,
      status: 'EMPTY',
      loadedAt: null, storedAt: null,
      lastScanAt: '2026-07-09T07:40:00Z',
      createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-07-09T07:40:00Z',
    },
  ],
  forkliftTasks: [
    {
      id: 'ft-001', taskNumber: 'FT-2026-0001',
      type: 'PUTAWAY', status: 'IN_PROGRESS', priority: 'HIGH',
      assignedOperatorId: 'usr-flt-01', assignedOperatorName: 'Rajesh Kumar',
      forkliftId: 'fl-001', forkliftCode: 'FL-01', forkliftType: 'COUNTERBALANCE',
      putawayTaskId: 'pt-001', putawayTaskNumber: 'PT-2026-0001',
      fromLocation: 'RECV-STG-01', toLocation: 'A-05-03-12',
      fromZone: 'RECEIVING', toZone: 'BULK_STORAGE_A',
      palletId: 'plt-001', palletBarcode: 'PAL-2026-0001',
      travelDistanceM: 85, estTravelTimeMin: 4, actualTravelTimeMin: 5,
      startedAt: '2026-07-09T08:30:00Z', completedAt: null,
      durationMin: 28,
      createdAt: '2026-07-09T08:20:00Z', updatedAt: '2026-07-09T08:58:00Z',
    },
    {
      id: 'ft-002', taskNumber: 'FT-2026-0002',
      type: 'TRANSFER', status: 'COMPLETED', priority: 'NORMAL',
      assignedOperatorId: 'usr-flt-02', assignedOperatorName: 'Sunil Yadav',
      forkliftId: 'fl-002', forkliftCode: 'FL-02', forkliftType: 'REACH_TRUCK',
      putawayTaskId: 'pt-002', putawayTaskNumber: 'PT-2026-0002',
      fromLocation: 'RECV-STG-02', toLocation: 'D-01-STG-01',
      fromZone: 'RECEIVING', toZone: 'DISPATCH_STAGING_D01',
      palletId: 'plt-004', palletBarcode: 'PAL-2026-0004',
      travelDistanceM: 45, estTravelTimeMin: 2, actualTravelTimeMin: 2,
      startedAt: '2026-07-09T07:00:00Z', completedAt: '2026-07-09T07:35:00Z',
      durationMin: 35,
      createdAt: '2026-07-09T06:50:00Z', updatedAt: '2026-07-09T07:35:00Z',
    },
    {
      id: 'ft-003', taskNumber: 'FT-2026-0003',
      type: 'PUTAWAY', status: 'ASSIGNED', priority: 'NORMAL',
      assignedOperatorId: 'usr-flt-03', assignedOperatorName: 'Deepak Sharma',
      forkliftId: 'fl-003', forkliftCode: 'FL-03', forkliftType: 'COUNTERBALANCE',
      putawayTaskId: 'pt-003', putawayTaskNumber: 'PT-2026-0003',
      fromLocation: 'RECV-STG-02', toLocation: 'C-08-04-22',
      fromZone: 'RECEIVING', toZone: 'HIGH_RACK_C',
      palletId: 'plt-002', palletBarcode: 'PAL-2026-0002',
      travelDistanceM: 120, estTravelTimeMin: 6, actualTravelTimeMin: null,
      startedAt: null, completedAt: null,
      durationMin: null,
      createdAt: '2026-07-09T08:55:00Z', updatedAt: '2026-07-09T08:55:00Z',
    },
    {
      id: 'ft-004', taskNumber: 'FT-2026-0004',
      type: 'PICKING', status: 'IN_PROGRESS', priority: 'EMERGENCY',
      assignedOperatorId: 'usr-flt-04', assignedOperatorName: 'Imran Sheikh',
      forkliftId: 'fl-004', forkliftCode: 'FL-04', forkliftType: 'ORDER_PICKER',
      putawayTaskId: null, putawayTaskNumber: null,
      fromLocation: 'B-CS-02-08', toLocation: 'PICK_FACE_A',
      fromZone: 'CHILLED_ZONE_B', toZone: 'PICK_FACE_A',
      palletId: 'plt-003', palletBarcode: 'PAL-2026-0003',
      travelDistanceM: 65, estTravelTimeMin: 3, actualTravelTimeMin: 4,
      startedAt: '2026-07-09T08:45:00Z', completedAt: null,
      durationMin: 18,
      createdAt: '2026-07-09T08:40:00Z', updatedAt: '2026-07-09T09:03:00Z',
    },
    {
      id: 'ft-005', taskNumber: 'FT-2026-0005',
      type: 'TRANSFER', status: 'COMPLETED', priority: 'HIGH',
      assignedOperatorId: 'usr-flt-01', assignedOperatorName: 'Rajesh Kumar',
      forkliftId: 'fl-001', forkliftCode: 'FL-01', forkliftType: 'COUNTERBALANCE',
      putawayTaskId: 'pt-004', putawayTaskNumber: 'PT-2026-0004',
      fromLocation: 'RECV-CHILL-01', toLocation: 'B-CS-02-08',
      fromZone: 'RECEIVING', toZone: 'CHILLED_ZONE_B',
      palletId: 'plt-003', palletBarcode: 'PAL-2026-0003',
      travelDistanceM: 95, estTravelTimeMin: 5, actualTravelTimeMin: 6,
      startedAt: '2026-07-09T05:30:00Z', completedAt: '2026-07-09T06:18:00Z',
      durationMin: 48,
      createdAt: '2026-07-09T05:20:00Z', updatedAt: '2026-07-09T06:18:00Z',
    },
  ],
}

// ─── Sprint 26 — Picking, Packing & Order Fulfillment Engine (PICKING_DATA) ────
// WmsPickingTask, WmsPickingTaskLine, PackingStation, PackingJob, CartonType, Carton, ShippingLabel
const PICKING_DATA = {
  pickingTasks: [
    {
      id: 'pkt-001',
      pickingNumber: 'PK-2026-0001',
      pickingDate: '2026-07-09T07:30:00Z',
      fulfillmentType: 'RETAIL_ORDER',
      pickingStrategy: 'SINGLE_ORDER',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      waveId: 'wv-001', waveNumber: 'WV-2026-0001',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0231',
      partnerId: 'bp-001', partnerName: 'Sudhastar Retail Mumbai',
      priority: 'HIGH', priorityScore: 80,
      pickerId: 'usr-pk-01', pickerName: 'Picker — Ramesh Patil',
      assignedAt: '2026-07-09T07:25:00Z',
      status: 'IN_PROGRESS',
      totalLines: 4, pickedLines: 2,
      totalQty: 120, pickedQty: 60,
      pickRouteId: 'pr-001', totalDistanceM: 145.50, estimatedTimeMin: 18,
      startedAt: '2026-07-09T07:30:00Z', pickedAt: null, packedAt: null, readyToShipAt: null, dispatchedAt: null,
      pickDurationMin: 14, packDurationMin: null,
      createdById: 'usr-mgr-01', createdByName: 'Warehouse Manager — Anita Desai',
      createdAt: '2026-07-09T07:20:00Z', updatedAt: '2026-07-09T07:44:00Z',
      lines: [
        { id: 'pkl-001', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12)', batchNumber: 'KK-2607-01', binCode: 'A-01-02-03', zoneCode: 'PICK_FACE_A', aisleCode: 'A-01', requiredQty: 24, pickedQty: 24, remainingQty: 0, fefoPriority: 1, expiryDate: '2026-10-15', binBarcodeScanned: 'BC-A010203', productBarcodeScanned: 'BC-KK-500-B12', batchBarcodeScanned: 'BC-KK-2607-01', barcodeVerified: true, pickSequence: 1, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T07:38:00Z', durationMinutes: 4 },
        { id: 'pkl-002', lineOrder: 20, productName: 'Soan Cake 1kg (Box of 6)', batchNumber: 'SC-2607-02', binCode: 'A-02-04-08', zoneCode: 'PICK_FACE_A', aisleCode: 'A-02', requiredQty: 36, pickedQty: 36, remainingQty: 0, fefoPriority: 2, expiryDate: '2026-11-30', binBarcodeScanned: 'BC-A020408', productBarcodeScanned: 'BC-SC-1K-B6', batchBarcodeScanned: 'BC-SC-2607-02', barcodeVerified: true, pickSequence: 2, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T07:42:00Z', durationMinutes: 4 },
        { id: 'pkl-003', lineOrder: 30, productName: 'Pista Roll 250g', batchNumber: 'PR-2607-03', binCode: 'B-03-05-12', zoneCode: 'PICK_FACE_B', aisleCode: 'B-03', requiredQty: 30, pickedQty: 0, remainingQty: 30, fefoPriority: 3, expiryDate: '2026-12-20', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 3, lineStatus: 'IN_PROGRESS', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
        { id: 'pkl-004', lineOrder: 40, productName: 'Anjeer Bar 200g', batchNumber: 'AB-2607-04', binCode: 'B-04-02-06', zoneCode: 'PICK_FACE_B', aisleCode: 'B-04', requiredQty: 30, pickedQty: 0, remainingQty: 30, fefoPriority: 4, expiryDate: '2027-01-10', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 4, lineStatus: 'PENDING', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
      ],
    },
    {
      id: 'pkt-002',
      pickingNumber: 'PK-2026-0002',
      pickingDate: '2026-07-09T06:00:00Z',
      fulfillmentType: 'WHOLESALE_ORDER',
      pickingStrategy: 'BATCH',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      waveId: 'wv-001', waveNumber: 'WV-2026-0001',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0228',
      partnerId: 'bp-002', partnerName: 'Maharashtra Wholesale Distributors',
      priority: 'NORMAL', priorityScore: 50,
      pickerId: 'usr-pk-02', pickerName: 'Picker — Suresh Kumar',
      assignedAt: '2026-07-09T05:55:00Z',
      status: 'PICKED',
      totalLines: 3, pickedLines: 3,
      totalQty: 360, pickedQty: 360,
      pickRouteId: 'pr-002', totalDistanceM: 220.00, estimatedTimeMin: 30,
      startedAt: '2026-07-09T06:00:00Z', pickedAt: '2026-07-09T06:32:00Z', packedAt: null, readyToShipAt: null, dispatchedAt: null,
      pickDurationMin: 32, packDurationMin: null,
      createdById: 'usr-mgr-01', createdByName: 'Warehouse Manager — Anita Desai',
      createdAt: '2026-07-09T05:45:00Z', updatedAt: '2026-07-09T06:32:00Z',
      lines: [
        { id: 'pkl-005', lineOrder: 10, productName: 'Kaju Katli 1kg (Box of 6)', batchNumber: 'KK-2607-08', binCode: 'A-05-04-10', zoneCode: 'BULK_STORAGE_A', aisleCode: 'A-05', requiredQty: 120, pickedQty: 120, remainingQty: 0, fefoPriority: 1, expiryDate: '2026-12-15', binBarcodeScanned: 'BC-A050410', productBarcodeScanned: 'BC-KK-1K-B6', batchBarcodeScanned: 'BC-KK-2607-08', barcodeVerified: true, pickSequence: 1, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T06:12:00Z', durationMinutes: 12 },
        { id: 'pkl-006', lineOrder: 20, productName: 'Soan Cake 2kg (Box of 3)', batchNumber: 'SC-2607-09', binCode: 'A-06-03-08', zoneCode: 'BULK_STORAGE_A', aisleCode: 'A-06', requiredQty: 144, pickedQty: 144, remainingQty: 0, fefoPriority: 2, expiryDate: '2027-01-20', binBarcodeScanned: 'BC-A060308', productBarcodeScanned: 'BC-SC-2K-B3', batchBarcodeScanned: 'BC-SC-2607-09', barcodeVerified: true, pickSequence: 2, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T06:22:00Z', durationMinutes: 10 },
        { id: 'pkl-007', lineOrder: 30, productName: 'Dry Fruit Mix 1kg', batchNumber: 'DFM-2607-10', binCode: 'A-08-02-04', zoneCode: 'BULK_STORAGE_A', aisleCode: 'A-08', requiredQty: 96, pickedQty: 96, remainingQty: 0, fefoPriority: 3, expiryDate: '2027-02-10', binBarcodeScanned: 'BC-A080204', productBarcodeScanned: 'BC-DFM-1K-01', batchBarcodeScanned: 'BC-DFM-2607-10', barcodeVerified: true, pickSequence: 3, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T06:32:00Z', durationMinutes: 10 },
      ],
    },
    {
      id: 'pkt-003',
      pickingNumber: 'PK-2026-0003',
      pickingDate: '2026-07-09T08:00:00Z',
      fulfillmentType: 'DISTRIBUTOR_ORDER',
      pickingStrategy: 'WAVE',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      waveId: 'wv-002', waveNumber: 'WV-2026-0002',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0245',
      partnerId: 'bp-003', partnerName: 'Pune Distributors Network',
      priority: 'HIGH', priorityScore: 75,
      pickerId: 'usr-pk-03', pickerName: 'Picker — Imran Khan',
      assignedAt: '2026-07-09T07:55:00Z',
      status: 'PENDING',
      totalLines: 5, pickedLines: 0,
      totalQty: 480, pickedQty: 0,
      pickRouteId: 'pr-003', totalDistanceM: 285.00, estimatedTimeMin: 35,
      startedAt: null, pickedAt: null, packedAt: null, readyToShipAt: null, dispatchedAt: null,
      pickDurationMin: null, packDurationMin: null,
      createdById: 'usr-mgr-01', createdByName: 'Warehouse Manager — Anita Desai',
      createdAt: '2026-07-09T07:50:00Z', updatedAt: '2026-07-09T07:55:00Z',
      lines: [
        { id: 'pkl-008', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12)', batchNumber: 'KK-2607-15', binCode: 'A-01-02-05', zoneCode: 'PICK_FACE_A', aisleCode: 'A-01', requiredQty: 96, pickedQty: 0, remainingQty: 96, fefoPriority: 1, expiryDate: '2026-10-25', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 1, lineStatus: 'PENDING', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
        { id: 'pkl-009', lineOrder: 20, productName: 'Soan Cake 1kg (Box of 6)', batchNumber: 'SC-2607-16', binCode: 'A-02-04-10', zoneCode: 'PICK_FACE_A', aisleCode: 'A-02', requiredQty: 96, pickedQty: 0, remainingQty: 96, fefoPriority: 2, expiryDate: '2026-12-05', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 2, lineStatus: 'PENDING', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
        { id: 'pkl-010', lineOrder: 30, productName: 'Pista Roll 250g', batchNumber: 'PR-2607-17', binCode: 'B-03-05-08', zoneCode: 'PICK_FACE_B', aisleCode: 'B-03', requiredQty: 96, pickedQty: 0, remainingQty: 96, fefoPriority: 3, expiryDate: '2026-12-25', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 3, lineStatus: 'PENDING', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
        { id: 'pkl-011', lineOrder: 40, productName: 'Anjeer Bar 200g', batchNumber: 'AB-2607-18', binCode: 'B-04-02-08', zoneCode: 'PICK_FACE_B', aisleCode: 'B-04', requiredQty: 96, pickedQty: 0, remainingQty: 96, fefoPriority: 4, expiryDate: '2027-01-15', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 4, lineStatus: 'PENDING', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
        { id: 'pkl-012', lineOrder: 50, productName: 'Mixed Dry Fruit 500g', batchNumber: 'MDF-2607-19', binCode: 'B-05-03-04', zoneCode: 'PICK_FACE_B', aisleCode: 'B-05', requiredQty: 96, pickedQty: 0, remainingQty: 96, fefoPriority: 5, expiryDate: '2027-02-20', binBarcodeScanned: null, productBarcodeScanned: null, batchBarcodeScanned: null, barcodeVerified: false, pickSequence: 5, lineStatus: 'PENDING', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: null, durationMinutes: null },
      ],
    },
    {
      id: 'pkt-004',
      pickingNumber: 'PK-2026-0004',
      pickingDate: '2026-07-09T05:00:00Z',
      fulfillmentType: 'RESTAURANT_REPLENISHMENT',
      pickingStrategy: 'ZONE',
      warehouseId: 'wh-cs-mum', warehouseName: 'Cold Storage Warehouse',
      waveId: 'wv-003', waveNumber: 'WV-2026-0003',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0218',
      partnerId: 'bp-004', partnerName: 'Mumbai Restaurant Group',
      priority: 'EMERGENCY', priorityScore: 95,
      pickerId: 'usr-pk-04', pickerName: 'Picker — Lakshmi Iyer',
      assignedAt: '2026-07-09T04:55:00Z',
      status: 'PACKED',
      totalLines: 3, pickedLines: 3,
      totalQty: 90, pickedQty: 90,
      pickRouteId: 'pr-004', totalDistanceM: 95.00, estimatedTimeMin: 15,
      startedAt: '2026-07-09T05:00:00Z', pickedAt: '2026-07-09T05:18:00Z', packedAt: '2026-07-09T05:42:00Z', readyToShipAt: null, dispatchedAt: null,
      pickDurationMin: 18, packDurationMin: 24,
      createdById: 'usr-mgr-01', createdByName: 'Warehouse Manager — Anita Desai',
      createdAt: '2026-07-09T04:50:00Z', updatedAt: '2026-07-09T05:42:00Z',
      lines: [
        { id: 'pkl-013', lineOrder: 10, productName: 'Chilled Kaju Katli 500g (Box of 12)', batchNumber: 'CKK-2607-01', binCode: 'B-CS-02-08', zoneCode: 'CHILLED_ZONE_B', aisleCode: 'B-CS', requiredQty: 30, pickedQty: 30, remainingQty: 0, fefoPriority: 1, expiryDate: '2026-08-15', binBarcodeScanned: 'BC-BCS0208', productBarcodeScanned: 'BC-CKK-500-B12', batchBarcodeScanned: 'BC-CKK-2607-01', barcodeVerified: true, pickSequence: 1, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T05:08:00Z', durationMinutes: 8 },
        { id: 'pkl-014', lineOrder: 20, productName: 'Chilled Soan Cake 1kg (Box of 6)', batchNumber: 'CSC-2607-02', binCode: 'B-CS-03-12', zoneCode: 'CHILLED_ZONE_B', aisleCode: 'B-CS', requiredQty: 30, pickedQty: 30, remainingQty: 0, fefoPriority: 2, expiryDate: '2026-08-25', binBarcodeScanned: 'BC-BCS0312', productBarcodeScanned: 'BC-CSC-1K-B6', batchBarcodeScanned: 'BC-CSC-2607-02', barcodeVerified: true, pickSequence: 2, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T05:14:00Z', durationMinutes: 6 },
        { id: 'pkl-015', lineOrder: 30, productName: 'Refrigerated Dry Fruit Mix 1kg', batchNumber: 'RDM-2607-03', binCode: 'B-CS-04-05', zoneCode: 'CHILLED_ZONE_B', aisleCode: 'B-CS', requiredQty: 30, pickedQty: 30, remainingQty: 0, fefoPriority: 3, expiryDate: '2026-09-10', binBarcodeScanned: 'BC-BCS0405', productBarcodeScanned: 'BC-RDM-1K-01', batchBarcodeScanned: 'BC-RDM-2607-03', barcodeVerified: true, pickSequence: 3, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T05:18:00Z', durationMinutes: 4 },
      ],
    },
    {
      id: 'pkt-005',
      pickingNumber: 'PK-2026-0005',
      pickingDate: '2026-07-09T04:00:00Z',
      fulfillmentType: 'BRANCH_TRANSFER',
      pickingStrategy: 'PICK_AND_PASS',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      waveId: 'wv-004', waveNumber: 'WV-2026-0004',
      referenceType: 'TRANSFER_ORDER', referenceNumber: 'TO-2026-0067',
      partnerId: 'bp-005', partnerName: 'Pune Retail Branch',
      priority: 'NORMAL', priorityScore: 60,
      pickerId: 'usr-pk-05', pickerName: 'Picker — Vinod Mehta',
      assignedAt: '2026-07-09T03:55:00Z',
      status: 'READY_TO_SHIP',
      totalLines: 4, pickedLines: 4,
      totalQty: 240, pickedQty: 240,
      pickRouteId: 'pr-005', totalDistanceM: 175.50, estimatedTimeMin: 22,
      startedAt: '2026-07-09T04:00:00Z', pickedAt: '2026-07-09T04:25:00Z', packedAt: '2026-07-09T04:50:00Z', readyToShipAt: '2026-07-09T04:55:00Z', dispatchedAt: null,
      pickDurationMin: 25, packDurationMin: 25,
      createdById: 'usr-mgr-01', createdByName: 'Warehouse Manager — Anita Desai',
      createdAt: '2026-07-09T03:50:00Z', updatedAt: '2026-07-09T04:55:00Z',
      lines: [
        { id: 'pkl-016', lineOrder: 10, productName: 'Kaju Katli 500g (Box of 12)', batchNumber: 'KK-2607-20', binCode: 'A-01-02-04', zoneCode: 'PICK_FACE_A', aisleCode: 'A-01', requiredQty: 60, pickedQty: 60, remainingQty: 0, fefoPriority: 1, expiryDate: '2026-11-05', binBarcodeScanned: 'BC-A010204', productBarcodeScanned: 'BC-KK-500-B12', batchBarcodeScanned: 'BC-KK-2607-20', barcodeVerified: true, pickSequence: 1, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T04:08:00Z', durationMinutes: 8 },
        { id: 'pkl-017', lineOrder: 20, productName: 'Soan Cake 1kg (Box of 6)', batchNumber: 'SC-2607-21', binCode: 'A-02-04-09', zoneCode: 'PICK_FACE_A', aisleCode: 'A-02', requiredQty: 60, pickedQty: 60, remainingQty: 0, fefoPriority: 2, expiryDate: '2026-12-15', binBarcodeScanned: 'BC-A020409', productBarcodeScanned: 'BC-SC-1K-B6', batchBarcodeScanned: 'BC-SC-2607-21', barcodeVerified: true, pickSequence: 2, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T04:16:00Z', durationMinutes: 8 },
        { id: 'pkl-018', lineOrder: 30, productName: 'Pista Roll 250g', batchNumber: 'PR-2607-22', binCode: 'B-03-05-09', zoneCode: 'PICK_FACE_B', aisleCode: 'B-03', requiredQty: 60, pickedQty: 60, remainingQty: 0, fefoPriority: 3, expiryDate: '2026-12-28', binBarcodeScanned: 'BC-B030509', productBarcodeScanned: 'BC-PR-250-01', batchBarcodeScanned: 'BC-PR-2607-22', barcodeVerified: true, pickSequence: 3, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T04:22:00Z', durationMinutes: 6 },
        { id: 'pkl-019', lineOrder: 40, productName: 'Anjeer Bar 200g', batchNumber: 'AB-2607-23', binCode: 'B-04-02-07', zoneCode: 'PICK_FACE_B', aisleCode: 'B-04', requiredQty: 60, pickedQty: 60, remainingQty: 0, fefoPriority: 4, expiryDate: '2027-01-18', binBarcodeScanned: 'BC-B040207', productBarcodeScanned: 'BC-AB-200-01', batchBarcodeScanned: 'BC-AB-2607-23', barcodeVerified: true, pickSequence: 4, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-09T04:25:00Z', durationMinutes: 3 },
      ],
    },
    {
      id: 'pkt-006',
      pickingNumber: 'PK-2026-0006',
      pickingDate: '2026-07-08T14:00:00Z',
      fulfillmentType: 'EXPORT_ORDER',
      pickingStrategy: 'CART',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      waveId: 'wv-005', waveNumber: 'WV-2026-0005',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0199',
      partnerId: 'bp-006', partnerName: 'Dubai Exports FZE',
      priority: 'HIGH', priorityScore: 85,
      pickerId: 'usr-pk-06', pickerName: 'Picker — Javed Akhtar',
      assignedAt: '2026-07-08T13:55:00Z',
      status: 'DISPATCHED',
      totalLines: 4, pickedLines: 4,
      totalQty: 480, pickedQty: 480,
      pickRouteId: 'pr-006', totalDistanceM: 310.00, estimatedTimeMin: 40,
      startedAt: '2026-07-08T14:00:00Z', pickedAt: '2026-07-08T14:42:00Z', packedAt: '2026-07-08T15:30:00Z', readyToShipAt: '2026-07-08T15:40:00Z', dispatchedAt: '2026-07-08T16:30:00Z',
      pickDurationMin: 42, packDurationMin: 48,
      createdById: 'usr-mgr-01', createdByName: 'Warehouse Manager — Anita Desai',
      createdAt: '2026-07-08T13:50:00Z', updatedAt: '2026-07-08T16:30:00Z',
      lines: [
        { id: 'pkl-020', lineOrder: 10, productName: 'Premium Kaju Katli 1kg (Export Pack)', batchNumber: 'EKK-2607-30', binCode: 'C-05-04-12', zoneCode: 'EXPORT_ZONE_C', aisleCode: 'C-05', requiredQty: 120, pickedQty: 120, remainingQty: 0, fefoPriority: 1, expiryDate: '2027-03-15', binBarcodeScanned: 'BC-C050412', productBarcodeScanned: 'BC-EKK-1K-EP', batchBarcodeScanned: 'BC-EKK-2607-30', barcodeVerified: true, pickSequence: 1, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-08T14:15:00Z', durationMinutes: 15 },
        { id: 'pkl-021', lineOrder: 20, productName: 'Premium Soan Cake 2kg (Export Pack)', batchNumber: 'ESC-2607-31', binCode: 'C-06-03-08', zoneCode: 'EXPORT_ZONE_C', aisleCode: 'C-06', requiredQty: 120, pickedQty: 120, remainingQty: 0, fefoPriority: 2, expiryDate: '2027-04-20', binBarcodeScanned: 'BC-C060308', productBarcodeScanned: 'BC-ESC-2K-EP', batchBarcodeScanned: 'BC-ESC-2607-31', barcodeVerified: true, pickSequence: 2, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-08T14:28:00Z', durationMinutes: 13 },
        { id: 'pkl-022', lineOrder: 30, productName: 'Premium Pista Roll 500g (Export)', batchNumber: 'EPR-2607-32', binCode: 'C-07-02-04', zoneCode: 'EXPORT_ZONE_C', aisleCode: 'C-07', requiredQty: 120, pickedQty: 120, remainingQty: 0, fefoPriority: 3, expiryDate: '2027-05-10', binBarcodeScanned: 'BC-C070204', productBarcodeScanned: 'BC-EPR-500-EP', batchBarcodeScanned: 'BC-EPR-2607-32', barcodeVerified: true, pickSequence: 3, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-08T14:38:00Z', durationMinutes: 10 },
        { id: 'pkl-023', lineOrder: 40, productName: 'Premium Anjeer Bar 400g (Export)', batchNumber: 'EAB-2607-33', binCode: 'C-08-04-06', zoneCode: 'EXPORT_ZONE_C', aisleCode: 'C-08', requiredQty: 120, pickedQty: 120, remainingQty: 0, fefoPriority: 4, expiryDate: '2027-06-05', binBarcodeScanned: 'BC-C080406', productBarcodeScanned: 'BC-EAB-400-EP', batchBarcodeScanned: 'BC-EAB-2607-33', barcodeVerified: true, pickSequence: 4, lineStatus: 'PICKED', shortPickReason: null, exceptionType: null, exceptionNotes: null, pickedAt: '2026-07-08T14:42:00Z', durationMinutes: 4 },
      ],
    },
  ],
  packingStations: [
    { id: 'ps-001', warehouseId: 'wh-fg-mum', stationCode: 'PS-01', stationName: 'Standard Packing Station 01', stationType: 'STANDARD', hasLabelPrinter: true, hasScale: true, hasBarcodeScanner: true, hasConveyor: true, maxConcurrentJobs: 2, currentJobs: 1, status: 'BUSY', totalJobsCompleted: 348, avgPackTimeMin: 22, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-07-09T07:50:00Z' },
    { id: 'ps-002', warehouseId: 'wh-cs-mum', stationCode: 'PS-02', stationName: 'Cold Chain Packing Station 02', stationType: 'COLD', hasLabelPrinter: true, hasScale: true, hasBarcodeScanner: true, hasConveyor: false, maxConcurrentJobs: 1, currentJobs: 0, status: 'AVAILABLE', totalJobsCompleted: 156, avgPackTimeMin: 28, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-07-09T05:42:00Z' },
    { id: 'ps-003', warehouseId: 'wh-fg-mum', stationCode: 'PS-03', stationName: 'Export Packing Station 03', stationType: 'EXPORT', hasLabelPrinter: true, hasScale: true, hasBarcodeScanner: true, hasConveyor: true, maxConcurrentJobs: 1, currentJobs: 0, status: 'AVAILABLE', totalJobsCompleted: 89, avgPackTimeMin: 45, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-07-08T15:30:00Z' },
  ],
  packingJobs: [
    {
      id: 'pjb-001', jobNumber: 'PJB-2026-0001', jobDate: '2026-07-09T06:35:00Z',
      pickingTaskId: 'pkt-002', stationId: 'ps-001', stationCode: 'PS-01',
      packerId: 'usr-pk-05', packerName: 'Packer — Vinod Mehta', assignedAt: '2026-07-09T06:35:00Z',
      verificationRequired: true, verificationStatus: 'VERIFIED', verificationNotes: 'All 3 products verified against picking task PK-2026-0002. Quantities match.',
      cartonCount: 2, totalWeightKg: 36.50, totalVolumeM3: 0.18,
      photoUrls: ['https://cdn.suop.com/pjb-001/photo1.jpg', 'https://cdn.suop.com/pjb-001/photo2.jpg'],
      status: 'IN_PROGRESS',
      startedAt: '2026-07-09T06:35:00Z', completedAt: null, durationMinutes: null,
      labelPrinted: false, labelPrintedAt: null,
      createdById: 'usr-mgr-01', createdAt: '2026-07-09T06:33:00Z', updatedAt: '2026-07-09T07:00:00Z',
    },
    {
      id: 'pjb-002', jobNumber: 'PJB-2026-0002', jobDate: '2026-07-09T05:20:00Z',
      pickingTaskId: 'pkt-004', stationId: 'ps-002', stationCode: 'PS-02',
      packerId: 'usr-pk-04', packerName: 'Packer — Lakshmi Iyer', assignedAt: '2026-07-09T05:20:00Z',
      verificationRequired: true, verificationStatus: 'VERIFIED', verificationNotes: 'Cold-chain products verified. Temperature log attached.',
      cartonCount: 1, totalWeightKg: 12.80, totalVolumeM3: 0.06,
      photoUrls: ['https://cdn.suop.com/pjb-002/photo1.jpg'],
      status: 'LABELED',
      startedAt: '2026-07-09T05:20:00Z', completedAt: '2026-07-09T05:42:00Z', durationMinutes: 22,
      labelPrinted: true, labelPrintedAt: '2026-07-09T05:40:00Z',
      createdById: 'usr-mgr-01', createdAt: '2026-07-09T05:18:00Z', updatedAt: '2026-07-09T05:42:00Z',
    },
    {
      id: 'pjb-003', jobNumber: 'PJB-2026-0003', jobDate: '2026-07-09T04:30:00Z',
      pickingTaskId: 'pkt-005', stationId: 'ps-001', stationCode: 'PS-01',
      packerId: 'usr-pk-05', packerName: 'Packer — Vinod Mehta', assignedAt: '2026-07-09T04:30:00Z',
      verificationRequired: true, verificationStatus: 'VERIFIED', verificationNotes: 'All 4 products verified. Carton 1: 2 SKUs. Carton 2: 2 SKUs.',
      cartonCount: 2, totalWeightKg: 24.30, totalVolumeM3: 0.14,
      photoUrls: ['https://cdn.suop.com/pjb-003/photo1.jpg', 'https://cdn.suop.com/pjb-003/photo2.jpg', 'https://cdn.suop.com/pjb-003/photo3.jpg'],
      status: 'READY_TO_SHIP',
      startedAt: '2026-07-09T04:30:00Z', completedAt: '2026-07-09T04:50:00Z', durationMinutes: 20,
      labelPrinted: true, labelPrintedAt: '2026-07-09T04:52:00Z',
      createdById: 'usr-mgr-01', createdAt: '2026-07-09T04:28:00Z', updatedAt: '2026-07-09T04:55:00Z',
    },
    {
      id: 'pjb-004', jobNumber: 'PJB-2026-0004', jobDate: '2026-07-08T14:45:00Z',
      pickingTaskId: 'pkt-006', stationId: 'ps-003', stationCode: 'PS-03',
      packerId: 'usr-pk-06', packerName: 'Packer — Javed Akhtar', assignedAt: '2026-07-08T14:45:00Z',
      verificationRequired: true, verificationStatus: 'VERIFIED', verificationNotes: 'Export products verified. Customs documentation attached. Phytosanitary cert #PHY-2026-0042.',
      cartonCount: 4, totalWeightKg: 58.40, totalVolumeM3: 0.32,
      photoUrls: ['https://cdn.suop.com/pjb-004/photo1.jpg', 'https://cdn.suop.com/pjb-004/photo2.jpg', 'https://cdn.suop.com/pjb-004/photo3.jpg', 'https://cdn.suop.com/pjb-004/photo4.jpg'],
      status: 'READY_TO_SHIP',
      startedAt: '2026-07-08T14:45:00Z', completedAt: '2026-07-08T15:30:00Z', durationMinutes: 45,
      labelPrinted: true, labelPrintedAt: '2026-07-08T15:35:00Z',
      createdById: 'usr-mgr-01', createdAt: '2026-07-08T14:43:00Z', updatedAt: '2026-07-08T15:40:00Z',
    },
  ],
  cartonTypes: [
    { id: 'ct-001', cartonCode: 'CT-STD-01', cartonName: 'Standard Carton 30×20×20 cm', lengthCm: 30, widthCm: 20, heightCm: 20, volumeM3: 0.012, maxWeightKg: 15, emptyWeightKg: 0.45, cartonCategory: 'STANDARD', status: 'ACTIVE', createdAt: '2026-06-01T00:00:00Z' },
    { id: 'ct-002', cartonCode: 'CT-GBX-02', cartonName: 'Premium Gift Box 25×25×15 cm', lengthCm: 25, widthCm: 25, heightCm: 15, volumeM3: 0.0094, maxWeightKg: 8, emptyWeightKg: 0.65, cartonCategory: 'GIFT_BOX', status: 'ACTIVE', createdAt: '2026-06-01T00:00:00Z' },
    { id: 'ct-003', cartonCode: 'CT-EXP-03', cartonName: 'Export Carton 40×30×30 cm (Double Wall)', lengthCm: 40, widthCm: 30, heightCm: 30, volumeM3: 0.036, maxWeightKg: 25, emptyWeightKg: 1.20, cartonCategory: 'EXPORT', status: 'ACTIVE', createdAt: '2026-06-01T00:00:00Z' },
  ],
  cartons: [
    { id: 'ctn-001', cartonNumber: 'CTN-2026-0001', barcode: 'BC-CTN-2026-0001', cartonTypeId: 'ct-001', cartonTypeName: 'Standard Carton', packingJobId: 'pjb-001', pickingTaskId: 'pkt-002', productCount: 2, totalUnits: 240, weightKg: 18.50, labelPrinted: false, status: 'OPEN', sealedAt: null, createdAt: '2026-07-09T06:40:00Z', updatedAt: '2026-07-09T07:00:00Z' },
    { id: 'ctn-002', cartonNumber: 'CTN-2026-0002', barcode: 'BC-CTN-2026-0002', cartonTypeId: 'ct-001', cartonTypeName: 'Standard Carton', packingJobId: 'pjb-001', pickingTaskId: null, productCount: 1, totalUnits: 96, weightKg: 12.00, labelPrinted: false, status: 'OPEN', sealedAt: null, createdAt: '2026-07-09T06:45:00Z', updatedAt: '2026-07-09T07:00:00Z' },
    { id: 'ctn-003', cartonNumber: 'CTN-2026-0003', barcode: 'BC-CTN-2026-0003', cartonTypeId: 'ct-002', cartonTypeName: 'Premium Gift Box', packingJobId: 'pjb-002', pickingTaskId: 'pkt-004', productCount: 3, totalUnits: 90, weightKg: 12.80, labelPrinted: true, status: 'LABELED', sealedAt: '2026-07-09T05:38:00Z', createdAt: '2026-07-09T05:25:00Z', updatedAt: '2026-07-09T05:42:00Z' },
    { id: 'ctn-004', cartonNumber: 'CTN-2026-0004', barcode: 'BC-CTN-2026-0004', cartonTypeId: 'ct-001', cartonTypeName: 'Standard Carton', packingJobId: 'pjb-003', pickingTaskId: 'pkt-005', productCount: 4, totalUnits: 240, weightKg: 24.30, labelPrinted: true, status: 'LOADED', sealedAt: '2026-07-09T04:48:00Z', createdAt: '2026-07-09T04:35:00Z', updatedAt: '2026-07-09T05:00:00Z' },
    { id: 'ctn-005', cartonNumber: 'CTN-2026-0005', barcode: 'BC-CTN-2026-0005', cartonTypeId: 'ct-003', cartonTypeName: 'Export Carton', packingJobId: 'pjb-004', pickingTaskId: 'pkt-006', productCount: 4, totalUnits: 480, weightKg: 14.60, labelPrinted: true, status: 'SHIPPED', sealedAt: '2026-07-08T15:20:00Z', createdAt: '2026-07-08T14:50:00Z', updatedAt: '2026-07-08T16:30:00Z' },
  ],
  shippingLabels: [
    {
      id: 'sl-001', labelNumber: 'SHP-LBL-2026-0001', labelDate: '2026-07-09T05:40:00Z',
      labelType: 'ORDER_LABEL', packingJobId: 'pjb-002', cartonId: 'ctn-003', pickingTaskId: 'pkt-004',
      partnerId: 'bp-004', partnerName: 'Mumbai Restaurant Group',
      shipToName: 'Chef Rajesh Sharma', shipToAddress: 'Marine Drive Restaurant, 12 Marine Lines', shipToCity: 'Mumbai', shipToState: 'Maharashtra', shipToPincode: '400020',
      carrierName: 'Blue Dart', trackingNumber: 'BD-2026-MUM-00142',
      contentSummary: 'Chilled Kaju Katli (30u), Chilled Soan Cake (30u), Refrigerated Dry Fruit Mix (30u)',
      totalWeight: 12.80, totalCartons: 1, format: 'PDF', printStatus: 'PRINTED', printedAt: '2026-07-09T05:40:00Z',
      printedById: 'usr-pk-04', status: 'ACTIVE', createdAt: '2026-07-09T05:39:00Z',
    },
    {
      id: 'sl-002', labelNumber: 'SHP-LBL-2026-0002', labelDate: '2026-07-09T04:52:00Z',
      labelType: 'CARTON_LABEL', packingJobId: 'pjb-003', cartonId: 'ctn-004', pickingTaskId: 'pkt-005',
      partnerId: 'bp-005', partnerName: 'Pune Retail Branch',
      shipToName: 'Sudhastar Pune Branch Manager', shipToAddress: 'FC Road Branch, Shop 14, FC Road', shipToCity: 'Pune', shipToState: 'Maharashtra', shipToPincode: '411005',
      carrierName: 'Delhivery', trackingNumber: 'DLV-2026-PUN-00089',
      contentSummary: 'Kaju Katli (60u), Soan Cake (60u), Pista Roll (60u), Anjeer Bar (60u) — Branch Transfer',
      totalWeight: 24.30, totalCartons: 1, format: 'PDF', printStatus: 'PRINTED', printedAt: '2026-07-09T04:52:00Z',
      printedById: 'usr-pk-05', status: 'ACTIVE', createdAt: '2026-07-09T04:51:00Z',
    },
    {
      id: 'sl-003', labelNumber: 'SHP-LBL-2026-0003', labelDate: '2026-07-08T15:35:00Z',
      labelType: 'COURIER_LABEL', packingJobId: 'pjb-004', cartonId: 'ctn-005', pickingTaskId: 'pkt-006',
      partnerId: 'bp-006', partnerName: 'Dubai Exports FZE',
      shipToName: 'Mr. Abdul Rahman', shipToAddress: 'Jebel Ali Free Zone, Office 402, Building 7', shipToCity: 'Dubai', shipToState: 'Dubai', shipToPincode: '00000',
      carrierName: 'DHL Express', trackingNumber: 'DHL-EXPORT-2026-0042',
      contentSummary: 'Premium Kaju Katli 1kg Export (120u), Premium Soan Cake 2kg Export (120u), Premium Pista Roll 500g Export (120u), Premium Anjeer Bar 400g Export (120u)',
      totalWeight: 14.60, totalCartons: 1, format: 'ZPL', printStatus: 'PRINTED', printedAt: '2026-07-08T15:35:00Z',
      printedById: 'usr-pk-06', status: 'ACTIVE', createdAt: '2026-07-08T15:34:00Z',
    },
    {
      id: 'sl-004', labelNumber: 'SHP-LBL-2026-0004', labelDate: '2026-07-09T06:55:00Z',
      labelType: 'PALLET_LABEL', packingJobId: 'pjb-001', cartonId: null, pickingTaskId: 'pkt-002',
      partnerId: 'bp-002', partnerName: 'Maharashtra Wholesale Distributors',
      shipToName: 'Mr. Suresh Distributor', shipToAddress: 'Wholesale Hub, APMC Market, Vashi', shipToCity: 'Navi Mumbai', shipToState: 'Maharashtra', shipToPincode: '400703',
      carrierName: 'DTDC', trackingNumber: null,
      contentSummary: 'Wholesale pallet — 3 SKUs (360 units total). Cartons: CTN-2026-0001 + CTN-2026-0002.',
      totalWeight: 36.50, totalCartons: 2, format: 'PDF', printStatus: 'PENDING', printedAt: null,
      printedById: null, status: 'ACTIVE', createdAt: '2026-07-09T06:55:00Z',
    },
  ],
}

// ─── Sprint 27: Dispatch, Shipping & Load Management Engine ──
const DISPATCH_DATA = {
  // ─── Dispatch Orders (6) ───
  dispatchOrders: [
    {
      id: 'do-001', dispatchNumber: 'DSP-2026-0001', dispatchDate: '2026-07-09T07:00:00Z',
      dispatchType: 'RETAIL_DISPATCH',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      partnerId: 'bp-001', partnerName: 'Sudhastar Retail Mumbai',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0231',
      vehicleId: 'dv-001', vehicleNumber: 'MH-04-AB-1234',
      driverName: 'Rajesh Patil', driverPhone: '+91-98200-12345',
      carrierName: 'Sudhastar Own Fleet',
      routeId: 'rt-001', routeName: 'Mumbai City Retail Route', deliverySequence: 1,
      priority: 'HIGH',
      status: 'VEHICLE_ASSIGNED',
      totalOrders: 1, totalLines: 4, totalCartons: 2, totalPallets: 0,
      totalQty: 120, totalWeightKg: 18.50, totalVolumeM3: 0.09,
      plannedDispatchAt: '2026-07-09T08:00:00Z', loadingStartedAt: null, loadingCompletedAt: null, sealedAt: null, gateExitAt: null, dispatchedAt: null, loadingDurationMin: null,
      createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah', createdAt: '2026-07-09T05:30:00Z', updatedAt: '2026-07-09T06:45:00Z',
    },
    {
      id: 'do-002', dispatchNumber: 'DSP-2026-0002', dispatchDate: '2026-07-09T06:00:00Z',
      dispatchType: 'DISTRIBUTOR_DISPATCH',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      partnerId: 'bp-002', partnerName: 'Maharashtra Wholesale Distributors',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0228',
      vehicleId: 'dv-002', vehicleNumber: 'MH-04-CD-5678',
      driverName: 'Suresh Kumar', driverPhone: '+91-98200-23456',
      carrierName: 'VRL Logistics (3PL)',
      routeId: 'rt-002', routeName: 'Pune-Nashik Distributor Route', deliverySequence: 1,
      priority: 'NORMAL',
      status: 'LOADED',
      totalOrders: 1, totalLines: 3, totalCartons: 6, totalPallets: 1,
      totalQty: 360, totalWeightKg: 36.50, totalVolumeM3: 0.18,
      plannedDispatchAt: '2026-07-09T09:00:00Z', loadingStartedAt: '2026-07-09T06:35:00Z', loadingCompletedAt: '2026-07-09T07:05:00Z', sealedAt: null, gateExitAt: null, dispatchedAt: null, loadingDurationMin: 30,
      createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah', createdAt: '2026-07-09T05:00:00Z', updatedAt: '2026-07-09T07:05:00Z',
    },
    {
      id: 'do-003', dispatchNumber: 'DSP-2026-0003', dispatchDate: '2026-07-09T05:00:00Z',
      dispatchType: 'RESTAURANT_REPLENISHMENT',
      warehouseId: 'wh-cs-mum', warehouseName: 'Cold Storage Warehouse',
      partnerId: 'bp-003', partnerName: 'Mumbai Restaurant Group',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0218',
      vehicleId: 'dv-003', vehicleNumber: 'MH-04-EF-9012',
      driverName: 'Imran Sheikh', driverPhone: '+91-98200-34567',
      carrierName: 'Cold Chain Express',
      routeId: 'rt-003', routeName: 'Mumbai City Restaurant Cold Route', deliverySequence: 1,
      priority: 'EMERGENCY',
      status: 'SEALED',
      totalOrders: 1, totalLines: 3, totalCartons: 1, totalPallets: 0,
      totalQty: 90, totalWeightKg: 12.80, totalVolumeM3: 0.06,
      plannedDispatchAt: '2026-07-09T06:00:00Z', loadingStartedAt: '2026-07-09T05:10:00Z', loadingCompletedAt: '2026-07-09T05:30:00Z', sealedAt: '2026-07-09T05:42:00Z', gateExitAt: null, dispatchedAt: null, loadingDurationMin: 20,
      createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah', createdAt: '2026-07-09T04:30:00Z', updatedAt: '2026-07-09T05:42:00Z',
    },
    {
      id: 'do-004', dispatchNumber: 'DSP-2026-0004', dispatchDate: '2026-07-09T04:00:00Z',
      dispatchType: 'BRANCH_TRANSFER',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      partnerId: 'bp-005', partnerName: 'Pune Retail Branch',
      referenceType: 'TRANSFER_ORDER', referenceNumber: 'TO-2026-0067',
      vehicleId: 'dv-004', vehicleNumber: 'MH-12-GH-3456',
      driverName: 'Vinod Mehta', driverPhone: '+91-98200-45678',
      carrierName: 'Sudhastar Own Fleet',
      routeId: 'rt-002', routeName: 'Pune-Nashik Distributor Route', deliverySequence: 2,
      priority: 'NORMAL',
      status: 'LOADING',
      totalOrders: 1, totalLines: 4, totalCartons: 2, totalPallets: 0,
      totalQty: 240, totalWeightKg: 24.30, totalVolumeM3: 0.14,
      plannedDispatchAt: '2026-07-09T10:00:00Z', loadingStartedAt: '2026-07-09T04:20:00Z', loadingCompletedAt: null, sealedAt: null, gateExitAt: null, dispatchedAt: null, loadingDurationMin: null,
      createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah', createdAt: '2026-07-09T03:30:00Z', updatedAt: '2026-07-09T04:20:00Z',
    },
    {
      id: 'do-005', dispatchNumber: 'DSP-2026-0005', dispatchDate: '2026-07-08T14:00:00Z',
      dispatchType: 'EXPORT_SHIPMENT',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      partnerId: 'bp-006', partnerName: 'Dubai Exports FZE',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0199',
      vehicleId: 'dv-005', vehicleNumber: 'CONT-MUM-EXP-001',
      driverName: 'Javed Akhtar', driverPhone: '+91-98200-56789',
      carrierName: 'DHL Global Forwarding',
      routeId: 'rt-004', routeName: 'Mumbai Port → Jebel Ali (Export)', deliverySequence: 1,
      priority: 'HIGH',
      status: 'DISPATCHED',
      totalOrders: 1, totalLines: 4, totalCartons: 4, totalPallets: 1,
      totalQty: 480, totalWeightKg: 58.40, totalVolumeM3: 0.32,
      plannedDispatchAt: '2026-07-08T16:00:00Z', loadingStartedAt: '2026-07-08T13:30:00Z', loadingCompletedAt: '2026-07-08T14:15:00Z', sealedAt: '2026-07-08T14:30:00Z', gateExitAt: '2026-07-08T14:55:00Z', dispatchedAt: '2026-07-08T15:00:00Z', loadingDurationMin: 45,
      createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah', createdAt: '2026-07-08T12:00:00Z', updatedAt: '2026-07-08T15:00:00Z',
    },
    {
      id: 'do-006', dispatchNumber: 'DSP-2026-0006', dispatchDate: '2026-07-09T09:00:00Z',
      dispatchType: 'COURIER_SHIPMENT',
      warehouseId: 'wh-fg-mum', warehouseName: 'Finished Goods Warehouse',
      partnerId: 'bp-008', partnerName: 'Bengaluru E-Commerce Customer',
      referenceType: 'SALES_ORDER', referenceNumber: 'SO-2026-0252',
      vehicleId: 'dv-005', vehicleNumber: 'KA-01-MN-7890',
      driverName: 'Mohan Das', driverPhone: '+91-98200-67890',
      carrierName: 'Delhivery Express',
      routeId: 'rt-005', routeName: 'Mumbai-Bengaluru Air Route', deliverySequence: 1,
      priority: 'NORMAL',
      status: 'PLANNED',
      totalOrders: 1, totalLines: 2, totalCartons: 1, totalPallets: 0,
      totalQty: 60, totalWeightKg: 8.20, totalVolumeM3: 0.04,
      plannedDispatchAt: '2026-07-09T15:00:00Z', loadingStartedAt: null, loadingCompletedAt: null, sealedAt: null, gateExitAt: null, dispatchedAt: null, loadingDurationMin: null,
      createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah', createdAt: '2026-07-09T08:30:00Z', updatedAt: '2026-07-09T08:30:00Z',
    },
  ],

  // ─── Dispatch Vehicles (5) ───
  dispatchVehicles: [
    {
      id: 'dv-001', vehicleNumber: 'MH-04-AB-1234', vehicleType: 'TRUCK',
      maxWeightKg: 5000, maxVolumeM3: 25, palletCapacity: 8,
      isTemperatureControlled: false, minTemp: null, maxTemp: null,
      ownershipType: 'OWN_FLEET',
      driverName: 'Rajesh Patil', driverPhone: '+91-98200-12345', driverLicense: 'MH0420190001234', helperName: 'Salim Ansari',
      hasGPS: true, gpsDeviceId: 'GPS-MUM-TRK-001',
      status: 'ASSIGNED',
      totalTrips: 348, avgUtilization: 78.5,
      createdAt: '2025-04-12T08:00:00Z', updatedAt: '2026-07-09T06:45:00Z',
    },
    {
      id: 'dv-002', vehicleNumber: 'MH-04-CD-5678', vehicleType: 'CONTAINER',
      maxWeightKg: 12000, maxVolumeM3: 45, palletCapacity: 18,
      isTemperatureControlled: false, minTemp: null, maxTemp: null,
      ownershipType: 'THIRD_PARTY',
      driverName: 'Suresh Kumar', driverPhone: '+91-98200-23456', driverLicense: 'MH0420170005678', helperName: 'Bablu Yadav',
      hasGPS: true, gpsDeviceId: 'GPS-VRL-014',
      status: 'LOADED',
      totalTrips: 892, avgUtilization: 84.2,
      createdAt: '2024-11-03T10:00:00Z', updatedAt: '2026-07-09T07:05:00Z',
    },
    {
      id: 'dv-003', vehicleNumber: 'MH-04-EF-9012', vehicleType: 'REFRIGERATED',
      maxWeightKg: 3500, maxVolumeM3: 18, palletCapacity: 6,
      isTemperatureControlled: true, minTemp: 2, maxTemp: 8,
      ownershipType: 'THIRD_PARTY',
      driverName: 'Imran Sheikh', driverPhone: '+91-98200-34567', driverLicense: 'MH0420180009012', helperName: 'Kamal Singh',
      hasGPS: true, gpsDeviceId: 'GPS-CCE-007',
      status: 'LOADED',
      totalTrips: 521, avgUtilization: 71.8,
      createdAt: '2025-01-22T09:00:00Z', updatedAt: '2026-07-09T05:42:00Z',
    },
    {
      id: 'dv-004', vehicleNumber: 'MH-12-GH-3456', vehicleType: 'TEMPO',
      maxWeightKg: 1500, maxVolumeM3: 8, palletCapacity: 2,
      isTemperatureControlled: false, minTemp: null, maxTemp: null,
      ownershipType: 'OWN_FLEET',
      driverName: 'Vinod Mehta', driverPhone: '+91-98200-45678', driverLicense: 'MH1220190003456', helperName: null,
      hasGPS: true, gpsDeviceId: 'GPS-MUM-TMP-002',
      status: 'LOADING',
      totalTrips: 612, avgUtilization: 65.3,
      createdAt: '2025-06-15T11:00:00Z', updatedAt: '2026-07-09T04:20:00Z',
    },
    {
      id: 'dv-005', vehicleNumber: 'CONT-MUM-EXP-001', vehicleType: 'FLATBED',
      maxWeightKg: 20000, maxVolumeM3: 60, palletCapacity: 24,
      isTemperatureControlled: false, minTemp: null, maxTemp: null,
      ownershipType: 'RENTAL',
      driverName: 'Javed Akhtar', driverPhone: '+91-98200-56789', driverLicense: 'MH0420160001111', helperName: 'Ravi Kumar',
      hasGPS: false, gpsDeviceId: null,
      status: 'IN_TRANSIT',
      totalTrips: 78, avgUtilization: 92.1,
      createdAt: '2026-02-08T14:00:00Z', updatedAt: '2026-07-08T15:00:00Z',
    },
  ],

  // ─── Load Plans (3) ───
  loadPlans: [
    {
      id: 'lp-001', dispatchOrderId: 'do-002', dispatchNumber: 'DSP-2026-0002', vehicleId: 'dv-002', vehicleNumber: 'MH-04-CD-5678',
      planDate: '2026-07-09T05:30:00Z',
      totalWeightKg: 36.50, maxWeightKg: 12000, weightUtilization: 0.30,
      totalVolumeM3: 0.18, maxVolumeM3: 45, volumeUtilization: 0.40,
      palletPositions: 1, maxPalletPositions: 18,
      loadingSequence: [
        { sequence: 1, productName: 'Kaju Katli 500g', cartonCount: 2, weightKg: 12.20, dockDoor: 'DD-03' },
        { sequence: 2, productName: 'Soan Cake 1kg', cartonCount: 2, weightKg: 12.10, dockDoor: 'DD-03' },
        { sequence: 3, productName: 'Pista Roll 250g', cartonCount: 2, weightKg: 12.20, dockDoor: 'DD-03' },
      ],
      status: 'COMPLETED',
      createdById: 'usr-ds-01', createdAt: '2026-07-09T05:15:00Z', updatedAt: '2026-07-09T07:05:00Z',
    },
    {
      id: 'lp-002', dispatchOrderId: 'do-003', dispatchNumber: 'DSP-2026-0003', vehicleId: 'dv-003', vehicleNumber: 'MH-04-EF-9012',
      planDate: '2026-07-09T04:45:00Z',
      totalWeightKg: 12.80, maxWeightKg: 3500, weightUtilization: 0.37,
      totalVolumeM3: 0.06, maxVolumeM3: 18, volumeUtilization: 0.33,
      palletPositions: 0, maxPalletPositions: 6,
      loadingSequence: [
        { sequence: 1, productName: 'Chilled Kaju Katli', cartonCount: 1, weightKg: 4.50, dockDoor: 'CD-04' },
        { sequence: 2, productName: 'Chilled Soan Cake', cartonCount: 1, weightKg: 4.20, dockDoor: 'CD-04' },
        { sequence: 3, productName: 'Refrigerated Dry Fruit Mix', cartonCount: 1, weightKg: 4.10, dockDoor: 'CD-04' },
      ],
      status: 'COMPLETED',
      createdById: 'usr-ds-01', createdAt: '2026-07-09T04:35:00Z', updatedAt: '2026-07-09T05:30:00Z',
    },
    {
      id: 'lp-003', dispatchOrderId: 'do-005', dispatchNumber: 'DSP-2026-0005', vehicleId: 'dv-005', vehicleNumber: 'CONT-MUM-EXP-001',
      planDate: '2026-07-08T12:30:00Z',
      totalWeightKg: 58.40, maxWeightKg: 20000, weightUtilization: 0.29,
      totalVolumeM3: 0.32, maxVolumeM3: 60, volumeUtilization: 0.53,
      palletPositions: 1, maxPalletPositions: 24,
      loadingSequence: [
        { sequence: 1, productName: 'Premium Kaju Katli 1kg Export', cartonCount: 1, weightKg: 14.80, dockDoor: 'DD-03' },
        { sequence: 2, productName: 'Premium Soan Cake 2kg Export', cartonCount: 1, weightKg: 15.20, dockDoor: 'DD-03' },
        { sequence: 3, productName: 'Premium Pista Roll 500g Export', cartonCount: 1, weightKg: 14.40, dockDoor: 'DD-03' },
        { sequence: 4, productName: 'Premium Anjeer Bar 400g Export', cartonCount: 1, weightKg: 14.00, dockDoor: 'DD-03' },
      ],
      status: 'COMPLETED',
      createdById: 'usr-ds-01', createdAt: '2026-07-08T12:15:00Z', updatedAt: '2026-07-08T14:15:00Z',
    },
  ],

  // ─── Shipping Documents (4) ───
  shippingDocuments: [
    {
      id: 'sd-001', documentNumber: 'DOC-DC-2026-0001', documentDate: '2026-07-09T07:10:00Z',
      documentType: 'DELIVERY_CHALLAN',
      dispatchOrderId: 'do-002', dispatchNumber: 'DSP-2026-0002',
      partnerId: 'bp-002', partnerName: 'Maharashtra Wholesale Distributors',
      shipToAddress: 'Wholesale Hub, APMC Market, Vashi, Navi Mumbai 400703',
      fileUrl: '/docs/dispatch/DC-2026-0001.pdf', fileSizeBytes: 184320,
      format: 'PDF',
      status: 'PRINTED',
      generatedAt: '2026-07-09T07:10:00Z', printedAt: '2026-07-09T07:15:00Z',
      createdById: 'usr-ds-01', createdAt: '2026-07-09T07:10:00Z',
    },
    {
      id: 'sd-002', documentNumber: 'DOC-PL-2026-0002', documentDate: '2026-07-09T05:25:00Z',
      documentType: 'PACKING_LIST',
      dispatchOrderId: 'do-003', dispatchNumber: 'DSP-2026-0003',
      partnerId: 'bp-003', partnerName: 'Mumbai Restaurant Group',
      shipToAddress: 'Marine Drive Restaurant, 12 Marine Lines, Mumbai 400020',
      fileUrl: '/docs/dispatch/PL-2026-0002.pdf', fileSizeBytes: 92160,
      format: 'PDF',
      status: 'SENT',
      generatedAt: '2026-07-09T05:25:00Z', printedAt: '2026-07-09T05:28:00Z',
      createdById: 'usr-ds-01', createdAt: '2026-07-09T05:25:00Z',
    },
    {
      id: 'sd-003', documentNumber: 'DOC-DM-2026-0003', documentDate: '2026-07-08T14:25:00Z',
      documentType: 'DELIVERY_MANIFEST',
      dispatchOrderId: 'do-005', dispatchNumber: 'DSP-2026-0005',
      partnerId: 'bp-006', partnerName: 'Dubai Exports FZE',
      shipToAddress: 'Jebel Ali Free Zone, Office 402, Building 7, Dubai',
      fileUrl: '/docs/dispatch/DM-2026-0003.pdf', fileSizeBytes: 245760,
      format: 'PDF',
      status: 'GENERATED',
      generatedAt: '2026-07-08T14:25:00Z', printedAt: null,
      createdById: 'usr-ds-01', createdAt: '2026-07-08T14:25:00Z',
    },
    {
      id: 'sd-004', documentNumber: 'DOC-EB-2026-0004', documentDate: '2026-07-09T07:30:00Z',
      documentType: 'E_WAY_BILL_REF',
      dispatchOrderId: 'do-001', dispatchNumber: 'DSP-2026-0001',
      partnerId: 'bp-001', partnerName: 'Sudhastar Retail Mumbai',
      shipToAddress: 'Andheri East Retail Store, Mumbai 400069',
      fileUrl: null, fileSizeBytes: null,
      format: 'PDF',
      status: 'PENDING',
      generatedAt: null, printedAt: null,
      createdById: 'usr-ds-01', createdAt: '2026-07-09T07:30:00Z',
    },
  ],

  // ─── Vehicle Seals (2) ───
  vehicleSeals: [
    {
      id: 'vs-001', dispatchOrderId: 'do-003', dispatchNumber: 'DSP-2026-0003',
      sealNumber: 'SEAL-BOLT-2026-0042', sealType: 'BOLT',
      appliedAt: '2026-07-09T05:35:00Z', appliedById: 'usr-ds-02', appliedByName: 'Loading Supervisor — Prakash Jadhav',
      verifiedAt: '2026-07-09T05:42:00Z', verifiedById: 'usr-ds-03', verifiedByName: 'Security Officer — Mahesh Tiwari',
      brokenAt: null, brokenBy: null, brokenReason: null,
      status: 'VERIFIED',
      createdAt: '2026-07-09T05:35:00Z',
    },
    {
      id: 'vs-002', dispatchOrderId: 'do-005', dispatchNumber: 'DSP-2026-0005',
      sealNumber: 'SEAL-TP-2026-0078', sealType: 'TAMPER_PROOF',
      appliedAt: '2026-07-08T14:30:00Z', appliedById: 'usr-ds-02', appliedByName: 'Loading Supervisor — Prakash Jadhav',
      verifiedAt: null, verifiedById: null, verifiedByName: null,
      brokenAt: null, brokenBy: null, brokenReason: null,
      status: 'APPLIED',
      createdAt: '2026-07-08T14:30:00Z',
    },
  ],

  // ─── Gate Exit Logs (2) ───
  gateExitLogs: [
    {
      id: 'gel-001', exitNumber: 'EXIT-2026-0001', exitDate: '2026-07-08T14:55:00Z',
      dispatchOrderId: 'do-005', dispatchNumber: 'DSP-2026-0005',
      vehicleNumber: 'CONT-MUM-EXP-001', driverName: 'Javed Akhtar',
      securityOfficerId: 'usr-sec-01', securityOfficerName: 'Security Officer — Mahesh Tiwari',
      sealVerified: true, documentsVerified: true, vehicleInspected: true,
      exitTime: '2026-07-08T14:55:00Z', approvedById: 'usr-sec-02', approvedByName: 'Security Manager — Deepak Nair',
      status: 'EXITED',
      remarks: 'Export shipment cleared — customs docs verified, container sealed, GPS offline (rental flatbed).',
      createdAt: '2026-07-08T14:50:00Z',
    },
    {
      id: 'gel-002', exitNumber: 'EXIT-2026-0002', exitDate: '2026-07-09T05:42:00Z',
      dispatchOrderId: 'do-003', dispatchNumber: 'DSP-2026-0003',
      vehicleNumber: 'MH-04-EF-9012', driverName: 'Imran Sheikh',
      securityOfficerId: 'usr-sec-01', securityOfficerName: 'Security Officer — Mahesh Tiwari',
      sealVerified: true, documentsVerified: true, vehicleInspected: false,
      exitTime: null, approvedById: null, approvedByName: null,
      status: 'PENDING',
      remarks: 'Cold chain dispatch — awaiting final vehicle inspection before gate exit.',
      createdAt: '2026-07-09T05:42:00Z',
    },
  ],
}

// ─── HTTP Server ────────────────────────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (method === 'OPTIONS') return new Response(null, { headers })

    // ─── Auth Endpoints ───────────────────────────────

    // POST /api/auth/register
    if (path === '/api/auth/register' && method === 'POST') {
      try {
        const body = await req.json()
        const { email, password, firstName, lastName } = body

        if (!email || !password) {
          return new Response(JSON.stringify(errorResponse('Email and password are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }

        // Validate password policy (Epic 4)
        const policyCheck = validatePasswordPolicy(password)
        if (!policyCheck.valid) {
          return new Response(JSON.stringify(errorResponse('Password does not meet policy requirements', 'VALIDATION_ERROR', 400)), {
            status: 400,
            headers,
          })
        }

        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { firstName, lastName, displayName: `${firstName} ${lastName}` },
          },
        })

        if (error) {
          log('warn', 'Registration failed', { email, error: error.message })
          return new Response(JSON.stringify(errorResponse(error.message, 'REGISTRATION_ERROR', 400)), { status: 400, headers })
        }

        log('info', 'User registered', { email, userId: data.user?.id })
        return new Response(JSON.stringify(successResponse({
          user: data.user ? {
            id: data.user.id,
            email: data.user.email,
          } : null,
          session: data.session ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          } : null,
        }, 'Registration successful. Please check your email for verification.')), { headers })
      } catch (error) {
        log('error', 'Registration error', { error: error instanceof Error ? error.message : 'Unknown' })
        return new Response(JSON.stringify(errorResponse('Registration failed')), { status: 500, headers })
      }
    }

    // POST /api/auth/login
    if (path === '/api/auth/login' && method === 'POST') {
      try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
          return new Response(JSON.stringify(errorResponse('Email and password are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }

        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          log('warn', 'Login failed', { email, error: error.message })
          // Audit: Failed login (Epic 9)
          log('info', 'AUDIT: Failed login attempt', { email, ipAddress: req.headers.get('x-forwarded-for') || 'unknown' })
          return new Response(JSON.stringify(errorResponse(error.message, 'INVALID_CREDENTIALS', 401)), { status: 401, headers })
        }

        // Audit: Successful login (Epic 9)
        log('info', 'AUDIT: User logged in', { userId: data.user?.id, email, ipAddress: req.headers.get('x-forwarded-for') || 'unknown' })

        return new Response(JSON.stringify(successResponse({
          user: {
            id: data.user?.id,
            email: data.user?.email,
            metadata: data.user?.user_metadata,
          },
          session: {
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
            expiresAt: data.session?.expires_at,
          },
        }, 'Login successful')), { headers })
      } catch (error) {
        log('error', 'Login error', { error: error instanceof Error ? error.message : 'Unknown' })
        return new Response(JSON.stringify(errorResponse('Login failed')), { status: 500, headers })
      }
    }

    // POST /api/auth/logout
    if (path === '/api/auth/logout' && method === 'POST') {
      try {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (token) {
          const supabase = getSupabaseClient(token)
          await supabase.auth.signOut()
          log('info', 'AUDIT: User logged out', { token: token.substring(0, 20) + '...' })
        }

        return new Response(JSON.stringify(successResponse(null, 'Logout successful')), { headers })
      } catch (error) {
        return new Response(JSON.stringify(errorResponse('Logout failed')), { status: 500, headers })
      }
    }

    // GET /api/auth/me
    if (path === '/api/auth/me' && method === 'GET') {
      try {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
          return new Response(JSON.stringify(errorResponse('No token provided', 'UNAUTHORIZED', 401)), { status: 401, headers })
        }

        const supabase = getSupabaseClient(token)
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          return new Response(JSON.stringify(errorResponse('Invalid or expired token', 'TOKEN_INVALID', 401)), { status: 401, headers })
        }

        return new Response(JSON.stringify(successResponse({
          id: data.user.id,
          email: data.user.email,
          emailVerified: data.user.email_confirmed_at !== null,
          metadata: data.user.user_metadata,
          createdAt: data.user.created_at,
          lastSignIn: data.user.last_sign_in_at,
        }, 'User details')), { headers })
      } catch {
        return new Response(JSON.stringify(errorResponse('Failed to get user', 'UNAUTHORIZED', 401)), { status: 401, headers })
      }
    }

    // POST /api/auth/refresh
    if (path === '/api/auth/refresh' && method === 'POST') {
      try {
        const body = await req.json()
        const { refreshToken } = body

        if (!refreshToken) {
          return new Response(JSON.stringify(errorResponse('Refresh token required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }

        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })

        if (error) {
          return new Response(JSON.stringify(errorResponse(error.message, 'TOKEN_EXPIRED', 401)), { status: 401, headers })
        }

        return new Response(JSON.stringify(successResponse({
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
          expiresAt: data.session?.expires_at,
        }, 'Token refreshed')), { headers })
      } catch {
        return new Response(JSON.stringify(errorResponse('Token refresh failed')), { status: 500, headers })
      }
    }

    // POST /api/auth/forgot-password
    if (path === '/api/auth/forgot-password' && method === 'POST') {
      try {
        const body = await req.json()
        const { email } = body

        if (!email) {
          return new Response(JSON.stringify(errorResponse('Email required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }

        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${url.origin}/auth/reset-password`,
        })

        if (error) {
          return new Response(JSON.stringify(errorResponse(error.message, 'RESET_ERROR', 400)), { status: 400, headers })
        }

        log('info', 'AUDIT: Password reset requested', { email })
        return new Response(JSON.stringify(successResponse(null, 'Password reset link sent to email')), { headers })
      } catch {
        return new Response(JSON.stringify(errorResponse('Failed to send reset email')), { status: 500, headers })
      }
    }

    // POST /api/auth/change-password
    if (path === '/api/auth/change-password' && method === 'POST') {
      try {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (!token) {
          return new Response(JSON.stringify(errorResponse('Authentication required', 'UNAUTHORIZED', 401)), { status: 401, headers })
        }

        const body = await req.json()
        const { newPassword } = body

        // Validate password policy (Epic 4)
        const policyCheck = validatePasswordPolicy(newPassword)
        if (!policyCheck.valid) {
          return new Response(JSON.stringify(errorResponse(policyCheck.errors.join(', '), 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }

        const supabase = getSupabaseClient(token)
        const { data, error } = await supabase.auth.updateUser({ password: newPassword })

        if (error) {
          return new Response(JSON.stringify(errorResponse(error.message, 'PASSWORD_CHANGE_ERROR', 400)), { status: 400, headers })
        }

        log('info', 'AUDIT: Password changed', { userId: data.user?.id })
        return new Response(JSON.stringify(successResponse(null, 'Password changed successfully')), { headers })
      } catch {
        return new Response(JSON.stringify(errorResponse('Failed to change password')), { status: 500, headers })
      }
    }

    // POST /api/auth/send-verification
    if (path === '/api/auth/send-verification' && method === 'POST') {
      try {
        const body = await req.json()
        const { email } = body

        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.resend({ type: 'signup', email })

        if (error) {
          return new Response(JSON.stringify(errorResponse(error.message, 'VERIFICATION_ERROR', 400)), { status: 400, headers })
        }

        log('info', 'AUDIT: Email verification sent', { email })
        return new Response(JSON.stringify(successResponse(null, 'Verification email sent')), { headers })
      } catch {
        return new Response(JSON.stringify(errorResponse('Failed to send verification')), { status: 500, headers })
      }
    }

    // ─── Session Endpoints (Epic 5) ──────────────────

    // GET /api/sessions (mock — would query database in production)
    if (path === '/api/sessions' && method === 'GET') {
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(JSON.stringify(errorResponse('Authentication required', 'UNAUTHORIZED', 401)), { status: 401, headers })
      }

      return new Response(JSON.stringify(successResponse([
        {
          id: 'session-1',
          deviceType: 'DESKTOP',
          deviceName: 'Chrome on Windows',
          ipAddress: '192.168.1.50',
          loginAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          status: 'ACTIVE',
          isCurrent: true,
        }
      ], 'Active sessions')), { headers })
    }

    // DELETE /api/sessions/all
    if (path === '/api/sessions/all' && method === 'DELETE') {
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(JSON.stringify(errorResponse('Authentication required', 'UNAUTHORIZED', 401)), { status: 401, headers })
      }

      log('info', 'AUDIT: All sessions revoked', { token: authHeader.substring(7, 27) + '...' })
      return new Response(JSON.stringify(successResponse(null, 'All sessions revoked')), { headers })
    }

    // ─── Device Endpoints (Epic 6) ───────────────────

    // GET /api/devices
    if (path === '/api/devices' && method === 'GET') {
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(JSON.stringify(errorResponse('Authentication required', 'UNAUTHORIZED', 401)), { status: 401, headers })
      }

      return new Response(JSON.stringify(successResponse([
        {
          id: 'device-1',
          deviceType: 'DESKTOP',
          deviceName: 'Chrome on Windows 11',
          operatingSystem: 'Windows 11',
          browserName: 'Chrome',
          lastActiveAt: new Date().toISOString(),
          isTrusted: true,
        }
      ], 'Registered devices')), { headers })
    }

    // ─── Health Endpoints (from Sprint 2) ────────────

    // GET /api/health
    if (path === '/api/health' && method === 'GET') {
      const services = await Promise.all([
        checkService('PostgreSQL', process.env.DATABASE_HOST || 'localhost', parseInt(process.env.DATABASE_PORT || '5432')),
        checkService('Redis', process.env.REDIS_HOST || 'localhost', parseInt(process.env.REDIS_PORT || '6379')),
        checkService('RabbitMQ', process.env.RABBITMQ_HOST || 'localhost', parseInt(process.env.RABBITMQ_PORT || '5672')),
        checkService('MinIO Storage', process.env.MINIO_HOST || 'localhost', parseInt(process.env.MINIO_PORT || '9000')),
        checkService('OpenSearch', process.env.OPENSEARCH_HOST || 'localhost', parseInt(process.env.OPENSEARCH_PORT || '9200')),
      ])

      const allHealthy = services.every(s => s.status === 'healthy')
      return new Response(JSON.stringify({
        status: allHealthy ? 'healthy' : 'degraded',
        database: services[0].status,
        redis: services[1].status,
        rabbitmq: services[2].status,
        storage: services[3].status,
        search: services[4].status,
        version: VERSION,
        timestamp: new Date().toISOString(),
        services,
      }), { headers })
    }

    // GET /api/info
    if (path === '/api/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Backend',
        version: VERSION,
        sprint: 3,
        sprintName: 'Enterprise Identity Platform',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'POST /api/auth/refresh',
          'GET /api/auth/me',
          'POST /api/auth/change-password',
          'POST /api/auth/forgot-password',
          'POST /api/auth/send-verification',
          'GET /api/sessions',
          'DELETE /api/sessions/all',
          'GET /api/devices',
          'GET /api/health',
        ],
      }, 'SUOP Backend v3.0.0 — Identity Platform')), { headers })
    }

    // GET /api/modules
    if (path === '/api/modules' && method === 'GET') {
      return new Response(JSON.stringify(successResponse([
        { code: 'PLT', name: 'Platform', status: 'active', entities: 120, sprint: 2 },
        { code: 'IDM', name: 'Identity', status: 'active', entities: 7, sprint: 3 },
        { code: 'ORG', name: 'Organization', status: 'active', entities: 15, sprint: 4 },
        { code: 'RBAC', name: 'Authorization', status: 'active', entities: 18, sprint: 5 },
        { code: 'PRD', name: 'Product Foundation', status: 'active', entities: 12, sprint: 6 },
        { code: 'PIM', name: 'Product Information Management', status: 'active', entities: 10, sprint: 7 },
        { code: 'COM', name: 'Commercial Engine', status: 'active', entities: 16, sprint: 8 },
        { code: 'BP', name: 'Business Partner', status: 'active', entities: 12, sprint: 9 },
        { code: 'ID', name: 'Identification & Traceability', status: 'active', entities: 11, sprint: 10 },
        { code: 'GOV', name: 'Data Governance & Quality', status: 'active', entities: 15, sprint: 11 },
        { code: 'INV', name: 'Inventory Engine', status: 'active', entities: 8, sprint: 12 },
        { code: 'GRN', name: 'Goods Receipt & Putaway', status: 'active', entities: 5, sprint: 13 },
        { code: 'ISS', name: 'Stock Issue & Outbound', status: 'active', entities: 6, sprint: 14 },
        { code: 'TRF', name: 'Stock Transfer & Transit', status: 'active', entities: 4, sprint: 15 },
        { code: 'ADJ', name: 'Adjustment & Reconciliation', status: 'active', entities: 6, sprint: 16 },
        { code: 'RES', name: 'Reservation & Allocation', status: 'active', entities: 4, sprint: 17 },
        { code: 'CC', name: 'Cycle Count & Audit', status: 'active', entities: 6, sprint: 18 },
        { code: 'BAT', name: 'Batch & Expiry Management', status: 'active', entities: 7, sprint: 19 },
        { code: 'COST', name: 'Costing & Valuation', status: 'active', entities: 7, sprint: 20 },
        { code: 'ANL', name: 'Inventory Analytics & Mission Control', status: 'active', entities: 6, sprint: 21 },
        { code: 'WHS', name: 'Warehouse Management', status: 'active', entities: 38, sprint: 27 },
        { code: 'MFG', name: 'Manufacturing', status: 'planned', entities: 25, sprint: 18 },
        { code: 'FIN', name: 'Finance', status: 'planned', entities: 100, sprint: 18 },
      ], 'Modules')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 8 — COMMERCIAL ENGINE ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Price Lists ───────────────────────────────────────
    // GET /api/commercial/price-lists
    if (path === '/api/commercial/price-lists' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.priceLists, 'Price lists')), { headers })
    }
    // POST /api/commercial/price-lists
    if (path === '/api/commercial/price-lists' && method === 'POST') {
      try {
        const body = await req.json()
        const pl = {
          id: crypto.randomUUID(),
          code: body.code,
          name: body.name,
          type: body.type || 'RETAIL',
          currency: body.currency || 'INR',
          validFrom: body.validFrom || new Date().toISOString(),
          validTo: body.validTo || null,
          priority: body.priority || 100,
          status: body.status || 'DRAFT',
          taxMode: body.taxMode || 'EXCLUSIVE',
          itemCount: 0,
          createdAt: new Date().toISOString(),
        }
        COMMERCIAL_DATA.priceLists.push(pl)
        log('info', 'Price list created', { code: pl.code, type: pl.type })
        return new Response(JSON.stringify(successResponse(pl, 'Price list created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // ─── Tax Groups & Rates ────────────────────────────────
    // GET /api/commercial/tax-groups
    if (path === '/api/commercial/tax-groups' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.taxGroups, 'Tax groups')), { headers })
    }
    // POST /api/commercial/tax-groups
    if (path === '/api/commercial/tax-groups' && method === 'POST') {
      try {
        const body = await req.json()
        const tg = {
          id: crypto.randomUUID(),
          code: body.code,
          name: body.name,
          type: body.type || 'GST',
          isCompound: body.isCompound || false,
          status: 'ACTIVE',
          rates: body.rates || [],
          createdAt: new Date().toISOString(),
        }
        COMMERCIAL_DATA.taxGroups.push(tg)
        log('info', 'Tax group created', { code: tg.code })
        return new Response(JSON.stringify(successResponse(tg, 'Tax group created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // ─── Discount Rules ────────────────────────────────────
    // GET /api/commercial/discounts
    if (path === '/api/commercial/discounts' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.discounts, 'Discount rules')), { headers })
    }
    // POST /api/commercial/discounts
    if (path === '/api/commercial/discounts' && method === 'POST') {
      try {
        const body = await req.json()
        const d = {
          id: crypto.randomUUID(),
          code: body.code,
          name: body.name,
          type: body.type || 'PERCENTAGE',
          discountValue: body.discountValue,
          discountType: body.discountType || 'PERCENTAGE',
          maxDiscountAmount: body.maxDiscountAmount || null,
          isStackable: body.isStackable || false,
          validFrom: body.validFrom || new Date().toISOString(),
          validTo: body.validTo || null,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }
        COMMERCIAL_DATA.discounts.push(d)
        log('info', 'Discount rule created', { code: d.code, type: d.type })
        return new Response(JSON.stringify(successResponse(d, 'Discount rule created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // ─── Promotions ────────────────────────────────────────
    // GET /api/commercial/promotions
    if (path === '/api/commercial/promotions' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.promotions, 'Promotions')), { headers })
    }
    // POST /api/commercial/promotions
    if (path === '/api/commercial/promotions' && method === 'POST') {
      try {
        const body = await req.json()
        const p = {
          id: crypto.randomUUID(),
          code: body.code,
          name: body.name,
          type: body.type || 'AUTOMATIC',
          offerType: body.offerType || 'PERCENT_OFF',
          offerValue: body.offerValue,
          channels: body.channels || ['ALL'],
          validFrom: body.validFrom || new Date().toISOString(),
          validTo: body.validTo || null,
          maxUsageCount: body.maxUsageCount || null,
          usedCount: 0,
          priority: body.priority || 100,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }
        COMMERCIAL_DATA.promotions.push(p)
        log('info', 'Promotion created', { code: p.code, type: p.type })
        return new Response(JSON.stringify(successResponse(p, 'Promotion created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // ─── Future Prices ─────────────────────────────────────
    // GET /api/commercial/future-prices
    if (path === '/api/commercial/future-prices' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.futurePrices, 'Future prices')), { headers })
    }
    // POST /api/commercial/future-prices
    if (path === '/api/commercial/future-prices' && method === 'POST') {
      try {
        const body = await req.json()
        const fp = {
          id: crypto.randomUUID(),
          productId: body.productId,
          productName: body.productName || 'Product',
          currentPrice: body.currentPrice,
          futurePrice: body.futurePrice,
          changePercent: body.futurePrice && body.currentPrice
            ? Number((((body.futurePrice - body.currentPrice) / body.currentPrice) * 100).toFixed(2))
            : 0,
          effectiveDate: body.effectiveDate,
          expiryDate: body.expiryDate || null,
          autoActivate: body.autoActivate !== false,
          status: body.approvalRequired ? 'PENDING_APPROVAL' : 'SCHEDULED',
          createdAt: new Date().toISOString(),
        }
        COMMERCIAL_DATA.futurePrices.push(fp)
        log('info', 'Future price scheduled', { productId: fp.productId, effectiveDate: fp.effectiveDate })
        return new Response(JSON.stringify(successResponse(fp, 'Future price scheduled')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // ─── Price Approval Requests ───────────────────────────
    // GET /api/commercial/approvals
    if (path === '/api/commercial/approvals' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.approvals, 'Price approval requests')), { headers })
    }
    // POST /api/commercial/approvals/:id/approve
    if (path.match(/^\/api\/commercial\/approvals\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[4]
      const apr = COMMERCIAL_DATA.approvals.find(a => a.id === id)
      if (!apr) return new Response(JSON.stringify(errorResponse('Approval request not found', 'NOT_FOUND', 404)), { status: 404, headers })
      const stages = ['DRAFT', 'PRICING_TEAM', 'FINANCE', 'MANAGEMENT', 'APPROVED', 'PUBLISHED']
      const idx = stages.indexOf(apr.currentStage)
      if (idx < 0 || idx >= stages.length - 1) {
        return new Response(JSON.stringify(errorResponse('Cannot advance further')), { status: 400, headers })
      }
      apr.currentStage = stages[idx + 1]
      apr.status = apr.currentStage === 'PUBLISHED' ? 'PUBLISHED' : 'IN_REVIEW'
      log('info', 'Approval advanced', { id, stage: apr.currentStage })
      return new Response(JSON.stringify(successResponse(apr, `Advanced to ${apr.currentStage}`)), { headers })
    }

    // ─── Cost & Margin ─────────────────────────────────────
    // GET /api/commercial/cost-profiles
    if (path === '/api/commercial/cost-profiles' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.costProfiles, 'Cost profiles')), { headers })
    }

    // ─── Commercial Rules ──────────────────────────────────
    // GET /api/commercial/rules
    if (path === '/api/commercial/rules' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.rules, 'Commercial rules')), { headers })
    }

    // ─── Price Resolution Service (Chief Architect Rec) ────
    // POST /api/commercial/resolve-price
    // Body: { productId, productName, customerId?, branchId?, channelId, quantity, uomId?, basePrice? }
    // Returns: { basePrice, listPrice, discounts, promotions, taxableAmount, taxComponents, taxAmount, finalPrice, resolutionTrace }
    if (path === '/api/commercial/resolve-price' && method === 'POST') {
      const startTime = Date.now()
      try {
        const body = await req.json()
        const { productId, productName, customerId, branchId, channelId, quantity = 1, basePrice } = body

        if (!productId) {
          return new Response(JSON.stringify(errorResponse('productId is required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }

        const trace: any[] = []
        // Step 1: Base price
        let bp = basePrice
        if (!bp) {
          const pl = COMMERCIAL_DATA.priceLists.find(p => p.status === 'ACTIVE')
          bp = pl ? 250 : 250 // default for demo
        }
        trace.push({ step: 'BASE_PRICE', source: 'PRICE_LIST', value: bp })

        // Step 2: Customer-specific price list check (highest priority)
        let listPrice = bp
        trace.push({ step: 'LIST_PRICE', value: listPrice })

        // Step 3: Quantity breaks
        if (quantity >= 10) {
          listPrice = Number((listPrice * 0.95).toFixed(2))
          trace.push({ step: 'QUANTITY_BREAK', quantity, discountPercent: 5, value: listPrice })
        }

        // Step 4: Apply discounts
        const appliedDiscounts: any[] = []
        let discountAmount = 0
        for (const d of COMMERCIAL_DATA.discounts.filter(x => x.status === 'ACTIVE')) {
          const now = new Date()
          if (d.validFrom && new Date(d.validFrom) > now) continue
          if (d.validTo && new Date(d.validTo) < now) continue
          let amt = 0
          if (d.discountType === 'PERCENTAGE') {
            amt = Number((listPrice * Number(d.discountValue) / 100).toFixed(2))
            if (d.maxDiscountAmount && amt > Number(d.maxDiscountAmount)) {
              amt = Number(d.maxDiscountAmount)
            }
          } else {
            amt = Number(d.discountValue)
          }
          if (amt > 0) {
            appliedDiscounts.push({ code: d.code, name: d.name, type: d.type, amount: amt })
            discountAmount += amt
            if (!d.isStackable) break
          }
        }
        trace.push({ step: 'DISCOUNTS_APPLIED', count: appliedDiscounts.length, totalAmount: discountAmount })

        // Step 5: Apply promotions
        const appliedPromotions: any[] = []
        let promotionAmount = 0
        for (const p of COMMERCIAL_DATA.promotions.filter(x => x.status === 'ACTIVE')) {
          const now = new Date()
          if (p.validFrom && new Date(p.validFrom) > now) continue
          if (p.validTo && new Date(p.validTo) < now) continue
          if (p.channels && !p.channels.includes('ALL') && !p.channels.includes(channelId)) continue
          if (p.maxUsageCount && p.usedCount >= p.maxUsageCount) continue
          let amt = 0
          if (p.offerType === 'PERCENT_OFF') {
            amt = Number((listPrice * Number(p.offerValue) / 100).toFixed(2))
          } else if (p.offerType === 'FLAT_OFF') {
            amt = Number(p.offerValue)
          }
          if (amt > 0) {
            appliedPromotions.push({ code: p.code, name: p.name, type: p.offerType, amount: amt })
            promotionAmount += amt
            p.usedCount++
          }
        }
        trace.push({ step: 'PROMOTIONS_APPLIED', count: appliedPromotions.length, totalAmount: promotionAmount })

        // Step 6: Taxable amount
        const taxableAmount = Number(Math.max(0, listPrice - discountAmount - promotionAmount).toFixed(2))
        trace.push({ step: 'TAXABLE_AMOUNT', value: taxableAmount })

        // Step 7: Tax calculation (GST 5% default for food)
        const taxComponents: any[] = []
        let taxAmount = 0
        const gstRate = 0.05
        const isInterState = false // simplified
        if (isInterState) {
          const igst = Number((taxableAmount * gstRate).toFixed(2))
          taxComponents.push({ component: 'IGST', rate: 5, amount: igst })
          taxAmount += igst
        } else {
          const cgst = Number((taxableAmount * gstRate / 2).toFixed(2))
          const sgst = Number((taxableAmount * gstRate / 2).toFixed(2))
          taxComponents.push({ component: 'CGST', rate: 2.5, amount: cgst })
          taxComponents.push({ component: 'SGST', rate: 2.5, amount: sgst })
          taxAmount += cgst + sgst
        }
        trace.push({ step: 'TAX_CALCULATED', mode: 'EXCLUSIVE', components: taxComponents.length, totalAmount: taxAmount })

        // Step 8: Final price
        const finalPrice = Number((taxableAmount + taxAmount).toFixed(2))
        trace.push({ step: 'FINAL_PRICE', value: finalPrice })

        const responseTimeMs = Date.now() - startTime
        const requestId = crypto.randomUUID()

        // Log resolution
        COMMERCIAL_DATA.resolutionLogs.unshift({
          requestId,
          channelId: channelId || 'UNKNOWN',
          productId,
          productName: productName || 'Product',
          customerId: customerId || null,
          branchId: branchId || null,
          quantity,
          basePrice: bp,
          listPrice,
          appliedDiscounts,
          appliedPromotions,
          discountAmount,
          promotionAmount,
          taxableAmount,
          taxComponents,
          taxAmount,
          finalPrice,
          resolutionTrace: trace,
          requestedAt: new Date().toISOString(),
          responseTimeMs,
        })

        log('info', 'Price resolved', { requestId, productId, finalPrice, responseTimeMs })

        return new Response(JSON.stringify(successResponse({
          requestId,
          basePrice: bp,
          listPrice,
          appliedDiscounts,
          appliedPromotions,
          discountAmount,
          promotionAmount,
          taxableAmount,
          taxComponents,
          taxAmount,
          finalPrice,
          resolutionTrace: trace,
          responseTimeMs,
        }, 'Price resolved')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Price resolution failed')), { status: 500, headers })
      }
    }

    // GET /api/commercial/resolution-logs
    if (path === '/api/commercial/resolution-logs' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(COMMERCIAL_DATA.resolutionLogs.slice(0, 50), 'Resolution logs (last 50)')), { headers })
    }

    // GET /api/commercial/dashboard
    if (path === '/api/commercial/dashboard' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        counts: {
          priceLists: COMMERCIAL_DATA.priceLists.length,
          activePriceLists: COMMERCIAL_DATA.priceLists.filter(p => p.status === 'ACTIVE').length,
          taxGroups: COMMERCIAL_DATA.taxGroups.length,
          discountRules: COMMERCIAL_DATA.discounts.length,
          activeDiscounts: COMMERCIAL_DATA.discounts.filter(d => d.status === 'ACTIVE').length,
          promotions: COMMERCIAL_DATA.promotions.length,
          activePromotions: COMMERCIAL_DATA.promotions.filter(p => p.status === 'ACTIVE').length,
          futurePrices: COMMERCIAL_DATA.futurePrices.length,
          pendingApprovals: COMMERCIAL_DATA.approvals.filter(a => a.status !== 'PUBLISHED' && a.status !== 'REJECTED').length,
          commercialRules: COMMERCIAL_DATA.rules.length,
          costProfiles: COMMERCIAL_DATA.costProfiles.length,
          resolutionLogsToday: COMMERCIAL_DATA.resolutionLogs.length,
        },
        recentApprovals: COMMERCIAL_DATA.approvals.slice(0, 5),
        upcomingFuturePrices: COMMERCIAL_DATA.futurePrices
          .filter(f => new Date(f.effectiveDate) > new Date())
          .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime())
          .slice(0, 5),
      }, 'Commercial dashboard')), { headers })
    }

    // GET /api/commercial/info
    if (path === '/api/commercial/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Commercial Engine',
        version: '8.0.0',
        sprint: 8,
        sprintName: 'Enterprise Pricing, Taxation & Commercial Engine',
        endpoints: [
          'GET    /api/commercial/price-lists',
          'POST   /api/commercial/price-lists',
          'GET    /api/commercial/tax-groups',
          'POST   /api/commercial/tax-groups',
          'GET    /api/commercial/discounts',
          'POST   /api/commercial/discounts',
          'GET    /api/commercial/promotions',
          'POST   /api/commercial/promotions',
          'GET    /api/commercial/future-prices',
          'POST   /api/commercial/future-prices',
          'GET    /api/commercial/approvals',
          'POST   /api/commercial/approvals/:id/approve',
          'GET    /api/commercial/cost-profiles',
          'GET    /api/commercial/rules',
          'POST   /api/commercial/resolve-price',
          'GET    /api/commercial/resolution-logs',
          'GET    /api/commercial/dashboard',
          'GET    /api/commercial/info',
        ],
        priceResolutionFlow: [
          'BASE_PRICE → LIST_PRICE → QUANTITY_BREAK → DISCOUNTS → PROMOTIONS',
          '→ TAXABLE_AMOUNT → TAX (CGST+SGST or IGST) → FINAL_PRICE',
        ],
        channels: ['RETAIL_POS', 'RESTAURANT_POS', 'ERP', 'ECOMMERCE', 'CUSTOMER_PORTAL'],
      }, 'SUOP Commercial Engine v8.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 9 — BUSINESS PARTNER ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Business Partners ─────────────────────────────────
    // GET /api/business-partners
    if (path === '/api/business-partners' && method === 'GET') {
      const roleFilter = url.searchParams.get('role')
      const typeFilter = url.searchParams.get('type')
      let partners = BP_DATA.partners
      if (roleFilter) partners = partners.filter(p => p.roles.includes(roleFilter.toUpperCase()))
      if (typeFilter) partners = partners.filter(p => p.partnerType === typeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(partners, `${partners.length} business partners`)), { headers })
    }
    // POST /api/business-partners
    if (path === '/api/business-partners' && method === 'POST') {
      try {
        const body = await req.json()
        // Validate
        if (!body.partnerCode || !body.legalName) {
          return new Response(JSON.stringify(errorResponse('partnerCode and legalName are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        if (!body.roles || body.roles.length === 0) {
          return new Response(JSON.stringify(errorResponse('At least one partner role is required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        // Check duplicate code
        if (BP_DATA.partners.find(p => p.partnerCode === body.partnerCode)) {
          return new Response(JSON.stringify(errorResponse('Partner code already exists', 'DUPLICATE', 409)), { status: 409, headers })
        }
        // Check duplicate GST/PAN
        if (body.gstNumber && BP_DATA.partners.find(p => p.gstNumber === body.gstNumber)) {
          return new Response(JSON.stringify(errorResponse('GST number already registered (duplicate detection)', 'DUPLICATE_GST', 409)), { status: 409, headers })
        }
        const bp = {
          id: crypto.randomUUID(),
          partnerCode: body.partnerCode,
          legalName: body.legalName,
          displayName: body.displayName || body.legalName,
          partnerType: body.partnerType || 'COMPANY',
          status: 'ACTIVE',
          gstNumber: body.gstNumber || null,
          panNumber: body.panNumber || null,
          msmeNumber: body.msmeNumber || null,
          fssaiNumber: body.fssaiNumber || null,
          currency: body.currency || 'INR',
          creditLimit: body.creditLimit || 0,
          creditDays: body.creditDays || 0,
          paymentMode: body.paymentMode || 'CREDIT',
          preferredLanguage: body.preferredLanguage || 'EN',
          website: body.website || null,
          riskCategory: body.riskCategory || 'MEDIUM',
          riskScore: body.riskScore || 50,
          parentPartnerId: body.parentPartnerId || null,
          roles: body.roles,
          addresses: 0, contacts: 0, bankAccounts: 0, complianceRecords: 0,
          createdAt: new Date().toISOString(),
        }
        BP_DATA.partners.push(bp)
        log('info', 'Business partner created', { code: bp.partnerCode, roles: bp.roles })
        return new Response(JSON.stringify(successResponse(bp, 'Business partner created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // GET /api/business-partners/:id
    if (path.match(/^\/api\/business-partners\/[^/]+$/) && method === 'GET') {
      const id = path.split('/')[3]
      const bp = BP_DATA.partners.find(p => p.id === id)
      if (!bp) return new Response(JSON.stringify(errorResponse('Partner not found', 'NOT_FOUND', 404)), { status: 404, headers })
      return new Response(JSON.stringify(successResponse(bp, 'Partner details')), { headers })
    }

    // GET /api/business-partners/groups
    if (path === '/api/business-partners/groups' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(BP_DATA.groups, 'Partner groups')), { headers })
    }

    // GET /api/business-partners/scorecards
    if (path === '/api/business-partners/scorecards' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(BP_DATA.scorecards, 'Partner scorecards')), { headers })
    }

    // GET /api/business-partners/relationships
    if (path === '/api/business-partners/relationships' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(BP_DATA.relationships, 'Partner relationships')), { headers })
    }

    // GET /api/business-partners/dashboard
    if (path === '/api/business-partners/dashboard' && method === 'GET') {
      const roleCounts: Record<string, number> = {}
      BP_DATA.partners.forEach(p => p.roles.forEach(r => { roleCounts[r] = (roleCounts[r] || 0) + 1 }))
      const typeCounts: Record<string, number> = {}
      BP_DATA.partners.forEach(p => { typeCounts[p.partnerType] = (typeCounts[p.partnerType] || 0) + 1 })
      const riskCounts: Record<string, number> = {}
      BP_DATA.partners.forEach(p => { riskCounts[p.riskCategory] = (riskCounts[p.riskCategory] || 0) + 1 })
      const totalCredit = BP_DATA.partners.reduce((sum, p) => sum + (p.creditLimit || 0), 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          totalPartners: BP_DATA.partners.length,
          activePartners: BP_DATA.partners.filter(p => p.status === 'ACTIVE').length,
          customerGroups: BP_DATA.groups.filter(g => g.groupType === 'CUSTOMER').length,
          supplierGroups: BP_DATA.groups.filter(g => g.groupType === 'SUPPLIER').length,
          scorecards: BP_DATA.scorecards.length,
          relationships: BP_DATA.relationships.length,
        },
        roleBreakdown: roleCounts,
        typeBreakdown: typeCounts,
        riskBreakdown: riskCounts,
        totalCreditExposure: totalCredit,
        topPartners: BP_DATA.partners
          .slice()
          .sort((a, b) => (b.creditLimit || 0) - (a.creditLimit || 0))
          .slice(0, 5)
          .map(p => ({ code: p.partnerCode, name: p.displayName, creditLimit: p.creditLimit, risk: p.riskCategory })),
      }, 'Business Partner dashboard')), { headers })
    }

    // GET /api/business-partners/info
    if (path === '/api/business-partners/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Business Partner Platform',
        version: '9.0.0',
        sprint: 9,
        sprintName: 'Enterprise Business Partner Platform',
        partnerTypes: ['INDIVIDUAL', 'COMPANY', 'GOVERNMENT', 'NGO', 'TRUST', 'CORPORATE', 'FOREIGN_ENTITY'],
        partnerRoles: ['CUSTOMER', 'SUPPLIER', 'DISTRIBUTOR', 'TRANSPORTER', 'DELIVERY_PARTNER', 'MANUFACTURER', 'RETAIL_OUTLET', 'RESTAURANT_OUTLET', 'FRANCHISE', 'SERVICE_PROVIDER', 'CONSULTANT'],
        complianceTypes: ['GST', 'PAN', 'MSME', 'FSSAI', 'IEC', 'ISO', 'AGREEMENT', 'INSURANCE'],
        addressTypes: ['REGISTERED_OFFICE', 'BILLING', 'SHIPPING', 'FACTORY', 'WAREHOUSE', 'BRANCH', 'RESTAURANT', 'PICKUP', 'RETURN'],
        relationshipTypes: ['PARENT_COMPANY', 'SUBSIDIARY', 'DISTRIBUTOR', 'DEALER', 'FRANCHISE', 'PREFERRED_SUPPLIER', 'STRATEGIC_PARTNER', 'SISTER_CONCERN', 'JV_PARTNER'],
        endpoints: [
          'GET    /api/business-partners',
          'POST   /api/business-partners',
          'GET    /api/business-partners/:id',
          'GET    /api/business-partners/groups',
          'GET    /api/business-partners/scorecards',
          'GET    /api/business-partners/relationships',
          'GET    /api/business-partners/dashboard',
          'GET    /api/business-partners/info',
        ],
      }, 'SUOP Business Partner Platform v9.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 10 — IDENTIFICATION & TRACEABILITY ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Barcode Types ─────────────────────────────────────
    if (path === '/api/identification/barcode-types' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.barcodeTypes, 'Barcode types')), { headers })
    }

    // ─── Barcodes ──────────────────────────────────────────
    if (path === '/api/identification/barcodes' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.barcodes, 'Barcodes')), { headers })
    }
    if (path === '/api/identification/barcodes' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.barcode) return new Response(JSON.stringify(errorResponse('barcode is required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        if (ID_DATA.barcodes.find(b => b.barcode === body.barcode)) {
          return new Response(JSON.stringify(errorResponse('Barcode must be unique', 'DUPLICATE', 409)), { status: 409, headers })
        }
        const bc = { id: crypto.randomUUID(), barcode: body.barcode, barcodeType: body.barcodeType || 'INTERNAL', productName: body.productName || 'Unknown', productId: body.productId || null, isPrimary: body.isPrimary || false, status: 'ACTIVE' }
        ID_DATA.barcodes.push(bc)
        log('info', 'Barcode created', { barcode: bc.barcode, type: bc.barcodeType })
        return new Response(JSON.stringify(successResponse(bc, 'Barcode created')), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── QR Codes ──────────────────────────────────────────
    if (path === '/api/identification/qr-codes' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.qrCodes, 'QR codes')), { headers })
    }

    // ─── Batches ───────────────────────────────────────────
    if (path === '/api/identification/batches' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.batches, 'Batches')), { headers })
    }
    if (path === '/api/identification/batches' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.batchNumber || !body.productId || !body.manufacturingDate || !body.expiryDate) {
          return new Response(JSON.stringify(errorResponse('batchNumber, productId, manufacturingDate, expiryDate required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        if (new Date(body.expiryDate) <= new Date(body.manufacturingDate)) {
          return new Response(JSON.stringify(errorResponse('Expiry date must be after manufacturing date', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        if (ID_DATA.batches.find(b => b.batchNumber === body.batchNumber)) {
          return new Response(JSON.stringify(errorResponse('Batch number must be unique within product', 'DUPLICATE', 409)), { status: 409, headers })
        }
        const batch = { id: crypto.randomUUID(), batchNumber: body.batchNumber, productName: body.productName || 'Product', productId: body.productId, manufacturingDate: body.manufacturingDate, expiryDate: body.expiryDate, bestBeforeDate: body.bestBeforeDate || null, quantityProduced: body.quantityProduced || 0, quantityRemaining: body.quantityProduced || 0, status: 'PLANNED', qualityGrade: null, lots: 0 }
        ID_DATA.batches.push(batch)
        log('info', 'Batch created', { batchNumber: batch.batchNumber, productId: batch.productId })
        return new Response(JSON.stringify(successResponse(batch, 'Batch created')), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── Lots ──────────────────────────────────────────────
    if (path === '/api/identification/lots' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.lots, 'Lots')), { headers })
    }

    // ─── Serial Numbers ────────────────────────────────────
    if (path === '/api/identification/serial-numbers' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.serialNumbers, 'Serial numbers')), { headers })
    }
    if (path === '/api/identification/serial-numbers' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.serialNumber) return new Response(JSON.stringify(errorResponse('serialNumber is required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        if (ID_DATA.serialNumbers.find(s => s.serialNumber === body.serialNumber)) {
          return new Response(JSON.stringify(errorResponse('Serial number must be globally unique', 'DUPLICATE', 409)), { status: 409, headers })
        }
        const sn = { id: crypto.randomUUID(), serialNumber: body.serialNumber, productName: body.productName || 'Asset', entityType: body.entityType || 'EQUIPMENT', warrantyStart: body.warrantyStart || null, warrantyEnd: body.warrantyEnd || null, status: 'ACTIVE', currentLocation: body.currentLocation || null, lastServiceDate: null, nextServiceDate: null }
        ID_DATA.serialNumbers.push(sn)
        log('info', 'Serial number assigned', { serial: sn.serialNumber })
        return new Response(JSON.stringify(successResponse(sn, 'Serial number assigned')), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── GS1 Identifiers ───────────────────────────────────
    if (path === '/api/identification/gs1' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.gs1Identifiers, 'GS1 identifiers')), { headers })
    }

    // ─── Label Templates ───────────────────────────────────
    if (path === '/api/identification/label-templates' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.labelTemplates, 'Label templates')), { headers })
    }

    // ─── Print Jobs ────────────────────────────────────────
    if (path === '/api/identification/print-jobs' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.printJobs, 'Print jobs')), { headers })
    }

    // ─── Traceability Logs ─────────────────────────────────
    if (path === '/api/identification/traceability-logs' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ID_DATA.traceabilityLogs, 'Traceability logs')), { headers })
    }

    // ─── Traceability Resolver (FORWARD & BACKWARD) ────────
    // POST /api/identification/trace
    // Body: { batchId?, direction: 'forward' | 'backward' }
    //   forward  = batch → finished goods → invoices → customers
    //   backward = customer complaint → invoice → batch → production → raw material → supplier
    if (path === '/api/identification/trace' && method === 'POST') {
      try {
        const body = await req.json()
        const direction = body.direction || 'forward'
        const batchId = body.batchId
        const batch = ID_DATA.batches.find(b => b.id === batchId || b.batchNumber === body.batchNumber)
        if (!batch) {
          return new Response(JSON.stringify(errorResponse('Batch not found', 'NOT_FOUND', 404)), { status: 404, headers })
        }
        const relatedLogs = ID_DATA.traceabilityLogs.filter(l => l.batchId === batch.id)
        const relatedLots = ID_DATA.lots.filter(l => l.batch === batch.batchNumber)

        let chain: any[] = []
        if (direction === 'forward') {
          // Forward: Production Output → Warehouse → Sales → Customers
          chain = [
            { step: 1, stage: 'PRODUCTION_OUTPUT', entity: `Batch ${batch.batchNumber}`, detail: `${batch.productName} manufactured`, quantity: batch.quantityProduced, date: batch.manufacturingDate },
            ...relatedLogs
              .filter(l => ['PRODUCTION_OUTPUT', 'WAREHOUSE_TRANSFER', 'SALES_DISPATCH', 'CUSTOMER_DELIVERY', 'RECALL'].includes(l.eventType))
              .map((l, i) => ({
                step: i + 2,
                stage: l.eventType,
                entity: l.toEntityName || l.entityName,
                from: l.fromEntityName,
                to: l.toEntityName,
                quantity: l.quantity,
                reference: l.referenceNumber,
                date: l.eventDate,
                notes: l.notes,
              })),
          ]
        } else {
          // Backward: Customer → Invoice → Batch → Production → Raw Material → Supplier
          const supplierLots = ID_DATA.lots.filter(l => l.batch === batch.batchNumber && l.lotType === 'SUPPLIER_LOT')
          chain = [
            { step: 1, stage: 'CUSTOMER', entity: 'Customer Complaint / Recall', detail: batch.status === 'BLOCKED' ? 'Investigation triggered' : 'Starting point', date: '2026-07-08' },
            { step: 2, stage: 'BATCH', entity: `Batch ${batch.batchNumber}`, detail: `${batch.productName} (Quality: ${batch.qualityGrade || 'N/A'})`, quantity: batch.quantityRemaining, status: batch.status, date: batch.manufacturingDate },
            { step: 3, stage: 'PRODUCTION_ORDER', entity: relatedLogs.find(l => l.eventType === 'PRODUCTION_OUTPUT')?.referenceNumber || 'N/A', detail: 'Manufacturing order that produced this batch', date: batch.manufacturingDate },
            ...supplierLots.map((l, i) => ({
              step: 4 + i,
              stage: 'RAW_MATERIAL',
              entity: l.lotNumber,
              detail: l.productName,
              supplier: l.supplier,
              supplierInvoice: l.supplierInvoice,
              quantity: l.quantity,
              remaining: l.remaining,
              quality: l.quality,
            })),
          ]
        }

        log('info', 'Traceability resolved', { batchId: batch.id, direction, chainLength: chain.length })
        return new Response(JSON.stringify(successResponse({
          batch: { id: batch.id, batchNumber: batch.batchNumber, productName: batch.productName, manufacturingDate: batch.manufacturingDate, expiryDate: batch.expiryDate, status: batch.status, qualityGrade: batch.qualityGrade, quantityProduced: batch.quantityProduced, quantityRemaining: batch.quantityRemaining },
          direction,
          relatedLots: relatedLots.length,
          relatedLogs: relatedLogs.length,
          chain,
        }, `Traceability ${direction} resolved`)), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Traceability resolution failed')), { status: 500, headers })
      }
    }

    // ─── Dashboard ─────────────────────────────────────────
    if (path === '/api/identification/dashboard' && method === 'GET') {
      const batchStatusCounts: Record<string, number> = {}
      ID_DATA.batches.forEach(b => { batchStatusCounts[b.status] = (batchStatusCounts[b.status] || 0) + 1 })
      const lotTypeCounts: Record<string, number> = {}
      ID_DATA.lots.forEach(l => { lotTypeCounts[l.lotType] = (lotTypeCounts[l.lotType] || 0) + 1 })
      const traceEventTypeCounts: Record<string, number> = {}
      ID_DATA.traceabilityLogs.forEach(t => { traceEventTypeCounts[t.eventType] = (traceEventTypeCounts[t.eventType] || 0) + 1 })
      const expiringBatches = ID_DATA.batches.filter(b => new Date(b.expiryDate) > new Date() && new Date(b.expiryDate) < new Date(Date.now() + 15 * 86400000))
      return new Response(JSON.stringify(successResponse({
        counts: {
          barcodeTypes: ID_DATA.barcodeTypes.length,
          barcodes: ID_DATA.barcodes.length,
          qrCodes: ID_DATA.qrCodes.length,
          batches: ID_DATA.batches.length,
          lots: ID_DATA.lots.length,
          serialNumbers: ID_DATA.serialNumbers.length,
          gs1Identifiers: ID_DATA.gs1Identifiers.length,
          labelTemplates: ID_DATA.labelTemplates.length,
          printJobs: ID_DATA.printJobs.length,
          traceabilityLogs: ID_DATA.traceabilityLogs.length,
        },
        batchStatusBreakdown: batchStatusCounts,
        lotTypeBreakdown: lotTypeCounts,
        traceEventBreakdown: traceEventTypeCounts,
        expiringSoon: expiringBatches.length,
        quarantineBatches: ID_DATA.batches.filter(b => b.status === 'QUARANTINED').length,
        blockedBatches: ID_DATA.batches.filter(b => b.status === 'BLOCKED').length,
        pendingPrintJobs: ID_DATA.printJobs.filter(p => p.status === 'QUEUED' || p.status === 'PRINTING').length,
      }, 'Identification dashboard')), { headers })
    }

    // ─── Info ──────────────────────────────────────────────
    if (path === '/api/identification/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Identification & Traceability Platform',
        version: '10.0.0',
        sprint: 10,
        sprintName: 'Enterprise Identification, Barcode & Traceability Platform',
        barcodeTypes: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39', 'GS1_128', 'ITF_14', 'INTERNAL'],
        qrPurposes: ['PRODUCT', 'BATCH', 'WAREHOUSE', 'LOCATION', 'ASSET', 'ORDER', 'INVOICE'],
        batchStatuses: ['PLANNED', 'PRODUCED', 'RELEASED', 'QUARANTINED', 'BLOCKED', 'CONSUMED', 'EXPIRED'],
        lotTypes: ['SUPPLIER_LOT', 'PRODUCTION_LOT', 'WAREHOUSE_LOT', 'RETURN_LOT', 'INSPECTION_LOT'],
        gs1Types: ['GTIN', 'GLN', 'SSCC', 'GS1_128'],
        labelTypes: ['PRODUCT', 'SHELF', 'PALLET', 'BATCH', 'LOCATION', 'SHIPPING', 'QR', 'BARCODE'],
        printFormats: ['A4', 'THERMAL', 'ZEBRA', 'BROTHER', 'PDF'],
        traceabilityEventTypes: ['PURCHASE_RECEIPT', 'WAREHOUSE_IN', 'PRODUCTION_INPUT', 'PRODUCTION_OUTPUT', 'WAREHOUSE_TRANSFER', 'SALES_DISPATCH', 'CUSTOMER_DELIVERY', 'RETURN', 'RECALL', 'QUALITY_HOLD', 'DISPOSAL'],
        traceabilityDirections: ['forward (Batch → Customers)', 'backward (Customer → Supplier)'],
        endpoints: [
          'GET    /api/identification/barcode-types',
          'GET/POST /api/identification/barcodes',
          'GET    /api/identification/qr-codes',
          'GET/POST /api/identification/batches',
          'GET    /api/identification/lots',
          'GET/POST /api/identification/serial-numbers',
          'GET    /api/identification/gs1',
          'GET    /api/identification/label-templates',
          'GET    /api/identification/print-jobs',
          'GET    /api/identification/traceability-logs',
          'POST   /api/identification/trace  (forward/backward)',
          'GET    /api/identification/dashboard',
          'GET    /api/identification/info',
        ],
      }, 'SUOP Identification Platform v10.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 11 — DATA GOVERNANCE & MASTER DATA QUALITY ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Product Lifecycle ─────────────────────────────────
    if (path === '/api/governance/lifecycles' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.lifecycles, 'Product lifecycles')), { headers })
    }
    // POST /api/governance/lifecycles/:id/transition
    if (path.match(/^\/api\/governance\/lifecycles\/[^/]+\/transition$/) && method === 'POST') {
      try {
        const id = path.split('/')[4]
        const body = await req.json()
        const lc = GOV_DATA.lifecycles.find(l => l.id === id)
        if (!lc) return new Response(JSON.stringify(errorResponse('Lifecycle not found', 'NOT_FOUND', 404)), { status: 404, headers })
        const validTransitions: Record<string, string[]> = {
          DRAFT: ['UNDER_REVIEW'],
          UNDER_REVIEW: ['APPROVED', 'DRAFT'],
          APPROVED: ['PUBLISHED', 'UNDER_REVIEW'],
          PUBLISHED: ['ACTIVE'],
          ACTIVE: ['INACTIVE'],
          INACTIVE: ['ACTIVE', 'DISCONTINUED'],
          DISCONTINUED: ['ARCHIVED'],
          ARCHIVED: [],
        }
        const allowed = validTransitions[lc.currentState] || []
        if (!allowed.includes(body.toState)) {
          return new Response(JSON.stringify(errorResponse(`Invalid transition: ${lc.currentState} → ${body.toState}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`, 'INVALID_TRANSITION', 400)), { status: 400, headers })
        }
        lc.previousState = lc.currentState
        lc.currentState = body.toState
        lc.transitions = (lc.transitions || 0) + 1
        if (body.reason) lc.stateReason = body.reason
        log('info', 'Lifecycle transition', { id, from: lc.previousState, to: lc.currentState })
        return new Response(JSON.stringify(successResponse(lc, `Transitioned ${lc.previousState} → ${lc.currentState}`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── Approval Workflows ────────────────────────────────
    if (path === '/api/governance/approvals' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.approvalWorkflows, 'Approval workflows')), { headers })
    }
    // POST /api/governance/approvals/:id/approve
    if (path.match(/^\/api\/governance\/approvals\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[4]
      const awf = GOV_DATA.approvalWorkflows.find(a => a.id === id)
      if (!awf) return new Response(JSON.stringify(errorResponse('Workflow not found', 'NOT_FOUND', 404)), { status: 404, headers })
      const stages = ['CREATOR', 'REVIEWER', 'QA', 'COMPLIANCE', 'FINANCE', 'PUBLISHER', 'COMPLETED']
      const idx = stages.indexOf(awf.currentStage)
      if (idx < 0 || idx >= stages.length - 1) {
        return new Response(JSON.stringify(errorResponse('Cannot advance further')), { status: 400, headers })
      }
      awf.currentStage = stages[idx + 1]
      awf.completedSteps = (awf.completedSteps || 0) + 1
      if (awf.currentStage === 'COMPLETED') {
        awf.status = 'PUBLISHED'
        awf.completedAt = new Date().toISOString()
      } else {
        awf.status = 'IN_REVIEW'
      }
      log('info', 'Approval advanced', { id, stage: awf.currentStage })
      return new Response(JSON.stringify(successResponse(awf, `Advanced to ${awf.currentStage}`)), { headers })
    }

    // ─── Import Jobs ───────────────────────────────────────
    if (path === '/api/governance/imports' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.importJobs, 'Import jobs')), { headers })
    }
    // POST /api/governance/imports/:id/rollback
    if (path.match(/^\/api\/governance\/imports\/[^/]+\/rollback$/) && method === 'POST') {
      try {
        const id = path.split('/')[4]
        const body = await req.json()
        const job = GOV_DATA.importJobs.find(j => j.id === id)
        if (!job) return new Response(JSON.stringify(errorResponse('Import job not found', 'NOT_FOUND', 404)), { status: 404, headers })
        if (!job.isRollbackable && job.isRollbackable !== undefined) {
          return new Response(JSON.stringify(errorResponse('Job not rollbackable', 'NOT_ROLLBACKABLE', 400)), { status: 400, headers })
        }
        if (job.status !== 'COMPLETED') {
          return new Response(JSON.stringify(errorResponse('Only completed jobs can be rolled back', 'INVALID_STATE', 400)), { status: 400, headers })
        }
        job.status = 'ROLLBACK'
        job.rolledBackAt = new Date().toISOString()
        job.rollbackReason = body.reason || 'Manual rollback'
        log('info', 'Import rolled back', { jobCode: job.jobCode, reason: job.rollbackReason })
        return new Response(JSON.stringify(successResponse(job, 'Import rolled back successfully')), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── Export Jobs ───────────────────────────────────────
    if (path === '/api/governance/exports' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.exportJobs, 'Export jobs')), { headers })
    }

    // ─── Validation Rules ──────────────────────────────────
    if (path === '/api/governance/validation-rules' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.validationRules, 'Validation rules')), { headers })
    }

    // ─── Duplicate Candidates ──────────────────────────────
    if (path === '/api/governance/duplicates' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.duplicateCandidates, 'Duplicate candidates')), { headers })
    }
    // POST /api/governance/duplicates/:id/merge
    if (path.match(/^\/api\/governance\/duplicates\/[^/]+\/merge$/) && method === 'POST') {
      try {
        const id = path.split('/')[4]
        const body = await req.json()
        const dc = GOV_DATA.duplicateCandidates.find(d => d.id === id)
        if (!dc) return new Response(JSON.stringify(errorResponse('Duplicate candidate not found', 'NOT_FOUND', 404)), { status: 404, headers })
        if (dc.resolutionStatus !== 'PENDING') {
          return new Response(JSON.stringify(errorResponse('Already resolved', 'ALREADY_RESOLVED', 400)), { status: 400, headers })
        }
        dc.resolutionStatus = 'MERGED'
        dc.resolutionAction = body.action || 'KEEP_PRIMARY'
        dc.resolvedAt = new Date().toISOString()
        dc.resolutionNotes = body.notes || ''
        log('info', 'Duplicate merged', { id, primary: dc.primaryName, duplicate: dc.duplicateName, action: dc.resolutionAction })
        return new Response(JSON.stringify(successResponse(dc, 'Duplicate merged successfully')), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── Audit Trail ───────────────────────────────────────
    if (path === '/api/governance/audit-trail' && method === 'GET') {
      const actionFilter = url.searchParams.get('action')
      const moduleFilter = url.searchParams.get('module')
      let logs = GOV_DATA.auditTrail
      if (actionFilter) logs = logs.filter(l => l.action === actionFilter.toUpperCase())
      if (moduleFilter) logs = logs.filter(l => l.moduleName.toLowerCase().includes(moduleFilter.toLowerCase()))
      return new Response(JSON.stringify(successResponse(logs, `${logs.length} audit entries`)), { headers })
    }

    // ─── Quality Metrics ───────────────────────────────────
    if (path === '/api/governance/quality-metrics' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.qualityMetrics, 'Quality metrics')), { headers })
    }

    // ─── Change History ────────────────────────────────────
    if (path === '/api/governance/change-history' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GOV_DATA.changeHistory, 'Change history')), { headers })
    }

    // ─── Dashboard ─────────────────────────────────────────
    if (path === '/api/governance/dashboard' && method === 'GET') {
      const lifecycleCounts: Record<string, number> = {}
      GOV_DATA.lifecycles.forEach(l => { lifecycleCounts[l.currentState] = (lifecycleCounts[l.currentState] || 0) + 1 })
      const approvalStatusCounts: Record<string, number> = {}
      GOV_DATA.approvalWorkflows.forEach(a => { approvalStatusCounts[a.status] = (approvalStatusCounts[a.status] || 0) + 1 })
      const duplicateStatusCounts: Record<string, number> = {}
      GOV_DATA.duplicateCandidates.forEach(d => { duplicateStatusCounts[d.resolutionStatus] = (duplicateStatusCounts[d.resolutionStatus] || 0) + 1 })
      // Calculate overall quality score (average of all product metrics scores)
      const productMetrics = GOV_DATA.qualityMetrics.filter(m => m.entityType === 'PRODUCT')
      const overallQualityScore = productMetrics.reduce((sum, m) => sum + m.score, 0) / productMetrics.length
      return new Response(JSON.stringify(successResponse({
        counts: {
          lifecycles: GOV_DATA.lifecycles.length,
          activeProducts: GOV_DATA.lifecycles.filter(l => l.currentState === 'ACTIVE').length,
          draftProducts: GOV_DATA.lifecycles.filter(l => l.currentState === 'DRAFT').length,
          archivedProducts: GOV_DATA.lifecycles.filter(l => l.currentState === 'ARCHIVED').length,
          approvalWorkflows: GOV_DATA.approvalWorkflows.length,
          pendingApprovals: GOV_DATA.approvalWorkflows.filter(a => a.status === 'PENDING' || a.status === 'IN_REVIEW').length,
          slaBreachedApprovals: GOV_DATA.approvalWorkflows.filter(a => a.slaBreached).length,
          importJobs: GOV_DATA.importJobs.length,
          exportJobs: GOV_DATA.exportJobs.length,
          validationRules: GOV_DATA.validationRules.length,
          duplicateCandidates: GOV_DATA.duplicateCandidates.length,
          pendingDuplicates: GOV_DATA.duplicateCandidates.filter(d => d.resolutionStatus === 'PENDING').length,
          auditEntries: GOV_DATA.auditTrail.length,
          qualityMetrics: GOV_DATA.qualityMetrics.length,
        },
        lifecycleBreakdown: lifecycleCounts,
        approvalStatusBreakdown: approvalStatusCounts,
        duplicateStatusBreakdown: duplicateStatusCounts,
        overallQualityScore: Number(overallQualityScore.toFixed(2)),
        qualityGrade: overallQualityScore >= 90 ? 'A' : overallQualityScore >= 80 ? 'B' : overallQualityScore >= 70 ? 'C' : 'D',
      }, 'Governance dashboard')), { headers })
    }

    // ─── Info ──────────────────────────────────────────────
    if (path === '/api/governance/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Data Governance & Master Data Quality Platform',
        version: '11.0.0',
        sprint: 11,
        sprintName: 'Product Lifecycle, Data Governance & Master Data Quality',
        lifecycleStates: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED'],
        approvalStages: ['CREATOR', 'REVIEWER', 'QA', 'COMPLIANCE', 'FINANCE', 'PUBLISHER'],
        workflowTypes: ['STANDARD', 'PARALLEL', 'CONDITIONAL'],
        importStatuses: ['QUEUED', 'VALIDATING', 'PREVIEWING', 'IMPORTING', 'COMPLETED', 'FAILED', 'ROLLBACK'],
        exportFormats: ['EXCEL', 'CSV', 'PDF', 'JSON'],
        validationTypes: ['REQUIRED', 'UNIQUE', 'RANGE', 'REGEX', 'BUSINESS_RULE', 'CROSS_REFERENCE'],
        duplicateDetectionRules: ['NAME', 'SKU', 'BARCODE', 'HSN', 'BRAND', 'SIMILAR_NAME'],
        auditActions: ['CREATE', 'UPDATE', 'DELETE', 'ARCHIVE', 'RESTORE', 'MERGE'],
        qualityMetrics: ['COMPLETENESS', 'ACCURACY', 'CONSISTENCY', 'DUPLICATE_PERCENT', 'APPROVAL_SLA', 'VALIDATION_ERRORS', 'INACTIVE_PRODUCTS', 'MISSING_IMAGES', 'MISSING_BARCODES'],
        endpoints: [
          'GET    /api/governance/lifecycles',
          'POST   /api/governance/lifecycles/:id/transition',
          'GET    /api/governance/approvals',
          'POST   /api/governance/approvals/:id/approve',
          'GET    /api/governance/imports',
          'POST   /api/governance/imports/:id/rollback',
          'GET    /api/governance/exports',
          'GET    /api/governance/validation-rules',
          'GET    /api/governance/duplicates',
          'POST   /api/governance/duplicates/:id/merge',
          'GET    /api/governance/audit-trail',
          'GET    /api/governance/quality-metrics',
          'GET    /api/governance/change-history',
          'GET    /api/governance/dashboard',
          'GET    /api/governance/info',
        ],
        part2Status: 'COMPLETE - All 11 sprints of Enterprise Master Data Platform done',
      }, 'SUOP Governance Platform v11.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 12 — ENTERPRISE INVENTORY ENGINE ENDPOINTS
    // Universal Stock Ledger — single source of truth
    // ═════════════════════════════════════════════════════════════

    // ─── Transaction Types ─────────────────────────────────
    if (path === '/api/inventory/transaction-types' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(INV_DATA.transactionTypes, 'Inventory transaction types')), { headers })
    }

    // ─── Inventory Statuses ────────────────────────────────
    if (path === '/api/inventory/statuses' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(INV_DATA.inventoryStatuses, 'Inventory statuses')), { headers })
    }

    // ─── Transactions ──────────────────────────────────────
    if (path === '/api/inventory/transactions' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let txns = INV_DATA.transactions
      if (typeFilter) txns = txns.filter(t => t.type === typeFilter.toUpperCase())
      if (statusFilter) txns = txns.filter(t => t.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(txns, `${txns.length} inventory transactions`)), { headers })
    }
    // POST /api/inventory/transactions — creates a transaction + posts to ledger
    if (path === '/api/inventory/transactions' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.type || !body.warehouseId) {
          return new Response(JSON.stringify(errorResponse('type and warehouseId are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        const txnType = INV_DATA.transactionTypes.find(t => t.code === body.type)
        if (!txnType) {
          return new Response(JSON.stringify(errorResponse(`Invalid transaction type: ${body.type}`, 'INVALID_TYPE', 400)), { status: 400, headers })
        }
        // Negative stock check (default block)
        if (txnType.effect === 'DECREASE' && body.lines) {
          for (const line of body.lines) {
            const balance = INV_DATA.stockBalances.find(b => b.product === line.productName)
            if (balance && Number(line.quantity) > balance.available) {
              return new Response(JSON.stringify(errorResponse(`Negative stock blocked: ${line.productName} available=${balance.available}, requested=${line.quantity}`, 'NEGATIVE_STOCK_BLOCKED', 400)), { status: 400, headers })
            }
          }
        }
        const txnNumber = `INV-2026-${String(152 + INV_DATA.transactions.length).padStart(5, '0')}`
        const txn = {
          id: crypto.randomUUID(),
          number: txnNumber,
          type: body.type,
          date: body.date || new Date().toISOString().slice(0, 10),
          refType: body.refType || null,
          refNumber: body.refNumber || null,
          warehouse: body.warehouseName || 'Warehouse',
          partner: body.partnerName || null,
          status: txnType.requiresApproval ? 'PENDING_APPROVAL' : 'POSTED',
          lines: body.lines ? body.lines.length : 0,
          totalQty: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.quantity), 0) : 0,
          totalValue: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.quantity) * Number(l.unitCost || 0), 0) : 0,
          createdBy: body.createdByName || 'System',
        }
        INV_DATA.transactions.unshift(txn)
        log('info', 'Inventory transaction created', { number: txn.number, type: txn.type, status: txn.status })
        return new Response(JSON.stringify(successResponse(txn, `Transaction ${txn.number} created and ${txn.status === 'POSTED' ? 'posted to ledger' : 'pending approval'}`)), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers })
      }
    }

    // ─── Stock Balance ─────────────────────────────────────
    if (path === '/api/inventory/balances' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      let balances = INV_DATA.stockBalances
      if (warehouseFilter) balances = balances.filter(b => b.warehouse === warehouseFilter)
      return new Response(JSON.stringify(successResponse(balances, `${balances.length} stock balances`)), { headers })
    }

    // ─── Stock Ledger ──────────────────────────────────────
    if (path === '/api/inventory/ledger' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(INV_DATA.ledgerEntries, 'Stock ledger entries')), { headers })
    }

    // ─── Stock Movements ───────────────────────────────────
    if (path === '/api/inventory/movements' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(INV_DATA.movements, 'Stock movements')), { headers })
    }

    // ─── Inventory Journal ─────────────────────────────────
    if (path === '/api/inventory/journal' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(INV_DATA.journalEntries, 'Inventory journal entries')), { headers })
    }

    // ─── Availability Service (shared service for all modules) ──
    // GET /api/inventory/availability?productId=xxx&warehouseId=yyy
    if (path === '/api/inventory/availability' && method === 'GET') {
      const productFilter = url.searchParams.get('product')
      let balances = INV_DATA.stockBalances
      if (productFilter) balances = balances.filter(b => b.product.toLowerCase().includes(productFilter.toLowerCase()))
      const totalAvailable = balances.reduce((s, b) => s + b.available, 0)
      const totalReserved = balances.reduce((s, b) => s + b.reserved, 0)
      const totalAllocated = balances.reduce((s, b) => s + b.allocated, 0)
      const totalDamaged = balances.reduce((s, b) => s + b.damaged, 0)
      const totalExpired = balances.reduce((s, b) => s + b.expired, 0)
      const totalInTransit = balances.reduce((s, b) => s + b.inTransit, 0)
      const totalValue = balances.reduce((s, b) => s + b.totalValue, 0)
      return new Response(JSON.stringify(successResponse({
        balances,
        summary: {
          totalAvailable,
          totalReserved,
          totalAllocated,
          totalDamaged,
          totalExpired,
          totalInTransit,
          totalUnits: totalAvailable + totalReserved + totalAllocated + totalDamaged + totalExpired + totalInTransit,
          totalValue,
        },
      }, 'Stock availability')), { headers })
    }

    // ─── Dashboard ─────────────────────────────────────────
    if (path === '/api/inventory/dashboard' && method === 'GET') {
      const txnTypeCounts: Record<string, number> = {}
      INV_DATA.transactions.forEach(t => { txnTypeCounts[t.type] = (txnTypeCounts[t.type] || 0) + 1 })
      const statusCounts: Record<string, number> = {}
      INV_DATA.transactions.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1 })
      const totalInventoryValue = INV_DATA.stockBalances.reduce((s, b) => s + b.totalValue, 0)
      const totalAvailableUnits = INV_DATA.stockBalances.reduce((s, b) => s + b.available, 0)
      const totalReservedUnits = INV_DATA.stockBalances.reduce((s, b) => s + b.reserved, 0)
      const totalExpiredUnits = INV_DATA.stockBalances.reduce((s, b) => s + b.expired, 0)
      const totalDamagedUnits = INV_DATA.stockBalances.reduce((s, b) => s + b.damaged, 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          transactionTypes: INV_DATA.transactionTypes.length,
          inventoryStatuses: INV_DATA.inventoryStatuses.length,
          transactions: INV_DATA.transactions.length,
          pendingApproval: INV_DATA.transactions.filter(t => t.status === 'PENDING_APPROVAL').length,
          postedTransactions: INV_DATA.transactions.filter(t => t.status === 'POSTED').length,
          stockBalances: INV_DATA.stockBalances.length,
          ledgerEntries: INV_DATA.ledgerEntries.length,
          movements: INV_DATA.movements.length,
          journalEntries: INV_DATA.journalEntries.length,
        },
        inventoryValue: {
          totalValue,
          totalAvailableUnits,
          totalReservedUnits,
          totalExpiredUnits,
          totalDamagedUnits,
        },
        transactionTypeBreakdown: txnTypeCounts,
        transactionStatusBreakdown: statusCounts,
        topValueItems: INV_DATA.stockBalances
          .slice()
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 5)
          .map(b => ({ product: b.product, warehouse: b.warehouse, totalValue: b.totalValue, available: b.available })),
      }, 'Inventory dashboard')), { headers })
    }

    // ─── Info ──────────────────────────────────────────────
    if (path === '/api/inventory/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Enterprise Inventory Engine',
        version: '12.0.0',
        sprint: 12,
        sprintName: 'Enterprise Inventory Foundation — Universal Stock Ledger',
        corePrinciple: 'NEVER update stock directly. Every stock change creates an immutable ledger transaction. Stock balances are DERIVED from the ledger.',
        transactionTypes: INV_DATA.transactionTypes.map(t => t.code),
        inventoryStatuses: INV_DATA.inventoryStatuses.map(s => s.code),
        stockFormula: 'Available = Received − Issued − Reserved − Damaged',
        endpoints: [
          'GET    /api/inventory/transaction-types',
          'GET    /api/inventory/statuses',
          'GET/POST /api/inventory/transactions',
          'GET    /api/inventory/balances',
          'GET    /api/inventory/ledger',
          'GET    /api/inventory/movements',
          'GET    /api/inventory/journal',
          'GET    /api/inventory/availability',
          'GET    /api/inventory/dashboard',
          'GET    /api/inventory/info',
        ],
        part3Status: 'IN PROGRESS - Sprint 12 of 10 (Inventory Foundation)',
      }, 'SUOP Inventory Engine v12.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 13 — GOODS RECEIPT & PUTAWAY ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Goods Receipts ────────────────────────────────────
    if (path === '/api/goods-receipts' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let grns = GRN_DATA.goodsReceipts
      if (typeFilter) grns = grns.filter(g => g.receiptType === typeFilter.toUpperCase())
      if (statusFilter) grns = grns.filter(g => g.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(grns, `${grns.length} goods receipts`)), { headers })
    }
    if (path === '/api/goods-receipts' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.warehouseId) return new Response(JSON.stringify(errorResponse('warehouseId is required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        const grnNumber = `GRN-2026-${String(150 + GRN_DATA.goodsReceipts.length).padStart(5, '0')}`
        const grn = {
          id: crypto.randomUUID(),
          grnNumber,
          receiptType: body.receiptType || 'PURCHASE_RECEIPT',
          date: body.date || new Date().toISOString().slice(0, 10),
          supplier: body.supplierName || null,
          refType: body.refType || null,
          refNumber: body.refNumber || null,
          warehouse: body.warehouseName || 'Warehouse',
          vehicle: body.vehicleNumber || null,
          driver: body.driverName || null,
          gateEntry: body.gateEntryNumber || null,
          status: 'DRAFT',
          qualityHold: body.qualityHoldRequired || false,
          qualityStatus: body.qualityHoldRequired ? 'PENDING' : 'APPROVED',
          lines: body.lines ? body.lines.length : 0,
          orderedQty: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.orderedQty || 0), 0) : 0,
          receivedQty: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.receivedQty || 0), 0) : 0,
          acceptedQty: 0,
          rejectedQty: 0,
          totalValue: 0,
          inventoryPosted: false,
          putawayCompleted: false,
          receivedBy: body.receivedByName || 'System',
        }
        GRN_DATA.goodsReceipts.unshift(grn)
        log('info', 'GRN created', { grnNumber: grn.grnNumber, type: grn.receiptType })
        return new Response(JSON.stringify(successResponse(grn, `GRN ${grn.grnNumber} created`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    // POST /api/goods-receipts/:id/approve
    if (path.match(/^\/api\/goods-receipts\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]
      const grn = GRN_DATA.goodsReceipts.find(g => g.id === id)
      if (!grn) return new Response(JSON.stringify(errorResponse('GRN not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (grn.status !== 'PENDING_APPROVAL' && grn.status !== 'DRAFT') {
        return new Response(JSON.stringify(errorResponse(`Cannot approve GRN in ${grn.status} status`, 'INVALID_STATE', 400)), { status: 400, headers })
      }
      grn.status = grn.qualityHold && grn.qualityStatus !== 'APPROVED' ? 'APPROVED' : 'APPROVED'
      grn.inventoryPosted = true
      grn.putawayCompleted = !grn.qualityHold
      log('info', 'GRN approved', { grnNumber: grn.grnNumber })
      return new Response(JSON.stringify(successResponse(grn, `GRN ${grn.grnNumber} approved and posted to inventory`)), { headers })
    }

    // ─── Putaway Rules ─────────────────────────────────────
    if (path === '/api/putaway/rules' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GRN_DATA.putawayRules, 'Putaway rules')), { headers })
    }

    // ─── Putaway Tasks ─────────────────────────────────────
    if (path === '/api/putaway/tasks' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let tasks = GRN_DATA.putawayTasks
      if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(tasks, `${tasks.length} putaway tasks`)), { headers })
    }
    // POST /api/putaway/tasks/:id/complete
    if (path.match(/^\/api\/putaway\/tasks\/[^/]+\/complete$/) && method === 'POST') {
      const id = path.split('/')[4]
      const task = GRN_DATA.putawayTasks.find(t => t.id === id)
      if (!task) return new Response(JSON.stringify(errorResponse('Task not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (task.status === 'COMPLETED') return new Response(JSON.stringify(errorResponse('Already completed')), { status: 400, headers })
      task.status = 'COMPLETED'
      task.completedAt = new Date().toISOString()
      log('info', 'Putaway task completed', { taskNumber: task.taskNumber })
      return new Response(JSON.stringify(successResponse(task, 'Putaway task completed')), { headers })
    }

    // ─── Quality Holds ─────────────────────────────────────
    if (path === '/api/quality-holds' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(GRN_DATA.qualityHolds, 'Quality holds')), { headers })
    }
    // POST /api/quality-holds/:id/release
    if (path.match(/^\/api\/quality-holds\/[^/]+\/release$/) && method === 'POST') {
      try {
        const id = path.split('/')[3]
        const body = await req.json()
        const qh = GRN_DATA.qualityHolds.find(q => q.id === id)
        if (!qh) return new Response(JSON.stringify(errorResponse('Quality hold not found', 'NOT_FOUND', 404)), { status: 404, headers })
        if (qh.status !== 'ACTIVE') return new Response(JSON.stringify(errorResponse('Already resolved')), { status: 400, headers })
        qh.status = 'RESOLVED'
        qh.resolution = body.resolution || 'RELEASED'
        qh.result = body.result || 'PASSED'
        qh.releasedQty = body.releasedQty || qh.qtyHeld
        qh.rejectedQty = body.rejectedQty || 0
        qh.resolvedBy = body.resolvedByName || 'System'
        qh.resolvedAt = new Date().toISOString()
        log('info', 'Quality hold resolved', { holdNumber: qh.holdNumber, resolution: qh.resolution })
        return new Response(JSON.stringify(successResponse(qh, `Quality hold ${qh.resolution.toLowerCase()}`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }

    // ─── Receiving Dashboard ───────────────────────────────
    if (path === '/api/goods-receipts/dashboard' && method === 'GET') {
      const today = GRN_DATA.goodsReceipts.filter(g => g.date === '2026-07-09')
      const pendingPutaway = GRN_DATA.goodsReceipts.filter(g => !g.putawayCompleted && g.status !== 'DRAFT')
      const qualityHoldActive = GRN_DATA.qualityHolds.filter(q => q.status === 'ACTIVE')
      const rejected = GRN_DATA.goodsReceipts.reduce((s, g) => s + g.rejectedQty, 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          totalGRNs: GRN_DATA.goodsReceipts.length,
          todayReceipts: today.length,
          pendingApproval: GRN_DATA.goodsReceipts.filter(g => g.status === 'PENDING_APPROVAL').length,
          pendingPutaway: pendingPutaway.length,
          qualityHoldsActive: qualityHoldActive.length,
          completedToday: GRN_DATA.goodsReceipts.filter(g => g.status === 'COMPLETED' && g.date === '2026-07-09').length,
          putawayTasks: GRN_DATA.putawayTasks.length,
          pendingTasks: GRN_DATA.putawayTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
        },
        receiving: {
          totalReceivedToday: today.reduce((s, g) => s + g.receivedQty, 0),
          totalValueToday: today.reduce((s, g) => s + g.totalValue, 0),
          totalRejected: rejected,
        },
        putawayStrategies: GRN_DATA.putawayRules.map(r => ({ strategy: r.strategy, rule: r.name, zone: r.targetZone })),
      }, 'Receiving dashboard')), { headers })
    }

    // ─── Info ──────────────────────────────────────────────
    if (path === '/api/goods-receipts/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Goods Receipt & Putaway Engine',
        version: '13.0.0',
        sprint: 13,
        sprintName: 'Goods Receipt & Intelligent Putaway Engine',
        receiptTypes: ['PURCHASE_RECEIPT', 'MANUFACTURING_RECEIPT', 'SALES_RETURN', 'CUSTOMER_RETURN', 'OPENING_STOCK', 'INTER_BRANCH_RECEIPT', 'WAREHOUSE_TRANSFER_RECEIPT', 'STOCK_CORRECTION', 'DONATION_RECEIPT', 'SAMPLE_RECEIPT'],
        grnStatuses: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUTAWAY_IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'],
        putawayStrategies: ['FIFO', 'FEFO', 'ABC', 'ZONE', 'TEMPERATURE', 'MANUAL'],
        qualityHoldReasons: ['QUALITY_CHECK', 'SUPPLIER_ISSUE', 'DAMAGE_SUSPECTED', 'EXPIRY_CHECK', 'SPEC_VERIFICATION', 'RANDOM_SAMPLE'],
        endpoints: [
          'GET/POST /api/goods-receipts',
          'POST   /api/goods-receipts/:id/approve',
          'GET    /api/goods-receipts/dashboard',
          'GET    /api/putaway/rules',
          'GET    /api/putaway/tasks',
          'POST   /api/putaway/tasks/:id/complete',
          'GET    /api/quality-holds',
          'POST   /api/quality-holds/:id/release',
          'GET    /api/goods-receipts/info',
        ],
      }, 'SUOP GRN Engine v13.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 14 — STOCK ISSUE & OUTBOUND ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Stock Issues ──────────────────────────────────────
    if (path === '/api/stock-issues' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let issues = SI_DATA.stockIssues
      if (typeFilter) issues = issues.filter(s => s.issueType === typeFilter.toUpperCase())
      if (statusFilter) issues = issues.filter(s => s.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(issues, `${issues.length} stock issues`)), { headers })
    }
    if (path === '/api/stock-issues' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.warehouseId || !body.issueType) return new Response(JSON.stringify(errorResponse('warehouseId and issueType required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        const issueNumber = `SI-2026-${String(242 + SI_DATA.stockIssues.length).padStart(5, '0')}`
        const issue = {
          id: crypto.randomUUID(),
          issueNumber,
          issueType: body.issueType,
          date: body.date || new Date().toISOString().slice(0, 10),
          refType: body.refType || null,
          refNumber: body.refNumber || null,
          warehouse: body.warehouseName || 'Warehouse',
          destination: body.destinationName || null,
          status: 'DRAFT',
          lines: body.lines ? body.lines.length : 0,
          requestedQty: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.requestedQty || 0), 0) : 0,
          issuedQty: 0,
          totalValue: 0,
          inventoryPosted: false,
          pickingCompleted: false,
          requestedBy: body.requestedByName || 'System',
          approvedBy: null,
        }
        SI_DATA.stockIssues.unshift(issue)
        log('info', 'Stock issue created', { issueNumber: issue.issueNumber, type: issue.issueType })
        return new Response(JSON.stringify(successResponse(issue, `Stock issue ${issue.issueNumber} created`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    // POST /api/stock-issues/:id/approve
    if (path.match(/^\/api\/stock-issues\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]
      const issue = SI_DATA.stockIssues.find(s => s.id === id)
      if (!issue) return new Response(JSON.stringify(errorResponse('Stock issue not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (issue.status !== 'PENDING_APPROVAL' && issue.status !== 'DRAFT') {
        return new Response(JSON.stringify(errorResponse(`Cannot approve in ${issue.status} status`, 'INVALID_STATE', 400)), { status: 400, headers })
      }
      issue.status = 'APPROVED'
      log('info', 'Stock issue approved', { issueNumber: issue.issueNumber })
      return new Response(JSON.stringify(successResponse(issue, `Stock issue ${issue.issueNumber} approved`)), { headers })
    }

    // ─── Picking Tasks ─────────────────────────────────────
    if (path === '/api/picking/tasks' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let tasks = SI_DATA.pickingTasks
      if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(tasks, `${tasks.length} picking tasks`)), { headers })
    }
    // POST /api/picking/tasks/:id/complete
    if (path.match(/^\/api\/picking\/tasks\/[^/]+\/complete$/) && method === 'POST') {
      const id = path.split('/')[4]
      const task = SI_DATA.pickingTasks.find(t => t.id === id)
      if (!task) return new Response(JSON.stringify(errorResponse('Task not found', 'NOT_FOUND', 404)), { status: 404, headers })
      task.status = 'COMPLETED'
      task.pickedLines = task.totalLines
      task.pickedQty = task.totalQty
      task.completedAt = new Date().toISOString()
      log('info', 'Picking task completed', { taskNumber: task.taskNumber })
      return new Response(JSON.stringify(successResponse(task, 'Picking task completed')), { headers })
    }

    // ─── Scrap Records ─────────────────────────────────────
    if (path === '/api/scrap-records' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(SI_DATA.scrapRecords, 'Scrap records')), { headers })
    }
    // POST /api/scrap-records/:id/approve
    if (path.match(/^\/api\/scrap-records\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]
      const scrap = SI_DATA.scrapRecords.find(s => s.id === id)
      if (!scrap) return new Response(JSON.stringify(errorResponse('Scrap record not found', 'NOT_FOUND', 404)), { status: 404, headers })
      scrap.status = 'POSTED'
      log('info', 'Scrap record approved & posted', { scrapNumber: scrap.scrapNumber })
      return new Response(JSON.stringify(successResponse(scrap, 'Scrap record posted to inventory')), { headers })
    }

    // ─── Damage Records ────────────────────────────────────
    if (path === '/api/damage-records' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(SI_DATA.damageRecords, 'Damage records')), { headers })
    }

    // ─── Outbound Dashboard ────────────────────────────────
    if (path === '/api/stock-issues/dashboard' && method === 'GET') {
      const today = SI_DATA.stockIssues.filter(s => s.date === '2026-07-09')
      return new Response(JSON.stringify(successResponse({
        counts: {
          totalIssues: SI_DATA.stockIssues.length,
          todayIssues: today.length,
          pendingApproval: SI_DATA.stockIssues.filter(s => s.status === 'PENDING_APPROVAL').length,
          pickingInProgress: SI_DATA.stockIssues.filter(s => s.status === 'PICKING_IN_PROGRESS').length,
          issued: SI_DATA.stockIssues.filter(s => s.status === 'ISSUED').length,
          pickingTasks: SI_DATA.pickingTasks.length,
          pendingPicks: SI_DATA.pickingTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
          scrapRecords: SI_DATA.scrapRecords.length,
          pendingScrap: SI_DATA.scrapRecords.filter(s => s.status === 'PENDING_APPROVAL').length,
          damageRecords: SI_DATA.damageRecords.length,
          underReviewDamage: SI_DATA.damageRecords.filter(d => d.status === 'UNDER_REVIEW' || d.status === 'REPORTED').length,
        },
        outbound: {
          totalIssuedToday: today.reduce((s, i) => s + i.issuedQty, 0),
          totalValueToday: today.reduce((s, i) => s + i.totalValue, 0),
          totalScrapValue: SI_DATA.scrapRecords.reduce((s, r) => s + r.value, 0),
          totalDamageValue: SI_DATA.damageRecords.reduce((s, d) => s + d.value, 0),
        },
      }, 'Outbound dashboard')), { headers })
    }

    // ─── Info ──────────────────────────────────────────────
    if (path === '/api/stock-issues/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Stock Issue & Outbound Engine',
        version: '14.0.0',
        sprint: 14,
        sprintName: 'Stock Issue, Material Consumption & Outbound Engine',
        issueTypes: ['PRODUCTION_ISSUE', 'KITCHEN_ISSUE', 'SALES_ISSUE', 'SAMPLE_ISSUE', 'DAMAGE_ISSUE', 'SCRAP_ISSUE', 'INTERNAL_CONSUMPTION', 'MAINTENANCE_ISSUE', 'TRANSFER_ISSUE', 'RETURN_TO_SUPPLIER', 'ADJUSTMENT_ISSUE'],
        pickingStrategies: ['FIFO', 'FEFO', 'NEAREST_BIN', 'WAVE', 'ZONE', 'PRIORITY'],
        scrapTypes: ['PRODUCTION_SCRAP', 'WAREHOUSE_DAMAGE', 'TRANSPORT_DAMAGE', 'EXPIRED_PRODUCTS', 'CUSTOMER_DAMAGE_RETURNS', 'QUALITY_REJECTION'],
        damageTypes: ['WAREHOUSE_DAMAGE', 'TRANSPORT_DAMAGE', 'HANDLING_DAMAGE', 'STORAGE_DAMAGE', 'CUSTOMER_RETURN_DAMAGE', 'PRODUCTION_DAMAGE'],
        endpoints: [
          'GET/POST /api/stock-issues',
          'POST   /api/stock-issues/:id/approve',
          'GET    /api/picking/tasks',
          'POST   /api/picking/tasks/:id/complete',
          'GET    /api/scrap-records',
          'POST   /api/scrap-records/:id/approve',
          'GET    /api/damage-records',
          'GET    /api/stock-issues/dashboard',
          'GET    /api/stock-issues/info',
        ],
      }, 'SUOP Outbound Engine v14.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 15 — STOCK TRANSFER & IN-TRANSIT ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    if (path === '/api/stock-transfers' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let transfers = ST_DATA.transfers
      if (typeFilter) transfers = transfers.filter(t => t.transferType === typeFilter.toUpperCase())
      if (statusFilter) transfers = transfers.filter(t => t.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(transfers, `${transfers.length} stock transfers`)), { headers })
    }
    if (path === '/api/stock-transfers' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.sourceWarehouseId || !body.destWarehouseId) return new Response(JSON.stringify(errorResponse('source and destination required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        if (body.sourceWarehouseId === body.destWarehouseId) return new Response(JSON.stringify(errorResponse('Source and destination cannot be the same', 'SAME_LOCATION', 400)), { status: 400, headers })
        const transferNumber = `ST-2026-${String(50 + ST_DATA.transfers.length).padStart(4, '0')}`
        const transfer = { id: crypto.randomUUID(), transferNumber, transferType: body.transferType || 'WAREHOUSE_TO_WAREHOUSE', date: body.date || new Date().toISOString().slice(0,10), sourceWh: body.sourceWarehouseName || 'Source', destWh: body.destWarehouseName || 'Destination', vehicle: body.vehicleNumber || null, driver: body.driverName || null, carrier: body.carrierName || null, status: 'DRAFT', lines: body.lines ? body.lines.length : 0, requested: body.lines ? body.lines.reduce((s:number,l:any)=>s+Number(l.requestedQty||0),0) : 0, dispatched: 0, received: 0, value: 0, requestedBy: body.requestedByName || 'System', eta: null, actualArrival: null }
        ST_DATA.transfers.unshift(transfer)
        log('info', 'Stock transfer created', { transferNumber })
        return new Response(JSON.stringify(successResponse(transfer, `Transfer ${transferNumber} created`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    if (path.match(/^\/api\/stock-transfers\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]; const t = ST_DATA.transfers.find(x => x.id === id)
      if (!t) return new Response(JSON.stringify(errorResponse('Not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (t.status !== 'SUBMITTED' && t.status !== 'DRAFT') return new Response(JSON.stringify(errorResponse(`Cannot approve in ${t.status}`)), { status: 400, headers })
      t.status = 'APPROVED'; log('info', 'Transfer approved', { transferNumber: t.transferNumber })
      return new Response(JSON.stringify(successResponse(t, 'Transfer approved')), { headers })
    }
    if (path.match(/^\/api\/stock-transfers\/[^/]+\/dispatch$/) && method === 'POST') {
      const id = path.split('/')[3]; const t = ST_DATA.transfers.find(x => x.id === id)
      if (!t) return new Response(JSON.stringify(errorResponse('Not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (t.status !== 'APPROVED') return new Response(JSON.stringify(errorResponse(`Cannot dispatch in ${t.status}`)), { status: 400, headers })
      t.status = 'IN_TRANSIT'; t.dispatched = t.requested; log('info', 'Transfer dispatched', { transferNumber: t.transferNumber })
      return new Response(JSON.stringify(successResponse(t, 'Transfer dispatched - in transit')), { headers })
    }
    if (path.match(/^\/api\/stock-transfers\/[^/]+\/receive$/) && method === 'POST') {
      const id = path.split('/')[3]; const t = ST_DATA.transfers.find(x => x.id === id)
      if (!t) return new Response(JSON.stringify(errorResponse('Not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (t.status !== 'IN_TRANSIT' && t.status !== 'DISPATCHED') return new Response(JSON.stringify(errorResponse(`Cannot receive in ${t.status}`)), { status: 400, headers })
      t.status = 'COMPLETED'; t.received = t.dispatched; t.actualArrival = new Date().toISOString().slice(0,10); log('info', 'Transfer received', { transferNumber: t.transferNumber })
      return new Response(JSON.stringify(successResponse(t, 'Transfer received and completed')), { headers })
    }
    if (path === '/api/stock-transfers/in-transit' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ST_DATA.inTransit, 'In-transit inventory')), { headers })
    }
    if (path === '/api/bin-transfers' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ST_DATA.binTransfers, 'Bin transfers')), { headers })
    }
    if (path === '/api/stock-transfers/dashboard' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        counts: { total: ST_DATA.transfers.length, completed: ST_DATA.transfers.filter(t=>t.status==='COMPLETED').length, inTransit: ST_DATA.transfers.filter(t=>t.status==='IN_TRANSIT').length, pendingApproval: ST_DATA.transfers.filter(t=>t.status==='SUBMITTED').length, dispatched: ST_DATA.transfers.filter(t=>t.status==='DISPATCHED').length, partialReceipt: ST_DATA.transfers.filter(t=>t.status==='PARTIALLY_RECEIVED').length },
        transit: { inTransitItems: ST_DATA.inTransit.length, inTransitValue: ST_DATA.inTransit.reduce((s,i)=>s+i.value,0) },
        binTransfers: { total: ST_DATA.binTransfers.length, pending: ST_DATA.binTransfers.filter(b=>b.status==='PENDING').length, completed: ST_DATA.binTransfers.filter(b=>b.status==='COMPLETED').length },
      }, 'Transfer dashboard')), { headers })
    }
    if (path === '/api/stock-transfers/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Stock Transfer & In-Transit Engine', version: '15.0.0', sprint: 15,
        sprintName: 'Enterprise Stock Transfer & In-Transit Inventory Engine',
        transferTypes: ['WAREHOUSE_TO_WAREHOUSE','WAREHOUSE_TO_STORE','WAREHOUSE_TO_RESTAURANT','PLANT_TO_WAREHOUSE','PLANT_TO_STORE','BRANCH_TO_BRANCH','BIN_TO_BIN','LOCATION_TO_LOCATION','COLD_STORAGE_TRANSFER','TRANSIT_VEHICLE_TRANSFER','RETURN_TRANSFER'],
        transferStatuses: ['DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELLED','PARTIALLY_DISPATCHED','DISPATCHED','IN_TRANSIT','PARTIALLY_RECEIVED','COMPLETED'],
        endpoints: ['GET/POST /api/stock-transfers','POST /:id/approve','POST /:id/dispatch','POST /:id/receive','GET /api/stock-transfers/in-transit','GET /api/bin-transfers','GET /api/stock-transfers/dashboard','GET /api/stock-transfers/info'],
      }, 'SUOP Transfer Engine v15.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 16 — INVENTORY ADJUSTMENT & RECONCILIATION ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    if (path === '/api/inventory-adjustments' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let adjustments = ADJ_DATA.adjustments
      if (typeFilter) adjustments = adjustments.filter(a => a.adjustmentType === typeFilter.toUpperCase())
      if (statusFilter) adjustments = adjustments.filter(a => a.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(adjustments, `${adjustments.length} inventory adjustments`)), { headers })
    }
    if (path === '/api/inventory-adjustments' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.adjustmentType) return new Response(JSON.stringify(errorResponse('adjustmentType is required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        const adjustmentNumber = `ADJ-2026-${String(108 + ADJ_DATA.adjustments.length).padStart(4, '0')}`
        const adjustment = {
          id: crypto.randomUUID(), adjustmentNumber,
          adjustmentDate: body.adjustmentDate || new Date().toISOString().slice(0, 10),
          adjustmentType: body.adjustmentType.toUpperCase(),
          warehouseName: body.warehouseName || null,
          reason: body.reason || null,
          status: 'DRAFT',
          totalLines: body.lines ? body.lines.length : 0,
          totalAdjustmentQty: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.differenceQty || 0), 0) : 0,
          totalAdjustmentValue: body.lines ? body.lines.reduce((s: number, l: any) => s + Number(l.adjustmentValue || 0), 0) : 0,
          requestedByName: body.requestedByName || 'System',
          approvedByName: null, approvedAt: null, postedAt: null,
          inventoryPosted: false, financePosted: false, isWriteOff: body.isWriteOff || false,
          photoAttached: body.photoAttached || false,
          remarks: body.remarks || null,
        }
        ADJ_DATA.adjustments.unshift(adjustment)
        log('info', 'Inventory adjustment created', { adjustmentNumber, type: adjustment.adjustmentType })
        return new Response(JSON.stringify(successResponse(adjustment, `Adjustment ${adjustmentNumber} created`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    if (path.match(/^\/api\/inventory-adjustments\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]; const a = ADJ_DATA.adjustments.find(x => x.id === id)
      if (!a) return new Response(JSON.stringify(errorResponse('Not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (a.status !== 'DRAFT' && a.status !== 'SUBMITTED' && a.status !== 'PENDING_APPROVAL') return new Response(JSON.stringify(errorResponse(`Cannot approve in ${a.status}`)), { status: 400, headers })
      a.status = 'APPROVED'; a.approvedByName = a.approvedByName || 'Anita Desai'; a.approvedAt = new Date().toISOString().slice(0, 10)
      log('info', 'Adjustment approved', { adjustmentNumber: a.adjustmentNumber })
      return new Response(JSON.stringify(successResponse(a, 'Adjustment approved')), { headers })
    }
    if (path === '/api/inventory-adjustments/reasons' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ADJ_DATA.reasons, 'Adjustment reasons')), { headers })
    }
    if (path === '/api/damage-reports-s16' && method === 'GET') {
      const severityFilter = url.searchParams.get('severity')
      let reports = ADJ_DATA.damageReports
      if (severityFilter) reports = reports.filter(r => r.damageSeverity === severityFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(reports, `${reports.length} damage reports`)), { headers })
    }
    if (path === '/api/expiry-adjustments' && method === 'GET') {
      const categoryFilter = url.searchParams.get('category')
      let adjustments = ADJ_DATA.expiryAdjustments
      if (categoryFilter) adjustments = adjustments.filter(a => a.expiryCategory === categoryFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(adjustments, `${adjustments.length} expiry adjustments`)), { headers })
    }
    if (path === '/api/inventory-adjustments/root-causes' && method === 'GET') {
      const categoryFilter = url.searchParams.get('category')
      let causes = ADJ_DATA.rootCauses
      if (categoryFilter) causes = causes.filter(c => c.rootCauseCategory === categoryFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(causes, `${causes.length} root cause records`)), { headers })
    }
    if (path === '/api/inventory-adjustments/dashboard' && method === 'GET') {
      const totalWriteOffValue = ADJ_DATA.adjustments.filter(a => a.isWriteOff && a.status === 'POSTED').reduce((s, a) => s + Math.abs(a.totalAdjustmentValue), 0)
        + ADJ_DATA.damageReports.reduce((s, d) => s + d.totalDamageValue, 0)
        + ADJ_DATA.expiryAdjustments.reduce((s, e) => s + e.totalValue, 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          total: ADJ_DATA.adjustments.length,
          posted: ADJ_DATA.adjustments.filter(a => a.status === 'POSTED').length,
          pendingApproval: ADJ_DATA.adjustments.filter(a => a.status === 'PENDING_APPROVAL' || a.status === 'SUBMITTED').length,
          approved: ADJ_DATA.adjustments.filter(a => a.status === 'APPROVED').length,
          rejected: ADJ_DATA.adjustments.filter(a => a.status === 'REJECTED').length,
          writeOffs: ADJ_DATA.adjustments.filter(a => a.isWriteOff).length,
        },
        types: {
          stockGain: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'STOCK_GAIN').length,
          stockLoss: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'STOCK_LOSS').length,
          damage: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'DAMAGE').length,
          expiry: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'EXPIRY').length,
          shrinkage: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'SHRINKAGE').length,
          theft: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'THEFT').length,
          productionVariance: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'PRODUCTION_VARIANCE').length,
          barcodeCorrection: ADJ_DATA.adjustments.filter(a => a.adjustmentType === 'BARCODE_CORRECTION').length,
        },
        damage: {
          total: ADJ_DATA.damageReports.length,
          severe: ADJ_DATA.damageReports.filter(d => d.damageSeverity === 'SEVERE' || d.damageSeverity === 'TOTAL_LOSS').length,
          totalLossValue: ADJ_DATA.damageReports.reduce((s, d) => s + d.totalDamageValue, 0),
        },
        expiry: {
          total: ADJ_DATA.expiryAdjustments.length,
          expired: ADJ_DATA.expiryAdjustments.filter(e => e.expiryCategory === 'EXPIRED').length,
          nearExpiry: ADJ_DATA.expiryAdjustments.filter(e => e.expiryCategory === 'NEAR_EXPIRY').length,
          blocked: ADJ_DATA.expiryAdjustments.filter(e => e.expiryCategory === 'BLOCKED').length,
          totalValue: ADJ_DATA.expiryAdjustments.reduce((s, e) => s + e.totalValue, 0),
        },
        rootCauses: {
          total: ADJ_DATA.rootCauses.length,
          open: ADJ_DATA.rootCauses.filter(r => r.actionStatus === 'OPEN').length,
          inProgress: ADJ_DATA.rootCauses.filter(r => r.actionStatus === 'IN_PROGRESS').length,
          completed: ADJ_DATA.rootCauses.filter(r => r.actionStatus === 'COMPLETED').length,
          recurring: ADJ_DATA.rootCauses.filter(r => r.isRecurring).length,
        },
        writeOffValue: totalWriteOffValue,
        reasonsCount: ADJ_DATA.reasons.length,
      }, 'Adjustment & Reconciliation dashboard')), { headers })
    }
    if (path === '/api/inventory-adjustments/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Adjustment & Reconciliation Engine', version: '16.0.0', sprint: 16,
        sprintName: 'Inventory Adjustment, Damage, Expiry & Root Cause Analysis',
        adjustmentTypes: ['STOCK_GAIN','STOCK_LOSS','DAMAGE','EXPIRY','SHRINKAGE','THEFT','PRODUCTION_VARIANCE','PACKING_VARIANCE','SUPPLIER_SHORTAGE','CUSTOMER_RETURN_CORRECTION','BARCODE_CORRECTION','OPENING_BALANCE_CORRECTION','FINANCIAL_RECONCILIATION'],
        adjustmentStatuses: ['DRAFT','SUBMITTED','PENDING_APPROVAL','APPROVED','POSTED','REJECTED','CANCELLED'],
        damageTypes: ['FOOD_DAMAGE','TRANSPORT_DAMAGE','WAREHOUSE_DAMAGE','PRODUCTION_DAMAGE','STORAGE_DAMAGE','HANDLING_DAMAGE'],
        damageSeverities: ['MINOR','MODERATE','SEVERE','TOTAL_LOSS'],
        expiryCategories: ['EXPIRED','NEAR_EXPIRY','BLOCKED'],
        rootCauseCategories: ['RECEIVING','STORAGE','PRODUCTION','PACKING','PICKING','DISPATCH','TRANSPORT','RETAIL','RESTAURANT','SYSTEM_ERROR','HUMAN_ERROR'],
        effectTypes: ['INCREASE','DECREASE','NEUTRAL'],
        approvalLevels: ['SUPERVISOR','WAREHOUSE_MANAGER','FINANCE','MANAGEMENT'],
        endpoints: ['GET/POST /api/inventory-adjustments','POST /:id/approve','GET /api/inventory-adjustments/reasons','GET /api/damage-reports-s16','GET /api/expiry-adjustments','GET /api/inventory-adjustments/root-causes','GET /api/inventory-adjustments/dashboard','GET /api/inventory-adjustments/info'],
      }, 'SUOP Adjustment Engine v16.0.0')), { headers })
    }

    // ─── Sprint 17: Reservation & Allocation Endpoints ────
    if (path === '/api/reservations' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const priorityFilter = url.searchParams.get('priority')
      let reservations = RES_DATA.reservations
      if (typeFilter) reservations = reservations.filter(r => r.reservationType === typeFilter.toUpperCase())
      if (statusFilter) reservations = reservations.filter(r => r.status === statusFilter.toUpperCase())
      if (priorityFilter) reservations = reservations.filter(r => r.priority === priorityFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(reservations, `${reservations.length} reservations`)), { headers })
    }
    if (path === '/api/reservations' && method === 'POST') {
      try {
        const body = await req.json()
        const reservationNumber = body.reservationNumber || `RSV-2026-${String(RES_DATA.reservations.length + 1).padStart(4, '0')}`
        const reservation = {
          id: `res-${String(RES_DATA.reservations.length + 1).padStart(3, '0')}`,
          reservationNumber, reservationDate: body.reservationDate || new Date().toISOString().slice(0, 10),
          reservationType: body.reservationType || 'SALES_ORDER', priority: body.priority || 'NORMAL', priorityScore: body.priorityScore || 50,
          warehouseName: body.warehouseName || 'Mumbai DC', branchName: body.branchName || 'Mumbai Branch',
          referenceType: body.referenceType || null, referenceNumber: body.referenceNumber || null, partnerName: body.partnerName || null,
          expiryDate: body.expiryDate || null, autoReleaseAfter: body.autoReleaseAfter || 72,
          status: body.status || 'ACTIVE', totalLines: body.totalLines || 1,
          totalRequestedQty: body.totalRequestedQty || 0, totalReservedQty: body.totalReservedQty || 0,
          totalAllocatedQty: body.totalAllocatedQty || 0, totalIssuedQty: body.totalIssuedQty || 0,
          createdByName: body.createdByName || 'Anita Desai', remarks: body.remarks || null,
        }
        RES_DATA.reservations.unshift(reservation)
        log('info', 'Reservation created', { reservationNumber, type: reservation.reservationType })
        return new Response(JSON.stringify(successResponse(reservation, `Reservation ${reservationNumber} created`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    if (path === '/api/reservations/availability' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(RES_DATA.availabilitySnapshots, `${RES_DATA.availabilitySnapshots.length} availability snapshots`)), { headers })
    }
    if (path === '/api/reservations/dashboard' && method === 'GET') {
      const totalReservedValue = RES_DATA.availabilitySnapshots.reduce((s, a) => s + (a.reservedQty * a.unitCost), 0)
      const totalAvailableValue = RES_DATA.availabilitySnapshots.reduce((s, a) => s + (Math.max(0, a.availableQty) * a.unitCost), 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          total: RES_DATA.reservations.length,
          active: RES_DATA.reservations.filter(r => r.status === 'ACTIVE').length,
          fullyAllocated: RES_DATA.reservations.filter(r => r.status === 'FULLY_ALLOCATED').length,
          partiallyAllocated: RES_DATA.reservations.filter(r => r.status === 'PARTIALLY_ALLOCATED').length,
          released: RES_DATA.reservations.filter(r => r.status === 'RELEASED').length,
          expired: RES_DATA.reservations.filter(r => r.status === 'EXPIRED').length,
        },
        byType: {
          salesOrder: RES_DATA.reservations.filter(r => r.reservationType === 'SALES_ORDER').length,
          productionOrder: RES_DATA.reservations.filter(r => r.reservationType === 'PRODUCTION_ORDER').length,
          kitchenOrder: RES_DATA.reservations.filter(r => r.reservationType === 'KITCHEN_ORDER').length,
          transferOrder: RES_DATA.reservations.filter(r => r.reservationType === 'TRANSFER_ORDER').length,
          maintenanceOrder: RES_DATA.reservations.filter(r => r.reservationType === 'MAINTENANCE_ORDER').length,
          projectReservation: RES_DATA.reservations.filter(r => r.reservationType === 'PROJECT_RESERVATION').length,
          sampleReservation: RES_DATA.reservations.filter(r => r.reservationType === 'SAMPLE_RESERVATION').length,
          emergencyReservation: RES_DATA.reservations.filter(r => r.reservationType === 'EMERGENCY_RESERVATION').length,
        },
        byPriority: {
          emergency: RES_DATA.reservations.filter(r => r.priority === 'EMERGENCY').length,
          critical: RES_DATA.reservations.filter(r => r.priority === 'CRITICAL').length,
          high: RES_DATA.reservations.filter(r => r.priority === 'HIGH').length,
          normal: RES_DATA.reservations.filter(r => r.priority === 'NORMAL').length,
          low: RES_DATA.reservations.filter(r => r.priority === 'LOW').length,
        },
        totals: {
          totalRequested: RES_DATA.reservations.reduce((s, r) => s + r.totalRequestedQty, 0),
          totalReserved: RES_DATA.reservations.reduce((s, r) => s + r.totalReservedQty, 0),
          totalAllocated: RES_DATA.reservations.reduce((s, r) => s + r.totalAllocatedQty, 0),
          totalIssued: RES_DATA.reservations.reduce((s, r) => s + r.totalIssuedQty, 0),
        },
        availability: {
          totalItems: RES_DATA.availabilitySnapshots.length,
          shortSupplyItems: RES_DATA.availabilitySnapshots.filter(a => a.availableQty <= 0).length,
          totalReservedValue, totalAvailableValue,
        },
        rulesCount: RES_DATA.allocationRules.length,
        priorityMatrix: RES_DATA.priorityMatrix,
      }, 'Reservation & Allocation dashboard')), { headers })
    }
    if (path === '/api/allocation-rules' && method === 'GET') {
      const strategyFilter = url.searchParams.get('strategy')
      let rules = RES_DATA.allocationRules
      if (strategyFilter) rules = rules.filter(r => r.strategy === strategyFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(rules, `${rules.length} allocation rules`)), { headers })
    }
    if (path === '/api/reservations/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Reservation & Allocation Engine', version: '17.0.0', sprint: 17,
        sprintName: 'Inventory Reservation, Allocation & Availability Engine',
        reservationTypes: ['SALES_ORDER','PRODUCTION_ORDER','KITCHEN_ORDER','TRANSFER_ORDER','MAINTENANCE_ORDER','PROJECT_RESERVATION','SAMPLE_RESERVATION','EMERGENCY_RESERVATION'],
        priorityLevels: ['EMERGENCY','CRITICAL','HIGH','NORMAL','LOW'],
        reservationStatuses: ['ACTIVE','PARTIALLY_ALLOCATED','FULLY_ALLOCATED','PARTIALLY_ISSUED','FULLY_ISSUED','RELEASED','EXPIRED','CANCELLED'],
        allocationStrategies: ['FIFO','FEFO','LIFO','NEAREST_BIN','LOWEST_COST','HIGHEST_PRIORITY','MANUAL'],
        batchPreferences: ['SAME_BATCH','MULTIPLE_BATCH','AUTO_BATCH','EXPIRY_BASED','SUPPLIER_BATCH'],
        lineAllocationStatuses: ['PENDING','PARTIALLY_ALLOCATED','FULLY_ALLOCATED','SHORT_SUPPLY','ALLOCATION_FAILED'],
        endpoints: ['GET/POST /api/reservations','POST /:id/release','GET /:id/allocate','GET /api/allocation-rules','GET /api/reservations/availability','GET /api/reservations/dashboard','GET /api/reservations/info'],
      }, 'SUOP Reservation Engine v17.0.0')), { headers })
    }
    if (path.match(/^\/api\/reservations\/[^/]+\/release$/) && method === 'POST') {
      const id = path.split('/')[3]; const r = RES_DATA.reservations.find(x => x.id === id)
      if (!r) return new Response(JSON.stringify(errorResponse('Reservation not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (r.status === 'RELEASED' || r.status === 'EXPIRED') return new Response(JSON.stringify(errorResponse(`Cannot release in ${r.status}`)), { status: 400, headers })
      r.status = 'RELEASED'
      log('info', 'Reservation released', { reservationNumber: r.reservationNumber })
      return new Response(JSON.stringify(successResponse(r, `Reservation ${r.reservationNumber} released — allocated stock returned to available pool`)), { headers })
    }
    if (path.match(/^\/api\/reservations\/[^/]+\/allocate$/) && method === 'GET') {
      const id = path.split('/')[3]; const r = RES_DATA.reservations.find(x => x.id === id)
      if (!r) return new Response(JSON.stringify(errorResponse('Reservation not found', 'NOT_FOUND', 404)), { status: 404, headers })
      // Simulate allocation: try to fully allocate the remaining requested qty
      const remainingQty = Math.max(0, r.totalRequestedQty - r.totalAllocatedQty)
      const wasStatus = r.status
      if (remainingQty > 0) {
        r.totalAllocatedQty = r.totalRequestedQty
        r.status = r.totalIssuedQty > 0 ? 'FULLY_ALLOCATED' : 'FULLY_ALLOCATED'
      } else {
        r.status = 'FULLY_ALLOCATED'
      }
      log('info', 'Reservation allocated', { reservationNumber: r.reservationNumber, wasStatus, nowStatus: r.status })
      return new Response(JSON.stringify(successResponse({
        reservation: r,
        allocationResult: {
          previouslyAllocated: r.totalAllocatedQty - remainingQty,
          newlyAllocated: remainingQty,
          totalAllocated: r.totalAllocatedQty,
          remainingShort: 0,
          statusChanged: wasStatus !== r.status,
        },
      }, `Reservation ${r.reservationNumber} allocated — ${remainingQty} units newly allocated`)), { headers })
    }

    // ─── Sprint 18: Cycle Count & Audit Endpoints ─────────
    if (path === '/api/physical-inventory' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const warehouseFilter = url.searchParams.get('warehouse')
      let inventories = CC_DATA.physicalInventories
      if (typeFilter) inventories = inventories.filter(i => i.countType === typeFilter.toUpperCase())
      if (statusFilter) inventories = inventories.filter(i => i.status === statusFilter.toUpperCase())
      if (warehouseFilter) inventories = inventories.filter(i => i.warehouseName.toLowerCase().includes(warehouseFilter.toLowerCase()))
      return new Response(JSON.stringify(successResponse(inventories, `${inventories.length} physical inventory counts`)), { headers })
    }
    if (path === '/api/physical-inventory' && method === 'POST') {
      try {
        const body = await req.json()
        const countNumber = body.countNumber || `PI-2026-${String(CC_DATA.physicalInventories.length + 1).padStart(4, '0')}`
        const inventory: any = {
          id: `pi-${String(CC_DATA.physicalInventories.length + 1).padStart(3, '0')}`,
          countNumber, countDate: body.countDate || new Date().toISOString().slice(0, 10),
          countType: body.countType || 'CYCLE_COUNT', warehouseName: body.warehouseName || 'Mumbai DC',
          branchName: body.branchName || 'Mumbai Branch', teamId: body.teamId || 'ct-001',
          teamName: body.teamName || 'Alpha Count Team', teamLead: body.teamLead || 'Anita Desai',
          scope: body.scope || 'PARTIAL', totalLines: body.totalLines || 0, countedLines: 0, pendingLines: body.totalLines || 0,
          systemQty: body.systemQty || 0, countedQty: 0, varianceQty: 0, varianceValue: 0, accuracyPct: 0,
          status: body.status || 'SCHEDULED', approvalLevel: body.approvalLevel || 'SUPERVISOR',
          scheduledStart: body.scheduledStart || null, actualStart: null, expectedCompletion: body.expectedCompletion || null,
          remarks: body.remarks || null,
        }
        CC_DATA.physicalInventories.unshift(inventory)
        log('info', 'Physical inventory created', { countNumber, type: inventory.countType })
        return new Response(JSON.stringify(successResponse(inventory, `Physical inventory ${countNumber} created`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    if (path.match(/^\/api\/physical-inventory\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]; const inv = CC_DATA.physicalInventories.find(x => x.id === id)
      if (!inv) return new Response(JSON.stringify(errorResponse('Physical inventory not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (inv.status === 'COMPLETED' || inv.status === 'APPROVED') return new Response(JSON.stringify(errorResponse(`Cannot approve in ${inv.status}`)), { status: 400, headers })
      const prevStatus = inv.status
      inv.status = inv.status === 'RECOUNT_REQUIRED' ? 'APPROVED_WITH_RECOUNT' : 'APPROVED'
      log('info', 'Physical inventory approved', { countNumber: inv.countNumber, was: prevStatus, now: inv.status })
      return new Response(JSON.stringify(successResponse(inv, `Physical inventory ${inv.countNumber} approved — variance ${inv.varianceQty} units (₹${inv.varianceValue}) posted to ledger`)), { headers })
    }
    if (path === '/api/cycle-count/plans' && method === 'GET') {
      const freqFilter = url.searchParams.get('frequency')
      let plans = CC_DATA.cyclePlans
      if (freqFilter) plans = plans.filter(p => p.frequency === freqFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(plans, `${plans.length} cycle count plans`)), { headers })
    }
    if (path === '/api/cycle-count/schedules' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let schedules = CC_DATA.cycleSchedules
      if (statusFilter) schedules = schedules.filter(s => s.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(schedules, `${schedules.length} cycle count schedules`)), { headers })
    }
    if (path === '/api/count-teams' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(CC_DATA.countTeams, `${CC_DATA.countTeams.length} count teams`)), { headers })
    }
    if (path === '/api/count-variances' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const resolutionFilter = url.searchParams.get('resolution')
      let variances = CC_DATA.countVariances
      if (typeFilter) variances = variances.filter(v => v.varianceType === typeFilter.toUpperCase())
      if (resolutionFilter) variances = variances.filter(v => v.resolutionStatus === resolutionFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(variances, `${variances.length} count variances`)), { headers })
    }
    if (path === '/api/physical-inventory/dashboard' && method === 'GET') {
      const totalVarianceValue = CC_DATA.physicalInventories.reduce((s, i) => s + i.varianceValue, 0)
      const avgAccuracy = CC_DATA.physicalInventories.reduce((s, i) => s + i.accuracyPct, 0) / CC_DATA.physicalInventories.length
      return new Response(JSON.stringify(successResponse({
        counts: {
          total: CC_DATA.physicalInventories.length,
          inProgress: CC_DATA.physicalInventories.filter(i => i.status === 'IN_PROGRESS').length,
          completed: CC_DATA.physicalInventories.filter(i => i.status === 'COMPLETED' || i.status === 'APPROVED').length,
          pendingApproval: CC_DATA.physicalInventories.filter(i => i.status === 'PENDING_APPROVAL').length,
          varianceInvestigation: CC_DATA.physicalInventories.filter(i => i.status === 'VARIANCE_INVESTIGATION').length,
          recountRequired: CC_DATA.physicalInventories.filter(i => i.status === 'RECOUNT_REQUIRED').length,
        },
        byType: {
          annualCount: CC_DATA.physicalInventories.filter(i => i.countType === 'ANNUAL_COUNT').length,
          cycleCount: CC_DATA.physicalInventories.filter(i => i.countType === 'CYCLE_COUNT').length,
          blindCount: CC_DATA.physicalInventories.filter(i => i.countType === 'BLIND_COUNT').length,
          spotCount: CC_DATA.physicalInventories.filter(i => i.countType === 'SPOT_COUNT').length,
          abcCount: CC_DATA.physicalInventories.filter(i => i.countType === 'ABC_COUNT').length,
          randomCount: CC_DATA.physicalInventories.filter(i => i.countType === 'RANDOM_COUNT').length,
          binCount: CC_DATA.physicalInventories.filter(i => i.countType === 'BIN_COUNT').length,
          investigationCount: CC_DATA.physicalInventories.filter(i => i.countType === 'INVESTIGATION_COUNT').length,
        },
        totals: {
          totalLines: CC_DATA.physicalInventories.reduce((s, i) => s + i.totalLines, 0),
          countedLines: CC_DATA.physicalInventories.reduce((s, i) => s + i.countedLines, 0),
          pendingLines: CC_DATA.physicalInventories.reduce((s, i) => s + i.pendingLines, 0),
          totalSystemQty: CC_DATA.physicalInventories.reduce((s, i) => s + i.systemQty, 0),
          totalCountedQty: CC_DATA.physicalInventories.reduce((s, i) => s + i.countedQty, 0),
          totalVarianceQty: CC_DATA.physicalInventories.reduce((s, i) => s + i.varianceQty, 0),
          totalVarianceValue,
          avgAccuracy: parseFloat(avgAccuracy.toFixed(2)),
        },
        cyclePlans: CC_DATA.cyclePlans.length,
        cycleSchedules: CC_DATA.cycleSchedules.length,
        countTeams: CC_DATA.countTeams.length,
        countVariances: CC_DATA.countVariances.length,
        variancesByType: {
          MISSING: CC_DATA.countVariances.filter(v => v.varianceType === 'MISSING').length,
          EXTRA: CC_DATA.countVariances.filter(v => v.varianceType === 'EXTRA').length,
          WRONG_LOCATION: CC_DATA.countVariances.filter(v => v.varianceType === 'WRONG_LOCATION').length,
          WRONG_BATCH: CC_DATA.countVariances.filter(v => v.varianceType === 'WRONG_BATCH').length,
          WRONG_UOM: CC_DATA.countVariances.filter(v => v.varianceType === 'WRONG_UOM').length,
          WRONG_PRODUCT: CC_DATA.countVariances.filter(v => v.varianceType === 'WRONG_PRODUCT').length,
        },
        abcStrategy: [
          { class: 'A', description: 'High-value items (top 20% revenue)', frequency: 'DAILY', itemsPerCycle: 25, accuracyTarget: 99.5, itemsTracked: 250 },
          { class: 'B', description: 'Medium-value items (next 30% revenue)', frequency: 'WEEKLY', itemsPerCycle: 50, accuracyTarget: 99.0, itemsTracked: 400 },
          { class: 'C', description: 'Low-value items (bottom 50% revenue)', frequency: 'YEARLY', itemsPerCycle: 100, accuracyTarget: 98.0, itemsTracked: 800 },
        ],
      }, 'Cycle Count & Audit dashboard')), { headers })
    }
    if (path === '/api/physical-inventory/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Cycle Count & Audit Engine', version: '18.0.0', sprint: 18,
        sprintName: 'Physical Inventory, Cycle Count & Variance Management',
        countTypes: ['ANNUAL_COUNT','CYCLE_COUNT','BLIND_COUNT','SPOT_COUNT','ABC_COUNT','RANDOM_COUNT','BIN_COUNT','INVESTIGATION_COUNT'],
        countStatuses: ['SCHEDULED','IN_PROGRESS','PENDING_APPROVAL','VARIANCE_INVESTIGATION','RECOUNT_REQUIRED','COMPLETED','APPROVED','APPROVED_WITH_RECOUNT','CANCELLED'],
        approvalLevels: ['SUPERVISOR','WAREHOUSE_MANAGER','FINANCE','MANAGEMENT'],
        cycleFrequencies: ['DAILY','WEEKLY','MONTHLY','QUARTERLY','YEARLY'],
        abcClasses: ['A','B','C','ALL'],
        varianceTypes: ['MISSING','EXTRA','WRONG_LOCATION','WRONG_BATCH','WRONG_UOM','WRONG_PRODUCT'],
        rootCauses: ['SUSPECTED_THEFT','UNRECORDED_RECEIPT','UNRECORDED_ISSUE','PUTAWAY_ERROR','PICKING_ERROR','BATCH_MIXING','UOM_CONVERSION','MISIDENTIFICATION','SYSTEM_ERROR','DAMAGE','EXPIRY'],
        investigationStatuses: ['PENDING','IN_PROGRESS','COMPLETED','ESCALATED'],
        resolutionStatuses: ['PENDING_RECOUNT','ADJUSTMENT_POSTED','RELOCATED','BATCH_CORRECTED','UOM_RECALCULATED','CORRECTED','WRITTEN_OFF','CLOSED'],
        certificationLevels: ['LEVEL_1','LEVEL_2','LEVEL_3','LEVEL_4'],
        endpoints: ['GET/POST /api/physical-inventory','POST /:id/approve','GET /api/cycle-count/plans','GET /api/cycle-count/schedules','GET /api/count-teams','GET /api/count-variances','GET /api/physical-inventory/dashboard','GET /api/physical-inventory/info'],
      }, 'SUOP Cycle Count & Audit Engine v18.0.0')), { headers })
    }

    // ─── Sprint 19: Batch & Expiry Management Endpoints ────
    if (path === '/api/batch-master' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const warehouseFilter = url.searchParams.get('warehouse')
      let batches = BATCH_DATA.batchMasters
      if (typeFilter) batches = batches.filter(b => b.batchType === typeFilter.toUpperCase())
      if (statusFilter) batches = batches.filter(b => b.batchStatus === statusFilter.toUpperCase())
      if (warehouseFilter) batches = batches.filter(b => b.warehouseName?.toLowerCase().includes(warehouseFilter.toLowerCase()))
      return new Response(JSON.stringify(successResponse(batches, `${batches.length} batch master records`)), { headers })
    }
    if (path === '/api/shelf-life-rules' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let rules = BATCH_DATA.shelfLifeRules
      if (statusFilter) rules = rules.filter(r => r.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(rules, `${rules.length} shelf-life rules`)), { headers })
    }
    if (path === '/api/expiry-alerts' && method === 'GET') {
      const levelFilter = url.searchParams.get('level')
      const statusFilter = url.searchParams.get('status')
      let alerts = BATCH_DATA.expiryAlerts
      if (levelFilter) alerts = alerts.filter(a => a.alertLevel === levelFilter.toUpperCase())
      if (statusFilter) alerts = alerts.filter(a => a.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(alerts, `${alerts.length} expiry alerts`)), { headers })
    }
    if (path.match(/^\/api\/expiry-alerts\/[^/]+\/action$/) && method === 'POST') {
      try {
        const id = path.split('/')[3]
        const alert = BATCH_DATA.expiryAlerts.find(a => a.id === id)
        if (!alert) return new Response(JSON.stringify(errorResponse('Expiry alert not found', 'NOT_FOUND', 404)), { status: 404, headers })
        const body = await req.json()
        const action = body.action
        const validActions = ['FEFO_PRIORITIZE', 'DISCOUNT', 'DONATE', 'DESTROY', 'RETURN_TO_SUPPLIER']
        if (!validActions.includes(action)) return new Response(JSON.stringify(errorResponse(`Invalid action. Valid: ${validActions.join(', ')}`, 'VALIDATION_ERROR', 400)), { status: 400, headers })
        const prevStatus = alert.status
        alert.status = 'ACTIONED'
        alert.actionTaken = action
        log('info', 'Expiry alert actioned', { alertId: id, action, was: prevStatus, now: 'ACTIONED' })
        return new Response(JSON.stringify(successResponse(alert, `Expiry alert for batch ${alert.batchNumber} actioned: ${action.replace(/_/g, ' ')}`)), { headers })
      } catch { return new Response(JSON.stringify(errorResponse('Invalid body')), { status: 400, headers }) }
    }
    if (path === '/api/product-recalls' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let recalls = BATCH_DATA.productRecalls
      if (typeFilter) recalls = recalls.filter(r => r.recallType === typeFilter.toUpperCase())
      if (statusFilter) recalls = recalls.filter(r => r.status === statusFilter.toUpperCase())
      // Attach recall batches to each recall
      const recallsWithBatches = recalls.map(r => ({
        ...r,
        batches: BATCH_DATA.recallBatches.filter(rb => rb.recallId === r.id),
      }))
      return new Response(JSON.stringify(successResponse(recallsWithBatches, `${recallsWithBatches.length} product recalls`)), { headers })
    }
    if (path.match(/^\/api\/product-recalls\/[^/]+\/advance$/) && method === 'POST') {
      const id = path.split('/')[3]
      const recall = BATCH_DATA.productRecalls.find(r => r.id === id)
      if (!recall) return new Response(JSON.stringify(errorResponse('Product recall not found', 'NOT_FOUND', 404)), { status: 404, headers })
      const statusFlow: Record<string, string> = {
        'INITIATED': 'INVESTIGATING',
        'INVESTIGATING': 'RECALL_NOTICE_SENT',
        'RECALL_NOTICE_SENT': 'RETURNS_IN_PROGRESS',
        'RETURNS_IN_PROGRESS': 'COMPLETED',
        'COMPLETED': 'COMPLETED',
        'CANCELLED': 'CANCELLED',
      }
      const prevStatus = recall.status
      const nextStatus = statusFlow[recall.status] || recall.status
      if (nextStatus === recall.status) return new Response(JSON.stringify(errorResponse(`Recall already in terminal status: ${recall.status}`, 'INVALID_TRANSITION', 400)), { status: 400, headers })
      recall.status = nextStatus
      if (nextStatus === 'RECALL_NOTICE_SENT' && !recall.noticeSentAt) recall.noticeSentAt = new Date().toISOString()
      if (nextStatus === 'COMPLETED' && !recall.completedAt) recall.completedAt = new Date().toISOString()
      log('info', 'Recall status advanced', { recallNumber: recall.recallNumber, was: prevStatus, now: nextStatus })
      return new Response(JSON.stringify(successResponse(recall, `Recall ${recall.recallNumber} advanced: ${prevStatus} → ${nextStatus}`)), { headers })
    }
    if (path === '/api/batch-genealogy' && method === 'GET') {
      const batchId = url.searchParams.get('batchId')
      const direction = url.searchParams.get('direction') || 'both'
      let genealogies = BATCH_DATA.batchGenealogies
      if (batchId) {
        if (direction === 'forward') {
          // forward: trace what this batch was used to produce (from -> to)
          genealogies = genealogies.filter(g => g.fromBatchId === batchId)
        } else if (direction === 'backward') {
          // backward: trace what raw materials went into this batch (to -> from)
          genealogies = genealogies.filter(g => g.toBatchId === batchId)
        } else {
          genealogies = genealogies.filter(g => g.fromBatchId === batchId || g.toBatchId === batchId)
        }
      }
      return new Response(JSON.stringify(successResponse(genealogies, `${genealogies.length} batch genealogy records`)), { headers })
    }
    if (path.match(/^\/api\/batch-master\/[^/]+\/history$/) && method === 'GET') {
      const id = path.split('/')[3]
      const batch = BATCH_DATA.batchMasters.find(b => b.id === id)
      if (!batch) return new Response(JSON.stringify(errorResponse('Batch not found', 'NOT_FOUND', 404)), { status: 404, headers })
      const history = BATCH_DATA.batchHistories.filter(h => h.batchId === id)
      return new Response(JSON.stringify(successResponse({
        batch,
        history,
        totalTransitions: history.length,
      }, `${history.length} status transitions for batch ${batch.batchNumber}`)), { headers })
    }
    if (path === '/api/batch-master/dashboard' && method === 'GET') {
      const totalBatches = BATCH_DATA.batchMasters.length
      const totalCurrentValue = BATCH_DATA.batchMasters.reduce((s, b) => s + b.totalValue, 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          total: totalBatches,
          available: BATCH_DATA.batchMasters.filter(b => b.batchStatus === 'AVAILABLE').length,
          blocked: BATCH_DATA.batchMasters.filter(b => b.batchStatus === 'BLOCKED').length,
          quarantined: BATCH_DATA.batchMasters.filter(b => b.batchStatus === 'QUARANTINED').length,
          expired: BATCH_DATA.batchMasters.filter(b => b.batchStatus === 'EXPIRED').length,
          recalled: BATCH_DATA.batchMasters.filter(b => b.batchStatus === 'RECALLED').length,
          consumed: BATCH_DATA.batchMasters.filter(b => b.batchStatus === 'CONSUMED').length,
        },
        byType: {
          RAW_MATERIAL: BATCH_DATA.batchMasters.filter(b => b.batchType === 'RAW_MATERIAL').length,
          FINISHED_GOODS: BATCH_DATA.batchMasters.filter(b => b.batchType === 'FINISHED_GOODS').length,
          PACKAGING_MATERIAL: BATCH_DATA.batchMasters.filter(b => b.batchType === 'PACKAGING_MATERIAL').length,
          SEMI_FINISHED: BATCH_DATA.batchMasters.filter(b => b.batchType === 'SEMI_FINISHED').length,
          RETURNED_GOODS: BATCH_DATA.batchMasters.filter(b => b.batchType === 'RETURNED_GOODS').length,
          QUALITY_HOLD: BATCH_DATA.batchMasters.filter(b => b.batchType === 'QUALITY_HOLD').length,
          TRIAL_BATCH: BATCH_DATA.batchMasters.filter(b => b.batchType === 'TRIAL_BATCH').length,
          REWORK_BATCH: BATCH_DATA.batchMasters.filter(b => b.batchType === 'REWORK_BATCH').length,
        },
        byQualityGrade: {
          A: BATCH_DATA.batchMasters.filter(b => b.qualityGrade === 'A').length,
          B: BATCH_DATA.batchMasters.filter(b => b.qualityGrade === 'B').length,
          C: BATCH_DATA.batchMasters.filter(b => b.qualityGrade === 'C').length,
          REJECT: BATCH_DATA.batchMasters.filter(b => b.qualityGrade === 'REJECT').length,
        },
        expiryAlerts: {
          total: BATCH_DATA.expiryAlerts.length,
          healthy: BATCH_DATA.expiryAlerts.filter(a => a.alertLevel === 'HEALTHY').length,
          nearExpiry: BATCH_DATA.expiryAlerts.filter(a => a.alertLevel === 'NEAR_EXPIRY').length,
          critical: BATCH_DATA.expiryAlerts.filter(a => a.alertLevel === 'CRITICAL').length,
          expired: BATCH_DATA.expiryAlerts.filter(a => a.alertLevel === 'EXPIRED').length,
          active: BATCH_DATA.expiryAlerts.filter(a => a.status === 'ACTIVE').length,
          acknowledged: BATCH_DATA.expiryAlerts.filter(a => a.status === 'ACKNOWLEDGED').length,
          actioned: BATCH_DATA.expiryAlerts.filter(a => a.status === 'ACTIONED').length,
        },
        recalls: {
          total: BATCH_DATA.productRecalls.length,
          initiated: BATCH_DATA.productRecalls.filter(r => r.status === 'INITIATED').length,
          investigating: BATCH_DATA.productRecalls.filter(r => r.status === 'INVESTIGATING').length,
          returnsInProgress: BATCH_DATA.productRecalls.filter(r => r.status === 'RETURNS_IN_PROGRESS').length,
          completed: BATCH_DATA.productRecalls.filter(r => r.status === 'COMPLETED').length,
          totalCustomersAffected: BATCH_DATA.productRecalls.reduce((s, r) => s + r.totalCustomersAffected, 0),
          totalValue: BATCH_DATA.productRecalls.reduce((s, r) => s + r.totalValue, 0),
        },
        shelfLifeRules: BATCH_DATA.shelfLifeRules.length,
        genealogyLinks: BATCH_DATA.batchGenealogies.length,
        totalCurrentValue,
        fefoBatches: BATCH_DATA.batchMasters.filter(b => b.fefoPriority <= 20).length,
        averageFefoPriority: parseFloat((BATCH_DATA.batchMasters.reduce((s, b) => s + b.fefoPriority, 0) / totalBatches).toFixed(1)),
      }, 'Batch & Expiry Management dashboard')), { headers })
    }
    if (path === '/api/batch-master/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Batch & Expiry Management Engine', version: '19.0.0', sprint: 19,
        sprintName: 'Batch Lifecycle, Shelf-Life, Expiry Monitoring, Recall Engine & Genealogy',
        batchTypes: ['RAW_MATERIAL', 'PACKAGING_MATERIAL', 'SEMI_FINISHED', 'FINISHED_GOODS', 'RETURNED_GOODS', 'QUALITY_HOLD', 'TRIAL_BATCH', 'REWORK_BATCH'],
        batchStatuses: ['PLANNED', 'CREATED', 'RELEASED', 'AVAILABLE', 'RESERVED', 'BLOCKED', 'QUARANTINED', 'EXPIRED', 'RECALLED', 'CONSUMED', 'CLOSED'],
        qualityGrades: ['A', 'B', 'C', 'REJECT'],
        qualityStatuses: ['PENDING', 'PASSED', 'FAILED', 'QUARANTINE'],
        alertLevels: ['HEALTHY', 'NEAR_EXPIRY', 'CRITICAL', 'EXPIRED'],
        alertStatuses: ['ACTIVE', 'ACKNOWLEDGED', 'ACTIONED', 'DISMISSED'],
        alertActions: ['FEFO_PRIORITIZE', 'DISCOUNT', 'DONATE', 'DESTROY', 'RETURN_TO_SUPPLIER'],
        recallTypes: ['FULL_RECALL', 'PARTIAL_RECALL', 'MARKET_WITHDRAWAL', 'SUPPLIER_RECALL', 'INTERNAL_RECALL'],
        recallReasons: ['QUALITY_ISSUE', 'CONTAMINATION', 'MISLABELING', 'FOREIGN_OBJECT', 'REGULATORY', 'CUSTOMER_COMPLAINT'],
        recallStatuses: ['INITIATED', 'INVESTIGATING', 'RECALL_NOTICE_SENT', 'RETURNS_IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        recallBatchStatuses: ['IDENTIFIED', 'NOTIFIED', 'RETURNED', 'DISPOSED', 'WRITTEN_OFF'],
        genealogyRelationshipTypes: ['PRODUCED_FROM', 'USED_IN', 'REPACKED_FROM', 'REWORKED_FROM', 'BLEND_OF'],
        genealogyDirections: ['forward (Batch → Outputs)', 'backward (Batch → Inputs)', 'both'],
        fefoStrategy: 'First Expiry First Out — lower fefoPriority value = picked first (priority 1 = next to dispatch)',
        endpoints: ['GET /api/batch-master', 'GET /api/batch-master/:id/history', 'GET /api/shelf-life-rules', 'GET /api/expiry-alerts', 'POST /api/expiry-alerts/:id/action', 'GET /api/product-recalls', 'POST /api/product-recalls/:id/advance', 'GET /api/batch-genealogy', 'GET /api/batch-master/dashboard', 'GET /api/batch-master/info'],
      }, 'SUOP Batch & Expiry Management Engine v19.0.0')), { headers })
    }

    // ─── Sprint 20: Costing & Valuation Endpoints ──────────
    if (path === '/api/cost-layers' && method === 'GET') {
      const productFilter = url.searchParams.get('product')
      const methodFilter = url.searchParams.get('method')
      const statusFilter = url.searchParams.get('status')
      let layers = COST_DATA.costLayers
      if (productFilter) layers = layers.filter(l => l.productName.toLowerCase().includes(productFilter.toLowerCase()))
      if (methodFilter) layers = layers.filter(l => l.costingMethod === methodFilter.toUpperCase())
      if (statusFilter) layers = layers.filter(l => l.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(layers, `${layers.length} cost layer records`)), { headers })
    }
    if (path === '/api/cost-history' && method === 'GET') {
      const changeTypeFilter = url.searchParams.get('changeType')
      const productFilter = url.searchParams.get('product')
      let history = COST_DATA.costHistory
      if (changeTypeFilter) history = history.filter(h => h.changeType === changeTypeFilter.toUpperCase())
      if (productFilter) history = history.filter(h => h.productName.toLowerCase().includes(productFilter.toLowerCase()))
      return new Response(JSON.stringify(successResponse(history, `${history.length} cost history records`)), { headers })
    }
    if (path === '/api/landed-costs' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let docs = COST_DATA.landedCostDocuments
      if (statusFilter) docs = docs.filter(d => d.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(docs, `${docs.length} landed cost documents`)), { headers })
    }
    if (path.match(/^\/api\/landed-costs\/[^/]+\/allocate$/) && method === 'POST') {
      const id = path.split('/')[3]
      const doc = COST_DATA.landedCostDocuments.find(d => d.id === id)
      if (!doc) return new Response(JSON.stringify(errorResponse('Landed cost document not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (doc.status === 'POSTED') return new Response(JSON.stringify(errorResponse(`Document already in terminal status: ${doc.status}`, 'INVALID_TRANSITION', 400)), { status: 400, headers })
      const prevStatus = doc.status
      doc.allocations.forEach(a => { a.isAllocated = true; a.allocatedAt = new Date().toISOString() })
      doc.totalAllocatedCost = doc.allocations.reduce((s, a) => s + a.amount, 0)
      doc.totalLandedCost = doc.productCost + doc.totalAllocatedCost
      doc.status = 'ALLOCATED'
      log('info', 'Landed cost document allocated', { docNumber: doc.documentNumber, was: prevStatus, now: 'ALLOCATED', totalAllocated: doc.totalAllocatedCost })
      return new Response(JSON.stringify(successResponse(doc, `Landed cost ${doc.documentNumber} allocated: ${prevStatus} → ALLOCATED (${doc.allocations.length} components, total ₹${doc.totalAllocatedCost})`)), { headers })
    }
    if (path === '/api/inventory-revaluations' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let revs = COST_DATA.revaluations
      if (typeFilter) revs = revs.filter(r => r.revaluationType === typeFilter.toUpperCase())
      if (statusFilter) revs = revs.filter(r => r.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(revs, `${revs.length} inventory revaluations`)), { headers })
    }
    if (path.match(/^\/api\/inventory-revaluations\/[^/]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]
      const rev = COST_DATA.revaluations.find(r => r.id === id)
      if (!rev) return new Response(JSON.stringify(errorResponse('Revaluation not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (rev.status === 'POSTED' || rev.status === 'REJECTED') return new Response(JSON.stringify(errorResponse(`Revaluation already in terminal status: ${rev.status}`, 'INVALID_TRANSITION', 400)), { status: 400, headers })
      const prevStatus = rev.status
      rev.status = 'APPROVED'
      rev.approvedById = 'usr-001'
      rev.approvedAt = new Date().toISOString()
      log('info', 'Inventory revaluation approved', { revaluationNumber: rev.revaluationNumber, was: prevStatus, now: 'APPROVED', valueChange: rev.totalValueChange })
      return new Response(JSON.stringify(successResponse(rev, `Revaluation ${rev.revaluationNumber} approved: ${prevStatus} → APPROVED (value change ₹${rev.totalValueChange})`)), { headers })
    }
    if (path === '/api/inventory-gl-postings' && method === 'GET') {
      const entryTypeFilter = url.searchParams.get('entryType')
      const accountFilter = url.searchParams.get('account')
      const sourceTypeFilter = url.searchParams.get('sourceType')
      let postings = COST_DATA.glPostings
      if (entryTypeFilter) postings = postings.filter(p => p.entryType === entryTypeFilter.toUpperCase())
      if (accountFilter) postings = postings.filter(p => p.inventoryAccount === accountFilter.toUpperCase() || p.offsetAccount === accountFilter.toUpperCase())
      if (sourceTypeFilter) postings = postings.filter(p => p.sourceType === sourceTypeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(postings, `${postings.length} GL postings`)), { headers })
    }
    if (path === '/api/inventory-valuation' && method === 'GET') {
      const abcFilter = url.searchParams.get('abc')
      const movementFilter = url.searchParams.get('movement')
      const ageingFilter = url.searchParams.get('ageing')
      let vals = COST_DATA.valuations
      if (abcFilter) vals = vals.filter(v => v.abcClass === abcFilter.toUpperCase())
      if (movementFilter) vals = vals.filter(v => v.movementCategory === movementFilter.toUpperCase())
      if (ageingFilter) vals = vals.filter(v => v.ageingCategory === ageingFilter)
      return new Response(JSON.stringify(successResponse(vals, `${vals.length} inventory valuation records`)), { headers })
    }
    if (path === '/api/costing/dashboard' && method === 'GET') {
      const totalInventoryValue = COST_DATA.valuations.reduce((s, v) => s + v.totalValue, 0)
      const fifoLayers = COST_DATA.costLayers.filter(l => l.costingMethod === 'FIFO').length
      const avgUnitCost = COST_DATA.valuations.reduce((s, v) => s + v.unitCost, 0) / COST_DATA.valuations.length
      const deadStockValue = COST_DATA.valuations.filter(v => v.movementCategory === 'DEAD_STOCK').reduce((s, v) => s + v.totalValue, 0)
      return new Response(JSON.stringify(successResponse({
        counts: {
          costLayers: COST_DATA.costLayers.length,
          costHistory: COST_DATA.costHistory.length,
          landedCostDocuments: COST_DATA.landedCostDocuments.length,
          revaluations: COST_DATA.revaluations.length,
          glPostings: COST_DATA.glPostings.length,
          valuations: COST_DATA.valuations.length,
        },
        layerStatus: {
          ACTIVE: COST_DATA.costLayers.filter(l => l.status === 'ACTIVE').length,
          PARTIALLY_CONSUMED: COST_DATA.costLayers.filter(l => l.status === 'PARTIALLY_CONSUMED').length,
          FULLY_CONSUMED: COST_DATA.costLayers.filter(l => l.status === 'FULLY_CONSUMED').length,
        },
        costingMethods: {
          FIFO: COST_DATA.costLayers.filter(l => l.costingMethod === 'FIFO').length,
          WEIGHTED_AVERAGE: COST_DATA.costLayers.filter(l => l.costingMethod === 'WEIGHTED_AVERAGE').length,
          MOVING_AVERAGE: COST_DATA.costLayers.filter(l => l.costingMethod === 'MOVING_AVERAGE').length,
          STANDARD: COST_DATA.costLayers.filter(l => l.costingMethod === 'STANDARD').length,
        },
        landedCostStatus: {
          DRAFT: COST_DATA.landedCostDocuments.filter(d => d.status === 'DRAFT').length,
          ALLOCATED: COST_DATA.landedCostDocuments.filter(d => d.status === 'ALLOCATED').length,
          POSTED: COST_DATA.landedCostDocuments.filter(d => d.status === 'POSTED').length,
        },
        revaluationStatus: {
          PENDING_APPROVAL: COST_DATA.revaluations.filter(r => r.status === 'PENDING_APPROVAL').length,
          APPROVED: COST_DATA.revaluations.filter(r => r.status === 'APPROVED').length,
          POSTED: COST_DATA.revaluations.filter(r => r.status === 'POSTED').length,
        },
        glByAccount: {
          RAW_MATERIAL: COST_DATA.glPostings.filter(g => g.inventoryAccount === 'RAW_MATERIAL').length,
          FINISHED_GOODS: COST_DATA.glPostings.filter(g => g.inventoryAccount === 'FINISHED_GOODS').length,
          WIP: COST_DATA.glPostings.filter(g => g.inventoryAccount === 'WIP').length,
          COGS: COST_DATA.glPostings.filter(g => g.inventoryAccount === 'COGS').length,
          GRNI: COST_DATA.glPostings.filter(g => g.inventoryAccount === 'GRNI').length,
        },
        abcClasses: {
          A: COST_DATA.valuations.filter(v => v.abcClass === 'A').length,
          B: COST_DATA.valuations.filter(v => v.abcClass === 'B').length,
          C: COST_DATA.valuations.filter(v => v.abcClass === 'C').length,
        },
        movementCategories: {
          FAST_MOVING: COST_DATA.valuations.filter(v => v.movementCategory === 'FAST_MOVING').length,
          NORMAL: COST_DATA.valuations.filter(v => v.movementCategory === 'NORMAL').length,
          SLOW_MOVING: COST_DATA.valuations.filter(v => v.movementCategory === 'SLOW_MOVING').length,
          DEAD_STOCK: COST_DATA.valuations.filter(v => v.movementCategory === 'DEAD_STOCK').length,
        },
        ageingCategories: {
          '0-30': COST_DATA.valuations.filter(v => v.ageingCategory === '0-30').length,
          '31-60': COST_DATA.valuations.filter(v => v.ageingCategory === '31-60').length,
          '61-90': COST_DATA.valuations.filter(v => v.ageingCategory === '61-90').length,
          '91-180': COST_DATA.valuations.filter(v => v.ageingCategory === '91-180').length,
          '180+': COST_DATA.valuations.filter(v => v.ageingCategory === '180+').length,
        },
        totalInventoryValue,
        totalLandedCostValue: COST_DATA.landedCostDocuments.reduce((s, d) => s + d.totalLandedCost, 0),
        totalRevaluationImpact: COST_DATA.revaluations.reduce((s, r) => s + r.totalValueChange, 0),
        totalGLDebit: COST_DATA.glPostings.filter(g => g.entryType === 'DEBIT').reduce((s, g) => s + g.amount, 0),
        totalGLCredit: COST_DATA.glPostings.filter(g => g.entryType === 'CREDIT').reduce((s, g) => s + g.amount, 0),
        fifoLayers,
        avgUnitCost: parseFloat(avgUnitCost.toFixed(2)),
        deadStockValue,
        landedCostComponents: ['FREIGHT', 'INSURANCE', 'CUSTOM_DUTY', 'LOADING', 'UNLOADING', 'TRANSPORT', 'HANDLING', 'BROKERAGE'],
      }, 'Costing & Valuation dashboard')), { headers })
    }
    if (path === '/api/costing/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Costing & Valuation Engine', version: '20.0.0', sprint: 20,
        sprintName: 'Cost Layers, Landed Cost, Revaluation, GL Integration & Inventory Valuation',
        costingMethods: ['FIFO', 'WEIGHTED_AVERAGE', 'MOVING_AVERAGE', 'STANDARD', 'ACTUAL', 'SPECIFIC_IDENTIFICATION'],
        layerStatuses: ['ACTIVE', 'PARTIALLY_CONSUMED', 'FULLY_CONSUMED', 'EXPIRED', 'CLOSED'],
        receiptTypes: ['PURCHASE', 'PRODUCTION', 'TRANSFER', 'OPENING', 'ADJUSTMENT'],
        changeTypes: ['RECEIPT', 'ISSUE', 'ADJUSTMENT', 'REVALUATION', 'LANDED_COST', 'TRANSFER'],
        referenceTypes: ['PURCHASE_ORDER', 'GRN', 'SHIPMENT', 'CONTAINER'],
        costComponents: ['FREIGHT', 'INSURANCE', 'CUSTOM_DUTY', 'LOADING', 'UNLOADING', 'TRANSPORT', 'HANDLING', 'BROKERAGE'],
        allocationMethods: ['QUANTITY', 'WEIGHT', 'VOLUME', 'VALUE', 'EQUAL'],
        documentStatuses: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ALLOCATED', 'POSTED', 'CANCELLED'],
        revaluationTypes: ['INCREASE', 'DECREASE', 'MARKET_ADJUSTMENT', 'POLICY_CHANGE', 'STANDARD_COST_UPDATE'],
        revaluationStatuses: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'REJECTED', 'CANCELLED'],
        sourceTypes: ['INVENTORY_TRANSACTION', 'REVALUATION', 'LANDED_COST', 'ADJUSTMENT', 'WRITE_OFF'],
        entryTypes: ['DEBIT', 'CREDIT'],
        inventoryAccounts: ['INVENTORY_ASSET', 'RAW_MATERIAL', 'FINISHED_GOODS', 'WIP'],
        offsetAccounts: ['COGS', 'GRNI', 'WIP', 'PURCHASE_VARIANCE', 'SCRAP', 'WRITE_OFF'],
        glStatuses: ['POSTED', 'REVERSED'],
        abcClasses: ['A', 'B', 'C'],
        xyzClasses: ['X', 'Y', 'Z'],
        movementCategories: ['FAST_MOVING', 'SLOW_MOVING', 'DEAD_STOCK', 'NORMAL'],
        ageingCategories: ['0-30', '31-60', '61-90', '91-180', '180+'],
        costingStrategy: 'Raw Materials → FIFO (preserve actual procurement cost). Finished Goods → FIFO (track batch production cost). Trading → Weighted Average (smoothen price volatility). Machinery → Moving Average (recalculate on each receipt).',
        fifoPrinciple: 'First In First Out — oldest cost layer (by receipt_date) consumed first during issue. Older unitCost exits inventory first.',
        landedCostPrinciple: 'Product Cost + Cost Components (FREIGHT, INSURANCE, CUSTOM_DUTY, etc.) allocated to receipt lines via QUANTITY/WEIGHT/VOLUME/VALUE/EQUAL method.',
        revaluationPrinciple: 'Cost adjustments via INCREASE/DECREASE/MARKET_ADJUSTMENT/POLICY_CHANGE/STANDARD_COST_UPDATE — generates GL postings to inventory & offset (revaluation reserve) accounts.',
        abcPrinciple: 'Pareto-based classification — Class A (top 20% items, 80% value) tight control; Class B (next 30% items, 15% value) standard control; Class C (bottom 50% items, 5% value) minimal control.',
        endpoints: ['GET /api/cost-layers', 'GET /api/cost-history', 'GET /api/landed-costs', 'POST /api/landed-costs/:id/allocate', 'GET /api/inventory-revaluations', 'POST /api/inventory-revaluations/:id/approve', 'GET /api/inventory-gl-postings', 'GET /api/inventory-valuation', 'GET /api/costing/dashboard', 'GET /api/costing/info'],
      }, 'SUOP Costing & Valuation Engine v20.0.0')), { headers })
    }

    // ─── Sprint 21: Inventory Analytics & Mission Control Endpoints ───
    if (path === '/api/inventory-analytics/kpis' && method === 'GET') {
      const categoryFilter = url.searchParams.get('category')
      const onTargetFilter = url.searchParams.get('onTarget')
      let kpis = ANALYTICS_DATA.kpis
      if (categoryFilter) kpis = kpis.filter(k => k.category === categoryFilter.toUpperCase())
      if (onTargetFilter === 'true') kpis = kpis.filter(k => k.onTarget)
      if (onTargetFilter === 'false') kpis = kpis.filter(k => !k.onTarget)
      return new Response(JSON.stringify(successResponse(kpis, `${kpis.length} inventory KPIs`)), { headers })
    }
    if (path === '/api/inventory-analytics/ageing' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      let ageing = ANALYTICS_DATA.ageing
      if (warehouseFilter) ageing = ageing.filter(a => a.warehouseId === warehouseFilter || a.warehouseName.toLowerCase().includes(warehouseFilter.toLowerCase()))
      return new Response(JSON.stringify(successResponse(ageing, `${ageing.length} inventory ageing records`)), { headers })
    }
    if (path === '/api/inventory-analytics/classifications' && method === 'GET') {
      const abcFilter = url.searchParams.get('abc')
      const xyzFilter = url.searchParams.get('xyz')
      const fsnFilter = url.searchParams.get('fsn')
      const combinedFilter = url.searchParams.get('combined')
      let cls = ANALYTICS_DATA.classifications
      if (abcFilter) cls = cls.filter(c => c.abcClass === abcFilter.toUpperCase())
      if (xyzFilter) cls = cls.filter(c => c.xyzClass === xyzFilter.toUpperCase())
      if (fsnFilter) cls = cls.filter(c => c.fsnClass === fsnFilter.toUpperCase())
      if (combinedFilter) cls = cls.filter(c => c.combinedClass === combinedFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(cls, `${cls.length} inventory classification records`)), { headers })
    }
    if (path === '/api/inventory-analytics/reorder' && method === 'GET') {
      const urgencyFilter = url.searchParams.get('urgency')
      let rules = ANALYTICS_DATA.reorderRules
      if (urgencyFilter) rules = rules.filter(r => r.urgency === urgencyFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(rules, `${rules.length} reorder rules`)), { headers })
    }
    if (path === '/api/inventory-analytics/mission-control' && method === 'GET') {
      return new Response(JSON.stringify(successResponse(ANALYTICS_DATA.missionControl, 'Mission control snapshot (live)')), { headers })
    }
    if (path === '/api/inventory-analytics/reports' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let reports = ANALYTICS_DATA.reports
      if (typeFilter) reports = reports.filter(r => r.reportType === typeFilter.toUpperCase())
      if (statusFilter) reports = reports.filter(r => r.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(reports, `${reports.length} executive reports`)), { headers })
    }
    if (path.match(/^\/api\/inventory-analytics\/reports\/[^/]+\/generate$/) && method === 'POST') {
      const id = path.split('/')[4]
      const rpt = ANALYTICS_DATA.reports.find(r => r.id === id)
      if (!rpt) return new Response(JSON.stringify(errorResponse('Executive report not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (rpt.status === 'READY') return new Response(JSON.stringify(errorResponse(`Report already READY: ${rpt.title}`, 'INVALID_TRANSITION', 400)), { status: 400, headers })
      const prevStatus = rpt.status
      rpt.status = 'READY'
      rpt.generatedAt = new Date().toISOString()
      rpt.generatedBy = 'CEO Vikram'
      rpt.fileSize = '1.8 MB'
      rpt.pageCount = 24
      rpt.summary = `Generated on-demand from sprint 21 analytics engine. Source: ${rpt.reportType}. Snapshot reconciled to GL.`
      log('info', 'Executive report generated', { reportId: rpt.id, type: rpt.reportType, was: prevStatus, now: 'READY' })
      return new Response(JSON.stringify(successResponse(rpt, `Report ${rpt.title} generated: ${prevStatus} → READY`)), { headers })
    }
    if (path === '/api/inventory-analytics/dashboard' && method === 'GET') {
      const totalInventoryValue = ANALYTICS_DATA.classifications.reduce((s, c) => s + c.totalValue, 0)
      const classAItems = ANALYTICS_DATA.classifications.filter(c => c.abcClass === 'A').length
      const classBItems = ANALYTICS_DATA.classifications.filter(c => c.abcClass === 'B').length
      const classCItems = ANALYTICS_DATA.classifications.filter(c => c.abcClass === 'C').length
      const fastMoving = ANALYTICS_DATA.classifications.filter(c => c.fsnClass === 'FAST').length
      const slowMoving = ANALYTICS_DATA.classifications.filter(c => c.fsnClass === 'SLOW').length
      const nonMoving = ANALYTICS_DATA.classifications.filter(c => c.fsnClass === 'NON_MOVING').length
      const criticalReorders = ANALYTICS_DATA.reorderRules.filter(r => r.urgency === 'CRITICAL').length
      const highReorders = ANALYTICS_DATA.reorderRules.filter(r => r.urgency === 'HIGH').length
      const totalReorderValue = ANALYTICS_DATA.reorderRules.filter(r => r.suggestedReorderQty > 0).reduce((s, r) => s + r.suggestedReorderQty, 0)
      const onTargetKpis = ANALYTICS_DATA.kpis.filter(k => k.onTarget).length
      const avgAgeingDays = ANALYTICS_DATA.ageing.reduce((s, a) => s + a.avgDaysInStock, 0) / ANALYTICS_DATA.ageing.length
      return new Response(JSON.stringify(successResponse({
        counts: {
          kpis: ANALYTICS_DATA.kpis.length,
          ageingRecords: ANALYTICS_DATA.ageing.length,
          classifications: ANALYTICS_DATA.classifications.length,
          reorderRules: ANALYTICS_DATA.reorderRules.length,
          reports: ANALYTICS_DATA.reports.length,
        },
        kpiOnTarget: { onTarget: onTargetKpis, offTarget: ANALYTICS_DATA.kpis.length - onTargetKpis },
        abcBreakdown: { A: classAItems, B: classBItems, C: classCItems },
        fsnBreakdown: { FAST: fastMoving, SLOW: slowMoving, NON_MOVING: nonMoving },
        reorderUrgency: {
          CRITICAL: criticalReorders,
          HIGH: highReorders,
          MEDIUM: ANALYTICS_DATA.reorderRules.filter(r => r.urgency === 'MEDIUM').length,
          LOW: ANALYTICS_DATA.reorderRules.filter(r => r.urgency === 'LOW').length,
          OK: ANALYTICS_DATA.reorderRules.filter(r => r.urgency === 'OK').length,
        },
        reportStatus: {
          READY: ANALYTICS_DATA.reports.filter(r => r.status === 'READY').length,
          PENDING: ANALYTICS_DATA.reports.filter(r => r.status === 'PENDING').length,
          SCHEDULED: ANALYTICS_DATA.reports.filter(r => r.status === 'SCHEDULED').length,
        },
        totalInventoryValue,
        totalReorderValue,
        avgAgeingDays: parseFloat(avgAgeingDays.toFixed(1)),
        deadStockValue: ANALYTICS_DATA.classifications.filter(c => c.fsnClass === 'NON_MOVING').reduce((s, c) => s + c.totalValue, 0),
        missionControlHeadline: ANALYTICS_DATA.missionControl.headline,
        snapshotDate: ANALYTICS_DATA.missionControl.snapshotDate,
        part3Complete: true,
        sprint: 21,
        analyticsCategories: ['EFFICIENCY', 'QUALITY', 'SERVICE', 'CAPACITY'],
        urgencyLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OK'],
        reportTypes: ['INVENTORY_VALUATION', 'ABC_REPORT', 'DEAD_STOCK', 'NEAR_EXPIRY'],
        abcPrinciple: 'Pareto principle — Class A: top 20% items contribute 80% value (tight control). Class B: next 30% items, 15% value (standard control). Class C: bottom 50% items, 5% value (minimal control).',
        xyzPrinciple: 'XYZ classification by demand variability (coefficient of variation). X: stable demand (CV<0.25). Y: variable demand (CV 0.25-0.5). Z: irregular demand (CV>0.5).',
        fsnPrinciple: 'FSN classification by movement velocity. FAST: moved in last 30 days. SLOW: moved in 30-180 days. NON_MOVING: no movement in 180+ days (dead stock candidate).',
        reorderPrinciple: 'Reorder point = Safety Stock + (Avg Daily Consumption × Lead Time). When on-hand ≤ reorder point, trigger replenishment. Urgency escalates as days of supply drop.',
      }, 'Inventory analytics dashboard')), { headers })
    }
    if (path === '/api/inventory-analytics/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Inventory Analytics & Mission Control Engine', version: '21.0.0', sprint: 21,
        sprintName: 'Inventory Analytics, AI Insights & Mission Control — PART 3 COMPLETE',
        kpiCategories: ['EFFICIENCY', 'QUALITY', 'SERVICE', 'CAPACITY'],
        trendDirections: ['up', 'down', 'stable'],
        abcClasses: ['A', 'B', 'C'],
        xyzClasses: ['X', 'Y', 'Z'],
        fsnClasses: ['FAST', 'SLOW', 'NON_MOVING'],
        combinedClasses: ['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ'],
        ageingBuckets: ['0-30', '31-60', '61-90', '91-180', '181-365', '365+'],
        urgencyLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OK'],
        reportTypes: ['INVENTORY_VALUATION', 'ABC_REPORT', 'DEAD_STOCK', 'NEAR_EXPIRY'],
        reportStatuses: ['SCHEDULED', 'PENDING', 'GENERATING', 'READY', 'FAILED', 'ARCHIVED'],
        reportFormats: ['PDF', 'XLSX', 'CSV', 'JSON'],
        missionControlPrinciple: 'Single-pane-of-glass command center aggregating KPIs, alerts, operations, recalls, and reorder signals into a real-time snapshot for executive decision-making.',
        kpiPrinciple: 'Each KPI has value, target, targetMin, targetMax, trend, trendPercent, onTarget flag. Trend direction (up/down/stable) + percent change shows week-over-week momentum.',
        ageingPrinciple: 'Stock bucketed into 6 age ranges (0-30, 31-60, 61-90, 91-180, 181-365, 365+ days) with qty, value, and % distribution. Drives dead-stock identification.',
        endpoints: ['GET /api/inventory-analytics/kpis', 'GET /api/inventory-analytics/ageing', 'GET /api/inventory-analytics/classifications', 'GET /api/inventory-analytics/reorder', 'GET /api/inventory-analytics/mission-control', 'GET /api/inventory-analytics/reports', 'POST /api/inventory-analytics/reports/:id/generate', 'GET /api/inventory-analytics/dashboard', 'GET /api/inventory-analytics/info'],
        part3Complete: true,
        part3Sprints: 21,
        part3Tables: 185,
      }, 'SUOP Inventory Analytics & Mission Control Engine v21.0.0')), { headers })
    }

    // ─── Sprint 22: Warehouse Foundation Endpoints (PART 4 BEGINS) ───
    if (path === '/api/warehouses' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let warehouses = WH_DATA.warehouses
      if (typeFilter) warehouses = warehouses.filter(w => w.warehouseType === typeFilter.toUpperCase())
      if (statusFilter) warehouses = warehouses.filter(w => w.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(warehouses, `${warehouses.length} warehouses`)), { headers })
    }
    if (path === '/api/warehouses' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.warehouseCode || !body.warehouseName || !body.warehouseType) {
          return new Response(JSON.stringify(errorResponse('warehouseCode, warehouseName and warehouseType are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        const newWh = {
          id: `wh-${Date.now()}`,
          warehouseCode: body.warehouseCode,
          warehouseName: body.warehouseName,
          description: body.description || null,
          warehouseType: body.warehouseType,
          companyId: body.companyId || null,
          companyName: body.companyName || null,
          branchId: body.branchId || null,
          branchName: body.branchName || null,
          managerId: body.managerId || null,
          managerName: body.managerName || null,
          addressLine1: body.addressLine1 || null,
          addressLine2: body.addressLine2 || null,
          city: body.city || null,
          state: body.state || null,
          country: body.country || 'India',
          pincode: body.pincode || null,
          phone: body.phone || null,
          email: body.email || null,
          timezone: body.timezone || 'Asia/Kolkata',
          barcodeEnabled: body.barcodeEnabled ?? true,
          fifoEnabled: body.fifoEnabled ?? false,
          fefoEnabled: body.fefoEnabled ?? true,
          qualityInspectionRequired: body.qualityInspectionRequired ?? true,
          defaultPickingStrategy: body.defaultPickingStrategy || 'FEFO',
          defaultPutawayStrategy: body.defaultPutawayStrategy || 'FEFO',
          defaultUom: body.defaultUom || null,
          totalVolumeM3: body.totalVolumeM3 || 0,
          totalWeightKg: body.totalWeightKg || 0,
          totalPalletPositions: body.totalPalletPositions || 0,
          totalBins: body.totalBins || 0,
          operatingHoursStart: body.operatingHoursStart || '08:00',
          operatingHoursEnd: body.operatingHoursEnd || '20:00',
          workingDays: body.workingDays || 'MON,TUE,WED,THU,FRI,SAT',
          status: body.status || 'ACTIVE',
          statusReason: body.statusReason || null,
          createdAt: new Date().toISOString(),
        } as typeof WH_DATA.warehouses[number]
        WH_DATA.warehouses.push(newWh)
        log('info', 'Warehouse created', { code: newWh.warehouseCode, type: newWh.warehouseType })
        return new Response(JSON.stringify(successResponse(newWh, `Warehouse ${newWh.warehouseCode} created`)), { headers })
      } catch (error) {
        return new Response(JSON.stringify(errorResponse('Failed to create warehouse')), { status: 500, headers })
      }
    }
    if (path.match(/^\/api\/warehouses\/[^/]+$/) && method === 'GET') {
      const id = path.split('/').pop()!
      const wh = WH_DATA.warehouses.find(w => w.id === id || w.warehouseCode === id)
      if (!wh) return new Response(JSON.stringify(errorResponse('Warehouse not found', 'NOT_FOUND', 404)), { status: 404, headers })
      const zones = WH_DATA.zones.filter(z => z.warehouseId === wh.id)
      const tempZones = WH_DATA.temperatureZones.filter(t => t.warehouseId === wh.id)
      const cap = WH_DATA.capacity.find(c => c.warehouseId === wh.id)
      const rules = WH_DATA.rules.filter(r => r.warehouseId === wh.id)
      const accessRules = WH_DATA.accessRules.filter(a => a.warehouseId === wh.id)
      const calendar = WH_DATA.calendar.filter(c => c.warehouseId === wh.id)
      return new Response(JSON.stringify(successResponse({ ...wh, zones, temperatureZones: tempZones, capacity: cap, rules, accessRules, calendar }, 'Warehouse detail')), { headers })
    }
    if (path === '/api/warehouse-zones' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const typeFilter = url.searchParams.get('type')
      let zones = WH_DATA.zones
      if (warehouseFilter) zones = zones.filter(z => z.warehouseId === warehouseFilter || z.warehouseCode === warehouseFilter.toUpperCase())
      if (typeFilter) zones = zones.filter(z => z.zoneType === typeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(zones, `${zones.length} warehouse zones`)), { headers })
    }
    if (path === '/api/temperature-zones' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      let zones = WH_DATA.temperatureZones
      if (typeFilter) zones = zones.filter(z => z.tempZoneType === typeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(zones, `${zones.length} temperature zones`)), { headers })
    }
    if (path === '/api/temperature-logs' && method === 'GET') {
      const zoneFilter = url.searchParams.get('zone')
      const alertFilter = url.searchParams.get('alert')
      let logs = WH_DATA.temperatureLogs
      if (zoneFilter) logs = logs.filter(l => l.temperatureZoneId === zoneFilter)
      if (alertFilter === 'true') logs = logs.filter(l => l.isAlert)
      if (alertFilter === 'false') logs = logs.filter(l => !l.isAlert)
      return new Response(JSON.stringify(successResponse(logs, `${logs.length} temperature logs`)), { headers })
    }
    if (path === '/api/warehouse-capacity' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      let caps = WH_DATA.capacity
      if (warehouseFilter) caps = caps.filter(c => c.warehouseId === warehouseFilter || c.warehouseCode === warehouseFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(caps, `${caps.length} warehouse capacity records`)), { headers })
    }
    if (path === '/api/warehouse-calendar' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const dayTypeFilter = url.searchParams.get('dayType')
      let cal = WH_DATA.calendar
      if (warehouseFilter) cal = cal.filter(c => c.warehouseId === warehouseFilter || c.warehouseCode === warehouseFilter.toUpperCase())
      if (dayTypeFilter) cal = cal.filter(c => c.dayType === dayTypeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(cal, `${cal.length} warehouse calendar entries`)), { headers })
    }
    if (path === '/api/warehouse-access-rules' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const roleFilter = url.searchParams.get('role')
      let rules = WH_DATA.accessRules
      if (warehouseFilter) rules = rules.filter(r => r.warehouseId === warehouseFilter || r.warehouseCode === warehouseFilter.toUpperCase())
      if (roleFilter) rules = rules.filter(r => r.userRole === roleFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(rules, `${rules.length} warehouse access rules`)), { headers })
    }
    if (path === '/api/warehouse-rules' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const typeFilter = url.searchParams.get('type')
      let rules = WH_DATA.rules
      if (warehouseFilter) rules = rules.filter(r => r.warehouseId === warehouseFilter || r.warehouseCode === warehouseFilter.toUpperCase())
      if (typeFilter) rules = rules.filter(r => r.ruleType === typeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(rules, `${rules.length} warehouse rules`)), { headers })
    }
    if (path === '/api/warehouses/dashboard' && method === 'GET') {
      const totalWarehouses = WH_DATA.warehouses.length
      const activeWarehouses = WH_DATA.warehouses.filter(w => w.status === 'ACTIVE').length
      const maintenanceWarehouses = WH_DATA.warehouses.filter(w => w.status === 'MAINTENANCE').length
      const totalZones = WH_DATA.zones.length
      const restrictedZones = WH_DATA.zones.filter(z => z.isRestricted).length
      const temperatureZones = WH_DATA.temperatureZones.length
      const activeAlerts = WH_DATA.temperatureLogs.filter(l => l.isAlert).length
      const capacityRecords = WH_DATA.capacity.length
      const avgUtilization = WH_DATA.capacity.reduce((s, c) => s + c.utilizationPercent, 0) / WH_DATA.capacity.length
      const coldStorageUnits = WH_DATA.temperatureZones.filter(t => t.tempZoneType === 'CHILLED' || t.tempZoneType === 'FROZEN').length
      const accessRulesCount = WH_DATA.accessRules.length
      const operatingRulesCount = WH_DATA.rules.length
      const calendarEntries = WH_DATA.calendar.length
      const byType = WH_DATA.warehouses.reduce((acc, w) => { acc[w.warehouseType] = (acc[w.warehouseType] || 0) + 1; return acc }, {} as Record<string, number>)
      const byCity = WH_DATA.warehouses.reduce((acc, w) => { acc[w.city || 'Unknown'] = (acc[w.city || 'Unknown'] || 0) + 1; return acc }, {} as Record<string, number>)
      return new Response(JSON.stringify(successResponse({
        counts: {
          warehouses: totalWarehouses,
          activeWarehouses,
          maintenanceWarehouses,
          zones: totalZones,
          restrictedZones,
          temperatureZones,
          capacityRecords,
          accessRules: accessRulesCount,
          operatingRules: operatingRulesCount,
          calendarEntries,
        },
        activeAlerts,
        avgUtilization: parseFloat(avgUtilization.toFixed(2)),
        coldStorageUnits,
        warehousesByType: byType,
        warehousesByCity: byCity,
        recommendedArchitecture: '6-warehouse multi-tier Mumbai model: Raw Material, Packaging, Finished Goods, Quarantine (Plant) + Returns, Scrap (DC).',
        hierarchyLevels: ['Company', 'Branch', 'Warehouse', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Bin'],
        warehouseTypes: ['RAW_MATERIAL', 'FINISHED_GOODS', 'PACKAGING', 'COLD_STORAGE', 'DEEP_FREEZE', 'RETURNS', 'TRANSIT', 'QUARANTINE', 'SCRAP', 'DISTRIBUTION_CENTER', 'DARK_STORE'],
        zoneTypes: ['RECEIVING', 'PUTAWAY', 'STORAGE', 'PICKING', 'PACKING', 'DISPATCH', 'RETURNS', 'QUARANTINE', 'QUALITY_INSPECTION', 'DAMAGED_GOODS'],
        tempZoneTypes: ['AMBIENT', 'CHILLED', 'FROZEN', 'DEEP_FREEZE', 'HUMIDITY_CONTROLLED'],
        enforcementModes: ['BLOCK', 'WARN', 'LOG'],
        part4Begun: true,
        sprint: 22,
        chiefArchitectNote: 'Six warehouses cover the full physical lifecycle of stock: inbound (Raw Material + Quarantine), production support (Packaging), outbound (Finished Goods), reverse logistics (Returns), and disposal (Scrap). Each is a dedicated facility with its own manager, zones, capacity, and access rules.',
      }, 'Warehouse foundation dashboard')), { headers })
    }
    if (path === '/api/warehouses/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Warehouse Foundation Engine', version: '22.0.0', sprint: 22,
        sprintName: 'Warehouse Foundation — PART 4 BEGINS',
        warehouseTypes: ['RAW_MATERIAL', 'FINISHED_GOODS', 'PACKAGING', 'COLD_STORAGE', 'DEEP_FREEZE', 'RETURNS', 'TRANSIT', 'QUARANTINE', 'SCRAP', 'DISTRIBUTION_CENTER', 'DARK_STORE'],
        zoneTypes: ['RECEIVING', 'PUTAWAY', 'STORAGE', 'PICKING', 'PACKING', 'DISPATCH', 'RETURNS', 'QUARANTINE', 'QUALITY_INSPECTION', 'DAMAGED_GOODS'],
        tempZoneTypes: ['AMBIENT', 'CHILLED', 'FROZEN', 'DEEP_FREEZE', 'HUMIDITY_CONTROLLED'],
        alertTypes: ['HIGH_TEMP', 'LOW_TEMP', 'HIGH_HUMIDITY', 'LOW_HUMIDITY'],
        dayTypes: ['WORKING_DAY', 'HOLIDAY', 'MAINTENANCE', 'SPECIAL'],
        userRoles: ['WAREHOUSE_MANAGER', 'SUPERVISOR', 'OPERATOR', 'FORKLIFT_OPERATOR', 'QUALITY_INSPECTOR', 'VISITOR'],
        ruleTypes: ['MAX_BIN_WEIGHT', 'MAX_STACK_HEIGHT', 'HAZARDOUS_MATERIAL', 'FOOD_SAFETY', 'FIFO_ENABLED', 'FEFO_ENABLED', 'BARCODE_MANDATORY', 'QUALITY_INSPECTION_REQUIRED', 'MAX_PICK_TIME', 'PUTAWAY_RULE'],
        ruleUnits: ['KG', 'M', 'HOURS', 'BOOLEAN', 'PERCENT'],
        enforcementModes: ['BLOCK', 'WARN', 'LOG'],
        warehouseStatuses: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED'],
        hierarchyPrinciple: 'Company → Branch → Warehouse → Zone → Aisle → Rack → Shelf → Bin. Each level narrows physical location; bin is the smallest addressable storage unit.',
        capacityPrinciple: 'Three independent capacity dimensions: Volume (m³), Weight (kg), Pallet positions / Bins. Reserved capacity is held for inbound expected stock; available = total − used − reserved.',
        temperaturePrinciple: 'Each temperature zone has min/max/target temp + humidity range. Sensors log readings; values outside (min − alertThresholdMin) or (max + alertThresholdMax) trigger alerts.',
        accessRulePrinciple: 'Role-based access per warehouse — WAREHOUSE_MANAGER (full access), OPERATOR (receive/putaway/pick only, no restricted zones), QUALITY_INSPECTOR (adjust/count + restricted access).',
        ruleEnforcementPrinciple: 'BLOCK — operation rejected at the source. WARN — operation allowed but logged with a warning. LOG — silent audit log entry for analytics.',
        fefoPrinciple: 'First-Expired-First-Out: batches picked in order of expiry date (earliest first). Critical for food & pharma. Combined with barcode scan to enforce at the bin level.',
        endpoints: ['GET /api/warehouses', 'POST /api/warehouses', 'GET /api/warehouses/:id', 'GET /api/warehouse-zones', 'GET /api/temperature-zones', 'GET /api/temperature-logs', 'GET /api/warehouse-capacity', 'GET /api/warehouse-calendar', 'GET /api/warehouse-access-rules', 'GET /api/warehouse-rules', 'GET /api/warehouses/dashboard', 'GET /api/warehouses/info'],
        part4Begun: true,
        part4Sprints: 12,
        part4Tables: 8,
      }, 'SUOP Warehouse Foundation Engine v22.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 23 — WAREHOUSE LOCATION & BIN MANAGEMENT ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Aisles ────────────────────────────────────────────
    // GET /api/warehouse-aisles (with warehouse/zone filters)
    if (path === '/api/warehouse-aisles' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const zoneFilter = url.searchParams.get('zone')
      let aisles = LOC_DATA.aisles
      if (warehouseFilter) aisles = aisles.filter(a => a.warehouseId === warehouseFilter || a.warehouseCode === warehouseFilter.toUpperCase())
      if (zoneFilter) aisles = aisles.filter(a => a.zoneId === zoneFilter || a.zoneCode === zoneFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(aisles, `${aisles.length} warehouse aisles`)), { headers })
    }

    // ─── Racks ─────────────────────────────────────────────
    // GET /api/warehouse-racks (with warehouse/aisle filters)
    if (path === '/api/warehouse-racks' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const aisleFilter = url.searchParams.get('aisle')
      let racks = LOC_DATA.racks
      if (warehouseFilter) racks = racks.filter(r => r.warehouseId === warehouseFilter || r.warehouseCode === warehouseFilter.toUpperCase())
      if (aisleFilter) racks = racks.filter(r => r.aisleId === aisleFilter || r.aisleCode === aisleFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(racks, `${racks.length} warehouse racks`)), { headers })
    }

    // ─── Shelves ───────────────────────────────────────────
    // GET /api/warehouse-shelves (with warehouse/rack filters)
    if (path === '/api/warehouse-shelves' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const rackFilter = url.searchParams.get('rack')
      let shelves = LOC_DATA.shelves
      if (warehouseFilter) shelves = shelves.filter(s => s.warehouseId === warehouseFilter || s.warehouseCode === warehouseFilter.toUpperCase())
      if (rackFilter) shelves = shelves.filter(s => s.rackId === rackFilter || s.rackCode === rackFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(shelves, `${shelves.length} warehouse shelves`)), { headers })
    }

    // ─── Bins ──────────────────────────────────────────────
    // GET /api/warehouse-bins (with warehouse/zone/status/type/temp filters + empty bin search)
    if (path === '/api/warehouse-bins' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const zoneFilter = url.searchParams.get('zone')
      const statusFilter = url.searchParams.get('status')
      const typeFilter = url.searchParams.get('type')
      const tempFilter = url.searchParams.get('temp')
      const emptyFlag = url.searchParams.get('empty')
      const barcodeLookup = url.searchParams.get('barcode')
      let bins = LOC_DATA.bins
      if (warehouseFilter) bins = bins.filter(b => b.warehouseId === warehouseFilter || b.warehouseCode === warehouseFilter.toUpperCase())
      if (zoneFilter) bins = bins.filter(b => b.zoneId === zoneFilter || b.zoneCode === zoneFilter.toUpperCase())
      if (statusFilter) bins = bins.filter(b => b.status === statusFilter.toUpperCase())
      if (typeFilter) bins = bins.filter(b => b.binType === typeFilter.toUpperCase())
      if (tempFilter) bins = bins.filter(b => b.temperatureZone === tempFilter.toUpperCase())
      if (emptyFlag === 'true') bins = bins.filter(b => b.currentWeightKg === 0 && b.currentVolumeM3 === 0 && b.status === 'AVAILABLE')
      if (barcodeLookup) {
        const found = LOC_DATA.bins.find(b => b.barcode === barcodeLookup || b.qrCode === barcodeLookup)
        return new Response(JSON.stringify(successResponse(found ? [found] : [], found ? 'Bin found by barcode' : 'No bin matches barcode')), { headers })
      }
      return new Response(JSON.stringify(successResponse(bins, `${bins.length} warehouse bins`)), { headers })
    }
    // POST /api/warehouse-bins
    if (path === '/api/warehouse-bins' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.binCode || !body.warehouseId) {
          return new Response(JSON.stringify(errorResponse('binCode and warehouseId are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        const bin = {
          id: crypto.randomUUID(),
          warehouseId: body.warehouseId,
          warehouseCode: body.warehouseCode || '',
          warehouseName: body.warehouseName || '',
          zoneId: body.zoneId || null,
          zoneCode: body.zoneCode || null,
          zoneName: body.zoneName || null,
          aisleId: body.aisleId || null,
          aisleCode: body.aisleCode || null,
          aisleName: body.aisleName || null,
          rackId: body.rackId || null,
          rackCode: body.rackCode || null,
          rackName: body.rackName || null,
          shelfId: body.shelfId || null,
          shelfCode: body.shelfCode || null,
          shelfName: body.shelfName || null,
          binCode: body.binCode,
          barcode: body.barcode || `BC-${body.binCode.replace(/-/g, '')}`,
          qrCode: body.qrCode || `QR-${body.binCode}`,
          maxWeightKg: body.maxWeightKg || 500.00,
          maxVolumeM3: body.maxVolumeM3 || 1.50,
          currentWeightKg: 0.00,
          currentVolumeM3: 0.00,
          utilizationPercent: 0.00,
          temperatureZone: body.temperatureZone || 'AMBIENT',
          binType: body.binType || 'STANDARD',
          status: body.status || 'AVAILABLE',
          statusReason: body.statusReason || null,
          itemCapacity: body.itemCapacity || 1,
          currentItemTypes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        LOC_DATA.bins.push(bin)
        log('info', 'Warehouse bin created', { binCode: bin.binCode, warehouseId: bin.warehouseId })
        return new Response(JSON.stringify(successResponse(bin, 'Warehouse bin created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }
    // GET /api/warehouse-bins/:id (or ?barcode=xxx for barcode lookup)
    if (path.startsWith('/api/warehouse-bins/') && method === 'GET') {
      const idOrBarcode = path.replace('/api/warehouse-bins/', '')
      const barcodeFromQuery = url.searchParams.get('barcode')
      let bin = LOC_DATA.bins.find(b => b.id === idOrBarcode)
      if (!bin && barcodeFromQuery) bin = LOC_DATA.bins.find(b => b.barcode === barcodeFromQuery || b.qrCode === barcodeFromQuery)
      if (!bin && idOrBarcode) bin = LOC_DATA.bins.find(b => b.barcode === idOrBarcode || b.qrCode === idOrBarcode || b.binCode === idOrBarcode)
      if (!bin) return new Response(JSON.stringify(errorResponse('Bin not found', 'NOT_FOUND', 404)), { status: 404, headers })
      return new Response(JSON.stringify(successResponse(bin, 'Warehouse bin')), { headers })
    }

    // ─── Bin Capacity Logs ─────────────────────────────────
    // GET /api/bin-capacity-logs
    if (path === '/api/bin-capacity-logs' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const alertFilter = url.searchParams.get('alert')
      const binFilter = url.searchParams.get('bin')
      let logs = LOC_DATA.capacityLogs
      if (warehouseFilter) logs = logs.filter(l => l.warehouseId === warehouseFilter)
      if (alertFilter) logs = logs.filter(l => l.alertType === alertFilter.toUpperCase())
      if (binFilter) logs = logs.filter(l => l.binId === binFilter || l.binCode === binFilter)
      return new Response(JSON.stringify(successResponse(logs, `${logs.length} bin capacity logs`)), { headers })
    }

    // ─── Warehouse Locations Dashboard ─────────────────────
    // GET /api/warehouse-locations/dashboard (summary stats)
    if (path === '/api/warehouse-locations/dashboard' && method === 'GET') {
      const totalBins = LOC_DATA.bins.length
      const availableBins = LOC_DATA.bins.filter(b => b.status === 'AVAILABLE').length
      const occupiedBins = LOC_DATA.bins.filter(b => b.status === 'OCCUPIED').length
      const reservedBins = LOC_DATA.bins.filter(b => b.status === 'RESERVED').length
      const blockedBins = LOC_DATA.bins.filter(b => b.status === 'BLOCKED').length
      const maintenanceBins = LOC_DATA.bins.filter(b => b.status === 'MAINTENANCE').length
      const totalAisles = LOC_DATA.aisles.length
      const totalRacks = LOC_DATA.racks.length
      const totalShelves = LOC_DATA.shelves.length
      const totalCapacityLogs = LOC_DATA.capacityLogs.length
      const overloadedAlerts = LOC_DATA.capacityLogs.filter(l => l.alertType === 'OVERLOADED').length
      const fullAlerts = LOC_DATA.capacityLogs.filter(l => l.alertType === 'FULL').length
      const nearFullAlerts = LOC_DATA.capacityLogs.filter(l => l.alertType === 'NEAR_FULL').length
      const underutilizedAlerts = LOC_DATA.capacityLogs.filter(l => l.alertType === 'UNDERUTILIZED').length
      const avgUtilization = LOC_DATA.bins.reduce((s, b) => s + b.utilizationPercent, 0) / LOC_DATA.bins.length
      const emptyBins = LOC_DATA.bins.filter(b => b.currentWeightKg === 0 && b.currentVolumeM3 === 0 && b.status === 'AVAILABLE').length
      const byBinType = LOC_DATA.bins.reduce((acc, b) => { acc[b.binType] = (acc[b.binType] || 0) + 1; return acc }, {} as Record<string, number>)
      const byTempZone = LOC_DATA.bins.reduce((acc, b) => { const z = b.temperatureZone || 'AMBIENT'; acc[z] = (acc[z] || 0) + 1; return acc }, {} as Record<string, number>)
      const byWarehouse = LOC_DATA.bins.reduce((acc, b) => { acc[b.warehouseCode] = (acc[b.warehouseCode] || 0) + 1; return acc }, {} as Record<string, number>)
      const byTrafficDirection = LOC_DATA.aisles.reduce((acc, a) => { acc[a.trafficDirection] = (acc[a.trafficDirection] || 0) + 1; return acc }, {} as Record<string, number>)
      return new Response(JSON.stringify(successResponse({
        counts: {
          aisles: totalAisles,
          racks: totalRacks,
          shelves: totalShelves,
          bins: totalBins,
          availableBins,
          occupiedBins,
          reservedBins,
          blockedBins,
          maintenanceBins,
          capacityLogs: totalCapacityLogs,
        },
        avgUtilization: parseFloat(avgUtilization.toFixed(2)),
        emptyBins,
        activeAlerts: totalCapacityLogs,
        alertsBreakdown: { FULL: fullAlerts, OVERLOADED: overloadedAlerts, NEAR_FULL: nearFullAlerts, UNDERUTILIZED: underutilizedAlerts },
        binsByType: byBinType,
        binsByTempZone: byTempZone,
        binsByWarehouse: byWarehouse,
        aislesByTrafficDirection: byTrafficDirection,
        hierarchyLevels: ['Warehouse', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Bin', 'Inventory'],
        binNamingConvention: 'Aisle-AisleCode-RackCode-ShelfCode-BinSeq (e.g., A-05-03-12)',
        scannerFirstWorkflow: 'Scan barcode/QR at bin → lookup hierarchy → confirm putaway/pick. Manual entry triggers WARN.',
        trafficDirections: ['ONE_WAY', 'TWO_WAY', 'FORKLIFT_ONLY', 'WALKING_ONLY'],
        pickingLevels: ['GROUND', 'MID', 'HIGH', 'TOP'],
        accessibilityRatings: ['EASY', 'MODERATE', 'DIFFICULT', 'LADDER_REQUIRED'],
        binTypes: ['STANDARD', 'BULK', 'PICK_FACE', 'CROSS_DOCK', 'QUARANTINE'],
        binStatuses: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BLOCKED', 'MAINTENANCE', 'CLEANING', 'DISABLED'],
        alertTypes: ['FULL', 'OVERLOADED', 'UNDERUTILIZED', 'NEAR_FULL'],
        temperatureZones: ['AMBIENT', 'CHILLED', 'FROZEN', 'DEEP_FREEZE', 'HUMIDITY_CONTROLLED'],
        part4Begun: true,
        sprint: 23,
        chiefArchitectNote: 'The Bin is the smallest addressable storage unit. Every putaway, pick, count, and transfer resolves to a specific bin via barcode/QR scan. This 6-level hierarchy (Warehouse→Zone→Aisle→Rack→Shelf→Bin) is the digital map of the warehouse — physical operations cannot be executed without it.',
      }, 'Warehouse Location & Bin Management dashboard')), { headers })
    }

    // ─── Warehouse Locations Info ──────────────────────────
    // GET /api/warehouse-locations/info
    if (path === '/api/warehouse-locations/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Warehouse Location & Bin Management Engine', version: '23.0.0', sprint: 23,
        sprintName: 'Warehouse Location & Bin Management',
        trafficDirections: ['ONE_WAY', 'TWO_WAY', 'FORKLIFT_ONLY', 'WALKING_ONLY'],
        pickingLevels: ['GROUND', 'MID', 'HIGH', 'TOP'],
        accessibilityRatings: ['EASY', 'MODERATE', 'DIFFICULT', 'LADDER_REQUIRED'],
        binTypes: ['STANDARD', 'BULK', 'PICK_FACE', 'CROSS_DOCK', 'QUARANTINE'],
        binStatuses: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BLOCKED', 'MAINTENANCE', 'CLEANING', 'DISABLED'],
        alertTypes: ['FULL', 'OVERLOADED', 'UNDERUTILIZED', 'NEAR_FULL'],
        temperatureZones: ['AMBIENT', 'CHILLED', 'FROZEN', 'DEEP_FREEZE', 'HUMIDITY_CONTROLLED'],
        hierarchyPrinciple: 'Warehouse → Zone → Aisle → Rack → Shelf → Bin. Each level narrows the physical location; the Bin is the smallest addressable storage unit where stock lives. Inventory is stored at the Bin level — every transaction references a specific bin.',
        binCodePrinciple: 'Format: <AisleCode>-<RackSeq>-<ShelfSeq>-<BinSeq> (e.g., A-05-03-12 = Aisle A, Rack 05, Shelf 03, Bin 12). Human-readable, sortable, and parseable for slotting analytics.',
        scannerFirstPrinciple: 'Every receive/putaway/pick/dispatch starts with a barcode or QR scan of the bin label. The system resolves the hierarchy, validates the operation against rules (MAX_BIN_WEIGHT, FEFO, BARCODE_MANDATORY), and confirms or blocks. Manual entry triggers a WARN.',
        capacityPrinciple: 'Each bin tracks max weight (kg), max volume (m³), current weight, current volume, and utilization %. Capacity logs are snapshot-driven — periodic snapshots capture utilization and raise alerts: FULL (100%), OVERLOADED (>100%), NEAR_FULL (90-99%), UNDERUTILIZED (<40% for 7+ days).',
        slottingPrinciple: 'Pick-face bins (GROUND level, EASY accessibility) are reserved for fast-moving (FSN=FAST) SKUs. Mid-level bins for medium movers. High/reserve bins for SLOW/NON_MOVING stock. Re-slotting is recommended when UNDERUTILIZED or OVERLOADED alerts fire.',
        aisleTrafficPrinciple: 'ONE_WAY aisles maximize pick velocity (single direction, no oncoming traffic). TWO_WAY aisles allow bidirectional traffic for balanced throughput. FORKLIFT_ONLY aisles restrict to forklifts (narrow doors, cold storage, heavy pallets). WALKING_ONLY aisles are picker-foot-traffic only.',
        endpoints: ['GET /api/warehouse-aisles', 'GET /api/warehouse-racks', 'GET /api/warehouse-shelves', 'GET /api/warehouse-bins', 'POST /api/warehouse-bins', 'GET /api/warehouse-bins/:id', 'GET /api/bin-capacity-logs', 'GET /api/warehouse-locations/dashboard', 'GET /api/warehouse-locations/info'],
        part4Begun: true,
        part4Sprint: 2,
        part4Sprints: 12,
        part4Tables: 13,
      }, 'SUOP Warehouse Location & Bin Management Engine v23.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 24 — RECEIVING OPERATIONS, DOCK MANAGEMENT & ASN ENGINE ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Advanced Shipping Notices (ASNs) ──────────────────
    // GET /api/asn (with type/status/supplier filters)
    if (path === '/api/asn' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const supplierFilter = url.searchParams.get('supplier')
      let asns = RECV_DATA.asns
      if (typeFilter) asns = asns.filter(a => a.receivingType === typeFilter.toUpperCase())
      if (statusFilter) asns = asns.filter(a => a.status === statusFilter.toUpperCase())
      if (supplierFilter) asns = asns.filter(a => a.supplierId === supplierFilter || (a.supplierName && a.supplierName.toLowerCase().includes(supplierFilter.toLowerCase())))
      return new Response(JSON.stringify(successResponse(asns, `${asns.length} advanced shipping notices`)), { headers })
    }
    // POST /api/asn
    if (path === '/api/asn' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.asnNumber || !body.receivingType) {
          return new Response(JSON.stringify(errorResponse('asnNumber and receivingType are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        const asn = {
          id: crypto.randomUUID(),
          asnNumber: body.asnNumber,
          asnDate: body.asnDate || new Date().toISOString(),
          expectedArrival: body.expectedArrival || new Date().toISOString(),
          receivingType: body.receivingType,
          supplierId: body.supplierId || null,
          supplierName: body.supplierName || null,
          referenceType: body.referenceType || null,
          referenceNumber: body.referenceNumber || null,
          vehicleNumber: body.vehicleNumber || null,
          driverName: body.driverName || null,
          driverPhone: body.driverPhone || null,
          carrierName: body.carrierName || null,
          warehouseId: body.warehouseId || null,
          warehouseName: body.warehouseName || null,
          status: body.status || 'DRAFT',
          totalLines: body.lines?.length || 0,
          totalPallets: body.totalPallets || null,
          totalCartons: body.totalCartons || null,
          totalQuantity: body.totalQuantity || 0,
          totalWeight: body.totalWeight || null,
          totalVolume: body.totalVolume || null,
          appointmentId: body.appointmentId || null,
          createdById: body.createdById || null,
          createdByName: body.createdByName || null,
          confirmedAt: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lines: body.lines || [],
        }
        RECV_DATA.asns.push(asn)
        log('info', 'ASN created', { asnNumber: asn.asnNumber, type: asn.receivingType })
        return new Response(JSON.stringify(successResponse(asn, 'ASN created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }
    // POST /api/asn/:id/confirm
    if (path.startsWith('/api/asn/') && path.endsWith('/confirm') && method === 'POST') {
      const id = path.replace('/api/asn/', '').replace('/confirm', '')
      const asn = RECV_DATA.asns.find(a => a.id === id)
      if (!asn) return new Response(JSON.stringify(errorResponse('ASN not found', 'NOT_FOUND', 404)), { status: 404, headers })
      asn.status = 'CONFIRMED'
      asn.confirmedAt = new Date().toISOString()
      asn.updatedAt = new Date().toISOString()
      log('info', 'ASN confirmed', { asnNumber: asn.asnNumber })
      return new Response(JSON.stringify(successResponse(asn, 'ASN confirmed')), { headers })
    }

    // ─── Receiving Appointments ────────────────────────────
    // GET /api/receiving-appointments (with date/status filters)
    if (path === '/api/receiving-appointments' && method === 'GET') {
      const dateFilter = url.searchParams.get('date')
      const statusFilter = url.searchParams.get('status')
      let appts = RECV_DATA.appointments
      if (dateFilter) appts = appts.filter(a => a.appointmentDate.startsWith(dateFilter))
      if (statusFilter) appts = appts.filter(a => a.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(appts, `${appts.length} receiving appointments`)), { headers })
    }

    // ─── Gate Entries ──────────────────────────────────────
    // GET /api/gate-entries (with type/status filters)
    if (path === '/api/gate-entries' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let entries = RECV_DATA.gateEntries
      if (typeFilter) entries = entries.filter(g => g.entryType === typeFilter.toUpperCase())
      if (statusFilter) entries = entries.filter(g => g.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(entries, `${entries.length} gate entries`)), { headers })
    }

    // ─── Loading Docks ─────────────────────────────────────
    // GET /api/loading-docks (with warehouse/type/status filters)
    if (path === '/api/loading-docks' && method === 'GET') {
      const warehouseFilter = url.searchParams.get('warehouse')
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let docks = RECV_DATA.docks
      if (warehouseFilter) docks = docks.filter(d => d.warehouseId === warehouseFilter || d.warehouseName === warehouseFilter)
      if (typeFilter) docks = docks.filter(d => d.dockType === typeFilter.toUpperCase())
      if (statusFilter) docks = docks.filter(d => d.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(docks, `${docks.length} loading docks`)), { headers })
    }
    // POST /api/loading-docks/:id/assign (assign vehicle to dock)
    if (path.startsWith('/api/loading-docks/') && path.endsWith('/assign') && method === 'POST') {
      const id = path.replace('/api/loading-docks/', '').replace('/assign', '')
      const dock = RECV_DATA.docks.find(d => d.id === id)
      if (!dock) return new Response(JSON.stringify(errorResponse('Dock not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (dock.status !== 'AVAILABLE') {
        return new Response(JSON.stringify(errorResponse(`Dock ${dock.dockCode} is ${dock.status}, cannot assign vehicle`, 'CONFLICT', 409)), { status: 409, headers })
      }
      try {
        const body = await req.json()
        dock.status = 'OCCUPIED'
        dock.currentVehicleNumber = body.vehicleNumber || null
        dock.currentAppointmentId = body.appointmentId || null
        dock.totalOperations += 1
        dock.updatedAt = new Date().toISOString()
        log('info', 'Vehicle assigned to dock', { dockCode: dock.dockCode, vehicle: dock.currentVehicleNumber })
        return new Response(JSON.stringify(successResponse(dock, `Vehicle ${dock.currentVehicleNumber} assigned to dock ${dock.dockCode}`)), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }
    // POST /api/loading-docks/:id/release (release dock)
    if (path.startsWith('/api/loading-docks/') && path.endsWith('/release') && method === 'POST') {
      const id = path.replace('/api/loading-docks/', '').replace('/release', '')
      const dock = RECV_DATA.docks.find(d => d.id === id)
      if (!dock) return new Response(JSON.stringify(errorResponse('Dock not found', 'NOT_FOUND', 404)), { status: 404, headers })
      const releasedVehicle = dock.currentVehicleNumber
      dock.status = 'AVAILABLE'
      dock.currentVehicleNumber = null
      dock.currentAppointmentId = null
      dock.updatedAt = new Date().toISOString()
      log('info', 'Dock released', { dockCode: dock.dockCode, releasedVehicle })
      return new Response(JSON.stringify(successResponse(dock, `Dock ${dock.dockCode} released from vehicle ${releasedVehicle}`)), { headers })
    }

    // ─── Receiving Exceptions ──────────────────────────────
    // GET /api/receiving-exceptions (with type/resolution filters)
    if (path === '/api/receiving-exceptions' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const resolutionFilter = url.searchParams.get('resolution')
      let exceptions = RECV_DATA.exceptions
      if (typeFilter) exceptions = exceptions.filter(e => e.exceptionType === typeFilter.toUpperCase())
      if (resolutionFilter) exceptions = exceptions.filter(e => e.resolutionStatus === resolutionFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(exceptions, `${exceptions.length} receiving exceptions`)), { headers })
    }
    // POST /api/receiving-exceptions/:id/resolve
    if (path.startsWith('/api/receiving-exceptions/') && path.endsWith('/resolve') && method === 'POST') {
      const id = path.replace('/api/receiving-exceptions/', '').replace('/resolve', '')
      const exception = RECV_DATA.exceptions.find(e => e.id === id)
      if (!exception) return new Response(JSON.stringify(errorResponse('Receiving exception not found', 'NOT_FOUND', 404)), { status: 404, headers })
      try {
        const body = await req.json()
        exception.resolutionStatus = body.resolutionStatus || 'ACCEPTED'
        exception.resolutionAction = body.resolutionAction || null
        exception.resolutionNotes = body.resolutionNotes || null
        exception.resolvedById = body.resolvedById || null
        exception.resolvedByName = body.resolvedByName || null
        exception.resolvedAt = new Date().toISOString()
        exception.status = 'RESOLVED'
        exception.updatedAt = new Date().toISOString()
        log('info', 'Receiving exception resolved', { exceptionNumber: exception.exceptionNumber, resolution: exception.resolutionStatus })
        return new Response(JSON.stringify(successResponse(exception, `Exception ${exception.exceptionNumber} resolved as ${exception.resolutionStatus}`)), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }

    // ─── Receiving Operations Dashboard ────────────────────
    // GET /api/receiving-operations/dashboard
    if (path === '/api/receiving-operations/dashboard' && method === 'GET') {
      const totalAsns = RECV_DATA.asns.length
      const confirmedAsns = RECV_DATA.asns.filter(a => a.status === 'CONFIRMED').length
      const vehicleArrivedAsns = RECV_DATA.asns.filter(a => a.status === 'VEHICLE_ARRIVED').length
      const receivingAsns = RECV_DATA.asns.filter(a => a.status === 'RECEIVING').length
      const completedAsns = RECV_DATA.asns.filter(a => a.status === 'COMPLETED').length
      const draftAsns = RECV_DATA.asns.filter(a => a.status === 'DRAFT').length
      const todayAppointments = RECV_DATA.appointments.filter(a => a.appointmentDate.startsWith('2026-07-09')).length
      const availableDocks = RECV_DATA.docks.filter(d => d.status === 'AVAILABLE').length
      const occupiedDocks = RECV_DATA.docks.filter(d => d.status === 'OCCUPIED').length
      const maintenanceDocks = RECV_DATA.docks.filter(d => d.status === 'MAINTENANCE').length
      const gateEntriesToday = RECV_DATA.gateEntries.filter(g => g.gateDate.startsWith('2026-07-09')).length
      const brokenSeals = RECV_DATA.gateEntries.filter(g => !g.sealIntact).length
      const activeExceptions = RECV_DATA.exceptions.filter(e => e.status === 'ACTIVE').length
      const resolvedExceptions = RECV_DATA.exceptions.filter(e => e.status === 'RESOLVED').length
      const pendingExceptions = RECV_DATA.exceptions.filter(e => e.resolutionStatus === 'PENDING').length
      const totalPallets = RECV_DATA.asns.reduce((s, a) => s + (a.totalPallets || 0), 0)
      const totalCartons = RECV_DATA.asns.reduce((s, a) => s + (a.totalCartons || 0), 0)
      const totalExpectedQty = RECV_DATA.asns.reduce((s, a) => s + a.totalQuantity, 0)
      const byReceivingType = RECV_DATA.asns.reduce((acc, a) => { acc[a.receivingType] = (acc[a.receivingType] || 0) + 1; return acc }, {} as Record<string, number>)
      const byAsnStatus = RECV_DATA.asns.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {} as Record<string, number>)
      const byDockType = RECV_DATA.docks.reduce((acc, d) => { acc[d.dockType] = (acc[d.dockType] || 0) + 1; return acc }, {} as Record<string, number>)
      const byDockStatus = RECV_DATA.docks.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc }, {} as Record<string, number>)
      const byExceptionType = RECV_DATA.exceptions.reduce((acc, e) => { acc[e.exceptionType] = (acc[e.exceptionType] || 0) + 1; return acc }, {} as Record<string, number>)
      const byResolutionStatus = RECV_DATA.exceptions.reduce((acc, e) => { acc[e.resolutionStatus] = (acc[e.resolutionStatus] || 0) + 1; return acc }, {} as Record<string, number>)
      const avgUnloadTime = Math.round(RECV_DATA.docks.reduce((s, d) => s + (d.avgUnloadTime || 0), 0) / RECV_DATA.docks.length)
      return new Response(JSON.stringify(successResponse({
        counts: {
          asns: totalAsns,
          confirmedAsns,
          vehicleArrivedAsns,
          receivingAsns,
          completedAsns,
          draftAsns,
          appointments: RECV_DATA.appointments.length,
          todayAppointments,
          gateEntries: RECV_DATA.gateEntries.length,
          gateEntriesToday,
          brokenSeals,
          docks: RECV_DATA.docks.length,
          availableDocks,
          occupiedDocks,
          maintenanceDocks,
          exceptions: RECV_DATA.exceptions.length,
          activeExceptions,
          resolvedExceptions,
          pendingExceptions,
        },
        totalPallets,
        totalCartons,
        totalExpectedQty,
        avgDockToStockTimeMin: 42,
        receivingEfficiencyPercent: 94.5,
        onTimeApptPercent: 87.5,
        asnsByReceivingType: byReceivingType,
        asnsByStatus: byAsnStatus,
        docksByType: byDockType,
        docksByStatus: byDockStatus,
        exceptionsByType: byExceptionType,
        exceptionsByResolution: byResolutionStatus,
        avgUnloadTimeMin: avgUnloadTime,
        receivingFlow: ['Supplier', 'ASN', 'Appointment', 'Gate Entry', 'Dock', 'Unload', 'Verify', 'Goods Receipt', 'Putaway'],
        palletHierarchy: ['Pallet', 'Boxes (48)', 'Packs (24)', 'Units (12)'],
        receivingTypes: ['PURCHASE_ORDER', 'INTER_WAREHOUSE_TRANSFER', 'CUSTOMER_RETURN', 'SUPPLIER_REPLACEMENT', 'MANUFACTURING_RECEIPT', 'VENDOR_MANAGED_INVENTORY', 'OPENING_STOCK', 'SAMPLE_DELIVERY'],
        asnStatuses: ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'VEHICLE_ARRIVED', 'RECEIVING', 'COMPLETED', 'CANCELLED'],
        dockTypes: ['RECEIVING_DOCK', 'DISPATCH_DOCK', 'MIXED_DOCK', 'COLD_DOCK', 'BULK_DOCK', 'CONTAINER_DOCK'],
        dockStatuses: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED'],
        exceptionTypes: ['SHORT_DELIVERY', 'OVER_DELIVERY', 'DAMAGED_GOODS', 'WRONG_PRODUCT', 'WRONG_BATCH', 'BROKEN_SEAL', 'TEMPERATURE_VIOLATION', 'MISSING_DOCUMENTS'],
        resolutionStatuses: ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'PARTIAL_ACCEPT', 'ESCALATED'],
        gateEntryTypes: ['INBOUND', 'OUTBOUND', 'VISITOR', 'CONTRACTOR'],
        gateEntryStatuses: ['ARRIVED', 'IN_WAREHOUSE', 'DEPARTED', 'DENIED'],
        appointmentStatuses: ['SCHEDULED', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        sprint: 24,
        chiefArchitectNote: 'Physical warehouse receiving is a 9-step flow: Supplier → ASN → Appointment → Gate Entry → Dock → Unload → Verify → Goods Receipt → Putaway. The ASN is the digital twin of incoming cargo before it physically arrives — it tells the warehouse what to expect, when, and where. The Pallet is the recommended receiving unit: 1 Pallet → 48 Boxes → 24 Packs → 12 Units. Receiving at the pallet level (scan one barcode) instead of box level reduces receiving time by 80% and barcode-scan errors by 95%.',
      }, 'Receiving Operations dashboard')), { headers })
    }

    // ─── Receiving Operations Info ─────────────────────────
    // GET /api/receiving-operations/info
    if (path === '/api/receiving-operations/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Receiving Operations, Dock Management & ASN Engine', version: '24.0.0', sprint: 24,
        sprintName: 'Receiving Operations, Dock Management & ASN Engine',
        receivingTypes: ['PURCHASE_ORDER', 'INTER_WAREHOUSE_TRANSFER', 'CUSTOMER_RETURN', 'SUPPLIER_REPLACEMENT', 'MANUFACTURING_RECEIPT', 'VENDOR_MANAGED_INVENTORY', 'OPENING_STOCK', 'SAMPLE_DELIVERY'],
        asnStatuses: ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'VEHICLE_ARRIVED', 'RECEIVING', 'COMPLETED', 'CANCELLED'],
        dockTypes: ['RECEIVING_DOCK', 'DISPATCH_DOCK', 'MIXED_DOCK', 'COLD_DOCK', 'BULK_DOCK', 'CONTAINER_DOCK'],
        dockStatuses: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED'],
        exceptionTypes: ['SHORT_DELIVERY', 'OVER_DELIVERY', 'DAMAGED_GOODS', 'WRONG_PRODUCT', 'WRONG_BATCH', 'BROKEN_SEAL', 'TEMPERATURE_VIOLATION', 'MISSING_DOCUMENTS'],
        resolutionStatuses: ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'PARTIAL_ACCEPT', 'ESCALATED'],
        gateEntryTypes: ['INBOUND', 'OUTBOUND', 'VISITOR', 'CONTRACTOR'],
        gateEntryStatuses: ['ARRIVED', 'IN_WAREHOUSE', 'DEPARTED', 'DENIED'],
        appointmentStatuses: ['SCHEDULED', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        asnPrinciple: 'An Advanced Shipping Notice (ASN) is the digital twin of incoming cargo, sent by the supplier/origin before the vehicle arrives. It tells the warehouse: WHAT is coming (lines, quantities, batches, barcodes), WHEN (expected arrival), HOW (vehicle, driver, carrier), and WHERE (warehouse, dock). The ASN is the trigger for the entire receiving flow — without an ASN, the gate cannot pre-validate, the dock cannot be pre-assigned, and the receiving clerk has no expected-quantity to scan against.',
        appointmentPrinciple: 'A Receiving Appointment reserves a dock and time slot for an incoming vehicle. The yard-management system schedules appointments to prevent dock congestion (no vehicle waits >30 min) and balances workload across receiving docks. Appointment status flows: SCHEDULED → CONFIRMED → ARRIVED → IN_PROGRESS → COMPLETED. NO_SHOW triggers a rebooking fee from the supplier.',
        gateEntryPrinciple: 'A Gate Entry is the security-gate record of vehicle arrival/departure. The security officer verifies vehicle number, driver license, and seal number (intact or broken). A BROKEN SEAL triggers automatic cargo quarantine and a Receiving Exception. Photo evidence (vehicle, seal, cargo) is captured for audit. Gate entries are the first link in the chain-of-custody that ends at the putaway bin.',
        dockPrinciple: 'Loading Docks are the physical interface between vehicle and warehouse. Each dock has a type (RECEIVING, DISPATCH, MIXED, COLD, BULK, CONTAINER), equipment (forklift, pallet jack, conveyor), and temperature-control capability. Dock status (AVAILABLE/OCCUPIED/MAINTENANCE/CLOSED) drives the appointment scheduler. Avg unload time per dock is tracked for SLA monitoring and dock-balancing analytics.',
        exceptionPrinciple: 'Receiving Exceptions capture any deviation between expected (ASN) and actual (received): SHORT_DELIVERY, OVER_DELIVERY, DAMAGED_GOODS, WRONG_PRODUCT, WRONG_BATCH, BROKEN_SEAL, TEMPERATURE_VIOLATION, MISSING_DOCUMENTS. Each exception requires a resolution (ACCEPTED, REJECTED, PARTIAL_ACCEPT, ESCALATED) with photo evidence, resolution action, and resolved-by audit. Exceptions feed into supplier scorecards (Sprint 9) and quality holds (Sprint 13).',
        palletReceivingPrinciple: 'Pallet-level receiving is the Chief Architect recommendation: receive by scanning ONE pallet barcode instead of 48 individual box barcodes. The system trusts the pallet-internal packing list (printed by supplier) and verifies via statistical sampling (5% boxes scanned). Receiving time drops from ~40 min/vehicle to ~8 min/vehicle, and barcode-scan errors drop from ~3% to ~0.1%. The hierarchy: 1 Pallet → 48 Boxes → 24 Packs → 12 Units — each level has its own barcode and packing slip.',
        endpoints: ['GET /api/asn', 'POST /api/asn', 'POST /api/asn/:id/confirm', 'GET /api/receiving-appointments', 'GET /api/gate-entries', 'GET /api/loading-docks', 'POST /api/loading-docks/:id/assign', 'POST /api/loading-docks/:id/release', 'GET /api/receiving-exceptions', 'POST /api/receiving-exceptions/:id/resolve', 'GET /api/receiving-operations/dashboard', 'GET /api/receiving-operations/info'],
        part4Begun: true,
        part4Sprint: 3,
        part4Sprints: 12,
        part4Tables: 19,
      }, 'SUOP Receiving Operations Engine v24.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 25 — DIRECTED PUTAWAY, STORAGE OPTIMIZATION & BIN INTELLIGENCE ENGINE ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Putaway Tasks ─────────────────────────────────────
    // GET /api/wms-putaway-tasks (with type/status/warehouse filters)
    if (path === '/api/wms-putaway-tasks' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const warehouseFilter = url.searchParams.get('warehouse')
      let tasks = PUTAWAY_DATA.putawayTasks
      if (typeFilter) tasks = tasks.filter(t => t.type === typeFilter.toUpperCase())
      if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter.toUpperCase())
      if (warehouseFilter) tasks = tasks.filter(t => t.warehouseId === warehouseFilter || t.warehouseName === warehouseFilter)
      return new Response(JSON.stringify(successResponse(tasks, `${tasks.length} putaway tasks`)), { headers })
    }
    // POST /api/wms-putaway-tasks
    if (path === '/api/wms-putaway-tasks' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.taskNumber || !body.type) {
          return new Response(JSON.stringify(errorResponse('taskNumber and type are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        const task = {
          id: crypto.randomUUID(),
          taskNumber: body.taskNumber,
          taskDate: body.taskDate || new Date().toISOString(),
          type: body.type,
          warehouseId: body.warehouseId || null,
          warehouseName: body.warehouseName || null,
          sourceZone: body.sourceZone || null,
          destZone: body.destZone || null,
          referenceType: body.referenceType || null,
          referenceNumber: body.referenceNumber || null,
          priority: body.priority || 'NORMAL',
          status: body.status || 'PENDING',
          assignedOperatorId: body.assignedOperatorId || null,
          assignedOperatorName: body.assignedOperatorName || null,
          forkliftId: body.forkliftId || null,
          forkliftCode: body.forkliftCode || null,
          totalLines: body.lines?.length || 0,
          totalPallets: body.totalPallets || 0,
          totalCartons: body.totalCartons || 0,
          totalQuantity: body.totalQuantity || 0,
          putawayProgress: 0,
          startedAt: null,
          completedAt: null,
          estimatedTimeMin: body.estimatedTimeMin || null,
          actualTimeMin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lines: body.lines || [],
        }
        PUTAWAY_DATA.putawayTasks.push(task)
        log('info', 'Putaway task created', { taskNumber: task.taskNumber, type: task.type })
        return new Response(JSON.stringify(successResponse(task, 'Putaway task created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }
    // POST /api/wms-putaway-tasks/:id/complete
    if (path.startsWith('/api/wms-putaway-tasks/') && path.endsWith('/complete') && method === 'POST') {
      const id = path.replace('/api/wms-putaway-tasks/', '').replace('/complete', '')
      const task = PUTAWAY_DATA.putawayTasks.find(t => t.id === id)
      if (!task) return new Response(JSON.stringify(errorResponse('Putaway task not found', 'NOT_FOUND', 404)), { status: 404, headers })
      task.status = 'COMPLETED'
      task.putawayProgress = 100
      task.completedAt = new Date().toISOString()
      task.updatedAt = new Date().toISOString()
      if (task.lines && Array.isArray(task.lines)) {
        task.lines.forEach((l: any) => { l.lineStatus = 'COMPLETED'; if (l.confirmedBin === null && l.recommendedBin) l.confirmedBin = l.recommendedBin; if (l.putawayQty === 0) l.putawayQty = l.quantity })
      }
      log('info', 'Putaway task completed', { taskNumber: task.taskNumber })
      return new Response(JSON.stringify(successResponse(task, `Putaway task ${task.taskNumber} completed`)), { headers })
    }

    // ─── Putaway Rules ────────────────────────────────────
    // GET /api/wms-putaway-rules
    if (path === '/api/wms-putaway-rules' && method === 'GET') {
      const strategyFilter = url.searchParams.get('strategy')
      let rules = PUTAWAY_DATA.putawayRules
      if (strategyFilter) rules = rules.filter(r => r.strategy === strategyFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(rules, `${rules.length} putaway rules`)), { headers })
    }

    // ─── Warehouse Pallets ────────────────────────────────
    // GET /api/warehouse-pallets (with status filter)
    if (path === '/api/warehouse-pallets' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let pallets = PUTAWAY_DATA.warehousePallets
      if (statusFilter) pallets = pallets.filter(p => p.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(pallets, `${pallets.length} warehouse pallets`)), { headers })
    }

    // ─── Forklift Tasks ───────────────────────────────────
    // GET /api/forklift-tasks (with type/status/operator filters)
    if (path === '/api/forklift-tasks' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const operatorFilter = url.searchParams.get('operator')
      let tasks = PUTAWAY_DATA.forkliftTasks
      if (typeFilter) tasks = tasks.filter(t => t.type === typeFilter.toUpperCase())
      if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter.toUpperCase())
      if (operatorFilter) tasks = tasks.filter(t => t.assignedOperatorId === operatorFilter || (t.assignedOperatorName && t.assignedOperatorName.toLowerCase().includes(operatorFilter.toLowerCase())))
      return new Response(JSON.stringify(successResponse(tasks, `${tasks.length} forklift tasks`)), { headers })
    }
    // POST /api/forklift-tasks/:id/complete
    if (path.startsWith('/api/forklift-tasks/') && path.endsWith('/complete') && method === 'POST') {
      const id = path.replace('/api/forklift-tasks/', '').replace('/complete', '')
      const ft = PUTAWAY_DATA.forkliftTasks.find(t => t.id === id)
      if (!ft) return new Response(JSON.stringify(errorResponse('Forklift task not found', 'NOT_FOUND', 404)), { status: 404, headers })
      ft.status = 'COMPLETED'
      ft.completedAt = new Date().toISOString()
      if (ft.startedAt) {
        const start = new Date(ft.startedAt).getTime()
        ft.durationMin = Math.round((Date.now() - start) / 60000)
      }
      ft.updatedAt = new Date().toISOString()
      log('info', 'Forklift task completed', { taskNumber: ft.taskNumber })
      return new Response(JSON.stringify(successResponse(ft, `Forklift task ${ft.taskNumber} completed`)), { headers })
    }

    // ─── Directed Putaway Dashboard ───────────────────────
    // GET /api/wms-putaway/dashboard
    if (path === '/api/wms-putaway/dashboard' && method === 'GET') {
      const totalTasks = PUTAWAY_DATA.putawayTasks.length
      const pendingTasks = PUTAWAY_DATA.putawayTasks.filter(t => t.status === 'PENDING').length
      const assignedTasks = PUTAWAY_DATA.putawayTasks.filter(t => t.status === 'ASSIGNED').length
      const inProgressTasks = PUTAWAY_DATA.putawayTasks.filter(t => t.status === 'IN_PROGRESS').length
      const completedTasks = PUTAWAY_DATA.putawayTasks.filter(t => t.status === 'COMPLETED').length
      const partiallyCompletedTasks = PUTAWAY_DATA.putawayTasks.filter(t => t.status === 'PARTIALLY_COMPLETED').length
      const totalRules = PUTAWAY_DATA.putawayRules.length
      const activeRules = PUTAWAY_DATA.putawayRules.filter(r => r.isActive).length
      const totalPallets = PUTAWAY_DATA.warehousePallets.length
      const loadedPallets = PUTAWAY_DATA.warehousePallets.filter(p => p.status === 'LOADED').length
      const storedPallets = PUTAWAY_DATA.warehousePallets.filter(p => p.status === 'STORED').length
      const emptyPallets = PUTAWAY_DATA.warehousePallets.filter(p => p.status === 'EMPTY').length
      const totalForkliftTasks = PUTAWAY_DATA.forkliftTasks.length
      const activeForklifts = PUTAWAY_DATA.forkliftTasks.filter(f => f.status === 'IN_PROGRESS').length
      const completedForklifts = PUTAWAY_DATA.forkliftTasks.filter(f => f.status === 'COMPLETED').length
      const byType: Record<string, number> = {}
      PUTAWAY_DATA.putawayTasks.forEach(t => { byType[t.type] = (byType[t.type] || 0) + 1 })
      const byStatus: Record<string, number> = {}
      PUTAWAY_DATA.putawayTasks.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1 })
      const byStrategy: Record<string, number> = {}
      PUTAWAY_DATA.putawayRules.forEach(r => { byStrategy[r.strategy] = (byStrategy[r.strategy] || 0) + 1 })
      const byPalletType: Record<string, number> = {}
      PUTAWAY_DATA.warehousePallets.forEach(p => { byPalletType[p.palletType] = (byPalletType[p.palletType] || 0) + 1 })
      const byForkliftType: Record<string, number> = {}
      PUTAWAY_DATA.forkliftTasks.forEach(f => { byForkliftType[f.type] = (byForkliftType[f.type] || 0) + 1 })
      return new Response(JSON.stringify(successResponse({
        summary: {
          totalTasks, pendingTasks, assignedTasks, inProgressTasks, completedTasks, partiallyCompletedTasks,
          totalRules, activeRules,
          totalPallets, loadedPallets, storedPallets, emptyPallets,
          totalForkliftTasks, activeForklifts, completedForklifts,
        },
        avgPutawayTimeMin: 33,
        putawayAccuracyPercent: 98.2,
        exceptionCount: 3,
        tasksByType: byType,
        tasksByStatus: byStatus,
        rulesByStrategy: byStrategy,
        palletsByType: byPalletType,
        forkliftsByType: byForkliftType,
        directedPutawayFlow: ['Receiving', 'Inspection', 'Putaway Task', 'Bin Recommendation', 'Barcode Scan', 'Confirm Location', 'Inventory Updated'],
        operatorFlow: ['Operator Login', 'Assigned Tasks', 'Task #', 'Scan Pallet', 'System Shows Zone/Aisle/Rack/Shelf/Bin', 'Scan Bin', 'Complete'],
        binScoreFormula: 'Best Bin Score = Capacity + Distance + Product Compatibility + Temperature Match + Picking Efficiency',
        binScoringFactors: ['Capacity', 'Distance', 'Product Compatibility', 'Temperature Match', 'Picking Efficiency'],
        putawayTypes: ['DIRECTED', 'CROSS_DOCK', 'PALLET', 'COLD_STORAGE', 'RETURNS', 'STANDARD'],
        putawayStatuses: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED', 'CANCELLED'],
        putawayStrategies: ['FEFO', 'FIFO', 'ABC', 'CLOSEST_EMPTY', 'FAST_MOVING_ZONE'],
        palletTypes: ['STANDARD', 'EURO', 'CHEP', 'PLASTIC', 'DISPOSABLE'],
        palletStatuses: ['AVAILABLE', 'LOADED', 'STORED', 'EMPTY', 'QUARANTINED'],
        forkliftTypes: ['PUTAWAY', 'TRANSFER', 'PICKING', 'LOADING', 'UNLOADING'],
        forkliftStatuses: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        sprint: 25,
        chiefArchitectNote: 'Directed Putaway is the Chief Architect recommendation: the system — not the operator — decides WHERE each pallet goes. The operator only follows instructions: Scan Pallet → System shows Zone/Aisle/Rack/Shelf/Bin → Drive to bin → Scan bin → Confirm. This eliminates the 30% putaway-error rate of "operator picks a bin" mode and enables Bin Intelligence (the system continuously scores every bin on Capacity + Distance + Product Compatibility + Temperature Match + Picking Efficiency, then recommends the highest-scoring bin).',
      }, 'Directed Putaway dashboard')), { headers })
    }

    // ─── Directed Putaway Info ────────────────────────────
    // GET /api/wms-putaway/info
    if (path === '/api/wms-putaway/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Directed Putaway, Storage Optimization & Bin Intelligence Engine', version: '25.0.0', sprint: 25,
        sprintName: 'Directed Putaway, Storage Optimization & Bin Intelligence Engine',
        putawayTypes: ['DIRECTED', 'CROSS_DOCK', 'PALLET', 'COLD_STORAGE', 'RETURNS', 'STANDARD'],
        putawayStatuses: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED', 'CANCELLED'],
        putawayStrategies: ['FEFO', 'FIFO', 'ABC', 'CLOSEST_EMPTY', 'FAST_MOVING_ZONE'],
        palletTypes: ['STANDARD', 'EURO', 'CHEP', 'PLASTIC', 'DISPOSABLE'],
        palletStatuses: ['AVAILABLE', 'LOADED', 'STORED', 'EMPTY', 'QUARANTINED'],
        forkliftTypes: ['PUTAWAY', 'TRANSFER', 'PICKING', 'LOADING', 'UNLOADING'],
        forkliftStatuses: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        directedPutawayPrinciple: 'Directed Putaway flips the traditional model: instead of an operator deciding where to put stock, the SYSTEM computes the optimal bin and directs the operator step-by-step. The operator only confirms each step with a barcode scan. This eliminates the 30% putaway-error rate of operator-decided putaway (wrong bin, wrong zone, mixed products) and is the foundation of Bin Intelligence.',
        binScoringPrinciple: 'Every candidate bin is scored 0-100 on five factors: (1) Capacity — current weight/volume utilization vs max; (2) Distance — forklift travel meters from receiving to bin; (3) Product Compatibility — same-product batching, allergen separation, batch-isolation rules; (4) Temperature Match — chilled bins for chilled products, ambient for ambient; (5) Picking Efficiency — pick-face proximity for fast movers, high-rack for slow movers. Best Bin Score = Capacity + Distance + Product Compatibility + Temperature Match + Picking Efficiency.',
        strategyPrinciple: 'Five slotting strategies compete for each product: FEFO (perishables, soonest-expiry first), FIFO (raw materials, first-in first-out), ABC (A-class to pick-face, C-class to high reserve), CLOSEST_EMPTY (fallback, minimizes travel), FAST_MOVING_ZONE (daily-dispatch SKUs near dispatch dock). Each strategy has weighted factors — the engine picks the strategy whose conditions match the product, then runs bin scoring within the strategy\'s target zones.',
        palletPrinciple: 'Pallets are the recommended putaway unit (1 Pallet = 48 Boxes). Each pallet has a unique barcode + QR code, type (STANDARD 1000kg, EURO 1200kg, CHEP 1100kg), max weight, current weight, carton count, and status (AVAILABLE → LOADED → STORED → EMPTY). Pallet-level putaway reduces forklift trips by 87% vs box-level putaway.',
        forkliftTaskPrinciple: 'Each Forklift Task is a directed movement: From-location → To-location, with travel distance (meters), estimated travel time, and operator assignment. Forklift tasks are auto-generated from putaway task lines — one forklift task per pallet movement. Counterbalance trucks handle heavy pallets to ground racks; reach trucks handle high racks; order pickers handle case-picking to dispatch staging.',
        crossDockPrinciple: 'Cross-Dock putaway bypasses storage entirely: goods received at the inbound dock go directly to the outbound dispatch staging dock, with zero storage time. Used for urgent transfers, just-in-time fulfillment, and perishable cross-docking. Travel path: Receiving Dock → Dispatch Staging (no bin scan).',
        coldStoragePrinciple: 'Cold-Storage putaway follows temperature-zone rules: chilled products (2-8°C) to CHILLED_ZONE bins, frozen (-18°C) to FROZEN_ZONE bins. The engine validates temperature match before recommending a bin and rejects ambient-bin putaway for chilled products. Temperature violations during putaway trigger an automatic Receiving Exception.',
        endpoints: ['GET /api/wms-putaway-tasks', 'POST /api/wms-putaway-tasks', 'POST /api/wms-putaway-tasks/:id/complete', 'GET /api/wms-putaway-rules', 'GET /api/warehouse-pallets', 'GET /api/forklift-tasks', 'POST /api/forklift-tasks/:id/complete', 'GET /api/wms-putaway/dashboard', 'GET /api/wms-putaway/info'],
        part4Begun: true,
        part4Sprint: 4,
        part4Sprints: 12,
        part4Tables: 24,
      }, 'SUOP Directed Putaway & Bin Intelligence Engine v25.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════════
    // SPRINT 26 — PICKING, PACKING & ORDER FULFILLMENT ENGINE ENDPOINTS
    // ═════════════════════════════════════════════════════════════

    // ─── Picking Tasks ─────────────────────────────────────
    // GET /api/wms-picking-tasks (with type/status/warehouse/picker filters)
    if (path === '/api/wms-picking-tasks' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const warehouseFilter = url.searchParams.get('warehouse')
      const pickerFilter = url.searchParams.get('picker')
      let tasks = PICKING_DATA.pickingTasks
      if (typeFilter) tasks = tasks.filter(t => t.fulfillmentType === typeFilter.toUpperCase())
      if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter.toUpperCase())
      if (warehouseFilter) tasks = tasks.filter(t => t.warehouseId === warehouseFilter || t.warehouseName === warehouseFilter)
      if (pickerFilter) tasks = tasks.filter(t => t.pickerId === pickerFilter || (t.pickerName || '').includes(pickerFilter))
      return new Response(JSON.stringify(successResponse(tasks, `${tasks.length} picking tasks`)), { headers })
    }
    // POST /api/wms-picking-tasks
    if (path === '/api/wms-picking-tasks' && method === 'POST') {
      try {
        const body = await req.json()
        if (!body.pickingNumber || !body.fulfillmentType || !body.pickingStrategy) {
          return new Response(JSON.stringify(errorResponse('pickingNumber, fulfillmentType and pickingStrategy are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
        }
        const task = {
          id: crypto.randomUUID(),
          pickingNumber: body.pickingNumber,
          pickingDate: body.pickingDate || new Date().toISOString(),
          fulfillmentType: body.fulfillmentType,
          pickingStrategy: body.pickingStrategy,
          warehouseId: body.warehouseId || null,
          warehouseName: body.warehouseName || null,
          waveId: body.waveId || null,
          waveNumber: body.waveNumber || null,
          referenceType: body.referenceType || null,
          referenceNumber: body.referenceNumber || null,
          partnerId: body.partnerId || null,
          partnerName: body.partnerName || null,
          priority: body.priority || 'NORMAL',
          priorityScore: body.priorityScore || 50,
          pickerId: body.pickerId || null,
          pickerName: body.pickerName || null,
          assignedAt: body.pickerId ? new Date().toISOString() : null,
          status: body.status || 'PENDING',
          totalLines: body.lines?.length || 0,
          pickedLines: 0,
          totalQty: body.totalQty || (body.lines ? body.lines.reduce((s: number, l: any) => s + (l.requiredQty || 0), 0) : 0),
          pickedQty: 0,
          pickRouteId: body.pickRouteId || null,
          totalDistanceM: body.totalDistanceM || null,
          estimatedTimeMin: body.estimatedTimeMin || null,
          startedAt: null, pickedAt: null, packedAt: null, readyToShipAt: null, dispatchedAt: null,
          pickDurationMin: null, packDurationMin: null,
          createdById: body.createdById || null,
          createdByName: body.createdByName || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lines: body.lines || [],
        } as any
        PICKING_DATA.pickingTasks.push(task)
        log('info', 'Picking task created', { pickingNumber: task.pickingNumber, fulfillmentType: task.fulfillmentType })
        return new Response(JSON.stringify(successResponse(task, 'Picking task created')), { headers })
      } catch (e) {
        return new Response(JSON.stringify(errorResponse('Invalid request body')), { status: 400, headers })
      }
    }
    // POST /api/wms-picking-tasks/:id/complete
    if (path.startsWith('/api/wms-picking-tasks/') && path.endsWith('/complete') && method === 'POST') {
      const id = path.replace('/api/wms-picking-tasks/', '').replace('/complete', '')
      const task = PICKING_DATA.pickingTasks.find(t => t.id === id)
      if (!task) return new Response(JSON.stringify(errorResponse('Picking task not found', 'NOT_FOUND', 404)), { status: 404, headers })
      task.status = 'PICKED'
      task.pickedLines = task.totalLines
      task.pickedQty = task.totalQty
      task.pickedAt = new Date().toISOString()
      task.updatedAt = new Date().toISOString()
      if (task.lines && Array.isArray(task.lines)) {
        task.lines.forEach((l: any) => {
          if (l.lineStatus !== 'PICKED') {
            l.lineStatus = 'PICKED'
            if (l.pickedQty === 0) l.pickedQty = l.requiredQty
            if (l.remainingQty > 0) l.remainingQty = 0
            if (!l.barcodeVerified) l.barcodeVerified = true
            if (!l.pickedAt) l.pickedAt = task.pickedAt
            if (!l.binBarcodeScanned && l.binCode) l.binBarcodeScanned = 'BC-' + l.binCode.replace(/-/g, '')
            if (!l.productBarcodeScanned) l.productBarcodeScanned = 'BC-PRD-' + l.lineOrder
            if (!l.batchBarcodeScanned && l.batchNumber) l.batchBarcodeScanned = 'BC-' + l.batchNumber
          }
        })
      }
      log('info', 'Picking task completed', { pickingNumber: task.pickingNumber })
      return new Response(JSON.stringify(successResponse(task, `Picking task ${task.pickingNumber} completed`)), { headers })
    }

    // ─── Packing Stations ─────────────────────────────────
    // GET /api/packing-stations
    if (path === '/api/packing-stations' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      const typeFilter = url.searchParams.get('type')
      let stations = PICKING_DATA.packingStations
      if (statusFilter) stations = stations.filter(s => s.status === statusFilter.toUpperCase())
      if (typeFilter) stations = stations.filter(s => s.stationType === typeFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(stations, `${stations.length} packing stations`)), { headers })
    }

    // ─── Packing Jobs ─────────────────────────────────────
    // GET /api/packing-jobs (with status filter)
    if (path === '/api/packing-jobs' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let jobs = PICKING_DATA.packingJobs
      if (statusFilter) jobs = jobs.filter(j => j.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(jobs, `${jobs.length} packing jobs`)), { headers })
    }
    // POST /api/packing-jobs/:id/complete
    if (path.startsWith('/api/packing-jobs/') && path.endsWith('/complete') && method === 'POST') {
      const id = path.replace('/api/packing-jobs/', '').replace('/complete', '')
      const job = PICKING_DATA.packingJobs.find(j => j.id === id)
      if (!job) return new Response(JSON.stringify(errorResponse('Packing job not found', 'NOT_FOUND', 404)), { status: 404, headers })
      job.status = 'READY_TO_SHIP'
      job.completedAt = new Date().toISOString()
      if (job.startedAt) {
        const dur = Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 60000)
        job.durationMinutes = dur
      }
      job.labelPrinted = true
      job.labelPrintedAt = new Date().toISOString()
      job.verificationStatus = 'VERIFIED'
      job.updatedAt = new Date().toISOString()
      log('info', 'Packing job completed', { jobNumber: job.jobNumber })
      return new Response(JSON.stringify(successResponse(job, `Packing job ${job.jobNumber} completed`)), { headers })
    }

    // ─── Carton Types ─────────────────────────────────────
    // GET /api/carton-types
    if (path === '/api/carton-types' && method === 'GET') {
      const categoryFilter = url.searchParams.get('category')
      let types = PICKING_DATA.cartonTypes
      if (categoryFilter) types = types.filter(c => c.cartonCategory === categoryFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(types, `${types.length} carton types`)), { headers })
    }

    // ─── Cartons ──────────────────────────────────────────
    // GET /api/cartons (with status filter)
    if (path === '/api/cartons' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let cartons = PICKING_DATA.cartons
      if (statusFilter) cartons = cartons.filter(c => c.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(cartons, `${cartons.length} cartons`)), { headers })
    }

    // ─── Shipping Labels ──────────────────────────────────
    // GET /api/shipping-labels (with type/status filter)
    if (path === '/api/shipping-labels' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let labels = PICKING_DATA.shippingLabels
      if (typeFilter) labels = labels.filter(l => l.labelType === typeFilter.toUpperCase())
      if (statusFilter) labels = labels.filter(l => l.printStatus === statusFilter.toUpperCase() || l.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(labels, `${labels.length} shipping labels`)), { headers })
    }

    // ─── Fulfillment Dashboard ────────────────────────────
    // GET /api/wms-fulfillment/dashboard
    if (path === '/api/wms-fulfillment/dashboard' && method === 'GET') {
      const totalPickingTasks = PICKING_DATA.pickingTasks.length
      const pendingPicking = PICKING_DATA.pickingTasks.filter(t => t.status === 'PENDING').length
      const inProgressPicking = PICKING_DATA.pickingTasks.filter(t => t.status === 'IN_PROGRESS').length
      const pickedTasks = PICKING_DATA.pickingTasks.filter(t => t.status === 'PICKED').length
      const packingTasks = PICKING_DATA.pickingTasks.filter(t => t.status === 'PACKING').length
      const packedTasks = PICKING_DATA.pickingTasks.filter(t => t.status === 'PACKED').length
      const readyToShipTasks = PICKING_DATA.pickingTasks.filter(t => t.status === 'READY_TO_SHIP').length
      const dispatchedTasks = PICKING_DATA.pickingTasks.filter(t => t.status === 'DISPATCHED').length
      const totalPackingStations = PICKING_DATA.packingStations.length
      const availableStations = PICKING_DATA.packingStations.filter(s => s.status === 'AVAILABLE').length
      const busyStations = PICKING_DATA.packingStations.filter(s => s.status === 'BUSY').length
      const totalPackingJobs = PICKING_DATA.packingJobs.length
      const inProgressJobs = PICKING_DATA.packingJobs.filter(j => j.status === 'IN_PROGRESS').length
      const labeledJobs = PICKING_DATA.packingJobs.filter(j => j.status === 'LABELED').length
      const readyToShipJobs = PICKING_DATA.packingJobs.filter(j => j.status === 'READY_TO_SHIP').length
      const totalCartonTypes = PICKING_DATA.cartonTypes.length
      const totalCartons = PICKING_DATA.cartons.length
      const openCartons = PICKING_DATA.cartons.filter(c => c.status === 'OPEN').length
      const sealedCartons = PICKING_DATA.cartons.filter(c => c.status === 'SEALED').length
      const labeledCartons = PICKING_DATA.cartons.filter(c => c.status === 'LABELED').length
      const loadedCartons = PICKING_DATA.cartons.filter(c => c.status === 'LOADED').length
      const shippedCartons = PICKING_DATA.cartons.filter(c => c.status === 'SHIPPED').length
      const totalLabels = PICKING_DATA.shippingLabels.length
      const printedLabels = PICKING_DATA.shippingLabels.filter(l => l.printStatus === 'PRINTED').length
      const pendingLabels = PICKING_DATA.shippingLabels.filter(l => l.printStatus === 'PENDING').length
      const byFulfillmentType: Record<string, number> = {}
      PICKING_DATA.pickingTasks.forEach(t => { byFulfillmentType[t.fulfillmentType] = (byFulfillmentType[t.fulfillmentType] || 0) + 1 })
      const byStrategy: Record<string, number> = {}
      PICKING_DATA.pickingTasks.forEach(t => { byStrategy[t.pickingStrategy] = (byStrategy[t.pickingStrategy] || 0) + 1 })
      const byStatus: Record<string, number> = {}
      PICKING_DATA.pickingTasks.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1 })
      const byStationType: Record<string, number> = {}
      PICKING_DATA.packingStations.forEach(s => { byStationType[s.stationType] = (byStationType[s.stationType] || 0) + 1 })
      const byCartonCategory: Record<string, number> = {}
      PICKING_DATA.cartonTypes.forEach(c => { byCartonCategory[c.cartonCategory] = (byCartonCategory[c.cartonCategory] || 0) + 1 })
      const byCartonStatus: Record<string, number> = {}
      PICKING_DATA.cartons.forEach(c => { byCartonStatus[c.status] = (byCartonStatus[c.status] || 0) + 1 })
      const byLabelType: Record<string, number> = {}
      PICKING_DATA.shippingLabels.forEach(l => { byLabelType[l.labelType] = (byLabelType[l.labelType] || 0) + 1 })
      const pickedTasksWithDuration = PICKING_DATA.pickingTasks.filter(t => t.pickDurationMin !== null) as any[]
      const avgPickTime = pickedTasksWithDuration.length > 0 ? Math.round(pickedTasksWithDuration.reduce((s, t) => s + (t.pickDurationMin as number), 0) / pickedTasksWithDuration.length) : 0
      const packedJobsWithDuration = PICKING_DATA.packingJobs.filter(j => j.durationMinutes !== null) as any[]
      const avgPackTime = packedJobsWithDuration.length > 0 ? Math.round(packedJobsWithDuration.reduce((s, j) => s + (j.durationMinutes as number), 0) / packedJobsWithDuration.length) : 0
      return new Response(JSON.stringify(successResponse({
        summary: {
          totalPickingTasks, pendingPicking, inProgressPicking, pickedTasks, packingTasks, packedTasks, readyToShipTasks, dispatchedTasks,
          totalPackingStations, availableStations, busyStations,
          totalPackingJobs, inProgressJobs, labeledJobs, readyToShipJobs,
          totalCartonTypes, totalCartons, openCartons, sealedCartons, labeledCartons, loadedCartons, shippedCartons,
          totalLabels, printedLabels, pendingLabels,
        },
        avgPickTimeMin: avgPickTime,
        avgPackTimeMin: avgPackTime,
        pickingAccuracyPercent: 99.4,
        ordersPerHour: 18,
        tasksByFulfillmentType: byFulfillmentType,
        tasksByStrategy: byStrategy,
        tasksByStatus: byStatus,
        stationsByType: byStationType,
        cartonsByCategory: byCartonCategory,
        cartonsByStatus: byCartonStatus,
        labelsByType: byLabelType,
        fulfillmentFlow: ['Sales Order', 'Allocation', 'Wave Planning', 'Picking Task', 'Barcode Picking', 'Packing', 'Quality Check', 'Shipping Label', 'Dispatch Ready'],
        pickerWorkflow: ['Scan Bin', 'Scan Product', 'Scan Batch', 'Scan Tote'],
        packingWorkflow: ['Second Scan Verification', 'Pack', 'Label', 'Dispatch'],
        fulfillmentTypes: ['RETAIL_ORDER', 'WHOLESALE_ORDER', 'DISTRIBUTOR_ORDER', 'RESTAURANT_REPLENISHMENT', 'BRANCH_TRANSFER', 'EXPORT_ORDER', 'CORPORATE_ORDER', 'ECOMMERCE_ORDER', 'SAMPLE_ORDER'],
        pickingStrategies: ['SINGLE_ORDER', 'BATCH', 'WAVE', 'ZONE', 'PICK_AND_PASS', 'CART', 'CLUSTER', 'PALLET'],
        pickingStatuses: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PICKED', 'PACKING', 'PACKED', 'READY_TO_SHIP', 'DISPATCHED', 'CANCELLED', 'EXCEPTION'],
        stationTypes: ['STANDARD', 'BULK', 'COLD', 'EXPORT', 'FRAGILE', 'GIFT'],
        stationStatuses: ['AVAILABLE', 'BUSY', 'MAINTENANCE', 'CLOSED'],
        packingStatuses: ['PENDING', 'IN_PROGRESS', 'PACKED', 'LABELED', 'READY_TO_SHIP', 'EXCEPTION', 'CANCELLED'],
        verificationStatuses: ['PENDING', 'VERIFIED', 'MISMATCH', 'EXCEPTION'],
        cartonCategories: ['STANDARD', 'BULK', 'PALLET', 'MIXED', 'GIFT_BOX', 'EXPORT', 'FRAGILE', 'COLD'],
        cartonStatuses: ['OPEN', 'SEALED', 'LABELED', 'LOADED', 'SHIPPED'],
        labelTypes: ['ORDER_LABEL', 'PALLET_LABEL', 'CARTON_LABEL', 'COURIER_LABEL', 'INTERNAL_LABEL', 'QR_LABEL', 'BARCODE_LABEL'],
        labelFormats: ['PDF', 'ZPL', 'PNG', 'DPL'],
        printStatuses: ['PENDING', 'PRINTED', 'FAILED'],
        carrierIntegrations: ['Shiprocket', 'Blue Dart', 'Delhivery', 'DTDC', 'FedEx', 'DHL'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        sprint: 26,
        chiefArchitectNote: 'Two-Stage Barcode Verification is the Chief Architect recommendation: at Pick, the picker scans in sequence — Bin → Product → Batch → Tote — every scan matched against the expected value before the line is marked PICKED. At Packing, the packer re-scans each picked unit at the Packing Station, system cross-checks against the picking task, and only then seals the carton. This eliminates the 25% mispick error rate of single-scan workflows and gives full genealogy: Sales Order → Picking Task → Picking Line → Packing Job → Carton → Shipping Label → Carrier Tracking.',
      }, 'Picking, Packing & Order Fulfillment dashboard')), { headers })
    }

    // ─── Fulfillment Info ─────────────────────────────────
    // GET /api/wms-fulfillment/info
    if (path === '/api/wms-fulfillment/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Picking, Packing & Order Fulfillment Engine', version: '26.0.0', sprint: 26,
        sprintName: 'Picking, Packing & Order Fulfillment Engine',
        fulfillmentTypes: ['RETAIL_ORDER', 'WHOLESALE_ORDER', 'DISTRIBUTOR_ORDER', 'RESTAURANT_REPLENISHMENT', 'BRANCH_TRANSFER', 'EXPORT_ORDER', 'CORPORATE_ORDER', 'ECOMMERCE_ORDER', 'SAMPLE_ORDER'],
        pickingStrategies: ['SINGLE_ORDER', 'BATCH', 'WAVE', 'ZONE', 'PICK_AND_PASS', 'CART', 'CLUSTER', 'PALLET'],
        pickingStatuses: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PICKED', 'PACKING', 'PACKED', 'READY_TO_SHIP', 'DISPATCHED', 'CANCELLED', 'EXCEPTION'],
        stationTypes: ['STANDARD', 'BULK', 'COLD', 'EXPORT', 'FRAGILE', 'GIFT'],
        stationStatuses: ['AVAILABLE', 'BUSY', 'MAINTENANCE', 'CLOSED'],
        packingStatuses: ['PENDING', 'IN_PROGRESS', 'PACKED', 'LABELED', 'READY_TO_SHIP', 'EXCEPTION', 'CANCELLED'],
        verificationStatuses: ['PENDING', 'VERIFIED', 'MISMATCH', 'EXCEPTION'],
        cartonCategories: ['STANDARD', 'BULK', 'PALLET', 'MIXED', 'GIFT_BOX', 'EXPORT', 'FRAGILE', 'COLD'],
        cartonStatuses: ['OPEN', 'SEALED', 'LABELED', 'LOADED', 'SHIPPED'],
        labelTypes: ['ORDER_LABEL', 'PALLET_LABEL', 'CARTON_LABEL', 'COURIER_LABEL', 'INTERNAL_LABEL', 'QR_LABEL', 'BARCODE_LABEL'],
        labelFormats: ['PDF', 'ZPL', 'PNG', 'DPL'],
        printStatuses: ['PENDING', 'PRINTED', 'FAILED'],
        carrierIntegrations: ['Shiprocket', 'Blue Dart', 'Delhivery', 'DTDC', 'FedEx', 'DHL'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        pickingPrinciple: 'Picking is the heart of warehouse outbound — converting a Sales Order into a directed walk through the warehouse, where the picker scans each Bin → Product → Batch → Tote in sequence, eliminating wrong-bin and wrong-batch errors. Six fulfillment types (RETAIL, WHOLESALE, DISTRIBUTOR, RESTAURANT_REPLENISHMENT, BRANCH_TRANSFER, EXPORT) drive different pick paths, priorities, and verification depth.',
        strategyPrinciple: 'Eight picking strategies optimize different order profiles: SINGLE_ORDER (one order, one picker, retail), BATCH (multiple orders of similar profile picked together), WAVE (orders released in waves by dispatch window), ZONE (picker owns a zone, tote passed zone-to-zone), PICK_AND_PASS (multi-zone orders passed between pickers), CART (cart-mounted mobile picking, batch of orders), CLUSTER (cluster-picking with multi-tote), PALLET (pallet-level picking for bulk). Each strategy minimizes a different cost — travel distance (SINGLE), per-order setup (BATCH/WAVE), zone expertise (ZONE), congestion (PICK_AND_PASS).',
        twoStageVerificationPrinciple: 'Two-Stage Barcode Verification is the Chief Architect recommendation. Stage 1 (Pick): picker scans Bin → Product → Batch → Tote in sequence. Each scan is matched against the expected value; mismatch blocks the line and raises an exception (WRONG_BIN, WRONG_PRODUCT, WRONG_BATCH). Stage 2 (Pack): packer re-scans each picked unit at the Packing Station; system cross-checks against the picking task before sealing. This two-stage verification drives picking accuracy from 75% (paper-based) to 99.4% (double-scan) and gives complete product genealogy: Sales Order → Picking Task → Picking Line → Packing Job → Carton → Shipping Label → Carrier Tracking.',
        packingStationPrinciple: 'Packing Stations are dedicated work cells equipped with label printer, scale, barcode scanner, and optional conveyor. Three station types — STANDARD (ambient), COLD (chilled 2-8°C), EXPORT (customs-doc ready) — match product handling requirements. Each station tracks max concurrent jobs, current jobs, and avg pack time. A station is AVAILABLE (idle), BUSY (one or more jobs active), MAINTENANCE (offline), or CLOSED.',
        packingJobPrinciple: 'A Packing Job is the bridge between Pick and Ship: it links a Picking Task to a Station and a Packer, requires second-scan verification, captures carton count, weight, volume, and photos, and ends with label printing. Status flow: PENDING → IN_PROGRESS → PACKED → LABELED → READY_TO_SHIP. Label-printed flag ensures no order leaves the warehouse without a printed shipping label.',
        cartonizationPrinciple: 'Cartonization Engine computes the optimal carton type for each packing job — STANDARD (30×20×20, 15kg), GIFT_BOX (25×25×15, 8kg premium), EXPORT (40×30×30, 25kg double-wall) — based on product dimensions, weight, and category. Each carton has a unique barcode and status flow: OPEN → SEALED → LABELED → LOADED → SHIPPED. Carton-level tracking means any unit can be located to its carton, and any carton to its packing job, picking task, and sales order.',
        shippingLabelPrinciple: 'Shipping Labels are the final hand-off to the carrier. Four label types — ORDER_LABEL (one per order), CARTON_LABEL (one per carton), COURIER_LABEL (carrier-specific format), PALLET_LABEL (pallet-level for wholesale) — support PDF (standard printers) and ZPL (Zebra thermal printers). Future carrier integrations: Shiprocket (multi-carrier aggregator), Blue Dart (air priority), Delhivery (surface + air), DTDC (pan-India), FedEx (international express), DHL (international standard).',
        endpoints: ['GET /api/wms-picking-tasks', 'POST /api/wms-picking-tasks', 'POST /api/wms-picking-tasks/:id/complete', 'GET /api/packing-stations', 'GET /api/packing-jobs', 'POST /api/packing-jobs/:id/complete', 'GET /api/carton-types', 'GET /api/cartons', 'GET /api/shipping-labels', 'GET /api/wms-fulfillment/dashboard', 'GET /api/wms-fulfillment/info'],
        part4Begun: true,
        part4Sprint: 5,
        part4Sprints: 12,
        part4Tables: 31,
      }, 'SUOP Picking, Packing & Order Fulfillment Engine v26.0.0')), { headers })
    }

    // ════════════════════════════════════════════════════════════════════
    // SPRINT 27 — Dispatch, Shipping & Load Management Engine
    // ════════════════════════════════════════════════════════════════════

    // ─── Dispatch Orders ──────────────────────────────────
    // GET /api/dispatch-orders (with type/status/warehouse filters)
    if (path === '/api/dispatch-orders' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const warehouseFilter = url.searchParams.get('warehouse')
      let orders = DISPATCH_DATA.dispatchOrders
      if (typeFilter) orders = orders.filter(o => o.dispatchType === typeFilter.toUpperCase())
      if (statusFilter) orders = orders.filter(o => o.status === statusFilter.toUpperCase())
      if (warehouseFilter) orders = orders.filter(o => o.warehouseId === warehouseFilter || o.warehouseName.toLowerCase().includes(warehouseFilter.toLowerCase()))
      return new Response(JSON.stringify(successResponse(orders, `${orders.length} dispatch orders`)), { headers })
    }

    // POST /api/dispatch-orders
    if (path === '/api/dispatch-orders' && method === 'POST') {
      let body: any
      try { body = await req.json() } catch { return new Response(JSON.stringify(errorResponse('Invalid JSON body', 'BAD_REQUEST', 400)), { status: 400, headers }) }
      if (!body.dispatchNumber || !body.dispatchType || !body.warehouseName) {
        return new Response(JSON.stringify(errorResponse('dispatchNumber, dispatchType, warehouseName are required', 'VALIDATION_ERROR', 400)), { status: 400, headers })
      }
      const newOrder: any = {
        id: `do-${String(DISPATCH_DATA.dispatchOrders.length + 1).padStart(3, '0')}`,
        dispatchNumber: body.dispatchNumber,
        dispatchDate: body.dispatchDate || new Date().toISOString(),
        dispatchType: body.dispatchType,
        warehouseId: body.warehouseId || 'wh-fg-mum',
        warehouseName: body.warehouseName,
        partnerId: body.partnerId || null,
        partnerName: body.partnerName || null,
        referenceType: body.referenceType || null,
        referenceNumber: body.referenceNumber || null,
        vehicleId: body.vehicleId || null,
        vehicleNumber: body.vehicleNumber || null,
        driverName: body.driverName || null,
        driverPhone: body.driverPhone || null,
        carrierName: body.carrierName || null,
        routeId: body.routeId || null,
        routeName: body.routeName || null,
        deliverySequence: body.deliverySequence || null,
        priority: body.priority || 'NORMAL',
        status: body.status || 'PLANNED',
        totalOrders: body.totalOrders || 0,
        totalLines: body.totalLines || 0,
        totalCartons: body.totalCartons || 0,
        totalPallets: body.totalPallets || 0,
        totalQty: body.totalQty || 0,
        totalWeightKg: body.totalWeightKg || 0,
        totalVolumeM3: body.totalVolumeM3 || 0,
        plannedDispatchAt: body.plannedDispatchAt || null,
        loadingStartedAt: null, loadingCompletedAt: null, sealedAt: null, gateExitAt: null, dispatchedAt: null, loadingDurationMin: null,
        createdById: 'usr-ds-01', createdByName: 'Dispatch Planner — Anjali Shah',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      DISPATCH_DATA.dispatchOrders.push(newOrder)
      log('info', 'Dispatch order created', { dispatchNumber: newOrder.dispatchNumber, type: newOrder.dispatchType })
      return new Response(JSON.stringify(successResponse(newOrder, `Dispatch order ${newOrder.dispatchNumber} created`)), { status: 201, headers })
    }

    // POST /api/dispatch-orders/:id/complete
    if (path.startsWith('/api/dispatch-orders/') && path.endsWith('/complete') && method === 'POST') {
      const id = path.replace('/api/dispatch-orders/', '').replace('/complete', '')
      const order = DISPATCH_DATA.dispatchOrders.find(o => o.id === id)
      if (!order) return new Response(JSON.stringify(errorResponse('Dispatch order not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (order.status !== 'LOADING' && order.status !== 'LOADED') {
        return new Response(JSON.stringify(errorResponse(`Cannot complete dispatch in status ${order.status}. Must be LOADING or LOADED.`, 'INVALID_STATUS', 400)), { status: 400, headers })
      }
      order.loadingCompletedAt = new Date().toISOString()
      if (order.loadingStartedAt) {
        order.loadingDurationMin = Math.round((new Date(order.loadingCompletedAt).getTime() - new Date(order.loadingStartedAt).getTime()) / 60000)
      }
      order.status = 'LOADED'
      order.updatedAt = new Date().toISOString()
      log('info', 'Dispatch order loading completed', { dispatchNumber: order.dispatchNumber, durationMin: order.loadingDurationMin })
      return new Response(JSON.stringify(successResponse(order, `Dispatch ${order.dispatchNumber} loading complete — status LOADED`)), { headers })
    }

    // ─── Dispatch Vehicles ────────────────────────────────
    // GET /api/dispatch-vehicles (with type/status/ownership filters)
    if (path === '/api/dispatch-vehicles' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      const ownershipFilter = url.searchParams.get('ownership')
      let vehicles = DISPATCH_DATA.dispatchVehicles
      if (typeFilter) vehicles = vehicles.filter(v => v.vehicleType === typeFilter.toUpperCase())
      if (statusFilter) vehicles = vehicles.filter(v => v.status === statusFilter.toUpperCase())
      if (ownershipFilter) vehicles = vehicles.filter(v => v.ownershipType === ownershipFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(vehicles, `${vehicles.length} dispatch vehicles`)), { headers })
    }

    // ─── Load Plans ───────────────────────────────────────
    // GET /api/load-plans
    if (path === '/api/load-plans' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let plans = DISPATCH_DATA.loadPlans
      if (statusFilter) plans = plans.filter(p => p.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(plans, `${plans.length} load plans`)), { headers })
    }

    // ─── Shipping Documents ───────────────────────────────
    // GET /api/shipping-documents (with type/status filter)
    if (path === '/api/shipping-documents' && method === 'GET') {
      const typeFilter = url.searchParams.get('type')
      const statusFilter = url.searchParams.get('status')
      let docs = DISPATCH_DATA.shippingDocuments
      if (typeFilter) docs = docs.filter(d => d.documentType === typeFilter.toUpperCase())
      if (statusFilter) docs = docs.filter(d => d.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(docs, `${docs.length} shipping documents`)), { headers })
    }

    // ─── Vehicle Seals ────────────────────────────────────
    // GET /api/vehicle-seals
    if (path === '/api/vehicle-seals' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let seals = DISPATCH_DATA.vehicleSeals
      if (statusFilter) seals = seals.filter(s => s.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(seals, `${seals.length} vehicle seals`)), { headers })
    }

    // ─── Gate Exit Logs ───────────────────────────────────
    // GET /api/gate-exit-logs
    if (path === '/api/gate-exit-logs' && method === 'GET') {
      const statusFilter = url.searchParams.get('status')
      let logs = DISPATCH_DATA.gateExitLogs
      if (statusFilter) logs = logs.filter(g => g.status === statusFilter.toUpperCase())
      return new Response(JSON.stringify(successResponse(logs, `${logs.length} gate exit logs`)), { headers })
    }

    // POST /api/gate-exit-logs/:id/approve
    if (path.startsWith('/api/gate-exit-logs/') && path.endsWith('/approve') && method === 'POST') {
      const id = path.replace('/api/gate-exit-logs/', '').replace('/approve', '')
      const gel = DISPATCH_DATA.gateExitLogs.find(g => g.id === id)
      if (!gel) return new Response(JSON.stringify(errorResponse('Gate exit log not found', 'NOT_FOUND', 404)), { status: 404, headers })
      if (gel.status !== 'PENDING' && gel.status !== 'VERIFIED') {
        return new Response(JSON.stringify(errorResponse(`Cannot approve gate exit in status ${gel.status}. Must be PENDING or VERIFIED.`, 'INVALID_STATUS', 400)), { status: 400, headers })
      }
      if (!gel.sealVerified || !gel.documentsVerified || !gel.vehicleInspected) {
        return new Response(JSON.stringify(errorResponse('Cannot approve — all verification checks must pass (seal, documents, vehicle inspection)', 'VERIFICATION_INCOMPLETE', 400)), { status: 400, headers })
      }
      gel.status = 'APPROVED'
      gel.exitTime = new Date().toISOString()
      gel.approvedById = 'usr-sec-02'
      gel.approvedByName = 'Security Manager — Deepak Nair'
      // Auto-transition to EXITED
      gel.status = 'EXITED'
      // Also mark the related dispatch order's gateExitAt and dispatchedAt
      const order = DISPATCH_DATA.dispatchOrders.find(o => o.id === gel.dispatchOrderId)
      if (order) {
        order.gateExitAt = gel.exitTime
        order.dispatchedAt = gel.exitTime
        order.status = 'DISPATCHED'
        order.updatedAt = gel.exitTime
      }
      log('info', 'Gate exit approved', { exitNumber: gel.exitNumber, dispatchNumber: gel.dispatchNumber, status: gel.status })
      return new Response(JSON.stringify(successResponse(gel, `Gate exit ${gel.exitNumber} approved — vehicle EXITED`)), { headers })
    }

    // ─── Dispatch Dashboard ───────────────────────────────
    // GET /api/dispatch/dashboard
    if (path === '/api/dispatch/dashboard' && method === 'GET') {
      const totalOrders = DISPATCH_DATA.dispatchOrders.length
      const planned = DISPATCH_DATA.dispatchOrders.filter(o => o.status === 'PLANNED').length
      const vehicleAssigned = DISPATCH_DATA.dispatchOrders.filter(o => o.status === 'VEHICLE_ASSIGNED').length
      const loading = DISPATCH_DATA.dispatchOrders.filter(o => o.status === 'LOADING').length
      const loaded = DISPATCH_DATA.dispatchOrders.filter(o => o.status === 'LOADED').length
      const sealed = DISPATCH_DATA.dispatchOrders.filter(o => o.status === 'SEALED').length
      const dispatched = DISPATCH_DATA.dispatchOrders.filter(o => o.status === 'DISPATCHED').length
      const totalVehicles = DISPATCH_DATA.dispatchVehicles.length
      const availableVehicles = DISPATCH_DATA.dispatchVehicles.filter(v => v.status === 'AVAILABLE').length
      const assignedVehicles = DISPATCH_DATA.dispatchVehicles.filter(v => v.status === 'ASSIGNED').length
      const loadingVehicles = DISPATCH_DATA.dispatchVehicles.filter(v => v.status === 'LOADING' || v.status === 'LOADED').length
      const inTransitVehicles = DISPATCH_DATA.dispatchVehicles.filter(v => v.status === 'IN_TRANSIT').length
      const totalLoadPlans = DISPATCH_DATA.loadPlans.length
      const completedLoadPlans = DISPATCH_DATA.loadPlans.filter(p => p.status === 'COMPLETED').length
      const totalShippingDocs = DISPATCH_DATA.shippingDocuments.length
      const pendingDocs = DISPATCH_DATA.shippingDocuments.filter(d => d.status === 'PENDING').length
      const generatedDocs = DISPATCH_DATA.shippingDocuments.filter(d => d.status === 'GENERATED').length
      const printedDocs = DISPATCH_DATA.shippingDocuments.filter(d => d.status === 'PRINTED').length
      const sentDocs = DISPATCH_DATA.shippingDocuments.filter(d => d.status === 'SENT').length
      const totalSeals = DISPATCH_DATA.vehicleSeals.length
      const appliedSeals = DISPATCH_DATA.vehicleSeals.filter(s => s.status === 'APPLIED').length
      const verifiedSeals = DISPATCH_DATA.vehicleSeals.filter(s => s.status === 'VERIFIED').length
      const totalGateExits = DISPATCH_DATA.gateExitLogs.length
      const pendingGateExits = DISPATCH_DATA.gateExitLogs.filter(g => g.status === 'PENDING').length
      const exitedGateExits = DISPATCH_DATA.gateExitLogs.filter(g => g.status === 'EXITED').length
      const byDispatchType: Record<string, number> = {}
      DISPATCH_DATA.dispatchOrders.forEach(o => { byDispatchType[o.dispatchType] = (byDispatchType[o.dispatchType] || 0) + 1 })
      const byDispatchStatus: Record<string, number> = {}
      DISPATCH_DATA.dispatchOrders.forEach(o => { byDispatchStatus[o.status] = (byDispatchStatus[o.status] || 0) + 1 })
      const byVehicleType: Record<string, number> = {}
      DISPATCH_DATA.dispatchVehicles.forEach(v => { byVehicleType[v.vehicleType] = (byVehicleType[v.vehicleType] || 0) + 1 })
      const byOwnershipType: Record<string, number> = {}
      DISPATCH_DATA.dispatchVehicles.forEach(v => { byOwnershipType[v.ownershipType] = (byOwnershipType[v.ownershipType] || 0) + 1 })
      const byDocType: Record<string, number> = {}
      DISPATCH_DATA.shippingDocuments.forEach(d => { byDocType[d.documentType] = (byDocType[d.documentType] || 0) + 1 })
      const byDocStatus: Record<string, number> = {}
      DISPATCH_DATA.shippingDocuments.forEach(d => { byDocStatus[d.status] = (byDocStatus[d.status] || 0) + 1 })
      const loadedOrdersWithDuration = DISPATCH_DATA.dispatchOrders.filter(o => o.loadingDurationMin !== null) as any[]
      const avgLoadingTime = loadedOrdersWithDuration.length > 0 ? Math.round(loadedOrdersWithDuration.reduce((s, o) => s + (o.loadingDurationMin as number), 0) / loadedOrdersWithDuration.length) : 0
      const plansWithUtil = DISPATCH_DATA.loadPlans as any[]
      const avgWeightUtil = plansWithUtil.length > 0 ? Math.round(plansWithUtil.reduce((s, p) => s + (p.weightUtilization as number) * 100, 0) / plansWithUtil.length) : 0
      const avgVolumeUtil = plansWithUtil.length > 0 ? Math.round(plansWithUtil.reduce((s, p) => s + (p.volumeUtilization as number) * 100, 0) / plansWithUtil.length) : 0
      return new Response(JSON.stringify(successResponse({
        summary: {
          totalOrders, planned, vehicleAssigned, loading, loaded, sealed, dispatched,
          totalVehicles, availableVehicles, assignedVehicles, loadingVehicles, inTransitVehicles,
          totalLoadPlans, completedLoadPlans,
          totalShippingDocs, pendingDocs, generatedDocs, printedDocs, sentDocs,
          totalSeals, appliedSeals, verifiedSeals,
          totalGateExits, pendingGateExits, exitedGateExits,
        },
        avgLoadingTimeMin: avgLoadingTime,
        avgWeightUtilization: avgWeightUtil,
        avgVolumeUtilization: avgVolumeUtil,
        onTimeDispatchPercent: 94.2,
        vehicleFillPercent: avgWeightUtil,
        ordersByDispatchType: byDispatchType,
        ordersByStatus: byDispatchStatus,
        vehiclesByType: byVehicleType,
        vehiclesByOwnership: byOwnershipType,
        documentsByType: byDocType,
        documentsByStatus: byDocStatus,
        dispatchFlow: ['Packed Orders', 'Dispatch Planning', 'Vehicle Assignment', 'Loading', 'Barcode Verification', 'Seal Vehicle', 'Gate Exit', 'Carrier', 'Customer'],
        vehicleLoadVerification: ['Loading Complete', 'Scan Every Pallet', 'Scan Vehicle', 'Verify Dispatch Plan', 'Generate Manifest', 'Apply Seal', 'Security Gate Verification', 'Vehicle Exit'],
        dispatchTypes: ['RETAIL_DISPATCH', 'DISTRIBUTOR_DISPATCH', 'RESTAURANT_REPLENISHMENT', 'BRANCH_TRANSFER', 'EXPORT_SHIPMENT', 'COURIER_SHIPMENT', 'DIRECT_DELIVERY', 'CUSTOMER_PICKUP', 'VENDOR_RETURN'],
        dispatchStatuses: ['PLANNED', 'VEHICLE_ASSIGNED', 'LOADING', 'LOADED', 'SEALED', 'GATE_EXIT', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'EXCEPTION'],
        vehicleTypes: ['TRUCK', 'CONTAINER', 'TEMPO', 'VAN', 'REFRIGERATED', 'FLATBED', 'MINI_TRUCK'],
        vehicleStatuses: ['AVAILABLE', 'ASSIGNED', 'LOADING', 'LOADED', 'IN_TRANSIT', 'MAINTENANCE', 'OFFLINE'],
        ownershipTypes: ['OWN_FLEET', 'THIRD_PARTY', 'COURIER', 'RENTAL'],
        sealTypes: ['BOLT', 'CABLE', 'ELECTRONIC', 'TAMPER_PROOF'],
        sealStatuses: ['APPLIED', 'VERIFIED', 'BROKEN', 'REMOVED'],
        loadPlanStatuses: ['PLANNED', 'OPTIMIZED', 'LOADING', 'COMPLETED', 'CANCELLED'],
        documentTypes: ['DELIVERY_CHALLAN', 'TAX_INVOICE_REF', 'PACKING_LIST', 'DELIVERY_MANIFEST', 'EXPORT_DOCUMENTS', 'TRANSPORT_RECEIPT', 'E_WAY_BILL_REF'],
        documentStatuses: ['PENDING', 'GENERATED', 'PRINTED', 'SENT', 'VOID'],
        gateExitStatuses: ['PENDING', 'VERIFIED', 'APPROVED', 'EXITED', 'DENIED'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        sprint: 27,
        chiefArchitectNote: 'Vehicle Load Verification is the Chief Architect recommendation: after Loading Complete, the loading supervisor scans every pallet barcode against the dispatch plan, then scans the vehicle number to confirm the right vehicle is loaded, then verifies the dispatch plan matches the loaded cartons/pallets, then generates the delivery manifest, then applies the seal, then security does the gate verification, then vehicle exits. This eight-step chain ensures zero wrong-vehicle and zero wrong-load dispatches and gives complete genealogy: Sales Order → Picking Task → Packing Job → Carton → Dispatch Order → Vehicle → Seal → Gate Exit → Carrier Tracking → Customer Delivery.',
      }, 'Dispatch, Shipping & Load Management dashboard')), { headers })
    }

    // ─── Dispatch Info ────────────────────────────────────
    // GET /api/dispatch/info
    if (path === '/api/dispatch/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Dispatch, Shipping & Load Management Engine', version: '27.0.0', sprint: 27,
        sprintName: 'Dispatch, Shipping & Load Management Engine',
        dispatchTypes: ['RETAIL_DISPATCH', 'DISTRIBUTOR_DISPATCH', 'RESTAURANT_REPLENISHMENT', 'BRANCH_TRANSFER', 'EXPORT_SHIPMENT', 'COURIER_SHIPMENT', 'DIRECT_DELIVERY', 'CUSTOMER_PICKUP', 'VENDOR_RETURN'],
        dispatchStatuses: ['PLANNED', 'VEHICLE_ASSIGNED', 'LOADING', 'LOADED', 'SEALED', 'GATE_EXIT', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'EXCEPTION'],
        vehicleTypes: ['TRUCK', 'CONTAINER', 'TEMPO', 'VAN', 'REFRIGERATED', 'FLATBED', 'MINI_TRUCK'],
        vehicleStatuses: ['AVAILABLE', 'ASSIGNED', 'LOADING', 'LOADED', 'IN_TRANSIT', 'MAINTENANCE', 'OFFLINE'],
        ownershipTypes: ['OWN_FLEET', 'THIRD_PARTY', 'COURIER', 'RENTAL'],
        sealTypes: ['BOLT', 'CABLE', 'ELECTRONIC', 'TAMPER_PROOF'],
        sealStatuses: ['APPLIED', 'VERIFIED', 'BROKEN', 'REMOVED'],
        loadPlanStatuses: ['PLANNED', 'OPTIMIZED', 'LOADING', 'COMPLETED', 'CANCELLED'],
        documentTypes: ['DELIVERY_CHALLAN', 'TAX_INVOICE_REF', 'PACKING_LIST', 'DELIVERY_MANIFEST', 'EXPORT_DOCUMENTS', 'TRANSPORT_RECEIPT', 'E_WAY_BILL_REF'],
        documentStatuses: ['PENDING', 'GENERATED', 'PRINTED', 'SENT', 'VOID'],
        gateExitStatuses: ['PENDING', 'VERIFIED', 'APPROVED', 'EXITED', 'DENIED'],
        priorities: ['EMERGENCY', 'HIGH', 'NORMAL', 'LOW'],
        dispatchOrderPrinciple: 'A Dispatch Order is the consolidated outbound shipment that aggregates packed cartons from one or more Packing Jobs into a single vehicle movement. Nine dispatch types cover every outbound scenario: RETAIL_DISPATCH (store replenishment), DISTRIBUTOR_DISPATCH (wholesale), RESTAURANT_REPLENISHMENT (cold chain), BRANCH_TRANSFER (inter-branch), EXPORT_SHIPMENT (customs + port), COURIER_SHIPMENT (last-mile air), DIRECT_DELIVERY (B2B direct), CUSTOMER_PICKUP (will-call), VENDOR_RETURN (return to supplier). Status flow: PLANNED → VEHICLE_ASSIGNED → LOADING → LOADED → SEALED → GATE_EXIT → DISPATCHED → DELIVERED.',
        vehicleManagementPrinciple: 'Dispatch Vehicles are the physical carriers — TRUCK (general), CONTAINER (sealed export), REFRIGERATED (cold chain 2-8°C), TEMPO (light intra-city), FLATBED (heavy pallets). Four ownership models: OWN_FLEET (company trucks, blue badge), THIRD_PARTY (VRL/DHL/etc., amber badge), COURIER (Delhivery/Blue Dart, purple badge), RENTAL (per-trip rental, gray badge). Each vehicle tracks capacity (weight, volume, pallets), temperature control, driver + helper, GPS device, and utilization metrics.',
        loadPlanningPrinciple: 'Load Plan computes the optimal loading sequence for each dispatch order — which carton goes on first (back of truck), which last (front, for first delivery). Weight utilization, volume utilization, and pallet positions are tracked against the vehicle max. Three-step load plan: (1) compute total weight/volume vs vehicle capacity, (2) generate loading sequence (back-to-front for multi-stop routes), (3) verify pallet positions. Status: PLANNED → OPTIMIZED → LOADING → COMPLETED.',
        shippingDocumentationPrinciple: 'Shipping Documents are the legal & operational paperwork accompanying each dispatch. Seven document types: DELIVERY_CHALLAN (DC — internal proof of movement), TAX_INVOICE_REF (GST invoice reference), PACKING_LIST (carton-level detail for receiver), DELIVERY_MANIFEST (carrier hand-off document), EXPORT_DOCUMENTS (customs + port), TRANSPORT_RECEIPT (LR/GR), E_WAY_BILL_REF (GSTN e-way bill). Status: PENDING → GENERATED → PRINTED → SENT.',
        vehicleSealPrinciple: 'Vehicle Seals are tamper-evidence devices applied after loading complete. Four seal types: BOLT (steel bolt, single-use), CABLE (steel cable loop), ELECTRONIC (RFID-tagged, real-time GPS), TAMPER_PROOF (numbered plastic, broken-once). Seal workflow: APPLIED (loading supervisor applies seal at dock) → VERIFIED (security officer verifies seal number at gate) → BROKEN (broken only at delivery, with reason) → REMOVED (after delivery confirmation). A verified seal means the vehicle has not been opened since leaving the dock.',
        gateExitPrinciple: 'Gate Exit is the final checkpoint before vehicle leaves the warehouse premises. Security officer verifies: (1) seal intact & number matches, (2) shipping documents printed & attached, (3) vehicle inspection (driver license, vehicle number, no unauthorized cargo). Only after all three checks pass does the gate open. Status: PENDING (awaiting inspection) → VERIFIED (security checks done) → APPROVED (gate manager approves) → EXITED (vehicle has left) — or DENIED if any check fails.',
        vehicleLoadVerificationPrinciple: 'Vehicle Load Verification is the Chief Architect recommendation for Sprint 27. After Loading Complete, the loading supervisor follows an 8-step verification chain: (1) Loading Complete confirmed, (2) Scan Every Pallet barcode against dispatch plan, (3) Scan Vehicle number to confirm right vehicle loaded, (4) Verify Dispatch Plan matches loaded cartons/pallets, (5) Generate Delivery Manifest, (6) Apply Vehicle Seal, (7) Security Gate Verification (seal + docs + vehicle inspection), (8) Vehicle Exit. This chain ensures zero wrong-vehicle and zero wrong-load dispatches and gives complete genealogy: Sales Order → Picking Task → Packing Job → Carton → Dispatch Order → Vehicle → Seal → Gate Exit → Carrier Tracking → Customer Delivery.',
        endpoints: ['GET /api/dispatch-orders', 'POST /api/dispatch-orders', 'POST /api/dispatch-orders/:id/complete', 'GET /api/dispatch-vehicles', 'GET /api/load-plans', 'GET /api/shipping-documents', 'GET /api/vehicle-seals', 'GET /api/gate-exit-logs', 'POST /api/gate-exit-logs/:id/approve', 'GET /api/dispatch/dashboard', 'GET /api/dispatch/info'],
        part4Begun: true,
        part4Sprint: 6,
        part4Sprints: 12,
        part4Tables: 38,
      }, 'SUOP Dispatch, Shipping & Load Management Engine v27.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 28 — WAVE PLANNING & TASK ORCHESTRATION ENDPOINTS
    // ═════════════════════════════════════════════════════════

    // GET /api/warehouse-waves — List all waves
    if (path === '/api/warehouse-waves' && method === 'GET') {
      const waves = [
        { id: 'ww-001', waveNumber: 'WAVE-2026-001', waveType: 'MULTI_ORDER', strategy: 'FIFO', priority: 'HIGH', priorityScore: 80, status: 'IN_PROGRESS', warehouseId: 'wh-001', warehouseName: 'WH-MUM-MAIN', zoneName: 'C-Picking', totalOrders: 24, totalLines: 156, totalTasks: 42, plannedStart: '2026-07-09T03:30:00Z', plannedFinish: '2026-07-09T06:00:00Z', actualStart: '2026-07-09T03:32:00Z', progress: 64, assignedOperatorIds: ['op-001', 'op-003'], requiredEquipment: ['FORKLIFT'], optimizationScore: 87 },
        { id: 'ww-002', waveNumber: 'WAVE-2026-002', waveType: 'CARRIER', strategy: 'PRIORITY', priority: 'NORMAL', priorityScore: 50, status: 'RELEASED', warehouseId: 'wh-001', warehouseName: 'WH-MUM-MAIN', zoneName: 'C-Picking', totalOrders: 18, totalLines: 89, totalTasks: 28, plannedStart: '2026-07-09T06:00:00Z', plannedFinish: '2026-07-09T08:00:00Z', actualStart: null, progress: 0, assignedOperatorIds: [], requiredEquipment: ['FORKLIFT'] },
        { id: 'ww-004', waveNumber: 'WAVE-2026-004', waveType: 'EMERGENCY', strategy: 'PRIORITY', priority: 'EMERGENCY', priorityScore: 100, status: 'IN_PROGRESS', warehouseId: 'wh-001', warehouseName: 'WH-MUM-MAIN', zoneName: 'C-Picking', totalOrders: 4, totalLines: 22, totalTasks: 8, plannedStart: '2026-07-09T04:45:00Z', plannedFinish: '2026-07-09T05:15:00Z', actualStart: '2026-07-09T04:44:00Z', progress: 88, assignedOperatorIds: ['op-003'], requiredEquipment: ['FORKLIFT', 'SCANNER'] },
      ]
      return new Response(JSON.stringify(successResponse(waves, 'Waves retrieved')), { headers })
    }

    // POST /api/warehouse-waves — Create wave
    if (path === '/api/warehouse-waves' && method === 'POST') {
      const body = await req.json()
      const wave = {
        id: `ww-${Date.now()}`,
        waveNumber: `WAVE-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        waveType: body.waveType || 'MULTI_ORDER',
        strategy: body.strategy || 'FIFO',
        priority: body.priority || 'NORMAL',
        priorityScore: body.priority === 'EMERGENCY' ? 100 : body.priority === 'HIGH' ? 80 : 50,
        status: 'DRAFT',
        warehouseId: body.warehouseId,
        warehouseName: body.warehouseName,
        totalOrders: 0, totalLines: 0, totalTasks: 0,
        plannedStart: body.plannedStart, plannedFinish: body.plannedFinish,
        createdAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(wave, 'Wave created')), { status: 201, headers })
    }

    // POST /api/warehouse-waves/:id/release — Release wave (auto-generates tasks)
    if (path.match(/^\/api\/warehouse-waves\/[\w-]+\/release$/) && method === 'POST') {
      const waveId = path.split('/')[3]
      const result = {
        waveId,
        status: 'RELEASED',
        tasksGenerated: Math.floor(Math.random() * 40) + 10,
        operatorsAutoAssigned: Math.floor(Math.random() * 5) + 2,
        equipmentAllocated: Math.floor(Math.random() * 3) + 1,
        releasedAt: new Date().toISOString(),
        message: 'Wave released — tasks generated and operators auto-assigned by skill+workload algorithm',
      }
      return new Response(JSON.stringify(successResponse(result, 'Wave released')), { headers })
    }

    // GET /api/warehouse-tasks — List all warehouse tasks
    if (path === '/api/warehouse-tasks' && method === 'GET') {
      const tasks = [
        { id: 'wt-001', taskNumber: 'TASK-2026-001', taskType: 'PICK', priority: 'EMERGENCY', priorityScore: 100, status: 'IN_PROGRESS', waveId: 'ww-004', waveNumber: 'WAVE-2026-004', warehouseId: 'wh-001', fromLocationCode: 'C-02-03-A', toLocationCode: 'PK-01', assignedOperatorId: 'op-003', assignedOperatorName: 'Suresh Mehta', assignedEquipmentCode: 'FL-002', slaDeadline: '2026-07-09T05:15:00Z', slaViolated: false, progress: 75, plannedQty: '24', actualQty: '18' },
        { id: 'wt-002', taskNumber: 'TASK-2026-002', taskType: 'PUTAWAY', priority: 'HIGH', priorityScore: 80, status: 'ASSIGNED', waveId: null, warehouseId: 'wh-001', fromLocationCode: 'RECV-01', toLocationCode: 'B-01-02-C', assignedOperatorId: 'op-005', assignedOperatorName: 'Ramesh Patel', assignedEquipmentCode: 'FL-001', slaDeadline: '2026-07-09T06:00:00Z', slaViolated: false, progress: 0, plannedQty: '100' },
        { id: 'wt-003', taskNumber: 'TASK-2026-003', taskType: 'PICK', priority: 'HIGH', priorityScore: 80, status: 'OPEN', waveId: 'ww-001', waveNumber: 'WAVE-2026-001', warehouseId: 'wh-001', fromLocationCode: 'C-03-01-B', toLocationCode: 'PK-02', assignedOperatorId: null, slaDeadline: '2026-07-09T06:00:00Z', slaViolated: false, progress: 0, plannedQty: '48' },
        { id: 'wt-009', taskNumber: 'TASK-2026-009', taskType: 'PICK', priority: 'EMERGENCY', priorityScore: 100, status: 'ESCALATED', waveId: 'ww-004', waveNumber: 'WAVE-2026-004', warehouseId: 'wh-001', fromLocationCode: 'C-04-02-A', toLocationCode: 'PK-03', assignedOperatorId: null, slaDeadline: '2026-07-09T05:00:00Z', slaViolated: true, progress: 0, plannedQty: '6' },
      ]
      return new Response(JSON.stringify(successResponse(tasks, 'Warehouse tasks retrieved')), { headers })
    }

    // POST /api/warehouse-tasks/:id/assign — Auto-assign task to best operator
    if (path.match(/^\/api\/warehouse-tasks\/[\w-]+\/assign$/) && method === 'POST') {
      const taskId = path.split('/')[3]
      const assignment = {
        taskId,
        assignedOperatorId: 'op-001',
        assignedOperatorName: 'Rajesh Kumar',
        assignedEquipmentId: 'eq-001',
        assignedEquipmentCode: 'FL-001',
        assignmentStrategy: 'AUTO_WORKLOAD_SKILL_DISTANCE',
        assignmentScore: 92,
        reason: 'Best match — skill level EXPERT, current workload 65% (capacity 35%), zone C-Picking match, distance 12m',
        assignedAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(assignment, 'Task auto-assigned')), { headers })
    }

    // POST /api/warehouse-tasks/:id/complete — Complete task
    if (path.match(/^\/api\/warehouse-tasks\/[\w-]+\/complete$/) && method === 'POST') {
      const taskId = path.split('/')[3]
      const body = await req.json().catch(() => ({}))
      const result = {
        taskId,
        status: 'COMPLETED',
        actualFinish: new Date().toISOString(),
        actualQty: body.actualQty || null,
        durationSeconds: body.durationSeconds || null,
        nextTaskId: `wt-${Math.floor(Math.random() * 9000) + 1000}`,
        nextTaskNumber: `TASK-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        message: 'Task completed — next highest-priority task auto-pushed to operator',
      }
      return new Response(JSON.stringify(successResponse(result, 'Task completed')), { headers })
    }

    // GET /api/warehouse-operators — List operators with workload
    if (path === '/api/warehouse-operators' && method === 'GET') {
      const operators = [
        { id: 'op-001', operatorCode: 'OP-001', fullName: 'Rajesh Kumar', skillLevel: 'EXPERT', overallRating: 92, status: 'ACTIVE', isOnline: true, primaryShiftId: 'sh-001', homeWarehouseName: 'WH-MUM-MAIN', primaryZoneName: 'C-Picking', forkliftCertified: true, reachTruckCertified: true, stackerCertified: false, scannerCertified: true, tasksCompletedToday: 14, tasksCompletedWeek: 78, accuracyPercent: 98.5, utilizationPercent: 87 },
        { id: 'op-003', operatorCode: 'OP-003', fullName: 'Suresh Mehta', skillLevel: 'EXPERT', overallRating: 88, status: 'ACTIVE', isOnline: true, primaryShiftId: 'sh-001', homeWarehouseName: 'WH-MUM-MAIN', primaryZoneName: 'E-Dispatch', forkliftCertified: true, reachTruckCertified: true, stackerCertified: false, scannerCertified: true, tasksCompletedToday: 18, tasksCompletedWeek: 92, accuracyPercent: 99.1, utilizationPercent: 94 },
        { id: 'op-005', operatorCode: 'OP-005', fullName: 'Ramesh Patel', skillLevel: 'ADVANCED', overallRating: 79, status: 'ACTIVE', isOnline: false, primaryShiftId: 'sh-002', homeWarehouseName: 'WH-MUM-MAIN', primaryZoneName: 'B-Bulk', forkliftCertified: true, reachTruckCertified: false, stackerCertified: true, scannerCertified: true, tasksCompletedToday: 0, tasksCompletedWeek: 52, accuracyPercent: 95.5, utilizationPercent: 0 },
      ]
      return new Response(JSON.stringify(successResponse(operators, 'Operators retrieved')), { headers })
    }

    // GET /api/warehouse-equipment — List equipment with status
    if (path === '/api/warehouse-equipment' && method === 'GET') {
      const equipment = [
        { id: 'eq-001', equipmentCode: 'FL-001', equipmentType: 'FORKLIFT', make: 'Toyota', model: '8FBE15', status: 'IN_USE', batteryPercent: 78, currentOperatorId: 'op-001', currentOperatorName: 'Rajesh Kumar', currentTaskId: 'wt-002', warehouseId: 'wh-001', totalTasksDone: 342, totalOperatingHours: 1245.5, nextMaintenanceAt: '2026-09-15', requiredCertifications: ['FORKLIFT'] },
        { id: 'eq-002', equipmentCode: 'FL-002', equipmentType: 'FORKLIFT', make: 'Godrej', model: 'GXE-15T', status: 'IN_USE', batteryPercent: 62, currentOperatorId: 'op-003', currentOperatorName: 'Suresh Mehta', currentTaskId: 'wt-001', warehouseId: 'wh-001', totalTasksDone: 287, totalOperatingHours: 982.3, nextMaintenanceAt: '2026-09-20', requiredCertifications: ['FORKLIFT'] },
        { id: 'eq-005', equipmentCode: 'ST-001', equipmentType: 'STACKER', make: 'Godrej', model: 'GSX-10', status: 'CHARGING', batteryPercent: 23, currentOperatorId: null, warehouseId: 'wh-001', totalTasksDone: 198, totalOperatingHours: 734.1, nextMaintenanceAt: '2026-09-25', requiredCertifications: ['STACKER'] },
        { id: 'eq-008', equipmentCode: 'FL-004', equipmentType: 'FORKLIFT', make: 'Toyota', model: '8FBE15', status: 'MAINTENANCE', batteryPercent: 0, currentOperatorId: null, warehouseId: 'wh-001', totalTasksDone: 567, totalOperatingHours: 2104.7, nextMaintenanceAt: '2026-10-08', requiredCertifications: ['FORKLIFT'] },
      ]
      return new Response(JSON.stringify(successResponse(equipment, 'Equipment retrieved')), { headers })
    }

    // GET /api/warehouse-sla — List SLA configurations
    if (path === '/api/warehouse-sla' && method === 'GET') {
      const slas = [
        { id: 'sla-001', slaCode: 'SLA-RECV-01', slaName: 'Receiving SLA', taskType: 'RECEIVE', priority: 'NORMAL', targetMinutes: 60, warningMinutes: 48, criticalMinutes: 60, onTimePercent: 94, totalTasks: 156, violations: 9, penaltyAmount: 0 },
        { id: 'sla-003', slaCode: 'SLA-PICK-01', slaName: 'Picking SLA', taskType: 'PICK', priority: 'HIGH', targetMinutes: 30, warningMinutes: 24, criticalMinutes: 30, onTimePercent: 88, totalTasks: 412, violations: 49, penaltyAmount: 4500 },
        { id: 'sla-005', slaCode: 'SLA-DISP-01', slaName: 'Dispatch SLA', taskType: 'DISPATCH', priority: 'HIGH', targetMinutes: 90, warningMinutes: 72, criticalMinutes: 90, onTimePercent: 93, totalTasks: 178, violations: 12, penaltyAmount: 2800 },
      ]
      return new Response(JSON.stringify(successResponse(slas, 'SLA configurations retrieved')), { headers })
    }

    // GET /api/sla-violations — List SLA violations
    if (path === '/api/sla-violations' && method === 'GET') {
      const violations = [
        { id: 'sv-012', violationNumber: 'SLA-V-2026-012', slaCode: 'SLA-PICK-01', slaName: 'Picking SLA', taskId: 'wt-009', taskNumber: 'TASK-2026-009', taskType: 'PICK', operatorId: null, operatorName: null, severity: 'CRITICAL', overrunMinutes: 35, deadlineTime: '2026-07-09T05:00:00Z', violationTime: '2026-07-09T05:35:00Z', status: 'OPEN', penaltyApplied: false },
        { id: 'sv-011', violationNumber: 'SLA-V-2026-011', slaCode: 'SLA-RECV-01', slaName: 'Receiving SLA', taskId: 'wt-006', taskNumber: 'TASK-2026-006', taskType: 'RECEIVE', operatorId: 'op-007', operatorName: 'Anil Kumar', severity: 'MAJOR', overrunMinutes: 18, deadlineTime: '2026-07-09T07:00:00Z', violationTime: '2026-07-09T07:18:00Z', status: 'INVESTIGATING', penaltyApplied: false },
      ]
      return new Response(JSON.stringify(successResponse(violations, 'SLA violations retrieved')), { headers })
    }

    // GET /api/warehouse-exceptions — List exceptions
    if (path === '/api/warehouse-exceptions' && method === 'GET') {
      const exceptions = [
        { id: 'wex-018', exceptionNumber: 'EX-2026-018', exceptionType: 'TASK_FAILURE', sourceType: 'PICKING', taskId: 'wt-009', taskNumber: 'TASK-2026-009', waveNumber: 'WAVE-2026-004', severity: 'CRITICAL', status: 'OPEN', title: 'Operator unavailable for emergency pick', description: 'Auto-assignment engine could not find a certified operator within 200m of C-04-02-A. Manual intervention required.', impactLevel: 'MAJOR', affectedTasks: 1, estimatedDelayMinutes: 35, reportedAt: '2026-07-09T05:05:00Z', reportedByName: 'Auto-Engine' },
        { id: 'wex-016', exceptionNumber: 'EX-2026-016', exceptionType: 'EQUIPMENT_FAILURE', sourceType: 'EQUIPMENT', severity: 'HIGH', status: 'INVESTIGATING', title: 'FL-005 hydraulic failure during loading', description: 'Forklift FL-005 reported hydraulic pressure loss at DOCK-04 while loading pallet 3. Equipment moved to maintenance bay.', impactLevel: 'MAJOR', affectedTasks: 3, estimatedDelayMinutes: 45, reportedAt: '2026-07-09T04:35:00Z', reportedByName: 'Suresh Mehta' },
      ]
      return new Response(JSON.stringify(successResponse(exceptions, 'Exceptions retrieved')), { headers })
    }

    // POST /api/warehouse-exceptions/:id/resolve — Resolve exception
    if (path.match(/^\/api\/warehouse-exceptions\/[\w-]+\/resolve$/) && method === 'POST') {
      const exId = path.split('/')[3]
      const body = await req.json().catch(() => ({}))
      const result = {
        exceptionId: exId,
        status: 'RESOLVED',
        resolution: body.resolution || 'CLOSE',
        resolutionNotes: body.notes || 'Resolved by supervisor',
        resolvedAt: new Date().toISOString(),
        resolvedByName: body.resolvedByName || 'Supervisor',
      }
      return new Response(JSON.stringify(successResponse(result, 'Exception resolved')), { headers })
    }

    // GET /api/warehouse-control-tower — Live control tower data
    if (path === '/api/warehouse-control-tower' && method === 'GET') {
      const data = {
        kpis: {
          tasksPerHour: 42, targetTasksPerHour: 50,
          ordersPerHour: 18, targetOrdersPerHour: 20,
          avgCompletionMinutes: 4.2, targetCompletionMinutes: 3.5,
          operatorUtilization: 78, targetOperatorUtilization: 85,
          equipmentUtilization: 64, targetEquipmentUtilization: 70,
          warehouseEfficiency: 92, targetEfficiency: 95,
        },
        zoneHeatMap: [
          { zone: 'A-Receiving', load: 75, activeTasks: 6 },
          { zone: 'B-Bulk', load: 45, activeTasks: 3 },
          { zone: 'C-Picking', load: 92, activeTasks: 14 },
          { zone: 'D-Pack', load: 68, activeTasks: 8 },
          { zone: 'E-Dispatch', load: 88, activeTasks: 11 },
          { zone: 'F-Cold', load: 30, activeTasks: 2 },
        ],
        dockActivity: [
          { dock: 'DOCK-01', status: 'LOADING', vehicle: 'MH12-AB-1234', carrier: 'VRL Logistics', progress: 65 },
          { dock: 'DOCK-02', status: 'UNLOADING', vehicle: 'KA05-CD-5678', carrier: 'In-House', progress: 40 },
          { dock: 'DOCK-03', status: 'IDLE', vehicle: null, carrier: null, progress: 0 },
        ],
        onlineOperators: 7,
        offlineOperators: 1,
        openExceptions: 3,
        criticalAlerts: 1,
        timestamp: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, 'Control tower live data')), { headers })
    }

    // GET /api/wave-planning/info — Sprint 28 info
    if (path === '/api/wave-planning/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 28,
        sprintName: 'Enterprise Wave Planning, Task Orchestration & Workforce Management Engine',
        version: '28.0.0',
        part: 4,
        tables: 16,
        epics: [
          'Epic 1: Wave Planning Engine (8 wave types, 5 strategies)',
          'Epic 2: Warehouse Task Engine (10 task types)',
          'Epic 3: Dynamic Task Assignment (skill + workload + distance + zone + shift)',
          'Epic 4: Workforce Management (shifts, attendance, KPIs)',
          'Epic 5: Equipment Management (forklifts, reach trucks, scanners)',
          'Epic 6: SLA Monitoring (7 task types, 4 severity levels)',
          'Epic 7: Exception Management (11 exception types, escalation matrix)',
          'Epic 8: Warehouse Control Tower (live KPIs, heat map, dock, yard)',
        ],
        domainEvents: ['WaveCreated', 'WaveReleased', 'TaskAssigned', 'TaskCompleted', 'OperatorAssigned', 'EquipmentAllocated', 'SLAViolated', 'ExceptionRaised'],
        wavePlanningPrinciple: 'Wave Planning groups orders into manageable batches for efficient picking. SUOP supports 8 wave types: SINGLE_ORDER (emergency/VIP), MULTI_ORDER (batch picking), BATCH (high-volume), ZONE (zone-locked), CARRIER (carrier-grouped), ROUTE (route-grouped), PRIORITY (high-priority first), EMERGENCY (overrides all). Each wave has a strategy: FIFO (first in first out), FEFO (first expiry first out — critical for food), LIFO, PRIORITY, ZONE_SEQUENCE. Waves move through status: DRAFT → RELEASED → IN_PROGRESS → COMPLETED (or CANCELLED/ON_HOLD).',
        taskEnginePrinciple: 'Warehouse Tasks are atomic units of work assigned to operators. 10 task types: RECEIVE (inbound), PUTAWAY (storage), PICK (outbound), PACK (consolidation), TRANSFER (bin-to-bin), COUNT (cycle count), INSPECT (QC), LOAD (vehicle loading), DISPATCH (final dispatch), REPLENISH (bin refill). Each task tracks planned vs actual qty, scan verification (from-location, to-location, product, qty), SLA deadline, and assignment strategy. Status: OPEN → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED (or FAILED/ESCALATED).',
        dynamicAssignmentPrinciple: 'Dynamic Task Assignment is the heart of intelligent WMS. When a task is OPEN, the engine computes an assignment score for each eligible operator based on: (1) Current workload — operators with capacity get higher score; (2) Skill level — certified operators only for forklift/reach truck tasks; (3) Distance to task location — closer operators preferred; (4) Zone familiarity — operators in the same zone get bonus; (5) Shift — only on-shift operators considered; (6) Priority — emergency tasks can preempt lower-priority tasks. The highest-scoring operator is auto-assigned. Operators never manually select work — the system continuously pushes the highest-priority task.',
        workforcePrinciple: 'Workforce Management tracks operators across 3 shifts (Morning 06-14, Evening 14-22, Night 22-06) plus overtime pool. Each operator has a skill matrix (BEGINNER → INTERMEDIATE → ADVANCED → EXPERT → SUPERVISOR) and certifications (FORKLIFT, REACH_TRUCK, STACKER, SCANNER). KPIs: tasks completed, accuracy %, utilization %, idle time, travel time, average task duration. Attendance: PRESENT, LATE, ABSENT, HALF_DAY, ON_LEAVE, HOLIDAY — with grace periods and overtime tracking.',
        equipmentPrinciple: 'Equipment Management tracks forklifts, reach trucks, stackers, hand pallet trucks, scanners, mobile devices, and printers. Each equipment tracks battery/fuel level, charging status, maintenance schedule (last + next), total operating hours, total tasks done, current operator, current location, and required certifications. Status: AVAILABLE, IN_USE, CHARGING, MAINTENANCE, OUT_OF_SERVICE, RETIRED. Battery below 20% triggers charging alert; maintenance overdue triggers maintenance alert.',
        slaPrinciple: 'SLA Monitoring measures task completion against time targets. 7 SLA types: Receiving (60 min), Putaway (45 min), Picking (30 min, HIGH priority), Packing (20 min), Dispatch (90 min, HIGH priority), Transfer (60 min), Cycle Count (240 min). Each has warning (80% of target) and critical (100% of target) thresholds. Violations are tracked with severity (WARNING, MINOR, MAJOR, CRITICAL) and may carry penalties. Resolution workflow: OPEN → ACKNOWLEDGED → INVESTIGATING → RESOLVED (or WAIVED).',
        exceptionPrinciple: 'Exception Management handles 11 exception types: TASK_FAILURE, NO_STOCK, WRONG_BIN, EQUIPMENT_FAILURE, OPERATOR_UNAVAILABLE, PRIORITY_CHANGE, EMERGENCY_ORDER, TEMPERATURE_ALARM, SHORT_PICK, DAMAGED_GOODS, MISCELLANEOUS. Workflow: Exception → Auto-routed to Supervisor → Investigation → Decision (Reassign / Escalate / Close) → Audit Logged. Severity (LOW, MEDIUM, HIGH, CRITICAL) determines escalation level and notification chain. Impact assessment: NEGLIGIBLE, MINOR, MODERATE, MAJOR, SEVERE.',
        controlTowerPrinciple: 'Warehouse Control Tower is the live operational dashboard. Displays: live operators (online/offline), open tasks (by type/priority), wave status, equipment status, warehouse heat map (zone load %), dock activity (loading/unloading/idle), vehicle queue (yard), alerts (critical/high/warning/info). KPIs: tasks/hour, orders/hour, avg completion time, operator utilization, equipment utilization, warehouse efficiency. Live mode updates every 5 seconds.',
        chiefArchitectRecommendation: 'For Sudhamrit\'s manufacturing and distribution operations, implement Dynamic Replenishment Tasks. When picking bin stock falls below minimum, the system auto-creates a replenishment task. Forklift operator receives the task, moves stock from bulk to picking location, scans to confirm. This ensures fast-moving products (sweets, snacks, packaging materials) are always available in picking locations without manual supervision, reducing fulfillment delays.',
        endpoints: [
          'GET /api/warehouse-waves', 'POST /api/warehouse-waves', 'POST /api/warehouse-waves/:id/release',
          'GET /api/warehouse-tasks', 'POST /api/warehouse-tasks/:id/assign', 'POST /api/warehouse-tasks/:id/complete',
          'GET /api/warehouse-operators',
          'GET /api/warehouse-equipment',
          'GET /api/warehouse-sla', 'GET /api/sla-violations',
          'GET /api/warehouse-exceptions', 'POST /api/warehouse-exceptions/:id/resolve',
          'GET /api/warehouse-control-tower',
          'GET /api/wave-planning/info',
        ],
        part4Sprint: 7,
        part4Sprints: 12,
        part4Tables: 54,
      }, 'SUOP Wave Planning & Task Orchestration Engine v28.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 29 — CROSS-DOCKING, DOCK YARD & YARD MGMT (YMS)
    // ═════════════════════════════════════════════════════════

    // GET /api/cross-dock — List cross-dock orders
    if (path === '/api/cross-dock' && method === 'GET') {
      const orders = [
        { id: 'cdo-001', crossDockNumber: 'CD-2026-001', crossDockType: 'PRE_DISTRIBUTIVE', status: 'IN_PROGRESS', priority: 'HIGH', supplierName: 'Sudhamrit Foods Pvt', outboundOrderNumber: 'SO-2026-1024', inboundDockCode: 'DOCK-02', outboundDockCode: 'DOCK-07', totalLines: 12, totalQty: '480', storageAvoided: true, handlingCostSaved: 1850, timeSavedMinutes: 90, progress: 65 },
        { id: 'cdo-002', crossDockNumber: 'CD-2026-002', crossDockType: 'OPPORTUNISTIC', status: 'COMPLETED', priority: 'NORMAL', supplierName: 'Mysore Sweets Co', outboundOrderNumber: 'SO-2026-1031', inboundDockCode: 'DOCK-01', outboundDockCode: 'DOCK-05', totalLines: 8, totalQty: '240', storageAvoided: true, handlingCostSaved: 1240, timeSavedMinutes: 75, progress: 100 },
        { id: 'cdo-003', crossDockNumber: 'CD-2026-003', crossDockType: 'PRE_DISTRIBUTIVE', status: 'PLANNED', priority: 'EMERGENCY', supplierName: 'Shwet Idli Batter', outboundOrderNumber: 'SO-2026-1042', inboundDockCode: 'DOCK-02', outboundDockCode: 'DOCK-08', totalLines: 5, totalQty: '60', storageAvoided: true, handlingCostSaved: 950, timeSavedMinutes: 60, progress: 0 },
      ]
      return new Response(JSON.stringify(successResponse(orders, 'Cross-dock orders retrieved')), { headers })
    }

    // POST /api/cross-dock — Create cross-dock order
    if (path === '/api/cross-dock' && method === 'POST') {
      const body = await req.json()
      const order = {
        id: `cdo-${Date.now()}`,
        crossDockNumber: `CD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        crossDockType: body.crossDockType || 'PRE_DISTRIBUTIVE',
        status: 'PLANNED',
        priority: body.priority || 'NORMAL',
        inboundDockCode: body.inboundDockCode,
        outboundDockCode: body.outboundDockCode,
        storageAvoided: true,
        createdAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(order, 'Cross-dock order created')), { status: 201, headers })
    }

    // POST /api/cross-dock/:id/complete — Complete cross-dock
    if (path.match(/^\/api\/cross-dock\/[\w-]+\/complete$/) && method === 'POST') {
      const id = path.split('/')[3]
      const result = {
        id, status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        storageAvoided: true,
        handlingCostSaved: 1850,
        timeSavedMinutes: 90,
        message: 'Cross-dock completed — inventory moved directly inbound to outbound without storage',
      }
      return new Response(JSON.stringify(successResponse(result, 'Cross-dock completed')), { headers })
    }

    // GET /api/yard-vehicles — List yard vehicles
    if (path === '/api/yard-vehicles' && method === 'GET') {
      const vehicles = [
        { id: 'yv-001', vehicleNumber: 'MH12-AB-1234', vehicleType: 'CONTAINER', ownership: 'THIRD_PARTY', carrierName: 'VRL Logistics', driverName: 'Imran Sheikh', visitPurpose: 'INBOUND_DELIVERY', status: 'UNLOADING', assignedDockCode: 'DOCK-02', asnNumber: 'ASN-2026-018', arrivalTime: '2026-07-09T03:15:00Z', waitingMinutes: 8, isRefrigerated: false },
        { id: 'yv-002', vehicleNumber: 'KA05-CD-5678', vehicleType: 'COLD_TRUCK', ownership: 'THIRD_PARTY', carrierName: 'Cold Chain Logistics', driverName: 'Ravi Kumar', visitPurpose: 'INBOUND_DELIVERY', status: 'IN_YARD', assignedDockCode: null, asnNumber: 'ASN-2026-019', arrivalTime: '2026-07-09T03:40:00Z', waitingMinutes: 15, isRefrigerated: true, tempSetpointC: 4 },
        { id: 'yv-003', vehicleNumber: 'DL01-EF-9012', vehicleType: 'MINI_TRUCK', ownership: 'COURIER', carrierName: 'Blue Dart', driverName: 'Suresh Yadav', visitPurpose: 'OUTBOUND_DISPATCH', status: 'LOADING', assignedDockCode: 'DOCK-05', dispatchNumber: 'DSP-2026-008', arrivalTime: '2026-07-09T03:00:00Z', waitingMinutes: 22, isRefrigerated: false },
        { id: 'yv-004', vehicleNumber: 'TN09-GH-3456', vehicleType: 'TRAILER', ownership: 'OWN_FLEET', carrierName: 'In-House', driverName: 'Anand Pillai', visitPurpose: 'OUTBOUND_DISPATCH', status: 'WAITING', assignedDockCode: null, dispatchNumber: 'DSP-2026-009', arrivalTime: '2026-07-09T03:20:00Z', waitingMinutes: 35, isRefrigerated: false },
      ]
      return new Response(JSON.stringify(successResponse(vehicles, 'Yard vehicles retrieved')), { headers })
    }

    // GET /api/truck-queue — List truck queue
    if (path === '/api/truck-queue' && method === 'GET') {
      const queue = [
        { id: 'tq-001', queueNumber: 'Q-2026-018', queuePosition: 1, vehicleNumber: 'MH12-AB-1234', vehicleType: 'CONTAINER', driverName: 'Imran Sheikh', queueType: 'PRIORITY', priorityScore: 85, waitingMinutes: 8, estimatedDockTime: '2026-07-09T05:15:00Z', status: 'ASSIGNED', assignedDockCode: 'DOCK-02' },
        { id: 'tq-002', queueNumber: 'Q-2026-019', queuePosition: 2, vehicleNumber: 'KA05-CD-5678', vehicleType: 'COLD_TRUCK', driverName: 'Ravi Kumar', queueType: 'COLD_CHAIN', priorityScore: 90, waitingMinutes: 15, estimatedDockTime: '2026-07-09T05:25:00Z', status: 'WAITING', assignedDockCode: null },
        { id: 'tq-008', queueNumber: 'Q-2026-025', queuePosition: 8, vehicleNumber: 'KA03-OP-9012', vehicleType: 'MILK_TANKER', driverName: 'Mohan Das', queueType: 'EMERGENCY', priorityScore: 100, waitingMinutes: 2, estimatedDockTime: '2026-07-09T05:10:00Z', status: 'PRIORITY_BOOSTED', assignedDockCode: null },
      ]
      return new Response(JSON.stringify(successResponse(queue, 'Truck queue retrieved')), { headers })
    }

    // POST /api/truck-queue/:id/assign — Assign dock to queue entry
    if (path.match(/^\/api\/truck-queue\/[\w-]+\/assign$/) && method === 'POST') {
      const id = path.split('/')[3]
      const result = {
        id, status: 'ASSIGNED',
        assignedDockCode: 'DOCK-03',
        dequeuedAt: new Date().toISOString(),
        message: 'Vehicle dequeued and assigned to dock',
      }
      return new Response(JSON.stringify(successResponse(result, 'Dock assigned')), { headers })
    }

    // GET /api/dock-doors-yms — List dock doors with YMS info
    if (path === '/api/dock-doors-yms' && method === 'GET') {
      const docks = [
        { id: 'dd-001', dockCode: 'DOCK-01', dockName: 'Receiving Dock 01', dockType: 'RECEIVING', status: 'OCCUPIED', currentVehicleNumber: 'MH12-AB-1234', utilizationToday: 78, operationsToday: 4, supportsColdChain: false, supportsBulk: false, hasDockLeveler: true, hasDockSeal: false },
        { id: 'dd-005', dockCode: 'DOCK-05', dockName: 'Dispatch Dock 05', dockType: 'DISPATCH', status: 'OCCUPIED', currentVehicleNumber: 'DL01-EF-9012', utilizationToday: 85, operationsToday: 5, supportsColdChain: false, supportsBulk: false, hasDockLeveler: true, hasDockSeal: true },
        { id: 'dd-c1', dockCode: 'DOCK-COLD-01', dockName: 'Cold Receiving Dock', dockType: 'COLD', status: 'OCCUPIED', currentVehicleNumber: 'TN09-GH-3456', utilizationToday: 71, operationsToday: 2, supportsColdChain: true, supportsBulk: false, hasDockLeveler: true, hasDockSeal: true },
        { id: 'dd-004', dockCode: 'DOCK-04', dockName: 'Bulk Dock 04', dockType: 'BULK', status: 'MAINTENANCE', currentVehicleNumber: null, utilizationToday: 0, operationsToday: 0, supportsColdChain: false, supportsBulk: true, hasDockLeveler: true, hasDockSeal: false },
      ]
      return new Response(JSON.stringify(successResponse(docks, 'Dock doors retrieved')), { headers })
    }

    // GET /api/dock-schedule — Today's dock schedule
    if (path === '/api/dock-schedule' && method === 'GET') {
      const schedule = [
        { id: 'ds-001', dockCode: 'DOCK-01', startTime: '2026-07-09T04:30:00Z', endTime: '2026-07-09T05:30:00Z', vehicleNumber: 'MH12-AB-1234', carrierName: 'VRL Logistics', bookingType: 'APPOINTMENT', status: 'IN_PROGRESS' },
        { id: 'ds-002', dockCode: 'DOCK-05', startTime: '2026-07-09T04:30:00Z', endTime: '2026-07-09T05:30:00Z', vehicleNumber: 'DL01-EF-9012', carrierName: 'Blue Dart', bookingType: 'CROSS_DOCK', status: 'IN_PROGRESS' },
        { id: 'ds-003', dockCode: 'DOCK-07', startTime: '2026-07-09T04:30:00Z', endTime: '2026-07-09T05:00:00Z', vehicleNumber: 'GJ01-KL-1234', carrierName: '—', bookingType: 'PRIORITY', status: 'COMPLETED' },
      ]
      return new Response(JSON.stringify(successResponse(schedule, 'Dock schedule retrieved')), { headers })
    }

    // GET /api/yard-gate-entries — Gate check-in entries
    if (path === '/api/yard-gate-entries' && method === 'GET') {
      const entries = [
        { id: 'yge-001', entryNumber: 'GE-2026-018', gatePassNumber: 'GP-2026-018', vehicleNumber: 'MH12-AB-1234', vehicleType: 'CONTAINER', driverName: 'Imran Sheikh', visitPurpose: 'INBOUND_DELIVERY', gateNumber: 'GATE-01', securityOfficerName: 'Mahesh Tiwari', entryTime: '2026-07-09T03:15:00Z', expectedExitTime: '2026-07-09T05:00:00Z', documentsVerified: true, vehicleInspected: true, sealVerified: true, passType: 'QR', status: 'AT_DOCK' },
        { id: 'yge-002', entryNumber: 'GE-2026-019', gatePassNumber: 'GP-2026-019', vehicleNumber: 'KA05-CD-5678', vehicleType: 'COLD_TRUCK', driverName: 'Ravi Kumar', visitPurpose: 'INBOUND_DELIVERY', gateNumber: 'GATE-01', securityOfficerName: 'Mahesh Tiwari', entryTime: '2026-07-09T03:40:00Z', expectedExitTime: '2026-07-09T05:30:00Z', documentsVerified: true, vehicleInspected: true, sealVerified: false, passType: 'QR', status: 'IN_YARD' },
      ]
      return new Response(JSON.stringify(successResponse(entries, 'Gate entries retrieved')), { headers })
    }

    // POST /api/yard-gate-entries — New vehicle check-in
    if (path === '/api/yard-gate-entries' && method === 'POST') {
      const body = await req.json()
      const entry = {
        id: `yge-${Date.now()}`,
        entryNumber: `GE-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        gatePassNumber: `GP-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        passType: body.passType || 'QR',
        vehicleNumber: body.vehicleNumber,
        vehicleType: body.vehicleType,
        driverName: body.driverName,
        visitPurpose: body.visitPurpose,
        gateNumber: body.gateNumber || 'GATE-01',
        entryTime: new Date().toISOString(),
        status: 'ENTERED',
        documentsVerified: false,
        vehicleInspected: false,
        sealVerified: false,
      }
      return new Response(JSON.stringify(successResponse(entry, 'Vehicle checked in — gate pass generated')), { status: 201, headers })
    }

    // POST /api/yard-gate-exits — Vehicle check-out
    if (path === '/api/yard-gate-exits' && method === 'POST') {
      const body = await req.json()
      const exit = {
        id: `ygex-${Date.now()}`,
        exitNumber: `GX-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        gateEntryId: body.gateEntryId,
        gatePassNumber: body.gatePassNumber,
        vehicleNumber: body.vehicleNumber,
        sealVerified: body.sealVerified || false,
        documentsVerified: body.documentsVerified || false,
        vehicleInspected: body.vehicleInspected || false,
        exitTime: new Date().toISOString(),
        yardDurationMinutes: Math.floor(Math.random() * 120) + 30,
        status: 'EXITED',
      }
      return new Response(JSON.stringify(successResponse(exit, 'Vehicle exited — gate pass closed')), { status: 201, headers })
    }

    // GET /api/yard-tower — Yard control tower live data
    if (path === '/api/yard-tower' && method === 'GET') {
      const data = {
        kpis: {
          vehiclesWaiting: 5, loading: 2, unloading: 1,
          avgYardTimeMinutes: 38, dockUtilizationPercent: 67,
          truckTurnaroundMinutes: 52, avgQueueTimeMinutes: 18, crossDockPercent: 34,
        },
        dockActivity: [
          { dock: 'DOCK-01', status: 'OCCUPIED', vehicle: 'MH12-AB-1234', operation: 'UNLOADING', progress: 65, etaMinutes: 15 },
          { dock: 'DOCK-02', status: 'OCCUPIED', vehicle: 'KA05-CD-5678', operation: 'UNLOADING', progress: 40, etaMinutes: 25 },
          { dock: 'DOCK-05', status: 'OCCUPIED', vehicle: 'DL01-EF-9012', operation: 'LOADING', progress: 85, etaMinutes: 5 },
          { dock: 'DOCK-03', status: 'AVAILABLE', vehicle: null, operation: null, progress: 0, etaMinutes: null },
        ],
        crossDockOps: [
          { num: 'CD-2026-001', stage: 'CROSS_DOCK_IN_PROGRESS', progress: 65, etaMinutes: 20 },
          { num: 'CD-2026-004', stage: 'OUTBOUND_LOADED', progress: 88, etaMinutes: 5 },
        ],
        alerts: [
          { sev: 'CRITICAL', msg: 'Milk Tanker KA03-OP-9012 waiting — cold chain priority boosted', time: '1 min ago' },
          { sev: 'WARNING', msg: 'Average queue time 18m exceeds 15m target', time: '20 min ago' },
        ],
        timestamp: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, 'Yard tower live data')), { headers })
    }

    // GET /api/cross-dock-analytics — Cross-dock analytics
    if (path === '/api/cross-dock-analytics' && method === 'GET') {
      const data = {
        kpis: {
          crossDockRate: 41.5, storageAvoided: 426, costSaved7d: 241400,
          avgHandlingSavedMinutes: 78, successRate: 94.2,
        },
        dailyTrend: [
          { day: 'Mon', crossDock: 18, total: 45, savings: 28500 },
          { day: 'Tue', crossDock: 22, total: 52, savings: 34200 },
          { day: 'Wed', crossDock: 28, total: 58, savings: 42800 },
          { day: 'Thu', crossDock: 24, total: 51, savings: 36500 },
          { day: 'Fri', crossDock: 32, total: 67, savings: 51200 },
          { day: 'Sat', crossDock: 19, total: 41, savings: 29800 },
          { day: 'Sun', crossDock: 12, total: 28, savings: 18400 },
        ],
        topProducts: [
          { product: 'Shwet Idli Batter', crossDockOps: 42, storageAvoided: 92, savings: 18400 },
          { product: 'Kaju Katli 500g', crossDockOps: 28, storageAvoided: 76, savings: 12800 },
          { product: 'Mysore Pak 250g', crossDockOps: 24, storageAvoided: 68, savings: 9600 },
        ],
        supplierPerformance: [
          { supplier: 'Sudhamrit Foods Pvt', onTimePercent: 96, avgDelayMinutes: 4, crossDockEligiblePercent: 92 },
          { supplier: 'Shwet Idli Batter', onTimePercent: 98, avgDelayMinutes: 2, crossDockEligiblePercent: 95 },
        ],
        carrierPerformance: [
          { carrier: 'VRL Logistics', onTimePercent: 94, avgTurnaroundMinutes: 48, utilizationPercent: 78 },
          { carrier: 'In-House Fleet', onTimePercent: 99, avgTurnaroundMinutes: 28, utilizationPercent: 92 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Cross-dock analytics')), { headers })
    }

    // GET /api/yard-management/info — Sprint 29 info
    if (path === '/api/yard-management/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 29,
        sprintName: 'Enterprise Cross-Docking, Dock Yard & Yard Management System (YMS)',
        version: '29.0.0',
        part: 4,
        tables: 10,
        epics: [
          'Epic 1: Cross Docking Engine (3 types: PRE_DISTRIBUTIVE, POST_DISTRIBUTIVE, OPPORTUNISTIC)',
          'Epic 2: Yard Management (locations, vehicles, slot occupancy)',
          'Epic 3: Truck Queue Management (FIFO, PRIORITY, COLD_CHAIN, EMERGENCY, VIP_SUPPLIER, MANUAL_OVERRIDE)',
          'Epic 4: Dock Door Scheduling (RECEIVING, DISPATCH, SHARED, COLD, BULK, EXPRESS)',
          'Epic 5: Trailer Management (number, container, seal, movements)',
          'Epic 6: Gate Check-In & Check-Out (QR/Barcode pass, photo evidence, seal verification)',
          'Epic 7: Yard Control Tower (live KPIs, dock activity, queue, gate)',
          'Epic 8: Cross Dock Analytics (success rate, storage avoidance, supplier/carrier perf)',
        ],
        domainEvents: ['VehicleArrived', 'GateCheckInCompleted', 'DockAssigned', 'CrossDockStarted', 'CrossDockCompleted', 'VehicleLoaded', 'VehicleExited', 'DockReleased'],
        crossDockPrinciple: 'Cross-Docking routes eligible inbound inventory directly to outbound docks — skipping warehouse storage entirely. SUOP supports 3 cross-dock types: PRE_DISTRIBUTIVE (planned supplier→outbound), POST_DISTRIBUTIVE (consolidation), OPPORTUNISTIC (auto-detected). 8 eligibility rules: SAME_DAY_DISPATCH, PRIORITY_CUSTOMER, RETAIL_REPLENISHMENT, RESTAURANT_REPLENISHMENT, TRANSFER_ORDERS, DISTRIBUTOR_ORDERS, TEMPERATURE_SENSITIVE, PERISHABLE_GOODS. No warehouse storage is created for cross-docked inventory. Inventory moves directly inbound→outbound.',
        yardPrinciple: 'Yard Management tracks every vehicle from gate entry to gate exit. 6 yard zones: GATE_ZONE (initial check-in), WAITING (queue), HOLDING (temporary), STAGING (ready for dock), COLD_HOLD (refrigerated), MAINTENANCE (service). Vehicle status: WAITING → AT_GATE → IN_YARD → DOCK_ASSIGNED → LOADING/UNLOADING → READY → EXITED. Each vehicle tracks driver, carrier, ASN/dispatch reference, capacity, temperature, waiting time.',
        truckQueuePrinciple: 'Truck Queue uses configurable priority rules. Default order: EMERGENCY (>COLD_CHAIN >VIP_SUPPLIER >PRIORITY >FIFO. Each vehicle gets a priority score 0-100. Queue position auto-recomputes when priority changes. Manual override allowed for supervisor. Queue history tracks every position change with reason.',
        dockSchedulingPrinciple: 'Dock Door Scheduling prevents conflicts. 6 dock types: RECEIVING (inbound), DISPATCH (outbound), SHARED (both), COLD (refrigerated), BULK (bulk goods), EXPRESS (quick turn). Each dock tracks capacity (weight, cold chain support, bulk support, leveler, seal), current vehicle, utilization %, operations today. Bookings: APPOINTMENT, WALK_IN, CROSS_DOCK, PRIORITY. Status: SCHEDULED → CONFIRMED → ARRIVED → IN_PROGRESS → COMPLETED (or NO_SHOW/CANCELLED).',
        gatePrinciple: 'Gate Check-In & Check-Out is fully audited. 4 pass types: QR (default, scannable), BARCODE, RFID (future), ANPR (future, camera-based). Entry workflow: (1) Vehicle arrives at gate, (2) Security officer verifies documents, (3) Vehicle inspected, (4) Seal verified (for inbound sealed trucks), (5) Photo evidence captured (front, back, side, seal), (6) Gate pass generated (QR), (7) Vehicle enters yard. Exit workflow: (1) Vehicle ready, (2) Security verifies seal intact, (3) Documents checked, (4) Photo evidence, (5) Exit approved, (6) Yard duration recorded.',
        chiefArchitectRecommendation: 'For Sudhamrit, enable Automatic Cross-Docking for high-demand fresh products. When supplier truck arrives (e.g., Shwet Idli Batter), system detects pending retail/restaurant orders, routes inventory directly from receiving dock to dispatch dock — skipping warehouse storage. Reduces handling cost (-42%), product aging (-68%), delivery lead time (-55%). Especially valuable for fresh products: batter, dairy-based sweets, items with limited shelf life.',
        endpoints: [
          'GET /api/cross-dock', 'POST /api/cross-dock', 'POST /api/cross-dock/:id/complete',
          'GET /api/yard-vehicles',
          'GET /api/truck-queue', 'POST /api/truck-queue/:id/assign',
          'GET /api/dock-doors-yms', 'GET /api/dock-schedule',
          'GET /api/yard-gate-entries', 'POST /api/yard-gate-entries', 'POST /api/yard-gate-exits',
          'GET /api/yard-tower', 'GET /api/cross-dock-analytics',
          'GET /api/yard-management/info',
        ],
        part4Sprint: 8,
        part4Sprints: 12,
        part4Tables: 64,
      }, 'SUOP Cross-Docking & Yard Management Engine v29.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 30 — WAREHOUSE RESOURCE, EQUIPMENT & MAINTENANCE
    // ═════════════════════════════════════════════════════════

    // GET /api/equipment-master — List all equipment
    if (path === '/api/equipment-master' && method === 'GET') {
      const equipment = [
        { id: 'em-001', equipmentCode: 'FL-001', equipmentName: 'Toyota Electric Forklift', typeCode: 'FORKLIFT', category: 'FORKLIFT', manufacturer: 'Toyota', model: '8FBE15', serialNumber: 'TY2024-001', qrCode: 'QR-FL-001', status: 'IN_USE', batteryPercent: 78, currentOperatorName: 'Rajesh K.', warehouseName: 'WH-MUM-MAIN', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-15', purchaseCost: 850000, totalOperatingHours: 1245.5, totalTasksCompleted: 342, nextMaintenanceAt: '2026-09-15' },
        { id: 'em-004', equipmentCode: 'RT-001', equipmentName: 'Crown Reach Truck', typeCode: 'REACH_TRUCK', category: 'REACH_TRUCK', manufacturer: 'Crown', model: 'RR5200', serialNumber: 'CR2024-005', qrCode: 'QR-RT-001', status: 'IN_USE', batteryPercent: 45, currentOperatorName: 'Mahesh R.', warehouseName: 'WH-MUM-MAIN', purchaseDate: '2023-11-10', warrantyExpiry: '2026-11-10', purchaseCost: 1250000, totalOperatingHours: 1876.2, totalTasksCompleted: 412, nextMaintenanceAt: '2026-08-10' },
        { id: 'em-008', equipmentCode: 'FL-004', equipmentName: 'Toyota Forklift (Broken)', typeCode: 'FORKLIFT', category: 'FORKLIFT', manufacturer: 'Toyota', model: '8FBE15', serialNumber: 'TY2024-003', qrCode: 'QR-FL-004', status: 'BREAKDOWN', batteryPercent: 0, currentOperatorName: null, warehouseName: 'WH-MUM-MAIN', purchaseDate: '2023-02-10', warrantyExpiry: '2026-02-10', purchaseCost: 850000, totalOperatingHours: 2104.7, totalTasksCompleted: 567, nextMaintenanceAt: '2026-10-08' },
      ]
      return new Response(JSON.stringify(successResponse(equipment, 'Equipment retrieved')), { headers })
    }

    // POST /api/equipment-master — Register new equipment
    if (path === '/api/equipment-master' && method === 'POST') {
      const body = await req.json()
      const equipment = {
        id: `em-${Date.now()}`,
        equipmentCode: body.equipmentCode,
        equipmentName: body.equipmentName,
        typeCode: body.category,
        category: body.category,
        manufacturer: body.manufacturer,
        model: body.model,
        serialNumber: body.serialNumber,
        qrCode: `QR-${body.equipmentCode}`,
        status: 'AVAILABLE',
        purchaseDate: body.purchaseDate,
        purchaseCost: body.purchaseCost,
        warrantyExpiry: body.warrantyExpiry,
        createdAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(equipment, 'Equipment registered with QR code')), { status: 201, headers })
    }

    // GET /api/forklifts — Forklift fleet
    if (path === '/api/forklifts' && method === 'GET') {
      const forklifts = [
        { id: 'fl-001', forkliftCode: 'FL-001', forkliftType: 'ELECTRIC_FORKLIFT', manufacturer: 'Toyota', model: '8FBE15', serialNumber: 'TY2024-001', loadCapacityKg: 1500, maxLiftHeightMm: 3000, powerSource: 'ELECTRIC', batteryPercent: 78, currentOperatorName: 'Rajesh K.', currentTaskNumber: 'TASK-2026-002', totalOperatingHours: 1245.5, hoursSinceService: 124, nextServiceHours: 250, status: 'IN_USE' },
        { id: 'fl-004', forkliftCode: 'FL-004', forkliftType: 'ELECTRIC_FORKLIFT', manufacturer: 'Toyota', model: '8FBE15', serialNumber: 'TY2024-003', loadCapacityKg: 1500, maxLiftHeightMm: 3000, powerSource: 'ELECTRIC', batteryPercent: 0, currentOperatorName: null, totalOperatingHours: 2104.7, hoursSinceService: 304, nextServiceHours: 250, status: 'BREAKDOWN' },
      ]
      return new Response(JSON.stringify(successResponse(forklifts, 'Forklift fleet retrieved')), { headers })
    }

    // GET /api/barcode-scanners — Scanners
    if (path === '/api/barcode-scanners' && method === 'GET') {
      const scanners = [
        { id: 'bs-001', scannerCode: 'SC-001', scannerType: 'HANDHELD_2D', manufacturer: 'Zebra', model: 'TC52', serialNumber: 'ZB2024-1001', assignedOperatorName: 'Anita S.', batteryPercent: 88, status: 'IN_USE', totalScansToday: 284, totalScansLifetime: 12453, supports1D: true, supports2D: true, supportsQR: true, supportsGS1: false, supportsRFID: false },
        { id: 'bs-006', scannerCode: 'SC-006', scannerType: 'HANDHELD_1D', manufacturer: 'Honeywell', model: 'VW-320', serialNumber: 'HW2023-0900', assignedOperatorName: null, batteryPercent: null, status: 'BROKEN', totalScansToday: 0, totalScansLifetime: 18456, supports1D: true, supports2D: false, supportsQR: false, supportsGS1: false, supportsRFID: false },
      ]
      return new Response(JSON.stringify(successResponse(scanners, 'Scanners retrieved')), { headers })
    }

    // GET /api/mobile-devices — Mobile devices
    if (path === '/api/mobile-devices' && method === 'GET') {
      const devices = [
        { id: 'md-001', deviceCode: 'MD-001', deviceName: 'Samsung Galaxy Tab A9', deviceType: 'TABLET', manufacturer: 'Samsung', model: 'Galaxy Tab A9', serialNumber: 'SM2024-5001', imei: '358912456789012', operatingSystem: 'Android', osVersion: '14.0', appName: 'SUOP Scanner', appVersion: '1.4.2', appLastSyncAt: '2026-07-09T05:12:00Z', assignedOperatorName: 'Lakshmi V.', batteryPercent: 65, isCharging: false, connectivityStatus: 'ONLINE', wifiSsid: 'SUOP-WH-MUM', ipAddress: '192.168.1.42', lastHeartbeatAt: '2026-07-09T05:12:00Z', status: 'IN_USE' },
      ]
      return new Response(JSON.stringify(successResponse(devices, 'Mobile devices retrieved')), { headers })
    }

    // GET /api/battery-status — Battery status
    if (path === '/api/battery-status' && method === 'GET') {
      const batteries = [
        { id: 'bat-001', batteryCode: 'BAT-FL-001', equipmentCode: 'FL-001', equipmentType: 'FORKLIFT', batteryType: 'LITHIUM_ION', voltage: 48, capacityAh: 600, currentPercent: 78, chargingStatus: 'NOT_CHARGING', healthPercent: 92, cycleCount: 412, maxCycles: 1500, replacementRecommended: false },
        { id: 'bat-004', batteryCode: 'BAT-RT-001', equipmentCode: 'RT-001', equipmentType: 'REACH_TRUCK', batteryType: 'LITHIUM_ION', voltage: 80, capacityAh: 800, currentPercent: 45, chargingStatus: 'NOT_CHARGING', healthPercent: 65, cycleCount: 1240, maxCycles: 1500, replacementRecommended: true },
      ]
      return new Response(JSON.stringify(successResponse(batteries, 'Battery status retrieved')), { headers })
    }

    // GET /api/charging-stations — Charging stations
    if (path === '/api/charging-stations' && method === 'GET') {
      const stations = [
        { id: 'cs-001', stationCode: 'CS-01', stationName: 'Charging Station 01', stationType: 'MULTI_BAY', warehouseName: 'WH-MUM-MAIN', zoneName: 'Charging Room', totalBays: 4, occupiedBays: 2, voltageOutput: 48, maxCurrentA: 30, status: 'PARTIAL' },
        { id: 'cs-002', stationCode: 'CS-02', stationName: 'Charging Station 02', stationType: 'FAST_CHARGE', warehouseName: 'WH-MUM-MAIN', zoneName: 'Charging Room', totalBays: 2, occupiedBays: 0, voltageOutput: 80, maxCurrentA: 50, status: 'AVAILABLE' },
      ]
      return new Response(JSON.stringify(successResponse(stations, 'Charging stations retrieved')), { headers })
    }

    // GET /api/maintenance-plans — Maintenance plans
    if (path === '/api/maintenance-plans' && method === 'GET') {
      const plans = [
        { id: 'mp-001', planCode: 'MP-001', planName: 'Forklift Weekly Inspection', appliesTo: 'EQUIPMENT_TYPE', typeCode: 'FORKLIFT', frequencyType: 'WEEKLY', frequencyInterval: 1, frequencyUnit: 'WEEKS', maintenanceType: 'INSPECTION', estimatedDurationMin: 60, isActive: true, lastExecutedAt: '2026-07-01', nextExecutionAt: '2026-07-08' },
        { id: 'mp-003', planCode: 'MP-003', planName: 'Forklift Annual Overhaul', appliesTo: 'EQUIPMENT_TYPE', typeCode: 'FORKLIFT', frequencyType: 'ANNUAL', frequencyInterval: 1, frequencyUnit: 'MONTHS', maintenanceType: 'OVERHAUL', estimatedDurationMin: 480, isActive: true, lastExecutedAt: '2025-07-20', nextExecutionAt: '2026-07-20' },
      ]
      return new Response(JSON.stringify(successResponse(plans, 'Maintenance plans retrieved')), { headers })
    }

    // GET /api/maintenance-schedule — Maintenance schedule
    if (path === '/api/maintenance-schedule' && method === 'GET') {
      const schedule = [
        { id: 'ms-001', scheduledDate: '2026-07-15', scheduledStartTime: '2026-07-15T04:30:00Z', scheduledEndTime: '2026-07-15T06:30:00Z', equipmentCode: 'FL-001', technicianName: 'Ramesh Tech', status: 'SCHEDULED', result: null },
        { id: 'ms-005', scheduledDate: '2026-07-07', scheduledStartTime: '2026-07-07T04:30:00Z', scheduledEndTime: '2026-07-07T06:30:00Z', equipmentCode: 'FL-002', technicianName: 'Ramesh Tech', status: 'OVERDUE', result: null },
      ]
      return new Response(JSON.stringify(successResponse(schedule, 'Maintenance schedule retrieved')), { headers })
    }

    // GET /api/maintenance-tasks — Maintenance tasks
    if (path === '/api/maintenance-tasks' && method === 'GET') {
      const tasks = [
        { id: 'mt-018', taskNumber: 'MT-2026-018', equipmentCode: 'FL-004', taskType: 'REPAIR', description: 'Hydraulic system repair', technicianName: 'Suresh Tech', scheduledAt: '2026-07-09T02:30:00Z', status: 'IN_PROGRESS', result: null, partsReplaced: ['Hydraulic pump', 'Seal kit'], cost: 18500 },
      ]
      return new Response(JSON.stringify(successResponse(tasks, 'Maintenance tasks retrieved')), { headers })
    }

    // POST /api/maintenance-tasks/:id/complete — Complete maintenance task
    if (path.match(/^\/api\/maintenance-tasks\/[\w-]+\/complete$/) && method === 'POST') {
      const id = path.split('/')[3]
      const body = await req.json().catch(() => ({}))
      const result = {
        id, status: 'COMPLETED', result: body.result || 'PASS',
        completedAt: new Date().toISOString(),
        actualDurationMin: body.durationMin || 60,
        partsReplaced: body.partsReplaced || [],
        cost: body.cost || 0,
        message: 'Maintenance task completed — equipment returned to service',
      }
      return new Response(JSON.stringify(successResponse(result, 'Maintenance completed')), { headers })
    }

    // GET /api/equipment-breakdowns — Breakdowns
    if (path === '/api/equipment-breakdowns' && method === 'GET') {
      const breakdowns = [
        { id: 'eb-018', breakdownNumber: 'BD-2026-018', equipmentCode: 'FL-004', equipmentType: 'FORKLIFT', problemCategory: 'HYDRAULIC', problemDescription: 'Hydraulic pressure loss during loading at DOCK-04', severity: 'CRITICAL', reportedByName: 'Suresh M.', reportedAt: '2026-07-09T04:35:00Z', technicianName: 'Suresh Tech', status: 'IN_PROGRESS', diagnosis: 'Hydraulic pump failure', repairAction: 'Replacing pump + seal kit', partsReplaced: ['Hydraulic pump', 'Seal kit'], repairCost: 18500, downtimeMinutes: 95, photoUrls: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'] },
        { id: 'eb-016', breakdownNumber: 'BD-2026-016', equipmentCode: 'FL-002', equipmentType: 'FORKLIFT', problemCategory: 'ELECTRICAL', problemDescription: 'Battery not holding charge', severity: 'HIGH', reportedByName: 'Suresh M.', reportedAt: '2026-07-09T02:45:00Z', technicianName: 'Ramesh Tech', status: 'REPAIRED', diagnosis: 'Battery cell degradation', repairAction: 'Replaced 4 battery cells', partsReplaced: ['4× Battery cell'], repairCost: 12000, downtimeMinutes: 180, photoUrls: ['photo1.jpg', 'photo2.jpg'] },
      ]
      return new Response(JSON.stringify(successResponse(breakdowns, 'Breakdowns retrieved')), { headers })
    }

    // POST /api/equipment-breakdowns — Report breakdown
    if (path === '/api/equipment-breakdowns' && method === 'POST') {
      const body = await req.json()
      const breakdown = {
        id: `eb-${Date.now()}`,
        breakdownNumber: `BD-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
        equipmentCode: body.equipmentCode,
        equipmentType: body.equipmentType,
        problemCategory: body.problemCategory,
        problemDescription: body.problemDescription,
        severity: body.severity || 'MEDIUM',
        reportedByName: body.reportedByName,
        reportedAt: new Date().toISOString(),
        status: 'OPEN',
        photoUrls: body.photoUrls || [],
        message: 'Breakdown reported — equipment removed from task allocation, technician auto-assigned',
      }
      return new Response(JSON.stringify(successResponse(breakdown, 'Breakdown reported')), { status: 201, headers })
    }

    // POST /api/equipment-breakdowns/:id/repair — Complete repair
    if (path.match(/^\/api\/equipment-breakdowns\/[\w-]+\/repair$/) && method === 'POST') {
      const id = path.split('/')[3]
      const body = await req.json().catch(() => ({}))
      const result = {
        id, status: 'RETURNED_TO_SERVICE',
        diagnosis: body.diagnosis,
        repairAction: body.repairAction,
        partsReplaced: body.partsReplaced || [],
        repairCost: body.repairCost || 0,
        returnedToServiceAt: new Date().toISOString(),
        downtimeMinutes: body.downtimeMinutes,
        message: 'Equipment repaired and returned to service',
      }
      return new Response(JSON.stringify(successResponse(result, 'Equipment returned to service')), { headers })
    }

    // GET /api/operator-certifications — Certifications
    if (path === '/api/operator-certifications' && method === 'GET') {
      const certs = [
        { id: 'oc-001', certificationCode: 'CERT-001', operatorId: 'op-001', operatorCode: 'OP-001', operatorName: 'Rajesh Kumar', certificationType: 'FORKLIFT_LICENSE', certificationName: 'Forklift Operating License', issuedBy: 'NSDC', issuedAt: '2024-03-15', certificateNumber: 'NSDC-FL-2024-001', validFrom: '2024-03-15', validUntil: '2027-03-15', isExpired: false, isExpiringSoon: false, scorePercent: 92, equipmentTypeCode: 'FORKLIFT', status: 'ACTIVE' },
        { id: 'oc-004', certificationCode: 'CERT-004', operatorId: 'op-002', operatorCode: 'OP-002', operatorName: 'Anita Sharma', certificationType: 'COLD_STORAGE', certificationName: 'Cold Storage Handling', issuedBy: 'INTERNAL', issuedAt: '2024-06-01', certificateNumber: 'SUOP-CS-2024-002', validFrom: '2024-06-01', validUntil: '2026-06-01', isExpired: true, isExpiringSoon: false, scorePercent: 84, equipmentTypeCode: null, status: 'EXPIRED' },
      ]
      return new Response(JSON.stringify(successResponse(certs, 'Certifications retrieved')), { headers })
    }

    // POST /api/operator-certifications/validate — Validate certification for task
    if (path === '/api/operator-certifications/validate' && method === 'POST') {
      const body = await req.json()
      const result = {
        operatorId: body.operatorId,
        certificationType: body.certificationType,
        isValid: true,
        certificationCode: 'CERT-001',
        validUntil: '2027-03-15',
        message: 'Certification valid — operator can be assigned to task',
      }
      return new Response(JSON.stringify(successResponse(result, 'Certification valid')), { headers })
    }

    // GET /api/equipment-analytics — Equipment analytics
    if (path === '/api/equipment-analytics' && method === 'GET') {
      const data = {
        kpis: {
          equipmentUtilization: 74, mtbfHours: 342, mttrHours: 2.8,
          batteryHealthAvg: 86, maintenanceCompliance: 92, equipmentAvailability: 88,
        },
        equipmentUtilization: [
          { code: 'FL-001', util: 87, downtime: 4, tasks: 342 },
          { code: 'FL-002', util: 79, downtime: 8, tasks: 287 },
          { code: 'RT-001', util: 91, downtime: 12, tasks: 412 },
          { code: 'SC-001', util: 84, downtime: 2, tasks: 12453 },
        ],
        maintenanceTrend: [
          { month: 'Jan', planned: 12, completed: 11, cost: 38500 },
          { month: 'Feb', planned: 14, completed: 13, cost: 42800 },
          { month: 'Jun', planned: 18, completed: 17, cost: 68200 },
          { month: 'Jul', planned: 15, completed: 9, cost: 45800 },
        ],
        replacementForecast: [
          { equipment: 'FL-004 (Toyota 8FBE15)', reason: 'Hydraulic failure — beyond economic repair', estCost: 950000, recommended: '2026-07-30', urgency: 'CRITICAL' },
          { equipment: 'BAT-RT-001 (RT-001 Battery)', reason: '1240/1500 cycles — health 65%', estCost: 85000, recommended: '2026-09-15', urgency: 'HIGH' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Equipment analytics')), { headers })
    }

    // GET /api/warehouse-resource/info — Sprint 30 info
    if (path === '/api/warehouse-resource/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 30,
        sprintName: 'Enterprise Warehouse Resource, Equipment & Maintenance Management Engine',
        version: '30.0.0',
        part: 4,
        tables: 12,
        epics: [
          'Epic 1: Warehouse Equipment Master (13 categories, QR-coded, purchase/warranty/lifecycle)',
          'Epic 2: Forklift Fleet Management (Electric/Diesel/Reach/Order Picker/Pallet Stacker)',
          'Epic 3: Barcode Scanner & Mobile Device Management (Android/Industrial/Handheld/Tablet)',
          'Epic 4: Battery & Charging Management (Li-ion/Lead-Acid/Gel/NiMH, cycle count, health)',
          'Epic 5: Preventive Maintenance (Daily/Weekly/Monthly/Quarterly/Annual/Calibration/Run-based)',
          'Epic 6: Breakdown Management (Report → Diagnose → Repair → Test → Return to Service)',
          'Epic 7: Operator Certification (Forklift/Reach/Cold/Hazmat/First Aid/Safety/Equipment/Fire)',
          'Epic 8: Equipment Analytics (MTBF, MTTR, Utilization, Maintenance Cost, Replacement Forecast)',
        ],
        domainEvents: ['EquipmentRegistered', 'EquipmentAssigned', 'MaintenanceScheduled', 'MaintenanceCompleted', 'BreakdownReported', 'EquipmentRepaired', 'BatteryLow', 'CertificationExpired'],
        equipmentMasterPrinciple: 'Equipment Master treats every forklift, scanner, tablet, printer as a tracked enterprise asset. Each equipment has: QR code (scannable identity), manufacturer/model/serial, purchase date + cost + warranty, current operator, current location, total operating hours, total tasks completed, maintenance schedule. Status: AVAILABLE → ASSIGNED → IN_USE → CHARGING → MAINTENANCE → BREAKDOWN → RETIRED. Lifecycle: Purchase → Register → Assign → Daily Health Check → Software Updates → Battery Monitoring → Repair/Maintenance → Retire → Replace.',
        forkliftPrinciple: 'Forklift Fleet tracks 5 types: ELECTRIC_FORKLIFT (battery, indoor), DIESEL_FORKLIFT (outdoor, heavy), REACH_TRUCK (high-bay, narrow aisle), ORDER_PICKER (high-level picking), PALLET_STACKER (short-distance). Each tracks load capacity, max lift height, battery/fuel, operator, current task, zone, operating hours, hours since last service. Maintenance triggers at 250h intervals. Battery below 20% triggers charging alert.',
        scannerPrinciple: 'Scanner Management tracks 5 types: HANDHELD_1D (basic), HANDHELD_2D (QR+barcode), WEARABLE_RING (hands-free), FIXED_MOUNT (conveyor), MOBILE_COMPUTER (full Android). Capabilities: 1D, 2D, QR, GS1, RFID. Tracks scans today, lifetime scans, last scan time. Mobile devices track IMEI, OS version, app version, last sync, WiFi connectivity, IP address, heartbeat. Connectivity: ONLINE / WEAK / OFFLINE.',
        batteryPrinciple: 'Battery Management tracks 4 types: LITHIUM_ION (modern forklifts), LEAD_ACID (older equipment), GEL (cold storage), NIMH (smaller devices). Each battery tracks: current %, charging status, health % (degrades over time), cycle count vs max cycles, charging station assignment, last charged time, replacement due date. Battery health below 70% triggers replacement recommendation. Battery below 20% prevents new task assignment.',
        maintenancePrinciple: 'Preventive Maintenance uses 7 frequencies: DAILY (pre-shift inspection), WEEKLY (chain/fluid check), MONTHLY (full service), QUARTERLY (deep service), ANNUAL (overhaul), CALIBRATION (scales, sensors), RUN_BASED (every 250 operating hours). Each plan has checklist, estimated duration, assigned technician. Schedule generates work orders automatically. Status: SCHEDULED → IN_PROGRESS → COMPLETED (or SKIPPED/RESCHEDULED/OVERDUE).',
        breakdownPrinciple: 'Breakdown Management follows 6-step workflow: Report → Assign Technician → Diagnose → Repair → Test → Return to Service. 7 problem categories: MECHANICAL, ELECTRICAL, HYDRAULIC, BATTERY, SOFTWARE, PHYSICAL_DAMAGE, OTHER. Severity: LOW/MEDIUM/HIGH/CRITICAL. Tracks photo evidence, diagnosis, repair action, parts replaced, repair cost, downtime minutes. Breakdown equipment is automatically removed from task allocation.',
        certificationPrinciple: 'Operator Certification enforces "no cert, no task" rule. 8 certification types: FORKLIFT_LICENSE, REACH_TRUCK, COLD_STORAGE, HAZARDOUS_GOODS, FIRST_AID, SAFETY_TRAINING, EQUIPMENT_TRAINING, FIRE_SAFETY. Each cert has issued date, expiry date, score, issuing body (NSDC/INTERNAL/GOVT/MANUFACTURER). Expiring soon = within 30 days. Expired certs block task assignment automatically. Renewal tracking with renewed-from link.',
        chiefArchitectRecommendation: 'For Sudhamrit, treat every scanner as a managed enterprise asset. Full lifecycle: Purchase → Register Device → Assign to Operator → Daily Health Check → Software Updates → Battery Monitoring → Repair/Maintenance → Retire → Replace. By managing scanners, forklifts, printers, and tablets alongside inventory, SUOP ensures warehouse productivity is never impacted by untracked equipment failures.',
        endpoints: [
          'GET/POST /api/equipment-master',
          'GET /api/forklifts',
          'GET /api/barcode-scanners', 'GET /api/mobile-devices',
          'GET /api/battery-status', 'GET /api/charging-stations',
          'GET /api/maintenance-plans', 'GET /api/maintenance-schedule', 'GET /api/maintenance-tasks', 'POST /api/maintenance-tasks/:id/complete',
          'GET/POST /api/equipment-breakdowns', 'POST /api/equipment-breakdowns/:id/repair',
          'GET /api/operator-certifications', 'POST /api/operator-certifications/validate',
          'GET /api/equipment-analytics',
          'GET /api/warehouse-resource/info',
        ],
        part4Sprint: 9,
        part4Sprints: 12,
        part4Tables: 76,
      }, 'SUOP Warehouse Resource & Equipment Management Engine v30.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 31 — WAREHOUSE MOBILE PLATFORM & BARCODE SCANNING
    // ═════════════════════════════════════════════════════════

    // POST /api/mobile/login — Mobile operator login
    if (path === '/api/mobile/login' && method === 'POST') {
      const body = await req.json()
      const session = {
        sessionCode: `SESS-${Date.now()}`,
        operatorId: 'op-001',
        operatorCode: body.operatorCode || 'OP-001',
        operatorName: 'Rajesh Kumar',
        warehouseId: 'wh-001',
        warehouseName: 'WH-MUM-MAIN',
        loginMethod: body.loginMethod || 'PIN_LOGIN',
        jwtToken: `jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
      }
      return new Response(JSON.stringify(successResponse(session, 'Operator logged in successfully')), { headers })
    }

    // POST /api/mobile/register — Register mobile device
    if (path === '/api/mobile/register' && method === 'POST') {
      const body = await req.json()
      const device = {
        id: `md-${Date.now()}`,
        deviceCode: body.deviceCode || `DEV-${Math.floor(Math.random() * 9000) + 1000}`,
        deviceName: body.deviceName,
        deviceType: body.deviceType || 'ANDROID_SCANNER',
        manufacturer: body.manufacturer,
        model: body.model,
        serialNumber: body.serialNumber,
        imei: body.imei,
        operatingSystem: body.operatingSystem || 'Android',
        osVersion: body.osVersion,
        warehouseId: body.warehouseId,
        warehouseName: body.warehouseName,
        status: 'REGISTERED',
        registeredAt: new Date().toISOString(),
        message: 'Device registered — binding confirmed with warehouse',
      }
      return new Response(JSON.stringify(successResponse(device, 'Device registered')), { status: 201, headers })
    }

    // POST /api/mobile/logout — Logout
    if (path === '/api/mobile/logout' && method === 'POST') {
      return new Response(JSON.stringify(successResponse({ status: 'LOGGED_OUT', logoutAt: new Date().toISOString() }, 'Operator logged out')), { headers })
    }

    // GET /api/mobile/profile — Get operator profile
    if (path === '/api/mobile/profile' && method === 'GET') {
      const profile = {
        operatorId: 'op-001', operatorCode: 'OP-001', operatorName: 'Rajesh Kumar',
        warehouseId: 'wh-001', warehouseName: 'WH-MUM-MAIN',
        primaryZoneName: 'C-Picking', shiftName: 'Morning (06:00-14:00)',
        skillLevel: 'EXPERT', overallRating: 92,
        certifications: ['FORKLIFT_LICENSE', 'REACH_TRUCK', 'SAFETY_TRAINING'],
        assignedEquipment: [{ type: 'FORKLIFT', code: 'FL-001' }, { type: 'SCANNER', code: 'SC-001' }],
        todayStats: { tasksCompleted: 14, tasksPending: 3, accuracyPercent: 98.5, utilizationPercent: 87 },
        device: { code: 'MD-002', name: 'Zebra TC52', batteryPercent: 88, connectivityStatus: 'ONLINE' },
      }
      return new Response(JSON.stringify(successResponse(profile, 'Profile retrieved')), { headers })
    }

    // GET /api/mobile/tasks — Get assigned tasks for operator
    if (path === '/api/mobile/tasks' && method === 'GET') {
      const tasks = [
        { id: 'wt-001', taskNumber: 'TASK-2026-001', taskType: 'PICK', priority: 'EMERGENCY', status: 'IN_PROGRESS', fromLocationCode: 'C-02-03-A', toLocationCode: 'PK-01', productSku: 'SK-KAJU-500', productName: 'Kaju Katli 500g', batchNumber: 'BATCH-2026-A018', plannedQty: '24', uom: 'PCS', slaDeadline: '2026-07-09T05:15:00Z', waveNumber: 'WAVE-2026-004' },
        { id: 'wt-003', taskNumber: 'TASK-2026-003', taskType: 'PICK', priority: 'HIGH', status: 'OPEN', fromLocationCode: 'C-03-01-B', toLocationCode: 'PK-02', productSku: 'SK-MYSORE-250', productName: 'Mysore Pak 250g', batchNumber: 'BATCH-2026-B042', plannedQty: '48', uom: 'PCS', slaDeadline: '2026-07-09T06:00:00Z', waveNumber: 'WAVE-2026-001' },
        { id: 'wt-011', taskNumber: 'TASK-2026-011', taskType: 'PUTAWAY', priority: 'NORMAL', status: 'OPEN', fromLocationCode: 'RECV-01', toLocationCode: 'B-01-02-C', productSku: 'SK-SAFFRON-10', productName: 'Saffron 10g', batchNumber: 'BATCH-2026-C015', plannedQty: '100', uom: 'PCS', slaDeadline: '2026-07-09T07:00:00Z', waveNumber: null },
        { id: 'wt-015', taskNumber: 'TASK-2026-015', taskType: 'COUNT', priority: 'LOW', status: 'OPEN', fromLocationCode: 'B-01-01', toLocationCode: null, productSku: null, productName: 'Cycle Count Zone B1', batchNumber: null, plannedQty: null, uom: null, slaDeadline: '2026-07-09T12:30:00Z', waveNumber: null },
      ]
      return new Response(JSON.stringify(successResponse(tasks, 'Assigned tasks retrieved')), { headers })
    }

    // POST /api/mobile/scan — Process barcode scan
    if (path === '/api/mobile/scan' && method === 'POST') {
      const body = await req.json()
      const scanResult = {
        scanCode: `SCAN-${Date.now()}`,
        barcodeValue: body.barcodeValue,
        barcodeType: body.barcodeType || 'CODE_128',
        scanSource: body.scanSource || 'INDUSTRIAL_SCANNER',
        validationResult: 'VALID',
        validationMessage: 'Barcode matched — product confirmed',
        product: { sku: 'SK-KAJU-500', name: 'Kaju Katli 500g', batchNumber: 'BATCH-2026-A018', expiryDate: '2026-09-15' },
        bin: { code: 'C-02-03-A', zone: 'C-Picking', availableQty: 156 },
        scanDurationMs: Math.floor(Math.random() * 200) + 80,
        scannedAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(scanResult, 'Scan processed in <300ms')), { headers })
    }

    // POST /api/mobile/tasks/:id/complete — Complete task from mobile
    if (path.match(/^\/api\/mobile\/tasks\/[\w-]+\/complete$/) && method === 'POST') {
      const taskId = path.split('/')[4]
      const body = await req.json().catch(() => ({}))
      const result = {
        taskId, status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        actualQty: body.actualQty || null,
        durationSeconds: body.durationSeconds || null,
        offlineTransactionCode: body.offlineTransactionCode || null,
        nextTaskId: 'wt-003',
        nextTaskNumber: 'TASK-2026-003',
        message: 'Task completed from mobile — next task auto-pushed',
      }
      return new Response(JSON.stringify(successResponse(result, 'Task completed')), { headers })
    }

    // POST /api/mobile/sync — Sync offline transactions
    if (path === '/api/mobile/sync' && method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const result = {
        syncSessionCode: `SYNC-${Date.now()}`,
        syncDirection: 'BIDIRECTIONAL',
        transactionsUploaded: body.transactions?.length || 12,
        transactionsDownloaded: 3,
        conflictsCount: 1,
        failedCount: 0,
        conflicts: [
          { transactionCode: 'OFF-2026-018', conflictReason: 'Bin C-02-03-A qty changed by another operator', suggestedResolution: 'MERGE' },
        ],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 4,
        status: 'PARTIAL',
        message: 'Sync completed with 1 conflict requiring resolution',
      }
      return new Response(JSON.stringify(successResponse(result, 'Sync completed')), { headers })
    }

    // POST /api/mobile/sync/resolve — Resolve sync conflict
    if (path === '/api/mobile/sync/resolve' && method === 'POST') {
      const body = await req.json()
      const result = {
        transactionCode: body.transactionCode,
        conflictResolution: body.resolution || 'MERGE',
        resolvedAt: new Date().toISOString(),
        status: 'SYNCED',
        message: 'Conflict resolved — transaction synced to server',
      }
      return new Response(JSON.stringify(successResponse(result, 'Conflict resolved')), { headers })
    }

    // GET /api/mobile/sync/status — Sync status
    if (path === '/api/mobile/sync/status' && method === 'GET') {
      const status = {
        isOnline: true,
        lastSyncAt: '2026-07-09T05:30:00Z',
        pendingUploads: 2,
        pendingDownloads: 0,
        failedSyncs: 0,
        conflictsPending: 1,
        storageUsed: '12.4 MB',
        storageLimit: '50 MB',
        networkType: 'WIFI',
        syncHealth: 'GOOD',
      }
      return new Response(JSON.stringify(successResponse(status, 'Sync status retrieved')), { headers })
    }

    // GET /api/mobile/inventory-lookup — Inventory lookup
    if (path === '/api/mobile/inventory-lookup' && method === 'GET') {
      const results = [
        { productSku: 'SK-KAJU-500', productName: 'Kaju Katli 500g', batchNumber: 'BATCH-2026-A018', binCode: 'C-02-03-A', availableQty: 156, reservedQty: 24, allocatedQty: 0, expiryDate: '2026-09-15', status: 'AVAILABLE' },
        { productSku: 'SK-KAJU-500', productName: 'Kaju Katli 500g', batchNumber: 'BATCH-2026-A019', binCode: 'C-02-04-B', availableQty: 84, reservedQty: 0, allocatedQty: 0, expiryDate: '2026-09-22', status: 'AVAILABLE' },
        { productSku: 'SK-KAJU-500', productName: 'Kaju Katli 500g', batchNumber: 'BATCH-2026-A015', binCode: 'B-01-03-A', availableQty: 12, reservedQty: 0, allocatedQty: 0, expiryDate: '2026-08-10', status: 'NEAR_EXPIRY' },
      ]
      return new Response(JSON.stringify(successResponse(results, 'Inventory lookup results')), { headers })
    }

    // GET /api/mobile/notifications — Notifications
    if (path === '/api/mobile/notifications' && method === 'GET') {
      const notifications = [
        { id: 'mn-001', notificationType: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'TASK-2026-015 (Cycle Count) assigned to you', priority: 'NORMAL', status: 'DELIVERED', actionType: 'OPEN_TASK', createdAt: '2026-07-09T05:00:00Z' },
        { id: 'mn-002', notificationType: 'EMERGENCY_TASK', title: 'EMERGENCY: Pick Task', message: 'TASK-2026-001 — Kaju Katli 500g, 24 PCS from C-02-03-A', priority: 'EMERGENCY', status: 'DELIVERED', actionType: 'OPEN_TASK', createdAt: '2026-07-09T04:45:00Z' },
        { id: 'mn-003', notificationType: 'LOW_BATTERY', title: 'Low Battery Alert', message: 'Scanner SC-005 at 18% — please return to charging station', priority: 'HIGH', status: 'DELIVERED', actionType: 'DISMISS', createdAt: '2026-07-09T04:30:00Z' },
        { id: 'mn-004', notificationType: 'SYNC_FAILURE', title: 'Sync Failed', message: '1 transaction failed to sync — will retry automatically', priority: 'NORMAL', status: 'DELIVERED', actionType: 'OPEN_SYNC', createdAt: '2026-07-09T04:15:00Z' },
      ]
      return new Response(JSON.stringify(successResponse(notifications, 'Notifications retrieved')), { headers })
    }

    // GET /api/mobile/dashboard — Mobile dashboard data
    if (path === '/api/mobile/dashboard' && method === 'GET') {
      const data = {
        operator: { code: 'OP-001', name: 'Rajesh Kumar', shift: 'Morning (06:00-14:00)' },
        todayStats: { tasksCompleted: 14, tasksPending: 3, tasksTotal: 17, accuracyPercent: 98.5, utilizationPercent: 87, hoursWorked: 4.5 },
        assignedTasks: 4,
        equipment: [{ type: 'FORKLIFT', code: 'FL-001', batteryPercent: 78 }, { type: 'SCANNER', code: 'SC-001', batteryPercent: 88 }],
        device: { code: 'MD-002', batteryPercent: 88, isCharging: false, connectivityStatus: 'ONLINE', lastSyncAt: '2026-07-09T05:30:00Z' },
        syncStatus: { isOnline: true, pendingUploads: 2, conflictsPending: 1, storageUsed: '12.4 MB' },
        announcements: [
          { title: 'Shift Change Reminder', message: 'Morning shift ends at 14:00 — please complete handover', priority: 'NORMAL' },
          { title: 'New SKU Added', message: 'Shwet Idli Batter 1kg now available in Zone C', priority: 'LOW' },
        ],
        warehouseAlerts: [
          { title: 'Dock DOCK-04 Maintenance', message: 'DOCK-04 unavailable until 12:00', severity: 'WARNING' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Dashboard data retrieved')), { headers })
    }

    // GET /api/mobile/info — Sprint 31 info
    if (path === '/api/mobile/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 31,
        sprintName: 'Enterprise Warehouse Mobile Platform & Barcode Scanning Application',
        version: '31.0.0',
        part: 4,
        tables: 7,
        epics: [
          'Epic 1: Authentication & Device Registration (PIN/Biometric/QR/Offline login)',
          'Epic 2: Warehouse Home Dashboard (tasks, performance, equipment, sync)',
          'Epic 3: Barcode Scanning Engine (10 symbologies, <300ms target)',
          'Epic 4: Task Execution Engine (8 task types: Receive/Putaway/Pick/Pack/Transfer/Count/Load/Inspect)',
          'Epic 5: Offline Sync Engine (offline login, offline scan, conflict resolution, retry queue)',
          'Epic 6: Inventory Lookup (by barcode/QR/product/batch/bin/serial/lot)',
          'Epic 7: Notifications (task assigned, emergency, low battery, sync failure)',
          'Epic 8: Mobile Settings (dark mode, language, scanner sensitivity, offline storage)',
        ],
        domainEvents: ['DeviceRegistered', 'OperatorLoggedIn', 'TaskAccepted', 'BarcodeScanned', 'TaskCompleted', 'OfflineSyncStarted', 'OfflineSyncCompleted', 'ConflictResolved'],
        supportedDevices: ['Android Phone', 'Industrial Handheld', 'Zebra TC Series', 'Honeywell Scanner', 'Chainway', 'Urovo', 'Bluetooth Scanner', 'Built-in Camera Scanner', 'Android Tablet'],
        supportedBarcodes: ['Code 128', 'Code 39', 'EAN-13', 'EAN-8', 'UPC', 'QR Code', 'GS1-128', 'GS1 DataMatrix', 'PDF417', 'Aztec'],
        authPrinciple: 'Mobile Auth supports 5 login methods: EMPLOYEE_LOGIN (email+password), PIN_LOGIN (4-6 digit PIN), BIOMETRIC_LOGIN (fingerprint/face), QR_LOGIN (scan QR from desktop ERP), OFFLINE_LOGIN (cached credentials). JWT token + refresh token, 8-hour session, auto-renewal. Device binding: only registered devices can log in. Operators can only log in to assigned warehouses. Remote device logout and remote device wipe supported for lost devices.',
        scannerPrinciple: 'Scanner Engine supports 4 scan modes: CONTINUOUS_SCAN (keep scanning for bulk operations), SINGLE_SCAN (one scan, then confirm), BULK_SCAN (accumulate multiple, then submit), LOOKUP_SCAN (scan to search inventory). 10 barcode symbologies supported. Validation: WRONG_PRODUCT, WRONG_BATCH, WRONG_BIN, WRONG_QTY, DUPLICATE_SCAN, UNKNOWN_BARCODE. Performance target: <300ms per scan including validation. Sources: CAMERA (built-in), INDUSTRIAL_SCANNER (Zebra/Honeywell hardware), BLUETOOTH_SCANNER (paired device), SOFTWARE (manual entry).',
        offlinePrinciple: 'Offline Sync Engine enables full warehouse operations without network. Offline capabilities: login (cached credentials), task execution (pre-downloaded tasks), scanning (validated locally against cached master data), inventory lookup (cached). Every offline transaction is cryptographically signed (HMAC) for tamper-evidence. On reconnect: transactions uploaded, conflicts detected, resolution rules applied (OVERWRITE_SERVER, KEEP_SERVER, MERGE, MANUAL_REVIEW). Retry queue with exponential backoff. Max 5 attempts per transaction.',
        conflictResolutionPrinciple: 'Conflict Resolution handles 4 scenarios: (1) Bin qty changed by another operator — MERGE (sum the changes), (2) Batch expired since offline — KEEP_SERVER (reject offline transaction), (3) Product moved to different bin — MANUAL_REVIEW (supervisor decides), (4) Duplicate scan detected — OVERWRITE_SERVER (latest wins). Conflicts require explicit resolution before transaction is marked SYNCED. All resolutions are audited.',
        taskExecutionPrinciple: 'Task Execution follows 5-step workflow: Task → Scan → Validate → Confirm → Next Task. Maximum 3 taps to complete any operation after scanning. One screen = one task (no multi-tasking on mobile). Large touch targets for gloved operators. Voice and vibration feedback for successful and failed scans. Live task push from ERP (no manual selection). Next task auto-assigned based on priority + proximity + skill.',
        mobileSecurityPrinciple: 'Mobile Security enforces: JWT authentication with refresh tokens, device binding (registered IMEI only), encrypted offline storage (AES-256), TLS 1.3 communication, role-based access (operator sees only assigned tasks), session timeout (8 hours), remote device logout, remote device wipe (for lost devices). Every mobile action generates an audit log. Cryptographic signatures on offline transactions prevent tampering.',
        chiefArchitectRecommendation: 'For Sudhamrit, evolve the existing warehouse barcode scanning app into the SUOP Warehouse Execution App with these design principles: Scanner-first, keyboard-last. One screen = one task. Maximum 3 taps to complete any operation after scanning. Large touch targets for gloved operators. Full offline capability with automatic synchronization. Live task push from the ERP. Voice and vibration feedback for successful and failed scans. Support for industrial handheld scanners (Zebra, Honeywell, Chainway, Urovo) in addition to standard Android devices.',
        endpoints: [
          'POST /api/mobile/login', 'POST /api/mobile/register', 'POST /api/mobile/logout', 'GET /api/mobile/profile',
          'GET /api/mobile/tasks', 'POST /api/mobile/tasks/:id/complete',
          'POST /api/mobile/scan',
          'POST /api/mobile/sync', 'POST /api/mobile/sync/resolve', 'GET /api/mobile/sync/status',
          'GET /api/mobile/inventory-lookup',
          'GET /api/mobile/notifications',
          'GET /api/mobile/dashboard',
          'GET /api/mobile/info',
        ],
        part4Sprint: 10,
        part4Sprints: 12,
        part4Tables: 83,
      }, 'SUOP Warehouse Mobile Platform v31.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 32 — WAREHOUSE ANALYTICS, KPI ENGINE & PERFORMANCE
    // ═════════════════════════════════════════════════════════

    // GET /api/warehouse-analytics/mission-control — Live mission control data
    if (path === '/api/warehouse-analytics/mission-control' && method === 'GET') {
      const data = {
        widgets: {
          warehouseHealth: { grade: 'A+', score: 92, trend: '+2' },
          liveTasks: { value: 47, inProgress: 12, trend: '+5' },
          ordersToday: { value: 184, target: 200, trend: '+12%' },
          dockUtilization: { value: 67, active: 6, total: 9, trend: '+5%' },
          equipmentStatus: { active: 8, total: 10, trend: '0' },
          activeOperators: { value: 14, onBreak: 2, trend: '+1' },
          capacityUsed: { value: 78, trend: '+3%' },
          slaCompliance: { value: 94.2, target: 95, trend: '+1.2%' },
          costToday: { value: 240000, perOrder: 130, trend: '-5%' },
          criticalAlerts: { value: 3, critical: 1, trend: '+1' },
        },
        scorecard: {
          score: 92, grade: 'A+',
          kpis: [
            { kpi: 'Inventory Accuracy', value: 99.85, target: 99.8, met: true },
            { kpi: 'Picking Accuracy', value: 99.92, target: 99.9, met: true },
            { kpi: 'Putaway SLA Compliance', value: 98.5, target: 98, met: true },
            { kpi: 'Dispatch On-Time Rate', value: 99.1, target: 99, met: true },
            { kpi: 'Order Fulfillment Accuracy', value: 99.87, target: 99.8, met: true },
            { kpi: 'Dock-to-Stock Time', value: 28, target: 30, met: true, unit: 'min' },
            { kpi: 'Equipment Utilization', value: 84, target: 85, met: false, unit: '%' },
            { kpi: 'Capacity Utilization', value: 78, target: 80, met: false, unit: '%' },
          ],
        },
        alerts: [
          { sev: 'CRITICAL', msg: 'SLA breach on TASK-2026-009 (PICK) — 35 min overdue', time: '2 min ago' },
          { sev: 'HIGH', msg: 'Zone C-Picking congestion — 14 active tasks', time: '8 min ago' },
        ],
        bottlenecks: [
          { type: 'SLOW_ZONE', loc: 'C-Picking', impact: 78, delay: 12 },
          { type: 'EQUIPMENT_DELAY', loc: 'FL-004 (broken)', impact: 88, delay: 95 },
        ],
        timestamp: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, 'Mission control live data')), { headers })
    }

    // GET /api/warehouse-analytics/kpis — KPI dashboard
    if (path === '/api/warehouse-analytics/kpis' && method === 'GET') {
      const period = url.searchParams.get('period') || 'MONTHLY'
      const data = {
        period,
        kpis: [
          { label: 'Orders Processed', value: 4287, target: 4500, trend: '+8%' },
          { label: 'Lines Processed', value: 28456, target: 30000, trend: '+5%' },
          { label: 'Units Processed', value: 142890, target: 150000, trend: '+12%' },
          { label: 'Tasks Completed', value: 12847, target: 13000, trend: '+3%' },
          { label: 'Inventory Accuracy', value: 99.85, target: 99.8, trend: '+0.05%', unit: '%' },
          { label: 'Picking Accuracy', value: 99.92, target: 99.9, trend: '+0.02%', unit: '%' },
          { label: 'Task Completion Rate', value: 98.8, target: 99, trend: '-0.2%', unit: '%' },
          { label: 'Warehouse Throughput', value: 189, target: 200, trend: '+5%', unit: 'u/hr' },
        ],
        timeKPIs: [
          { label: 'Receiving Time', value: 42, target: 45, unit: 'min', met: true },
          { label: 'Putaway Time', value: 28, target: 30, unit: 'min', met: true },
          { label: 'Picking Time', value: 4.2, target: 5.0, unit: 'min', met: true },
          { label: 'Packing Time', value: 18, target: 20, unit: 'min', met: true },
          { label: 'Dispatch Time', value: 78, target: 90, unit: 'min', met: true },
          { label: 'Dock-to-Stock Time', value: 28, target: 30, unit: 'min', met: true },
        ],
        utilizationKPIs: [
          { label: 'Dock Utilization', value: 67, target: 80, unit: '%' },
          { label: 'Equipment Utilization', value: 84, target: 85, unit: '%' },
          { label: 'Capacity Utilization', value: 78, target: 80, unit: '%' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'KPIs retrieved')), { headers })
    }

    // GET /api/warehouse-analytics/operator-productivity — Operator productivity
    if (path === '/api/warehouse-analytics/operator-productivity' && method === 'GET') {
      const data = [
        { rank: 1, code: 'OP-003', name: 'Suresh Mehta', zone: 'E-Dispatch', tasks: 92, accuracy: 99.1, util: 94, tasksPerHour: 18.2, unitsPerHour: 124, travelDistanceM: 2400, idleMin: 12, hours: 42, overtime: 4, grade: 'A+', score: 94, rec: 'TOP_PERFORMER' },
        { rank: 2, code: 'OP-001', name: 'Rajesh Kumar', zone: 'C-Picking', tasks: 78, accuracy: 98.5, util: 87, tasksPerHour: 16.8, unitsPerHour: 112, travelDistanceM: 2800, idleMin: 18, hours: 38, overtime: 2, grade: 'A', score: 88, rec: 'ON_TRACK' },
        { rank: 7, code: 'OP-008', name: 'Priya Nair', zone: 'D-Pack', tasks: 18, accuracy: 92.0, util: 54, tasksPerHour: 8.2, unitsPerHour: 52, travelDistanceM: 4200, idleMin: 48, hours: 22, overtime: 0, grade: 'C', score: 55, rec: 'NEEDS_TRAINING', trainingNeeded: ['PICKING_OPTIMIZATION', 'SCANNER_EFFICIENCY'] },
      ]
      return new Response(JSON.stringify(successResponse(data, 'Operator productivity retrieved')), { headers })
    }

    // GET /api/warehouse-analytics/heatmaps — Heat map data
    if (path === '/api/warehouse-analytics/heatmaps' && method === 'GET') {
      const type = url.searchParams.get('type') || 'TRAFFIC'
      const data = {
        type,
        zones: [
          { zone: 'A-Receiving', traffic: 75, picking: 5, receiving: 92, congestion: 45, occupancy: 68, dock: 88 },
          { zone: 'B-Bulk', traffic: 45, picking: 28, receiving: 12, congestion: 25, occupancy: 78, dock: 0 },
          { zone: 'C-Picking', traffic: 92, picking: 95, receiving: 5, congestion: 88, occupancy: 84, dock: 0 },
          { zone: 'D-Pack', traffic: 68, picking: 12, receiving: 8, congestion: 62, occupancy: 55, dock: 0 },
          { zone: 'E-Dispatch', traffic: 88, picking: 8, receiving: 18, congestion: 72, occupancy: 62, dock: 92 },
          { zone: 'F-Cold', traffic: 30, picking: 22, receiving: 15, congestion: 18, occupancy: 45, dock: 38 },
        ],
        binGrid: Array.from({ length: 48 }, (_, i) => ({ code: `B-${String(i + 1).padStart(3, '0')}`, intensity: Math.floor(Math.random() * 100) })),
      }
      return new Response(JSON.stringify(successResponse(data, 'Heat map data retrieved')), { headers })
    }

    // GET /api/warehouse-analytics/costs — Cost analytics
    if (path === '/api/warehouse-analytics/costs' && method === 'GET') {
      const data = {
        totalCost: 6000000,
        costPerOrder: 901,
        costPerUnit: 42,
        costPerTask: 467,
        breakdown: [
          { type: 'Labor', amount: 2850000, pct: 48 },
          { type: 'Equipment', amount: 850000, pct: 14 },
          { type: 'Energy', amount: 420000, pct: 7 },
          { type: 'Packaging', amount: 680000, pct: 11 },
          { type: 'Maintenance', amount: 520000, pct: 9 },
          { type: 'Transportation', amount: 380000, pct: 6 },
          { type: 'Storage', amount: 180000, pct: 3 },
          { type: 'Overhead', amount: 120000, pct: 2 },
        ],
        byWarehouse: [
          { wh: 'WH-MUM-MAIN', cost: 3240000, orders: 2840, costPerOrder: 1141 },
          { wh: 'WH-DEL-NORTH', cost: 1860000, orders: 1620, costPerOrder: 1148 },
          { wh: 'WH-BLR-CENTRAL', cost: 1420000, orders: 1280, costPerOrder: 1109 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Cost analytics retrieved')), { headers })
    }

    // GET /api/warehouse-analytics/sla — SLA & bottleneck analytics
    if (path === '/api/warehouse-analytics/sla' && method === 'GET') {
      const data = {
        slaByType: [
          { type: 'Receiving SLA', target: 60, actual: 42, onTime: 94, violations: 9, total: 156 },
          { type: 'Picking SLA', target: 30, actual: 28, onTime: 88, violations: 49, total: 412 },
          { type: 'Dispatch SLA', target: 90, actual: 78, onTime: 93, violations: 12, total: 178 },
        ],
        bottlenecks: [
          { type: 'SLOW_ZONE', loc: 'C-Picking Zone', severity: 'HIGH', impact: 78, affectedTasks: 14, delay: 12, rootCause: '14 active tasks in single zone', action: 'Reassign 4 tasks to B-Bulk zone operators', status: 'OPEN' },
          { type: 'EQUIPMENT_DELAY', loc: 'FL-004 (Forklift)', severity: 'CRITICAL', impact: 88, affectedTasks: 3, delay: 95, rootCause: 'Hydraulic pump failure', action: 'Replace forklift or rent temporary', status: 'INVESTIGATING' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'SLA analytics retrieved')), { headers })
    }

    // GET /api/warehouse-analytics/reports — Executive reports
    if (path === '/api/warehouse-analytics/reports' && method === 'GET') {
      const data = [
        { name: 'Daily Warehouse Scorecard', schedule: 'Daily 06:00 AM', recipients: 12, lastSent: 'Today 06:00', format: 'PDF + Email' },
        { name: 'Weekly Operator Performance', schedule: 'Every Monday 08:00 AM', recipients: 8, lastSent: 'Mon 08:00', format: 'Excel + Email' },
        { name: 'Monthly Cost Analysis', schedule: '1st of month 09:00 AM', recipients: 6, lastSent: 'Jul 01 09:00', format: 'PDF + Dashboard' },
        { name: 'Quarterly Executive Summary', schedule: 'Quarterly', recipients: 4, lastSent: 'Jul 01 09:00', format: 'PDF Presentation' },
      ]
      return new Response(JSON.stringify(successResponse(data, 'Executive reports retrieved')), { headers })
    }

    // GET /api/warehouse-analytics/info — Sprint 32 info
    if (path === '/api/warehouse-analytics/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 32,
        sprintName: 'Enterprise Warehouse Analytics, KPI Engine & Performance Intelligence',
        version: '32.0.0',
        part: 4,
        tables: 6,
        epics: [
          'Epic 1: Warehouse Mission Control Dashboard (10 widgets, multi-warehouse, live refresh)',
          'Epic 2: KPI Engine (orders, time, utilization, quality, SLA, cost — daily/weekly/monthly/quarterly/yearly)',
          'Epic 3: Operator Productivity Analytics (tasks, accuracy, travel, idle, scanner, attendance, leaderboard)',
          'Epic 4: Equipment Analytics (MTBF, MTTR, utilization, maintenance cost, availability)',
          'Epic 5: Warehouse Heat Maps (traffic, picking, receiving, congestion, bin occupancy, dock, travel path)',
          'Epic 6: Warehouse Cost Analytics (labor, equipment, energy, packaging, maintenance, transport, storage)',
          'Epic 7: SLA & Bottleneck Analysis (slow zones, operators, equipment, dock, queue delays)',
          'Epic 8: Predictive Warehouse Intelligence (labor, equipment failures, congestion, peak hours — AI-ready)',
          'Epic 9: Executive Reports (scheduled, role-based, PDF/Excel/Dashboard)',
        ],
        domainEvents: ['KPIUpdated', 'OperatorPerformanceCalculated', 'HeatMapGenerated', 'CostCalculated', 'SLAViolationDetected', 'WarehouseAlertGenerated', 'AnalyticsRefreshed'],
        kpiEnginePrinciple: 'KPI Engine tracks 4 categories: Throughput (orders, lines, units, tasks), Time (receiving/putaway/picking/packing/dispatch/dock-to-stock minutes), Utilization (dock/equipment/capacity %), Quality (inventory/picking/putaway accuracy, task completion, dispatch on-time, order fulfillment accuracy). Periods: Daily, Weekly, Monthly, Quarterly, Yearly. Auto-refresh every 5 minutes. Scorecard computes composite grade (A+/A/B/C/D) from 10 weighted KPIs.',
        productivityPrinciple: 'Operator Productivity measures 12 dimensions: tasks completed/assigned, completion rate, avg task time, total work time, idle time, travel time, travel distance, picking/putaway/scan accuracy, error count, scanner/forklift usage minutes, total scans, hours worked, overtime, attendance days, late days, tasks/hour, units/hour, utilization %. Composite score (0-100) → grade → recommendation (TOP_PERFORMER/ON_TRACK/NEEDS_IMPROVEMENT/NEEDS_TRAINING). AI suggests training and zone reassignment.',
        heatmapPrinciple: 'Heat Maps visualize 7 dimensions: TRAFFIC (operator visits), PICKING (pick frequency), RECEIVING (inbound frequency), CONGESTION (simultaneous operators), BIN_OCCUPANCY (storage utilization), TRAVEL_PATH (operator movement), DOCK_ACTIVITY (dock throughput). Intensity 0-100. Color: green (<30) → emerald (30-60) → amber (60-80) → red (80-100). Future: 3D Digital Twin, Indoor Navigation.',
        costPrinciple: 'Cost Analytics allocates 8 cost types: Labor (48%), Equipment (14%), Energy (7%), Packaging (11%), Maintenance (9%), Transportation (6%), Storage (3%), Overhead (2%). Allocation basis: HOURS, UNITS, ORDERS, AREA, HEADCOUNT. Reports by warehouse, zone, operator, product, customer. Per-unit metrics: cost per order, cost per unit, cost per task. Reconciles with Finance.',
        bottleneckPrinciple: 'Bottleneck Detection identifies 6 types: SLOW_ZONE (high task density), SLOW_OPERATOR (low productivity), EQUIPMENT_DELAY (breakdowns), DOCK_DELAY (maintenance/congestion), QUEUE_DELAY (yard backup), SLA_VIOLATION (overdue tasks). Severity: LOW/MEDIUM/HIGH/CRITICAL. Impact score 0-100. Root cause analysis + recommended action. Status: OPEN → INVESTIGATING → RESOLVING → RESOLVED.',
        chiefArchitectRecommendation: 'Add a Warehouse Scorecard reviewed daily by management. 10 KPIs with targets: Inventory Accuracy (≥99.8%), Picking Accuracy (≥99.9%), Putaway SLA (≥98%), Dispatch On-Time (≥99%), Order Fulfillment Accuracy (≥99.8%), Dock-to-Stock Time (<30 min), Avg Picking Time (configurable), Equipment Utilization (80-90%), Operator Productivity (tasks/hr by role), Capacity Utilization (75-85%). Visible on Mission Control dashboard, accessible to supervisors, warehouse managers, operations heads, executives.',
        endpoints: [
          'GET /api/warehouse-analytics/mission-control',
          'GET /api/warehouse-analytics/kpis',
          'GET /api/warehouse-analytics/operator-productivity',
          'GET /api/warehouse-analytics/heatmaps',
          'GET /api/warehouse-analytics/costs',
          'GET /api/warehouse-analytics/sla',
          'GET /api/warehouse-analytics/reports',
          'GET /api/warehouse-analytics/info',
        ],
        part4Sprint: 11,
        part4Sprints: 12,
        part4Tables: 89,
      }, 'SUOP Warehouse Analytics & KPI Engine v32.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 33 — MISSION CONTROL, AI OPS & DIGITAL TWIN (FINAL)
    // ═════════════════════════════════════════════════════════

    // GET /api/enterprise/mission-control — Enterprise mission control
    if (path === '/api/enterprise/mission-control' && method === 'GET') {
      const data = {
        scope: 'ENTERPRISE',
        overallHealthScore: 88,
        operationsScore: 90, inventoryScore: 99, equipmentScore: 84, workforceScore: 87, slaScore: 94,
        totalWarehouses: 4, healthyWarehouses: 3, warningWarehouses: 1, criticalWarehouses: 0,
        totalLiveTasks: 125, totalActiveOperators: 38, totalEquipmentActive: 28, totalCriticalAlerts: 3,
        ordersToday: 729, linesToday: 4856, unitsToday: 24580,
        enterpriseSlaPct: 94.2,
        sections: [
          { label: 'Warehouse Health', value: 88, grade: 'A' },
          { label: 'Inventory Health', value: 99.85, unit: '%' },
          { label: 'Dock Activity', value: '18/24', sub: 'docks active' },
          { label: 'Receiving', value: 22, sub: 'in progress' },
          { label: 'Picking', value: 47, sub: 'active tasks' },
          { label: 'Packing', value: 18, sub: 'in progress' },
          { label: 'Dispatch', value: 12, sub: 'loading' },
          { label: 'Equipment', value: '28/32', sub: 'active' },
          { label: 'Operators', value: 38, sub: 'active' },
          { label: 'Alerts', value: 7, sub: '3 critical' },
          { label: 'SLA Status', value: 94.2, unit: '%' },
        ],
        timestamp: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, 'Enterprise mission control live data')), { headers })
    }

    // GET /api/enterprise/control-tower — Multi-warehouse control tower
    if (path === '/api/enterprise/control-tower' && method === 'GET') {
      const warehouses = [
        { wh: 'WH-MUM-MAIN', region: 'Mumbai', score: 92, grade: 'A+', status: 'OPERATIONAL', tasks: 47, operators: 14, capacity: 82, sla: 94.2, orders: 184, risk: 22, delays: 1 },
        { wh: 'WH-DEL-NORTH', region: 'Delhi', score: 88, grade: 'A', status: 'OPERATIONAL', tasks: 32, operators: 10, capacity: 75, sla: 96.1, orders: 142, risk: 18, delays: 0 },
        { wh: 'WH-BLR-CENTRAL', region: 'Bangalore', score: 85, grade: 'A', status: 'OPERATIONAL', tasks: 28, operators: 8, capacity: 78, sla: 95.5, orders: 128, risk: 20, delays: 0 },
        { wh: 'WH-HYD-WEST', region: 'Hyderabad', score: 72, grade: 'B', status: 'WARNING', tasks: 18, operators: 6, capacity: 68, sla: 89.3, orders: 92, risk: 58, delays: 3 },
      ]
      return new Response(JSON.stringify(successResponse({ warehouses, totalWarehouses: warehouses.length, operational: 3, warning: 1 }, 'Control tower data')), { headers })
    }

    // GET /api/enterprise/digital-twin — Digital twin snapshot
    if (path === '/api/enterprise/digital-twin' && method === 'GET') {
      const data = {
        warehouseId: 'wh-001', warehouseName: 'WH-MUM-MAIN',
        totalBins: 1247, occupiedBins: 892, emptyBins: 355,
        zones: [
          { name: 'A-Receiving', occupancy: 68, operators: 2, equipment: 1, heat: 75 },
          { name: 'B-Bulk', occupancy: 78, operators: 1, equipment: 2, heat: 45 },
          { name: 'C-Picking', occupancy: 84, operators: 5, equipment: 3, heat: 92 },
          { name: 'D-Pack', occupancy: 55, operators: 3, equipment: 1, heat: 68 },
          { name: 'E-Dispatch', occupancy: 62, operators: 2, equipment: 2, heat: 88 },
          { name: 'F-Cold', occupancy: 45, operators: 1, equipment: 1, heat: 30 },
        ],
        operators: [
          { id: 'op-001', name: 'Rajesh Kumar', zone: 'C-Picking', task: 'TASK-2026-002' },
          { id: 'op-003', name: 'Suresh Mehta', zone: 'E-Dispatch', task: 'TASK-2026-001' },
        ],
        equipment: [
          { code: 'FL-001', type: 'Forklift', zone: 'C-Picking', battery: 78, status: 'IN_USE' },
          { code: 'FL-004', type: 'Forklift', zone: 'Maintenance', battery: 0, status: 'BREAKDOWN' },
        ],
        capturedAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, 'Digital twin snapshot')), { headers })
    }

    // GET /api/enterprise/ai-recommendations — AI operations
    if (path === '/api/enterprise/ai-recommendations' && method === 'GET') {
      const data = [
        { code: 'AIR-2026-018', category: 'STAFFING', type: 'ASSIGN_MORE_STAFF', title: 'Assign 2 more pickers to C-Picking', risk: 78, confidence: 92, impact: 85, benefit: '+22% picking throughput', status: 'PENDING' },
        { code: 'AIR-2026-017', category: 'EQUIPMENT', type: 'INCREASE_PICKING_TEAM', title: 'FL-004 breakdown — rent replacement', risk: 88, confidence: 95, impact: 92, benefit: 'Prevent 4h downtime', status: 'ACCEPTED' },
      ]
      return new Response(JSON.stringify(successResponse(data, 'AI recommendations')), { headers })
    }

    // GET /api/enterprise/alerts — Enterprise alerts
    if (path === '/api/enterprise/alerts' && method === 'GET') {
      const data = [
        { code: 'EA-2026-028', type: 'CRITICAL', category: 'SLA_VIOLATION', title: 'SLA breach — TASK-2026-009', severity: 'CRITICAL', status: 'OPEN', channels: ['DASHBOARD', 'MOBILE_APP', 'SMS', 'TEAMS'] },
        { code: 'EA-2026-027', type: 'EMERGENCY', category: 'EQUIPMENT_FAILURE', title: 'FL-004 hydraulic failure', severity: 'CRITICAL', status: 'ACKNOWLEDGED', channels: ['DASHBOARD', 'WHATSAPP'] },
      ]
      return new Response(JSON.stringify(successResponse(data, 'Enterprise alerts')), { headers })
    }

    // POST /api/enterprise/alerts/:id/acknowledge — Acknowledge alert
    if (path.match(/^\/api\/enterprise\/alerts\/[\w-]+\/acknowledge$/) && method === 'POST') {
      const id = path.split('/')[4]
      const result = { id, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() }
      return new Response(JSON.stringify(successResponse(result, 'Alert acknowledged')), { headers })
    }

    // GET /api/enterprise/recovery — Disaster recovery dashboard
    if (path === '/api/enterprise/recovery' && method === 'GET') {
      const data = {
        systems: [
          { name: 'ERP Backend', status: 'HEALTHY', score: 99, uptime: 99.97, responseMs: 142, cpu: 42, memory: 58 },
          { name: 'Database', status: 'HEALTHY', score: 100, uptime: 99.99, responseMs: 8, cpu: 35, memory: 62 },
          { name: 'Redis', status: 'HEALTHY', score: 98, uptime: 99.95, responseMs: 2, cpu: 22, memory: 71 },
          { name: 'Mobile API', status: 'DEGRADED', score: 82, uptime: 98.82, responseMs: 385, cpu: 78, memory: 82 },
        ],
        incidents: [
          { code: 'INC-2026-008', type: 'API_HEALTH', title: 'Mobile API degraded', severity: 'HIGH', status: 'RECOVERY_IN_PROGRESS', downtime: 15 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Recovery dashboard data')), { headers })
    }

    // GET /api/enterprise/executive-dashboard — Executive dashboard
    if (path === '/api/enterprise/executive-dashboard' && method === 'GET') {
      const data = {
        kpis: [
          { label: 'Enterprise SLA', value: '94.2%', target: '95%' },
          { label: 'Total Orders (30d)', value: 14287, target: 15000 },
          { label: 'Inventory Value', value: '₹42.8Cr', target: '₹45Cr' },
          { label: 'Profit Impact', value: '₹1.95Cr', target: '₹2Cr' },
        ],
        warehouseRankings: [
          { wh: 'WH-MUM-MAIN', rank: 1, score: 92, orders: 184, sla: 94.2, profit: 5180000 },
          { wh: 'WH-DEL-NORTH', rank: 2, score: 88, orders: 142, sla: 96.1, profit: 3820000 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Executive dashboard data')), { headers })
    }

    // GET /api/enterprise/info — Sprint 33 info
    if (path === '/api/enterprise/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 33,
        sprintName: 'Enterprise Warehouse Mission Control, AI Operations Center & Digital Twin',
        version: '33.0.0',
        part: 4,
        tables: 8,
        epics: [
          'Epic 1: Warehouse Mission Control (11 sections, real-time, multi-warehouse)',
          'Epic 2: Enterprise Control Tower (single screen, TV dashboard, operations center)',
          'Epic 3: Warehouse Digital Twin (zones, bins, operators, equipment, heat maps)',
          'Epic 4: AI Operations Center (9 domains, recommendations, predictions)',
          'Epic 5: Predictive Warehouse Intelligence (8 prediction types, risk scores)',
          'Epic 6: Enterprise Alert Engine (8 alert types, 7 channels, escalation)',
          'Epic 7: Disaster Recovery & Business Continuity (8 incident types, failover)',
          'Epic 8: Executive Command Dashboard (KPIs, rankings, profit impact)',
        ],
        domainEvents: ['WarehouseAlertRaised', 'AIRecommendationGenerated', 'ControlTowerUpdated', 'DigitalTwinRefreshed', 'RiskDetected', 'RecoveryStarted', 'RecoveryCompleted', 'MissionControlUpdated'],
        threeAppArchitecture: 'Chief Architect Final WMS Design: (1) Warehouse ERP (Web) — managers/supervisors for configuration, planning, analytics, mission control. (2) Warehouse Execution App (Android/React Native) — operators for barcode scanning, receiving, putaway, picking, offline sync. (3) Executive Control Tower (Web) — directors/CEO for multi-warehouse monitoring, live KPIs, AI recommendations, digital twin.',
        part4Complete: true,
        part4Sprints: 12,
        part4Tables: 97,
        totalProjectTables: 282,
        endpoints: [
          'GET /api/enterprise/mission-control',
          'GET /api/enterprise/control-tower',
          'GET /api/enterprise/digital-twin',
          'GET /api/enterprise/ai-recommendations',
          'GET /api/enterprise/alerts', 'POST /api/enterprise/alerts/:id/acknowledge',
          'GET /api/enterprise/recovery',
          'GET /api/enterprise/executive-dashboard',
          'GET /api/enterprise/info',
        ],
        nextPhase: 'Part 5 — Enterprise Manufacturing Execution System (MES) & Production Management: Production Planning, BOM, Recipes & Formulations (critical for Sudhamrit), Work Orders, Shop Floor Execution, Machine Integration, Quality Control, OEE, Production Costing, Batch Manufacturing, AI Production Optimization.',
      }, '🎉 SUOP Part 4 WMS COMPLETE — Mission Control, AI Ops & Digital Twin v33.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 34 — MANUFACTURING FOUNDATION (PART 5 MES)
    // ═════════════════════════════════════════════════════════

    // GET /api/manufacturing/plants — List all plants
    if (path === '/api/manufacturing/plants' && method === 'GET') {
      const plants = [
        { id: 'mp-001', plantCode: 'PLANT-THANE-01', plantName: 'Thane Sweet Manufacturing Plant', plantType: 'SWEET_MANUFACTURING', managerName: 'Rajesh Patil', city: 'Thane', state: 'Maharashtra', capacityPerDayKg: 2500, operatingHoursStart: '06:00', operatingHoursEnd: '22:00', status: 'ACTIVE', departments: 5, lines: 8, resources: 42 },
        { id: 'mp-002', plantCode: 'PLANT-THANE-02', plantName: 'Thane Namkeen Plant', plantType: 'NAMKEEN_MANUFACTURING', managerName: 'Suresh Iyer', city: 'Thane', state: 'Maharashtra', capacityPerDayKg: 1800, operatingHoursStart: '06:00', operatingHoursEnd: '22:00', status: 'ACTIVE', departments: 4, lines: 6, resources: 28 },
        { id: 'mp-003', plantCode: 'PLANT-BLR-01', plantName: 'Bangalore Batter Production', plantType: 'BATTER_PRODUCTION', managerName: 'Anil Reddy', city: 'Bangalore', state: 'Karnataka', capacityPerDayKg: 1200, operatingHoursStart: '05:00', operatingHoursEnd: '20:00', status: 'ACTIVE', departments: 3, lines: 4, resources: 18 },
      ]
      return new Response(JSON.stringify(successResponse(plants, 'Manufacturing plants retrieved')), { headers })
    }

    // POST /api/manufacturing/plants — Create plant
    if (path === '/api/manufacturing/plants' && method === 'POST') {
      const body = await req.json()
      const plant = { id: `mp-${Date.now()}`, plantCode: body.plantCode, plantName: body.plantName, plantType: body.plantType, status: 'ACTIVE', createdAt: new Date().toISOString() }
      return new Response(JSON.stringify(successResponse(plant, 'Plant created')), { status: 201, headers })
    }

    // GET /api/manufacturing/departments — List departments
    if (path === '/api/manufacturing/departments' && method === 'GET') {
      const departments = [
        { departmentCode: 'DEPT-SWEET-01', departmentName: 'Sweet Production', plantName: 'PLANT-THANE-01', departmentType: 'SWEET_PRODUCTION', managerName: 'Rajesh Patil', capacityPerDayKg: 1500, lines: 4, status: 'ACTIVE' },
        { departmentCode: 'DEPT-NAMKEEN-01', departmentName: 'Namkeen Production', plantName: 'PLANT-THANE-02', departmentType: 'NAMKEEN_PRODUCTION', managerName: 'Suresh Iyer', capacityPerDayKg: 1200, lines: 3, status: 'ACTIVE' },
        { departmentCode: 'DEPT-BATTER-01', departmentName: 'Batter Production', plantName: 'PLANT-BLR-01', departmentType: 'BATTER_PRODUCTION', managerName: 'Anil Reddy', capacityPerDayKg: 800, lines: 2, status: 'ACTIVE' },
      ]
      return new Response(JSON.stringify(successResponse(departments, 'Departments retrieved')), { headers })
    }

    // GET /api/manufacturing/lines — List production lines
    if (path === '/api/manufacturing/lines' && method === 'GET') {
      const lines = [
        { lineCode: 'LINE-KK-01', lineName: 'Kaju Katli Line', plantName: 'PLANT-THANE-01', departmentName: 'Sweet Production', capacityPerHourKg: 120, capacityPerDayKg: 1920, primaryProduct: 'Kaju Katli', currentStatus: 'RUNNING', workCenters: 8 },
        { lineCode: 'LINE-NM-01', lineName: 'Namkeen Frying Line', plantName: 'PLANT-THANE-02', departmentName: 'Namkeen Production', capacityPerHourKg: 150, capacityPerDayKg: 2400, primaryProduct: 'Mixed Namkeen', currentStatus: 'RUNNING', workCenters: 7 },
        { lineCode: 'LINE-IB-01', lineName: 'Idli Batter Line', plantName: 'PLANT-BLR-01', departmentName: 'Batter Production', capacityPerHourKg: 80, capacityPerDayKg: 1280, primaryProduct: 'Shwet Idli Batter', currentStatus: 'RUNNING', workCenters: 4 },
      ]
      return new Response(JSON.stringify(successResponse(lines, 'Production lines retrieved')), { headers })
    }

    // GET /api/manufacturing/work-centers — List work centers
    if (path === '/api/manufacturing/work-centers' && method === 'GET') {
      const wcs = [
        { workCenterCode: 'WC-KK-02', workCenterName: 'Mixing Station', lineName: 'LINE-KK-01', workCenterType: 'MIXING', sequenceNo: 2, capacityPerHourKg: 130, currentStatus: 'RUNNING', efficiency: 88 },
        { workCenterCode: 'WC-KK-03', workCenterName: 'Cooking Station', lineName: 'LINE-KK-01', workCenterType: 'COOKING', sequenceNo: 3, capacityPerHourKg: 120, currentStatus: 'RUNNING', efficiency: 85 },
      ]
      return new Response(JSON.stringify(successResponse(wcs, 'Work centers retrieved')), { headers })
    }

    // GET /api/manufacturing/dashboard — Production dashboard
    if (path === '/api/manufacturing/dashboard' && method === 'GET') {
      const data = {
        kpis: { activePlants: 4, runningLines: 5, todayOutputKg: 4820, targetKg: 6000, activeWorkCenters: 4, oee: 82.5, qualityPassRate: 98.2 },
        plantOutput: [
          { plant: 'PLANT-THANE-01', target: 2500, actual: 2150, lines: 4, running: 3 },
          { plant: 'PLANT-THANE-02', target: 1800, actual: 1620, lines: 3, running: 2 },
          { plant: 'PLANT-BLR-01', target: 1200, actual: 850, lines: 2, running: 1 },
        ],
        workCenterStatus: [
          { wc: 'WC-KK-02 Mixing', status: 'RUNNING', product: 'Kaju Katli', efficiency: 88 },
          { wc: 'WC-KK-03 Cooking', status: 'RUNNING', product: 'Kaju Katli', efficiency: 85 },
          { wc: 'WC-NM-01 Roasting', status: 'RUNNING', product: 'Mixed Namkeen', efficiency: 91 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Production dashboard data')), { headers })
    }

    // GET /api/manufacturing/info — Sprint 34 info
    if (path === '/api/manufacturing/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 34,
        sprintName: 'Enterprise Manufacturing Foundation & Plant Master',
        version: '34.0.0',
        part: 5,
        tables: 9,
        epics: [
          'Epic 1: Manufacturing Plant Master (5 plant types, multi-plant, capacity, operating hours)',
          'Epic 2: Production Departments (9 types: Sweet, Namkeen, Batter, Packaging, Quality, FG, Maintenance, Utilities, Cleaning)',
          'Epic 3: Production Lines (Kaju Katli, Laddu, Barfi, Namkeen, Mixture, Idli Batter, Dosa Batter, Packing)',
          'Epic 4: Work Centers (Mixing, Cooking, Roasting, Frying, Cooling, Cutting, Rolling, Packing, Inspection, Dispatch Prep)',
          'Epic 5: Manufacturing Calendar (shifts, holidays, maintenance shutdowns, festival schedule)',
          'Epic 6: Production Resources (Machines, Operators, Tools, Utilities, Production Tables, Packaging Stations, Cleaning Equipment)',
          'Epic 7: Plant Configuration (numbering, quality hold rules, barcode rules, manufacturing rules)',
          'Epic 8: Production Dashboard (plant output, OEE, work center status, quality)',
        ],
        hierarchy: 'Company → Branch → Plant → Department → Production Line → Work Center → Machine → Operator',
        chiefArchitectRecommendation: 'Model production using Work Centers (Mixing → Cooking → Cooling → Rolling → Cutting → Inspection → Packing) rather than only production lines. Provides: precise tracking, better utilization, accurate costing per stage, easier bottleneck analysis, strong traceability for food safety.',
        endpoints: [
          'GET/POST /api/manufacturing/plants',
          'GET /api/manufacturing/departments',
          'GET /api/manufacturing/lines',
          'GET /api/manufacturing/work-centers',
          'GET /api/manufacturing/dashboard',
          'GET /api/manufacturing/info',
        ],
        part5Sprint: 1,
        part5Sprints: 15,
        totalProjectTables: 291,
      }, 'SUOP Manufacturing Foundation v34.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 35 — RECIPE, FORMULA, BOM & VERSION MANAGEMENT
    // ═════════════════════════════════════════════════════════

    // GET /api/recipes — List all recipes
    if (path === '/api/recipes' && method === 'GET') {
      const recipes = [
        { id: 'rec-001', recipeCode: 'REC-KK-500', recipeName: 'Kaju Katli 500g', productType: 'TRADITIONAL_SWEETS', yieldQuantity: 95, yieldUom: 'KG', status: 'ACTIVE', version: '1.2', ingredients: 6, approvedBy: 'Rajesh Patil' },
        { id: 'rec-002', recipeCode: 'REC-IB-1K', recipeName: 'Shwet Idli Batter 1kg', productType: 'IDLI_BATTER', yieldQuantity: 98, yieldUom: 'KG', status: 'ACTIVE', version: '1.3', ingredients: 3, approvedBy: 'Anil Reddy' },
        { id: 'rec-003', recipeCode: 'REC-NM-500', recipeName: 'Mixed Namkeen 500g', productType: 'NAMKEEN', yieldQuantity: 96, yieldUom: 'KG', status: 'ACTIVE', version: '1.0', ingredients: 12, approvedBy: 'Suresh Iyer' },
      ]
      return new Response(JSON.stringify(successResponse(recipes, 'Recipes retrieved')), { headers })
    }

    // POST /api/recipes — Create recipe
    if (path === '/api/recipes' && method === 'POST') {
      const body = await req.json()
      const recipe = { id: `rec-${Date.now()}`, recipeCode: body.recipeCode, recipeName: body.recipeName, status: 'DRAFT', version: '1.0', createdAt: new Date().toISOString() }
      return new Response(JSON.stringify(successResponse(recipe, 'Recipe created (Draft)')), { status: 201, headers })
    }

    // POST /api/recipes/:id/approve — Approve recipe
    if (path.match(/^\/api\/recipes\/[\w-]+\/approve$/) && method === 'POST') {
      const id = path.split('/')[3]
      const result = { id, status: 'APPROVED', approvedAt: new Date().toISOString(), message: 'Recipe approved — can now be used in production' }
      return new Response(JSON.stringify(successResponse(result, 'Recipe approved')), { headers })
    }

    // GET /api/recipes/:id/formula — Get formula lines
    if (path.match(/^\/api\/recipes\/[\w-]+\/formula$/) && method === 'GET') {
      const formula = [
        { lineNo: 1, ingredientSku: 'ING-CASHEW-W320', ingredientName: 'Cashew (W320)', quantity: 55, uom: 'KG', percentage: 57.9, processStage: 'MIXING', lossPercentage: 2, isCritical: true },
        { lineNo: 2, ingredientSku: 'ING-SUGAR', ingredientName: 'Sugar', quantity: 35, uom: 'KG', percentage: 36.8, processStage: 'MIXING', lossPercentage: 1, isCritical: true },
        { lineNo: 3, ingredientSku: 'ING-GHEE', ingredientName: 'Ghee', quantity: 3, uom: 'KG', percentage: 3.2, processStage: 'COOKING', lossPercentage: 0.5, isCritical: true },
        { lineNo: 4, ingredientSku: 'ING-CARDAMOM', ingredientName: 'Cardamom Powder', quantity: 0.5, uom: 'KG', percentage: 0.5, processStage: 'MIXING', lossPercentage: 0, isCritical: false },
        { lineNo: 5, ingredientSku: 'ING-SILVER-LEAF', ingredientName: 'Silver Leaf (Vark)', quantity: 50, uom: 'SHEETS', percentage: 0.1, processStage: 'PACKING', lossPercentage: 5, isCritical: false, isOptional: true },
      ]
      return new Response(JSON.stringify(successResponse(formula, 'Formula lines retrieved')), { headers })
    }

    // GET /api/recipes/:id/bom — Get BOM
    if (path.match(/^\/api\/recipes\/[\w-]+\/bom$/) && method === 'GET') {
      const bom = {
        bomCode: 'BOM-KK-500-v1.2', recipeCode: 'REC-KK-500', bomType: 'MANUFACTURING', version: 1,
        lines: [
          { lineNo: 1, componentSku: 'ING-CASHEW-W320', componentName: 'Cashew (W320)', componentType: 'RAW_MATERIAL', quantity: 55, uom: 'KG', unitCost: 850, totalCost: 47300 },
          { lineNo: 2, componentSku: 'ING-SUGAR', componentName: 'Sugar', componentType: 'RAW_MATERIAL', quantity: 35, uom: 'KG', unitCost: 45, totalCost: 1575 },
          { lineNo: 3, componentSku: 'PKG-BOX-500', componentName: 'Packaging Box 500g', componentType: 'PACKAGING', quantity: 190, uom: 'PCS', unitCost: 8, totalCost: 1520 },
        ],
        totalCost: 66200,
      }
      return new Response(JSON.stringify(successResponse(bom, 'BOM retrieved')), { headers })
    }

    // POST /api/recipes/:id/scale — Batch scaling
    if (path.match(/^\/api\/recipes\/[\w-]+\/scale$/) && method === 'POST') {
      const id = path.split('/')[3]
      const body = await req.json()
      const targetQty = body.targetQuantity || 250
      const standardYield = 95
      const scaleFactor = targetQty / standardYield
      const result = {
        recipeId: id, standardYield: 95, targetQuantity: targetQty, scaleFactor: scaleFactor.toFixed(3),
        scaledLines: [
          { ingredient: 'Cashew (W320)', standardQty: 55, scaledQty: (55 * scaleFactor).toFixed(2), uom: 'KG' },
          { ingredient: 'Sugar', standardQty: 35, scaledQty: (35 * scaleFactor).toFixed(2), uom: 'KG' },
          { ingredient: 'Ghee', standardQty: 3, scaledQty: (3 * scaleFactor).toFixed(2), uom: 'KG' },
        ],
        message: `Recipe scaled from ${standardYield}kg to ${targetQty}kg (factor: ${scaleFactor.toFixed(3)}x)`,
      }
      return new Response(JSON.stringify(successResponse(result, 'Recipe scaled')), { headers })
    }

    // GET /api/recipes/:id/cost-rollup — Cost roll-up
    if (path.match(/^\/api\/recipes\/[\w-]+\/cost-rollup$/) && method === 'GET') {
      const result = {
        recipeCode: 'REC-KK-500', recipeVersion: '1.2',
        ingredientCost: 51635, packagingCost: 1672, processingCost: 5800, laborCost: 4200, overheadCost: 2893,
        totalManufacturingCost: 66200, costPerUnit: 348.42, costPerKg: 697,
        costType: 'CURRENT',
      }
      return new Response(JSON.stringify(successResponse(result, 'Cost roll-up calculated')), { headers })
    }

    // GET /api/recipes/info — Sprint 35 info
    if (path === '/api/recipes/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 35, sprintName: 'Enterprise Recipe, Formula, BOM & Version Management', version: '35.0.0', part: 5, tables: 12,
        epics: ['Recipe Master (version control, approval)', 'Formula Management (fixed/percentage/ratio)', 'BOM (multi-level, packaging, alternate)', 'Recipe Version Control (major/minor, rollback)', 'Yield Management (expected vs actual)', 'Batch Scaling (auto-scale up/down)', 'Alternate Ingredients (approval workflow)', 'Allergen & Nutrition Management', 'Cost Roll-Up (ingredient+packaging+processing+labor+overhead)'],
        chiefArchitectRecommendation: 'Separate Recipe from Production Instructions. Recipe = ingredients + BOM. Production Instructions = mixing sequence, cooking temperature, cooking duration, cooling time, rolling thickness, cutting dimensions, silver leaf application, packing instructions, quality checkpoints. Same recipe can be produced on different lines.',
        endpoints: ['GET/POST /api/recipes', 'POST /api/recipes/:id/approve', 'GET /api/recipes/:id/formula', 'GET /api/recipes/:id/bom', 'POST /api/recipes/:id/scale', 'GET /api/recipes/:id/cost-rollup', 'GET /api/recipes/info'],
        part5Sprint: 2, part5Sprints: 15, totalProjectTables: 303,
      }, 'SUOP Recipe & Formula Engine v35.0.0')), { headers })
    }

    // ═════════════════════════════════════════════════════════
    // SPRINT 36 — PRODUCTION PLANNING, MRP & MPS
    // ═════════════════════════════════════════════════════════

    // GET /api/planning/dashboard — Planning dashboard
    if (path === '/api/planning/dashboard' && method === 'GET') {
      const data = {
        kpis: { activeMps: 3, mrpRuns: 12, materialShortages: 5, purchaseSuggestions: 18, capacityUtil: 82, demandCoverage: 94 },
        planningFlow: ['Sales Orders', 'Retail POS', 'Restaurant POS', 'Distributor Orders', 'Safety Stock', 'Demand Planning', 'MPS', 'MRP', 'Capacity Check', 'Production Plan', 'Purchase Suggestions'],
        todayProduction: [
          { product: 'Kaju Katli 500g', line: 'LINE-KK-01', qty: 285, batches: 3, shift: 'Morning', status: 'SCHEDULED' },
          { product: 'Shwet Idli Batter 1kg', line: 'LINE-IB-01', qty: 200, batches: 2, shift: 'Morning', status: 'IN_PROGRESS' },
        ],
        materialAvailability: [
          { material: 'Cashew (W320)', required: 380, available: 420, status: 'OK' },
          { material: 'Sugar', required: 250, available: 120, status: 'SHORTAGE' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Planning dashboard data')), { headers })
    }

    // GET /api/planning/mps — MPS lines
    if (path === '/api/planning/mps' && method === 'GET') {
      const mps = [
        { no: 1, product: 'Kaju Katli 500g', line: 'LINE-KK-01', qty: 95, date: 'Jul 10', shift: 'Morning', demand: 'Retail POS (180 boxes)', status: 'SCHEDULED' },
        { no: 2, product: 'Shwet Idli Batter 1kg', line: 'LINE-IB-01', qty: 100, date: 'Jul 10', shift: 'Morning', demand: 'Restaurant POS (100 units)', status: 'IN_PROGRESS' },
      ]
      return new Response(JSON.stringify(successResponse(mps, 'MPS retrieved')), { headers })
    }

    // POST /api/planning/mrp/run — Run MRP
    if (path === '/api/planning/mrp/run' && method === 'POST') {
      const result = {
        runNumber: `MRP-${Date.now()}`,
        status: 'COMPLETED',
        totalMaterials: 9, totalShortages: 5, totalPurchaseSuggestions: 6,
        durationSeconds: 4.2,
        results: [
          { material: 'Cashew (W320)', demand: 380, available: 420, net: 110, suggestion: 'NONE', shortage: false },
          { material: 'Sugar', demand: 250, available: 120, net: 240, suggestion: 'PURCHASE', shortage: true },
          { material: 'Packaging Box 500g', demand: 570, available: 200, net: 520, suggestion: 'PURCHASE', shortage: true },
        ],
      }
      return new Response(JSON.stringify(successResponse(result, 'MRP run completed')), { headers })
    }

    // GET /api/planning/demand — Demand forecasts
    if (path === '/api/planning/demand' && method === 'GET') {
      const demands = [
        { product: 'Kaju Katli 500g', salesOrder: 180, retailPos: 120, restaurantPos: 0, distributor: 60, export: 0, safetyStock: 30, total: 390, forecast: 420, method: 'MOVING_AVERAGE', confidence: 85 },
        { product: 'Shwet Idli Batter 1kg', salesOrder: 0, retailPos: 0, restaurantPos: 150, distributor: 0, export: 0, safetyStock: 50, total: 200, forecast: 220, method: 'MOVING_AVERAGE', confidence: 92 },
      ]
      return new Response(JSON.stringify(successResponse(demands, 'Demand forecasts retrieved')), { headers })
    }

    // GET /api/planning/capacity — Capacity plans
    if (path === '/api/planning/capacity' && method === 'GET') {
      const capacity = [
        { line: 'LINE-KK-01', available: 16, required: 14, utilization: 88, status: 'BALANCED' },
        { line: 'LINE-NM-01', available: 16, required: 18, utilization: 113, status: 'OVERLOAD' },
        { line: 'LINE-MP-01', available: 16, required: 8, utilization: 50, status: 'UNDERUTILIZED' },
      ]
      return new Response(JSON.stringify(successResponse(capacity, 'Capacity plans retrieved')), { headers })
    }

    // GET /api/planning/shortages — Material shortages
    if (path === '/api/planning/shortages' && method === 'GET') {
      const shortages = [
        { material: 'Sugar', required: 250, available: 120, shortage: 130, severity: 'CRITICAL', affected: ['Kaju Katli', 'Mysore Pak', 'Laddu'], status: 'OPEN' },
        { material: 'Packaging Box 500g', required: 570, available: 200, shortage: 370, severity: 'CRITICAL', affected: ['Kaju Katli', 'Mysore Pak'], status: 'IN_PROGRESS' },
        { material: 'Urad Dal', required: 60, available: 45, shortage: 15, severity: 'HIGH', affected: ['Idli Batter', 'Dosa Batter'], status: 'OPEN', hasAlternate: true },
      ]
      return new Response(JSON.stringify(successResponse(shortages, 'Material shortages retrieved')), { headers })
    }

    // GET /api/planning/purchase-suggestions — Purchase recommendations
    if (path === '/api/planning/purchase-suggestions' && method === 'GET') {
      const suggestions = [
        { code: 'PUR-2026-018', material: 'Sugar', required: 380, available: 120, suggest: 380, supplier: 'Madhur Sugar Co.', leadTime: 5, reqDate: 'Jul 12', priority: 'EMERGENCY', totalCost: 17100, status: 'PENDING' },
        { code: 'PUR-2026-019', material: 'Packaging Box 500g', required: 570, available: 200, suggest: 520, supplier: 'Packwell India', leadTime: 7, reqDate: 'Jul 14', priority: 'HIGH', totalCost: 4160, status: 'PENDING' },
        { code: 'PUR-2026-023', material: 'Cashew (W320)', required: 380, available: 420, suggest: 110, supplier: 'NutriNuts Import', leadTime: 14, reqDate: 'Jul 25', priority: 'NORMAL', totalCost: 93500, status: 'PENDING' },
      ]
      return new Response(JSON.stringify(successResponse(suggestions, 'Purchase suggestions retrieved')), { headers })
    }

    // POST /api/planning/simulate — What-if simulation
    if (path === '/api/planning/simulate' && method === 'POST') {
      const body = await req.json()
      const param = body.parameter || 20
      const result = {
        scenarioType: body.scenarioType || 'DEMAND_INCREASE',
        parameter: param,
        materialImpact: [
          { material: 'Cashew (W320)', base: 380, simulated: Math.round(380 * (1 + param / 100)), delta: Math.round(380 * param / 100) },
          { material: 'Sugar', base: 250, simulated: Math.round(250 * (1 + param / 100)), delta: Math.round(250 * param / 100) },
        ],
        capacityImpact: { baseUtil: 82, simulatedUtil: Math.min(100, 82 + param * 0.8), overload: 82 + param * 0.8 > 100 },
        costImpact: { baseCost: 66200, simulatedCost: Math.round(66200 * (1 + param / 100)) },
        shortageImpact: { baseShortages: 5, simulatedShortages: 5 + Math.floor(param / 10) },
        recommendation: param > 25 ? 'High impact — recommend adding overtime shift and expediting procurement.' : 'Moderate impact — current capacity can handle with minor adjustments.',
        status: 'COMPLETED',
      }
      return new Response(JSON.stringify(successResponse(result, 'Simulation completed')), { headers })
    }

    // GET /api/planning/info — Sprint 36 info
    if (path === '/api/planning/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 36, sprintName: 'Production Planning, MRP & Master Production Scheduling', version: '36.0.0', part: 5, tables: 9,
        epics: ['MPS (Master Production Schedule)', 'MRP (Material Requirements Planning)', 'Demand Planning (multi-channel)', 'Capacity Planning', 'Purchase Recommendations', 'Material Shortage Analysis', 'Production Calendar Planning', 'What-if Simulation'],
        mrpFormula: 'Gross Demand - Available Inventory - Reserved + Safety Stock = Net Requirement',
        chiefArchitectRecommendation: 'Combine demand from Retail POS + Restaurant POS + Distributor + Export + Safety Stock → Unified Demand → MPS → MRP. POS systems remain billing-only, supply demand data to SUOP for planning.',
        endpoints: ['GET /api/planning/dashboard', 'GET /api/planning/mps', 'POST /api/planning/mrp/run', 'GET /api/planning/demand', 'GET /api/planning/capacity', 'GET /api/planning/shortages', 'GET /api/planning/purchase-suggestions', 'POST /api/planning/simulate', 'GET /api/planning/info'],
        part5Sprint: 3, part5Sprints: 15, totalProjectTables: 312,
      }, 'SUOP Production Planning & MRP Engine v36.0.0')), { headers })
    }

    // 404
    return new Response(JSON.stringify(errorResponse(`Route ${path} not found`, 'NOT_FOUND', 404)), { status: 404, headers })
  },
})

log('info', `SUOP Backend v${VERSION} started`, { port: PORT, sprint: 36, sprintName: 'Production Planning, MRP & MPS — PART 5 MES (36/48 sprints)' })
log('info', 'Sprint 36 — Production Planning & MRP Engine', { sprint: 36, part: 5, tables: 312, mpsLines: 8, mrpMaterials: 9, shortages: 5, purchaseSuggestions: 6 })
log('info', 'Planning endpoints available (Sprint 36)', { dashboard: 'GET /api/planning/dashboard', mps: 'GET /api/planning/mps', mrpRun: 'POST /api/planning/mrp/run', demand: 'GET /api/planning/demand', capacity: 'GET /api/planning/capacity', shortages: 'GET /api/planning/shortages', purchaseSuggestions: 'GET /api/planning/purchase-suggestions', simulate: 'POST /api/planning/simulate', info: 'GET /api/planning/info' })
log('info', 'Sprint 35 — Recipe & Formula Engine', { sprint: 35, part: 5, tables: 303, recipes: 10, formulaLines: 6, bomLines: 8 })
log('info', 'Recipe endpoints available (Sprint 35)', { recipes: 'GET/POST /api/recipes', approve: 'POST /api/recipes/:id/approve', formula: 'GET /api/recipes/:id/formula', bom: 'GET /api/recipes/:id/bom', scale: 'POST /api/recipes/:id/scale', costRollup: 'GET /api/recipes/:id/cost-rollup', info: 'GET /api/recipes/info' })
log('info', 'Sprint 34 — Manufacturing Foundation', { sprint: 34, part: 5, tables: 291, plants: 5, departments: 8, lines: 8, workCenters: 10 })
log('info', 'Manufacturing endpoints available (Sprint 34)', { plants: 'GET/POST /api/manufacturing/plants', departments: 'GET /api/manufacturing/departments', lines: 'GET /api/manufacturing/lines', workCenters: 'GET /api/manufacturing/work-centers', dashboard: 'GET /api/manufacturing/dashboard', info: 'GET /api/manufacturing/info' })
log('info', '🎉 Sprint 33 — FINAL WMS Sprint — Mission Control + AI Ops + Digital Twin + Disaster Recovery', { sprint: 33, part: 4, tables: 282, enterpriseEndpoints: 9, part4Complete: true })
log('info', 'Enterprise command center endpoints available (Sprint 33)', { missionControl: 'GET /api/enterprise/mission-control', controlTower: 'GET /api/enterprise/control-tower', digitalTwin: 'GET /api/enterprise/digital-twin', aiRecommendations: 'GET /api/enterprise/ai-recommendations', alerts: 'GET /api/enterprise/alerts', alertAck: 'POST /api/enterprise/alerts/:id/acknowledge', recovery: 'GET /api/enterprise/recovery', executiveDashboard: 'GET /api/enterprise/executive-dashboard', info: 'GET /api/enterprise/info' })
log('info', '🎉 PART 4 ENTERPRISE WAREHOUSE MANAGEMENT SYSTEM — 100% COMPLETE', { sprints: '22-33 (12 sprints)', tables: 282, modules: '55+ ERP + Mobile App', nextPhase: 'Part 5 — Manufacturing Execution System (MES)' })
log('info', 'Dispatch & shipping endpoints available (Sprint 27)', { dispatchOrders: 'GET/POST /api/dispatch-orders', dispatchComplete: 'POST /api/dispatch-orders/:id/complete', dispatchVehicles: 'GET /api/dispatch-vehicles', loadPlans: 'GET /api/load-plans', shippingDocuments: 'GET /api/shipping-documents', vehicleSeals: 'GET /api/vehicle-seals', gateExitLogs: 'GET /api/gate-exit-logs', gateExitApprove: 'POST /api/gate-exit-logs/:id/approve', dashboard: 'GET /api/dispatch/dashboard', info: 'GET /api/dispatch/info' })
log('info', 'Directed putaway endpoints available (Sprint 25)', { putawayTasks: 'GET/POST /api/wms-putaway-tasks', putawayComplete: 'POST /api/wms-putaway-tasks/:id/complete', putawayRules: 'GET /api/wms-putaway-rules', warehousePallets: 'GET /api/warehouse-pallets', forkliftTasks: 'GET /api/forklift-tasks', forkliftComplete: 'POST /api/forklift-tasks/:id/complete', dashboard: 'GET /api/wms-putaway/dashboard', info: 'GET /api/wms-putaway/info' })
log('info', 'Receiving operations endpoints available (Sprint 24)', { asns: 'GET/POST /api/asn', asnConfirm: 'POST /api/asn/:id/confirm', appointments: 'GET /api/receiving-appointments', gateEntries: 'GET /api/gate-entries', docks: 'GET /api/loading-docks', dockAssign: 'POST /api/loading-docks/:id/assign', dockRelease: 'POST /api/loading-docks/:id/release', exceptions: 'GET /api/receiving-exceptions', exceptionResolve: 'POST /api/receiving-exceptions/:id/resolve', dashboard: 'GET /api/receiving-operations/dashboard', info: 'GET /api/receiving-operations/info' })
log('info', 'Warehouse endpoints available', { warehouses: 'GET/POST /api/warehouses', warehouseDetail: 'GET /api/warehouses/:id', zones: 'GET /api/warehouse-zones', tempZones: 'GET /api/temperature-zones', tempLogs: 'GET /api/temperature-logs', capacity: 'GET /api/warehouse-capacity', calendar: 'GET /api/warehouse-calendar', accessRules: 'GET /api/warehouse-access-rules', rules: 'GET /api/warehouse-rules', dashboard: 'GET /api/warehouses/dashboard', info: 'GET /api/warehouses/info' })
log('info', 'Warehouse location & bin endpoints available (Sprint 23)', { aisles: 'GET /api/warehouse-aisles', racks: 'GET /api/warehouse-racks', shelves: 'GET /api/warehouse-shelves', bins: 'GET/POST /api/warehouse-bins', binDetail: 'GET /api/warehouse-bins/:id', capacityLogs: 'GET /api/bin-capacity-logs', dashboard: 'GET /api/warehouse-locations/dashboard', info: 'GET /api/warehouse-locations/info' })
log('info', 'Analytics & mission control endpoints available', { kpis: 'GET /api/inventory-analytics/kpis', ageing: 'GET /api/inventory-analytics/ageing', classifications: 'GET /api/inventory-analytics/classifications', reorder: 'GET /api/inventory-analytics/reorder', missionControl: 'GET /api/inventory-analytics/mission-control', reports: 'GET /api/inventory-analytics/reports', reportGenerate: 'POST /:id/generate', dashboard: 'GET /api/inventory-analytics/dashboard', info: 'GET /api/inventory-analytics/info' })
log('info', 'Costing & valuation endpoints available', { costLayers: 'GET /api/cost-layers', costHistory: 'GET /api/cost-history', landedCosts: 'GET /api/landed-costs', landedCostAllocate: 'POST /:id/allocate', revaluations: 'GET /api/inventory-revaluations', revaluationApprove: 'POST /:id/approve', glPostings: 'GET /api/inventory-gl-postings', valuation: 'GET /api/inventory-valuation', dashboard: 'GET /api/costing/dashboard', info: 'GET /api/costing/info' })
log('info', 'Batch & expiry endpoints available', { batchMaster: 'GET /api/batch-master', history: 'GET /:id/history', shelfLifeRules: 'GET /api/shelf-life-rules', expiryAlerts: 'GET /api/expiry-alerts', alertAction: 'POST /:id/action', recalls: 'GET /api/product-recalls', recallAdvance: 'POST /:id/advance', genealogy: 'GET /api/batch-genealogy', dashboard: 'GET /api/batch-master/dashboard', info: 'GET /api/batch-master/info' })
log('info', 'Cycle count endpoints available', { physicalInventory: 'GET/POST /api/physical-inventory', approve: 'POST /:id/approve', plans: 'GET /api/cycle-count/plans', schedules: 'GET /api/cycle-count/schedules', teams: 'GET /api/count-teams', variances: 'GET /api/count-variances', dashboard: 'GET /api/physical-inventory/dashboard', info: 'GET /api/physical-inventory/info' })
log('info', 'Reservation endpoints available', { reservations: 'GET/POST /api/reservations', release: 'POST /:id/release', allocate: 'GET /:id/allocate', rules: 'GET /api/allocation-rules', availability: 'GET /api/reservations/availability', dashboard: 'GET /api/reservations/dashboard', info: 'GET /api/reservations/info' })
log('info', 'Adjustment endpoints available', { adjustments: 'GET/POST /api/inventory-adjustments', approve: 'POST /:id/approve', reasons: 'GET /api/inventory-adjustments/reasons', damage: 'GET /api/damage-reports-s16', expiry: 'GET /api/expiry-adjustments', rootCauses: 'GET /api/inventory-adjustments/root-causes', dashboard: 'GET /api/inventory-adjustments/dashboard', info: 'GET /api/inventory-adjustments/info' })
log('info', 'Transfer endpoints available', { transfers: 'GET/POST /api/stock-transfers', approve: 'POST /:id/approve', dispatch: 'POST /:id/dispatch', receive: 'POST /:id/receive', inTransit: 'GET /api/stock-transfers/in-transit', binTransfers: 'GET /api/bin-transfers', dashboard: 'GET /api/stock-transfers/dashboard' })
log('info', 'Outbound endpoints available', { stockIssues: 'GET/POST /api/stock-issues', picking: 'GET /api/picking/tasks', scrap: 'GET /api/scrap-records', damage: 'GET /api/damage-records' })
log('info', 'Receiving endpoints available', { goodsReceipts: 'GET/POST /api/goods-receipts', putaway: 'GET /api/putaway/tasks', quality: 'GET /api/quality-holds' })
log('info', 'Inventory endpoints available', { transactions: 'GET/POST /api/inventory/transactions', balances: 'GET /api/inventory/balances', ledger: 'GET /api/inventory/ledger' })
