# Manual 1 · Part 15 · Sections 1-3 · Entities 721-750 — AI Gateway, Knowledge Graph & Copilot Framework

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 15 — Enterprise AI, Analytics & Mission Control Platform (EAMP) |
| Sections | 1 (Enterprise AI Gateway & AI Service Platform), 2 (Enterprise Knowledge Graph, Knowledge Base & Semantic Intelligence), 3 (Enterprise AI Copilot Framework & Natural Language Platform) |
| Entities | 721–750 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.10, Part 15 §1-3 |
| Last Updated | 2026-07-08 |
| Importance | **HIGHEST — Final architectural volume; Enterprise Intelligence Layer above all business modules** |

---

## Overview — The Enterprise Intelligence Layer

Part 15 is the **final architectural volume** of SUOP. This is **not another module** — it is the **Enterprise Intelligence Layer** that sits **above every business module**.

Per Chief Enterprise Architect: "Think of it as the equivalent of **Microsoft Fabric + SAP Joule + Microsoft Copilot + Oracle Analytics + Palantir Foundry + Databricks**, but purpose-built for SUOP."

```
AI GATEWAY (Sec 1: 721-730)
  Business Modules → AI Gateway → Prompt Engine → Model Router → LLM Providers → Enterprise AI Services → Audit → Response
  ↑ Fed by
KNOWLEDGE GRAPH (Sec 2: 731-740)
  ERP Data → Knowledge Engine → Knowledge Graph → Semantic Layer → Enterprise Search → AI Context
  ↑ Surfaced via
AI COPILOT (Sec 3: 741-750)
  User → AI Copilot → Intent Detection → Permission Validation → Knowledge Context → Business Module → Response → Suggested Actions
```

### 🏆 Architectural Lock: Unified Enterprise AI Orchestrator (Q193)

Per Chief Enterprise Architect's **highest-level AI decision** recommendation, the **Unified Enterprise AI Orchestrator** is hereby locked as **Architectural Decision Q193** and **Foundation Service #54**. This orchestrator sits **above** the AI Gateway, coordinating AI capabilities across the entire enterprise.

**Problem Solved**: Instead of AI features being scattered across modules with inconsistent governance, all AI capabilities flow through one orchestration layer that enforces consistency, security, and auditability.

**Locked Architecture**:
```
User Request
      │
      ▼
AI Orchestrator (FS-54, Q193)
      │
────────┼────────
│       │       │
Knowledge  Copilot  Business Tools
Engine     Engine   & Workflows
│       │       │
Context  Reasoning  Actions
│       │       │
AI Gateway
      │
Model Router
      │
LLMs
```

**Orchestrator Responsibilities (Locked)**:
1. **Select the appropriate AI model** based on the task (routing to OpenAI/Anthropic/Gemini/local based on capability, cost, latency)
2. **Gather context from the Knowledge Graph and business modules** (Context Builder integration)
3. **Enforce security and permissions** before AI accesses enterprise data (RBAC + Data Access Policy integration)
4. **Route requests to the correct module or workflow** (intent-based routing)
5. **Coordinate multi-step business actions** (e.g., create PO → notify manager → reserve inventory)
6. **Maintain complete auditability** of AI-assisted decisions (full audit trail)

**Architectural Benefits (Locked)**:
1. SUOP's AI capabilities **consistent, secure, and scalable** across every module
2. Centralized AI governance (model selection, cost control, policy enforcement)
3. Unified auditability of all AI-assisted decisions
4. Clean separation: AI Orchestrator (coordination) vs AI Gateway (model invocation)
5. Multi-step action orchestration with rollback support
6. Future-proof: new AI capabilities added at orchestrator level, not per-module

**Governance**: Owned by Platform Kernel team (per Q189/Q192). Business modules call `AIOrchestrator.execute(request)` — they never directly invoke LLMs or AI services.

---

# SECTION 1: Enterprise AI Gateway & AI Service Platform (Entities 721-730)

## Entity 721 — AI Gateway

### 1. Business Purpose
Per Part 15 §1: Stores AI Request, Module, User, Model, Tokens, Cost, Latency. The single entry point for all AI service invocations.

### 2. Architectural Role
**Foundational AI gateway entity** — per Vol 0: "Artificial Intelligence is **not** a feature. It is a shared enterprise platform. Every module should consume AI through one centralized AI Gateway." Implements AI Gateway pattern (FS-51).

### 3. Business Rules
- All AI requests flow through AI Gateway (no direct LLM calls from modules)
- Gateway responsibilities: prompt validation, model routing, cost tracking, audit logging, failover
- Multi-provider: OpenAI, Azure OpenAI, Anthropic, Google Gemini, Local LLM, future models
- Model-agnostic: modules request capability (e.g., "text generation"), not specific model
- Cost monitoring: per-request, per-user, per-module, per-tenant cost tracking
- Human approval: high-cost or sensitive requests require approval
- Offline fallback: local LLM fallback if cloud providers unavailable
- Secure context injection: enterprise context injected safely (no prompt injection)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `gateway_request_id` | VARCHAR(100) | Yes | — | Unique enterprise-wide | AI Request (per Part 15) — display ID | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module (per Part 15) | Internal |
| `request_type` | ENUM | Yes | — | TEXT_GENERATION, TEXT_SUMMARIZATION, QUESTION_ANSWERING, CODE_GENERATION, IMAGE_GENERATION, IMAGE_ANALYSIS, EMBEDDING, CLASSIFICATION, TRANSLATION, TRANSCRIPTION, OTHER | Type | Internal |
| `caller_identity_id` | UUID | Yes | — | FK to `identity_master` (Entity 601) | User (per Part 15) | Confidential |
| `caller_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `caller_session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `request_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Request time | Internal |
| `prompt_text` | TEXT | Yes | — | Min 1 | Input prompt | Confidential |
| `system_prompt_id` | UUID | No | NULL | FK to `prompt_library` (Entity 723) | System prompt | Internal |
| `context_data` | JSONB | Yes | `'{}'` | — | Injected context | Confidential |
| `model_id` | UUID | Yes | — | FK to `ai_model_registry` (Entity 722) | Model (per Part 15) used | Internal |
| `model_provider` | VARCHAR(100) | Yes | — | — | Provider | Internal |
| `model_name` | VARCHAR(100) | Yes | — | — | Model name | Internal |
| `model_version` | VARCHAR(50) | Yes | — | — | Version | Internal |
| `model_routing_reason` | TEXT | No | NULL | — | Why this model | Internal |
| `parameters` | JSONB | Yes | `'{}'` | — | { temperature, max_tokens, top_p, ... } | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `prompt_tokens` | INTEGER | Yes | `0` | ≥ 0 | Prompt tokens | Internal |
| `completion_tokens` | INTEGER | Yes | `0` | ≥ 0 | Completion tokens | Internal |
| `total_tokens` | INTEGER | Yes | `0` | ≥ 0 | Tokens (per Part 15) total | Internal |
| `cost_per_token_prompt` | DECIMAL(10,6) | Yes | `0` | ≥ 0 | Cost/token prompt | Confidential |
| `cost_per_token_completion` | DECIMAL(10,6) | Yes | `0` | ≥ 0 | Cost/token completion | Confidential |
| `total_cost` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost (per Part 15) | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency (USD for AI APIs) | Internal |
| `latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Latency (per Part 15) | Internal |
| `request_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Request size | Internal |
| `response_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Response size | Internal |
| `provider_request_id` | VARCHAR(200) | No | NULL | — | Provider's request ID | Confidential |
| `provider_response_code` | INTEGER | No | NULL | — | HTTP status | Internal |
| `failover_triggered` | BOOLEAN | Yes | `false` | — | Failover happened | Internal |
| `failover_from_model_id` | UUID | No | NULL | FK to `ai_model_registry` | Original model | Internal |
| `failover_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `approval_required` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `approval_status` | ENUM | Yes | `NOT_REQUIRED` | NOT_REQUIRED, PENDING, APPROVED, REJECTED | Status | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `policy_id` | UUID | Yes | — | FK to `ai_policy` (Entity 728) | Applied policy | Internal |
| `audit_id` | UUID | Yes | — | FK to `ai_audit` (Entity 729) | Audit record | Confidential |
| `sensitive_data_detected` | BOOLEAN | Yes | `false` | — | Sensitive data in prompt | Confidential |
| `sensitive_data_redacted` | BOOLEAN | Yes | `false` | — | Redacted before send | Confidential |
| `correlation_id` | UUID | No | NULL | — | Cross-service | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `PENDING` | PENDING, PROCESSING, COMPLETED, FAILED, TIMEOUT, CANCELLED, APPROVAL_PENDING | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| AI Model Registry (722) | Many-to-One | N:1 | Model used |
| Prompt Library (723) | Many-to-One | N:1 | System prompt |
| AI Request (725) | One-to-One | 1:1 | Source request |
| AI Response (726) | One-to-One | 1:1 | Generated response |
| Token Usage (727) | One-to-One | 1:1 | Token tracking |
| AI Policy (728) | Many-to-One | N:1 | Applied policy |
| AI Audit (729) | One-to-One | 1:1 | Audit record |

### 6. Indexes
- UNIQUE (`gateway_request_id`)
- INDEX (`business_module`, `request_timestamp`)
- INDEX (`caller_identity_id`, `request_timestamp`)
- INDEX (`model_id`, `request_timestamp`)
- INDEX (`current_status`, `request_timestamp`)
- INDEX (`request_timestamp`, `total_cost`)
- INDEX (`failover_triggered`) WHERE `failover_triggered = true`

### 7. Security Classification
**Confidential** — prompts and cost data; sensitive data detection is **Restricted**.

### 8. Integration Points
- **AI Gateway** (FS-51): Primary implementation
- **Unified Enterprise AI Orchestrator** (FS-54, Q193): Caller
- **All Business Modules**: AI service requests
- **Audit Engine** (FS-5): AI request audit
- **Cost Management**: Token/cost tracking

### 9. Sample Data
```json
{
  "gateway_request_id": "AI-REQ-2026-07-00123456", "business_module": "PROCUREMENT",
  "request_type": "QUESTION_ANSWERING", "caller_identity_id": "id-100",
  "request_timestamp": "2026-07-08T10:30:00Z",
  "prompt_text": "Analyze this PO and recommend if we should approve based on vendor history",
  "model_id": "model-gpt4-turbo", "model_provider": "OpenAI",
  "model_name": "gpt-4-turbo", "model_version": "2024-04-09",
  "parameters": { "temperature": 0.3, "max_tokens": 1000 },
  "priority": "NORMAL", "prompt_tokens": 850, "completion_tokens": 420,
  "total_tokens": 1270, "cost_per_token_prompt": 0.000010,
  "cost_per_token_completion": 0.000030, "total_cost": 0.021100,
  "currency_code": "USD", "latency_ms": 2450,
  "approval_required": false, "approval_status": "NOT_REQUIRED",
  "current_status": "COMPLETED"
}
```

### 10. Audit Events
`AI_REQUEST_RECEIVED`, `AI_REQUEST_PROCESSING_STARTED`, `AI_REQUEST_COMPLETED`, `AI_REQUEST_FAILED`, `AI_REQUEST_FAILOVER_TRIGGERED`, `AI_REQUEST_APPROVAL_REQUIRED`, `AI_REQUEST_APPROVED`, `AI_REQUEST_REJECTED`, `AI_REQUEST_TIMEOUT`, `AI_REQUEST_CANCELLED`

---

## Entity 722 — AI Model Registry

### 1. Business Purpose
Per Part 15 §1: Supports OpenAI, Azure OpenAI, Anthropic, Google Gemini, Local LLM, Future Models. Multi-provider AI model registry.

### 2. Architectural Role
Master entity — registry of all AI models available to SUOP. The Model Router uses this to select appropriate models per request.

### 3. Business Rules
- Model providers: OpenAI, Azure OpenAI, Anthropic, Google Gemini, Local LLM (Ollama/vLLM), Custom
- Model capabilities: TEXT_GENERATION, VISION, CODE, EMBEDDING, FUNCTION_CALLING, REASONING, MULTIMODAL
- Cost tracking: per-model pricing (prompt vs completion tokens)
- Rate limits: per-provider API limits enforced
- Health monitoring: model availability and latency tracked
- Fallback chains: primary → secondary → tertiary models
- A/B testing: champion-challenger model comparison

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `model_id_external` | VARCHAR(100) | Yes | — | Unique | External model ID | Internal |
| `model_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `model_display_name` | VARCHAR(200) | Yes | — | — | User-facing name | Internal |
| `model_description` | TEXT | No | NULL | — | Description | Internal |
| `provider` | ENUM | Yes | — | OPENAI, AZURE_OPENAI, ANTHROPIC, GOOGLE_GEMINI, LOCAL_LLM, COHERE, MISTRAL, HUGGINGFACE, CUSTOM | Provider (per Part 15) | Internal |
| `model_family` | VARCHAR(100) | Yes | — | — | Family (e.g., GPT-4, Claude 3) | Internal |
| `model_version` | VARCHAR(50) | Yes | — | — | Version | Internal |
| `api_endpoint` | VARCHAR(500) | Yes | — | — | API URL | Confidential |
| `api_key_encrypted` | TEXT | Yes | — | — | Encrypted API key | Restricted |
| `encryption_key_id` | UUID | Yes | — | FK to `security_keys` | Key | Restricted |
| `capabilities` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | TEXT_GENERATION, TEXT_SUMMARIZATION, QUESTION_ANSWERING, CODE_GENERATION, IMAGE_GENERATION, IMAGE_ANALYSIS, EMBEDDING, CLASSIFICATION, TRANSLATION, TRANSCRIPTION, FUNCTION_CALLING, REASONING, MULTIMODAL, VISION | Capabilities | Internal |
| `context_window_tokens` | INTEGER | Yes | — | > 0 | Context window | Internal |
| `max_output_tokens` | INTEGER | Yes | — | > 0 | Max output | Internal |
| `supports_streaming` | BOOLEAN | Yes | `true` | — | Streaming | Internal |
| `supports_function_calling` | BOOLEAN | Yes | `false` | — | Function calling | Internal |
| `supports_vision` | BOOLEAN | Yes | `false` | — | Vision | Internal |
| `supports_json_mode` | BOOLEAN | Yes | `false` | — | JSON mode | Internal |
| `cost_per_token_prompt` | DECIMAL(10,6) | Yes | `0` | ≥ 0 | Cost/token prompt | Confidential |
| `cost_per_token_completion` | DECIMAL(10,6) | Yes | `0` | ≥ 0 | Cost/token completion | Confidential |
| `cost_per_image` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Per image | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `rate_limit_per_minute` | INTEGER | Yes | `60` | ≥ 1 | Rate limit | Internal |
| `rate_limit_per_day` | INTEGER | Yes | `10000` | ≥ 1 | Daily | Internal |
| `concurrent_requests_limit` | INTEGER | Yes | `10` | ≥ 1 | Concurrent | Internal |
| `avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg latency | Internal |
| `p95_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability | Internal |
| `health_status` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, UNHEALTHY, OFFLINE | Health | Internal |
| `last_health_check_at` | TIMESTAMPTZ | Yes | `now()` | — | Last check | Internal |
| `is_primary` | BOOLEAN | Yes | `false` | — | Primary for capability | Internal |
| `fallback_model_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Fallbacks | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Routing priority | Internal |
| `data_residency` | VARCHAR(50) | No | NULL | — | Where data processed | Confidential |
| `data_retention_provider_days` | INTEGER | Yes | `0` | ≥ 0 | Provider retention | Confidential |
| `training_data_cutoff` | DATE | No | NULL | — | Knowledge cutoff | Internal |
| `compliance_certifications` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | SOC2, ISO27001 | Internal |
| `data_processing_agreement` | BOOLEAN | Yes | `false` | — | DPA signed | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| AI Gateway (721) | One-to-Many | 1:N | Requests using this model |
| Self (722) | Self-reference | N:N | Fallback chains |

### 6. Indexes
- UNIQUE (`model_id_external`)
- INDEX (`provider`, `status`)
- INDEX (`health_status`)
- GIN INDEX (`capabilities`)

### 7. Security Classification
**Restricted** — API keys; cost and residency data is **Confidential**.

### 8. Integration Points
- **AI Gateway** (FS-51): Model selection
- **Unified Enterprise AI Orchestrator** (FS-54, Q193): Model routing
- **Cost Management**: Pricing
- **Health Monitoring**: Availability tracking

### 9. Sample Data
```json
{
  "model_id_external": "gpt-4-turbo-2024-04-09", "model_name": "gpt-4-turbo",
  "model_display_name": "GPT-4 Turbo", "provider": "OPENAI",
  "model_family": "GPT-4", "model_version": "2024-04-09",
  "capabilities": ["TEXT_GENERATION", "QUESTION_ANSWERING", "FUNCTION_CALLING", "VISION", "CODE_GENERATION"],
  "context_window_tokens": 128000, "max_output_tokens": 4096,
  "supports_streaming": true, "supports_function_calling": true, "supports_vision": true,
  "cost_per_token_prompt": 0.000010, "cost_per_token_completion": 0.000030,
  "currency_code": "USD", "rate_limit_per_minute": 500,
  "avg_latency_ms": 2100, "availability_pct": 99.50,
  "health_status": "HEALTHY", "is_primary": true, "priority": 10,
  "data_residency": "US", "status": "ACTIVE"
}
```

### 10. Audit Events
`AI_MODEL_REGISTERED`, `AI_MODEL_UPDATED`, `AI_MODEL_DEPLOYED`, `AI_MODEL_DEACTIVATED`, `AI_MODEL_HEALTH_DEGRADED`, `AI_MODEL_HEALTH_RECOVERED`, `AI_MODEL_DEPRECATED`, `AI_MODEL_API_KEY_ROTATED`

---

## Entity 723 — Prompt Library

### 1. Business Purpose
Per Part 15 §1: Stores System Prompts, Business Prompts, Workflow Prompts, Approval Prompts, Report Prompts. Centralized prompt management.

### 2. Architectural Role
Master entity — versioned prompt templates. Enables prompt engineering without code changes (per Vol 0 Configuration-Driven principle).

### 3. Business Rules
- Prompt types: SYSTEM (foundation), BUSINESS (per-module), WORKFLOW (process-driven), APPROVAL (decision), REPORT (analytics), COPILOT (user-facing)
- Variables: `{{user.name}}`, `{{entity.code}}`, `{{context.data}}`
- Versioning: prompts versioned with rollback support
- A/B testing: variant prompts for optimization
- Approval: prompts require approval before production
- Localization: prompts per language
- Testing: sandbox testing before deployment

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prompt_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `prompt_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `prompt_description` | TEXT | No | NULL | — | Description | Internal |
| `prompt_type` | ENUM | Yes | — | SYSTEM, BUSINESS, WORKFLOW, APPROVAL, REPORT, COPILOT, FUNCTION_CALLING, OTHER | Type (per Part 15) | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `prompt_category` | VARCHAR(100) | No | NULL | — | Category | Internal |
| `system_prompt` | TEXT | No | NULL | — | System prompts (per Part 15) | Confidential |
| `user_prompt_template` | TEXT | Yes | — | Min 10 | User prompt template | Confidential |
| `variables` | JSONB | Yes | `'[]'` | — | [{ name, type, required, default, description }] | Internal |
| `example_input` | TEXT | No | NULL | — | Example | Internal |
| `example_output` | TEXT | No | NULL | — | Example output | Internal |
| `expected_behavior` | TEXT | No | NULL | — | Expected | Internal |
| `default_model_id` | UUID | No | NULL | FK to `ai_model_registry` (Entity 722) | Default model | Internal |
| `alternative_model_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Alternatives | Internal |
| `default_parameters` | JSONB | Yes | `'{}'` | — | { temperature, max_tokens, ... } | Internal |
| `max_tokens_limit` | INTEGER | No | NULL | > 0 | Token limit | Internal |
| `temperature_default` | DECIMAL(3,2) | Yes | `0.70` | 0-2 | Temperature | Internal |
| `localization_overrides` | JSONB | No | NULL | — | Per-language | Internal |
| `supported_languages` | TEXT[] | Yes | `ARRAY['en']` | — | Languages | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `prompt_library` (self) | Previous | Internal |
| `ab_testing_enabled` | BOOLEAN | Yes | `false` | — | A/B test | Internal |
| `ab_variants` | JSONB | No | NULL | — | Variants | Confidential |
| `tested_in_sandbox` | BOOLEAN | Yes | `false` | — | Tested | Internal |
| `sandbox_test_results` | JSONB | No | NULL | — | Results | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `usage_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total uses | Internal |
| `usage_count_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `avg_cost_per_use` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Avg cost | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, TESTING, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| AI Model Registry (722) | Many-to-One | N:1 | Default model |
| Prompt Version (724) | One-to-Many | 1:N | Versions |
| Self (723) | Self-reference | N:1 | Previous version |

### 6. Indexes
- UNIQUE (`prompt_code`)
- INDEX (`prompt_type`, `business_module`, `status`)
- INDEX (`is_latest_version`, `status`)

### 7. Security Classification
**Confidential** — prompt templates are valuable IP.

### 8. Integration Points
- **AI Gateway** (FS-51): Prompt loading
- **Unified Enterprise AI Orchestrator** (FS-54, Q193): Prompt selection
- **AI Copilot** (Sec 3): Copilot prompts
- **All Business Modules**: Module-specific prompts

### 9. Sample Data
```json
{
  "prompt_code": "PMT-PO-ANALYSIS-V1", "prompt_name": "Purchase Order Analysis",
  "prompt_type": "APPROVAL", "business_module": "PROCUREMENT",
  "system_prompt": "You are an expert procurement analyst. Analyze PO and recommend approval based on vendor history, pricing trends, and budget.",
  "user_prompt_template": "Analyze PO {{po.code}} from vendor {{po.vendor}} for amount {{po.amount}}. Vendor history: {{vendor.history}}. Recommend APPROVE or REJECT with reasoning.",
  "variables": [
    { "name": "po.code", "type": "STRING", "required": true },
    { "name": "po.vendor", "type": "STRING", "required": true },
    { "name": "po.amount", "type": "DECIMAL", "required": true },
    { "name": "vendor.history", "type": "JSON", "required": true }
  ],
  "default_model_id": "model-gpt4-turbo",
  "default_parameters": { "temperature": 0.3, "max_tokens": 1000 },
  "version": "1.0", "is_latest_version": true, "tested_in_sandbox": true,
  "usage_count_total": 12450, "success_rate_pct": 92.50,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`PROMPT_CREATED`, `PROMPT_UPDATED`, `PROMPT_VERSION_PUBLISHED`, `PROMPT_APPROVED`, `PROMPT_SANDBOX_TESTED`, `PROMPT_DEPLOYED`, `PROMPT_DEPRECATED`, `PROMPT_ROLLBACK_PERFORMED`

---

## Entity 724 — Prompt Version

### 1. Business Purpose
Per Part 15 §1: Tracks Version, Author, Approval, Effective Date, Rollback. Prompt version history.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prompt_library_id` | UUID | Yes | — | FK to `prompt_library` (Entity 723) | Parent prompt | Internal |
| `version_number` | VARCHAR(20) | Yes | — | — | Version (per Part 15) | Internal |
| `version_sequence` | INTEGER | Yes | — | ≥ 1 | Sequence | Internal |
| `is_current_version` | BOOLEAN | Yes | `false` | — | Current | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `prompt_version` (self) | Previous (per Part 15) | Internal |
| `prompt_content` | TEXT | Yes | — | — | Full prompt content | Confidential |
| `system_prompt_content` | TEXT | No | NULL | — | System prompt | Confidential |
| `variables_config` | JSONB | Yes | `'[]'` | — | Variables | Internal |
| `change_description` | TEXT | Yes | — | Min 10 | What changed | Confidential |
| `change_reason` | TEXT | No | NULL | — | Why changed | Confidential |
| `author_identity_id` | UUID | Yes | — | FK to `identity_master` | Author (per Part 15) | Confidential |
| `author_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `created_at` | TIMESTAMPTZ | Yes | `now()` | — | Creation | Internal |
| `submitted_for_approval_at` | TIMESTAMPTZ | No | NULL | — | Submitted | Internal |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, PUBLISHED | Approval (per Part 15) | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `rejection_reason` | TEXT | No | NULL | — | If rejected | Confidential |
| `effective_date` | DATE | Yes | — | — | Effective Date (per Part 15) | Internal |
| `published_at` | TIMESTAMPTZ | No | NULL | — | Published | Internal |
| `rollback_from_version_id` | UUID | No | NULL | FK to `prompt_version` | Rolled back from | Internal |
| `rollback_performed_at` | TIMESTAMPTZ | No | NULL | — | Rollback (per Part 15) | Internal |
| `rollback_performed_by` | UUID | No | NULL | FK to `identity_master` | Rolled back by | Confidential |
| `rollback_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `usage_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total uses | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING, APPROVED, PUBLISHED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 725 — AI Request

### 1. Business Purpose
Per Part 15 §1: Stores Question, Context, Module, Priority, Status. The source AI request from business modules.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `request_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `gateway_request_id` | UUID | Yes | — | FK to `ai_gateway` (Entity 721) | Linked gateway | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module (per Part 15) | Internal |
| `requester_identity_id` | UUID | Yes | — | FK to `identity_master` | Requester | Confidential |
| `request_question` | TEXT | Yes | — | Min 1 | Question (per Part 15) | Confidential |
| `request_purpose` | TEXT | Yes | — | Min 10 | Purpose | Confidential |
| `business_context` | JSONB | Yes | `'{}'` | — | Context (per Part 15) | Confidential |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Priority (per Part 15) | Internal |
| `requested_at` | TIMESTAMPTZ | Yes | `now()` | — | Request time | Internal |
| `requested_action` | VARCHAR(200) | No | NULL | — | Specific action | Internal |
| `expected_response_type` | ENUM | Yes | `TEXT` | TEXT, JSON, STRUCTURED, REPORT, RECOMMENDATION, EXPLANATION | Expected | Internal |
| `permission_validated` | BOOLEAN | Yes | `true` | — | Permission checked | Internal |
| `permission_denied_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `policy_applied_id` | UUID | Yes | — | FK to `ai_policy` (Entity 728) | Policy | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `PENDING` | PENDING, PROCESSING, COMPLETED, FAILED, PERMISSION_DENIED, CANCELLED | Status (per Part 15) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 726 — AI Response

### 1. Business Purpose
Per Part 15 §1: Stores Response, Confidence, Sources, Execution Time, Approval Status. AI-generated responses.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `response_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `ai_request_id` | UUID | Yes | — | FK to `ai_request` (Entity 725) | Source request | Internal |
| `gateway_request_id` | UUID | Yes | — | FK to `ai_gateway` (Entity 721) | Gateway | Internal |
| `response_text` | TEXT | Yes | — | — | Response (per Part 15) | Confidential |
| `response_structured` | JSONB | No | NULL | — | Structured response | Confidential |
| `response_format` | ENUM | Yes | `TEXT` | TEXT, JSON, MARKDOWN, HTML, STRUCTURED | Format | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence (per Part 15) | Internal |
| `confidence_level` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, VERY_HIGH | Level | Internal |
| `sources` | JSONB | Yes | `'[]'` | — | Sources (per Part 15) — [{ type, reference, url }] | Confidential |
| `citations` | JSONB | No | NULL | — | Citation Engine links | Internal |
| `execution_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Execution Time (per Part 15) | Internal |
| `model_used` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `tokens_used` | INTEGER | Yes | `0` | ≥ 0 | Tokens | Internal |
| `cost_incurred` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `approval_status` | ENUM | Yes | `NOT_REQUIRED` | NOT_REQUIRED, PENDING, APPROVED, REJECTED, AUTO_APPROVED | Approval Status (per Part 15) | Internal |
| `approval_required` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `rejection_reason` | TEXT | No | NULL | — | If rejected | Confidential |
| `human_review_required` | BOOLEAN | Yes | `false` | — | Human review | Internal |
| `reviewed_by` | UUID | No | NULL | FK to `identity_master` | Reviewer | Confidential |
| `reviewed_at` | TIMESTAMPTZ | No | NULL | — | Review | Internal |
| `review_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `user_feedback` | ENUM | No | NULL | POSITIVE, NEGATIVE, NEUTRAL | Feedback | Internal |
| `user_feedback_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `action_taken` | VARCHAR(200) | No | NULL | — | Action taken by user | Internal |
| `explanation_id` | UUID | No | NULL | FK to `ai_explanation` (Entity 749) | Explanation | Internal |
| `generated_at` | TIMESTAMPTZ | Yes | `now()` | — | Generation | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `GENERATED` | GENERATING, GENERATED, APPROVED, REJECTED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 727 — Token Usage

### 1. Business Purpose
Per Part 15 §1: Measures Prompt Tokens, Completion Tokens, Daily Usage, Monthly Cost. Token consumption tracking.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `usage_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | HOURLY, DAILY, MONTHLY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `model_id` | UUID | No | NULL | FK to `ai_model_registry` (Entity 722) | Model | Internal |
| `provider` | VARCHAR(100) | No | NULL | — | Provider | Internal |
| `identity_id` | UUID | No | NULL | FK to `identity_master` | User | Confidential |
| `prompt_tokens` | BIGINT | Yes | `0` | ≥ 0 | Prompt Tokens (per Part 15) | Internal |
| `completion_tokens` | BIGINT | Yes | `0` | ≥ 0 | Completion Tokens (per Part 15) | Internal |
| `total_tokens` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `requests_count` | BIGINT | Yes | `0` | ≥ 0 | Requests | Internal |
| `cost_prompt_tokens` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `cost_completion_tokens` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `total_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `budget_allocated` | DECIMAL(18,4) | No | NULL | ≥ 0 | Budget | Confidential |
| `budget_utilized_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Confidential |
| `budget_remaining` | DECIMAL(18,4) | No | NULL | — | Remaining | Confidential |
| `budget_alert_threshold_pct` | DECIMAL(5,2) | Yes | `80.00` | 0-100 | Alert | Internal |
| `budget_alert_sent` | BOOLEAN | Yes | `false` | — | Alert sent | Internal |
| `cost_per_request_avg` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Avg cost | Confidential |
| `tokens_per_request_avg` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Avg tokens | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `monthly_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Monthly Cost (per Part 15) | Confidential |
| `daily_usage` | BIGINT | Yes | `0` | ≥ 0 | Daily Usage (per Part 15) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 728 — AI Policy

### 1. Business Purpose
Per Part 15 §1: Controls Allowed Models, Sensitive Data, Approval Rules, Maximum Cost. AI governance policies.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `policy_description` | TEXT | No | NULL | — | Description | Internal |
| `policy_category` | ENUM | Yes | — | MODEL_ACCESS, DATA_PROTECTION, COST_CONTROL, APPROVAL_GOVERNANCE, CONTENT_FILTERING, USAGE_RESTRICTION, COMPLIANCE | Category | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_roles` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `applicable_identity_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific users | Confidential |
| `allowed_model_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Allowed Models (per Part 15) | Confidential |
| `denied_model_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Denied | Confidential |
| `allowed_capabilities` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Allowed capabilities | Internal |
| `denied_capabilities` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Denied | Internal |
| `sensitive_data_handling` | ENUM | Yes | `BLOCK` | ALLOW, BLOCK, REDACT, ANONYMIZE, HASH | Sensitive Data (per Part 15) | Confidential |
| `sensitive_data_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PII, PCI, PHI, FINANCIAL, HR_DATA, SALARY, PERSONAL | Types | Confidential |
| `redaction_rules` | JSONB | No | NULL | — | Redaction config | Confidential |
| `approval_required_threshold_cost` | DECIMAL(10,4) | No | NULL | ≥ 0 | Cost threshold | Confidential |
| `approval_required_threshold_tokens` | INTEGER | No | NULL | ≥ 0 | Token threshold | Internal |
| `approval_authority_role_id` | UUID | No | NULL | FK to `role_master` | Approver | Confidential |
| `approval_workflow_id` | UUID | No | NULL | FK to `workflow_definition` | Workflow | Internal |
| `max_cost_per_request` | DECIMAL(10,4) | Yes | `1.0000` | ≥ 0 | Maximum Cost (per Part 15) per request | Confidential |
| `max_cost_per_day` | DECIMAL(18,4) | Yes | `100.0000` | ≥ 0 | Per day | Confidential |
| `max_cost_per_month` | DECIMAL(18,4) | Yes | `1000.0000` | ≥ 0 | Per month | Confidential |
| `max_tokens_per_request` | INTEGER | Yes | `10000` | ≥ 1 | Max tokens | Internal |
| `max_requests_per_day` | INTEGER | Yes | `1000` | ≥ 1 | Max requests | Internal |
| `content_filtering_enabled` | BOOLEAN | Yes | `true` | — | Filter content | Internal |
| `content_filter_categories` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | HATE, VIOLENCE, SEXUAL, SELF_HARM, HARASSMENT, ILLEGAL | Categories | Internal |
| `data_residency_required` | BOOLEAN | Yes | `false` | — | Residency | Confidential |
| `allowed_data_residency` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Countries | Confidential |
| `audit_all_requests` | BOOLEAN | Yes | `true` | — | Audit all | Internal |
| `audit_sensitive_only` | BOOLEAN | Yes | `false` | — | Sensitive only | Internal |
| `human_in_loop_required` | BOOLEAN | Yes | `false` | — | Human review | Internal |
| `human_in_loop_scenarios` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | When required | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 729 — AI Audit

### 1. Business Purpose
Per Part 15 §1: Tracks Prompt, Response, User, Decision, Timestamp. Immutable AI audit trail.

### 2. Architectural Role
Append-only audit entity — every AI request/response logged. Critical for AI governance and compliance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `audit_partition_key` | VARCHAR(20) | Yes | — | — | Partition (YYYY-MM) | Internal |
| `gateway_request_id` | UUID | Yes | — | FK to `ai_gateway` (Entity 721) | Gateway | Internal |
| `ai_request_id` | UUID | Yes | — | FK to `ai_request` (Entity 725) | Request | Internal |
| `ai_response_id` | UUID | No | NULL | FK to `ai_response` (Entity 726) | Response | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `prompt_snapshot` | TEXT | Yes | — | — | Prompt (per Part 15) — full snapshot | Confidential |
| `prompt_redacted` | TEXT | No | NULL | — | Redacted version | Confidential |
| `response_snapshot` | TEXT | No | NULL | — | Response (per Part 15) — full snapshot | Confidential |
| `model_used` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `provider` | VARCHAR(100) | Yes | — | — | Provider | Internal |
| `user_identity_id` | UUID | Yes | — | FK to `identity_master` | User (per Part 15) | Confidential |
| `user_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `user_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `decision` | ENUM | No | NULL | APPROVED, REJECTED, AUTO_APPROVED, AUTO_REJECTED, DEFERRED, EXECUTED | Decision (per Part 15) | Internal |
| `decision_maker` | UUID | No | NULL | FK to `identity_master` | Decision maker | Confidential |
| `decision_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `policy_applied_id` | UUID | Yes | — | FK to `ai_policy` (Entity 728) | Policy | Internal |
| `policy_violations` | JSONB | No | NULL | — | Violations | Confidential |
| `sensitive_data_detected` | BOOLEAN | Yes | `false` | — | Sensitive detected | Confidential |
| `sensitive_data_redacted` | BOOLEAN | Yes | `false` | — | Redacted | Confidential |
| `sensitive_data_types_detected` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Types | Confidential |
| `cost_incurred` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `tokens_used` | INTEGER | Yes | `0` | ≥ 0 | Tokens | Internal |
| `action_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp (per Part 15) | Internal |
| `ip_address` | INET | No | NULL | — | IP | Confidential |
| `session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `correlation_id` | UUID | No | NULL | — | Correlation | Internal |
| `trace_id` | UUID | No | NULL | — | Trace | Internal |
| `business_action_triggered` | VARCHAR(200) | No | NULL | — | Action | Internal |
| `business_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `business_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `outcome_actual` | ENUM | No | NULL | SUCCESS, PARTIAL_SUCCESS, FAILED, REVERSED, PENDING | Outcome | Internal |
| `outcome_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `legal_hold` | BOOLEAN | Yes | `false` | — | Hold | Confidential |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash chain | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 730 — AI Operations Dashboard

### 1. Business Purpose
Per Part 15 §1: Displays Requests, Costs, Latency, Failures, Provider Usage, Token Consumption. AI platform operational dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | HOURLY, DAILY, MONTHLY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_requests_today` | BIGINT | Yes | `0` | ≥ 0 | Requests (per Part 15) today | Internal |
| `total_requests_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `requests_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `requests_by_type` | JSONB | Yes | `'{}'` | — | By request type | Internal |
| `requests_trend_7d` | JSONB | Yes | `'[]'` | — | 7-day trend | Internal |
| `requests_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `total_cost_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Costs (per Part 15) today | Confidential |
| `total_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `total_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `cost_by_model` | JSONB | Yes | `'{}'` | — | By model | Confidential |
| `cost_by_module` | JSONB | Yes | `'{}'` | — | By module | Confidential |
| `cost_by_user` | JSONB | Yes | `'[]'` | — | Top users | Confidential |
| `budget_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Budget | Confidential |
| `avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Latency (per Part 15) avg | Internal |
| `p50_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | P50 | Internal |
| `p95_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `p99_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | P99 | Internal |
| `failures_count_today` | INTEGER | Yes | `0` | ≥ 0 | Failures (per Part 15) | Confidential |
| `failure_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Failure rate | Confidential |
| `failures_by_type` | JSONB | Yes | `'{}'` | — | By error type | Confidential |
| `provider_usage` | JSONB | Yes | `'[]'` | — | Provider Usage (per Part 15) | Internal |
| `provider_health` | JSONB | Yes | `'{}'` | — | Provider health | Internal |
| `failover_count_today` | INTEGER | Yes | `0` | ≥ 0 | Failovers | Internal |
| `token_consumption_today` | BIGINT | Yes | `0` | ≥ 0 | Token Consumption (per Part 15) | Internal |
| `token_consumption_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `tokens_by_type` | JSONB | Yes | `'{}'` | — | Prompt vs completion | Internal |
| `tokens_by_model` | JSONB | Yes | `'{}'` | — | By model | Internal |
| `active_models_count` | INTEGER | Yes | `0` | ≥ 0 | Active models | Internal |
| `models_health_summary` | JSONB | Yes | `'{}'` | — | Health summary | Internal |
| `approval_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Pending approvals | Internal |
| `policy_violations_count` | INTEGER | Yes | `0` | ≥ 0 | Violations | Confidential |
| `sensitive_data_detected_count` | INTEGER | Yes | `0` | ≥ 0 | Sensitive | Confidential |
| `human_review_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Reviews pending | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 2: Enterprise Knowledge Graph, Knowledge Base & Semantic Intelligence (Entities 731-740)

## Entity 731 — Knowledge Base

### 1. Business Purpose
Per Part 15 §2: Stores Policies, SOPs, Manuals, FAQs, Business Rules, Technical Documents. Centralized knowledge repository.

### 2. Architectural Role
Master entity — per Vol 0: "Enterprise knowledge should never remain trapped inside individual modules." Knowledge becomes searchable, connected, and reusable.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kb_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `kb_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `kb_description` | TEXT | No | NULL | — | Description | Internal |
| `kb_type` | ENUM | Yes | — | POLICIES (per Part 15), SOPS, MANUALS, FAQS, BUSINESS_RULES, TECHNICAL_DOCUMENTS, TRAINING_MATERIAL, COMPLIANCE_DOCS, KNOWLEDGE_ARTICLES, ALL | Type | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `applicable_department_id` | UUID | No | NULL | FK to `departments` | NULL = all | Internal |
| `applicable_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `classification` | ENUM | Yes | `INTERNAL` | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED | Classification | Confidential |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner | Confidential |
| `owner_department_id` | UUID | No | NULL | FK to `departments` | Owner dept | Internal |
| `total_articles_count` | INTEGER | Yes | `0` | ≥ 0 | Articles | Internal |
| `total_views_count` | BIGINT | Yes | `0` | ≥ 0 | Views | Internal |
| `total_search_appearances` | BIGINT | Yes | `0` | ≥ 0 | Search appearances | Internal |
| `avg_article_rating` | DECIMAL(3,2) | Yes | `0` | 0-5 | Rating | Internal |
| `last_updated_at` | TIMESTAMPTZ | Yes | `now()` | — | Last update | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 732 — Knowledge Article

### 1. Business Purpose
Per Part 15 §2: Stores Title, Category, Content, Version, Owner, Approval. Individual knowledge articles.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `article_code` | VARCHAR(50) | Yes | — | Unique per kb | Code | Internal |
| `knowledge_base_id` | UUID | Yes | — | FK to `knowledge_base` (Entity 731) | Parent KB | Internal |
| `title` | VARCHAR(500) | Yes | — | Min 3 | Title (per Part 15) | Internal |
| `subtitle` | VARCHAR(500) | No | NULL | — | Subtitle | Internal |
| `summary` | TEXT | No | NULL | — | Summary | Internal |
| `category` | VARCHAR(100) | Yes | — | — | Category (per Part 15) | Internal |
| `subcategory` | VARCHAR(100) | No | NULL | — | Subcategory | Internal |
| `content_markdown` | TEXT | Yes | — | Min 50 | Content (per Part 15) — Markdown | Confidential |
| `content_html` | TEXT | No | NULL | — | HTML version | Internal |
| `content_plain_text` | TEXT | No | NULL | — | Plain text (for search) | Internal |
| `tags` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Tags | Internal |
| `keywords` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Keywords | Internal |
| `metadata` | JSONB | Yes | `'{}'` | — | Custom metadata | Internal |
| `related_article_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Related | Internal |
| `linked_entities` | JSONB | Yes | `'[]'` | — | [{ entity_type, entity_id }] | Internal |
| `linked_documents` | UUID[] | No | `ARRAY[]::UUID[]` | — | Documents | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version (per Part 15) | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `knowledge_article` (self) | Previous | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner (per Part 15) | Confidential |
| `author_identity_id` | UUID | Yes | — | FK to `identity_master` | Author | Confidential |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_REVIEW, APPROVED, REJECTED, PUBLISHED, ARCHIVED | Approval (per Part 15) | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `review_due_date` | DATE | No | NULL | — | Review due | Internal |
| `last_reviewed_at` | TIMESTAMPTZ | No | NULL | — | Last review | Internal |
| `last_reviewed_by` | UUID | No | NULL | FK to `identity_master` | Reviewer | Confidential |
| `views_count` | BIGINT | Yes | `0` | ≥ 0 | Views | Internal |
| `unique_viewers_count` | INTEGER | Yes | `0` | ≥ 0 | Unique | Internal |
| `helpful_count` | INTEGER | Yes | `0` | ≥ 0 | Helpful | Internal |
| `not_helpful_count` | INTEGER | Yes | `0` | ≥ 0 | Not helpful | Internal |
| `rating_avg` | DECIMAL(3,2) | Yes | `0` | 0-5 | Rating | Internal |
| `comments_count` | INTEGER | Yes | `0` | ≥ 0 | Comments | Internal |
| `embeddings_generated` | BOOLEAN | Yes | `false` | — | Semantic embeddings | Internal |
| `embedding_vector_id` | VARCHAR(100) | No | NULL | — | Vector ID | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_REVIEW, APPROVED, PUBLISHED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 733 — Knowledge Graph

### 1. Business Purpose
Per Part 15 §2: Maps Relationships — Employee → Department → Machine → Work Order → Vendor → Purchase Order → Inventory. Enterprise knowledge graph.

### 2. Architectural Role
Graph entity — represents entities as nodes and relationships as edges. Enables semantic queries like "show all POs from vendors who supplied machines that had breakdowns in Q3."

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `graph_node_id` | VARCHAR(100) | Yes | — | Unique per graph | Node ID | Internal |
| `node_type` | ENUM | Yes | — | EMPLOYEE (per Part 15), DEPARTMENT, MACHINE (per Part 15), WORK_ORDER (per Part 15), VENDOR (per Part 15), PURCHASE_ORDER (per Part 15), INVENTORY (per Part 15), CUSTOMER, PRODUCT, ASSET, LOCATION, CONTRACT, INVOICE, PAYMENT, PROJECT, QUALITY_INCIDENT, MAINTENANCE_EVENT, OTHER | Type | Internal |
| `node_label` | VARCHAR(500) | Yes | — | Min 1 | Display label | Internal |
| `node_description` | TEXT | No | NULL | — | Description | Internal |
| `canonical_entity_type` | VARCHAR(100) | Yes | — | — | Linked entity type | Internal |
| `canonical_entity_id` | UUID | Yes | — | — | Linked entity ID | Internal |
| `canonical_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `node_properties` | JSONB | Yes | `'{}'` | — | Node attributes | Confidential |
| `embedding_vector` | JSONB | No | NULL | — | Semantic embedding | Confidential |
| `embedding_model` | VARCHAR(100) | No | NULL | — | Model | Internal |
| `relationships_out` | JSONB | Yes | `'[]'` | — | Outgoing edges [{ target_node_id, relationship_type, properties, weight }] | Confidential |
| `relationships_in` | JSONB | Yes | `'[]'` | — | Incoming edges | Confidential |
| `total_relationships_count` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `relationship_strength_avg` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg strength | Internal |
| `centrality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Centrality | Internal |
| `cluster_id` | VARCHAR(50) | No | NULL | — | Cluster | Internal |
| `cluster_label` | VARCHAR(200) | No | NULL | — | Cluster label | Internal |
| `last_traversed_at` | TIMESTAMPTZ | No | NULL | — | Last traversal | Internal |
| `traversal_count` | BIGINT | Yes | `0` | ≥ 0 | Traversals | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 734 — Semantic Index

### 1. Business Purpose
Per Part 15 §2: Indexes ERP Records, Documents, Reports, OCR, Emails. Semantic search index.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `semantic_index_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `index_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `data_source_type` | ENUM | Yes | — | ERP_RECORDS, DOCUMENTS (per Part 15), REPORTS (per Part 15), OCR (per Part 15), EMAILS (per Part 15), CHAT_LOGS, TRANSCRIPTS, KNOWLEDGE_ARTICLES, ALL | Source | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `total_documents_indexed` | BIGINT | Yes | `0` | ≥ 0 | Documents | Internal |
| `total_embeddings_generated` | BIGINT | Yes | `0` | ≥ 0 | Embeddings | Internal |
| `embedding_model` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `embedding_dimensions` | INTEGER | Yes | — | > 0 | Dimensions | Internal |
| `vector_db_provider` | ENUM | Yes | `PINECONE` | PINECONE, WEAVIATE, MILVUS, QDRANT, PGVECTOR, ELASTICSEARCH, CUSTOM | Provider | Internal |
| `vector_db_endpoint` | VARCHAR(500) | Yes | — | — | Endpoint | Confidential |
| `vector_db_config_encrypted` | TEXT | No | NULL | — | Config | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `indexing_strategy` | ENUM | Yes | `INCREMENTAL` | FULL_REBUILD, INCREMENTAL, REAL_TIME | Strategy | Internal |
| `last_full_rebuild_at` | TIMESTAMPTZ | No | NULL | — | Last rebuild | Internal |
| `last_incremental_at` | TIMESTAMPTZ | No | NULL | — | Last incremental | Internal |
| `indexing_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Lag | Internal |
| `index_size_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Size | Internal |
| `index_health` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CORRUPTED, REBUILDING | Health | Internal |
| `query_avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg latency | Internal |
| `queries_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `search_recall_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Recall | Internal |
| `search_precision_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Precision | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, REBUILDING | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 735 — Enterprise Ontology

### 1. Business Purpose
Per Part 15 §2: Defines Business Objects, Relationships, Attributes, Meaning. Enterprise ontology/schema.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ontology_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `ontology_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `ontology_version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `ontology_description` | TEXT | No | NULL | — | Description | Internal |
| `business_objects` | JSONB | Yes | `'[]'` | — | Business Objects (per Part 15) — [{ name, description, attributes, relationships }] | Confidential |
| `relationships_defined` | JSONB | Yes | `'[]'` | — | Relationships (per Part 15) — [{ source, target, type, cardinality, meaning }] | Confidential |
| `attributes_defined` | JSONB | Yes | `'[]'` | — | Attributes (per Part 15) — [{ object, attribute, type, meaning }] | Confidential |
| `semantic_meanings` | JSONB | Yes | `'[]'` | — | Meaning (per Part 15) — semantic definitions | Confidential |
| `domains` | JSONB | Yes | `'[]'` | — | Domain definitions | Internal |
| `taxonomies` | JSONB | Yes | `'[]'` | — | Taxonomy hierarchies | Internal |
| `vocabularies` | JSONB | Yes | `'[]'` | — | Controlled vocabularies | Internal |
| `rules` | JSONB | Yes | `'[]'` | — | Inference rules | Confidential |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 736 — Context Builder

### 1. Business Purpose
Per Part 15 §2: Collects Relevant Data, Permissions, History, Related Records. Builds AI context.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `context_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `ai_request_id` | UUID | No | NULL | FK to `ai_request` (Entity 725) | Linked request | Internal |
| `copilot_session_id` | UUID | No | NULL | FK to `copilot_session` (Entity 741) | Copilot | Internal |
| `context_type` | ENUM | Yes | — | BUSINESS_ENTITY, USER_CONTEXT, HISTORICAL, PERMISSION, KNOWLEDGE, SEMANTIC, COMPOSITE | Type | Internal |
| `relevant_data` | JSONB | Yes | `'{}'` | — | Relevant Data (per Part 15) | Confidential |
| `permissions_context` | JSONB | Yes | `'{}'` | — | Permissions (per Part 15) | Confidential |
| `history_context` | JSONB | Yes | `'[]'` | — | History (per Part 15) — prior interactions | Confidential |
| `related_records` | JSONB | Yes | `'[]'` | — | Related Records (per Part 15) | Confidential |
| `knowledge_context` | JSONB | Yes | `'[]'` | — | Knowledge Graph context | Confidential |
| `semantic_context` | JSONB | Yes | `'[]'` | — | Semantic search results | Confidential |
| `user_profile_context` | JSONB | Yes | `'{}'` | — | User profile | Confidential |
| `business_module_context` | JSONB | Yes | `'{}'` | — | Module-specific | Internal |
| `temporal_context` | JSONB | Yes | `'{}'` | — | Time-based (current period, FY, etc.) | Internal |
| `total_context_size_tokens` | INTEGER | Yes | `0` | ≥ 0 | Size | Internal |
| `context_assembly_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Assembly time | Internal |
| `context_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Quality | Internal |
| `context_completeness_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completeness | Internal |
| `permission_filtered_count` | INTEGER | Yes | `0` | ≥ 0 | Filtered by permissions | Internal |
| `sensitive_data_redacted_count` | INTEGER | Yes | `0` | ≥ 0 | Redacted | Confidential |
| `context_purpose` | TEXT | No | NULL | — | Purpose | Confidential |
| `built_at` | TIMESTAMPTZ | Yes | `now()` | — | Built time | Internal |
| `built_by` | UUID | No | NULL | FK to `identity_master` | Builder | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 737 — Citation Engine

### 1. Business Purpose
Per Part 15 §2: Stores Source, Confidence, Reference, Document Link. AI response citation management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `citation_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `ai_response_id` | UUID | Yes | — | FK to `ai_response` (Entity 726) | Response | Internal |
| `citation_type` | ENUM | Yes | — | KNOWLEDGE_ARTICLE, DOCUMENT, ERP_RECORD, REPORT, EMAIL, CHAT_LOG, EXTERNAL_URL, DATA_SOURCE, CALCULATION, OTHER | Type | Internal |
| `source` | VARCHAR(500) | Yes | — | — | Source (per Part 15) | Internal |
| `source_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `source_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `source_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `reference` | TEXT | Yes | — | Min 10 | Reference (per Part 15) | Confidential |
| `document_link` | VARCHAR(500) | No | NULL | — | Document Link (per Part 15) | Internal |
| `document_master_id` | UUID | No | NULL | FK to `document_master` | Document | Confidential |
| `citation_text` | TEXT | Yes | — | Min 10 | Quoted text | Confidential |
| `citation_position` | VARCHAR(50) | No | NULL | — | Position in response | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence (per Part 15) | Internal |
| `relevance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Relevance | Internal |
| `verification_status` | ENUM | Yes | `PENDING` | PENDING, VERIFIED, DISPUTED, INVALID | Status | Internal |
| `verified_by` | UUID | No | NULL | FK to `identity_master` | Verifier | Confidential |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification | Internal |
| `verification_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `user_helpful_count` | INTEGER | Yes | `0` | ≥ 0 | Helpful | Internal |
| `user_not_helpful_count` | INTEGER | Yes | `0` | ≥ 0 | Not helpful | Internal |
| `click_count` | INTEGER | Yes | `0` | ≥ 0 | Clicks | Internal |
| `last_clicked_at` | TIMESTAMPTZ | No | NULL | — | Last click | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 738 — Knowledge Approval

### 1. Business Purpose
Per Part 15 §2: Workflow Draft → Review → Approved → Archived. Knowledge article approval workflow.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `knowledge_article_id` | UUID | Yes | — | FK to `knowledge_article` (Entity 732) | Article | Internal |
| `article_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `workflow_instance_id` | UUID | No | NULL | FK to `workflow_instance` | Workflow | Internal |
| `approval_workflow` | ENUM | Yes | — | DRAFT (per Part 15), REVIEW (per Part 15), APPROVED (per Part 15), ARCHIVED (per Part 15), REJECTED | Stage | Internal |
| `current_stage` | ENUM | Yes | `DRAFT` | DRAFT, REVIEW, APPROVED, ARCHIVED, REJECTED | Stage | Internal |
| `author_identity_id` | UUID | Yes | — | FK to `identity_master` | Author | Confidential |
| `reviewer_identity_id` | UUID | No | NULL | FK to `identity_master` | Reviewer | Confidential |
| `reviewer_role_id` | UUID | No | NULL | FK to `role_master` | Reviewer role | Confidential |
| `submitted_at` | TIMESTAMPTZ | No | NULL | — | Submitted for review | Internal |
| `review_started_at` | TIMESTAMPTZ | No | NULL | — | Review started | Internal |
| `review_completed_at` | TIMESTAMPTZ | No | NULL | — | Review completed | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approved | Internal |
| `archived_at` | TIMESTAMPTZ | No | NULL | — | Archived | Internal |
| `review_comments` | TEXT | No | NULL | — | Comments | Confidential |
| `review_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `rejection_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `revision_requested` | BOOLEAN | Yes | `false` | — | Revision needed | Internal |
| `revision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | Breach | Internal |
| `escalation_count` | INTEGER | Yes | `0` | ≥ 0 | Escalations | Internal |
| `approval_history` | JSONB | Yes | `'[]'` | — | [{ stage, actor, action, timestamp, comments }] | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, REVIEW, APPROVED, ARCHIVED, REJECTED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 739 — Knowledge Analytics

### 1. Business Purpose
Per Part 15 §2: Measures Most Viewed, Search Success, Knowledge Gaps, Usage. Knowledge base analytics.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | DAILY, WEEKLY, MONTHLY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `knowledge_base_id` | UUID | No | NULL | FK to `knowledge_base` | Specific KB | Internal |
| `total_articles` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `articles_published` | INTEGER | Yes | `0` | ≥ 0 | Published | Internal |
| `articles_pending_review` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `articles_archived` | INTEGER | Yes | `0` | ≥ 0 | Archived | Internal |
| `total_views_today` | BIGINT | Yes | `0` | ≥ 0 | Views today | Internal |
| `total_views_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `unique_viewers_today` | INTEGER | Yes | `0` | ≥ 0 | Unique | Internal |
| `most_viewed_articles` | JSONB | Yes | `'[]'` | — | Most Viewed (per Part 15) | Internal |
| `most_searched_terms` | JSONB | Yes | `'[]'` | — | Top searches | Confidential |
| `search_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Search Success (per Part 15) | Internal |
| `zero_result_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Zero results | Internal |
| `knowledge_gaps_identified` | JSONB | Yes | `'[]'` | — | Knowledge Gaps (per Part 15) | Confidential |
| `articles_created_today` | INTEGER | Yes | `0` | ≥ 0 | Created | Internal |
| `articles_updated_today` | INTEGER | Yes | `0` | ≥ 0 | Updated | Internal |
| `avg_article_rating` | DECIMAL(3,2) | Yes | `0` | 0-5 | Rating | Internal |
| `avg_helpful_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Helpful | Internal |
| `top_contributors` | JSONB | Yes | `'[]'` | — | Top authors | Internal |
| `usage_by_module` | JSONB | Yes | `'{}'` | — | Usage (per Part 15) by module | Internal |
| `usage_by_department` | JSONB | Yes | `'{}'` | — | By department | Internal |
| `ai_citation_count_today` | INTEGER | Yes | `0` | ≥ 0 | Cited by AI | Internal |
| `ai_citation_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | AI citation success | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 740 — Knowledge Dashboard

### 1. Business Purpose
Per Part 15 §2: Displays Articles, Approvals, Knowledge Health, Searches, Coverage. AI: Semantic Search, Context Expansion, Knowledge Recommendation, Duplicate Detection.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_articles` | INTEGER | Yes | `0` | ≥ 0 | Articles (per Part 15) | Internal |
| `articles_by_status` | JSONB | Yes | `'{}'` | — | By status | Internal |
| `articles_by_category` | JSONB | Yes | `'{}'` | — | By category | Internal |
| `articles_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `pending_approvals_count` | INTEGER | Yes | `0` | ≥ 0 | Approvals (per Part 15) pending | Internal |
| `overdue_reviews_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `knowledge_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Knowledge Health (per Part 15) | Confidential |
| `health_components` | JSONB | Yes | `'{}'` | — | { coverage, freshness, accuracy, completeness, usage } | Confidential |
| `total_searches_today` | BIGINT | Yes | `0` | ≥ 0 | Searches (per Part 15) | Internal |
| `search_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `zero_result_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Zero results | Internal |
| `top_search_terms` | JSONB | Yes | `'[]'` | — | Top terms | Confidential |
| `coverage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Coverage (per Part 15) | Internal |
| `coverage_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `coverage_by_department` | JSONB | Yes | `'{}'` | — | By department | Internal |
| `knowledge_gaps_count` | INTEGER | Yes | `0` | ≥ 0 | Gaps | Confidential |
| `knowledge_gaps_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `total_views_today` | BIGINT | Yes | `0` | ≥ 0 | Views | Internal |
| `top_viewed_articles` | JSONB | Yes | `'[]'` | — | Top articles | Internal |
| `avg_article_rating` | DECIMAL(3,2) | Yes | `0` | 0-5 | Rating | Internal |
| `top_contributors` | JSONB | Yes | `'[]'` | — | Top authors | Internal |
| `ai_citation_count_today` | INTEGER | Yes | `0` | ≥ 0 | AI citations | Internal |
| `ai_citation_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Citation rate | Internal |
| `knowledge_graph_nodes_count` | BIGINT | Yes | `0` | ≥ 0 | Nodes | Internal |
| `knowledge_graph_relationships_count` | BIGINT | Yes | `0` | ≥ 0 | Edges | Internal |
| `semantic_index_size_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Index size | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `ai_semantic_search` | JSONB | No | NULL | — | AI: Semantic Search (per Part 15 AI) | Confidential |
| `ai_context_expansion` | JSONB | No | NULL | — | AI: Context Expansion (per Part 15 AI) | Confidential |
| `ai_knowledge_recommendation` | JSONB | No | NULL | — | AI: Knowledge Recommendation (per Part 15 AI) | Confidential |
| `ai_duplicate_detection` | JSONB | No | NULL | — | AI: Duplicate Detection (per Part 15 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 3: Enterprise AI Copilot Framework & Natural Language Platform (Entities 741-750)

## Entity 741 — Copilot Session

### 1. Business Purpose
Per Part 15 §3: Stores User, Conversation, Context, Module, Status. Copilot user sessions.

### 2. Architectural Role
Session entity — represents one Copilot conversation. Per Vol 0: "Every user should be able to interact with SUOP using natural language."

### 3. Business Rules
- Session lifecycle: ACTIVE → IDLE → EXPIRED → ARCHIVED
- Concurrent sessions: user can have multiple Copilot sessions
- Context retention: session retains conversation context for follow-up questions
- Module context: session active in one business module at a time
- Idle timeout: 30 minutes typical, then session marked IDLE
- Expiry: 24 hours of inactivity → session archived

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `session_id` | VARCHAR(100) | Yes | — | Unique | Session ID | Confidential |
| `user_identity_id` | UUID | Yes | — | FK to `identity_master` (Entity 601) | User (per Part 15) | Confidential |
| `user_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `session_type` | ENUM | Yes | `CHAT` | CHAT, VOICE, MULTI_MODAL, QUICK_ACTION, AUTOMATED | Type | Internal |
| `interaction_channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, TABLET, VOICE, API, EMBEDDED | Channel | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module (per Part 15) | Internal |
| `conversation_context` | JSONB | Yes | `'{}'` | — | Conversation (per Part 15) — full context | Confidential |
| `current_intent` | VARCHAR(100) | No | NULL | — | Current intent | Internal |
| `current_entity_type` | VARCHAR(100) | No | NULL | — | Current entity being discussed | Internal |
| `current_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `current_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `language` | VARCHAR(10) | Yes | `en` | — | Language | Internal |
| `locale` | VARCHAR(20) | Yes | `en-IN` | — | Locale | Internal |
| `started_at` | TIMESTAMPTZ | Yes | `now()` | — | Start | Internal |
| `last_activity_at` | TIMESTAMPTZ | Yes | `now()` | — | Last activity | Internal |
| `ended_at` | TIMESTAMPTZ | No | NULL | — | End | Internal |
| `duration_seconds` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `messages_count` | INTEGER | Yes | `0` | ≥ 0 | Messages | Internal |
| `user_messages_count` | INTEGER | Yes | `0` | ≥ 0 | User messages | Internal |
| `assistant_messages_count` | INTEGER | Yes | `0` | ≥ 0 | Assistant messages | Internal |
| `actions_suggested_count` | INTEGER | Yes | `0` | ≥ 0 | Actions suggested | Internal |
| `actions_executed_count` | INTEGER | Yes | `0` | ≥ 0 | Actions executed | Internal |
| `actions_approved_count` | INTEGER | Yes | `0` | ≥ 0 | Approved | Internal |
| `actions_rejected_count` | INTEGER | Yes | `0` | ≥ 0 | Rejected | Internal |
| `satisfaction_rating` | DECIMAL(3,2) | No | NULL | 0-5 | User satisfaction | Confidential |
| `satisfaction_feedback` | TEXT | No | NULL | — | Feedback | Confidential |
| `total_tokens_used` | INTEGER | Yes | `0` | ≥ 0 | Tokens | Internal |
| `total_cost_incurred` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `device_id` | UUID | No | NULL | FK to `device_registry` | Device | Confidential |
| `ip_address` | INET | No | NULL | — | IP | Confidential |
| `geolocation` | JSONB | No | NULL | — | Geo | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | ACTIVE, IDLE, EXPIRED, ARCHIVED, TERMINATED | Status (per Part 15) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Master (601) | Many-to-One | N:1 | User |
| Intent Engine (742) | One-to-Many | 1:N | Intents |
| Context Manager (743) | One-to-One | 1:1 | Context |
| Conversation Memory (747) | One-to-One | 1:1 | Memory |

### 6. Indexes
- UNIQUE (`session_id`)
- INDEX (`user_identity_id`, `current_status`)
- INDEX (`current_status`, `last_activity_at`)
- INDEX (`business_module`, `started_at`)

### 7. Security Classification
**Confidential** — conversation content.

### 8. Integration Points
- **Unified Enterprise AI Orchestrator** (FS-54, Q193): Session orchestration
- **AI Copilot Framework**: Primary consumer
- **Intent Engine** (Entity 742): Intent detection
- **Context Manager** (Entity 743): Context management
- **All Business Modules**: Module-specific Copilot

### 9. Sample Data
```json
{
  "session_id": "COP-2026-07-00123456", "user_identity_id": "id-100",
  "session_type": "CHAT", "interaction_channel": "WEB",
  "business_module": "PROCUREMENT", "language": "en", "locale": "en-IN",
  "started_at": "2026-07-08T10:30:00Z", "last_activity_at": "2026-07-08T10:35:00Z",
  "messages_count": 8, "user_messages_count": 4, "assistant_messages_count": 4,
  "actions_suggested_count": 2, "actions_executed_count": 1,
  "satisfaction_rating": 4.50, "total_tokens_used": 3450,
  "total_cost_incurred": 0.0520, "currency_code": "USD",
  "current_status": "ACTIVE"
}
```

### 10. Audit Events
`COPILOT_SESSION_STARTED`, `COPILOT_MESSAGE_EXCHANGED`, `COPILOT_ACTION_SUGGESTED`, `COPILOT_ACTION_EXECUTED`, `COPILOT_SESSION_IDLE`, `COPILOT_SESSION_EXPIRED`, `COPILOT_SESSION_TERMINATED`, `COPILOT_SATISFACTION_RATED`

---

## Entity 742 — Intent Engine

### 1. Business Purpose
Per Part 15 §3: Recognizes Search, Report, Approval, Prediction, Workflow, Transaction. Natural language intent detection.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `intent_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `copilot_session_id` | UUID | Yes | — | FK to `copilot_session` (Entity 741) | Session | Internal |
| `user_query` | TEXT | Yes | — | Min 1 | Original query | Confidential |
| `detected_intent` | ENUM | Yes | — | SEARCH (per Part 15), REPORT (per Part 15), APPROVAL (per Part 15), PREDICTION (per Part 15), WORKFLOW (per Part 15), TRANSACTION (per Part 15), QUESTION, RECOMMENDATION, ANALYSIS, NAVIGATION, OTHER | Intent | Internal |
| `intent_category` | ENUM | Yes | — | INFORMATION, ACTION, ANALYSIS, DECISION_SUPPORT, NAVIGATION, AUTOMATION | Category | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `alternative_intents` | JSONB | Yes | `'[]'` | — | [{ intent, confidence }] | Internal |
| `extracted_entities` | JSONB | Yes | `'[]'` | — | [{ entity_type, entity_value, confidence }] | Confidential |
| `extracted_parameters` | JSONB | Yes | `'{}'` | — | Parameters | Internal |
| `intent_model_used` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `intent_model_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `target_business_module` | VARCHAR(50) | No | NULL | — | Target module | Internal |
| `target_skill_id` | UUID | No | NULL | FK to `ai_skill_library` (Entity 745) | Skill | Internal |
| `requires_permission_check` | BOOLEAN | Yes | `true` | — | Permission check | Internal |
| `permission_check_passed` | BOOLEAN | Yes | `false` | — | Passed | Internal |
| `requires_approval` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `approval_authority_role_id` | UUID | No | NULL | FK to `role_master` | Approver | Confidential |
| `execution_plan` | JSONB | Yes | `'[]'` | — | Multi-step plan | Confidential |
| `estimated_execution_time_seconds` | INTEGER | Yes | `0` | ≥ 0 | Estimate | Internal |
| `estimated_cost` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `detected_at` | TIMESTAMPTZ | Yes | `now()` | — | Detection | Internal |
| `current_status` | ENUM | Yes | `DETECTED` | DETECTED, VALIDATED, EXECUTING, COMPLETED, FAILED, CANCELLED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 743 — Context Manager

### 1. Business Purpose
Per Part 15 §3: Maintains Conversation, Business Context, User Preferences, Current Entity. Copilot context management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `context_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `copilot_session_id` | UUID | Yes | — | FK to `copilot_session` (Entity 741) | Session | Internal |
| `conversation_history` | JSONB | Yes | `'[]'` | — | Conversation (per Part 15) — full history | Confidential |
| `conversation_summary` | TEXT | No | NULL | — | AI-generated summary | Confidential |
| `business_context` | JSONB | Yes | `'{}'` | — | Business Context (per Part 15) | Confidential |
| `current_module` | VARCHAR(50) | No | NULL | — | Current module | Internal |
| `current_entity_type` | VARCHAR(100) | No | NULL | — | Current entity type | Internal |
| `current_entity_id` | UUID | No | NULL | — | Current entity ID | Internal |
| `current_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `referenced_entities` | JSONB | Yes | `'[]'` | — | All referenced | Internal |
| `user_preferences` | JSONB | Yes | `'{}'` | — | User Preferences (per Part 15) | Confidential |
| `user_role_context` | JSONB | Yes | `'{}'` | — | Role-based context | Confidential |
| `user_permission_context` | JSONB | Yes | `'{}'` | — | Permissions | Confidential |
| `temporal_context` | JSONB | Yes | `'{}'` | — | Time context | Internal |
| `location_context` | JSONB | Yes | `'{}'` | — | Branch/facility | Internal |
| `knowledge_context` | JSONB | Yes | `'[]'` | — | Knowledge Graph | Confidential |
| `semantic_context` | JSONB | Yes | `'[]'` | — | Semantic search | Confidential |
| `total_context_tokens` | INTEGER | Yes | `0` | ≥ 0 | Tokens | Internal |
| `max_context_tokens` | INTEGER | Yes | `32000` | > 0 | Max | Internal |
| `context_compression_enabled` | BOOLEAN | Yes | `true` | — | Compress when over limit | Internal |
| `context_compression_strategy` | ENUM | Yes | `SUMMARIZE_OLDEST` | SUMMARIZE_OLDEST, TRUNCATE_OLDEST, SEMANTIC_DEDUPLICATION, HYBRID | Strategy | Internal |
| `last_updated_at` | TIMESTAMPTZ | Yes | `now()` | — | Last update | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 744 — Suggested Actions

### 1. Business Purpose
Per Part 15 §3: Examples — Approve Purchase Order, Create Work Order, Reserve Inventory, Generate Report, Schedule Maintenance. AI-suggested actions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `suggestion_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `copilot_session_id` | UUID | Yes | — | FK to `copilot_session` (Entity 741) | Session | Internal |
| `intent_id` | UUID | Yes | — | FK to `intent_engine` (Entity 742) | Source intent | Internal |
| `ai_response_id` | UUID | No | NULL | FK to `ai_response` (Entity 726) | Response | Internal |
| `action_type` | ENUM | Yes | — | APPROVE_PURCHASE_ORDER (per Part 15), CREATE_WORK_ORDER (per Part 15), RESERVE_INVENTORY (per Part 15), GENERATE_REPORT (per Part 15), SCHEDULE_MAINTENANCE (per Part 15), CREATE_PO, APPROVE_LEAVE, APPROVE_EXPENSE, CREATE_INVOICE, SEND_NOTIFICATION, RUN_WORKFLOW, EXECUTE_QUERY, NAVIGATE, OTHER | Type | Internal |
| `action_title` | VARCHAR(200) | Yes | — | Min 3 | Display title | Internal |
| `action_description` | TEXT | Yes | — | Min 10 | Description | Confidential |
| `target_module` | VARCHAR(50) | Yes | — | — | Target module | Internal |
| `target_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `target_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `action_payload` | JSONB | Yes | `'{}'` | — | Action data | Confidential |
| `action_url` | VARCHAR(500) | No | NULL | — | URL | Internal |
| `api_endpoint` | VARCHAR(500) | No | NULL | — | API | Confidential |
| `api_method` | VARCHAR(10) | No | NULL | — | Method | Internal |
| `requires_approval` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `approval_authority_role_id` | UUID | No | NULL | FK to `role_master` | Approver | Confidential |
| `approval_workflow_id` | UUID | No | NULL | FK to `workflow_definition` | Workflow | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `relevance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Relevance | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `estimated_impact` | VARCHAR(200) | No | NULL | — | Impact | Confidential |
| `estimated_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `estimated_duration_minutes` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `risk_level` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH, CRITICAL | Risk | Confidential |
| `requires_confirmation` | BOOLEAN | Yes | `true` | — | User must confirm | Internal |
| `confirmation_message` | TEXT | No | NULL | — | Message | Confidential |
| `undo_possible` | BOOLEAN | Yes | `false` | — | Can undo | Internal |
| `undo_workflow_id` | UUID | No | NULL | FK to `workflow_definition` | Undo workflow | Internal |
| `user_accepted` | BOOLEAN | Yes | `false` | — | Accepted | Internal |
| `user_rejected` | BOOLEAN | Yes | `false` | — | Rejected | Internal |
| `user_deferred` | BOOLEAN | Yes | `false` | — | Deferred | Internal |
| `user_feedback` | TEXT | No | NULL | — | Feedback | Confidential |
| `executed_at` | TIMESTAMPTZ | No | NULL | — | Execution | Internal |
| `execution_result` | ENUM | No | NULL | SUCCESS, PARTIAL_SUCCESS, FAILED, REVERTED | Result | Internal |
| `execution_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `execution_audit_id` | UUID | No | NULL | FK to `audit_event` | Audit | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `SUGGESTED` | SUGGESTED, ACCEPTED, REJECTED, DEFERRED, EXECUTING, COMPLETED, FAILED, REVERTED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 745 — AI Skill Library

### 1. Business Purpose
Per Part 15 §3: Skills — Finance, Warehouse, Manufacturing, HR, Maintenance, Retail, Restaurant. Module-specific AI skills.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `skill_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `skill_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `skill_description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `business_module` | ENUM | Yes | — | FINANCE (per Part 15), WAREHOUSE (per Part 15), MANUFACTURING (per Part 15), HR (per Part 15), MAINTENANCE (per Part 15), RETAIL (per Part 15), RESTAURANT (per Part 15), PROCUREMENT, INVENTORY, QUALITY, EAM, PLATFORM, ALL | Module | Internal |
| `skill_category` | ENUM | Yes | — | QUERY, ACTION, ANALYSIS, REPORT, PREDICTION, RECOMMENDATION, AUTOMATION, ASSISTANCE | Category | Internal |
| `skill_capabilities` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Capabilities | Internal |
| `supported_intents` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Intent types handled | Internal |
| `prompt_template_id` | UUID | Yes | — | FK to `prompt_library` (Entity 723) | Prompt | Internal |
| `required_context` | JSONB | Yes | `'[]'` | — | Required context fields | Internal |
| `required_permissions` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Permissions | Confidential |
| `required_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `supported_languages` | TEXT[] | Yes | `ARRAY['en']` | — | Languages | Internal |
| `execution_timeout_seconds` | INTEGER | Yes | `30` | ≥ 1 | Timeout | Internal |
| `max_tokens_per_invocation` | INTEGER | Yes | `2000` | ≥ 1 | Token limit | Internal |
| `estimated_cost_per_invocation` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `default_model_id` | UUID | No | NULL | FK to `ai_model_registry` (Entity 722) | Default model | Internal |
| `fallback_model_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Fallbacks | Internal |
| `skill_version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `ai_skill_library` (self) | Previous | Internal |
| `tested_in_sandbox` | BOOLEAN | Yes | `false` | — | Tested | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `usage_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total uses | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `avg_user_satisfaction` | DECIMAL(3,2) | Yes | `0` | 0-5 | Satisfaction | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, TESTING, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 746 — Voice Command

### 1. Business Purpose
Per Part 15 §3: Supports Speech-to-Text, Text-to-Speech, Voice Shortcuts. Voice interaction support.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `voice_command_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `copilot_session_id` | UUID | Yes | — | FK to `copilot_session` (Entity 741) | Session | Internal |
| `command_type` | ENUM | Yes | — | SPEECH_TO_TEXT, TEXT_TO_SPEECH, VOICE_SHORTCUT, VOICE_NAVIGATION, VOICE_ACTION | Type | Internal |
| `audio_input_attachment_id` | UUID | No | NULL | FK to `attachments` | Audio | Confidential |
| `audio_duration_seconds` | DECIMAL(7,2) | No | NULL | ≥ 0 | Duration | Internal |
| `audio_format` | VARCHAR(20) | No | NULL | — | WAV, MP3, etc. | Internal |
| `audio_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Size | Internal |
| `language_detected` | VARCHAR(10) | No | NULL | — | Language | Internal |
| `transcribed_text` | TEXT | No | NULL | — | Speech-to-Text (per Part 15) result | Confidential |
| `transcription_confidence` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal |
| `transcription_model` | VARCHAR(100) | No | NULL | — | Model | Internal |
| `intent_detected` | VARCHAR(100) | No | NULL | — | Intent | Internal |
| `voice_shortcut_used` | VARCHAR(100) | No | NULL | — | Voice Shortcuts (per Part 15) | Internal |
| `response_text` | TEXT | No | NULL | — | Response text | Confidential |
| `response_audio_attachment_id` | UUID | No | NULL | FK to `attachments` | Response audio | Confidential |
| `response_audio_duration_seconds` | DECIMAL(7,2) | No | NULL | ≥ 0 | Duration | Internal |
| `tts_voice_id` | VARCHAR(50) | No | NULL | — | TTS voice | Internal |
| `tts_model` | VARCHAR(100) | No | NULL | — | TTS model | Internal |
| `processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `stt_processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | STT time | Internal |
| `tts_processing_time_ms` | INTEGER | Yes | `0` | ≥ 0 | TTS time | Internal |
| `user_identity_id` | UUID | Yes | — | FK to `identity_master` | User | Confidential |
| `device_id` | UUID | No | NULL | FK to `device_registry` | Device | Confidential |
| `voice_print_verified` | BOOLEAN | Yes | `false` | — | Voice biometric | Confidential |
| `voice_print_confidence` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `PROCESSED` | PROCESSING, PROCESSED, FAILED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 747 — Conversation Memory

### 1. Business Purpose
Per Part 15 §3: Stores Session History, Intent, Referenced Records. Conversation memory persistence.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `memory_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `copilot_session_id` | UUID | Yes | — | FK to `copilot_session` (Entity 741) | Session | Internal |
| `message_sequence` | INTEGER | Yes | — | ≥ 1 | Sequence | Internal |
| `message_role` | ENUM | Yes | — | USER, ASSISTANT, SYSTEM, TOOL | Role | Internal |
| `message_content` | TEXT | Yes | — | — | Message content | Confidential |
| `message_content_redacted` | TEXT | No | NULL | — | Redacted | Confidential |
| `message_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp | Internal |
| `intent_detected` | VARCHAR(100) | No | NULL | — | Intent (per Part 15) | Internal |
| `intent_confidence` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal |
| `entities_referenced` | JSONB | Yes | `'[]'` | — | Referenced Records (per Part 15) — [{ entity_type, entity_id, entity_code }] | Internal |
| `actions_suggested` | JSONB | Yes | `'[]'` | — | Suggested actions | Internal |
| `actions_executed` | JSONB | Yes | `'[]'` | — | Executed actions | Internal |
| `ai_response_id` | UUID | No | NULL | FK to `ai_response` (Entity 726) | Response | Internal |
| `model_used` | VARCHAR(100) | No | NULL | — | Model | Internal |
| `tokens_used` | INTEGER | Yes | `0` | ≥ 0 | Tokens | Internal |
| `cost_incurred` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `user_feedback` | ENUM | No | NULL | POSITIVE, NEGATIVE, NEUTRAL | Feedback | Internal |
| `user_feedback_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `embedding_vector_id` | VARCHAR(100) | No | NULL | — | Embedding (for semantic search) | Internal |
| `is_summary` | BOOLEAN | Yes | `false` | — | Summary message | Internal |
| `summary_of_message_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Summarized messages | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 748 — Copilot Permissions

### 1. Business Purpose
Per Part 15 §3: Controls Allowed Actions, Approval Limits, Sensitive Operations. Copilot permission governance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `permission_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `permission_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `applicable_roles` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `applicable_identity_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific users | Confidential |
| `allowed_actions` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Allowed Actions (per Part 15) | Confidential |
| `denied_actions` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Denied | Confidential |
| `allowed_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `denied_modules` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Denied | Internal |
| `approval_limit_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Approval Limits (per Part 15) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `approval_limit_per_transaction` | DECIMAL(18,4) | No | NULL | ≥ 0 | Per transaction | Confidential |
| `approval_limit_per_day` | DECIMAL(18,4) | No | NULL | ≥ 0 | Per day | Confidential |
| `sensitive_operations_allowed` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Sensitive Operations (per Part 15) allowed | Confidential |
| `sensitive_operations_denied` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Denied | Confidential |
| `sensitive_operations_require_approval` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Require approval | Confidential |
| `data_access_scope` | JSONB | Yes | `'{}'` | — | Data scope | Confidential |
| `auto_execute_allowed` | BOOLEAN | Yes | `false` | — | Auto-execute | Internal |
| `auto_execute_threshold` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Auto-execute threshold | Confidential |
| `require_human_confirmation` | BOOLEAN | Yes | `true` | — | Confirmation required | Internal |
| `require_dual_approval` | BOOLEAN | Yes | `false` | — | Dual approval | Internal |
| `audit_all_actions` | BOOLEAN | Yes | `true` | — | Audit all | Internal |
| `audit_sensitive_only` | BOOLEAN | Yes | `false` | — | Sensitive only | Internal |
| `max_actions_per_session` | INTEGER | Yes | `50` | ≥ 1 | Max | Internal |
| `max_actions_per_day` | INTEGER | Yes | `200` | ≥ 1 | Max per day | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 749 — AI Explanation

### 1. Business Purpose
Per Part 15 §3: Displays Reasoning Summary, Confidence, Supporting Evidence, Recommendations. Explainable AI (XAI).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `explanation_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `ai_response_id` | UUID | Yes | — | FK to `ai_response` (Entity 726) | Response | Internal |
| `copilot_session_id` | UUID | No | NULL | FK to `copilot_session` (Entity 741) | Session | Internal |
| `reasoning_summary` | TEXT | Yes | — | Min 50 | Reasoning Summary (per Part 15) | Confidential |
| `reasoning_steps` | JSONB | Yes | `'[]'` | — | Step-by-step reasoning | Confidential |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence (per Part 15) | Internal |
| `confidence_factors` | JSONB | Yes | `'[]'` | — | Factors affecting confidence | Internal |
| `supporting_evidence` | JSONB | Yes | `'[]'` | — | Supporting Evidence (per Part 15) — [{ type, source, reference, relevance }] | Confidential |
| `data_sources_used` | JSONB | Yes | `'[]'` | — | Sources | Internal |
| `assumptions_made` | JSONB | Yes | `'[]'` | — | Assumptions | Confidential |
| `limitations` | JSONB | Yes | `'[]'` | — | Limitations | Confidential |
| `alternative_interpretations` | JSONB | Yes | `'[]'` | — | Alternatives | Confidential |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations (per Part 15) | Confidential |
| `risk_assessment` | JSONB | No | NULL | — | Risk | Confidential |
| `model_used` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `explanation_type` | ENUM | Yes | `STANDARD` | STANDARD, DETAILED, TECHNICAL, SIMPLIFIED, EXECUTIVE | Type | Internal |
| `target_audience` | ENUM | Yes | `END_USER` | END_USER, MANAGER, AUDITOR, EXECUTIVE, TECHNICAL | Audience | Internal |
| `generated_at` | TIMESTAMPTZ | Yes | `now()` | — | Generation | Internal |
| `user_feedback` | ENUM | No | NULL | HELPFUL, NOT_HELPFUL, NEUTRAL | Feedback | Internal |
| `user_feedback_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 750 — Copilot Dashboard

### 1. Business Purpose
Per Part 15 §3: Displays Sessions, Top Questions, Successful Actions, User Satisfaction, Model Performance. AI: Intent Prediction, Context Awareness, Action Recommendation, Conversation Summarization, Adaptive Learning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `active_sessions_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `total_sessions_today` | INTEGER | Yes | `0` | ≥ 0 | Sessions (per Part 15) today | Internal |
| `total_sessions_mtd` | INTEGER | Yes | `0` | ≥ 0 | MTD | Internal |
| `unique_users_today` | INTEGER | Yes | `0` | ≥ 0 | Unique | Internal |
| `sessions_trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `sessions_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `total_messages_today` | BIGINT | Yes | `0` | ≥ 0 | Messages | Internal |
| `avg_messages_per_session` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Avg | Internal |
| `avg_session_duration_minutes` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Avg duration | Internal |
| `top_questions` | JSONB | Yes | `'[]'` | — | Top Questions (per Part 15) | Confidential |
| `top_intents` | JSONB | Yes | `'[]'` | — | Top intents | Internal |
| `intents_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `intents_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `actions_suggested_count` | INTEGER | Yes | `0` | ≥ 0 | Suggested | Internal |
| `actions_executed_count` | INTEGER | Yes | `0` | ≥ 0 | Successful Actions (per Part 15) executed | Internal |
| `action_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `actions_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `actions_rejected_count` | INTEGER | Yes | `0` | ≥ 0 | Rejected | Internal |
| `user_satisfaction_avg` | DECIMAL(3,2) | Yes | `0` | 0-5 | User Satisfaction (per Part 15) | Confidential |
| `satisfaction_distribution` | JSONB | Yes | `'{}'` | — | Distribution | Confidential |
| `positive_feedback_count` | INTEGER | Yes | `0` | ≥ 0 | Positive | Internal |
| `negative_feedback_count` | INTEGER | Yes | `0` | ≥ 0 | Negative | Internal |
| `model_performance` | JSONB | Yes | `'[]'` | — | Model Performance (per Part 15) | Internal |
| `models_used_distribution` | JSONB | Yes | `'{}'` | — | By model | Internal |
| `avg_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg response | Internal |
| `p95_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `total_cost_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost today | Confidential |
| `total_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `total_tokens_today` | BIGINT | Yes | `0` | ≥ 0 | Tokens | Internal |
| `voice_commands_count` | INTEGER | Yes | `0` | ≥ 0 | Voice | Internal |
| `voice_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Voice success | Internal |
| `permission_denials_count` | INTEGER | Yes | `0` | ≥ 0 | Denials | Confidential |
| `explanations_viewed_count` | INTEGER | Yes | `0` | ≥ 0 | Explanations | Internal |
| `ai_intent_prediction` | JSONB | No | NULL | — | AI: Intent Prediction (per Part 15 AI) | Confidential |
| `ai_context_awareness` | JSONB | No | NULL | — | AI: Context Awareness (per Part 15 AI) | Confidential |
| `ai_action_recommendation` | JSONB | No | NULL | — | AI: Action Recommendation (per Part 15 AI) | Confidential |
| `ai_conversation_summarization` | JSONB | No | NULL | — | AI: Conversation Summarization (per Part 15 AI) | Confidential |
| `ai_adaptive_learning` | JSONB | No | NULL | — | AI: Adaptive Learning (per Part 15 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 15 Batch 1 Completion Summary

**All 30 AI Gateway, Knowledge Graph & Copilot entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked (Part 15 Batch 1)

1. **Unified Enterprise AI Orchestrator (Q193, FS-54)** — NEW — Single orchestration layer above AI Gateway
2. **Enterprise AI Gateway** — Single entry point for all AI service invocations
3. **Multi-Provider Model Registry** — OpenAI, Azure OpenAI, Anthropic, Google Gemini, Local LLM, future models
4. **Prompt Library with Versioning** — System/Business/Workflow/Approval/Report/Copilot prompts
5. **AI Request/Response Pipeline** — Full lifecycle with audit and approval
6. **Token Usage Tracking** — Per-user, per-module, per-tenant cost tracking
7. **AI Policy Governance** — Model access, sensitive data, approval rules, cost limits
8. **AI Audit Trail** — Immutable, hash-chained audit of all AI decisions
9. **Enterprise Knowledge Base** — Policies, SOPs, Manuals, FAQs, Business Rules
10. **Knowledge Graph** — Entity relationships (Employee → Department → Machine → Work Order → Vendor → PO → Inventory)
11. **Semantic Index** — Vector DB-backed semantic search (Pinecone/Weaviate/Milvus/PGVector)
12. **Enterprise Ontology** — Business objects, relationships, attributes, meanings
13. **Context Builder** — Gathers relevant data, permissions, history, related records
14. **Citation Engine** — Source, confidence, reference, document link
15. **Knowledge Approval Workflow** — Draft → Review → Approved → Archived
16. **AI Copilot Framework** — Natural language interface for all users
17. **Intent Engine** — Search/Report/Approval/Prediction/Workflow/Transaction recognition
18. **Context Manager** — Conversation, business context, user preferences, current entity
19. **Suggested Actions** — Approve PO, Create WO, Reserve Inventory, Generate Report, Schedule Maintenance
20. **AI Skill Library** — Finance, Warehouse, Manufacturing, HR, Maintenance, Retail, Restaurant skills
21. **Voice Command** — Speech-to-Text, Text-to-Speech, Voice Shortcuts
22. **Conversation Memory** — Session history, intent, referenced records
23. **Copilot Permissions** — Allowed actions, approval limits, sensitive operations
24. **AI Explanation (XAI)** — Reasoning summary, confidence, supporting evidence, recommendations
25. **AI Capabilities** — 13 AI capabilities across the three sections

## New Foundation Service Locked

### Unified Enterprise AI Orchestrator — Foundation Service #54

| Attribute | Value |
|---|---|
| Service ID | FS-54 |
| Architectural Decision | Q193 |
| Status | LOCKED |
| Owner | Enterprise Architect (Platform Kernel team) |
| Position | **ABOVE** AI Gateway, Knowledge Engine, Copilot Engine, Business Tools |
| Consumers | All business modules via `AIOrchestrator.execute(request)` |
| Capabilities | Model selection, context gathering, permission enforcement, request routing, multi-step action coordination, complete auditability |
| Design Principle | SUOP's AI capabilities consistent, secure, and scalable across every module |

## 13 AI Capabilities Locked (Batch 1)

| Section | AI Capabilities |
|---|---|
| AI Gateway | Model Routing, Cost Optimization, Failover, Prompt Management, Usage Analytics |
| Knowledge | Semantic Search, Context Expansion, Knowledge Recommendation, Duplicate Detection |
| Copilot | Intent Prediction, Context Awareness, Action Recommendation, Conversation Summarization, Adaptive Learning |

## Part 15 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| **Batch 1** | **1-3 (AI Gateway, Knowledge, Copilot)** | **721-750** | **✅ COMPLETE (LOCKED)** |
| Batch 2 | 4-6 (Data Warehouse, BI, Digital Twin) | 751-780 | ⏳ PENDING |
| Batch 3 | 7-9 (Predictive Intelligence, Mission Control, KPI Framework) | 781-810 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 755 entities (Parts 1-15 Batch 1)
- **Foundation Services**: 54 (FS-1 through FS-54) + Platform Kernel (Q189/Q192) as meta-architecture
- **Architectural Decisions**: 193 (Q1-Q193)

---

*End of Manual 1 Part 15 Sections 1-3. Next batch: Sections 4-6 (Enterprise Data Warehouse, Data Lake & Analytics Platform; Business Intelligence, KPI Framework & Predictive Analytics; Digital Twin, Simulation & Enterprise Forecasting).*
