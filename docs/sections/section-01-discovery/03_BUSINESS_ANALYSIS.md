# 03 — Business Analysis: Login + Dashboard + Organization

**Perspective**: Business capability, user journey, and value-stream analysis of the section.
**Audience**: Product owner, business analyst, programme manager.

---

## 1. Business Capability Mapping

The section delivers three capabilities required for any ERP rollout:

| Capability | Module | Business question answered | Maturity |
|---|---|---|---|
| Identity & Access | Login screen | "Who are you, and are you allowed in?" | High |
| Operational overview | Dashboard | "What is the state of the ERP rollout?" | Medium (visual only) |
| Enterprise structure | Organization | "How is our company structured, and who owns what?" | Low (visual only) |

Each capability is mapped below to its business outcomes, actors, and success criteria.

---

## 2. Actor Personas

### 2.1 Enterprise Admin (Priya)
- **Goals**: configure the enterprise tree, onboard companies and plants, audit who did what.
- **Permissions expected**: `ORG_CREATE`, `ORG_UPDATE`, `ORG_DELETE`, `AUTH_MANAGE_USERS`.
- **Today's experience in section**: sees a hardcoded tree and four hardcoded stat cards; "Add Entity" button is inert; cannot create or transition anything from this section.

### 2.2 Plant Manager (Rahul)
- **Goals**: see his plant in the tree, navigate to inventory/production dashboards.
- **Permissions expected**: `ORG_READ`, plus module-specific permissions.
- **Today's experience**: can expand the tree but cannot filter to "my plant" or see plant-level KPIs in this section.

### 2.3 Auditor (Meena)
- **Goals**: review login history, audit trail of organisation changes, active sessions.
- **Permissions expected**: `ORG_READ` plus a read-only audit permission.
- **Today's experience**: the section surfaces no audit trail viewer; she must call the backend directly.

### 2.4 Operator / Data Entry (Suresh)
- **Goals**: log in quickly and reach his daily screen (Goods Receipt, Quality, etc.).
- **Permissions expected**: module-specific only; no organisation permissions.
- **Today's experience**: login works; the dashboard is the landing page, but it does not surface his pending tasks.

---

## 3. User Journeys

### 3.1 First-time login (target journey)

1. User receives an invitation email (`POST /auth/invite`).
2. User clicks the invitation link → `/auth/accept-invitation`.
3. User lands on the Login screen with a one-time password prompt.
4. User signs in → `POST /auth/login` → JWT issued → Dashboard loads.
5. Dashboard greets the user by name and shows counts from real data.
6. User clicks "Organization" in the sidebar → sees the real enterprise tree.
7. User selects his plant → a detail panel shows plant metadata and links to its warehouses.

**Current reality**: steps 5–7 are broken. Dashboard counts are hardcoded; the org tree is hardcoded; selecting a node sets `selectedNode` state but no detail panel renders.

### 3.2 Daily operator journey

1. Suresh opens the app → already has a valid refresh token → `POST /auth/refresh` → new access token.
2. `GET /auth/me` confirms identity and roles.
3. Suresh clicks his module card on the dashboard (e.g., Goods Receipt).
4. He never visits the Organization module.

**Current reality**: steps 1–2 work; step 3 works (cards call `setActiveModule`); the Organization module is irrelevant to his day, which is acceptable.

### 3.3 Admin onboards a new plant (target journey)

1. Priya signs in and opens the Organization module.
2. The tree loads from `GET /organization/hierarchy`.
3. Priya selects the parent company → clicks "Add Entity" → a form opens.
4. She fills plant code, name, address, timezone, currency → `POST /organization/plants`.
5. Backend creates the plant in `DRAFT`, writes to `audit_logs`, emits `PlantActivated` on transition.
6. Priya transitions `DRAFT → CONFIGURED → ACTIVE` via the workflow-transition UI.
7. The tree re-renders with the new plant.

**Current reality**: only step 1 works. Steps 2–7 are not implemented in the frontend.

---

## 4. Value-Stream View

```
┌─────────────┐   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐
│  Identity   │──▶│  Onboarding │──▶│   Org setup  │──▶│  Module usage  │
│  (Login)    │   │  (Invite)   │   │  (Tree+CRUD) │   │  (Goods Recpt, │
│             │   │             │   │              │   │   Quality, …)  │
└─────────────┘   └─────────────┘   └──────────────┘   └────────────────┘
   ✅ Works         ⚠️ No UI          ❌ No UI            ✅ Works (other
                                                                sections)
```

The section owns the first three boxes. Today the value stream breaks at "Org setup" — the user can log in but cannot configure the enterprise from the UI. This forces admins to call the API directly or use a seed script, which is unacceptable for a production rollout.

---

## 5. Business Rules Encoded in Backend

The backend already enforces business rules that the frontend must surface:

| # | Rule | Backend enforcement | Frontend surfacing |
|---|---|---|---|
| BR-1 | Account locks after 5 failed logins | `MAX_FAILED_LOGINS = 5` in authService | Login screen shows generic error — must show "Account locked, try again in 30 minutes" |
| BR-2 | Password cannot be reused (last 10) | `PASSWORD_HISTORY_COUNT = 10` in changePassword | No change-password UI in this section |
| BR-3 | Company transitions: `DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED` | OrganizationLifecycle state machine | No transition UI |
| BR-4 | Plant activation emits `PlantActivated` event | event_outbox + dispatcher | No event indicator in UI |
| BR-5 | Every org mutation is audited | 9 `auditService.log` calls | No audit-trail viewer |
| BR-6 | Soft delete on companies, plants, warehouses | `deleted_at` column + repository filter | No "show deleted" toggle, no restore UI |
| BR-7 | Hard delete is gated behind `ORG_DELETE` and only after soft delete | `companyService.hardDelete` | No hard-delete UI |
| BR-8 | Tenant isolation: every query scoped by `tenant_id` | Prisma extension + raw SQL `WHERE tenant_id = $1` | Implicit; no cross-tenant UI risk |
| BR-9 | GSTIN/PAN/CIN format validation | Server-side regex | No client-side preview; user gets 422 after submit |
| BR-10 | Refresh-token rotation | `authService.refresh` rotates the stored hash | No UI; transparent |

---

## 6. KPIs This Section Should Expose

The Dashboard currently shows four hardcoded counters (Products=12, Roles=15, Branches=8, Compliance=6). The business should agree on the real KPI set. Recommended baseline:

| KPI | Source endpoint | Aggregation |
|---|---|---|
| Active users (24h) | `GET /auth/sessions` + `login_history` | count distinct `user_id` where `last_seen > now-24h` |
| Pending invitations | `GET /users` with `status=REGISTERED` | count |
| Companies configured | `GET /organization/companies?status=ACTIVE` | count |
| Plants active | `GET /organization/plants?status=ACTIVE` | count |
| Warehouses active | `GET /organization/warehouses?status=ACTIVE` | count |
| Audit events today | `GET /audit-logs?from=today` | count |
| Failed logins (1h) | `GET /auth/sessions` filter | count |

The current four counters are not derivable from any single endpoint and were chosen for visual balance rather than business signal.

---

## 7. Compliance and Regulatory Hooks

For an India-based FMCG ERP (the Sudhastar Foods Ltd sample implies this), the following compliance angles are visible in the schema:

- **GSTIN/PAN/CIN** columns on `companies` — required for GST filings.
- **Financial years** table — required for FY-locked accounting.
- **Tax configs** table — required for tax-rate versioning.
- **Working calendars** and **reference timezones** — required for shift and attendance compliance.

None of these are surfaced in the section's UI. Onboarding a real company will require the admin to enter GSTIN/PAN/CIN; today there is no form to do so.

---

## 8. Business Risk if Shipped As-Is

1. **Admin cannot self-serve**: every company/plant change requires a backend engineer to run SQL. Operational cost will explode at customer onboarding.
2. **Dashboard lies**: the four counters are fixed numbers. Users will lose trust in the entire UI once they notice.
3. **No audit visibility**: compliance audits will stall because the audit trail is not visible to the compliance officer persona.
4. **No lockout feedback**: users locked out by BR-1 see a generic error and will raise tickets instead of waiting 30 minutes.
5. **No tenant confirmation**: a user invited to the wrong tenant has no UI signal of which tenant he is in.

---

## 9. Recommended Business Outcomes for the Next Sprint

| Outcome | Success metric | Owner |
|---|---|---|
| Admin can create a company from the UI | Time-to-first-company < 5 min | Product |
| Dashboard reflects real counts | Counters update within 60s of a backend change | Engineering |
| Auditor can export audit trail | CSV/PDF export from a date range | Engineering |
| Locked users see a clear message | Lockout-related support tickets drop > 50% | Support |
| Plant manager can filter the tree to his plant | Tree renders < 1s with filter applied | Engineering |

---

## 10. Conclusion

From a business standpoint the section is **a login facade plus a marketing-grade dashboard and an inert organisation viewer**. The backend is ready to support the full admin journey, but the frontend has not been wired. The single most valuable next increment is connecting `OrganizationModule` to `orgClient.hierarchyApi.getTree` and `orgClient.companyApi.list`, plus surfacing the four real KPIs on the Dashboard. That single sprint unlocks the admin self-service value stream.
