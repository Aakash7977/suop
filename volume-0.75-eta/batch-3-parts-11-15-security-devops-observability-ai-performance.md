# SUOP Volume 0.75 — Enterprise Technical Architecture (ETA)
# Batch 3 — Parts 11-15: Security, DevOps, Observability, AI Platform & Performance

## Document Metadata

| Attribute | Value |
|---|---|
| Volume | 0.75 — Enterprise Technical Architecture (ETA) |
| Batch | 3 |
| Parts | 11-15 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1-9, Volume 0.5 Manual 1 Parts 1-15, Volume 0.75 Batches 1-2 |
| Last Updated | 2026-07-08 |
| Purpose | Define Enterprise Engineering Rules — how SUOP will be built, operated, and scaled over the next 10-15 years |

---

## Overview — Enterprise Engineering Rules

Batch 3 defines **how SUOP will be built**, **how it will be operated**, and **how it will scale** over the next 10-15 years. These are the Enterprise Engineering Rules that govern every line of code, every deployment, every monitoring alert, every AI invocation, and every performance optimization.

```
SECURITY (Part 11)          DEVOPS (Part 12)          OBSERVABILITY (Part 13)
  Zero Trust                  GitOps                     Metrics
  RBAC + Vault                CI/CD Pipeline             Logs
  End-to-End Encryption       Zero Downtime              Tracing
  API Security                Automated Rollback         Alerting
  Database Security           Blue/Green/Canary          SLO 99.9%
        ↓                           ↓                           ↓
AI PLATFORM (Part 14)          PERFORMANCE (Part 15)
  AI Gateway                    Horizontal Scaling
  Prompt Library                Redis Cache
  Multi-Model Support           Queue Workers
  AI Governance                 Read Replicas
  Human-in-the-Loop             High Performance APIs
```

### 🏆 Architectural Lock: Engineering Guardrails (Q223)

Per Chief Enterprise Architect's **highest engineering priority** recommendation, the **Engineering Guardrails** are hereby locked as **Architectural Decision Q223**. These are non-negotiable rules that every developer AND every AI coding agent must follow.

**Problem Solved**: As SUOP grows from a small implementation to a large enterprise platform, without strict guardrails, code quality degrades, modules become coupled, and the architecture erodes. These guardrails maintain architectural integrity at scale.

**10 Engineering Guardrails (Locked — Q223)**:

| # | Guardrail | Enforcement |
|---|---|---|
| 1 | **No module may access another module's database directly.** | Architectural review + linting rules |
| 2 | **All inter-module communication must occur through APIs or domain events.** | Code review + module boundary tests |
| 3 | **Business logic belongs in domain/application services, never in controllers or UI.** | ESLint rules + code review |
| 4 | **Every database change requires a migration and rollback plan.** | CI/CD gate (no migration = no merge) |
| 5 | **Every new feature must include automated tests.** | CI/CD gate (coverage < 80% = no merge) |
| 6 | **Every API must be documented with OpenAPI.** | CI/CD gate (no OpenAPI spec = no merge) |
| 7 | **Every asynchronous operation must be idempotent.** | Code review + integration tests |
| 8 | **Every production deployment must be reversible.** | CI/CD gate (rollback plan required) |
| 9 | **Every critical business event must be audited.** | Code review + audit integration tests |
| 10 | **Every AI-assisted action must be permission-checked and logged.** | AI Gateway enforcement + audit |

**Enforcement Mechanisms (Locked)**:
1. **CI/CD Gates**: Automated checks prevent non-compliant code from merging
2. **ESLint Rules**: Custom rules enforce architectural boundaries
3. **Code Review**: Mandatory review by Platform Kernel team for cross-cutting changes
4. **Architectural Fitness Tests**: Automated tests verify module boundaries
5. **AI Agent Compliance**: AI coding agents (Copilot, Claude, etc.) must be configured with these guardrails as system prompts

**Governance (Q223 — LOCKED)**: These guardrails are owned by the Enterprise Architect. Any exception requires explicit Architectural Decision Record (ADR) approval. No exceptions for "quick fixes" or "prototypes."

---

# Part 11: Enterprise Security Architecture

## 11.1 Security Philosophy (Locked)

**Security is a platform capability.**

Every request. Every API. Every login. Every business transaction. Must be verified.

Security is not a feature added at the end — it is built into every layer of the platform from day one.

## 11.2 Security Layers (Locked)

```text
Internet
    ↓
Cloudflare WAF (DDoS protection, WAF rules, rate limiting)
    ↓
API Gateway (authentication, rate limiting, IP whitelist)
    ↓
JWT Validation (access token verification)
    ↓
RBAC (role-based access control)
    ↓
Permission Engine (resource-level permissions)
    ↓
Business Validation (domain rules, tenant isolation)
    ↓
Audit Engine (all actions logged)
    ↓
Database (row-level security, encrypted)
```

### Defense in Depth Strategy
Each layer verifies security independently. If one layer is compromised, the next layer still protects the system.

| Layer | Security Check | Failure Response |
|---|---|---|
| **Cloudflare WAF** | DDoS, SQL injection, XSS, bot detection | Block request |
| **API Gateway** | Rate limit, IP whitelist, API key | Return 429/403 |
| **JWT Validation** | Token signature, expiry, issuer | Return 401 |
| **RBAC** | Role has permission for action | Return 403 |
| **Permission Engine** | Resource-level access (branch, department) | Return 403 |
| **Business Validation** | Domain rules, tenant isolation | Return 422 |
| **Audit Engine** | Log all actions | Log + alert on suspicious |
| **Database** | Row-level security, encryption | Enforce at query level |

## 11.3 Security Standards (Locked)

### Authentication
| Standard | Implementation |
|---|---|
| **JWT Access Token** | RS256 signed, 15-minute expiry |
| **Refresh Token** | Opaque token, 7-day expiry, rotated on use |
| **MFA** | TOTP (Authenticator app), SMS, Email, Security Key (FIDO2) |
| **OAuth2** | Authorization Code flow with PKCE |
| **SSO** | SAML 2.0, OIDC for enterprise identity providers |

### Authorization
| Standard | Implementation |
|---|---|
| **RBAC** | Role → Permission mapping (per Volume 0.5 Entities 611-612) |
| **Resource Permissions** | `MODULE:RESOURCE:ACTION` (e.g., `INVENTORY:PRODUCT:CREATE`) |
| **Record-Level Security** | Filter by `created_by`, `department_id`, `branch_id` |
| **Branch-Level Security** | User sees only their branch's data (unless cross-branch role) |
| **Company-Level Security** | Multi-tenant isolation via `company_id` on every query |

## 11.4 Encryption (Locked)

| Data State | Algorithm | Implementation |
|---|---|---|
| **Data in Transit** | TLS 1.3 | All connections (API, DB, Queue, Internal) |
| **Data at Rest** | AES-256 | Database (pgcrypto), Object Storage (SSE-S3), Backups |
| **Secrets** | Vault | HashiCorp Vault or cloud KMS; never in env files or code |
| **Passwords** | Argon2id | Per OWASP 2024 recommendations |
| **API Keys** | Argon2id hash | Stored hashed; displayed once on creation |
| **PII Fields** | AES-256 | Field-level encryption for salary, SSN, medical |
| **Backups** | AES-256 | Encrypted before leaving database |

## 11.5 API Security (Locked)

| Standard | Implementation |
|---|---|
| **Rate Limiting** | Per-endpoint, per-user, per-IP limits (per Volume 0.5 Entity 695) |
| **IP Whitelist** | Admin APIs restricted to corporate IPs |
| **API Keys** | For external integrations; hashed, rotated, scoped |
| **HMAC** | Request signing for webhook deliveries |
| **Replay Protection** | Nonce + timestamp window (5 minutes) |
| **CORS** | Strict origin allowlist; no wildcard in production |
| **Security Headers** | HSTS, X-Frame-Options, X-Content-Type-Options, CSP |
| **CSP** | Content Security Policy preventing XSS |

## 11.6 Database Security (Locked)

| Standard | Implementation |
|---|---|
| **Row-Level Security** | PostgreSQL RLS policies for multi-tenant isolation |
| **Encrypted Backups** | AES-256 encrypted backup files |
| **Read-only Analytics** | Analytics queries use read replicas with restricted permissions |
| **Audit Logging** | All DML operations logged via triggers or application-level audit |
| **Connection Encryption** | TLS 1.3 for all database connections |
| **Credential Rotation** | Database passwords rotated quarterly via Vault |

### PostgreSQL Row-Level Security Example
```sql
-- Enable RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: users see only their company's data
CREATE POLICY tenant_isolation ON inventory_transactions
    USING (company_id = current_setting('app.current_company_id')::uuid);

-- Policy: branch-level access
CREATE POLICY branch_access ON inventory_transactions
    USING (branch_id = ANY(
        SELECT branch_id FROM user_branch_access
        WHERE user_id = current_setting('app.current_user_id')::uuid
    ));
```

## 11.7 Security Operations (Locked)

| Operation | Tool | Frequency |
|---|---|---|
| **Intrusion Detection** | Cloudflare WAF + Falco (K8s) | Real-time |
| **Threat Intelligence** | Cloudflare + manual feeds | Continuous |
| **Vulnerability Scanning** | Trivy (containers) + npm audit | Every CI build |
| **Dependency Scanning** | Dependabot + Snyk | Daily |
| **Security Headers** | Nginx + Helmet (Node.js) | Every request |
| **CSP** | Nginx + Next.js | Every request |
| **Penetration Testing** | External firm | Annually |
| **Security Audits** | Internal + external | Quarterly |

## 11.8 Security Principles (Locked)

| Principle | Implementation |
|---|---|
| **Zero Trust** | Every request verified, no implicit trust |
| **Least Privilege** | Minimum permissions required for role |
| **Defense in Depth** | Multiple security layers, independent verification |
| **Secure by Default** | All features secure by default; opt-out requires approval |
| **Fail Secure** | On error, deny access (not grant) |
| **Complete Mediation** | Every access checked, not just first access |

---

# Part 12: Enterprise DevOps & Release Architecture

## 12.1 DevOps Philosophy (Locked)

**Every deployment must be automated. No manual production deployments.**

Manual deployments are error-prone, slow, and untraceable. Every deployment — from code commit to production — must be fully automated, tested, and reversible.

## 12.2 CI/CD Pipeline (Locked)

```text
Developer commits code
    ↓
Push to GitHub
    ↓
Pull Request created
    ↓
Code Review (mandatory, 2 approvers for main)
    ↓
┌─────────────────────────────────────────┐
│  AUTOMATED CI PIPELINE                  │
│  1. Lint (ESLint + Prettier)            │
│  2. Type Check (TypeScript)             │
│  3. Unit Tests (Jest, 80%+ coverage)    │
│  4. Integration Tests (Testcontainers)  │
│  5. Build Docker Image                  │
│  6. Security Scan (Trivy + npm audit)   │
│  7. Dependency Scan (Snyk)              │
│  8. Push to Container Registry          │
│  9. Deploy to Staging                   │
│ 10. E2E Tests (Playwright + Supertest)  │
│ 11. Performance Tests (k6, critical)    │
│ 12. Manual Approval (production only)   │
│ 13. Deploy to Production                │
│ 14. Smoke Tests                         │
│ 15. Health Check Verification           │
│ 16. Slack/Teams Notification            │
└─────────────────────────────────────────┘
```

## 12.3 Git Strategy (Locked)

```text
main          ← Production-ready code (protected, requires PR + 2 approvals)
    │
    ├── develop     ← Integration branch (protected, requires PR + 1 approval)
    │       │
    │       ├── feature/SUOP-1234-inventory-engine   ← Feature branches
    │       ├── feature/SUOP-1235-workflow-engine
    │       └── feature/SUOP-1236-pos-checkout
    │
    ├── release/v1.2.0    ← Release preparation
    │
    └── hotfix/v1.1.1     ← Production hotfixes
```

### Branch Rules (Locked)
| Branch | Protection | Merge Rule |
|---|---|---|
| `main` | Protected, 2 approvals, all CI passes | Squash merge only |
| `develop` | Protected, 1 approval, all CI passes | Squash merge |
| `feature/*` | None (developer-owned) | Squash merge to develop |
| `release/*` | Protected, 1 approval | Merge commit to main + develop |
| `hotfix/*` | Protected, 2 approvals | Merge commit to main + develop |

## 12.4 Release Strategy (Locked)

| Environment | Purpose | Data | Access |
|---|---|---|---|
| **Development** | Developer testing | Anonymized sample | Developers |
| **Testing** | Automated test execution | Test fixtures | CI/CD only |
| **UAT** | User acceptance testing | Anonymized production copy | QA + Product |
| **Staging** | Pre-production validation | Production-like | DevOps + QA |
| **Production** | Live system | Real data | Authorized users |

### Promotion Flow
```
Development → Testing → UAT → Staging → Production
                                                ↓
                                         (rollback if needed)
```

## 12.5 Automated Checks (Locked)

| Check | Tool | Gate |
|---|---|---|
| **Lint** | ESLint + Prettier | Must pass |
| **Type Check** | TypeScript compiler | Must pass |
| **Unit Tests** | Jest | 80%+ coverage |
| **Integration Tests** | Jest + Testcontainers | Must pass |
| **Security Scan** | Trivy (container) + npm audit | No critical/high vulnerabilities |
| **Dependency Scan** | Snyk | No critical vulnerabilities |
| **Coverage** | Jest + Istanbul | 80%+ (per Q210) |
| **Performance** | k6 (critical endpoints) | P95 < 500ms |
| **E2E Tests** | Playwright (frontend) + Supertest (API) | Must pass |
| **Contract Tests** | Pact | API contracts maintained |
| **OpenAPI Validation** | Spectral | OpenAPI spec valid |
| **Migration Check** | Prisma migrate | Migration + rollback exists |

## 12.6 Deployment Strategies (Locked)

| Strategy | When | Implementation |
|---|---|---|
| **Rolling** | Default for stateless services | K8s Deployment with `maxUnavailable: 25%` |
| **Blue/Green** | Major releases | Two environments; switch traffic instantly |
| **Canary** | Risky changes | Route 5% → 25% → 50% → 100% traffic |
| **Feature Flags** | All new features | LaunchDarkly or custom (per Volume 0.5 Entity 622) |
| **Rollback** | Any failed deployment | Helm rollback; automatic on health check failure |

### Zero Downtime Deployment Rules (Locked)
1. Database migrations must be backward-compatible (expand-then-contract pattern)
2. New code must work with old database schema (during rolling update)
3. Old code must work with new database schema (during rollback)
4. Health checks must pass before traffic routed to new pods
5. Graceful shutdown with 30-second drain period

## 12.7 Versioning (Locked)

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

| Version Part | When to Increment |
|---|---|
| **MAJOR** | Breaking changes (API contract changes, DB schema incompatible) |
| **MINOR** | New features (backward-compatible) |
| **PATCH** | Bug fixes (backward-compatible) |

### Version Tags
- Git tags: `v1.2.0`
- Docker images: `registry/suop-inventory:v1.2.0`, `registry/suop-inventory:latest`
- Helm charts: `chart-version: 1.2.0`

---

# Part 13: Enterprise Observability & Monitoring Architecture

## 13.1 Observability Philosophy (Locked)

**Every service must explain its health. Developers should know about failures before users do.**

Observability is not just monitoring — it's the ability to understand the internal state of the system from its external outputs (metrics, logs, traces).

## 13.2 Architecture (Locked)

```text
Applications + Platform Services
    ↓
    ├── Metrics (Prometheus)
    ├── Logs (Loki)
    ├── Traces (Tempo)
    └── Events (Event Bus monitoring)
    ↓
    ├── Alerting (Alertmanager)
    ├── Dashboards (Grafana)
    └── SLO Monitoring
    ↓
Operations Team (proactive, not reactive)
```

## 13.3 Monitoring Stack (Locked)

| Pillar | Tool | Purpose | Retention |
|---|---|---|---|
| **Metrics** | Prometheus | Time-series metrics collection | 90 days |
| **Visualization** | Grafana | Dashboards, alerting visualization | N/A |
| **Logs** | Loki | Log aggregation (structured JSON) | 30 days |
| **Tracing** | Tempo | Distributed tracing (request flow) | 7 days |
| **Telemetry** | OpenTelemetry | Instrumentation standard (SDK in all services) | N/A |
| **Alerting** | Alertmanager | Alert routing (Slack, Email, PagerDuty) | N/A |

## 13.4 Metrics (Locked)

### Standard Metrics Collected
| Category | Metrics |
|---|---|
| **CPU** | Usage %, throttling, load average |
| **Memory** | Usage %, RSS, heap, garbage collection |
| **Disk** | Usage %, IOPS, read/write latency |
| **API** | Request count, latency (P50/P95/P99), error rate, status codes |
| **Database** | Connection count, query latency, slow queries, replication lag |
| **Queue** | Depth, throughput, consumer count, DLQ depth |
| **Cache** | Hit rate, memory usage, eviction rate |
| **AI** | Token usage, cost, latency, model drift, hallucination rate |

### RED Method (Rate, Errors, Duration)
Every service exposes:
- **Rate**: Requests per second
- **Errors**: Error count/percentage
- **Duration**: Request latency (P50, P95, P99)

### USE Method (Utilization, Saturation, Errors)
Every resource exposes:
- **Utilization**: % of resource used
- **Saturation**: Amount of work queued
- **Errors**: Error count

## 13.5 Logging (Locked)

### Log Standards
| Standard | Implementation |
|---|---|
| **Structured JSON** | All logs in JSON format (not plain text) |
| **Correlation IDs** | Every log entry includes `correlationId` |
| **Trace IDs** | Every log entry includes `traceId` (for distributed tracing) |
| **Request IDs** | Every HTTP request has unique `requestId` |
| **Log Levels** | ERROR, WARN, INFO, DEBUG (configurable per environment) |
| **No PII in Logs** | PII fields redacted before logging |
| **Context Enrichment** | User ID, tenant ID, module, service automatically added |

### Log Structure (Locked)
```json
{
  "timestamp": "2026-07-08T10:30:00.123Z",
  "level": "INFO",
  "service": "inventory-service",
  "module": "inventory",
  "message": "Stock reserved for work order",
  "correlationId": "uuid-v7",
  "traceId": "uuid-v7",
  "requestId": "uuid-v7",
  "userId": "uuid-v7",
  "tenantId": "uuid-v7",
  "entityType": "inventory_reservation",
  "entityId": "uuid-v7",
  "metadata": {
    "productId": "uuid-v7",
    "quantity": 100,
    "workOrderId": "uuid-v7"
  }
}
```

## 13.6 Alerting (Locked)

### Alert Channels
| Channel | When | Severity |
|---|---|---|
| **PagerDuty** | Critical (service down, data loss) | Critical |
| **Slack** | High (degraded performance, error spike) | High |
| **Email** | Medium (warning threshold) | Medium |
| **SMS** | Critical (if PagerDuty unresponsive) | Critical |
| **WhatsApp** | Critical (business stakeholders) | Critical |

### Alert Rules (Locked)
| Alert | Condition | Severity | Action |
|---|---|---|---|
| Service Down | Health check fails for 2 min | Critical | Page on-call |
| High Error Rate | Error rate > 5% for 5 min | High | Slack alert |
| High Latency | P95 > 2000ms for 5 min | High | Slack alert |
| Database Connection Pool | Connections > 80% for 5 min | High | Slack alert |
| Queue Depth High | Queue depth > 1000 for 10 min | Medium | Email alert |
| Disk Space Low | Disk usage > 85% | High | Slack alert |
| Memory High | Memory > 90% for 5 min | High | Slack alert |
| Certificate Expiry | TLS cert expires in 30 days | Medium | Email alert |
| Backup Failed | Backup job failed | Critical | Page on-call |
| AI Cost Spike | Daily AI cost > 150% of average | Medium | Email alert |

## 13.7 SLO Monitoring (Locked)

| SLO | Target | Measurement |
|---|---|---|
| **Availability** | 99.9% | Uptime / total time (monthly) |
| **API Latency P95** | < 500ms | 95th percentile of API response time |
| **API Latency P99** | < 2000ms | 99th percentile |
| **Error Rate** | < 0.1% | Errors / total requests |
| **Recovery Time (RTO)** | < 30 minutes | Time from failure to recovery |
| **Recovery Point (RPO)** | < 1 minute | Max data loss on failure |

### Error Budget (Locked)
- 99.9% availability = 43.8 minutes downtime per month
- If error budget consumed: freeze feature deploys, focus on reliability

---

# Part 14: Enterprise AI Platform Architecture

## 14.1 AI Philosophy (Locked)

**AI is a platform. Not a chatbot. Every AI feature goes through one gateway.**

Per Q193 (Unified Enterprise AI Orchestrator): All AI capabilities flow through one orchestration layer. No module directly invokes LLMs.

## 14.2 AI Architecture (Locked)

```text
User (via Copilot, Dashboard, or API)
    ↓
AI Orchestrator (FS-54, Q193)
    ↓
    ├── Context Builder (gathers relevant data + permissions)
    ├── Knowledge Graph (semantic search, knowledge retrieval)
    └── Prompt Engine (selects + versioned prompt template)
    ↓
AI Gateway (FS-51)
    ↓
Model Router (selects optimal model based on task, cost, latency)
    ↓
LLM Provider (OpenAI / Azure / Gemini / Anthropic / Local)
    ↓
Response Processing (validation, citation, safety check)
    ↓
Business Actions (if action required: workflow trigger, tool call)
    ↓
Audit (all AI decisions logged)
```

## 14.3 AI Layers (Locked)

| Layer | Responsibility | Implementation |
|---|---|---|
| **Prompt Layer** | Prompt templates, versioning, variables | Prompt Library (Volume 0.5 Entity 723) |
| **Reasoning Layer** | Intent detection, task planning, multi-step reasoning | Task Planner (Volume 0.5 Entity 783) |
| **Knowledge Layer** | Knowledge graph, semantic search, context | Knowledge Graph (Volume 0.5 Entity 733) |
| **Tool Layer** | Function calling, API invocation, workflow trigger | Tool Registry (Volume 0.5 Entity 784) |
| **Execution Layer** | Action execution, human approval, autonomous workflow | Autonomous Workflow (Volume 0.5 Entity 786) |
| **Audit Layer** | All AI decisions logged, immutable | AI Audit (Volume 0.5 Entity 729) |

## 14.4 AI Models (Locked)

| Provider | Models | Use Cases |
|---|---|---|
| **OpenAI** | GPT-4 Turbo, GPT-4o, GPT-4o-mini | General text, reasoning, function calling |
| **Azure OpenAI** | Same as OpenAI (enterprise) | Enterprise compliance, data residency |
| **Gemini** | Gemini 1.5 Pro, Flash | Multimodal, long context |
| **Anthropic** | Claude 3.5 Sonnet, Opus | Reasoning, coding, analysis |
| **Local Models** | Llama 3, Mistral (via Ollama/vLLM) | Privacy-sensitive, offline, cost optimization |

### Model Selection Rules (Locked)
| Task | Primary Model | Fallback |
|---|---|---|
| Complex reasoning | GPT-4 Turbo / Claude 3.5 Opus | Gemini 1.5 Pro |
| Fast text generation | GPT-4o-mini / Claude Haiku | Local Llama |
| Code generation | Claude 3.5 Sonnet | GPT-4 Turbo |
| Vision/image analysis | GPT-4o / Gemini 1.5 Pro | Azure OpenAI GPT-4 |
| Embeddings | text-embedding-3-small | Local embedding model |
| Cost-sensitive batch | Local Llama 3 | GPT-4o-mini |

## 14.5 AI Governance (Locked)

| Governance Area | Implementation |
|---|---|
| **Prompt Versioning** | All prompts versioned (Volume 0.5 Entity 724); rollback supported |
| **Approval** | High-risk AI actions require human approval (Volume 0.5 Entity 787) |
| **Audit** | All AI requests/responses logged (Volume 0.5 Entity 729) |
| **Cost Monitoring** | Per-user, per-module, per-tenant cost tracking (Volume 0.5 Entity 727) |
| **Safety Policies** | Content filtering, hallucination detection, bias detection |
| **Hallucination Detection** | Citation verification, confidence scoring, fact-checking |

## 14.6 AI Security (Locked)

| Security Area | Implementation |
|---|---|
| **Permission Validation** | AI actions checked against user's RBAC permissions |
| **Context Filtering** | Only data user has permission to see is included in context |
| **PII Protection** | PII redacted before sending to LLM |
| **Sensitive Data Masking** | Salary, SSN, medical data masked in prompts |
| **Human Approval** | High-risk actions require human approval before execution |
| **Prompt Injection Prevention** | Input sanitization, system prompt isolation |
| **Output Validation** | AI responses validated against schema before action |

---

# Part 15: Enterprise Performance & Scalability

## 15.1 Philosophy (Locked)

**The ERP should support 10 → 100 → 1,000 → 10,000 → 100,000 users without redesign.**

The architecture must scale horizontally from day one. No component should require redesign when user count increases by 10x.

## 15.2 Scaling Architecture (Locked)

```text
Load Balancer (Cloudflare + Nginx)
    ↓
Kubernetes Cluster (Horizontal Pod Autoscaler)
    ↓
Application Pods (stateless, auto-scaling)
    ↓
    ├── Redis (cache, sessions, rate limiting)
    ├── RabbitMQ (event bus, job queue)
    ├── PostgreSQL (primary + read replicas)
    └── Object Storage (MinIO / S3)
    ↓
Analytics (separate cluster, read replicas, data warehouse)
```

## 15.3 Performance Standards (Locked)

| Component | Target | Measurement |
|---|---|---|
| **API Response (P95)** | < 200ms | 95th percentile of API latency |
| **API Response (P99)** | < 500ms | 99th percentile |
| **Dashboard Load** | < 2 seconds | Time to interactive |
| **Search Query** | < 500ms | Full-text search latency |
| **Barcode Scan → Result** | < 100ms | Scan to UI response |
| **Report Generation** | Async (background) | Non-blocking; user notified on completion |
| **WebSocket Message Delivery** | < 100ms | Publish to receive |
| **Database Query (P95)** | < 50ms | 95th percentile query latency |

## 15.4 Caching (Locked)

| Cache Type | Technology | TTL | Use Case |
|---|---|---|---|
| **Distributed Cache** | Redis | 5-30 min | Frequently accessed data (product master, config) |
| **Application Cache** | In-memory (Node.js) | 1-5 min | Static lookups, enumerations |
| **Query Cache** | PostgreSQL + Redis | 5 min | Expensive query results |
| **CDN Cache** | Cloudflare | 1 hour | Static assets, images, JS/CSS |
| **API Response Cache** | Redis + Nginx | 30 sec - 5 min | GET responses for list endpoints |

### Cache Invalidation Rules (Locked)
1. **Write-through**: Write to DB + cache simultaneously (for critical data)
2. **Write-behind**: Write to cache, async write to DB (for non-critical)
3. **TTL-based**: Auto-expire after configured time
4. **Event-based**: Invalidate cache when domain event published
5. **Manual**: Admin can force-clear cache via API

## 15.5 Database Performance (Locked)

| Technique | Implementation |
|---|---|
| **Connection Pooling** | PgBouncer (transaction pooling mode) |
| **Read Replicas** | 2 read replicas; analytics/read queries routed to replicas |
| **Partitioning** | Time-series tables partitioned by month (audit_events, sensor_readings) |
| **Materialized Views** | Pre-aggregated analytics (daily sales, monthly summaries) |
| **Indexing** | All foreign keys indexed; composite indexes for common queries |
| **Query Optimization** | EXPLAIN ANALYZE on all queries; no N+1 queries (Prisma includes) |
| **Slow Query Logging** | Queries > 100ms logged for analysis |

## 15.6 Background Processing (Locked)

| Component | Purpose | Technology |
|---|---|---|
| **Job Queue** | Background jobs (reports, imports, exports) | BullMQ (Redis-backed) |
| **Event Bus** | Domain events | RabbitMQ |
| **Workers** | Job processors | BullMQ workers + RabbitMQ consumers |
| **Scheduler** | Cron jobs, scheduled tasks | BullMQ Scheduler + K8s CronJobs |

### Background Processing Rules (Locked)
1. Any operation taking > 2 seconds must be async (background job)
2. All background jobs must be idempotent (per Guardrail #7, Q223)
3. All background jobs must have retry policy (max 3 retries, exponential backoff)
4. All background jobs must be monitored (queue depth, processing time, failure rate)
5. Failed jobs go to Dead Letter Queue for manual review

## 15.7 Horizontal Scaling (Locked)

| Component | Scaling Strategy | Auto-Scaling Trigger |
|---|---|---|
| **Application Pods** | HPA (Horizontal Pod Autoscaler) | CPU > 70%, or queue depth > threshold |
| **BFF Pods** | HPA per BFF | CPU > 70%, or request rate > threshold |
| **Workers** | HPA based on queue depth | Queue depth > 100 |
| **PostgreSQL** | Read replicas (not horizontal) | Connection count > 80% |
| **Redis** | Cluster mode (sharding) | Memory > 70% |
| **RabbitMQ** | Cluster (3 nodes min) | Queue depth > threshold |

### Stateless Services Rule (Locked)
All application services must be **stateless**. No session data, no local file storage, no in-memory state that can't be reconstructed. This enables horizontal scaling without session affinity.

## 15.8 Load Testing (Locked)

| Tool | Purpose | Frequency |
|---|---|---|
| **k6** | API load testing | Every release (critical endpoints) |
| **k6** | Database load testing | Monthly |
| **k6** | Queue load testing | Monthly |
| **k6** | WebSocket load testing | Monthly |

### Load Test Scenarios (Locked)
| Scenario | Target | Pass Criteria |
|---|---|---|
| Normal load | 100 RPS for 10 min | P95 < 200ms, 0 errors |
| Peak load | 500 RPS for 5 min | P95 < 500ms, < 0.1% errors |
| Spike load | 1000 RPS for 1 min | P95 < 1000ms, < 1% errors |
| Soak test | 100 RPS for 2 hours | No memory leaks, P95 < 200ms |
| Database | 100 concurrent queries | All complete < 500ms |

---

# Batch 3 Completion Summary

## Architectural Decisions Locked (Volume 0.75 Batch 3)

| Decision ID | Decision | Part |
|---|---|---|
| **Q223** | **Engineering Guardrails (10 non-negotiable rules)** | Part 11-15 |
| Q224 | Zero Trust Security Architecture | Part 11 |
| Q225 | End-to-End Encryption (TLS 1.3 + AES-256 + Argon2id + Vault) | Part 11 |
| Q226 | Database Row-Level Security for Multi-Tenant Isolation | Part 11 |
| Q227 | No Manual Production Deployments (CI/CD mandatory) | Part 12 |
| Q228 | Zero Downtime Deployment (expand-then-contract migrations) | Part 12 |
| Q229 | Semantic Versioning (MAJOR.MINOR.PATCH) | Part 12 |
| Q230 | Observability Three Pillars (Metrics + Logs + Traces) | Part 13 |
| Q231 | Structured JSON Logging with Correlation/Trace IDs | Part 13 |
| Q232 | 99.9% SLO with Error Budget Management | Part 13 |
| Q233 | AI Platform: All AI Through One Gateway (per Q193) | Part 14 |
| Q234 | AI Security: Permission Validation + PII Protection + Human Approval | Part 14 |
| Q235 | Horizontal Scaling: 10x Growth Without Redesign | Part 15 |
| Q236 | Performance Standards (API < 200ms P95, Dashboard < 2s) | Part 15 |
| Q237 | All Services Stateless (enables horizontal scaling) | Part 15 |
| Q238 | Background Processing: All > 2s Operations Async | Part 15 |

**Cumulative Architectural Decisions**: 238 (Q1-Q238)

## 10 Engineering Guardrails (Q223 — LOCKED)

| # | Guardrail |
|---|---|
| 1 | No module may access another module's database directly. |
| 2 | All inter-module communication must occur through APIs or domain events. |
| 3 | Business logic belongs in domain/application services, never in controllers or UI. |
| 4 | Every database change requires a migration and rollback plan. |
| 5 | Every new feature must include automated tests. |
| 6 | Every API must be documented with OpenAPI. |
| 7 | Every asynchronous operation must be idempotent. |
| 8 | Every production deployment must be reversible. |
| 9 | Every critical business event must be audited. |
| 10 | Every AI-assisted action must be permission-checked and logged. |

## Volume 0.75 Progress Tracker

| Batch | Parts | Status |
|---|---|---|
| Batch 1 | 1-5 (Solution Arch, Tech Stack, Monorepo, Database, Backend) | ✅ COMPLETE |
| Batch 2 | 6-10 (Frontend, Mobile, API, Events, Infrastructure) | ✅ COMPLETE |
| **Batch 3** | **11-15 (Security, DevOps, Observability, AI, Performance)** | **✅ COMPLETE (LOCKED)** |
| Batch 4 (Final) | 16-20 (DR, Coding Standards, UI/UX, Dev Standards, Engineering Playbook) | ⏳ PENDING |

## Cumulative Status

| Metric | Value |
|---|---|
| Volume 0.5 Entities | 815 |
| Foundation Services | 66 + Platform Kernel (Q189/Q192) |
| Architectural Decisions | **238** (Q1-Q238) |
| Volume 0.75 Parts Complete | 15 of ~20 (**75%**) |

---

*End of Volume 0.75 Batch 3. Next batch (FINAL): Parts 16-20 (Disaster Recovery, Coding Standards, UI/UX Design System, Development Process & QA, Enterprise Engineering Playbook). After that, Volume 0.75 will be 100% complete.*
