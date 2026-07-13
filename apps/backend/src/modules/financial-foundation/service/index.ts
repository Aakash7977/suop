import '@/modules/financial-foundation/workflow'
import { chartOfAccountsRepository, fiscalYearRepository, fiscalPeriodRepository, costCenterRepository, profitCenterRepository, currencyRepository, exchangeRateRepository } from '../repository'
import { auditService } from '@/core/audit'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'
function getContext() { const ctx = getRequestContext(); if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required'); return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx } }

export const financialFoundationService = {
  async createAccount(data: { accountCode: string; accountName: string; accountType: string; accountSubtype?: string; parentAccountId?: string; isPostable?: boolean; openingBalance?: number; currency?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS']
    if (!validTypes.includes(data.accountType)) throw new BusinessRuleError(`Invalid account type: ${data.accountType}`, { code: 'FIN.INVALID_ACCOUNT_TYPE' })
    const account = await chartOfAccountsRepository.create({ tenantId, ...data, isActive: true, isPostable: data.isPostable ?? true, currentBalance: data.openingBalance ?? 0 })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ChartOfAccounts', entityId: String(account!['id']), entityCode: data.accountCode, after: data })
    return account
  },
  async listAccounts(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) { const { tenantId } = getContext(); return chartOfAccountsRepository.list(tenantId, params) },
  async createFiscalYear(data: { fiscalYear: string; startDate: string; endDate: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (new Date(data.endDate) < new Date(data.startDate)) throw new BusinessRuleError('End date must be after start date', { code: 'FIN.INVALID_DATES' })
    const fy = await fiscalYearRepository.create({ tenantId, ...data, isCurrent: false, isClosed: false })
    // Auto-create 12 periods
    for (let i = 1; i <= 12; i++) { const ps = new Date(data.startDate); ps.setMonth(ps.getMonth() + (i - 1)); const pe = new Date(ps); pe.setMonth(pe.getMonth() + 1); pe.setDate(pe.getDate() - 1); await fiscalPeriodRepository.create({ tenantId, fiscalYearId: fy!['id'], fiscalYear: data.fiscalYear, periodNumber: i, periodName: `${data.fiscalYear}-P${i}`, startDate: ps.toISOString().split('T')[0], endDate: pe.toISOString().split('T')[0], status: 'OPEN', isAdjustmentPeriod: false }) }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'FiscalYear', entityId: String(fy!['id']), entityCode: data.fiscalYear, after: data })
    return fy
  },
  async listFiscalYears(params: { page?: number; pageSize?: number } = {}) { const { tenantId } = getContext(); return fiscalYearRepository.list(tenantId, params) },
  async listFiscalPeriods(params: { page?: number; pageSize?: number; isActive?: boolean } = {}) { const { tenantId } = getContext(); return fiscalPeriodRepository.list(tenantId, params) },
  async closePeriod(data: { fiscalYear: string; periodNumber: number }) {
    const { tenantId, userId, ctx } = getContext()
    const result = await query(`UPDATE fiscal_periods SET status = 'CLOSED', closed_at = NOW(), closed_by = $3, closed_by_name = $4, updated_at = NOW() WHERE tenant_id = $1 AND fiscal_year = $2 AND period_number = $5 AND status = 'OPEN' RETURNING *`, [tenantId, data.fiscalYear, userId, ctx.userEmail, data.periodNumber])
    if (result.rows.length === 0) throw new BusinessRuleError('Period not found or already closed', { code: 'FIN.PERIOD_NOT_OPEN' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'PERIOD_CLOSED', entityType: 'FiscalPeriod', entityId: String(result.rows[0]!['id']), after: data })
    return result.rows[0]
  },
  async createCostCenter(data: { ccCode: string; ccName: string; parentCcId?: string; companyId?: string; companyName?: string; plantId?: string; plantName?: string; description?: string }) { const { tenantId, userId, ctx } = getContext(); const cc = await costCenterRepository.create({ tenantId, ...data, isActive: true }); await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'CostCenter', entityId: String(cc!['id']), entityCode: data.ccCode }); return cc },
  async listCostCenters(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) { const { tenantId } = getContext(); return costCenterRepository.list(tenantId, params) },
  async createProfitCenter(data: { pcCode: string; pcName: string; parentPcId?: string; companyId?: string; companyName?: string; description?: string }) { const { tenantId, userId, ctx } = getContext(); const pc = await profitCenterRepository.create({ tenantId, ...data, isActive: true }); await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ProfitCenter', entityId: String(pc!['id']), entityCode: data.pcCode }); return pc },
  async listProfitCenters(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) { const { tenantId } = getContext(); return profitCenterRepository.list(tenantId, params) },
  async createCurrency(data: { currencyCode: string; currencyName: string; symbol?: string; decimalPlaces?: number; isBaseCurrency?: boolean }) { const { tenantId, userId, ctx } = getContext(); const c = await currencyRepository.create({ tenantId, ...data, isActive: true }); await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Currency', entityId: String(c!['id']), entityCode: data.currencyCode }); return c },
  async listCurrencies(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) { const { tenantId } = getContext(); return currencyRepository.list(tenantId, params) },
  async setExchangeRate(data: { fromCurrency: string; toCurrency: string; rate: number; rateDate: string; rateType?: string }) { const { tenantId, userId, ctx } = getContext(); if (data.rate <= 0) throw new BusinessRuleError('Exchange rate must be positive', { code: 'FIN.INVALID_RATE' }); const er = await exchangeRateRepository.create({ tenantId, ...data }); await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SET_EXCHANGE_RATE', entityType: 'ExchangeRate', entityId: String(er!['id']), after: data }); return er },
  async listExchangeRates(params: { page?: number; pageSize?: number } = {}) { const { tenantId } = getContext(); return exchangeRateRepository.list(tenantId, params) },
}
