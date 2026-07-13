/** Typed error classes for different HTTP failure modes */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string = 'UNKNOWN',
    public details?: unknown[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, code = 'CONFLICT', details?: unknown[]) {
    super(message, 409, code, details)
    this.name = 'ConflictError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, 404, code)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields: Array<{ field: string; message: string }> = [],
    code = 'VALIDATION_ERROR'
  ) {
    super(message, 422, code, fields)
    this.name = 'ValidationError'
  }
}

export class BusinessRuleError extends ApiError {
  constructor(message: string, public rule: string, code = 'BUSINESS_RULE') {
    super(message, 400, code)
    this.name = 'BusinessRuleError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}
