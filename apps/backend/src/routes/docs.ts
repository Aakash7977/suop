/**
 * @suop/backend — Documentation Routes (OpenAPI, Swagger, ReDoc)
 *
 * RC1 Fix Pack 4 §A: Serves OpenAPI spec + interactive documentation.
 *
 * Endpoints:
 *   GET /openapi.json  — OpenAPI 3.1 JSON specification
 *   GET /swagger       — Swagger UI (interactive API explorer)
 *   GET /redoc         — ReDoc (read-only API documentation)
 *   GET /api-info      — API versioning + deprecation info
 */

import { Hono } from 'hono'
import { success } from '@/core/response'
import { buildOpenApiSpec, getSwaggerUiHtml, getRedocHtml, getApiVersionInfo } from '@/core/openapi/spec-builder'

export const docsRoutes = new Hono()

// Cache the spec (it doesn't change at runtime)
let _cachedSpec: ReturnType<typeof buildOpenApiSpec> | null = null
function getSpec() {
  if (!_cachedSpec) _cachedSpec = buildOpenApiSpec()
  return _cachedSpec
}

/**
 * GET /openapi.json — OpenAPI 3.1 specification
 */
docsRoutes.get('/openapi.json', (c) => {
  const spec = getSpec()
  return c.json(spec)
})

/**
 * GET /swagger — Swagger UI
 */
docsRoutes.get('/swagger', (c) => {
  return c.html(getSwaggerUiHtml())
})

/**
 * GET /swagger/ — Swagger UI (trailing slash variant)
 */
docsRoutes.get('/swagger/', (c) => {
  return c.html(getSwaggerUiHtml())
})

/**
 * GET /redoc — ReDoc
 */
docsRoutes.get('/redoc', (c) => {
  return c.html(getRedocHtml())
})

/**
 * GET /redoc/ — ReDoc (trailing slash variant)
 */
docsRoutes.get('/redoc/', (c) => {
  return c.html(getRedocHtml())
})

/**
 * GET /api-info — API versioning and deprecation info
 */
docsRoutes.get('/api-info', (c) => {
  return c.json(success(getApiVersionInfo()))
})
