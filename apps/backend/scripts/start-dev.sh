#!/bin/bash
# SUOP Backend — Development Start Script
# ─────────────────────────────────────────────────────────────────────────────
# Purpose:
#   Start the backend dev server with the correct DATABASE_URL.
#
# Why this script exists:
#   The container's /start.sh exports DATABASE_URL=file:/home/z/my-project/db/custom.db
#   (the PGlite path used by the root Next.js app) into the shell environment.
#   This persists into child processes and breaks Prisma validation for the
#   backend (which requires postgresql:// protocol).
#
#   This script unsets the inherited DATABASE_URL and explicitly sources
#   apps/backend/.env so the backend always gets the correct value.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")/.."

# Step 1: Unset any inherited DATABASE_URL from the container environment.
# This is critical — Bun/prisma do NOT override already-set env vars from .env files.
unset DATABASE_URL

# Step 2: Source backend .env explicitly (development defaults)
set -a
source .env
set +a

# Step 3: Verify the URL is correct (fail fast if misconfigured)
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
  echo "FATAL: DATABASE_URL must start with postgresql:// — got: $DATABASE_URL" >&2
  exit 1
fi

# Step 4: Start the dev server
exec bun run src/main.ts
