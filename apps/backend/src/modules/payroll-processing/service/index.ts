import { getRequestContext } from '@/core/context'
import { NotFoundError, AuthorizationError } from '@/core/errors'
function getContext() { const ctx = getRequestContext(); if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required'); return { tenantId: ctx.tenantId } }
export const PayrollProcessingService = {
  async list(_params: { page?: number; pageSize?: number; status?: string } = {}) { const _ctx = getContext(); void _ctx; return { rows: [], total: 0, page: 1, pageSize: 25 } },
  async getById(id: string) { const _ctx = getContext(); void _ctx; throw new NotFoundError('PayrollProcessing', id) },
}
