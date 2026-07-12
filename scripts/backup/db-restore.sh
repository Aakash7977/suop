#!/usr/bin/env bash
# SUOP ERP v1.0 — Database Restore
# RC1 Fix Pack 5 §F: Restore from backup with verification
#
# Usage:
#   ./scripts/backup/db-restore.sh <backup_file> [--target-url <url>] [--verify]
set -euo pipefail

BACKUP_FILE="${1:?Usage: db-restore.sh <backup_file> [--target-url <url>] [--verify]}"
TARGET_URL="${DATABASE_URL:-}"
VERIFY=false

shift
for arg in "$@"; do
  case $arg in
    --target-url) shift; TARGET_URL="$1" ;;
    --verify) VERIFY=true ;;
  esac
done

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  SUOP ERP — Database Restore                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "Backup file: ${BACKUP_FILE}"
echo "Target URL:  ${TARGET_URL}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "✗ Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# ─── Decrypt if needed ──────────────────────────────────────────────────────
TEMP_FILE=""
if [[ "${BACKUP_FILE}" == *.gpg ]]; then
  echo "▶ Decrypting backup..."
  TEMP_FILE="${BACKUP_FILE%.gpg}.decrypted"
  gpg --batch --yes --passphrase "${BACKUP_ENCRYPTION_KEY}" \
    --output "${TEMP_FILE}" --decrypt "${BACKUP_FILE}"
  BACKUP_FILE="${TEMP_FILE}"
  echo "✓ Decrypted"
fi

# ─── Pre-restore verification ───────────────────────────────────────────────
if [ "${VERIFY}" = "true" ]; then
  echo "▶ Pre-restore verification (restoring to temp DB)..."
  TEMP_DB="suop_restore_verify_$(date +%s)"
  VERIFY_URL=$(echo "${TARGET_URL}" | sed "s|/[^/]*$|/${TEMP_DB}|")
  createdb "${VERIFY_URL}"

  pg_restore --dbname="${VERIFY_URL}" --no-owner --no-privileges "${BACKUP_FILE}"

  TABLE_COUNT=$(psql "${VERIFY_URL}" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
  echo "✓ Verification: ${TABLE_COUNT} tables present"

  dropdb "${VERIFY_URL}"
  echo "✓ Temp DB cleaned up"
fi

# ─── Restore ────────────────────────────────────────────────────────────────
echo "▶ Restoring to target database..."
pg_restore --dbname="${TARGET_URL}" --no-owner --no-privileges --clean --if-exists "${BACKUP_FILE}"
echo "✓ Restore complete"

# ─── Post-restore health check ──────────────────────────────────────────────
echo "▶ Running health check..."
TABLE_COUNT=$(psql "${TARGET_URL}" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo "✓ Health check: ${TABLE_COUNT} tables in restored database"

# Cleanup
if [ -n "${TEMP_FILE}" ] && [ -f "${TEMP_FILE}" ]; then
  rm "${TEMP_FILE}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Restore Complete                                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
