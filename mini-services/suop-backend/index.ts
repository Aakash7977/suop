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
const VERSION = "9.0.0"

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
        { code: 'INV', name: 'Inventory', status: 'planned', entities: 22, sprint: 10 },
        { code: 'FIN', name: 'Finance', status: 'planned', entities: 100, sprint: 11 },
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

    // 404
    return new Response(JSON.stringify(errorResponse(`Route ${path} not found`, 'NOT_FOUND', 404)), { status: 404, headers })
  },
})

log('info', `SUOP Backend v${VERSION} started`, { port: PORT, sprint: 9, sprintName: 'Enterprise Business Partner Platform' })
log('info', 'Business Partner endpoints available', {
  partners: 'GET/POST /api/business-partners',
  partnerById: 'GET /api/business-partners/:id',
  groups: 'GET /api/business-partners/groups',
  scorecards: 'GET /api/business-partners/scorecards',
  relationships: 'GET /api/business-partners/relationships',
  dashboard: 'GET /api/business-partners/dashboard',
  info: 'GET /api/business-partners/info',
})
log('info', 'Commercial Engine endpoints available', {
  priceLists: 'GET/POST /api/commercial/price-lists',
  taxGroups: 'GET/POST /api/commercial/tax-groups',
  discounts: 'GET/POST /api/commercial/discounts',
  promotions: 'GET/POST /api/commercial/promotions',
  futurePrices: 'GET/POST /api/commercial/future-prices',
  approvals: 'GET /api/commercial/approvals',
  resolvePrice: 'POST /api/commercial/resolve-price',
  resolutionLogs: 'GET /api/commercial/resolution-logs',
  dashboard: 'GET /api/commercial/dashboard',
})
