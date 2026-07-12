# 10 — Risk Register: Login + Dashboard + Organization

**Scope**: Risks introduced by the current state of the section, their likelihood, impact, owner, and mitigation.
**Convention**: Risks are numbered R-01 through R-20. Each risk has a category, likelihood (L/M/H), impact (L/M/H), and a residual risk after mitigation.

---

## 1. Risk Heatmap

| Impact \ Likelihood | Low | Medium | High |
|---|---|---|---|
| **High** | R-04, R-12, R-15 | R-03, R-08, R-10 | **R-01, R-02, R-11** |
| **Medium** | R-06, R-14, R-16 | R-05, R-07, R-17, R-19 | R-09, R-13 |
| **Low** | R-18, R-20 | R-20 | — |

The three red-zone risks (R-01, R-02, R-11) require immediate attention.

---

## 2. Risk Register

| # | Risk | Category | Likelihood | Impact | Owner | Mitigation | Residual |
|---|---|---|---|---|---|---|---|
| R-01 | Token-key mismatch breaks all API client calls after login | Technical | High | High | Frontend lead | G-01 fix (single key) | Low |
| R-02 | Users believe login succeeded but every module returns 401 | UX / Trust | High | High | Frontend lead | Fix R-01; add integration test that hits an API client post-login | Low |
| R-03 | Dashboard shows fabricated counters → user loses trust in entire UI | Business | Medium | High | Product | G-03: replace with real counts | Low |
| R-04 | Admin cannot create a company from the UI → onboarding stalls | Operational | Low | High | Product | G-06, G-08: implement CRUD | Low |
| R-05 | "Add Entity" button silently no-ops → user thinks app is broken | UX | Medium | Medium | Frontend lead | G-06: wire onClick | Low |
| R-06 | No loading state → user perceives latency as a hang | UX | Low | Medium | Frontend lead | G-09: add skeletons | Low |
| R-07 | No error state → failures are invisible until the user refreshes | UX | Medium | Medium | Frontend lead | G-10: add error UI + retry | Low |
| R-08 | No permission checks → users click buttons and get 403 | UX / Security | Medium | High | Frontend lead | G-11: `hasPermission` helper | Low |
| R-09 | No audit trail viewer → compliance audit stalls | Compliance | High | Medium | Compliance lead | G-16: audit timeline | Low |
| R-10 | No workflow transition UI → illegal states reachable only via API | Operational | Medium | High | Frontend lead | G-17: transition dialogs | Low |
| R-11 | Login error does not distinguish LOCKED / SUSPENDED / ARCHIVED → support tickets spike | Support | High | High | Support lead | G-24: branch on error code | Low |
| R-12 | Refresh-token rotation not retried on 401 → user signed out on transient failure | Technical | Low | High | Frontend lead | G-23: retry once on 401 | Low |
| R-13 | Hardcoded org tree drifts from backend truth → wrong decisions | Data | High | Medium | Frontend lead | G-04: hierarchyApi | Low |
| R-14 | No tenant indicator → user acts in wrong tenant | Security | Low | Medium | Frontend lead | G-22: tenant badge in Header | Low |
| R-15 | Hard delete available without double confirmation → irreversible data loss | Data | Low | High | Frontend lead | G-13 + typed-confirm dialog | Low |
| R-16 | Sprint data static → users see stale progress | Business | Low | Medium | Product | G-21: mark as historical | Low |
| R-17 | No search/filter on tree → admin scrolls through 50+ nodes | UX | Medium | Medium | Frontend lead | G-14: search input | Low |
| R-18 | No dark mode toggle → accessibility complaint | Accessibility | Low | Low | Frontend lead | G-19: theme toggle | Low |
| R-19 | No breadcrumbs → user gets lost in deep modules | UX | Medium | Medium | Frontend lead | G-20: breadcrumbs | Low |
| R-20 | No form validation → invalid GSTIN/PAN/CIN submitted, 422 returned | UX | Low | Low | Frontend lead | G-18: zod schemas | Low |

---

## 3. Detailed Risk Analysis — Top 5

### 3.1 R-01 Token-key mismatch (Critical)

- **Scenario**: User logs in successfully, navigates to Organization, sees "Failed to load" because the API client sent no auth header.
- **Root cause**: `auth-store.ts` persists under `suop_auth`; clients read `suop_access_token`.
- **Blast radius**: every API client in the app (14 clients across all sections, not just this one).
- **Detection today**: zero — there is no integration test that exercises an API client post-login.
- **Mitigation**: G-01 (single key) + add a smoke test that calls `orgClient.hierarchyApi.getTree()` after login.
- **Residual**: Low, provided the smoke test is added to CI.

### 3.2 R-02 User trust erosion (Critical)

- **Scenario**: Same as R-01 but viewed from the user's perspective. Login looks green; everything else is red.
- **Root cause**: the Login screen's success state is decoupled from downstream API success.
- **Mitigation**: fix R-01; additionally, the post-login `initialize()` flow should issue a "warm-up" API call (e.g., `GET /auth/me`) and surface a toast if it fails.
- **Residual**: Low.

### 3.3 R-11 Lockout support spike (High)

- **Scenario**: A user mistypes his password 5 times. The account locks for 30 minutes. The Login screen shows "Invalid email or password" — identical to a typo. The user keeps retrying, then raises a support ticket.
- **Root cause**: `loginError` is a single string; the backend's `auth.account_locked` code is not branched.
- **Mitigation**: G-24 — branch on backend error code; show the lock duration; disable the Sign In button until `locked_until` elapses.
- **Residual**: Low. Support tickets for lockout should drop > 50%.

### 3.4 R-08 Missing permission checks (High)

- **Scenario**: An operator clicks "Add Entity" (once it is wired). The button is visible because there is no permission check. The backend returns 403. The operator sees a generic error toast.
- **Root cause**: no `hasPermission` helper; no conditional rendering.
- **Mitigation**: G-11 — introduce the helper and gate every CRUD button.
- **Residual**: Low. Auditors will still want to verify the helper is applied consistently; add a lint rule.

### 3.5 R-15 Irreversible hard-delete (High)

- **Scenario**: An admin clicks "Delete" on a company, then "Permanently delete". The row is purged from the database. The audit row remains but the entity is gone.
- **Root cause**: no typed-confirm dialog; the `hardDelete` endpoint is reachable via the client.
- **Mitigation**: G-13 + a typed-confirm dialog that requires the user to type the company name. Disable hard-delete for any company with active plants.
- **Residual**: Low.

---

## 4. Risk by Category

| Category | Count | Top risk |
|---|---|---|
| Technical | 4 | R-01 |
| UX / Trust | 6 | R-02 |
| Business | 3 | R-03 |
| Operational | 3 | R-04 |
| Compliance | 1 | R-09 |
| Security | 2 | R-08 |
| Data | 2 | R-13 |
| Support | 1 | R-11 |
| Accessibility | 1 | R-18 |

UX/Trust and Technical risks dominate. Both are concentrated in the token-key and permission-check gaps.

---

## 5. Risk Trend (Projected)

| Milestone | Risks closed | Residual critical | Residual high |
|---|---|---|---|
| Today (discovery) | 0 | 2 (R-01, R-02) | 8 |
| After W-01 (token fix) | 4 | 0 | 6 |
| After W-02 (org wiring) | 8 | 0 | 4 |
| After W-03 (CRUD + transitions) | 14 | 0 | 2 |
| After W-04 (polish: toasts, validation, breadcrumbs) | 20 | 0 | 0 |

See `12_IMPLEMENTATION_PLAN.md` for the workstream mapping.

---

## 6. Compliance and Regulatory Risks

| # | Risk | Regulation | Mitigation |
|---|---|---|---|
| C-1 | GSTIN/PAN/CIN not validated client-side → invalid filings | GST (India) | G-18 + server-side regex (already in place) |
| C-2 | No audit trail viewer → auditor cannot inspect changes | ISO 27001, SOC 2 | G-16 |
| C-3 | No periodic access review export | ISO 27001 A.9 | Future: role-assignment export |
| C-4 | No password change UI in this section | ISO 27001 A.9 | Surface change-password form |
| C-5 | No session revocation UI | ISO 27001 A.9 | Surface sessions list |

C-2 is the highest-priority compliance risk because the audit data exists but is not visible.

---

## 7. Operational Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| O-1 | Onboarding a new tenant requires SQL access | High | High | G-08 + G-17 (CRUD + transitions) |
| O-2 | Restoring a soft-deleted company requires SQL | Medium | High | G-17 (restore button) |
| O-3 | Suspending a company for non-payment requires SQL | Medium | High | G-17 (suspend transition) |
| O-4 | Auditing "who created this plant" requires SQL | High | Medium | G-16 (audit viewer) |
| O-5 | Resetting a locked user requires admin API call | High | Medium | Surface unlock button in user management (out of section) |

---

## 8. Security Risks (Beyond RBAC)

| # | Risk | Mitigation |
|---|---|---|
| S-1 | JWT stored in localStorage → XSS exfiltration | Accept for v1; consider httpOnly cookie in v2 |
| S-2 | No CSRF token (acceptable for Bearer auth) | n/a |
| S-3 | No rate-limit indicator on Login | Show "Too many attempts, slow down" after 3 fails |
| S-4 | Demo mode grants full read | Already badged; restrict demo writes |
| S-5 | No device fingerprinting on Login | Future |

---

## 9. Risk Acceptance Statement

The following risks are accepted for v1 and will be revisited in v1.1:

- R-16 (static sprint data) — historical, marked as such.
- R-18 (no dark mode toggle) — current dark theme is acceptable.
- S-1 (JWT in localStorage) — standard for SPAs; revisit with cookie-based auth in v2.
- S-5 (no device fingerprinting) — future epic.

All other risks must be mitigated before the section is declared production-ready.

---

## 10. Risk Review Cadence

- Weekly during the implementation sprint.
- Bi-weekly after release.
- Triggered review on any P1/P2 incident.
- Quarterly compliance review for C-1 through C-5.

---

## 11. Conclusion

The section carries **2 critical risks** (R-01, R-02) that are both rooted in the same defect (the token-key mismatch). Fixing that single defect collapses both critical risks and unblocks every downstream mitigation. The next tier — R-03, R-08, R-11 — is addressable within the same implementation sprint and brings the section from "fragile" to "production-ready". The risk profile is **concentrated and tractable**: no exotic threats, no architectural rework, just disciplined wiring of existing capabilities.
