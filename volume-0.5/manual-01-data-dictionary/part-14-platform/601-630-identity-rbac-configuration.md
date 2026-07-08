# Manual 1 · Part 14 · Sections 1-3 · Entities 601-630 — Identity, RBAC & Configuration

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 14 — Enterprise Platform Services (EPS) |
| Sections | 1 (Enterprise Identity, Authentication & Organization Services), 2 (RBAC, Security & Authorization Framework), 3 (Enterprise Configuration, Feature Flags & Master Settings) |
| Entities | 601–630 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 4-9, Part 14 §1-3 |
| Last Updated | 2026-07-08 |
| Importance | **HIGHEST — Technical foundation of entire SUOP platform** |

---

## Overview — The Enterprise Platform (Most Important Part of SUOP)

Part 14 is **NOT another business module**. It is the **Enterprise Platform** — the technical foundation upon which every business module (Inventory, Warehouse, Manufacturing, Retail, Restaurant, Finance, HR, Maintenance) depends.

Without Part 14:
- Modules cannot authenticate users consistently
- Modules cannot authorize actions uniformly
- Modules cannot configure behavior without code changes
- Modules cannot communicate via events
- Modules cannot audit actions in a standardized way

```
IDENTITY & AUTH (Sec 1: 601-610)
  User → Authentication → Identity Service → RBAC → Organization → Applications → API Gateway → Audit
  ↓ Authorizes via
RBAC & SECURITY (Sec 2: 611-620)
  Identity → Role → Permission → Policy → Application → Feature → Action
  ↓ Configured by
CONFIGURATION (Sec 3: 621-630)
  System Settings → Configuration Engine → Feature Flags → Business Rules → Applications
```

### 🏆 Architectural Lock: Platform Kernel (Q189 — MOST IMPORTANT DECISION IN SUOP)

Per Chief Enterprise Architect's strongest recommendation, the **Platform Kernel** is hereby locked as **Architectural Decision Q189** — the most important architectural decision in the entire SUOP platform.

**Problem Solved**: Eliminate duplicated platform functionality across modules.

**Anti-Pattern (Forbidden)**:
```
Inventory ──► Authentication (custom)
Warehouse ──► Authentication (custom)
Finance ──► Authentication (custom)
HR ──► Authentication (custom)
[... each module reinvents platform services ...]
```

**Locked Pattern — Platform Kernel**:
```
Platform Kernel (single shared kernel)
│
├── Identity Service (FS-1)
├── RBAC Engine (FS-2)
├── Configuration Engine (FS-6)
├── Feature Flag Engine (FS-46, NEW)
├── Number Series Engine (FS-47, NEW)
├── Audit Engine (FS-5)
├── Notification Engine (FS-4)
├── Workflow Engine (FS-3)
├── Search Engine (FS-48, NEW)
├── API Gateway (FS-7)
├── Event Bus (FS-49, NEW)
├── File Engine (FS-11)
├── Barcode Engine (FS-12)
├── Print Engine (FS-50, NEW)
└── AI Gateway (FS-51, NEW)
```

**Architectural Benefits (Locked)**:
1. **Eliminate duplicated code** across all modules
2. **Standardize security and configuration** enterprise-wide
3. **Simplify testing and maintenance** — one implementation per concern
4. **Enable future modules** (CRM, Sales, Customer Portal, Supplier Portal) to be built faster
5. **Provide clean path** from modular monolith → microservices if required
6. **Single source of truth** for cross-cutting concerns
7. **Consistent audit trail** across all modules
8. **Unified developer experience** — one way to authenticate, authorize, configure, notify, audit

**Governance**: All Foundation Services (FS-1 through FS-51) are owned by the Platform Kernel team. Business modules **consume** these services via well-defined contracts; they **never implement** platform concerns internally.

**Migration Path**: Modular monolith initially (all services in one deployment for simplicity) → evolve to microservices when scale demands (each Foundation Service becomes independently deployable).

---

# SECTION 1: Enterprise Identity, Authentication & Organization Services (Entities 601-610)

## Entity 601 — Identity Master

### 1. Business Purpose
Per Part 14 §1: Stores Identity ID, Username, Email, Mobile, Password Hash, Status, Last Login, MFA Enabled. The single source of truth for user identity across the entire SUOP platform.

### 2. Architectural Role
**Foundational master entity** — every user (employee, vendor, customer, system) has exactly one Identity Master record. This identity is referenced by all modules via the Platform Kernel's Identity Service (FS-1).

### 3. Business Rules
- **One identity per person** — never duplicated across modules (per Part 14: "Identity should never be duplicated across modules")
- Identity types: EMPLOYEE, VENDOR_USER, CUSTOMER_USER, SYSTEM_SERVICE, IOT_DEVICE, API_CLIENT
- Username is unique enterprise-wide (not per-company)
- Email and Mobile are unique per identity type
- Password hash uses Argon2id (per OWASP 2024 recommendations)
- Status transitions governed by Identity Lifecycle state machine
- Soft-delete only — identities are never hard-deleted (audit retention)
- Identity links to Workforce Master (Entity 381) for employees via workforce_id

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `identity_id` | VARCHAR(50) | Yes | — | Unique enterprise-wide | Identity ID (per Part 14) — display identifier | Internal |
| `username` | VARCHAR(100) | Yes | — | Unique enterprise-wide | Username | Confidential |
| `email` | VARCHAR(200) | Yes | — | Unique, email format | Email (per Part 14) | Confidential |
| `email_verified` | BOOLEAN | Yes | `false` | — | Email verified | Internal |
| `email_verified_at` | TIMESTAMPTZ | No | NULL | — | Verification time | Internal |
| `mobile` | VARCHAR(20) | No | NULL | E.164 format, unique if not null | Mobile (per Part 14) | Confidential |
| `mobile_verified` | BOOLEAN | Yes | `false` | — | Mobile verified | Internal |
| `mobile_verified_at` | TIMESTAMPTZ | No | NULL | — | Verification time | Internal |
| `password_hash` | VARCHAR(500) | No | NULL | — | Password Hash (per Part 14) — Argon2id | Restricted |
| `password_algorithm` | VARCHAR(20) | Yes | `ARGON2ID` | — | Algorithm | Internal |
| `password_changed_at` | TIMESTAMPTZ | No | NULL | — | Last change | Internal |
| `password_expires_at` | TIMESTAMPTZ | No | NULL | — | Expiry (per policy) | Internal |
| `mfa_enabled` | BOOLEAN | Yes | `false` | — | MFA Enabled (per Part 14) | Internal |
| `mfa_enforced` | BOOLEAN | Yes | `false` | — | Required by policy | Internal |
| `mfa_factors_count` | INTEGER | Yes | `0` | ≥ 0 | Active factors | Internal |
| `identity_type` | ENUM | Yes | — | EMPLOYEE, VENDOR_USER, CUSTOMER_USER, SYSTEM_SERVICE, IOT_DEVICE, API_CLIENT, PARTNER | Type | Internal |
| `workforce_id` | UUID | No | NULL | FK to `workforce_master` (Entity 381) | Linked employee | Confidential |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | Linked vendor | Confidential |
| `customer_id` | UUID | No | NULL | FK to `customers` | Linked customer | Confidential |
| `primary_company_id` | UUID | Yes | — | FK to `companies` | Primary company | Internal |
| `accessible_company_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Multi-company access | Confidential |
| `primary_branch_id` | UUID | No | NULL | FK to `branch_master` (Entity 606) | Primary branch | Internal |
| `display_name` | VARCHAR(200) | Yes | — | Min 2 | Display name | Internal |
| `avatar_attachment_id` | UUID | No | NULL | FK to `attachments` | Avatar | Internal |
| `preferred_language` | VARCHAR(10) | Yes | `en-IN` | — | Language | Internal |
| `preferred_timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `last_login_at` | TIMESTAMPTZ | No | NULL | — | Last Login (per Part 14) | Internal |
| `last_login_ip` | INET | No | NULL | — | Last login IP | Confidential |
| `last_login_device_id` | UUID | No | NULL | FK to `device_registry` (Entity 604) | Last device | Confidential |
| `login_count` | INTEGER | Yes | `0` | ≥ 0 | Total logins | Internal |
| `failed_login_count` | INTEGER | Yes | `0` | ≥ 0 | Consecutive failures | Confidential |
| `account_locked_until` | TIMESTAMPTZ | No | NULL | — | Lock until | Confidential |
| `account_locked_reason` | TEXT | No | NULL | — | Lock reason | Confidential |
| `password_reset_token` | VARCHAR(200) | No | NULL | — | Reset token | Restricted |
| `password_reset_expires_at` | TIMESTAMPTZ | No | NULL | — | Expiry | Internal |
| `email_verification_token` | VARCHAR(200) | No | NULL | — | Verification token | Restricted |
| `terms_accepted_at` | TIMESTAMPTZ | No | NULL | — | T&C accepted | Internal |
| `privacy_policy_accepted_at` | TIMESTAMPTZ | No | NULL | — | Privacy accepted | Internal |
| `deactivated_at` | TIMESTAMPTZ | No | NULL | — | Deactivation | Internal |
| `deactivated_by` | UUID | No | NULL | FK to `identity_master` (self) | Deactivator | Confidential |
| `deactivation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `current_status` | ENUM | Yes | `PENDING_VERIFICATION` | PENDING_VERIFICATION, ACTIVE, SUSPENDED, LOCKED, DEACTIVATED, TERMINATED | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | One-to-One | 1:1 | Employee link |
| Authentication Provider (602) | One-to-Many | 1:N | Multiple auth methods |
| Session Management (603) | One-to-Many | 1:N | Active sessions |
| Device Registry (604) | Many-to-Many | N:N | Registered devices |
| User Profile (608) | One-to-One | 1:1 | Profile |
| Login History (609) | One-to-Many | 1:N | History |

### 6. Indexes
- UNIQUE (`identity_id`)
- UNIQUE (`username`)
- UNIQUE (`email`)
- UNIQUE (`mobile`) WHERE `mobile IS NOT NULL`
- INDEX (`workforce_id`) WHERE `workforce_id IS NOT NULL`
- INDEX (`primary_company_id`, `current_status`)
- INDEX (`current_status`, `account_locked_until`)
- INDEX (`email_verified`, `mobile_verified`)

### 7. Security Classification
**Restricted** — password hash, tokens, and PII are highly sensitive.

### 8. Integration Points
- **Identity Service** (FS-1): Primary consumer
- **RBAC Engine** (FS-2): Authorization checks
- **Audit Engine** (FS-5): All identity events
- **Notification Engine** (FS-4): Verification emails/SMS
- **All Business Modules**: Via Platform Kernel SSO

### 9. Sample Data
```json
{
  "identity_id": "ID-SUOP-001234", "username": "rajesh.kumar",
  "email": "rajesh.kumar@sudhastar.com", "email_verified": true,
  "mobile": "+919876543210", "mobile_verified": true,
  "password_algorithm": "ARGON2ID", "mfa_enabled": true,
  "mfa_factors_count": 2, "identity_type": "EMPLOYEE",
  "workforce_id": "wf-001", "primary_company_id": "cmp-001",
  "accessible_company_ids": ["cmp-001", "cmp-002"],
  "primary_branch_id": "br-mum-001", "display_name": "Rajesh Kumar",
  "preferred_language": "en-IN", "preferred_timezone": "Asia/Kolkata",
  "last_login_at": "2026-07-08T09:30:00Z", "login_count": 245,
  "current_status": "ACTIVE", "status": "ACTIVE"
}
```

### 10. Audit Events
`IDENTITY_CREATED`, `IDENTITY_VERIFIED`, `IDENTITY_ACTIVATED`, `IDENTITY_LOGIN_SUCCESS`, `IDENTITY_LOGIN_FAILED`, `IDENTITY_LOCKED`, `IDENTITY_UNLOCKED`, `IDENTITY_PASSWORD_CHANGED`, `IDENTITY_MFA_ENABLED`, `IDENTITY_MFA_DISABLED`, `IDENTITY_SUSPENDED`, `IDENTITY_REACTIVATED`, `IDENTITY_DEACTIVATED`, `IDENTITY_TERMINATED`

---

## Entity 602 — Authentication Provider

### 1. Business Purpose
Per Part 14 §1: Supports Local, Google, Microsoft, Apple, LDAP, SAML, OAuth. Multi-provider authentication integration.

### 2. Architectural Role
Configuration entity — defines external authentication providers. One identity may have multiple linked providers (e.g., Local + Google + Microsoft).

### 3. Business Rules
- Provider types: LOCAL (password), GOOGLE, MICROSOFT, APPLE, LDAP, SAML, OAUTH2, OIDC, SSO_CUSTOM
- Each provider has unique configuration (client_id, secret, endpoints)
- Provider linkage: one identity can be linked to multiple providers
- Just-in-time provisioning: new users auto-created on first SSO login (if allowed)
- Provider priority: fallback chain if primary fails
- Security: provider secrets encrypted at rest

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `provider_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `provider_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `provider_type` | ENUM | Yes | — | LOCAL, GOOGLE, MICROSOFT, APPLE, LDAP, SAML, OAUTH2, OIDC, SSO_CUSTOM | Type (per Part 14) | Internal |
| `protocol` | ENUM | Yes | — | PASSWORD, OAUTH2, OIDC, SAML2, LDAP, SCIM, CUSTOM | Protocol | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `is_primary` | BOOLEAN | Yes | `false` | — | Primary provider | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Fallback priority | Internal |
| `client_id` | VARCHAR(200) | No | NULL | — | OAuth client ID | Confidential |
| `client_secret_encrypted` | TEXT | No | NULL | — | Encrypted secret | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `authorization_endpoint` | VARCHAR(500) | No | NULL | — | Auth URL | Internal |
| `token_endpoint` | VARCHAR(500) | No | NULL | — | Token URL | Internal |
| `userinfo_endpoint` | VARCHAR(500) | No | NULL | — | Userinfo URL | Internal |
| `redirect_uri` | VARCHAR(500) | No | NULL | — | Redirect URI | Internal |
| `scope` | VARCHAR(500) | No | NULL | — | OAuth scopes | Internal |
| `ldap_server_url` | VARCHAR(500) | No | NULL | — | LDAP URL | Confidential |
| `ldap_base_dn` | VARCHAR(200) | No | NULL | — | Base DN | Confidential |
| `ldap_bind_dn` | VARCHAR(200) | No | NULL | — | Bind DN | Confidential |
| `ldap_bind_password_encrypted` | TEXT | No | NULL | — | Bind password | Restricted |
| `saml_metadata_url` | VARCHAR(500) | No | NULL | — | SAML metadata | Internal |
| `saml_entity_id` | VARCHAR(200) | No | NULL | — | Entity ID | Internal |
| `saml_x509_certificate` | TEXT | No | NULL | — | Certificate | Confidential |
| `saml_private_key_encrypted` | TEXT | No | NULL | — | Private key | Restricted |
| `jit_provisioning_enabled` | BOOLEAN | Yes | `false` | — | Auto-create users | Internal |
| `jit_default_identity_type` | ENUM | No | NULL | EMPLOYEE, VENDOR_USER, CUSTOMER_USER | Default type | Internal |
| `jit_default_company_id` | UUID | No | NULL | FK to `companies` | Default company | Internal |
| `jit_default_role_id` | UUID | No | NULL | FK to `role_master` (Entity 611) | Default role | Confidential |
| `attribute_mapping` | JSONB | Yes | `'{}'` | — | { email: "mail", name: "displayName", ... } | Confidential |
| `group_mapping` | JSONB | No | NULL | — | Provider group → SUOP role | Confidential |
| `auto_link_existing_identities` | BOOLEAN | Yes | `true` | — | Link by email | Internal |
| `requires_local_password` | BOOLEAN | Yes | `false` | — | Also requires local | Internal |
| `logo_attachment_id` | UUID | No | NULL | FK to `attachments` | Provider logo | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Master (601) | Many-to-Many | N:N | Via identity_provider_links |
| Role Master (611) | Many-to-One | N:1 | Default role for JIT |

### 6. Indexes
- UNIQUE (`provider_code`)
- INDEX (`provider_type`, `status`)
- INDEX (`is_active`, `is_primary`)

### 7. Security Classification
**Restricted** — secrets, certificates, and private keys.

### 8. Integration Points
- **Identity Service** (FS-1): Authentication routing
- **API Gateway** (FS-7): Token validation
- **Audit Engine** (FS-5): Auth events
- **Notification Engine** (FS-4): Provider-linked notifications

### 9. Sample Data
```json
{
  "provider_code": "AUTH-GOOGLE", "provider_name": "Google Workspace",
  "provider_type": "GOOGLE", "protocol": "OIDC",
  "is_active": true, "is_primary": false, "priority": 50,
  "client_id": "xxxxxxxxxxxx.apps.googleusercontent.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "scope": "openid email profile", "jit_provisioning_enabled": true,
  "jit_default_identity_type": "EMPLOYEE",
  "jit_default_company_id": "cmp-001",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`AUTH_PROVIDER_REGISTERED`, `AUTH_PROVIDER_UPDATED`, `AUTH_PROVIDER_ACTIVATED`, `AUTH_PROVIDER_DEACTIVATED`, `AUTH_PROVIDER_SECRET_ROTATED`, `AUTH_PROVIDER_JIT_PROVISIONING_OCCURRED`

---

## Entity 603 — Session Management

### 1. Business Purpose
Per Part 14 §1: Tracks Login, Logout, Refresh Token, Device, IP, Location. Active session registry.

### 2. Architectural Role
Operational entity — every active session creates a record. JWT refresh tokens managed here. Critical for security monitoring and forced logout.

### 3. Business Rules
- Session token: JWT (access) + opaque (refresh) — access 15 min, refresh 7 days typical
- Concurrent sessions: configurable per identity (default 5)
- Session invalidation: on password change, all other sessions revoked
- Geographic tracking: IP → geo-location for impossible travel detection
- Device fingerprint: unique per browser/app
- Auto-logout: idle timeout (30 min typical, configurable)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `session_id` | VARCHAR(200) | Yes | — | Unique | Session token ID | Confidential |
| `identity_id` | UUID | Yes | — | FK to `identity_master` (Entity 601) | Identity | Confidential |
| `session_type` | ENUM | Yes | — | WEB, MOBILE_APP, TABLET, API, KIOSK, POS, SERVICE_ACCOUNT, IOT_GATEWAY | Type | Internal |
| `device_id` | UUID | No | NULL | FK to `device_registry` (Entity 604) | Device (per Part 14) | Confidential |
| `device_fingerprint` | VARCHAR(200) | No | NULL | — | Browser/app fingerprint | Confidential |
| `client_ip` | INET | Yes | — | — | IP (per Part 14) | Confidential |
| `client_user_agent` | TEXT | Yes | — | — | User agent | Confidential |
| `geolocation` | JSONB | No | NULL | — | { lat, lon, city, country } | Confidential |
| `login_at` | TIMESTAMPTZ | Yes | `now()` | — | Login (per Part 14) | Internal |
| `logout_at` | TIMESTAMPTZ | No | NULL | — | Logout (per Part 14) | Internal |
| `last_activity_at` | TIMESTAMPTZ | Yes | `now()` | — | Last activity | Internal |
| `expires_at` | TIMESTAMPTZ | Yes | — | > login_at | Expiry | Internal |
| `duration_seconds` | INTEGER | No | NULL | ≥ 0 | Session duration | Internal |
| `access_token` | TEXT | No | NULL | — | JWT access token | Restricted |
| `access_token_expires_at` | TIMESTAMPTZ | Yes | — | — | Access expiry | Internal |
| `refresh_token` | TEXT | No | NULL | — | Refresh token (per Part 14) | Restricted |
| `refresh_token_expires_at` | TIMESTAMPTZ | Yes | — | — | Refresh expiry | Internal |
| `refresh_token_count` | INTEGER | Yes | `0` | ≥ 0 | Refreshes | Internal |
| `authentication_provider_id` | UUID | Yes | — | FK to `authentication_providers` (Entity 602) | Auth provider | Internal |
| `mfa_verified` | BOOLEAN | Yes | `false` | — | MFA completed | Internal |
| `mfa_verified_at` | TIMESTAMPTZ | No | NULL | — | MFA time | Internal |
| `mfa_method_used` | ENUM | No | NULL | OTP, AUTHENTICATOR_APP, EMAIL, SMS, SECURITY_KEY | MFA method | Internal |
| `risk_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Risk score | Confidential |
| `risk_factors` | JSONB | No | NULL | — | Detected risks | Confidential |
| `is_suspicious` | BOOLEAN | Yes | `false` | — | Flagged | Confidential |
| `revoked_at` | TIMESTAMPTZ | No | NULL | — | Revocation | Internal |
| `revoked_by` | UUID | No | NULL | FK to `identity_master` | Revoker | Confidential |
| `revocation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Active company context | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Active branch | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, LOGGED_OUT, REVOKED, SUSPENDED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Master (601) | Many-to-One | N:1 | Identity |
| Device Registry (604) | Many-to-One | N:1 | Device |
| Authentication Provider (602) | Many-to-One | N:1 | Provider |

### 6. Indexes
- UNIQUE (`session_id`)
- INDEX (`identity_id`, `current_status`)
- INDEX (`current_status`, `expires_at`)
- INDEX (`client_ip`, `login_at`)
- INDEX (`last_activity_at`)

### 7. Security Classification
**Restricted** — tokens and risk data are highly sensitive.

### 8. Integration Points
- **Identity Service** (FS-1): Session lifecycle
- **API Gateway** (FS-7): Token validation
- **Audit Engine** (FS-5): Session events
- **AI Security Service**: Risk scoring
- **Notification Engine** (FS-4): Suspicious activity alerts

### 9. Sample Data
```json
{
  "session_id": "SES-2026-07-08-001234", "identity_id": "id-001",
  "session_type": "WEB", "client_ip": "192.168.1.50",
  "client_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
  "geolocation": { "city": "Mumbai", "country": "IN", "lat": 19.076, "lon": 72.8777 },
  "login_at": "2026-07-08T09:30:00Z", "last_activity_at": "2026-07-08T10:15:00Z",
  "expires_at": "2026-07-08T17:30:00Z", "access_token_expires_at": "2026-07-08T09:45:00Z",
  "refresh_token_expires_at": "2026-07-15T09:30:00Z", "refresh_token_count": 2,
  "authentication_provider_id": "ap-001", "mfa_verified": true,
  "mfa_method_used": "AUTHENTICATOR_APP", "risk_score": 12.50,
  "current_status": "ACTIVE"
}
```

### 10. Audit Events
`SESSION_LOGIN`, `SESSION_LOGOUT`, `SESSION_EXPIRED`, `SESSION_REFRESHED`, `SESSION_REVOKED`, `SESSION_SUSPICIOUS_DETECTED`, `SESSION_MFA_VERIFIED`, `SESSION_MFA_FAILED`

---

## Entity 604 — Device Registry

### 1. Business Purpose
Per Part 14 §1: Stores Desktop, Tablet, Mobile, Barcode Scanner, POS, Kiosk, IoT Device. Registry of all devices accessing SUOP.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `device_id` | VARCHAR(100) | Yes | — | Unique per company | Device ID | Confidential |
| `device_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `device_type` | ENUM | Yes | — | DESKTOP, TABLET, MOBILE, BARCODE_SCANNER, POS, KIOSK, IoT_DEVICE, SMART_WATCH, VEHICLE_TERMINAL, OTHER | Type (per Part 14) | Internal |
| `device_category` | ENUM | Yes | — | USER_DEVICE, COMPANY_DEVICE, SHARED_DEVICE, PUBLIC_KIOSK, INDUSTRIAL | Category | Internal |
| `manufacturer` | VARCHAR(200) | No | NULL | — | Manufacturer | Internal |
| `model` | VARCHAR(200) | No | NULL | — | Model | Internal |
| `operating_system` | VARCHAR(100) | No | NULL | — | OS | Internal |
| `os_version` | VARCHAR(50) | No | NULL | — | OS version | Internal |
| `app_version` | VARCHAR(50) | No | NULL | — | App version | Internal |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Confidential |
| `imei` | VARCHAR(20) | No | NULL | — | IMEI (mobile) | Confidential |
| `mac_address` | VARCHAR(50) | No | NULL | — | MAC | Confidential |
| `device_fingerprint` | VARCHAR(500) | No | NULL | — | Fingerprint hash | Confidential |
| `assigned_to_identity_id` | UUID | No | NULL | FK to `identity_master` | Assigned user | Confidential |
| `assigned_to_facility_id` | UUID | No | NULL | FK to `facilities` | Assigned facility | Internal |
| `assigned_to_asset_id` | UUID | No | NULL | FK to `asset_master` | Linked asset (POS/IoT) | Internal |
| `device_group_id` | UUID | No | NULL | FK to `device_groups` | Group | Internal |
| `mdm_enrolled` | BOOLEAN | Yes | `false` | — | MDM managed | Internal |
| `mdm_provider` | VARCHAR(100) | No | NULL | — | MDM provider | Internal |
| `mdm_policy_id` | UUID | No | NULL | FK to `mdm_policies` | Policy | Internal |
| `encryption_enabled` | BOOLEAN | Yes | `true` | — | Disk encryption | Confidential |
| `antivirus_installed` | BOOLEAN | Yes | `false` | — | AV installed | Confidential |
| `rooted_jailbroken` | BOOLEAN | Yes | `false` | — | Rooted/jailbroken | Restricted |
| `security_posture_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Security score | Confidential |
| `compliant` | BOOLEAN | Yes | `false` | — | Compliant with policy | Internal |
| `compliance_issues` | JSONB | No | NULL | — | Issues | Confidential |
| `last_seen_at` | TIMESTAMPTZ | No | NULL | — | Last activity | Internal |
| `last_seen_ip` | INET | No | NULL | — | Last IP | Confidential |
| `geolocation` | JSONB | No | NULL | — | Last location | Confidential |
| `first_registered_at` | TIMESTAMPTZ | Yes | `now()` | — | Registration | Internal |
| `provisioning_method` | ENUM | Yes | — | SELF_SERVICE, IT_PROVISIONED, MDM_PUSHED, KIOSK_LOCKDOWN, BULK_DEPLOYMENT | Method | Internal |
| `kiosk_mode` | BOOLEAN | Yes | `false` | — | Kiosk lockdown | Internal |
| `kiosk_app_whitelist` | JSONB | No | NULL | — | Allowed apps | Internal |
| `retired_at` | TIMESTAMPTZ | No | NULL | — | Retirement | Internal |
| `retired_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `current_status` | ENUM | Yes | `REGISTERED` | REGISTERED, ACTIVE, INACTIVE, SUSPENDED, LOST, STOLEN, RETIRED, QUARANTINED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Master (601) | Many-to-One | N:1 | Assigned user |
| Facility | Many-to-One | N:1 | Facility |
| Asset Master (511) | Many-to-One | N:1 | Linked asset |
| Session Management (603) | One-to-Many | 1:N | Sessions |

### 6. Indexes
- UNIQUE (`device_id`)
- INDEX (`device_type`, `current_status`)
- INDEX (`assigned_to_identity_id`)
- INDEX (`current_status`, `last_seen_at`)
- INDEX (`compliant`)

### 7. Security Classification
**Confidential** — device identifiers and security posture.

### 8. Integration Points
- **Identity Service** (FS-1): Device-bound authentication
- **API Gateway** (FS-7): Device-based access policies
- **MDM Integration**: Device management
- **Notification Engine** (FS-4): Lost/stolen alerts

### 9. Sample Data
```json
{
  "device_id": "DEV-POS-MUM-001", "device_name": "Mumbai Store POS 1",
  "device_type": "POS", "device_category": "COMPANY_DEVICE",
  "manufacturer": "HP", "model": "RP9 G1", "operating_system": "Windows 10 IoT",
  "serial_number": "HP-POS-001234", "assigned_to_facility_id": "fac-store-mum-001",
  "mdm_enrolled": true, "mdm_provider": "Microsoft Intune",
  "encryption_enabled": true, "security_posture_score": 92.50,
  "compliant": true, "kiosk_mode": true,
  "current_status": "ACTIVE"
}
```

### 10. Audit Events
`DEVICE_REGISTERED`, `DEVICE_PROVISIONED`, `DEVICE_SEEN`, `DEVICE_SUSPENDED`, `DEVICE_LOST_REPORTED`, `DEVICE_RECOVERED`, `DEVICE_RETired`, `DEVICE_QUARANTINED`, `DEVICE_COMPLIANCE_FAILED`

---

## Entity 605 — Organization Service

### 1. Business Purpose
Per Part 14 §1: Supports Enterprise, Company, Business Unit, Branch, Plant, Warehouse, Store, Restaurant, Office. Unified organization hierarchy.

### 2. Architectural Role
Master configuration entity — represents the organizational structure. Drives multi-tenant data isolation and hierarchy-based access control.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `org_node_code` | VARCHAR(30) | Yes | — | Unique per enterprise | Code | Internal |
| `org_node_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `org_node_type` | ENUM | Yes | — | ENTERPRISE, COMPANY, BUSINESS_UNIT, BRANCH, PLANT, WAREHOUSE, STORE, RESTAURANT, OFFICE, DIVISION, DEPARTMENT, PROJECT | Type (per Part 14) | Internal |
| `parent_node_id` | UUID | No | NULL | FK to `organization_service` (self) | Parent | Internal |
| `hierarchy_level` | INTEGER | Yes | `1` | ≥ 1 | Level | Internal |
| `hierarchy_path` | VARCHAR(1000) | Yes | — | — | Materialized path | Internal |
| `enterprise_id` | UUID | Yes | — | — | Enterprise root | Internal |
| `company_id` | UUID | No | NULL | FK to `companies` | Company | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `legal_entity` | BOOLEAN | Yes | `false` | — | Legal entity | Internal |
| `tax_entity` | BOOLEAN | Yes | `false` | — | Separate tax | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `locale` | VARCHAR(10) | Yes | `en-IN` | — | Locale | Internal |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers` | Cost center | Confidential |
| `profit_center_id` | UUID | No | NULL | FK to `profit_centers` | Profit center | Confidential |
| `head_of_node_id` | UUID | No | NULL | FK to `workforce_master` | Head | Confidential |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `metadata` | JSONB | Yes | `'{}'` | — | Custom attributes | Internal |
| `children_count` | INTEGER | Yes | `0` | ≥ 0 | Direct children | Internal |
| `descendant_count` | INTEGER | Yes | `0` | ≥ 0 | All descendants | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MERGED, DIVESTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Self (605) | Self-reference | N:1 | Parent |
| Company | Many-to-One | N:1 | Company |
| Facility | Many-to-One | N:1 | Facility |
| Branch Master (606) | Many-to-One | N:1 | Branch |

### 6. Indexes
- UNIQUE (`org_node_code`)
- INDEX (`parent_node_id`)
- INDEX (`org_node_type`, `status`)
- INDEX (`hierarchy_level`)
- INDEX (`hierarchy_path`) — GIST
- INDEX (`enterprise_id`, `company_id`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Data Access Policy** (Entity 615): Hierarchy-based access
- **All Business Modules**: Multi-tenant data isolation
- **Configuration Engine**: Per-org configuration

### 9. Sample Data
```json
{
  "org_node_code": "ENT-SUOP-CMP001-BU-MFG-MUM", "org_node_name": "Sudhastar Mumbai Manufacturing BU",
  "org_node_type": "BUSINESS_UNIT", "hierarchy_level": 4,
  "hierarchy_path": "/ENT-SUOP/CMP001/BU-MFG/MUM",
  "enterprise_id": "ent-suop", "company_id": "cmp-001",
  "facility_id": "fac-mum", "currency_code": "INR",
  "timezone": "Asia/Kolkata", "head_of_node_id": "wf-100",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ORG_NODE_CREATED`, `ORG_NODE_RESTRUCTURED`, `ORG_NODE_MERGED`, `ORG_NODE_DIVESTED`, `ORG_NODE_INACTIVATED`

---

## Entity 606 — Branch Master

### 1. Business Purpose
Per Part 14 §1: Stores Branch, Manager, Currency, Timezone, Tax Region, Status. Branch-level configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `branch_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `branch_name` | VARCHAR(200) | Yes | — | Min 3 | Branch (per Part 14) | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_type` | ENUM | Yes | — | HEAD_OFFICE, REGIONAL_OFFICE, PLANT, WAREHOUSE, STORE, RESTAURANT, OFFICE, DISTRIBUTION_CENTER, SERVICE_CENTER | Type | Internal |
| `branch_manager_id` | UUID | No | NULL | FK to `workforce_master` | Manager (per Part 14) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency (per Part 14) | Internal |
| `timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone (per Part 14) | Internal |
| `locale` | VARCHAR(10) | Yes | `en-IN` | — | Locale | Internal |
| `tax_region_code` | VARCHAR(30) | Yes | — | — | Tax Region (per Part 14) | Confidential |
| `gst_registration_number` | VARCHAR(20) | No | NULL | — | GSTIN | Confidential |
| `pan_number` | VARCHAR(15) | No | NULL | — | PAN | Confidential |
| `tan_number` | VARCHAR(15) | No | NULL | — | TAN | Confidential |
| `state_code` | VARCHAR(10) | No | NULL | — | State | Internal |
| `country_code` | CHAR(2) | Yes | `IN` | — | Country | Internal |
| `location_id` | UUID | Yes | — | FK to `location_master` (Entity 607) | Location | Internal |
| `contact_phone` | VARCHAR(20) | No | NULL | — | Phone | Internal |
| `contact_email` | VARCHAR(200) | No | NULL | — | Email | Internal |
| `operating_hours` | JSONB | Yes | `'{}'` | — | Operating hours | Internal |
| `is_operational` | BOOLEAN | Yes | `true` | — | Currently operating | Internal |
| `opened_date` | DATE | No | NULL | — | Opening date | Internal |
| `closed_date` | DATE | No | NULL | — | Closure date | Internal |
| `inventory_enabled` | BOOLEAN | Yes | `true` | — | Inventory module | Internal |
| `manufacturing_enabled` | BOOLEAN | Yes | `false` | — | Mfg module | Internal |
| `retail_enabled` | BOOLEAN | Yes | `false` | — | Retail module | Internal |
| `restaurant_enabled` | BOOLEAN | Yes | `false` | — | Restaurant module | Internal |
| `finance_enabled` | BOOLEAN | Yes | `true` | — | Finance module | Internal |
| `hr_enabled` | BOOLEAN | Yes | `true` | — | HR module | Internal |
| `asset_management_enabled` | BOOLEAN | Yes | `true` | — | EAM module | Internal |
| `fiscal_year_start_month` | INTEGER | Yes | `4` | 1-12 | FY start (April) | Internal |
| `fiscal_year_end_month` | INTEGER | Yes | `3` | 1-12 | FY end | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, CLOSED, MERGED | Status (per Part 14) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 607 — Location Master

### 1. Business Purpose
Per Part 14 §1: Supports GPS, Address, Latitude, Longitude, Geo Fence. Geographic location registry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `location_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `location_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `location_type` | ENUM | Yes | — | FACILITY, BRANCH, WAREHOUSE, STORE, RESTAURANT, OFFICE, CUSTOMER_SITE, VENDOR_SITE, DELIVERY_POINT, GEOGRAPHIC_REGION | Type | Internal |
| `address_line1` | VARCHAR(200) | Yes | — | — | Address line 1 | Internal |
| `address_line2` | VARCHAR(200) | No | NULL | — | Address line 2 | Internal |
| `city` | VARCHAR(100) | Yes | — | — | City | Internal |
| `district` | VARCHAR(100) | No | NULL | — | District | Internal |
| `state` | VARCHAR(100) | Yes | — | — | State | Internal |
| `country` | VARCHAR(100) | Yes | — | — | Country | Internal |
| `postal_code` | VARCHAR(20) | Yes | — | — | PIN/ZIP | Internal |
| `latitude` | DECIMAL(10,7) | No | NULL | -90 to 90 | Latitude (per Part 14) | Confidential |
| `longitude` | DECIMAL(10,7) | No | NULL | -180 to 180 | Longitude (per Part 14) | Confidential |
| `elevation_meters` | DECIMAL(8,2) | No | NULL | — | Elevation | Internal |
| `geo_fence_radius_meters` | DECIMAL(8,2) | No | NULL | > 0 | Geo Fence (per Part 14) — radius | Confidential |
| `geo_fence_polygon` | JSONB | No | NULL | — | Polygon coordinates | Confidential |
| `is_geo_fenced` | BOOLEAN | Yes | `false` | — | Geo-fenced | Internal |
| `google_place_id` | VARCHAR(100) | No | NULL | — | Google Place ID | Internal |
| `what3words` | VARCHAR(50) | No | NULL | — | what3words address | Internal |
| `landmark` | VARCHAR(200) | No | NULL | — | Landmark | Internal |
| `directions` | TEXT | No | NULL | — | Directions | Internal |
| `contact_phone` | VARCHAR(20) | No | NULL | — | Phone | Internal |
| `contact_email` | VARCHAR(200) | No | NULL | — | Email | Internal |
| `maps_url` | VARCHAR(500) | No | NULL | — | Maps URL | Internal |
| `static_map_image_id` | UUID | No | NULL | FK to `attachments` | Static map | Internal |
| `timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `utc_offset_minutes` | INTEGER | Yes | `330` | — | UTC offset | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 608 — User Profile

### 1. Business Purpose
Per Part 14 §1: Stores Language, Timezone, Theme, Accessibility, Dashboard Preferences. User personalization.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `identity_id` | UUID | Yes | — | FK to `identity_master` (Entity 601) | Identity | Confidential |
| `preferred_language` | VARCHAR(10) | Yes | `en-IN` | — | Language (per Part 14) | Internal |
| `preferred_locale` | VARCHAR(20) | Yes | `en-IN` | — | Locale | Internal |
| `preferred_timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone (per Part 14) | Internal |
| `date_format` | VARCHAR(20) | Yes | `DD/MM/YYYY` | — | Date format | Internal |
| `time_format` | VARCHAR(20) | Yes | `24h` | 12h, 24h | Time format | Internal |
| `number_format` | VARCHAR(20) | Yes | `en-IN` | — | Number format | Internal |
| `currency_display` | ENUM | Yes | `SYMBOL` | SYMBOL, CODE, BOTH | Currency display | Internal |
| `first_day_of_week` | ENUM | Yes | `SUNDAY` | SUNDAY, MONDAY, SATURDAY | First day | Internal |
| `theme` | ENUM | Yes | `LIGHT` | LIGHT, DARK, SYSTEM, HIGH_CONTRAST | Theme (per Part 14) | Internal |
| `theme_custom` | JSONB | No | NULL | — | Custom theme colors | Internal |
| `font_size` | ENUM | Yes | `MEDIUM` | SMALL, MEDIUM, LARGE, EXTRA_LARGE | Font size | Internal |
| `density` | ENUM | Yes | `COMFORTABLE` | COMPACT, COMFORTABLE, SPACIOUS | UI density | Internal |
| `accessibility_settings` | JSONB | Yes | `'{}'` | — | Accessibility (per Part 14) — { screen_reader, color_blind_mode, reduce_motion, captions, ... } | Confidential |
| `dashboard_layout` | JSONB | Yes | `'{}'` | — | Dashboard Preferences (per Part 14) — widget config | Internal |
| `default_landing_page` | VARCHAR(200) | Yes | `/dashboard` | — | Landing page | Internal |
| `default_company_id` | UUID | No | NULL | FK to `companies` | Default company | Internal |
| `default_branch_id` | UUID | No | NULL | FK to `branch_master` | Default branch | Internal |
| `notification_preferences` | JSONB | Yes | `'{}'` | — | { email, sms, push, in_app } per category | Internal |
| `email_notification_enabled` | BOOLEAN | Yes | `true` | — | Email | Internal |
| `sms_notification_enabled` | BOOLEAN | Yes | `true` | — | SMS | Internal |
| `push_notification_enabled` | BOOLEAN | Yes | `true` | — | Push | Internal |
| `do_not_disturb_hours` | JSONB | No | NULL | — | DND schedule | Internal |
| `quiet_hours_start` | TIME | No | NULL | — | Quiet start | Internal |
| `quiet_hours_end` | TIME | No | NULL | — | Quiet end | Internal |
| `favorite_pages` | JSONB | Yes | `'[]'` | — | Bookmarked pages | Internal |
| `recent_pages` | JSONB | Yes | `'[]'` | — | Recent visits | Internal |
| `pinned_widgets` | JSONB | Yes | `'[]'` | — | Pinned dashboard widgets | Internal |
| `custom_shortcuts` | JSONB | Yes | `'[]'` | — | Custom keyboard shortcuts | Internal |
| `data_export_format` | ENUM | Yes | `XLSX` | XLSX, CSV, PDF, JSON | Export format | Internal |
| `report_preference` | JSONB | Yes | `'{}'` | — | Report defaults | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 609 — Login History

### 1. Business Purpose
Per Part 14 §1: Tracks Login, Logout, IP, Browser, Device, Duration. Audit-friendly login history.

### 2. Architectural Role
Immutable audit entity — append-only log of all login/logout events. Used by security analytics and compliance audits.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(40) | Yes | — | Unique | Code | Internal |
| `identity_id` | UUID | Yes | — | FK to `identity_master` (Entity 601) | Identity | Confidential |
| `event_type` | ENUM | Yes | — | LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, SESSION_TIMEOUT, SESSION_REVOKED, PASSWORD_RESET, MFA_VERIFIED, MFA_FAILED, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED | Event | Internal |
| `event_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp | Internal |
| `login_at` | TIMESTAMPTZ | No | NULL | — | Login (per Part 13) | Internal |
| `logout_at` | TIMESTAMPTZ | No | NULL | — | Logout (per Part 13) | Internal |
| `duration_seconds` | INTEGER | No | NULL | ≥ 0 | Duration (per Part 13) | Internal |
| `client_ip` | INET | Yes | — | — | IP (per Part 13) | Confidential |
| `client_ip_geolocation` | JSONB | No | NULL | — | { city, state, country, lat, lon } | Confidential |
| `client_user_agent` | TEXT | Yes | — | — | Browser (per Part 13) | Confidential |
| `browser_name` | VARCHAR(50) | No | NULL | — | Browser | Internal |
| `browser_version` | VARCHAR(20) | No | NULL | — | Version | Internal |
| `os_name` | VARCHAR(50) | No | NULL | — | OS | Internal |
| `os_version` | VARCHAR(20) | No | NULL | — | Version | Internal |
| `device_type` | VARCHAR(50) | No | NULL | — | Device (per Part 13) | Internal |
| `device_id` | UUID | No | NULL | FK to `device_registry` (Entity 604) | Device | Confidential |
| `authentication_provider_id` | UUID | Yes | — | FK to `authentication_providers` (Entity 602) | Provider | Internal |
| `mfa_method_used` | ENUM | No | NULL | OTP, AUTHENTICATOR_APP, EMAIL, SMS, SECURITY_KEY | MFA method | Internal |
| `mfa_verified` | BOOLEAN | No | NULL | — | MFA result | Internal |
| `failure_reason` | TEXT | No | NULL | — | If failed | Confidential |
| `failure_count_consecutive` | INTEGER | Yes | `0` | ≥ 0 | Consecutive failures | Confidential |
| `risk_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Risk | Confidential |
| `risk_factors` | JSONB | No | NULL | — | Detected risks | Confidential |
| `is_suspicious` | BOOLEAN | Yes | `false` | — | Flagged | Confidential |
| `session_id` | UUID | No | NULL | FK to `session_management` (Entity 603) | Session | Internal |
| `company_id` | UUID | No | NULL | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 610 — Identity Dashboard

### 1. Business Purpose
Per Part 14 §1: Displays Online Users, Failed Logins, Devices, Branches, Active Sessions, Security Alerts. AI: Suspicious Login, Impossible Travel, Brute Force, Inactive Users.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `total_identities_count` | INTEGER | Yes | `0` | ≥ 0 | Total identities | Internal |
| `active_identities_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `online_users_count` | INTEGER | Yes | `0` | ≥ 0 | Online Users (per Part 13) | Internal |
| `online_users_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `failed_logins_count_today` | INTEGER | Yes | `0` | ≥ 0 | Failed Logins (per Part 13) | Confidential |
| `failed_logins_trend_7d` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `locked_accounts_count` | INTEGER | Yes | `0` | ≥ 0 | Locked | Confidential |
| `locked_accounts_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `registered_devices_count` | INTEGER | Yes | `0` | ≥ 0 | Devices (per Part 13) | Internal |
| `active_devices_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `non_compliant_devices_count` | INTEGER | Yes | `0` | ≥ 0 | Non-compliant | Confidential |
| `branches_count` | INTEGER | Yes | `0` | ≥ 0 | Branches (per Part 13) | Internal |
| `active_branches_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `active_sessions_count` | INTEGER | Yes | `0` | ≥ 0 | Active Sessions (per Part 13) | Internal |
| `active_sessions_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `security_alerts_active_count` | INTEGER | Yes | `0` | ≥ 0 | Security Alerts (per Part 13) | Restricted |
| `security_alerts_list` | JSONB | Yes | `'[]'` | — | Active alerts | Restricted |
| `mfa_adoption_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | MFA adoption | Internal |
| `password_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Password compliance | Internal |
| `avg_risk_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg risk | Confidential |
| `ai_suspicious_login_detected` | JSONB | No | NULL | — | AI: Suspicious Login (per Part 13 AI) | Restricted |
| `ai_impossible_travel_detected` | JSONB | No | NULL | — | AI: Impossible Travel (per Part 13 AI) | Restricted |
| `ai_brute_force_detected` | JSONB | No | NULL | — | AI: Brute Force (per Part 13 AI) | Restricted |
| `ai_inactive_users_identified` | JSONB | No | NULL | — | AI: Inactive Users (per Part 13 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 2: RBAC, Security & Authorization Framework (Entities 611-620)

## Entity 611 — Role Master

### 1. Business Purpose
Per Part 14 §2: Examples — Super Admin, CEO, CFO, HR Manager, Warehouse Manager, Operator, Cashier, Chef, Technician. Role definitions.

### 2. Architectural Role
Master entity — defines roles that aggregate permissions. Roles are assigned to identities via role assignments.

### 3. Business Rules
- Role hierarchy: roles can inherit from parent roles (super admin inherits all)
- System roles: Super Admin, CEO, CFO (cannot be deleted)
- Custom roles: created per company
- Multi-company: same role can exist in multiple companies with different permissions
- Role templates: pre-built roles per industry vertical
- Effective permissions: union of own + inherited permissions

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `role_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `role_name` | VARCHAR(100) | Yes | — | Min 3 | Display name (per Part 14) | Internal |
| `role_description` | TEXT | No | NULL | — | Description | Internal |
| `role_category` | ENUM | Yes | — | EXECUTIVE, MANAGEMENT, MANAGER, SUPERVISOR, OPERATOR, CLERK, TECHNICIAN, EXTERNAL_USER, SYSTEM, OTHER | Category | Internal |
| `role_type` | ENUM | Yes | `CUSTOM` | SYSTEM, BUILTIN, CUSTOM, TEMPLATE | Type | Internal |
| `is_system_role` | BOOLEAN | Yes | `false` | — | System role (cannot delete) | Internal |
| `is_executive_role` | BOOLEAN | Yes | `false` | — | Executive | Confidential |
| `parent_role_id` | UUID | No | NULL | FK to `role_master` (self) | Parent (inheritance) | Confidential |
| `inheritance_depth` | INTEGER | Yes | `0` | ≥ 0 | Inheritance depth | Internal |
| `company_id` | UUID | No | NULL | FK to `companies` | NULL = enterprise-wide | Internal |
| `applicable_branches` | UUID[] | No | `ARRAY[]::UUID[]` | — | Branches | Internal |
| `access_level` | ENUM | Yes | `BRANCH` | ENTERPRISE, COMPANY, BUSINESS_UNIT, BRANCH, DEPARTMENT, SELF | Default access level | Confidential |
| `default_data_scope` | JSONB | Yes | `'{}'` | — | Default scope | Confidential |
| `max_session_duration_minutes` | INTEGER | Yes | `480` | > 0 | Max session (8h) | Internal |
| `concurrent_sessions_allowed` | INTEGER | Yes | `3` | ≥ 1 | Concurrent | Internal |
| `requires_mfa` | BOOLEAN | Yes | `false` | — | MFA required | Internal |
| `requires_approval_to_assign` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `approval_authority_id` | UUID | No | NULL | FK to `role_master` | Approver role | Confidential |
| `is_time_restricted` | BOOLEAN | Yes | `false` | — | Time-based access | Internal |
| `allowed_hours` | JSONB | No | NULL | — | { start, end, days } | Confidential |
| `ip_restriction_enabled` | BOOLEAN | Yes | `false` | — | IP whitelist | Confidential |
| `allowed_ip_ranges` | INET[] | No | `ARRAY[]::INET[]` | — | IP ranges | Confidential |
| `segregation_of_duties_conflicts` | UUID[] | No | `ARRAY[]::UUID[]` | — | Conflicting roles | Confidential |
| `effective_permissions_count` | INTEGER | Yes | `0` | ≥ 0 | Computed | Internal |
| `assigned_identities_count` | INTEGER | Yes | `0` | ≥ 0 | Active assignments | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Permission Master (612) | Many-to-Many | N:N | Via role_permission_mapping |
| Self (611) | Self-reference | N:1 | Parent (inheritance) |
| Identity Master (601) | Many-to-Many | N:N | Via identity_role_assignment |
| Policy Engine (613) | One-to-Many | 1:N | Policies |

### 6. Indexes
- UNIQUE (`role_code`)
- INDEX (`company_id`, `status`)
- INDEX (`role_type`, `is_system_role`)
- INDEX (`parent_role_id`)
- GIN INDEX (`applicable_branches`)

### 7. Security Classification
**Confidential** — access scopes and IP restrictions.

### 8. Integration Points
- **RBAC Engine** (FS-2): Authorization checks
- **Identity Service** (FS-1): Role assignment
- **Policy Engine** (Entity 613): Policy enforcement
- **Audit Engine** (FS-5): Role changes
- **All Business Modules**: Permission checks

### 9. Sample Data
```json
{
  "role_code": "ROLE-WAREHOUSE-MGR", "role_name": "Warehouse Manager",
  "role_category": "MANAGER", "role_type": "BUILTIN",
  "is_system_role": false, "company_id": "cmp-001",
  "access_level": "BRANCH", "max_session_duration_minutes": 480,
  "concurrent_sessions_allowed": 3, "requires_mfa": true,
  "is_time_restricted": false, "effective_permissions_count": 145,
  "assigned_identities_count": 12, "status": "ACTIVE"
}
```

### 10. Audit Events
`ROLE_CREATED`, `ROLE_UPDATED`, `ROLE_INACTIVATED`, `ROLE_PERMISSIONS_CHANGED`, `ROLE_ASSIGNED`, `ROLE_UNASSIGNED`, `ROLE_HIERARCHY_CHANGED`

---

## Entity 612 — Permission Master

### 1. Business Purpose
Per Part 14 §2: Supports Create, Read, Update, Delete, Approve, Print, Export, Import, Execute. Atomic permission definitions.

### 2. Architectural Role
Master entity — the atomic unit of authorization. Permissions are grouped into roles.

### 3. Business Rules
- Permission format: `MODULE:RESOURCE:ACTION` (e.g., `INVENTORY:PRODUCT:CREATE`)
- Actions: CREATE, READ, UPDATE, DELETE, APPROVE, PRINT, EXPORT, IMPORT, EXECUTE, ASSIGN, SHARE, ARCHIVE
- Permission scope: per resource type (record-level, field-level, action-level)
- Wildcard: `*:*:*` = super admin
- Field-level permissions: restrict specific fields (e.g., can READ employee but not SALARY field)
- Record-level: filter by ownership/department/etc.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `permission_code` | VARCHAR(100) | Yes | — | Unique enterprise-wide | Code (e.g., `INVENTORY:PRODUCT:CREATE`) | Internal |
| `permission_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `module` | VARCHAR(50) | Yes | — | — | Module (INVENTORY, FINANCE, HR, etc.) | Internal |
| `resource` | VARCHAR(100) | Yes | — | — | Resource (PRODUCT, INVOICE, etc.) | Internal |
| `action` | ENUM | Yes | — | CREATE, READ, UPDATE, DELETE, APPROVE, PRINT, EXPORT, IMPORT, EXECUTE, ASSIGN, SHARE, ARCHIVE, ALL | Action (per Part 14) | Internal |
| `permission_description` | TEXT | Yes | — | Min 10 | Description | Internal |
| `permission_type` | ENUM | Yes | `ACTION` | ACTION, FIELD_LEVEL, RECORD_LEVEL, WILDCARD | Type | Internal |
| `field_restrictions` | JSONB | No | NULL | — | Restricted fields | Confidential |
| `record_filter` | JSONB | No | NULL | — | Record filter expression | Confidential |
| `requires_approval` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `is_dangerous` | BOOLEAN | Yes | `false` | — | High-risk permission | Confidential |
| `is_system_permission` | BOOLEAN | Yes | `false` | — | System (cannot delete) | Internal |
| `default_data_scope` | JSONB | No | NULL | — | Default scope | Confidential |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Affected modules | Internal |
| `audit_level` | ENUM | Yes | `BASIC` | NONE, BASIC, DETAILED, FULL | Audit level | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Role Master (611) | Many-to-Many | N:N | Via role_permission_mapping |
| Resource Authorization (614) | Many-to-One | N:1 | Resource |

### 6. Indexes
- UNIQUE (`permission_code`)
- INDEX (`module`, `resource`, `action`)
- INDEX (`permission_type`, `status`)
- INDEX (`is_dangerous`)

### 7. Security Classification
**Internal** — field restrictions are **Confidential**.

### 8. Integration Points
- **RBAC Engine** (FS-2): Permission checks
- **API Gateway** (FS-7): Endpoint protection
- **Audit Engine** (FS-5): Permission usage audit
- **All Business Modules**: Authorization

### 9. Sample Data
```json
{
  "permission_code": "INVENTORY:PRODUCT:CREATE", "permission_name": "Create Product",
  "module": "INVENTORY", "resource": "PRODUCT", "action": "CREATE",
  "permission_description": "Allows creating new product master records in Inventory module",
  "permission_type": "ACTION", "is_dangerous": false,
  "applicable_modules": ["INVENTORY", "PROCUREMENT"], "audit_level": "DETAILED",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`PERMISSION_CREATED`, `PERMISSION_UPDATED`, `PERMISSION_INACTIVATED`, `PERMISSION_GRANTED_TO_ROLE`, `PERMISSION_REVOKED_FROM_ROLE`

---

## Entity 613 — Policy Engine

### 1. Business Purpose
Per Part 14 §2: Supports Location Based, Time Based, Device Based, Role Based, Risk Based. Multi-dimensional policy engine.

### 2. Architectural Role
Service entity — evaluates authorization policies in real-time. Implements Zero Trust principles.

### 3. Business Rules
- Policy types: LOCATION_BASED (geo-fence), TIME_BASED (hours/days), DEVICE_BASED (trusted devices), ROLE_BASED (role check), RISK_BASED (risk score threshold)
- Policy evaluation: ALL must pass (AND logic) or ANY (OR logic)
- Real-time: evaluated on every API request
- Caching: 5-minute policy decision cache for performance
- Override: super admin can override (audited)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `policy_description` | TEXT | No | NULL | — | Description | Internal |
| `policy_type` | ENUM | Yes | — | LOCATION_BASED, TIME_BASED, DEVICE_BASED, ROLE_BASED, RISK_BASED, COMPOSITE, CONTEXT_BASED | Type (per Part 14) | Internal |
| `policy_category` | ENUM | Yes | `ACCESS_CONTROL` | ACCESS_CONTROL, DATA_PROTECTION, TRANSACTION_LIMIT, SESSION_CONTROL, IP_RESTRICTION, BEHAVIORAL | Category | Internal |
| `policy_rules` | JSONB | Yes | `'[]'` | — | Rules array | Confidential |
| `evaluation_logic` | ENUM | Yes | `ALL_MUST_PASS` | ALL_MUST_PASS, ANY_MUST_PASS, MAJORITY_MUST_PASS, WEIGHTED | Logic | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_resources` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Resources | Internal |
| `applicable_actions` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Actions | Internal |
| `applicable_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `location_rules` | JSONB | No | NULL | — | Geo-fence rules | Confidential |
| `time_rules` | JSONB | No | NULL | — | Time-based rules | Confidential |
| `device_rules` | JSONB | No | NULL | — | Device rules | Confidential |
| `risk_threshold` | DECIMAL(5,2) | No | NULL | 0-100 | Risk score max | Confidential |
| `action_on_violation` | ENUM | Yes | `DENY` | DENY, ALLOW_WITH_WARNING, REQUIRE_MFA, REQUIRE_APPROVAL, LOG_ONLY | Action | Internal |
| `override_allowed` | BOOLEAN | Yes | `false` | — | Override allowed | Confidential |
| `override_authority_role_id` | UUID | No | NULL | FK to `role_master` | Override role | Confidential |
| `decision_cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | Cache TTL | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `effective_to` | TIMESTAMPTZ | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Role Master (611) | Many-to-One | N:1 | Override authority |

### 6. Indexes
- UNIQUE (`policy_code`)
- INDEX (`policy_type`, `status`)
- INDEX (`priority`)
- GIN INDEX (`applicable_modules`)

### 7. Security Classification
**Confidential** — rules and thresholds.

### 8. Integration Points
- **RBAC Engine** (FS-2): Policy evaluation
- **API Gateway** (FS-7): Request filtering
- **Identity Service** (FS-1): Context provision
- **AI Security Service**: Risk scoring

### 9. Sample Data
```json
{
  "policy_code": "POL-FIN-PAYMENT-LOCATION", "policy_name": "Finance Payment Location Restriction",
  "policy_type": "LOCATION_BASED", "policy_category": "ACCESS_CONTROL",
  "policy_rules": [{ "type": "GEO_FENCE", "facility_id": "fac-hq", "radius_meters": 500 }],
  "evaluation_logic": "ALL_MUST_PASS", "applicable_modules": ["FINANCE"],
  "applicable_resources": ["PAYMENT"], "applicable_actions": ["CREATE", "APPROVE"],
  "action_on_violation": "DENY", "override_allowed": true,
  "override_authority_role_id": "role-cfo", "priority": 50,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`POLICY_CREATED`, `POLICY_UPDATED`, `POLICY_ACTIVATED`, `POLICY_INACTIVATED`, `POLICY_VIOLATION_DETECTED`, `POLICY_OVERRIDE_USED`

---

## Entity 614 — Resource Authorization

### 1. Business Purpose
Per Part 14 §2: Resources — Inventory, Finance, Payroll, Manufacturing, Warehouse, Reports. Resource-level authorization.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `resource_code` | VARCHAR(100) | Yes | — | Unique | Code | Internal |
| `resource_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `resource_module` | ENUM | Yes | — | INVENTORY, FINANCE, PAYROLL, MANUFACTURING, WAREHOUSE, REPORTS, HR, PROCUREMENT, RETAIL, RESTAURANT, EAM, PLATFORM, ALL | Module (per Part 14) | Internal |
| `resource_type` | ENUM | Yes | — | MASTER_DATA, TRANSACTION, REPORT, API_ENDPOINT, UI_PAGE, FIELD, FILE, WORKFLOW | Type | Internal |
| `resource_identifier` | VARCHAR(500) | Yes | — | — | Resource path/identifier | Internal |
| `resource_description` | TEXT | No | NULL | — | Description | Internal |
| `default_access_level` | ENUM | Yes | `DENY` | DENY, READ, WRITE, FULL | Default | Confidential |
| `sensitivity_level` | ENUM | Yes | `INTERNAL` | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED, TOP_SECRET | Sensitivity | Confidential |
| `required_clearance_level` | INTEGER | Yes | `1` | 1-5 | Clearance | Confidential |
| `field_level_controls` | JSONB | Yes | `'[]'` | — | Per-field restrictions | Confidential |
| `record_level_filters` | JSONB | Yes | `'[]'` | — | Filter expressions | Confidential |
| `audit_required` | BOOLEAN | Yes | `true` | — | Audit all access | Internal |
| `pii_data` | BOOLEAN | Yes | `false` | — | Contains PII | Confidential |
| `pci_data` | BOOLEAN | Yes | `false` | — | Contains PCI | Confidential |
| `phi_data` | BOOLEAN | Yes | `false` | — | Contains PHI | Confidential |
| `data_classification` | ENUM | Yes | `INTERNAL` | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED | Classification | Confidential |
| `encryption_required` | BOOLEAN | Yes | `true` | — | At-rest encryption | Internal |
| `encryption_in_transit_required` | BOOLEAN | Yes | `true` | — | TLS required | Internal |
| `retention_days` | INTEGER | Yes | `2555` | ≥ 1 | Data retention (7 years) | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 615 — Data Access Policy

### 1. Business Purpose
Per Part 14 §2: Supports Company, Branch, Department, Business Unit, Record Ownership. Data-level access control.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `data_scope_type` | ENUM | Yes | — | COMPANY, BRANCH, DEPARTMENT, BUSINESS_UNIT, RECORD_OWNERSHIP, CUSTOM_SCOPE | Scope (per Part 14) | Internal |
| `scope_rules` | JSONB | Yes | `'[]'` | — | Rules | Confidential |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_resources` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Resources | Internal |
| `applicable_roles` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `data_filter_expression` | TEXT | No | NULL | — | SQL-like filter | Confidential |
| `column_restrictions` | JSONB | No | NULL | — | Hidden columns | Confidential |
| `row_limit` | INTEGER | No | NULL | > 0 | Max rows returned | Internal |
| `aggregation_only` | BOOLEAN | Yes | `false` | — | Only aggregated data | Confidential |
| `export_allowed` | BOOLEAN | Yes | `true` | — | Can export | Confidential |
| `print_allowed` | BOOLEAN | Yes | `true` | — | Can print | Confidential |
| `share_allowed` | BOOLEAN | Yes | `true` | — | Can share | Confidential |
| `watermark_required` | BOOLEAN | Yes | `false` | — | Watermark on export | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 616 — Approval Authority

### 1. Business Purpose
Per Part 14 §2: Defines Approval Limit, Department, Financial Limit, Role. Approval matrix configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `authority_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `authority_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `role_id` | UUID | Yes | — | FK to `role_master` (Entity 611) | Role (per Part 14) | Confidential |
| `department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 14) | Internal |
| `approval_category` | ENUM | Yes | — | FINANCIAL, PROCUREMENT, HR, LEAVE, EXPENSE, WORKFLOW, DOCUMENT, OTHER | Category | Internal |
| `approval_type` | JSONB | Yes | `'[]'` | — | [{ type, sub_type }] (e.g., PO, INVOICE, LEAVE) | Internal |
| `approval_limit_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Financial Limit (per Part 14) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `approval_limit_count` | INTEGER | No | NULL | > 0 | Count limit (e.g., 10 per day) | Internal |
| `approval_limit_period` | ENUM | No | NULL | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, PER_TRANSACTION | Period | Internal |
| `approval_authority_level` | INTEGER | Yes | `1` | ≥ 1 | Level (1=lowest) | Internal |
| `can_delegate` | BOOLEAN | Yes | `false` | — | Delegation allowed | Internal |
| `delegation_role_id` | UUID | No | NULL | FK to `role_master` | Delegate to | Confidential |
| `escalation_role_id` | UUID | No | NULL | FK to `role_master` | Escalate to | Confidential |
| `escalation_after_hours` | INTEGER | Yes | `48` | ≥ 1 | Escalate after | Internal |
| `requires_dual_approval` | BOOLEAN | Yes | `false` | — | Two-person rule | Confidential |
| `second_approver_role_id` | UUID | No | NULL | FK to `role_master` | Second approver | Confidential |
| `conditions` | JSONB | No | NULL | — | Conditional approval rules | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 617 — API Security

### 1. Business Purpose
Per Part 14 §2: Supports JWT, OAuth, API Keys, Rate Limiting, IP Whitelist. API-layer security.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `security_config_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `config_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `api_endpoint_pattern` | VARCHAR(500) | Yes | — | — | Endpoint pattern (e.g., `/api/v1/finance/**`) | Internal |
| `authentication_methods` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | JWT, OAUTH, API_KEYS (per Part 14) | Auth methods | Internal |
| `rate_limit_per_minute` | INTEGER | Yes | `100` | ≥ 1 | Rate Limiting (per Part 14) | Internal |
| `rate_limit_per_hour` | INTEGER | Yes | `1000` | ≥ 1 | Hourly limit | Internal |
| `rate_limit_per_day` | INTEGER | Yes | `10000` | ≥ 1 | Daily limit | Internal |
| `burst_limit` | INTEGER | Yes | `10` | ≥ 1 | Burst | Internal |
| `ip_whitelist` | INET[] | No | `ARRAY[]::INET[]` | — | IP Whitelist (per Part 14) | Confidential |
| `ip_blacklist` | INET[] | No | `ARRAY[]::INET[]` | — | IP Blacklist | Confidential |
| `geo_restrictions` | JSONB | No | NULL | — | Geo-fence | Confidential |
| `cors_origins_allowed` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | CORS | Internal |
| `cors_credentials_allowed` | BOOLEAN | Yes | `false` | — | CORS credentials | Internal |
| `jwt_issuer` | VARCHAR(200) | No | NULL | — | JWT issuer | Confidential |
| `jwt_audience` | VARCHAR(200) | No | NULL | — | JWT audience | Confidential |
| `jwt_algorithm` | VARCHAR(20) | Yes | `RS256` | — | Algorithm | Internal |
| `jwt_expiry_seconds` | INTEGER | Yes | `900` | > 0 | 15 min | Internal |
| `oauth_scopes_required` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Required scopes | Confidential |
| `api_key_required` | BOOLEAN | Yes | `false` | — | API key mandatory | Internal |
| `api_key_header_name` | VARCHAR(50) | Yes | `X-API-Key` | — | Header name | Internal |
| `request_signing_required` | BOOLEAN | Yes | `false` | — | HMAC signing | Confidential |
| `encryption_required` | BOOLEAN | Yes | `true` | — | TLS mandatory | Internal |
| `minimum_tls_version` | ENUM | Yes | `TLS_1_2` | TLS_1_0, TLS_1_1, TLS_1_2, TLS_1_3 | Min TLS | Internal |
| `request_size_limit_mb` | INTEGER | Yes | `10` | ≥ 1 | Max request size | Internal |
| `response_size_limit_mb` | INTEGER | Yes | `50` | ≥ 1 | Max response size | Internal |
| `audit_all_requests` | BOOLEAN | Yes | `false` | — | Audit everything | Internal |
| `audit_sensitive_only` | BOOLEAN | Yes | `true` | — | Audit sensitive only | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 618 — Password Policy

### 1. Business Purpose
Per Part 14 §2: Supports Length, Complexity, Expiry, Reuse, History. Password policy enforcement.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `policy_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `applicable_roles` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `min_length` | INTEGER | Yes | `12` | ≥ 8 | Length (per Part 14) — min | Internal |
| `max_length` | INTEGER | Yes | `128` | ≥ min_length | Max | Internal |
| `require_uppercase` | BOOLEAN | Yes | `true` | — | Complexity | Internal |
| `require_lowercase` | BOOLEAN | Yes | `true` | — | Complexity (per Part 14) | Internal |
| `require_digits` | BOOLEAN | Yes | `true` | — | Digits | Internal |
| `require_special_chars` | BOOLEAN | Yes | `true` | — | Special chars | Internal |
| `min_special_chars` | INTEGER | Yes | `1` | ≥ 0 | Min special | Internal |
| `min_different_chars` | INTEGER | Yes | `6` | ≥ 1 | Min different | Internal |
| `max_consecutive_identical` | INTEGER | Yes | `2` | ≥ 1 | Max consecutive | Internal |
| `max_consecutive_sequential` | INTEGER | Yes | `3` | ≥ 1 | Max sequential (abc, 123) | Internal |
| `password_expiry_days` | INTEGER | Yes | `90` | ≥ 0 | Expiry (per Part 14) — 0=never | Internal |
| `expiry_warning_days` | INTEGER | Yes | `7` | ≥ 1 | Warning before expiry | Internal |
| `password_history_count` | INTEGER | Yes | `12` | ≥ 0 | History (per Part 14) — cannot reuse | Internal |
| `min_password_age_hours` | INTEGER | Yes | `24` | ≥ 0 | Min age before change | Internal |
| `max_login_attempts` | INTEGER | Yes | `5` | ≥ 1 | Before lockout | Internal |
| `lockout_duration_minutes` | INTEGER | Yes | `30` | ≥ 1 | Lock duration | Internal |
| `progressive_lockout_enabled` | BOOLEAN | Yes | `true` | — | Increasing lock | Internal |
| `password_reset_token_expiry_minutes` | INTEGER | Yes | `30` | ≥ 1 | Reset token TTL | Internal |
| `breach_check_enabled` | BOOLEAN | Yes | `true` | — | Check against breach DB | Confidential |
| `breach_check_provider` | VARCHAR(100) | No | NULL | — | Provider (HaveIBeenPwned) | Internal |
| `common_password_check` | BOOLEAN | Yes | `true` | — | Reject common passwords | Internal |
| `dictionary_check` | BOOLEAN | Yes | `true` | — | Reject dictionary words | Internal |
| `user_info_in_password_check` | BOOLEAN | Yes | `true` | — | Reject name/email in password | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 619 — MFA Policy

### 1. Business Purpose
Per Part 14 §2: Supports OTP, Authenticator App, Email, SMS, Security Key. MFA configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `policy_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `applicable_roles` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `mfa_required` | BOOLEAN | Yes | `false` | — | MFA mandatory | Internal |
| `allowed_factors` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | OTP, AUTHENTICATOR_APP, EMAIL, SMS, SECURITY_KEY (per Part 14) | Allowed | Internal |
| `min_factors_required` | INTEGER | Yes | `1` | ≥ 1 | Min factors | Internal |
| `max_factors_per_user` | INTEGER | Yes | `5` | ≥ 1 | Max factors | Internal |
| `preferred_factor` | ENUM | No | NULL | AUTHENTICATOR_APP, SECURITY_KEY, OTP, EMAIL, SMS | Preferred | Internal |
| `otp_length` | INTEGER | Yes | `6` | 6-8 | OTP digits | Internal |
| `otp_expiry_seconds` | INTEGER | Yes | `60` | ≥ 30 | OTP TTL | Internal |
| `otp_max_attempts` | INTEGER | Yes | `3` | ≥ 1 | Max attempts | Internal |
| `authenticator_app_type` | ENUM | Yes | `TOTP` | TOTP, HOTP | Type | Internal |
| `totp_algorithm` | VARCHAR(20) | Yes | `SHA1` | — | Algorithm | Internal |
| `totp_period_seconds` | INTEGER | Yes | `30` | ≥ 15 | Period | Internal |
| `sms_provider` | VARCHAR(100) | No | NULL | — | SMS gateway | Confidential |
| `email_template_id` | UUID | No | NULL | FK to `email_templates` | Template | Internal |
| `security_key_type` | ENUM | No | NULL | FIDO_U2F, FIDO2, WEBAUTHN, SMARTCARD | Type | Internal |
| `remember_device_days` | INTEGER | Yes | `30` | ≥ 0 | Skip MFA on trusted device | Internal |
| `step_up_authentication_required` | BOOLEAN | Yes | `true` | — | Step-up for sensitive | Internal |
| `sensitive_actions_requiring_step_up` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Actions | Internal |
| `fallback_factor_enabled` | BOOLEAN | Yes | `true` | — | Fallback if primary fails | Internal |
| `fallback_factor` | ENUM | No | NULL | EMAIL, SMS | Fallback | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 620 — Security Dashboard

### 1. Business Purpose
Per Part 14 §2: Displays Permission Changes, Failed Logins, Locked Accounts, Active Sessions, Security Score. AI: Privilege Escalation, Suspicious Access, Policy Violations, Risky Users.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `permission_changes_today_count` | INTEGER | Yes | `0` | ≥ 0 | Permission Changes (per Part 14) | Restricted |
| `permission_changes_list` | JSONB | Yes | `'[]'` | — | List | Restricted |
| `failed_logins_today_count` | INTEGER | Yes | `0` | ≥ 0 | Failed Logins (per Part 14) | Confidential |
| `failed_logins_trend_7d` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `locked_accounts_count` | INTEGER | Yes | `0` | ≥ 0 | Locked Accounts (per Part 14) | Confidential |
| `locked_accounts_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `active_sessions_count` | INTEGER | Yes | `0` | ≥ 0 | Active Sessions (per Part 14) | Internal |
| `active_sessions_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `security_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Security Score (per Part 14) | Confidential |
| `security_score_components` | JSONB | Yes | `'{}'` | — | { password, mfa, device, policy, audit } | Confidential |
| `security_score_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `policy_violations_count` | INTEGER | Yes | `0` | ≥ 0 | Violations | Restricted |
| `policy_violations_list` | JSONB | Yes | `'[]'` | — | List | Restricted |
| `mfa_adoption_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | MFA adoption | Internal |
| `password_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Password compliance | Internal |
| `device_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Device compliance | Internal |
| `vulnerabilities_count` | INTEGER | Yes | `0` | ≥ 0 | Vulnerabilities | Restricted |
| `ai_privilege_escalation_detected` | JSONB | No | NULL | — | AI: Privilege Escalation (per Part 14 AI) | Restricted |
| `ai_suspicious_access_detected` | JSONB | No | NULL | — | AI: Suspicious Access (per Part 14 AI) | Restricted |
| `ai_policy_violations_detected` | JSONB | No | NULL | — | AI: Policy Violations (per Part 14 AI) | Restricted |
| `ai_risky_users_identified` | JSONB | No | NULL | — | AI: Risky Users (per Part 14 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 3: Enterprise Configuration, Feature Flags & Master Settings (Entities 621-630)

## Entity 621 — System Configuration

### 1. Business Purpose
Per Part 14 §3: Stores Company Settings, Regional Settings, Currency, Language, Timezone, Business Rules. Master system configuration.

### 2. Architectural Role
**Configuration Engine master entity** — the heart of configuration-driven architecture. Per Vol 0: "No business logic should be hardcoded."

### 3. Business Rules
- Configuration hierarchy: Enterprise → Company → Branch → User (most specific wins)
- Configuration types: SETTING (key-value), JSON (complex), ENCRYPTED (secrets), REFERENCE (link to entity)
- Effective configuration: resolved by Configuration Engine (FS-6) at runtime
- Caching: 5-minute cache for performance
- Override tracking: every override documented
- Audit: all configuration changes audited

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `config_key` | VARCHAR(200) | Yes | — | — | Configuration key | Internal |
| `config_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `config_description` | TEXT | No | NULL | — | Description | Internal |
| `config_category` | ENUM | Yes | — | COMPANY_SETTINGS, REGIONAL_SETTINGS, CURRENCY, LANGUAGE, TIMEZONE, BUSINESS_RULES, SECURITY, NOTIFICATION, INTEGRATION, WORKFLOW, UI, OTHER | Category (per Part 14) | Internal |
| `config_type` | ENUM | Yes | `SETTING` | SETTING, JSON, ENCRYPTED, REFERENCE, FEATURE_FLAG, LIST | Type | Internal |
| `data_type` | ENUM | Yes | `STRING` | STRING, INTEGER, DECIMAL, BOOLEAN, DATE, DATETIME, JSON, LIST, REFERENCE | Data type | Internal |
| `default_value` | TEXT | Yes | — | — | Default value | Internal |
| `current_value` | TEXT | Yes | — | — | Current value | Confidential |
| `encrypted_value` | TEXT | No | NULL | — | If ENCRYPTED | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `validation_rules` | JSONB | No | NULL | — | Validation | Internal |
| `allowed_values` | JSONB | No | NULL | — | Enum values | Internal |
| `min_value` | TEXT | No | NULL | — | Min | Internal |
| `max_value` | TEXT | No | NULL | — | Max | Internal |
| `regex_pattern` | VARCHAR(500) | No | NULL | — | Validation regex | Internal |
| `applicability_level` | ENUM | Yes | `COMPANY` | ENTERPRISE, COMPANY, BRANCH, DEPARTMENT, USER | Level | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `applicable_department_id` | UUID | No | NULL | FK to `departments` | NULL = all | Internal |
| `override_allowed` | BOOLEAN | Yes | `true` | — | Can override at lower level | Internal |
| `override_levels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Levels that can override | Internal |
| `requires_approval` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `approval_authority_role_id` | UUID | No | NULL | FK to `role_master` | Approver | Confidential |
| `requires_restart` | BOOLEAN | Yes | `false` | — | App restart needed | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | Cache TTL | Internal |
| `ui_editable` | BOOLEAN | Yes | `true` | — | Editable from UI | Internal |
| `ui_display_order` | INTEGER | Yes | `100` | ≥ 1 | Display order | Internal |
| `ui_section` | VARCHAR(100) | No | NULL | — | UI section | Internal |
| `documentation_url` | VARCHAR(500) | No | NULL | — | Docs | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Applicable company |
| Branch Master (606) | Many-to-One | N:1 | Applicable branch |
| Configuration Override | One-to-Many | 1:N | Overrides |

### 6. Indexes
- INDEX (`config_key`, `applicability_level`, `status`)
- INDEX (`config_category`, `status`)
- INDEX (`applicable_company_id`, `applicable_branch_id`)

### 7. Security Classification
**Confidential** — encrypted values are **Restricted**.

### 8. Integration Points
- **Configuration Engine** (FS-6): Primary consumer
- **All Business Modules**: Configuration reads
- **Audit Engine** (FS-5): Change tracking
- **Feature Flag Engine** (FS-46): Flag storage

### 9. Sample Data
```json
{
  "config_key": "finance.fiscal_year_start_month", "config_name": "Fiscal Year Start Month",
  "config_category": "BUSINESS_RULES", "config_type": "SETTING", "data_type": "INTEGER",
  "default_value": "4", "current_value": "4",
  "validation_rules": { "min": 1, "max": 12 },
  "applicability_level": "COMPANY", "applicable_company_id": "cmp-001",
  "override_allowed": false, "cache_ttl_seconds": 3600,
  "ui_editable": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`CONFIGURATION_CREATED`, `CONFIGURATION_UPDATED`, `CONFIGURATION_OVERRIDDEN`, `CONFIGURATION_RESET_TO_DEFAULT`, `CONFIGURATION_DEPRECATED`

---

## Entity 622 — Feature Flag

### 1. Business Purpose
Per Part 14 §3: Supports Enable, Disable, Beta, Pilot, Role Based, Branch Based. Feature flag management.

### 2. Architectural Role
Feature flag entity — part of the Feature Flag Engine (FS-46). Enables progressive rollout, A/B testing, and instant feature toggling.

### 3. Business Rules
- Flag states: ENABLED (all users), DISABLED (no users), BETA (internal users), PILOT (specific users/branches), GRADUAL_ROLLOUT (% of users)
- Targeting: by role, branch, department, user list, percentage
- Kill switch: instant disable for incident response
- A/B testing: variant assignment
- Audit: all flag changes tracked
- Cache: 60-second cache for performance

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `flag_key` | VARCHAR(100) | Yes | — | Unique enterprise-wide | Flag key | Internal |
| `flag_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `flag_description` | TEXT | No | NULL | — | Description | Internal |
| `flag_type` | ENUM | Yes | `BOOLEAN` | BOOLEAN, STRING, INTEGER, DECIMAL, JSON, VARIANT | Type | Internal |
| `default_state` | ENUM | Yes | `DISABLED` | ENABLED, DISABLED | Default (per Part 14) | Internal |
| `current_state` | ENUM | Yes | `DISABLED` | ENABLED, DISABLED, BETA, PILOT, GRADUAL_ROLLOUT | State (per Part 14) | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Affected modules | Internal |
| `targeting_rules` | JSONB | Yes | `'[]'` | — | Targeting rules | Confidential |
| `target_role_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Role Based (per Part 14) | Confidential |
| `target_branch_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Branch Based (per Part 14) | Confidential |
| `target_user_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific users | Confidential |
| `rollout_percentage` | DECIMAL(5,2) | Yes | `0` | 0-100 | % rollout | Internal |
| `rollout_strategy` | ENUM | Yes | `RANDOM` | RANDOM, USER_ID_HASH, SESSION_ID_HASH, STICKY | Strategy | Internal |
| `variants` | JSONB | No | NULL | — | A/B variants | Confidential |
| `variant_distribution` | JSONB | No | NULL | — | % per variant | Confidential |
| `kill_switch_enabled` | BOOLEAN | Yes | `false` | — | Kill switch | Internal |
| `kill_switch_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `kill_switch_activated_by` | UUID | No | NULL | FK to `identity_master` | Activator | Confidential |
| `kill_switch_activated_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `scheduled_enablement` | TIMESTAMPTZ | No | NULL | — | Auto-enable | Internal |
| `scheduled_disablement` | TIMESTAMPTZ | No | NULL | — | Auto-disable | Internal |
| `prerequisite_flag_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Prerequisites | Internal |
| `evaluation_count_today` | INTEGER | Yes | `0` | ≥ 0 | Evaluations | Internal |
| `evaluation_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `enabled_evaluations_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % enabled | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `60` | ≥ 0 | Cache | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Role Master (611) | Many-to-Many | N:N | Target roles |
| Branch Master (606) | Many-to-Many | N:N | Target branches |
| Self (622) | Self-reference | N:N | Prerequisites |

### 6. Indexes
- UNIQUE (`flag_key`)
- INDEX (`current_state`, `status`)
- INDEX (`kill_switch_enabled`)
- GIN INDEX (`applicable_modules`)
- GIN INDEX (`target_role_ids`)

### 7. Security Classification
**Confidential** — targeting rules.

### 8. Integration Points
- **Feature Flag Engine** (FS-46): Primary consumer
- **All Business Modules**: Flag evaluation
- **API Gateway** (FS-7): Endpoint flagging
- **UI Service**: Feature visibility

### 9. Sample Data
```json
{
  "flag_key": "feature.ai_maintenance_copilot", "flag_name": "AI Maintenance Copilot",
  "flag_description": "Natural language AI assistant for maintenance queries",
  "flag_type": "BOOLEAN", "default_state": "DISABLED", "current_state": "PILOT",
  "applicable_modules": ["EAM"], "target_branch_ids": ["br-mum-001"],
  "rollout_percentage": 100.00, "rollout_strategy": "STICKY",
  "kill_switch_enabled": false, "evaluation_count_total": 15420,
  "enabled_evaluations_pct": 25.00, "cache_ttl_seconds": 60,
  "owner_identity_id": "id-001", "status": "ACTIVE"
}
```

### 10. Audit Events
`FEATURE_FLAG_CREATED`, `FEATURE_FLAG_STATE_CHANGED`, `FEATURE_FLAG_KILL_SWITCH_ACTIVATED`, `FEATURE_FLAG_ROLLOUT_UPDATED`, `FEATURE_FLAG_TARGETING_CHANGED`, `FEATURE_FLAG_ARCHIVED`

---

## Entity 623 — Number Series Engine

### 1. Business Purpose
Per Part 14 §3: Generates PO, SO, WO, Invoice, Voucher, Employee, Asset, Batch, Lot. Centralized number series management.

### 2. Architectural Role
**Number Series Engine (FS-47) configuration entity** — defines numbering schemes for all transactional documents.

### 3. Business Rules
- Number formats: PREFIX + SEQUENCE + SUFFIX (e.g., PO-MUM-2026-000123)
- Sequence types: GLOBAL (enterprise-wide), PER_COMPANY, PER_BRANCH, PER_YEAR, PER_MONTH
- Prefix can include variables: {COMPANY}, {BRANCH}, {YEAR}, {MONTH}
- Padding: configurable (e.g., 6 digits)
- Reset: per year/month or never
- Gap prevention: transactional sequence generation
- Reserved numbers: for paper-based pre-printed documents

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `series_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `series_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `document_type` | ENUM | Yes | — | PO, SO, WO, INVOICE, VOUCHER, EMPLOYEE, ASSET, BATCH, LOT, GRN, DELIVERY_CHALLAN, PAYMENT, RECEIPT, JOURNAL_ENTRY, OTHER | Type (per Part 14) | Internal |
| `prefix` | VARCHAR(50) | Yes | — | — | Prefix (may include variables) | Internal |
| `suffix` | VARCHAR(20) | No | NULL | — | Suffix | Internal |
| `sequence_length` | INTEGER | Yes | `6` | 1-20 | Padding | Internal |
| `sequence_scope` | ENUM | Yes | `PER_COMPANY` | GLOBAL, PER_COMPANY, PER_BRANCH, PER_YEAR, PER_MONTH, PER_BRANCH_PER_YEAR | Scope | Internal |
| `sequence_start` | BIGINT | Yes | `1` | ≥ 1 | Start | Internal |
| `sequence_current` | BIGINT | Yes | `0` | ≥ 0 | Current value | Confidential |
| `sequence_increment` | INTEGER | Yes | `1` | ≥ 1 | Increment | Internal |
| `sequence_max` | BIGINT | No | NULL | > sequence_start | Max (NULL = unlimited) | Internal |
| `reset_frequency` | ENUM | Yes | `NEVER` | NEVER, YEARLY, MONTHLY, DAILY | Reset | Internal |
| `last_reset_at` | TIMESTAMPTZ | No | NULL | — | Last reset | Internal |
| `next_reset_at` | TIMESTAMPTZ | No | NULL | — | Next reset | Internal |
| `format_template` | VARCHAR(200) | Yes | — | — | Full template | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `reserved_numbers` | JSONB | No | NULL | — | Pre-reserved | Confidential |
| `gap_prevention_enabled` | BOOLEAN | Yes | `true` | — | No gaps | Internal |
| `preview_next_number` | VARCHAR(50) | Yes | — | — | Next number preview | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Applicable company |
| Branch Master (606) | Many-to-One | N:1 | Applicable branch |

### 6. Indexes
- UNIQUE (`series_code`)
- INDEX (`document_type`, `status`)
- INDEX (`applicable_company_id`, `applicable_branch_id`)

### 7. Security Classification
**Confidential** — sequence_current and reserved numbers.

### 8. Integration Points
- **Number Series Engine** (FS-47): Primary consumer
- **All Business Modules**: Number generation
- **Audit Engine** (FS-5): Number generation audit
- **Barcode Engine** (FS-12): Barcoded documents

### 9. Sample Data
```json
{
  "series_code": "NS-PO-MUM-2026", "series_name": "PO Number Series - Mumbai 2026",
  "document_type": "PO", "prefix": "PO-MUM-{YEAR}",
  "sequence_length": 6, "sequence_scope": "PER_BRANCH_PER_YEAR",
  "sequence_start": 1, "sequence_current": 1247, "sequence_increment": 1,
  "reset_frequency": "YEARLY", "format_template": "PO-MUM-{YEAR}-{SEQUENCE:6}",
  "applicable_branch_id": "br-mum-001", "gap_prevention_enabled": true,
  "preview_next_number": "PO-MUM-2026-001248", "status": "ACTIVE"
}
```

### 10. Audit Events
`NUMBER_SERIES_CREATED`, `NUMBER_GENERATED`, `NUMBER_RESERVED`, `NUMBER_SERIES_RESET`, `NUMBER_SERIES_UPDATED`, `NUMBER_GAP_PREVENTION_TRIGGERED`

---

## Entity 624 — Business Rule

### 1. Business Purpose
Per Part 14 §3: Supports Inventory, Finance, HR, Retail, Restaurant, Manufacturing, Warehouse. Configurable business rules per module.

### 2. Architectural Role
Rule entity — business logic externalized as configuration. Per Vol 0: "All business rules through configuration engine, not hardcoded."

### 3. Business Rules
- Rule types: VALIDATION (reject if invalid), CALCULATION (compute value), DEFAULT (set default), WORKFLOW (trigger workflow), NOTIFICATION (send alert), TRANSFORMATION (transform data)
- Rule conditions: WHEN-THEN format
- Rule priority: lower = higher priority
- Rule versioning: tracked
- Rule testing: sandbox testing before production
- Rule execution: synchronous or async

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rule_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `rule_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `rule_description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, FINANCE, HR, RETAIL, RESTAURANT, MANUFACTURING, WAREHOUSE, PROCUREMENT, EAM, QUALITY, PLATFORM, ALL | Module (per Part 14) | Internal |
| `rule_type` | ENUM | Yes | — | VALIDATION, CALCULATION, DEFAULT, WORKFLOW, NOTIFICATION, TRANSFORMATION, ENRICHMENT, ENFORCEMENT | Type | Internal |
| `trigger_event` | VARCHAR(200) | Yes | — | — | Trigger (e.g., `BEFORE_SAVE`, `AFTER_APPROVE`) | Internal |
| `trigger_entity` | VARCHAR(100) | Yes | — | — | Entity (e.g., `purchase_order`) | Internal |
| `conditions` | JSONB | Yes | `'[]'` | — | WHEN conditions (DSL) | Confidential |
| `actions` | JSONB | Yes | `'[]'` | — | THEN actions (DSL) | Confidential |
| `rule_dsl` | TEXT | Yes | — | — | Full DSL expression | Confidential |
| `rule_engine_version` | VARCHAR(20) | Yes | — | — | Engine version | Internal |
| `execution_mode` | ENUM | Yes | `SYNCHRONOUS` | SYNCHRONOUS, ASYNCHRONOUS, SCHEDULED | Mode | Internal |
| `execution_timeout_ms` | INTEGER | Yes | `5000` | ≥ 100 | Timeout | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Priority | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `applicable_role_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `condition_evaluation_logic` | ENUM | Yes | `ALL_MUST_MATCH` | ALL_MUST_MATCH, ANY_MUST_MATCH, NONE_MUST_MATCH | Logic | Internal |
| `max_execution_count` | INTEGER | No | NULL | > 0 | Max executions per record | Internal |
| `stop_on_first_match` | BOOLEAN | Yes | `false` | — | Stop after first match | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `business_rules` (self) | Previous | Internal |
| `tested_in_sandbox` | BOOLEAN | Yes | `false` | — | Sandbox tested | Internal |
| `sandbox_test_results` | JSONB | No | NULL | — | Test results | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `execution_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total executions | Internal |
| `execution_count_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `last_execution_at` | TIMESTAMPTZ | No | NULL | — | Last execution | Internal |
| `last_execution_success` | BOOLEAN | No | NULL | — | Last result | Internal |
| `last_execution_error` | TEXT | No | NULL | — | Error | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, TESTING, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Self (624) | Self-reference | N:1 | Previous version |

### 6. Indexes
- UNIQUE (`rule_code`)
- INDEX (`business_module`, `rule_type`, `status`)
- INDEX (`trigger_entity`, `trigger_event`)
- INDEX (`priority`, `status`)
- INDEX (`applicable_company_id`, `applicable_branch_id`)

### 7. Security Classification
**Confidential** — DSL and conditions are business logic.

### 8. Integration Points
- **Configuration Engine** (FS-6): Rule storage
- **Workflow Engine** (FS-3): Rule-triggered workflows
- **Event Bus** (FS-49): Event-driven rules
- **All Business Modules**: Rule evaluation

### 9. Sample Data
```json
{
  "rule_code": "RULE-PO-AMC-CHECK", "rule_name": "PO AMC Validation",
  "rule_description": "Validate that AMC PO has vendor AMC contract active",
  "business_module": "PROCUREMENT", "rule_type": "VALIDATION",
  "trigger_event": "BEFORE_SAVE", "trigger_entity": "purchase_order",
  "conditions": [{ "field": "po_type", "operator": "EQUALS", "value": "AMC" }],
  "actions": [{ "type": "REJECT_IF", "condition": "vendor_amc_contract_active == false", "message": "Vendor AMC contract not active" }],
  "execution_mode": "SYNCHRONOUS", "execution_timeout_ms": 2000,
  "priority": 50, "version": "1.0", "is_latest_version": true,
  "tested_in_sandbox": true, "execution_count_total": 4523,
  "last_execution_at": "2026-07-08T09:45:00Z",
  "last_execution_success": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`BUSINESS_RULE_CREATED`, `BUSINESS_RULE_UPDATED`, `BUSINESS_RULE_VERSION_PUBLISHED`, `BUSINESS_RULE_ACTIVATED`, `BUSINESS_RULE_DEACTIVATED`, `BUSINESS_RULE_EXECUTED`, `BUSINESS_RULE_EXECUTION_FAILED`, `BUSINESS_RULE_SANDBOX_TESTED`

---

## Entity 625 — System Parameter

### 1. Business Purpose
Per Part 14 §3: Stores Thresholds, Limits, Timeouts, Retry, Precision. Low-level system parameters.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `parameter_key` | VARCHAR(200) | Yes | — | Unique | Key | Internal |
| `parameter_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `parameter_category` | ENUM | Yes | — | THRESHOLD, LIMIT, TIMEOUT, RETRY, PRECISION, PERFORMANCE, SECURITY, INTEGRATION, CACHE, OTHER | Category (per Part 14) | Internal |
| `data_type` | ENUM | Yes | `INTEGER` | STRING, INTEGER, DECIMAL, BOOLEAN, JSON | Type | Internal |
| `default_value` | TEXT | Yes | — | — | Default | Internal |
| `current_value` | TEXT | Yes | — | — | Current | Confidential |
| `min_value` | TEXT | No | NULL | — | Min | Internal |
| `max_value` | TEXT | No | NULL | — | Max | Internal |
| `unit_of_measure` | VARCHAR(20) | No | NULL | — | Unit (seconds, ms, MB, %) | Internal |
| `description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `requires_restart` | BOOLEAN | Yes | `false` | — | Restart needed | Internal |
| `hot_reload` | BOOLEAN | Yes | `true` | — | Can reload without restart | Internal |
| `applicable_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `environment_specific` | BOOLEAN | Yes | `true` | — | Different per env | Internal |
| `development_value` | TEXT | No | NULL | — | Dev | Internal |
| `staging_value` | TEXT | No | NULL | — | Staging | Internal |
| `production_value` | TEXT | No | NULL | — | Prod | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 626 — Localization

### 1. Business Purpose
Per Part 14 §3: Supports Language Packs, Date Formats, Currency Formats, Number Formats, Regional Rules. Multi-locale support.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `locale_code` | VARCHAR(20) | Yes | — | Unique | Code (e.g., `en-IN`) | Internal |
| `language_code` | VARCHAR(10) | Yes | — | — | Language (en, hi, mr) | Internal |
| `language_name` | VARCHAR(100) | Yes | — | — | Display name | Internal |
| `country_code` | CHAR(2) | Yes | — | — | Country | Internal |
| `display_name` | VARCHAR(100) | Yes | — | — | Display name | Internal |
| `native_name` | VARCHAR(100) | Yes | — | — | Native name | Internal |
| `date_format` | VARCHAR(50) | Yes | `DD/MM/YYYY` | — | Date Formats (per Part 14) | Internal |
| `time_format` | VARCHAR(50) | Yes | `HH:mm` | — | Time format | Internal |
| `datetime_format` | VARCHAR(100) | Yes | — | — | Datetime | Internal |
| `number_format` | VARCHAR(50) | Yes | `#,##,###.##` | — | Number Formats (per Part 14) | Internal |
| `decimal_separator` | VARCHAR(5) | Yes | `.` | — | Decimal | Internal |
| `thousand_separator` | VARCHAR(5) | Yes | `,` | — | Thousand | Internal |
| `currency_format` | VARCHAR(50) | Yes | `₹#,##,###.##` | — | Currency Formats (per Part 14) | Internal |
| `currency_symbol` | VARCHAR(10) | Yes | `₹` | — | Symbol | Internal |
| `currency_position` | ENUM | Yes | `PREFIX` | PREFIX, SUFFIX | Position | Internal |
| `first_day_of_week` | ENUM | Yes | `SUNDAY` | SUNDAY, MONDAY, SATURDAY | First day | Internal |
| `weekend_days` | TEXT[] | Yes | `ARRAY['SATURDAY','SUNDAY']` | — | Weekend | Internal |
| `default_timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `rtl_direction` | BOOLEAN | Yes | `false` | — | Right-to-left | Internal |
| `translation_pack_version` | VARCHAR(20) | Yes | — | — | Translation version | Internal |
| `translation_completeness_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % translated | Internal |
| `regional_rules` | JSONB | Yes | `'{}'` | — | Regional Rules (per Part 14) | Internal |
| `tax_calculation_rules` | JSONB | No | NULL | — | Tax rules | Confidential |
| `regulatory_compliance_rules` | JSONB | No | NULL | — | Compliance | Confidential |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `is_default` | BOOLEAN | Yes | `false` | — | Default locale | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 627 — Theme Management

### 1. Business Purpose
Per Part 14 §3: Supports Light, Dark, Brand Theme, Customer Theme, Accessibility. UI theme management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `theme_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `theme_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `theme_type` | ENUM | Yes | — | LIGHT, DARK, BRAND, CUSTOMER, ACCESSIBILITY, HIGH_CONTRAST | Type (per Part 14) | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `color_palette` | JSONB | Yes | `'{}'` | — | { primary, secondary, accent, background, text, ... } | Internal |
| `typography` | JSONB | Yes | `'{}'` | — | { font_family, sizes, weights } | Internal |
| `spacing` | JSONB | Yes | `'{}'` | — | { base, multipliers } | Internal |
| `border_radius` | JSONB | Yes | `'{}'` | — | Corner radius | Internal |
| `shadows` | JSONB | Yes | `'{}'` | — | Elevation | Internal |
| `icon_set` | VARCHAR(50) | Yes | `default` | — | Icon set | Internal |
| `logo_attachment_id` | UUID | No | NULL | FK to `attachments` | Logo | Internal |
| `favicon_attachment_id` | UUID | No | NULL | FK to `attachments` | Favicon | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_brand_id` | UUID | No | NULL | FK to `brands` | Brand | Internal |
| `accessibility_compliant` | BOOLEAN | Yes | `false` | — | WCAG compliant | Internal |
| `wcag_level` | ENUM | Yes | `AA` | A, AA, AAA | WCAG level | Internal |
| `is_default` | BOOLEAN | Yes | `false` | — | Default | Internal |
| `is_system_theme` | BOOLEAN | Yes | `false` | — | System | Internal |
| `preview_attachment_id` | UUID | No | NULL | FK to `attachments` | Preview | Internal |
| `css_variables` | JSONB | Yes | `'{}'` | — | CSS custom properties | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 628 — Tenant Settings

### 1. Business Purpose
Per Part 14 §3: Supports Logo, Brand, Email, Tax, Business Rules. Multi-tenant configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `tenant_id` | UUID | Yes | — | FK to `companies` | Tenant | Internal |
| `tenant_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `tenant_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `tenant_type` | ENUM | Yes | — | ENTERPRISE, COMPANY, SUBSIDIARY, FRANCHISE, PARTNER | Type | Internal |
| `logo_attachment_id` | UUID | No | NULL | FK to `attachments` | Logo (per Part 14) | Internal |
| `logo_dark_attachment_id` | UUID | No | NULL | FK to `attachments` | Dark logo | Internal |
| `brand_color_primary` | VARCHAR(20) | Yes | `#1976D2` | — | Brand color | Internal |
| `brand_color_secondary` | VARCHAR(20) | Yes | `#424242` | — | Secondary | Internal |
| `theme_id` | UUID | Yes | — | FK to `theme_management` (Entity 627) | Theme | Internal |
| `email_domain` | VARCHAR(200) | No | NULL | — | Email (per Part 14) | Internal |
| `email_from_address` | VARCHAR(200) | Yes | — | — | From address | Confidential |
| `email_reply_to` | VARCHAR(200) | No | NULL | — | Reply-to | Confidential |
| `email_provider` | VARCHAR(100) | Yes | `SMTP` | — | Provider | Confidential |
| `email_provider_config` | JSONB | No | NULL | — | Config | Restricted |
| `sms_provider` | VARCHAR(100) | No | NULL | — | SMS provider | Confidential |
| `sms_provider_config` | JSONB | No | NULL | — | Config | Restricted |
| `tax_registration_number` | VARCHAR(50) | No | NULL | — | Tax (per Part 14) | Confidential |
| `tax_type` | ENUM | Yes | `GST` | GST, VAT, SALES_TAX, NONE | Tax type | Internal |
| `tax_rate_default` | DECIMAL(7,4) | Yes | `18.0000` | 0-100 | Default rate | Confidential |
| `fiscal_year_start_month` | INTEGER | Yes | `4` | 1-12 | FY start | Internal |
| `default_currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `default_locale` | VARCHAR(20) | Yes | `en-IN` | — | Locale | Internal |
| `default_timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `business_rules_override` | JSONB | No | NULL | — | Business Rules (per Part 14) overrides | Confidential |
| `data_retention_days` | INTEGER | Yes | `2555` | ≥ 30 | Retention | Internal |
| `backup_frequency_hours` | INTEGER | Yes | `24` | ≥ 1 | Backup | Internal |
| `max_users_allowed` | INTEGER | Yes | `1000` | ≥ 1 | User cap | Internal |
| `max_storage_gb` | DECIMAL(10,2) | Yes | `100.00` | ≥ 1 | Storage cap | Internal |
| `subscription_plan` | VARCHAR(50) | No | NULL | — | Plan | Confidential |
| `subscription_expiry` | DATE | No | NULL | — | Expiry | Confidential |
| `is_trial` | BOOLEAN | Yes | `false` | — | Trial | Internal |
| `trial_expires_at` | TIMESTAMPTZ | No | NULL | — | Trial expiry | Internal |
| `custom_domain` | VARCHAR(200) | No | NULL | — | Custom domain | Confidential |
| `ssl_certificate_id` | UUID | No | NULL | FK to `certificates` | SSL | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, SUSPENDED, TERMINATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 629 — Environment Configuration

### 1. Business Purpose
Per Part 14 §3: Supports Development, Testing, Staging, Production. Environment-specific configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `env_code` | VARCHAR(20) | Yes | — | Unique | Code | Internal |
| `env_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `env_type` | ENUM | Yes | — | DEVELOPMENT, TESTING, STAGING, PRODUCTION, DR, SANDBOX | Type (per Part 14) | Internal |
| `env_tier` | ENUM | Yes | — | DEV_TIER, QA_TIER, UAT_TIER, PROD_TIER, DR_TIER | Tier | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `base_url` | VARCHAR(500) | Yes | — | — | Base URL | Confidential |
| `api_url` | VARCHAR(500) | Yes | — | — | API URL | Confidential |
| `cdn_url` | VARCHAR(500) | No | NULL | — | CDN URL | Confidential |
| `database_connection_string_encrypted` | TEXT | Yes | — | — | DB connection | Restricted |
| `encryption_key_id` | UUID | Yes | — | FK to `security_keys` | Key | Restricted |
| `redis_connection_encrypted` | TEXT | No | NULL | — | Redis | Restricted |
| `message_queue_connection_encrypted` | TEXT | No | NULL | — | MQ | Restricted |
| `storage_bucket_name` | VARCHAR(200) | No | NULL | — | Object storage | Confidential |
| `storage_provider` | ENUM | Yes | `S3` | S3, AZURE_BLOB, GCP_STORAGE, LOCAL | Provider | Internal |
| `storage_config_encrypted` | TEXT | No | NULL | — | Storage config | Restricted |
| `feature_flags_env_specific` | BOOLEAN | Yes | `true` | — | Env-specific flags | Internal |
| `data_anonymized` | BOOLEAN | Yes | `false` | — | PII anonymized (non-prod) | Internal |
| `email_sending_enabled` | BOOLEAN | Yes | `true` | — | Real emails | Internal |
| `email_redirect_to` | VARCHAR(200) | No | NULL | — | Redirect (non-prod) | Confidential |
| `payment_gateway_mode` | ENUM | Yes | `TEST` | TEST, LIVE | Payment mode | Confidential |
| `third_party_integrations_enabled` | BOOLEAN | Yes | `true` | — | External calls | Internal |
| `logging_level` | ENUM | Yes | `INFO` | DEBUG, INFO, WARN, ERROR | Log level | Internal |
| `monitoring_enabled` | BOOLEAN | Yes | `true` | — | APM | Internal |
| `apm_provider` | VARCHAR(100) | No | NULL | — | APM | Internal |
| `backup_enabled` | BOOLEAN | Yes | `true` | — | Backups | Internal |
| `backup_frequency_hours` | INTEGER | Yes | `24` | ≥ 1 | Frequency | Internal |
| `backup_retention_days` | INTEGER | Yes | `30` | ≥ 1 | Retention | Internal |
| `disaster_recovery_enabled` | BOOLEAN | Yes | `false` | — | DR | Internal |
| `dr_target_env_id` | UUID | No | NULL | FK to `environment_configuration` (self) | DR target | Internal |
| `access_restricted` | BOOLEAN | Yes | `true` | — | Access restricted | Confidential |
| `allowed_ip_ranges` | INET[] | No | `ARRAY[]::INET[]` | — | IP whitelist | Confidential |
| `requires_vpn` | BOOLEAN | Yes | `false` | — | VPN required | Confidential |
| `provisioning_status` | ENUM | Yes | `PROVISIONED` | PROVISIONING, PROVISIONED, DEPROVISIONING, DEPROVISIONED | Provisioning | Internal |
| `provisioned_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `last_deployed_at` | TIMESTAMPTZ | No | NULL | — | Last deploy | Internal |
| `last_deployed_version` | VARCHAR(50) | No | NULL | — | Version | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 630 — Configuration Dashboard

### 1. Business Purpose
Per Part 14 §3: Displays Enabled Features, Configuration Health, Version, Active Rules, Environment. AI: Unused Features, Configuration Cleanup, Performance Tuning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `total_configurations_count` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `configurations_overridden_count` | INTEGER | Yes | `0` | ≥ 0 | Overridden | Internal |
| `enabled_features_count` | INTEGER | Yes | `0` | ≥ 0 | Enabled Features (per Part 14) | Internal |
| `enabled_features_list` | JSONB | Yes | `'[]'` | — | List | Internal |
| `disabled_features_count` | INTEGER | Yes | `0` | ≥ 0 | Disabled | Internal |
| `beta_features_count` | INTEGER | Yes | `0` | ≥ 0 | Beta | Internal |
| `pilot_features_count` | INTEGER | Yes | `0` | ≥ 0 | Pilot | Internal |
| `kill_switches_active_count` | INTEGER | Yes | `0` | ≥ 0 | Kill switches | Restricted |
| `configuration_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Configuration Health (per Part 14) | Confidential |
| `health_issues_count` | INTEGER | Yes | `0` | ≥ 0 | Issues | Confidential |
| `health_issues_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `platform_version` | VARCHAR(50) | Yes | — | — | Version (per Part 14) | Internal |
| `platform_build` | VARCHAR(50) | Yes | — | — | Build | Internal |
| `platform_release_date` | DATE | Yes | — | — | Release | Internal |
| `active_business_rules_count` | INTEGER | Yes | `0` | ≥ 0 | Active Rules (per Part 14) | Internal |
| `active_business_rules_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `rule_execution_today_count` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `rule_failures_today_count` | INTEGER | Yes | `0` | ≥ 0 | Failures | Confidential |
| `current_environment` | ENUM | Yes | — | DEVELOPMENT, TESTING, STAGING, PRODUCTION, DR, SANDBOX | Environment (per Part 14) | Internal |
| `environments_count` | INTEGER | Yes | `0` | ≥ 0 | Total envs | Internal |
| `number_series_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active series | Internal |
| `localizations_active_count` | INTEGER | Yes | `0` | ≥ 0 | Locales | Internal |
| `themes_active_count` | INTEGER | Yes | `0` | ≥ 0 | Themes | Internal |
| `tenants_active_count` | INTEGER | Yes | `0` | ≥ 0 | Tenants | Internal |
| `ai_unused_features_identified` | JSONB | No | NULL | — | AI: Unused Features (per Part 14 AI) | Confidential |
| `ai_configuration_cleanup` | JSONB | No | NULL | — | AI: Configuration Cleanup (per Part 14 AI) | Confidential |
| `ai_performance_tuning` | JSONB | No | NULL | — | AI: Performance Tuning (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 14 Batch 1 Completion Summary

**All 30 Identity, RBAC & Configuration entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked (Part 14 Batch 1)

1. **Platform Kernel (Q189)** — MOST IMPORTANT architectural decision in SUOP — single shared kernel for all platform services
2. **Enterprise Identity Service** — One identity per person, never duplicated across modules
3. **Multi-Provider Authentication** — Local + Google + Microsoft + Apple + LDAP + SAML + OAuth2 + OIDC
4. **Session Management** — JWT (15min) + opaque refresh token (7 days), concurrent session limits
5. **Device Registry** — All devices registered, MDM-integrated, security posture scored
6. **Organization Service** — Unlimited hierarchy (Enterprise → Company → BU → Branch → Plant/Warehouse/Store/Restaurant/Office)
7. **Branch Master** — Per-branch module enablement, tax region, fiscal year configuration
8. **Location Master** — GPS + geo-fence + what3words multi-modal location
9. **Enterprise RBAC** — Role hierarchy with inheritance, system/builtin/custom/template types
10. **Permission Master** — Atomic permissions `MODULE:RESOURCE:ACTION`, field-level and record-level controls
11. **Policy Engine** — Multi-dimensional (Location/Time/Device/Role/Risk based), Zero Trust ready
12. **Resource Authorization** — Resource-level with sensitivity classification (Public → Top Secret)
13. **Data Access Policy** — Company/Branch/Department/BU/Ownership scope with row/column restrictions
14. **Approval Authority** — Financial limits, dual approval, delegation, escalation
15. **API Security** — JWT/OAuth/API keys with rate limiting and IP whitelist
16. **Password Policy** — Argon2id, complexity, expiry, history, breach check, dictionary check
17. **MFA Policy** — Multi-factor (OTP/Authenticator/Email/SMS/Security Key) with step-up authentication
18. **Configuration Engine** — Hierarchical (Enterprise → Company → Branch → User), 5-min cache
19. **Feature Flag Engine** — Enable/Disable/Beta/Pilot/Gradual rollout with kill switch
20. **Number Series Engine** — Per-document numbering with gap prevention and reserved numbers
21. **Business Rules** — DSL-based WHEN-THEN rules with sandbox testing and versioning
22. **System Parameters** — Environment-specific with hot reload
23. **Localization** — Multi-locale with regional rules and translation packs
24. **Theme Management** — Light/Dark/Brand/Customer/Accessibility with WCAG compliance
25. **Tenant Settings** — Multi-tenant with per-tenant branding, email, tax, business rules
26. **Environment Configuration** — Dev/Test/Staging/Prod/DR with encrypted credentials
27. **AI Configuration Intelligence** — Unused features, configuration cleanup, performance tuning

## New Foundation Services Locked

| Service ID | Service Name | Section |
|---|---|---|
| FS-46 | Feature Flag Engine | Sec 3 |
| FS-47 | Number Series Engine | Sec 3 |
| FS-48 | Search Engine | (Sec 4-6 — to be defined) |
| FS-49 | Event Bus | (Sec 4-6 — to be defined) |
| FS-50 | Print Engine | (Sec 4-6 — to be defined) |
| FS-51 | AI Gateway | (Sec 4-6 — to be defined) |

**Cumulative Foundation Services**: 51 (FS-1 through FS-51) — but Platform Kernel (Q189) is the meta-architecture that organizes all of them.

## Architectural Decision Q189 — Platform Kernel (Most Important)

| Attribute | Value |
|---|---|
| Decision ID | Q189 |
| Title | Platform Kernel as Meta-Architecture |
| Importance | **HIGHEST — Most important architectural decision in SUOP** |
| Status | LOCKED |
| Owner | Enterprise Architect |
| Problem | Eliminate duplicated platform functionality across all business modules |
| Solution | Single shared Platform Kernel with 15+ Foundation Services |
| Benefits | Eliminate duplicate code, standardize security/config, simplify testing, enable future modules, clean microservices migration path |
| Governance | Platform Kernel team owns all Foundation Services; business modules consume via contracts |
| Migration Path | Modular monolith initially → microservices when scale demands |

## Cross-Module Impact

### Every Business Module Consumes:
- **Identity Service** for authentication
- **RBAC Engine** for authorization
- **Configuration Engine** for settings
- **Feature Flag Engine** for feature toggling
- **Number Series Engine** for document numbering
- **Audit Engine** for compliance
- **Notification Engine** for alerts

### Future Modules Enabled by Platform Kernel:
- CRM (Customer Relationship Management)
- Sales Force Automation
- Customer Portal
- Supplier Portal
- Partner Portal
- Mobile Field Service App
- Any future module — just consume platform services, no platform reinvention

## Part 14 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| **Batch 1** | **1-3 (Identity, RBAC, Configuration)** | **601-630** | **✅ COMPLETE (LOCKED)** |
| Batch 2 | 4-6 (Workflow, Notification, Document) | 631-660 | ⏳ PENDING |
| Batch 3 | 7-9 (API Gateway, Event Bus, Search, Barcode, Print, Integration, Scheduler) | 661-690 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 635 entities (Parts 1-14 Batch 1)
- **Foundation Services**: 51 (FS-1 through FS-51) + Platform Kernel (Q189) as meta-architecture
- **Architectural Decisions**: 189 (Q1-Q189) — Q189 is the most important

---

*End of Manual 1 Part 14 Sections 1-3. Next batch: Sections 4-6 (Workflow Engine, Notification Engine, Document Management) — the shared operational backbone used by every SUOP module.*
