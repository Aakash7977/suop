/**
 * @suop/backend — OpenAPI 3.1 Specification Generator
 *
 * RC1 Fix Pack 4 §A: OpenAPI & API Governance.
 */

import type { OpenAPIV3_1 } from 'openapi-types'
import { env, isProduction, isDevelopment } from '@/config/env'

// ─── Server URLs ────────────────────────────────────────────────────────────

function getServerUrls(): OpenAPIV3_1.ServerObject[] {
  if (isProduction) {
    return [
      { url: 'https://api.sudhamrit.com', description: 'Production' },
      { url: 'https://api-staging.sudhamrit.com', description: 'Staging' },
    ]
  }
  if (isDevelopment) {
    return [
      { url: `http://localhost:${env.PORT}`, description: 'Local development' },
    ]
  }
  return [{ url: `http://localhost:${env.PORT}`, description: 'Test' }]
}

// ─── Security Schemes ───────────────────────────────────────────────────────

function getSecuritySchemes(): OpenAPIV3_1.ComponentsObject['securitySchemes'] {
  return {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT Bearer token. Obtain via POST /api/v1/auth/login.',
    },
    ApiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description: 'API key for service-to-service authentication.',
    },
    OAuth2: {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://auth.sudhamrit.com/oauth/authorize',
          tokenUrl: 'https://auth.sudhamrit.com/oauth/token',
          refreshUrl: 'https://auth.sudhamrit.com/oauth/refresh',
          scopes: {
            read: 'Read access',
            write: 'Write access',
            admin: 'Administrative access',
          },
        },
        clientCredentials: {
          tokenUrl: 'https://auth.sudhamrit.com/oauth/token',
          scopes: {
            'service:read': 'Service read access',
            'service:write': 'Service write access',
          },
        },
      },
      description: 'OAuth 2.0 placeholder — not yet implemented. Will be available in v2.',
    },
  }
}

// ─── Common Schemas ─────────────────────────────────────────────────────────

function getCommonSchemas(): OpenAPIV3_1.ComponentsObject['schemas'] {
  return {
    SuccessResponse: {
      type: 'object',
      required: ['success', 'data'],
      properties: {
        success: { type: 'boolean', example: true },
        data: { description: 'Response payload' },
        meta: {
          type: 'object',
          properties: {
            correlationId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },

    PaginatedResponse: {
      type: 'object',
      required: ['success', 'data', 'meta'],
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          required: ['rows', 'total', 'page', 'pageSize'],
          properties: {
            rows: { type: 'array', items: {} },
            total: { type: 'integer', example: 150 },
            page: { type: 'integer', example: 1, minimum: 1 },
            pageSize: { type: 'integer', example: 25, minimum: 1, maximum: 100 },
          },
        },
        meta: {
          type: 'object',
          properties: {
            correlationId: { type: 'string', format: 'uuid' },
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 25 },
            total: { type: 'integer', example: 150 },
          },
        },
      },
    },

    ErrorResponse: {
      type: 'object',
      required: ['success', 'error'],
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'string', example: 'NOT_FOUND' },
            message: { type: 'string', example: 'Resource not found' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        meta: {
          type: 'object',
          properties: {
            correlationId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },

    ValidationError: {
      type: 'object',
      required: ['success', 'error'],
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'VALIDATION_REQUIRED_FIELD' },
            message: { type: 'string', example: 'Field is required' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  code: { type: 'string', example: 'REQUIRED' },
                  message: { type: 'string', example: 'Email is required' },
                },
              },
            },
          },
        },
      },
    },

    RateLimitError: {
      type: 'object',
      required: ['success', 'error'],
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
            message: { type: 'string', example: 'Rate limit exceeded. Try again in 30 seconds.' },
            retryAfter: { type: 'integer', example: 30 },
            limit: { type: 'integer', example: 100 },
          },
        },
      },
    },

    HealthCheck: {
      type: 'object',
      required: ['status', 'uptime', 'timestamp', 'checks'],
      properties: {
        status: { type: 'string', enum: ['ok', 'degraded', 'down'], example: 'ok' },
        uptime: { type: 'number', example: 3600.5 },
        timestamp: { type: 'string', format: 'date-time' },
        checks: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok', 'degraded', 'down'] },
                latencyMs: { type: 'number', example: 5 },
              },
            },
            redis: { type: 'object', properties: { status: { type: 'string' } } },
            queue: { type: 'object', properties: { status: { type: 'string' } } },
            disk: { type: 'object' },
            memory: { type: 'object' },
          },
        },
      },
    },

    VersionInfo: {
      type: 'object',
      required: ['name', 'version', 'runtime', 'environment'],
      properties: {
        name: { type: 'string', example: 'suop-backend' },
        version: { type: 'string', example: '1.0.0-rc1' },
        commit: { type: 'string', example: 'abc123' },
        buildDate: { type: 'string', format: 'date-time' },
        runtime: { type: 'string', example: 'Bun 1.1.0' },
        environment: { type: 'string', enum: ['development', 'staging', 'production', 'test'] },
        phase: { type: 'string', example: 'RC1' },
      },
    },
  }
}

// ─── Standard Error Responses ───────────────────────────────────────────────

function getStandardErrorResponses(): Record<string, OpenAPIV3_1.ResponseObject> {
  return {
    400: {
      description: 'Bad Request — validation failed or input is malformed',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
    },
    401: {
      description: 'Unauthorized — JWT token missing, expired, or invalid',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    403: {
      description: 'Forbidden — insufficient permissions or CSRF token mismatch',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    404: {
      description: 'Not Found — resource does not exist or belongs to another tenant',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    409: {
      description: 'Conflict — optimistic concurrency version mismatch',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    413: {
      description: 'Payload Too Large — request body exceeds size limit',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    429: {
      description: 'Too Many Requests — rate limit exceeded',
      headers: {
        'X-RateLimit-Limit': { schema: { type: 'integer' } },
        'X-RateLimit-Remaining': { schema: { type: 'integer' } },
        'X-RateLimit-Reset': { schema: { type: 'integer' } },
        'Retry-After': { schema: { type: 'integer' } },
      },
      content: { 'application/json': { schema: { $ref: '#/components/schemas/RateLimitError' } } },
    },
    500: {
      description: 'Internal Server Error — unexpected failure',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  }
}

// ─── Route Catalog ──────────────────────────────────────────────────────────

const ROUTE_CATALOG: Array<{
  module: string
  tag: string
  basePath: string
  routes: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string
    summary: string
    operationId: string
    permission?: string
    paginated?: boolean
    deprecated?: boolean
  }>
}> = [
  {
    module: 'system',
    tag: 'System',
    basePath: '',
    routes: [
      { method: 'GET', path: '/health', summary: 'Composite health check', operationId: 'getHealth' },
      { method: 'GET', path: '/live', summary: 'Liveness probe', operationId: 'getLiveness' },
      { method: 'GET', path: '/ready', summary: 'Readiness probe', operationId: 'getReadiness' },
      { method: 'GET', path: '/api/v1/_internal/version', summary: 'Build metadata', operationId: 'getVersion' },
      { method: 'GET', path: '/api/v1/_internal/metrics', summary: 'Performance dashboard', operationId: 'getMetrics' },
      { method: 'GET', path: '/api/v1/_internal/security', summary: 'Security dashboard', operationId: 'getSecurityDashboard' },
      { method: 'GET', path: '/api/v1/_internal/cache', summary: 'Cache statistics', operationId: 'getCacheStats' },
    ],
  },
  {
    module: 'auth',
    tag: 'Authentication',
    basePath: '/api/v1/auth',
    routes: [
      { method: 'POST', path: '/login', summary: 'Login with email + password', operationId: 'login' },
      { method: 'POST', path: '/refresh', summary: 'Refresh access token', operationId: 'refreshToken' },
      { method: 'POST', path: '/logout', summary: 'Logout (revoke session)', operationId: 'logout' },
      { method: 'GET', path: '/me', summary: 'Get current user profile', operationId: 'getCurrentUser' },
      { method: 'POST', path: '/change-password', summary: 'Change password', operationId: 'changePassword' },
      { method: 'POST', path: '/forgot-password', summary: 'Send password reset email', operationId: 'forgotPassword' },
      { method: 'POST', path: '/reset-password', summary: 'Reset password with token', operationId: 'resetPassword' },
    ],
  },
  {
    module: 'organization',
    tag: 'Organization',
    basePath: '/api/v1/organization',
    routes: [
      { method: 'GET', path: '/', summary: 'List organizations', operationId: 'listOrganizations', paginated: true },
      { method: 'POST', path: '/', summary: 'Create organization', operationId: 'createOrganization' },
      { method: 'GET', path: '/:id', summary: 'Get organization by ID', operationId: 'getOrganizationById' },
      { method: 'PUT', path: '/:id', summary: 'Update organization', operationId: 'updateOrganization' },
      { method: 'DELETE', path: '/:id', summary: 'Soft-delete organization', operationId: 'deleteOrganization' },
    ],
  },
  {
    module: 'product',
    tag: 'Product Catalog',
    basePath: '/api/v1/catalog',
    routes: [
      { method: 'GET', path: '/', summary: 'List products', operationId: 'listProducts', paginated: true },
      { method: 'POST', path: '/', summary: 'Create product', operationId: 'createProduct' },
      { method: 'GET', path: '/:id', summary: 'Get product by ID', operationId: 'getProductById' },
      { method: 'PUT', path: '/:id', summary: 'Update product', operationId: 'updateProduct' },
      { method: 'DELETE', path: '/:id', summary: 'Soft-delete product', operationId: 'deleteProduct' },
    ],
  },
  {
    module: 'inventory',
    tag: 'Inventory',
    basePath: '/api/v1/inventory',
    routes: [
      { method: 'GET', path: '/', summary: 'List stock balances', operationId: 'listInventory', paginated: true },
      { method: 'POST', path: '/post', summary: 'Post inventory transaction', operationId: 'postInventory' },
      { method: 'POST', path: '/adjust', summary: 'Adjust inventory', operationId: 'adjustInventory' },
    ],
  },
  {
    module: 'warehouse',
    tag: 'Warehouse',
    basePath: '/api/v1/warehouse',
    routes: [
      { method: 'GET', path: '/', summary: 'List warehouses', operationId: 'listWarehouses', paginated: true },
    ],
  },
  {
    module: 'finance',
    tag: 'Finance',
    basePath: '/api/v1/finance',
    routes: [
      { method: 'GET', path: '/ap', summary: 'List accounts payable', operationId: 'listAccountsPayable', paginated: true },
      { method: 'GET', path: '/ar', summary: 'List accounts receivable', operationId: 'listAccountsReceivable', paginated: true },
      { method: 'GET', path: '/gl', summary: 'List journal entries', operationId: 'listJournalEntries', paginated: true },
    ],
  },
  {
    module: 'hrms',
    tag: 'HRMS',
    basePath: '/api/v1/hrms',
    routes: [
      { method: 'GET', path: '/employees', summary: 'List employees', operationId: 'listEmployees', paginated: true },
      { method: 'GET', path: '/attendance', summary: 'List attendance records', operationId: 'listAttendance', paginated: true },
      { method: 'GET', path: '/leave', summary: 'List leave applications', operationId: 'listLeaveApplications', paginated: true },
    ],
  },
  {
    module: 'bi',
    tag: 'BI & Analytics',
    basePath: '/api/v1/bi',
    routes: [
      { method: 'GET', path: '/foundation', summary: 'List BI KPIs', operationId: 'listBiKpis', paginated: true },
      { method: 'GET', path: '/dashboards', summary: 'List dashboards', operationId: 'listDashboards', paginated: true },
    ],
  },
]

// ─── Path Generator ─────────────────────────────────────────────────────────

function buildPaths(): OpenAPIV3_1.PathsObject {
  const paths: OpenAPIV3_1.PathsObject = {}

  for (const group of ROUTE_CATALOG) {
    for (const route of group.routes) {
      const fullPath = group.basePath + route.path
      const openApiPath = fullPath.replace(/:(\w+)/g, '{$1}')

      if (!paths[openApiPath]) {
        paths[openApiPath] = {}
      }

      const methodLower = route.method.toLowerCase() as keyof OpenAPIV3_1.PathItemObject
      const operation: OpenAPIV3_1.OperationObject = {
        operationId: route.operationId,
        summary: route.summary,
        tags: [group.tag],
        deprecated: route.deprecated ?? false,
        security: route.permission ? [{ BearerAuth: [] }] : [],
        parameters: [],
        responses: {
          ...(route.method === 'GET' && route.paginated
            ? { 200: { description: 'Paginated list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } }
            : route.method === 'POST'
            ? { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } } }
            : { 200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } } }),
          ...getStandardErrorResponses(),
        },
      }

      const pathParams = fullPath.match(/:(\w+)/g)
      if (pathParams) {
        for (const param of pathParams) {
          const paramName = param.slice(1)
          operation.parameters!.push({
            name: paramName,
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: `${paramName} identifier`,
          })
        }
      }

      if (route.paginated) {
        operation.parameters!.push(
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
          { name: 'pageSize', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }, description: 'Items per page' },
          { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Full-text search' },
          { name: 'status', in: 'query', required: false, schema: { type: 'string' }, description: 'Filter by status' }
        )
      }

      if (route.method === 'POST' || route.method === 'PUT' || route.method === 'PATCH') {
        operation.requestBody = {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        }
      }

      ;(paths[openApiPath] as any)[methodLower] = operation
    }
  }

  return paths
}

// ─── Tags ───────────────────────────────────────────────────────────────────

function getTags(): OpenAPIV3_1.TagObject[] {
  const tags = new Set<string>()
  for (const group of ROUTE_CATALOG) {
    tags.add(group.tag)
  }
  return Array.from(tags).map((name) => ({ name, description: `${name} module endpoints` }))
}

// ─── Full Spec Builder ──────────────────────────────────────────────────────

export function buildOpenApiSpec(): OpenAPIV3_1.Document {
  return {
    openapi: '3.1.0',
    info: {
      title: 'SUOP ERP API',
      version: '1.0.0-rc1',
      description: `# SUOP ERP v1.0 — REST API

Enterprise food manufacturing ERP with 11 business domains:
- Procurement, Inventory, Manufacturing (MES), Quality (QMS)
- Sales & Distribution, Finance & Costing, CRM, HRMS, BI & Analytics

## Authentication
All endpoints (except auth and health) require a JWT Bearer token:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Pagination
List endpoints return paginated results with rows, total, page, pageSize.

## Rate Limiting
All endpoints are rate-limited. Limits returned in X-RateLimit-* headers.

## Errors
Consistent error envelope: { success: false, error: { code, message } }
`,
      contact: { name: 'Sudhamrit Foods Pvt. Ltd.', email: 'api-support@sudhamrit.com', url: 'https://sudhamrit.com' },
      license: { name: 'Proprietary', url: 'https://sudhamrit.com/license' },
      termsOfService: 'https://sudhamrit.com/terms',
    },
    servers: getServerUrls(),
    paths: buildPaths(),
    components: {
      securitySchemes: getSecuritySchemes(),
      schemas: getCommonSchemas(),
    },
    security: [{ BearerAuth: [] }],
    tags: getTags(),
    externalDocs: { description: 'Full API documentation', url: 'https://docs.sudhamrit.com/api' },
  }
}

// ─── Swagger UI HTML ────────────────────────────────────────────────────────

export function getSwaggerUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SUOP ERP API — Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
        validatorUrl: null,
      });
    };
  </script>
</body>
</html>`
}

// ─── ReDoc HTML ─────────────────────────────────────────────────────────────

export function getRedocHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SUOP ERP API — ReDoc</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <redoc spec-url='/openapi.json'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2/bundles/redoc.standalone.js"></script>
</body>
</html>`
}

// ─── API Versioning & Deprecation ───────────────────────────────────────────

export interface ApiVersionInfo {
  current: string
  supported: string[]
  deprecated: string[]
  sunset: Record<string, string>
}

export function getApiVersionInfo(): ApiVersionInfo {
  return {
    current: 'v1',
    supported: ['v1'],
    deprecated: [],
    sunset: {},
  }
}
