/**
 * @suop/shared — Shared Utilities, Types, Constants, Exceptions, Logging
 * Sprint 2: Epics 5 & 6
 */

// ═══════════════════════════════════════════════════════
// EPIC 6: Exception Framework
// ═══════════════════════════════════════════════════════

export enum ErrorCode {
  // ─── General ──────────────────────────────────────
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // ─── Business ─────────────────────────────────────
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  DUPLICATE_ENTITY = 'DUPLICATE_ENTITY',

  // ─── Integration ──────────────────────────────────
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // ─── Auth ─────────────────────────────────────────
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  MFA_REQUIRED = 'MFA_REQUIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ─── Base Exception ─────────────────────────────────────
export class SUOPException extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public statusCode: number = 500,
    public severity: ErrorSeverity = ErrorSeverity.HIGH,
    public details?: Record<string, unknown>,
    public errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      errors: this.errors || [],
      details: this.details,
    };
  }
}

// ─── Business Exception ─────────────────────────────────
export class BusinessException extends SUOPException {
  constructor(message: string, code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION, details?: Record<string, unknown>) {
    super(message, code, 422, ErrorSeverity.MEDIUM, details);
  }
}

// ─── Validation Exception ───────────────────────────────
export class ValidationException extends SUOPException {
  constructor(message: string, errors: Array<{ field: string; message: string }>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, ErrorSeverity.LOW, undefined, errors);
  }
}

// ─── Unauthorized Exception ─────────────────────────────
export class UnauthorizedException extends SUOPException {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCode.UNAUTHORIZED, 401, ErrorSeverity.MEDIUM);
  }
}

// ─── Forbidden Exception ────────────────────────────────
export class ForbiddenException extends SUOPException {
  constructor(message: string = 'Access denied') {
    super(message, ErrorCode.FORBIDDEN, 403, ErrorSeverity.MEDIUM);
  }
}

// ─── Conflict Exception ─────────────────────────────────
export class ConflictException extends SUOPException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT, 409, ErrorSeverity.MEDIUM, details);
  }
}

// ─── Not Found Exception ────────────────────────────────
export class NotFoundException extends SUOPException {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      ErrorCode.NOT_FOUND,
      404,
      ErrorSeverity.LOW,
    );
  }
}

// ─── Integration Exception ──────────────────────────────
export class IntegrationException extends SUOPException {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(
      `Integration error with ${service}: ${message}`,
      ErrorCode.INTEGRATION_ERROR,
      502,
      ErrorSeverity.HIGH,
      { service, ...details },
    );
  }
}

// ─── Rate Limit Exception ───────────────────────────────
export class RateLimitException extends SUOPException {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, ErrorSeverity.LOW);
  }
}

// ═══════════════════════════════════════════════════════
// EPIC 5: Shared Logging Framework
// ═══════════════════════════════════════════════════════

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  module: string;
  message: string;
  correlationId?: string;
  traceId?: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  entityType?: string;
  entityId?: string;
  duration?: number;
  statusCode?: number;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// ─── Logger ─────────────────────────────────────────────
class Logger {
  private service: string;
  private module: string;
  private minLevel: LogLevel;
  private redactPII: boolean;

  private readonly piiFields = [
    'password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn',
    'pan', 'aadhaar', 'salary', 'email', 'phone', 'mobile',
  ];

  private readonly levelPriority: Record<LogLevel, number> = {
    [LogLevel.TRACE]: 0,
    [LogLevel.DEBUG]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.WARN]: 3,
    [LogLevel.ERROR]: 4,
    [LogLevel.FATAL]: 5,
  };

  constructor(service: string = 'suop', module: string = 'platform') {
    this.service = service;
    this.module = module;
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.redactPII = process.env.LOG_REDACT_PII !== 'false';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private redact(data: Record<string, unknown>): Record<string, unknown> {
    if (!this.redactPII) return data;

    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (this.piiFields.some(field => lowerKey.includes(field))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        redacted[key] = this.redact(value as Record<string, unknown>);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  private log(level: LogLevel, message: string, context?: Partial<LogEntry>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      module: this.module,
      message,
      correlationId: context?.correlationId,
      traceId: context?.traceId,
      requestId: context?.requestId,
      userId: context?.userId,
      tenantId: context?.tenantId,
      entityType: context?.entityType,
      entityId: context?.entityId,
      duration: context?.duration,
      statusCode: context?.statusCode,
      metadata: context?.metadata ? this.redact(context.metadata) : undefined,
      error: context?.error,
    };

    // Output as structured JSON
    console.log(JSON.stringify(entry));
  }

  trace(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Partial<LogEntry>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Partial<LogEntry>): void {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  fatal(message: string, error?: Error, context?: Partial<LogEntry>): void {
    this.log(LogLevel.FATAL, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  // ─── Factory for module-specific loggers ─────────
  forModule(module: string): Logger {
    return new Logger(this.service, module);
  }
}

export const logger = new Logger('suop', 'platform');
export function createLogger(service: string, module: string): Logger {
  return new Logger(service, module);
}

// ═══════════════════════════════════════════════════════
// Shared Types & Constants
// ═══════════════════════════════════════════════════════

// ─── API Response Types ─────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    cursor?: string;
    correlationId?: string;
  };
  errors?: Array<{ code: string; field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    cursor?: string;
    correlationId?: string;
  };
}

// ─── Common Types ───────────────────────────────────────
export type UUID = string;
export type ISODateString = string;

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: ISODateString | null;
}

export interface AuditableEntity extends SoftDeletableEntity {
  version: number;
}

// ─── Pagination ─────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | string[] | number | boolean | undefined;
}

// ─── Status Types ───────────────────────────────────────
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';

// ─── Module Codes ───────────────────────────────────────
export const ModuleCodes = {
  ORGANIZATION: 'ORG',
  IDENTITY: 'IDM',
  PRODUCT: 'PROD',
  INVENTORY: 'INV',
  PROCUREMENT: 'PROC',
  WAREHOUSE: 'WMS',
  MANUFACTURING: 'MES',
  QUALITY: 'QMS',
  RETAIL: 'RTL',
  RESTAURANT: 'RST',
  FINANCE: 'FIN',
  WORKFORCE: 'HR',
  MAINTENANCE: 'EAM',
  PLATFORM: 'PLT',
  AI: 'AI',
} as const;

// ─── Export Everything ──────────────────────────────────
export default {
  // Exceptions
  SUOPException,
  BusinessException,
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  IntegrationException,
  RateLimitException,
  ErrorCode,
  ErrorSeverity,
  // Logging
  Logger,
  logger,
  createLogger,
  LogLevel,
  // Types
  ModuleCodes,
};
