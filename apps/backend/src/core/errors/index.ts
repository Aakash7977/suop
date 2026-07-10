export {
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
  getHttpStatus,
  toBaseError,
  type FieldError,
} from './base-error'

export { ErrorCode, ERROR_HTTP_STATUS } from './error-codes'
