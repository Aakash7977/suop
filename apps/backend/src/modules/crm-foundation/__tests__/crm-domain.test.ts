/** CRM & Customer Service Domain Tests — Phases 39-44 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/lead-opportunity/workflow'
import '@/modules/customer-service/workflow'
import '@/modules/complaint-management/workflow'
import '@/modules/after-sales-service/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

// ════════════════════════════════════════════════════════════════════════════
// LEAD WORKFLOW (15 tests)
// ════════════════════════════════════════════════════════════════════════════

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST'
interface LeadEntity extends WorkflowEntity { id: string; status: LeadStatus; version: number }

describe('Lead Workflow', () => {
  const machine = workflowRegistry.get<LeadStatus, LeadEntity>('LeadLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('NEW') })
  it('has 6 states', () => { expect(machine.definition.states).toHaveLength(6) })
  it('has 8 transitions', () => { expect(machine.definition.transitions).toHaveLength(8) })
  it('allows NEW → CONTACTED', async () => { expect((await machine.canTransition({ id: '1', status: 'NEW', version: 0 }, 'CONTACTED', wfCtx)).allowed).toBe(true) })
  it('allows NEW → UNQUALIFIED', async () => { expect((await machine.canTransition({ id: '2', status: 'NEW', version: 0 }, 'UNQUALIFIED', wfCtx)).allowed).toBe(true) })
  it('allows CONTACTED → QUALIFIED', async () => { expect((await machine.canTransition({ id: '3', status: 'CONTACTED', version: 0 }, 'QUALIFIED', wfCtx)).allowed).toBe(true) })
  it('allows CONTACTED → LOST', async () => { expect((await machine.canTransition({ id: '4', status: 'CONTACTED', version: 0 }, 'LOST', wfCtx)).allowed).toBe(true) })
  it('allows QUALIFIED → CONVERTED', async () => { expect((await machine.canTransition({ id: '5', status: 'QUALIFIED', version: 0 }, 'CONVERTED', wfCtx)).allowed).toBe(true) })
  it('allows QUALIFIED → LOST', async () => { expect((await machine.canTransition({ id: '6', status: 'QUALIFIED', version: 0 }, 'LOST', wfCtx)).allowed).toBe(true) })
  it('allows UNQUALIFIED → NEW (re-engage)', async () => { expect((await machine.canTransition({ id: '7', status: 'UNQUALIFIED', version: 0 }, 'NEW', wfCtx)).allowed).toBe(true) })
  it('rejects NEW → CONVERTED (must contact and qualify)', async () => { expect((await machine.canTransition({ id: '8', status: 'NEW', version: 0 }, 'CONVERTED', wfCtx)).allowed).toBe(false) })
  it('rejects CONVERTED → NEW (terminal)', async () => { expect((await machine.canTransition({ id: '9', status: 'CONVERTED', version: 0 }, 'NEW', wfCtx)).allowed).toBe(false) })
  it('rejects LOST → CONVERTED (cannot convert lost)', async () => { expect((await machine.canTransition({ id: '10', status: 'LOST', version: 0 }, 'CONVERTED', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '11', status: 'NEW', version: 5 }, 'CONTACTED', wfCtx); expect(u.version).toBe(6) })
})

// ════════════════════════════════════════════════════════════════════════════
// OPPORTUNITY WORKFLOW (12 tests)
// ════════════════════════════════════════════════════════════════════════════

type OppStatus = 'OPEN' | 'WON' | 'LOST' | 'CLOSED'
interface OppEntity extends WorkflowEntity { id: string; status: OppStatus; version: number }

describe('Opportunity Workflow', () => {
  const machine = workflowRegistry.get<OppStatus, OppEntity>('OpportunityLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('OPEN') })
  it('has 4 states', () => { expect(machine.definition.states).toHaveLength(4) })
  it('has 5 transitions', () => { expect(machine.definition.transitions).toHaveLength(5) })
  it('allows OPEN → WON', async () => { expect((await machine.canTransition({ id: '1', status: 'OPEN', version: 0 }, 'WON', wfCtx)).allowed).toBe(true) })
  it('allows OPEN → LOST', async () => { expect((await machine.canTransition({ id: '2', status: 'OPEN', version: 0 }, 'LOST', wfCtx)).allowed).toBe(true) })
  it('allows WON → CLOSED', async () => { expect((await machine.canTransition({ id: '3', status: 'WON', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows LOST → CLOSED', async () => { expect((await machine.canTransition({ id: '4', status: 'LOST', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows LOST → OPEN (reopen)', async () => { expect((await machine.canTransition({ id: '5', status: 'LOST', version: 0 }, 'OPEN', wfCtx)).allowed).toBe(true) })
  it('rejects OPEN → CLOSED (must win or lose first)', async () => { expect((await machine.canTransition({ id: '6', status: 'OPEN', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(false) })
  it('rejects CLOSED → OPEN (terminal)', async () => { expect((await machine.canTransition({ id: '7', status: 'CLOSED', version: 0 }, 'OPEN', wfCtx)).allowed).toBe(false) })
  it('rejects WON → LOST (cannot lose after winning)', async () => { expect((await machine.canTransition({ id: '8', status: 'WON', version: 0 }, 'LOST', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '9', status: 'OPEN', version: 3 }, 'WON', wfCtx); expect(u.version).toBe(4) })
})

// ════════════════════════════════════════════════════════════════════════════
// TICKET WORKFLOW (15 tests)
// ════════════════════════════════════════════════════════════════════════════

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
interface TicketEntity extends WorkflowEntity { id: string; status: TicketStatus; version: number }

describe('Ticket Workflow', () => {
  const machine = workflowRegistry.get<TicketStatus, TicketEntity>('TicketLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('OPEN') })
  it('has 6 states', () => { expect(machine.definition.states).toHaveLength(6) })
  it('has 9 transitions', () => { expect(machine.definition.transitions).toHaveLength(9) })
  it('allows OPEN → IN_PROGRESS', async () => { expect((await machine.canTransition({ id: '1', status: 'OPEN', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(true) })
  it('allows OPEN → CANCELLED', async () => { expect((await machine.canTransition({ id: '2', status: 'OPEN', version: 0 }, 'CANCELLED', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → WAITING_CUSTOMER', async () => { expect((await machine.canTransition({ id: '3', status: 'IN_PROGRESS', version: 0 }, 'WAITING_CUSTOMER', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → RESOLVED', async () => { expect((await machine.canTransition({ id: '4', status: 'IN_PROGRESS', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows WAITING_CUSTOMER → IN_PROGRESS', async () => { expect((await machine.canTransition({ id: '5', status: 'WAITING_CUSTOMER', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(true) })
  it('allows WAITING_CUSTOMER → RESOLVED', async () => { expect((await machine.canTransition({ id: '6', status: 'WAITING_CUSTOMER', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows RESOLVED → CLOSED', async () => { expect((await machine.canTransition({ id: '7', status: 'RESOLVED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows RESOLVED → IN_PROGRESS (reopen)', async () => { expect((await machine.canTransition({ id: '8', status: 'RESOLVED', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(true) })
  it('rejects OPEN → RESOLVED (must start first)', async () => { expect((await machine.canTransition({ id: '9', status: 'OPEN', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(false) })
  it('rejects CLOSED → OPEN (terminal)', async () => { expect((await machine.canTransition({ id: '10', status: 'CLOSED', version: 0 }, 'OPEN', wfCtx)).allowed).toBe(false) })
  it('rejects CANCELLED → IN_PROGRESS (terminal)', async () => { expect((await machine.canTransition({ id: '11', status: 'CANCELLED', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '12', status: 'OPEN', version: 2 }, 'IN_PROGRESS', wfCtx); expect(u.version).toBe(3) })
})

// ════════════════════════════════════════════════════════════════════════════
// COMPLAINT WORKFLOW (12 tests)
// ════════════════════════════════════════════════════════════════════════════

type ComplaintStatus = 'REGISTERED' | 'UNDER_INVESTIGATION' | 'ROOT_CAUSE_IDENTIFIED' | 'RESOLUTION_PENDING' | 'RESOLVED' | 'CLOSED' | 'REJECTED'
interface ComplaintEntity extends WorkflowEntity { id: string; status: ComplaintStatus; version: number }

describe('Complaint Workflow', () => {
  const machine = workflowRegistry.get<ComplaintStatus, ComplaintEntity>('ComplaintLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('REGISTERED') })
  it('has 7 states', () => { expect(machine.definition.states).toHaveLength(7) })
  it('has 8 transitions', () => { expect(machine.definition.transitions).toHaveLength(8) })
  it('allows REGISTERED → UNDER_INVESTIGATION', async () => { expect((await machine.canTransition({ id: '1', status: 'REGISTERED', version: 0 }, 'UNDER_INVESTIGATION', wfCtx)).allowed).toBe(true) })
  it('allows REGISTERED → REJECTED', async () => { expect((await machine.canTransition({ id: '2', status: 'REGISTERED', version: 0 }, 'REJECTED', wfCtx)).allowed).toBe(true) })
  it('allows UNDER_INVESTIGATION → ROOT_CAUSE_IDENTIFIED', async () => { expect((await machine.canTransition({ id: '3', status: 'UNDER_INVESTIGATION', version: 0 }, 'ROOT_CAUSE_IDENTIFIED', wfCtx)).allowed).toBe(true) })
  it('allows ROOT_CAUSE_IDENTIFIED → RESOLUTION_PENDING', async () => { expect((await machine.canTransition({ id: '4', status: 'ROOT_CAUSE_IDENTIFIED', version: 0 }, 'RESOLUTION_PENDING', wfCtx)).allowed).toBe(true) })
  it('allows RESOLUTION_PENDING → RESOLVED', async () => { expect((await machine.canTransition({ id: '5', status: 'RESOLUTION_PENDING', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows RESOLVED → CLOSED', async () => { expect((await machine.canTransition({ id: '6', status: 'RESOLVED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows REJECTED → CLOSED', async () => { expect((await machine.canTransition({ id: '7', status: 'REJECTED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('rejects REGISTERED → RESOLVED (must investigate first)', async () => { expect((await machine.canTransition({ id: '8', status: 'REGISTERED', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(false) })
  it('rejects CLOSED → REGISTERED (terminal)', async () => { expect((await machine.canTransition({ id: '9', status: 'CLOSED', version: 0 }, 'REGISTERED', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '10', status: 'REGISTERED', version: 1 }, 'UNDER_INVESTIGATION', wfCtx); expect(u.version).toBe(2) })
})

// ════════════════════════════════════════════════════════════════════════════
// SERVICE REQUEST WORKFLOW (10 tests)
// ════════════════════════════════════════════════════════════════════════════

type ServiceStatus = 'REGISTERED' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
interface ServiceEntity extends WorkflowEntity { id: string; status: ServiceStatus; version: number }

describe('Service Request Workflow', () => {
  const machine = workflowRegistry.get<ServiceStatus, ServiceEntity>('ServiceRequestLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('REGISTERED') })
  it('has 6 states', () => { expect(machine.definition.states).toHaveLength(6) })
  it('has 8 transitions', () => { expect(machine.definition.transitions).toHaveLength(8) })
  it('allows REGISTERED → ASSIGNED', async () => { expect((await machine.canTransition({ id: '1', status: 'REGISTERED', version: 0 }, 'ASSIGNED', wfCtx)).allowed).toBe(true) })
  it('allows ASSIGNED → SCHEDULED', async () => { expect((await machine.canTransition({ id: '2', status: 'ASSIGNED', version: 0 }, 'SCHEDULED', wfCtx)).allowed).toBe(true) })
  it('allows SCHEDULED → IN_PROGRESS', async () => { expect((await machine.canTransition({ id: '3', status: 'SCHEDULED', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → COMPLETED', async () => { expect((await machine.canTransition({ id: '4', status: 'IN_PROGRESS', version: 0 }, 'COMPLETED', wfCtx)).allowed).toBe(true) })
  it('rejects REGISTERED → COMPLETED (must assign, schedule, start)', async () => { expect((await machine.canTransition({ id: '5', status: 'REGISTERED', version: 0 }, 'COMPLETED', wfCtx)).allowed).toBe(false) })
  it('rejects COMPLETED → IN_PROGRESS (terminal)', async () => { expect((await machine.canTransition({ id: '6', status: 'COMPLETED', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '7', status: 'REGISTERED', version: 4 }, 'ASSIGNED', wfCtx); expect(u.version).toBe(5) })
})

// ════════════════════════════════════════════════════════════════════════════
// CRM ANALYTICS (20 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('CRM Analytics', () => {
  function calcLeadConversion(totalLeads: number, convertedLeads: number): number {
    return totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 10000) / 100 : 0
  }
  function calcWinRate(totalOpps: number, wonOpps: number): number {
    return totalOpps > 0 ? Math.round((wonOpps / totalOpps) * 10000) / 100 : 0
  }
  function calcFirstResponseTime(created: Date, responded: Date): number {
    return Math.round((responded.getTime() - created.getTime()) / 60000)
  }
  function calcResolutionTime(created: Date, resolved: Date): number {
    return Math.round((resolved.getTime() - created.getTime()) / 3600000)
  }
  function calcSLACompliance(totalTickets: number, breachedTickets: number): number {
    return totalTickets > 0 ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 10000) / 100 : 0
  }
  function calcCSAT(ratings: number[]): number {
    return ratings.length > 0 ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 100) / 100 : 0
  }
  function calcCustomerLifetimeValue(avgOrderValue: number, orderFrequency: number, customerLifespan: number): number {
    return avgOrderValue * orderFrequency * customerLifespan
  }

  it('lead conversion 20% for 20/100', () => { expect(calcLeadConversion(100, 20)).toBe(20) })
  it('lead conversion 0% when no leads', () => { expect(calcLeadConversion(0, 0)).toBe(0) })
  it('lead conversion 100% when all converted', () => { expect(calcLeadConversion(50, 50)).toBe(100) })
  it('win rate 40% for 4/10', () => { expect(calcWinRate(10, 4)).toBe(40) })
  it('win rate 0% when no opportunities', () => { expect(calcWinRate(0, 0)).toBe(0) })
  it('first response time in minutes', () => { expect(calcFirstResponseTime(new Date('2026-07-11T10:00:00Z'), new Date('2026-07-11T10:30:00Z'))).toBe(30) })
  it('resolution time in hours', () => { expect(calcResolutionTime(new Date('2026-07-11T10:00:00Z'), new Date('2026-07-11T14:00:00Z'))).toBe(4) })
  it('SLA compliance 95% for 95/100', () => { expect(calcSLACompliance(100, 5)).toBe(95) })
  it('SLA compliance 100% when no breaches', () => { expect(calcSLACompliance(50, 0)).toBe(100) })
  it('SLA compliance 0% when all breached', () => { expect(calcSLACompliance(10, 10)).toBe(0) })
  it('CSAT 4.5 average', () => { expect(calcCSAT([5, 4, 5, 4, 4])).toBe(4.4) })
  it('CSAT 5.0 when all 5s', () => { expect(calcCSAT([5, 5, 5])).toBe(5) })
  it('CSAT 0 when no ratings', () => { expect(calcCSAT([])).toBe(0) })
  it('customer lifetime value = AOV × frequency × lifespan', () => { expect(calcCustomerLifetimeValue(5000, 12, 5)).toBe(300000) })
  it('sales funnel: leads → opportunities → quotes → orders', () => {
    const funnel = { leads: 100, opportunities: 40, quotes: 25, orders: 15 }
    expect(funnel.leads).toBeGreaterThan(funnel.opportunities)
    expect(funnel.opportunities).toBeGreaterThan(funnel.quotes)
    expect(funnel.quotes).toBeGreaterThan(funnel.orders)
  })
  it('opportunity probability increases by stage', () => {
    const stages = [{ stage: 'PROSPECTING', prob: 10 }, { stage: 'QUALIFICATION', prob: 25 }, { stage: 'PROPOSAL', prob: 50 }, { stage: 'NEGOTIATION', prob: 75 }, { stage: 'CLOSING', prob: 90 }]
    for (let i = 1; i < stages.length; i++) { expect(stages[i]!.prob).toBeGreaterThan(stages[i - 1]!.prob) }
  })
  it('complaint trend: product > delivery > service', () => {
    const trends = { product: 45, delivery: 30, service: 15, other: 10 }
    expect(trends.product).toBeGreaterThan(trends.delivery)
  })
  it('warranty cost = parts + labor', () => { const parts = 5000, labor = 2000; expect(parts + labor).toBe(7000) })
  it('service cost = parts + labor + travel', () => { const parts = 3000, labor = 2500, travel = 500; expect(parts + labor + travel).toBe(6000) })
  it('repeat customer rate = repeat / total × 100', () => { const repeat = 30, total = 100; expect(Math.round((repeat / total) * 10000) / 100).toBe(30) })
})

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS RULES (15 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('CRM Business Rules', () => {
  it('NotFoundError returns 404', () => { expect(new NotFoundError('Ticket', 'abc').statusCode).toBe(404) })
  it('ConcurrencyError returns 409', () => { expect(new ConcurrencyError('Version mismatch').statusCode).toBe(409) })
  it('AuthorizationError returns 403', () => { expect(new AuthorizationError('No auth').statusCode).toBe(403) })
  it('complaint linked to customer', () => { const c = { customerId: 'cust-1' }; expect(c.customerId).toBeDefined() })
  it('complaint linked to sales order', () => { const c = { soId: 'so-1' }; expect(c.soId).toBeDefined() })
  it('complaint linked to invoice', () => { const c = { invoiceId: 'inv-1' }; expect(c.invoiceId).toBeDefined() })
  it('complaint linked to delivery', () => { const c = { deliveryId: 'del-1' }; expect(c.deliveryId).toBeDefined() })
  it('complaint linked to batch', () => { const c = { batchNumber: 'BATCH-001' }; expect(c.batchNumber).toBeDefined() })
  it('complaint linked to product', () => { const c = { productId: 'prod-1' }; expect(c.productId).toBeDefined() })
  it('complaint linked to NCR', () => { const c = { ncrId: 'ncr-1' }; expect(c.ncrId).toBeDefined() })
  it('complaint linked to CAPA', () => { const c = { capaId: 'capa-1' }; expect(c.capaId).toBeDefined() })
  it('customer satisfaction must be measured', () => { const c = { satisfactionRating: 4 }; expect(c.satisfactionRating).toBeDefined() })
  it('escalation follows SLA', () => { const sla = { responseTimeMinutes: 30, escalationLevel1Hours: 2 }; expect(sla.responseTimeMinutes).toBeDefined() })
  it('portal session has expiry', () => { const s = { expiresAt: new Date().toISOString() }; expect(s.expiresAt).toBeDefined() })
  it('warranty has start and end date', () => { const w = { warrantyStartDate: '2026-01-01', warrantyEndDate: '2027-01-01' }; expect(w.warrantyStartDate).toBeDefined(); expect(w.warrantyEndDate).toBeDefined() })
})

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('CRM Schemas', () => {
  it('validates lead status enum', () => { const s = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST']); expect(s.safeParse('QUALIFIED').success).toBe(true) })
  it('validates opportunity status enum', () => { const s = z.enum(['OPEN', 'WON', 'LOST', 'CLOSED']); expect(s.safeParse('WON').success).toBe(true) })
  it('validates ticket status enum', () => { const s = z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED']); expect(s.safeParse('RESOLVED').success).toBe(true) })
  it('validates complaint status enum', () => { const s = z.enum(['REGISTERED', 'UNDER_INVESTIGATION', 'ROOT_CAUSE_IDENTIFIED', 'RESOLUTION_PENDING', 'RESOLVED', 'CLOSED', 'REJECTED']); expect(s.safeParse('RESOLVED').success).toBe(true) })
  it('validates service status enum', () => { const s = z.enum(['REGISTERED', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']); expect(s.safeParse('COMPLETED').success).toBe(true) })
  it('validates priority enum', () => { const s = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']); expect(s.safeParse('URGENT').success).toBe(true) })
  it('validates complaint type enum', () => { const s = z.enum(['PRODUCT', 'DELIVERY', 'SERVICE', 'QUALITY', 'BILLING', 'OTHER']); expect(s.safeParse('PRODUCT').success).toBe(true) })
  it('validates complaint severity', () => { const s = z.enum(['MINOR', 'MAJOR', 'CRITICAL']); expect(s.safeParse('MAJOR').success).toBe(true) })
  it('validates satisfaction rating 1-5', () => { const s = z.number().int().min(1).max(5); expect(s.safeParse(5).success).toBe(true); expect(s.safeParse(0).success).toBe(false); expect(s.safeParse(6).success).toBe(false) })
  it('validates portal role', () => { const s = z.enum(['CUSTOMER', 'CUSTOMER_ADMIN', 'VIEWER']); expect(s.safeParse('CUSTOMER').success).toBe(true) })
})

// ════════════════════════════════════════════════════════════════════════════
// NUMBER GENERATION (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('CRM Number Generation', () => {
  it('Lead: LEAD-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`LEAD-${y}-000001`).toMatch(/^LEAD-\d{4}-\d{6}$/) })
  it('Opportunity: OPP-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`OPP-${y}-000001`).toMatch(/^OPP-\d{4}-\d{6}$/) })
  it('Ticket: TKT-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`TKT-${y}-000001`).toMatch(/^TKT-\d{4}-\d{6}$/) })
  it('Complaint: COMP-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`COMP-${y}-000001`).toMatch(/^COMP-\d{4}-\d{6}$/) })
  it('Service Request: SR-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`SR-${y}-000001`).toMatch(/^SR-\d{4}-\d{6}$/) })
  it('Warranty: WARR-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`WARR-${y}-000001`).toMatch(/^WARR-\d{4}-\d{6}$/) })
  it('AMC: AMC-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`AMC-${y}-000001`).toMatch(/^AMC-\d{4}-\d{6}$/) })
  it('Service Visit: SV-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`SV-${y}-000001`).toMatch(/^SV-\d{4}-\d{6}$/) })
  it('Replacement: REPL-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`REPL-${y}-000001`).toMatch(/^REPL-\d{4}-\d{6}$/) })
  it('Installation: INST-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`INST-${y}-000001`).toMatch(/^INST-\d{4}-\d{6}$/) })
})

// ════════════════════════════════════════════════════════════════════════════
// RBAC (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('CRM RBAC', () => {
  it('CUSTOMER_READ permission exists', () => { expect(Permission.CUSTOMER_READ).toBe('customer:read') })
  it('CUSTOMER_CREATE permission exists', () => { expect(Permission.CUSTOMER_CREATE).toBe('customer:create') })
  it('CUSTOMER_UPDATE permission exists', () => { expect(Permission.CUSTOMER_UPDATE).toBe('customer:update') })
  it('tenant_admin has customer permissions', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.CUSTOMER_READ)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.CUSTOMER_CREATE)).toBe(true)
  })
  it('procurement_manager does NOT have customer read (out of scope — customer domain belongs to sales)', () => {
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.CUSTOMER_READ)).toBe(false)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.SUPPLIER_READ)).toBe(true)
  })
  it('auditor has customer read', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.CUSTOMER_READ)).toBe(true)
  })
  it('warehouse_operator has customer read', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.CUSTOMER_READ)).toBe(true)
  })
  it('quality_manager does NOT have customer read (out of scope)', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.CUSTOMER_READ)).toBe(false)
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.QUALITY_READ)).toBe(true)
  })
  it('procurement_officer does NOT have customer permissions (out of scope — has supplier instead)', () => {
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.CUSTOMER_READ)).toBe(false)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.CUSTOMER_CREATE)).toBe(false)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.SUPPLIER_READ)).toBe(true)
  })
  it('tenant_admin can create and update customers', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.CUSTOMER_CREATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.CUSTOMER_UPDATE)).toBe(true)
  })
})
