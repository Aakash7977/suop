#!/usr/bin/env bash
# Fix the broken injection of `enforceNotBreakGlass('transition')` that landed
# INSIDE a multi-line Promise<T> return type annotation.
#
# Before:
#   async transition(...): Promise<{
#     // Phase 1: Security enforcement
#     enforceNotBreakGlass('transition')
#  status: string; version: number }> {
#     const { ... } = getContext()
#
# After:
#   async transition(...): Promise<{
#     status: string; version: number }> {
#     // Phase 1: Security enforcement
#     enforceNotBreakGlass('transition')
#     const { ... } = getContext()
#
set -euo pipefail
cd /home/z/my-project

files=(
  apps/backend/src/modules/recruitment-onboarding/service/index.ts
  apps/backend/src/modules/crm-foundation/service/index.ts
  apps/backend/src/modules/leave-management/service/index.ts
  apps/backend/src/modules/employee-master/service/index.ts
  apps/backend/src/modules/executive-dashboards/service/index.ts
  apps/backend/src/modules/bi-foundation/service/index.ts
  apps/backend/src/modules/customer-service/service/index.ts
  apps/backend/src/modules/gst-taxation/service/index.ts
  apps/backend/src/modules/lead-opportunity/service/index.ts
  apps/backend/src/modules/product-costing/service/index.ts
  apps/backend/src/modules/alerts-kpi-engine/service/index.ts
  apps/backend/src/modules/payroll-processing/service/index.ts
  apps/backend/src/modules/accounts-receivable/service/index.ts
  apps/backend/src/modules/reporting-platform/service/index.ts
  apps/backend/src/modules/attendance-shift/service/index.ts
  apps/backend/src/modules/after-sales-service/service/index.ts
  apps/backend/src/modules/customer-portal/service/index.ts
  apps/backend/src/modules/general-ledger/service/index.ts
  apps/backend/src/modules/accounts-payable/service/index.ts
  apps/backend/src/modules/ai-prediction/service/index.ts
  apps/backend/src/modules/performance-management/service/index.ts
  apps/backend/src/modules/complaint-management/service/index.ts
)

for f in "${files[@]}"; do
  python3 - "$f" <<'PY'
import re, sys
path = sys.argv[1]
with open(path, 'r') as fh: src = fh.read()
# Pattern: Promise<{\n  // Phase 1: Security enforcement\n  enforceNotBreakGlass('transition')\n<TYPE_BODY>}> {
pat = re.compile(
    r"Promise<\{\n"
    r"(\s+)// Phase 1: Security enforcement\n"
    r"\s+enforceNotBreakGlass\('transition'\)\n"
    r"(\s*)([^\n]*\}> \{)\n"
)
def repl(m):
    indent = m.group(1)
    body_indent = m.group(2)
    rest = m.group(3)
    return (
        "Promise<{\n"
        f"{body_indent}{rest}\n"
        f"{indent}// Phase 1: Security enforcement\n"
        f"{indent}enforceNotBreakGlass('transition')\n"
    )
new = pat.sub(repl, src)
if new != src:
    with open(path, 'w') as fh: fh.write(new)
    print(f"FIXED: {path}")
else:
    print(f"NOCHANGE: {path}")
PY
done
