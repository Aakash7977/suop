/**
 * @suop/backend — Structured Logging Framework
 *
 * Per Phase 0 Architecture §6.5 and DevOps §10
 */

import pino, { type Logger as PinoLoggerType, type Level } from 'pino'
import { env, isProduction, isTest } from '@/config/env'
import { getRequestContext } from '@/core/context'

// ─── Sensitive Field Redaction ──────────────────────────────────────────────

const SENSITIVE_PATHS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'aadhaar',
  'pan',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.secret',
  '*.apiKey',
  '*.authorization',
]

// ─── Logger Factory ─────────────────────────────────────────────────────────

function createRootLogger(): PinoLoggerType {
  const level = (env.LOG_LEVEL ?? 'info') as Level

  if (isTest) {
    return pino(
      { level: 'warn', redact: SENSITIVE_PATHS },
      pino.destination(process.stderr.fd)
    )
  }

  if (isProduction) {
    return pino({
      level,
      redact: SENSITIVE_PATHS,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label: string) {
          return { level: label }
        },
      },
    })
  }

  return pino({
    level,
    redact: SENSITIVE_PATHS,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  })
}

// ─── Logger Class ───────────────────────────────────────────────────────────

class Logger {
  private readonly root: PinoLoggerType

  constructor(root?: PinoLoggerType) {
    this.root = root ?? createRootLogger()
  }

  private ctx(): PinoLoggerType {
    const c = getRequestContext()
    if (c) {
      return this.root.child({
        correlationId: c.correlationId,
        userId: c.userId,
        tenantId: c.tenantId,
        method: c.method,
        path: c.path,
      })
    }
    return this.root
  }

  fatal(msg: string, data?: Record<string, unknown>): void {
    this.ctx().fatal(data ?? {}, msg)
  }

  error(msg: string, data?: Record<string, unknown>): void {
    this.ctx().error(data ?? {}, msg)
  }

  warn(msg: string, data?: Record<string, unknown>): void {
    this.ctx().warn(data ?? {}, msg)
  }

  info(msg: string, data?: Record<string, unknown>): void {
    this.ctx().info(data ?? {}, msg)
  }

  debug(msg: string, data?: Record<string, unknown>): void {
    this.ctx().debug(data ?? {}, msg)
  }

  trace(msg: string, data?: Record<string, unknown>): void {
    this.ctx().trace(data ?? {}, msg)
  }

  child(bindings: Record<string, unknown>): Logger {
    return new Logger(this.root.child(bindings))
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const logger = new Logger()

export type { Logger }
