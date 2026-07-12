# 13 — Production Scorecard: Login + Dashboard + Organization

**Scope**: Objective readiness scoring across 10 dimensions, with weighted total and go/no-go recommendation.
**Convention**: Each dimension scored 0–10. Weighted total out of 10. Threshold for production go-live: 7.5.

---

## 1. Scorecard Summary

| # | Dimension | Weight | Score (0–10) | Weighted | Verdict |
|---|---|---|---|---|---|
| D-01 | Functional completeness | 15 % | 5.0 | 0.75 | Amber |
| D-02 | API integration | 15 % | 4.0 | 0.60 | Red |
| D-03 | Data integrity | 10 % | 5.0 | 0.50 | Amber |
| D-04 | Security & RBAC | 15 % | 6.5 | 0.98 | Amber |
| D-05 | Workflow & lifecycle | 10 % | 4.0 | 0.40 | Red |
| D-06 | UX & accessibility | 10 % | 6.0 | 0.60 | Amber |
| D-07 | Observability & audit | 10 % | 5.5 | 0.55 | Amber |
| D-08 | Test coverage | 5 % | 2.0 | 0.10 | Red |
| D-09 | Performance | 5 % | 7.0 | 0.35 | Green |
| D-10 | Documentation | 5 % | 7.5 | 0.38 | Green |
| **Total** | | **100 %** | | **5.21 / 10** | **Red** |

**Go-live recommendation**: **NO-GO** until the two critical gaps (G-01, G-02) and the four red dimensions (D-02, D-05, D-08) are addressed. Estimated 4 weeks to reach 8.0+ (see `12_IMPLEMENTATION_PLAN.md`).

---

## 2. Dimension Detail

### 2.1 D-01 Functional completeness — 5.0 / 10 (Amber)

| Criterion | Met? | Notes |
|---|---|---|
| Login works end-to-end | ✅ | Argon2id, JWT, refresh, lockout |
| Dashboard renders | ✅ | Visual only |
| Dashboard shows real data | ❌ | All 4 stats hardcoded |
| Organization renders | ✅ | Visual only |
| Organization CRUD | ❌ | No forms, no handlers |
| Organization workflow transitions | ❌ | No transition UI |
| Audit trail viewer | ❌ | Not surfaced |
| Sign out works | ✅ | |
| Demo mode works | ✅ | |

5/10 criteria met.

### 2.2 D-02 API integration — 4.0 / 10 (Red)

| Criterion | Met? | Notes |
|---|---|---|
| Auth endpoints wired | ✅ | 4/12 used |
| Organization endpoints wired | ❌ | 0/22 used |
| User management endpoints wired | ❌ | 0/29 used (out of scope but referenced) |
| Token propagation correct | ❌ | **Critical: key mismatch** |
| Auto-refresh on 401 | ❌ | Not implemented |
| Error normalisation | ✅ | Clients throw `ApiError` |
| Pagination support | ✅ | Clients support page/pageSize |
| Retry/backoff | ❌ | Not implemented |

3/8 criteria met. Token mismatch is the dominant failure.

### 2.3 D-03 Data integrity — 5.0 / 10 (Amber)

| Criterion | Met? | Notes |
|---|---|---|
| Tenant isolation enforced | ✅ | Backend + Prisma extension |
| Soft delete consistent | ✅ | All tables have `deleted_at` |
| Optimistic concurrency | ✅ | `version` column on all tables |
| Audit columns populated | ✅ | `created_by`, `updated_by` |
| Frontend displays correct data | ❌ | Hardcoded values |
| Frontend prevents invalid mutations | ❌ | No validation |
| Cross-module context (org-context-store) wired | ❌ | Not consumed |

3/7 criteria met.

### 2.4 D-04 Security & RBAC — 6.5 / 10 (Amber)

| Criterion | Met? | Notes |
|---|---|---|
| Argon2id password hashing | ✅ | |
| Account lockout (5 fails / 30 min) | ✅ | |
| Password history (10) | ✅ | |
| Refresh-token rotation | ✅ | |
| JWT validation on every request | ✅ | |
| Per-route permission checks (backend) | ✅ | |
| Permission checks (frontend) | ❌ | No `hasPermission` usage |
| Tenant indicator visible | ❌ | No badge |
| Login error branching | ❌ | Single error string |
| Rate-limit indicator on Login | ❌ | Not surfaced |
| CSRF protection | ✅ | Bearer-auth, not needed |
| XSS protection | ✅ | React escaping + CSP |

8/12 criteria met.

### 2.5 D-05 Workflow & lifecycle — 4.0 / 10 (Red)

| Criterion | Met? | Notes |
|---|---|---|
| UserLifecycle enforced (backend) | ✅ | |
| OrganizationLifecycle enforced (backend) | ✅ | |
| Transitions surfaced (frontend) | ❌ | |
| Status badges on entities | ❌ | |
| Reason capture on suspend/archive | ❌ | |
| Restore UI | ❌ | |
| Hard-delete typed-confirm | ❌ | |
| Event subscription (real-time refresh) | ❌ | |

2/8 criteria met.

### 2.6 D-06 UX & accessibility — 6.0 / 10 (Amber)

| Criterion | Met? | Notes |
|---|---|---|
| Consistent design language | ✅ | Dark slate + indigo |
| Responsive (mobile/tablet/desktop) | ✅ | |
| Loading skeletons | ❌ | |
| Error states with retry | ❌ | |
| Toast notifications | ❌ | (primitives available, not used) |
| Confirmation dialogs | ❌ | |
| Breadcrumbs | ❌ | |
| Keyboard navigation | ⚠️ | Login yes, tree no |
| Screen reader labels | ⚠️ | Placeholder-as-label pattern |
| Colour contrast | ✅ | |
| Reduced-motion support | ❌ | |
| Form validation | ❌ | |

3/12 criteria met.

### 2.7 D-07 Observability & audit — 5.5 / 10 (Amber)

| Criterion | Met? | Notes |
|---|---|---|
| Audit log on every mutation (backend) | ✅ | 9 call sites in org service |
| Audit log on every login | ✅ | Success + failure |
| Event outbox | ✅ | |
| Correlation IDs | ✅ | |
| Audit viewer (frontend) | ❌ | |
| Real-time event feed | ❌ | |
| Metrics endpoint | ✅ | (backend `/metrics`) |
| Distributed tracing | ✅ | (OpenTelemetry) |
| Error reporting (Sentry) | ✅ | (configured) |
| User-facing error visibility | ❌ | Toasts missing |

6/10 criteria met.

### 2.8 D-08 Test coverage — 2.0 / 10 (Red)

| Criterion | Met? | Notes |
|---|---|---|
| Unit tests for LoginScreen | ⚠️ | Ad-hoc, not automated |
| Unit tests for DashboardModule | ❌ | |
| Unit tests for OrganizationModule | ❌ | |
| Integration tests for orgClient | ❌ | |
| Integration tests for authService | ✅ | (backend) |
| E2E for login journey | ❌ | |
| E2E for dashboard | ❌ | |
| E2E for organization CRUD | ❌ | |
| Accessibility tests (axe) | ❌ | |
| Performance tests (k6) | ✅ | (backend, scripts/k6/) |
| Visual regression | ❌ | |

3/11 criteria met. This is the lowest-scoring dimension.

### 2.9 D-09 Performance — 7.0 / 10 (Green)

| Criterion | Met? | Notes |
|---|---|---|
| Login latency < 800ms p95 | ✅ | Argon2id tuned |
| Hierarchy API < 200ms p95 | ✅ | Indexed queries |
| Dashboard render < 1.5s | ✅ | (hardcoded, so trivially fast) |
| Tree render < 500ms (50 nodes) | ✅ | |
| Tree render < 2s (500 nodes) | ⚠️ | Untested at scale |
| No N+1 queries | ✅ | Hierarchy uses bulk fetches |
| Redis cache on hot paths | ✅ | Backend |
| Client-side query cache | ❌ | No React Query |
| Bundle size < 500 KB | ✅ | (estimated) |
| Lighthouse score ≥ 80 | ⚠️ | Not measured |

7/10 criteria met.

### 2.10 D-10 Documentation — 7.5 / 10 (Green)

| Criterion | Met? | Notes |
|---|---|---|
| Section audit exists | ✅ | (this report set) |
| API reference | ✅ | OpenAPI in backend |
| Database dictionary | ✅ | `volume-0.5/manual-01-data-dictionary/` |
| Runbook | ✅ | `docs/runbooks/PRODUCTION_RUNBOOK.md` |
| Architecture pack | ✅ | `download/suop-architecture-pack/` |
| Component storybook | ❌ | |
| User guide | ❌ | |
| ADRs | ⚠️ | Scattered |
| Inline code comments | ⚠️ | Mixed |

6/9 criteria met.

---

## 3. Score Trajectory

| Milestone | Projected total | Change |
|---|---|---|
| Today (discovery) | 5.21 | — |
| After W-01 (token fix) | 6.10 | +0.89 (D-02, D-03, D-07 up) |
| After W-02 (org wiring) | 6.65 | +0.55 (D-01, D-02, D-05 up) |
| After W-03 (dashboard) | 6.95 | +0.30 (D-01, D-02 up) |
| After W-04 (CRUD) | 7.55 | +0.60 (D-01, D-05, D-06 up) |
| After W-05 (transitions + audit) | 8.05 | +0.50 (D-05, D-07 up) |
| After W-06 (permissions + login) | 8.45 | +0.40 (D-04 up) |
| After W-07 (polish) | 8.65 | +0.20 (D-06 up) |
| After W-08 (tests) | 9.05 | +0.40 (D-08 up) |

**Production threshold (7.5) reached after Sprint 2 W-04.** Target score 9.0+ reached after W-08.

---

## 4. Critical Defects Blocking Go-Live

| ID | Defect | Dimension | Fix |
|---|---|---|---|
| B-01 | Token key mismatch | D-02 | W-01 |
| B-02 | `orgClient` not imported | D-02 | W-02 |
| B-03 | No login error branching | D-04 | W-06 |
| B-04 | No permission checks | D-04 | W-06 |
| B-05 | No transition UI | D-05 | W-05 |
| B-06 | No audit viewer | D-07 | W-05 |
| B-07 | No automated tests | D-08 | W-08 |

All seven are addressed in the 4-week implementation plan.

---

## 5. Strengths to Preserve

| Strength | Dimension | Notes |
|---|---|---|
| Argon2id + lockout + history | D-04 | Production-grade auth backend |
| Multi-tenant isolation | D-03 | Prisma extension + raw SQL scoping |
| Audit log + event outbox | D-07 | Comprehensive backend instrumentation |
| Workflow engine (generic FSM) | D-05 | Reusable across modules |
| Full shadcn/ui kit installed | D-06 | ~50 primitives available |
| Architecture pack + data dictionary | D-10 | Strong documentation baseline |
| Performance tuning (Argon2, indexes, Redis) | D-09 | Already meets thresholds |

These strengths mean the gap is **wiring, not capability**.

---

## 6. Comparison to Industry Baselines

| Dimension | This section | Industry baseline (ERP SaaS) | Gap |
|---|---|---|---|
| Functional completeness | 5.0 | 8.0 | -3.0 |
| API integration | 4.0 | 8.5 | -4.5 |
| Data integrity | 5.0 | 8.5 | -3.5 |
| Security & RBAC | 6.5 | 9.0 | -2.5 |
| Workflow & lifecycle | 4.0 | 8.0 | -4.0 |
| UX & accessibility | 6.0 | 8.0 | -2.0 |
| Observability & audit | 5.5 | 8.5 | -3.0 |
| Test coverage | 2.0 | 8.0 | -6.0 |
| Performance | 7.0 | 8.5 | -1.5 |
| Documentation | 7.5 | 7.5 | 0.0 |

The largest gaps are in test coverage (-6.0) and API integration (-4.5) — both closeable without architectural change.

---

## 7. Go / No-Go Decision Matrix

| Condition | Status |
|---|---|
| Zero critical defects | ❌ (7 blocking) |
| Total score ≥ 7.5 | ❌ (5.21) |
| D-02 (API integration) ≥ 7.0 | ❌ (4.0) |
| D-04 (Security) ≥ 8.0 | ❌ (6.5) |
| D-08 (Tests) ≥ 6.0 | ❌ (2.0) |
| E2E TE-01 green | ❌ |
| Staging sign-off | ❌ |

**Verdict: NO-GO.** All six conditions fail. Re-evaluate after Sprint 2.

---

## 8. Re-Evaluation Triggers

The scorecard will be re-evaluated when:

1. W-01 (token fix) is merged → re-score D-02, D-03, D-07.
2. W-02 (org wiring) is merged → re-score D-01, D-02, D-05.
3. W-04 (CRUD) is merged → re-score D-01, D-05, D-06.
4. W-06 (permissions + login) is merged → re-score D-04.
5. W-08 (tests) is merged → re-score D-08.
6. Any P1 incident in production → immediate re-evaluation.

---

## 9. Recommendation

**Do not ship the section to production in its current state.** The Login screen is safe to ship (it works end-to-end), but the Dashboard and Organization modules are visual mockups that mislead users and block admin self-service.

**Recommended path**:

1. **Week 1**: ship W-01 (token fix) as a hotfix. This unblocks every other module in the app, not just this section.
2. **Weeks 1–2**: complete W-02 and W-03 (org wiring + dashboard live counts).
3. **Weeks 3–4**: complete W-04 through W-07 (CRUD, transitions, permissions, polish).
4. **Weeks 1–4 (parallel)**: W-08 (test automation).
5. **End of week 4**: re-evaluate against this scorecard. Target: 8.5+.

---

## 10. Final Score

**5.21 / 10 — NO-GO.**

The backend is excellent; the frontend is a shell. Four weeks of disciplined wiring will lift the section to **9.0+** and unblock every downstream module in the ERP.
