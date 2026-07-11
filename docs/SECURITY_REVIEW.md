# Security Review — SUOP ERP v1.0 RC1

**Audit Date**: 2026-07-12
**Security Score**: **5.0 / 10** (🟡 Moderate Risk)

---

## 1. Authentication Security

### 1.1 Password Hashing ✅
- **Algorithm**: Argon2id (OWASP recommended)
- **Configuration**: Via `core/auth/password.ts`
- **Pepper**: `PASSWORD_PEPPER` env var (32+ chars required)
- **Assessment**: ✅ Secure

### 1.2 JWT Implementation ✅
- **Access token**: 15-minute TTL (configurable)
- **Refresh token**: 30-day TTL with rotation
- **Algorithm**: HS256
- **Secret**: 32+ character minimum enforced
- **Assessment**: ✅ Secure

### 1.3 Session Management ✅
- Multi-device session support
- Session revocation via `/auth/sessions/:id/revoke`
- Refresh token rotation on every refresh
- **Assessment**: ✅ Secure

### 1.4 Account Lockout ✅
- 5 failed login attempts → auto-lock
- Admin can manually unlock
- **Assessment**: ✅ Secure

---

## 2. Authorization Security

### 2.1 RBAC ✅
- 53 permissions across 11 resource types
- 6 default roles (tenant_admin, quality_manager, procurement_officer, procurement_manager, warehouse_operator, auditor)
- `requirePermission()` middleware on all protected routes
- **Assessment**: ✅ Good

### 2.2 Multi-Tenant Isolation ✅
- `tenant_id` on all business tables
- `tenantMiddleware` extracts tenant from JWT
- Prisma tenant extension auto-injects `WHERE tenant_id = ?`
- **Assessment**: ✅ Good (RLS not yet enabled — PGlite limitation)

---

## 3. Critical Security Gaps

### S-001: No Rate Limiting 🔴 Critical
- **Risk**: Brute force attacks on `/auth/login`, `/auth/forgot-password`
- **OWASP**: A07:2021 – Identification and Authentication Failures
- **Fix**: Add Redis-backed rate limiter

### S-002: No CORS Configuration 🔴 Critical
- **Risk**: Either blocks legitimate cross-origin requests or allows all
- **OWASP**: A05:2021 – Security Misconfiguration
- **Fix**: Configure `hono/cors` with allowed origins

### S-003: No Security Headers 🔴 Critical
- **Missing**: X-Content-Type-Options, X-Frame-Options, HSTS, CSP
- **OWASP**: A05:2021 – Security Misconfiguration
- **Fix**: Add security headers middleware

### S-004: No Input Sanitization for XSS 🟠 High
- **Risk**: User-supplied text stored in DB without HTML sanitization
- **OWASP**: A03:2021 – Injection
- **Fix**: Sanitize all user input with DOMPurify or similar

### S-005: SQL Injection Risk (Raw SQL) 🟠 High
- **Risk**: 341 tables accessed via raw SQL through PGlite. While parameterized queries are used, the lack of ORM protection increases risk of injection if parameterization is missed.
- **OWASP**: A03:2021 – Injection
- **Fix**: Migrate to Prisma client for all database access

### S-006: No Secret Rotation Procedure 🟠 High
- **Risk**: JWT_SECRET and PASSWORD_PEPPER cannot be rotated without invalidating all sessions
- **Fix**: Implement multi-key support

### S-007: No CSRF Protection 🟡 Medium
- **Risk**: Currently N/A (JWT in Authorization header is CSRF-safe), but future risk if cookie-based auth is added
- **Fix**: Document CSRF-safe approach; add double-submit cookie if cookies are used

### S-008: No IP Allowlisting for Admin 🟡 Medium
- **Risk**: Admin endpoints accessible from any IP
- **Fix**: Add IP allowlist middleware for `/api/v1/admin/*`

### S-009: No File Upload Validation 🟡 Medium
- **Risk**: `core/files/file-service.ts` accepts files without MIME type validation or virus scanning
- **Fix**: Validate file types, scan with ClamAV, enforce size limits

### S-010: No Dependency Vulnerability Scanning 🟡 Medium
- **Risk**: Known CVEs in npm dependencies undetected
- **Fix**: Add `npm audit` or Snyk to CI pipeline

---

## 4. Security Headers Checklist

| Header | Status | Recommendation |
|---|---|---|
| X-Content-Type-Options: nosniff | ❌ Missing | Add |
| X-Frame-Options: DENY | ❌ Missing | Add |
| Strict-Transport-Security | ❌ Missing | Add (production only) |
| Content-Security-Policy | ❌ Missing | Add |
| X-XSS-Protection | ❌ Missing | Add (legacy browsers) |
| Referrer-Policy | ❌ Missing | Add |
| Permissions-Policy | ❌ Missing | Add |

---

## 5. OWASP Top 10 Compliance

| OWASP Risk | Status | Notes |
|---|---|---|
| A01: Broken Access Control | ✅ Good | RBAC enforced, multi-tenant isolation |
| A02: Cryptographic Failures | ✅ Good | Argon2id, JWT with strong secret |
| A03: Injection | ⚠️ Moderate | Raw SQL with parameterization, no ORM |
| A04: Insecure Design | ⚠️ Moderate | Stub services, missing rate limiting |
| A05: Security Misconfiguration | ❌ Poor | No CORS, no headers, no helmet |
| A06: Vulnerable Components | ❌ Unknown | No dependency scanning |
| A07: Auth Failures | ⚠️ Moderate | No rate limiting, good password policy |
| A08: Data Integrity Failures | ✅ Good | JWT signed, audit logs immutable |
| A09: Logging Failures | ✅ Good | Comprehensive audit logging |
| A10: SSRF | ✅ Good | No server-side URL fetching |

---

## 6. Recommendations (Priority Order)

1. Add rate limiting (Critical, 1 day)
2. Add CORS configuration (Critical, 2 hours)
3. Add security headers (Critical, 2 hours)
4. Migrate to Prisma client (High, 10-15 days)
5. Add dependency scanning (Medium, 2 hours)
6. Add file upload validation (Medium, 1 day)
7. Add IP allowlisting for admin (Medium, 1 day)
8. Implement secret rotation (High, 2 days)
