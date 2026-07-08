# Manual 1 · Part 14 · Sections 10-12 · Entities 691-720 — API Gateway, Event Bus & Reporting/BI

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 14 — Enterprise Platform Services (EPS) |
| Sections | 10 (Enterprise API Gateway, Integration Framework & External Connectors), 11 (Event Bus, Scheduler & Background Processing Platform), 12 (Reporting Engine, Print Engine, Business Intelligence & Platform Mission Control) |
| Entities | 691–720 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED — PART 14 COMPLETE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 6, 8-9, Part 14 §10-12 |
| Last Updated | 2026-07-08 |
| Importance | **CRITICAL — Final batch of Enterprise Platform Services; completes the technical backbone of SUOP** |

---

## Overview — Integration, Async Processing & Intelligence Layer

Sections 10-12 complete the **Enterprise Platform Services** module, delivering the final integration, asynchronous processing, and intelligence capabilities. Together with Batches 1-3, this batch makes SUOP's platform equivalent to **AWS + Azure + SAP Business Technology Platform + Microsoft Power Platform + Oracle Cloud Infrastructure**, but purpose-built for SUOP.

```
API GATEWAY & INTEGRATION (Sec 10: 691-700)
  Mobile/Web/POS/Barcode/Third Party → API Gateway → Auth → Rate Limiter → Logging → Routing → Business Services
  ↓ Decoupled via
EVENT BUS & SCHEDULER (Sec 11: 701-710)
  Business Event → Event Bus → Queue → Worker → Subscriber → Business Module (with Retry, DLQ, Monitoring)
  ↓ Visualized via
REPORTING & BI (Sec 12: 711-720)
  Business Modules → Reporting Engine → BI Layer → Dashboards → Print Engine → PDF/Excel/CSV/API
```

### 🏆 Architectural Lock: Platform Core Kernel Complete Inventory (Q192)

Per Chief Enterprise Architect's final Part 14 recommendation, the **complete inventory of Platform Kernel Foundation Services** is hereby formalized as **Architectural Decision Q192**. This formalizes Q189 (Platform Kernel meta-architecture) with the complete, final list of services after all 4 batches of Part 14.

**Complete Platform Kernel Inventory (Q192 — LOCKED)**:
```
SUOP Platform Kernel
│
├── Identity Service (FS-1)
├── RBAC Engine (FS-2)
├── Configuration Engine (FS-6)
├── Workflow Engine (FS-3)
├── Notification Engine (FS-4)
├── Audit Engine (FS-5)
├── Document Engine (FS-11)
├── Search Engine (FS-48)
├── Identity Resolution Service (FS-53)
├── Barcode / QR / RFID Engine (FS-12)
├── API Gateway (FS-7)
├── Integration Hub (NEW, Sec 10)
├── Event Bus (FS-49)
├── Scheduler (NEW, Sec 11)
├── Background Workers (NEW, Sec 11)
├── Reporting Engine (FS-50, formalized Sec 12)
├── BI Platform (NEW, Sec 12)
├── AI Gateway (FS-51, to be detailed in Part 15)
├── Mission Control (NEW, Sec 12)
├── Unified Automation Engine (FS-52)
├── Feature Flag Engine (FS-46)
├── Number Series Engine (FS-47)
├── Print Engine (FS-50)
└── [All 53 Foundation Services]
```

**Architectural Mandate (Q192 — LOCKED)**:
Every business module — Inventory, Warehouse, Manufacturing, Retail, Restaurant, Finance, Workforce, Maintenance, CRM, Procurement, Supplier Portal, and Customer Portal — **must consume** these platform services rather than implementing their own versions.

**Benefits (Locked)**:
1. SUOP significantly easier to maintain, scale, and evolve
2. True enterprise platform (not collection of modules)
3. Single source of truth for all cross-cutting concerns
4. Clean microservices migration path when scale demands
5. Future modules built faster (consume platform, focus on business logic)

**Governance**: Platform Kernel team owns all 53 Foundation Services. Business modules emit events and consume contracts — they never reinvent platform concerns.

---

# SECTION 10: Enterprise API Gateway, Integration Framework & External Connectors (Entities 691-700)

## Entity 691 — API Gateway

### 1. Business Purpose
Per Part 14 §10: Stores API Name, Version, Route, Module, Status. The single secured gateway for all external communication.

### 2. Architectural Role
**Foundational gateway entity** — per Vol 0: "Every external system communicates with SUOP through a single secured gateway. No module exposes itself directly." Implements API Gateway pattern (FS-7).

### 3. Business Rules
- All external traffic (mobile/web/POS/barcode/third-party) enters through API Gateway
- Gateway responsibilities: authentication, rate limiting, logging, routing, request transformation, response caching
- API styles: REST (primary), GraphQL (ready), WebSocket (real-time), gRPC (internal), Webhooks (outbound)
- API versioning: URL path (/v1/, /v2/), header-based, query param — default URL path
- OpenAPI 3.0 spec auto-generated for all registered APIs
- SDK auto-generation: TypeScript, Python, Java, .NET, Go

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `gateway_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `gateway_name` | VARCHAR(200) | Yes | — | Min 3 | API Name (per Part 14) | Internal |
| `gateway_version` | VARCHAR(20) | Yes | `1.0` | — | Version (per Part 14) | Internal |
| `api_route` | VARCHAR(500) | Yes | — | — | Route (per Part 14) — URL path | Internal |
| `api_method` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD, WS | HTTP methods | Internal |
| `api_style` | ENUM | Yes | `REST` | REST, GRAPHQL, WEBSOCKET, GRPC, WEBHOOK | Style | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module (per Part 14) | Internal |
| `target_service` | VARCHAR(200) | Yes | — | — | Backend service | Internal |
| `target_endpoint` | VARCHAR(500) | Yes | — | — | Backend endpoint | Confidential |
| `authentication_required` | BOOLEAN | Yes | `true` | — | Auth needed | Internal |
| `authentication_methods` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | JWT, OAUTH2, API_KEY, MUTUAL_TLS, NONE | Methods | Internal |
| `rate_limit_per_minute` | INTEGER | Yes | `100` | ≥ 1 | Per-minute limit | Internal |
| `rate_limit_per_hour` | INTEGER | Yes | `1000` | ≥ 1 | Hourly | Internal |
| `rate_limit_per_day` | INTEGER | Yes | `10000` | ≥ 1 | Daily | Internal |
| `burst_limit` | INTEGER | Yes | `10` | ≥ 1 | Burst | Internal |
| `request_size_limit_mb` | INTEGER | Yes | `10` | ≥ 1 | Max request | Internal |
| `response_size_limit_mb` | INTEGER | Yes | `50` | ≥ 1 | Max response | Internal |
| `timeout_seconds` | INTEGER | Yes | `30` | ≥ 1 | Timeout | Internal |
| `retry_count` | INTEGER | Yes | `0` | 0-5 | Retries | Internal |
| `caching_enabled` | BOOLEAN | Yes | `false` | — | Response cache | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | TTL | Internal |
| `request_transformation` | JSONB | No | NULL | — | Transform rules | Confidential |
| `response_transformation` | JSONB | No | NULL | — | Transform rules | Confidential |
| `cors_enabled` | BOOLEAN | Yes | `true` | — | CORS | Internal |
| `cors_origins_allowed` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Origins | Internal |
| `ip_whitelist` | INET[] | No | `ARRAY[]::INET[]` | — | Whitelist | Confidential |
| `ip_blacklist` | INET[] | No | `ARRAY[]::INET[]` | — | Blacklist | Confidential |
| `geo_restrictions` | JSONB | No | NULL | — | Geo-fence | Confidential |
| `requires_api_key` | BOOLEAN | Yes | `false` | — | API key | Internal |
| `api_key_header_name` | VARCHAR(50) | Yes | `X-API-Key` | — | Header | Internal |
| `openapi_spec` | JSONB | No | NULL | — | OpenAPI 3.0 spec | Internal |
| `swagger_ui_enabled` | BOOLEAN | Yes | `true` | — | Swagger UI | Internal |
| `sdk_generation_enabled` | BOOLEAN | Yes | `true` | — | SDK auto-gen | Internal |
| `sdk_languages` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | TYPESCRIPT, PYTHON, JAVA, DOTNET, GO | Languages | Internal |
| `webhook_outbound_enabled` | BOOLEAN | Yes | `false` | — | Outbound webhooks | Internal |
| `audit_all_requests` | BOOLEAN | Yes | `false` | — | Audit all | Internal |
| `audit_sensitive_only` | BOOLEAN | Yes | `true` | — | Audit sensitive | Internal |
| `deprecation_date` | DATE | No | NULL | — | If deprecated | Internal |
| `sunset_date` | DATE | No | NULL | — | Sunset | Internal |
| `replacement_api_id` | UUID | No | NULL | FK to `api_gateway` (self) | Replacement | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, DEPRECATED, RETIRED, MAINTENANCE | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| API Registry (692) | One-to-One | 1:1 | Detailed registry |
| API Rate Limiter (695) | One-to-One | 1:1 | Rate limit config |
| API Monitoring (696) | One-to-Many | 1:N | Metrics |
| API Audit (699) | One-to-Many | 1:N | Audit trail |
| Self (691) | Self-reference | N:1 | Replacement API |

### 6. Indexes
- UNIQUE (`gateway_code`)
- INDEX (`api_route`, `api_method`)
- INDEX (`business_module`, `current_status`)
- INDEX (`api_style`, `current_status`)
- INDEX (`current_status`)

### 7. Security Classification
**Confidential** — backend endpoints and IP restrictions.

### 8. Integration Points
- **API Gateway** (FS-7): Primary implementation
- **Identity Service** (FS-1): Authentication
- **RBAC Engine** (FS-2): Authorization
- **Audit Engine** (FS-5): Request audit
- **All Business Modules**: API exposure

### 9. Sample Data
```json
{
  "gateway_code": "API-INV-PRODUCTS-V1", "gateway_name": "Products API v1",
  "gateway_version": "1.0", "api_route": "/api/v1/inventory/products",
  "api_method": ["GET", "POST", "PUT", "DELETE"], "api_style": "REST",
  "business_module": "INVENTORY", "target_service": "inventory-service",
  "target_endpoint": "http://inventory-service.internal:8080/products",
  "authentication_required": true, "authentication_methods": ["JWT", "OAUTH2"],
  "rate_limit_per_minute": 100, "burst_limit": 10, "timeout_seconds": 30,
  "caching_enabled": true, "cache_ttl_seconds": 300,
  "cors_enabled": true, "cors_origins_allowed": ["https://app.sudhastar.com"],
  "openapi_spec": {}, "swagger_ui_enabled": true,
  "sdk_generation_enabled": true, "sdk_languages": ["TYPESCRIPT", "PYTHON"],
  "current_status": "ACTIVE"
}
```

### 10. Audit Events
`API_GATEWAY_REGISTERED`, `API_GATEWAY_UPDATED`, `API_GATEWAY_ACTIVATED`, `API_GATEWAY_DEPRECATED`, `API_GATEWAY_RETIRED`, `API_GATEWAY_RATE_LIMIT_EXCEEDED`

---

## Entity 692 — API Registry

### 1. Business Purpose
Per Part 14 §10: Stores Endpoint, Request Schema, Response Schema, Authentication, Documentation. Comprehensive API registry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `registry_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `api_gateway_id` | UUID | Yes | — | FK to `api_gateway` (Entity 691) | Gateway | Internal |
| `endpoint_path` | VARCHAR(500) | Yes | — | — | Endpoint (per Part 14) | Internal |
| `endpoint_method` | ENUM | Yes | — | GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD | Method | Internal |
| `endpoint_summary` | VARCHAR(500) | Yes | — | — | Summary | Internal |
| `endpoint_description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `request_schema` | JSONB | Yes | `'{}'` | — | Request Schema (per Part 14) — JSON Schema | Internal |
| `request_parameters` | JSONB | Yes | `'[]'` | — | Query/path params | Internal |
| `request_headers_required` | JSONB | Yes | `'[]'` | — | Required headers | Internal |
| `request_body_required` | BOOLEAN | Yes | `false` | — | Body required | Internal |
| `request_content_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | application/json, multipart/form-data | Internal |
| `response_schema` | JSONB | Yes | `'{}'` | — | Response Schema (per Part 14) — JSON Schema | Internal |
| `response_status_codes` | JSONB | Yes | `'[]'` | — | [{ code, description, schema }] | Internal |
| `response_content_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Content types | Internal |
| `authentication_method` | ENUM | Yes | — | JWT, OAUTH2, API_KEY, MUTUAL_TLS, NONE | Authentication (per Part 14) | Internal |
| `required_scopes` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | OAuth scopes | Confidential |
| `required_permissions` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | RBAC permissions | Confidential |
| `documentation_url` | VARCHAR(500) | No | NULL | — | Docs URL | Internal |
| `documentation_markdown` | TEXT | No | NULL | — | Inline docs | Internal |
| `example_request` | JSONB | No | NULL | — | Example | Internal |
| `example_response` | JSONB | No | NULL | — | Example | Internal |
| `error_responses` | JSONB | Yes | `'[]'` | — | Error schemas | Internal |
| `openapi_spec_full` | JSONB | Yes | `'{}'` | — | Full OpenAPI 3.0 spec | Internal |
| `postman_collection_url` | VARCHAR(500) | No | NULL | — | Postman | Internal |
| `api_namespace` | VARCHAR(100) | Yes | — | — | Namespace | Internal |
| `api_tags` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Tags | Internal |
| `is_public` | BOOLEAN | Yes | `false` | — | Public API | Internal |
| `is_deprecated` | BOOLEAN | Yes | `false` | — | Deprecated | Internal |
| `deprecation_notice` | TEXT | No | NULL | — | Notice | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `api_registry` (self) | Previous | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, DEPRECATED, RETIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 693 — Webhook Engine

### 1. Business Purpose
Per Part 14 §10: Supports Order Created, Inventory Updated, Payment Received, Shipment Created, Employee Joined. Outbound webhook management.

### 2. Architectural Role
Webhook entity — outbound event notifications to external systems. Distinct from inbound webhooks (received from external).

### 3. Business Rules
- Webhook events: business events trigger outbound webhooks to subscribed endpoints
- Subscription: external systems subscribe to specific event types
- Delivery: HTTP POST with JSON payload, signed with HMAC
- Retry: exponential backoff on failure (per Entity 707)
- Verification: signature verification using shared secret

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `webhook_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `webhook_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `webhook_type` | ENUM | Yes | `OUTBOUND` | OUTBOUND, INBOUND | Type | Internal |
| `event_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | ORDER_CREATED, INVENTORY_UPDATED, PAYMENT_RECEIVED, SHIPMENT_CREATED, EMPLOYEE_JOINED, INVOICE_GENERATED, WORK_ORDER_COMPLETED, PO_APPROVED, LEAVE_APPROVED, ASSET_BREAKDOWN, QUALITY_FAILURE, OTHER (per Part 14) | Subscribed events | Internal |
| `subscriber_name` | VARCHAR(200) | Yes | — | Min 3 | Subscriber | Internal |
| `subscriber_url` | VARCHAR(500) | Yes | — | URL | Endpoint URL | Confidential |
| `subscriber_auth_method` | ENUM | Yes | `HMAC_SIGNATURE` | HMAC_SIGNATURE, BEARER_TOKEN, API_KEY, BASIC_AUTH, OAUTH2, NONE | Auth | Confidential |
| `subscriber_auth_config_encrypted` | TEXT | No | NULL | — | Encrypted auth | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `signature_algorithm` | VARCHAR(20) | Yes | `HMAC-SHA256` | — | Algorithm | Internal |
| `signature_header_name` | VARCHAR(50) | Yes | `X-SUOP-Signature` | — | Header | Internal |
| `payload_format` | ENUM | Yes | `JSON` | JSON, XML, FORM_ENCODED | Format | Internal |
| `payload_template` | JSONB | No | NULL | — | Custom template | Confidential |
| `custom_headers` | JSONB | No | NULL | — | Custom headers | Confidential |
| `delivery_timeout_seconds` | INTEGER | Yes | `30` | ≥ 1 | Timeout | Internal |
| `retry_policy_id` | UUID | Yes | — | FK to `retry_policy` (Entity 707) | Retry | Internal |
| `max_retries` | INTEGER | Yes | `5` | ≥ 0 | Max | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `verification_method` | ENUM | Yes | `CHALLENGE_RESPONSE` | CHALLENGE_RESPONSE, SIGNATURE_VERIFICATION, MANUAL_VERIFICATION | Verification | Internal |
| `verification_status` | ENUM | Yes | `PENDING` | PENDING, VERIFIED, FAILED | Status | Internal |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verified | Internal |
| `delivery_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total deliveries | Internal |
| `delivery_count_success` | BIGINT | Yes | `0` | ≥ 0 | Success | Internal |
| `delivery_count_failed` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `delivery_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rate | Internal |
| `last_delivery_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `last_delivery_status` | ENUM | No | NULL | SUCCESS, FAILED, PENDING_RETRY, ABANDONED | Status | Internal |
| `last_delivery_response_code` | INTEGER | No | NULL | 100-599 | HTTP code | Internal |
| `last_delivery_duration_ms` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, SUSPENDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 694 — Integration Connector

### 1. Business Purpose
Per Part 14 §10: Supports SAP, Microsoft Dynamics, Tally, Shiprocket, Razorpay, Payment Gateways, SMS Providers, Email Providers. Third-party integration connectors.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `connector_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `connector_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `connector_type` | ENUM | Yes | — | ERP, CRM, ACCOUNTING, LOGISTICS, PAYMENT_GATEWAY, SMS_PROVIDER, EMAIL_PROVIDER, GOVERNMENT_API, IoT_PLATFORM, ECOMMERCE, TELEPHONY, MARKETING, ANALYTICS, OTHER | Type | Internal |
| `vendor_name` | VARCHAR(200) | Yes | — | — | Vendor (e.g., SAP, Tally, Razorpay) | Internal |
| `vendor_product` | VARCHAR(200) | No | NULL | — | Product | Internal |
| `supported_integrations` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | SAP, MICROSOFT_DYNAMICS, TALLY, SHIPROCKET, RAZORPAY, PAYMENT_GATEWAYS, SMS_PROVIDERS, EMAIL_PROVIDERS (per Part 14) | Supported | Internal |
| `integration_pattern` | ENUM | Yes | `API_BASED` | API_BASED, FILE_BASED, DATABASE_DIRECT, MESSAGE_QUEUE, WEBHOOK, MANUAL | Pattern | Internal |
| `connection_type` | ENUM | Yes | `REST_API` | REST_API, SOAP, GRAPHQL, ODBC, JDBC, FTP, SFTP, WEBHOOK, CUSTOM | Connection | Internal |
| `endpoint_url` | VARCHAR(500) | No | NULL | — | Endpoint | Confidential |
| `authentication_method` | ENUM | Yes | — | OAUTH2, API_KEY, BASIC_AUTH, BEARER_TOKEN, MUTUAL_TLS, CUSTOM, NONE | Auth | Confidential |
| `auth_config_encrypted` | TEXT | No | NULL | — | Encrypted | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `api_version_supported` | VARCHAR(20) | No | NULL | — | API version | Internal |
| `data_sync_direction` | ENUM | Yes | `BIDIRECTIONAL` | INBOUND, OUTBOUND, BIDIRECTIONAL | Direction | Internal |
| `sync_frequency` | ENUM | Yes | `REAL_TIME` | REAL_TIME, EVERY_MINUTE, HOURLY, DAILY, ON_DEMAND | Frequency | Internal |
| `field_mapping` | JSONB | Yes | `'{}'` | — | Field mapping | Confidential |
| `transformation_rules` | JSONB | No | NULL | — | Data transformation | Confidential |
| `validation_rules` | JSONB | No | NULL | — | Validation | Confidential |
| `error_handling` | JSONB | Yes | `'{}'` | — | Error handling | Confidential |
| `retry_policy_id` | UUID | No | NULL | FK to `retry_policy` | Retry | Internal |
| `rate_limit_per_minute` | INTEGER | Yes | `60` | ≥ 1 | Rate limit | Internal |
| `rate_limit_per_day` | INTEGER | Yes | `1000` | ≥ 1 | Daily | Internal |
| `circuit_breaker_enabled` | BOOLEAN | Yes | `true` | — | Circuit breaker | Internal |
| `circuit_breaker_threshold` | INTEGER | Yes | `5` | ≥ 1 | Failure threshold | Internal |
| `circuit_breaker_reset_minutes` | INTEGER | Yes | `5` | ≥ 1 | Reset time | Internal |
| `data_localization_required` | BOOLEAN | Yes | `false` | — | Localization | Confidential |
| `compliance_certifications` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | SOC2, ISO27001, PCI_DSS | Internal |
| `vendor_contact` | JSONB | No | NULL | — | Support contact | Confidential |
| `vendor_documentation_url` | VARCHAR(500) | No | NULL | — | Docs | Internal |
| `connector_logo_attachment_id` | UUID | No | NULL | FK to `attachments` | Logo | Internal |
| `last_sync_at` | TIMESTAMPTZ | No | NULL | — | Last sync | Internal |
| `last_sync_status` | ENUM | No | NULL | SUCCESS, PARTIAL, FAILED | Status | Internal |
| `last_sync_records_count` | INTEGER | No | NULL | ≥ 0 | Records | Internal |
| `total_sync_count` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `total_records_synced` | BIGINT | Yes | `0` | ≥ 0 | Total records | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ERROR, MAINTENANCE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 695 — API Rate Limiter

### 1. Business Purpose
Per Part 14 §10: Supports Requests per Minute, Burst Limit, Daily Quota, Tenant Limits. Rate limiting configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rate_limit_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `rate_limit_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `applicable_api_id` | UUID | No | NULL | FK to `api_gateway` (Entity 691) | Specific API | Internal |
| `applicable_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `applicable_tenant_id` | UUID | No | NULL | FK to `companies` | Tenant Limits (per Part 14) | Internal |
| `applicable_role_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `applicable_identity_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific users | Confidential |
| `limit_type` | ENUM | Yes | — | REQUESTS_PER_MINUTE, BURST_LIMIT, DAILY_QUOTA, MONTHLY_QUOTA, CONCURRENT, CUSTOM | Type (per Part 14) | Internal |
| `limit_value` | INTEGER | Yes | — | > 0 | Limit | Internal |
| `limit_window_seconds` | INTEGER | Yes | `60` | ≥ 1 | Window | Internal |
| `burst_limit` | INTEGER | No | NULL | > 0 | Burst Limit (per Part 14) | Internal |
| `daily_quota` | INTEGER | No | NULL | > 0 | Daily Quota (per Part 14) | Internal |
| `monthly_quota` | INTEGER | No | NULL | > 0 | Monthly | Internal |
| `concurrent_limit` | INTEGER | No | NULL | > 0 | Concurrent | Internal |
| `algorithm` | ENUM | Yes | `TOKEN_BUCKET` | TOKEN_BUCKET, LEAKY_BUCKET, FIXED_WINDOW, SLIDING_WINDOW, CONCURRENT_LIMITER | Algorithm | Internal |
| `key_strategy` | ENUM | Yes | `PER_USER` | PER_USER, PER_IP, PER_TENANT, PER_API_KEY, PER_ROLE, GLOBAL | Strategy | Internal |
| `quota_used_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `quota_used_this_month` | INTEGER | Yes | `0` | ≥ 0 | Month | Internal |
| `quota_reset_at` | TIMESTAMPTZ | No | NULL | — | Reset | Internal |
| `overage_allowed` | BOOLEAN | Yes | `false` | — | Allow overage | Internal |
| `overage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % overage | Internal |
| `overage_charge_per_call` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Charge | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `response_on_exceed` | ENUM | Yes | `REJECT_WITH_429` | REJECT_WITH_429, REJECT_WITH_503, QUEUE_REQUEST, DEGRADE_RESPONSE | Action | Internal |
| `headers_on_response` | BOOLEAN | Yes | `true` | — | X-RateLimit-* headers | Internal |
| `retry_after_header` | BOOLEAN | Yes | `true` | — | Retry-After header | Internal |
| `alert_on_threshold_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Alert threshold | Internal |
| `alert_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 696 — API Monitoring

### 1. Business Purpose
Per Part 14 §10: Tracks Response Time, Errors, Usage, Latency, Availability. API performance monitoring.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `monitoring_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `applicable_api_id` | UUID | Yes | — | FK to `api_gateway` (Entity 691) | API | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_hour` | INTEGER | No | NULL | 0-23 | Hour | Internal |
| `total_requests` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `successful_requests` | BIGINT | Yes | `0` | ≥ 0 | 2xx | Internal |
| `client_errors` | BIGINT | Yes | `0` | ≥ 0 | 4xx | Internal |
| `server_errors` | BIGINT | Yes | `0` | ≥ 0 | 5xx | Internal |
| `error_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Errors (per Part 14) | Confidential |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability (per Part 14) | Internal |
| `avg_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Response Time (per Part 14) avg | Internal |
| `p50_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P50 | Internal |
| `p95_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `p99_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P99 | Internal |
| `max_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Max | Internal |
| `avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Latency (per Part 14) avg | Internal |
| `requests_per_second_peak` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Peak RPS | Internal |
| `requests_per_second_avg` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Avg RPS | Internal |
| `unique_callers_count` | INTEGER | Yes | `0` | ≥ 0 | Unique | Internal |
| `data_transferred_in_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | In | Internal |
| `data_transferred_out_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Out | Internal |
| `cache_hit_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Cache hits | Internal |
| `rate_limit_hits_count` | BIGINT | Yes | `0` | ≥ 0 | Rate limited | Internal |
| `circuit_breaker_trips_count` | INTEGER | Yes | `0` | ≥ 0 | CB trips | Internal |
| `top_errors` | JSONB | Yes | `'[]'` | — | Top errors | Confidential |
| `top_callers` | JSONB | Yes | `'[]'` | — | Top callers | Confidential |
| `usage_by_method` | JSONB | Yes | `'{}'` | — | By HTTP method | Internal |
| `usage_by_status_code` | JSONB | Yes | `'{}'` | — | By status | Internal |
| `health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Health | Internal |
| `sla_target_availability_pct` | DECIMAL(5,2) | Yes | `99.90` | 0-100 | SLA | Internal |
| `sla_target_response_ms` | INTEGER | Yes | `500` | ≥ 1 | SLA | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | Breach | Internal |
| `trend_24h` | JSONB | Yes | `'[]'` | — | 24-hour trend | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 697 — External System Registry

### 1. Business Purpose
Per Part 14 §10: Stores ERP, CRM, Accounting, Logistics, Government APIs, IoT Platforms. Registry of all external systems integrated with SUOP.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `external_system_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `external_system_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `system_category` | ENUM | Yes | — | ERP (per Part 14), CRM, ACCOUNTING, LOGISTICS, GOVERNMENT_API, IoT_PLATFORM, PAYMENT_GATEWAY, TELEPHONY, ECOMMERCE, MARKETING, ANALYTICS, BANKING, TAX, COMPLIANCE, OTHER | Category | Internal |
| `vendor_name` | VARCHAR(200) | Yes | — | — | Vendor | Internal |
| `vendor_product` | VARCHAR(200) | No | NULL | — | Product | Internal |
| `vendor_version` | VARCHAR(50) | No | NULL | — | Version | Internal |
| `system_description` | TEXT | No | NULL | — | Description | Internal |
| `system_environment` | ENUM | Yes | `PRODUCTION` | DEVELOPMENT, TESTING, STAGING, PRODUCTION | Environment | Internal |
| `base_url` | VARCHAR(500) | Yes | — | — | Base URL | Confidential |
| `api_documentation_url` | VARCHAR(500) | No | NULL | — | Docs | Internal |
| `connected_connector_id` | UUID | No | NULL | FK to `integration_connector` (Entity 694) | Connector | Internal |
| `integration_status` | ENUM | Yes | `NOT_CONNECTED` | NOT_CONNECTED, CONNECTING, CONNECTED, ERROR, DISCONNECTED | Status | Internal |
| `last_connection_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `last_connection_status` | ENUM | No | NULL | SUCCESS, FAILED | Status | Internal |
| `data_flow_direction` | ENUM | Yes | `BIDIRECTIONAL` | INBOUND, OUTBOUND, BIDIRECTIONAL | Direction | Internal |
| `sync_frequency` | ENUM | Yes | `REAL_TIME` | REAL_TIME, HOURLY, DAILY, ON_DEMAND | Frequency | Internal |
| `last_sync_at` | TIMESTAMPTZ | No | NULL | — | Last sync | Internal |
| `last_sync_status` | ENUM | No | NULL | SUCCESS, PARTIAL, FAILED | Status | Internal |
| `records_synced_total` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `data_volume_synced_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Volume | Internal |
| `vendor_support_contact` | JSONB | No | NULL | — | Support | Confidential |
| `vendor_account_manager` | VARCHAR(200) | No | NULL | — | Account mgr | Confidential |
| `contract_reference` | VARCHAR(100) | No | NULL | — | Contract | Confidential |
| `contract_expiry` | DATE | No | NULL | — | Expiry | Internal |
| `compliance_certifications` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | SOC2, ISO27001, PCI_DSS | Internal |
| `data_processing_agreement` | BOOLEAN | Yes | `false` | — | DPA signed | Confidential |
| `data_residency_country` | VARCHAR(50) | No | NULL | — | Residency | Confidential |
| `cross_border_transfer` | BOOLEAN | Yes | `false` | — | Cross-border | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, BLACKLISTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 698 — API Key Management

### 1. Business Purpose
Per Part 14 §10: Stores API Key, Secret, Expiry, Permissions. API key lifecycle management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `api_key_id` | VARCHAR(100) | Yes | — | Unique | API Key ID (per Part 14) — display | Confidential |
| `api_key_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `api_key_description` | TEXT | No | NULL | — | Description | Internal |
| `api_key_prefix` | VARCHAR(20) | Yes | — | — | Visible prefix (e.g., `sk_live_abc...`) | Internal |
| `api_key_hash` | VARCHAR(500) | Yes | — | — | Hashed key (Argon2id) | Restricted |
| `api_key_secret_encrypted` | TEXT | No | NULL | — | Encrypted secret | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `key_type` | ENUM | Yes | `PRODUCTION` | PRODUCTION, SANDBOX, TESTING, READ_ONLY, WRITE_ONLY, READ_WRITE | Type | Internal |
| `key_scope` | ENUM | Yes | `COMPANY` | ENTERPRISE, COMPANY, BRANCH, SPECIFIC_APIS | Scope | Internal |
| `applicable_apis` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific APIs | Confidential |
| `applicable_modules` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `permissions` | JSONB | Yes | `'[]'` | — | Permissions (per Part 14) | Confidential |
| `rate_limit_per_minute` | INTEGER | Yes | `100` | ≥ 1 | Rate | Internal |
| `rate_limit_per_day` | INTEGER | Yes | `10000` | ≥ 1 | Daily | Internal |
| `ip_whitelist` | INET[] | No | `ARRAY[]::INET[]` | — | Whitelist | Confidential |
| `issued_to_identity_id` | UUID | No | NULL | FK to `identity_master` | Issued to | Confidential |
| `issued_to_organization` | VARCHAR(200) | No | NULL | — | Org | Internal |
| `issued_to_contact_email` | VARCHAR(200) | No | NULL | — | Contact | Confidential |
| `issued_at` | TIMESTAMPTZ | Yes | `now()` | — | Issue | Internal |
| `issued_by` | UUID | Yes | — | FK to `identity_master` | Issuer | Confidential |
| `expires_at` | TIMESTAMPTZ | No | NULL | — | Expiry (per Part 14) | Internal |
| `last_used_at` | TIMESTAMPTZ | No | NULL | — | Last use | Internal |
| `last_used_ip` | INET | No | NULL | — | IP | Confidential |
| `usage_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total uses | Internal |
| `usage_count_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `revoked_at` | TIMESTAMPTZ | No | NULL | — | Revocation | Internal |
| `revoked_by` | UUID | No | NULL | FK to `identity_master` | Revoker | Confidential |
| `revocation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `rotation_required` | BOOLEAN | Yes | `false` | — | Rotation | Internal |
| `rotation_frequency_days` | INTEGER | Yes | `90` | ≥ 1 | Frequency | Internal |
| `last_rotated_at` | TIMESTAMPTZ | No | NULL | — | Last rotation | Internal |
| `next_rotation_due` | DATE | No | NULL | — | Next | Internal |
| `applicable_company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, REVOKED, SUSPENDED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 699 — API Audit

### 1. Business Purpose
Per Part 14 §10: Tracks Every Request, Response, User, IP, Duration, Status. API request audit trail.

### 2. Architectural Role
Append-only audit entity — every API request logged. Critical for security investigations and compliance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `audit_partition_key` | VARCHAR(20) | Yes | — | — | Partition (YYYY-MM-DD) | Internal |
| `request_id` | UUID | Yes | — | — | Request ID | Internal |
| `correlation_id` | UUID | No | NULL | — | Correlation | Internal |
| `trace_id` | UUID | No | NULL | — | Trace | Internal |
| `api_gateway_id` | UUID | Yes | — | FK to `api_gateway` (Entity 691) | API | Internal |
| `api_route` | VARCHAR(500) | Yes | — | — | Route | Internal |
| `http_method` | VARCHAR(10) | Yes | — | — | Method | Internal |
| `request_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Every Request (per Part 14) time | Internal |
| `caller_identity_id` | UUID | No | NULL | FK to `identity_master` | User (per Part 14) | Confidential |
| `caller_api_key_id` | UUID | No | NULL | FK to `api_key_management` | API key | Confidential |
| `caller_ip` | INET | Yes | — | — | IP (per Part 14) | Confidential |
| `caller_ip_geolocation` | JSONB | No | NULL | — | Geo | Confidential |
| `caller_user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `caller_device_id` | UUID | No | NULL | FK to `device_registry` | Device | Confidential |
| `session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `request_headers` | JSONB | No | NULL | — | Headers (sanitized) | Confidential |
| `request_query_params` | JSONB | No | NULL | — | Query params | Confidential |
| `request_body_summary` | JSONB | No | NULL | — | Body summary (no PII) | Confidential |
| `request_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Size | Internal |
| `response_status_code` | INTEGER | Yes | — | 100-599 | Status (per Part 14) | Internal |
| `response_headers` | JSONB | No | NULL | — | Response headers | Confidential |
| `response_body_summary` | JSONB | No | NULL | — | Response summary | Confidential |
| `response_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Size | Internal |
| `duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration (per Part 14) | Internal |
| `processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `network_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Network | Internal |
| `cache_hit` | BOOLEAN | Yes | `false` | — | Cache | Internal |
| `rate_limited` | BOOLEAN | Yes | `false` | — | Rate limited | Internal |
| `circuit_breaker_tripped` | BOOLEAN | Yes | `false` | — | CB | Internal |
| `error_code` | VARCHAR(50) | No | NULL | — | Error | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `legal_hold` | BOOLEAN | Yes | `false` | — | Hold | Confidential |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash chain | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 700 — Integration Dashboard

### 1. Business Purpose
Per Part 14 §10: Displays API Health, Integrations, Failures, Latency, Webhook Queue. AI: API Failure Prediction, Traffic Forecast, Smart Routing, Integration Health.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `total_apis_count` | INTEGER | Yes | `0` | ≥ 0 | APIs | Internal |
| `active_apis_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `api_health_overall` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CRITICAL | API Health (per Part 14) | Internal |
| `api_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Internal |
| `apis_by_status` | JSONB | Yes | `'{}'` | — | By status | Internal |
| `total_requests_today` | BIGINT | Yes | `0` | ≥ 0 | Requests today | Internal |
| `total_requests_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `error_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Error rate | Confidential |
| `avg_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `p95_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability | Internal |
| `active_integrations_count` | INTEGER | Yes | `0` | ≥ 0 | Integrations (per Part 14) | Internal |
| `integrations_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `integration_failures_today` | INTEGER | Yes | `0` | ≥ 0 | Failures (per Part 14) | Confidential |
| `integration_failures_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `circuit_breakers_tripped_count` | INTEGER | Yes | `0` | ≥ 0 | CB trips | Internal |
| `avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Latency (per Part 14) | Internal |
| `webhook_queue_pending` | INTEGER | Yes | `0` | ≥ 0 | Webhook Queue (per Part 14) pending | Internal |
| `webhook_queue_processing` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `webhook_queue_failed` | INTEGER | Yes | `0` | ≥ 0 | Failed | Internal |
| `webhook_delivery_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `active_api_keys_count` | INTEGER | Yes | `0` | ≥ 0 | API keys | Internal |
| `api_keys_expiring_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring (30 days) | Internal |
| `external_systems_connected` | INTEGER | Yes | `0` | ≥ 0 | Connected | Internal |
| `external_systems_by_category` | JSONB | Yes | `'{}'` | — | By category | Internal |
| `total_data_synced_today_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Data synced | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day trend | Internal |
| `ai_api_failure_prediction` | JSONB | No | NULL | — | AI: API Failure Prediction (per Part 14 AI) | Restricted |
| `ai_traffic_forecast` | JSONB | No | NULL | — | AI: Traffic Forecast (per Part 14 AI) | Confidential |
| `ai_smart_routing` | JSONB | No | NULL | — | AI: Smart Routing (per Part 14 AI) | Confidential |
| `ai_integration_health` | JSONB | No | NULL | — | AI: Integration Health (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 11: Event Bus, Scheduler & Background Processing Platform (Entities 701-710)

## Entity 701 — Event Bus

### 1. Business Purpose
Per Part 14 §11: Supports Domain Events, Integration Events, System Events. Enterprise event bus for decoupled communication.

### 2. Architectural Role
**Foundational event entity** — per Vol 0: "Business modules should communicate using events. Not direct coupling." Implements Event Bus pattern (FS-49).

### 3. Business Rules
- Event types: DOMAIN (within SUOP), INTEGRATION (external sync), SYSTEM (platform events)
- Event structure: event_id, event_type, event_timestamp, source, payload, metadata
- Delivery semantics: AT_LEAST_ONCE (default), AT_MOST_ONCE (idempotent), EXACTLY_ONCE (transactional)
- Ordering: per-entity ordering guaranteed; cross-entity not guaranteed
- Persistence: events stored for retry and audit (7-30 days typical)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `event_id` | VARCHAR(100) | Yes | — | Unique enterprise-wide | Event ID | Internal |
| `event_bus_partition_key` | VARCHAR(50) | Yes | — | — | Partition (entity_id or module) | Internal |
| `event_type` | VARCHAR(200) | Yes | — | — | Event type (e.g., `purchase_order.submitted`) | Internal |
| `event_category` | ENUM | Yes | — | DOMAIN, INTEGRATION, SYSTEM (per Part 14) | Category | Internal |
| `event_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `event_version` | VARCHAR(20) | Yes | `1.0` | — | Schema version | Internal |
| `event_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | When event occurred | Internal |
| `event_published_at` | TIMESTAMPTZ | Yes | `now()` | — | When published to bus | Internal |
| `source_module` | VARCHAR(50) | Yes | — | — | Publishing module | Internal |
| `source_service` | VARCHAR(200) | Yes | — | — | Publishing service | Internal |
| `source_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `source_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `source_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `event_payload` | JSONB | Yes | `'{}'` | — | Event data | Confidential |
| `event_metadata` | JSONB | Yes | `'{}'` | — | Metadata | Internal |
| `event_schema_id` | UUID | No | NULL | FK to `event_registry` (Entity 702) | Schema | Internal |
| `correlation_id` | UUID | No | NULL | — | Correlation | Internal |
| `causation_id` | UUID | No | NULL | — | Causation (what caused this) | Internal |
| `trace_id` | UUID | No | NULL | — | Distributed trace | Internal |
| `publisher_identity_id` | UUID | No | NULL | FK to `identity_master` | Publisher | Confidential |
| `delivery_semantics` | ENUM | Yes | `AT_LEAST_ONCE` | AT_LEAST_ONCE, AT_MOST_ONCE, EXACTLY_ONCE | Semantics | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Priority | Internal |
| `retry_count` | INTEGER | Yes | `0` | ≥ 0 | Retries | Internal |
| `max_retries` | INTEGER | Yes | `5` | ≥ 0 | Max | Internal |
| `subscribers_notified_count` | INTEGER | Yes | `0` | ≥ 0 | Subscribers | Internal |
| `subscribers_succeeded_count` | INTEGER | Yes | `0` | ≥ 0 | Succeeded | Internal |
| `subscribers_failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed | Internal |
| `all_subscribers_notified` | BOOLEAN | Yes | `false` | — | All notified | Internal |
| `processing_completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `total_processing_duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `dead_lettered` | BOOLEAN | Yes | `false` | — | Sent to DLQ | Internal |
| `dead_lettered_at` | TIMESTAMPTZ | No | NULL | — | DLQ time | Internal |
| `dead_letter_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `current_status` | ENUM | Yes | `PUBLISHED` | PUBLISHED, PROCESSING, COMPLETED, PARTIALLY_COMPLETED, FAILED, DEAD_LETTERED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Event Registry (702) | Many-to-One | N:1 | Schema |
| Queue Management (703) | One-to-Many | 1:N | Queues |
| Event Monitoring (709) | One-to-Many | 1:N | Metrics |

### 6. Indexes
- UNIQUE (`event_id`)
- INDEX (`event_bus_partition_key`, `event_timestamp`)
- INDEX (`event_type`, `event_timestamp`)
- INDEX (`event_category`, `current_status`)
- INDEX (`source_entity_type`, `source_entity_id`, `event_timestamp`)
- INDEX (`correlation_id`)
- INDEX (`current_status`, `event_published_at`)
- INDEX (`dead_lettered`) WHERE `dead_lettered = true`

### 7. Security Classification
**Confidential** — payload may contain PII.

### 8. Integration Points
- **Event Bus** (FS-49): Primary implementation
- **Unified Automation Engine** (FS-52, Q190): Event routing
- **All Business Modules**: Publish/subscribe
- **Audit Engine** (FS-5): Event audit
- **Workflow Engine** (FS-3): Event-triggered workflows

### 9. Sample Data
```json
{
  "event_id": "EVT-2026-07-00123456", "event_bus_partition_key": "po-001",
  "event_type": "purchase_order.submitted", "event_category": "DOMAIN",
  "event_name": "Purchase Order Submitted", "event_version": "1.0",
  "event_timestamp": "2026-07-08T09:30:00Z", "event_published_at": "2026-07-08T09:30:00.050Z",
  "source_module": "PROCUREMENT", "source_service": "procurement-service",
  "source_entity_type": "purchase_order", "source_entity_id": "po-001",
  "source_entity_code": "PO-MUM-2026-001248",
  "event_payload": { "po_id": "po-001", "amount": 500000, "vendor_id": "vnd-001" },
  "event_metadata": { "user_id": "id-100", "ip": "192.168.1.50" },
  "delivery_semantics": "AT_LEAST_ONCE", "priority": "HIGH",
  "subscribers_notified_count": 5, "subscribers_succeeded_count": 5,
  "all_subscribers_notified": true, "current_status": "COMPLETED"
}
```

### 10. Audit Events
`EVENT_PUBLISHED`, `EVENT_PROCESSING_STARTED`, `EVENT_SUBSCRIBER_NOTIFIED`, `EVENT_COMPLETED`, `EVENT_FAILED`, `EVENT_RETRIED`, `EVENT_DEAD_LETTERED`

---

## Entity 702 — Event Registry

### 1. Business Purpose
Per Part 14 §11: Stores Event Name, Publisher, Subscriber, Schema. Event type registry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `event_type_code` | VARCHAR(100) | Yes | — | Unique enterprise-wide | Code (e.g., `purchase_order.submitted`) | Internal |
| `event_name` | VARCHAR(200) | Yes | — | Min 3 | Event Name (per Part 14) | Internal |
| `event_description` | TEXT | No | NULL | — | Description | Internal |
| `event_category` | ENUM | Yes | — | DOMAIN, INTEGRATION, SYSTEM | Category | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Publisher module | Internal |
| `publisher_service` | VARCHAR(200) | Yes | — | — | Publisher (per Part 14) service | Internal |
| `publisher_description` | TEXT | No | NULL | — | Description | Internal |
| `event_schema` | JSONB | Yes | `'{}'` | — | Schema (per Part 14) — JSON Schema | Internal |
| `schema_version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `event_registry` (self) | Previous | Internal |
| `payload_example` | JSONB | No | NULL | — | Example | Internal |
| `subscriber_count` | INTEGER | Yes | `0` | ≥ 0 | Subscribers | Internal |
| `subscribers` | JSONB | Yes | `'[]'` | — | Subscriber (per Part 14) list | Internal |
| `delivery_semantics` | ENUM | Yes | `AT_LEAST_ONCE` | AT_LEAST_ONCE, AT_MOST_ONCE, EXACTLY_ONCE | Semantics | Internal |
| `ordering_required` | BOOLEAN | Yes | `false` | — | Ordering | Internal |
| `ordering_key` | VARCHAR(100) | No | NULL | — | Key (e.g., `entity_id`) | Internal |
| `retention_days` | INTEGER | Yes | `30` | ≥ 1 | Retention | Internal |
| `priority_default` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Default | Internal |
| `schema_backward_compatible` | BOOLEAN | Yes | `true` | — | Backward compat | Internal |
| `schema_deprecation_date` | DATE | No | NULL | — | Deprecation | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, DEPRECATED, RETIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 703 — Queue Management

### 1. Business Purpose
Per Part 14 §11: Supports FIFO, Priority Queue, Delayed Queue, Retry Queue, Dead Letter Queue. Multi-type queue management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `queue_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `queue_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `queue_type` | ENUM | Yes | — | FIFO, PRIORITY_QUEUE, DELAYED_QUEUE, RETRY_QUEUE, DEAD_LETTER_QUEUE (per Part 14), WORK_QUEUE, TOPIC | Type | Internal |
| `queue_purpose` | VARCHAR(200) | Yes | — | — | Purpose | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `queue_engine` | ENUM | Yes | `RABBITMQ` | RABBITMQ, KAFKA, SQS, REDIS, POSTGRES_LISTEN_NOTIFY, CUSTOM | Engine | Internal |
| `queue_engine_config_encrypted` | TEXT | No | NULL | — | Config | Restricted |
| `max_queue_size` | BIGINT | Yes | `1000000` | > 0 | Max size | Internal |
| `current_queue_depth` | BIGINT | Yes | `0` | ≥ 0 | Depth | Internal |
| `messages_enqueued_total` | BIGINT | Yes | `0` | ≥ 0 | Total in | Internal |
| `messages_dequeued_total` | BIGINT | Yes | `0` | ≥ 0 | Total out | Internal |
| `messages_in_flight` | BIGINT | Yes | `0` | ≥ 0 | In flight | Internal |
| `messages_delayed` | BIGINT | Yes | `0` | ≥ 0 | Delayed | Internal |
| `avg_message_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Avg size | Internal |
| `avg_wait_time_seconds` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Wait | Internal |
| `avg_processing_time_seconds` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Processing | Internal |
| `throughput_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Throughput | Internal |
| `consumer_count` | INTEGER | Yes | `0` | ≥ 0 | Consumers | Internal |
| `max_consumers` | INTEGER | Yes | `10` | ≥ 1 | Max | Internal |
| `prefetch_count` | INTEGER | Yes | `10` | ≥ 1 | Prefetch | Internal |
| `visibility_timeout_seconds` | INTEGER | Yes | `30` | ≥ 1 | Visibility | Internal |
| `message_retention_days` | INTEGER | Yes | `7` | ≥ 1 | Retention | Internal |
| `delay_seconds_default` | INTEGER | Yes | `0` | ≥ 0 | Default delay | Internal |
| `priority_levels` | INTEGER | Yes | `5` | ≥ 1 | Priority levels | Internal |
| `dead_letter_queue_id` | UUID | No | NULL | FK to `queue_management` (self) | DLQ | Internal |
| `max_receive_count` | INTEGER | Yes | `5` | ≥ 1 | Before DLQ | Internal |
| `encryption_required` | BOOLEAN | Yes | `true` | — | Encrypted | Internal |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `high_availability` | BOOLEAN | Yes | `true` | — | HA | Internal |
| `replication_factor` | INTEGER | Yes | `3` | ≥ 1 | Replicas | Internal |
| `monitoring_enabled` | BOOLEAN | Yes | `true` | — | Monitored | Internal |
| `alert_threshold_depth` | BIGINT | No | NULL | ≥ 0 | Alert | Internal |
| `alert_threshold_age_seconds` | INTEGER | No | NULL | ≥ 1 | Alert | Internal |
| `alert_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, PAUSED, DRAINING | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 704 — Background Worker

### 1. Business Purpose
Per Part 14 §11: Processes Emails, Reports, Notifications, Imports, Exports, OCR, AI Jobs. Background job workers.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `worker_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `worker_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `worker_type` | ENUM | Yes | — | EMAIL_WORKER, REPORT_WORKER, NOTIFICATION_WORKER, IMPORT_WORKER, EXPORT_WORKER, OCR_WORKER, AI_JOB_WORKER, INTEGRATION_WORKER, MAINTENANCE_WORKER, CLEANUP_WORKER, ANALYTICS_WORKER, CUSTOM (per Part 14) | Type | Internal |
| `worker_description` | TEXT | No | NULL | — | Description | Internal |
| `worker_category` | ENUM | Yes | — | CPU_INTENSIVE, IO_INTENSIVE, MEMORY_INTENSIVE, NETWORK_INTENSIVE, MIXED | Category | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `queue_id` | UUID | Yes | — | FK to `queue_management` (Entity 703) | Source queue | Internal |
| `concurrency_level` | INTEGER | Yes | `1` | ≥ 1 | Concurrent jobs | Internal |
| `max_concurrency` | INTEGER | Yes | `10` | ≥ 1 | Max | Internal |
| `auto_scaling_enabled` | BOOLEAN | Yes | `false` | — | Auto-scale | Internal |
| `min_workers` | INTEGER | Yes | `1` | ≥ 0 | Min | Internal |
| `max_workers` | INTEGER | Yes | `10` | ≥ min_workers | Max | Internal |
| `scale_up_threshold` | INTEGER | Yes | `100` | ≥ 1 | Queue depth to scale | Internal |
| `scale_down_threshold` | INTEGER | Yes | `10` | ≥ 1 | Queue depth to scale | Internal |
| `worker_runtime_seconds_max` | INTEGER | Yes | `3600` | ≥ 1 | Max runtime | Internal |
| `worker_memory_mb_max` | INTEGER | Yes | `1024` | ≥ 128 | Max memory | Internal |
| `worker_cpu_cores_max` | DECIMAL(5,2) | Yes | `1.00` | ≥ 0.1 | Max CPU | Internal |
| `worker_timeout_seconds` | INTEGER | Yes | `300` | ≥ 1 | Timeout | Internal |
| `worker_graceful_shutdown_seconds` | INTEGER | Yes | `30` | ≥ 1 | Graceful | Internal |
| `health_check_interval_seconds` | INTEGER | Yes | `30` | ≥ 5 | Health check | Internal |
| `last_heartbeat_at` | TIMESTAMPTZ | No | NULL | — | Heartbeat | Internal |
| `worker_health` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, UNHEALTHY, STOPPED | Health | Internal |
| `jobs_processed_total` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `jobs_processed_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `jobs_failed_total` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `jobs_failed_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `avg_processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `current_jobs_in_progress` | INTEGER | Yes | `0` | ≥ 0 | In progress | Internal |
| `worker_instances_count` | INTEGER | Yes | `0` | ≥ 0 | Active instances | Internal |
| `worker_instance_details` | JSONB | Yes | `'[]'` | — | Instance details | Internal |
| `worker_environment_variables` | JSONB | No | NULL | — | Env vars | Confidential |
| `worker_secrets_encrypted` | TEXT | No | NULL | — | Secrets | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, STARTING, STOPPING, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 705 — Scheduler

### 1. Business Purpose
Per Part 14 §11: Supports Cron, Recurring, One Time, Business Calendar, Holiday Aware. Enterprise scheduler.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `schedule_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `schedule_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `schedule_description` | TEXT | No | NULL | — | Description | Internal |
| `schedule_type` | ENUM | Yes | — | CRON, RECURRING, ONE_TIME (per Part 14), INTERVAL, BUSINESS_CALENDAR | Type | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `job_type` | VARCHAR(100) | Yes | — | — | Job to execute | Internal |
| `job_payload` | JSONB | Yes | `'{}'` | — | Job data | Confidential |
| `cron_expression` | VARCHAR(100) | No | NULL | — | Cron (if CRON) | Internal |
| `recurrence_pattern` | JSONB | No | NULL | — | Recurrence (per Part 14) | Internal |
| `interval_seconds` | INTEGER | No | NULL | ≥ 1 | Interval | Internal |
| `scheduled_at` | TIMESTAMPTZ | Yes | — | — | Scheduled (one-time) | Internal |
| `start_at` | TIMESTAMPTZ | No | NULL | — | Start | Internal |
| `end_at` | TIMESTAMPTZ | No | NULL | — | End | Internal |
| `next_run_at` | TIMESTAMPTZ | Yes | — | — | Next run | Internal |
| `last_run_at` | TIMESTAMPTZ | No | NULL | — | Last run | Internal |
| `last_run_status` | ENUM | No | NULL | SUCCESS, FAILED, SKIPPED, RUNNING | Status | Internal |
| `last_run_duration_ms` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `total_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `successful_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Success | Internal |
| `failed_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rate | Internal |
| `timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `business_calendar_aware` | BOOLEAN | Yes | `false` | — | Business Calendar (per Part 14) | Internal |
| `business_calendar_id` | UUID | No | NULL | FK to `holiday_calendar` (Entity 446) | Calendar | Internal |
| `holiday_aware` | BOOLEAN | Yes | `false` | — | Holiday Aware (per Part 14) | Internal |
| `skip_on_holiday` | BOOLEAN | Yes | `false` | — | Skip holidays | Internal |
| `run_on_next_business_day` | BOOLEAN | Yes | `false` | — | Next business day | Internal |
| `worker_id` | UUID | Yes | — | FK to `background_worker` (Entity 704) | Worker | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `max_runtime_seconds` | INTEGER | Yes | `3600` | ≥ 1 | Max runtime | Internal |
| `retry_policy_id` | UUID | No | NULL | FK to `retry_policy` (Entity 707) | Retry | Internal |
| `notification_on_failure` | BOOLEAN | Yes | `true` | — | Notify | Internal |
| `notification_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `concurrent_execution_allowed` | BOOLEAN | Yes | `false` | — | Allow overlap | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, PAUSED, COMPLETED, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 706 — Job History

### 1. Business Purpose
Per Part 14 §11: Stores Execution, Duration, Result, Errors, Retry Count. Job execution history.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `job_history_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `job_id` | VARCHAR(100) | Yes | — | — | Job ID | Internal |
| `job_type` | VARCHAR(100) | Yes | — | — | Type | Internal |
| `job_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `worker_id` | UUID | No | NULL | FK to `background_worker` (Entity 704) | Worker | Internal |
| `schedule_id` | UUID | No | NULL | FK to `scheduler` (Entity 705) | Schedule | Internal |
| `queue_id` | UUID | No | NULL | FK to `queue_management` (Entity 703) | Queue | Internal |
| `queue_message_id` | VARCHAR(100) | No | NULL | — | Message ID | Internal |
| `correlation_id` | UUID | No | NULL | — | Correlation | Internal |
| `trace_id` | UUID | No | NULL | — | Trace | Internal |
| `job_payload` | JSONB | Yes | `'{}'` | — | Payload | Confidential |
| `queued_at` | TIMESTAMPTZ | Yes | `now()` | — | Queued | Internal |
| `started_at` | TIMESTAMPTZ | No | NULL | — | Execution start (per Part 14: "Execution") | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration (per Part 14) | Internal |
| `duration_seconds` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Seconds | Internal |
| `result` | ENUM | Yes | — | SUCCESS, PARTIAL_SUCCESS, FAILED, CANCELLED, TIMEOUT, SKIPPED | Result (per Part 14) | Internal |
| `result_data` | JSONB | No | NULL | — | Result data | Confidential |
| `result_summary` | TEXT | No | NULL | — | Summary | Internal |
| `records_processed` | BIGINT | Yes | `0` | ≥ 0 | Records | Internal |
| `records_succeeded` | BIGINT | Yes | `0` | ≥ 0 | Succeeded | Internal |
| `records_failed` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `error_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `error_stack_trace` | TEXT | No | NULL | — | Stack trace | Confidential |
| `retry_count` | INTEGER | Yes | `0` | ≥ 0 | Retry Count (per Part 14) | Internal |
| `max_retries` | INTEGER | Yes | `3` | ≥ 0 | Max | Internal |
| `worker_instance_id` | VARCHAR(100) | No | NULL | — | Instance | Internal |
| `worker_memory_used_mb` | INTEGER | No | NULL | ≥ 0 | Memory | Internal |
| `worker_cpu_used_pct` | DECIMAL(5,2) | No | NULL | 0-100 | CPU | Internal |
| `dead_lettered` | BOOLEAN | Yes | `false` | — | DLQ | Internal |
| `dead_letter_queue_id` | UUID | No | NULL | FK to `queue_management` | DLQ | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 707 — Retry Policy

### 1. Business Purpose
Per Part 14 §11: Supports Immediate, Exponential, Manual Retry. Retry policy configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `policy_description` | TEXT | No | NULL | — | Description | Internal |
| `retry_strategy` | ENUM | Yes | — | IMMEDIATE (per Part 14), EXPONENTIAL (per Part 14), FIXED_INTERVAL, LINEAR_BACKOFF, MANUAL_RETRY (per Part 14), CUSTOM | Strategy | Internal |
| `max_retry_count` | INTEGER | Yes | `3` | ≥ 0 | Max | Internal |
| `initial_delay_seconds` | INTEGER | Yes | `1` | ≥ 1 | Initial | Internal |
| `max_delay_seconds` | INTEGER | Yes | `3600` | ≥ initial_delay | Max | Internal |
| `backoff_multiplier` | DECIMAL(5,2) | Yes | `2.00` | ≥ 1 | Multiplier (exponential) | Internal |
| `backoff_jitter_pct` | DECIMAL(5,2) | Yes | `10.00` | 0-100 | Jitter | Internal |
| `retry_on_error_codes` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Specific errors | Internal |
| `retry_on_status_codes` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | HTTP status | Internal |
| `do_not_retry_on_error_codes` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Never retry | Internal |
| `retry_on_timeout` | BOOLEAN | Yes | `true` | — | Timeout | Internal |
| `retry_on_network_error` | BOOLEAN | Yes | `true` | — | Network | Internal |
| `circuit_breaker_enabled` | BOOLEAN | Yes | `true` | — | CB | Internal |
| `circuit_breaker_threshold_failures` | INTEGER | Yes | `5` | ≥ 1 | Threshold | Internal |
| `circuit_breaker_reset_seconds` | INTEGER | Yes | `60` | ≥ 1 | Reset | Internal |
| `circuit_breaker_half_open_max_calls` | INTEGER | Yes | `3` | ≥ 1 | Half-open | Internal |
| `manual_retry_allowed` | BOOLEAN | Yes | `true` | — | Manual | Internal |
| `manual_retry_max_count` | INTEGER | Yes | `5` | ≥ 0 | Max manual | Internal |
| `notification_on_failure` | BOOLEAN | Yes | `false` | — | Notify | Internal |
| `notification_after_retries` | INTEGER | Yes | `3` | ≥ 1 | After N | Internal |
| `dead_letter_after_max_retries` | BOOLEAN | Yes | `true` | — | DLQ | Internal |
| `applicable_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `applicable_job_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Job types | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 708 — Dead Letter Queue

### 1. Business Purpose
Per Part 14 §11: Stores Failed Jobs, Reason, Recovery. Dead letter queue for failed messages.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dlq_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `original_queue_id` | UUID | Yes | — | FK to `queue_management` (Entity 703) | Source queue | Internal |
| `original_message_id` | VARCHAR(100) | Yes | — | — | Original message | Internal |
| `original_job_id` | UUID | No | NULL | FK to `job_history` (Entity 706) | Original job | Internal |
| `event_id` | UUID | No | NULL | FK to `event_bus` (Entity 701) | Original event | Internal |
| `message_payload` | JSONB | Yes | `'{}'` | — | Payload | Confidential |
| `message_metadata` | JSONB | Yes | `'{}'` | — | Metadata | Internal |
| `failure_reason` | TEXT | Yes | — | Min 10 | Reason (per Part 14) | Confidential |
| `failure_error_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `failure_error_message` | TEXT | No | NULL | — | Message | Confidential |
| `failure_stack_trace` | TEXT | No | NULL | — | Stack | Confidential |
| `failure_count` | INTEGER | Yes | `0` | ≥ 0 | Failures | Internal |
| `first_failed_at` | TIMESTAMPTZ | Yes | — | — | First | Internal |
| `last_failed_at` | TIMESTAMPTZ | Yes | `now()` | — | Last | Internal |
| `dead_lettered_at` | TIMESTAMPTZ | Yes | `now()` | — | DLQ time | Internal |
| `original_published_at` | TIMESTAMPTZ | No | NULL | — | Original pub | Internal |
| `total_delay_in_queue_seconds` | INTEGER | Yes | `0` | ≥ 0 | Time in system | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `recovery_action` | ENUM | Yes | `PENDING_REVIEW` | PENDING_REVIEW, REQUEUED, REPROCESSED, MANUALLY_RESOLVED, ABANDONED, ARCHIVED | Recovery (per Part 14) | Internal |
| `recovery_attempt_count` | INTEGER | Yes | `0` | ≥ 0 | Attempts | Internal |
| `recovered_at` | TIMESTAMPTZ | No | NULL | — | Recovery | Internal |
| `recovered_by` | UUID | No | NULL | FK to `identity_master` | Recoverer | Confidential |
| `recovery_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `manual_intervention_required` | BOOLEAN | Yes | `true` | — | Manual needed | Internal |
| `assigned_to_identity_id` | UUID | No | NULL | FK to `identity_master` | Assigned | Confidential |
| `priority` | ENUM | Yes | `HIGH` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Priority | Internal |
| `notification_sent` | BOOLEAN | Yes | `false` | — | Notified | Internal |
| `notification_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `current_status` | ENUM | Yes | `PENDING_REVIEW` | PENDING_REVIEW, UNDER_REVIEW, REQUEUED, RECOVERED, ABANDONED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 709 — Event Monitoring

### 1. Business Purpose
Per Part 14 §11: Displays Published, Processed, Failed, Delayed. Event bus monitoring.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_hour` | INTEGER | No | NULL | 0-23 | Hour | Internal |
| `snapshot_type` | ENUM | Yes | `HOURLY` | HOURLY, DAILY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `events_published_count` | BIGINT | Yes | `0` | ≥ 0 | Published (per Part 14) | Internal |
| `events_processed_count` | BIGINT | Yes | `0` | ≥ 0 | Processed (per Part 14) | Internal |
| `events_failed_count` | BIGINT | Yes | `0` | ≥ 0 | Failed (per Part 14) | Internal |
| `events_delayed_count` | BIGINT | Yes | `0` | ≥ 0 | Delayed (per Part 14) | Internal |
| `events_dead_lettered_count` | BIGINT | Yes | `0` | ≥ 0 | DLQ | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `avg_processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `p95_processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `events_by_category` | JSONB | Yes | `'{}'` | — | DOMAIN, INTEGRATION, SYSTEM | Internal |
| `events_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `events_by_type` | JSONB | Yes | `'[]'` | — | Top event types | Internal |
| `top_failing_events` | JSONB | Yes | `'[]'` | — | Top failures | Confidential |
| `top_slow_subscribers` | JSONB | Yes | `'[]'` | — | Slow | Confidential |
| `queue_depth_total` | BIGINT | Yes | `0` | ≥ 0 | Depth | Internal |
| `queue_depth_by_queue` | JSONB | Yes | `'{}'` | — | By queue | Internal |
| `subscribers_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `subscribers_inactive_count` | INTEGER | Yes | `0` | ≥ 0 | Inactive | Internal |
| `workers_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `workers_busy_count` | INTEGER | Yes | `0` | ≥ 0 | Busy | Internal |
| `worker_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `trend_24h` | JSONB | Yes | `'[]'` | — | 24-hour | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 710 — Platform Operations Dashboard

### 1. Business Purpose
Per Part 14 §11: Displays Queue Depth, Workers, Jobs, Failures, Events, Performance. AI: Job Optimization, Capacity Planning, Failure Prediction, Auto Scaling Recommendation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `queue_depth_total` | BIGINT | Yes | `0` | ≥ 0 | Queue Depth (per Part 14) | Internal |
| `queue_depth_by_queue` | JSONB | Yes | `'[]'` | — | Per queue | Internal |
| `queues_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `queues_paused_count` | INTEGER | Yes | `0` | ≥ 0 | Paused | Internal |
| `workers_active_count` | INTEGER | Yes | `0` | ≥ 0 | Workers (per Part 14) | Internal |
| `workers_busy_count` | INTEGER | Yes | `0` | ≥ 0 | Busy | Internal |
| `workers_idle_count` | INTEGER | Yes | `0` | ≥ 0 | Idle | Internal |
| `workers_unhealthy_count` | INTEGER | Yes | `0` | ≥ 0 | Unhealthy | Confidential |
| `worker_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `jobs_queued_count` | BIGINT | Yes | `0` | ≥ 0 | Jobs (per Part 14) queued | Internal |
| `jobs_in_progress_count` | INTEGER | Yes | `0` | ≥ 0 | In progress | Internal |
| `jobs_completed_today` | BIGINT | Yes | `0` | ≥ 0 | Completed | Internal |
| `jobs_failed_today` | BIGINT | Yes | `0` | ≥ 0 | Failures (per Part 14) | Confidential |
| `jobs_failed_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `job_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `events_published_today` | BIGINT | Yes | `0` | ≥ 0 | Events (per Part 14) | Internal |
| `events_processed_today` | BIGINT | Yes | `0` | ≥ 0 | Processed | Internal |
| `events_failed_today` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `dead_letter_queue_count` | INTEGER | Yes | `0` | ≥ 0 | DLQ | Confidential |
| `dead_letter_queue_pending_review` | INTEGER | Yes | `0` | ≥ 0 | Pending | Confidential |
| `scheduled_jobs_count` | INTEGER | Yes | `0` | ≥ 0 | Scheduled | Internal |
| `scheduled_jobs_overdue` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Confidential |
| `performance_metrics` | JSONB | Yes | `'{}'` | — | Performance (per Part 14) | Internal |
| `system_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Health | Internal |
| `throughput_events_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Throughput | Internal |
| `throughput_jobs_per_minute` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Throughput | Internal |
| `trend_24h` | JSONB | Yes | `'[]'` | — | 24-hour | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `ai_job_optimization` | JSONB | No | NULL | — | AI: Job Optimization (per Part 14 AI) | Confidential |
| `ai_capacity_planning` | JSONB | No | NULL | — | AI: Capacity Planning (per Part 14 AI) | Confidential |
| `ai_failure_prediction` | JSONB | No | NULL | — | AI: Failure Prediction (per Part 14 AI) | Restricted |
| `ai_auto_scaling_recommendation` | JSONB | No | NULL | — | AI: Auto Scaling (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 12: Reporting Engine, Print Engine, Business Intelligence & Platform Mission Control (Entities 711-720)

## Entity 711 — Report Master

### 1. Business Purpose
Per Part 14 §12: Stores Report, Category, Module, Format, Permissions. Master report definitions.

### 2. Architectural Role
Master entity — per Vol 0: "Every report should come from a single reporting platform. No duplicated report logic."

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `report_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `report_name` | VARCHAR(200) | Yes | — | Min 3 | Report (per Part 14) name | Internal |
| `report_description` | TEXT | No | NULL | — | Description | Internal |
| `report_category` | ENUM | Yes | — | EXECUTIVE, OPERATIONAL, FINANCIAL, COMPLIANCE, AUDIT, CUSTOM, REGULATORY, MANAGEMENT | Category (per Part 14) | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module (per Part 14) | Internal |
| `report_type` | ENUM | Yes | `TABULAR` | TABULAR, CHART, DASHBOARD, PIVOT, MATRIX, MIXED | Type | Internal |
| `data_source` | ENUM | Yes | `DATABASE` | DATABASE, BI_CUBE, DATA_WAREHOUSE, DATA_LAKE, API, FLAT_FILE, COMPOSITE | Source | Internal |
| `data_source_config` | JSONB | Yes | `'{}'` | — | Source config | Confidential |
| `query_definition` | TEXT | Yes | — | — | SQL/DSL query | Confidential |
| `query_parameters` | JSONB | Yes | `'[]'` | — | [{ name, type, required, default }] | Internal |
| `supported_formats` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PDF, EXCEL, CSV, JSON, XML, HTML | Format (per Part 14) | Internal |
| `default_format` | ENUM | Yes | `PDF` | PDF, EXCEL, CSV, JSON, XML, HTML | Default | Internal |
| `template_attachment_id` | UUID | No | NULL | FK to `attachments` | Layout template | Internal |
| `layout_config` | JSONB | Yes | `'{}'` | — | Layout | Internal |
| `chart_config` | JSONB | No | NULL | — | Charts | Internal |
| `permissions_required` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Permissions (per Part 14) | Confidential |
| `applicable_roles` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `data_access_scope` | JSONB | Yes | `'{}'` | — | Scope | Confidential |
| `scheduling_enabled` | BOOLEAN | Yes | `true` | — | Schedulable | Internal |
| `email_delivery_enabled` | BOOLEAN | Yes | `true` | — | Email delivery | Internal |
| `webhook_delivery_enabled` | BOOLEAN | Yes | `false` | — | Webhook | Internal |
| `cache_enabled` | BOOLEAN | Yes | `true` | — | Cacheable | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | TTL | Internal |
| `default_page_size` | INTEGER | Yes | `50` | ≥ 1 | Page size | Internal |
| `max_rows_limit` | INTEGER | Yes | `100000` | ≥ 1 | Max rows | Internal |
| `execution_timeout_seconds` | INTEGER | Yes | `300` | ≥ 1 | Timeout | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `report_master` (self) | Previous | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `execution_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `execution_count_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `last_executed_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `last_execution_duration_ms` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `avg_execution_duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 712 — Report Builder

### 1. Business Purpose
Per Part 14 §12: Supports Drag & Drop, Filters, Grouping, Charts, Scheduling. Visual report builder.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `builder_session_id` | VARCHAR(100) | Yes | — | Unique | Session | Internal |
| `report_master_id` | UUID | No | NULL | FK to `report_master` (Entity 711) | Linked report | Internal |
| `builder_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `builder_description` | TEXT | No | NULL | — | Description | Internal |
| `builder_type` | ENUM | Yes | `VISUAL` | VISUAL, CODE, HYBRID | Type | Internal |
| `data_source_id` | UUID | Yes | — | FK to `bi_cube` (Entity 716) or data source | Source | Internal |
| `selected_tables` | JSONB | Yes | `'[]'` | — | Tables/views | Internal |
| `selected_fields` | JSONB | Yes | `'[]'` | — | [{ table, field, alias, aggregation }] | Internal |
| `applied_filters` | JSONB | Yes | `'[]'` | — | Filters (per Part 14) | Confidential |
| `grouping_config` | JSONB | Yes | `'[]'` | — | Grouping (per Part 14) | Internal |
| `sorting_config` | JSONB | Yes | `'[]'` | — | Sorting | Internal |
| `joins_config` | JSONB | Yes | `'[]'` | — | Joins | Confidential |
| `chart_config` | JSONB | No | NULL | — | Charts (per Part 14) | Internal |
| `layout_config` | JSONB | Yes | `'{}'` | — | Layout | Internal |
| `formatting_rules` | JSONB | No | NULL | — | Formatting | Internal |
| `calculated_fields` | JSONB | No | NULL | — | Custom calc | Confidential |
| `parameters_config` | JSONB | Yes | `'[]'` | — | User parameters | Internal |
| `scheduling_config` | JSONB | No | NULL | — | Scheduling (per Part 14) | Internal |
| `generated_sql` | TEXT | No | NULL | — | Generated SQL | Confidential |
| `preview_data` | JSONB | No | NULL | — | Preview | Confidential |
| `validation_status` | ENUM | Yes | `PENDING` | PENDING, VALID, INVALID, VALIDATED | Status | Internal |
| `validation_errors` | JSONB | No | NULL | — | Errors | Confidential |
| `tested` | BOOLEAN | Yes | `false` | — | Tested | Internal |
| `test_results` | JSONB | No | NULL | — | Results | Internal |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `last_modified_by` | UUID | No | NULL | FK to `identity_master` | Modifier | Confidential |
| `last_modified_at` | TIMESTAMPTZ | Yes | `now()` | — | Modified | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_draft` | BOOLEAN | Yes | `true` | — | Draft | Internal |
| `published_at` | TIMESTAMPTZ | No | NULL | — | Published | Internal |
| `published_by` | UUID | No | NULL | FK to `identity_master` | Publisher | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PUBLISHED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 713 — Dashboard Builder

### 1. Business Purpose
Per Part 14 §12: Supports Widgets, Charts, KPIs, Tables, Maps. Visual dashboard builder.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_code` | VARCHAR(50) | Yes | — | Unique per user/company | Code | Internal |
| `dashboard_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `dashboard_description` | TEXT | No | NULL | — | Description | Internal |
| `dashboard_type` | ENUM | Yes | `CUSTOM` | EXECUTIVE, OPERATIONAL, PERSONAL, TEAM, DEPARTMENT, COMPANY, PUBLIC, CUSTOM | Type | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `layout_config` | JSONB | Yes | `'{}'` | — | Layout grid | Internal |
| `widgets` | JSONB | Yes | `'[]'` | — | Widgets (per Part 14) — [{ id, type, position, size, config, data_source }] | Internal |
| `widget_types_used` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | CHART, KPI, TABLE, MAP, GAUGE, HEATMAP, TREEMAP, TIMELINE, CUSTOM (per Part 14) | Types | Internal |
| `chart_configurations` | JSONB | Yes | `'[]'` | — | Charts (per Part 14) | Internal |
| `kpi_configurations` | JSONB | Yes | `'[]'` | — | KPIs (per Part 14) | Internal |
| `table_configurations` | JSONB | Yes | `'[]'` | — | Tables (per Part 14) | Internal |
| `map_configurations` | JSONB | No | NULL | — | Maps (per Part 14) | Internal |
| `global_filters` | JSONB | Yes | `'[]'` | — | Dashboard-level filters | Confidential |
| `refresh_interval_seconds` | INTEGER | Yes | `300` | ≥ 30 | Auto-refresh | Internal |
| `auto_refresh_enabled` | BOOLEAN | Yes | `true` | — | Auto | Internal |
| `real_time_enabled` | BOOLEAN | Yes | `false` | — | Real-time | Internal |
| `theme` | VARCHAR(50) | Yes | `default` | — | Theme | Internal |
| `color_scheme` | JSONB | Yes | `'{}'` | — | Colors | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner | Confidential |
| `shared_with_identities` | UUID[] | No | `ARRAY[]::UUID[]` | — | Shared | Confidential |
| `shared_with_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `shared_with_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Departments | Internal |
| `is_public` | BOOLEAN | Yes | `false` | — | Public | Internal |
| `is_default` | BOOLEAN | Yes | `false` | — | Default for users | Internal |
| `is_template` | BOOLEAN | Yes | `false` | — | Template | Internal |
| `mobile_optimized` | BOOLEAN | Yes | `true` | — | Mobile | Internal |
| `tablet_optimized` | BOOLEAN | Yes | `true` | — | Tablet | Internal |
| `view_count` | BIGINT | Yes | `0` | ≥ 0 | Views | Internal |
| `last_viewed_at` | TIMESTAMPTZ | No | NULL | — | Last view | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `dashboard_builder` (self) | Previous | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 714 — Print Engine

### 1. Business Purpose
Per Part 14 §12: Supports Invoice, Barcode, Label, Receipt, Purchase Order, Work Order, Certificate. Print job management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `print_engine_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `print_job_id` | VARCHAR(100) | Yes | — | Unique | Job ID | Internal |
| `document_type` | ENUM | Yes | — | INVOICE, BARCODE, LABEL, RECEIPT, PURCHASE_ORDER, WORK_ORDER, CERTIFICATE (per Part 14), REPORT, STATEMENT, DELIVERY_CHALLAN, GRN, PAYSLIP, OTHER | Type | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `template_id` | UUID | Yes | — | FK to `label_template` (Entity 684) or report template | Template | Internal |
| `applicable_entity_type` | VARCHAR(100) | Yes | — | — | Entity type | Internal |
| `applicable_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `print_data` | JSONB | Yes | `'{}'` | — | Variable data | Confidential |
| `print_format` | ENUM | Yes | `PDF` | PDF, ZPL, HTML, SVG, DIRECT_PRINT, ESC_POS | Format | Internal |
| `copies_requested` | INTEGER | Yes | `1` | ≥ 1 | Copies | Internal |
| `copies_printed` | INTEGER | Yes | `0` | ≥ 0 | Printed | Internal |
| `printer_device_id` | UUID | Yes | — | FK to `device_registry` | Printer | Confidential |
| `printer_name` | VARCHAR(200) | No | NULL | — | Denormalized | Internal |
| `print_quality` | ENUM | Yes | `NORMAL` | DRAFT, NORMAL, HIGH, PHOTO | Quality | Internal |
| `color_mode` | ENUM | Yes | `MONOCHROME` | MONOCHROME, COLOR, GRAYSCALE | Mode | Internal |
| `paper_size` | ENUM | Yes | `A4` | A4, A5, LETTER, LEGAL, THERMAL_4X6, THERMAL_3X2, CUSTOM | Size | Internal |
| `paper_orientation` | ENUM | Yes | `PORTRAIT` | PORTRAIT, LANDSCAPE | Orientation | Internal |
| `duplex` | BOOLEAN | Yes | `false` | — | Double-sided | Internal |
| `watermark_enabled` | BOOLEAN | Yes | `false` | — | Watermark | Internal |
| `watermark_text` | VARCHAR(200) | No | NULL | — | Text | Internal |
| `digital_signature_required` | BOOLEAN | Yes | `false` | — | Signature | Internal |
| `queued_at` | TIMESTAMPTZ | Yes | `now()` | — | Queued | Internal |
| `printing_started_at` | TIMESTAMPTZ | No | NULL | — | Started | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completed | Internal |
| `failed_at` | TIMESTAMPTZ | No | NULL | — | Failed | Internal |
| `print_duration_seconds` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `queued_by` | UUID | Yes | — | FK to `identity_master` | Queued by | Confidential |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `error_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `reprint_count` | INTEGER | Yes | `0` | ≥ 0 | Reprints | Internal |
| `reprint_of_id` | UUID | No | NULL | FK to `print_engine` (self) | Original | Internal |
| `reprint_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `preview_attachment_id` | UUID | No | NULL | FK to `attachments` | Preview | Internal |
| `output_attachment_id` | UUID | No | NULL | FK to `attachments` | Output | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `QUEUED` | QUEUED, PRINTING, COMPLETED, FAILED, CANCELLED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 715 — Export Engine

### 1. Business Purpose
Per Part 14 §12: Supports PDF, Excel, CSV, JSON, XML. Data export engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `export_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `export_job_id` | VARCHAR(100) | Yes | — | Unique | Job ID | Internal |
| `export_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `export_source_type` | ENUM | Yes | `REPORT` | REPORT, DASHBOARD, GRID, QUERY, ENTITY_LIST, CUSTOM | Source | Internal |
| `export_source_id` | UUID | No | NULL | — | Source ID | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `export_format` | ENUM | Yes | — | PDF, EXCEL, CSV, JSON, XML (per Part 14) | Format | Internal |
| `export_data` | JSONB | No | NULL | — | Data (if small) | Confidential |
| `export_query` | TEXT | No | NULL | — | Query | Confidential |
| `export_filters` | JSONB | Yes | `'{}'` | — | Filters | Confidential |
| `export_columns` | JSONB | Yes | `'[]'` | — | Columns to export | Internal |
| `total_records` | BIGINT | Yes | `0` | ≥ 0 | Records | Internal |
| `records_exported` | BIGINT | Yes | `0` | ≥ 0 | Exported | Internal |
| `file_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Size | Internal |
| `file_attachment_id` | UUID | No | NULL | FK to `attachments` | File | Confidential |
| `file_download_url` | VARCHAR(1000) | No | NULL | — | Download URL | Confidential |
| `url_expires_at` | TIMESTAMPTZ | No | NULL | — | Expiry | Internal |
| `watermark_enabled` | BOOLEAN | Yes | `false` | — | Watermark | Internal |
| `watermark_text` | VARCHAR(200) | No | NULL | — | Text | Internal |
| `password_protected` | BOOLEAN | Yes | `false` | — | Password | Internal |
| `password_hash` | VARCHAR(500) | No | NULL | — | Hash | Restricted |
| `encryption_enabled` | BOOLEAN | Yes | `false` | — | Encrypted | Internal |
| `include_headers` | BOOLEAN | Yes | `true` | — | Headers | Internal |
| `include_metadata` | BOOLEAN | Yes | `false` | — | Metadata | Internal |
| `max_records_limit` | INTEGER | Yes | `100000` | ≥ 1 | Max | Internal |
| `chunked_export` | BOOLEAN | Yes | `false` | — | Chunked | Internal |
| `chunk_size` | INTEGER | Yes | `10000` | ≥ 1 | Size | Internal |
| `started_at` | TIMESTAMPTZ | Yes | `now()` | — | Start | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `requested_by` | UUID | Yes | — | FK to `identity_master` | Requester | Confidential |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH | Priority | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `error_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `notification_on_completion` | BOOLEAN | Yes | `true` | — | Notify | Internal |
| `notification_channels` | TEXT[] | Yes | `ARRAY['EMAIL','IN_APP']` | — | Channels | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `QUEUED` | QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED, EXPIRED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 716 — BI Cube

### 1. Business Purpose
Per Part 14 §12: Stores Aggregated Data, Historical Data, KPIs, Dimensions, Measures. Business Intelligence cube.

### 2. Architectural Role
OLAP cube entity — pre-aggregated data for fast analytics. Per Vol 0 three-tier financial architecture pattern (Journal → GL → Finance Cube).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `cube_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `cube_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `cube_description` | TEXT | No | NULL | — | Description | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `cube_type` | ENUM | Yes | `OLAP` | OLAP, TABULAR, STAR_SCHEMA, SNOWFLAKE, HYBRID | Type | Internal |
| `data_source` | ENUM | Yes | `DATA_WAREHOUSE` | DATA_WAREHOUSE, DATA_LAKE, DATABASE, COMPOSITE | Source | Internal |
| `dimensions` | JSONB | Yes | `'[]'` | — | Dimensions (per Part 14) — [{ name, type, hierarchy, members }] | Internal |
| `measures` | JSONB | Yes | `'[]'` | — | Measures (per Part 14) — [{ name, type, aggregation, formula }] | Confidential |
| `kpi_definitions` | JSONB | Yes | `'[]'` | — | KPIs (per Part 14) | Confidential |
| `hierarchies` | JSONB | Yes | `'[]'` | — | Hierarchies | Internal |
| `aggregations_precomputed` | JSONB | Yes | `'[]'` | — | Pre-aggregated | Internal |
| `partitions` | JSONB | Yes | `'[]'` | — | Partitions | Internal |
| `grain` | VARCHAR(100) | Yes | — | — | Grain (e.g., `transaction_per_day`) | Internal |
| `time_granularity` | ENUM | Yes | `DAILY` | HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Time | Internal |
| `data_refresh_frequency` | ENUM | Yes | `HOURLY` | REAL_TIME, EVERY_5_MINUTES, HOURLY, DAILY, ON_DEMAND | Refresh | Internal |
| `last_refresh_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `last_refresh_duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `last_refresh_records` | BIGINT | Yes | `0` | ≥ 0 | Records | Internal |
| `total_records` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `storage_size_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Size | Internal |
| `storage_tier` | ENUM | Yes | `HOT` | HOT, WARM, COLD | Tier | Internal |
| `indexed_fields` | JSONB | Yes | `'[]'` | — | Indexed | Internal |
| `query_avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `queries_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `cache_enabled` | BOOLEAN | Yes | `true` | — | Cache | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | TTL | Internal |
| `access_permissions` | JSONB | Yes | `'[]'` | — | Permissions | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, REFRESHING | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 717 — Platform KPI Library

### 1. Business Purpose
Per Part 14 §12: Supports Operational, Financial, Manufacturing, Warehouse, Retail, Restaurant, HR, Maintenance. Enterprise KPI definitions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(50) | Yes | — | Unique enterprise-wide | Code | Internal |
| `kpi_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `kpi_description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `kpi_category` | ENUM | Yes | — | OPERATIONAL, FINANCIAL, MANUFACTURING, WAREHOUSE, RETAIL, RESTAURANT, HR, MAINTENANCE (per Part 14), QUALITY, COMPLIANCE, CUSTOMER, SUPPLIER, PLATFORM, ESG | Category | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `measurement_unit` | VARCHAR(20) | Yes | — | — | Unit | Internal |
| `data_type` | ENUM | Yes | `DECIMAL` | INTEGER, DECIMAL, PERCENTAGE, CURRENCY, RATIO, COUNT | Type | Internal |
| `calculation_formula` | TEXT | No | NULL | — | Formula | Confidential |
| `calculation_dsl` | TEXT | No | NULL | — | DSL | Confidential |
| `data_source` | ENUM | Yes | `BI_CUBE` | BI_CUBE, DATA_WAREHOUSE, DATABASE, API, COMPUTED, MANUAL | Source | Internal |
| `data_source_config` | JSONB | Yes | `'{}'` | — | Config | Confidential |
| `dimensions_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Time, Module, Branch, etc. | Internal |
| `granularity_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Daily, Weekly, Monthly | Internal |
| `target_value` | DECIMAL(18,4) | No | NULL | — | Target | Internal |
| `target_direction` | ENUM | Yes | `HIGHER_BETTER` | HIGHER_BETTER, LOWER_BETTER, TARGET_VALUE | Direction | Internal |
| `benchmark_value` | DECIMAL(18,4) | No | NULL | — | Industry benchmark | Confidential |
| `benchmark_source` | VARCHAR(200) | No | NULL | — | Source | Internal |
| `alert_threshold_low` | DECIMAL(18,4) | No | NULL | — | Low | Internal |
| `alert_threshold_high` | DECIMAL(18,4) | No | NULL | — | High | Internal |
| `alert_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `display_format` | VARCHAR(50) | Yes | `#,##,###.##` | — | Display | Internal |
| `color_coding_rules` | JSONB | No | NULL | — | Color thresholds | Internal |
| `applicable_levels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | ENTERPRISE, COMPANY, BRANCH, DEPARTMENT, TEAM, INDIVIDUAL | Levels | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `frequency` | ENUM | Yes | `MONTHLY` | REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Frequency | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 718 — Platform Mission Control

### 1. Business Purpose
Per Part 14 §12: Displays Platform Health, Users, Performance, Queues, API, AI, Storage, Security. Unified platform operations command center.

### 2. Architectural Role
Real-time operational dashboard — the **single pane of glass** for platform operations. Combines all Platform Kernel services' metrics.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `platform_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Platform Health (per Part 14) | Confidential |
| `platform_health_components` | JSONB | Yes | `'{}'` | — | { infrastructure, applications, APIs, queues, security, data } | Confidential |
| `platform_health_status` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CRITICAL, DOWN | Status | Internal |
| `active_users_count` | INTEGER | Yes | `0` | ≥ 0 | Users (per Part 14) online | Internal |
| `users_today_count` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `users_trend_24h` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `performance_metrics` | JSONB | Yes | `'{}'` | — | Performance (per Part 14) | Internal |
| `avg_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `p95_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `error_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Error rate | Confidential |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability | Internal |
| `queue_depth_total` | BIGINT | Yes | `0` | ≥ 0 | Queues (per Part 14) | Internal |
| `queue_health` | JSONB | Yes | `'[]'` | — | Per queue | Internal |
| `api_health` | JSONB | Yes | `'{}'` | — | API (per Part 14) | Internal |
| `api_requests_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | RPS | Internal |
| `api_error_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | API errors | Confidential |
| `ai_jobs_running_count` | INTEGER | Yes | `0` | ≥ 0 | AI (per Part 14) jobs | Internal |
| `ai_jobs_queued_count` | INTEGER | Yes | `0` | ≥ 0 | Queued | Internal |
| `ai_model_health` | JSONB | Yes | `'{}'` | — | Model health | Confidential |
| `storage_used_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Storage (per Part 14) used | Internal |
| `storage_quota_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Quota | Confidential |
| `storage_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `storage_by_type` | JSONB | Yes | `'{}'` | — | DB, Documents, Logs, Backups | Internal |
| `security_alerts_active_count` | INTEGER | Yes | `0` | ≥ 0 | Security (per Part 14) | Restricted |
| `security_alerts_by_severity` | JSONB | Yes | `'{}'` | — | By severity | Restricted |
| `failed_login_attempts_today` | INTEGER | Yes | `0` | ≥ 0 | Failed logins | Confidential |
| `incidents_active_count` | INTEGER | Yes | `0` | ≥ 0 | Incidents | Restricted |
| `scheduled_maintenance_count` | INTEGER | Yes | `0` | ≥ 0 | Maintenance | Internal |
| `infrastructure_health` | JSONB | Yes | `'{}'` | — | Servers, DB, Cache | Internal |
| `application_health` | JSONB | Yes | `'{}'` | — | Per app | Internal |
| `database_health` | JSONB | Yes | `'{}'` | — | Per DB | Internal |
| `cache_health` | JSONB | Yes | `'{}'` | — | Cache | Internal |
| `event_bus_throughput` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Events/sec | Internal |
| `event_bus_failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed | Confidential |
| `dead_letter_queue_count` | INTEGER | Yes | `0` | ≥ 0 | DLQ | Confidential |
| `backup_status` | JSONB | Yes | `'{}'` | — | Last backup | Internal |
| `disaster_recovery_status` | JSONB | Yes | `'{}'` | — | DR | Confidential |
| `real_time_metrics` | JSONB | Yes | `'{}'` | — | Live metrics | Internal |
| `mission_control_view_url` | VARCHAR(500) | Yes | — | — | Live URL | Internal |
| `last_refreshed_at` | TIMESTAMPTZ | Yes | `now()` | — | Refresh | Internal |
| `refresh_frequency_seconds` | INTEGER | Yes | `15` | ≥ 5 | Refresh rate | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Restricted |
| `ai_predictions` | JSONB | No | NULL | — | AI predictions | Restricted |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 719 — Executive Dashboard

### 1. Business Purpose
Per Part 14 §12: Displays Revenue, Production, Inventory, Quality, HR, Maintenance, AI. C-suite dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `period_year` | INTEGER | Yes | — | — | Year | Internal |
| `period_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter | Internal |
| `revenue_summary` | JSONB | Yes | `'{}'` | — | Revenue (per Part 14) | Confidential |
| `revenue_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `revenue_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `revenue_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Growth | Confidential |
| `revenue_trend_12m` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `production_summary` | JSONB | Yes | `'{}'` | — | Production (per Part 14) | Internal |
| `production_volume_mtd` | DECIMAL(15,3) | Yes | `0` | ≥ 0 | Volume | Internal |
| `oee_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | OEE | Confidential |
| `production_trend_12m` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `inventory_summary` | JSONB | Yes | `'{}'` | — | Inventory (per Part 14) | Confidential |
| `inventory_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value | Confidential |
| `inventory_turnover_ratio` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Turnover | Confidential |
| `stockouts_count` | INTEGER | Yes | `0` | ≥ 0 | Stockouts | Internal |
| `quality_summary` | JSONB | Yes | `'{}'` | — | Quality (per Part 14) | Confidential |
| `quality_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance | Internal |
| `defect_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Defects | Confidential |
| `customer_complaints_count` | INTEGER | Yes | `0` | ≥ 0 | Complaints | Internal |
| `hr_summary` | JSONB | Yes | `'{}'` | — | HR (per Part 14) | Confidential |
| `headcount_total` | INTEGER | Yes | `0` | ≥ 0 | Headcount | Internal |
| `attrition_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attrition | Confidential |
| `payroll_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Payroll | Confidential |
| `employee_engagement_score` | DECIMAL(5,2) | No | NULL | 0-100 | Engagement | Confidential |
| `maintenance_summary` | JSONB | Yes | `'{}'` | — | Maintenance (per Part 14) | Confidential |
| `asset_availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability | Internal |
| `mtbf_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | MTBF | Confidential |
| `mttr_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | MTTR | Confidential |
| `maintenance_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `ai_summary` | JSONB | Yes | `'{}'` | — | AI (per Part 14) insights | Restricted |
| `ai_predictions_active_count` | INTEGER | Yes | `0` | ≥ 0 | Predictions | Internal |
| `ai_recommendations_count` | INTEGER | Yes | `0` | ≥ 0 | Recommendations | Internal |
| `ai_cost_savings_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Savings | Confidential |
| `overall_business_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall | Confidential |
| `health_score_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `strategic_initiatives_progress` | JSONB | Yes | `'[]'` | — | Initiatives | Confidential |
| `key_risks` | JSONB | Yes | `'[]'` | — | Risks | Restricted |
| `key_opportunities` | JSONB | Yes | `'[]'` | — | Opportunities | Confidential |
| `ai_strategic_insights` | JSONB | No | NULL | — | AI C-suite | Restricted |
| `executive_summary` | TEXT | Yes | — | Min 100 | Summary | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, PRESENTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 720 — Platform Analytics

### 1. Business Purpose
Per Part 14 §12: Measures Response Time, Errors, Availability, Storage, API Usage, Growth. Platform-level analytics.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | HOURLY, DAILY, WEEKLY, MONTHLY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_requests_today` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `total_requests_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `total_requests_ytd` | BIGINT | Yes | `0` | ≥ 0 | YTD | Internal |
| `avg_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Response Time (per Part 14) avg | Internal |
| `p50_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P50 | Internal |
| `p95_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `p99_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P99 | Internal |
| `errors_count_today` | BIGINT | Yes | `0` | ≥ 0 | Errors (per Part 14) | Confidential |
| `errors_count_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Confidential |
| `error_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rate | Confidential |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability (per Part 14) | Internal |
| `availability_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `downtime_minutes_today` | INTEGER | Yes | `0` | ≥ 0 | Downtime | Internal |
| `downtime_incidents_count` | INTEGER | Yes | `0` | ≥ 0 | Incidents | Confidential |
| `storage_used_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Storage (per Part 14) | Internal |
| `storage_quota_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Quota | Confidential |
| `storage_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `storage_by_type` | JSONB | Yes | `'{}'` | — | DB, Documents, Logs | Internal |
| `storage_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Growth | Internal |
| `api_usage_today` | BIGINT | Yes | `0` | ≥ 0 | API Usage (per Part 14) | Internal |
| `api_usage_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `api_usage_by_endpoint` | JSONB | Yes | `'[]'` | — | Top endpoints | Internal |
| `api_usage_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `user_growth_count` | INTEGER | Yes | `0` | — | Growth (per Part 14) — new users | Internal |
| `user_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Growth % | Internal |
| `total_users` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `active_users_mtd` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `transaction_volume_today` | BIGINT | Yes | `0` | ≥ 0 | Transactions | Internal |
| `transaction_volume_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `data_volume_processed_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Data | Internal |
| `cost_incurred_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `cost_incurred_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `trend_12m` | JSONB | Yes | `'[]'` | — | 12-month | Internal |
| `benchmark_comparison` | JSONB | No | NULL | — | Industry benchmark | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 14 — COMPLETE — Closeout Summary

## Enterprise Platform Services (EPS) Module — Final Status

| Attribute | Value |
|---|---|
| Module | Enterprise Platform Services (EPS) |
| Manual | 1 — Enterprise Data Dictionary |
| Part | 14 |
| Sections | 12 |
| Entities | 601–720 (120 entities) |
| Batches | 4 |
| Status | ✅ COMPLETE |
| Implementation Ready | YES |
| Architecture | LOCKED |

## Part 14 Batch Progression

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (Identity, RBAC, Configuration) | 601-630 | ✅ COMPLETE |
| Batch 2 | 4-6 (Workflow, Notification, Document) | 631-660 | ✅ COMPLETE |
| Batch 3 | 7-9 (Audit, Search, Identification) | 661-690 | ✅ COMPLETE |
| **Batch 4 (Final)** | **10-12 (API Gateway, Event Bus, Reporting)** | **691-720** | **✅ COMPLETE** |
| **TOTAL** | **12 Sections** | **120 Entities** | **✅ COMPLETE** |

## Platform Kernel Service Inventory (Q192 — LOCKED)

The complete Platform Kernel composition formalized by Q192:

### Identity & Security
- Identity Service (FS-1), Authentication, RBAC (FS-2), MFA, Policy Engine, Multi-Tenant Support

### Platform Core
- Configuration Engine (FS-6), Feature Flags (FS-46), Number Series Engine (FS-47), Workflow Engine (FS-3), Notification Engine (FS-4), Document Management (FS-11)

### Governance
- Audit Engine (FS-5), Compliance Framework, Activity Logs, Digital Evidence

### Discovery & Identification
- Enterprise Search (FS-48), Semantic Search, Barcode/QR/RFID Engine (FS-12), Identity Resolution Service (FS-53), Label Printing (FS-50)

### Integration
- API Gateway (FS-7), Webhook Engine, Integration Connectors, API Registry, Rate Limiting

### Asynchronous Processing
- Event Bus (FS-49), Queue Platform, Scheduler, Background Workers, Retry Policies, Dead Letter Queue

### Intelligence
- Reporting Engine, Dashboard Builder, BI Cube, KPI Library, Platform Mission Control, Executive Dashboard

### Automation
- Unified Enterprise Automation Engine (FS-52)

### AI (Part 15)
- AI Gateway (FS-51) — to be detailed in Part 15

## Foundation Services Final Count (Part 14 Complete)

**53 Foundation Services** (FS-1 through FS-53) + Platform Kernel (Q189/Q192) as meta-architecture.

## Architectural Decisions Locked (Part 14)

| Decision ID | Decision | Section |
|---|---|---|
| Q189 | Platform Kernel as Meta-Architecture | Sec 1 (Batch 1) |
| Q190 | Unified Enterprise Automation Engine | Sec 4 (Batch 2) |
| Q191 | Universal Identity Resolution Service | Sec 9 (Batch 3) |
| Q192 | Platform Core Kernel Complete Inventory | Sec 12 (Batch 4) |

**Cumulative Architectural Decisions**: 192 (Q1-Q192)

## Architectural Mandate (Q192 — LOCKED)

> Every business module — Inventory, Warehouse, Manufacturing, Retail, Restaurant, Finance, Workforce, Maintenance, CRM, Procurement, Supplier Portal, and Customer Portal — **must consume** these platform services rather than implementing their own versions.

**Benefits**:
1. SUOP significantly easier to maintain, scale, and evolve
2. True enterprise platform (not collection of modules)
3. Single source of truth for all cross-cutting concerns
4. Clean microservices migration path when scale demands
5. Future modules built faster (consume platform, focus on business logic)

## 16 AI Capabilities Locked (Batch 4)

| Section | AI Capabilities |
|---|---|
| API Gateway | API Failure Prediction, Traffic Forecast, Smart Routing, Integration Health |
| Event Bus | Job Optimization, Capacity Planning, Failure Prediction, Auto Scaling Recommendation |
| Reporting | Smart Dashboard, Report Recommendation, Auto KPI Detection, Narrative Reporting, Executive Summary |

## Part 14 Architecture Lock Summary

| Architecture Component | Status |
|---|---|
| Enterprise Identity Service | ✅ LOCKED |
| Multi-Provider Authentication | ✅ LOCKED |
| Session Management | ✅ LOCKED |
| Device Registry | ✅ LOCKED |
| Organization Service | ✅ LOCKED |
| Enterprise RBAC | ✅ LOCKED |
| Policy Engine (Zero Trust) | ✅ LOCKED |
| Approval Authority | ✅ LOCKED |
| API Security | ✅ LOCKED |
| Password Policy (Argon2id) | ✅ LOCKED |
| MFA Policy | ✅ LOCKED |
| Configuration Engine | ✅ LOCKED |
| Feature Flag Engine | ✅ LOCKED |
| Number Series Engine | ✅ LOCKED |
| Business Rules (DSL) | ✅ LOCKED |
| Localization | ✅ LOCKED |
| Theme Management | ✅ LOCKED |
| Multi-Tenant Settings | ✅ LOCKED |
| Environment Configuration | ✅ LOCKED |
| Enterprise Workflow Engine | ✅ LOCKED |
| Approval Matrix | ✅ LOCKED |
| Escalation Rules | ✅ LOCKED |
| Delegation | ✅ LOCKED |
| SLA Monitoring | ✅ LOCKED |
| Task-Driven UX | ✅ LOCKED |
| Enterprise Notification Engine | ✅ LOCKED |
| Multi-Channel Delivery | ✅ LOCKED |
| Alert Rules | ✅ LOCKED |
| Broadcast Messaging | ✅ LOCKED |
| Reminder Engine | ✅ LOCKED |
| Delivery Tracking | ✅ LOCKED |
| Enterprise Document Engine | ✅ LOCKED |
| Document Versioning | ✅ LOCKED |
| Digital Signatures | ✅ LOCKED |
| OCR Processing | ✅ LOCKED |
| File Retention Policy | ✅ LOCKED |
| Secure File Sharing | ✅ LOCKED |
| Enterprise Audit Engine | ✅ LOCKED |
| Compliance Framework | ✅ LOCKED |
| Digital Evidence Repository | ✅ LOCKED |
| Security Incident Management | ✅ LOCKED |
| Enterprise Search Engine | ✅ LOCKED |
| Semantic Search | ✅ LOCKED |
| Universal Identity Resolution | ✅ LOCKED |
| Barcode Engine | ✅ LOCKED |
| QR Code Engine | ✅ LOCKED |
| RFID Engine | ✅ LOCKED |
| Label Printing Engine | ✅ LOCKED |
| Mobile Scanning | ✅ LOCKED |
| API Gateway | ✅ LOCKED |
| Integration Hub | ✅ LOCKED |
| Webhook Engine | ✅ LOCKED |
| API Registry | ✅ LOCKED |
| Rate Limiting | ✅ LOCKED |
| Enterprise Event Bus | ✅ LOCKED |
| Queue Platform | ✅ LOCKED |
| Scheduler | ✅ LOCKED |
| Background Workers | ✅ LOCKED |
| Retry Policies | ✅ LOCKED |
| Dead Letter Queue | ✅ LOCKED |
| Enterprise Reporting Engine | ✅ LOCKED |
| Dashboard Builder | ✅ LOCKED |
| Print Engine | ✅ LOCKED |
| BI Platform | ✅ LOCKED |
| KPI Library | ✅ LOCKED |
| Platform Mission Control | ✅ LOCKED |
| Executive Dashboard | ✅ LOCKED |
| Platform Analytics | ✅ LOCKED |
| Unified Automation Engine | ✅ LOCKED |
| Platform Kernel (Meta-Architecture) | ✅ LOCKED |

---

# Volume 0.5 Manual 1 Progress — Part 14 COMPLETE

## Cumulative Manual 1 Status

| Part | Domain | Entities | Status |
|---|---|---|---|
| Part 1-2 | Foundation & Organization | 15 | ✅ |
| Part 3 | Product Master Data | 10 | ✅ |
| Part 4 | Inventory (Immutable Ledger) | 10 | ✅ |
| Part 5 | Procurement & Suppliers | 10 | ✅ |
| Part 6 | Warehouse (WMS) | 10 | ✅ |
| Part 7 | Manufacturing (MES) | 60 | ✅ |
| Part 8 | Quality (QMS) | 60 | ✅ |
| Part 9 | Retail Operations | 60 | ✅ |
| Part 10 | Restaurant Operations | 50 | ✅ |
| Part 11 | Finance & Accounting | 100 | ✅ |
| Part 12 | Enterprise Workforce Management | 130 | ✅ |
| Part 13 | Enterprise Asset & Maintenance Management | 90 | ✅ |
| **Part 14** | **Enterprise Platform Services** | **120** | **✅ COMPLETE** |
| Part 15 | Enterprise AI, Analytics & Mission Control | TBD | ⏳ PENDING (FINAL) |

**Manual 1 Cumulative**: **725 entities defined across 13 completed parts (Parts 1-14).**

## Chief Enterprise Architect Final Review — Part 14 ACCEPTED

The Enterprise Platform Services (EPS) module is **complete and implementation-ready**. All 120 entities across 12 sections are defined at full enterprise-grade depth. The platform provides the shared technical backbone for every business module — equivalent to AWS + Azure + SAP BTP + Microsoft Power Platform + Oracle Cloud Infrastructure, but purpose-built for SUOP.

## 🎯 Next: Part 15 — Enterprise AI, Analytics & Mission Control (FINAL ARCHITECTURE PART)

Per Chief Enterprise Architect: We now begin **Part 15 — Enterprise AI, Analytics & Mission Control**, the final architectural volume.

**Part 15 Will Include**:
- Enterprise AI Gateway
- AI Copilot Framework
- Enterprise Knowledge Base
- Analytics Platform
- Data Warehouse
- Data Lake
- Machine Learning Platform
- Digital Twin
- Predictive Intelligence
- Executive Mission Control
- Enterprise KPI Framework
- Cross-Module AI Automation

**Once Part 15 is complete, Volume 0.5 will be fully finished**, and the recommendation will be to **freeze the architecture** and transition into **Volume 1: Development Blueprint** and implementation.

---

*End of Manual 1 Part 14. Part 14 is COMPLETE. Next: Part 15 — Enterprise AI, Analytics & Mission Control (the final architectural volume).*
