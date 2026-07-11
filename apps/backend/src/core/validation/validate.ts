/**
 * @suop/backend — Validation Framework
 *
 * Per Phase 0 Architecture §12: Two-layer validation
 *   1. Schema validation (zod) — request shape
 *   2. Business rule validation (service layer)
 *
 * Per API Standards §15: Schema Registry
 *   - Every zod schema registered at boot
 *   - Schemas fetchable via /api/_internal/schemas/:name for frontend codegen
 */

import { z } from 'zod'
import { ValidationError, type FieldError } from '@/core/errors'

// ─── Schema Registry ────────────────────────────────────────────────────────

class SchemaRegistry {
  private readonly schemas = new Map<string, z.ZodType>()

  register(name: string, schema: z.ZodType): void {
    if (this.schemas.has(name)) {
      throw new Error(`Schema '${name}' is already registered. Use a versioned name (e.g., '${name}V2').`)
    }
    this.schemas.set(name, schema)
  }

  get<T extends z.ZodType>(name: string): T {
    const schema = this.schemas.get(name)
    if (!schema) throw new Error(`Schema '${name}' not found.`)
    return schema as T
  }

  list(): string[] {
    return Array.from(this.schemas.keys()).sort()
  }

  has(name: string): boolean {
    return this.schemas.has(name)
  }
}

export const schemaRegistry = new SchemaRegistry()

// ─── Validation Function ────────────────────────────────────────────────────

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }
  const fieldErrors: FieldError[] = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    code: issue.code,
    message: issue.message,
  }))
  throw new ValidationError('Request validation failed', fieldErrors)
}

export function validateAsync<T>(schema: z.ZodType<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data)
}

// ─── Shared Schema Fragments ────────────────────────────────────────────────

export const schemas = {
  uuid: z.string().uuid('Must be a valid UUID'),
  uuidv7: z.string().uuid('Must be a valid UUID'),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(25),
  }),
  sort: z.object({
    field: z.string().min(1),
    direction: z.enum(['asc', 'desc']).default('desc'),
  }),
  cursor: z.object({
    cursor: z.string().optional(),
    pageSize: z.coerce.number().int().min(1).max(200).default(25),
  }),
  email: z.string().email('Must be a valid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Must be a valid phone number (E.164)'),
  gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  money: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid monetary amount'),
  quantity: z.string().regex(/^\d+(\.\d{1,3})?$/, 'Must be a valid quantity'),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),
  isoDate: z.string().datetime({ message: 'Must be an ISO 8601 datetime' }),
  nonEmptyString: z.string().min(1, 'Must not be empty'),
  enum: <T extends readonly string[]>(values: T) => z.enum(values as unknown as [string, ...string[]]),
  status: <T extends readonly string[]>(values: T) => z.enum(values as unknown as [string, ...string[]]),
} as const

// ─── Export ─────────────────────────────────────────────────────────────────

export type { SchemaRegistry }
