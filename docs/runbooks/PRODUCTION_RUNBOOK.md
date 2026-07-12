# SUOP ERP v1.0 — Production Runbook

**Version**: 1.0.0-rc1
**Last Updated**: 2026-07-12
**Audience**: DevOps, SRE, On-Call Engineers

---

## Table of Contents

1. [Deployment Guide](#1-deployment-guide)
2. [Upgrade Guide](#2-upgrade-guide)
3. [Rollback Guide](#3-rollback-guide)
4. [Disaster Recovery Guide](#4-disaster-recovery-guide)
5. [Backup Guide](#5-backup-guide)
6. [Restore Guide](#6-restore-guide)
7. [Monitoring Guide](#7-monitoring-guide)
8. [Security Guide](#8-security-guide)
9. [Performance Tuning Guide](#9-performance-tuning-guide)
10. [Incident Response Guide](#10-incident-response-guide)

---

## 1. Deployment Guide

### 1.1 Prerequisites

- Kubernetes 1.28+ (or Docker Swarm 24+)
- kubectl configured with cluster admin access
- Docker registry credentials
- TLS certificate (Let's Encrypt or custom CA)
- DNS records pointing to the load balancer

### 1.2 Kubernetes Deployment

```bash
# 1. Create namespace
kubectl apply -f infra/kubernetes/00-namespace.yaml

# 2. Create secrets (replace placeholder values)
kubectl apply -f infra/kubernetes/02-secrets.yaml
# OR use sealed-secrets / external-secrets for production

# 3. Apply configuration
kubectl apply -f infra/kubernetes/01-configmap.yaml

# 4. Deploy PostgreSQL
kubectl apply -f infra/kubernetes/10-postgres.yaml

# 5. Wait for PostgreSQL to be ready
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=postgres -n suop --timeout=300s

# 6. Deploy Redis
kubectl apply -f infra/kubernetes/11-redis.yaml

# 7. Wait for Redis to be ready
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=redis -n suop --timeout=120s

# 8. Deploy backend
kubectl apply -f infra/kubernetes/20-backend.yaml

# 9. Apply HPA and PDB
kubectl apply -f infra/kubernetes/40-hpa-pdb.yaml

# 10. Apply network policies
kubectl apply -f infra/kubernetes/50-network-policies.yaml

# 11. Apply resource quotas
kubectl apply -f infra/kubernetes/60-resource-quotas.yaml

# 12. Deploy ingress
kubectl apply -f infra/kubernetes/30-ingress.yaml

# 13. Verify deployment
kubectl get pods -n suop
kubectl get svc -n suop
kubectl get ingress -n suop
```

### 1.3 Helm Deployment

```bash
# Add custom chart repo (if hosted)
helm repo add suop https://charts.sudhamrit.com
helm repo update

# Deploy with Helm
helm install suop infra/helm/suop \
  --namespace suop \
  --create-namespace \
  --values infra/helm/suop/values.yaml \
  --set backend.image.tag=1.0.0-rc1
```

### 1.4 Kustomize Deployment

```bash
# Development overlay
kubectl apply -k infra/kustomize/overlays/dev

# Production overlay
kubectl apply -k infra/kustomize/overlays/prod
```

### 1.5 Docker Swarm Deployment

```bash
# Initialize Swarm (if not already)
docker swarm init

# Create secrets
echo "your_postgres_password" | docker secret create postgres_password -
echo "your_redis_password" | docker secret create redis_password -
echo "your_jwt_secret_at_least_32_chars" | docker secret create jwt_secret -

# Deploy the stack
docker stack deploy -c infra/docker-swarm/stack.yml suop

# Verify
docker stack services suop
docker service ls
```

### 1.6 Post-Deployment Verification

```bash
# 1. Check health endpoint
curl https://api.sudhamrit.com/health | jq .

# 2. Check readiness
curl https://api.sudhamrit.com/ready | jq .

# 3. Check version
curl https://api.sudhamrit.com/api/v1/_internal/version | jq .

# 4. Check OpenAPI docs
open https://api.sudhamrit.com/swagger

# 5. Run smoke tests
curl -X POST https://api.sudhamrit.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sudhamrit.com","password":"test"}' | jq .
```

---

## 2. Upgrade Guide

### 2.1 Pre-Upgrade Checklist

- [ ] Review the CHANGELOG.md for breaking changes
- [ ] Test the upgrade in staging environment
- [ ] Create a database backup: `./scripts/backup/db-backup.sh --encrypt --upload`
- [ ] Verify backup integrity: `./scripts/backup/db-restore.sh <backup> --verify`
- [ ] Notify users of planned downtime (if any)
- [ ] Ensure rollback plan is ready

### 2.2 Rolling Upgrade (Kubernetes)

```bash
# 1. Update the image tag
kubectl set image deployment/suop-backend \
  backend=ghcr.io/aakash7977/suop/backend:1.0.0-rc1 \
  -n suop

# 2. Watch the rollout
kubectl rollout status deployment/suop-backend -n suop

# 3. If using Helm:
helm upgrade suop infra/helm/suop \
  --namespace suop \
  --set backend.image.tag=1.0.0-rc1
```

### 2.3 Database Migration

```bash
# 1. Run migrations (the backend does this automatically on startup)
# Or run manually:
kubectl exec -it deploy/suop-backend -n suop -- \
  bunx prisma migrate deploy --schema=prisma/schema.prisma

# 2. Verify migration status
kubectl exec -it deploy/suop-backend -n suop -- \
  bunx prisma migrate status --schema=prisma/schema.prisma

# 3. If migration fails, DO NOT proceed — rollback the application
```

### 2.4 Zero-Downtime Upgrade (Blue/Green)

```bash
# 1. Deploy the new version as "green"
kubectl apply -f infra/kubernetes/20-backend-green.yaml

# 2. Wait for green to be healthy
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=suop-backend-green -n suop

# 3. Switch traffic to green
kubectl patch service suop-backend -n suop -p \
  '{"spec":{"selector":{"app.kubernetes.io/name":"suop-backend-green"}}}'

# 4. Verify green is serving traffic
curl https://api.sudhamrit.com/api/v1/_internal/version

# 5. If healthy, remove blue
kubectl delete -f infra/kubernetes/20-backend.yaml

# 6. Rename green to blue
kubectl label deployment suop-backend-green app.kubernetes.io/name=suop-backend -n suop
```

---

## 3. Rollback Guide

### 3.1 Application Rollback

```bash
# Kubernetes
kubectl rollout undo deployment/suop-backend -n suop
kubectl rollout status deployment/suop-backend -n suop

# Helm
helm rollback suop 0 -n suop
```

### 3.2 Database Rollback

```bash
# 1. Identify the migration to rollback
kubectl exec -it deploy/suop-backend -n suop -- \
  bunx prisma migrate status --schema=prisma/schema.prisma

# 2. If a .down.sql migration exists:
kubectl exec -it deploy/suop-backend -n suop -- \
  psql "$DATABASE_URL" -f prisma/migrations/0019_bi_analytics.down.sql

# 3. If no down-migration exists, restore from backup:
./scripts/backup/db-restore.sh /var/backups/suop/daily/suop_YYYYMMDD_*.dump --verify
```

### 3.3 Full Rollback (Application + Database)

```bash
# 1. Roll back application
kubectl rollout undo deployment/suop-backend -n suop

# 2. Restore database from pre-upgrade backup
./scripts/backup/db-restore.sh <pre-upgrade-backup> --verify

# 3. Verify health
curl https://api.sudhamrit.com/health
```

---

## 4. Disaster Recovery Guide

### 4.1 Disaster Recovery Plan

| Scenario | RTO | RPO | Strategy |
|---|---|---|---|
| Single pod failure | 30s | 0 | K8s auto-restart |
| Node failure | 2min | 0 | K8s reschedule to healthy node |
| Database failure | 15min | 5min | Failover to replica + WAL replay |
| Region failure | 1hour | 1hour | DNS failover to DR region |
| Data corruption | 1hour | 24hour | Restore from backup |

### 4.2 Database Disaster Recovery

```bash
# 1. Identify the latest backup
ls -lt /var/backups/suop/daily/ | head -5

# 2. Restore to a new database instance
./scripts/backup/db-restore.sh \
  /var/backups/suop/daily/suop_YYYYMMDD_HHMMSS_pg.dump \
  --target-url "postgresql://suop:password@new-postgres:5432/suop_prod" \
  --verify

# 3. Update the application to point to the new database
kubectl set env deployment/suop-backend \
  DATABASE_URL=postgresql://suop:password@new-postgres:5432/suop_prod \
  -n suop

# 4. Restart the application
kubectl rollout restart deployment/suop-backend -n suop
```

### 4.3 Point-In-Time Recovery

```bash
# 1. Identify the target time (e.g., 2026-07-12 14:30:00)
TARGET_TIME="2026-07-12 14:30:00"

# 2. Restore base backup
pg_restore --dbname="postgresql://suop:password@new-postgres:5432/suop_pitr" \
  /var/backups/suop/daily/suop_YYYYMMDD_pg.dump

# 3. Replay WAL archives up to target time
pg_waldump /var/lib/postgresql/wal/*.wal | head

# 4. Configure recovery target
echo "recovery_target_time = '${TARGET_TIME}'" >> /var/lib/postgresql/data/recovery.signal
echo "restore_command = 'cp /var/lib/postgresql/wal/%f %p'" >> /var/lib/postgresql/data/recovery.signal

# 5. Start PostgreSQL in recovery mode
pg_ctl start -D /var/lib/postgresql/data
```

---

## 5. Backup Guide

### 5.1 Automated Backups

Backups run automatically via cron job at 2:00 AM UTC daily.

```bash
# Manual backup
./scripts/backup/db-backup.sh --encrypt --upload --verify

# Scheduled backup (crontab)
0 2 * * * /opt/suop/scripts/backup/db-backup.sh --encrypt --upload
```

### 5.2 Backup Retention Policy

| Type | Frequency | Retention | Storage |
|---|---|---|---|
| Daily | Every day at 2 AM | 7 days | Local + S3 |
| Weekly | Sunday at 2 AM | 4 weeks | S3 (Standard) |
| Monthly | 1st of month | 12 months | S3 (Glacier) |
| Yearly | Jan 1 | 7 years | S3 (Glacier Deep Archive) |

### 5.3 Backup Verification

Every backup is automatically verified by restoring to a temp database and counting tables. The verification results are logged.

---

## 6. Restore Guide

See [Disaster Recovery Guide](#4-disaster-recovery-guide) above.

### 6.1 Quick Restore

```bash
# Find the latest backup
LATEST_BACKUP=$(ls -t /var/backups/suop/daily/*_pg.dump | head -1)

# Restore with verification
./scripts/backup/db-restore.sh "$LATEST_BACKUP" --verify
```

---

## 7. Monitoring Guide

### 7.1 Dashboards

| Dashboard | URL | Purpose |
|---|---|---|
| Grafana | http://grafana.sudhamrit.com | All metrics dashboards |
| Prometheus | http://prometheus.sudhamrit.com | Raw metrics + alerts |
| Jaeger | http://jaeger.sudhamrit.com | Distributed tracing |
| Loki | http://loki.sudhamrit.com | Log aggregation |

### 7.2 Key Metrics to Monitor

- **Availability**: `up{job="suop-backend"}`
- **Error Rate**: `rate(http_requests_total{status=~"5.."}[5m])`
- **Latency p95**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **CPU**: `rate(process_cpu_seconds_total[1m])`
- **Memory**: `process_resident_memory_bytes`
- **DB Connections**: `pg_stat_activity_count`
- **Redis Memory**: `redis_memory_used_bytes`

### 7.3 Alert Rules

Alerts are defined in `infra/observability/prometheus/alerts.yml`:

- **Critical**: Backend down, DB down, Redis down
- **Warning**: High error rate (>5%), high latency (p95 > 1s), high memory (>85%)

---

## 8. Security Guide

### 8.1 Security Dashboard

Access the security dashboard at:
```
GET /api/v1/_internal/security
```

### 8.2 Security Checklist

- [ ] All secrets stored in Kubernetes Secrets (not ConfigMaps)
- [ ] TLS certificates valid and not expiring within 30 days
- [ ] Rate limiting enabled (check `/api/v1/_internal/security`)
- [ ] No failed login spikes (check security dashboard)
- [ ] Audit log hash chain intact (run periodic verification)
- [ ] OWASP compliance verified (see docs/OWASP_COMPLIANCE_REPORT.md)

### 8.3 Incident Response

See [Incident Response Guide](#10-incident-response-guide) below.

---

## 9. Performance Tuning Guide

### 9.1 Database Tuning

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check index usage
SELECT relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check table bloat
SELECT relname, n_live_tup, n_dead_tup,
       round(n_dead_tup::numeric / n_live_tup * 100, 2) AS bloat_pct
FROM pg_stat_user_tables
WHERE n_live_tup > 1000
ORDER BY bloat_pct DESC;
```

### 9.2 Redis Tuning

```bash
# Check Redis memory usage
redis-cli INFO memory

# Check slow commands
redis-cli SLOWLOG GET 10

# Check key count
redis-cli DBSIZE
```

### 9.3 Application Tuning

- **Connection Pool**: Set `DATABASE_POOL_SIZE` based on `(max_connections / replicas) - 5`
- **Cache TTL**: Adjust `CACHE_TTL_*` env vars based on data change frequency
- **Worker Threads**: Set `JOB_MAX_CONCURRENT` based on CPU cores
- **Rate Limits**: Adjust `DEFAULT_RATE_LIMIT_RULES` based on traffic patterns

---

## 10. Incident Response Guide

### 10.1 Incident Severity Levels

| Level | Description | Response Time | Escalation |
|---|---|---|---|
| SEV-1 | Production down | 5 min | Page on-call + CTO |
| SEV-2 | Major feature broken | 15 min | Page on-call |
| SEV-3 | Minor feature broken | 1 hour | Slack on-call channel |
| SEV-4 | Cosmetic issue | 1 business day | Jira ticket |

### 10.2 SEV-1 Response Procedure

1. **Acknowledge** the alert (5 min)
2. **Assess** the scope (which endpoints, how many users affected)
3. **Communicate** to stakeholders (Slack #incidents, status page)
4. **Mitigate**: Roll back if recent deployment, scale up if load-related
5. **Resolve**: Apply fix, verify health
6. **Post-mortem**: Within 48 hours, blameless retrospective

### 10.3 Common Incident Playbooks

#### Backend Down (All Pods Crash)

```bash
# 1. Check pod status
kubectl get pods -n suop -l app.kubernetes.io/name=suop-backend

# 2. Check logs
kubectl logs -n suop -l app.kubernetes.io/name=suop-backend --tail=100

# 3. Check events
kubectl get events -n suop --sort-by='.lastTimestamp' | tail -20

# 4. If crash loop, check env vars
kubectl describe pod -n suop -l app.kubernetes.io/name=suop-backend | grep -A 20 "Environment"

# 5. Roll back if needed
kubectl rollout undo deployment/suop-backend -n suop
```

#### Database Connection Exhaustion

```bash
# 1. Check active connections
kubectl exec -it postgres-0 -n suop -- psql -U suop -d suop_prod -c \
  "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"

# 2. Kill long-running queries
kubectl exec -it postgres-0 -n suop -- psql -U suop -d suop_prod -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='active' AND query_start < now() - interval '5 minutes';"

# 3. Increase connection pool (if needed)
kubectl set env deployment/suop-backend DATABASE_POOL_SIZE=30 -n suop
```

#### Redis Memory Full

```bash
# 1. Check Redis memory
kubectl exec -it redis-0 -n suop -- redis-cli -a "$REDIS_PASSWORD" INFO memory

# 2. Check key count by type
kubectl exec -it redis-0 -n suop -- redis-cli -a "$REDIS_PASSWORD" DBSIZE

# 3. Flush cache (if safe — only non-critical keys)
kubectl exec -it redis-0 -n suop -- redis-cli -a "$REDIS_PASSWORD" FLUSHDB

# 4. Restart Redis (if needed — AOF will restore)
kubectl delete pod -l app.kubernetes.io/name=redis -n suop
```

### 10.4 Communication Templates

#### Initial Incident Report

```
🚨 [SEV-1] SUOP ERP Production Issue

Impact: <description of what's broken>
Started: <timestamp>
Affected: <users/regions/features>
Status: Investigating
On-call: <engineer name>

More info in #incidents channel.
```

#### Resolution Report

```
✅ [RESOLVED] SUOP ERP Production Issue

Duration: <X minutes>
Impact: <description>
Root Cause: <description>
Resolution: <what was done>
Follow-up: <post-mortem link, preventive measures>

Thank you for your patience.
```

---

## Appendix A: Useful Commands

```bash
# Quick health check
curl -s https://api.sudhamrit.com/health | jq .data.status

# Check pod logs (last 100 lines)
kubectl logs -n suop -l app.kubernetes.io/name=suop-backend --tail=100

# Execute shell in backend pod
kubectl exec -it deploy/suop-backend -n suop -- sh

# Port-forward to local
kubectl port-forward -n suop svc/suop-backend 3030:3030

# Get resource usage
kubectl top pods -n suop
kubectl top nodes

# Describe a failing pod
kubectl describe pod <pod-name> -n suop
```

## Appendix B: Environment Variables Reference

See `.env.example` for the complete list of environment variables.
