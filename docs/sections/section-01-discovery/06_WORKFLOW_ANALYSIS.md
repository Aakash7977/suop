# 06 — Workflow Analysis: Login + Dashboard + Organization

**Scope**: State machines, transitions, events, and audit hooks that govern the section's entities.
**Frameworks**: `apps/backend/src/core/workflow/state-machine.ts` (generic FSM), module-specific lifecycle definitions.

---

## 1. Workflow Inventory

| Workflow | Subject | States | Owner module | Surfaced in UI? |
|---|---|---|---|---|
| `UserLifecycle` | User account | 5 | Auth | Partially (login/logout only) |
| `OrganizationLifecycle` | Company, Plant, Warehouse | 5 | Organization | No |
| Session lifecycle | User session | 3 | Auth | No |
| Refresh-token rotation | Refresh token | 2 | Auth | No (transparent) |
| Invitation lifecycle | Pending user | 3 | Auth | No |

---

## 2. UserLifecycle

```
                  invite
    ──────────────────────────────────▶  REGISTERED
                                              │
                                              │ accept-invitation
                                              ▼
                                          ACTIVE ◀────── unlock
                                              │ ▲
                                              │ │
                                  suspend     │ │ resume
                                    │         │ │
                                    ▼         │ │
                                SUSPENDED ────┘ │
                                              │ │
                                  lock (auto)  │ │
                                    │         │ │
                                    ▼         │ │
                                  LOCKED ─────┘ │
                                              │ │
                                  archive      │ │
                                    │         │ │
                                    ▼         │ │
                                ARCHIVED       │ │
                                              │ │
                                  (terminal)   │ │
```

### 2.1 Transitions

| From | To | Trigger | Guard | Audit | Event |
|---|---|---|---|---|---|
| (new) | REGISTERED | `inviteUser` | `AUTH_MANAGE_USERS` | Yes | `UserRegistered` |
| REGISTERED | ACTIVE | `acceptInvitation` | Valid token | Yes | — |
| ACTIVE | SUSPENDED | `suspendUser` | `AUTH_MANAGE_USERS` | Yes | — |
| SUSPENDED | ACTIVE | `resumeUser` | `AUTH_MANAGE_USERS` | Yes | — |
| ACTIVE | LOCKED | `lockUser` (auto after 5 failed logins) | `MAX_FAILED_LOGINS` exceeded | Yes | — |
| LOCKED | ACTIVE | `unlockUser` (manual or `LOCK_DURATION_MIN` elapsed) | `AUTH_MANAGE_USERS` or timer | Yes | — |
| ACTIVE / SUSPENDED / LOCKED | ARCHIVED | `archiveUser` | `AUTH_MANAGE_USERS` | Yes | — |

### 2.2 Constants

- `MAX_FAILED_LOGINS = 5`
- `LOCK_DURATION_MIN = 30`
- `PASSWORD_HISTORY_COUNT = 10`

### 2.3 Frontend gap

The Login screen surfaces only `ACTIVE → (login) → ACTIVE` and `ACTIVE → (logout) → ACTIVE`. The user is never told:

- that the account is in `REGISTERED` (must accept invitation);
- that the account is `SUSPENDED`;
- that the account is `LOCKED` (and when it will unlock);
- that the account is `ARCHIVED`.

The login error message is a single `loginError` string. To honour BR-1 (account lockout feedback), the Login screen must branch on the backend's error code.

---

## 3. OrganizationLifecycle

```
   create
   ──────▶  DRAFT
              │
              │ configure (fill required fields, attach plants)
              ▼
          CONFIGURED
              │
              │ activate
              ▼
           ACTIVE  ◀────── resume
              │ ▲
              │ │
              │ │ suspend
              ▼ │
          SUSPENDED
              │
              │ archive
              ▼
          ARCHIVED
              │
              │ (soft-deleted, restorable)
              ▼
          (deleted_at set)
```

### 3.1 Transitions

| From | To | Trigger | Permission | Audit | Event |
|---|---|---|---|---|---|
| (new) | DRAFT | `create` | `ORG_CREATE` | Yes | — |
| DRAFT | CONFIGURED | `transition` (action=`configure`) | `ORG_UPDATE` | Yes | — |
| CONFIGURED | ACTIVE | `transition` (action=`activate`) | `ORG_UPDATE` | Yes | `CompanyCreated` (companies) / `PlantActivated` (plants) |
| ACTIVE | SUSPENDED | `transition` (action=`suspend`) | `ORG_UPDATE` | Yes | — |
| SUSPENDED | ACTIVE | `transition` (action=`resume`) | `ORG_UPDATE` | Yes | — |
| ACTIVE / SUSPENDED | ARCHIVED | `transition` (action=`archive`) | `ORG_UPDATE` | Yes | — |
| Any live state | (soft-deleted) | `delete` | `ORG_DELETE` | Yes | — |
| (soft-deleted) | previous state | `restore` | `ORG_UPDATE` | Yes | — |
| (soft-deleted) | (purged) | `hardDelete` | `ORG_DELETE` | Yes | — |

### 3.2 Frontend gap

None of these transitions are surfaced. The user cannot:

- create a company in DRAFT;
- move it to CONFIGURED;
- activate it (emitting the `PlantActivated` event);
- suspend / resume / archive;
- soft-delete, restore, or hard-delete.

The 22 organisation endpoints include every transition action, but the UI offers only a static tree and a dead "Add Entity" button.

---

## 4. Session Lifecycle

```
   login
   ──────▶  ACTIVE
              │
              │ logout / revoke / TTL
              ▼
           REVOKED
              │
              │ purge (after retention)
              ▼
           (deleted)
```

- Sessions are stored in `user_sessions` with a TTL.
- A user can list active sessions via `GET /auth/sessions` and revoke any via `POST /auth/sessions/:id/revoke`.
- **Frontend gap**: no "Sign out other sessions" UI. The Header has a Sign Out button that revokes only the current session.

---

## 5. Refresh-Token Rotation

```
   issue (on login)
   ──────────────▶  CURRENT
                      │
                      │ refresh
                      ▼
                  ROTATED  (old becomes REVOKED, new becomes CURRENT)
                      │
                      │ logout / expiry
                      ▼
                  REVOKED
```

- The server stores a hash of the refresh token; the client stores the plaintext.
- Each `POST /auth/refresh` rotates the token: old hash → REVOKED, new hash → CURRENT.
- Reuse of a REVOKED token triggers immediate revocation of the entire family ( suspected theft ).
- **Frontend gap**: no automatic refresh on 401. A 401 just throws; the user is signed out.

---

## 6. Invitation Lifecycle

```
   inviteUser
   ──────────▶  PENDING
                  │
                  │ acceptInvitation
                  ▼
                ACCEPTED  (user becomes REGISTERED in UserLifecycle)
                  │
                  │ expiry (TTL)
                  ▼
                EXPIRED
```

- `POST /auth/invite` creates a user in `REGISTERED` and a pending invitation.
- `POST /auth/accept-invitation` consumes the token and moves the user to `ACTIVE`.
- **Frontend gap**: no invitation UI in this section (would live in User Management, not here).

---

## 7. Workflow Engine Mechanics

The generic FSM in `apps/backend/src/core/workflow/state-machine.ts`:

- Defines `states`, `transitions`, `guards`, and `sideEffects`.
- Throws `InvalidTransitionError` on illegal moves.
- Emits `beforeTransition` and `afterTransition` hooks.
- `afterTransition` is where audit logging and event publishing are wired.

Module-specific lifecycles (e.g., `OrganizationLifecycle`) compose the generic FSM with module-specific guard and effect lists.

### 7.1 Guard example (organisation activate)

```
guard('activate', (ctx) => {
  if (ctx.entity.status !== 'CONFIGURED') throw InvalidTransitionError;
  if (!ctx.entity.default_timezone) throw ValidationError('default_timezone required');
  if (!ctx.entity.default_currency) throw ValidationError('default_currency required');
  if (ctx.entity.type === 'COMPANY' && !ctx.entity.gstin) throw ValidationError('gstin required');
});
```

### 7.2 Side-effect example (organisation activate)

```
effect('afterTransition', async (ctx) => {
  await auditService.log({ action: 'company.transition', before, after, ... });
  await eventOutbox.publish('CompanyCreated', { id: ctx.entity.id, ... });
});
```

---

## 8. Audit Touchpoints per Workflow

| Workflow | Audit calls per cycle | Notes |
|---|---|---|
| UserLifecycle (full cycle) | 7 | One per transition |
| OrganizationLifecycle (DRAFT → ARCHIVED → restore → hardDelete) | 9 | Matches the 9 call sites observed |
| Session lifecycle | 2 | create + revoke |
| Refresh-token rotation | 1 per rotation | logout also audited |
| Invitation lifecycle | 2 | invite + accept |

All audit rows include `before`, `after`, `diff`, and `correlation_id`, enabling a future audit viewer to render a timeline.

---

## 9. Workflow-Related Frontend Requirements

To fully surface the workflows, the frontend needs:

1. **Transition buttons** on the company/plant/warehouse detail panel, gated by permission and current state.
2. **Status badges** on tree nodes (DRAFT, ACTIVE, SUSPENDED, ARCHIVED).
3. **Reason capture** for suspend/archive transitions (audit best practice).
4. **Confirmation dialogs** for destructive transitions (archive, delete, hardDelete).
5. **Toast notifications** on transition success/failure.
6. **Audit timeline viewer** on the detail panel, reading from `audit_logs` filtered by `entity_id`.
7. **Login error branching** on the Login screen for LOCKED / SUSPENDED / ARCHIVED states.

---

## 10. Workflow Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| WF-1 | Login screen cannot distinguish LOCKED from invalid password | High | Branch on backend error code |
| WF-2 | No UI to resume a SUSPENDED company | High | Add transition button |
| WF-3 | No UI to restore a soft-deleted company | High | Add "show deleted" toggle + restore button |
| WF-4 | No event subscription → Dashboard does not refresh on `CompanyCreated` | Medium | SSE or polling |
| WF-5 | Refresh-token rotation failure not retried | Medium | Add refresh on 401 with single retry |
| WF-6 | No "reason" field on suspend/archive | Medium | Add textarea in transition dialog |
| WF-7 | Hard-delete available without double confirmation | High | Add typed-confirm dialog |
| WF-8 | Workflow state cached client-side without version check | Medium | Use `version` for optimistic concurrency |

---

## 11. Workflow Test Scenarios

| Scenario | Steps | Expected |
|---|---|---|
| WFS-1 Happy path company | create → configure → activate | Status ACTIVE; `CompanyCreated` in outbox; 3 audit rows |
| WFS-2 Suspend/resume | activate → suspend → resume | Status ACTIVE; 2 audit rows; no event |
| WFS-3 Illegal transition | create → activate (skip configure) | 422 InvalidTransitionError |
| WFS-4 Soft delete + restore | activate → delete → restore | Status ACTIVE; deleted_at null after restore |
| WFS-5 Hard delete | delete → hardDelete | Row removed; audit row remains |
| WFS-6 Lockout | 5 failed logins | Account LOCKED; `locked_until` set; audit row |
| WFS-7 Auto-unlock | wait 30 min | Account ACTIVE; audit row |
| WFS-8 Refresh rotation | refresh → refresh again with old token | Second refresh fails; family revoked |

---

## 12. Conclusion

The backend workflow layer is mature: two named lifecycles, a generic FSM engine, comprehensive audit, and event emission. The frontend surfaces none of it. The Dashboard shows no status, the Organization module shows no transitions, and the Login screen cannot tell a locked user from a typo. Surfacing these workflows is the largest UX gap in the section and the most valuable next increment after the token-key fix.
