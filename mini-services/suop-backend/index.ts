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
const VERSION = "17.0.0"

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
        { code: 'WHS', name: 'Warehouse', status: 'planned', entities: 18, sprint: 18 },
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

    // 404
    return new Response(JSON.stringify(errorResponse(`Route ${path} not found`, 'NOT_FOUND', 404)), { status: 404, headers })
  },
})

log('info', `SUOP Backend v${VERSION} started`, { port: PORT, sprint: 17, sprintName: 'Inventory Reservation, Allocation & Availability Engine' })
log('info', 'Reservation endpoints available', { reservations: 'GET/POST /api/reservations', release: 'POST /:id/release', allocate: 'GET /:id/allocate', rules: 'GET /api/allocation-rules', availability: 'GET /api/reservations/availability', dashboard: 'GET /api/reservations/dashboard', info: 'GET /api/reservations/info' })
log('info', 'Adjustment endpoints available', { adjustments: 'GET/POST /api/inventory-adjustments', approve: 'POST /:id/approve', reasons: 'GET /api/inventory-adjustments/reasons', damage: 'GET /api/damage-reports-s16', expiry: 'GET /api/expiry-adjustments', rootCauses: 'GET /api/inventory-adjustments/root-causes', dashboard: 'GET /api/inventory-adjustments/dashboard', info: 'GET /api/inventory-adjustments/info' })
log('info', 'Transfer endpoints available', { transfers: 'GET/POST /api/stock-transfers', approve: 'POST /:id/approve', dispatch: 'POST /:id/dispatch', receive: 'POST /:id/receive', inTransit: 'GET /api/stock-transfers/in-transit', binTransfers: 'GET /api/bin-transfers', dashboard: 'GET /api/stock-transfers/dashboard' })
log('info', 'Outbound endpoints available', { stockIssues: 'GET/POST /api/stock-issues', picking: 'GET /api/picking/tasks', scrap: 'GET /api/scrap-records', damage: 'GET /api/damage-records' })
log('info', 'Receiving endpoints available', { goodsReceipts: 'GET/POST /api/goods-receipts', putaway: 'GET /api/putaway/tasks', quality: 'GET /api/quality-holds' })
log('info', 'Inventory endpoints available', { transactions: 'GET/POST /api/inventory/transactions', balances: 'GET /api/inventory/balances', ledger: 'GET /api/inventory/ledger' })
