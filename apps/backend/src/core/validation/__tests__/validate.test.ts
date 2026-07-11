import { describe, it, expect, beforeEach } from 'vitest'
import { schemaRegistry, validate, schemas } from '../validate'
import { z } from 'zod'
import { ValidationError } from '@/core/errors'

describe('Schema Registry', () => {
  beforeEach(() => {
    // Clear by creating a new registry (the singleton can't be cleared,
    // but we test with unique names)
  })

  it('registers and retrieves a schema', () => {
    const schema = z.object({ name: z.string() })
    schemaRegistry.register('TestSchema_Unique_1', schema)
    const retrieved = schemaRegistry.get('TestSchema_Unique_1')
    expect(retrieved).toBe(schema)
  })

  it('lists registered schemas', () => {
    schemaRegistry.register('TestSchema_Unique_2', z.object({ id: z.string() }))
    const list = schemaRegistry.list()
    expect(list).toContain('TestSchema_Unique_1')
    expect(list).toContain('TestSchema_Unique_2')
  })

  it('checks if schema exists', () => {
    expect(schemaRegistry.has('TestSchema_Unique_1')).toBe(true)
    expect(schemaRegistry.has('NonExistentSchema')).toBe(false)
  })

  it('throws when registering duplicate name', () => {
    expect(() => schemaRegistry.register('TestSchema_Unique_1', z.string())).toThrow(
      /already registered/
    )
  })

  it('throws when getting unknown schema', () => {
    expect(() => schemaRegistry.get('DoesNotExist_999')).toThrow(/not found/)
  })
})

describe('validate', () => {
  it('returns parsed data when valid', () => {
    const schema = z.object({ name: z.string(), age: z.number() })
    const result = validate(schema, { name: 'Alice', age: 30 })
    expect(result).toEqual({ name: 'Alice', age: 30 })
  })

  it('throws ValidationError when invalid', () => {
    const schema = z.object({ name: z.string() })
    expect(() => validate(schema, { name: 123 })).toThrow(ValidationError)
  })

  it('includes field errors in ValidationError', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    })
    try {
      validate(schema, { email: 'not-email', age: 10 })
      expect.fail('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect((e as ValidationError).details).toHaveLength(2)
    }
  })
})

describe('Shared Schema Fragments', () => {
  it('schemas.email validates email', () => {
    expect(schemas.email.safeParse('test@example.com').success).toBe(true)
    expect(schemas.email.safeParse('not-email').success).toBe(false)
  })

  it('schemas.gst validates GST format', () => {
    expect(schemas.gst.safeParse('27AAAAA0000A1Z5').success).toBe(true)
    expect(schemas.gst.safeParse('invalid').success).toBe(false)
  })

  it('schemas.pan validates PAN format', () => {
    expect(schemas.pan.safeParse('ABCDE1234F').success).toBe(true)
    expect(schemas.pan.safeParse('invalid').success).toBe(false)
  })

  it('schemas.pagination has defaults', () => {
    const result = schemas.pagination.parse({})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(25)
  })

  it('schemas.pagination enforces max pageSize', () => {
    expect(() => schemas.pagination.parse({ pageSize: 201 })).toThrow()
  })

  it('schemas.positiveInt rejects zero and negatives', () => {
    expect(schemas.positiveInt.safeParse(5).success).toBe(true)
    expect(schemas.positiveInt.safeParse(0).success).toBe(false)
    expect(schemas.positiveInt.safeParse(-1).success).toBe(false)
  })
})
