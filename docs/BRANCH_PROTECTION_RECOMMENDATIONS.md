# SUOP ERP — GitHub Branch Protection Recommendations

**Document Version**: 1.0
**Generated**: 2026-07-11
**Status**: ⚠️ RECOMMENDATIONS ONLY — NOT APPLIED
**Repository**: https://github.com/Aakash7977/suop

> **IMPORTANT**: Per Task 5 instructions, these are **recommendations only**. No changes have been made to GitHub settings. The repository owner must manually apply these settings via the GitHub web UI or API.

---

## How to Apply These Recommendations

1. Go to: https://github.com/Aakash7977/suop/settings/branches
2. Click **Add branch protection rule**
3. Apply the settings documented below for each branch

---

## Branch Protection Rule 1: `main` (Production)

**Branch name pattern**: `main`

### Required Settings

| Setting | Recommended Value | Rationale |
|---|---|---|
| **Require a pull request before merging** | ✅ Enabled | Forces code review before production |
|   - Required approvals | **2** | Two pairs of eyes on production code |
|   - Dismiss stale approvals on new push | ✅ Enabled | Prevents approving old code |
|   - Require review from Code Owners | ✅ Enabled | Enforces CODEOWNERS review |
| **Require status checks to pass** | ✅ Enabled | Blocks merge if CI fails |
|   - Require branches to be up to date | ✅ Enabled | Ensures tests run on latest code |
|   - Required status checks | See list below | All 7 CI stages must pass |
| **Require conversation resolution before merging** | ✅ Enabled | All PR comments must be resolved |
| **Require signed commits** | ✅ Enabled | Prevents commit tampering |
| **Require linear history** | ✅ Enabled | Clean, readable history (no merge commits) |
| **Do not allow bypassing the above settings** | ✅ Enabled | Even admins must follow rules |

### Required Status Checks (for `main`)

These must appear in the **"Require status checks to pass"** list:

| Check Name | Job in Workflow |
|---|---|
| `Install Dependencies` | `install` |
| `Lint` | `lint` |
| `TypeScript Type Check` | `typecheck` |
| `Prisma Validate` | `prisma-validate` |
| `Unit Tests` | `unit-tests` |
| `Integration Tests` | `integration-tests` |
| `Code Coverage` | `coverage` |
| `CI Summary` | `ci-summary` |

> **Note**: `Code Coverage` is currently set to **warning-only** in the workflow (it does not block the pipeline). If you want coverage to block merges, update the workflow to make coverage failures fatal, then add it to required checks. Current recommendation: **do NOT require coverage** until thresholds are met (see Task 2 report).

### Recommended Restrictiveness: HIGH

This is the **production branch**. Every protection should be enabled.

---

## Branch Protection Rule 2: `develop` (Staging)

**Branch name pattern**: `develop`

### Required Settings

| Setting | Recommended Value | Rationale |
|---|---|---|
| **Require a pull request before merging** | ✅ Enabled | Code review for integration |
|   - Required approvals | **1** | One approval sufficient for staging |
|   - Dismiss stale approvals on new push | ✅ Enabled | Standard hygiene |
|   - Require review from Code Owners | ✅ Enabled | For critical paths only |
| **Require status checks to pass** | ✅ Enabled | CI must pass |
|   - Require branches to be up to date | ✅ Enabled | Standard hygiene |
|   - Required status checks | Same 7 checks as main | All CI stages |
| **Require conversation resolution before merging** | ✅ Enabled | Standard hygiene |
| **Require signed commits** | ⚠️ Optional | Can be relaxed for staging |
| **Require linear history** | ✅ Enabled | Clean history |
| **Do not allow bypassing the above settings** | ❌ Disabled | Admins can bypass for urgent fixes |

### Recommended Restrictiveness: MEDIUM

This is the **integration branch**. Slightly less strict than production to allow faster iteration, but still requires CI to pass.

---

## Branch Protection Rule 3: Release Tags (`v*`)

**Branch name pattern**: `v*` (matches version tags like `v1.0.0`)

> **Note**: GitHub branch protection rules apply to branches, not tags. For tag protection, use **Tag Protection Rules** (available in GitHub Settings → Tags).

### Tag Protection Rule

| Setting | Recommended Value |
|---|---|
| **Pattern** | `v*` |
| **Allowed to create** | Administrators only |

This prevents non-admins from creating version tags directly. Version tags should only be created during the release process (see `DEVOPS_BASELINE.md` §3).

### Additional: Phase Tags (`phase-*`)

| Setting | Recommended Value |
|---|---|
| **Pattern** | `phase-*` |
| **Allowed to create** | Administrators only |

---

## CODEOWNERS File (Recommended)

Create a `CODEOWNERS` file at the repository root to enforce review requirements:

**File**: `/home/z/my-project/.github/CODEOWNERS`

```
# Default owner for entire repo
*                           @Aakash7977

# Critical paths require additional review
/.github/workflows/         @Aakash7977
/apps/backend/prisma/       @Aakash7977
/apps/backend/src/core/     @Aakash7977
/apps/backend/src/middleware/ @Aakash7977
/docs/                      @Aakash7977
/infrastructure/            @Aakash7977
```

> **Note**: Until additional team members are added, all paths default to `@Aakash7977`. Update this file as the team grows.

---

## Additional GitHub Settings Recommendations

### Actions Permissions
**Path**: Settings → Actions → General

| Setting | Recommended Value |
|---|---|
| **Actions permissions** | Allow all actions and reusable workflows |
| **Workflow permissions** | Read repository contents permission (default) |
| **Allow GitHub Actions to create and approve pull requests** | ❌ Disabled |

### Secrets and Variables
**Path**: Settings → Secrets and variables → Actions

| Secret | Purpose |
|---|---|
| `PAT_DEPLOY` | Token for deployment automation (if needed) |
| `CODECOV_TOKEN` | Code coverage upload (if using Codecov) |
| `SNYK_TOKEN` | Dependency vulnerability scanning (optional) |

### Webhooks (Optional)
**Path**: Settings → Webhooks

| Webhook | Purpose |
|---|---|
| Slack/Teams | CI/CD status notifications |
| Sentry | Error tracking on deploy |

---

## Verification Checklist

After applying the recommendations, verify:

- [ ] `main` branch protection rule created
- [ ] `develop` branch protection rule created
- [ ] Tag protection rule for `v*` created
- [ ] Tag protection rule for `phase-*` created
- [ ] All 7 CI status checks listed as required
- [ ] CODEOWNERS file created at `.github/CODEOWNERS`
- [ ] Test by creating a PR — should require 2 approvals + all CI checks
- [ ] Test by trying to push directly to `main` — should be rejected

---

## API Alternative (For Automation)

If you prefer to apply these settings via GitHub API (requires a token with `repo:admin` scope):

```bash
# Protect main branch
curl -X PUT \
  -H "Authorization: token <ADMIN_TOKEN>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Aakash7977/suop/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "Install Dependencies",
        "Lint",
        "TypeScript Type Check",
        "Prisma Validate",
        "Unit Tests",
        "Integration Tests",
        "CI Summary"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_approving_review_count": 2
    },
    "restrictions": null,
    "required_linear_history": true,
    "required_conversation_resolution": true
  }'

# Protect develop branch (less strict)
curl -X PUT \
  -H "Authorization: token <ADMIN_TOKEN>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Aakash7977/suop/branches/develop/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "Install Dependencies",
        "Lint",
        "TypeScript Type Check",
        "Prisma Validate",
        "Unit Tests",
        "Integration Tests",
        "CI Summary"
      ]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "required_linear_history": true,
    "required_conversation_resolution": true
  }'
```

> **⚠️ WARNING**: Do NOT run these API calls automatically. Run them manually only after verifying the workflow file is committed and the CI status checks are appearing in GitHub.

---

## Summary

| Branch/Tag | Protection Level | Approvals | CI Required | Admin Bypass |
|---|---|---|---|---|
| `main` | 🔴 HIGH | 2 | All 7 checks | ❌ No bypass |
| `develop` | 🟡 MEDIUM | 1 | All 7 checks | ✅ Admins can bypass |
| `v*` tags | 🟡 Tag protection | N/A | N/A | Admins only |
| `phase-*` tags | 🟡 Tag protection | N/A | N/A | Admins only |

**These recommendations have NOT been applied.** The repository owner must manually configure them via the GitHub UI or API using the instructions above.

---

*This document will be updated as the team grows and protection requirements evolve.*
