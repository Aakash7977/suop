/**
 * Documentation Routes Tests
 *
 * Tests for the /openapi.json, /swagger, /redoc, /api-info endpoints.
 */

import { describe, it, expect } from 'vitest'
import { docsRoutes } from '@/routes/docs'

describe('Documentation Routes', () => {
  describe('GET /openapi.json', () => {
    it('returns OpenAPI 3.1 spec with 200', async () => {
      const res = await docsRoutes.request('/openapi.json')
      expect(res.status).toBe(200)
      const spec = await res.json()
      expect(spec.openapi).toBe('3.1.0')
      expect(spec.info.title).toBe('SUOP ERP API')
    })

    it('returns JSON content type', async () => {
      const res = await docsRoutes.request('/openapi.json')
      expect(res.headers.get('Content-Type')).toContain('application/json')
    })

    it('includes paths in spec', async () => {
      const res = await docsRoutes.request('/openapi.json')
      const spec = await res.json()
      expect(spec.paths).toBeDefined()
      expect(Object.keys(spec.paths).length).toBeGreaterThan(0)
    })

    it('includes components in spec', async () => {
      const res = await docsRoutes.request('/openapi.json')
      const spec = await res.json()
      expect(spec.components).toBeDefined()
      expect(spec.components.securitySchemes).toBeDefined()
      expect(spec.components.schemas).toBeDefined()
    })
  })

  describe('GET /swagger', () => {
    it('returns HTML with 200', async () => {
      const res = await docsRoutes.request('/swagger')
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('returns HTML content type', async () => {
      const res = await docsRoutes.request('/swagger')
      expect(res.headers.get('Content-Type')).toContain('text/html')
    })

    it('includes Swagger UI script', async () => {
      const res = await docsRoutes.request('/swagger')
      const html = await res.text()
      expect(html).toContain('swagger-ui-bundle.js')
    })

    it('references openapi.json', async () => {
      const res = await docsRoutes.request('/swagger')
      const html = await res.text()
      expect(html).toContain('/openapi.json')
    })
  })

  describe('GET /swagger/ (trailing slash)', () => {
    it('returns HTML with 200', async () => {
      const res = await docsRoutes.request('/swagger/')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /redoc', () => {
    it('returns HTML with 200', async () => {
      const res = await docsRoutes.request('/redoc')
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('returns HTML content type', async () => {
      const res = await docsRoutes.request('/redoc')
      expect(res.headers.get('Content-Type')).toContain('text/html')
    })

    it('includes ReDoc script', async () => {
      const res = await docsRoutes.request('/redoc')
      const html = await res.text()
      expect(html).toContain('redoc.standalone.js')
    })
  })

  describe('GET /redoc/ (trailing slash)', () => {
    it('returns HTML with 200', async () => {
      const res = await docsRoutes.request('/redoc/')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api-info', () => {
    it('returns version info with 200', async () => {
      const res = await docsRoutes.request('/api-info')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    it('returns current version', async () => {
      const res = await docsRoutes.request('/api-info')
      const body = await res.json()
      expect(body.data.current).toBe('v1')
    })

    it('returns supported versions array', async () => {
      const res = await docsRoutes.request('/api-info')
      const body = await res.json()
      expect(Array.isArray(body.data.supported)).toBe(true)
      expect(body.data.supported).toContain('v1')
    })
  })
})
