import { describe, it, expect } from 'vitest'
import {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConcurrencyError,
  ConflictError,
  BusinessRuleError,
  RateLimitError,
  InternalError,
  DatabaseError,
  ExternalServiceError,
  ServiceUnavailableError,
  toBaseError,
  getHttpStatus,
} from '../base-error'
import { ErrorCode } from '../error-codes'

describe('Error Hierarchy', () => {
  it('ValidationError has 400 status', () => {
    const e = new ValidationError('Invalid input')
    expect(e.statusCode).toBe(400)
    expect(e.code).toBe(ErrorCode.VALIDATION_REQUIRED_FIELD)
    expect(e.message).toBe('Invalid input')
  })

  it('ValidationError carries field errors', () => {
    const e = new ValidationError('Validation failed', [
      { field: 'email', code: 'INVALID_FORMAT', message: 'Not an email' },
    ])
    expect(e.details).toHaveLength(1)
    expect(e.details![0].field).toBe('email')
  })

  it('AuthenticationError defaults to AUTH_TOKEN_INVALID', () => {
    const e = new AuthenticationError('Bad token')
    expect(e.statusCode).toBe(401)
    expect(e.code).toBe(ErrorCode.AUTH_TOKEN_INVALID)
  })

  it('AuthenticationError accepts custom code', () => {
    const e = new AuthenticationError('Expired', ErrorCode.AUTH_TOKEN_EXPIRED)
    expect(e.code).toBe(ErrorCode.AUTH_TOKEN_EXPIRED)
  })

  it('AuthorizationError has 403 status', () => {
    const e = new AuthorizationError('No permission')
    expect(e.statusCode).toBe(403)
    expect(e.code).toBe(ErrorCode.RBAC_PERMISSION_DENIED)
  })

  it('NotFoundError builds message from entity type and ID', () => {
    const e = new NotFoundError('Product', 'prod-123')
    expect(e.statusCode).toBe(404)
    expect(e.message).toBe("Product with id 'prod-123' not found")
    expect(e.entityId).toBe('prod-123')
  })

  it('NotFoundError works without ID', () => {
    const e = new NotFoundError('Product')
    expect(e.message).toBe('Product not found')
  })

  it('ConcurrencyError has 409 status', () => {
    const e = new ConcurrencyError()
    expect(e.statusCode).toBe(409)
    expect(e.code).toBe(ErrorCode.CONCURRENCY_VERSION_MISMATCH)
  })

  it('ConflictError has 409 status', () => {
    const e = new ConflictError('Duplicate SKU')
    expect(e.statusCode).toBe(409)
  })

  it('BusinessRuleError has 422 status', () => {
    const e = new BusinessRuleError('Supplier is inactive', { code: 'PO.SUPPLIER_INACTIVE' })
    expect(e.statusCode).toBe(422)
    expect(e.code).toBe('PO.SUPPLIER_INACTIVE')
  })

  it('RateLimitError has 429 status and retryAfter', () => {
    const e = new RateLimitError(30)
    expect(e.statusCode).toBe(429)
    expect(e.retryAfter).toBe(30)
    expect(e.toJSON()).toHaveProperty('retryAfter', 30)
  })

  it('InternalError has 500 status', () => {
    const e = new InternalError('Something broke')
    expect(e.statusCode).toBe(500)
    expect(e.code).toBe(ErrorCode.INTERNAL_ERROR)
  })

  it('DatabaseError accepts custom code', () => {
    const e = new DatabaseError('Connection failed', { code: ErrorCode.DATABASE_CONNECTION_FAILED })
    expect(e.code).toBe(ErrorCode.DATABASE_CONNECTION_FAILED)
  })

  it('ExternalServiceError has 502 status', () => {
    const e = new ExternalServiceError('S3 down')
    expect(e.statusCode).toBe(502)
  })

  it('ServiceUnavailableError has 503 status', () => {
    const e = new ServiceUnavailableError()
    expect(e.statusCode).toBe(503)
  })
})

describe('toBaseError', () => {
  it('passes through BaseError instances', () => {
    const original = new NotFoundError('Product', 'p1')
    const result = toBaseError(original)
    expect(result).toBe(original)
  })

  it('wraps generic Error in InternalError', () => {
    const original = new Error('boom')
    const result = toBaseError(original)
    expect(result).toBeInstanceOf(InternalError)
    expect(result.message).toBe('boom')
    expect(result.cause).toBe(original)
  })

  it('wraps non-Error values', () => {
    const result = toBaseError('string error')
    expect(result).toBeInstanceOf(InternalError)
    expect(result.message).toBe('string error')
  })
})

describe('getHttpStatus', () => {
  it('returns error statusCode', () => {
    expect(getHttpStatus(new NotFoundError('X'))).toBe(404)
    expect(getHttpStatus(new ValidationError('X'))).toBe(400)
    expect(getHttpStatus(new InternalError())).toBe(500)
  })
})

describe('toJSON', () => {
  it('includes code and message', () => {
    const e = new NotFoundError('Product', 'p1')
    const json = e.toJSON()
    expect(json.code).toBe(ErrorCode.NOT_FOUND)
    expect(json.message).toContain('Product')
    expect(json.entityId).toBe('p1')
  })

  it('includes details when present', () => {
    const e = new ValidationError('Bad', [
      { field: 'name', code: 'REQUIRED', message: 'Name is required' },
    ])
    const json = e.toJSON()
    expect(json.details).toHaveLength(1)
  })

  it('omits details when absent', () => {
    const e = new ValidationError('Bad')
    const json = e.toJSON()
    expect(json).not.toHaveProperty('details')
  })
})
