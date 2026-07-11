/**
 * @suop/backend — Base Error Hierarchy
 *
 * Per Phase 0 Architecture §13.1
 */

import { ErrorCode } from './error-codes'

export interface FieldError {
  field: string
  code: string
  message: string
  metadata?: Record<string, unknown>
}

interface BaseErrorOptions {
  details?: FieldError[]
  entityId?: string
  cause?: Error
}

export abstract class BaseError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  readonly details: FieldError[]
  readonly entityId: string | undefined
  override readonly cause: Error | undefined

  constructor(message: string, options?: BaseErrorOptions) {
    super(message)
    this.name = this.constructor.name
    this.details = options?.details ?? []
    this.entityId = options?.entityId
    this.cause = options?.cause
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details.length > 0 ? { details: this.details } : {}),
      ...(this.entityId ? { entityId: this.entityId } : {}),
    }
  }
}

// ─── 400 — Validation ───────────────────────────────────────────────────────

export class ValidationError extends BaseError {
  readonly code = ErrorCode.VALIDATION_REQUIRED_FIELD
  readonly statusCode = 400

  constructor(message: string, details?: FieldError[], options?: { cause?: Error }) {
    super(message, { details, cause: options?.cause })
  }
}

// ─── 401 — Authentication ────────────────────────────────────────────────────

export class AuthenticationError extends BaseError {
  readonly code: string
  readonly statusCode = 401

  constructor(message: string, code: string = ErrorCode.AUTH_TOKEN_INVALID, options?: { cause?: Error }) {
    super(message, { cause: options?.cause })
    this.code = code
  }
}

// ─── 403 — Authorization ─────────────────────────────────────────────────────

export class AuthorizationError extends BaseError {
  readonly code = ErrorCode.RBAC_PERMISSION_DENIED
  readonly statusCode = 403

  constructor(message: string, options?: BaseErrorOptions) {
    super(message, options)
  }
}

// ─── 404 — Not Found ─────────────────────────────────────────────────────────

export class NotFoundError extends BaseError {
  readonly code = ErrorCode.NOT_FOUND
  readonly statusCode = 404

  constructor(entityType: string, entityId?: string, options?: { cause?: Error }) {
    const message = entityId
      ? `${entityType} with id '${entityId}' not found`
      : `${entityType} not found`
    super(message, { entityId, cause: options?.cause })
  }
}

// ─── 409 — Concurrency ───────────────────────────────────────────────────────

export class ConcurrencyError extends BaseError {
  readonly code = ErrorCode.CONCURRENCY_VERSION_MISMATCH
  readonly statusCode = 409

  constructor(message: string = 'The record was modified by another transaction. Please reload and try again.', options?: BaseErrorOptions) {
    super(message, options)
  }
}

// ─── 409 — Conflict ──────────────────────────────────────────────────────────

export class ConflictError extends BaseError {
  readonly code = ErrorCode.CONFLICT
  readonly statusCode = 409

  constructor(message: string, options?: BaseErrorOptions) {
    super(message, options)
  }
}

// ─── 422 — Business Rule ─────────────────────────────────────────────────────

export class BusinessRuleError extends BaseError {
  readonly code: string
  readonly statusCode = 422

  constructor(message: string, options?: { code?: string; entityId?: string; cause?: Error }) {
    super(message, { entityId: options?.entityId, cause: options?.cause })
    this.code = options?.code ?? ErrorCode.VALIDATION_BUSINESS_RULE
  }
}

// ─── 429 — Rate Limit ────────────────────────────────────────────────────────

export class RateLimitError extends BaseError {
  readonly code = ErrorCode.RATE_LIMIT_EXCEEDED
  readonly statusCode = 429
  readonly retryAfter: number

  constructor(retryAfterSeconds: number) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`)
    this.retryAfter = retryAfterSeconds
  }

  override toJSON() {
    return { ...super.toJSON(), retryAfter: this.retryAfter }
  }
}

// ─── 500 — Internal ──────────────────────────────────────────────────────────

export class InternalError extends BaseError {
  readonly code = ErrorCode.INTERNAL_ERROR
  readonly statusCode = 500

  constructor(message: string = 'An internal server error occurred', options?: { cause?: Error }) {
    super(message, { cause: options?.cause })
  }
}

// ─── 500 — Database ──────────────────────────────────────────────────────────

export class DatabaseError extends BaseError {
  readonly code: string
  readonly statusCode = 500

  constructor(message: string, options?: { code?: string; cause?: Error }) {
    super(message, { cause: options?.cause })
    this.code = options?.code ?? ErrorCode.DATABASE_TRANSACTION_FAILED
  }
}

// ─── 502 — External Service ──────────────────────────────────────────────────

export class ExternalServiceError extends BaseError {
  readonly code: string
  readonly statusCode = 502

  constructor(message: string, code: string = ErrorCode.EXTERNAL_S3_UNAVAILABLE, options?: { cause?: Error }) {
    super(message, { cause: options?.cause })
    this.code = code
  }
}

// ─── 503 — Service Unavailable ───────────────────────────────────────────────

export class ServiceUnavailableError extends BaseError {
  readonly code = ErrorCode.SERVICE_UNAVAILABLE
  readonly statusCode = 503

  constructor(message: string = 'Service temporarily unavailable') {
    super(message)
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getHttpStatus(error: BaseError): number {
  return error.statusCode
}

export function toBaseError(error: unknown): BaseError {
  if (error instanceof BaseError) return error
  if (error instanceof Error) {
    return new InternalError(error.message, { cause: error })
  }
  return new InternalError(String(error))
}
