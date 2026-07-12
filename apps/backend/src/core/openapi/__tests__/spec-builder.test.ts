/**
 * OpenAPI Spec Builder Tests
 *
 * Tests for the OpenAPI 3.1 specification generator.
 */

import { describe, it, expect } from 'vitest'
import {
  buildOpenApiSpec,
  getSwaggerUiHtml,
  getRedocHtml,
  getApiVersionInfo,
} from '@/core/openapi/spec-builder'

describe('OpenAPI Spec Builder', () => {
  describe('buildOpenApiSpec', () => {
    const spec = buildOpenApiSpec()

    it('returns an OpenAPI 3.1 document', () => {
      expect(spec.openapi).toBe('3.1.0')
    })

    it('includes info section with title and version', () => {
      expect(spec.info).toBeDefined()
      expect(spec.info!.title).toBe('SUOP ERP API')
      expect(spec.info!.version).toBe('1.0.0-rc1')
    })

    it('includes contact information', () => {
      expect(spec.info!.contact).toBeDefined()
      expect(spec.info!.contact!.email).toBeTruthy()
      expect(spec.info!.contact!.url).toBeTruthy()
    })

    it('includes license information', () => {
      expect(spec.info!.license).toBeDefined()
    })

    it('includes terms of service', () => {
      expect(spec.info!.termsOfService).toBeTruthy()
    })

    it('includes at least one server URL', () => {
      expect(spec.servers).toBeDefined()
      expect(spec.servers!.length).toBeGreaterThan(0)
      expect(spec.servers![0]!.url).toBeTruthy()
    })

    it('includes paths object', () => {
      expect(spec.paths).toBeDefined()
      expect(Object.keys(spec.paths!).length).toBeGreaterThan(0)
    })

    it('includes health endpoint', () => {
      expect(spec.paths!['/health']).toBeDefined()
      expect(spec.paths!['/health']!.get).toBeDefined()
    })

    it('includes live endpoint', () => {
      expect(spec.paths!['/live']).toBeDefined()
    })

    it('includes ready endpoint', () => {
      expect(spec.paths!['/ready']).toBeDefined()
    })

    it('includes auth login endpoint', () => {
      expect(spec.paths!['/api/v1/auth/login']).toBeDefined()
      expect(spec.paths!['/api/v1/auth/login']!.post).toBeDefined()
    })

    it('includes security schemes', () => {
      expect(spec.components).toBeDefined()
      expect(spec.components!.securitySchemes).toBeDefined()
    })

    it('includes BearerAuth security scheme', () => {
      expect(spec.components!.securitySchemes!.BearerAuth).toBeDefined()
      const bearer = spec.components!.securitySchemes!.BearerAuth as any
      expect(bearer.type).toBe('http')
      expect(bearer.scheme).toBe('bearer')
      expect(bearer.bearerFormat).toBe('JWT')
    })

    it('includes ApiKeyAuth security scheme', () => {
      expect(spec.components!.securitySchemes!.ApiKeyAuth).toBeDefined()
      const apiKey = spec.components!.securitySchemes!.ApiKeyAuth as any
      expect(apiKey.type).toBe('apiKey')
      expect(apiKey.in).toBe('header')
      expect(apiKey.name).toBe('X-API-Key')
    })

    it('includes OAuth2 placeholder security scheme', () => {
      expect(spec.components!.securitySchemes!.OAuth2).toBeDefined()
      const oauth = spec.components!.securitySchemes!.OAuth2 as any
      expect(oauth.type).toBe('oauth2')
      expect(oauth.flows).toBeDefined()
    })

    it('includes common schemas', () => {
      expect(spec.components!.schemas).toBeDefined()
      expect(spec.components!.schemas!.SuccessResponse).toBeDefined()
      expect(spec.components!.schemas!.PaginatedResponse).toBeDefined()
      expect(spec.components!.schemas!.ErrorResponse).toBeDefined()
      expect(spec.components!.schemas!.ValidationError).toBeDefined()
      expect(spec.components!.schemas!.RateLimitError).toBeDefined()
      expect(spec.components!.schemas!.HealthCheck).toBeDefined()
      expect(spec.components!.schemas!.VersionInfo).toBeDefined()
    })

    it('includes tags', () => {
      expect(spec.tags).toBeDefined()
      expect(spec.tags!.length).toBeGreaterThan(0)
    })

    it('includes System tag', () => {
      const hasSystemTag = spec.tags!.some((t) => t.name === 'System')
      expect(hasSystemTag).toBe(true)
    })

    it('includes Authentication tag', () => {
      const hasAuthTag = spec.tags!.some((t) => t.name === 'Authentication')
      expect(hasAuthTag).toBe(true)
    })

    it('includes external docs', () => {
      expect(spec.externalDocs).toBeDefined()
      expect(spec.externalDocs!.url).toBeTruthy()
    })

    it('includes default security requirement', () => {
      expect(spec.security).toBeDefined()
      expect(spec.security!.length).toBeGreaterThan(0)
    })
  })

  describe('Path Operations', () => {
    const spec = buildOpenApiSpec()

    it('health endpoint has operationId', () => {
      const op = spec.paths!['/health']!.get!
      expect(op.operationId).toBe('getHealth')
      expect(op.summary).toBeTruthy()
      expect(op.tags).toContain('System')
    })

    it('list endpoints have pagination parameters', () => {
      // Find a paginated endpoint
      const orgPath = spec.paths!['/api/v1/organization/']
      if (orgPath) {
        const op = orgPath.get!
        const paramNames = (op.parameters || []).map((p: any) => p.name)
        expect(paramNames).toContain('page')
        expect(paramNames).toContain('pageSize')
        expect(paramNames).toContain('search')
      }
    })

    it('all operations have responses', () => {
      for (const [, pathItem] of Object.entries(spec.paths!)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          const op = (pathItem as any)[method]
          if (op) {
            expect(op.responses).toBeDefined()
            expect(Object.keys(op.responses).length).toBeGreaterThan(0)
          }
        }
      }
    })

    it('all operations have standard error responses', () => {
      for (const [, pathItem] of Object.entries(spec.paths!)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          const op = (pathItem as any)[method]
          if (op && op.responses) {
            expect(op.responses['400']).toBeDefined()
            expect(op.responses['500']).toBeDefined()
          }
        }
      }
    })

    it('POST operations have 201 response', () => {
      const loginPath = spec.paths!['/api/v1/auth/login']
      if (loginPath && loginPath.post) {
        expect(loginPath.post.responses['201']).toBeDefined()
      }
    })

    it('operations have tags', () => {
      for (const [, pathItem] of Object.entries(spec.paths!)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          const op = (pathItem as any)[method]
          if (op) {
            expect(op.tags).toBeDefined()
            expect(op.tags!.length).toBeGreaterThan(0)
          }
        }
      }
    })

    it('operations have operationIds', () => {
      for (const [, pathItem] of Object.entries(spec.paths!)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          const op = (pathItem as any)[method]
          if (op) {
            expect(op.operationId).toBeTruthy()
          }
        }
      }
    })

    it('operations have summaries', () => {
      for (const [, pathItem] of Object.entries(spec.paths!)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          const op = (pathItem as any)[method]
          if (op) {
            expect(op.summary).toBeTruthy()
          }
        }
      }
    })
  })

  describe('Schemas', () => {
    const spec = buildOpenApiSpec()
    const schemas = spec.components!.schemas!

    it('SuccessResponse has required fields', () => {
      const schema = schemas.SuccessResponse as any
      expect(schema.required).toContain('success')
      expect(schema.required).toContain('data')
    })

    it('PaginatedResponse has rows, total, page, pageSize', () => {
      const schema = schemas.PaginatedResponse as any
      const dataProps = schema.properties.data.properties
      expect(dataProps.rows).toBeDefined()
      expect(dataProps.total).toBeDefined()
      expect(dataProps.page).toBeDefined()
      expect(dataProps.pageSize).toBeDefined()
    })

    it('ErrorResponse has code and message', () => {
      const schema = schemas.ErrorResponse as any
      const errorProps = schema.properties.error.properties
      expect(errorProps.code).toBeDefined()
      expect(errorProps.message).toBeDefined()
    })

    it('HealthCheck has status and checks', () => {
      const schema = schemas.HealthCheck as any
      expect(schema.required).toContain('status')
      expect(schema.required).toContain('checks')
      expect(schema.properties.checks).toBeDefined()
    })

    it('VersionInfo has name, version, runtime', () => {
      const schema = schemas.VersionInfo as any
      expect(schema.required).toContain('name')
      expect(schema.required).toContain('version')
      expect(schema.required).toContain('runtime')
    })
  })

  describe('Swagger UI HTML', () => {
    it('returns a complete HTML document', () => {
      const html = getSwaggerUiHtml()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('includes Swagger UI CSS', () => {
      const html = getSwaggerUiHtml()
      expect(html).toContain('swagger-ui.css')
    })

    it('includes Swagger UI JS', () => {
      const html = getSwaggerUiHtml()
      expect(html).toContain('swagger-ui-bundle.js')
    })

    it('references /openapi.json', () => {
      const html = getSwaggerUiHtml()
      expect(html).toContain('/openapi.json')
    })

    it('has title', () => {
      const html = getSwaggerUiHtml()
      expect(html).toContain('<title>')
      expect(html).toContain('Swagger UI')
    })
  })

  describe('ReDoc HTML', () => {
    it('returns a complete HTML document', () => {
      const html = getRedocHtml()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('includes ReDoc JS', () => {
      const html = getRedocHtml()
      expect(html).toContain('redoc.standalone.js')
    })

    it('references /openapi.json', () => {
      const html = getRedocHtml()
      expect(html).toContain('/openapi.json')
    })

    it('has title', () => {
      const html = getRedocHtml()
      expect(html).toContain('<title>')
      expect(html).toContain('ReDoc')
    })
  })

  describe('API Versioning', () => {
    it('returns current version v1', () => {
      const info = getApiVersionInfo()
      expect(info.current).toBe('v1')
    })

    it('includes v1 in supported versions', () => {
      const info = getApiVersionInfo()
      expect(info.supported).toContain('v1')
    })

    it('has deprecated array', () => {
      const info = getApiVersionInfo()
      expect(Array.isArray(info.deprecated)).toBe(true)
    })

    it('has sunset map', () => {
      const info = getApiVersionInfo()
      expect(typeof info.sunset).toBe('object')
    })
  })
})
