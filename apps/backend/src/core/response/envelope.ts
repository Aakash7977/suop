/**
 * @suop/backend — Response Envelope
 *
 * Per API Standards §11: Every API response uses the same envelope.
 *
 * Success: { success: true, data: T, message?, meta? }
 * Error:   { success: false, error: { code, message, details?, entityId?, retryAfter? }, meta? }
 */

export interface ResponseMeta {
  correlationId: string
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
  nextCursor?: string
}

export interface SuccessEnvelope<T> {
  success: true
  data: T
  message?: string
  meta?: ResponseMeta
}

export interface ErrorEnvelope {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{
      field: string
      code: string
      message: string
      metadata?: Record<string, unknown>
    }>
    entityId?: string
    retryAfter?: number
  }
  meta?: ResponseMeta
}

export type ResponseEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope

// ─── Factory Functions ──────────────────────────────────────────────────────

export function success<T>(
  data: T,
  options?: { message?: string; meta?: ResponseMeta }
): SuccessEnvelope<T> {
  const result: SuccessEnvelope<T> = { success: true, data }
  if (options?.message) result.message = options.message
  if (options?.meta) result.meta = options.meta
  return result
}

export function error(
  errorData: ErrorEnvelope['error'],
  meta?: ResponseMeta
): ErrorEnvelope {
  const result: ErrorEnvelope = { success: false, error: errorData }
  if (meta) result.meta = meta
  return result
}

export function paginated<T>(
  data: T[],
  meta: Required<Pick<ResponseMeta, 'page' | 'pageSize' | 'total'>> & ResponseMeta
): SuccessEnvelope<T[]> {
  const totalPages = Math.ceil(meta.total / meta.pageSize)
  return success(data, {
    meta: {
      ...meta,
      totalPages,
      hasNext: meta.page < totalPages,
      hasPrev: meta.page > 1,
    },
  })
}
